/* Escenas del tema 3 de Química ECOEMS: la reacción química.
   Mismo contrato que escenas-atomo.js y escenas-tabla.js: cada escena es
   { update(dt), still() }; el reloj compartido sólo avanza las escenas
   visibles y, con movimiento reducido, cada una dibuja un fotograma fijo que
   resume el proceso.
   El terracota marca lo positivo (cargas, números de oxidación que suben) y lo
   que hay que mirar; los electrones van en tinta, como en el tema 2. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const round = value => Math.round(value * 100) / 100;
const easeIn = value => { const p = clamp(value); return p * p * p; };
const easeOut = value => { const p = 1 - clamp(value); return 1 - p * p * p; };

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, typeof value === 'number' ? round(value) : value);
  }
}

function text(parent, x, y, content, cls, extra) {
  const node = make('text', { x, y, class: cls, ...(extra || {}) }, parent);
  node.textContent = content;
  return node;
}

const ultimo = new WeakMap();
function fade(node, value) {
  const v = Math.round(clamp(value) * 100) / 100;
  if (ultimo.get(node) === v) return;
  ultimo.set(node, v);
  node.setAttribute('opacity', v);
}

/* Fórmula con subíndices y superíndice de carga. Las partes son
   [texto, 'sub' | 'sup' | null, ¿es la incógnita?]. */
function formula(parent, x, y, partes, cls) {
  const node = make('text', { x, y, class: cls }, parent);
  let base = 0;
  for (const [contenido, tipo, incognita] of partes) {
    const shift = tipo === 'sub' ? 6 : tipo === 'sup' ? -9 : 0;
    const span = make('tspan', { dy: shift - base }, node);
    span.textContent = contenido;
    if (tipo) span.setAttribute('class', 'escena__formula-indice');
    if (incognita) span.classList.add('escena__formula-incognita');
    base = shift;
  }
  return node;
}

// «+2», «−3», «0»: así se escriben los números de oxidación.
const signo = n => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

/* ---------------- 1 · Oxidación y reducción en la recta ----------------
   Izquierda: un átomo de cobre pierde dos electrones y queda como Cu²⁺.
   Derecha: un ion Fe³⁺ gana tres electrones y queda como hierro metálico.
   Abajo, la recta de los números de oxidación: al oxidarse el número sube y
   al reducirse baja. Los radios están a escala con valores reales: metálicos
   (Cu 128 pm, Fe 126 pm) e iónicos de Shannon (Cu²⁺ 73 pm, Fe³⁺ 64.5 pm). El
   tamaño cambia hasta que se van o llegan todos los electrones: así sólo se
   dibujan radios medidos. */
function recta(svg) {
  const T = 15;
  const ESCALA = .2;                 // px por pm
  const CU = { x: 112, y: 86, r0: 128 * ESCALA, r1: 73 * ESCALA };
  const FE = { x: 290, y: 86, r0: 64.5 * ESCALA, r1: 126 * ESCALA };
  const LINEA = { y: 186, x0: 44, x1: 356, min: -3, max: 4 };
  const xDe = n => LINEA.x0 + (n - LINEA.min) * (LINEA.x1 - LINEA.x0) / (LINEA.max - LINEA.min);
  const E_R = 5.2;

  // Encabezados de cada lado
  text(svg, CU.x, 22, 'oxidación', 'escena__clave escena__clave--acento', { 'text-anchor': 'middle' });
  text(svg, FE.x, 22, 'reducción', 'escena__clave', { 'text-anchor': 'middle' });
  // Todo lo que se mueve va en un grupo que se desvanece al reiniciar el ciclo.
  const vivo = make('g', {}, svg);

  // Átomos: cuerpo, símbolo y número de oxidación
  function atomo(sitio, simbolo) {
    const g = make('g', {}, vivo);
    const cuerpo = make('circle', { cx: sitio.x, cy: sitio.y, r: sitio.r0, class: 'escena__ion-cuerpo' }, g);
    const sim = text(g, sitio.x, sitio.y + 5.5, simbolo, 'escena__ion-simbolo', { 'text-anchor': 'middle' });
    const carga = text(g, 0, 0, '0', 'escena__ion-carga');
    return { g, cuerpo, sim, carga };
  }
  const cu = atomo(CU, 'Cu');
  const fe = atomo(FE, 'Fe');

  function electron(parent) {
    const g = make('g', {}, parent);
    make('circle', { r: E_R, class: 'escena__electron' }, g);
    make('path', { d: 'M-2.4 0H2.4', class: 'escena__menos' }, g);
    return g;
  }
  const capa = make('g', {}, vivo);
  // Cobre: dos electrones en su lado derecho que se alejan en línea recta,
  // hacia afuera. La carga se escribe arriba a la izquierda: nada se le cruza.
  const salen = [-28, 24].map((grados, i) => {
    const a = grados * Math.PI / 180;
    return {
      g: electron(capa), a, salida: 1.2 + i * 1.5,
      destino: { x: CU.x + Math.cos(a) * 96, y: CU.y + Math.sin(a) * 96 }
    };
  });
  // Hierro: tres electrones que llegan por la derecha, uno por uno, cada uno
  // directo al punto de la superficie que tiene enfrente (no cruzan el ion).
  const llegan = [-40, 0, 40].map((grados, i) => {
    const a = grados * Math.PI / 180;
    return { g: electron(capa), a, llegada: 6 + i * 1.25, origen: { x: FE.x + Math.cos(a) * 100, y: FE.y + Math.sin(a) * 100 } };
  });

  const ecuCu = formula(vivo, CU.x, 144, [['Cu → Cu', null], ['2+', 'sup'], [' + 2e', null], ['−', 'sup']], 'escena__ecuacion');
  ecuCu.setAttribute('text-anchor', 'middle');
  const ecuFe = formula(vivo, FE.x, 144, [['Fe', null], ['3+', 'sup'], [' + 3e', null], ['−', 'sup'], [' → Fe', null]], 'escena__ecuacion');
  ecuFe.setAttribute('text-anchor', 'middle');

  // Recta de los números de oxidación
  const recta = make('g', {}, svg);
  make('path', { d: `M${LINEA.x0 - 10} ${LINEA.y}H${LINEA.x1 + 10}`, class: 'escena__regla' }, recta);
  for (let n = LINEA.min; n <= LINEA.max; n += 1) {
    make('path', { d: `M${round(xDe(n))} ${LINEA.y - 4}V${LINEA.y + 4}`, class: 'escena__regla' }, recta);
    text(recta, xDe(n), LINEA.y + 17, signo(n), n === 0 ? 'escena__clave escena__clave--fuerte' : 'escena__clave', { 'text-anchor': 'middle' });
  }
  // Trazos: el del cobre arriba de la recta y el del hierro abajo de los números.
  const trazoCu = make('path', { class: 'escena__trazo escena__trazo--sube' }, vivo);
  const puntaCu = make('path', { class: 'escena__punta escena__punta--sube' }, vivo);
  const marcaCu = text(vivo, 0, LINEA.y - 21, 'Cu', 'escena__clave escena__clave--acento', { 'text-anchor': 'middle' });
  const trazoFe = make('path', { class: 'escena__trazo escena__trazo--baja' }, vivo);
  const puntaFe = make('path', { class: 'escena__punta escena__punta--baja' }, vivo);
  const marcaFe = text(vivo, 0, LINEA.y + 44, 'Fe', 'escena__clave', { 'text-anchor': 'middle' });
  const yCu = LINEA.y - 12, yFe = LINEA.y + 28;

  function flecha(trazo, punta, y, desde, hasta) {
    const x0 = xDe(desde), x1 = xDe(hasta);
    if (Math.abs(x1 - x0) < 1) { trazo.setAttribute('d', ''); punta.setAttribute('d', ''); return x1; }
    const dir = Math.sign(x1 - x0);
    trazo.setAttribute('d', `M${round(x0)} ${y}H${round(x1 - dir * 5)}`);
    punta.setAttribute('d', `M${round(x1)} ${y}l${-dir * 7} -3.6v7.2Z`);
    return x1;
  }

  function cargaDe(atom, sitio, r, n) {
    atom.carga.textContent = n === 0 ? '0' : (n > 0 ? `${n}+` : `${-n}−`);
    set(atom.carga, { x: sitio.x - r * .72 - 3, y: sitio.y - r * .72 - 1 });
    atom.carga.setAttribute('text-anchor', 'end');
    atom.carga.setAttribute('class', 'escena__ion-carga' + (n > 0 ? ' es-positiva' : ''));
    atom.carga.setAttribute('text-anchor', 'end');
  }

  function draw(t, final) {
    const tt = final ? 13 : t;
    fade(vivo, final ? 1 : smooth((T - tt) / .8) * smooth(tt / .5));

    // Cobre: cada electrón se despega de la superficie y se aleja acelerando.
    let perdidos = 0;
    salen.forEach(e => {
      const p = easeIn((tt - e.salida) / 1.1);
      const sx = CU.x + Math.cos(e.a) * (CU.r0 - 1), sy = CU.y + Math.sin(e.a) * (CU.r0 - 1);
      const x = mix(sx, e.destino.x, p), y = mix(sy, e.destino.y, p);
      e.g.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
      fade(e.g, 1 - smooth((p - .75) / .25));
      // Deja de contar como suyo cuando cruza la superficie.
      if (Math.hypot(x - CU.x, y - CU.y) > CU.r0 + E_R) perdidos += 1;
    });
    const rCu = mix(CU.r0, CU.r1, smooth((tt - 4) / .7));
    set(cu.cuerpo, { r: rCu });
    cargaDe(cu, CU, rCu, perdidos);
    fade(ecuCu, smooth((tt - 4.5) / .5));

    // Hierro: cada electrón llega frenando hasta la superficie del ion.
    let ganados = 0;
    llegan.forEach(e => {
      const p = easeOut((tt - e.llegada) / 1.1);
      const fx = FE.x + Math.cos(e.a) * (FE.r0 + E_R - 2), fy = FE.y + Math.sin(e.a) * (FE.r0 + E_R - 2);
      const x = mix(e.origen.x, fx, p), y = mix(e.origen.y, fy, p);
      fade(e.g, smooth(((tt - e.llegada) + .3) / .3) * (1 - smooth((tt - 9.4) / .4)));
      e.g.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
      if (p >= 1) ganados += 1;
    });
    const rFe = mix(FE.r0, FE.r1, smooth((tt - 9.6) / .7));
    set(fe.cuerpo, { r: rFe });
    cargaDe(fe, FE, rFe, 3 - ganados);
    fade(ecuFe, smooth((tt - 10.2) / .5));

    // Recta
    const xc = flecha(trazoCu, puntaCu, yCu, 0, perdidos);
    set(marcaCu, { x: xc });
    const xf = flecha(trazoFe, puntaFe, yFe, 3, 3 - ganados);
    set(marcaFe, { x: xf });
  }

  let t = 0;
  draw(0, false);
  return {
    update(dt) { t = (t + dt) % T; draw(t, false); },
    still() { draw(T, true); }
  };
}

/* ---------------- 2 · La suma es cero ----------------
   Cada átomo es un bloque tan largo como su número de oxidación: arriba los
   positivos, abajo los negativos. Primero aparecen los que dan las reglas;
   después crece el de la incógnita hasta que las dos filas miden lo mismo (o,
   en un ion, hasta que la diferencia es su carga). */
const COMPUESTOS = {
  h2so4: {
    partes: [['H', null], ['2', 'sub'], ['S', null, true], ['O', null], ['4', 'sub']],
    atomos: [['H', 1, 2], ['S', 6, 1, true], ['O', -2, 4]], carga: 0,
    texto: 'Cada H vale +1 y cada O, −2: 2(+1) + S + 4(−2) = 0, así que <strong>S = +6</strong>.'
  },
  kmno4: {
    partes: [['K', null], ['Mn', null, true], ['O', null], ['4', 'sub']],
    atomos: [['K', 1, 1], ['Mn', 7, 1, true], ['O', -2, 4]], carga: 0,
    texto: 'El potasio es del grupo IA: +1. Entonces +1 + Mn + 4(−2) = 0 y <strong>Mn = +7</strong>.'
  },
  k2cr2o7: {
    partes: [['K', null], ['2', 'sub'], ['Cr', null, true], ['2', 'sub', true], ['O', null], ['7', 'sub']],
    atomos: [['K', 1, 2], ['Cr', 6, 2, true], ['O', -2, 7]], carga: 0,
    texto: 'Hay dos cromos: 2(+1) + 2Cr + 7(−2) = 0, entonces 2Cr = +12 y <strong>Cr = +6</strong> cada uno.'
  },
  nh3: {
    partes: [['N', null, true], ['H', null], ['3', 'sub']],
    atomos: [['N', -3, 1, true], ['H', 1, 3]], carga: 0,
    texto: 'Aquí la incógnita es negativa: N + 3(+1) = 0, así que <strong>N = −3</strong>.'
  },
  fe2o3: {
    partes: [['Fe', null, true], ['2', 'sub', true], ['O', null], ['3', 'sub']],
    atomos: [['Fe', 3, 2, true], ['O', -2, 3]], carga: 0,
    texto: 'Tres oxígenos suman −6 y los reparten dos hierros: 2Fe = +6, así que <strong>Fe = +3</strong>. Por eso se llama óxido de hierro (III).'
  },
  so4: {
    partes: [['SO', null, true], ['4', 'sub'], ['2−', 'sup']],
    atomos: [['S', 6, 1, true], ['O', -2, 4]], carga: -2,
    texto: 'En un ion la suma es su carga: S + 4(−2) = −2, así que <strong>S = +6</strong>. Las dos filas no miden lo mismo: les separan las dos cargas negativas del ion.'
  },
  nh4: {
    partes: [['NH', null, true], ['4', 'sub'], ['+', 'sup']],
    atomos: [['N', -3, 1, true], ['H', 1, 4]], carga: 1,
    texto: 'La suma debe dar +1, la carga del ion: N + 4(+1) = +1, así que <strong>N = −3</strong>.'
  }
};

function sumacero(svg) {
  const root = svg.closest('[data-suma]');
  const buttons = [...root.querySelectorAll('[data-compuesto]')];
  const panel = root.querySelector('[data-suma-texto]');
  const U = 18, X0 = 108, ALTO = 32;
  const FILA = { pos: 74, neg: 130 };
  text(svg, 24, FILA.pos + 21, 'positivos', 'escena__clave');
  text(svg, 24, FILA.neg + 21, 'negativos', 'escena__clave');
  make('path', { d: `M${X0} ${FILA.pos - 8}V${FILA.neg + ALTO + 8}`, class: 'escena__regla' }, svg);
  const titulo = make('g', {}, svg);
  const capa = make('g', {}, svg);
  const cierre = make('g', {}, svg);
  const raya = make('path', { class: 'escena__igualdad' }, cierre);
  const leyenda = text(cierre, 0, 0, '', 'escena__clave escena__clave--acento');

  let key = null, t = 0, bloques = [], final = { x: 0 };

  function armar(clave) {
    const c = COMPUESTOS[clave];
    titulo.innerHTML = '';
    formula(titulo, 24, 44, c.partes, 'escena__formula escena__formula--grande');
    capa.innerHTML = '';
    bloques = [];
    const cursor = { pos: X0, neg: X0 };
    let orden = 0;
    // Primero los átomos conocidos, en el orden de la fórmula; la incógnita al final de su fila.
    const conocidos = c.atomos.filter(a => !a[3]), incognita = c.atomos.find(a => a[3]);
    for (const [simbolo, valor, cuantos, esIncognita] of [...conocidos, incognita]) {
      for (let k = 0; k < cuantos; k += 1) {
        const fila = valor > 0 ? 'pos' : 'neg';
        const ancho = Math.abs(valor) * U;
        const g = make('g', { transform: `translate(${cursor[fila]} ${FILA[fila]})` }, capa);
        const rect = make('rect', { width: ancho - 2, height: ALTO, rx: 3, class: 'escena__bloque' + (esIncognita ? ' es-incognita' : valor > 0 ? ' es-positivo' : ' es-negativo') }, g);
        const sim = text(g, (ancho - 2) / 2, 12, simbolo, 'escena__bloque-simbolo', { 'text-anchor': 'middle' });
        const val = text(g, (ancho - 2) / 2, 26, esIncognita ? '?' : signo(valor), 'escena__bloque-valor', { 'text-anchor': 'middle' });
        bloques.push({ g, rect, sim, val, ancho, valor, esIncognita, inicio: esIncognita ? 1.2 + k * .25 : .1 + orden * .1 });
        cursor[fila] += ancho;
        orden += 1;
      }
    }
    const pos = c.atomos.reduce((s, a) => s + (a[1] > 0 ? a[1] * a[2] : 0), 0);
    const neg = c.atomos.reduce((s, a) => s + (a[1] < 0 ? -a[1] * a[2] : 0), 0);
    // Comprobación: con la incógnita resuelta, la suma es la carga.
    if (pos - neg !== c.carga) throw new Error(`La suma de ${clave} no da su carga`);
    const xPos = X0 + pos * U, xNeg = X0 + neg * U;
    final = { xPos, xNeg };
    const xMax = Math.max(xPos, xNeg);
    // En un compuesto, una raya vertical marca que las filas miden lo mismo. En
    // un ion, una raya punteada marca lo que le falta a la fila más corta: la carga.
    const corta = xPos < xNeg ? 'pos' : 'neg';
    const yCorta = FILA[corta] + ALTO / 2;
    raya.setAttribute('d', c.carga === 0
      ? `M${xMax + 4} ${FILA.pos - 6}V${FILA.neg + ALTO + 6}`
      : `M${Math.min(xPos, xNeg) + 3} ${yCorta}H${xMax - 3}`);
    leyenda.textContent = c.carga === 0 ? 'suma 0' : `carga del ion: ${c.carga > 0 ? `${c.carga}+` : `${-c.carga}−`}`;
    set(leyenda, c.carga === 0
      ? { x: xMax + 10, y: FILA.pos + ALTO + 17 }
      : { x: Math.min(xPos, xNeg) + 4, y: corta === 'pos' ? FILA.pos - 8 : FILA.neg + ALTO + 16 });
    if (c.carga !== 0) raya.setAttribute('class', 'escena__igualdad escena__igualdad--carga');
    else raya.setAttribute('class', 'escena__igualdad');
    if (panel) panel.innerHTML = c.texto;
  }

  function draw(time) {
    bloques.forEach(b => {
      if (b.esIncognita) {
        const p = easeOut((time - b.inicio) / .9);
        set(b.rect, { width: Math.max(.01, (b.ancho - 2) * p) });
        fade(b.g, p > 0 ? 1 : 0);
        b.val.textContent = p >= 1 ? signo(b.valor) : '?';
        set(b.sim, { x: (b.ancho - 2) * p / 2 });
        set(b.val, { x: (b.ancho - 2) * p / 2 });
        // El símbolo y el «?» se ven en cuanto el bloque tiene ancho para ellos.
        const cabe = smooth(((b.ancho - 2) * p - 10) / 6);
        fade(b.val, cabe);
        fade(b.sim, cabe);
      } else {
        fade(b.g, smooth((time - b.inicio) / .25));
      }
    });
    fade(cierre, smooth((time - 2.4) / .4));
    if (panel) panel.style.opacity = String(round(smooth((time - 2.4) / .4)));
  }

  function select(next, animate) {
    if (!COMPUESTOS[next] || next === key) return;
    key = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.compuesto === key)));
    armar(key);
    t = animate && !reducedMotion.matches ? 0 : 10;
    draw(t);
  }

  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.compuesto, true)));
  select(buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.compuesto || 'h2so4', false);
  return {
    update(dt) { if (t < 10) { t += dt; draw(t); } },
    still() { t = 10; draw(t); }
  };
}

/* ---------------- 3 · Leer la fórmula por partes ----------------
   La fórmula se separa en sus partes (metal, no metal, oxígeno, OH, H o un
   ion con oxígeno); de las partes sale la familia, de la familia la receta y
   de la receta el nombre. Todo sobre el mismo eje izquierdo. */
const LECTURAS = {
  cao: { partes: [['Ca', '', 'metal'], ['O', '', 'oxígeno']], familia: 'óxido metálico',
    receta: 'óxido + de + metal', nombre: 'óxido de calcio' },
  co2: { partes: [['C', '', 'no metal'], ['O', '2', 'oxígeno']], familia: 'óxido no metálico (anhídrido)',
    receta: 'prefijo + óxido + de + no metal', nombre: 'dióxido de carbono', nota: 'El prefijo di- dice que hay 2 oxígenos. Con un solo carbono no se escribe mono-.' },
  koh: { partes: [['K', '', 'metal'], ['OH', '', 'hidróxido']], familia: 'hidróxido (base)',
    receta: 'hidróxido + de + metal', nombre: 'hidróxido de potasio' },
  hcl: { partes: [['H', '', 'hidrógeno'], ['Cl', '', 'no metal']], familia: 'hidrácido',
    receta: 'ácido + raíz del no metal + hídrico', nombre: 'ácido clorhídrico' },
  h2so4: { partes: [['H', '2', 'hidrógeno'], ['SO', '4', 'ion sulfato']], familia: 'oxiácido',
    receta: 'ácido + ion: -ato cambia a -ico', nombre: 'ácido sulfúrico' },
  fecl3: { partes: [['Fe', '', 'metal'], ['Cl', '3', 'no metal']], familia: 'sal binaria',
    receta: 'no metal + -uro + de + metal (número)', nombre: 'cloruro de hierro (III)', nota: 'El hierro tiene dos números de oxidación: aquí 3 cloros de −1 piden Fe = +3.' },
  kno3: { partes: [['K', '', 'metal'], ['NO', '3', 'ion nitrato']], familia: 'oxisal',
    receta: 'ion + de + metal', nombre: 'nitrato de potasio' },
  nahco3: { partes: [['Na', '', 'metal'], ['H', '', 'hidrógeno'], ['CO', '3', 'ion carbonato']], familia: 'sal ácida',
    receta: 'ion + ácido + de + metal', nombre: 'carbonato ácido de sodio', nota: 'Es el bicarbonato de sodio de la cocina.' }
};

function lectura(svg) {
  const root = svg.closest('[data-lectura]');
  const buttons = [...root.querySelectorAll('[data-formula]')];
  const X = 24;
  const capa = make('g', {}, svg);
  let key = null, t = 0, piezas = [];

  function armar(clave) {
    const L = LECTURAS[clave];
    capa.innerHTML = '';
    piezas = [];
    // Fórmula: cada parte es un grupo con su texto, su raya y su rótulo. La
    // parte siguiente empieza después de la más ancha de las dos cosas (la
    // fórmula o su rótulo), para que ningún rótulo se encime con el de al lado.
    let x = X;
    L.partes.forEach(([base, sub, rol], i) => {
      const g = make('g', {}, capa);
      const t1 = make('text', { x, y: 62, class: 'escena__lectura-formula' }, g);
      t1.textContent = base;
      if (sub) {
        const s1 = make('tspan', { dy: 9, class: 'escena__lectura-sub' }, t1);
        s1.textContent = sub;
      }
      const ancho = t1.getComputedTextLength() || base.length * 24;
      const raya = make('path', { d: `M${round(x + 1)} 76H${round(x + ancho - 1)}`, class: 'escena__lectura-raya escena__lectura-raya--' + (i % 3) }, g);
      const rotulo = text(g, x + 1, 92, rol, 'escena__clave');
      const anchoRotulo = rotulo.getComputedTextLength() || rol.length * 7.5;
      piezas.push({ nodos: [raya, rotulo], inicio: .25 + i * .35 });
      fade(raya, 0); fade(rotulo, 0);
      x += Math.max(ancho, anchoRotulo + 1) + 14;
    });
    const n = L.partes.length;
    const familia = text(capa, X, 124, '', 'escena__lectura-familia');
    familia.textContent = L.familia;
    const receta = text(capa, X, 146, L.receta, 'escena__clave');
    const nombre = text(capa, X, 180, L.nombre, 'escena__lectura-nombre');
    piezas.push({ nodos: [familia], inicio: .45 + n * .35 });
    piezas.push({ nodos: [receta], inicio: .85 + n * .35 });
    piezas.push({ nodos: [nombre], inicio: 1.3 + n * .35 });
    [familia, receta, nombre].forEach(node => fade(node, 0));
    const panel = root.querySelector('[data-lectura-nota]');
    if (panel) panel.textContent = L.nota || '';
  }

  function draw(time) {
    piezas.forEach(p => p.nodos.forEach(node => fade(node, smooth((time - p.inicio) / .35))));
  }

  function select(next, animate) {
    if (!LECTURAS[next] || next === key) return;
    key = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.formula === key)));
    armar(key);
    t = animate && !reducedMotion.matches ? 0 : 10;
    draw(t);
  }

  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.formula, true)));
  // La fórmula se mide con la fuente ya cargada; si llega después, se vuelve a armar.
  const inicial = buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.formula || 'cao';
  select(inicial, false);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { const k = key; key = null; select(k, false); });
  }
  return {
    update(dt) { if (t < 10) { t += dt; draw(t); } },
    still() { t = 10; draw(t); }
  };
}

/* ---------------- 4 · Cuatro tipos de reacción ----------------
   Los átomos o iones de los reactivos se reacomodan en el mismo lugar hasta
   formar los productos. Moléculas en modelo compacto, a escala (radios de van
   der Waals y distancias de enlace reales); iones en disolución con sus radios
   iónicos, dentro de un vaso. Las coreografías salen de reacomodos.py, que
   comprueba con números que nada se encime ni atraviese la lámina o el vaso.
   El texto de cada tipo vive en el HTML. */
/* REACOMODOS:inicio */
const REACOMODOS = {"sintesis":{"particulas":[{"el":"H","cls":"h","etiqueta":"H","claves":[[0,90.56,70,14.4],[0,90.56,70,14.4],[1,140.89,96.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,99.44,70,14.4],[0,99.44,70,14.4],[1,159.11,96.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,300.56,70,14.4],[0,300.56,70,14.4],[1,240.89,96.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,309.44,70,14.4],[0,309.44,70,14.4],[1,259.11,96.95,14.4]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,192.74,112,18.24],[0,192.74,112,18.24],[1,150,104,18.24]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,207.26,112,18.24],[0,207.26,112,18.24],[1,250,104,18.24]],"cambios":[]}],"unidos0":[[0,1],[2,3],[4,5]],"unidos1":[[0,4],[1,4],[2,5],[3,5]]},"descomposicion":{"particulas":[{"el":"H","cls":"h","etiqueta":"H","claves":[[0,102.22,80.52,14.4],[0,102.22,80.52,14.4],[1,108.89,116.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,121.78,103.48,14.4],[0,121.78,103.48,14.4],[1,127.11,116.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,278.22,80.52,14.4],[0,278.22,80.52,14.4],[1,272.89,116.95,14.4]],"cambios":[]},{"el":"H","cls":"h","etiqueta":"H","claves":[[0,297.78,103.48,14.4],[0,297.78,103.48,14.4],[1,291.11,116.95,14.4]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,103.18,92,18.24],[0,103.18,92,18.24],[1,118,124,18.24]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,120.82,92,18.24],[0,120.82,92,18.24],[1,192.74,52,18.24]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,279.18,92,18.24],[0,279.18,92,18.24],[1,207.26,52,18.24]],"cambios":[]},{"el":"O","cls":"o","etiqueta":"O","claves":[[0,296.82,92,18.24],[0,296.82,92,18.24],[1,282,124,18.24]],"cambios":[]}],"unidos0":[[0,4],[4,5],[5,1],[2,6],[6,7],[7,3]],"unidos1":[[0,4],[1,4],[2,7],[3,7],[5,6]]},"simple":{"particulas":[{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,181.62,78,9.38],[0.03,181.62,78,9.38],[0.21,146.97,62.5,5.18]],"cambios":[[0.1,"zn-ion"]]},{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,181.62,104,9.38]],"cambios":[]},{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,181.62,130,9.38],[0.31,181.62,130,9.38],[0.49,143.25,137.15,5.18]],"cambios":[[0.38,"zn-ion"]]},{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,218.38,92,9.38]],"cambios":[]},{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,218.38,118,9.38],[0.59,218.38,118,9.38],[0.77,265.93,97.21,5.18]],"cambios":[[0.66,"zn-ion"]]},{"el":"Zn","cls":"zn","etiqueta":"Zn","claves":[[0,218.38,144,9.38]],"cambios":[]},{"el":"Cu","cls":"cu-ion","etiqueta":"Cu","claves":[[0,131.53,116.01,5.11],[0.21,131.53,116.01,5.11],[0.43,181.62,78,8.96]],"cambios":[[0.41,"cu"]]},{"el":"Cu","cls":"cu-ion","etiqueta":"Cu","claves":[[0,144.85,159.65,5.11],[0.49,144.85,159.65,5.11],[0.71,181.62,130,8.96]],"cambios":[[0.69,"cu"]]},{"el":"Cu","cls":"cu-ion","etiqueta":"Cu","claves":[[0,263.82,118.12,5.11],[0.77,263.82,118.12,5.11],[0.99,218.38,118,8.96]],"cambios":[[0.97,"cu"]]},{"el":"SO4","cls":"sulfato","etiqueta":"SO₄²⁻","claves":[[0,123.7,84.17,18.06]],"cambios":[]},{"el":"SO4","cls":"sulfato","etiqueta":"SO₄²⁻","claves":[[0,298.28,110.98,18.06]],"cambios":[]},{"el":"SO4","cls":"sulfato","etiqueta":"SO₄²⁻","claves":[[0,110.95,138.24,18.06]],"cambios":[]}],"unidos0":[],"unidos1":[],"vaso":{"x0":80,"x1":320,"y0":34,"y1":170,"nivel":54},"lamina":{"x0":190,"x1":210,"y0":16,"y1":150},"iones":true},"doble":{"particulas":[{"el":"Ag","cls":"plata","etiqueta":"Ag⁺","claves":[[0,96.49,115.26,8.05],[0.04,96.49,115.26,8.05],[0.24,112.02,114.87,8.05],[0.38,148.2,161.95,8.05]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,152.07,116.67,12.67],[0.04,152.07,116.67,12.67],[0.24,132.74,114.87,12.67],[0.38,168.92,157.33,12.67]],"cambios":[]},{"el":"Ag","cls":"plata","etiqueta":"Ag⁺","claves":[[0,174.53,120.5,8.05],[0.34,174.53,120.5,8.05],[0.54,193.26,117.09,8.05],[0.68,189.64,161.95,8.05]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,230.01,123.51,12.67],[0.34,230.01,123.51,12.67],[0.54,213.98,117.09,12.67],[0.68,210.36,157.33,12.67]],"cambios":[]},{"el":"Ag","cls":"plata","etiqueta":"Ag⁺","claves":[[0,250.46,110.39,8.05],[0.64,250.46,110.39,8.05],[0.84,265.74,115.79,8.05],[0.98,231.08,161.95,8.05]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,302.91,121.04,12.67],[0.64,302.91,121.04,12.67],[0.84,286.46,115.79,12.67],[0.98,251.8,157.33,12.67]],"cambios":[]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,114.42,82.87,7.14]],"cambios":[]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,185.01,71.56,7.14]],"cambios":[]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,279.29,73.86,7.14]],"cambios":[]},{"el":"NO3","cls":"nitrato","etiqueta":"NO₃⁻","claves":[[0,223.18,69.02,12.53]],"cambios":[]},{"el":"NO3","cls":"nitrato","etiqueta":"NO₃⁻","claves":[[0,143.32,75.52,12.53]],"cambios":[]},{"el":"NO3","cls":"nitrato","etiqueta":"NO₃⁻","claves":[[0,305.33,85.62,12.53]],"cambios":[]}],"unidos0":[],"unidos1":[[0,1],[1,2],[2,3],[3,4],[4,5]],"vaso":{"x0":80,"x1":320,"y0":34,"y1":170,"nivel":54},"iones":true},"neutralizacion":{"particulas":[{"el":"H","cls":"proton","etiqueta":"H⁺","claves":[[0,286.34,108.26,4.2],[0.05,286.34,108.26,4.2],[0.33,298.5,153.2,0.01]],"cambios":[]},{"el":"H","cls":"proton","etiqueta":"H⁺","claves":[[0,139.91,95.17,4.2],[0.35,139.91,95.17,4.2],[0.63,104.22,73.81,0.01]],"cambios":[]},{"el":"H","cls":"proton","etiqueta":"H⁺","claves":[[0,202.57,153.68,4.2],[0.65,202.57,153.68,4.2],[0.93,272.47,133.71,0.01]],"cambios":[]},{"el":"OH","cls":"hidroxido","etiqueta":"OH⁻","claves":[[0,298.5,153.2,9.31],[0.31,298.5,153.2,9.31],[0.35,298.5,153.2,9.8]],"cambios":[[0.33,"agua","H₂O"]]},{"el":"OH","cls":"hidroxido","etiqueta":"OH⁻","claves":[[0,104.22,73.81,9.31],[0.61,104.22,73.81,9.31],[0.65,104.22,73.81,9.8]],"cambios":[[0.63,"agua","H₂O"]]},{"el":"OH","cls":"hidroxido","etiqueta":"OH⁻","claves":[[0,272.47,133.71,9.31],[0.91,272.47,133.71,9.31],[0.95,272.47,133.71,9.8]],"cambios":[[0.93,"agua","H₂O"]]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,236.66,94.35,7.14]],"cambios":[]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,222.88,121.83,7.14]],"cambios":[]},{"el":"Na","cls":"sodio","etiqueta":"Na⁺","claves":[[0,185.02,102.2,7.14]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,174.08,148.04,12.67]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,162.23,78.58,12.67]],"cambios":[]},{"el":"Cl","cls":"cloruro","etiqueta":"Cl⁻","claves":[[0,299.77,80.83,12.67]],"cambios":[]}],"unidos0":[],"unidos1":[[0,3],[1,4],[2,5]],"vaso":{"x0":80,"x1":320,"y0":34,"y1":170,"nivel":54},"iones":true,"fusiona":true}};
/* REACOMODOS:fin */

const ECUACIONES = {
  sintesis: [['2H', null], ['2', 'sub'], [' + O', null], ['2', 'sub'], [' → 2H', null], ['2', 'sub'], ['O', null]],
  descomposicion: [['2H', null], ['2', 'sub'], ['O', null], ['2', 'sub'], [' → 2H', null], ['2', 'sub'], ['O + O', null], ['2', 'sub']],
  simple: [['Zn(s) + CuSO', null], ['4', 'sub'], ['(ac) → ZnSO', null], ['4', 'sub'], ['(ac) + Cu(s)', null]],
  doble: [['AgNO', null], ['3', 'sub'], ['(ac) + NaCl(ac) → AgCl(s) + NaNO', null], ['3', 'sub'], ['(ac)', null]],
  neutralizacion: [['HCl(ac) + NaOH(ac) → NaCl(ac) + H', null], ['2', 'sub'], ['O(l)', null]]
};
const DURACION = { sintesis: 3.6, descomposicion: 3.6, simple: 7, doble: 7, neutralizacion: 6 };
const CLAVES = {
  sintesis: [['h', 'hidrógeno'], ['o', 'oxígeno']],
  descomposicion: [['h', 'hidrógeno'], ['o', 'oxígeno']],
  simple: [['zn', 'zinc metálico'], ['zn-ion', 'Zn<sup>2+</sup>'], ['cu-ion', 'Cu<sup>2+</sup>'], ['cu', 'cobre metálico'], ['sulfato', 'SO<sub>4</sub><sup>2−</sup>']],
  doble: [['plata', 'Ag<sup>+</sup>'], ['cloruro', 'Cl<sup>−</sup>'], ['sodio', 'Na<sup>+</sup>'], ['nitrato', 'NO<sub>3</sub><sup>−</sup>']],
  neutralizacion: [['proton', 'H<sup>+</sup>'], ['hidroxido', 'OH<sup>−</sup>'], ['agua', 'H<sub>2</sub>O'], ['sodio', 'Na<sup>+</sup>'], ['cloruro', 'Cl<sup>−</sup>']]
};

/* Rótulo dentro de una partícula: los subíndices y las cargas van en tspan,
   porque los caracteres Unicode de índice salen separados en la fuente mono. */
const INDICE = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁺': '+', '⁻': '−' };
function rotulo(parent, texto, cls) {
  const node = make('text', { x: 0, y: 0, class: cls, 'text-anchor': 'middle' }, parent);
  let tipo = null, actual = null, base = 0;
  for (const ch of texto) {
    const t = INDICE[ch] ? (/[₀-₉]/.test(ch) ? 'sub' : 'sup') : null;
    if (t !== tipo || !actual) {
      const shift = t === 'sub' ? 2.4 : t === 'sup' ? -3.4 : 0;
      actual = make('tspan', { dy: shift - base }, node);
      if (t) actual.setAttribute('class', 'escena__particula-indice');
      base = shift;
      tipo = t;
    }
    actual.textContent += INDICE[ch] || ch;
  }
  return node;
}

function posicionDe(q, t) {
  const k = q.claves;
  if (t <= k[0][0] || k.length === 1) return k[0].slice(1);
  for (let i = 1; i < k.length; i += 1) {
    const a = k[i - 1], b = k[i];
    if (t <= b[0]) {
      const u = b[0] > a[0] ? smooth((t - a[0]) / (b[0] - a[0])) : 1;
      const ur = smooth((u - .65) / .35);
      return [mix(a[1], b[1], u), mix(a[2], b[2], u), mix(a[3], b[3], ur)];
    }
  }
  return k[k.length - 1].slice(1);
}

function claseDe(q, t) {
  let cls = q.cls;
  for (const [tc, nueva] of q.cambios) if (t >= tc) cls = nueva;
  return cls;
}

function rotuloDe(q, t) {
  let etq = q.etiqueta;
  for (const [tc, , nueva] of q.cambios) if (t >= tc && nueva) etq = nueva;
  return etq;
}

function reacomodo(svg) {
  const root = svg.closest('[data-reacomodo]');
  const buttons = [...root.querySelectorAll('[data-tipo-reaccion]')];
  const fijo = root.dataset.reacomodo || null;
  const repetir = root.querySelector('[data-repetir]');
  const panel = root.querySelector('[data-reacomodo-texto]');
  const leyenda = root.querySelector('[data-reacomodo-clave]');
  const textos = {};
  root.querySelectorAll('[data-texto-tipo]').forEach(node => { textos[node.dataset.textoTipo] = node.innerHTML; });
  const capa = make('g', {}, svg);
  let key = null, t = 0, nodos = [], azul = null, ecuacion = null, productos = null;

  function armar(clave) {
    const T = REACOMODOS[clave];
    capa.innerHTML = '';
    nodos = [];
    azul = null;
    if (T.vaso) {
      const v = T.vaso;
      make('rect', { x: v.x0, y: v.nivel, width: v.x1 - v.x0, height: v.y1 - v.nivel, class: 'escena__liquido' }, capa);
      if (clave === 'simple') azul = make('rect', { x: v.x0, y: v.nivel, width: v.x1 - v.x0, height: v.y1 - v.nivel, class: 'escena__liquido-azul' }, capa);
      make('path', { d: `M${v.x0} ${v.nivel}H${v.x1}`, class: 'escena__superficie' }, capa);
    }
    if (T.lamina) {
      const L = T.lamina;
      make('rect', { x: L.x0, y: L.y0, width: L.x1 - L.x0, height: L.y1 - L.y0, rx: 1.5, class: 'escena__lamina' }, capa);
      text(capa, (L.x0 + L.x1) / 2, L.y0 - 4, 'zinc', 'escena__clave', { 'text-anchor': 'middle' });
    }
    // Los hidrógenos van encima del oxígeno para que siempre se vean, y todos los
    // rótulos van en una capa aparte, encima de todas las partículas.
    const orden = T.particulas.map((q, i) => i).sort((a, b) => (T.particulas[a].el === 'H' ? 1 : 0) - (T.particulas[b].el === 'H' ? 1 : 0));
    const cuerpos = make('g', {}, capa);
    const rotulos = make('g', {}, capa);
    for (const i of orden) {
      const q = T.particulas[i];
      const g = make('g', {}, cuerpos);
      const c = make('circle', { r: q.claves[0][3] }, g);
      const gl = make('g', {}, rotulos);
      // En las moléculas los átomos se enciman: H y O se reconocen por su color (clave de abajo).
      const etq = q.etiqueta && q.el !== 'H' && q.el !== 'O' ? rotulo(gl, q.etiqueta, 'escena__particula-etiqueta') : null;
      nodos.push({ q, g, c, gl, etq, texto: q.etiqueta });
    }
    if (T.vaso) {
      const v = T.vaso;
      make('path', { d: `M${v.x0 - 6} ${v.y0}H${v.x0}V${v.y1 - 6}Q${v.x0} ${v.y1} ${v.x0 + 6} ${v.y1}H${v.x1 - 6}Q${v.x1} ${v.y1} ${v.x1} ${v.y1 - 6}V${v.y0}H${v.x1 + 6}`, class: 'escena__vidrio' }, capa);
    }
    ecuacion = formula(capa, 24, 202, ECUACIONES[clave], 'escena__ecuacion');
    if (panel) panel.innerHTML = textos[clave] || '';
    if (leyenda) {
      // Cada muestra es un círculo de la misma escena: así toma sus colores en claro y en oscuro.
      const radio = { 'zn-ion': 4, 'cu-ion': 4, sulfato: 7.5 };
      leyenda.innerHTML = CLAVES[clave].map(([cls, nombre]) =>
        `<span class="reacomodo__muestra"><svg class="escena escena--reaccion reacomodo__punto" viewBox="0 0 16 16" aria-hidden="true">` +
        `<circle class="escena__p escena__p--${cls}" cx="8" cy="8" r="${radio[cls] || 6.5}"/></svg><span>${nombre}</span></span>`).join('');
    }
  }

  function draw(time) {
    const T = REACOMODOS[key];
    const fase = clamp((time - .6) / DURACION[key]);
    for (const n of nodos) {
      const [x, y, r] = posicionDe(n.q, fase);
      n.g.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
      n.gl.setAttribute('transform', `translate(${round(x)} ${round(y)})`);
      set(n.c, { r });
      const cls = claseDe(n.q, fase);
      n.c.setAttribute('class', 'escena__p escena__p--' + cls);
      if (n.etq) {
        // Los iones pequeños (Cu²⁺, Zn²⁺) no llevan rótulo: se reconocen por la clave de abajo.
        const visible = r >= 7;
        fade(n.etq, visible ? 1 : 0);
        if (visible) {
          // Si cambió de especie (OH⁻ que se vuelve H₂O), se rehace su rótulo.
          const texto = rotuloDe(n.q, fase);
          if (texto !== n.texto) {
            n.etq.remove();
            n.etq = rotulo(n.gl, texto, 'escena__particula-etiqueta');
            n.texto = texto;
          }
          n.etq.setAttribute('class', 'escena__particula-etiqueta escena__particula-etiqueta--' + cls);
          set(n.etq, { y: r > 12 ? 3.6 : 2.8 });
        }
      }
    }
    if (azul) {
      // El azul del Cu²⁺ se pierde a medida que se deposita el cobre.
      const quedan = nodos.filter(n => n.q.el === 'Cu' && claseDe(n.q, fase) === 'cu-ion').length;
      fade(azul, quedan / 3);
    }
    ecuacion.setAttribute('class', 'escena__ecuacion' + (fase >= 1 ? ' es-completa' : ''));
  }

  function select(next, animate) {
    if (!REACOMODOS[next]) return;
    key = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tipoReaccion === key)));
    armar(key);
    t = animate && !reducedMotion.matches ? 0 : 99;
    draw(t);
  }

  // Tocar otra vez el tipo elegido repite el reacomodo.
  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.tipoReaccion, true)));
  if (repetir) repetir.addEventListener('click', () => select(key, true));
  select(fijo && REACOMODOS[fijo] ? fijo : buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.tipoReaccion || 'sintesis', false);
  return {
    update(dt) { if (t < DURACION[key] + 1) { t += dt; draw(t); } },
    still() { t = 99; draw(t); }
  };
}

/* ---------------- 5 · La escala de pH y el papel tornasol ----------------
   Una barra de 0 a 14: hacia la izquierda ácido (terracota), al centro neutro y
   hacia la derecha básico (azul). El marcador va al pH de la sustancia elegida
   (valores típicos). Abajo, dos tiras de tornasol con su parte seca y su parte
   mojada: el azul sólo se pone rojo en un ácido claro (pH menor que 5) y el rojo
   sólo se pone azul en una base clara (pH mayor que 8); cerca del 7 ninguno
   cambia. */
const SUSTANCIAS = {
  gastrico: { ph: 1.5, nombre: 'Jugo gástrico', texto: 'Muy ácido: tiene ácido clorhídrico, que ayuda a digerir. El tornasol azul se pone rojo.' },
  limon: { ph: 2.2, nombre: 'Jugo de limón', texto: 'Ácido: el ácido cítrico le da su sabor agrio. El tornasol azul se pone rojo.' },
  vinagre: { ph: 2.9, nombre: 'Vinagre', texto: 'Ácido: tiene ácido acético, un ácido débil. El tornasol azul se pone rojo.' },
  cafe: { ph: 5.0, nombre: 'Café', texto: 'Ligeramente ácido. El tornasol casi no cambia: hace falta un indicador más fino.' },
  leche: { ph: 6.7, nombre: 'Leche', texto: 'Casi neutra, apenas ácida. Ningún papel tornasol cambia.' },
  agua: { ph: 7.0, nombre: 'Agua pura', texto: 'Neutra: tiene tantos iones H⁺ como OH⁻. Ningún papel tornasol cambia.' },
  sangre: { ph: 7.4, nombre: 'Sangre', texto: 'Ligeramente básica; el cuerpo la mantiene entre 7.35 y 7.45. El tornasol no cambia.' },
  bicarbonato: { ph: 8.3, nombre: 'Bicarbonato en agua', texto: 'Básico débil: por eso calma la acidez. El tornasol rojo apenas empieza a ponerse azul.' },
  magnesia: { ph: 10.5, nombre: 'Leche de magnesia', texto: 'Básica: es hidróxido de magnesio, un antiácido. El tornasol rojo se pone azul.' },
  blanqueador: { ph: 12.5, nombre: 'Blanqueador (cloro)', texto: 'Muy básico y corrosivo; nunca se mezcla con ácidos. El tornasol rojo se pone azul.' }
};

function escalaph(svg) {
  const root = svg.closest('[data-escala-ph]');
  const buttons = [...root.querySelectorAll('[data-sustancia]')];
  const panel = root.querySelector('[data-escala-texto]');
  const X0 = 24, X1 = 376, Y = 92, ALTO = 18;
  const xDe = ph => X0 + (X1 - X0) * ph / 14;
  const defs = make('defs', {}, svg);
  const grad = make('linearGradient', { id: 'escala-ph-degradado', x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
  make('stop', { offset: 0, class: 'escena__ph-acido' }, grad);
  make('stop', { offset: .5, class: 'escena__ph-neutro' }, grad);
  make('stop', { offset: 1, class: 'escena__ph-basico' }, grad);
  make('rect', { x: X0, y: Y, width: X1 - X0, height: ALTO, rx: 3, fill: 'url(#escala-ph-degradado)', class: 'escena__ph-barra' }, svg);
  for (let n = 0; n <= 14; n += 1) {
    make('path', { d: `M${round(xDe(n))} ${Y + ALTO}v5`, class: 'escena__regla' }, svg);
    text(svg, xDe(n), Y + ALTO + 17, String(n), n === 7 ? 'escena__clave escena__clave--fuerte' : 'escena__clave', { 'text-anchor': 'middle' });
  }
  text(svg, X0, Y + ALTO + 34, 'ácido', 'escena__clave escena__clave--acento');
  text(svg, xDe(7), Y + ALTO + 34, 'neutro', 'escena__clave', { 'text-anchor': 'middle' });
  text(svg, X1, Y + ALTO + 34, 'básico', 'escena__clave escena__ph-basico-texto', { 'text-anchor': 'end' });
  const nombre = text(svg, X0, 34, '', 'escena__ph-nombre');
  const lectura = text(svg, X0, 58, '', 'escena__clave');
  const marca = make('g', {}, svg);
  make('path', { d: `M0 ${Y - 4}l-6 -9h12Z`, class: 'escena__ph-marca' }, marca);
  make('path', { d: `M0 ${Y - 2}V${Y + ALTO + 2}`, class: 'escena__ph-linea' }, marca);

  // Tiras de tornasol: parte seca (su color) y parte mojada (el color que toma).
  const tiras = [['azul', 'tornasol azul', X0], ['rojo', 'tornasol rojo', X0 + 160]].map(([tipo, rotulo, x]) => {
    text(svg, x, 168, rotulo, 'escena__clave');
    make('rect', { x, y: 176, width: 52, height: 16, rx: 2, class: `escena__tornasol escena__tornasol--${tipo}` }, svg);
    const mojada = make('rect', { x: x + 52, y: 176, width: 78, height: 16, rx: 2, class: 'escena__tornasol' }, svg);
    text(svg, x + 52 + 39, 206, 'mojada', 'escena__clave escena__clave--chica', { 'text-anchor': 'middle' });
    return { tipo, mojada };
  });

  let key = null, t = 0, desde = 7, hasta = 7;
  function tono(tira, ph) {
    // Porcentaje de azul en la parte mojada.
    const azul = tira.tipo === 'azul' ? 100 * smooth((ph - 4) / 1) : 100 * smooth((ph - 8) / 1);
    tira.mojada.style.fill = `color-mix(in oklab, var(--e-tornasol-azul) ${round(azul)}%, var(--e-tornasol-rojo))`;
  }
  function draw(time) {
    const ph = mix(desde, hasta, smooth(time / .9));
    marca.setAttribute('transform', `translate(${round(xDe(ph))} 0)`);
    tiras.forEach(tira => tono(tira, ph));
  }
  function select(next, animate) {
    const S = SUSTANCIAS[next];
    if (!S) return;
    key = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sustancia === key)));
    desde = animate ? mix(desde, hasta, smooth(t / .9)) : S.ph;
    hasta = S.ph;
    nombre.textContent = S.nombre;
    const tipo = S.ph < 7 ? 'ácido' : S.ph > 7 ? 'básico' : 'neutro';
    lectura.textContent = `pH ${S.ph.toFixed(1)} · ${tipo}`;
    if (panel) panel.textContent = S.texto;
    t = animate && !reducedMotion.matches ? 0 : 9;
    draw(t);
  }
  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.sustancia, true)));
  select(buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.sustancia || 'limon', false);
  return {
    update(dt) { if (t < 2) { t += dt; draw(t); } },
    still() { t = 9; draw(t); }
  };
}

/* ---------------- 6 · Mechero: combustión completa e incompleta ----------------
   Mechero de Bunsen con metano. Con la entrada de aire abierta, el gas se
   mezcla con oxígeno antes de arder: flama azul, corta, con su cono interior,
   y combustión completa (CO₂ + H₂O). Con la entrada cerrada, el oxígeno sólo
   llega por fuera: flama amarilla, alta y temblorosa; el amarillo es hollín
   incandescente y parte de él escapa como humo negro (C y CO). */
const MODOS_FLAMA = {
  abierto: {
    ecuacion: [['CH', null], ['4', 'sub'], [' + 2O', null], ['2', 'sub'], [' → CO', null], ['2', 'sub'], [' + 2H', null], ['2', 'sub'], ['O', null]],
    rotulos: [['cono interior', 'interior'], ['flama azul', 'exterior']]
  },
  cerrado: {
    ecuacion: [['2CH', null], ['4', 'sub'], [' + 3O', null], ['2', 'sub'], [' → 2CO + 4H', null], ['2', 'sub'], ['O', null]],
    rotulos: [['base azul', 'base'], ['flama amarilla', 'exterior'], ['humo negro', 'humo']]
  }
};

function ruidoSuave(seed) {
  // Suma de senos con fases fijas: un temblor que no se repite a simple vista.
  const f = [1.7, 2.9, 4.3, 6.1].map((w, i) => ({ w, p: seed * 1.37 + i * 2.1 }));
  return t => f.reduce((acc, { w, p }, i) => acc + Math.sin(t * w + p) / (i + 1), 0) / 1.9;
}

function mechero(svg) {
  const root = svg.closest('[data-mechero]');
  const buttons = [...root.querySelectorAll('[data-aire]')];
  const panel = root.querySelector('[data-mechero-texto]');
  const textos = {};
  root.querySelectorAll('[data-texto-aire]').forEach(node => { textos[node.dataset.textoAire] = node.innerHTML; });
  const CX = 112, BOCA = 132;
  // Degradados verticales: la flama no tiene bordes de color duros. El azul se
  // aclara en el cono y se desvanece en la punta; el amarillo nace azul en la
  // base y termina anaranjado arriba.
  const defs = make('defs', {}, svg);
  function degradado(id, paradas) {
    const g = make('linearGradient', { id, x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    paradas.forEach(([offset, cls, op]) => make('stop', { offset, class: cls, 'stop-opacity': op }, g));
  }
  degradado('flama-azul-g', [[0, 'escena__parada-azul', .95], [.75, 'escena__parada-azul', .85], [1, 'escena__parada-azul', .15]]);
  degradado('flama-cono-g', [[0, 'escena__parada-cono', 1], [1, 'escena__parada-cono', .55]]);
  degradado('flama-amarilla-g', [[0, 'escena__parada-azul', .9], [.1, 'escena__parada-amarilla', 1], [.62, 'escena__parada-amarilla', .95],
    [.9, 'escena__parada-punta', .85], [1, 'escena__parada-punta', .2]]);
  const suave = make('filter', { id: 'flama-borde', x: '-20%', y: '-10%', width: '140%', height: '120%' }, defs);
  make('feGaussianBlur', { stdDeviation: .9 }, suave);
  // Manguera, base, tubo y collarín de aire
  make('path', { d: 'M86 212C60 212 46 216 24 226', class: 'escena__manguera' }, svg);
  make('path', { d: `M70 222H154L146 210H78Z`, class: 'escena__mechero-base' }, svg);
  make('rect', { x: CX - 8, y: BOCA, width: 16, height: 80, rx: 1.5, class: 'escena__mechero-tubo' }, svg);
  const collar = make('g', {}, svg);
  make('rect', { x: CX - 10, y: 182, width: 20, height: 14, rx: 2, class: 'escena__mechero-collar' }, collar);
  const huecos = [CX - 6, CX + 1].map(x => make('rect', { x, y: 186, width: 5, height: 6, rx: 1, class: 'escena__mechero-hueco' }, collar));
  text(svg, CX + 16, 193, 'entrada de aire', 'escena__clave escena__clave--chica');

  const humo = make('g', {}, svg);
  const flamaAmarilla = make('g', {}, svg);
  const amarilla = make('path', { fill: 'url(#flama-amarilla-g)', filter: 'url(#flama-borde)' }, flamaAmarilla);
  const flamaAzul = make('g', {}, svg);
  const exterior = make('path', { fill: 'url(#flama-azul-g)', filter: 'url(#flama-borde)' }, flamaAzul);
  const interior = make('path', { fill: 'url(#flama-cono-g)', filter: 'url(#flama-borde)' }, flamaAzul);
  const rotulos = make('g', {}, svg);
  let ecuacion = null;

  const ruidoA = ruidoSuave(1), ruidoB = ruidoSuave(2), ruidoC = ruidoSuave(3);
  // Partículas de hollín que suben desde la punta de la flama amarilla.
  const hollin = Array.from({ length: 14 }, (_, i) => ({
    c: make('circle', { r: 1.6 + (i % 3) * .5, class: 'escena__hollin' }, humo),
    fase: i / 14, dx: ((i * 37) % 11 - 5) * .9
  }));

  function forma(h, w, sway, ondas, t, y0 = BOCA) {
    // Contorno de flama: base en la boca del tubo (o más arriba) y punta que se mece.
    const tipX = CX + sway, tipY = y0 - h;
    const o1 = ondas * ruidoB(t * 1.3), o2 = ondas * ruidoC(t * 1.1);
    return `M${round(CX - w)} ${y0}` +
      `C${round(CX - w * 1.15 + o1)} ${round(y0 - h * .35)} ${round(CX - w * .55 + o2 + sway * .5)} ${round(y0 - h * .75)} ${round(tipX)} ${round(tipY)}` +
      `C${round(CX + w * .55 - o1 + sway * .5)} ${round(y0 - h * .75)} ${round(CX + w * 1.15 - o2)} ${round(y0 - h * .35)} ${round(CX + w)} ${y0}Z`;
  }

  let modo = null, mezcla = 1, objetivo = 1, reloj = 0;
  function armarRotulos(clave) {
    rotulos.innerHTML = '';
    const posiciones = clave === 'abierto'
      ? { interior: [CX + 6, BOCA - 18], exterior: [CX + 12, BOCA - 52] }
      : { base: [CX + 9, BOCA - 6], exterior: [CX + 18, BOCA - 70], humo: [CX + 14, BOCA - 118] };
    MODOS_FLAMA[clave].rotulos.forEach(([texto, parte]) => {
      const [x, y] = posiciones[parte];
      make('path', { d: `M${x} ${y}H${x + 40}`, class: 'escena__guia' }, rotulos);
      text(rotulos, x + 46, y + 4, texto, 'escena__clave');
    });
    if (ecuacion) ecuacion.remove();
    ecuacion = formula(svg, 24, 246, MODOS_FLAMA[clave].ecuacion, 'escena__ecuacion');
  }

  function draw() {
    const t = reloj;
    const k = smooth(mezcla);           // 1 = abierto (azul), 0 = cerrado (amarillo)
    // Collarín: los huecos se ven cuando la entrada está abierta.
    huecos.forEach(hc => fade(hc, k));
    // Flama azul: corta y firme, con un temblor pequeño.
    const hAzul = 70 * (1 + .03 * ruidoA(t * 3));
    exterior.setAttribute('d', forma(hAzul, 11, 1.2 * ruidoB(t * 2.4), 1, t * 2));
    interior.setAttribute('d', forma(28 * (1 + .02 * ruidoC(t * 4)), 6.5, .4 * ruidoA(t * 3), .4, t * 3));
    fade(flamaAzul, k);
    // Flama amarilla: alta, ancha y temblorosa.
    const hAm = 112 * (1 + .07 * ruidoA(t * 1.6));
    const sway = 7 * ruidoB(t * .9);
    amarilla.setAttribute('d', forma(hAm, 15, sway, 4, t));
    fade(flamaAmarilla, 1 - k);
    // Hollín: sube desde la punta y se desvanece.
    hollin.forEach(p => {
      const u = (t * .32 + p.fase) % 1;
      const y = BOCA - hAm * .92 - u * 70;
      const x = CX + sway + p.dx * (1 + u * 2.2) + 4 * ruidoC(t + p.fase * 6);
      set(p.c, { cx: x, cy: y });
      fade(p.c, (1 - k) * (1 - u) * smooth(u / .15) * .85);
    });
    fade(rotulos, Math.abs(k - (modo === 'abierto' ? 1 : 0)) < .02 ? 1 : 0);
  }

  function select(next, animate) {
    if (!MODOS_FLAMA[next]) return;
    modo = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.aire === modo)));
    objetivo = modo === 'abierto' ? 1 : 0;
    if (!animate || reducedMotion.matches) mezcla = objetivo;
    armarRotulos(modo);
    if (panel) panel.innerHTML = textos[modo] || '';
    draw();
  }

  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.aire, true)));
  select(buttons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.aire || 'abierto', false);
  return {
    update(dt) {
      reloj += dt;
      if (mezcla !== objetivo) mezcla = objetivo > mezcla ? Math.min(objetivo, mezcla + dt / 1.2) : Math.max(objetivo, mezcla - dt / 1.2);
      draw();
    },
    still() { reloj = 2.3; mezcla = objetivo; draw(); }
  };
}

/* ---------------- 7 · Preparar una disolución en un matraz aforado ----------------
   Matraz de 250 mL a escala real: 1 unidad = 1 mm. El perfil interior está
   calibrado para que llegue a 250 mL justo en la marca (aforo.py) y el cuello
   mide 13 mm por dentro. Pasos: 7.98 g de CuSO₄ (0.050 mol) caen del papel por
   el embudo en caída libre y forman un montón con ángulo de reposo de 33°; con
   la piseta se llena hasta la mitad, se agita y el polvo se disuelve; se
   completa hasta la marca, las últimas seis gotas con gotero (una gota de 0.05 mL
   sube 0.38 mm en el cuello), y se tapa y se agita.
   El nivel sale del volumen: sube lento en la pera y rápido en el cuello. El
   azul sigue la ley de Beer–Lambert, 1 − e^(−3.4·c). Un grano sólo se empieza a
   disolver cuando ya no tiene granos encima, y mientras se achica se queda
   sentado en sus apoyos: nada flota. Al agitar, la superficie del líquido se
   queda horizontal (se conserva el área del corte). */
/* AFORO:inicio */const AFORO = {"radios":[26.5,28.92,30.92,32.17,33.19,34.04,34.75,35.37,35.92,36.4,36.82,37.18,37.5,37.77,38.02,38.23,38.41,38.56,38.69,38.79,38.87,38.93,38.97,38.98,38.97,38.93,38.87,38.79,38.68,38.54,38.39,38.21,38.0,37.77,37.51,37.23,36.91,36.56,36.19,35.78,35.35,34.89,34.41,33.9,33.38,32.82,32.24,31.63,30.99,30.34,29.67,28.98,28.27,27.54,26.79,26.02,25.23,24.42,23.61,22.8,21.99,21.17,20.32,19.47,18.61,17.76,16.92,16.1,15.31,14.55,13.8,13.19,12.48,11.8,11.15,10.53,9.97,9.46,9.01,8.59,8.18,7.81,7.48,7.18,6.9,6.68,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5,6.5],"marca":152.0,"hombro":86.0,"boca":204.0,"papel":234.0,"g":9810.0,"vel":260.0,"granos":[[1.071,0.0,0.2179,[191,1071]],[1.355,0.035,0.2518,[-110,3479,-200,-34,-200,-51,-200,-70,-150,-66,-200,-108,-150,-98,-150,-115,-150,-136,-150,-162,-130,-167,-114,-178,-99,-187,-82,-195,-53,-161,-50,-206,-30,-190]],[1.105,0.07,0.2869,[280,3246,200,-18,200,-36,200,-56,150,-56,200,-96,200,-123,150,-114,150,-136,150,-167,116,-156,99,-162,100,-205,78,-214,55,-221,28,-188,11,-193]],[0.911,0.105,0.322,[38,3048,-172,-21,-169,-36,-262,-87]],[1.178,0.14,0.3564,[938,4354,100,-111,100,-130,150,-245,125,-293,55,-191,32,-168]],[0.856,0.175,0.3912,[-629,4670,150,-1,150,-14,150,-27,150,-40,50,25,150,143,150,118,150,97,150,80,200,83,150,47,200,43,200,23,200,2,150,-10,150,-22,200,-48,150,-50,200,-89,150,-84,150,-102,200,-172,200,-226,150,-228,117,-243,83,-255,50,-270,12,-170,4,-601,184,-155,200,-223,150,-225,106,-215,59,-160,37,-132,38,-202,17,-239,-15,-272]],[0.854,0.21,0.426,[991,5184,250,48,250,17,300,-21,200,-40,250,-79,250,-118,200,-128,200,-165,150,-157,150,-197,117,-199,83,-184,80,-249,50,-280,10,-139,2,-614,114,-91,118,-111]],[1.216,0.245,0.4612,[-1466,4830,-150,-77,-150,-94,-250,-200,-200,-214,-100,-134,-100,-159,-50,-39,-200,-27,-250,-57,-250,-85,-200,-89,-200,-112,-200,-136,-150,-122,-200,-197,-150,-180,-150,-220,-120,-221,-88,-207,-70,-213,-66,-307,-24,-223,-1,-301]],[1.389,0.28,0.4957,[1487,5783,300,-16,250,-40,250,-67,250,-95,300,-157,150,-99,150,-115,250,-237,200,-243,250,6,250,-22,150,-27,250,-69,200,-79,200,-103,150,-94,200,-155,200,-198,150,-187,134,-209,100,-200,79,-209,71,-279,31,-241,10,-324,166,-217,121,-202,113,-250,82,-266]],[1.192,0.315,0.5309,[370,5300,-246,-154,-233,-189]],[0.894,0.35,0.5654,[-1552,6464,-200,-221,-167,-247,-133,-278,-87,-279,-32,-158,-20,-175,-5,-1429,-33,-73,-196,-10,-233,-34,-191,-47,-186,-63,-179,-79,-172,-94,-195,-133,-132,-110]],[1.117,0.385,0.6002,[-1409,6865,-150,-111,-150,-132,-200,-219,-100,-134,-100,-158,-117,-232,-96,-262,-45,-174,-28,-159,-23,-272,-4,-435,-137,105,-150,95,-150,79,-200,81,-150,45,-200,41,-200,20,-200,1,-150,-13,-200,-35,-150,-40,-200,-74,-150,-72,-200,-122,-150,-115,-150,-140,-200,-242,-134,-218,-66,-139,-63,-164,-75,-301,-212,-109,-150,-90,-150,-106,-150,-126,-150,-150,-100,-118,-100,-135,-100,-159,-142,-293,-100,-310,-51,-280,-15,-203,1,-173]],[0.914,0.42,0.6352,[-826,6937,-200,-84,-200,-110,-200,-142,-150,-132,-150,-162,-150,-203,-100,-171,-83,-180,-67,-188,-40,-153,-33,-193,-15,-183,9,-294,34,-218,68,-248,102,-246,-110,-157]],[0.818,0.455,0.6701,[-115,6967,200,-9,150,-20,150,-32,200,-62,150,-62,150,-78,150,-94,150,-114,150,-140,100,-111,150,-205,83,-143,67,-139,75,-201,50,-193,30,-190,235,-62,195,-76,216,-114,200,-138,157,-138,164,-181,122,-169,119,-213]],[1.064,0.49,0.7052,[1096,6865,200,-142,150,-131,150,-157,100,-124,150,-227,100,-194,77,-193,54,-181]],[1.111,0.525,0.74,[449,7192,150,-43,50,9,150,119,150,100,150,83,200,88,300,91,200,35,200,17,200,-2,200,-21,150,-28,200,-54,150,-55,150,-68,150,-82,150,-99,200,-163,150,-152,150,-188,100,-153,117,-227,83,-218,50,-183,40,-230,210,-136,200,-171,150,-165,167,-242,83,-160,50,-119,50,-147,40,-162,33,-240,8,-437,134,-169]],[1.1,0.56,0.775,[520,7161,111,-35]],[1.074,0.595,0.8093,[-710,8838,-200,-178,-200,-231,-150,-229,-117,-239,-93,-274,-55,-276,-17,-216,-3,-485,-165,-148,-200,-229,-100,-141,-150,-270,-50,-63,-150,-13,-200,-35,-200,-58,-200,-81,-200,-109,-200,-142,-200,-185,-200,-233,-300,-30,-250,-62,-150,-55,-150,-69,-250,-152,-150,-119,-150,-146,-115,-136,-117,-170,-113,-212,-64,-159,-59,-198,-32,-162,-251,-122,-216,-139]],[1.399,0.63,0.844,[1586,9435,200,-93,250,-150,200,-151,150,-137,200,-222,100,-135,100,-157,134,-262,79,-204,37,-122,50,-39,250,-130,250,-170,200,-173,150,-158,200,-264,134,-230,129,-299,87,-310,50,-39,200,61,200,43,300,33,350,-6,200,-26,200,-43,150,-43,200,-74,300,-151,250,-167,150,-124,150,-146,150,-173,100,-137,117,-187,117,-236,79,-209,47,-163,49,-235,25,-193,166,-102,150,-107,150,-123,150,-142,150,-166,150,-197,184,-305,133,-300,101,-325,39,-191,26,-193,13,-264]],[1.304,0.665,0.8789,[665,9530,-250,-10,-250,-35,-250,-64,-250,-93,-200,-99,-250,-160,-200,-163,-200,-205,-150,-191,-133,-212,-134,-280,-71,-204,-52,-210,-37,-244,-10,-152,-3,-392,-160,-157,-150,-177,-149,-214,-105,-188,-191,-28,-225,-56,-219,-79,-209,-101,-165,-101,-186,-139,-170,-159,-164,-189,-191,-22,-262,-58,-182,-61,-216,-97]],[0.989,0.7,0.9144,[-865,8584,-150,-171,-150,-220,-117,-227,-71,-184,-62,-234,-31,-194,-11,-152,-3,-532,-205,-184,-200,-235,-150,-233,-116,-241,-231,-17,-185,-34]],[0.973,0.735,0.9498,[-1375,7649,-50,-257,-50,-22,-150,89,-150,72,-150,57,-250,65,-150,23,-200,13,-200,-8,-200,-29,-300,-84,-250,-113,-250,-159,-200,-172,-300,89,-300,46,-300,6,-300,-34,-250,-60,-300,-114,-250,-136,-250,-180,-200,-188,-150,-176,-150,-221,-117,-223,-96,-248,-71,-282,-29,-214,-12,-264,-175,-94,-150,-98,-100,-77,-150,-136,-200,-233,-100,-149,-84,-150,-100,-237,-74,-268,-35,-243,-7,-321,-250,-172,-200,-184,-150,-175,-175,-267,-122,-265,-57,-174,-34,-141,-39,-289,1,-279]],[1.26,0.77,0.984,[-319,9286,200,78,-267,-108,-252,-140,-264,-196,-122,-111,-113,-120,-154,-193,-172,-281,-102,-225,-71,-208]],[1.308,1.395,1.6087,[-363,10012,150,-92,150,-108,150,-126,150,-147,50,-30,300,25,200,-5,250,-29,250,-57,200,-66,250,-112,250,-149,200,-152,250,-245,100,-121,150,-218,67,-117,100,-211,116,-338,267,-128,150,-92,150,-108,210,-184,140,-152,103,-130,157,-244,93,-185,63,-153,63,-197,54,-252,39,-25]],[1.375,1.43,1.6439,[1111,9554,300,-79,300,-122,250,-140,200,-142,250,-226,200,-235,167,-253,133,-270,50,3,200,122,250,122,150,58,200,62,200,46,200,30,200,15,200,0,200,-15,200,-31,200,-46,200,-62,200,-81,200,-100,200,-123,200,-149,250,-234,200,-238,184,-282,150,-310,104,-310,68,-333,23,-275,3,-598,118,-130,150,-196,134,-217,83,-166,80,-199,52,-165,57,-254,27,-230,27,-15]],[0.8,1.465,1.6788,[-929,9717,-300,85,-250,34,-250,4,-300,-36,-300,-82,-250,-108,-200,-118,-250,-196,-150,-153,-150,-191,-150,-254,-100,-236,-67,-232,-43,-283,-7,-853,-183,-177,-300,103,-150,34,-200,28,-300,5,-300,-37,-300,-83,-300,-135,-250,-161,-200,-170,-150,-160,-150,-202,-117,-201,-83,-186,-75,-230,-44,-211,-23,-230,-4,-273,-254,-125,-150,-98,-100,-78,-200,-194,-150,-193,-83,-135,-84,-168,-58,-152,-45,-156,-47,-293,-8,-404,-224,-137,-161,-129]],[1.346,1.515,1.7288,[-96,9884,-150,103,-200,114,-150,71,-200,77,-200,59,-200,43,-200,26,-250,11,-250,-13,-200,-28,-150,-31,-200,-57,-250,-96,-150,-73,-150,-85,-200,-136,-250,-212,-150,-158,-100,-121,-200,-299,-117,-229,-121,-325,-66,-277,-35,-284,-7,-367,-254,34,-200,9,-250,-10,-250,-33,-200,-45,-250,-79,-250,-109,-200,-110,-250,-172,-250,-221,-200,-225,-200,-290,-150,-292,-113,-306,-62,-255,-45,-341,-280,-195,-150,-132,-150,-156,-50,-8,-250,31,-250,2,-200,-19,-250,-52,-250,-83,-200,-94,-200,-120,-200,-154,-150,-144,-100,-113,-100,-131,-117,-186,-83,-165,-63,-154,-57,-185,-47,-207,-233,-183,-156,-153,-180,-219,-111,-169,-96,-178,-108,-262,-57,-194,-37,-183]],[1.388,1.61,1.8237,[-328,10085,-150,79,-200,87,-200,68,-200,52,-350,51,-350,4,-200,-18,-200,-34,-200,-50,-150,-49,-200,-81,-150,-74,-300,-186,-250,-203,-200,-205,-200,-259,-117,-189,-67,-127,-129,-311,-87,-319,-44,-290,-13,-384,-243,28,-300,5,-300,-29,-250,-51,-250,-76,-250,-104,-250,-136,-250,-174,-200,-173,-200,-213,-150,-196,-167,-272,-117,-249,-94,-271,-64,-275,-35,-284,-178,-119,-135,-106,-158,-146,-99,-107]],[0.844,1.645,1.8591,[414,9058,-167,-26,-162,-40]],[1.267,1.68,1.8933,[-737,10936,-200,-97,-200,-126,-200,-161,-200,-209,-50,-35,-250,-7,-300,-42,-250,-64,-200,-72,-200,-91,-250,-147,-200,-148,-200,-183,-200,-229,-150,-217,-150,-282,-100,-256,-79,-302,-37,-262,-10,-221,17,-289]],[0.852,1.715,1.9284,[-536,10570,200,65,250,44,250,7,250,-30,250,-70,200,-88,200,-121,200,-166,150,-165,100,-141,84,-145,79,-182,57,-189,39,-225,12,-463,160,-131,121,-120,151,-185,93,-143,95,-180,75,-190,48,-164,40,-219,260,-89]],[1.378,1.75,1.9632,[826,11087,250,-106,250,-145,229,-177,218,-221,185,-249,114,-202,120,-287,70,-262]],[0.871,1.785,1.9985,[-812,10453,-171,-120,-113,-98,-180,-200,-95,-139]],[0.861,2.005,2.2179,[-1408,11627,-200,-16,-200,-39,-200,-66,-150,-68,-200,-119,-150,-117,-100,-94,-150,-175,-117,-178,-67,-129,-79,-203,-43,-160,-36,-276,-3,-636,-155,79,-150,62,-200,63,-150,33,-150,23,-200,13,-200,-6,-150,-17,-200,-39,-150,-44,-200,-76,-150,-74,-150,-89,-150,-108,-100,-83,-150,-147,-150,-181,-150,-234,-117,-247,-71,-211,-46,-201,-30,-271,-4,-1102,-132,-151,-50,17,-150,125,-200,137,-200,108,-150,65,-200,67,-200,47,-200,29,-200,10,-200,-7,-200,-26,-200,-44,-200,-64,-150,-61,-200,-104,-200,-131,-150,-121,-100,-93,-150,-164,-100,-131,-100,-153,-84,-154,-83,-190,-92,-301,-43,-250,-14,-206,-1,-1594,-133,86,-150,82,-150,68,-150,55,-300,75,-150,21,-200,12,-300,-16,-200,-34,-150,-38,-200,-69,-150,-66,-250,-143,-250,-193,-100,-94,-150,-168,-100,-134,-100,-159,-134,-278,-86,-263,-40,-189,-20,-152,-10,-193,4,-154,15,-153,35,-196]],[1.278,2.04,2.2527,[-1031,12018,-200,23,-250,1,-200,-19,-250,-52,-200,-65,-200,-87,-200,-114,-200,-145,-200,-186,-150,-176,-100,-143,-134,-241,-79,-191,-67,-227,-35,-175,-28,-257,-307,58,-300,20,-300,-16,-300,-52,-300,-91,-250,-108,-300,-176,-250,-195,-200,-197,-200,-251,-117,-182,-67,-123,-129,-300,-95,-337,-46,-333,-7,-644,-39,21,86,-48]],[1.136,2.075,2.288,[-168,11502,156,-130,100,-99,114,-132,97,-133]],[0.914,2.11,2.3223,[742,13009,250,-72,250,-109,250,-153,150,-119,150,-144,150,-178,150,-233,100,-207,50,-63,250,-12,250,-39,200,-52,300,-117,250,-138,200,-143,200,-179,150,-168,150,-207,150,-273,113,-293,62,-256,27,-186,10,-163,2,-1421,236,-23,200,-39,200,-60,200,-81,150,-76,200,-126,150,-116,200,-192,150,-180,100,-147,117,-210,96,-230,57,-189,44,-213,22,-221,5,-238,209,113,150,64,150,52,200,53,150,27,250,22,200,-2,200,-19,200,-38,200,-56,200,-77,200,-100,150,-92,150,-109,150,-130,150,-155,150,-191,117,-183,100,-197,96,-251,54,-205,33,-195,17,-205,4,-332,229,-109,150,-90,200,-145,150,-134,150,-160,150,-196,117,-190,100,-205,71,-187,45,-156,41,-198,20,-160,9,-161,-5,-202,-16,-161,-30,-169]],[0.879,2.145,2.3573,[460,13016,300,-47,250,-77,250,-114,250,-161,200,-172,200,-228,150,-232,150,-291,250,-8,250,-36,250,-66,250,-98,250,-135,200,-141,200,-178,150,-166,150,-206,150,-273,100,-255,71,-282,22,-139,15,-187,3,-1474,239,-20,250,-50,200,-62,200,-85,200,-110,150,-101,200,-168,150,-156,150,-194,100,-159,100,-199,75,-195,55,-196,41,-236,12,-152,4,-289,13,8,-23,-14]],[0.87,2.18,2.3923,[-254,12936,250,54,300,23,-120,-3,-208,-24,-272,-65,-165,-60,-127,-58,-241,-142,-245,-198,-121,-126,-110,-136,-98,-145,-85,-153,-115,-283,-179,-34,-174,-53,-168,-71,-133,-72,-152,-102,-117,-96,-109,-107,-117,-139,-102,-151,-111,-216,-71,-200,-36,-148,-28,-211,-2,-212,29,-241,45,-180,-43,-39]],[0.928,2.78,2.9924,[-737,12792,-150,-95,-150,-116,-150,-141,-100,-112,-100,-130,-100,-156,-100,-196,-50,-123,-50,-56,-250,-63,-150,-58,-150,-73,-150,-92,-100,-74,-200,-184,-50,-10,-200,27,-200,5,-200,-18,-150,-28,-200,-59,-150,-62,-150,-78,-150,-98,-150,-122,-100,-98,-150,-182,-100,-154,-100,-202,-50,-134,-50,-184,-25,-145,-12,-14,-213,-87,-200,-108,-250,-177,-200,-175,-150,62,-150,49,-200,47,-150,23,-300,15,-150,-8,-200,-27,-150,-32,-200,-61,-300,-133,-150,-89,-150,-105,-100,-81,-150,-143,-150,-173,-150,-219,-100,-187,-83,-200,-67,-220,-41,-214,-20,-198,-5,-284,-184,-84,-200,-116,-200,-146,-200,-183,-150,-171,-150,-211,-133,-244,-92,-224,-81,-293,-44,-325,-4,-1567,-46,27,167,-108,139,-107]],[1.383,2.815,3.0271,[971,13435,250,-84,250,-114,200,-118,200,-144,200,-178,150,-162,150,-196,150,-247,250,-40,250,-59,200,-66,200,-83,200,-103,200,-124,200,-151,200,-182,200,-225,200,-286,167,-319,83,-212,50,-159,67,-302,33,-328,4,-1059,296,-81,300,-122,300,-168,150,-105,150,-121,200,26,250,10,250,-18,250,-46,200,-58,250,-103,250,-141,200,-147,200,-185,200,-240,167,-269,133,-306,50,-45,150,-60,250,-124,250,-159,150,-115,150,-132,250,-272,150,-206,117,-193,100,-201,83,-208,70,-230,49,-228,43,-418,238,-148,203,-155,144,-130,177,-189]],[0.982,2.85,3.0623,[1232,12909,150,-81,150,-98,150,-118,150,-142,150,-176,100,-142,150,-278,50,-75,250,-16,200,-31,300,-82,200,-79,200,-102,200,-128,200,-159,200,-201,200,-261,133,-228,117,-269,90,-314,30,-172,20,-230,2,-1379,206,-24,196,-41,191,-57,222,-92,211,-113,166,-111,185,-152,105,-102]],[0.926,2.885,3.0973,[-338,12969,200,54,150,27,200,18,200,-1,200,-21,150,-29,150,-40,200,-74,200,-99,150,-93,150,-113,150,-137,150,-168,100,-137,100,-166,100,-212,50,-35,200,-9,200,-26,200,-45,200,-63,200,-85,200,-109,200,-137,150,-125,200,-206,200,-270,150,-279,100,-262,64,-255,36,-275,7,-1010,143,172,100,99,150,125,150,102,200,106,150,61,200,60,200,37,200,15,200,-6,200,-27,200,-49,200,-73,150,-73,150,-90,150,-110,200,-189,150,-185,133,-216,100,-224,67,-218,43,-247,10,-162,3,-661,144,-196,100,-179,83,-203,67,-233,200,-58,250,-102,200,-108,200,-135,150,-124,200,-205,150,-193,100,-157,200,150,150,98,200,107,150,64,200,67,200,47,200,30,250,12,150,-6,250,-32,200,-46,150,-47,200,-81,200,-105,150,-95,200,-156,100,-92,150,-162,150,-199,100,-163,83,-165,67,-161,60,-187,41,-175,29,-195,11,-151,1,-2372,8,0]],[1.313,2.92,3.132,[454,13451,250,-29,250,-55,250,-84,300,-144,150,-92,150,-108,250,-224,200,-234,100,-143,100,-168,50,-52,250,-34,150,-33,250,-74,200,-79,200,-99,200,-121,150,-108,150,-124,200,-198,200,-249,150,-235,117,-231,108,-286,65,-246,42,-255,18,-306,200,104,150,62,300,89,200,36,150,15,300,0,300,-39,200,-50,150,-49,200,-85,150,-80,150,-94,150,-112,200,-184,200,-236,150,-231,117,-237,103,-302,60,-308,15,-176,5,-595,167,-265,83,-174,72,-195,304,-123,207,-110,158,-101,151,-112,177,-154,231,-250]],[0.86,2.955,3.1675,[1566,12550,200,-189,150,-183,150,-242,100,-223,50,-37,150,-2,200,-18,300,-62,250,-87,250,-121,250,-165,200,-171,200,-220,150,-214,117,-214,76,-180,50,-148,61,-267,27,-233,4,-156,-10,-195,-21,-155,-40,-191,-99,-296,-135,-271,100,-149,64,-117]],[0.928,2.99,3.2024,[-774,12771,-150,-101,-150,-121,-150,-148,-100,-118,-100,-139,-100,-168,-133,-304,-267,-64,-150,-56,-150,-72,-200,-125,-150,-121,-100,-97,-50,-27,-150,24,-200,12,-200,-11,-200,-33,-200,-57,-200,-84,-150,-83,-150,-104,-150,-128,-100,-104,-100,-123,-100,-151,-83,-156,-67,-163,-50,-165,-40,-213,-260,-109,-200,-113,-200,-143,-200,-183,-300,104,-300,66,-300,23,-300,-17,-300,-60,-150,-46,-150,-59,-250,-128,-250,-173,-200,-182,-150,-170,-150,-214,-150,-290,-75,-202,-65,-260,-28,-202,-13,-371,-269,-131,-250,-165,-250,-219,-200,-232,-150,-224,-133,-265,-92,-257,-50,-206,-25,-156,-50,-65,-200,-43,-200,-68,-200,-94,-200,-127,-200,-169,-200,-228,-100,-150,-83,-156,-54,-126,-55,-164,-234,-46,-227,-71,-219,-94,-208,-116,-194,-137,-179,-157,-162,-175,-130,-173]],[1.264,3.06,3.2721,[-547,13253,-250,-111,-200,-115,-200,-144,-150,-130,-150,-155,-150,-187,-150,-236,-100,-201,-250,-89,-250,-117,-200,-125,-200,-159,-50,-15,-200,12,-200,-6,-150,-17,-250,-54,-150,-47,-200,-83,-150,-79,-200,-131,-150,-122,-150,-147,-200,-253,-117,-194,-50,-101,-67,-160,-66,-215,-50,-73,-150,-75,-200,-120,-250,-190,-350,89,-250,37,-200,12,-150,-2,-300,-30,-300,-67,-300,-107,-300,-153,-250,-170,-200,-172,-200,-213,-150,-199,-167,-283,-117,-269,-86,-287,-53,-295,-16,-246,-261,-154,-250,-189,-200,-190,-200,-236,-167,-251,-117,-223,-129,-337,-67,-267,-255,-82,-140,-61,-202,-109,-158,-107,-178,-146,-161,-163,-97,-118,-124,-179]],[0.978,3.12,3.3326,[-1365,12311,-167,-247,-133,-276,-50,-75,-150,-35,-150,-49,-250,-115,-150,-92,-100,-74,-200,-182,-250,26,-150,3,-150,-9,-200,-31,-150,-39,-200,-73,-200,-102,-150,-98,-150,-122,-150,-151,-100,-124,-117,-178,-83,-164,-63,-158,-87,-340,-250,-109,-200,-115,-200,-146,-150,-134,-50,-14,-250,89,-150,38,-200,34,-250,17,-300,-16,-300,-57,-250,-81,-250,-116,-250,-156,-200,-163,-200,-207,-150,-198,-167,-292,-96,-234,-77,-284,-42,-319,-4,-266,-214,-104,-150,-90,-150,-106,-200,-172,-150,-158,-100,-124,-150,-225,-100,-189,-50,-33,-150,164,-150,135,-150,114,-200,124,-200,97,-200,74,-200,53,-250,40,-250,11,-250,-16,-200,-34,-200,-53,-200,-74,-200,-96,-200,-123,-150,-113,-150,-135,-150,-164,-150,-202,-117,-199,-100,-222,-71,-214,-37,-158,-38,-277,-12,-37,-175,-88,-150,-96,-150,-117,-150,-144,-100,-117,-100,-139,-100,-172,-67,-145,-83,-251,-52,-301,-9,-1094,-77,-169,-70,-214,-28,-125,-27,-221]],[0.854,3.155,3.3673,[265,12997,300,-17,150,-26,150,-39,150,-51,150,-65,250,-144,200,-155,200,-203,100,-128,100,-154,83,-158,67,-158,50,-29,150,-2,200,-18,150,-26,200,-51,150,-52,200,-88,150,-83,150,-99,200,-162,150,-150,150,-184,100,-149,117,-216,75,-180,69,-223,46,-232,119,-12,206,-41,281,-101,159,-84,125,-82,140,-112,103,-101]],[0.946,3.19,3.4022,[324,13089,300,-25,300,-71,250,-97,250,-137,250,-189,200,-202,100,-125,100,-149,67,-117,83,-178,50,-37,331,-25,199,-39,156,-43,302,-119,248,-137,230,-167,235,-223,179,-220,110,-170,68,-124]],[1.023,3.225,3.4372,[-150,13119,-250,-69,-250,-103,-250,-144,-200,-151,-150,-140,-200,-238,-133,-209,-117,-242,-50,-71,-250,-69,-150,-60,-150,-76,-200,-130,-250,-205,-150,20,-200,9,-200,-13,-200,-35,-150,-40,-200,-76,-150,-75,-200,-128,-100,-79,-150,-141,-150,-179,-100,-149,-83,-153,-67,-155,-60,-188,-40,-189,-200,-86,-200,-110,-200,-139,-200,-174,-300,101,-250,52,-300,26,-300,-14,-300,-53,-300,-97,-250,-118,-250,-159,-200,-163,-200,-208,-150,-198,-150,-255,-100,-228,-90,-302,-43,-261,-17,-350,-188,-93,-180,-110,-169,-124,-158,-139,-173,-184,-129,-167,-113,-177,-94,-178]],[1.375,3.26,3.472,[-52,13494,-250,-48,-300,-94,-250,-112,-250,-148,-250,-192,-114,-105,-149,-161,-207,-282,-160,-294,-223,-76,-248,-117,-232,-146,-171,-137]],[1.145,3.295,3.5072,[1173,13114,150,-69,200,-113,200,-143,150,-131,150,-158,150,-193,117,-187,83,-161,231,-21,185,-33]],[0.91,3.33,3.5422,[-1107,13053,-150,162,-200,174,-150,107,-200,116,-200,92,-200,69,-200,50,-250,36,-250,8,-200,-14,-250,-41,-200,-55,-200,-75,-200,-97,-200,-124,-200,-156,-150,-143,-150,-173,-100,-139,-100,-164,-83,-167,-67,-165,-50,-157,-40,-168,-32,-212,-11,-185,-1,-2200,-148,-83,-157,-106,-119,-95,-160,-153]],[1.345,3.395,3.6069,[1017,13654,150,140,200,155,200,126,200,101,200,79,250,74,200,38,250,25,200,2,200,-14,250,-41,250,-68,200,-76,200,-96,200,-120,200,-148,250,-235,150,-178,100,-141,167,-294,83,-194,50,-146,50,-35,200,-95,150,-88,200,-144,150,-132,200,-218,150,-209,117,-207,116,-280,267,-146,250,-181,200,-190,200,-249,167,-287,83,-195,60,-187,40,-175,25,-171,12,-407,113,-129,100,-133,117,-186,83,-162,67,-159,58,-175,42,-167,33,-201,50,-48,200,122,250,122,200,75,250,70,150,30,200,25,250,11,150,-5,200,-20,250,-47,250,-72,150,-57,150,-67,200,-108,200,-132,150,-118,150,-136,200,-220,150,-204,167,-288,100,-227,83,-253,57,-258,36,-281,157,-85,200,-128,150,-114,150,-131,150,-153,150,-181,100,-140,117,-193,150,-319,103,-319,61,-312,29,-414,190,-44,150,-47,300,-131,150,-86,150,-103,237,-203,83,-85,151,-184,90,-130,99,-172,68,-143,71,-185,78,-302]],[0.95,3.43,3.6423,[-993,12973,-150,181,-150,149,-150,126,-200,137,-200,109,-200,85,-200,65,-250,54,-200,23,-250,4,-250,-23,-150,-27,-250,-69,-200,-77,-250,-128,-150,-97,-250,-203,-150,-154,-100,-120,-100,-139,-100,-165,-83,-167,-67,-165,-80,-272,-50,-321,-8,-158,-2,-847,-210,51,-250,28,-250,-6,-250,-40,-250,-76,-200,-91,-200,-122,-200,-163,-150,-157,-100,-129,-100,-157,-83,-166,-67,-174,-50,-185,-25,-143,-18,-215,-257,-140,-250,-185,-150,-141,-100,-110,-100,-127,-100,-149,-100,-181,-100,-236,-70,-236,-46,-269,-17,-19,-217,160,-200,111,-200,84,-250,71,-250,37,-200,6,-250,-21,-250,-54,-200,-68,-200,-94,-200,-124,-200,-162,-150,-155,-150,-196,-100,-166,-100,-207,-200,-18,-150,-26,-150,-37,-200,-67,-150,-64,-200,-108,-250,-177,-200,-185,-150,-175,-150,-220,-83,-153,-100,-235,-67,-223,-33,-164,-29,-251,-188,-92,-200,-130,-200,-173,-150,-168,-150,-220,-100,-199,-75,-205,-61,-279]],[1.244,3.465,3.6769,[1409,13855,200,127,200,102,200,79,150,46,200,46,200,28,200,11,200,-6,200,-23,200,-40,200,-59,200,-78,150,-73,200,-119,150,-108,150,-128,200,-208,100,-126,100,-147,84,-142,83,-171,117,-318,216,-94,200,-113,200,-144,150,-133,200,-223,150,-219,117,-222,83,-213,50,-49,150,-74,150,-90,200,-150,200,-193,100,-119,100,-139,84,-139,83,-169,71,-184,42,-146,36,-170,19,-150,11,-411,154,-176,167,-245,117,-228,79,-206,46,-160,33,-160,22,-169,9,-200]],[0.918,3.5,3.712,[1440,13466,-130,-123,-97,-107,-131,-172,-79,-127]],[1.329,3.535,3.7463,[331,15081,-256,-97,-243,-129,-225,-157,-176,-155,-184,-204,-158,-224,-113,-207,-101,-248]],[1.053,3.57,3.7808,[-1268,16038,-200,-20,-250,-50,-200,-61,-250,-105,-200,-109,-200,-137,-150,-124,-200,-203,-150,-190,-100,-153,-150,-295,-110,-321,-40,-179,-25,-166,-175,-54,-250,-105,-200,-109,-200,-136,-200,-168,-150,-154,-150,-186,-150,-232,-100,-197,-83,-209,-67,-229,-33,-164,-32,-316,-2,-758,-233,39,-200,11,-250,-15,-250,-48,-250,-83,-200,-95,-200,-126,-200,-164,-100,-101,-150,-184,-100,-154,-100,-194,-75,-196,-35,-122,-30,-140,-35,-244,-275,-162,-193,-149,-205,-198,-155,-189,-134,-203,-129,-254,-97,-268,-59,-252]],[0.823,3.605,3.8165,[1481,14611,150,-50,150,-66,100,-54,150,-99,100,-78,150,-144,100,-118,100,-144,300,15,200,-9,200,-30,200,-52,200,-75,200,-102,200,-133,150,-127,200,-216,100,-138,100,-169,125,-293,45,-156,30,-146,250,-86,150,-67,200,-119,150,-114,200,-201,100,-129,100,-160,66,-134,59,-148,62,-233,263,-101,200,-114,200,-155,100,-98,100,-118,150,-230,100,-222,64,-223,36,-276,50,-31,200,97,150,56,200,56,150,28,300,22,300,-22,150,-27,200,-55,250,-101,150,-81,150,-97,150,-117,100,-92,150,-164,100,-133,100,-159,83,-163,67,-166,50,-161,33,-148,42,-269,175,-46,200,-72,200,-97,200,-124,150,-116,150,-139,150,-171,100,-137,100,-166,66,-133,67,-164,54,-173,34,-149,29,-200,11,-385,189,-73,200,-100,150,-93,150,-111,150,-133,150,-160,117,-152,104,-162,90,-171,87,-214,55,-184,45,-226,21,-230,-1,-193,-18,-191,-47,-240]],[0.943,3.68,3.8913,[655,15074,200,-282,150,6,150,-6,250,-38,250,-74,250,-115,200,-128,150,-123,150,-153,150,-181,200,13,200,-6,200,-26,200,-46,150,-48,200,-85,200,-112,200,-143,100,-87,150,-153,100,-123,100,-144,100,-177,83,-189,42,-119,58,-220,217,-75,200,-97,150,-93,200,-159,200,-213,150,-216,100,-192,100,-279,50,-74,250,-111,200,-125,200,-167,150,-164,150,-217,100,-198,75,-207,62,-294,163,70,150,51,250,59,150,21,200,12,300,-17,300,-59,300,-106,250,-128,250,-174,150,-133,150,-161,150,-200,83,-136,100,-202,67,-173,58,-206,42,-241,50,-53,200,-65,250,-113,150,-86,150,-103,150,-123,150,-146,150,-179,100,-144,150,-275,66,-162,59,-182,39,-168,29,-192,15,-336,192,-82,150,-79,167,-106,162,-123,121,-108,140,-147,127,-158,104,-155]],[0.954,3.755,3.9664,[1036,14809,250,-21,200,-42,200,-66,200,-92,200,-124,150,-118,150,-147,150,-188,50,-17,250,10,200,-14,200,-34,150,-38,150,-51,200,-88,250,-149,150,-115,150,-138,100,-109,100,-127,100,-151,67,-119,83,-181,50,-138,50,-182,50,-58,150,-52,200,-94,200,-124,150,-119,200,-205,150,-204,67,-114,83,-174,100,-291,250,-107,200,-120,200,-161,150,-157,150,-205,100,-181,100,-258,50,-210,50,-69,250,94,150,40,200,37,300,20,300,-21,300,-64,150,-48,150,-61,250,-133,200,-139,150,-129,150,-155,150,-192,117,-187,100,-203,58,-151,65,-229,50,-268,260,-85,300,-145,250,-167,100,-81,150,-142,200,-239,167,-265,133,-299,100,-351,250,170,150,77,150,61,150,47,150,34,150,21,200,9,150,-6,200,-28,300,-84,250,-114,200,-126,100,-78,200,-192,150,-190,100,-161,67,-132,93,-251,50,-214,25,-228,3,-974,262,63,150,22,200,14,300,-12,300,-52,300,-95,250,-116,250,-157,200,-161,200,-205,100,-124,100,-145,117,-207,111,-264,85,-309,35,-238,9,-281,-33,-324]],[1.158,3.79,4.0008,[-661,16104,-200,30,-150,11,-300,-4,-300,-41,-300,-80,-300,-122,-250,-140,-150,-103,-150,-121,-200,-196,-150,-181,-100,-142,-167,-301,-121,-311,-52,-195,-35,-189,-13,-15,-312,-119,-200,-102,-200,-127,-150,-114,-150,-133,-200,-216,-150,-202,-117,-192,-100,-204,-83,-217,-67,-241,-36,-196,-23,-263,-3,-642,-21,3,84,-15]]]};/* AFORO:fin */

function aforo(svg) {
  const root = svg.closest('[data-aforo]');
  const pasos = root ? [...root.querySelectorAll('[data-aforo-paso]')] : [];
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const D = AFORO;
  const CX = 120, Y0 = 246;                        // eje del matraz y fondo interior
  const sx = x => CX + x, sy = y => Y0 - y;        // milímetros → SVG
  const MOL = 0.05, Q = 55;                        // mol de CuSO₄; mL/s de la piseta
  const GOTA = 0.05, R_GOTA = 2.29;                // mL por gota y su radio en mm
  const N_GOTAS = 6;
  const R = D.radios, BOCA = D.boca, MARCA = D.marca, HOMBRO = D.hombro;
  const R_CUELLO = R[R.length - 1], VIDRIO = 1.4;
  const PX = CX, PY = sy(150);                     // la mano agita desde el cuello
  const azulDe = c => 1 - Math.exp(-3.4 * Math.max(0, c));

  // Volumen hasta cada milímetro: troncos de cono, igual que en aforo.py.
  const VOL = [0];
  for (let i = 1; i < R.length; i++) VOL.push(VOL[i - 1] + Math.PI * (R[i - 1] ** 2 + R[i - 1] * R[i] + R[i] ** 2) / 3000);
  const radio = y => { const i = clamp(Math.floor(y), 0, R.length - 2); return mix(R[i], R[i + 1], clamp(y - i)); };
  function volHasta(h) {
    const i = clamp(Math.floor(h), 0, R.length - 2), r0 = R[i], rt = radio(h);
    return VOL[i] + Math.PI * (h - i) * (r0 * r0 + r0 * rt + rt * rt) / 3000;
  }
  function nivel(v) {
    if (v <= 0) return 0;
    let lo = 0, hi = BOCA;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (volHasta(m) < v) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const V_MARCA = volHasta(MARCA);                 // 250 mL (calibrado)
  const V_MITAD = 125, V_PISETA = V_MARCA - N_GOTAS * GOTA;

  // ---- Granos: caminos en micrómetros (primer punto y diferencias) ----
  const granos = D.granos.map(([r, t0, tc, flat]) => {
    const pts = [[flat[0] / 1000, flat[1] / 1000]];
    for (let i = 2; i < flat.length; i += 2) {
      const [x, y] = pts[pts.length - 1];
      pts.push([x + flat[i] / 1000, y + flat[i + 1] / 1000]);
    }
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { r, t0, tc, pts, acc, x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
  });
  const T_POLVO = Math.max(...granos.map(g => g.tc + g.acc[g.acc.length - 1] / D.vel));
  function enCamino(g, t) {
    if (t <= g.t0) return null;
    if (t <= g.tc) return [g.pts[0][0], Math.max(D.papel - 0.5 * D.g * (t - g.t0) ** 2, g.pts[0][1])];
    const s = (t - g.tc) * D.vel, acc = g.acc;
    if (s >= acc[acc.length - 1]) return g.pts[g.pts.length - 1];
    let i = 1;
    while (acc[i] < s) i++;
    const u = (s - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    return [mix(g.pts[i - 1][0], g.pts[i][0], u), mix(g.pts[i - 1][1], g.pts[i][1], u)];
  }
  // Contactos en el montón final. En cada par que se toca, el de arriba descansa
  // en el de abajo: un grano no se disuelve mientras tenga alguno encima.
  granos.forEach((g, k) => {
    g.suelo = g.y - g.r < 0.03;
    const toca = granos.filter((h, j) => j !== k && Math.abs(Math.hypot(g.x - h.x, g.y - h.y) - g.r - h.r) < 0.03);
    g.debajo = toca.filter(h => h.y < g.y);
    g.encima = toca.filter(h => h.y > g.y);
    const izq = g.debajo.filter(h => h.x < g.x).sort((a, b) => b.y - a.y)[0];
    const der = g.debajo.filter(h => h.x >= g.x).sort((a, b) => b.y - a.y)[0];
    g.apoyos = izq && der ? [izq, der] : null;
    // Con un solo lado, el apoyo es el que está más directamente abajo.
    g.apoyo = g.debajo.slice().sort((a, b) => (g.y - b.y) / (Math.abs(g.x - b.x) + .01) - (g.y - a.y) / (Math.abs(g.x - a.x) + .01))[0] || null;
  });

  // ---- Línea de tiempo (s) ----
  const T = {};
  T.polvo = 0.9;                                   // sale el primer grano del papel
  T.quita = T.polvo + T_POLVO + 0.3;               // se van el papel y el embudo
  T.llena1 = T.quita + 0.9;
  T.agita1 = T.llena1 + V_MITAD / Q + 0.3;
  // Disolución: cada grano empieza cuando el agua lo cubre y ya no tiene granos encima.
  const llegaAgua = y => T.llena1 + volHasta(y) / Q;
  // Empiezan los de arriba (los que el agua moja primero por todos lados), pero
  // cada grano termina después de los que descansan en él: nunca se queda nada
  // apoyado en el aire.
  const porAltura = [...granos].sort((a, b) => b.y - a.y);
  porAltura.forEach((g, k) => {
    const dur = 0.62 + 0.26 * ((k * 0.618) % 1);
    g.td0 = Math.max(llegaAgua(g.y + g.r) + 0.2, ...g.encima.map(h => h.td0 + 0.12));
    g.td1 = Math.max(g.td0 + dur, ...g.encima.map(h => h.td1 + 0.06));
  });
  const T_DISUELTO = Math.max(...granos.map(g => g.td1));
  T.finAgita1 = Math.max(T.agita1 + 2.4, T_DISUELTO + 0.2);
  T.llena2 = T.finAgita1 + 0.4;
  T.gotero = T.llena2 + (V_PISETA - V_MITAD) / Q + 0.3;
  T.gotas = T.gotero + 0.7;
  const CADA_GOTA = 0.46, FORMA = 0.3;
  T.tapon = T.gotas + N_GOTAS * CADA_GOTA + 0.5;
  T.agita2 = T.tapon + 0.8;
  T.fin = T.agita2 + 2.2;
  const LIMITES = [0, T.llena1 - 0.4, T.llena2, T.tapon, Infinity];

  // ---- Dibujo ----
  const uid = 'aforo-' + Math.random().toString(36).slice(2, 7);
  const defs = make('defs', {}, svg);
  const grad = make('linearGradient', { id: uid + '-azul', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 0 }, defs);
  const paradaArriba = make('stop', { offset: 0, class: 'aforo__parada' }, grad);
  const paradaAbajo = make('stop', { offset: 1, class: 'aforo__parada' }, grad);
  const recorte = make('clipPath', { id: uid + '-lupa' }, defs);
  make('rect', { x: 205, y: 130, width: 64, height: 96 }, recorte);

  // El agua va debajo de los granos y el azul encima: los granos se ven dentro
  // del líquido, teñidos.
  const agua = make('path', { class: 'escena__liquido' }, svg);
  const capaPolvo = make('g', {}, svg);            // granos (giran con el matraz)
  const azul = make('path', { fill: `url(#${uid}-azul)` }, svg);
  const superficie = make('path', { class: 'aforo__superficie' }, svg);
  const matraz = make('g', {}, svg);
  // Vidrio: el trazo va por fuera del perfil interior, así el líquido llega justo al vidrio.
  const labio = R_CUELLO + VIDRIO / 2 + 1.6;
  const contorno = [[sx(-labio), sy(BOCA)]];
  for (let y = BOCA; y >= 0; y--) contorno.push([sx(-R[y] - VIDRIO / 2), sy(y)]);
  contorno.push([sx(-R[0] - VIDRIO / 2), sy(-VIDRIO / 2)], [sx(R[0] + VIDRIO / 2), sy(-VIDRIO / 2)]);
  for (let y = 0; y <= BOCA; y++) contorno.push([sx(R[y] + VIDRIO / 2), sy(y)]);
  contorno.push([sx(labio), sy(BOCA)]);
  make('path', { d: 'M' + contorno.map(p => `${round(p[0])} ${round(p[1])}`).join('L'), class: 'aforo__vidrio' }, matraz);
  make('path', { d: `M${sx(-R_CUELLO - 2.6)} ${sy(MARCA)}H${sx(R_CUELLO + 2.6)}`, class: 'aforo__marca' }, matraz);
  text(matraz, CX, sy(62), '250 mL', 'aforo__rotulo', { 'text-anchor': 'middle' });
  text(matraz, CX, sy(55), '20 °C', 'aforo__rotulo', { 'text-anchor': 'middle' });
  const tapon = make('g', {}, matraz);
  make('path', { d: `M${sx(-R_CUELLO + .2)} ${sy(BOCA - 9)}V${sy(BOCA + 2)}H${sx(-R_CUELLO - 3)}V${sy(BOCA + 6.5)}H${sx(R_CUELLO + 3)}V${sy(BOCA + 2)}H${sx(R_CUELLO - .2)}V${sy(BOCA - 9)}Z`, class: 'aforo__tapon' }, tapon);

  const circulos = granos.map(g => make('circle', { r: g.r, class: 'aforo__grano' }, capaPolvo));

  // Herramientas: vidrio de reloj con el polvo, embudo, piseta y gotero.
  // El vidrio de reloj (40 mm) se inclina 18° sobre el embudo; el labio queda
  // justo donde empiezan a caer los granos.
  const papel = make('g', {}, svg);
  const INCL = -18 * Math.PI / 180, LABIO = [sx(-2.2), sy(D.papel - 1.6)];
  const enVidrio = (u, v) => [LABIO[0] + u * Math.cos(INCL) + v * Math.sin(INCL), LABIO[1] + u * Math.sin(INCL) - v * Math.cos(INCL)];
  const fondoVidrio = u => -4.2 * 4 * (u / 40) * (1 - u / 40);   // el vidrio es cóncavo: baja hasta 4.2 mm
  const curva = [];
  for (let u = 0; u <= 40; u += 2) curva.push(enVidrio(u, fondoVidrio(u)));
  make('path', { d: 'M' + curva.map(p => `${round(p[0])} ${round(p[1])}`).join('L'), class: 'aforo__vidrio aforo__vidrio-reloj' }, papel);
  const montonPapel = make('path', { class: 'aforo__polvo' }, papel);
  function montonEnVidrio(f) {
    if (f <= 0) return 'M0 0';
    const a = 20 - 13 * Math.sqrt(f), b = 20 + 13 * Math.sqrt(f), alto = 5.5 * Math.sqrt(f);
    const pts = [];
    for (let k = 0; k <= 12; k++) { const u = mix(a, b, k / 12); pts.push(enVidrio(u, fondoVidrio(u) + 0.7)); }
    for (let k = 12; k >= 0; k--) {
      const u = mix(a, b, k / 12), w = (u - a) / (b - a);
      pts.push(enVidrio(u, fondoVidrio(u) + 0.7 + alto * Math.sin(Math.PI * w) ** 0.8));
    }
    return 'M' + pts.map(p => `${round(p[0])} ${round(p[1])}`).join('L') + 'Z';
  }
  const embudo = make('g', {}, svg);
  make('path', { d: `M${sx(-17)} ${sy(BOCA + 24)}L${sx(-4.4)} ${sy(BOCA + 7)}V${sy(BOCA - 15)}M${sx(17)} ${sy(BOCA + 24)}L${sx(4.4)} ${sy(BOCA + 7)}V${sy(BOCA - 15)}`, class: 'aforo__vidrio' }, embudo);
  const piseta = make('g', {}, svg);
  // Botella de plástico inclinada arriba a la derecha (sale del cuadro) y su boquilla doblada.
  make('path', { d: `M${sx(43)} ${-6}L${sx(49)} ${18}Q${sx(50)} ${22} ${sx(54)} ${21}L${sx(80)} ${14}Q${sx(84)} ${13} ${sx(83)} ${9}L${sx(78)} ${-6}`, class: 'aforo__botella' }, piseta);
  make('path', { d: `M${sx(41)} ${6}L${sx(46)} ${4.6}L${sx(48.5)} ${13}L${sx(43.5)} ${14.4}Z`, class: 'aforo__tapa-botella' }, piseta);
  make('path', { d: `M${sx(44)} ${9.6}C${sx(30)} ${12} ${sx(0)} ${10} ${sx(0)} ${sy(BOCA + 16)}V${sy(BOCA + 10)}`, class: 'aforo__boquilla' }, piseta);
  const chorro = make('path', { class: 'aforo__chorro' }, svg);
  const gotero = make('g', {}, svg);
  make('path', { d: `M${sx(-1.8)} ${sy(BOCA + 28)}V${sy(BOCA + 11)}L${sx(-.7)} ${sy(BOCA + 5)}H${sx(.7)}L${sx(1.8)} ${sy(BOCA + 11)}V${sy(BOCA + 28)}`, class: 'aforo__vidrio' }, gotero);
  make('rect', { x: sx(-3.6), y: sy(BOCA + 41), width: 7.2, height: 14, rx: 3.4, class: 'aforo__perilla' }, gotero);
  const gota = make('circle', { r: R_GOTA, class: 'aforo__gota' }, svg);
  const herramienta = text(svg, 148, 30, '', 'escena__clave');

  // Lupa del cuello: 4 veces, de 140 a 164 mm de altura.
  const LUPA = { x: 205, y: 130, w: 64, h: 96, y0: 140, k: 4 };
  const lx = x => LUPA.x + LUPA.w / 2 + x * LUPA.k, ly = y => LUPA.y + LUPA.h - (y - LUPA.y0) * LUPA.k;
  const lupa = make('g', {}, svg);
  make('rect', { x: sx(-8.5), y: sy(164), width: 17, height: 24, class: 'aforo__ventana' }, lupa);
  make('path', { d: `M${sx(8.5)} ${sy(164)}L${LUPA.x} ${LUPA.y}M${sx(8.5)} ${sy(140)}L${LUPA.x} ${LUPA.y + LUPA.h}`, class: 'escena__guia' }, lupa);
  const dentro = make('g', { 'clip-path': `url(#${uid}-lupa)` }, lupa);
  make('rect', { x: LUPA.x, y: LUPA.y, width: LUPA.w, height: LUPA.h, class: 'aforo__fondo-lupa' }, dentro);
  const aguaLupa = make('path', { class: 'escena__liquido' }, dentro);
  const azulLupa = make('path', { class: 'aforo__azul-lupa' }, dentro);
  const menisco = make('path', { class: 'aforo__superficie' }, dentro);
  [-1, 1].forEach(s => make('rect', { x: s < 0 ? lx(-R_CUELLO - VIDRIO) : lx(R_CUELLO), y: LUPA.y, width: VIDRIO * LUPA.k, height: LUPA.h, class: 'aforo__vidrio-lupa' }, dentro));
  make('path', { d: `M${LUPA.x} ${ly(MARCA)}H${LUPA.x + LUPA.w}`, class: 'aforo__marca' }, dentro);
  make('rect', { x: LUPA.x, y: LUPA.y, width: LUPA.w, height: LUPA.h, class: 'escena__marco aforo__marco' }, lupa);
  text(lupa, LUPA.x + LUPA.w + 8, ly(MARCA) + 4, 'marca de aforo', 'escena__clave escena__clave--chica');

  // Lectura: soluto, volumen y molaridad.
  const lectura = make('g', {}, svg);
  const filaSoluto = make('g', {}, lectura);
  formula(filaSoluto, 205, 36, [['CuSO', null], ['4', 'sub']], 'escena__clave');
  text(filaSoluto, 290, 36, '0.050 mol', 'aforo__valor');
  const filaVolumen = make('g', {}, lectura);
  text(filaVolumen, 205, 56, 'Volumen', 'escena__clave');
  const valorVolumen = text(filaVolumen, 290, 56, '', 'aforo__valor');
  const filaM = make('g', {}, lectura);
  text(filaM, 205, 76, 'Molaridad', 'escena__clave');
  const valorM = text(filaM, 290, 76, '', 'aforo__valor aforo__valor--acento');
  const cuenta = text(filaM, 205, 98, '', 'escena__clave escena__clave--chica');
  const escrito = new WeakMap();
  function escribe(node, valor) { if (escrito.get(node) !== valor) { escrito.set(node, valor); node.textContent = valor; } }

  // ---- Geometría del líquido ----
  const interior = [];
  for (let y = 0; y <= BOCA; y++) interior.push([sx(-R[y]), sy(y)]);
  for (let y = BOCA; y >= 0; y--) interior.push([sx(R[y]), sy(y)]);
  function gira([x, y], th) {
    const c = Math.cos(th), s = Math.sin(th), dx = x - PX, dy = y - PY;
    return [PX + dx * c - dy * s, PY + dx * s + dy * c];
  }
  function recorta(poly, L) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ia = a[1] >= L, ib = b[1] >= L;
      if (ia) out.push(a);
      if (ia !== ib) out.push([a[0] + (b[0] - a[0]) * (L - a[1]) / (b[1] - a[1]), L]);
    }
    return out;
  }
  function area(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return Math.abs(s) / 2;
  }
  const camino = poly => poly.length ? 'M' + poly.map(p => `${round(p[0])} ${round(p[1])}`).join('L') + 'Z' : '';
  const ALTO_MENISCO = 1.2;
  // Corte del líquido derecho; en el cuello lleva menisco (el fondo del menisco es el nivel).
  function liquidoDerecho(h) {
    if (h <= 0) return { poly: [], sup: '' };
    const conMenisco = h > HOMBRO + 2;
    const borde = conMenisco ? h + ALTO_MENISCO : h;
    const poly = [];
    for (let y = 0; y < borde; y++) poly.push([sx(-R[y]), sy(y)]);
    const rb = radio(borde);
    poly.push([sx(-rb), sy(borde)]);
    let sup;
    if (conMenisco) {
      for (let k = 1; k < 12; k++) {
        const u = k / 12, x = mix(-rb, rb, u), y = borde - ALTO_MENISCO * 4 * u * (1 - u);
        poly.push([sx(x), sy(y)]);
      }
      sup = `M${round(sx(-rb))} ${round(sy(borde))}Q${CX} ${round(sy(h - ALTO_MENISCO))} ${round(sx(rb))} ${round(sy(borde))}`;
    } else {
      sup = `M${round(sx(-rb))} ${round(sy(borde))}H${round(sx(rb))}`;
    }
    poly.push([sx(rb), sy(borde)]);
    for (let y = Math.ceil(borde) - 1; y >= 0; y--) poly.push([sx(R[y]), sy(y)]);
    return { poly, sup, arriba: sy(borde) };
  }
  // Inclinado: el mismo área, con la superficie horizontal.
  function liquidoInclinado(h, th) {
    const objetivo = area(liquidoDerecho(h).poly);
    const g = interior.map(p => gira(p, th));
    let lo = Math.min(...g.map(p => p[1])), hi = Math.max(...g.map(p => p[1]));
    for (let k = 0; k < 32; k++) { const m = (lo + hi) / 2; if (area(recorta(g, m)) > objetivo) lo = m; else hi = m; }
    const L = (lo + hi) / 2, poly = recorta(g, L);
    const xs = poly.filter(p => Math.abs(p[1] - L) < 1e-6).map(p => p[0]);
    return { poly, sup: xs.length >= 2 ? `M${round(Math.min(...xs))} ${round(L)}H${round(Math.max(...xs))}` : '', arriba: L };
  }

  // ---- Estado en el tiempo ----
  function volumenEn(t) {
    if (t < T.llena1) return 0;
    if (t < T.agita1 - 0.3) return Math.min(V_MITAD, (t - T.llena1) * Q);
    if (t < T.llena2) return V_MITAD;
    if (t < T.gotero - 0.3) return Math.min(V_PISETA, V_MITAD + (t - T.llena2) * Q);
    const caidas = gotasCaidas(t);
    return V_PISETA + caidas * GOTA;
  }
  function gotaEstado(k, t) {
    const t0 = T.gotas + k * CADA_GOTA, suelta = t0 + FORMA;
    if (t < t0) return null;
    const yPunta = BOCA + 5;
    if (t < suelta) { const r = R_GOTA * Math.cbrt(clamp((t - t0) / FORMA)); return { x: 0, y: yPunta - r, r }; }
    const h = nivel(V_PISETA + k * GOTA);
    const y = yPunta - R_GOTA - 0.5 * 9810 * (t - suelta) ** 2;
    return y - R_GOTA <= h ? 'cayo' : { x: 0, y, r: R_GOTA };
  }
  function gotasCaidas(t) {
    let n = 0;
    for (let k = 0; k < N_GOTAS; k++) if (gotaEstado(k, t) === 'cayo') n++;
    return n;
  }
  function radioGrano(g, t) {
    if (t <= g.td0) return g.r;
    return g.r * Math.cbrt(1 - smooth((t - g.td0) / (g.td1 - g.td0)));
  }
  // Al disolverse el montón se asienta: de abajo hacia arriba, cada grano baja en
  // vertical hasta apoyarse en lo que ya quedó abajo (con el tamaño que tiene en
  // ese momento) o en el fondo. Así ningún grano se encima con otro ni flota.
  const deAbajo = [...granos].sort((a, b) => a.y - b.y);
  function asienta(time) {
    deAbajo.forEach((g, i) => {
      const rho = radioGrano(g, time);
      let y = rho;
      for (let j = 0; j < i; j++) {
        const h = deAbajo[j], dd = h.rho + rho, dx = g.x - h.cx;
        if (h.rho > 0 && Math.abs(dx) < dd) y = Math.max(y, h.cy + Math.sqrt(dd * dd - dx * dx));
      }
      g.rho = rho;
      g.cx = g.x;
      g.cy = Math.min(y, g.y);
    });
  }
  function inclinacion(t) {
    const onda = (t0, t1) => {
      if (t < t0 || t > t1) return 0;
      const u = (t - t0) / (t1 - t0);
      return Math.sin(u * Math.PI * 2 * Math.round((t1 - t0) * 1.25)) * Math.sin(u * Math.PI);
    };
    return (6 * Math.PI / 180) * (onda(T.agita1, T.finAgita1) + onda(T.agita2, T.fin - 0.2));
  }

  let t = 0, pasoActual = -1;
  function draw(time) {
    const th = inclinacion(time);
    const giro = th ? `rotate(${round(th * 180 / Math.PI)} ${PX} ${round(PY)})` : '';
    matraz.setAttribute('transform', giro);
    capaPolvo.setAttribute('transform', giro);

    // Polvo: cae, se acomoda y se disuelve.
    if (time >= T.llena1) asienta(time);
    let solido = 0, total = 0;
    granos.forEach((g, k) => {
      total += g.r ** 3;
      const c = circulos[k];
      if (time < T.llena1) {
        const p = enCamino(g, time - T.polvo);
        fade(c, p ? 1 : 0);
        if (p) set(c, { cx: sx(p[0]), cy: sy(p[1]), r: g.r });
        solido += g.r ** 3;
        return;
      }
      const rho = g.rho;
      solido += rho ** 3;
      fade(c, rho > 0.05 ? 1 : 0);
      if (rho > 0.05) set(c, { cx: sx(g.cx), cy: sy(g.cy), r: rho });
    });
    const quedan = granos.filter(g => time - T.polvo <= g.t0).length;
    const fraccion = quedan / granos.length;
    set(montonPapel, { d: montonEnVidrio(fraccion) });
    const sale = smooth((time - T.quita) / 0.6);
    fade(papel, 1 - sale);
    papel.setAttribute('transform', `translate(0 ${round(-12 * sale)})`);
    fade(embudo, 1 - sale);
    embudo.setAttribute('transform', `translate(0 ${round(-14 * sale)})`);

    // Agua y color.
    const v = volumenEn(time), h = nivel(v);
    const liq = th ? liquidoInclinado(h, th) : liquidoDerecho(h);
    const d = camino(liq.poly);
    agua.setAttribute('d', d);
    azul.setAttribute('d', d);
    superficie.setAttribute('d', liq.sup || '');
    const n = MOL * (1 - solido / total);
    const c = v > 0 ? n / (v / 1000) : 0;
    let k = 0;                                     // 0 = parejo; > 0, más oscuro abajo; < 0, más claro arriba
    if (time < T.finAgita1) k = 1 - 0.3 * smooth((time - T.llena1) / (V_MITAD / Q)) - 0.7 * smooth((time - T.agita1) / (T.finAgita1 - T.agita1));
    else if (time < T.agita2) k = (v - V_MITAD) / v * (1 - 0.35 * smooth((time - T.llena2) / (T.tapon - T.llena2)));
    else k = ((V_MARCA - V_MITAD) / V_MARCA) * 0.65 * (1 - smooth((time - T.agita2) / (T.fin - 0.2 - T.agita2)));
    set(grad, { y1: round(liq.arriba || sy(h)), y2: sy(0) + 6 });
    paradaArriba.setAttribute('stop-opacity', round(azulDe(c * (1 - k))));
    paradaAbajo.setAttribute('stop-opacity', round(azulDe(c * (1 + k))));

    // Piseta y chorro (de la boquilla a la superficie).
    const conPiseta = (time > T.quita + 0.5 && time < T.gotero) ? 1 : 0;
    fade(piseta, conPiseta ? smooth((time - T.quita - 0.5) / 0.4) * (1 - smooth((time - T.gotero + 0.4) / 0.4)) : 0);
    const fluye = (time >= T.llena1 && v < V_MITAD && time < T.agita1) || (time >= T.llena2 && v < V_PISETA && time < T.gotero);
    chorro.setAttribute('d', fluye ? `M${CX} ${round(sy(BOCA + 10))}V${round(sy(h))}` : '');

    // Gotero y gotas.
    fade(gotero, smooth((time - T.gotero) / 0.4) * (1 - smooth((time - T.tapon + 0.3) / 0.3)));
    let visible = null;
    for (let i = 0; i < N_GOTAS; i++) { const e = gotaEstado(i, time); if (e && e !== 'cayo') visible = e; }
    fade(gota, visible ? 1 : 0);
    if (visible) set(gota, { cx: sx(visible.x), cy: sy(visible.y), r: visible.r });

    // Tapón: entra desde arriba.
    const entra = smooth((time - T.tapon) / 0.6);
    fade(tapon, entra);
    tapon.setAttribute('transform', `translate(0 ${round(-10 * (1 - entra))})`);

    // Rótulo de la herramienta que se usa.
    const nombre = time < T.quita ? 'embudo' : time < T.gotero ? (time > T.quita + 0.5 ? 'piseta' : '') : time < T.tapon ? 'gotero' : 'tapón';
    escribe(herramienta, time > T.fin - 0.2 ? '' : nombre);

    // Lupa: del llenado final hasta el fin (se oculta mientras se agita).
    fade(lupa, smooth((time - T.llena2 - 1.2) / 0.5) * (th ? 0 : 1));
    const lh = Math.max(h, LUPA.y0 - 2);
    const rb = R_CUELLO, borde = lh + ALTO_MENISCO;
    const lpoly = `M${lx(-rb)} ${LUPA.y + LUPA.h + 2}V${round(ly(borde))}Q${lx(0)} ${round(ly(lh - ALTO_MENISCO))} ${lx(rb)} ${round(ly(borde))}V${LUPA.y + LUPA.h + 2}Z`;
    aguaLupa.setAttribute('d', lpoly);
    azulLupa.setAttribute('d', lpoly);
    fade(azulLupa, azulDe(c * (1 - k)));
    menisco.setAttribute('d', `M${lx(-rb)} ${round(ly(borde))}Q${lx(0)} ${round(ly(lh - ALTO_MENISCO))} ${lx(rb)} ${round(ly(borde))}`);

    // Lectura.
    fade(filaSoluto, smooth((time - T.quita) / 0.5));
    fade(filaVolumen, v > 0 ? 1 : 0);
    // El volumen, la cuenta y la molaridad salen del mismo número que se muestra.
    const enMarca = v >= V_MARCA - 1e-6, conGotas = time >= T.gotero && !enMarca;
    const vMostrado = enMarca ? 250 : conGotas ? Math.floor(v * 20 + 1e-6) / 20 : Math.floor(v + 1e-6);
    escribe(valorVolumen, enMarca ? '250.0 mL' : conGotas ? `${vMostrado.toFixed(2)} mL` : `${vMostrado} mL`);
    const listo = time >= T.finAgita1;
    fade(filaM, listo ? smooth((time - T.finAgita1) / 0.5) : 0);
    if (listo && vMostrado > 0) {
      const vL = vMostrado / 1000;
      escribe(valorM, `${(MOL / vL).toFixed(2)} M`);
      escribe(cuenta, `M = 0.050 mol ÷ ${conGotas ? vL.toFixed(5) : vL.toFixed(3)} L`);
    }

    // Paso actual en la lista de la lección.
    const paso = LIMITES.findIndex((lim, i) => time >= lim && time < LIMITES[i + 1]);
    if (paso !== pasoActual) {
      pasoActual = paso;
      pasos.forEach((li, i) => {
        const actual = i === paso;
        li.classList.toggle('es-actual', actual);
        if (actual) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
    }
  }

  function reinicia(animar) {
    t = animar && !reducedMotion.matches ? 0 : T.fin + 1;
    draw(t);
  }
  // Se reproduce sola la primera vez que se ve (el reloj sólo avanza las escenas visibles).
  if (repetir) repetir.addEventListener('click', () => reinicia(true));
  reinicia(true);
  return {
    update(dt) { if (t < T.fin + 1) { t += dt; draw(t); } },
    still() { t = T.fin + 1; draw(t); },
    T
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { recta, sumacero, lectura, reacomodo, escalaph, mechero, aforo };
const scenes = [...document.querySelectorAll('[data-escena-reaccion]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaReaccion](svg)
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
