/*
 * ejercicios-vectores-proporcionalidad.js — generadores de la semana 8 de Física.
 *
 * Se suman al registro de window.TercialMotor y usan los ayudantes de M.fisica, así que
 * se cargan después de ejercicios-motor.js y de ejercicios-fisica.js. Cada opción falsa
 * es un error real, con su explicación:
 *
 *   vec-recta        vectores sobre una recta: se suman con su signo
 *   vec-pitagoras    dos vectores perpendiculares: Pitágoras con ternas (3-4-5, 5-12-13…)
 *   vec-componentes  qué componente es mayor, sin senos ni cosenos (con dibujo)
 *   prop-factor      si x se duplica o se triplica, ¿qué le pasa a y?
 *
 * Ninguna cuenta de la tarea (examenes-pdf/tarea-vectores-proporcionalidad.html) sale
 * aquí: sus ternas, sus vectores y sus valores quedan fuera de las listas, y la tarea
 * pregunta por cambios (× 4, ÷ 3, × 10) que estos generadores no usan.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var MENOS = F.MENOS;
  var NB = '\u00a0';
  var azar = F.azar, armar = F.armar;

  function entero(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function mayuscula(frase) { return frase.charAt(0).toUpperCase() + frase.slice(1); }
  // 1,600 · 0.4 · −15: coma de miles, punto decimal y el signo menos tipográfico.
  function miles(n) {
    var partes = String(Math.round(Math.abs(n) * 1000) / 1000).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? MENOS : '') + partes.join('.');
  }
  function conSigno(n) { return n > 0 ? '+' + miles(n) : miles(n); }
  function cant(n, unidad) { return miles(n) + NB + unidad; }            // 1,600 N
  function vector(n, unidad) { return conSigno(n) + NB + unidad; }      // +5 m · −15 N · 0 N
  function cuadrado(n) { return miles(n) + '²'; }
  function sumaConSignos(valores) {
    return valores.map(function (v, i) {
      if (i === 0) return miles(v);
      return v < 0 ? ' + (' + MENOS + miles(-v) + ')' : ' + ' + miles(v);
    }).join('');
  }

  /* ---------- Vectores sobre una recta ---------- */
  // Los vectores de la tarea (mismos valores y unidad) no salen.
  var TAREA_RECTA = ['N:-7,12', 'm:-9,-6', 'N:-25,25', 'N:-40,15', 'm:-3,6,8', 'N:-10,-2,4',
    'm/s:-30,18', 'N:-5,-5,12', 'm:-25,10,40'];
  function deLaTarea(unidad, valores) {
    var clave = unidad + ':' + valores.slice().sort(function (a, b) { return a - b; }).join(',');
    return TAREA_RECTA.indexOf(clave) !== -1;
  }

  var RUMBOS = [{ pos: 'este', neg: 'oeste' }, { pos: 'norte', neg: 'sur' }];

  // Valores distintos de cero, ni todos iguales ni con resultado que confunda las opciones.
  function valoresRecta(cuantos, tope, paso, unidad) {
    var vals;
    do {
      vals = [];
      for (var i = 0; i < cuantos; i++) {
        var v = entero(1, Math.floor(tope / paso)) * paso;
        vals.push(Math.random() < 0.5 ? -v : v);
      }
      var positivos = vals.filter(function (x) { return x > 0; }).length;
    } while (positivos === 0 || positivos === cuantos || deLaTarea(unidad, vals));
    return vals;
  }

  function genRecta(nivel) {
    var tipo = azar(nivel === 1 ? ['caminata', 'fuerzas'] : nivel === 2 ? ['caminata3', 'fuerzas3', 'caminata'] : ['equilibrio', 'avion', 'rango', 'fuerzas3']);

    if (tipo === 'rango') return genRango();
    if (tipo === 'equilibrio') return genEquilibrio();
    if (tipo === 'avion') return genAvion();

    var esCaminata = tipo.indexOf('caminata') === 0;
    var cuantos = tipo.slice(-1) === '3' ? 3 : 2;
    var unidad = esCaminata ? 'm' : 'N';
    var vals = esCaminata ? valoresRecta(cuantos, nivel === 1 ? 12 : 20, 1, unidad) : valoresRecta(cuantos, nivel === 1 ? 60 : 90, 5, unidad);
    var res = vals.reduce(function (a, b) { return a + b; }, 0);
    var tamanos = vals.reduce(function (a, b) { return a + Math.abs(b); }, 0);
    var rumbo = azar(RUMBOS);
    var lado = function (v) { return esCaminata ? 'al ' + (v > 0 ? rumbo.pos : rumbo.neg) : 'hacia la ' + (v > 0 ? 'derecha' : 'izquierda'); };
    var positivo = esCaminata ? 'el ' + rumbo.pos : 'la derecha';
    var enunciado;
    if (esCaminata) {
      var tramos = vals.map(function (v) { return cant(Math.abs(v), 'm') + ' ' + lado(v); });
      enunciado = 'Caminas ' + (cuantos === 2 ? tramos[0] + ' y luego ' + tramos[1] : tramos[0] + ', ' + tramos[1] + ' y ' + tramos[2]) +
        '. Si ' + positivo + ' es positivo, ¿cuál es tu desplazamiento?';
    } else if (cuantos === 2) {
      enunciado = 'Sobre una caja jalan ' + cant(Math.abs(vals[0]), 'N') + ' ' + lado(vals[0]) + ' y ' + cant(Math.abs(vals[1]), 'N') + ' ' +
        lado(vals[1]) + '. Con la derecha positiva, ¿cuál es la fuerza neta?';
    } else {
      enunciado = 'Sobre una caja actúan ' + vals.map(function (v) { return vector(v, 'N'); }).join(', ').replace(/, ([^,]*)$/, ' y $1') +
        ' (la derecha es positiva). ¿Cuál es la fuerza neta?';
    }
    var que = esCaminata ? 'desplazamiento' : 'fuerza neta';
    var cuenta = sumaConSignos(vals) + ' = ' + miles(res);
    var hacia = res === 0 ? (esCaminata ? 'volviste al punto de partida' : 'la caja queda en equilibrio')
      : cant(Math.abs(res), unidad) + ' ' + lado(res);
    var falsas = [
      { h: vector(tamanos, unidad), err: (esCaminata
        ? 'Ése es tu recorrido: sumaste los tramos sin ver hacia dónde va cada uno. '
        : 'Sumaste los tamaños sin ver hacia dónde apunta cada fuerza. ') + 'Con sus signos: ' + cuenta + '.' },
      { h: vector(-tamanos, unidad), err: 'Hay vectores en sentidos contrarios: se restan, no se suman todos.' }
    ];
    if (res !== 0) falsas.push({ h: vector(-res, unidad), err: 'El tamaño está bien, pero el signo no: gana lo que va ' + lado(res) + '.' });
    else falsas.push({ h: vector(Math.abs(vals[0]), unidad), err: 'Con sus signos, los vectores se cancelan: ' + cuenta + '.' });
    var sinUltimo = res - vals[cuantos - 1];
    falsas.push({ h: vector(sinUltimo, unidad), err: 'Te faltó sumar el último: ' + vector(vals[cuantos - 1], unidad) + '.' });
    return armar(enunciado, vector(res, unidad), falsas, {
      tema: 'Vectores en una recta', ask: 'Suma los vectores',
      pasos: ['Cada vector lleva su signo: ' + vals.map(function (v) { return vector(v, unidad); }).join(', ') + '.',
        'Se suman con sus signos: ' + cuenta + '.',
        mayuscula(que) + ': <b>' + vector(res, unidad) + '</b> (' + hacia + ').']
    });
  }

  // ¿Qué fuerza hay que agregar para que la neta sea cero? La misma neta, al revés.
  function genEquilibrio() {
    var a, b;
    do { a = entero(2, 18) * 5; b = entero(2, 18) * 5; } while (a === b || deLaTarea('N', [a, -b]));
    var neta = a - b, falta = -neta;
    return armar('Sobre una caja jalan ' + cant(a, 'N') + ' hacia la derecha y ' + cant(b, 'N') + ' hacia la izquierda. ¿Qué fuerza ' +
      'hay que agregar para que la fuerza neta sea cero? (La derecha es positiva.)', vector(falta, 'N'), [
      { h: vector(neta, 'N'), err: 'Ésa es la fuerza neta que ya tiene. Para cancelarla hace falta la misma, pero hacia el otro lado.' },
      { h: vector(0, 'N'), err: 'Las cuerdas no jalan igual: sobran ' + cant(Math.abs(neta), 'N') + ' hacia la ' + (neta > 0 ? 'derecha' : 'izquierda') + '.' },
      { h: vector(a + b, 'N'), err: 'Sumaste los tamaños. Primero la neta, con signos: ' + a + ' + (' + MENOS + b + ') = ' + miles(neta) + '; luego, la contraria.' },
      { h: vector(-(a + b), 'N'), err: 'Las cuerdas jalan en sentidos contrarios: sus fuerzas se restan.' }
    ], {
      tema: 'Vectores en una recta', ask: 'Suma los vectores',
      pasos: ['Fuerza neta: ' + a + ' + (' + MENOS + b + ') = ' + miles(neta) + ' N.',
        'Para que quede en cero, se agrega la misma fuerza al revés: <b>' + vector(falta, 'N') + '</b>.']
    });
  }

  // El viento también es un vector: se suma con su signo.
  var AVION = { v: [180, 200, 240, 250, 300], w: [20, 30, 40, 50, 60] };
  function genAvion() {
    var v = azar(AVION.v), w = azar(AVION.w);
    var aFavor = Math.random() < 0.5;
    var res = aFavor ? v + w : v - w;
    return armar('Un avión vuela a ' + cant(v, 'km/h') + ' hacia el este y el viento sopla a ' + cant(w, 'km/h') + ' hacia el ' +
      (aFavor ? 'este' : 'oeste') + '. Con el este positivo, ¿a qué velocidad avanza respecto al suelo?', vector(res, 'km/h'), [
      { h: vector(aFavor ? v - w : v + w, 'km/h'), err: aFavor
        ? 'El viento sopla hacia el mismo lado que el avión: lo empuja, se suma.'
        : 'El viento sopla en contra: frena al avión, se resta.' },
      { h: vector(v, 'km/h'), err: 'El viento también es un vector: se suma con su signo, ' + (aFavor ? '+' : MENOS) + w + ' km/h.' },
      { h: vector(-res, 'km/h'), err: 'El avión sigue avanzando hacia el este: su velocidad es positiva.' },
      { h: vector(w, 'km/h'), err: 'Ésa es sólo la velocidad del viento; falta la del avión.' }
    ], {
      tema: 'Vectores en una recta', ask: 'Suma los vectores',
      pasos: ['Avión: +' + v + ' km/h. Viento: ' + (aFavor ? '+' : MENOS) + w + ' km/h.',
        'Se suman con sus signos: ' + v + (aFavor ? ' + ' : ' + (' + MENOS) + w + (aFavor ? '' : ')') + ' = <b>' + vector(res, 'km/h') + '</b>.']
    });
  }

  // ¿Cuál NO puede ser la resultante? Entre la resta (opuestas) y la suma (mismo sentido).
  var PARES_RANGO = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [30, 40, 50]];
  function genRango() {
    var p = azar(PARES_RANGO), a = p[0], b = p[1], c = p[2];
    var imposible = Math.random() < 0.5 || b - a < 3 ? a + b + entero(1, 3) : entero(1, b - a - 1);
    var entre;
    do { entre = entero(b - a + 1, a + b - 1); } while (entre === c);
    return armar('Dos fuerzas, de ' + cant(a, 'N') + ' y ' + cant(b, 'N') + ', jalan un mismo objeto. ¿Cuál de estos valores NO puede ' +
      'ser su resultante?', cant(imposible, 'N'), [
      { h: cant(a + b, 'N'), err: 'Sí puede: si jalan hacia el mismo lado, la resultante es la suma, ' + a + ' + ' + b + ' = ' + (a + b) + '.' },
      { h: cant(b - a, 'N'), err: 'Sí puede: si jalan en sentidos contrarios, se restan, ' + b + ' ' + MENOS + ' ' + a + ' = ' + (b - a) + '.' },
      { h: cant(c, 'N'), err: 'Sí puede: si son perpendiculares, por Pitágoras la resultante es ' + c + '.' },
      { h: cant(entre, 'N'), err: 'Sí puede: con otro ángulo, la resultante queda entre ' + (b - a) + ' y ' + (a + b) + '.' }
    ], {
      tema: 'Vectores en una recta', ask: 'Elige la correcta',
      pasos: ['La mayor resultante es cuando jalan hacia el mismo lado: ' + (a + b) + ' N. La menor, en sentidos contrarios: ' + (b - a) + ' N.',
        'Cualquier valor fuera de ese rango es imposible: <b>' + cant(imposible, 'N') + '</b>.']
    });
  }

  /* ---------- Dos vectores perpendiculares ---------- */
  // Ternas y multiplicadores que no usa la tarea (allá: 9-12-15, 12-16-20, 15-20-25, 18-24-30,
  // 10-24-26, 20-21-29, 9-40-41, 21-28-35 y 16-30-34).
  var TERNAS = [
    { t: [3, 4, 5], k: [1, 2, 10], nivel: 1 },
    { t: [3, 4, 5], k: [20, 100], nivel: 2 },
    { t: [5, 12, 13], k: [1, 10], nivel: 2 },
    { t: [8, 15, 17], k: [1], nivel: 2 }
  ];
  var LADOS = [['norte', 'este'], ['este', 'norte'], ['sur', 'oeste'], ['oeste', 'sur'], ['norte', 'oeste'], ['sur', 'este']];

  function terna(nivel) {
    var lista = TERNAS.filter(function (x) { return x.nivel <= nivel; });
    var e = azar(lista), k = azar(e.k);
    var a = e.t[0] * k, b = e.t[1] * k, c = e.t[2] * k;
    if (Math.random() < 0.5) { var s = a; a = b; b = s; }
    return { a: a, b: b, c: c, k: k, base: e.t };
  }

  function nombreTerna(T) {
    var base = T.base.join('-');
    return T.k === 1 ? 'Es la terna ' + base + '.' : 'Es la terna ' + base + ' multiplicada por ' + T.k + '.';
  }

  // Un contexto real para cada terna: fuerzas, una caminata o una lancha que cruza un río.
  function contexto(T) {
    var opciones = ['fuerzas', 'caminata'];
    if (T.base[0] === 3 && T.k === 1) opciones.push('lancha');
    if (T.base[0] === 5 && T.k === 10) opciones.push('avioneta');
    var tipo = azar(opciones);
    if (tipo === 'fuerzas') return { tipo: tipo, u: 'N' };
    if (tipo === 'lancha') return { tipo: tipo, u: 'm/s' };
    if (tipo === 'avioneta') return { tipo: tipo, u: 'km/h' };
    return { tipo: tipo, u: T.c <= 26 && Math.random() < 0.4 ? 'km' : 'm', rumbos: azar(LADOS) };
  }

  function genPitagoras(nivel) {
    var T = terna(nivel);
    var tipo = azar(nivel === 1 ? ['hipotenusa'] : nivel === 2 ? ['hipotenusa', 'hipotenusa', 'cateto'] : ['hipotenusa', 'cateto', 'recorrido', 'tramos']);
    var C = contexto(T);
    var u = C.u, a = T.a, b = T.b, c = T.c;
    // Recorrido y tramos son caminatas: van en metros o en kilómetros.
    if (tipo === 'recorrido' || tipo === 'tramos') u = c <= 26 && Math.random() < 0.4 ? 'km' : 'm';
    var pasoTriangulo = 'Son perpendiculares: puestos cabeza-cola forman un triángulo rectángulo y la resultante es la hipotenusa.';

    if (tipo === 'tramos') {
      // Dos tramos al mismo rumbo y uno perpendicular en medio: primero se juntan los paralelos.
      var p = entero(1, a - 1), q = a - p;
      var r = azar(LADOS), sumaTramos = a + b;
      return armar('Caminas ' + cant(p, u) + ' al ' + r[0] + ', ' + cant(b, u) + ' al ' + r[1] + ' y otros ' + cant(q, u) + ' al ' + r[0] +
        '. ¿A qué distancia en línea recta quedas del punto de partida?', cant(c, u), [
        { h: cant(sumaTramos, u), err: 'Ése es tu recorrido, la suma de los tramos. En línea recta: ' + a + ' al ' + r[0] + ' y ' + b + ' al ' + r[1] + ', por Pitágoras.' },
        { h: cant(c * c, u), err: 'Te faltó sacar la raíz: ' + cuadrado(a) + ' + ' + cuadrado(b) + ' = ' + miles(c * c) + ', y √' + miles(c * c) + ' = ' + c + '.' },
        { h: cant(Math.abs(b - a), u), err: 'Restaste: eso sólo vale para vectores en sentidos contrarios. Éstos son perpendiculares.' },
        { h: cant(p + b, u), err: 'Te faltó un tramo: al ' + r[0] + ' caminaste ' + p + ' + ' + q + ' = ' + a + '.' }
      ], {
        tema: 'Vectores perpendiculares', ask: 'Calcula',
        pasos: ['Junta lo que va al mismo rumbo: ' + p + ' + ' + q + ' = ' + cant(a, u) + ' al ' + r[0] + '.',
          'Con los ' + cant(b, u) + ' al ' + r[1] + ': ' + cuadrado(a) + ' + ' + cuadrado(b) + ' = ' + miles(c * c) + '.',
          '√' + miles(c * c) + ' = <b>' + cant(c, u) + '</b>.']
      });
    }

    if (tipo === 'recorrido') {
      var r2 = azar(LADOS);
      var rec = a + b;
      var txt = function (x, y) { return 'recorrido ' + cant(x, u) + ', desplazamiento ' + cant(y, u); };
      return armar('Caminas ' + cant(a, u) + ' al ' + r2[0] + ' y luego ' + cant(b, u) + ' al ' + r2[1] + '. ¿Cuánto recorriste y a qué ' +
        'distancia en línea recta quedaste?', txt(rec, c), [
        { h: txt(c, rec), err: 'Al revés: lo que caminaste es la suma de los tramos (' + rec + '); la distancia en línea recta, por Pitágoras, es ' + c + '.' },
        { h: txt(rec, rec), err: 'El desplazamiento no es la suma: va en línea recta del inicio al final, ' + c + '.' },
        { h: txt(c, c), err: 'El recorrido sí es la suma de lo que caminaste: ' + a + ' + ' + b + ' = ' + rec + '.' }
      ], {
        tema: 'Vectores perpendiculares', ask: 'Elige la correcta',
        pasos: ['Recorrido: lo que caminaste, ' + a + ' + ' + b + ' = ' + cant(rec, u) + '.',
          'Desplazamiento: ' + cuadrado(a) + ' + ' + cuadrado(b) + ' = ' + miles(c * c) + ' y √' + miles(c * c) + ' = <b>' + cant(c, u) + '</b>.']
      });
    }

    if (tipo === 'cateto') {
      var enunciadoCateto = C.tipo === 'caminata'
        ? 'Caminas ' + cant(a, u) + ' al ' + C.rumbos[0] + ' y luego cierta distancia al ' + C.rumbos[1] + '. Quedas a ' + cant(c, u) +
          ' del punto de partida. ¿Cuánto caminaste al ' + C.rumbos[1] + '?'
        : 'Dos fuerzas perpendiculares dan una resultante de ' + cant(c, 'N') + '. Una de ellas mide ' + cant(a, 'N') + '. ¿Cuánto mide la otra?';
      if (C.tipo !== 'caminata') u = 'N';
      var esCamino = C.tipo === 'caminata';
      // Con 3-4-5 y 5-12-13, c + a y b² coinciden (4 + 5 = 9 = 3²): por eso hay cinco errores para elegir tres.
      return armar(enunciadoCateto, cant(b, u), [
        { h: cant(c - a, u), err: 'Restaste los tamaños. Con perpendiculares se restan los cuadrados: ' + cuadrado(c) + ' ' + MENOS + ' ' + cuadrado(a) + ' = ' + miles(b * b) + '.' },
        { h: cant(c + a, u), err: 'La resultante es la hipotenusa, el lado más largo: el otro vector tiene que ser menor que ' + c + '.' },
        { h: cant(b * b, u), err: 'Te faltó sacar la raíz: √' + miles(b * b) + ' = ' + b + '.' },
        { h: cant(c, u), err: esCamino ? 'Ésa es la distancia a la que quedaste; te preguntan el tramo que falta, que es más corto.'
          : 'Ésa es la resultante que ya te dieron; te preguntan la otra fuerza, que es menor.' },
        { h: cant(a, u), err: esCamino ? 'Ése es el tramo que ya conocías; falta el otro.' : 'Ésa es la fuerza que ya conocías; falta la otra.' }
      ], {
        tema: 'Vectores perpendiculares', ask: 'Calcula',
        pasos: ['La resultante es la hipotenusa: ' + cuadrado(a) + ' + ? = ' + cuadrado(c) + '.',
          '? = ' + miles(c * c) + ' ' + MENOS + ' ' + miles(a * a) + ' = ' + miles(b * b) + '.',
          '√' + miles(b * b) + ' = <b>' + cant(b, u) + '</b>. ' + nombreTerna(T)]
      });
    }

    var enunciado;
    if (C.tipo === 'fuerzas') {
      enunciado = 'Dos fuerzas perpendiculares, de ' + cant(a, 'N') + ' y ' + cant(b, 'N') + ', jalan un mismo objeto. ¿Cuánto vale la resultante?';
    } else if (C.tipo === 'lancha') {
      enunciado = 'Una lancha cruza un río de frente a ' + cant(4, 'm/s') + ' y la corriente la arrastra a ' + cant(3, 'm/s') + '. ¿Qué tan rápido avanza respecto a la orilla?';
      a = 4; b = 3;
    } else if (C.tipo === 'avioneta') {
      enunciado = 'Una avioneta vuela a ' + cant(120, 'km/h') + ' hacia el norte y el viento la empuja a ' + cant(50, 'km/h') + ' hacia el este. ¿Qué tan rápido avanza respecto al suelo?';
      a = 120; b = 50;
    } else {
      enunciado = 'Caminas ' + cant(a, u) + ' al ' + C.rumbos[0] + ' y luego ' + cant(b, u) + ' al ' + C.rumbos[1] + '. ¿A qué distancia en línea recta quedas del punto de partida?';
    }
    return armar(enunciado, cant(c, u), [
      { h: cant(a + b, u), err: C.tipo === 'caminata'
        ? 'Ése es tu recorrido (' + a + ' + ' + b + '). En línea recta, por Pitágoras, quedas más cerca.'
        : 'Sumaste los tamaños: eso sólo vale si apuntan hacia el mismo lado. Son perpendiculares: usa Pitágoras.' },
      { h: cant(Math.abs(a - b), u), err: 'Restaste: eso sólo vale si apuntan en sentidos contrarios.' },
      { h: cant(c * c, u), err: 'Te faltó sacar la raíz: ' + cuadrado(a) + ' + ' + cuadrado(b) + ' = ' + miles(c * c) + ', y √' + miles(c * c) + ' = ' + c + '.' }
    ], {
      tema: 'Vectores perpendiculares', ask: 'Calcula',
      pasos: [pasoTriangulo,
        cuadrado(a) + ' + ' + cuadrado(b) + ' = ' + miles(a * a) + ' + ' + miles(b * b) + ' = ' + miles(c * c) + '.',
        '√' + miles(c * c) + ' = <b>' + cant(c, u) + '</b>. ' + nombreTerna(T)]
    });
  }

  /* ---------- Qué componente es mayor ---------- */
  // Una flecha en una cuadrícula (avanza h cuadros de lado y v de alto) o con su ángulo.
  var PARES = [[5, 1], [5, 2], [4, 1], [3, 1], [4, 2], [5, 3], [1, 5], [2, 5], [1, 4], [1, 3], [2, 4], [3, 5], [2, 2], [3, 3], [4, 4]];
  var COMPONENTES = ['La horizontal', 'La vertical', 'Son iguales', 'No se sabe sin senos ni cosenos'];

  function r1(v) { return Math.round(v * 10) / 10; }
  function flecha(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, largo = Math.hypot(dx, dy), ux = dx / largo, uy = dy / largo;
    var bx = x2 - ux * 6, by = y2 - uy * 6;
    return '<path class="vec-mini__flecha" d="M' + r1(x1) + ' ' + r1(y1) + 'L' + r1(bx) + ' ' + r1(by) + '"/>' +
      '<path class="vec-mini__punta" d="M' + r1(x2) + ' ' + r1(y2) + 'L' + r1(bx - uy * 3.2) + ' ' + r1(by + ux * 3.2) + 'L' +
      r1(bx + uy * 3.2) + ' ' + r1(by - ux * 3.2) + 'Z"/>' +
      '<circle class="vec-mini__origen" cx="' + r1(x1) + '" cy="' + r1(y1) + '" r="1.8"/>';
  }

  // Cuadrícula de 6 × 6 cuadros; el origen va en la esquina que deja ver toda la flecha.
  function svgCuadricula(h, v) {
    var L = 10, n = 6, m = 2, d = '';
    for (var i = 0; i <= n; i++) d += 'M' + (m + i * L) + ' ' + m + 'V' + (m + n * L) + 'M' + m + ' ' + (m + i * L) + 'H' + (m + n * L);
    var ox = h >= 0 ? m : m + n * L, oy = v >= 0 ? m + n * L : m;
    var lado = (h >= 0 ? 'a la derecha' : 'a la izquierda'), alto = (v >= 0 ? 'hacia arriba' : 'hacia abajo');
    return '<svg class="vec-mini" viewBox="0 0 64 64" role="img" aria-label="Una flecha en una cuadrícula: avanza ' + Math.abs(h) +
      ' cuadros ' + lado + ' y ' + Math.abs(v) + ' ' + alto + '"><path class="vec-mini__cuadro" d="' + d + '"/>' +
      flecha(ox, oy, ox + h * L, oy - v * L) + '</svg>';
  }

  // La flecha a su ángulo real, con la línea de referencia (horizontal o vertical) y el arco.
  function svgAngulo(grados, ref) {
    var conHorizontal = ref === 'horizontal' ? grados : 90 - grados;
    var a = conHorizontal * Math.PI / 180, ox = 8, oy = 56, R = 48, ra = 15;
    var tx = ox + R * Math.cos(a), ty = oy - R * Math.sin(a);
    var linea = ref === 'horizontal' ? 'M' + ox + ' ' + oy + 'H' + (ox + 56) : 'M' + ox + ' ' + oy + 'V' + (oy - 54);
    var desde = ref === 'horizontal' ? [ox + ra, oy] : [ox, oy - ra];
    var hasta = [ox + ra * Math.cos(a), oy - ra * Math.sin(a)];
    var barrido = ref === 'horizontal' ? 0 : 1;
    return '<svg class="vec-mini vec-mini--angulo" viewBox="0 0 68 60" role="img" aria-label="Una flecha que forma ' + grados +
      ' grados con la ' + ref + '"><path class="vec-mini__ref" d="' + linea + '"/><path class="vec-mini__arco" d="M' + r1(desde[0]) + ' ' +
      r1(desde[1]) + 'A' + ra + ' ' + ra + ' 0 0 ' + barrido + ' ' + r1(hasta[0]) + ' ' + r1(hasta[1]) + '"/>' + flecha(ox, oy, tx, ty) + '</svg>';
  }

  function cualMayor(h, v) { return Math.abs(h) > Math.abs(v) ? 0 : Math.abs(h) < Math.abs(v) ? 1 : 2; }

  function genComponentes(nivel) {
    var tipo = azar(nivel === 1 ? ['cuadricula'] : nivel === 2 ? ['cuadricula', 'angulo', 'angulo', 'cero'] : ['angulo', 'vertical', 'contexto', 'imposible']);
    var meta = { tema: 'Componentes', ask: 'Compara' };

    if (tipo === 'cuadricula') {
      var par = azar(PARES), h = par[0], v = par[1];
      if (nivel >= 2) { if (Math.random() < 0.5) h = -h; if (Math.random() < 0.5) v = -v; }
      var k = cualMayor(h, v), H = Math.abs(h), V = Math.abs(v);
      var avanza = 'La flecha avanza ' + H + (H === 1 ? ' cuadro' : ' cuadros') + ' de lado y ' + V + ' de alto';
      var porQue = k === 2 ? avanza + ': lo mismo en las dos direcciones, así que son iguales.'
        : avanza + ': la mayor es la ' + (k === 0 ? 'horizontal' : 'vertical') + '.';
      meta.pasos = ['La componente horizontal es lo que avanza de lado: ' + H + '. La vertical, lo que sube o baja: ' + V + '.',
        k === 2 ? 'Avanza lo mismo de lado que de alto (va a 45°): <b>son iguales</b>.' : 'La mayor es <b>la ' + (k === 0 ? 'horizontal' : 'vertical') + '</b>.'];
      var falsasG = [0, 1, 2].filter(function (i) { return i !== k; }).map(function (i) {
        return { h: COMPONENTES[i], err: i === 2 ? 'Sólo son iguales cuando la flecha va a 45°. ' + avanza + '.' : porQue };
      });
      falsasG.push({ h: COMPONENTES[3], err: 'No hace falta calcular: basta contar cuántos cuadros avanza de lado y cuántos de alto.' });
      return armar('¿Qué componente de esta flecha es mayor?' + svgCuadricula(h, v), COMPONENTES[k], falsasG, meta);
    }

    if (tipo === 'angulo' || tipo === 'vertical') {
      var conVertical = tipo === 'vertical';
      var g = azar([15, 20, 25, 30, 35, 45, 55, 60, 65, 70, 75]);
      var conH = conVertical ? 90 - g : g;
      var kk = conH < 45 ? 0 : conH > 45 ? 1 : 2;
      var ref = conVertical ? 'vertical' : 'horizontal';
      var explica = conVertical
        ? 'Ojo: el ángulo es con la vertical. A ' + g + '° de la vertical, la flecha está ' + (g < 45 ? 'más parada que acostada' : g > 45 ? 'más acostada que parada' : 'justo a la mitad') + '.'
        : (conH < 45 ? 'Con menos de 45°, la flecha está más acostada que parada: avanza más de lado que hacia arriba.'
          : conH > 45 ? 'Con más de 45°, la flecha está más parada que acostada: sube más de lo que avanza de lado.'
            : 'A 45° la flecha avanza lo mismo de lado que hacia arriba.');
      meta.pasos = [conVertical ? 'A ' + g + '° de la vertical es a ' + conH + '° de la horizontal (90° ' + MENOS + ' ' + g + '°). Compara con 45°.'
        : 'Compara con 45°: la flecha forma ' + conH + '° con la horizontal.',
        (kk === 2 ? 'A 45°, <b>son iguales</b>.' : (kk === 0 ? 'Menos de 45°: está más acostada, la mayor es <b>la horizontal</b>.' : 'Más de 45°: está más parada, la mayor es <b>la vertical</b>.'))];
      var falsasA = [0, 1, 2].filter(function (i) { return i !== kk; }).map(function (i) {
        return { h: COMPONENTES[i], err: i === 2 ? 'Sólo son iguales a 45°; esta flecha forma ' + conH + '° con la horizontal. ' + (conVertical ? explica : '') : explica };
      });
      falsasA.push({ h: COMPONENTES[3], err: 'No hace falta calcular: basta comparar el ángulo con 45°.' });
      // Una sola línea en el reto de la tele: con el dibujo, la pantalla no tiene que encogerse.
      return armar('A ' + g + '° de la ' + ref + ': ¿qué componente es mayor?' + svgAngulo(g, ref), COMPONENTES[kk], falsasA, meta);
    }

    if (tipo === 'cero') {
      var mag = azar([6, 8, 10, 12, 15, 20, 25, 40]);
      var arriba = Math.random() < 0.5;
      var pide = arriba ? 'horizontal' : 'vertical', tiene = arriba ? 'vertical' : 'horizontal';
      meta.pasos = ['La fuerza apunta ' + (arriba ? 'hacia arriba: no avanza nada de lado.' : 'hacia la derecha: no sube nada.'),
        'Su componente ' + pide + ' vale <b>0 N</b>; toda la fuerza es ' + tiene + '.'];
      return armar('Una fuerza de ' + cant(mag, 'N') + ' apunta ' + (arriba ? 'hacia arriba' : 'hacia la derecha') + '. ¿Cuánto vale su componente ' + pide + '?', cant(0, 'N'), [
        { h: cant(mag, 'N'), err: 'Ésa es la componente ' + tiene + ': toda la fuerza va ' + (arriba ? 'hacia arriba' : 'hacia la derecha') + '.' },
        { h: cant(mag / 2, 'N'), err: 'La fuerza no se reparte a la mitad: sólo apunta en una dirección, la ' + tiene + '.' },
        { h: 'No se sabe sin el ángulo', err: 'Sí se sabe: apunta ' + (arriba ? 'hacia arriba, a 90° de la horizontal' : 'hacia la derecha, sobre la horizontal') + '.' }
      ], meta);
    }

    if (tipo === 'contexto') {
      var casos = [
        { txt: 'Un niño jala un carrito con una cuerda casi pegada al piso, a 15° sobre la horizontal.', k: 0, de: 'fuerza',
          h: 'La que lo jala hacia adelante', v: 'La que lo levanta', por: 'La cuerda está más acostada que parada (15°, menos de 45°): jala más hacia adelante que hacia arriba.' },
        { txt: 'Un avión despega con una inclinación de 20° sobre la pista.', k: 0, de: 'velocidad',
          h: 'La que avanza hacia adelante', v: 'La que sube', por: 'Sube poco inclinado (20°, menos de 45°): avanza más de lo que sube.' },
        { txt: 'Un cohete sube inclinado sólo 10° respecto a la vertical.', k: 1, de: 'velocidad',
          h: 'La que avanza de lado', v: 'La que sube', por: 'Va casi vertical (a 10° de la vertical): sube mucho más de lo que avanza de lado.' },
        { txt: 'Lanzas una pelota a 45° sobre el piso.', k: 2, de: 'velocidad',
          h: 'La que avanza hacia adelante', v: 'La que sube', por: 'A 45°, la pelota avanza lo mismo que sube: las dos componentes son iguales.' },
        { txt: 'Una niña baja por una resbaladilla muy empinada, a 70° sobre el piso.', k: 1, de: 'velocidad',
          h: 'La que avanza de lado', v: 'La que baja', por: 'La resbaladilla está más parada que acostada (70°, más de 45°): baja más de lo que avanza de lado.' }
      ];
      var c = azar(casos);
      var ops = [c.h, c.v, 'Son iguales', 'No se sabe sin senos ni cosenos'];
      var bien = ops[c.k];
      meta.pasos = ['Compara con 45°.', c.por.replace(/: (.*)\.$/, ': <b>$1</b>.')];
      var falsasC = ops.filter(function (o) { return o !== bien; }).map(function (o) {
        return { h: o, err: o === ops[3] ? 'No hace falta calcular: basta comparar el ángulo con 45°.' : c.por };
      });
      return armar(c.txt + ' ¿Qué componente de su ' + c.de + ' es mayor?', bien, falsasC, meta);
    }

    // imposible: una componente nunca mide más que el vector.
    var V2 = azar([10, 13, 15, 20, 25]);
    var malo = V2 + azar([2, 3, 5]);
    var dentro = Math.round(V2 * azar([0.4, 0.5, 0.6, 0.8]));
    meta.ask = 'Elige la correcta';
    meta.pasos = ['Una componente es un cateto y el vector es la hipotenusa: la componente nunca mide más que el vector.',
      'Puede valer de 0 a ' + V2 + ' N; <b>' + cant(malo, 'N') + '</b> no puede ser.'];
    return armar('Una fuerza mide ' + cant(V2, 'N') + '. ¿Cuál de estos valores NO puede tener su componente horizontal?', cant(malo, 'N'), [
      { h: cant(0, 'N'), err: 'Sí puede: si la fuerza es vertical, no avanza nada de lado.' },
      { h: cant(V2, 'N'), err: 'Sí puede: si la fuerza es horizontal, toda ella es la componente horizontal.' },
      { h: cant(dentro, 'N'), err: 'Sí puede: con la fuerza inclinada, la componente es menor que la fuerza.' }
    ], meta);
  }

  /* ---------- Razonamiento proporcional ---------- */
  // n es el exponente de x en la fórmula: 1 directa, −1 inversa, 2 al cuadrado, −2 inversa al cuadrado.
  // «intro» trae la fórmula (niveles 1 y 2); «sin» plantea lo mismo con palabras (nivel 3).
  var LEYES = [
    { n: 1, f: 'd = v·t', intro: 'A velocidad constante, d = v·t.', x: 'el tiempo t', y: 'la distancia', vx: 't', vy: 'd', nx: 'el tiempo',
      sin: 'Un auto va siempre a la misma velocidad.', xs: 'el tiempo que viaja', ys: 'la distancia que recorre' },
    { n: 1, f: 'a = F / m', intro: 'Con la misma masa, a = F / m.', x: 'la fuerza F', y: 'la aceleración', vx: 'F', vy: 'a', nx: 'la fuerza',
      sin: 'Empujas un carrito.', xs: 'la fuerza con que lo empujas', ys: 'su aceleración' },
    { n: 1, f: 'W = F·d', intro: 'Con la misma fuerza, W = F·d.', x: 'la distancia d', y: 'el trabajo', vx: 'd', vy: 'W', nx: 'la distancia',
      sin: 'Empujas una caja siempre con la misma fuerza.', xs: 'la distancia que la empujas', ys: 'el trabajo que haces' },
    { n: 1, f: 'I = V / R', intro: 'En la misma resistencia, I = V / R.', x: 'el voltaje V', y: 'la corriente', vx: 'V', vy: 'I', nx: 'el voltaje',
      sin: 'Un foco se conecta a distintas pilas.', xs: 'el voltaje', ys: 'la corriente que pasa por él' },
    { n: -1, f: 't = d / v', intro: 'Para recorrer la misma distancia, t = d / v.', x: 'la velocidad v', y: 'el tiempo', vx: 'v', vy: 't', nx: 'la velocidad',
      sin: 'Vas a recorrer siempre la misma distancia.', xs: 'tu velocidad', ys: 'el tiempo que tardas' },
    { n: -1, f: 'a = F / m', intro: 'Con la misma fuerza, a = F / m.', x: 'la masa m', y: 'la aceleración', vx: 'm', vy: 'a', nx: 'la masa',
      sin: 'Empujas carritos siempre con la misma fuerza.', xs: 'la masa del carrito', ys: 'su aceleración' },
    { n: -1, f: 'p = F / A', intro: 'Con la misma fuerza, p = F / A.', x: 'el área A', y: 'la presión', vx: 'A', vy: 'p', nx: 'el área',
      sin: 'Una caja se apoya en el piso.', xs: 'el área en que se apoya', ys: 'la presión sobre el piso' },
    { n: -1, f: 'I = V / R', intro: 'Con el mismo voltaje, I = V / R.', x: 'la resistencia R', y: 'la corriente', vx: 'R', vy: 'I', nx: 'la resistencia',
      sin: 'Una pila se conecta a distintas resistencias.', xs: 'la resistencia', ys: 'la corriente' },
    { n: 2, f: 'E = ½·m·v²', intro: 'Con la misma masa, E = ½·m·v².', x: 'la velocidad v', y: 'la energía cinética', vx: 'v', vy: 'E', nx: 'la velocidad',
      sin: 'Un auto acelera.', xs: 'su velocidad', ys: 'su energía cinética' },
    { n: 2, f: 'd = v² / (2a)', intro: 'Con los mismos frenos, d = v² / (2a).', x: 'la velocidad v', y: 'la distancia de frenado', vx: 'v', vy: 'd', nx: 'la velocidad',
      sin: 'Un auto frena siempre con la misma fuerza.', xs: 'su velocidad', ys: 'la distancia que necesita para frenar' },
    { n: 2, f: 'P = I²·R', intro: 'En la misma resistencia, P = I²·R.', x: 'la corriente I', y: 'la potencia', vx: 'I', vy: 'P', nx: 'la corriente',
      sin: 'Por una resistencia pasa corriente.', xs: 'la corriente', ys: 'la potencia que se disipa' },
    { n: -2, f: 'F = G·m<sub>1</sub>·m<sub>2</sub> / r²', intro: 'La gravedad entre dos cuerpos es F = G·m<sub>1</sub>·m<sub>2</sub> / r².',
      x: 'la distancia r entre ellos', y: 'la fuerza', vx: 'r', vy: 'F', nx: 'la distancia',
      sin: 'La Tierra atrae a un satélite.', xs: 'su distancia al centro de la Tierra', ys: 'la fuerza con que lo atrae', sinMitad: true },
    { n: -2, f: 'F = k·q<sub>1</sub>·q<sub>2</sub> / r²', intro: 'La fuerza entre dos cargas es F = k·q<sub>1</sub>·q<sub>2</sub> / r².',
      x: 'la distancia r entre ellas', y: 'la fuerza', vx: 'r', vy: 'F', nx: 'la distancia',
      sin: 'Dos cargas eléctricas se atraen.', xs: 'la distancia entre ellas', ys: 'la fuerza entre ellas' },
    { n: -2, f: 'E = I / d²', intro: 'La luz que llega a una hoja es E = I / d².', x: 'la distancia d al foco', y: 'la luz que le llega', vx: 'd', vy: 'E', nx: 'la distancia',
      sin: 'Un foco ilumina una hoja.', xs: 'la distancia de la hoja al foco', ys: 'la luz que le llega' }
  ];

  LEYES.forEach(function (l) { l.ny = l.y; });

  // Los cambios de x que pregunta la práctica. La tarea usa otros (× 4, ÷ 3, × 10, y ÷ 2 con un cuadrado).
  var CAMBIOS = [
    { c: [2, 1], txt: 'se duplica' },
    { c: [3, 1], txt: 'se triplica' },
    { c: [1, 2], txt: 'se reduce a la mitad' }
  ];

  function fr(n, d) { var a = n, b = d; while (b) { var t = a % b; a = b; b = t; } return [n / a, d / a]; }
  function potencia(c, n) {
    var e = Math.abs(n), num = Math.pow(c[0], e), den = Math.pow(c[1], e);
    return n >= 0 ? fr(num, den) : fr(den, num);
  }
  var VECES = { 2: 'se duplica', 3: 'se triplica', 4: 'se cuadruplica' };
  var PARTES = { 2: 'la mitad', 3: 'la tercera parte', 4: 'la cuarta parte', 6: 'la sexta parte', 8: 'la octava parte', 9: 'la novena parte', 16: 'la dieciseisava parte' };
  function efecto(f) {
    if (f[0] === f[1]) return 'no cambia';
    if (f[1] === 1) return VECES[f[0]] || 'se multiplica por ' + f[0];
    return 'se reduce a ' + PARTES[f[1]];
  }
  function operador(f) { return f[1] === 1 ? '× ' + f[0] : '÷ ' + f[1]; }
  function a(frase) { return /^el /.test(frase) ? frase.replace(/^el /, 'al ') : 'a ' + frase; }

  // Las falsas de un cambio, cada una con su porqué y siempre con la fórmula a la vista:
  // al revés, sin el cuadrado, con un cuadrado que no tiene, «elevar al cuadrado es
  // multiplicar por 2» y «no cambia».
  function falsasDe(ley, cambio) {
    var n = ley.n, c = cambio.c, crece = c[0] > c[1], en = 'En ' + ley.f + ', ';
    var lista = [];
    lista.push({ f: potencia(c, -n), err: 'Al revés. ' + en + ley.vx + ' está ' + (n > 0 ? 'multiplicando' : 'dividiendo') + ': si ' + ley.nx +
      (crece ? ' aumenta' : ' disminuye') + ', ' + ley.ny + (n > 0 ? (crece ? ' también aumenta.' : ' también disminuye.') : (crece ? ' disminuye.' : ' aumenta.')) });
    if (Math.abs(n) === 2) {
      lista.push({ f: potencia(c, n / 2), err: 'Te faltó el cuadrado. ' + en + ley.vx + ' está al cuadrado, así que su cambio también: ' +
        (c[1] === 1 ? c[0] + '² = ' + c[0] * c[0] : 'la mitad al cuadrado es la cuarta parte') + '.' });
      if (c[0] === 3) lista.push({ f: n > 0 ? [6, 1] : [1, 6], err: 'Elevar al cuadrado no es multiplicar por 2: 3² = 3 × 3 = 9.' });
    } else {
      lista.push({ f: potencia(c, 2 * n), err: en + ley.vx + ' no está al cuadrado: ' + ley.ny + ' cambia en la misma proporción que ' + ley.nx +
        (n < 0 ? ', pero al revés.' : '.') });
    }
    lista.push({ f: [1, 1], err: 'Sí cambia: ' + ley.ny + ' depende de ' + ley.nx + ' (' + ley.f + ').' });
    return lista;
  }

  function pasosDe(ley, cambio, f) {
    var n = ley.n, cuad = Math.abs(n) === 2;
    return ['En ' + ley.f + ', ' + ley.vx + ' está ' + (n > 0 ? 'multiplicando' : 'dividiendo') + (cuad ? ' y al cuadrado.' : '.'),
      ley.vx + ' ' + operador(cambio.c) + (cuad ? ', así que ' + ley.vx + '² ' + operador(potencia(cambio.c, 2)) : '') + ': ' + ley.vy + ' ' + operador(f) + '.',
      mayuscula(ley.ny) + ' <b>' + efecto(f) + '</b>.'];
  }

  function cambiosPara(ley) {
    // Sin «se reduce a la mitad» en las de cuadrado (la tarea lo pregunta) ni para el satélite.
    return CAMBIOS.filter(function (cm) { return cm.c[1] === 1 || (ley.n !== 2 && !ley.sinMitad); });
  }

  function genFactor(nivel) {
    var tipo = azar(nivel === 1 ? ['simple'] : nivel === 2 ? ['simple', 'simple', 'numero'] : ['simple', 'numero', 'doble', 'reves']);
    if (tipo === 'numero') return genNumero();
    if (tipo === 'doble') return genDoble();
    if (tipo === 'reves') return genReves();

    var ley = azar(LEYES.filter(function (l) { return nivel === 1 ? Math.abs(l.n) === 1 : true; }));
    var cambio = azar(cambiosPara(ley).filter(function (cm) { return nivel > 1 || cm.c[1] === 1; }));
    var f = potencia(cambio.c, ley.n);
    var conFormula = nivel < 3 || Math.random() < 0.4;
    var enunciado = conFormula
      ? ley.intro + ' Si ' + ley.x + ' ' + cambio.txt + ', ¿qué le pasa ' + a(ley.y) + '?'
      : ley.sin + ' Si ' + ley.xs + ' ' + cambio.txt + ', ¿qué le pasa ' + a(ley.ys) + '?';
    return armar(enunciado, efecto(f), falsasDe(ley, cambio).map(function (x) { return { h: efecto(x.f), err: x.err }; }),
      { tema: 'Razonamiento proporcional', ask: 'Razona', pasos: pasosDe(ley, cambio, f) });
  }

  // Con números. Los de la tarea no salen: 180 lx a 3 m, 3,600 N al doble de distancia,
  // 50 kJ de 30 a 90 km/h y 1.2 m/s² con el triple de masa. Cada base deja limpias
  // también las falsas (al revés, sin el cuadrado…): nada de 2.222 kJ.
  var NUMERICAS = [
    { n: -2, u: 'N', f: 'F = k·q<sub>1</sub>·q<sub>2</sub> / r²', vx: 'r', vy: 'F', nx: 'la distancia', ny: 'la fuerza', bases: [36, 72, 144, 180, 360], cambios: [[2, 1], [3, 1], [1, 2]],
      txt: function (b, cm) { return 'Dos cargas se atraen con ' + cant(b, 'N') + '. Si la distancia entre ellas ' + cm.txt + ', ¿con qué fuerza se atraen?'; } },
    { n: -2, u: 'N', f: 'F = G·m<sub>1</sub>·m<sub>2</sub> / r²', vx: 'r', vy: 'F', nx: 'la distancia', ny: 'la fuerza', bases: [1800, 7200], cambios: [[2, 1], [3, 1]],
      txt: function (b, cm) { return 'La Tierra atrae a un satélite con ' + cant(b, 'N') + '. Si su distancia al centro de la Tierra ' + cm.txt + ', ¿con qué fuerza lo atrae?'; } },
    { n: -2, u: 'lx', f: 'E = I / d²', vx: 'd', vy: 'E', nx: 'la distancia', ny: 'la luz que llega', bases: [144, 360, 720], cambios: [[2, 1], [3, 1]],
      txt: function (b, cm) { return 'Un foco ilumina una hoja a 1 m con ' + cant(b, 'lx') + '. ¿Cuánta luz le llega si la alejas a ' + cant(cm.c[0], 'm') + ' del foco?'; } },
    // Un auto de unos 1,170 kg: 18 kJ a 20 km/h, 72 kJ a 40 y 162 kJ a 60.
    { n: 2, u: 'kJ', f: 'E = ½·m·v²', vx: 'v', vy: 'E', nx: 'la velocidad', ny: 'la energía cinética', pares: [[20, 18, 2], [20, 18, 3], [40, 72, 2], [40, 72, 3], [60, 162, 2]],
      txt: function (p) { return 'Un auto a ' + cant(p[0], 'km/h') + ' tiene ' + cant(p[1], 'kJ') + ' de energía cinética. ¿Cuánta tiene a ' + cant(p[0] * p[2], 'km/h') + '?'; } },
    { n: -1, u: 'm/s²', f: 'a = F / m', vx: 'm', vy: 'a', nx: 'la masa', ny: 'la aceleración', pares: [[10, 3, 2], [12, 2.4, 2], [8, 2, 2], [10, 1.8, 3], [12, 2.7, 3], [20, 0.9, 3], [20, 1.5, 0.5]],
      txt: function (p) { return 'Con la misma fuerza, un carrito de ' + cant(p[0], 'kg') + ' acelera ' + cant(p[1], 'm/s²') + '. ¿Cuánto acelera uno de ' + cant(p[0] * p[2], 'kg') + '?'; } },
    { n: -1, u: 'h', f: 't = d / v', vx: 'v', vy: 't', nx: 'la velocidad', ny: 'el tiempo', pares: [[40, 3, 2], [50, 4, 2], [40, 4.5, 3], [60, 3, 0.5]],
      txt: function (p) { return 'A ' + cant(p[0], 'km/h') + ', un viaje dura ' + cant(p[1], 'h') + '. ¿Cuánto dura el mismo viaje a ' + cant(p[0] * p[2], 'km/h') + '?'; } },
    // Cada par es [lo que cambia, el valor que se conoce, el factor]: aquí [horas, km, factor].
    { n: 1, u: 'km', f: 'd = v·t', vx: 't', vy: 'd', nx: 'el tiempo', ny: 'la distancia', pares: [[1, 15, 2], [1, 12, 3], [2, 20, 2], [2, 30, 0.5], [2, 18, 3]],
      txt: function (p) { return 'Una ciclista recorre ' + cant(p[1], 'km') + ' en ' + cant(p[0], 'h') + '. A la misma velocidad, ¿cuánto recorre en ' + cant(p[0] * p[2], 'h') + '?'; } }
  ];

  function valor(b, f) { return Math.round(b * f[0] / f[1] * 1000) / 1000; }

  function genNumero() {
    var q = azar(NUMERICAS), base, cambio, enunciado;
    if (q.pares) {
      var p = azar(q.pares);
      base = p[1];
      cambio = { c: p[2] >= 1 ? [p[2], 1] : [1, Math.round(1 / p[2])] };
      enunciado = q.txt(p);
    } else {
      base = azar(q.bases);
      var c = azar(q.cambios);
      cambio = CAMBIOS.filter(function (cm) { return cm.c[0] === c[0] && cm.c[1] === c[1]; })[0];
      enunciado = q.txt(base, cambio);
    }
    var f = potencia(cambio.c, q.n);
    var bien = valor(base, f);
    var pasos = pasosDe(q, cambio, f).slice(0, 2);
    pasos.push(cant(base, q.u) + ' ' + operador(f) + ' = <b>' + cant(bien, q.u) + '</b>.');
    return armar(enunciado, cant(bien, q.u), falsasDe(q, cambio).map(function (x) { return { h: cant(valor(base, x.f), q.u), err: x.err }; }),
      { tema: 'Razonamiento proporcional', ask: 'Calcula', pasos: pasos });
  }

  // Dos cambios a la vez: cada uno da su factor y los factores se multiplican.
  var DOBLES = [
    { txt: 'En F = G·m<sub>1</sub>·m<sub>2</sub> / r², si una de las masas se duplica y la distancia r también, ¿qué le pasa a F?', f: [1, 2],
      pasos: ['La masa: F × 2. La distancia: r × 2, r² × 4, F ÷ 4.', '× 2 ÷ 4 = ÷ 2: <b>se reduce a la mitad</b>.'],
      falsas: [{ f: [1, 1], err: 'El × 2 de la masa no se cancela con el de la distancia: r está al cuadrado y divide entre 4.' },
        { f: [2, 1], err: 'Te faltó la distancia: al duplicarse r, F se divide entre 4.' },
        { f: [1, 4], err: 'Te faltó la masa: al duplicarse, F se multiplica por 2.' }] },
    { txt: 'En F = k·q<sub>1</sub>·q<sub>2</sub> / r², si las dos cargas se duplican y la distancia r también, ¿qué le pasa a F?', f: [1, 1],
      pasos: ['Las cargas: × 2 × 2 = × 4. La distancia: r² × 4, F ÷ 4.', '× 4 ÷ 4: <b>no cambia</b>.'],
      falsas: [{ f: [4, 1], err: 'Te faltó la distancia: r² × 4 divide a F entre 4.' },
        { f: [1, 4], err: 'Te faltaron las cargas: cada una multiplica a F por 2.' },
        { f: [1, 2], err: 'Las dos cargas cambian: × 2 por cada una, × 4 en total.' }] },
    { txt: 'En E = ½·m·v², si la masa se duplica y la velocidad también, ¿qué le pasa a la energía cinética?', f: [8, 1],
      pasos: ['La masa: E × 2. La velocidad: v² × 4, E × 4.', '× 2 × 4 = × 8: <b>se multiplica por 8</b>.'],
      falsas: [{ f: [4, 1], err: 'Te faltó la masa: al duplicarse, la energía se multiplica otra vez por 2.' },
        { f: [2, 1], err: 'Te faltó la velocidad: al duplicarse, v² se multiplica por 4.' },
        { f: [16, 1], err: 'La masa no está al cuadrado: sólo multiplica por 2, no por 4.' }] },
    { txt: 'En p = F / A, si la fuerza se duplica y el área también, ¿qué le pasa a la presión?', f: [1, 1],
      pasos: ['La fuerza: p × 2. El área: p ÷ 2.', '× 2 ÷ 2: <b>no cambia</b>.'],
      falsas: [{ f: [2, 1], err: 'Te faltó el área: al duplicarse, divide a la presión entre 2.' },
        { f: [1, 2], err: 'Te faltó la fuerza: al duplicarse, multiplica a la presión por 2.' },
        { f: [4, 1], err: 'El área está dividiendo: su × 2 cancela el × 2 de la fuerza.' }] }
  ];

  function genDoble() {
    var d = azar(DOBLES);
    return armar(d.txt, efecto(d.f), d.falsas.map(function (x) { return { h: efecto(x.f), err: x.err }; }),
      { tema: 'Razonamiento proporcional', ask: 'Razona', pasos: d.pasos });
  }

  // Al revés: se sabe cuánto cambió y y se pregunta por x (se saca la raíz si hay cuadrado).
  var REVES = [
    { txt: 'Para que la energía cinética de un auto se cuadruplique (con la misma masa), ¿qué le tiene que pasar a su velocidad?', bien: 'se duplica',
      pasos: ['En E = ½·m·v², v está al cuadrado: para E × 4 hace falta v² × 4.', 'v × 2, porque 2² = 4: <b>se duplica</b>.'],
      falsas: [{ h: 'se cuadruplica', err: 'Así E se multiplicaría por 16: v está al cuadrado, 4² = 16.' },
        { h: 'se multiplica por 16', err: 'Elevaste al cuadrado; aquí se saca la raíz: √4 = 2.' },
        { h: 'se reduce a la mitad', err: 'Al revés: para tener más energía hace falta ir más rápido.' }] },
    { txt: 'Para que la energía cinética de un auto se multiplique por 9 (con la misma masa), ¿qué le tiene que pasar a su velocidad?', bien: 'se triplica',
      pasos: ['En E = ½·m·v², v está al cuadrado: para E × 9 hace falta v² × 9.', 'v × 3, porque 3² = 9: <b>se triplica</b>.'],
      falsas: [{ h: 'se multiplica por 9', err: 'Así E se multiplicaría por 81: v está al cuadrado.' },
        { h: 'se multiplica por 81', err: 'Elevaste al cuadrado; aquí se saca la raíz: √9 = 3.' },
        { h: 'se reduce a la tercera parte', err: 'Al revés: para tener más energía hace falta ir más rápido.' }] },
    { txt: 'Para que la fuerza entre dos cargas se reduzca a la novena parte, ¿qué le tiene que pasar a la distancia entre ellas?', bien: 'se triplica',
      pasos: ['En F = k·q<sub>1</sub>·q<sub>2</sub> / r², r está dividiendo y al cuadrado: para F ÷ 9 hace falta r² × 9.', 'r × 3, porque 3² = 9: <b>se triplica</b>.'],
      falsas: [{ h: 'se multiplica por 9', err: 'Te faltó sacar la raíz: con r × 9, r² × 81.' },
        { h: 'se reduce a la tercera parte', err: 'Al revés: si las cargas se acercan, la fuerza crece.' },
        { h: 'se reduce a la novena parte', err: 'Al revés y sin la raíz: acercarlas hace la fuerza más grande.' }] },
    { txt: 'Para que la luz que llega a una hoja se reduzca a la cuarta parte, ¿qué le tiene que pasar a su distancia al foco?', bien: 'se duplica',
      pasos: ['En E = I / d², d está dividiendo y al cuadrado: para E ÷ 4 hace falta d² × 4.', 'd × 2, porque 2² = 4: <b>se duplica</b>.'],
      falsas: [{ h: 'se cuadruplica', err: 'Te faltó sacar la raíz: con d × 4, d² × 16 y llegaría la dieciseisava parte.' },
        { h: 'se reduce a la mitad', err: 'Al revés: si la acercas, le llega más luz.' },
        { h: 'se reduce a la cuarta parte', err: 'Al revés y sin la raíz: acercarla hace que le llegue más luz.' }] }
  ];

  function genReves() {
    var r = azar(REVES);
    return armar(r.txt, r.bien, r.falsas, { tema: 'Razonamiento proporcional', ask: 'Razona', pasos: r.pasos });
  }

  M.GENERADORES['vec-recta'] = genRecta;
  M.GENERADORES['vec-pitagoras'] = genPitagoras;
  M.GENERADORES['vec-componentes'] = genComponentes;
  M.GENERADORES['prop-factor'] = genFactor;
})();
