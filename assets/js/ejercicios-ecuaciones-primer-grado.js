/*
 * ejercicios-ecuaciones-primer-grado.js — Fundamentos, semana 7 de Matemáticas.
 *
 * Generadores de ecuaciones de primer grado para la práctica sin fin y el reto
 * relámpago. Se suman al registro de window.TercialMotor (ejercicios-motor.js), así
 * que se cargan después de él. Cada uno devuelve { enunciado, correcta, opciones:
 * [{ val, ok, err }], meta }. La respuesta es exacta (entera o fracción, con la
 * aritmética de fracciones de abajo) y cada opción falsa sale de un error real, con
 * su explicación.
 *
 *   ec-un-lado     ax + b = c               (nivel 3: soluciones con fracción)
 *   ec-dos-lados   ax + b = cx + d          (nivel 3: términos semejantes o fracción)
 *   ec-parentesis  a(x + b) = c; con un menos delante; con dos paréntesis
 *   ec-fracciones  x/a + b = c; (x + b)/a = c; x/a + x/b = c; en cruz
 *   ec-problemas   problemas con palabras que se plantean como ecuación
 *
 * El motor ya trae «ecuacion» (ax + b = c), pero sin instrucción (la práctica dice
 * «¿Cuánto es?» sobre una ecuación), con «Signo del resultado cambiado.» como
 * explicación y, en 1 a 3 de cada 100, «Resultado incorrecto.»: ec-un-lado es el
 * mismo planteo con un error explicado en cada opción.
 *
 * Ninguna ecuación ni problema de la tarea (examenes-pdf/tarea-ecuaciones-primer-
 * grado.html) sale en la práctica ni en el reto: están en EXCLUIDAS.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';
  var NB = ' ';                       // el número y su unidad no se separan

  /* ---------- Aritmética exacta ---------- */
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function mcm(a, b) { return Math.abs(a * b) / mcd(a, b); }
  function fr(n, d) {
    if (d === 0) return null;
    if (d < 0) { n = -n; d = -d; }
    var g = mcd(n, d);
    return { n: n / g + 0, d: d / g };       // + 0: sin «−0»
  }
  function ent(n) { return { n: n + 0, d: 1 }; }
  function esEntero(f) { return !!f && f.d === 1; }

  /* ---------- Azar ---------- */
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var x; do { x = rint(a, b); } while (x === 0); return x; }
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

  /* ---------- Escritura ---------- */
  function num(n) { return n < 0 ? MENOS + (-n) : String(n); }            // −3
  function par(n) { return n < 0 ? '(' + MENOS + (-n) + ')' : String(n); } // (−3) después de × o ÷
  function mas(n) { return n < 0 ? ' ' + MENOS + ' ' + (-n) : ' + ' + n; } // « + 3», « − 3»
  function cx(a) { return a === 1 ? 'x' : a === -1 ? MENOS + 'x' : num(a) + 'x'; }
  function masx(a) { return (a < 0 ? ' ' + MENOS + ' ' : ' + ') + (Math.abs(a) === 1 ? '' : Math.abs(a)) + 'x'; }
  function elTermino(c) { return c === 1 ? 'la x' : 'el ' + cx(c); }      // «la x», «el 3x», «el −x»
  function lin(a, b) { return a === 0 ? num(b) : cx(a) + (b ? mas(b) : ''); } // 3x − 4
  function fraccion(n, d) { return '<span class="fr"><span class="fr__n">' + n + '</span><span class="fr__d">' + d + '</span></span>'; }
  function v(f) { return M.tex(f); }                                     // 5, −3, 5/2 apilado
  function resta(n) { return n < 0 ? ' + ' + (-n) : ' ' + MENOS + ' ' + n; } // quitar n: « − 3» o « + 3»

  // La respuesta de una ecuación: «x = 5». La clave sólo depende del valor.
  function rx(f) { return f ? { k: 'x=' + f.n + '/' + f.d, h: 'x = ' + v(f) } : null; }
  // La respuesta de un problema: un entero con su unidad («$20», «8 años»).
  function rp(n, antes, despues) {
    return { k: 'p=' + n, h: (antes || '') + (n < 0 ? MENOS + (-n) : String(n)) + (despues || '') };
  }

  // Texto plano de un enunciado, para compararlo con las ecuaciones de la tarea.
  function plano(html) {
    return String(html)
      .replace(/<span class="fr"><span class="fr__n">(.*?)<\/span><span class="fr__d">(.*?)<\/span><\/span>/g, '($1)/($2)')
      .replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  }

  // Las de la tarea, como las escribirían estos generadores (y con los lados al revés).
  var EXCLUIDAS = {};
  [
    'x+9=4', 'x−6=11', '5x=−35', '(x)/(3)=−5', '3x+4=19', '6x+5=−13', '10−3x=1', '14=5x−6',
    '5x+3=2x+18', '7x−4=3x+12', '3x+14=8x−1', '4−3x=2x+19',
    'x+8=2', '4x=28', '3(x+2)=21',
    '4(x−3)=20', '3(2x+1)=5x+9', '5−(x+2)=9', '2(x+4)−3(x−1)=8',
    '(x)/(5)−2=4', '(x+6)/(4)=5', '(x)/(2)+(x)/(6)=8', '(x−1)/(3)=(x+3)/(5)'
  ].forEach(function (e) {
    EXCLUIDAS[e] = true;
    var lados = e.split('=');
    EXCLUIDAS[lados[1] + '=' + lados[0]] = true;
  });

  // La correcta y tres falsas. La primera candidata (el error más común del tipo)
  // siempre entra; las otras dos, al azar entre las que quedan. Se descartan las que no
  // existen (una división entre cero), las que valen lo mismo que la correcta y las
  // repetidas. Si no quedan tres, el generador vuelve a tirar los números.
  function armar(enunciado, correcta, candidatas, meta) {
    if (EXCLUIDAS[plano(enunciado)]) return null;
    var vistas = {};
    vistas[correcta.k] = true;
    var validas = [];
    candidatas.forEach(function (c) {
      if (!c || !c.val || vistas[c.val.k]) return;
      vistas[c.val.k] = true;
      validas.push(c);
    });
    if (validas.length < 3) return null;
    var falsas = [validas[0]].concat(barajar(validas.slice(1)).slice(0, 2));
    var opciones = barajar([{ val: correcta, ok: true }].concat(falsas.map(function (c) {
      return { val: c.val, ok: false, err: c.err };
    })));
    return { enunciado: enunciado, correcta: correcta, opciones: opciones, meta: meta };
  }

  function insiste(intento) {
    return function (nivel) {
      for (var i = 0; i < 400; i++) {
        var e = intento(nivel);
        if (e) return e;
      }
      throw new Error('ecuaciones: no salió un ejercicio válido');
    };
  }

  /* ---------- ax + b = c ---------- */
  function unLado(nivel) {
    var a, b, c, sol;
    if (nivel === 1) {
      a = rint(2, 9); b = nz(-12, 15);
      var x1 = rint(1, 10);
      c = a * x1 + b;
      if (c <= 0) return null;
      sol = ent(x1);
    } else if (nivel === 2) {
      a = nz(-9, 9); b = nz(-20, 20);
      if (Math.abs(a) < 2) return null;
      var x2 = nz(-10, 10);
      c = a * x2 + b;
      if (Math.abs(c) > 60) return null;
      sol = ent(x2);
    } else {
      a = nz(-9, 9); b = nz(-20, 20);
      if (Math.abs(a) < 2) return null;
      if (Math.random() < 0.7) {                       // casi siempre, una fracción
        c = nz(-30, 30);
        sol = fr(c - b, a);
        if (esEntero(sol) || Math.abs(sol.n / sol.d) > 15) return null;
      } else {
        var x3 = nz(-15, 15);
        c = a * x3 + b;
        if (Math.abs(c) > 99) return null;
        sol = ent(x3);
      }
    }
    var R = c - b;
    var forma = nivel === 1 ? 0 : rint(0, 2);
    var enunciado = forma === 0 ? lin(a, b) + ' = ' + num(c)
      : forma === 1 ? num(b) + masx(a) + ' = ' + num(c)
      : num(c) + ' = ' + lin(a, b);
    var candidatas = [
      { val: rx(fr(c + b, a)), err: 'Pasaste el ' + num(b) + ' al otro lado con el mismo signo. Lo que ' +
        (b > 0 ? 'suma' : 'resta') + ' de un lado pasa <strong>' + (b > 0 ? 'restando' : 'sumando') + '</strong>: ' +
        cx(a) + ' = ' + num(c) + resta(b) + '.' },
      a < 0
        ? { val: rx(fr(R, -a)), err: 'El ' + num(a) + ' pasa dividiendo <strong>con su signo</strong>: x = ' + num(R) + ' ÷ ' + par(a) + '.' }
        : null,
      { val: rx(fr(R - a, 1)), err: 'El ' + num(a) + ' multiplica a la x, así que pasa <strong>dividiendo</strong>, no restando: x = ' +
        num(R) + ' ÷ ' + par(a) + '.' },
      { val: rx(fr(c - a * b, a)), err: 'Dividiste entre ' + num(a) + ' sólo el ' + num(c) + ' y el ' + num(b) +
        ' se quedó igual. Si divides, se divide <strong>cada término</strong>; es más fácil pasar primero el ' + num(b) + '.' },
      R !== 0 ? { val: rx(fr(a, R)), err: 'Dividiste al revés: es ' + num(R) + ' ÷ ' + par(a) + ', no ' + num(a) + ' ÷ ' + par(R) + '.' } : null,
      { val: rx(ent(R * a)), err: 'El ' + num(a) + ' multiplica a la x: al otro lado pasa <strong>dividiendo</strong>, no multiplicando.' }
    ];
    var pasos = [
      (b > 0 ? 'Resta ' + b : 'Suma ' + (-b)) + ' en los dos lados: ' + cx(a) + ' = ' + num(c) + resta(b) + ' = ' + num(R) + '.',
      'Divide los dos lados entre ' + num(a) + ': x = ' + num(R) + ' ÷ ' + par(a) + ' = <b>' + v(sol) + '</b>.'
    ];
    if (esEntero(sol)) pasos.push('Comprueba: ' + num(a) + ' × ' + par(sol.n) + mas(b) + ' = ' + num(c) + '.');
    return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuaciones de primer grado', ask: 'Resuelve', pasos: pasos });
  }

  /* ---------- ax + b = cx + d ---------- */
  function dosLados(nivel) {
    var a, b, c, d, e = 0, sol, x0;
    if (nivel === 1) {
      c = rint(1, 6); a = c + rint(1, 5); b = rint(0, 12);
      x0 = rint(1, 10);
      d = (a - c) * x0 + b;
      if (d > 60 || d === 0) return null;
      sol = ent(x0);
    } else if (nivel === 2) {
      a = nz(-8, 9); c = nz(-8, 9); b = rint(-15, 15);
      if (a === c) return null;
      x0 = nz(-9, 9);
      d = (a - c) * x0 + b;
      if (Math.abs(d) > 40 || (b === 0 && d === 0)) return null;
      sol = ent(x0);
    } else if (moneda()) {                               // con una fracción de respuesta
      a = nz(-9, 9); c = nz(-9, 9); b = rint(-15, 15); d = rint(-20, 20);
      if (a === c || b === d) return null;
      sol = fr(d - b, a - c);
      if (esEntero(sol)) return null;
    } else {                                              // con un término semejante de más
      a = nz(-9, 9); e = nz(-6, 6); c = nz(-7, 7); b = rint(-15, 15);
      if (a + e === c || a + e === 0 || Math.abs(a + e) > 9) return null;
      x0 = nz(-9, 9);
      d = (a + e - c) * x0 + b;
      if (Math.abs(d) > 40 || b === 0) return null;
      sol = ent(x0);
    }
    var A = a + e - c, R = d - b;
    var izquierda, derecha;
    var forma = nivel === 2 ? rint(0, 1) : 0;
    if (forma === 1 && b !== 0) izquierda = num(b) + masx(a);
    else izquierda = cx(a) + (e ? (b ? mas(b) : '') + masx(e) : (b ? mas(b) : ''));
    if (forma === 1 && d !== 0) derecha = num(d) + masx(c);
    else derecha = d === 0 ? cx(c) : lin(c, d);
    var enunciado = izquierda + ' = ' + derecha;
    var xs = a + e;                                       // las x de la izquierda, ya juntas
    var candidatas = [
      xs + c !== 0 ? { val: rx(fr(R, xs + c)), err: 'Pasaste ' + elTermino(c) + ' al otro lado con el mismo signo: lo que ' +
        (c > 0 ? 'suma' : 'resta') + ' pasa <strong>' + (c > 0 ? 'restando' : 'sumando') + '</strong>. Queda ' + cx(A) + ', no ' + cx(xs + c) + '.' } : null,
      b !== 0 ? { val: rx(fr(d + b, A)), err: 'Al pasar el ' + num(b) + ' al otro lado no le cambiaste el signo: queda ' +
        cx(A) + ' = ' + num(d) + resta(b) + '.' } : null,
      { val: rx(fr(-R, A)), err: 'Los números pasan del lado contrario a las x <strong>cambiando de signo</strong>: queda ' +
        cx(A) + ' = ' + num(R) + ', no ' + num(-R) + '.' },
      xs !== 0 ? { val: rx(fr(R, xs)), err: 'Te faltó pasar ' + elTermino(c) + ' de la derecha: primero se juntan <strong>todas</strong> las x de un lado.' } : null,
      A !== 1 && A !== -1 ? { val: rx(fr(R - A, 1)), err: 'El ' + num(A) + ' multiplica a la x: pasa <strong>dividiendo</strong>, no restando.' } : null,
      e ? { val: rx(fr(R, a - c)), err: 'Del lado izquierdo hay dos términos con x: ' + cx(a) + masx(e) + ' = ' + cx(xs) + '. Hay que juntarlos.' } : null
    ];
    var pasos = [];
    if (e) pasos.push('Junta las x de la izquierda: ' + cx(a) + masx(e) + ' = ' + cx(xs) + '.');
    pasos.push('Las x a la izquierda y los números a la derecha, cada uno con la operación contraria: ' +
      cx(xs) + masx(-c) + ' = ' + num(d) + (b ? resta(b) : '') + '.');
    pasos.push('Simplifica: ' + cx(A) + ' = ' + num(R) + '.');
    pasos.push(A === 1 ? 'Ya está: x = <b>' + v(sol) + '</b>.'
      : 'Divide entre ' + num(A) + ': x = <b>' + v(sol) + '</b>.');
    return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con x en los dos lados', ask: 'Resuelve', pasos: pasos });
  }

  /* ---------- Paréntesis ---------- */
  function parentesis(nivel) {
    var forma = nivel === 1 ? 'simple' : nivel === 2 ? azar(['derecha', 'menos', 'resta']) : azar(['dos', 'iguales']);
    var a, b, c, d, e, f, x0, sol, enunciado, candidatas, pasos;

    if (forma === 'simple') {                            // a(x + b) = c
      a = rint(2, 6); b = nz(-6, 6); x0 = rint(1, 9);
      if (x0 + b <= 0) return null;
      c = a * (x0 + b); sol = ent(x0);
      var ab = a * b;
      enunciado = a + '(x' + mas(b) + ') = ' + num(c);
      candidatas = [
        { val: rx(fr(c - b, a)), err: 'El ' + a + ' multiplica también al ' + num(b) + ': ' + a + '(x' + mas(b) + ') = ' + a + 'x' + mas(ab) +
          ', no ' + a + 'x' + mas(b) + '.' },
        { val: rx(fr(c + ab, a)), err: 'Al pasar el ' + num(ab) + ' al otro lado no le cambiaste el signo.' },
        { val: rx(ent(c - a - b)), err: 'El ' + a + ' multiplica a todo el paréntesis: pasa <strong>dividiendo</strong>, no restando.' },
        { val: rx(ent(c - ab - a)), err: 'El ' + a + ' multiplica a la x: pasa <strong>dividiendo</strong>, no restando.' },
        c - ab !== 0 ? { val: rx(fr(a, c - ab)), err: 'Dividiste al revés: es ' + num(c - ab) + ' ÷ ' + a + '.' } : null
      ];
      pasos = [
        'Quita el paréntesis: el ' + a + ' multiplica a los dos términos, ' + a + 'x' + mas(ab) + ' = ' + num(c) + '.',
        (ab > 0 ? 'Resta ' + ab : 'Suma ' + (-ab)) + ' en los dos lados: ' + a + 'x = ' + num(c - ab) + '.',
        'Divide entre ' + a + ': x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con paréntesis', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'derecha') {                           // a(x + b) = cx + d
      a = nz(-6, 6); c = nz(-5, 5); b = nz(-9, 9);
      if (Math.abs(a) < 2 || a === c) return null;
      x0 = nz(-9, 9);
      d = (a - c) * x0 + a * b;
      if (Math.abs(d) > 40 || d === 0) return null;
      sol = ent(x0);
      var ab2 = a * b, A2 = a - c, R2 = d - ab2;
      enunciado = num(a) + '(x' + mas(b) + ') = ' + lin(c, d);
      candidatas = [
        { val: rx(fr(d - b, A2)), err: 'El ' + num(a) + ' multiplica también al ' + num(b) + ': ' + num(a) + '(x' + mas(b) + ') = ' +
          cx(a) + mas(ab2) + '.' },
        // Con a negativo, el mismo número sale de equivocar el signo al multiplicar: ése es el error más probable.
        { val: rx(fr(d + ab2, A2)), err: a < 0
          ? 'Cuida el signo al quitar el paréntesis: ' + par(a) + ' × ' + par(b) + ' = ' + num(ab2) + '.'
          : 'Al pasar el ' + num(ab2) + ' al otro lado no le cambiaste el signo.' },
        a + c !== 0 ? { val: rx(fr(R2, a + c)), err: 'Pasaste ' + elTermino(c) + ' con el mismo signo: queda ' + cx(A2) + ', no ' + cx(a + c) + '.' } : null,
        { val: rx(fr(-R2, A2)), err: 'Los números pasan del lado contrario a las x cambiando de signo: ' + cx(A2) + ' = ' + num(R2) + '.' },
        A2 !== 1 && A2 !== -1 ? { val: rx(fr(R2 - A2, 1)), err: 'El ' + num(A2) + ' multiplica a la x: pasa <strong>dividiendo</strong>, no restando.' } : null
      ];
      pasos = [
        'Quita el paréntesis: ' + cx(a) + mas(ab2) + ' = ' + lin(c, d) + '.',
        'Junta las x a la izquierda y los números a la derecha: ' + cx(a) + masx(-c) + ' = ' + num(d) + resta(ab2) + ', es decir, ' + cx(A2) + ' = ' + num(R2) + '.',
        A2 === 1 ? 'Ya está: x = <b>' + num(x0) + '</b>.' : 'Divide entre ' + num(A2) + ': x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con paréntesis', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'menos') {                             // −a(x + b) = c
      a = rint(1, 6); b = nz(-9, 9); x0 = nz(-9, 9);
      if (x0 + b === 0) return null;
      c = -a * (x0 + b); sol = ent(x0);
      if (Math.abs(c) > 60) return null;
      var mab = -a * b;                                  // el segundo término al quitar el paréntesis
      enunciado = (a === 1 ? MENOS : MENOS + a) + '(x' + mas(b) + ') = ' + num(c);
      candidatas = [
        { val: rx(fr(c + mab, -a)), err: a === 1
          ? 'El menos de afuera le cambia el signo a <strong>todo</strong> lo de adentro: ' + MENOS + '(x' + mas(b) + ') = ' + MENOS + 'x' + mas(mab) + '.'
          : 'El ' + MENOS + a + ' también multiplica al ' + num(b) + ': ' + par(-a) + ' × ' + par(b) + ' = ' + num(mab) + '.' },
        { val: rx(fr(c - mab, a)), err: 'Quedó ' + cx(-a) + ' = ' + num(c - mab) + ': se divide entre ' + num(-a) + ', con todo y su signo.' },
        a > 1 ? { val: rx(fr(c - b, -a)), err: 'El ' + num(-a) + ' multiplica a los dos términos de adentro, no sólo a la x.' } : null,
        { val: rx(fr(c + mab, a)), err: 'Revisa dos signos: ' + par(-a) + ' × ' + par(b) + ' = ' + num(mab) + ', y al final se divide entre ' + num(-a) + ', con su signo.' },
        { val: rx(ent(c - mab + a)), err: 'El ' + num(-a) + ' multiplica a la x: pasa dividiendo, no sumando ni restando.' }
      ];
      pasos = [
        'Quita el paréntesis; el signo de afuera multiplica a los dos: ' + cx(-a) + mas(mab) + ' = ' + num(c) + '.',
        (mab > 0 ? 'Resta ' + mab : 'Suma ' + (-mab)) + ' en los dos lados: ' + cx(-a) + ' = ' + num(c - mab) + '.',
        'Divide entre ' + num(-a) + ': x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Un menos delante del paréntesis', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'resta') {                             // e − (x + b) = f
      e = rint(2, 15); b = nz(-9, 9); x0 = nz(-9, 9);
      f = e - x0 - b;
      if (Math.abs(f) > 30) return null;
      sol = ent(x0);
      var R3 = f - e + b;                                // −x = R3
      enunciado = e + ' ' + MENOS + ' (x' + mas(b) + ') = ' + num(f);
      candidatas = [
        { val: rx(ent(e + b - f)), err: 'El menos de afuera le cambia el signo a <strong>todo</strong> lo de adentro: ' + MENOS + '(x' + mas(b) + ') = ' + MENOS + 'x' + mas(-b) + '.' },
        { val: rx(ent(R3)), err: 'Quedó ' + MENOS + 'x = ' + num(R3) + ': todavía falta dividir entre ' + MENOS + '1, así que x = ' + num(-R3) + '.' },
        { val: rx(ent(f - e - b)), err: 'El menos de afuera no desaparece: ' + e + ' ' + MENOS + ' (x' + mas(b) + ') = ' + e + ' ' + MENOS + ' x' + mas(-b) + '.' },
        { val: rx(ent(-(f + e + b))), err: 'Al pasar el ' + e + ' al otro lado no le cambiaste el signo: ' + MENOS + 'x = ' + num(f) + ' ' + MENOS + ' ' + e + mas(b) + '.' }
      ];
      pasos = [
        'El menos cambia el signo de todo lo de adentro: ' + e + ' ' + MENOS + ' x' + mas(-b) + ' = ' + num(f) + '.',
        'Pasa los números: ' + MENOS + 'x = ' + num(f) + ' ' + MENOS + ' ' + e + mas(b) + ' = ' + num(R3) + '.',
        'Divide entre ' + MENOS + '1: x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Un menos delante del paréntesis', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'dos') {                               // a(x + b) − c(x + d) = e
      a = rint(2, 7); c = rint(2, 6); b = nz(-6, 6); d = nz(-6, 6);
      if (a === c) return null;
      var Ad = a - c, cte = a * b - c * d;
      if (moneda()) {
        x0 = nz(-8, 8); e = Ad * x0 + cte; sol = ent(x0);
      } else {
        e = nz(-25, 25); sol = fr(e - cte, Ad);
        if (esEntero(sol)) return null;
      }
      if (Math.abs(e) > 50) return null;
      var R4 = e - cte;
      enunciado = a + '(x' + mas(b) + ') ' + MENOS + ' ' + c + '(x' + mas(d) + ') = ' + num(e);
      candidatas = [
        { val: rx(fr(e - a * b - c * d, Ad)), err: 'El ' + MENOS + c + ' multiplica a los dos términos: ' + MENOS + c + '(x' + mas(d) + ') = ' +
          MENOS + c + 'x' + mas(-c * d) + '.' },
        { val: rx(fr(e - a * b + d, Ad)), err: 'El ' + c + ' multiplica también al ' + num(d) + ', no sólo a la x.' },
        { val: rx(fr(e - b + c * d, Ad)), err: 'El ' + a + ' multiplica también al ' + num(b) + ', no sólo a la x.' },
        { val: rx(fr(e + cte, Ad)), err: 'Al pasar el ' + num(cte) + ' al otro lado no le cambiaste el signo.' },
        a + c !== 0 ? { val: rx(fr(R4, a + c)), err: 'Las x son ' + a + 'x ' + MENOS + ' ' + c + 'x = ' + cx(Ad) + ', no ' + cx(a + c) + '.' } : null
      ];
      pasos = [
        'Quita los paréntesis; el ' + MENOS + c + ' multiplica a los dos: ' + a + 'x' + mas(a * b) + masx(-c) + mas(-c * d) + ' = ' + num(e) + '.',
        cte ? 'Junta: ' + lin(Ad, cte) + ' = ' + num(e) + ', así que ' + cx(Ad) + ' = ' + num(R4) + '.'
          : 'Junta: los números se cancelan y queda ' + cx(Ad) + ' = ' + num(e) + '.',
        Ad === 1 ? 'Ya está: x = <b>' + v(sol) + '</b>.' : 'Divide entre ' + num(Ad) + ': x = <b>' + v(sol) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con paréntesis', ask: 'Resuelve', pasos: pasos });
    }

    // iguales: a(x + b) = c(x + d)
    a = rint(2, 7); c = rint(2, 7); b = nz(-6, 6); d = nz(-6, 6);
    if (a === c || a * b === c * d) return null;
    sol = fr(c * d - a * b, a - c);
    if (Math.abs(sol.n / sol.d) > 15) return null;
    var A5 = a - c, R5 = c * d - a * b;
    enunciado = a + '(x' + mas(b) + ') = ' + c + '(x' + mas(d) + ')';
    candidatas = [
      { val: rx(fr(c * d - b, A5)), err: 'El ' + a + ' multiplica también al ' + num(b) + ': ' + a + '(x' + mas(b) + ') = ' + a + 'x' + mas(a * b) + '.' },
      { val: rx(fr(d - a * b, A5)), err: 'El ' + c + ' multiplica también al ' + num(d) + ': ' + c + '(x' + mas(d) + ') = ' + c + 'x' + mas(c * d) + '.' },
      { val: rx(fr(-R5, A5)), err: 'Los números pasan del lado contrario a las x cambiando de signo: ' + cx(A5) + ' = ' + num(R5) + '.' },
      { val: rx(fr(R5, a + c)), err: 'Pasaste el ' + c + 'x con el mismo signo: queda ' + cx(A5) + ', no ' + cx(a + c) + '.' }
    ];
    pasos = [
      'Quita los dos paréntesis: ' + a + 'x' + mas(a * b) + ' = ' + c + 'x' + mas(c * d) + '.',
      'Junta las x a la izquierda y los números a la derecha: ' + cx(A5) + ' = ' + num(R5) + '.',
      A5 === 1 ? 'Ya está: x = <b>' + v(sol) + '</b>.' : 'Divide entre ' + num(A5) + ': x = <b>' + v(sol) + '</b>.'
    ];
    return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con paréntesis', ask: 'Resuelve', pasos: pasos });
  }

  /* ---------- Fracciones ---------- */
  function fracciones(nivel) {
    var forma = nivel === 1 ? azar(['x-entre', 'x-entre', 'coef']) : nivel === 2 ? azar(['agrupa', 'agrupa', 'x-entre']) : azar(['dos', 'cruz']);
    var a, b, c, d, k, x0, sol, enunciado, candidatas, pasos;

    if (forma === 'x-entre') {                           // x/a + b = c
      a = rint(2, 6); b = nz(-9, 9);
      k = nivel === 1 ? rint(1, 9) : nz(-9, 9);
      c = k + b; x0 = a * k; sol = ent(x0);
      if (nivel === 1 && c <= 0) return null;
      enunciado = fraccion('x', a) + mas(b) + ' = ' + num(c);
      candidatas = [
        { val: rx(ent(a * c - b)), err: 'Al multiplicar por ' + a + ' se multiplica <strong>cada término</strong>, también el ' + num(b) + ': x' + mas(a * b) + ' = ' + num(a * c) + '.' },
        { val: rx(fr(c - b, a)), err: 'La x está <strong>dividida</strong> entre ' + a + ': pasa multiplicando, x = ' + num(c - b) + ' × ' + a + '.' },
        { val: rx(ent(a * (c + b))), err: 'Al pasar el ' + num(b) + ' al otro lado no le cambiaste el signo.' },
        { val: rx(ent(c - b)), err: 'Te faltó el ' + a + ': si x ÷ ' + a + ' = ' + num(c - b) + ', x es ' + a + ' veces ' + par(c - b) + '.' }
      ];
      pasos = [
        (b > 0 ? 'Resta ' + b : 'Suma ' + (-b)) + ' en los dos lados: ' + fraccion('x', a) + ' = ' + num(c - b) + '.',
        'Multiplica los dos lados por ' + a + ': x = ' + par(c - b) + ' × ' + a + ' = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con fracciones', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'coef') {                              // ax/b = c
      a = rint(2, 5); b = rint(3, 7);
      if (mcd(a, b) !== 1) return null;
      k = rint(1, 6); x0 = b * k; c = a * k; sol = ent(x0);
      enunciado = fraccion(a + 'x', b) + ' = ' + c;
      candidatas = [
        { val: rx(fr(a * c, b)), err: 'Está al revés: el ' + b + ' divide, así que pasa multiplicando, y el ' + a + ' multiplica, así que pasa dividiendo. x = ' + c + ' × ' + b + ' ÷ ' + a + '.' },
        { val: rx(ent(b * c)), err: 'Eso es ' + a + 'x: te faltó dividir entre ' + a + '.' },
        { val: rx(fr(c, a * b)), err: 'El ' + b + ' divide a la x: pasa <strong>multiplicando</strong>, no dividiendo.' },
        { val: rx(ent(b * c - a)), err: 'El ' + a + ' multiplica a la x: pasa dividiendo, no restando.' }
      ];
      pasos = [
        'Multiplica los dos lados por ' + b + ': ' + a + 'x = ' + (b * c) + '.',
        'Divide entre ' + a + ': x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con fracciones', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'agrupa') {                            // (x + b)/a = c
      a = rint(2, 6); b = nz(-9, 9); c = nz(-9, 9);
      x0 = a * c - b; sol = ent(x0);
      if (x0 === 0 || Math.abs(x0) > 40) return null;
      enunciado = fraccion('x' + mas(b), a) + ' = ' + num(c);
      candidatas = [
        { val: rx(ent(a * (c - b))), err: 'La raya de fracción agrupa <strong>todo</strong> el numerador: no es ' + fraccion('x', a) + mas(b) + '. Por ' + a +
          ' los dos lados: x' + mas(b) + ' = ' + num(a * c) + '.' },
        { val: rx(ent(a * c + b)), err: 'Al pasar el ' + num(b) + ' al otro lado no le cambiaste el signo.' },
        { val: rx(fr(c - a * b, a)), err: 'El ' + a + ' divide: pasa <strong>multiplicando</strong>, no dividiendo.' },
        { val: rx(ent(c - b)), err: 'Te faltó multiplicar por ' + a + ': primero x' + mas(b) + ' = ' + num(a * c) + '.' }
      ];
      pasos = [
        'Multiplica los dos lados por ' + a + ': x' + mas(b) + ' = ' + num(a * c) + '.',
        (b > 0 ? 'Resta ' + b : 'Suma ' + (-b)) + ': x = <b>' + num(x0) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con fracciones', ask: 'Resuelve', pasos: pasos });
    }

    if (forma === 'dos') {                               // x/a ± x/b = c
      a = rint(2, 6); b = rint(2, 8);
      if (a >= b || b % a === 0 && moneda()) return null;
      var signo = Math.random() < 0.7 ? 1 : -1;
      var L = mcm(a, b), p = L / a, q = signo * L / b, K = p + q;   // K x = L c
      if (K === 0 || L > 24) return null;
      if (Math.random() < 0.75) {
        x0 = L * rint(1, 4); c = x0 / a + signo * x0 / b; sol = ent(x0);
        if (x0 > 60) return null;
      } else {
        c = nz(-6, 9); sol = fr(L * c, K);
        if (esEntero(sol)) return null;
      }
      if (!Number.isInteger(c) || c === 0) return null;
      enunciado = fraccion('x', a) + (signo > 0 ? ' + ' : ' ' + MENOS + ' ') + fraccion('x', b) + ' = ' + num(c);
      candidatas = [
        signo > 0 ? { val: rx(fr(c * (a + b), 2)), err: 'Las fracciones no se suman de frente: ' + fraccion('x', a) + ' + ' + fraccion('x', b) + ' no es ' +
          fraccion('2x', a + b) + '. Multiplica todo por ' + L + '.' } : null,
        signo > 0 ? { val: rx(ent(c * (a + b))), err: 'No se suman los denominadores: ' + fraccion('x', a) + ' + ' + fraccion('x', b) + ' no es ' + fraccion('x', a + b) + '.' } : null,
        { val: rx(fr(c, K)), err: 'Multiplicaste por ' + L + ' sólo el lado izquierdo: el ' + num(c) + ' también se multiplica.' },
        K !== 1 ? { val: rx(ent(L * c)), err: 'Quedó ' + cx(K) + ' = ' + num(L * c) + ': falta dividir entre ' + num(K) + '.' } : null,
        signo < 0 ? { val: rx(fr(L * c, p - q)), err: 'Al multiplicar por ' + L + ', el segundo término conserva su signo: ' + p + 'x ' + MENOS + ' ' + (-q) + 'x.' } : null,
        signo < 0 ? { val: rx(fr(-L * c, K)), err: 'Cuidado con el signo: ' + p + 'x ' + MENOS + ' ' + (-q) + 'x = ' + cx(K) + '.' } : null
      ];
      pasos = [
        'Multiplica todo por ' + L + ', el mínimo común múltiplo de ' + a + ' y ' + b + ': ' + cx(p) + masx(q) + ' = ' + num(L * c) + '.',
        'Junta las x: ' + cx(K) + ' = ' + num(L * c) + '.',
        K === 1 ? 'Ya está: x = <b>' + v(sol) + '</b>.' : 'Divide entre ' + num(K) + ': x = <b>' + v(sol) + '</b>.'
      ];
      return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con fracciones', ask: 'Resuelve', pasos: pasos });
    }

    // cruz: (x + b)/a = (x + d)/c
    a = rint(2, 7); c = rint(2, 7); b = nz(-8, 8); d = nz(-8, 8);
    if (a === c || b === d) return null;
    var A6 = c - a, R6 = a * d - c * b;
    sol = fr(R6, A6);
    if (R6 === 0 || Math.abs(sol.n / sol.d) > 20) return null;
    enunciado = fraccion('x' + mas(b), a) + ' = ' + fraccion('x' + mas(d), c);
    candidatas = [
      { val: rx(fr(d - b, A6)), err: 'Al multiplicar en cruz, el ' + c + ' multiplica a <strong>todo</strong> el numerador: ' + c + '(x' + mas(b) + ') = ' + c + 'x' + mas(c * b) + '.' },
      { val: rx(fr(c * d - a * b, a - c)), err: 'En cruz, cada numerador se multiplica por el denominador del <strong>otro</strong> lado: ' + c + '(x' + mas(b) + ') = ' +
        a + '(x' + mas(d) + ').' },
      { val: rx(fr(a * d + c * b, A6)), err: 'Al pasar el ' + num(c * b) + ' al otro lado no le cambiaste el signo.' },
      { val: rx(fr(R6, c + a)), err: 'Pasaste el ' + a + 'x con el mismo signo: queda ' + cx(A6) + ', no ' + cx(c + a) + '.' }
    ];
    pasos = [
      'Multiplica en cruz: ' + c + '(x' + mas(b) + ') = ' + a + '(x' + mas(d) + '), es decir, ' + c + 'x' + mas(c * b) + ' = ' + a + 'x' + mas(a * d) + '.',
      'Junta las x a la izquierda y los números a la derecha: ' + cx(A6) + ' = ' + num(R6) + '.',
      A6 === 1 ? 'Ya está: x = <b>' + v(sol) + '</b>.' : 'Divide entre ' + num(A6) + ': x = <b>' + v(sol) + '</b>.'
    ];
    return armar(enunciado, rx(sol), candidatas, { tema: 'Ecuación con fracciones', ask: 'Resuelve', pasos: pasos });
  }

  /* ---------- Problemas con palabras ---------- */
  var VECES = { 2: 'doble', 3: 'triple', 4: 'cuádruple', 5: 'quíntuple' };
  // [plural, singular, lo de más, lo de más con artículo definido, artículo del plural]
  var COMPRAS = [
    ['cuadernos', 'cuaderno', 'una pluma', 'la pluma', 'los'],
    ['boletos de cine', 'boleto', 'unas palomitas', 'las palomitas', 'los'],
    ['playeras', 'playera', 'una gorra', 'la gorra', 'las'],
    ['libretas', 'libreta', 'un lápiz adhesivo', 'el lápiz adhesivo', 'las'],
    ['kilos de naranja', 'kilo', 'una bolsa de pan', 'la bolsa de pan', 'los']
  ];
  var FAMILIAS = [
    ['Una mamá', 'su hija', 'la hija', 'la mamá', 'las dos'],
    ['Un papá', 'su hijo', 'el hijo', 'el papá', 'los dos'],
    ['Una abuela', 'su nieta', 'la nieta', 'la abuela', 'las dos'],
    ['Un tío', 'su sobrino', 'el sobrino', 'el tío', 'los dos']
  ];
  var REPARTOS = [['Luis', 'Marta'], ['Ana', 'Pedro'], ['Sofía', 'Diego'], ['Carlos', 'Lucía']];
  function entero(x) { return Number.isInteger(x) ? x : null; }
  function cand(n, antes, despues, err) { return n === null || n <= 0 ? null : { val: rp(n, antes, despues), err: err }; }

  function problemas(nivel) {
    var tipo = nivel === 1 ? azar(['numero', 'compra']) : nivel === 2 ? azar(['consecutivos', 'edades', 'reparto']) : azar(['rectangulo', 'igualdad', 'consecutivos']);
    var meta = { tema: 'Problemas con ecuaciones', ask: 'Plantea y resuelve', texto: true };
    var k, b, c, x0, enunciado, candidatas;

    if (tipo === 'numero') {                             // kx ± b = c
      k = rint(2, 5); b = rint(3, 20); x0 = rint(2, 15);
      var suma = moneda();
      c = suma ? k * x0 + b : k * x0 - b;
      if (c <= 0) return null;
      if (k === 2 && !suma && b === 9 && c === 25) return null;     // es de la tarea
      var kx = suma ? c - b : c + b;
      enunciado = 'Si al ' + VECES[k] + ' de un número le ' + (suma ? 'sumas ' : 'restas ') + b + ', obtienes ' + c + '. ¿Cuál es el número?';
      candidatas = [
        cand(entero((suma ? c + b : c - b) / k), '', '', 'Al pasar el ' + b + ' al otro lado no le cambiaste el signo: ' + k + 'x = ' + c + (suma ? ' ' + MENOS + ' ' : ' + ') + b + '.'),
        cand(kx, '', '', 'Eso es ' + k + 'x, el ' + VECES[k] + ' del número: falta dividir entre ' + k + '.'),
        cand(kx - k, '', '', 'El ' + k + ' multiplica al número: se divide entre ' + k + ', no se resta.'),
        cand(kx * k, '', '', 'El ' + k + ' multiplica al número: al otro lado pasa dividiendo, no multiplicando.'),
        cand(entero(c / k) !== null ? (suma ? c / k - b : c / k + b) : null, '', '', 'Dividiste sólo el ' + c + ': primero pasa el ' + b + ' y luego divide todo entre ' + k + '.')
      ];
      meta.pasos = ['Llama x al número: su ' + VECES[k] + ' es ' + k + 'x.',
        'Planteo: ' + k + 'x ' + (suma ? '+ ' : MENOS + ' ') + b + ' = ' + c + '.',
        k + 'x = ' + kx + ', así que x = <b>' + x0 + '</b>.'];
      return armar(enunciado, rp(x0), candidatas, meta);
    }

    if (tipo === 'compra') {                             // n x + p = T
      var cosa = azar(COMPRAS), n = rint(2, 6), p = rint(5, 45);
      x0 = rint(8, 60);
      var T = n * x0 + p;
      if (T > 400) return null;
      enunciado = 'Compraste ' + n + ' ' + cosa[0] + ' del mismo precio y ' + cosa[2] + ' de $' + p + '. Pagaste $' + T +
        ' en total. ¿Cuánto costó cada ' + cosa[1] + '?';
      candidatas = [
        cand(T - p, '$', '', 'Eso cuestan ' + cosa[4] + ' ' + n + ' ' + cosa[0] + ' juntos: falta dividir entre ' + n + '.'),
        cand(entero(T / n), '$', '', 'Repartiste todo el pago entre ' + cosa[4] + ' ' + n + ', pero antes hay que quitar los $' + p + ' de ' + cosa[3] + '.'),
        cand(entero((T + p) / n), '$', '', 'Sumaste los $' + p + ' en vez de restarlos: ' + n + 'x = ' + T + ' ' + MENOS + ' ' + p + '.'),
        cand(T - p - n, '$', '', 'El ' + n + ' multiplica al precio: se divide entre ' + n + ', no se resta.'),
        cand(entero(T / n) !== null ? T / n - p : null, '$', '', 'Dividiste sólo el total: primero quita los $' + p + ' y luego divide entre ' + n + '.')
      ];
      meta.pasos = ['Llama x al precio de cada ' + cosa[1] + ': ' + cosa[4] + ' ' + n + ' cuestan ' + n + 'x.',
        'Planteo: ' + n + 'x + ' + p + ' = ' + T + '.',
        n + 'x = ' + (T - p) + ', así que x = <b>$' + x0 + '</b>.'];
      return armar(enunciado, rp(x0, '$'), candidatas, meta);
    }

    if (tipo === 'consecutivos') {                       // x + (x + s) + (x + 2s) = S
      var clase = nivel === 2 ? azar(['', '', 'pares ', 'impares ']) : azar(['pares ', 'impares ']);
      var s = clase ? 2 : 1;
      x0 = rint(4, 40);
      if (clase === 'pares ' && x0 % 2) x0 += 1;
      if (clase === 'impares ' && !(x0 % 2)) x0 += 1;
      var S = 3 * x0 + 3 * s;
      if (!clase && S === 57) return null;                  // es de la tarea
      var cual = azar(['menor', 'mayor', 'de en medio']);
      var tres = [x0, x0 + s, x0 + 2 * s];
      var pide = cual === 'menor' ? tres[0] : cual === 'mayor' ? tres[2] : tres[1];
      enunciado = 'La suma de tres números ' + clase + 'consecutivos es ' + S + '. ¿Cuál es el ' + cual + '?';
      candidatas = [
        cual !== 'menor' ? cand(tres[0], '', '', 'Ése es el menor, x. ' + (cual === 'mayor' ? 'El mayor es x + ' + 2 * s + '.' : 'El de en medio es x + ' + s + '.')) : null,
        cual !== 'mayor' ? cand(tres[2], '', '', 'Ése es el mayor, x + ' + 2 * s + '. ' + (cual === 'menor' ? 'El menor es x.' : 'El de en medio es x + ' + s + '.')) : null,
        cual !== 'de en medio' ? cand(tres[1], '', '', 'Ése es el de en medio, x + ' + s + '. ' + (cual === 'menor' ? 'El menor es x.' : 'El mayor es x + ' + 2 * s + '.')) : null,
        cand(S - 3 * s, '', '', 'Eso es 3x: falta dividir entre 3.'),
        // S ÷ 3 es el de en medio; quien lo toma por el menor (o por el mayor) se pasa de largo.
        cual === 'mayor' ? cand(S / 3 + 2 * s, '', '', S + ' ÷ 3 = ' + S / 3 + ' es el de en medio, no el menor: el mayor es ' + tres[2] + '.') : null,
        cual === 'menor' ? cand(S / 3 - 2 * s, '', '', S + ' ÷ 3 = ' + S / 3 + ' es el de en medio, no el mayor: el menor es ' + tres[0] + '.') : null
      ];
      meta.pasos = ['Llama x al menor: los tres son x, x + ' + s + ' y x + ' + 2 * s + '.',
        'Planteo: x + (x + ' + s + ') + (x + ' + 2 * s + ') = ' + S + ', es decir, 3x + ' + 3 * s + ' = ' + S + '.',
        'x = ' + x0 + ': son ' + tres.join(', ').replace(/, (\d+)$/, ' y $1') + '. El ' + cual + ' es <b>' + pide + '</b>.'];
      return armar(enunciado, rp(pide), candidatas, meta);
    }

    if (tipo === 'edades') {                             // x + kx = S
      var fam = azar(FAMILIAS);
      k = rint(2, 4); x0 = rint(5, 16);
      var Se = (k + 1) * x0;
      enunciado = fam[0] + ' tiene el ' + VECES[k] + ' de la edad de ' + fam[1] + ', y entre ' + fam[4] + ' suman ' + Se + NB + 'años. ¿Cuántos años tiene ' + fam[2] + '?';
      candidatas = [
        cand(k * x0, '', NB + 'años', 'Ésa es la edad de ' + fam[3] + ', ' + k + ' veces la de ' + fam[2] + '.'),
        cand(entero(Se / 2), '', NB + 'años', 'Repartiste a partes iguales, pero ' + fam[3] + ' tiene ' + k + ' veces la edad de ' + fam[2] + '.'),
        cand(entero(Se / k), '', NB + 'años', 'Olvidaste contar a ' + fam[2] + ': x + ' + k + 'x = ' + (k + 1) + 'x, no ' + k + 'x.'),
        cand(Se - (k + 1), '', NB + 'años', 'El ' + (k + 1) + ' multiplica a la x: se divide entre ' + (k + 1) + ', no se resta.'),
        cand(Se - k, '', NB + 'años', 'El ' + k + ' no se resta: ' + fam[3] + ' tiene ' + k + 'x años, así que entre ' + fam[4] + ' suman x + ' + k + 'x = ' + (k + 1) + 'x.')
      ];
      meta.pasos = ['Llama x a la edad de ' + fam[2] + ': ' + fam[3] + ' tiene ' + k + 'x.',
        'Planteo: x + ' + k + 'x = ' + Se + ', es decir, ' + (k + 1) + 'x = ' + Se + '.',
        'x = <b>' + x0 + NB + 'años</b>.'];
      return armar(enunciado, rp(x0, '', NB + 'años'), candidatas, meta);
    }

    if (tipo === 'reparto') {                            // x + (x + m) = T
      var par2 = azar(REPARTOS), m = 10 * rint(1, 8);
      x0 = 10 * rint(2, 20);
      var Tr = 2 * x0 + m;
      enunciado = par2[0] + ' y ' + par2[1] + ' se reparten $' + Tr + ', y ' + par2[1] + ' recibe $' + m + ' más que ' + par2[0] + '. ¿Cuánto recibe ' + par2[0] + '?';
      candidatas = [
        cand(x0 + m, '$', '', 'Eso recibe ' + par2[1] + ': ' + par2[0] + ' recibe $' + m + ' menos.'),
        cand(Tr / 2, '$', '', 'Repartiste a partes iguales, pero ' + par2[1] + ' recibe $' + m + ' más.'),
        cand(Tr - m, '$', '', 'Eso es 2x, lo de los dos sin la diferencia: falta dividir entre 2.'),
        cand(Tr / 2 - m, '$', '', 'Le quitaste a ' + par2[0] + ' los $' + m + ' completos: la diferencia se reparte, x + (x + ' + m + ') = ' + Tr + '.')
      ];
      meta.pasos = ['Llama x a lo de ' + par2[0] + ': ' + par2[1] + ' recibe x + ' + m + '.',
        'Planteo: x + (x + ' + m + ') = ' + Tr + ', es decir, 2x + ' + m + ' = ' + Tr + '.',
        '2x = ' + (Tr - m) + ', así que x = <b>$' + x0 + '</b>.'];
      return armar(enunciado, rp(x0, '$'), candidatas, meta);
    }

    if (tipo === 'rectangulo') {                         // 2x + 2(x + m) = P
      var mm = 2 * rint(1, 6);
      x0 = rint(3, 20);
      var P = 4 * x0 + 2 * mm;
      enunciado = 'El largo de un rectángulo mide ' + mm + NB + 'cm más que el ancho, y su perímetro es de ' + P + NB + 'cm. ¿Cuánto mide el ancho?';
      candidatas = [
        cand(x0 + mm, '', NB + 'cm', 'Ése es el largo: el ancho mide ' + mm + NB + 'cm menos.'),
        cand(entero(P / 4), '', NB + 'cm', 'Así sería un cuadrado, con los cuatro lados iguales; aquí el largo mide ' + mm + NB + 'cm más.'),
        cand(entero((P - mm) / 2), '', NB + 'cm', 'El perímetro suma los <strong>cuatro</strong> lados: 2x + 2(x + ' + mm + '), no sólo x + (x + ' + mm + ').'),
        cand(entero((P - mm) / 4), '', NB + 'cm', 'El 2 multiplica también al ' + mm + ': 2(x + ' + mm + ') = 2x + ' + 2 * mm + '.')
      ];
      meta.pasos = ['Ancho: x. Largo: x + ' + mm + '.',
        'Perímetro: 2x + 2(x + ' + mm + ') = ' + P + ', es decir, 4x + ' + 2 * mm + ' = ' + P + '.',
        '4x = ' + (P - 2 * mm) + ', así que x = <b>' + x0 + NB + 'cm</b>.'];
      return armar(enunciado, rp(x0, '', NB + 'cm'), candidatas, meta);
    }

    // igualdad: kx + b = x + d
    k = rint(2, 4); x0 = rint(2, 15); b = rint(1, 12);
    var d2 = (k - 1) * x0 + b;
    enunciado = 'Si al ' + VECES[k] + ' de un número le sumas ' + b + ', obtienes lo mismo que si al número le sumas ' + d2 + '. ¿Cuál es el número?';
    candidatas = [
      cand(entero((d2 - b) / (k + 1)), '', '', 'Pasaste la x con el mismo signo: queda ' + (k - 1) + 'x, no ' + (k + 1) + 'x.'),
      cand(entero((d2 + b) / (k - 1)), '', '', 'Al pasar el ' + b + ' al otro lado no le cambiaste el signo.'),
      k > 2 ? cand(d2 - b, '', '', 'Eso es ' + (k - 1) + 'x: falta dividir entre ' + (k - 1) + '.') : null,
      cand(k * x0, '', '', 'Ése es el ' + VECES[k] + ' del número, no el número.'),
      cand(k * x0 + b, '', '', 'Eso da cada lado de la igualdad; el número es la x.'),
      cand(entero(d2 / k), '', '', 'Dividiste entre ' + k + ' sin pasar antes la x de la derecha ni el ' + b + '.')
    ];
    meta.pasos = ['Llama x al número.',
      'Planteo: ' + k + 'x + ' + b + ' = x + ' + d2 + '.',
      k === 2 ? 'Pasa la x y el ' + b + ': x = ' + d2 + ' ' + MENOS + ' ' + b + ' = <b>' + x0 + '</b>.'
        : (k - 1) + 'x = ' + (d2 - b) + ', así que x = <b>' + x0 + '</b>.'];
    return armar(enunciado, rp(x0), candidatas, meta);
  }

  M.GENERADORES['ec-un-lado'] = insiste(unLado);
  M.GENERADORES['ec-dos-lados'] = insiste(dosLados);
  M.GENERADORES['ec-parentesis'] = insiste(parentesis);
  M.GENERADORES['ec-fracciones'] = insiste(fracciones);
  M.GENERADORES['ec-problemas'] = insiste(problemas);
})();
