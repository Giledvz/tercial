/*
 * ejercicios-productos-notables.js — generadores de la semana 5 de Matemáticas: Productos notables.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se carga después
 * de él. El motor ya trae prod-notables, que mezcla los tipos en un solo generador; la práctica
 * necesita un generador por subtema, uno para cada modo:
 *
 *   pn-cuadrado    binomio al cuadrado: (x ± 5)², luego (3x − 2)² y (5 − x)², luego (2a + 3b)² y (x² − 4)²
 *   pn-conjugados  binomios conjugados: (x + 6)(x − 6), luego (3x + 2)(3x − 2) y (5 + x)(5 − x),
 *                  luego (2a + 3b)(2a − 3b) y (x² + 4)(x² − 4)
 *   pn-comun       binomios con término común: (x + 3)(x + 5), luego con signos, luego (2x + 3)(2x − 5)
 *                  y (x² + 3)(x² − 5)
 *   pn-cubo        binomio al cubo: (x + 2)³, luego (x − 3)³, luego (2x − 1)³
 *   pn-todo        todo junto; el cubo sólo aparece en el nivel 3
 *   pn-motor       prod-notables del motor, tal cual, para el reto relámpago
 *
 * Cada uno devuelve { enunciado, correcta, opciones: [{ val, ok, err }], meta } como los del motor:
 * las tres opciones falsas son errores de verdad, cada una con su explicación, y meta.pasos trae
 * la solución. Las respuestas son polinomios exactos (enteros): un término es { c, v }, su
 * coeficiente y sus letras con exponente ({ x: 2 } es x²). La clave de una respuesta no depende
 * del orden de sus términos, así que dos opciones nunca valen lo mismo.
 * Ninguno pone un producto de la tarea (ni con otra letra): daría su respuesta. Ver TAREA, abajo.
 * Para multiplicar se escribe 2(3x)(−2), con paréntesis; × sólo va entre números: 2 × 5.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';
  var SUPER = { 2: '²', 3: '³', 4: '⁴' };

  /* ---------- Azar ---------- */
  function azar(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function elige(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function moneda() { return Math.random() < 0.5; }
  function signo() { return moneda() ? 1 : -1; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- Números y términos ---------- */
  function num(n) { return n < 0 ? MENOS + (-n) : String(n); }
  function par(n) { return n < 0 ? '(' + MENOS + (-n) + ')' : String(n); }

  // Un término: coeficiente entero y letras con su exponente.
  function T(c, v) {
    var letras = {};
    if (typeof v === 'string') { if (v) letras[v] = 1; } else for (var k in v) letras[k] = v[k];
    return { c: c, v: letras };
  }
  function letras(t) {
    return Object.keys(t.v).filter(function (k) { return t.v[k]; }).sort().map(function (k) {
      return k + (t.v[k] === 1 ? '' : SUPER[t.v[k]]);
    }).join('');
  }
  function por(a, b) {
    var v = {}, k;
    for (k in a.v) v[k] = (v[k] || 0) + a.v[k];
    for (k in b.v) v[k] = (v[k] || 0) + b.v[k];
    return { c: a.c * b.c, v: v };
  }
  function veces(n, t) { return { c: n * t.c, v: t.v }; }
  function cuadrado(t) { return por(t, t); }
  function cubo(t) { return por(por(t, t), t); }
  function opuesto(t) { return veces(-1, t); }
  function absT(t) { return { c: Math.abs(t.c), v: t.v }; }
  function esNumero(t) { return letras(t) === ''; }
  // Una letra sola, sin coeficiente ni exponente: x, a, m.
  function esLetra(t) { return t.c === 1 && Object.keys(t.v).length === 1 && t.v[Object.keys(t.v)[0]] === 1; }

  // Un término escrito: 3x, −x, 12xy, 25, −8.
  function mono(t) {
    var l = letras(t);
    if (l === '') return num(t.c);
    if (t.c === 1) return l;
    if (t.c === -1) return MENOS + l;
    return num(t.c) + l;
  }
  // Un polinomio en el orden en que se dan sus términos: 9x² − 12x + 4.
  function poli(lista) {
    var s = '';
    lista.forEach(function (t) {
      if (!t || t.c === 0) return;
      var a = mono(absT(t));
      s += s === '' ? (t.c < 0 ? MENOS : '') + a : (t.c < 0 ? ' ' + MENOS + ' ' : ' + ') + a;
    });
    return s || '0';
  }
  // Clave que no depende del orden: junta los términos semejantes.
  function clave(lista) {
    var suma = {};
    lista.forEach(function (t) { if (t) suma[letras(t)] = (suma[letras(t)] || 0) + t.c; });
    return 'pn:' + Object.keys(suma).filter(function (l) { return suma[l] !== 0; }).sort().map(function (l) {
      return l + '=' + suma[l];
    }).join('|');
  }
  function respuesta(lista) { return { k: clave(lista), h: poli(lista) }; }

  // Un binomio escrito: (3x − 2), (5 − x), (x² + 4).
  function binomio(a, b) { return '(' + mono(a) + (b.c < 0 ? ' ' + MENOS + ' ' : ' + ') + mono(absT(b)) + ')'; }
  // El cuadrado o el cubo de un término, como se escribe antes de calcularlo: x², 5², (−5)², (3x)².
  function potencia(t, n) {
    if (esLetra(t) || (esNumero(t) && t.c > 0)) return mono(t) + SUPER[n];
    return '(' + mono(t) + ')' + SUPER[n];
  }
  // «(3x)² = 9x²»; si no hay nada que calcular, sólo «x²».
  function cuadradoTexto(t) {
    return esLetra(t) ? mono(cuadrado(t)) : potencia(t, 2) + ' = ' + mono(cuadrado(t));
  }
  function cuboTexto(t) {
    return esLetra(t) ? mono(cubo(t)) : potencia(t, 3) + ' = ' + mono(cubo(t));
  }

  // La correcta y tres falsas distintas: primero las principales, luego otras al azar.
  function armar(enunciado, correcta, principales, otras, meta) {
    var vistas = {};
    vistas[clave(correcta)] = true;
    var elegidas = [];
    principales.concat(barajar(otras)).forEach(function (f) {
      if (!f || elegidas.length >= 3) return;
      var k = clave(f.t);
      if (vistas[k]) return;
      vistas[k] = true;
      elegidas.push(f);
    });
    var opciones = [{ val: respuesta(correcta), ok: true }].concat(elegidas.map(function (f) {
      return { val: respuesta(f.t), ok: false, err: f.err };
    }));
    return {
      enunciado: enunciado,
      correcta: respuesta(correcta),
      opciones: barajar(opciones),
      meta: Object.assign({ ask: 'Desarrolla' }, meta)
    };
  }

  /* ---------- Binomio al cuadrado: (a + b)² = a² + 2ab + b² ---------- */
  function genCuadrado(nivel) {
    var a, b;
    if (nivel === 1) {
      a = T(1, elige(['x', 'x', 'a', 'y', 'm']));
      b = T(azar(2, 9) * signo(), '');
    } else if (nivel === 2) {
      if (Math.random() < 0.65) { a = T(azar(2, 5), 'x'); b = T(azar(1, 9) * signo(), ''); }
      else { a = T(azar(2, 9), ''); b = T(signo(), 'x'); }                       // (5 − x)²
    } else if (Math.random() < 0.6) {
      var dos = elige([['x', 'y'], ['a', 'b'], ['m', 'n']]);
      var c1 = azar(1, 6), c2 = azar(1, 6);
      if (c1 === 1 && c2 === 1) c2 = azar(2, 6);
      a = T(c1, dos[0]); b = T(c2 * signo(), dos[1]);                            // (2a + 3b)²
    } else {
      a = T(azar(1, 3), { x: 2 }); b = T(azar(1, 9) * signo(), '');            // (x² − 4)²
    }
    var a2 = cuadrado(a), b2 = cuadrado(b), ab = por(a, b), doble = veces(2, ab);
    var correcta = [a2, doble, b2];
    var dobleTexto = '2(' + mono(a) + ')(' + mono(b) + ') = ' + mono(doble);
    var faltaDoble = { t: [a2, b2], err: 'Te faltó el <strong>doble producto</strong>, ' + dobleTexto +
      ': un binomio al cuadrado da tres términos, no dos.' };
    var conjugados = { t: [a2, opuesto(b2)], err: poli([a2, opuesto(b2)]) + ' es el producto de los <strong>conjugados</strong> ' +
      binomio(a, absT(b)) + binomio(a, opuesto(absT(b))) + '. Aquí el binomio se multiplica por sí mismo.' };
    var sinDos = { t: [a2, ab, b2], err: 'El término de en medio lleva el <strong>2</strong>: son dos rectángulos iguales, ' + dobleTexto + '.' };
    var otras = [sinDos];
    if (b.c < 0) {
      otras.push(
        { t: [a2, doble, opuesto(b2)], err: 'El último término es un cuadrado, y un cuadrado <strong>nunca es negativo</strong>: ' + cuadradoTexto(b) + '.' },
        { t: [a2, opuesto(doble), b2], err: 'El doble producto lleva el <strong>signo del binomio</strong>: ' + dobleTexto + '.' });
    } else {
      otras.push(conjugados);
      if (esNumero(b)) otras.push({ t: [a2, doble, b], err: 'Falta elevar el segundo término: ' + cuadradoTexto(b) + ', no ' + mono(b) + '.' });
    }
    if (esNumero(b) && Math.abs(b.c) >= 3) {
      otras.push({ t: [a2, doble, veces(2, absT(b))], err: 'Elevar al cuadrado no es multiplicar por 2: ' +
        Math.abs(b.c) + '² = ' + Math.abs(b.c) + ' × ' + Math.abs(b.c) + ' = ' + b2.c + '.' });
    }
    if (esNumero(a) && a.c >= 3) {
      otras.push({ t: [veces(2, a), doble, b2], err: 'Elevar al cuadrado no es multiplicar por 2: ' +
        a.c + '² = ' + a.c + ' × ' + a.c + ' = ' + a2.c + '.' });
    }
    if (Math.abs(a.c) !== 1 && !esNumero(a)) {
      otras.push(
        { t: [T(a.c, a2.v), doble, b2], err: 'El coeficiente también se eleva: ' + cuadradoTexto(a) + ', no ' + mono(T(a.c, a2.v)) + '.' },
        { t: [a2, veces(2, por(T(1, a.v), b)), b2], err: 'En el doble producto entra todo el primer término, con su ' + a.c + ': ' + dobleTexto + '.' });
    }
    if (!esNumero(b) && Math.abs(b.c) !== 1) {
      otras.push({ t: [a2, doble, T(Math.abs(b.c), b2.v)], err: 'El coeficiente también se eleva: ' + cuadradoTexto(b) + ', no ' + mono(T(Math.abs(b.c), b2.v)) + '.' });
    }
    // El olvido del doble producto es el error más común: siempre está. Con resta, también el de los conjugados.
    var principales = b.c < 0 ? barajar([faltaDoble, conjugados]) : [faltaDoble];
    return armar(binomio(a, b) + '²', correcta, principales, otras, {
      tema: 'Binomio al cuadrado',
      pasos: [
        'Cuadrado del primero: <b>' + cuadradoTexto(a) + '</b>.',
        'Doble producto del primero por el segundo: <b>' + dobleTexto + '</b>.',
        'Cuadrado del segundo: <b>' + cuadradoTexto(b) + '</b>' + (b.c < 0 ? ', positivo: un cuadrado nunca es negativo.' : '.'),
        'Queda: <b>' + poli(correcta) + '</b>.'
      ]
    });
  }

  /* ---------- Binomios conjugados: (a + b)(a − b) = a² − b² ---------- */
  function genConjugados(nivel) {
    var a, b;
    if (nivel === 1) {
      a = T(1, elige(['x', 'x', 'a', 'y', 'm'])); b = T(azar(2, 12), '');
    } else if (nivel === 2) {
      if (Math.random() < 0.6) { a = T(azar(2, 6), 'x'); b = T(azar(1, 9), ''); }
      else { a = T(azar(2, 12), ''); b = T(1, 'x'); }                           // (5 + x)(5 − x)
    } else if (Math.random() < 0.6) {
      var dos = elige([['x', 'y'], ['a', 'b'], ['m', 'n']]);
      var c1 = azar(1, 7), c2 = azar(1, 7);
      if (c1 === 1 && c2 === 1) c1 = azar(2, 7);
      a = T(c1, dos[0]); b = T(c2, dos[1]);                                     // (2a + 3b)(2a − 3b)
    } else {
      a = T(azar(1, 3), { x: 2 }); b = T(azar(2, 9), '');                      // (x² + 4)(x² − 4)
    }
    // El que lleva el menos puede ir primero o segundo: (x − 6)(x + 6) también son conjugados.
    var enunciado = moneda() ? binomio(a, b) + binomio(a, opuesto(b)) : binomio(a, opuesto(b)) + binomio(a, b);
    var a2 = cuadrado(a), b2 = cuadrado(b), ab = por(a, b), doble = veces(2, ab);
    var correcta = [a2, opuesto(b2)];
    var otras = [
      { t: [a2, opuesto(doble), opuesto(b2)], err: 'No hay término de en medio: los productos cruzados, +' + mono(ab) +
        ' y ' + MENOS + mono(ab) + ', <strong>se cancelan</strong>.' },
      { t: [a2, opuesto(doble), b2], err: 'Eso es ' + binomio(a, opuesto(b)) + '², un binomio al cuadrado. En los conjugados uno lleva + y el otro ' +
        MENOS + ': el término de en medio se cancela.' }
    ];
    // Con el número primero, (5 + x)(5 − x), el error típico es voltear la resta.
    var alReves = esNumero(a) ? { t: [b2, opuesto(a2)], err: 'Al revés: se resta el cuadrado del término que cambia de signo, que aquí es ' +
      mono(b) + '. Queda ' + poli(correcta) + '.' } : null;
    if (!esNumero(a) && Math.abs(a.c) !== 1) {
      otras.push({ t: [T(a.c, a2.v), opuesto(b2)], err: 'El coeficiente también se eleva: ' + cuadradoTexto(a) + ', no ' + mono(T(a.c, a2.v)) + '.' });
      if (a.c >= 3) otras.push({ t: [T(2 * a.c, a2.v), opuesto(b2)], err: '(' + mono(a) + ')(' + mono(a) + ') = ' + mono(a2) +
        ': los coeficientes se multiplican, ' + a.c + ' × ' + a.c + ' = ' + a2.c + '; no se suman.' });
    }
    if (!esNumero(b) && Math.abs(b.c) !== 1) {
      otras.push({ t: [a2, T(-b.c, b2.v)], err: 'El coeficiente también se eleva: ' + cuadradoTexto(b) + ', no ' + mono(T(b.c, b2.v)) + '.' });
    }
    if (esNumero(b) && b.c >= 3) {
      otras.push({ t: [a2, T(-2 * b.c, '')], err: 'Elevar al cuadrado no es multiplicar por 2: ' + b.c + '² = ' + b.c + ' × ' + b.c + ' = ' + b2.c + '.' });
    }
    if (esNumero(a) && a.c >= 3) {
      otras.push({ t: [T(2 * a.c, ''), opuesto(b2)], err: 'Elevar al cuadrado no es multiplicar por 2: ' + a.c + '² = ' + a.c + ' × ' + a.c + ' = ' + a2.c + '.' });
    }
    var principal = { t: [a2, b2], err: 'Entre los dos cuadrados va un <strong>menos</strong>: el último término sale de (+' + mono(b) +
      ')(' + MENOS + mono(b) + ') = ' + MENOS + mono(b2) + '.' };
    return armar(enunciado, correcta, alReves ? [principal, alReves] : [principal], otras, {
      tema: 'Binomios conjugados',
      pasos: [
        'Son conjugados: los mismos dos términos, una vez con + y otra con ' + MENOS + '.',
        'Los productos cruzados se cancelan: +' + mono(ab) + ' ' + MENOS + ' ' + mono(ab) + ' = 0.',
        'Queda el cuadrado del primero menos el cuadrado del segundo: <b>' + potencia(a, 2) + ' ' + MENOS + ' ' +
          potencia(b, 2) + ' = ' + poli(correcta) + '</b>.'
      ]
    });
  }

  /* ---------- Binomios con término común: (x + p)(x + q) = x² + (p + q)x + pq ---------- */
  function genComun(nivel) {
    var t, p, q, intentos = 0;
    if (nivel === 1) {
      t = T(1, elige(['x', 'x', 'a', 'y', 'm']));
      do { p = azar(1, 9); q = azar(1, 9); } while (p === q);
    } else {
      var forma = nivel === 2 ? 'letra' : elige(['grandes', 'coeficiente', 'cuadrado']);
      t = forma === 'coeficiente' ? T(azar(2, 4), 'x') : forma === 'cuadrado' ? T(1, { x: 2 }) : T(1, elige(['x', 'x', 'a', 'y', 'm']));
      var tope = forma === 'grandes' ? 15 : 9;
      do {
        p = azar(1, tope) * signo(); q = azar(1, tope) * signo(); intentos++;
      } while (intentos < 100 && (p === q || p === -q || (p > 0 && q > 0) || (forma === 'grandes' && Math.abs(p) + Math.abs(q) < 12)));
    }
    var P = T(p, ''), Q = T(q, ''), suma = p + q, producto = p * q;
    var t2 = cuadrado(t), medio = veces(suma, t);
    var correcta = [t2, medio, T(producto, '')];
    var sumaTexto = num(p) + ' + ' + par(q) + ' = ' + num(suma);
    var productoTexto = '(' + num(p) + ')(' + num(q) + ') = ' + num(producto);
    // Con un término común que no es una letra sola (2x, x²), en medio va la suma por ese término.
    var medioTexto = esLetra(t) ? mono(medio) : '(' + num(suma) + ')(' + mono(t) + ') = ' + mono(medio);
    var otras = [
      { t: [t2, veces(producto, t), T(producto, '')], err: 'En medio va la <strong>suma</strong> de los números, ' + sumaTexto + ', no su producto' +
        (esLetra(t) ? '.' : ': ' + medioTexto + '.') },
      { t: [t2, medio, T(suma, '')], err: 'Al final va el <strong>producto</strong> de los números: ' + productoTexto + '.' },
      { t: [t2, T(producto, '')], err: 'Faltaron los productos cruzados: ' + mono(t) + ' por ' + par(q) + ' y ' + par(p) + ' por ' + mono(t) +
        ', que juntos dan ' + mono(medio) + '.' }
    ];
    if (p < 0 || q < 0) {
      otras.push(
        { t: [t2, medio, T(-producto, '')], err: 'Cuida el <strong>signo</strong> del producto: ' + productoTexto + '.' },
        { t: [t2, veces(-suma, t), T(producto, '')], err: 'Cuida el <strong>signo</strong> de la suma: ' + sumaTexto + '.' });
    }
    if (!esLetra(t) && !esNumero(t)) {
      if (t.c !== 1) {
        otras.push(
          { t: [t2, T(suma, t.v), T(producto, '')], err: 'El término de en medio es la suma por el término común: (' + num(suma) + ')(' + mono(t) + ') = ' + mono(medio) + '.' },
          { t: [T(t.c, t2.v), medio, T(producto, '')], err: 'El término común también se eleva: ' + cuadradoTexto(t) + ', no ' + mono(T(t.c, t2.v)) + '.' });
      }
    }
    var invertidos = { t: [t2, veces(producto, t), T(suma, '')], err: esLetra(t)
      ? 'Los <strong>invertiste</strong>: en medio va la suma (' + num(suma) + ') y al final el producto (' + num(producto) + ').'
      : 'Los <strong>invertiste</strong>: en medio va la suma por el término común, ' + medioTexto + ', y al final el producto, ' + productoTexto + '.' };
    var enunciado = binomio(t, P) + binomio(t, Q);
    return armar(enunciado, correcta, [invertidos], otras, {
      tema: 'Binomios con término común',
      pasos: [
        'El término común es ' + mono(t) + '. Su cuadrado: <b>' + cuadradoTexto(t) + '</b>.',
        esLetra(t)
          ? 'En medio, la suma: ' + sumaTexto + ', así que <b>' + mono(medio) + '</b>.'
          : 'En medio, la suma por el término común: <b>' + medioTexto + '</b>.',
        'Al final, el producto: <b>' + productoTexto + '</b>.',
        'Queda: <b>' + poli(correcta) + '</b>.'
      ]
    });
  }

  /* ---------- Binomio al cubo: (a + b)³ = a³ + 3a²b + 3ab² + b³ ---------- */
  function genCubo(nivel) {
    // La fórmula se escribe con a y b: la letra del ejercicio no es ninguna de las dos.
    var a, b;
    if (nivel === 1) { a = T(1, 'x'); b = T(azar(1, 4), ''); }
    else if (nivel === 2) { a = T(1, elige(['x', 'x', 'y', 'm'])); b = T(azar(1, 4) * signo(), ''); }
    else if (Math.random() < 0.6) { a = T(1, elige(['x', 'y', 'm', 'n'])); b = T(azar(2, 5) * signo(), ''); }
    else { a = T(azar(2, 3), 'x'); b = T(azar(1, 3) * signo(), ''); }
    var a2 = cuadrado(a), b2 = cuadrado(b), a3 = cubo(a), b3 = cubo(b);
    var m1 = veces(3, por(a2, b)), m2 = veces(3, por(a, b2));
    var correcta = [a3, m1, m2, b3];
    var m1Texto = '3(' + mono(a2) + ')(' + mono(b) + ') = ' + mono(m1);
    var m2Texto = '3(' + mono(a) + ')(' + mono(b2) + ') = ' + mono(m2);
    var otras = [
      { t: [a3, por(a2, b), por(a, b2), b3], err: 'Los dos términos de en medio llevan un <strong>3</strong>: ' + m1Texto + ' y ' + m2Texto + '.' },
      { t: [a3, veces(2, por(a2, b)), veces(2, por(a, b2)), b3], err: 'Los de en medio llevan <strong>3</strong>, no 2: el 2 es del cuadrado. ' +
        m1Texto + ' y ' + m2Texto + '.' }
    ];
    if (b.c < 0) {
      otras.push(
        { t: [a3, absT(m1), m2, absT(b3)], err: 'Con resta, los signos se alternan: +, ' + MENOS + ', +, ' + MENOS + '. ' + m1Texto +
          ' y ' + cuboTexto(b) + ': un negativo al cubo sigue negativo.' },
        { t: [a3, m1, m2, opuesto(b3)], err: 'Un número negativo al cubo sigue <strong>negativo</strong>: ' + cuboTexto(b) + '.' });
    }
    if (m1.c !== m2.c) {
      otras.push({ t: [a3, T(m2.c, m1.v), T(m1.c, m2.v), b3], err: 'Se cruzaron los de en medio: ' + m1Texto + ' y ' + m2Texto + '.' });
    }
    if (a.c !== 1) {
      otras.push({ t: [T(a.c, a3.v), m1, m2, b3], err: 'El coeficiente también se eleva al cubo: ' + cuboTexto(a) + ', no ' + mono(T(a.c, a3.v)) + '.' });
    }
    if (Math.abs(b.c) >= 2) {
      otras.push({ t: [a3, m1, m2, T(3 * b.c, '')], err: 'Elevar al cubo no es multiplicar por 3: ' + cuboTexto(b) + '.' });
    }
    var principal = { t: [a3, b3], err: 'El cubo no se reparte en la suma: faltan los dos términos de en medio, ' + mono(m1) + ' y ' + mono(m2) + '.' };
    return armar(binomio(a, b) + '³', correcta, [principal], otras, {
      tema: 'Binomio al cubo',
      pasos: [
        'Es el cuadrado por el binomio otra vez: (a + b)³ = a³ + 3a²b + 3ab² + b³, con a = ' + mono(a) + ' y b = ' + mono(b) + '.',
        'Los extremos: <b>' + cuboTexto(a) + '</b> y <b>' + cuboTexto(b) + '</b>.',
        'Los de en medio: <b>' + m1Texto + '</b> y <b>' + m2Texto + '</b>.',
        'Queda: <b>' + poli(correcta) + '</b>.'
      ]
    });
  }

  /* ---------- Lo que no se pregunta: los productos de la tarea ---------- */
  // examenes-pdf/tarea-productos-notables.html. Si la práctica o el reto los pusieran, darían su
  // respuesta. Se compara el resultado desarrollado con las letras renombradas por orden
  // alfabético (x, y): (4a − 5)² y (4x − 5)² cuentan como el mismo, y (7 − x)² como (x − 7)².
  function sinLetras(k) {
    var cuerpo = String(k).replace(/^[a-z]+:/, '');
    var usadas = [];
    (cuerpo.match(/[a-z]/g) || []).forEach(function (l) { if (usadas.indexOf(l) === -1) usadas.push(l); });
    usadas.sort();
    return cuerpo.split('|').map(function (par) {
      return par.replace(/[a-z]/g, function (l) { return 'xyzw'.charAt(usadas.indexOf(l)); });
    }).sort().join('|');
  }
  // La clave de una respuesta, sea de este archivo («pn:») o del motor («p:», coeficientes de x).
  function normal(k) {
    k = String(k);
    if (k.indexOf('p:') === 0) {
      k = clave(k.slice(2).split(',').map(function (c, g) { var v = {}; if (g) v.x = g; return { c: Number(c), v: v }; }));
    }
    return sinLetras(k);
  }
  var TAREA = {};
  function prohibe(lista) { TAREA[normal(clave(lista))] = true; }
  var X1 = T(1, 'x');
  // Binomios al cuadrado (a + b)²: los del ejercicio 1, la figura, los errores y el terreno.
  [[X1, T(6, '')], [X1, T(-5, '')], [T(2, 'x'), T(3, '')], [T(4, 'a'), T(-5, '')], [T(7, ''), T(-1, 'x')], [T(3, 'm'), T(2, 'n')],
    [X1, T(7, '')], [X1, T(9, '')], [X1, T(-4, '')], [X1, T(8, '')]].forEach(function (p) {
    prohibe([cuadrado(p[0]), veces(2, por(p[0], p[1])), cuadrado(p[1])]);
  });
  // Conjugados (a + b)(a − b).
  [[X1, T(8, '')], [T(1, 'a'), T(10, '')], [T(3, 'x'), T(1, '')], [T(6, ''), T(1, 'y')], [T(5, 'm'), T(2, 'n')],
    [T(1, { x: 2 }), T(4, '')], [T(3, 'a'), T(5, '')]].forEach(function (p) {
    prohibe([cuadrado(p[0]), opuesto(cuadrado(p[1]))]);
  });
  // Término común (t + p)(t + q).
  [[X1, 4, 7], [X1, -3, -6], [X1, 9, -2], [X1, -10, 5], [T(1, 'm'), 6, -13], [T(2, 'x'), 1, 5], [X1, 3, 5]].forEach(function (p) {
    prohibe([cuadrado(p[0]), veces(p[1] + p[2], p[0]), T(p[1] * p[2], '')]);
  });
  // Binomios al cubo.
  [[X1, T(3, '')], [X1, T(-1, '')]].forEach(function (p) {
    prohibe([cubo(p[0]), veces(3, por(cuadrado(p[0]), p[1])), veces(3, por(p[0], cuadrado(p[1]))), cubo(p[1])]);
  });

  function sinTarea(gen) {
    return function (nivel) {
      var e;
      for (var intento = 0; intento < 60; intento++) {
        e = gen(nivel);
        if (!TAREA[normal(e.correcta.k)]) return e;
      }
      return e;
    };
  }

  var cuadradoLibre = sinTarea(genCuadrado), conjugadosLibre = sinTarea(genConjugados);
  var comunLibre = sinTarea(genComun), cuboLibre = sinTarea(genCubo);

  /* ---------- Todo junto: el cubo, sólo en el nivel 3 ---------- */
  function genTodo(nivel) {
    var lista = [cuadradoLibre, conjugadosLibre, comunLibre];
    if (nivel === 3) lista.push(cuboLibre);
    return elige(lista)(nivel);
  }

  M.GENERADORES['pn-cuadrado'] = cuadradoLibre;
  M.GENERADORES['pn-conjugados'] = conjugadosLibre;
  M.GENERADORES['pn-comun'] = comunLibre;
  M.GENERADORES['pn-cubo'] = cuboLibre;
  M.GENERADORES['pn-todo'] = genTodo;
  if (M.GENERADORES['prod-notables']) M.GENERADORES['pn-motor'] = sinTarea(M.GENERADORES['prod-notables']);
})();
