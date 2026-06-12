/* ============================================================
   home.js — Sala de Abordaje (index rediseñado, rama rediseno)

   Lee window.EXAMENES (definido inline en index.html para que
   el profe lo edite ahí mismo) y monta:
     1. Marquesina: fecha/hora viva (por minuto) + próxima salida
     2. Tablero de salidas agrupado por fecha
     3. Pase de abordar (adopción por localStorage) + "tu siguiente paso"
     4. La pregunta de hoy (semilla por fecha local, teclas 1-4, racha)
     5. Despegaron (exámenes ya presentados)

   localStorage:
     tercial:pasajero    — nombre elegido
     tercial:ultimoDias  — JSON {nombre: dias} para el flip diario
     tercial:pregunta    — JSON {fecha, idx, ok} última respuesta
     tercial:rachaDias   — JSON [fechas] con pregunta contestada
   ============================================================ */

(function () {
  'use strict';

  var DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function hoyCero() {
    var h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }

  function parseFecha(fechaStr) {
    var p = fechaStr.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function diasFaltantes(fechaStr) {
    return Math.round((parseFecha(fechaStr) - hoyCero()) / 86400000);
  }

  function fechaLarga(fechaStr) {
    var f = parseFecha(fechaStr);
    return DIAS_SEMANA[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()];
  }

  function fechaCorta(fechaStr) {
    var f = parseFecha(fechaStr);
    return DIAS_CORTO[f.getDay()] + ' ' + f.getDate() + ' ' + MESES[f.getMonth()].slice(0, 3).toUpperCase();
  }

  /* Semilla del día: AAAAMMDD local — nunca toISOString (UTC corre el día). */
  function semillaHoy() {
    var h = new Date();
    return h.getFullYear() * 10000 + (h.getMonth() + 1) * 100 + h.getDate();
  }

  function claveHoy() {
    var h = new Date();
    return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
  }

  function lsGet(k, fallback) {
    try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }

  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo incógnito */ }
  }

  var EXAMENES = window.EXAMENES || [];
  var vigentes = EXAMENES.filter(function (e) { return diasFaltantes(e.fecha) >= 0; })
    .sort(function (a, b) { return diasFaltantes(a.fecha) - diasFaltantes(b.fecha); });
  var pasados = EXAMENES.filter(function (e) { return diasFaltantes(e.fecha) < 0; })
    .sort(function (a, b) { return diasFaltantes(b.fecha) - diasFaltantes(a.fecha); });

  /* Agrupar por fecha (4 grupos, no 14 filas) */
  var grupos = [];
  vigentes.forEach(function (e) {
    var g = grupos[grupos.length - 1];
    if (!g || g.fecha !== e.fecha) {
      g = { fecha: e.fecha, nombres: [] };
      grupos.push(g);
    }
    g.nombres.push(e.nombre);
  });

  var pasajero = lsGet('tercial:pasajero', null);
  if (pasajero && !EXAMENES.some(function (e) { return e.nombre === pasajero; })) pasajero = null;

  function examenDe(nombre) {
    for (var i = 0; i < EXAMENES.length; i++) if (EXAMENES[i].nombre === nombre) return EXAMENES[i];
    return null;
  }

  /* ============================================================
     1 · MARQUESINA
     ============================================================ */

  function pintaReloj() {
    var el = document.getElementById('marquee-reloj');
    if (!el) return;
    var h = new Date();
    var hh = String(h.getHours()).padStart(2, '0');
    var mm = String(h.getMinutes()).padStart(2, '0');
    el.textContent = DIAS_SEMANA[h.getDay()] + ' ' + h.getDate() + ' de ' + MESES[h.getMonth()] + ' · ' + hh + ':' + mm;
  }

  function montaMarquee() {
    var prox = document.getElementById('marquee-proxima');
    if (prox) {
      if (grupos.length) {
        var g = grupos[0];
        var d = diasFaltantes(g.fecha);
        var cuando = d === 0 ? '¡HOY!' : d === 1 ? 'FALTA 1 DÍA' : 'FALTAN ' + d + ' DÍAS';
        prox.innerHTML = 'Próxima salida · <strong>' + fechaCorta(g.fecha) + '</strong> · ' +
          g.nombres.join(', ') + ' · ' + cuando;
      } else {
        prox.textContent = 'Sin salidas programadas — el tablero descansa.';
      }
    }
    pintaReloj();
    /* Tick por minuto, alineado al cambio de minuto. Sin segundos: nadie
       los necesita en un sitio de estudio. */
    setTimeout(function () {
      pintaReloj();
      setInterval(pintaReloj, 60000);
    }, (60 - new Date().getSeconds()) * 1000);
  }

  /* ============================================================
     2 · TABLERO DE SALIDAS
     ============================================================ */

  function chipEstado(dias) {
    if (dias === 0) return { clase: 'tablero__estado--hoy', texto: '¡Hoy!', pulso: true };
    if (dias <= 3) return { clase: 'tablero__estado--ultima', texto: 'Última llamada', pulso: true };
    if (dias <= 7) return { clase: 'tablero__estado--abordando', texto: 'Abordando', pulso: false };
    return { clase: '', texto: 'En preparación', pulso: false };
  }

  function montaTablero() {
    var cont = document.getElementById('tablero-grupos');
    var seccion = document.getElementById('salidas');
    if (!cont) return;

    if (!grupos.length) {
      if (seccion) {
        var head = seccion.querySelector('.abordaje__lede');
        if (head) head.textContent = 'No hay exámenes programados por ahora. Los andenes siguen abiertos.';
      }
      cont.innerHTML = '<p class="tablero__pie">Sin salidas en el tablero.</p>';
      return;
    }

    var totalPasajeros = vigentes.length;
    var titulo = document.getElementById('abordaje-title');
    if (titulo) {
      var mes = MESES[parseFecha(grupos[0].fecha).getMonth()];
      titulo.innerHTML = 'Salidas de <em>' + mes + '</em>';
    }
    var lede = document.getElementById('abordaje-lede');
    if (lede) {
      lede.textContent = totalPasajeros + ' pasajeros · ' + grupos.length +
        (grupos.length === 1 ? ' fecha' : ' fechas') + ' · un solo destino: tu lugar en la prepa.';
    }

    cont.innerHTML = '';
    grupos.forEach(function (g) {
      var dias = diasFaltantes(g.fecha);
      var chip = chipEstado(dias);
      var fila = document.createElement('div');
      fila.className = 'tablero__grupo';

      var nombres = g.nombres.map(function (n) {
        var cls = 'tablero__nombre' + (n === pasajero ? ' es-tu' : '');
        return '<button type="button" class="' + cls + '" data-nombre="' + n + '">' + n + '</button>';
      }).join('');

      fila.innerHTML =
        '<div class="tablero__salida">' + fechaCorta(g.fecha) +
          '<small>' + fechaLarga(g.fecha).split(' ')[0] + '</small></div>' +
        '<div class="tablero__pasajeros">' + nombres + '</div>' +
        '<div class="tablero__faltan"><span class="tablero__dias">' +
          (dias === 0 ? '¡HOY!' : dias) + '</span>' +
          (dias > 0 ? '<span class="tablero__dias-sufijo">' + (dias === 1 ? 'día' : 'días') + '</span>' : '') +
        '</div>' +
        '<span class="tablero__estado ' + chip.clase + '">' +
          (chip.pulso ? '<span class="tablero__pulso" aria-hidden="true"></span>' : '') +
          chip.texto + '</span>';
      cont.appendChild(fila);
    });

    var pie = document.createElement('p');
    pie.className = 'tablero__pie';
    pie.textContent = 'Toca tu nombre y el tablero te dará tu pase de abordar.';
    cont.appendChild(pie);

    cont.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.tablero__nombre');
      if (!btn) return;
      adopta(btn.getAttribute('data-nombre'));
    });
  }

  /* ============================================================
     3 · PASE DE ABORDAR + "tu siguiente paso"
     ============================================================ */

  function siguientePaso(dias) {
    /* Motor de 4 reglas. Cero backend, cero pretensión. */
    if (dias === null || dias > 7) {
      return {
        primaria: { href: '/tercial/practicar.html', html: '<em>Practica</em> por tema', meta: '16 mazos' },
        extras: [
          { href: '/tercial/examen_adaptativo.html', html: 'Simulacro adaptativo', meta: '50 reactivos' },
          { href: '/tercial/repaso.html', html: 'Notas de repaso', meta: 'ideas clave' }
        ]
      };
    }
    if (dias > 3) {
      return {
        primaria: { href: '/tercial/examen_adaptativo.html', html: '<em>Simulacro</em> adaptativo', meta: '50 reactivos' },
        extras: [
          { href: '/tercial/practicar.html', html: 'Practicar por tema', meta: '16 mazos' },
          { href: '/tercial/repaso.html', html: 'Notas de repaso', meta: 'ideas clave' }
        ]
      };
    }
    return {
      primaria: { href: '/tercial/repaso.html', html: '<em>Repaso</em> exprés', meta: 'la noche antes' },
      extras: [
        { href: '/tercial/flashcards.html?modo=revisar', html: 'Revisar tarjetas', meta: 'rápido' },
        { href: '/tercial/formulario.html', html: 'Formulario', meta: '100+ fórmulas' }
      ]
    };
  }

  function ctasHTML(plan) {
    var html = '<p class="pase__siguiente-label">Tu siguiente paso</p>';
    html += '<a class="pase__cta pase__cta--primaria" href="' + plan.primaria.href + '">' +
      '<span>' + plan.primaria.html + ' →</span><span class="meta">' + plan.primaria.meta + '</span></a>';
    plan.extras.forEach(function (x) {
      html += '<a class="pase__cta" href="' + x.href + '">' +
        '<span>' + x.html + ' →</span><span class="meta">' + x.meta + '</span></a>';
    });
    return html;
  }

  function montaPase() {
    var pase = document.getElementById('pase');
    if (!pase) return;

    var cuerpo = pase.querySelector('.pase__cuerpo');
    var talon = pase.querySelector('.pase__talon');
    var ex = pasajero ? examenDe(pasajero) : null;
    var dias = ex ? diasFaltantes(ex.fecha) : null;
    var expirado = ex && dias < 0;

    pase.classList.toggle('pase--urgente', dias !== null && dias >= 0 && dias <= 7);

    if (!ex || expirado) {
      /* Estado por defecto digno: el pase invita, no bloquea. */
      var pills = vigentes.map(function (e) {
        return '<button type="button" class="pase__pill" data-nombre="' + e.nombre + '">' + e.nombre + '</button>';
      }).join('');
      cuerpo.innerHTML =
        '<p class="pase__eyebrow"><span>Pase de abordar</span><span>Tercial</span></p>' +
        '<p class="pase__pregunta">¿Quién viaja hoy?</p>' +
        (expirado
          ? '<p class="pase__destino">Tu examen ya pasó, ' + pasajero + ' — esperamos que hayas despegado con todo. 🎓</p>'
          : '') +
        (pills ? '<div class="pase__roster">' + pills + '</div>' : '') +
        '<p class="pase__visitante">o sigue como visitante — todo el material es libre</p>';
      talon.innerHTML = ctasHTML(siguientePaso(null));
      cuerpo.querySelectorAll('.pase__pill').forEach(function (b) {
        b.addEventListener('click', function () { adopta(b.getAttribute('data-nombre')); });
      });
      return;
    }

    if (dias === 0) {
      /* Modo día de examen: sin tarea pesada, sólo calma. */
      cuerpo.innerHTML =
        '<p class="pase__eyebrow"><span>Pase de abordar</span><span>¡Hoy!</span></p>' +
        '<p class="pase__nombre">' + ex.nombre + '</p>' +
        '<p class="pase__destino">COMIPEMS · ' + fechaLarga(ex.fecha) + '</p>' +
        '<p class="pase__bendicion">Respira. Ya hiciste el trabajo; hoy sólo vas a demostrarlo.</p>';
      talon.innerHTML =
        '<p class="pase__siguiente-label">Checklist de salida</p>' +
        '<ul class="pase__checklist">' +
        '<li>□ comprobante-credencial</li>' +
        '<li>□ lápiz 2B, goma, sacapuntas</li>' +
        '<li>□ agua y algo de comer</li>' +
        '<li>□ llegar 1 hora antes a tu sede</li>' +
        '</ul>' +
        '<button type="button" class="pase__cambiar" id="pase-cambiar">cambiar pasajero</button>';
    } else {
      cuerpo.innerHTML =
        '<p class="pase__eyebrow"><span>Pase de abordar</span><span>' + fechaCorta(ex.fecha) + '</span></p>' +
        '<p class="pase__nombre">' + ex.nombre + '</p>' +
        '<p class="pase__destino">COMIPEMS · ' + fechaLarga(ex.fecha) + '</p>' +
        '<div class="pase__dias-wrap">' +
          '<span class="pase__dias" id="pase-dias">' + dias + '</span>' +
          '<span class="pase__dias-label">' + (dias === 1 ? 'día restante' : 'días restantes') + '</span>' +
        '</div>';
      talon.innerHTML = ctasHTML(siguientePaso(dias)) +
        '<button type="button" class="pase__cambiar" id="pase-cambiar">cambiar pasajero</button>';

      /* Flip diario: si el número bajó desde la última visita, lo VES caer. */
      var ultimo = lsGet('tercial:ultimoDias', {});
      if (typeof ultimo[ex.nombre] === 'number' && ultimo[ex.nombre] > dias) {
        var el = document.getElementById('pase-dias');
        el.textContent = ultimo[ex.nombre];
        setTimeout(function () {
          el.classList.add('es-flip');
          setTimeout(function () { el.textContent = dias; }, 140);
          el.addEventListener('animationend', function () { el.classList.remove('es-flip'); }, { once: true });
        }, 600);
      }
      ultimo[ex.nombre] = dias;
      lsSet('tercial:ultimoDias', ultimo);
    }

    var cambiar = document.getElementById('pase-cambiar');
    if (cambiar) cambiar.addEventListener('click', function () { adopta(null); });
  }

  function adopta(nombre) {
    pasajero = nombre;
    if (nombre) lsSet('tercial:pasajero', nombre);
    else { try { localStorage.removeItem('tercial:pasajero'); } catch (e) {} }
    montaTablero();
    montaPase();
  }

  /* ============================================================
     4 · LA PREGUNTA DE HOY
     Banco inline (texto plano Unicode, igual que los bancos
     adaptativos — la conversión KaTeX es proyecto aparte).
     Misma pregunta para toda la clase: semilla = fecha local.
     ============================================================ */

  var BANCO = [
    { q: '¿Cuánto es ¾ + ⅙?', op: ['11/12', '4/10', '5/6', '7/12'], ok: 0, why: 'Común denominador 12: 9/12 + 2/12 = 11/12.' },
    { q: 'El 25% de 480 es…', op: ['96', '120', '110', '125'], ok: 1, why: '25% es la cuarta parte: 480 ÷ 4 = 120.' },
    { q: 'Si 2x − 7 = 15, entonces x =', op: ['4', '8', '11', '14'], ok: 2, why: '2x = 22, x = 11.' },
    { q: 'Un auto va a 90 km/h. ¿Cuántos m/s son?', op: ['15', '20', '25', '30'], ok: 2, why: '90 ÷ 3.6 = 25 m/s.' },
    { q: '(a + b)² =', op: ['a² + b²', 'a² + ab + b²', 'a² + 2ab + b²', '2a + 2b'], ok: 2, why: 'Binomio al cuadrado: cuadrado, doble producto, cuadrado.' },
    { q: 'El mínimo común múltiplo de 6 y 8 es…', op: ['12', '24', '48', '14'], ok: 1, why: '6: 6,12,18,24… · 8: 8,16,24… El primero en común: 24.' },
    { q: 'Sigue la sucesión: 3, 7, 11, 15, …', op: ['17', '18', '19', '21'], ok: 2, why: 'Aumenta de 4 en 4: 15 + 4 = 19.' },
    { q: 'Con F = m·a, si m = 4 kg y a = 2.5 m/s², F =', op: ['6.5 N', '10 N', '12 N', '1.6 N'], ok: 1, why: '4 × 2.5 = 10 newtons.' },
    { q: '2³ × 2⁴ =', op: ['2⁷', '2¹²', '4⁷', '2¹'], ok: 0, why: 'Misma base: se suman exponentes, 3 + 4 = 7.' },
    { q: 'Un sinónimo de «conciso» es…', op: ['extenso', 'breve', 'confuso', 'elegante'], ok: 1, why: 'Conciso = que dice mucho con pocas palabras.' },
    { q: '−8 + 15 =', op: ['−7', '7', '−23', '23'], ok: 1, why: 'Signos distintos: se restan y gana el mayor, 15 − 8 = 7.' },
    { q: 'Dos ángulos de un triángulo miden 35° y 65°. El tercero mide…', op: ['90°', '100°', '80°', '70°'], ok: 2, why: 'Suman 180°: 180 − 35 − 65 = 80°.' },
    { q: '0.35 escrito como fracción simplificada es…', op: ['35/10', '7/20', '3/5', '7/10'], ok: 1, why: '35/100 = 7/20 (÷5 arriba y abajo).' },
    { q: 'Caída libre desde el reposo, 3 s después (g ≈ 10 m/s²): v =', op: ['3 m/s', '10 m/s', '30 m/s', '90 m/s'], ok: 2, why: 'v = g·t = 10 × 3 = 30 m/s.' },
    { q: 'La pendiente de la recta que pasa por (1, 2) y (3, 8) es…', op: ['2', '3', '4', '6'], ok: 1, why: 'm = (8−2)/(3−1) = 6/2 = 3.' },
    { q: 'El 15% de 60 es…', op: ['6', '9', '12', '15'], ok: 1, why: '10% es 6, 5% es 3: 6 + 3 = 9.' },
    { q: 'Densidad = masa/volumen. Con 200 g y 50 cm³: ρ =', op: ['4 g/cm³', '0.25 g/cm³', '250 g/cm³', '10 g/cm³'], ok: 0, why: '200 ÷ 50 = 4 g/cm³.' },
    { q: 'Un antónimo de «efímero» es…', op: ['fugaz', 'duradero', 'frágil', 'instantáneo'], ok: 1, why: 'Efímero = que dura poco; lo contrario, duradero.' },
    { q: 'Si x² = 144, los valores de x son…', op: ['solo 12', '12 y −12', 'solo −12', '72 y −72'], ok: 1, why: 'Toda raíz cuadrada positiva tiene dos soluciones: ±12.' },
    { q: 'Resuelve: 5(x − 2) = 20', op: ['x = 2', 'x = 4', 'x = 6', 'x = 30'], ok: 2, why: 'x − 2 = 4, x = 6.' },
    { q: 'La fórmula del área de un círculo es…', op: ['2πr', 'πr²', 'πd²', '4πr²'], ok: 1, why: 'A = πr². (2πr es el perímetro.)' },
    { q: '¿Qué fracción es mayor?', op: ['2/3', '3/5', '5/9', '7/12'], ok: 0, why: 'En decimales: 0.67 > 0.6 > 0.58 > 0.56.' },
    { q: 'El trabajo mecánico se calcula con…', op: ['T = F·d', 'T = m·a', 'T = d/t', 'T = m·g·v'], ok: 0, why: 'Trabajo = fuerza por distancia, medido en joules.' },
    { q: '√(81) + √(64) =', op: ['12', '17', '145', '15'], ok: 1, why: '9 + 8 = 17.' },
    { q: 'Si un artículo de $250 tiene 20% de descuento, pagas…', op: ['$200', '$210', '$230', '$50'], ok: 0, why: '20% de 250 es 50: 250 − 50 = 200.' },
    { q: 'La velocidad es de 5 m/s durante 2 minutos. Distancia:', op: ['10 m', '300 m', '600 m', '150 m'], ok: 2, why: '2 min = 120 s: 5 × 120 = 600 m.' },
    { q: '¿Cuál palabra está escrita correctamente?', op: ['exhuberante', 'exuberante', 'esuberante', 'exhuverante'], ok: 1, why: 'Exuberante — sin h: viene del latín exuberare.' },
    { q: 'x/4 = 9, entonces x =', op: ['2.25', '13', '36', '45'], ok: 2, why: 'x = 9 × 4 = 36.' }
  ];

  function montaPregunta() {
    var cont = document.getElementById('pregunta');
    if (!cont || !BANCO.length) return;

    var p = BANCO[semillaHoy() % BANCO.length];
    var hoy = claveHoy();
    var respuesta = lsGet('tercial:pregunta', null);
    var yaRespondida = respuesta && respuesta.fecha === hoy;
    var racha = lsGet('tercial:rachaDias', []);

    function rachaActual() {
      /* Días consecutivos hasta hoy con pregunta contestada. */
      var n = 0;
      var d = hoyCero();
      while (true) {
        var clave = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (racha.indexOf(clave) === -1) break;
        n++;
        d.setDate(d.getDate() - 1);
      }
      return n;
    }

    function render() {
      var n = rachaActual();
      var letras = ['A', 'B', 'C', 'D'];
      var html =
        '<div class="pregunta__eyebrow"><span>La pregunta de hoy</span>' +
        (n >= 2 ? '<span class="pregunta__racha">racha · ' + n + ' días</span>' : '<span>' + fechaCorta(claveHoy()) + '</span>') +
        '</div>' +
        '<p class="pregunta__texto">' + p.q + '</p>' +
        '<div class="pregunta__opciones">';
      p.op.forEach(function (op, i) {
        var extra = '';
        var disabled = '';
        if (yaRespondida) {
          disabled = ' disabled';
          if (i === p.ok) extra = ' pregunta__opcion--correcta';
          else if (i === respuesta.idx && respuesta.idx !== p.ok) extra = ' pregunta__opcion--incorrecta';
        }
        html += '<button type="button" class="pregunta__opcion' + extra + '" data-idx="' + i + '"' + disabled + '>' +
          '<span class="pregunta__tecla">' + (i + 1) + '</span><span>' + letras[i] + '. ' + op + '</span></button>';
      });
      html += '</div>';
      if (yaRespondida) {
        html += '<p class="pregunta__porque">' + (respuesta.idx === p.ok ? '✓ ' : '') + p.why + '</p>';
        html += '<p class="pregunta__manana">Mañana hay otra. La misma para toda la clase.</p>';
      }
      cont.innerHTML = html;

      if (!yaRespondida) {
        cont.querySelectorAll('.pregunta__opcion').forEach(function (b) {
          b.addEventListener('click', function () { responde(parseInt(b.getAttribute('data-idx'), 10)); });
        });
      }
    }

    function responde(idx) {
      if (yaRespondida) return;
      yaRespondida = true;
      respuesta = { fecha: hoy, idx: idx, ok: idx === p.ok };
      lsSet('tercial:pregunta', respuesta);
      if (racha.indexOf(hoy) === -1) {
        racha.push(hoy);
        if (racha.length > 60) racha = racha.slice(-60);
        lsSet('tercial:rachaDias', racha);
      }
      render();
    }

    /* Teclas 1-4: un solo listener global, sólo si la pregunta está viva
       y el foco no está en un input (mismo patrón que los exámenes). */
    document.addEventListener('keydown', function (ev) {
      if (yaRespondida) return;
      if (/^[1-4]$/.test(ev.key) === false) return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      var btn = cont.querySelector('.pregunta__opcion[data-idx="' + (parseInt(ev.key, 10) - 1) + '"]');
      if (btn) btn.click();
    });

    render();
  }

  /* ============================================================
     5 · DESPEGARON
     ============================================================ */

  function montaDespegaron() {
    var cont = document.getElementById('despegaron');
    if (!cont) return;
    if (!pasados.length) { cont.hidden = true; return; }
    var html = '<span class="despegaron__label">Despegaron</span>';
    pasados.forEach(function (e) {
      html += '<span class="despegaron__alumno">' + e.nombre +
        ' <small>· ' + fechaCorta(e.fecha).toLowerCase() + ' ✈</small></span>';
    });
    cont.innerHTML = html;
    cont.hidden = false;
  }

  /* ============================================================
     Arranque
     ============================================================ */

  montaMarquee();
  montaTablero();
  montaPase();
  montaPregunta();
  montaDespegaron();
})();
