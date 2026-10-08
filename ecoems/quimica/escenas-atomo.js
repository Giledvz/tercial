/* Escenas del tema 2 de Química ECOEMS: estructura del átomo.
   Mismo contrato que escenas-particulas.js: cada escena es { update(dt),
   still() }; el reloj compartido sólo avanza las escenas visibles y, con
   movimiento reducido, cada una dibuja un fotograma fijo que resume el proceso.
   En estas escenas el terracota marca la carga positiva —núcleo, protones,
   partículas alfa y la masa positiva de Thomson—; los electrones son de tinta.
   Las figuras no llevan contorno: el SVG base hereda stroke: currentColor y
   aquí se anula en cada figura. */
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

// Desvanecimiento al final del ciclo: la escena se apaga y vuelve a empezar.
function cycle(t, outStart, resetAt, inEnd) {
  if (t < outStart) return { s: t, opacity: 1 };
  if (t < resetAt) return { s: t, opacity: 1 - smooth((t - outStart) / (resetAt - outStart)) };
  return { s: 0, opacity: smooth((t - resetAt) / (inEnd - resetAt)) };
}

// Contorno suave que pasa por los puntos medios de un polígono.
function smoothClosed(points) {
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const start = mid(points[points.length - 1], points[0]);
  return `M${round(start[0])} ${round(start[1])}` + points.map((p, i) => {
    const m = mid(p, points[(i + 1) % points.length]);
    return `Q${round(p[0])} ${round(p[1])} ${round(m[0])} ${round(m[1])}`;
  }).join('') + 'Z';
}

// Esfera sólida con un reflejo: átomos de Dalton, nucleones y electrones.
function sphere(parent, r, cls, label) {
  const g = make('g', {}, parent);
  make('circle', { r, class: cls }, g);
  make('ellipse', { cx: -r * .32, cy: -r * .36, rx: r * .36, ry: r * .26, class: 'escena__reflejo-esfera' }, g);
  if (label) text(g, 0, r * .36, label, 'escena__simbolo');
  return g;
}

// Fotón: una onda con punta de flecha, de longitud 40 a lo largo de +x.
function photon(parent) {
  const g = make('g', { opacity: 0 }, parent);
  let d = 'M0 0';
  for (let i = 1; i <= 32; i += 1) {
    const x = i / 32 * 34;
    d += `L${round(x)} ${round(Math.sin(i / 32 * Math.PI * 6) * 3.4)}`;
  }
  make('path', { d, class: 'escena__foton' }, g);
  make('path', { d: 'M34 -4.2L42 0L34 4.2Z', class: 'escena__foton-punta' }, g);
  return g;
}

/* ---------------- 1 · Demócrito: partir hasta lo indivisible ----------------
   Un trozo se parte a la mitad una y otra vez. La mitad izquierda se queda
   como rastro y la derecha avanza convertida en un trozo menor. Al final queda
   una esfera que el cuchillo ya no puede partir: el átomo. */
function democrito(svg) {
  const floorY = 104;
  const radii = [30, 22.2, 16.4, 12.2, 9];
  const atomR = 6;
  const centers = [44];
  radii.forEach((r, k) => {
    const next = k + 1 < radii.length ? radii[k + 1] : atomR;
    centers.push(centers[k] + r + next + 18);
  });
  const defs = make('defs', {}, svg);
  const left = make('clipPath', { id: 'democritoIzq' }, defs);
  make('rect', { x: -60, y: -60, width: 60, height: 120 }, left);
  const right = make('clipPath', { id: 'democritoDer' }, defs);
  make('rect', { x: 0, y: -60, width: 60, height: 120 }, right);

  make('path', { d: `M8 ${floorY}H352`, class: 'escena__piso' }, svg);
  const scene = make('g', {}, svg);

  const stones = radii.map((r, k) => {
    const rand = random(31 + k * 17);
    const points = Array.from({ length: 11 }, (_, i) => {
      const a = i / 11 * TAU - Math.PI / 2;
      const f = .86 + rand() * .22;
      return [Math.cos(a) * r * f, Math.sin(a) * r * f * .84];
    });
    const bottom = Math.max(...points.map(p => p[1]));
    const shape = smoothClosed(points);
    const shine = smoothClosed(points.map(([x, y]) => [x * .46 - r * .2, y * .4 - r * .3]));
    const group = make('g', {}, scene);
    // Entera hasta que el cuchillo la corta; después, dos mitades recortadas.
    const whole = make('g', {}, group);
    make('path', { d: shape, class: 'escena__piedra' }, whole);
    make('path', { d: shine, class: 'escena__piedra-brillo' }, whole);
    const halves = ['democritoIzq', 'democritoDer'].map(id => {
      const half = make('g', { 'clip-path': `url(#${id})` }, group);
      make('path', { d: shape, class: 'escena__piedra' }, half);
      make('path', { d: shine, class: 'escena__piedra-brillo' }, half);
      return half;
    });
    const crack = make('path', { class: 'escena__grieta' }, group);
    const zig = Array.from({ length: 7 }, (_, i) => [(i % 2 ? 1 : -1) * r * .07, -r + i * r / 3]);
    return { r, group, whole, halves, crack, zig, y: floorY - bottom };
  });

  const atom = sphere(scene, atomR, 'escena__piedra');
  const atomY = floorY - atomR;
  const atomLabel = text(scene, centers[5], floorY + 18, 'átomo', 'escena__etiqueta', { 'text-anchor': 'middle' });
  const atomNote = text(scene, centers[5], 30, 'no se puede partir', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  // Cuchillo de perfil con el filo hacia abajo.
  const knife = make('g', { opacity: 0 }, svg);
  make('path', { d: 'M-3 -31H3V-5L0 0L-3 -5Z', class: 'escena__cuchillo' }, knife);
  make('path', { d: 'M1.2 -29V-6', class: 'escena__cuchillo-filo' }, knife);
  make('rect', { x: -4, y: -46, width: 8, height: 16, rx: 2.5, class: 'escena__mango' }, knife);

  const T0 = .5, STEP = 1.3;
  function crackPath(stone, p) {
    const limit = -stone.r + p * 2 * stone.r;
    const pts = stone.zig.filter(([, y]) => y <= limit + .01);
    if (pts.length < 2) return '';
    return 'M' + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join('L');
  }

  function render(t) {
    const { s, opacity } = cycle(t, 9.4, 10, 10.5);
    scene.setAttribute('opacity', round(opacity));
    let knifeX = centers[0], knifeY = -50, knifeOpacity = 0;

    stones.forEach((stone, k) => {
      const start = T0 + k * STEP;
      const arrive = k === 0 ? 1 : span(s, start - STEP + .78, start - STEP + 1.28);
      const visible = k === 0 || s >= start - STEP + .78;
      const cut = span(s, start + .3, start + .55);
      const apart = smooth(span(s, start + .55, start + .78));
      const travel = smooth(span(s, start + .78, start + 1.28));
      const from = k === 0 ? centers[0] : centers[k - 1] + stones[k - 1].r * .5 + 2.5;
      const x = k === 0 ? centers[0] : mix(from, centers[k], smooth(arrive));
      stone.group.setAttribute('transform', `translate(${round(x)} ${round(stone.y)})`);
      stone.group.setAttribute('opacity', visible ? round(k === 0 ? 1 : smooth(arrive * 1.6)) : 0);
      // La mitad izquierda se queda como rastro; la derecha se desvanece al
      // convertirse en el trozo siguiente.
      const split = s >= start + .55;
      stone.whole.setAttribute('opacity', split ? 0 : 1);
      stone.halves.forEach(half => half.setAttribute('visibility', split ? 'visible' : 'hidden'));
      stone.halves[0].setAttribute('transform', `translate(${round(-2.5 * apart)} 0) rotate(${round(-4 * apart)})`);
      stone.halves[0].setAttribute('opacity', round(1 - .58 * travel));
      stone.halves[1].setAttribute('transform', `translate(${round(2.5 * apart + travel * (centers[k + 1] - centers[k]) * .35)} 0) rotate(${round(4 * apart)})`);
      stone.halves[1].setAttribute('opacity', round(1 - travel));
      stone.crack.setAttribute('d', cut > 0 && apart < 1 ? crackPath(stone, cut) : '');
      if (s >= start - .05 && s < start + .78) {
        knifeX = x;
        const top = stone.y - stone.r * .86;
        knifeY = s < start + .3 ? mix(top - 40, top, smooth(span(s, start, start + .3)))
          : s < start + .55 ? mix(top, stone.y + stone.r * .84, cut)
          : mix(stone.y + stone.r * .84, top - 40, smooth(span(s, start + .55, start + .78)));
        knifeOpacity = Math.min(span(s, start - .05, start + .1), 1 - span(s, start + .6, start + .78));
      }
    });

    const atomStart = T0 + radii.length * STEP;
    const atomArrive = span(s, atomStart - STEP + .78, atomStart - STEP + 1.28);
    const ax = mix(centers[4] + radii[4] * .5 + 2.5, centers[5], smooth(atomArrive));
    atom.setAttribute('transform', `translate(${round(ax)} ${atomY})`);
    atom.setAttribute('opacity', s >= atomStart - STEP + .78 ? round(smooth(atomArrive * 1.6)) : 0);
    if (s >= atomStart - .05) {
      // El cuchillo baja, toca la esfera y rebota: no logra partirla.
      const top = atomY - atomR;
      const down = smooth(span(s, atomStart, atomStart + .3));
      const bounce = Math.sin(clamp((s - atomStart - .3) / .35) * Math.PI) * 5;
      const lift = smooth(span(s, atomStart + 1.7, atomStart + 2.1));
      knifeX = centers[5];
      knifeY = mix(top - 40, top, down) - bounce - lift * 40;
      knifeOpacity = Math.min(span(s, atomStart - .05, atomStart + .1), 1 - lift);
    }
    atomLabel.setAttribute('opacity', round(smooth(span(s, atomStart + .5, atomStart + .9))));
    atomNote.setAttribute('opacity', round(smooth(span(s, atomStart + .5, atomStart + .9))));
    knife.setAttribute('transform', `translate(${round(knifeX)} ${round(knifeY)})`);
    knife.setAttribute('opacity', round(knifeOpacity * opacity));
  }

  let t = 0;
  render(0);
  return {
    update(dt) { t = (t + dt) % 10.5; render(t); },
    still() { render(T0 + radii.length * STEP + 1.2); }
  };
}

/* ---------------- 2 · Dalton: combinaciones en números enteros ----------------
   Los átomos son esferas sólidas e idénticas para un mismo elemento. Un átomo
   de carbono se junta con uno de oxígeno (CO) o con dos (CO₂): siempre en
   números enteros, nunca con medio átomo. Los átomos no se crean ni se
   destruyen: sólo se acercan y se unen. */
function dalton(svg) {
  const R = { c: 15, o: 13 };
  const rows = [
    { y: 50, formula: 'CO', name: 'monóxido de carbono', ratio: '1 C : 1 O',
      atoms: [['c', 40, 81], ['o', 150, 109]], plus: [95] },
    { y: 128, formula: 'CO₂', name: 'dióxido de carbono', ratio: '1 C : 2 O',
      atoms: [['c', 95, 95], ['o', 30, 67], ['o', 160, 123]], plus: [62, 128] }
  ];
  const scene = make('g', {}, svg);
  make('path', { d: 'M212 18V160', class: 'escena__regla' }, svg);
  rows.forEach(row => {
    row.plusNodes = row.plus.map(x => text(scene, x, row.y + 6, '+', 'escena__operador', { 'text-anchor': 'middle' }));
    row.nodes = row.atoms.map(([kind]) => sphere(scene, R[kind], `escena__atomo escena__atomo--${kind}`, kind.toUpperCase()));
    row.label = make('g', {}, scene);
    const formula = text(row.label, 228, row.y - 2, row.formula.replace('₂', ''), 'escena__formula');
    if (row.formula.includes('₂')) {
      const sub = make('tspan', { class: 'escena__formula-sub', dy: 5 }, formula);
      sub.textContent = '2';
    }
    text(row.label, 228, row.y + 17, row.ratio, 'escena__lectura escena__lectura--chica');
    text(row.label, 228, row.y + 33, row.name, 'escena__clave escena__clave--chica');
  });

  function render(t) {
    const { s, opacity } = cycle(t, 6.8, 7.3, 7.8);
    scene.setAttribute('opacity', round(opacity));
    rows.forEach((row, r) => {
      const start = .7 + r * 1.6;
      const p = smooth(span(s, start, start + 1));
      row.atoms.forEach(([, from, to], i) => {
        row.nodes[i].setAttribute('transform', `translate(${round(mix(from, to, p))} ${row.y})`);
      });
      row.plusNodes.forEach(node => node.setAttribute('opacity', round(1 - span(s, start, start + .4))));
      row.label.setAttribute('opacity', round(smooth(span(s, start + .9, start + 1.3))));
    });
  }

  let t = 0;
  render(0);
  return {
    update(dt) { t = (t + dt) % 7.8; render(t); },
    still() { render(5.5); }
  };
}

/* ---------------- 3 · Thomson: el panqué con pasas ----------------
   Una masa con carga positiva repartida y electrones incrustados. Los
   electrones llegan uno a uno y el marcador muestra que las cargas se
   compensan: el átomo es neutro. */
function thomson(svg) {
  const M = { x: 118, y: 96, r: 76 };
  const COUNT = 9;
  const spots = Array.from({ length: COUNT * 2 }, (_, k) => {
    const rho = 15.2 * Math.sqrt(k + .6);
    const a = k * 2.39996 + .4;
    return [M.x + Math.cos(a) * rho, M.y + Math.sin(a) * rho];
  });
  make('circle', { cx: M.x, cy: M.y, r: M.r, class: 'escena__panque' }, svg);
  make('circle', { cx: M.x, cy: M.y, r: M.r, class: 'escena__panque-borde' }, svg);
  spots.filter((_, k) => k % 2 === 0).forEach(([x, y]) => {
    make('path', { d: `M${round(x - 4)} ${round(y)}H${round(x + 4)}M${round(x)} ${round(y - 4)}V${round(y + 4)}`, class: 'escena__mas' }, svg);
  });
  const electrons = spots.filter((_, k) => k % 2 === 1).map(([x, y], i) => {
    const g = make('g', { opacity: 0 }, svg);
    make('circle', { r: 8.5, class: 'escena__electron' }, g);
    make('path', { d: 'M-3.6 0H3.6', class: 'escena__menos' }, g);
    return { g, x, y, phase: i * 1.7 };
  });

  const panel = make('g', {}, svg);
  const rowsY = [70, 96, 134];
  text(panel, 214, rowsY[0], 'positivas', 'escena__clave');
  text(panel, 214, rowsY[1], 'negativas', 'escena__clave');
  make('path', { d: 'M214 112H346', class: 'escena__regla' }, panel);
  text(panel, 214, rowsY[2], 'total', 'escena__clave');
  text(panel, 346, rowsY[0], `+${COUNT}`, 'escena__lectura', { 'text-anchor': 'end' });
  const negative = text(panel, 346, rowsY[1], '0', 'escena__lectura', { 'text-anchor': 'end' });
  const total = text(panel, 346, rowsY[2], `+${COUNT}`, 'escena__lectura', { 'text-anchor': 'end' });
  const neutral = text(panel, 346, 158, 'átomo neutro', 'escena__lectura escena__lectura--chica', { 'text-anchor': 'end', opacity: 0 });

  let clock = 0;
  function render(t) {
    const { s, opacity } = cycle(t, 8.4, 8.9, 9.3);
    let placed = 0;
    electrons.forEach((e, i) => {
      const start = .9 + i * .38;
      const p = span(s, start, start + .32);
      if (p >= 1) placed += 1;
      const jiggle = p >= 1 ? 1 : 0;
      const dx = Math.sin(clock * 9 + e.phase) * .7 * jiggle;
      const dy = Math.cos(clock * 7.3 + e.phase * 1.3) * .7 * jiggle;
      const drop = (1 - easeOut(p)) * -26;
      e.g.setAttribute('transform', `translate(${round(e.x + dx)} ${round(e.y + drop + dy)})`);
      e.g.setAttribute('opacity', round(clamp(p * 4) * opacity));
    });
    negative.textContent = placed ? `−${placed}` : '0';
    const sum = COUNT - placed;
    total.textContent = sum > 0 ? `+${sum}` : '0';
    neutral.setAttribute('opacity', round(placed === COUNT ? opacity : 0));
  }

  let t = 0;
  render(0);
  return {
    update(dt) { clock += dt; t = (t + dt) % 9.3; render(t); },
    still() { render(6); }
  };
}

/* ---------------- 4 · Rutherford: la lámina de oro ----------------
   Izquierda: el experimento. Un haz de partículas alfa atraviesa la lámina;
   cada una produce un destello donde golpea la pantalla y deja una marca, y
   los contadores llevan la cuenta: casi todas pasan derecho. Derecha: un
   acercamiento a la lámina, con núcleos diminutos y mucho espacio vacío. Las
   trayectorias del acercamiento se calculan con una repulsión eléctrica de
   corto alcance; cuando una partícula pasa muy cerca, el núcleo pulsa. Cada
   partícula del acercamiento sale del experimento con el ángulo que obtuvo
   ahí. Los desvíos y los rebotes están exagerados para que se vean. */
function rutherford(svg) {
  // Dos composiciones: horizontal (pantallas anchas) y vertical (teléfonos).
  const vertical = svg.dataset.layout === 'vertical';
  const G = vertical ? {
    F: { x: 140, y: 78 }, RING: 48, Z: { x: 120, y: 262, s: 72 / 66 }, SOURCE_X: 50, sourceX: 14,
    guides: [[135, 83, 52.3, 237.4], [145, 83, 187.7, 237.4]], foil: 20,
    foilLabel: { x: 131, y: [60, 70], anchor: 'end' }, id: 'rutherfordZoomVertical', counters: 'lista'
  } : {
    F: { x: 124, y: 92 }, RING: 54, Z: { x: 282, y: 92, s: 70 / 66 }, SOURCE_X: 46, sourceX: 10,
    guides: [[126.5, 85.5, 272, 23], [126.5, 98.5, 272, 161]], foil: 25,
    foilLabel: { x: 124, y: [130, 140], anchor: 'middle' }, id: 'rutherfordZoom', counters: 'columnas'
  };
  const { F, RING, Z, SOURCE_X } = G;
  const R0 = 66;
  // El acercamiento se calcula en coordenadas locales, con el centro en (0, 0).
  const nuclei = [[-28, -48], [-28, 0], [-28, 48], [26, -24], [26, 24]];
  // Repulsión eléctrica de corto alcance: el núcleo es diminuto, así que
  // sólo desvía a las partículas que pasan muy cerca de él.
  const V = 90, K = 140000, LAMBDA = 3;
  const CYCLE = 13.4, EMIT_START = .6, EVERY = .15, COUNT = 61;
  // Entre las partículas que se siguen en el acercamiento (una de cada tres),
  // éstas se desvían o rebotan; las demás pasan lejos de los núcleos.
  const SPECIAL = { 4: ['d', 3.6], 8: ['b', -.75], 12: ['d', -19.8], 16: ['d', 20.4], 19: ['d', -44.4] };
  const lanes = [-36, -12, 12, 36];
  const rand = random(1911);

  const defs = make('defs', {}, svg);
  const clip = make('clipPath', { id: G.id }, defs);
  make('circle', { cx: 0, cy: 0, r: R0 }, clip);

  // Pantalla detectora graduada cada 30°, con una abertura para el haz.
  make('path', { d: describeArc(F.x, F.y, RING, 196, 524), class: 'escena__pantalla' }, svg);
  for (let a = -150; a <= 150; a += 30) {
    const r1 = RING - 5, r2 = RING - 2, rad = a * Math.PI / 180;
    make('path', { d: `M${round(F.x + Math.cos(rad) * r1)} ${round(F.y + Math.sin(rad) * r1)}L${round(F.x + Math.cos(rad) * r2)} ${round(F.y + Math.sin(rad) * r2)}`, class: 'escena__marca-angulo' }, svg);
  }
  text(svg, F.x, F.y - RING - 8, 'pantalla detectora', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  // Fuente de plomo con su canal.
  make('rect', { x: G.sourceX, y: F.y - 11, width: 34, height: 22, rx: 2, class: 'escena__plomo' }, svg);
  make('rect', { x: G.sourceX + 26, y: F.y - 2.2, width: 8, height: 4.4, class: 'escena__plomo-canal' }, svg);
  text(svg, G.sourceX + 17, F.y + 25, 'fuente α', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
  make('path', { d: `M${SOURCE_X + 2} ${F.y}H${F.x - 4}`, class: 'escena__haz' }, svg);

  // Lámina de oro: una hoja delgada de metal, con canto y brillo.
  make('path', { d: `M${F.x + 1.6} ${F.y - G.foil}L${F.x + 4.6} ${F.y - G.foil - 3}V${F.y + G.foil - 3}L${F.x + 1.6} ${F.y + G.foil}Z`, class: 'escena__oro-canto' }, svg);
  make('rect', { x: F.x - 1.6, y: F.y - G.foil, width: 3.2, height: G.foil * 2, class: 'escena__oro-frente' }, svg);
  make('path', { d: `M${F.x - .6} ${F.y - G.foil + 2}V${F.y + G.foil - 2}`, class: 'escena__oro-brillo' }, svg);
  text(svg, G.foilLabel.x, G.foilLabel.y[0], 'lámina', 'escena__clave escena__clave--chica', { 'text-anchor': G.foilLabel.anchor });
  text(svg, G.foilLabel.x, G.foilLabel.y[1], 'de oro', 'escena__clave escena__clave--chica', { 'text-anchor': G.foilLabel.anchor });

  // Lupa: del punto de la lámina al acercamiento.
  make('circle', { cx: F.x, cy: F.y, r: 7, class: 'escena__lupa-marca' }, svg);
  make('path', { d: G.guides.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join(''), class: 'escena__lupa-guia' }, svg);
  const zoomRadius = R0 * Z.s;
  make('circle', { cx: Z.x, cy: Z.y, r: zoomRadius, class: 'escena__zoom-fondo' }, svg);
  const zoom = make('g', { transform: `translate(${Z.x} ${Z.y}) scale(${round(Z.s)})`, 'clip-path': `url(#${G.id})` }, svg);
  const traces = make('g', {}, zoom);
  const atomElectrons = [];
  const ripples = nuclei.map(([x, y], i) => {
    make('circle', { cx: x, cy: y, r: 23, class: 'escena__orbita' }, zoom);
    const ripple = make('circle', { cx: x, cy: y, r: 3, class: 'escena__onda', opacity: 0 }, zoom);
    make('circle', { cx: x, cy: y, r: 1.9, class: 'escena__nucleo' }, zoom);
    for (let j = 0; j < 2; j += 1) {
      atomElectrons.push({ node: make('circle', { r: 1.1, class: 'escena__electron' }, zoom), x, y, phase: i * 1.3 + j * Math.PI });
    }
    return ripple;
  });
  make('circle', { cx: Z.x, cy: Z.y, r: zoomRadius, class: 'escena__zoom-borde' }, svg);
  text(svg, Z.x, Z.y + zoomRadius + 16, 'dentro de la lámina', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  // Contadores: la conclusión sale de los datos.
  const labels = [['derecho', 'derecho'], ['desviada', 'se desvían'], ['rebota', 'rebotan']];
  const counterNodes = {};
  labels.forEach(([key, words], i) => {
    if (G.counters === 'columnas') {
      const x = F.x - 4 + (i - 1) * 70;
      counterNodes[key] = text(svg, x, F.y + RING + 34, '0', 'escena__lectura', { 'text-anchor': 'middle' });
      text(svg, x, F.y + RING + 48, words, 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
    } else {
      const y = F.y + 52 + i * 17;
      text(svg, 6, y, words, 'escena__clave escena__clave--chica');
      counterNodes[key] = text(svg, 92, y, '0', 'escena__lectura escena__lectura--chica', { 'text-anchor': 'end' });
    }
  });

  const marks = make('g', {}, svg);
  const flashes = make('g', {}, svg);
  const flying = make('g', {}, svg);
  const microLayer = make('g', {}, zoom);
  const TAIL = [[2.1, 1], [1.8, .55], [1.5, .3], [1.2, .15]];
  const pool = (layer, size, scale) => Array.from({ length: size }, () =>
    TAIL.map(([r, o]) => make('circle', { r: round(r * scale), class: 'escena__alfa', opacity: 0, 'data-o': o }, layer)));
  const macroPool = pool(flying, 18, 1);
  const microPool = pool(microLayer, 8, .9);
  const flashPool = Array.from({ length: 8 }, () => make('circle', { r: 2, class: 'escena__destello', opacity: 0 }, flashes));

  function simulate(y0) {
    const path = [];
    let x = -R0 - 6, y = y0, vx = V, vy = 0, tca = 0, best = Infinity, near = 0, time = 0;
    const h = 1 / 12000;
    for (let step = 0; step < 12000 * 2.6; step += 1) {
      nuclei.forEach(([nx, ny], n) => {
        const dx = x - nx, dy = y - ny;
        const r = Math.hypot(dx, dy);
        if (r < best) { best = r; tca = time; near = n; }
        const f = K * Math.exp(-r / LAMBDA) / (r * r);
        vx += f * dx / r * h; vy += f * dy / r * h;
      });
      x += vx * h; y += vy * h; time += h;
      if (step % 100 === 0) path.push([x, y]);
      if (Math.hypot(x, y) > R0 + 8 && time > .3) break;
    }
    return { path, angle: Math.atan2(vy, vx), tca, best, near };
  }

  const reach = (F.x - SOURCE_X) / V;
  const particles = Array.from({ length: COUNT }, (_, i) => {
    const start = EMIT_START + i * EVERY;
    const jitter = (rand() - .5) * 2;
    const tracked = i % 3 === 1;
    const p = { start, jitter, tracked, foil: start + reach };
    if (tracked) {
      const special = SPECIAL[(i - 1) / 3];
      const y0 = special ? special[1] : lanes[Math.floor(rand() * lanes.length)] + (rand() - .5) * 3;
      Object.assign(p, simulate(y0));
      p.zoomStart = p.foil - p.tca;
      if (special) p.trace = make('path', { class: 'escena__alfa-rastro', opacity: 0 }, traces);
    } else {
      p.angle = (rand() - .5) * 2 * 1.4 * Math.PI / 180;
    }
    // Salida del experimento: desde la lámina hasta la pantalla.
    const ux = Math.cos(p.angle), uy = Math.sin(p.angle);
    const b = jitter * uy, c = jitter * jitter - RING * RING;
    const travel = -b + Math.sqrt(b * b - c);
    p.hit = p.foil + travel / V;
    p.point = [F.x + ux * travel, F.y + jitter + uy * travel];
    const degrees = Math.abs(p.angle * 180 / Math.PI);
    p.category = degrees < 10 ? 'derecho' : degrees < 90 ? 'desviada' : 'rebota';
    const out = RING + 4.5;
    const a = Math.atan2(p.point[1] - F.y, p.point[0] - F.x);
    p.markAt = [F.x + Math.cos(a) * out, F.y + Math.sin(a) * out];
    p.mark = make('circle', { cx: round(p.markAt[0]), cy: round(p.markAt[1]), r: 1.4, class: 'escena__impacto', opacity: 0 }, marks);
    return p;
  });
  const tracked = particles.filter(p => p.tracked);
  // Pulsos de los núcleos: cuando una partícula pasa a menos de 10 unidades.
  const pulses = nuclei.map((_, n) => tracked.filter(p => p.near === n && p.best < 10).map(p => p.zoomStart + p.tca));

  function macroAt(p, time) {
    if (time < p.foil) return [mix(SOURCE_X, F.x, span(time, p.start, p.foil)), F.y + p.jitter];
    const d = (time - p.foil) * V;
    return [F.x + Math.cos(p.angle) * d, F.y + p.jitter + Math.sin(p.angle) * d];
  }

  function pathAt(path, k) {
    const i = Math.max(0, Math.min(path.length - 2, Math.floor(k))), f = Math.max(0, Math.min(1, k - i));
    return [mix(path[i][0], path[i + 1][0], f), mix(path[i][1], path[i + 1][1], f)];
  }

  const hide = group => group.forEach(node => node.setAttribute('opacity', 0));
  const shown = { derecho: -1, desviada: -1, rebota: -1 };

  function render(t, clock) {
    const { s, opacity } = cycle(t, CYCLE - .9, CYCLE - .4, CYCLE);
    atomElectrons.forEach(e => {
      const a = clock * 1.6 + e.phase;
      set(e.node, { cx: e.x + Math.cos(a) * 23, cy: e.y + Math.sin(a) * 23 });
    });

    // Haz: cada partícula con su estela.
    let slot = 0;
    for (const p of particles) {
      if (s < p.start || s >= p.hit || slot >= macroPool.length) continue;
      const group = macroPool[slot];
      slot += 1;
      group.forEach((node, k) => {
        const time = s - k * .03;
        if (time < p.start) { node.setAttribute('opacity', 0); return; }
        const [x, y] = macroAt(p, time);
        set(node, { cx: x, cy: y, opacity: Number(node.dataset.o) * opacity });
      });
    }
    for (; slot < macroPool.length; slot += 1) hide(macroPool[slot]);

    // Destellos, marcas y contadores.
    const counts = { derecho: 0, desviada: 0, rebota: 0 };
    let flash = 0;
    for (const p of particles) {
      if (s < p.hit) { p.mark.setAttribute('opacity', 0); continue; }
      counts[p.category] += 1;
      const age = s - p.hit;
      p.mark.setAttribute('opacity', round((.42 + .58 * (1 - smooth(span(age, 0, .7)))) * opacity));
      if (age < .5 && flash < flashPool.length) {
        const q = age / .5;
        set(flashPool[flash], { cx: p.markAt[0], cy: p.markAt[1], r: 1.6 + 7 * easeOut(q), opacity: .9 * (1 - q) * opacity });
        flash += 1;
      }
    }
    for (; flash < flashPool.length; flash += 1) flashPool[flash].setAttribute('opacity', 0);
    Object.keys(counts).forEach(key => {
      if (shown[key] !== counts[key]) { counterNodes[key].textContent = counts[key]; shown[key] = counts[key]; }
    });

    // Acercamiento: estelas curvas y trazos de las que se desviaron.
    let micro = 0;
    for (const p of tracked) {
      const k = (s - p.zoomStart) * 120;
      const inside = k >= 0 && k < p.path.length - 1;
      if (inside && micro < microPool.length) {
        microPool[micro].forEach((node, q) => {
          const kk = k - q * 3;
          if (kk < 0) { node.setAttribute('opacity', 0); return; }
          const [x, y] = pathAt(p.path, kk);
          set(node, { cx: x, cy: y, opacity: Number(node.dataset.o) * opacity });
        });
        micro += 1;
      }
      if (p.trace) {
        // El trazo sigue a la partícula y después se atenúa: el desvío más
        // reciente resalta y los anteriores quedan como registro.
        const upto = Math.max(0, Math.min(p.path.length, Math.floor(k)));
        if (upto > 1) {
          p.trace.setAttribute('d', 'M' + p.path.slice(0, upto).map(([x, y]) => `${round(x)} ${round(y)}`).join('L'));
          const age = s - (p.zoomStart + p.path.length / 120);
          p.trace.setAttribute('opacity', round((age < 0 ? 1 : 1 - .7 * smooth(age / 2.5)) * opacity));
        } else p.trace.setAttribute('opacity', 0);
      }
    }
    for (; micro < microPool.length; micro += 1) hide(microPool[micro]);

    ripples.forEach((ripple, n) => {
      const last = pulses[n].filter(time => time <= s && s - time < .7).pop();
      if (last === undefined) { ripple.setAttribute('opacity', 0); return; }
      const q = (s - last) / .7;
      set(ripple, { r: 2.5 + 11 * easeOut(q), opacity: .85 * (1 - q) * opacity });
    });
  }

  let t = 0, clock = 0;
  render(0, 0);
  return {
    update(dt) { clock += dt; t = (t + dt) % CYCLE; render(t, clock); },
    // Fotograma fijo: todas las marcas, los contadores completos y los
    // trazos de las partículas que se desviaron o rebotaron.
    still() { render(11.8, 0); }
  };
}

// Arco de circunferencia entre dos ángulos en grados (sentido horario en SVG).
function describeArc(cx, cy, r, from, to) {
  const a = from * Math.PI / 180, b = to * Math.PI / 180;
  const large = to - from > 180 ? 1 : 0;
  return `M${round(cx + Math.cos(a) * r)} ${round(cy + Math.sin(a) * r)}` +
    `A${r} ${r} 0 ${large} 1 ${round(cx + Math.cos(b) * r)} ${round(cy + Math.sin(b) * r)}`;
}

/* ---------------- 5 · Bohr: niveles de energía y saltos ----------------
   Un electrón del nivel L absorbe energía (un fotón) y salta al nivel N;
   después regresa al L y libera la energía como luz. La escalera de la
   derecha muestra lo mismo como escalones de energía: el electrón puede
   estar en un escalón o en otro, nunca entre dos. */
function bohr(svg) {
  const C = { x: 112, y: 108 };
  const RADII = [27, 46, 65, 84];
  const NAMES = ['K', 'L', 'M', 'N'];
  const RUNG = [188, 124, 84, 56];
  const CYCLE = 9.6, A = 2.2, JUMP = .6, ON_N = 1.6;
  const q = Math.pow(RADII[1] / RADII[3], 1.5);
  const onL = CYCLE - 2 * JUMP - ON_N;
  const wL = 2 * TAU / (onL + JUMP * (1 + q) + ON_N * q);
  const wN = wL * q;
  const wK = wL * Math.pow(RADII[1] / RADII[0], 1.5);
  const ABSORB_ANGLE = 225 * Math.PI / 180;

  // Ángulo acumulado del electrón saltarín dentro de un ciclo.
  function omega(s) {
    if (s < A) return wL;
    if (s < A + JUMP) return mix(wL, wN, (s - A) / JUMP);
    if (s < A + JUMP + ON_N) return wN;
    if (s < A + 2 * JUMP + ON_N) return mix(wN, wL, (s - A - JUMP - ON_N) / JUMP);
    return wL;
  }
  const table = [0];
  const STEPS = 2400;
  for (let i = 1; i <= STEPS; i += 1) {
    const s0 = (i - 1) / STEPS * CYCLE, s1 = i / STEPS * CYCLE;
    table.push(table[i - 1] + (omega(s0) + omega(s1)) / 2 * (s1 - s0));
  }
  const advance = s => {
    const k = s / CYCLE * STEPS, i = Math.min(STEPS - 1, Math.floor(k));
    return mix(table[i], table[i + 1], k - i);
  };
  const phase0 = ABSORB_ANGLE + advance(A);
  // El electrón gira en sentido contrario a las manecillas: el ángulo decrece.
  const angleAt = (s, lap) => phase0 - advance(s) - lap * 2 * TAU;
  const radiusAt = s => {
    if (s < A) return RADII[1];
    if (s < A + JUMP) return mix(RADII[1], RADII[3], smooth((s - A) / JUMP));
    if (s < A + JUMP + ON_N) return RADII[3];
    if (s < A + 2 * JUMP + ON_N) return mix(RADII[3], RADII[1], smooth((s - A - JUMP - ON_N) / JUMP));
    return RADII[1];
  };
  const EMIT_ANGLE = angleAt(A + JUMP + ON_N, 0);

  RADII.forEach((r, i) => {
    make('circle', { cx: C.x, cy: C.y, r, class: 'escena__orbita' }, svg);
    text(svg, C.x + r - 3.5, C.y - 4, NAMES[i], 'escena__clave escena__clave--chica', { 'text-anchor': 'end' });
  });
  const nucleus = make('g', { transform: `translate(${C.x} ${C.y})` }, svg);
  make('circle', { r: 9, class: 'escena__nucleo' }, nucleus);
  make('path', { d: 'M-3.8 0H3.8M0 -3.8V3.8', class: 'escena__nucleo-signo' }, nucleus);
  const inner = [0, Math.PI].map(() => sphere(svg, 5, 'escena__electron'));
  const jumper = sphere(svg, 5, 'escena__electron');
  const ghost = make('circle', { r: 5, class: 'escena__electron-fantasma', opacity: 0 }, svg);
  const jumpLine = make('path', { class: 'escena__salto', opacity: 0 }, svg);
  const incoming = photon(svg);
  const outgoing = photon(svg);
  const absorbLabel = text(svg, 8, 14, 'absorbe energía: sube de nivel', 'escena__clave', { opacity: 0 });
  const emitLabel = text(svg, 58, 216, 'libera energía (luz): baja de nivel', 'escena__clave', { opacity: 0 });

  // Escalera de energía
  const ladder = make('g', {}, svg);
  make('path', { d: 'M232 200V40', class: 'escena__eje' }, ladder);
  make('path', { d: 'M228.5 46L232 38L235.5 46Z', class: 'escena__eje-punta' }, ladder);
  text(ladder, 224, 120, 'energía', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle', transform: 'rotate(-90 224 120)' });
  RUNG.forEach((y, i) => {
    make('path', { d: `M244 ${y}H298`, class: 'escena__escalon' }, ladder);
    text(ladder, 304, y + 4, `${NAMES[i]} · ${i + 1}`, 'escena__clave escena__clave--chica');
  });
  const upArrow = make('path', { d: `M256 ${RUNG[1] - 6}V${RUNG[3] + 8}M252 ${RUNG[3] + 13}L256 ${RUNG[3] + 6}L260 ${RUNG[3] + 13}`, class: 'escena__salto-flecha', opacity: 0 }, ladder);
  const downArrow = make('path', { d: `M286 ${RUNG[3] + 6}V${RUNG[1] - 8}M282 ${RUNG[1] - 13}L286 ${RUNG[1] - 6}L290 ${RUNG[1] - 13}`, class: 'escena__salto-flecha', opacity: 0 }, ladder);
  const marker = sphere(ladder, 5, 'escena__electron');

  const placePhoton = (node, angle, from, to, p, inward) => {
    const d = mix(from, to, p);
    const x = C.x + Math.cos(angle) * d, y = C.y + Math.sin(angle) * d;
    const rot = angle * 180 / Math.PI + (inward ? 180 : 0);
    // El fotón mide 42: si entra, su punta llega al punto indicado.
    node.setAttribute('transform', `translate(${round(x)} ${round(y)}) rotate(${round(rot)})${inward ? ' translate(-42 0)' : ''}`);
  };

  function render(time, still) {
    const lap = Math.floor(time / CYCLE);
    const s = time - lap * CYCLE;
    inner.forEach((node, i) => {
      const a = -time * wK + i * Math.PI + .6;
      node.setAttribute('transform', `translate(${round(C.x + Math.cos(a) * RADII[0])} ${round(C.y + Math.sin(a) * RADII[0])})`);
    });
    const a = angleAt(s, lap), r = radiusAt(s);
    jumper.setAttribute('transform', `translate(${round(C.x + Math.cos(a) * r)} ${round(C.y + Math.sin(a) * r)})`);

    // Fotón que llega y fotón que sale.
    const inP = span(s, A - .8, A);
    incoming.setAttribute('opacity', s > A - .8 && s < A ? round(Math.min(1, inP * 5)) : 0);
    placePhoton(incoming, ABSORB_ANGLE, RADII[1] + 64, RADII[1] + 6, smooth(inP), true);
    const outP = span(s, A + JUMP + ON_N, A + JUMP + ON_N + 1);
    outgoing.setAttribute('opacity', outP > 0 && outP < 1 ? round(1 - smooth(span(outP, .6, 1))) : 0);
    placePhoton(outgoing, EMIT_ANGLE, RADII[3] + 6, RADII[3] + 26, easeOut(outP), false);

    const absorbing = smooth(span(s, A - .6, A - .2)) * (1 - smooth(span(s, A + 2.2, A + 2.6)));
    const emitting = smooth(span(s, A + JUMP + ON_N, A + JUMP + ON_N + .4)) * (1 - smooth(span(s, CYCLE - 1.2, CYCLE - .6)));
    absorbLabel.setAttribute('opacity', round(absorbing));
    emitLabel.setAttribute('opacity', round(emitting));
    upArrow.setAttribute('opacity', round(absorbing));
    downArrow.setAttribute('opacity', round(emitting));

    // Marcador en la escalera: sube y baja junto con el electrón.
    const level = (r - RADII[1]) / (RADII[3] - RADII[1]);
    const markerY = mix(RUNG[1], RUNG[3], level);
    marker.setAttribute('transform', `translate(271 ${round(markerY)})`);

    ghost.setAttribute('opacity', 0);
    jumpLine.setAttribute('opacity', 0);
    if (still) {
      // Fotograma fijo: el electrón ya subió; queda su lugar anterior marcado.
      const ga = ABSORB_ANGLE;
      set(ghost, { cx: C.x + Math.cos(ga) * RADII[1], cy: C.y + Math.sin(ga) * RADII[1], opacity: 1 });
      jumper.setAttribute('transform', `translate(${round(C.x + Math.cos(ga) * RADII[3])} ${round(C.y + Math.sin(ga) * RADII[3])})`);
      jumpLine.setAttribute('d', `M${round(C.x + Math.cos(ga) * (RADII[1] + 7))} ${round(C.y + Math.sin(ga) * (RADII[1] + 7))}L${round(C.x + Math.cos(ga) * (RADII[3] - 7))} ${round(C.y + Math.sin(ga) * (RADII[3] - 7))}`);
      jumpLine.setAttribute('opacity', 1);
      incoming.setAttribute('opacity', 1);
      const gx = C.x + Math.cos(ga) * RADII[1], gy = C.y + Math.sin(ga) * RADII[1];
      incoming.setAttribute('transform', `translate(${round(gx - 7)} ${round(gy)}) translate(-42 0)`);
      absorbLabel.setAttribute('opacity', 1);
      emitLabel.setAttribute('opacity', 1);
      upArrow.setAttribute('opacity', 1);
      downArrow.setAttribute('opacity', 1);
      marker.setAttribute('transform', `translate(271 ${RUNG[3]})`);
    }
  }

  let time = 0;
  render(0);
  return {
    update(dt) { time += dt; render(time); },
    still() { render(A + JUMP + .4, true); }
  };
}

/* ---------------- 6 · Schrödinger: la nube de electrones ----------------
   A la izquierda, el electrón de Bohr recorre un camino fijo. A la derecha,
   cada punto es una posición posible del electrón; con muchas posiciones se
   forma una nube, más densa donde es más probable encontrarlo (orbital 1s). */
function nube(svg) {
  const B = { x: 76, y: 92, r: 44 };
  const N = { x: 252, y: 92 };
  const COUNT = 640, FILL = 12.5, CYCLE = 15.5;
  const rand = random(1926);

  make('circle', { cx: B.x, cy: B.y, r: B.r, class: 'escena__orbita escena__orbita--fija' }, svg);
  make('circle', { cx: B.x, cy: B.y, r: 4.5, class: 'escena__nucleo' }, svg);
  const bohrElectron = sphere(svg, 4.6, 'escena__electron');
  text(svg, B.x, 170, 'Bohr', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(svg, B.x, 184, 'un camino fijo', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  const cloud = make('g', {}, svg);
  const dots = [];
  while (dots.length < COUNT) {
    // Distancia al núcleo con la distribución del orbital 1s: r²·e^(−2r/a).
    const r = -8.6 * Math.log(rand() * rand() * rand() + 1e-9);
    const cos = rand() * 2 - 1, sin = Math.sqrt(1 - cos * cos);
    const phi = rand() * TAU;
    const dx = r * sin * Math.cos(phi), dy = r * sin * Math.sin(phi);
    if (Math.hypot(dx, dy) > 78) continue;
    dots.push(make('circle', { cx: round(N.x + dx), cy: round(N.y + dy), r: 1.2, class: 'escena__nube-punto', opacity: 0 }, cloud));
  }
  make('circle', { cx: N.x, cy: N.y, r: 3.6, class: 'escena__nucleo' }, svg);
  text(svg, N.x, 170, 'Schrödinger', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(svg, N.x, 184, 'una nube de probabilidad', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  let shown = 0;
  function render(t, clock) {
    const a = -clock * 1.5;
    bohrElectron.setAttribute('transform', `translate(${round(B.x + Math.cos(a) * B.r)} ${round(B.y + Math.sin(a) * B.r)})`);
    const { s, opacity } = cycle(t, CYCLE - 1.4, CYCLE - .5, CYCLE);
    const target = Math.min(dots.length, Math.floor(span(s, .4, FILL) * dots.length));
    if (target < shown) {
      for (let i = target; i < shown; i += 1) dots[i].setAttribute('opacity', 0);
    }
    for (let i = shown; i < target; i += 1) dots[i].setAttribute('opacity', .78);
    shown = target;
    cloud.setAttribute('opacity', round(opacity));
  }

  let t = 0, clock = 0;
  render(0, 0);
  return {
    update(dt) { clock += dt; t = (t + dt) % CYCLE; render(t, clock); },
    still() { render(FILL + .5, .8); }
  };
}

/* ---------------- 7 · Constructor de átomos ----------------
   Agrega o quita protones, neutrones y electrones. El número de protones
   decide el elemento; protones y neutrones, la masa; protones y electrones,
   la carga. */
const ESTABLES = {
  1: [0, 1], 2: [1, 2], 3: [3, 4], 4: [5], 5: [5, 6], 6: [6, 7], 7: [7, 8], 8: [8, 9, 10],
  9: [10], 10: [10, 11, 12], 11: [12], 12: [12, 13, 14], 13: [14], 14: [14, 15, 16], 15: [16],
  16: [16, 17, 18, 20], 17: [18, 20], 18: [18, 20, 22], 19: [20, 22], 20: [20, 22, 23, 24, 26, 28]
};
const LIMITS = { p: [1, 20], n: [0, 28], e: [0, 22] };
const SHELLS = [{ r: 54, cap: 2 }, { r: 78, cap: 8 }, { r: 102, cap: 8 }, { r: 126, cap: 4 }];

function constructor(svg) {
  const root = svg.closest('[data-constructor]');
  const C = { x: 140, y: 140 };
  const counts = { p: 6, n: 6, e: 6 };
  const shellRings = SHELLS.map(shell => make('circle', { cx: C.x, cy: C.y, r: shell.r, class: 'escena__orbita' }, svg));
  const electronLayer = make('g', {}, svg);
  const nucleusLayer = make('g', {}, svg);
  let nucleons = [];
  let electrons = [];
  let serial = 0;
  let clock = 0;

  function nucleonTarget(index) {
    if (index === 0) return [0, 0];
    const rho = 5.7 * Math.sqrt(index + .25);
    const a = index * 2.39996;
    return [Math.cos(a) * rho, Math.sin(a) * rho];
  }

  function addNucleon(kind, instant) {
    const g = sphere(nucleusLayer, 6.3, kind === 'p' ? 'escena__proton' : 'escena__neutron');
    const from = kind === 'p' ? [-150, -120] : [150, -120];
    nucleons.push({ kind, g, x: instant ? 0 : from[0], y: instant ? 0 : from[1], born: serial += 1, leaving: false });
  }

  function removeNucleon(kind) {
    for (let i = nucleons.length - 1; i >= 0; i -= 1) {
      if (nucleons[i].kind === kind && !nucleons[i].leaving) {
        nucleons[i].leaving = true;
        nucleons[i].out = [nucleons[i].x * 4 + (kind === 'p' ? -150 : 150), -150];
        return;
      }
    }
  }

  function addElectron(instant) {
    const g = sphere(electronLayer, 4.4, 'escena__electron');
    electrons.push({ g, angle: -Math.PI / 2, radius: instant ? null : 170, leaving: false, born: serial += 1 });
  }

  function removeElectron() {
    for (let i = electrons.length - 1; i >= 0; i -= 1) {
      if (!electrons[i].leaving) { electrons[i].leaving = true; return; }
    }
  }

  // Primer arreglo: protones y neutrones intercalados, como en un núcleo real.
  for (let i = 0; i < counts.p + counts.n; i += 1) addNucleon(i % 2 ? 'n' : 'p', true);
  for (let i = 0; i < counts.e; i += 1) addElectron(true);

  function layout() {
    const staying = nucleons.filter(item => !item.leaving);
    staying.forEach((item, index) => { item.target = nucleonTarget(index); item.depth = index; });
    // Primero los de afuera; los del centro quedan encima, como una esfera.
    [...nucleons].sort((a, b) => (b.leaving ? 999 : b.depth) - (a.leaving ? 999 : a.depth))
      .forEach(item => nucleusLayer.appendChild(item.g));
    const active = electrons.filter(item => !item.leaving);
    let index = 0;
    SHELLS.forEach((shell, s) => {
      const inShell = active.slice(index, index + shell.cap);
      inShell.forEach((item, j) => {
        item.shell = s;
        item.slot = j / inShell.length * TAU;
        if (item.radius === null) item.radius = shell.r;
      });
      shellRings[s].setAttribute('opacity', inShell.length ? 1 : (index === active.length && s === 0 ? 1 : 0));
      index += shell.cap;
    });
  }

  function step(dt) {
    const k = 1 - Math.exp(-dt * 7);
    nucleons.forEach(item => {
      const [tx, ty] = item.leaving ? item.out : item.target;
      item.x += (tx - item.x) * k;
      item.y += (ty - item.y) * k;
    });
    nucleons = nucleons.filter(item => {
      if (item.leaving && Math.hypot(item.x - item.out[0], item.y - item.out[1]) < 6) { item.g.remove(); return false; }
      return true;
    });
    electrons.forEach(item => {
      if (item.leaving) {
        item.radius += dt * 220;
        item.angle += dt * .4;
        return;
      }
      const shell = SHELLS[item.shell];
      item.radius += (shell.r - item.radius) * k;
      const speed = [.9, .55, .38, .28][item.shell];
      const target = item.slot + clock * speed;
      let delta = ((target - item.angle) % TAU + TAU * 1.5) % TAU - Math.PI;
      item.angle += delta * k;
    });
    electrons = electrons.filter(item => {
      if (item.leaving && item.radius > 175) { item.g.remove(); return false; }
      return true;
    });
  }

  function draw() {
    nucleons.forEach(item => {
      item.g.setAttribute('transform', `translate(${round(C.x + item.x)} ${round(C.y + item.y)})`);
      item.g.setAttribute('opacity', item.leaving ? round(clamp(1 - Math.hypot(item.x, item.y) / 160)) : 1);
    });
    electrons.forEach(item => {
      item.g.setAttribute('transform', `translate(${round(C.x + Math.cos(item.angle) * item.radius)} ${round(C.y + Math.sin(item.angle) * item.radius)})`);
      item.g.setAttribute('opacity', item.leaving ? round(clamp(1 - (item.radius - 130) / 45)) : 1);
    });
  }

  function settle() {
    // Movimiento reducido: todo llega a su lugar de inmediato.
    nucleons = nucleons.filter(item => { if (item.leaving) item.g.remove(); return !item.leaving; });
    electrons = electrons.filter(item => { if (item.leaving) item.g.remove(); return !item.leaving; });
    layout();
    nucleons.forEach(item => { [item.x, item.y] = item.target; });
    electrons.forEach(item => {
      item.radius = SHELLS[item.shell].r;
      item.angle = item.slot - Math.PI / 2;
    });
    draw();
  }

  const fields = {
    symbol: root.querySelector('[data-builder-symbol]'),
    name: root.querySelector('[data-builder-name]'),
    notation: root.querySelector('[data-builder-notation]'),
    z: root.querySelector('[data-builder-z]'),
    a: root.querySelector('[data-builder-a]'),
    charge: root.querySelector('[data-builder-charge]'),
    note: root.querySelector('[data-builder-note]')
  };

  function chargeText(q) {
    if (q === 0) return '0';
    return `${Math.abs(q)}${q > 0 ? '+' : '−'}`;
  }

  function readout() {
    const element = ELEMENTOS[counts.p - 1];
    const mass = counts.p + counts.n;
    const q = counts.p - counts.e;
    fields.symbol.textContent = element.simbolo;
    fields.name.textContent = element.nombre;
    fields.notation.innerHTML = `<span class="atom-builder__scripts"><sup>${mass}</sup><sub>${counts.p}</sub></span>` +
      `<span class="atom-builder__x">${element.simbolo}</span>` +
      `<span class="atom-builder__q">${q === 0 ? '' : chargeText(q)}</span>`;
    fields.z.textContent = counts.p;
    fields.a.textContent = `${counts.p} + ${counts.n} = ${mass}`;
    fields.charge.textContent = q === 0
      ? `${counts.p} − ${counts.e} = 0 · átomo neutro`
      : `${counts.p} − ${counts.e} = ${chargeText(q)} · ion ${q > 0 ? 'positivo (catión)' : 'negativo (anión)'}`;
    const stable = (ESTABLES[counts.p] || []).includes(counts.n);
    const notes = [stable
      ? `Núcleo estable: así existe el ${element.nombre.toLowerCase()}-${mass} en la naturaleza.`
      : `Núcleo inestable: el ${element.nombre.toLowerCase()}-${mass} es radiactivo; con el tiempo se transforma en otro núcleo.`];
    if (Math.abs(q) > 3) notes.push('Un ion con una carga tan grande es muy raro.');
    fields.note.textContent = notes.join(' ');
    root.querySelectorAll('[data-builder-count]').forEach(node => {
      node.textContent = counts[node.dataset.builderCount];
    });
    root.querySelectorAll('[data-builder-step]').forEach(button => {
      const kind = button.dataset.builderStep, delta = Number(button.dataset.delta);
      button.disabled = counts[kind] + delta < LIMITS[kind][0] || counts[kind] + delta > LIMITS[kind][1];
    });
  }

  function change(kind, delta) {
    const next = counts[kind] + delta;
    if (next < LIMITS[kind][0] || next > LIMITS[kind][1]) return;
    counts[kind] = next;
    if (kind === 'e') {
      if (delta > 0) addElectron(false); else removeElectron();
    } else if (delta > 0) addNucleon(kind, false);
    else removeNucleon(kind);
    layout();
    readout();
    if (reducedMotion.matches) settle();
    else wake();
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-builder-step]');
    if (button) change(button.dataset.builderStep, Number(button.dataset.delta));
    const reset = event.target.closest('[data-builder-reset]');
    if (reset) {
      nucleons.forEach(item => item.g.remove());
      electrons.forEach(item => item.g.remove());
      nucleons = []; electrons = [];
      counts.p = 6; counts.n = 6; counts.e = 6;
      for (let i = 0; i < 12; i += 1) addNucleon(i % 2 ? 'n' : 'p', true);
      for (let i = 0; i < 6; i += 1) addElectron(true);
      readout();
      settle();
    }
  });

  layout();
  settle();
  readout();
  return {
    update(dt) { clock += dt; step(dt); draw(); },
    still() { settle(); }
  };
}

/* ---------------- 8 · Regla de las diagonales ----------------
   Llena los subniveles en orden de energía creciente, siguiendo las flechas
   diagonales. Al terminar, resalta el nivel más alto (periodo) y los
   electrones de valencia. */
const ORDEN = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const CAPACIDAD = { s: 2, p: 6, d: 10, f: 14 };
const EXCEPCIONES = new Set([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103]);
const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const SUPER = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(d => SUPER[d]).join('');

export function configurar(z) {
  const terms = [];
  let rest = z;
  for (const sub of ORDEN) {
    if (rest <= 0) break;
    const n = Math.min(CAPACIDAD[sub[1]], rest);
    terms.push({ sub, n, level: Number(sub[0]), type: sub[1] });
    rest -= n;
  }
  const period = Math.max(...terms.map(term => term.level));
  const valenceTerms = terms.filter(term => term.level === period && (term.type === 's' || term.type === 'p'));
  const valence = valenceTerms.reduce((sum, term) => sum + term.n, 0);
  const block = terms[terms.length - 1].type;
  const levels = Array.from({ length: period }, (_, i) => terms.filter(term => term.level === i + 1).reduce((sum, term) => sum + term.n, 0));
  return { terms, period, valence, valenceTerms, block, levels };
}


function diagonales(svg) {
  const root = svg.closest('[data-diagonales]');
  const configOut = root.querySelector('[data-diagonal-config]');
  const countOut = root.querySelector('[data-diagonal-count]');
  const periodOut = root.querySelector('[data-diagonal-period]');
  const valenceOut = root.querySelector('[data-diagonal-valence]');
  const familyOut = root.querySelector('[data-diagonal-family]');
  const noteOut = root.querySelector('[data-diagonal-note]');
  const levelsSvg = root.querySelector('[data-diagonal-levels]');
  const live = root.querySelector('[data-diagonal-live]');
  const kernelOut = root.querySelector('[data-diagonal-kernel]');
  const X0 = 32, DX = 78, Y0 = 26, DY = 44;
  const center = sub => [X0 + 'spdf'.indexOf(sub[1]) * DX, Y0 + (Number(sub[0]) - 1) * DY];
  const rows = [['1s'], ['2s', '2p'], ['3s', '3p', '3d'], ['4s', '4p', '4d', '4f'], ['5s', '5p', '5d', '5f'], ['6s', '6p', '6d'], ['7s', '7p']];

  const band = make('rect', { x: 4, width: 312, height: 38, rx: 4, class: 'escena__fila-periodo', opacity: 0 }, svg);

  // Flechas diagonales: unen los subniveles con la misma suma n + l.
  const diagonals = new Map();
  for (let m = 1; m <= 8; m += 1) {
    const members = rows.flat().filter(sub => Number(sub[0]) + 'spdf'.indexOf(sub[1]) === m)
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    if (!members.length) continue;
    const [x1, y1] = center(members[0]);
    const [x2, y2] = center(members[members.length - 1]);
    const ux = -DX, uy = DY, len = Math.hypot(ux, uy);
    const ex = ux / len, ey = uy / len;
    const sx = x1 - ex * 26, sy = y1 - ey * 26 + 3;
    const tx = x2 + ex * 30, ty = y2 + ey * 30 + 3;
    const g = make('g', { class: 'escena__diagonal' }, svg);
    make('path', { d: `M${round(sx)} ${round(sy)}L${round(tx)} ${round(ty)}` }, g);
    const ang = Math.atan2(ey, ex);
    const head = [[0, 0], [-7, -3.6], [-7, 3.6]].map(([hx, hy]) => [tx + hx * Math.cos(ang) - hy * Math.sin(ang), ty + hx * Math.sin(ang) + hy * Math.cos(ang)]);
    make('path', { d: `M${head.map(p => p.map(round).join(' ')).join('L')}Z`, class: 'escena__diagonal-punta' }, g);
    members.forEach(sub => diagonals.set(sub, g));
  }

  // Subniveles: etiqueta y un hueco por cada electrón que cabe.
  const cells = new Map();
  rows.flat().forEach(sub => {
    const [cx, cy] = center(sub);
    const cap = CAPACIDAD[sub[1]];
    const label = text(svg, cx, cy - 3, '', 'escena__subnivel', { 'text-anchor': 'middle' });
    const name = make('tspan', {}, label);
    name.textContent = sub;
    const count = make('tspan', { class: 'escena__subnivel-cuenta', dy: -7 }, label);
    const gap = 5.2;
    const slots = Array.from({ length: cap }, (_, i) => make('circle', {
      cx: round(cx + (i - (cap - 1) / 2) * gap), cy: cy + 11, r: 2, class: 'escena__hueco'
    }, svg));
    cells.set(sub, { label, count, slots, cap });
  });

  const picker = elementPicker(root, 11, () => start(true));

  let state = null;
  let playing = false;
  let progress = 0;

  // Ritmo del llenado: una pausa breve cuando la flecha llega a cada
  // subnivel y después sus electrones, uno a uno. Si el elemento tiene
  // muchos electrones, todo se acelera para no pasar de LIMITE segundos;
  // con muy pocos (H, He, Li), se alarga un poco hasta MINIMO.
  const PAUSA = .4, POR_ELECTRON = .18, LIMITE = 10, MINIMO = 2;

  function prepare(z) {
    const element = ELEMENTOS[z - 1];
    const result = configurar(z);
    const raw = result.terms.length * PAUSA + z * POR_ELECTRON;
    const k = raw < MINIMO ? Math.min(MINIMO / raw, 3) : Math.min(1, LIMITE / raw);
    const short = abreviada(z);
    state = { z, element, result, gas: short.gas, short: short.terms, pause: PAUSA * k, per: POR_ELECTRON * k, duration: raw * k };
  }

  // Electrones colocados tras `elapsed` segundos de animación.
  function placedAt(elapsed) {
    let t = 0, placed = 0;
    for (const term of state.result.terms) {
      t += state.pause;
      const count = Math.max(0, Math.min(term.n, Math.floor((elapsed - t) / state.per + 1e-9)));
      if (count < term.n) return placed + count;
      placed += term.n;
      t += term.n * state.per;
    }
    return placed;
  }


  function drawLevels(levels, z) {
    levelsSvg.innerHTML = '';
    const g = make('g', {}, levelsSvg);
    make('circle', { cx: 16, cy: 28, r: 12, class: 'escena__nucleo-suave' }, g);
    text(g, 16, 32, `${z}+`, 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
    levels.forEach((count, i) => {
      const x = 34 + i * 44;
      text(g, x + 18, 32, `${count}e⁻`, 'escena__clave', { 'text-anchor': 'middle' });
      make('path', { d: `M${x + 34} 6Q${x + 46} 28 ${x + 34} 50`, class: 'escena__nivel-arco' }, g);
    });
    levelsSvg.setAttribute('viewBox', '0 0 340 56');
  }

  function render(electronsPlaced) {
    const { result, z } = state;
    // El subnivel en curso es el primero que todavía no se llena.
    let rest = electronsPlaced;
    let current = null;
    const partialTerms = [];
    result.terms.forEach(term => {
      const filled = Math.max(0, Math.min(term.n, rest));
      rest -= filled;
      if (filled > 0) partialTerms.push([term, filled]);
      if (!current && filled < term.n) current = term.sub;
    });
    const done = electronsPlaced >= z;
    const inner = state.gas ? configurar(state.gas[0]).terms.map(term => term.sub) : [];
    cells.forEach((cell, sub) => {
      const pair = partialTerms.find(([term]) => term.sub === sub);
      const filled = pair ? pair[1] : 0;
      const valence = done && result.valenceTerms.some(term => term.sub === sub) && /[sp]/.test(result.block) && z > 2;
      const kernelCell = done && inner.includes(sub);
      cell.label.classList.toggle('es-kernel', kernelCell);
      cell.slots.forEach(slot => slot.classList.toggle('es-kernel', kernelCell));
      cell.slots.forEach((slot, i) => {
        slot.classList.toggle('es-lleno', i < filled);
        slot.classList.toggle('es-valencia', valence && i < filled);
      });
      cell.count.textContent = filled ? sup(filled) : '';
      cell.label.classList.toggle('es-activo', sub === current && !done);
      cell.label.classList.toggle('es-lleno', filled > 0);
    });
    diagonals.forEach(g => g.classList.remove('es-activa'));
    if (current && !done) diagonals.get(current).classList.add('es-activa');
    configOut.innerHTML = partialTerms.length
      ? partialTerms.map(([term, filled]) => {
        const strong = done && result.valenceTerms.includes(term) && /[sp]/.test(result.block) && z > 2;
        return `<span class="diagonal-tool__term${strong ? ' is-valence' : ''}">${term.sub}${sup(filled)}</span>`;
      }).join(' ')
      : '&nbsp;';
    countOut.textContent = `${Math.min(electronsPlaced, z)} de ${z} ${z === 1 ? 'electrón colocado' : 'electrones colocados'}`;
    band.setAttribute('opacity', done ? 1 : 0);
    if (done) band.setAttribute('y', Y0 + (result.period - 1) * DY - 21);
    root.classList.toggle('is-done', done);
  }

  function summary() {
    const { result, z, element } = state;
    periodOut.textContent = `${result.period} · el nivel más alto es ${result.period}`;
    const valenceWords = result.valenceTerms.map(term => `${term.sub}${sup(term.n)}`).join(' + ');
    const notes = [];
    if (result.block === 's' || result.block === 'p') {
      valenceOut.textContent = `${result.valence} · ${valenceWords}`;
      if (z === 2) {
        familyOut.textContent = 'VIIIA · gases nobles';
        notes.push('El helio es la excepción: tiene 2 electrones de valencia, pero va con los gases nobles porque su único nivel está lleno.');
      } else familyOut.textContent = `${ROMANOS[result.valence]}A`;
    } else {
      valenceOut.textContent = `${result.valence} en el último nivel · ${valenceWords}`;
      familyOut.textContent = result.block === 'd' ? 'Grupo B · metal de transición' : 'Lantánido o actínido';
      notes.push(`El último electrón entró en un subnivel ${result.block}: la familia de estos elementos no se lee con los electrones de valencia.`);
    }
    if (EXCEPCIONES.has(z)) {
      notes.push(`Ojo: el ${element.nombre.toLowerCase()} es una excepción a la regla; en la realidad sus electrones se acomodan un poco distinto.`);
    }
    noteOut.textContent = notes.join(' ');
    noteOut.hidden = notes.length === 0;
    drawLevels(result.levels, z);
    if (kernelOut) {
      kernelOut.innerHTML = state.gas
        ? `<span class="diagonal-tool__kernel-label">Abreviada</span> <span class="diagonal-tool__term">[${state.gas[1]}]</span> ` +
          state.short.map(term => `<span class="diagonal-tool__term">${term.sub}${sup(term.n)}</span>`).join(' ')
        : '<span class="diagonal-tool__kernel-label">Abreviada</span> no hay un gas noble antes: se escribe completa';
    }
  }

  // Un solo aviso para lectores de pantalla, cuando la configuración termina.
  function announce() {
    if (!live) return;
    const { result, element } = state;
    const shortText = state.gas ? ` Abreviada: [${state.gas[1]}] ${state.short.map(term => `${term.sub}${sup(term.n)}`).join(' ')}.` : '';
    live.textContent = `${element.nombre}: ${result.terms.map(term => `${term.sub}${sup(term.n)}`).join(' ')}.${shortText} ` +
      `Periodo ${periodOut.textContent}. Valencia ${valenceOut.textContent}. Familia ${familyOut.textContent}.`;
  }

  function start(animate) {
    prepare(picker.value);
    summary();
    if (animate && !reducedMotion.matches) {
      playing = true;
      progress = 0;
      root.classList.add('is-playing');
      render(0);
      wake();
    } else {
      playing = false;
      progress = state.duration;
      root.classList.remove('is-playing');
      render(state.z);
      announce();
    }
  }

  root.querySelectorAll('[data-diagonal-step]').forEach(button => {
    button.addEventListener('click', () => {
      picker.set(clamp(picker.value + Number(button.dataset.diagonalStep), 1, ELEMENTOS.length));
      start(true);
    });
  });
  root.querySelector('[data-diagonal-replay]').addEventListener('click', () => start(true));

  let seen = false;
  start(false);
  return {
    update(dt) {
      if (!seen) { seen = true; start(true); return; }
      if (!playing) return;
      progress += dt;
      if (progress >= state.duration) {
        playing = false;
        root.classList.remove('is-playing');
        render(state.z);
        announce();
        return;
      }
      render(placedAt(progress));
    },
    still() { seen = true; start(false); }
  };
}


/* ---------------- 9 · Configuración abreviada con gas noble ----------------
   La configuración completa se abrevia: los subniveles que coinciden con el
   gas noble anterior se juntan en su símbolo entre corchetes y sólo quedan a
   la vista los últimos. Recorre sodio, bromo y plomo. */
const GASES_NOBLES = [[2, 'He'], [10, 'Ne'], [18, 'Ar'], [36, 'Kr'], [54, 'Xe'], [86, 'Rn']];

// Gas noble anterior a un elemento (el más grande con menos electrones).
export function gasNobleAnterior(z) {
  return [...GASES_NOBLES].reverse().find(([g]) => g < z) || null;
}

export function abreviada(z) {
  const gas = gasNobleAnterior(z);
  const { terms } = configurar(z);
  if (!gas) return { gas: null, terms };
  const inner = configurar(gas[0]).terms.length;
  return { gas, terms: terms.slice(inner) };
}

function kernel(svg) {
  const ELEMS = [11, 35, 82];
  const FS = 15, CH = .6, SUP = .7;
  const X0 = 14, MAXW = 332, ROWS = [50, 78], MID = 64;
  const STEP = 6.6;
  const tokenWidth = (sub, n) => (sub.length * CH + String(n).length * CH * SUP) * FS;
  const GAP = CH * FS;

  function token(parent, sub, n) {
    const node = make('text', { class: 'escena__termino' }, parent);
    const main = make('tspan', {}, node);
    main.textContent = sub;
    const up = make('tspan', { class: 'escena__termino-exp', dy: -6 }, node);
    up.textContent = n;
    return node;
  }

  const layers = ELEMS.map(z => {
    const element = ELEMENTOS[z - 1];
    const { terms } = configurar(z);
    const [gasZ, gasSymbol] = gasNobleAnterior(z);
    const inner = configurar(gasZ).terms.length;
    const group = make('g', { opacity: 0 }, svg);
    text(group, X0, 20, `${element.nombre.toLowerCase()} · Z = ${z}`, 'escena__clave');
    const state = text(group, X0 + MAXW, 20, 'completa', 'escena__clave escena__clave--acento', { 'text-anchor': 'end' });

    // Acomodo completo: renglones que no pasan del ancho disponible.
    let x = X0, row = 0;
    const tokens = terms.map((term, i) => {
      const w = tokenWidth(term.sub, term.n);
      if (x + w > X0 + MAXW) { row += 1; x = X0; }
      const full = { x, y: ROWS[row] };
      x += w + GAP;
      return { node: token(group, term.sub, term.n), w, full, kernel: i < inner };
    });
    const rows = row + 1;

    // Acomodo abreviado: [gas] y después lo que falta, en un solo renglón.
    const gasText = `[${gasSymbol}]`;
    const gasW = gasText.length * CH * FS;
    const gasNode = text(group, X0, MID, gasText, 'escena__termino escena__termino--gas', { opacity: 0 });
    let ax = X0 + gasW + GAP;
    tokens.forEach(t => {
      if (t.kernel) t.abbr = { x: X0 + gasW / 2 - t.w / 2, y: MID };
      else { t.abbr = { x: ax, y: MID }; ax += t.w + GAP; }
    });

    // Corchete bajo los subniveles del gas noble, renglón por renglón.
    const kernelTokens = tokens.filter(t => t.kernel);
    const bracket = make('path', { class: 'escena__corchete', opacity: 0 }, group);
    let d = '';
    for (let r = 0; r < rows; r += 1) {
      const inRow = kernelTokens.filter(t => t.full.y === ROWS[r]);
      if (!inRow.length) continue;
      const x1 = inRow[0].full.x, x2 = inRow[inRow.length - 1].full.x + inRow[inRow.length - 1].w, y = ROWS[r] + 7;
      d += `M${round(x1)} ${y - 3}V${y}H${round(x2)}V${y - 3}`;
    }
    bracket.setAttribute('d', d);
    const lastRow = Math.max(...kernelTokens.map(t => t.full.y));
    const label = text(group, X0, lastRow + 26, `= [${gasSymbol}], los ${gasZ} electrones del ${ELEMENTOS[gasZ - 1].nombre.toLowerCase()}`,
      'escena__clave', { opacity: 0 });
    return { group, tokens, gasNode, bracket, label, state };
  });

  function render(t) {
    const index = Math.floor(t / STEP) % layers.length;
    const s = t - Math.floor(t / STEP) * STEP;
    layers.forEach((layer, i) => {
      if (i !== index) { layer.group.setAttribute('opacity', 0); return; }
      const fade = Math.min(smooth(span(s, 0, .5)), 1 - smooth(span(s, STEP - .6, STEP)));
      layer.group.setAttribute('opacity', round(fade));
      const mark = smooth(span(s, 1.4, 2.1));
      const collapse = smooth(span(s, 2.9, 4.0));
      layer.tokens.forEach(tok => {
        const x = mix(tok.full.x, tok.abbr.x, collapse), y = mix(tok.full.y, tok.abbr.y, collapse);
        set(tok.node, { x, y });
        tok.node.classList.toggle('es-kernel', tok.kernel && mark > .5);
        if (tok.kernel) tok.node.setAttribute('opacity', round(1 - smooth(span(collapse, .35, .9))));
      });
      layer.gasNode.setAttribute('opacity', round(smooth(span(collapse, .55, 1))));
      layer.bracket.setAttribute('opacity', round(mark * (1 - collapse)));
      layer.label.setAttribute('opacity', round(mark * (1 - smooth(span(collapse, 0, .4)))));
      layer.state.textContent = collapse > .5 ? 'abreviada' : 'completa';
    });
  }

  let t = 0;
  render(0);
  return {
    update(dt) { t = (t + dt) % (STEP * layers.length); render(t); },
    // Fotograma fijo: el bromo ya abreviado.
    still() { render(STEP + 5); }
  };
}

/* ---------------- 10 · Diagrama de orbitales: la regla de Hund ----------------
   Seis electrones entran, uno por uno, al subnivel 2p. Primero ocupan cada
   caja por separado y girando igual (↑); después se aparean con giro
   contrario (↓). El último en llegar se marca y se leen sus números m y s. */
const SPIN_UP = '+½', SPIN_DOWN = '−½';
const signed = m => (m > 0 ? `+${m}` : m < 0 ? `−${-m}` : '0');

// Flecha de espín: ↑ o ↓, con punta completa para que no se confunda
// con un número a tamaño pequeño.
function harpoon(parent, up) {
  const d = up ? 'M0 10V-10M-3.6 -5.6L0 -10L3.6 -5.6' : 'M0 -10V10M-3.6 5.6L0 10L3.6 5.6';
  return make('path', { d, class: 'escena__espin' }, parent);
}

// Orden de llenado de un subnivel (regla de Hund): primero uno en cada caja.
function hund(type, electrons) {
  const boxes = 2 * 'spdf'.indexOf(type) + 1;
  return Array.from({ length: electrons }, (_, i) => ({ box: i % boxes, up: i < boxes }));
}

function orbitales(svg) {
  const BOX = 34, GAP = 10, X0 = 114, Y0 = 50;
  const centers = [0, 1, 2].map(i => X0 + i * (BOX + GAP) + BOX / 2);
  text(svg, X0 - 14, Y0 + 24, '2p', 'escena__subnivel escena__subnivel--grande', { 'text-anchor': 'end' });
  centers.forEach((cx, i) => {
    make('rect', { x: cx - BOX / 2, y: Y0, width: BOX, height: BOX, rx: 2, class: 'escena__caja' }, svg);
    text(svg, cx, Y0 + BOX + 20, signed(i - 1), 'escena__clave', { 'text-anchor': 'middle' });
  });
  text(svg, X0 - 14, Y0 + BOX + 20, 'm', 'escena__clave', { 'text-anchor': 'end' });
  const counter = text(svg, X0 + 66, 24, '', 'escena__clave', { 'text-anchor': 'middle' });
  text(svg, 252, Y0 + 12, 'último electrón', 'escena__clave escena__clave--chica');
  const readM = text(svg, 252, Y0 + 34, '', 'escena__lectura');
  const readS = text(svg, 252, Y0 + 56, '', 'escena__lectura');
  const order = hund('p', 6);
  const arrows = order.map(({ box, up }) => {
    const g = make('g', { opacity: 0 }, svg);
    harpoon(g, up);
    return { g, x: centers[box] + (up ? -6 : 6), y: Y0 + BOX / 2, box, up };
  });
  const START = .8, EVERY = 1.25, CYCLE = START + 6 * EVERY + 2.4;

  function render(t) {
    const { s, opacity } = cycle(t, CYCLE - .7, CYCLE - .2, CYCLE);
    let placed = 0;
    arrows.forEach((a, i) => {
      const p = span(s, START + i * EVERY, START + i * EVERY + .45);
      if (p > 0) placed = i + 1;
      a.g.setAttribute('transform', `translate(${a.x} ${round(a.y - (1 - easeOut(p)) * 34)})`);
      a.g.setAttribute('opacity', round(clamp(p * 3) * opacity));
      a.g.classList.toggle('es-ultimo', p > 0 && i === placed - 1);
    });
    arrows.forEach((a, i) => a.g.classList.toggle('es-ultimo', i === placed - 1));
    counter.textContent = placed ? `electrón ${placed} de 6` : '2p vacío';
    const last = arrows[placed - 1];
    readM.textContent = last ? `m = ${signed(last.box - 1)}` : '';
    readS.textContent = last ? `s = ${last.up ? SPIN_UP : SPIN_DOWN}` : '';
    [counter, readM, readS].forEach(node => node.setAttribute('opacity', round(opacity)));
  }

  let t = 0;
  render(0);
  return {
    update(dt) { t = (t + dt) % CYCLE; render(t); },
    // Fotograma fijo: el cuarto electrón, el primero que se aparea.
    still() { render(START + 3 * EVERY + 1); }
  };
}

/* ---------------- 11 · Los cuatro números del último electrón ----------------
   Elige un elemento: sus subniveles después del gas noble se llenan caja por
   caja siguiendo la regla de Hund. El último electrón (el diferencial) se
   marca y se leen sus cuatro números cuánticos. */
function cajas(svg) {
  const root = svg.closest('[data-cajas]');
  const out = {
    config: root.querySelector('[data-cajas-config]'),
    n: root.querySelector('[data-cajas-n]'),
    l: root.querySelector('[data-cajas-l]'),
    m: root.querySelector('[data-cajas-m]'),
    s: root.querySelector('[data-cajas-s]'),
    why: root.querySelector('[data-cajas-why]'),
    live: root.querySelector('[data-cajas-live]')
  };
  const W = 340, H = 216, ROW = 66, BOX = 26, BGAP = 4, LABEL = 32, ITEM_GAP = 18;
  const layer = make('g', {}, svg);
  const PAUSA = .35, POR = .3, LIMITE = 8, MINIMO = 1.6;
  let state = null, playing = false, progress = 0, seen = false;

  function build(z) {
    layer.innerHTML = '';
    const { gas, terms } = abreviada(z);
    const items = [];
    if (gas) items.push({ kind: 'gas', label: `[${gas[1]}]`, width: 44 });
    terms.forEach(term => {
      const boxes = 2 * 'spdf'.indexOf(term.type) + 1;
      items.push({ kind: 'sub', term, boxes, width: LABEL + boxes * (BOX + BGAP) - BGAP });
    });
    // Acomodo en renglones que no pasan del ancho.
    let x = 8, row = 0;
    items.forEach(item => {
      if (x + item.width > W - 6 && x > 8) { row += 1; x = 8; }
      item.x = x; item.row = row;
      x += item.width + ITEM_GAP;
    });
    const rows = row + 1;
    const top = (H - rows * ROW) / 2;
    const electrons = [];
    items.forEach(item => {
      const y = top + item.row * ROW + 14;
      if (item.kind === 'gas') {
        text(layer, item.x, y + BOX / 2 + 6, item.label, 'escena__subnivel escena__subnivel--gas');
        return;
      }
      const { term, boxes } = item;
      text(layer, item.x, y + BOX / 2 + 5, term.sub, 'escena__subnivel es-lleno');
      const l = 'spdf'.indexOf(term.type);
      const boxNodes = Array.from({ length: boxes }, (_, i) => {
        const bx = item.x + LABEL + i * (BOX + BGAP);
        const rect = make('rect', { x: bx, y, width: BOX, height: BOX, rx: 2, class: 'escena__caja' }, layer);
        text(layer, bx + BOX / 2, y + BOX + 14, signed(i - l), 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
        return { rect, cx: bx + BOX / 2, cy: y + BOX / 2 };
      });
      hund(term.type, term.n).forEach(({ box, up }) => {
        const g = make('g', { opacity: 0 }, layer);
        harpoon(g, up);
        const target = boxNodes[box];
        electrons.push({ g, x: target.cx + (up ? -5 : 5), y: target.cy, box, up, term, l, rect: target.rect, sub: term.sub });
      });
    });
    return electrons;
  }

  function prepare(z) {
    const element = ELEMENTOS[z - 1];
    const electrons = build(z);
    const subs = new Set(electrons.map(e => e.sub)).size;
    const raw = subs * PAUSA + electrons.length * POR;
    const k = raw < MINIMO ? Math.min(MINIMO / raw, 3) : Math.min(1, LIMITE / raw);
    let time = 0, previous = null;
    electrons.forEach(e => {
      if (e.sub !== previous) { time += PAUSA * k; previous = e.sub; }
      time += POR * k;
      e.at = time;
    });
    state = { z, element, electrons, duration: time + .3 };
  }

  function render(elapsed) {
    const { electrons } = state;
    let placed = 0;
    electrons.forEach((e, i) => {
      const p = span(elapsed, e.at - .25, e.at);
      if (elapsed >= e.at - .25) placed = i + 1;
      e.g.setAttribute('transform', `translate(${round(e.x)} ${round(e.y - (1 - easeOut(p)) * 18)})`);
      e.g.setAttribute('opacity', round(clamp(p * 2.5)));
    });
    const done = elapsed >= state.duration;
    electrons.forEach((e, i) => {
      const last = done && i === electrons.length - 1;
      e.g.classList.toggle('es-ultimo', last);
      e.rect.classList.toggle('es-ultimo', false);
    });
    if (done && electrons.length) electrons[electrons.length - 1].rect.classList.add('es-ultimo');
    root.classList.toggle('is-done', done);
    return placed;
  }

  function summary() {
    const { z, element, electrons } = state;
    const { gas, terms } = abreviada(z);
    out.config.innerHTML = (gas ? `<span class="diagonal-tool__term">[${gas[1]}]</span> ` : '') +
      terms.map(term => `<span class="diagonal-tool__term">${term.sub}${sup(term.n)}</span>`).join(' ');
    const e = electrons[electrons.length - 1];
    const m = e.box - e.l;
    const spin = e.up ? SPIN_UP : SPIN_DOWN;
    out.n.textContent = `${e.term.level}`;
    out.l.textContent = `${e.l} · subnivel ${e.term.type}`;
    out.m.textContent = signed(m);
    out.s.textContent = `${spin} · ${e.up ? 'hacia arriba (↑)' : 'hacia abajo (↓)'}`;
    const boxes = 2 * e.l + 1;
    const position = e.up
      ? `es el ${e.term.n === 1 ? 'único' : `${ordinal(e.term.n)}`} de ${e.term.sub}: ocupa la caja ${e.box + 1} de ${boxes} (m = ${signed(m)}) solo, girando hacia arriba (s = ${SPIN_UP})`
      : `es el ${ordinal(e.term.n)} de ${e.term.sub}: las ${boxes} cajas ya tenían uno, así que se aparea en la caja ${e.box + 1} (m = ${signed(m)}) girando hacia abajo (s = ${SPIN_DOWN})`;
    const notes = [`El último electrón entró en ${e.term.sub}, así que n = ${e.term.level} y l = ${e.l}. Además, ${position}.`];
    if (EXCEPCIONES.has(z)) notes.push(`Ojo: el ${element.nombre.toLowerCase()} es una excepción a la regla de las diagonales; en la realidad sus electrones se acomodan un poco distinto.`);
    out.why.textContent = notes.join(' ');
    if (out.live) out.live.textContent = `${element.nombre}. Último electrón: n = ${e.term.level}, l = ${e.l}, m = ${signed(m)}, s = ${spin}.`;
  }

  const ORD = ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo', 'undécimo', 'duodécimo', 'decimotercero', 'decimocuarto'];
  function ordinal(n) { return ORD[n] || `${n}.º`; }

  function start(animate) {
    prepare(picker.value);
    summary();
    if (animate && !reducedMotion.matches) {
      playing = true; progress = 0;
      root.classList.add('is-playing');
      render(0);
      wake();
    } else {
      playing = false; progress = state.duration;
      root.classList.remove('is-playing');
      render(state.duration);
    }
  }

  const picker = elementPicker(root, 49, () => start(true));
  root.querySelectorAll('[data-cajas-step]').forEach(button => {
    button.addEventListener('click', () => {
      picker.set(clamp(picker.value + Number(button.dataset.cajasStep), 1, ELEMENTOS.length));
      start(true);
    });
  });
  root.querySelector('[data-cajas-replay]').addEventListener('click', () => start(true));

  start(false);
  return {
    update(dt) {
      if (!seen) { seen = true; start(true); return; }
      if (!playing) return;
      progress += dt;
      if (progress >= state.duration) {
        playing = false;
        root.classList.remove('is-playing');
        render(state.duration);
        return;
      }
      render(progress);
    },
    still() { seen = true; start(false); }
  };
}

/* ---------------- 12 · Isótopos del hidrógeno ----------------
   Tres átomos de hidrógeno con un protón cada uno. Los neutrones llegan uno
   por uno: el protio se queda sin neutrones, el deuterio recibe uno y el
   tritio dos. La masa crece; el elemento sigue siendo hidrógeno. */
function isotopos(svg) {
  const ATOMS = [
    { x: 62, name: 'protio', mass: 1 },
    { x: 180, name: 'deuterio', mass: 2 },
    { x: 298, name: 'tritio', mass: 3 }
  ];
  const Y = 66, ORBIT = 36, CYCLE = 9;
  const arrivals = [[1, 0, 1.2], [2, 0, 2.6], [2, 1, 4.0]];  // [átomo, neutrón, tiempo]
  const atoms = ATOMS.map((atom, i) => {
    make('circle', { cx: atom.x, cy: Y, r: ORBIT, class: 'escena__orbita' }, svg);
    const nucleus = make('g', {}, svg);
    const proton = sphere(nucleus, 6.6, 'escena__proton');
    const neutrons = [];
    const electron = sphere(svg, 4.4, 'escena__electron');
    text(svg, atom.x, Y + ORBIT + 22, atom.name, 'escena__etiqueta', { 'text-anchor': 'middle' });
    const formula = text(svg, atom.x, Y + ORBIT + 40, '', 'escena__lectura escena__lectura--chica', { 'text-anchor': 'middle' });
    const counts = text(svg, atom.x, Y + ORBIT + 56, '', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
    return { ...atom, nucleus, proton, neutrons, electron, formula, counts, phase: i * 2.1 };
  });
  arrivals.forEach(([a]) => {
    atoms[a].neutrons.push(sphere(atoms[a].nucleus, 6.6, 'escena__neutron'));
  });
  // El protón va al frente: es el que decide que sea hidrógeno.
  atoms.forEach(atom => atom.nucleus.appendChild(atom.proton));
  // Posiciones dentro del núcleo según cuántos nucleones hay.
  const SLOTS = { 1: [[0, 0]], 2: [[-3.6, 0], [3.6, 0]], 3: [[-3.4, 2.4], [3.4, 2.4], [0, -3.6]] };

  function render(t, clock) {
    const { s, opacity } = cycle(t, CYCLE - .7, CYCLE - .3, CYCLE);
    atoms.forEach((atom, a) => {
      const a0 = clock * 1.4 + atom.phase;
      atom.electron.setAttribute('transform', `translate(${round(atom.x + Math.cos(a0) * ORBIT)} ${round(Y + Math.sin(a0) * ORBIT)})`);
      let inside = 0;
      const flights = atom.neutrons.map((node, k) => {
        const [, , at] = arrivals.filter(([ia]) => ia === a)[k];
        const p = smooth(span(s, at - .8, at));
        if (p >= 1) inside += 1;
        return { node, p };
      });
      const total = 1 + flights.filter(f => f.p > 0).length;
      const slots = SLOTS[Math.max(1, total)];
      atom.proton.setAttribute('transform', `translate(${round(atom.x + slots[0][0])} ${round(Y + slots[0][1])})`);
      flights.forEach((f, k) => {
        const [tx, ty] = slots[Math.min(slots.length - 1, k + 1)];
        const sx = atom.x + 70, sy = Y - 70;
        f.node.setAttribute('transform', `translate(${round(mix(sx, atom.x + tx, f.p))} ${round(mix(sy, Y + ty, f.p))})`);
        f.node.setAttribute('opacity', round(f.p > 0 ? opacity : 0));
      });
      const mass = 1 + inside;
      atom.formula.textContent = `${'¹²³'[mass - 1]}H · A = ${mass}`;
      atom.counts.textContent = `1 p⁺ · ${inside} n⁰`;
    });
  }

  let t = 0, clock = 0;
  render(0, 0);
  return {
    update(dt) { clock += dt; t = (t + dt) % CYCLE; render(t, clock); },
    still() { render(6, .5); }
  };
}

/* ---------------- 13 · Alótropos del carbono ----------------
   El mismo átomo de carbono acomodado de dos formas, girando despacio:
   grafito (capas de hexágonos que se deslizan) y diamante (una red rígida
   en la que cada átomo se une a otros cuatro). */
function alotropos(svg) {
  const D = 1;
  // Grafito: dos capas de hexágonos, desplazadas entre sí.
  const layer = shift => {
    const atoms = [];
    const a1 = [Math.sqrt(3) * D, 0], a2 = [Math.sqrt(3) / 2 * D, 1.5 * D];
    for (let i = -3; i <= 3; i += 1) {
      for (let j = -3; j <= 3; j += 1) {
        [[0, 0], [0, D]].forEach(([bx, bz]) => {
          const x = i * a1[0] + j * a2[0] + bx, z = i * a1[1] + j * a2[1] + bz + shift;
          if (Math.hypot(x, z - .5) <= 2.35) atoms.push([x, z]);
        });
      }
    }
    return atoms;
  };
  const graphite = [];
  [[1.2, 0], [-1.2, D]].forEach(([y, shift]) => layer(shift).forEach(([x, z]) => graphite.push([x, y, z - .5])));
  // Diamante: un fragmento de la red alrededor de un átomo. Cada átomo se
  // une a cuatro vecinos en forma de tetraedro; se incluyen tres capas de
  // vecinos para que se vean los anillos de la red.
  const diamond = [];
  const fcc = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]];
  for (let i = -2; i <= 2; i += 1) for (let j = -2; j <= 2; j += 1) for (let k = -2; k <= 2; k += 1) {
    fcc.forEach(([a, b, c]) => [[0, 0, 0], [.25, .25, .25]].forEach(([u, v, w]) => {
      const x = i + a + u, y = j + b + v, z = k + c + w;
      if (Math.hypot(x, y, z) <= .84) diamond.push([x, y, z]);
    }));
  }
  const diamondAtoms = diamond.map(([x, y, z]) => [x * 3, y * 3, z * 3]);

  function bondsOf(atoms, length, tolerance, sameLayer) {
    const bonds = [];
    for (let i = 0; i < atoms.length; i += 1) {
      for (let j = i + 1; j < atoms.length; j += 1) {
        if (sameLayer && atoms[i][1] !== atoms[j][1]) continue;
        const d = Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][1] - atoms[j][1], atoms[i][2] - atoms[j][2]);
        if (Math.abs(d - length) < tolerance) bonds.push([i, j]);
      }
    }
    return bonds;
  }
  const models = [
    { cx: 92, cy: 84, scale: 26, atoms: graphite, bonds: bondsOf(graphite, D, .05, true), r: 4.2, speed: .35 },
    { cx: 270, cy: 84, scale: 27, atoms: diamondAtoms, bonds: bondsOf(diamondAtoms, Math.sqrt(3) / 4 * 3, .05, false), r: 4.4, speed: .3 }
  ];
  models.forEach(model => {
    model.group = make('g', {}, svg);
    model.bondNodes = model.bonds.map(() => make('line', { class: 'escena__enlace-red' }, model.group));
    model.atomNodes = model.atoms.map(() => sphere(model.group, model.r, 'escena__carbono'));
  });
  // Líneas punteadas entre capas del grafito: fuerzas débiles.
  const weak = make('g', {}, models[0].group);
  const weakPairs = [];
  graphite.forEach((p, i) => graphite.forEach((q, j) => {
    if (i < j && p[1] > 0 && q[1] < 0 && Math.hypot(p[0] - q[0], p[2] - q[2]) < .05 && weakPairs.length < 4) weakPairs.push([i, j]);
  }));
  const weakNodes = weakPairs.map(() => make('line', { class: 'escena__enlace-debil' }, weak));
  models[0].group.insertBefore(weak, models[0].group.firstChild);

  text(svg, 92, 172, 'grafito', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(svg, 92, 187, 'capas que se deslizan', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
  text(svg, 270, 172, 'diamante', 'escena__etiqueta', { 'text-anchor': 'middle' });
  text(svg, 270, 187, 'red rígida de tetraedros', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });

  const TILT = .42;
  function project(model, [x, y, z], angle) {
    const xr = x * Math.cos(angle) + z * Math.sin(angle);
    const zr = -x * Math.sin(angle) + z * Math.cos(angle);
    const yy = y * Math.cos(TILT) - zr * Math.sin(TILT);
    const depth = y * Math.sin(TILT) + zr * Math.cos(TILT);
    return [model.cx + xr * model.scale, model.cy - yy * model.scale, depth];
  }

  function render(clock) {
    models.forEach((model, k) => {
      const angle = clock * model.speed + k * .7;
      const points = model.atoms.map(p => project(model, p, angle));
      const span3 = Math.max(...points.map(p => Math.abs(p[2]))) || 1;
      // Los de atrás primero: los de adelante quedan encima.
      const order = points.map((p, i) => [p[2], i]).sort((a, b) => a[0] - b[0]);
      order.forEach(([depth, i]) => {
        const node = model.atomNodes[i];
        model.group.appendChild(node);
        node.setAttribute('transform', `translate(${round(points[i][0])} ${round(points[i][1])}) scale(${round(1 + depth / span3 * .14)})`);
        node.setAttribute('opacity', round(.55 + .45 * (depth / span3 + 1) / 2));
      });
      model.bonds.forEach(([i, j], b) => {
        set(model.bondNodes[b], { x1: points[i][0], y1: points[i][1], x2: points[j][0], y2: points[j][1] });
      });
      if (k === 0) weakPairs.forEach(([i, j], w) => set(weakNodes[w], { x1: points[i][0], y1: points[i][1], x2: points[j][0], y2: points[j][1] }));
      // Los enlaces van detrás de los átomos.
      model.bondNodes.forEach(node => model.group.insertBefore(node, model.group.firstChild));
    });
  }

  let clock = 0;
  render(0);
  return {
    update(dt) { clock += dt; render(clock); },
    still() { render(.6); }
  };
}

/* ---------------- 14 · La balanza del mol ----------------
   Un mol de carbono (12 g) y un mol de sal (58.5 g) tienen el mismo número
   de partículas, 6.022 × 10²³, pero distinta masa: la balanza se inclina
   hacia la sal. La lupa de cada platillo muestra partículas en igual número. */
function balanza(svg) {
  const P = { x: 180, y: 52 }, ARM = 98, DROP = 38, CYCLE = 10.5;
  const STATES = [0, -7, 11];  // vacía, sólo carbono, carbono y sal (grados)
  const BUBBLES = [{ x: 58, y: 162 }, { x: 302, y: 162 }];
  make('path', { d: `M${P.x - 34} 176H${P.x + 34}L${P.x + 22} 164H${P.x - 22}Z`, class: 'escena__balanza-base' }, svg);
  make('rect', { x: P.x - 3, y: P.y, width: 6, height: 114, class: 'escena__balanza-poste' }, svg);
  const leaders = BUBBLES.map(() => make('path', { class: 'escena__lupa-guia', opacity: 0 }, svg));
  const beam = make('g', {}, svg);
  make('rect', { x: -ARM - 4, y: -3, width: 2 * ARM + 8, height: 6, rx: 3, class: 'escena__balanza-brazo' }, beam);
  make('circle', { r: 6, class: 'escena__balanza-eje' }, svg).setAttribute('transform', `translate(${P.x} ${P.y})`);
  const pans = [-1, 1].map(side => {
    const g = make('g', {}, svg);
    make('path', { d: `M0 0L-28 ${DROP}M0 0L28 ${DROP}`, class: 'escena__balanza-hilo' }, g);
    make('path', { d: `M-36 ${DROP}Q0 ${DROP + 17} 36 ${DROP}Z`, class: 'escena__balanza-platillo' }, g);
    return { side, g };
  });
  // Muestras: un trozo de carbón y un montón de sal.
  const carbon = make('g', { opacity: 0 }, pans[0].g);
  make('path', { d: smoothClosed([[-18, -2], [-8, -12], [6, -13], [17, -6], [19, 2], [6, 5], [-12, 5]]), class: 'escena__carbono' }, carbon)
    .setAttribute('transform', `translate(0 ${DROP - 3})`);
  const salt = make('g', { opacity: 0 }, pans[1].g);
  [[-14, 0], [-5, 0], [4, 0], [13, 0], [-9, -8], [0, -8], [9, -8], [-4, -16], [5, -16], [0.5, -24]].forEach(([x, y]) => {
    make('rect', { x: x - 4, y: DROP - 7 + y, width: 8, height: 8, rx: 1, class: 'escena__sal' }, salt);
  });
  // Lupas fijas abajo, con el mismo número de partículas en cada una.
  const bubble = ({ x, y }, draw) => {
    const g = make('g', { opacity: 0 }, svg);
    make('circle', { cx: x, cy: y, r: 26, class: 'escena__lupa-burbuja' }, g);
    draw(g, x, y);
    return g;
  };
  const carbonBubble = bubble(BUBBLES[0], (g, x, y) => {
    [[-11, -6], [0, -9], [11, -6], [-6, 5], [6, 5], [0, 14]].forEach(([dx, dy]) => {
      sphere(g, 4.6, 'escena__carbono').setAttribute('transform', `translate(${x + dx} ${y + dy})`);
    });
  });
  const saltBubble = bubble(BUBBLES[1], (g, x, y) => {
    [[-12, -11], [5, -11], [-12, 3], [5, 3], [-3, -21], [-3, 13]].forEach(([dx, dy]) => {
      sphere(g, 5, 'escena__atomo escena__atomo--cl').setAttribute('transform', `translate(${x + dx} ${y + dy})`);
      sphere(g, 3.3, 'escena__atomo escena__atomo--na').setAttribute('transform', `translate(${x + dx + 7.5} ${y + dy + 3.5})`);
    });
  });
  const labels = [
    text(svg, BUBBLES[0].x + 24, 206, '1 mol de carbono · 12 g', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' }),
    text(svg, BUBBLES[1].x - 24, 206, '1 mol de sal · 58.5 g', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' })
  ];
  const note = text(svg, P.x, 16, 'en cada platillo: 6.022 × 10²³ partículas', 'escena__clave', { 'text-anchor': 'middle', opacity: 0 });

  // Ángulo con un pequeño vaivén amortiguado al cambiar de carga.
  function angleAt(s) {
    const events = [[0, STATES[0]], [1.8, STATES[1]], [3.6, STATES[2]], [CYCLE - .9, STATES[0]]];
    let current = 0;
    for (let i = 0; i < events.length; i += 1) {
      const [at, target] = events[i];
      if (s < at) break;
      const previous = i ? events[i - 1][1] : 0;
      const tau = s - at;
      current = target + (previous - target) * Math.exp(-2.6 * tau) * Math.cos(5.5 * tau);
    }
    return current;
  }

  function render(t) {
    const { s, opacity } = cycle(t, CYCLE - .9, CYCLE - .3, CYCLE);
    const angle = angleAt(s) * Math.PI / 180;
    beam.setAttribute('transform', `translate(${P.x} ${P.y}) rotate(${round(angle * 180 / Math.PI)})`);
    const ends = pans.map(pan => {
      const x = P.x + pan.side * ARM * Math.cos(angle), y = P.y + pan.side * ARM * Math.sin(angle);
      pan.g.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
      return [x, y];
    });
    const dropIn = (start) => {
      const p = span(s, start, start + .55);
      return { p, y: (1 - easeOut(p)) * -40 };
    };
    const c = dropIn(1.25), k = dropIn(3.05);
    carbon.setAttribute('opacity', round(clamp(c.p * 3) * opacity));
    carbon.firstChild.setAttribute('transform', `translate(0 ${round(DROP - 3 + c.y)})`);
    salt.setAttribute('opacity', round(clamp(k.p * 3) * opacity));
    salt.setAttribute('transform', `translate(0 ${round(k.y)})`);
    const showC = smooth(span(s, 2.2, 2.8)) * opacity, showK = smooth(span(s, 4.2, 4.8)) * opacity;
    carbonBubble.setAttribute('opacity', round(showC));
    saltBubble.setAttribute('opacity', round(showK));
    [showC, showK].forEach((show, i) => {
      const [x, y] = ends[i];
      const b = BUBBLES[i];
      leaders[i].setAttribute('d', `M${round(x)} ${round(y + DROP + 12)}L${round(b.x + (i ? -10 : 10))} ${round(b.y - 24)}`);
      leaders[i].setAttribute('opacity', round(show));
    });
    labels[0].setAttribute('opacity', round(smooth(span(s, 1.6, 2.2)) * opacity));
    labels[1].setAttribute('opacity', round(smooth(span(s, 3.4, 4.0)) * opacity));
    note.setAttribute('opacity', round(smooth(span(s, 5, 5.6)) * opacity));
  }

  let t = 0;
  render(0);
  return {
    update(dt) { t = (t + dt) % CYCLE; render(t); },
    still() { render(7.5); }
  };
}

/* ---------------- Calculadora de masa molar ----------------
   Desglosa una fórmula como en la fuente: átomos × masa atómica, renglón
   por renglón, y la suma en g/mol. Usa las masas redondeadas del curso; si
   un elemento no está en esa lista, toma la de la tabla periódica con un
   decimal. */
export const MASAS_CURSO = {
  H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40,
  Fe: 56, Ni: 58.7, Cu: 63.5, Zn: 65.4, Br: 80, Ag: 108, I: 127, Ba: 137, Au: 197, Hg: 200.6, Pb: 207
};

export function masaAtomica(symbol) {
  if (MASAS_CURSO[symbol] !== undefined) return MASAS_CURSO[symbol];
  const element = ELEMENTOS.find(e => e.simbolo === symbol);
  if (!element) return null;
  return Math.round(parseFloat(String(element.masa).replace(/[[\]]/g, '')) * 10) / 10;
}

// Fórmula → { símbolo: átomos }, con paréntesis: Ca(OH)2.
export function leerFormula(text) {
  const source = String(text).replace(/[₀-₉]/g, d => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d))).replace(/\s+/g, '');
  let i = 0;
  function group() {
    const counts = {};
    while (i < source.length && source[i] !== ')') {
      let part;
      if (source[i] === '(') {
        i += 1;
        part = group();
        if (source[i] !== ')') throw new Error('Falta cerrar un paréntesis.');
        i += 1;
      } else {
        const match = /^[A-Z][a-z]?/.exec(source.slice(i));
        if (!match) throw new Error(`No reconozco «${source[i]}». Los símbolos empiezan con mayúscula: Na, Cl, O…`);
        if (masaAtomica(match[0]) === null) throw new Error(`«${match[0]}» no es un símbolo de la tabla periódica.`);
        i += match[0].length;
        part = { [match[0]]: 1 };
      }
      const number = /^\d+/.exec(source.slice(i));
      const times = number ? Number(number[0]) : 1;
      if (number) i += number[0].length;
      Object.entries(part).forEach(([symbol, n]) => { counts[symbol] = (counts[symbol] || 0) + n * times; });
    }
    return counts;
  }
  const counts = group();
  if (i < source.length) throw new Error('Sobra un paréntesis de cierre.');
  if (!Object.keys(counts).length) throw new Error('Escribe una fórmula, por ejemplo H2O.');
  return counts;
}

function masaMolar(root) {
  const input = root.querySelector('[data-masa-input]');
  const table = root.querySelector('[data-masa-tabla]');
  const total = root.querySelector('[data-masa-total]');
  const status = root.querySelector('[data-masa-estado]');
  const fmt = n => (Math.round(n * 100) / 100).toLocaleString('es-MX', { maximumFractionDigits: 2 });
  function show() {
    const value = input.value.trim();
    table.innerHTML = '';
    total.textContent = '';
    if (!value) { status.textContent = 'Escribe una fórmula, por ejemplo H2O o C12H22O11.'; return; }
    let counts;
    try { counts = leerFormula(value); } catch (error) { status.textContent = error.message; return; }
    status.textContent = '';
    let sum = 0;
    Object.entries(counts).forEach(([symbol, n]) => {
      const mass = masaAtomica(symbol);
      sum += n * mass;
      const row = document.createElement('tr');
      row.innerHTML = `<th scope="row">${symbol}</th><td>${n} × ${fmt(mass)}</td><td>${fmt(n * mass)}</td>`;
      table.appendChild(row);
    });
    total.textContent = `${fmt(sum)} g/mol`;
  }
  input.addEventListener('input', show);
  root.querySelectorAll('[data-masa-ejemplo]').forEach(button => {
    button.addEventListener('click', () => { input.value = button.dataset.masaEjemplo; show(); input.focus(); });
  });
  show();
}
document.querySelectorAll('[data-masa-molar]').forEach(masaMolar);

/* ---------------- Reloj compartido ---------------- */
const factories = { democrito, dalton, thomson, rutherford, bohr, nube, constructor, diagonales, kernel, orbitales, cajas, isotopos, alotropos, balanza };
const scenes = [...document.querySelectorAll('[data-escena-atomo]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaAtomo](svg)
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
function wake() { schedule(); }
function applyPreference() {
  stop();
  for (const scene of scenes) {
    scene.svg.toggleAttribute('data-quieta', reducedMotion.matches);
    if (reducedMotion.matches) scene.still();
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
