/* Escenas de Notación científica (Física, semana 3). Mismo contrato que las de la
   plantilla: cada escena es { update(dt), still() }; el reloj compartido sólo avanza las
   escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final. Al llegar
   a la tele (tercial:diapositiva), con «Repetir» o con otra pastilla, empieza de nuevo. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const expTxt = e => (e < 0 ? MENOS + -e : String(e));

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

// «10» con su exponente arriba (y lo que siga), dentro de un <text> de letra «tam»
// (el mismo tamaño que le da la hoja de estilos a su clase).
function potencia(text, tam, base, exponente, resto, claseExp, proporcion = 0.62) {
  const t0 = make('tspan', {}, text); t0.textContent = base;
  const t1 = make('tspan', { dy: -tam * 0.42, 'font-size': tam * proporcion, class: claseExp || '' }, text); t1.textContent = exponente;
  if (resto) { const t2 = make('tspan', { dy: tam * 0.42, 'font-size': tam }, text); t2.textContent = resto; }
}

/* ---------- Números como texto, para comprobar cada caso al cargar ---------- */
// Cifras y lugar del punto (punto = cuántas cifras quedan a su izquierda) → decimal canónico.
function canonico(entero, fraccion) {
  entero = entero.replace(/^0+(?=\d)/, '') || '0';
  fraccion = fraccion.replace(/0+$/, '');
  return fraccion ? entero + '.' + fraccion : entero;
}
function decimalDe(cifras, punto) {
  return punto >= cifras.length ? canonico(cifras + '0'.repeat(punto - cifras.length), '')
    : canonico(cifras.slice(0, punto), cifras.slice(punto));
}
function decimalCientifico(coef, exp) {
  const [a, b = ''] = coef.split('.');
  const todas = a + b;
  return decimalDe(exp + a.length > 0 ? todas : '0'.repeat(-(exp + a.length)) + todas, Math.max(exp + a.length, 0));
}

/* ---------------- El punto que salta ----------------
   Las cifras van cada una en su lugar (una raya debajo). El punto salta de lugar en
   lugar, por arriba de las cifras, y cada salto se cuenta: el número de saltos es el
   exponente. Hacia la izquierda (un número grande) el exponente es positivo; hacia la
   derecha (un número menor que 1), negativo. Al final se apagan las cifras que ya no
   cuentan y aparece el número escrito en notación científica.
   Valores reales: la luz, unos 3 × 10⁸ m/s; la Tierra, 12,742 km de diámetro, unos
   1.27 × 10⁷ m; un glóbulo rojo, unos 7.5 µm = 7.5 × 10⁻⁶ m. */
const CASOS = {
  luz: { rotulo: 'Lo que recorre la luz en un segundo', cifras: '300000000', desde: 9, hasta: 1, unidad: 'm', coef: '3', exp: 8 },
  tierra: { rotulo: 'El diámetro de la Tierra', cifras: '12700000', desde: 8, hasta: 1, unidad: 'm', coef: '1.27', exp: 7 },
  globulo: { rotulo: 'El ancho de un glóbulo rojo', cifras: '00000075', desde: 1, hasta: 7, unidad: 'm', coef: '7.5', exp: -6 }
};

const P = 32, BASE = 96, TAM_CIFRA = 34, ALTO_CIFRA = 25, R_PUNTO = 3.3;
const Y_PUNTO = BASE - 3, ALTO_ARCO = 44;

for (const [clave, c] of Object.entries(CASOS)) {
  // El número de arriba y el de abajo son el mismo, y el punto salta tantos lugares como dice el exponente.
  if (decimalDe(c.cifras, c.desde) !== decimalCientifico(c.coef, c.exp)) throw new Error(`salto: ${clave} no vale ${c.coef} × 10^${c.exp}`);
  if (decimalDe(c.cifras, c.hasta) !== c.coef) throw new Error(`salto: ${clave} no deja el coeficiente ${c.coef}`);
  if (c.desde - c.hasta !== c.exp) throw new Error(`salto: ${clave} salta ${c.desde - c.hasta} lugares y el exponente es ${c.exp}`);
  // El arco pasa por arriba de las cifras: su punto más alto queda sobre ellas con holgura.
  if (Y_PUNTO - ALTO_ARCO * 0.75 > BASE - ALTO_CIFRA - 8) throw new Error('salto: el arco roza las cifras');
}

function salto(svg) {
  const root = svg.closest('[data-salto]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-salto-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });

  const capa = make('g', {}, svg);
  let clave = null, c = null, t = 0, partes = null, linea = null;

  function lineaDeTiempo(caso) {
    const saltos = Math.abs(caso.desde - caso.hasta);
    const inicioSaltos = 2.9, porSalto = 0.95;
    const finSaltos = inicioSaltos + saltos * porSalto;
    return { aparece: [0.4, 0.9], comas: [1.7, 2.3], punto: [1.9, 2.4], inicioSaltos, porSalto, mueve: 0.62,
      apaga: [finSaltos + 0.3, finSaltos + 0.9], resultado: [finSaltos + 1.1, finSaltos + 1.7], fin: finSaltos + 1.9 };
  }

  function armar(nueva) {
    clave = nueva;
    c = CASOS[clave];
    linea = lineaDeTiempo(c);
    capa.innerHTML = '';
    const n = c.cifras.length;
    const anchoUnidad = c.unidad.length * 9 + 4;
    const x0 = (400 - (n * P + 10 + anchoUnidad)) / 2;
    const xGap = i => x0 + i * P;
    const xLugar = i => x0 + i * P + P / 2;
    const entero = c.desde >= n;                          // el punto empieza al final: no se ve
    const primera = c.cifras.search(/[1-9]/);
    const largoCoef = c.coef.replace('.', '').length;
    const cuenta = (i) => i >= primera && i < primera + largoCoef;

    const rotulo = make('text', { x: 200, y: 24, class: 'salto__rotulo', 'text-anchor': 'middle' }, capa);
    rotulo.textContent = c.rotulo;
    const fondo = make('g', {}, capa);
    const cifras = [], comas = [];
    for (let i = 0; i < n; i++) {
      make('path', { d: `M${xLugar(i) - 11} ${BASE + 8}H${xLugar(i) + 11}`, class: 'salto__lugar' }, fondo);
      const d = make('text', { x: xLugar(i), y: BASE, class: 'salto__cifra', 'text-anchor': 'middle' }, capa);
      d.textContent = c.cifras[i];
      cifras.push({ nodo: d, cuenta: cuenta(i) });
    }
    if (entero) {
      for (let g = n - 3; g > 0; g -= 3) {
        const coma = make('text', { x: xGap(g), y: BASE, class: 'salto__cifra salto__coma', 'text-anchor': 'middle' }, capa);
        coma.textContent = ',';
        comas.push(coma);
      }
    }
    const unidad = make('text', { x: xGap(n) + 10, y: BASE, class: 'salto__unidad' }, capa);
    unidad.textContent = c.unidad;
    // Los saltos: un arco por lugar, que se queda dibujado, con su número arriba.
    const paso = c.desde > c.hasta ? -1 : 1;
    const arcos = [];
    for (let k = 0; k < Math.abs(c.desde - c.hasta); k++) {
      const a = xGap(c.desde + paso * k), b = xGap(c.desde + paso * (k + 1));
      const yC = Y_PUNTO - ALTO_ARCO;
      const d = `M${a} ${Y_PUNTO}C${a} ${yC} ${b} ${yC} ${b} ${Y_PUNTO}`;
      const arco = make('path', { d, class: 'salto__arco' }, capa);
      const largo = arco.getTotalLength ? arco.getTotalLength() : 60;
      set(arco, { 'stroke-dasharray': `${r2(largo)} ${r2(largo)}`, 'stroke-dashoffset': r2(largo) });
      const numero = make('text', { x: (a + b) / 2, y: Y_PUNTO - ALTO_ARCO * 0.75 - 9, class: 'salto__cuenta', 'text-anchor': 'middle' }, capa);
      numero.textContent = k + 1;
      arcos.push({ a, b, yC, arco, largo, numero });
    }
    const punto = make('circle', { r: R_PUNTO, cx: xGap(c.desde), cy: Y_PUNTO, class: 'salto__punto' }, capa);
    const resultado = make('text', { x: 200, y: 152, class: 'salto__resultado', 'text-anchor': 'middle' }, capa);
    potencia(resultado, 30, c.coef + ' × 10', expTxt(c.exp), ' ' + c.unidad, 'salto__exponente');
    partes = { cifras, comas, unidad, rotulo, arcos, punto, resultado, entero, xGap };
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
  }

  // Un punto de la curva del salto (Bézier cúbica), en s ∈ [0, 1].
  function enArco(arco, s) {
    const u = 1 - s;
    const x = u * u * u * arco.a + 3 * u * u * s * arco.a + 3 * u * s * s * arco.b + s * s * s * arco.b;
    const y = u * u * u * Y_PUNTO + 3 * u * u * s * arco.yC + 3 * u * s * s * arco.yC + s * s * s * Y_PUNTO;
    return [x, y];
  }

  function draw(tiempo) {
    const L = linea, p = partes;
    const ent = suave((tiempo - L.aparece[0]) / (L.aparece[1] - L.aparece[0]));
    const apaga = suave((tiempo - L.apaga[0]) / (L.apaga[1] - L.apaga[0]));
    p.rotulo.setAttribute('opacity', r2(ent));
    p.unidad.setAttribute('opacity', r2(ent));
    p.cifras.forEach(({ nodo, cuenta }) => nodo.setAttribute('opacity', r2(ent * (cuenta ? 1 : 1 - 0.72 * apaga))));
    const sinComas = suave((tiempo - L.comas[0]) / (L.comas[1] - L.comas[0]));
    p.comas.forEach(coma => coma.setAttribute('opacity', r2(ent * (1 - sinComas))));
    // El punto: en un entero aparece al final (ahí estaba, aunque no se escriba).
    let opPunto = p.entero ? suave((tiempo - L.punto[0]) / (L.punto[1] - L.punto[0])) : ent;
    let [cx, cy] = [p.xGap(c.desde), Y_PUNTO];
    p.arcos.forEach((arco, k) => {
      const t0 = L.inicioSaltos + k * L.porSalto;
      const s = suave((tiempo - t0) / L.mueve);
      arco.arco.setAttribute('stroke-dashoffset', r2(arco.largo * (1 - s)));
      arco.numero.setAttribute('opacity', r2(suave((tiempo - t0 - L.mueve * 0.6) / 0.3)));
      if (s > 0) [cx, cy] = enArco(arco, s);
    });
    // Si el coeficiente no lleva decimales (3 × 10⁸), el punto también se apaga al final.
    if (!c.coef.includes('.')) opPunto *= 1 - 0.72 * apaga;
    set(p.punto, { cx, cy, opacity: r2(opPunto) });
    p.resultado.setAttribute('opacity', r2(suave((tiempo - L.resultado[0]) / (L.resultado[1] - L.resultado[0]))));
  }

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'luz', true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(t); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* ---------------- Cada paso es ×10 ----------------
   Una escala de potencias de 10, de 10⁻¹⁰ m a 10⁸ m: entre dos marcas vecinas hay un
   paso de ×10. Cada objeto va en el lugar de su tamaño real (log₁₀ del tamaño en metros):
   un átomo, unos 10⁻¹⁰ m; un virus, unos 10⁻⁷ m; una célula, unos 10⁻⁵ m; una persona,
   1.7 m; la Tierra, 1.27 × 10⁷ m de diámetro. El punto sale de 1 m (10⁰) y camina paso
   por paso hasta el objeto: los pasos que da son el exponente, y hacia la izquierda, ÷10,
   el exponente es negativo. */
const OBJETOS = {
  atomo: { nombre: 'átomo', exp: -10, coef: 1, dibujo: 'atomo' },
  virus: { nombre: 'virus', exp: -7, coef: 1, dibujo: 'virus' },
  celula: { nombre: 'célula', exp: -5, coef: 1, dibujo: 'celula' },
  persona: { nombre: 'persona', exp: 0, coef: 1.7, dibujo: 'persona' },
  tierra: { nombre: 'Tierra', exp: 7, coef: 1.27, dibujo: 'tierra' }
};
const DESTINOS = ['tierra', 'celula', 'virus', 'atomo'];

const E_MIN = -10, E_MAX = 8, X_INI = 24, DECADA = 19, EJE_Y = 132, ICONO_Y = 82, NOMBRE_Y = 60;
const xEsc = e => X_INI + (e - E_MIN) * DECADA;
const lugarReal = o => o.exp + Math.log10(o.coef);
const MEDIOS = { atomo: 8, virus: 9.6, celula: 9.6, persona: 4.2, tierra: 10 };

{
  // Cada objeto en su lugar, sin encimarse con su vecino (ni sus dibujos ni sus nombres).
  const orden = Object.keys(OBJETOS).sort((a, b) => lugarReal(OBJETOS[a]) - lugarReal(OBJETOS[b]));
  orden.forEach((k, i) => {
    const x = xEsc(lugarReal(OBJETOS[k]));
    if (x - MEDIOS[k] < 0 || x + MEDIOS[k] > 400) throw new Error(`escala: ${k} se sale`);
    if (i > 0) {
      const ant = orden[i - 1], xa = xEsc(lugarReal(OBJETOS[ant]));
      if (xa + MEDIOS[ant] + 4 > x - MEDIOS[k]) throw new Error(`escala: ${ant} y ${k} se enciman`);
      const anchoNombre = n => n.length * 5.9;
      if (xa + anchoNombre(OBJETOS[ant].nombre) / 2 + 4 > x - anchoNombre(OBJETOS[k].nombre) / 2) throw new Error(`escala: los nombres de ${ant} y ${k} se enciman`);
    }
  });
  if (xEsc(E_MAX) + 14 > 400) throw new Error('escala: el eje se sale');
  // Tamaños: la Tierra mide 12,742 km = 1.2742 × 10⁷ m; una persona, 1.7 m.
  if (Math.abs(OBJETOS.tierra.coef * 1e7 - 12742e3) / 12742e3 > 0.01) throw new Error('escala: el diámetro de la Tierra');
}

function escala(svg) {
  const root = svg.closest('[data-escala]');
  const botones = root ? [...root.querySelectorAll('[data-objeto]')] : [];
  const panel = root ? root.querySelector('[data-escala-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-objeto]').forEach(n => { textos[n.dataset.textoObjeto] = n.innerHTML; });

  // El eje: una marca por potencia de 10; las pares llevan su potencia escrita.
  const fondo = make('g', {}, svg);
  make('path', { d: `M${xEsc(E_MIN) - 6} ${EJE_Y}H${xEsc(E_MAX) + 7}`, class: 'escala__eje' }, fondo);
  make('path', { d: `M${xEsc(E_MAX) + 14} ${EJE_Y}l-7 -4v8z`, class: 'escala__punta' }, fondo);
  for (let e = E_MIN; e <= E_MAX; e++) {
    const largo = e === 0 ? 6 : 3.5;
    make('path', { d: `M${xEsc(e)} ${EJE_Y - largo}V${EJE_Y + largo}`, class: 'escala__marca' + (e === 0 ? ' escala__marca--uno' : '') }, fondo);
    if (e % 2 === 0) {
      const t = make('text', { x: xEsc(e), y: EJE_Y + 17, class: 'escala__potencia', 'text-anchor': 'middle' }, fondo);
      potencia(t, 10.5, '10', expTxt(e), '', '', 0.7);
    }
  }
  const unMetro = make('text', { x: xEsc(0), y: EJE_Y + 29, class: 'escala__metro', 'text-anchor': 'middle' }, fondo);
  unMetro.textContent = '= 1 m';
  const titulo = make('text', { x: xEsc(E_MAX) + 14, y: EJE_Y + 29, class: 'escala__titulo', 'text-anchor': 'end' }, fondo);
  titulo.textContent = 'tamaño (m)';

  // Los objetos, cada uno sobre su lugar en el eje.
  const grupos = {};
  for (const [k, o] of Object.entries(OBJETOS)) {
    const x = xEsc(lugarReal(o));
    const g = make('g', { class: 'escala__objeto' }, svg);
    const nombre = make('text', { x, y: NOMBRE_Y, class: 'escala__nombre', 'text-anchor': 'middle' }, g);
    nombre.textContent = o.nombre;
    DIBUJOS[o.dibujo](g, x, ICONO_Y);
    make('circle', { cx: x, cy: EJE_Y, r: 1.8, class: 'escala__lugar' }, g);
    grupos[k] = g;
  }

  const capaPasos = make('g', {}, svg);
  const marcador = make('circle', { cx: xEsc(0), cy: EJE_Y, r: 4.2, class: 'escala__marcador' }, svg);
  const lectura = make('text', { x: X_INI, y: 31, class: 'escala__lectura' }, svg);
  const cuenta = make('text', { x: xEsc(E_MAX) + 14, y: 31, class: 'escala__cuenta', 'text-anchor': 'end' }, svg);

  let clave = null, o = null, t = 0, linea = null, pasos = [], ultimaLectura = '';

  function lineaDeTiempo(obj) {
    const n = Math.abs(obj.exp), inicio = 1.7, porPaso = 0.95, mueve = 0.65;
    const finPasos = inicio + n * porPaso;
    return { aparece: [0.4, 0.9], inicio, porPaso, mueve, desliza: [finPasos + 0.1, finPasos + 0.5], llega: [finPasos + 0.6, finPasos + 1.1], fin: finPasos + 1.3 };
  }

  function armar(nueva) {
    clave = nueva;
    o = OBJETOS[clave];
    linea = lineaDeTiempo(o);
    capaPasos.innerHTML = '';
    const dir = Math.sign(o.exp);
    pasos = [];
    for (let k = 0; k < Math.abs(o.exp); k++) {
      const a = xEsc(dir * k), b = xEsc(dir * (k + 1)), m = (a + b) / 2;
      const arco = make('path', { d: `M${a} ${EJE_Y - 3}Q${m} ${EJE_Y - 19} ${b} ${EJE_Y - 3}`, class: 'escala__salto' }, capaPasos);
      const largo = arco.getTotalLength ? arco.getTotalLength() : DECADA;
      set(arco, { 'stroke-dasharray': `${r2(largo)} ${r2(largo)}`, 'stroke-dashoffset': r2(largo) });
      const veces = make('text', { x: m, y: EJE_Y - 21, class: 'escala__veces', 'text-anchor': 'middle' }, capaPasos);
      veces.textContent = dir > 0 ? '×10' : '÷10';
      pasos.push({ a, b, arco, largo, veces });
    }
    Object.entries(grupos).forEach(([k, g]) => g.classList.toggle('es-destino', false));
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
    ultimaLectura = '';
  }

  function ponLectura(texto, exp, resto, pasosDados) {
    const firma = texto + exp + resto + pasosDados;
    if (firma === ultimaLectura) return;
    ultimaLectura = firma;
    lectura.textContent = '';
    potencia(lectura, 21, texto, exp, resto, 'escala__lectura-exp');
    const dir = o.exp > 0 ? '×10' : '÷10';
    cuenta.textContent = pasosDados === 0 ? 'desde 1 m' : pasosDados + (pasosDados === 1 ? ' paso de ' : ' pasos de ') + dir;
  }

  function draw(tiempo) {
    const L = linea, dir = Math.sign(o.exp);
    const ent = suave((tiempo - L.aparece[0]) / (L.aparece[1] - L.aparece[0]));
    let x = xEsc(0), dados = 0;
    pasos.forEach((p, k) => {
      const t0 = L.inicio + k * L.porPaso;
      const s = suave((tiempo - t0) / L.mueve);
      p.arco.setAttribute('stroke-dashoffset', r2(p.largo * (1 - s)));
      // El «×10» aparece cuando el paso termina, junto con la lectura de arriba.
      p.veces.setAttribute('opacity', r2(suave((tiempo - t0 - L.mueve) / 0.25)));
      if (s > 0) x = p.a + (p.b - p.a) * s;
      if (s >= 1) dados = k + 1;
    });
    // Al final, el punto se desliza al lugar exacto del objeto (1.27 × 10⁷ está un poco después de 10⁷).
    const desliza = suave((tiempo - L.desliza[0]) / (L.desliza[1] - L.desliza[0]));
    if (dados === pasos.length) x = xEsc(o.exp) + (xEsc(lugarReal(o)) - xEsc(o.exp)) * desliza;
    set(marcador, { cx: x, opacity: r2(ent) });
    const llega = suave((tiempo - L.llega[0]) / (L.llega[1] - L.llega[0]));
    grupos[clave].classList.toggle('es-destino', llega > 0.5);
    lectura.setAttribute('opacity', r2(ent));
    cuenta.setAttribute('opacity', r2(ent));
    if (llega > 0.5) ponLectura(o.coef === 1 ? '10' : o.coef + ' × 10', expTxt(o.exp), ' m', pasos.length);
    else if (dados === 0) ponLectura('10', '0', ' m = 1 m', 0);
    else ponLectura('10', expTxt(dir * dados), ' m', dados);
  }

  function elige(nueva, animar) {
    if (!OBJETOS[nueva]) return;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.objeto === nueva)));
    armar(nueva);
    t = animar && !reducedMotion.matches ? 0 : linea.fin;
    draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.objeto, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.objeto : DESTINOS[0], true);
  return {
    update(dt) { if (t < linea.fin) { t += dt; draw(t); } },
    still() { t = linea.fin; draw(t); }
  };
}

/* Los dibujos de la escala: todos del mismo alto (unos 20 px), porque la escala es de
   potencias; lo que dice el tamaño es su lugar en el eje, no el dibujo. */
const DIBUJOS = {
  // Un átomo no tiene borde: es una nube de electrones alrededor de un núcleo diminuto.
  atomo(g, x, y) {
    [[8, 0.14], [5.6, 0.22], [3.2, 0.34]].forEach(([r, op]) => make('circle', { cx: x, cy: y, r, class: 'escala__nube', 'fill-opacity': op }, g));
    make('circle', { cx: x, cy: y, r: 1.1, class: 'escala__nucleo' }, g);
  },
  // Un virus: una esfera con espigas, como el de la gripe.
  virus(g, x, y) {
    for (let k = 0; k < 10; k++) {
      const a = (k * 36 + 18) * Math.PI / 180;
      make('path', { d: `M${x + 5.6 * Math.cos(a)} ${y + 5.6 * Math.sin(a)}L${x + 8.3 * Math.cos(a)} ${y + 8.3 * Math.sin(a)}`, class: 'escala__espiga' }, g);
      make('circle', { cx: x + 8.4 * Math.cos(a), cy: y + 8.4 * Math.sin(a), r: 1.2, class: 'escala__perilla' }, g);
    }
    make('circle', { cx: x, cy: y, r: 5.6, class: 'escala__contorno' }, g);
  },
  // Una célula: contorno irregular y su núcleo.
  celula(g, x, y) {
    const puntos = [];
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6;
      const r = 8.4 + 0.8 * Math.sin(3 * a + 0.6) + 0.4 * Math.cos(5 * a);
      puntos.push([x + r * Math.cos(a), y + r * 0.86 * Math.sin(a)]);
    }
    let d = `M${r2(puntos[0][0])} ${r2(puntos[0][1])}`;
    for (let k = 0; k < 12; k++) {
      const p0 = puntos[(k + 11) % 12], p1 = puntos[k], p2 = puntos[(k + 1) % 12], p3 = puntos[(k + 2) % 12];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
    }
    make('path', { d: d + 'Z', class: 'escala__contorno' }, g);
    make('circle', { cx: x + 1.6, cy: y - 0.6, r: 2.7, class: 'escala__nucleo-celula' }, g);
  },
  // Una persona de pie: cabeza, tronco, brazos y piernas.
  persona(g, x, y) {
    const arriba = y - 11;
    make('circle', { cx: x, cy: arriba + 2.5, r: 2.5, class: 'escala__cuerpo-relleno' }, g);
    make('path', { d: `M${x} ${arriba + 7}V${arriba + 13.6}`, class: 'escala__cuerpo escala__cuerpo--tronco' }, g);
    make('path', { d: `M${x - 1.8} ${arriba + 7.4}L${x - 3.2} ${arriba + 13.8}M${x + 1.8} ${arriba + 7.4}L${x + 3.2} ${arriba + 13.8}`, class: 'escala__cuerpo escala__cuerpo--brazos' }, g);
    make('path', { d: `M${x - 0.9} ${arriba + 14.5}L${x - 1.7} ${arriba + 22}M${x + 0.9} ${arriba + 14.5}L${x + 1.7} ${arriba + 22}`, class: 'escala__cuerpo escala__cuerpo--piernas' }, g);
  },
  // La Tierra: un globo con su ecuador, dos paralelos y un meridiano.
  tierra(g, x, y) {
    make('circle', { cx: x, cy: y, r: 10, class: 'escala__contorno' }, g);
    make('ellipse', { cx: x, cy: y, rx: 4.2, ry: 10, class: 'escala__globo' }, g);
    const medio = Math.sqrt(100 - 25);
    make('path', { d: `M${x - 10} ${y}H${x + 10}M${x - medio} ${y - 5}H${x + medio}M${x - medio} ${y + 5}H${x + medio}`, class: 'escala__globo' }, g);
  }
};

/* ---------------- Reloj compartido ---------------- */
const factories = { salto, escala };
const scenes = [...document.querySelectorAll('[data-escena-nc]')].map(svg => ({
  svg, visible: false, ...factories[svg.dataset.escenaNc](svg)
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
