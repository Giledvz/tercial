/*
 * ejercicios-conversiones-unidades.js — Física, semana 2: conversiones de unidades.
 *
 * Se carga después de ejercicios-motor.js y ejercicios-fisica.js: usa los ayudantes de
 * M.fisica (armar, azar…). Cada generador devuelve { enunciado, correcta, opciones, meta }.
 *
 *   conv-factor     qué factor de conversión sirve: el que tacha la unidad que sobra
 *                   (en el nivel 3, áreas, volúmenes y la pareja de factores de km/h ↔ m/s)
 *   conv-medidas    longitud, masa, volumen y tiempo con prefijos (k, c, m) y con h, min y s;
 *                   en el nivel 3, áreas y volúmenes: el factor va al cuadrado o al cubo
 *   conv-velocidad  km/h ↔ m/s con dos paréntesis; en el nivel 3, cuál de cuatro velocidades
 *                   escritas en unidades distintas es la más rápida
 *
 * Las opciones falsas son errores de verdad: el factor al revés (multiplicar en vez de
 * dividir), el número equivocado (100 en vez de 1,000; 60 en vez de 3,600), las horas
 * como si fueran de 100 minutos, olvidar una de las dos unidades de una velocidad o no
 * elevar el factor en un área o un volumen. Ninguna pregunta repite un ejercicio de la
 * tarea (examenes-pdf/tarea-conversiones-unidades.html): ver TAREA y SIN_FACTOR.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var azar = F.azar;
  var NB = ' ';

  /* ---------- Números y piezas ---------- */
  // 2.4 × 1,000 debe dar 2,400 y no 2,399.9999…: se redondea a 12 cifras.
  function limpio(x) { return Number(x.toPrecision(12)); }
  // Se puede escribir sin potencias de 10 (eso es de la semana 3) y con 6 decimales a lo más.
  function escribible(x) {
    if (!(x > 0) || !isFinite(x)) return false;
    var s = String(limpio(x));
    if (/e/i.test(s)) return false;
    var dec = s.split('.')[1];
    return !dec || dec.length <= 6;
  }
  // Punto decimal y coma de miles: 1,000 · 2,400 · 0.0045.
  function fmt(x) {
    var p = String(limpio(x)).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (p[1] ? '.' + p[1] : '');
  }
  function med(x, u) { return fmt(x) + NB + u; }
  function igual(a, ua, b, ub) { return med(a, ua) + ' = ' + med(b, ub); }
  function fr(n, d) { return '<span class="fr"><span class="fr__n">' + n + '</span><span class="fr__d">' + d + '</span></span>'; }
  // Sin exponente: los dos paréntesis de las velocidades, uno para la distancia y otro para el tiempo.
  function par(html) { return '<span class="conv-pot"><span class="conv-par">(</span>' + html + '<span class="conv-par">)</span></span>'; }
  // Un factor al cuadrado o al cubo: el exponente va como dígito, del tamaño de un exponente.
  function pot(html, e) {
    var d = e === '²' ? '2' : e === '³' ? '3' : e;
    return '<span class="conv-pot"><span class="conv-par">(</span>' + html + '<span class="conv-par">)</span><span class="conv-exp">' + d + '</span></span>';
  }
  function cifra(x) { return limpio(x); }

  var NOMBRE = {
    km: 'kilómetros', m: 'metros', cm: 'centímetros', mm: 'milímetros', kg: 'kilogramos', g: 'gramos',
    mg: 'miligramos', L: 'litros', mL: 'mililitros', h: 'horas', min: 'minutos', s: 'segundos',
    'm²': 'metros cuadrados', 'cm²': 'centímetros cuadrados', 'mm²': 'milímetros cuadrados',
    'km²': 'kilómetros cuadrados', 'm³': 'metros cúbicos', 'cm³': 'centímetros cúbicos'
  };
  function los(u) { return (u === 'h' ? 'las ' : 'los ') + NOMBRE[u]; }

  // Lo que pregunta la tarea no sale aquí, ni de ida ni de vuelta: [a, unidad, b, unidad] con a = b.
  var TAREA = [
    [4.5, 'km', 4500, 'm'], [0.8, 'km', 800, 'm'], [2.3, 'km', 2300, 'm'], [1.75, 'm', 175, 'cm'],
    [0.6, 'm', 60, 'cm'], [4.5, 'cm', 45, 'mm'], [2.5, 'm', 2500, 'mm'], [3.2, 'kg', 3200, 'g'],
    [0.75, 'kg', 750, 'g'], [1.5, 'L', 1500, 'mL'], [0.6, 'L', 600, 'mL'], [0.25, 'g', 250, 'mg'],
    [3.5, 'h', 210, 'min'], [0.75, 'h', 45, 'min'], [4, 'min', 240, 's'], [2, 'h', 7200, 's'],
    [15, 'min', 900, 's'], [1.2, 'h', 72, 'min'], [3, 'km', 3000, 'm'], [2.8, 'km', 2800, 'm'],
    [2, 'm²', 20000, 'cm²'], [0.96, 'm²', 9600, 'cm²'], [60, 'L', 60000, 'cm³'],
    [36, 'km/h', 10, 'm/s'], [108, 'km/h', 30, 'm/s'], [18, 'km/h', 5, 'm/s'], [43.2, 'km/h', 12, 'm/s'],
    [144, 'km/h', 40, 'm/s'], [7.2, 'km/h', 2, 'm/s'], [45, 'km/h', 12.5, 'm/s'], [126, 'km/h', 35, 'm/s']
  ];
  function deLaTarea(x, u) {
    x = cifra(x);
    return TAREA.some(function (t) { return (t[0] === x && t[1] === u) || (t[2] === x && t[3] === u); });
  }
  // Los factores que la tarea pide escribir (ejercicio 2): «elige el factor» no los contesta.
  var SIN_FACTOR = { 'cm>m': 1, 'mm>cm': 1, 'm>mm': 1, 's>min': 1, 'mL>L': 1, 'mg>g': 1 };

  // La correcta y tres falsas distintas, todas escribibles; si no alcanzan, es un error del generador.
  function arma(enunciado, correcta, falsas, meta) {
    var vistas = {};
    vistas[correcta] = true;
    var buenas = falsas.filter(function (f) {
      if (!f || !f.h || vistas[f.h]) return false;
      vistas[f.h] = true;
      return true;
    });
    if (buenas.length < 3) throw new Error('conversiones: faltan opciones falsas en «' + enunciado + '»');
    return F.armar(enunciado, correcta, buenas, meta);
  }
  // Una opción numérica falsa. Si su cuenta no termina (4 ÷ 60 = 0.0666…), va como la escribiría
  // quien la hizo, con dos cifras: 0.067. Si ni así se puede escribir, no se ofrece.
  function falsa(x, u, err) {
    var y = escribible(x) ? x : (x > 0 && isFinite(x) ? Number(x.toPrecision(2)) : NaN);
    return escribible(y) ? { h: med(y, u), err: err } : null;
  }

  // Velocidades con conversión exacta: múltiplos de 18 km/h dan m/s enteros; de 9, medios.
  var KMH_ENTEROS = [54, 72, 90, 144, 180, 216, 288];
  var MS_ENTEROS = [15, 20, 25, 50, 60, 80];
  var KMH_MEDIOS = [9, 27, 63, 81, 99];
  var MS_MEDIOS = [2.5, 7.5, 17.5, 22.5];

  /* ---------- Las equivalencias: 1 g = n c (g, la unidad grande; c, la chica) ----------
     conf: los números con que se confunde n, cada uno con su explicación. */
  var EQ = [
    { g: 'km', c: 'm', n: 1000, nivel: 1, conf: [
      { n: 100, err: 'Kilo quiere decir mil, no cien: 1 km = 1,000 m.' },
      { n: 10000, err: 'Sobra un cero: kilo quiere decir mil, 1 km = 1,000 m.' }] },
    { g: 'm', c: 'cm', n: 100, nivel: 1, conf: [
      { n: 1000, err: '1,000 son los milímetros de un metro; centímetros caben 100.' },
      { n: 10, err: '10 son los milímetros de un centímetro; en un metro caben 100 cm.' }] },
    { g: 'm', c: 'mm', n: 1000, nivel: 1, conf: [
      { n: 100, err: '100 son los centímetros de un metro; milímetros caben 1,000.' },
      { n: 10, err: '10 son los milímetros de un centímetro; en un metro caben 1,000 mm.' }] },
    { g: 'cm', c: 'mm', n: 10, nivel: 2, conf: [
      { n: 100, err: 'En un centímetro caben 10 mm, no 100: 100 son los centímetros de un metro.' },
      { n: 1000, err: 'En un centímetro caben 10 mm; 1,000 son los milímetros de un metro.' }] },
    { g: 'kg', c: 'g', n: 1000, nivel: 1, conf: [
      { n: 100, err: 'Kilo quiere decir mil, no cien: 1 kg = 1,000 g.' },
      { n: 10000, err: 'Sobra un cero: kilo quiere decir mil, 1 kg = 1,000 g.' }] },
    { g: 'g', c: 'mg', n: 1000, nivel: 2, conf: [
      { n: 100, err: 'Mili quiere decir un milésimo: 1 g = 1,000 mg, no 100.' },
      { n: 10, err: 'Mili quiere decir un milésimo: en un gramo caben 1,000 mg.' }] },
    { g: 'L', c: 'mL', n: 1000, nivel: 2, conf: [
      { n: 100, err: 'Mili quiere decir un milésimo: 1 L = 1,000 mL, no 100.' },
      { n: 10, err: 'Mili quiere decir un milésimo: en un litro caben 1,000 mL.' }] },
    { g: 'h', c: 'min', n: 60, nivel: 1, conf: [
      { n: 100, err: 'El tiempo no va de 10 en 10: 1 h = 60 min, no 100.' },
      { n: 3600, err: '3,600 son los segundos de una hora; minutos son 60.' }] },
    { g: 'min', c: 's', n: 60, nivel: 1, conf: [
      { n: 100, err: 'El tiempo no va de 10 en 10: 1 min = 60 s, no 100.' },
      { n: 3600, err: '3,600 son los segundos de una hora; un minuto tiene 60.' }] },
    { g: 'h', c: 's', n: 3600, nivel: 2, conf: [
      { n: 60, err: '60 son los minutos de una hora; segundos son 60 × 60 = 3,600.' },
      { n: 360, err: 'Se perdió un cero: 60 × 60 = 3,600.' }] },
    { g: 'm³', c: 'L', n: 1000, nivel: 3, conf: [
      { n: 1, err: 'Un litro es mucho menos que un metro cúbico: en 1 m³ caben 1,000 L.' },
      { n: 100, err: 'En 1 m³ caben 1,000 L, no 100: un litro es un cubo de 10 cm por lado.' }] },
    { g: 'L', c: 'cm³', n: 1000, nivel: 3, conf: [
      { n: 100, err: 'Un litro es un cubo de 10 cm por lado: 10 × 10 × 10 = 1,000 cm³, no 100.' },
      { n: 10, err: 'Un litro es un cubo de 10 cm por lado: el 10 va al cubo, 1,000 cm³.' }] }
  ];
  function eqDe(g, c) { return EQ.filter(function (e) { return e.g === g && e.c === c; })[0]; }

  // Valores de partida para cada sentido («de>a»), escogidos para que el resultado sea limpio.
  var VALORES = {
    'km>m': [2, 3, 5, 0.5, 1.5, 2.5, 7, 0.3, 1.2, 3.5, 12, 0.25],
    'm>km': [3000, 500, 1500, 2500, 4200, 12000, 700, 50, 350],
    'm>cm': [2, 3, 0.5, 1.5, 1.8, 0.25, 4.2, 0.07, 1.6],
    'cm>m': [300, 250, 50, 120, 85, 1500, 7, 160],
    'm>mm': [2, 0.5, 1.2, 0.03, 3.5, 0.75],
    'mm>m': [3000, 500, 1250, 80, 25000, 600],
    'cm>mm': [3, 12, 0.8, 25, 1.5, 7.5],
    'mm>cm': [30, 85, 120, 5, 250, 16],
    'kg>g': [2, 0.5, 1.5, 4, 2.3, 0.08, 1.2],
    'g>kg': [3000, 500, 1500, 80, 12000, 250],
    'g>mg': [2, 0.5, 1.5, 0.3, 0.05],
    'mg>g': [500, 2000, 1500, 80, 300],
    'L>mL': [2, 0.5, 3, 1.2, 0.33, 0.25],
    'mL>L': [500, 250, 2000, 330, 1200, 355],
    'h>min': [2, 3, 4, 5],
    'h>min:dec': [1.5, 0.5, 2.5, 0.25, 1.25],
    'min>h': [120, 90, 30, 150, 15, 180, 75],
    'min>s': [2, 3, 5, 10],
    'min>s:dec': [0.5, 2.5, 1.25, 3.5],
    's>min': [120, 180, 30, 150, 600, 300],
    'h>s': [0.5, 1.5, 3, 0.25],
    's>h': [1800, 5400, 10800, 36000],
    'm³>L': [2, 0.5, 1.5, 3, 0.25, 4],
    'L>m³': [500, 2000, 1500, 250, 3000],
    'L>cm³': [2, 0.5, 1.5, 0.25, 3],
    'cm³>L': [500, 2000, 750, 250, 1500, 3000]
  };
  // Escoge un valor que no sea de la tarea, ni él ni su resultado.
  function valor(lista, de, factor, a) {
    var opciones = lista.filter(function (v) { return !deLaTarea(v, de) && !deLaTarea(v * factor, a); });
    return azar(opciones);
  }

  /* ---------- Sentidos de conversión ---------- */
  // Un sentido es { de, a, e, f }: de una unidad a otra, con su equivalencia y el factor (multiplica).
  function sentido(e, haciaChica) {
    return haciaChica ? { de: e.g, a: e.c, e: e, f: e.n } : { de: e.c, a: e.g, e: e, f: 1 / e.n };
  }
  function sentidosDe(nivel, conFactor) {
    var lista = [];
    EQ.forEach(function (e) {
      if (e.nivel > Math.min(nivel, 2)) return;
      [true, false].forEach(function (baja) {
        var s = sentido(e, baja);
        if (conFactor && SIN_FACTOR[s.de + '>' + s.a]) return;
        if (!VALORES[s.de + '>' + s.a]) return;
        lista.push(s);
      });
    });
    return lista;
  }

  /* =====================================================================
     conv-factor · ¿Qué factor sirve? El que tiene abajo la unidad que se quiere quitar.
     ===================================================================== */
  function factorSimple(nivel) {
    var s = azar(sentidosDe(nivel, true));
    var e = s.e, X = s.de, Y = s.a;
    var cant = function (u, n) { return u === e.g ? 1 : n; };          // 1 g = n c
    var hecho = function (n, arriba, abajo) { return fr(med(cant(arriba, n), arriba), med(cant(abajo, n), abajo)); };
    var v = valor(VALORES[X + '>' + Y], X, s.f, Y);
    var correcta = hecho(e.n, Y, X);
    var falsas = [
      { h: hecho(e.n, X, Y), err: 'Al revés: ' + los(X) + ' quedan arriba y no se cancelan. La unidad que quieres quitar va abajo.' },
      { h: fr(med(cant(X, e.n), Y), med(cant(Y, e.n), X)),
        err: 'Los números están cambiados: ' + igual(1, e.g, e.n, e.c) + ', no ' + igual(e.n, e.g, 1, e.c) + '.' }
    ].concat(e.conf.map(function (c) { return { h: hecho(c.n, Y, X), err: c.err }; }));
    return arma(med(v, X) + ' → ' + Y, correcta, falsas, {
      tema: 'Factor de conversión', ask: 'Elige el factor que convierte', texto: false,
      pasos: ['Equivalencia: ' + igual(1, e.g, e.n, e.c) + '.',
        'Quieres quitar ' + los(X) + ': van abajo. El factor es ' + correcta + '.',
        med(v, X) + ' × ' + correcta + ' = <b>' + med(v * s.f, Y) + '</b>.']
    });
  }

  // Áreas y volúmenes: el factor de la longitud, al cuadrado o al cubo.
  var POTENCIAS = [
    { g: 'm', c: 'cm', n: 100, e: 2, baja: [0.5, 1.5, 2.5, 3, 4, 0.25, 0.8, 1.2, 6], sube: [5000, 2500, 15000, 500, 40000, 7500, 12000] },
    { g: 'cm', c: 'mm', n: 10, e: 2, baja: [2, 3, 5, 1.5, 0.5, 12, 25], sube: [300, 450, 50, 1200, 2500] },
    { g: 'km', c: 'm', n: 1000, e: 2, baja: [2, 3, 0.5, 1.5, 4], sube: [2000000, 500000, 3500000, 250000] },
    { g: 'm', c: 'cm', n: 100, e: 3, baja: [2, 0.5, 3, 1.5, 0.25], sube: [500000, 2000000, 250000, 1500000] }
  ];
  var EXP = { 2: '²', 3: '³' };
  var CONF_POT = { 'm-cm': 10, 'cm-mm': 100, 'km-m': 100 };
  function eleva(p, baja) {
    var X = baja ? p.g : p.c, Y = baja ? p.c : p.g;
    var sup = EXP[p.e];
    var f = baja ? Math.pow(p.n, p.e) : 1 / Math.pow(p.n, p.e);
    return { X: X, Y: Y, Xs: X + sup, Ys: Y + sup, sup: sup, f: f, otro: EXP[p.e === 2 ? 3 : 2] };
  }
  // «1 m² = 100 cm × 100 cm = 10,000 cm²»
  function equivalenciaPot(p) {
    var lado = med(p.n, p.c), lados = [];
    for (var i = 0; i < p.e; i++) lados.push(lado);
    return '1' + NB + p.g + EXP[p.e] + ' = ' + lados.join(' × ') + ' = ' + med(Math.pow(p.n, p.e), p.c + EXP[p.e]);
  }

  function factorPotencia() {
    var p = azar(POTENCIAS), baja = Math.random() < 0.6;
    var k = eleva(p, baja);
    var v = valor(baja ? p.baja : p.sube, k.Xs, k.f, k.Ys);
    var cant = function (u, n) { return u === p.g ? 1 : n; };
    var base = function (n, arriba, abajo) { return fr(med(cant(arriba, n), arriba), med(cant(abajo, n), abajo)); };
    var correcta = pot(base(p.n, k.Y, k.X), k.sup);
    var area = p.e === 2;
    var falsas = [
      { h: base(p.n, k.Y, k.X), err: area
        ? 'Sin elevar al cuadrado sólo se tacha uno de los dos ' + k.X + ' de ' + k.Xs + '. En un área, el factor va al cuadrado.'
        : 'Sin elevar al cubo sólo se tacha uno de los tres ' + k.X + ' de ' + k.Xs + '. En un volumen, el factor va al cubo.' },
      { h: pot(base(p.n, k.X, k.Y), k.sup), err: 'Al revés: ' + los(k.Xs) + ' quedan arriba y no se cancelan. La unidad que quieres quitar va abajo.' },
      { h: pot(base(p.n, k.Y, k.X), k.otro), err: area
        ? 'Al cubo es para los volúmenes. Un área tiene dos medidas, largo y ancho: el factor va al cuadrado.'
        : 'Al cuadrado es para las áreas. Un volumen tiene tres medidas: el factor va al cubo.' },
      { h: pot(base(CONF_POT[p.g + '-' + p.c], k.Y, k.X), k.sup),
        err: 'La equivalencia es ' + igual(1, p.g, p.n, p.c) + ', no ' + igual(1, p.g, CONF_POT[p.g + '-' + p.c], p.c) + '.' }
    ];
    return arma(med(v, k.Xs) + ' → ' + k.Ys, correcta, falsas, {
      tema: 'Áreas y volúmenes', ask: 'Elige el factor que convierte', texto: false,
      pasos: [equivalenciaPot(p) + '.',
        'El factor de la longitud va ' + (area ? 'al cuadrado' : 'al cubo') + ', con ' + los(k.X) + ' abajo: ' + correcta + '.',
        'Resultado: <b>' + med(v * k.f, k.Ys) + '</b>.']
    });
  }

  // km/h ↔ m/s: dos factores, uno para la longitud y otro para el tiempo.
  var KM_A_M = fr(med(1000, 'm'), med(1, 'km')), M_A_KM = fr(med(1, 'km'), med(1000, 'm'));
  var H_ARRIBA = fr(med(1, 'h'), med(3600, 's')), S_ARRIBA = fr(med(3600, 's'), med(1, 'h'));
  function factorVelocidad() {
    var deKmh = Math.random() < 0.6;
    var v = azar((deKmh ? KMH_ENTEROS : MS_ENTEROS).filter(function (x) {
      return !deLaTarea(x, deKmh ? 'km/h' : 'm/s') && !deLaTarea(deKmh ? x / 3.6 : x * 3.6, deKmh ? 'm/s' : 'km/h');
    }));
    var x = ' × ';
    var correcta, falsas, pasos;
    if (deKmh) {
      correcta = KM_A_M + x + H_ARRIBA;
      falsas = [
        { h: KM_A_M + x + S_ARRIBA, err: 'Las horas no se cancelan: en km/h la h está abajo, así que en su factor va arriba.' },
        { h: KM_A_M + x + fr(med(1, 'h'), med(60, 's')), err: 'Una hora tiene 3,600 s, no 60: 60 son sus minutos.' },
        { h: M_A_KM + x + H_ARRIBA, err: 'Los kilómetros no se cancelan: en km/h están arriba, así que en su factor van abajo.' },
        { h: KM_A_M, err: 'Falta el factor del tiempo: así quedan m/h, no m/s.' }
      ];
      pasos = ['En km/h hay que quitar dos unidades: los kilómetros, que están arriba, y las horas, que están abajo.',
        'Cada una va del lado contrario en su factor: ' + correcta + '.',
        'Resultado: ' + med(v, 'km/h') + ' = <b>' + med(v / 3.6, 'm/s') + '</b>.'];
    } else {
      correcta = M_A_KM + x + S_ARRIBA;
      falsas = [
        { h: M_A_KM + x + H_ARRIBA, err: 'Los segundos no se cancelan: en m/s la s está abajo, así que en su factor va arriba.' },
        { h: M_A_KM + x + fr(med(60, 's'), med(1, 'h')), err: 'Una hora tiene 3,600 s, no 60: 60 son sus minutos.' },
        { h: KM_A_M + x + S_ARRIBA, err: 'Los metros no se cancelan: en m/s están arriba, así que en su factor van abajo.' },
        { h: S_ARRIBA, err: 'Falta el factor de la longitud: así quedan m/h, no km/h.' }
      ];
      pasos = ['En m/s hay que quitar dos unidades: los metros, que están arriba, y los segundos, que están abajo.',
        'Cada una va del lado contrario en su factor: ' + correcta + '.',
        'Resultado: ' + med(v, 'm/s') + ' = <b>' + med(v * 3.6, 'km/h') + '</b>.'];
    }
    return arma(med(v, deKmh ? 'km/h' : 'm/s') + ' → ' + (deKmh ? 'm/s' : 'km/h'), correcta, falsas, {
      tema: 'Factor de conversión', ask: 'Elige los factores que convierten', texto: false, pasos: pasos
    });
  }

  function genFactor(nivel) {
    if (nivel < 3) return factorSimple(nivel);
    var r = Math.random();
    return r < 0.4 ? factorPotencia() : r < 0.7 ? factorVelocidad() : factorSimple(2);
  }

  /* =====================================================================
     conv-medidas · Convierte: prefijos (k, c, m), h, min y s; en el nivel 3, áreas y volúmenes.
     ===================================================================== */
  // Las horas como si tuvieran 100 minutos: 1.5 h → «1 h 50 min» = 110 min.
  function comoCien(v) { var ent = Math.floor(v), dec = cifra(v - ent); return { ent: ent, dec: dec, mal: ent * 60 + Math.round(dec * 100) }; }

  function medidaLineal(nivel) {
    var lista = sentidosDe(nivel, false).filter(function (s) {
      return nivel > 1 || ['h>s', 's>h', 'min>h', 's>min'].indexOf(s.de + '>' + s.a) === -1;
    });
    var s = azar(lista);
    var e = s.e, X = s.de, Y = s.a, baja = s.f > 1;
    var clave = X + '>' + Y;
    // En el nivel 2 las horas y los minutos también llevan decimales.
    var conDecimales = nivel >= 2 && VALORES[clave + ':dec'] && Math.random() < 0.6;
    var v = valor(VALORES[conDecimales ? clave + ':dec' : clave], X, s.f, Y);
    var r = v * s.f;
    var esTiempo = X === 'h' || X === 'min' || X === 's';
    var falsas = [];
    // Tiempo: 0.5 h no son 50 min; y 1 h 30 min no se escribe 1.3 h. Van primero: si su número
    // coincide con el de «100 en vez de 60», se queda esta explicación, que es la más precisa.
    if (esTiempo && baja && e.n === 60 && cifra(v % 1) !== 0) {
      var c = comoCien(v);
      falsas.push(falsa(c.mal, Y, fmt(c.dec) + NB + X + ' no son ' + Math.round(c.dec * 100) + NB + Y + ': son ' + med(c.dec * 60, Y) +
        '. El tiempo no va de 100 en 100: multiplica todo por 60.'));
    }
    if (esTiempo && !baja && e.n === 60 && cifra(r % 1) !== 0) {
      var ent = Math.floor(r), resto = cifra(v - ent * 60);
      falsas.push(falsa(ent + resto / 100, Y, (ent ? med(ent, Y) + ' ' : '') + med(resto, X) + ' no se escribe ' + med(ent + resto / 100, Y) +
        ': ' + med(resto, X) + ' son ' + med(resto / 60, Y) + '. Divide todo entre 60.'));
    }
    falsas.push(falsa(baja ? v / e.n : v * e.n, Y, baja
      ? 'Dividiste: el factor quedó al revés. ' + mayus(los(Y)) + ' son más chicos que ' + los(X) + ', así que el número debe crecer.'
      : 'Multiplicaste: el factor quedó al revés. ' + mayus(los(Y)) + ' son más grandes que ' + los(X) + ', así que el número debe bajar.'));
    e.conf.forEach(function (c) { falsas.push(falsa(baja ? v * c.n : v / c.n, Y, c.err)); });
    return arma(med(v, X) + ' → ' + Y, med(r, Y), falsas, {
      tema: esTiempo ? 'Horas, minutos y segundos' : 'Prefijos', ask: 'Convierte', texto: false,
      pasos: ['Equivalencia: ' + igual(1, e.g, e.n, e.c) + '.',
        'Factor con ' + los(X) + ' abajo: ' + med(v, X) + ' × ' + fr(med(baja ? e.n : 1, Y), med(baja ? 1 : e.n, X)) + '.',
        'Resultado: <b>' + med(r, Y) + '</b>.']
    });
  }

  function mayus(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function medidaPotencia() {
    var p = azar(POTENCIAS), baja = Math.random() < 0.55;
    var k = eleva(p, baja);
    var v = valor(baja ? p.baja : p.sube, k.Xs, k.f, k.Ys);
    var r = v * k.f, n = p.n, area = p.e === 2;
    var falsas = baja ? [
      falsa(v * n, k.Ys, area ? 'Faltó elevar el factor al cuadrado: ' + equivalenciaPot(p) + ', no ' + med(n, k.Ys) + '.'
        : 'Faltó elevar el factor al cubo: ' + equivalenciaPot(p) + ', no ' + med(n, k.Ys) + '.'),
      falsa(v / Math.pow(n, p.e), k.Ys, 'Dividiste: el factor quedó al revés. ' + mayus(los(k.Ys)) + ' son más chicos, así que el número debe crecer.'),
      falsa(v * Math.pow(n, area ? 3 : 2), k.Ys, area ? 'Eso es al cubo, como en un volumen. Un área tiene dos medidas: el factor va al cuadrado.'
        : 'Eso es al cuadrado, como en un área. Un volumen tiene tres medidas: el factor va al cubo.')
    ] : [
      falsa(v / n, k.Ys, area ? 'Faltó elevar el factor al cuadrado: ' + equivalenciaPot(p) + ', así que se divide entre ' + fmt(Math.pow(n, 2)) + '.'
        : 'Faltó elevar el factor al cubo: ' + equivalenciaPot(p) + ', así que se divide entre ' + fmt(Math.pow(n, 3)) + '.'),
      falsa(v * Math.pow(n, p.e), k.Ys, 'Multiplicaste: el factor quedó al revés. ' + mayus(los(k.Ys)) + ' son más grandes, así que el número debe bajar.'),
      falsa(v / Math.pow(n, area ? 3 : 2), k.Ys, area ? 'Eso es al cubo, como en un volumen. Un área tiene dos medidas: el factor va al cuadrado.'
        : 'Eso es al cuadrado, como en un área. Un volumen tiene tres medidas: el factor va al cubo.')
    ];
    // Con la equivalencia equivocada (10 en vez de 100…), elevada bien.
    var otro = CONF_POT[p.g + '-' + p.c];
    falsas.push(falsa(baja ? v * Math.pow(otro, p.e) : v / Math.pow(otro, p.e), k.Ys,
      'La equivalencia es ' + igual(1, p.g, p.n, p.c) + ', no ' + igual(1, p.g, otro, p.c) + '.'));
    var factor = pot(fr(med(baja ? n : 1, k.Y), med(baja ? 1 : n, k.X)), k.sup);
    return arma(med(v, k.Xs) + ' → ' + k.Ys, med(r, k.Ys), falsas, {
      tema: 'Áreas y volúmenes', ask: 'Convierte', texto: false,
      pasos: [equivalenciaPot(p) + '.',
        'El factor va ' + (area ? 'al cuadrado' : 'al cubo') + ': ' + med(v, k.Xs) + ' × ' + factor + '.',
        'Resultado: <b>' + med(r, k.Ys) + '</b>.']
    });
  }

  // Litros y metros o centímetros cúbicos: una equivalencia más, sin potencias.
  function medidaLitros() {
    var e = azar(EQ.filter(function (q) { return q.nivel === 3; }));
    var s = sentido(e, Math.random() < 0.5);
    var X = s.de, Y = s.a, baja = s.f > 1;
    var v = valor(VALORES[X + '>' + Y], X, s.f, Y);
    var r = v * s.f;
    var falsas = [
      falsa(baja ? v / e.n : v * e.n, Y, baja
        ? 'Dividiste: el factor quedó al revés. ' + mayus(los(Y)) + ' son más chicos que ' + los(X) + ', así que el número debe crecer.'
        : 'Multiplicaste: el factor quedó al revés. ' + mayus(los(Y)) + ' son más grandes que ' + los(X) + ', así que el número debe bajar.')
    ].concat(e.conf.map(function (c) { return falsa(baja ? v * c.n : v / c.n, Y, c.err); }));
    return arma(med(v, X) + ' → ' + Y, med(r, Y), falsas, {
      tema: 'Áreas y volúmenes', ask: 'Convierte', texto: false,
      pasos: ['Equivalencia: ' + igual(1, e.g, e.n, e.c) + (e.g === 'L' ? ': un cubo de 10' + NB + 'cm por lado.' : '.'),
        'Factor con ' + los(X) + ' abajo: ' + med(v, X) + ' × ' + fr(med(baja ? e.n : 1, Y), med(baja ? 1 : e.n, X)) + '.',
        'Resultado: <b>' + med(r, Y) + '</b>.']
    });
  }

  function genMedidas(nivel) {
    if (nivel < 3) return medidaLineal(nivel);
    var r = Math.random();
    return r < 0.55 ? medidaPotencia() : r < 0.75 ? medidaLitros() : medidaLineal(2);
  }

  /* =====================================================================
     conv-velocidad · km/h ↔ m/s con dos paréntesis: uno para la distancia (1 km = 1,000 m) y otro
     para el tiempo (1 h = 3,600 s).
     ===================================================================== */
  var CONTEXTOS = [
    { quien: 'Un ciclista', v: 27, u: 'km/h' },
    { quien: 'Un tren rápido', v: 216, u: 'km/h' },
    { quien: 'Un avión', v: 900, u: 'km/h' },
    { quien: 'Un auto en la ciudad', v: 54, u: 'km/h' },
    { quien: 'Un auto en la carretera', v: 25, u: 'm/s' },
    { quien: 'Un halcón en picada', v: 90, u: 'm/s' },
    { quien: 'Una persona que trota', v: 2.5, u: 'm/s' },
    { quien: 'Un velero', v: 7.5, u: 'm/s' }
  ];

  function convierteVelocidad(v, deKmh, enunciado, texto) {
    var r = deKmh ? v / 3.6 : v * 3.6;
    var falsas = deKmh ? [
      falsa(v * 3.6, 'm/s', 'Volteaste los paréntesis: así no se tachan los km ni las horas. El m/s es más grande que el km/h, así que el número baja.'),
      falsa(v * 1000, 'm/s', 'Faltó convertir las horas: además de × 1,000 por los kilómetros, en 1 h hay 3,600 s.'),
      falsa(v / 3600, 'm/s', 'Faltó pasar los kilómetros a metros: además de ÷ 3,600, va × 1,000.'),
      falsa(v * 1000 / 60, 'm/s', 'Una hora tiene 3,600 s, no 60: 60 son sus minutos.'),
      falsa(v / 36, 'm/s', 'Al quitar ceros, quita los mismos arriba y abajo: 1,000 ÷ 3,600 = 10 ÷ 36, no 1 ÷ 36.')
    ] : [
      falsa(v / 3.6, 'km/h', 'Volteaste los paréntesis: así no se tachan los metros ni los segundos. El km/h es más chico que el m/s, así que el número crece.'),
      falsa(v * 3600, 'km/h', 'Faltó pasar los metros a kilómetros: además de × 3,600, va ÷ 1,000.'),
      falsa(v / 1000, 'km/h', 'Faltó convertir los segundos: además de ÷ 1,000, en 1 h hay 3,600 s.'),
      falsa(v * 60 / 1000, 'km/h', 'Una hora tiene 3,600 s, no 60: 60 son sus minutos.'),
      falsa(v * 36, 'km/h', 'Al quitar ceros, quita los mismos arriba y abajo: 3,600 ÷ 1,000 = 36 ÷ 10, no 36.')
    ];
    var pasos = deKmh
      ? ['Un paréntesis para la distancia y otro para el tiempo: ' + med(v, 'km/h') + NB + par(KM_A_M) + par(H_ARRIBA) + '.',
        'Se tachan los km y las horas: queda ' + fmt(v * 1000) + ' ÷ 3,600. Sin calculadora, quita dos ceros arriba y abajo: ' +
          fmt(v * 10) + ' ÷ 36 = ' + fmt(r) + '.',
        'Resultado: <b>' + med(r, 'm/s') + '</b>.']
      : ['Un paréntesis para la distancia y otro para el tiempo: ' + med(v, 'm/s') + NB + par(M_A_KM) + par(S_ARRIBA) + '.',
        'Se tachan los metros y los segundos: queda ' + fmt(v * 3600) + ' ÷ 1,000 = ' + fmt(r) + '.',
        'Resultado: <b>' + med(r, 'km/h') + '</b>.'];
    return arma(enunciado, med(r, deKmh ? 'm/s' : 'km/h'), falsas, {
      tema: 'km/h y m/s', ask: texto ? 'Elige la correcta' : 'Convierte', texto: texto, pasos: pasos
    });
  }

  function velocidadDirecta(nivel) {
    var deKmh = Math.random() < 0.5;
    var lista = deKmh ? KMH_ENTEROS.concat(nivel >= 2 ? KMH_MEDIOS : []) : MS_ENTEROS.concat(nivel >= 2 ? MS_MEDIOS : []);
    var u = deKmh ? 'km/h' : 'm/s';
    var v = azar(lista.filter(function (x) { return !deLaTarea(x, u) && !deLaTarea(deKmh ? x / 3.6 : x * 3.6, deKmh ? 'm/s' : 'km/h'); }));
    return convierteVelocidad(v, deKmh, med(v, u) + ' → ' + (deKmh ? 'm/s' : 'km/h'), false);
  }

  function velocidadContexto() {
    var c = azar(CONTEXTOS);
    var deKmh = c.u === 'km/h';
    return convierteVelocidad(c.v, deKmh, c.quien + ' va a ' + med(c.v, c.u) + '. ¿A cuántos ' + (deKmh ? 'm/s' : 'km/h') + ' va?', true);
  }

  // Cuatro velocidades en unidades distintas: la de número más grande no siempre es la más rápida.
  function velocidadCompara() {
    var maxima, otras, intentos = 0;
    do {
      maxima = azar([20, 22.5, 25, 27.5]);
      // Una más lenta escrita en km/h (su número es más grande: la trampa), otra en km/h y otra en m/s.
      var lentas = [maxima - 2.5, maxima - 5, maxima - 7.5].filter(function (x) { return x > 0; });
      var enMs = azar([maxima - 1, maxima - 2, maxima - 3, maxima - 4]);
      otras = [
        { ms: lentas[0], u: 'km/h' },
        { ms: azar(lentas.slice(1)), u: 'km/h' },
        { ms: enMs, u: 'm/s' }
      ];
      intentos++;
    } while (intentos < 50 && !velocidadesValidas(maxima, otras));
    if (!velocidadesValidas(maxima, otras)) throw new Error('conversiones: no encontré cuatro velocidades');
    // Casi siempre la más rápida va en m/s, con el número más chico. A veces, al revés.
    var muestraMax = Math.random() < 0.75 ? 'm/s' : 'km/h';
    if (muestraMax === 'km/h') { otras[2].u = 'km/h'; otras[0].u = 'm/s'; }
    var ver = function (ms, u) { return u === 'm/s' ? med(ms, 'm/s') : med(ms * 3.6, 'km/h'); };
    var correcta = ver(maxima, muestraMax);
    var enMsTexto = function (o) { return o.u === 'm/s' ? med(o.ms, 'm/s') : med(o.ms * 3.6, 'km/h') + ' son ' + med(o.ms, 'm/s'); };
    var falsas = otras.map(function (o) {
      return { h: ver(o.ms, o.u), err: enMsTexto(o) + ': menos que ' + (muestraMax === 'm/s' ? correcta : correcta + ', que son ' + med(maxima, 'm/s')) + '.' +
        (o.u === 'km/h' && o.ms * 3.6 > (muestraMax === 'm/s' ? maxima : maxima * 3.6) ? ' El número es más grande porque el km/h es una unidad más chica.' : '') };
    });
    var todas = [{ ms: maxima, u: muestraMax }].concat(otras);
    return arma('¿Cuál de estas velocidades es la más rápida?', correcta, falsas, {
      tema: 'km/h y m/s', ask: 'Compara', texto: true,
      pasos: ['Pásalas a la misma unidad, m/s (los km/h, con los dos paréntesis): ' +
        todas.map(function (o) { return med(o.ms, 'm/s'); }).join(' · ') + '.',
        'La más rápida es <b>' + correcta + '</b>.']
    });
  }
  function velocidadesValidas(maxima, otras) {
    var vistas = {};
    vistas[maxima] = true;
    return otras.every(function (o) {
      if (!(o.ms > 0) || o.ms >= maxima || vistas[o.ms]) return false;
      vistas[o.ms] = true;
      var kmh = o.ms * 3.6;
      return !deLaTarea(o.ms, 'm/s') && !deLaTarea(kmh, 'km/h') && escribible(kmh);
    }) && !deLaTarea(maxima, 'm/s') && !deLaTarea(maxima * 3.6, 'km/h');
  }

  function genVelocidad(nivel) {
    if (nivel === 1) return velocidadDirecta(1);
    if (nivel === 2) return Math.random() < 0.45 ? velocidadContexto() : velocidadDirecta(2);
    var r = Math.random();
    return r < 0.45 ? velocidadCompara() : r < 0.7 ? velocidadContexto() : velocidadDirecta(2);
  }

  // Las listas de valores son cortas: sin esto, el reto (cuatro preguntas de tres generadores)
  // o una tanda podrían repetir una medida. Los tres generadores comparten la memoria de los ocho
  // enunciados más recientes: «2 km → m» no sale dos veces seguidas, ni como factor ni como cuenta.
  var recientes = [];
  function sinRepetir(gen) {
    return function (nivel) {
      var e = gen(nivel);
      for (var i = 0; i < 30 && recientes.indexOf(e.enunciado) !== -1; i++) e = gen(nivel);
      recientes.push(e.enunciado);
      if (recientes.length > 8) recientes.shift();
      return e;
    };
  }

  M.GENERADORES['conv-factor'] = sinRepetir(genFactor);
  M.GENERADORES['conv-medidas'] = sinRepetir(genMedidas);
  M.GENERADORES['conv-velocidad'] = sinRepetir(genVelocidad);
})();
