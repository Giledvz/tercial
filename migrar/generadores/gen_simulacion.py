#!/usr/bin/env python3
# Bloque 15: Simulacros COMIPEMS 2024 v1 y v2 → hoja SOLO ALUMNO
# (los .tex de Overleaf no traen clave; regla: no inventar respuestas).
#
# Estructura fuente (regular en ambos archivos):
#   \begin{flushleft}\Large \textbf{Materia}\end{flushleft}     → sección
#   \textbf{\item <pregunta>\\}                                  → reactivo
#   [\begin{tikzpicture}...pgfplots...]                          → gráfica (chart SVG)
#   \begin{enumerate} 4 × \item ... \end{enumerate}              → opciones A-D
#
# Uso (desde la raíz del repo):
#   python3 migrar/generadores/gen_simulacion.py
import re, glob, sys, os

exec(open('migrar/generadores/gen_examenes.py').read().split('# =====================')[0])  # chart()

IMG_DIR = 'img/simulacion-2024'

# ---------- conversión LaTeX → HTML ----------

def _img(m):
    opts, path = m.group(1) or '', m.group(2)
    name = os.path.basename(path.strip()).replace(' ', '-')
    h = re.search(r'height=([\d.]+)cm', opts)
    px = round(float(h.group(1)) * 37.8) if h else 60
    return f'<img src="{IMG_DIR}/{name}" alt="" style="height: {px}px; vertical-align: middle;">'

def _ce(m):
    return re.sub(r'(?<=[A-Za-z\)])(\d+)', r'<sub>\1</sub>', m.group(1))

def conv_text(t):
    t = re.sub(r'\\includegraphics(\[[^\]]*\])?\{([^}]*)\}', _img, t)
    t = re.sub(r'\\underline\{\s*\\hspace\{[^}]*\}\s*\}', '<u>' + ' ' * 12 + '</u>', t)
    t = re.sub(r'\\underline\{([^{}]*)\}', r'<u>\1</u>', t)
    t = re.sub(r'\\textbf\{([^{}]*)\}', r'<strong>\1</strong>', t)
    t = re.sub(r'\\textit\{([^{}]*)\}', r'<em>\1</em>', t)
    t = re.sub(r'\\ce\{([^{}]*)\}', _ce, t)
    t = t.replace('\\%', '%').replace('\\$', '&#36;').replace('\\&', '&amp;')
    t = re.sub(r'\\[hv]space\*?\{[^}]*\}', ' ', t)
    t = re.sub(r'\\(hfill|break|newpage|columnbreak|FloatBarrier|noindent|centering|item)\b', ' ', t)
    t = re.sub(r'\\(begin|end)\{(center|minipage|multicols|flushleft)\}(\{[^}]*\})*', ' ', t)
    t = re.sub(r'\\setlength\{[^}]*\}\{[^}]*\}', ' ', t)
    t = t.replace('``', '«').replace("''", '»').replace('\\\\', ' ')
    # Colapsar solo espacios ASCII: \s en Unicode también come los \xa0 de
    # los blancos <u>…</u>. Sin strip: conserva el espacio frontera con math.
    return re.sub(r'[ \t\r\n]+', ' ', t)

def tex2html(s):
    s = s.replace(r'\(', '$').replace(r'\)', '$')
    # Reparar math partido del original: «...=-4$$ \\ $$-3x...» dentro de un
    # \begin{cases}...\end{cases} → un solo segmento $...$ con el \\ adentro.
    s = re.sub(r'\$\$\s*\\\\\s*\$\$', r' \\\\ ', s)
    parts = re.split(r'(\$[^$]*\$)', s)
    return ''.join(p if p.startswith('$') else conv_text(p) for p in parts).strip()

# ---------- helpers de parseo ----------

def brace_block(s, i):
    """s[i] == '{' → contenido hasta su '}' pareja (sin las llaves)."""
    depth, j = 0, i
    while j < len(s):
        if s[j] == '{': depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0: return s[i+1:j], j + 1
        j += 1
    raise ValueError('llave sin cerrar')

def env_block(s, start, env):
    """Primer \\begin{env}...\\end{env} a partir de start → (contenido, fin)."""
    b = s.find(f'\\begin{{{env}}}', start)
    if b < 0: return None, None
    e = s.find(f'\\end{{{env}}}', b)
    return s[b + len(f'\\begin{{{env}}}'):e], e + len(f'\\end{{{env}}}')

def parse_chart(window):
    ax = re.search(r'\\begin\{axis\}(.*?)\\end\{axis\}', window, re.DOTALL)
    if not ax: return None
    p = ax.group(1)
    def n(v):
        f = float(v)
        return int(f) if f == int(f) else f
    def num(k): return n(re.search(k + r'\s*=\s*(-?[\d.]+)', p).group(1))
    def ticks(k):
        return [n(v) for v in re.search(k + r'\s*=\s*\{([^}]*)\}', p).group(1).split(',')]
    ylabel = re.search(r'ylabel=\{([^}]*)\}', p).group(1)
    cb = re.search(r'coordinates\s*\{([^}]*)\}', window, re.DOTALL).group(1)
    coords = [(float(a), float(b)) for a, b in re.findall(r'\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)', cb)]
    svg = chart(coords, num('xmin'), num('xmax'), num('ymin'), num('ymax'),
                ticks('xtick'), ticks('ytick'), ylabel)
    return f'<figure class="exam-pdf__figure">\n        {svg}\n      </figure>'

def parse(texpath):
    """→ (sections, skipped, warnings); sections = [(materia, [(qhtml, fig, [opts])...])]"""
    body = open(texpath, encoding='utf-8').read().split('\\begin{document}')[1]
    headers = [(m.start(), m.group(1)) for m in
               re.finditer(r'\\begin\{flushleft\}\s*\\Large\s*\\textbf\{([^}]*)\}', body)]
    qpos = []
    for m in re.finditer(r'\\textbf\{\\item', body):
        text, after = brace_block(body, m.start() + len('\\textbf'))
        qpos.append((m.start(), after, text[len('\\item'):].strip()))
    sections, skipped, warnings = [], [], []
    seen = set()
    for hi, (hstart, hname) in enumerate(headers):
        hend = headers[hi + 1][0] if hi + 1 < len(headers) else len(body)
        qs = []
        for qi, (qstart, qafter, qtext) in enumerate(qpos):
            if not (hstart <= qstart < hend): continue
            wend = min((p for p, _, _ in qpos if p > qstart), default=hend)
            window = body[qafter:min(wend, hend)]
            fig = parse_chart(window) if '\\begin{tikzpicture}' in window else None
            enum, _ = env_block(window, 0, 'enumerate')
            opts = [tex2html(o) for o in re.split(r'\\item', enum)[1:]] if enum else []
            qhtml = tex2html(qtext.rstrip('\\').strip())
            if not qhtml:
                skipped.append(f'{hname}: reactivo sin enunciado (opciones: {", ".join(opts)})')
                continue
            if not opts:
                warnings.append(f'{hname}: sin opciones → «{qhtml[:60]}»')
            key = (qhtml, tuple(opts))
            if key in seen:
                skipped.append(f'{hname}: reactivo duplicado en el original → «{qhtml[:60]}»')
                continue
            seen.add(key)
            qs.append((qhtml, fig, opts))
        if qs:
            sections.append((hname, qs))
        else:
            skipped.append(f'{hname}: sección sin reactivos (no se emite)')
    return sections, skipped, warnings

# ---------- armado de la página ----------

def li(qhtml, fig, opts):
    body = f'<p>{qhtml}</p>'
    if fig: body += f'\n      {fig}'
    if opts:
        ch = '\n'.join(f'        <li>{o}</li>' for o in opts)
        body += f'\n      <ol class="exam-pdf__choices">\n{ch}\n      </ol>'
    return f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      {body}\n    </div></li>'

def page(version, sections, total):
    out = [f'''<!DOCTYPE html>
<html lang="es" data-theme="light" data-theme-pref="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Simulacro COMIPEMS 2024 — {version} · Tercial</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">

  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="../assets/css/exam-print.css">

  <script defer src="../assets/js/katex-loader.js"></script>
</head>
<body>

<main class="exam-pdf exam-pdf--mate">

  <header class="exam-pdf__hero">
    <p class="exam-pdf__eyebrow">Simulacro · COMIPEMS · 10 materias</p>
    <h1 class="exam-pdf__title">Simulacro 2024 — <em>{version}</em></h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · {total} reactivos · versión alumno</p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>Contesta como en el examen real: sin calculadora ni apuntes, marcando una sola opción por reactivo en tu hoja de respuestas. Administra tu tiempo: son {total} reactivos.</p>
  </div>
''']
    for i, (name, qs) in enumerate(sections):
        first = ' exam-pdf__section--first' if i == 0 else ''
        cont = '' if i == 0 else ' exam-pdf__exercises--continue'
        items = '\n\n'.join(li(*q) for q in qs)
        out.append(f'''  <section class="exam-pdf__section{first}">
    <h2 class="exam-pdf__section-title">{name}</h2>
  </section>

  <ol class="exam-pdf__exercises exam-pdf__exercises--compact exam-pdf__exercises--cols2{cont}">
{items}
  </ol>
''')
    out.append('''</main>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ClasesKatex) window.ClasesKatex.load();
  });
</script>

</body>
</html>
''')
    return '\n'.join(out)

# ---------- main ----------

for ver, slug in [('Versión 1', 'v1'), ('Versión 2', 'v2')]:
    tex = glob.glob(f'migrar/overleaf/simulacion-de-examen-2024-{slug}/**/*.tex', recursive=True)[0]
    sections, skipped, warnings = parse(tex)
    total = sum(len(qs) for _, qs in sections)
    out = f'examenes-pdf/simulacion-2024-{slug}.html'
    open(out, 'w', encoding='utf-8').write(page(ver, sections, total))
    print(f'✓ {out}: {total} reactivos en {len(sections)} materias')
    for name, qs in sections: print(f'    {name}: {len(qs)}')
    for s in skipped: print(f'  ⚠ OMITIDO {s}')
    for w in warnings: print(f'  ⚠ {w}')
