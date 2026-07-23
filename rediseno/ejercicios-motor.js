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
    'ecuacion':      genEcuacion
  };

  return { GENERADORES: GENERADORES, tex: tex, feq: feq, fkey: fkey, pick: pick };
})();
