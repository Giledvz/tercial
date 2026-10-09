(function () {
  'use strict';

  /* Práctica de Balanceo por tanteo: diez ecuaciones de la fuente (p. 30).
     Cada coeficiente es una casilla; se piden los enteros más pequeños,
     escribiendo 1 cuando no hace falta otro número. Si los coeficientes
     cuadran pero se pueden dividir, la pista lo dice. */
  var list = document.querySelector('[data-balanceo-practica]');
  if (!list || !window.TercialPractica) return;

  // [id, reactivos, productos, solución, pista]
  var ITEMS = [
    ['bal-01', ['Al', 'Fe2O3'], ['Al2O3', 'Fe'], [2, 1, 1, 2], 'Empieza por los metales: ¿cuántos aluminios hay en el Al₂O₃? ¿Y hierros en el Fe₂O₃?'],
    ['bal-02', ['Al', 'Cl2'], ['AlCl3'], [2, 3, 2], 'El cloro va de dos en dos y en el producto de tres en tres: busca un número que sea múltiplo de 2 y de 3.'],
    ['bal-03', ['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1], 'El hidrógeno sale de dos en dos como H₂: ¿cuántas moléculas de agua hacen falta?'],
    ['bal-04', ['CaCO3', 'HCl'], ['CaCl2', 'CO2', 'H2O'], [1, 2, 1, 1, 1], 'El CaCl₂ tiene dos cloros. ¿Cuántos HCl hacen falta?'],
    ['bal-05', ['Al', 'H2SO4'], ['Al2(SO4)3', 'H2'], [2, 3, 1, 3], 'Hay 3 grupos SO₄ en el producto: ¿cuántos H₂SO₄ los dan?'],
    ['bal-06', ['Mg(OH)2', 'HCl'], ['MgCl2', 'H2O'], [1, 2, 1, 2], 'Dos cloros en el MgCl₂: dos HCl. Después cuenta oxígenos e hidrógenos.'],
    ['bal-07', ['Mg', 'H2O'], ['Mg(OH)2', 'H2'], [1, 2, 1, 1], 'El Mg(OH)₂ tiene dos oxígenos: ¿cuántas aguas?'],
    ['bal-08', ['Na2SO4', 'BaCl2'], ['BaSO4', 'NaCl'], [1, 1, 1, 2], 'Dos sodios a la izquierda: ¿cuántos NaCl?'],
    ['bal-09', ['KOH', 'H2SO4'], ['H2O', 'K2SO4'], [2, 1, 2, 1], 'Dos potasios en el K₂SO₄: ¿cuántos KOH?'],
    ['bal-10', ['N2', 'H2'], ['NH3'], [1, 3, 2], 'Dos nitrógenos a la izquierda: ¿cuántos NH₃? Después, el hidrógeno.']
  ];

  function atomos(formula) {
    var pila = [{}], re = /([A-Z][a-z]?|\(|\))(\d*)/g, m;
    while ((m = re.exec(formula))) {
      var n = m[2] ? Number(m[2]) : 1;
      if (m[1] === '(') { pila.push({}); continue; }
      if (m[1] === ')') {
        var g = pila.pop();
        Object.keys(g).forEach(function (el) { pila[pila.length - 1][el] = (pila[pila.length - 1][el] || 0) + g[el] * n; });
        continue;
      }
      pila[pila.length - 1][m[1]] = (pila[pila.length - 1][m[1]] || 0) + n;
    }
    return pila[0];
  }
  function sub(f) { return f.replace(/(\d+)/g, '<sub>$1</sub>'); }
  function mcd(a, b) { return b ? mcd(b, a % b) : a; }
  function balanceada(especies, c) {
    var izq = {}, der = {};
    especies.forEach(function (e, i) {
      var lado = e.lado === 'izq' ? izq : der;
      Object.keys(e.atomos).forEach(function (el) { lado[el] = (lado[el] || 0) + e.atomos[el] * c[i]; });
    });
    return Object.keys(izq).concat(Object.keys(der)).every(function (el) { return izq[el] === der[el]; });
  }

  var answers = {}, info = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  ITEMS.forEach(function (item, n) {
    var id = item[0];
    var especies = item[1].map(function (f) { return { f: f, lado: 'izq', atomos: atomos(f) }; })
      .concat(item[2].map(function (f) { return { f: f, lado: 'der', atomos: atomos(f) }; }));
    if (!balanceada(especies, item[3])) throw new Error('La solución de ' + id + ' no balancea');
    info[id] = { especies: especies, solucion: item[3], pista: item[4] };
    var partes = [];
    especies.forEach(function (e, i) {
      if (i > 0) partes.push('<span class="balanceo__signo">' + (especies[i - 1].lado !== e.lado ? '→' : '+') + '</span>');
      var campo = id + '-' + i;
      partes.push('<span class="balanceo__especie"><label class="visually-hidden" for="' + campo + '">Coeficiente de ' + e.f + '</label>' +
        '<input class="input balanceo__coef" id="' + campo + '" name="' + campo + '" type="text" inputmode="numeric" maxlength="2" autocomplete="off" placeholder="?" data-response>' +
        '<span class="balanceo__formula">' + sub(e.f) + '</span></span>');
      answers[campo] = (function (esperado) {
        return function (v) { return String(v).trim() === String(esperado); };
      })(item[3][i]);
    });
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(n + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">Balancea: ' + especies.map(function (e, i) {
        return (i > 0 ? (especies[i - 1].lado !== e.lado ? ' → ' : ' + ') : '') + sub(e.f);
      }).join('') + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><p class="balanceo__ecuacion">' + partes.join('') + '</p></div>';
    list.appendChild(details);
  });

  window.TercialPractica.init({
    clave: 'tercial:quimica:balanceo-tanteo:practica:v1',
    nombres: ['ecuación', 'ecuaciones'],
    genero: 'f',
    respuestas: answers,
    retro: function (id, resultado) {
      var I = info[id];
      var c = I.especies.map(function (e, i) { return Number(String(resultado.valores[id + '-' + i] || '').trim()); });
      if (!resultado.correcto && c.every(function (x) { return x > 0; }) && balanceada(I.especies, c)) {
        var d = c.reduce(function (g, x) { return mcd(g, x); }, 0);
        return { pista: 'Cuadra, pero todos tus coeficientes se pueden dividir entre ' + d + ': usa los enteros más pequeños.' };
      }
      return {
        pista: I.pista,
        porque: 'Coeficientes ' + I.solucion.join(', ') + ': cada elemento tiene los mismos átomos de los dos lados.'
      };
    }
  });
})();
