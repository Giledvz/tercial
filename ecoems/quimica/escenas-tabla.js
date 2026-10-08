/* Escenas de la tabla periódica, tema 2 de Química ECOEMS: metales, no
   metales y metaloides, y las propiedades que los distinguen.
   Mismo contrato que escenas-atomo.js: cada escena es { update(dt), still() };
   el reloj compartido sólo avanza las escenas visibles y, con movimiento
   reducido, cada una dibuja un fotograma fijo que resume el proceso.
   Colores de la lección: metales en gris metálico, metaloides en mostaza y no
   metales en verde azulado; el terracota marca lo que hay que mirar (la
   escalera, el elemento señalado, lo que sí conduce). */
import { ELEMENTOS } from './elementos.js';

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const round = value => Math.round(value * 100) / 100;
const span = (t, a, b) => clamp((t - a) / (b - a));
// Aparece en [a, a + entra] y se va en [b − sale, b].
const ventana = (t, a, b, entra = .4, sale = .4) => smooth((t - a) / entra) * (1 - smooth((t - (b - sale)) / sale));

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, typeof value === 'number' ? round(value) : value);
  }
}

function text(parent, x, y, content, cls, extra) {
  const node = make('text', { x, y, class: cls, ...(extra || {}) }, parent);
  node.textContent = content;
  return node;
}

// Opacidad sin escribir en el DOM si no cambió: la tabla tiene 118 celdas.
const ultimo = new WeakMap();
function fade(node, value) {
  const v = Math.round(clamp(value) * 100) / 100;
  if (ultimo.get(node) === v) return;
  ultimo.set(node, v);
  node.setAttribute('opacity', v);
}

/* ---------------- Tabla periódica compacta ----------------
   18 columnas por 7 periodos y, abajo, las dos filas del bloque f
   (lantánidos y actínidos) bajo los grupos 3 a 17, como en la fuente. */
const METALES = new Set(['metal-alcalino', 'alcalinoterreo', 'metal-transicion', 'metal-postransicion', 'lantanido', 'actinido']);
export function clase(element) {
  if (element.familia === 'metaloide') return 'metaloide';
  return METALES.has(element.familia) ? 'metal' : 'no-metal';
}

const P = 20, CELL = 18.4, LEFT = 16, TOP = 16, GAP_F = 8;
const ROMANOS_A = { 1: 'IA', 2: 'IIA', 13: 'IIIA', 14: 'IVA', 15: 'VA', 16: 'VIA', 17: 'VIIA', 18: 'VIIIA' };
const bordeX = grupo => LEFT + (grupo - 1) * P - (P - CELL) / 2;
const bordeY = periodo => TOP + periodo * P - (P - CELL) / 2;

function posicion(element) {
  if (element.familia === 'lantanido' || element.familia === 'actinido') {
    const lantanido = element.familia === 'lantanido';
    const first = lantanido ? 57 : 89;
    return { x: LEFT + (2 + element.numero - first) * P, y: TOP + (lantanido ? 7 : 8) * P + GAP_F };
  }
  return { x: LEFT + (element.grupo - 1) * P, y: TOP + (element.periodo - 1) * P };
}

function tabla(parent) {
  const ejes = make('g', {}, parent);
  for (const [grupo, nombre] of Object.entries(ROMANOS_A)) {
    text(ejes, LEFT + (grupo - 1) * P + CELL / 2, TOP - 4, nombre, 'escena__tabla-grupo', { 'text-anchor': 'middle' });
  }
  for (let periodo = 1; periodo <= 7; periodo += 1) {
    text(ejes, LEFT - 6, TOP + (periodo - 1) * P + CELL / 2 + 2.2, String(periodo), 'escena__tabla-periodo', { 'text-anchor': 'middle' });
  }
  ['Lantánidos', 'Actínidos'].forEach((nombre, i) => text(ejes, LEFT + 2 * P - 3, TOP + (7 + i) * P + GAP_F + CELL / 2 + 2, nombre,
    'escena__tabla-grupo', { 'text-anchor': 'end' }));
  // Donde van los lantánidos y los actínidos queda un hueco punteado.
  [6, 7].forEach(periodo => make('rect', {
    x: LEFT + 2 * P, y: TOP + (periodo - 1) * P, width: CELL, height: CELL, rx: 2, class: 'escena__celda-hueco'
  }, parent));
  const cells = new Map();
  ELEMENTOS.forEach(element => {
    const { x, y } = posicion(element);
    const g = make('g', { transform: `translate(${x} ${y})` }, parent);
    const kind = clase(element);
    make('rect', { width: CELL, height: CELL, rx: 2, class: 'escena__celda' }, g);
    const fill = make('rect', { width: CELL, height: CELL, rx: 2, class: `escena__celda-relleno escena__celda-relleno--${kind}`, opacity: 0 }, g);
    text(g, CELL / 2, CELL / 2 + 2.9, element.simbolo, 'escena__celda-simbolo', { 'text-anchor': 'middle' });
    cells.set(element.simbolo, { element, kind, fill, x, y });
  });
  return cells;
}

/* ---------------- 1 · Mapa: metales, no metales y metaloides ----------------
   La tabla aparece vacía. Los metales se llenan de izquierda a derecha, los no
   metales de derecha a izquierda y, al final, el hidrógeno. Luego se dibuja la
   escalera y los metaloides se encienden a lo largo de ella. Para cerrar, se
   señalan tres casos que se preguntan mucho: H, Hg y Br. */
function mapa(svg) {
  const T = 24;
  const board = make('g', {}, svg);
  const cells = tabla(board);
  const list = [...cells.values()];
  const x13 = LEFT + 12 * P, x18 = LEFT + 17 * P;
  const ESCALERA = ['B', 'Si', 'Ge', 'As', 'Sb', 'Te'];
  list.forEach(cell => {
    const row = (cell.y - TOP) / P;
    if (cell.kind === 'metal') cell.start = 1 + 4.2 * (cell.x - LEFT) / (x18 - LEFT) + .05 * row;
    else if (cell.kind === 'no-metal') {
      cell.start = cell.element.simbolo === 'H' ? 8.1 : 6 + 1.6 * (1 - (cell.x - x13) / (x18 - x13)) + .04 * row;
    } else cell.start = 9.4 + .4 * ESCALERA.indexOf(cell.element.simbolo);
  });

  // La escalera es la frontera de los metales: de B a At, siempre por los bordes.
  const LARGO = 200;
  const stairs = make('path', {
    d: `M${round(bordeX(13))} ${round(bordeY(1))}V${round(bordeY(2))}H${round(bordeX(14))}V${round(bordeY(4))}` +
      `H${round(bordeX(15))}V${round(bordeY(5))}H${round(bordeX(17))}V${round(bordeY(7))}`,
    class: 'escena__escalera', 'stroke-dasharray': LARGO, 'stroke-dashoffset': LARGO
  }, board);

  // Leyenda y notas en el hueco de arriba, sobre los metales de transición.
  const legend = make('g', {}, board);
  const items = [['metal', 'Metales', 62, 1], ['metaloide', 'Metaloides', 118, 9], ['no-metal', 'No metales', 184, 6]].map(([kind, label, x, at]) => {
    const g = make('g', { opacity: 0 }, legend);
    make('rect', { x, y: TOP + 2.5, width: 8, height: 8, rx: 1.5, class: `escena__celda-relleno escena__celda-relleno--${kind}` }, g);
    make('rect', { x, y: TOP + 2.5, width: 8, height: 8, rx: 1.5, class: 'escena__celda' }, g);
    text(g, x + 11, TOP + 9.6, label, 'escena__leyenda');
    return { g, at };
  });
  const resumen = text(legend, 62, TOP + 28, 'Más de 90 de los 118 elementos son metales.', 'escena__nota-tabla', { opacity: 0 });

  const top = make('g', {}, board);
  const SENALES = [
    ['H', 'H · está en el grupo IA, pero no es metal', 13.6, 16.6],
    ['Hg', 'Hg · el único metal líquido', 16.6, 19.6],
    ['Br', 'Br · el único no metal líquido', 19.6, 22.6]
  ].map(([symbol, nota, a, b]) => {
    const cell = cells.get(symbol);
    const ring = make('rect', { x: cell.x - 2, y: cell.y - 2, width: CELL + 4, height: CELL + 4, rx: 3, class: 'escena__celda-aro', opacity: 0 }, top);
    const label = text(legend, 62, TOP + 44, nota, 'escena__nota-tabla escena__nota-tabla--acento', { opacity: 0 });
    return { ring, label, a, b };
  });

  let t = 0;
  function draw(time, final) {
    fade(board, final ? 1 : time < .8 ? smooth(time / .8) : 1 - smooth((time - (T - 1.2)) / 1.2));
    list.forEach(cell => fade(cell.fill, final ? 1 : (time - cell.start) / .45));
    const k = final ? 1 : smooth(span(time, 9, 11.6));
    stairs.setAttribute('stroke-dashoffset', round(LARGO * (1 - k)));
    // Sin esto, la punta redonda de la línea se ve como un punto antes de empezar.
    fade(stairs, k > 0 ? 1 : 0);
    items.forEach(item => fade(item.g, final ? 1 : (time - item.at) / .5));
    fade(resumen, final ? 1 : (time - 12) / .6);
    SENALES.forEach(s => {
      const a = final ? 0 : ventana(time, s.a, s.b);
      fade(s.ring, a);
      fade(s.label, a);
    });
  }

  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 2 · Martillo: maleable o quebradizo ----------------
   El mismo golpe a dos materiales. El cobre se aplana un poco más con cada
   martillazo (su volumen no cambia: se hace más delgado y más ancho). El
   azufre, de un solo golpe, se rompe en pedazos que caen al piso. */
function martillo(svg) {
  const T = 12.6, FLOOR = 128, LX = 92, RX = 268, LIFT = 30;
  const HITS = [1, 2.3, 3.6], HIT_R = 6.4;
  make('path', { d: `M12 ${FLOOR}H348`, class: 'escena__piso' }, svg);
  make('path', { d: `M180 18V${FLOOR + 32}`, class: 'escena__divisor' }, svg);
  const scene = make('g', {}, svg);

  // Bloque de cobre: el área se conserva al aplastarlo.
  const AREA = 44 * 26;
  const ALTURAS = [26, 17, 11.5, 7.5];
  const body = make('rect', { rx: 1.5, class: 'escena__metal' }, scene);
  const shine = make('rect', { rx: 1, class: 'escena__metal-reflejo' }, scene);
  function bloque(h) {
    const w = AREA / h;
    set(body, { x: LX - w / 2, y: FLOOR - h, width: w, height: h });
    set(shine, { x: LX - w / 2 + w * .1, y: FLOOR - h + h * .2, width: w * .55, height: Math.max(1.2, h * .14) });
  }
  function altura(t) {
    let h = ALTURAS[0];
    HITS.forEach((hit, k) => { if (t >= hit) h = mix(ALTURAS[k], ALTURAS[k + 1], smooth((t - hit) / .12)); });
    return h;
  }

  // Trozo de azufre: un polígono irregular que se parte en gajos desde el centro.
  const CY = FLOOR - 16;
  const rand = random(7);
  const outline = Array.from({ length: 9 }, (_, i) => {
    const a = i / 9 * TAU - Math.PI / 2;
    const r = 18 * (.86 + rand() * .26);
    return [Math.cos(a) * r, Math.sin(a) * r * .82];
  });
  const bottom = Math.max(...outline.map(p => p[1]));
  const cy = FLOOR - bottom;
  const lump = make('path', { d: `M${outline.map(p => p.map(round).join(' ')).join('L')}Z`, transform: `translate(${RX} ${round(cy)})`, class: 'escena__azufre' }, scene);
  const GRAVITY = 300;
  const shards = outline.map((p, i) => {
    const q = outline[(i + 1) % outline.length];
    const c = [(p[0] + q[0]) / 3, (p[1] + q[1]) / 3];
    const local = [[-c[0], -c[1]], [p[0] - c[0], p[1] - c[1]], [q[0] - c[0], q[1] - c[1]]];
    const reach = Math.max(...local.map(v => Math.hypot(v[0], v[1])));
    const angle = Math.atan2(c[1], c[0]);
    const vx = Math.cos(angle) * (40 + rand() * 22);
    const vy = Math.sin(angle) * 28 - 58 - rand() * 14;
    const drop = FLOOR - reach * .72 - (cy + c[1]);
    const root = vy * vy + 2 * GRAVITY * drop;
    const land = root > 0 ? (-vy + Math.sqrt(root)) / GRAVITY : .35;
    const node = make('path', { d: `M${local.map(v => v.map(round).join(' ')).join('L')}Z`, class: 'escena__azufre', opacity: 0 }, scene);
    return { node, c, vx, vy, land, spin: (rand() - .5) * 9 };
  });
  function romper(t) {
    const broken = t >= HIT_R;
    fade(lump, broken ? 0 : 1);
    shards.forEach(s => {
      fade(s.node, broken ? 1 : 0);
      if (!broken) return;
      const tau = Math.min(t - HIT_R, s.land);
      const x = RX + s.c[0] + s.vx * tau;
      const y = cy + s.c[1] + s.vy * tau + GRAVITY * tau * tau / 2;
      s.node.setAttribute('transform', `translate(${round(x)} ${round(y)}) rotate(${round(s.spin * tau * 57.3 / 6)})`);
    });
  }

  // Martillos: bajan acelerando, golpean y rebotan hacia arriba.
  function hammer(x) {
    const g = make('g', {}, scene);
    make('rect', { x: -2.6, y: -57, width: 5.2, height: 44, rx: 2, class: 'escena__mango' }, g);
    make('rect', { x: -17, y: -15, width: 34, height: 15, rx: 2.5, class: 'escena__martillo' }, g);
    make('rect', { x: -14, y: -12.6, width: 26, height: 2.6, rx: 1.2, class: 'escena__martillo-brillo' }, g);
    const sparks = make('g', { opacity: 0 }, scene);
    // Rayitas de impacto que salen de los bordes de la cabeza, casi a ras.
    [-170, -150, -30, -10].forEach(a => {
      const r = a * Math.PI / 180;
      make('path', {
        d: `M${round(x + Math.cos(r) * 21)} ${round(Math.sin(r) * 4)}L${round(x + Math.cos(r) * 30)} ${round(Math.sin(r) * 12)}`,
        class: 'escena__chispa'
      }, sparks);
    });
    return { g, sparks, x };
  }
  const left = hammer(LX), right = hammer(RX);
  function golpe(t, hits) {
    for (const h of hits) {
      if (t >= h - .55 && t < h) { const p = (t - (h - .55)) / .55; return -LIFT * (1 - p * p); }
      if (t >= h && t < h + .5) return -LIFT * smooth((t - h) / .5);
    }
    return -LIFT;
  }
  function chispa(t, hits) {
    return hits.reduce((a, h) => Math.max(a, t >= h && t < h + .3 ? 1 - (t - h) / .3 : 0), 0);
  }

  const labels = [
    text(scene, LX, FLOOR + 16, 'cobre · metal', 'escena__etiqueta', { 'text-anchor': 'middle' }),
    text(scene, RX, FLOOR + 16, 'azufre · no metal', 'escena__etiqueta', { 'text-anchor': 'middle' })
  ];
  const results = [
    text(scene, LX, FLOOR + 30, 'se aplana: es maleable', 'escena__resultado', { 'text-anchor': 'middle', opacity: 0 }),
    text(scene, RX, FLOOR + 30, 'se rompe: es quebradizo', 'escena__resultado', { 'text-anchor': 'middle', opacity: 0 })
  ];

  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : time < .5 ? smooth(time / .5) : 1 - smooth((time - 11.2) / 1));
    const h = final ? ALTURAS[3] : altura(time);
    bloque(h);
    left.g.setAttribute('transform', `translate(${LX} ${round(FLOOR - h + (final ? -LIFT : golpe(time, HITS)))})`);
    left.sparks.setAttribute('transform', `translate(0 ${round(FLOOR - h)})`);
    fade(left.sparks, final ? 0 : chispa(time, HITS));
    const lumpTop = cy + Math.min(...outline.map(p => p[1]));
    right.g.setAttribute('transform', `translate(${RX} ${round(lumpTop + (final ? -LIFT : golpe(time, [HIT_R])))})`);
    right.sparks.setAttribute('transform', `translate(0 ${round(lumpTop)})`);
    fade(right.sparks, final ? 0 : chispa(time, [HIT_R]));
    romper(final ? HIT_R + 3 : time);
    labels.forEach(label => fade(label, 1));
    fade(results[0], final ? 1 : (time - 4.3) / .5);
    fade(results[1], final ? 1 : (time - 7.4) / .5);
  }

  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(0, true); }
  };
}

/* ---------------- 3 · Circuito: ¿conduce la electricidad? ----------------
   Una pila, un foco y un hueco donde se pone la muestra. Con el cobre, los
   electrones avanzan por todo el circuito y el foco enciende. Con el azufre
   el circuito queda abierto: los electrones del cable no avanzan y el foco no
   enciende. Los electrones salen del polo negativo de la pila. */
function circuito(svg) {
  const T = 13, L = 60, R = 300, Y1 = 40, Y2 = 126, GAP1 = 146, GAP2 = 214;
  const scene = make('g', {}, svg);
  // Cables, con el hueco de la muestra abajo y la pila a la izquierda.
  make('path', { d: `M${L} 66V${Y1}H${R}V${Y2}H${GAP2}M${GAP1} ${Y2}H${L}V100`, class: 'escena__cable' }, scene);
  // Pila: el polo positivo arriba.
  make('rect', { x: L - 11, y: 70, width: 22, height: 30, rx: 2.5, class: 'escena__pila' }, scene);
  make('rect', { x: L - 5, y: 66, width: 10, height: 4, rx: 1, class: 'escena__pila-polo' }, scene);
  text(scene, L + 18, 77, '+', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(scene, L + 18, 99, '−', 'escena__etiqueta', { 'text-anchor': 'middle' });
  // Foco sobre el cable de arriba.
  const glow = make('circle', { cx: 180, cy: 25, r: 23, class: 'escena__foco-luz', opacity: 0 }, scene);
  const rays = make('g', { opacity: 0 }, scene);
  for (let i = 0; i < 8; i += 1) {
    const a = -Math.PI / 2 + (i - 3.5) * .42;
    make('path', { d: `M${round(180 + Math.cos(a) * 17)} ${round(25 + Math.sin(a) * 17)}L${round(180 + Math.cos(a) * 24)} ${round(25 + Math.sin(a) * 24)}`, class: 'escena__rayo' }, rays);
  }
  make('circle', { cx: 180, cy: 25, r: 12.5, class: 'escena__foco-vidrio' }, scene);
  const filament = make('path', { d: 'M174 30Q177 21 180 29Q183 21 186 30', class: 'escena__filamento' }, scene);
  make('rect', { x: 173.5, y: 35, width: 13, height: 6.5, rx: 1.2, class: 'escena__metal' }, scene);
  // Pinzas y muestra.
  [GAP1 - 4, GAP2 - 2].forEach(x => make('rect', { x, y: Y2 - 5, width: 6, height: 10, rx: 1.2, class: 'escena__pinza' }, scene));
  const sample = make('g', {}, scene);
  const copper = make('g', {}, sample);
  make('rect', { x: GAP1 + 4, y: Y2 - 9, width: GAP2 - GAP1 - 8, height: 18, rx: 1.5, class: 'escena__metal' }, copper);
  make('rect', { x: GAP1 + 10, y: Y2 - 5.5, width: 34, height: 2.4, rx: 1, class: 'escena__metal-reflejo' }, copper);
  const sulfur = make('g', { opacity: 0 }, sample);
  make('path', { d: `M${GAP1 + 6} ${Y2 + 6}Q${GAP1 + 3} ${Y2 - 7} ${GAP1 + 16} ${Y2 - 9}Q${GAP1 + 34} ${Y2 - 13} ${GAP2 - 16} ${Y2 - 8}Q${GAP2 - 4} ${Y2 - 6} ${GAP2 - 6} ${Y2 + 5}Q${GAP2 - 20} ${Y2 + 11} ${GAP1 + 20} ${Y2 + 10}Z`, class: 'escena__azufre' }, sulfur);

  // Recorrido de los electrones: del polo negativo, por fuera, al positivo.
  const PATH = [[L, 100], [L, Y2], [R, Y2], [R, Y1], [L, Y1], [L, 66]];
  const lengths = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
  const TOTAL = lengths.reduce((a, b) => a + b, 0);
  function punto(s) {
    let rest = ((s % TOTAL) + TOTAL) % TOTAL;
    for (let i = 0; i < lengths.length; i += 1) {
      if (rest <= lengths[i]) {
        const p = rest / lengths[i];
        return [mix(PATH[i][0], PATH[i + 1][0], p), mix(PATH[i][1], PATH[i + 1][1], p)];
      }
      rest -= lengths[i];
    }
    return PATH[PATH.length - 1];
  }
  const N = 18, SPEED = 30;
  const electrons = Array.from({ length: N }, () => make('circle', { r: 2.3, class: 'escena__electron' }, scene));

  const status = [
    text(scene, 180, 158, 'cobre · metal: conduce, el foco enciende', 'escena__resultado', { 'text-anchor': 'middle' }),
    text(scene, 180, 158, 'azufre · no metal: no conduce, el foco no enciende', 'escena__resultado escena__resultado--apagado', { 'text-anchor': 'middle', opacity: 0 })
  ];

  let t = 0, flow = 0;
  // 1 con el cobre puesto; 0 con el azufre.
  function conduce(time) {
    if (time < 5.6) return 1;
    if (time < 5.9) return 1 - smooth((time - 5.6) / .3);
    if (time < 12.3) return 0;
    return smooth((time - 12.3) / .4);
  }
  // Cambio de muestra: la de cobre baja y sale; sube la de azufre (y al revés).
  function muestra(time) {
    const out = (a, b) => smooth(span(time, a, b));
    if (time >= 5.6 && time < 6.1) return { copper: 1 - out(5.6, 6.1), sulfur: 0, dy: 26 * out(5.6, 6.1) };
    if (time >= 6.1 && time < 6.6) return { copper: 0, sulfur: out(6.1, 6.6), dy: 26 * (1 - out(6.1, 6.6)) };
    if (time >= 6.6 && time < 12) return { copper: 0, sulfur: 1, dy: 0 };
    if (time >= 12 && time < 12.5) return { copper: 0, sulfur: 1 - out(12, 12.5), dy: 26 * out(12, 12.5) };
    if (time >= 12.5) return { copper: out(12.5, 13), sulfur: 0, dy: 26 * (1 - out(12.5, 13)) };
    return { copper: 1, sulfur: 0, dy: 0 };
  }
  function draw(time, final) {
    const on = final ? 1 : conduce(time);
    const m = final ? { copper: 1, sulfur: 0, dy: 0 } : muestra(time);
    fade(copper, m.copper);
    fade(sulfur, m.sulfur);
    sample.setAttribute('transform', `translate(0 ${round(m.dy)})`);
    fade(glow, on * .9);
    fade(rays, on);
    filament.classList.toggle('es-encendido', on > .5);
    electrons.forEach((dot, i) => {
      const [x, y] = punto(flow + i * TOTAL / N);
      set(dot, { cx: x, cy: y });
      // En el hueco de la muestra sólo hay electrones que avanzan si conduce.
      const inGap = y === Y2 && x > GAP1 && x < GAP2;
      fade(dot, inGap ? on : .35 + .65 * on);
    });
    const copperShown = final || time < 5.9 || time >= 12.5;
    fade(status[0], copperShown ? 1 : 0);
    fade(status[1], copperShown ? 0 : 1);
  }

  return {
    update(dt) {
      t = (t + dt) % T;
      flow += dt * SPEED * conduce(t);
      draw(t, false);
    },
    still() { draw(0, true); }
  };
}

/* ---------------- Rutas con oxígeno (HTML) ----------------
   Los pasos de cada ruta aparecen uno tras otro la primera vez que la figura
   entra en pantalla; con movimiento reducido se muestran completos. */
document.querySelectorAll('[data-rutas]').forEach(node => {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  // Sin JavaScript los pasos se ven completos: sólo se ocultan si van a aparecer.
  node.classList.add('is-armed');
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { node.classList.add('is-visible'); observer.disconnect(); }
  }, { threshold: .35 });
  observer.observe(node);
});

/* ---------------- Reloj compartido ---------------- */
const factories = { mapa, martillo, circuito };
const scenes = [...document.querySelectorAll('[data-escena-tabla]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaTabla](svg)
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
