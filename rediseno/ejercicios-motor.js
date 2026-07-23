/* ejercicios-motor.js · Motor de generación de ejercicios (Tercial)
   Aritmética exacta (fracciones + polinomios), los generadores y el
   ensamblado de opciones. Sin DOM. Expone window.TercialMotor con un
   REGISTRO de generadores por id — el catálogo referencia esos ids. */
window.TercialMotor = (function () {
  'use strict';

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function fr(n, d) {                       // devuelve fracción reducida, d>0; null si d==0
    if (d === 0) return null;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d); return { n: n / g, d: d / g };
  }
  function ent(n) { return { n: n, d: 1 }; }
  function fadd(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return fr(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return fr(a.n * b.d, a.d * b.n); }
  function fkey(a) { return (a && a.k !== undefined) ? a.k : (a.n + '/' + a.d); }
  function feq(a, b) { return !!a && !!b && fkey(a) === fkey(b); }

  /* ═══════════════════════════════════════════════════════════════
     POLINOMIOS · coeficientes por grado: [c0, c1, c2, c3]
     Para productos notables y factorización (respuestas algebraicas),
     igual de exactas que las fracciones: todo es aritmética entera.
     ═══════════════════════════════════════════════════════════════ */
  var POT = ['', 'x', 'x²', 'x³'];
  function pTrim(A) { var B = A.slice(); while (B.length > 1 && B[B.length - 1] === 0) B.pop(); return B; }
  function pmul(A, B) {
    var C = []; for (var i = 0; i < A.length + B.length - 1; i++) C.push(0);
    for (var i2 = 0; i2 < A.length; i2++) for (var j = 0; j < B.length; j++) C[i2 + j] += A[i2] * B[j];
    return pTrim(C);
  }
  function pkey(A) { return pTrim(A).join(','); }
  function pstr(A) {
    A = pTrim(A); var s = '';
    for (var g = A.length - 1; g >= 0; g--) {
      var c = A[g]; if (c === 0) continue;
      var abs = Math.abs(c);
      var t = (g === 0) ? String(abs) : ((abs === 1 ? '' : abs) + POT[g]);
      s += (s === '') ? ((c < 0 ? MIN : '') + t) : ((c < 0 ? ' ' + MIN + ' ' : ' + ') + t);
    }
    return s === '' ? '0' : s;
  }
  /* factor lineal {a,b} = (a·x + b) */
  function facUno(f) {
    if (f.a === 1 && f.b === 0) return 'x';
    var izq = f.a === 1 ? 'x' : (f.a === -1 ? MIN + 'x' : f.a + 'x');
    if (f.b === 0) return '(' + izq + ')';
    return '(' + izq + (f.b < 0 ? ' ' + MIN + ' ' : ' + ') + Math.abs(f.b) + ')';
  }
  function facStr(F) {
    if (F.length === 2 && F[0].a === F[1].a && F[0].b === F[1].b) return facUno(F[0]) + '²';
    return F.map(facUno).join('');
  }
  function facKey(F) { return F.map(function (f) { return f.a + ',' + f.b; }).sort().join('|'); }
  function facPoly(F) { return F.reduce(function (acc, f) { return pmul(acc, [f.b, f.a]); }, [1]); }

  /* envoltorios de respuesta */
  function ansP(A) { return { k: 'p:' + pkey(A), h: pstr(A) }; }        // polinomio desarrollado
  function ansF(F) { return { k: 'f:' + facKey(F), h: facStr(F) }; }    // forma factorizada
  function sg(v) { return (v < 0 ? MIN + ' ' : '+ ') + Math.abs(v); }   // " + 3" / " − 3"

  /* render de un valor como HTML.
     Una respuesta puede ser una FRACCIÓN {n,d} o una respuesta genérica
     {k: clave para deduplicar, h: html} — así el mismo motor sirve para
     números, polinomios y formas factorizadas. */
  var MIN = '−';                        // signo menos tipográfico
  function tex(f) {
    if (f && f.h !== undefined) return f.h;      // respuesta genérica ya renderizada
    if (f.d === 1) return (f.n < 0 ? MIN : '') + Math.abs(f.n);
    var s = f.n < 0 ? MIN : '';
    return s + '<span class="fr"><span class="fr__n">' + Math.abs(f.n) + '</span><span class="fr__d">' + f.d + '</span></span>';
  }

  /* ── azar ── */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function coin() { return Math.random() < 0.5; }
  function nz(a, b) { var x; do { x = rint(a, b); } while (x === 0); return x; }   // no-cero

  /* ═══════════════════════════════════════════════════════════════
     ENSAMBLE · toma la correcta + candidatos de error y arma 4 opciones
     - descarta candidatos nulos o iguales a la correcta o repetidos
     - si faltan, rellena con valores cercanos (sin etiqueta pedagógica)
     ═══════════════════════════════════════════════════════════════ */
  function ensamblar(correcta, candidatos, meta) {
    var seen = {}; seen[fkey(correcta)] = 1;
    var dis = [];
    for (var i = 0; i < candidatos.length && dis.length < 3; i++) {
      var c = candidatos[i];
      if (!c || !c.val) continue;
      var k = fkey(c.val);
      if (seen[k]) continue;
      seen[k] = 1; dis.push(c);
    }
    var tries = 0;
    /* relleno de seguridad · solo aplica a respuestas numéricas (las algebraicas
       traen siempre ≥3 distractores propios; el test lo verifica). */
    while (dis.length < 3 && tries < 40 && correcta.d !== undefined) {
      tries++;
      var delta = pick([-2, -1, 1, 2, 3]);
      var v = correcta.d === 1 ? ent(correcta.n + delta) : fr(correcta.n + delta, correcta.d);
      if (!v) continue;
      var k2 = fkey(v);
      if (seen[k2]) continue;
      seen[k2] = 1; dis.push({ val: v, err: 'Resultado incorrecto.' });
    }
    var opciones = [{ val: correcta, ok: true }].concat(dis.map(function (c) { return { val: c.val, ok: false, err: c.err }; }));
    // barajar
    for (var j = opciones.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)); var t = opciones[j]; opciones[j] = opciones[r]; opciones[r] = t; }
    return { correcta: correcta, opciones: opciones, meta: meta };
  }

  /* ═══════════════════════════════════════════════════════════════
     GENERADORES · uno por sub-tema. Cada uno devuelve:
       { enunciado(HTML), correcta, opciones[], meta{ref, pasos[]} }
     ═══════════════════════════════════════════════════════════════ */

  /* — signos · suma y resta de enteros — */
  function genSignosSuma(nivel) {
    var top = [9, 15, 25][nivel - 1];
    var A = nz(-top, top);
    var op = coin() ? '+' : '-';                       // símbolo escrito
    var s2 = (nivel >= 2 && coin()) ? -1 : 1;          // signo del 2º operando
    var B = rint(2, top);
    var signoOp = op === '+' ? 1 : -1;
    var correcta = ent(A + signoOp * (s2 * B));

    var t2 = s2 < 0 ? '(' + MIN + B + ')' : String(B);
    var enun = tex(ent(A)) + ' ' + (op === '+' ? '+' : MIN) + ' ' + t2;

    var cand = [];
    cand.push({ val: ent(-(A + signoOp * (s2 * B))), err: 'El resultado tiene <strong>el signo cambiado</strong>. Fíjate cuál número "pesa" más.' });
    if (op === '-' && s2 < 0)
      cand.push({ val: ent(A - B), err: 'Menos por menos da <strong>más</strong>: ' + MIN + '(' + MIN + B + ') = +' + B + ', no ' + MIN + B + '.' });
    if (A < 0)
      cand.push({ val: ent(Math.abs(A) + signoOp * (s2 * B)), err: 'Se te fue el <strong>signo del primer número</strong> (' + A + ', no ' + Math.abs(A) + ').' });
    cand.push({ val: ent(A + signoOp * s2 * B * -1), err: 'Confundiste sumar con restar en el segundo número.' });
    cand.push({ val: ent(Math.abs(A) + Math.abs(B)), err: 'Sumaste las magnitudes ignorando los signos.' });

    var pasos = [
      'Identifica el signo de cada número: <b>' + A + '</b> y <b>' + (signoOp * s2 * B) + '</b>.',
      (Math.sign(A) === Math.sign(signoOp * s2 * B) || A === 0)
        ? 'Mismo signo → <b>suma</b> las magnitudes y conserva el signo.'
        : 'Signos distintos → <b>resta</b> la menor de la mayor y toma el signo del que pesa más.',
      'Resultado: <b>' + (correcta.n) + '</b>.'
    ];
    return finish(enun, correcta, cand, { ref: 'Tema 1 · reales', tema: 'Operaciones con signos', pasos: pasos });
  }

  /* — signos · multiplicación y división de enteros — */
  function genSignosMul(nivel) {
    var top = [7, 10, 12][nivel - 1];
    var esDiv = nivel >= 2 && coin();
    var correcta, enun, A, B;
    if (esDiv) {
      B = nz(-top, top); var q = nz(-top, top); A = B * q;   // divisible exacto
      correcta = ent(q);
      enun = tex(ent(A)) + ' ÷ ' + tex(ent(B));
    } else {
      A = nz(-top, top); B = nz(-top, top);
      correcta = ent(A * B);
      enun = tex(ent(A)) + ' × ' + tex(ent(B));
    }
    var val = correcta.n;
    var cand = [
      { val: ent(-val), err: 'Regla de los signos: <strong>' + (val < 0 ? 'menos por menos da MÁS' : 'signos iguales dan más, distintos dan menos') + '</strong>. Te salió con el signo cambiado.' },
      { val: ent(A + B), err: '<strong>Sumaste</strong> en vez de ' + (esDiv ? 'dividir' : 'multiplicar') + '.' },
      { val: ent(Math.abs(val)), err: 'Sacaste bien el número pero <strong>ignoraste el signo</strong>.' },
      { val: ent(-Math.abs(val)), err: 'Signo equivocado: revisa la regla.' }
    ];
    var mismo = (A < 0) === (B < 0);
    var pasos = [
      'Primero el <b>signo</b>: ' + (mismo ? 'signos <b>iguales</b> → resultado <b>positivo</b>.' : 'signos <b>distintos</b> → resultado <b>negativo</b>.'),
      'Luego el número: ' + Math.abs(A) + (esDiv ? ' ÷ ' : ' × ') + Math.abs(B) + ' = <b>' + Math.abs(val) + '</b>.',
      'Junta signo y número: <b>' + val + '</b>.'
    ];
    return finish(enun, correcta, cand, { ref: 'Tema 1 · reales', tema: 'Operaciones con signos', pasos: pasos });
  }

  /* — fracciones · suma y resta — */
  function genFracSuma(nivel) {
    var top = [6, 9, 12][nivel - 1];
    var d1 = rint(2, top), d2 = rint(2, top);
    var n1 = nz(1, top) * (nivel >= 3 && coin() ? -1 : 1);
    var n2 = nz(1, top) * (nivel >= 2 && coin() ? -1 : 1);
    var a = fr(n1, d1), b = fr(n2, d2);
    var resta = coin();
    var correcta = resta ? fsub(a, b) : fadd(a, b);
    var enun = tex(a) + ' ' + (resta ? MIN : '+') + ' ' + tex(b);

    var cand = [];
    // el clásico "de frente": operar numeradores y denominadores por separado
    var frente = fr(resta ? n1 - n2 : n1 + n2, resta ? (d1 - d2) : (d1 + d2));
    cand.push({ val: frente, err: 'Operaste <strong>numerador con numerador y denominador con denominador</strong>. Primero hay que igualar denominadores.' });
    // olvidó escalar los numeradores al sacar común denominador
    var comun = d1 * d2 / gcd(d1, d2);
    cand.push({ val: fr(resta ? n1 - n2 : n1 + n2, comun), err: 'Sacaste el <strong>común denominador</strong> pero no ajustaste los numeradores.' });
    // signo cambiado
    cand.push({ val: fr(-correcta.n, correcta.d), err: 'Signo cambiado — cuida el orden al restar.' });
    // restó al revés
    if (resta) cand.push({ val: fsub(b, a), err: 'Restaste <strong>al revés</strong> (segunda menos primera).' });

    var lcm = d1 * d2 / gcd(d1, d2);
    var pasos = [
      'Común denominador de ' + d1 + ' y ' + d2 + ': <b>' + lcm + '</b>.',
      'Reescribe: ' + tex(fr(n1 * (lcm / d1), lcm)) + ' ' + (resta ? MIN : '+') + ' ' + tex(fr(n2 * (lcm / d2), lcm)) + '.',
      (resta ? 'Resta' : 'Suma') + ' solo los numeradores: <b>' + tex(correcta) + '</b>' + (correcta.d === 1 ? ' (se simplificó a entero).' : '.')
    ];
    return finish(enun, correcta, cand, { ref: 'Tema 1 · reales', tema: 'Fracciones', pasos: pasos });
  }

  /* — fracciones · multiplicación y división — */
  function genFracMul(nivel) {
    var top = [6, 9, 10][nivel - 1];
    var n1 = nz(1, top) * (nivel >= 3 && coin() ? -1 : 1), d1 = rint(2, top);
    var n2 = nz(1, top) * (nivel >= 3 && coin() ? -1 : 1), d2 = rint(2, top);
    var a = fr(n1, d1), b = fr(n2, d2);
    var esDiv = coin();
    var correcta = esDiv ? fdiv(a, b) : fmul(a, b);
    var enun = tex(a) + ' ' + (esDiv ? '÷' : '×') + ' ' + tex(b);

    var cand = [];
    if (esDiv) {
      cand.push({ val: fr(a.n * b.n, a.d * b.d), err: 'Al dividir <strong>no invertiste</strong> la segunda fracción. Dividir = multiplicar por el <em>recíproco</em>.' });
      cand.push({ val: fmul(fr(a.d, a.n), b), err: 'Invertiste la <strong>fracción equivocada</strong> (la primera, no la segunda).' });
      cand.push({ val: fmul(fr(a.d, a.n), fr(b.d, b.n)), err: 'Invertiste <strong>las dos</strong>. Solo se voltea la que divide.' });
    } else {
      cand.push({ val: fr(a.n + b.n, a.d + b.d), err: 'Sumaste <strong>de frente</strong>. Multiplicar fracciones es recto: arriba con arriba, abajo con abajo.' });
      cand.push({ val: fdiv(a, b), err: 'Invertiste la segunda como si fuera una <strong>división</strong>.' });
      cand.push({ val: fr(a.n * b.n, gcd(a.d, b.d)), err: 'Error al multiplicar los denominadores.' });
    }
    cand.push({ val: fr(-correcta.n, correcta.d), err: 'Signo equivocado.' });

    var pasos = esDiv
      ? ['Dividir es <b>multiplicar por el recíproco</b>: voltea ' + tex(b) + ' → ' + tex(fr(b.d, b.n)) + '.',
         'Multiplica recto: ' + tex(a) + ' × ' + tex(fr(b.d, b.n)) + '.',
         'Simplifica: <b>' + tex(correcta) + '</b>.']
      : ['Multiplica <b>numerador por numerador</b> y <b>denominador por denominador</b>.',
         tex(a) + ' × ' + tex(b) + ' = ' + tex(fr(n1 * n2, d1 * d2)) + '.',
         'Simplifica: <b>' + tex(correcta) + '</b>.'];
    return finish(enun, correcta, cand, { ref: 'Tema 1 · reales', tema: 'Fracciones', pasos: pasos });
  }

  /* — ecuaciones de primer grado — */
  function genEcuacion(nivel) {
    var top = [6, 9, 12][nivel - 1];
    var x0 = nz(-top, top);                     // solución entera
    var a = nz(nivel >= 3 ? -6 : 2, nivel >= 3 ? 6 : 8);
    if (a === 0) a = 2;
    var b = nz(-top, top);
    var c = a * x0 + b;
    var correcta = fr(c - b, a);                // = x0

    var ax = a === 1 ? 'x' : a === -1 ? MIN + 'x' : tex(ent(a)) + 'x';
    var enun = ax + ' ' + (b < 0 ? MIN : '+') + ' ' + Math.abs(b) + ' = ' + tex(ent(c));

    var cand = [
      { val: fr(c + b, a), err: 'Al pasar el <strong>' + b + '</strong> al otro lado <strong>no le cambiaste el signo</strong>.' },
      { val: ent(c - b), err: 'Despejaste bien pero <strong>te faltó dividir</strong> entre ' + a + '.' },
      { val: fr(-(c - b), a), err: 'Signo del resultado cambiado.' },
      { val: fr(c - b, b || 1), err: 'Dividiste entre el número equivocado.' }
    ];
    var pasos = [
      'Pasa el <b>' + b + '</b> al otro lado cambiándole el signo: ' + ax + ' = ' + tex(ent(c)) + ' ' + (b < 0 ? '+ ' + Math.abs(b) : MIN + ' ' + b) + ' = ' + tex(ent(c - b)) + '.',
      'Divide ambos lados entre <b>' + a + '</b>.',
      'x = <b>' + tex(correcta) + '</b>.'
    ];
    return finish(enun, correcta, cand, { ref: 'Tema 3 · ecuaciones', tema: 'Ecuaciones de 1er grado', pasos: pasos });
  }

  /* — productos notables — */
  function genProdNotables(nivel) {
    var top = [6, 9, 12][nivel - 1];
    var tipo = pick(nivel === 1 ? ['cuad', 'conj'] : nivel === 2 ? ['cuad', 'conj', 'comun'] : ['cuad', 'conj', 'comun', 'coef']);
    var enun, correcta, cand, pasos, A;

    if (tipo === 'cuad') {                                  // (x ± a)²
      var a = rint(2, top) * ((nivel >= 2 && coin()) ? -1 : 1);
      A = [a * a, 2 * a, 1];
      enun = '(x ' + sg(a) + ')²';
      correcta = ansP(A);
      cand = [
        { val: ansP([a * a, 0, 1]),      err: 'Te faltó el <strong>doble producto</strong>. (x ± a)² = x² <strong>± 2ax</strong> + a², no solo x² + a².' },
        { val: ansP([a * a, a, 1]),      err: 'El término de en medio lleva el <strong>2</strong>: 2·x·(' + a + ') = ' + (2 * a) + 'x.' },
        { val: ansP([-a * a, 2 * a, 1]), err: 'El último término es un <strong>cuadrado</strong>: (' + a + ')² = ' + (a * a) + ', siempre <strong>positivo</strong>.' },
        { val: ansP([a * a, -2 * a, 1]), err: 'El signo del término de en medio <strong>sigue al del binomio</strong>.' }
      ];
      pasos = ['Cuadrado del primero: <b>x²</b>.',
               'Doble producto: <b>2·x·(' + a + ') = ' + (2 * a) + 'x</b>.',
               'Cuadrado del segundo: <b>(' + a + ')² = ' + (a * a) + '</b> (positivo).',
               'Queda: <b>' + pstr(A) + '</b>.'];

    } else if (tipo === 'conj') {                           // (x + a)(x − a)
      var b = rint(2, top);
      A = [-b * b, 0, 1];
      enun = '(x + ' + b + ')(x ' + MIN + ' ' + b + ')';
      correcta = ansP(A);
      cand = [
        { val: ansP([b * b, 0, 1]),        err: 'Binomios conjugados dan <strong>diferencia</strong> de cuadrados: x² <strong>' + MIN + '</strong> a².' },
        { val: ansP([-b * b, 2 * b, 1]),   err: 'Los productos cruzados <strong>se cancelan</strong> (+' + b + 'x y ' + MIN + b + 'x): no hay término de en medio.' },
        { val: ansP([b * b, 2 * b, 1]),    err: 'Eso es (x + ' + b + ')², no el producto de <strong>conjugados</strong>.' },
        { val: ansP([-b * b, -2 * b, 1]),  err: 'No queda término en x: los cruzados se anulan.' }
      ];
      pasos = ['Son <b>conjugados</b>: mismo par, signos opuestos.',
               'Los productos cruzados se anulan: +' + b + 'x ' + MIN + ' ' + b + 'x = 0.',
               'Queda <b>cuadrado del primero menos cuadrado del segundo</b>: <b>' + pstr(A) + '</b>.'];

    } else if (tipo === 'comun') {                          // (x + a)(x + b)
      var p = nz(-top, top), q = nz(-top, top);
      if (p === 2 && q === 2) q = 3;                        // evita a+b === a·b
      A = [p * q, p + q, 1];
      enun = '(x ' + sg(p) + ')(x ' + sg(q) + ')';
      correcta = ansP(A);
      cand = [
        { val: ansP([p + q, p * q, 1]), err: 'Los <strong>invertiste</strong>: en medio va la <strong>suma</strong> (' + (p + q) + ') y al final el <strong>producto</strong> (' + (p * q) + ').' },
        { val: ansP([p * q, p * q, 1]), err: 'El término de en medio es la <strong>suma</strong> de los dos números, no el producto.' },
        { val: ansP([p + q, p + q, 1]), err: 'El término independiente es el <strong>producto</strong> de los dos números.' },
        { val: ansP([-p * q, p + q, 1]), err: 'Cuida el <strong>signo</strong> del producto: (' + p + ')(' + q + ') = ' + (p * q) + '.' }
      ];
      pasos = ['Término común x: <b>x²</b>.',
               'Término de en medio = <b>suma</b>: (' + p + ') + (' + q + ') = <b>' + (p + q) + '</b>.',
               'Independiente = <b>producto</b>: (' + p + ')(' + q + ') = <b>' + (p * q) + '</b>.',
               'Queda: <b>' + pstr(A) + '</b>.'];

    } else {                                                // (cx ± a)²
      var c = rint(2, 4), d = nz(-top, top);
      A = [d * d, 2 * c * d, c * c];
      enun = '(' + c + 'x ' + sg(d) + ')²';
      correcta = ansP(A);
      cand = [
        { val: ansP([d * d, 0, c * c]),         err: 'Te faltó el <strong>doble producto</strong>: 2·(' + c + 'x)·(' + d + ') = ' + (2 * c * d) + 'x.' },
        { val: ansP([d * d, 2 * d, c * c]),     err: 'En el doble producto también entra el <strong>' + c + '</strong>: 2·(' + c + 'x)·(' + d + ') = ' + (2 * c * d) + 'x.' },
        { val: ansP([d * d, 2 * c * d, c]),     err: 'El coeficiente también se <strong>eleva al cuadrado</strong>: (' + c + 'x)² = ' + (c * c) + 'x².' },
        { val: ansP([-d * d, 2 * c * d, c * c]), err: 'El último término es un cuadrado → <strong>positivo</strong>.' }
      ];
      pasos = ['Cuadrado del primero: <b>(' + c + 'x)² = ' + (c * c) + 'x²</b> (el coeficiente también se eleva).',
               'Doble producto: <b>2·(' + c + 'x)·(' + d + ') = ' + (2 * c * d) + 'x</b>.',
               'Cuadrado del segundo: <b>' + (d * d) + '</b>.',
               'Queda: <b>' + pstr(A) + '</b>.'];
    }
    return finish(enun, correcta, cand, { ref: 'Tema 2 · productos notables', tema: 'Productos notables', pasos: pasos, ask: 'Desarrolla' });
  }

  /* — factorización — */
  function genFactorizacion(nivel) {
    var top = [6, 9, 10][nivel - 1];
    var tipo = pick(nivel === 1 ? ['dif', 'tri'] : ['dif', 'tri', 'tcp']);
    var enun, correcta, cand, pasos, P;

    if (tipo === 'dif') {                                   // x² − a²
      var a = rint(2, top);
      P = [-a * a, 0, 1];
      enun = pstr(P);
      correcta = ansF([{ a: 1, b: a }, { a: 1, b: -a }]);
      cand = [
        { val: ansF([{ a: 1, b: a * a }, { a: 1, b: -a * a }]), err: 'Hay que sacar la <strong>raíz cuadrada</strong> de ' + (a * a) + ', que es <strong>' + a + '</strong> — no usar ' + (a * a) + '.' },
        { val: ansF([{ a: 1, b: a }, { a: 1, b: a }]),         err: 'Eso es un <strong>trinomio cuadrado perfecto</strong>. Una <strong>diferencia</strong> de cuadrados da binomios <strong>conjugados</strong>.' },
        { val: ansF([{ a: 1, b: -a }, { a: 1, b: -a }]),       err: 'Los signos deben ser <strong>opuestos</strong>: (x + ' + a + ')(x ' + MIN + ' ' + a + ').' }
      ];
      pasos = ['Reconoce la forma: <b>diferencia de cuadrados</b> (a² ' + MIN + ' b²).',
               'Raíces: √x² = <b>x</b> y √' + (a * a) + ' = <b>' + a + '</b>.',
               'Se factoriza en <b>conjugados</b>: <b>(x + ' + a + ')(x ' + MIN + ' ' + a + ')</b>.'];

    } else if (tipo === 'tcp') {                            // x² + 2ax + a²
      var t = rint(2, top) * (coin() ? -1 : 1);
      P = [t * t, 2 * t, 1];
      enun = pstr(P);
      correcta = ansF([{ a: 1, b: t }, { a: 1, b: t }]);
      cand = [
        { val: ansF([{ a: 1, b: 2 * t }, { a: 1, b: 2 * t }]), err: 'Usaste el término de en medio completo. Va su <strong>mitad</strong>: √' + (t * t) + ' = ' + Math.abs(t) + '.' },
        { val: ansF([{ a: 1, b: t }, { a: 1, b: -t }]),        err: 'Eso es una <strong>diferencia de cuadrados</strong>. Aquí hay término de en medio → <strong>cuadrado perfecto</strong>.' },
        { val: ansF([{ a: 1, b: -t }, { a: 1, b: -t }]),       err: 'El binomio lleva el <strong>mismo signo</strong> que el término de en medio (' + (2 * t) + 'x).' }
      ];
      pasos = ['Checa si es <b>cuadrado perfecto</b>: √x² = x y √' + (t * t) + ' = ' + Math.abs(t) + '.',
               'Verifica el de en medio: 2·x·(' + t + ') = <b>' + (2 * t) + 'x</b> ✓.',
               'Queda: <b>(x ' + sg(t) + ')²</b>.'];

    } else {                                                // x² + (p+q)x + pq
      var p, q, g = 0;
      do { p = nz(-top, top); q = nz(-top, top); g++; }
      while (g < 50 && (Math.abs(p) < 2 || Math.abs(q) < 2 || q === -p));
      P = [p * q, p + q, 1];
      enun = pstr(P);
      correcta = ansF([{ a: 1, b: p }, { a: 1, b: q }]);
      cand = [
        { val: ansF([{ a: 1, b: -p }, { a: 1, b: -q }]),   err: 'Signos al revés: deben <strong>multiplicar</strong> ' + (p * q) + ' y <strong>sumar</strong> ' + (p + q) + '.' },
        { val: ansF([{ a: 1, b: p * q }, { a: 1, b: 1 }]), err: 'Esos <strong>multiplican</strong> bien, pero <strong>no suman</strong> el término de en medio (' + (p + q) + ').' },
        { val: ansF([{ a: 1, b: p }, { a: 1, b: -q }]),    err: 'Revisa signos: el producto debe dar ' + (p * q) + '.' }
      ];
      pasos = ['Busca dos números que <b>multiplicados</b> den ' + (p * q) + ' y <b>sumados</b> ' + (p + q) + '.',
               'Son <b>' + p + '</b> y <b>' + q + '</b>.',
               'Queda: <b>(x ' + sg(p) + ')(x ' + sg(q) + ')</b>.'];
    }
    return finish(enun, correcta, cand, { ref: 'Tema 2 · factorización', tema: 'Factorización', pasos: pasos, ask: 'Factoriza' });
  }

  function finish(enun, correcta, cand, meta) {
    var e = ensamblar(correcta, cand, meta);
    return { enunciado: enun, correcta: correcta, opciones: e.opciones, meta: meta };
  }

  /* — sistemas de 2×2 — */
  function ansPair(x, y) {
    function f(n) { return n < 0 ? MIN + Math.abs(n) : String(n); }
    return { k: 'xy:' + x + ',' + y, h: 'x = ' + f(x) + ',  y = ' + f(y) };
  }
  function ecu2(a, b, c) {                            // "a x + b y = c" (a>0)
    var t1 = (a === 1 ? '' : a) + 'x';
    var op = b < 0 ? ' ' + MIN + ' ' : ' + ';
    var t2 = (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y';
    return t1 + op + t2 + ' = ' + (c < 0 ? MIN + Math.abs(c) : c);
  }
  function genSistemas(nivel) {
    var top = [5, 7, 9][nivel - 1];
    var x0, y0, a1, b1, a2, b2, g = 0;
    do {
      x0 = nz(nivel === 1 ? 1 : -top, top);
      y0 = nz(nivel === 1 ? 1 : -top, top);
      a1 = rint(1, nivel >= 2 ? 4 : 3); b1 = nz(-top, top);
      a2 = rint(1, nivel >= 2 ? 4 : 3); b2 = nz(-top, top);
      g++;
    } while (g < 100 && (x0 === y0 || a1 * b2 - a2 * b1 === 0));   // no degenerado, x≠y

    var c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
    var enun = '<span style="font-size:.72em; line-height:1.4; display:inline-block">' +
               ecu2(a1, b1, c1) + '<br>' + ecu2(a2, b2, c2) + '</span>';

    var cand = [
      { val: ansPair(y0, x0), tipo: 'invertido', err: 'Invertiste los valores: revisa cuál es x y cuál es y.' },
      { val: ansPair(-x0, y0), tipo: 'signo-x', err: 'Signo cambiado en x. Sustituye tu solución en las DOS ecuaciones para comprobar.' },
      { val: ansPair(x0, -y0), tipo: 'signo-y', err: 'Signo cambiado en y. Sustituye tu solución en las DOS ecuaciones para comprobar.' },
      { val: ansPair(x0 + 1, y0 - 1), tipo: 'aritmetica', err: 'Revisa la aritmética al despejar; comprueba sustituyendo.' }
    ];
    return finish(enun, ansPair(x0, y0), cand, { ref: 'Tema 2 · sistemas', tema: 'Sistema 2×2', ask: 'Resuelve',
      pasos: ['Resuélvelo por sustitución o por eliminación.',
              'Comprueba: sustituye x = ' + x0 + ', y = ' + y0 + ' en las dos ecuaciones y deben cumplirse.',
              'Solución: <b>x = ' + x0 + ', y = ' + y0 + '</b>.'] });
  }

  /* — ecuación de 2º grado (x² + bx + c = 0, factorizable) — */
  function ansRoots(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b);
    function f(n) { return n < 0 ? MIN + Math.abs(n) : String(n); }
    return { k: 'rt:' + lo + ',' + hi, h: 'x = ' + f(lo) + ', ' + f(hi) };
  }
  function genCuadratica(nivel) {
    var top = [6, 8, 11][nivel - 1];
    var r1, r2, g = 0;
    do {
      r1 = nz(nivel === 1 ? 1 : -top, top);
      r2 = nz(nivel === 1 ? 1 : -top, top);
      g++;
    } while (g < 80 && (r1 === r2 || r1 === -r2));     // raíces distintas y b≠0

    var b = -(r1 + r2), c = r1 * r2;
    var signB = b < 0 ? MIN + ' ' : '+ ';
    var magB = Math.abs(b) === 1 ? '' : Math.abs(b);
    var enun = 'x² ' + signB + magB + 'x ' + sg(c) + ' = 0';

    var cand = [
      { val: ansRoots(-r1, -r2), tipo: 'signo-ambas',
        err: 'Signo cambiado en las dos. El factor (x ' + sg(-r1) + ') se hace cero cuando x = ' + r1 + ', no ' + (-r1) + '.' },
      { val: ansRoots(-r1, r2), tipo: 'signo-una',
        err: 'Una raíz con el signo al revés. Iguala cada factor a cero por separado y despeja.' },
      { val: ansRoots(r1, -r2), tipo: 'signo-una',
        err: 'Una raíz con el signo al revés. Iguala cada factor a cero por separado y despeja.' },
      { val: ansRoots(b, c), tipo: 'coeficientes',
        err: 'Esos son los coeficientes (' + b + ' y ' + c + '), no las raíces.' }
    ];
    return finish(enun, ansRoots(r1, r2), cand, { ref: 'Tema 3 · cuadráticas', tema: 'Ecuación de 2º grado', ask: 'Resuelve',
      pasos: ['Busca dos números que multiplicados den ' + c + ' y sumados ' + (r1 + r2) + ': son ' + r1 + ' y ' + r2 + '.',
              'Factoriza: (x ' + sg(-r1) + ')(x ' + sg(-r2) + ') = 0.',
              'Cada factor a cero: x ' + sg(-r1) + ' = 0 → x = ' + r1 + '; x ' + sg(-r2) + ' = 0 → x = ' + r2 + '.'] });
  }

  /* — potencias y radicales — */
  function sup(e) { return '<sup>' + (e < 0 ? MIN + Math.abs(e) : e) + '</sup>'; }
  function powH(base, e) { return String(base) + sup(e); }
  function ansPow(base, e) { return { k: 'pw:' + base + ':' + e, h: powH(base, e) }; }

  function genPotencias(nivel) {
    var tipos = nivel === 1 ? ['eval', 'raiz'] : nivel === 2 ? ['eval', 'raiz', 'ley', 'neg'] : ['ley', 'neg'];
    var tipo = pick(tipos);

    if (tipo === 'eval') {                                   // b^e (número)
      var b = rint(2, nivel >= 2 ? 7 : 5), e = rint(2, nivel >= 2 ? 4 : 3);
      var val = Math.pow(b, e), fac = [];
      for (var i = 0; i < e; i++) fac.push(b);
      var cand = [
        { val: ent(b * e), tipo: 'base-por-exp', err: 'Multiplicaste base por exponente. ' + powH(b, e) + ' es ' + b + ' multiplicado por sí mismo ' + e + ' veces, no ' + b + '×' + e + '.' },
        { val: ent(b + e), tipo: 'base-mas-exp', err: 'Sumaste base y exponente.' },
        { val: ent(Math.pow(e, b)), tipo: 'invirtio', err: 'Invertiste base y exponente: eso es ' + powH(e, b) + ', no ' + powH(b, e) + '.' },
        { val: ent(val * b), tipo: 'un-factor-de-mas', err: 'Un factor de más: multiplicaste ' + (e + 1) + ' veces, no ' + e + '.' }
      ];
      return finish(powH(b, e), ent(val), cand, { ref: 'Tema 1 · potencias', tema: 'Potencias', ask: 'Calcula',
        pasos: [powH(b, e) + ' = ' + fac.join(' × ') + ' = <b>' + val + '</b>.',
                'El exponente dice CUÁNTAS VECES se multiplica la base por sí misma.'] });
    }

    if (tipo === 'raiz') {                                   // √(cuadrado perfecto)
      var n = rint(4, nivel >= 2 ? 15 : 12), sq = n * n;
      var cand = [];
      if (sq % 2 === 0) cand.push({ val: ent(sq / 2), tipo: 'mitad', err: 'La raíz no es la mitad. √' + sq + ' es el número que multiplicado por SÍ MISMO da ' + sq + '.' });
      cand.push({ val: ent(2 * n), tipo: 'doble', err: 'Ese es el doble. La raíz es el número que al cuadrado da ' + sq + ' (' + n + '×' + n + ').' });
      cand.push({ val: ent(n + 1), tipo: 'cerca', err: 'Casi: ' + (n + 1) + '² = ' + ((n + 1) * (n + 1)) + ', no ' + sq + '. Es ' + n + '.' });
      cand.push({ val: ent(n - 1), tipo: 'cerca', err: 'Casi: ' + (n - 1) + '² = ' + ((n - 1) * (n - 1)) + ', no ' + sq + '. Es ' + n + '.' });
      return finish('√' + sq, ent(n), cand, { ref: 'Tema 1 · radicales', tema: 'Raíz cuadrada', ask: 'Calcula',
        pasos: ['√' + sq + ' pregunta: ¿qué número al cuadrado da ' + sq + '?', n + ' × ' + n + ' = ' + sq + ' → <b>' + n + '</b>.'] });
    }

    if (tipo === 'ley') {                                    // leyes de exponentes (x, simbólico)
      var op = pick(['prod', 'coc', 'pot']), m, k, expc, enun, ley, malos;
      if (op === 'prod') {
        m = rint(2, 7); k = rint(2, 6); if (m === 2 && k === 2) k = 3;
        expc = m + k; enun = powH('x', m) + ' · ' + powH('x', k); ley = 'producto';
        malos = [{ e: m * k, tipo: 'mult-exp', txt: 'Multiplicaste los exponentes. En un PRODUCTO de la misma base se SUMAN: x' + sup(m) + '·x' + sup(k) + ' = x' + sup(m + k) + '.' }];
      } else if (op === 'coc') {
        m = rint(5, 9); k = rint(2, 4); if (k >= m) k = 2;
        expc = m - k; enun = powH('x', m) + ' ÷ ' + powH('x', k); ley = 'cociente';
        malos = [{ e: m + k, tipo: 'suma-exp', txt: 'Sumaste. En un COCIENTE se RESTAN los exponentes: x' + sup(m - k) + '.' },
                 { e: m * k, tipo: 'mult-exp', txt: 'Multiplicaste. En un cociente se RESTAN los exponentes.' }];
      } else {
        m = rint(2, 5); k = rint(2, 4);
        expc = m * k; enun = '(' + powH('x', m) + ')' + sup(k); ley = 'potencia de potencia';
        malos = [{ e: m + k, tipo: 'suma-exp', txt: 'Sumaste. En una POTENCIA DE POTENCIA se MULTIPLICAN: (x' + sup(m) + ')' + sup(k) + ' = x' + sup(m * k) + '.' }];
      }
      var usados = {}; usados[expc] = 1; var cand = [];
      malos.forEach(function (bad) { if (!usados[bad.e]) { usados[bad.e] = 1; cand.push({ val: ansPow('x', bad.e), tipo: bad.tipo, err: bad.txt }); } });
      var extra = [expc + 1, expc - 1, expc + 2, Math.abs(m - k), 2 * expc, expc + 3];
      for (var j = 0; j < extra.length && cand.length < 3; j++) {
        if (usados[extra[j]]) continue; usados[extra[j]] = 1;
        cand.push({ val: ansPow('x', extra[j]), tipo: 'exp-incorrecto', err: 'Revisa la ley del ' + ley + ': el exponente correcto es ' + expc + '.' });
      }
      return finish(enun, ansPow('x', expc), cand, { ref: 'Tema 1 · potencias', tema: 'Leyes de exponentes', ask: 'Simplifica',
        pasos: ['Ley del <b>' + ley + '</b> (misma base).',
                (op === 'prod' ? 'Se SUMAN los exponentes: ' + m + ' + ' + k + ' = ' + expc
                 : op === 'coc' ? 'Se RESTAN los exponentes: ' + m + ' − ' + k + ' = ' + expc
                 : 'Se MULTIPLICAN los exponentes: ' + m + ' × ' + k + ' = ' + expc) + '.',
                'Queda <b>x' + sup(expc) + '</b>.'] });
    }

    // neg: exponente cero o negativo
    if (pick(['cero', 'neg']) === 'cero') {
      var b = rint(2, 9);
      var cand = [
        { val: ent(0), tipo: 'da-cero', err: 'Cualquier número (≠0) elevado a la 0 es <strong>1</strong>, no 0.' },
        { val: ent(b), tipo: 'da-base', err: 'No es la base. Todo número a la potencia 0 da 1.' },
        { val: ent(b * b), tipo: 'da-cuadrado', err: 'El exponente es 0, no 2. Da 1.' }
      ];
      return finish(powH(b, 0), ent(1), cand, { ref: 'Tema 1 · potencias', tema: 'Exponente cero', ask: 'Calcula',
        pasos: ['Cualquier base distinta de 0 elevada al exponente 0 vale <b>1</b>.', powH(b, 0) + ' = <b>1</b>.'] });
    }
    var b2 = rint(2, 5), e2 = rint(2, 3), pot = Math.pow(b2, e2);
    var cand = [
      { val: ent(-pot), tipo: 'signo', err: 'El exponente negativo NO hace negativo el resultado: da el <strong>recíproco</strong> 1/' + powH(b2, e2) + ', no ' + MIN + pot + '.' },
      { val: ent(pot), tipo: 'ignoro-neg', err: 'Ignoraste el negativo. ' + powH(b2, -e2) + ' = 1/' + powH(b2, e2) + ', no ' + pot + '.' },
      { val: fr(-1, pot), tipo: 'signo-frac', err: 'El recíproco es positivo: 1/' + pot + '.' },
      { val: fr(1, b2 * e2), tipo: 'base-por-exp', err: 'Primero ' + powH(b2, e2) + ' = ' + pot + ', luego el recíproco.' }
    ];
    return finish(powH(b2, -e2), fr(1, pot), cand, { ref: 'Tema 1 · potencias', tema: 'Exponente negativo', ask: 'Calcula',
      pasos: ['Un exponente negativo significa <b>recíproco</b>: ' + powH(b2, -e2) + ' = 1 / ' + powH(b2, e2) + '.',
              powH(b2, e2) + ' = ' + pot + ', así que <b>1/' + pot + '</b>.'] });
  }

  /* ═══════════════════════════════════════════════════════════════
     REGISTRO · agregar un tema = agregar una entrada aquí
     ═══════════════════════════════════════════════════════════════ */

  /* Registro: id de generador → función. El catálogo (catalogo.js) dice
     qué tema usa cuál; aquí solo viven las funciones. */
  var GENERADORES = {
    'signos-suma':   genSignosSuma,
    'signos-mul':    genSignosMul,
    'frac-suma':     genFracSuma,
    'frac-mul':      genFracMul,
    'prod-notables': genProdNotables,
    'factorizacion': genFactorizacion,
    'ecuacion':      genEcuacion,
    'potencias':     genPotencias,
    'cuadratica':    genCuadratica,
    'sistemas':      genSistemas
  };

  return { GENERADORES: GENERADORES, tex: tex, feq: feq, fkey: fkey, pick: pick };
})();
