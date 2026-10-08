(function () {
  'use strict';

  /* Práctica de Números cuánticos: los cuatro números del último electrón
     (electrón diferencial). Ar, P, O y Se vienen del material fuente
     (QUA-001, p. 14); los demás cubren subniveles s, p y d. Convención de
     la fuente: las cajas se llenan de izquierda a derecha (m de −l a +l) y
     la flecha hacia arriba vale +½. */
  var list = document.querySelector('[data-cuanticos-cards]');
  if (!list || !window.TercialPractica) return;

  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
  var CAPACITY = { s: 2, p: 6, d: 10, f: 14 };
  var NOBLE = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  var UP = '+½', DOWN = '−½';

  var ELEMENTS = [
    { id: 'n', z: 7, symbol: 'N', name: 'Nitrógeno' },
    { id: 'o', z: 8, symbol: 'O', name: 'Oxígeno' },
    { id: 'f', z: 9, symbol: 'F', name: 'Flúor' },
    { id: 'na', z: 11, symbol: 'Na', name: 'Sodio' },
    { id: 'p', z: 15, symbol: 'P', name: 'Fósforo' },
    { id: 'ar', z: 18, symbol: 'Ar', name: 'Argón' },
    { id: 'k', z: 19, symbol: 'K', name: 'Potasio' },
    { id: 'fe', z: 26, symbol: 'Fe', name: 'Hierro' },
    { id: 'zn', z: 30, symbol: 'Zn', name: 'Zinc' },
    { id: 'se', z: 34, symbol: 'Se', name: 'Selenio' }
  ];

  function sup(n) {
    return String(n).split('').map(function (d) { return SUP[Number(d)]; }).join('');
  }

  function signed(m) {
    return m > 0 ? '+' + m : m < 0 ? '−' + (-m) : '0';
  }

  function fill(z) {
    var rest = z;
    var terms = [];
    ORDER.forEach(function (sub) {
      if (rest <= 0) return;
      var n = Math.min(CAPACITY[sub[1]], rest);
      terms.push({ sub: sub, n: n, level: Number(sub[0]), type: sub[1] });
      rest -= n;
    });
    return terms;
  }

  function describe(element) {
    var terms = fill(element.z);
    var gas = NOBLE.filter(function (g) { return g[0] < element.z; })[0] || null;
    var shown = gas ? terms.slice(fill(gas[0]).length) : terms;
    var last = terms[terms.length - 1];
    var l = 'spdf'.indexOf(last.type);
    var boxes = 2 * l + 1;
    var up = last.n <= boxes;
    var box = up ? last.n - 1 : last.n - boxes - 1;
    // Cajas del último subnivel, como se dibujarían en el cuaderno.
    var drawing = [];
    for (var i = 0; i < boxes; i += 1) {
      var count = (last.n > i ? 1 : 0) + (last.n > boxes + i ? 1 : 0);
      drawing.push(count === 2 ? '[↑↓]' : count === 1 ? '[↑]' : '[ ]');
    }
    return {
      config: (gas ? '[' + gas[1] + '] ' : '') + shown.map(function (t) { return t.sub + sup(t.n); }).join(' '),
      last: last,
      n: last.level,
      l: l,
      m: box - l,
      s: up ? UP : DOWN,
      up: up,
      box: box,
      boxes: boxes,
      drawing: drawing.join(' ')
    };
  }

  function options(select, values, labels) {
    select.innerHTML = '<option value="">Elige</option>';
    values.forEach(function (value, i) {
      var option = document.createElement('option');
      option.value = String(value);
      option.textContent = labels ? labels[i] : String(value);
      select.appendChild(option);
    });
  }

  var answers = {};
  var byId = {};
  var FIELDS = [['n', 'n'], ['l', 'l'], ['m', 'm'], ['s', 's']];

  ELEMENTS.forEach(function (element) {
    element.info = describe(element);
    byId['cuantico-' + element.id] = element;
    var item = document.createElement('li');
    item.className = 'config-card';
    item.setAttribute('data-item', 'cuantico-' + element.id);
    item.innerHTML =
      '<header class="config-card__head">' +
        '<p class="config-card__element"><span class="config-card__z">' + element.z + '</span>' +
          '<span class="config-card__symbol">' + element.symbol + '</span>' +
          '<span class="config-card__name">' + element.name + '</span></p>' +
        '<span class="config-card__result" data-item-result></span>' +
      '</header>' +
      '<p class="config-card__given">' + element.info.config + '</p>' +
      '<div class="config-card__row config-card__row--four">' +
        FIELDS.map(function (field) {
          var name = 'cuantico-' + element.id + '-' + field[0];
          return '<div class="config-card__field" data-cell><label class="config-card__label config-card__label--simbolo" for="' + name + '">' + field[1] + '</label>' +
            '<select class="select config-card__select" id="' + name + '" name="' + name + '" data-response></select></div>';
        }).join('') +
      '</div>' +
      '<div class="config-card__feedback" data-item-feedback></div>';
    list.appendChild(item);

    var base = 'cuantico-' + element.id + '-';
    options(item.querySelector('[name="' + base + 'n"]'), [1, 2, 3, 4, 5, 6, 7]);
    options(item.querySelector('[name="' + base + 'l"]'), [0, 1, 2, 3]);
    options(item.querySelector('[name="' + base + 'm"]'), [-3, -2, -1, 0, 1, 2, 3], ['−3', '−2', '−1', '0', '+1', '+2', '+3']);
    options(item.querySelector('[name="' + base + 's"]'), ['+1/2', '-1/2'], [UP, DOWN]);

    answers[base + 'n'] = [String(element.info.n)];
    answers[base + 'l'] = [String(element.info.l)];
    answers[base + 'm'] = [String(element.info.m)];
    answers[base + 's'] = [element.info.up ? '+1/2' : '-1/2'];
  });

  var HINTS = {
    n: 'n es el número del último subnivel: el 4 de 4p, por ejemplo.',
    l: 'l depende de la letra del último subnivel: s = 0, p = 1, d = 2, f = 3.',
    m: 'Dibuja las cajas del último subnivel, numeradas de −l a +l, y acomoda los electrones con la regla de Hund: ¿en qué caja quedó el último?',
    s: 'Si el último electrón quedó solo en su caja, gira hacia arriba (+½); si completó el par, hacia abajo (−½).'
  };

  window.TercialPractica.init({
    clave: 'tercial:quimica:numeros-cuanticos:practica:v1',
    nombres: ['elemento', 'elementos'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var element = byId[id];
      var info = element.info;
      var hints = FIELDS.filter(function (field) {
        return result.campos[id + '-' + field[0]] === false;
      }).map(function (field) { return field[1] + ': ' + HINTS[field[0]]; });
      var where = info.up
        ? 'el último entra solo en la caja ' + (info.box + 1) + ' (m = ' + signed(info.m) + ') girando hacia arriba'
        : 'el último completa el par de la caja ' + (info.box + 1) + ' (m = ' + signed(info.m) + ') girando hacia abajo';
      return {
        pista: hints.join(' · '),
        porque: 'Último subnivel ' + info.last.sub + sup(info.last.n) + ': ' + info.drawing + '; ' + where +
          '. Por eso n = ' + info.n + ', l = ' + info.l + ', m = ' + signed(info.m) + ' y s = ' + info.s + '.'
      };
    }
  });
})();
