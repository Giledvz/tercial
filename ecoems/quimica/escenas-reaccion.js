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

/* ---------------- Reloj compartido ---------------- */
const factories = { recta, sumacero, lectura, reacomodo, escalaph };
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
