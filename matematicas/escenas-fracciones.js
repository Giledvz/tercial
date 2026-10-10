/* Escenas de Fracciones (Fundamentos, semana 2). Mismo contrato que escenas-matematicas.js:
   cada escena es { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja su cuadro final. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
// Avance de 0 a 1 entre dos momentos, con arranque y llegada suaves.
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

/* ---------------- Las barras de fracciones ----------------
   Cada barra es un entero de 288 unidades de largo: 288 se divide exacto entre 2, 3, 4, 6, 8
   y 12, así que cada raya cae en un número entero del dibujo. Lo pintado es la fracción.
   Cuatro casos:
   - Equivalentes: la barra de 2/3 se copia y cada parte se vuelve a partir en dos (4/6) y otra
     vez en dos (8/12). Las rayas nuevas cambian, lo pintado no: la guía punteada lo marca.
   - De una cantidad: 20 bolitas en la barra; el 4 las reparte en cuatro grupos de 5 y el 3 dice
     cuántos grupos se toman: 15.
   - Suma: medios y tercios no son del mismo tamaño. Las dos barras se parten en sextos; luego
     los 2 sextos de abajo se recorren por su propio riel y suben a los huecos de arriba, que
     están vacíos: nada pasa por encima de nada. Quedan 5 sextos.
   - Producto: 2/3 × 3/4 es «2/3 de 3/4»: se pintan 3 de 4 columnas y, de eso, 2 de 3 renglones.
     Quedan 2 × 3 = 6 cuadritos de 3 × 4 = 12.
   Las cuentas y la geometría se comprueban al cargar: si algo no cuadra, la escena no arranca. */

const X0 = 30, ANCHO = 288, RIGHT = X0 + ANCHO;
const X_ROTULO = 352;                          // centro de la fracción que nombra cada barra
const xEn = f => X0 + ANCHO * f;

// Anchos de Fraunces medidos en el navegador (por cada unidad de tamaño de letra).
const ANCHOS = { 0: .593, 1: .358, 2: .533, 3: .54, 4: .544, 5: .513, 6: .55, 7: .51, 8: .521, 9: .55,
  '×': .406, '+': .46, '−': .46, '=': .46, '?': .471, d: .5, e: .42, ' ': .25 };
const ancho = (txt, T) => [...String(txt)].reduce((s, c) => s + (ANCHOS[c] ?? .55), 0) * T;
// Medidas de Fraunces: la altura de los dígitos y el eje de los signos (+, =), sobre la línea base.
const ALTO_DIGITO = .715, EJE = .34, HUECO = .17;

const mcd = (a, b) => (b ? mcd(b, a % b) : a);
function comprueba(condicion, mensaje) { if (!condicion) throw new Error('fracciones: ' + mensaje); }

// Las cuentas de cada caso, comprobadas.
comprueba(2 * 6 === 3 * 4 && 2 * 12 === 3 * 8, '2/3, 4/6 y 8/12 no son equivalentes');
comprueba(20 % 4 === 0 && 3 * (20 / 4) === 15, '3/4 de 20 no da 15');
comprueba(1 * 3 + 1 * 2 === 5 && 2 * 3 === 6, '1/2 + 1/3 no da 5/6');
comprueba(2 * 3 === 6 && 3 * 4 === 12 && 6 / mcd(6, 12) === 1 && 12 / mcd(6, 12) === 2, '2/3 × 3/4 no da 1/2');
for (const n of [2, 3, 4, 6, 12]) comprueba(ANCHO % n === 0, `las rayas de ${n} no caen en números enteros`);
// El rótulo de cada barra no toca la barra: su borde izquierdo queda a más de 8 unidades.
comprueba(X_ROTULO - ancho('12', 15) / 2 - .12 * 15 > RIGHT + 8, 'el rótulo toca la barra');

/* Una fracción apilada en el SVG: numerador, raya y denominador, centrada en x, con la raya en yb.
   Opcionalmente, a la derecha de cada número, un «×2» en el color del nivel. */
function fraccion(capa, T, clase) {
  const g = make('g', { class: 'fr-svg' + (clase ? ' ' + clase : '') }, capa);
  const estilo = `font-size:${T}px`;
  const n = make('text', { 'text-anchor': 'middle', class: 'fr-svg__num', style: estilo }, g);
  const raya = make('path', { class: 'fr-svg__raya', 'stroke-width': r2(T * .07) }, g);
  const d = make('text', { 'text-anchor': 'middle', class: 'fr-svg__num', style: estilo }, g);
  const porN = make('text', { class: 'fr-svg__por', style: `font-size:${r2(T * .8)}px`, opacity: 0 }, g);
  const porD = make('text', { class: 'fr-svg__por', style: `font-size:${r2(T * .8)}px`, opacity: 0 }, g);
  return {
    g,
    ancho(num, den) { return Math.max(ancho(num, T), ancho(den, T)) + .24 * T; },
    pon(x, yb, num, den, por) {
      const w = Math.max(ancho(num, T), ancho(den, T)) + .24 * T;
      set(n, { x, y: yb - HUECO * T });
      set(d, { x, y: yb + (HUECO + ALTO_DIGITO) * T });
      n.textContent = num; d.textContent = den;
      set(raya, { d: `M${x - w / 2} ${yb}H${x + w / 2}` });
      if (por) {
        const xp = x + w / 2 + .14 * T;
        set(porN, { x: xp, y: yb - HUECO * T }); set(porD, { x: xp, y: yb + (HUECO + ALTO_DIGITO) * T });
        porN.textContent = por; porD.textContent = por;
      }
    },
    opacidad(o) { g.setAttribute('opacity', r2(o)); },
    por(o) { porN.setAttribute('opacity', r2(o)); porD.setAttribute('opacity', r2(o)); }
  };
}

/* La operación arriba a la izquierda, en piezas que aparecen cuando les toca:
   { fr: [n, d] } una fracción, { t: '+' } un signo o un número, { t: 'de', palabra: true }. */
function ecuacion(capa, piezas, T = 18, yb = 30, x0 = 30) {
  const G = T * .36;
  let x = x0;
  const hechas = piezas.map(p => {
    let el;
    if (p.fr) {
      const f = fraccion(capa, T, p.clase);
      const w = f.ancho(p.fr[0], p.fr[1]);
      f.pon(x + w / 2, yb, p.fr[0], p.fr[1]);
      x += w + G;
      el = f.g;
    } else {
      el = make('text', { x, y: yb + (p.palabra ? .3 : EJE) * T, class: 'ec__signo' + (p.clase ? ' ' + p.clase : ''), style: `font-size:${T}px` }, capa);
      el.textContent = p.t;
      x += ancho(p.t, T) + G + (p.palabra ? .12 * T : 0);   // una palabra pide un poco más de aire
    }
    return { el, aparece: p.aparece };
  });
  comprueba(x - G < 260, 'la operación de arriba es demasiado larga');
  return {
    draw(t) { for (const h of hechas) h.el.setAttribute('opacity', h.aparece ? r2(tramo(t, h.aparece[0], h.aparece[1])) : 1); }
  };
}

/* Piezas de una barra. Cada parte es un mosaico: las rayas son huecos del color de la página, así
   se ven igual sobre lo pintado (oscuro) que sobre lo vacío (claro). */
function barra(capa, y, alto) {
  const g = make('g', {}, capa);
  return {
    g, y, alto,
    fondo: make('rect', { x: X0, y, width: ANCHO, height: alto, class: 'barra__fondo' }, g),
    relleno: make('g', {}, g),
    lineas: make('g', {}, g)
  };
}
function parte(capa, x1, x2, y, alto, clase) {
  return make('rect', { x: x1, y, width: x2 - x1, height: alto, class: clase }, capa);
}
function raya(capa, x, y, alto) {
  return make('path', { d: `M${x} ${y}V${y + alto}`, class: 'barra__raya' }, capa);
}
// Una raya nueva: crece punteada de arriba abajo y luego se vuelve firme.
function rayaNueva(capa, x, y, alto) {
  const punteada = make('path', { class: 'barra__raya barra__raya--nueva', opacity: 0 }, capa);
  const firme = make('path', { d: `M${x} ${y}V${y + alto}`, class: 'barra__raya', opacity: 0 }, capa);
  return {
    draw(crece, firmeza) {
      set(punteada, { d: `M${x} ${y}V${y + alto * Math.max(crece, .001)}`, opacity: crece > 0 ? 1 - firmeza : 0 });
      firme.setAttribute('opacity', r2(firmeza));
    }
  };
}
// Una llave recta: de x1 a x2, a la altura y, con las puntas hacia la barra.
function llave(capa, x1, x2, y, haciaArriba) {
  const s = haciaArriba ? -1 : 1;
  const xm = (x1 + x2) / 2;
  return make('path', { d: `M${x1} ${y - 5 * s}V${y}H${x2}V${y - 5 * s}M${xm} ${y}V${y + 4 * s}`, class: 'barra__llave' }, capa);
}
function texto(capa, x, y, clase, contenido, ancla = 'middle') {
  const t = make('text', { x, y, class: clase, 'text-anchor': ancla }, capa);
  t.textContent = contenido;
  return t;
}

/* ---------- Caso 1 · Equivalentes: 2/3 = 4/6 = 8/12 ---------- */
function casoEquivalentes(capa) {
  const H = 28, TOPS = [62, 110, 158], T = 15, PINTADO = 2 / 3;
  const ec = ecuacion(capa, [
    { fr: ['2', '3'] },
    { t: '=', aparece: [5.6, 6.2] }, { fr: ['4', '6'], aparece: [5.6, 6.2] },
    { t: '=', aparece: [10.8, 11.4] }, { fr: ['8', '12'], aparece: [10.8, 11.4], clase: 'ec__resultado' }
  ]);
  const barras = TOPS.map(y => {
    const b = barra(capa, y, H);
    parte(b.relleno, X0, xEn(PINTADO), y, H, 'barra__pintada');
    return b;
  });
  // Rayas: tercios en la primera; la segunda los copia y les agrega los sextos impares; la
  // tercera copia los sextos y les agrega los doceavos impares.
  [1, 2].forEach(k => raya(barras[0].lineas, xEn(k / 3), TOPS[0], H));
  [1, 2].forEach(k => raya(barras[1].lineas, xEn(k / 3), TOPS[1], H));
  const nuevas1 = [1, 3, 5].map(k => rayaNueva(barras[1].lineas, xEn(k / 6), TOPS[1], H));
  [1, 2, 3, 4, 5].forEach(k => raya(barras[2].lineas, xEn(k / 6), TOPS[2], H));
  const nuevas2 = [1, 3, 5, 7, 9, 11].map(k => rayaNueva(barras[2].lineas, xEn(k / 12), TOPS[2], H));
  // Rótulos: cada barra dice su fracción; al partirse, aparece «×2» arriba y abajo y luego el resultado.
  const yR = TOPS.map(y => y + H / 2);
  const r0 = fraccion(capa, T); r0.pon(X_ROTULO, yR[0], '2', '3');
  const r1a = fraccion(capa, T); r1a.pon(X_ROTULO, yR[1], '2', '3', '×2');
  const r1b = fraccion(capa, T); r1b.pon(X_ROTULO, yR[1], '4', '6');
  const r2a = fraccion(capa, T); r2a.pon(X_ROTULO, yR[2], '4', '6', '×2');
  const r2b = fraccion(capa, T); r2b.pon(X_ROTULO, yR[2], '8', '12');
  // La guía: lo pintado termina en el mismo lugar en las tres barras.
  const guia = make('path', { class: 'barra__guia' }, capa);
  const xg = xEn(PINTADO), yg0 = TOPS[0] - 6, yg1 = TOPS[2] + H + 6;
  return {
    fin: 13.8,
    draw(t) {
      ec.draw(t);
      barras[0].g.setAttribute('opacity', r2(tramo(t, .3, 1)));
      r0.opacidad(tramo(t, .3, 1));
      barras[1].g.setAttribute('opacity', r2(tramo(t, 1.6, 2.2)));
      nuevas1.forEach(n => n.draw(tramo(t, 2.8, 3.8), tramo(t, 3.8, 4.2)));
      r1a.opacidad(tramo(t, 1.6, 2.2) * (1 - tramo(t, 5.2, 5.6)));
      r1a.por(tramo(t, 4.2, 4.8));
      r1b.opacidad(tramo(t, 5.4, 5.8));
      barras[2].g.setAttribute('opacity', r2(tramo(t, 6.8, 7.4)));
      nuevas2.forEach(n => n.draw(tramo(t, 8, 9), tramo(t, 9, 9.4)));
      r2a.opacidad(tramo(t, 6.8, 7.4) * (1 - tramo(t, 10.4, 10.8)));
      r2a.por(tramo(t, 9.4, 10));
      r2b.opacidad(tramo(t, 10.6, 11));
      const g = tramo(t, 12, 13);
      set(guia, { d: `M${xg} ${yg0}V${yg0 + (yg1 - yg0) * Math.max(g, .001)}`, opacity: g > 0 ? 1 : 0 });
    }
  };
}

/* ---------- Caso 2 · De una cantidad: 3/4 de 20 = 15 ---------- */
function casoDe(capa) {
  const Y = 88, H = 38, PARTES = 4, TOTAL = 20, TOMADAS = 3;
  const porParte = TOTAL / PARTES, paso = ANCHO / TOTAL, w = ANCHO / PARTES;
  comprueba(Number.isInteger(porParte), 'las bolitas no se reparten exacto');
  const ec = ecuacion(capa, [
    { fr: ['3', '4'] }, { t: 'de', palabra: true }, { t: '20' },
    { t: '=', aparece: [9.6, 10.2] }, { t: '15', aparece: [9.6, 10.2], clase: 'ec__resultado' }
  ]);
  const b = barra(capa, Y, H);
  const pintadas = [0, 1, 2].map(j => parte(b.relleno, X0 + w * j, X0 + w * (j + 1), Y, H, 'barra__pintada'));
  const divisiones = [1, 2, 3].map(j => rayaNueva(b.lineas, X0 + w * j, Y, H));
  const cy = Y + H / 2, R = 4.4;
  const bolitas = [];
  for (let i = 0; i < TOTAL; i++) {
    const cx = X0 + paso / 2 + paso * i;
    const g = make('g', {}, capa);
    make('circle', { cx, cy, r: R, class: 'barra__bolita' }, g);
    const hueco = make('circle', { cx, cy, r: R, class: 'barra__bolita barra__bolita--sobre' }, g);
    bolitas.push({ g, hueco, grupo: Math.floor(i / porParte) });
  }
  // Ninguna bolita queda sobre una raya: las rayas caen justo entre dos bolitas.
  for (let j = 1; j < PARTES; j++) {
    const xr = X0 + w * j, izq = X0 + paso / 2 + paso * (j * porParte - 1), der = izq + paso;
    comprueba(xr - izq > R + 1 && der - xr > R + 1, 'una raya pasa sobre una bolita');
  }
  const llaveArriba = llave(capa, X0, RIGHT, Y - 10, true);
  const veinte = texto(capa, (X0 + RIGHT) / 2, Y - 19, 'barra__cifra', '20');
  const cincos = [0, 1, 2, 3].map(j => texto(capa, X0 + w * (j + .5), Y + H + 17, 'barra__cifra barra__cifra--chica', String(porParte)));
  const llaveAbajo = llave(capa, X0, X0 + w * TOMADAS, Y + H + 28, false);
  const quince = texto(capa, X0 + w * TOMADAS / 2, Y + H + 50, 'barra__cifra barra__cifra--acento', '15');
  return {
    fin: 11,
    draw(t) {
      ec.draw(t);
      b.g.setAttribute('opacity', r2(tramo(t, .3, .9)));
      bolitas.forEach((bo, i) => bo.g.setAttribute('opacity', r2(tramo(t, 1 + i * .1, 1.25 + i * .1))));
      const a = tramo(t, 3.2, 3.7);
      llaveArriba.setAttribute('opacity', r2(a)); veinte.setAttribute('opacity', r2(a));
      divisiones.forEach(d => d.draw(tramo(t, 4.2, 5.2), tramo(t, 5.2, 5.6)));
      cincos.forEach(c => c.setAttribute('opacity', r2(tramo(t, 5.6, 6.1))));
      pintadas.forEach((p, j) => {
        const v = tramo(t, 6.6 + j * .8, 7.2 + j * .8);
        p.setAttribute('opacity', r2(v));
        bolitas.filter(bo => bo.grupo === j).forEach(bo => bo.hueco.setAttribute('opacity', r2(v)));
      });
      bolitas.filter(bo => bo.grupo >= TOMADAS).forEach(bo => bo.hueco.setAttribute('opacity', 0));
      const c = tramo(t, 9.2, 9.8);
      llaveAbajo.setAttribute('opacity', r2(c)); quince.setAttribute('opacity', r2(c));
    }
  };
}

/* ---------- Caso 3 · Suma: 1/2 + 1/3 = 3/6 + 2/6 = 5/6 ---------- */
function casoSuma(capa) {
  const H = 30, Y1 = 78, Y2 = 138, T = 15;
  const ec = ecuacion(capa, [
    { fr: ['1', '2'] }, { t: '+' }, { fr: ['1', '3'] },
    { t: '=', aparece: [6, 6.6] }, { fr: ['3', '6'], aparece: [6, 6.6] }, { t: '+', aparece: [6, 6.6] }, { fr: ['2', '6'], aparece: [6, 6.6] },
    { t: '=', aparece: [10.8, 11.4] }, { fr: ['5', '6'], aparece: [10.8, 11.4], clase: 'ec__resultado' }
  ]);
  const b1 = barra(capa, Y1, H), b2 = barra(capa, Y2, H);
  parte(b1.relleno, X0, xEn(1 / 2), Y1, H, 'barra__pintada');
  raya(b1.lineas, xEn(1 / 2), Y1, H);
  const nuevas1 = [1, 2, 4, 5].map(k => rayaNueva(b1.lineas, xEn(k / 6), Y1, H));
  [1, 2].forEach(k => raya(b2.lineas, xEn(k / 3), Y2, H));
  const nuevas2 = [1, 3, 5].map(k => rayaNueva(b2.lineas, xEn(k / 6), Y2, H));
  // La pieza de abajo (1/3 = 2/6): se mueve entera, con su raya de en medio y su borde.
  const DESTINO = 3 / 6;                       // los huecos de arriba: del sexto 3 al 5, vacíos
  comprueba(DESTINO >= 1 / 2 && DESTINO + 2 / 6 <= 1, 'la pieza no cabe en los huecos de arriba');
  const pieza = make('g', {}, capa);
  const MEDIO_HUECO = 1.2;                     // la mitad del grueso de una raya
  parte(pieza, X0 + MEDIO_HUECO, xEn(2 / 6) - MEDIO_HUECO, Y2, H, 'barra__fondo');
  parte(pieza, X0 + MEDIO_HUECO, xEn(2 / 6) - MEDIO_HUECO, Y2, H, 'barra__clara');
  const rayaPieza = rayaNueva(pieza, xEn(1 / 6), Y2, H);
  const yR1 = Y1 + H / 2, yR2 = Y2 + H / 2;
  const r1a = fraccion(capa, T); r1a.pon(X_ROTULO, yR1, '1', '2', '×3');
  const r1b = fraccion(capa, T); r1b.pon(X_ROTULO, yR1, '3', '6');
  const r1c = fraccion(capa, T, 'fr-svg--acento'); r1c.pon(X_ROTULO, yR1, '5', '6');
  const r2a = fraccion(capa, T); r2a.pon(X_ROTULO, yR2, '1', '3', '×2');
  const r2b = fraccion(capa, T); r2b.pon(X_ROTULO, yR2, '2', '6');
  const DX = xEn(DESTINO) - X0, DY = Y1 - Y2;
  return {
    fin: 12.2,
    draw(t) {
      ec.draw(t);
      b1.g.setAttribute('opacity', r2(tramo(t, .3, 1)));
      r1a.opacidad(tramo(t, .3, 1) * (1 - tramo(t, 5.4, 5.8)));
      const a2 = tramo(t, 1.4, 2.1);
      // Al final, la barra de abajo se queda vacía y se atenúa: ya entregó sus sextos.
      const vacia = 1 - .65 * tramo(t, 10.6, 11.2);
      b2.g.setAttribute('opacity', r2(a2 * vacia));
      pieza.setAttribute('opacity', r2(a2));
      r2a.opacidad(a2 * (1 - tramo(t, 5.4, 5.8)));
      const crece = tramo(t, 3, 4), firme = tramo(t, 4, 4.4);
      nuevas1.forEach(n => n.draw(crece, firme));
      nuevas2.forEach(n => n.draw(crece, firme));
      rayaPieza.draw(crece, firme);
      r1a.por(tramo(t, 4.4, 5)); r2a.por(tramo(t, 4.4, 5));
      r1b.opacidad(tramo(t, 5.6, 6) * (1 - tramo(t, 10.6, 11)));
      r2b.opacidad(tramo(t, 5.6, 6) * (1 - tramo(t, 10.6, 11)));
      r1c.opacidad(tramo(t, 10.8, 11.2));
      // Primero se recorre por su riel; luego sube derecho a los huecos vacíos.
      const dx = DX * tramo(t, 7.2, 8.6), dy = DY * tramo(t, 9, 10.2);
      pieza.setAttribute('transform', `translate(${r2(dx)} ${r2(dy)})`);
    }
  };
}

/* ---------- Caso 4 · Producto: 2/3 × 3/4 = 6/12 = 1/2 ---------- */
function casoProducto(capa) {
  const XL = 70, YT = 62, COL = 48, FIL = 36, NC = 4, NF = 3, T = 14;
  const XR = XL + COL * NC, YB = YT + FIL * NF;
  const ec = ecuacion(capa, [
    { fr: ['2', '3'] }, { t: '×' }, { fr: ['3', '4'] },
    { t: '=', aparece: [10.2, 10.8] }, { fr: ['6', '12'], aparece: [10.2, 10.8] },
    { t: '=', aparece: [11.4, 12] }, { fr: ['1', '2'], aparece: [11.4, 12], clase: 'ec__resultado' }
  ]);
  const fondo = make('rect', { x: XL, y: YT, width: COL * NC, height: FIL * NF, class: 'barra__fondo' }, capa);
  const claras = make('rect', { x: XL, y: YT, width: COL * 3, height: FIL * NF, class: 'barra__clara' }, capa);
  const fuertes = [0, 1].map(f => make('rect', { x: XL, y: YT + FIL * f, width: COL * 3, height: FIL, class: 'barra__pintada' }, capa));
  const verticales = [1, 2, 3].map(c => make('path', { class: 'barra__raya' }, capa));
  const horizontales = [1, 2].map(f => make('path', { class: 'barra__raya' }, capa));
  const llaveAbajo = llave(capa, XL, XL + COL * 3, YB + 11, false);
  const tresCuartos = fraccion(capa, T); tresCuartos.pon(XL + COL * 1.5, YB + 29, '3', '4');
  const llaveIzq = make('path', { d: `M${XL - 6} ${YT}H${XL - 11}V${YT + FIL * 2}H${XL - 6}M${XL - 11} ${YT + FIL}H${XL - 15}`, class: 'barra__llave' }, capa);
  const dosTercios = fraccion(capa, T); dosTercios.pon(XL - 28, YT + FIL, '2', '3');
  const xn = XR + 20;
  const nota1 = texto(capa, xn, YT + 38, 'barra__nota barra__nota--acento', '2 × 3 = 6', 'start');
  const nota1b = texto(capa, xn, YT + 52, 'barra__nota', 'pintados', 'start');
  const nota2 = texto(capa, xn, YT + 82, 'barra__nota', '3 × 4 = 12', 'start');
  const nota2b = texto(capa, xn, YT + 96, 'barra__nota', 'en total', 'start');
  // Las etiquetas no se enciman con el cuadro ni se salen del dibujo.
  comprueba(XL - 28 - ancho('3', T) / 2 - .12 * T > 0 && XL - 15 > XL - 28 + ancho('3', T) / 2 + .12 * T, 'el 2/3 se encima');
  comprueba(YB + 29 + (HUECO + ALTO_DIGITO) * T < 214, 'el 3/4 se sale por abajo');
  comprueba(xn + 10 * 6.6 < 400, 'las notas se salen por la derecha');
  return {
    fin: 12.8,
    draw(t) {
      ec.draw(t);
      fondo.setAttribute('opacity', r2(tramo(t, .3, .9)));
      const v = tramo(t, 1.2, 2.2);
      verticales.forEach((p, i) => set(p, { d: `M${XL + COL * (i + 1)} ${YT}V${YT + FIL * NF * Math.max(v, .001)}`, opacity: v > 0 ? 1 : 0 }));
      claras.setAttribute('opacity', r2(tramo(t, 2.5, 3.5)));
      const a = tramo(t, 3.6, 4.2);
      llaveAbajo.setAttribute('opacity', r2(a)); tresCuartos.opacidad(a);
      const h = tramo(t, 4.8, 5.8);
      horizontales.forEach((p, i) => set(p, { d: `M${XL} ${YT + FIL * (i + 1)}H${XL + COL * NC * Math.max(h, .001)}`, opacity: h > 0 ? 1 : 0 }));
      fuertes.forEach((r, f) => r.setAttribute('opacity', r2(tramo(t, 6.2 + f * .8, 6.8 + f * .8))));
      const b = tramo(t, 7.8, 8.4);
      llaveIzq.setAttribute('opacity', r2(b)); dosTercios.opacidad(b);
      const n1 = tramo(t, 8.9, 9.5), n2 = tramo(t, 9.6, 10.2);
      nota1.setAttribute('opacity', r2(n1)); nota1b.setAttribute('opacity', r2(n1));
      nota2.setAttribute('opacity', r2(n2)); nota2b.setAttribute('opacity', r2(n2));
    }
  };
}

const CASOS = { equivalentes: casoEquivalentes, de: casoDe, suma: casoSuma, producto: casoProducto };

function barras(svg) {
  const root = svg.closest('[data-barras]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-barras-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });
  const capa = make('g', {}, svg);
  let clave = null, t = 0, caso = null;

  function armar(nueva) {
    clave = nueva;
    capa.innerHTML = '';
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
  elige(inicial ? inicial.dataset.caso : 'equivalentes', true);
  return {
    update(dt) { if (t < caso.fin) { t += dt; caso.draw(t); } },
    still() { t = caso.fin; caso.draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { barras };
const scenes = [...document.querySelectorAll('[data-escena-fracciones]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaFracciones](svg)
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
