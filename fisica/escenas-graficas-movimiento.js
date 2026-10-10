/* Escenas de Gráficas II (Física, semana 6). Mismo contrato que las demás escenas de
   Tercial: cada escena es { update(dt), still() }; el reloj compartido sólo avanza las
   escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const decimal = n => (n < -0.05 ? MENOS : '') + Math.abs(n).toFixed(1);
const conSigno = n => (n > 0.05 ? '+' : n < -0.05 ? MENOS : '') + Math.abs(n).toFixed(1);

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- Una historia, dos gráficas ----------------
   Un auto busca dónde estacionarse: arranca, avanza parejo, frena, se queda quieto y se
   regresa en reversa porque se pasó del lugar. Cada tramo dura 3 s y tiene aceleración
   constante; la velocidad nunca brinca (no frena de golpe), así que la gráfica x–t no
   tiene esquinas. Velocidades de estacionamiento: 4 m/s (14.4 km/h) hacia adelante y
   3 m/s en reversa; aceleraciones de 1.3 m/s² o menos.
   El auto es el de Magnitudes y unidades: 4.0 m de largo, 1.44 m de alto, 2.55 m entre
   ejes y llantas de 0.31 m que tocan el piso. Va de frente todo el tiempo (en reversa no
   se voltea) y sus llantas giran lo que avanza: ángulo = desplazamiento ÷ radio. */
const X_INICIAL = 2;
const TRAMOS = [
  { clave: 'acelera', nombre: 'acelera', d: 3, a: 4 / 3 },
  { clave: 'constante', nombre: 'constante', d: 3, a: 0 },
  { clave: 'frena', nombre: 'frena', d: 3, a: -4 / 3 },
  { clave: 'detenido', nombre: 'detenido', d: 3, a: 0 },
  { clave: 'regresa', nombre: 'se regresa', d: 3, a: -1 }
];
// Inicio de cada tramo: tiempo, posición y velocidad.
{
  let t = 0, x = X_INICIAL, v = 0;
  for (const tr of TRAMOS) {
    Object.assign(tr, { t0: t, x0: x, v0: v, t1: t + tr.d });
    x += v * tr.d + tr.a * tr.d * tr.d / 2;
    v += tr.a * tr.d;
    t += tr.d;
  }
}
const T_FIN = TRAMOS[TRAMOS.length - 1].t1;

function tramoEn(t) {
  for (let i = TRAMOS.length - 1; i >= 0; i--) if (t >= TRAMOS[i].t0) return i;
  return 0;
}
function estado(t) {
  const tr = TRAMOS[tramoEn(Math.min(t, T_FIN))], u = Math.min(t, T_FIN) - tr.t0;
  return { x: tr.x0 + tr.v0 * u + tr.a * u * u / 2, v: tr.v0 + tr.a * u };
}

// Geometría del dibujo (unidades del viewBox de 440 × 328).
const PL = 46, PR = 424, LARGO_PISTA = 30;
const S = (PR - PL) / LARGO_PISTA;                 // 12.6 por metro
const PISO = 62, EJE = 80, Y_FLECHA = 36;
const RADIO = 0.31, POR_MS = 5;                    // flecha: 5 por cada m/s
const XT = { arriba: 124, abajo: 208, min: 0, max: 30 };
const VT = { arriba: 226, abajo: 304, min: -4, max: 5 };
const BANDA_ARRIBA = 104, Y_NOMBRES = 116, Y_TIEMPOS = 320;
const xPista = x => PL + x * S;
const xDe = t => PL + t / T_FIN * (PR - PL);
const yX = x => XT.abajo - (x - XT.min) / (XT.max - XT.min) * (XT.abajo - XT.arriba);
const yV = v => VT.abajo - (v - VT.min) / (VT.max - VT.min) * (VT.abajo - VT.arriba);

// Se comprueba al cargar: la historia es la que dicen los nombres y nada se sale de su lugar.
{
  const casi = (a, b) => Math.abs(a - b) < 1e-9;
  const esperado = [[0, 2, 0], [3, 8, 4], [6, 20, 4], [9, 26, 0], [12, 26, 0], [15, 21.5, -3]];
  for (const [t, x, v] of esperado) {
    const e = estado(t);
    if (!casi(e.x, x) || !casi(e.v, v)) throw new Error(`historia: en t = ${t} s no está donde debe`);
  }
  for (let t = 0; t <= T_FIN + 1e-9; t += 0.01) {
    const { x, v } = estado(t), tr = TRAMOS[tramoEn(t)];
    // El auto (4 m) siempre sobre el piso, que sobra 0.7 m en cada punta.
    if (x - 2 < -0.7 || x + 2 > LARGO_PISTA + 0.7) throw new Error('historia: el auto se sale de la pista');
    if (x < XT.min || x > XT.max || v < VT.min || v > VT.max) throw new Error('historia: se sale de la gráfica');
    const dentro = t > tr.t0 + 1e-6 && t < tr.t1 - 1e-6;
    if (!dentro) continue;
    const ok = { acelera: v * tr.a > 0, constante: tr.a === 0 && v > 0, frena: v * tr.a < 0,
      detenido: v === 0 && tr.a === 0, regresa: v < 0 }[tr.clave];
    if (!ok) throw new Error(`historia: el tramo «${tr.nombre}» no hace lo que dice`);
  }
}

// Contorno del auto mirando a la derecha: u hacia el frente, h hacia arriba, en metros.
const CARROCERIA = [
  [-2.0, 0.32], [-2.02, 0.74], [-1.98, 1.0], [-1.72, 1.36], [-1.45, 1.44], [0.15, 1.44],
  [0.95, 0.98], [1.85, 0.83], [2.0, 0.68], [2.0, 0.36], [1.88, 0.3]
];
const EJES = [1.25, -1.3];
const ARCO = 0.4;
const VENTANA = [[0.78, 1.0], [0.12, 1.33], [-1.38, 1.33], [-1.62, 1.02]];

function historia(svg) {
  const root = svg.closest('[data-historia]');
  const botones = root ? [...root.querySelectorAll('[data-tramo]')] : [];
  const panel = root ? root.querySelector('[data-historia-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-tramo]').forEach(n => { textos[n.dataset.textoTramo] = n.innerHTML; });

  /* El fondo, de una vez: pocas piezas (la rejilla de cada gráfica es un solo trazo). */
  const fondo = make('g', {}, svg);
  // Pista: el piso y, abajo, el eje x como regla: una marca por metro y un número cada 10 m.
  make('path', { d: `M${xPista(-0.7)},${PISO}H${xPista(LARGO_PISTA + 0.7)}`, class: 'pista__piso' }, fondo);
  let marcas = `M${xPista(0)},${EJE}H${xPista(LARGO_PISTA) + 8}`;
  for (let n = 0; n <= LARGO_PISTA; n++) {
    const larga = n % 5 === 0;
    marcas += `M${r2(xPista(n))},${EJE - (larga ? 5 : 3)}V${EJE + (larga ? 5 : 3)}`;
  }
  make('path', { d: marcas, class: 'pista__eje' }, fondo);
  make('path', { d: `M${xPista(LARGO_PISTA) + 15},${EJE}L${xPista(LARGO_PISTA) + 8},${EJE - 4}V${EJE + 4}Z`, class: 'pista__punta' }, fondo);
  for (let n = 0; n <= LARGO_PISTA; n += 10) {
    make('text', { x: xPista(n), y: EJE + 15, class: 'historia__numero', 'text-anchor': 'middle' }, fondo).textContent = n;
  }
  make('text', { x: xPista(LARGO_PISTA) + 15, y: EJE - 8, class: 'historia__numero historia__numero--eje', 'text-anchor': 'end' }, fondo).textContent = 'x (m)';

  // Las dos gráficas: rejilla (un segundo, 5 m, 1 m/s), ejes, números y nombres de los ejes.
  let rejilla = '';
  for (let t = 1; t <= T_FIN; t++) rejilla += `M${r2(xDe(t))},${XT.arriba}V${XT.abajo}M${r2(xDe(t))},${VT.arriba}V${VT.abajo}`;
  for (let x = 5; x <= XT.max; x += 5) rejilla += `M${PL},${r2(yX(x))}H${PR}`;
  for (let v = VT.min; v <= VT.max; v++) if (v !== 0) rejilla += `M${PL},${r2(yV(v))}H${PR}`;
  make('path', { d: rejilla, class: 'historia__rejilla' }, fondo);
  make('path', { d: `M${PL},${XT.arriba}V${XT.abajo}H${PR}M${PL},${VT.arriba}V${VT.abajo}M${PL},${r2(yV(0))}H${PR}`, class: 'historia__eje' }, fondo);
  for (let x = 0; x <= XT.max; x += 10) {
    make('text', { x: PL - 6, y: yX(x) + 3.5, class: 'historia__numero', 'text-anchor': 'end' }, fondo).textContent = x;
  }
  for (let v = -2; v <= 4; v += 2) {
    make('text', { x: PL - 6, y: yV(v) + 3.5, class: 'historia__numero', 'text-anchor': 'end' }, fondo).textContent = v < 0 ? MENOS + -v : v;
  }
  for (let t = 0; t <= T_FIN; t += 3) {
    make('text', { x: xDe(t), y: Y_TIEMPOS, class: 'historia__numero', 'text-anchor': 'middle' }, fondo).textContent = t + ' s';
  }
  const titulo = (txt, y) => make('text', { x: 13, y, class: 'historia__titulo-eje', 'text-anchor': 'middle', transform: `rotate(-90 13 ${y})` }, fondo).textContent = txt;
  titulo('x (m)', (XT.arriba + XT.abajo) / 2);
  titulo('v (m/s)', (VT.arriba + VT.abajo) / 2);

  /* Lo que cambia: la franja del tramo, los nombres, las curvas, el cursor y el auto. */
  const banda = make('rect', { class: 'historia__banda', y: BANDA_ARRIBA, height: VT.abajo - BANDA_ARRIBA, x: PL, width: 0 }, svg);
  const separadores = make('path', { class: 'historia__separador', d: 'M0,0' }, svg);
  const nombres = TRAMOS.map(tr => {
    const n = make('text', { x: xDe(tr.t0 + tr.d / 2), y: Y_NOMBRES, class: 'historia__tramo', 'text-anchor': 'middle' }, svg);
    n.textContent = tr.nombre;
    return n;
  });
  const curvaX = make('path', { class: 'historia__curva historia__curva--pasada', d: 'M0,0' }, svg);
  const curvaV = make('path', { class: 'historia__curva historia__curva--pasada', d: 'M0,0' }, svg);
  const actualX = make('path', { class: 'historia__curva historia__curva--actual', d: 'M0,0' }, svg);
  const actualV = make('path', { class: 'historia__curva historia__curva--actual', d: 'M0,0' }, svg);
  const cursor = make('path', { class: 'historia__cursor', d: 'M0,0' }, svg);
  const puntoX = make('circle', { class: 'historia__punto', r: 3.6, cx: PL, cy: yX(X_INICIAL) }, svg);
  const puntoV = make('circle', { class: 'historia__punto', r: 3.6, cx: PL, cy: yV(0) }, svg);
  const lectura = make('text', { x: 14, y: 20, class: 'historia__lectura' }, svg);
  const lecturaT = make('tspan', {}, lectura);
  const lecturaX = make('tspan', { dx: 18 }, lectura);
  const lecturaV = make('tspan', { dx: 18 }, lectura);
  const flecha = make('g', { class: 'pista__velocidad' }, svg);
  const flechaCuerpo = make('path', { class: 'pista__flecha', d: 'M0,0' }, flecha);
  const flechaPunta = make('path', { class: 'pista__flecha-punta', d: 'M0,0' }, flecha);

  // El auto, con las clases de fisica.css.
  const g = make('g', { class: 'auto' }, svg);
  const cuerpo = make('path', { class: 'auto__carroceria' }, g);
  const vidrio = make('path', { class: 'auto__vidrio' }, g);
  const poste = make('path', { class: 'auto__poste' }, g);
  const faro = make('path', { class: 'auto__faro' }, g);
  const calavera = make('path', { class: 'auto__calavera' }, g);
  const llantas = EJES.map(() => {
    const ll = make('g', {}, g);
    make('circle', { r: RADIO * S, class: 'auto__llanta' }, ll);
    make('circle', { r: 0.2 * S, class: 'auto__rin' }, ll);
    return { ll, rayos: make('path', { class: 'auto__rayos' }, ll) };
  });

  function ponAuto(x, giro) {
    const X = u => xPista(x) + u * S;
    const Y = h => PISO - h * S;
    const p = ([u, h]) => `${r2(X(u))},${r2(Y(h))}`;
    const [delantero, trasero] = EJES;
    let d = `M${p(CARROCERIA[0])}`;
    for (const punto of CARROCERIA.slice(1)) d += `L${p(punto)}`;
    d += `L${p([delantero + ARCO, 0.3])}A${r2(ARCO * S)},${r2(ARCO * S)},0,0,0,${p([delantero - ARCO, 0.3])}`;
    d += `L${p([trasero + ARCO, 0.3])}A${r2(ARCO * S)},${r2(ARCO * S)},0,0,0,${p([trasero - ARCO, 0.3])}Z`;
    set(cuerpo, { d });
    set(vidrio, { d: 'M' + VENTANA.map(p).join('L') + 'Z' });
    set(poste, { d: `M${p([-0.42, 1.34])}L${p([-0.32, 1.34])}L${p([-0.32, 1.0])}L${p([-0.42, 1.0])}Z` });
    set(faro, { d: `M${p([1.96, 0.71])}L${p([1.72, 0.79])}L${p([1.74, 0.69])}Z` });
    set(calavera, { d: `M${p([-2.01, 0.8])}L${p([-1.86, 0.8])}L${p([-1.86, 0.94])}L${p([-1.99, 0.94])}Z` });
    llantas.forEach(({ ll, rayos }, i) => {
      set(ll, { transform: `translate(${r2(X(EJES[i]))} ${r2(Y(RADIO))})` });
      let dr = '';
      for (let k = 0; k < 5; k++) {
        const a = giro + k * 2 * Math.PI / 5;
        dr += `M${r2(Math.cos(a) * 0.05 * S)},${r2(Math.sin(a) * 0.05 * S)}L${r2(Math.cos(a) * 0.19 * S)},${r2(Math.sin(a) * 0.19 * S)}`;
      }
      set(rayos, { d: dr });
    });
  }

  // Trazo exacto de un tramo, de su inicio a t: en x–t una parábola (Bézier cuadrática con
  // el punto de control donde se cruzan las tangentes) y en v–t una recta.
  function trazo(i, t, nuevo) {
    const tr = TRAMOS[i], u = Math.max(0, Math.min(t, tr.t1) - tr.t0);
    const xa = tr.x0, va = tr.v0, xb = xa + va * u + tr.a * u * u / 2, vb = va + tr.a * u;
    const mx = `${r2(xDe(tr.t0 + u / 2))},${r2(yX(xa + va * u / 2))}`;
    return {
      x: `${nuevo ? `M${r2(xDe(tr.t0))},${r2(yX(xa))}` : ''}Q${mx},${r2(xDe(tr.t0 + u))},${r2(yX(xb))}`,
      v: `${nuevo ? `M${r2(xDe(tr.t0))},${r2(yV(va))}` : ''}L${r2(xDe(tr.t0 + u))},${r2(yV(vb))}`
    };
  }

  let modo = 'todo', t = 0, inicio = 0, fin = T_FIN, pausa = 0.6;

  function draw(reloj) {
    const tv = Math.max(inicio, Math.min(fin, inicio + reloj - pausa));
    const actual = modo === 'todo' ? tramoEn(tv) : Number(modo) - 1;
    const { x, v } = estado(tv);
    // Franja del tramo actual y separadores de los tramos ya empezados.
    const tr = TRAMOS[actual];
    set(banda, { x: xDe(tr.t0), width: xDe(tr.t1) - xDe(tr.t0) });
    let sep = '';
    for (let i = 1; i <= actual; i++) sep += `M${r2(xDe(TRAMOS[i].t0))},${BANDA_ARRIBA}V${VT.abajo}`;
    set(separadores, { d: sep || 'M0,0' });
    nombres.forEach((n, i) => {
      n.style.display = i <= actual ? '' : 'none';
      n.classList.toggle('historia__tramo--actual', i === actual);
    });
    // Curvas: lo que ya pasó, tenue; el tramo actual, en el color del nivel.
    let px = '', pv = '';
    for (let i = 0; i < actual; i++) { const s = trazo(i, TRAMOS[i].t1, i === 0); px += s.x; pv += s.v; }
    set(curvaX, { d: px || 'M0,0' });
    set(curvaV, { d: pv || 'M0,0' });
    const s = trazo(actual, tv, true);
    set(actualX, { d: s.x });
    set(actualV, { d: s.v });
    set(cursor, { d: `M${r2(xDe(tv))},${XT.arriba - 2}V${VT.abajo + 2}` });
    set(puntoX, { cx: xDe(tv), cy: yX(x) });
    set(puntoV, { cx: xDe(tv), cy: yV(v) });
    // El auto y su velocidad.
    ponAuto(x, (x - X_INICIAL) / RADIO);
    lecturaT.textContent = 't = ' + tv.toFixed(1) + ' s';
    lecturaX.textContent = 'x = ' + decimal(x) + ' m';
    lecturaV.textContent = 'v = ' + conSigno(v) + ' m/s';
    if (Math.abs(v) < 0.15) {
      flecha.setAttribute('opacity', 0);
    } else {
      const x1 = xPista(x), x2 = x1 + v * POR_MS, sentido = Math.sign(v);
      flecha.setAttribute('opacity', 1);
      set(flechaCuerpo, { d: `M${r2(x1)},${Y_FLECHA}H${r2(x2 - sentido * 5)}` });
      set(flechaPunta, { d: `M${r2(x2)},${Y_FLECHA}L${r2(x2 - sentido * 6)},${Y_FLECHA - 3.5}L${r2(x2 - sentido * 6)},${Y_FLECHA + 3.5}Z` });
    }
  }

  const duracion = () => pausa + (fin - inicio);

  function elige(nuevo, animar) {
    if (nuevo !== 'todo' && !TRAMOS[Number(nuevo) - 1]) return;
    modo = nuevo;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tramo === modo)));
    if (modo === 'todo') { inicio = 0; fin = T_FIN; pausa = 0.6; }
    else { const tr = TRAMOS[Number(modo) - 1]; inicio = tr.t0; fin = tr.t1; pausa = 0.9; }
    if (panel) panel.innerHTML = textos[modo] ? '<p>' + textos[modo] + '</p>' : '';
    t = animar && !reducedMotion.matches ? 0 : duracion();
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.tramo, true)));
  if (repetir) repetir.addEventListener('click', () => elige(modo, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(modo, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.tramo : 'todo', true);
  return {
    update(dt) { if (t < duracion()) { t += dt; draw(t); } },
    still() { t = duracion(); draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { historia };
// Sólo las escenas de este módulo: el atributo lo comparten las escenas de Física.
const scenes = [...document.querySelectorAll('[data-escena-fisica]')].filter(svg => factories[svg.dataset.escenaFisica]).map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaFisica](svg)
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
