/* Escenas de «Expresiones algebraicas» (Matemáticas, semana 4). Mismo contrato que
   escenas-matematicas.js: cada escena es { update(dt), still() }; el reloj compartido sólo
   avanza las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final.

   Las fichas algebraicas, a escala: el cuadrito mide 1 × 1 (12 unidades del viewBox), la
   tira mide 1 × x y el cuadrado, x × x. La x mide 40 unidades, 3.33 cuadritos: a propósito
   no es un número entero de cuadritos, porque x es un número que todavía no se conoce.
   Las fichas positivas van rellenas y paradas sobre la línea del cero; las negativas van
   huecas y colgadas debajo de ella, como en la recta numérica de la semana 1.

   - «fichas»: cada término pone sus fichas en el lugar de su forma (x², x o número). En cada
     lugar, una ficha de arriba y una de abajo se cancelan: se encogen hasta la línea del cero.
     Lo que queda es la expresión reducida.
   - «sustituir»: dar un valor a x es medir la x. Las tiras y los cuadrados se encogen hasta
     medir ese número de cuadritos. Si x es negativa, cada tira da media vuelta (pasa al otro
     lado de la línea) y cada cuadrado da dos, una por cada x: queda como estaba.
   Cada ejemplo se comprueba al cargar: lo que dicen las fichas tiene que ser lo que dice el texto. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

/* ---------------- Medidas comunes ---------------- */
const U = 12, X = 40, ANCHO = 400, BASE = 112;
const MEDIDA = { x2: [X, X], x: [U, X], 1: [U, U] };      // [ancho, alto] de cada ficha
const HUECO = { x2: 8, x: 6, 1: 5 };                      // separación entre columnas
const LITERAL = { x2: 'x²', x: 'x', 1: '' };
const SEPARACION = 26;                                    // entre un lugar y el siguiente
const Y_ECUACION = 30, Y_LUGAR = 58, Y_RESULTADO = 174, LINEA = [26, 392];

// «4x», « − x», « + 3»: un término como se escribe, con su signo.
function terminoTexto([c, tipo], primero) {
  const abs = Math.abs(c), lit = LITERAL[tipo];
  const cuerpo = lit && abs === 1 ? lit : abs + lit;
  if (primero) return (c < 0 ? MENOS : '') + cuerpo;
  return (c < 0 ? ' ' + MENOS + ' ' : ' + ') + cuerpo;
}
function polinomio(terminos) {
  const vivos = terminos.filter(([c]) => c !== 0);
  return vivos.length ? vivos.map((t, i) => terminoTexto(t, i === 0)).join('') : '0';
}
// La suma de los coeficientes de cada forma, en el orden x², x, número.
function reduce(terminos) {
  return ['x2', 'x', '1'].map(tipo => [terminos.filter(([, t]) => t === tipo).reduce((s, [c]) => s + c, 0), tipo])
    .filter(([c], i, todos) => c !== 0 || false);
}

// Cada forma tiene su lugar: tantas columnas como fichas de arriba o de abajo, lo que sea más.
function disposicion(terminos) {
  const tipos = ['x2', 'x', '1'].filter(tipo => terminos.some(([, t]) => t === tipo));
  const lugares = tipos.map(tipo => {
    const pos = terminos.filter(([c, t]) => t === tipo && c > 0).reduce((s, [c]) => s + c, 0);
    const neg = terminos.filter(([c, t]) => t === tipo && c < 0).reduce((s, [c]) => s - c, 0);
    const cols = Math.max(pos, neg), w = MEDIDA[tipo][0];
    return { tipo, pos, neg, cols, ancho: cols * w + (cols - 1) * HUECO[tipo] };
  });
  const total = lugares.reduce((s, z) => s + z.ancho, 0) + SEPARACION * (lugares.length - 1);
  let x = (ANCHO - total) / 2;
  for (const z of lugares) { z.x0 = x; z.centro = x + z.ancho / 2; x += z.ancho + SEPARACION; }
  return lugares;
}
const columna = (z, j) => z.x0 + MEDIDA[z.tipo][0] / 2 + j * (MEDIDA[z.tipo][0] + HUECO[z.tipo]);

// Las fichas de cada término, en orden: las positivas llenan su fila de arriba de izquierda a
// derecha y las negativas, la de abajo.
function reparte(terminos, lugares) {
  const ocupadas = {};
  const fichas = [];
  terminos.forEach(([c, tipo], termino) => {
    const signo = Math.sign(c), clave = tipo + signo;
    for (let k = 0; k < Math.abs(c); k++) {
      ocupadas[clave] = (ocupadas[clave] || 0) + 1;
      fichas.push({ tipo, signo, termino, col: ocupadas[clave] - 1, lugar: lugares.find(z => z.tipo === tipo) });
    }
  });
  return fichas;
}

// Comprobación: dentro del dibujo, sin salirse de la línea del cero ni encimarse.
function compruebaLugares(nombre, lugares) {
  const izq = lugares[0].x0, der = lugares[lugares.length - 1].x0 + lugares[lugares.length - 1].ancho;
  if (izq < LINEA[0] + 8 || der > LINEA[1] - 4) throw new Error(`fichas: ${nombre} no cabe (${r2(izq)}–${r2(der)})`);
  lugares.forEach((z, i) => {
    if (i && z.x0 < lugares[i - 1].x0 + lugares[i - 1].ancho + SEPARACION - 0.01) throw new Error(`fichas: ${nombre} encima sus lugares`);
  });
}

/* Una ficha en pantalla: su contorno, sus cuadritos (al sustituir) y, si lleva, su nombre. El
   contorno es un path (no un rect) para que la revisión de WebKit, que compara los atributos d,
   vea que la escena se mueve. */
function nuevaFicha(capa, nombre) {
  const g = make('g', {}, capa);
  const rect = make('path', { class: 'ficha ficha--mas', d: 'M0 0' }, g);
  const celdas = make('path', { class: 'ficha__celdas', d: 'M0 0' }, g);
  const rotulo = nombre ? make('text', { class: 'ficha__nombre', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g) : null;
  if (rotulo) rotulo.textContent = nombre;
  return { g, rect, celdas, rotulo };
}

// Dibuja una ficha centrada en cx, con ancho w y alto con signo h (positivo: arriba del cero).
// filas × cols cuadritos se marcan con opacidad «cuadritos».
function pinta(f, cx, w, h, { filas = 0, cols = 0, cuadritos = 0, opacidad = 1 } = {}) {
  const alto = Math.abs(h);
  const visible = alto > 0.3 && opacidad > 0.01;
  set(f.g, { opacity: visible ? r2(opacidad) : 0 });
  if (!visible) return;
  const x = cx - w / 2, y = h >= 0 ? BASE - alto : BASE;
  set(f.rect, { d: `M${r2(x)} ${r2(y)}h${r2(w)}v${r2(alto)}h${r2(-w)}Z`, class: 'ficha ' + (h >= 0 ? 'ficha--mas' : 'ficha--menos') });
  let d = '';
  if (cuadritos > 0.01) {
    for (let i = 1; i < filas; i++) { const yy = y + alto * i / filas; d += `M${r2(x)} ${r2(yy)}H${r2(x + w)}`; }
    for (let j = 1; j < cols; j++) { const xx = x + w * j / cols; d += `M${r2(xx)} ${r2(y)}V${r2(y + alto)}`; }
  }
  set(f.celdas, { d: d || 'M0 0', opacity: r2(cuadritos), class: 'ficha__celdas ' + (h >= 0 ? 'ficha__celdas--mas' : 'ficha__celdas--menos') });
  if (f.rotulo) set(f.rotulo, { x: cx, y: y + alto / 2, opacity: alto > 24 ? 1 : 0 });
}

// Lo que comparten las dos escenas: la línea del cero con sus lados, la ecuación y los textos
// de la sección (pastillas, el texto del caso y «Repetir»).
function armazon(svg, raiz) {
  const fondo = make('g', {}, svg);
  make('path', { d: `M${LINEA[0]} ${BASE}H${LINEA[1]}`, class: 'fichas__cero' }, fondo);
  const mas = make('text', { x: 14, y: BASE - 14, class: 'fichas__lado', 'text-anchor': 'middle' }, fondo);
  mas.textContent = '+';
  const menos = make('text', { x: 14, y: BASE + 22, class: 'fichas__lado', 'text-anchor': 'middle' }, fondo);
  menos.textContent = MENOS;
  const botones = raiz ? [...raiz.querySelectorAll('[data-caso]')] : [];
  const panel = raiz ? raiz.querySelector('[data-escena-texto]') : null;
  const repetir = raiz ? raiz.querySelector('[data-repetir]') : null;
  const textos = {};
  if (raiz) raiz.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });
  return { botones, panel, repetir, textos };
}

// El reloj de una escena: elige un caso, lo arma, lo dibuja y responde a pastillas, «Repetir»
// y a la tele (que la escena empiece desde el principio cada vez que su pantalla aparece).
function conReloj(svg, base, casos, armar) {
  const { botones, panel, repetir, textos } = base;
  let clave = null, t = 0, escena = null;
  function elige(nueva, animar) {
    if (!casos[nueva]) return;
    clave = nueva;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    escena = armar(nueva);
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
    t = animar && !reducedMotion.matches ? 0 : escena.fin;
    escena.dibuja(t);
  }
  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : Object.keys(casos)[0], true);
  return {
    update(dt) { if (t < escena.fin) { t += dt; escena.dibuja(t); } },
    still() { t = escena.fin; escena.dibuja(t); }
  };
}

// Ritmo adaptativo: cada término pone sus fichas una tras otra; con pocas fichas, despacio,
// y con muchas, más seguidas, para que ningún término tarde más de un segundo y medio.
function ponFichas(terminos, fichas, t, tramos) {
  terminos.forEach((term, i) => {
    const suyas = fichas.filter(f => f.termino === i);
    const paso = clamp(0.5 / suyas.length, 0.08, 0.17);
    suyas.forEach((f, k) => { f.crece = [t + 0.1 + k * paso, t + 0.1 + k * paso + 0.45]; });
    const t1 = t + 0.1 + (suyas.length - 1) * paso + 0.45 + 0.3;
    tramos.push({ terminos: [i], t0: t, t1 });
    t = t1 + 0.15;
  });
  return t;
}

/* ---------------- Escena 1 · Las fichas se juntan con sus semejantes ---------------- */
const CASOS_FICHAS = {
  'suma-producto': { especial: true },
  corto: { terminos: [[4, 'x'], [3, '1'], [-1, 'x'], [-5, '1']], resultado: '3x − 2' },
  largo: { terminos: [[2, 'x2'], [3, 'x'], [-4, '1'], [-1, 'x2'], [-5, 'x'], [6, '1']], resultado: 'x² − 2x + 2' }
};

for (const [nombre, caso] of Object.entries(CASOS_FICHAS)) {
  if (caso.especial) continue;
  const suma = reduce(caso.terminos);
  if (polinomio(suma) !== caso.resultado) throw new Error(`fichas: ${nombre} reduce a ${polinomio(suma)}, no a ${caso.resultado}`);
  compruebaLugares(nombre, disposicion(caso.terminos));
}
// x + x frente a x · x: las dos tiras se juntan sin encimarse, y el cuadrado queda aparte.
const SUMA = { izq: 95, der: 145, junta: 120, cuadrado: 290 };
if (SUMA.der - SUMA.izq < U + 20) throw new Error('fichas: las tiras de x + x empiezan encimadas');
if (SUMA.junta + U + 30 > SUMA.cuadrado - X / 2) throw new Error('fichas: el cuadrado de x · x queda pegado a las tiras');

function fichas(svg) {
  const raiz = svg.closest('[data-fichas]');
  const base = armazon(svg, raiz);
  const capaLugares = make('g', {}, svg);
  const capa = make('g', {}, svg);
  const capaTexto = make('g', {}, svg);

  function armarSumaProducto() {
    capaLugares.innerHTML = ''; capa.innerHTML = ''; capaTexto.innerHTML = '';
    const ecuacion = (x, partes, resultado) => {
      const txt = make('text', { x, y: Y_ECUACION, class: 'fichas__ecuacion', 'text-anchor': 'middle' }, capaTexto);
      partes.forEach(p => { make('tspan', {}, txt).textContent = p; });
      const res = make('tspan', { class: 'fichas__igual' }, txt);
      res.textContent = resultado;
      return res;
    };
    const igualSuma = ecuacion(SUMA.junta, ['x + x'], ' = 2x');
    const igualProducto = ecuacion(SUMA.cuadrado, ['x · x'], ' = x²');
    const tiraA = nuevaFicha(capa, 'x'), tiraB = nuevaFicha(capa, 'x'), cuadro = nuevaFicha(capa, 'x²');
    const ladoAbajo = make('text', { x: SUMA.cuadrado, y: BASE + 17, class: 'fichas__medida', 'text-anchor': 'middle' }, capaTexto);
    ladoAbajo.textContent = 'x';
    const ladoIzq = make('text', { x: SUMA.cuadrado - X / 2 - 7, y: BASE - X / 2, class: 'fichas__medida', 'text-anchor': 'end', 'dominant-baseline': 'central' }, capaTexto);
    ladoIzq.textContent = 'x';
    const T = { a: [0.5, 1.1], b: [1.3, 1.9], junta: [2.4, 3.4], suma: [3.6, 4.1], cuadro: [4.8, 5.6], lados: [5.8, 6.3], producto: [6.5, 7.0] };
    const p = ([a, b], t) => suave((t - a) / (b - a));
    return {
      fin: 7.6,
      dibuja(t) {
        const j = p(T.junta, t);
        const xa = SUMA.izq + (SUMA.junta - U / 2 - SUMA.izq) * j;
        const xb = SUMA.der + (SUMA.junta + U / 2 - SUMA.der) * j;
        pinta(tiraA, xa, U, X * p(T.a, t));
        pinta(tiraB, xb, U, X * p(T.b, t));
        pinta(cuadro, SUMA.cuadrado, X, X * p(T.cuadro, t));
        set(igualSuma, { opacity: r2(p(T.suma, t)) });
        set(ladoAbajo, { opacity: r2(p(T.lados, t)) });
        set(ladoIzq, { opacity: r2(p(T.lados, t)) });
        set(igualProducto, { opacity: r2(p(T.producto, t)) });
      }
    };
  }

  function armarLugares(caso) {
    capaLugares.innerHTML = ''; capa.innerHTML = ''; capaTexto.innerHTML = '';
    const lugares = disposicion(caso.terminos);
    const fichasCaso = reparte(caso.terminos, lugares);
    lugares.forEach(z => {
      const r = make('text', { x: z.centro, y: Y_LUGAR, class: 'fichas__lugar', 'text-anchor': 'middle' }, capaLugares);
      r.textContent = z.tipo === '1' ? 'números' : LITERAL[z.tipo];
    });
    // La ecuación, un tspan por término, para iluminar el que está poniendo sus fichas.
    const ecuacion = make('text', { x: ANCHO / 2, y: Y_ECUACION, class: 'fichas__ecuacion', 'text-anchor': 'middle' }, capaTexto);
    const tspans = caso.terminos.map((term, i) => { const s = make('tspan', {}, ecuacion); s.textContent = terminoTexto(term, i === 0); return s; });
    // Abajo de cada lugar, lo que queda: juntos se leen como la expresión reducida.
    const suma = reduce(caso.terminos);
    const resultados = lugares.map(z => {
      const termino = suma.find(([, t]) => t === z.tipo);
      const primero = suma[0] && suma[0][1] === z.tipo;
      const r = make('text', { x: z.centro, y: Y_RESULTADO, class: 'fichas__resultado', 'text-anchor': 'middle' }, capaTexto);
      r.textContent = termino ? terminoTexto(termino, primero).trim() : '0';
      return r;
    });
    fichasCaso.forEach(f => { f.dibujo = nuevaFicha(capa, null); });

    // Línea de tiempo: cada término pone sus fichas; luego, lugar por lugar, los pares se
    // cancelan; lo que queda se recorre al principio de su lugar y aparece el resultado.
    const tramos = [];
    let t = ponFichas(caso.terminos, fichasCaso, 0.6, tramos) + 0.25;
    lugares.forEach(z => {
      const pares = Math.min(z.pos, z.neg);
      z.pares = pares;
      if (!pares) return;
      const paso = clamp(0.4 / pares, 0.08, 0.15);
      fichasCaso.filter(f => f.lugar === z && f.col < pares).forEach(f => {
        f.cancela = [t + 0.3 + f.col * paso, t + 0.3 + f.col * paso + 0.65];
      });
      const t1 = t + 0.3 + (pares - 1) * paso + 0.65 + 0.3;
      tramos.push({ terminos: caso.terminos.map((term, i) => (term[1] === z.tipo ? i : -1)).filter(i => i >= 0), t0: t, t1 });
      t = t1 + 0.15;
    });
    // Las que quedan se recorren hasta quedar centradas bajo su resultado; todas van del mismo
    // lado de la línea y en el mismo orden, así que ninguna pasa por encima de otra.
    const desliza = [t, t + 0.7];
    fichasCaso.forEach(f => {
      const z = f.lugar, w = MEDIDA[z.tipo][0], quedan = Math.abs(z.pos - z.neg);
      const ancho = quedan * w + (quedan - 1) * HUECO[z.tipo];
      f.xFinal = f.col >= (z.pares || 0)
        ? z.centro - ancho / 2 + w / 2 + (f.col - (z.pares || 0)) * (w + HUECO[z.tipo])
        : columna(z, f.col);
    });
    t += 0.9;
    lugares.forEach((z, k) => { z.aparece = [t + k * 0.3, t + k * 0.3 + 0.5]; });
    t += lugares.length * 0.3 + 0.7;

    return {
      fin: t,
      dibuja(tiempo) {
        const activos = new Set();
        tramos.forEach(tr => { if (tiempo >= tr.t0 && tiempo < tr.t1) tr.terminos.forEach(i => activos.add(i)); });
        tspans.forEach((s, i) => s.setAttribute('class', activos.has(i) ? 'fichas__termino--activo' : ''));
        const d = suave((tiempo - desliza[0]) / (desliza[1] - desliza[0]));
        fichasCaso.forEach(f => {
          const [w, h] = MEDIDA[f.tipo];
          let g = suave((tiempo - f.crece[0]) / (f.crece[1] - f.crece[0]));
          if (f.cancela) g *= 1 - suave((tiempo - f.cancela[0]) / (f.cancela[1] - f.cancela[0]));
          const desde = columna(f.lugar, f.col), hasta = f.xFinal;
          pinta(f.dibujo, desde + (hasta - desde) * d, w, f.signo * h * g);
        });
        resultados.forEach((r, k) => set(r, { opacity: r2(suave((tiempo - lugares[k].aparece[0]) / 0.5)) }));
      }
    };
  }

  return conReloj(svg, base, CASOS_FICHAS, clave => (CASOS_FICHAS[clave].especial ? armarSumaProducto() : armarLugares(CASOS_FICHAS[clave])));
}

/* ---------------- Escena 2 · Sustituir es medir la x ---------------- */
const CASOS_SUSTITUIR = {
  mas2: { terminos: [[2, 'x2'], [-3, 'x'], [1, '1']], valor: 2, resultado: 3 },
  menos2: { terminos: [[2, 'x2'], [-3, 'x'], [1, '1']], valor: -2, resultado: 15 },
  'menos-cuadrado': { terminos: [[-1, 'x2']], valor: -3, resultado: -9 }
};
const EXPONENTE = { x2: 2, x: 1, 1: 0 };
const valorDe = ([c, tipo], v) => c * v ** EXPONENTE[tipo];
const numero = n => (n < 0 ? MENOS + -n : String(n));
// «2(−2)²», « − 3(−2)», « + 1»: cada x cambia por su valor, entre paréntesis.
function sustituido([c, tipo], v, primero) {
  const abs = Math.abs(c);
  const cuerpo = tipo === '1' ? String(abs) : (abs === 1 ? '' : abs) + '(' + numero(v) + ')' + (tipo === 'x2' ? '²' : '');
  if (primero) return (c < 0 ? MENOS : '') + cuerpo;
  return (c < 0 ? ' ' + MENOS + ' ' : ' + ') + cuerpo;
}

for (const [nombre, caso] of Object.entries(CASOS_SUSTITUIR)) {
  const total = caso.terminos.reduce((s, t) => s + valorDe(t, caso.valor), 0);
  if (total !== caso.resultado) throw new Error(`sustituir: ${nombre} vale ${total}, no ${caso.resultado}`);
  // Cada cuadrito mide lo mismo que el cuadrito suelto: |x| cuadritos caben exactos en la x.
  if (Math.abs(caso.valor) * U > X) throw new Error(`sustituir: ${nombre} no cabe en la x dibujada`);
  compruebaLugares(nombre, disposicion(caso.terminos));
}

function sustituir(svg) {
  const raiz = svg.closest('[data-sustituir]');
  const base = armazon(svg, raiz);
  const capa = make('g', {}, svg);
  const capaTexto = make('g', {}, svg);

  function armar(clave) {
    const caso = CASOS_SUSTITUIR[clave], v = caso.valor, n = Math.abs(v);
    capa.innerHTML = ''; capaTexto.innerHTML = '';
    const lugares = disposicion(caso.terminos);
    const fichasCaso = reparte(caso.terminos, lugares);
    fichasCaso.forEach(f => { f.dibujo = nuevaFicha(capa, null); });

    const linea1 = make('text', { x: 24, y: Y_ECUACION - 4, class: 'fichas__ecuacion' }, capaTexto);
    const tspans = caso.terminos.map((term, i) => { const s = make('tspan', {}, linea1); s.textContent = terminoTexto(term, i === 0); return s; });
    const dato = make('tspan', { class: 'fichas__dato' }, linea1);
    dato.textContent = '   si x = ' + numero(v);
    const linea2 = make('text', { x: 24, y: Y_ECUACION + 22, class: 'fichas__ecuacion' }, capaTexto);
    const sust = make('tspan', {}, linea2);
    sust.textContent = caso.terminos.map((t, i) => sustituido(t, v, i === 0)).join('');
    const valores = caso.terminos.map(t => valorDe(t, v));
    const fin2 = make('tspan', { class: 'fichas__igual' }, linea2);
    fin2.textContent = (valores.length > 1 ? ' = ' + valores.map((x, i) => (i === 0 ? numero(x) : (x < 0 ? ' ' + MENOS + ' ' : ' + ') + Math.abs(x))).join('') : '') +
      ' = ' + numero(caso.resultado);
    const resultados = lugares.map((z, k) => {
      const x = caso.terminos.filter(([, t]) => t === z.tipo).reduce((s, t) => s + valorDe(t, v), 0);
      const r = make('text', { x: z.centro, y: Y_RESULTADO, class: 'fichas__resultado', 'text-anchor': 'middle' }, capaTexto);
      r.textContent = k === 0 ? numero(x) : (x < 0 ? MENOS + ' ' : '+ ') + Math.abs(x);
      return r;
    });

    // Línea de tiempo.
    const tramos = [];
    let t = ponFichas(caso.terminos, fichasCaso, 0.6, tramos) + 0.3;
    const aparece = [t, t + 0.6];          // la sustitución, escrita
    const mide = [t + 0.3, t + 1.5];       // la x pasa a medir |v| cuadritos
    const cuadritos = [t + 1.5, t + 1.9];
    t += 2.3;
    let voltea1 = null, cuadro1 = null, cuadro2 = null;
    if (v < 0) {
      if (caso.terminos.some(([, tipo]) => tipo === 'x')) { voltea1 = [t, t + 0.9]; t += 1.3; }
      if (caso.terminos.some(([, tipo]) => tipo === 'x2')) {
        cuadro1 = [t, t + 0.85]; cuadro2 = [t + 1.15, t + 2.0]; t += 2.4;
      }
    }
    lugares.forEach((z, k) => { z.aparece = [t + k * 0.35, t + k * 0.35 + 0.5]; });
    t += lugares.length * 0.35 + 0.4;
    const total = [t, t + 0.6];
    t += 1.1;

    const p = (tramo, tiempo) => (tramo ? suave((tiempo - tramo[0]) / (tramo[1] - tramo[0])) : 0);
    return {
      fin: t,
      dibuja(tiempo) {
        tspans.forEach((s, i) => s.setAttribute('class', tiempo >= tramos[i].t0 && tiempo < tramos[i].t1 ? 'fichas__termino--activo' : ''));
        set(sust, { opacity: r2(p(aparece, tiempo)) });
        set(fin2, { opacity: r2(p(total, tiempo)) });
        const lado = X + (n * U - X) * p(mide, tiempo);
        const marcas = p(cuadritos, tiempo);
        fichasCaso.forEach(f => {
          const g = suave((tiempo - f.crece[0]) / (f.crece[1] - f.crece[0]));
          const cx = columna(f.lugar, f.col);
          if (f.tipo === '1') { pinta(f.dibujo, cx, U, f.signo * U * g); return; }
          // Media vuelta: el alto con signo pasa por cero y sale del otro lado de la línea.
          const giro = f.tipo === 'x' ? Math.cos(Math.PI * p(voltea1, tiempo))
            : Math.cos(Math.PI * (p(cuadro1, tiempo) + p(cuadro2, tiempo)));
          const w = f.tipo === 'x2' ? lado : U;
          pinta(f.dibujo, cx, w, f.signo * lado * g * giro, { filas: n, cols: f.tipo === 'x2' ? n : 1, cuadritos: marcas });
        });
        resultados.forEach((r, k) => set(r, { opacity: r2(p(lugares[k].aparece, tiempo)) }));
      }
    };
  }

  return conReloj(svg, base, CASOS_SUSTITUIR, armar);
}

/* ---------------- Reloj compartido ---------------- */
const factories = { fichas, sustituir };
const scenes = [...document.querySelectorAll('[data-escena-mate]')]
  .filter(svg => factories[svg.dataset.escenaMate])
  .map(svg => ({ svg, visible: false, ...factories[svg.dataset.escenaMate](svg) }));
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
