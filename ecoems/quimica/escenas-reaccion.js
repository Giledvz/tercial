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

/* ---------------- Reloj compartido ---------------- */
const factories = { recta, sumacero, lectura };
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
