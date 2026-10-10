/*
 * ejercicios-potencias-radicales.js — generadores de Potencias y radicales
 * (Fundamentos · semana 3 · Matemáticas) para la práctica sin fin y el reto relámpago.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se carga
 * después de él. Cada generador devuelve { enunciado, correcta, opciones: [{ val, ok, err }],
 * meta }: cuatro opciones, una correcta, y cada falsa es un error real con su explicación.
 *
 *   pot-leyes     qué es una potencia y las leyes de los exponentes
 *   pot-cero-neg  exponente cero y exponente negativo
 *   pot-diez      potencias de 10 (el puente con la notación científica)
 *   radicales     raíces exactas, raíz de un producto, simplificar y exponente fraccionario
 *
 * El motor ya trae «potencias», pero varias de sus opciones falsas no explican el error
 * («Resultado incorrecto.» en 2², «Revisa la ley…» en las leyes): éstos cubren lo mismo y
 * cada falsa dice qué se hizo mal.
 *
 * Los valores van en la forma que entiende el motor, para que M.tex los pinte y M.fkey
 * descarte las repetidas: { k: clave, h: html }. Un número lleva la clave de su fracción
 * reducida ('3/4', '-8/1'), la misma que usa el motor, así dos opciones que valen lo mismo
 * nunca salen juntas; una expresión (x⁷, 5√2, 2⁵) lleva una clave propia.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';

  /* ---------- Azar ---------- */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
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
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function pow(b, e) { return Math.pow(b, e); }
  function esCuadrado(n) { var r = Math.round(Math.sqrt(n)); return r * r === n; }

  /* ---------- Escritura ---------- */
  // Un entero con el signo menos tipográfico; con coma de miles si es grande.
  function num(n) { return (n < 0 ? MENOS : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function par(n) { return n < 0 ? '(' + num(n) + ')' : num(n); }
  function sup(e) { return '<sup>' + (typeof e === 'number' ? num(e) : e) + '</sup>'; }
  function potH(base, e) { return (typeof base === 'number' ? par(base) : base) + sup(e); }
  function fracH(n, d) { return '<span class="fr"><span class="fr__n">' + n + '</span><span class="fr__d">' + d + '</span></span>'; }
  var VECES = ['cero veces', 'una vez', 'dos veces', 'tres veces', 'cuatro veces', 'cinco veces', 'seis veces',
    'siete veces', 'ocho veces', 'nueve veces', 'diez veces', 'once veces', 'doce veces'];
  // «2 × 2 × 2»: la base escrita tantas veces como dice el exponente.
  function factores(b, e) { var f = []; for (var i = 0; i < e; i++) f.push(par(b)); return f.join(' × '); }
  function ceros(n) { var s = ''; for (var i = 0; i < n; i++) s += '0'; return s; }
  var RAIZ = { 2: '√', 3: '∛', 4: '∜' };
  function raizH(indice) { return RAIZ[indice] || sup(indice) + '√'; }
  var NOMBRE_RAIZ = { 2: 'raíz cuadrada', 3: 'raíz cúbica', 4: 'raíz cuarta', 5: 'raíz quinta' };

  /* ---------- Valores ---------- */
  // Un número exacto n/d: entero con coma de miles o fracción apilada.
  function numero(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = mcd(n, d); n /= g; d /= g;
    var h = d === 1 ? num(n) : (n < 0 ? MENOS : '') + fracH(num(Math.abs(n)), num(d));
    return { k: n + '/' + d, h: h };
  }
  // Una fracción tal como la deja un error, sin simplificar (2/6, no 1/3).
  function sinReducir(n, d) { return { k: 'nr:' + n + '/' + d, h: fracH(num(n), num(d)) }; }
  // 10ⁿ escrito como número: 1,000 o 0.001.
  function valorDiez(e) {
    if (e >= 0) return numero(pow(10, e));
    return { k: '1/' + pow(10, -e), h: '0.' + ceros(-e - 1) + '1' };
  }
  // Una potencia sin calcular: 2⁵, 10⁻³, (−3)⁴.
  function pw(base, e) { return { k: 'p:' + base + '^' + e, h: potH(base, e) }; }
  // c·xᵉ: 8x³, x⁷, −x², 3x. Con exponente 0 es sólo el número.
  function mono(c, e) {
    if (e === 0) return numero(c);
    var h = (c === 1 ? '' : c === -1 ? MENOS : num(c)) + 'x' + (e === 1 ? '' : sup(e));
    return { k: 'm:' + c + ':' + e, h: h };
  }
  function xH(e) { return mono(1, e).h; }
  // c/xᵉ, con c entero.
  function sobreX(c, e) {
    return { k: 'q:' + c + ':' + e, h: (c < 0 ? MENOS : '') + fracH(num(Math.abs(c)), 'x' + (e === 1 ? '' : sup(e))) };
  }
  // 1/(c·xᵉ)
  function unoSobre(c, e) {
    if (c === 1) return sobreX(1, e);
    return { k: 'u:' + c + ':' + e, h: fracH('1', num(c) + 'x' + (e === 1 ? '' : sup(e))) };
  }
  // c√r: 5√2, √20.
  function rad(c, r) { return { k: 'r:' + c + ':' + r, h: (c === 1 ? '' : num(c)) + '√' + num(r) }; }
  function texto(t) { return { k: 't:' + t, h: t }; }

  /* ---------- Las cuatro opciones ---------- */
  // La correcta y tres falsas distintas. La marcada «fija» (el error más común) sale siempre;
  // las demás se eligen al azar, para que no salgan siempre las mismas.
  function armar(enunciado, correcta, falsas, meta) {
    var vistas = {};
    vistas[correcta.k] = true;
    var lista = falsas.filter(function (f) { return f && f.val; });
    var orden = lista.filter(function (f) { return f.fija; }).concat(barajar(lista.filter(function (f) { return !f.fija; })));
    var elegidas = [];
    orden.forEach(function (f) {
      if (elegidas.length >= 3 || vistas[f.val.k]) return;
      vistas[f.val.k] = true;
      elegidas.push(f);
    });
    var opciones = [{ val: correcta, ok: true }].concat(elegidas.map(function (f) {
      return { val: f.val, ok: false, err: f.err };
    }));
    return { enunciado: enunciado, correcta: correcta, opciones: barajar(opciones), meta: meta };
  }

  /* ═══════════════════ Potencias y leyes de los exponentes ═══════════════════ */

  // Potencias que se calculan sin calculadora: base → exponentes.
  var TABLA = { 2: [3, 4, 5, 6, 7], 3: [2, 3, 4], 4: [2, 3], 5: [2, 3], 6: [2], 7: [2], 8: [2], 9: [2], 11: [2], 12: [2] };

  function evaluar() {
    var b = azar([2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
    var e = azar(TABLA[b]);
    var v = pow(b, e), cuenta = factores(b, e);
    return armar(potH(b, e), numero(v), [
      { val: numero(b * e), fija: true, err: 'Multiplicaste la base por el exponente: ' + b + ' × ' + e + ' = ' + num(b * e) +
        '. El exponente no multiplica: <strong>cuenta los factores</strong>, ' + cuenta + ' = ' + num(v) + '.' },
      { val: numero(b + e), err: 'Sumaste la base y el exponente. ' + potH(b, e) + ' es el ' + b + ' multiplicado por sí mismo ' +
        VECES[e] + ': ' + cuenta + ' = ' + num(v) + '.' },
      { val: numero(pow(e, b)), err: 'Volteaste base y exponente: eso es ' + potH(e, b) + ' = ' + num(pow(e, b)) +
        '. La base es la que se repite, el ' + b + ', y el exponente dice cuántas veces.' },
      { val: numero(pow(b, e - 1)), err: 'Te faltó un factor: ' + potH(b, e) + ' lleva el ' + b + ' <strong>' + VECES[e] +
        '</strong>, ' + cuenta + ' = ' + num(v) + '.' },
      { val: numero(pow(b, e + 1)), err: 'Te sobró un factor: ' + potH(b, e) + ' lleva el ' + b + ' ' + VECES[e] + ', no ' +
        VECES[e + 1] + '. ' + cuenta + ' = ' + num(v) + '.' }
    ], { tema: 'Potencias', ask: 'Calcula', pasos: [
      potH(b, e) + ' = ' + cuenta + ' = <b>' + num(v) + '</b>.',
      'El exponente dice cuántas veces aparece la base como factor.'] });
  }

  function productoNum() {
    var b = azar([2, 3, 5, 7]), m = rint(2, 7), n = rint(2, 6);
    if (m === 2 && n === 2) n = 3;
    var s = m + n;
    return armar(potH(b, m) + ' · ' + potH(b, n), pw(b, s), [
      { val: pw(b, m * n), fija: true, err: 'Multiplicaste los exponentes. Al multiplicar potencias de la misma base, los factores se ' +
        '<strong>juntan</strong>: son ' + m + ' + ' + n + ' = ' + s + ', así que queda ' + potH(b, s) + '.' },
      { val: pw(b * b, s), err: 'Multiplicaste las bases: ' + b + ' × ' + b + ' = ' + (b * b) + '. La base se queda igual, ' + b +
        '; sólo se cuentan los factores: ' + potH(b, s) + '.' },
      { val: pw(b * b, m * n), err: 'Multiplicaste las bases y los exponentes. La base se queda igual y los exponentes se ' +
        '<strong>suman</strong>: ' + potH(b, s) + '.' },
      { val: pw(b, Math.abs(m - n)), err: 'Restaste los exponentes; eso se hace al dividir. Al multiplicar se suman: ' +
        m + ' + ' + n + ' = ' + s + '.' }
    ], { tema: 'Leyes de los exponentes', ask: 'Escribe como una sola potencia', pasos: [
      'Misma base: los factores se juntan, ' + m + ' + ' + n + ' = ' + s + '.',
      potH(b, m) + ' · ' + potH(b, n) + ' = <b>' + potH(b, s) + '</b>.'] });
  }

  function cocienteNum() {
    var b = azar([2, 3, 5, 7]), m = rint(5, 9), n = rint(2, m - 2), d = m - n;
    return armar(potH(b, m) + ' ÷ ' + potH(b, n), pw(b, d), [
      { val: pw(b, m + n), fija: true, err: 'Sumaste los exponentes. Al dividir, cada factor de abajo se <strong>cancela</strong> con uno ' +
        'de arriba: quedan ' + m + ' − ' + n + ' = ' + d + '.' },
      m % n === 0 ? { val: pw(b, m / n), err: 'Dividiste los exponentes: se restan, ' + m + ' − ' + n + ' = ' + d + '.' } : null,
      { val: pw(b, m * n), err: 'Multiplicaste los exponentes. Al dividir se restan: ' + m + ' − ' + n + ' = ' + d + '.' },
      { val: pw(b, n - m), err: 'Restaste al revés: es el exponente de arriba menos el de abajo, ' + m + ' − ' + n + ' = ' + d + '.' },
      { val: pw(1, d), err: 'Dividiste las bases, ' + b + ' ÷ ' + b + ' = 1. La base se queda igual: ' + potH(b, d) + '.' }
    ], { tema: 'Leyes de los exponentes', ask: 'Escribe como una sola potencia', pasos: [
      'Misma base: cada factor de abajo se cancela con uno de arriba, ' + m + ' − ' + n + ' = ' + d + '.',
      potH(b, m) + ' ÷ ' + potH(b, n) + ' = <b>' + potH(b, d) + '</b>.'] });
  }

  // (−b)ᵉ contra −bᵉ: el exponente sólo eleva lo que tiene pegado.
  function baseNegativa() {
    var b, e, v;
    if (moneda()) {
      b = azar([2, 2, 3, 3, 4, 5]);
      e = azar(b === 2 ? [3, 4, 5] : b === 3 ? [2, 3, 4] : [2, 3]);
      v = pow(-b, e);
      var negativos = e % 2 === 0 ? 'un número <strong>par</strong> de negativos: el resultado es positivo'
        : 'un número <strong>impar</strong> de negativos: el resultado es negativo';
      return armar('(' + MENOS + b + ')' + sup(e), numero(v), [
        { val: numero(-v), fija: true, err: 'El paréntesis eleva también al signo: son ' + e + ' factores ' + par(-b) + ', ' + negativos +
          ', ' + num(v) + '.' },
        { val: numero(-b * e), err: 'Multiplicaste la base por el exponente: ' + par(-b) + ' × ' + e + ' = ' + num(-b * e) +
          '. El exponente cuenta los factores: ' + factores(-b, e) + ' = ' + num(v) + '.' },
        { val: numero(b * e), err: 'Multiplicaste la base por el exponente y además perdiste el signo. ' + par(-b) + sup(e) + ' = ' +
          factores(-b, e) + ' = ' + num(v) + '.' },
        { val: numero(pow(-b, e - 1)), err: 'Te faltó un factor: son ' + e + ' veces el ' + par(-b) + ', ' + factores(-b, e) + ' = ' +
          num(v) + '.' }
      ], { tema: 'Base negativa', ask: 'Calcula', pasos: [
        par(-b) + sup(e) + ' = ' + factores(-b, e) + ': ' + (e % 2 === 0 ? 'número par de negativos.' : 'número impar de negativos.'),
        'El resultado es <b>' + num(v) + '</b>.'] });
    }
    b = azar([2, 3, 3, 4, 5, 6, 7]);
    e = b === 2 ? 4 : b === 3 ? azar([2, 4]) : 2;
    v = pow(b, e);
    return armar(MENOS + b + sup(e), numero(-v), [
      { val: numero(v), fija: true, err: 'Sin paréntesis, el exponente sólo eleva al ' + b + ': ' + MENOS + b + sup(e) + ' = ' + MENOS + '(' +
        factores(b, e) + ') = ' + num(-v) + '. El menos se queda afuera.' },
      { val: numero(-b * e), err: 'Multiplicaste la base por el exponente. El exponente cuenta los factores: ' + factores(b, e) + ' = ' +
        num(v) + ', y el menos se queda: ' + num(-v) + '.' },
      { val: numero(b * e), err: 'Ése es ' + b + ' × ' + e + ' sin el signo. ' + MENOS + b + sup(e) + ' = ' + MENOS + '(' + factores(b, e) +
        ') = ' + num(-v) + '.' }
    ], { tema: 'Base negativa', ask: 'Calcula', pasos: [
      'Sin paréntesis, el exponente sólo eleva al ' + b + ': ' + factores(b, e) + ' = ' + num(v) + '.',
      'El menos se queda afuera: <b>' + num(-v) + '</b>.'] });
  }

  function productoX() {
    var m, n, s;
    if (Math.random() < 0.65) {
      m = rint(2, 8); n = rint(2, 8);
      if (m === n) n = m === 8 ? 7 : m + 1;
      s = m + n;
      return armar(xH(m) + ' · ' + xH(n), mono(1, s), [
        { val: mono(1, m * n), fija: true, err: 'Multiplicaste los exponentes. Al multiplicar, los factores x se <strong>juntan</strong>: ' +
          m + ' + ' + n + ' = ' + s + '.' },
        { val: mono(2, s), err: 'Las x no se suman: ' + xH(m) + ' · ' + xH(n) + ' es una multiplicación. Queda una sola x con ' + m +
          ' + ' + n + ' = ' + s + ' factores: ' + xH(s) + '.' },
        { val: mono(1, Math.abs(m - n)), err: 'Restaste los exponentes; eso es al dividir. Al multiplicar se suman: ' + m + ' + ' + n +
          ' = ' + s + '.' }
      ], { tema: 'Leyes de los exponentes', ask: 'Simplifica', pasos: [
        'Misma base: se suman los exponentes, ' + m + ' + ' + n + ' = ' + s + '.',
        xH(m) + ' · ' + xH(n) + ' = <b>' + xH(s) + '</b>.'] });
    }
    // Con una x sola, que vale x¹: el factor que se olvida.
    do { m = rint(2, 6); n = rint(2, 6); } while (m * n === m + n || m * n === m + n + 1);
    s = m + n + 1;
    return armar(xH(m) + ' · x · ' + xH(n), mono(1, s), [
      { val: mono(1, m + n), fija: true, err: 'La x sola es x<sup>1</sup>: también es un factor. Son ' + m + ' + 1 + ' + n + ' = ' + s + '.' },
      { val: mono(1, m * n), err: 'Multiplicaste los exponentes. Al multiplicar se suman, y la x sola cuenta como 1: ' + m + ' + 1 + ' + n +
        ' = ' + s + '.' },
      { val: mono(3, s), err: 'Las x no se suman: es una multiplicación, y queda una sola x con ' + s + ' factores: ' + xH(s) + '.' }
    ], { tema: 'Leyes de los exponentes', ask: 'Simplifica', pasos: [
      'La x sola es x<sup>1</sup>. Se suman los exponentes: ' + m + ' + 1 + ' + n + ' = ' + s + '.',
      'Queda <b>' + xH(s) + '</b>.'] });
  }

  function cocienteX(enFraccion) {
    var m = rint(5, 12), n = rint(2, m - 2), d = m - n;
    var enun = enFraccion ? fracH(xH(m), xH(n)) : xH(m) + ' ÷ ' + xH(n);
    return armar(enun, mono(1, d), [
      { val: mono(1, m + n), fija: true, err: 'Sumaste los exponentes. Al dividir, cada x de abajo se <strong>cancela</strong> con una de ' +
        'arriba: quedan ' + m + ' − ' + n + ' = ' + d + '.' },
      m % n === 0 ? { val: mono(1, m / n), err: 'Dividiste los exponentes: se restan, ' + m + ' − ' + n + ' = ' + d + '.' } : null,
      { val: mono(1, m * n), err: 'Multiplicaste los exponentes. Al dividir se restan: ' + m + ' − ' + n + ' = ' + d + '.' },
      { val: mono(1, n - m), err: 'Restaste al revés: es el de arriba menos el de abajo, ' + m + ' − ' + n + ' = ' + d + '.' }
    ], { tema: 'Leyes de los exponentes', ask: 'Simplifica', pasos: [
      'Se cancelan ' + n + ' factores x de arriba con los ' + n + ' de abajo.',
      'Quedan ' + m + ' − ' + n + ' = ' + d + ': <b>' + xH(d) + '</b>.'] });
  }

  function potenciaX() {
    var m = rint(2, 6), n = rint(2, 4);
    if (m === 2 && n === 2) m = 3;
    var p = m * n;
    return armar('(' + xH(m) + ')' + sup(n), mono(1, p), [
      { val: mono(1, m + n), fija: true, err: 'Sumaste los exponentes. (' + xH(m) + ')' + sup(n) + ' es ' + xH(m) + ' repetido ' + VECES[n] +
        ': ' + n + ' grupos de ' + m + ' factores, ' + m + ' × ' + n + ' = ' + p + '.' },
      { val: mono(n, m), err: 'Multiplicaste por ' + n + '. Elevar a la ' + n + ' es multiplicar ' + xH(m) + ' por sí mismo ' + VECES[n] +
        ', no por ' + n + ': ' + xH(p) + '.' },
      pow(m, n) <= 99 ? { val: mono(1, pow(m, n)), err: 'Elevaste ' + m + ' a la ' + n + '. El exponente de afuera dice cuántas veces se ' +
        'repite ' + xH(m) + ': los exponentes se multiplican, ' + m + ' × ' + n + ' = ' + p + '.' } : null,
      { val: mono(n, p), err: 'El exponente no sale como coeficiente: (' + xH(m) + ')' + sup(n) + ' = ' + xH(p) + ', sin el ' + n +
        ' adelante.' }
    ], { tema: 'Leyes de los exponentes', ask: 'Simplifica', pasos: [
      'Son ' + n + ' grupos de ' + m + ' factores: se multiplican los exponentes, ' + m + ' × ' + n + ' = ' + p + '.',
      '(' + xH(m) + ')' + sup(n) + ' = <b>' + xH(p) + '</b>.'] });
  }

  // (a·x)ⁿ y, en el nivel 3, (a·xᵐ)ⁿ: el exponente le toca a cada factor.
  function potenciaProducto(nivel) {
    var a, n, c, m, p;
    if (nivel < 3) {
      a = azar([2, 3, 4, 5]);
      n = a === 2 ? azar([3, 4]) : a === 3 ? azar([2, 3]) : 2;
      c = pow(a, n);
      return armar('(' + a + 'x)' + sup(n), mono(c, n), [
        { val: mono(a, n), fija: true, err: 'El exponente le toca a todo lo de adentro, también al ' + a + ': (' + a + 'x)' + sup(n) + ' = ' +
          a + sup(n) + 'x' + sup(n) + ' = ' + c + 'x' + sup(n) + '.' },
        { val: mono(a * n, n), err: 'Multiplicaste ' + a + ' × ' + n + '. ' + a + sup(n) + ' es el ' + a + ' multiplicado por sí mismo ' +
          VECES[n] + ': ' + factores(a, n) + ' = ' + c + '.' },
        { val: mono(c, 1), err: 'Elevaste el ' + a + ', pero la x también va a la ' + n + ': ' + c + 'x' + sup(n) + '.' }
      ], { tema: 'Potencia de un producto', ask: 'Simplifica', pasos: [
        'El exponente le toca a cada factor: ' + a + sup(n) + ' · x' + sup(n) + '.',
        a + sup(n) + ' = ' + factores(a, n) + ' = ' + c + ': <b>' + c + 'x' + sup(n) + '</b>.'] });
    }
    a = azar([2, 3, 5]);
    n = a === 2 ? azar([3, 4]) : a === 3 ? azar([2, 3]) : 2;
    m = n === 2 ? rint(3, 4) : rint(2, 4);
    c = pow(a, n); p = m * n;
    return armar('(' + a + xH(m) + ')' + sup(n), mono(c, p), [
      { val: mono(a, p), fija: true, err: 'El ' + a + ' también se eleva: ' + a + sup(n) + ' = ' + factores(a, n) + ' = ' + c + '.' },
      { val: mono(c, m + n), err: 'Sumaste los exponentes de la x. En una potencia de potencia se multiplican: ' + m + ' × ' + n + ' = ' +
        p + '.' },
      { val: mono(a * n, p), err: 'Multiplicaste ' + a + ' × ' + n + '. ' + a + sup(n) + ' = ' + factores(a, n) + ' = ' + c + '.' }
    ], { tema: 'Potencia de un producto', ask: 'Simplifica', pasos: [
      'A cada factor: ' + a + sup(n) + ' = ' + c + ' y (' + xH(m) + ')' + sup(n) + ' = x' + sup(p) + '.',
      'Queda <b>' + c + 'x' + sup(p) + '</b>.'] });
  }

  // (a/b)ⁿ: arriba y abajo.
  var FRACCIONES = [[2, 3, 2], [2, 3, 3], [3, 2, 2], [3, 2, 3], [3, 4, 2], [4, 3, 2], [2, 5, 2], [5, 2, 2], [3, 5, 2], [5, 3, 2],
    [4, 5, 2], [5, 4, 2], [2, 7, 2], [3, 7, 2]];
  function potenciaFraccion() {
    var f = azar(FRACCIONES), a = f[0], b = f[1], n = f[2];
    var an = pow(a, n), bn = pow(b, n);
    return armar('(' + fracH(a, b) + ')' + sup(n), numero(an, bn), [
      { val: numero(a, bn), fija: true, err: 'El exponente le toca a los dos, arriba y abajo: ' + fracH(a + sup(n), b + sup(n)) + ' = ' +
        fracH(an, bn) + '.' },
      { val: numero(an, b), err: 'Elevaste sólo el numerador: el denominador también va a la ' + n + ', ' + b + sup(n) + ' = ' + bn + '.' },
      { val: sinReducir(a * n, b * n), err: 'Multiplicaste por ' + n + ' arriba y abajo. Elevar es multiplicar la fracción por sí misma ' +
        VECES[n] + ': ' + fracH(an, bn) + '.' }
    ], { tema: 'Potencia de un cociente', ask: 'Calcula', pasos: [
      'Arriba y abajo: ' + a + sup(n) + ' = ' + an + ' y ' + b + sup(n) + ' = ' + bn + '.',
      'Queda <b>' + fracH(an, bn) + '</b>.'] });
  }

  function combinadaX() {
    var a, b, c, d, r;
    do { a = rint(2, 4); b = rint(2, 3); c = rint(1, 5); d = rint(2, 9); r = a * b + c - d; } while (r < 1 || r > 12 || a * b === a + b);
    var ab = a * b;
    var enun = fracH('(' + xH(a) + ')' + sup(b) + ' · ' + xH(c), xH(d));
    var falsas = [
      { val: mono(1, a + b + c - d), fija: true, err: 'En (' + xH(a) + ')' + sup(b) + ' los exponentes se multiplican: ' + a + ' × ' + b +
        ' = ' + ab + ', no ' + a + ' + ' + b + '.' },
      { val: mono(1, ab + c + d), err: 'Al dividir se resta el exponente de abajo: ' + ab + ' + ' + c + ' − ' + d + ' = ' + r + '.' }
    ];
    if (c > 1) falsas.push({ val: mono(1, ab * c - d), err: 'En ' + xH(ab) + ' · ' + xH(c) + ' los exponentes se suman, no se ' +
      'multiplican: ' + ab + ' + ' + c + ' = ' + (ab + c) + '.' });
    else falsas.push({ val: mono(1, ab - d), err: 'La x sola es x<sup>1</sup>: también cuenta. ' + ab + ' + 1 − ' + d + ' = ' + r + '.' });
    if ((ab + c) % d === 0) falsas.push({ val: mono(1, (ab + c) / d), err: 'Dividiste los exponentes: al dividir se restan, ' + (ab + c) +
      ' − ' + d + ' = ' + r + '.' });
    falsas.push({ val: mono(1, a + b + c + d), err: 'Sumaste todos los exponentes. Potencia de potencia: se multiplican (' + a + ' × ' + b +
      ' = ' + ab + '); producto: se suman; cociente: se resta el de abajo. Queda ' + r + '.' });
    return armar(enun, mono(1, r), falsas, { tema: 'Leyes de los exponentes', ask: 'Simplifica', pasos: [
      'Potencia de potencia: (' + xH(a) + ')' + sup(b) + ' = ' + xH(ab) + '.',
      'Producto: ' + xH(ab) + ' · ' + xH(c) + ' = ' + xH(ab + c) + '.',
      'Cociente: ' + xH(ab + c) + ' ÷ ' + xH(d) + ' = <b>' + xH(r) + '</b>.'] });
  }

  function genLeyes(nivel) {
    if (nivel === 1) return azar([evaluar, evaluar, productoNum, cocienteNum])();
    if (nivel === 2) return azar([baseNegativa, productoX, function () { return cocienteX(false); }, potenciaX,
      function () { return potenciaProducto(2); }])();
    return azar([combinadaX, combinadaX, function () { return potenciaProducto(3); }, potenciaFraccion,
      function () { return cocienteX(true); }])();
  }

  /* ═══════════════════ Exponente cero y exponente negativo ═══════════════════ */

  function cero() {
    var tipo = azar(['entero', 'entero', 'negativo', 'fraccion']);
    var porque = 'Cualquier número distinto de cero elevado a la 0 da <b>1</b>.';
    if (tipo === 'entero') {
      var a = rint(2, 15);
      return armar(potH(a, 0), numero(1), [
        { val: numero(0), fija: true, err: 'Elevar a la 0 no da 0. Piensa en ' + potH(a, 3) + ' ÷ ' + potH(a, 3) + ': todos los factores se ' +
          'cancelan y queda 1; con la ley, ' + a + sup('3 ' + MENOS + ' 3') + ' = ' + potH(a, 0) + '. Por eso vale 1.' },
        { val: numero(a), err: 'La base no se queda: ' + potH(a, 1) + ' = ' + a + ', pero ' + potH(a, 0) + ' = 1.' },
        { val: numero(1, a), err: 'Eso es ' + potH(a, -1) + ', el recíproco. Con exponente 0 queda 1.' }
      ], { tema: 'Exponente cero', ask: 'Calcula', pasos: [potH(a, 3) + ' ÷ ' + potH(a, 3) + ' = 1 y también = ' + potH(a, 0) + '.', porque] });
    }
    if (tipo === 'negativo') {
      var b = rint(2, 9);
      return armar('(' + MENOS + b + ')' + sup(0), numero(1), [
        { val: numero(0), fija: true, err: 'Elevar a la 0 no da 0: cualquier número distinto de cero elevado a la 0 da 1.' },
        { val: numero(-1), err: 'El paréntesis eleva también al signo: (' + MENOS + b + ')' + sup(0) + ' = 1, como cualquier número distinto de cero.' },
        { val: numero(-b), err: 'La base no se queda: con exponente 0 queda 1.' }
      ], { tema: 'Exponente cero', ask: 'Calcula', pasos: ['El paréntesis eleva todo, también el signo.', porque] });
    }
    var f = azar([[2, 3], [3, 4], [2, 5], [5, 8], [3, 7]]);
    return armar('(' + fracH(f[0], f[1]) + ')' + sup(0), numero(1), [
      { val: numero(0), fija: true, err: 'Elevar a la 0 no da 0: cualquier número distinto de cero elevado a la 0 da 1, también una fracción.' },
      { val: numero(f[0], f[1]), err: 'La fracción no se queda: eso sería el exponente 1. Con 0 queda 1.' },
      { val: numero(f[1], f[0]), err: 'Voltear la fracción es lo que hace el exponente ' + MENOS + '1. Con 0 queda 1.' }
    ], { tema: 'Exponente cero', ask: 'Calcula', pasos: ['Una fracción distinta de cero también es un número.', porque] });
  }

  function ceroConOtros() {
    var tipo = azar(['coef', 'menos', 'suma']);
    var a = rint(tipo === 'suma' ? 3 : 2, 9), b = rint(2, 9);
    if (a === b) b = a === 9 ? 8 : a + 1;
    if (tipo === 'coef') {
      return armar(b + ' · ' + potH(a, 0), numero(b), [
        { val: numero(0), fija: true, err: potH(a, 0) + ' vale 1, no 0: ' + b + ' · 1 = ' + b + '.' },
        { val: numero(b * a), err: potH(a, 0) + ' vale 1, no ' + a + ': ' + b + ' · 1 = ' + b + '.' },
        { val: numero(1), err: 'El exponente 0 sólo le toca al ' + a + ': el ' + b + ' se multiplica por 1 y se queda, ' + b + '.' }
      ], { tema: 'Exponente cero', ask: 'Calcula', pasos: [potH(a, 0) + ' = 1: el exponente sólo eleva al ' + a + '.',
        b + ' · 1 = <b>' + b + '</b>.'] });
    }
    if (tipo === 'menos') {
      return armar(MENOS + potH(a, 0), numero(-1), [
        { val: numero(1), fija: true, err: 'Sin paréntesis, el exponente sólo eleva al ' + a + ': ' + MENOS + potH(a, 0) + ' = ' + MENOS +
          '(' + potH(a, 0) + ') = ' + MENOS + '1.' },
        { val: numero(0), err: potH(a, 0) + ' = 1, no 0: ' + MENOS + potH(a, 0) + ' = ' + MENOS + '1.' },
        { val: numero(-a), err: potH(a, 0) + ' vale 1, no ' + a + ': ' + MENOS + potH(a, 0) + ' = ' + MENOS + '1.' }
      ], { tema: 'Exponente cero', ask: 'Calcula', pasos: ['Sin paréntesis, el exponente sólo eleva al ' + a + ': ' + potH(a, 0) + ' = 1.',
        'El menos se queda: <b>' + MENOS + '1</b>.'] });
    }
    return armar(potH(a, 0) + ' + ' + potH(a, 1), numero(1 + a), [
      { val: numero(a), fija: true, err: potH(a, 0) + ' vale 1, no 0: 1 + ' + a + ' = ' + (1 + a) + '.' },
      { val: numero(2 * a), err: potH(a, 0) + ' vale 1, no ' + a + ': 1 + ' + a + ' = ' + (1 + a) + '.' },
      { val: numero(2), err: potH(a, 1) + ' = ' + a + ': el exponente 1 deja la base igual. 1 + ' + a + ' = ' + (1 + a) + '.' }
    ], { tema: 'Exponente cero', ask: 'Calcula', pasos: [potH(a, 0) + ' = 1 y ' + potH(a, 1) + ' = ' + a + '.',
      '1 + ' + a + ' = <b>' + (1 + a) + '</b>.'] });
  }

  function negUno() {
    var a = rint(2, 12);
    return armar(potH(a, -1), numero(1, a), [
      { val: numero(-a), fija: true, err: 'El exponente negativo no vuelve negativo al número: ' + potH(a, -1) + ' es su recíproco, ' +
        fracH(1, a) + '.' },
      { val: numero(-1, a), err: 'El recíproco de un número positivo es positivo: ' + fracH(1, a) + '.' },
      { val: numero(a), err: 'El signo del exponente sí cuenta: ' + MENOS + '1 quiere decir «uno entre», ' + fracH(1, a) + '.' }
    ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: ['Un exponente ' + MENOS + '1 es el recíproco: «uno entre» el número.',
      potH(a, -1) + ' = <b>' + fracH(1, a) + '</b>.'] });
  }

  var TABLA_NEG = { 2: [2, 3, 4, 5, 6], 3: [2, 3, 4], 4: [2, 3], 5: [2, 3], 6: [2], 7: [2], 8: [2], 9: [2] };
  function neg(nivel) {
    var b = azar(nivel === 1 ? [2, 2, 3, 4, 5] : [2, 2, 3, 3, 4, 5, 6, 7, 8, 9]);
    var lista = TABLA_NEG[b].filter(function (e) { return nivel > 1 || e <= 3; });
    var n = azar(lista), v = pow(b, n), cuenta = factores(b, n);
    return armar(potH(b, -n), numero(1, v), [
      { val: numero(-v), fija: true, err: 'El exponente negativo no vuelve negativo el resultado: ' + potH(b, -n) + ' = ' + fracH(1, potH(b, n)) +
        ' = ' + fracH(1, num(v)) + '.' },
      { val: numero(-b * n), err: 'Multiplicaste la base por el exponente. ' + potH(b, -n) + ' es «uno entre» ' + potH(b, n) + ': ' +
        fracH(1, cuenta) + ' = ' + fracH(1, num(v)) + '.' },
      { val: numero(1, b * n), err: 'Abajo va ' + potH(b, n) + ' = ' + cuenta + ' = ' + num(v) + ', no ' + b + ' × ' + n + '.' },
      { val: numero(v), err: 'El signo del exponente sí cuenta: ' + potH(b, -n) + ' = ' + fracH(1, potH(b, n)) + ', uno entre ' + num(v) + '.' },
      { val: numero(-1, v), err: 'El menos del exponente no pasa al resultado: ' + fracH(1, num(v)) + ' es positivo.' }
    ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: [
      'Exponente negativo: «uno entre» la potencia positiva, ' + potH(b, -n) + ' = ' + fracH(1, potH(b, n)) + '.',
      potH(b, n) + ' = ' + num(v) + ', así que <b>' + fracH(1, num(v)) + '</b>.'] });
  }

  var PARES = [[2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [4, 3], [3, 5], [5, 3], [4, 5], [5, 4], [2, 7], [1, 3], [1, 4], [1, 5], [1, 6]];
  function negFraccion(nivel) {
    var n = nivel === 2 ? azar([1, 1, 2]) : azar([2, 2, 3]);
    var lista = PARES.filter(function (p) { return n < 3 || (p[0] <= 3 && p[1] <= 3); });
    var p = azar(lista), a = p[0], b = p[1];
    var enun = '(' + fracH(a, b) + ')' + sup(-n);
    if (n === 1) {
      return armar(enun, numero(b, a), [
        { val: numero(a, b), fija: true, err: 'El exponente ' + MENOS + '1 voltea la fracción: (' + fracH(a, b) + ')' + sup(-1) + ' = ' +
          numero(b, a).h + '.' },
        { val: numero(-a, b), err: 'El exponente negativo no vuelve negativa la fracción: la voltea, ' + numero(b, a).h + '.' },
        { val: numero(-b, a), err: 'Al voltearla no cambia de signo: ' + numero(b, a).h + ' es positivo.' }
      ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: ['El exponente ' + MENOS + '1 voltea la fracción.',
        '(' + fracH(a, b) + ')' + sup(-1) + ' = <b>' + numero(b, a).h + '</b>.'] });
    }
    var an = pow(a, n), bn = pow(b, n);
    return armar(enun, numero(bn, an), [
      { val: numero(an, bn), fija: true, err: 'Elevaste pero no volteaste: el exponente negativo voltea la fracción, (' + fracH(a, b) + ')' +
        sup(-n) + ' = (' + fracH(b, a) + ')' + sup(n) + ' = ' + numero(bn, an).h + '.' },
      { val: numero(-bn, an), err: 'El signo del exponente no pasa al resultado: (' + fracH(b, a) + ')' + sup(n) + ' es positivo.' },
      { val: numero(b, a), err: 'Volteaste la fracción pero te faltó elevar a la ' + n + ': (' + fracH(b, a) + ')' + sup(n) + ' = ' +
        numero(bn, an).h + '.' },
      { val: sinReducir(b * n, a * n), err: 'Multiplicaste por ' + n + ' en vez de elevar: (' + fracH(b, a) + ')' + sup(n) + ' = ' +
        fracH(b + sup(n), a + sup(n)) + ' = ' + numero(bn, an).h + '.' }
    ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: [
      'El signo menos voltea la fracción: (' + fracH(b, a) + ')' + sup(n) + '.',
      'Arriba y abajo a la ' + n + ': <b>' + numero(bn, an).h + '</b>.'] });
  }

  function negX() {
    var n = rint(2, 6);
    if (moneda()) {
      return armar(xH(-n), sobreX(1, n), [
        { val: mono(-1, n), fija: true, err: 'El exponente negativo no vuelve negativo: ' + xH(-n) + ' = ' + sobreX(1, n).h + ', «uno entre» ' +
          xH(n) + '.' },
        { val: sobreX(-1, n), err: 'El menos del exponente no pasa al resultado: ' + sobreX(1, n).h + ' es positivo.' },
        { val: mono(1, n), err: 'El signo del exponente sí cuenta: la potencia pasa abajo, ' + sobreX(1, n).h + '.' },
        { val: mono(-n, 1), err: xH(-n) + ' no es ' + MENOS + n + ' × x: el exponente cuenta factores y el signo menos los manda abajo, ' +
          sobreX(1, n).h + '.' }
      ], { tema: 'Exponente negativo', ask: 'Escribe con exponente positivo', pasos: [
        'Exponente negativo: «uno entre» la potencia positiva.', xH(-n) + ' = <b>' + sobreX(1, n).h + '</b>.'] });
    }
    var a = rint(2, 9);
    return armar(a + xH(-n), sobreX(a, n), [
      { val: unoSobre(a, n), fija: true, err: 'El exponente sólo le toca a la x: el ' + a + ' se queda arriba, ' + sobreX(a, n).h + '.' },
      { val: mono(-a, n), err: 'El exponente negativo no vuelve negativo: manda la x abajo, ' + sobreX(a, n).h + '.' },
      { val: mono(a, n), err: 'El signo del exponente sí cuenta: la x pasa abajo, ' + sobreX(a, n).h + '.' }
    ], { tema: 'Exponente negativo', ask: 'Escribe con exponente positivo', pasos: [
      'El exponente ' + MENOS + n + ' sólo le toca a la x: ' + xH(-n) + ' = ' + sobreX(1, n).h + '.',
      a + ' · ' + sobreX(1, n).h + ' = <b>' + sobreX(a, n).h + '</b>.'] });
  }

  // Leyes con exponentes negativos: aquí vuelve la regla de los signos de la semana 1.
  function leyesNegNum() {
    var b = azar([2, 3, 5, 7]), forma = azar(['producto', 'cociente', 'dos']);
    var m, n, r;
    if (forma === 'producto') {
      m = rint(2, 8); n = rint(2, 9);
      if (m === n) n = m + 1;
      r = m - n;
      return armar(potH(b, m) + ' · ' + potH(b, -n), pw(b, r), [
        { val: pw(b, m + n), fija: true, err: 'El ' + MENOS + n + ' se suma con su signo: ' + m + ' + (' + MENOS + n + ') = ' + num(r) + '.' },
        { val: pw(b, -m * n), err: 'Multiplicaste los exponentes; al multiplicar potencias se suman: ' + m + ' + (' + MENOS + n + ') = ' +
          num(r) + '.' },
        { val: pw(b, -r), err: 'Revisa el signo: ' + m + ' + (' + MENOS + n + ') = ' + num(r) + '.' },
        { val: pw(b * b, r), err: 'La base no se multiplica: sigue siendo ' + b + '. Sólo se suman los exponentes.' }
      ], { tema: 'Leyes con exponentes negativos', ask: 'Escribe como una sola potencia', pasos: [
        'Producto: se suman los exponentes con su signo, ' + m + ' + (' + MENOS + n + ') = ' + num(r) + '.',
        'Queda <b>' + potH(b, r) + '</b>.'] });
    }
    if (forma === 'cociente') {
      m = rint(2, 7); n = rint(2, 7);
      if (m === n) n = m + 1;
      r = m + n;
      return armar(potH(b, m) + ' ÷ ' + potH(b, -n), pw(b, r), [
        { val: pw(b, m - n), fija: true, err: 'Restar un negativo es sumar: ' + m + ' − (' + MENOS + n + ') = ' + m + ' + ' + n + ' = ' + r + '.' },
        { val: pw(b, -r), err: 'Revisa el signo: ' + m + ' − (' + MENOS + n + ') = +' + r + '.' },
        { val: pw(b, -m * n), err: 'Multiplicaste los exponentes; al dividir se restan: ' + m + ' − (' + MENOS + n + ') = ' + r + '.' },
        { val: pw(b, n - m), err: 'Restaste al revés y sin el signo: es el de arriba menos el de abajo, ' + m + ' − (' + MENOS + n + ') = ' +
          r + '.' }
      ], { tema: 'Leyes con exponentes negativos', ask: 'Escribe como una sola potencia', pasos: [
        'Cociente: se resta el exponente de abajo, ' + m + ' − (' + MENOS + n + ') = ' + m + ' + ' + n + ' = ' + r + '.',
        'Queda <b>' + potH(b, r) + '</b>.'] });
    }
    m = rint(2, 6); n = rint(2, 6);
    if (m === n) n = m + 1;
    r = -(m + n);
    return armar(potH(b, -m) + ' · ' + potH(b, -n), pw(b, r), [
      { val: pw(b, m + n), fija: true, err: 'Los dos exponentes son negativos: (' + MENOS + m + ') + (' + MENOS + n + ') = ' + num(r) + '.' },
      { val: pw(b, m * n), err: 'Multiplicaste los exponentes: (' + MENOS + m + ')(' + MENOS + n + ') = ' + (m * n) + '. Al multiplicar ' +
        'potencias se suman: (' + MENOS + m + ') + (' + MENOS + n + ') = ' + num(r) + '.' },
      { val: pw(b, Math.abs(m - n)), err: 'Revisa los signos: (' + MENOS + m + ') + (' + MENOS + n + ') = ' + num(r) + '; dos negativos ' +
        'que se suman dan negativo.' },
      { val: pw(b, -Math.abs(m - n)), err: 'Restaste los exponentes. Al multiplicar se suman: (' + MENOS + m + ') + (' + MENOS + n + ') = ' +
        num(r) + '.' }
    ], { tema: 'Leyes con exponentes negativos', ask: 'Escribe como una sola potencia', pasos: [
      'Producto: se suman con su signo, (' + MENOS + m + ') + (' + MENOS + n + ') = ' + num(r) + '.',
      'Queda <b>' + potH(b, r) + '</b>.'] });
  }

  function leyesNegX() {
    var a, b, c, r;
    do { a = rint(2, 6); b = rint(2, 8); c = rint(2, 6); r = -a + b + c; } while (r === 0 || r === -a + b - c);
    var enun = fracH(xH(-a) + ' · ' + xH(b), xH(-c));
    return armar(enun, mono(1, r), [
      { val: mono(1, -a + b - c), fija: true, err: 'Al dividir se resta el exponente de abajo, que es negativo: ' + num(-a + b) + ' − (' +
        MENOS + c + ') = ' + num(-a + b) + ' + ' + c + ' = ' + num(r) + '.' },
      { val: mono(1, a + b + c), err: 'El primer exponente es negativo: (' + MENOS + a + ') + ' + b + ' = ' + num(b - a) + '. Al final queda ' +
        num(r) + '.' },
      { val: mono(1, -a * b + c), err: 'En el producto los exponentes se suman: (' + MENOS + a + ') + ' + b + ', no (' + MENOS + a + ') × ' + b + '.' },
      { val: mono(1, -r), err: 'Revisa los signos: (' + MENOS + a + ') + ' + b + ' − (' + MENOS + c + ') = ' + num(r) + '.' },
      { val: mono(1, b - a), err: 'Te faltó dividir entre ' + xH(-c) + ': se resta su exponente, ' + num(b - a) + ' − (' + MENOS + c + ') = ' +
        num(r) + '.' }
    ], { tema: 'Leyes con exponentes negativos', ask: 'Simplifica', pasos: [
      'Producto: (' + MENOS + a + ') + ' + b + ' = ' + num(b - a) + '.',
      'Cociente: ' + num(b - a) + ' − (' + MENOS + c + ') = ' + num(b - a) + ' + ' + c + ' = ' + num(r) + '.',
      'Queda <b>' + xH(r) + '</b>.'] });
  }

  function sumaNeg() {
    var a, b;
    if (moneda()) {
      a = rint(2, 6); b = rint(2, 7);
      if (a === b) b = a + 1;
      return armar(potH(a, -1) + ' + ' + potH(b, -1), numero(a + b, a * b), [
        { val: numero(1, a + b), fija: true, err: 'No se juntan las bases: primero cada recíproco, ' + fracH(1, a) + ' + ' + fracH(1, b) +
          ', y luego la suma de fracciones.' },
        { val: numero(-(a + b)), err: 'El exponente negativo no vuelve negativo: da recíprocos, ' + fracH(1, a) + ' + ' + fracH(1, b) + '.' },
        { val: sinReducir(2, a + b), err: 'Sumaste numeradores y denominadores: ' + fracH(1, a) + ' + ' + fracH(1, b) + ' se suma con común ' +
          'denominador, ' + fracH(b, a * b) + ' + ' + fracH(a, a * b) + '.' },
        { val: numero(1, a * b), err: 'Multiplicaste las fracciones; es una suma: ' + fracH(b, a * b) + ' + ' + fracH(a, a * b) + ' = ' +
          numero(a + b, a * b).h + '.' }
      ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: [
        potH(a, -1) + ' + ' + potH(b, -1) + ' = ' + fracH(1, a) + ' + ' + fracH(1, b) + '.',
        'Común denominador ' + (a * b) + ': ' + fracH(b, a * b) + ' + ' + fracH(a, a * b) + ' = <b>' + numero(a + b, a * b).h + '</b>.'] });
    }
    b = azar([2, 3, 4, 5]);
    var b2 = b * b;
    return armar(potH(b, -1) + ' + ' + potH(b, -2), numero(b + 1, b2), [
      { val: numero(1, b * b2), fija: true, err: 'Sumaste los exponentes; eso es al multiplicar. Aquí es una suma: ' + fracH(1, b) + ' + ' +
        fracH(1, b2) + '.' },
      { val: sinReducir(2, b + b2), err: 'Sumaste numeradores y denominadores. Con común denominador ' + b2 + ': ' + fracH(b, b2) + ' + ' +
        fracH(1, b2) + ' = ' + numero(b + 1, b2).h + '.' },
      { val: numero(-(b + b2)), err: 'El exponente negativo no vuelve negativo: da recíprocos, ' + fracH(1, b) + ' + ' + fracH(1, b2) + '.' },
      { val: numero(1, b2 * b2), err: 'Multiplicaste las fracciones; es una suma: ' + fracH(b, b2) + ' + ' + fracH(1, b2) + ' = ' +
        numero(b + 1, b2).h + '.' }
    ], { tema: 'Exponente negativo', ask: 'Calcula', pasos: [
      potH(b, -1) + ' + ' + potH(b, -2) + ' = ' + fracH(1, b) + ' + ' + fracH(1, b2) + '.',
      'Común denominador ' + b2 + ': ' + fracH(b, b2) + ' + ' + fracH(1, b2) + ' = <b>' + numero(b + 1, b2).h + '</b>.'] });
  }

  function potenciaNeg() {
    var m = rint(2, 5), n = rint(2, 4), forma = azar(['adentro', 'afuera', 'los-dos']);
    if (m === n) m = n + 1;
    var e1 = forma === 'afuera' ? m : -m, e2 = forma === 'adentro' ? n : -n, p = e1 * e2;
    return armar('(' + xH(e1) + ')' + sup(e2), mono(1, p), [
      { val: mono(1, e1 + e2), fija: true, err: 'Sumaste los exponentes. En una potencia de potencia se multiplican: ' + par(e1) + ' × ' +
        par(e2) + ' = ' + num(p) + '.' },
      { val: mono(1, -p), err: 'Revisa el signo del producto: ' + par(e1) + ' × ' + par(e2) + ' = ' + num(p) + '.' },
      { val: mono(1, e1 - e2), err: 'Restaste los exponentes. En una potencia de potencia se multiplican: ' + par(e1) + ' × ' + par(e2) + ' = ' +
        num(p) + '.' }
    ], { tema: 'Leyes con exponentes negativos', ask: 'Simplifica', pasos: [
      'Potencia de potencia: se multiplican con la regla de los signos, ' + par(e1) + ' × ' + par(e2) + ' = ' + num(p) + '.',
      'Queda <b>' + xH(p) + '</b>.'] });
  }

  function genCeroNeg(nivel) {
    if (nivel === 1) return azar([cero, ceroConOtros, negUno, function () { return neg(1); }])();
    if (nivel === 2) return azar([function () { return neg(2); }, function () { return negFraccion(2); }, negX, leyesNegNum])();
    return azar([leyesNegX, function () { return negFraccion(3); }, sumaNeg, potenciaNeg])();
  }

  /* ═══════════════════ Potencias de 10 ═══════════════════ */

  function diezNumero(nivel) {
    var n = rint(2, nivel === 1 ? 6 : 8);
    return armar(potH(10, n), valorDiez(n), [
      { val: numero(10 * n), fija: true, err: 'Multiplicaste 10 × ' + n + '. ' + potH(10, n) + ' es el 10 multiplicado por sí mismo ' +
        VECES[n] + ': un 1 seguido de ' + n + ' ceros.' },
      { val: valorDiez(n - 1), err: 'Te faltó un cero: ' + potH(10, n) + ' lleva ' + n + ' ceros, uno por cada factor 10.' },
      { val: valorDiez(n + 1), err: 'Te sobró un cero: ' + potH(10, n) + ' lleva ' + n + ' ceros, no ' + (n + 1) + '.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como número', pasos: [
      'Cada factor 10 agrega un cero: ' + n + ' factores, ' + n + ' ceros.',
      potH(10, n) + ' = <b>' + valorDiez(n).h + '</b>.'] });
  }

  function diezPotencia() {
    var n = rint(2, 7);
    return armar(valorDiez(n).h, pw(10, n), [
      { val: pw(10, n + 1), fija: true, err: 'Contaste todas las cifras, también el 1: el exponente cuenta sólo los ceros, que son ' + n + '.' },
      { val: pw(10, n - 1), err: 'Te faltó un cero: ' + valorDiez(n).h + ' tiene ' + n + ' ceros.' },
      { val: pw(10, -n), err: 'El exponente negativo es para números menores que 1, y ' + valorDiez(n).h + ' es mayor que 1.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como potencia de 10', pasos: [
      'Cuenta los ceros después del 1: son ' + n + '.',
      valorDiez(n).h + ' = <b>' + potH(10, n) + '</b>.'] });
  }

  function diezDecimal(nivel) {
    var n = rint(1, nivel === 1 ? 4 : 6);
    var falsas = [
      { val: numero(-pow(10, n)), fija: true, err: 'El exponente negativo no da un número negativo: ' + potH(10, -n) + ' = ' +
        fracH(1, valorDiez(n).h) + ', un número chico y positivo.' },
      { val: valorDiez(-n - 1), err: 'Escribiste ' + n + (n === 1 ? ' cero' : ' ceros') + ' después del punto: el 1 va en el lugar ' + n +
        ', así que entre el punto y el 1 caben ' + (n - 1) + '.' },
      { val: numero(-10 * n), err: 'Multiplicaste 10 × (' + MENOS + n + '). ' + potH(10, -n) + ' es «uno entre» ' + potH(10, n) + ': ' +
        valorDiez(-n).h + '.' }
    ];
    if (n >= 2) falsas.push({ val: valorDiez(-n + 1), err: 'Te faltó un lugar: el 1 va en el lugar ' + n + ' después del punto, ' +
      valorDiez(-n).h + '.' });
    else falsas.push({ val: numero(10), err: 'El signo del exponente sí cuenta: ' + potH(10, 1) + ' = 10, pero ' + potH(10, -1) + ' = ' +
      fracH(1, 10) + ' = 0.1.' });
    return armar(potH(10, -n), valorDiez(-n), falsas, { tema: 'Potencias de 10', ask: 'Escribe como número', pasos: [
      potH(10, -n) + ' = ' + fracH(1, potH(10, n)) + ' = ' + fracH(1, valorDiez(n).h) + '.',
      'El 1 queda en el lugar ' + n + ' después del punto: <b>' + valorDiez(-n).h + '</b>.'] });
  }

  function decimalPotencia() {
    var n = rint(2, 6);
    return armar(valorDiez(-n).h, pw(10, -n), [
      { val: pw(10, n), fija: true, err: valorDiez(-n).h + ' es menor que 1: el exponente es negativo, ' + MENOS + n + '.' },
      { val: pw(10, -(n + 1)), err: 'Contaste también el cero de antes del punto. Se cuentan los lugares después del punto hasta el 1: son ' +
        n + '.' },
      { val: pw(10, -(n - 1)), err: 'Contaste sólo los ceros entre el punto y el 1. El 1 está en el lugar ' + n + ': ' + potH(10, -n) + '.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como potencia de 10', pasos: [
      'El 1 está en el lugar ' + n + ' después del punto.',
      valorDiez(-n).h + ' = ' + fracH(1, valorDiez(n).h) + ' = <b>' + potH(10, -n) + '</b>.'] });
  }

  function nz(a, b) { var x; do { x = rint(a, b); } while (x === 0); return x; }

  function diezProducto() {
    var a, b;
    do { a = nz(-6, 9); b = nz(-9, 6); } while (!(a < 0 || b < 0) || a + b === 0 || a === b || a * b === a + b);
    var r = a + b;
    return armar(potH(10, a) + ' · ' + potH(10, b), pw(10, r), [
      { val: pw(10, a * b), fija: true, err: 'Multiplicaste los exponentes. Al multiplicar potencias de 10 se suman: ' + num(a) + ' + ' + par(b) +
        ' = ' + num(r) + '.' },
      { val: pw(10, a - b), err: 'Restaste. Al multiplicar se suman: ' + num(a) + ' + ' + par(b) + ' = ' + num(r) + '.' },
      { val: pw(10, -r), err: 'Revisa los signos: ' + num(a) + ' + ' + par(b) + ' = ' + num(r) + '.' },
      { val: pw(100, r), err: 'La base no se multiplica: el resultado sigue siendo una potencia de 10. Sólo se suman los exponentes.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como una sola potencia', pasos: [
      'Producto: se suman los exponentes con su signo, ' + num(a) + ' + ' + par(b) + ' = ' + num(r) + '.',
      'Queda <b>' + potH(10, r) + '</b>.'] });
  }

  function diezCociente() {
    var a, b;
    do { a = nz(-6, 9); b = nz(-7, 7); } while (a === b || a + b === a - b || (b > 0 && Math.random() < 0.6) || a * b === a - b);
    var r = a - b;
    return armar(potH(10, a) + ' ÷ ' + potH(10, b), pw(10, r), [
      { val: pw(10, a + b), fija: true, err: b < 0
        ? 'Restar un negativo es sumar: ' + num(a) + ' − ' + par(b) + ' = ' + num(a) + ' + ' + (-b) + ' = ' + num(r) + '.'
        : 'Al dividir se restan los exponentes: ' + num(a) + ' − ' + b + ' = ' + num(r) + '.' },
      { val: pw(10, b - a), err: 'Restaste al revés: es el de arriba menos el de abajo, ' + num(a) + ' − ' + par(b) + ' = ' + num(r) + '.' },
      { val: pw(10, a * b), err: 'Multiplicaste los exponentes. Al dividir se restan: ' + num(a) + ' − ' + par(b) + ' = ' + num(r) + '.' },
      { val: pw(1, r), err: 'Dividiste las bases, 10 ÷ 10 = 1. La base se queda en 10; sólo se restan los exponentes.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como una sola potencia', pasos: [
      'Cociente: se resta el exponente de abajo, ' + num(a) + ' − ' + par(b) + ' = ' + num(r) + '.',
      'Queda <b>' + potH(10, r) + '</b>.'] });
  }

  function diezPotPot(nivel) {
    var a, b;
    do { a = nz(-5, 6); b = nivel === 3 ? nz(-4, 4) : rint(2, 4); } while (Math.abs(a) < 2 || Math.abs(b) < 2 || a === b || (nivel === 3 && a > 0 && b > 0));
    var r = a * b;
    var falsas = [
      { val: pw(10, a + b), fija: true, err: 'Sumaste los exponentes. En una potencia de potencia se multiplican: ' + par(a) + ' × ' + par(b) +
        ' = ' + num(r) + '.' },
      { val: pw(10, -r), err: 'Revisa el signo del producto: ' + par(a) + ' × ' + par(b) + ' = ' + num(r) + '.' }
    ];
    if (b > 0) falsas.push({ val: { k: 'c:' + b + ':' + a, h: b + ' × ' + potH(10, a) }, err: 'Multiplicaste por ' + b + '. Elevar a la ' +
      b + ' es multiplicar ' + potH(10, a) + ' por sí mismo ' + VECES[b] + ': ' + potH(10, r) + '.' });
    falsas.push({ val: pw(10, a - b), err: 'Restaste los exponentes. En una potencia de potencia se multiplican: ' + par(a) + ' × ' + par(b) +
      ' = ' + num(r) + '.' });
    if (r < 0) falsas.push({ val: { k: 'neg:10^' + (-r), h: MENOS + potH(10, -r) }, err: 'El exponente negativo no vuelve negativo el ' +
      'resultado: ' + potH(10, r) + ' = ' + fracH(1, potH(10, -r)) + ', un número chico y positivo.' });
    else if (a < 0 || b < 0) falsas.push({ val: { k: 'neg:10^' + r, h: MENOS + potH(10, r) }, err: 'Una potencia de 10 nunca es negativa: ' +
      par(a) + ' × ' + par(b) + ' = ' + num(r) + ', así que queda ' + potH(10, r) + '.' });
    return armar('(' + potH(10, a) + ')' + sup(b), pw(10, r), falsas, { tema: 'Potencias de 10', ask: 'Escribe como una sola potencia',
      pasos: ['Potencia de potencia: se multiplican, ' + par(a) + ' × ' + par(b) + ' = ' + num(r) + '.', 'Queda <b>' + potH(10, r) + '</b>.'] });
  }

  // Números de verdad: 1,000 × 0.01. Se pasan a potencias de 10 y se suman los exponentes.
  function diezNumeros(nivel) {
    var a, b, r, enun, pasos;
    if (nivel < 3 || moneda()) {
      do { a = rint(2, 5); b = -rint(1, 4); r = a + b; } while (r === 0);
      enun = valorDiez(a).h + ' × ' + valorDiez(b).h;
      pasos = [valorDiez(a).h + ' = ' + potH(10, a) + ' y ' + valorDiez(b).h + ' = ' + potH(10, b) + '.',
        potH(10, a) + ' · ' + potH(10, b) + ' = ' + potH(10, r) + ' = <b>' + valorDiez(r).h + '</b>.'];
      return armar(enun, valorDiez(r), [
        { val: valorDiez(a - b), fija: true, err: valorDiez(b).h + ' es ' + potH(10, b) + ': su exponente es negativo. Se suman con su signo, ' +
          a + ' + ' + par(b) + ' = ' + num(r) + ': ' + valorDiez(r).h + '.' },
        { val: valorDiez(r + 1), err: 'Te sobró un cero: ' + potH(10, a) + ' · ' + potH(10, b) + ' = ' + potH(10, r) + ' = ' + valorDiez(r).h + '.' },
        { val: valorDiez(r - 1), err: 'Te faltó un cero: ' + potH(10, a) + ' · ' + potH(10, b) + ' = ' + potH(10, r) + ' = ' + valorDiez(r).h + '.' }
      ], { tema: 'Potencias de 10', ask: 'Calcula', pasos: pasos });
    }
    // Un decimal entre un número grande: 0.001 ÷ 100.
    do { a = -rint(1, 4); b = rint(2, 4); r = a - b; } while (r < -7);
    enun = valorDiez(a).h + ' ÷ ' + valorDiez(b).h;
    return armar(enun, pw(10, r), [
      { val: pw(10, a + b), fija: true, err: 'Al dividir se restan los exponentes: ' + num(a) + ' − ' + b + ' = ' + num(r) + '.' },
      { val: pw(10, b - a), err: 'Restaste al revés: arriba menos abajo, ' + num(a) + ' − ' + b + ' = ' + num(r) + '.' },
      { val: pw(10, -a - b), err: valorDiez(a).h + ' es ' + potH(10, a) + ', con exponente negativo: ' + num(a) + ' − ' + b + ' = ' + num(r) + '.' },
      { val: pw(10, r + 1), err: 'Contaste mal un lugar: ' + num(a) + ' − ' + b + ' = ' + num(r) + '.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como potencia de 10', pasos: [
      valorDiez(a).h + ' = ' + potH(10, a) + ' y ' + valorDiez(b).h + ' = ' + potH(10, b) + '.',
      'Cociente: ' + num(a) + ' − ' + b + ' = ' + num(r) + ', <b>' + potH(10, r) + '</b>.'] });
  }

  function diezCombinada() {
    var a, b, c, r;
    // Se piden al menos tres errores distintos entre sí y de la respuesta.
    function distintos() {
      var vistos = {}, cuenta = 0;
      [a + b + c, Math.abs(a * b - c) <= 24 ? a * b - c : r, -r, a + b, a - b - c].forEach(function (e) {
        if (e !== r && !vistos[e]) { vistos[e] = true; cuenta++; }
      });
      return cuenta;
    }
    do { a = nz(-6, 8); b = nz(-6, 8); c = nz(-6, 8); r = a + b - c; }
    while (r === 0 || Math.abs(r) > 12 || a + b === 0 || !(a < 0 || b < 0 || c < 0) || distintos() < 3);
    return armar(fracH(potH(10, a) + ' · ' + potH(10, b), potH(10, c)), pw(10, r), [
      { val: pw(10, a + b + c), fija: true, err: 'Al dividir se resta el exponente de abajo: ' + num(a + b) + ' − ' + par(c) + ' = ' + num(r) + '.' },
      Math.abs(a * b - c) <= 24 ? { val: pw(10, a * b - c), err: 'En el producto los exponentes se suman: ' + num(a) + ' + ' + par(b) + ' = ' +
        num(a + b) + ', no se multiplican.' } : null,
      { val: pw(10, -r), err: 'Revisa los signos: ' + num(a) + ' + ' + par(b) + ' − ' + par(c) + ' = ' + num(r) + '.' },
      { val: pw(10, a + b), err: 'Te faltó dividir entre ' + potH(10, c) + ': se resta su exponente, ' + num(a + b) + ' − ' + par(c) + ' = ' +
        num(r) + '.' },
      { val: pw(10, a - b - c), err: 'En el producto los exponentes se suman, no se restan: ' + num(a) + ' + ' + par(b) + ' = ' + num(a + b) +
        '. Luego ' + num(a + b) + ' − ' + par(c) + ' = ' + num(r) + '.' }
    ], { tema: 'Potencias de 10', ask: 'Escribe como una sola potencia', pasos: [
      'Arriba: ' + num(a) + ' + ' + par(b) + ' = ' + num(a + b) + '.',
      'Entre el de abajo: ' + num(a + b) + ' − ' + par(c) + ' = ' + num(r) + ', <b>' + potH(10, r) + '</b>.'] });
  }

  function diezVeces() {
    var a, b;
    do { a = nz(-9, 9); b = nz(-9, 9); } while (a - b < 2 || a - b > 9 || a + b === a - b || a * b === a - b);
    var d = a - b;
    return armar('¿Cuántas veces es mayor ' + potH(10, a) + ' que ' + potH(10, b) + '?', pw(10, d), [
      { val: numero(d), fija: true, err: 'La diferencia de exponentes es ' + d + ', pero cada unidad es un factor 10: ' + potH(10, d) + ' = ' +
        valorDiez(d).h + ' veces.' },
      { val: pw(10, a + b), err: 'Para comparar se divide: ' + potH(10, a) + ' ÷ ' + potH(10, b) + ' = 10' + sup(num(a) + ' − ' + par(b)) +
        ' = ' + potH(10, d) + '.' },
      { val: pw(10, b - a), err: 'Al revés: el mayor entre el menor, ' + num(a) + ' − ' + par(b) + ' = ' + d + '.' },
      { val: pw(10, a * b), err: 'Multiplicaste los exponentes. Para comparar se divide y se restan: ' + num(a) + ' − ' + par(b) + ' = ' + d + '.' }
    ], { tema: 'Potencias de 10', ask: 'Elige la correcta', texto: true, pasos: [
      'Se divide el mayor entre el menor: ' + num(a) + ' − ' + par(b) + ' = ' + d + '.',
      'Es <b>' + potH(10, d) + '</b> = ' + valorDiez(d).h + ' veces mayor.'] });
  }

  function genDiez(nivel) {
    if (nivel === 1) return azar([function () { return diezNumero(1); }, diezPotencia, function () { return diezDecimal(1); }, decimalPotencia])();
    if (nivel === 2) return azar([diezProducto, diezCociente, function () { return diezPotPot(2); }, function () { return diezNumeros(2); }])();
    return azar([diezCombinada, diezVeces, function () { return diezPotPot(3); }, function () { return diezNumeros(3); }])();
  }

  /* ═══════════════════ Radicales ═══════════════════ */

  function cuadrada() {
    var n = azar([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 20]), sq = n * n;
    var porque = '√' + num(sq) + ' pide el número que, multiplicado por sí mismo, da ' + num(sq) + '.';
    return armar('√' + num(sq), numero(n), [
      sq % 2 === 0 && sq / 2 !== n ? { val: numero(sq / 2), fija: true, err: 'La raíz no es la mitad. ' + porque + ' ' + n + ' × ' + n + ' = ' +
        num(sq) + '.' } : null,
      { val: numero(n + 1), err: 'Casi: ' + (n + 1) + ' × ' + (n + 1) + ' = ' + num((n + 1) * (n + 1)) + ', no ' + num(sq) + '.' },
      { val: numero(n - 1), err: 'Casi: ' + (n - 1) + ' × ' + (n - 1) + ' = ' + num((n - 1) * (n - 1)) + ', no ' + num(sq) + '.' },
      { val: numero(-n), err: 'El símbolo √ pide la raíz positiva. Es cierto que (' + MENOS + n + ')' + sup(2) + ' también da ' + num(sq) +
        ', pero √' + num(sq) + ' = ' + n + '.' }
    ], { tema: 'Raíz cuadrada', ask: 'Calcula', pasos: [porque, n + ' × ' + n + ' = ' + num(sq) + ': <b>' + n + '</b>.'] });
  }

  function cubica() {
    var n = azar([2, 3, 4, 5, 6, 10]), c = n * n * n;
    var porque = '∛' + num(c) + ' pide el número que, multiplicado tres veces por sí mismo, da ' + num(c) + '.';
    return armar('∛' + num(c), numero(n), [
      c % 3 === 0 ? { val: numero(c / 3), fija: true, err: 'La raíz cúbica no es la tercera parte. ' + porque + ' ' + factores(n, 3) + ' = ' +
        num(c) + '.' } : null,
      esCuadrado(c) ? { val: numero(Math.sqrt(c)), err: 'Ésa es la raíz cuadrada: ' + Math.sqrt(c) + ' × ' + Math.sqrt(c) + ' = ' + num(c) +
        '. La cúbica pide tres factores iguales: ' + factores(n, 3) + '.' } : null,
      c % 2 === 0 ? { val: numero(c / 2), err: 'La raíz no es la mitad. ' + porque + ' ' + factores(n, 3) + ' = ' + num(c) + '.' } : null,
      { val: numero(n * n), err: num(n * n) + ' × ' + n + ' = ' + num(c) + ', pero el ' + num(n * n) + ' no se repite tres veces. ' +
        factores(n, 3) + ' = ' + num(c) + '.' },
      { val: numero(n + 1), err: 'Casi: ' + factores(n + 1, 3) + ' = ' + num(pow(n + 1, 3)) + ', no ' + num(c) + '.' },
      { val: numero(n - 1), err: 'Casi: ' + factores(n - 1, 3) + ' = ' + num(pow(n - 1, 3)) + ', no ' + num(c) + '.' }
    ], { tema: 'Raíz cúbica', ask: 'Calcula', pasos: [porque, factores(n, 3) + ' = ' + num(c) + ': <b>' + n + '</b>.'] });
  }

  var CUADRADOS = [4, 9, 16, 25, 36, 49, 64, 81, 100];
  function productoRaiz() {
    var a, b;
    do { a = azar(CUADRADOS); b = azar(CUADRADOS); } while (a === b || a * b > 3600 || EN_TAREA[plano('√(' + a + ' × ' + b + ')')]);
    var ra = Math.sqrt(a), rb = Math.sqrt(b), r = ra * rb;
    return armar('√(' + a + ' × ' + b + ')', numero(r), [
      { val: numero(ra + rb), fija: true, err: 'La raíz de un producto es el producto de las raíces: √' + a + ' × √' + b + ' = ' + ra + ' × ' + rb +
        ' = ' + r + '. Se multiplican, no se suman.' },
      { val: numero(ra * b), err: 'Sacaste la raíz sólo del ' + a + '. También la del ' + b + ': √' + b + ' = ' + rb + ', y ' + ra + ' × ' + rb +
        ' = ' + r + '.' },
      { val: numero(a * rb), err: 'Sacaste la raíz sólo del ' + b + '. También la del ' + a + ': √' + a + ' = ' + ra + ', y ' + ra + ' × ' + rb +
        ' = ' + r + '.' },
      (a * b) % 2 === 0 ? { val: numero(a * b / 2), err: 'La raíz no es la mitad: √' + num(a * b) + ' es el número que al cuadrado da ' +
        num(a * b) + ', ' + r + '.' } : null
    ], { tema: 'Raíz de un producto', ask: 'Calcula', pasos: ['La raíz de un producto es el producto de las raíces: √' + a + ' × √' + b + '.',
      ra + ' × ' + rb + ' = <b>' + r + '</b>.'] });
  }

  // √(k²·m) = k√m, con m sin cuadrados.
  var SIMPLIFICAR = [[2, 2], [3, 2], [2, 5], [2, 6], [3, 3], [2, 7], [4, 2], [4, 3], [5, 2], [3, 6], [3, 7], [4, 5], [6, 2], [5, 3],
    [7, 2], [6, 3], [5, 5], [7, 3], [5, 6], [10, 3], [4, 7], [8, 2], [6, 5], [9, 2], [2, 10], [3, 10]];
  function simplificar() {
    var par0, k, m, N;
    do { par0 = azar(SIMPLIFICAR); k = par0[0]; m = par0[1]; N = k * k * m; } while (EN_TAREA[plano('√' + N)]);
    var k2 = k * k;
    // Un factor que no es cuadrado y que alguien saca de la raíz como si lo fuera: √50 = √(5 × 10) → 5√10.
    var malos = [];
    for (var p = 2; p < N; p++) {
      if (N % p === 0 && !esCuadrado(p) && !esCuadrado(N / p) && !(p === k && N / p === m)) malos.push(p);
    }
    var falsas = [
      { val: rad(k2, m), fija: true, err: 'Sacaste el ' + k2 + ' de la raíz sin sacarle su raíz: √' + k2 + ' = ' + k + ', así que queda ' + k +
        '√' + m + '.' },
      { val: { k: 'rr:' + m + ':' + k2, h: m + '√' + k2 }, err: 'Al revés: sale la raíz del cuadrado perfecto, √' + k2 + ' = ' + k +
        ', y el ' + m + ' se queda adentro: ' + k + '√' + m + '.' },
      { val: { k: 'rs:' + k + ':' + m, h: k + ' + √' + m }, err: '√(' + k2 + ' × ' + m + ') es √' + k2 + ' × √' + m + ': se multiplica, no se ' +
        'suma. Queda ' + k + '√' + m + '.' }
    ];
    if (malos.length) {
      var q = azar(malos);
      falsas.push({ val: rad(q, N / q), err: 'Sacaste el ' + q + ' como si √' + q + ' fuera ' + q + ': sólo sale de la raíz lo que es ' +
        'cuadrado perfecto (4, 9, 16, 25…). ' + N + ' = ' + k2 + ' × ' + m + ', y √' + k2 + ' = ' + k + '.' });
    }
    return armar('√' + N, rad(k, m), falsas, { tema: 'Simplificar radicales', ask: 'Simplifica', pasos: [
      'El cuadrado perfecto más grande que divide a ' + N + ' es ' + k2 + ': ' + N + ' = ' + k2 + ' × ' + m + '.',
      '√' + N + ' = √' + k2 + ' × √' + m + ' = <b>' + k + '√' + m + '</b>.'] });
  }

  var PRODUCTOS = [[2, 8], [2, 18], [2, 32], [2, 50], [3, 12], [5, 20], [6, 24], [7, 28], [8, 18], [2, 72], [3, 48], [10, 40], [5, 80]];
  function productoRaices() {
    var p = azar(PRODUCTOS), a = p[0], b = p[1];
    if (moneda()) { a = p[1]; b = p[0]; }
    var P = a * b, n = Math.round(Math.sqrt(P)), s = a + b;
    return armar('√' + a + ' × √' + b, numero(n), [
      { val: esCuadrado(s) ? numero(Math.sqrt(s)) : rad(1, s), fija: true, err: 'Lo de adentro se multiplica, no se suma: √' + a + ' × √' + b +
        ' = √(' + a + ' × ' + b + ') = √' + P + ' = ' + n + '.' },
      { val: numero(P), err: 'Juntaste bien, √(' + a + ' × ' + b + ') = √' + P + ', pero falta sacar la raíz: √' + P + ' = ' + n + '.' },
      { val: numero(P / 2), err: 'La raíz de ' + P + ' no es la mitad: es el número que al cuadrado da ' + P + ', ' + n + '.' }
    ], { tema: 'Producto de radicales', ask: 'Calcula', pasos: ['Se juntan en una sola raíz: √' + a + ' × √' + b + ' = √' + P + '.',
      n + ' × ' + n + ' = ' + P + ': <b>' + n + '</b>.'] });
  }

  var FRAC_RAIZ = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [4, 7], [3, 7], [6, 7], [5, 8], [3, 8], [7, 8], [2, 9], [4, 9], [7, 10], [3, 10]];
  function fraccionRaiz() {
    var f = azar(FRAC_RAIZ), a = f[0], b = f[1], a2 = a * a, b2 = b * b;
    return armar('√(' + fracH(a2, b2) + ')', numero(a, b), [
      { val: numero(a, b2), fija: true, err: 'La raíz se saca arriba y abajo: √' + a2 + ' = ' + a + ' y √' + b2 + ' = ' + b + '.' },
      { val: numero(a2, b), err: 'Sacaste la raíz sólo abajo: arriba también, √' + a2 + ' = ' + a + '.' },
      { val: numero(a2, b2), err: 'Falta sacar la raíz: √' + a2 + ' = ' + a + ' y √' + b2 + ' = ' + b + '.' }
    ], { tema: 'Raíz de una fracción', ask: 'Calcula', pasos: ['Arriba y abajo: √' + a2 + ' = ' + a + ' y √' + b2 + ' = ' + b + '.',
      'Queda <b>' + fracH(a, b) + '</b>.'] });
  }

  function cubicaNeg() {
    var n = azar([2, 3, 4, 5, 10]), c = n * n * n;
    return armar('∛(' + MENOS + num(c) + ')', numero(-n), [
      { val: numero(n), fija: true, err: 'La cúbica de un negativo es negativa: ' + factores(-n, 3) + ' = ' + num(-c) + '. Tres negativos dan negativo.' },
      { val: texto('No existe'), err: 'Sí existe: ' + factores(-n, 3) + ' = ' + num(-c) + '. La que no existe con números reales es la raíz ' +
        'cuadrada de un negativo.' },
      { val: numero(-n * n), err: num(n * n) + ' × ' + n + ' = ' + num(c) + ', pero el ' + num(n * n) + ' no se repite tres veces: ' +
        factores(-n, 3) + ' = ' + num(-c) + '.' },
      { val: numero(-n - 1), err: 'Casi: ' + factores(-n - 1, 3) + ' = ' + num(-pow(n + 1, 3)) + ', no ' + num(-c) + '.' }
    ], { tema: 'Raíz cúbica', ask: 'Calcula', pasos: ['Tres factores negativos dan negativo: ' + factores(-n, 3) + ' = ' + num(-c) + '.',
      '∛(' + MENOS + num(c) + ') = <b>' + num(-n) + '</b>.'] });
  }

  var FRAC_EXP = [[9, 2], [16, 2], [25, 2], [49, 2], [64, 2], [81, 2], [100, 2], [144, 2], [8, 3], [27, 3], [64, 3], [125, 3],
    [1000, 3], [16, 4], [81, 4], [32, 5]];
  function exponenteFraccion() {
    var f, a, n;
    do { f = azar(FRAC_EXP); a = f[0]; n = f[1]; } while (EN_TAREA[plano(num(a) + sup('1/' + n))]);
    var r = Math.round(Math.pow(a, 1 / n));
    var grande = pow(a, n) <= 10000000;
    return armar(num(a) + sup('1/' + n), numero(r), [
      { val: numero(a, n), fija: true, err: 'El exponente 1/' + n + ' no multiplica a la base: pide la ' + NOMBRE_RAIZ[n] + ', ' + raizH(n) +
        num(a) + ' = ' + r + ', porque ' + factores(r, n) + ' = ' + num(a) + '.' },
      { val: numero(1, r), err: 'El exponente es positivo: no da un recíproco. ' + num(a) + sup('1/' + n) + ' = ' + raizH(n) + num(a) + ' = ' + r + '.' },
      { val: grande ? numero(pow(a, n)) : pw(a, n), err: 'El 1/' + n + ' no es «a la ' + n + '»: es la ' + NOMBRE_RAIZ[n] + ', ' + raizH(n) +
        num(a) + ' = ' + r + '.' }
    ], { tema: 'Exponente fraccionario', ask: 'Calcula', pasos: [
      'El exponente 1/' + n + ' es la ' + NOMBRE_RAIZ[n] + ': ' + num(a) + sup('1/' + n) + ' = ' + raizH(n) + num(a) + '.',
      factores(r, n) + ' = ' + num(a) + ': <b>' + r + '</b>.'] });
  }

  // aᵐᐟⁿ = (ⁿ√a)ᵐ: el de abajo es la raíz y el de arriba, la potencia.
  var FRAC_EXP_M = [[8, 2, 3], [64, 2, 3], [125, 2, 3], [1000, 2, 3], [81, 3, 4], [4, 3, 2], [9, 3, 2], [25, 3, 2], [16, 3, 2], [32, 2, 5],
    [32, 3, 5], [100, 3, 2], [16, 5, 4], [36, 3, 2], [4, 5, 2]];
  function exponenteFraccionM() {
    var f, a, m, n;
    do { f = azar(FRAC_EXP_M); a = f[0]; m = f[1]; n = f[2]; } while (EN_TAREA[plano(num(a) + sup(m + '/' + n))]);
    var raiz = Math.round(Math.pow(a, 1 / n)), r = pow(raiz, m), am = pow(a, m);
    var falsas = [
      { val: numero(raiz), fija: true, err: 'Sacaste la raíz pero te faltó elevar: ' + num(a) + sup(m + '/' + n) + ' = (' + raizH(n) + num(a) + ')' +
        sup(m) + ' = ' + raiz + sup(m) + ' = ' + num(r) + '.' },
      { val: am <= 10000000 ? numero(am) : pw(a, m), err: 'Elevaste a la ' + m + ' pero te faltó la raíz: el ' + n + ' de abajo pide la ' +
        NOMBRE_RAIZ[n] + '. (' + raizH(n) + num(a) + ')' + sup(m) + ' = ' + num(r) + '.' },
      { val: numero(a * m, n), err: 'El exponente no multiplica a la base: el de abajo (' + n + ') es la raíz y el de arriba (' + m + '), la ' +
        'potencia. (' + raizH(n) + num(a) + ')' + sup(m) + ' = ' + num(r) + '.' }
    ];
    var otra = Math.round(Math.pow(a, 1 / m));
    if (pow(otra, m) === a) falsas.push({ val: numero(pow(otra, n)), err: 'Volteaste los papeles: el de abajo, ' + n + ', es la raíz, y el de ' +
      'arriba, ' + m + ', la potencia. (' + raizH(n) + num(a) + ')' + sup(m) + ' = ' + num(r) + '.' });
    return armar(num(a) + sup(m + '/' + n), numero(r), falsas, { tema: 'Exponente fraccionario', ask: 'Calcula', pasos: [
      'El ' + n + ' de abajo es la raíz: ' + raizH(n) + num(a) + ' = ' + raiz + '.',
      'El ' + m + ' de arriba es la potencia: ' + raiz + sup(m) + ' = <b>' + num(r) + '</b>.'] });
  }

  function raizX() {
    var k;
    if (moneda()) {
      k = rint(3, 6);
      var e = 2 * k;
      return armar('√(' + xH(e) + ')', mono(1, k), [
        { val: mono(1, e - 2), fija: true, err: 'Le restaste 2 al exponente: la raíz cuadrada lo <strong>divide</strong> entre 2, ' + e + ' ÷ 2 = ' +
          k + '.' },
        { val: mono(1, 2 * e), err: 'Multiplicaste el exponente por 2: la raíz lo divide, ' + e + ' ÷ 2 = ' + k + '.' },
        { val: mono(k, 1), err: 'El exponente no se vuelve coeficiente: √(' + xH(e) + ') = ' + xH(k) + ', porque ' + xH(k) + ' · ' + xH(k) +
          ' = ' + xH(e) + '.' },
        e % 3 === 0 ? { val: mono(1, e / 3), err: 'Dividiste entre 3: ésa sería la raíz cúbica. La cuadrada divide el exponente entre 2.' } : null
      ], { tema: 'Raíz de una potencia', ask: 'Simplifica', pasos: ['La raíz cuadrada divide el exponente entre 2: ' + e + ' ÷ 2 = ' + k + '.',
        xH(k) + ' · ' + xH(k) + ' = ' + xH(e) + ': <b>' + xH(k) + '</b>.'] });
    }
    k = rint(2, 4);
    var t = 3 * k;
    return armar('∛(' + xH(t) + ')', mono(1, k), [
      t % 2 === 0 ? { val: mono(1, t / 2), fija: true, err: 'Dividiste entre 2: ésa es la raíz cuadrada. La cúbica divide el exponente entre 3, ' +
        t + ' ÷ 3 = ' + k + '.' } : null,
      { val: mono(1, t - 3), err: 'Le restaste 3 al exponente: la raíz cúbica lo divide entre 3, ' + t + ' ÷ 3 = ' + k + '.' },
      { val: mono(1, 3 * t), err: 'Multiplicaste el exponente por 3: la raíz lo divide, ' + t + ' ÷ 3 = ' + k + '.' },
      { val: mono(k, 1), err: 'El exponente no se vuelve coeficiente: ∛(' + xH(t) + ') = ' + xH(k) + ', porque ' + xH(k) + ' · ' + xH(k) + ' · ' +
        xH(k) + ' = ' + xH(t) + '.' }
    ], { tema: 'Raíz de una potencia', ask: 'Simplifica', pasos: ['La raíz cúbica divide el exponente entre 3: ' + t + ' ÷ 3 = ' + k + '.',
      'Queda <b>' + xH(k) + '</b>.'] });
  }

  var FRAC_EXP_NEG = [[4, 2], [9, 2], [16, 2], [25, 2], [49, 2], [64, 2], [100, 2], [8, 3], [27, 3], [64, 3], [125, 3]];
  function exponenteFraccionNeg() {
    var f = azar(FRAC_EXP_NEG), a = f[0], n = f[1], r = Math.round(Math.pow(a, 1 / n));
    var e = MENOS + '1/' + n;
    return armar(num(a) + sup(e), numero(1, r), [
      { val: numero(-r), fija: true, err: 'El menos del exponente da el recíproco, no un negativo: ' + num(a) + sup(e) + ' = ' +
        fracH(1, raizH(n) + num(a)) + ' = ' + fracH(1, r) + '.' },
      { val: numero(r), err: 'Te faltó el recíproco: el menos del exponente quiere decir «uno entre», ' + fracH(1, r) + '.' },
      { val: numero(-1, r), err: 'El recíproco de un número positivo es positivo: ' + fracH(1, r) + '.' },
      { val: numero(-a, n), err: 'El exponente no multiplica a la base: el 1/' + n + ' es la ' + NOMBRE_RAIZ[n] + ' y el menos, el recíproco. ' +
        'Queda ' + fracH(1, r) + '.' }
    ], { tema: 'Exponente fraccionario', ask: 'Calcula', pasos: [
      'El 1/' + n + ' es la ' + NOMBRE_RAIZ[n] + ': ' + raizH(n) + num(a) + ' = ' + r + '.',
      'El menos da el recíproco: <b>' + fracH(1, r) + '</b>.'] });
  }

  function genRadicales(nivel) {
    if (nivel === 1) return azar([cuadrada, cuadrada, cubica, productoRaiz])();
    if (nivel === 2) return azar([simplificar, simplificar, productoRaices, fraccionRaiz, cubicaNeg])();
    return azar([exponenteFraccion, exponenteFraccionM, exponenteFraccionM, raizX, exponenteFraccionNeg])();
  }

  /* ---------- Ninguna cuenta de la tarea sale en la práctica ni en el reto ---------- */
  // Se comparan en texto plano: 2<sup>6</sup> → 2^6, una fracción apilada → 2/3.
  function plano(html) {
    return String(html).replace(/<span class="fr__d">/g, '/').replace(/<sup>/g, '^').replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  }
  var EN_TAREA = {};
  // Las cuentas de la tarea (examenes-pdf/tarea-potencias-radicales.html), en texto plano.
  [
    '2^7', '3^4', '5^3', '1^8', '0^6', '(−2)^5', '(−4)^2', '−4^2', '(−3)^3', '9^0', '(−6)^0', '−6^0', '4·3^0', '5^−1', '3^−2',
    '(1/4)^−1', '(2/3)^−2', '(−2)^−5', 'x^4·x^5', 'a^7÷a^3', '(y^2)^5', 'm^6·m', 'x^3·x^−5', 'x^5÷x^8', '(2x)^4', '(a^−2)^3',
    '(x^2)^3·x^4', '10^5', '10^−4', '1,000,000', '0.00001', '10^−2·10^5', '10^6÷10^−2', '√121', '∛27', '∛(−125)', '√(16×25)',
    '√(25×16)', '√12', '√200', '√3×√27', '36^1/2', '27^2/3', '6^3', 'x^3·x^4', 'x^4·x^3', '√(36+64)', '√256', '20^3', '2^10',
    '10^3÷10^−3'
  ].forEach(function (t) { EN_TAREA[t] = true; });
  function sinTarea(gen) {
    return function (nivel) {
      var e = gen(nivel);
      for (var i = 0; i < 40 && EN_TAREA[plano(e.enunciado)]; i++) e = gen(nivel);
      return e;
    };
  }

  M.GENERADORES['pot-leyes'] = sinTarea(genLeyes);
  M.GENERADORES['pot-cero-neg'] = sinTarea(genCeroNeg);
  M.GENERADORES['pot-diez'] = sinTarea(genDiez);
  M.GENERADORES['radicales'] = sinTarea(genRadicales);
})();
