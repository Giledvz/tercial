(function () {
  'use strict';

  /* Práctica de Balanceo redox: quién se oxida y quién se reduce, cuántos
     electrones se transfieren, cuándo una reacción es redox y coeficientes.
     Usa reacciones distintas de las de la tarea 3.7 (lista 3.2.2 de la
     fuente, p. 30): aquí aparecen ya balanceadas y darían las respuestas. */
  var list = document.querySelector('[data-redox-practica]');
  if (!list || !window.TercialPractica) return;

  var ITEMS = [
    ['red-01', 'En Cu + 2H<sub>2</sub>SO<sub>4</sub> → CuSO<sub>4</sub> + SO<sub>2</sub> + 2H<sub>2</sub>O, ¿qué elemento se oxida?', ['*el cobre', 'el azufre', 'el oxígeno'],
      'Calcula el número de oxidación del Cu antes y después.',
      'El cobre sube de 0 a +2: se oxida. El azufre que termina en el SO₂ baja de +6 a +4: se reduce.'],
    ['red-02', 'En la misma reacción, ¿cuántos electrones gana el azufre que termina en el SO<sub>2</sub>?', ['1', '*2', '4'],
      'El azufre pasa de +6 en el H₂SO₄ a +4 en el SO₂.',
      'De +6 a +4 baja 2: gana 2 electrones, los mismos que pierde el cobre. El otro H₂SO₄ no cambia: queda como sulfato en el CuSO₄.'],
    ['red-03', '¿Cuál de estas reacciones NO es redox?', ['Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO₂', '*Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O', 'Zn + 2HCl → ZnCl₂ + H₂'],
      'Busca la reacción en la que ningún número de oxidación cambia.',
      'En la neutralización Mg +2, O −2, H +1 y Cl −1 se quedan igual: no hay transferencia de electrones.'],
    ['red-04', 'Con ácido nítrico diluido, 3Cu + 8HNO<sub>3</sub> → 3Cu(NO<sub>3</sub>)<sub>2</sub> + 2NO + 4H<sub>2</sub>O. El nitrógeno que termina en el NO…', ['se oxida de +5 a +2', '*se reduce de +5 a +2', 'no cambia'],
      'N en el HNO₃ y N en el NO: ¿sube o baja?',
      'Baja de +5 a +2: gana 3 electrones y se reduce. El cobre sube de 0 a +2, y el nitrógeno del nitrato se queda en +5.'],
    ['red-05', 'Si un elemento pierde 2 electrones y otro gana 3, ¿por cuánto se multiplica cada semirreacción?', ['por 2 y por 3', '*la que pierde por 3 y la que gana por 2', 'por 5 las dos'],
      'Los electrones perdidos deben ser los ganados. ¿Cuál es el mínimo común múltiplo de 2 y 3?',
      'El mínimo común múltiplo es 6: la que pierde 2 va por 3 y la que gana 3 va por 2.'],
    ['red-06', '¿Qué coeficiente lleva el Al en __Al + 3CuSO<sub>4</sub> → Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> + 3Cu?', ['1', '*2', '3'],
      'Cuenta los aluminios del Al₂(SO₄)₃.',
      'Hay 2 aluminios a la derecha: 2Al. Cada Al pierde 3 electrones (6 en total) y cada Cu gana 2 (3 × 2 = 6): cuadran.'],
    ['red-07', 'Se llama agente oxidante a la sustancia que…', ['*se reduce y hace que otra se oxide', 'se oxida', 'no cambia'],
      'El agente oxidante «oxida» a otro: le quita electrones.',
      'El agente oxidante gana electrones (se reduce) y así oxida a otra sustancia. El agente reductor es la que se oxida.'],
    ['red-08', 'Al arder, 2Mg + O<sub>2</sub> → 2MgO. ¿Quién se reduce?', ['el magnesio', '*el oxígeno', 'ninguno'],
      'El O₂ vale 0. ¿Cuánto vale en el MgO?',
      'El oxígeno baja de 0 a −2: se reduce. El magnesio sube de 0 a +2: se oxida. Así arde el magnesio, con una luz blanca muy intensa.']
  ];

  var answers = {}, feedback = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  // Las opciones son texto plano: los subíndices de HTML se vuelven Unicode.
  var SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  function plano(t) { return t.replace(/<sub>(\d+)<\/sub>/g, function (_, d) { return d.split('').map(function (c) { return SUB[c]; }).join(''); }); }

  ITEMS.forEach(function (item, i) {
    var id = item[0], correcta = '';
    var opciones = item[2].map(function (o) {
      var t = plano(o.charAt(0) === '*' ? o.slice(1) : o);
      if (o.charAt(0) === '*') correcta = t;
      return t;
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
    clave: 'tercial:quimica:balanceo-redox:practica:v1',
    nombres: ['pregunta', 'preguntas'],
    genero: 'f',
    respuestas: answers,
    retro: function (id) { return { pista: feedback[id][0], porque: feedback[id][1] }; }
  });
})();
