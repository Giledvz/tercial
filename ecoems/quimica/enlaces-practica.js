(function () {
  'use strict';

  /* Práctica de Enlaces químicos y estructuras de Lewis (fuente QUA-001,
     p. 20). Cinco símbolos de Lewis de la fuente (P, K, Br, Sb) más el calcio,
     y diez compuestos del ejercicio de la fuente: se calcula la ΔEN con las
     electronegatividades de Pauling de la página y se elige el tipo de enlace
     con los límites de la fuente (0.4 y 1.7). La ΔEN se acepta con 0.03 de
     margen por redondeo. */
  var lewisList = document.querySelector('[data-enlaces-lewis]');
  var cards = document.querySelector('[data-enlaces-compuestos]');
  if (!lewisList || !cards || !window.TercialPractica) return;

  var EN = { H: 2.20, Li: 0.98, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Cl: 3.16, K: 0.82, Ca: 1.00, Br: 2.96, Ag: 1.93, I: 2.66, Ba: 0.89 };
  var TYPES = ['Covalente no polar', 'Covalente polar', 'Iónico'];

  var LEWIS = [
    ['lew-p', 'Fósforo (P) · grupo VA', 5],
    ['lew-k', 'Potasio (K) · grupo IA', 1],
    ['lew-br', 'Bromo (Br) · grupo VIIA', 7],
    ['lew-sb', 'Antimonio (Sb) · grupo VA', 5],
    ['lew-ca', 'Calcio (Ca) · grupo IIA', 2]
  ];

  // [id, fórmula en HTML, elemento a, elemento b, nota]
  var COMPOUNDS = [
    ['enl-nacl', 'NaCl', 'Cl', 'Na', ''],
    ['enl-hbr', 'HBr', 'Br', 'H', ''],
    ['enl-i2', 'I<sub>2</sub>', 'I', 'I', 'Los dos átomos son iguales: atraen igual al par.'],
    ['enl-nh3', 'NH<sub>3</sub>', 'N', 'H', ''],
    ['enl-ch4', 'CH<sub>4</sub>', 'C', 'H', 'Por eso casi todos los compuestos orgánicos son no polares.'],
    ['enl-kf', 'KF', 'F', 'K', ''],
    ['enl-na2o', 'Na<sub>2</sub>O', 'O', 'Na', ''],
    ['enl-cacl2', 'CaCl<sub>2</sub>', 'Cl', 'Ca', ''],
    ['enl-agcl', 'AgCl', 'Cl', 'Ag', 'Aunque la plata es un metal, el enlace es covalente polar: por eso el AgCl casi no se disuelve en agua.'],
    ['enl-n2', 'N<sub>2</sub>', 'N', 'N', 'Es un enlace triple: :N≡N:.']
  ];

  function fmt(n) { return n.toFixed(2); }

  function typeOf(delta) {
    if (delta < 0.4) return TYPES[0];
    if (delta <= 1.7) return TYPES[1];
    return TYPES[2];
  }

  function parse(value) {
    var text = String(value || '').trim().replace(',', '.');
    if (!/^\d*\.?\d+$/.test(text)) return NaN;
    return Number(text);
  }

  var answers = {};
  var feedback = {};
  var byId = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  LEWIS.forEach(function (item, i) {
    var id = item[0];
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + item[1] + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + id + '">Puntos</label>' +
      '<input class="input exercise__input" id="' + id + '" name="' + id + '" type="text" inputmode="numeric" ' +
      'pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="?" data-response></div>';
    lewisList.appendChild(details);
    answers[id] = (function (expected) {
      return function (value) { return /^\s*\d+\s*$/.test(value) && Number(value) === expected; };
    })(item[2]);
    feedback[id] = ['Cada punto es un electrón de valencia. En las familias A, ¿cuántos tiene un elemento del ' + item[1].split('grupo ')[1] + '?',
      'Es del ' + item[1].split('grupo ')[1] + ': ' + item[2] + ' electrón' + (item[2] === 1 ? '' : 'es') + ' de valencia, ' +
      item[2] + ' punto' + (item[2] === 1 ? '' : 's') + ' alrededor del símbolo.'];
  });

  COMPOUNDS.forEach(function (c) {
    var id = c[0];
    var delta = Math.round((EN[c[2]] - EN[c[3]]) * 100) / 100;
    var compound = { id: id, html: c[1], a: c[2], b: c[3], note: c[4], delta: delta, type: typeOf(delta) };
    byId[id] = compound;
    var item = document.createElement('li');
    item.className = 'config-card';
    item.setAttribute('data-item', id);
    item.innerHTML =
      '<header class="config-card__head">' +
        '<p class="config-card__element"><span class="config-card__symbol">' + c[1] + '</span></p>' +
        '<span class="config-card__result" data-item-result></span>' +
      '</header>' +
      '<div class="config-card__row config-card__row--dos">' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="' + id + '-delta">ΔEN</label>' +
          '<input class="input config-card__input" id="' + id + '-delta" name="' + id + '-delta" type="text" inputmode="decimal" ' +
          'autocomplete="off" placeholder="0.00" data-response></div>' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="' + id + '-tipo">Tipo de enlace</label>' +
          '<select class="select config-card__select" id="' + id + '-tipo" name="' + id + '-tipo" data-response>' +
          '<option value="">Elige</option>' + TYPES.map(function (t) { return '<option>' + t + '</option>'; }).join('') +
          '</select></div>' +
      '</div>' +
      '<div class="config-card__feedback" data-item-feedback></div>';
    cards.appendChild(item);
    answers[id + '-delta'] = function (value) {
      var n = parse(value);
      return !isNaN(n) && Math.abs(n - delta) <= 0.03;
    };
    answers[id + '-tipo'] = [compound.type];
  });

  function rich(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    return span;
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:enlaces-lewis:practica:v1',
    respuestas: answers,
    retro: function (id, result) {
      if (feedback[id]) return { pista: rich(feedback[id][0]), porque: rich(feedback[id][1]) };
      var c = byId[id];
      var hints = [];
      if (result.campos[id + '-delta'] === false) {
        hints.push('ΔEN: busca en la tabla la electronegatividad del ' + c.a + ' y la del ' + c.b + ', y resta la menor a la mayor.');
      }
      if (result.campos[id + '-tipo'] === false) {
        hints.push('Tipo: ubica tu ΔEN; de 0 a 0.4 es no polar, de 0.4 a 1.7 es polar y más de 1.7 es iónico.');
      }
      var why = c.a === c.b
        ? 'ΔEN = ' + fmt(EN[c.a]) + ' − ' + fmt(EN[c.b]) + ' = 0.00: ' + c.type.toLowerCase() + '.'
        : 'ΔEN = ' + fmt(EN[c.a]) + ' (' + c.a + ') − ' + fmt(EN[c.b]) + ' (' + c.b + ') = ' + fmt(c.delta) + ': ' + c.type.toLowerCase() + '.';
      return { pista: rich(hints.join(' · ')), porque: rich(why + (c.note ? ' ' + c.note : '')) };
    }
  });
})();
