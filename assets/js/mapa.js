/* ============================================================
   mapa.js — "Tu mapa": bento de dominio (FASE 1)

   Datos de EJEMPLO (alumna "Sofía", examen ECOEMS) — misma forma que
   alimentaría el progreso real (dashboard/comprobante). La estructura
   es el contrato: cambia MAPA_DATA por datos reales y la vista funciona.

   FASE 1 implementa: tamaños (subtemas / reactivos), escala de color,
   y las señales 3.1 acción · 3.2 prioridad · 3.3 proyección · 3.5 cobertura.
   La señal 3.4 "▲ +N sem." (tendencia) es FASE 2 (requiere histórico) y se
   omite — el diseño degrada limpio sin ella.
   ============================================================ */

const META_PCT = 70;          // umbral "dominas"
const SESION_PRACTICA = 10;   // tamaño de sesión sugerido (señal 3.1)

const MAPA_DATA = {
  alumno: 'Sofía',
  examen: 'ECOEMS',
  diasAlExamen: 6,
  materias: [
    { nombre: 'Matemáticas', subtemas: 9, preguntas: 12, pct: 75, c: 2, r: 2 },
    {
      nombre: 'Física', subtemas: 7, preguntas: 12, pct: 71, r: 2, drill: true,
      temas: [
        { nombre: 'Termodinámica',     reactivos: 18, pct: 42, c: 2, r: 2 },
        { nombre: 'Física moderna',    reactivos: 12, pct: 48, c: 2 },
        { nombre: 'Electromagnetismo', reactivos: 14, pct: 79, r: 2 },
        { nombre: 'Cinemática',        pct: 88 },
        { nombre: 'Dinámica',          pct: 82 },
        { nombre: 'Mov. ondulatorio',  pct: 64 },
        { nombre: 'Fluidos',           pct: 58 },
        { nombre: 'Trabajo y energía', pct: 76 },
        { nombre: 'Óptica',            pct: 73 },
        { nombre: 'Ondas',             pct: 61 },
        { nombre: 'Magnetismo',        pct: null },
      ],
    },
    { nombre: 'Química',            subtemas: 7, preguntas: 12, pct: 75 },
    { nombre: 'Razon. verbal',     subtemas: 4, preguntas: 16, pct: 81 },
    { nombre: 'Español',           subtemas: 8, preguntas: 12, pct: 67, c: 2 },
    { nombre: 'Biología',          subtemas: 8, preguntas: 12, pct: 67, c: 2 },
    { nombre: 'Historia',          subtemas: 7, preguntas: 12, pct: 58 },
    { nombre: 'Geografía',         subtemas: 6, preguntas: 12, pct: 75 },
    { nombre: 'F. cívica',         subtemas: 5, preguntas: 12, pct: 75 },
    { nombre: 'Razon. matemático', subtemas: 4, preguntas: 16, pct: 63 },
  ],
};

// ── Helpers ─────────────────────────────────────────────────
function colorClass(pct) {
  if (pct == null) return 'tile--sin';
  if (pct >= 70)   return 'tile--domina';
  if (pct >= 50)   return 'tile--proceso';
  return 'tile--reforzar';
}

// área del azulejo (c*r) → tier de tipografía
function tier(c, r) {
  const area = (c || 1) * (r || 1);
  if (area >= 4) return 'tile--lg';
  if (area >= 2) return 'tile--md';
  return 'tile--sm';
}

function spanClasses(c, r) {
  const cls = [];
  if (c >= 2) cls.push('tile--c2');
  if (r >= 2) cls.push('tile--r2');
  return cls.join(' ');
}

function pctText(pct) { return pct == null ? '—' : pct + '%'; }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// promedio ponderado por nº de preguntas (dominio global del examen)
function globalPct(materias) {
  let num = 0, den = 0;
  materias.forEach(m => { if (m.pct != null) { num += m.pct * m.preguntas; den += m.preguntas; } });
  return den ? Math.round(num / den) : null;
}

// ── Render: azulejo de materia (nivel 1) ───────────────────
function materiaTile(m) {
  const t = tier(m.c, m.r);
  const lg = t === 'tile--lg';
  const metaFull = `${m.subtemas} subtemas · ${m.preguntas} preguntas`;
  // azulejo chico/mediano: si el tema pesa más preguntas que lo normal, lo dice
  const corner = m.preguntas > 12 ? `${m.subtemas} · ${m.preguntas} preg` : `${m.subtemas} subt`;
  const cls = ['tile', t, colorClass(m.pct), spanClasses(m.c, m.r)];
  if (m.drill) cls.push('tile--drill');

  const head = `<div class="tile__head"><span class="tile__nm">${esc(m.nombre)}</span>` +
    (lg ? `<span class="tile__corner">${m.subtemas} subt</span>` : '') + `</div>`;

  // Azulejo navegable (drill): layout en bloque con "ver temas →"
  if (m.drill) {
    const foot = `<div class="tile__foot tile__foot--block">` +
      `<span class="pct">${pctText(m.pct)}</span>` +
      `<span class="tile__meta">${m.subtemas} subt · ${m.preguntas} preg</span>` +
      `<span class="tile__more">ver temas →</span></div>`;
    return `<button class="${cls.join(' ')}" data-drill="${esc(m.nombre)}" type="button">${head}${foot}</button>`;
  }

  let foot;
  if (lg) {
    foot = `<div class="tile__foot"><span class="pct">${pctText(m.pct)}</span>` +
      `<span class="tile__meta">${metaFull}</span></div>`;
  } else {
    foot = `<div class="tile__foot"><span class="pct">${pctText(m.pct)}</span>` +
      `<span class="tile__corner">${corner}</span></div>`;
  }
  return `<div class="${cls.join(' ')}">${head}${foot}</div>`;
}

// ── Render: azulejo de tema (nivel 2) ──────────────────────
function temaTile(tm, priority) {
  const t = tier(tm.c, tm.r);
  const cls = ['tile', t, colorClass(tm.pct), spanClasses(tm.c, tm.r)];
  const meta = tm.reactivos != null ? `${tm.reactivos} react.` : '';

  if (priority) {
    cls.push('tile--priority');
    return `<div class="${cls.join(' ')}">` +
      `<div class="tile__head"><span class="tile__badge">Empieza aquí</span></div>` +
      `<div><span class="pct">${pctText(tm.pct)}</span>` +
      `<div class="tile__nm tile__nm--tema">${esc(tm.nombre)}</div>` +
      `<a class="tile__cta" href="/tercial/practicar.html">Practicar ${SESION_PRACTICA} reactivos →</a></div>` +
      `</div>`;
  }

  const head = `<div class="tile__head"><span class="tile__nm">${esc(tm.nombre)}</span></div>`;
  const foot = `<div class="tile__foot"><span class="pct">${tm.pct == null ? '— sin empezar' : tm.pct + '%'}</span>` +
    (meta ? `<span class="tile__corner">${meta}</span>` : '') + `</div>`;
  return `<div class="${cls.join(' ')}">${head}${foot}</div>`;
}

// elige el tema prioritario (señal 3.2): mayor impacto = peso × debilidad
function temaPrioritario(temas) {
  let best = null, bestScore = -1;
  temas.forEach(tm => {
    if (tm.reactivos == null || tm.pct == null) return;
    const score = tm.reactivos * (100 - tm.pct);
    if (score > bestScore) { bestScore = score; best = tm; }
  });
  return best;
}

// ── Pintar nivel 1 ─────────────────────────────────────────
function renderNivel1() {
  const g = globalPct(MAPA_DATA.materias);
  document.getElementById('mapa-global').textContent = g != null ? g + '%' : '—';
  document.getElementById('mapa-eyebrow').textContent =
    `Examen ${MAPA_DATA.examen} · ${MAPA_DATA.alumno}`;
  document.getElementById('bento-materias').innerHTML =
    MAPA_DATA.materias.map(materiaTile).join('');
}

// ── Pintar nivel 2 (temas de una materia) ──────────────────
function renderNivel2(nombreMateria) {
  const m = MAPA_DATA.materias.find(x => x.nombre === nombreMateria);
  if (!m || !m.temas) return;

  const prio = temaPrioritario(m.temas);
  const vistos = m.temas.filter(t => t.pct != null).length;
  const total = m.temas.length;

  // proyección (3.3): aciertos ganables si el tema prioritario sube a la meta
  let proyHTML = '';
  if (prio) {
    const aciertos = Math.round(prio.reactivos * (META_PCT - prio.pct) / 100);
    proyHTML = `Faltan ${MAPA_DATA.diasAlExamen} días — subir ` +
      `<strong>${esc(prio.nombre)}</strong> suma ~${aciertos} aciertos`;
  }

  document.getElementById('mapa2-eyebrow').textContent =
    `${m.nombre} · ${MAPA_DATA.alumno} · ${vistos} de ${total} temas vistos`;
  document.getElementById('mapa2-proj').innerHTML = proyHTML;
  document.getElementById('mapa2-global').textContent = m.pct != null ? m.pct + '%' : '—';

  document.getElementById('bento-temas').innerHTML =
    m.temas.map(tm => temaTile(tm, tm === prio)).join('');
}

// ── Navegación entre los dos niveles ───────────────────────
function showNivel(n, materia) {
  document.getElementById('nivel-1').hidden = n !== 1;
  document.getElementById('nivel-2').hidden = n !== 2;
  if (n === 2) renderNivel2(materia);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNivel1();

  document.getElementById('bento-materias').addEventListener('click', e => {
    const btn = e.target.closest('[data-drill]');
    if (btn) showNivel(2, btn.getAttribute('data-drill'));
  });
  document.getElementById('mapa-back').addEventListener('click', () => showNivel(1));
});
