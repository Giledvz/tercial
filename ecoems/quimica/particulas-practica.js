(function () {
  'use strict';

  /* Práctica de Partículas subatómicas: la tabla A–J del material fuente
     (QUA-001, p. 12). En cada fila faltan tres datos; se resuelve en dos
     tandas de 5 filas. La pista de cada casilla dice qué regla usar, nunca el
     número. */
  var list = document.querySelector('[data-particle-rows]');
  if (!list || !window.TercialPractica) return;

  var COLUMNS = [
    ['z', 'Z', 'número atómico'],
    ['a', 'A', 'número de masa'],
    ['p', 'p⁺', 'protones'],
    ['n', 'n⁰', 'neutrones'],
    ['e', 'e⁻', 'electrones'],
    ['carga', 'Carga', 'carga']
  ];

  var ROWS = [
    { id: 'a', z: 42, a: 82, p: 42, n: 40, e: 43, carga: -1, pide: ['z', 'a', 'carga'],
      pista: { z: 'Z siempre es igual al número de protones.', a: 'A suma las partículas del núcleo: protones + neutrones.', carga: 'carga = p⁺ − e⁻. Compara cuántos protones y cuántos electrones hay.' },
      porque: 'Z = p⁺ = 42; A = 42 + 40 = 82; carga = 42 − 43 = 1−. Con Z = 42, es el molibdeno (Mo).' },
    { id: 'b', z: 16, a: 31, p: 16, n: 15, e: 13, carga: 3, pide: ['z', 'p', 'e'],
      pista: { z: 'Primero obtén los protones; Z es el mismo número.', p: 'Los protones son las partículas del núcleo que no son neutrones: p⁺ = A − n⁰.', e: 'Una carga 3+ significa que perdió 3 electrones: e⁻ = p⁺ − 3.' },
      porque: 'p⁺ = A − n⁰ = 31 − 15 = 16, y Z = 16; con carga 3+, e⁻ = 16 − 3 = 13. Con Z = 16, es el azufre (S).' },
    { id: 'c', z: 47, a: 95, p: 47, n: 48, e: 49, carga: -2, pide: ['z', 'a', 'carga'],
      pista: { z: 'Z siempre es igual al número de protones.', a: 'A = p⁺ + n⁰.', carga: 'carga = p⁺ − e⁻: resta los electrones a los protones.' },
      porque: 'Z = 47; A = 47 + 48 = 95; carga = 47 − 49 = 2−. Con Z = 47, es la plata (Ag).' },
    { id: 'd', z: 16, a: 34, p: 16, n: 18, e: 18, carga: -2, pide: ['a', 'p', 'e'],
      pista: { a: 'Toma los protones (iguales a Z) y súmales los neutrones.', p: 'Los protones son iguales a Z.', e: 'Una carga 2− significa que ganó 2 electrones: e⁻ = p⁺ + 2.' },
      porque: 'p⁺ = Z = 16; A = 16 + 18 = 34; con carga 2−, e⁻ = 16 + 2 = 18. Es el ion sulfuro, del azufre (S).' },
    { id: 'e', z: 44, a: 101, p: 44, n: 57, e: 44, carga: 0, pide: ['z', 'p', 'n'],
      pista: { z: 'Carga 0 quiere decir átomo neutro: tantos protones como electrones. Z es igual a los protones.', p: 'Carga 0 quiere decir átomo neutro: p⁺ = e⁻.', n: 'n⁰ = A − p⁺.' },
      porque: 'Con carga 0, p⁺ = e⁻ = 44, y Z = 44; n⁰ = 101 − 44 = 57. Con Z = 44, es el rutenio (Ru).' },
    { id: 'f', z: 38, a: 88, p: 38, n: 50, e: 36, carga: 2, pide: ['z', 'a', 'e'],
      pista: { z: 'Z siempre es igual al número de protones.', a: 'A = p⁺ + n⁰.', e: 'Una carga 2+ significa que perdió 2 electrones: e⁻ = p⁺ − 2.' },
      porque: 'Z = 38; A = 38 + 50 = 88; con carga 2+, e⁻ = 38 − 2 = 36. Con Z = 38, es el estroncio (Sr).' },
    { id: 'g', z: 14, a: 28, p: 14, n: 14, e: 18, carga: -4, pide: ['p', 'n', 'carga'],
      pista: { p: 'Los protones son iguales a Z.', n: 'n⁰ = A − Z.', carga: 'carga = p⁺ − e⁻: resta los electrones a los protones.' },
      porque: 'p⁺ = Z = 14; n⁰ = 28 − 14 = 14; carga = 14 − 18 = 4−. Con Z = 14, es el silicio (Si).' },
    { id: 'h', z: 15, a: 31, p: 15, n: 16, e: 18, carga: -3, pide: ['z', 'p', 'e'],
      pista: { z: 'Obtén los protones con p⁺ = A − n⁰; Z es el mismo número.', p: 'p⁺ = A − n⁰.', e: 'Una carga 3− significa que ganó 3 electrones: e⁻ = p⁺ + 3.' },
      porque: 'p⁺ = 31 − 16 = 15, y Z = 15; con carga 3−, e⁻ = 15 + 3 = 18. Con Z = 15, es el fósforo (P).' },
    { id: 'i', z: 49, a: 115, p: 49, n: 66, e: 49, carga: 0, pide: ['a', 'p', 'carga'],
      pista: { a: 'A = p⁺ + n⁰, y los protones son iguales a Z.', p: 'Los protones son iguales a Z.', carga: 'carga = p⁺ − e⁻: compara protones y electrones.' },
      porque: 'p⁺ = Z = 49; A = 49 + 66 = 115; carga = 49 − 49 = 0: es un átomo neutro. Con Z = 49, es el indio (In).' },
    { id: 'j', z: 35, a: 80, p: 35, n: 45, e: 28, carga: 7, pide: ['p', 'n', 'e'],
      pista: { p: 'Los protones son iguales a Z.', n: 'n⁰ = A − Z.', e: 'Una carga 7+ significa que perdió 7 electrones: e⁻ = p⁺ − 7.' },
      porque: 'p⁺ = Z = 35; n⁰ = 80 − 35 = 45; con carga 7+, e⁻ = 35 − 7 = 28. Con Z = 35, es el bromo (Br).' }
  ];

  function chargeLabel(value) {
    if (value === 0) return '0';
    return Math.abs(value) + (value > 0 ? '+' : '−');
  }

  var answers = {};
  var byId = {};

  ROWS.forEach(function (row) {
    var letter = row.id.toUpperCase();
    var item = document.createElement('li');
    item.className = 'particle-row';
    item.setAttribute('data-item', 'particula-' + row.id);
    byId['particula-' + row.id] = row;

    var name = document.createElement('p');
    name.className = 'particle-row__name';
    name.innerHTML = '<span class="particle-row__letter">' + letter + '</span>' +
      '<span class="particle-row__result" data-item-result></span>';
    item.appendChild(name);

    COLUMNS.forEach(function (column) {
      var key = column[0];
      var cell = document.createElement('div');
      var label = document.createElement('span');
      cell.className = 'particle-row__cell';
      label.className = 'particle-row__label';
      label.textContent = column[1];
      cell.appendChild(label);

      if (row.pide.indexOf(key) === -1) {
        var value = document.createElement('span');
        cell.classList.add('is-given');
        value.className = 'particle-row__value';
        value.textContent = key === 'carga' ? chargeLabel(row.carga) : row[key];
        cell.appendChild(value);
      } else {
        var fieldName = 'particula-' + row.id + '-' + key;
        var field;
        cell.setAttribute('data-cell', '');
        if (key === 'carga') {
          // Las cargas van de 7− a 7+; el desplegable abre en 0, cerca de casi todas las respuestas.
          field = document.createElement('select');
          field.className = 'select particle-row__input';
          field.setAttribute('data-inicio', '0');
          field.innerHTML = '<option value="">?</option>';
          for (var q = -7; q <= 7; q += 1) {
            var option = document.createElement('option');
            option.value = String(q);
            option.textContent = chargeLabel(q);
            field.appendChild(option);
          }
          answers[fieldName] = [String(row.carga)];
        } else {
          field = document.createElement('input');
          field.className = 'input particle-row__input';
          field.type = 'text';
          field.inputMode = 'numeric';
          field.setAttribute('pattern', '[0-9]*');
          field.setAttribute('maxlength', '3');
          field.setAttribute('autocomplete', 'off');
          field.placeholder = '?';
          answers[fieldName] = (function (expected) {
            return function (value) {
              return /^\s*\d+\s*$/.test(value) && Number(value) === expected;
            };
          })(row[key]);
        }
        field.name = fieldName;
        field.id = fieldName;
        field.setAttribute('data-response', '');
        field.setAttribute('aria-label', 'Elemento ' + letter + ': ' + column[2] + ' (' + column[1] + ')');
        cell.appendChild(field);
      }
      item.appendChild(cell);
    });

    var feedback = document.createElement('div');
    feedback.className = 'particle-row__feedback';
    feedback.setAttribute('data-item-feedback', '');
    item.appendChild(feedback);
    list.appendChild(item);
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:particulas-subatomicas:practica:v1',
    nombres: ['elemento', 'elementos'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, info) {
      var row = byId[id];
      var hints = row.pide.filter(function (key) {
        return info.campos['particula-' + row.id + '-' + key] === false;
      }).map(function (key) {
        var column = COLUMNS.filter(function (c) { return c[0] === key; })[0];
        return (key === 'carga' ? 'En la carga' : 'En ' + column[1]) + ': ' + row.pista[key];
      });
      return { pista: hints.join(' · '), porque: row.porque };
    }
  });
})();
