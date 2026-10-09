(function () {
  'use strict';

  /* Práctica de Reacciones de combustión: productos, completa o incompleta,
     el triángulo del fuego y coeficientes de combustiones sencillas. */
  var list = document.querySelector('[data-combustion-practica]');
  if (!list || !window.TercialPractica) return;

  var ITEMS = [
    ['com-01', '¿Qué productos da la combustión completa de un hidrocarburo?', ['CO + H₂', '*CO₂ + H₂O', 'C + H₂O'],
      'Completa significa que el oxígeno alcanzó para todo el carbono.',
      'Con oxígeno suficiente, todo el carbono termina como CO₂ y todo el hidrógeno como agua.'],
    ['com-02', 'Una estufa da flama amarilla y deja hollín en las ollas. La combustión es…', ['completa', '*incompleta'],
      '¿El hollín es carbono que sí ardió o que no alcanzó a arder?',
      'El hollín es carbono que no se quemó: le faltó oxígeno. Es una combustión incompleta.'],
    ['com-03', 'En una combustión, ¿quién es el comburente?', ['el combustible', '*el oxígeno', 'el calor'],
      'Combustible es lo que arde. ¿Qué gas hace falta para que arda?',
      'El comburente es el oxígeno: sin él no hay combustión.'],
    ['com-04', '¿Qué gas tóxico, sin color ni olor, aparece cuando falta oxígeno?', ['CO₂', 'O₂', '*CO'],
      'Tiene un oxígeno menos que el de la combustión completa.',
      'El monóxido de carbono (CO) es tóxico y no se ve ni se huele: por eso los calentadores necesitan ventilación.'],
    ['com-05', 'Para apagar un fuego con una manta se le quita…', ['el combustible', '*el oxígeno', 'el calor'],
      'La manta cubre el fuego. ¿Qué deja de llegarle?',
      'La manta impide que llegue el oxígeno: sin comburente, el fuego se apaga. Es uno de los tres lados del triángulo del fuego.'],
    ['com-06', 'Completa: CH<sub>4</sub> + __O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O', ['1', '*2', '3'],
      'Cuenta los oxígenos de los productos: 2 en el CO₂ y 2 en el agua.',
      'A la derecha hay 2 + 2 = 4 oxígenos: hacen falta 2 moléculas de O₂.'],
    ['com-07', 'Completa: C<sub>3</sub>H<sub>8</sub> + 5O<sub>2</sub> → __CO<sub>2</sub> + 4H<sub>2</sub>O', ['1', '*3', '5'],
      '¿Cuántos carbonos tiene el propano?',
      'El propano tiene 3 carbonos: se forman 3 CO₂. Con 4 H₂O, los oxígenos dan 6 + 4 = 10 = 5 O₂.'],
    ['com-08', 'Una flama azul de mechero indica que…', ['falta oxígeno', '*hay oxígeno suficiente', 'el gas es otro'],
      'Con la entrada de aire abierta, ¿qué color da el mechero?',
      'La flama azul es la de una combustión completa: el gas se mezcla con suficiente aire antes de arder.'],
    ['com-09', 'La respiración celular, C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O, se parece a una combustión porque…', ['produce flama', '*la glucosa reacciona con oxígeno y libera energía', 'no necesita oxígeno'],
      'Compara los reactivos y los productos con los de una combustión.',
      'Igual que en una combustión, un compuesto con carbono reacciona con oxígeno, da CO₂ y agua y libera energía, aunque sin flama.'],
    ['com-10', 'Las combustiones liberan energía en forma de…', ['frío', '*calor y luz', 'electricidad'],
      'Piensa en una fogata.',
      'Las combustiones son exotérmicas: liberan energía como calor y, casi siempre, luz.']
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
    clave: 'tercial:quimica:combustion:practica:v1',
    nombres: ['pregunta', 'preguntas'],
    genero: 'f',
    respuestas: answers,
    retro: function (id) {
      return { pista: feedback[id][0], porque: feedback[id][1] };
    }
  });
})();
