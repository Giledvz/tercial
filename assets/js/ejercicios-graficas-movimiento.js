/*
 * ejercicios-graficas-movimiento.js — Física, semana 6 de Fundamentos: «Gráficas II:
 * interpretar el movimiento». Generadores para la práctica sin fin y el reto relámpago.
 *
 * Se carga después de ejercicios-motor.js y ejercicios-fisica.js: usa los ayudantes de
 * M.fisica (armar, azar, barajar). Cada ejercicio trae una gráfica dibujada como SVG
 * pequeño, en el enunciado o en las opciones, y se contesta sin hacer cuentas, mirando la
 * forma. Cada opción falsa es un error real, con su explicación: leer la gráfica como si
 * fuera el camino, creer que bajar en x–t es frenar, confundir x–t con v–t, tomar una
 * horizontal de v–t por «detenido», ver en la cima de v–t el momento de la vuelta…
 *
 *   gm-detenido   ¿en qué tramo está detenido?          x–t; desde el nivel 2, también v–t
 *   gm-rapido     ¿en qué tramo va más rápido?          x–t; en el nivel 3, también v–t
 *   gm-regresa    ¿en qué tramo va de regreso?, ¿dónde se da la vuelta?, ¿en qué instante?
 *   gm-acelera    ¿avanza o se regresa?, ¿acelera, frena o va a velocidad constante?
 *   gm-historia   ¿qué gráfica cuenta esta historia?; en el nivel 3, de x–t a v–t
 *
 * Las gráficas no llevan números en el eje vertical: lo que se pregunta se ve en la forma.
 * Una curva es una parábola (aceleración constante) y se dibuja con una Bézier cuadrática
 * exacta: su punto de control es donde se cruzan las tangentes de los extremos. Los trazos
 * usan sólo comandos absolutos con comas (M, L, Q, H, V, Z) y ningún número va seguido de
 * un espacio y una letra, así que juntar() (que une número y unidad con un espacio duro)
 * los deja intactos.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var azar = F.azar, barajar = F.barajar, MENOS = F.MENOS;

  function r1(n) { var v = Math.round(n * 10) / 10; return v === 0 ? 0 : v; }
  function mayuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Piezas de una gráfica ----------
     Una pieza va de t0 a t1. Recta: de y0 a y1. Curva: parábola que sale con pendiente m0
     y llega con m1 (aceleración constante). */
  function recta(t0, t1, y0, y1) {
    var m = (y1 - y0) / (t1 - t0);
    return { t0: t0, t1: t1, y0: y0, y1: y1, curva: false, m0: m, m1: m };
  }
  function curva(t0, t1, y0, m0, m1) {
    return { t0: t0, t1: t1, y0: y0, y1: y0 + (m0 + m1) / 2 * (t1 - t0), curva: true, m0: m0, m1: m1 };
  }

  // Posición contra tiempo: tramos {d, v} (recta) o {d, v0, v1} (curva). x no brinca.
  function enX(x0, lista) {
    var t = 0, x = x0, piezas = [];
    lista.forEach(function (s) {
      var p = s.v0 === undefined ? recta(t, t + s.d, x, x + s.v * s.d) : curva(t, t + s.d, x, s.v0, s.v1);
      piezas.push(p); t = p.t1; x = p.y1;
    });
    return { eje: 'x', piezas: piezas };
  }
  // Velocidad contra tiempo: tramos {d, v0, v1}; sin v1 la velocidad es constante.
  // Puede brincar de un tramo al siguiente (escalones, como las gráficas de examen).
  function enV(lista) {
    var t = 0, piezas = [];
    lista.forEach(function (s) {
      piezas.push(recta(t, t + s.d, s.v0, s.v1 === undefined ? s.v0 : s.v1));
      t += s.d;
    });
    return { eje: 'v', piezas: piezas };
  }
  // La misma forma, leída con el otro eje: así se dibuja la confusión entre x–t y v–t.
  function comoEje(g, eje) { return { eje: eje, piezas: g.piezas }; }

  /* ---------- Dibujo ---------- */
  var TAM = {
    grande: { w: 264, h: 156, l: 30, r: 238, arriba: 32, abajo: 132 },
    chica: { w: 156, h: 104, l: 22, r: 130, arriba: 14, abajo: 90 }
  };

  // Valor más alto y más bajo de la gráfica (una parábola puede tener su vértice adentro).
  function extremos(g) {
    var lo = Infinity, hi = -Infinity;
    g.piezas.forEach(function (p) {
      lo = Math.min(lo, p.y0, p.y1); hi = Math.max(hi, p.y0, p.y1);
      if (p.curva && p.m0 !== p.m1) {
        var d = p.t1 - p.t0, a = (p.m1 - p.m0) / d, tau = -p.m0 / a;
        if (tau > 0 && tau < d) {
          var y = p.y0 + p.m0 * tau + a * tau * tau / 2;
          lo = Math.min(lo, y); hi = Math.max(hi, y);
        }
      }
    });
    return { lo: lo, hi: hi };
  }

  // La escala vertical: el cero siempre se ve (es el eje t). Lo plano se centra.
  function rango(g) {
    var e = extremos(g), lo = Math.min(e.lo, 0), hi = Math.max(e.hi, 0);
    if (e.hi - e.lo < 1e-9 && e.hi !== 0) {            // una horizontal fuera del cero
      if (e.hi > 0) hi = e.hi * 2; else lo = e.lo * 2;
    } else if (hi - lo < 1e-9) {                      // todo sobre el cero
      lo = -1; hi = 1;
    }
    var pad = (hi - lo) * 0.13;
    return { lo: lo < 0 ? lo - pad : lo, hi: hi > 0 ? hi + pad : hi };
  }

  function nombreEje(eje) { return eje === 'x' ? 'posición' : 'velocidad'; }

  // Cómo se ve cada tramo, en palabras: para la descripción accesible de la figura.
  function forma(g, p) {
    var e = 1e-9;
    if (g.eje === 'x') {
      if (!p.curva) return Math.abs(p.m0) < e ? 'horizontal' : p.m0 > 0 ? 'sube en recta' : 'baja en recta';
      var sube = p.y1 > p.y0;
      return (sube ? 'sube' : 'baja') + (Math.abs(p.m1) > Math.abs(p.m0) ? ' y se empina' : ' y se aplana');
    }
    var lado = function (y) { return y > e ? 'arriba del eje' : y < -e ? 'abajo del eje' : 'en el eje'; };
    if (p.y0 * p.y1 < 0) return 'cruza el eje';
    if (Math.abs(p.y1 - p.y0) < e) return Math.abs(p.y0) < e ? 'sobre el eje' : 'horizontal ' + lado(p.y0);
    var ref = Math.abs(p.y0) > e ? p.y0 : p.y1;
    return lado(ref) + ', ' + (p.y1 > p.y0 ? 'sube' : 'baja');
  }

  function describe(g, conTramos) {
    var partes = g.piezas.map(function (p, i) {
      return (conTramos ? 'tramo ' + (i + 1) + ': ' : '') + forma(g, p);
    });
    return 'Gráfica de ' + nombreEje(g.eje) + ' contra tiempo. ' + mayuscula(partes.join('; ')) + '.';
  }

  /* dibuja(g, tamaño, {tramos, marcas}) → el SVG como texto.
     tramos: numera cada tramo arriba y los separa con líneas punteadas.
     marcas: lista de instantes enteros que se rotulan abajo (sólo en la grande). */
  function dibuja(g, tamano, extra) {
    extra = extra || {};
    var T = TAM[tamano], R = rango(g);
    var tmax = g.piezas[g.piezas.length - 1].t1;
    var X = function (t) { return r1(T.l + t / tmax * (T.r - T.l)); };
    var Y = function (y) { return r1(T.abajo - (y - R.lo) / (R.hi - R.lo) * (T.abajo - T.arriba)); };
    var y0 = Y(0), s = [];
    s.push('<svg class="gm-graf gm-graf--' + tamano + '" viewBox="0 0 ' + T.w + ' ' + T.h +
      '" role="img" aria-label="' + describe(g, extra.tramos) + '">');
    // Rejilla: una línea por instante rotulado, o una por frontera de tramo.
    if (extra.marcas) {
      var rej = '';
      extra.marcas.forEach(function (t) { if (t > 0) rej += 'M' + X(t) + ',' + T.arriba + 'V' + T.abajo; });
      s.push('<path class="gm-rejilla" d="' + rej + '"/>');
      extra.marcas.forEach(function (t) {
        s.push('<text class="gm-marca" x="' + X(t) + '" y="' + (T.abajo + 15) + '" text-anchor="middle">' + t + '</text>');
      });
    }
    if (extra.tramos) {
      var sep = '';
      g.piezas.forEach(function (p, i) { if (i > 0) sep += 'M' + X(p.t0) + ',' + (T.arriba - 12) + 'V' + T.abajo; });
      if (sep) s.push('<path class="gm-sep" d="' + sep + '"/>');
      g.piezas.forEach(function (p, i) {
        s.push('<text class="gm-num" x="' + X((p.t0 + p.t1) / 2) + '" y="' + (T.arriba - 16) + '" text-anchor="middle">' + (i + 1) + '</text>');
      });
    }
    // Ejes: el vertical con su letra arriba; el del tiempo, en el cero, con su punta y su t.
    var fondo = Math.max(T.abajo, y0);
    s.push('<path class="gm-eje" d="M' + T.l + ',' + fondo + 'V' + (T.arriba - 7) + 'M' + T.l + ',' + y0 + 'H' + (T.r + 6) + '"/>');
    s.push('<path class="gm-punta" d="M' + T.l + ',' + (T.arriba - 12) + 'L' + (T.l - 3.5) + ',' + (T.arriba - 5) + 'L' + (T.l + 3.5) + ',' + (T.arriba - 5) + 'Z' +
      'M' + (T.r + 11) + ',' + y0 + 'L' + (T.r + 4) + ',' + (y0 - 3.5) + 'L' + (T.r + 4) + ',' + (y0 + 3.5) + 'Z"/>');
    s.push('<text class="gm-letra" x="' + (T.l - 7) + '" y="' + (T.arriba - 2) + '" text-anchor="end">' + g.eje + '</text>');
    s.push('<text class="gm-letra" x="' + (T.r + 14) + '" y="' + r1(y0 + 4.5) + '">t</text>');
    if (Math.abs(y0 - T.arriba) > 14) {
      s.push('<text class="gm-cero" x="' + (T.l - 6) + '" y="' + r1(y0 + 4) + '" text-anchor="end">0</text>');
    }
    // La curva: rectas (L) y parábolas (Q). Si la gráfica brinca, el brinco va punteado.
    var d = '', saltos = '', antes = null;
    g.piezas.forEach(function (p) {
      if (!antes || Math.abs(p.y0 - antes.y1) > 1e-9) {
        if (antes) saltos += 'M' + X(p.t0) + ',' + Y(antes.y1) + 'V' + Y(p.y0);
        d += 'M' + X(p.t0) + ',' + Y(p.y0);
      }
      if (p.curva) {
        var med = (p.t1 - p.t0) / 2;
        d += 'Q' + X(p.t0 + med) + ',' + Y(p.y0 + p.m0 * med) + ',' + X(p.t1) + ',' + Y(p.y1);
      } else {
        d += 'L' + X(p.t1) + ',' + Y(p.y1);
      }
      antes = p;
    });
    if (saltos) s.push('<path class="gm-salto" d="' + saltos + '"/>');
    s.push('<path class="gm-curva" d="' + d + '"/>');
    s.push('</svg>');
    return s.join('');
  }

  // Firma de la forma ya dibujada (normalizada): dos gráficas que se ven igual comparten firma.
  function firma(g) {
    var e = extremos(g), alto = (e.hi - e.lo) || 1, tmax = g.piezas[g.piezas.length - 1].t1;
    return g.eje + ':' + g.piezas.map(function (p) {
      var n = function (y) { return Math.round((y - e.lo) / alto * 20); };
      return [Math.round(p.t0 / tmax * 20), n(p.y0), n(p.y1), p.curva ? Math.round(p.m0 / alto * tmax * 4) : 'r'].join(',');
    }).join('|');
  }

  function enunciado(texto, svg) {
    return '<span class="gm-pregunta">' + texto + '</span>' + svg;
  }
  function tramo(i) { return 'Tramo ' + (i + 1); }
  // «Tramo 1…4» y «t = 0…7 s» se leen mejor en orden: A es el primero.
  function enOrden(e) {
    var n = function (o) { var m = /^(?:Tramo |t = )(\d+)/.exec(o.val.h); return m ? Number(m[1]) : NaN; };
    if (e.opciones.every(function (o) { return !isNaN(n(o)); })) e.opciones.sort(function (a, b) { return n(a) - n(b); });
    return e;
  }
  function opcionesDeTramos(n, correcto, errores) {
    var falsas = [];
    for (var i = 0; i < n; i++) if (i !== correcto) falsas.push({ h: tramo(i), err: errores[i] });
    return falsas;
  }

  // Posiciones a partir de velocidades y duraciones (tramos rectos), y el x0 que deja
  // todo en x ≥ 0 con un margen opcional.
  function posiciones(vel, dur, x0) {
    var x = [x0];
    vel.forEach(function (v, i) { x.push(x[i] + v * dur[i]); });
    return x;
  }
  function x0Minimo(vel, dur) {
    var x = posiciones(vel, dur, 0);
    return -Math.min.apply(null, x);
  }

  /* ==================================================================
     gm-detenido · ¿En qué tramo está detenido?
     ================================================================== */
  function detenidoX(nivel) {
    var roles, vel, dur, x0, x, intento = 0;
    do {
      roles = barajar(['quieto', 'regresa', 'lento', 'rapido']);
      vel = roles.map(function (r) {
        return r === 'quieto' ? 0 : r === 'regresa' ? -azar([1.5, 2]) : r === 'lento' ? azar([0.75, 1]) : azar([2.5, 3]);
      });
      dur = roles.map(function () { return azar([2, 3]); });
      x0 = x0Minimo(vel, dur) + (nivel === 1 ? 0 : azar([0, 0, 1, 2]));
      x = posiciones(vel, dur, x0);
      var q = roles.indexOf('quieto'), alto = Math.max.apply(null, x);
      intento++;
      // El tramo detenido no puede quedar sobre el eje: ahí no se distinguiría.
      if (x[q] > alto * 0.2) break;
    } while (intento < 40);
    var g = enX(x0, vel.map(function (v, i) { return { d: dur[i], v: v }; }));
    var correcto = roles.indexOf('quieto');
    var errores = roles.map(function (r, i) {
      var n = i + 1, tocaCero = Math.min(x[i], x[i + 1]) < 1e-9;
      if (r === 'regresa') {
        return 'En el tramo ' + n + ' la gráfica baja' + (tocaCero ? ' hasta x = 0' : '') +
          ': x disminuye, así que va de regreso. Bajar no es pararse; detenido es una horizontal.';
      }
      if (tocaCero) {
        return 'El tramo ' + n + ' pasa por x = 0, el origen. Estar en el origen no es estar quieto: ahí x cambia, la gráfica sube.';
      }
      if (r === 'lento') return 'En el tramo ' + n + ' va despacio, pero x sí cambia: la gráfica sube poco, se mueve. Detenido es horizontal.';
      return 'En el tramo ' + n + ' la gráfica sube mucho: x crece rápido, avanza.';
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>posición</b> contra tiempo. ¿En qué tramo está detenido?', svg),
      tramo(correcto), opcionesDeTramos(4, correcto, errores), {
        tema: 'Gráficas x–t', ask: 'Lee la gráfica',
        pasos: ['Detenido quiere decir que x no cambia: en x–t, un tramo horizontal.',
          'El único horizontal es el tramo <b>' + (correcto + 1) + '</b>.']
      }));
  }

  // Plantillas de v–t continuas: [rol, v0, v1] por tramo.
  var DETENIDO_V = [
    [['acelera', 0, 3], ['constante', 3, 3], ['frena', 3, 0], ['quieto', 0, 0]],
    [['quieto', 0, 0], ['acelera', 0, 3], ['constante', 3, 3], ['frena', 3, 1]],
    [['constante', 3, 3], ['frena', 3, 0], ['quieto', 0, 0], ['acelera', 0, 2]],
    [['constante', 2, 2], ['acelera', 2, 4], ['frena', 4, 0], ['quieto', 0, 0]],
    [['frena', 4, 2], ['constante', 2, 2], ['frena', 2, 0], ['quieto', 0, 0]]
  ];
  var DETENIDO_V3 = [
    [['constante', 3, 3], ['frena', 3, 0], ['quieto', 0, 0], ['acelera-', 0, -2]],
    [['acelera-', 0, -2], ['constante-', -2, -2], ['frena-', -2, 0], ['quieto', 0, 0]],
    [['quieto', 0, 0], ['acelera-', 0, -3], ['constante-', -3, -3], ['frena-', -3, -1]],
    [['frena', 2, 0], ['quieto', 0, 0], ['acelera-', 0, -2], ['constante-', -2, -2]]
  ];

  function detenidoV(nivel) {
    var plantilla = azar(nivel === 3 ? DETENIDO_V3.concat(DETENIDO_V.slice(0, 2)) : DETENIDO_V);
    var g = enV(plantilla.map(function (p) { return { d: azar([2, 3]), v0: p[1], v1: p[2] }; }));
    var correcto = -1;
    var errores = plantilla.map(function (p, i) {
      var n = i + 1, rol = p[0];
      if (rol === 'quieto') { correcto = i; return ''; }
      if (rol === 'constante') return 'En el tramo ' + n + ' la gráfica es horizontal, pero no está en el eje: la velocidad no cambia y no es cero. Va a velocidad constante; detenido es estar sobre el eje.';
      if (rol === 'constante-') return 'En el tramo ' + n + ' la gráfica es horizontal, pero abajo del eje: va de regreso a velocidad constante. Detenido es estar sobre el eje.';
      if (rol === 'frena') return 'En el tramo ' + n + ' la velocidad se acerca al cero: frena, pero todavía se mueve. Se detiene cuando llega al eje.';
      if (rol === 'frena-') return 'En el tramo ' + n + ' la velocidad es negativa y se acerca al cero: frena de regreso, pero todavía se mueve.';
      if (rol === 'acelera-') return 'En el tramo ' + n + ' la velocidad es negativa y se aleja del cero: se regresa cada vez más rápido.';
      return 'En el tramo ' + n + ' la velocidad sube: avanza cada vez más rápido.';
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>velocidad</b> contra tiempo. ¿En qué tramo está detenido?', svg),
      tramo(correcto), opcionesDeTramos(plantilla.length, correcto, errores), {
        tema: 'Gráficas v–t', ask: 'Lee la gráfica',
        pasos: ['En v–t, detenido es velocidad cero: la gráfica sobre el eje.',
          'Eso pasa en el tramo <b>' + (correcto + 1) + '</b>. Una horizontal fuera del eje es velocidad constante, no reposo.']
      }));
  }

  function genDetenido(nivel) {
    if (nivel === 1) return detenidoX(nivel);
    return Math.random() < (nivel === 2 ? 0.6 : 0.5) ? detenidoV(nivel) : detenidoX(nivel);
  }

  /* ==================================================================
     gm-rapido · ¿En qué tramo va más rápido?
     ================================================================== */
  function rapidoX(nivel) {
    // Nivel 1: todo hacia adelante; la trampa es el tramo más alto (la altura no es rapidez)
    // y el que más dura. Nivel 2: el más inclinado baja (bajar no es ir lento).
    var roles, vel, dur, x0, x, correcto, alto, largo, intento = 0;
    do {
      roles = barajar(nivel === 1 ? ['rapido', 'medio', 'lento', 'quieto'] : ['rapido-', 'sube', 'lento', 'quieto']);
      vel = roles.map(function (r) {
        return { rapido: 3, 'rapido-': -3, medio: 1.5, sube: 1.5, lento: 0.75, quieto: 0 }[r];
      });
      correcto = roles.indexOf(nivel === 1 ? 'rapido' : 'rapido-');
      dur = roles.map(function (r, i) { return i === correcto ? 2 : azar([2, 3, 3]); });
      x0 = x0Minimo(vel, dur) + azar([0, 0.5, 1]);
      x = posiciones(vel, dur, x0);
      var medios = roles.map(function (r, i) { return (x[i] + x[i + 1]) / 2; });
      alto = medios.indexOf(Math.max.apply(null, medios));
      largo = dur.indexOf(Math.max.apply(null, dur));
      intento++;
    } while (intento < 80 && (alto === correcto || largo === correcto ||
      dur.filter(function (d) { return d === dur[largo]; }).length > 1 ||
      x[roles.indexOf('quieto')] < Math.max.apply(null, x) * 0.2));
    var g = enX(x0, vel.map(function (v, i) { return { d: dur[i], v: v }; }));
    var m = correcto + 1, baja = vel[correcto] < 0;
    var errores = roles.map(function (r, i) {
      var n = i + 1;
      if (r === 'quieto') {
        return 'En el tramo ' + n + ' la gráfica es horizontal: está detenido' +
          (i === alto ? '. Está lejos del origen, pero la altura dice dónde está, no qué tan rápido va.' : ', no va rápido.');
      }
      if (i === alto) return 'El tramo ' + n + ' está más arriba, pero la altura dice dónde está, no qué tan rápido va. La rapidez es la inclinación: el más inclinado es el ' + m + '.';
      if (i === largo) return 'El tramo ' + n + ' es el que más dura, pero no el más inclinado: lo que cuenta es cuánto cambia x en cada segundo.';
      if (baja) return 'El tramo ' + n + ' sube, pero el ' + m + ' está más inclinado aunque baje: bajar quiere decir ir de regreso, no ir lento.';
      return 'El tramo ' + n + ' está menos inclinado que el ' + m + ': va más despacio.';
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>posición</b> contra tiempo. ¿En qué tramo va más rápido?', svg),
      tramo(correcto), opcionesDeTramos(4, correcto, errores), {
        tema: 'Gráficas x–t', ask: 'Lee la gráfica',
        pasos: ['En x–t, qué tan rápido va se ve en la inclinación, suba o baje.',
          'El más inclinado es el tramo <b>' + m + '</b>' + (baja ? ': baja, así que va de regreso, y más rápido que en los demás.' : '.')]
      }));
  }

  function rapidoV() {
    // Escalones de velocidad: el más rápido está abajo del eje; el más alto es la trampa.
    var niveles = barajar([-3, 2, 1, 0]);
    var g = enV(niveles.map(function (v) { return { d: azar([2, 3]), v0: v }; }));
    var correcto = niveles.indexOf(-3), alto = niveles.indexOf(2), m = correcto + 1;
    var errores = niveles.map(function (v, i) {
      var n = i + 1;
      if (v === 0) return 'En el tramo ' + n + ' la velocidad es cero: está detenido.';
      if (i === alto) return 'El tramo ' + n + ' está más arriba, pero el ' + m + ' está más lejos del cero: va más rápido, aunque de regreso.';
      return 'La velocidad del tramo ' + n + ' está más cerca del cero que la del ' + m + ': va más despacio.';
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>velocidad</b> contra tiempo. ¿En qué tramo va más rápido?', svg),
      tramo(correcto), opcionesDeTramos(4, correcto, errores), {
        tema: 'Gráficas v–t', ask: 'Lee la gráfica',
        pasos: ['En v–t, qué tan rápido va es qué tan lejos del cero está la gráfica, arriba o abajo.',
          'El más lejos es el tramo <b>' + m + '</b>, abajo del eje: va de regreso, y es el más rápido.']
      }));
  }

  function genRapido(nivel) {
    if (nivel === 3) return Math.random() < 0.5 ? rapidoV() : rapidoX(2);
    return rapidoX(nivel);
  }

  /* ==================================================================
     gm-regresa · ¿En qué tramo va de regreso? ¿Dónde se da la vuelta?
     ================================================================== */
  function regresaX() {
    var roles, vel, dur, x0, x, intento = 0;
    do {
      roles = barajar(['regresa', 'quieto', 'rapido', 'lento']);
      vel = roles.map(function (r) { return { regresa: -azar([1.5, 2]), quieto: 0, rapido: azar([2.5, 3]), lento: azar([0.75, 1]) }[r]; });
      dur = roles.map(function () { return azar([2, 3]); });
      x0 = x0Minimo(vel, dur) + azar([0, 1, 2]);
      x = posiciones(vel, dur, x0);
      intento++;
    } while (intento < 40 && x[roles.indexOf('quieto')] < Math.max.apply(null, x) * 0.2);
    var g = enX(x0, vel.map(function (v, i) { return { d: dur[i], v: v }; }));
    var correcto = roles.indexOf('regresa'), iRapido = roles.indexOf('rapido');
    var errores = roles.map(function (r, i) {
      var n = i + 1;
      if (r === 'quieto') return 'En el tramo ' + n + ' está detenido: la gráfica es horizontal. Ir de regreso es que x disminuya: que la gráfica baje.';
      if (r === 'lento' && i === iRapido + 1) return 'En el tramo ' + n + ' va más despacio que antes, pero la gráfica sigue subiendo: sigue avanzando. Ir más lento no es regresarse.';
      return 'En el tramo ' + n + ' la gráfica sube: x crece, se aleja.';
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>posición</b> contra tiempo. ¿En qué tramo va de regreso?', svg),
      tramo(correcto), opcionesDeTramos(4, correcto, errores), {
        tema: 'Gráficas x–t', ask: 'Lee la gráfica',
        pasos: ['Ir de regreso es que x disminuya: en x–t, la gráfica baja.',
          'Sólo baja en el tramo <b>' + (correcto + 1) + '</b>.']
      }));
  }

  var REGRESA_V = [
    [['acelera', 0, 3], ['frena', 3, 1], ['cruza', 1, -2], ['constante-', -2, -2]],
    [['acelera', 0, 3], ['cruza', 3, -1], ['acelera-', -1, -3], ['constante-', -3, -3]],
    [['frena', 3, 1], ['constante', 1, 1], ['cruza', 1, -2], ['acelera-', -2, -3]],
    [['constante', 2, 2], ['acelera', 2, 3], ['cruza', 3, -1], ['frena-', -1, 0]],
    [['acelera', 1, 3], ['constante', 3, 3], ['frena', 3, 1], ['cruza', 1, -2]]
  ];

  function regresaV() {
    var plantilla = azar(REGRESA_V);
    var g = enV(plantilla.map(function (p) { return { d: azar([2, 3]), v0: p[1], v1: p[2] }; }));
    var correcto = -1;
    var errores = plantilla.map(function (p, i) {
      var n = i + 1;
      switch (p[0]) {
        case 'cruza': correcto = i; return '';
        case 'frena': return 'En el tramo ' + n + ' frena, pero la velocidad sigue arriba del eje: sigue avanzando. Se da la vuelta donde la gráfica cruza el eje.';
        case 'constante-': return 'En el tramo ' + n + ' ya va de regreso, a velocidad constante: la vuelta la dio antes, cuando la gráfica cruzó el eje.';
        case 'acelera-': return 'En el tramo ' + n + ' va de regreso cada vez más rápido: la vuelta fue antes, al cruzar el eje.';
        case 'frena-': return 'En el tramo ' + n + ' frena de regreso hasta detenerse: llega al eje, pero no lo cruza.';
        case 'acelera': return 'En el tramo ' + n + ' la velocidad sube: avanza cada vez más rápido.';
        default: return 'En el tramo ' + n + ' va a velocidad constante hacia adelante: la gráfica está arriba del eje.';
      }
    });
    var svg = dibuja(g, 'grande', { tramos: true });
    return enOrden(F.armar(enunciado('Gráfica de <b>velocidad</b> contra tiempo. ¿En qué tramo se da la vuelta?', svg),
      tramo(correcto), opcionesDeTramos(4, correcto, errores), {
        tema: 'Gráficas v–t', ask: 'Lee la gráfica',
        pasos: ['Darse la vuelta es cambiar de sentido: la velocidad pasa de positiva a negativa.',
          'En v–t eso es cruzar el eje, y pasa en el tramo <b>' + (correcto + 1) + '</b>.']
      }));
  }

  function instante(t) { return 't = ' + t + ' s'; }

  // Nivel 3: el instante de la vuelta. En x–t es la cima; en v–t, donde se cruza el eje.
  // Las trampas son las de siempre: en x–t, cruzar el eje (pasar por el origen); en v–t, la cima.
  function regresaInstante() {
    var marcas, g, correcta, falsas, pasos, texto;
    if (Math.random() < 0.5) {
      var tp = azar([2, 3]), c = azar([1, 1.5, 2]), fin = 2 * tp + 1;
      // x = c·t·(2tp − t): sale del origen, llega a la cima en tp, vuelve al origen en 2tp.
      g = enX(0, [{ d: fin, v0: 2 * c * tp, v1: 2 * c * (tp - fin) }]);
      correcta = instante(tp);
      falsas = [
        { h: instante(2 * tp), err: 'En t = ' + 2 * tp + ' s la gráfica cruza el eje: pasa por el origen, x = 0, y sigue de largo. La vuelta fue antes, en la cima.' },
        { h: instante(0), err: 'En t = 0 apenas sale del origen y empieza a subir.' },
        { h: instante(fin), err: 'En t = ' + fin + ' s va de regreso, y rápido; la vuelta fue en la cima, donde la gráfica deja de subir.' }
      ];
      texto = 'Gráfica de <b>posición</b> contra tiempo (en segundos). ¿En qué instante se da la vuelta?';
      pasos = ['En x–t, darse la vuelta es pasar de subir a bajar: la cima de la curva.',
        'La cima está en <b>t = ' + tp + ' s</b>; ahí la velocidad vale cero un instante.'];
    } else {
      var t1 = azar([1, 2]), tc = t1 + azar([2, 3]), tf = tc + azar([1, 2]), vmax = azar([2, 3]);
      var baja = vmax / (tc - t1);
      g = enV([{ d: t1, v0: 0, v1: vmax }, { d: tf - t1, v0: vmax, v1: vmax - baja * (tf - t1) }]);
      correcta = instante(tc);
      falsas = [
        { h: instante(t1), err: 'En t = ' + t1 + ' s la velocidad es la más alta: ahí va más rápido. En v–t la cima no es la vuelta; eso es en x–t.' },
        { h: instante(0), err: 'En t = 0 la velocidad vale cero porque apenas arranca: luego avanza. Darse la vuelta es pasar de positiva a negativa.' },
        { h: instante(tf), err: 'En t = ' + tf + ' s ya va de regreso desde antes; la vuelta fue cuando la gráfica cruzó el eje.' }
      ];
      texto = 'Gráfica de <b>velocidad</b> contra tiempo (en segundos). ¿En qué instante se da la vuelta?';
      pasos = ['En v–t, darse la vuelta es que la velocidad pase de positiva a negativa: la gráfica cruza el eje.',
        'Cruza en <b>t = ' + tc + ' s</b>.'];
    }
    var tmax = g.piezas[g.piezas.length - 1].t1;
    marcas = [];
    for (var t = 0; t <= tmax; t++) marcas.push(t);
    var svg = dibuja(g, 'grande', { marcas: marcas });
    return enOrden(F.armar(enunciado(texto, svg), correcta, falsas, {
      tema: g.eje === 'x' ? 'Gráficas x–t' : 'Gráficas v–t', ask: 'Lee la gráfica', pasos: pasos
    }));
  }

  function genRegresa(nivel) {
    if (nivel === 1) return regresaX();
    if (nivel === 2) return Math.random() < 0.5 ? regresaV() : regresaX();
    return Math.random() < 0.6 ? regresaInstante() : regresaV();
  }

  /* ==================================================================
     gm-acelera · ¿Qué hace? Avanza o se regresa; acelera, frena o va parejo
     ================================================================== */
  var QUE = {
    AA: 'Avanza y acelera', AF: 'Avanza y frena', AC: 'Avanza a velocidad constante', DT: 'Está detenido',
    RA: 'Se regresa y acelera', RF: 'Se regresa y frena', RC: 'Se regresa a velocidad constante',
    CU: 'Sube una cuesta', CP: 'Va por un camino plano', CB: 'Baja una cuesta'
  };
  var CAMINO = 'La gráfica no es el camino: el eje de abajo es el tiempo. ';

  // Para cada forma: la respuesta, lo que se ve y las confusiones reales con su explicación.
  var FORMAS = {
    x: {
      acelera: { bien: 'AA', se: 'La curva sube y se empina: cada segundo avanza más.', mal: {
        AF: 'Frenar se vería al revés: la curva se aplanaría. Aquí cada segundo avanza más que en el anterior.',
        AC: 'Con velocidad constante sería una recta; ésta se curva y se empina.',
        DT: 'Detenido sería una horizontal: aquí x cambia todo el tiempo.',
        CU: CAMINO + 'Que se empine quiere decir que cada segundo avanza más.',
        RA: 'La gráfica sube: x crece, así que avanza; no se regresa.' } },
      frena: { bien: 'AF', se: 'La curva sube, pero se aplana: cada segundo avanza menos.', mal: {
        AA: 'La gráfica sube, pero cada vez menos: cada segundo avanza menos que en el anterior. Subir no es acelerar.',
        AC: 'Una recta sería velocidad constante; ésta se aplana.',
        RF: 'Para regresarse la gráfica tendría que bajar; aquí sigue subiendo, cada vez menos.',
        CP: CAMINO + 'Que se aplane quiere decir que avanza cada vez menos en cada segundo.',
        DT: 'Todavía sube: no está detenido; se detendría al quedar horizontal.' } },
      constante: { bien: 'AC', se: 'Es una recta que sube: avanza lo mismo cada segundo.', mal: {
        AA: 'Que la gráfica suba no es acelerar: sube lo mismo cada segundo, así que la velocidad no cambia.',
        CU: CAMINO + 'Una recta inclinada en x–t es avanzar lo mismo cada segundo.',
        DT: 'Detenido sería una horizontal; aquí x crece.',
        AF: 'Frenar es que la gráfica se aplane; ésta es recta.' } },
      quieto: { bien: 'DT', se: 'Es horizontal: x no cambia.', mal: {
        AC: 'Horizontal es velocidad constante en una gráfica v–t. En x–t quiere decir que x no cambia: está detenido.',
        CP: CAMINO + 'Una horizontal en x–t quiere decir que no se mueve.',
        AF: 'Para frenar tendría que moverse; aquí x no cambia.',
        RC: 'Para regresarse la gráfica tendría que bajar; aquí x no cambia.' } },
      'acelera-': { bien: 'RA', se: 'Baja, así que va de regreso, y se empina: cada segundo retrocede más.', mal: {
        AF: 'Que la gráfica baje no es frenar: x disminuye, va de regreso; y como se empina, cada vez más rápido.',
        RF: 'Al revés: la curva se empina hacia abajo; cada segundo retrocede más.',
        RC: 'A velocidad constante sería una recta; ésta se curva.',
        CB: CAMINO + 'Que baje quiere decir que va de regreso.',
        AA: 'La gráfica baja: x disminuye, así que no avanza; se regresa.' } },
      'frena-': { bien: 'RF', se: 'Baja, así que va de regreso, y se aplana: cada segundo retrocede menos.', mal: {
        RA: 'Al revés: la curva se aplana; cada segundo retrocede menos.',
        AF: 'La gráfica baja: x disminuye, así que va de regreso, no hacia adelante.',
        RC: 'A velocidad constante sería una recta; ésta se aplana.',
        CB: CAMINO + 'Que baje quiere decir que va de regreso.',
        DT: 'Todavía baja: se mueve; se detendría al quedar horizontal.' } },
      'constante-': { bien: 'RC', se: 'Es una recta que baja: retrocede lo mismo cada segundo.', mal: {
        AF: 'Que la gráfica baje no es frenar: x disminuye lo mismo cada segundo; va de regreso a velocidad constante.',
        RA: 'Una recta no se empina: la velocidad no cambia.',
        CB: CAMINO + 'Que baje quiere decir que va de regreso.',
        DT: 'Detenido sería una horizontal; aquí x disminuye.' } }
    },
    v: {
      acelera: { bien: 'AA', se: 'Arriba del eje y se aleja del cero.', mal: {
        AC: 'En v–t, una recta que sube es velocidad que aumenta. Velocidad constante sería una horizontal; la recta que sube es de x–t.',
        CU: CAMINO + 'Aquí la altura es la velocidad, y sube: va cada vez más rápido.',
        AF: 'Frenar es que la velocidad se acerque al cero; aquí se aleja.',
        DT: 'La velocidad no es cero: se mueve.',
        RA: 'La velocidad es positiva, arriba del eje: avanza.' } },
      frena: { bien: 'AF', se: 'Arriba del eje y se acerca al cero.', mal: {
        RF: 'La velocidad baja, pero sigue arriba del eje: sigue avanzando. Se regresaría hasta que cruzara el cero.',
        CB: CAMINO + 'Aquí la altura es la velocidad, y se acerca al cero: frena.',
        AA: 'Se acerca al cero: va cada vez más lento.',
        AC: 'Velocidad constante sería una horizontal; aquí la velocidad baja.' } },
      constante: { bien: 'AC', se: 'Horizontal arriba del eje.', mal: {
        DT: 'Horizontal es detenido en una gráfica x–t. En v–t quiere decir que la velocidad no cambia: va siempre igual de rápido.',
        CP: CAMINO + 'En v–t, una horizontal es velocidad que no cambia.',
        AA: 'Para acelerar la velocidad tendría que alejarse del cero; aquí no cambia.',
        AF: 'Para frenar la velocidad tendría que acercarse al cero; aquí no cambia.' } },
      quieto: { bien: 'DT', se: 'Sobre el eje: la velocidad es cero.', mal: {
        AC: 'Avanzar a velocidad constante sería una horizontal arriba del eje. Ésta está en el eje: velocidad cero.',
        CP: CAMINO + 'Estar sobre el eje en v–t es velocidad cero.',
        AF: 'Para frenar tendría que moverse; aquí la velocidad es cero todo el tiempo.',
        RC: 'Para regresarse la velocidad sería negativa, abajo del eje.' } },
      'acelera-': { bien: 'RA', se: 'Abajo del eje y se aleja del cero.', mal: {
        AF: 'Que la gráfica baje no es frenar: la velocidad es negativa, va de regreso, y se aleja del cero: cada vez más rápido.',
        RF: 'Al revés: se aleja del cero, la rapidez aumenta.',
        CB: CAMINO + 'Aquí la altura es la velocidad: abajo del eje va de regreso.',
        AA: 'La velocidad es negativa, abajo del eje: no avanza, se regresa.' } },
      'frena-': { bien: 'RF', se: 'Abajo del eje y se acerca al cero.', mal: {
        AA: 'Que la gráfica suba no es acelerar: la velocidad es negativa, va de regreso, y se acerca al cero: frena.',
        RA: 'Al revés: se acerca al cero, cada vez más lento.',
        CU: CAMINO + 'Aquí la altura es la velocidad: abajo del eje va de regreso.',
        AC: 'La velocidad cambia y es negativa: ni es constante ni avanza.' } },
      'constante-': { bien: 'RC', se: 'Horizontal abajo del eje.', mal: {
        DT: 'Horizontal no es detenido en v–t: la velocidad no cambia, y es negativa: se regresa siempre igual de rápido.',
        AC: 'La velocidad es negativa, abajo del eje: va de regreso, no hacia adelante.',
        CP: CAMINO + 'En v–t, una horizontal es velocidad que no cambia.',
        RF: 'Para frenar la velocidad tendría que acercarse al cero; aquí no cambia.' } }
    }
  };
  var RESPUESTA = { AA: 'avanza y acelera', AF: 'avanza y frena', AC: 'avanza a velocidad constante', DT: 'está detenido',
    RA: 'se regresa y acelera', RF: 'se regresa y frena', RC: 'se regresa a velocidad constante' };

  // Una forma suelta, como gráfica completa.
  function formaSola(eje, nombre) {
    var a = azar([0.3, 0.5]), b = azar([2.5, 3]);
    if (eje === 'x') {
      switch (nombre) {
        case 'acelera': return enX(0, [{ d: 4, v0: a, v1: b }]);
        case 'frena': return enX(0, [{ d: 4, v0: b, v1: a }]);
        case 'constante': return enX(azar([0, 1]), [{ d: 4, v: azar([1.5, 2]) }]);
        case 'quieto': return enX(3, [{ d: 4, v: 0 }]);
        case 'acelera-': return enX(8, [{ d: 4, v0: -a, v1: -b }]);
        case 'frena-': return enX(8, [{ d: 4, v0: -b, v1: -a }]);
        default: return enX(azar([8, 9]), [{ d: 4, v: -azar([1.5, 2]) }]);
      }
    }
    switch (nombre) {
      case 'acelera': return enV([{ d: 4, v0: a, v1: b }]);
      case 'frena': return enV([{ d: 4, v0: b, v1: a }]);
      case 'constante': return enV([{ d: 4, v0: azar([2, 3]) }]);
      case 'quieto': return enV([{ d: 4, v0: 0 }]);
      case 'acelera-': return enV([{ d: 4, v0: -a, v1: -b }]);
      case 'frena-': return enV([{ d: 4, v0: -b, v1: -a }]);
      default: return enV([{ d: 4, v0: -azar([2, 3]) }]);
    }
  }

  // Historias de tres tramos con velocidad continua: [forma, v0, v1] por tramo.
  var HISTORIAS_ACELERA = [
    [['acelera', 0, 3], ['constante', 3, 3], ['frena', 3, 0]],
    [['constante', 2, 2], ['frena', 2, 0], ['acelera-', 0, -2]],
    [['frena', 3, 0], ['quieto', 0, 0], ['acelera-', 0, -2]],
    [['acelera-', 0, -3], ['constante-', -3, -3], ['frena-', -3, 0]],
    [['quieto', 0, 0], ['acelera', 0, 3], ['frena', 3, 1]],
    [['constante', 3, 3], ['frena', 3, 0], ['quieto', 0, 0]]
  ];

  function genAcelera(nivel) {
    var eje, nombre, g, texto, extra = {}, cual = '';
    if (nivel < 3) {
      eje = nivel === 1 ? 'x' : azar(['x', 'v', 'v']);
      nombre = azar(['acelera', 'frena', 'constante', 'quieto']);
      g = formaSola(eje, nombre);
      texto = 'Gráfica de <b>' + nombreEje(eje) + '</b> contra tiempo. ¿Qué hace el objeto?';
    } else {
      eje = azar(['x', 'v']);
      var h = azar(HISTORIAS_ACELERA), k = Math.floor(Math.random() * 3);
      nombre = h[k][0];
      var tramos = h.map(function (p) { return { d: azar([2, 3]), v0: p[1], v1: p[2] }; });
      if (eje === 'x') {
        // En x–t, una velocidad constante es recta y una que cambia es curva.
        g = enX(0, tramos.map(function (s) { return s.v0 === s.v1 ? { d: s.d, v: s.v0 } : s; }));
        var lo = extremos(g).lo;
        if (lo < 0) g = enX(-lo + 1, tramos.map(function (s) { return s.v0 === s.v1 ? { d: s.d, v: s.v0 } : s; }));
      } else {
        g = enV(tramos);
      }
      extra.tramos = true;
      cual = ' en el tramo ' + (k + 1);
      texto = 'Gráfica de <b>' + nombreEje(eje) + '</b> contra tiempo. ¿Qué hace en el tramo ' + (k + 1) + '?';
    }
    var f = FORMAS[eje][nombre];
    var falsas = Object.keys(f.mal).map(function (c) { return { h: QUE[c], err: f.mal[c] }; });
    var svg = dibuja(g, 'grande', extra);
    return F.armar(enunciado(texto, svg), QUE[f.bien], falsas, {
      tema: eje === 'x' ? 'Gráficas x–t' : 'Gráficas v–t', ask: 'Lee la gráfica',
      pasos: [eje === 'x' ? 'En x–t la inclinación es la velocidad.' : 'En v–t la altura es la velocidad.',
        (cual ? mayuscula(cual.trim()) + ': ' + f.se.charAt(0).toLowerCase() + f.se.slice(1) : f.se),
        'Entonces <b>' + RESPUESTA[f.bien] + '</b>.']
    });
  }

  /* ==================================================================
     gm-historia · ¿Qué gráfica cuenta esta historia?
     ================================================================== */
  var VEL_COMO_X = 'Ésa tiene la forma de la gráfica de velocidad: dice qué tan rápido va, no dónde está.';
  var X_COMO_VEL = 'Ésa tiene la forma de la gráfica de posición: dice dónde está, no qué tan rápido va.';

  function historiasX() {
    return [
      { nivel: 1, texto: 'Un camión avanza parejo por la carretera y luego se detiene en una caseta.',
        pasos: ['Avanzar parejo es una recta que sube; detenerse, una horizontal.', 'Es la que sube en recta y luego se queda plana.'],
        bien: enX(0, [{ d: 4, v: 2 }, { d: 3, v: 0 }]), mal: [
          { g: comoEje(enV([{ d: 4, v0: 2 }, { d: 3, v0: 0 }]), 'x'), err: VEL_COMO_X + ' En x–t, avanzar parejo es una recta que sube, y detenerse, una horizontal.' },
          { g: enX(0, [{ d: 4, v: 2 }, { d: 3, v: -2 }]), err: 'Al final la gráfica baja: el camión se regresaría. Detenerse es que x ya no cambie: una horizontal.' },
          { g: enX(2, [{ d: 3, v: 0 }, { d: 4, v: 2 }]), err: 'Está al revés: empieza detenido y después avanza.' },
          { g: enX(0, [{ d: 4, v0: 0, v1: 4 }, { d: 3, v: 0 }]), err: 'La primera parte se empina: el camión iría cada vez más rápido, y la historia dice que va parejo.' }] },
      { nivel: 1, texto: 'Un niño corre a la tienda, se queda un rato y regresa a su casa caminando, más despacio.',
        pasos: ['Ir a la tienda: sube. Quedarse: horizontal. Regresar a su casa: baja hasta donde empezó.', 'De ida corre (más inclinada); de regreso camina (menos inclinada).'],
        bien: enX(0, [{ d: 2, v: 3 }, { d: 2, v: 0 }, { d: 4, v: -1.5 }]), mal: [
          { g: enX(0, [{ d: 2, v: 3 }, { d: 2, v: 0 }, { d: 2, v: 3 }]), err: 'Al final la gráfica sube: seguiría alejándose de su casa. Regresar es que x disminuya, que la gráfica baje.' },
          { g: enX(0, [{ d: 4, v: 1.5 }, { d: 2, v: 0 }, { d: 2, v: -3 }]), err: 'Está al revés: a la ida va rápido (más inclinada) y al regreso, despacio.' },
          { g: comoEje(enV([{ d: 2, v0: 3 }, { d: 2, v0: 0 }, { d: 4, v0: -1.5 }]), 'x'), err: VEL_COMO_X },
          { g: enX(0, [{ d: 2, v: 3 }, { d: 4, v: -1.5 }, { d: 2, v: 0 }]), err: 'Ahí regresa sin quedarse en la tienda y luego se queda quieto en su casa: el orden no es el de la historia.' }] },
      { nivel: 1, texto: 'Un ciclista sube una loma despacio y la baja rápido, siempre hacia adelante.',
        pasos: ['Siempre va hacia adelante: la gráfica sólo sube. No es el dibujo de la loma.', 'Primero despacio (poco inclinada) y luego rápido (más inclinada).'],
        bien: enX(0, [{ d: 4, v: 1 }, { d: 3, v: 3 }]), mal: [
          { g: enX(0, [{ d: 4, v: 2 }, { d: 4, v: -2 }]), err: 'Dibujaste la loma: la gráfica no es el camino. Como siempre va hacia adelante, x sólo crece; al bajar la loma va más rápido y la gráfica se empina.' },
          { g: enX(0, [{ d: 3, v: 3 }, { d: 4, v: 1 }]), err: 'Está al revés: primero va despacio (menos inclinada) y luego rápido.' },
          { g: enX(0, [{ d: 7, v: 2 }]), err: 'Una sola recta es ir siempre igual de rápido; aquí primero va despacio y luego rápido.' },
          { g: enX(0, [{ d: 4, v: 1 }, { d: 3, v: 0 }]), err: 'La segunda parte es horizontal: estaría detenido.' }] },
      { nivel: 2, texto: 'Un auto espera en un alto y luego arranca, cada vez más rápido.',
        pasos: ['Esperar en el alto: horizontal.', 'Arrancar cada vez más rápido: una curva que sube y se empina.'],
        bien: enX(3, [{ d: 3, v: 0 }, { d: 4, v0: 0, v1: 4 }]), mal: [
          { g: enX(3, [{ d: 3, v: 0 }, { d: 4, v: 2 }]), err: 'Una recta es velocidad constante. Si va cada vez más rápido, la curva se empina.' },
          { g: enX(3, [{ d: 3, v: 0 }, { d: 4, v0: 4, v1: 0 }]), err: 'Esa curva se aplana: iría cada vez más lento.' },
          { g: enX(3, [{ d: 4, v0: 0, v1: 4 }, { d: 3, v: 0 }]), err: 'Está al revés: primero arranca y después se queda detenido.' },
          { g: enX(11, [{ d: 3, v: 0 }, { d: 4, v0: 0, v1: -4 }]), err: 'La curva baja: el auto iría de reversa. Arrancar hacia adelante es que la gráfica suba.' }] },
      { nivel: 2, texto: 'Una pelota rueda por el piso cada vez más despacio, hasta que se para.',
        pasos: ['Frenar poco a poco: la curva sube, pero se aplana.', 'Al pararse queda horizontal.'],
        bien: enX(0, [{ d: 4, v0: 4, v1: 0 }, { d: 3, v: 0 }]), mal: [
          { g: enX(8, [{ d: 4, v: -2 }, { d: 3, v: 0 }]), err: 'Que la gráfica baje es ir de regreso. Frenar es que se aplane hasta quedar horizontal.' },
          { g: enX(0, [{ d: 4, v: 2 }, { d: 3, v: 0 }]), err: 'Así iría pareja y se pararía de golpe; la historia dice que frena poco a poco: la curva se aplana.' },
          { g: enX(0, [{ d: 4, v0: 0, v1: 4 }, { d: 3, v: 0 }]), err: 'Esa curva se empina: iría cada vez más rápido.' },
          { g: comoEje(enV([{ d: 4, v0: 4, v1: 0 }, { d: 3, v0: 0 }]), 'x'), err: VEL_COMO_X + ' En x–t, frenar hasta pararse es una curva que se aplana.' }] },
      { nivel: 2, texto: 'Un corredor sale rápido, luego va más despacio y al final se detiene a descansar.',
        pasos: ['Rápido y luego despacio: una recta muy inclinada y después otra menos inclinada.', 'Descansar es quedarse en el mismo lugar: horizontal.'],
        bien: enX(0, [{ d: 3, v: 3 }, { d: 3, v: 1 }, { d: 2, v: 0 }]), mal: [
          { g: enX(0, [{ d: 3, v: 1 }, { d: 3, v: 3 }, { d: 2, v: 0 }]), err: 'Está al revés: primero va rápido (más inclinada) y luego despacio.' },
          { g: enX(0, [{ d: 3, v: 3 }, { d: 3, v: 1 }, { d: 2, v: -2 }]), err: 'Al final la gráfica baja: se regresaría. Descansar es quedarse en el mismo lugar: horizontal.' },
          { g: comoEje(enV([{ d: 3, v0: 3 }, { d: 3, v0: 1 }, { d: 2, v0: 0 }]), 'x'), err: VEL_COMO_X + ' En x–t, ir rápido y luego despacio son dos rectas, la segunda menos inclinada.' },
          { g: enX(0, [{ d: 6, v: 2 }, { d: 2, v: 0 }]), err: 'Ahí va igual de rápido todo el tiempo: la inclinación no cambia antes de detenerse.' }] }
    ];
  }

  function historiasV() {
    return [
      { nivel: 2, texto: 'Un auto arranca en un semáforo, acelera y luego sigue parejo.',
        pasos: ['Arrancar y acelerar: la velocidad sube desde el cero.', 'Seguir parejo: una horizontal arriba del eje.'],
        bien: enV([{ d: 3, v0: 0, v1: 4 }, { d: 4, v0: 4 }]), mal: [
          { g: comoEje(enX(0, [{ d: 3, v0: 0, v1: 4 }, { d: 4, v: 4 }]), 'v'), err: X_COMO_VEL + ' En v–t, seguir parejo es una horizontal.' },
          { g: enV([{ d: 4, v0: 4 }, { d: 3, v0: 4, v1: 0 }]), err: 'Está al revés: empieza rápido y al final frena.' },
          { g: enV([{ d: 3, v0: 0, v1: 4 }, { d: 4, v0: 4, v1: 0 }]), err: 'Al final la velocidad baja: frenaría. Seguir parejo es que la velocidad no cambie: una horizontal.' },
          { g: enV([{ d: 3, v0: 0 }, { d: 4, v0: 0, v1: 4 }]), err: 'Al final la velocidad sigue subiendo: nunca va parejo.' }] },
      { nivel: 2, texto: 'Un tren frena poco a poco hasta detenerse en la estación, y ahí se queda.',
        pasos: ['Frenar poco a poco: la velocidad baja en recta hasta el eje.', 'Quedarse detenido: sobre el eje.'],
        bien: enV([{ d: 4, v0: 4, v1: 0 }, { d: 3, v0: 0 }]), mal: [
          { g: enV([{ d: 4, v0: 4, v1: 0 }, { d: 3, v0: 0, v1: -3 }]), err: 'Al final la velocidad es negativa: el tren se regresaría. Detenerse es llegar al eje y quedarse ahí.' },
          { g: enV([{ d: 4, v0: 0, v1: 4 }, { d: 3, v0: 4 }]), err: 'Ésa es la de un tren que arranca: la velocidad sube.' },
          { g: enV([{ d: 4, v0: 4 }, { d: 3, v0: 0 }]), err: 'Así se detendría de golpe; la historia dice que frena poco a poco: la velocidad baja poco a poco hasta el eje.' },
          { g: comoEje(enX(0, [{ d: 4, v0: 4, v1: 0 }, { d: 3, v: 0 }]), 'v'), err: X_COMO_VEL + ' En v–t, frenar es una recta que baja hacia el eje.' }] },
      { nivel: 2, texto: 'Lanzas una pelota hacia arriba (arriba es positivo): sube frenando, se para un instante y baja acelerando.',
        pasos: ['Al subir, la velocidad es positiva y se acerca al cero; al bajar, es negativa y se aleja.', 'Es una sola recta que cruza el eje: ahí se para un instante.'],
        bien: enV([{ d: 3, v0: 3, v1: 0 }, { d: 3, v0: 0, v1: -3 }]), mal: [
          { g: enV([{ d: 3, v0: 3, v1: 0 }, { d: 3, v0: 0, v1: 3 }]), err: 'Al bajar, la pelota va hacia abajo: su velocidad es negativa. La gráfica sigue de largo y cruza el eje; no rebota hacia arriba.' },
          { g: comoEje(enX(0, [{ d: 3, v0: 3, v1: 0 }, { d: 3, v0: 0, v1: -3 }]), 'v'), err: X_COMO_VEL + ' En v–t la velocidad baja parejo: es una recta que cruza el eje.' },
          { g: enV([{ d: 3, v0: 3, v1: 0 }, { d: 3, v0: 0 }]), err: 'Así se quedaría quieta allá arriba; la historia dice que baja.' },
          { g: enV([{ d: 3, v0: -3, v1: 0 }, { d: 3, v0: 0, v1: 3 }]), err: 'Está al revés: al subir la velocidad es positiva, arriba del eje.' }] },
      { nivel: 2, texto: 'Una señora camina hacia el mercado, se para a comprar y regresa igual de rápido.',
        pasos: ['Ida: horizontal arriba del eje. Compra: sobre el eje.', 'Regreso igual de rápido: horizontal abajo del eje, a la misma distancia del cero.'],
        bien: enV([{ d: 3, v0: 2 }, { d: 2, v0: 0 }, { d: 3, v0: -2 }]), mal: [
          { g: enV([{ d: 3, v0: 2 }, { d: 2, v0: 0 }, { d: 3, v0: 2 }]), err: 'Al regresar va hacia el lado negativo: su velocidad es negativa, abajo del eje.' },
          { g: comoEje(enX(0, [{ d: 3, v: 2 }, { d: 2, v: 0 }, { d: 3, v: -2 }]), 'v'), err: X_COMO_VEL + ' En v–t, caminar parejo es una horizontal: arriba del eje a la ida y abajo al regreso.' },
          { g: enV([{ d: 3, v0: -2 }, { d: 2, v0: 0 }, { d: 3, v0: 2 }]), err: 'Está al revés: a la ida la velocidad es positiva, arriba del eje.' },
          { g: enV([{ d: 3, v0: 2 }, { d: 2, v0: 0 }, { d: 1.5, v0: -4 }]), err: 'Al regresar la velocidad está más lejos del cero que a la ida: regresaría más rápido.' }] },
      { nivel: 3, texto: 'Una moto va parejo y luego acelera para rebasar a un camión.',
        pasos: ['Ir parejo: horizontal arriba del eje.', 'Acelerar: la velocidad sube poco a poco, una recta que sube.'],
        bien: enV([{ d: 3, v0: 2 }, { d: 3, v0: 2, v1: 5 }]), mal: [
          { g: comoEje(enX(0, [{ d: 3, v: 2 }, { d: 3, v0: 2, v1: 5 }]), 'v'), err: X_COMO_VEL + ' En v–t, ir parejo es una horizontal y acelerar, una recta que sube.' },
          { g: enV([{ d: 3, v0: 2 }, { d: 3, v0: 2, v1: 0 }]), err: 'Al final la velocidad baja: frenaría.' },
          { g: enV([{ d: 3, v0: 2, v1: 5 }, { d: 3, v0: 5 }]), err: 'Está al revés: primero acelera y luego va parejo.' },
          { g: enV([{ d: 3, v0: 2 }, { d: 3, v0: 5 }]), err: 'Así cambiaría de velocidad de golpe; acelerar toma tiempo: la velocidad sube poco a poco.' }] }
    ];
  }

  function elegirFalsas(bien, mal, cuantas) {
    var vistas = {};
    vistas[firma(bien)] = true;
    var elegidas = [];
    barajar(mal).forEach(function (m) {
      var f = firma(m.g);
      if (elegidas.length < cuantas && !vistas[f]) { vistas[f] = true; elegidas.push(m); }
    });
    return elegidas;
  }

  // La gráfica que se pide va en la instrucción (meta.ask); el enunciado es sólo la historia.
  function historiaConOpciones(h, eje) {
    var falsas = elegirFalsas(h.bien, h.mal, 3).map(function (m) { return { h: dibuja(m.g, 'chica'), err: m.err }; });
    return F.armar(enunciado(h.texto, ''), dibuja(h.bien, 'chica'), falsas, {
      tema: 'Historias y gráficas',
      ask: eje === 'x' ? 'Elige su gráfica de posición' : 'Elige su gráfica de velocidad',
      pasos: h.pasos.slice()
    });
  }

  // Nivel 3: de x–t a v–t. Cada recta de x–t es una horizontal en v–t, a la altura de su inclinación.
  var PAREJAS = [[2, 0, -1], [-1, 0, 2], [1, 3, 0], [0, 2, -1], [3, 1, -2], [0, -2, 1], [2, -1, 0]];

  function deXaV() {
    var vel = azar(PAREJAS), dur = vel.map(function () { return azar([2, 3]); });
    var x0 = x0Minimo(vel, dur) + azar([0, 1]);
    var gx = enX(x0, vel.map(function (v, i) { return { d: dur[i], v: v }; }));
    var bien = enV(vel.map(function (v, i) { return { d: dur[i], v0: v }; }));
    var mal = [{ g: comoEje(gx, 'v'), err: 'Copiaste la forma de la gráfica de posición. En v–t va la inclinación de cada tramo: cada recta de x–t es una horizontal.' }];
    if (vel.some(function (v) { return v < 0; })) {
      mal.push({ g: enV(vel.map(function (v, i) { return { d: dur[i], v0: Math.abs(v) }; })), err: 'Donde x baja, el objeto va de regreso: su velocidad es negativa, abajo del eje.' });
    }
    var q = vel.indexOf(0);
    if (q !== -1) {
      var vecino = q > 0 ? vel[q - 1] : vel[q + 1];
      mal.push({ g: enV(vel.map(function (v, i) { return { d: dur[i], v0: i === q ? vecino : v }; })), err: 'Donde la gráfica x–t es horizontal, el objeto está quieto: su velocidad es cero, sobre el eje.' });
    }
    var moviles = vel.map(function (v, i) { return i; }).filter(function (i) { return vel[i] !== 0; });
    if (moviles.length === 2 && Math.abs(vel[moviles[0]]) !== Math.abs(vel[moviles[1]])) {
      var cambia = vel.slice(), a = moviles[0], b = moviles[1];
      cambia[a] = Math.sign(vel[a]) * Math.abs(vel[b]);
      cambia[b] = Math.sign(vel[b]) * Math.abs(vel[a]);
      mal.push({ g: enV(cambia.map(function (v, i) { return { d: dur[i], v0: v }; })), err: 'El tramo más inclinado de x–t es el más rápido: su velocidad debe estar más lejos del cero.' });
    }
    mal.push({ g: enV(vel.map(function (v, i) { return { d: dur[i], v0: -v }; })), err: 'Está al revés: donde x sube, la velocidad es positiva, arriba del eje.' });
    var falsas = elegirFalsas(bien, mal, 3).map(function (m) { return { h: dibuja(m.g, 'chica'), err: m.err }; });
    return F.armar(enunciado('Ésta es la gráfica de <b>posición</b> de un objeto. ¿Cuál es su gráfica de <b>velocidad</b>?', dibuja(gx, 'grande', { tramos: true })),
      dibuja(bien, 'chica'), falsas, {
        tema: 'Historias y gráficas', ask: 'Elige su gráfica de velocidad',
        pasos: ['Cada recta de x–t es una velocidad constante: en v–t, una horizontal.',
          'Sube: arriba del eje; baja: abajo; plana: en el eje. Más inclinada: más lejos del cero.']
      });
  }

  function genHistoria(nivel) {
    if (nivel === 3 && Math.random() < 0.5) return deXaV();
    var eje = nivel === 1 ? 'x' : nivel === 2 ? azar(['x', 'v']) : 'v';
    var lista = (eje === 'x' ? historiasX() : historiasV()).filter(function (h) { return h.nivel <= nivel; });
    return historiaConOpciones(azar(lista), eje);
  }

  M.GENERADORES['gm-detenido'] = genDetenido;
  M.GENERADORES['gm-rapido'] = genRapido;
  M.GENERADORES['gm-regresa'] = genRegresa;
  M.GENERADORES['gm-acelera'] = genAcelera;
  M.GENERADORES['gm-historia'] = genHistoria;

  // Para la lección y las pruebas: el mismo dibujo que usan los ejercicios.
  M.graficas = { enX: enX, enV: enV, dibuja: dibuja, firma: firma, extremos: extremos };
})();
