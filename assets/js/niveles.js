/* ============================================================
   niveles.js — separación Medio superior / Superior (prepa / uni)

   Implementa repo-diseno/IMPLEMENTAR-niveles.md (§3.1):
   un solo flag `localStorage['tercial-nivel']` que (a) pone data-nivel
   en <html> (acento, vía CSS) y (b) selecciona el contenido del home.
   Sin login todavía — el flag vive junto a tercial-theme-pref. Cuando
   exista el perfil, el nivel saldrá del alumno logueado (FASE login).

   Contenido por nivel = mockup "Niveles Tercial". El de medio superior
   y el área de superior son PLACEHOLDER hasta tener el contenido real.
   ============================================================ */

const NIVEL_KEY = 'tercial-nivel';

const NIVELES = {
  medio: {
    badge: 'Prepa',
    eyebrow: 'Examen COMIPEMS · 128 reactivos',
    heroTitle: 'Tu lugar en la<br><em>prepa</em> empieza aquí.',
    lede: 'Las 10 materias de secundaria, exámenes reales y tu mapa de estudio.',
    materiasLabel: 'Tus materias',
    area: null,
    materias: ['Español', 'Matemáticas', 'Historia', 'Geografía', 'F. cívica y ética',
               'Física', 'Química', 'Biología', 'Razon. verbal', 'Razon. matemático'],
  },
  superior: {
    badge: 'Universidad',
    eyebrow: 'Examen UNAM · Área 2 · 120 reactivos',
    heroTitle: 'Tu <em>carrera</em><br>empieza por aquí.',
    lede: 'Tu área de conocimiento, exámenes por plantel y tu mapa de estudio.',
    materiasLabel: 'Tu área · ciencias bio-químicas',
    area: 'ciencias bio-químicas',
    materias: ['Biología', 'Química', 'Física', 'Matemáticas', 'Cálculo', 'Español',
               'Historia de México', 'Historia universal', 'Literatura', 'Geografía'],
  },
};

function getNivel() {
  const n = localStorage.getItem(NIVEL_KEY);
  return (n === 'medio' || n === 'superior') ? n : 'superior'; // default: sitio superior-only de hoy
}

function setNivel(n) {
  if (n !== 'medio' && n !== 'superior') return;
  localStorage.setItem(NIVEL_KEY, n);
  document.documentElement.setAttribute('data-nivel', n);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Render del home por nivel (home-nivel.html) ────────────
function renderHome() {
  const n = getNivel();
  const d = NIVELES[n];

  document.getElementById('nv-badge').textContent = d.badge;
  document.getElementById('nv-eyebrow').textContent = d.eyebrow;
  document.getElementById('nv-title').innerHTML = d.heroTitle;     // contiene <em> (acento por CSS)
  document.getElementById('nv-lede').textContent = d.lede;
  document.getElementById('nv-materias-label').textContent = d.materiasLabel;

  // "cambiar área" solo en superior
  document.getElementById('nv-area-action').hidden = !d.area;

  document.getElementById('nv-materias').innerHTML =
    d.materias.map(m => `<span class="nv-chip">${esc(m)}</span>`).join('');

  // estado del switch de demo
  document.querySelectorAll('[data-set-nivel]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.getAttribute('data-set-nivel') === n)));
}

document.addEventListener('DOMContentLoaded', () => {
  // Pantalla de bifurcación (elige.html): elegir → fija flag → va al home
  document.querySelectorAll('[data-elige]').forEach(card => {
    card.addEventListener('click', () => {
      setNivel(card.getAttribute('data-elige'));
      window.location.href = '/tercial/home-nivel.html';
    });
  });

  // Home por nivel (home-nivel.html)
  if (document.getElementById('nv-title')) {
    renderHome();
    // switch de demostración (mientras no haya perfil/login)
    document.querySelectorAll('[data-set-nivel]').forEach(b =>
      b.addEventListener('click', () => { setNivel(b.getAttribute('data-set-nivel')); renderHome(); }));
  }
});
