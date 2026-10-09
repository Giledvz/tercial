(function () {
  'use strict';

  /* Balanceo redox paso a paso. Cada ecuación recorre los siete pasos de la
     fuente: números de oxidación, quién cambia, semirreacciones, electrones,
     igualar, regresar coeficientes y terminar por tanteo. Los números de
     oxidación van encima de cada símbolo; el que se oxida va en terracota y el
     que se reduce en tinta fuerte. Al cargar se comprueba que la ecuación final
     esté balanceada y que los electrones perdidos sean los ganados. En las semirreacciones también se
     escriben números de oxidación (+3, −1), no cargas de iones: no existe un
     ion N⁵⁺. */
  var root = document.querySelector('[data-redox]');
  if (!root) return;

  var ECUACIONES = {
    hierro: {
      especies: [
        { f: 'Fe2O3', ox: { Fe: 3, O: -2 }, lado: 'izq' }, { f: 'CO', ox: { C: 2, O: -2 }, lado: 'izq' },
        { f: 'Fe', ox: { Fe: 0 }, lado: 'der' }, { f: 'CO2', ox: { C: 4, O: -2 }, lado: 'der' }],
      final: [1, 3, 2, 3],
      cambia: { Fe: 'reduce', C: 'oxida' },
      pasos: [
        'Cada símbolo lleva su número de oxidación: el oxígeno vale −2 y la suma de cada compuesto es 0.',
        'Cambian dos: el <span class="redox__reduce">Fe baja de +3 a 0</span> (se reduce) y el <span class="redox__oxida">C sube de +2 a +4</span> (se oxida).',
        '<span class="redox__semi">Fe<sup>+3</sup> + 3e<sup>−</sup> → Fe<sup>0</sup></span><span class="redox__semi">C<sup>+2</sup> → C<sup>+4</sup> + 2e<sup>−</sup></span>',
        'Cada Fe gana 3 electrones y cada C pierde 2. Pero el Fe<sub>2</sub>O<sub>3</sub> trae dos hierros: gana 6 electrones.',
        'Para que los electrones perdidos sean los ganados, el carbono va por 3: <span class="redox__semi">2Fe<sup>+3</sup> + 6e<sup>−</sup> → 2Fe<sup>0</sup></span><span class="redox__semi">3C<sup>+2</sup> → 3C<sup>+4</sup> + 6e<sup>−</sup></span>',
        'Los coeficientes regresan a la ecuación: 1 Fe<sub>2</sub>O<sub>3</sub>, 2 Fe, 3 CO y 3 CO<sub>2</sub>.',
        'Se comprueba el oxígeno: 3 + 3 = 6 a la izquierda y 3 × 2 = 6 a la derecha. Ya está balanceada.'
      ]
    },
    cobre: {
      especies: [
        { f: 'Cu', ox: { Cu: 0 }, lado: 'izq' }, { f: 'HNO3', ox: { H: 1, N: 5, O: -2 }, lado: 'izq' },
        { f: 'Cu(NO3)2', ox: { Cu: 2, N: 5, O: -2 }, lado: 'der' }, { f: 'NO2', ox: { N: 4, O: -2 }, lado: 'der' },
        { f: 'H2O', ox: { H: 1, O: -2 }, lado: 'der' }],
      final: [1, 4, 1, 2, 2],
      cambia: { Cu: 'oxida', N: 'reduce' },
      soloEn: { N: ['NO2'] },
      pasos: [
        'Números de oxidación: H +1, O −2. En el HNO<sub>3</sub>, 1 + N − 6 = 0, así que N = +5.',
        'El <span class="redox__oxida">Cu sube de 0 a +2</span> y el <span class="redox__reduce">N baja de +5 a +4</span>, pero sólo el que termina en el NO<sub>2</sub>: el del nitrato sigue en +5.',
        '<span class="redox__semi">Cu<sup>0</sup> → Cu<sup>+2</sup> + 2e<sup>−</sup></span><span class="redox__semi">N<sup>+5</sup> + 1e<sup>−</sup> → N<sup>+4</sup></span>',
        'El cobre pierde 2 electrones; cada nitrógeno gana 1.',
        'La reducción va por 2: <span class="redox__semi">2N<sup>+5</sup> + 2e<sup>−</sup> → 2N<sup>+4</sup></span>Así se pierden 2 y se ganan 2.',
        'Coeficientes: 1 Cu, 1 Cu(NO<sub>3</sub>)<sub>2</sub> y 2 NO<sub>2</sub>.',
        'Por tanteo: a la derecha hay 2 + 2 = 4 nitrógenos, así que 4 HNO<sub>3</sub>; con 4 hidrógenos salen 2 H<sub>2</sub>O. Oxígenos: 12 de cada lado.'
      ]
    },
    permanganato: {
      especies: [
        { f: 'KMnO4', ox: { K: 1, Mn: 7, O: -2 }, lado: 'izq' }, { f: 'HCl', ox: { H: 1, Cl: -1 }, lado: 'izq' },
        { f: 'MnCl2', ox: { Mn: 2, Cl: -1 }, lado: 'der' }, { f: 'Cl2', ox: { Cl: 0 }, lado: 'der' },
        { f: 'H2O', ox: { H: 1, O: -2 }, lado: 'der' }, { f: 'KCl', ox: { K: 1, Cl: -1 }, lado: 'der' }],
      final: [2, 16, 2, 5, 8, 2],
      cambia: { Mn: 'reduce', Cl: 'oxida' },
      soloEn: { Cl: ['Cl2'] },
      pasos: [
        'En el KMnO<sub>4</sub>: 1 + Mn − 8 = 0, así que Mn = +7. El cloro del HCl vale −1 y el del Cl<sub>2</sub>, 0.',
        'El <span class="redox__reduce">Mn baja de +7 a +2</span> y el <span class="redox__oxida">Cl sube de −1 a 0</span>, sólo el que forma Cl<sub>2</sub>.',
        '<span class="redox__semi">Mn<sup>+7</sup> + 5e<sup>−</sup> → Mn<sup>+2</sup></span><span class="redox__semi">2Cl<sup>−1</sup> → Cl<sub>2</sub><sup>0</sup> + 2e<sup>−</sup></span>',
        'El manganeso gana 5 electrones; cada Cl<sub>2</sub> se forma perdiendo 2.',
        'El mínimo común múltiplo de 5 y 2 es 10: el Mn va por 2 y el cloro por 5. <span class="redox__semi">2Mn<sup>+7</sup> + 10e<sup>−</sup> → 2Mn<sup>+2</sup></span><span class="redox__semi">10Cl<sup>−1</sup> → 5Cl<sub>2</sub><sup>0</sup> + 10e<sup>−</sup></span>',
        'Coeficientes: 2 KMnO<sub>4</sub>, 2 MnCl<sub>2</sub> y 5 Cl<sub>2</sub>.',
        'Por tanteo: 2 K piden 2 KCl. Cloros a la derecha: 4 + 10 + 2 = 16, así que 16 HCl. Con 16 H salen 8 H<sub>2</sub>O, y los oxígenos quedan 8 y 8.'
      ]
    }
  };
  var NOMBRES = ['Números de oxidación', 'Quién cambia', 'Semirreacciones', 'Electrones', 'Igualar electrones', 'Regresar coeficientes', 'Terminar por tanteo'];

  function partes(formula) {
    var out = [], re = /([A-Z][a-z]?|\(|\))(\d*)/g, m;
    while ((m = re.exec(formula))) out.push({ s: m[1], n: m[2] });
    return out;
  }
  function atomos(formula) {
    var pila = [{}];
    partes(formula).forEach(function (p) {
      var n = p.n ? Number(p.n) : 1;
      if (p.s === '(') { pila.push({}); return; }
      if (p.s === ')') {
        var g = pila.pop();
        Object.keys(g).forEach(function (el) { pila[pila.length - 1][el] = (pila[pila.length - 1][el] || 0) + g[el] * n; });
        return;
      }
      pila[pila.length - 1][p.s] = (pila[pila.length - 1][p.s] || 0) + n;
    });
    return pila[0];
  }
  function signo(n) { return n > 0 ? '+' + n : n < 0 ? '−' + (-n) : '0'; }

  // Comprobaciones: balance de átomos y de electrones con los coeficientes finales.
  Object.keys(ECUACIONES).forEach(function (clave) {
    var E = ECUACIONES[clave], izq = {}, der = {}, carga = 0;
    E.especies.forEach(function (e, i) {
      var a = atomos(e.f), lado = e.lado === 'izq' ? izq : der;
      Object.keys(a).forEach(function (el) {
        lado[el] = (lado[el] || 0) + a[el] * E.final[i];
        carga += (e.lado === 'izq' ? 1 : -1) * a[el] * E.final[i] * e.ox[el];
      });
      var suma = Object.keys(a).reduce(function (s, el) { return s + a[el] * e.ox[el]; }, 0);
      if (suma !== 0) throw new Error('Los números de oxidación de ' + e.f + ' no suman 0');
    });
    Object.keys(izq).forEach(function (el) { if (izq[el] !== der[el]) throw new Error(clave + ': no balancea ' + el); });
    if (carga !== 0) throw new Error(clave + ': las cargas no se conservan');
  });

  function ecuacionHTML(E, paso) {
    return E.especies.map(function (e, i) {
      var signoEntre = i === 0 ? '' : '<span class="redox__signo">' + (E.especies[i - 1].lado !== e.lado ? '→' : '+') + '</span>';
      var coef = paso >= 5 ? E.final[i] : null;
      var mostrarCoef = coef !== null && (paso >= 6 || cambiaEn(E, e)) ? '<span class="redox__coef">' + coef + '</span>' : '';
      var cuerpo = partes(e.f).map(function (p) {
        if (p.s === '(' || p.s === ')') return '<span class="redox__paren">' + p.s + '</span>' + (p.n ? '<sub>' + p.n + '</sub>' : '');
        var tipo = E.cambia[p.s] && (!E.soloEn || !E.soloEn[p.s] || E.soloEn[p.s].indexOf(e.f) !== -1 || (e.lado === 'izq')) ? E.cambia[p.s] : null;
        var clase = paso >= 1 && tipo ? ' redox__ox--' + tipo : '';
        return '<span class="redox__atomo"><span class="redox__ox' + clase + '">' + signo(e.ox[p.s]) + '</span>' + p.s + '</span>' + (p.n ? '<sub>' + p.n + '</sub>' : '');
      }).join('');
      return signoEntre + '<span class="redox__especie">' + mostrarCoef + cuerpo + '</span>';
    }).join('');
  }

  // En el paso 6 sólo aparecen los coeficientes de las sustancias con átomos que cambian.
  function cambiaEn(E, e) {
    return Object.keys(E.cambia).some(function (el) {
      if (!(el in e.ox)) return false;
      if (E.soloEn && E.soloEn[el] && e.lado === 'der') return E.soloEn[el].indexOf(e.f) !== -1;
      if (E.soloEn && E.soloEn[el] && e.lado === 'izq') return false;
      return true;
    });
  }

  var botones = Array.prototype.slice.call(root.querySelectorAll('[data-redox-ecuacion]'));
  var zonaEc = root.querySelector('[data-redox-vista]');
  var zonaTexto = root.querySelector('[data-redox-texto]');
  var zonaPaso = root.querySelector('[data-redox-paso]');
  var anterior = root.querySelector('[data-redox-anterior]');
  var siguiente = root.querySelector('[data-redox-siguiente]');
  var clave = null, paso = 0;

  function pintar() {
    var E = ECUACIONES[clave];
    zonaEc.innerHTML = ecuacionHTML(E, paso);
    zonaPaso.textContent = 'Paso ' + (paso + 1) + ' de 7 · ' + NOMBRES[paso];
    zonaTexto.innerHTML = E.pasos[paso];
    anterior.disabled = paso === 0;
    siguiente.disabled = paso === 6;
    root.classList.toggle('es-final', paso === 6);
  }

  anterior.addEventListener('click', function () { paso = Math.max(0, paso - 1); pintar(); });
  siguiente.addEventListener('click', function () { paso = Math.min(6, paso + 1); pintar(); });
  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      botones.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      clave = b.getAttribute('data-redox-ecuacion');
      paso = 0;
      pintar();
    });
  });
  var inicial = botones.find(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
  clave = inicial ? inicial.getAttribute('data-redox-ecuacion') : 'hierro';
  pintar();
})();
