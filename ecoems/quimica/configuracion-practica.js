(function () {
  'use strict';

  /* Práctica de Configuración electrónica: los elementos del material fuente
     (QUA-001, p. 13) más el aluminio. En cada tarjeta se escribe la
     configuración y se eligen periodo, electrones de valencia y familia.
     La configuración se acepta en cualquier orden y con números normales,
     superíndices o «^»; también con el kernel de un gas noble, como [Ne] 3s1.
     Para no escribir tanto, cada tarjeta trae un atajo: tocar un gas noble
     pone su kernel al principio de la respuesta (elegir cuál sigue siendo
     tarea del alumno). El selenio se corrige respecto de la fuente: es VIA,
     con 6 electrones de valencia (2, 8, 18, 6). */
  var list = document.querySelector('[data-config-cards]');
  if (!list || !window.TercialPractica) return;

  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
  var CAPACITY = { s: 2, p: 6, d: 10, f: 14 };
  var CORES = { he: 2, ne: 10, ar: 18, kr: 36, xe: 54, rn: 86 };
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  var NOBLE = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
  var KERNELS = [['He', 'helio', 2], ['Ne', 'neón', 10], ['Ar', 'argón', 18], ['Kr', 'kriptón', 36], ['Xe', 'xenón', 54], ['Rn', 'radón', 86]];
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  var ELEMENTS = [
    { id: 'o', z: 8, symbol: 'O', name: 'Oxígeno' },
    { id: 'al', z: 13, symbol: 'Al', name: 'Aluminio' },
    { id: 'p', z: 15, symbol: 'P', name: 'Fósforo' },
    { id: 'ar', z: 18, symbol: 'Ar', name: 'Argón' },
    { id: 'ca', z: 20, symbol: 'Ca', name: 'Calcio' },
    { id: 'se', z: 34, symbol: 'Se', name: 'Selenio' },
    { id: 'br', z: 35, symbol: 'Br', name: 'Bromo' },
    { id: 'in', z: 49, symbol: 'In', name: 'Indio' },
    { id: 'cs', z: 55, symbol: 'Cs', name: 'Cesio' },
    { id: 'pb', z: 82, symbol: 'Pb', name: 'Plomo' }
  ];

  function sup(n) {
    return String(n).split('').map(function (d) { return SUP[Number(d)]; }).join('');
  }

  // Configuración por la regla de las diagonales.
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
    var period = Math.max.apply(null, terms.map(function (t) { return Number(t.sub[0]); }));
    var valenceTerms = terms.filter(function (t) { return Number(t.sub[0]) === period && /[sp]/.test(t.sub[1]); });
    var valence = valenceTerms.reduce(function (sum, t) { return sum + t.n; }, 0);
    var levels = [];
    for (var level = 1; level <= period; level += 1) {
      levels.push(terms.filter(function (t) { return Number(t.sub[0]) === level; })
        .reduce(function (sum, t) { return sum + t.n; }, 0));
    }
    var gas = NOBLE.filter(function (g) { return g[0] < element.z; })[0] || null;
    var short = gas ? '[' + gas[1] + '] ' + terms.slice(fill(gas[0]).length)
      .map(function (t) { return t.sub + sup(t.n); }).join(' ') : '';
    return {
      terms: terms,
      short: short,
      period: period,
      valence: valence,
      valenceTerms: valenceTerms,
      family: ROMAN[valence] + 'A',
      levels: levels,
      hasInnerD: terms.some(function (t) { return t.sub[1] === 'd' || t.sub[1] === 'f'; })
    };
  }

  /* Lectura de lo que escribe el alumno. Devuelve { counts, total, problem }:
     counts es un mapa subnivel → electrones; problem explica qué no se pudo
     leer. */
  function parse(value) {
    var text = String(value || '')
      .toLowerCase()
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) { return String(SUP.indexOf(c)); })
      .replace(/\^/g, '');
    var counts = {};
    var total = 0;
    var problem = null;
    var core = null;
    var inCore = {};
    // Kernel del gas noble: [Kr], (Kr) o «Kr» al principio.
    text = text.replace(/^\s*(he|ne|ar|kr|xe|rn)\b/, '[$1]');
    text = text.replace(/[\[(]\s*(he|ne|ar|kr|xe|rn)\s*[\])]/g, function (_, gas) {
      core = gas;
      fill(CORES[gas]).forEach(function (t) {
        counts[t.sub] = (counts[t.sub] || 0) + t.n;
        total += t.n;
        inCore[t.sub] = true;
      });
      return ' ';
    });
    var leftover = text.replace(/(\d)\s*([spdf])\s*(\d{1,2})/g, function (_, level, type, count) {
      var sub = level + type;
      var n = Number(count);
      // Si el subnivel ya venía dentro del kernel, se avisa del kernel, no de una repetición.
      if (counts[sub]) problem = problem || { kind: 'repetido', sub: sub, core: inCore[sub] ? core : null };
      counts[sub] = (counts[sub] || 0) + n;
      total += n;
      return ' ';
    });
    if (/[^\s,.;+·]/.test(leftover)) problem = { kind: 'formato' };
    if (!total && !problem) problem = { kind: 'formato' };
    return { counts: counts, total: total, problem: problem };
  }

  function configHint(element, value) {
    var reading = parse(value);
    var counts = reading.counts;
    if (reading.problem && reading.problem.kind === 'formato') {
      return 'Escribe cada subnivel seguido de sus electrones, separados por espacios: 1s2 2s2 2p6…';
    }
    if (reading.problem && reading.problem.kind === 'repetido' && reading.problem.core) {
      var gas = reading.problem.core.charAt(0).toUpperCase() + reading.problem.core.charAt(1);
      var coreZ = CORES[reading.problem.core];
      var name = element.name.toLowerCase();
      if (coreZ > element.z) {
        return 'El [' + gas + '] tiene ' + coreZ + ' electrones, más que los ' + element.z + ' del ' + name +
          ': usa el gas noble anterior al ' + name + '.';
      }
      if (coreZ === element.z) {
        return 'El [' + gas + '] tiene ' + coreZ + ' electrones, los mismos que el ' + name + ': usa el gas noble anterior.';
      }
      return 'El [' + gas + '] ya incluye el ' + reading.problem.sub + ': después del gas noble escribe sólo lo que sigue.';
    }
    if (reading.problem && reading.problem.kind === 'repetido') {
      return 'El subnivel ' + reading.problem.sub + ' aparece dos veces: cada subnivel se escribe una sola vez.';
    }
    var subs = Object.keys(counts);
    for (var i = 0; i < subs.length; i += 1) {
      var sub = subs[i];
      var level = Number(sub[0]);
      var l = 'spdf'.indexOf(sub[1]);
      if (l >= level) {
        return 'El subnivel ' + sub + ' no existe: el nivel ' + level + ' sólo tiene ' +
          'spdf'.slice(0, Math.min(level, 4)).split('').join(', ') + '.';
      }
      if (ORDER.indexOf(sub) === -1) {
        return 'Ningún elemento llega a llenar el subnivel ' + sub + ': revisa las diagonales.';
      }
      if (counts[sub] > CAPACITY[sub[1]]) {
        return 'En un subnivel ' + sub[1] + ' caben como máximo ' + CAPACITY[sub[1]] + ' electrones.';
      }
    }
    if (reading.total !== element.z) {
      if (/[\[(]\s*(he|ne|ar|kr|xe|rn)\s*[\])]|^\s*(he|ne|ar|kr|xe|rn)\b/i.test(value)) {
        return 'Revisa el gas noble entre corchetes: debe ser el anterior al ' + element.name.toLowerCase() +
          ', el que tiene menos electrones pero está más cerca de Z = ' + element.z + '. Tu configuración suma ' +
          reading.total + ' electrones.';
      }
      return 'Tu configuración suma ' + reading.total + ' electrones, pero el ' + element.name.toLowerCase() +
        ' tiene Z = ' + element.z + '.';
    }
    return 'Sigue las flechas diagonales: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p… Llena por completo cada subnivel antes de pasar al siguiente.';
  }

  function sameConfig(element, value) {
    var reading = parse(value);
    if (reading.problem) return false;
    var expected = {};
    element.info.terms.forEach(function (t) { expected[t.sub] = t.n; });
    var keys = Object.keys(reading.counts).filter(function (k) { return reading.counts[k] > 0; });
    if (keys.length !== Object.keys(expected).length) return false;
    return keys.every(function (k) { return expected[k] === reading.counts[k]; });
  }

  function preview(value) {
    var reading = parse(value);
    if (!String(value || '').trim()) return '';
    if (reading.problem && reading.problem.kind === 'formato') return 'Formato: 1s2 2s2 2p6…';
    var parts = [];
    String(value).toLowerCase()
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) { return String(SUP.indexOf(c)); })
      .replace(/\^/g, '')
      .replace(/^\s*(he|ne|ar|kr|xe|rn)\b/, '[$1]')
      .replace(/[\[(]\s*(he|ne|ar|kr|xe|rn)\s*[\])]|(\d)\s*([spdf])\s*(\d{1,2})/g, function (match, core, level, type, count) {
        parts.push(core ? '[' + core.charAt(0).toUpperCase() + core.charAt(1) + ']' : level + type + sup(count));
        return match;
      });
    return parts.join(' ') + '  ·  suma: ' + reading.total + ' e⁻';
  }

  // Atajo: el gas noble con el que empieza la respuesta, si hay uno.
  function kernelOf(value) {
    var match = String(value || '').match(/^\s*(?:[\[(]\s*)?(he|ne|ar|kr|xe|rn)\b/i);
    return match ? match[1].toLowerCase() : null;
  }

  // Pone [gas] al principio y quita cualquier otro kernel; con gas = null, sólo lo quita.
  function withKernel(value, gas) {
    var rest = String(value || '')
      .replace(/^\s*(he|ne|ar|kr|xe|rn)\b/i, ' ')
      .replace(/[\[(]\s*(he|ne|ar|kr|xe|rn)\s*[\])]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return gas ? '[' + gas + '] ' + rest : rest;
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
  var families = ROMAN.slice(1).map(function (r) { return r + 'A'; });

  ELEMENTS.forEach(function (element) {
    element.info = describe(element);
    byId['config-' + element.id] = element;

    var item = document.createElement('li');
    item.className = 'config-card';
    item.setAttribute('data-item', 'config-' + element.id);
    item.innerHTML =
      '<header class="config-card__head">' +
        '<p class="config-card__element"><span class="config-card__z">' + element.z + '</span>' +
          '<span class="config-card__symbol">' + element.symbol + '</span>' +
          '<span class="config-card__name">' + element.name + '</span></p>' +
        '<span class="config-card__result" data-item-result></span>' +
      '</header>' +
      '<div class="config-card__field config-card__field--config" data-cell>' +
        '<div class="config-card__config-head">' +
          '<label class="config-card__label" for="config-' + element.id + '">Configuración electrónica</label>' +
          '<div class="config-card__kernels" role="group" aria-label="Atajo: empieza con un gas noble">' +
            KERNELS.map(function (gas) {
              return '<button class="config-card__kernel" type="button" aria-pressed="false" data-kernel="' + gas[0] + '" ' +
                'aria-label="' + gas[0] + ', ' + gas[1] + ': ' + gas[2] + ' electrones">[' + gas[0] + ']</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<input class="input config-card__input" id="config-' + element.id + '" name="config-' + element.id + '" type="text" ' +
          'autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="1s2 2s2 …" data-response>' +
        '<p class="config-card__preview" data-config-preview></p>' +
      '</div>' +
      '<div class="config-card__row">' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="periodo-' + element.id + '">Periodo</label>' +
          '<select class="select config-card__select" id="periodo-' + element.id + '" name="periodo-' + element.id + '" data-response></select></div>' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="valencia-' + element.id + '">Valencia</label>' +
          '<select class="select config-card__select" id="valencia-' + element.id + '" name="valencia-' + element.id + '" data-response></select></div>' +
        '<div class="config-card__field" data-cell><label class="config-card__label" for="familia-' + element.id + '">Familia</label>' +
          '<select class="select config-card__select" id="familia-' + element.id + '" name="familia-' + element.id + '" data-response></select></div>' +
      '</div>' +
      '<div class="config-card__feedback" data-item-feedback></div>';
    list.appendChild(item);

    options(item.querySelector('[name="periodo-' + element.id + '"]'), [1, 2, 3, 4, 5, 6, 7]);
    options(item.querySelector('[name="valencia-' + element.id + '"]'), [1, 2, 3, 4, 5, 6, 7, 8]);
    options(item.querySelector('[name="familia-' + element.id + '"]'), families);

    var input = item.querySelector('[name="config-' + element.id + '"]');
    var note = item.querySelector('[data-config-preview]');
    var kernels = Array.prototype.slice.call(item.querySelectorAll('[data-kernel]'));
    var refresh = function () {
      var current = kernelOf(input.value);
      note.textContent = preview(input.value);
      kernels.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-kernel').toLowerCase() === current));
      });
    };
    input.addEventListener('input', refresh);
    input.addEventListener('tercial:reset', refresh);
    // Tocar un gas noble lo pone al principio; tocar el mismo otra vez lo quita.
    kernels.forEach(function (button) {
      button.addEventListener('click', function () {
        var gas = button.getAttribute('data-kernel');
        input.value = withKernel(input.value, kernelOf(input.value) === gas.toLowerCase() ? null : gas);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
    });
    // Al recargar, el motor restaura el valor antes de que exista la vista previa.
    setTimeout(refresh, 0);

    answers['config-' + element.id] = function (value) { return sameConfig(element, value); };
    answers['periodo-' + element.id] = [String(element.info.period)];
    answers['valencia-' + element.id] = [String(element.info.valence)];
    answers['familia-' + element.id] = [element.info.family];
  });

  function termsText(terms) {
    return terms.map(function (t) { return t.sub + sup(t.n); }).join(' ');
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:configuracion-electronica:practica:v1',
    nombres: ['elemento', 'elementos'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var element = byId[id];
      var info = element.info;
      var hints = [];
      if (result.campos['config-' + element.id] === false) {
        hints.push('Configuración: ' + configHint(element, result.valores['config-' + element.id]));
      }
      if (result.campos['periodo-' + element.id] === false) {
        hints.push('Periodo: es el nivel más alto que aparece en la configuración.');
      }
      if (result.campos['valencia-' + element.id] === false) {
        hints.push('Valencia: cuenta sólo los electrones s y p del último nivel' +
          (info.hasInnerD ? '; los d y f no cuentan.' : '.'));
      }
      if (result.campos['familia-' + element.id] === false) {
        hints.push('Familia: en los grupos A, es el número de electrones de valencia en romanos.');
      }
      var valenceText = info.valenceTerms.map(function (t) { return t.sub + sup(t.n); }).join(' + ');
      return {
        pista: hints.join(' · '),
        porque: termsText(info.terms) + (info.short ? ' (abreviada: ' + info.short + ')' : '') +
          '. El nivel más alto es ' + info.period + ', así que está en el periodo ' +
          info.period + '; en ese nivel hay ' + valenceText + ' = ' + info.valence + ' electrones de valencia → familia ' +
          info.family + '. Por niveles: ' + info.levels.join(', ') + '.'
      };
    }
  });
})();
