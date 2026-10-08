/* Escenas del tema 2 de Química ECOEMS: estructura del átomo.
   Mismo contrato que escenas-particulas.js: cada escena es { update(dt),
   still() }; el reloj compartido sólo avanza las escenas visibles y, con
   movimiento reducido, cada una dibuja un fotograma fijo que resume el proceso.
   En estas escenas el terracota marca la carga positiva —núcleo, protones,
   partículas alfa y la masa positiva de Thomson—; los electrones son de tinta.
   Las figuras no llevan contorno: el SVG base hereda stroke: currentColor y
   aquí se anula en cada figura. */
import { ELEMENTOS } from './elementos.js';

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

/* Selector de elemento con el diseño de Tercial. Sustituye al select
   nativo, cuya lista despliega el sistema operativo con otro estilo. Es un
   combobox accesible: botón que abre un panel con buscador y la lista de
   elementos agrupada por periodo; flechas para moverse, Enter para elegir,
   Esc para cerrar. */
const normalize = value => String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function elementPicker(root, initial, onPick) {
  const wrap = root.querySelector('[data-element-picker]');
  const button = wrap.querySelector('[data-picker-button]');
  const panel = wrap.querySelector('[data-picker-panel]');
  const search = wrap.querySelector('[data-picker-search]');
  const list = wrap.querySelector('[data-picker-list]');
  const empty = wrap.querySelector('[data-picker-empty]');
  const coarse = window.matchMedia('(pointer: coarse)');
  const options = new Map();
  const groups = [];
  let value = initial;
  let active = initial;

  let group = null;
  ELEMENTOS.forEach(element => {
    if (!group || group.period !== element.periodo) {
      const header = document.createElement('li');
      header.className = 'element-picker__group';
      header.setAttribute('aria-hidden', 'true');
      header.textContent = `Periodo ${element.periodo}`;
      list.appendChild(header);
      group = { period: element.periodo, header, members: [] };
      groups.push(group);
    }
    const option = document.createElement('li');
    option.className = 'element-picker__option';
    option.id = `${list.id}-${element.numero}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.dataset.z = element.numero;
    option.dataset.search = normalize(`${element.numero} ${element.simbolo} ${element.nombre} ${element.alias}`);
    option.innerHTML = `<span class="element-picker__z">${element.numero}</span>` +
      `<span class="element-picker__symbol">${element.simbolo}</span>` +
      `<span class="element-picker__name">${element.nombre}</span>`;
    list.appendChild(option);
    options.set(element.numero, option);
    group.members.push(option);
  });

  const label = z => {
    const element = ELEMENTOS[z - 1];
    return `${element.numero} · ${element.simbolo} · ${element.nombre}`;
  };

  function visibleOptions() {
    return [...options.values()].filter(option => !option.hidden);
  }

  function reveal(option, center) {
    const top = option.offsetTop - list.offsetTop;
    const bottom = top + option.offsetHeight;
    if (center) list.scrollTop = top - list.clientHeight / 2 + option.offsetHeight / 2;
    else if (top < list.scrollTop) list.scrollTop = top - 28;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }

  function setActive(z, center) {
    const previous = options.get(active);
    if (previous) previous.classList.remove('is-active');
    active = z;
    const option = options.get(z);
    if (!option) { search.removeAttribute('aria-activedescendant'); return; }
    option.classList.add('is-active');
    search.setAttribute('aria-activedescendant', option.id);
    reveal(option, center);
  }

  // Qué tan bien coincide un elemento con lo escrito: el símbolo o el número
  // exactos ganan («ca» → calcio), luego el nombre que empieza así.
  function score(z, q) {
    const element = ELEMENTOS[z - 1];
    const symbol = normalize(element.simbolo), name = normalize(element.nombre);
    if (symbol === q || String(z) === q) return 0;
    if (name.startsWith(q)) return 1;
    if (symbol.startsWith(q) || String(z).startsWith(q)) return 2;
    if (options.get(z).dataset.search.split(' ').some(word => word.startsWith(q))) return 3;
    if (options.get(z).dataset.search.includes(q)) return 4;
    return Infinity;
  }

  function filter(query) {
    const q = normalize(query);
    let best = null, bestScore = Infinity;
    options.forEach((option, z) => {
      const points = q ? score(z, q) : 0;
      option.hidden = points === Infinity;
      if (points < bestScore) { best = z; bestScore = points; }
    });
    groups.forEach(g => { g.header.hidden = g.members.every(option => option.hidden); });
    empty.hidden = best !== null;
    if (best !== null && q) setActive(best, true);
  }

  function open() {
    if (!panel.hidden) return;
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    search.value = '';
    filter('');
    setActive(value, true);
    if (!coarse.matches) search.focus();
    else list.focus({ preventScroll: true });
  }

  function close(returnFocus) {
    if (panel.hidden) return;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }

  function set(z) {
    options.get(value).setAttribute('aria-selected', 'false');
    value = z;
    options.get(z).setAttribute('aria-selected', 'true');
    button.textContent = label(z);
  }

  function pick(z) {
    set(z);
    close(true);
    onPick(z);
  }

  function move(step) {
    const visible = visibleOptions();
    if (!visible.length) return;
    const index = visible.findIndex(option => Number(option.dataset.z) === active);
    const next = visible[Math.max(0, Math.min(visible.length - 1, index + step))];
    setActive(Number(next.dataset.z), false);
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close(false)));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
  });
  search.addEventListener('input', () => filter(search.value));
  const keys = event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
    else if (event.key === 'PageDown') { event.preventDefault(); move(8); }
    else if (event.key === 'PageUp') { event.preventDefault(); move(-8); }
    else if (event.key === 'Enter') { event.preventDefault(); if (!options.get(active).hidden) pick(active); }
    else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close(false);
  };
  search.addEventListener('keydown', keys);
  list.addEventListener('keydown', keys);
  list.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (option) pick(Number(option.dataset.z));
  });
  list.addEventListener('pointermove', event => {
    const option = event.target.closest('[role="option"]');
    if (option && Number(option.dataset.z) !== active && event.pointerType === 'mouse') setActive(Number(option.dataset.z), false);
  });
  document.addEventListener('pointerdown', event => {
    if (!panel.hidden && !wrap.contains(event.target)) close(false);
  });
  wrap.addEventListener('focusout', () => {
    setTimeout(() => { if (!wrap.contains(document.activeElement) && !coarse.matches) close(false); }, 0);
  });

  set(initial);
  return { get value() { return value; }, set };
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

/* ---------------- Reloj compartido ---------------- */
const factories = { democrito, dalton, thomson, rutherford, bohr, nube, constructor, diagonales, kernel };
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
