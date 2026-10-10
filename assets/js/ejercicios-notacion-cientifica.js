/*
 * ejercicios-notacion-cientifica.js — generadores de Notación científica (Física, semana 3).
 *
 * Se carga después de ejercicios-motor.js y ejercicios-fisica.js y usa sus ayudantes
 * (M.fisica). Cada generador devuelve { enunciado, correcta, opciones: [{ val, ok, err }],
 * meta }; cada opción falsa es un error real, con su explicación.
 *
 *   nc-escribir   escribir en notación científica y al revés: el punto que salta
 *   nc-operar     multiplicar y dividir sin calculadora, y ajustar el coeficiente
 *   nc-prefijos   prefijos y potencias de 10: k, M, G, m, µ, n
 *   nc-comparar   órdenes de magnitud: cuál es mayor y cuántas veces
 *
 * Las cuentas son exactas: un número se guarda como sus cifras (un entero), cuántas van
 * después del punto y su exponente; nunca como decimal de la máquina.
 *
 * Ninguno genera un ejercicio de la tarea (examenes-pdf/tarea-notacion-cientifica.html):
 * las listas TAREA_* lo impiden. Si la tarea cambia, hay que cambiarlas.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var MENOS = F.MENOS;
  var NB = ' ';
  var azar = F.azar;

  function entre(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function moneda() { return Math.random() < 0.5; }
  function repetir(s, n) { var r = ''; for (var i = 0; i < n; i++) r += s; return r; }
  function cifras(m) { return String(m).length; }
  function pot10(n) { var r = 1; for (var i = 0; i < n; i++) r *= 10; return r; }
  function rango(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  /* ---------- Números exactos ----------
     { m, k, e }: el coeficiente es m ÷ 10^k (m entero positivo) y el número vale
     coeficiente × 10^e. Así 3.2 × 10⁶ es { m: 32, k: 1, e: 6 } y 0.25 × 10³ es
     { m: 25, k: 2, e: 3 }. */
  function num(m, k, e) { return limpia({ m: m, k: k, e: e }); }
  function limpia(n) {
    var m = n.m, k = n.k;
    while (k > 0 && m % 10 === 0) { m /= 10; k--; }
    while (k < 0) { m *= 10; k++; }
    return { m: m, k: k, e: n.e };
  }
  // El mismo número con el coeficiente entre 1 y 10.
  function normal(n) {
    n = limpia(n);
    var d = cifras(n.m) - 1;
    return limpia({ m: n.m, k: d, e: n.e - n.k + d });
  }
  function esNormal(n) { n = limpia(n); return cifras(n.m) - 1 === n.k; }
  function mismoValor(a, b) { a = normal(a); b = normal(b); return a.m === b.m && a.k === b.k && a.e === b.e; }
  function compara(a, b) {
    a = normal(a); b = normal(b);
    if (a.e !== b.e) return a.e < b.e ? -1 : 1;
    var ma = a.m, mb = b.m, ka = a.k, kb = b.k;
    while (ka < kb) { ma *= 10; ka++; }
    while (kb < ka) { mb *= 10; kb++; }
    return ma === mb ? 0 : (ma < mb ? -1 : 1);
  }
  function por(a, b) { return limpia({ m: a.m * b.m, k: a.k + b.k, e: a.e + b.e }); }
  // a ÷ b, exacto: los pares de la práctica siempre dan un decimal que termina.
  function exacta(a, b) {
    for (var s = 0; s < 8; s++) {
      var arriba = a.m * pot10(s);
      if (arriba % b.m === 0) return limpia({ m: arriba / b.m, k: a.k - b.k + s, e: a.e - b.e });
    }
    return null;
  }
  function entre10(a, b) {
    var r = exacta(a, b);
    if (!r) throw new Error('división que no termina');
    return r;
  }
  function coefDe(texto) {
    var p = String(texto).split('.');
    return { m: parseInt(p.join(''), 10), k: p[1] ? p[1].length : 0 };
  }
  function deTexto(texto, e) { var c = coefDe(texto); return num(c.m, c.k, e); }

  /* ---------- Cómo se escriben ---------- */
  function expTxt(e) { return e < 0 ? MENOS + (-e) : String(e); }
  function paren(e) { return e < 0 ? '(' + MENOS + (-e) + ')' : String(e); }
  function sup(e) { return '<sup>' + expTxt(e) + '</sup>'; }
  function pot(e) { return '10' + sup(e); }
  function miles(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function coefTxt(m, k) {
    var s = String(m);
    if (k <= 0) return s + repetir('0', -k);
    while (s.length <= k) s = '0' + s;
    return s.slice(0, s.length - k) + '.' + s.slice(s.length - k);
  }
  // m × 10^p como número decimal: 3,200,000 o 0.0062.
  function decimalTxt(m, p) {
    var s = String(m);
    if (p >= 0) return miles(s + repetir('0', p));
    var k = -p;
    while (s.length <= k) s = '0' + s;
    var entero = s.slice(0, s.length - k), fraccion = s.slice(s.length - k).replace(/0+$/, '');
    return miles(entero) + (fraccion ? '.' + fraccion : '');
  }
  function coef(n) { n = limpia(n); return coefTxt(n.m, n.k); }
  function cien(n) { n = limpia(n); return coefTxt(n.m, n.k) + NB + '×' + NB + pot(n.e); }
  function deci(n) { n = limpia(n); return decimalTxt(n.m, n.e - n.k); }
  function con(texto, unidad) { return unidad ? texto + NB + unidad : texto; }
  function lugares(n) { return n === 1 ? '1 lugar' : n + ' lugares'; }
  function ceros(n) { return n === 1 ? 'un cero' : n + ' ceros'; }
  function clave(n) { n = normal(n); return coefTxt(n.m, n.k) + 'e' + n.e; }
  function listaCifras(lista) {
    var partes = lista.map(function (c) { return 'el ' + c; });
    if (partes.length < 2) return partes.join('');
    return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
  }

  /* ---------- Lo que pide la tarea: nunca sale en la práctica ni en el reto ---------- */
  function lista(texto) { var r = {}; texto.split(' ').forEach(function (x) { r[x] = true; }); return r; }
  // Ejercicios 1, 2 y 7 (escribir y leer, en las dos direcciones), y los números de las medidas
  // del ejercicio 4 (350 = 3.5 × 10² es un paso de «350 nm»).
  var TAREA_ESCRIBIR = lista('5.2e4 8.1e6 6.4e2 9e-3 5.6e-4 3e-7 4e3 2.5e5 7.08e6 3e-2 1.9e-4 5e-6 4.6e7 3.4e-4 3.5e2 2.5e1 8e1');
  // Ejercicio 4 (con prefijos): la cantidad y su prefijo, en cualquier unidad (25 mA es la misma cuenta que 25 mg).
  var TAREA_PREFIJOS = lista('9|k 4|µ 2.4|G 25|m 80|M 350|n');
  // Ejercicios 6, 7 y 8 (multiplicar y dividir).
  var TAREA_OPERAR = lista('3e-2*3e6 5e4*6e2 8e9/2e4 6e-3/3e-8 2e5/8e2 9e-4*7e-5 4e3*2e5 3e8*1.3e0 1e-4*5e2 3.2e-18/1.6e-19 1e-3/1e-7');
  // Ejercicio 5 (cuál es mayor) y el problema de los virus en un milímetro.
  var TAREA_PAREJAS = [['4e5', '9e4'], ['2e-3', '8e-4'], ['6.1e-7', '6.1e-6'], ['3.5e3', '4e3'], ['1e-3', '1e-7']];
  // También al revés: (8 × 10²) ÷ (2 × 10⁵) es casi la cuenta de la tarea.
  function operacionDeTarea(a, signo, b) {
    return TAREA_OPERAR[clave(a) + signo + clave(b)] || TAREA_OPERAR[clave(b) + signo + clave(a)];
  }
  function prefijoDeTarea(cantidad, sim) { return TAREA_PREFIJOS[cantidad + '|' + sim]; }
  function parejaDeTarea(numeros) {
    var hay = {};
    numeros.forEach(function (n) { hay[clave(n)] = true; });
    return TAREA_PAREJAS.some(function (p) { return hay[p[0]] && hay[p[1]]; });
  }
  // Repite un generador hasta que su ejercicio no sea de la tarea.
  function sinTarea(hacer) {
    for (var intento = 0; intento < 60; intento++) {
      var e = hacer();
      if (e) return e;
    }
    throw new Error('notación científica: no hubo ejercicio fuera de la tarea');
  }

  // La correcta y sus falsas, sin repetidas ni iguales a la correcta, en el orden de preferencia.
  function unicas(correcta, falsas) {
    var vistas = {};
    vistas[correcta] = true;
    return falsas.filter(function (f) {
      if (!f || !f.h || vistas[f.h]) return false;
      vistas[f.h] = true;
      return true;
    });
  }
  function armar(enunciado, correcta, falsas, meta) {
    falsas = unicas(correcta, falsas);
    if (falsas.length < 3) return null;
    meta.pasos = meta.pasos.filter(Boolean);
    return F.armar(enunciado, correcta, falsas, meta);
  }

  /* ================= Escribir y leer ================= */

  // Un número al azar ya en notación científica: «cuantas» cifras (sin ceros al final).
  function numeroAzar(cuantas, exponentes) {
    var m;
    if (cuantas === 1) m = entre(1, 9);
    else { do { m = entre(pot10(cuantas - 1), pot10(cuantas) - 1); } while (m % 10 === 0); }
    return num(m, cuantas - 1, azar(exponentes));
  }

  // Cantidades reales para escribir en notación científica.
  var DATOS = [
    { frase: 'La Luna está a unos 384,000,000 m de la Tierra.', n: num(384, 2, 8), u: 'm' },
    { frase: 'El Sol está a unos 150,000,000,000 m de la Tierra.', n: num(15, 1, 11), u: 'm' },
    { frase: 'El radio de la Tierra mide unos 6,370,000 m.', n: num(637, 2, 6), u: 'm' },
    { frase: 'Un día dura 86,400 s.', n: num(864, 2, 4), u: 's' },
    { frase: 'El sonido avanza unos 340 m en cada segundo.', n: num(34, 1, 2), u: 'm' },
    { frase: 'La Tierra avanza unos 30,000 m en cada segundo alrededor del Sol.', n: num(3, 0, 4), u: 'm' },
    { frase: 'El universo tiene unos 13,800,000,000 años.', n: num(138, 2, 10), u: 'años' },
    { frase: 'Un cabello mide unos 0.00008 m de grueso.', n: num(8, 0, -5), u: 'm' },
    { frase: 'Una bacteria mide unos 0.000002 m.', n: num(2, 0, -6), u: 'm' },
    { frase: 'Un glóbulo rojo mide unos 0.0000075 m.', n: num(75, 1, -6), u: 'm' },
    { frase: 'Un virus de la gripe mide unos 0.0000001 m.', n: num(1, 0, -7), u: 'm' },
    { frase: 'Un átomo mide unos 0.0000000001 m.', n: num(1, 0, -10), u: 'm' }
  ];

  // De número decimal a notación científica. «u»: la unidad, si es una cantidad real.
  function aCientifica(n, u, frase) {
    var e = n.e, grande = e >= 0, d = deci(n), digitos = String(n.m).split('');
    var correcta = con(cien(n), u);
    var falsas = [];
    var alReves = num(n.m, n.k, -e);
    falsas.push({ h: con(cien(alReves), u), err: (grande
      ? 'Signo al revés: un número grande lleva exponente positivo. '
      : 'Signo al revés: un número menor que 1 lleva exponente negativo. ') + cien(alReves) + ' es ' + deci(alReves) + '.' });
    if (grande) {
      var entero = e - n.k >= 0, cuantosCeros = d.replace(/[^0]/g, '').length;
      if (entero && cuantosCeros !== e && cuantosCeros > 0) {
        falsas.push({ h: con(cien(num(n.m, n.k, cuantosCeros)), u), err: 'Contaste los ceros (' + cuantosCeros + '), pero el exponente cuenta los lugares que salta el punto: también pasa sobre ' +
          listaCifras(digitos.slice(1).filter(function (c) { return c !== '0'; })) + '. Son ' + e + '.' });
      }
      falsas.push({ h: con(cien(num(n.m, n.k, e + 1)), u), err: 'Contaste ' + (entero ? 'todas las cifras' : 'las cifras antes del punto') + ' (' + (e + 1) +
        '); el punto se detiene después de la primera, así que salta ' + lugares(e) + '.' });
    } else {
      if (e <= -2) {
        falsas.push({ h: con(cien(num(n.m, n.k, e + 1)), u), err: 'Contaste sólo los ceros después del punto (' + (-e - 1) + '); el punto también salta sobre el ' + digitos[0] + ': son ' + lugares(-e) + '.' });
      }
      if (n.k >= 1) {
        falsas.push({ h: con(cien(num(n.m, n.k, e - n.k)), u), err: 'Contaste todas las cifras después del punto (' + (n.k - e) + '); el punto se detiene después de la primera que no es cero: salta ' + lugares(-e) + '.' });
      }
    }
    falsas.push({ h: con(cien(num(n.m, n.k - 1, e - 1)), u), err: 'Vale lo mismo, pero no está en notación científica: el coeficiente debe quedar entre 1 y 10, ' + coef(n) + '.' });
    falsas.push({ h: con(cien(num(n.m, n.k + 1, e + 1)), u), err: 'El coeficiente quedó menor que 1: el punto va después de la primera cifra' + (grande ? '' : ' que no es cero') + ', ' + coef(n) + '.' });
    falsas.push({ h: con(cien(num(n.m, n.k, e + (grande ? -1 : 1))), u), err: 'Cuenta otra vez los lugares: de donde estaba hasta después del ' + digitos[0] + ', el punto salta ' + lugares(Math.abs(e)) + '.' });
    var pasos = [
      'El punto va después de la primera cifra' + (grande ? '' : ' que no es cero') + ': <b>' + coef(n) + '</b>.',
      grande ? 'Salta ' + lugares(e) + ' a la izquierda: número grande, exponente positivo.'
        : 'Salta ' + lugares(-e) + ' a la derecha: número menor que 1, exponente negativo.',
      con(d, u) + ' = <b>' + correcta + '</b>.'
    ];
    if (frase) {
      return armar(frase + ' ¿Cómo se escribe en notación científica?', correcta, falsas,
        { tema: 'Notación científica', ask: 'Escribe en notación científica', pasos: pasos });
    }
    return armar(d, correcta, falsas, { tema: 'Notación científica', ask: 'Escribe en notación científica', texto: false, pasos: pasos });
  }

  // De notación científica a número decimal.
  function aDecimal(n) {
    var e = n.e, k = n.k, p = e - k, grande = e > 0, correcta = deci(n);
    var falsas = [];
    if (grande) {
      if (k >= 1) falsas.push({ h: decimalTxt(n.m, e), err: 'Le pusiste ' + e + ' ceros al ' + n.m + ', pero el punto se corre ' + lugares(e) + ' desde ' + coef(n) + ': ' +
        (k === 1 ? 'la cifra después del punto ocupa uno.' : 'las ' + k + ' cifras después del punto ocupan ' + k + '.') });
      falsas.push({ h: decimalTxt(n.m, p + 1), err: 'Corriste el punto ' + lugares(e + 1) + '; el exponente dice ' + e + '.' });
      falsas.push({ h: decimalTxt(n.m, p - 1), err: 'Corriste el punto ' + lugares(e - 1) + '; el exponente dice ' + e + '.' });
      falsas.push({ h: decimalTxt(n.m, -e - k), err: 'Con exponente positivo el número crece: el punto va a la derecha.' });
    } else {
      falsas.push({ h: decimalTxt(n.m, p - 1), err: e === -1
        ? 'El punto se corre un solo lugar desde ' + coef(n) + ': queda ' + correcta + ', sin ceros en medio.'
        : 'Pusiste ' + ceros(-e) + ' después del punto, pero el punto se corre ' + lugares(-e) + ' desde ' + coef(n) +
          ' y el ' + String(n.m).charAt(0) + ' ocupa el último: van ' + ceros(-e - 1) + '.' });
      falsas.push({ h: decimalTxt(n.m, p + 1), err: e === -1 ? 'No corriste el punto: el exponente dice ' + expTxt(e) + '.'
        : 'Corriste el punto ' + lugares(-e - 1) + '; el exponente dice ' + expTxt(e) + '.' });
      falsas.push({ h: decimalTxt(n.m, -e - k), err: 'Con exponente negativo el número es menor que 1: el punto va a la izquierda.' });
      falsas.push({ h: MENOS + decimalTxt(n.m, -e - k), err: 'Un exponente negativo no hace negativo al número: ' + pot(e) + ' es ' + decimalTxt(1, e) + ', chico pero positivo.' });
    }
    return armar(cien(n), correcta, falsas, {
      tema: 'Notación científica', ask: 'Escríbelo como número decimal', texto: false,
      pasos: [
        grande ? 'Exponente positivo: el punto se corre ' + lugares(e) + ' a la derecha.'
          : 'Exponente negativo: el punto se corre ' + lugares(-e) + ' a la izquierda.',
        coef(n) + ' → <b>' + correcta + '</b>; los lugares vacíos se llenan con ceros.'
      ]
    });
  }

  // Un coeficiente fuera de 1–10 que hay que ajustar: 52 × 10⁴, 0.36 × 10⁻².
  function aAjustar(n, s) {
    var u = { m: n.m, k: n.k - s, e: n.e - s };          // el coeficiente, 10^s veces más grande
    u = limpia(u);
    var correcta = cien(n);
    var falsas = [
      { h: cien(num(n.m, n.k, u.e)), err: 'Corriste el punto del coeficiente pero no cambiaste el exponente: ' + coef(u) + ' = ' + coef(n) + ' × ' + pot(s) + ', así que queda ' + pot(n.e) + '.' },
      { h: cien(num(n.m, n.k, u.e - s)), err: 'Al revés: el coeficiente se hizo ' + (s > 0 ? 'más chico' : 'más grande') + ', así que el exponente ' + (s > 0 ? 'sube ' : 'baja ') + Math.abs(s) + ', a ' + expTxt(n.e) + '.' },
      { h: cien(u), err: 'Así no está en notación científica: el coeficiente debe quedar entre 1 y 10.' }
    ];
    if (Math.abs(s) === 2) {
      falsas.push({ h: cien(num(n.m, n.k, u.e + (s > 0 ? 1 : -1))), err: coef(u) + ' = ' + coef(n) + ' × ' + pot(s) + ': el punto salta 2 lugares, así que el exponente cambia 2, no 1.' });
    }
    return armar(cien(u), correcta, falsas, {
      tema: 'Notación científica', ask: 'Ajusta a notación científica', texto: false,
      pasos: [
        coef(u) + ' = ' + coef(n) + ' × ' + pot(s) + '.',
        pot(s) + ' × ' + pot(u.e) + ' = ' + pot(n.e) + ': los exponentes se suman.',
        'Queda <b>' + correcta + '</b>.'
      ]
    });
  }

  function genEscribir(nivel) {
    return sinTarea(function () {
      var tipo = azar(nivel === 1 ? ['cientifica', 'cientifica', 'decimal']
        : nivel === 2 ? ['cientifica', 'cientifica', 'decimal', 'decimal', 'dato']
          : ['cientifica', 'decimal', 'dato', 'ajusta', 'ajusta']);
      if (tipo === 'dato') {
        var dato = azar(DATOS);
        return aCientifica(dato.n, dato.u, dato.frase);
      }
      var n;
      if (tipo === 'cientifica') {
        n = nivel === 1 ? numeroAzar(azar([1, 2]), rango(2, 6))
          : nivel === 2 ? numeroAzar(azar([1, 2, 2]), moneda() ? rango(2, 8) : rango(-6, -1))
            : numeroAzar(azar([1, 2, 3]), moneda() ? rango(1, 11) : rango(-9, -1));
        return TAREA_ESCRIBIR[clave(n)] ? null : aCientifica(n);
      }
      if (tipo === 'decimal') {
        n = nivel === 1 ? numeroAzar(azar([1, 2]), rango(2, 5))
          : nivel === 2 ? numeroAzar(azar([1, 2]), moneda() ? rango(2, 6) : rango(-5, -1))
            : numeroAzar(azar([2, 3]), moneda() ? rango(2, 8) : rango(-7, -1));
        return TAREA_ESCRIBIR[clave(n)] ? null : aDecimal(n);
      }
      n = numeroAzar(azar([1, 2]), rango(-9, 9).filter(function (x) { return Math.abs(x) >= 2; }));
      return TAREA_ESCRIBIR[clave(n)] ? null : aAjustar(n, azar([2, 1, 1, -1, -2]));
    });
  }

  /* ================= Multiplicar y dividir ================= */

  function pares(texto) { return texto.split(' ').map(function (p) { return p.split('·'); }); }
  var MUL_SIN_AJUSTE = pares('2·3 2·4 3·3 2·2 1.5·4 1.2·5 2.5·2 1.5·3 4·2 3·2 1.6·5 2·4.5 1.2·3 2.2·4 2.5·3 3·1.5 4·1.5 1.1·6 1.4·2 2·3.5 2·1.5 3·2.5');
  var MUL_CON_AJUSTE = pares('5·4 5·6 4·3 6·7 8·5 2.5·4 3·4 5·5 9·7 6·6 8·8 7·3 4·4 2.5·6 1.5·8 5·8 6·5 9·9 7·7 2·5 4·5 3·5 8·3 6·4 7·4 9·2');
  var DIV_SIN_AJUSTE = pares('8·2 6·3 9·3 8·4 6·2 9·4.5 7.5·2.5 4.8·1.2 6.4·2 9·1.5 5·2 7·2 9·2 3·1.5 6·1.2 8·1.6 7.2·3.6 8.4·2 9.6·3 6.3·3');
  var DIV_CON_AJUSTE = pares('2·8 3·6 1·4 2·5 3·5 1.2·4 4·8 1·2 2·4 1.5·3 3·4 1·5 6·8 4·5 1.8·6 2.4·8 1.4·7');

  function exponentes(nivel) {
    var positivos = rango(1, 9), todos = rango(-9, 9).filter(function (x) { return x !== 0; });
    if (nivel === 1) return [azar(positivos), azar(positivos)];
    if (nivel === 2) return moneda() ? [azar(positivos), azar(positivos)] : [azar(todos), azar(todos)];
    var p = azar(todos), q = azar(todos);
    if (p > 0 && q > 0) q = -q;                            // nivel 3: siempre algún negativo
    return [p, q];
  }

  function multiplica(A, B) {
    var p = A.e, q = B.e, prod = por(num(A.m, A.k, 0), num(B.m, B.k, 0));
    var ajusta = !esNormal(prod), correcto = normal(por(A, B));
    var suma = p + q, falsas = [];
    if (p * q !== suma) falsas.push({ h: cien(num(correcto.m, correcto.k, p * q + (ajusta ? 1 : 0))),
      err: 'Multiplicaste los exponentes: al multiplicar potencias de 10 se suman, ' + pot(p) + ' × ' + pot(q) + ' = ' + pot(suma) + '.' });
    var sumados = normal(limpia({ m: A.m * pot10(B.k) + B.m * pot10(A.k), k: A.k + B.k, e: suma }));
    falsas.push({ h: cien(sumados), err: 'Sumaste los coeficientes; se multiplican: ' + coef(A) + ' × ' + coef(B) + ' = ' + coef(prod) + '.' });
    if (ajusta) {
      falsas.push({ h: cien(num(prod.m, prod.k, suma)), err: 'Vale lo mismo, pero no está en notación científica: ' + coef(prod) + ' = ' + coef(normal(prod)) + ' × 10<sup>1</sup>, así que el exponente sube a ' + expTxt(suma + 1) + '.' });
      falsas.push({ h: cien(num(correcto.m, correcto.k, suma - 1)), err: 'Al pasar de ' + coef(prod) + ' a ' + coef(normal(prod)) + ' el coeficiente se hizo 10 veces más chico: el exponente sube uno, no baja.' });
    }
    var extra = ajusta ? 1 : 0;
    if ((p < 0) !== (q < 0)) {
      falsas.push({ h: cien(num(correcto.m, correcto.k, Math.sign(suma || 1) * (Math.abs(p) + Math.abs(q)) + extra)),
        err: 'Los exponentes tienen signos distintos: se restan, ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + '.' });
      if (suma !== 0) falsas.push({ h: cien(num(correcto.m, correcto.k, -suma + extra)), err: 'El exponente tiene el signo cambiado: ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + '.' });
    } else if (p < 0 && q < 0) {
      falsas.push({ h: cien(num(correcto.m, correcto.k, Math.abs(p - q) + extra)),
        err: 'Los dos exponentes son negativos: se suman y queda negativo, ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + '.' });
      falsas.push({ h: cien(num(correcto.m, correcto.k, -suma + extra)), err: 'Signo cambiado: ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + ', negativo.' });
    }
    var unaSola = Math.max(p, q);
    falsas.push({ h: cien(num(correcto.m, correcto.k, unaSola + extra)), err: 'Te faltó multiplicar las potencias: ' + pot(p) + ' × ' + pot(q) + ' = ' + pot(suma) + '; no se queda sólo ' + pot(unaSola) + '.' });
    falsas.push({ h: cien(num(correcto.m, correcto.k, correcto.e + 1)), err: 'Revisa la suma de los exponentes: ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + (ajusta ? ', y el ajuste la sube a ' + expTxt(suma + 1) : '') + '.' });
    return { correcto: correcto, falsas: falsas, pasos: [
      'Coeficientes: ' + coef(A) + ' × ' + coef(B) + ' = ' + coef(prod) + '. Exponentes: se suman, ' + expTxt(p) + ' + ' + paren(q) + ' = ' + expTxt(suma) + '.',
      ajusta ? coef(prod) + ' = ' + coef(normal(prod)) + ' × 10<sup>1</sup>: el exponente sube a ' + expTxt(suma + 1) + '.' : null,
      'Queda <b>' + cien(correcto) + '</b>.'
    ] };
  }

  function divide(A, B) {
    var p = A.e, q = B.e, cociente = entre10(num(A.m, A.k, 0), num(B.m, B.k, 0));
    var ajusta = !esNormal(cociente), correcto = normal(entre10(A, B));
    var resta = p - q, menos = ajusta ? -1 : 0, falsas = [];
    if (q !== 0 && p % q === 0 && p / q !== resta) falsas.push({ h: cien(num(correcto.m, correcto.k, p / q + menos)),
      err: 'Dividiste los exponentes: al dividir potencias de 10 se restan, ' + expTxt(p) + ' − ' + paren(q) + ' = ' + expTxt(resta) + '.' });
    falsas.push({ h: cien(num(correcto.m, correcto.k, p + q + menos)), err: q > 0
      ? 'Sumaste los exponentes; al dividir se restan: ' + expTxt(p) + ' − ' + q + ' = ' + expTxt(resta) + '.'
      : 'Restar un negativo es sumar: ' + expTxt(p) + ' − ' + paren(q) + ' = ' + expTxt(p) + ' + ' + (-q) + ' = ' + expTxt(resta) + '.' });
    falsas.push({ h: cien(num(correcto.m, correcto.k, q - p + menos)), err: 'Restaste al revés: es el exponente de arriba menos el de abajo, ' + expTxt(p) + ' − ' + paren(q) + ' = ' + expTxt(resta) + '.' });
    if (ajusta) {
      falsas.push({ h: cien(num(cociente.m, cociente.k, resta)), err: 'El coeficiente quedó menor que 1: ' + coef(cociente) + ' = ' + coef(normal(cociente)) + ' × 10<sup>' + MENOS + '1</sup>, así que el exponente baja a ' + expTxt(resta - 1) + '.' });
      falsas.push({ h: cien(num(correcto.m, correcto.k, resta + 1)), err: 'Al pasar de ' + coef(cociente) + ' a ' + coef(normal(cociente)) + ' el coeficiente se hizo 10 veces más grande: el exponente baja uno, no sube.' });
    }
    if (q !== 0) falsas.push({ h: cien(num(correcto.m, correcto.k, p + menos)), err: 'Te faltó dividir las potencias: ' + pot(p) + ' ÷ ' + pot(q) + ' = ' + pot(resta) + '; no se queda ' + pot(p) + '.' });
    var alReves = A.m * pot10(B.k) !== B.m * pot10(A.k) && exacta(num(B.m, B.k, 0), num(A.m, A.k, 0));
    if (alReves) {
      var volteado = normal(alReves);
      falsas.push({ h: cien(num(volteado.m, volteado.k, resta + volteado.e)), err: 'Dividiste los coeficientes al revés: es ' + coef(A) + ' ÷ ' + coef(B) + ' = ' + coef(cociente) + '.' });
    }
    return { correcto: correcto, falsas: falsas, pasos: [
      'Coeficientes: ' + coef(A) + ' ÷ ' + coef(B) + ' = ' + coef(cociente) + '. Exponentes: se restan, ' + expTxt(p) + ' − ' + paren(q) + ' = ' + expTxt(resta) + '.',
      ajusta ? coef(cociente) + ' = ' + coef(normal(cociente)) + ' × 10<sup>' + MENOS + '1</sup>: el exponente baja a ' + expTxt(resta - 1) + '.' : null,
      'Queda <b>' + cien(correcto) + '</b>.'
    ] };
  }

  function genOperar(nivel) {
    return sinTarea(function () {
      var dividir = nivel > 1 && moneda();
      var ajuste = nivel === 1 ? false : nivel === 2 ? moneda() : Math.random() < 0.75;
      var par = azar(dividir ? (ajuste ? DIV_CON_AJUSTE : DIV_SIN_AJUSTE) : (ajuste ? MUL_CON_AJUSTE : MUL_SIN_AJUSTE));
      var ex = exponentes(nivel);
      var A = deTexto(par[0], ex[0]), B = deTexto(par[1], ex[1]);
      if (operacionDeTarea(A, dividir ? '/' : '*', B) || parejaDeTarea([A, B])) return null;
      var r = dividir ? divide(A, B) : multiplica(A, B);
      if (Math.abs(r.correcto.e) > 20) return null;
      return armar('(' + cien(A) + ') ' + (dividir ? '÷' : '×') + ' (' + cien(B) + ')', cien(r.correcto), r.falsas, {
        tema: dividir ? 'Dividir en notación científica' : 'Multiplicar en notación científica',
        ask: dividir ? 'Divide en notación científica' : 'Multiplica en notación científica',
        texto: false, pasos: r.pasos
      });
    });
  }

  /* ================= Prefijos ================= */

  var PREFIJOS = [
    { nombre: 'giga', sim: 'G', e: 9, cuanto: 'mil millones' },
    { nombre: 'mega', sim: 'M', e: 6, cuanto: 'un millón' },
    { nombre: 'kilo', sim: 'k', e: 3, cuanto: 'mil' },
    { nombre: 'mili', sim: 'm', e: -3, cuanto: 'una milésima' },
    { nombre: 'micro', sim: 'µ', e: -6, cuanto: 'una millonésima' },
    { nombre: 'nano', sim: 'n', e: -9, cuanto: 'una milmillonésima' }
  ];
  var UNIDADES = [
    { u: 'm', plural: 'metros', p: 'k m µ n' },
    { u: 's', plural: 'segundos', p: 'm µ n' },
    { u: 'g', plural: 'gramos', p: 'k m µ' },
    { u: 'Hz', plural: 'hertz', p: 'k M G' },
    { u: 'W', plural: 'watts', p: 'k M G m' },
    { u: 'J', plural: 'joules', p: 'k M' },
    { u: 'A', plural: 'amperes', p: 'k m µ' },
    { u: 'V', plural: 'volts', p: 'k m' }
  ];
  function prefijo(sim) { return PREFIJOS.filter(function (p) { return p.sim === sim; })[0]; }
  function prefijoDe(e) { return PREFIJOS.filter(function (p) { return p.e === e; })[0]; }
  function nombrePrefijo(p) { return p.nombre + ' (' + p.sim + ')'; }

  function genPrefijos(nivel) {
    return sinTarea(function () {
      var tipos = nivel === 1 ? ['vale', 'cual', 'convierte', 'convierte']
        : nivel === 2 ? ['vale', 'cual', 'convierte', 'convierte', 'convierte']
          : ['vale', 'convierte', 'convierte', 'ajusta', 'regresa'];
      var tipo = azar(tipos);
      var disponibles = nivel === 1 ? PREFIJOS.filter(function (p) { return p.sim === 'k' || p.sim === 'M' || p.sim === 'm'; }) : PREFIJOS;
      var P = azar(disponibles);
      var otros = PREFIJOS.filter(function (o) { return o !== P; });

      if (tipo === 'vale') {
        var opuesto = prefijoDe(-P.e);
        return armar('¿Cuánto vale el prefijo ' + nombrePrefijo(P) + '?', pot(P.e), [
          { h: pot(-P.e), err: 'Signo al revés: ' + pot(-P.e) + ' es ' + nombrePrefijo(opuesto) + '. ' + (P.e > 0
            ? mayus(P.nombre) + ' es un múltiplo: el exponente es positivo.' : mayus(P.nombre) + ' es una fracción: el exponente es negativo.') }
        ].concat(otros.filter(function (o) { return o !== opuesto; }).map(function (o) {
          return { h: pot(o.e), err: pot(o.e) + ' es ' + nombrePrefijo(o) + ', ' + o.cuanto + '.' };
        })), { tema: 'Prefijos', ask: 'Elige la potencia de 10', pasos: [mayus(P.nombre) + ' (' + P.sim + ') es ' + P.cuanto + ': <b>' + pot(P.e) + '</b>.', 'Los prefijos van de mil en mil: k = 10<sup>3</sup>, M = 10<sup>6</sup>, G = 10<sup>9</sup>; m = 10<sup>' + MENOS + '3</sup>, µ = 10<sup>' + MENOS + '6</sup>, n = 10<sup>' + MENOS + '9</sup>.'] });
      }
      if (tipo === 'cual') {
        var contrario = prefijoDe(-P.e);
        return armar('¿Qué prefijo vale ' + pot(P.e) + '?', nombrePrefijo(P), [
          { h: nombrePrefijo(contrario), err: mayus(contrario.nombre) + ' vale ' + pot(contrario.e) + ': tiene el signo al revés.' }
        ].concat(otros.filter(function (o) { return o !== contrario; }).map(function (o) {
          return { h: nombrePrefijo(o), err: mayus(o.nombre) + ' vale ' + pot(o.e) + ', ' + o.cuanto + '.' };
        })), { tema: 'Prefijos', ask: 'Elige el prefijo', pasos: [pot(P.e) + ' es <b>' + nombrePrefijo(P) + '</b>.', 'Ojo con las mayúsculas: M es mega, un millón; m es mili, una milésima.'] });
      }

      var U = azar(UNIDADES.filter(function (x) { return x.p.split(' ').indexOf(P.sim) !== -1; }));
      if (!U) return null;
      var simbolo = P.sim + U.u;

      if (tipo === 'regresa') {
        // 4.7 × 10⁻⁵ s, ¿cuántos µs son? → 47 µs
        var v = entre(11, 99);
        if (v % 10 === 0) return null;
        var x = normal(num(v, 0, P.e));
        if (prefijoDeTarea(String(v), P.sim) || TAREA_ESCRIBIR[clave(num(v, 0, 0))] || TAREA_ESCRIBIR[clave(x)]) return null;
        var vecino = U.p.split(' ').map(prefijo).filter(function (o) { return o !== P; })
          .sort(function (a, b) { return Math.abs(a.e - P.e) - Math.abs(b.e - P.e); })[0];
        return armar(con(cien(x), U.u), con(String(v), simbolo), [
          { h: con(coefTxt(v, 1), simbolo), err: 'Te faltó un lugar: ' + pot(x.e) + ' es diez veces ' + pot(P.e) + ', así que ' + cien(x) + ' = ' + v + ' × ' + pot(P.e) + '.' },
          { h: con(String(v * 10), simbolo), err: 'Un lugar de más: ' + cien(x) + ' = ' + v + ' × ' + pot(P.e) + ', no ' + (v * 10) + ' × ' + pot(P.e) + '.' },
          { h: con(String(v), vecino.sim + U.u), err: vecino.sim + ' es ' + vecino.nombre + ', ' + pot(vecino.e) + '; ' + P.sim + ' es ' + P.nombre + ', ' + pot(P.e) + '.' },
          { h: con(coefTxt(v, 1), vecino.sim + U.u), err: vecino.sim + ' es ' + vecino.nombre + ', ' + pot(vecino.e) + ', y además falta correr el punto un lugar.' }
        ], { tema: 'Prefijos', ask: 'Escríbelo con el prefijo ' + P.nombre, texto: false, pasos: [
          P.nombre + ' (' + P.sim + ') = ' + pot(P.e) + '.',
          cien(x) + ' = ' + v + ' × ' + pot(P.e) + ': el punto se corre un lugar a la derecha y el exponente baja uno.',
          'Son <b>' + con(String(v), simbolo) + '</b>.'
        ] });
      }

      // convierte / ajusta: «valor» con prefijo → notación científica sin prefijo.
      var valor, s = 0;
      if (tipo === 'ajusta') {
        valor = { m: entre(11, 99) * azar([1, 10]), k: 0, e: 0 };
      } else {
        valor = nivel === 1 ? num(entre(2, 9), 0, 0) : deTexto(azar(['2', '3', '4', '5', '6', '7', '8', '9', '1.5', '2.5', '4.7', '3.6']), 0);
      }
      var texto = coefTxt(valor.m, valor.k);
      var n = normal(num(valor.m, valor.k, P.e));          // 350 nm → 3.5 × 10⁻⁷ m
      s = n.e - P.e;                                       // lo que sube el exponente al ajustar
      if (prefijoDeTarea(texto, P.sim) || TAREA_ESCRIBIR[clave(valor)] || TAREA_ESCRIBIR[clave(n)]) return null;
      var correcta = con(cien(n), U.u);
      var cerca = PREFIJOS.filter(function (o) { return o !== P && Math.abs(o.e - P.e) === 3; });
      var falsas = [
        { h: con(cien(num(n.m, n.k, -P.e + s)), U.u), err: 'Signo al revés: ' + P.nombre + ' es ' + pot(P.e) + '. ' + (P.e > 0
          ? 'Un ' + simbolo + ' es más que un ' + U.u + ': el exponente es positivo.' : 'Un ' + simbolo + ' es una fracción de ' + U.u + ': el exponente es negativo.') }
      ].concat(cerca.map(function (o) {
        return { h: con(cien(num(n.m, n.k, o.e + s)), U.u), err: pot(o.e) + ' es ' + o.nombre + ' (' + o.sim + '); ' + P.nombre + ' es ' + pot(P.e) + '.' };
      }));
      if (s !== 0) {
        falsas.push({ h: con(cien(num(valor.m, valor.k, P.e)), U.u), err: 'Vale lo mismo, pero no está en notación científica: ' + texto + ' = ' + coef(n) + ' × ' + pot(s) + '.' });
        falsas.push({ h: con(cien(num(n.m, n.k, P.e)), U.u), err: 'Te faltó el ' + pot(s) + ': ' + texto + ' = ' + coef(n) + ' × ' + pot(s) + ', así que el exponente queda ' + expTxt(n.e) + '.' });
        falsas.push({ h: con(cien(num(n.m, n.k, P.e - s)), U.u), err: 'Al revés: ' + texto + ' = ' + coef(n) + ' × ' + pot(s) + ', así que el exponente sube ' + s + ', a ' + expTxt(n.e) + '.' });
      }
      falsas.push({ h: con(cien(num(n.m, n.k, n.e + (P.e > 0 ? -1 : 1))), U.u), err: mayus(P.nombre) + ' es ' + P.cuanto + ', ' + pot(P.e) + (s ? ', y ' + texto + ' = ' + coef(n) + ' × ' + pot(s) : '') + ': el exponente queda ' + expTxt(n.e) + '.' });
      return armar(con(texto, simbolo), correcta, falsas, {
        tema: 'Prefijos', ask: 'Escríbelo en ' + U.plural + ', en notación científica', texto: false,
        pasos: [
          P.nombre + ' (' + P.sim + ') = ' + pot(P.e) + '.',
          s ? texto + ' = ' + coef(n) + ' × ' + pot(s) + ', y ' + pot(s) + ' × ' + pot(P.e) + ' = ' + pot(n.e) + '.' : null,
          con(texto, simbolo) + ' = <b>' + correcta + '</b>.'
        ]
      });
    });
  }

  function mayus(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ================= Órdenes de magnitud ================= */

  // Por qué x es mayor que y (los dos ya ajustados).
  function porQue(x, y) {
    if (x.e !== y.e) {
      return 'manda el exponente: ' + expTxt(x.e) + ' > ' + expTxt(y.e) +
        (x.e < 0 && y.e < 0 ? ' (entre negativos, el mayor es el más cercano al cero)' : '');
    }
    return 'tienen el mismo exponente y decide el coeficiente: ' + coef(x) + ' > ' + coef(y);
  }
  function muestra(n) { return n.vista || cien(n); }

  function genComparar(nivel) {
    return sinTarea(function () {
      var tipo = azar(nivel === 1 ? ['mayor', 'mayor', 'menor'] : nivel === 2 ? ['mayor', 'menor', 'veces', 'veces'] : ['mayor', 'menor', 'veces', 'orden', 'orden']);
      if (tipo === 'veces') return veces(nivel);
      if (tipo === 'orden') return ordena();
      return extremo(tipo === 'mayor', nivel);
    });
  }

  function coefAzar(desde, hasta) {
    var opciones = ['1.2', '1.5', '2', '2.5', '3', '3.4', '4', '4.5', '5', '6', '6.5', '7', '8', '8.5', '9'];
    return opciones.filter(function (t) { var v = parseFloat(t); return v >= desde && v <= hasta; });
  }

  // ¿Cuál es el mayor (o el menor)? Las trampas: más coeficiente con menos exponente,
  // el mismo exponente con otro coeficiente, y (nivel 3) un coeficiente sin ajustar.
  function extremo(mayor, nivel) {
    var E = azar(nivel === 1 ? rango(2, 8) : rango(-8, 8).filter(function (x) { return x !== 0 && x !== 1 && x !== -1; }));
    var d = mayor ? -1 : 1;                                // hacia dónde están las trampas
    var c1 = deTexto(azar(mayor ? coefAzar(2, 4.5) : coefAzar(5, 8)), 0);
    var meta = num(c1.m, c1.k, E);
    var trampa = deTexto(azar(mayor ? coefAzar(5, 9) : coefAzar(1.2, 4)), E + d);
    var mismo = deTexto(azar(mayor ? coefAzar(1.2, 1.9) : coefAzar(8.5, 9)), E);
    var lejos = deTexto(azar(mayor ? coefAzar(7, 9) : coefAzar(1.2, 2)), E + 2 * d);
    var numeros = [meta, trampa, mismo, lejos];
    if (nivel === 3) {
      // El de «mismo exponente» se escribe sin ajustar: 15 × 10⁴ parece mayor que 3 × 10⁵… y es 1.5 × 10⁵.
      var c = limpia(mismo);
      mismo.vista = cien(limpia({ m: c.m, k: c.k - 1, e: c.e - 1 }));
    }
    if (numeros.some(function (n, i) { return numeros.some(function (o, j) { return i !== j && compara(n, o) === 0; }); })) return null;
    if (parejaDeTarea(numeros)) return null;
    var correcta = muestra(meta);
    var falsas = numeros.slice(1).map(function (n) {
      var ajustado = normal(n), prefijo = n.vista ? n.vista + ' = ' + cien(ajustado) + '. ' : '';
      var razon = mayor ? porQue(normal(meta), ajustado) : porQue(ajustado, normal(meta));
      return { h: muestra(n), err: prefijo + (mayor ? 'Es menor que ' : 'Es mayor que ') + cien(meta) + ', porque ' + razon + '.' };
    });
    return armar(mayor ? '¿Cuál de estos números es el mayor?' : '¿Cuál de estos números es el menor?', correcta, falsas, {
      tema: 'Órdenes de magnitud', ask: mayor ? 'Elige el mayor' : 'Elige el menor',
      pasos: [
        nivel === 3 ? 'Primero se ajusta todo a notación científica: ' + mismo.vista + ' = ' + cien(normal(mismo)) + '.' : null,
        'Primero se comparan los exponentes; el coeficiente sólo decide si empatan.',
        'El ' + (mayor ? 'mayor' : 'menor') + ' es <b>' + correcta + '</b>.'
      ]
    });
  }

  var TAMANOS = [
    { un: 'un átomo', el: 'el átomo', e: -10 },
    { un: 'un virus', el: 'el virus', e: -7 },
    { un: 'una bacteria', el: 'la bacteria', e: -6 },
    { un: 'una célula', el: 'la célula', e: -5 },
    { un: 'un grano de arena', el: 'el grano de arena', e: -3 },
    { un: 'una persona', el: 'la persona', e: 0 },
    { un: 'un edificio de 30 pisos', el: 'el edificio', e: 2 },
    { un: 'la Tierra', el: 'la Tierra', e: 7 },
    { un: 'el Sol', el: 'el Sol', e: 9 }
  ];
  var CUANTAS = { 1: 'diez', 2: 'cien', 3: 'mil', 4: 'diez mil', 5: 'cien mil', 6: 'un millón' };

  // ¿Cuántas veces más grande? Se divide: se restan los exponentes.
  function veces(nivel) {
    var a = azar(TAMANOS), b = azar(TAMANOS);
    if (a.e <= b.e) return null;
    var d = a.e - b.e;
    if (nivel === 2 && d > 9) return null;
    if (parejaDeTarea([num(1, 0, a.e), num(1, 0, b.e)])) return null;
    var veces = function (e) { return pot(e) + NB + 'veces'; };
    var falsas = [
      { h: d + NB + 'veces', err: 'La resta de los exponentes, ' + d + ', es cuántos pasos de ×10 hay; las veces son ' + pot(d) + (CUANTAS[d] ? ', ' + CUANTAS[d] : '') + '.' },
      { h: veces(-d), err: 'Restaste al revés: ' + a.el + ' es más grande, así que el resultado es mayor que 1.' }
    ];
    if (a.e + b.e !== d && a.e + b.e !== -d) falsas.push({ h: veces(a.e + b.e), err: 'Sumaste los exponentes; para comparar se divide, y al dividir se restan: ' + expTxt(a.e) + ' − ' + paren(b.e) + ' = ' + d + '.' });
    falsas.push({ h: veces(d + 1), err: 'Cuenta los pasos: de ' + pot(b.e) + ' a ' + pot(a.e) + ' hay ' + d + ', no ' + (d + 1) + '.' });
    if (d > 1) falsas.push({ h: veces(d - 1), err: 'Cuenta los pasos: de ' + pot(b.e) + ' a ' + pot(a.e) + ' hay ' + d + ', no ' + (d - 1) + '.' });
    return armar(mayus(a.un) + ' mide unos ' + con(pot(a.e), 'm') + ' y ' + b.un + ', unos ' + con(pot(b.e), 'm') + '. ¿Cuántas veces más grande es ' + a.el + '?',
      veces(d), falsas, {
        tema: 'Órdenes de magnitud', ask: 'Compara',
        pasos: [
          'Para comparar se divide: ' + pot(a.e) + ' ÷ ' + pot(b.e) + ' = 10<sup>' + expTxt(a.e) + ' − ' + paren(b.e) + '</sup> = ' + pot(d) + '.',
          'Son ' + d + ' pasos de ×10: <b>' + veces(d) + '</b>' + (CUANTAS[d] ? ', ' + CUANTAS[d] : '') + '.'
        ]
      });
  }

  // Ordena de menor a mayor: tres números cuyo orden por coeficiente no es el bueno.
  function ordena() {
    var E = azar(rango(-8, 6).filter(function (x) { return Math.abs(x) >= 2; }));
    var x = deTexto(azar(coefAzar(5, 9)), E - 1);         // el menor, con el coeficiente más grande
    var y = deTexto(azar(coefAzar(1.2, 3)), E);
    var z = deTexto(azar(coefAzar(3.4, 4.5)), E);
    var numeros = [x, y, z];
    if (compara(y, z) >= 0 || compara(x, y) >= 0) return null;
    if (parejaDeTarea(numeros)) return null;
    function fila(lista) { return lista.map(cien).join(' &lt; '); }
    function errDe(lista) {
      for (var i = 0; i < lista.length - 1; i++) {
        if (compara(lista[i], lista[i + 1]) > 0) {
          return 'No: ' + cien(lista[i]) + ' es mayor que ' + cien(lista[i + 1]) + ', porque ' + porQue(normal(lista[i]), normal(lista[i + 1])) + '.';
        }
      }
      return '';
    }
    var correcta = fila([x, y, z]);
    var porCoeficiente = [y, z, x];                        // 2, 4, 8: ordenados por el coeficiente
    var alReves = [z, y, x];
    var otro = [x, z, y];
    var falsas = [porCoeficiente, alReves, otro, [y, x, z]].map(function (l) {
      var err = l === porCoeficiente ? 'Ordenaste por el coeficiente, pero primero manda el exponente: ' + cien(x) + ' tiene el menor.' : errDe(l);
      return { h: fila(l), err: err };
    });
    return armar('Ordena de menor a mayor: ' + [y, x, z].map(cien).join(', ') + '.', correcta, falsas, {
      tema: 'Órdenes de magnitud', ask: 'Ordena de menor a mayor',
      pasos: [
        'El menor exponente es ' + expTxt(E - 1) + ': ' + cien(x) + ' va primero, aunque su coeficiente sea el más grande.',
        'Los otros dos tienen ' + pot(E) + ': decide el coeficiente. Queda <b>' + correcta + '</b>.'
      ]
    });
  }

  M.GENERADORES['nc-escribir'] = genEscribir;
  M.GENERADORES['nc-operar'] = genOperar;
  M.GENERADORES['nc-prefijos'] = genPrefijos;
  M.GENERADORES['nc-comparar'] = genComparar;
})();
