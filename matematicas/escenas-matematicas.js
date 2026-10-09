/* Escenas de Matemáticas de Tercial. Mismo contrato que las de Química: cada
   escena es { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja su cuadro final. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const conSigno = n => (n > 0 ? '+' + n : n < 0 ? MENOS + (-n) : '0');
const numero = n => (n < 0 ? MENOS + (-n) : String(n));

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- La recta de los signos ----------------
   Recta de −10 a 10, 17 unidades por entero. Cada número es un paso: hacia la
   derecha si es positivo y hacia la izquierda si es negativo.
   - Sumar es caminar un paso y luego otro.
   - Restar es sumar el contrario: la flecha del número que se resta aparece
     punteada y da la vuelta (se refleja sobre su punto de salida) antes de caminar.
   - Multiplicar por un entero es repetir el paso. En los productos las flechas van
     sobre la recta y el punto viaja en su punta.
   - Multiplicar por −1 es dar media vuelta: todo gira 180° alrededor del cero, por
     arriba, y el punto dibuja un arcoíris hasta el otro lado. Por eso «menos por
     menos» queda del lado positivo.
   Cada ejemplo se comprueba al cargar: el último paso tiene que llegar al
   resultado, y la flecha que da la vuelta tiene que terminar donde dice la resta. */
const EJEMPLOS = {
  suma: { ecuacion: ['4 + (', MENOS + '6)'], resultado: -2,
    pasos: [{ desde: 0, hasta: 4, fila: 0 }, { desde: 4, hasta: -2, fila: 1 }] },
  resta: { ecuacion: [MENOS + '3 ' + MENOS + ' 5'], resultado: -8,
    pasos: [{ desde: 0, hasta: -3, fila: 0 }, { desde: -3, hasta: -8, fila: 1, fantasma: 2 }] },
  'resta-negativo': { ecuacion: [MENOS + '2 ' + MENOS + ' (' + MENOS + '7)'], resultado: 5,
    pasos: [{ desde: 0, hasta: -2, fila: 0 }, { desde: -2, hasta: 5, fila: 1, fantasma: -9 }] },
  producto: { ecuacion: ['(' + MENOS + '3) × 2'], resultado: -6, enRecta: true,
    pasos: [{ desde: 0, hasta: -3, fila: 0 }, { desde: -3, hasta: -6, fila: 0 }] },
  'producto-negativo': { ecuacion: ['(' + MENOS + '3) × (' + MENOS + '2)'], resultado: 6, enRecta: true,
    pasos: [{ desde: 0, hasta: -3, fila: 0 }, { desde: -3, hasta: -6, fila: 0 }], refleja: true }
};

for (const [clave, e] of Object.entries(EJEMPLOS)) {
  const final = e.pasos[e.pasos.length - 1].hasta * (e.refleja ? -1 : 1);
  if (final !== e.resultado) throw new Error(`recta: ${clave} no llega a ${e.resultado}`);
  e.pasos.forEach((p, i) => {
    if (i > 0 && p.desde !== e.pasos[i - 1].hasta) throw new Error(`recta: ${clave} salta en el paso ${i + 1}`);
    if (p.fantasma !== undefined && 2 * p.desde - p.fantasma !== p.hasta) throw new Error(`recta: ${clave} voltea mal`);
  });
  // La media vuelta es rígida sólo si todo el producto queda del mismo lado del cero.
  if (e.refleja && e.pasos.some(p => p.desde > 0 || p.hasta > 0)) throw new Error(`recta: ${clave} cruza el cero antes de girar`);
}

const X0 = 200, UNIDAD = 17, EJE = 150, FILAS = [118, 94], RADIO_PUNTO = 5.5;
const xDe = n => X0 + n * UNIDAD;

function lineaDeTiempo(e) {
  const tramos = [];
  let t = 0.5;
  e.pasos.forEach((p, i) => {
    if (p.fantasma !== undefined) {
      tramos.push({ tipo: 'aparece', i, t0: t, t1: t + 0.6 }); t += 1.1;
      tramos.push({ tipo: 'voltea', i, t0: t, t1: t + 1.0 }); t += 1.4;
    }
    const dur = Math.max(0.7, Math.abs(p.hasta - p.desde) * 0.24);
    tramos.push({ tipo: 'paso', i, t0: t, t1: t + dur }); t += dur + 0.5;
  });
  if (e.refleja) { tramos.push({ tipo: 'refleja', t0: t, t1: t + 2.0 }); t += 2.5; }
  tramos.push({ tipo: 'resultado', t0: t, t1: t + 0.5 });
  return { tramos, fin: t + 0.5 };
}

function avance(tramos, tipo, i, t) {
  const tr = tramos.find(x => x.tipo === tipo && (i === undefined || x.i === i));
  if (!tr) return null;
  return clamp((t - tr.t0) / (tr.t1 - tr.t0));
}

function recta(svg) {
  const root = svg.closest('[data-signos]');
  const botones = root ? [...root.querySelectorAll('[data-ejemplo]')] : [];
  const panel = root ? root.querySelector('[data-signos-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-ejemplo]').forEach(n => { textos[n.dataset.textoEjemplo] = n.innerHTML; });

  // Recta: eje con flechas en los extremos, una marca por entero y los pares numerados.
  const fondo = make('g', {}, svg);
  make('path', { d: `M${xDe(-10.7)} ${EJE}H${xDe(10.7)}`, class: 'recta__eje' }, fondo);
  make('path', { d: `M${xDe(10.7) + 6} ${EJE}l-7 -4v8z`, class: 'recta__punta-eje' }, fondo);
  make('path', { d: `M${xDe(-10.7) - 6} ${EJE}l7 -4v8z`, class: 'recta__punta-eje' }, fondo);
  for (let n = -10; n <= 10; n++) {
    make('path', { d: `M${xDe(n)} ${EJE - (n % 5 === 0 ? 6 : 4)}V${EJE + (n % 5 === 0 ? 6 : 4)}`, class: 'recta__marca' }, fondo);
    if (n % 2 === 0) {
      const t = make('text', { x: xDe(n), y: EJE + 19, class: 'recta__numero' + (n === 0 ? ' recta__numero--cero' : ''), 'text-anchor': 'middle' }, fondo);
      t.textContent = numero(n);
    }
  }
  const capa = make('g', {}, svg);
  const caminante = make('circle', { cx: xDe(0), cy: EJE, r: RADIO_PUNTO, class: 'recta__caminante' }, svg);
  const ecuacion = make('text', { x: 30, y: 34, class: 'recta__ecuacion' }, svg);

  let clave = null, t = 0, linea = null, flechas = [], arco = null, arcoPunta = null;

  function flecha(clase) {
    const g = make('g', { class: clase }, capa);
    return {
      g,
      salida: make('path', { class: 'recta__salida' }, g),
      cuerpo: make('path', { class: 'recta__flecha' }, g),
      punta: make('path', { class: 'recta__punta' }, g),
      etiqueta: make('text', { class: 'recta__etiqueta', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g)
    };
  }

  // Una flecha de (x1, y1) a (x2, y2) en cualquier dirección: marca de salida, cuerpo,
  // punta y su número del lado de arriba. La etiqueta tiene su propia opacidad: se apaga
  // cuando la flecha da la vuelta, para que el cambio de signo no se vea como dos números
  // encimados. «recorte» deja la punta en el borde del punto que viaja con ella.
  function dibujaVector(f, x1, y1, x2, y2, valor, opacidad, opacidadEtiqueta = 1, recorte = 0) {
    f.g.setAttribute('opacity', r2(opacidad));
    f.etiqueta.setAttribute('opacity', r2(clamp(opacidadEtiqueta)));
    f.etiqueta.textContent = conSigno(valor);
    const dx = x2 - x1, dy = y2 - y1, largo = Math.hypot(dx, dy);
    if (largo < 1) {
      set(f.salida, { d: `M${x1} ${y1 - 5}V${y1 + 5}` });
      set(f.cuerpo, { d: `M${x1} ${y1}H${x1}` });
      set(f.punta, { d: 'M0 0' });
      set(f.etiqueta, { x: x1, y: y1 - 12 });
      return;
    }
    const ux = dx / largo, uy = dy / largo, nx = -uy, ny = ux;   // dirección y su normal
    set(f.salida, { d: `M${x1 + nx * 5} ${y1 + ny * 5}L${x1 - nx * 5} ${y1 - ny * 5}` });
    const alcance = Math.max(0, largo - recorte);
    const tx = x1 + ux * alcance, ty = y1 + uy * alcance;
    const cabeza = Math.min(7, alcance);
    const bx = tx - ux * cabeza, by = ty - uy * cabeza;
    set(f.cuerpo, { d: `M${x1} ${y1}L${bx} ${by}` });
    set(f.punta, { d: cabeza > 0.5 ? `M${tx} ${ty}L${bx + nx * 4} ${by + ny * 4}L${bx - nx * 4} ${by - ny * 4}Z` : 'M0 0' });
    const lado = ny > 0 ? -1 : 1;                                  // la normal que sube en pantalla
    set(f.etiqueta, { x: (x1 + tx) / 2 + nx * lado * 12, y: (y1 + ty) / 2 + ny * lado * 12 });
  }

  function armar(nueva) {
    clave = nueva;
    const e = EJEMPLOS[clave];
    linea = lineaDeTiempo(e);
    capa.innerHTML = '';
    // El arcoíris de la media vuelta va debajo de las flechas.
    arco = e.refleja ? make('path', { class: 'recta__arco' }, capa) : null;
    // En la cima, una punta dice hacia dónde fue el giro (se ve también en la imagen fija).
    arcoPunta = e.refleja ? make('path', { class: 'recta__arco-punta', opacity: 0 }, capa) : null;
    flechas = e.pasos.map(p => ({ solida: flecha('recta__paso'), fantasma: p.fantasma !== undefined ? flecha('recta__paso recta__paso--fantasma') : null }));
    ecuacion.innerHTML = '';
    e.ecuacion.forEach(parte => { const s = make('tspan', {}, ecuacion); s.textContent = parte; });
    const igual = make('tspan', { class: 'recta__resultado' }, ecuacion);
    igual.textContent = ' = ' + numero(e.resultado);
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    const e = EJEMPLOS[clave];
    const { tramos } = linea;
    // Media vuelta: el ángulo va de 0 a π y todo gira alrededor del cero, por arriba.
    const giro = e.refleja ? Math.PI * suave(avance(tramos, 'refleja', undefined, tiempo)) : 0;
    // Dónde queda en pantalla el valor v (en los productos, sobre la recta y girado).
    const punto = (v, fila) => e.enRecta
      ? [X0 + UNIDAD * v * Math.cos(giro), EJE - UNIDAD * Math.abs(v) * Math.sin(giro)]
      : [xDe(v), FILAS[fila]];
    let posicion = 0, ultimo = -1;
    e.pasos.forEach((p, i) => { if (avance(tramos, 'paso', i, tiempo) > 0) ultimo = i; });
    e.pasos.forEach((p, i) => {
      const f = flechas[i];
      const y = FILAS[p.fila];
      if (f.fantasma) {
        const a = avance(tramos, 'aparece', i, tiempo);
        const v = avance(tramos, 'voltea', i, tiempo);
        const g = avance(tramos, 'paso', i, tiempo);
        const c = Math.cos(Math.PI * suave(v));            // 1 → −1: la flecha da la vuelta
        const fin = p.desde + (p.fantasma - p.desde) * c;
        const valor = suave(v) < 0.5 ? p.fantasma - p.desde : p.hasta - p.desde;
        // Al empezar a caminar, la punteada se queda sólo como guía: sin número.
        dibujaVector(f.fantasma, xDe(p.desde), y, xDe(fin), y, valor, suave(a) * (1 - suave(g)) * 0.9, c * c * (1 - 4 * g));
      }
      const g = avance(tramos, 'paso', i, tiempo);
      const llega = p.desde + (p.hasta - p.desde) * suave(g);
      const [x1, y1] = punto(p.desde, p.fila), [x2, y2] = punto(llega, p.fila);
      // Pasada la mitad del giro, cada paso ya apunta al otro lado: −3 se lee +3.
      const valor = (p.hasta - p.desde) * (giro > Math.PI / 2 ? -1 : 1);
      const recorte = e.enRecta && i === ultimo ? RADIO_PUNTO + 1.5 : 0;
      dibujaVector(f.solida, x1, y1, x2, y2, valor, g > 0 ? 1 : 0, Math.cos(giro) ** 2, recorte);
      if (g > 0) posicion = llega;
    });
    // El punto: sobre la recta, o en la punta del producto mientras da la media vuelta.
    const [cx, cy] = e.enRecta ? punto(posicion) : [xDe(posicion), EJE];
    set(caminante, { cx, cy });
    if (arco) {
      const extremo = e.pasos[e.pasos.length - 1].hasta, radio = UNIDAD * Math.abs(extremo);
      const [ax, ay] = punto(extremo);
      set(arco, giro > 0.001
        ? { d: `M${xDe(extremo)} ${EJE}A${radio} ${radio} 0 0 1 ${r2(ax)} ${r2(ay)}`, opacity: 1 }
        : { d: 'M0 0', opacity: 0 });
      const cima = EJE - radio;
      set(arcoPunta, { d: `M${X0 + 4} ${cima}L${X0 - 3} ${cima - 3.5}L${X0 - 3} ${cima + 3.5}Z`, opacity: r2(clamp((giro - Math.PI / 2 - 0.15) / 0.3)) });
    }
    const res = avance(tramos, 'resultado', undefined, tiempo);
    ecuacion.lastChild.setAttribute('opacity', r2(suave(res)));
  }

  function elige(nueva, animar) {
    if (!EJEMPLOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ejemplo === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.ejemplo, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  // La primera vez que se ve, se reproduce sola.
  elige(inicial ? inicial.dataset.ejemplo : 'suma', true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(t); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { recta };
const scenes = [...document.querySelectorAll('[data-escena-mate]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaMate](svg)
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
