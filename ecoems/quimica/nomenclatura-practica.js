(function () {
  'use strict';

  /* Práctica de Nomenclatura inorgánica: seis fórmulas para nombrar y cuatro
     nombres para escribir su fórmula. Cada opción incorrecta es un error
     típico: -ato por -ito, el número romano equivocado, los prefijos al revés. */
  var list = document.querySelector('[data-nomenclatura-practica]');
  if (!list || !window.TercialPractica) return;

  // [id, enunciado, opciones (la correcta es la que se marca con *), pista, por qué]
  var ITEMS = [
    ['nom-01', '¿Cómo se llama el CaO?', ['monóxido de calcio', '*óxido de calcio', 'hidróxido de calcio'],
      'Metal + oxígeno: ¿cuál es la receta de los óxidos metálicos?',
      'Es un óxido metálico: óxido + de + metal. El calcio sólo tiene un número de oxidación (+2), así que no lleva número romano; los prefijos (mono-, di-…) se usan con los no metales.'],
    ['nom-02', '¿Cómo se llama el N<sub>2</sub>O<sub>3</sub>?', ['dióxido de trinitrógeno', 'ácido nitroso', '*trióxido de dinitrógeno'],
      'No metal + oxígeno: los prefijos dicen cuántos átomos hay de cada uno.',
      'Tres oxígenos (tri-) y dos nitrógenos (di-): trióxido de dinitrógeno.'],
    ['nom-03', '¿Cuál es la fórmula del sulfato de cobre (II)?', ['*CuSO₄', 'Cu₂SO₄', 'CuSO₃'],
      'El sulfato es SO₄²⁻ y el (II) dice que el cobre vale +2. ¿Cuántos iones de cada uno?',
      'Cu²⁺ con SO₄²⁻: una carga +2 y una −2 se compensan, así que CuSO₄. CuSO₃ sería sulfito.'],
    ['nom-04', '¿Cómo se llama el HBr disuelto en agua?', ['ácido brómico', '*ácido bromhídrico', 'ácido bromoso'],
      'H + no metal, sin oxígeno: es un hidrácido.',
      'Los hidrácidos terminan en -hídrico: ácido bromhídrico. Las terminaciones -ico y -oso son de los oxiácidos.'],
    ['nom-05', '¿Cómo se llama el Fe(OH)<sub>2</sub>?', ['hidróxido de hierro (III)', 'óxido de hierro (II)', '*hidróxido de hierro (II)'],
      'Cada OH tiene carga −1. ¿Cuánto vale el hierro?',
      'Dos OH suman −2, así que Fe = +2: hidróxido de hierro (II).'],
    ['nom-06', '¿Cuál es la fórmula del ácido nítrico?', ['HNO₂', '*HNO₃', 'NH₃'],
      'La terminación -ico viene de -ato: ¿cuál es el ion nitrato?',
      'Nítrico viene de nitrato, NO₃⁻; con un H queda HNO₃. El HNO₂ es el ácido nitroso.'],
    ['nom-07', '¿Cómo se llama el H<sub>2</sub>SO<sub>3</sub>?', ['*ácido sulfuroso', 'ácido sulfúrico', 'ácido sulfhídrico'],
      'SO₃²⁻ es el ion sulfito. ¿En qué se convierte -ito?',
      'Sulfito cambia a sulfuroso: ácido sulfuroso. El ácido sulfúrico es H₂SO₄ y el sulfhídrico, H₂S.'],
    ['nom-08', '¿Cuál es la fórmula del pentaóxido de difósforo?', ['P₅O₂', 'PO₅', '*P₂O₅'],
      'Penta- va pegado a «óxido» y di- a «fósforo».',
      'Penta = 5 oxígenos y di = 2 fósforos: P₂O₅.'],
    ['nom-09', '¿Cuál es la fórmula del cloruro de hierro (III)?', ['FeCl₂', '*FeCl₃', 'Fe₃Cl'],
      'El (III) es el número de oxidación del hierro y cada cloro vale −1.',
      'El Fe³⁺ necesita tres Cl⁻ para quedar neutro: FeCl₃.'],
    ['nom-10', '¿Cómo se llama el KH<sub>2</sub>PO<sub>4</sub>?', ['fosfato de potasio', 'ácido fosfórico', '*fosfato diácido de potasio'],
      'Hay un metal, dos H y un ion con oxígeno: es una sal ácida.',
      'Sal ácida: ion + prefijo + ácido + de + metal. Tiene dos H: fosfato diácido de potasio.']
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
    clave: 'tercial:quimica:nomenclatura-inorganica:practica:v1',
    nombres: ['compuesto', 'compuestos'],
    genero: 'm',
    respuestas: answers,
    retro: function (id) {
      return { pista: feedback[id][0], porque: feedback[id][1] };
    }
  });
})();
