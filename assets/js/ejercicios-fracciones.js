/*
 * ejercicios-fracciones.js — generadores de Fracciones (Fundamentos, semana 2).
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se carga
 * después de él. Devuelven lo mismo que los demás: { enunciado, correcta,
 * opciones: [{ val, ok, err }], meta }.
 *
 *   fracciones-equivalentes  completar, simplificar y reconocer una fracción equivalente
 *   fracciones-de-cantidad   la fracción de una cantidad (3/4 de 20) y, en nivel 3, al revés
 *   fracciones-suma          sumas y restas
 *   fracciones-mul           productos y cocientes
 *
 * frac-suma y frac-mul (del motor) siguen en el registro, pero esta lección usa sus
 * versiones de aquí: cada opción falsa es un error real con su explicación (nunca
 * «Resultado incorrecto.» ni un «Signo equivocado.» sin negativos), un negativo después
 * de un signo va entre paréntesis, el nivel 1 no da resultados negativos y los pasos
 * muestran la cuenta sin simplificar antes de simplificarla.
 *
 * Si no salen tres errores distintos de la correcta, el ejercicio se vuelve a sortear.
 * Las cuentas de la tarea (examenes-pdf/tarea-fracciones.html) no salen nunca: así
 * ninguna aparece resuelta en la práctica ni en el reto.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';

  /* ---------- Aritmética exacta ---------- */
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function mcm(a, b) { return Math.abs(a / mcd(a, b) * b); }
  function fr(n, d) {
    if (!d) return null;
    if (d < 0) { n = -n; d = -d; }
    var g = mcd(n, d);
    return { n: n / g, d: d / g };
  }
  function mas(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function menos(a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function por(a, b) { return fr(a.n * b.n, a.d * b.d); }
  function entre(a, b) { return b.n === 0 ? null : fr(a.n * b.d, a.d * b.n); }
  function igual(a, b) { return a.n * b.d === b.n * a.d; }

  /* ---------- Azar ---------- */
  function entero(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function moneda() { return Math.random() < 0.5; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // Una fracción propia e irreducible con denominador entre dMin y dMax.
  function propia(dMin, dMax) {
    var d, n;
    do { d = entero(dMin, dMax); n = entero(1, d - 1); } while (mcd(n, d) !== 1);
    return { n: n, d: d };
  }

  /* ---------- Escritura ---------- */
  function num(n) { return n < 0 ? MENOS + -n : String(n); }
  // Miles con coma: 1,100.
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // Una fracción tal como se escribe (sin simplificar), apilada; con denominador 1, un entero
  // (salvo con «apilada», para escribir 4/1 cuando se explica que un entero es una fracción).
  // El signo va siempre delante, con el menos tipográfico.
  function fh(n, d, apilada) {
    if (d < 0) { n = -n; d = -d; }
    var s = n < 0 ? MENOS : '';
    if (d === 1 && !apilada) return s + miles(Math.abs(n));
    return s + '<span class="fr"><span class="fr__n">' + miles(Math.abs(n)) + '</span><span class="fr__d">' + miles(d) + '</span></span>';
  }
  function fx(f) { return fh(f.n, f.d); }
  function sobreUno(n) { return fh(n, 1, true); }
  // El recíproco tal como queda al voltear: 1/3 → 3/1.
  function volteada(f) { return fh(f.d, f.n, true); }
  // Un negativo después de un signo va entre paréntesis: 1/2 + (−1/3).
  function par(f) { return f.n < 0 ? '(' + fx(f) + ')' : fx(f); }
  function parHtml(n, html) { return n < 0 ? '(' + html + ')' : html; }
  // Opción que se ve tal cual (6/8) pero se compara por lo que vale (3/4): dos opciones que valen
  // lo mismo no se cuelan como si una fuera un error.
  function cruda(n, d) { var r = fr(n, d); return { k: r.n + '/' + r.d, h: fh(n, d) }; }
  // Opción que se distingue por cómo se ve: «6/9» al simplificar 12/18 vale lo mismo que 2/3,
  // pero no terminó de simplificarse.
  function tal(n, d) { if (d < 0) { n = -n; d = -d; } return { k: 'tal:' + n + '/' + d, h: fh(n, d) }; }
  function entera(n) { return { n: n, d: 1 }; }
  // Las cantidades de cuatro cifras o más llevan coma de miles también en las opciones.
  function legible(v) {
    if (!v || v.k !== undefined || v.d === undefined) return v;
    return Math.abs(v.n) >= 1000 || v.d >= 1000 ? { k: v.n + '/' + v.d, h: fh(v.n, v.d) } : v;
  }
  // La fracción con el hueco que hay que llenar: arriba o abajo.
  var FALTA = '<span class="fr-falta">?</span>';
  function fhFalta(n, d) {
    return '<span class="fr"><span class="fr__n">' + (n === null ? FALTA : n) + '</span><span class="fr__d">' + (d === null ? FALTA : d) + '</span></span>';
  }
  function b(html) { return '<b>' + html + '</b>'; }

  /* ---------- Armado ---------- */
  // La correcta y tres falsas distintas, en el orden de prioridad en que vienen; null si no alcanzan.
  function armar(enunciado, correcta, falsas, meta) {
    correcta = legible(correcta);
    var vistas = {};
    vistas[M.fkey(correcta)] = true;
    var elegidas = [];
    for (var i = 0; i < falsas.length && elegidas.length < 3; i++) {
      var f = falsas[i];
      if (!f || !f.val || !f.err) continue;
      if (f.val.d !== undefined && f.val.k === undefined && (!isFinite(f.val.n) || !isFinite(f.val.d))) continue;
      var k = M.fkey(f.val);
      if (vistas[k]) continue;
      vistas[k] = true;
      elegidas.push({ val: legible(f.val), err: f.err });
    }
    if (elegidas.length < 3) return null;
    var opciones = barajar([{ val: correcta, ok: true }].concat(elegidas.map(function (f) {
      return { val: f.val, ok: false, err: f.err };
    })));
    return { enunciado: enunciado, correcta: correcta, opciones: opciones, meta: meta };
  }

  function conReintentos(intento) {
    return function (nivel) {
      for (var i = 0; i < 400; i++) {
        var e = intento(nivel);
        if (e) return e;
      }
      throw new Error('fracciones: no salió un ejercicio con tres errores distintos');
    };
  }

  /* Las cuentas de la tarea: no salen en la práctica ni en el reto. */
  var TAREA = {};
  [
    // 1 · barras (se simplifican) · 2 · completa · 3 · simplifica
    's:6/9', 's:4/10', 's:10/12',
    'c:3/4=?/20', 'c:2/7=?/21', 'c:5/6=25/?', 'c:4/9=?/45',
    's:12/16', 's:15/25', 's:24/36', 's:42/56',
    // 4 · de una cantidad, y el problema de los minutos (2/5 de hora)
    'de:1/3:27', 'de:3/5:40', 'de:5/8:48', 'de:2/9:63', 'de:7/10:150', 'de:3/4:36', 'de:2/5:60',
    // 5, 6, 8 y 9 · sumas y restas (las sumas, en los dos órdenes; un entero es n/1)
    '3/8+1/8', '1/8+3/8', '7/9-4/9', '1/2+1/4', '1/4+1/2', '2/3-1/6', '1/1-3/7', '3/1+1/4', '1/4+3/1',
    '3/4+2/5', '2/5+3/4', '5/6-2/9', '3/4-1/3', '2/5+1/3', '1/3+2/5',
    // 7, 8 y 9 · productos (en los dos órdenes) y cocientes
    '3/4*5/7', '5/7*3/4', '6/7*7/12', '7/12*6/7', '5/1*3/10', '3/10*5/1', '4/1*2/9', '2/9*4/1', '3/5*2/3', '2/3*3/5',
    '2/5:3/4', '4/1:2/3', '9/10:3/1', '3/4:1/2'
  ].forEach(function (k) { TAREA[k] = true; });
  function clave(a, op, c) { return a.n + '/' + a.d + op + c.n + '/' + c.d; }

  /* =====================================================================
     Equivalentes: completar, simplificar y reconocer
     ===================================================================== */
  function genEquivalentes(nivel) {
    var tipos = nivel === 1 ? ['completar', 'completar', 'simplificar', 'simplificar']
      : nivel === 2 ? ['completar', 'simplificar', 'cual']
      : ['doble', 'simplificar', 'cual', 'completar'];
    var tipo = azar(tipos);
    if (tipo === 'completar') return completar(nivel);
    if (tipo === 'doble') return completarDoble();
    if (tipo === 'simplificar') return simplificar(nivel);
    return cualEquivalente(nivel);
  }

  // a/b = ?/(bk) o a/b = (ak)/?
  function completar(nivel) {
    var f = propia(2, nivel === 1 ? 6 : nivel === 2 ? 9 : 12);
    var k = entero(2, nivel === 1 ? 5 : 8);
    var a = f.n, d = f.d, A = a * k, D = d * k;
    var faltaArriba = nivel === 1 || moneda();
    if (TAREA[faltaArriba ? 'c:' + a + '/' + d + '=?/' + D : 'c:' + a + '/' + d + '=' + A + '/?']) return null;
    var enunciado = fx(f) + ' = ' + (faltaArriba ? fhFalta(null, D) : fhFalta(A, null));
    var meta = { tema: 'Fracciones equivalentes', ask: 'Completa', tipo: 'completar' };
    if (faltaArriba) {
      meta.pasos = [
        'Abajo, el ' + d + ' se volvió ' + D + ': se multiplicó por ' + D + ' ÷ ' + d + ' = ' + b(k) + '.',
        'Arriba se multiplica por lo mismo: ' + a + ' × ' + k + ' = ' + b(A) + '.',
        'Queda ' + fx(f) + ' = ' + fh(A, D) + '.'
      ];
      return armar(enunciado, entera(A), [
        { val: entera(a + D - d), err: 'Abajo se sumaron ' + (D - d) + ' (de ' + d + ' a ' + D + ') y arriba sumaste lo mismo. Una equivalente no se arma sumando: si abajo se multiplicó por ' + k + ', arriba también, ' + a + ' × ' + k + ' = ' + A + '.' },
        { val: entera(k), err: k + ' es el número por el que se multiplicó el denominador (' + D + ' ÷ ' + d + '). Falta multiplicar el numerador: ' + a + ' × ' + k + ' = ' + A + '.' },
        { val: entera(a * D), err: 'Multiplicaste ' + a + ' por ' + D + ', el denominador nuevo. Se multiplica por el factor, ' + D + ' ÷ ' + d + ' = ' + k + ': ' + a + ' × ' + k + ' = ' + A + '.' },
        a > 1 && D % a === 0 ? { val: entera(D / a), err: 'Dividiste ' + D + ' entre el numerador. El factor sale de los denominadores: ' + D + ' ÷ ' + d + ' = ' + k + ', y ' + a + ' × ' + k + ' = ' + A + '.' } : null,
        { val: entera(D - d), err: 'Restaste los denominadores, ' + D + ' ' + MENOS + ' ' + d + '. Lo que cuenta es cuántas veces cabe el ' + d + ' en el ' + D + ': ' + k + ' veces. Arriba también: ' + a + ' × ' + k + ' = ' + A + '.' }
      ], meta);
    }
    meta.pasos = [
      'Arriba, el ' + a + ' se volvió ' + A + ': se multiplicó por ' + A + ' ÷ ' + a + ' = ' + b(k) + '.',
      'Abajo se multiplica por lo mismo: ' + d + ' × ' + k + ' = ' + b(D) + '.',
      'Queda ' + fx(f) + ' = ' + fh(A, D) + '.'
    ];
    return armar(enunciado, entera(D), [
      { val: entera(d + A - a), err: 'Arriba se sumaron ' + (A - a) + ' (de ' + a + ' a ' + A + ') y abajo sumaste lo mismo. Una equivalente no se arma sumando: si arriba se multiplicó por ' + k + ', abajo también, ' + d + ' × ' + k + ' = ' + D + '.' },
      { val: entera(k), err: k + ' es el número por el que se multiplicó el numerador (' + A + ' ÷ ' + a + '). Falta multiplicar el denominador: ' + d + ' × ' + k + ' = ' + D + '.' },
      { val: entera(d * A), err: 'Multiplicaste ' + d + ' por ' + A + ', el numerador nuevo. Se multiplica por el factor, ' + A + ' ÷ ' + a + ' = ' + k + ': ' + d + ' × ' + k + ' = ' + D + '.' },
      A % d === 0 && A / d !== D ? { val: entera(A / d), err: 'Dividiste ' + A + ' entre ' + d + '. El factor sale de los numeradores: ' + A + ' ÷ ' + a + ' = ' + k + ', y ' + d + ' × ' + k + ' = ' + D + '.' } : null,
      { val: entera(A - a), err: 'Restaste los numeradores, ' + A + ' ' + MENOS + ' ' + a + '. Lo que cuenta es cuántas veces cabe el ' + a + ' en el ' + A + ': ' + k + ' veces. Abajo también: ' + d + ' × ' + k + ' = ' + D + '.' }
    ], meta);
  }

  // Nivel 3: ?/D = n/d con n/d sin simplificar (?/12 = 15/20): primero se simplifica y luego se amplifica.
  function completarDoble() {
    var f = propia(2, 6);
    var k1, k2;
    do { k1 = entero(2, 6); k2 = entero(2, 6); } while (k1 === k2);
    var a = f.n, d = f.d, n1 = a * k1, d1 = d * k1, D = d * k2, A = a * k2;
    var enunciado = fhFalta(null, D) + ' = ' + fh(n1, d1);
    return armar(enunciado, entera(A), [
      { val: entera(a), err: 'Simplificaste bien, ' + fh(n1, d1) + ' = ' + fx(f) + ', pero faltó llevarla a ' + D + ' abajo: ' + d + ' × ' + k2 + ' = ' + D + ', así que ' + a + ' × ' + k2 + ' = ' + A + '.' },
      n1 + D - d1 > 0 ? { val: entera(n1 + D - d1), err: 'Abajo ' + (D > d1 ? 'se sumaron ' + (D - d1) : 'se restaron ' + (d1 - D)) + ' (de ' + d1 + ' a ' + D + ') y arriba hiciste lo mismo. Las equivalentes no se arman sumando ni restando: se simplifica a ' + fx(f) + ' y se multiplica por ' + k2 + '.' } : null,
      { val: entera(k2), err: k2 + ' es el factor (' + D + ' ÷ ' + d + '). Falta multiplicarlo por el numerador de ' + fx(f) + ': ' + a + ' × ' + k2 + ' = ' + A + '.' },
      { val: entera(n1 * k2), err: 'Multiplicaste ' + n1 + ' × ' + k2 + ' sin simplificar antes. Primero ' + fh(n1, d1) + ' = ' + fx(f) + '; luego ' + a + ' × ' + k2 + ' = ' + A + '.' }
    ], {
      tema: 'Fracciones equivalentes', ask: 'Completa', tipo: 'completar',
      pasos: [
        'Simplifica ' + fh(n1, d1) + ': entre ' + k1 + ' queda ' + b(fx(f)) + '.',
        'Abajo, de ' + d + ' a ' + D + ' se multiplica por ' + k2 + '; arriba también: ' + a + ' × ' + k2 + ' = ' + b(A) + '.'
      ]
    });
  }

  // (ak)/(bk) → a/b
  function simplificar(nivel) {
    var f, k;
    if (nivel === 1) { f = propia(2, 6); k = azar([2, 3, 4, 5]); }
    else if (nivel === 2) { f = propia(2, 9); k = azar([4, 6, 8, 9, 10, 12]); }
    else {
      do { f = { n: entero(1, 11), d: entero(2, 12) }; } while (mcd(f.n, f.d) !== 1 || f.n === f.d);
      k = azar([12, 14, 15, 16, 18, 20, 24]);
    }
    var a = f.n, d = f.d, A = a * k, D = d * k;
    if (TAREA['s:' + A + '/' + D]) return null;
    // Un divisor de k que no es k: hasta ahí se queda quien no termina de simplificar.
    var parciales = [];
    for (var p = 2; p < k; p++) if (k % p === 0) parciales.push(p);
    var p1 = parciales.length ? azar(parciales) : 0;
    // Otro divisor del denominador, para «dividir arriba entre uno y abajo entre otro».
    var otros = [];
    for (var q = 2; q < D; q++) if (D % q === 0 && q !== k && D / q !== d) otros.push(q);
    var q1 = otros.length ? azar(otros) : 0;
    var resta = A - a;
    var pasos = [
      A + ' y ' + D + ' se pueden dividir entre ' + b(k) + ', su mayor divisor común.',
      A + ' ÷ ' + k + ' = ' + a + ' y ' + D + ' ÷ ' + k + ' = ' + d + '.',
      'Queda ' + b(fx(f)) + (p1 ? '. Si no lo ves de una vez, ve por partes: entre ' + p1 + ' y luego entre ' + k / p1 + '.' : ', y ya no se puede simplificar más.')
    ];
    return armar(fh(A, D), fr(a, d), [
      p1 ? { val: tal(A / p1, D / p1), err: 'Vas bien, pero todavía se puede: ' + A / p1 + ' y ' + D / p1 + ' se dividen entre ' + k / p1 + '. Simplificar es dividir hasta que arriba y abajo ya no tengan divisor común.' } : null,
      D - resta > 0 && D - resta !== d ? { val: tal(a, D - resta), err: 'Le restaste ' + resta + ' arriba y abajo. Restar lo mismo cambia la fracción; para simplificar se divide a los dos entre el mismo número, ' + k + '.' } : null,
      { val: tal(a, D), err: 'Dividiste sólo el numerador entre ' + k + '. El denominador también se divide: ' + D + ' ÷ ' + k + ' = ' + d + '.' },
      q1 ? { val: tal(a, D / q1), err: 'Dividiste arriba entre ' + k + ' y abajo entre ' + q1 + '. Tiene que ser el mismo número para los dos: ' + k + '.' } : null,
      { val: fr(d, a), err: 'Volteaste la fracción: el numerador, ' + A + ', va arriba.' }
    ], { tema: 'Simplificar fracciones', ask: 'Simplifica', tipo: 'simplificar', pasos: pasos });
  }

  // ¿Cuál es equivalente a a/b?
  function cualEquivalente(nivel) {
    var f = nivel === 2 ? propia(2, 9) : propia(3, 12);
    var k = entero(2, nivel === 2 ? 6 : 9);
    var j;
    do { j = entero(2, nivel === 2 ? 6 : 9); } while (j === k);
    var s = entero(1, 5);
    var a = f.n, d = f.d;
    return armar(fx(f), cruda(a * k, d * k), [
      { val: cruda(a + s, d + s), err: 'Ahí se sumó ' + s + ' arriba y abajo, y sumar lo mismo cambia la fracción. Una equivalente se arma multiplicando (o dividiendo) a los dos por el mismo número.' },
      { val: cruda(a * k, d), err: 'Ahí sólo se multiplicó el numerador por ' + k + '; el denominador también tiene que multiplicarse.' },
      { val: cruda(a, d * k), err: 'Ahí sólo se multiplicó el denominador por ' + k + '; el numerador también tiene que multiplicarse.' },
      { val: cruda(a * k, d * j), err: 'Ahí se multiplicó arriba por ' + k + ' y abajo por ' + j + ': tiene que ser el mismo número.' },
      { val: cruda(d * k, a * k), err: 'Está al revés: ésa es equivalente a ' + fh(d, a) + ', no a ' + fx(f) + '.' }
    ], {
      tema: 'Fracciones equivalentes', ask: 'Elige la fracción equivalente', tipo: 'cual',
      pasos: [
        'Multiplica arriba y abajo por el mismo número: ' + a + ' × ' + k + ' = ' + a * k + ' y ' + d + ' × ' + k + ' = ' + d * k + '.',
        'Así ' + fx(f) + ' = ' + b(fh(a * k, d * k)) + '. Sumar, o multiplicar sólo una parte, cambia la fracción.'
      ]
    });
  }

  /* =====================================================================
     La fracción de una cantidad
     ===================================================================== */
  var CONTEXTOS = [
    { cantidades: [24, 30, 32, 36, 40, 45, 48],
      frase: function (f, N) { return 'En un grupo de ' + N + ' alumnos, ' + fx(f) + ' son mujeres. ¿Cuántas mujeres hay?'; },
      reves: function (f, R) { return 'En un grupo, ' + fx(f) + ' de los alumnos son mujeres: ' + R + ' mujeres. ¿Cuántos alumnos hay en el grupo?'; } },
    { cantidades: [60],
      frase: function (f) { return 'Una hora tiene 60 minutos. ¿Cuántos minutos son ' + fx(f) + ' de hora?'; },
      reves: null },
    { cantidades: [600, 750, 800, 1000, 1100, 1200],
      frase: function (f, N) { return 'Un tinaco de ' + miles(N) + ' litros está lleno hasta ' + fx(f) + ' de su capacidad. ¿Cuántos litros tiene?'; },
      reves: function (f, R) { return 'Un tinaco lleno hasta ' + fx(f) + ' de su capacidad tiene ' + miles(R) + ' litros. ¿Cuántos litros le caben lleno?'; } },
    { cantidades: [300, 400, 450, 500, 600, 800, 900, 1200],
      frase: function (f, N) { return 'Ganas ' + miles(N) + ' pesos a la semana y ahorras ' + fx(f) + '. ¿Cuántos pesos ahorras?'; },
      reves: null },
    { cantidades: [120, 150, 180, 200, 240, 300, 360],
      frase: function (f, N) { return 'Un libro tiene ' + N + ' páginas y ya leíste ' + fx(f) + '. ¿Cuántas páginas llevas?'; },
      reves: function (f, R) { return 'Ya leíste ' + fx(f) + ' de un libro: ' + R + ' páginas. ¿Cuántas páginas tiene el libro?'; } },
    { cantidades: [120, 180, 240, 300, 360, 400, 450],
      frase: function (f, N) { return 'Un viaje es de ' + N + '\u00a0km y ya recorriste ' + fx(f) + '. ¿Cuántos kilómetros llevas?'; },
      reves: function (f, R) { return 'Ya recorriste ' + fx(f) + ' de un viaje: ' + R + '\u00a0km. ¿De cuántos kilómetros es el viaje?'; } }
  ];

  function genDeCantidad(nivel) {
    if (nivel === 3 && Math.random() < 0.45) return alReves();
    var conTexto = nivel === 2 ? Math.random() < 0.45 : nivel === 3 ? Math.random() < 0.4 : false;
    var f, N;
    if (conTexto) {
      var ctx = azar(CONTEXTOS);
      f = propia(2, nivel === 2 ? 10 : 12);
      var posibles = ctx.cantidades.filter(function (c) { return c % f.d === 0; });
      if (!posibles.length) return null;
      N = azar(posibles);
      return deCantidad(f, N, ctx.frase(f, N), true);
    }
    if (nivel === 1) { f = propia(2, 5); N = f.d * entero(2, 10); }
    else if (nivel === 2) { f = propia(2, 10); N = f.d * entero(2, 12); }
    else {
      // Nivel 3: denominadores grandes y, a veces, más que el entero (5/4 de 32).
      if (Math.random() < 0.3) { do { f = { n: entero(5, 11), d: entero(2, 8) }; } while (mcd(f.n, f.d) !== 1 || f.n <= f.d); }
      else f = propia(6, 12);
      N = f.d * entero(4, 15);
    }
    return deCantidad(f, N, fx(f) + ' de ' + miles(N), false);
  }

  function deCantidad(f, N, enunciado, texto) {
    if (TAREA['de:' + f.n + '/' + f.d + ':' + N]) return null;
    var a = f.n, d = f.d, parte = N / d, R = a * parte;
    var falsas = [
      a > 1 ? { val: entera(parte), err: miles(parte) + ' es lo que vale una parte, ' + fh(1, d) + ' de ' + miles(N) + '. Se toman ' + a + ' partes: ' + a + ' × ' + miles(parte) + ' = ' + miles(R) + '.' } : null,
      { val: entera(a * N), err: (a > 1 ? 'Multiplicaste por ' + a + ', pero faltó' : 'Faltó') + ' repartir entre ' + d + ': ' + miles(a * N) + ' ÷ ' + d + ' = ' + miles(R) + '.' },
      N - R > 0 ? { val: entera(N - R), err: 'Ésa es la parte que queda, ' + fh(d - a, d) + ' de ' + miles(N) + '. La pregunta pide ' + fx(f) + ': ' + a + ' × ' + miles(parte) + ' = ' + miles(R) + '.' } : null,
      { val: fr(N * d, a), err: 'Lo hiciste al revés: se reparte entre el denominador (' + d + ') y se multiplica por el numerador (' + a + ').' },
      a > 1 ? { val: entera(parte + a), err: 'Repartiste bien, ' + miles(N) + ' ÷ ' + d + ' = ' + miles(parte) + ', pero luego sumaste ' + a + '. Se toman ' + a + ' partes: ' + a + ' × ' + miles(parte) + ' = ' + miles(R) + '.' } : null
    ];
    return armar(enunciado, entera(R), falsas, {
      tema: 'Fracción de una cantidad', ask: texto ? 'Resuelve' : 'Calcula', texto: texto, tipo: 'de',
      pasos: [
        'Reparte entre el denominador: ' + miles(N) + ' ÷ ' + d + ' = ' + b(miles(parte)) + ' (lo que vale cada parte).',
        a > 1 ? 'Toma el numerador: ' + a + ' partes, ' + a + ' × ' + miles(parte) + ' = ' + b(miles(R)) + '.' : 'El numerador es 1: se toma una sola parte, ' + b(miles(R)) + '.'
      ]
    });
  }

  // Nivel 3: los a/b de un número son R. ¿Cuál es el número?
  function alReves() {
    var f = propia(2, 10);
    if (f.n === 1) f = { n: f.d - 1, d: f.d };
    var a = f.n, d = f.d;
    var ctxs = CONTEXTOS.filter(function (c) { return c.reves; });
    var ctx = Math.random() < 0.5 ? null : azar(ctxs);
    var N;
    if (ctx) {
      var posibles = ctx.cantidades.filter(function (c) { return c % d === 0; });
      if (!posibles.length) return null;
      N = azar(posibles);
    } else N = d * entero(2, 12);
    var parte = N / d, R = a * parte;
    var enunciado = ctx ? ctx.reves(f, R) : 'Los ' + fx(f) + ' de un número son ' + miles(R) + '. ¿Cuál es el número?';
    return armar(enunciado, entera(N), [
      { val: fr(R * a, d), err: 'Calculaste ' + fx(f) + ' de ' + miles(R) + ', pero aquí ' + miles(R) + ' ya son los ' + fx(f) + '. Cada parte vale ' + miles(R) + ' ÷ ' + a + ' = ' + miles(parte) + ', y el entero tiene ' + d + ' partes.' },
      { val: entera(parte), err: miles(parte) + ' es lo que vale una parte, ' + fh(1, d) + '. El entero tiene ' + d + ' partes: ' + d + ' × ' + miles(parte) + ' = ' + miles(N) + '.' },
      { val: entera(R * d), err: 'Multiplicaste por ' + d + ', pero ' + miles(R) + ' son ' + a + ' partes, no una: primero ' + miles(R) + ' ÷ ' + a + ' = ' + miles(parte) + '.' },
      { val: entera(R + parte), err: 'Le sumaste una parte (' + miles(parte) + '), pero faltan ' + (d - a) + ': el entero tiene ' + d + ' partes de ' + miles(parte) + '.' }
    ], {
      tema: 'Fracción de una cantidad', ask: 'Resuelve', texto: true, tipo: 'reves',
      pasos: [
        miles(R) + ' son ' + a + ' partes de ' + d + ': cada parte vale ' + miles(R) + ' ÷ ' + a + ' = ' + b(miles(parte)) + '.',
        'El entero tiene ' + d + ' partes: ' + d + ' × ' + miles(parte) + ' = ' + b(miles(N)) + '.'
      ]
    });
  }

  /* =====================================================================
     Sumas y restas
     ===================================================================== */
  var MULTIPLOS = [[2, 4], [2, 6], [3, 6], [4, 8], [5, 10], [3, 9], [2, 8]];
  var CON_FACTOR = [[4, 6], [6, 8], [6, 9], [8, 12], [9, 12], [10, 15], [12, 18], [6, 10], [4, 10], [10, 12], [6, 15], [8, 10]];

  function conDenominador(d) { var n; do { n = entero(1, d - 1); } while (mcd(n, d) !== 1); return { n: n, d: d }; }

  function genSuma(nivel) {
    var x, y, signo = moneda() ? 1 : -1, forma;
    if (nivel === 1) {
      forma = azar(['mismo', 'multiplo']);
      if (forma === 'mismo') {
        var d = entero(3, 9);
        x = { n: entero(1, d - 1), d: d }; y = { n: entero(1, d - 1), d: d };
        if (x.n === y.n) return null;
      } else {
        var pr = barajar(azar(MULTIPLOS));
        x = conDenominador(pr[0]); y = conDenominador(pr[1]);
      }
      if (signo < 0 && x.n * y.d < y.n * x.d) { var t = x; x = y; y = t; }     // sin resultados negativos
    } else if (nivel === 2) {
      forma = Math.random() < 0.2 ? 'entero' : 'distinto';
      if (forma === 'entero') {
        x = entera(entero(1, 4)); y = propia(2, 9);
        if (moneda()) { var t2 = x; x = y; y = t2; }
      } else {
        var d1, d2;
        do { d1 = entero(2, 10); d2 = entero(2, 10); } while (d1 === d2);
        x = conDenominador(d1); y = conDenominador(d2);
      }
      if (signo < 0 && x.n * y.d < y.n * x.d) { var t3 = x; x = y; y = t3; }
    } else {
      forma = 'distinto';
      var pr3 = barajar(azar(CON_FACTOR));
      x = conDenominador(pr3[0]); y = conDenominador(pr3[1]);
      // Con negativos: el primero negativo, o una resta que se pasa del cero.
      if (Math.random() < 0.5) x = { n: -x.n, d: x.d };
    }
    var k = clave(x, signo > 0 ? '+' : '-', y);
    if (TAREA[k]) return null;
    return sumaResta(x, y, signo, forma, nivel);
  }

  function sumaResta(x, y, signo, forma, nivel) {
    var op = signo > 0 ? '+' : MENOS;
    var R = signo > 0 ? mas(x, y) : menos(x, y);
    var enunciado = fx(x) + ' ' + op + ' ' + par(y);
    var a = x.n, bb = x.d, c = y.n, d = y.d;
    var L = mcm(bb, d), A = a * (L / bb), C = c * (L / d), S = A + signo * C;
    var verbo = signo > 0 ? 'Suma' : 'Resta';
    var falsas = [];
    var pasos;

    // Cómo termina la cuenta: S/L y, si se puede, su forma simplificada.
    var final = R.d !== L ? fh(S, L) + ', que se simplifica a ' + b(fx(R)) : b(fh(S, L));

    if (forma === 'entero' || bb === 1 || d === 1) {
      // Un entero y una fracción: el entero se escribe con el denominador de la otra.
      var ent = bb === 1 ? x : y, fra = bb === 1 ? y : x, q = fra.d, n = ent.n, cf = fra.n;
      var enteroPrimero = bb === 1;
      var orden = function (u, v) { return enteroPrimero ? u + signo * v : v + signo * u; };   // entero op fracción, en su orden
      pasos = [
        'El entero se escribe con el mismo denominador: ' + n + ' = ' + fh(n * q, q) + '.',
        (enteroPrimero ? fh(n * q, q) + ' ' + op + ' ' + fx(fra) : fx(fra) + ' ' + op + ' ' + fh(n * q, q)) + ' = ' + final + '.'
      ];
      falsas.push({ val: fr(orden(n, cf), q),
        err: 'El ' + n + ' no se junta con el numerador así nada más: es ' + fh(n * q, q) + '. Primero conviértelo y luego ' + (signo > 0 ? 'suma' : 'resta') + ' los numeradores.' });
      if (signo > 0) falsas.push({ val: fr(n + cf, 1 + q), err: 'Sumaste de frente: el ' + n + ' es ' + sobreUno(n) + ', y sus partes son enteros, no ' + nombreParte(q) + '. Conviértelo: ' + n + ' = ' + fh(n * q, q) + '.' });
      if (n > 1) falsas.push({ val: fr(orden(q, cf), q), err: 'Escribiste el ' + n + ' como ' + fh(q, q) + ', que es un solo entero. ' + n + ' enteros son ' + fh(n * q, q) + '.' });
      falsas.push({ val: fr(n * cf, q), err: 'Multiplicaste ' + n + ' × ' + cf + '. Para ' + (signo > 0 ? 'sumar' : 'restar') + ', el entero se escribe como ' + fh(n * q, q) + '.' });
      if (signo < 0) falsas.push({ val: fr(enteroPrimero ? cf - n * q : n * q - cf, q), err: 'Restaste al revés: es ' + fx(x) + ' ' + MENOS + ' ' + fx(y) + ', en ese orden.' });
      return armar(enunciado, R, falsas, { tema: 'Suma y resta de fracciones', ask: 'Calcula y simplifica', tipo: 'suma', pasos: pasos });
    }

    // Fracción y fracción
    if (bb === d) {
      pasos = [
        'Mismo denominador: ' + (signo > 0 ? 'se suman' : 'se restan') + ' los numeradores y el ' + d + ' se queda.',
        num(a) + ' ' + op + ' ' + c + ' = ' + num(S) + '. Queda ' + final + '.'
      ];
      if (signo > 0) falsas.push({ val: fr(a + c, 2 * d), err: 'El denominador no se suma: dice de qué tamaño son las partes, y ese tamaño no cambia. Sólo se suman los numeradores: ' + num(a) + ' + ' + c + ' = ' + num(a + c) + '.' });
      else falsas.push({ val: fr(a + c, d), err: 'Sumaste los numeradores, pero es una resta: ' + num(a) + ' ' + MENOS + ' ' + c + ' = ' + num(S) + '.' });
      falsas.push({ val: fr(a * c, d * d), err: 'Multiplicaste las fracciones. Para ' + (signo > 0 ? 'sumar' : 'restar') + ' con el mismo denominador, sólo se ' + (signo > 0 ? 'suman' : 'restan') + ' los numeradores.' });
      falsas.push({ val: fr(S, 1), err: 'Te faltó el denominador: ' + (S === 1 ? 'es un ' + nombreParte(d, true) : 'son ' + num(S) + ' ' + nombreParte(d)) + ', así que el resultado es ' + fh(S, d) + '.' });
    } else {
      pasos = [
        'Común denominador: el mínimo común múltiplo de ' + bb + ' y ' + d + ' es ' + b(L) + '.',
        'Convierte: ' + conversion(x, A, y, C, L) + '.',
        verbo + ' los numeradores: ' + num(A) + ' ' + op + ' ' + C + ' = ' + num(S) + '. Queda ' + final + '.'
      ];
      if (signo > 0) falsas.push({ val: fr(a + c, bb + d), err: 'Sumaste de frente, arriba con arriba y abajo con abajo. Sólo se juntan partes del mismo tamaño: primero el común denominador, ' + L + '.' });
      else if (bb - d > 0 && a - c !== 0) falsas.push({ val: fr(a - c, bb - d), err: 'Restaste de frente, arriba con arriba y abajo con abajo. Primero hay que igualar los denominadores: ' + L + '.' });
      falsas.push({ val: fr(a + signo * c, L), err: 'Pusiste el común denominador, ' + L + ', pero no convertiste ' + (bb !== L && d !== L ? 'los numeradores: ' : 'el numerador: ') + conversion(x, A, y, C, L, true) + '.' });
      if (signo > 0) falsas.push({ val: fr(A + C, 2 * L), err: 'Ya con el mismo denominador, también sumaste los denominadores (' + L + ' + ' + L + '). El denominador se queda en ' + L + ': ' + fh(A + C, L) + '.' });
      falsas.push({ val: fr(a * bb + signo * c * d, bb * d), err: 'Multiplicaste cada numerador por su propio denominador. Se cruzan: ' + num(a) + ' × ' + d + ' y ' + c + ' × ' + bb + '.' });
      if (signo < 0) falsas.push({ val: fr(C - A, L), err: 'Restaste al revés: ' + num(C) + ' ' + MENOS + ' ' + num(A) + '. Es la primera menos la segunda: ' + num(A) + ' ' + MENOS + ' ' + C + '.' });
      falsas.push({ val: por(x, y), err: 'Multiplicaste las fracciones. Para ' + (signo > 0 ? 'sumar' : 'restar') + ' no se multiplican: se igualan los denominadores.' });
    }
    // Con negativos (nivel 3): los errores de signo de la semana 1.
    if (nivel === 3 && (a < 0 || S < 0)) {
      var t1 = x, t2 = { n: signo * y.n, d: y.d };            // los dos sumandos con su signo
      var distintos = (t1.n < 0) !== (t2.n < 0);
      var abs1 = { n: Math.abs(t1.n), d: t1.d }, abs2 = { n: Math.abs(t2.n), d: t2.d };
      var mayor = abs1.n * abs2.d > abs2.n * abs1.d ? t1 : t2;
      falsas.unshift({ val: fr(-R.n, R.d), err: distintos
        ? 'El signo: ' + fx(t1) + ' y ' + par(t2) + ' tienen signos distintos, así que gana el signo del que pesa más, ' + fx(mayor) + '.'
        : 'Los dos son negativos: el resultado también es negativo.' });
      if (distintos) {
        var sumaAbs = mas(abs1, abs2);
        falsas.unshift({ val: fr(Math.sign(mayor.n) * sumaAbs.n, sumaAbs.d), err: 'Los signos son distintos: los valores absolutos se restan, no se suman (como en la semana 1).' });
      } else {
        var restaAbs = menos(abs1, abs2);
        falsas.unshift({ val: fr(-Math.abs(restaAbs.n), restaAbs.d), err: 'Los dos son negativos: los valores absolutos se suman, no se restan (como en la semana 1).' });
      }
      pasos.unshift('Los signos: ' + (distintos ? 'son distintos, así que se restan y gana el del que pesa más.' : 'los dos son negativos, así que se suman y el resultado es negativo.'));
    }
    return armar(enunciado, R, falsas, { tema: 'Suma y resta de fracciones', ask: 'Calcula y simplifica', tipo: 'suma', pasos: pasos });
  }

  // «1/4 = 3/12 y 1/6 = 2/12», sin escribir «7/8 = 7/8» cuando una ya tiene el denominador común.
  function conversion(x, A, y, C, L, soloLasQueCambian) {
    var partes = [];
    if (x.d !== L) partes.push(fx(x) + ' = ' + fh(A, L));
    if (y.d !== L) partes.push(fx(y) + ' = ' + fh(C, L));
    var ya = x.d === L ? x : y.d === L ? y : null;
    return partes.join(' y ') + (ya && !soloLasQueCambian ? ' (' + fx(ya) + ' ya está en ' + nombreParte(L) + ')' : '');
  }

  function nombreParte(d, una) {
    var nombres = { 2: 'medio', 3: 'tercio', 4: 'cuarto', 5: 'quinto', 6: 'sexto', 7: 'séptimo', 8: 'octavo', 9: 'noveno', 10: 'décimo', 12: 'doceavo' };
    if (!nombres[d]) return una ? 'parte de ' + d : 'partes de ' + d;
    return nombres[d] + (una ? '' : 's');
  }

  /* =====================================================================
     Productos y cocientes
     ===================================================================== */
  function genMul(nivel) {
    var esDiv = nivel === 1 ? false : moneda();
    var x, y, forma;
    if (nivel === 1) {
      forma = Math.random() < 0.3 ? 'entero' : 'fracciones';
      if (forma === 'entero') { x = entera(entero(2, 6)); y = propia(2, 9); if (moneda()) { var t = x; x = y; y = t; } }
      else { x = propia(2, 6); y = propia(2, 6); }
    } else if (nivel === 2) {
      forma = Math.random() < 0.25 ? 'entero' : 'fracciones';
      if (forma === 'entero') { x = entera(entero(2, 8)); y = propia(2, 9); if (moneda()) { var t2 = x; x = y; y = t2; } }
      else { x = propia(2, 10); y = propia(2, 10); }
    } else {
      forma = Math.random() < 0.2 ? 'entero' : 'fracciones';
      if (forma === 'entero') { x = entera(entero(2, 9)); y = propia(3, 12); if (moneda()) { var t3 = x; x = y; y = t3; } }
      else { x = propia(3, 12); y = propia(3, 12); }
      // Negativos: uno o los dos.
      var cual = azar(['x', 'y', 'ambos']);
      if (cual !== 'y') x = { n: -x.n, d: x.d };
      if (cual !== 'x') y = { n: -y.n, d: y.d };
    }
    if (x.d === 1 && y.d === 1) return null;
    if (TAREA[clave(x, esDiv ? ':' : '*', y)]) return null;
    return esDiv ? cociente(x, y, nivel) : producto(x, y, nivel);
  }

  function signoPaso(x, y, R) {
    var iguales = (x.n < 0) === (y.n < 0);
    return 'Primero el signo: ' + (iguales ? 'signos iguales dan positivo.' : 'signos distintos dan negativo.');
  }
  function errorDeSigno(x, y) {
    var iguales = (x.n < 0) === (y.n < 0);
    return 'El signo: ' + (iguales ? 'los dos tienen el mismo signo, y signos iguales dan positivo.' : 'tienen signos distintos, y signos distintos dan negativo.') + ' Es la ley de los signos de la semana 1.';
  }

  function producto(x, y, nivel) {
    var R = por(x, y);
    var P = x.n * y.n, Q = x.d * y.d;
    var enunciado = fx(x) + ' × ' + par(y);
    var falsas = [], pasos;
    var conSignos = x.n < 0 || y.n < 0;
    if (x.d === 1 || y.d === 1) {
      var ent = x.d === 1 ? x : y, fra = x.d === 1 ? y : x;
      pasos = [
        'El ' + num(ent.n) + ' es ' + sobreUno(ent.n) + ': sólo multiplica al numerador.',
        num(ent.n) + ' × ' + parHtml(fra.n, num(fra.n)) + ' = ' + num(P) + ', y el denominador se queda: ' + (R.d !== Q ? fh(P, Q) + ' = ' + b(fx(R)) : b(fh(P, Q))) + '.'
      ];
      falsas.push({ val: tal(ent.n * fra.n, ent.n * fra.d), err: 'Multiplicaste también el denominador. El ' + num(ent.n) + ' es ' + sobreUno(ent.n) + ': abajo queda ' + fra.d + ' × 1 = ' + fra.d + '.' });
      falsas.push({ val: fr(ent.n + fra.n, fra.d), err: 'Sumaste el ' + num(ent.n) + ' al numerador; se multiplica: ' + num(ent.n) + ' × ' + parHtml(fra.n, num(fra.n)) + ' = ' + num(P) + '.' });
      falsas.push({ val: fr(fra.n, ent.n * fra.d), err: 'Multiplicaste el denominador en vez del numerador. Eso sería dividir entre ' + num(ent.n) + '.' });
      falsas.push({ val: fr(ent.n * fra.d, fra.n), err: 'Volteaste la fracción como si fuera una división. Al multiplicar no se voltea nada.' });
    } else {
      var cancela = mcd(x.n, y.d) > 1 || mcd(y.n, x.d) > 1;
      pasos = [
        'Numerador por numerador: ' + num(x.n) + ' × ' + par(fr(y.n, 1)) + ' = ' + num(P) + '.',
        'Denominador por denominador: ' + x.d + ' × ' + y.d + ' = ' + Q + '.',
        R.d !== Q || R.n !== P ? 'Queda ' + fh(P, Q) + ', que se simplifica a ' + b(fx(R)) + '.' + (cancela ? ' Atajo: simplifica antes de multiplicar.' : '') : 'Queda ' + b(fh(P, Q)) + '; ya no se simplifica.'
      ];
      falsas.push({ val: fr(x.n * y.d, x.d * y.n), err: 'Volteaste la segunda como si fuera una división. Al multiplicar no se voltea nada: arriba por arriba y abajo por abajo.' });
      if (x.d === y.d) falsas.push({ val: fr(P, x.d), err: 'Dejaste el denominador como en la suma. Al multiplicar, los denominadores también se multiplican: ' + x.d + ' × ' + y.d + ' = ' + Q + '.' });
      falsas.push({ val: mas(x, y), err: 'Ésa es la suma de las dos fracciones, no su producto. Para multiplicar: arriba por arriba y abajo por abajo.' });
      falsas.push({ val: fr(x.n + y.n, x.d + y.d), err: 'Sumaste de frente. Para multiplicar: ' + num(x.n) + ' × ' + par(fr(y.n, 1)) + ' arriba y ' + x.d + ' × ' + y.d + ' abajo.' });
      var L = mcm(x.d, y.d);
      if (L !== x.d * y.d || x.d === y.d) falsas.push({ val: fr(x.n * (L / x.d) * y.n * (L / y.d), L), err: 'Sacaste común denominador, que para multiplicar no hace falta, y dejaste abajo ' + L + '. Directo: arriba por arriba y abajo por abajo.' });
    }
    if (conSignos) {
      falsas.unshift({ val: fr(-R.n, R.d), err: errorDeSigno(x, y) });
      pasos.unshift(signoPaso(x, y, R));
    }
    return armar(enunciado, R, falsas, { tema: 'Multiplicación de fracciones', ask: 'Calcula y simplifica', tipo: 'mul', pasos: pasos });
  }

  function cociente(x, y, nivel) {
    var R = entre(x, y);
    // Una fracción entre sí misma (o su contraria) da ±1: ahí «volteaste las dos» vale lo mismo que la correcta.
    if (!R || Math.abs(R.n) === R.d) return null;
    var enunciado = fx(x) + ' ÷ ' + par(y);
    var falsas = [], pasos;
    var conSignos = x.n < 0 || y.n < 0;
    var inv = fr(y.d, y.n);                       // el recíproco de la que divide
    var P = x.n * inv.n, Q = x.d * inv.d;
    if (y.d === 1) {
      // fracción ÷ entero
      pasos = [
        'Dividir entre ' + num(y.n) + ' es multiplicar por ' + volteada(y) + '.',
        fx(x) + ' × ' + parHtml(inv.n, volteada(y)) + ' = ' + (R.d !== Q || R.n !== P ? fh(P, Q) + ' = ' + b(fx(R)) : b(fh(P, Q))) + '.'
      ];
      falsas.push({ val: fr(x.n * y.n, x.d), err: 'Multiplicaste por ' + num(y.n) + '. Dividir entre ' + num(y.n) + ' es multiplicar por ' + volteada(y) + ': el denominador se multiplica.' });
      falsas.push({ val: fr(x.d, x.n * y.n), err: 'Volteaste la primera. Se voltea la que divide: ' + num(y.n) + ' = ' + sobreUno(y.n) + ' se vuelve ' + volteada(y) + '.' });
      falsas.push({ val: fr(x.d * y.n, x.n), err: 'Te salió al revés: es el recíproco del resultado. Sólo se voltea la que divide.' });
    } else if (x.d === 1) {
      // entero ÷ fracción
      pasos = [
        'Dividir entre ' + fx(y) + ' es multiplicar por su recíproco, ' + volteada(y) + '.',
        num(x.n) + ' × ' + parHtml(inv.n, volteada(y)) + ' = ' + (R.d !== Q || R.n !== P ? fh(P, Q) + ' = ' + b(fx(R)) : b(fh(P, Q))) + '.'
      ];
      falsas.push({ val: fr(x.n * y.n, y.d), err: 'Multiplicaste sin voltear. Dividir entre ' + fx(y) + ' es multiplicar por ' + volteada(y) + '.' });
      falsas.push({ val: fr(y.n, x.n * y.d), err: 'Volteaste el entero (' + num(x.n) + ' = ' + sobreUno(x.n) + '). Se voltea la que divide, ' + fx(y) + '.' });
      falsas.push({ val: fr(y.d, x.n * y.n), err: 'Volteaste los dos: te salió el resultado al revés. Sólo se voltea la que divide.' });
      falsas.push({ val: fr(x.n * y.d, 1), err: 'Multiplicaste sólo por el denominador. Falta dividir entre el numerador: ' + num(x.n) + ' × ' + parHtml(inv.n, volteada(y)) + '.' });
    } else {
      pasos = [
        'Dividir entre ' + fx(y) + ' es multiplicar por su recíproco, ' + volteada(y) + ': se voltea la segunda.',
        fx(x) + ' × ' + parHtml(inv.n, volteada(y)) + ' = ' + fh(P, Q) + '.',
        R.d !== Q || R.n !== P ? 'Simplifica: ' + b(fx(R)) + '.' : 'Ya no se simplifica: ' + b(fx(R)) + '.'
      ];
      falsas.push({ val: fr(x.n * y.n, x.d * y.d), err: 'Multiplicaste sin voltear la segunda. Para dividir se multiplica por el recíproco: ' + fx(x) + ' × ' + parHtml(inv.n, volteada(y)) + '.' });
      falsas.push({ val: fr(x.d * y.n, x.n * y.d), err: 'Volteaste la primera. Se voltea la que divide, la segunda: ' + fx(x) + ' × ' + parHtml(inv.n, volteada(y)) + '.' });
      falsas.push({ val: fr(x.d * y.d, x.n * y.n), err: 'Volteaste las dos: te salió el resultado al revés. Sólo se voltea la segunda.' });
    }
    if (conSignos) {
      falsas.unshift({ val: fr(-R.n, R.d), err: errorDeSigno(x, y) });
      pasos.unshift(signoPaso(x, y, R));
    }
    return armar(enunciado, R, falsas, { tema: 'División de fracciones', ask: 'Calcula y simplifica', tipo: 'div', pasos: pasos });
  }

  M.GENERADORES['fracciones-equivalentes'] = conReintentos(genEquivalentes);
  M.GENERADORES['fracciones-de-cantidad'] = conReintentos(genDeCantidad);
  M.GENERADORES['fracciones-suma'] = conReintentos(genSuma);
  M.GENERADORES['fracciones-mul'] = conReintentos(genMul);
})();
