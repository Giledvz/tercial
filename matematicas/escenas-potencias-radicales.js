/* Escenas de Potencias y radicales (Fundamentos · semana 3 · Matemáticas). Mismo contrato
   que escenas-matematicas.js: cada escena es { update(dt), still() }; el reloj compartido sólo
   avanza las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final. Al
   llegar a la tele (tercial:diapositiva) y con «Repetir», vuelve a empezar.

   Las dos escenas comparten el viewBox (400 × 250) y la ecuación arriba a la izquierda
   (x 24, línea base 38). Lo que se mueve lo hace por transform o por d, nunca se cruza con
   otra pieza, y cada caso se comprueba al cargar (debajo de cada tabla de posiciones). */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
// Avance suave de un tramo de la animación: 0 antes de t0, 1 después de t1.
const tramo = (t, t0, t1) => suave((t - t0) / (t1 - t0));

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

function falla(condicion, mensaje) { if (condicion) throw new Error('escenas-potencias: ' + mensaje); }

/* ---------- Texto con exponentes ----------
   partes: [{ t: '2' }, { t: '3', sup: true }, { t: ' = 8', g: 'res' }]. Un exponente sube con
   dy y la parte siguiente baja lo mismo. Cada parte puede pertenecer a un grupo (g) que
   aparece a su tiempo: grupo(nombre, opacidad) se la pone a todas sus partes. */
const ECUACION = { x: 24, y: 38 };
function escribe(capa, x, y, partes, { clase = 'pot-ecuacion', sube = 9, ancla = 'start' } = {}) {
  const texto = make('text', { x, y, class: clase, 'text-anchor': ancla }, capa);
  const grupos = {};
  let arriba = false;
  for (const p of partes) {
    const attrs = {};
    if (p.sup && !arriba) attrs.dy = -sube;
    if (!p.sup && arriba) attrs.dy = sube;
    arriba = !!p.sup;
    const clases = [p.sup ? 'pot-sup' : '', p.clase || ''].filter(Boolean).join(' ');
    if (clases) attrs.class = clases;
    const s = make('tspan', attrs, texto);
    s.textContent = p.t;
    if (p.g) (grupos[p.g] = grupos[p.g] || []).push(s);
  }
  return {
    texto,
    grupo(nombre, opacidad) { (grupos[nombre] || []).forEach(s => s.setAttribute('opacity', r2(opacidad))); }
  };
}
const ecuacion = (capa, partes) => escribe(capa, ECUACION.x, ECUACION.y, partes);

/* ---------- Piezas ---------- */
// Un cuadrito de lado c con su número; pon(x, y) recibe su esquina de arriba a la izquierda.
function cuadrito(capa, c, numero, chico = false) {
  const g = make('g', { class: 'pot-cuadrito' }, capa);
  make('rect', { x: 0, y: 0, width: c, height: c, class: 'pot-cuadrito__cuadro' }, g);
  const n = make('text', { x: c / 2, y: c / 2, class: 'pot-cuadrito__num' + (chico ? ' pot-cuadrito__num--chico' : ''), 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
  n.textContent = numero;
  return {
    // Aparece creciendo desde su centro (de 60 % a su tamaño) mientras se vuelve opaco.
    pon(x, y, aparece = 1) {
      const s = 0.6 + 0.4 * aparece;
      set(g, { transform: `translate(${r2(x + c / 2)} ${r2(y + c / 2)}) scale(${r2(s)}) translate(${-c / 2} ${-c / 2})`, opacity: r2(aparece) });
    }
  };
}

// Una cota: línea con remates perpendiculares y su número. (x1, y1) → (x2, y2).
function cota(capa, x1, y1, x2, y2, etiqueta, lx, ly) {
  const g = make('g', { class: 'pot-cota', opacity: 0 }, capa);
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l * 4, ny = dx / l * 4;
  make('path', { d: `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}M${r2(x1 + nx)} ${r2(y1 + ny)}L${r2(x1 - nx)} ${r2(y1 - ny)}M${r2(x2 + nx)} ${r2(y2 + ny)}L${r2(x2 - nx)} ${r2(y2 - ny)}`, class: 'pot-cota__linea' }, g);
  const t = make('text', { x: lx, y: ly, class: 'pot-cota__num', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
  t.textContent = etiqueta;
  return g;
}

// ¿Se enciman dos cuadros (x, y, lado)? Tocarse por un borde no cuenta.
const enciman = (a, b, c) => Math.min(a.x, b.x) + c - Math.max(a.x, b.x) > 0.5 && Math.min(a.y, b.y) + c - Math.max(a.y, b.y) > 0.5;

/* ================= Escena 1 · Cuadrados, cubos y raíces ================= */

/* 3²: cuadritos de 50; el cuadrado de 3 × 3 va centrado, de x 125 a 275 y de y 59 a 209.
   Primero una fila de 3 (un factor 3) y luego tres filas iguales (el otro factor 3). */
const C3 = 50, X3 = 125, Y3 = 209;
// Centrado, bajo la ecuación (que llega hasta y ≈ 44) y con su cota (hasta y ≈ 245) dentro del dibujo.
falla(X3 + 1.5 * C3 !== 200 || Y3 - 3 * C3 < 52 || Y3 + 37 > 250, 'el cuadrado de 3 × 3 no cabe');

function cuadrado(capa) {
  const ec = ecuacion(capa, [{ t: '3' }, { t: '2', sup: true }, { t: ' = ' }, { t: '3', g: 'f1' }, { t: ' × 3', g: 'f2' },
    { t: ' = 9', g: 'res', clase: 'pot-resultado' }]);
  const abajo = cota(capa, X3, Y3 + 12, X3 + 3 * C3, Y3 + 12, '3', X3 + 1.5 * C3, Y3 + 27);
  const izquierda = cota(capa, X3 - 12, Y3, X3 - 12, Y3 - 3 * C3, '3', X3 - 27, Y3 - 1.5 * C3);
  const celdas = [];
  for (let f = 0; f < 3; f++) for (let k = 0; k < 3; k++) {
    // Fila de abajo: cada cuadrito por su lado. Las otras dos filas llegan enteras.
    const t0 = f === 0 ? 0.6 + 0.45 * k : (f === 1 ? 2.9 : 3.7) + 0.08 * k;
    celdas.push({ c: cuadrito(capa, C3, 3 * f + k + 1), x: X3 + C3 * k, y: Y3 - C3 * (f + 1), t0 });
  }
  return {
    fin: 6.4,
    draw(t) {
      celdas.forEach(p => p.c.pon(p.x, p.y, tramo(t, p.t0, p.t0 + 0.4)));
      const a = tramo(t, 2.0, 2.5), b = tramo(t, 4.6, 5.1);
      abajo.setAttribute('opacity', r2(a)); ec.grupo('f1', a);
      izquierda.setAttribute('opacity', r2(b)); ec.grupo('f2', b);
      ec.grupo('res', tramo(t, 5.5, 6.0));
    }
  };
}

/* 2³: cubitos de 38 de arista en isométrico. x crece hacia la derecha y abajo, y hacia la
   izquierda y abajo, z hacia arriba; el vértice (0, 0, 0) del bloque queda en (236, 142).
   Se ven las caras de arriba, +x (derecha) y +y (izquierda). Se dibujan de atrás hacia
   adelante (x + y + z creciente): en isométrico ese orden es exacto para cubos de una rejilla,
   y la capa que baja lo hace por sus propias columnas, siempre encima de la de abajo.
   Primero la fila de adelante (un factor 2), luego la de atrás (2 × 2 = 4) y al final la capa
   de arriba, que baja medio cubo hasta asentarse (2 × 2 × 2 = 8). */
const E = 38, CX = 236, CY = 142, COS30 = Math.cos(Math.PI / 6);
const iso = (x, y, z) => [CX + (x - y) * E * COS30, CY + (x + y) * E * 0.5 - z * E];
const CUBOS = [
  // posición, cuándo empieza a llegar y desde qué altura baja (en aristas)
  { p: [0, 0, 0], t0: 2.8, baja: 0.35 }, { p: [1, 0, 0], t0: 2.8, baja: 0.35 },
  { p: [0, 1, 0], t0: 0.6, baja: 0.35 }, { p: [0, 0, 1], t0: 4.7, baja: 0.5 },
  { p: [1, 1, 0], t0: 1.15, baja: 0.35 }, { p: [1, 0, 1], t0: 4.7, baja: 0.5 },
  { p: [0, 1, 1], t0: 4.7, baja: 0.5 }, { p: [1, 1, 1], t0: 4.7, baja: 0.5 }
];
CUBOS.forEach((c, i) => {
  const s = c.p[0] + c.p[1] + c.p[2];
  falla(i > 0 && s < CUBOS[i - 1].p.reduce((a, b) => a + b, 0), 'los cubos no van de atrás hacia adelante');
  // Ni en su punto más alto un cubo invade la ecuación (que llega hasta y ≈ 44)…
  falla(iso(c.p[0], c.p[1], c.p[2] + 1 + c.baja)[1] < 46, 'un cubo tapa la ecuación');
});
// …ni el bloque se sale por abajo con sus cotas.
falla(iso(2, 2, 0)[1] + 30 > 250, 'el cubo no cabe con sus cotas');

function cubo(capa) {
  const ec = ecuacion(capa, [{ t: '2' }, { t: '3', sup: true }, { t: ' = ' }, { t: '2', g: 'f1' }, { t: ' × 2', g: 'f2' },
    { t: ' × 2', g: 'f3' }, { t: ' = 8', g: 'res', clase: 'pot-resultado' }]);
  const pt = (x, y, z) => iso(x, y, z).map(r2).join(' ');
  const piezas = CUBOS.map(c => {
    const g = make('g', { class: 'pot-cubo' }, capa);
    return {
      ...c, g,
      arriba: make('path', { class: 'pot-cubo__arriba' }, g),
      izq: make('path', { class: 'pot-cubo__izq' }, g),
      der: make('path', { class: 'pot-cubo__der' }, g)
    };
  });
  // Cotas sobre las aristas de abajo y la vertical de la izquierda, 8 hacia afuera del bloque.
  const [ax, ay] = iso(0, 2, 0), [bx, by] = iso(2, 2, 0), [dx, dy] = iso(2, 0, 0), [, ty] = iso(0, 2, 2);
  const cotaX = cota(capa, ax - 4, ay + 6.93, bx - 4, by + 6.93, '2', (ax + bx) / 2 - 12, (ay + by) / 2 + 21);
  const cotaY = cota(capa, bx + 4, by + 6.93, dx + 4, dy + 6.93, '2', (bx + dx) / 2 + 12, (by + dy) / 2 + 21);
  const cotaZ = cota(capa, ax - 10, ay, ax - 10, ty, '2', ax - 25, (ay + ty) / 2);
  return {
    fin: 7.8,
    draw(t) {
      for (const c of piezas) {
        const dur = c.p[2] ? 0.9 : 0.55;
        const a = tramo(t, c.t0, c.t0 + dur);
        const [x, y] = c.p, z = c.p[2] + c.baja * (1 - a);
        set(c.g, { opacity: r2(clamp((t - c.t0) / (dur * 0.5))) });
        set(c.arriba, { d: `M${pt(x, y, z + 1)}L${pt(x + 1, y, z + 1)}L${pt(x + 1, y + 1, z + 1)}L${pt(x, y + 1, z + 1)}Z` });
        set(c.der, { d: `M${pt(x + 1, y, z)}L${pt(x + 1, y + 1, z)}L${pt(x + 1, y + 1, z + 1)}L${pt(x + 1, y, z + 1)}Z` });
        set(c.izq, { d: `M${pt(x, y + 1, z)}L${pt(x + 1, y + 1, z)}L${pt(x + 1, y + 1, z + 1)}L${pt(x, y + 1, z + 1)}Z` });
      }
      const f1 = tramo(t, 1.9, 2.4), f2 = tramo(t, 3.8, 4.3), f3 = tramo(t, 6.0, 6.5);
      cotaX.setAttribute('opacity', r2(f1)); ec.grupo('f1', f1);
      cotaY.setAttribute('opacity', r2(f2)); ec.grupo('f2', f2);
      cotaZ.setAttribute('opacity', r2(f3)); ec.grupo('f3', f3);
      ec.grupo('res', tramo(t, 6.9, 7.4));
    }
  };
}

/* √16: 16 cuadritos de 32 en dos filas de 8 (x 72 a 328; abajo del 1 al 8, arriba del 9 al
   16) se acomodan en un cuadrado de 4 × 4 centrado (x 136 a 264, y 81 a 209):
   1. el 13–16 sube dos lugares por sus propias columnas;
   2. el 9–12 y el 5–8 suben uno (el 5–8 entra donde estaba el 13–16, que ya se fue);
   3. cada fila se corre 64 por su propio renglón, dos a la derecha y dos a la izquierda.
   El lado del cuadrado es la raíz. Al cargar se revisa, cuadro por cuadro, que ninguno se
   encime con otro. */
const C4 = 32, XR = 72, YR = 177, XQ = 136;
const SUBE1 = [2.2, 3.2], SUBE2 = [3.4, 4.3], CORRE = [4.6, 6.0];
const RAIZ = Array.from({ length: 16 }, (_, k) => {
  const arriba = k >= 8, col = arriba ? k - 8 : k, fila = Math.floor(k / 4);
  return { k, x0: XR + C4 * col, y0: arriba ? YR - C4 : YR, xf: XQ + C4 * (k % 4), yf: YR - C4 * fila };
});
function posicionRaiz(p, t) {
  const sube = p.k >= 12 ? tramo(t, SUBE1[0], SUBE1[1]) : tramo(t, SUBE2[0], SUBE2[1]);
  return { x: p.x0 + (p.xf - p.x0) * tramo(t, CORRE[0], CORRE[1]), y: p.y0 + (p.yf - p.y0) * sube };
}
falla(XQ + 2 * C4 !== 200 || XR + 4 * C4 !== 200, 'la fila o el cuadrado no quedan centrados');
falla(YR - 3 * C4 < 52 || YR + C4 + 37 > 250, 'el cuadrado de 4 × 4 no cabe con su cota');
falla(new Set(RAIZ.map(p => `${p.xf},${p.yf}`)).size !== 16, 'dos cuadritos llegan al mismo lugar');
for (let t = 0; t <= CORRE[1] + 0.01; t += 0.05) {
  const pos = RAIZ.map(p => posicionRaiz(p, t));
  for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) falla(enciman(pos[i], pos[j], C4), `los cuadritos ${i + 1} y ${j + 1} se enciman en t = ${t.toFixed(2)}`);
}

function raiz(capa) {
  const ec = ecuacion(capa, [{ t: '√16 = ' }, { t: '?', clase: 'pot-pregunta' }]);
  const respuesta = ec.texto.lastChild;
  const lado = cota(capa, XQ, YR + C4 + 12, XQ + 4 * C4, YR + C4 + 12, '4', XQ + 2 * C4, YR + C4 + 28);
  const piezas = RAIZ.map(p => ({ ...p, c: cuadrito(capa, C4, p.k + 1, true), t0: 0.5 + 0.07 * p.k }));
  return {
    fin: 7.8,
    draw(t) {
      for (const p of piezas) {
        const { x, y } = posicionRaiz(p, t);
        p.c.pon(x, y, tramo(t, p.t0, p.t0 + 0.3));
      }
      lado.setAttribute('opacity', r2(tramo(t, 6.3, 6.8)));
      // El «?» se apaga y en su lugar aparece el 4: primero uno y luego el otro, nunca juntos.
      const cambia = t >= 7.0;
      respuesta.textContent = cambia ? '4' : '?';
      respuesta.setAttribute('class', cambia ? 'pot-resultado' : 'pot-pregunta');
      respuesta.setAttribute('opacity', r2(cambia ? tramo(t, 7.0, 7.4) : 1 - tramo(t, 6.7, 7.0)));
    }
  };
}

/* ================= Escena 2 · Las leyes, contando factores ================= */

/* Fichas de 38 × 46 con un 2; de una a la siguiente hay 58 (un hueco de 20 con su «×»).
   En una fila sola, las fichas van de y 76 a 122, el corchete abajo (132 a 138) y sus
   etiquetas en 166 y 190. En una fracción, el numerador va de y 62 a 108, la raya en 120 y el
   denominador de 132 a 178; lo que queda se cuenta en 214. */
const W = 38, H = 46, PASO = 58, HUECO = 70, YFILA = 76, YNUM = 62, YRAYA = 120, YDEN = 132;
const anchoDe = n => n * W + (n - 1) * (PASO - W);

function ficha(capa) {
  const g = make('g', { class: 'pot-ficha' }, capa);
  // El cuerpo se apaga al cancelarse; la raya encima se queda con toda su fuerza.
  const cuerpo = make('g', {}, g);
  make('rect', { x: 0, y: 0, width: W, height: H, rx: 5, class: 'pot-ficha__cuadro' }, cuerpo);
  const n = make('text', { x: W / 2, y: H / 2, class: 'pot-ficha__num', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, cuerpo);
  n.textContent = '2';
  // La raya con que se cancela: se traza de abajo a la izquierda hacia arriba a la derecha.
  const raya = make('path', { class: 'pot-ficha__raya' }, g);
  return {
    pon(x, y, aparece = 1, apagada = 0) {
      const s = 0.7 + 0.3 * aparece;
      set(g, { transform: `translate(${r2(x + W / 2)} ${r2(y + H / 2)}) scale(${r2(s)}) translate(${-W / 2} ${-H / 2})`, opacity: r2(aparece) });
      cuerpo.setAttribute('opacity', r2(1 - 0.68 * apagada));
    },
    tacha(p) {
      if (p <= 0) { raya.setAttribute('d', 'M0 0'); return; }
      const x1 = -4, y1 = H + 4, x2 = W + 4, y2 = -4;
      raya.setAttribute('d', `M${x1} ${y1}L${r2(x1 + (x2 - x1) * p)} ${r2(y1 + (y2 - y1) * p)}`);
    }
  };
}

function signo(capa, texto, clase = 'pot-por') {
  const s = make('text', { class: clase, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, capa);
  s.textContent = texto;
  return { pon(x, y, opacidad) { set(s, { x, y, opacity: r2(opacidad) }); } };
}

function corchete(capa) {
  const linea = make('path', { class: 'pot-corchete', opacity: 0 }, capa);
  return { pon(x1, x2, y, opacidad) { set(linea, { d: `M${r2(x1)} ${y}V${y + 6}H${r2(x2)}V${y}`, opacity: r2(opacidad) }); } };
}

/* Juntar dos grupos de fichas: 2³ · 2² y (2³)². Los grupos empiezan separados por un hueco de
   70 con un «·»; luego se acercan, cada uno la mitad del camino (25), hasta quedar a 20 como
   las demás, y el «·» se vuelve un «×» en el mismo lugar (primero se apaga uno y luego
   aparece el otro). */
function juntar(capa, { a, b, partes, etiquetaA, etiquetaB, etiquetaJunta, cuentaA, cuentaB, cuentaJunta }) {
  const ec = ecuacion(capa, partes);
  const separados = anchoDe(a) + HUECO + anchoDe(b), juntos = anchoDe(a + b);
  const x0 = (400 - separados) / 2, x0j = (400 - juntos) / 2, mueve = x0j - x0;   // A avanza +mueve; B, −mueve
  falla(x0 < 8, 'los grupos no caben');
  falla(Math.abs(mueve - (HUECO - (PASO - W)) / 2) > 0.01, 'los grupos no se juntan a la mitad');
  const xB = x0 + anchoDe(a) + HUECO, centroHueco = x0 + anchoDe(a) + HUECO / 2;
  falla(Math.abs(centroHueco - (x0j + anchoDe(a) + (PASO - W) / 2)) > 0.01, 'el «·» y el «×» no quedan en el mismo lugar');
  const fichas = Array.from({ length: a + b }, (_, i) => ({ f: ficha(capa), enA: i < a, x: i < a ? x0 + PASO * i : xB + PASO * (i - a) }));
  const porA = Array.from({ length: a - 1 }, (_, i) => ({ s: signo(capa, '×'), x: x0 + W + (PASO - W) / 2 + PASO * i }));
  const porB = Array.from({ length: b - 1 }, (_, i) => ({ s: signo(capa, '×'), x: xB + W + (PASO - W) / 2 + PASO * i }));
  const punto = signo(capa, '·', 'pot-punto'), porNuevo = signo(capa, '×');
  const cA = corchete(capa), cB = corchete(capa), cJ = corchete(capa);
  const etiqueta = (x, partesEt) => escribe(capa, x, 167, partesEt, { clase: 'pot-etiqueta', sube: 7, ancla: 'middle' });
  const cuenta = (x, texto) => escribe(capa, x, 191, [{ t: texto }], { clase: 'pot-cuenta', ancla: 'middle' });
  const eA = etiqueta(x0 + anchoDe(a) / 2, etiquetaA), nA = cuenta(x0 + anchoDe(a) / 2, cuentaA);
  const eB = etiqueta(xB + anchoDe(b) / 2, etiquetaB), nB = cuenta(xB + anchoDe(b) / 2, cuentaB);
  const eJ = etiqueta(200, etiquetaJunta), nJ = cuenta(200, cuentaJunta);
  const yc = YFILA + H / 2, yCorchete = YFILA + H + 10;
  const tB = 0.6 + 0.35 * a + 1.0;                 // B empieza a llegar cuando A ya tiene su corchete
  const tJ = tB + 0.35 * b + 1.4;                  // cuándo se juntan
  return {
    fin: tJ + 3.8,
    draw(t) {
      const etA = tramo(t, 0.6 + 0.35 * a, 1.0 + 0.35 * a), etB = tramo(t, tB + 0.35 * b + 0.3, tB + 0.35 * b + 0.8);
      const apaga = 1 - tramo(t, tJ, tJ + 0.4), junta = tramo(t, tJ + 0.4, tJ + 1.6), final = tramo(t, tJ + 2.0, tJ + 2.5);
      fichas.forEach((p, i) => {
        const t0 = p.enA ? 0.6 + 0.35 * i : tB + 0.35 * (i - a);
        p.f.pon(p.x + (p.enA ? mueve : -mueve) * junta, YFILA, tramo(t, t0, t0 + 0.35));
        p.f.tacha(0);
      });
      porA.forEach((p, i) => p.s.pon(p.x + mueve * junta, yc, tramo(t, 0.6 + 0.35 * (i + 1), 0.95 + 0.35 * (i + 1))));
      porB.forEach((p, i) => p.s.pon(p.x - mueve * junta, yc, tramo(t, tB + 0.35 * (i + 1), tB + 0.35 * (i + 2))));
      punto.pon(centroHueco, yc, tramo(t, tB - 0.3, tB) * apaga);
      porNuevo.pon(centroHueco, yc, tramo(t, tJ + 1.6, tJ + 2.0));
      cA.pon(x0 + mueve * junta, x0 + anchoDe(a) + mueve * junta, yCorchete, etA * apaga);
      cB.pon(xB - mueve * junta, xB + anchoDe(b) - mueve * junta, yCorchete, etB * apaga);
      cJ.pon(x0j, x0j + juntos, yCorchete, final);
      [eA, nA].forEach(e => e.texto.setAttribute('opacity', r2(etA * apaga)));
      [eB, nB].forEach(e => e.texto.setAttribute('opacity', r2(etB * apaga)));
      [eJ, nJ].forEach(e => e.texto.setAttribute('opacity', r2(final)));
      ec.grupo('dos', tramo(t, tB - 0.3, tB));
      ec.grupo('res', tramo(t, tJ + 2.9, tJ + 3.4));
    }
  };
}

/* Dividir: arriba y abajo de la raya, alineadas a la izquierda para que cada 2 de abajo quede
   bajo el 2 de arriba con el que se cancela. Se cancelan por pares, uno tras otro. */
function dividir(capa, { arriba, abajo, partes, cuenta, queda }) {
  const ec = ecuacion(capa, partes);
  const mas = Math.max(arriba, abajo), x0 = (400 - anchoDe(mas)) / 2;
  const fila = (n, y) => Array.from({ length: n }, (_, i) => ({ f: ficha(capa), x: x0 + PASO * i, y }));
  const num = fila(arriba, YNUM), den = fila(abajo, YDEN);
  const signos = (n, y) => Array.from({ length: Math.max(0, n - 1) }, (_, i) => ({ s: signo(capa, '×'), x: x0 + W + (PASO - W) / 2 + PASO * i, y }));
  const porNum = signos(arriba, YNUM + H / 2), porDen = signos(abajo, YDEN + H / 2);
  const raya = make('path', { class: 'pot-raya', d: `M${r2(x0 - 12)} ${YRAYA}H${r2(x0 + anchoDe(mas) + 12)}` }, capa);
  const pares = Math.min(arriba, abajo);
  const tPar = i => 1.5 + 0.25 * (arriba + abajo) + 0.9 * i;   // cuándo se cancela el par i
  const cancela = (i, t) => (i < pares ? tramo(t, tPar(i), tPar(i) + 0.6) : 0);
  const tQueda = tPar(pares) + 0.3;
  const nota = escribe(capa, 200, 215, [{ t: cuenta }], { clase: 'pot-cuenta', ancla: 'middle' });
  // Lo que queda: «= 1» a la derecha de la raya, o un 1 arriba, sobre las fichas que sobran abajo.
  const uno = make('text', { x: queda ? queda(x0).x : 0, y: queda ? queda(x0).y : 0, class: 'pot-uno', 'text-anchor': queda && queda(x0).ancla || 'middle', 'dominant-baseline': 'central' }, capa);
  uno.textContent = queda ? queda(x0).texto : '';
  return {
    fin: tQueda + 2.8,
    draw(t) {
      num.forEach((p, i) => { const t0 = 0.5 + 0.25 * i; p.f.pon(p.x, p.y, tramo(t, t0, t0 + 0.35), cancela(i, t)); p.f.tacha(cancela(i, t)); });
      den.forEach((p, i) => { const t0 = 0.8 + 0.25 * (arriba + i); p.f.pon(p.x, p.y, tramo(t, t0, t0 + 0.35), cancela(i, t)); p.f.tacha(cancela(i, t)); });
      // Un «×» se apaga con la ficha cancelada que tiene a su izquierda.
      porNum.forEach((p, i) => p.s.pon(p.x, p.y, tramo(t, 0.5 + 0.25 * (i + 1), 0.85 + 0.25 * (i + 1)) * (1 - 0.68 * cancela(i, t))));
      porDen.forEach((p, i) => p.s.pon(p.x, p.y, tramo(t, 0.8 + 0.25 * (arriba + i + 1), 1.15 + 0.25 * (arriba + i + 1)) * (1 - 0.68 * cancela(i, t))));
      raya.setAttribute('opacity', r2(tramo(t, 0.5 + 0.25 * arriba, 0.8 + 0.25 * arriba)));
      nota.texto.setAttribute('opacity', r2(tramo(t, tQueda, tQueda + 0.5)));
      uno.setAttribute('opacity', r2(queda ? tramo(t, tQueda + 0.6, tQueda + 1.1) : 0));
      ec.grupo('res', tramo(t, tQueda + 1.6, tQueda + 2.1));
    }
  };
}

const RES = { g: 'res', clase: 'pot-resultado' };
const FACTORES = {
  producto: capa => juntar(capa, {
    a: 3, b: 2,
    partes: [{ t: '2' }, { t: '3', sup: true }, { t: ' · 2', g: 'dos' }, { t: '2', sup: true, g: 'dos' }, { t: ' = 2', ...RES }, { t: '5', sup: true, ...RES }],
    etiquetaA: [{ t: '2' }, { t: '3', sup: true }], cuentaA: '3 factores',
    etiquetaB: [{ t: '2' }, { t: '2', sup: true }], cuentaB: '2 factores',
    etiquetaJunta: [{ t: '2' }, { t: '5', sup: true }], cuentaJunta: '3 + 2 = 5 factores'
  }),
  potencia: capa => juntar(capa, {
    a: 3, b: 3,
    partes: [{ t: '(2' }, { t: '3', sup: true }, { t: ')' }, { t: '2', sup: true }, { t: ' = 2', g: 'dos' }, { t: '3', sup: true, g: 'dos' },
      { t: ' · 2', g: 'dos' }, { t: '3', sup: true, g: 'dos' }, { t: ' = 2', ...RES }, { t: '6', sup: true, ...RES }],
    etiquetaA: [{ t: '2' }, { t: '3', sup: true }], cuentaA: '3 factores',
    etiquetaB: [{ t: '2' }, { t: '3', sup: true }], cuentaB: '3 factores',
    etiquetaJunta: [{ t: '2' }, { t: '6', sup: true }], cuentaJunta: '2 × 3 = 6 factores'
  }),
  cociente: capa => dividir(capa, {
    arriba: 5, abajo: 2,
    partes: [{ t: '2' }, { t: '5', sup: true }, { t: ' ÷ 2' }, { t: '2', sup: true }, { t: ' = 2', ...RES }, { t: '3', sup: true, ...RES }],
    cuenta: 'quedan 5 − 2 = 3 factores'
  }),
  cero: capa => dividir(capa, {
    arriba: 3, abajo: 3,
    partes: [{ t: '2' }, { t: '3', sup: true }, { t: ' ÷ 2' }, { t: '3', sup: true }, { t: ' = 2', ...RES }, { t: '0', sup: true, ...RES }, { t: ' = 1', ...RES }],
    cuenta: 'se cancelan todos: queda 1',
    queda: x0 => ({ texto: '= 1', x: x0 + anchoDe(3) + 24, y: YRAYA, ancla: 'start' })
  }),
  negativo: capa => dividir(capa, {
    arriba: 2, abajo: 5,
    partes: [{ t: '2' }, { t: '2', sup: true }, { t: ' ÷ 2' }, { t: '5', sup: true }, { t: ' = 2', ...RES }, { t: '−3', sup: true, ...RES },
      { t: ' = 1/2', ...RES }, { t: '3', sup: true, ...RES }],
    cuenta: 'sobran 3 factores abajo',
    // Sobre las tres fichas que sobran abajo: ahí arriba ya no hay ninguna.
    queda: x0 => ({ texto: '1', x: x0 + 2 * PASO + anchoDe(3) / 2, y: YNUM + H / 2 })
  })
};
// El 1 del caso negativo queda a la derecha de las dos fichas canceladas de arriba.
falla((400 - anchoDe(5)) / 2 + 2 * PASO + anchoDe(3) / 2 - 12 < (400 - anchoDe(5)) / 2 + PASO + W, 'el 1 se encima con las fichas de arriba');
falla(YNUM + H > YRAYA - 8 || YDEN < YRAYA + 8 || YDEN + H + 24 > 230, 'la fracción no cabe');

const CUADROS = { cuadrado, cubo, raiz };

/* ---------------- El caso elegido, sus botones, su texto y «Repetir» ---------------- */
function escena(svg, casos, porOmision) {
  const root = svg.closest('[data-casos]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-caso-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });
  const capa = make('g', {}, svg);
  let clave = null, t = 0, actual = null;

  function elige(nueva, animar) {
    if (!casos[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    clave = nueva;
    while (capa.firstChild) capa.removeChild(capa.firstChild);
    actual = casos[nueva](capa);
    if (panel) panel.innerHTML = textos[nueva] ? '<p>' + textos[nueva] + '</p>' : '';
    t = animar && !reducedMotion.matches ? 0 : actual.fin;
    actual.draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : porOmision, true);
  return {
    update(dt) { if (t < actual.fin) { t += dt; actual.draw(t); } },
    still() { t = actual.fin; actual.draw(t); },
    // Para revisar la geometría desde afuera: dibuja el cuadro del segundo t y dice cuánto dura.
    cuadro(nuevoT) { t = nuevoT; actual.draw(t); return actual.fin; }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = {
  cuadros: svg => escena(svg, CUADROS, 'cuadrado'),
  factores: svg => escena(svg, FACTORES, 'producto')
};
const scenes = [...document.querySelectorAll('[data-escena-mate]')]
  .filter(svg => factories[svg.dataset.escenaMate])
  .map(svg => {
    const s = { svg, visible: false, ...factories[svg.dataset.escenaMate](svg) };
    svg.__escena = s;
    return s;
  });
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
