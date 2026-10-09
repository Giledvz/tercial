(function () {
  'use strict';

  /* Práctica de Cálculos estequiométricos: de moles a moles con los
     coeficientes, de gramos a gramos pasando por los moles y reactivo
     limitante. Problemas propios (la fuente sólo trae el título). Se aceptan
     diferencias pequeñas por redondeo (2 % o 0.005). Masas atómicas:
     H 1, C 12, N 14, O 16, Mg 24, Ca 40. */
  var list = document.querySelector('[data-estequiometria-problemas]');
  if (!list || !window.TercialPractica) return;

  var MASAS = { H: 1, C: 12, N: 14, O: 16, Mg: 24, Ca: 40 };
  function molar(f) {
    var total = 0, re = /([A-Z][a-z]?)(\d*)/g, m;
    while ((m = re.exec(f))) total += MASAS[m[1]] * (m[2] ? Number(m[2]) : 1);
    return total;
  }
  function html(f) { return f.replace(/(\d+)/g, '<sub>$1</sub>'); }

  // moles: de A a B con la razón de coeficientes. gramos: de gramos de A a gramos de B.
  // limitante: con dos reactivos, moles de producto o lo que sobra.
  var PROBLEMS = [
    { id: 'est-01', tipo: 'moles', a: 'H2', ca: 3, b: 'NH3', cb: 2, dato: 6, unidad: 'mol',
      text: 'N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub>. ¿Cuántos moles de NH<sub>3</sub> se forman con 6 mol de H<sub>2</sub>?' },
    { id: 'est-02', tipo: 'moles', a: 'NH3', ca: 2, b: 'N2', cb: 1, dato: 10, unidad: 'mol',
      text: 'Con la misma reacción, ¿cuántos moles de N<sub>2</sub> hacen falta para formar 10 mol de NH<sub>3</sub>?' },
    { id: 'est-03', tipo: 'moles', a: 'H2', ca: 2, b: 'O2', cb: 1, dato: 6, unidad: 'mol',
      text: '2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O. ¿Cuántos moles de O<sub>2</sub> reaccionan con 6 mol de H<sub>2</sub>?' },
    { id: 'est-04', tipo: 'moles', a: 'Zn', ca: 1, b: 'HCl', cb: 2, dato: 0.5, unidad: 'mol',
      text: 'Zn + 2HCl → ZnCl<sub>2</sub> + H<sub>2</sub>. ¿Cuántos moles de HCl se necesitan para 0.5 mol de Zn?' },
    { id: 'est-05', tipo: 'gramos', a: 'CH4', ca: 1, b: 'CO2', cb: 1, dato: 16, unidad: 'g',
      text: 'CH<sub>4</sub> + 2O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O. ¿Cuántos gramos de CO<sub>2</sub> se forman al quemar 16 g de CH<sub>4</sub>?' },
    { id: 'est-06', tipo: 'gramos', a: 'Mg', ca: 2, b: 'MgO', cb: 2, dato: 48, unidad: 'g',
      text: '2Mg + O<sub>2</sub> → 2MgO. ¿Cuántos gramos de MgO se forman con 48 g de magnesio?' },
    { id: 'est-07', tipo: 'gramos', a: 'CaCO3', ca: 1, b: 'CaO', cb: 1, dato: 200, unidad: 'g',
      text: 'CaCO<sub>3</sub> → CaO + CO<sub>2</sub>. ¿Cuántos gramos de cal viva (CaO) salen de 200 g de CaCO<sub>3</sub>?' },
    { id: 'est-08', tipo: 'gramos', a: 'H2O', ca: 2, b: 'O2', cb: 1, dato: 36, unidad: 'g',
      text: '2H<sub>2</sub>O → 2H<sub>2</sub> + O<sub>2</sub>. ¿Cuántos gramos de O<sub>2</sub> salen de 36 g de agua?' },
    { id: 'est-09', tipo: 'producto', unidad: 'mol',
      text: '2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O. Se mezclan 6 mol de H<sub>2</sub> con 4 mol de O<sub>2</sub>. ¿Cuántos moles de agua se forman?' },
    { id: 'est-10', tipo: 'sobra', unidad: 'mol',
      text: 'Con la misma mezcla, ¿cuántos moles de O<sub>2</sub> sobran?' }
  ];
  // Mezcla de los dos últimos: 6 mol de H2 y 4 mol de O2; la receta pide 2 H2 por cada O2.
  var H2 = 6, O2 = 4, USA_O2 = H2 / 2;

  function fmt(n, d) {
    var r = Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
    return r.toLocaleString('es-MX', { maximumFractionDigits: d });
  }
  function parse(value) {
    var text = String(value || '').toLowerCase().replace(/moles|mol|gramos|g\b|\s+/g, '');
    if (!text) return NaN;
    if (/^\d*,\d+$/.test(text)) text = text.replace(',', '.');
    if (!/^\d*\.?\d+$/.test(text)) return NaN;
    return Number(text);
  }
  function close(value, expected) { return Math.abs(value - expected) <= Math.max(.02 * expected, .005); }

  var answers = {}, byId = {};
  var chevron = '<svg class="exercise__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  PROBLEMS.forEach(function (p, i) {
    if (p.tipo === 'moles') p.answer = p.dato * p.cb / p.ca;
    else if (p.tipo === 'gramos') {
      p.Ma = molar(p.a); p.Mb = molar(p.b);
      p.na = p.dato / p.Ma; p.nb = p.na * p.cb / p.ca; p.answer = p.nb * p.Mb;
    } else if (p.tipo === 'producto') p.answer = Math.min(H2, O2 * 2);
    else p.answer = O2 - USA_O2;
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
  function razon(p) { return p.ca + ' mol de ' + html(p.a) + ' con ' + p.cb + ' mol de ' + html(p.b); }

  function hint(p, value) {
    var n = parse(value);
    if (isNaN(n)) return 'Escribe sólo el número, con punto decimal: por ejemplo 0.5.';
    if (p.tipo === 'moles') {
      if (close(n, p.dato)) return 'Falta la razón de la ecuación: van ' + razon(p) + '.';
      if (close(n, p.dato * p.ca / p.cb)) return 'La razón va al revés: van ' + razon(p) + '.';
      return 'Multiplica los moles por la razón de los coeficientes: ' + razon(p) + '.';
    }
    if (p.tipo === 'gramos') {
      if (close(n, p.dato)) return 'Los gramos no pasan directo de una sustancia a otra: primero a moles con la masa molar.';
      if (close(n, p.nb)) return 'Ésos son los moles de ' + html(p.b) + '; multiplícalos por su masa molar (' + p.Mb + ' g/mol).';
      if (close(n, p.dato * p.cb / p.ca)) return 'Los coeficientes cuentan moles, no gramos: pasa primero los gramos a moles.';
      return 'Gramos de ' + html(p.a) + ' → moles (÷ ' + p.Ma + ') → moles de ' + html(p.b) + ' (razón ' + p.ca + ':' + p.cb + ') → gramos (× ' + p.Mb + ').';
    }
    if (p.tipo === 'producto') {
      if (close(n, O2 * 2)) return 'Revisa cuál se acaba primero: 4 mol de O<sub>2</sub> pedirían 8 de H<sub>2</sub> y sólo hay 6.';
      if (close(n, H2 + O2)) return 'No se suman los reactivos: el agua sale de la receta 2 H<sub>2</sub> + 1 O<sub>2</sub> → 2 H<sub>2</sub>O.';
      return 'Busca primero el reactivo limitante: ¿cuánto O<sub>2</sub> pide el H<sub>2</sub> que hay?';
    }
    if (close(n, USA_O2)) return 'Ése es el O<sub>2</sub> que reacciona; lo que sobra es lo que había menos lo que se usó.';
    return 'Los 6 mol de H<sub>2</sub> usan la mitad de oxígeno. Resta eso a los 4 mol que había.';
  }

  function why(p) {
    if (p.tipo === 'moles') return fmt(p.dato, 2) + ' mol × ' + p.cb + '/' + p.ca + ' = ' + fmt(p.answer, 2) + ' mol de ' + html(p.b) + '.';
    if (p.tipo === 'gramos') {
      return fmt(p.dato, 1) + ' g ÷ ' + p.Ma + ' g/mol = ' + fmt(p.na, 3) + ' mol de ' + html(p.a) + '; × ' + p.cb + '/' + p.ca + ' = ' +
        fmt(p.nb, 3) + ' mol de ' + html(p.b) + '; × ' + p.Mb + ' g/mol = ' + fmt(p.answer, 1) + ' g.';
    }
    if (p.tipo === 'producto') return '6 mol de H<sub>2</sub> piden 3 de O<sub>2</sub> y hay 4: el limitante es el H<sub>2</sub>. 6 mol de H<sub>2</sub> forman 6 mol de H<sub>2</sub>O.';
    return 'Reaccionan 3 de los 4 mol de O<sub>2</sub>: sobra 1 mol.';
  }

  window.TercialPractica.init({
    clave: 'tercial:quimica:estequiometria:practica:v1',
    nombres: ['problema', 'problemas'],
    genero: 'm',
    respuestas: answers,
    retro: function (id, result) {
      var p = byId[id];
      return { pista: rich(hint(p, result.valores[id])), porque: rich(why(p)) };
    }
  });
})();
