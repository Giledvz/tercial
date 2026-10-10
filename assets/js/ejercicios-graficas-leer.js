/*
 * ejercicios-graficas-leer.js — generadores de «Gráficas I: leer pendiente, corte y área»
 * (Fundamentos, semana 5 de Física).
 *
 * Se suman al registro de window.TercialMotor y usan los ayudantes de ejercicios-fisica.js
 * (M.fisica), así que se cargan después de los dos. Cada enunciado trae su gráfica: un SVG
 * pequeño con cuadrícula, los ejes con su magnitud y su unidad, y la recta. Cada vértice cae en
 * un cruce de la cuadrícula, para que todo se lea sin adivinar. Las opciones falsas son
 * errores reales al leer gráficas, cada una con su explicación.
 *
 *   leer-velocidad    la pendiente de una gráfica x–t: la velocidad, con su signo
 *   leer-corte        el corte con el eje vertical: la posición inicial (en nivel 3, también v₀)
 *   leer-area         el área bajo una gráfica v–t: el desplazamiento (bajo el eje, negativa)
 *   leer-aceleracion  la pendiente de una gráfica v–t: la aceleración
 *   leer-valor        leer un valor: dónde está, cuándo pasa, qué velocidad lleva, cuándo se detiene
 *
 * Sólo movimientos en línea recta: rectas en x–t (MRU, por tramos en nivel 3) y rectas en
 * v–t (MRU y MRUA). En v–t la velocidad nunca salta: cambia de forma continua.
 * Las medidas de la gráfica viven en G; sus colores, en fisica/graficas-leer.css.
 * M.graficasLeer.grafica() es la misma función con que se dibujan las gráficas de los ejemplos
 * de la lección.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var MENOS = F.MENOS;
  var azar = F.azar;

  /* ---------- Números ---------- */
  function limpio(n) { var r = Math.round(n * 100) / 100; return r === 0 ? 0 : r; }
  // A lo más dos decimales: 2.5 y 0.25 sí; 1/3 no (no se ofrece como opción).
  function exacto(n) { return isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6; }
  function num(n) { n = limpio(n); return n < 0 ? MENOS + (-n) : String(n); }
  function sig(n) { n = limpio(n); return n > 0 ? '+' + n : n < 0 ? MENOS + (-n) : '0'; }
  function entre(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function moneda() { return Math.random() < 0.5; }
  function par(n) { return n < 0 ? '(' + num(n) + ')' : num(n); }

  // La posición se escribe sin signo de más (12 m); lo que tiene dirección, con él (+3 m/s, −15 m).
  function metros(n) { return num(n) + ' m'; }
  function despl(n) { return sig(n) + ' m'; }
  function vel(n) { return sig(n) + ' m/s'; }
  function acel(n) { return sig(n) + ' m/s²'; }
  function seg(n) { return num(n) + ' s'; }
  function punto(t, y, u) { return '(' + num(t) + ' s, ' + num(y) + ' ' + u + ')'; }

  /* ---------- La gráfica ----------
     viewBox de 300 × 192: la zona de la gráfica va de X0 a X1 y de YT a YB; a la izquierda, los
     números del eje vertical; abajo, los del tiempo; el nombre de cada eje junto a su flecha. */
  var G = { W: 300, H: 192, X0: 40, X1: 252, YT: 26, YB: 158 };
  function r1(v) { return Math.round(v * 10) / 10; }

  // g = { eje: 'x' | 'v', tMax, yMin, yMax, paso, cada, puntos: [[t, y], …],
  //       sombras: [[[t, y], …], …], guias: [[[t, y], [t, y]], …], textos: [{ t, y, texto, ancla, clase }] }
  // (sombras, guias y textos sólo los usan los ejemplos resueltos de la lección).
  function grafica(g) {
    var sx = (G.X1 - G.X0) / g.tMax, sy = (G.YB - G.YT) / (g.yMax - g.yMin);
    function px(t) { return r1(G.X0 + t * sx); }
    function py(y) { return r1(G.YB - (y - g.yMin) * sy); }
    var u = g.eje === 'x' ? 'm' : 'm/s';
    var y0 = py(Math.max(g.yMin, Math.min(g.yMax, 0)));
    var rejilla = '';
    for (var t = 1; t <= g.tMax; t++) rejilla += 'M' + px(t) + ' ' + G.YT + 'V' + G.YB;
    for (var k = 0; g.yMin + k * g.paso <= g.yMax + 1e-9; k++) {
      var y = limpio(g.yMin + k * g.paso);
      if (y !== 0) rejilla += 'M' + G.X0 + ' ' + py(y) + 'H' + G.X1;
    }
    var nombre = g.eje === 'x' ? 'posición contra tiempo' : 'velocidad contra tiempo';
    var descripcion = 'Gráfica de ' + nombre + ': ' + (g.puntos.length > 2 ? 'pasa por ' : 'una recta de ') +
      g.puntos.map(function (p) { return punto(p[0], p[1], u); }).join(g.puntos.length > 2 ? ', ' : ' a ') + '.';
    var s = '<svg class="leer-grafica" viewBox="0 0 ' + G.W + ' ' + G.H + '" role="img" aria-label="' + descripcion + '">';
    s += '<path class="leer-grafica__rejilla" d="' + rejilla + '"/>';
    (g.sombras || []).forEach(function (poligono) {
      s += '<path class="leer-grafica__area" d="M' + poligono.map(function (p) { return px(p[0]) + ' ' + py(p[1]); }).join('L') + 'Z"/>';
    });
    // Ejes: el vertical en t = 0 y el del tiempo en el cero de la magnitud, los dos con su flecha.
    s += '<path class="leer-grafica__eje" d="M' + G.X0 + ' ' + G.YB + 'V' + (G.YT - 8) + 'M' + G.X0 + ' ' + y0 + 'H' + (G.X1 + 12) + '"/>';
    s += '<path class="leer-grafica__punta" d="M' + G.X0 + ' ' + (G.YT - 14) + 'L' + (G.X0 - 3.5) + ' ' + (G.YT - 7) + 'H' + (G.X0 + 3.5) + 'Z' +
      'M' + (G.X1 + 18) + ' ' + y0 + 'L' + (G.X1 + 11) + ' ' + r1(y0 - 3.5) + 'V' + r1(y0 + 3.5) + 'Z"/>';
    (g.guias || []).forEach(function (l) {
      s += '<path class="leer-grafica__guia" d="M' + px(l[0][0]) + ' ' + py(l[0][1]) + 'L' + px(l[1][0]) + ' ' + py(l[1][1]) + '"/>';
    });
    for (var j = 0; g.yMin + j * g.paso <= g.yMax + 1e-9; j++) {
      var v = limpio(g.yMin + j * g.paso);
      if (Math.abs(v / g.cada - Math.round(v / g.cada)) > 1e-9) continue;
      s += '<text class="leer-grafica__num" x="' + (G.X0 - 6) + '" y="' + r1(py(v) + 3.8) + '" text-anchor="end">' + num(v) + '</text>';
    }
    for (var i = 0; i <= g.tMax; i++) {
      s += '<text class="leer-grafica__num" x="' + px(i) + '" y="' + (G.YB + 16) + '" text-anchor="middle">' + i + '</text>';
    }
    s += '<text class="leer-grafica__titulo" x="' + (G.X0 + 8) + '" y="' + (G.YT - 10) + '">' + (g.eje === 'x' ? 'x (m)' : 'v (m/s)') + '</text>';
    s += '<text class="leer-grafica__titulo" x="' + (G.W - 4) + '" y="' + (G.YB + 16) + '" text-anchor="end">t (s)</text>';
    s += '<path class="leer-grafica__linea" d="M' + g.puntos.map(function (p) { return px(p[0]) + ' ' + py(p[1]); }).join('L') + '"/>';
    g.puntos.forEach(function (p) {
      s += '<circle class="leer-grafica__punto" cx="' + px(p[0]) + '" cy="' + py(p[1]) + '" r="3"/>';
    });
    (g.textos || []).forEach(function (x) {
      s += '<text class="leer-grafica__nota' + (x.clase ? ' ' + x.clase : '') + '" x="' + px(x.t) + '" y="' + py(x.y) + '"' +
        (x.ancla ? ' text-anchor="' + x.ancla + '"' : '') + '>' + x.texto + '</text>';
    });
    return s + '</svg>';
  }

  // La escala vertical: incluye el cero y todos los valores, con un renglón de aire arriba y abajo.
  // La cuadrícula va cada `paso` y los números cada dos renglones; si quedan demasiados renglones,
  // la cuadrícula va de 5 en 5.
  function escala(valores, paso) {
    var lo = Math.min.apply(null, valores.concat(0)), hi = Math.max.apply(null, valores.concat(0));
    for (;;) {
      var cada = paso * 2;
      var yMin = lo < 0 ? Math.floor((lo - paso / 2) / cada) * cada : 0;
      var yMax = hi > 0 ? Math.ceil((hi + paso / 2) / cada) * cada : 0;
      if (yMax === 0) yMax = cada;
      if ((yMax - yMin) / paso <= 14 || paso >= 5) return { yMin: yMin, yMax: yMax, paso: paso, cada: cada };
      paso = paso < 2 ? 2 : 5;
    }
  }

  // Todos los vértices en un cruce de la cuadrícula: t entero y la magnitud múltiplo del paso.
  function enCruces(puntos, paso) {
    return puntos.every(function (p) {
      return p[0] === Math.round(p[0]) && Math.abs(p[1] / paso - Math.round(p[1] / paso)) < 1e-9;
    });
  }

  function dibujo(eje, puntos, paso) {
    var e = escala(puntos.map(function (p) { return p[1]; }), paso);
    if (!enCruces(puntos, e.paso)) return null;
    var tMax = Math.max.apply(null, puntos.map(function (p) { return p[0]; }));
    return { svg: grafica({ eje: eje, tMax: tMax, yMin: e.yMin, yMax: e.yMax, paso: e.paso, cada: e.cada, puntos: puntos }), paso: e.paso };
  }

  /* ---------- Quién se mueve: con rapideces de verdad ---------- */
  function quienXT(rapidez) {
    if (rapidez <= 1) return azar(['una persona que camina', 'un niño que camina']);
    if (rapidez <= 2) return azar(['una persona que trota', 'una persona que camina rápido']);
    if (rapidez <= 6) return azar(['una corredora', 'un ciclista', 'una patinadora']);
    return azar(['un ciclista', 'un auto']);
  }
  function quienVT(vMax) {
    return vMax <= 8 ? azar(['un ciclista', 'una patinadora', 'un auto']) : azar(['un auto', 'una motocicleta', 'un autobús']);
  }

  // Cuántas falsas distintas quedan (sin repetir ni coincidir con la correcta): armar elige tres.
  function bastan(correcta, falsas) {
    var vistas = {}, n = 0;
    vistas[correcta] = true;
    falsas.forEach(function (f) { if (!vistas[f.h]) { vistas[f.h] = true; n++; } });
    return n >= 3;
  }

  // El enunciado es una frase y la gráfica va después: juntar() sólo toca la frase.
  function ejercicio(frase, svg, correcta, falsas, meta) {
    meta.ask = 'Lee la gráfica';
    var e = F.armar(frase, correcta, falsas, meta);
    e.enunciado = '<span class="leer-pregunta">' + e.enunciado + '</span>' + svg;
    return e;
  }

  /* ---------- leer-velocidad: la pendiente de una gráfica x–t ---------- */
  function velocidadRecta(nivel) {
    var paso = nivel === 1 ? azar([1, 2]) : 2;
    var T = azar(nivel === 1 ? [2, 3, 4] : [2, 3, 4, 5]);
    var v = nivel === 1 ? entre(1, 5) : entre(1, 6) * (moneda() ? -1 : 1);
    var x0 = v > 0 ? azar(nivel === 1 ? [0, 2, 4, 6] : [0, 2, 4, 6, 8, 10]) : -v * T + azar([0, 2, 4, 6]);
    var x1 = x0 + v * T;
    if (x1 > 30) return null;
    var d = dibujo('x', [[0, x0], [T, x1]], paso);
    if (!d) return null;
    var dx = x1 - x0;
    var falsas = [
      { h: vel(x1), err: 'Leíste la altura de la recta al final: en t = ' + T + ' s está en x = ' + num(x1) + ' m. Eso dice dónde está, no qué tan rápido va.' },
      { h: vel(dx), err: 'Ése es Δx, lo que cambió la posición. Falta dividir entre Δt = ' + T + ' s.' }
    ];
    if (x0 !== 0) falsas.push({ h: vel(x1 / T), err: 'Dividiste la posición final entre el tiempo, pero no empezó en 0: primero resta donde empezó, Δx = ' + num(x1) + ' m − ' + num(x0) + ' m.' });
    if (exacto(T / dx)) falsas.push({ h: vel(T / dx), err: 'Dividiste al revés, Δt ÷ Δx. La pendiente es lo que sube entre lo que avanza: Δx ÷ Δt. (Al revés, la unidad saldría s/m.)' });
    if (v < 0) falsas.push({ h: vel(-v), err: 'La recta baja: la posición disminuye, así que la velocidad es negativa.' });
    if (d.paso !== 1 && exacto(dx / d.paso / T)) falsas.push({ h: vel(dx / d.paso / T), err: 'Contaste cuadritos: cada cuadro vertical vale ' + d.paso + ' m, así que Δx = ' + num(dx) + ' m, no ' + num(dx / d.paso) + '.' });
    var correcta = vel(v);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Posición contra tiempo de ' + quienXT(Math.abs(v)) + '. ¿Cuál es su velocidad?', d.svg, correcta, falsas, {
      tema: 'Pendiente de una gráfica x–t',
      pasos: ['Dos puntos de la recta: ' + punto(0, x0, 'm') + ' y ' + punto(T, x1, 'm') + '.',
        'Δx = ' + num(x1) + ' m − ' + par(x0) + ' m = ' + num(dx) + ' m y Δt = ' + T + ' s.',
        'v = Δx ÷ Δt = ' + num(dx) + ' m ÷ ' + T + ' s = <b>' + vel(v) + '</b>.'],
      datos: { eje: 'x', pide: 'pendiente', tramo: [0, T] }
    });
  }

  // Nivel 3: dos tramos rectos y la pregunta por uno de ellos.
  function velocidadTramos() {
    var t1 = azar([2, 3]), t2 = t1 + azar([2, 3]);
    var v1 = azar([-4, -2, 2, 3, 4, 5, 6]), v2 = azar([-6, -4, -3, -2, 0, 2, 4]);
    if (v1 === v2) return null;
    var x0 = azar([0, 2, 4, 6, 8, 10, 12, 16, 20]);
    var x1 = x0 + v1 * t1, x2 = x1 + v2 * (t2 - t1);
    if (Math.max(x0, x1, x2) > 30 || Math.min(x0, x1, x2) < -10) return null;
    var d = dibujo('x', [[0, x0], [t1, x1], [t2, x2]], 2);
    if (!d) return null;
    var cual = moneda() ? 1 : 2;
    var a = cual === 1 ? 0 : t1, b = cual === 1 ? t1 : t2;
    var xa = cual === 1 ? x0 : x1, xb = cual === 1 ? x1 : x2;
    var v = cual === 1 ? v1 : v2, otra = cual === 1 ? v2 : v1;
    var dx = xb - xa, dt = b - a;
    var falsas = [
      { h: vel(otra), err: 'Ésa es la velocidad del otro tramo. La pregunta es de t = ' + a + ' s a t = ' + b + ' s.' },
      { h: vel(dx), err: 'Ése es Δx, lo que cambió la posición en el tramo. Falta dividir entre Δt = ' + dt + ' s.' },
      { h: vel(xb), err: 'Leíste la altura de la recta en t = ' + b + ' s: eso dice dónde está, no qué tan rápido va.' }
    ];
    if (exacto((x2 - x0) / t2)) falsas.push({ h: vel((x2 - x0) / t2), err: 'Usaste todo el recorrido, de 0 s a ' + t2 + ' s. La pregunta es sólo el tramo de ' + a + ' s a ' + b + ' s.' });
    if (v !== 0) falsas.push({ h: vel(-v), err: v < 0 ? 'En ese tramo la recta baja: la velocidad es negativa.' : 'En ese tramo la recta sube: la velocidad es positiva.' });
    var correcta = vel(v);
    if (!bastan(correcta, falsas)) return null;
    var rapidez = Math.max(Math.abs(v1), Math.abs(v2));
    return ejercicio('Posición contra tiempo de ' + quienXT(rapidez) + '. ¿Cuál es su velocidad entre t = ' + a + ' s y t = ' + b + ' s?', d.svg, correcta, falsas, {
      tema: 'Pendiente de una gráfica x–t',
      pasos: ['Puntos del tramo: ' + punto(a, xa, 'm') + ' y ' + punto(b, xb, 'm') + '.',
        'Δx = ' + num(xb) + ' m − ' + par(xa) + ' m = ' + num(dx) + ' m y Δt = ' + b + ' s − ' + a + ' s = ' + dt + ' s.',
        'v = ' + num(dx) + ' m ÷ ' + dt + ' s = <b>' + vel(v) + '</b>.' + (v === 0 ? ' La recta es horizontal: está en reposo.' : '')],
      datos: { eje: 'x', pide: 'pendiente', tramo: [a, b] }
    });
  }

  function genVelocidad(nivel) {
    for (var i = 0; i < 400; i++) {
      var e = nivel === 3 ? velocidadTramos() : velocidadRecta(nivel);
      if (e) return e;
    }
    return null;
  }

  /* ---------- leer-corte: dónde empieza ---------- */
  function corteXT(nivel) {
    var paso = 2, T, v, x0, tc = null;
    if (nivel === 1) {
      T = azar([3, 4, 5]); v = entre(1, 4); x0 = azar([2, 4, 6, 8, 10, 12]);
    } else {
      // La recta cruza el eje del tiempo en un segundo entero: ese cruce no es la posición inicial.
      tc = azar([2, 3, 4]); T = tc + azar([1, 2]); v = azar([2, 3, 4, 5]);
      if (moneda()) { x0 = v * tc; v = -v; } else { x0 = -v * tc; }
    }
    var x1 = x0 + v * T;
    if (x1 > 30 || x1 < -16) return null;
    var d = dibujo('x', [[0, x0], [T, x1]], paso);
    if (!d) return null;
    var falsas = [
      { h: metros(x1), err: 'Ésa es la posición al final, en t = ' + T + ' s. La inicial es la de t = 0.' },
      { h: metros(Math.abs(v)), err: 'Eso es lo que cambia la posición cada segundo (la pendiente, ' + vel(v) + '). La posición inicial es el corte con el eje vertical.' },
      { h: metros(x0 + v), err: 'Ésa es la posición en t = 1 s. La inicial es en t = 0, donde la recta toca el eje vertical.' }
    ];
    if (x0 !== 0) falsas.push({ h: metros(0), err: 'Una gráfica no tiene que empezar en el origen: en t = 0 la recta está en x = ' + num(x0) + ' m.' });
    if (tc !== null) falsas.push({ h: metros(tc), err: 'Leíste dónde cruza el eje del tiempo, en t = ' + tc + ' s: ahí pasa por x = 0. La posición inicial se lee en el eje vertical.' });
    if (x0 < 0) falsas.push({ h: metros(-x0), err: 'La recta empieza debajo del eje del tiempo: la posición inicial es negativa, ' + num(x0) + ' m.' });
    var correcta = metros(x0);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Posición contra tiempo de ' + quienXT(Math.abs(v)) + '. ¿Cuál es su posición inicial?', d.svg, correcta, falsas, {
      tema: 'El corte con el eje vertical',
      pasos: ['La posición inicial es la de t = 0: donde la recta toca el eje vertical.',
        'Ahí la recta está en <b>' + metros(x0) + '</b>.' + (tc !== null ? ' El cruce con el eje del tiempo, en t = ' + tc + ' s, es cuando pasa por x = 0.' : '')],
      datos: { eje: 'x', pide: 'corte' }
    });
  }

  function corteVT() {
    var T = azar([3, 4, 5]), v0, a;
    if (moneda()) { v0 = entre(1, 6); a = entre(1, 2); } else { a = -entre(1, 3); v0 = -a * T + entre(0, 2); }
    var v1 = v0 + a * T;
    if (v1 > 14 || v1 < 0) return null;
    var d = dibujo('v', [[0, v0], [T, v1]], 1);
    if (!d) return null;
    var area = (v0 + v1) * T / 2;
    var falsas = [
      { h: vel(v1), err: 'Ésa es la velocidad al final, en t = ' + T + ' s. La inicial es la de t = 0.' },
      { h: vel(a), err: 'Eso es lo que cambia la velocidad cada segundo: la pendiente, la aceleración (' + acel(a) + ').' },
      { h: vel(0), err: 'No salió del reposo: en t = 0 la recta ya está en ' + vel(v0) + '.' }
    ];
    if (v1 === 0) falsas.push({ h: vel(T), err: 'Leíste dónde toca el eje del tiempo, en t = ' + T + ' s: ahí se detiene. La velocidad inicial se lee en el eje vertical.' });
    if (exacto(area)) falsas.push({ h: vel(area), err: 'Calculaste el área: eso es el desplazamiento, en metros. La velocidad inicial se lee en el eje vertical, en t = 0.' });
    var correcta = vel(v0);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + quienVT(Math.max(v0, v1)) + '. ¿Con qué velocidad empezó?', d.svg, correcta, falsas, {
      tema: 'El corte con el eje vertical',
      pasos: ['En una gráfica v–t, el corte con el eje vertical (t = 0) es la velocidad inicial.',
        'Ahí la recta está en <b>' + vel(v0) + '</b>.'],
      datos: { eje: 'v', pide: 'corte' }
    });
  }

  function genCorte(nivel) {
    for (var i = 0; i < 400; i++) {
      var e = nivel === 3 ? (moneda() ? corteVT() : corteXT(3)) : corteXT(nivel);
      if (e) return e;
    }
    return null;
  }

  /* ---------- leer-area: el área bajo una gráfica v–t es el desplazamiento ---------- */
  function areaRectangulo(negativa) {
    var v = entre(2, 6) * (negativa ? -1 : 1), T = entre(2, 5);
    var d = dibujo('v', [[0, v], [T, v]], 1);
    if (!d) return null;
    var A = v * T;
    var falsas = [
      { h: despl(A / 2), err: 'Lo tomaste como triángulo: la velocidad es constante y el área es un rectángulo completo, base × altura.' },
      { h: despl(v), err: 'Ésa es la altura de la recta: la velocidad. El desplazamiento es el área, base × altura.' }
    ];
    if (negativa) {
      falsas.push({ h: despl(-A), err: 'La recta va debajo del eje: la velocidad es negativa y el área cuenta negativa. Se movió hacia el lado negativo.' });
    } else {
      falsas.push({ h: despl(v + T), err: 'Sumaste la base y la altura; el área se multiplica: base × altura.' });
      falsas.push({ h: despl(T), err: 'Ésa es sólo la base, el tiempo. El área es base × altura.' });
    }
    var correcta = despl(A);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + quienVT(Math.abs(v)) + '. ¿Cuál es su desplazamiento en los ' + T + ' s?', d.svg, correcta, falsas, {
      tema: 'Área bajo una gráfica v–t',
      pasos: ['El área ' + (negativa ? 'debajo del eje' : 'bajo la recta') + ' es un rectángulo: ' + T + ' s de base y ' + vel(v) + ' de altura.',
        'Área = ' + T + ' s × ' + par(v) + ' m/s = <b>' + despl(A) + '</b>' + (negativa ? ': negativa, porque va hacia el lado negativo.' : ': es el desplazamiento.')],
      datos: { eje: 'v', pide: 'area', tramo: [0, T] }
    });
  }

  function areaTriangulo() {
    var T = entre(2, 5), v = entre(2, 10), arranca = moneda();
    if ((v * T) % 2) return null;
    var puntos = arranca ? [[0, 0], [T, v]] : [[0, v], [T, 0]];
    var d = dibujo('v', puntos, 1);
    if (!d) return null;
    var A = v * T / 2;
    var falsas = [
      { h: despl(v * T), err: 'Lo tomaste como rectángulo: el área es un triángulo, la mitad. Base × altura ÷ 2.' },
      { h: despl(v), err: 'Ésa es la altura: la velocidad ' + (arranca ? 'al final' : 'al principio') + '. El desplazamiento es el área.' }
    ];
    if (exacto(v / T)) falsas.push({ h: despl(v / T), err: 'Eso es la pendiente (' + num(v) + ' ÷ ' + T + '), la aceleración. El desplazamiento es el área, base × altura ÷ 2.' });
    falsas.push({ h: despl(v + T), err: 'Sumaste la base y la altura; el área de un triángulo es base × altura ÷ 2.' });
    var correcta = despl(A);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + quienVT(v) + (arranca ? ' que arranca' : ' que frena') + '. ¿Cuál es su desplazamiento en los ' + T + ' s?', d.svg, correcta, falsas, {
      tema: 'Área bajo una gráfica v–t',
      pasos: ['El área bajo la recta es un triángulo: ' + T + ' s de base y ' + num(v) + ' m/s de altura.',
        'Área = ' + T + ' s × ' + num(v) + ' m/s ÷ 2 = <b>' + despl(A) + '</b>.'],
      datos: { eje: 'v', pide: 'area', tramo: [0, T] }
    });
  }

  function areaTrapecio() {
    var T = entre(2, 4), v0 = entre(1, 6), v1 = entre(2, 12);
    if (v0 === v1 || ((v0 + v1) * T) % 2) return null;
    var d = dibujo('v', [[0, v0], [T, v1]], 1);
    if (!d) return null;
    var bajo = Math.min(v0, v1), alto = Math.max(v0, v1);
    var A = (v0 + v1) * T / 2, rect = bajo * T, tri = (alto - bajo) * T / 2;
    var falsas = [
      { h: despl(alto * T), err: 'Usaste la altura mayor en todo el rectángulo. Es un trapecio: un rectángulo de ' + num(bajo) + ' m/s más un triángulo encima.' },
      { h: despl(rect), err: 'Te faltó el triángulo de arriba: ' + T + ' s × ' + num(alto - bajo) + ' m/s ÷ 2 = ' + num(tri) + ' m.' },
      { h: despl(tri), err: 'Ése es sólo el triángulo. Abajo hay un rectángulo de ' + T + ' s × ' + num(bajo) + ' m/s = ' + num(rect) + ' m.' },
      { h: despl(alto * T / 2), err: 'Lo tomaste como un triángulo que sale de cero, pero la recta no empieza en el eje: abajo hay un rectángulo.' }
    ];
    var correcta = despl(A);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + quienVT(alto) + '. ¿Cuál es su desplazamiento en los ' + T + ' s?', d.svg, correcta, falsas, {
      tema: 'Área bajo una gráfica v–t',
      pasos: ['El área es un trapecio: pártelo en un rectángulo y un triángulo.',
        'Rectángulo: ' + T + ' s × ' + num(bajo) + ' m/s = ' + num(rect) + ' m. Triángulo: ' + T + ' s × ' + num(alto - bajo) + ' m/s ÷ 2 = ' + num(tri) + ' m.',
        'Desplazamiento: ' + num(rect) + ' m + ' + num(tri) + ' m = <b>' + despl(A) + '</b>.'],
      datos: { eje: 'v', pide: 'area', tramo: [0, T] }
    });
  }

  // Nivel 3: la recta cruza el eje (sube por una rampa, se detiene y regresa): dos triángulos.
  function areaCruza() {
    var a = azar([1, 2, 3]), tc = azar([2, 3, 4]), T = tc + azar([1, 2, 3]);
    if (T > 6) return null;
    var v0 = a * tc, v1 = -a * (T - tc);
    var arriba = v0 * tc / 2, abajo = -v1 * (T - tc) / 2;
    if (!exacto(arriba) || !exacto(abajo) || arriba === abajo) return null;
    var d = dibujo('v', [[0, v0], [T, v1]], 1);
    if (!d) return null;
    var A = arriba - abajo;
    var falsas = [
      { h: despl(arriba + abajo), err: 'Sumaste las dos áreas como positivas: eso es la distancia que recorrió. El desplazamiento resta la de abajo.' },
      { h: despl(arriba), err: 'Te faltó el triángulo debajo del eje, de ' + tc + ' s a ' + T + ' s: también cuenta, y es negativo.' },
      { h: despl(v0 * T / 2), err: 'Hay dos triángulos, uno arriba y otro abajo del eje: la recta cruza el cero en t = ' + tc + ' s.' },
      { h: despl(-A), err: 'El signo está al revés: el triángulo de arriba (' + num(arriba) + ' m) es ' + (arriba > abajo ? 'mayor' : 'menor') + ' que el de abajo (' + num(abajo) + ' m).' }
    ];
    var correcta = despl(A);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de una pelota que sube por una rampa y regresa. ¿Cuál es su desplazamiento en los ' + T + ' s?', d.svg, correcta, falsas, {
      tema: 'Área bajo una gráfica v–t',
      pasos: ['Arriba del eje: ' + tc + ' s × ' + num(v0) + ' m/s ÷ 2 = ' + num(arriba) + ' m (sube).',
        'Debajo: ' + (T - tc) + ' s × ' + num(-v1) + ' m/s ÷ 2 = ' + num(abajo) + ' m (regresa), que cuenta negativo.',
        'Desplazamiento: ' + num(arriba) + ' m − ' + num(abajo) + ' m = <b>' + despl(A) + '</b>.'],
      datos: { eje: 'v', pide: 'area', tramo: [0, T] }
    });
  }

  function genArea(nivel) {
    for (var i = 0; i < 400; i++) {
      // Nivel 3: áreas debajo del eje (velocidad negativa, o la recta que cruza el cero) y trapecios.
      var e = nivel === 1 ? areaRectangulo(false)
        : nivel === 2 ? (moneda() ? areaTriangulo() : areaTrapecio())
        : azar([areaCruza, areaCruza, function () { return areaRectangulo(true); }, areaTrapecio])();
      if (e) return e;
    }
    return null;
  }

  /* ---------- leer-aceleracion: la pendiente de una gráfica v–t ---------- */
  function genAceleracion(nivel) {
    for (var i = 0; i < 400; i++) {
      var T = azar([2, 3, 4]), a, v0;
      if (nivel === 1) { a = entre(1, 3); v0 = 0; }
      else if (nivel === 2) { a = entre(1, 3); v0 = entre(1, 5); }
      else { a = -entre(1, 3); v0 = -a * T + entre(0, 3); }
      var v1 = v0 + a * T;
      if (v1 > 14 || v1 < 0) continue;
      var d = dibujo('v', [[0, v0], [T, v1]], 1);
      if (!d) continue;
      var dv = v1 - v0;
      var falsas = [
        { h: acel(v1), err: 'Leíste la altura: la velocidad al final, ' + vel(v1) + '. La aceleración es cuánto cambia la velocidad cada segundo.' },
        { h: acel(dv), err: 'Ése es Δv, lo que cambió la velocidad. Falta dividir entre Δt = ' + T + ' s.' }
      ];
      if (v0 === 0) falsas.push({ h: acel(v1 * T / 2), err: 'Calculaste el área (base × altura ÷ 2): eso es el desplazamiento, en metros. La aceleración es la pendiente.' });
      if (v0 !== 0 && exacto(v1 / T)) falsas.push({ h: acel(v1 / T), err: 'Dividiste la velocidad final entre el tiempo, pero no salió del reposo: primero resta la inicial, Δv = ' + num(v1) + ' − ' + num(v0) + '.' });
      if (exacto(T / dv)) falsas.push({ h: acel(T / dv), err: 'Dividiste al revés, Δt ÷ Δv. La pendiente es lo que sube entre lo que avanza: Δv ÷ Δt.' });
      if (a < 0) falsas.push({ h: acel(-a), err: 'La recta baja: la velocidad disminuye, así que la aceleración es negativa.' });
      var correcta = acel(a);
      if (!bastan(correcta, falsas)) continue;
      var quien = quienVT(Math.max(v0, v1)) + (v0 === 0 ? ' que arranca' : a < 0 ? ' que frena' : '');
      return ejercicio('Velocidad contra tiempo de ' + quien + '. ¿Cuál es su aceleración?', d.svg, correcta, falsas, {
        tema: 'Pendiente de una gráfica v–t',
        pasos: ['Dos puntos: ' + punto(0, v0, 'm/s') + ' y ' + punto(T, v1, 'm/s') + '.',
          'Δv = ' + num(v1) + ' m/s − ' + num(v0) + ' m/s = ' + num(dv) + ' m/s y Δt = ' + T + ' s.',
          'a = Δv ÷ Δt = ' + num(dv) + ' m/s ÷ ' + T + ' s = <b>' + acel(a) + '</b>.'],
        datos: { eje: 'v', pide: 'pendiente', tramo: [0, T] }
      });
    }
    return null;
  }

  /* ---------- leer-valor: un valor de la gráfica ---------- */
  // x–t: ¿dónde está en t = k?
  function valorPosicion() {
    var paso = 2, T = azar([3, 4, 5]), v = azar([2, 4]), x0 = azar([0, 2, 4, 6, 8]);
    var x1 = x0 + v * T;
    if (x1 > 30) return null;
    var d = dibujo('x', [[0, x0], [T, x1]], paso);
    if (!d) return null;
    var k = entre(1, T - 1), xk = x0 + v * k;
    var falsas = [
      { h: metros(xk + v), err: 'Leíste en t = ' + (k + 1) + ' s. Sube desde t = ' + k + ' s, en el eje del tiempo, hasta la recta.' },
      { h: metros(xk - v), err: 'Leíste en t = ' + (k - 1) + ' s. Sube desde t = ' + k + ' s, en el eje del tiempo, hasta la recta.' },
      { h: metros(xk / d.paso), err: 'Contaste cuadritos: cada cuadro vertical vale ' + d.paso + ' m. Lee el número del eje.' }
    ];
    if (x0 !== 0) falsas.push({ h: metros(v * k), err: 'Eso es lo que avanzó en ' + k + ' s; la gráfica da la posición, que ya incluye dónde empezó (' + num(x0) + ' m).' });
    falsas.push({ h: metros(x0), err: 'Ésa es la posición inicial, en t = 0. La pregunta es en t = ' + k + ' s.' });
    var correcta = metros(xk);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Posición contra tiempo de ' + quienXT(v) + '. ¿Dónde está en t = ' + k + ' s?', d.svg, correcta, falsas, {
      tema: 'Leer un valor',
      pasos: ['Busca t = ' + k + ' s en el eje del tiempo y sube hasta la recta.',
        'Desde ahí, ve a la izquierda hasta el eje vertical: <b>' + metros(xk) + '</b>.'],
      datos: { eje: 'x', pide: 'valor', en: k }
    });
  }

  // x–t: ¿en qué instante está en x = X?
  function valorInstante() {
    var T = azar([4, 5]), v = azar([2, 3, 4]), x0 = azar([0, 2, 4, 6]);
    var x1 = x0 + v * T;
    if (x1 > 30) return null;
    var d = dibujo('x', [[0, x0], [T, x1]], 2);
    if (!d) return null;
    var k = entre(1, T - 1), X = x0 + v * k;
    if (Math.abs(X / d.paso - Math.round(X / d.paso)) > 1e-9) return null;
    var falsas = [
      { h: seg(k + 1), err: 'En t = ' + (k + 1) + ' s está en ' + num(X + v) + ' m. Busca x = ' + num(X) + ' m en el eje vertical y ve a la derecha hasta la recta.' },
      { h: seg(k - 1), err: 'En t = ' + (k - 1) + ' s está en ' + num(X - v) + ' m. Busca x = ' + num(X) + ' m en el eje vertical y ve a la derecha hasta la recta.' }
    ];
    if (x0 !== 0 && exacto(X / v)) falsas.push({ h: seg(X / v), err: 'Dividiste ' + num(X) + ' m entre la velocidad, pero no empezó en 0: le faltaban ' + num(X - x0) + ' m, no ' + num(X) + '.' });
    falsas.push({ h: seg(X - x0), err: 'Ésos son los metros que avanzó desde el principio, no el tiempo. Lee en el eje horizontal.' });
    falsas.push({ h: seg(X), err: 'Ése es el valor de x; el instante se lee abajo, en el eje del tiempo.' });
    var correcta = seg(k);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Posición contra tiempo de ' + quienXT(v) + '. ¿En qué instante está en x = ' + num(X) + ' m?', d.svg, correcta, falsas, {
      tema: 'Leer un valor',
      pasos: ['Busca x = ' + num(X) + ' m en el eje vertical y ve a la derecha hasta la recta.',
        'Desde ahí, baja al eje del tiempo: <b>t = ' + seg(k) + '</b>.'],
      datos: { eje: 'x', pide: 'instante', valor: X }
    });
  }

  // v–t: ¿qué velocidad lleva en t = k?
  function valorVelocidad() {
    var T = azar([3, 4, 5]), a = azar([1, 2, -1, -2]), v0 = a > 0 ? entre(0, 4) : -a * T + entre(0, 3);
    var v1 = v0 + a * T;
    if (v1 > 14 || v1 < 0) return null;
    var d = dibujo('v', [[0, v0], [T, v1]], 1);
    if (!d) return null;
    var k = entre(1, T - 1), vk = v0 + a * k, recorrido = (v0 + vk) * k / 2;
    var falsas = [
      { h: vel(v0), err: 'Ésa es la velocidad inicial, en t = 0. La pregunta es en t = ' + k + ' s.' },
      { h: vel(vk + a), err: 'Leíste en t = ' + (k + 1) + ' s. Sube desde t = ' + k + ' s hasta la recta.' },
      { h: vel(a), err: 'Eso es lo que cambia la velocidad cada segundo: la aceleración, la pendiente.' }
    ];
    if (exacto(recorrido)) falsas.push({ h: vel(recorrido), err: 'Calculaste el área hasta t = ' + k + ' s: eso es lo que avanzó, en metros. La velocidad se lee en la altura de la recta.' });
    var correcta = vel(vk);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + quienVT(Math.max(v0, v1)) + '. ¿Qué velocidad lleva en t = ' + k + ' s?', d.svg, correcta, falsas, {
      tema: 'Leer un valor',
      pasos: ['Busca t = ' + k + ' s en el eje del tiempo y sube hasta la recta.',
        'Desde ahí, ve a la izquierda hasta el eje vertical: <b>' + vel(vk) + '</b>.'],
      datos: { eje: 'v', pide: 'valor', en: k }
    });
  }

  // v–t, nivel 3: ¿en qué instante se detiene? Frena, queda quieto un rato y la gráfica sigue.
  function valorDetiene() {
    var a = azar([1, 2, 3]), tc = azar([2, 3, 4]), T = tc + azar([1, 2]);
    var v0 = a * tc;
    if (v0 > 12 || T > 6) return null;
    var d = dibujo('v', [[0, v0], [tc, 0], [T, 0]], 1);
    if (!d) return null;
    var falsas = [
      { h: seg(v0), err: 'Ése es el corte con el eje vertical: la velocidad inicial, ' + vel(v0) + '. Se detiene donde la recta llega al eje del tiempo.' },
      { h: seg(T), err: 'Ahí sólo termina la gráfica. Su velocidad ya era cero desde t = ' + tc + ' s.' },
      { h: seg(tc - 1), err: 'En t = ' + (tc - 1) + ' s todavía va a ' + vel(a) + '. Se detiene cuando la velocidad llega a cero.' },
      { h: seg(v0 * tc / 2), err: 'Calculaste el área: eso es lo que avanzó mientras frenaba, en metros, no el instante.' }
    ];
    var correcta = seg(tc);
    if (!bastan(correcta, falsas)) return null;
    return ejercicio('Velocidad contra tiempo de ' + azar(['un auto', 'un autobús', 'una motocicleta', 'un ciclista']) + ' que frena ante un semáforo. ¿En qué instante se detiene?', d.svg, correcta, falsas, {
      tema: 'Leer un valor',
      pasos: ['Se detiene cuando su velocidad es cero: donde la recta toca el eje del tiempo.',
        'Eso pasa en <b>t = ' + seg(tc) + '</b>; de ahí en adelante su velocidad sigue en cero.'],
      datos: { eje: 'v', pide: 'detiene' }
    });
  }

  function genValor(nivel) {
    for (var i = 0; i < 400; i++) {
      var e = nivel === 1 ? valorPosicion()
        : nivel === 2 ? (moneda() ? valorInstante() : valorVelocidad())
        : azar([valorDetiene, valorDetiene, valorInstante, valorVelocidad])();
      if (e) return e;
    }
    return null;
  }

  M.GENERADORES['leer-velocidad'] = genVelocidad;
  M.GENERADORES['leer-corte'] = genCorte;
  M.GENERADORES['leer-area'] = genArea;
  M.GENERADORES['leer-aceleracion'] = genAceleracion;
  M.GENERADORES['leer-valor'] = genValor;

  M.graficasLeer = { grafica: grafica, escala: escala, G: G };
})();
