/*
 * ejercicios-factorizacion.js — generadores de Factorización (semana 6) para la práctica sin fin.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se cargan después
 * de él. El motor ya trae «factorizacion» (diferencia de cuadrados, x² + bx + c y trinomio
 * cuadrado perfecto); aquí va lo que le falta:
 *
 *   fact-comun     el factor común: un monomio, con signos (6x² + 9x = 3x(2x + 3)).
 *   fact-completa  factorizar por completo: primero el factor común y luego el caso
 *                  (3x² − 27 = 3(x + 3)(x − 3)); en el nivel 3, además, trinomios
 *                  ax² + bx + c sencillos, que salen con la tijera.
 *
 * Cada generador devuelve { enunciado, correcta, opciones: [{ val, ok, err }], meta }, igual que
 * los del motor. Las opciones falsas son errores de verdad y cada una dice el suyo. Algunas son
 * iguales a la expresión pero no están completas (x(6x + 9) sigue teniendo un 3 en común): su
 * explicación empieza con «Es igual, pero no está completa». Ninguna falsa es otra forma correcta
 * y completa de la misma factorización (por ejemplo, 2x(5 − 3x) en vez de −2x(3x − 5)).
 *
 * Los polinomios son arreglos de coeficientes por grado, [c0, c1, c2, …], con aritmética entera.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';
  var SUP = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸'];

  /* ---------- azar ---------- */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function signo() { return Math.random() < 0.5 ? -1 : 1; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function mcdLista(lista) { return lista.reduce(function (g, v) { return mcd(g, v); }, 0); }

  /* ---------- números ---------- */
  function num(n) { return n < 0 ? MENOS + -n : String(n); }

  /* ---------- polinomios ---------- */
  function recorta(P) { var B = P.slice(); while (B.length > 1 && B[B.length - 1] === 0) B.pop(); return B; }
  function mulP(A, B) {
    var C = [];
    for (var i = 0; i < A.length + B.length - 1; i++) C.push(0);
    for (var i2 = 0; i2 < A.length; i2++) for (var j = 0; j < B.length; j++) C[i2 + j] += A[i2] * B[j];
    return recorta(C);
  }
  function escala(P, k) { return recorta(P.map(function (c) { return c * k; })); }
  function corre(P, g) { var B = []; for (var i = 0; i < g; i++) B.push(0); return recorta(B.concat(P)); }   // P · x^g
  function igualP(A, B) { return recorta(A).join(',') === recorta(B).join(','); }
  function grado(P) { return recorta(P).length - 1; }

  function potencia(g) { return g === 0 ? '' : g === 1 ? 'x' : 'x' + SUP[g]; }
  // Un término sin su signo: 3x², x, 5.
  function cuerpo(c, g) {
    var a = Math.abs(c);
    if (g === 0) return String(a);
    return (a === 1 ? '' : a) + potencia(g);
  }
  // Un monomio suelto, con su signo: −4x², 3, x, −x.
  function monomio(c, g) { return (c < 0 ? MENOS : '') + cuerpo(c, g); }
  // Un monomio como divisor: los negativos van entre paréntesis, 10x ÷ (−2x).
  function divisor(c, g) { return c < 0 ? '(' + monomio(c, g) + ')' : monomio(c, g); }
  // El polinomio de mayor a menor grado: 12x⁴ − 8x³ + 20x².
  function polinomio(P) {
    P = recorta(P);
    var s = '';
    for (var g = P.length - 1; g >= 0; g--) {
      var c = P[g];
      if (c === 0) continue;
      s += s === '' ? monomio(c, g) : (c < 0 ? ' ' + MENOS + ' ' : ' + ') + cuerpo(c, g);
    }
    return s === '' ? '0' : s;
  }
  // Los términos (grado y coeficiente) de mayor a menor grado.
  function terminos(P) {
    var lista = [];
    for (var g = recorta(P).length - 1; g >= 0; g--) if (P[g]) lista.push({ g: g, c: P[g] });
    return lista;
  }

  /* ---------- formas factorizadas ----------
     Una forma es k·x^g · (resto) · (a₁x + b₁)(a₂x + b₂)…: el monomio de afuera, un polinomio que
     se dejó entre paréntesis (si lo hay) y los factores lineales. */
  function lineal(f) {
    var izq = f.a === 1 ? 'x' : f.a === -1 ? MENOS + 'x' : num(f.a) + 'x';
    if (f.b === 0) return izq;
    return izq + (f.b < 0 ? ' ' + MENOS + ' ' : ' + ') + Math.abs(f.b);
  }
  function forma(k, g, resto, factores) {
    factores = factores || [];
    var afuera = (k === 1 && g === 0) ? '' : (k === -1 && g === 0) ? MENOS : monomio(k, g);
    var h = afuera + (resto ? '(' + polinomio(resto) + ')' : '');
    var claves = factores.map(function (f) { return f.a + ',' + f.b; });
    if (factores.length === 2 && claves[0] === claves[1]) h += '(' + lineal(factores[0]) + ')²';
    else factores.forEach(function (f) { h += '(' + lineal(f) + ')'; });
    var poli = factores.reduce(function (acc, f) { return mulP(acc, [f.b, f.a]); }, corre([k], g));
    if (resto) poli = mulP(poli, resto);
    return {
      k: 'fz:' + k + ',' + g + '|' + (resto ? recorta(resto).join(',') : '') + '|' + claves.sort().join(';'),
      h: h,
      poli: poli
    };
  }

  // La correcta y tres falsas distintas, en orden de prioridad (las primeras van primero).
  function armar(enunciado, correcta, candidatas, meta) {
    var vistas = {};
    vistas[correcta.k] = true;
    var elegidas = [];
    candidatas.forEach(function (c) {
      if (c && elegidas.length < 3 && !vistas[c.val.k]) { vistas[c.val.k] = true; elegidas.push(c); }
    });
    if (elegidas.length < 3) return null;   // quien llama prueba con otro ejercicio
    var opciones = [{ val: correcta, ok: true }].concat(elegidas.map(function (c) {
      return { val: c.val, ok: false, err: c.err };
    }));
    return { enunciado: enunciado, correcta: correcta, opciones: barajar(opciones), meta: meta };
  }

  // Elige al azar, con pesos, sin repetir: las de más peso suelen salir primero.
  function ordenConPesos(lista) {
    var resto = lista.filter(Boolean).slice(), orden = [];
    while (resto.length) {
      var total = resto.reduce(function (s, c) { return s + c.peso; }, 0), r = Math.random() * total, i = 0;
      while (r >= resto[i].peso) { r -= resto[i].peso; i++; }
      orden.push(resto.splice(i, 1)[0]);
    }
    return orden;
  }

  /* ---------- ¿lo de adentro se puede partir todavía? ---------- */
  function esCuadrado(n) { if (n < 0) return false; var r = Math.round(Math.sqrt(n)); return r * r === n; }
  // Un polinomio de grado 1 o 2, sin nada en común, que ya no se factoriza con enteros.
  function irreducible(Q) {
    Q = recorta(Q);
    if (mcdLista(Q) !== 1 || Q[0] === 0) return false;
    if (grado(Q) === 1) return true;
    if (grado(Q) === 2) return !esCuadrado(Q[1] * Q[1] - 4 * Q[2] * Q[0]);
    return false;
  }

  /* =====================================================================
     fact-comun · el factor común
     P = s·g·x^m · Q, con Q sin nada en común: el mcd de sus coeficientes es 1, tiene término
     independiente (así x^m es toda la x que se repite), su primer coeficiente es positivo y ya
     no se factoriza. Si el primer término de P es negativo, el factor común lleva el menos.
     ===================================================================== */
  function hazQ(nivel) {
    var Q, intentos = 0;
    do {
      intentos++;
      var tres = nivel === 3 ? Math.random() < 0.6 : nivel === 2 ? Math.random() < 0.35 : false;
      var gradoAlto = nivel === 1 ? 1 : nivel === 2 ? azar([1, 1, 2]) : azar([1, 2, 2]);
      if (tres) gradoAlto = 2;
      Q = [];
      for (var i = 0; i <= gradoAlto; i++) Q.push(0);
      Q[gradoAlto] = rint(1, nivel === 1 ? 5 : 6);
      Q[0] = rint(1, nivel === 1 ? 6 : 7) * (nivel >= 2 ? signo() : 1);
      if (tres) Q[1] = rint(1, 7) * signo();
    } while (intentos < 200 && !irreducible(Q));
    return Q;
  }

  function genComun(nivel) {
    for (var intento = 0; intento < 60; intento++) {
      var e = intentaComun(nivel);
      if (e) return e;
    }
    throw new Error('fact-comun: no salió un ejercicio');
  }

  function intentaComun(nivel) {
    var Q = hazQ(nivel);
    if (!irreducible(Q)) return null;
    var m = nivel === 1 ? azar([0, 1, 1]) : nivel === 2 ? azar([0, 1, 1, 2]) : azar([1, 2, 2, 3]);
    var g = nivel === 1 ? azar([2, 3, 4, 5, 6, 8]) : nivel === 2 ? azar([2, 3, 4, 5, 6, 8, 9]) : azar([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    var s = nivel === 1 ? 1 : (Math.random() < 0.4 ? -1 : 1);
    var G = s * g;
    var P = corre(escala(Q, G), m);
    if (P.some(function (c) { return Math.abs(c) > 120; })) return null;
    var enunciado = polinomio(P);
    var correcta = forma(G, m, Q);
    var tG = monomio(G, m);
    var tP = terminos(P), tQ = terminos(Q);
    var cand = [];

    // Por completo: falta parte del número…
    var divisores = [];
    for (var d = 1; d < g; d++) if (g % d === 0 && !(d === 1 && m === 0)) divisores.push(d);
    if (divisores.length) {
      var dd = azar(divisores);
      cand.push({ peso: 2, completo: false, val: forma(s * dd, m, escala(Q, g / dd)),
        err: 'Es igual, pero no está completa: adentro, ' + polinomio(escala(Q, g / dd)) + ' todavía tiene un ' + (g / dd) +
          ' en común. Saca también el ' + (g / dd) + ': ' + correcta.h + '.' });
    }
    // …o parte de la x.
    if (m >= 1) {
      var mm = m === 1 ? 0 : azar([0, m - 1]);
      var dentro = corre(Q, m - mm);
      cand.push({ peso: 2, completo: false, val: forma(G, mm, dentro),
        err: 'Es igual, pero no está completa: adentro, ' + polinomio(dentro) + ' todavía tiene ' + (m - mm === 1 ? 'una x' : potencia(m - mm)) +
          ' en común. Sácala también: ' + correcta.h + '.' });
    }
    // El 1 que se pierde: un término era justo el factor común.
    if (Q[0] === 1 || Q[0] === -1) {
      if (m >= 1 || tQ.length >= 3) {
        var sinUno = Q.slice(); sinUno[0] = 0;
        cand.push({ peso: 4, val: forma(G, m, sinUno),
          err: monomio(P[m], m) + ' ÷ ' + divisor(G, m) + ' = ' + num(Q[0]) + ': cuando un término es igual al factor común, adentro queda un ' +
            (Q[0] < 0 ? MENOS + '1' : '1') + ', no nada. Va ' + correcta.h + '.' });
      }
    }
    if (s < 0) {
      // No cambiar los signos de adentro al sacar un negativo.
      var sinCambiar = Q.map(function (c, i) { return i === grado(Q) ? c : -c; });
      cand.push({ peso: 4, val: forma(G, m, sinCambiar),
        err: 'Al sacar un factor negativo, cada término de adentro cambia de signo: ' + monomio(tP[1].c, tP[1].g) + ' ÷ ' +
          divisor(G, m) + ' = ' + monomio(tQ[1].c, tQ[1].g) + '. Va ' + correcta.h + '.' });
      // Olvidar el menos: da la expresión con todos los signos cambiados.
      cand.push({ peso: 3, val: forma(-G, m, Q),
        err: 'El primer término es negativo: el factor común lleva el menos, ' + tG + '. Así como está da ' + polinomio(escala(P, -1)) + '.' });
    } else {
      // Cambiar el signo de un término negativo de adentro.
      var negativos = tQ.filter(function (t) { return t.c < 0; });
      if (negativos.length) {
        var tn = azar(negativos), volteado = Q.slice();
        volteado[tn.g] = -tn.c;
        cand.push({ peso: 3, val: forma(G, m, volteado),
          err: monomio(P[tn.g + m], tn.g + m) + ' ÷ ' + divisor(G, m) + ' = ' + monomio(tn.c, tn.g) + ': el signo se queda. Va ' + correcta.h + '.' });
      }
    }
    // Dividir un término sólo entre la x, no entre el número.
    if (g >= 2) {
      var tj = azar(tQ.slice(1)), mal = Q.slice();
      mal[tj.g] = G * tj.c;
      cand.push({ peso: 3, val: forma(G, m, mal),
        err: monomio(P[tj.g + m], tj.g + m) + ' ÷ ' + divisor(G, m) + ' = ' + monomio(tj.c, tj.g) + ', no ' + monomio(G * tj.c, tj.g) +
          ': cada término se divide entre todo el factor común, número incluido.' });
    }
    // Sacar el factor común sin dividir nada.
    cand.push({ peso: 1, val: forma(G, m, P),
      err: 'Lo que sale se divide de cada término: ' + tP.map(function (t) {
        return monomio(t.c, t.g) + ' ÷ ' + divisor(G, m) + ' = ' + monomio(t.c / G, t.g - m);
      }).join(', ') + '.' });

    // A lo más dos «no está completa» (una en el nivel 1), para que también haya errores de cuenta.
    var orden = ordenConPesos(cand), incompletas = 0;
    orden = orden.filter(function (c) {
      if (c.completo !== false) return true;
      incompletas++;
      return incompletas <= (nivel === 1 ? 1 : 2);
    });

    var numeros = tP.map(function (t) { return Math.abs(t.c); });
    var pasos = [
      'Lo que se repite: el número más grande que divide a ' + lista(numeros) + ' es ' + g +
        (m >= 1 ? ', y todos los términos traen al menos ' + (m === 1 ? 'una x' : potencia(m)) : '') + '. Sale <b>' + tG + '</b>' +
        (s < 0 ? ', con el menos porque el primer término es negativo.' : '.'),
      'Divide cada término: ' + tP.map(function (t) {
        return monomio(t.c, t.g) + ' ÷ ' + divisor(G, m) + ' = ' + monomio(t.c / G, t.g - m);
      }).join(', ') + '.',
      'Queda <b>' + correcta.h + '</b>. Si multiplicas, regresas a ' + enunciado + '.'
    ];
    return armar(enunciado, correcta, orden, { tema: 'Factor común', ask: 'Factoriza por completo', pasos: pasos });
  }

  function lista(numeros) {
    if (numeros.length === 2) return numeros[0] + ' y ' + numeros[1];
    return numeros.slice(0, -1).join(', ') + ' y ' + numeros[numeros.length - 1];
  }

  /* =====================================================================
     fact-completa · por completo
     Niveles 1 y 2: P = k·x^g · (caso), donde el caso es una diferencia de cuadrados, un
     trinomio x² + bx + c o un trinomio cuadrado perfecto. Nivel 3: además, trinomios
     ax² + bx + c sin factor común (a = 2, 3 o 5), que salen con la tijera.
     ===================================================================== */
  function genCompleta(nivel) {
    for (var intento = 0; intento < 60; intento++) {
      var e = (nivel === 3 && Math.random() < 0.6) ? intentaTijera() : intentaCompleta(nivel);
      if (e) return e;
    }
    throw new Error('fact-completa: no salió un ejercicio');
  }

  function intentaCompleta(nivel) {
    var caso = azar(['dif', 'tri', 'tri', 'tcp']);
    var k, g = 0;
    if (nivel === 1) k = azar([2, 3, 4, 5]);
    else if (nivel === 2) {
      if (Math.random() < 0.3) { g = 1; k = azar([1, 1, 2, 3]); }
      else k = azar([2, 3, 4, 5]) * (Math.random() < 0.35 ? -1 : 1);
    } else {
      if (Math.random() < 0.5) { g = 1; k = azar([1, 2, 3, 4]) * (Math.random() < 0.4 ? -1 : 1); }
      else k = azar([2, 3, 4, 5, 6]) * (Math.random() < 0.4 ? -1 : 1);
    }
    var factores, interior, nombre, explica;
    if (caso === 'dif') {
      var a = rint(nivel === 1 ? 2 : 1, nivel === 1 ? 6 : 7);
      factores = [{ a: 1, b: a }, { a: 1, b: -a }];
      interior = [-a * a, 0, 1];
      nombre = 'es una diferencia de cuadrados';
      explica = 'las raíces son x y ' + a;
    } else if (caso === 'tcp') {
      var t = rint(1, nivel === 1 ? 5 : 6) * (nivel >= 2 ? signo() : 1);
      factores = [{ a: 1, b: t }, { a: 1, b: t }];
      interior = [t * t, 2 * t, 1];
      nombre = 'es un trinomio cuadrado perfecto';
      explica = 'x² y ' + (t * t) + ' son cuadrados y ' + num(2 * t) + 'x es el doble de x · ' + (t < 0 ? '(' + num(t) + ')' : t);
    } else {
      var p, q;
      do {
        p = rint(1, nivel === 1 ? 6 : 7) * (nivel >= 2 ? signo() : 1);
        q = rint(1, nivel === 1 ? 6 : 7) * (nivel >= 2 ? signo() : 1);
      } while (p === q || p === -q);
      factores = [{ a: 1, b: p }, { a: 1, b: q }];
      interior = [p * q, p + q, 1];
      nombre = 'sale con ' + num(p) + ' y ' + num(q);
      explica = 'multiplicados dan ' + num(p * q) + ' y sumados, ' + num(p + q);
    }
    var P = corre(escala(interior, k), g);
    if (P.some(function (c) { return Math.abs(c) > 150; })) return null;
    var enunciado = polinomio(P);
    var correcta = forma(k, g, null, factores);
    var afuera = monomio(k, g);
    var cand = [];

    // Quedarse a la mitad: sacar lo común y no seguir.
    cand.push({ val: forma(k, g, interior),
      err: 'Es igual, pero no está completa: ' + polinomio(interior) + ' todavía se factoriza, ' + nombre + '. Va ' + correcta.h + '.' });
    // Perder lo que se sacó.
    var sinComun = forma(1, 0, null, factores);
    cand.push({ val: sinComun,
      err: 'Se perdió ' + (g && Math.abs(k) === 1 ? 'la ' : 'el ') + afuera + ' que sacaste: ' + sinComun.h + ' da ' + polinomio(interior) + ', no ' + enunciado + '.' });
    // Un error en el caso.
    var errores = [];
    if (k < 0) errores.push({ val: forma(-k, g, null, factores),
      err: 'El primer término es negativo: lo que sale lleva el menos, ' + afuera + '. Así como está da ' + polinomio(escala(P, -1)) + '.' });
    if (caso === 'dif') {
      var a2 = factores[0].b;
      errores.push({ val: forma(k, g, null, [{ a: 1, b: -a2 }, { a: 1, b: -a2 }]),
        err: '(x ' + MENOS + ' ' + a2 + ')² da ' + polinomio([a2 * a2, -2 * a2, 1]) + ': para ' + polinomio(interior) + ' van signos opuestos, (x + ' + a2 + ')(x ' + MENOS + ' ' + a2 + ').' });
      if (a2 >= 2) errores.push({ val: forma(k, g, null, [{ a: 1, b: a2 * a2 }, { a: 1, b: -a2 * a2 }]),
        err: 'Va la raíz de ' + (a2 * a2) + ', que es ' + a2 + ', no el ' + (a2 * a2) + ' completo.' });
    } else if (caso === 'tcp') {
      var t2 = factores[0].b;
      errores.push({ val: forma(k, g, null, [{ a: 1, b: t2 }, { a: 1, b: -t2 }]),
        err: '(x + ' + Math.abs(t2) + ')(x ' + MENOS + ' ' + Math.abs(t2) + ') da ' + polinomio([-t2 * t2, 0, 1]) + ': falta el término de en medio. ' +
          polinomio(interior) + ' es (x ' + (t2 < 0 ? MENOS : '+') + ' ' + Math.abs(t2) + ')².' });
      errores.push({ val: forma(k, g, null, [{ a: 1, b: -t2 }, { a: 1, b: -t2 }]),
        err: 'El binomio lleva el signo del término de en medio, ' + num(2 * t2) + 'x: va (x ' + (t2 < 0 ? MENOS : '+') + ' ' + Math.abs(t2) + ')².' });
      if (Math.abs(t2) >= 2) errores.push({ val: forma(k, g, null, [{ a: 1, b: 2 * t2 }, { a: 1, b: 2 * t2 }]),
        err: 'Va la raíz del último término, √' + (t2 * t2) + ' = ' + Math.abs(t2) + ', no el ' + Math.abs(2 * t2) + ' del término de en medio.' });
    } else {
      var p2 = factores[0].b, q2 = factores[1].b;
      errores.push({ val: forma(k, g, null, [{ a: 1, b: -p2 }, { a: 1, b: -q2 }]),
        err: 'Signos al revés: ' + num(-p2) + ' y ' + num(-q2) + ' suman ' + num(-(p2 + q2)) + ', y el término de en medio pide ' + num(p2 + q2) + '.' });
      errores.push({ val: forma(k, g, null, [{ a: 1, b: p2 }, { a: 1, b: -q2 }]),
        err: num(p2) + ' y ' + num(-q2) + ' multiplicados dan ' + num(-p2 * q2) + ', y el último término pide ' + num(p2 * q2) + ': revisa los signos.' });
    }
    cand.push(azar(errores));

    var pasos = [
      'Lo que se repite: ' + (g ? 'todos los términos traen ' + (Math.abs(k) > 1 ? 'un ' + Math.abs(k) + ' y ' : '') + 'una x' : 'todos los coeficientes son múltiplos de ' + Math.abs(k)) +
        (k < 0 ? ', y el primero es negativo' : '') + '. Sale ' + afuera + ': <b>' + forma(k, g, interior).h + '</b>.',
      polinomio(interior) + ' ' + nombre + ': ' + explica + '.',
      'Queda <b>' + correcta.h + '</b>.'
    ];
    return armar(enunciado, correcta, cand, { tema: 'Factorización completa', ask: 'Factoriza por completo', pasos: pasos });
  }

  // ax² + bx + c = (ax + b₁)(x + b₂), con a primo: la tijera.
  function intentaTijera() {
    var a = azar([2, 3, 5]);
    var b1, b2;
    do {
      b1 = rint(1, 5) * signo();
      b2 = rint(1, 6) * signo();
    } while (b1 % a === 0 || b1 === b2 || a * b2 + b1 === 0);
    var correcta = forma(1, 0, null, [{ a: a, b: b1 }, { a: 1, b: b2 }]);
    var P = correcta.poli;
    var enunciado = polinomio(P);
    var b = P[1], c = P[0];
    var cand = [];
    var cruz = forma(1, 0, null, [{ a: a, b: b2 }, { a: 1, b: b1 }]);
    cand.push({ val: cruz,
      err: 'En cruz no da: ' + cruz.h + ' da ' + polinomio(cruz.poli) + '. Prueba al revés: ' + num(a) + 'x · ' + (b2 < 0 ? '(' + num(b2) + ')' : b2) +
        ' + ' + (b1 < 0 ? '(' + num(b1) + ')' : b1) + ' · x = ' + num(b) + 'x.' });
    var volteados = forma(1, 0, null, [{ a: a, b: -b1 }, { a: 1, b: -b2 }]);
    cand.push({ val: volteados,
      err: 'Signos al revés: así el término de en medio sale ' + num(-b) + 'x, no ' + num(b) + 'x.' });
    var sinA = forma(1, 0, null, [{ a: 1, b: b1 }, { a: 1, b: b2 }]);
    cand.push({ val: sinA,
      err: 'Falta el ' + a + ' del ' + a + 'x²: ' + sinA.h + ' da ' + polinomio(sinA.poli) + '.' });
    var unSigno = forma(1, 0, null, [{ a: a, b: b1 }, { a: 1, b: -b2 }]);
    cand.push({ val: unSigno,
      err: 'El último término tiene que dar ' + num(c) + ', y ' + num(b1) + ' · ' + (b2 > 0 ? '(' + num(-b2) + ')' : num(-b2)) + ' = ' + num(-c) + ': revisa los signos.' });
    var pasos = [
      'Los extremos: ' + a + 'x² = ' + a + 'x · x, y ' + num(c) + ' = ' + num(b1) + ' · ' + (b2 < 0 ? '(' + num(b2) + ')' : b2) + '. Se acomodan en (' + a + 'x …)(x …).',
      'En cruz: ' + a + 'x · ' + (b2 < 0 ? '(' + num(b2) + ')' : b2) + ' + ' + (b1 < 0 ? '(' + num(b1) + ')' : b1) + ' · x = ' + num(b) + 'x, el término de en medio.',
      'Queda <b>' + correcta.h + '</b>.'
    ];
    return armar(enunciado, correcta, barajar(cand), { tema: 'Trinomio ax² + bx + c', ask: 'Factoriza por completo', pasos: pasos });
  }

  M.GENERADORES['fact-comun'] = genComun;
  M.GENERADORES['fact-completa'] = genCompleta;
})();
