/* Escenas de «Vectores y razonamiento proporcional» (Física, semana 8). Mismo contrato que
   escenas-fisica.js: cada escena es { update(dt), still() }; el reloj compartido sólo avanza
   las escenas visibles y, con movimiento reducido, cada una dibuja su cuadro final. Al llegar
   a la tele (tercial:diapositiva) y con «Repetir», la escena empieza de nuevo.

   - suma: cuatro maneras de juntar flechas: en línea, cabeza-cola, el paralelogramo y las
     componentes. Sin senos ni cosenos: todo cae en una cuadrícula y se cuenta.
   - luz: la misma luz que a la distancia d cabe en 1 cuadro, a 2d se reparte en 4 y a 3d
     en 9 (proporción inversa al cuadrado), dibujada en perspectiva paralela.

   Cada número que se dibuja sale de la geometría y se comprueba al cargar: si algo no
   cuadra (una resultante, una escala, un cuadro que se encima), la escena no arranca. */

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
const r2 = v => Math.round(v * 100) / 100;
const MENOS = '−';
const uno = n => (n < -0.05 ? MENOS : '') + Math.abs(n).toFixed(1);           // 5.0 · −3.0
const conSigno = n => (n > 0.05 ? '+' : '') + uno(n);                         // +3.0 · 0.0
const redondo = n => (Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : n.toFixed(1));  // 12 · 9.2
const tramo = (t, t0, dur) => clamp((t - t0) / dur);

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
  if (parent) parent.appendChild(node);
  return node;
}

function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? r2(v) : v);
}

function texto(parent, clase, x, y, contenido, anchor = 'middle') {
  const t = make('text', { x, y, class: clase, 'text-anchor': anchor }, parent);
  t.textContent = contenido;
  return t;
}

// Una flecha: cuerpo y punta (10 de largo, 9 de ancho). Se repinta en cada cuadro.
function flecha(parent, clase) {
  const g = make('g', { class: 'vec__flecha ' + (clase || '') }, parent);
  return { g, cuerpo: make('path', { class: 'vec__cuerpo' }, g), punta: make('path', { class: 'vec__punta' }, g) };
}

function pintaFlecha(f, x1, y1, x2, y2, visible = 1) {
  const dx = x2 - x1, dy = y2 - y1, largo = Math.hypot(dx, dy);
  f.g.setAttribute('opacity', r2(clamp(visible)));
  if (largo < 0.5 || visible <= 0) { set(f.cuerpo, { d: 'M0 0' }); set(f.punta, { d: 'M0 0' }); return; }
  const ux = dx / largo, uy = dy / largo, cabeza = Math.min(10, largo);
  const bx = x2 - ux * cabeza, by = y2 - uy * cabeza;
  set(f.cuerpo, { d: `M${r2(x1)} ${r2(y1)}L${r2(bx)} ${r2(by)}` });
  set(f.punta, { d: `M${r2(x2)} ${r2(y2)}L${r2(bx - uy * 4.5)} ${r2(by + ux * 4.5)}L${r2(bx + uy * 4.5)} ${r2(by - ux * 4.5)}Z` });
}

// Una cuadrícula de cuadros de L unidades, de (u0, v0) a (u1, v1), con el origen en (ox, oy).
function cuadricula(parent, ox, oy, L, u0, u1, v0, v1) {
  let d = '';
  for (let u = u0; u <= u1; u++) d += `M${r2(ox + u * L)} ${r2(oy - v0 * L)}V${r2(oy - v1 * L)}`;
  for (let v = v0; v <= v1; v++) d += `M${r2(ox + u0 * L)} ${r2(oy - v * L)}H${r2(ox + u1 * L)}`;
  return make('path', { d, class: 'vec__cuadro' }, parent);
}

// Etiqueta a un lado de un segmento: a «distancia» de su punto medio, del lado de la normal
// que sube en pantalla (lado = 1) o de la que baja (lado = −1).
function alLado(x1, y1, x2, y2, distancia, lado = 1) {
  const dx = x2 - x1, dy = y2 - y1, largo = Math.hypot(dx, dy) || 1;
  let nx = -dy / largo, ny = dx / largo;
  if ((ny > 0 ? 1 : -1) === lado) { nx = -nx; ny = -ny; }
  return [(x1 + x2) / 2 + nx * distancia, (y1 + y2) / 2 + ny * distancia + 4.5];
}

/* ---------------- Sumar flechas ----------------
   Cuatro casos, cada uno con su escala (cada cuadro es 1 m o 10 N) y sus lecturas en vivo.
   «recorrido» es lo que se camina; «desplazamiento», la distancia en línea recta del
   inicio al final. El caminante va a paso de persona (unos 1.5 m/s) y frena en las vueltas. */
const LINEA = { L: 46, X0: 70, EJE: 196, FILAS: [162, 130], FILA_R: 98, TRAMOS: [5, -2] };
const CABEZA = { L: 38, OX: 62, OY: 214, TRAMOS: [[3, 0], [0, 4]] };
const PARALELO = { L: 24, OX: 112, OY: 124, F1: [4, 3], F2: [4, -3], NEWTONS: 10 };
const COMPONENTES = { L: 14.4, OX: 44, OY: 222, LARGO: 13, INICIO: [12, 5], FINAL: [5, 12] };

{
  const fin = LINEA.TRAMOS.reduce((a, b) => a + b, 0);
  if (fin !== 3) throw new Error('suma: en línea debe quedar a +3 m');
  const [a, b] = CABEZA.TRAMOS, R = [a[0] + b[0], a[1] + b[1]];
  if (Math.hypot(R[0], R[1]) !== 5 || a[1] !== 0 || b[0] !== 0) throw new Error('suma: cabeza-cola debe ser 3-4-5 y perpendicular');
  const [f1, f2] = [PARALELO.F1, PARALELO.F2], RP = [f1[0] + f2[0], f1[1] + f2[1]];
  if (Math.hypot(...f1) !== 5 || Math.hypot(...f2) !== 5 || RP[0] !== 8 || RP[1] !== 0) throw new Error('suma: el paralelogramo debe dar 80 N');
  if (Math.hypot(...COMPONENTES.INICIO) !== 13 || Math.hypot(...COMPONENTES.FINAL) !== 13) throw new Error('suma: las componentes deben ser 5-12-13');
}

function casoLinea(capa, lect) {
  const { L, X0, EJE, FILAS, FILA_R } = LINEA;
  const X = m => X0 + m * L;
  const tramos = [{ desde: 0, hasta: 5, t0: 0.6, dur: 3.4 }, { desde: 5, hasta: 3, t0: 4.6, dur: 1.6 }];
  const tR = 6.8, fin = 8.4;
  make('path', { d: `M${X(-1)} ${EJE}H${X(6.6)}`, class: 'vec__eje' }, capa);
  make('path', { d: `M${X(6.6) + 7} ${EJE}l-8 -4.5v9z`, class: 'vec__eje-punta' }, capa);
  make('path', { d: `M${X(-1) - 7} ${EJE}l8 -4.5v9z`, class: 'vec__eje-punta' }, capa);
  for (let m = 0; m <= 6; m++) {
    make('path', { d: `M${X(m)} ${EJE - 5}V${EJE + 5}`, class: 'vec__marca' }, capa);
    texto(capa, 'vec__numero', X(m), EJE + 19, String(m));
  }
  texto(capa, 'vec__rumbo', X(-1), EJE - 9, 'oeste', 'start');
  texto(capa, 'vec__rumbo', X(6.6), EJE - 9, 'este', 'end');
  texto(capa, 'vec__rumbo', X(6.6), EJE + 19, 'm', 'end');
  const guia = make('path', { d: `M${X(5)} ${FILAS[0]}V${FILAS[1]}`, class: 'vec__guia', opacity: 0 }, capa);
  const f1 = flecha(capa), f2 = flecha(capa), fr = flecha(capa, 'vec__flecha--resultante');
  const e1 = texto(capa, 'vec__etiqueta', X(2.5), FILAS[0] - 10, '5 m');
  const e2 = texto(capa, 'vec__etiqueta', X(4), FILAS[1] - 10, '2 m');
  const er = texto(capa, 'vec__etiqueta vec__etiqueta--resultante', X(1.5), FILA_R - 10, '3 m');
  const caminante = make('circle', { r: 6.5, cy: EJE, class: 'vec__caminante' }, capa);
  lect.pon([{ nombre: 'recorrido', x: 40, y: 30 }, { nombre: 'desplazamiento', x: 216, y: 30, acento: true }]);
  return {
    fin,
    draw(t) {
      const p = tramos.map(tr => suave(tramo(t, tr.t0, tr.dur)));
      const x = p[1] > 0 ? 5 - 2 * p[1] : 5 * p[0];
      pintaFlecha(f1, X(0), FILAS[0], X(5 * p[0]), FILAS[0], p[0] > 0 ? 1 : 0);
      pintaFlecha(f2, X(5), FILAS[1], X(5 - 2 * p[1]), FILAS[1], p[1] > 0 ? 1 : 0);
      guia.setAttribute('opacity', p[1] > 0 ? 1 : 0);
      const pr = suave(tramo(t, tR, 1.0));
      pintaFlecha(fr, X(0), FILA_R, X(3 * pr), FILA_R, pr > 0 ? 1 : 0);
      e1.setAttribute('opacity', r2(clamp(p[0] * 3 - 2)));
      e2.setAttribute('opacity', r2(clamp(p[1] * 3 - 2)));
      er.setAttribute('opacity', r2(clamp(pr * 3 - 2)));
      set(caminante, { cx: X(x) });
      lect.valores([uno(5 * p[0] + 2 * p[1]) + ' m', conSigno(x) + ' m']);
    }
  };
}

function casoCabeza(capa, lect) {
  const { L, OX, OY } = CABEZA;
  const P = (u, v) => [OX + u * L, OY - v * L];
  const t1 = 0.6, d1 = 2.2, t2 = 3.4, d2 = 2.8, tR = 6.8, tG = 8.8, dG = 2.2, fin = 11.6;
  cuadricula(capa, OX, OY, L, 0, 4, 0, 5);
  texto(capa, 'vec__rumbo', OX, OY - 5 * L - 8, 'norte');
  texto(capa, 'vec__rumbo', OX + 4 * L + 6, OY + 4, 'este', 'start');
  texto(capa, 'vec__numero', 392, 244, 'cada cuadro: 1 m', 'end');
  const arco = make('path', { class: 'vec__arco' }, capa);
  const fantasma = flecha(capa, 'vec__flecha--copia');
  const cuentas = make('g', { opacity: 0 }, capa);
  for (let i = 1; i <= 5; i++) texto(cuentas, 'vec__numero' + (i === 5 ? ' vec__numero--acento' : ''), OX - 8, OY - i * L + 4, String(i), 'end');
  // El caminante va debajo de las flechas: al final, sus puntas quedan a la vista sobre él.
  const caminante = make('circle', { r: 6, class: 'vec__caminante' }, capa);
  const f1 = flecha(capa), f2 = flecha(capa), fr = flecha(capa, 'vec__flecha--resultante');
  const e1 = texto(capa, 'vec__etiqueta', ...P(1.5, 0).map((c, i) => c + (i ? 17 : 0)), '3 m');
  const e2 = texto(capa, 'vec__etiqueta', P(3, 2)[0] + 10, P(3, 2)[1] + 4.5, '4 m', 'start');
  // Del lado de adentro del triángulo: el compás barre el de afuera.
  const [lx, ly] = alLado(...P(0, 0), ...P(3, 4), 15, -1);
  const er = texto(capa, 'vec__etiqueta vec__etiqueta--resultante', lx, ly, '5 m');
  lect.pon([{ nombre: 'recorrido', x: 250, y: 78 }, { nombre: 'desplazamiento', x: 250, y: 146, acento: true }]);
  const anguloR = Math.atan2(4, 3);
  return {
    fin,
    draw(t) {
      const p1 = suave(tramo(t, t1, d1)), p2 = suave(tramo(t, t2, d2));
      const u = 3 * p1, v = 4 * p2;
      pintaFlecha(f1, ...P(0, 0), ...P(u, 0), p1 > 0 ? 1 : 0);
      pintaFlecha(f2, ...P(3, 0), ...P(3, v), p2 > 0 ? 1 : 0);
      const pr = suave(tramo(t, tR, 1.2));
      pintaFlecha(fr, ...P(0, 0), ...P(3 * pr, 4 * pr), pr > 0 ? 1 : 0);
      // El compás: una copia de la resultante gira alrededor del inicio hasta el eje norte.
      const pg = suave(tramo(t, tG, dG));
      const ang = anguloR + (Math.PI / 2 - anguloR) * pg;
      const punta = P(5 * Math.cos(ang), 5 * Math.sin(ang));
      pintaFlecha(fantasma, ...P(0, 0), ...punta, pg > 0 ? 1 : 0);
      const desde = P(3, 4);
      set(arco, pg > 0.002 ? { d: `M${r2(desde[0])} ${r2(desde[1])}A${5 * L} ${5 * L} 0 0 0 ${r2(punta[0])} ${r2(punta[1])}`, opacity: 1 } : { d: 'M0 0', opacity: 0 });
      cuentas.setAttribute('opacity', r2(clamp((pg - 0.85) / 0.15)));
      e1.setAttribute('opacity', r2(clamp(p1 * 3 - 2)));
      e2.setAttribute('opacity', r2(clamp(p2 * 3 - 2)));
      er.setAttribute('opacity', r2(clamp(pr * 3 - 2)));
      const [cx, cy] = P(u, v);
      set(caminante, { cx, cy });
      lect.valores([uno(u + v) + ' m', uno(Math.hypot(u, v)) + ' m']);
    }
  };
}

function casoParalelogramo(capa, lect) {
  const { L, OX, OY, F1, F2, NEWTONS } = PARALELO;
  const P = (u, v) => [OX + u * L, OY - v * L];
  const fin = 7.8;
  cuadricula(capa, OX, OY, L, 0, 8, -3, 3);
  texto(capa, 'vec__numero', 392, 244, 'cada cuadro: 10 N', 'end');
  // La caja, vista desde arriba: cartón con su cinta, y la argolla donde se amarran las cuerdas.
  make('rect', { x: OX - 48, y: OY - 22, width: 44, height: 44, rx: 1.5, class: 'vec__caja' }, capa);
  make('rect', { x: OX - 48, y: OY - 4, width: 44, height: 8, class: 'vec__cinta' }, capa);
  make('path', { d: `M${OX - 4} ${OY}H${OX - 3}`, class: 'vec__argolla' }, capa);
  make('circle', { cx: OX, cy: OY, r: 3, class: 'vec__argolla' }, capa);
  const c2 = flecha(capa, 'vec__flecha--copia'), c1 = flecha(capa, 'vec__flecha--copia');
  const f1 = flecha(capa), f2 = flecha(capa), fr = flecha(capa, 'vec__flecha--resultante');
  const n1 = Math.hypot(...F1) * NEWTONS, n2 = Math.hypot(...F2) * NEWTONS, nR = (F1[0] + F2[0]) * NEWTONS;
  const e1 = texto(capa, 'vec__etiqueta', ...alLado(...P(0, 0), ...P(...F1), 15, 1), n1 + ' N');
  const e2 = texto(capa, 'vec__etiqueta', ...alLado(...P(0, 0), ...P(...F2), 15, -1), n2 + ' N');
  const er = texto(capa, 'vec__etiqueta vec__etiqueta--resultante', P(5.2, 0)[0], P(5.2, 0)[1] - 11, nR + ' N');
  lect.pon([{ nombre: 'resultante', x: 20, y: 30, acento: true }]);
  const nota = texto(capa, 'vec__rumbo', 20, 80, 'no ' + (n1 + n2) + ' N', 'start');
  return {
    fin,
    draw(t) {
      const a = suave(tramo(t, 0.6, 1.2)), b = suave(tramo(t, 1.8, 1.2));
      pintaFlecha(f1, ...P(0, 0), ...P(F1[0] * a, F1[1] * a), a > 0 ? 1 : 0);
      pintaFlecha(f2, ...P(0, 0), ...P(F2[0] * b, F2[1] * b), b > 0 ? 1 : 0);
      // Las copias se deslizan: la cola de cada una va a la punta de la otra (cabeza-cola).
      const s = suave(tramo(t, 3.6, 1.8)), vis = tramo(t, 3.6, 0.3);
      pintaFlecha(c2, ...P(F1[0] * s, F1[1] * s), ...P(F1[0] * s + F2[0], F1[1] * s + F2[1]), vis);
      pintaFlecha(c1, ...P(F2[0] * s, F2[1] * s), ...P(F2[0] * s + F1[0], F2[1] * s + F1[1]), vis);
      const pr = suave(tramo(t, 5.8, 1.2));
      pintaFlecha(fr, ...P(0, 0), ...P(8 * pr, 0), pr > 0 ? 1 : 0);
      e1.setAttribute('opacity', r2(clamp(a * 3 - 2)));
      e2.setAttribute('opacity', r2(clamp(b * 3 - 2)));
      er.setAttribute('opacity', r2(clamp(pr * 3 - 2)));
      nota.setAttribute('opacity', r2(clamp(pr * 3 - 2)));
      lect.valores([pr > 0 ? redondo(nR * pr) + ' N' : '']);
    }
  };
}

function casoComponentes(capa, lect) {
  const { L, OX, OY, LARGO, INICIO, FINAL } = COMPONENTES;
  const P = (u, v) => [OX + u * L, OY - v * L];
  const a0 = Math.atan2(INICIO[1], INICIO[0]), a1 = Math.atan2(FINAL[1], FINAL[0]), a45 = Math.PI / 4;
  const fin = 11.2;
  cuadricula(capa, OX, OY, L, 0, 13, 0, 13);
  texto(capa, 'vec__numero', 392, 244, 'cada cuadro: 1 m', 'end');
  // 45°: la referencia para decidir qué componente es mayor. Va afuera del alcance de la flecha
  // (13 m), como la marca de un transportador: la flecha la señala al pasar, sin taparla.
  const m45 = r => P(r * Math.SQRT1_2, r * Math.SQRT1_2);
  make('path', { d: `M${r2(m45(13.9)[0])} ${r2(m45(13.9)[1])}L${r2(m45(16.2)[0])} ${r2(m45(16.2)[1])}`, class: 'vec__ref' }, capa);
  texto(capa, 'vec__rumbo', m45(16.2)[0] + 4, m45(16.2)[1] + 2, '45°', 'start');
  const fh = flecha(capa), fv = flecha(capa), fr = flecha(capa, 'vec__flecha--resultante');
  const eh = texto(capa, 'vec__etiqueta', 0, 0, '');
  const ev = texto(capa, 'vec__etiqueta', 0, 0, '', 'start');
  const er = texto(capa, 'vec__etiqueta vec__etiqueta--resultante', 0, 0, '13 m');
  lect.pon([{ nombre: 'horizontal', x: 262, y: 64 }, { nombre: 'vertical', x: 262, y: 128 }, { nombre: 'la mayor', x: 262, y: 192, acento: true, chica: true }]);
  return {
    fin,
    draw(t) {
      const pv = suave(tramo(t, 0.6, 1.2));
      const giro1 = suave(tramo(t, 5.6, 2.0)), giro2 = suave(tramo(t, 8.6, 2.0));
      const ang = giro2 > 0 ? a45 + (a1 - a45) * giro2 : a0 + (a45 - a0) * giro1;
      const h = LARGO * Math.cos(ang), v = LARGO * Math.sin(ang);
      pintaFlecha(fr, ...P(0, 0), ...P(h * pv, v * pv), pv > 0 ? 1 : 0);
      const ph = suave(tramo(t, 2.2, 1.2)), pvv = suave(tramo(t, 3.4, 1.0));
      pintaFlecha(fh, ...P(0, 0), ...P(h * ph, 0), ph > 0 ? 1 : 0);
      pintaFlecha(fv, ...P(h, 0), ...P(h, v * pvv), pvv > 0 ? 1 : 0);
      set(eh, { x: P(h / 2, 0)[0], y: OY + 17, opacity: r2(clamp(ph * 3 - 2)) });
      eh.textContent = redondo(h) + ' m';
      set(ev, { x: P(h, 0)[0] + 9, y: P(0, v / 2)[1] + 4.5, opacity: r2(clamp(pvv * 3 - 2)) });
      ev.textContent = redondo(v) + ' m';
      const [lx, ly] = alLado(...P(0, 0), ...P(h, v), 14, 1);
      set(er, { x: lx, y: ly, opacity: r2(clamp(pv * 3 - 2)) });
      const mayor = Math.abs(h - v) < 0.05 ? 'son iguales' : h > v ? 'la horizontal' : 'la vertical';
      lect.valores([ph > 0 ? uno(h * ph) + ' m' : '', pvv > 0 ? uno(v * pvv) + ' m' : '', pvv >= 1 ? mayor : '']);
    }
  };
}

const CASOS = { linea: casoLinea, cabeza: casoCabeza, paralelogramo: casoParalelogramo, componentes: casoComponentes };

// Lecturas en vivo: un nombre chico y su valor grande, en el lugar que diga cada caso.
function lecturas(capa) {
  let filas = [];
  return {
    pon(lista) {
      filas = lista.map(l => {
        texto(capa, 'vec__lectura-nombre', l.x, l.y, l.nombre, 'start');
        return texto(capa, 'vec__lectura' + (l.acento ? ' vec__lectura--acento' : '') + (l.chica ? ' vec__lectura--chica' : ''), l.x, l.y + (l.chica ? 22 : 26), '', 'start');
      });
    },
    valores(lista) { lista.forEach((v, i) => { if (filas[i]) filas[i].textContent = v; }); }
  };
}

function suma(svg) {
  const root = svg.closest('[data-suma]');
  const botones = root ? [...root.querySelectorAll('[data-caso]')] : [];
  const panel = root ? root.querySelector('[data-suma-texto]') : null;
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const textos = {};
  if (root) root.querySelectorAll('[data-texto-caso]').forEach(n => { textos[n.dataset.textoCaso] = n.innerHTML; });
  const capa = make('g', {}, svg);
  let clave = null, caso = null, t = 0;

  function elige(nueva, animar) {
    if (!CASOS[nueva]) return;
    clave = nueva;
    botones.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.caso === nueva)));
    capa.innerHTML = '';
    caso = CASOS[nueva](capa, lecturas(capa));
    if (panel) panel.innerHTML = textos[clave] ? '<p>' + textos[clave] + '</p>' : '';
    t = animar && !reducedMotion.matches ? 0 : caso.fin;
    caso.draw(t);
  }

  botones.forEach(b => b.addEventListener('click', () => elige(b.dataset.caso, true)));
  if (repetir) repetir.addEventListener('click', () => elige(clave, true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => elige(clave, true));
  const inicial = botones.find(b => b.getAttribute('aria-pressed') === 'true');
  elige(inicial ? inicial.dataset.caso : 'linea', true);
  return {
    update(dt) { if (t < caso.fin) { t += dt; caso.draw(t); } },
    still() { t = caso.fin; caso.draw(t); }
  };
}

/* ---------------- La luz se reparte ----------------
   Perspectiva paralela: x es la distancia al foco (a lo largo de la pantalla), z la altura y
   la profundidad y se dibuja en diagonal (0.7, −0.42). Con una proyección paralela las rectas
   siguen siendo rectas y las proporciones a lo largo de ellas se conservan: el marco a 2d es
   exactamente el doble que el de d, y los rayos que salen del filamento pasan por las cuatro
   esquinas de los tres marcos. 36 puntos de luz (6 × 6) salen del foco: a d caben en 1 cuadro;
   a 2d se reparten en 4 (9 en cada uno) y a 3d en 9 (4 en cada uno). */
const LUZ = { SX: 44, SY: 106, D: 98, A: 22, CX: 0.7, CY: -0.42, VIDRIO: 13, RAYO: 15, PUNTO: 2, LADO: 6, VEL: 1 / 1.8, K0: 0.16 };
const proyecta = (x, y, z) => [LUZ.SX + x + LUZ.CX * y, LUZ.SY - z + LUZ.CY * y];
const OFFSETS = [];
for (let i = 0; i < LUZ.LADO; i++) OFFSETS.push((2 * i - (LUZ.LADO - 1)) * LUZ.A / LUZ.LADO);   // ±5a/6, ±a/2, ±a/6

{
  // Cuántos puntos caen en cada cuadro a la distancia kd: 36 / k².
  for (const k of [1, 2, 3]) {
    const conteo = {};
    for (const y of OFFSETS) for (const z of OFFSETS) {
      const celda = Math.floor((k * y + k * LUZ.A) / (2 * LUZ.A)) + ',' + Math.floor((k * z + k * LUZ.A) / (2 * LUZ.A));
      conteo[celda] = (conteo[celda] || 0) + 1;
      // Ningún punto cae sobre una línea de la rejilla.
      for (const w of [k * y, k * z]) {
        const f = ((w + k * LUZ.A) / (2 * LUZ.A)) % 1;
        if (Math.min(f, 1 - f) < 0.05) throw new Error('luz: un punto cae sobre la rejilla');
      }
    }
    const valores = Object.values(conteo);
    if (valores.length !== k * k || valores.some(n => n !== 36 / (k * k))) throw new Error('luz: a ' + k + 'd no quedan ' + 36 / (k * k) + ' por cuadro');
  }
  // Los marcos no se enciman en pantalla y caben en la figura.
  const alcance = k => [LUZ.SX + k * LUZ.D - k * LUZ.A * LUZ.CX, LUZ.SX + k * LUZ.D + k * LUZ.A * LUZ.CX];
  if (alcance(1)[1] + 20 > alcance(2)[0] || alcance(2)[1] + 20 > alcance(3)[0] || alcance(3)[1] > 392) throw new Error('luz: los marcos se enciman o se salen');
  const alto = 3 * LUZ.A + 3 * LUZ.A * Math.abs(LUZ.CY);
  if (LUZ.SY - alto < 8 || LUZ.SY + alto > 204) throw new Error('luz: el marco de 3d se sale');
  // Los puntos de luz a la distancia d no se tocan (el paso más corto es el de la profundidad).
  const paso = (2 * LUZ.A / LUZ.LADO) * Math.hypot(LUZ.CX, LUZ.CY);
  if (paso < 2 * LUZ.PUNTO + 1.5) throw new Error('luz: los puntos se tocan');
}

function luz(svg) {
  const root = svg.closest('[data-luz]');
  const repetir = root ? root.querySelector('[data-repetir]') : null;
  const { SX, SY, D, A, VIDRIO, RAYO, VEL, K0 } = LUZ;
  const fin = 0.6 + (3.3 - K0) / VEL + 0.9;
  const esquinas = k => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([y, z]) => proyecta(k * D, y * k * A, z * k * A));

  const fondo = make('g', {}, svg);
  // Los rayos: del vidrio a las esquinas del marco de 3d (pasan por las de d y 2d).
  for (const [ex, ey] of esquinas(3)) {
    const dx = ex - SX, dy = ey - SY, largo = Math.hypot(dx, dy);
    make('path', { d: `M${r2(SX + dx / largo * RAYO)} ${r2(SY + dy / largo * RAYO)}L${r2(ex)} ${r2(ey)}`, class: 'luz__rayo' }, fondo);
  }
  // El eje de la distancia, con d, 2d y 3d bajo el centro de cada marco.
  const EJE = 226;
  make('path', { d: `M${SX} ${EJE}H${SX + 3 * D + 26}`, class: 'vec__eje' }, fondo);
  make('path', { d: `M${SX + 3 * D + 33} ${EJE}l-8 -4.5v9z`, class: 'vec__eje-punta' }, fondo);
  make('path', { d: `M${SX} ${EJE - 5}V${EJE + 5}`, class: 'vec__marca' }, fondo);
  ['d', '2d', '3d'].forEach((nombre, i) => {
    make('path', { d: `M${SX + (i + 1) * D} ${EJE - 5}V${EJE + 5}`, class: 'vec__marca' }, fondo);
    texto(fondo, 'luz__distancia', SX + (i + 1) * D, EJE + 18, nombre);
  });

  // El foco: vidrio, filamento, casquillo de rosca y el contacto de abajo.
  const foco = make('g', {}, svg);
  make('circle', { cx: SX, cy: SY, r: VIDRIO + 9, class: 'luz__halo' }, foco);
  make('path', { d: `M${SX - 6} ${SY + 10.5}Q${SX - VIDRIO - 1} ${SY + 2} ${SX - VIDRIO} ${SY - 2}A${VIDRIO} ${VIDRIO} 0 1 1 ${SX + VIDRIO} ${SY - 2}Q${SX + VIDRIO + 1} ${SY + 2} ${SX + 6} ${SY + 10.5}V${SY + 15}H${SX - 6}Z`, class: 'luz__vidrio' }, foco);
  make('path', { d: `M${SX - 3} ${SY + 12}L${SX - 3} ${SY + 2}M${SX + 3} ${SY + 12}L${SX + 3} ${SY + 2}`, class: 'luz__soporte' }, foco);
  make('path', { d: `M${SX - 3} ${SY + 2}l1.2 -2.4l1.2 2.4l1.2 -2.4l1.2 2.4l1.2 -2.4`, class: 'luz__filamento' }, foco);
  make('rect', { x: SX - 6.5, y: SY + 15, width: 13, height: 12, rx: 1, class: 'luz__base' }, foco);
  make('path', { d: `M${SX - 6.5} ${SY + 18.5}h13M${SX - 6.5} ${SY + 22}h13M${SX - 6.5} ${SY + 25.5}h13`, class: 'luz__rosca' }, foco);
  make('path', { d: `M${SX - 3.5} ${SY + 27}h7l-1.5 3h-4z`, class: 'luz__base' }, foco);

  // Los tres marcos, con su rejilla de cuadros iguales, y lo que cae en cada uno.
  const marcos = [1, 2, 3].map(k => {
    const g = make('g', {}, svg);
    const c = esquinas(k);
    const marco = make('path', { d: 'M' + c.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L') + 'Z', class: 'luz__marco' }, g);
    let d = '';
    for (let i = 1; i < k; i++) {
      const w = -k * A + i * 2 * A;
      const [a1, b1] = proyecta(k * D, w, -k * A), [a2, b2] = proyecta(k * D, w, k * A);
      const [a3, b3] = proyecta(k * D, -k * A, w), [a4, b4] = proyecta(k * D, k * A, w);
      d += `M${r2(a1)} ${r2(b1)}L${r2(a2)} ${r2(b2)}M${r2(a3)} ${r2(b3)}L${r2(a4)} ${r2(b4)}`;
    }
    if (d) make('path', { d, class: 'luz__rejilla' }, g);
    const huella = make('g', { opacity: 0 }, g);
    for (const y of OFFSETS) for (const z of OFFSETS) {
      const [x, yy] = proyecta(k * D, k * y, k * z);
      make('circle', { cx: x, cy: yy, r: LUZ.PUNTO, class: 'luz__punto' }, huella);
    }
    const etiqueta = texto(svg, 'luz__cuenta', SX + k * D, 214, k === 1 ? '36 en 1 cuadro' : 36 / (k * k) + ' por cuadro');
    return { k, marco, huella, etiqueta };
  });

  // El pulso de luz: los mismos 36 puntos, que se alejan del foco en línea recta.
  const pulso = make('g', {}, svg);
  const puntos = [];
  for (const y of OFFSETS) for (const z of OFFSETS) puntos.push({ y, z, nodo: make('circle', { r: LUZ.PUNTO, class: 'luz__punto' }, pulso) });

  let t = 0;
  function draw(tiempo) {
    const k = K0 + Math.max(0, tiempo - 0.6) * VEL;
    const visible = tiempo < 0.6 ? 0 : clamp((k - K0) / 0.12) * (1 - clamp((k - 3.05) / 0.25));
    pulso.setAttribute('opacity', r2(visible));
    // Cuando el pulso ya pasó (o no ha salido), se quita: sus puntos no quedan fuera de la figura.
    pulso.style.display = visible > 0 ? '' : 'none';
    const kv = Math.min(k, 3.3);
    if (visible > 0) for (const p of puntos) {
      const [x, y] = proyecta(kv * D, kv * p.y, kv * p.z);
      set(p.nodo, { cx: x, cy: y });
    }
    for (const m of marcos) {
      const llegada = clamp((k - m.k) / 0.08);
      m.huella.setAttribute('opacity', r2(llegada));
      // La luz que cae en cada cuadro baja con el cuadrado de la distancia: el marco se ve más tenue.
      m.marco.style.fillOpacity = r2(llegada * 0.26 / (m.k * m.k));
      m.etiqueta.setAttribute('opacity', r2(clamp((k - m.k) / 0.4)));
    }
  }

  function empieza(animar) { t = animar && !reducedMotion.matches ? 0 : fin; draw(t); }
  if (repetir) repetir.addEventListener('click', () => empieza(true));
  const pantalla = svg.closest('[data-diapositiva]');
  if (pantalla) pantalla.addEventListener('tercial:diapositiva', () => empieza(true));
  empieza(true);
  return {
    update(dt) { if (t < fin) { t += dt; draw(t); } },
    still() { t = fin; draw(t); }
  };
}

/* ---------------- Reloj compartido ---------------- */
const factories = { suma, luz };
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
