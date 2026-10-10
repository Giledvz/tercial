/* Escenas de Análisis dimensional (Física, semana 4). Mismo contrato que las demás:
   cada escena es { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja su cuadro final. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const entre = (a, b, p) => a + (b - a) * p;
const avance = (t, [t0, t1]) => suave((t - t0) / (t1 - t0));

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

// Conecta las pastillas, el texto del caso, «Repetir» y la llegada a la tele con una escena.
function controles(svg, raiz, atributo, panelSel, textoAtr, casos, armar, dibuja, fin) {
  const root = svg.closest(raiz);
  const botones = root ? [...root.querySelectorAll(`[${atributo}]`)] : [];
  const panel = root ? root.querySelector(panelSel) : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll(`[${textoAtr}]`).forEach(n => { textos[n.getAttribute(textoAtr)] = n.innerHTML; });
  let clave = null, t = 0;
  function elige(nueva, animar) {
    if (!casos[nueva]) return;
    clave = nueva;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute(atributo) === nueva)));
    armar(nueva);
    if (panel) panel.innerHTML = textos[nueva] ? '<p>' + textos[nueva] + '</p>' : '';
    t = animar && !reducedMotion.matches ? 0 : fin();
    dibuja(t);
  }
  botones.forEach(b => b.addEventListener('click', () => elige(b.getAttribute(atributo), true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.getAttribute(atributo) : Object.keys(casos)[0], true);
  return {
    update(dt) { if (t < fin()) { t += dt; dibuja(t); } },
    still() { t = fin(); dibuja(t); }
  };
}

/* ---------------- Las unidades se cancelan ----------------
   Cada operación aparece primero en un renglón (90 km/h × 2 h). Luego se escribe como una
   sola fracción en dos tiempos, para que nada se cruce: primero cada pieza sube o baja en
   vertical a su renglón (así nadie le pasa por encima a otra) y después se desliza de lado a
   su lugar. Lo que se repite arriba y abajo se tacha, los números se operan aparte y queda el
   resultado; abajo, la misma cuenta con literales. Lo que cambia de forma (s² en s · s) se
   desvanece primero y luego aparece lo nuevo: nunca hay dos letras en el mismo lugar.
   Las piezas se colocan con su ancho real en Fraunces de 24 px (medido en el navegador), así
   que nada se encima: cada pieza tiene su lugar y un espacio fijo con la siguiente. */
const ANCHO = {
  '90': 29.75, '2': 14.19, '150': 39.63, '60': 29.64, '5': 13.5, '4': 14.22, '10': 26.13, '3': 12.88,
  km: 36.27, h: 14.66, kg: 27.41, m: 22.16, s: 11.08, 's²': 19.69, '×': 11.89, '÷': 13.22, '/': 11.59, '·': 6.5,
  '= 180 km': 100.08, '= 2.5 h': 71.88, '= 20 kg·m/s²': 140.8, '= 20 N': 71.98, '= 30 m/s': 97
};
const NU = 5.5, OP = 7, PEGADO = 0.5, PUNTO = 3;          // espacios: número-unidad, operación, km/h, s · s
const Y_RENGLON = 108, Y_ARRIBA = 90, Y_RAYA = 100, Y_ABAJO = 125, Y_RESULTADO = [108, 140];

const CASOS = {
  'km-h': {
    piezas: { a: '90', b: 'km', c: '/', d: 'h', e: '×', f: '2', g: 'h' },
    renglon: [['a'], ['b', NU], ['c', PEGADO], ['d', PEGADO], ['e', OP], ['f', OP], ['g', NU]],
    arriba: [['a'], ['b', NU], ['e', OP], ['f', OP], ['g', NU]],
    abajo: [['d']],
    seVan: ['c'], llegan: [],
    cancela: [['g', 'd']],
    numeros: ['a', 'f'], cuenta: '90 × 2 = 180',
    resultado: ['= 180 km'],
    algebra: '(a/b) · b = a'
  },
  'km-kmh': {
    piezas: { a: '150', b: 'km', c: '÷', d: '60', e: 'km', f: '/', g: 'h', x: '×' },
    renglon: [['a'], ['b', NU], ['c', OP], ['d', OP], ['e', NU], ['f', PEGADO], ['g', PEGADO]],
    arriba: [['a'], ['b', NU], ['x', OP], ['g', OP]],
    abajo: [['d'], ['e', NU]],
    // Dividir entre una fracción es multiplicar por su inversa: ÷ se vuelve × y km/h se voltea.
    seVan: ['c', 'f'], llegan: ['x'],
    cancela: [['b', 'e']],
    numeros: ['a', 'd'], cuenta: '150 ÷ 60 = 2.5',
    resultado: ['= 2.5 h'],
    algebra: 'a ÷ (a/b) = b'
  },
  'kg-ms2': {
    piezas: { a: '5', b: 'kg', c: '×', d: '4', e: 'm', f: '/', g: 's²' },
    renglon: [['a'], ['b', NU], ['c', OP], ['d', OP], ['e', NU], ['f', PEGADO], ['g', PEGADO]],
    arriba: [['a'], ['b', NU], ['c', OP], ['d', OP], ['e', NU]],
    abajo: [['g']],
    seVan: ['f'], llegan: [],
    cancela: [],
    numeros: ['a', 'd'], cuenta: '5 × 4 = 20',
    resultado: ['= 20 kg·m/s²', '= 20 N'],
    algebra: 'a · (b/c²) = ab/c²'
  },
  'ms2-s': {
    piezas: { a: '10', b: 'm', c: '/', d: 's²', e: '×', f: '3', g: 's', p: 's', q: '·', r: 's' },
    renglon: [['a'], ['b', NU], ['c', PEGADO], ['d', PEGADO], ['e', OP], ['f', OP], ['g', NU]],
    arriba: [['a'], ['b', NU], ['e', OP], ['f', OP], ['g', NU]],
    abajo: [['d']],
    seVan: ['c'], llegan: [],
    // s² es s · s: de las dos, la s de arriba cancela sólo una.
    expande: { de: 'd', en: [['p'], ['q', PUNTO], ['r', PUNTO]] },
    cancela: [['g', 'p']],
    numeros: ['a', 'f'], cuenta: '10 × 3 = 30',
    resultado: ['= 30 m/s'],
    algebra: '(a/b²) · b = a/b'
  }
};

// Centros de las piezas de un renglón, centrado en cx.
function fila(lista, piezas, cx, y) {
  const ancho = lista.reduce((s, [id, espacio = 0]) => s + espacio + ANCHO[piezas[id]], 0);
  let x = cx - ancho / 2;
  const pos = {};
  for (const [id, espacio = 0] of lista) {
    x += espacio;
    const w = ANCHO[piezas[id]];
    pos[id] = { x: x + w / 2, y, w };
    x += w;
  }
  return { pos, ancho };
}

function geometria(c) {
  const anchoArriba = fila(c.arriba, c.piezas, 0, 0).ancho;
  const anchoAbajo = Math.max(fila(c.abajo, c.piezas, 0, 0).ancho, c.expande ? fila(c.expande.en, c.piezas, 0, 0).ancho : 0);
  const W = Math.max(anchoArriba, anchoAbajo);
  const anchoResultado = Math.max(...c.resultado.map(r => ANCHO[r]));
  // La fracción y el resultado, juntos, quedan centrados en el dibujo.
  const cx = 200 - (11 + anchoResultado) / 2;
  return {
    W, cx,
    renglon: fila(c.renglon, c.piezas, cx, Y_RENGLON).pos,
    arriba: fila(c.arriba, c.piezas, cx, Y_ARRIBA).pos,
    abajo: fila(c.abajo, c.piezas, cx, Y_ABAJO).pos,
    expandido: c.expande ? fila(c.expande.en, c.piezas, cx, Y_ABAJO).pos : {},
    raya: [cx - W / 2 - 5, cx + W / 2 + 5],
    xResultado: cx + W / 2 + 16
  };
}

// Ninguna pieza se sale del dibujo ni se encima con otra (con 2 px de holgura).
for (const [clave, c] of Object.entries(CASOS)) {
  const g = geometria(c);
  for (const nombre of ['renglon', 'arriba', 'abajo', 'expandido']) {
    const lista = Object.values(g[nombre]).sort((p, q) => p.x - q.x);
    lista.forEach((p, i) => {
      if (p.x - p.w / 2 < 8 || p.x + p.w / 2 > 392) throw new Error(`cancela: ${clave} se sale (${nombre})`);
      if (i && lista[i - 1].x + lista[i - 1].w / 2 + 0.4 > p.x - p.w / 2) throw new Error(`cancela: ${clave} se enciman piezas (${nombre})`);
    });
  }
  const derecha = g.xResultado + Math.max(...c.resultado.map(r => ANCHO[r]));
  if (derecha > 392) throw new Error(`cancela: el resultado de ${clave} se sale`);
}

function lineaDeTiempo(c) {
  const L = { etiquetas: [] };
  let t = 0.3;
  L.entra = [t, t + 0.6]; t += 1.0;
  L.etiquetas.push([t, 'Todo en una sola fracción']);
  L.separa = [t + 0.2, t + 1.0]; L.junta = [t + 1.1, t + 2.0]; t += 2.6;
  if (c.expande) {
    L.etiquetas.push([t, 's² es s · s']);
    L.expande = [t + 0.2, t + 1.0]; t += 1.6;
  }
  if (c.cancela.length) {
    L.etiquetas.push([t, 'Lo que se repite arriba y abajo se cancela']);
    L.taches = c.cancela.map((_, i) => { const a = t + 0.4 + i * 1.2; return [[a, a + 0.5], [a + 0.6, a + 1.1]]; });
    t += 0.4 + c.cancela.length * 1.2 + 0.5;
  } else {
    L.etiquetas.push([t, 'Nada se repite arriba y abajo: no se cancela nada']);
    L.taches = [];
    t += 1.8;
  }
  L.etiquetas.push([t, 'Los números, aparte: ' + c.cuenta]);
  L.numeros = [t, t + 0.6]; t += 1.2;
  L.resultado = c.resultado.map((_, i) => [t + i * 0.9, t + i * 0.9 + 0.6]);
  t += c.resultado.length * 0.9 + 0.3;
  L.algebra = [t, t + 0.6];
  L.fin = t + 1.0;
  return L;
}

function cancela(svg) {
  const paso = make('text', { x: 24, y: 28, class: 'escena-ad__paso' }, svg);
  const raya = make('path', { class: 'cancela__raya' }, svg);
  const capa = make('g', {}, svg);
  const capaTaches = make('g', {}, svg);
  const resultados = Y_RESULTADO.map(y => make('text', { y, class: 'cancela__resultado' }, svg));
  const algebra = make('text', { x: 24, y: 166, class: 'escena-ad__nota' }, svg);
  algebra.appendChild(document.createTextNode('Como en álgebra:'));
  const algebraLetras = make('tspan', { class: 'escena-ad__algebra', dx: 6 }, algebra);
  let c = null, g = null, L = null, nodos = {}, taches = [];

  function armar(clave) {
    c = CASOS[clave]; g = geometria(c); L = lineaDeTiempo(c);
    capa.innerHTML = ''; capaTaches.innerHTML = '';
    nodos = {};
    for (const [id, txt] of Object.entries(c.piezas)) {
      nodos[id] = make('text', { class: 'cancela__pieza', 'text-anchor': 'middle' }, capa);
      nodos[id].textContent = txt;
    }
    taches = c.cancela.map(() => [make('path', { class: 'cancela__tache' }, capaTaches), make('path', { class: 'cancela__tache' }, capaTaches)]);
    resultados.forEach((n, i) => { n.textContent = c.resultado[i] || ''; set(n, { x: g.xResultado }); });
    algebraLetras.textContent = c.algebra;
  }

  function dibuja(t) {
    const entra = avance(t, L.entra), separa = avance(t, L.separa), junta = avance(t, L.junta);
    // s² se va en la primera mitad y s · s llega en la segunda.
    const [e0, e1] = L.expande || [0, 0];
    const seVa = c.expande ? avance(t, [e0, (e0 + e1) / 2]) : 0, llega = c.expande ? avance(t, [(e0 + e1) / 2, e1]) : 0;
    const enFraccion = { ...g.arriba, ...g.abajo };
    const tachada = {};
    c.cancela.forEach(([de, con], i) => {
      tachada[de] = avance(t, L.taches[i][0]);
      tachada[con] = avance(t, L.taches[i][1]);
    });
    const numeros = avance(t, L.numeros) * (1 - avance(t, L.resultado[0]));
    for (const [id, nodo] of Object.entries(nodos)) {
      let x, y, op = entra;
      const a = g.renglon[id], b = enFraccion[id];
      if (a && b) {                                     // primero en vertical, luego de lado
        x = entre(a.x, b.x, junta); y = entre(a.y, b.y, separa);
      } else if (a) {                                   // la diagonal y el ÷ se desvanecen donde estaban
        x = a.x; y = a.y; op = entra * (1 - separa);
      } else if (b) {                                   // el × que llega, ya en su lugar
        x = b.x; y = b.y; op = junta;
      } else {                                          // las s de s · s
        const e = g.expandido[id];
        x = e.x; y = e.y; op = llega;
      }
      if (c.expande && id === c.expande.de) op *= 1 - seVa;
      if (tachada[id] !== undefined) op *= 1 - 0.55 * tachada[id];
      set(nodo, { x, y, opacity: r2(op) });
      nodo.classList.toggle('es-numero', c.numeros.includes(id) && numeros > 0.5);
    }
    // La raya de la fracción crece desde el centro cuando el renglón ya se vació: así no cruza
    // el ÷ ni la diagonal que se desvanecen.
    const [x1, x2] = g.raya, medio = (x1 + x2) / 2, crece = junta;
    set(raya, { d: crece > 0.01 ? `M${r2(entre(medio, x1, crece))} ${Y_RAYA}H${r2(entre(medio, x2, crece))}` : 'M0 0', opacity: r2(crece) });
    // Cada tache cruza su pieza en diagonal, de abajo a la izquierda hacia arriba a la derecha.
    c.cancela.forEach((par, i) => par.forEach((id, k) => {
      const p = avance(t, L.taches[i][k]);
      const pos = enFraccion[id] || g.expandido[id];
      const xa = pos.x - pos.w / 2 - 2, ya = pos.y + 4, xb = pos.x + pos.w / 2 + 2, yb = pos.y - 18;
      set(taches[i][k], { d: p > 0.01 ? `M${r2(xa)} ${ya}L${r2(entre(xa, xb, p))} ${r2(entre(ya, yb, p))}` : 'M0 0' });
    }));
    resultados.forEach((n, i) => set(n, { opacity: L.resultado[i] ? r2(avance(t, L.resultado[i])) : 0 }));
    set(algebra, { opacity: r2(avance(t, L.algebra)) });
    // La etiqueta del paso: la última que ya empezó, con un fundido corto.
    const actual = [...L.etiquetas].reverse().find(([t0]) => t >= t0);
    paso.textContent = actual ? actual[1] : '';
    set(paso, { opacity: actual ? r2(suave((t - actual[0]) / 0.4)) : 0 });
  }

  return controles(svg, '[data-cancela]', 'data-caso', '[data-cancela-texto]', 'data-texto-caso', CASOS, armar, dibuja, () => L.fin);
}

/* ---------------- Sólo se suma lo que tiene la misma unidad ----------------
   Una cinta métrica de 0 a 5 m (1 m = 56 px, una marca cada 10 cm). Sumar longitudes es
   poner una tabla tras otra sobre la misma cinta; una cota abajo mide el total. Las tablas se
   asientan desde arriba, despacio, y la segunda empieza justo donde acaba la primera. Un
   tiempo no cabe en la cinta: tiene su propia regla, y por eso 3 m + 2 s no tiene sentido.
   Alturas: la ecuación acaba en y ≈ 33 y el rótulo de una tabla, aun al empezar a bajar,
   empieza más abajo (≈ 37); los números de la cinta acaban en y ≈ 108 y el rótulo de la
   barra del tiempo, al empezar a bajar, empieza en y ≈ 112. Se mide en la revisión. */
const X0 = 64, ESC = 56, Y_CINTA = 86, ALTO = 16, Y_COTA = 124, Y_TIEMPO = 154, ALTO_T = 14, CAIDA = 14, CAIDA_T = 8;
const xm = n => X0 + n * ESC;

const SUMAS = {
  'm-m': { tablas: [{ desde: 0, largo: 3, rotulo: '3 m' }, { desde: 3, largo: 2, rotulo: '2 m' }],
    total: 5, rotuloTotal: '5 m', ecuacion: '3 m + 2 m', resultado: ' = 5 m' },
  'm-cm': { tablas: [{ desde: 0, largo: 2, rotulo: '2 m' }, { desde: 2, largo: 0.6, rotulo: '60 cm', convierte: '0.6 m' }],
    total: 2.6, rotuloTotal: '2.6 m', ecuacion: '2 m + 60 cm', resultado: ' = 2.6 m' },
  'm-s': { tablas: [{ desde: 0, largo: 3, rotulo: '3 m' }], tiempo: { desde: 0, largo: 2, rotulo: '2 s' },
    ecuacion: '3 m + 2 s', resultado: ' no tiene sentido' }
};

for (const [clave, s] of Object.entries(SUMAS)) {
  // Cada tabla empieza donde acaba la anterior, cabe en la cinta y suma lo que dice la cota.
  s.tablas.forEach((tb, i) => {
    if (i && Math.abs(tb.desde - (s.tablas[i - 1].desde + s.tablas[i - 1].largo)) > 1e-9) throw new Error(`suma: ${clave} deja un hueco`);
    if (tb.desde + tb.largo > 5) throw new Error(`suma: ${clave} se sale de la cinta`);
  });
  if (s.total !== undefined && Math.abs(s.tablas.reduce((a, tb) => a + tb.largo, 0) - s.total) > 1e-9) throw new Error(`suma: ${clave} no suma ${s.total}`);
}

function lineaSuma(s) {
  const L = { tablas: [] };
  let t = 0.4;
  L.tablas.push([t, t + 0.9]); t += 1.5;
  if (s.tiempo) {
    L.regla = [t, t + 0.6]; t += 1.0;
    L.barra = [t, t + 0.9]; t += 1.5;
  } else {
    L.tablas.push([t, t + 0.9]); t += 1.5;
    if (s.tablas[1].convierte) { L.convierte = [t, t + 0.8]; t += 1.4; }
    L.cota = [t, t + 0.9]; t += 0.9;
    L.rotulo = [t, t + 0.5]; t += 0.8;
  }
  L.resultado = [t, t + 0.5];
  L.fin = t + 1.0;
  return L;
}

function regla(capa, y, nombre, unidad, menor) {
  make('path', { d: `M${xm(0)} ${y}H${xm(5)}`, class: 'suma__regla' }, capa);
  for (let k = 0; k <= 5 / menor + 1e-9; k++) {
    const n = Math.round(k * menor * 100) / 100;
    const entero = Math.abs(n - Math.round(n)) < 1e-9, medio = Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
    const largo = entero ? 8 : medio ? 5 : 3;
    make('path', { d: `M${r2(xm(n))} ${y}V${y + largo}`, class: 'suma__marca' }, capa);
    if (entero) {
      const t = make('text', { x: r2(xm(n)), y: y + 20, class: 'suma__numero', 'text-anchor': 'middle' }, capa);
      t.textContent = n === 0 ? '0' : n + ' ' + unidad;
    }
  }
  const t = make('text', { x: X0 - 10, y: y + 4, class: 'suma__nombre', 'text-anchor': 'end' }, capa);
  t.textContent = nombre;
}

function suma(svg) {
  const ecuacion = make('text', { x: 24, y: 28, class: 'suma__ecuacion' }, svg);
  const ecuacionTexto = make('tspan', {}, ecuacion);
  const ecuacionResultado = make('tspan', { class: 'suma__resultado' }, ecuacion);
  const cinta = make('g', {}, svg);
  regla(cinta, Y_CINTA, 'longitud', 'm', 0.1);
  const reglaTiempo = make('g', {}, svg);
  regla(reglaTiempo, Y_TIEMPO, 'tiempo', 's', 0.5);
  const capa = make('g', {}, svg);
  const cota = make('g', { class: 'suma__cota' }, svg);
  const cotaLinea = make('path', { class: 'suma__cota-linea' }, cota);
  const cotaPuntas = make('path', { class: 'suma__cota-punta' }, cota);
  const cotaTopes = make('path', { class: 'suma__cota-linea' }, cota);
  const cotaRotulo = make('text', { y: Y_COTA + 22, class: 'suma__total', 'text-anchor': 'middle' }, cota);
  let s = null, L = null, tablas = [], barra = null;

  function tabla(clase, x, ancho, alto, rotulos) {
    const g = make('g', {}, capa);
    const rect = make('rect', { x, width: ancho, height: alto, rx: 1.5, class: clase }, g);
    const textos = rotulos.map(r => { const n = make('text', { x: x + ancho / 2, class: 'suma__rotulo', 'text-anchor': 'middle' }, g); n.textContent = r; return n; });
    return { g, rect, textos };
  }

  function armar(clave) {
    s = SUMAS[clave]; L = lineaSuma(s);
    capa.innerHTML = '';
    tablas = s.tablas.map(tb => tabla('suma__tabla', xm(tb.desde), tb.largo * ESC, ALTO, tb.convierte ? [tb.rotulo, tb.convierte] : [tb.rotulo]));
    barra = s.tiempo ? tabla('suma__tabla suma__tabla--tiempo', xm(s.tiempo.desde), s.tiempo.largo * ESC, ALTO_T, [s.tiempo.rotulo]) : null;
    ecuacionTexto.textContent = s.ecuacion;
    ecuacionResultado.textContent = s.resultado;
    cotaRotulo.textContent = s.rotuloTotal || '';
  }

  function dibuja(t) {
    // Cada tabla se asienta sobre la cinta: baja 14 px mientras aparece, sin rebotar.
    tablas.forEach((tb, i) => {
      const p = avance(t, L.tablas[i]);
      const y = Y_CINTA - ALTO - CAIDA * (1 - p);
      set(tb.rect, { y });
      tb.textos.forEach((n, k) => {
        // 60 cm se desvanece y después aparece 0.6 m, en el mismo lugar: nunca los dos a la vez.
        let op = 1;
        if (tb.textos.length > 1) {
          const [c0, c1] = L.convierte, medio = (c0 + c1) / 2;
          op = k === 0 ? 1 - avance(t, [c0, medio]) : avance(t, [medio, c1]);
        }
        set(n, { y: y - 6, opacity: r2(p * op) });
      });
      set(tb.g, { opacity: r2(p) });
    });
    set(reglaTiempo, { opacity: L.regla ? r2(avance(t, L.regla)) : 0 });
    if (barra) {
      const p = avance(t, L.barra), y = Y_TIEMPO - ALTO_T - CAIDA_T * (1 - p);
      set(barra.rect, { y });
      barra.textos.forEach(n => set(n, { y: y - 6 }));
      set(barra.g, { opacity: r2(p) });
    }
    if (L.cota) {
      const p = avance(t, L.cota), x1 = xm(0), x2 = xm(s.total * p);
      const listo = p > 0.999;
      set(cota, { opacity: p > 0 ? 1 : 0 });
      set(cotaLinea, { d: p > 0.01 ? `M${x1 + 1} ${Y_COTA}H${r2(x2 - 1)}` : 'M0 0' });
      // Puntas hacia afuera en los dos extremos; el tope derecho aparece al terminar de medir.
      set(cotaPuntas, { d: p > 0.05 ? `M${x1} ${Y_COTA}l6 -3v6zM${r2(x2)} ${Y_COTA}l-6 -3v6z` : 'M0 0' });
      set(cotaTopes, { d: `M${x1} ${Y_COTA - 6}v12` + (listo ? `M${r2(x2)} ${Y_COTA - 6}v12` : '') });
      set(cotaRotulo, { x: r2((x1 + xm(s.total)) / 2), opacity: r2(avance(t, L.rotulo)) });
    } else set(cota, { opacity: 0 });
    set(ecuacionResultado, { opacity: r2(avance(t, L.resultado)) });
  }

  return controles(svg, '[data-suma]', 'data-suma-caso', '[data-suma-texto]', 'data-texto-suma', SUMAS, armar, dibuja, () => L.fin);
}

/* ---------------- Reloj compartido ---------------- */
const factories = { cancela, suma };
const scenes = [...document.querySelectorAll('[data-escena-ad]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaAd](svg)
}));
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
