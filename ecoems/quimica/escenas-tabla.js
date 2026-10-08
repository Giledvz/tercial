/* Escenas de la tabla periódica, tema 2 de Química ECOEMS: metales, no
   metales y metaloides, y las propiedades que los distinguen.
   Mismo contrato que escenas-atomo.js: cada escena es { update(dt), still() };
   el reloj compartido sólo avanza las escenas visibles y, con movimiento
   reducido, cada una dibuja un fotograma fijo que resume el proceso.
   Colores de la lección: metales en gris metálico, metaloides en mostaza y no
   metales en verde azulado; el terracota marca lo que hay que mirar (la
   escalera, el elemento señalado, lo que sí conduce). */
import { ELEMENTOS } from './elementos.js';
import { elementPicker } from './selector-elemento.js';

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const round = value => Math.round(value * 100) / 100;
const span = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = value => { const p = 1 - clamp(value); return 1 - p * p * p; };
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

function posicion(element, top = TOP) {
  if (element.familia === 'lantanido' || element.familia === 'actinido') {
    const lantanido = element.familia === 'lantanido';
    const first = lantanido ? 57 : 89;
    return { x: LEFT + (2 + element.numero - first) * P, y: top + (lantanido ? 7 : 8) * P + GAP_F };
  }
  return { x: LEFT + (element.grupo - 1) * P, y: top + (element.periodo - 1) * P };
}

function tabla(parent, top = TOP) {
  const ejes = make('g', {}, parent);
  for (const [grupo, nombre] of Object.entries(ROMANOS_A)) {
    text(ejes, LEFT + (grupo - 1) * P + CELL / 2, top - 4, nombre, 'escena__tabla-grupo', { 'text-anchor': 'middle' });
  }
  for (let periodo = 1; periodo <= 7; periodo += 1) {
    text(ejes, LEFT - 6, top + (periodo - 1) * P + CELL / 2 + 2.2, String(periodo), 'escena__tabla-periodo', { 'text-anchor': 'middle' });
  }
  ['Lantánidos', 'Actínidos'].forEach((nombre, i) => text(ejes, LEFT + 2 * P - 3, top + (7 + i) * P + GAP_F + CELL / 2 + 2, nombre,
    'escena__tabla-grupo', { 'text-anchor': 'end' }));
  // Donde van los lantánidos y los actínidos queda un hueco punteado.
  [6, 7].forEach(periodo => make('rect', {
    x: LEFT + 2 * P, y: top + (periodo - 1) * P, width: CELL, height: CELL, rx: 2, class: 'escena__celda-hueco'
  }, parent));
  const cells = new Map();
  ELEMENTOS.forEach(element => {
    const { x, y } = posicion(element, top);
    const g = make('g', { transform: `translate(${x} ${y})` }, parent);
    const kind = clase(element);
    make('rect', { width: CELL, height: CELL, rx: 2, class: 'escena__celda' }, g);
    const fill = make('rect', { width: CELL, height: CELL, rx: 2, class: `escena__celda-relleno escena__celda-relleno--${kind}`, opacity: 0 }, g);
    const label = text(g, CELL / 2, CELL / 2 + 2.9, element.simbolo, 'escena__celda-simbolo', { 'text-anchor': 'middle' });
    cells.set(element.simbolo, { element, kind, fill, label, g, x, y });
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
  const T = 12.6, FLOOR = 128, LX = 86, RX = 262;
  const HITS = [1, 2.3, 3.6], HIT_R = 6.4;
  make('path', { d: `M12 ${FLOOR}H348`, class: 'escena__piso' }, svg);
  make('path', { d: `M180 18V${FLOOR + 32}`, class: 'escena__divisor' }, svg);
  const scene = make('g', {}, svg);

  // Bloque de cobre: el área se conserva al aplastarlo.
  const AREA = 44 * 26;
  const ALTURAS = [26, 17, 11.5, 7.5];
  const body = make('rect', { rx: 1.5, class: 'escena__cobre' }, scene);
  const edge = make('rect', { rx: 1.5, class: 'escena__cobre-sombra' }, scene);
  const shine = make('rect', { rx: 1, class: 'escena__cobre-brillo' }, scene);
  function bloque(h) {
    const w = AREA / h;
    set(body, { x: LX - w / 2, y: FLOOR - h, width: w, height: h });
    set(edge, { x: LX - w / 2, y: FLOOR - h * .28, width: w, height: h * .28 });
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
  /* Los pedazos caen con física de verdad. Cada uno es un triángulo rígido que
     vuela con gravedad y girando; toca el suelo cuando su punto más bajo llega
     a la línea y entonces se vuelca, sin hundirse, hasta quedar acostado sobre
     el lado más cercano. Todo se calcula al inicio, así que cada fotograma es
     una función del tiempo (el ciclo y el fotograma fijo salen iguales). */
  const SUELO = FLOOR - .5;  // borde de arriba de la línea del piso
  const bottom = Math.max(...outline.map(p => p[1]));
  const cy = SUELO - bottom;
  const lump = make('path', { d: `M${outline.map(p => p.map(round).join(' ')).join('L')}Z`, transform: `translate(${RX} ${round(cy)})`, class: 'escena__azufre' }, scene);
  const GRAVITY = 320;
  const girar = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  // Qué tan abajo del centroide queda el punto más bajo con el giro a.
  const fondo = (verts, a) => Math.max(...verts.map(v => girar(v, a)[1]));
  const shards = outline.map((p, i) => {
    const q = outline[(i + 1) % outline.length];
    const c = [(p[0] + q[0]) / 3, (p[1] + q[1]) / 3];
    const local = [[-c[0], -c[1]], [p[0] - c[0], p[1] - c[1]], [q[0] - c[0], q[1] - c[1]]];
    const angle = Math.atan2(c[1], c[0]);
    const vx = Math.cos(angle) * (40 + rand() * 22);
    const vy = Math.sin(angle) * 28 - 58 - rand() * 14;
    const omega = (rand() - .5) * 7;
    const x0 = RX + c[0], y0 = cy + c[1];
    const yAt = tau => y0 + vy * tau + GRAVITY * tau * tau / 2;
    const toca = tau => yAt(tau) + fondo(local, omega * tau) >= SUELO;
    // Vuelo: el primer instante en que el punto más bajo llega al suelo.
    let lo = .02, hi = .02;
    while (!toca(hi) && hi < 3) { lo = hi; hi += .005; }
    for (let k = 0; k < 18; k += 1) { const mid = (lo + hi) / 2; if (toca(mid)) hi = mid; else lo = mid; }
    const land = hi, aLand = omega * land, xLand = x0 + vx * land;
    // Reposo: de los tres lados, el que queda plano con el menor giro y con el
    // tercer vértice arriba (y menor, porque en SVG y crece hacia abajo).
    let aRest = aLand, best = Infinity;
    for (let e = 0; e < 3; e += 1) {
      const a = local[e], b = local[(e + 1) % 3], third = local[(e + 2) % 3];
      const base = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      [base, base + Math.PI].forEach(cand => {
        if (girar(third, cand)[1] >= girar(a, cand)[1] - 1e-6) return;
        const turns = Math.round((aLand - cand) / TAU);
        const option = cand + turns * TAU;
        if (Math.abs(option - aLand) < best) { best = Math.abs(option - aLand); aRest = option; }
      });
    }
    const settle = .14 + .22 * Math.min(1, best / Math.PI);
    const xRest = xLand + vx * .05;
    const node = make('path', { d: `M${local.map(v => v.map(round).join(' ')).join('L')}Z`, class: 'escena__azufre', opacity: 0 }, scene);
    return { node, local, x0, vx, omega, yAt, land, aLand, xLand, aRest, xRest, settle };
  });
  function romper(t) {
    const broken = t >= HIT_R;
    fade(lump, broken ? 0 : 1);
    shards.forEach(sh => {
      fade(sh.node, broken ? 1 : 0);
      if (!broken) return;
      const tau = t - HIT_R;
      let x, y, a;
      if (tau < sh.land) {
        a = sh.omega * tau;
        x = sh.x0 + sh.vx * tau;
        y = sh.yAt(tau);
      } else {
        const u = easeOut(Math.min(1, (tau - sh.land) / sh.settle));
        a = mix(sh.aLand, sh.aRest, u);
        x = mix(sh.xLand, sh.xRest, u);
        y = SUELO - fondo(sh.local, a);
      }
      sh.node.setAttribute('transform', `translate(${round(x)} ${round(y)}) rotate(${round(a * 180 / Math.PI)})`);
    });
  }

  /* Martillos: se mueven como en la mano. El brazo gira desde el codo (un
     pivote invisible a la derecha) y la muñeca dobla el martillo un poco más.
     Al bajar, el codo baja primero y la muñeca se suelta al final, como un
     látigo; en el golpe el mango queda horizontal y la cara de la cabeza cae
     plana sobre la pieza. Ángulos en grados, 0 en el golpe. */
  const L = 50, A = 34, FACE = 15.2, CODO = 30, MUNECA = 40;
  // El martillo de carpintero, dibujado con el mango hacia la derecha y la
  // cabeza en (−L, 0): cara de golpe abajo y uña curva arriba, vuelta hacia el
  // mango, como la que saca clavos.
  const H = -L;
  const CABEZA = `M${H - 6.8} 13.6Q${H - 6.8} ${FACE} ${H - 5.2} ${FACE}H${H + 5.2}Q${H + 6.8} ${FACE} ${H + 6.8} 13.6` +
    `V10.8L${H + 4.6} 9.6V5.2L${H + 6} 4.2V-3.4L${H + 5} -5.4C${H + 4.6} -10.5 ${H + 6} -15.5 ${H + 9.5} -21.5` +
    `C${H + 3} -19.6 ${H - 3} -14.6 ${H - 4.6} -5.4L${H - 6} -3.4V4.2L${H - 4.6} 5.2V9.6L${H - 6.8} 10.8Z`;
  function hammer(x) {
    const arm = make('g', {}, scene);
    const hand = make('g', {}, arm);
    // Mango de madera, más grueso hacia la empuñadura.
    make('path', { d: `M${H + 5} -2.1L-8 -2.7Q2 -3.4 7 -3.9Q9.6 -3.9 9.6 0Q9.6 3.9 7 3.9Q2 3.4 -8 2.7L${H + 5} 2.1Z`, class: 'escena__mango' }, hand);
    make('path', { d: `M${H + 9} -0.6L-10 -0.9`, class: 'escena__mango-veta' }, hand);
    make('path', { d: CABEZA, class: 'escena__martillo' }, hand);
    make('path', { d: `M${H - 6.8} 13.6Q${H - 6.8} ${FACE} ${H - 5.2} ${FACE}H${H + 5.2}Q${H + 6.8} ${FACE} ${H + 6.8} 13.6V10.8H${H - 6.8}Z`, class: 'escena__martillo-cara' }, hand);
    make('path', { d: `M${H + 1.4} -6.5C${H + 1.4} -11.5 ${H + 3} -16 ${H + 6.6} -19.8`, class: 'escena__martillo-ranura' }, hand);
    make('rect', { x: H - 4.3, y: -2.6, width: 1.8, height: 9.5, rx: .9, class: 'escena__martillo-brillo' }, hand);
    const sparks = make('g', { opacity: 0 }, scene);
    // Rayitas de impacto que salen de los bordes de la cara, casi a ras.
    [-168, -150, -30, -12].forEach(a => {
      const r = a * Math.PI / 180;
      make('path', {
        d: `M${round(x + Math.cos(r) * 10)} ${round(Math.sin(r) * 3)}L${round(x + Math.cos(r) * 19)} ${round(Math.sin(r) * 10)}`,
        class: 'escena__chispa'
      }, sparks);
    });
    return { arm, hand, sparks, x };
  }
  const left = hammer(LX), right = hammer(RX);
  // [codo, muñeca]: arriba en reposo; baja acelerando y la muñeca se suelta al final.
  function golpe(t, hits) {
    for (const h of hits) {
      if (t >= h - .62 && t < h) {
        const p = (t - (h - .62)) / .62;
        return [CODO * (1 - p * p), MUNECA * (1 - p * p * p)];
      }
      if (t >= h && t < h + .6) {
        const q = smooth((t - h) / .6);
        return [CODO * q, MUNECA * q * q];
      }
    }
    return [CODO, MUNECA];
  }
  function chispa(t, hits) {
    return hits.reduce((a, h) => Math.max(a, t >= h && t < h + .3 ? 1 - (t - h) / .3 : 0), 0);
  }
  // El codo queda a la derecha de la pieza, a la altura que deja la cara justo encima.
  function pose(hammer, top, [codo, muneca]) {
    hammer.arm.setAttribute('transform', `translate(${round(hammer.x + L + A)} ${round(top - FACE)}) rotate(${round(codo)})`);
    hammer.hand.setAttribute('transform', `translate(${-A} 0) rotate(${round(muneca)})`);
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
    pose(left, FLOOR - h, final ? [CODO, MUNECA] : golpe(time, HITS));
    left.sparks.setAttribute('transform', `translate(0 ${round(FLOOR - h)})`);
    fade(left.sparks, final ? 0 : chispa(time, HITS));
    const lumpTop = cy + Math.min(...outline.map(p => p[1]));
    pose(right, lumpTop, final ? [CODO, MUNECA] : golpe(time, [HIT_R]));
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
  const T = 13, L = 60, R = 300, Y1 = 54, Y2 = 132, GAP1 = 146, GAP2 = 214;
  const scene = make('g', {}, svg);
  const uid = Math.random().toString(36).slice(2, 7);
  const defs = make('defs', {}, svg);
  const halo = make('radialGradient', { id: `halo${uid}` }, defs);
  make('stop', { offset: 0, class: 'escena__halo-centro' }, halo);
  make('stop', { offset: 1, class: 'escena__halo-borde' }, halo);
  // Cables, con el hueco de la muestra abajo y la pila a la izquierda.
  // El cable de la izquierda llega a la rosca del foco y el de la derecha a su
  // contacto de abajo: así la corriente tiene que cruzar el filamento.
  make('path', { d: `M${L} 74V${Y1}H171V${Y1 - 6.5}H174.4M180 ${Y1}H${R}V${Y2}H${GAP2}M${GAP1} ${Y2}H${L}V108`, class: 'escena__cable' }, scene);
  // Pila: el polo positivo arriba.
  make('rect', { x: L - 11, y: 78, width: 22, height: 30, rx: 2.5, class: 'escena__pila' }, scene);
  make('rect', { x: L - 5, y: 74, width: 10, height: 4, rx: 1, class: 'escena__pila-polo' }, scene);
  text(scene, L + 18, 86, '+', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(scene, L + 18, 107, '−', 'escena__etiqueta', { 'text-anchor': 'middle' });
  // Foco incandescente sobre el cable de arriba: vidrio en forma de pera,
  // casquillo de rosca, dos alambres de soporte y el filamento en espiral.
  const bulb = make('g', { transform: `translate(180 ${Y1 - 19})` }, scene);
  const glow = make('circle', { cy: -10, r: 24, fill: `url(#halo${uid})`, opacity: 0 }, bulb);
  const rays = make('g', { opacity: 0 }, bulb);
  for (let i = 0; i < 9; i += 1) {
    const a = (-162 + i * 18) * Math.PI / 180;
    make('path', { d: `M${round(Math.cos(a) * 16.5)} ${round(-10 + Math.sin(a) * 16.5)}L${round(Math.cos(a) * 22.5)} ${round(-10 + Math.sin(a) * 22.5)}`, class: 'escena__rayo' }, rays);
  }
  const glass = make('path', { d: 'M-5 8C-5 3.5 -13 -2 -13 -10A13 13 0 0 1 13 -10C13 -2 5 3.5 5 8Z', class: 'escena__foco-vidrio' }, bulb);
  make('path', { d: 'M-2.4 8L-4.2 -7.6M2.4 8L4.2 -7.6', class: 'escena__foco-hilo' }, bulb);
  const filament = make('path', { d: 'M-4.2 -7.6q1.05 -2.6 2.1 0t2.1 0t2.1 0t2.1 0', class: 'escena__filamento' }, bulb);
  make('path', { d: 'M-8.6 -14.8A9.2 9.2 0 0 1 -3.4 -19.6', class: 'escena__foco-reflejo' }, bulb);
  make('rect', { x: -5.6, y: 8, width: 11.2, height: 9, rx: 1.4, class: 'escena__foco-rosca' }, bulb);
  make('path', { d: 'M-5.6 10.6L5.6 9.4M-5.6 13.2L5.6 12M-5.6 15.8L5.6 14.6', class: 'escena__foco-vuelta' }, bulb);
  make('path', { d: 'M-3 17h6l-1.2 2h-3.6Z', class: 'escena__foco-contacto' }, bulb);
  // Pinzas y muestra.
  [GAP1 - 4, GAP2 - 2].forEach(x => make('rect', { x, y: Y2 - 5, width: 6, height: 10, rx: 1.2, class: 'escena__pinza' }, scene));
  const sample = make('g', {}, scene);
  const copper = make('g', {}, sample);
  make('rect', { x: GAP1 + 4, y: Y2 - 9, width: GAP2 - GAP1 - 8, height: 18, rx: 1.5, class: 'escena__cobre' }, copper);
  make('rect', { x: GAP1 + 4, y: Y2 + 4, width: GAP2 - GAP1 - 8, height: 5, rx: 1.5, class: 'escena__cobre-sombra' }, copper);
  make('rect', { x: GAP1 + 10, y: Y2 - 5.5, width: 34, height: 2.4, rx: 1, class: 'escena__cobre-brillo' }, copper);
  const sulfur = make('g', { opacity: 0 }, sample);
  make('path', { d: `M${GAP1 + 6} ${Y2 + 6}Q${GAP1 + 3} ${Y2 - 7} ${GAP1 + 16} ${Y2 - 9}Q${GAP1 + 34} ${Y2 - 13} ${GAP2 - 16} ${Y2 - 8}Q${GAP2 - 4} ${Y2 - 6} ${GAP2 - 6} ${Y2 + 5}Q${GAP2 - 20} ${Y2 + 11} ${GAP1 + 20} ${Y2 + 10}Z`, class: 'escena__azufre' }, sulfur);

  // Recorrido de los electrones: del polo negativo, por fuera, al positivo.
  // Por el foco: entra por el contacto, sube por el alambre derecho, cruza el
  // filamento, baja por el izquierdo y sale por la rosca.
  const PATH = [[L, 108], [L, Y2], [R, Y2], [R, Y1], [180, Y1], [182.4, Y1 - 11], [184.2, Y1 - 26.6],
    [175.8, Y1 - 26.6], [177.6, Y1 - 11], [174.4, Y1 - 6.5], [171, Y1 - 6.5], [171, Y1], [L, Y1], [L, 74]];
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
    text(scene, 180, 162, 'cobre · metal: conduce, el foco enciende', 'escena__resultado', { 'text-anchor': 'middle' }),
    text(scene, 180, 162, 'azufre · no metal: no conduce, el foco no enciende', 'escena__resultado escena__resultado--apagado', { 'text-anchor': 'middle', opacity: 0 })
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
    glass.classList.toggle('es-encendido', on > .5);
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

/* ---------------- Tabla por bloques (regla de las diagonales) ----------------
   Aquí cada elemento se acomoda según su último subnivel, calculado con la
   regla de las diagonales: el bloque f queda de 14 columnas (del La al Yb y
   del Ac al No) y el Lu y el Lr van en el grupo 3. Así la forma de la tabla
   sale tal cual del orden de llenado. */
const ORDEN = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const CAPACIDAD = { s: 2, p: 6, d: 10, f: 14 };
const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUPER[Number(d)]).join('');
const GASES_NOBLES = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
// Elementos cuya configuración real no sigue la regla de las diagonales.
const EXCEPCIONES = new Set([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103]);

function llenar(z) {
  let rest = z;
  const terms = [];
  for (const sub of ORDEN) {
    if (rest <= 0) break;
    const n = Math.min(CAPACIDAD[sub[1]], rest);
    terms.push({ sub, n });
    rest -= n;
  }
  return terms;
}

export function lugar(z) {
  const terms = llenar(z);
  const last = terms[terms.length - 1];
  const tipo = last.sub[1];
  const periodo = Math.max(...terms.map(term => Number(term.sub[0])));
  let columna = null;
  if (z === 2) columna = 18;
  else if (tipo === 's') columna = last.n;
  else if (tipo === 'p') columna = 12 + last.n;
  else if (tipo === 'd') columna = 2 + last.n;
  const gas = GASES_NOBLES.find(g => g[0] < z);
  const corto = gas ? terms.slice(llenar(gas[0]).length) : terms;
  const abreviada = (gas ? `[${gas[1]}] ` : '') + corto.map(term => term.sub + sup(term.n)).join(' ');
  return { z, terms, last, tipo, periodo, columna, f: tipo === 'f' ? last.n : 0, abreviada };
}

const TOP_B = 30, GAP_B = 16;
function posicionBloque(info) {
  if (info.tipo === 'f') return { x: LEFT + (1 + info.f) * P, y: TOP_B + (info.periodo === 6 ? 7 : 8) * P + GAP_B };
  return { x: LEFT + (info.columna - 1) * P, y: TOP_B + (info.periodo - 1) * P };
}

function tablaBloques(parent) {
  const ejes = make('g', {}, parent);
  for (let periodo = 1; periodo <= 7; periodo += 1) {
    text(ejes, LEFT - 6, TOP_B + (periodo - 1) * P + CELL / 2 + 2.2, String(periodo), 'escena__tabla-periodo', { 'text-anchor': 'middle' });
  }
  // El bloque f se inserta entre los grupos 2 y 3: una línea punteada lo indica.
  const x = LEFT + 2 * P - (P - CELL) / 2;
  make('path', { d: `M${round(x)} ${TOP_B + 5 * P}V${TOP_B + 7 * P + GAP_B}`, class: 'escena__insercion' }, ejes);
  const cells = new Map();
  ELEMENTOS.forEach(element => {
    const info = lugar(element.numero);
    const { x: cx, y: cy } = posicionBloque(info);
    const g = make('g', { transform: `translate(${cx} ${cy})` }, parent);
    const base = make('rect', { width: CELL, height: CELL, rx: 2, class: 'escena__celda' }, g);
    const fill = make('rect', { width: CELL, height: CELL, rx: 2, class: `escena__celda-relleno escena__celda-relleno--${info.tipo}`, opacity: 0 }, g);
    const label = text(g, CELL / 2, CELL / 2 + 2.9, element.simbolo, 'escena__celda-simbolo', { 'text-anchor': 'middle' });
    cells.set(element.numero, { element, info, g, base, fill, label, x: cx, y: cy });
  });
  return cells;
}

// Corchete con su letrero sobre un bloque: de la columna a a la b.
function corchete(parent, x1, x2, y, label) {
  const g = make('g', { opacity: 0 }, parent);
  make('path', { d: `M${round(x1)} ${y + 3}V${y}H${round(x2)}V${y + 3}`, class: 'escena__corchete' }, g);
  text(g, round((x1 + x2) / 2), y - 3, label, 'escena__leyenda', { 'text-anchor': 'middle' });
  return g;
}

/* ---------------- 4 · Bloques: la tabla se arma electrón por electrón ----------------
   Los elementos aparecen en orden de número atómico; cada uno en el bloque de
   su último subnivel. Arriba se ve qué subnivel se está llenando. Al final,
   cada bloque muestra cuántas columnas tiene: 2, 6, 10 y 14, lo mismo que caben
   en s, p, d y f. */
function bloques(svg) {
  const T = 32, POR = .11, PAUSA = .35;
  const board = make('g', {}, svg);
  const cells = tablaBloques(board);
  let time0 = .6, previous = null;
  for (let z = 1; z <= ELEMENTOS.length; z += 1) {
    const cell = cells.get(z);
    if (cell.info.last.sub !== previous) { time0 += PAUSA; previous = cell.info.last.sub; }
    cell.start = time0;
    time0 += POR;
  }
  const FIN = time0;
  cells.forEach(cell => { fade(cell.g, 0); });

  // Lo que se está llenando, en el hueco de arriba.
  const panel = make('g', {}, board);
  const subLabel = text(panel, 62, TOP_B + 24, '', 'escena__subnivel-grande');
  const zLabel = text(panel, 62, TOP_B + 40, '', 'escena__nota-tabla');
  const resumen = text(panel, 62, TOP_B + 14, 'Cada bloque tiene tantas columnas', 'escena__leyenda', { opacity: 0 });
  const resumen2 = text(panel, 62, TOP_B + 25, 'como electrones caben en su subnivel.', 'escena__leyenda', { opacity: 0 });

  const col = c => LEFT + (c - 1) * P;
  const brackets = [
    [corchete(board, col(1), col(2) + CELL, TOP_B - 9, 's · 2 columnas'), FIN + .2],
    [corchete(board, col(13), col(18) + CELL, TOP_B - 9, 'p · 6 columnas'), FIN + 1],
    [corchete(board, col(3), col(12) + CELL, TOP_B + 3 * P - 7, 'd · 10 columnas'), FIN + 1.8],
    [corchete(board, col(3), col(16) + CELL, TOP_B + 7 * P + GAP_B - 7, 'f · 14 columnas'), FIN + 2.6]
  ];
  const he = cells.get(2);
  const ring = make('rect', { x: he.x - 2, y: he.y - 2, width: CELL + 4, height: CELL + 4, rx: 3, class: 'escena__celda-aro', opacity: 0 }, board);
  const heNote = text(panel, 62, TOP_B + 39, 'He · 1s²: bloque s, pero va con los gases nobles', 'escena__nota-tabla escena__nota-tabla--acento', { opacity: 0 });

  let t = 0, shown = 0;
  function draw(time, final) {
    fade(board, final ? 1 : time < .6 ? smooth(time / .6) : 1 - smooth((time - (T - 1.5)) / 1.5));
    let current = null;
    cells.forEach(cell => {
      const a = final ? 1 : smooth((time - cell.start) / .25);
      fade(cell.g, a);
      fade(cell.fill, a);
      if (!final && time >= cell.start) current = cell;
    });
    const building = !final && time < FIN + .2;
    if (current && building && shown !== current.element.numero) {
      shown = current.element.numero;
      subLabel.textContent = current.info.last.sub;
      zLabel.textContent = `Z = ${current.element.numero} · ${current.element.simbolo} · se llena el subnivel ${current.info.last.sub}`;
    }
    fade(subLabel, building && current ? 1 : 0);
    fade(zLabel, building && current ? 1 : 0);
    brackets.forEach(([g, at]) => fade(g, final ? 1 : (time - at) / .5));
    const fin = final ? 1 : (time - (FIN + 3.2)) / .6;
    fade(resumen, fin);
    fade(resumen2, fin);
    const nota = final ? 0 : ventana(time, FIN + 4.6, FIN + 8.6);
    fade(ring, nota);
    fade(heNote, nota);
  }

  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 5 · Ubicar: dónde va cualquier elemento ----------------
   Se elige un elemento con el buscador y se enciende su casilla: su bloque
   queda resaltado y arriba aparecen su configuración, su último subnivel, el
   bloque, el periodo y la columna. */
function ubicar(svg) {
  const root = svg.closest('[data-ubicar]');
  const live = root.querySelector('[data-ubicar-live]');
  const board = make('g', {}, svg);
  const cells = tablaBloques(board);
  const ring = make('rect', { width: CELL + 4, height: CELL + 4, rx: 3, class: 'escena__celda-aro' }, board);
  const panel = make('g', {}, board);
  const name = text(panel, 62, TOP_B + 14, '', 'escena__ubicar-nombre');
  const config = text(panel, 62, TOP_B + 31, '', 'escena__ubicar-config');
  const facts = text(panel, 62, TOP_B + 45, '', 'escena__nota-tabla');
  const note = text(panel, 62, TOP_B + 57, '', 'escena__nota-tabla escena__nota-tabla--acento');
  const picker = elementPicker(root, 26, z => show(z, true));
  let pulse = 1;

  function show(z, animate) {
    const cell = cells.get(z);
    const { info, element } = cell;
    cells.forEach(other => {
      fade(other.g, 1);
      fade(other.fill, other.info.tipo === info.tipo ? .95 : .3);
    });
    set(ring, { x: cell.x - 2, y: cell.y - 2 });
    name.textContent = `${element.numero} · ${element.simbolo} · ${element.nombre}`;
    config.textContent = `${info.abreviada}`;
    const columna = info.columna ? `columna ${info.columna}` : 'fila del bloque f';
    facts.textContent = `último subnivel ${info.last.sub}${sup(info.last.n)} · bloque ${info.tipo} · periodo ${info.periodo} · ${columna}`;
    // Un solo renglón: debajo empiezan las casillas del periodo 4.
    note.textContent = z === 2 ? 'Bloque s, pero va con los gases nobles.'
      : EXCEPCIONES.has(z) ? 'Ojo: excepción; su configuración real es otra.' : '';
    if (live) live.textContent = `${element.nombre}: ${info.abreviada}. Último subnivel ${info.last.sub}${sup(info.last.n)}, bloque ${info.tipo}, periodo ${info.periodo}, ${columna}. ${note.textContent}`.trim();
    pulse = animate && !reducedMotion.matches ? 0 : 1;
    ring.setAttribute('opacity', pulse);
  }

  show(picker.value, false);
  return {
    update(dt) {
      if (pulse >= 1) return;
      pulse = Math.min(1, pulse + dt / .45);
      ring.setAttribute('opacity', round(smooth(pulse)));
      const grow = 1 + (1 - smooth(pulse)) * .5;
      ring.setAttribute('stroke-width', round(1.6 * grow));
    },
    still() { pulse = 1; ring.setAttribute('opacity', 1); }
  };
}

/* ---------------- 6 · Tendencias periódicas ----------------
   La tabla muestra hacia dónde aumenta cada propiedad: un degradado
   terracota sobre los elementos representativos, flechas de «aumenta» y el
   extremo señalado. No son valores medidos, es la tendencia general; los
   metales de transición, el hidrógeno y, donde no aplica, los gases nobles
   quedan en gris. */
const COLUMNAS_A = { 1: 0, 2: 1, 13: 2, 14: 3, 15: 4, 16: 5, 17: 6, 18: 7 };
export const PROPIEDADES = {
  electronegatividad: {
    nombre: 'Electronegatividad', sentido: 'arriba', sinNobles: true, extremos: ['F'],
    definicion: 'Qué tanto atrae un átomo los electrones de un enlace.',
    aumenta: 'hacia arriba y hacia la derecha',
    nota: 'El flúor es el más electronegativo: 3.98 en la escala de Pauling; el cesio, de los que menos (0.79). Los gases nobles casi no forman enlaces y no se toman en cuenta.'
  },
  ionizacion: {
    nombre: 'Energía de ionización', sentido: 'arriba', extremos: ['He'],
    definicion: 'La energía necesaria para arrancarle a un átomo su electrón más externo.',
    aumenta: 'hacia arriba y hacia la derecha',
    nota: 'El helio es el que más energía necesita y el cesio, el que menos: su último electrón está lejos del núcleo.'
  },
  afinidad: {
    nombre: 'Afinidad electrónica', sentido: 'arriba', sinNobles: true, extremos: ['Cl'],
    definicion: 'La energía que se libera cuando un átomo neutro gana un electrón y forma un ion negativo.',
    aumenta: 'en general, hacia arriba y hacia la derecha',
    nota: 'Es la tendencia con más excepciones: el cloro libera más energía que el flúor. Los gases nobles no ganan electrones y no se toman en cuenta.'
  },
  metalico: {
    nombre: 'Carácter metálico', sentido: 'abajo', extremos: ['Cs'],
    definicion: 'Qué tan fácil pierde electrones un átomo: mientras más fácil, más metálico.',
    aumenta: 'hacia abajo y hacia la izquierda',
    nota: 'El carácter no metálico va al revés: el flúor es el más no metálico. Debajo del cesio está el francio, pero es radiactivo y casi no se ha estudiado.'
  },
  radio: {
    nombre: 'Radio atómico', sentido: 'abajo', extremos: ['Cs'], menor: 'He',
    definicion: 'La distancia del centro del núcleo al electrón más externo de un átomo neutro.',
    aumenta: 'hacia abajo y hacia la izquierda',
    nota: 'El helio es el más pequeño y el cesio, de los más grandes. Hacia abajo se agregan niveles; hacia la derecha el núcleo jala con más fuerza el mismo nivel.'
  }
};

function flecha(parent, d, head) {
  const g = make('g', { opacity: 0 }, parent);
  const line = make('path', { d, class: 'escena__tendencia-linea' }, g);
  const tip = make('path', { d: head, class: 'escena__tendencia-punta' }, g);
  return { g, line, tip };
}

function tendencias(svg) {
  const root = svg.closest('[data-tendencias]');
  const buttons = [...root.querySelectorAll('[data-tendencia]')];
  const panel = root.querySelector('[data-tendencia-texto]');
  const TOP_T = 32, RIGHT = LEFT + 18 * P - (P - CELL);
  const board = make('g', {}, svg);
  const cells = [...tabla(board, TOP_T).values()];
  cells.forEach(cell => {
    const col = COLUMNAS_A[cell.element.grupo];
    const fBlock = cell.element.familia === 'lantanido' || cell.element.familia === 'actinido';
    cell.rep = col !== undefined && !fBlock && cell.element.simbolo !== 'H';
    cell.col = col;
    cell.noble = cell.element.familia === 'gas-noble';
    cell.value = 0;
    cell.fill.setAttribute('class', 'escena__celda-relleno ' + (cell.rep ? 'escena__celda-relleno--calor' : 'escena__celda-relleno--neutra'));
    fade(cell.fill, cell.rep ? 0 : 1);
  });

  // Flechas: arriba, a lo largo de los grupos; a la derecha, a lo largo de los periodos.
  const yH = 20, xV = RIGHT + 12, yTop = TOP_T, yBottom = TOP_T + 7 * P - (P - CELL);
  const derecha = flecha(board, `M${LEFT} ${yH}H${round(RIGHT - 6)}`, `M${round(RIGHT)} ${yH}l-7 -3.6v7.2Z`);
  const izquierda = flecha(board, `M${round(RIGHT)} ${yH}H${LEFT + 6}`, `M${LEFT} ${yH}l7 -3.6v7.2Z`);
  const arriba = flecha(board, `M${xV} ${round(yBottom)}V${yTop + 6}`, `M${xV} ${yTop}l-3.6 7h7.2Z`);
  const abajo = flecha(board, `M${xV} ${yTop}V${round(yBottom - 6)}`, `M${xV} ${round(yBottom)}l-3.6 -7h7.2Z`);
  const textoH = text(board, 0, yH - 5, 'aumenta', 'escena__leyenda', { opacity: 0 });
  const textoV = text(board, 0, 0, 'aumenta', 'escena__leyenda', { opacity: 0, 'text-anchor': 'middle' });
  const rings = make('g', {}, board);

  let key = null, t = 0, animating = false;
  let target = new Map();

  function puntajes(prop) {
    const result = new Map();
    const included = cells.filter(cell => cell.rep && !(prop.sinNobles && cell.noble));
    const raw = cell => {
      const c = cell.col / 7, f = (cell.element.periodo - 1) / 6;
      return prop.sentido === 'arriba' ? .55 * c + .45 * (1 - f) : .55 * (1 - c) + .45 * f;
    };
    const values = included.map(raw);
    const min = Math.min(...values), max = Math.max(...values);
    included.forEach(cell => result.set(cell, .08 + .92 * (raw(cell) - min) / (max - min)));
    return result;
  }

  function texto(prop) {
    if (!panel) return;
    panel.innerHTML = `<h3 class="tendencias__nombre">${prop.nombre}</h3>` +
      `<p class="tendencias__definicion">${prop.definicion}</p>` +
      `<p class="tendencias__aumenta"><span>Aumenta</span> ${prop.aumenta}</p>` +
      `<p class="tendencias__nota">${prop.nota}</p>`;
  }

  function select(next, animate) {
    const prop = PROPIEDADES[next];
    if (!prop || next === key) return;
    key = next;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tendencia === key)));
    target = puntajes(prop);
    cells.forEach(cell => {
      if (!cell.rep) return;
      cell.from = cell.value;
      cell.to = target.has(cell) ? target.get(cell) : 0;
      cell.fill.setAttribute('class', 'escena__celda-relleno ' + (cell.noble && prop.sinNobles ? 'escena__celda-relleno--neutra' : 'escena__celda-relleno--calor'));
      // El degradado avanza en el sentido en que aumenta la propiedad.
      const along = prop.sentido === 'arriba' ? cell.col / 7 + (7 - cell.element.periodo) / 6 : (7 - cell.col) / 7 + (cell.element.periodo - 1) / 6;
      cell.delay = .3 * along;
    });
    rings.innerHTML = '';
    prop.extremos.forEach(symbol => {
      const cell = cells.find(c => c.element.simbolo === symbol);
      make('rect', { x: cell.x - 2, y: cell.y - 2, width: CELL + 4, height: CELL + 4, rx: 3, class: 'escena__celda-aro' }, rings);
    });
    texto(prop);
    t = 0;
    animating = animate && !reducedMotion.matches;
    if (!animating) draw(10);
  }

  function draw(time) {
    const up = PROPIEDADES[key].sentido === 'arriba';
    cells.forEach(cell => {
      if (!cell.rep) return;
      const a = smooth((time - cell.delay) / .55);
      cell.value = mix(cell.from, cell.to, a);
      const neutral = cell.noble && PROPIEDADES[key].sinNobles;
      fade(cell.fill, neutral ? 1 : cell.value);
    });
    const k = smooth(time / .7);
    [derecha, izquierda, arriba, abajo].forEach(arrow => fade(arrow.g, 0));
    const h = up ? derecha : izquierda, v = up ? arriba : abajo;
    fade(h.g, k);
    fade(v.g, k);
    fade(textoH, k);
    fade(textoV, k);
    set(textoH, { x: up ? RIGHT - 30 : LEFT + 2 });
    textoV.setAttribute('transform', `translate(${xV + 9} ${up ? yTop + 22 : yBottom - 22}) rotate(-90)`);
    fade(rings, smooth((time - .9) / .4));
  }

  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.tendencia, true)));
  select(buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.tendencia || 'electronegatividad', false);

  return {
    update(dt) {
      if (!animating) return;
      t += dt;
      draw(t);
      if (t > 2.2) animating = false;
    },
    still() { animating = false; draw(10); }
  };
}

/* ---------------- 7 · Radios: por qué crece o se encoge el átomo ----------------
   Radios calculados (Clementi y colaboradores, 1967), en picómetros, a escala.
   Arriba, el periodo 3: cada átomo tiene un protón más que el anterior y sus
   electrones siguen en el nivel 3, así que el núcleo los jala más y el átomo se
   encoge. Abajo, el grupo IA: cada átomo agrega un nivel y crece. */
const RADIOS = { Li: 167, Na: 190, K: 243, Rb: 265, Cs: 298, Mg: 145, Al: 118, Si: 111, P: 98, S: 88, Cl: 79, Ar: 71 };
function radios(svg) {
  const T = 16, K = .085;
  const scene = make('g', {}, svg);
  const fila = (symbols, y, gap, from) => {
    const width = symbols.reduce((sum, s) => sum + 2 * K * RADIOS[s], 0) + gap * (symbols.length - 1);
    let x = (360 - width) / 2;
    return symbols.map((symbol, i) => {
      const r = K * RADIOS[symbol];
      const cx = x + r;
      x += 2 * r + gap;
      const g = make('g', { opacity: 0 }, scene);
      const body = make('g', { transform: `translate(${round(cx)} ${y})` }, g);
      make('circle', { r: round(r), class: 'escena__radio-atomo' }, body);
      make('circle', { r: 1.4, class: 'escena__nucleo' }, body);
      return { g, body, cx, r, symbol, start: from + i * .5 };
    });
  };
  text(scene, 14, 16, 'Periodo 3, de izquierda a derecha', 'escena__radio-titulo');
  const periodo = fila(['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'], 50, 9, .5);
  periodo.forEach((atom, i) => {
    text(atom.g, atom.cx, 30, `+${11 + i}`, 'escena__radio-carga', { 'text-anchor': 'middle' });
    text(atom.g, atom.cx, 82, atom.symbol, 'escena__radio-simbolo', { 'text-anchor': 'middle' });
  });
  const flechaA = flecha(scene, `M${round(periodo[0].cx)} 92H${round(periodo[7].cx - 6)}`, `M${round(periodo[7].cx)} 92l-7 -3.6v7.2Z`);
  const notaA = text(scene, 180, 107, 'un protón más en cada paso y el mismo nivel: el átomo se encoge', 'escena__radio-nota', { 'text-anchor': 'middle', opacity: 0 });

  text(scene, 14, 126, 'Grupo IA, de arriba abajo', 'escena__radio-titulo');
  const grupo = fila(['Li', 'Na', 'K', 'Rb', 'Cs'], 164, 12, 5.5);
  grupo.forEach((atom, i) => {
    text(atom.g, atom.cx, 200, atom.symbol, 'escena__radio-simbolo', { 'text-anchor': 'middle' });
    text(atom.g, atom.cx, 209, `${i + 2} niveles`, 'escena__radio-carga', { 'text-anchor': 'middle' });
  });
  const flechaB = flecha(scene, `M${round(grupo[0].cx)} 218H${round(grupo[4].cx - 6)}`, `M${round(grupo[4].cx)} 218l-7 -3.6v7.2Z`);
  const notaB = text(scene, 180, 232, 'un nivel más en cada paso: el átomo crece', 'escena__radio-nota', { 'text-anchor': 'middle', opacity: 0 });

  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : time < .4 ? smooth(time / .4) : 1 - smooth((time - (T - 1.2)) / 1.2));
    // En el periodo cada átomo llega un poco más grande y se encoge; en el grupo, crece.
    periodo.forEach(atom => {
      const a = final ? 1 : smooth((time - atom.start) / .5);
      fade(atom.g, a);
      atom.body.setAttribute('transform', `translate(${round(atom.cx)} 50) scale(${round(mix(1.3, 1, a))})`);
    });
    grupo.forEach(atom => {
      const a = final ? 1 : smooth((time - atom.start) / .5);
      fade(atom.g, a);
      atom.body.setAttribute('transform', `translate(${round(atom.cx)} 164) scale(${round(mix(.7, 1, a))})`);
    });
    fade(flechaA.g, final ? 1 : (time - 4.6) / .5);
    fade(notaA, final ? 1 : (time - 4.8) / .5);
    fade(flechaB.g, final ? 1 : (time - 8.4) / .5);
    fade(notaB, final ? 1 : (time - 8.6) / .5);
  }
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
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
const factories = { mapa, martillo, circuito, bloques, ubicar, tendencias, radios };
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
