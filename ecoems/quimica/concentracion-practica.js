(function () {
  'use strict';

  /* Práctica de Concentración de disoluciones: porcentajes, ppm y molaridad.
     Los problemas de molaridad son los de la fuente (QUA-001, pp. 34–35); en el
     del FeCl3 se habla de 1750 mL de disolución (la fuente dice «de agua»). Se
     aceptan diferencias pequeñas por redondeo (2 % o 0.005). Masas atómicas:
     H 1, N 14, O 16, Na 23, S 32, Cl 35.5, Fe 55.8. */
  var list = document.querySelector('[data-concentracion-problemas]');
  if (!list || !window.TercialPractica) return;

  var MASAS = {
    'NaCl': [['Na', 1, 23], ['Cl', 1, 35.5]],
    'NaOH': [['Na', 1, 23], ['O', 1, 16], ['H', 1, 1]],
    'HNO3': [['H', 1, 1], ['N', 1, 14], ['O', 3, 16]],
    'H2SO4': [['H', 2, 1], ['S', 1, 32], ['O', 4, 16]],
    'FeCl3': [['Fe', 1, 55.8], ['Cl', 3, 35.5]]
  };
  function html(f) { return f.replace(/(\d+)/g, '<sub>$1</sub>'); }

  // tipo: pmm, pmv, pvv, ppm (soluto, total) · molaridad (gramos, litros) · gramos (M, litros)
  var PROBLEMS = [
    { id: 'con-01', tipo: 'pmm', soluto: 45.6, total: 500, unidad: '%',
      text: '¿Cuál es el % m/m de una disolución que tiene 45.6 g de soluto en 500 g de disolución?' },
    { id: 'con-02', tipo: 'pmv', soluto: 15, total: 300, unidad: '%',
      text: 'Se disuelven 15 g de glucosa hasta tener 300 mL de disolución. ¿Cuál es su % m/v?' },
    { id: 'con-03', tipo: 'pvv', soluto: 30, total: 250, unidad: '%',
      text: 'Una bebida de 250 mL tiene 30 mL de alcohol. ¿Cuál es su % v/v?' },
    { id: 'con-04', tipo: 'ppm', soluto: 3, total: 2, unidad: 'ppm',
      text: 'En 2 L de agua hay 3 mg de flúor. ¿Cuántas ppm de flúor tiene?' },
    { id: 'con-05', tipo: 'molaridad', gramos: 20, f: 'NaOH', litros: 2, dato: '2 L', unidad: 'M',
      text: '¿Cuál es la molaridad de una disolución que tiene 20 g de NaOH en 2 L de disolución?' },
    { id: 'con-06', tipo: 'molaridad', gramos: 175.35, f: 'NaCl', litros: 6, dato: '6 L', unidad: 'M',
      text: '¿Cuál es la molaridad de una disolución con 175.35 g de NaCl en 6 L de disolución?' },
    { id: 'con-07', tipo: 'gramos', molar: 2.5, f: 'HNO3', litros: 0.2, dato: '200 mL', unidad: 'g',
      text: '¿Cuántos gramos de HNO<sub>3</sub> hay en 200 mL de una disolución 2.5 M?' },
    { id: 'con-08', tipo: 'molaridad', gramos: 10.5, f: 'H2SO4', litros: 2, dato: '2 L', unidad: 'M',
      text: '¿Cuál es la molaridad de 10.5 g de H<sub>2</sub>SO<sub>4</sub> en 2 L de disolución?' },
    { id: 'con-09', tipo: 'gramos', molar: 2.0, f: 'NaOH', litros: 0.75, dato: '750 mL', unidad: 'g',
      text: '¿Cuántos gramos de NaOH hay en 750 mL de una disolución 2.0 M?' },
    { id: 'con-10', tipo: 'molaridad', gramos: 30, f: 'FeCl3', litros: 1.75, dato: '1750 mL', unidad: 'M',
      text: '¿Cuál es la molaridad de 30 g de FeCl<sub>3</sub> en 1750 mL de disolución?' }
  ];

  function molar(f) { return MASAS[f].reduce(function (s, p) { return s + p[1] * p[2]; }, 0); }
  function desglose(f) {
    return MASAS[f].map(function (p) { return (p[1] > 1 ? p[1] + ' × ' : '') + p[2]; }).join(' + ');
  }
  function fmt(n, d) {
    var r = Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
    return r.toLocaleString('es-MX', { maximumFractionDigits: d });
  }
  // Lee 0.25, 0,25, «0.25 M», «12 %» o «1.5 ppm».
  function parse(value) {
    var text = String(value || '').toLowerCase().replace(/mol\/l|ppm|gramos|g\b|m\b|%|\s+/g, '');
    if (!text) return NaN;
    if (/^\d*,\d+$/.test(text)) text = text.replace(',', '.');
    if (!/^\d*\.?\d+$/.test(text)) return NaN;
    return Number(text);
  }
  function close(value, expected) { return Math.abs(value - expected) <= Math.max(.02 * expected, .005); }

  var answers = {}, byId = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  PROBLEMS.forEach(function (p, i) {
    if (p.tipo === 'pmm' || p.tipo === 'pmv' || p.tipo === 'pvv') p.answer = p.soluto / p.total * 100;
    else if (p.tipo === 'ppm') p.answer = p.soluto / p.total;
    else if (p.tipo === 'molaridad') { p.M = molar(p.f); p.moles = p.gramos / p.M; p.answer = p.moles / p.litros; }
    else { p.M = molar(p.f); p.moles = p.molar * p.litros; p.answer = p.moles * p.M; }
    byId[p.id] = p;
    var details = document.createElement('details');
    details.className = 'exercise';
    details.setAttribute('data-item', p.id);
    details.innerHTML = '<summary class="exercise__summary"><span class="exercise__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="exercise__statement"><p class="exercise__text">' + p.text + '</p></div>' + chevron + '</summary>' +
      '<div class="exercise__response"><label class="exercise__response-label" for="' + p.id + '">Tu resultado</label>' +
      '<div class="exercise__input-row"><input class="input exercise__input" id="' + p.id + '" name="' + p.id + '" type="text" ' +
      'inputmode="decimal" autocomplete="off" placeholder="?" data-response><span class="exercise__unit">' + p.unidad + '</span></div></div>';
    list.appendChild(details);
    answers[p.id] = function (value) { var n = parse(value); return !isNaN(n) && close(n, p.answer); };
  });

  function rich(text) { var span = document.createElement('span'); span.innerHTML = text; return span; }

  function hint(p, value) {
    var n = parse(value);
    if (isNaN(n)) return 'Escribe sólo el número, con punto decimal: por ejemplo 0.25.';
    if (p.tipo === 'pmm') {
      if (close(n, p.soluto / (p.soluto + p.total) * 100)) return 'Los 500 g ya son la disolución completa: no les sumes el soluto.';
      if (close(n, p.soluto / p.total)) return 'Falta multiplicar por 100.';
      return '% m/m = masa del soluto ÷ masa de la disolución × 100.';
    }
    if (p.tipo === 'pmv' || p.tipo === 'pvv') {
      if (close(n, p.soluto / p.total)) return 'Falta multiplicar por 100.';
      if (close(n, p.soluto / (p.total - p.soluto) * 100)) return 'Divide entre toda la disolución (' + p.total + ' mL), no sólo entre el disolvente.';
      return (p.tipo === 'pmv' ? '% m/v = gramos de soluto ÷ mL de disolución × 100.' : '% v/v = mL de soluto ÷ mL de disolución × 100.');
    }
    if (p.tipo === 'ppm') {
      if (close(n, p.soluto * p.total)) return 'Se divide: miligramos de soluto entre litros de disolución.';
      return 'ppm = mg de soluto ÷ L de disolución (en agua, 1 L pesa 1 kg).';
    }
    var nombre = html(p.f);
    if (p.tipo === 'molaridad') {
      if (close(n, p.moles)) return 'Ésos son los moles de ' + nombre + '; falta dividirlos entre los litros de disolución.';
      if (close(n, p.moles / (p.litros * 1000))) return 'Usaste mililitros: pasa ' + p.dato + ' a litros antes de dividir.';
      if (close(n, p.gramos / p.litros)) return 'Ésos son gramos por litro: primero pasa los gramos a moles con la masa molar.';
      return 'Primero los moles (gramos ÷ masa molar del ' + nombre + ', ' + desglose(p.f) + ') y luego divide entre los litros.';
    }
    if (close(n, p.moles)) return 'Ésos son los moles; multiplícalos por la masa molar del ' + nombre + '.';
    if (close(n, p.molar * p.litros * 1000 * p.M)) return 'Pasa ' + p.dato + ' a litros: los moles salen de M × litros.';
    return 'Moles = M × litros; después multiplica por la masa molar del ' + nombre + ' (' + desglose(p.f) + ').';
  }

  function why(p) {
    if (p.tipo === 'pmm') return fmt(p.soluto, 1) + ' g ÷ ' + p.total + ' g × 100 = ' + fmt(p.answer, 2) + ' % m/m.';
    if (p.tipo === 'pmv') return p.soluto + ' g ÷ ' + p.total + ' mL × 100 = ' + fmt(p.answer, 2) + ' % m/v.';
    if (p.tipo === 'pvv') return p.soluto + ' mL ÷ ' + p.total + ' mL × 100 = ' + fmt(p.answer, 2) + ' % v/v.';
    if (p.tipo === 'ppm') return p.soluto + ' mg ÷ ' + p.total + ' L = ' + fmt(p.answer, 2) + ' ppm.';
    var masa = 'Masa molar del ' + html(p.f) + ' = ' + desglose(p.f) + ' = ' + fmt(p.M, 1) + ' g/mol. ';
    if (p.tipo === 'molaridad') {
      return masa + fmt(p.gramos, 2) + ' g ÷ ' + fmt(p.M, 1) + ' = ' + fmt(p.moles, 3) + ' mol; ' + fmt(p.moles, 3) + ' mol ÷ ' +
        fmt(p.litros, 3) + ' L = ' + fmt(p.answer, 3) + ' M.';
    }
    return fmt(p.molar, 1) + ' M × ' + fmt(p.litros, 3) + ' L = ' + fmt(p.moles, 3) + ' mol. ' + masa + fmt(p.moles, 3) + ' mol × ' +
      fmt(p.M, 1) + ' g/mol = ' + fmt(p.answer, 1) + ' g.';
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:concentracion:practica:v1',
    nombres: ['problema', 'problemas'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var p = byId[id];
      return { pista: rich(hint(p, result.valores[id])), porque: rich(why(p)) };
    }
  });
})();
