/* Escenas de «Gráficas I: leer pendiente, corte y área». Mismo contrato que las demás escenas
   de Tercial: cada escena es { update(dt), still() }; el reloj compartido sólo avanza las
   escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final. Al llegar a la
   tele (tercial:diapositiva), con «Repetir» o al elegir otro caso, la escena vuelve a empezar.
   Este módulo sólo atiende sus propias escenas (data-escena-fisica="pendiente" o "area").

   El auto se ve desde arriba, como en un mapa: 4.0 m de largo y 1.8 m de ancho, con los ejes
   del auto de la semana 1 (a 1.25 m y a 1.3 m del centro) y llantas de 0.62 m. Sus colores son
   los del auto de la semana 1 (fisica.css). Todo lo que se dibuja sale de la escala de la
   escena; las comprobaciones de abajo detienen la carga si un caso se sale de su pista. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const num = n => { const r = Math.round(n * 100) / 100; return r < 0 ? MENOS + -r : String(r === 0 ? 0 : r); };
const sig = n => (n > 0 ? '+' + num(n) : num(n));
const decimal = n => (n < -0.005 ? MENOS : '') + Math.abs(n).toFixed(1);
const NBSP = ' ';

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

// Un texto con partes: [['t = ', null], ['4 s', 'clase']…]
function texto(node, partes) {
  node.textContent = '';
  for (const [t, clase] of partes) {
    const s = make('tspan', clase ? { class: clase } : {}, node);
    s.textContent = t;
  }
}

/* ---------- El auto visto desde arriba ----------
   Coordenadas del auto en metros: u hacia el frente, w hacia un costado. Se dibuja una vez y se
   mueve con transform: translate(centro) rotate(hacia dónde mira) scale(pixeles por metro). */
const LARGO = 4.0, ANCHO = 1.8, EJES = [1.25, -1.3], LLANTA = 0.62;
function dibujaAuto(capa, clase) {
  const g = make('g', { class: clase }, capa);
  // Llantas primero: la carrocería tapa su mitad de adentro y asoman 0.1 m por fuera.
  EJES.forEach(u => [-1, 1].forEach(lado => {
    make('rect', { x: u - LLANTA / 2, y: lado > 0 ? 0.8 : -1.0, width: LLANTA, height: 0.2, rx: 0.06, class: 'auto__llanta' }, g);
  }));
  // Espejos laterales, a la altura del parabrisas.
  [-1, 1].forEach(lado => make('rect', { x: 0.47, y: lado > 0 ? 0.88 : -1.06, width: 0.18, height: 0.18, rx: 0.04, class: 'auto__carroceria' }, g));
  make('path', { class: 'auto__carroceria', d: 'M-1.72 -0.9L1.5 -0.9Q2 -0.88 2 -0.45L2 0.45Q2 0.88 1.5 0.9L-1.72 0.9Q-2 0.9 -2 0.6L-2 -0.6Q-2 -0.9 -1.72 -0.9Z' }, g);
  // Parabrisas (más ancho abajo, junto al cofre), medallón atrás.
  make('path', { class: 'auto__vidrio', d: 'M0.95 -0.72L0.95 0.72L0.4 0.62L0.4 -0.62Z' }, g);
  make('path', { class: 'auto__vidrio', d: 'M-0.95 -0.62L-0.95 0.62L-1.35 0.68L-1.35 -0.68Z' }, g);
  [-1, 1].forEach(lado => {
    make('rect', { x: 1.84, y: lado > 0 ? 0.5 : -0.78, width: 0.13, height: 0.28, class: 'auto__faro' }, g);
    make('rect', { x: -1.98, y: lado > 0 ? 0.52 : -0.8, width: 0.1, height: 0.28, class: 'auto__calavera' }, g);
  });
  return g;
}
function ponAuto(g, x, y, grados, escala) {
  set(g, { transform: `translate(${r2(x)} ${r2(y)}) rotate(${grados}) scale(${escala})` });
}

/* ---------- Reloj de una escena: tramos con principio y fin ---------- */
function avance(tramos, nombre, t) {
  const tr = tramos[nombre];
  if (!tr) return 0;
  return clamp((t - tr[0]) / (tr[1] - tr[0]));
}

/* =====================================================================
   1 · La pendiente es la velocidad (gráfica x–t)
   La pista está de pie, a la izquierda: el eje vertical de la gráfica ES la pista, con la misma
   escala (10 px por metro), así que el auto y el punto de la gráfica siempre quedan a la misma
   altura; lo que corre hacia la derecha es el tiempo (86 px por segundo). Al terminar aparece
   el triángulo de la pendiente: Δt abajo (o arriba), Δx en el costado y v = Δx ÷ Δt.
   ===================================================================== */
const PENDIENTE = {
  sube: { x0: 4, v: 3 },
  baja: { x0: 18, v: -4 },
  quieto: { x0: 10, v: 0 }
};
const P = { S: 10, Y0: 254, AX: 74, PS: 84, T: 4, XMAX: 20, CARRIL: [32, 66] };
const yP = x => P.Y0 - x * P.S;
const xP = t => P.AX + t * P.PS;
const CENTRO_P = (P.CARRIL[0] + P.CARRIL[1]) / 2;

for (const [clave, c] of Object.entries(PENDIENTE)) {
  const fin = c.x0 + c.v * P.T;
  // El auto (4 m) cabe completo en la pista, que va de −0.8 m a 20.8 m.
  if (Math.min(c.x0, fin) - LARGO / 2 < -0.8 || Math.max(c.x0, fin) + LARGO / 2 > P.XMAX + 0.8) throw new Error(`pendiente: ${clave} se sale de la pista`);
  // El punto final y el inicial caen en renglones de la cuadrícula (cada 2 m).
  if (c.x0 % 2 || fin % 2) throw new Error(`pendiente: ${clave} no cae en la cuadrícula`);
}

function lineaPendiente(c) {
  const mov = 1.5;
  const tramos = { corte: [0.3, 0.9], mov: [mov, mov + P.T], dt: [mov + P.T + 0.5, mov + P.T + 1.2], dtTexto: [mov + P.T + 1.0, mov + P.T + 1.5] };
  const d = mov + P.T + 1.6;
  tramos.dx = [d, d + 0.7]; tramos.dxTexto = [d + 0.5, d + 1.0];
  tramos.formula = [d + 1.4, d + 2.0];
  return { tramos, fin: d + 2.3 };
}

function pendiente(svg) {
  const root = svg.closest('.leccion-escena');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-caso-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  // Fondo: la pista con su regla a la izquierda y la cuadrícula de la gráfica a la derecha.
  const fondo = make('g', {}, svg);
  make('rect', { x: P.CARRIL[0], y: yP(P.XMAX + 0.8), width: P.CARRIL[1] - P.CARRIL[0], height: yP(-0.8) - yP(P.XMAX + 0.8), class: 'gl-pista' }, fondo);
  let rayas = '', rejilla = '', marcas = '';
  for (let x = 0; x <= P.XMAX; x += 1) {
    const y = yP(x);
    marcas += `M${x % 2 ? 29 : 26} ${y}H${P.CARRIL[0]}`;
    if (x % 2 === 0) {
      rayas += `M${P.CARRIL[0]} ${y}H${P.CARRIL[1]}`;
      if (x > 0) rejilla += `M${P.AX} ${y}H${xP(P.T)}`;
    }
    if (x % 4 === 0) {
      const n = make('text', { x: 23, y: y + 3.8, class: 'gl-num', 'text-anchor': 'end' }, fondo);
      n.textContent = x;
    }
  }
  for (let t = 1; t <= P.T; t++) rejilla += `M${xP(t)} ${yP(0)}V${yP(P.XMAX)}`;
  make('path', { d: rayas, class: 'gl-pista__raya' }, fondo);
  make('path', { d: `M${P.CARRIL[0]} ${yP(P.XMAX + 0.8)}V${yP(-0.8)}M${P.CARRIL[1]} ${yP(P.XMAX + 0.8)}V${yP(-0.8)}`, class: 'gl-pista__borde' }, fondo);
  make('path', { d: marcas, class: 'gl-regla' }, fondo);
  make('path', { d: rejilla, class: 'gl-rejilla' }, fondo);
  make('path', { d: `M${P.AX} ${yP(0)}V${yP(P.XMAX) - 8}M${P.AX} ${yP(0)}H${xP(P.T) + 18}`, class: 'gl-eje' }, fondo);
  make('path', { d: `M${P.AX} ${yP(P.XMAX) - 14}l-4 8h8z M${xP(P.T) + 24} ${yP(0)}l-8 -4v8z`, class: 'gl-punta' }, fondo);
  for (let t = 0; t <= P.T; t++) {
    const n = make('text', { x: xP(t), y: yP(0) + 18, class: 'gl-num', 'text-anchor': 'middle' }, fondo);
    n.textContent = t;
  }
  const tituloX = make('text', { x: 2, y: yP(P.XMAX) - 8, class: 'gl-titulo' }, fondo);
  tituloX.textContent = 'x (m)';
  const tituloT = make('text', { x: 458, y: yP(0) + 18, class: 'gl-titulo', 'text-anchor': 'end' }, fondo);
  tituloT.textContent = 't (s)';

  // Capas que cambian.
  const triangulo = make('path', { class: 'gl-triangulo' }, svg);
  const catetoT = make('path', { class: 'gl-cateto' }, svg);
  const catetoX = make('path', { class: 'gl-cateto' }, svg);
  const guia = make('path', { class: 'gl-guia' }, svg);
  const traza = make('path', { class: 'gl-traza' }, svg);
  const puntos = make('g', {}, svg);
  const corte = make('path', { class: 'gl-corte' }, svg);
  const auto = dibujaAuto(svg, 'auto');
  const ahora = make('circle', { r: 4.5, class: 'gl-punto gl-punto--ahora' }, svg);
  const etiquetaCorte = make('text', { class: 'gl-etiqueta' }, svg);
  const etiquetaT = make('text', { class: 'gl-etiqueta', 'text-anchor': 'middle' }, svg);
  const etiquetaX = make('text', { class: 'gl-etiqueta', 'text-anchor': 'end' }, svg);
  const formula1 = make('text', { class: 'gl-formula' }, svg);
  const formula2 = make('text', { class: 'gl-formula' }, svg);
  const lectura = make('text', { x: 92, y: 30, class: 'gl-lectura' }, svg);
  const lecturaT = make('tspan', {}, lectura);
  const lecturaX = make('tspan', { dx: 26 }, lectura);

  let clave = null, c = null, linea = null, t = 0;

  function armar(nueva) {
    clave = nueva;
    c = PENDIENTE[clave];
    linea = lineaPendiente(c);
    puntos.textContent = '';
    for (let s = 0; s <= P.T; s++) make('circle', { cx: xP(s), cy: yP(c.x0 + c.v * s), r: 3, class: 'gl-punto' }, puntos);
    const xf = c.x0 + c.v * P.T, dx = xf - c.x0;
    // Dónde va cada letrero: siempre del lado vacío de la recta (verificado con la escala).
    const sube = c.v > 0, quieto = c.v === 0;
    set(etiquetaCorte, sube ? { x: 80, y: yP(c.x0) + 22 } : quieto ? { x: 80, y: yP(c.x0) + 20 } : { x: 80, y: yP(c.x0) - 10 });
    etiquetaCorte.textContent = 'x₀ = ' + num(c.x0) + NBSP + 'm';
    set(etiquetaT, { x: xP(P.T / 2), y: quieto ? yP(c.x0) + 20 : sube ? yP(c.x0) - 8 : yP(c.x0) + 18 });
    etiquetaT.textContent = 'Δt = ' + P.T + NBSP + 's';
    set(etiquetaX, quieto ? { x: xP(P.T), y: yP(c.x0) - 10 } : { x: xP(P.T) - 7, y: yP((c.x0 + xf) / 2) + 4 });
    etiquetaX.textContent = 'Δx = ' + (quieto ? '0' : sig(dx)) + NBSP + 'm';
    // Al final, la guía queda a la altura del auto: la cuenta va lejos de ella y de la recta.
    const yF = sube ? 120 : quieto ? 104 : 192;
    set(formula1, { x: 90, y: yF });
    set(formula2, { x: 90, y: yF + 21 });
    texto(formula1, [['v = Δx ÷ Δt', null]]);
    texto(formula2, [['= ' + (quieto ? '0' : sig(dx)) + NBSP + 'm ÷ ' + P.T + NBSP + 's = ', null], [sig(c.v) + NBSP + 'm/s', 'gl-formula__resultado']]);
    set(triangulo, { d: quieto ? 'M0 0' : `M${xP(0)} ${yP(c.x0)}H${xP(P.T)}V${yP(xf)}Z` });
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    const { tramos } = linea;
    const tv = P.T * avance(tramos, 'mov', tiempo);          // el tiempo del movimiento
    const x = c.x0 + c.v * tv, y = yP(x), xf = c.x0 + c.v * P.T;
    ponAuto(auto, CENTRO_P, y, c.v < 0 ? 90 : -90, P.S);
    set(traza, { d: `M${xP(0)} ${yP(c.x0)}L${r2(xP(tv))} ${r2(y)}` });
    set(ahora, { cx: xP(tv), cy: y });
    [...puntos.children].forEach((p, s) => { p.style.display = tv >= s - 1e-6 ? '' : 'none'; });
    // La guía va del costado del auto al punto de la gráfica (en reposo, sólo hasta el eje: la
    // recta ya va a esa altura).
    const desde = CENTRO_P + ANCHO / 2 * P.S + 1.5;
    const hasta = c.v === 0 ? P.AX - 3 : Math.max(P.AX - 3, xP(tv) - 7);
    set(guia, { d: `M${r2(desde)} ${r2(y)}H${r2(hasta)}` });
    const aCorte = suave(avance(tramos, 'corte', tiempo));
    set(corte, { d: `M${P.AX - 5} ${yP(c.x0)}H${P.AX + 5}`, opacity: aCorte });
    set(etiquetaCorte, { opacity: aCorte });
    lecturaT.textContent = 't = ' + decimal(tv) + NBSP + 's';
    lecturaX.textContent = 'x = ' + decimal(x) + NBSP + 'm';
    // El triángulo: primero Δt, luego Δx, y al final la cuenta.
    const gT = suave(avance(tramos, 'dt', tiempo)), gX = suave(avance(tramos, 'dx', tiempo));
    set(catetoT, { d: gT > 0 ? `M${xP(0)} ${yP(c.x0)}H${r2(xP(P.T * gT))}` : 'M0 0' });
    set(catetoX, { d: gX > 0 && c.v !== 0 ? `M${xP(P.T)} ${yP(c.x0)}V${r2(yP(c.x0 + (xf - c.x0) * gX))}` : 'M0 0' });
    set(triangulo, { opacity: gX });
    set(etiquetaT, { opacity: suave(avance(tramos, 'dtTexto', tiempo)) });
    set(etiquetaX, { opacity: suave(avance(tramos, 'dxTexto', tiempo)) });
    const f = suave(avance(tramos, 'formula', tiempo));
    set(formula1, { opacity: f });
    set(formula2, { opacity: f });
  }

  function elige(nueva, animar) {
    if (!PENDIENTE[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'sube', true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(Math.min(t, linea.fin)); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* =====================================================================
   2 · El área es el desplazamiento (gráfica v–t)
   Arriba, la pista acostada (16 px por metro) con su regla; abajo, la gráfica v–t (88 px por
   segundo, 10 px por m/s, de −6 a 9 m/s, la misma escala en los tres casos). Mientras el auto
   avanza, el área bajo la recta se va sombreando y, arriba, la flecha marca el desplazamiento:
   las dos lecturas dan siempre el mismo número. Al final, la cuenta del área; al que acelera
   se le marca además el triángulo de la pendiente (es el mismo triángulo).
   ===================================================================== */
const AREA = {
  constante: { x0: 2, v0: 5, a: 0, T: 4 },
  arranca: { x0: 2, v0: 0, a: 2, T: 4 },
  negativa: { x0: 20, v0: -5, a: 0, T: 3 }
};
const A = { S: 16, X0: 30, XMAX: 24, CARRIL: [30, 74], REGLA: 84, AX: 60, TS: 88, VS: 10, V0: 220, VMIN: -6, VMAX: 9, TMAX: 4 };
const xA = x => A.X0 + x * A.S;
const tA = t => A.AX + t * A.TS;
const vA = v => A.V0 - v * A.VS;
const posicion = (c, t) => c.x0 + c.v0 * t + c.a * t * t / 2;
const velocidad = (c, t) => c.v0 + c.a * t;

for (const [clave, c] of Object.entries(AREA)) {
  const fin = posicion(c, c.T);
  if (Math.min(c.x0, fin) - LARGO / 2 < -0.7 || Math.max(c.x0, fin) + LARGO / 2 > A.XMAX + 0.7) throw new Error(`area: ${clave} se sale de la pista`);
  const vf = velocidad(c, c.T);
  if (Math.min(c.v0, vf) < A.VMIN || Math.max(c.v0, vf) > A.VMAX || c.T > A.TMAX) throw new Error(`area: ${clave} se sale de la gráfica`);
  // El área de la gráfica (trapecio) es lo que avanzó en la pista.
  if (Math.abs((c.v0 + vf) / 2 * c.T - (fin - c.x0)) > 1e-9) throw new Error(`area: ${clave} el área no es el desplazamiento`);
}

function lineaArea(c) {
  const mov = 0.8;
  const f = mov + c.T;
  const tramos = { mov: [mov, f], formula: [f + 0.5, f + 1.1], extra: [f + 1.6, f + 2.2] };
  if (c.a !== 0) Object.assign(tramos, { dt: [f + 1.6, f + 2.2], dv: [f + 2.4, f + 3.0], pendiente: [f + 3.4, f + 4.0] });
  return { tramos, fin: c.a !== 0 ? f + 4.3 : f + 2.5 };
}

function area(svg) {
  const root = svg.closest('.leccion-escena');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-caso-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const fondo = make('g', {}, svg);
  // La pista y su regla.
  make('rect', { x: xA(-0.7), y: A.CARRIL[0], width: xA(A.XMAX + 0.7) - xA(-0.7), height: A.CARRIL[1] - A.CARRIL[0], class: 'gl-pista' }, fondo);
  make('path', { d: `M${xA(-0.7)} ${A.CARRIL[0]}H${xA(A.XMAX + 0.7)}M${xA(-0.7)} ${A.CARRIL[1]}H${xA(A.XMAX + 0.7)}`, class: 'gl-pista__borde' }, fondo);
  let marcas = '';
  for (let x = 0; x <= A.XMAX; x++) {
    marcas += `M${xA(x)} ${A.REGLA}V${A.REGLA + (x % 5 ? 3 : 6)}`;
    if (x % 5 === 0) {
      const n = make('text', { x: xA(x), y: A.REGLA + 17, class: 'gl-num', 'text-anchor': 'middle' }, fondo);
      n.textContent = x;
    }
  }
  make('path', { d: `M${xA(0)} ${A.REGLA}H${xA(A.XMAX) + 10}` + marcas, class: 'gl-regla' }, fondo);
  make('path', { d: `M${xA(A.XMAX) + 16} ${A.REGLA}l-7 -3.5v7z`, class: 'gl-punta' }, fondo);
  const tituloX = make('text', { x: 458, y: A.REGLA + 17, class: 'gl-titulo', 'text-anchor': 'end' }, fondo);
  tituloX.textContent = 'x (m)';
  // La gráfica v–t.
  let rejilla = '';
  for (let v = A.VMIN; v <= A.VMAX; v++) if (v !== 0) rejilla += `M${A.AX} ${vA(v)}H${tA(A.TMAX)}`;
  for (let t = 1; t <= A.TMAX; t++) rejilla += `M${tA(t)} ${vA(A.VMAX)}V${vA(A.VMIN)}`;
  make('path', { d: rejilla, class: 'gl-rejilla' }, fondo);
  const sombra = make('path', { class: 'gl-area' }, fondo);
  make('path', { d: `M${A.AX} ${vA(A.VMIN)}V${vA(A.VMAX) - 8}M${A.AX} ${A.V0}H${tA(A.TMAX) + 16}`, class: 'gl-eje' }, fondo);
  make('path', { d: `M${A.AX} ${vA(A.VMAX) - 14}l-4 8h8z M${tA(A.TMAX) + 22} ${A.V0}l-8 -4v8z`, class: 'gl-punta' }, fondo);
  for (let v = A.VMIN; v <= A.VMAX; v++) {
    if (v % 2) continue;
    const n = make('text', { x: A.AX - 7, y: vA(v) + 3.8, class: 'gl-num', 'text-anchor': 'end' }, fondo);
    n.textContent = num(v);
  }
  for (let t = 0; t <= A.TMAX; t++) {
    const n = make('text', { x: tA(t), y: vA(A.VMIN) + 17, class: 'gl-num', 'text-anchor': 'middle' }, fondo);
    n.textContent = t;
  }
  const tituloV = make('text', { x: A.AX + 9, y: vA(A.VMAX) - 9, class: 'gl-titulo' }, fondo);
  tituloV.textContent = 'v (m/s)';
  const tituloT = make('text', { x: 458, y: vA(A.VMIN) + 17, class: 'gl-titulo', 'text-anchor': 'end' }, fondo);
  tituloT.textContent = 't (s)';

  const catetoT = make('path', { class: 'gl-cateto' }, svg);
  const catetoV = make('path', { class: 'gl-cateto' }, svg);
  const traza = make('path', { class: 'gl-traza' }, svg);
  const ahora = make('circle', { r: 4.5, class: 'gl-punto gl-punto--ahora' }, svg);
  const auto = dibujaAuto(svg, 'auto');
  const flecha = make('path', { class: 'gl-flecha' }, svg);
  const flechaPunta = make('path', { class: 'gl-flecha-punta' }, svg);
  const flechaInicio = make('path', { class: 'gl-flecha' }, svg);
  const flechaTexto = make('text', { y: 12, class: 'gl-etiqueta', 'text-anchor': 'middle' }, svg);
  const cuenta = make('text', { class: 'gl-formula', 'text-anchor': 'middle' }, svg);
  const extra = make('text', { class: 'gl-etiqueta', 'text-anchor': 'end' }, svg);
  const etiquetaT = make('text', { class: 'gl-etiqueta', 'text-anchor': 'middle' }, svg);
  const etiquetaV = make('text', { class: 'gl-etiqueta', 'text-anchor': 'end' }, svg);
  const pendienteTexto = make('text', { class: 'gl-formula' }, svg);
  const lectura = make('text', { x: 456, y: vA(A.VMAX) - 9, class: 'gl-lectura gl-lectura--chica', 'text-anchor': 'end' }, svg);
  const lecturaT = make('tspan', {}, lectura);
  const lecturaA = make('tspan', { dx: 22 }, lectura);

  let clave = null, c = null, linea = null, t = 0;

  function armar(nueva) {
    clave = nueva;
    c = AREA[clave];
    linea = lineaArea(c);
    const vf = velocidad(c, c.T), A_ = (c.v0 + vf) / 2 * c.T;
    // La cuenta del área, dentro de su figura (posiciones comprobadas con la escala).
    if (c.a === 0) {
      set(cuenta, { x: tA(c.T / 2), y: vA(c.v0 / 2) + 5 });
      texto(cuenta, [[num(c.v0) + NBSP + 'm/s × ' + c.T + NBSP + 's = ', null], [num(A_) + NBSP + 'm', 'gl-formula__resultado']]);
    } else {
      set(cuenta, { x: tA(c.T * 0.62), y: vA(1) + 2 });
      texto(cuenta, [[c.T + NBSP + 's × ' + num(vf) + NBSP + 'm/s ÷ 2 = ', null], [num(A_) + NBSP + 'm', 'gl-formula__resultado']]);
    }
    // Lo que dice la pendiente.
    extra.textContent = c.a === 0 && c.v0 > 0 ? 'recta horizontal: a = 0' : '';
    set(extra, { x: tA(c.T), y: vA(c.v0) - 9 });
    set(etiquetaT, { x: tA(c.T / 2), y: A.V0 + 18 });
    etiquetaT.textContent = c.a ? 'Δt = ' + c.T + NBSP + 's' : '';
    set(etiquetaV, { x: tA(c.T) - 8, y: vA(vf * 0.68) + 4 });
    etiquetaV.textContent = c.a ? 'Δv = ' + sig(vf - c.v0) + NBSP + 'm/s' : '';
    set(pendienteTexto, { x: 78, y: vA(6.6) });
    if (c.a) texto(pendienteTexto, [['a = Δv ÷ Δt = ' + num(vf - c.v0) + ' ÷ ' + c.T + ' = ', null], [sig(c.a) + NBSP + 'm/s²', 'gl-formula__resultado']]);
    else pendienteTexto.textContent = '';
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    const { tramos } = linea;
    const tv = c.T * avance(tramos, 'mov', tiempo);
    const x = posicion(c, tv), v = velocidad(c, tv);
    // Hacia dónde mira: hacia donde va (el que arranca, hacia donde acelera).
    const mira = (c.v0 !== 0 ? c.v0 : c.a) < 0 ? 180 : 0;
    ponAuto(auto, xA(x), (A.CARRIL[0] + A.CARRIL[1]) / 2, mira, A.S);
    // La gráfica hasta el instante actual: la recta y el área entre ella y el eje.
    set(traza, { d: `M${tA(0)} ${vA(c.v0)}L${r2(tA(tv))} ${r2(vA(v))}` });
    set(ahora, { cx: tA(tv), cy: vA(v) });
    set(sombra, { d: tv > 0 ? `M${tA(0)} ${A.V0}V${vA(c.v0)}L${r2(tA(tv))} ${r2(vA(v))}V${A.V0}Z` : 'M0 0' });
    // La flecha del desplazamiento, sobre la pista.
    const dx = x - c.x0, x1 = xA(c.x0), x2 = xA(x), s = Math.sign(dx);
    set(flechaInicio, { d: `M${x1} 13V23` });
    if (Math.abs(x2 - x1) > 8) {
      set(flecha, { d: `M${x1} 18H${r2(x2 - s * 7)}` });
      set(flechaPunta, { d: `M${r2(x2)} 18l${-s * 8} -4v8z` });
    } else {
      set(flecha, { d: 'M0 0' });
      set(flechaPunta, { d: 'M0 0' });
    }
    set(flechaTexto, { x: r2(Math.max(48, Math.min(412, (x1 + x2) / 2))), y: 9 });
    flechaTexto.textContent = 'Δx = ' + decimal(dx) + NBSP + 'm';
    lecturaT.textContent = 't = ' + decimal(tv) + NBSP + 's';
    lecturaA.textContent = 'área = ' + decimal((c.v0 + v) / 2 * tv) + NBSP + 'm';
    set(cuenta, { opacity: suave(avance(tramos, 'formula', tiempo)) });
    set(extra, { opacity: suave(avance(tramos, 'extra', tiempo)) });
    if (c.a) {
      const gT = suave(avance(tramos, 'dt', tiempo)), gV = suave(avance(tramos, 'dv', tiempo));
      const vf = velocidad(c, c.T);
      set(catetoT, { d: gT > 0 ? `M${tA(0)} ${A.V0}H${r2(tA(c.T * gT))}` : 'M0 0' });
      set(catetoV, { d: gV > 0 ? `M${tA(c.T)} ${A.V0}V${r2(vA(vf * gV))}` : 'M0 0' });
      set(etiquetaT, { opacity: gT });
      set(etiquetaV, { opacity: gV });
      set(pendienteTexto, { opacity: suave(avance(tramos, 'pendiente', tiempo)) });
    } else {
      set(catetoT, { d: 'M0 0' });
      set(catetoV, { d: 'M0 0' });
    }
  }

  function elige(nueva, animar) {
    if (!AREA[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'constante', true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(Math.min(t, linea.fin)); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { pendiente, area };
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
