/*
 * ejercicios-despejes.js — Física, semana 7: despejes en fórmulas físicas.
 *
 * Se carga después de ejercicios-motor.js y ejercicios-fisica.js: usa los ayudantes
 * de M.fisica (armar, azar…). Dos generadores, con tres niveles cada uno:
 *
 *   despeje-formula   despeja una letra de una fórmula real; las opciones son fórmulas
 *   despeje-calcula   despeja, sustituye y calcula; las opciones son valores con unidad
 *
 *   nivel 1 · una operación: la letra multiplicada (d = v·t) o arriba de una fracción (P = F/A)
 *   nivel 2 · la letra abajo (A de P = F/A) o dos pasos (t de v = v₀ + a·t)
 *   nivel 3 · tres factores (h de Ep = m·g·h) o un cuadrado, que se deshace con raíz (Ec = ½·m·v²)
 *
 * Cada expresión se define una sola vez como un árbol: de ahí salen su escritura (con
 * fracciones apiladas y raíz) y su valor. Así, la opción correcta y cada error se pueden
 * comprobar con números (M.despejes queda expuesto para las pruebas). Las opciones falsas
 * son errores reales: voltear la fracción, pasar restando lo que multiplica, dividir sólo
 * una parte, olvidar la raíz, deshacer el ½ al revés, olvidar o equivocar la unidad.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var armar = M.fisica.armar, azar = M.fisica.azar;
  var MENOS = '−', NB = ' ';

  /* ---------- Expresiones ---------- */
  function L(n, h) { return { t: 'letra', n: n, h: h || n }; }
  function N(v) { return { t: 'num', v: v }; }
  var MEDIO = { t: 'medio' };
  function mas(a, b) { return { t: 'mas', a: a, b: b }; }
  function menos(a, b) { return { t: 'menos', a: a, b: b }; }
  function por() {
    return Array.prototype.slice.call(arguments).reduce(function (x, y) { return { t: 'por', a: x, b: y }; });
  }
  function entre(a, b) { return { t: 'entre', a: a, b: b }; }
  function cuad(a) { return { t: 'cuad', a: a }; }
  function raiz(a) { return { t: 'raiz', a: a }; }

  function valor(e, s) {
    switch (e.t) {
      case 'letra': return s[e.n];
      case 'num': return e.v;
      case 'medio': return 0.5;
      case 'mas': return valor(e.a, s) + valor(e.b, s);
      case 'menos': return valor(e.a, s) - valor(e.b, s);
      case 'por': return valor(e.a, s) * valor(e.b, s);
      case 'entre': return valor(e.a, s) / valor(e.b, s);
      case 'cuad': return Math.pow(valor(e.a, s), 2);
      case 'raiz': return Math.sqrt(valor(e.a, s));
    }
    return NaN;
  }

  // Números: punto decimal, coma de miles, signo menos tipográfico y a lo más tres decimales.
  function fmt(x) {
    var r = Math.round(x * 1000) / 1000;
    var s = Math.abs(r).toFixed(3).replace(/\.?0+$/, '');
    var partes = s.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (r < 0 ? MENOS : '') + partes.join('.');
  }
  // Un valor que se escribe exacto con tres decimales o menos (sin «≈»), positivo y razonable.
  function limpio(x) {
    return isFinite(x) && x > 0 && x < 1e7 && Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6;
  }

  function fr(n, d) { return '<span class="fr"><span class="fr__n">' + n + '</span><span class="fr__d">' + d + '</span></span>'; }
  // La raíz: el signo es un trazo que se estira con lo que cubre (una fracción apilada).
  var SIGNO_RAIZ = '<span class="raiz__signo" aria-hidden="true"><svg viewBox="0 0 10 32" preserveAspectRatio="none" focusable="false"><path d="M0.6 19.5L3.3 17.6L6.2 31L10 0.5"/></svg></span>';
  function raizHtml(x) {
    return '<span class="raiz"><span class="visually-hidden">raíz cuadrada de </span>' + SIGNO_RAIZ + '<span class="raiz__dentro">' + x + '</span></span>';
  }

  var PREC = { mas: 1, menos: 1, por: 2, cuad: 3, entre: 4, raiz: 4, letra: 4, num: 4, medio: 4 };
  function envuelve(e, minimo) { return PREC[e.t] < minimo ? '(' + html(e) + ')' : html(e); }
  function html(e) {
    switch (e.t) {
      case 'letra': return e.h;
      case 'num': return fmt(e.v);
      case 'medio': return '½';
      case 'mas': return envuelve(e.a, 1) + ' + ' + envuelve(e.b, 2);
      case 'menos': return envuelve(e.a, 1) + ' ' + MENOS + ' ' + envuelve(e.b, 2);
      case 'por': return envuelve(e.a, 2) + '·' + envuelve(e.b, 2);
      case 'entre': return fr(html(e.a), html(e.b));
      case 'cuad': return (e.a.t === 'letra' || e.a.t === 'num' ? html(e.a) : '(' + html(e.a) + ')') + '²';
      case 'raiz': return raizHtml(html(e.a));
    }
    return '';
  }

  /* Sustituye en renglón, con × y ÷ y cada dato con su unidad: «360 m ÷ (20 m/s)».
     Sin unidades queda la pura cuenta: «360 ÷ 20». Un dato con unidad compuesta va entre
     paréntesis si algo lo divide o lo sigue multiplicando: «(4 m/s²) × 5 s». */
  function compuesta(u) { return /[\/·]/.test(u); }
  function renglon(e, s, u) {
    function dato(x) {
      var unidad = u && u[x.n];
      return fmt(s[x.n]) + (unidad ? NB + unidad : '');
    }
    function lado(x, minimo, modo) {
      var texto = renglon(x, s, u);
      var conCompuesta = x.t === 'letra' && u && u[x.n] && compuesta(u[x.n]);
      // Un cuadrado o una raíz ya se leen como una sola pieza: «÷ 30²», «÷ (30 m/s)²».
      var pieza = x.t === 'letra' || x.t === 'num' || x.t === 'cuad' || x.t === 'raiz';
      if (PREC[x.t] < minimo) return '(' + texto + ')';
      if (modo === 'divisor' && (conCompuesta || !pieza)) return '(' + texto + ')';
      if (modo === 'factor' && conCompuesta) return '(' + texto + ')';
      return texto;
    }
    switch (e.t) {
      case 'letra': return dato(e);
      case 'num': return fmt(e.v);
      case 'medio': return '½';
      case 'mas': return lado(e.a, 1) + ' + ' + lado(e.b, 2);
      case 'menos': return lado(e.a, 1) + ' ' + MENOS + ' ' + lado(e.b, 2);
      case 'por': return lado(e.a, 2, 'factor') + ' × ' + lado(e.b, 2);
      case 'entre': return lado(e.a, 2) + ' ÷ ' + lado(e.b, 3, 'divisor');
      case 'cuad': return (u || e.a.t !== 'letra' ? '(' + renglon(e.a, s, u) + ')' : renglon(e.a, s, u)) + '²';
      case 'raiz': return '√(' + renglon(e.a, s, u) + ')';
    }
    return '';
  }

  /* ---------- Letras y fórmulas ---------- */
  var d = L('d'), v = L('v'), t = L('t'), F = L('F'), m = L('m'), a = L('a'), W = L('W'),
    Vv = L('V'), I = L('I'), R = L('R'), P = L('P'), A = L('A'), rho = L('rho', 'ρ'),
    Vol = L('Vol', 'V'), v0 = L('v0', 'v<sub>0</sub>'), Ec = L('Ec', 'E<sub>c</sub>'),
    h = L('h'), g = L('g'), Ep = L('Ep', 'E<sub>p</sub>'), DOS = N(2);

  var FORMULAS = {
    mru: { nombre: 'velocidad constante', izq: d, der: por(v, t) },
    newton: { nombre: 'segunda ley de Newton', izq: F, der: por(m, a) },
    trabajo: { nombre: 'trabajo', izq: W, der: por(F, d) },
    ohm: { nombre: 'ley de Ohm', izq: Vv, der: por(I, R) },
    presion: { nombre: 'presión', izq: P, der: entre(F, A) },
    densidad: { nombre: 'densidad', izq: rho, der: entre(m, Vol) },
    mrua: { nombre: 'aceleración constante', izq: v, der: mas(v0, por(a, t)) },
    cinetica: { nombre: 'energía cinética', izq: Ec, der: por(MEDIO, m, cuad(v)) },
    caida: { nombre: 'caída libre desde el reposo', izq: h, der: por(MEDIO, g, cuad(t)) },
    potencial: { nombre: 'energía potencial', izq: Ep, der: por(m, g, h) }
  };
  function escribe(f) { return html(f.izq) + ' = ' + html(f.der); }
  function enLa(f, fh) { return 'En ' + fh + ' (' + FORMULAS[f].nombre + '), '; }

  /* ---------- Los despejes y sus errores ----------
     Cada uno: la fórmula, la letra que se busca, la expresión correcta, los pasos y los
     errores de verdad (cada uno con su explicación). */
  function producto(f, y, x, k) {          // y = x·k: x está multiplicada por k
    return { f: f, x: x, bien: entre(y, k),
      pasos: function (fh) {
        return [enLa(f, fh) + k.h + ' multiplica a ' + x.h + '.',
          'Divide entre ' + k.h + ' los dos lados: <b>' + x.h + ' = ' + html(entre(y, k)) + '</b>.'];
      },
      falsas: [
        { e: entre(k, y), err: 'Volteaste la fracción: arriba va ' + y.h + ', la que estaba sola del otro lado.' },
        { e: menos(y, k), err: k.h + ' multiplica a ' + x.h + ': pasa dividiendo, no restando.' },
        { e: por(y, k), err: k.h + ' ya multiplicaba a ' + x.h + ': se deshace dividiendo entre ' + k.h + ', no multiplicando otra vez.' }
      ] };
  }
  function arriba(f, y, x, k) {            // y = x/k: x está dividida entre k
    return { f: f, x: x, bien: por(y, k),
      pasos: function (fh) {
        return [enLa(f, fh) + k.h + ' divide a ' + x.h + '.',
          'Multiplica por ' + k.h + ' los dos lados: <b>' + x.h + ' = ' + html(por(y, k)) + '</b>.'];
      },
      falsas: [
        { e: entre(y, k), err: k.h + ' divide a ' + x.h + ': se deshace multiplicando por ' + k.h + ', no dividiendo otra vez.' },
        { e: entre(k, y), err: 'Al multiplicar por ' + k.h + ' los dos lados, la fracción desaparece: queda ' + y.h + '·' + k.h + '.' },
        { e: mas(y, k), err: k.h + ' divide a ' + x.h + ': se deshace multiplicando, no sumando.' }
      ] };
  }
  function abajo(f, y, n, x) {             // y = n/x: x está abajo
    return { f: f, x: x, bien: entre(n, y),
      pasos: function () {
        return [x.h + ' está abajo: multiplica por ' + x.h + ' los dos lados, ' + y.h + '·' + x.h + ' = ' + n.h + '.',
          'Divide entre ' + y.h + ' los dos lados: <b>' + x.h + ' = ' + html(entre(n, y)) + '</b>.'];
      },
      falsas: [
        { e: entre(y, n), err: 'Volteaste la fracción. Multiplica por ' + x.h + ' (' + y.h + '·' + x.h + ' = ' + n.h + ') y luego divide entre ' + y.h + ': ' + n.h + ' queda arriba.' },
        { e: por(n, y), err: 'De ' + y.h + '·' + x.h + ' = ' + n.h + ' se divide entre ' + y.h + ', no se multiplica.' },
        { e: menos(n, y), err: x.h + ' está dividiendo: se multiplica por ' + x.h + ' en los dos lados; no se resta nada.' }
      ] };
  }
  function sumaProducto(x, k) {            // v = v₀ + x·k: primero se resta v₀, luego se divide entre k
    var bien = entre(menos(v, v0), k);
    return { f: 'mrua', x: x, bien: bien,
      pasos: function () {
        return ['A la ' + x.h + ' primero se le multiplicó por ' + k.h + ' y luego se le sumó ' + v0.h + ': se deshace al revés.',
          'Resta ' + v0.h + ' en los dos lados: ' + html(menos(v, v0)) + ' = ' + html(por(a, t)) + '.',
          'Divide entre ' + k.h + ': <b>' + x.h + ' = ' + html(bien) + '</b>.'];
      },
      falsas: [
        { e: entre(mas(v, v0), k), err: v0.h + ' está sumando: se resta en los dos lados, ' + html(menos(v, v0)) + '.' },
        { e: menos(v, entre(v0, k)), err: 'Se divide toda la resta, ' + html(menos(v, v0)) + ', no sólo ' + v0.h + ': la raya de la fracción abarca las dos.' },
        { e: menos(entre(v, k), v0), err: 'Si divides primero, se divide todo, también ' + v0.h + '. Más fácil: primero resta ' + v0.h + ' y luego divide entre ' + k.h + '.' },
        { e: por(menos(v, v0), k), err: k.h + ' multiplica a ' + x.h + ': se divide entre ' + k.h + ', no se multiplica.' },
        { e: entre(k, menos(v, v0)), err: 'Volteaste la fracción: arriba va ' + html(menos(v, v0)) + '.' }
      ] };
  }
  var despejeV0 = { f: 'mrua', x: v0, bien: menos(v, por(a, t)),
    pasos: function () {
      return [html(por(a, t)) + ' está sumando a ' + v0.h + '.',
        'Resta ' + html(por(a, t)) + ' en los dos lados: <b>' + v0.h + ' = ' + html(menos(v, por(a, t))) + '</b>.'];
    },
    falsas: [
      { e: mas(v, por(a, t)), err: html(por(a, t)) + ' está sumando: pasa restando.' },
      { e: menos(por(a, t), v), err: 'Restaste al revés: de v = ' + v0.h + ' + a·t, al restar a·t queda v ' + MENOS + ' a·t.' },
      { e: menos(v, a), err: 'a·t es un solo término: se resta completo, no sólo a.' },
      { e: entre(v, por(a, t)), err: 'a·t está sumando, no multiplicando: se resta, no se divide.' }
    ] };
  function cuadrado(f, y, k, x) {          // y = ½·k·x²: x con raíz
    var dosY = por(DOS, y), bien = raiz(entre(dosY, k));
    return { f: f, x: x, bien: bien,
      pasos: function () {
        return ['Multiplica por 2 los dos lados: ' + html(dosY) + ' = ' + html(por(k, cuad(x))) + '.',
          'Divide entre ' + k.h + ': ' + html(cuad(x)) + ' = ' + html(entre(dosY, k)) + '.',
          'Saca raíz cuadrada: <b>' + x.h + ' = ' + html(bien) + '</b>.'];
      },
      falsas: [
        { e: entre(dosY, k), err: 'Te faltó la raíz: eso es ' + html(cuad(x)) + ', no ' + x.h + '.' },
        { e: raiz(entre(y, por(DOS, k))), err: 'El ½ se deshace multiplicando por 2 los dos lados, no dividiendo: queda ' + html(dosY) + '.' },
        { e: raiz(entre(k, dosY)), err: 'Volteaste la fracción: ' + k.h + ' divide, va abajo.' },
        { e: raiz(menos(dosY, k)), err: k.h + ' multiplica a ' + html(cuad(x)) + ': se divide entre ' + k.h + ', no se resta.' }
      ] };
  }
  function factorDeCuadrado(f, y, k, x) {  // y = ½·k·x²: k
    var dosY = por(DOS, y), bien = entre(dosY, cuad(x));
    return { f: f, x: k, bien: bien,
      pasos: function () {
        return ['Multiplica por 2 los dos lados: ' + html(dosY) + ' = ' + html(por(k, cuad(x))) + '.',
          'Divide entre ' + html(cuad(x)) + ': <b>' + k.h + ' = ' + html(bien) + '</b>.'];
      },
      falsas: [
        { e: entre(y, por(DOS, cuad(x))), err: 'El ½ se deshace multiplicando por 2, no dividiendo.' },
        { e: entre(dosY, x), err: x.h + ' está al cuadrado: se divide entre ' + html(cuad(x)) + ', no entre ' + x.h + '.' },
        { e: entre(cuad(x), dosY), err: 'Volteaste la fracción: arriba va ' + html(dosY) + '.' },
        { e: menos(dosY, cuad(x)), err: html(cuad(x)) + ' multiplica a ' + k.h + ': se divide, no se resta.' }
      ] };
  }
  function tresFactores(x, k1, k2) {       // Ep = m·g·h: x multiplicada por los otros dos
    var bien = entre(Ep, por(k1, k2));
    return { f: 'potencial', x: x, bien: bien,
      pasos: function (fh) {
        return [enLa('potencial', fh) + k1.h + ' y ' + k2.h + ' multiplican a ' + x.h + '.',
          'Divide entre ' + html(por(k1, k2)) + ' los dos lados: <b>' + x.h + ' = ' + html(bien) + '</b>.'];
      },
      falsas: [
        { e: por(entre(Ep, k1), k2), err: k2.h + ' también multiplica a ' + x.h + ': pasa dividiendo, junto con ' + k1.h + '.' },
        { e: menos(Ep, por(k1, k2)), err: html(por(k1, k2)) + ' multiplica a ' + x.h + ': se divide, no se resta.' },
        { e: entre(por(k1, k2), Ep), err: 'Volteaste la fracción: arriba va ' + Ep.h + '.' },
        { e: entre(Ep, k1), err: 'Te faltó dividir entre ' + k2.h + ': también multiplica a ' + x.h + '.' }
      ] };
  }

  var DESPEJES = {
    'mru-v': producto('mru', d, v, t), 'mru-t': producto('mru', d, t, v),
    'newton-m': producto('newton', F, m, a), 'newton-a': producto('newton', F, a, m),
    'trabajo-F': producto('trabajo', W, F, d), 'trabajo-d': producto('trabajo', W, d, F),
    'ohm-I': producto('ohm', Vv, I, R), 'ohm-R': producto('ohm', Vv, R, I),
    'presion-F': arriba('presion', P, F, A), 'densidad-m': arriba('densidad', rho, m, Vol),
    'presion-A': abajo('presion', P, F, A), 'densidad-V': abajo('densidad', rho, m, Vol),
    'mrua-t': sumaProducto(t, a), 'mrua-a': sumaProducto(a, t), 'mrua-v0': despejeV0,
    'cinetica-v': cuadrado('cinetica', Ec, m, v), 'cinetica-m': factorDeCuadrado('cinetica', Ec, m, v),
    'caida-t': cuadrado('caida', h, g, t), 'caida-g': factorDeCuadrado('caida', h, g, t),
    'potencial-h': tresFactores(h, m, g), 'potencial-m': tresFactores(m, g, h)
  };
  var NIVELES = {
    1: ['mru-v', 'mru-t', 'newton-m', 'newton-a', 'trabajo-F', 'trabajo-d', 'ohm-I', 'ohm-R', 'presion-F', 'densidad-m'],
    2: ['presion-A', 'densidad-V', 'mrua-t', 'mrua-a', 'mrua-v0'],
    3: ['cinetica-v', 'cinetica-m', 'caida-t', 'caida-g', 'potencial-h', 'potencial-m']
  };

  function nivelValido(n) { return n === 2 || n === 3 ? n : 1; }

  /* ---------- despeje-formula: la respuesta es una fórmula ---------- */
  function genFormula(nivel) {
    var id = azar(NIVELES[nivelValido(nivel)]);
    var dsp = DESPEJES[id], f = FORMULAS[dsp.f], fh = escribe(f);
    function opcion(e) { return dsp.x.h + ' = ' + html(e); }
    return armar('<span class="despeje-letra">' + dsp.x.h + '</span> <span class="despeje-de">de</span> ' + fh,
      opcion(dsp.bien),
      dsp.falsas.map(function (x) { return { h: opcion(x.e), err: x.err }; }),
      { texto: false, ask: 'Despeja', tema: 'Despejes', pasos: dsp.pasos(fh), despeje: id });
  }

  /* ---------- despeje-calcula: despeja, sustituye y calcula ----------
     Datos reales y cuentas que salen sin calculadora. Cada problema dice qué unidad
     lleva cada dato, la unidad del resultado, cómo se opera esa unidad y qué unidad
     equivocada se escribe a veces. */
  var QUIEN = [
    { q: 'Un corredor', vs: [3, 4, 5, 6] },
    { q: 'Un ciclista', vs: [4, 5, 6, 8, 10] },
    { q: 'Un auto', vs: [15, 20, 25, 30] }
  ];
  var EMPUJADOS = [
    { o: 'un carrito', ms: [2, 4, 5, 8] },
    { o: 'una caja', ms: [10, 20, 25, 40] },
    { o: 'un trineo', ms: [30, 40, 50] }
  ];
  var MATERIALES = [
    { n: 'aluminio', r: 2.7 }, { n: 'hierro', r: 7.87 }, { n: 'cobre', r: 8.96 }, { n: 'plata', r: 10.5 },
    { n: 'plomo', r: 11.3 }, { n: 'oro', r: 19.3 }, { n: 'hielo', r: 0.92 }
  ];
  var MOVILES = [
    { o: 'Una pelota', ms: [0.5], vs: [4, 6, 8, 10, 12, 20] },
    { o: 'Un carrito', ms: [2, 4], vs: [2, 3, 4, 5, 6] },
    { o: 'Un auto', ms: [1000, 1200], vs: [10, 20, 30] }
  ];
  // Donde una piedra que se suelta sí llega a un suelo (Júpiter no tiene) y el aire casi no estorba.
  var ASTROS = [
    { lugar: 'la Luna', g: 1.6, ts: [3, 5] },
    { lugar: 'Marte', g: 3.7, ts: [2, 4] },
    { lugar: 'la Tierra', g: 9.8, ts: [2, 3] }
  ];
  var G = 9.8;

  function u(x) { return NB + x; }

  var PROBLEMAS = {
    'mru-v': function () {
      var q = azar(QUIEN), vel = azar(q.vs), tt = azar([4, 5, 6, 8, 10, 12, 15, 20]), dd = vel * tt;
      return { datos: { d: dd, t: tt }, unidades: { d: 'm', t: 's' }, unidad: 'm/s', cuenta: 'm ÷ s = m/s',
        mal: { u: 'm', err: 'La unidad sale de la misma división: m ÷ s = m/s.' },
        enunciado: q.q + ' recorre ' + fmt(dd) + u('m') + ' en ' + tt + u('s') + ' a velocidad constante. ¿Qué velocidad lleva?' };
    },
    'mru-t': function () {
      var q = azar(QUIEN), vel = azar(q.vs), tt = azar([4, 5, 6, 8, 10, 12, 15, 20]), dd = vel * tt;
      return { datos: { d: dd, v: vel }, unidades: { d: 'm', v: 'm/s' }, unidad: 's', cuenta: 'm ÷ (m/s) = s',
        mal: { u: 'm/s', err: 'Buscas un tiempo: m ÷ (m/s) = s.' },
        enunciado: '¿Cuánto tarda ' + q.q.toLowerCase() + ' en recorrer ' + fmt(dd) + u('m') + ' a ' + vel + u('m/s') + ' constantes?' };
    },
    'newton-a': function () {
      var o = azar(EMPUJADOS), mm = azar(o.ms), aa = azar([2, 3, 4, 5, 6]), ff = mm * aa;
      return { datos: { F: ff, m: mm }, unidades: { F: 'N', m: 'kg' }, unidad: 'm/s²', cuenta: 'N ÷ kg = m/s²',
        mal: { u: 'm/s', err: 'La aceleración va en m/s²: N ÷ kg = (kg·m/s²) ÷ kg = m/s².' },
        enunciado: 'Una fuerza neta de ' + fmt(ff) + u('N') + ' empuja ' + o.o + ' de ' + mm + u('kg') + '. ¿Qué aceleración le da?' };
    },
    'newton-m': function () {
      var o = azar(EMPUJADOS), mm = azar(o.ms), aa = azar([2, 3, 4, 5, 6]), ff = mm * aa;
      return { datos: { F: ff, a: aa }, unidades: { F: 'N', a: 'm/s²' }, unidad: 'kg', cuenta: 'N ÷ (m/s²) = kg',
        mal: { u: 'N', err: 'La masa va en kilogramos: N ÷ (m/s²) = kg.' },
        enunciado: 'Una fuerza neta de ' + fmt(ff) + u('N') + ' le da a ' + o.o + ' una aceleración de ' + aa + u('m/s²') + '. ¿Qué masa tiene?' };
    },
    'trabajo-F': function () {
      var dd = azar([2, 4, 5, 8, 10]), ff = azar([20, 25, 40, 50, 60, 80, 100]), ww = ff * dd;
      return { datos: { W: ww, d: dd }, unidades: { W: 'J', d: 'm' }, unidad: 'N', cuenta: 'J ÷ m = N',
        mal: { u: 'J', err: 'La fuerza va en newtons: J ÷ m = (N·m) ÷ m = N.' },
        enunciado: 'Al empujar una caja ' + dd + u('m') + ' en línea recta se hace un trabajo de ' + fmt(ww) + u('J') + '. ¿Qué fuerza se aplicó en la dirección del movimiento?' };
    },
    'trabajo-d': function () {
      var dd = azar([2, 4, 5, 8, 10]), ff = azar([20, 25, 40, 50, 60, 80, 100]), ww = ff * dd;
      return { datos: { W: ww, F: ff }, unidades: { W: 'J', F: 'N' }, unidad: 'm', cuenta: 'J ÷ N = m',
        mal: { u: 'N', err: 'Buscas una distancia: J ÷ N = (N·m) ÷ N = m.' },
        enunciado: 'Una fuerza de ' + ff + u('N') + ', en la dirección del movimiento, hace un trabajo de ' + fmt(ww) + u('J') + ' sobre una caja. ¿Qué distancia la movió?' };
    },
    'ohm-I': function () {
      var rr = azar([10, 20, 30, 40, 60]), ii = azar([0.5, 2, 3, 4]), vv = ii * rr;
      return { datos: { V: vv, R: rr }, unidades: { V: 'V', R: 'Ω' }, unidad: 'A', cuenta: 'V ÷ Ω = A',
        mal: { u: 'Ω', err: 'La corriente va en amperes: V ÷ Ω = A.' },
        enunciado: 'Una resistencia de ' + rr + u('Ω') + ' se conecta a ' + fmt(vv) + u('V') + '. ¿Qué corriente pasa por ella?' };
    },
    'ohm-R': function () {
      var vv = azar([12, 24, 120]), ii = azar([0.5, 2, 3, 4]);
      return { datos: { V: vv, I: ii }, unidades: { V: 'V', I: 'A' }, unidad: 'Ω', cuenta: 'V ÷ A = Ω',
        mal: { u: 'A', err: 'La resistencia va en ohms: V ÷ A = Ω.' },
        enunciado: 'Un aparato conectado a ' + vv + u('V') + ' deja pasar una corriente de ' + fmt(ii) + u('A') + '. ¿Cuál es su resistencia?' };
    },
    'presion-F': function () {
      var pp = azar([200, 500, 1000, 2000, 5000]), aa = azar([0.5, 2, 3, 4]);
      return { datos: { P: pp, A: aa }, unidades: { P: 'Pa', A: 'm²' }, unidad: 'N', cuenta: 'Pa × m² = (N/m²) × m² = N',
        mal: { u: 'Pa', err: 'La fuerza va en newtons: Pa × m² = (N/m²) × m² = N.' },
        enunciado: 'Una presión de ' + fmt(pp) + u('Pa') + ' actúa sobre una superficie de ' + fmt(aa) + u('m²') + '. ¿Qué fuerza ejerce sobre ella?' };
    },
    'densidad-m': function () {
      var mat = azar(MATERIALES), vol = azar([10, 20, 50, 100]);
      return { datos: { rho: mat.r, Vol: vol }, unidades: { rho: 'g/cm³', Vol: 'cm³' }, unidad: 'g', cuenta: '(g/cm³) × cm³ = g',
        mal: { u: 'g/cm³', err: 'La masa va en gramos: (g/cm³) × cm³ = g.' },
        enunciado: 'Una pieza de ' + mat.n + ' (ρ = ' + fmt(mat.r) + u('g/cm³') + ') ocupa ' + vol + u('cm³') + '. ¿Qué masa tiene?' };
    },
    'presion-A': function () {
      var aa = azar([0.25, 0.5, 2, 4, 5]), pp = azar([200, 400, 500, 800, 1000, 2000]), ff = pp * aa;
      return { datos: { F: ff, P: pp }, unidades: { F: 'N', P: 'Pa' }, unidad: 'm²', cuenta: 'N ÷ Pa = N ÷ (N/m²) = m²',
        mal: { u: 'm', err: 'Un área va en m²: N ÷ (N/m²) = m².' },
        enunciado: 'Una caja que pesa ' + fmt(ff) + u('N') + ' está apoyada en el piso y le ejerce una presión de ' + fmt(pp) + u('Pa') + '. ¿Qué área de su base toca el piso?' };
    },
    'densidad-V': function () {
      var mat = azar(MATERIALES), vol = azar([10, 20, 50, 100]), mm = mat.r * vol;
      return { datos: { m: mm, rho: mat.r }, unidades: { m: 'g', rho: 'g/cm³' }, unidad: 'cm³', cuenta: 'g ÷ (g/cm³) = cm³',
        mal: { u: 'g', err: 'Un volumen va en cm³: g ÷ (g/cm³) = cm³.' },
        enunciado: 'Un bloque de ' + mat.n + ' (ρ = ' + fmt(mat.r) + u('g/cm³') + ') tiene una masa de ' + fmt(mm) + u('g') + '. ¿Qué volumen ocupa?' };
    },
    'mrua-t': function () {
      var ini = azar([2, 4, 5, 6, 8, 10]), aa = azar([2, 3, 4, 5]), tt = azar([2, 3, 4, 5, 6]), fin = ini + aa * tt;
      return { datos: { v: fin, v0: ini, a: aa }, unidades: { v: 'm/s', v0: 'm/s', a: 'm/s²' }, unidad: 's', cuenta: '(m/s) ÷ (m/s²) = s',
        mal: { u: 'm/s', err: 'Buscas un tiempo: (m/s) ÷ (m/s²) = s.' },
        enunciado: 'Un auto va a ' + ini + u('m/s') + ' y acelera ' + aa + u('m/s²') + ' hasta llegar a ' + fin + u('m/s') + '. ¿Cuánto tarda?' };
    },
    'mrua-a': function () {
      var ini = azar([2, 4, 5, 6, 8, 10]), aa = azar([2, 3, 4, 5]), tt = azar([2, 3, 4, 5, 6]), fin = ini + aa * tt;
      return { datos: { v: fin, v0: ini, t: tt }, unidades: { v: 'm/s', v0: 'm/s', t: 's' }, unidad: 'm/s²', cuenta: '(m/s) ÷ s = m/s²',
        mal: { u: 'm/s', err: 'La aceleración va en m/s²: (m/s) ÷ s = m/s².' },
        enunciado: 'Un auto pasa de ' + ini + u('m/s') + ' a ' + fin + u('m/s') + ' en ' + tt + u('s') + '. ¿Qué aceleración tuvo?' };
    },
    'mrua-v0': function () {
      var ini = azar([2, 4, 5, 6, 8, 10]), aa = azar([2, 3, 4, 5]), tt = azar([2, 3, 4, 5, 6]), fin = ini + aa * tt;
      return { datos: { v: fin, a: aa, t: tt }, unidades: { v: 'm/s', a: 'm/s²', t: 's' }, unidad: 'm/s', cuenta: '(m/s²) × s = m/s, y m/s − m/s = m/s',
        mal: { u: 'm/s²', err: 'Es una velocidad: va en m/s.' },
        enunciado: 'Un auto acelera ' + aa + u('m/s²') + ' durante ' + tt + u('s') + ' y termina a ' + fin + u('m/s') + '. ¿A qué velocidad iba al principio?' };
    },
    'cinetica-v': function () {
      var o = azar(MOVILES), mm = azar(o.ms), vel = azar(o.vs), e = mm * vel * vel / 2;
      return { datos: { Ec: e, m: mm }, unidades: { Ec: 'J', m: 'kg' }, unidad: 'm/s', cuenta: 'J ÷ kg = m²/s², y su raíz, m/s',
        mal: { u: 'J', err: 'La rapidez va en m/s: √(J ÷ kg) = √(m²/s²) = m/s.' },
        enunciado: o.o + ' de ' + fmt(mm) + u('kg') + ' tiene ' + fmt(e) + u('J') + ' de energía cinética. ¿Qué rapidez lleva?' };
    },
    'cinetica-m': function () {
      var o = azar(MOVILES), mm = azar(o.ms), vel = azar(o.vs), e = mm * vel * vel / 2;
      return { datos: { Ec: e, v: vel }, unidades: { Ec: 'J', v: 'm/s' }, unidad: 'kg', cuenta: 'J ÷ (m²/s²) = kg',
        mal: { u: 'J', err: 'La masa va en kilogramos: J ÷ (m²/s²) = kg.' },
        enunciado: o.o + ' que va a ' + vel + u('m/s') + ' tiene ' + fmt(e) + u('J') + ' de energía cinética. ¿Qué masa tiene?' };
    },
    'caida-t': function () {
      var tt = azar([2, 3, 4, 5]), hh = G * tt * tt / 2;
      return { datos: { h: hh, g: G }, unidades: { h: 'm', g: 'm/s²' }, unidad: 's', cuenta: 'm ÷ (m/s²) = s², y su raíz, s',
        mal: { u: 'm', err: 'Buscas un tiempo: √(m ÷ (m/s²)) = √(s²) = s.' },
        enunciado: 'Una piedra se suelta desde ' + fmt(hh) + u('m') + ' de altura. Sin contar el aire y con g = 9.8' + u('m/s²') + ', ¿cuánto tarda en llegar al suelo?' };
    },
    'caida-g': function () {
      var as = azar(ASTROS), tt = azar(as.ts), hh = as.g * tt * tt / 2;
      return { datos: { h: hh, t: tt }, unidades: { h: 'm', t: 's' }, unidad: 'm/s²', cuenta: 'm ÷ s² = m/s²',
        mal: { u: 'm/s', err: 'La aceleración va en m/s²: m ÷ s² = m/s².' },
        enunciado: 'En ' + as.lugar + ', una piedra que se suelta cae ' + fmt(hh) + u('m') + ' en ' + tt + u('s') + '. ¿Cuánto vale g en ' + as.lugar + '?' };
    },
    'potencial-h': function () {
      var mm = azar([1, 2, 5]), hh = azar([2, 3, 5, 10, 20]), e = mm * G * hh;
      return { datos: { Ep: e, m: mm, g: G }, unidades: { Ep: 'J', m: 'kg', g: 'm/s²' }, unidad: 'm', cuenta: 'J ÷ (kg × m/s²) = J ÷ N = m',
        mal: { u: 'J', err: 'Buscas una altura: J ÷ (kg × m/s²) = J ÷ N = m.' },
        enunciado: 'Una maceta de ' + mm + u('kg') + ' tiene ' + fmt(e) + u('J') + ' de energía potencial respecto al suelo. Con g = 9.8' + u('m/s²') + ', ¿a qué altura está?' };
    },
    'potencial-m': function () {
      var mm = azar([1, 2, 5, 10]), hh = azar([2, 5, 10, 20]), e = mm * G * hh;
      return { datos: { Ep: e, g: G, h: hh }, unidades: { Ep: 'J', g: 'm/s²', h: 'm' }, unidad: 'kg', cuenta: 'J ÷ (m/s² × m) = kg',
        mal: { u: 'N', err: 'La masa va en kilogramos: J ÷ (m/s² × m) = kg.' },
        enunciado: 'Una caja subida a ' + hh + u('m') + ' de altura tiene ' + fmt(e) + u('J') + ' de energía potencial. Con g = 9.8' + u('m/s²') + ', ¿qué masa tiene?' };
    }
  };

  function genCalcula(nivel) {
    var id = azar(NIVELES[nivelValido(nivel)]);
    var dsp = DESPEJES[id], p = PROBLEMAS[id](), x = dsp.x;
    var res = valor(dsp.bien, p.datos);
    var conUnidad = function (n) { return fmt(n) + NB + p.unidad; };
    var falsas = [];
    dsp.falsas.forEach(function (f) {
      var otro = valor(f.e, p.datos);
      if (limpio(otro) && Math.abs(otro - res) > 1e-9 * Math.max(1, res)) falsas.push({ h: conUnidad(otro), err: f.err });
    });
    falsas.push({ h: fmt(res), err: 'Falta la unidad: un número solo no dice nada. Es ' + conUnidad(res) + '.' });
    falsas.push({ h: fmt(res) + NB + p.mal.u, err: p.mal.err });
    var cuenta = dsp.bien.t === 'raiz'
      ? '√(' + renglon(dsp.bien.a, p.datos) + ') = √' + fmt(valor(dsp.bien.a, p.datos)) + ' = ' + fmt(res)
      : renglon(dsp.bien, p.datos) + ' = ' + fmt(res);
    return armar(p.enunciado, conUnidad(res), falsas, {
      ask: 'Despeja y calcula', tema: 'Despeja y sustituye', despeje: id, datos: p.datos, respuesta: res,
      pasos: ['Despeja: ' + x.h + ' = ' + html(dsp.bien) + '.',
        'Sustituye: ' + x.h + ' = ' + renglon(dsp.bien, p.datos, p.unidades) + '.',
        'Calcula: ' + cuenta + '; ' + p.cuenta + '. <b>' + x.h + ' = ' + conUnidad(res) + '</b>.']
    });
  }

  M.GENERADORES['despeje-formula'] = genFormula;
  M.GENERADORES['despeje-calcula'] = genCalcula;

  // Para las pruebas: el catálogo y las herramientas para comprobar cada despeje con números.
  M.despejes = { FORMULAS: FORMULAS, DESPEJES: DESPEJES, NIVELES: NIVELES, PROBLEMAS: PROBLEMAS,
    valor: valor, html: html, fmt: fmt, limpio: limpio };
})();
