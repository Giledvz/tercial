/* Escenas de «Ecuaciones de segundo grado y sistemas». Mismo contrato que las de
   Matemáticas: cada escena es { update(dt), still() }; el reloj compartido sólo avanza
   las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final.
   Usan su propio atributo (data-escena-cs) para no cruzarse con escenas-matematicas.js. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
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

function texto(parent, attrs, contenido) {
  const t = make('text', attrs, parent);
  t.textContent = contenido;
  return t;
}

// a x² + b x + c escrito con el signo menos tipográfico: «x² − x − 6».
function polinomio(a, b, c) {
  let s = '';
  for (const [k, g] of [[a, 2], [b, 1], [c, 0]]) {
    if (k === 0) continue;
    const abs = Math.abs(k);
    const cuerpo = g === 0 ? String(abs) : (abs === 1 ? '' : abs) + (g === 2 ? 'x²' : 'x');
    s += s === '' ? (k < 0 ? MENOS : '') + cuerpo : (k < 0 ? ' ' + MENOS + ' ' : ' + ') + cuerpo;
  }
  return s;
}
// El factor que se hace cero en x = r: (x − 3), (x + 2).
const factor = r => (r < 0 ? '(x + ' + (-r) + ')' : '(x ' + MENOS + ' ' + r + ')');

/* ---------------- La parábola y sus raíces ----------------
   La curva es la altura y = ax² + bx + c para cada x. Un punto la recorre de izquierda a
   derecha a velocidad constante sobre la curva (frena y se detiene en cada raíz); una línea
   punteada va de él al eje: es la altura, y en las raíces mide cero. Al llegar a una raíz
   aparece su marca y se enciende, arriba, el factor que se hizo cero. En «ninguna» el punto
   se detiene en lo más bajo de la curva, que queda arriba del eje.
   Ventana: x de −5 a 5 (35.6 px por unidad), y de −10 a 8 (10.33 px por unidad). Todo se
   comprueba al cargar: las raíces cumplen la ecuación, los factores son los de las raíces y
   la curva cabe en la ventana. */
const CASOS = {
  dos: { a: 1, b: -1, c: -6, raices: [-2, 3] },
  incompleta: { a: 1, b: 0, c: -9, raices: [-3, 3] },
  una: { a: 1, b: -4, c: 4, raices: [2] },
  ninguna: { a: 1, b: -2, c: 3, raices: [] }
};
const P = { XMIN: -5, XMAX: 5, YMIN: -10, YMAX: 8, X0: 34, X1: 390, Y0: 48, Y1: 234 };
const SXp = (P.X1 - P.X0) / (P.XMAX - P.XMIN), SYp = (P.Y1 - P.Y0) / (P.YMAX - P.YMIN);
const xP = x => P.X0 + (x - P.XMIN) * SXp;
const yP = y => P.Y0 + (P.YMAX - y) * SYp;
const VELOCIDAD = 80, PAUSA = 1.6, ARRANQUE = 0.6;

for (const [clave, k] of Object.entries(CASOS)) {
  const f = x => k.a * x * x + k.b * x + k.c;
  const D = k.b * k.b - 4 * k.a * k.c;
  const esperadas = D > 0 ? 2 : D === 0 ? 1 : 0;
  if (k.raices.length !== esperadas) throw new Error(`parábola: ${clave} debe tener ${esperadas} raíces`);
  k.raices.forEach(r => { if (f(r) !== 0) throw new Error(`parábola: ${r} no es raíz de ${clave}`); });
  if (esperadas === 2 && (k.raices[0] + k.raices[1] !== -k.b / k.a || k.raices[0] * k.raices[1] !== k.c / k.a)) throw new Error(`parábola: factores de ${clave}`);
  const xv = -k.b / (2 * k.a);
  if (f(xv) < P.YMIN + 0.5) throw new Error(`parábola: ${clave} se sale por abajo`);
  // Dónde la curva sale por arriba de la ventana: ahí empieza y termina el recorrido.
  const h = Math.sqrt(k.b * k.b - 4 * k.a * (k.c - P.YMAX));
  k.xs = (-k.b - h) / (2 * k.a);
  k.xe = (-k.b + h) / (2 * k.a);
  if (k.xs < P.XMIN || k.xe > P.XMAX) throw new Error(`parábola: ${clave} se sale de lado`);
  k.f = f;
  k.vertice = xv;
  k.ecuacion = polinomio(k.a, k.b, k.c) + ' = 0';
  k.factores = esperadas === 2 ? k.raices.map(factor) : esperadas === 1 ? [factor(k.raices[0]) + '²'] : [];
}

function parabola(svg) {
  const root = svg.closest('[data-parabola]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-parabola-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  // Cuadrícula: una línea por unidad en x y cada 2 en y; los números van en los bordes, fuera de
  // donde pasa la curva. Los ejes, más marcados, con su punta y su nombre.
  const fondo = make('g', {}, svg);
  for (let x = P.XMIN; x <= P.XMAX; x++) {
    make('path', { d: `M${xP(x)} ${P.Y0}V${P.Y1}`, class: 'cs-rejilla' }, fondo);
    texto(fondo, { x: xP(x), y: P.Y1 + 16, class: 'cs-numero', 'text-anchor': 'middle' }, numero(x));
  }
  for (let y = P.YMIN; y <= P.YMAX; y += 2) {
    make('path', { d: `M${P.X0} ${yP(y)}H${P.X1}`, class: 'cs-rejilla' }, fondo);
    if (y % 4 === 0) texto(fondo, { x: P.X0 - 6, y: yP(y) + 3.4, class: 'cs-numero', 'text-anchor': 'end' }, numero(y));
  }
  make('path', { d: `M${P.X0} ${yP(0)}H${P.X1 + 1}`, class: 'cs-eje' }, fondo);
  make('path', { d: `M${P.X1 + 7} ${yP(0)}l-7 -3.5v7z`, class: 'cs-punta-eje' }, fondo);
  make('path', { d: `M${xP(0)} ${P.Y1}V${P.Y0 - 1}`, class: 'cs-eje' }, fondo);
  make('path', { d: `M${xP(0)} ${P.Y0 - 7}l-3.5 7h7z`, class: 'cs-punta-eje' }, fondo);
  texto(fondo, { x: P.X1 - 2, y: yP(0) + 14, class: 'cs-nombre-eje', 'text-anchor': 'end' }, 'x');
  texto(fondo, { x: xP(0) + 7, y: P.Y0 + 5, class: 'cs-nombre-eje' }, 'y');

  const ecuacion = make('text', { x: 16, y: 30, class: 'cs-ecuacion' }, svg);
  const factorizada = make('text', { x: 386, y: 30, class: 'cs-ecuacion', 'text-anchor': 'end' }, svg);
  const capa = make('g', {}, svg);
  const curva = make('path', { class: 'cs-curva' }, capa);
  const hueco = make('path', { class: 'cs-hueco', opacity: 0 }, capa);
  const altura = make('path', { class: 'cs-altura' }, capa);
  const marcas = make('g', {}, capa);
  const punto = make('circle', { r: 5.5, class: 'cs-punto' }, svg);

  let clave = null, caso = null, t = 0, muestras = [], largo = 0, tramos = [], paradas = [], fin = 0;
  let tspans = [], raicesG = [];

  function armar(nueva) {
    clave = nueva;
    caso = CASOS[clave];
    // La curva en muestras finas, con las raíces (o el vértice) entre ellas para detenerse justo ahí.
    const xsParada = caso.raices.length ? caso.raices.slice() : [caso.vertice];
    const xs = [];
    for (let i = 0; i <= 600; i++) xs.push(caso.xs + (caso.xe - caso.xs) * i / 600);
    xs.push(...xsParada);
    xs.sort((p, q) => p - q);
    muestras = [];
    let acumulado = 0;
    xs.forEach((x, i) => {
      const px = xP(x), py = yP(caso.f(x));
      if (i) acumulado += Math.hypot(px - muestras[i - 1].px, py - muestras[i - 1].py);
      muestras.push({ x, px, py, s: acumulado });
    });
    largo = acumulado;
    // Línea de tiempo: arranque, tramos hasta cada parada (con pausa) y el último tramo.
    paradas = xsParada.map(x => ({ x, s: muestras.find(m => m.x === x).s }));
    tramos = [];
    let tt = ARRANQUE, s0 = 0;
    for (const parada of [...paradas, { s: largo, ultima: true }]) {
      const dur = Math.max(0.8, (parada.s - s0) / VELOCIDAD);
      tramos.push({ t0: tt, t1: tt + dur, s0, s1: parada.s });
      tt += dur;
      if (!parada.ultima) { parada.t = tt; tt += PAUSA; }
      s0 = parada.s;
    }
    fin = tt + 0.7;

    ecuacion.textContent = caso.ecuacion;
    factorizada.innerHTML = '';
    tspans = caso.factores.map(f => { const s = make('tspan', { class: 'cs-factor' }, factorizada); s.textContent = f; return s; });
    if (tspans.length) make('tspan', {}, factorizada).textContent = ' = 0';
    else make('tspan', { class: 'cs-ecuacion--nota' }, factorizada).textContent = 'no se factoriza';

    // Las marcas de las raíces: el punto en el eje y su valor del lado donde no pasa la curva.
    marcas.innerHTML = '';
    raicesG = caso.raices.map(r => {
      const g = make('g', { opacity: 0 }, marcas);
      make('circle', { cx: xP(r), cy: yP(0), r: 4.6, class: 'cs-raiz' }, g);
      const pendiente = 2 * caso.a * r + caso.b;
      const lado = pendiente < 0 ? -1 : pendiente > 0 ? 1 : 0;
      texto(g, {
        x: xP(r) + lado * 8, y: yP(0) + (lado ? 17 : 20), class: 'cs-raiz-etiqueta',
        'text-anchor': lado < 0 ? 'end' : lado > 0 ? 'start' : 'middle'
      }, 'x = ' + numero(r));
      return g;
    });
    set(hueco, { d: `M${xP(caso.vertice)} ${yP(caso.f(caso.vertice)) + 7}V${yP(0)}`, opacity: 0 });
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  // El punto de la curva a una distancia s del inicio.
  function enCurva(s) {
    let i = muestras.findIndex(m => m.s >= s);
    if (i <= 0) return { ...muestras[Math.max(0, i)], i: Math.max(0, i) };
    const a = muestras[i - 1], b = muestras[i], u = (s - a.s) / ((b.s - a.s) || 1);
    return { x: a.x + (b.x - a.x) * u, px: a.px + (b.px - a.px) * u, py: a.py + (b.py - a.py) * u, i };
  }

  function draw(tiempo) {
    let s = 0;
    for (const tr of tramos) if (tiempo >= tr.t0) s = tr.s0 + (tr.s1 - tr.s0) * suave((tiempo - tr.t0) / (tr.t1 - tr.t0));
    const p = enCurva(s);
    let d = `M${r2(muestras[0].px)} ${r2(muestras[0].py)}`;
    for (let k = 1; k < p.i; k++) d += `L${r2(muestras[k].px)} ${r2(muestras[k].py)}`;
    d += `L${r2(p.px)} ${r2(p.py)}`;
    set(curva, { d: tiempo < ARRANQUE ? 'M0 0' : d });
    // El punto y su altura se apagan al final: queda la curva con sus raíces.
    const ultimo = tramos[tramos.length - 1];
    const visible = tiempo < ARRANQUE ? suave(tiempo / ARRANQUE) : 1 - suave((tiempo - ultimo.t1) / 0.6);
    set(punto, { cx: p.px, cy: p.py, opacity: visible });
    set(altura, { d: `M${r2(p.px)} ${r2(p.py)}V${r2(yP(0))}`, opacity: visible * (Math.abs(p.py - yP(0)) > 6 ? 1 : 0) });
    paradas.forEach((parada, k) => {
      const llego = tiempo >= parada.t;
      const op = suave((tiempo - parada.t) / 0.5);
      if (raicesG[k]) set(raicesG[k], { opacity: op });
      // Cada parada enciende su factor: en (x − 2)² hay uno solo para la raíz doble.
      if (tspans[k]) tspans[k].classList.toggle('es-cero', llego);
      if (!caso.raices.length) set(hueco, { opacity: op });
    });
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  // En la tele, la escena empieza desde el principio cada vez que su pantalla aparece.
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'dos', true);
  return {
    update(dt) { if (t < fin) { t += dt; draw(t); } },
    still() { t = fin; draw(t); }
  };
}

/* ---------------- Dos rectas que se cruzan ----------------
   Cada ecuación con x y y es una recta: sus puntos son los pares que la cumplen. Primero
   aparecen, uno por uno, los pares enteros que cumplen la primera ecuación y la recta que
   los une; luego los de la segunda. La solución del sistema es el punto que está en las dos.
   Cuadrícula de −1 a 6 en los dos ejes, con la misma escala (30 px por unidad), para que
   las rectas tengan su inclinación verdadera. Se comprueba al cargar que la solución cumple
   las dos ecuaciones, que las paralelas no se cruzan y que «la misma» es la misma recta. */
const SISTEMAS = {
  cruzan: { e1: [1, 1, 5], e2: [1, -1, 1], resultado: ['x = 3', 'y = 2'], notas: ['3 + 2 = 5 ✓', '3 − 2 = 1 ✓'], solucion: [3, 2] },
  paralelas: { e1: [1, 1, 5], e2: [1, 1, 2], resultado: ['Sin solución'], notas: ['x + y no puede', 'valer 5 y 2'] },
  misma: { e1: [1, 1, 5], e2: [2, 2, 10], resultado: ['Infinitas', 'soluciones'], notas: ['2x + 2y = 10 es', 'x + y = 5 por 2'] }
};
const Q = { MIN: -1, MAX: 6, U: 30, X0: 34, Y0: 14 };
const xQ = x => Q.X0 + (x - Q.MIN) * Q.U;
const yQ = y => Q.Y0 + (Q.MAX - y) * Q.U;
const QX1 = xQ(Q.MAX), QY1 = yQ(Q.MIN);
const DERECHA = 262;

// a x + b y = c escrito: «x + y = 5», «2x + 2y = 10».
function recta([a, b, c]) {
  const t = (k, l) => (Math.abs(k) === 1 ? '' : Math.abs(k)) + l;
  return (a < 0 ? MENOS : '') + t(a, 'x') + (b < 0 ? ' ' + MENOS + ' ' : ' + ') + t(b, 'y') + ' = ' + numero(c);
}
// Los pares enteros de 0 a 5 que cumplen la ecuación.
const pares = ([a, b, c]) => {
  const lista = [];
  for (let x = 0; x <= 5; x++) for (let y = 0; y <= 5; y++) if (a * x + b * y === c) lista.push([x, y]);
  return lista;
};
// El tramo de la recta que cae dentro de la cuadrícula, de izquierda a derecha.
function tramo([a, b, c]) {
  const pts = [];
  for (const x of [Q.MIN, Q.MAX]) { const y = (c - a * x) / b; if (y >= Q.MIN - 1e-9 && y <= Q.MAX + 1e-9) pts.push([x, y]); }
  for (const y of [Q.MIN, Q.MAX]) { const x = (c - b * y) / a; if (x > Q.MIN + 1e-9 && x < Q.MAX - 1e-9) pts.push([x, y]); }
  pts.sort((p, q) => p[0] - q[0]);
  return [pts[0], pts[pts.length - 1]];
}

for (const [clave, s] of Object.entries(SISTEMAS)) {
  const det = s.e1[0] * s.e2[1] - s.e2[0] * s.e1[1];
  s.ec1 = recta(s.e1);
  s.ec2 = recta(s.e2);
  if (clave === 'cruzan') {
    const [x, y] = s.solucion;
    if (det === 0 || s.e1[0] * x + s.e1[1] * y !== s.e1[2] || s.e2[0] * x + s.e2[1] * y !== s.e2[2]) throw new Error('rectas: la solución no cumple');
  } else if (det !== 0) throw new Error(`rectas: ${clave} se cruzan`);
  const proporcional = s.e2.every((v, i) => v * s.e1[0] === s.e1[i] * s.e2[0]);
  if ((clave === 'misma') !== proporcional) throw new Error(`rectas: ${clave} no es lo que dice`);
  s.puntos1 = pares(s.e1);
  s.puntos2 = pares(s.e2);
  s.tramo1 = tramo(s.e1);
  s.tramo2 = tramo(s.e2);
}

function rectas(svg) {
  const root = svg.closest('[data-rectas]');
  const botones = root ? [...root.querySelectorAll('[data-sistema]')] : [];
  const panel = root ? root.querySelector('[data-rectas-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-sistema]').forEach(n => { textos[n.dataset.textoSistema] = n.innerHTML; });

  const fondo = make('g', {}, svg);
  for (let v = Q.MIN; v <= Q.MAX; v++) {
    make('path', { d: `M${xQ(v)} ${Q.Y0}V${QY1}`, class: 'cs-rejilla' }, fondo);
    make('path', { d: `M${Q.X0} ${yQ(v)}H${QX1}`, class: 'cs-rejilla' }, fondo);
    texto(fondo, { x: xQ(v), y: QY1 + 16, class: 'cs-numero', 'text-anchor': 'middle' }, numero(v));
    texto(fondo, { x: Q.X0 - 6, y: yQ(v) + 3.4, class: 'cs-numero', 'text-anchor': 'end' }, numero(v));
  }
  make('path', { d: `M${Q.X0} ${yQ(0)}H${QX1 + 1}`, class: 'cs-eje' }, fondo);
  make('path', { d: `M${QX1 + 7} ${yQ(0)}l-7 -3.5v7z`, class: 'cs-punta-eje' }, fondo);
  make('path', { d: `M${xQ(0)} ${QY1}V${Q.Y0 - 1}`, class: 'cs-eje' }, fondo);
  make('path', { d: `M${xQ(0)} ${Q.Y0 - 7}l-3.5 7h7z`, class: 'cs-punta-eje' }, fondo);
  texto(fondo, { x: QX1 + 4, y: yQ(0) + 14, class: 'cs-nombre-eje' }, 'x');
  texto(fondo, { x: xQ(0) + 7, y: Q.Y0 + 3, class: 'cs-nombre-eje' }, 'y');

  const capa = make('g', {}, svg);
  const linea1 = make('path', { class: 'cs-recta cs-recta--1' }, capa);
  const linea2 = make('path', { class: 'cs-recta cs-recta--2' }, capa);
  const puntos = make('g', {}, capa);
  const cruce = make('circle', { r: 0, class: 'cs-cruce' }, capa);
  const cruceTexto = make('text', { class: 'cs-cruce-etiqueta', opacity: 0 }, capa);

  // La columna de la derecha: las dos ecuaciones con su muestra de línea, y lo que resulta.
  const lado = make('g', {}, svg);
  const leyenda = [36, 68].map((y, i) => {
    const g = make('g', { opacity: 0 }, lado);
    make('path', { d: `M${DERECHA} ${y - 5}h20`, class: `cs-recta cs-recta--${i + 1}` }, g);
    return { g, t: texto(g, { x: DERECHA + 26, y, class: 'cs-leyenda' }, '') };
  });
  const resultado = [122, 146].map(y => texto(lado, { x: DERECHA, y, class: 'cs-resultado', opacity: 0 }, ''));
  const notas = [180, 199].map(y => texto(lado, { x: DERECHA, y, class: 'cs-nota', opacity: 0 }, ''));

  let clave = null, s = null, t = 0, linea = null, marcas1 = [], marcas2 = [];

  function lineaDeTiempo() {
    const L = { ec1: 0.4 };
    L.puntos1 = s.puntos1.map((_, i) => 1.0 + 0.4 * i);
    L.recta1 = 1.2 + 0.4 * s.puntos1.length;
    L.ec2 = L.recta1 + 1.6;
    L.puntos2 = s.puntos2.map((_, i) => L.ec2 + 0.6 + 0.4 * i);
    L.recta2 = L.ec2 + 0.8 + 0.4 * s.puntos2.length;
    L.resultado = L.recta2 + 1.6;
    L.notas = [L.resultado + 0.7, L.resultado + 1.3];
    L.fin = L.notas[1] + 0.8;
    return L;
  }

  function armar(nueva) {
    clave = nueva;
    s = SISTEMAS[clave];
    linea = lineaDeTiempo();
    puntos.innerHTML = '';
    marcas1 = s.puntos1.map(([x, y]) => make('circle', { cx: xQ(x), cy: yQ(y), r: 3.6, class: 'cs-par cs-par--1', opacity: 0 }, puntos));
    // En «la misma recta» los pares de la segunda son los mismos: se marcan con un anillo.
    marcas2 = s.puntos2.map(([x, y]) => make('circle', {
      cx: xQ(x), cy: yQ(y), r: clave === 'misma' ? 6.5 : 3.6, class: 'cs-par ' + (clave === 'misma' ? 'cs-par--anillo' : 'cs-par--2'), opacity: 0
    }, puntos));
    // La misma recta: la segunda va punteada encima de la primera (también en su muestra).
    linea2.classList.toggle('cs-recta--encima', clave === 'misma');
    leyenda[1].g.querySelector('path').classList.toggle('cs-recta--encima', clave === 'misma');
    leyenda[0].t.textContent = s.ec1;
    leyenda[1].t.textContent = s.ec2;
    resultado.forEach((n, i) => { n.textContent = s.resultado[i] || ''; });
    notas.forEach((n, i) => { n.textContent = s.notas[i] || ''; });
    if (s.solucion) {
      const [x, y] = s.solucion;
      set(cruce, { cx: xQ(x), cy: yQ(y) });
      set(cruceTexto, { x: xQ(x) + 14, y: yQ(y) + 4.5 });
      cruceTexto.textContent = '(' + x + ', ' + y + ')';
    }
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  const aparece = (tiempo, desde, dura = 0.4) => suave((tiempo - desde) / dura);
  function dibujaRecta(nodo, [[xa, ya], [xb, yb]], avance) {
    const u = suave(avance);
    set(nodo, { d: u > 0 ? `M${xQ(xa)} ${yQ(ya)}L${r2(xQ(xa + (xb - xa) * u))} ${r2(yQ(ya + (yb - ya) * u))}` : 'M0 0', opacity: u > 0 ? 1 : 0 });
  }

  function draw(tiempo) {
    set(leyenda[0].g, { opacity: aparece(tiempo, linea.ec1) });
    marcas1.forEach((m, i) => set(m, { opacity: aparece(tiempo, linea.puntos1[i], 0.3) }));
    dibujaRecta(linea1, s.tramo1, (tiempo - linea.recta1) / 1.2);
    set(leyenda[1].g, { opacity: aparece(tiempo, linea.ec2) });
    marcas2.forEach((m, i) => set(m, { opacity: aparece(tiempo, linea.puntos2[i], 0.3) }));
    dibujaRecta(linea2, s.tramo2, (tiempo - linea.recta2) / 1.2);
    resultado.forEach(n => set(n, { opacity: aparece(tiempo, linea.resultado, 0.5) }));
    notas.forEach((n, i) => set(n, { opacity: aparece(tiempo, linea.notas[i], 0.5) }));
    const anillo = s.solucion ? aparece(tiempo, linea.resultado, 0.6) : 0;
    set(cruce, { r: 9 * anillo, opacity: anillo });
    set(cruceTexto, { opacity: s.solucion ? aparece(tiempo, linea.resultado + 0.3, 0.5) : 0 });
  }

  function elige(nueva, animar) {
    if (!SISTEMAS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sistema === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.sistema, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.sistema : 'cruzan', true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(t); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { parabola, rectas };
const scenes = [...document.querySelectorAll('[data-escena-cs]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaCs](svg)
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
