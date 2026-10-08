(function () {
  'use strict';

  /* Práctica de Tendencias periódicas: diez comparaciones que se resuelven
     sólo con la posición en la tabla. Cada par está en el mismo periodo, en el
     mismo grupo o en una esquina donde las dos tendencias coinciden, así que la
     respuesta no depende de valores medidos (y coincide con ellos). */
  var list = document.querySelector('[data-tendencias-practica]');
  if (!list || !window.TercialPractica) return;

  // [id, propiedad, A, B, correcta, pista, por qué]
  var ITEMS = [
    ['ten-01', 'mayor radio atómico', 'Sodio (Na)', 'Cloro (Cl)', 'Sodio (Na)',
      'Los dos están en el periodo 3. ¿Hacia dónde se encoge el átomo?',
      'En el periodo, el radio disminuye hacia la derecha: el cloro tiene 6 protones más jalando el mismo nivel. El sodio es más grande.'],
    ['ten-02', 'mayor radio atómico', 'Litio (Li)', 'Cesio (Cs)', 'Cesio (Cs)',
      'Los dos están en el grupo IA. ¿Cuál tiene más niveles?',
      'Hacia abajo se agregan niveles: el cesio tiene 6 y el litio 2. El cesio es mucho más grande.'],
    ['ten-03', 'mayor electronegatividad', 'Flúor (F)', 'Yodo (I)', 'Flúor (F)',
      'Los dos son halógenos. ¿Cuál tiene su último nivel más cerca del núcleo?',
      'La electronegatividad aumenta hacia arriba: el flúor es el más electronegativo de toda la tabla.'],
    ['ten-04', 'mayor electronegatividad', 'Magnesio (Mg)', 'Azufre (S)', 'Azufre (S)',
      'Los dos están en el periodo 3. ¿Hacia dónde aumenta la atracción por los electrones?',
      'En el periodo, la electronegatividad aumenta hacia la derecha: el azufre atrae más que el magnesio.'],
    ['ten-05', 'mayor energía de ionización', 'Potasio (K)', 'Kriptón (Kr)', 'Kriptón (Kr)',
      '¿A cuál le cuesta más soltar un electrón: a un metal alcalino o a un gas noble?',
      'La energía de ionización aumenta hacia la derecha: el kriptón tiene su nivel lleno y cuesta mucho arrancarle un electrón.'],
    ['ten-06', 'mayor energía de ionización', 'Berilio (Be)', 'Bario (Ba)', 'Berilio (Be)',
      'Los dos están en el grupo IIA. ¿Cuál tiene sus electrones externos más cerca del núcleo?',
      'Hacia arriba, el electrón está más cerca del núcleo y cuesta más arrancarlo: el berilio necesita más energía.'],
    ['ten-07', 'mayor carácter metálico', 'Sodio (Na)', 'Aluminio (Al)', 'Sodio (Na)',
      '¿Cuál pierde electrones con más facilidad: el que está más a la izquierda o más a la derecha?',
      'El carácter metálico aumenta hacia la izquierda: el sodio pierde su electrón más fácil que el aluminio.'],
    ['ten-08', 'mayor carácter metálico', 'Calcio (Ca)', 'Bario (Ba)', 'Bario (Ba)',
      'Los dos están en el grupo IIA. ¿Cuál tiene más niveles?',
      'Hacia abajo, el electrón externo queda más lejos y se pierde más fácil: el bario es más metálico.'],
    ['ten-09', 'mayor afinidad electrónica', 'Litio (Li)', 'Flúor (F)', 'Flúor (F)',
      'Los dos están en el periodo 2. ¿Cuál «quiere» ganar un electrón para completar su octeto?',
      'Al flúor le falta un electrón para el octeto: al ganarlo libera mucha energía. La afinidad aumenta hacia la derecha.'],
    ['ten-10', 'mayor radio atómico', 'Oxígeno (O)', 'Azufre (S)', 'Azufre (S)',
      'Los dos están en el grupo VIA. ¿Cuál tiene un nivel más?',
      'El azufre está debajo del oxígeno: tiene un nivel más y es más grande.']
  ];

  var answers = {};
  var feedback = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  ITEMS.forEach(function (item, i) {
    var id = item[0];
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">¿Cuál tiene ' + item[1] + ': ' + item[2] + ' o ' + item[3] + '?</p></div>' +
      chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + id + '">Tu respuesta</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option><option>' + item[2] + '</option><option>' + item[3] + '</option></select></div>';
    list.appendChild(details);
    answers[id] = [item[4]];
    feedback[id] = [item[5], item[6]];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:tendencias-periodicas:practica:v1',
    nombres: ['comparación', 'comparaciones'],
    genero: 'f',
    respuestas: answers,
    retro: function (id) {
      return { pista: feedback[id][0], porque: feedback[id][1] };
    }
  });
})();
