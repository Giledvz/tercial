/*
 * ejercicios-fisica.js — generadores de Física para la práctica sin fin.
 *
 * Se suman al registro de window.TercialMotor (ejercicios-motor.js), así que se
 * carga después de él. Cada generador devuelve la misma forma que los de
 * Matemáticas: { enunciado, correcta, opciones: [{ val, ok, err }], meta }. Las
 * preguntas son frases (meta.texto) y cada opción falsa es una confusión real,
 * con su explicación.
 *
 *   si-unidades   las siete fundamentales: unidad, magnitud y símbolo
 *   si-derivadas  cómo se arma la unidad de una magnitud derivada
 *   si-escritura  cómo se escribe una medida (5 m, no 5 mts)
 *   si-signo      el signo de la velocidad dice hacia dónde
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var MENOS = '−';

  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function conSigno(n) { return n > 0 ? '+' + n : n < 0 ? MENOS + -n : '0'; }
  function numero(n) { return n < 0 ? MENOS + -n : String(n); }
  function opcion(html) { return { k: 't:' + html, h: html }; }

  // El número y su unidad no se separan de renglón: 5 m, 15 m/s, 300 K.
  var NUMERO_UNIDAD = /(\d) (?=(?:kg·m\/s²|m\/s²|m\/s|km\/h|kg\/m³|m²|m³|cm|km|kg|min|mol|cd|m|s|h|g|K|A|N|J|W)(?![\wáéíóúñ²³\/]))/g;
  function juntar(html) { return String(html).replace(NUMERO_UNIDAD, '$1\u00a0'); }

  // La correcta y tres falsas distintas (al azar entre las que se ofrecen).
  function armar(enunciado, correcta, falsas, meta) {
    enunciado = juntar(enunciado);
    correcta = juntar(correcta);
    falsas = falsas.map(function (f) { return { h: juntar(f.h), err: juntar(f.err) }; });
    if (meta && meta.pasos) meta.pasos = meta.pasos.map(juntar);
    var vistas = {};
    vistas[correcta] = true;
    var elegidas = [];
    barajar(falsas).forEach(function (f) {
      if (elegidas.length < 3 && !vistas[f.h]) { vistas[f.h] = true; elegidas.push(f); }
    });
    var opciones = [{ val: opcion(correcta), ok: true }].concat(elegidas.map(function (f) {
      return { val: opcion(f.h), ok: false, err: f.err };
    }));
    return {
      enunciado: enunciado,
      correcta: opcion(correcta),
      opciones: barajar(opciones),
      meta: Object.assign({ texto: true, ask: 'Elige la correcta' }, meta)
    };
  }

  /* ---------- Las siete fundamentales ---------- */
  var FUNDAMENTALES = [
    { mag: 'la longitud', uni: 'el metro', sim: 'm', confusiones: [
      { h: 'kilómetro (km)', err: 'El kilómetro también mide longitud, pero es un múltiplo: la unidad fundamental es el metro.' },
      { h: 'pie (ft)', err: 'El pie es una unidad inglesa; no es del SI.' }],
      simbolos: [
        { h: 'mt', err: 'Los símbolos no son abreviaturas: el del metro es m.' },
        { h: 'mts', err: 'Los símbolos no llevan plural ni son abreviaturas: el del metro es m.' },
        { h: 'M', err: 'La M mayúscula es el prefijo mega, un millón; el metro es m minúscula.' }] },
    { mag: 'la masa', uni: 'el kilogramo', sim: 'kg', confusiones: [
      { h: 'gramo (g)', err: 'El gramo también mide masa, pero la unidad del SI es el kilogramo: la única fundamental con prefijo.' },
      { h: 'newton (N)', err: 'El newton es la unidad de la fuerza; la masa se mide en kilogramos.' },
      { h: 'libra (lb)', err: 'La libra es una unidad inglesa; no es del SI.' }],
      simbolos: [
        { h: 'Kg', err: 'La k de kilo va con minúscula: kg.' },
        { h: 'kgs', err: 'Los símbolos no llevan plural: kg.' },
        { h: 'kgr', err: 'No es una abreviatura: el símbolo es kg.' },
        { h: 'm', err: 'm es el símbolo del metro (y la letra de la masa en las fórmulas); el del kilogramo es kg.' }] },
    { mag: 'el tiempo', uni: 'el segundo', sim: 's', confusiones: [
      { h: 'hora (h)', err: 'La hora se acepta junto con el SI, pero la unidad fundamental del tiempo es el segundo.' },
      { h: 'minuto (min)', err: 'El minuto se acepta junto con el SI, pero la unidad fundamental del tiempo es el segundo.' }],
      simbolos: [
        { h: 'seg', err: '«seg» es una abreviatura; el símbolo del segundo es s.' },
        { h: 'sg', err: 'El símbolo del segundo es s, nada más.' },
        { h: 'S', err: 'La S mayúscula es el símbolo de otra unidad; el segundo es s minúscula.' },
        { h: 't', err: 't es la letra del tiempo en las fórmulas; su unidad, el segundo, es s.' }] },
    { mag: 'la corriente eléctrica', uni: 'el ampere', sim: 'A', confusiones: [
      { h: 'volt (V)', err: 'El volt mide el voltaje, no la corriente.' },
      { h: 'watt (W)', err: 'El watt mide la potencia.' }],
      simbolos: [
        { h: 'a', err: 'Va con mayúscula porque viene de un apellido, el de André-Marie Ampère: A.' },
        { h: 'amp', err: '«amp» es una abreviatura; el símbolo es A.' },
        { h: 'I', err: 'I es la letra de la corriente en las fórmulas (I = 2 A); su unidad, el ampere, es A.' }] },
    { mag: 'la temperatura', uni: 'el kelvin', sim: 'K', confusiones: [
      { h: 'grado Celsius (°C)', err: 'El grado Celsius se usa todos los días, pero la unidad del SI es el kelvin.' },
      { h: 'grado Fahrenheit (°F)', err: 'El grado Fahrenheit no es del SI.' }],
      simbolos: [
        { h: '°K', err: 'El kelvin no lleva el símbolo de grado: K.' },
        { h: 'k', err: 'La k minúscula es el prefijo kilo; el kelvin es K mayúscula.' },
        { h: 'T', err: 'T es la letra de la temperatura en las fórmulas; su unidad, el kelvin, es K.' }] },
    { mag: 'la cantidad de sustancia', uni: 'el mol', sim: 'mol', confusiones: [
      { h: 'gramo (g)', err: 'El gramo mide masa; la cantidad de sustancia cuenta partículas, en moles.' },
      { h: 'litro (L)', err: 'El litro mide volumen, no cantidad de sustancia.' }],
      simbolos: [
        { h: 'Mol', err: 'Los símbolos que no vienen de un apellido van con minúscula: mol.' },
        { h: 'mo', err: 'El símbolo del mol es la palabra completa: mol.' },
        { h: 'ml', err: 'ml son mililitros; el símbolo del mol es mol.' }] },
    { mag: 'la intensidad luminosa', uni: 'la candela', sim: 'cd', confusiones: [
      { h: 'watt (W)', err: 'El watt mide la potencia, no qué tan intensa se ve la luz.' },
      { h: 'lux (lx)', err: 'El lux es una unidad derivada: mide cuánta luz llega a una superficie.' }],
      simbolos: [
        { h: 'Cd', err: 'No viene de un apellido: va con minúscula, cd.' },
        { h: 'can', err: 'No es abreviatura: el símbolo de la candela es cd.' },
        { h: 'c', err: 'El símbolo de la candela es cd.' }] }
  ];

  function sinArticulo(frase) { return frase.replace(/^(el|la) /, ''); }
  function del(frase) { return frase.replace(/^el /, 'del ').replace(/^la /, 'de la '); }
  function mayuscula(frase) { return frase.charAt(0).toUpperCase() + frase.slice(1); }
  function etiqueta(f) { return sinArticulo(f.uni) + ' (' + f.sim + ')'; }

  function genUnidades(nivel) {
    // Nivel 1: las tres de la mecánica y la temperatura. Nivel 2: las siete. Nivel 3: también los símbolos.
    var lista = nivel === 1 ? FUNDAMENTALES.slice(0, 3).concat(FUNDAMENTALES[4]) : FUNDAMENTALES;
    var f = azar(lista);
    var otras = FUNDAMENTALES.filter(function (o) { return o !== f; });
    var tipo = azar(nivel === 3 ? ['unidad', 'magnitud', 'simbolo', 'simbolo'] : ['unidad', 'magnitud']);
    var pasos = [mayuscula(sinArticulo(f.mag)) + ': su unidad en el SI es ' + f.uni + ', y su símbolo, <b>' + f.sim + '</b>.'];
    if (tipo === 'unidad') {
      var falsas = f.confusiones.concat(otras.map(function (o) {
        return { h: etiqueta(o), err: mayuscula(o.uni) + ' es la unidad ' + del(o.mag) + '.' };
      }));
      return armar('¿Cuál es la unidad del SI ' + del(f.mag) + '?', etiqueta(f), falsas, { tema: 'Unidades del SI', pasos: pasos });
    }
    if (tipo === 'magnitud') {
      return armar(mayuscula(f.uni) + ' (' + f.sim + ') es la unidad de…', sinArticulo(f.mag), otras.map(function (o) {
        return { h: sinArticulo(o.mag), err: 'La unidad ' + del(o.mag) + ' es ' + o.uni + ' (' + o.sim + ').' };
      }), { tema: 'Unidades del SI', pasos: pasos });
    }
    return armar('¿Cuál es el símbolo ' + del(f.uni) + '?', f.sim, f.simbolos, {
      tema: 'Símbolos del SI',
      pasos: pasos.concat('Los símbolos no son abreviaturas: no llevan punto ni plural, y sólo van con mayúscula si vienen de un apellido.')
    });
  }

  /* ---------- Las derivadas ---------- */
  var DERIVADAS = [
    { mag: 'el área', calc: 'largo × ancho', uni: 'm²', nivel: 1, falsas: [
      { h: 'm', err: 'Se multiplican dos longitudes: m × m = m².' },
      { h: 'm³', err: 'm³ es de volumen, que multiplica tres longitudes.' },
      { h: '2 m', err: 'Las unidades se multiplican como letras: m × m = m², no 2 m.' }] },
    { mag: 'el volumen', calc: 'largo × ancho × alto', uni: 'm³', nivel: 1, falsas: [
      { h: 'm²', err: 'Son tres longitudes, no dos: m × m × m = m³.' },
      { h: '3 m', err: 'Las unidades se multiplican como letras: m × m × m = m³, no 3 m.' },
      { h: 'kg/m³', err: 'Ésa es la unidad de la densidad.' }] },
    { mag: 'la velocidad', calc: 'distancia ÷ tiempo', uni: 'm/s', nivel: 1, falsas: [
      { h: 'm·s', err: 'Se divide entre el tiempo, no se multiplica.' },
      { h: 's/m', err: 'Está al revés: la distancia va arriba y el tiempo abajo.' },
      { h: 'm/s²', err: 'Ésa es la unidad de la aceleración.' }] },
    { mag: 'la densidad', calc: 'masa ÷ volumen', uni: 'kg/m³', nivel: 1, falsas: [
      { h: 'kg·m³', err: 'Se divide entre el volumen, no se multiplica.' },
      { h: 'm³/kg', err: 'Está al revés: la masa va arriba.' },
      { h: 'kg/m²', err: 'El volumen va en m³, no en m².' }] },
    { mag: 'la aceleración', calc: 'cambio de velocidad ÷ tiempo', uni: 'm/s²', nivel: 2, falsas: [
      { h: 'm/s', err: 'Ésa es la de la velocidad; la aceleración la divide otra vez entre el tiempo.' },
      { h: 'm·s²', err: 'Se divide entre el tiempo, no se multiplica.' },
      { h: 's²/m', err: 'Está al revés: los metros van arriba.' }] },
    { mag: 'la fuerza', calc: 'masa × aceleración', uni: 'kg·m/s², el newton (N)', nivel: 3, falsas: [
      { h: 'kg·m/s', err: 'La aceleración va en m/s², no en m/s.' },
      { h: 'kg/(m·s²)', err: 'Se multiplica por la aceleración, no se divide.' },
      { h: 'kg·m²/s², el joule (J)', err: 'Ésa es la unidad de la energía.' }] },
    { mag: 'la energía', calc: 'fuerza × distancia', uni: 'N·m, el joule (J)', nivel: 3, falsas: [
      { h: 'N/m', err: 'Se multiplica por la distancia, no se divide.' },
      { h: 'N·s', err: 'Es fuerza por distancia, no por tiempo.' },
      { h: 'W, el watt', err: 'El watt es la unidad de la potencia: energía en cada segundo.' }] }
  ];

  function genDerivadas(nivel) {
    var lista = DERIVADAS.filter(function (d) { return d.nivel <= nivel; });
    var tipo = azar(nivel === 1 ? ['unidad'] : ['unidad', 'unidad', 'cual']);
    if (tipo === 'unidad') {
      var d = azar(lista);
      return armar(mayuscula(d.mag) + ' se calcula como ' + d.calc + '. ¿Cuál es su unidad?', d.uni, d.falsas, {
        tema: 'Magnitudes derivadas',
        pasos: ['La unidad se arma con la misma operación que la magnitud: ' + d.calc + '.', 'Queda <b>' + d.uni + '</b>.']
      });
    }
    // ¿Cuál es fundamental? o ¿cuál es derivada?
    // Las frases llevan su artículo («el tiempo», «la masa») para que la explicación concuerde.
    var buscaFundamental = Math.random() < 0.5;
    var fundamentales = FUNDAMENTALES.slice(0, 5).map(function (f) { return f.mag; });
    var derivadas = lista.map(function (x) { return x.mag; });
    var correcta = sinArticulo(azar(buscaFundamental ? fundamentales : derivadas));
    var falsas = (buscaFundamental ? derivadas : fundamentales).map(function (m) {
      return { h: sinArticulo(m), err: mayuscula(m) + (buscaFundamental
        ? ' se arma con otras magnitudes: es derivada.'
        : ' es una de las siete fundamentales.') };
    });
    return armar(buscaFundamental ? '¿Cuál de estas magnitudes es fundamental?' : '¿Cuál de estas magnitudes es derivada?',
      correcta, falsas, {
        tema: 'Fundamentales y derivadas',
        pasos: ['Las fundamentales son siete: longitud, masa, tiempo, corriente eléctrica, temperatura, cantidad de sustancia e intensidad luminosa.',
          'Todas las demás se arman con ellas: son derivadas.']
      });
  }

  /* ---------- Cómo se escribe una medida ---------- */
  var ESCRITURA = [
    { bien: '5 m', nivel: 1, mal: [
      { h: '5 mts', err: 'Los símbolos no llevan plural ni son abreviaturas: 5 m.' },
      { h: '5 m.', err: 'Los símbolos no llevan punto, salvo al final de una oración.' },
      { h: '5m', err: 'Entre el número y el símbolo va un espacio: 5 m.' },
      { h: '5 M', err: 'La M mayúscula es mega, un millón: el metro es m minúscula.' }] },
    { bien: '20 s', nivel: 1, mal: [
      { h: '20 seg', err: '«seg» es una abreviatura; el símbolo del segundo es s.' },
      { h: '20 sg', err: 'El símbolo del segundo es s, nada más.' },
      { h: '20 s.', err: 'Los símbolos no llevan punto.' },
      { h: '20 S', err: 'La S mayúscula es otra unidad; el segundo es s minúscula.' }] },
    { bien: '3 kg', nivel: 1, mal: [
      { h: '3 Kg', err: 'La k de kilo va con minúscula.' },
      { h: '3 kgs', err: 'Los símbolos no llevan plural.' },
      { h: '3 kg.', err: 'Los símbolos no llevan punto.' },
      { h: '3kg', err: 'Entre el número y el símbolo va un espacio.' }] },
    { bien: '250 g', nivel: 1, mal: [
      { h: '250 gr', err: '«gr» es una abreviatura; el símbolo del gramo es g.' },
      { h: '250 grs', err: 'Los símbolos no llevan plural ni son abreviaturas: 250 g.' },
      { h: '250 G', err: 'La G mayúscula es el prefijo giga, mil millones; el gramo es g minúscula.' },
      { h: '250 g.', err: 'Los símbolos no llevan punto.' }] },
    { bien: '8 cm', nivel: 1, mal: [
      { h: '8 cms', err: 'Los símbolos no llevan plural.' },
      { h: '8 Cm', err: 'La c de centi va con minúscula.' },
      { h: '8 cm.', err: 'Los símbolos no llevan punto.' },
      { h: '8 CM', err: 'Centi es c minúscula y metro, m minúscula.' }] },
    { bien: '30 min', nivel: 2, mal: [
      { h: '30 mins', err: 'Los símbolos no llevan plural.' },
      { h: '30 mn', err: 'El símbolo del minuto es min.' },
      { h: '30 min.', err: 'Los símbolos no llevan punto.' },
      { h: '30 m', err: 'm es el metro; el minuto es min.' }] },
    { bien: '100 km/h', nivel: 2, mal: [
      { h: '100 Km/h', err: 'La k de kilo va con minúscula.' },
      { h: '100 km/hr', err: 'El símbolo de la hora es h.' },
      { h: '100 kph', err: '«kph» no es un símbolo del SI: se escribe km/h.' },
      { h: '100 kms/h', err: 'Los símbolos no llevan plural.' }] },
    { bien: '2 h', nivel: 2, mal: [
      { h: '2 hrs', err: 'El símbolo de la hora es h, sin plural.' },
      { h: '2 hr', err: 'El símbolo de la hora es sólo h.' },
      { h: '2 h.', err: 'Los símbolos no llevan punto.' },
      { h: '2 H', err: 'La hora es h minúscula.' }] },
    { bien: '12 km', nivel: 2, mal: [
      { h: '12 Km', err: 'La k de kilo va con minúscula.' },
      { h: '12 kms', err: 'Los símbolos no llevan plural.' },
      { h: '12 KM', err: 'Kilo es k minúscula y metro, m minúscula.' },
      { h: '12 km.', err: 'Los símbolos no llevan punto.' }] },
    { bien: '300 K', nivel: 3, mal: [
      { h: '300 °K', err: 'El kelvin no lleva el símbolo de grado.' },
      { h: '300 k', err: 'La k minúscula es kilo; el kelvin es K mayúscula.' },
      { h: '300 K°', err: 'El kelvin no lleva el símbolo de grado.' }] },
    { bien: '1.5 A', nivel: 3, mal: [
      { h: '1.5 a', err: 'El ampere va con A mayúscula: viene del apellido Ampère.' },
      { h: '1.5 amp', err: '«amp» es una abreviatura; el símbolo es A.' },
      { h: '1.5 A.', err: 'Los símbolos no llevan punto.' }] }
  ];

  function genEscritura(nivel) {
    var e = azar(ESCRITURA.filter(function (x) { return x.nivel <= nivel; }));
    return armar('¿Cuál está bien escrita?', e.bien, e.mal, {
      tema: 'Cómo se escribe una medida',
      pasos: ['Número, un espacio y el símbolo: <b>' + e.bien + '</b>.',
        'El símbolo no lleva punto ni plural, y no se cambian sus mayúsculas.']
    });
  }

  /* ---------- El signo es dirección ---------- */
  var CON_DIRECCION = ['la velocidad', 'la fuerza', 'el desplazamiento'];
  var SIN_DIRECCION = ['la masa', 'el tiempo', 'la temperatura', 'el volumen', 'la densidad'];

  function genSigno(nivel) {
    var tipo = azar(nivel === 1 ? ['velocidad'] : nivel === 2 ? ['velocidad', 'posicion', 'posicion', 'direccion'] : ['posicion', 'posicion', 'convencion', 'direccion']);

    if (tipo === 'velocidad' || tipo === 'convencion') {
      var r = azar([2, 3, 4, 5, 8, 10, 15, 20]);
      var haciaDerecha = Math.random() < 0.5;
      var positivaDerecha = tipo === 'velocidad';
      var v = (haciaDerecha === positivaDerecha) ? r : -r;
      var lado = haciaDerecha ? 'derecha' : 'izquierda';
      var enunciado = (positivaDerecha ? 'La derecha es positiva. ' : 'Ahora la izquierda es positiva. ') +
        'Un auto va a ' + r + ' m/s hacia la ' + lado + '. ¿Cuál es su velocidad?';
      return armar(enunciado, conSigno(v) + ' m/s', [
        { h: conSigno(-v) + ' m/s', err: positivaDerecha
          ? 'El signo dice hacia dónde: hacia la ' + lado + ' es ' + (v < 0 ? 'negativo' : 'positivo') + '.'
          : 'Con la izquierda positiva, ir hacia la ' + lado + ' es ' + (v < 0 ? 'negativo' : 'positivo') + '.' },
        { h: conSigno(v) + ' m', err: 'La velocidad va en m/s; los metros son distancia.' },
        { h: '0 m/s', err: 'Se está moviendo: su velocidad no es cero.' }
      ], {
        tema: 'El signo es dirección',
        pasos: ['Rapidez: ' + r + ' m/s. Dirección: hacia la ' + lado + ', que aquí es el lado ' + (v < 0 ? 'negativo' : 'positivo') + '.',
          'Velocidad: <b>' + conSigno(v) + ' m/s</b>.']
      });
    }

    if (tipo === 'posicion') {
      var x0, vel, t, x;
      do {
        x0 = azar([10, 15, 20, 25, 30]);
        vel = azar([2, 3, 4, 5]) * (Math.random() < 0.5 ? -1 : 1);
        t = azar([2, 3, 4]);
        x = x0 + vel * t;
      } while (nivel < 3 && x < 0);
      var cambio = vel * t;
      return armar('Un auto está en x = ' + x0 + ' m y va a ' + conSigno(vel) + ' m/s. ¿Dónde está ' + t + ' s después?',
        'x = ' + numero(x) + ' m', [
          { h: 'x = ' + numero(x0 - cambio) + ' m', err: 'Con velocidad ' + (vel < 0 ? 'negativa, x baja' : 'positiva, x sube') + ': revisa el signo.' },
          { h: 'x = ' + numero(cambio) + ' m', err: 'Eso es lo que cambia; falta partir de donde estaba, x = ' + x0 + ' m.' },
          { h: 'x = ' + numero(x0 + vel) + ' m', err: 'Ése es el cambio de un solo segundo; en ' + t + ' s cambia ' + t + ' × (' + conSigno(vel) + ' m) = ' + numero(cambio) + ' m.' },
          { h: 'x = ' + numero(cambio - x0) + ' m', err: 'Se parte de donde estaba y se le suma el cambio: ' + x0 + ' m + (' + numero(cambio) + ' m).' }
        ], {
          tema: 'El signo es dirección',
          pasos: ['Cada segundo, x cambia ' + conSigno(vel) + ' m.',
            'En ' + t + ' s: ' + t + ' × (' + conSigno(vel) + ' m) = ' + numero(cambio) + ' m.',
            'Posición: ' + x0 + ' m + (' + numero(cambio) + ' m) = <b>' + numero(x) + ' m</b>.']
        });
    }

    var correcta = azar(CON_DIRECCION);
    return armar('¿Cuál de estas magnitudes tiene dirección?', sinArticulo(correcta), SIN_DIRECCION.map(function (m) {
      return { h: sinArticulo(m), err: mayuscula(m) + ' sólo tiene tamaño: no apunta hacia ningún lado.' };
    }), {
      tema: 'Magnitudes con dirección',
      pasos: ['La velocidad, la fuerza y el desplazamiento apuntan hacia algún lado: sobre una recta, eso se dice con el signo.',
        'La masa, el tiempo o la temperatura sólo tienen tamaño.']
    });
  }

  M.GENERADORES['si-unidades'] = genUnidades;
  M.GENERADORES['si-derivadas'] = genDerivadas;
  M.GENERADORES['si-escritura'] = genEscritura;
  M.GENERADORES['si-signo'] = genSigno;
})();
