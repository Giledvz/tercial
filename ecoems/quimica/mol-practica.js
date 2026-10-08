(function () {
  'use strict';

  /* Práctica de Mol y masa molar: los problemas del material fuente
     (QUA-001, pp. 15–16) sin repetir los que aparecen dos veces. Se aceptan
     diferencias pequeñas por redondeo (2 % o 0.005). Masas atómicas del curso:
     H 1, C 12, N 14, O 16, Na 23, S 32, Cl 35.5, Ni 58.7, Zn 65.4, Ag 108.
     La fuente usa NaCl = 58 g/mol; aquí 58.5, y su resultado también entra en
     la tolerancia. */
  var list = document.querySelector('[data-mol-problems]');
  if (!list || !window.TercialPractica) return;

  var AVOGADRO = 6.022e23;
  var FORMULAS = {
    'H₂O': [['H', 2, 1], ['O', 1, 16]],
    'N₂O₃': [['N', 2, 14], ['O', 3, 16]],
    'Ni₂O₃': [['Ni', 2, 58.7], ['O', 3, 16]],
    'Zn': [['Zn', 1, 65.4]],
    'C₁₂H₂₂O₁₁': [['C', 12, 12], ['H', 22, 1], ['O', 11, 16]],
    'AgNO₃': [['Ag', 1, 108], ['N', 1, 14], ['O', 3, 16]],
    'H₂SO₄': [['H', 2, 1], ['S', 1, 32], ['O', 4, 16]],
    'NaCl': [['Na', 1, 23], ['Cl', 1, 35.5]]
  };
  var HTML = { 'H₂O': 'H<sub>2</sub>O', 'N₂O₃': 'N<sub>2</sub>O<sub>3</sub>', 'Ni₂O₃': 'Ni<sub>2</sub>O<sub>3</sub>', 'Zn': 'Zn',
    'C₁₂H₂₂O₁₁': 'C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>', 'AgNO₃': 'AgNO<sub>3</sub>', 'H₂SO₄': 'H<sub>2</sub>SO<sub>4</sub>', 'NaCl': 'NaCl' };

  var PROBLEMS = [
    { id: 'mol-01', kind: 'particulas', amount: 1.65, text: '¿Cuántos moles de átomos de cloro hay en 1.65 × 10<sup>23</sup> átomos de cloro?' },
    { id: 'mol-02', kind: 'gramos', amount: 209.88, formula: 'H₂O', text: '¿Cuántos moles de moléculas de agua (H<sub>2</sub>O) hay en 209.88 g de agua?' },
    { id: 'mol-03', kind: 'gramos', amount: 30, formula: 'N₂O₃', text: '¿Cuántos moles de N<sub>2</sub>O<sub>3</sub> hay en 30 g?' },
    { id: 'mol-04', kind: 'gramos', amount: 30, formula: 'Ni₂O₃', text: '¿Cuántos moles hay en 30 g de Ni<sub>2</sub>O<sub>3</sub>?' },
    { id: 'mol-05', kind: 'gramos', amount: 46.6, formula: 'Zn', text: '¿Cuántos moles hay en 46.6 g de zinc (Zn)?' },
    { id: 'mol-06', kind: 'gramos', amount: 50, formula: 'C₁₂H₂₂O₁₁', text: '¿Cuántos moles hay en 50 g de sacarosa (C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>)?' },
    { id: 'mol-07', kind: 'moles', amount: 4.5, formula: 'C₁₂H₂₂O₁₁', text: '¿Cuántos gramos hay en 4.5 moles de sacarosa (C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>)?' },
    { id: 'mol-08', kind: 'moles', amount: 8.2, formula: 'AgNO₃', text: '¿Cuántos gramos hay en 8.2 moles de nitrato de plata (AgNO<sub>3</sub>)?' },
    { id: 'mol-09', kind: 'moles', amount: 7, formula: 'H₂SO₄', text: '¿Cuántos gramos hay en 7 moles de ácido sulfúrico (H<sub>2</sub>SO<sub>4</sub>)?' },
    { id: 'mol-10', kind: 'moles', amount: 6.3, formula: 'NaCl', text: '¿Cuántos gramos hay en 6.3 moles de cloruro de sodio (NaCl)?' }
  ];

  function fmt(n, digits) {
    var rounded = Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
    return rounded.toLocaleString('es-MX', { maximumFractionDigits: digits });
  }

  function molar(formula) {
    return FORMULAS[formula].reduce(function (sum, part) { return sum + part[1] * part[2]; }, 0);
  }

  function breakdown(formula) {
    return FORMULAS[formula].map(function (part) { return part[0] + ' ' + part[1] + ' × ' + fmt(part[2], 1); }).join(' + ');
  }

  // Lee lo que escribe el alumno: 0.39, 0,39, 1539, 1,539 o «0.39 mol».
  function parse(value) {
    var text = String(value || '').toLowerCase().replace(/moles|mol|gramos|g\b|\s+/g, '');
    if (!text) return NaN;
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) text = text.replace(/,/g, '');
    else if (/^\d*,\d+$/.test(text)) text = text.replace(',', '.');
    if (!/^\d*\.?\d+$/.test(text)) return NaN;
    return Number(text);
  }

  function close(value, expected) {
    return Math.abs(value - expected) <= Math.max(.02 * expected, .005);
  }

  var answers = {};
  var byId = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  PROBLEMS.forEach(function (problem, i) {
    if (problem.kind === 'particulas') {
      problem.answer = problem.amount * 1e23 / AVOGADRO;
      problem.unit = 'mol';
    } else if (problem.kind === 'gramos') {
      problem.M = molar(problem.formula);
      problem.answer = problem.amount / problem.M;
      problem.unit = 'mol';
    } else {
      problem.M = molar(problem.formula);
      problem.answer = problem.amount * problem.M;
      problem.unit = 'g';
    }
    byId[problem.id] = problem;
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', problem.id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + problem.text + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + problem.id + '">Tu resultado</label>' +
      '<div class="exercise__input-row"><input class="input exercise__input" id="' + problem.id + '" name="' + problem.id + '" type="text" ' +
      'inputmode="decimal" autocomplete="off" placeholder="?" data-response><span class="exercise__unit">' + problem.unit + '</span></div></div>';
    list.appendChild(details);
    answers[problem.id] = function (value) {
      var number = parse(value);
      return !isNaN(number) && close(number, problem.answer);
    };
  });

  function rich(html) {
    var span = document.createElement('span');
    span.innerHTML = html;
    return span;
  }

  function hint(problem, value) {
    var number = parse(value);
    if (isNaN(number)) return 'Escribe sólo el número, con punto decimal: por ejemplo 0.25.';
    if (problem.kind === 'particulas') {
      return 'Divide el número de partículas entre 6.022 × 10<sup>23</sup>: las potencias de 10 se cancelan y sólo divides los números de adelante.';
    }
    var name = HTML[problem.formula];
    if (problem.kind === 'gramos') {
      if (close(number, problem.amount * problem.M)) return 'Parece que multiplicaste: para pasar de gramos a moles se divide entre la masa molar.';
      if (close(number, problem.M)) return 'Ese número es la masa molar del ' + name + '; falta dividir los gramos entre ella.';
      return 'Primero calcula la masa molar del ' + name + ' (' + breakdown(problem.formula) + ') y después divide los gramos entre ella.';
    }
    if (close(number, problem.amount / problem.M)) return 'Parece que dividiste: para pasar de moles a gramos se multiplica por la masa molar.';
    if (close(number, problem.M)) return 'Ese número es la masa de un solo mol de ' + name + '; multiplícalo por los moles.';
    return 'Multiplica los moles por la masa molar del ' + name + ' (' + breakdown(problem.formula) + ').';
  }

  function why(problem) {
    if (problem.kind === 'particulas') {
      return problem.amount + ' × 10<sup>23</sup> ÷ 6.022 × 10<sup>23</sup> = ' + fmt(problem.answer, 3) + ' mol.';
    }
    var name = HTML[problem.formula];
    var mass = 'Masa molar del ' + name + ' = ' + breakdown(problem.formula) + ' = ' + fmt(problem.M, 1) + ' g/mol. ';
    if (problem.kind === 'gramos') {
      return mass + fmt(problem.amount, 2) + ' g ÷ ' + fmt(problem.M, 1) + ' g/mol = ' + fmt(problem.answer, 3) + ' mol.';
    }
    return mass + fmt(problem.amount, 2) + ' mol × ' + fmt(problem.M, 1) + ' g/mol = ' + fmt(problem.answer, 1) + ' g.';
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:mol-masa-molar:practica:v1',
    nombres: ['problema', 'problemas'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var problem = byId[id];
      return { pista: rich(hint(problem, result.valores[id])), porque: rich(why(problem)) };
    }
  });
})();
