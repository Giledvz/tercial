/*
 * ejercicios-cuadraticas-sistemas.js — generadores de la semana 8 de Fundamentos (Matemáticas):
 * ecuaciones de segundo grado y sistemas 2 × 2, para la práctica sin fin y el reto.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se cargan después
 * de él. Aquí va lo que le falta al motor y dos versiones propias de los suyos:
 *
 *   cs-incompleta     incompletas: x² = 25, 2x² − 18 = 0, x² − 3x = 0, x² + 9 = 0… El error de
 *                     siempre, perder una raíz, es una de las opciones en todas.
 *   cs-factoriza      x² + bx + c = 0 por factorización, con la regla de la semana 6 (dos números
 *                     que multiplicados den c y sumados den b). Sustituye a «cuadratica» del motor,
 *                     cuyo primer paso busca números que sumen −b (las raíces) y contradice esa regla.
 *   cs-discriminante  b² − 4ac y cuántas soluciones reales tiene; en el nivel 3, la ecuación no
 *                     viene igualada a cero.
 *   cs-formula        la fórmula general: raíces enteras (nivel 1), con fracciones (nivel 2) y con
 *                     radicales que hay que simplificar (nivel 3).
 *   cs-sistema        sistema 2 × 2 por eliminación, con los pasos de la cuenta. Sustituye a
 *                     «sistemas» del motor, que no muestra cómo se resuelve.
 *   cs-problema       problemas con palabras que se plantean como sistema.
 *
 * Cada generador devuelve { enunciado, correcta, opciones: [{ val, ok, err }], meta }: cuatro
 * opciones, una correcta, y cada falsa es un error real con su explicación. meta.datos guarda la
 * ecuación o el sistema en números, para comprobar las respuestas con un script aparte.
 * Toda la aritmética es exacta (enteros y fracciones). Ninguno repite una ecuación o un sistema
 * de la tarea (examenes-pdf/tarea-cuadraticas-sistemas.html): EN_LA_TAREA los evita.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MIN = '−';

  /* ---------- Aritmética exacta ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function fr(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  function fval(f) { return f.n / f.d; }
  function fkey(f) { return f.n + '/' + f.d; }
  function cuadradoPerfecto(n) {
    if (n < 0) return -1;
    var r = Math.round(Math.sqrt(n));
    return r * r === n ? r : -1;
  }
  // √n = k√m, con m libre de cuadrados.
  function raizSimple(n) {
    var k = 1, m = n;
    for (var p = 2; p * p <= m; p++) while (m % (p * p) === 0) { m /= p * p; k *= p; }
    return { k: k, m: m };
  }

  /* ---------- Azar ---------- */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var x; do { x = rint(a, b); } while (x === 0); return x; }
  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function coin() { return Math.random() < 0.5; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- Escritura ---------- */
  function num(n) { return n < 0 ? MIN + (-n) : String(n); }
  function par(n) { return n < 0 ? '(' + MIN + (-n) + ')' : String(n); }
  // «+ 3» o «− 3», para escribir después de otro término.
  function mas(n) { return n < 0 ? MIN + ' ' + (-n) : '+ ' + n; }
  function apilada(arriba, abajo) {
    return '<span class="fr"><span class="fr__n">' + arriba + '</span><span class="fr__d">' + abajo + '</span></span>';
  }
  // Una fracción: entera si se puede; si no, apilada, con el signo afuera.
  function fraccion(f) {
    if (f.d === 1) return num(f.n);
    return (f.n < 0 ? MIN : '') + apilada(Math.abs(f.n), f.d);
  }
  // Mitades con punto decimal: 49 ÷ 2 = 24.5.
  function decimal(f) {
    if (f.d === 1) return num(f.n);
    var entero = Math.floor(Math.abs(f.n) / 2);
    return (f.n < 0 ? MIN : '') + entero + '.5';
  }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function dinero(n) { return '$' + miles(n); }
  // Un polinomio en x: términos [coeficiente, grado], del grado mayor al menor; los ceros no se escriben.
  function poli(terminos) {
    var s = '';
    terminos.forEach(function (t) {
      var c = t[0], g = t[1];
      if (c === 0) return;
      var abs = Math.abs(c);
      var cuerpo = g === 0 ? String(abs) : (abs === 1 ? '' : abs) + (g === 2 ? 'x²' : 'x');
      if (s === '') s = (c < 0 ? MIN : '') + cuerpo;
      else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + cuerpo;
    });
    return s || '0';
  }
  function cuad(a, b, c) { return poli([[a, 2], [b, 1], [c, 0]]); }
  // a·x + b·y = c, con a > 0.
  function ecu(a, b, c) {
    var t1 = (a === 1 ? '' : a === -1 ? MIN : num(a)) + 'x';
    var t2 = (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y';
    return t1 + (b < 0 ? ' ' + MIN + ' ' : ' + ') + t2 + ' = ' + num(c);
  }
  // «2(3)», «(−3)»: un coeficiente por un valor, para sustituir.
  function por(coef, val) { return coef === 1 ? par(val) : coef + '(' + num(val) + ')'; }
  // El coeficiente de una letra: 1 no se escribe y −1 es sólo el signo.
  function coef(n) { return n === 1 ? '' : n === -1 ? MIN : num(n); }
  // Un sistema en dos renglones: sin la hoja de la lección, el <br> los sigue separando.
  function sistemaHTML(e1, e2) {
    return '<span class="cs-sistema">' + ecu(e1[0], e1[1], e1[2]) + '<br>' + ecu(e2[0], e2[1], e2[2]) + '</span>';
  }

  /* ---------- Respuestas: { k: clave para comparar, h: lo que se ve } ---------- */
  var NINGUNA = { k: 'ninguna', h: 'No tiene solución real' };
  // Raíces racionales de menor a mayor: «x = −3, 2»; dos opuestas, con «conMasMenos», «x = ±3».
  function raices(lista, conMasMenos) {
    var vistas = {}, unicas = [];
    lista.forEach(function (f) {
      f = fr(f.n, f.d);
      if (!vistas[fkey(f)]) { vistas[fkey(f)] = true; unicas.push(f); }
    });
    unicas.sort(function (p, q) { return fval(p) - fval(q); });
    var clave = 'rt:' + unicas.map(fkey).join(',');
    if (conMasMenos && unicas.length === 2 && unicas[0].n === -unicas[1].n && unicas[0].d === unicas[1].d) {
      return { k: clave, h: 'x = ±' + fraccion(unicas[1]) };
    }
    return { k: clave, h: 'x = ' + unicas.map(fraccion).join(', ') };
  }
  function ent(n) { return fr(n, 1); }
  // x = (P ± K√m) / D, simplificada; con «uno», sólo la raíz con +.
  function radical(P, K, m, D, uno) {
    if (D < 0) { P = -P; D = -D; }
    K = Math.abs(K);
    var g = gcd(gcd(P, K), D) || 1;
    P /= g; K /= g; D /= g;
    var r = (K === 1 ? '' : K) + '√' + m;
    var arriba = uno ? (P === 0 ? r : num(P) + ' + ' + r) : (P === 0 ? '±' + r : num(P) + ' ± ' + r);
    return { k: (uno ? 'ir1:' : 'ir:') + P + ',' + K + ',' + m + ',' + D, h: 'x = ' + (D === 1 ? arriba : apilada(arriba, D)) };
  }
  // Lo que da la fórmula con −b = p, discriminante q y denominador d, aunque vengan de un error.
  function porFormula(p, q, d) {
    if (q < 0) return NINGUNA;
    var s = cuadradoPerfecto(q);
    if (s >= 0) return raices([fr(p + s, d), fr(p - s, d)]);
    var rs = raizSimple(q);
    return radical(p, rs.k, rs.m, d);
  }
  function parXY(x, y) { return { k: 'xy:' + fkey(x) + ',' + fkey(y), h: 'x = ' + fraccion(x) + ', y = ' + fraccion(y) }; }
  function cantidad(v, unidad) { return { k: 'n:' + v, h: unidad ? miles(v) + ' ' + unidad : miles(v) }; }
  function precio(v) { return { k: 'n:' + v, h: dinero(v) }; }

  /* ---------- Lo que ya está en la tarea no se repite ---------- */
  function claveCuad(a, b, c) {
    var g = gcd(gcd(a, b), c) || 1;
    if (a < 0) g = -g;
    return 'q:' + a / g + ',' + b / g + ',' + c / g;
  }
  function claveEc(e) {
    var g = gcd(gcd(e[0], e[1]), e[2]) || 1;
    var primero = e[0] !== 0 ? e[0] : e[1];
    if (primero < 0) g = -g;
    return e[0] / g + ',' + e[1] / g + ',' + e[2] / g;
  }
  function claveSist(e1, e2) { return 's:' + [claveEc(e1), claveEc(e2)].sort().join('|'); }
  var EN_LA_TAREA = {};
  [[1, 0, -64], [1, 0, -121], [5, 0, -45], [4, 0, -25], [1, -7, 0], [1, 4, 0], [3, -12, 0], [1, 0, 16],
    [1, -8, 16], [1, 3, -10], [1, 1, 5], [2, -5, 4], [3, 2, -1], [4, -12, 9],
    [1, -7, 12], [1, -2, -15], [1, 1, -20], [2, 10, 12],
    [2, 5, -3], [3, -7, 2], [4, -4, -3], [1, -4, 1],
    [1, 0, -36], [1, -8, 0], [1, -3, -4]
  ].forEach(function (q) { EN_LA_TAREA[claveCuad(q[0], q[1], q[2])] = true; });
  [[[1, 1, 9], [1, -1, 3]], [[2, 1, 7], [1, -1, 2]], [[3, 2, 12], [1, 2, 8]], [[2, 3, 1], [3, -1, 7]],
    [[1, 1, 20], [2, 4, 64]], [[2, 3, 120], [1, 2, 70]], [[1, 1, 31], [1, -1, 9]]
  ].forEach(function (s) { EN_LA_TAREA[claveSist(s[0], s[1])] = true; });

  /* ---------- Ensamble ---------- */
  // La correcta y tres falsas distintas: las «fijas» entran siempre, las «otras» se eligen al azar
  // y las de «respaldo» sólo si todavía faltan. Devuelve null si no se juntan cuatro opciones.
  function armar(enunciado, correcta, grupos, meta) {
    var vistas = {}, elegidas = [];
    vistas[correcta.k] = true;
    function toma(c) {
      if (elegidas.length < 3 && c && c.val && !vistas[c.val.k]) { vistas[c.val.k] = true; elegidas.push(c); }
    }
    (grupos.fijas || []).forEach(toma);
    barajar(grupos.otras || []).forEach(toma);
    (grupos.respaldo || []).forEach(toma);
    if (elegidas.length < 3) return null;
    var opciones = [{ val: correcta, ok: true }].concat(elegidas.map(function (c) {
      return { val: c.val, ok: false, err: c.err };
    }));
    meta.pasos = meta.pasos.filter(Boolean);
    return { enunciado: enunciado, correcta: correcta, opciones: barajar(opciones), meta: meta };
  }

  // Reintenta hasta tener cuatro opciones y un ejercicio que no esté en la tarea.
  function sinRepetirTarea(arma) {
    return function (nivel) {
      var e = null;
      for (var i = 0; i < 200; i++) {
        e = arma(nivel);
        if (e && !EN_LA_TAREA[e.meta.datos.clave]) return e;
      }
      return e;
    };
  }

  /* ================= cs-incompleta ================= */
  function armaIncompleta(nivel) {
    var tipo = azar(nivel === 1 ? ['pura', 'mixta']
      : nivel === 2 ? ['pura', 'mixta', 'pura-a', 'mixta-a', 'sin']
      : ['pura-fr', 'mixta-fr', 'lados', 'pura-a', 'sin-a']);
    var enun, correcta, grupos, pasos, std, a, b, c, r, k, m, s, raiz, cero;

    if (tipo === 'pura') {                          // x² = k  o  x² − k = 0
      r = nivel === 1 ? rint(3, 12) : rint(4, 15);
      k = r * r;
      cero = coin();
      enun = cero ? 'x² ' + MIN + ' ' + k + ' = 0' : 'x² = ' + k;
      std = [1, 0, -k];
      correcta = raices([ent(-r), ent(r)], true);
      grupos = {
        fijas: [{ val: raices([ent(r)]), err: 'Falta la raíz negativa: (' + MIN + r + ')² = ' + k + ' también. Al sacar raíz salen dos: x = ±' + r + '.' }],
        otras: [
          { val: raices([ent(-k), ent(k)], true), err: 'Falta sacar la raíz: x² = ' + k + ' pide un número que multiplicado por sí mismo dé ' + k + ', y ése es ' + r + ' (o ' + MIN + r + ').' },
          { val: { k: 'rt:' + fkey(fr(k, 2)), h: 'x = ' + decimal(fr(k, 2)) }, err: 'x² no es x por 2, es x por x: no se divide entre 2, se saca raíz cuadrada. √' + k + ' = ' + r + '.' }
        ].concat(cero ? [{ val: NINGUNA, err: 'El ' + MIN + k + ' pasa al otro lado sumando: x² = ' + k + ', que es positivo. Sí hay solución: x = ±' + r + '.' }] : [])
      };
      pasos = [
        cero ? 'Pasa el ' + MIN + k + ' al otro lado, sumando: x² = ' + k + '.' : null,
        'Saca raíz cuadrada. Hay dos números que al cuadrado dan ' + k + ': ' + r + ' y ' + MIN + r + '.',
        'Soluciones: <b>x = ±' + r + '</b>, es decir, x = ' + r + ' o x = ' + MIN + r + '.'
      ];
    } else if (tipo === 'mixta') {                  // x² + bx = 0
      m = nivel === 1 ? rint(2, 9) : rint(2, 15);
      b = (coin() ? 1 : -1) * m;
      raiz = -b;
      enun = cuad(1, b, 0) + ' = 0';
      std = [1, b, 0];
      correcta = raices([ent(0), ent(raiz)]);
      grupos = {
        fijas: [{ val: raices([ent(raiz)]), err: 'Al dividir entre x se pierde x = 0, que también cumple: 0² ' + mas(b) + '(0) = 0. En vez de dividir, saca x de factor común.' }],
        otras: [
          { val: raices([ent(0), ent(-raiz)]), err: 'De x ' + mas(b) + ' = 0 sale x = ' + num(raiz) + ': el número cambia de signo al pasar al otro lado.' },
          { val: raices([ent(0)]), err: 'x(x ' + mas(b) + ') = 0 tiene dos factores y cada uno da una solución: falta x ' + mas(b) + ' = 0, o sea x = ' + num(raiz) + '.' }
        ],
        respaldo: [{ val: raices([ent(-m), ent(m)], true), err: 'No es x² = ' + m * m + ': el término ' + num(b) + 'x lleva x, así que no se saca raíz; se saca x de factor común.' }]
      };
      pasos = [
        'Saca x de factor común: x(x ' + mas(b) + ') = 0.',
        'Si un producto vale 0, algún factor vale 0: x = 0, o bien x ' + mas(b) + ' = 0.',
        'De x ' + mas(b) + ' = 0 sale x = ' + num(raiz) + '. Soluciones: <b>x = 0 y x = ' + num(raiz) + '</b>.'
      ];
    } else if (tipo === 'pura-a') {                 // ax² = c  o  ax² − c = 0
      a = rint(2, 5);
      r = rint(2, nivel === 2 ? 7 : 9);
      c = a * r * r;
      cero = coin();
      enun = cero ? a + 'x² ' + MIN + ' ' + c + ' = 0' : a + 'x² = ' + c;
      std = [a, 0, -c];
      correcta = raices([ent(-r), ent(r)], true);
      var resta = c - a, rr = cuadradoPerfecto(resta);
      grupos = {
        fijas: [{ val: raices([ent(r)]), err: 'Falta la raíz negativa: (' + MIN + r + ')² = ' + r * r + ' también. Son dos: x = ±' + r + '.' }],
        otras: [
          { val: raices([ent(-r * r), ent(r * r)], true), err: 'Ya tienes x² = ' + r * r + '; falta sacar raíz: √' + r * r + ' = ' + r + '.' },
          { val: rr >= 0 ? raices([ent(-rr), ent(rr)], true) : { k: 'sq:' + resta, h: 'x = ±√' + resta },
            err: 'El ' + a + ' multiplica a x²: pasa dividiendo, no restando. x² = ' + c + ' ÷ ' + a + ' = ' + r * r + '.' }
        ].concat(cero ? [{ val: NINGUNA, err: 'El ' + MIN + c + ' pasa al otro lado sumando: ' + a + 'x² = ' + c + ', positivo. Sí hay solución.' }] : [])
      };
      pasos = [
        cero ? 'Pasa el ' + MIN + c + ' al otro lado, sumando: ' + a + 'x² = ' + c + '.' : null,
        'Divide entre ' + a + ': x² = ' + r * r + '.',
        'Saca raíz: <b>x = ±' + r + '</b>, es decir, x = ' + r + ' o x = ' + MIN + r + '.'
      ];
    } else if (tipo === 'mixta-a') {                // ax² + bx = 0, con raíz entera
      a = rint(2, 5);
      m = rint(1, 6);
      s = coin() ? 1 : -1;
      b = a * s * m;
      raiz = -s * m;
      enun = cuad(a, b, 0) + ' = 0';
      std = [a, b, 0];
      correcta = raices([ent(0), ent(raiz)]);
      var comun = a + 'x(x ' + mas(s * m) + ')';
      grupos = {
        fijas: [{ val: raices([ent(raiz)]), err: 'Al dividir entre x se pierde x = 0, que también cumple. En vez de dividir, saca ' + a + 'x de factor común: ' + comun + ' = 0.' }],
        otras: [
          { val: raices([ent(0), ent(-raiz)]), err: 'De x ' + mas(s * m) + ' = 0 sale x = ' + num(raiz) + ': el número cambia de signo al pasar al otro lado.' },
          { val: raices([ent(0), ent(-b)]), err: 'Falta dividir entre ' + a + ': de ' + a + 'x = ' + num(-b) + ' sale x = ' + num(raiz) + '.' }
        ],
        respaldo: [{ val: raices([ent(0)]), err: comun + ' = 0 tiene dos factores con x, y cada uno da una solución: falta x ' + mas(s * m) + ' = 0.' }]
      };
      pasos = [
        'Saca ' + a + 'x de factor común: ' + comun + ' = 0.',
        'Si un producto vale 0, algún factor vale 0: ' + a + 'x = 0 da x = 0, y x ' + mas(s * m) + ' = 0 da x = ' + num(raiz) + '.',
        'Soluciones: <b>x = 0 y x = ' + num(raiz) + '</b>.'
      ];
    } else if (tipo === 'sin' || tipo === 'sin-a') { // x² + k = 0  o  ax² + c = 0: ninguna real
      a = tipo === 'sin' ? 1 : rint(2, 5);
      r = tipo === 'sin' ? rint(2, 10) : rint(2, 6);
      c = a * r * r;
      enun = (a === 1 ? '' : a) + 'x² + ' + c + ' = 0';
      std = [a, 0, c];
      correcta = NINGUNA;
      var despeje = a === 1 ? 'x² = ' + MIN + c : a + 'x² = ' + MIN + c + ', o sea x² = ' + MIN + r * r;
      grupos = {
        fijas: [{ val: raices([ent(-r), ent(r)], true), err: 'El +' + c + ' pasa restando: ' + despeje + '. Ningún número al cuadrado da negativo: ' + r + '² y (' + MIN + r + ')² dan ' + r * r + '.' }],
        otras: [
          { val: raices([ent(-r)]), err: '(' + MIN + r + ')² = ' + r * r + ', positivo: no hay número que al cuadrado dé ' + MIN + r * r + '.' },
          { val: raices([ent(0)]), err: 'Con x = 0 queda ' + c + ', no 0.' }
        ],
        respaldo: [{ val: raices([ent(-r * r), ent(r * r)], true), err: 'Mira el signo: queda x² = ' + MIN + r * r + ', y ningún número al cuadrado da negativo.' }]
      };
      pasos = [
        'Pasa el ' + c + ' al otro lado, restando: ' + despeje + '.',
        'Un número al cuadrado nunca es negativo: ' + r + '² = ' + r * r + ' y (' + MIN + r + ')² = ' + r * r + '.',
        '<b>No tiene solución real.</b>'
      ];
    } else if (tipo === 'pura-fr') {                // q²x² = p²: x = ±p/q
      var p, q;
      do { q = rint(2, 5); p = rint(2, 9); } while (gcd(p, q) !== 1);
      a = q * q;
      c = p * p;
      cero = coin();
      enun = cero ? a + 'x² ' + MIN + ' ' + c + ' = 0' : a + 'x² = ' + c;
      std = [a, 0, -c];
      correcta = raices([fr(-p, q), fr(p, q)], true);
      grupos = {
        fijas: [{ val: raices([fr(p, q)]), err: 'Falta la raíz negativa: (' + MIN + fraccion(fr(p, q)) + ')² da lo mismo. Son dos: x = ±' + fraccion(fr(p, q)) + '.' }],
        otras: [
          { val: raices([fr(-c, a), fr(c, a)], true), err: 'x² = ' + fraccion(fr(c, a)) + ' todavía es x²: falta sacar raíz arriba y abajo, √' + c + ' = ' + p + ' y √' + a + ' = ' + q + '.' },
          { val: raices([fr(-p, a), fr(p, a)], true), err: 'La raíz es de toda la fracción: también del ' + a + ' de abajo, √' + a + ' = ' + q + '.' }
        ].concat(cero ? [{ val: NINGUNA, err: 'El ' + MIN + c + ' pasa al otro lado sumando: ' + a + 'x² = ' + c + ', positivo. Sí hay solución.' }] : []),
        respaldo: [{ val: raices([fr(-q, p), fr(q, p)], true), err: 'La fracción no se voltea: x² = ' + fraccion(fr(c, a)) + ' da x = ±' + fraccion(fr(p, q)) + '.' }]
      };
      pasos = [
        cero ? 'Pasa el ' + MIN + c + ' al otro lado, sumando: ' + a + 'x² = ' + c + '.' : null,
        'Divide entre ' + a + ': x² = ' + fraccion(fr(c, a)) + '.',
        'Saca raíz arriba y abajo, √' + c + ' = ' + p + ' y √' + a + ' = ' + q + ': <b>x = ±' + fraccion(fr(p, q)) + '</b>.'
      ];
    } else if (tipo === 'mixta-fr') {               // ax² + bx = 0, con raíz −b/a fraccionaria
      a = rint(2, 6);
      do { b = nz(-9, 9); } while (b % a === 0);
      enun = cuad(a, b, 0) + ' = 0';
      std = [a, b, 0];
      var rf = fr(-b, a);
      correcta = raices([ent(0), rf]);
      grupos = {
        fijas: [{ val: raices([rf]), err: 'Al dividir entre x se pierde x = 0, que también cumple. Saca x de factor común: x(' + a + 'x ' + mas(b) + ') = 0.' }],
        otras: [
          { val: raices([ent(0), fr(b, a)]), err: 'De ' + a + 'x ' + mas(b) + ' = 0 sale ' + a + 'x = ' + num(-b) + ': el ' + Math.abs(b) + ' cambia de signo al pasar al otro lado.' },
          { val: raices([ent(0), fr(-a, b)]), err: 'De ' + a + 'x = ' + num(-b) + ' sale x = ' + fraccion(rf) + ': el ' + a + ' que multiplica a x pasa dividiendo, abajo.' },
          { val: raices([ent(0), ent(-b)]), err: 'Falta dividir entre ' + a + ': de ' + a + 'x = ' + num(-b) + ' sale x = ' + fraccion(rf) + '.' }
        ]
      };
      pasos = [
        'Saca x de factor común: x(' + a + 'x ' + mas(b) + ') = 0.',
        'Un factor da x = 0; el otro, ' + a + 'x ' + mas(b) + ' = 0, da ' + a + 'x = ' + num(-b) + '.',
        'Divide entre ' + a + ': x = ' + fraccion(rf) + '. Soluciones: <b>x = 0 y x = ' + fraccion(rf) + '</b>.'
      ];
    } else {                                        // lados: ax² = bx
      a = rint(1, 5);
      do { b = nz(-12, 12); } while (b === a);
      enun = (a === 1 ? '' : a) + 'x² = ' + (b === 1 ? '' : b === -1 ? MIN : num(b)) + 'x';
      std = [a, -b, 0];
      var rl = fr(b, a), factor = poli([[a, 1], [-b, 0]]);
      correcta = raices([ent(0), rl]);
      grupos = {
        fijas: [{ val: raices([rl]), err: 'Al dividir los dos lados entre x se pierde x = 0, que también cumple: con x = 0 los dos lados valen 0. Pasa todo a un lado y saca factor común.' }],
        otras: [
          { val: raices([ent(0), fr(-b, a)]), err: 'Al pasar el ' + num(b) + 'x al otro lado cambia de signo: ' + cuad(a, -b, 0) + ' = 0, y de ahí x = ' + fraccion(rl) + '.' },
          a !== 1 ? { val: raices([ent(0), ent(b)]), err: 'Falta dividir entre ' + a + ': de ' + a + 'x = ' + num(b) + ' sale x = ' + fraccion(rl) + '.' } : null
        ],
        respaldo: [{ val: raices([ent(0)]), err: 'x(' + factor + ') = 0 tiene dos factores y cada uno da una solución: también x = ' + fraccion(rl) + '.' }]
      };
      pasos = [
        'Pasa todo a un lado: ' + cuad(a, -b, 0) + ' = 0. No dividas entre x: se perdería x = 0.',
        'Saca x de factor común: x(' + factor + ') = 0.',
        'x = 0, o bien ' + factor + ' = 0, que da x = ' + fraccion(rl) + '. Soluciones: <b>x = 0 y x = ' + fraccion(rl) + '</b>.'
      ];
    }
    return armar(enun, correcta, grupos, {
      tema: 'Ecuaciones incompletas', ask: 'Resuelve', pasos: pasos,
      datos: { tipo: 'cuadratica', subtipo: tipo, std: std, clave: claveCuad(std[0], std[1], std[2]) }
    });
  }

  /* ================= cs-factoriza ================= */
  // x² + bx + c = 0 que se factoriza: dos números que multiplicados den c y sumados den b
  // (la regla de la semana 6). Las raíces son esos números con el signo cambiado.
  function armaFactoriza(nivel) {
    var p, q, g = 0;
    do {
      g++;
      if (nivel === 1) { var sg = coin() ? 1 : -1; p = sg * rint(1, 6); q = sg * rint(1, 6); }
      else { p = nz(nivel === 2 ? -8 : -11, nivel === 2 ? 8 : 11); q = nz(nivel === 2 ? -8 : -11, nivel === 2 ? 8 : 11); }
    } while (g < 200 && (p === q || p === -q));
    var b = p + q, c = p * q, r1 = -p, r2 = -q;
    var factor = function (n) { return '(x ' + mas(n) + ')'; };
    // Nivel 3: a veces la ecuación no viene igualada a cero.
    var forma = nivel === 3 ? azar(['cero', 'lados', 'producto']) : 'cero';
    var enun = forma === 'lados' ? 'x² = ' + poli([[-b, 1], [-c, 0]])
      : forma === 'producto' ? 'x(x ' + mas(b) + ') = ' + num(-c)
      : cuad(1, b, c) + ' = 0';
    var cands = [
      { val: raices([ent(r1), ent(-r2)]), err: 'Revisa ' + factor(q) + ': x ' + mas(q) + ' = 0 da x = ' + num(r2) + ', no ' + num(-r2) + '.' },
      { val: raices([ent(-r1), ent(r2)]), err: 'Revisa ' + factor(p) + ': x ' + mas(p) + ' = 0 da x = ' + num(r1) + ', no ' + num(-r1) + '.' }
    ];
    // Otro par que da el mismo producto, pero no la misma suma.
    var pares = [];
    for (var d = 1; d <= Math.abs(c); d++) {
      if (Math.abs(c) % d) continue;
      [[d, c / d], [-d, -c / d]].forEach(function (uv) {
        if (uv[0] + uv[1] !== b && uv[0] + uv[1] !== -b && uv[0] <= uv[1]) pares.push(uv);
      });
    }
    if (pares.length) {
      var uv = azar(pares);
      cands.push({ val: raices([ent(-uv[0]), ent(-uv[1])]), err: num(uv[0]) + ' y ' + num(uv[1]) + ' multiplicados dan ' + num(c) + ', pero sumados dan ' + num(uv[0] + uv[1]) + ', no ' + num(b) + '.' });
    }
    var pasos = [
      forma !== 'cero' ? 'Pasa todo a un lado: ' + cuad(1, b, c) + ' = 0.' : null,
      'Busca dos números que multiplicados den ' + num(c) + ' y sumados den ' + num(b) + ': ' + num(p) + ' y ' + num(q) + '.',
      'Factoriza: ' + factor(p) + factor(q) + ' = 0.',
      'Cada factor a cero: x ' + mas(p) + ' = 0 da x = ' + num(r1) + ', y x ' + mas(q) + ' = 0 da x = ' + num(r2) + '. Soluciones: <b>' + raices([ent(r1), ent(r2)]).h + '</b>.'
    ];
    return armar(enun, raices([ent(r1), ent(r2)]), {
      fijas: [{ val: raices([ent(-r1), ent(-r2)]), err: 'Las raíces son los números de los factores con el signo cambiado: x ' + mas(p) + ' = 0 da x = ' + num(r1) + '.' }],
      otras: cands,
      respaldo: [{ val: raices([ent(r1)]), err: 'Son dos factores y cada uno da una solución: también x ' + mas(q) + ' = 0, o sea x = ' + num(r2) + '.' }]
    }, {
      tema: 'Factorización', ask: 'Resuelve', pasos: pasos,
      datos: { tipo: 'cuadratica', subtipo: 'factoriza', std: [1, b, c], forma: forma, clave: claveCuad(1, b, c) }
    });
  }

  /* ================= cs-discriminante ================= */
  function claseDe(v) { return v > 0 ? 'dos' : v === 0 ? 'una' : 'ninguna'; }
  var CLASE = { dos: 'dos soluciones', una: 'una solución', ninguna: 'ninguna real' };
  function disc(v, clase) { clase = clase || claseDe(v); return { k: 'd:' + v + ':' + clase, h: num(v) + ': ' + CLASE[clase] }; }

  function armaDiscriminante(nivel) {
    var clase = azar(['dos', 'una', 'ninguna']);
    var a, b, c, p, q, g = 0;
    do {
      g++;
      if (clase === 'una') {                       // (px + q)²: b² = 4ac
        p = nivel === 1 ? 1 : azar([1, 2, 3]);
        q = nz(nivel === 1 ? -7 : -5, nivel === 1 ? 7 : 5);
        a = p * p; b = 2 * p * q; c = q * q;
      } else {
        a = nivel === 1 ? 1 : rint(1, 4);
        b = rint(nivel === 1 ? -9 : -10, nivel === 1 ? 9 : 10);
        c = nz(nivel === 1 ? -15 : -12, nivel === 1 ? 15 : 12);
      }
    } while (g < 300 && (claseDe(b * b - 4 * a * c) !== clase || gcd(gcd(a, b), c) !== 1 ||
      Math.abs(b) > 12 || Math.abs(4 * a * c) > 150 ||
      (clase === 'una' && nivel > 1 && a === 1 && Math.abs(q) < 2)));
    var D = b * b - 4 * a * c;

    // Nivel 3: la ecuación no viene igualada a cero; un término está del otro lado.
    var enun = cuad(a, b, c) + ' = 0', movido = null;
    if (nivel === 3) {
      movido = b !== 0 && coin() ? 'b' : 'c';
      enun = movido === 'b' ? cuad(a, 0, c) + ' = ' + poli([[-b, 1]]) : cuad(a, b, 0) + ' = ' + num(-c);
    }
    var cands = [];
    var lectura = D === 0 ? { val: disc(0, 'ninguna'), err: 'Cero no quiere decir «ninguna»: con b² − 4ac = 0 hay una solución; la parábola toca el eje en un punto.' }
      : D < 0 ? { val: disc(D, 'dos'), err: 'Un discriminante negativo no da dos soluciones: no existe la raíz cuadrada de un número negativo, así que no hay ninguna real.' }
      : cuadradoPerfecto(D) < 0 ? { val: disc(D, 'ninguna'), err: 'Aunque ' + D + ' no tenga raíz exacta, es positivo: hay dos soluciones, con radical.' }
      : { val: disc(D, 'una'), err: 'Positivo da dos soluciones: una sumando la raíz y otra restándola.' };
    if (movido === 'c') {
      cands.push({ val: disc(b * b + 4 * a * c), err: 'Al pasar el ' + num(-c) + ' al otro lado cambia de signo: queda ' + cuad(a, b, c) + ' = 0, con c = ' + num(c) + '.' });
    } else {
      cands.push({ val: disc(b * b + 4 * a * c), err: a * c < 0
        ? 'Cuida el signo: −4ac = −4(' + a + ')(' + num(c) + ') = +' + (-4 * a * c) + ', porque menos por menos da más. Se suma.'
        : 'Cuida el signo: −4ac = −4(' + a + ')(' + num(c) + ') = ' + num(-4 * a * c) + '. Se resta.' });
    }
    if (movido === 'b') cands.push({ val: disc(-4 * a * c), err: 'Primero pasa todo a un lado: ' + cuad(a, b, c) + ' = 0. El ' + poli([[-b, 1]]) + ' también cuenta: b = ' + num(b) + '.' });
    if (b < 0) cands.push({ val: disc(-b * b - 4 * a * c), err: '(' + MIN + Math.abs(b) + ')² = ' + b * b + ', positivo: un negativo al cuadrado da positivo.' });
    cands.push({ val: disc(b * b - a * c), err: 'Falta el 4: el discriminante es b² − 4ac.' });
    if (b !== 0 && b !== 2) cands.push({ val: disc(2 * b - 4 * a * c), err: 'b² es b por b, no 2 por b: ' + par(b) + '² = ' + b * b + '.' });

    var pasos = [
      movido ? 'Pasa todo a un lado: ' + cuad(a, b, c) + ' = 0.' : null,
      'Lee los coeficientes con su signo: a = ' + num(a) + ', b = ' + num(b) + ', c = ' + num(c) + '.',
      'b² − 4ac = ' + par(b) + '² − 4(' + a + ')(' + num(c) + ') = ' + b * b + ' ' + mas(-4 * a * c) + ' = <b>' + num(D) + '</b>.',
      D > 0 ? 'Positivo: <b>dos soluciones</b>. La parábola corta el eje dos veces.'
        : D === 0 ? 'Cero: <b>una solución</b>. La parábola toca el eje en un punto.'
        : 'Negativo: <b>ninguna solución real</b>. La parábola no llega al eje.'
    ];
    return armar(enun, disc(D), { fijas: [lectura], otras: cands }, {
      tema: 'Discriminante', ask: 'Calcula el discriminante', pasos: pasos,
      datos: { tipo: 'discriminante', std: [a, b, c], movido: movido, clave: claveCuad(a, b, c) }
    });
  }

  /* ================= cs-formula ================= */
  function armaFormula(nivel) {
    var a, b, c, D, s, correcta, pasos, otras = [], respaldo = [];
    if (nivel < 3) {
      var r1, r2;
      if (nivel === 1) {                          // a = 1, raíces enteras
        do { r1 = nz(-9, 9); r2 = nz(-9, 9); } while (r1 === r2 || r1 === -r2);
        a = 1; b = -(r1 + r2); c = r1 * r2;
        r1 = ent(r1); r2 = ent(r2);
      } else {                                    // (px − q)(sx − t): a = ps, raíces q/p y t/s
        var p, q, t, ss, g = 0;
        do {
          g++;
          var pareja = azar([[2, 1], [3, 1], [4, 1], [5, 1], [2, 3], [3, 2], [2, 2]]);
          p = pareja[0]; ss = pareja[1];
          q = nz(-7, 7); t = nz(-7, 7);
          a = p * ss; b = -(p * t + q * ss); c = q * t;
        } while (g < 400 && (gcd(p, q) !== 1 || gcd(ss, t) !== 1 || fkey(fr(q, p)) === fkey(fr(t, ss)) ||
          b === 0 || gcd(gcd(a, b), c) !== 1 || Math.abs(b) > 20 || Math.abs(c) > 30 || b * b - 4 * a * c > 400 ||
          (fr(q, p).d === 1 && fr(t, ss).d === 1)));
        r1 = fr(q, p); r2 = fr(t, ss);
      }
      D = b * b - 4 * a * c;
      s = cuadradoPerfecto(D);
      correcta = raices([r1, r2]);
      var mas1 = fr(-b + s, 2 * a), menos1 = fr(-b - s, 2 * a);
      otras = [
        { val: raices([fr(b + s, 2 * a), fr(b - s, 2 * a)]), err: 'La fórmula empieza con −b: como b = ' + num(b) + ', −b = ' + num(-b) + '. Con +b, las raíces salen con el signo al revés.' },
        { val: a === 1 ? raices([ent(-b + s), ent(-b - s)]) : raices([fr(-b + s, 2), fr(-b - s, 2)]),
          err: a === 1 ? 'Falta dividir entre 2a = 2: la raya de la fórmula abarca todo.' : 'El denominador es 2a = ' + 2 * a + ', no 2.' },
        { val: raices([fr(-b * 2 * a + s, 2 * a), fr(-b * 2 * a - s, 2 * a)]), err: 'La raya de la fracción abarca todo: también el ' + num(-b) + ' se divide entre ' + 2 * a + ', no sólo la raíz.' },
        { val: porFormula(-b, b * b + 4 * a * c, 2 * a), err: 'Cuida el signo de −4ac: −4(' + a + ')(' + num(c) + ') = ' + (a * c < 0 ? '+' : '') + num(-4 * a * c) + ', así que b² − 4ac = ' + num(D) + '.' }
      ];
      respaldo = [{ val: raices([mas1]), err: 'El ± da dos soluciones: una sumando la raíz y otra restándola. Falta x = ' + fraccion(menos1) + '.' }];
      var conMas = fr(-b + s, 2 * a), conMenos = fr(-b - s, 2 * a);
      var sinReducir = function (n, d) {
        var f = fr(n, d);
        return d !== 1 && f.d !== d ? (n < 0 ? MIN : '') + apilada(Math.abs(n), d) + ' = ' + fraccion(f) : fraccion(f);
      };
      pasos = [
        'Lee los coeficientes: a = ' + a + ', b = ' + num(b) + ', c = ' + num(c) + '.',
        'b² − 4ac = ' + par(b) + '² − 4(' + a + ')(' + num(c) + ') = ' + D + ', y √' + D + ' = ' + s + '.',
        'x = ' + apilada(num(-b) + ' ± ' + s, 2 * a) + ': con +, x = ' + sinReducir(-b + s, 2 * a) + '; con −, x = ' + sinReducir(-b - s, 2 * a) + '.',
        'Soluciones: <b>' + raices([conMas, conMenos]).h + '</b>.'
      ];
    } else {                                      // raíces con radical: Δ positivo, no cuadrado
      var g3 = 0, rs;
      do {
        g3++;
        a = azar([1, 1, 2, 3]);
        b = rint(-8, 8);
        c = nz(-9, 9);
        D = b * b - 4 * a * c;
        rs = D > 0 ? raizSimple(D) : null;
      } while (g3 < 300 && (D <= 0 || cuadradoPerfecto(D) >= 0 || gcd(gcd(a, b), c) !== 1 || rs.m > 30 || rs.k > 6));
      var k = rs.k, mm = rs.m;
      correcta = radical(-b, k, mm, 2 * a);
      var gg = gcd(gcd(b, k), 2 * a) || 1;
      otras = [
        { val: radical(b, k, mm, 2 * a), err: 'La fórmula empieza con −b: como b = ' + num(b) + ', −b = ' + num(-b) + '.' },
        { val: a === 1 ? radical(-b, k, mm, 1) : radical(-b, k, mm, 2), err: a === 1 ? 'Falta dividir entre 2a = 2: la raya abarca todo.' : 'El denominador es 2a = ' + 2 * a + ', no 2.' },
        { val: radical(-b, k, mm, 2 * a, true), err: 'El ± da dos soluciones: una sumando la raíz y otra restándola.' },
        { val: porFormula(-b, b * b + 4 * a * c, 2 * a), err: 'Cuida el signo de −4ac: −4(' + a + ')(' + num(c) + ') = ' + (a * c < 0 ? '+' : '') + num(-4 * a * c) + ', así que b² − 4ac = ' + D + '.' }
      ];
      if (gg > 1 && b !== 0) {
        // Simplificar dividiendo sólo uno de los términos de arriba.
        otras.push({ val: radical(-b / gg, k, mm, 2 * a / gg), err: 'Para simplificar se dividen entre ' + gg + ' los dos términos de arriba, no sólo el primero.' });
        otras.push({ val: radical(-b, k / gg, mm, 2 * a / gg), err: 'Para simplificar se dividen entre ' + gg + ' los dos términos de arriba, no sólo la raíz.' });
      }
      var raizTxt = (k === 1 ? '' : k) + '√' + mm;
      pasos = [
        'Lee los coeficientes: a = ' + a + ', b = ' + num(b) + ', c = ' + num(c) + '.',
        'b² − 4ac = ' + par(b) + '² − 4(' + a + ')(' + num(c) + ') = ' + D + (k === 1 ? ', que no tiene raíz exacta: se queda √' + D + '.' : ' = ' + k * k + ' × ' + mm + ', así que √' + D + ' = ' + raizTxt + '.'),
        'x = ' + apilada(num(-b) + ' ± ' + raizTxt, 2 * a) + '.',
        gg > 1 ? 'Divide los dos términos de arriba y el de abajo entre ' + gg + ': <b>' + correcta.h + '</b>.' : 'Ya no se simplifica: <b>' + correcta.h + '</b>.'
      ];
    }
    return armar(cuad(a, b, c) + ' = 0', correcta, { otras: otras, respaldo: respaldo }, {
      tema: 'Fórmula general', ask: 'Resuelve con la fórmula general', pasos: pasos,
      datos: { tipo: 'cuadratica', subtipo: 'formula', std: [a, b, c], clave: claveCuad(a, b, c) }
    });
  }

  /* ================= cs-sistema ================= */
  function armaSistema(nivel) {
    var x0, y0, a1, b1, a2, b2, g = 0;
    do {
      g++;
      x0 = nivel === 1 ? rint(1, 9) : nz(nivel === 2 ? -6 : -7, nivel === 2 ? 8 : 7);
      y0 = nivel === 1 ? rint(1, 9) : nz(nivel === 2 ? -6 : -7, nivel === 2 ? 8 : 7);
      if (nivel === 1) {                          // la y ya tiene ±1 en las dos: se suma o se resta
        a1 = rint(1, 3); b1 = 1;
        a2 = rint(1, 3); b2 = coin() ? -1 : 1;
      } else if (nivel === 2) {                   // se multiplica una ecuación
        a1 = rint(1, 5); b1 = (coin() ? 1 : -1) * rint(2, 5);
        a2 = rint(1, 4); b2 = coin() ? 1 : -1;
      } else {                                    // se multiplican las dos
        a1 = rint(1, 6); b1 = (coin() ? 1 : -1) * rint(2, 5);
        a2 = rint(1, 6); b2 = (coin() ? 1 : -1) * rint(2, 5);
      }
    } while (g < 300 && (x0 === y0 || a1 * b2 - a2 * b1 === 0 || (nivel === 3 && gcd(b1, b2) !== 1) ||
      (nivel > 1 && Math.abs(a1 * x0 + b1 * y0) > 60)));
    var c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
    var e1 = [a1, b1, c1], e2 = [a2, b2, c2];

    // Eliminación de la y: cada ecuación se multiplica para que la y quede con el mismo número.
    var L = Math.abs(b1 * b2) / gcd(b1, b2), m1 = L / Math.abs(b1), m2 = L / Math.abs(b2);
    var suma = (b1 > 0) !== (b2 > 0);              // signos opuestos: se suman; iguales: se restan
    var A = m1 * a1 + (suma ? 1 : -1) * m2 * a2, C = m1 * c1 + (suma ? 1 : -1) * m2 * c2;
    // Se sustituye en la ecuación con la y más sencilla.
    var usa = Math.abs(b2) < Math.abs(b1) ? 2 : 1;
    var ea = usa === 1 ? e1 : e2, eo = usa === 1 ? e2 : e1;
    var resto = ea[2] - ea[0] * x0;               // b·y = c − a·x0

    var cands = [{ val: parXY(ent(y0), ent(x0)), err: 'Invertiste los valores: x = ' + num(x0) + ' y y = ' + num(y0) + '. Comprueba sustituyendo en las dos ecuaciones.' }];
    cands.push({ val: parXY(ent(x0), fr(ea[2] + ea[0] * x0, ea[1])),
      err: 'Al despejar y, el ' + num(ea[0] * x0) + ' pasa al otro lado con el signo cambiado: ' + coef(ea[1]) + 'y = ' + num(ea[2]) + ' ' + mas(-ea[0] * x0) + ' = ' + num(resto) + '.' });
    var conY = function (xf) { return fr(ea[2] * xf.d - ea[0] * xf.n, ea[1] * xf.d); };
    if (!suma) {
      var xr = fr(m1 * c1 + m2 * c2, A);
      cands.push({ val: parXY(xr, conY(xr)), err: 'Al restar las ecuaciones se resta todo, también el número de la derecha: ' + num(m1 * c1) + ' ' + MIN + ' ' + par(m2 * c2) + ' = ' + num(C) + '.' });
    }
    if (Math.abs(A) !== 1 && C - A !== x0) {
      var xd = ent(C - A);
      cands.push({ val: parXY(xd, conY(xd)), err: 'El ' + num(A) + ' multiplica a x: pasa dividiendo, no restando. x = ' + num(C) + ' ÷ ' + par(A) + ' = ' + num(x0) + '.' });
    }
    if (m2 !== 1) {
      var xe = fr(m1 * c1 + (suma ? 1 : -1) * c2, A);
      cands.push({ val: parXY(xe, conY(xe)), err: 'Al multiplicar la ' + (m1 !== 1 ? 'segunda ' : '') + 'ecuación por ' + m2 + ' se multiplican los dos lados: también el ' + num(c2) + ', que queda ' + num(m2 * c2) + '.' });
    }
    if (ea[1] < 0) cands.push({ val: parXY(ent(x0), ent(-y0)), err: 'Dividir entre un negativo cambia el signo: ' + coef(ea[1]) + 'y = ' + num(resto) + ' da y = ' + num(y0) + '.' });
    var creible = function (c) {
      var par = c.val.k.slice(3).split(',').map(function (t) { return t.split('/').map(Number); });
      return par.every(function (f) { return Math.abs(f[0] / f[1]) <= 25 && f[1] <= 12; });
    };
    cands = cands.filter(creible);
    var respaldo = [{ val: parXY(ent(-x0), ent(y0)), err: 'Revisa el signo de x: con x = ' + num(-x0) + ' la primera ecuación da ' + num(-a1 * x0 + b1 * y0) + ', no ' + num(c1) + '.' }];

    var ec1 = ecu(m1 * a1, m1 * b1, m1 * c1), ec2 = ecu(m2 * a2, m2 * b2, m2 * c2);
    var multiplica = m1 === 1 && m2 === 1 ? null
      : 'Multiplica ' + (m1 !== 1 && m2 !== 1 ? 'la primera por ' + m1 + ' y la segunda por ' + m2 : m1 !== 1 ? 'la primera por ' + m1 : 'la segunda por ' + m2) +
        ', para que la y quede con el mismo número: ' + ec1 + ' y ' + ec2 + '.';
    var elimina = (suma ? 'Suma las ecuaciones' : 'Resta la segunda de la primera') + ': la y se cancela y queda ' +
      coef(A) + 'x = ' + num(C) + (A === 1 ? '.' : ', así que x = ' + num(x0) + '.');
    var bTxt = coef(ea[1]);
    var sustituye = 'Sustituye x = ' + num(x0) + ' en la ' + (usa === 1 ? 'primera' : 'segunda') + ': ' +
      por(ea[0], x0) + ' ' + (ea[1] < 0 ? MIN : '+') + ' ' + coef(Math.abs(ea[1])) + 'y = ' + num(ea[2]) +
      ', ' + bTxt + 'y = ' + num(resto) + (bTxt === '' ? '.' : ', y = ' + num(y0) + '.');
    var comprueba = 'Comprueba en la otra: ' + por(eo[0], x0) + ' ' + (eo[1] < 0 ? MIN : '+') + ' ' + por(Math.abs(eo[1]), y0) +
      ' = ' + num(eo[2]) + ' ✓. Solución: <b>x = ' + num(x0) + ', y = ' + num(y0) + '</b>.';
    return armar(sistemaHTML(e1, e2), parXY(ent(x0), ent(y0)), { otras: cands, respaldo: respaldo }, {
      tema: 'Sistemas 2 × 2', ask: 'Resuelve el sistema', pasos: [multiplica, elimina, sustituye, comprueba],
      datos: { tipo: 'sistema', e1: e1, e2: e2, clave: claveSist(e1, e2) }
    });
  }

  /* ================= cs-problema ================= */
  // Cada plantilla devuelve el enunciado, la respuesta, sus errores y el sistema que la resuelve
  // (incógnitas en orden: la primera es x y la segunda es y; «pide» dice cuál se pregunta).
  function probNumeros(nivel) {
    var y = rint(2, nivel === 1 ? 20 : 40), x = y + rint(2, nivel === 1 ? 15 : 30);
    var S = x + y, D = x - y, mayor = coin();
    var v = mayor ? x : y;
    var otras = [
      { val: cantidad(mayor ? y : x), err: 'Ése es el ' + (mayor ? 'menor' : 'mayor') + '; la pregunta pide el ' + (mayor ? 'mayor' : 'menor') + '.' },
      { val: cantidad(mayor ? S + D : S - D), err: (mayor ? 'Al sumar las ecuaciones queda 2x = ' + (S + D) : 'Al restarlas queda 2y = ' + (S - D)) + ': falta dividir entre 2.' }
    ];
    if (S % 2 === 0) otras.push({ val: cantidad(S / 2), err: 'La mitad de ' + S + ' sería la respuesta si los dos números fueran iguales, pero uno le lleva ' + D + ' al otro.' });
    return {
      enun: 'La suma de dos números es ' + S + ' y su diferencia es ' + D + '. ¿Cuál es el ' + (mayor ? 'mayor' : 'menor') + '?',
      correcta: cantidad(v), otras: otras,
      respaldo: [{ val: cantidad(D), err: 'Ésa es la diferencia, un dato del problema. Los números son ' + x + ' y ' + y + '.' }],
      sistema: [[1, 1, S], [1, -1, D]], pide: mayor ? 0 : 1, valor: v,
      pasos: [
        'Plantea, con x el mayor y y el menor: x + y = ' + S + ' y x − y = ' + D + '.',
        'Suma las ecuaciones: la y se cancela y queda 2x = ' + (S + D) + ', x = ' + x + '.',
        'Sustituye: ' + x + ' + y = ' + S + ', y = ' + y + '. ' + (mayor ? 'El mayor es <b>' + x + '</b>.' : 'El menor es <b>' + y + '</b>.')
      ]
    };
  }

  function probPatas(nivel) {
    var ctx = azar([
      { lugar: 'En un estacionamiento hay', todo: 'vehículos', u4: 'autos', u2: 'motos', los4: 'los autos', los2: 'las motos', l4: 'a', l2: 'm', cosa: 'llantas', verbo: 'y en total', cuantos4: '¿Cuántos autos hay?', cuantos2: '¿Cuántas motos hay?', solo4: 'como si todos fueran autos', solo2: 'como si todas fueran motos' },
      { lugar: 'En una granja hay', todo: 'animales', u4: 'conejos', u2: 'gallinas', los4: 'los conejos', los2: 'las gallinas', l4: 'c', l2: 'g', cosa: 'patas', verbo: 'y entre todos tienen', cuantos4: '¿Cuántos conejos hay?', cuantos2: '¿Cuántas gallinas hay?', solo4: 'como si todos fueran conejos', solo2: 'como si todas fueran gallinas' }
    ]);
    var top = nivel === 1 ? 20 : 45;
    var n4 = rint(3, top), n2 = rint(3, top);
    while (n2 === n4) n2 = rint(3, top);
    var N = n4 + n2, L = 4 * n4 + 2 * n2, pide4 = coin();
    var v = pide4 ? n4 : n2, unidad = pide4 ? ctx.u4 : ctx.u2;
    var otras = [{ val: cantidad(pide4 ? n2 : n4, unidad), err: 'Ése es el número de ' + (pide4 ? ctx.u2 : ctx.u4) + '; la pregunta pide ' + (pide4 ? ctx.los4 : ctx.los2) + '.' }];
    if (N % 2 === 0) otras.push({ val: cantidad(N / 2, unidad), err: 'Repartiste a la mitad, pero con ' + N / 2 + ' de cada uno habría ' + 3 * N + ' ' + ctx.cosa + ', no ' + L + '.' });
    if (pide4 && L % 4 === 0) otras.push({ val: cantidad(L / 4, unidad), err: 'Dividiste las ' + ctx.cosa + ' entre 4 ' + ctx.solo4 + '; también hay ' + ctx.u2 + '.' });
    if (!pide4) otras.push({ val: cantidad(L / 2, unidad), err: 'Dividiste las ' + ctx.cosa + ' entre 2 ' + ctx.solo2 + '; también hay ' + ctx.u4 + '.' });
    otras.push({ val: cantidad(2 * v, unidad), err: 'Al restar queda 2' + (pide4 ? ctx.l4 : ctx.l2) + ' = ' + 2 * v + ': falta dividir entre 2.' });
    var l4 = ctx.l4, l2 = ctx.l2;
    return {
      enun: ctx.lugar + ' ' + N + ' ' + ctx.todo + ' entre ' + ctx.u4 + ' y ' + ctx.u2 + ', ' + ctx.verbo + ' ' + L + ' ' + ctx.cosa + '. ' + (pide4 ? ctx.cuantos4 : ctx.cuantos2),
      correcta: cantidad(v, unidad), otras: otras, respaldo: [],
      sistema: [[1, 1, N], [4, 2, L]], pide: pide4 ? 0 : 1, valor: v,
      pasos: [
        'Plantea: ' + l4 + ' + ' + l2 + ' = ' + N + ' (' + ctx.todo + ') y 4' + l4 + ' + 2' + l2 + ' = ' + L + ' (' + ctx.cosa + ').',
        'Multiplica la primera por 2: 2' + l4 + ' + 2' + l2 + ' = ' + 2 * N + '. Réstala de la segunda: 2' + l4 + ' = ' + (L - 2 * N) + ', ' + l4 + ' = ' + n4 + '.',
        'Entonces ' + l2 + ' = ' + N + ' − ' + n4 + ' = ' + n2 + '. Comprueba: 4(' + n4 + ') + 2(' + n2 + ') = ' + L + ' ✓. Hay <b>' + v + ' ' + unidad + '</b>.'
      ]
    };
  }

  // «una torta», «dos tortas», «un refresco».
  function cuantas(n, uno, sing, plural) { return n === 1 ? uno + ' ' + sing : ['', '', 'dos', 'tres', 'cuatro'][n] + ' ' + plural; }
  function mayuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function probPrecios(nivel) {
    var ctx = azar([
      { c1: 'torta', c1s: 'tortas', u1: 'una', c2: 'refresco', c2s: 'refrescos', u2: 'un', l1: 't', l2: 'r', p1: [25, 30, 35, 40, 45, 50], p2: [12, 15, 18, 20, 25] },
      { c1: 'cuaderno', c1s: 'cuadernos', u1: 'un', c2: 'pluma', c2s: 'plumas', u2: 'una', l1: 'c', l2: 'p', p1: [28, 30, 35, 40, 45], p2: [8, 9, 10, 12, 15] }
    ]);
    var P1, P2, q1, r1, q2, r2, g = 0;
    do {
      g++;
      P1 = azar(ctx.p1); P2 = azar(ctx.p2);
      q1 = rint(1, 4); r1 = rint(1, 4);
      q2 = rint(1, 4); r2 = rint(1, 4);
    } while (g < 200 && (P1 === P2 || q1 * r2 - q2 * r1 === 0 || (q1 === q2 && r1 === r2) || (nivel === 2 && q2 !== 1 && r2 !== 1)));
    var T1 = q1 * P1 + r1 * P2, T2 = q2 * P1 + r2 * P2, det = q1 * r2 - q2 * r1;
    var pide1 = coin(), v = pide1 ? P1 : P2;
    var otras = [{ val: precio(pide1 ? P2 : P1), err: 'Ése es el precio de ' + (pide1 ? ctx.u2 + ' ' + ctx.c2 : ctx.u1 + ' ' + ctx.c1) + '.' }];
    if (T1 % (q1 + r1) === 0) otras.push({ val: precio(T1 / (q1 + r1)), err: 'Dividiste ' + dinero(T1) + ' entre las ' + (q1 + r1) + ' cosas como si todas costaran lo mismo; ' + ctx.u1 + ' ' + ctx.c1 + ' y ' + ctx.u2 + ' ' + ctx.c2 + ' no cuestan igual.' });
    // Eliminar la otra incógnita restando los totales mal: se suman en vez de restarse.
    var errTot = pide1 ? (T1 * r2 + T2 * r1) / det : (q1 * T2 + q2 * T1) / det;
    if (Number.isInteger(errTot) && errTot > 0) otras.push({ val: precio(errTot), err: 'Al restar las ecuaciones también se restan los totales, no se suman.' });
    var dq = q1 - q2, dr = r1 - r2;
    if (Math.abs(dq) === 1 && dq === dr) {
      var dif = Math.abs(T1 - T2);
      otras.push({ val: precio(dif), err: 'La diferencia, ' + dinero(dif) + ', es lo que cuestan juntos ' + ctx.u1 + ' ' + ctx.c1 + ' y ' + ctx.u2 + ' ' + ctx.c2 + ', no ' + (pide1 ? ctx.u1 + ' ' + ctx.c1 : ctx.u2 + ' ' + ctx.c2) + ' solo.' });
    }
    var sinMult = pide1 ? (T1 * r2 - T2) / det : (q1 * T2 - T1) / det;
    if ((pide1 ? r1 : q2) !== 1 && Number.isInteger(sinMult) && sinMult > 0) otras.push({ val: precio(sinMult), err: 'Al multiplicar una ecuación se multiplican los dos lados, también el total.' });
    var l1 = ctx.l1, l2 = ctx.l2;
    var e1 = ecu(q1, r1, T1).replace(/x/g, l1).replace(/y/g, l2), e2 = ecu(q2, r2, T2).replace(/x/g, l1).replace(/y/g, l2);
    // Para hallar lo que se pide, se elimina la otra letra.
    // Para hallar lo que se pide se elimina la otra letra: cada ecuación por el número de la otra.
    var f1 = pide1 ? r2 : q2, f2 = pide1 ? r1 : q1;
    var multiplica = f1 === 1 && f2 === 1 ? 'Resta la segunda de la primera'
      : 'Multiplica ' + (f1 !== 1 && f2 !== 1 ? 'la primera por ' + f1 + ' y la segunda por ' + f2 : f1 !== 1 ? 'la primera por ' + f1 : 'la segunda por ' + f2) + ' y réstalas';
    var coefR = pide1 ? det : -det, totR = pide1 ? T1 * r2 - T2 * r1 : q2 * T1 - q1 * T2;
    var pasoElimina = multiplica + ': la ' + (pide1 ? l2 : l1) + ' se cancela y queda ' + coef(coefR) + (pide1 ? l1 : l2) + ' = ' + num(totR) +
      (coefR === 1 ? '.' : ', ' + (pide1 ? l1 : l2) + ' = ' + v + '.');
    return {
      enun: mayuscula(cuantas(q1, ctx.u1, ctx.c1, ctx.c1s)) + ' y ' + cuantas(r1, ctx.u2, ctx.c2, ctx.c2s) + ' cuestan ' + dinero(T1) + ', y ' +
        cuantas(q2, ctx.u1, ctx.c1, ctx.c1s) + ' y ' + cuantas(r2, ctx.u2, ctx.c2, ctx.c2s) + ' cuestan ' + dinero(T2) + '. ¿Cuánto cuesta ' + (pide1 ? ctx.u1 + ' ' + ctx.c1 : ctx.u2 + ' ' + ctx.c2) + '?',
      correcta: precio(v), otras: otras, respaldo: [],
      sistema: [[q1, r1, T1], [q2, r2, T2]], pide: pide1 ? 0 : 1, valor: v,
      pasos: [
        'Plantea, con ' + l1 + ' el precio de ' + ctx.u1 + ' ' + ctx.c1 + ' y ' + l2 + ' el de ' + ctx.u2 + ' ' + ctx.c2 + ': ' + e1 + ' y ' + e2 + '.',
        pasoElimina,
        'Comprueba: ' + por(q1, P1) + ' + ' + por(r1, P2) + ' = ' + T1 + ' y ' + por(q2, P1) + ' + ' + por(r2, P2) + ' = ' + T2 + ' ✓. ' +
          mayuscula(pide1 ? ctx.u1 + ' ' + ctx.c1 : ctx.u2 + ' ' + ctx.c2) + ' cuesta <b>' + dinero(v) + '</b>.'
      ]
    };
  }

  function probBoletos(nivel) {
    var A = azar([60, 70, 80, 90, 100, 120]), B = azar([30, 35, 40, 45, 50]);
    var x = rint(5, nivel === 2 ? 40 : 60), y = rint(5, nivel === 2 ? 40 : 60);
    while (y === x) y = rint(5, 40);
    var N = x + y, T = A * x + B * y, pideNinos = coin();
    var v = pideNinos ? y : x, d = A - B;
    var otras = [{ val: cantidad(pideNinos ? x : y, 'boletos'), err: 'Ésos son los boletos de ' + (pideNinos ? 'adulto' : 'niño') + '; la pregunta pide los de ' + (pideNinos ? 'niño' : 'adulto') + '.' }];
    if (N % 2 === 0) otras.push({ val: cantidad(N / 2, 'boletos'), err: 'Repartiste a la mitad, pero así se juntarían ' + dinero((A + B) * N / 2) + ', no ' + dinero(T) + '.' });
    otras.push({ val: cantidad(d * v, 'boletos'), err: 'Queda ' + d + (pideNinos ? 'n' : 'a') + ' = ' + miles(d * v) + ': falta dividir entre ' + d + '.' });
    var todos = pideNinos ? T / B : T / A;
    if (Number.isInteger(todos)) otras.push({ val: cantidad(todos, 'boletos'), err: 'Dividiste el total entre ' + dinero(pideNinos ? B : A) + ' como si todos los boletos fueran de ' + (pideNinos ? 'niño' : 'adulto') + '.' });
    return {
      enun: 'Para una función de cine se vendieron ' + N + ' boletos: los de adulto a ' + dinero(A) + ' y los de niño a ' + dinero(B) + '. Se juntaron ' + dinero(T) + '. ¿Cuántos boletos de ' + (pideNinos ? 'niño' : 'adulto') + ' se vendieron?',
      correcta: cantidad(v, 'boletos'), otras: otras, respaldo: [],
      sistema: [[1, 1, N], [A, B, T]], pide: pideNinos ? 1 : 0, valor: v,
      pasos: [
        'Plantea: a + n = ' + N + ' (boletos) y ' + A + 'a + ' + B + 'n = ' + miles(T) + ' (pesos).',
        'Multiplica la primera por ' + B + ': ' + B + 'a + ' + B + 'n = ' + miles(B * N) + '. Réstala de la segunda: ' + d + 'a = ' + miles(T - B * N) + ', a = ' + x + '.',
        'Entonces n = ' + N + ' − ' + x + ' = ' + y + '. Se vendieron <b>' + v + ' boletos de ' + (pideNinos ? 'niño' : 'adulto') + '</b>.'
      ]
    };
  }

  function probMonedas(nivel) {
    var par2 = azar([[5, 10], [2, 5], [10, 20]]);
    var ch = par2[0], gr = par2[1];
    var x = rint(4, 30), y = rint(4, 30);
    while (y === x) y = rint(4, 30);
    var N = x + y, T = ch * x + gr * y, pideGrandes = coin();
    var v = pideGrandes ? y : x, d = gr - ch;
    var unidad = 'monedas';
    var otras = [{ val: cantidad(pideGrandes ? x : y, unidad), err: 'Ésas son las de ' + dinero(pideGrandes ? ch : gr) + '; la pregunta pide las de ' + dinero(pideGrandes ? gr : ch) + '.' }];
    if (N % 2 === 0) otras.push({ val: cantidad(N / 2, unidad), err: 'Repartiste a la mitad, pero así juntarías ' + dinero((ch + gr) * N / 2) + ', no ' + dinero(T) + '.' });
    otras.push({ val: cantidad(d * v, unidad), err: 'Queda ' + d + (pideGrandes ? 'g' : 'c') + ' = ' + (pideGrandes ? T - ch * N : gr * N - T) + ': falta dividir entre ' + d + '.' });
    var todas = pideGrandes ? T / gr : T / ch;
    if (Number.isInteger(todas)) otras.push({ val: cantidad(todas, unidad), err: 'Dividiste ' + dinero(T) + ' entre ' + (pideGrandes ? gr : ch) + ' como si todas las monedas fueran de ' + dinero(pideGrandes ? gr : ch) + '.' });
    return {
      enun: 'Tienes ' + N + ' monedas, unas de ' + dinero(ch) + ' y otras de ' + dinero(gr) + ', que juntan ' + dinero(T) + '. ¿Cuántas monedas de ' + dinero(pideGrandes ? gr : ch) + ' tienes?',
      correcta: cantidad(v, unidad), otras: otras, respaldo: [],
      sistema: [[1, 1, N], [ch, gr, T]], pide: pideGrandes ? 1 : 0, valor: v,
      pasos: [
        'Plantea, con c las de ' + dinero(ch) + ' y g las de ' + dinero(gr) + ': c + g = ' + N + ' y ' + ch + 'c + ' + gr + 'g = ' + miles(T) + '.',
        'Multiplica la primera por ' + ch + ' y réstala de la segunda: ' + d + 'g = ' + (T - ch * N) + ', g = ' + y + '.',
        'Entonces c = ' + N + ' − ' + y + ' = ' + x + '. Comprueba: ' + ch + '(' + x + ') + ' + gr + '(' + y + ') = ' + T + ' ✓. Tienes <b>' + v + ' monedas</b> de ' + dinero(pideGrandes ? gr : ch) + '.'
      ]
    };
  }

  function probEdades() {
    var k = azar([2, 3, 4]), h = rint(5, 16), p = k * h, S = p + h, pideHijo = coin();
    var veces = { 2: 'el doble', 3: 'el triple', 4: 'el cuádruple' }[k];
    var v = pideHijo ? h : p;
    var otras = [{ val: cantidad(pideHijo ? p : h, 'años'), err: 'Ésa es la edad ' + (pideHijo ? 'del papá' : 'del hijo') + '; la pregunta pide la ' + (pideHijo ? 'del hijo' : 'del papá') + '.' }];
    if (S % 2 === 0) otras.push({ val: cantidad(S / 2, 'años'), err: 'La mitad sería si tuvieran la misma edad, pero el papá tiene ' + veces + '.' });
    var masK = 'Tener ' + veces + ' es ' + k + ' por la edad del hijo, no ' + k + ' años más: p = ' + k + 'h.';
    if (pideHijo) {
      if (S % k === 0) otras.push({ val: cantidad(S / k, 'años'), err: 'Si p = ' + k + 'h, entre los dos suman ' + k + 'h + h = ' + (k + 1) + 'h: se divide entre ' + (k + 1) + ', no entre ' + k + '.' });
      if ((S - k) % 2 === 0) otras.push({ val: cantidad((S - k) / 2, 'años'), err: masK });
    } else {
      otras.push({ val: cantidad(h + k, 'años'), err: masK });
      if (S % k === 0) otras.push({ val: cantidad(S / k, 'años'), err: 'No basta dividir la suma entre ' + k + ': p + h = ' + (k + 1) + 'h, así que primero h = ' + S + ' ÷ ' + (k + 1) + ' = ' + h + ', y luego p = ' + k + ' × ' + h + '.' });
    }
    return {
      enun: 'Un papá tiene ' + veces + ' de la edad de su hijo, y entre los dos suman ' + S + ' años. ¿Cuántos años tiene ' + (pideHijo ? 'el hijo' : 'el papá') + '?',
      correcta: cantidad(v, 'años'), otras: otras, respaldo: [],
      sistema: [[1, -k, 0], [1, 1, S]], pide: pideHijo ? 1 : 0, valor: v,
      pasos: [
        'Plantea, con p la edad del papá y h la del hijo: p = ' + k + 'h y p + h = ' + S + '.',
        'Sustituye p en la segunda: ' + k + 'h + h = ' + S + ', o sea ' + (k + 1) + 'h = ' + S + ', h = ' + h + '.',
        'El papá: p = ' + k + '(' + h + ') = ' + p + '. Comprueba: ' + p + ' + ' + h + ' = ' + S + ' ✓. ' + (pideHijo ? 'El hijo tiene' : 'El papá tiene') + ' <b>' + v + ' años</b>.'
      ]
    };
  }

  function armaProblema(nivel) {
    var plantilla = azar(nivel === 1 ? [probNumeros, probPatas] : nivel === 2 ? [probPrecios, probBoletos, probPatas] : [probMonedas, probEdades, probPrecios, probNumeros]);
    var p = plantilla(nivel);
    var s = p.sistema;
    return armar(p.enun, p.correcta, { otras: p.otras, respaldo: p.respaldo }, {
      tema: 'Problemas con sistemas', ask: 'Plantea y resuelve', texto: true, pasos: p.pasos,
      datos: { tipo: 'problema', e1: s[0], e2: s[1], pide: p.pide, valor: p.valor, clave: claveSist(s[0], s[1]) }
    });
  }

  M.GENERADORES['cs-incompleta'] = sinRepetirTarea(armaIncompleta);
  M.GENERADORES['cs-factoriza'] = sinRepetirTarea(armaFactoriza);
  M.GENERADORES['cs-discriminante'] = sinRepetirTarea(armaDiscriminante);
  M.GENERADORES['cs-formula'] = sinRepetirTarea(armaFormula);
  M.GENERADORES['cs-sistema'] = sinRepetirTarea(armaSistema);
  M.GENERADORES['cs-problema'] = sinRepetirTarea(armaProblema);
})();
