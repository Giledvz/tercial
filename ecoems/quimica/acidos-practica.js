(function () {
  'use strict';

  /* Práctica de Ácidos, bases y neutralización: pH, las tres teorías, el
     tornasol, fuerza y productos de una neutralización. Las opciones se
     muestran en el orden de cada arreglo; la correcta va marcada con *. */
  var list = document.querySelector('[data-acidos-practica]');
  if (!list || !window.TercialPractica) return;

  var ITEMS = [
    ['aci-01', 'Una disolución tiene pH 3. Es…', ['*ácida', 'neutra', 'básica'],
      '¿El 3 está antes o después del 7?',
      'Abajo de 7 es ácida: tiene más iones H⁺ que OH⁻.'],
    ['aci-02', 'Una disolución tiene pH 11. Es…', ['ácida', 'neutra', '*básica'],
      '¿El 11 está antes o después del 7?',
      'Arriba de 7 es básica: tiene más iones OH⁻ que H⁺.'],
    ['aci-03', 'Según Arrhenius, una base es una sustancia que en agua…', ['libera iones H⁺', '*libera iones OH⁻', 'acepta un par de electrones'],
      'Arrhenius habla de los iones que aparecen en el agua.',
      'Para Arrhenius, una base libera iones hidróxido, OH⁻, como el NaOH; un ácido libera H⁺.'],
    ['aci-04', 'Según Brønsted y Lowry, un ácido…', ['*dona protones (H⁺)', 'acepta protones (H⁺)', 'dona un par de electrones'],
      'Esta teoría habla de protones que pasan de una sustancia a otra.',
      'El ácido de Brønsted-Lowry dona un protón (H⁺) y la base lo acepta.'],
    ['aci-05', 'Según Lewis, una base…', ['acepta un par de electrones', 'libera iones H⁺', '*dona un par de electrones'],
      'Lewis habla de pares de electrones para formar un enlace.',
      'La base de Lewis dona un par de electrones y el ácido lo acepta para formar un enlace covalente.'],
    ['aci-06', 'Una tira de papel tornasol azul se puso roja. La disolución es…', ['*ácida', 'neutra', 'básica'],
      '¿Quién cambia el tornasol de azul a rojo?',
      'Los ácidos cambian el tornasol azul a rojo; las bases, el rojo a azul.'],
    ['aci-07', '¿Cuál es más ácida?', ['una de pH 5', '*una de pH 2', 'las dos igual'],
      'Mientras más bajo el pH, ¿más o menos ácida?',
      'Más bajo es más ácido. Cada unidad de pH es diez veces más H⁺: la de pH 2 tiene mil veces más que la de pH 5.'],
    ['aci-08', 'HCl + KOH → ¿qué productos se forman?', ['KH + ClOH', '*KCl + H₂O', 'K₂O + HCl'],
      'Ácido + base → sal + agua. ¿Con quién se junta el H⁺ del ácido?',
      'El H⁺ del ácido y el OH⁻ de la base forman agua; el K⁺ y el Cl⁻ forman la sal, cloruro de potasio.'],
    ['aci-09', 'Un ácido fuerte, como el HCl, en agua…', ['*se ioniza por completo', 'se ioniza sólo en parte', 'no se ioniza'],
      'Fuerte y débil se refieren a cuánto se separa en iones.',
      'Un ácido fuerte se ioniza por completo; uno débil, como el acético del vinagre, sólo en parte.'],
    ['aci-10', 'La leche de magnesia, Mg(OH)<sub>2</sub>, alivia la acidez estomacal porque…', ['es un ácido más fuerte', 'diluye el jugo gástrico', '*neutraliza el exceso de ácido'],
      'El Mg(OH)₂ es una base. ¿Qué hace una base con un ácido?',
      'Es una base: neutraliza parte del ácido clorhídrico del estómago y forma sal y agua.']
  ];

  var answers = {};
  var feedback = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  ITEMS.forEach(function (item, i) {
    var id = item[0];
    var correcta = '';
    var opciones = item[2].map(function (o) {
      if (o.charAt(0) === '*') { correcta = o.slice(1); return correcta; }
      return o;
    });
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + item[1] + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + id + '">Tu respuesta</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option>' +
      opciones.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div>';
    list.appendChild(details);
    answers[id] = [correcta];
    feedback[id] = [item[3], item[4]];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:acidos-bases:practica:v1',
    nombres: ['pregunta', 'preguntas'],
    genero: 'f',
    respuestas: answers,
    retro: function (id) {
      return { pista: feedback[id][0], porque: feedback[id][1] };
    }
  });
})();
