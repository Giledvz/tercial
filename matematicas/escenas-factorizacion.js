/* Escenas de Factorización (Matemáticas, semana 6). Mismo contrato que las de Química,
   Matemáticas y Física: cada escena es { update(dt), still() }; el reloj compartido sólo avanza
   las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final.

   El modelo de área al revés. Cada ficha es un pedazo de área: el cuadro de x por x vale x²,
   la tira de x por 1 vale x y el cuadrito de 1 por 1 vale 1. Factorizar es acomodar las fichas
   de una expresión en un rectángulo: sus dos lados son los factores.
   - x² + 5x + 6: primero se prueban 4 tiras a la derecha y 1 abajo; la esquina que queda es de
     4 × 1 y no caben los 6 cuadritos. Con 3 y 2, la esquina es de 3 × 2 = 6 y el rectángulo
     cierra: (x + 2)(x + 3).
   - 2x² + 6x: cada x² va con tres tiras; salen dos filas iguales. El lado de 2x es lo que se
     repite, el factor común: 2x(x + 3).
   - x² + 6x + 9: las tiras van 3 y 3 y la esquina es de 3 × 3: sale un cuadrado, (x + 3)².
   - x² − 4: al cuadro de x por x se le quita uno de 2 por 2; el pedazo de abajo se corta, da
     vuelta y pasa a la derecha: (x + 2)(x − 2).
   La x mide 3.6 cuadritos (90 contra 25), a propósito: no es un número entero de cuadritos,
   porque x puede valer cualquier cosa. Todos los textos (la expresión, los lados y el resultado)
   salen de los factores de cada caso; al cargar se comprueba que las fichas finales llenan el
   rectángulo sin huecos ni encimarse y que sus cuentas dan la expresión. Que nada se atraviese
   mientras se mueve se revisó con un script que muestrea la animación cuadro por cuadro. */

const NS = 'http://www.w3.org/2000/svg';
const hayDOM = typeof document !== 'undefined';
const reducedMotion = hayDOM ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';

export const X = 90, U = 25, ANCHO = 440, ALTO = 300;

export const TIPOS = {
  x2: { w: X, h: X, nombre: 'x²' },
  x: { w: U, h: X, nombre: 'x' },
  u: { w: U, h: U, nombre: '1' },
  pieza: { nombre: '' },
  quita: { nombre: '' }
};

/* ---------------- Textos que salen de los factores ---------------- */
// Un factor [a, b] es a·x + b: [1, 3] es x + 3; [2, 0] es 2x; [1, −2] es x − 2.
export function lado([a, b]) {
  const izq = a === 0 ? '' : a === 1 ? 'x' : a + 'x';
  if (b === 0) return izq;
  if (!izq) return (b < 0 ? MENOS : '') + Math.abs(b);
  return izq + (b < 0 ? ' ' + MENOS + ' ' : ' + ') + Math.abs(b);
}
const SUP = ['', '', '²', '³'];
function polinomio(P) {
  let s = '';
  for (let g = P.length - 1; g >= 0; g--) {
    const c = P[g];
    if (!c) continue;
    const t = g === 0 ? String(Math.abs(c)) : (Math.abs(c) === 1 ? '' : Math.abs(c)) + 'x' + SUP[g];
    s += s === '' ? (c < 0 ? MENOS : '') + t : (c < 0 ? ' ' + MENOS + ' ' : ' + ') + t;
  }
  return s;
}
export function expande(f1, f2) { return [f1[1] * f2[1], f1[0] * f2[1] + f1[1] * f2[0], f1[0] * f2[0]]; }
// El producto escrito, en el orden dado: (x + 2)(x + 3), 2x(x + 3), (x + 3)².
function producto(escrito) {
  const [f, g] = escrito;
  const caja = h => (h[1] === 0 ? lado(h) : '(' + lado(h) + ')');
  if (f[0] === g[0] && f[1] === g[1]) return caja(f) + '²';
  return caja(f) + caja(g);
}

/* ---------------- Cuerpos que se mueven ----------------
   Un cuerpo son fichas que se mueven juntas (las tres tiras de abajo, los seis cuadritos):
   su pose es el centro, el ángulo y la opacidad, y cada ficha tiene su centro relativo al del
   cuerpo, sin girar. Un tramo lleva al cuerpo de su última pose a la nueva entre t0 y t1. */
function cuerpo(fichas, x, y, o = 1) {
  return { fichas, inicio: { x, y, a: 0, o }, tramos: [] };
}
function mueve(c, t0, t1, cambio) {
  const ultimo = c.tramos[c.tramos.length - 1];
  if (ultimo && t0 < ultimo.t1) throw new Error('fichas: dos tramos de un cuerpo se enciman');
  const de = ultimo ? ultimo.a : c.inicio;
  const a = {
    x: cambio.x !== undefined ? cambio.x : de.x + (cambio.dx || 0),
    y: cambio.y !== undefined ? cambio.y : de.y + (cambio.dy || 0),
    a: cambio.a !== undefined ? cambio.a : de.a,
    o: cambio.o !== undefined ? cambio.o : de.o
  };
  c.tramos.push({ t0, t1, de, a });
}
export function poseEn(c, t) {
  let p = c.inicio;
  for (const s of c.tramos) {
    if (t < s.t0) break;
    if (t <= s.t1) {
      const k = suave((t - s.t0) / (s.t1 - s.t0));
      return { x: s.de.x + (s.a.x - s.de.x) * k, y: s.de.y + (s.a.y - s.de.y) * k, a: s.de.a + (s.a.a - s.de.a) * k, o: s.de.o + (s.a.o - s.de.o) * k };
    }
    p = s.a;
  }
  return p;
}
// Centro de una ficha en el dibujo, con el giro del cuerpo.
export function mundo(p, f) {
  const r = p.a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [p.x + c * (f.dx || 0) - s * (f.dy || 0), p.y + s * (f.dx || 0) + c * (f.dy || 0)];
}
export function medida(f) {
  const t = TIPOS[f.tipo];
  return [f.w !== undefined ? f.w : t.w, f.h !== undefined ? f.h : t.h];
}

// Fichas sueltas: el cuadro de x², tiras de pie una junto a otra, cuadritos en filas.
const cuadro = (izq, arr) => cuerpo([{ tipo: 'x2' }], izq + X / 2, arr + X / 2);
function tiras(n, izq, arr) {
  return cuerpo(Array.from({ length: n }, (_, i) => ({ tipo: 'x', dx: (i - (n - 1) / 2) * U })), izq + n * U / 2, arr + X / 2);
}
function cuadritos(cols, filas, izq, arr) {
  const fichas = [];
  for (let r = 0; r < filas; r++) for (let k = 0; k < cols; k++) fichas.push({ tipo: 'u', dx: (k - (cols - 1) / 2) * U, dy: (r - (filas - 1) / 2) * U });
  return cuerpo(fichas, izq + cols * U / 2, arr + filas * U / 2);
}
// Las marcas de un lado: en cada x completa que sigue de algo más.
function cortes(f, desde, escala = 1) {
  const lista = [];
  for (let k = 1; k <= f[0]; k++) if (k < f[0] || f[1] > 0) lista.push(desde + k * X * escala);
  return lista;
}

// El rectángulo terminado se corre junto, sin girar, hasta el centro del dibujo.
const CENTRO = [160, 92];
function alCentro(cuerpos, [ax, ay], t0, t1) {
  cuerpos.forEach(c => mueve(c, t0, t1, { dx: CENTRO[0] - ax, dy: CENTRO[1] - ay }));
  return CENTRO;
}

/* ---------------- Los cuatro casos ---------------- */
function casoTrinomio() {
  const ax = 70, ay = 76, factores = { ancho: [1, 3], alto: [1, 2] };
  const c = cuadro(ax, ay);
  const t = [0, 1, 2, 3, 4].map(i => tiras(1, ax + X + 18 + i * U, ay));
  const unos = cuadritos(3, 2, ax + X + 18 + 5 * U + 18, ay);
  // Primer intento: cuatro tiras a la derecha del cuadro y una abajo.
  t.slice(0, 4).forEach(s => mueve(s, 0.9, 1.9, { dx: -18 }));
  mueve(t[4], 2.2, 3.0, { y: 216 });
  mueve(t[4], 3.2, 3.9, { a: 90 });
  mueve(t[4], 4.1, 5.2, { x: ax + X / 2, y: ay + X + U / 2 });
  // Una tira de la derecha pasa abajo: 3 y 2.
  mueve(t[3], 8.2, 9.1, { y: 216 });
  mueve(t[3], 9.3, 10.0, { a: 90 });
  mueve(t[3], 10.2, 11.3, { x: ax + X / 2, y: ay + X + 1.5 * U });
  // Los seis cuadritos, en su bloque de 3 × 2, llenan la esquina.
  mueve(unos, 12.4, 13.3, { y: ay + X + U });
  mueve(unos, 13.5, 14.9, { x: ax + X + 1.5 * U });
  const [cx, cy] = alCentro([c, ...t, unos], [ax, ay], 15.2, 16.2);
  return {
    factores, escrito: [[1, 2], [1, 3]], esquina: [cx, cy],
    cuerpos: [c, ...t, unos],
    ranuras: [
      { x: ax + X, y: ay + X, cols: 4, filas: 1, texto: '4 × 1 = 4', f: [5.5, 6.0, 7.8, 8.2] },
      { x: ax + X, y: ay + X, cols: 3, filas: 2, texto: '3 × 2 = 6', f: [11.5, 12.0, 13.6, 14.0] }
    ],
    cotas: [
      { lado: 'arriba', en: cy, a: cx, b: cx + X + 3 * U, cortes: cortes(factores.ancho, cx), texto: lado(factores.ancho), f: [16.4, 17.0] },
      { lado: 'izquierda', en: cx, a: cy, b: cy + X + 2 * U, cortes: cortes(factores.alto, cy), texto: lado(factores.alto), f: [16.4, 17.0] }
    ],
    resultado: [17.4, 18.0], fin: 18.8
  };
}

function casoComun() {
  const ax = 70, ay = 76, factores = { ancho: [1, 3], alto: [2, 0] };
  const c1 = cuadro(ax, ay);
  const c2 = cuadro(ax + X + 8, ay);
  const arriba = tiras(3, ax + 2 * X + 24, ay);
  const abajo = tiras(3, ax + 2 * X + 24 + 3 * U, ay);
  // Cada x² va con tres tiras: dos filas iguales.
  mueve(c2, 0.9, 1.8, { dy: X });
  mueve(c2, 2.0, 2.9, { x: ax + X / 2 });
  mueve(arriba, 3.1, 4.2, { x: ax + X + 1.5 * U });
  mueve(abajo, 4.4, 5.3, { dy: X });
  mueve(abajo, 5.5, 6.7, { x: ax + X + 1.5 * U });
  const [cx, cy] = alCentro([c1, c2, arriba, abajo], [ax, ay], 7.0, 8.0);
  return {
    factores, escrito: [[2, 0], [1, 3]], esquina: [cx, cy],
    cuerpos: [c1, c2, arriba, abajo],
    ranuras: [],
    cotas: [
      { lado: 'arriba', en: cy, a: cx, b: cx + X + 3 * U, cortes: cortes(factores.ancho, cx), texto: lado(factores.ancho), f: [8.2, 8.8] },
      { lado: 'izquierda', en: cx, a: cy, b: cy + 2 * X, cortes: cortes(factores.alto, cy), texto: lado(factores.alto), f: [8.2, 8.8] }
    ],
    resultado: [9.2, 9.8], fin: 10.6
  };
}

function casoCuadrado() {
  const ax = 70, ay = 76, factores = { ancho: [1, 3], alto: [1, 3] };
  const c = cuadro(ax, ay);
  const derecha = tiras(3, ax + X + 16, ay);
  const abajo = tiras(3, ax + X + 16 + 3 * U, ay);
  const unos = cuadritos(3, 3, ax + X + 16 + 6 * U + 16, ay);
  // Tres tiras a la derecha; las otras tres se acuestan juntas y pasan abajo.
  mueve(derecha, 0.9, 1.9, { dx: -16 });
  mueve(abajo, 2.2, 3.2, { y: 226 });
  mueve(abajo, 3.4, 4.3, { a: 90 });
  mueve(abajo, 4.5, 5.7, { x: ax + X / 2, y: ay + X + 1.5 * U });
  // La esquina de 3 × 3 se llena con los 9 cuadritos.
  mueve(unos, 7.2, 8.2, { y: ay + X + 1.5 * U });
  mueve(unos, 8.4, 9.8, { x: ax + X + 1.5 * U });
  const [cx, cy] = alCentro([c, derecha, abajo, unos], [ax, ay], 10.1, 11.1);
  return {
    factores, escrito: [[1, 3], [1, 3]], esquina: [cx, cy],
    cuerpos: [c, derecha, abajo, unos],
    ranuras: [{ x: ax + X, y: ay + X, cols: 3, filas: 3, texto: '3 × 3 = 9', f: [6.0, 6.5, 8.6, 9.0] }],
    cotas: [
      { lado: 'arriba', en: cy, a: cx, b: cx + X + 3 * U, cortes: cortes(factores.ancho, cx), texto: lado(factores.ancho), f: [11.3, 11.9] },
      { lado: 'izquierda', en: cx, a: cy, b: cy + X + 3 * U, cortes: cortes(factores.alto, cy), texto: lado(factores.alto), f: [11.3, 11.9] }
    ],
    resultado: [12.3, 12.9], fin: 13.7
  };
}

function casoDiferencia() {
  const sx = 150, sy = 110, factores = { ancho: [1, 2], alto: [1, -2] };
  const alto = X - 2 * U;                                     // x − 2
  // El cuadro entero; al cortarlo, sus tres pedazos ocupan el mismo lugar.
  const entero = cuerpo([{ tipo: 'x2', nx: -18, ny: -18 }], sx + X / 2, sy + X / 2);
  const p1 = cuerpo([{ tipo: 'pieza', w: X, h: alto }], sx + X / 2, sy + alto / 2, 0);
  const p2 = cuerpo([{ tipo: 'pieza', w: alto, h: 2 * U }], sx + alto / 2, sy + X - U, 0);
  const q = cuerpo([{ tipo: 'quita', w: 2 * U, h: 2 * U, nombre: '4' }], sx + X - U, sy + X - U, 0);
  mueve(q, 0.9, 1.4, { o: 1 });                                // se marca el cuadro de 2 × 2
  mueve(entero, 2.0, 2.3, { o: 0 });                           // el cuadro queda en tres pedazos
  mueve(p1, 2.0, 2.3, { o: 1 });
  mueve(p2, 2.0, 2.3, { o: 1 });
  mueve(q, 2.8, 3.8, { dx: 60, dy: 70, o: 0 });                // se quita
  mueve(p2, 4.4, 5.4, { dx: 100 });                            // el pedazo de abajo sale a la derecha,
  mueve(p2, 5.6, 6.4, { a: 90 });                              // da vuelta
  mueve(p2, 6.6, 7.6, { x: sx + X + U, y: sy + alto / 2 });    // y se pega al otro
  return {
    factores, escrito: [[1, 2], [1, -2]], esquina: [sx, sy], sinFichas: true,
    cuerpos: [entero, p1, p2, q],
    mismaPieza: [[entero, p1], [entero, p2], [entero, q]],
    ranuras: [],
    cotas: [
      { lado: 'arriba', en: sy, a: sx, b: sx + X, cortes: [], texto: 'x', f: [-1, 0, 4.4, 4.8] },
      { lado: 'izquierda', en: sx, a: sy, b: sy + X, cortes: [], texto: 'x', f: [-1, 0, 4.4, 4.8] },
      { lado: 'derecha', en: sx + X, a: sy + alto, b: sy + X, cortes: [], texto: '2', f: [0.9, 1.4, 2.4, 2.7] },
      { lado: 'abajo', en: sy + X, a: sx + alto, b: sx + X, cortes: [], texto: '2', f: [0.9, 1.4, 2.4, 2.7] },
      { lado: 'arriba', en: sy, a: sx, b: sx + X + 2 * U, cortes: cortes(factores.ancho, sx), texto: lado(factores.ancho), f: [8.0, 8.6] },
      { lado: 'izquierda', en: sx, a: sy, b: sy + alto, cortes: cortes(factores.alto, sy), texto: lado(factores.alto), f: [8.0, 8.6] }
    ],
    resultado: [9.0, 9.6], fin: 10.4
  };
}

export const CASOS = {
  trinomio: casoTrinomio(),
  comun: casoComun(),
  cuadrado: casoCuadrado(),
  diferencia: casoDiferencia()
};

/* ---------------- Comprobaciones al cargar ----------------
   Al final, las fichas que se ven llenan el rectángulo de lados ancho × alto sin huecos ni
   encimarse, y cuentan lo que dice la expresión: tantos x², tantas x y tantos 1. */
export function cajaFinal(c, f) {
  const p = poseEn(c, Infinity);
  const [x, y] = mundo(p, f);
  let [w, h] = medida(f);
  if (Math.round(p.a / 90) % 2) [w, h] = [h, w];
  return { x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, o: p.o };
}
const cerca = (a, b) => Math.abs(a - b) < 1e-6;
for (const [clave, caso] of Object.entries(CASOS)) {
  const { ancho, alto } = caso.factores;
  const w = ancho[0] * X + ancho[1] * U, h = alto[0] * X + alto[1] * U;
  const [ex, ey] = caso.esquina;
  const cajas = [];
  const cuenta = { x2: 0, x: 0, u: 0 };
  caso.cuerpos.forEach(c => c.fichas.forEach(f => {
    const k = cajaFinal(c, f);
    if (k.o < 0.5) return;
    cajas.push(k);
    if (cuenta[f.tipo] !== undefined) cuenta[f.tipo]++;
  }));
  let area = 0;
  cajas.forEach((k, i) => {
    area += (k.x1 - k.x0) * (k.y1 - k.y0);
    if (k.x0 < ex - 1e-6 || k.y0 < ey - 1e-6 || k.x1 > ex + w + 1e-6 || k.y1 > ey + h + 1e-6) throw new Error(`fichas: en ${clave} una ficha queda fuera del rectángulo`);
    cajas.slice(i + 1).forEach(o => {
      if (Math.min(k.x1, o.x1) - Math.max(k.x0, o.x0) > 1e-6 && Math.min(k.y1, o.y1) - Math.max(k.y0, o.y0) > 1e-6) throw new Error(`fichas: en ${clave} dos fichas se enciman al final`);
    });
  });
  if (!cerca(area, w * h)) throw new Error(`fichas: en ${clave} las fichas no llenan el rectángulo`);
  const P = expande(ancho, alto);
  if (!caso.sinFichas && (cuenta.u !== P[0] || cuenta.x !== P[1] || cuenta.x2 !== P[2])) throw new Error(`fichas: en ${clave} las fichas no son ${polinomio(P)}`);
  if (caso.sinFichas && !cerca(area, P[2] * X * X + P[1] * X * U + P[0] * U * U)) throw new Error(`fichas: en ${clave} el área no es ${polinomio(P)}`);
  const e = caso.escrito.map(f => f.join(',')).sort().join('|');
  if (e !== [ancho, alto].map(f => f.join(',')).sort().join('|')) throw new Error(`fichas: en ${clave} el resultado escrito no son los lados`);
  caso.expresion = polinomio(P);
  caso.textoResultado = producto(caso.escrito);
}

/* ---------------- El dibujo ---------------- */
function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}
function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}
// Aparece entre f[0] y f[1]; si trae f[2] y f[3], se va entre ellos.
function opacidad(f, t) {
  if (!f) return 1;
  const entra = f[1] > f[0] ? clamp((t - f[0]) / (f[1] - f[0])) : (t >= f[1] ? 1 : 0);
  const sale = f.length > 2 ? 1 - clamp((t - f[2]) / (f[3] - f[2])) : 1;
  return suave(entra) * suave(sale);
}

function fichas(svg) {
  const root = svg.closest('[data-fichas]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-fichas-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const capaRanuras = make('g', {}, svg);
  const capaFichas = make('g', {}, svg);
  const capaNombres = make('g', {}, svg);
  const capaCotas = make('g', {}, svg);
  const ecuacion = make('text', { x: 24, y: 34, class: 'fichas__ecuacion' }, svg);

  let clave = null, caso = null, t = 0, nodos = null;

  function dibujaRanura(r) {
    const g = make('g', { class: 'fichas__ranura', opacity: 0 }, capaRanuras);
    const w = r.cols * U, h = r.filas * U;
    let d = '';
    for (let k = 1; k < r.cols; k++) d += `M${r2(r.x + k * U)} ${r.y}V${r.y + h}`;
    for (let k = 1; k < r.filas; k++) d += `M${r.x} ${r2(r.y + k * U)}H${r.x + w}`;
    if (d) make('path', { d, class: 'fichas__celdas' }, g);
    make('rect', { x: r.x, y: r.y, width: w, height: h, class: 'fichas__hueco' }, g);
    // Una placa del color de la página: las líneas de las celdas no cruzan la cuenta.
    const placa = [...r.texto].length * 6.9 + 6;
    make('rect', { x: r.x + w / 2 - placa / 2, y: r.y + h / 2 - 8, width: placa, height: 16, class: 'fichas__placa' }, g);
    const texto = make('text', { x: r.x + w / 2, y: r.y + h / 2, class: 'fichas__cuenta', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
    texto.textContent = r.texto;
    return { g, f: r.f };
  }

  function dibujaCota(c) {
    const g = make('g', { class: 'fichas__cota', opacity: 0 }, capaCotas);
    let d = '', tx, ty, ancla = 'middle', base = 'auto';
    if (c.lado === 'arriba' || c.lado === 'abajo') {
      const y = c.lado === 'arriba' ? c.en - 10 : c.en + 10;
      d = `M${c.a} ${y}H${c.b}`;
      [c.a, c.b].forEach(x => { d += `M${r2(x)} ${y - 4}V${y + 4}`; });
      // Las marcas de en medio, sólo del lado del rectángulo: no se leen como un signo junto al texto.
      c.cortes.forEach(x => { d += c.lado === 'arriba' ? `M${r2(x)} ${y}V${y + 4}` : `M${r2(x)} ${y - 4}V${y}`; });
      tx = (c.a + c.b) / 2;
      ty = c.lado === 'arriba' ? y - 8 : y + 19;
    } else {
      const x = c.lado === 'izquierda' ? c.en - 10 : c.en + 10;
      d = `M${x} ${c.a}V${c.b}`;
      [c.a, c.b].forEach(y => { d += `M${x - 4} ${r2(y)}H${x + 4}`; });
      c.cortes.forEach(y => { d += c.lado === 'izquierda' ? `M${x} ${r2(y)}H${x + 4}` : `M${x - 4} ${r2(y)}H${x}`; });
      tx = c.lado === 'izquierda' ? x - 8 : x + 8;
      ty = (c.a + c.b) / 2;
      ancla = c.lado === 'izquierda' ? 'end' : 'start';
      base = 'central';
    }
    make('path', { d, class: 'fichas__cota-linea' }, g);
    const texto = make('text', { x: tx, y: ty, class: 'fichas__cota-texto', 'text-anchor': ancla, 'dominant-baseline': base }, g);
    texto.textContent = c.texto;
    return { g, f: c.f };
  }

  function armar(nueva) {
    clave = nueva;
    caso = CASOS[clave];
    capaRanuras.innerHTML = '';
    capaFichas.innerHTML = '';
    capaNombres.innerHTML = '';
    capaCotas.innerHTML = '';
    nodos = { fichas: [], ranuras: caso.ranuras.map(dibujaRanura), cotas: caso.cotas.map(dibujaCota) };
    caso.cuerpos.forEach(c => c.fichas.forEach(f => {
      const [w, h] = medida(f);
      const g = make('g', { class: 'ficha ficha--' + f.tipo }, capaFichas);
      make('rect', { x: -w / 2, y: -h / 2, width: w, height: h }, g);
      const nombre = f.nombre !== undefined ? f.nombre : TIPOS[f.tipo].nombre;
      let texto = null;
      if (nombre) {
        texto = make('text', { class: 'ficha__nombre ficha__nombre--' + f.tipo, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, capaNombres);
        texto.textContent = nombre;
      }
      nodos.fichas.push({ c, f, g, texto });
    }));
    ecuacion.innerHTML = '';
    const base = make('tspan', {}, ecuacion);
    base.textContent = caso.expresion;
    nodos.resultado = make('tspan', { class: 'fichas__resultado' }, ecuacion);
    nodos.resultado.textContent = ' = ' + caso.textoResultado;
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    nodos.fichas.forEach(n => {
      const p = poseEn(n.c, tiempo);
      const [x, y] = mundo(p, n.f);
      set(n.g, { transform: `translate(${r2(x)} ${r2(y)}) rotate(${r2(p.a)})`, opacity: r2(p.o) });
      n.g.style.display = p.o < 0.005 ? 'none' : '';
      if (n.texto) {
        set(n.texto, { x: x + (n.f.nx || 0), y: y + (n.f.ny || 0), opacity: r2(p.o) });
        n.texto.style.display = p.o < 0.005 ? 'none' : '';
      }
    });
    [...nodos.ranuras, ...nodos.cotas].forEach(n => {
      const o = opacidad(n.f, tiempo);
      set(n.g, { opacity: r2(o) });
      n.g.style.display = o < 0.005 ? 'none' : '';
    });
    nodos.resultado.setAttribute('opacity', r2(opacidad(caso.resultado, tiempo)));
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : caso.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  // La primera vez que se ve, se reproduce sola.
  elige(inicial ? inicial.dataset.caso : 'trinomio', true);
  return {
    update(dt) { if (t < caso.fin) { t += dt; draw(t); } },
    still() { t = caso.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
if (hayDOM) {
  // Esta lección no carga escenas-matematicas.js: sólo atiende las escenas que conoce.
  const factories = { fichas };
  const scenes = [...document.querySelectorAll('[data-escena-mate]')]
    .filter(svg => factories[svg.dataset.escenaMate])
    .map(svg => ({ svg, visible: false, ...factories[svg.dataset.escenaMate](svg) }));
  let frame = 0, previous = 0;

  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const tick = timestamp => {
    frame = 0;
    if (document.hidden || reducedMotion.matches) return;
    const dt = previous ? Math.min((timestamp - previous) / 1000, 1 / 20) : 0;
    previous = timestamp;
    if (dt > 0) for (const scene of scenes) if (scene.visible) scene.update(dt);
    schedule();
  };
  const schedule = () => {
    if (frame || document.hidden || reducedMotion.matches) return;
    if (!scenes.some(scene => scene.visible)) { previous = 0; return; }
    frame = requestAnimationFrame(tick);
  };
  const applyPreference = () => {
    stop();
    for (const scene of scenes) {
      scene.svg.toggleAttribute('data-quieta', reducedMotion.matches);
      if (reducedMotion.matches) scene.still();
      else scene.update(0);
    }
    schedule();
  };
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
}
