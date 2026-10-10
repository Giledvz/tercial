/* Escena de Productos notables: el modelo de área. Mismo contrato que las demás escenas de
   Tercial: cada escena es { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja su cuadro final.

   Multiplicar dos binomios es sacar el área de un rectángulo cuyos lados miden lo que los
   binomios: cada término de un lado por cada término del otro es un pedazo del rectángulo.
   - (a + b)²: el cuadrado de lado a + b se parte en a², dos rectángulos ab y b². Los dos
     rectángulos son el 2ab.
   - (x + 2)(x + 5): con fichas. Las 5 tiras y las 2 tiras de x se suman (7x); las fichas de 1
     forman un rectángulo de 2 por 5 (10). La x mide 124/17 ≈ 7.3 fichas: no cabe un número
     entero de fichas en ella, así que nadie la puede contar.
   - (a + b)(a − b): se corta la tira de b por a − b; se levanta, da un cuarto de vuelta y se
     acomoda arriba. Queda el cuadrado a² con un hueco b² en la esquina.
   Al cargar se comprueba la geometría: cada pieza mide lo que dicen sus cotas, las piezas
   llenan su rectángulo sin encimarse y la tira que se mueve nunca pasa por la otra pieza. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const NB = ' ';           // espacio que no se colapsa: alinea los «=» de los dos renglones

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- Medidas (unidades del viewBox de 400 × 300) ---------------- */
const ANCHO = 400, ALTO = 300;
const ECU_X = 24, ECU_Y1 = 27, ECU_Y2 = 54;   // los dos renglones de la cuenta
const BASE = 262;                              // borde de abajo de las figuras
const COTA = 11;                               // separación entre la figura y sus cotas
const HUECO_TECHO = 64;                        // nada de la figura sube más que esto (abajo de la cuenta)
const FUNDE = 0.6;                             // lo que tarda en aparecer cada cosa
const INSET = 0.8;                             // medio hueco entre fichas vecinas
const aparece = (t, t0, dur = FUNDE) => suave((t - t0) / dur);

// (a + b)²: a y b son longitudes cualesquiera; a² abajo a la izquierda, como en una gráfica.
const CUADRADO = { A: 136, B: 58 };
// (x + 2)(x + 5): x = 124, la ficha mide 17.
const FICHAS = { X: 124, U: 17, P: 2, Q: 5 };
// (a + b)(a − b): a = 140, b = 56.
const CONJ = { A: 140, B: 56 };

/* ---------------- Comprobaciones de la geometría ---------------- */
function falla(msg) { throw new Error('productos notables: ' + msg); }

(function comprobar() {
  const { X, U, P, Q } = FICHAS;
  if (Math.abs(X / U - Math.round(X / U)) < 0.2) falla('la x mide casi un número entero de fichas');
  const anchoF = X + Q * U, altoF = X + P * U;
  if (BASE - altoF < HUECO_TECHO) falla('las fichas tocan la cuenta');
  if (anchoF > ANCHO - 60) falla('las fichas no caben a lo ancho');
  const lado = CUADRADO.A + CUADRADO.B;
  if (BASE - lado < HUECO_TECHO) falla('el cuadrado toca la cuenta');
  if (CONJ.A <= 2 * CONJ.B) falla('a debe ser más del doble de b para que la tira quepa arriba');
})();

// Separación entre un rectángulo girado (centro, medidas, ángulo en grados) y uno derecho:
// verdadero si se enciman más de «tolera» unidades (tocarse no cuenta).
function enciman(g, r, tolera = 0.5) {
  const th = g.th * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  const ex = [c, s], ey = [-s, c];
  const esquinasG = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) =>
    [g.x + ex[0] * i * g.w / 2 + ey[0] * j * g.h / 2, g.y + ex[1] * i * g.w / 2 + ey[1] * j * g.h / 2]);
  const esquinasR = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
  for (const eje of [[1, 0], [0, 1], ex, ey]) {
    const pg = esquinasG.map(([x, y]) => x * eje[0] + y * eje[1]);
    const pr = esquinasR.map(([x, y]) => x * eje[0] + y * eje[1]);
    if (Math.max(...pg) <= Math.min(...pr) + tolera || Math.max(...pr) <= Math.min(...pg) + tolera) return false;
  }
  return true;
}

/* ---------------- Piezas comunes ---------------- */
function cotaAbajo(capa, x1, x2, texto, marcas = 0) {
  const g = make('g', { class: 'pn__cota' }, capa);
  const y = BASE + COTA;
  let d = `M${x1} ${y}H${x2}M${x1} ${y - 4}V${y + 4}M${x2} ${y - 4}V${y + 4}`;
  for (let i = 1; i < marcas; i++) { const x = x1 + (x2 - x1) * i / marcas; d += `M${r2(x)} ${y - 2.5}V${y + 2.5}`; }
  make('path', { d, class: 'pn__cota-linea' }, g);
  const t = make('text', { x: (x1 + x2) / 2, y: y + 20, class: 'pn__cota-texto', 'text-anchor': 'middle' }, g);
  t.textContent = texto;
  return g;
}

function cotaIzquierda(capa, x0, y1, y2, texto, marcas = 0) {
  const g = make('g', { class: 'pn__cota' }, capa);
  const x = x0 - COTA;
  let d = `M${x} ${y1}V${y2}M${x - 4} ${y1}H${x + 4}M${x - 4} ${y2}H${x + 4}`;
  for (let i = 1; i < marcas; i++) { const y = y1 + (y2 - y1) * i / marcas; d += `M${x - 2.5} ${r2(y)}H${x + 2.5}`; }
  make('path', { d, class: 'pn__cota-linea' }, g);
  const t = make('text', { x: x - 9, y: (y1 + y2) / 2, class: 'pn__cota-texto', 'text-anchor': 'end', 'dominant-baseline': 'central' }, g);
  t.textContent = texto;
  return g;
}

// La cuenta: el producto y, a la derecha, los términos que van apareciendo. El segundo renglón
// empieza con el producto invisible, así su «=» queda justo debajo del primero.
function cuenta(capa, producto, renglon1, renglon2) {
  const spans = [];
  const linea = (y, partes, invisible) => {
    const texto = make('text', { x: ECU_X, y, class: 'pn__ecuacion' }, capa);
    const p = make('tspan', invisible ? { visibility: 'hidden' } : {}, texto);
    p.textContent = producto;
    for (const parte of partes) {
      const s = make('tspan', parte.acento ? { class: 'pn__acento' } : {}, texto);
      s.textContent = parte.texto;
      spans.push({ s, t0: parte.t0 });
    }
  };
  linea(ECU_Y1, renglon1, false);
  if (renglon2) linea(ECU_Y2, renglon2, true);
  return t => spans.forEach(({ s, t0 }) => s.setAttribute('fill-opacity', r2(aparece(t, t0))));
}

function rotulo(capa, x, y, texto, tipo) {
  const t = make('text', { x, y, class: `pn__rotulo pn__rotulo--${tipo}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, capa);
  t.textContent = texto;
  return t;
}

// Las piezas de un rectángulo no se enciman y lo llenan completo (la suma de sus áreas es la suya).
function compruebaPiezas(nombre, piezas, x0, y0, w, h) {
  let area = 0;
  piezas.forEach((p, i) => {
    area += p.w * p.h;
    if (p.x < x0 - 0.01 || p.y < y0 - 0.01 || p.x + p.w > x0 + w + 0.01 || p.y + p.h > y0 + h + 0.01) falla(`${nombre}: la pieza ${i + 1} se sale`);
    piezas.slice(i + 1).forEach((q, j) => {
      const dx = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x), dy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
      if (dx > 0.01 && dy > 0.01) falla(`${nombre}: las piezas ${i + 1} y ${i + j + 2} se enciman`);
    });
  });
  if (Math.abs(area - w * h) > 0.5) falla(`${nombre}: las piezas no llenan el rectángulo`);
}

// Un caso hecho de piezas fijas que aparecen una por una (los dos primeros).
function casoDePiezas(capa, def) {
  const { x0, y0, w, h } = def.marco;
  compruebaPiezas(def.nombre, def.piezas, x0, y0, w, h);
  const rellenos = make('g', {}, capa), lineas = make('g', {}, capa), rotulos = make('g', {}, capa), cotas = make('g', {}, capa);
  const piezas = def.piezas.map(p => ({
    nodo: make('rect', { x: p.x + INSET, y: p.y + INSET, width: p.w - 2 * INSET, height: p.h - 2 * INSET, class: `pn__pieza pn__pieza--${p.tipo}` }, rellenos),
    t0: p.t0
  }));
  // El contorno y las divisiones principales van encima de las fichas.
  const estructura = make('path', { d: `M${x0} ${y0}h${w}v${h}h${-w}Z` + def.divisiones, class: 'pn__linea' }, lineas);
  const marcasCotas = make('g', {}, cotas);
  def.cotas(marcasCotas);
  const textos = def.rotulos.map(r => ({ nodo: rotulo(rotulos, r.x, r.y, r.texto, r.tipo), t0: r.t0 }));
  const pintaCuenta = cuenta(capa, def.producto, def.renglon1, def.renglon2);
  return {
    fin: def.fin,
    draw(t) {
      const a = aparece(t, 0.3);
      set(estructura, { 'stroke-opacity': a });
      set(marcasCotas, { opacity: a });
      piezas.forEach(p => set(p.nodo, { opacity: aparece(t, p.t0) }));
      textos.forEach(r => set(r.nodo, { opacity: aparece(t, r.t0) }));
      pintaCuenta(t);
    }
  };
}

/* ---------------- (a + b)² ---------------- */
function casoCuadrado(capa) {
  const { A, B } = CUADRADO, S = A + B;
  const x0 = (ANCHO - S) / 2, y0 = BASE - S;
  const T = { a2: 2.2, ab1: 3.9, ab2: 5.6, b2: 7.3, junta: 9.1 };
  return casoDePiezas(capa, {
    nombre: '(a + b)²',
    marco: { x0, y0, w: S, h: S },
    piezas: [
      { x: x0, y: BASE - A, w: A, h: A, tipo: 'grande', t0: T.a2 },
      { x: x0 + A, y: BASE - A, w: B, h: A, tipo: 'rect', t0: T.ab1 },
      { x: x0, y: y0, w: A, h: B, tipo: 'rect', t0: T.ab2 },
      { x: x0 + A, y: y0, w: B, h: B, tipo: 'chico', t0: T.b2 }
    ],
    divisiones: `M${x0 + A} ${y0}V${BASE}M${x0} ${BASE - A}H${x0 + S}`,
    cotas: g => {
      cotaAbajo(g, x0, x0 + A, 'a'); cotaAbajo(g, x0 + A, x0 + S, 'b');
      cotaIzquierda(g, x0, BASE - A, BASE, 'a'); cotaIzquierda(g, x0, y0, BASE - A, 'b');
    },
    rotulos: [
      { x: x0 + A / 2, y: BASE - A / 2, texto: 'a²', tipo: 'grande', t0: T.a2 },
      { x: x0 + A + B / 2, y: BASE - A / 2, texto: 'ab', tipo: 'rect', t0: T.ab1 },
      { x: x0 + A / 2, y: y0 + B / 2, texto: 'ab', tipo: 'rect', t0: T.ab2 },
      { x: x0 + A + B / 2, y: y0 + B / 2, texto: 'b²', tipo: 'chico', t0: T.b2 }
    ],
    producto: '(a + b)²',
    renglon1: [
      { texto: `${NB}=${NB}a²`, t0: T.a2 },
      { texto: `${NB}+${NB}ab`, acento: true, t0: T.ab1 },
      { texto: `${NB}+${NB}ab`, acento: true, t0: T.ab2 },
      { texto: `${NB}+${NB}b²`, t0: T.b2 }
    ],
    renglon2: [
      { texto: `${NB}=${NB}a²${NB}+${NB}`, t0: T.junta },
      { texto: '2ab', acento: true, t0: T.junta },
      { texto: `${NB}+${NB}b²`, t0: T.junta }
    ],
    fin: T.junta + 1.2
  });
}

/* ---------------- (x + 2)(x + 5), con fichas ---------------- */
function casoComun(capa) {
  const { X, U, P, Q } = FICHAS;
  const w = X + Q * U, h = X + P * U;
  const x0 = (ANCHO - w) / 2, y0 = BASE - h;
  const T = { x2: 2.2, tiras5: 3.9, tiras2: 5.9, fichas: 7.7, junta: 10.0 };
  // Las fichas de un grupo entran una tras otra; su rótulo, cuando ya entró la última.
  const PASO = { tiras5: 0.22, tiras2: 0.3, fichas: 0.12 };
  const rotuloTras = (t0, n, paso) => t0 + (n - 1) * paso + 0.3;
  const piezas = [{ x: x0, y: BASE - X, w: X, h: X, tipo: 'grande', t0: T.x2 }];
  for (let i = 0; i < Q; i++) piezas.push({ x: x0 + X + i * U, y: BASE - X, w: U, h: X, tipo: 'rect', t0: T.tiras5 + i * PASO.tiras5 });
  for (let j = 0; j < P; j++) piezas.push({ x: x0, y: BASE - X - (j + 1) * U, w: X, h: U, tipo: 'rect', t0: T.tiras2 + j * PASO.tiras2 });
  for (let j = 0; j < P; j++) for (let i = 0; i < Q; i++) {
    piezas.push({ x: x0 + X + i * U, y: BASE - X - (j + 1) * U, w: U, h: U, tipo: 'chico', t0: T.fichas + (j * Q + i) * PASO.fichas });
  }
  return casoDePiezas(capa, {
    nombre: '(x + 2)(x + 5)',
    marco: { x0, y0, w, h },
    piezas,
    divisiones: `M${x0 + X} ${y0}V${BASE}M${x0} ${BASE - X}H${x0 + w}`,
    cotas: g => {
      cotaAbajo(g, x0, x0 + X, 'x'); cotaAbajo(g, x0 + X, x0 + w, String(Q), Q);
      cotaIzquierda(g, x0, BASE - X, BASE, 'x'); cotaIzquierda(g, x0, y0, BASE - X, String(P), P);
    },
    rotulos: [
      { x: x0 + X / 2, y: BASE - X / 2, texto: 'x²', tipo: 'grande', t0: T.x2 },
      { x: x0 + X + Q * U / 2, y: BASE - X / 2, texto: Q + 'x', tipo: 'rect', t0: rotuloTras(T.tiras5, Q, PASO.tiras5) },
      { x: x0 + X / 2, y: y0 + P * U / 2, texto: P + 'x', tipo: 'rect', t0: rotuloTras(T.tiras2, P, PASO.tiras2) },
      { x: x0 + X + Q * U / 2, y: y0 + P * U / 2, texto: String(P * Q), tipo: 'chico', t0: rotuloTras(T.fichas, P * Q, PASO.fichas) }
    ],
    producto: `(x${NB}+${NB}${P})(x${NB}+${NB}${Q})`,
    renglon1: [
      { texto: `${NB}=${NB}x²`, t0: T.x2 },
      { texto: `${NB}+${NB}${Q}x`, acento: true, t0: T.tiras5 },
      { texto: `${NB}+${NB}${P}x`, acento: true, t0: T.tiras2 },
      { texto: `${NB}+${NB}${P * Q}`, t0: T.fichas }
    ],
    renglon2: [
      { texto: `${NB}=${NB}x²${NB}+${NB}`, t0: T.junta },
      { texto: (P + Q) + 'x', acento: true, t0: T.junta },
      { texto: `${NB}+${NB}${P * Q}`, t0: T.junta }
    ],
    fin: T.junta + 1.2
  });
}

/* ---------------- (a + b)(a − b): cortar y reacomodar ---------------- */
// La tira de b por a − b sale de la derecha, sube hasta librar la otra pieza, gira un cuarto de
// vuelta mientras se va a la izquierda y baja hasta quedar encima, pegada a la orilla izquierda.
function trayectoria() {
  const { A, B } = CONJ;
  const x0 = (ANCHO - (A + B)) / 2;
  const fija = { x: x0, y: BASE - (A - B), w: A, h: A - B };        // la pieza que no se mueve
  const w = B, h = A - B;                                            // la tira, de pie
  const semidiagonal = Math.hypot(w, h) / 2;
  const inicio = { x: x0 + A + B / 2, y: BASE - (A - B) / 2 };
  const alto = fija.y - 8 - semidiagonal;                            // girando, no baja de la pieza fija
  const fin = { x: x0 + (A - B) / 2, y: BASE - A + B / 2 };
  return { x0, fija, w, h, inicio, alto, fin };
}

const TC = { corte: 1.4, sube: 2.8, gira: 3.9, baja: 5.8, hueco: 7.1, junta: 8.6 };
const DUR = { sube: 1.1, gira: 1.9, baja: 0.9 };

function poseTira(t, tr) {
  const s1 = suave((t - TC.sube) / DUR.sube), s2 = suave((t - TC.gira) / DUR.gira), s3 = suave((t - TC.baja) / DUR.baja);
  const x = tr.inicio.x + (tr.fin.x - tr.inicio.x) * s2;
  const y = tr.inicio.y + (tr.alto - tr.inicio.y) * s1 + (tr.fin.y - tr.alto) * s3;
  return { x, y, th: -90 * s2, w: tr.w, h: tr.h };
}

(function comprobarTrayectoria() {
  const tr = trayectoria();
  const final = poseTira(99, tr);
  if (Math.abs(final.x - tr.fin.x) > 0.01 || Math.abs(final.y - tr.fin.y) > 0.01) falla('la tira no llega a su lugar');
  for (let t = 0; t <= TC.baja + DUR.baja + 0.001; t += 0.01) {
    const g = poseTira(t, tr);
    if (enciman(g, tr.fija)) falla(`la tira atraviesa la otra pieza (t = ${t.toFixed(2)} s)`);
    const th = g.th * Math.PI / 180;
    const medioAlto = Math.abs(g.w / 2 * Math.sin(th)) + Math.abs(g.h / 2 * Math.cos(th));
    const medioAncho = Math.abs(g.w / 2 * Math.cos(th)) + Math.abs(g.h / 2 * Math.sin(th));
    if (g.y - medioAlto < HUECO_TECHO) falla('la tira sube hasta la cuenta');
    if (g.x - medioAncho < 0 || g.x + medioAncho > ANCHO) falla('la tira se sale a los lados');
  }
  // Al final, la tira acostada queda justo encima de la pieza fija, en su orilla izquierda.
  const { A, B } = CONJ;
  if (Math.abs(tr.fin.y + B / 2 - tr.fija.y) > 0.01 || Math.abs(tr.fin.x - (A - B) / 2 - tr.x0) > 0.01) falla('la tira no queda pegada');
})();

function casoConjugados(capa) {
  const { A, B } = CONJ;
  const tr = trayectoria();
  const { x0, fija } = tr;
  const hueco = { x: x0 + A - B, y: BASE - A, w: B, h: B };
  const cotas = make('g', {}, capa);
  const cotaA = cotaAbajo(cotas, x0, x0 + A, 'a');
  const cotaB = cotaAbajo(cotas, x0 + A, x0 + A + B, 'b');
  const cotaAltura = cotaIzquierda(cotas, x0, BASE - (A - B), BASE, `a${NB}${MENOS}${NB}b`);
  const cotaArriba = cotaIzquierda(cotas, x0, BASE - A, BASE - (A - B), 'b');
  const marcaHueco = make('g', {}, capa);
  make('rect', { x: hueco.x, y: hueco.y, width: hueco.w, height: hueco.h, class: 'pn__hueco' }, marcaHueco);
  const textoHueco = make('text', { x: hueco.x + B / 2, y: hueco.y + B / 2, class: 'pn__hueco-texto', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, marcaHueco);
  textoHueco.textContent = 'b²';
  const piezaFija = make('rect', { x: fija.x, y: fija.y, width: fija.w, height: fija.h, class: 'pn__pieza pn__pieza--grande pn__pieza--borde' }, capa);
  const corte = make('path', { d: `M${x0 + A} ${fija.y - 9}V${BASE + 4}`, class: 'pn__corte' }, capa);
  const tira = make('g', {}, capa);
  make('rect', { x: -tr.w / 2, y: -tr.h / 2, width: tr.w, height: tr.h, class: 'pn__pieza pn__pieza--rect pn__pieza--borde' }, tira);
  const resultado = rotulo(capa, fija.x + A / 2, fija.y + fija.h / 2, `a²${NB}${MENOS}${NB}b²`, 'grande');
  const pintaCuenta = cuenta(capa, `(a${NB}+${NB}b)(a${NB}${MENOS}${NB}b)`, [{ texto: `${NB}=${NB}a²${NB}${MENOS}${NB}b²`, t0: TC.junta }]);
  return {
    fin: TC.junta + 1.4,
    draw(t) {
      const a = aparece(t, 0.3);
      set(piezaFija, { opacity: a });
      set(cotas, { opacity: a });
      set(cotaB, { opacity: 1 - aparece(t, TC.sube, 0.4) });
      set(cotaAltura, { opacity: 1 });
      set(cotaA, { opacity: 1 });
      set(cotaArriba, { opacity: aparece(t, TC.hueco) });
      // La línea del corte aparece y se va cuando la tira se levanta.
      set(corte, { opacity: aparece(t, TC.corte) * (1 - aparece(t, TC.sube, 0.4)) });
      const g = poseTira(t, tr);
      set(tira, { transform: `translate(${r2(g.x)} ${r2(g.y)}) rotate(${r2(g.th)})`, opacity: a });
      set(marcaHueco, { opacity: aparece(t, TC.hueco) });
      set(resultado, { opacity: aparece(t, TC.junta) });
      pintaCuenta(t);
    }
  };
}

const CASOS = { cuadrado: casoCuadrado, comun: casoComun, conjugados: casoConjugados };

/* ---------------- La escena ---------------- */
function area(svg) {
  const root = svg.closest('[data-productos]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-productos-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const capa = make('g', {}, svg);
  let clave = null, caso = null, t = 0;

  function armar(nueva) {
    clave = nueva;
    capa.replaceChildren();
    caso = CASOS[clave](capa);
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : caso.fin;
    caso.draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  // La primera vez que se ve, se reproduce sola.
  elige(inicial ? inicial.dataset.caso : 'cuadrado', true);
  return {
    update(dt) { if (t < caso.fin) { t = Math.min(caso.fin, t + dt); caso.draw(t); } },
    still() { t = caso.fin; caso.draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { area };
const scenes = [...document.querySelectorAll('[data-escena-pn]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaPn](svg)
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
