/*
 * ejercicios-analisis-dimensional.js — Física, semana 4: Análisis dimensional.
 *
 * Generadores de la práctica sin fin y del reto relámpago. Se suman al registro de
 * window.TercialMotor con los ayudantes de M.fisica (ejercicios-fisica.js), así que se
 * cargan después de los dos. Cada opción falsa es un error real con su explicación:
 * no cancelar, cancelar un cuadrado completo, voltear una fracción, sumar unidades
 * distintas, confundir la m de masa con la m de metro…
 *
 *   ad-operacion      la unidad que queda después de operar (m/s × s = m)
 *   ad-fundamentales  las unidades con nombre en kg, m y s (N = kg·m/s²), y qué es cada letra
 *   ad-dimensiones    las dimensiones de una magnitud con L, M y T (velocidad: L/T)
 *   ad-formula        cuál fórmula puede ser correcta, revisando las unidades
 *   ad-descarta       qué respuesta de un problema puede ser, o se descarta, sin hacer cuentas
 *
 * Los ejercicios de la tarea (examenes-pdf/tarea-analisis-dimensional.html) no salen aquí.
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M || !M.fisica) return;
  var F = M.fisica;
  var azar = F.azar;
  var MENOS = F.MENOS;

  // El número y su unidad no se separan de renglón: 20 m, 18 N, 1,200 kg·m³, 5 L/min.
  var NUMERO_UNIDAD = /(\d) (?=(?:kg|km|cm|min|Pa|m|s|h|g|L|N|J|W)(?![A-Za-zÁÉÍÓÚáéíóúñ]))/g;
  function unir(html) { return String(html).replace(NUMERO_UNIDAD, '$1 '); }

  // Una unidad en forma de fracción, como se ve al cancelar.
  function fr(n, d) { return '<span class="fr"><span class="fr__n">' + n + '</span><span class="fr__d">' + d + '</span></span>'; }
  // Una magnitud dentro de una fórmula va en cursiva (m, la masa); su unidad, derecha (m, el metro).
  function v(letra) { return '<i>' + letra + '</i>'; }

  // Números como se escriben en México: punto decimal y coma de miles.
  function num(n) {
    var r = Math.round(n * 1000) / 1000;
    var partes = String(Math.abs(r)).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (r < 0 ? MENOS : '') + partes.join('.');
  }

  function armar(enunciado, correcta, falsas, meta) {
    return F.armar(unir(enunciado), unir(correcta), falsas.map(function (f) {
      return { h: unir(f[0]), err: unir(f[1]) };
    }), Object.assign({}, meta, { pasos: (meta.pasos || []).map(unir) }));
  }

  // Del nivel pedido casi siempre; a veces uno del nivel anterior, para repasar.
  function delNivel(lista, nivel) {
    var n = nivel > 1 && Math.random() < 0.25 ? nivel - 1 : nivel;
    return azar(lista.filter(function (x) { return x.n === n; }));
  }

  /* ---------- La unidad que queda ---------- */
  var OPERACIONES = [
    { n: 1, e: fr('m', 's') + ' × s', c: 'm', f: [
      ['m/s²', 'Multiplicar por s no la manda abajo: la s que multiplica cancela a la de abajo.'],
      ['m·s', 'Faltó la s de abajo: arriba quedan m y s, abajo s, y las dos s se cancelan.'],
      ['m/s', 'La s que multiplica sí cuenta: cancela a la de abajo.'],
      ['s', 'Se cancelan las unidades iguales, s con s; la m se queda.']],
      p: ['Todo en una fracción: arriba m × s, abajo s.', 'La s de arriba cancela a la de abajo, como (a/b) · b = a.', 'Queda <b>m</b>, una distancia.'] },
    { n: 1, e: fr('km', 'h') + ' × h', c: 'km', f: [
      ['km/h²', 'Multiplicar por h no la manda abajo: la h que multiplica cancela a la de abajo.'],
      ['km·h', 'Faltó la h de abajo: la h de arriba y la de abajo se cancelan.'],
      ['km/h', 'La h que multiplica cancela a la de abajo: ya no queda km/h.'],
      ['h', 'Se cancelan las h; los km se quedan.']],
      p: ['Todo en una fracción: arriba km × h, abajo h.', 'La h de arriba cancela a la de abajo.', 'Queda <b>km</b>, una distancia.'] },
    { n: 1, e: 'm × m', c: 'm²', f: [
      ['2 m', 'Las unidades no se suman como números: m × m = m², como x · x = x².'],
      ['m', 'No se queda igual: m × m = m².'],
      ['m³', 'Son dos factores m, no tres: m².']],
      p: ['Como x · x = x²: m × m = <b>m²</b>.', 'Es una unidad de área.'] },
    { n: 1, e: 'm² × m', c: 'm³', f: [
      ['m²', 'Al multiplicar por otra m sube el exponente: m² × m = m³.'],
      ['3 m', 'Los exponentes se suman, 2 + 1 = 3, pero siguen siendo exponentes: m³.'],
      ['2 m²', 'Las unidades no se suman como números: m² × m = m³, como x² · x = x³.']],
      p: ['Como x² · x = x³: los exponentes se suman, 2 + 1 = 3.', 'Queda <b>m³</b>, una unidad de volumen.'] },
    { n: 1, e: 'm ÷ s', c: 'm/s', f: [
      ['m·s', 'Se divide entre s: la s va abajo, no se multiplica.'],
      ['s/m', 'Está al revés: lo que divide, la s, va abajo.'],
      ['m/s²', 'Se divide una sola vez entre s: m/s.']],
      p: ['Dividir es escribir una fracción: m arriba, s abajo.', 'Queda <b>m/s</b>, una velocidad.'] },
    { n: 1, e: 'km ÷ h', c: 'km/h', f: [
      ['km·h', 'Se divide entre h: la h va abajo, no se multiplica.'],
      ['h/km', 'Está al revés: lo que divide, la h, va abajo.'],
      ['km/h²', 'Se divide una sola vez entre h: km/h.']],
      p: ['Dividir es escribir una fracción: km arriba, h abajo.', 'Queda <b>km/h</b>, una rapidez.'] },
    { n: 1, e: 'kg ÷ m³', c: 'kg/m³', f: [
      ['kg·m³', 'Se divide entre m³, no se multiplica.'],
      ['m³/kg', 'Está al revés: los kg van arriba.'],
      ['kg/m²', 'El m³ completo va abajo: kg/m³.']],
      p: ['kg arriba, m³ abajo: <b>kg/m³</b>.', 'Es la unidad de la densidad.'] },
    { n: 1, e: 'm³ ÷ m²', c: 'm', f: [
      ['m⁵', 'Al dividir, los exponentes se restan, no se suman: 3 − 2 = 1.'],
      ['1', 'No se cancelan todas: arriba hay tres m y abajo dos; sobra una.'],
      ['1.5 m', 'Los exponentes no se dividen: se restan, 3 − 2 = 1.']],
      p: ['m³ es m × m × m, y m² es m × m.', 'Dos m de arriba se cancelan con las de abajo; sobra una: <b>m</b>.'] },

    { n: 2, e: fr('m', 's') + ' ÷ s', c: 'm/s²', f: [
      ['m', 'Dividir entre s no la cancela: la otra s también va abajo.'],
      ['m/s', 'Falta dividir entre la otra s: abajo quedan s × s = s².'],
      ['m²/s²', 'Sólo hay una m: arriba m y abajo s × s = s².']],
      p: ['Dividir entre s es poner otra s abajo: m ÷ (s × s).', 's × s = s²: queda <b>m/s²</b>, una aceleración.'] },
    { n: 2, e: fr('m', 's²') + ' × s', c: 'm/s', f: [
      ['m', 's² es s × s: la s que multiplica cancela sólo una de las dos.'],
      ['m/s³', 'Multiplicar por s no la manda abajo: cancela una de las s de abajo.'],
      ['m·s', 'La s de arriba se cancela con una de abajo; no se queda.'],
      ['m/s²', 'La s que multiplica sí cuenta: cancela una de las dos s de abajo.']],
      p: ['s² es s × s.', 'La s de arriba cancela sólo una de las dos.', 'Queda <b>m/s</b>, una velocidad.'] },
    { n: 2, e: 'kg × ' + fr('m', 's²'), c: 'kg·m/s² = N', f: [
      ['kg·m/s', 'La aceleración va en m/s²: el s² se queda abajo.'],
      ['kg/(m·s²)', 'Se multiplica por m/s²: la m va arriba, no abajo.'],
      ['kg·m²/s² = J', 'Ése es el joule: tiene una m de más.'],
      ['m/s²', 'Los kg no se cancelan: no hay kg abajo.']],
      p: ['Nada se repite arriba y abajo: no se cancela nada.', 'Se juntan: kg·m/s².', 'Tiene nombre propio: el newton, <b>N</b>.'] },
    { n: 2, e: 'N × m', c: 'N·m = J', f: [
      ['N/m', 'Se multiplica, no se divide.'],
      ['N', 'La m no se cancela: no hay m abajo.'],
      ['W', 'El watt es J ÷ s, una potencia.'],
      ['kg·m/s²', 'Eso es sólo el newton; falta multiplicar por m.']],
      p: ['Se juntan: N·m.', 'Fuerza × distancia es trabajo: N·m es el joule, <b>J</b>.'] },
    { n: 2, e: 'J ÷ s', c: 'J/s = W', f: [
      ['J·s', 'Se divide entre s, no se multiplica.'],
      ['N', 'El newton es de fuerza; J ÷ s es una potencia.'],
      ['J', 'La s no se cancela: no hay s arriba.'],
      ['s/J', 'Está al revés: los J van arriba.']],
      p: ['J arriba, s abajo: J/s.', 'Energía en cada segundo es potencia: J/s es el watt, <b>W</b>.'] },
    { n: 2, e: 'km ÷ ' + fr('km', 'h'), c: 'h', f: [
      ['km²/h', 'Dividir entre una fracción es multiplicar por su inversa: km × h/km.'],
      ['km/h', 'Los km se cancelan: queda h.'],
      ['1/h', 'La fracción se voltea: la h queda arriba.'],
      ['km', 'Se cancelan los km, no las h.']],
      p: ['Dividir entre km/h es multiplicar por h/km.', 'km × h ÷ km: los km se cancelan.', 'Queda <b>h</b>, un tiempo.'] },
    { n: 2, e: 'J ÷ m', c: 'N', f: [
      ['N/m', 'J es N·m: al dividir entre m, la m se cancela y queda N.'],
      ['J·m', 'Se divide, no se multiplica.'],
      ['W', 'El watt es J ÷ s; aquí se divide entre m.'],
      ['N·m²', 'Dividir entre m quita una m: N·m ÷ m = N.']],
      p: ['J es N·m.', 'N·m ÷ m: la m se cancela.', 'Queda <b>N</b>, una fuerza.'] },

    { n: 3, e: '(' + fr('m', 's') + ')²', c: 'm²/s²', f: [
      ['m²/s', 'El cuadrado afecta a toda la fracción: también a la s.'],
      ['m/s²', 'El cuadrado es para la m y para la s.'],
      ['2 m/s', 'Elevar al cuadrado no es multiplicar por 2.'],
      ['m²·s²', 'La s sigue abajo: m²/s².']],
      p: ['El cuadrado afecta a todo lo de adentro, arriba y abajo.', 'Como (x/y)² = x²/y²: queda <b>m²/s²</b>.'] },
    { n: 3, e: 'kg × (' + fr('m', 's') + ')²', c: 'kg·m²/s² = J', f: [
      ['kg·m/s² = N', 'Elevaste sólo la s: (m/s)² = m²/s².'],
      ['kg²·m²/s²', 'El cuadrado es sólo de m/s: el kg no se eleva.'],
      ['kg·m²/s', 'El cuadrado también afecta a la s: s².'],
      ['kg·m/s', 'Falta el cuadrado: (m/s)² = m²/s².']],
      p: ['(m/s)² = m²/s².', 'kg × m²/s² = kg·m²/s², el joule, <b>J</b>.', 'Así sale la unidad de la energía cinética, ½mv².'] },
    { n: 3, e: 'N ÷ m²', c: 'N/m² = Pa', f: [
      ['N·m²', 'Se divide entre m², no se multiplica.'],
      ['J', 'El joule es N·m; aquí se divide entre m².'],
      ['N/m', 'Se divide entre m², no entre m.'],
      ['W', 'El watt es J ÷ s, una potencia.']],
      p: ['N arriba, m² abajo: N/m².', 'Fuerza entre área es presión: N/m² es el pascal, <b>Pa</b>.'] },
    { n: 3, e: 'kg × ' + fr('m', 's²') + ' × m', c: 'kg·m²/s² = J', f: [
      ['kg·m/s² = N', 'Falta la última m: kg·m/s² × m = kg·m²/s².'],
      ['kg·m²/s', 'El s² se queda completo abajo: no hay s arriba que lo cancele.'],
      ['kg/s²', 'No hay m abajo: las dos m se multiplican, m × m = m².'],
      ['kg·m/s', 'No se cancela nada: abajo se queda s².']],
      p: ['Arriba: kg × m × m = kg·m². Abajo: s².', 'Queda kg·m²/s², el joule, <b>J</b>: fuerza × distancia.'] },
    { n: 3, e: '(' + fr('m', 's') + ')² ÷ m', c: 'm/s²', f: [
      ['m²/s²', 'Falta dividir entre m: una m de arriba se cancela.'],
      ['m/s', 'El cuadrado afecta también a la s: m²/s² ÷ m = m/s².'],
      ['m³/s²', 'Se divide entre m, no se multiplica.'],
      ['s²/m', 'Está al revés: las m van arriba.']],
      p: ['(m/s)² = m²/s².', 'Al dividir entre m se cancela una m de arriba.', 'Queda <b>m/s²</b>: es la aceleración en una curva, v²/r.'] },
    { n: 3, e: fr('m', 's') + ' ÷ ' + fr('m', 's²'), c: 's', f: [
      ['m²/s³', 'Dividir entre una fracción es multiplicar por su inversa: m/s × s²/m.'],
      ['1/s', 'Al voltear m/s² queda s²/m: arriba s², abajo s; la s queda arriba.'],
      ['s²', 'Una s de arriba se cancela con la de abajo: s² ÷ s = s.'],
      ['m', 'Las m se cancelan; queda s.']],
      p: ['Dividir entre m/s² es multiplicar por s²/m.', 'm/s × s²/m: las m se cancelan y s² ÷ s = s.', 'Queda <b>s</b>: velocidad ÷ aceleración es un tiempo.'] },
    { n: 3, e: 'm ÷ ' + fr('m', 's²'), c: 's²', f: [
      ['m²/s²', 'Dividir entre una fracción es multiplicar por su inversa: m × s²/m.'],
      ['s', 'Al voltear m/s², el s² sube completo.'],
      ['1/s²', 'La fracción se voltea: s² queda arriba.'],
      ['m/s²', 'Las m se cancelan; queda s².']],
      p: ['Dividir entre m/s² es multiplicar por s²/m.', 'm × s²/m: las m se cancelan.', 'Queda <b>s²</b>: distancia ÷ aceleración da un tiempo al cuadrado.'] }
  ];

  function genOperacion(nivel) {
    var o = delNivel(OPERACIONES, nivel);
    return armar(o.e, o.c, o.f, { tema: 'Operar con unidades', ask: 'Simplifica las unidades', texto: false, pasos: o.p });
  }

  /* ---------- Las unidades con nombre, en kg, m y s; y qué es cada letra ---------- */
  var NOMBRADAS = [
    { n: 1, e: '¿Cómo se escribe el newton (N) en kg, m y s?', c: 'kg·m/s²', f: [
      ['kg·m/s', 'La aceleración va en m/s²: N = kg × m/s².'],
      ['kg·m²/s²', 'Ése es el joule: newton por metro.'],
      ['kg/s²', 'Falta la m: F = m·a, y la aceleración lleva m arriba.'],
      ['kg·s²/m', 'Está al revés: la m va arriba y el s², abajo.']],
      p: ['F = m·a: el newton es kg × m/s².', 'Queda <b>kg·m/s²</b>.'] },
    { n: 1, e: '¿Cómo se escribe el joule (J) en kg, m y s?', c: 'kg·m²/s²', f: [
      ['kg·m/s²', 'Ése es el newton; el joule es newton por metro: una m más.'],
      ['kg·m²/s', 'El s² del newton se queda: J = kg·m/s² × m.'],
      ['kg·m/s', 'J = N × m = kg·m/s² × m: arriba m², abajo s².'],
      ['kg²·m²/s²', 'Sólo hay un kg: el de la masa.']],
      p: ['Trabajo = fuerza × distancia: J = N × m.', 'kg·m/s² × m = <b>kg·m²/s²</b>.'] },
    { n: 1, e: 'kg·m/s² es la unidad llamada…', c: 'newton (N)', f: [
      ['joule (J)', 'El joule es kg·m²/s²: lleva m².'],
      ['watt (W)', 'El watt es kg·m²/s³.'],
      ['pascal (Pa)', 'El pascal es kg/(m·s²): la m va abajo.'],
      ['kilogramo (kg)', 'El kilogramo es sólo la masa; con m/s² se vuelve una fuerza.']],
      p: ['kg × m/s² es masa × aceleración: una fuerza.', 'Su unidad es el newton, <b>N</b>.'] },

    { n: 2, e: 'kg·m²/s² es la unidad llamada…', c: 'joule (J)', f: [
      ['newton (N)', 'El newton es kg·m/s²: tiene una m menos.'],
      ['watt (W)', 'El watt es kg·m²/s³: una s más abajo.'],
      ['pascal (Pa)', 'El pascal es kg/(m·s²).']],
      p: ['kg·m²/s² = (kg·m/s²) × m: fuerza × distancia.', 'Es el joule, <b>J</b>.'] },
    { n: 2, e: '¿Cómo se escribe el watt (W) en kg, m y s?', c: 'kg·m²/s³', f: [
      ['kg·m²/s²', 'Ése es el joule; el watt es J ÷ s: una s más abajo.'],
      ['kg·m²/s', 'W = J ÷ s = kg·m²/s² ÷ s: abajo quedan s³.'],
      ['kg·m/s³', 'El joule lleva m²: kg·m²/s² ÷ s.'],
      ['kg·m²·s', 'Se divide entre s, no se multiplica.']],
      p: ['W = J ÷ s, y J = kg·m²/s².', 'kg·m²/s² ÷ s = <b>kg·m²/s³</b>.'] },
    { n: 2, e: 'En ' + v('F') + ' = ' + v('m') + '·' + v('a') + ', ¿qué es la ' + v('m') + '?', c: 'la masa, en kg', f: [
      ['el metro', 'En una fórmula, la letra en cursiva es una magnitud: m es la masa. El metro es la m que acompaña a un número, como en 5 m.'],
      ['el minuto', 'El minuto se escribe min; aquí m es la masa.'],
      ['la aceleración', 'La aceleración es la a.']],
      p: [v('F') + ' = ' + v('m') + '·' + v('a') + ': fuerza = masa × aceleración.', v('m') + ' es <b>la masa, en kg</b>; el metro es la m que acompaña a un número: 5 m.'] },
    { n: 2, e: 'En ' + v('P') + ' = ' + v('m') + '·' + v('g') + ', el peso de un cuerpo, ¿qué es la ' + v('g') + '?', c: 'la gravedad, 9.8 m/s²', f: [
      ['el gramo', 'Aquí g va en cursiva: es una magnitud, la aceleración de la gravedad. El gramo es la g que acompaña a un número: 250 g.'],
      ['la masa', 'La masa es la m.'],
      ['el peso', 'El peso es la P: masa × gravedad.']],
      p: ['En una fórmula, la letra en cursiva es una magnitud.', v('g') + ' es <b>la gravedad, 9.8 m/s²</b>; el gramo es la g de 250 g.'] },
    { n: 2, e: 'En ' + v('E') + ' = ' + v('m') + '·' + v('g') + '·' + v('h') + ', la masa va en kg, ' + v('g') + ' en m/s² y la altura ' + v('h') + ' en m. ¿Qué unidad tiene ' + v('E') + '?', c: 'kg·m²/s² = J', f: [
      ['m³/s²', 'Tomaste la m de masa como metro: la masa va en kg.'],
      ['kg·g·m', 'Aquí g no es el gramo: es la gravedad, en m/s².'],
      ['kg·m·h', 'Aquí h no es la hora: es la altura, en m.'],
      ['kg·m/s² = N', 'Falta multiplicar por h, que va en m.']],
      p: ['Cambia cada letra por su unidad: kg × m/s² × m.', 'Arriba kg·m², abajo s²: <b>kg·m²/s² = J</b>.'] },

    { n: 3, e: '¿Cómo se escribe el pascal (Pa) en kg, m y s?', c: 'kg/(m·s²)', f: [
      ['kg·m/s²', 'Ése es el newton; el pascal es N ÷ m².'],
      ['kg·m³/s²', 'Se divide entre m², no se multiplica.'],
      ['kg/(m²·s²)', 'El newton trae una m arriba: kg·m/s² ÷ m² deja sólo una m abajo.'],
      ['kg·s²/m', 'El s² va abajo: kg/(m·s²).']],
      p: ['Pa = N ÷ m², y N = kg·m/s².', 'kg·m/s² ÷ m²: una m se cancela.', 'Queda <b>kg/(m·s²)</b>.'] },
    { n: 3, e: 'kg·m²/s³ es la unidad llamada…', c: 'watt (W)', f: [
      ['joule (J)', 'El joule es kg·m²/s²: una s menos abajo.'],
      ['newton (N)', 'El newton es kg·m/s².'],
      ['pascal (Pa)', 'El pascal es kg/(m·s²).']],
      p: ['kg·m²/s³ = (kg·m²/s²) ÷ s: energía en cada segundo.', 'Es el watt, <b>W</b>.'] },
    { n: 3, e: '¿Cuál de éstas NO es una forma de escribir el joule?', c: 'N/s', f: [
      ['N·m', 'N·m sí es el joule: fuerza × distancia.'],
      ['kg·m²/s²', 'Sí es el joule: N·m = kg·m/s² × m.'],
      ['Pa·m³', 'Sí es el joule: Pa·m³ = N/m² × m³ = N·m.']],
      p: ['J = N·m = kg·m²/s².', 'N/s es fuerza entre tiempo: no es una energía. La que no es: <b>N/s</b>.'] }
  ];

  function genFundamentales(nivel) {
    var o = delNivel(NOMBRADAS, nivel);
    return armar(o.e, o.c, o.f, { tema: 'Unidades fundamentales', ask: 'Elige la correcta', pasos: o.p });
  }

  /* ---------- Dimensiones: L, M y T ---------- */
  var DIMENSIONES = [
    { n: 1, mag: 'la velocidad', c: 'L/T', f: [
      ['L·T', 'Se divide entre el tiempo: L/T.'],
      ['T/L', 'Está al revés: la longitud arriba y el tiempo abajo.'],
      ['L/T²', 'Ésa es la aceleración.'],
      ['L', 'Falta el tiempo: la velocidad es longitud ÷ tiempo.']],
      p: ['Velocidad = distancia ÷ tiempo: m/s.', 'Longitud entre tiempo: <b>L/T</b>.'] },
    { n: 1, mag: 'el área', c: 'L²', f: [
      ['2L', 'Las dimensiones se multiplican como letras: L × L = L², no 2L.'],
      ['L', 'Son dos longitudes: L × L = L².'],
      ['L³', 'Ése es el volumen: tres longitudes.']],
      p: ['Área = largo × ancho: m².', 'Dos longitudes: <b>L²</b>.'] },
    { n: 1, mag: 'el volumen', c: 'L³', f: [
      ['3L', 'Las dimensiones se multiplican como letras: L × L × L = L³.'],
      ['L²', 'Ésa es el área: el volumen tiene tres longitudes.'],
      ['M/L³', 'Ésa es la densidad.']],
      p: ['Volumen = largo × ancho × alto: m³.', 'Tres longitudes: <b>L³</b>.'] },

    { n: 2, mag: 'la aceleración', c: 'L/T²', f: [
      ['L/T', 'Ésa es la velocidad; la aceleración se divide otra vez entre el tiempo.'],
      ['L·T²', 'Se divide entre el tiempo, no se multiplica.'],
      ['L²/T', 'El cuadrado va en el tiempo: m/s².'],
      ['T²/L', 'Está al revés: la longitud va arriba.']],
      p: ['Aceleración = velocidad ÷ tiempo: m/s².', 'Longitud entre tiempo al cuadrado: <b>L/T²</b>.'] },
    { n: 2, mag: 'la densidad', c: 'M/L³', f: [
      ['M·L³', 'Se divide entre el volumen, no se multiplica.'],
      ['L³/M', 'Está al revés: la masa va arriba.'],
      ['M/L²', 'El volumen es L³, no L².']],
      p: ['Densidad = masa ÷ volumen: kg/m³.', 'Masa entre longitud al cubo: <b>M/L³</b>.'] },
    { n: 2, mag: 'la fuerza', c: 'M·L/T²', f: [
      ['M·L/T', 'La aceleración es L/T², no L/T.'],
      ['M·L²/T²', 'Ésa es la energía: fuerza × distancia.'],
      ['M/T²', 'Falta la L de la aceleración.'],
      ['L/T²', 'Falta la masa: F = m·a.']],
      p: ['F = m·a: kg × m/s².', 'M × L/T² = <b>M·L/T²</b>.'] },

    { n: 3, mag: 'la energía', c: 'M·L²/T²', f: [
      ['M·L/T²', 'Ésa es la fuerza; la energía es fuerza × distancia: otra L.'],
      ['M·L²/T', 'La velocidad al cuadrado deja T² abajo.'],
      ['M²·L²/T²', 'Sólo hay una masa.'],
      ['L²/T²', 'Falta la masa.']],
      p: ['Energía = fuerza × distancia: kg·m²/s².', 'M × L²/T²: <b>M·L²/T²</b>.'] },
    { n: 3, mag: 'la potencia', c: 'M·L²/T³', f: [
      ['M·L²/T²', 'Ésa es la energía; la potencia es energía ÷ tiempo.'],
      ['M·L/T³', 'La energía lleva L²: M·L²/T² ÷ T.'],
      ['M·L²·T', 'Se divide entre el tiempo, no se multiplica.']],
      p: ['Potencia = energía ÷ tiempo: kg·m²/s³.', 'M·L²/T² ÷ T = <b>M·L²/T³</b>.'] },
    { n: 3, mag: 'la presión', c: 'M/(L·T²)', f: [
      ['M·L/T²', 'Ésa es la fuerza; la presión es fuerza ÷ área.'],
      ['M/(L²·T²)', 'La fuerza trae una L arriba: M·L/T² ÷ L² deja una sola L abajo.'],
      ['M·L³/T²', 'Se divide entre el área, no se multiplica.']],
      p: ['Presión = fuerza ÷ área: N/m².', 'M·L/T² ÷ L² = <b>M/(L·T²)</b>.'] }
  ];

  // Con exponentes (como en la semana 3, 1/T = T⁻¹): así viene en muchos libros y exámenes.
  var CON_EXPONENTES = [
    { mag: 'la velocidad', c: 'L·T⁻¹', f: [
      ['L·T', 'El tiempo va abajo: 1/T = T⁻¹, con exponente negativo.'],
      ['L⁻¹·T', 'Está al revés: la longitud va arriba y el tiempo, con exponente negativo.'],
      ['L·T⁻²', 'Ésa es la aceleración.']],
      p: ['Velocidad: L/T.', 'Como 1/T = T⁻¹: <b>L·T⁻¹</b>.'] },
    { mag: 'la aceleración', c: 'L·T⁻²', f: [
      ['L·T⁻¹', 'Ésa es la velocidad; la aceleración tiene T² abajo.'],
      ['L·T²', 'El tiempo va abajo: 1/T² = T⁻².'],
      ['L⁻¹·T⁻²', 'La longitud va arriba: su exponente es positivo.']],
      p: ['Aceleración: L/T².', 'Como 1/T² = T⁻²: <b>L·T⁻²</b>.'] },
    { mag: 'la fuerza', c: 'M·L·T⁻²', f: [
      ['M·L·T⁻¹', 'La aceleración es L/T²: el exponente de T es ' + MENOS + '2.'],
      ['M·L·T²', 'El tiempo va abajo: 1/T² = T⁻².'],
      ['M·L²·T⁻²', 'Ésa es la energía: fuerza × distancia.']],
      p: ['F = m·a: M·L/T².', 'Como 1/T² = T⁻²: <b>M·L·T⁻²</b>.'] },
    { mag: 'la energía', c: 'M·L²·T⁻²', f: [
      ['M·L·T⁻²', 'Ésa es la fuerza; la energía tiene otra L.'],
      ['M·L²·T²', 'El tiempo va abajo: exponente ' + MENOS + '2.'],
      ['M·L²·T⁻¹', 'La velocidad al cuadrado deja T² abajo: exponente ' + MENOS + '2.']],
      p: ['Energía: M·L²/T².', 'Como 1/T² = T⁻²: <b>M·L²·T⁻²</b>.'] },
    { mag: 'la densidad', c: 'M·L⁻³', f: [
      ['M·L³', 'El volumen va abajo: 1/L³ = L⁻³.'],
      ['M⁻¹·L³', 'Está al revés: la masa va arriba.'],
      ['M·L⁻²', 'El volumen es L³: exponente ' + MENOS + '3.']],
      p: ['Densidad: M/L³.', 'Como 1/L³ = L⁻³: <b>M·L⁻³</b>.'] }
  ];

  // ¿Qué magnitud tiene estas dimensiones?
  var AL_REVES = [
    { n: 2, d: 'L/T²', c: 'la aceleración', f: [
      ['la velocidad', 'La velocidad es L/T: un solo T abajo.'],
      ['la fuerza', 'La fuerza lleva masa: M·L/T².'],
      ['el área', 'El área es L².']],
      p: ['L/T² es m/s².', 'Es <b>la aceleración</b>.'] },
    { n: 2, d: 'M/L³', c: 'la densidad', f: [
      ['el volumen', 'El volumen es L³, sin masa.'],
      ['la masa', 'La masa es sólo M.'],
      ['la presión', 'La presión es M/(L·T²).']],
      p: ['M/L³ es kg/m³: masa ÷ volumen.', 'Es <b>la densidad</b>.'] },
    { n: 3, d: 'M·L/T²', c: 'la fuerza', f: [
      ['la energía', 'La energía es M·L²/T²: una L más.'],
      ['la aceleración', 'La aceleración es L/T², sin masa.'],
      ['la potencia', 'La potencia es M·L²/T³.']],
      p: ['M·L/T² es kg·m/s².', 'Es <b>la fuerza</b>: masa × aceleración.'] },
    { n: 3, d: 'M·L²/T²', c: 'la energía', f: [
      ['la fuerza', 'La fuerza es M·L/T²: una L menos.'],
      ['la potencia', 'La potencia es M·L²/T³: una T más abajo.'],
      ['la presión', 'La presión es M/(L·T²).']],
      p: ['M·L²/T² es kg·m²/s², el joule.', 'Es <b>la energía</b>.'] }
  ];

  function genDimensiones(nivel) {
    var tipo = nivel === 1 ? 'directa' : azar(nivel === 2 ? ['directa', 'directa', 'reves'] : ['directa', 'exponentes', 'exponentes', 'reves']);
    if (tipo === 'exponentes') {
      var x = azar(CON_EXPONENTES);
      return armar('Con exponentes, ¿cuáles son las dimensiones ' + del(x.mag) + '?', x.c, x.f, { tema: 'Dimensiones', ask: 'Elige las dimensiones', pasos: x.p });
    }
    if (tipo === 'reves') {
      var r = azar(AL_REVES.filter(function (x) { return x.n <= nivel; }));
      return armar('¿Qué magnitud tiene dimensiones ' + r.d + '?', r.c, r.f, { tema: 'Dimensiones', ask: 'Elige la magnitud', pasos: r.p });
    }
    var d = delNivel(DIMENSIONES, nivel);
    return armar('¿Cuáles son las dimensiones ' + del(d.mag) + '?', d.c, d.f, {
      tema: 'Dimensiones', ask: 'Elige las dimensiones',
      pasos: ['Longitud L, masa M y tiempo T.'].concat(d.p)
    });
  }

  /* ---------- ¿Cuál fórmula puede ser correcta? ---------- */
  var d_ = v('d'), v_ = v('v'), t_ = v('t'), a_ = v('a'), m_ = v('m'), F_ = v('F'), E_ = v('E');
  var FORMULAS = [
    { n: 1, datos: d_ + ' es una distancia (m), ' + v_ + ' una velocidad (m/s) y ' + t_ + ' un tiempo (s)', c: d_ + ' = ' + v_ + '·' + t_, f: [
      [d_ + ' = ' + v_ + '/' + t_, 'v/t da (m/s) ÷ s = m/s²: una aceleración, no metros.'],
      [d_ + ' = ' + t_ + '/' + v_, 't/v da s ÷ (m/s) = s²/m: no son metros.'],
      [d_ + ' = ' + v_ + ' + ' + t_, 'No se pueden sumar m/s y s: son magnitudes distintas.'],
      [d_ + ' = ' + v_ + '·' + t_ + '²', 'v·t² da (m/s) × s² = m·s: le sobra una s.']],
      p: ['v·t da (m/s) × s = m: la s se cancela.', 'Es la única con metros: <b>d = v·t</b>.'] },
    { n: 1, datos: v_ + ' es una velocidad (m/s), ' + d_ + ' una distancia (m) y ' + t_ + ' un tiempo (s)', c: v_ + ' = ' + d_ + '/' + t_, f: [
      [v_ + ' = ' + d_ + '·' + t_, 'd·t da m·s; la velocidad va en m/s.'],
      [v_ + ' = ' + t_ + '/' + d_, 't/d da s/m: está al revés.'],
      [v_ + ' = ' + d_ + ' ' + MENOS + ' ' + t_, 'No se pueden restar m y s.'],
      [v_ + ' = ' + d_ + '/' + t_ + '²', 'd/t² da m/s²: una aceleración.']],
      p: ['d/t da m ÷ s = m/s.', 'Es la única con unidades de velocidad: <b>v = d/t</b>.'] },
    { n: 1, datos: v('ρ') + ' es una densidad (kg/m³), ' + m_ + ' una masa (kg) y ' + v('V') + ' un volumen (m³)', c: v('ρ') + ' = ' + m_ + '/' + v('V'), f: [
      [v('ρ') + ' = ' + m_ + '·' + v('V'), 'm·V da kg·m³: la densidad va en kg/m³.'],
      [v('ρ') + ' = ' + v('V') + '/' + m_, 'V/m da m³/kg: está al revés.'],
      [v('ρ') + ' = ' + m_ + ' + ' + v('V'), 'No se pueden sumar kg y m³.']],
      p: ['m/V da kg ÷ m³ = kg/m³.', 'Es la única con unidades de densidad: <b>ρ = m/V</b>.'] },
    { n: 1, datos: a_ + ' es una aceleración (m/s²), ' + v_ + ' una velocidad (m/s) y ' + t_ + ' un tiempo (s)', c: a_ + ' = ' + v_ + '/' + t_, f: [
      [a_ + ' = ' + v_ + '·' + t_, 'v·t da (m/s) × s = m: una distancia.'],
      [a_ + ' = ' + t_ + '/' + v_, 't/v da s²/m: está al revés.'],
      [a_ + ' = ' + v_ + '/' + t_ + '²', 'v/t² da m/s³: le sobra una s abajo.'],
      [a_ + ' = ' + v_ + ' ' + MENOS + ' ' + t_, 'No se pueden restar m/s y s.']],
      p: ['v/t da (m/s) ÷ s = m/s².', 'Es la única con unidades de aceleración: <b>a = v/t</b>.'] },

    { n: 2, datos: F_ + ' es una fuerza (N = kg·m/s²), ' + m_ + ' una masa (kg), ' + v_ + ' una velocidad (m/s) y ' + t_ + ' un tiempo (s)', c: F_ + ' = ' + m_ + '·' + v_ + '/' + t_, f: [
      [F_ + ' = ' + m_ + '·' + v_, 'm·v da kg·m/s: falta dividir otra vez entre s.'],
      [F_ + ' = ' + m_ + '·' + v_ + '·' + t_, 'm·v·t da kg·m: le faltan las s abajo.'],
      [F_ + ' = ' + m_ + '/(' + v_ + '·' + t_ + ')', 'm/(v·t) da kg/m: no es una fuerza.'],
      [F_ + ' = ' + m_ + '·' + t_ + '/' + v_, 'm·t/v da kg·s²/m: está al revés.']],
      p: ['m·v/t da kg × (m/s) ÷ s = kg·m/s².', 'Ésas son unidades de fuerza: <b>F = m·v/t</b>.'] },
    { n: 2, datos: E_ + ' es una energía (J = kg·m²/s²), ' + m_ + ' una masa (kg) y ' + v_ + ' una velocidad (m/s)', c: E_ + ' = ½·' + m_ + '·' + v_ + '²', f: [
      [E_ + ' = ½·' + m_ + '·' + v_, '½·m·v da kg·m/s: le falta el cuadrado de la velocidad.'],
      [E_ + ' = ' + m_ + '²·' + v_, 'm²·v da kg²·m/s: no es una energía.'],
      [E_ + ' = ' + m_ + '/' + v_ + '²', 'm/v² da kg·s²/m²: está al revés.'],
      [E_ + ' = ½·' + m_ + ' + ' + v_ + '²', 'No se pueden sumar kg y m²/s².']],
      p: ['El ½ no tiene unidad.', 'm·v² da kg × m²/s² = kg·m²/s² = J: <b>E = ½·m·v²</b>.'] },
    { n: 2, datos: v('x') + ' es una distancia (m), ' + a_ + ' una aceleración (m/s²) y ' + t_ + ' un tiempo (s)', c: v('x') + ' = ½·' + a_ + '·' + t_ + '²', f: [
      [v('x') + ' = ½·' + a_ + '·' + t_, '½·a·t da (m/s²) × s = m/s: le falta otra s para cancelar.'],
      [v('x') + ' = ' + a_ + '/' + t_ + '²', 'a/t² da m/s⁴: no son metros.'],
      [v('x') + ' = ½·' + a_ + '²·' + t_, 'a²·t da m²/s³: no son metros.']],
      p: ['El ½ no tiene unidad.', 'a·t² da (m/s²) × s² = m: <b>x = ½·a·t²</b>.'] },
    { n: 2, datos: t_ + ' es un tiempo (s), ' + d_ + ' una distancia (m) y ' + v_ + ' una velocidad (m/s)', c: t_ + ' = ' + d_ + '/' + v_, f: [
      [t_ + ' = ' + v_ + '/' + d_, 'v/d da 1/s: está al revés.'],
      [t_ + ' = ' + d_ + '·' + v_, 'd·v da m²/s: no es un tiempo.'],
      [t_ + ' = ' + d_ + ' ' + MENOS + ' ' + v_, 'No se pueden restar m y m/s.'],
      [t_ + ' = ' + d_ + '/' + v_ + '²', 'd/v² da s²/m: no es un tiempo.']],
      p: ['d/v da m ÷ (m/s) = s: los m se cancelan.', 'Es la única con segundos: <b>t = d/v</b>.'] },
    { n: 2, datos: v('P') + ' es una potencia (W = J/s), ' + E_ + ' una energía (J) y ' + t_ + ' un tiempo (s)', c: v('P') + ' = ' + E_ + '/' + t_, f: [
      [v('P') + ' = ' + E_ + '·' + t_, 'E·t da J·s: la potencia va en J/s.'],
      [v('P') + ' = ' + t_ + '/' + E_, 't/E da s/J: está al revés.'],
      [v('P') + ' = ' + E_ + ' + ' + t_, 'No se pueden sumar J y s.']],
      p: ['E/t da J ÷ s = W.', 'Es la única con watts: <b>P = E/t</b>.'] },
    { n: 2, datos: v('p') + ' es una presión (Pa = N/m²), ' + F_ + ' una fuerza (N) y ' + v('A') + ' un área (m²)', c: v('p') + ' = ' + F_ + '/' + v('A'), f: [
      [v('p') + ' = ' + F_ + '·' + v('A'), 'F·A da N·m²: la presión va en N/m².'],
      [v('p') + ' = ' + v('A') + '/' + F_, 'A/F da m²/N: está al revés.'],
      [v('p') + ' = ' + F_ + ' ' + MENOS + ' ' + v('A'), 'No se pueden restar N y m².']],
      p: ['F/A da N ÷ m² = N/m² = Pa.', 'Es la única con pascales: <b>p = F/A</b>.'] },
    { n: 2, datos: v_ + ' y ' + v('v') + '₀ son velocidades (m/s), ' + a_ + ' una aceleración (m/s²) y ' + t_ + ' un tiempo (s)', c: v_ + ' = ' + v('v') + '₀ + ' + a_ + '·' + t_, f: [
      [v_ + ' = ' + v('v') + '₀ + ' + a_, 'No se pueden sumar m/s y m/s²: a cada término le toca la misma unidad.'],
      [v_ + ' = ' + v('v') + '₀ + ' + a_ + '·' + t_ + '²', 'a·t² da m: no se puede sumar a m/s.'],
      [v_ + ' = ' + v('v') + '₀·' + a_ + '·' + t_, 'v₀·a·t da m²/s²: no es una velocidad.']],
      p: ['En una suma, cada término debe tener la misma unidad.', 'a·t da (m/s²) × s = m/s, como v₀: <b>v = v₀ + a·t</b>.'] },

    { n: 3, datos: v_ + ' es una velocidad (m/s), ' + a_ + ' una aceleración (m/s²) y ' + d_ + ' una distancia (m)', c: v_ + '² = 2·' + a_ + '·' + d_, f: [
      [v_ + ' = 2·' + a_ + '·' + d_, '2·a·d da m²/s², y v está en m/s: falta el cuadrado de v.'],
      [v_ + '² = 2·' + a_ + '/' + d_, 'a/d da 1/s², no m²/s².'],
      [v_ + '² = 2·' + a_ + '·' + d_ + '²', 'a·d² da m³/s²: no es una velocidad al cuadrado.']],
      p: ['v² da m²/s².', 'a·d da (m/s²) × m = m²/s², igual: <b>v² = 2·a·d</b>.'] },
    { n: 3, datos: v('T') + ' es el periodo de un péndulo (s), ' + v('L') + ' su largo (m) y ' + v('g') + ' la gravedad (m/s²)', c: v('T') + ' = 2π√(' + v('L') + '/' + v('g') + ')', f: [
      [v('T') + ' = 2π√(' + v('g') + '/' + v('L') + ')', 'g/L da 1/s², y su raíz, 1/s: está al revés.'],
      [v('T') + ' = 2π·' + v('L') + '/' + v('g'), 'L/g da s², no s: falta la raíz.'],
      [v('T') + ' = 2π√(' + v('L') + '·' + v('g') + ')', 'L·g da m²/s², y su raíz, m/s: una velocidad.']],
      p: ['El 2π no tiene unidad.', 'L/g da m ÷ (m/s²) = s², y √(s²) = s: <b>T = 2π√(L/g)</b>.'] },
    { n: 3, datos: F_ + ' es una fuerza (N = kg·m/s²), ' + m_ + ' una masa (kg), ' + v_ + ' una velocidad (m/s) y ' + v('r') + ' un radio (m)', c: F_ + ' = ' + m_ + '·' + v_ + '²/' + v('r'), f: [
      [F_ + ' = ' + m_ + '·' + v_ + '/' + v('r'), 'm·v/r da kg/s: falta el cuadrado de v.'],
      [F_ + ' = ' + m_ + '·' + v_ + '²·' + v('r'), 'm·v²·r da kg·m³/s²: se divide entre r.'],
      [F_ + ' = ' + m_ + '²·' + v_ + '/' + v('r'), 'm²·v/r da kg²/s: no es una fuerza.']],
      p: ['v²/r da (m²/s²) ÷ m = m/s².', 'm·v²/r da kg·m/s² = N: <b>F = m·v²/r</b>.'] },
    { n: 3, datos: E_ + ' es una energía (J = kg·m²/s²), ' + m_ + ' una masa (kg), ' + v('g') + ' la gravedad (m/s²) y ' + v('h') + ' una altura (m)', c: E_ + ' = ' + m_ + '·' + v('g') + '·' + v('h'), f: [
      [E_ + ' = ' + m_ + '·' + v('g') + '/' + v('h'), 'm·g/h da kg/s²: no es una energía.'],
      [E_ + ' = ' + m_ + '·' + v('h'), 'm·h da kg·m: falta la gravedad.'],
      [E_ + ' = ' + m_ + '·' + v('g') + '·' + v('h') + '²', 'm·g·h² da kg·m³/s²: le sobra una m.']],
      p: ['m·g·h da kg × m/s² × m.', 'Eso es kg·m²/s² = J: <b>E = m·g·h</b>.'] }
  ];

  function genFormula(nivel) {
    var o = delNivel(FORMULAS, nivel);
    return armar(mayuscula(o.datos) + '. ¿Cuál fórmula puede ser?', o.c, o.f, {
      tema: 'Fórmulas posibles', ask: 'Revisa las unidades', pasos: o.p
    });
  }

  /* ---------- Descartar por unidades ---------- */
  // Nivel 1: qué unidad le toca a lo que se busca.
  var BUSCA = [
    { mag: 'una velocidad', bien: ['m/s', 'km/h'], mal: [
      ['m', 'm es una distancia, no una velocidad.'], ['s', 's es un tiempo.'], ['kg', 'kg es una masa.'],
      ['m/s²', 'm/s² es una aceleración: lleva s² abajo.']] },
    { mag: 'una distancia', bien: ['m', 'km'], mal: [
      ['m/s', 'm/s es una velocidad.'], ['s', 's es un tiempo.'], ['m²', 'm² es un área.'], ['kg', 'kg es una masa.']] },
    { mag: 'un tiempo', bien: ['s', 'min', 'h'], mal: [
      ['m', 'm es una distancia.'], ['m/s', 'm/s es una velocidad.'], ['kg', 'kg es una masa.'], ['N', 'N es una fuerza.']] },
    { mag: 'una masa', bien: ['kg', 'g'], mal: [
      ['N', 'N es una fuerza, como el peso; la masa va en kg.'], ['m', 'm es una distancia.'],
      ['m³', 'm³ es un volumen.'], ['J', 'J es una energía.']] },
    { mag: 'una aceleración', bien: ['m/s²'], mal: [
      ['m/s', 'm/s es una velocidad: le falta otra s abajo.'], ['m', 'm es una distancia.'],
      ['N', 'N es una fuerza.'], ['s²', 's² es un tiempo al cuadrado.']] },
    { mag: 'una fuerza', bien: ['N'], mal: [
      ['kg', 'kg es una masa; la fuerza va en N.'], ['J', 'J es una energía.'],
      ['m/s²', 'm/s² es una aceleración.'], ['W', 'W es una potencia.']] },
    { mag: 'una energía', bien: ['J'], mal: [
      ['N', 'N es una fuerza.'], ['W', 'W es una potencia: energía en cada segundo.'],
      ['kg', 'kg es una masa.'], ['m/s', 'm/s es una velocidad.']] },
    { mag: 'un volumen', bien: ['m³', 'L'], mal: [
      ['m²', 'm² es un área.'], ['m', 'm es una distancia.'], ['kg', 'kg es una masa.'], ['kg/m³', 'kg/m³ es una densidad.']] }
  ];

  function genBusca() {
    var b = azar(BUSCA);
    var n = num(azar([3, 6, 8, 12, 15, 20, 25, 40, 50, 120]));
    var u = azar(b.bien);
    return armar('Buscas ' + b.mag + '. ¿Cuál opción puede ser?', n + ' ' + u,
      b.mal.map(function (x) { return [n + ' ' + x[0], x[1]]; }), {
        tema: 'Descartar por unidades', ask: 'Sin hacer cuentas',
        pasos: [mayuscula(b.mag) + ' va en ' + b.bien.join(' o ') + '.', 'Las otras unidades son de otras magnitudes: se descartan.', 'Puede ser <b>' + n + ' ' + u + '</b>.']
      });
  }

  function mayuscula(frase) { return frase.charAt(0).toUpperCase() + frase.slice(1); }
  // «de» + «el área» = «del área».
  function del(frase) { return frase.replace(/^el /, 'del ').replace(/^la /, 'de la '); }

  // Nivel 2: un problema; cada respuesta equivocada sale de una operación equivocada, y su unidad la delata.
  var PROBLEMAS = [
    function () {
      var x = azar([[120, 2], [150, 2], [180, 3], [210, 3], [240, 3], [300, 4]]);
      var d = x[0], t = x[1], r = d / t;
      return { e: 'Un autobús recorre ' + d + ' km en ' + t + ' h. ¿Cuál es su rapidez?', c: num(r) + ' km/h', f: [
        [num(d * t) + ' km·h', 'Multiplicaste: km × h no es una rapidez; la rapidez es distancia ÷ tiempo.'],
        [num(d + t) + ' km', 'Sumaste ' + d + ' km + ' + t + ' h: no se pueden sumar una distancia y un tiempo.'],
        [num(r) + ' h/km', 'h/km está al revés: la rapidez es km ÷ h.'],
        [d + ' km', 'Ésa es la distancia; la rapidez sale al dividir entre el tiempo.']],
        p: ['Rapidez = distancia ÷ tiempo: km ÷ h = km/h.', d + ' ÷ ' + t + ' = <b>' + num(r) + ' km/h</b>.'] };
    },
    function () {
      var x = azar([[300, 60], [240, 80], [360, 90], [200, 50], [450, 90]]);
      var d = x[0], r = x[1], t = d / r;
      return { e: 'Un tren recorre ' + d + ' km a ' + r + ' km/h. ¿Cuánto tarda?', c: num(t) + ' h', f: [
        [num(d * r) + ' km²/h', 'Multiplicaste: km × km/h da km²/h, que no es un tiempo.'],
        [num(d - r) + ' km', 'Restaste ' + d + ' km ' + MENOS + ' ' + r + ' km/h: no se pueden restar unidades distintas.'],
        [num(t) + ' km/h', 'km ÷ (km/h): los km se cancelan y queda h; un tiempo no va en km/h.'],
        [num(t) + ' km', 'Los km se cancelan: queda un tiempo, en h.']],
        p: ['Tiempo = distancia ÷ rapidez.', 'km ÷ (km/h) = h: los km se cancelan.', d + ' ÷ ' + r + ' = <b>' + num(t) + ' h</b>.'] };
    },
    function () {
      var x = azar([[5, 4, 'Un ciclista'], [6, 3, 'Un ciclista'], [8, 5, 'Un ciclista'], [15, 6, 'Un auto'], [20, 8, 'Un auto'], [25, 10, 'Un auto']]);
      var r = x[0], t = x[1], d = r * t;
      return { e: x[2] + ' va a ' + r + ' m/s durante ' + t + ' s. ¿Qué distancia recorre?', c: num(d) + ' m', f: [
        [num(r / t) + ' m/s²', 'Dividiste: (m/s) ÷ s = m/s², una aceleración.'],
        [num(d) + ' m/s', 'No cancelaste: (m/s) × s = m; la s se va.'],
        [num(t / r) + ' s²/m', 'Dividiste al revés: s ÷ (m/s) = s²/m, que no es una distancia.']],
        p: ['Distancia = velocidad × tiempo.', '(m/s) × s = m: la s se cancela.', r + ' × ' + t + ' = <b>' + num(d) + ' m</b>.'] };
    },
    function () {
      var x = azar([[20, 4], [12, 3], [16, 4], [25, 5], [30, 6], [24, 6]]);
      var dv = x[0], t = x[1], a = dv / t;
      return { e: 'Un auto pasa de 0 a ' + dv + ' m/s en ' + t + ' s. ¿Cuál es su aceleración?', c: num(a) + ' m/s²', f: [
        [num(dv * t) + ' m', 'Multiplicaste: (m/s) × s = m, una distancia.'],
        [num(a) + ' m/s', 'Faltó dividir también la unidad: (m/s) ÷ s = m/s².'],
        [num(t / dv) + ' s²/m', 'Está al revés: s ÷ (m/s) = s²/m.']],
        p: ['Aceleración = cambio de velocidad ÷ tiempo.', '(m/s) ÷ s = m/s².', dv + ' ÷ ' + t + ' = <b>' + num(a) + ' m/s²</b>.'] };
    },
    function () {
      var x = azar([[6, 3], [8, 2], [5, 4], [12, 3], [50, 2]]);
      var m = x[0], a = x[1], f = m * a;
      return { e: 'Se empuja un carrito de ' + m + ' kg con una aceleración de ' + a + ' m/s². ¿Qué fuerza se aplica?', c: num(f) + ' N', f: [
        [num(m / a) + ' kg·s²/m', 'Dividiste: kg ÷ (m/s²) = kg·s²/m, que no es una fuerza.'],
        [num(f) + ' J', 'El joule es de energía; la fuerza va en N = kg·m/s².'],
        [num(f) + ' kg', 'La aceleración también tiene unidad: kg × m/s² = N.']],
        p: ['Fuerza = masa × aceleración.', 'kg × m/s² = kg·m/s², el newton.', m + ' × ' + a + ' = <b>' + num(f) + ' N</b>.'] };
    },
    function () {
      var x = azar([[1200, 2, 'Un bloque de madera'], [3000, 3, 'El agua de un tinaco'], [48, 0.2, 'Un bloque de corcho']]);
      var m = x[0], V = x[1], rho = m / V;
      return { e: x[2] + ' tiene una masa de ' + num(m) + ' kg y ocupa ' + num(V) + ' m³. ¿Cuál es su densidad?', c: num(rho) + ' kg/m³', f: [
        [num(m * V) + ' kg·m³', 'Multiplicaste: kg × m³ no es una densidad; se divide entre el volumen.'],
        [num(rho) + ' m³/kg', 'Está al revés: la masa va arriba, kg/m³.'],
        [num(m + V) + ' kg', 'Sumaste kg y m³: no se pueden sumar.']],
        p: ['Densidad = masa ÷ volumen: kg/m³.', num(m) + ' ÷ ' + num(V) + ' = <b>' + num(rho) + ' kg/m³</b>.'] };
    },
    function () {
      var x = azar([[50, 4], [30, 6], [80, 5], [120, 3]]);
      var fu = x[0], d = x[1], w = fu * d;
      return { e: 'Una fuerza de ' + fu + ' N empuja una caja ' + d + ' m. ¿Qué trabajo hace?', c: num(w) + ' J', f: [
        [num(fu / d) + ' N/m', 'Dividiste: N ÷ m no es una energía; el trabajo es fuerza × distancia.'],
        [num(w) + ' W', 'El watt es de potencia; el trabajo va en J = N·m.'],
        [num(fu + d) + ' N', 'Sumaste N y m: no se pueden sumar.'],
        [num(w) + ' N', 'La m no se cancela: N × m = N·m, el joule.']],
        p: ['Trabajo = fuerza × distancia.', 'N × m = N·m, el joule.', fu + ' × ' + d + ' = <b>' + num(w) + ' J</b>.'] };
    },
    function () {
      var x = azar([[1200, 60], [900, 30], [3000, 60], [600, 20]]);
      var e = x[0], t = x[1], pot = e / t;
      return { e: 'Un motor hace un trabajo de ' + num(e) + ' J en ' + t + ' s. ¿Cuál es su potencia?', c: num(pot) + ' W', f: [
        [num(e * t) + ' J·s', 'Multiplicaste: J × s no es una potencia; es J ÷ s.'],
        [num(pot) + ' J', 'Faltó dividir también la unidad: J ÷ s = W.'],
        [num(e + t) + ' J', 'Sumaste J y s: no se pueden sumar.'],
        [num(pot) + ' N', 'El newton es de fuerza.']],
        p: ['Potencia = energía ÷ tiempo.', 'J ÷ s = W, el watt.', num(e) + ' ÷ ' + t + ' = <b>' + num(pot) + ' W</b>.'] };
    }
  ];

  // Nivel 3: problemas con un cuadrado o sin convertir, y «¿cuál se descarta?».
  var PROBLEMAS_3 = [
    function () {
      var x = azar([[2, 3], [4, 5], [6, 2], [10, 4]]);
      var m = x[0], r = x[1], e = m * r * r / 2;
      return { e: 'Una pelota de ' + m + ' kg va a ' + r + ' m/s. ¿Cuál es su energía cinética, ½mv²?', c: num(e) + ' J', f: [
        [num(m * r / 2) + ' kg·m/s', 'Faltó elevar v al cuadrado: ½ × kg × m/s da kg·m/s, que no es una energía.'],
        [num(e) + ' kg·m/s²', '(m/s)² = m²/s²: elevaste sólo la s; la m también va al cuadrado.'],
        [num(e) + ' N', 'El newton es de fuerza; la energía va en J = kg·m²/s².']],
        p: ['Unidad: kg × (m/s)² = kg·m²/s² = J.', '½ × ' + m + ' × ' + r + '² = <b>' + num(e) + ' J</b>.'] };
    },
    function () {
      // Pares con decimales que terminan: los minutos pasan a 0.25 h o 0.5 h.
      var x = azar([[60, 15], [60, 30], [90, 15], [90, 30], [120, 15], [120, 30]]);
      var r = x[0], t = x[1], d = r * t / 60;
      return { ask: 'Cuida las unidades', e: 'Un auto va a ' + r + ' km/h durante ' + t + ' min. ¿Cuánto avanza?', c: num(d) + ' km', f: [
        [num(r * t) + ' km', 'Multiplicaste ' + r + ' × ' + t + ' sin convertir: h y min no se cancelan. Primero, ' + t + ' min = ' + num(t / 60) + ' h.'],
        [num(r / t) + ' km/(h·min)', 'Dividiste: (km/h) ÷ min no es una distancia.'],
        [num(d) + ' km/h', 'Al multiplicar por h, la h se cancela: queda km.']],
        p: ['km/h × min no se cancela: primero convierte, ' + t + ' min = ' + num(t / 60) + ' h.', r + ' km/h × ' + num(t / 60) + ' h = <b>' + num(d) + ' km</b>.'] };
    }
  ];

  var DESCARTA = [
    { pide: 'la fuerza que empuja una caja', mag: 'fuerza', unidades: 'N = kg·m/s²', bien: [
      ['N', 'N es la unidad de fuerza'], ['kg·m/s²', 'kg·m/s² es el newton'], ['J/m', 'J/m = N·m ÷ m = N']], mal: [
      ['J', 'J es una energía, no una fuerza.'], ['kg·m/s', 'kg·m/s no es una fuerza: le falta otra s abajo.'], ['W', 'W es una potencia.']] },
    { pide: 'la energía que gana un resorte', mag: 'energía', unidades: 'J = N·m = kg·m²/s²', bien: [
      ['J', 'J es la unidad de energía'], ['N·m', 'N·m es el joule'], ['kg·m²/s²', 'kg·m²/s² es el joule']], mal: [
      ['N', 'N es una fuerza, no una energía.'], ['W', 'W es una potencia: J ÷ s.'], ['kg·m/s²', 'kg·m/s² es el newton, una fuerza.']] },
    { pide: 'la aceleración de un carrito', mag: 'aceleración', unidades: 'm/s² (o cm/s²)', bien: [
      ['m/s²', 'm/s² es la unidad de aceleración'], ['cm/s²', 'cm/s² también es una aceleración']], mal: [
      ['m/s', 'm/s es una velocidad: le falta otra s abajo.'], ['N', 'N es una fuerza.'], ['m·s²', 'm·s² no es una aceleración: el s² va abajo.']] },
    { pide: 'la potencia de un foco', mag: 'potencia', unidades: 'W = J/s', bien: [
      ['W', 'W es la unidad de potencia'], ['J/s', 'J/s es el watt'], ['N·m/s', 'N·m/s = J/s = W']], mal: [
      ['J', 'J es una energía; la potencia es J ÷ s.'], ['J·s', 'J·s no es una potencia: se divide entre s.'], ['N', 'N es una fuerza.']] },
    { pide: 'la velocidad de un tren', mag: 'velocidad', unidades: 'm/s o km/h', bien: [
      ['m/s', 'm/s es una velocidad'], ['km/h', 'km/h también es una velocidad'], ['cm/s', 'cm/s también es una velocidad']], mal: [
      ['m/s²', 'm/s² es una aceleración.'], ['km·h', 'km·h no es una velocidad: la h va abajo.'], ['h/km', 'h/km está al revés.']] },
    { pide: 'la presión del aire en una llanta', mag: 'presión', unidades: 'Pa = N/m²', bien: [
      ['Pa', 'Pa es la unidad de presión'], ['N/m²', 'N/m² es el pascal']], mal: [
      ['N', 'N es una fuerza; la presión es N ÷ m².'], ['N·m²', 'N·m² no es una presión: se divide entre m².'], ['J', 'J es una energía.']] }
  ];

  function genDescartaCual() {
    var x = azar(DESCARTA);
    var numeros = F.barajar([12, 18, 20, 24, 30, 40, 45, 60]).slice(0, 4);
    var malo = azar(x.mal);
    var buenas = [0, 1, 2].map(function (k) { return x.bien[k % x.bien.length]; });
    var correcta = num(numeros[3]) + ' ' + malo[0];
    return armar('Un problema pide ' + x.pide + '. ¿Cuál respuesta se descarta sin hacer cuentas?', correcta,
      buenas.map(function (b, k) {
        return [num(numeros[k]) + ' ' + b[0], 'Ésa no se descarta: ' + b[1] + '. Para saber si es la respuesta hay que hacer la cuenta.'];
      }), {
        tema: 'Descartar por unidades', ask: 'Sin hacer cuentas',
        pasos: ['La ' + x.mag + ' va en ' + x.unidades + '.', malo[1] + ' Se descarta: <b>' + correcta + '</b>.']
      });
  }

  function genDescarta(nivel) {
    if (nivel === 1) return genBusca();
    var p;
    if (nivel === 2) p = Math.random() < 0.2 ? null : azar(PROBLEMAS)();
    else {
      var tipo = azar(['cual', 'cual', 'problema3', 'problema']);
      if (tipo === 'cual') return genDescartaCual();
      p = (tipo === 'problema3' ? azar(PROBLEMAS_3) : azar(PROBLEMAS))();
    }
    if (!p) return genBusca();
    return armar(p.e, p.c, p.f, {
      tema: 'Descartar por unidades', ask: p.ask || 'Fíjate en la unidad', pasos: p.p
    });
  }

  M.GENERADORES['ad-operacion'] = genOperacion;
  M.GENERADORES['ad-fundamentales'] = genFundamentales;
  M.GENERADORES['ad-dimensiones'] = genDimensiones;
  M.GENERADORES['ad-formula'] = genFormula;
  M.GENERADORES['ad-descarta'] = genDescarta;
})();
