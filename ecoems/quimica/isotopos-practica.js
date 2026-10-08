(function () {
  'use strict';

  /* Práctica de Isótopos, iones y alótropos: siete pares para clasificar y
     tres cálculos de neutrones. «Elementos distintos» revisa la idea central:
     si cambian los protones, ya no es el mismo elemento. */
  var choices = document.querySelector('[data-isotopos-choices]');
  var numbers = document.querySelector('[data-isotopos-numbers]');
  if (!choices || !numbers || !window.TercialPractica) return;

  var OPTIONS = ['Isótopos', 'Iones', 'Alótropos', 'Elementos distintos'];
  var PAIRS = [
    ['iso-01', '<sup>1</sup>H y <sup>2</sup>H (protio y deuterio)', 'Isótopos',
      'Compara protones y neutrones: ¿qué cambia del <sup>1</sup>H al <sup>2</sup>H?',
      'Los dos tienen 1 protón; el deuterio tiene un neutrón más. Son isótopos del hidrógeno.'],
    ['iso-02', 'O<sub>2</sub> y O<sub>3</sub>', 'Alótropos',
      'Los dos están hechos sólo de oxígeno. ¿Qué cambia: los neutrones, los electrones o cómo se unen los átomos?',
      'Son moléculas de oxígeno con distinto número de átomos unidos: alótropos.'],
    ['iso-03', 'Na y Na<sup>+</sup>', 'Iones',
      'El signo + indica una carga. ¿Qué partícula se perdió?',
      'Na<sup>+</sup> perdió un electrón: es un ion (catión) del sodio.'],
    ['iso-04', '<sup>14</sup>C y <sup>14</sup>N', 'Elementos distintos',
      'Busca el número atómico de cada uno: ¿tienen los mismos protones?',
      'El carbono tiene 6 protones y el nitrógeno 7: son elementos distintos, aunque los dos tengan A = 14.'],
    ['iso-05', 'Grafito y diamante', 'Alótropos',
      'Los dos son carbono puro y sólido. ¿Qué es distinto entre ellos?',
      'Son carbono con los átomos acomodados de otra forma: alótropos.'],
    ['iso-06', '<sup>35</sup>Cl y <sup>37</sup>Cl', 'Isótopos',
      'Los dos son cloro (Z = 17). ¿Qué indica el número de arriba?',
      'Tienen 17 protones y distinto número de masa: 18 y 20 neutrones. Son isótopos.'],
    ['iso-07', 'Fe<sup>2+</sup> y Fe<sup>3+</sup>', 'Iones',
      'Los dos son hierro con carga. ¿Qué partícula tienen en distinta cantidad?',
      'Fe<sup>2+</sup> perdió 2 electrones y Fe<sup>3+</sup> perdió 3: son iones del hierro.']
  ];
  var NUMBERS = [
    ['iso-08', '<sup>37</sup><sub>17</sub>Cl', 20, 'n⁰ = A − Z.', '37 − 17 = 20 neutrones.'],
    ['iso-09', 'Tritio, <sup>3</sup>H', 2, 'El tritio es hidrógeno con A = 3. Resta los protones.', '3 − 1 = 2 neutrones.'],
    ['iso-10', 'Uranio-235, <sup>235</sup><sub>92</sub>U', 143, 'n⁰ = A − Z: el número de arriba menos el número atómico.',
      '235 − 92 = 143 neutrones. Es el uranio que se usa en las plantas nucleares.']
  ];

  var answers = {};
  var feedback = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function exercise(id, number, statement, response) {
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + number + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + statement + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response">' + response + '</div>';
    return details;
  }

  // El texto de la retroalimentación puede llevar superíndices: se arma como nodo.
  function rich(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    return span;
  }

  PAIRS.forEach(function (pair, i) {
    var id = pair[0];
    var select = '<label class="exercise__response-label" for="' + id + '">Tu respuesta</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option>' +
      OPTIONS.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
    choices.appendChild(exercise(id, String(i + 1).padStart(2, '0'), pair[1], select));
    answers[id] = [pair[2]];
    feedback[id] = [pair[3], pair[4]];
  });

  NUMBERS.forEach(function (item, i) {
    var id = item[0];
    var input = '<label class="exercise__response-label" for="' + id + '">Neutrones</label>' +
      '<input class="input exercise__input" id="' + id + '" name="' + id + '" type="text" inputmode="numeric" ' +
      'pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="?" data-response>';
    numbers.appendChild(exercise(id, String(PAIRS.length + i + 1).padStart(2, '0'), item[1], input));
    answers[id] = (function (expected) {
      return function (value) { return /^\s*\d+\s*$/.test(value) && Number(value) === expected; };
    })(item[2]);
    feedback[id] = [item[3], item[4]];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:isotopos:practica:v1',
    respuestas: answers,
    retro: function (id) {
      return { pista: rich(feedback[id][0]), porque: rich(feedback[id][1]) };
    }
  });
})();
