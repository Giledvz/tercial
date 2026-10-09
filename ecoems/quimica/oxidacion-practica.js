(function () {
  'use strict';

  /* Práctica de Números de oxidación: ocho átomos para calcular con las
     reglas y la suma cero (o la carga, en los iones) y dos semirreacciones
     para decidir si el elemento se oxida o se reduce. */
  var list = document.querySelector('[data-oxidacion-practica]');
  if (!list || !window.TercialPractica) return;

  // [id, fórmula, elemento, respuesta, pista, por qué]
  var NUMEROS = [
    ['ox-01', 'HNO<sub>3</sub>', 'N', 5,
      'Cada H vale +1 y cada O, −2. Escribe la suma con N como incógnita: debe dar 0.',
      '+1 + N + 3(−2) = 0, así que N = +5.'],
    ['ox-02', 'H<sub>2</sub>SO<sub>3</sub>', 'S', 4,
      'Hay dos hidrógenos y tres oxígenos. La suma de todo debe ser 0.',
      '2(+1) + S + 3(−2) = 0, así que S = +4.'],
    ['ox-03', 'HClO<sub>4</sub>', 'Cl', 7,
      'Aquí el cloro no está en una sal binaria: no vale −1. Usa H = +1 y O = −2.',
      '+1 + Cl + 4(−2) = 0, así que Cl = +7.'],
    ['ox-04', 'H<sub>3</sub>PO<sub>4</sub>', 'P', 5,
      'Tres hidrógenos suman +3 y cuatro oxígenos, −8.',
      '3(+1) + P + 4(−2) = 0, así que P = +5.'],
    ['ox-05', 'Na<sub>2</sub>CrO<sub>4</sub>', 'Cr', 6,
      'El sodio es del grupo IA. ¿Cuánto suman los dos sodios y los cuatro oxígenos?',
      '2(+1) + Cr + 4(−2) = 0, así que Cr = +6.'],
    ['ox-06', 'CO<sub>3</sub><sup>2−</sup>', 'C', 4,
      'Es un ion: la suma no da 0, da su carga, −2.',
      'C + 3(−2) = −2, así que C = +4.'],
    ['ox-07', 'FeCl<sub>3</sub>', 'Fe', 3,
      'Es una sal binaria de un metal con un halógeno: ¿cuánto vale cada cloro?',
      'Cada Cl vale −1: Fe + 3(−1) = 0, así que Fe = +3. Por eso se llama cloruro de hierro (III).'],
    ['ox-08', 'H<sub>2</sub>O<sub>2</sub>', 'O', -1,
      'El agua oxigenada es un peróxido: ahí el oxígeno no vale −2. Calcúlalo con los hidrógenos.',
      'En los peróxidos el oxígeno vale −1: 2(+1) + 2(−1) = 0.']
  ];
  var SEMI = [
    ['ox-09', 'Zn → Zn<sup>2+</sup> + 2e<sup>−</sup>. El zinc…', 'se oxida',
      '¿El zinc pierde o gana electrones? ¿Su número sube o baja?',
      'Pierde dos electrones: su número de oxidación sube de 0 a +2. Se oxida.'],
    ['ox-10', 'Cl<sub>2</sub> + 2e<sup>−</sup> → 2Cl<sup>−</sup>. El cloro…', 'se reduce',
      'Los electrones están del lado izquierdo: el cloro los recibe.',
      'Gana electrones: cada cloro baja de 0 a −1. Se reduce.']
  ];

  var answers = {};
  var feedback = {};
  var byId = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  // Acepta «+5», «5», «−1», «-1» y «– 1».
  function parse(value) {
    var t = String(value || '').replace(/\s+/g, '').replace(/[−–—]/g, '-');
    if (!/^[+-]?\d+$/.test(t)) return NaN;
    return Number(t);
  }

  function item(id, number, statement, response) {
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + number + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + statement + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response">' + response + '</div>';
    list.appendChild(details);
  }

  NUMEROS.forEach(function (n, i) {
    var id = n[0];
    byId[id] = n;
    item(id, String(i + 1).padStart(2, '0'),
      '¿Cuál es el número de oxidación del <strong>' + n[2] + '</strong> en ' + n[1] + '?',
      '<label class="exercise__response-label" for="' + id + '">Número de oxidación</label>' +
      '<div class="exercise__input-row"><input class="input exercise__input" id="' + id + '" name="' + id + '" type="text" ' +
      'inputmode="text" autocomplete="off" maxlength="4" placeholder="+?" data-response></div>');
    answers[id] = function (value) { return parse(value) === n[3]; };
    feedback[id] = [n[4], n[5]];
  });

  SEMI.forEach(function (s, i) {
    var id = s[0];
    item(id, String(NUMEROS.length + i + 1).padStart(2, '0'), s[1],
      '<label class="exercise__response-label" for="' + id + '">Tu respuesta</label>' +
      '<select class="select exercise__select" id="' + id + '" name="' + id + '" data-response data-choices>' +
      '<option value="">Elige una opción</option><option>se oxida</option><option>se reduce</option></select>');
    answers[id] = [s[2]];
    feedback[id] = [s[3], s[4]];
  });

  function rich(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    return span;
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:numeros-oxidacion:practica:v1',
    nombres: ['ejercicio', 'ejercicios'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var n = byId[id];
      if (n && !result.correcto) {
        var valor = parse(result.valores[id]);
        if (isNaN(valor)) return { pista: 'Escribe un número entero con su signo, por ejemplo +3 o −2.' };
        if (valor === -n[3] && valor !== 0) return { pista: rich('El tamaño está bien, pero revisa el signo: ¿el ' + n[2] + ' queda con carga positiva o negativa para que la suma cuadre?') };
      }
      return { pista: rich(feedback[id][0]), porque: rich(feedback[id][1]) };
    }
  });
})();
