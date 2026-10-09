(function () {
  'use strict';

  /* Práctica de Tipos de reacción: diez ecuaciones de la fuente (p. 27), ya
     balanceadas, para clasificar. La pista remite a la forma general de cada
     tipo; el «por qué» señala qué se juntó, qué se separó o qué se cambió. */
  var list = document.querySelector('[data-tipos-practica]');
  if (!list || !window.TercialPractica) return;

  var OPCIONES = ['Síntesis', 'Descomposición', 'Sustitución simple', 'Sustitución doble'];
  // [id, ecuación, respuesta, pista, por qué]
  var ITEMS = [
    ['tip-01', '2Mg + O<sub>2</sub> → 2MgO', 'Síntesis',
      '¿Cuántas sustancias hay del lado de los productos?',
      'Dos sustancias, magnesio y oxígeno, forman una sola: A + B → AB.'],
    ['tip-02', 'Cl<sub>2</sub> + 2NaBr → 2NaCl + Br<sub>2</sub>', 'Sustitución simple',
      'Hay un elemento solo de cada lado. ¿A quién desplazó el cloro?',
      'El cloro, solo, toma el lugar del bromo en la sal y el bromo queda libre: A + BC → AC + B.'],
    ['tip-03', '2HgO → 2Hg + O<sub>2</sub>', 'Descomposición',
      '¿Cuántos reactivos hay?',
      'Una sola sustancia, el óxido de mercurio, se separa en dos: AB → A + B.'],
    ['tip-04', 'Ni(NO<sub>3</sub>)<sub>2</sub> + 2NaOH → Ni(OH)<sub>2</sub> + 2NaNO<sub>3</sub>', 'Sustitución doble',
      'Son dos compuestos de cada lado. ¿Qué pasó con sus iones?',
      'Los dos compuestos intercambian iones: el níquel se queda con el OH y el sodio con el nitrato. AB + CD → AD + CB.'],
    ['tip-05', 'CaO + SO<sub>2</sub> → CaSO<sub>3</sub>', 'Síntesis',
      'Del lado de los productos hay una sola sustancia.',
      'Dos compuestos se unen en uno solo: también es síntesis aunque no sean elementos.'],
    ['tip-06', 'Zn + H<sub>2</sub>SO<sub>4</sub> → ZnSO<sub>4</sub> + H<sub>2</sub>', 'Sustitución simple',
      'El zinc llega solo. ¿Qué elemento sale solo?',
      'El zinc toma el lugar del hidrógeno, que se libera como gas.'],
    ['tip-07', 'CuCO<sub>3</sub> → CuO + CO<sub>2</sub>', 'Descomposición',
      'Hay un solo reactivo y dos productos.',
      'Al calentarse, el carbonato de cobre se separa en dos compuestos más sencillos.'],
    ['tip-08', 'AgNO<sub>3</sub> + HCl → AgCl + HNO<sub>3</sub>', 'Sustitución doble',
      'Dos compuestos de cada lado: fíjate quién acompaña a la plata antes y después.',
      'La plata cambia el nitrato por el cloruro y el hidrógeno el cloruro por el nitrato. El AgCl no se disuelve: precipita.'],
    ['tip-09', '2K + 2H<sub>2</sub>O → 2KOH + H<sub>2</sub>', 'Sustitución simple',
      'El potasio llega solo. ¿Qué elemento queda libre al final?',
      'El potasio desplaza a uno de los hidrógenos del agua, que sale como gas.'],
    ['tip-10', 'HCl + NaOH → NaCl + H<sub>2</sub>O', 'Sustitución doble',
      'Un ácido y una base: ¿intercambian sus iones?',
      'El H del ácido se junta con el OH de la base y forman agua; el Na y el Cl, la sal. Es una sustitución doble llamada neutralización.']
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
      '<div class="exercise__statement"><p class="exercise__text exercise__text--ecuacion">' + item[1] + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + id + '">Tipo de reacción</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option>' +
      OPCIONES.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div>';
    list.appendChild(details);
    answers[id] = [item[2]];
    feedback[id] = [item[3], item[4]];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:tipos-reaccion:practica:v1',
    nombres: ['reacción', 'reacciones'],
    genero: 'f',
    respuestas: answers,
    retro: function (id) {
      return { pista: feedback[id][0], porque: feedback[id][1] };
    }
  });
})();
