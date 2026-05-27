/* convert-latex-bank.mjs
   Converter de bancos de preguntas (texto plano + Unicode → LaTeX KaTeX).

   USO:
     node tools/convert-latex-bank.mjs <archivo.html>

   ASUME:
     - El archivo contiene `const BANCO = [ ... ];` con objects que tienen
       campos { q: "...", ops: ["...","...","...","..."], exp: "..." }.
     - Los strings usan double quotes "..." (escapado JS estándar).
     - El converter es idempotente (skip strings ya con $...$).

   HISTORIAL:
     - Fase 2.6 parte 1/2 (mate, commit 575c576): converter original
       para examen_adaptativo.html (no quedó archivado, este es la
       reconstrucción + extensión).
     - Fase 2.6 parte 2/2 (física, commit 4ad0ab8): este archivo.
       100 preguntas convertidas, 377 wrappers $...$, 0 KaTeX errors.

   HEURÍSTICAS:
     - Pre-conversion Greek+letter → \greek_{letter} (μk → \mu_{k})
     - Unit regex con alternativas más largas primero (km/h ANTES de km)
     - wrapInlineMath: lhs admite \command, rhs no rompe en decimales
     - Spanish prose trim: corta wrap antes de "en/con/de/por/..."
     - fixLeakage: post-pass para temperaturas (°C), ángulos (°),
       greek standalone (\Omega), notación científica
     - JS escape obligatorio: cada \ del contenido → \\ en JS source
       (sin esto, JS interpreta "\m" como "m" y se pierde el backslash)

   NOTA: Diseñado one-shot para bancos específicos. Si vas a usarlo
   en un nuevo banco con vocabulario distinto, revisa las tablas de
   griegas/operadores/unidades y extiende según el dominio.
*/
import fs from 'fs';

const FILE = process.argv[2];
if (!FILE) {
  console.error('Uso: node tools/convert-latex-bank.mjs <archivo.html>');
  process.exit(1);
}
let src = fs.readFileSync(FILE, 'utf8');

const stats = {
  q_inline_wraps: 0,
  ops_total: 0, ops_wrapped: 0,
  exp_wrapped: 0,
  unicode_subs: 0,
  greek_subs: 0,
  leakage_fixes: 0
};

const GREEK_NAMES = {'μ':'mu','ρ':'rho','λ':'lambda','σ':'sigma','ω':'omega','α':'alpha','β':'beta','γ':'gamma','θ':'theta','δ':'delta','Δ':'Delta','Ω':'Omega','π':'pi'};
const SUP_MAP = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+','ⁿ':'n'};
const SUB_MAP = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};

function unicodeAtoms(s) {
  let r = s;

  // 0. PRE: Greek + single lowercase = sub: μk → \mu_{k}
  r = r.replace(/([μρλσωαβγθδ])([a-z])(?![a-z])/g, (m, g, sub) => {
    stats.greek_subs++;
    return `\\${GREEK_NAMES[g]}_{${sub}}`;
  });

  // 1. Superscripts consecutivos → ^{...}
  r = r.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿ]+)/g, (m) => {
    stats.unicode_subs++;
    return '^{' + [...m].map(c => SUP_MAP[c] || c).join('') + '}';
  });

  // 2. Subscripts consecutivos → _{...}
  r = r.replace(/([₀₁₂₃₄₅₆₇₈₉]+)/g, (m) => {
    stats.unicode_subs++;
    return '_{' + [...m].map(c => SUB_MAP[c] || c).join('') + '}';
  });

  // 3. Griegas standalone (las que no se fusionaron como subscripts)
  for (const [g, name] of Object.entries(GREEK_NAMES)) {
    if (r.includes(g)) {
      r = r.split(g).join(`\\${name} `);
      stats.unicode_subs++;
    }
  }

  // 4. Operadores
  const opMap = {
    '×':'\\times ','÷':'\\div ','·':'\\cdot ','→':'\\to ',
    '≈':'\\approx ','≠':'\\neq ','≤':'\\leq ','≥':'\\geq ',
    '∝':'\\propto ','½':'\\tfrac{1}{2}','√':'\\sqrt',
    '−':'-'  // U+2212 minus sign → ASCII
  };
  for (const [op, l] of Object.entries(opMap)) {
    if (r.includes(op)) { r = r.split(op).join(l); stats.unicode_subs++; }
  }

  // 5. ° (grado): contexto-dependiente
  r = r.replace(/°([CFK])/g, '^{\\circ}\\mathrm{$1}');
  r = r.replace(/°/g, '^{\\circ}');

  // 6. Limpieza
  r = r.replace(/  +/g, ' ');

  return r;
}

// wrapUnits: alternativas más largas PRIMERO. También acepta número con sup
// previo (\d+\^{...}) para casos como "10^{-30} kg".
function wrapUnits(mathStr) {
  const UNIT_RE = /(\d+(?:[.,]\d+)?(?:\s*\\times\s*\d+\^\{[^}]+\})?(?:\^\{[^}]+\})?)\s+((?:m\/s\^\{[^}]+\}|kg\/m\^\{[^}]+\}|km\/h|kg\/m|m\/s|N\/m|cal\/g|kg|km|cm|mm|atm|cal|min|mol|atm|Hz|Pa|Wb|m|s|h|N|J|W|V|A|T|K|L)(?:\^\{[^}]+\})?)(?![a-zA-Z])/g;
  return mathStr.replace(UNIT_RE, '$1~\\mathrm{$2}');
}

// wrapInlineMath: lhs admite \command + variable adjunta; rhs trim prosa Spanish
const SPANISH_TRAILING_RE = /\s+(en|con|de|por|para|el|la|los|las|un|una|y|o|si|cuando|donde|que|como|sin|sobre|entre|hasta|desde|durante|hacia|al|del)\s/i;

function wrapInlineMath(s) {
  return s.replace(
    /(\\[a-zA-Z]+(?:_\{[^}]+\})?(?:\^\{[^}]+\})?(?:\s+[a-zA-Z])?|[a-zA-Z](?:_\{[^}]+\})?(?:\^\{[^}]+\})?)\s*=\s*(.+?)(?=\s*[?!)|¿¡]|\.\s+[A-Z¿]|\.$|$)/g,
    (match, lhs, rhs) => {
      if (!/[\d\\^_]|\\(times|div|cdot|to|approx|neq|leq|geq|propto|sqrt|tfrac|mathrm|Delta|Omega|theta|lambda|mu|rho|pi|sigma)/.test(rhs)) {
        return match;
      }
      // Trim trailing Spanish prose ("kg en energía" → "kg")
      const boundaryIdx = rhs.search(SPANISH_TRAILING_RE);
      if (boundaryIdx > 0) {
        const mathPart = rhs.slice(0, boundaryIdx);
        const prosePart = rhs.slice(boundaryIdx);
        stats.q_inline_wraps++;
        return `$${lhs} = ${mathPart.trim()}$${prosePart}`;
      }
      stats.q_inline_wraps++;
      return `$${lhs} = ${rhs.trim()}$`;
    }
  );
}

// fixLeakage: envuelve raw math leaks NO-ya-en-$...$
function fixLeakage(s) {
  const parts = s.split(/(\$[^$]+\$)/);
  return parts.map(part => {
    if (part.startsWith('$') && part.endsWith('$')) return part;
    let t = part;
    // Pattern 1: notación científica con unidad opcional (incl. m/s, km/h, etc.)
    t = t.replace(
      /(\d+(?:[.,]\d+)?\s*\\times\s*\d+\^\{-?\d+\}(?:\s+(?:\\mathrm\{[^}]+\}|[A-Za-z]+(?:\/[a-zA-Z]+(?:\^\{[^}]+\})?)?))?)/g,
      (m) => { stats.leakage_fixes++; return `$${m.trim()}$`; }
    );
    // Pattern 2: temperatura "37^{\circ}\mathrm{C}" o ángulo "35^{\circ}"
    t = t.replace(
      /(\d+(?:[.,]\d+)?\^\{\\circ\}(?:\\mathrm\{[CFK]\})?)/g,
      (m) => { stats.leakage_fixes++; return `$${m}$`; }
    );
    // Pattern 3: número seguido de comando \greek (ej "10 \Omega")
    t = t.replace(
      /(\d+(?:[.,]\d+)?\s+\\(?:Omega|Delta|Pi|Sigma|Lambda|Theta|mu|rho|pi|sigma|lambda|theta|omega|alpha|beta|gamma)\b)/g,
      (m) => { stats.leakage_fixes++; return `$${m}$`; }
    );
    // Pattern 4: letras con sub/sup standalone; opcional número precedente.
    // Si la base es multi-letra (unidad como cm, m, etc.), envuelve en \mathrm.
    t = t.replace(
      /(?:(\d+(?:[.,]\d+)?)\s+)?\b([A-Za-z]+(?:_\{[^}]+\}|\^\{[^}]+\}))/g,
      (m, num, expr) => {
        stats.leakage_fixes++;
        const baseM = expr.match(/^([A-Za-z]+)((?:_\{[^}]+\}|\^\{[^}]+\}))$/);
        if (baseM && baseM[1].length > 1 && num) {
          // "2 cm^{2}" → "$2~\mathrm{cm}^{2}$"
          return `$${num}~\\mathrm{${baseM[1]}}${baseM[2]}$`;
        }
        return num ? `$${num}~${expr}$` : `$${expr}$`;
      }
    );
    return t;
  }).join('');
}

function processQ(s) {
  let r = unicodeAtoms(s);
  r = wrapInlineMath(r);
  r = r.replace(/\$([^$]+)\$/g, (m, content) => `$${wrapUnits(content)}$`);
  r = fixLeakage(r);
  return r;
}

function processExp(s) {
  let r = unicodeAtoms(s);
  if (r.includes('$')) return r;
  const hasMath = /[=^_]|\\(times|div|cdot|to|approx|neq|leq|geq|propto|sqrt|tfrac|Delta|Omega|theta|lambda|mu|rho|pi|sigma|sin|cos|tan|log|ln|circ|mathrm)/.test(r);
  if (hasMath) {
    stats.exp_wrapped++;
    return '$' + wrapUnits(r) + '$';
  }
  return r;
}

function processOps(s) {
  let r = unicodeAtoms(s);
  if (r.includes('$')) return r;
  const startsWithNumber = /^\s*-?\d/.test(r.trim());
  const hasMath = /[=^_]|\\(times|div|cdot|to|approx|neq|leq|geq|propto|sqrt|tfrac|Delta|Omega|theta|lambda|mu|rho|pi|sigma|circ|mathrm)/.test(r);
  if (startsWithNumber || hasMath) {
    stats.ops_wrapped++;
    return '$' + wrapUnits(r) + '$';
  }
  return r;
}

// escapeForJS: cada '\' en el contenido debe ser '\\' en el JS source
// porque JS parsea "\m" como "m" (escape silencioso). Sin este escape,
// el backslash se pierde al cargar y KaTeX recibe "mathrm" en vez de "\mathrm".
function escapeForJS(s) {
  return s.replace(/\\/g, '\\\\');
}

// Main
const startMarker = 'const BANCO = [';
const endMarker = '\n];';
const sIdx = src.indexOf(startMarker);
const eIdx = src.indexOf(endMarker, sIdx);
let banco = src.slice(sIdx, eIdx + endMarker.length);

banco = banco.replace(/q:"([^"]*)"/g, (m, c) => `q:"${escapeForJS(processQ(c))}"`);
banco = banco.replace(/exp:"([^"]*)"/g, (m, c) => `exp:"${escapeForJS(processExp(c))}"`);
banco = banco.replace(/ops:\[("[^"]*"(?:,\s*"[^"]*")*)\]/g, (m, opts) => {
  const wrapped = opts.replace(/"([^"]*)"/g, (mm, c) => {
    stats.ops_total++;
    return `"${escapeForJS(processOps(c))}"`;
  });
  return `ops:[${wrapped}]`;
});

src = src.slice(0, sIdx) + banco + src.slice(eIdx + endMarker.length);
fs.writeFileSync(FILE, src);
console.log('Stats:', JSON.stringify(stats, null, 2));
