/* Escenas de Física de Tercial. Mismo contrato que las de Química y Matemáticas:
   cada escena es { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja su cuadro final. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const conSigno = n => (n > 0 ? '+' + n : n < 0 ? MENOS + -n : '0');
const decimal = n => (n < 0 ? MENOS : '') + Math.abs(n).toFixed(1);

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- El auto en la pista ----------------
   Un auto compacto de verdad: 4.0 m de largo, 1.44 m de alto, 2.55 m entre ejes y
   llantas de 0.31 m de radio que tocan el piso. La pista mide 25 m y cada metro son
   14 px. El auto ya viene rodando cuando empieza el video (t = 0) y la imagen se
   congela al final, como una pausa: nunca frena de golpe. Las llantas giran lo que
   avanza el auto (ángulo = distancia ÷ radio), así que no patinan. Cada segundo
   queda una copia tenue con su tiempo: la distancia entre copias es la velocidad. */
const MOVIMIENTOS = {
  mas5: { v: 5, x0: 3, T: 4 },
  mas10: { v: 10, x0: 3, T: 2 },
  menos5: { v: -5, x0: 23, T: 4 }
};

const S = 14, X0 = 25, PISO = 132, EJE = 151, LARGO_PISTA = 25;
const RADIO = 0.31, PAUSA_INICIAL = 0.6;
const xDe = x => X0 + x * S;

// Contorno del auto mirando a la derecha: u hacia el frente, h hacia arriba, en metros.
const CARROCERIA = [
  [-2.0, 0.32], [-2.02, 0.74], [-1.98, 1.0], [-1.72, 1.36], [-1.45, 1.44], [0.15, 1.44],
  [0.95, 0.98], [1.85, 0.83], [2.0, 0.68], [2.0, 0.36], [1.88, 0.3]
];
const EJES = [1.25, -1.3];
const ARCO = 0.4;
const VENTANA = [[0.78, 1.0], [0.12, 1.33], [-1.38, 1.33], [-1.62, 1.02]];

for (const [clave, m] of Object.entries(MOVIMIENTOS)) {
  const fin = m.x0 + m.v * m.T;
  // El auto (4 m) siempre queda sobre el piso, que se extiende 0.7 m más allá de cada punta del eje.
  if (Math.min(fin, m.x0) - 2.0 < -0.7 || Math.max(fin, m.x0) + 2.0 > LARGO_PISTA + 0.7) {
    throw new Error(`auto: ${clave} se sale de la pista`);
  }
  if (Math.abs(m.v) * 1 < 4.2) throw new Error(`auto: ${clave} enciman sus copias`);
}

function auto(svg) {
  const root = svg.closest('[data-auto]');
  const botones = root ? [...root.querySelectorAll('[data-movimiento]')] : [];
  const panel = root ? root.querySelector('[data-auto-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-movimiento]').forEach(n => { textos[n.dataset.textoMovimiento] = n.innerHTML; });

  // Pista: el piso, y abajo el eje x como una regla con una marca por metro.
  const fondo = make('g', {}, svg);
  make('path', { d: `M${xDe(-0.7)} ${PISO}H${xDe(LARGO_PISTA + 0.7)}`, class: 'pista__piso' }, fondo);
  make('path', { d: `M${xDe(0)} ${EJE}H${xDe(LARGO_PISTA) + 8}`, class: 'pista__eje' }, fondo);
  make('path', { d: `M${xDe(LARGO_PISTA) + 15} ${EJE}l-7 -4v8z`, class: 'pista__punta' }, fondo);
  for (let n = 0; n <= LARGO_PISTA; n++) {
    const larga = n % 5 === 0;
    make('path', { d: `M${xDe(n)} ${EJE - (larga ? 5 : 3)}V${EJE + (larga ? 5 : 3)}`, class: 'pista__marca' }, fondo);
    if (larga) {
      const t = make('text', { x: xDe(n), y: EJE + 17, class: 'pista__numero', 'text-anchor': 'middle' }, fondo);
      t.textContent = n;
    }
  }
  // El nombre del eje va entre el piso y la regla, al final, donde no lo tapa el auto.
  const nombreEje = make('text', { x: xDe(LARGO_PISTA) + 15, y: EJE - 8, class: 'pista__numero pista__numero--eje', 'text-anchor': 'end' }, fondo);
  nombreEje.textContent = 'x (m)';

  const capaCopias = make('g', {}, svg);
  const capaTiempos = make('g', {}, svg);
  const capaAuto = make('g', {}, svg);
  const lectura = make('text', { x: 25, y: 34, class: 'pista__lectura' }, svg);
  const lecturaT = make('tspan', {}, lectura);
  const lecturaX = make('tspan', { dx: 22 }, lectura);
  const flecha = make('g', { class: 'pista__velocidad' }, svg);
  const flechaCuerpo = make('path', { class: 'pista__flecha' }, flecha);
  const flechaPunta = make('path', { class: 'pista__flecha-punta' }, flecha);
  const flechaTexto = make('text', { class: 'pista__flecha-texto', 'text-anchor': 'middle' }, flecha);

  // Dibuja un auto completo y devuelve sus partes para moverlo.
  function dibujaAuto(capa, clase) {
    const g = make('g', { class: clase }, capa);
    const cuerpo = make('path', { class: 'auto__carroceria' }, g);
    const vidrio = make('path', { class: 'auto__vidrio' }, g);
    const poste = make('path', { class: 'auto__poste' }, g);
    const faro = make('path', { class: 'auto__faro' }, g);
    const calavera = make('path', { class: 'auto__calavera' }, g);
    const llantas = EJES.map(() => {
      const ll = make('g', {}, g);
      make('circle', { r: RADIO * S, class: 'auto__llanta' }, ll);
      make('circle', { r: 0.2 * S, class: 'auto__rin' }, ll);
      const rayos = make('path', { class: 'auto__rayos' }, ll);
      return { ll, rayos };
    });
    return { g, cuerpo, vidrio, poste, faro, calavera, llantas };
  }

  function pon(partes, x, sentido, giro) {
    const X = u => xDe(x) + sentido * u * S;
    const Y = h => PISO - h * S;
    const p = ([u, h]) => `${r2(X(u))} ${r2(Y(h))}`;
    // Carrocería con los dos huecos de las llantas (arcos alrededor de cada eje).
    const [ejeDelantero, ejeTrasero] = EJES;
    const barrido = sentido > 0 ? 0 : 1;
    let d = `M${p(CARROCERIA[0])}`;
    for (const punto of CARROCERIA.slice(1)) d += `L${p(punto)}`;
    d += `L${p([ejeDelantero + ARCO, 0.3])}`;
    d += `A${ARCO * S} ${ARCO * S} 0 0 ${barrido} ${p([ejeDelantero - ARCO, 0.3])}`;
    d += `L${p([ejeTrasero + ARCO, 0.3])}`;
    d += `A${ARCO * S} ${ARCO * S} 0 0 ${barrido} ${p([ejeTrasero - ARCO, 0.3])}Z`;
    set(partes.cuerpo, { d });
    set(partes.vidrio, { d: 'M' + VENTANA.map(p).join('L') + 'Z' });
    set(partes.poste, { d: `M${p([-0.42, 1.34])}L${p([-0.32, 1.34])}L${p([-0.32, 1.0])}L${p([-0.42, 1.0])}Z` });
    set(partes.faro, { d: `M${p([1.96, 0.71])}L${p([1.72, 0.79])}L${p([1.74, 0.69])}Z` });
    set(partes.calavera, { d: `M${p([-2.01, 0.8])}L${p([-1.86, 0.8])}L${p([-1.86, 0.94])}L${p([-1.99, 0.94])}Z` });
    partes.llantas.forEach(({ ll, rayos }, i) => {
      const cx = X(EJES[i]), cy = Y(RADIO);
      set(ll, { transform: `translate(${r2(cx)} ${r2(cy)})` });
      let dr = '';
      for (let k = 0; k < 5; k++) {
        const a = giro + k * 2 * Math.PI / 5;
        dr += `M${r2(Math.cos(a) * 0.05 * S)} ${r2(Math.sin(a) * 0.05 * S)}L${r2(Math.cos(a) * 0.19 * S)} ${r2(Math.sin(a) * 0.19 * S)}`;
      }
      set(rayos, { d: dr });
    });
  }

  let clave = null, t = 0, m = null, principal = null, copias = [];

  function armar(nueva) {
    clave = nueva;
    m = MOVIMIENTOS[clave];
    capaCopias.innerHTML = '';
    capaTiempos.innerHTML = '';
    capaAuto.innerHTML = '';
    const sentido = Math.sign(m.v);
    // Una copia por segundo, con su tiempo encima; aparecen cuando el auto pasa.
    copias = [];
    for (let s = 0; s <= m.T; s++) {
      const partes = dibujaAuto(capaCopias, 'auto auto--copia');
      const x = m.x0 + m.v * s;
      pon(partes, x, sentido, (x - m.x0) / RADIO);
      const etiqueta = make('text', { x: xDe(x), y: PISO - 1.44 * S - 6, class: 'pista__tiempo', 'text-anchor': 'middle' }, capaTiempos);
      etiqueta.textContent = s + ' s';
      copias.push([partes.g, etiqueta]);
    }
    principal = dibujaAuto(capaAuto, 'auto');
    flechaTexto.textContent = 'v = ' + conSigno(m.v) + ' m/s';
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    const tv = Math.max(0, Math.min(m.T, tiempo - PAUSA_INICIAL));   // tiempo del video
    const x = m.x0 + m.v * tv;
    const sentido = Math.sign(m.v);
    pon(principal, x, sentido, (x - m.x0) / RADIO);
    copias.forEach((par, s) => par.forEach(n => { n.style.display = tv >= s ? '' : 'none'; }));
    lecturaT.textContent = 't = ' + decimal(tv) + ' s';
    lecturaX.textContent = 'x = ' + decimal(x) + ' m';
    // La flecha de la velocidad viaja sobre el auto: 4 px por cada m/s.
    const yF = PISO - 1.44 * S - 22, x1 = xDe(x), x2 = x1 + m.v * 4;
    set(flechaCuerpo, { d: `M${r2(x1)} ${yF}H${r2(x2 - sentido * 5)}` });
    set(flechaPunta, { d: `M${r2(x2)} ${yF}L${r2(x2 - sentido * 6)} ${yF - 3.5}L${r2(x2 - sentido * 6)} ${yF + 3.5}Z` });
    set(flechaTexto, { x: r2((x1 + x2) / 2), y: yF - 7 });
  }

  const fin = () => PAUSA_INICIAL + m.T;

  function elige(nueva, animar) {
    if (!MOVIMIENTOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.movimiento === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : fin();
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.movimiento, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.movimiento : 'mas5', true);
  return {
    update(dt) { if (t < fin()) { t += dt; draw(t); } },
    still() { t = fin(); draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { auto };
const scenes = [...document.querySelectorAll('[data-escena-fisica]')].map(svg => ({
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
