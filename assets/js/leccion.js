/*
 * leccion.js — lo que comparten las lecciones de Tercial.
 *
 * Modo proyección: cada elemento con [data-diapositiva] se vuelve una pantalla
 * que llena la tele. Se entra con el botón [data-proyectar] («Proyectar») o con la tecla P;
 * se avanza con las flechas → y ←, Avance/Retroceso de página (lo que manda un control de
 * presentaciones) o la barra espaciadora, y se sale con «Salir», Esc o P. Las flechas ↑ y ↓
 * no cambian de pantalla: son de los controles (un desplegable, una lista), y ninguna tecla
 * que un control ya atendió llega aquí. Si el navegador quita la pantalla completa (Esc en
 * la Mac, el teclado o un gesto en el iPad), la proyección sigue y aparece «Pantalla
 * completa» para volver a ella. Arranca en la sección que estaba a la vista y, al salir,
 * regresa a la que quedó en pantalla.
 * Lo marcado con [data-solo-proyeccion] (la pantalla «Ahora tú», con el código QR)
 * sólo existe en este modo. Cada pantalla que llega a la tele recibe el evento
 * «tercial:diapositiva» (las escenas lo usan para empezar desde el principio) y la que
 * se va, «tercial:sale». Una pantalla con pasos propios (el reto relámpago) expone
 * __pasos.siguiente() y __pasos.anterior(): las flechas le preguntan primero a ella.
 * Si una pantalla trae más de lo que cabe, sus piezas se encogen lo justo (zoom, hasta
 * 65 %), como hace un programa de presentaciones; si trae poco, crecen (hasta 130 %) para
 * no dejar media tele vacía. Se vuelve a medir al llegar, cuando la
 * escena termina de cargar, al tocar algo dentro y con el evento «tercial:cambia».
 * Una tabla larga se ve por partes: <table data-filas-por-pantalla="5"> muestra 5 filas a la
 * vez, con su encabezado; las flechas recorren las partes (todas con la misma letra) antes de
 * cambiar de pantalla. Al llegar de regreso (←), se ve la última parte. Una pantalla dentro de
 * otra lleva arriba, en pequeño, el título de su sección.
 * Lo marcado con [data-revela] (la respuesta de un ejemplo, para cuando el grupo ya lo resolvió
 * en el pizarrón) aparece con la flecha →, uno por uno; ← lo vuelve a ocultar.
 * Con #tele en la liga (…/signos.html#tele) la lección abre ya en este modo: sirve
 * para el navegador de la propia tele o una compu conectada a ella, sin teclado.
 */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var diapositivas = Array.prototype.slice.call(document.querySelectorAll('[data-diapositiva]'));
  if (!diapositivas.length) return;

  var actual = 0;
  var controles = null;

  // La unidad de la tele (--u). El diseño mide 100 × 56.25 unidades, un 16:9. En una pantalla
  // más cuadrada (un iPad 4:3, una MacBook 16:10) sobra alto: la unidad crece hasta conservar
  // el área del diseño, como mucho 15 %, y el texto se reacomoda en más renglones. En 16:9 o
  // más ancha, la unidad es la de siempre.
  function medir() {
    var w = window.innerWidth, h = window.innerHeight;
    var u = Math.min(h / 56.25, Math.sqrt(w * h / 5625), w / 100 * 1.15);
    raiz.style.setProperty('--u', u.toFixed(2) + 'px');
  }

  function crearControles() {
    controles = document.createElement('div');
    controles.className = 'proyeccion-controles';
    controles.hidden = true;
    controles.innerHTML =
      '<span class="proyeccion-controles__cuenta" aria-live="polite"></span>' +
      '<button class="proyeccion-controles__boton" type="button" data-proyeccion-anterior aria-label="Pantalla anterior">←</button>' +
      '<button class="proyeccion-controles__boton" type="button" data-proyeccion-siguiente aria-label="Pantalla siguiente">→</button>' +
      '<button class="proyeccion-controles__salir" type="button" data-proyeccion-completa hidden>Pantalla completa</button>' +
      '<button class="proyeccion-controles__salir" type="button" data-proyeccion-salir>Salir</button>';
    document.body.appendChild(controles);
    controles.querySelector('[data-proyeccion-anterior]').addEventListener('click', function () { avanza(-1); });
    controles.querySelector('[data-proyeccion-siguiente]').addEventListener('click', function () { avanza(1); });
    controles.querySelector('[data-proyeccion-salir]').addEventListener('click', salir);
    controles.querySelector('[data-proyeccion-completa]').addEventListener('click', pantallaCompleta);
  }

  // La pantalla completa es un extra: si el navegador no la da o la quita, la proyección sigue.
  function pantallaCompleta() {
    if (!raiz.requestFullscreen || document.fullscreenElement) return;
    raiz.requestFullscreen().catch(function () {}).then(botonCompleta);
  }
  function botonCompleta() {
    if (!controles) return;
    controles.querySelector('[data-proyeccion-completa]').hidden =
      !raiz.hasAttribute('data-proyeccion') || !raiz.requestFullscreen || !!document.fullscreenElement;
  }

  function ir(indice, direccion) {
    var antes = actual;
    actual = Math.max(0, Math.min(diapositivas.length - 1, indice));
    if (antes !== actual) { diapositivas[antes].dispatchEvent(new CustomEvent('tercial:sale')); suelta(diapositivas[antes]); }
    diapositivas.forEach(function (d, k) {
      var esta = k === actual;
      d.classList.toggle('es-proyectada', esta);
      if (esta) d.removeAttribute('aria-hidden'); else d.setAttribute('aria-hidden', 'true');
    });
    diapositivas[actual].dispatchEvent(new CustomEvent('tercial:diapositiva', { detail: { direccion: direccion || 0 } }));
    ajusta(diapositivas[actual]);
    vigila(diapositivas[actual]);
    controles.querySelector('.proyeccion-controles__cuenta').textContent = (actual + 1) + ' de ' + diapositivas.length;
    controles.querySelector('[data-proyeccion-anterior]').disabled = actual === 0;
    controles.querySelector('[data-proyeccion-siguiente]').disabled = actual === diapositivas.length - 1;
  }

  // Avanza o regresa: primero los pasos de la pantalla actual, si los tiene; luego, de pantalla.
  function avanza(direccion) {
    var pasos = diapositivas[actual].__pasos;
    if (pasos && (direccion > 0 ? pasos.siguiente() : pasos.anterior())) return;
    ir(actual + direccion, direccion);
  }

  // Las piezas que acomoda la pantalla: sus hijos, y los de cada herramienta abierta.
  function piezas(d) {
    var lista = [];
    Array.prototype.forEach.call(d.children, function (h) {
      if (h.hasAttribute('data-abre')) lista = lista.concat(piezas(h));
      else lista.push(h);
    });
    return lista;
  }

  // Alto que ocupan las piezas, y alto disponible dentro de los márgenes de la pantalla.
  function altoPiezas(lista) {
    var arriba = Infinity, abajo = -Infinity;
    lista.forEach(function (n) {
      var b = n.getBoundingClientRect();
      if (!b.height) return;
      arriba = Math.min(arriba, b.top); abajo = Math.max(abajo, b.bottom);
    });
    return abajo > arriba ? abajo - arriba : 0;
  }
  function altoUtil(d) {
    var cs = getComputedStyle(d);
    return d.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  }

  // Cabe si no se pasa de alto ni de ancho (una cuenta larga en un renglón, en una tele 4:3).
  function cabe(d) {
    return d.scrollHeight <= d.clientHeight + 2 && d.scrollWidth <= d.clientWidth + 2;
  }

  // Ajuste: si la pantalla se pasa de alto o de ancho, todas sus piezas se encogen por igual, lo
  // justo; si le sobra más de un tercio del alto, crecen hasta llenar 9 de cada 10 partes.
  function zoomJusto(d, lista) {
    var tipo = d.getAttribute('data-diapositiva');
    lista.forEach(function (n) { n.style.zoom = ''; });
    if (cabe(d)) {
      if (tipo !== 'una' && tipo !== 'dos') return 1;
      var util = altoUtil(d), ocupado = altoPiezas(lista);
      if (!ocupado || ocupado > util * 0.66) return 1;
      var menos = 1, mas = 1.3;
      for (var j = 0; j < 7; j++) {
        var z = (menos + mas) / 2;
        lista.forEach(function (n) { n.style.zoom = z; });
        if (cabe(d) && altoPiezas(lista) <= util * 0.9) menos = z; else mas = z;
      }
      return menos > 1.01 ? menos : 1;
    }
    var bajo = 0.65, alto = 1;
    for (var k = 0; k < 7; k++) {
      var medio = (bajo + alto) / 2;
      lista.forEach(function (n) { n.style.zoom = medio; });
      if (cabe(d)) bajo = medio; else alto = medio;
    }
    // Con el mismo zoom, el texto no siempre se reacomoda igual: un borde que se redondea distinto
    // cambia un pixel el ancho y baja un renglón que apenas cabía. Se deja un 3 % de holgura y se
    // confirma; si ya no cabe, se baja un poco más.
    bajo = Math.max(0.65, bajo * 0.97);
    for (var paso = 0; paso < 8 && bajo > 0.65; paso++) {
      lista.forEach(function (n) { n.style.zoom = bajo.toFixed(3); });
      if (cabe(d)) break;
      bajo = Math.max(0.65, bajo - 0.015);
    }
    return bajo;
  }
  var esperas = [];
  function ajusta(d) {
    if (!d || !d.classList.contains('es-proyectada')) return;
    var lista = piezas(d);
    d.classList.remove('es-larga');
    var z = d.__partes ? d.__partes.menor(function () { return zoomJusto(d, lista); }) : zoomJusto(d, lista);
    lista.forEach(function (n) { n.style.zoom = z !== 1 ? z.toFixed(3) : ''; });
    // Ni así cabe: se puede desplazar, en vez de cortarse.
    if (d.scrollHeight > d.clientHeight + 2) d.classList.add('es-larga');
  }
  // Las escenas y las letras terminan de cargar un poco después: se mide otra vez.
  function vigila(d) {
    esperas.forEach(clearTimeout);
    esperas = [400, 1500].map(function (ms) { return setTimeout(function () { ajusta(d); }, ms); });
  }
  function suelta(d) {
    piezas(d).forEach(function (n) { n.style.zoom = ''; });
    d.classList.remove('es-larga');
  }

  // Una tabla larga, por partes: las flechas las recorren antes de cambiar de pantalla.
  function partes(d) {
    var tabla = Array.prototype.filter.call(d.querySelectorAll('table[data-filas-por-pantalla]'), function (t) {
      return t.closest('[data-diapositiva]') === d;
    })[0];
    if (!tabla || !tabla.tBodies.length) return;
    var porParte = parseInt(tabla.getAttribute('data-filas-por-pantalla'), 10) || 6;
    var filas = Array.prototype.slice.call(tabla.tBodies[0].rows);
    var total = Math.ceil(filas.length / porParte);
    if (total < 2) return;
    var parte = 0;
    var cuenta = document.createElement('p');
    cuenta.className = 'tabla-partes';
    (tabla.closest('.reference-table-wrap') || tabla).insertAdjacentElement('afterend', cuenta);
    function muestra(n) {
      parte = n;
      filas.forEach(function (f, k) { f.classList.toggle('es-otra-parte', Math.floor(k / porParte) !== n); });
      cuenta.textContent = 'Filas ' + (n * porParte + 1) + ' a ' + Math.min(filas.length, (n + 1) * porParte) +
        ' de ' + filas.length + (n < total - 1 ? ' →' : '');
    }
    // El zoom de la pantalla es el que deja caber a la parte más alta: la letra no cambia entre partes.
    d.__partes = {
      menor: function (medida) {
        var vista = parte, z = Infinity;
        for (var k = 0; k < total; k++) { muestra(k); z = Math.min(z, medida()); }
        muestra(vista);
        return z;
      }
    };
    d.__pasos = {
      siguiente: function () { if (parte >= total - 1) return false; muestra(parte + 1); d.scrollTop = 0; return true; },
      anterior: function () { if (parte <= 0) return false; muestra(parte - 1); d.scrollTop = 0; return true; }
    };
    d.addEventListener('tercial:diapositiva', function (evento) {
      muestra(evento.detail && evento.detail.direccion < 0 ? total - 1 : 0);
    });
    muestra(0);
  }
  diapositivas.forEach(partes);

  // Lo que se revela con la flecha: aparece uno por uno con → y se oculta con ←. Al llegar de
  // regreso, ya está todo a la vista. Ocupa su lugar desde el principio: al revelarlo, nada se
  // mueve ni cambia el zoom.
  function revelables(d) {
    if (d.__pasos) return;
    var lista = Array.prototype.filter.call(d.querySelectorAll('[data-revela]'), function (n) {
      return n.closest('[data-diapositiva]') === d;
    });
    if (!lista.length) return;
    var vistos = 0;
    function muestra(n) {
      vistos = n;
      lista.forEach(function (el, k) { el.classList.toggle('es-revelado', k < n); });
    }
    d.__pasos = {
      siguiente: function () { if (vistos >= lista.length) return false; muestra(vistos + 1); return true; },
      anterior: function () { if (vistos <= 0) return false; muestra(vistos - 1); return true; }
    };
    d.addEventListener('tercial:diapositiva', function (evento) {
      muestra(evento.detail && evento.detail.direccion < 0 ? lista.length : 0);
    });
    muestra(0);
  }
  diapositivas.forEach(revelables);

  // Una pantalla dentro de otra (una figura, un ejemplo, una nota) lleva arriba, en pequeño, el
  // título de su sección: se lee como continuación. Sólo se ve en la tele.
  function contexto(d) {
    if (d.querySelector('.section-header')) return;
    var padre = d, titulo = null;
    while (!titulo && (padre = padre.parentElement && padre.parentElement.closest('[data-diapositiva]'))) {
      titulo = padre.querySelector(':scope > .section-header .section-header__title');
    }
    if (!titulo) return;
    var cabeza = document.createElement('span');
    cabeza.className = 'pantalla-contexto';
    cabeza.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(titulo.childNodes, function (n) { cabeza.appendChild(n.cloneNode(true)); });
    d.insertBefore(cabeza, d.firstChild);
  }
  diapositivas.forEach(contexto);

  // La sección cuyo borde superior está más cerca de la parte de arriba de la ventana.
  function laQueSeVe() {
    var mejor = 0, distancia = Infinity;
    diapositivas.forEach(function (d, k) {
      if (d.hasAttribute('data-solo-proyeccion')) return;
      var y = Math.abs(d.getBoundingClientRect().top);
      if (y < distancia) { distancia = y; mejor = k; }
    });
    return mejor;
  }

  function entrar() {
    if (raiz.hasAttribute('data-proyeccion')) return;
    if (!controles) crearControles();
    var inicio = laQueSeVe();
    medir();
    raiz.setAttribute('data-proyeccion', '');
    controles.hidden = false;
    ir(inicio);
    botonCompleta();
    pantallaCompleta();
  }

  function salir() {
    if (!raiz.hasAttribute('data-proyeccion')) return;
    var vista = diapositivas[actual];
    vista.dispatchEvent(new CustomEvent('tercial:sale'));
    suelta(vista);
    esperas.forEach(clearTimeout);
    raiz.removeAttribute('data-proyeccion');
    raiz.style.removeProperty('--u');
    diapositivas.forEach(function (d) { d.classList.remove('es-proyectada'); d.removeAttribute('aria-hidden'); });
    controles.hidden = true;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    // Al salir, la liga deja de decir #tele: si se recarga, abre en lectura.
    if (location.hash === '#tele' && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (!vista.hasAttribute('data-solo-proyeccion')) vista.scrollIntoView({ block: 'start' });
  }

  // Algo cambió dentro de la pantalla (un botón, la pregunta del reto): se mide otra vez.
  function cambio(evento) {
    var d = diapositivas[actual];
    if (!raiz.hasAttribute('data-proyeccion') || !d.contains(evento.target)) return;
    setTimeout(function () { ajusta(d); }, 60);
  }
  document.addEventListener('click', cambio);
  document.addEventListener('tercial:cambia', cambio);

  window.addEventListener('resize', function () {
    if (!raiz.hasAttribute('data-proyeccion')) return;
    medir();
    ajusta(diapositivas[actual]);
  });

  // Si el navegador quita la pantalla completa, la proyección sigue: sólo se ofrece volver.
  document.addEventListener('fullscreenchange', function () {
    botonCompleta();
    if (raiz.hasAttribute('data-proyeccion')) { medir(); ajusta(diapositivas[actual]); }
  });

  document.addEventListener('keydown', function (evento) {
    var t = evento.target;
    if (evento.defaultPrevented || evento.metaKey || evento.ctrlKey || evento.altKey) return;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    // Dentro de un control con teclas propias (un desplegable, una lista), las teclas son suyas.
    if (t && t.closest && t.closest('[role="listbox"], [role="combobox"], [role="menu"], [role="slider"], [aria-haspopup]')) return;
    var proyectando = raiz.hasAttribute('data-proyeccion');
    if (!proyectando) {
      if (evento.key === 'p' || evento.key === 'P') { entrar(); evento.preventDefault(); }
      return;
    }
    // La barra espaciadora sobre un botón lo oprime; no avanza la pantalla.
    if (evento.key === ' ' && t && t.tagName === 'BUTTON') return;
    switch (evento.key) {
      case 'ArrowRight': case 'PageDown': case ' ': avanza(1); break;
      case 'ArrowLeft': case 'PageUp': avanza(-1); break;
      case 'Home': ir(0); break;
      case 'End': ir(diapositivas.length - 1); break;
      case 'Escape': case 'p': case 'P': salir(); break;
      default: return;
    }
    evento.preventDefault();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-proyectar]'), function (boton) {
    boton.addEventListener('click', entrar);
  });

  if (location.hash === '#tele') {
    window.scrollTo(0, 0);
    entrar();
  }
})();
