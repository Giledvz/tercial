/* Escenas de enlaces químicos, tema 2 de Química ECOEMS: símbolos de Lewis,
   enlace iónico, covalente (polar y no polar), la escala de diferencia de
   electronegatividad, el enlace metálico y los puentes de hidrógeno.
   Mismo contrato que escenas-atomo.js: cada escena es { update(dt), still() };
   el reloj compartido sólo avanza las escenas visibles y, con movimiento
   reducido, cada una dibuja un fotograma fijo que resume el proceso.
   Como en las escenas del átomo, el terracota marca la carga positiva y lo
   que hay que mirar; los electrones son de tinta. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const round = value => Math.round(value * 100) / 100;
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

const ultimo = new WeakMap();
function fade(node, value) {
  const v = Math.round(clamp(value) * 100) / 100;
  if (ultimo.get(node) === v) return;
  ultimo.set(node, v);
  node.setAttribute('opacity', v);
}

// Desvanecimiento de entrada y salida de un ciclo de T segundos.
const ciclo = (t, T, entra = .5, sale = 1.2) => (t < entra ? smooth(t / entra) : 1 - smooth((t - (T - sale)) / sale));

/* Puntos de Lewis: primero uno por lado (arriba, derecha, abajo, izquierda) y
   después se forman los pares. Devuelve posiciones relativas al símbolo. */
function puntosLewis(n, r = 11, sep = 2.6, rx = r) {
  const lados = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const cuenta = [0, 0, 0, 0];
  for (let i = 0; i < n; i += 1) cuenta[i % 4] += 1;
  const puntos = [];
  cuenta.forEach((c, i) => {
    const [dx, dy] = lados[i];
    if (c === 1) puntos.push([dx * rx, dy * r]);
    if (c === 2) [-1, 1].forEach(s => puntos.push([dx * rx + dy * sep * s, dy * r + dx * sep * s]));
  });
  // Orden de aparición: los cuatro primeros solos, luego sus parejas.
  return puntos;
}

/* ---------------- 1 · Símbolos de Lewis del periodo 3 ----------------
   Cada punto es un electrón de valencia. Del sodio al argón aparece un punto
   más en cada elemento: el número de puntos es el número de la familia A. */
function lewis(svg) {
  const T = 14;
  const scene = make('g', {}, svg);
  const ELEMENTOS = [['Na', 'IA'], ['Mg', 'IIA'], ['Al', 'IIIA'], ['Si', 'IVA'], ['P', 'VA'], ['S', 'VIA'], ['Cl', 'VIIA'], ['Ar', 'VIIIA']];
  // Dos filas de cuatro: con más espacio, los puntos de un símbolo no parecen
  // compartidos con el de al lado.
  const items = ELEMENTOS.map(([symbol, family], i) => {
    const x = 54 + (i % 4) * 84, y = i < 4 ? 40 : 112;
    const g = make('g', {}, scene);
    text(g, x, y + 6, symbol, 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
    const dots = puntosLewis(i + 1, 13, 2.8, symbol.length > 1 ? 18 : 13).map(([dx, dy], k) => ({
      node: make('circle', { cx: round(x + dx), cy: round(y + dy), r: 2.2, class: 'escena__electron', opacity: 0 }, g),
      at: 1 + i * .8 + k * .07
    }));
    text(g, x, y + 32, family, 'escena__lewis-familia', { 'text-anchor': 'middle' });
    const count = text(g, x, y + 43, `${i + 1} e⁻`, 'escena__lewis-cuenta', { 'text-anchor': 'middle', opacity: 0 });
    return { dots, count, at: 1 + i * .8 };
  });
  const nota = text(scene, 180, 178, 'Mismo número de puntos que el de su familia A', 'escena__nota-enlace', { 'text-anchor': 'middle', opacity: 0 });

  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : ciclo(time, T));
    items.forEach(item => {
      item.dots.forEach(dot => fade(dot.node, final ? 1 : (time - dot.at) / .25));
      fade(item.count, final ? 1 : (time - item.at - .4) / .3);
    });
    fade(nota, final ? 1 : (time - 8) / .6);
  }
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 2 · Enlace iónico: el sodio le da un electrón al cloro ----------------
   El único electrón de valencia del sodio viaja hasta el cloro, que tenía 7.
   Quedan Na⁺ (terracota, más pequeño) y Cl⁻ (con 8 en su último nivel), que
   se atraen. Al final, la vista se abre: un cristal de iones, sin moléculas. */
function ionico(svg) {
  const T = 16;
  const scene = make('g', {}, svg);
  const pair = make('g', {}, scene);
  const NA = [110, 84], CL = [250, 84], RING_NA = 30, RING_CL = 34;
  // Sodio
  const na = make('g', {}, pair);
  const naRing = make('circle', { cx: NA[0], cy: NA[1], r: RING_NA, class: 'escena__capa' }, na);
  const naCore = make('circle', { cx: NA[0], cy: NA[1], r: 15, class: 'escena__nucleo-ion' }, na);
  const naLabel = text(na, NA[0], NA[1] + 5, 'Na', 'escena__ion-simbolo', { 'text-anchor': 'middle' });
  // Cloro, con sus 7 electrones de valencia
  const cl = make('g', {}, pair);
  const clRing = make('circle', { cx: CL[0], cy: CL[1], r: RING_CL, class: 'escena__capa' }, cl);
  const clCore = make('circle', { cx: CL[0], cy: CL[1], r: 21, class: 'escena__anion' }, cl);
  text(cl, CL[0], CL[1] + 5, 'Cl', 'escena__ion-simbolo escena__ion-simbolo--tinta', { 'text-anchor': 'middle' });
  const angles = Array.from({ length: 8 }, (_, i) => -Math.PI / 2 + i * TAU / 8);
  const clElectrons = angles.slice(0, 7).map(a => ({ a, node: make('circle', { r: 2.6, class: 'escena__electron' }, cl) }));
  // Al ganar el electrón el cloro crece: el Cl⁻ mide unos 181 pm y el átomo, 99 pm.
  const CRECE = 4;
  function capaCl(extra) {
    const r = RING_CL + extra;
    set(clRing, { r });
    set(clCore, { r: 21 + extra * .6 });
    clElectrons.forEach(e => set(e.node, { cx: CL[0] + Math.cos(e.a) * r, cy: CL[1] + Math.sin(e.a) * r }));
    return r;
  }
  // El electrón que viaja (con un aro terracota para seguirlo con la vista)
  const traveler = make('g', {}, pair);
  make('circle', { r: 5.5, class: 'escena__electron-aro' }, traveler);
  make('circle', { r: 2.6, class: 'escena__electron' }, traveler);
  const start = [NA[0] + RING_NA, NA[1]];
  const endAngle = angles[7];
  // Cargas y letreros
  const plus = text(pair, NA[0] + 20, NA[1] - 18, '+', 'escena__carga escena__carga--mas', { opacity: 0 });
  const minus = text(pair, CL[0] + 30, CL[1] - 26, '−', 'escena__carga', { opacity: 0 });
  const labelsBefore = [
    text(pair, NA[0], 148, 'Na · 1 electrón de valencia', 'escena__nota-enlace', { 'text-anchor': 'middle' }),
    text(pair, CL[0], 148, 'Cl · 7 electrones de valencia', 'escena__nota-enlace', { 'text-anchor': 'middle' })
  ];
  const labelsAfter = [
    text(pair, NA[0], 148, 'Na⁺ · perdió 1 e⁻', 'escena__nota-enlace', { 'text-anchor': 'middle', opacity: 0 }),
    text(pair, CL[0], 148, 'Cl⁻ · ganó 1 e⁻: ya tiene 8', 'escena__nota-enlace', { 'text-anchor': 'middle', opacity: 0 })
  ];
  const attract = text(pair, 180, 30, 'cargas opuestas: se atraen', 'escena__nota-enlace escena__nota-enlace--acento', { 'text-anchor': 'middle', opacity: 0 });

  // Cristal: iones alternados en una red.
  const crystal = make('g', { opacity: 0 }, scene);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const isNa = (row + col) % 2 === 0;
      const x = 84 + col * 32, y = 34 + row * 30;
      make('circle', { cx: x, cy: y, r: isNa ? 8 : 13, class: isNa ? 'escena__nucleo-ion es-cation' : 'escena__anion' }, crystal);
      text(crystal, x, y + 3, isNa ? '+' : '−', isNa ? 'escena__ion-signo' : 'escena__ion-signo escena__ion-signo--tinta', { 'text-anchor': 'middle' });
    }
  }
  text(crystal, 180, 160, 'Cristal de NaCl: iones Na⁺ y Cl⁻, no moléculas', 'escena__nota-enlace', { 'text-anchor': 'middle' });

  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : ciclo(time, T));
    const move = final ? 1 : smooth((time - 2) / 2);
    const grown = final ? 1 : smooth((time - 4.2) / .8);
    const rCl = capaCl(CRECE * grown);
    const endX = CL[0] + Math.cos(endAngle) * rCl, endY = CL[1] + Math.sin(endAngle) * rCl;
    // Arco de ida: el electrón sube y baja entre los dos átomos.
    const x = mix(start[0], endX, move), y = mix(start[1], endY, move) - Math.sin(move * Math.PI) * 34;
    traveler.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
    fade(traveler.firstChild, final ? 0 : 1 - smooth((time - 4.4) / .6));
    const ion = final ? 1 : smooth((time - 4.2) / .8);
    fade(naRing, 1 - ion);
    set(naCore, { r: mix(15, 12, ion) });
    naCore.classList.toggle('es-cation', ion > .5);
    naLabel.classList.toggle('escena__ion-simbolo--claro', ion > .5);
    fade(plus, ion);
    fade(minus, ion);
    labelsBefore.forEach(label => fade(label, 1 - ion));
    labelsAfter.forEach(label => fade(label, ion));
    // Se acercan por la atracción.
    const near = final ? 1 : smooth((time - 5.8) / 1.4);
    na.setAttribute('transform', `translate(${round(near * 18)} 0)`);
    plus.setAttribute('transform', `translate(${round(near * 18)} 0)`);
    labelsAfter[0].setAttribute('transform', `translate(${round(near * 18)} 0)`);
    cl.setAttribute('transform', `translate(${round(-near * 14)} 0)`);
    traveler.setAttribute('transform', `translate(${round(x - near * 14 * move)} ${round(y)})`);
    minus.setAttribute('transform', `translate(${round(-near * 14)} 0)`);
    labelsAfter[1].setAttribute('transform', `translate(${round(-near * 14)} 0)`);
    fade(attract, final ? 0 : ventana(time, 6, 9));
    // Cambio al cristal.
    const lattice = final ? 0 : smooth((time - 9.4) / 1);
    fade(pair, 1 - lattice);
    fade(crystal, lattice);
  }
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 3 · Covalente: compartir parejo o no ----------------
   Izquierda, Cl₂: dos átomos iguales comparten el par a la mitad (ΔEN = 0).
   Derecha, HCl: el cloro jala más el par y la nube se carga hacia él; quedan
   cargas parciales δ+ en el H y δ− en el Cl (ΔEN = 0.96). */
function covalente(svg) {
  const T = 12;
  const scene = make('g', {}, svg);
  const defs = make('defs', {}, svg);
  const grad = (id, cx) => {
    const g = make('radialGradient', { id, cx, cy: .5, r: .6 }, defs);
    make('stop', { offset: 0, class: 'escena__nube-centro' }, g);
    make('stop', { offset: 1, class: 'escena__nube-borde' }, g);
    return `url(#${id})`;
  };
  const uid = Math.random().toString(36).slice(2, 7);
  // Cl₂
  const left = make('g', {}, scene);
  make('ellipse', { cx: 90, cy: 76, rx: 58, ry: 30, fill: grad(`nubeCl2${uid}`, .5), class: 'escena__nube' }, left);
  text(left, 66, 82, 'Cl', 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  text(left, 114, 82, 'Cl', 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  const pairL = [make('circle', { cx: 90, cy: 72, r: 2.4, class: 'escena__electron' }, left), make('circle', { cx: 90, cy: 80, r: 2.4, class: 'escena__electron' }, left)];
  // Pares libres del cloro (tres en cada uno)
  [[66, -1], [114, 1]].forEach(([cx, side]) => {
    [[0, -16, 1, 0], [0, 16, 1, 0], [side * 17, 0, 0, 1]].forEach(([dx, dy, ox, oy]) => {
      [-1, 1].forEach(s => make('circle', { cx: cx + dx + ox * 3 * s, cy: 76 + dy + oy * 3 * s, r: 2, class: 'escena__electron escena__electron--libre' }, left));
    });
  });
  text(left, 90, 132, 'Cl₂ · ΔEN = 0', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  text(left, 90, 146, 'covalente no polar: comparten por igual', 'escena__nota-enlace', { 'text-anchor': 'middle' });
  // HCl
  const right = make('g', {}, scene);
  const cloud = make('ellipse', { cx: 268, cy: 76, rx: 56, ry: 30, fill: grad(`nubeHCl${uid}`, .5), class: 'escena__nube' }, right);
  const stopShift = defs.lastChild;
  text(right, 236, 82, 'H', 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  text(right, 286, 82, 'Cl', 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  [[0, -16, 1, 0], [0, 16, 1, 0], [17, 0, 0, 1]].forEach(([dx, dy, ox, oy]) => {
    [-1, 1].forEach(s => make('circle', { cx: 286 + dx + ox * 3 * s, cy: 76 + dy + oy * 3 * s, r: 2, class: 'escena__electron escena__electron--libre' }, right));
  });
  const pairR = [make('circle', { r: 2.4, class: 'escena__electron' }, right), make('circle', { r: 2.4, class: 'escena__electron' }, right)];
  const dPlus = text(right, 236, 50, 'δ+', 'escena__delta escena__delta--mas', { 'text-anchor': 'middle', opacity: 0 });
  const dMinus = text(right, 290, 46, 'δ−', 'escena__delta', { 'text-anchor': 'middle', opacity: 0 });
  text(right, 268, 132, 'HCl · ΔEN = 0.96', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  text(right, 268, 146, 'covalente polar: el Cl jala más el par', 'escena__nota-enlace', { 'text-anchor': 'middle' });

  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : ciclo(time, T));
    const wobble = final ? 0 : Math.sin(time * 2.4) * 1.2;
    set(pairL[0], { cx: 90 + wobble, cy: 72 });
    set(pairL[1], { cx: 90 - wobble, cy: 80 });
    // En el HCl el par se corre hacia el cloro y la nube lo sigue.
    const shift = final ? 1 : smooth((time - 1.5) / 2.5);
    const px = mix(261, 270, shift) + wobble * .6;
    set(pairR[0], { cx: px, cy: 72 });
    set(pairR[1], { cx: px - wobble * 1.2, cy: 80 });
    set(cloud, { cx: mix(261, 274, shift) });
    stopShift.setAttribute('cx', round(mix(.5, .64, shift)));
    fade(dPlus, final ? 1 : (time - 3.6) / .5);
    fade(dMinus, final ? 1 : (time - 3.6) / .5);
  }
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 4 · La escala de ΔEN ----------------
   Los compuestos del ejercicio caen, uno por uno, en su diferencia de
   electronegatividad (Pauling): de 0 a 0.4 covalente no polar, de 0.4 a 1.7
   covalente polar y más de 1.7 iónico, los límites de la fuente. */
export const COMPUESTOS_ESCALA = [
  ['Cl₂', 0], ['CH₄', .35], ['HBr', .76], ['NH₃', .84], ['AgCl', 1.23], ['KI', 1.84], ['NaCl', 2.23], ['KF', 3.16]
];
function escala(svg) {
  const T = 15, X0 = 24, X1 = 340, MAX = 3.4, Y = 112;
  const sx = v => X0 + (X1 - X0) * v / MAX;
  const scene = make('g', {}, svg);
  [[0, .4, 'no-polar', 'covalente'], [.4, 1.7, 'polar', 'covalente polar'], [1.7, MAX, 'ionico', 'iónico']].forEach(([a, b, kind, label]) => {
    make('rect', { x: round(sx(a)), y: Y - 8, width: round(sx(b) - sx(a)), height: 16, class: `escena__zona escena__zona--${kind}` }, scene);
    text(scene, round((sx(a) + sx(b)) / 2), Y + 30, label, 'escena__nota-enlace', { 'text-anchor': 'middle' });
  });
  text(scene, round(sx(.2)), Y + 42, 'no polar', 'escena__nota-enlace', { 'text-anchor': 'middle' });
  make('path', { d: `M${X0} ${Y}H${X1}`, class: 'escena__escala-linea' }, scene);
  [0, .4, 1.7, 3].forEach(v => {
    make('path', { d: `M${round(sx(v))} ${Y + 8}v5`, class: 'escena__escala-linea' }, scene);
    text(scene, round(sx(v)), Y + 20, String(v), 'escena__escala-numero', { 'text-anchor': 'middle' });
  });
  text(scene, X1, Y + 20, 'ΔEN', 'escena__escala-numero', { 'text-anchor': 'end' });
  // Letreros a tres alturas para que los vecinos no se encimen.
  const alturas = [28, 52, 76];
  const marks = COMPUESTOS_ESCALA.map(([name, value], i) => {
    const g = make('g', { opacity: 0 }, scene);
    const x = sx(value), yLabel = alturas[i % 3];
    make('path', { d: `M${round(x)} ${yLabel + 4}V${Y - 9}`, class: 'escena__escala-guia' }, g);
    make('circle', { cx: round(x), cy: Y, r: 3.4, class: 'escena__escala-punto' }, g);
    text(g, round(x), yLabel, `${name} ${value.toFixed(2)}`, 'escena__escala-compuesto', { 'text-anchor': 'middle' });
    return { g, at: 1 + i * .9 };
  });
  let t = 0;
  function draw(time, final) {
    fade(scene, final ? 1 : ciclo(time, T));
    marks.forEach(mark => {
      const a = final ? 1 : smooth((time - mark.at) / .45);
      fade(mark.g, a);
      mark.g.setAttribute('transform', `translate(0 ${round((1 - a) * -10)})`);
    });
  }
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 5 · Enlace metálico: un mar de electrones ----------------
   Los cationes del metal quedan fijos en su red; sus electrones de valencia
   no pertenecen a ninguno y se mueven por todo el metal. Por eso conduce la
   electricidad y se deja doblar sin romperse. */
function metalico(svg) {
  const scene = make('g', {}, svg);
  const rand = random(12);
  const cations = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const x = 60 + col * 40 + (row % 2) * 20, y = 40 + row * 38;
      make('circle', { cx: x, cy: y, r: 11, class: 'escena__nucleo-ion es-cation' }, scene);
      text(scene, x, y + 3.5, '+', 'escena__ion-signo', { 'text-anchor': 'middle' });
      cations.push([x, y]);
    }
  }
  const electrons = Array.from({ length: 26 }, () => {
    const node = make('circle', { r: 2.5, class: 'escena__electron' }, scene);
    return { node, x: 40 + rand() * 300, y: 22 + rand() * 112, a: rand() * TAU, v: 14 + rand() * 12 };
  });
  function draw() {
    electrons.forEach(e => set(e.node, { cx: e.x, cy: e.y }));
  }
  draw();
  return {
    update(dt) {
      electrons.forEach(e => {
        e.a += (rand() - .5) * 3 * dt * 6;
        e.x += Math.cos(e.a) * e.v * dt;
        e.y += Math.sin(e.a) * e.v * dt;
        if (e.x < 36 || e.x > 344) { e.a = Math.PI - e.a; e.x = clamp(e.x, 36, 344); }
        if (e.y < 18 || e.y > 138) { e.a = -e.a; e.y = clamp(e.y, 18, 138); }
      });
      draw();
    },
    still() { draw(); }
  };
}

/* ---------------- 6 · Puentes de hidrógeno en el agua ----------------
   Cinco moléculas de agua. El H de una molécula, con carga parcial δ+, es
   atraído por un par libre del O de otra, con carga δ−: esa atracción entre
   moléculas es el puente de hidrógeno (línea punteada). Sólo se forma cuando
   el H está unido a F, O o N. */
function puentes(svg) {
  const scene = make('g', {}, svg);
  const lines = make('g', {}, scene);
  const BOND = 20.5, HALF = 104.5 / 2, OO = 64;  // O···O ≈ 2.9 veces O–H, como en el agua (2.8 Å y 0.96 Å)
  // A, al centro, le da sus dos H a B y a C; D y E le dan un H cada uno a A.
  // El giro de cada molécula hace que su H donador apunte justo al O vecino.
  // A en el centro; B y C en la dirección de sus H; D y E arriba, hacia sus pares libres.
  const desde = (x, y, grados) => [x + Math.cos(grados * Math.PI / 180) * OO, y + Math.sin(grados * Math.PI / 180) * OO];
  const POS = { A: [180, 88] };
  POS.B = desde(...POS.A, 90 + HALF);
  POS.C = desde(...POS.A, 90 - HALF);
  POS.D = desde(...POS.A, -138);
  POS.E = desde(...POS.A, -42);
  const hacia = (from, to) => Math.atan2(POS[to][1] - POS[from][1], POS[to][0] - POS[from][0]) * 180 / Math.PI;
  const GIROS = { A: 90, B: 150, C: 30, D: hacia('D', 'A') + HALF, E: hacia('E', 'A') - HALF };
  const mols = {};
  Object.entries(POS).forEach(([name, [x, y]], i) => {
    const g = make('g', {}, scene);
    const rot = GIROS[name];
    const hs = [-1, 1].map(sgn => {
      const a = (rot + sgn * HALF) * Math.PI / 180;
      return [Math.cos(a) * BOND, Math.sin(a) * BOND];
    });
    hs.forEach(([hx, hy]) => make('path', { d: `M0 0L${round(hx)} ${round(hy)}`, class: 'escena__enlace-agua' }, g));
    make('circle', { r: 13.5, class: 'escena__oxigeno' }, g);
    text(g, 0, 4.2, 'O', 'escena__simbolo-chico escena__simbolo-chico--o', { 'text-anchor': 'middle' });
    hs.forEach(([hx, hy]) => {
      make('circle', { cx: round(hx), cy: round(hy), r: 8, class: 'escena__hidrogeno' }, g);
      text(g, round(hx), round(hy) + 3, 'H', 'escena__simbolo-chico escena__simbolo-chico--h', { 'text-anchor': 'middle' });
    });
    mols[name] = { g, x, y, hs, phase: i * 1.3 };
  });
  // [donador, índice del H, aceptor]
  const PAIRS = [['A', 0, 'C'], ['A', 1, 'B'], ['D', 0, 'A'], ['E', 1, 'A']];
  const bridges = PAIRS.map(() => make('path', { class: 'escena__puente' }, lines));
  const dPlus = text(scene, 0, 0, 'δ+', 'escena__delta escena__delta--mas', { 'text-anchor': 'middle' });
  const dMinus = text(scene, 0, 0, 'δ−', 'escena__delta', { 'text-anchor': 'middle' });

  let t = 0;
  function pose(time) {
    Object.values(mols).forEach(m => {
      m.dx = Math.sin(time * 1.1 + m.phase) * 2;
      m.dy = Math.cos(time * .9 + m.phase) * 2;
      m.g.setAttribute('transform', `translate(${round(m.x + m.dx)} ${round(m.y + m.dy)})`);
    });
    PAIRS.forEach(([from, h, to], i) => {
      const m = mols[from], target = mols[to];
      const x = m.x + m.dx + m.hs[h][0], y = m.y + m.dy + m.hs[h][1];
      const tx = target.x + target.dx, ty = target.y + target.dy;
      const ang = Math.atan2(ty - y, tx - x);
      bridges[i].setAttribute('d', `M${round(x + Math.cos(ang) * 9)} ${round(y + Math.sin(ang) * 9)}L${round(tx - Math.cos(ang) * 14.5)} ${round(ty - Math.sin(ang) * 14.5)}`);
      if (i === 0) {
        set(dPlus, { x: x + 14, y: y - 7 });
        set(dMinus, { x: tx - 25, y: ty + 5 });
      }
    });
  }
  pose(0);
  return {
    update(dt) { t += dt; pose(t); },
    still() { pose(0); }
  };
}

/* ---------------- 7 · Enlace simple, doble y triple (fija) ----------------
   Fórmulas estructurales: cada guion es un par de electrones compartido. */
function multiples(svg) {
  const g = make('g', {}, svg);
  const atom = (x, y, s) => text(g, x, y + 5, s, 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  const bond = (x1, y1, x2, y2, n) => {
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    for (let k = 0; k < n; k += 1) {
      const off = (k - (n - 1) / 2) * 4.2;
      make('path', { d: `M${round(x1 + ux * 9 - uy * off)} ${round(y1 + uy * 9 + ux * off)}L${round(x2 - ux * 9 - uy * off)} ${round(y2 - uy * 9 + ux * off)}`, class: 'escena__enlace-linea' }, g);
    }
  };
  // CH₄ · simple
  atom(60, 70, 'C'); [[60, 36], [94, 70], [60, 104], [26, 70]].forEach(([x, y]) => { atom(x, y, 'H'); bond(60, 70, x, y, 1); });
  text(g, 60, 132, 'CH₄ · simple', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  // C₂H₄ · doble
  atom(158, 70, 'C'); atom(196, 70, 'C'); bond(158, 70, 196, 70, 2);
  [[134, 48], [134, 92]].forEach(([x, y]) => { atom(x, y, 'H'); bond(158, 70, x, y, 1); });
  [[220, 48], [220, 92]].forEach(([x, y]) => { atom(x, y, 'H'); bond(196, 70, x, y, 1); });
  text(g, 177, 132, 'C₂H₄ · doble', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  // C₂H₂ · triple
  atom(262, 70, 'H'); atom(290, 70, 'C'); atom(322, 70, 'C'); atom(350, 70, 'H');
  bond(262, 70, 290, 70, 1); bond(290, 70, 322, 70, 3); bond(322, 70, 350, 70, 1);
  text(g, 306, 132, 'C₂H₂ · triple', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  return { update() {}, still() {} };
}

/* ---------------- 8 · Estructuras de Lewis de la fuente (fija) ----------------
   H₂O y CH₄ comparten pares (dos puntos entre los átomos). El NaCl va
   corregido: no comparte un par, el sodio le cede su electrón al cloro, así
   que se escribe Na⁺ y el cloro entre corchetes con sus 8 electrones y carga −. */
function estructuras(svg) {
  const g = make('g', {}, svg);
  const atom = (x, y, s) => text(g, x, y + 6, s, 'escena__lewis-simbolo', { 'text-anchor': 'middle' });
  const dot = (x, y) => make('circle', { cx: round(x), cy: round(y), r: 1.9, class: 'escena__electron' }, g);
  const par = (x, y, vertical) => [-1, 1].forEach(k => dot(x + (vertical ? 0 : k * 2.6), y + (vertical ? k * 2.6 : 0)));
  // H₂O: H:O:H con dos pares libres en el oxígeno
  atom(34, 60, 'H'); atom(70, 60, 'O'); atom(106, 60, 'H');
  par(52, 60, true); par(88, 60, true); par(70, 45, false); par(70, 75, false);
  text(g, 70, 128, 'H₂O · comparte 2 pares', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  // NaCl: iones
  atom(150, 60, 'Na'); text(g, 164, 48, '+', 'escena__carga escena__carga--mas escena__carga--chica');
  make('path', { d: 'M182 38h-5v44h5', class: 'escena__corchete-lewis' }, g);
  atom(200, 60, 'Cl'); par(200, 45, false); par(200, 75, false); par(186, 60, true); par(214, 60, true);
  make('path', { d: 'M218 38h5v44h-5', class: 'escena__corchete-lewis' }, g);
  text(g, 228, 44, '−', 'escena__carga escena__carga--chica');
  text(g, 190, 128, 'NaCl · iones: no comparte', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  // CH₄: un par compartido con cada H
  atom(300, 60, 'C'); atom(300, 26, 'H'); atom(300, 94, 'H'); atom(266, 60, 'H'); atom(334, 60, 'H');
  par(300, 43, false); par(300, 77, false); par(283, 60, true); par(317, 60, true);
  text(g, 300, 128, 'CH₄ · comparte 4 pares', 'escena__nota-enlace escena__nota-enlace--fuerte', { 'text-anchor': 'middle' });
  return { update() {}, still() {} };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { lewis, ionico, covalente, escala, metalico, puentes, multiples, estructuras };
const scenes = [...document.querySelectorAll('[data-escena-enlace]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaEnlace](svg)
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
