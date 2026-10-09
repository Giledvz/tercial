(function () {
  'use strict';

  /* Balanza de átomos para el balanceo por tanteo. Cada sustancia tiene su
     coeficiente con botones − y +; abajo, cada elemento compara cuántos
     átomos hay a la izquierda y a la derecha. Los elementos se listan en el
     orden del método: metales, no metales, oxígeno e hidrógeno. La pista
     señala el primer elemento que no cuadra, en ese mismo orden. */
  var root = document.querySelector('[data-balanza]');
  if (!root) return;

  var ECUACIONES = {
    alumina: { reactivos: ['Al2O3', 'HCl'], productos: ['AlCl3', 'H2O'], solucion: [1, 6, 2, 3] },
    amoniaco: { reactivos: ['NH3', 'O2'], productos: ['NO', 'H2O'], solucion: [4, 5, 4, 6] },
    fosfato: { reactivos: ['Ca(OH)2', 'H3PO4'], productos: ['Ca3(PO4)2', 'H2O'], solucion: [3, 2, 1, 6] },
    metanol: { reactivos: ['CH3OH', 'O2'], productos: ['CO2', 'H2O'], solucion: [2, 3, 2, 4] }
  };
  var METALES = ['Li', 'Na', 'K', 'Mg', 'Ca', 'Ba', 'Al', 'Fe', 'Cu', 'Zn', 'Ag', 'Pb', 'Ni', 'Sn'];
  var MAX = 12;

  // «Ca3(PO4)2» → { Ca: 3, P: 2, O: 8 }
  function atomos(formula) {
    var pila = [{}];
    var re = /([A-Z][a-z]?|\(|\))(\d*)/g;
    var m;
    while ((m = re.exec(formula))) {
      var n = m[2] ? Number(m[2]) : 1;
      if (m[1] === '(') { pila.push({}); continue; }
      if (m[1] === ')') {
        var grupo = pila.pop();
        Object.keys(grupo).forEach(function (el) { pila[pila.length - 1][el] = (pila[pila.length - 1][el] || 0) + grupo[el] * n; });
        continue;
      }
      pila[pila.length - 1][m[1]] = (pila[pila.length - 1][m[1]] || 0) + n;
    }
    return pila[0];
  }

  function html(formula) {
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
  }

  // Orden del método: metales, no metales (en el orden en que aparecen), O y H.
  function ordenar(elementos) {
    var metales = elementos.filter(function (e) { return METALES.indexOf(e) !== -1; });
    var noMetales = elementos.filter(function (e) { return METALES.indexOf(e) === -1 && e !== 'O' && e !== 'H'; });
    return metales.concat(noMetales, elementos.indexOf('O') !== -1 ? ['O'] : [], elementos.indexOf('H') !== -1 ? ['H'] : []);
  }

  var botones = Array.prototype.slice.call(root.querySelectorAll('[data-ecuacion]'));
  var zonaEcuacion = root.querySelector('[data-balanza-ecuacion]');
  var zonaConteo = root.querySelector('[data-balanza-conteo]');
  var estado = root.querySelector('[data-balanza-estado]');
  var pista = root.querySelector('[data-balanza-pista]');
  var reinicio = root.querySelector('[data-balanza-reinicio]');
  var actual = null, coef = [], especies = [], elementos = [];

  function conteo(lado) {
    var total = {};
    especies.forEach(function (e, i) {
      if (e.lado !== lado) return;
      Object.keys(e.atomos).forEach(function (el) { total[el] = (total[el] || 0) + e.atomos[el] * coef[i]; });
    });
    return total;
  }

  function armar(clave) {
    var E = ECUACIONES[clave];
    actual = clave;
    especies = E.reactivos.map(function (f) { return { formula: f, lado: 'izq', atomos: atomos(f) }; })
      .concat(E.productos.map(function (f) { return { formula: f, lado: 'der', atomos: atomos(f) }; }));
    coef = especies.map(function () { return 1; });
    var todos = [];
    especies.forEach(function (e) { Object.keys(e.atomos).forEach(function (el) { if (todos.indexOf(el) === -1) todos.push(el); }); });
    elementos = ordenar(todos);
    // Comprobación: la solución guardada sí balancea la ecuación.
    var izq = {}, der = {};
    especies.forEach(function (e, i) {
      var lado = e.lado === 'izq' ? izq : der;
      Object.keys(e.atomos).forEach(function (el) { lado[el] = (lado[el] || 0) + e.atomos[el] * E.solucion[i]; });
    });
    elementos.forEach(function (el) { if (izq[el] !== der[el]) throw new Error('La solución de ' + clave + ' no balancea ' + el); });

    zonaEcuacion.innerHTML = '';
    especies.forEach(function (e, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'balanza__signo';
        sep.textContent = especies[i - 1].lado !== e.lado ? '→' : '+';
        zonaEcuacion.appendChild(sep);
      }
      var caja = document.createElement('span');
      caja.className = 'balanza__especie';
      caja.innerHTML =
        '<span class="balanza__paso" role="group" aria-label="Coeficiente de ' + e.formula + '">' +
          '<button class="balanza__boton" type="button" data-menos="' + i + '" aria-label="Quitar uno a ' + e.formula + '">−</button>' +
          '<output class="balanza__coef" data-coef="' + i + '" aria-live="polite">1</output>' +
          '<button class="balanza__boton" type="button" data-mas="' + i + '" aria-label="Sumar uno a ' + e.formula + '">+</button>' +
        '</span>' +
        '<span class="balanza__formula">' + html(e.formula) + '</span>';
      zonaEcuacion.appendChild(caja);
    });

    zonaConteo.innerHTML = '';
    elementos.forEach(function (el) {
      var fila = document.createElement('div');
      fila.className = 'balanza__fila';
      fila.setAttribute('data-elemento', el);
      fila.innerHTML =
        '<span class="balanza__simbolo">' + el + '</span>' +
        '<span class="balanza__barra balanza__barra--izq"><i></i><b></b></span>' +
        '<span class="balanza__barra balanza__barra--der"><i></i><b></b></span>' +
        '<span class="balanza__marca" aria-hidden="true"></span>';
      zonaConteo.appendChild(fila);
    });
    pista.textContent = '';
    actualizar();
  }

  function actualizar() {
    var izq = conteo('izq'), der = conteo('der');
    var maximo = 1;
    elementos.forEach(function (el) { maximo = Math.max(maximo, izq[el] || 0, der[el] || 0); });
    var faltan = [];
    elementos.forEach(function (el) {
      var fila = zonaConteo.querySelector('[data-elemento="' + el + '"]');
      var a = izq[el] || 0, b = der[el] || 0;
      [['izq', a], ['der', b]].forEach(function (par) {
        var barra = fila.querySelector('.balanza__barra--' + par[0]);
        barra.querySelector('i').style.width = (100 * par[1] / maximo) + '%';
        barra.querySelector('b').textContent = par[1];
      });
      var igual = a === b;
      fila.classList.toggle('es-igual', igual);
      fila.querySelector('.balanza__marca').textContent = igual ? '✓' : '≠';
      if (!igual) faltan.push(el);
    });
    coef.forEach(function (c, i) {
      root.querySelector('[data-coef="' + i + '"]').textContent = c;
      root.querySelector('[data-menos="' + i + '"]').disabled = c <= 1;
      root.querySelector('[data-mas="' + i + '"]').disabled = c >= MAX;
    });
    // Balanceada sólo con los coeficientes más pequeños posibles.
    var divisor = coef.reduce(function (g, c) { return mcd(g, c); }, 0);
    if (!faltan.length && divisor === 1) {
      estado.innerHTML = '<strong>Balanceada.</strong> Coeficientes ' + coef.join(', ') + '.';
      root.classList.add('es-balanceada');
    } else if (!faltan.length) {
      estado.innerHTML = 'Cuadra, pero todos los coeficientes se pueden dividir entre ' + divisor + ': usa los más pequeños.';
      root.classList.remove('es-balanceada');
    } else {
      estado.textContent = 'No cuadran: ' + faltan.join(', ') + '.';
      root.classList.remove('es-balanceada');
    }
  }

  function mcd(a, b) { return b ? mcd(b, a % b) : a; }

  zonaEcuacion.addEventListener('click', function (event) {
    var b = event.target.closest('button');
    if (!b) return;
    var i = Number(b.getAttribute('data-menos') !== null ? b.getAttribute('data-menos') : b.getAttribute('data-mas'));
    coef[i] = Math.max(1, Math.min(MAX, coef[i] + (b.hasAttribute('data-mas') ? 1 : -1)));
    pista.textContent = '';
    actualizar();
  });

  root.querySelector('[data-balanza-pide-pista]').addEventListener('click', function () {
    var izq = conteo('izq'), der = conteo('der');
    var el = elementos.find(function (e) { return (izq[e] || 0) !== (der[e] || 0); });
    if (!el) { pista.textContent = 'Todo cuadra. Revisa que sean los coeficientes más pequeños.'; return; }
    var tipo = METALES.indexOf(el) !== -1 ? 'metal' : el === 'O' ? 'oxígeno' : el === 'H' ? 'hidrógeno' : 'no metal';
    pista.textContent = 'Sigue el orden metales, no metales, oxígeno e hidrógeno: ahora toca el ' + el + ' (' + tipo +
      '). Hay ' + (izq[el] || 0) + ' a la izquierda y ' + (der[el] || 0) + ' a la derecha.';
  });

  reinicio.addEventListener('click', function () {
    coef = coef.map(function () { return 1; });
    pista.textContent = '';
    actualizar();
  });

  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      botones.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      armar(b.getAttribute('data-ecuacion'));
    });
  });
  var inicial = botones.find(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
  armar(inicial ? inicial.getAttribute('data-ecuacion') : 'alumina');
})();
