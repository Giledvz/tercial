/*
 * ejercicios-expresiones-algebraicas.js — generadores de «Expresiones algebraicas»
 * (Fundamentos, semana 4, Matemáticas) para la práctica sin fin y el reto relámpago.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js): se carga después
 * del motor y antes de practica-sin-fin.js. Cada generador devuelve, como los del motor,
 * { enunciado, correcta, opciones: [{ val, ok, err }], meta }.
 *
 *   expr-semejantes   reduce términos semejantes
 *   expr-monomios     multiplica monomios (en el nivel 3, también los divide)
 *   expr-parentesis   quita los paréntesis con la propiedad distributiva y reduce
 *   expr-valor        valor numérico: sustituye, con signos y potencias
 *
 * Las respuestas son exactas: un polinomio es una lista de términos con coeficiente
 * entero y parte literal ({x: 2, y: 1} es x²y), y dos respuestas son la misma si su
 * forma reducida coincide (la clave k). Cada opción falsa es un error real, con su
 * explicación: sumar exponentes al reducir (x + x = x²), multiplicarlos al multiplicar,
 * distribuir sólo al primer término, el menos delante del paréntesis, (−3)² frente a
 * −3²… Nunca «Resultado incorrecto»: si un ejercicio no junta tres errores distintos,
 * se arma otro.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;

  var MIN = '−';
  var VOLADOS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  /* ---------- Azar ---------- */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function coin(p) { return Math.random() < (p === undefined ? 0.5 : p); }
  function nz(a, b) { var x; do { x = rint(a, b); } while (x === 0); return x; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- Números ---------- */
  function num(n) { return n < 0 ? MIN + Math.abs(n) : String(n); }
  function par(n) { return n < 0 ? '(' + MIN + Math.abs(n) + ')' : String(n); }
  function volado(e) {
    if (e === 1) return '';
    return String(e).split('').map(function (d) { return VOLADOS.charAt(Number(d)); }).join('');
  }
  function potencia(b, e) { var r = 1; for (var i = 0; i < e; i++) r *= b; return r; }
  // Una suma escrita como se lee: [3, −5] → «3 − 5».
  function sumaTexto(lista) {
    return lista.map(function (c, i) {
      return i === 0 ? num(c) : (c < 0 ? ' ' + MIN + ' ' : ' + ') + Math.abs(c);
    }).join('');
  }
  // «a, b y c» (sólo para cuentas con números: con letras se separa con «;»).
  function listaTexto(partes) {
    if (partes.length <= 1) return partes.join('');
    return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
  }

  /* ---------- Términos y polinomios ---------- */
  function lit(obj) { var o = {}; for (var v in obj) if (obj[v]) o[v] = obj[v]; return o; }
  function L1(v, e) { var o = {}; o[v] = e; return o; }
  function T(c, l) { return { c: c, l: lit(l || {}) }; }
  function letras(l) { return Object.keys(l).filter(function (v) { return l[v]; }).sort(); }
  function claveLit(l) { return letras(l).map(function (v) { return v + l[v]; }).join(''); }
  function textoLit(l) { return letras(l).map(function (v) { return v + volado(l[v]); }).join(''); }
  function grado(l) { return letras(l).reduce(function (s, v) { return s + l[v]; }, 0); }
  // Cada exponente por n: (x²y)³ como parte literal → x⁶y³.
  function potLit(l, n) { var o = {}; letras(l).forEach(function (v) { o[v] = l[v] * n; }); return o; }

  // Orden de un polinomio reducido: mayor grado primero; a igual grado, la primera letra
  // (en orden alfabético) con mayor exponente. Los números van al final.
  function compara(a, b) {
    var ga = grado(a.l), gb = grado(b.l);
    if (ga !== gb) return gb - ga;
    var todas = letras(a.l).concat(letras(b.l)).sort();
    for (var i = 0; i < todas.length; i++) {
      var v = todas[i], ea = a.l[v] || 0, eb = b.l[v] || 0;
      if (ea !== eb) return eb - ea;
    }
    return 0;
  }

  // Junta los semejantes (suma sus coeficientes), quita los ceros y ordena.
  function reduce(terminos) {
    var porClave = {}, orden = [];
    terminos.forEach(function (t) {
      var k = claveLit(t.l);
      if (!(k in porClave)) { porClave[k] = T(0, t.l); orden.push(k); }
      porClave[k].c += t.c;
    });
    return orden.map(function (k) { return porClave[k]; })
      .filter(function (t) { return t.c !== 0; })
      .sort(compara);
  }

  function textoTermino(t, primero) {
    var l = textoLit(t.l), abs = Math.abs(t.c);
    var cuerpo = (l && abs === 1) ? l : abs + l;
    if (primero) return (t.c < 0 ? MIN : '') + cuerpo;
    return (t.c < 0 ? ' ' + MIN + ' ' : ' + ') + cuerpo;
  }
  // Tal como vienen, sin reducir.
  function texto(terminos) {
    if (!terminos.length) return '0';
    return terminos.map(function (t, i) { return textoTermino(t, i === 0); }).join('');
  }
  function claveDe(terminos) {
    return terminos.map(function (t) { return t.c + claveLit(t.l); }).join('|') || '0';
  }
  // Respuesta genérica del motor: k para comparar, h para mostrar.
  function resp(terminos) { var r = reduce(terminos); return { k: 'p:' + claveDe(r), h: texto(r) }; }
  function respNum(n) { return resp([T(n)]); }
  function mono(t) { return '(' + textoTermino(t, true) + ')'; }
  function producto(factores) {
    var c = 1, l = {};
    factores.forEach(function (f) {
      c *= f.c;
      letras(f.l).forEach(function (v) { l[v] = (l[v] || 0) + f.l[v]; });
    });
    return T(c, l);
  }
  function negado(t) { return T(-t.c, t.l); }
  function distribuye(factor, terminos) { return terminos.map(function (t) { return producto([factor, t]); }); }

  /* ---------- Ensamble ---------- */
  // La correcta y tres falsas distintas entre sí y de la correcta, en el orden dado.
  // Si no se juntan tres, null: el generador arma otro ejercicio.
  function armar(enunciado, correcta, candidatos, meta) {
    var vistas = {};
    vistas[correcta.k] = true;
    var falsas = [];
    for (var i = 0; i < candidatos.length && falsas.length < 3; i++) {
      var c = candidatos[i];
      if (!c || !c.val || vistas[c.val.k]) continue;
      vistas[c.val.k] = true;
      falsas.push(c);
    }
    if (falsas.length < 3) return null;
    var opciones = [{ val: correcta, ok: true }].concat(falsas.map(function (c) {
      return { val: c.val, ok: false, err: c.err };
    }));
    return { enunciado: enunciado, correcta: correcta, opciones: barajar(opciones), meta: meta };
  }
  // El error de la lección va primero (si aplica); los demás, barajados para que varíen.
  function ordena(principales, resto) {
    return principales.filter(Boolean).concat(barajar(resto.filter(Boolean)));
  }
  function intentar(fn, nivel, id) {
    for (var i = 0; i < 200; i++) {
      var e = fn(nivel);
      if (e) return e;
    }
    throw new Error(id + ': no se pudo armar el ejercicio');
  }

  /* =====================================================================
     expr-semejantes · reduce términos semejantes
     ===================================================================== */
  // Las familias de semejantes, en el orden del polinomio reducido.
  function familias(terminos) {
    var porClave = {}, lista = [];
    terminos.forEach(function (t) {
      var k = claveLit(t.l);
      if (!porClave[k]) { porClave[k] = { l: t.l, terminos: [] }; lista.push(porClave[k]); }
      porClave[k].terminos.push(t);
    });
    lista.forEach(function (f) { f.suma = f.terminos.reduce(function (s, t) { return s + t.c; }, 0); });
    return lista.sort(function (a, b) { return compara(T(1, a.l), T(1, b.l)); });
  }

  function intentoSemejantes(nivel) {
    var terminos = [], i;
    if (nivel === 1) {
      var L = pick(['x', 'a', 'm', 'n', 'p']);
      var nL = pick([2, 2, 3]);
      for (i = 0; i < nL; i++) terminos.push(T(nz(-9, 9), L1(L, 1)));
      for (i = 0; i < (nL === 3 ? 1 : 2); i++) terminos.push(T(nz(-9, 9)));
      if (coin(0.35)) terminos[rint(0, nL - 1)].c = coin() ? 1 : -1;
    } else if (nivel === 2) {
      if (coin(0.6)) {
        var V = pick(['x', 'a', 'm']);
        terminos.push(T(nz(-7, 7), L1(V, 2)), T(nz(-7, 7), L1(V, 2)));
        terminos.push(T(nz(-9, 9), L1(V, 1)), T(nz(-9, 9), L1(V, 1)));
        for (i = 0; i < pick([1, 2]); i++) terminos.push(T(nz(-9, 9)));
      } else {
        var ab = pick([['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']]);
        terminos.push(T(nz(-9, 9), L1(ab[0], 1)), T(nz(-9, 9), L1(ab[0], 1)));
        terminos.push(T(nz(-9, 9), L1(ab[1], 1)), T(nz(-9, 9), L1(ab[1], 1)));
        if (coin(0.5)) terminos.push(T(nz(-9, 9)));
      }
    } else {
      // Dos o tres familias en x y y; a lo más seis términos, para que quepa en un renglón.
      var partes = barajar([{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 2 }, { y: 2 }]).slice(0, pick([2, 3]));
      var extra = partes.length === 2 ? pick(['nada', 'tres', 'numeros']) : 'nada';
      partes.forEach(function (p, k) {
        var n = (k === 0 && extra === 'tres') ? 3 : 2;
        for (var j = 0; j < n; j++) terminos.push(T(nz(-12, 12), p));
      });
      // A veces una familia se cancela por completo: 4xy − 4xy = 0.
      if (coin(0.3)) {
        var f0 = terminos.filter(function (t) { return claveLit(t.l) === claveLit(partes[partes.length - 1]); });
        if (f0.length === 2) f0[1].c = -f0[0].c;
      }
      if (extra === 'numeros') terminos.push(T(nz(-9, 9)), T(nz(-9, 9)));
      if (coin(0.3)) terminos[rint(0, terminos.length - 1)].c = coin() ? 1 : -1;
    }
    terminos = barajar(terminos);

    var fam = familias(terminos);
    var correcta = resp(terminos);
    var r = reduce(terminos);
    if (r.length < (nivel === 1 ? 1 : 2)) return null;
    if (!r.some(function (t) { return grado(t.l) > 0; })) return null;
    if (terminos.filter(function (t) { return t.c < 0; }).length < (nivel === 1 ? 1 : 2)) return null;
    var repetidas = fam.filter(function (f) { return f.terminos.length >= 2; });
    var conLetra = fam.filter(function (f) { return grado(f.l) > 0; });
    var ejemplo = repetidas.filter(function (f) { return grado(f.l) > 0 && f.suma !== 0; })[0];
    if (!ejemplo) return null;

    // 1. Sumar exponentes al reducir: 7x + 2x = 9x².
    var malaLit = potLit(ejemplo.l, ejemplo.terminos.length);
    var exponentes = {
      val: resp(fam.map(function (f) {
        return T(f.suma, (f.terminos.length >= 2 && grado(f.l) > 0) ? potLit(f.l, f.terminos.length) : f.l);
      })),
      err: 'Al reducir, la parte literal no cambia: ' + texto(ejemplo.terminos) + ' = ' +
        textoTermino(T(ejemplo.suma, ejemplo.l), true) + ', no ' + textoTermino(T(ejemplo.suma, malaLit), true) +
        '. Los exponentes se suman al multiplicar, no al sumar.'
    };

    var resto = [];
    // 2. Juntar lo que no es semejante.
    var numeros = fam.filter(function (f) { return grado(f.l) === 0; });
    if (conLetra.length >= 2) {
      var sumaLetras = conLetra.reduce(function (s, f) { return s + f.suma; }, 0);
      var a = conLetra[0], b = conLetra[1];
      var noSemejantes = 'Sólo se juntan los semejantes, y la parte literal de ' + textoLit(a.l) + ' no es la de ' + textoLit(b.l) + '.';
      resto.push({ val: resp([T(sumaLetras, a.l)].concat(numeros.map(function (f) { return T(f.suma); }))), err: noSemejantes });
      if (numeros.length) {
        var todo = fam.reduce(function (s, f) { return s + f.suma; }, 0);
        resto.push({ val: resp([T(todo, a.l)]), err: noSemejantes + ' Tampoco los números, que no llevan letra.' });
      }
    } else if (numeros.length) {
      var unica = conLetra[0], sumaNum = numeros[0].suma;
      var total = unica.suma + sumaNum;
      if (sumaNum !== 0 && total !== 0) {
        resto.push({ val: resp([T(total, unica.l)]),
          err: 'Un número sin letra no es semejante a los términos con ' + textoLit(unica.l) + ': ' +
            textoTermino(T(unica.suma, unica.l), true) + ' y ' + num(sumaNum) + ' se quedan separados.' });
      }
    }
    // 3. Perder el menos de un término.
    var negativos = terminos.filter(function (t) {
      return t.c < 0 && fam.some(function (f) { return f.terminos.length >= 2 && f.terminos.indexOf(t) !== -1; });
    });
    if (negativos.length) {
      var tn = pick(negativos);
      resto.push({ val: resp(terminos.map(function (t) { return t === tn ? negado(t) : t; })),
        err: 'El signo es parte del término: ' + textoTermino(tn, true) + ' resta, no suma.' });
    }
    // 4. La regla de los signos (semana 1): con signos distintos, sumar en vez de restar.
    var mixtas = fam.filter(function (f) {
      return f.terminos.length === 2 && (f.terminos[0].c > 0) !== (f.terminos[1].c > 0) && f.suma !== 0;
    });
    if (mixtas.length) {
      var fm = pick(mixtas), c1 = fm.terminos[0].c, c2 = fm.terminos[1].c;
      var malo = (Math.abs(c1) > Math.abs(c2) ? Math.sign(c1) : Math.sign(c2)) * (Math.abs(c1) + Math.abs(c2));
      resto.push({ val: resp(fam.map(function (f) { return T(f === fm ? malo : f.suma, f.l); })),
        err: 'Con signos distintos, los coeficientes se restan: ' + sumaTexto([c1, c2]) + ' = ' + num(c1 + c2) + '.' });
    }
    // 5. La letra sola vale 1: x es 1x.
    var unos = terminos.filter(function (t) { return Math.abs(t.c) === 1 && grado(t.l) > 0; });
    if (unos.length) {
      var tu = pick(unos);
      resto.push({ val: resp(terminos.filter(function (t) { return t !== tu; })),
        err: 'Una letra sola tiene coeficiente 1: ' + textoTermino(tu, true) + ' es ' + num(tu.c) + textoLit(tu.l) + ', y también cuenta.' });
    }

    var grupos = fam.map(function (f) {
      if (f.terminos.length > 1) return '(' + texto(f.terminos) + ')';
      var t = f.terminos[0];
      return t.c < 0 ? '(' + textoTermino(t, true) + ')' : textoTermino(t, true);
    });
    var cuentas = repetidas.map(function (f) {
      return sumaTexto(f.terminos.map(function (t) { return t.c; })) + ' = ' + num(f.suma) + (f.suma === 0 ? ' (se cancelan)' : '');
    });
    var pasos = [
      'Agrupa los semejantes: ' + grupos.join(' + ') + '.',
      'Suma los coeficientes; la parte literal no cambia: ' + listaTexto(cuentas) + '.',
      'Queda <b>' + correcta.h + '</b>.'
    ];
    return armar(texto(terminos), correcta, ordena([exponentes], resto),
      { tema: 'Términos semejantes', ask: 'Reduce', pasos: pasos });
  }
  function genSemejantes(nivel) { return intentar(intentoSemejantes, nivel, 'expr-semejantes'); }

  /* =====================================================================
     expr-monomios · multiplica (y en el nivel 3 divide) monomios
     ===================================================================== */
  function signoTexto(negativos) {
    if (negativos % 2) return (negativos === 1 ? 'Hay un factor negativo' : 'Hay ' + negativos + ' factores negativos, un número impar') + ': el resultado es negativo.';
    return (negativos === 2 ? 'Dos negativos' : negativos + ' negativos') + ' dan positivo: el resultado es positivo.';
  }
  function cuentaExponentes(factores, v) {
    var conV = factores.filter(function (f) { return f.l[v]; });
    var suma = conV.reduce(function (s, f) { return s + f.l[v]; }, 0);
    return conV.map(function (f) { return v + volado(f.l[v]); }).join(' · ') + ' = ' + v + volado(suma);
  }

  function intentoMultiplica(nivel) {
    var dos = nivel >= 2 && coin(0.55);
    var vars = dos ? pick([['x', 'y'], ['a', 'b'], ['m', 'n']]) : [pick(['x', 'a', 'm', 'y'])];
    var nf = nivel === 1 ? 2 : dos ? (nivel === 3 ? pick([2, 3]) : 2) : (nivel === 2 ? pick([2, 3]) : 3);
    var top = nf === 3 ? 5 : 9, maxE = nf === 3 ? 3 : 5;
    var factores = [];
    for (var i = 0; i < nf; i++) {
      var l = {};
      vars.forEach(function (v) { if (i === 0 || !dos || coin(0.7)) l[v] = rint(1, maxE); });
      if (!letras(l).length) l[vars[0]] = rint(1, maxE);
      var c = nz(-top, top);
      if (coin(0.15)) c = coin() ? 1 : -1;
      factores.push(T(c, l));
    }
    if (nivel === 1 && coin(0.6) && factores.every(function (f) { return f.c > 0; })) factores[rint(0, 1)].c *= -1;

    var correcto = producto(factores);
    var correcta = resp([correcto]);
    var enunciado = factores.map(mono).join('');
    var comunes = vars.filter(function (v) { return factores.filter(function (f) { return f.l[v]; }).length >= 2; });
    var negativos = factores.filter(function (f) { return f.c < 0; }).length;
    // «8 · (−2) = −16»: el primero con su signo, los demás entre paréntesis si son negativos.
    var coefTexto = factores.map(function (f, i) { return i === 0 ? num(f.c) : par(f.c); }).join(' · ') + ' = ' + num(correcto.c);

    // 1. Multiplicar los exponentes: x² · x⁵ = x¹⁰.
    var multExp = null, litMult = {};
    vars.forEach(function (v) {
      var es = factores.filter(function (f) { return f.l[v]; }).map(function (f) { return f.l[v]; });
      if (es.length) litMult[v] = es.reduce(function (a, b) { return a * b; }, 1);
    });
    if (comunes.length) {
      multExp = { val: resp([T(correcto.c, litMult)]),
        err: 'Al multiplicar, los exponentes de la misma letra se suman: ' + cuentaExponentes(factores, comunes[0]) + '; no se multiplican.' };
    }
    var resto = [];
    // 2. Sumar los coeficientes.
    var sumaC = factores.reduce(function (s, f) { return s + f.c; }, 0);
    if (sumaC !== 0) {
      resto.push({ val: resp([T(sumaC, correcto.l)]), err: 'Los coeficientes se multiplican: ' + coefTexto + '; no se suman.' });
      // Al revés: sumar los coeficientes y multiplicar los exponentes.
      if (comunes.length) resto.push({ val: resp([T(sumaC, litMult)]),
        err: 'Es al revés: los coeficientes se multiplican, ' + coefTexto + ', y los exponentes se suman.' });
    }
    // 3. El signo.
    if (negativos) resto.push({ val: resp([negado(correcto)]), err: signoTexto(negativos) });
    // 4. Una letra que está en un solo factor se pierde.
    var solas = vars.filter(function (v) { return factores.filter(function (f) { return f.l[v]; }).length === 1; });
    if (solas.length && letras(correcto.l).length > 1) {
      var vs = pick(solas), sinV = lit(correcto.l);
      delete sinV[vs];
      resto.push({ val: resp([T(correcto.c, sinV)]),
        err: 'La ' + vs + ' sólo está en un factor, pero no desaparece: pasa igual al resultado.' });
    }
    // 5. Una letra sin exponente tiene exponente 1.
    var conUno = comunes.filter(function (v) { return factores.some(function (f) { return f.l[v] === 1; }); });
    if (conUno.length) {
      var vu = conUno[0], menos1 = lit(correcto.l);
      menos1[vu] -= factores.filter(function (f) { return f.l[vu] === 1; }).length;
      resto.push({ val: resp([T(correcto.c, menos1)]),
        err: 'Una letra sin exponente tiene exponente 1: ' + cuentaExponentes(factores, vu) + '.' });
    }

    var sumas = comunes.map(function (v) { return cuentaExponentes(factores, v); });
    var pasaIgual = solas.map(function (v) { return 'la ' + v + ' pasa igual'; });
    var pasos = [
      'Coeficientes: ' + coefTexto + '.',
      (sumas.length ? 'Misma letra, se suman los exponentes: ' + sumas.join('; ') : '') +
        (pasaIgual.length ? (sumas.length ? '; ' : '') + pasaIgual.join('; ') : '') + '.',
      'Queda <b>' + correcta.h + '</b>.'
    ];
    pasos[1] = pasos[1].charAt(0).toUpperCase() + pasos[1].slice(1);
    return armar(enunciado, correcta, ordena([multExp], resto),
      { tema: 'Multiplicar monomios', ask: 'Multiplica', pasos: pasos });
  }

  function intentoDivide() {
    var dos = coin(0.6);
    var vars = dos ? pick([['x', 'y'], ['a', 'b'], ['m', 'n']]) : [pick(['x', 'a', 'm'])];
    var B = nz(-6, 6);
    if (Math.abs(B) === 1) B *= rint(2, 5);
    var Q = nz(-7, 7);
    if (Math.abs(Q) === 1 && coin(0.7)) Q *= rint(2, 5);
    var A = B * Q;
    var ln = {}, lr = {}, lm = {};
    vars.forEach(function (v) { ln[v] = rint(1, 4); lr[v] = rint(0, 4); });
    if (!vars.some(function (v) { return lr[v] > 0; })) lr[vars[0]] = rint(1, 3);
    vars.forEach(function (v) { lm[v] = ln[v] + lr[v]; });
    var dividendo = T(A, lm), divisor = T(B, ln), cociente = T(Q, lr);
    var correcta = resp([cociente]);
    var enunciado = mono(dividendo) + ' ÷ ' + mono(divisor);
    function cuenta(v) {
      return v + volado(lm[v]) + ' ÷ ' + v + volado(ln[v]) + ' = ' + (lr[v] ? v + volado(lr[v]) : '1');
    }

    var principales = [];
    // 1. Dividir los exponentes: x⁶ ÷ x² = x³.
    var divisibles = vars.filter(function (v) { return lm[v] % ln[v] === 0 && lm[v] / ln[v] !== lr[v]; });
    if (divisibles.length) {
      var ld = {};
      vars.forEach(function (v) { ld[v] = divisibles.indexOf(v) !== -1 ? lm[v] / ln[v] : lr[v]; });
      principales.push({ val: resp([T(Q, ld)]), err: 'Al dividir, los exponentes se restan: ' + cuenta(divisibles[0]) + '; no se dividen.' });
    }
    // 2. Sumar los exponentes, como al multiplicar.
    var ls = {};
    vars.forEach(function (v) { ls[v] = lm[v] + ln[v]; });
    principales.push({ val: resp([T(Q, ls)]), err: 'Sumaste los exponentes, como al multiplicar. Al dividir se restan: ' + cuenta(vars[0]) + '.' });
    var resto = [];
    // 3. Multiplicar los coeficientes en vez de dividirlos.
    resto.push({ val: resp([T(A * B, lr)]), err: 'Los coeficientes se dividen: ' + num(A) + ' ÷ ' + par(B) + ' = ' + num(Q) + '; no se multiplican.' });
    // 4. El signo.
    var negativos = (A < 0 ? 1 : 0) + (B < 0 ? 1 : 0);
    if (negativos) resto.push({ val: resp([negado(cociente)]), err: negativos === 1
      ? 'Signos distintos dan negativo: ' + num(A) + ' ÷ ' + par(B) + ' = ' + num(Q) + '.'
      : 'Dos negativos dan positivo: ' + num(A) + ' ÷ ' + par(B) + ' = ' + num(Q) + '.' });
    // 5. Lo que se resta a cero no deja la letra: x³ ÷ x³ = 1.
    var ceros = vars.filter(function (v) { return lr[v] === 0; });
    if (ceros.length) {
      var queda = lit(lr);
      queda[ceros[0]] = 1;
      resto.push({ val: resp([T(Q, queda)]), err: cuenta(ceros[0]) + ': la ' + ceros[0] + ' se va por completo.' });
    }
    var pasos = [
      'Coeficientes: ' + num(A) + ' ÷ ' + par(B) + ' = ' + num(Q) + '.',
      'Los exponentes se restan: ' + vars.map(cuenta).join('; ') + '.',
      'Queda <b>' + correcta.h + '</b>.'
    ];
    return armar(enunciado, correcta, ordena(principales.slice(0, 1), principales.slice(1).concat(resto)),
      { tema: 'Dividir monomios', ask: 'Divide', pasos: pasos });
  }

  function intentoMonomios(nivel) { return (nivel === 3 && coin()) ? intentoDivide() : intentoMultiplica(nivel); }
  function genMonomios(nivel) { return intentar(intentoMonomios, nivel, 'expr-monomios'); }

  /* =====================================================================
     expr-parentesis · la propiedad distributiva, con el menos delante
     ===================================================================== */
  function multiplicaTexto(factor, terminos) {
    // «(−3)(2x) = −6x y (−3)(−5) = 15»
    return listaTexto(terminos.map(function (t) {
      return '(' + textoTermino(factor, true) + ')(' + textoTermino(t, true) + ') = ' + textoTermino(producto([factor, t]), true);
    }));
  }
  function interior(V, n) {
    // Dos o tres términos: letra (el primero, casi siempre positivo) y número.
    var t = [T(coin(0.8) ? rint(1, 9) : nz(-9, 9), L1(V, n === 3 ? 2 : 1))];
    if (n === 3) t.push(T(nz(-9, 9), L1(V, 1)));
    t.push(T(nz(-9, 9)));
    return t;
  }

  function intentoParentesis(nivel) {
    var V = pick(['x', 'a', 'm', 'n']);
    var forma = nivel === 1 ? pick(['num', 'num', 'menos'])
      : nivel === 2 ? pick(['negativo', 'resta', 'precede', 'monomio', 'menos3'])
      : pick(['dos', 'dos', 'monomio3', 'precede']);
    var enunciado, expandido, pasos, cands = [], principales = [];
    var adentro, k, c;

    if (forma === 'num' || forma === 'negativo') {
      k = forma === 'num' ? rint(2, 9) : -rint(2, 9);
      adentro = interior(V, 2);
      if (forma === 'num' && adentro[1].c > 0 && coin(0.3)) adentro[1].c *= -1;
      var K = T(k);
      enunciado = num(k) + '(' + texto(adentro) + ')';
      expandido = distribuye(K, adentro);
      principales.push({ val: resp([expandido[0], adentro[1]]),
        err: 'El ' + num(k) + ' multiplica a todos los términos de adentro, también al ' + textoTermino(adentro[1], true) + '.' });
      // El signo del segundo producto, cuando hay un negativo de por medio.
      if (k < 0 || adentro[1].c < 0) cands.push({ val: resp([expandido[0], negado(expandido[1])]),
        err: k < 0
          ? '(' + num(k) + ')(' + num(adentro[1].c) + ') = ' + num(expandido[1].c) + ': ' + (adentro[1].c < 0 ? 'menos por menos da más.' : 'signos distintos dan negativo.')
          : 'Cuida el signo: ' + k + ' · ' + par(adentro[1].c) + ' = ' + num(expandido[1].c) + '.' });
      if (k < 0) cands.push({ val: resp(distribuye(T(-k), adentro)),
        err: 'El factor es ' + num(k) + ', no ' + (-k) + ': su signo también multiplica.' });
      else {
        cands.push({ val: resp([T(k + adentro[0].c, adentro[0].l), expandido[1]]),
          err: 'El ' + k + ' multiplica: ' + k + ' · ' + textoTermino(adentro[0], true) + ' = ' + textoTermino(expandido[0], true) + '; no se suma.' });
        cands.push({ val: resp([T(k + adentro[0].c, adentro[0].l), T(k + adentro[1].c)]),
          err: 'Un número pegado a un paréntesis lo multiplica: ' + k + ' · ' + textoTermino(adentro[0], true) + ' y ' + k + ' · ' +
            par(adentro[1].c) + '; no se suma.' });
      }
      pasos = ['Multiplica el ' + num(k) + ' por cada término de adentro: ' + multiplicaTexto(K, adentro) + '.'];
    } else if (forma === 'menos' || forma === 'menos3') {
      adentro = interior(V, forma === 'menos3' ? 3 : 2);
      enunciado = MIN + '(' + texto(adentro) + ')';
      expandido = adentro.map(negado);
      principales.push({ val: resp([expandido[0]].concat(adentro.slice(1))),
        err: 'El menos de afuera le cambia el signo a todos los términos de adentro, no sólo al primero.' });
      cands.push({ val: resp(adentro),
        err: 'El paréntesis no se quita sin más: el menos de afuera le cambia el signo a cada término.' });
      cands.push({ val: resp([adentro[0]].concat(expandido.slice(1))),
        err: 'El menos de afuera también le cambia el signo al primer término: ' + textoTermino(adentro[0], true) + ' pasa a ' + textoTermino(expandido[0], true) + '.' });
      pasos = ['El menos de afuera es multiplicar por −1: le cambia el signo a cada término. ' + enunciado + ' = ' + texto(expandido) + '.'];
    } else if (forma === 'resta') {
      c = nz(-9, 9);
      adentro = interior(V, 2);
      var primero = T(c, L1(V, 1));
      enunciado = textoTermino(primero, true) + ' ' + MIN + ' (' + texto(adentro) + ')';
      var cambiados = adentro.map(negado);
      expandido = [primero].concat(cambiados);
      principales.push({ val: resp([primero, cambiados[0], adentro[1]]),
        err: 'El menos de afuera le cambia el signo a todos los términos de adentro: también al ' + textoTermino(adentro[1], true) + '.' });
      cands.push({ val: resp([primero].concat(adentro)),
        err: 'El menos de afuera no se pierde: al quitar el paréntesis, cada término de adentro cambia de signo.' });
      var sumaV = c + cambiados[0].c;
      if (sumaV !== 0) cands.push({ val: resp([T(sumaV, L1(V, 2)), cambiados[1]]),
        err: 'Al juntar ' + textoTermino(primero, true) + ' y ' + textoTermino(cambiados[0], true) + ', la parte literal no cambia: queda ' +
          textoTermino(T(sumaV, L1(V, 1)), true) + ', no ' + textoTermino(T(sumaV, L1(V, 2)), true) + '.' });
      pasos = ['El menos le cambia el signo a cada término de adentro: ' + enunciado + ' = ' + texto(expandido) + '.'];
    } else if (forma === 'precede') {
      c = rint(2, 12);
      k = rint(2, 6);
      adentro = [T(rint(1, 4), L1(V, 1)), T(nz(-9, 9))];
      var mk = T(-k);
      enunciado = c + ' ' + MIN + ' ' + k + '(' + texto(adentro) + ')';
      var dist = distribuye(mk, adentro);
      expandido = [T(c)].concat(dist);
      if (c - k !== 0) principales.push({ val: resp(distribuye(T(c - k), adentro)),
        err: 'Primero se multiplica: el ' + k + ' va sólo con el paréntesis y el ' + c + ' se queda aparte.' });
      cands.push({ val: resp([T(c), dist[0], negado(adentro[1])]),
        err: 'El ' + MIN + k + ' multiplica a los dos términos del paréntesis, también al ' + textoTermino(adentro[1], true) + '.' });
      cands.push({ val: resp([T(c), dist[0], negado(dist[1])]),
        err: '(' + MIN + k + ')(' + num(adentro[1].c) + ') = ' + num(dist[1].c) + ': ' +
          (adentro[1].c < 0 ? 'menos por menos da más.' : 'signos distintos dan negativo.') });
      pasos = ['Primero la multiplicación: ' + multiplicaTexto(mk, adentro) + '; el ' + c + ' se queda aparte.',
        'Sin paréntesis: ' + texto(expandido) + '.'];
    } else if (forma === 'monomio' || forma === 'monomio3') {
      var m = nz(-5, 5);
      if (forma === 'monomio3') m = nz(-4, 4);
      adentro = interior(V, forma === 'monomio3' ? 3 : 2);
      var F = T(m, L1(V, 1));
      enunciado = textoTermino(F, true) + '(' + texto(adentro) + ')';
      expandido = distribuye(F, adentro);
      var ultimo = adentro[adentro.length - 1];
      principales.push({ val: resp(expandido.slice(0, -1).concat(T(m * ultimo.c))),
        err: 'La ' + V + ' de afuera también multiplica al ' + num(ultimo.c) + ': queda ' + textoTermino(T(m * ultimo.c, L1(V, 1)), true) + '.' });
      // x · x = x: no sumar el exponente de la letra de afuera.
      var sinSubir = adentro.map(function (t) { return T(m * t.c, grado(t.l) ? t.l : L1(V, 1)); });
      cands.push({ val: resp(sinSubir),
        err: V + ' · ' + textoTermino(adentro[0], true) + ' = ' + textoTermino(producto([T(1, L1(V, 1)), adentro[0]]), true) +
          ': los exponentes de la misma letra se suman.' });
      cands.push({ val: resp([expandido[0]].concat(adentro.slice(1))),
        err: 'El ' + textoTermino(F, true) + ' multiplica a todos los términos de adentro, no sólo al primero.' });
      if (m < 0) cands.push({ val: resp(distribuye(T(-m, L1(V, 1)), adentro)),
        err: 'El factor es ' + textoTermino(F, true) + ': su signo también multiplica a cada término.' });
      pasos = ['Multiplica ' + textoTermino(F, true) + ' por cada término: ' + multiplicaTexto(F, adentro) + '.'];
    } else {
      // dos: k1(…) ± k2(…)
      var k1 = coin(0.8) ? rint(2, 6) : -rint(2, 6);
      var k2 = coin(0.7) ? -rint(2, 6) : rint(2, 6);
      var a1 = [T(rint(1, 6), L1(V, 1)), T(nz(-9, 9))];
      var a2 = [T(rint(1, 6), L1(V, 1)), T(nz(-9, 9))];
      enunciado = num(k1) + '(' + texto(a1) + ') ' + (k2 < 0 ? MIN : '+') + ' ' + Math.abs(k2) + '(' + texto(a2) + ')';
      var d1 = distribuye(T(k1), a1), d2 = distribuye(T(k2), a2);
      expandido = d1.concat(d2);
      principales.push({ val: resp(d1.concat([d2[0], a2[1]])),
        err: 'El ' + num(k2) + ' multiplica a todos los términos de su paréntesis, también al ' + textoTermino(a2[1], true) + '.' });
      cands.push({ val: resp(d1.concat([d2[0], negado(d2[1])])),
        err: '(' + num(k2) + ')(' + num(a2[1].c) + ') = ' + num(d2[1].c) + ': cuida el signo.' });
      if (k2 < 0) cands.push({ val: resp(d1.concat(distribuye(T(-k2), a2))),
        err: 'El ' + num(k2) + ' lleva su signo: multiplica con todo y el menos.' });
      cands.push({ val: resp([d1[0], a1[1]].concat(d2)),
        err: 'El ' + num(k1) + ' multiplica a todos los términos de su paréntesis, también al ' + textoTermino(a1[1], true) + '.' });
      pasos = ['Quita cada paréntesis: ' + num(k1) + '(' + texto(a1) + ') = ' + texto(d1) + '; ' +
        num(k2) + '(' + texto(a2) + ') = ' + texto(d2) + '.'];
    }

    var correcta = resp(expandido);
    var r = reduce(expandido);
    if (r.length < 2) return null;
    if (familias(expandido).some(function (f) { return f.terminos.length >= 2; })) {
      var juntas = familias(expandido).filter(function (f) { return f.terminos.length >= 2; }).map(function (f) {
        return texto(f.terminos) + ' = ' + textoTermino(T(f.suma, f.l), true);
      });
      pasos.push('Junta los semejantes: ' + juntas.join('; ') + '.');
    }
    pasos.push('Queda <b>' + correcta.h + '</b>.');
    return armar(enunciado, correcta, ordena(principales, cands),
      { tema: 'Propiedad distributiva', ask: 'Quita los paréntesis y reduce', pasos: pasos });
  }
  function genParentesis(nivel) { return intentar(intentoParentesis, nivel, 'expr-parentesis'); }

  /* =====================================================================
     expr-valor · valor numérico
     ===================================================================== */
  function valorTermino(t, vals) {
    return letras(t.l).reduce(function (p, v) { return p * potencia(vals[v], t.l[v]); }, t.c);
  }
  // 2x² con x = −2 → «2(−2)²»: cada letra se cambia por su valor entre paréntesis.
  function sustituye(t, vals, primero) {
    var abs = Math.abs(t.c), ls = letras(t.l);
    var cuerpo = (ls.length && abs === 1 ? '' : String(abs)) +
      ls.map(function (v) { return '(' + num(vals[v]) + ')' + volado(t.l[v]); }).join('');
    if (primero) return (t.c < 0 ? MIN : '') + cuerpo;
    return (t.c < 0 ? ' ' + MIN + ' ' : ' + ') + cuerpo;
  }
  // «2(−2)² = 2 · 4 = 8», «−3(−2) = 6», «(−2)³ = −8».
  function cuentaTermino(t, vals) {
    var ls = letras(t.l);
    var hayPotencia = ls.some(function (v) { return t.l[v] >= 2; });
    var factores = (Math.abs(t.c) !== 1 ? [t.c] : []).concat(ls.map(function (v) { return potencia(vals[v], t.l[v]); }));
    var medio = (hayPotencia && factores.length >= 2)
      ? ' = ' + factores.map(function (x, i) { return i === 0 ? num(x) : par(x); }).join(' · ') : '';
    return sustituye(t, vals, true) + medio + ' = ' + num(valorTermino(t, vals));
  }

  function intentoValor(nivel) {
    var vals = {}, terminos, vars, V;
    if (nivel === 1) {
      V = pick(['x', 'a', 'm', 'n']);
      vars = [V];
      vals[V] = rint(2, 5);
      terminos = pick([
        [T(rint(2, 9), L1(V, 1)), T(nz(-9, 9))],
        [T(pick([1, 1, 2, 3]), L1(V, 2)), T(nz(-9, 9), L1(V, 1))],
        [T(rint(2, 5), L1(V, 2)), T(nz(-9, 9))],
        [T(1, L1(V, 2)), T(nz(-9, 9))]
      ]);
      if (terminos[1].c > 0 && coin(0.35)) terminos.reverse();
    } else if (nivel === 2) {
      V = 'x';
      vars = [V];
      vals.x = coin(0.75) ? pick([-1, -2, -2, -3, -3, -4, -5]) : rint(2, 6);
      var forma = pick(['cuad3', 'cuad3', 'menosCuad', 'cubo']);
      if (forma === 'cuad3') terminos = [T(nz(-4, 4), L1(V, 2)), T(nz(-6, 6), L1(V, 1)), T(nz(-9, 9))];
      else if (forma === 'menosCuad') terminos = coin()
        ? [T(-1, L1(V, 2)), T(nz(-6, 6), L1(V, 1))]
        : [T(-rint(1, 3), L1(V, 2)), T(nz(-9, 9))];
      else {
        vals.x = pick([-1, -2, -2, -3, 2, 3]);
        terminos = [T(pick([1, 1, 2, -1]), L1(V, 3)), T(nz(-6, 6), L1(V, 1))];
      }
    } else {
      vars = ['a', 'b'];
      vals.a = nz(-4, 4);
      vals.b = nz(-4, 4);
      if (Math.abs(vals.a) === 1 && Math.abs(vals.b) === 1) return null;
      if (vals.a === vals.b) return null;
      terminos = pick([
        [T(nz(-4, 4), { a: 2, b: 1 }), T(nz(-4, 4), { a: 1, b: 2 })],
        [T(1, { a: 2 }), T(-1, { b: 2 })],
        [T(nz(-5, 5), { a: 1, b: 1 }), T(nz(-4, 4), { b: 2 })],
        [T(1, { a: 2 }), T(nz(-5, 5), { a: 1, b: 1 }), T(nz(-4, 4), { b: 2 })],
        [T(nz(-3, 3), { a: 3 }), T(nz(-6, 6), { b: 1 })]
      ]);
    }
    var total = terminos.reduce(function (s, t) { return s + valorTermino(t, vals); }, 0);
    var correcta = respNum(total);
    var dato = vars.map(function (v) { return v + ' = ' + num(vals[v]); }).join(' y ');
    var enunciado = texto(terminos) + '<span class="expr-si"> si ' + dato + '</span>';

    // Un error que el alumno comete término por término: mal(t) da lo que escribe (null si ahí
    // no aplica). La explicación usa el primer término donde el error sí cambia el valor.
    function porTermino(mal, explica) {
      var cambia = terminos.filter(function (t) { var w = mal(t); return w !== null && w !== valorTermino(t, vals); });
      if (!cambia.length) return null;
      var suyo = terminos.reduce(function (s, t) { var w = mal(t); return s + (w === null ? valorTermino(t, vals) : w); }, 0);
      return { val: respNum(suyo), err: explica(cambia[0]) };
    }
    // El valor de un término con cada potencia calculada a la manera del alumno: f(base, exponente).
    function aSuManera(t, f) {
      return letras(t.l).reduce(function (p, v) { return p * f(vals[v], t.l[v]); }, t.c);
    }
    function potenciasDe(t, condicion) { return letras(t.l).filter(function (v) { return condicion(vals[v], t.l[v]); }); }
    var principales = [], cands = [];

    // (−3)² frente a −3²: elevar sin paréntesis.
    function sinParentesis(x, e) { return x < 0 && e % 2 === 0; }
    principales.push(porTermino(function (t) {
      if (!potenciasDe(t, sinParentesis).length) return null;
      return aSuManera(t, function (x, e) { return sinParentesis(x, e) ? -potencia(-x, e) : potencia(x, e); });
    }, function (t) {
      var v = potenciasDe(t, sinParentesis)[0], e = t.l[v];
      return 'Sustituye con paréntesis: (' + num(vals[v]) + ')' + volado(e) + ' = ' + potencia(vals[v], e) +
        '. Sin paréntesis, ' + num(vals[v]) + volado(e) + ' = ' + num(-potencia(-vals[v], e)) + ' es otra cuenta.';
    }));
    // El exponente multiplica a la base: 3² = 6.
    function porExponente(x, e) { return e >= 2 && e * x !== potencia(x, e); }
    cands.push(porTermino(function (t) {
      if (!potenciasDe(t, porExponente).length) return null;
      return aSuManera(t, function (x, e) { return e >= 2 ? e * x : potencia(x, e); });
    }, function (t) {
      var v = potenciasDe(t, porExponente)[0], e = t.l[v], x = vals[v], veces = [];
      for (var i = 0; i < e; i++) veces.push(par(x));
      return 'El exponente no multiplica a la base: ' + par(x) + volado(e) + ' = ' + veces.join(' · ') + ' = ' + num(potencia(x, e)) +
        ', no ' + e + ' · ' + par(x) + '.';
    }));
    // El coeficiente dentro de la potencia: 2x² como (2x)².
    function elevada(t) { return potenciasDe(t, function (x, e) { return e >= 2; })[0]; }
    cands.push(porTermino(function (t) {
      var v0 = elevada(t);
      if (Math.abs(t.c) < 2 || !v0) return null;
      return letras(t.l).reduce(function (p, v) { return v === v0 ? p : p * potencia(vals[v], t.l[v]); }, potencia(t.c * vals[v0], t.l[v0]));
    }, function (t) {
      var v = elevada(t), e = t.l[v];
      return 'En ' + textoTermino(t, true) + ' sólo la ' + v + ' está elevada: ' + num(t.c) + ' · ' + par(vals[v]) + volado(e) +
        ' = ' + num(t.c) + ' · ' + par(potencia(vals[v], e)) + ', no (' + num(t.c) + ' · ' + par(vals[v]) + ')' + volado(e) + '.';
    }));
    // Menos por menos: −3 · (−2) da +6.
    cands.push(porTermino(function (t) {
      var dos = t.c < 0 && potenciasDe(t, function (x, e) { return x < 0 && e % 2 === 1; }).length && valorTermino(t, vals) > 0;
      return dos ? -valorTermino(t, vals) : null;
    }, function (t) { return 'Menos por menos da más: ' + cuentaTermino(t, vals) + ', positivo.'; }));
    // Se pierde el signo del valor: x = −2 usado como 2.
    var negs = vars.filter(function (v) { return vals[v] < 0; });
    if (negs.length) {
      var abs = {};
      vars.forEach(function (v) { abs[v] = Math.abs(vals[v]); });
      cands.push({ val: respNum(terminos.reduce(function (s, t) { return s + valorTermino(t, abs); }, 0)),
        err: 'Se perdió el signo: ' + negs[0] + ' vale ' + num(vals[negs[0]]) + ', no ' + abs[negs[0]] + '.' });
    }
    // Los valores cambiados de letra.
    if (vars.length === 2) {
      var cambio = {};
      cambio[vars[0]] = vals[vars[1]];
      cambio[vars[1]] = vals[vars[0]];
      cands.push({ val: respNum(terminos.reduce(function (s, t) { return s + valorTermino(t, cambio); }, 0)),
        err: 'Cambiaste los valores: ' + vars[0] + ' = ' + num(vals[vars[0]]) + ' y ' + vars[1] + ' = ' + num(vals[vars[1]]) + ', no al revés.' });
    }
    if (nivel === 1) {
      var x1 = vals[V];
      function lineal(t) { return grado(t.l) === 1 && t.c >= 2 && t.c <= 9; }
      // 3x con x = 2 no es 32.
      cands.push(porTermino(function (t) { return lineal(t) ? 10 * t.c + x1 : null; }, function (t) {
        return textoTermino(t, true) + ' es ' + t.c + ' · ' + V + ': con ' + V + ' = ' + x1 + ' da ' + t.c * x1 + ', no ' + (10 * t.c + x1) + '.';
      }));
      // 3x como 3 + x.
      cands.push(porTermino(function (t) { return lineal(t) ? t.c + x1 : null; }, function (t) {
        return textoTermino(t, true) + ' es ' + t.c + ' por ' + V + ', no ' + t.c + ' más ' + V + '.';
      }));
      // 7 + 2x: primero la multiplicación, no (7 + 2) · x.
      if (terminos.length === 2 && grado(terminos[0].l) === 0 && grado(terminos[1].l) === 1) {
        cands.push({ val: respNum((terminos[0].c + terminos[1].c) * x1),
          err: 'Primero la multiplicación: ' + num(terminos[1].c) + ' · ' + x1 + ' = ' + num(terminos[1].c * x1) + '; luego la suma.' });
      }
      // Olvidar el coeficiente: 3x² como x².
      cands.push(porTermino(function (t) { return (Math.abs(t.c) >= 2 && grado(t.l) > 0) ? valorTermino(T(1, t.l), vals) : null; }, function (t) {
        return 'Falta el coeficiente: ' + textoTermino(t, true) + ' es ' + num(t.c) + ' · ' + textoLit(t.l) + ' = ' + num(valorTermino(t, vals)) + '.';
      }));
    }

    var conLetras = terminos.filter(function (t) { return grado(t.l) > 0; });
    var hayPot = conLetras.some(function (t) { return letras(t.l).some(function (v) { return t.l[v] >= 2; }); });
    var pasos = [
      'Sustituye cada letra por su valor, con paréntesis: ' + terminos.map(function (t, i) { return sustituye(t, vals, i === 0); }).join('') + '.',
      (hayPot ? 'Primero las potencias y luego las multiplicaciones: ' : 'Multiplica: ') +
        conLetras.map(function (t) { return cuentaTermino(t, vals); }).join('; ') + '.',
      'Suma: ' + sumaTexto(terminos.map(function (t) { return valorTermino(t, vals); })) + ' = <b>' + num(total) + '</b>.'
    ];
    return armar(enunciado, correcta, ordena(principales, cands),
      { tema: 'Valor numérico', ask: 'Calcula el valor', pasos: pasos });
  }
  function genValor(nivel) { return intentar(intentoValor, nivel, 'expr-valor'); }

  M.GENERADORES['expr-semejantes'] = genSemejantes;
  M.GENERADORES['expr-monomios'] = genMonomios;
  M.GENERADORES['expr-parentesis'] = genParentesis;
  M.GENERADORES['expr-valor'] = genValor;
})();
