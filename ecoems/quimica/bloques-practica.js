(function () {
  'use strict';

  /* Práctica de Bloques s, p, d y f: con la configuración abreviada (regla de
     las diagonales) se elige el bloque y el periodo. Hay trampas a propósito:
     el helio (bloque s, aunque va con los gases nobles), el bromo y el plomo
     (llevan d y f por dentro, pero su último subnivel es p) y el neodimio
     (llena el 4f, pero está en el periodo 6). */
  var list = document.querySelector('[data-bloques-cards]');
  if (!list || !window.TercialPractica) return;

  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
  var CAPACITY = { s: 2, p: 6, d: 10, f: 14 };
  var NOBLE = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  var ELEMENTS = [
    { id: 'na', z: 11, symbol: 'Na', name: 'Sodio' },
    { id: 'cl', z: 17, symbol: 'Cl', name: 'Cloro' },
    { id: 'fe', z: 26, symbol: 'Fe', name: 'Hierro' },
    { id: 'he', z: 2, symbol: 'He', name: 'Helio' },
    { id: 'nd', z: 60, symbol: 'Nd', name: 'Neodimio' },
    { id: 'br', z: 35, symbol: 'Br', name: 'Bromo' },
    { id: 'zn', z: 30, symbol: 'Zn', name: 'Zinc' },
    { id: 'ba', z: 56, symbol: 'Ba', name: 'Bario' },
    { id: 'pu', z: 94, symbol: 'Pu', name: 'Plutonio' },
    { id: 'pb', z: 82, symbol: 'Pb', name: 'Plomo' }
  ];

  // Pistas para las trampas; las demás usan la pista general.
  var BLOCK_HINTS = {
    he: 'Aunque el helio va con los gases nobles, fíjate en su único subnivel.',
    br: 'Tiene 3d¹⁰ por dentro, pero ¿cuál es el último subnivel que se llena?',
    pb: 'Lleva 4f y 5d por dentro, pero ¿cuál es el último subnivel de la configuración?'
  };

  function sup(n) {
    return String(n).split('').map(function (d) { return SUP[Number(d)]; }).join('');
  }

  function fill(z) {
    var rest = z;
    var terms = [];
    ORDER.forEach(function (sub) {
      if (rest <= 0) return;
      var n = Math.min(CAPACITY[sub[1]], rest);
      terms.push({ sub: sub, n: n });
      rest -= n;
    });
    return terms;
  }

  function describe(element) {
    var terms = fill(element.z);
    var gas = NOBLE.filter(function (g) { return g[0] < element.z; })[0] || null;
    var shown = gas ? terms.slice(fill(gas[0]).length) : terms;
    var last = terms[terms.length - 1];
    var period = Math.max.apply(null, terms.map(function (t) { return Number(t.sub[0]); }));
    var top = terms.filter(function (t) { return Number(t.sub[0]) === period; })[0];
    return {
      config: (gas ? '[' + gas[1] + '] ' : '') + shown.map(function (t) { return t.sub + sup(t.n); }).join(' '),
      last: last.sub + sup(last.n),
      block: last.sub[1],
      period: period,
      top: top.sub + sup(top.n)
    };
  }

  function options(select, values) {
    select.innerHTML = '<option value="">Elige</option>';
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = String(value);
      option.textContent = String(value);
      select.appendChild(option);
    });
  }

  var answers = {};
  var byId = {};

  ELEMENTS.forEach(function (element) {
    element.info = describe(element);
    var id = 'bloque-' + element.id;
    byId[id] = element;
    var item = document.createElement('li');
    item.className = 'config-card';
    item.setAttribute('data-item', id);
    item.innerHTML =
      '<header class="config-card__head">' +
        '<p class="config-card__element"><span class="config-card__z">' + element.z + '</span>' +
          '<span class="config-card__symbol">' + element.symbol + '</span>' +
          '<span class="config-card__name">' + element.name + '</span></p>' +
        '<span class="config-card__result" data-item-result></span>' +
      '</header>' +
      '<p class="config-card__given">' + element.info.config + '</p>' +
      '<div class="config-card__row config-card__row--dos">' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="' + id + '-bloque">Bloque</label>' +
          '<select class="select config-card__select" id="' + id + '-bloque" name="' + id + '-bloque" data-response></select></div>' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="' + id + '-periodo">Periodo</label>' +
          '<select class="select config-card__select" id="' + id + '-periodo" name="' + id + '-periodo" data-response></select></div>' +
      '</div>' +
      '<div class="config-card__feedback" data-item-feedback></div>';
    list.appendChild(item);

    options(item.querySelector('[name="' + id + '-bloque"]'), ['s', 'p', 'd', 'f']);
    options(item.querySelector('[name="' + id + '-periodo"]'), [1, 2, 3, 4, 5, 6, 7]);
    answers[id + '-bloque'] = [element.info.block];
    answers[id + '-periodo'] = [String(element.info.period)];
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:bloques-periodicos:practica:v1',
    nombres: ['elemento', 'elementos'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var element = byId[id];
      var info = element.info;
      var hints = [];
      if (result.campos[id + '-bloque'] === false) {
        hints.push('Bloque: ' + (BLOCK_HINTS[element.id] || 'mira la letra del último subnivel de la configuración: esa letra es el bloque.'));
      }
      if (result.campos[id + '-periodo'] === false) {
        hints.push('Periodo: es el nivel más alto que aparece, el número más grande delante de una letra.');
      }
      return {
        pista: hints.join(' · '),
        porque: 'Último subnivel ' + info.last + ' → bloque ' + info.block + '. El nivel más alto es ' +
          info.period + ' (' + info.top + ') → periodo ' + info.period + '.'
      };
    }
  });
})();
