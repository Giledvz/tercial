(function () {
  'use strict';

  /* Práctica de Metales, no metales y metaloides: cinco elementos para
     clasificar por su lugar en la tabla y cinco propiedades. Incluye las
     trampas que más se preguntan: el hidrógeno (grupo IA, pero no es metal),
     el mercurio (metal líquido) y el bromo (no metal líquido). */
  var elements = document.querySelector('[data-metales-elementos]');
  var properties = document.querySelector('[data-metales-propiedades]');
  if (!elements || !properties || !window.TercialPractica) return;

  var OPTIONS = ['Metal', 'Metaloide', 'No metal'];
  var ELEMENTS = [
    ['met-01', 'Silicio (Si) · grupo IVA, periodo 3', 'Metaloide',
      'Búscalo en la tabla: ¿está lejos de la escalera o pegado a ella?',
      'El silicio está junto a la escalera: es un metaloide. Brilla como un metal, pero es quebradizo y conduce poco; por eso se usa en los chips.'],
    ['met-02', 'Mercurio (Hg) · líquido a temperatura ambiente', 'Metal',
      'Que sea líquido no decide nada. Búscalo en la tabla: grupo 12, periodo 6.',
      'Está entre los metales de transición: es un metal, el único líquido a temperatura ambiente.'],
    ['met-03', 'Hidrógeno (H) · grupo IA', 'No metal',
      'Está arriba del litio y del sodio, pero ¿es un sólido brillante o un gas?',
      'Es un gas no metálico. Va en el grupo IA porque tiene 1 electrón de valencia, como los metales alcalinos, pero no es uno de ellos.'],
    ['met-04', 'Bromo (Br) · un líquido rojizo', 'No metal',
      'Búscalo en el grupo VIIA: ¿de qué lado de la escalera queda?',
      'Es un halógeno, a la derecha de la escalera: un no metal. Es el único no metal líquido a temperatura ambiente.'],
    ['met-05', 'Calcio (Ca) · grupo IIA', 'Metal',
      'Los grupos IA y IIA están en la orilla izquierda de la tabla. ¿Qué hay de ese lado?',
      'Es un metal alcalinotérreo. Al reaccionar pierde 2 electrones y forma el ion Ca<sup>2+</sup>.']
  ];
  var PROPERTIES = [
    ['met-06', 'Se puede estirar en hilos y conduce la electricidad.', 'Metal',
      'Piensa en los cables de tu casa: ¿de qué están hechos?',
      'Ser dúctil y buen conductor es propio de los metales; por eso los cables son de cobre.'],
    ['met-07', 'Al reaccionar gana electrones y forma un anión.', 'No metal',
      '¿Quién suele perder electrones y quién ganarlos?',
      'Los no metales ganan electrones y forman aniones, como Cl<sup>−</sup> u O<sup>2−</sup>.'],
    ['met-08', 'Su óxido, al mezclarse con agua, forma un hidróxido.', 'Metal',
      'Un hidróxido es una base. ¿Qué tipo de óxido forma una base con agua?',
      'Los metales forman óxidos básicos, y éstos, con agua, forman hidróxidos: MgO + H<sub>2</sub>O → Mg(OH)<sub>2</sub>.'],
    ['met-09', 'Conduce la electricidad sólo un poco; por eso se usa en los chips.', 'Metaloide',
      'No conduce tan bien como un metal, pero tampoco es un aislante. ¿Quién queda en medio?',
      'Los metaloides, como el silicio y el germanio, son semiconductores.'],
    ['met-10', 'Es opaco, se rompe al golpearlo y no conduce el calor.', 'No metal',
      'Opaco, quebradizo y aislante: ¿se parece más al cobre o al azufre?',
      'Así son los no metales sólidos, como el azufre o el fósforo.']
  ];

  var answers = {};
  var feedback = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function exercise(id, number, statement) {
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + number + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + statement + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + id + '">Tu respuesta</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option>' +
      OPTIONS.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div>';
    return details;
  }

  // La retroalimentación puede llevar superíndices: se arma como nodo.
  function rich(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    return span;
  }

  ELEMENTS.concat(PROPERTIES).forEach(function (item, i) {
    var parent = i < ELEMENTS.length ? elements : properties;
    parent.appendChild(exercise(item[0], String(i + 1).padStart(2, '0'), item[1]));
    answers[item[0]] = [item[2]];
    feedback[item[0]] = [item[3], item[4]];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:metales-no-metales:practica:v1',
    respuestas: answers,
    retro: function (id) {
      return { pista: rich(feedback[id][0]), porque: rich(feedback[id][1]) };
    }
  });
})();
