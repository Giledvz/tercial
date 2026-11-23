/*
 * tinta.js — escribir con el lápiz encima de la proyección.
 *
 * Al proyectar, el botón «Escribir» de los controles (abajo a la derecha) prende la tinta: el
 * Apple Pencil, o el mouse, escribe encima de la pantalla. El dedo sigue haciendo lo de
 * siempre: oprimir botones y pasar pantallas con ← →. La palma no raya, porque sólo escribe el
 * lápiz. El trazo engorda con la presión.
 * Con la tinta prendida aparecen sus herramientas:
 *   - dos colores, el del texto y el acento de la página;
 *   - el «Borrador», que quita un trazo completo al tocarlo;
 *   - «Borrar todo», que pide un segundo toque para no borrar por accidente.
 * Cada pantalla guarda su tinta: al regresar a ella, ahí sigue. La tinta se mide en unidades de
 * la tele (--u), desde la esquina de arriba a la izquierda del contenido, así que se queda sobre
 * lo que se escribió aunque la ventana cambie de tamaño, la pantalla se ajuste o se desplace.
 * Se guarda en la pestaña unas horas: si Safari recarga la página a media clase, la tinta sigue.
 *
 * leccion.js lo carga al entrar a la proyección. Este archivo no toca leccion.js: sigue la
 * pantalla actual por la clase «es-proyectada» y pone sus botones en los controles.
 */
(function () {
  'use strict';

  if (window.__tercialTinta) return;
  window.__tercialTinta = true;

  var raiz = document.documentElement;
  var diapositivas = Array.prototype.slice.call(document.querySelectorAll('[data-diapositiva]'));
  if (!diapositivas.length) return;

  // Su hoja de estilos vive junto a las demás: …/css/tinta.css, con la misma versión.
  var propio = document.currentScript && document.currentScript.src;
  if (propio && /\/js\/tinta\.js/.test(propio)) {
    var hoja = document.createElement('link');
    hoja.rel = 'stylesheet';
    hoja.href = propio.replace(/\/js\/tinta\.js/, '/css/tinta.css');
    document.head.appendChild(hoja);
  }

  var GROSOR = 0.34;                 // en u, con la presión de en medio
  var BORRADOR = 1.1;                // radio del borrador, en u
  var VIGENCIA = 6 * 60 * 60 * 1000; // lo guardado vale seis horas: la siguiente clase empieza limpia
  var CLAVE = 'tercial:tinta:' + location.pathname;

  var tinta = {};                    // pantalla (índice) → trazos { c: 'texto' | 'acento', p: [x, y, grosor, …] }
  var escribiendo = false, color = 'texto', borrador = false;
  var lienzo = null, ctx = null, barra = null;
  var actual = -1, marco = null;
  var trazo = null, puntero = null, borrando = null, presion = 0.5, ultimo = -1e9;
  var pregunta = null;

  // ---------- Dónde está el contenido ----------

  // Las piezas de la pantalla, como las cuenta leccion.js: sus hijos y los de cada herramienta abierta.
  function piezas(d) {
    var lista = [];
    Array.prototype.forEach.call(d.children, function (h) {
      if (h.hasAttribute('data-abre')) lista = lista.concat(piezas(h));
      else lista.push(h);
    });
    return lista;
  }

  // El marco de la tinta: la esquina del contenido (el borde izquierdo de la pantalla, sin su
  // margen, y lo más alto de sus piezas) y la unidad, que es la u de la tele por el zoom con que
  // leccion.js acomodó las piezas. Si el contenido crece, se encoge o se desplaza, la tinta va con él.
  function mide() {
    var d = diapositivas[actual];
    if (!d || !raiz.hasAttribute('data-proyeccion')) return null;
    var lista = piezas(d), arriba = Infinity, zoom = 1;
    lista.forEach(function (n) {
      var b = n.getBoundingClientRect();
      if (!b.height) return;
      if (b.top < arriba) arriba = b.top;
      if (zoom === 1 && n.style.zoom) zoom = parseFloat(n.style.zoom) || 1;
    });
    var caja = d.getBoundingClientRect(), cs = getComputedStyle(d);
    var u = parseFloat(raiz.style.getPropertyValue('--u')) || parseFloat(cs.getPropertyValue('--u')) || 10;
    if (!isFinite(arriba)) arriba = caja.top + parseFloat(cs.paddingTop);
    return { x: caja.left + parseFloat(cs.paddingLeft), y: arriba, k: u * zoom };
  }

  // ---------- El lienzo ----------

  function prepara() {
    if (lienzo) return;
    lienzo = document.createElement('canvas');
    lienzo.className = 'tinta-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lienzo);
    ctx = lienzo.getContext('2d');
  }

  function dimensiona() {
    var r = window.devicePixelRatio || 1, w = window.innerWidth, h = window.innerHeight;
    var ancho = Math.round(w * r), alto = Math.round(h * r);
    if (lienzo.width !== ancho) lienzo.width = ancho;
    if (lienzo.height !== alto) lienzo.height = alto;
    ctx.setTransform(ancho / w, 0, 0, alto / h, 0, 0);
    ctx.clearRect(0, 0, w, h);
  }

  // Los colores salen de la página (cambian con el tema y con el nivel): se piden al dibujar.
  function tono(c) {
    var d = diapositivas[actual] || raiz, cs = getComputedStyle(d);
    var v = cs.getPropertyValue(c === 'acento' ? '--color-accent' : '--color-text-primary').trim();
    return v || (c === 'acento' ? '#c2410c' : '#1f1a16');
  }
  function estilo(c) {
    ctx.strokeStyle = ctx.fillStyle = tono(c);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function X(p, i) { return marco.x + p[3 * i] * marco.k; }
  function Y(p, i) { return marco.y + p[3 * i + 1] * marco.k; }
  function G(p, i) { return Math.max(0.75, p[3 * i + 2] * marco.k); }

  // El trazo se suaviza con curvas que pasan por la mitad entre dos puntos. El tramo i va del punto
  // medio anterior al siguiente, con el punto i de control y su propio grosor; el primero sale del
  // primer punto y el último llega al último. Así se puede dibujar mientras se escribe, tramo a
  // tramo, y queda igual que al dibujarlo entero.
  function tramo(p, i, n) {
    ctx.beginPath();
    ctx.lineWidth = G(p, i);
    if (i === 0) {
      ctx.moveTo(X(p, 0), Y(p, 0));
      ctx.lineTo((X(p, 0) + X(p, 1)) / 2, (Y(p, 0) + Y(p, 1)) / 2);
    } else if (i === n - 1) {
      ctx.moveTo((X(p, i - 1) + X(p, i)) / 2, (Y(p, i - 1) + Y(p, i)) / 2);
      ctx.lineTo(X(p, i), Y(p, i));
    } else {
      ctx.moveTo((X(p, i - 1) + X(p, i)) / 2, (Y(p, i - 1) + Y(p, i)) / 2);
      ctx.quadraticCurveTo(X(p, i), Y(p, i), (X(p, i) + X(p, i + 1)) / 2, (Y(p, i) + Y(p, i + 1)) / 2);
    }
    ctx.stroke();
  }
  function punto(p) {
    ctx.beginPath();
    ctx.arc(X(p, 0), Y(p, 0), G(p, 0) / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
  function dibuja(t) {
    var p = t.p, n = p.length / 3;
    if (!n) return;
    estilo(t.c);
    if (n === 1) { punto(p); return; }
    for (var i = 0; i < n; i++) tramo(p, i, n);
  }

  function pinta() {
    if (!lienzo) return;
    dimensiona();
    marco = mide();
    if (!marco) return;
    (tinta[actual] || []).forEach(dibuja);
    if (trazo) dibuja(trazo);
  }

  // ---------- Escribir ----------

  function presionDe(e) { return e.pressure > 0 ? e.pressure : 0.5; }
  function redondea(v) { return Math.round(v * 100) / 100; }

  function eventos(e) {
    var lista = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    return lista && lista.length ? lista : [e];
  }

  function agrega(e) {
    var p = trazo.p, n = p.length / 3;
    var x = (e.clientX - marco.x) / marco.k, y = (e.clientY - marco.y) / marco.k;
    if (n) {
      var dx = (x - p[3 * n - 3]) * marco.k, dy = (y - p[3 * n - 2]) * marco.k;
      if (dx * dx + dy * dy < 0.8) return;   // menos de un pixel: no aporta
      presion = presion * 0.6 + presionDe(e) * 0.4;
    } else {
      presion = presionDe(e);
    }
    p.push(redondea(x), redondea(y), redondea(GROSOR * (0.4 + 1.2 * Math.min(1, presion))));
    n = p.length / 3;
    estilo(trazo.c);
    if (n === 1) punto(p);
    else tramo(p, n === 2 ? 0 : n - 2, n === 2 ? Infinity : n);
  }

  function empieza(e) {
    marco = mide();
    if (!marco) return;
    trazo = { c: color, p: [] };
    puntero = e.pointerId;
    agrega(e);
  }

  function termina() {
    if (!trazo) return;
    var p = trazo.p, n = p.length / 3;
    if (n >= 2 && marco) { estilo(trazo.c); tramo(p, n - 1, n); }
    if (n) (tinta[actual] = tinta[actual] || []).push(trazo);
    trazo = null;
    puntero = null;
    ultimo = performance.now();
    guarda();
    refresca();
  }

  // ---------- Borrar ----------

  function distancia(x, y, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    var t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l)) : 0;
    var cx = ax + t * dx - x, cy = ay + t * dy - y;
    return Math.sqrt(cx * cx + cy * cy);
  }
  function toca(t, x, y) {
    var p = t.p, n = p.length / 3;
    for (var i = 0; i < n; i++) {
      var j = Math.min(i + 1, n - 1);
      if (distancia(x, y, p[3 * i], p[3 * i + 1], p[3 * j], p[3 * j + 1]) <= BORRADOR + p[3 * i + 2] / 2) return true;
    }
    return false;
  }
  function borraEn(e) {
    var lista = tinta[actual];
    if (!lista || !lista.length) return;
    marco = mide();
    if (!marco) return;
    var x = (e.clientX - marco.x) / marco.k, y = (e.clientY - marco.y) / marco.k;
    var quedan = lista.filter(function (t) { return !toca(t, x, y); });
    if (quedan.length === lista.length) return;
    tinta[actual] = quedan;
    pinta();
    guarda();
    refresca();
  }

  // «Borrar todo» pide un segundo toque: el primero sólo pregunta, durante tres segundos.
  function borraTodo() {
    if (!(tinta[actual] || []).length) return;
    var boton = barra.querySelector('[data-tinta-limpia]');
    if (!pregunta) {
      boton.textContent = '¿Borrar todo?';
      boton.classList.add('es-pregunta');
      pregunta = setTimeout(sinPregunta, 3000);
      return;
    }
    sinPregunta();
    tinta[actual] = [];
    pinta();
    guarda();
    refresca();
  }
  function sinPregunta() {
    clearTimeout(pregunta);
    pregunta = null;
    var boton = barra && barra.querySelector('[data-tinta-limpia]');
    if (!boton) return;
    boton.textContent = 'Borrar todo';
    boton.classList.remove('es-pregunta');
  }

  // ---------- Lo que se queda en la pestaña ----------

  function guarda() {
    clearTimeout(guarda.espera);
    guarda.espera = setTimeout(function () {
      try {
        var hay = Object.keys(tinta).some(function (k) { return tinta[k].length; });
        if (hay) sessionStorage.setItem(CLAVE, JSON.stringify({ t: Date.now(), p: tinta }));
        else sessionStorage.removeItem(CLAVE);
      } catch (error) { /* sin almacenamiento, la tinta vive mientras la página esté abierta */ }
    }, 400);
  }
  function carga() {
    try {
      var datos = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
      if (datos && datos.p && Date.now() - datos.t < VIGENCIA) tinta = datos.p;
      else sessionStorage.removeItem(CLAVE);
    } catch (error) { /* lo mismo */ }
  }

  // ---------- Los botones ----------

  function botones() {
    if (barra && barra.isConnected) return;
    barra = document.querySelector('.proyeccion-controles');
    if (!barra || barra.querySelector('[data-tinta]')) return;
    var grupo = document.createElement('span');
    grupo.className = 'tinta-herramientas';
    grupo.innerHTML =
      '<button class="proyeccion-controles__boton tinta-color" type="button" data-tinta-color="texto" aria-label="Tinta del color del texto" aria-pressed="true"><span class="tinta-color__punto"></span></button>' +
      '<button class="proyeccion-controles__boton tinta-color tinta-color--acento" type="button" data-tinta-color="acento" aria-label="Tinta del color de acento" aria-pressed="false"><span class="tinta-color__punto"></span></button>' +
      '<button class="proyeccion-controles__salir" type="button" data-tinta-borrador aria-pressed="false">Borrador</button>' +
      '<button class="proyeccion-controles__salir tinta-limpia" type="button" data-tinta-limpia>Borrar todo</button>';
    var escribir = document.createElement('button');
    escribir.className = 'proyeccion-controles__salir';
    escribir.type = 'button';
    escribir.setAttribute('data-tinta', '');
    escribir.setAttribute('aria-pressed', 'false');
    escribir.textContent = 'Escribir';
    var antes = barra.querySelector('[data-proyeccion-completa]') || barra.querySelector('[data-proyeccion-salir]');
    barra.insertBefore(grupo, antes);
    barra.insertBefore(escribir, antes);

    escribir.addEventListener('click', function () {
      escribiendo = !escribiendo;
      if (!escribiendo) { borrador = false; sinPregunta(); }
      refresca();
    });
    Array.prototype.forEach.call(grupo.querySelectorAll('[data-tinta-color]'), function (b) {
      b.addEventListener('click', function () {
        color = b.getAttribute('data-tinta-color');
        borrador = false;
        refresca();
      });
    });
    grupo.querySelector('[data-tinta-borrador]').addEventListener('click', function () {
      borrador = !borrador;
      refresca();
    });
    grupo.querySelector('[data-tinta-limpia]').addEventListener('click', borraTodo);
  }

  function refresca() {
    if (escribiendo) raiz.setAttribute('data-escribiendo', ''); else raiz.removeAttribute('data-escribiendo');
    if (borrador) raiz.setAttribute('data-borrando', ''); else raiz.removeAttribute('data-borrando');
    if (!barra) return;
    var marca = function (sel, si) { var b = barra.querySelector(sel); if (b) b.setAttribute('aria-pressed', si ? 'true' : 'false'); };
    marca('[data-tinta]', escribiendo);
    marca('[data-tinta-color="texto"]', !borrador && color === 'texto');
    marca('[data-tinta-color="acento"]', !borrador && color === 'acento');
    marca('[data-tinta-borrador]', borrador);
    var limpia = barra.querySelector('[data-tinta-limpia]');
    if (limpia) limpia.disabled = !(tinta[actual] || []).length;
  }

  // ---------- El lápiz ----------

  function activa() { return escribiendo && raiz.hasAttribute('data-proyeccion') && actual >= 0; }
  function enControles(t) { return !!(t && t.closest && t.closest('.proyeccion-controles')); }
  // Escribe el lápiz; el mouse también, para quien proyecta desde la compu. El dedo, nunca.
  function escribe(e) {
    if (e.pointerType === 'touch') return false;
    if (e.pointerType === 'mouse' && e.button !== 0) return false;
    return true;
  }

  document.addEventListener('pointerdown', function (e) {
    if (!activa() || !escribe(e) || enControles(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    // Si un trazo quedó abierto (se perdió el «soltar»), se cierra antes de empezar otro.
    if (trazo) termina();
    borrando = null;
    sinPregunta();
    if (borrador) { borrando = e.pointerId; borraEn(e); return; }
    empieza(e);
  }, true);

  document.addEventListener('pointermove', function (e) {
    if (e.pointerId === puntero && trazo) {
      e.preventDefault();
      e.stopPropagation();
      eventos(e).forEach(agrega);
    } else if (e.pointerId === borrando) {
      e.preventDefault();
      e.stopPropagation();
      eventos(e).forEach(borraEn);
    }
  }, true);

  function suelta(e) {
    if (e.pointerId === puntero) { e.stopPropagation(); termina(); }
    if (e.pointerId === borrando) { e.stopPropagation(); borrando = null; ultimo = performance.now(); }
  }
  document.addEventListener('pointerup', suelta, true);
  document.addEventListener('pointercancel', suelta, true);

  // Al levantar el lápiz, el navegador todavía manda un clic: no debe oprimir lo que quedó debajo.
  // El del dedo pasa siempre, aunque llegue justo después de escribir.
  document.addEventListener('click', function (e) {
    if (!escribiendo || enControles(e.target) || performance.now() - ultimo > 500) return;
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // En el iPad, el lápiz también desplaza y selecciona: con la tinta prendida, sus toques son sólo
  // para escribir. Los del dedo siguen libres.
  function lapiz(e) {
    if (!activa() || enControles(e.target)) return;
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].touchType === 'stylus') { e.preventDefault(); return; }
    }
  }
  document.addEventListener('touchstart', lapiz, { passive: false, capture: true });
  document.addEventListener('touchmove', lapiz, { passive: false, capture: true });

  // ---------- La pantalla actual ----------

  function sincroniza() {
    var proyectando = raiz.hasAttribute('data-proyeccion');
    var k = -1;
    if (proyectando) {
      for (var i = 0; i < diapositivas.length; i++) {
        if (diapositivas[i].classList.contains('es-proyectada')) { k = i; break; }
      }
      botones();
      prepara();
    } else if (escribiendo) {
      escribiendo = false;
      borrador = false;
    }
    if (k !== actual) {
      if (trazo) termina();
      borrando = null;
      actual = k;
      sinPregunta();
    }
    pinta();
    refresca();
  }

  // leccion.js cambia de pantalla con la clase «es-proyectada» y vuelve a medir quitando
  // «es-larga»: las dos cosas llegan aquí, ya acomodadas.
  var observador = new MutationObserver(sincroniza);
  observador.observe(raiz, { attributes: true, attributeFilter: ['data-proyeccion', 'data-theme'] });
  diapositivas.forEach(function (d) { observador.observe(d, { attributes: true, attributeFilter: ['class'] }); });

  // Una pantalla larga se desplaza: la tinta va con ella.
  document.addEventListener('scroll', function (e) {
    if (e.target === diapositivas[actual]) pinta();
  }, true);
  window.addEventListener('resize', function () { if (lienzo) pinta(); });

  carga();
  sincroniza();
})();
