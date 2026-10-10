/* Escena de Conversiones de unidades (Física, semana 2): la fracción que vale 1.
   Mismo contrato que las demás escenas: { update(dt), still() }; el reloj compartido sólo
   avanza las escenas visibles y, con movimiento reducido, se dibuja el cuadro final. Cuando la
   escena llega a la tele (tercial:diapositiva) o con «Repetir», empieza de nuevo.

   Arriba se arma la cuenta (HTML, con las fracciones de la lección): aparece el factor y se
   tachan las unidades que se cancelan. Abajo, en el SVG, se ve que la cantidad no cambia:
   - 2.4 km → m y 150 min → h: dos reglas alineadas, una en cada unidad. La marca de 1 km es
     la de 1,000 m: por eso 1,000 m / 1 km vale 1. La barra no cambia de largo, sólo de nombre.
   - 72 km/h → m/s: el auto de Magnitudes y unidades (4.0 m de largo, llantas de 0.31 m que
     giran lo que avanza el auto: no patinan) recorre 20 m en 1 s. Va en cámara lenta, un
     segundo en tres, para que se alcance a ver.
   - 1 cm² → mm²: el cuadro de 1 cm por lado se parte en 10 columnas (el factor) y luego en
     10 filas (el cuadrado del factor): 100 cuadritos de 1 mm².
   Cada caso se comprueba al cargar: que su cuenta dé el resultado y que su dibujo quepa.
   La escena usa data-escena-fisica para que las pruebas la encuentren, pero esta lección no
   carga escenas-fisica.js: ese módulo no conoce la escena «conversion». */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const NB = ' ';
const decimal = n => n.toFixed(1);

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

function texto(parent, x, y, clase, contenido, ancla = 'middle') {
  const t = make('text', { x, y, class: clase, 'text-anchor': ancla }, parent);
  t.textContent = contenido;
  return t;
}

/* ---------------- La cuenta (HTML) ----------------
   data-aparece="paso": la pieza llega con ese paso; data-tacha="paso": la raya se dibuja. */
const fr = (n, d) => `<span class="fr"><span class="fr__n">${n}</span><span class="fr__d">${d}</span></span>`;
const un = (simbolo, paso) => `<span class="conv-u" data-tacha="${paso}">${simbolo}</span>`;
const pieza = (html, paso, clase = '') => `<span class="conv-pieza${clase}"${paso ? ` data-aparece="${paso}"` : ''}>${html}</span>`;
const op = (signo, paso) => pieza(signo, paso, ' conv-op');
const med = (n, u) => n + NB + u;

/* ---------------- Los casos ----------------
   pasos: nombre → [inicio, duración] en segundos. fin: cuando la imagen se queda quieta. */
const CASOS = {
  km: {
    tipo: 'reglas',
    cuenta: pieza(med('2.4', un('km', 'tacha'))) + op('×', 'factor') +
      pieza(fr(med('1,000', 'm'), med('1', un('km', 'tacha'))), 'factor') +
      op('=', 'resultado') + pieza(med('2,400', 'm'), 'resultado', ' conv-resultado'),
    comprueba: () => 2.4 * 1000 === 2400,
    pasos: { barra: [0.6, 1.8], factor: [3.0, 0.9], tacha: [4.7, 0.9], resultado: [6.4, 0.9] },
    fin: 7.8,
    regla: {
      max: 3, menor: 0.1, media: 0.5, mayor: 1, valor: 2.4, igual: 1,
      arriba: { unidad: 'km', numeros: [[0, '0'], [1, '1'], [2, '2'], [3, '3']], lectura: med('2.4', 'km') },
      abajo: { unidad: 'm', numeros: [[0, '0'], [1, '1,000'], [2, '2,000'], [3, '3,000']], lectura: med('2,400', 'm') }
    }
  },
  min: {
    tipo: 'reglas',
    cuenta: pieza(med('150', un('min', 'tacha'))) + op('×', 'factor') +
      pieza(fr(med('1', 'h'), med('60', un('min', 'tacha'))), 'factor') +
      op('=', 'resultado') + pieza(med('2.5', 'h'), 'resultado', ' conv-resultado'),
    comprueba: () => 150 / 60 === 2.5,
    pasos: { barra: [0.6, 1.8], factor: [3.0, 0.9], tacha: [4.7, 0.9], resultado: [6.4, 0.9] },
    fin: 7.8,
    regla: {
      max: 180, menor: 10, media: 30, mayor: 60, valor: 150, igual: 60,
      arriba: { unidad: 'min', numeros: [[0, '0'], [60, '60'], [120, '120'], [180, '180']], lectura: med('150', 'min') },
      abajo: { unidad: 'h', numeros: [[0, '0'], [60, '1'], [120, '2'], [180, '3']], lectura: med('2.5', 'h') }
    }
  },
  vel: {
    tipo: 'auto',
    cuenta: pieza(fr(med('72', un('km', 'tachaKm')), med('1', un('h', 'tachaH')))) + op('×', 'factorKm') +
      pieza(fr(med('1,000', 'm'), med('1', un('km', 'tachaKm'))), 'factorKm') + op('×', 'factorH') +
      pieza(fr(med('1', un('h', 'tachaH')), med('3,600', 's')), 'factorH') +
      op('=', 'resultado') + pieza(med('20', 'm/s'), 'resultado', ' conv-resultado'),
    comprueba: () => 72 * 1000 / 3600 === 20,
    pasos: { factorKm: [0.8, 0.9], tachaKm: [2.5, 0.9], factorH: [4.2, 0.9], tachaH: [5.9, 0.9], resultado: [7.6, 0.9], auto: [9.3, 3.0], cota: [12.7, 0.8] },
    fin: 13.8,
    auto: { v: 20, x0: 2.5, T: 1 }
  },
  area: {
    tipo: 'cuadro',
    cuenta: pieza(med('1', un('cm²', 'tacha'))) + op('×', 'factor') +
      pieza('<span class="conv-par">(</span>' + fr(med('10', 'mm'), med('1', un('cm', 'tacha'))) +
        '<span class="conv-par">)</span><span class="conv-exp" data-aparece="cuadrado">2</span>', 'factor', ' conv-pot') +
      op('=', 'resultado') + pieza(med('100', 'mm²'), 'resultado', ' conv-resultado'),
    comprueba: () => 10 * 10 === 100,
    pasos: { factor: [0.8, 0.9], columnas: [2.0, 1.8], cuadrado: [4.6, 0.8], filas: [5.6, 1.8], tacha: [8.2, 0.9], resultado: [9.9, 0.9] },
    fin: 11.3
  }
};

for (const [clave, c] of Object.entries(CASOS)) {
  if (!c.comprueba()) throw new Error(`conversiones: la cuenta de ${clave} no da`);
  for (const [paso, [t0, dur]] of Object.entries(c.pasos)) {
    if (t0 + dur > c.fin) throw new Error(`conversiones: ${clave}.${paso} termina después del final`);
  }
}

/* ---------------- Dos reglas alineadas ----------------
   La de arriba en la unidad de partida (marcas hacia arriba) y la de abajo en la de llegada
   (marcas hacia abajo). Las dos usan la misma escala: 330 px para todo el largo. */
const XA = 28, ANCHO = 330;
const Y_LECTURA_ARRIBA = 22, Y_REGLA_ARRIBA = 60, Y_BARRA = 82, Y_REGLA_ABAJO = 104, Y_LECTURA_ABAJO = 150;

function dibujaReglas(capa, R) {
  const X = v => XA + v * ANCHO / R.max;
  const guia = make('path', { d: `M${X(R.igual)} ${Y_REGLA_ARRIBA}V${Y_REGLA_ABAJO}`, class: 'conv-guia' }, capa);
  const finArriba = make('path', { d: `M${X(R.valor)} ${Y_LECTURA_ARRIBA + 6}V${Y_REGLA_ARRIBA}`, class: 'conv-marca-fin' }, capa);
  const finAbajo = make('path', { d: `M${X(R.valor)} ${Y_REGLA_ABAJO}V${Y_LECTURA_ABAJO - 15}`, class: 'conv-marca-fin' }, capa);
  const barra = make('path', { class: 'conv-barra' }, capa);

  // La unidad va después del último número más ancho de las dos reglas (mono: 6 px por carácter).
  const ultimo = lado => lado.numeros[lado.numeros.length - 1][1].length;
  const xUnidad = X(R.max) + Math.max(ultimo(R.arriba), ultimo(R.abajo)) * 3 + 7;

  function regla(y, signo, lado) {
    const g = make('g', {}, capa);
    let menores = '', mayores = '';
    const pasos = Math.round(R.max / R.menor);
    for (let k = 0; k <= pasos; k++) {
      const v = k * R.menor;
      const esMayor = Math.abs(v / R.mayor - Math.round(v / R.mayor)) < 1e-9;
      const esMedia = Math.abs(v / R.media - Math.round(v / R.media)) < 1e-9;
      const largo = esMayor ? 8 : esMedia ? 6 : 4;
      const d = `M${r2(X(v))} ${y}V${y - signo * largo}`;
      if (esMayor) mayores += d; else menores += d;
    }
    make('path', { d: `M${X(0)} ${y}H${X(R.max)}`, class: 'conv-regla__eje' }, g);
    make('path', { d: menores, class: 'conv-regla__marca' }, g);
    make('path', { d: mayores, class: 'conv-regla__marca conv-regla__marca--mayor' }, g);
    const yNumero = signo > 0 ? y - 14 : y + 21;
    const numeros = lado.numeros.map(([v, t]) => texto(g, X(v), yNumero, 'conv-regla__numero', t));
    texto(g, xUnidad, yNumero, 'conv-regla__unidad', lado.unidad, 'start');
    const lectura = texto(g, X(R.valor), signo > 0 ? Y_LECTURA_ARRIBA : Y_LECTURA_ABAJO,
      'conv-lectura' + (signo > 0 ? '' : ' conv-lectura--nueva'), lado.lectura);
    const igual = numeros[lado.numeros.findIndex(([v]) => v === R.igual)];
    return { g, lectura, igual };
  }
  const arriba = regla(Y_REGLA_ARRIBA, 1, R.arriba);
  const abajo = regla(Y_REGLA_ABAJO, -1, R.abajo);

  return function draw(a) {
    const largo = R.valor * suave(a.barra);
    set(barra, { d: largo > 0 ? `M${X(0)} ${Y_BARRA}H${r2(X(largo))}` : 'M0 0' });
    const lecturaArriba = clamp((a.barra - 0.8) / 0.2);
    arriba.lectura.setAttribute('opacity', r2(lecturaArriba));
    finArriba.setAttribute('opacity', r2(lecturaArriba));
    // Con el factor llega la regla de la otra unidad y se ve que 1 km y 1,000 m son la misma marca.
    const f = suave(a.factor);
    abajo.g.setAttribute('opacity', r2(f));
    guia.setAttribute('opacity', r2(f));
    arriba.igual.classList.toggle('es-igual', f > 0.5);
    abajo.igual.classList.toggle('es-igual', f > 0.5);
    const res = suave(a.resultado);
    abajo.lectura.setAttribute('opacity', r2(res));
    finAbajo.setAttribute('opacity', r2(res));
  };
}

/* ---------------- El auto en la pista ----------------
   El mismo auto de Magnitudes y unidades: 4.0 m de largo, 1.44 m de alto, llantas de 0.31 m.
   Pista de 25 m, 14 px por metro. Su centro va de 2.5 m a 22.5 m: 20 m en 1 s. */
const S = 14, X0P = 25, PISO = 128, EJE = 146, LARGO_PISTA = 25, RADIO = 0.31, CAMARA_LENTA = 3;
const xDe = x => X0P + x * S;
const CARROCERIA = [
  [-2.0, 0.32], [-2.02, 0.74], [-1.98, 1.0], [-1.72, 1.36], [-1.45, 1.44], [0.15, 1.44],
  [0.95, 0.98], [1.85, 0.83], [2.0, 0.68], [2.0, 0.36], [1.88, 0.3]
];
const EJES = [1.25, -1.3];
const ARCO = 0.4;
const VENTANA = [[0.78, 1.0], [0.12, 1.33], [-1.38, 1.33], [-1.62, 1.02]];
const Y_RELOJ = 40, Y_COTA = 84;

{
  const { v, x0, T } = CASOS.vel.auto;
  const fin = x0 + v * T;
  if (v * T !== 20) throw new Error('conversiones: el auto no recorre 20 m en 1 s');
  if (x0 - 2.0 < -0.7 || fin + 2.0 > LARGO_PISTA + 0.7) throw new Error('conversiones: el auto se sale de la pista');
  if (v * T < 4.2) throw new Error('conversiones: se enciman las copias del auto');
}

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

// Mirando a la derecha; «giro» es lo que han girado las llantas (distancia ÷ radio).
function pon(partes, x, giro) {
  const X = u => xDe(x) + u * S;
  const Y = h => PISO - h * S;
  const p = ([u, h]) => `${r2(X(u))} ${r2(Y(h))}`;
  const [ejeDelantero, ejeTrasero] = EJES;
  let d = `M${p(CARROCERIA[0])}`;
  for (const punto of CARROCERIA.slice(1)) d += `L${p(punto)}`;
  d += `L${p([ejeDelantero + ARCO, 0.3])}`;
  d += `A${ARCO * S} ${ARCO * S} 0 0 0 ${p([ejeDelantero - ARCO, 0.3])}`;
  d += `L${p([ejeTrasero + ARCO, 0.3])}`;
  d += `A${ARCO * S} ${ARCO * S} 0 0 0 ${p([ejeTrasero - ARCO, 0.3])}Z`;
  set(partes.cuerpo, { d });
  set(partes.vidrio, { d: 'M' + VENTANA.map(p).join('L') + 'Z' });
  set(partes.poste, { d: `M${p([-0.42, 1.34])}L${p([-0.32, 1.34])}L${p([-0.32, 1.0])}L${p([-0.42, 1.0])}Z` });
  set(partes.faro, { d: `M${p([1.96, 0.71])}L${p([1.72, 0.79])}L${p([1.74, 0.69])}Z` });
  set(partes.calavera, { d: `M${p([-2.01, 0.8])}L${p([-1.86, 0.8])}L${p([-1.86, 0.94])}L${p([-1.99, 0.94])}Z` });
  partes.llantas.forEach(({ ll, rayos }, i) => {
    set(ll, { transform: `translate(${r2(X(EJES[i]))} ${r2(Y(RADIO))})` });
    let dr = '';
    for (let k = 0; k < 5; k++) {
      const a = giro + k * 2 * Math.PI / 5;
      dr += `M${r2(Math.cos(a) * 0.05 * S)} ${r2(Math.sin(a) * 0.05 * S)}L${r2(Math.cos(a) * 0.19 * S)} ${r2(Math.sin(a) * 0.19 * S)}`;
    }
    set(rayos, { d: dr });
  });
}

function dibujaPista(capa, A) {
  const fondo = make('g', {}, capa);
  make('path', { d: `M${xDe(-0.7)} ${PISO}H${xDe(LARGO_PISTA + 0.7)}`, class: 'pista__piso' }, fondo);
  let marcas = '';
  for (let n = 0; n <= LARGO_PISTA; n++) {
    const larga = n % 5 === 0;
    marcas += `M${xDe(n)} ${EJE - (larga ? 5 : 3)}V${EJE + (larga ? 5 : 3)}`;
  }
  make('path', { d: `M${xDe(0)} ${EJE}H${xDe(LARGO_PISTA)}`, class: 'pista__eje' }, fondo);
  make('path', { d: marcas, class: 'pista__marca' }, fondo);
  for (let n = 0; n <= LARGO_PISTA; n += 5) texto(fondo, xDe(n), EJE + 17, 'pista__numero', String(n));
  texto(fondo, xDe(LARGO_PISTA) + 10, EJE + 4, 'conv-regla__unidad', 'm', 'start');

  const copias = make('g', {}, capa);
  const tiempos = make('g', {}, capa);
  const principal = dibujaAuto(capa, 'auto');
  const lista = [0, A.T].map(s => {
    const x = A.x0 + A.v * s;
    const partes = dibujaAuto(copias, 'auto auto--copia');
    pon(partes, x, (x - A.x0) / RADIO);
    const etiqueta = texto(tiempos, xDe(x), PISO - 1.44 * S - 6, 'pista__tiempo', s + NB + 's');
    return { s, nodos: [partes.g, etiqueta] };
  });
  // La cota: lo que avanzó la punta del auto en ese segundo.
  const cota = make('g', { class: 'conv-cota-grupo' }, capa);
  const xa = xDe(A.x0 + 2.0), xb = xDe(A.x0 + 2.0 + A.v * A.T);
  make('path', { d: `M${xa} ${Y_COTA}H${xb}M${xa} ${Y_COTA - 5}V${Y_COTA + 5}M${xb} ${Y_COTA - 5}V${Y_COTA + 5}`, class: 'conv-cota' }, cota);
  texto(cota, (xa + xb) / 2, Y_COTA - 7, 'conv-cota__texto', med(A.v * A.T, 'm') + ' en 1' + NB + 's');
  const reloj = make('text', { x: X0P, y: Y_RELOJ, class: 'conv-reloj' }, capa);
  const relojT = make('tspan', {}, reloj);
  const relojD = make('tspan', { dx: 22 }, reloj);
  texto(capa, 390, Y_RELOJ, 'conv-nota', 'cámara lenta', 'end');

  return function draw(a) {
    // El video avanza un segundo de física en CAMARA_LENTA segundos de pantalla.
    const tv = A.T * clamp(a.auto);
    const x = A.x0 + A.v * tv;
    pon(principal, x, (x - A.x0) / RADIO);
    const empezo = a.auto > 0;
    lista.forEach(c => c.nodos.forEach(n => { n.style.display = empezo && tv >= c.s ? '' : 'none'; }));
    // La lectura avanza de décima en décima de segundo y d sale de ese mismo t: siempre d = 20 × t.
    const tLeido = Math.floor(tv * 10 + 1e-9) / 10;
    relojT.textContent = 't = ' + decimal(tLeido) + NB + 's';
    relojD.textContent = 'd = ' + decimal(A.v * tLeido) + NB + 'm';
    cota.setAttribute('opacity', r2(suave(a.cota)));
  };
}
if (CASOS.vel.pasos.auto[1] !== CASOS.vel.auto.T * CAMARA_LENTA) throw new Error('conversiones: la cámara lenta no es la anunciada');

/* ---------------- El centímetro cuadrado ----------------
   Un cuadro de 1 cm por lado, aumentado: 120 px de lado, 12 px por milímetro. */
const CX = 140, CY = 12, LADO = 120, MM = LADO / 10;

function dibujaCuadro(capa) {
  const g = make('g', {}, capa);
  const columnas = [], filas = [];
  for (let k = 1; k < 10; k++) {
    columnas.push(make('path', { d: `M${CX + k * MM} ${CY}V${CY + LADO}`, class: 'conv-cuadro__linea' }, g));
    filas.push(make('path', { d: `M${CX} ${CY + k * MM}H${CX + LADO}`, class: 'conv-cuadro__linea' }, g));
  }
  const uno = make('rect', { x: CX + 9 * MM, y: CY, width: MM, height: MM, class: 'conv-cuadro__uno' }, g);
  make('rect', { x: CX, y: CY, width: LADO, height: LADO, class: 'conv-cuadro' }, g);
  const abajo = make('text', { x: CX + LADO / 2, y: CY + LADO + 20, class: 'conv-cuadro__texto', 'text-anchor': 'middle' }, g);
  make('tspan', {}, abajo).textContent = med('1', 'cm');
  const abajoMm = make('tspan', { class: 'conv-cuadro__nuevo' }, abajo);
  abajoMm.textContent = ' = ' + med('10', 'mm');
  const izq = make('text', { x: CX - 10, y: CY + LADO / 2 + 5, class: 'conv-cuadro__texto', 'text-anchor': 'end' }, g);
  make('tspan', {}, izq).textContent = med('1', 'cm');
  const izqMm = make('tspan', { x: CX - 10, dy: 18, class: 'conv-cuadro__nuevo', 'text-anchor': 'end' }, izq);
  izqMm.textContent = '= ' + med('10', 'mm');
  // El cuadrito de 1 mm² y la cuenta de cuántos caben.
  const rotulo = make('g', {}, g);
  make('path', { d: `M${CX + LADO + 3} ${CY + MM / 2}H${CX + LADO + 13}`, class: 'conv-cuadro__guia' }, rotulo);
  texto(rotulo, CX + LADO + 17, CY + MM / 2 + 5, 'conv-cuadro__texto', med('1', 'mm²'), 'start');
  const cuenta = texto(g, CX + LADO + 17, CY + LADO / 2 + 5, 'conv-cuadro__cuenta', '10 × 10 = 100', 'start');
  const cuadritos = texto(g, CX + LADO + 17, CY + LADO / 2 + 23, 'conv-nota', 'cuadritos de 1' + NB + 'mm²', 'start');
  texto(g, 390, CY + LADO + 20, 'conv-nota', 'aumentado', 'end');

  return function draw(a) {
    // Las líneas llegan una tras otra, de izquierda a derecha y de arriba abajo.
    columnas.forEach((n, k) => n.setAttribute('opacity', r2(clamp(a.columnas * 9 - k))));
    filas.forEach((n, k) => n.setAttribute('opacity', r2(clamp(a.filas * 9 - k))));
    abajoMm.setAttribute('opacity', r2(suave(a.columnas * 3)));
    izqMm.setAttribute('opacity', r2(suave(a.filas * 3)));
    const res = suave(a.resultado);
    [uno, rotulo, cuenta, cuadritos].forEach(n => n.setAttribute('opacity', r2(res)));
  };
}

/* ---------------- La escena ---------------- */
function conversion(svg) {
  const root = svg.closest('[data-conversion]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-conv-texto]') : null;
  const cuenta = root ? root.querySelector('[data-conv-cuenta]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const capa = make('g', {}, svg);
  let clave = null, caso = null, t = 0, dibuja = () => {}, aparecen = [], tachas = [];

  function armar(nueva) {
    clave = nueva;
    caso = CASOS[clave];
    capa.innerHTML = '';
    if (caso.tipo === 'reglas') dibuja = dibujaReglas(capa, caso.regla);
    else if (caso.tipo === 'auto') dibuja = dibujaPista(capa, caso.auto);
    else dibuja = dibujaCuadro(capa);
    if (cuenta) {
      cuenta.innerHTML = caso.cuenta;
      aparecen = [...cuenta.querySelectorAll('[data-aparece]')];
      tachas = [...cuenta.querySelectorAll('[data-tacha]')];
    }
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  function draw(tiempo) {
    const a = {};
    for (const [paso, [t0, dur]] of Object.entries(caso.pasos)) a[paso] = clamp((tiempo - t0) / dur);
    aparecen.forEach(n => { n.style.opacity = r2(suave(a[n.dataset.aparece])); });
    tachas.forEach(n => { n.style.setProperty('--tacha', r2(suave(a[n.dataset.tacha]))); });
    dibuja(a);
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : caso.fin;
    draw(t);
    // La cuenta cambia de alto con el caso: en la tele se vuelve a medir la pantalla.
    svg.dispatchEvent(new CustomEvent('tercial:cambia', { bubbles: true }));
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'km', true);
  return {
    update(dt) { if (t < caso.fin) { t += dt; draw(t); } },
    still() { t = caso.fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { conversion };
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
