/* Escena de «Ecuaciones de primer grado»: la ecuación es una balanza en equilibrio.
   Mismo contrato que las demás escenas de Tercial: cada escena es { update(dt), still() };
   un reloj compartido sólo avanza las escenas visibles y, con movimiento reducido, se
   dibuja el cuadro final. Al llegar a la tele (tercial:diapositiva) o con «Repetir»,
   empieza otra vez.

   La balanza es de Roberval, la de dos platos encima: el brazo gira sobre su eje y una
   barra paralela, abajo, mantiene los postes verticales y los platos horizontales. Cada
   cubo pesa 1 y cada caja pesa x, el valor que se busca (distinto en cada caso). El ángulo
   sale de la física de una balanza: el par de las cargas contra el par que la endereza,
       θ'' = ω² (κ·ΔW·cos θ − sen θ) − 2ζω·θ',   ΔW = peso a la derecha − peso a la izquierda,
   así que sólo se inclina si los lados pesan distinto (quieta, tan θ = κ·ΔW) y llega con
   un vaivén amortiguado. Lo que se quita se levanta del plato: su peso deja de contar en
   ese instante, y si se quita lo mismo de los dos lados a la vez, nada se mueve. Lo que
   se acomoda se desliza sobre su plato: en una balanza de Roberval, el lugar de la carga
   sobre el plato no cambia el equilibrio. Cada caso se comprueba al cargar. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- Geometría (unidades del viewBox, 400 × 240) ---------------- */
export const G = {
  P: { x: 200, y: 166 },          // eje del brazo
  Q: { x: 200, y: 188 },          // eje de la barra de abajo
  L: 112,                         // del eje a cada poste
  SOBRE: 26,                      // del extremo del brazo a la cara del plato
  PLATO: 140, GRUESO: 5,          // ancho y grueso de cada plato
  CUBO: 12, CAJA: 24,             // lado de un cubo y de una caja
  BASE: 206,                      // cara de arriba de la base
  Y_OP: 76,                       // renglón de las operaciones («− 2», «÷ 3»)
  Y_ECUACION: 30, Y_NOTA: 53,
  ALZA: 10                        // lo que sube lo que se quita, mientras se desvanece
};

/* ---------------- Física ---------------- */
export const FISICA = {
  kappa: 0.07,                    // tan θ por cada unidad de diferencia: 2 de diferencia → 8°
  omega: 3.0,                     // rad/s: la balanza tarda unos 2 s en asentarse
  zeta: 0.6,                      // amortiguamiento: un vaivén pequeño, sin rebotes
  paso: 1 / 240,
  tope: 12 * Math.PI / 180        // el tope mecánico (no se alcanza en ningún caso)
};

/* ---------------- Los casos ----------------
   objetos: dónde está cada cosa sobre su plato (x desde el centro del plato, nivel desde
   su cara). Un cubo encima de otro descansa sobre él: van a 12 de altura, sin hueco.
   quitar: [tiempo, grupos]; mover: [desde, hasta, { grupo: x de destino }];
   ecuaciones: [tiempo, texto, cuánto hay: cajas y cubos a la izquierda, cajas y cubos a
   la derecha]. En el texto, lo que va entre llaves sale en el color del nivel. */
const IZQ = -1, DER = 1;
const caja = (lado, x, nivel, grupo) => ({ tipo: 'caja', lado, x, nivel, grupo });
const cubo = (lado, x, nivel, grupo) => ({ tipo: 'cubo', lado, x, nivel, grupo });
const columna = (lado, x, n, grupo) => Array.from({ length: n }, (_, i) => cubo(lado, x, i * G.CUBO, grupo));

export const CASOS = {
  'un-lado': {
    x: 3,
    objetos: [
      caja(IZQ, -45, 0, 'c1'), caja(IZQ, -18, 0, 'c2'), caja(IZQ, 9, 0, 'c3'),
      cubo(IZQ, 37, 0, 'l1'), cubo(IZQ, 51, 0, 'l2'),
      ...columna(DER, -28, 3, 'k1'), ...columna(DER, -14, 3, 'k2'), ...columna(DER, 0, 3, 'k3'),
      cubo(DER, 14, 0, 'e1'), cubo(DER, 28, 0, 'e2')
    ],
    // Primero se quita 2 sólo de la izquierda: la balanza se inclina; luego, de la derecha.
    quitar: [[2.4, 'l1 l2'], [6.0, 'e1 e2'], [11.0, 'c2 c3 k2 k3']],
    mover: [[8.8, 9.8, { c1: -40, c2: 0, c3: 40, k1: -40, k2: 0, k3: 40 }], [12.0, 12.8, { c1: 0, k1: 0 }]],
    ecuaciones: [[0, '3x + 2 = 11', [3, 2, 0, 11]], [2.9, '3x {≠} 11', [3, 0, 0, 11]],
      [6.6, '3x = 9', [3, 0, 0, 9]], [11.6, 'x = {3}', [1, 0, 0, 3]]],
    notas: [[0, 'Los dos lados pesan lo mismo: está en equilibrio.'], [2.6, 'Si quitas 2 sólo de un lado, se inclina.'],
      [6.2, 'Quita 2 también del otro lado: equilibrio.'], [8.8, 'Parte cada lado en 3 partes iguales.'],
      [11.2, 'Una caja pesa lo mismo que 3 cubos.']],
    operaciones: [[1.8, 7.6, IZQ, '− 2'], [5.4, 7.6, DER, '− 2'], [9.0, 12.0, 0, '÷ 3']],
    divisores: [9.8, 11.0, [-20, 20]],
    fin: 13.8
  },
  'dos-lados': {
    x: 2,
    objetos: [
      caja(IZQ, -38, 0, 'b1'), caja(IZQ, -11, 0, 'b2'), caja(IZQ, 16, 0, 'b3'),
      caja(IZQ, -24.5, G.CAJA, 'b4'), caja(IZQ, 2.5, G.CAJA, 'b5'), cubo(IZQ, 44, 0, 'l1'),
      caja(DER, -44, 0, 'r1'), caja(DER, -17, 0, 'r2'),
      ...columna(DER, 10, 2, 'k1'), ...columna(DER, 24, 2, 'k2'), ...columna(DER, 38, 2, 'k3'),
      cubo(DER, 52, 0, 's1')
    ],
    quitar: [[2.6, 'b4 b5 r1 r2'], [5.6, 'l1 s1'], [10.2, 'b2 b3 k2 k3']],
    mover: [[8.0, 9.0, { b1: -40, b2: 0, b3: 40, k1: -40, k2: 0, k3: 40 }], [11.2, 12.0, { b1: 0, k1: 0 }]],
    ecuaciones: [[0, '5x + 1 = 2x + 7', [5, 1, 2, 7]], [3.2, '3x + 1 = 7', [3, 1, 0, 7]],
      [6.2, '3x = 6', [3, 0, 0, 6]], [10.8, 'x = {2}', [1, 0, 0, 2]]],
    notas: [[0, 'Hay cajas de los dos lados, y está en equilibrio.'], [2.6, 'Quita 2 cajas de cada lado: sigue igual.'],
      [5.6, 'Quita 1 cubo de cada lado.'], [8.0, 'Parte cada lado en 3 partes iguales.'],
      [10.4, 'Una caja pesa lo mismo que 2 cubos.']],
    operaciones: [[1.8, 4.4, 0, '− 2x'], [5.0, 7.4, 0, '− 1'], [8.2, 11.2, 0, '÷ 3']],
    divisores: [9.0, 10.2, [-20, 20]],
    fin: 13.0
  },
  parentesis: {
    x: 4,
    objetos: [
      caja(IZQ, -34, 0, 'a1'), ...columna(IZQ, -13, 3, 'ca'), caja(IZQ, 19, 0, 'a2'), ...columna(IZQ, 40, 3, 'cb'),
      ...columna(DER, -40, 2, 'g1'), ...columna(DER, -26, 2, 'g1'), ...columna(DER, -8, 2, 'g2'), ...columna(DER, 6, 2, 'g2'),
      ...columna(DER, 26, 3, 'e1'), ...columna(DER, 40, 3, 'e2')
    ],
    // Los dos paquetes (x + 3): el contorno se desvanece cuando se quita el paréntesis.
    paquetes: { hasta: 1.8, bordes: [[-50, -3], [3, 50]], alto: 43 },
    resaltar: [[2.6, 4.2, 'ca cb']],
    quitar: [[5.2, 'ca cb e1 e2'], [9.8, 'a2 g2']],
    mover: [[7.6, 8.6, { a1: -30, a2: 30, g1: -37, g2: 23 }], [10.8, 11.6, { a1: 0, g1: -7 }]],
    ecuaciones: [[0, '2(x + 3) = 14', [2, 6, 0, 14]], [2.6, '2x + 6 = 14', [2, 6, 0, 14]],
      [5.8, '2x = 8', [2, 0, 0, 8]], [10.4, 'x = {4}', [1, 0, 0, 4]]],
    notas: [[0, 'Dos paquetes iguales: una caja y 3 cubos cada uno.'], [1.8, 'Sin paréntesis: 2 cajas y 2 × 3 = 6 cubos.'],
      [4.6, 'Quita 6 cubos de cada lado.'], [7.6, 'Parte cada lado en 2 partes iguales.'],
      [10.0, 'Una caja pesa lo mismo que 4 cubos.']],
    operaciones: [[4.6, 7.0, 0, '− 6'], [7.8, 10.8, 0, '÷ 2']],
    divisores: [8.6, 9.8, [0]],
    fin: 12.6
  }
};

/* ---------------- Lo que pasa en el tiempo t (sin dibujar) ---------------- */
const ALZA = 0.9;          // lo que tarda en levantarse y desvanecerse lo que se quita
const AVISO = 0.6;         // lo que se va a quitar se marca un momento antes

function prepara(caso) {
  if (caso.items) return caso;
  caso.items = caso.objetos.map(o => ({ ...o, x0: o.x, quita: null, movs: [] }));
  for (const [t, grupos] of caso.quitar) {
    for (const g of grupos.split(' ')) caso.items.filter(it => it.grupo === g).forEach(it => { it.quita = t; });
  }
  const ref = {};
  for (const it of caso.items) if (!(it.grupo in ref)) ref[it.grupo] = it.x0;
  for (const [t0, t1, destinos] of caso.mover) {
    for (const [g, destino] of Object.entries(destinos)) {
      const dx = destino - ref[g];
      ref[g] = destino;
      caso.items.filter(it => it.grupo === g).forEach(it => it.movs.push({ t0, t1, dx }));
    }
  }
  return caso;
}

export function xEn(it, t) {
  let x = it.x0;
  for (const m of it.movs) x += m.dx * suave((t - m.t0) / (m.t1 - m.t0));
  return x;
}

// Su peso cuenta mientras no se levanta del plato.
export const presente = (it, t) => it.quita === null || t < it.quita;

export function pesos(caso, t) {
  prepara(caso);
  let izq = 0, der = 0;
  for (const it of caso.items) {
    if (!presente(it, t)) continue;
    const p = it.tipo === 'caja' ? caso.x : 1;
    if (it.lado < 0) izq += p; else der += p;
  }
  return { izq, der };
}

export function cuenta(caso, t) {
  prepara(caso);
  const c = [0, 0, 0, 0];
  for (const it of caso.items) if (presente(it, t)) c[(it.lado < 0 ? 0 : 2) + (it.tipo === 'caja' ? 0 : 1)]++;
  return c;
}

// Integra el ángulo del brazo hasta t, desde donde se quedó.
export function simula(caso, estado, hasta) {
  const { kappa, omega, zeta, paso, tope } = FISICA;
  while (estado.t + paso <= hasta + 1e-9) {
    const { izq, der } = pesos(caso, estado.t);
    const acel = omega * omega * (kappa * (der - izq) * Math.cos(estado.th) - Math.sin(estado.th)) - 2 * zeta * omega * estado.w;
    estado.w += acel * paso;
    estado.th += estado.w * paso;
    if (Math.abs(estado.th) > tope) { estado.th = Math.sign(estado.th) * tope; estado.w = 0; }
    estado.t += paso;
  }
  return estado;
}

// Centro de la cara de un plato con el brazo girado th (positivo: baja la derecha).
export const plato = (lado, th) => ({
  x: G.P.x + lado * G.L * Math.cos(th),
  y: G.P.y + lado * G.L * Math.sin(th) - G.SOBRE
});

export function alzado(it, t) {
  if (it.quita === null || t < it.quita) return { alza: 0, opacidad: 1 };
  const u = (t - it.quita) / ALZA;
  return u >= 1 ? null : { alza: G.ALZA * (1 - (1 - u) * (1 - u)), opacidad: 1 - suave(u) };
}

const ventana = (t, t0, t1) => suave((t - t0) / 0.4) * (1 - suave((t - t1) / 0.4));
const indice = (eventos, t) => { let k = 0; eventos.forEach((e, i) => { if (e[0] <= t) k = i; }); return k; };

/* ---------------- Comprobaciones al cargar ---------------- */
for (const [clave, caso] of Object.entries(CASOS)) {
  prepara(caso);
  // Lo que dice cada ecuación es lo que hay en los platos, y el signo es la verdad de la balanza.
  for (const [t, texto, esperado] of caso.ecuaciones) {
    const hay = cuenta(caso, t);
    if (hay.join() !== esperado.join()) throw new Error(`balanza: ${clave} «${texto}» no es lo que hay (${hay})`);
    const { izq, der } = pesos(caso, t);
    if (texto.includes('≠') === (izq === der)) throw new Error(`balanza: ${clave} «${texto}» no es lo que pesa`);
  }
  // Ningún objeto se sale de su plato: ni al principio, ni al acomodarse.
  for (const it of caso.items) {
    const ancho = it.tipo === 'caja' ? G.CAJA : G.CUBO;
    for (let t = 0; t <= caso.fin; t += 0.05) {
      if (!presente(it, t)) break;
      if (Math.abs(xEn(it, t)) + ancho / 2 > G.PLATO / 2 - 3) throw new Error(`balanza: ${clave} ${it.grupo} se sale del plato`);
    }
  }
  // Al final, la caja que queda pesa lo mismo que lo de enfrente.
  const final = pesos(caso, caso.fin);
  if (final.izq !== final.der) throw new Error(`balanza: ${clave} no termina en equilibrio`);
}

/* ---------------- La escena ---------------- */
function balanza(svg) {
  const root = svg.closest('[data-balanza]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-balanza-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const { P, Q, L } = G;
  // Lo fijo: la base, el pilar y la leyenda.
  make('rect', { x: 150, y: G.BASE, width: 100, height: 9, rx: 3, class: 'platillos__base' }, svg);
  make('rect', { x: P.x - 4, y: P.y, width: 8, height: G.BASE - P.y, class: 'platillos__base' }, svg);
  const leyenda = make('g', { class: 'platillos__leyenda' }, svg);
  make('rect', { x: 14, y: 221, width: 11, height: 11, rx: 1.5, class: 'platillos__cubo' }, leyenda);
  make('text', { x: 31, y: 230.5 }, leyenda).textContent = 'pesa 1';
  make('rect', { x: 84, y: 219, width: 15, height: 15, rx: 2, class: 'platillos__caja' }, leyenda);
  make('text', { x: 91.5, y: 227, class: 'platillos__caja-x platillos__caja-x--chica', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, leyenda).textContent = 'x';
  make('text', { x: 105, y: 230.5 }, leyenda).textContent = 'pesa x';

  // Lo que se mueve: la barra de abajo, los postes, el brazo, los pernos y los platos.
  const barra = make('rect', { x: -L, y: -2, width: 2 * L, height: 4, rx: 2, class: 'platillos__barra' }, svg);
  const postes = [IZQ, DER].map(() => make('rect', { width: 5, class: 'platillos__poste' }, svg));
  const brazo = make('rect', { x: -L - 7, y: -3.5, width: 2 * L + 14, height: 7, rx: 3.5, class: 'platillos__brazo' }, svg);
  [P, Q].forEach(c => make('circle', { cx: c.x, cy: c.y, r: 3.6, class: 'platillos__perno' }, svg));
  const pernosPoste = [0, 1, 2, 3].map(() => make('circle', { r: 2.2, class: 'platillos__perno' }, svg));
  const platos = [IZQ, DER].map(() => make('rect', { width: G.PLATO, height: G.GRUESO, rx: 2.5, class: 'platillos__plato' }, svg));

  const capa = make('g', {}, svg);
  const marcas = make('g', {}, svg);
  const ecuaciones = [0, 1].map(() => make('text', { x: 200, y: G.Y_ECUACION, class: 'platillos__ecuacion', 'text-anchor': 'middle' }, svg));
  const notas = [0, 1].map(() => make('text', { x: 200, y: G.Y_NOTA, class: 'platillos__nota', 'text-anchor': 'middle' }, svg));

  let clave = null, caso = null, t = 0, sim = null, nodos = [], ops = [], divisores = [], paquetes = [];
  let ecuacionVista = -1, notaVista = -1;

  function escribe(nodo, cadena) {
    nodo.textContent = '';
    for (const parte of cadena.split(/(\{[^}]*\})/)) {
      if (!parte) continue;
      const acento = parte.startsWith('{');
      const s = make('tspan', acento ? { class: 'platillos__acento' } : {}, nodo);
      s.textContent = acento ? parte.slice(1, -1) : parte;
    }
  }

  function armar(nueva) {
    clave = nueva;
    caso = prepara(CASOS[clave]);
    capa.textContent = '';
    marcas.textContent = '';
    nodos = caso.items.map(it => {
      const g = make('g', {}, capa);
      if (it.tipo === 'caja') {
        make('rect', { x: -G.CAJA / 2, y: -G.CAJA, width: G.CAJA, height: G.CAJA, rx: 2.5, class: 'platillos__caja' }, g);
        make('text', { x: 0, y: -G.CAJA / 2, class: 'platillos__caja-x', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g).textContent = 'x';
      } else {
        make('rect', { x: -G.CUBO / 2, y: -G.CUBO, width: G.CUBO, height: G.CUBO, rx: 1.5, class: 'platillos__cubo' }, g);
      }
      return g;
    });
    ops = [];
    for (const [t0, t1, lado, texto] of caso.operaciones) {
      for (const l of lado ? [lado] : [IZQ, DER]) {
        const n = make('text', { y: G.Y_OP, class: 'platillos__op', 'text-anchor': 'middle' }, marcas);
        n.textContent = texto;
        ops.push({ n, t0, t1, lado: l });
      }
    }
    divisores = [];
    if (caso.divisores) {
      const [t0, t1, xs] = caso.divisores;
      for (const lado of [IZQ, DER]) for (const dx of xs) divisores.push({ n: make('path', { class: 'platillos__divisor' }, marcas), t0, t1, lado, dx });
    }
    paquetes = caso.paquetes ? caso.paquetes.bordes.map(b => ({ n: make('path', { class: 'platillos__paquete' }, marcas), b })) : [];
    ecuacionVista = notaVista = -1;
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  // Dos renglones que se funden: el de antes se va y el nuevo llega.
  function funde(nodosTexto, eventos, vista, tiempo) {
    const k = indice(eventos, tiempo);
    if (k !== vista) {
      escribe(nodosTexto[0], eventos[k][1]);
      if (k > 0) escribe(nodosTexto[1], eventos[k - 1][1]); else nodosTexto[1].textContent = '';
    }
    const u = tiempo - eventos[k][0];
    nodosTexto[0].setAttribute('opacity', k === 0 ? 1 : r2(suave((u - 0.15) / 0.45)));
    nodosTexto[1].setAttribute('opacity', k === 0 ? 0 : r2(1 - suave(u / 0.3)));
    return k;
  }

  function draw(tiempo) {
    if (!sim || tiempo < sim.t - 1e-9) sim = { t: 0, th: 0, w: 0 };
    simula(caso, sim, tiempo);
    const th = sim.th, grados = r2(th * 180 / Math.PI);
    set(brazo, { transform: `translate(${P.x} ${P.y}) rotate(${grados})` });
    set(barra, { transform: `translate(${Q.x} ${Q.y}) rotate(${grados})` });
    const centros = {};
    [IZQ, DER].forEach((lado, i) => {
      const arriba = { x: P.x + lado * L * Math.cos(th), y: P.y + lado * L * Math.sin(th) };
      const abajo = { x: Q.x + lado * L * Math.cos(th), y: Q.y + lado * L * Math.sin(th) };
      const cara = plato(lado, th);
      centros[lado] = cara;
      set(postes[i], { x: arriba.x - 2.5, y: cara.y + G.GRUESO, height: abajo.y + 2 - (cara.y + G.GRUESO) });
      set(pernosPoste[2 * i], { cx: arriba.x, cy: arriba.y });
      set(pernosPoste[2 * i + 1], { cx: abajo.x, cy: abajo.y });
      set(platos[i], { x: cara.x - G.PLATO / 2, y: cara.y });
    });
    caso.items.forEach((it, i) => {
      const a = alzado(it, tiempo);
      if (!a) { nodos[i].setAttribute('display', 'none'); return; }
      nodos[i].removeAttribute('display');
      const c = centros[it.lado];
      set(nodos[i], { transform: `translate(${r2(c.x + xEn(it, tiempo))} ${r2(c.y - it.nivel - a.alza)})`, opacity: r2(a.opacidad) });
      const marcado = (it.quita !== null && tiempo >= it.quita - AVISO) ||
        (caso.resaltar || []).some(([t0, t1, grupos]) => tiempo >= t0 && tiempo < t1 && grupos.split(' ').includes(it.grupo));
      nodos[i].classList.toggle('es-marcado', marcado);
    });
    for (const o of ops) set(o.n, { x: centros[o.lado].x, opacity: r2(ventana(tiempo, o.t0, o.t1)) });
    for (const d of divisores) {
      const c = centros[d.lado];
      set(d.n, { d: `M${r2(c.x + d.dx)} ${r2(c.y - 2)}V${r2(c.y - 46)}`, opacity: r2(ventana(tiempo, d.t0, d.t1)) });
    }
    for (const p of paquetes) {
      const c = centros[IZQ], [x0, x1] = p.b, arriba = c.y - caso.paquetes.alto, r = 5;
      const X0 = r2(c.x + x0), X1 = r2(c.x + x1);
      set(p.n, {
        d: `M${X0} ${r2(c.y - 1)}V${r2(arriba + r)}Q${X0} ${r2(arriba)} ${r2(X0 + r)} ${r2(arriba)}H${r2(X1 - r)}Q${X1} ${r2(arriba)} ${X1} ${r2(arriba + r)}V${r2(c.y - 1)}`,
        opacity: r2(1 - suave((tiempo - caso.paquetes.hasta) / 0.8))
      });
    }
    ecuacionVista = funde(ecuaciones, caso.ecuaciones, ecuacionVista, tiempo);
    notaVista = funde(notas, caso.notas, notaVista, tiempo);
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    sim = null;
    t = animar && !reducedMotion.matches ? 0 : caso.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'un-lado', true);
  return {
    update(dt) { if (t < caso.fin) { t = Math.min(caso.fin, t + dt); draw(t); } },
    still() { t = caso.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { balanza };
const scenes = [...document.querySelectorAll('[data-escena-ecuacion]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaEcuacion](svg)
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
