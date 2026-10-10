/* Escenas de «Despejes en fórmulas físicas». Mismo contrato que las de Física y
   Matemáticas: cada escena es { update(dt), still() }; el reloj compartido sólo avanza
   las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final.

   ---------------- El mismo despeje, con números y con letras ----------------
   Dos renglones hacen los mismos movimientos: arriba una ecuación de las de ayer
   (12 = 3x) y abajo la fórmula de física (d = v·t). Cada paso:
   - si la letra está a la derecha, la igualdad se voltea: cada lado se levanta (uno
     por arriba y otro por abajo del igual), se cruza y baja en su lugar;
   - si no, primero se abre espacio, luego aparece la operación en los dos lados, en el
     color del nivel; lo que se cancela se tacha y se desvanece, y sólo entonces lo que
     queda se acomoda. Nada pasa por encima de nada;
   - con números, al final se hace la cuenta (12/3 → 4); con letras no hay cuenta: la
     respuesta es una fórmula.
   A la derecha queda la lista de los pasos, alineada entre los dos renglones.
   Las fichas se miden con la letra real (getComputedTextLength); si la escena está
   oculta (en la tele, otra pantalla), se miden al llegar a la suya. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}
function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------- Medidas (unidades del viewBox) ---------- */
const W = 480, H = 214;
const FS = 22;                         // letra de las ecuaciones
const EJE = 0.27 * FS;                 // el eje de la fracción y del igual, sobre el renglón
const SUBE_NUM = 0.32 * FS;            // renglón del numerador, sobre el eje
const BAJA_DEN = 0.98 * FS;            // renglón del denominador, bajo el eje
const MARGEN_RAYA = 0.12 * FS;
const RENGLON = [86, 176];             // renglón de cada ecuación: números y letras
const ETIQUETA = [42, 134];
const DIVISOR = 116;
const PIE = 18;

// Tinta aproximada de cada carácter (arriba y abajo del renglón, en FS): para los arcos
// del volteo, las tachas y la prueba de que nada se encima.
function tinta(ch) {
  if (/[0-9]/.test(ch)) return [0.71, 0];
  if (/[A-Z]/.test(ch)) return [0.7, 0];
  if (/[bdfhklt]/.test(ch)) return [ch === 't' ? 0.63 : 0.74, 0];
  if (ch === '+') return [0.55, -0.02];
  if (ch === MENOS) return [0.33, -0.22];
  if (ch === '=') return [0.42, -0.12];
  if (ch === '·') return [0.33, -0.22];
  return [0.49, 0];
}

/* ---------- Fichas de una ecuación ----------
   s: letra o número · o: signo con aire (+, −) · p: punto de multiplicar · fr: fracción.
   nuevo(): lo que aparece con la operación (en el color del nivel hasta que se absorbe). */
const s = (id, txt, sub) => ({ id, txt, sub, tipo: 'sym' });
const o = (id, txt) => ({ id, txt, tipo: 'op' });
const p = id => ({ id, txt: '·', tipo: 'dot' });
const fr = (id, num, den, extra) => ({ id, frac: true, num, den, ...(extra || {}) });
const nuevo = item => ({ ...item, nuevo: true });

const CASOS = {
  mru: {
    letra: ['x', 'v'],
    inicio: 'el mismo despeje, con números y con letras',
    final: 't multiplicaba a v; ahora la divide',
    pasos: [
      { texto: 'Voltea la igualdad: se lee igual al revés', chips: [[['voltea']], [['voltea']]] },
      { texto: 'Divide los dos lados entre lo que multiplica', chips: [[['÷ 3']], [['÷ t']]] }
    ],
    filas: [
      { // 12 = 3x
        inicial: { izq: [s('n12', '12')], der: [s('n3', '3'), s('x', 'x')] },
        pasos: [
          [{ tipo: 'voltea', a: { izq: [s('n3', '3'), s('x', 'x')], der: [s('n12', '12')] } }],
          [{ tipo: 'op', a: { izq: [fr('b1', [s('n3', '3'), s('x', 'x')], [nuevo(s('d1', '3'))], { nuevo: true })], der: [fr('b2', [s('n12', '12')], [nuevo(s('d2', '3'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['n3', 'd1'], a: { izq: [s('x', 'x')], der: [fr('b2', [s('n12', '12')], [s('d2', '3')])] } },
            { tipo: 'calcula', a: { izq: [s('x', 'x')], der: [s('n4', '4')] } }]
        ]
      },
      { // d = v·t
        inicial: { izq: [s('d', 'd')], der: [s('v', 'v'), p('p1'), s('t', 't')] },
        pasos: [
          [{ tipo: 'voltea', a: { izq: [s('v', 'v'), p('p1'), s('t', 't')], der: [s('d', 'd')] } }],
          [{ tipo: 'op', a: { izq: [fr('B1', [s('v', 'v'), p('p1'), s('t', 't')], [nuevo(s('t2', 't'))], { nuevo: true })], der: [fr('B2', [s('d', 'd')], [nuevo(s('t3', 't'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['t', 't2'], a: { izq: [s('v', 'v')], der: [fr('B2', [s('d', 'd')], [s('t3', 't')])] } }]
        ]
      }
    ]
  },
  presion: {
    letra: ['x', 'A'],
    inicio: 'la letra que buscas está abajo, dividiendo',
    final: 'A estaba abajo: primero subió y luego quedó sola',
    pasos: [
      { texto: 'Multiplica los dos lados por lo que divide', chips: [[['× x']], [['× A']]] },
      { texto: 'Divide los dos lados entre lo que multiplica', chips: [[['÷ 4']], [['÷ P']]] }
    ],
    filas: [
      { // 4 = 20/x
        inicial: { izq: [s('n4', '4')], der: [fr('b1', [s('n20', '20')], [s('x', 'x')])] },
        pasos: [
          [{ tipo: 'op', a: { izq: [s('n4', '4'), nuevo(s('x2', 'x'))], der: [fr('b1', [s('n20', '20')], [s('x', 'x')]), nuevo(p('pp')), nuevo(s('x3', 'x'))] } },
            { tipo: 'combina', tacha: ['x', 'x3'], a: { izq: [s('n4', '4'), s('x2', 'x')], der: [s('n20', '20')] } }],
          [{ tipo: 'op', a: { izq: [fr('b2', [s('n4', '4'), s('x2', 'x')], [nuevo(s('d4', '4'))], { nuevo: true })], der: [fr('b3', [s('n20', '20')], [nuevo(s('d5', '4'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['n4', 'd4'], a: { izq: [s('x2', 'x')], der: [fr('b3', [s('n20', '20')], [s('d5', '4')])] } },
            { tipo: 'calcula', a: { izq: [s('x2', 'x')], der: [s('n5', '5')] } }]
        ]
      },
      { // P = F/A
        inicial: { izq: [s('P', 'P')], der: [fr('B1', [s('F', 'F')], [s('A', 'A')])] },
        pasos: [
          [{ tipo: 'op', a: { izq: [s('P', 'P'), nuevo(p('q1')), nuevo(s('A2', 'A'))], der: [fr('B1', [s('F', 'F')], [s('A', 'A')]), nuevo(p('q2')), nuevo(s('A3', 'A'))] } },
            { tipo: 'combina', tacha: ['A', 'A3'], a: { izq: [s('P', 'P'), p('q1'), s('A2', 'A')], der: [s('F', 'F')] } }],
          [{ tipo: 'op', a: { izq: [fr('B2', [s('P', 'P'), p('q1'), s('A2', 'A')], [nuevo(s('P2', 'P'))], { nuevo: true })], der: [fr('B3', [s('F', 'F')], [nuevo(s('P3', 'P'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['P', 'P2'], a: { izq: [s('A2', 'A')], der: [fr('B3', [s('F', 'F')], [s('P3', 'P')])] } }]
        ]
      }
    ]
  },
  mrua: {
    letra: ['x', 't'],
    inicio: 'dos operaciones: se deshacen en orden inverso',
    final: 'se deshizo al revés: primero la suma, luego el producto',
    pasos: [
      { texto: 'Voltea la igualdad: se lee igual al revés', chips: [[['voltea']], [['voltea']]] },
      { texto: 'Primero resta lo que suma, en los dos lados', chips: [[['− 6']], [['− v', '0']]] },
      { texto: 'Luego divide los dos lados entre lo que multiplica', chips: [[['÷ 4']], [['÷ a']]] }
    ],
    filas: [
      { // 26 = 6 + 4x
        inicial: { izq: [s('n26', '26')], der: [s('n6', '6'), o('mas', '+'), s('n4', '4'), s('x', 'x')] },
        pasos: [
          [{ tipo: 'voltea', a: { izq: [s('n6', '6'), o('mas', '+'), s('n4', '4'), s('x', 'x')], der: [s('n26', '26')] } }],
          [{ tipo: 'op', a: { izq: [s('n6', '6'), o('mas', '+'), s('n4', '4'), s('x', 'x'), nuevo(o('m1', MENOS)), nuevo(s('n6b', '6'))], der: [s('n26', '26'), nuevo(o('m2', MENOS)), nuevo(s('n6c', '6'))] } },
            { tipo: 'combina', tacha: ['n6', 'n6b'], a: { izq: [s('n4', '4'), s('x', 'x')], der: [s('n26', '26'), o('m2', MENOS), s('n6c', '6')] } },
            { tipo: 'calcula', a: { izq: [s('n4', '4'), s('x', 'x')], der: [s('n20', '20')] } }],
          [{ tipo: 'op', a: { izq: [fr('b1', [s('n4', '4'), s('x', 'x')], [nuevo(s('d4', '4'))], { nuevo: true })], der: [fr('b2', [s('n20', '20')], [nuevo(s('d5', '4'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['n4', 'd4'], a: { izq: [s('x', 'x')], der: [fr('b2', [s('n20', '20')], [s('d5', '4')])] } },
            { tipo: 'calcula', a: { izq: [s('x', 'x')], der: [s('n5', '5')] } }]
        ]
      },
      { // v = v₀ + a·t
        inicial: { izq: [s('v', 'v')], der: [s('v0', 'v', '0'), o('mas', '+'), s('a', 'a'), p('p1'), s('t', 't')] },
        pasos: [
          [{ tipo: 'voltea', a: { izq: [s('v0', 'v', '0'), o('mas', '+'), s('a', 'a'), p('p1'), s('t', 't')], der: [s('v', 'v')] } }],
          [{ tipo: 'op', a: { izq: [s('v0', 'v', '0'), o('mas', '+'), s('a', 'a'), p('p1'), s('t', 't'), nuevo(o('m1', MENOS)), nuevo(s('v0b', 'v', '0'))], der: [s('v', 'v'), nuevo(o('m2', MENOS)), nuevo(s('v0c', 'v', '0'))] } },
            { tipo: 'combina', tacha: ['v0', 'v0b'], a: { izq: [s('a', 'a'), p('p1'), s('t', 't')], der: [s('v', 'v'), o('m2', MENOS), s('v0c', 'v', '0')] } }],
          [{ tipo: 'op', a: { izq: [fr('B1', [s('a', 'a'), p('p1'), s('t', 't')], [nuevo(s('a2', 'a'))], { nuevo: true })], der: [fr('B2', [s('v', 'v'), o('m2', MENOS), s('v0c', 'v', '0')], [nuevo(s('a3', 'a'))], { nuevo: true })] } },
            { tipo: 'combina', tacha: ['a', 'a2'], a: { izq: [s('t', 't')], der: [fr('B2', [s('v', 'v'), o('m2', MENOS), s('v0c', 'v', '0')], [s('a3', 'a')])] } }]
        ]
      }
    ]
  }
};

/* ---------- Ritmo (segundos) ----------
   Una pausa al empezar y entre pasos; el renglón de letras sigue al de números con un
   pequeño retraso. Con tres pasos todo va un poco más ágil. */
const T = { inicio: 0.8, mueve: 0.65, aparece: 0.7, lee: 0.8, tacha: 0.45, desvanece: 0.4, acomoda: 0.65,
  sale: 0.3, entra: 0.4, voltea: 1.6, retraso: 0.4, chip: 0.4, entrePasos: 0.9, final: 0.6, pie: 0.25 };

function despejes(svg) {
  const root = svg.closest('[data-despejes]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-despejes-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  // Fijo: el pie con el paso, la etiqueta de cada renglón y la raya que los separa.
  const pie = make('text', { x: 12, y: PIE, class: 'despeje__pie' }, svg);
  const pieNum = make('tspan', { class: 'despeje__paso' }, pie);
  const pieTexto = make('tspan', { dx: 8 }, pie);
  make('path', { d: `M12 ${DIVISOR}H${W - 12}`, class: 'despeje__divisor' }, svg);
  const etiquetas = ETIQUETA.map((y, i) => {
    const t = make('text', { x: 12, y, class: 'despeje__etiqueta' }, svg);
    t.textContent = i === 0 ? 'Con números · despeja ' : 'Con letras · despeja ';
    return make('tspan', { class: 'despeje__etiqueta-letra' }, t);
  });
  const capa = make('g', {}, svg);

  let clave = null, caso = null, t = 0, linea = null, pendiente = false, congelada = false;
  let fichas = {}, rayas = {}, chips = [];

  /* Mide una ficha con la letra real: su ancho y su tinta. */
  function creaFicha(item, fila) {
    const id = fila + ':' + item.id;
    if (fichas[id]) return fichas[id];
    const g = make('g', {}, capa);
    const texto = make('text', { class: 'despeje__ficha despeje__ficha--' + (fila === 0 ? 'numeros' : 'letras') }, g);
    texto.appendChild(document.createTextNode(item.txt));
    if (item.sub) {
      const sub = make('tspan', { class: 'despeje__sub', dy: 0.24 * FS }, texto);
      sub.textContent = item.sub;
    }
    const tacha = make('path', { class: 'despeje__tacha' }, g);
    const chars = [...item.txt];
    const arriba = Math.max(...chars.map(c => tinta(c)[0])) * FS;
    const abajo = (item.sub ? 0.26 : Math.max(...chars.map(c => tinta(c)[1]))) * FS;
    fichas[id] = { g, texto, tacha, w: texto.getComputedTextLength(), arriba, abajo, tipo: item.tipo, fila };
    return fichas[id];
  }
  function creaRaya(id, fila) {
    const clave = fila + ':' + id;
    if (!rayas[clave]) rayas[clave] = { linea: make('path', { class: 'despeje__raya despeje__raya--' + (fila === 0 ? 'numeros' : 'letras') }, capa), fila };
    return rayas[clave];
  }

  /* Coloca un lado de la ecuación: devuelve su ancho y, si se le da x, las posiciones. */
  function hueco(a, b) {
    if (a.tipo === 'op' || b.tipo === 'op') return 0.24 * FS;
    if (a.tipo === 'dot' || b.tipo === 'dot') return 0.05 * FS;
    if (a.frac || b.frac) return 0.1 * FS;
    return 0.03 * FS;
  }
  function ancho(items, fila) {
    let w = 0;
    items.forEach((it, k) => {
      if (k) w += hueco(items[k - 1], it);
      w += it.frac ? anchoFraccion(it, fila) : creaFicha(it, fila).w;
    });
    return w;
  }
  function anchoFraccion(it, fila) { return Math.max(ancho(it.num, fila), ancho(it.den, fila)) + 2 * MARGEN_RAYA; }
  function coloca(items, fila, x, y, pose) {
    items.forEach((it, k) => {
      if (k) x += hueco(items[k - 1], it);
      if (it.frac) {
        const w = anchoFraccion(it, fila), eje = y - EJE;
        coloca(it.num, fila, x + (w - ancho(it.num, fila)) / 2, eje - SUBE_NUM, pose);
        coloca(it.den, fila, x + (w - ancho(it.den, fila)) / 2, eje + BAJA_DEN, pose);
        creaRaya(it.id, fila);
        pose.rayas[fila + ':' + it.id] = { x1: x, x2: x + w, y: eje, o: 1, nueva: !!it.nuevo };
        x += w;
      } else {
        creaFicha(it, fila);
        pose.fichas[fila + ':' + it.id] = { x, y, o: 1, tacha: 0, nueva: !!it.nuevo };
        x += creaFicha(it, fila).w;
      }
    });
  }

  /* ---------- Poses y línea de tiempo ---------- */
  function copia(pose) {
    const c = { fichas: {}, rayas: {} };
    for (const [k, v] of Object.entries(pose.fichas)) c.fichas[k] = { ...v };
    for (const [k, v] of Object.entries(pose.rayas)) c.rayas[k] = { ...v };
    return c;
  }

  function armar(nueva) {
    clave = nueva;
    caso = CASOS[clave];
    capa.innerHTML = '';
    fichas = {}; rayas = {}; chips = [];
    etiquetas.forEach((tspan, i) => { tspan.textContent = caso.letra[i]; });
    // Si la escena no se ve (otra pantalla de la tele), no se puede medir: se arma al llegar.
    const prueba = creaFicha(s('prueba', 'x'), 0);
    pendiente = !(prueba.w > 0);
    capa.innerHTML = ''; fichas = {};
    if (pendiente) return;

    // Todos los estados de cada renglón, para medir y encontrar el lugar del igual.
    const estados = caso.filas.map(f => [f.inicial].concat(...f.pasos.map(paso => paso.map(tr => tr.a))));
    const igual = [0, 1].map(fila => creaFicha(s('igual', '='), fila));
    let izqMax = 0, derMax = 0;
    estados.forEach((lista, fila) => lista.forEach(e => {
      izqMax = Math.max(izqMax, ancho(e.izq, fila));
      derMax = Math.max(derMax, ancho(e.der, fila));
    }));
    const aire = 0.3 * FS;
    const chipsAncho = caso.pasos.map(paso => Math.max(...paso.chips.map(anchoChip)));
    const pistaAncho = chipsAncho.reduce((a, b) => a + b, 0) + 16 * (chipsAncho.length - 1);
    const total = izqMax + aire * 2 + igual[0].w + derMax + 34 + pistaAncho;
    const x0 = Math.max(16, (W - total) / 2);
    const xIgual = x0 + izqMax + aire;              // donde empieza el igual
    const xPista = xIgual + igual[0].w + aire + derMax + 34;

    function pose(e, fila) {
      const y = RENGLON[fila], ps = { fichas: {}, rayas: {} };
      coloca(e.izq, fila, xIgual - aire - ancho(e.izq, fila), y, ps);
      ps.fichas[fila + ':igual'] = { x: xIgual, y, o: 1, tacha: 0, nueva: false };
      coloca(e.der, fila, xIgual + igual[fila].w + aire, y, ps);
      return ps;
    }

    // Una fase interpola entre dos poses; cada renglón lleva su propia lista de fases.
    const fases = [[], []];
    const pies = [{ t: 0, num: 'DESPEJA', texto: caso.inicio }];
    let reloj = T.inicio;
    const actual = caso.filas.map((f, fila) => pose(f.inicial, fila));
    caso.pasos.forEach((paso, k) => {
      pies.push({ t: reloj, num: `PASO ${k + 1} DE ${caso.pasos.length}`, texto: paso.texto });
      let fin = reloj;
      caso.filas.forEach((f, fila) => {
        let tt = reloj + fila * T.retraso;
        let ahora = actual[fila];
        const agrega = (a, dur, extra) => {
          if (dur > 0) fases[fila].push({ t0: tt, t1: tt + dur, de: ahora, a, ...(extra || {}) });
          tt += dur; ahora = a;
        };
        const estadoAntes = () => ahora;
        f.pasos[k].forEach(tr => {
          const destino = pose(tr.a, fila);
          if (tr.tipo === 'voltea') {
            const antes = estadoAntes();
            const sube = new Set(), baja = new Set();
            // Lo que estaba a la izquierda se levanta; lo de la derecha baja.
            for (const id of Object.keys(antes.fichas)) {
              if (id.endsWith(':igual')) continue;
              const x = antes.fichas[id].x;
              (x < xIgual ? sube : baja).add(id);
            }
            const cajaGrupo = grupo => {
              let arriba = Infinity, abajo = -Infinity;
              grupo.forEach(id => {
                const fi = fichas[id], pz = antes.fichas[id];
                arriba = Math.min(arriba, pz.y - fi.arriba); abajo = Math.max(abajo, pz.y + fi.abajo);
              });
              return { arriba, abajo };
            };
            const eq = { arriba: RENGLON[fila] - igual[fila].arriba, abajo: RENGLON[fila] + igual[fila].abajo };
            const cs = cajaGrupo(sube), cb = cajaGrupo(baja), holgura = 0.2 * FS;
            agrega(destino, T.voltea, { modo: 'voltea', sube, baja,
              alto: Math.max(0, cs.abajo - eq.arriba + holgura), bajo: Math.max(0, eq.abajo - cb.arriba + holgura) });
          } else if (tr.tipo === 'op') {
            const antes = estadoAntes();
            // 1. Lo que ya estaba se hace a un lado (o sube a numerador); lo nuevo aún no se ve.
            const hace = copia(antes);
            for (const [id, v] of Object.entries(destino.fichas)) {
              if (hace.fichas[id]) Object.assign(hace.fichas[id], { x: v.x, y: v.y });
              else hace.fichas[id] = { ...v, o: 0 };
            }
            for (const [id, v] of Object.entries(destino.rayas)) {
              if (hace.rayas[id]) Object.assign(hace.rayas[id], { x1: v.x1, x2: v.x2, y: v.y });
              else hace.rayas[id] = { ...v, x1: (v.x1 + v.x2) / 2, x2: (v.x1 + v.x2) / 2, o: 0 };
            }
            const mueve = Object.entries(antes.fichas).some(([id, v]) => Math.abs(v.x - hace.fichas[id].x) > 0.3 || Math.abs(v.y - hace.fichas[id].y) > 0.3);
            const antesConNuevas = copia(antes);
            for (const [id, v] of Object.entries(hace.fichas)) if (!antesConNuevas.fichas[id]) antesConNuevas.fichas[id] = { ...v };
            for (const [id, v] of Object.entries(hace.rayas)) if (!antesConNuevas.rayas[id]) antesConNuevas.rayas[id] = { ...v };
            ahora = antesConNuevas;
            agrega(hace, mueve ? T.mueve : 0);
            // 2. Aparece la operación, en los dos lados.
            agrega(destino, T.aparece);
            tt += T.lee;
          } else if (tr.tipo === 'combina') {
            const antes = estadoAntes();
            const tachada = copia(antes);
            tr.tacha.forEach(id => { tachada.fichas[fila + ':' + id].tacha = 1; });
            agrega(tachada, T.tacha);
            const sinNada = copia(tachada);
            for (const id of Object.keys(sinNada.fichas)) if (!destino.fichas[id]) sinNada.fichas[id].o = 0;
            for (const id of Object.keys(sinNada.rayas)) if (!destino.rayas[id]) sinNada.rayas[id].o = 0;
            agrega(sinNada, T.desvanece);
            const acomodada = copia(destino);
            for (const [id, v] of Object.entries(sinNada.fichas)) if (!acomodada.fichas[id]) acomodada.fichas[id] = { ...v };
            for (const [id, v] of Object.entries(sinNada.rayas)) if (!acomodada.rayas[id]) acomodada.rayas[id] = { ...v };
            agrega(acomodada, T.acomoda);
          } else if (tr.tipo === 'calcula') {
            const antes = estadoAntes();
            const sale = copia(antes);
            for (const id of Object.keys(sale.fichas)) if (!destino.fichas[id]) sale.fichas[id].o = 0;
            for (const id of Object.keys(sale.rayas)) if (!destino.rayas[id]) sale.rayas[id].o = 0;
            for (const [id, v] of Object.entries(destino.fichas)) if (!sale.fichas[id]) sale.fichas[id] = { ...v, o: 0 };
            agrega(sale, T.sale);
            const entra = copia(destino);
            for (const [id, v] of Object.entries(sale.fichas)) if (!entra.fichas[id]) entra.fichas[id] = { ...v };
            for (const [id, v] of Object.entries(sale.rayas)) if (!entra.rayas[id]) entra.rayas[id] = { ...v };
            agrega(entra, T.entra);
          }
        });
        // El paso queda anotado a la derecha, a la altura de su renglón.
        const xChip = xPista + chipsAncho.slice(0, k).reduce((a, b) => a + b + 16, 0);
        chips.push({ g: dibujaChip(paso.chips[fila], fila, k + 1, xChip, RENGLON[fila] - EJE), t: tt });
        tt += T.chip;
        actual[fila] = ahora;
        fin = Math.max(fin, tt);
      });
      reloj = fin + T.entrePasos;
    });
    pies.push({ t: reloj - T.entrePasos + 0.3, num: 'LISTO', texto: caso.final });
    // Con tres pasos, un poco más ágil.
    const ritmo = caso.pasos.length > 2 ? 0.85 : 1;
    fases.forEach(lista => lista.forEach(f => { f.t0 *= ritmo; f.t1 *= ritmo; }));
    chips.forEach(c => { c.t *= ritmo; });
    pies.forEach(pp => { pp.t *= ritmo; });
    linea = { fases, pies, fin: (reloj - T.entrePasos + T.final) * ritmo + 0.3, inicial: caso.filas.map((f, fila) => pose(f.inicial, fila)) };
    for (const fi of Object.values(fichas)) fi.g.setAttribute('opacity', 0);
    for (const ra of Object.values(rayas)) ra.linea.setAttribute('opacity', 0);
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  /* Los pasos anotados: «1 voltea   2 ÷ t». */
  function anchoChip(partes) {
    const g = make('g', {}, capa);
    const w = dibujaTextoChip(partes, g).getComputedTextLength() + 11;
    capa.removeChild(g);
    return w;
  }
  function dibujaTextoChip(partes, g, x = 0, y = 0) {
    const palabra = partes.length === 1 && partes[0].length === 1 && /^[a-z]+$/.test(partes[0][0]);
    const tx = make('text', { x, y, class: 'despeje__chip' + (palabra ? ' despeje__chip--palabra' : '') }, g);
    partes.forEach(([txt, sub]) => {
      tx.appendChild(document.createTextNode(txt));
      if (sub) { const sb = make('tspan', { class: 'despeje__chip-sub', dy: 4 }, tx); sb.textContent = sub; }
    });
    return tx;
  }
  function dibujaChip(partes, fila, n, x, eje) {
    const g = make('g', { opacity: 0 }, capa);
    const num = make('text', { x, y: eje + 3.6, class: 'despeje__chip-num' }, g);
    num.textContent = n;
    dibujaTextoChip(partes, g, x + 11, eje + 5.2);
    return g;
  }

  /* ---------- Dibujo ---------- */
  function poseEn(fila, tiempo) {
    const lista = linea.fases[fila];
    let pz = linea.inicial[fila], fase = null, u = 1;
    for (const f of lista) {
      if (tiempo >= f.t1) { pz = f.a; continue; }
      if (tiempo > f.t0) { fase = f; u = (tiempo - f.t0) / (f.t1 - f.t0); }
      break;
    }
    if (!fase) return pz;
    const res = { fichas: {}, rayas: {} };
    const ids = new Set([...Object.keys(fase.de.fichas), ...Object.keys(fase.a.fichas)]);
    for (const id of ids) {
      const a = fase.de.fichas[id] || fase.a.fichas[id], b = fase.a.fichas[id] || a;
      let k = suave(u), dy = 0;
      if (fase.modo === 'voltea') {
        // Se levanta, cruza y baja: el cruce sólo ocurre arriba o abajo del igual.
        k = suave((u - 0.3) / 0.4);
        const altura = u < 0.3 ? suave(u / 0.3) : u > 0.7 ? suave((1 - u) / 0.3) : 1;
        if (fase.sube.has(id)) dy = -fase.alto * altura;
        if (fase.baja.has(id)) dy = fase.bajo * altura;
      }
      res.fichas[id] = {
        x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k + dy,
        o: a.o + (b.o - a.o) * suave(u), tacha: a.tacha + (b.tacha - a.tacha) * suave(u),
        nueva: u < 0.5 ? a.nueva : b.nueva
      };
    }
    const rids = new Set([...Object.keys(fase.de.rayas), ...Object.keys(fase.a.rayas)]);
    for (const id of rids) {
      const a = fase.de.rayas[id] || fase.a.rayas[id], b = fase.a.rayas[id] || a, k = suave(u);
      res.rayas[id] = { x1: a.x1 + (b.x1 - a.x1) * k, x2: a.x2 + (b.x2 - a.x2) * k, y: a.y + (b.y - a.y) * k,
        o: a.o + (b.o - a.o) * k, nueva: u < 0.5 ? a.nueva : b.nueva };
    }
    return res;
  }

  function draw(tiempo) {
    if (pendiente || !linea) return;
    for (const fila of [0, 1]) {
      const pz = poseEn(fila, tiempo);
      for (const [id, fi] of Object.entries(fichas)) {
        if (fi.fila !== fila) continue;
        const v = pz.fichas[id];
        if (!v) { fi.g.setAttribute('opacity', 0); continue; }
        set(fi.texto, { x: v.x, y: v.y });
        fi.g.setAttribute('opacity', r2(clamp(v.o)));
        fi.texto.classList.toggle('es-nueva', !!v.nueva);
        if (v.tacha > 0.001) {
          const x1 = v.x - 0.08 * FS, y1 = v.y + fi.abajo + 0.06 * FS, x2 = v.x + fi.w + 0.08 * FS, y2 = v.y - fi.arriba - 0.06 * FS;
          const largo = Math.hypot(x2 - x1, y2 - y1);
          set(fi.tacha, { d: `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`, 'stroke-dasharray': r2(largo), 'stroke-dashoffset': r2(largo * (1 - v.tacha)), opacity: 1 });
        } else fi.tacha.setAttribute('opacity', 0);
      }
      for (const [id, ra] of Object.entries(rayas)) {
        if (ra.fila !== fila) continue;
        const v = pz.rayas[id];
        if (!v) { ra.linea.setAttribute('opacity', 0); continue; }
        set(ra.linea, { d: `M${r2(v.x1)} ${r2(v.y)}H${r2(v.x2)}`, opacity: r2(clamp(v.o)) });
        ra.linea.classList.toggle('es-nueva', !!v.nueva);
      }
    }
    chips.forEach(c => c.g.setAttribute('opacity', r2(suave((tiempo - c.t) / T.chip))));
    // El pie cambia con el paso; se apaga y se enciende rápido, sin parpadear.
    let k = 0;
    linea.pies.forEach((pp, i) => { if (tiempo >= pp.t) k = i; });
    const pp = linea.pies[k];
    if (pieTexto.textContent !== pp.texto) { pieNum.textContent = pp.num; pieTexto.textContent = pp.texto; }
    pie.setAttribute('opacity', r2(k === 0 ? 1 : suave((tiempo - pp.t) / T.pie)));
  }

  const fin = () => (linea ? linea.fin : 0);

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : fin();
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => { congelada = false; elige(b.dataset.caso, true); }));
  if (repetir) repetir.addEventListener('click', () => { congelada = false; elige(clave, true); });
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  // Con la letra ya cargada se mide otra vez (el ancho de las fichas cambia).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { const antes = t; armar(clave); t = Math.min(antes, fin()); draw(t); });
  }
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'mru', true);

  // Para las pruebas: las cajas de tinta de cada ficha visible en un instante.
  svg.__despejes = {
    fin,
    cajas(tiempo) {
      const out = [];
      for (const fila of [0, 1]) {
        const pz = poseEn(fila, tiempo);
        for (const [id, v] of Object.entries(pz.fichas)) {
          const fi = fichas[id];
          if (!fi || v.o < 0.05) continue;
          out.push({ id, x1: v.x, x2: v.x + fi.w, y1: v.y - fi.arriba, y2: v.y + fi.abajo, o: v.o, tacha: v.tacha });
        }
        for (const [id, v] of Object.entries(pz.rayas)) if (v.o >= 0.05) out.push({ id, x1: v.x1, x2: v.x2, y1: v.y - 0.6, y2: v.y + 0.6, o: v.o, raya: true });
      }
      return out;
    },
    elige: c => { congelada = false; elige(c, true); },
    // Detiene la escena en un instante (para las capturas de prueba).
    congela: tiempo => { congelada = true; t = tiempo; draw(t); }
  };

  return {
    update(dt) {
      if (congelada) return;
      if (pendiente) { armar(clave); t = 0; }
      if (t < fin()) { t += dt; draw(t); }
    },
    still() { if (pendiente) armar(clave); t = fin(); draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { despejes };
const scenes = [...document.querySelectorAll('[data-escena-fisica]')]
  .filter(svg => factories[svg.dataset.escenaFisica])
  .map(svg => ({ svg, visible: false, ...factories[svg.dataset.escenaFisica](svg) }));
let frame = 0, previous = 0;

function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
function tick(timestamp) {
  frame = 0;
  if (document.hidden || reducedMotion.matches) return;
  const dt = previous ? Math.min((timestamp - previous) / 1000, 1 / 20) : 0;
  previous = timestamp;
  if (dt > 0) for (const scene of scenes) if (scene.visible) scene.update(dt);
  schedule();
}
function schedule() {
  if (frame || document.hidden || reducedMotion.matches) return;
  if (!scenes.some(scene => scene.visible)) { previous = 0; return; }
  frame = requestAnimationFrame(tick);
}
function applyPreference() {
  stop();
  for (const scene of scenes) {
    scene.svg.toggleAttribute('data-quieta', reducedMotion.matches);
    if (reducedMotion.matches) scene.still();
    else scene.update(0);
  }
  schedule();
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const scene = scenes.find(candidate => candidate.svg === entry.target);
      if (scene) scene.visible = entry.isIntersecting;
    }
    if (!scenes.some(scene => scene.visible)) stop();
    schedule();
  }, { threshold: .1 });
  scenes.forEach(scene => observer.observe(scene.svg));
} else {
  scenes.forEach(scene => { scene.visible = true; });
}
if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', applyPreference);
else reducedMotion.addListener(applyPreference);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', schedule);
applyPreference();
