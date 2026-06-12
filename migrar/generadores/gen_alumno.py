#!/usr/bin/env python3
# Generador de hoja SOLO alumno (documentos sin clave en Overleaf).
import re, sys

HEAD = '''<!DOCTYPE html>
<html lang="es" data-theme="light" data-theme-pref="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>{title} · Tercial</title>

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
    <p class="exam-pdf__eyebrow">Hoja de trabajo · {subject}</p>
    <h1 class="exam-pdf__title">{hero}</h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · {desc} · versión alumno</p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>{instr}</p>
  </div>
'''

TAIL = '''
</main>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ClasesKatex) window.ClasesKatex.load();
  });
</script>

</body>
</html>
'''

REPLACE = {
    '2++4(x-7)': '2+4(x-7)',                       # typo original Mate5 #15
    r'x-[5+3x-{5x-(6+x)}]': r'x-[5+3x-\{5x-(6+x)\}]',  # llaves visibles Mate5 #23
}
def clean_math(s):
    s = s.strip()
    if s.startswith('$') and s.endswith('$'):
        s = s[1:-1]
    s = s.replace('$$ \\\\ $$', r' \\ ').replace('$$ \\ $$', r' \\ ')
    for a,b in REPLACE.items(): s = s.replace(a,b)
    s = s.replace(r'\frac', r'\dfrac')
    return s.strip()

def parse(texpath):
    out, cur = [], []
    with open(texpath, encoding='utf-8') as f:
        for line in f:
            ms = re.search(r'\\section\{(.+?)\}', line)
            msub = re.search(r'\\subsection\{(.+?)\}', line)
            mitem = re.match(r'\s*\\item\s+(.*\S)\s*$', line)
            if mitem and not ms and not msub and r'\ding' not in line:
                c = mitem.group(1).strip()
                if c.startswith(r'\textbf{'):  # caja de fórmula teórica, no ejercicio
                    continue
                cur.append(c)
                continue
            if ms or msub:
                if cur: out.append(('items', cur)); cur=[]
                out.append(('section', ms.group(1)) if ms else ('subsection', msub.group(1)))
    if cur: out.append(('items', cur))
    return out

def render(blocks, cfg):
    parts, first = [], True
    for kind, val in blocks:
        if kind == 'section':
            cls = 'exam-pdf__section exam-pdf__section--first' if first else 'exam-pdf__section'
            first = False
            intro = cfg['sec_intros'].get(val, '')
            ih = f'\n    <p class="exam-pdf__section-intro">{intro}</p>' if intro else ''
            parts.append(f'\n  <section class="{cls}">\n    <h2 class="exam-pdf__section-title">{val}</h2>{ih}\n  </section>')
        elif kind == 'subsection':
            parts.append(f'\n  <p class="exam-pdf__subsection">{val}</p>')
        else:
            layout = cfg['layout']  # 'math2' | 'prose' | 'auto'
            if layout == 'auto':
                layout = 'math2' if all(it.strip().startswith('$') for it in val) else 'prose'
            if layout == 'math2':
                parts.append('\n  <ol class="exam-pdf__exercises exam-pdf__exercises--compact exam-pdf__exercises--cols2">')
                for it in val:
                    m = clean_math(it)
                    if cfg.get('fix_eq0') and re.search(r'=\s*$', m): m = m.rstrip()[:-1].rstrip()+' = 0'
                    parts.append(f'    <li class="exam-pdf__exercise">${m}$</li>')
                parts.append('  </ol>')
            else:
                parts.append('\n  <ol class="exam-pdf__exercises">')
                for it in val:
                    parts.append(f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body"><p>{it}</p></div></li>')
                parts.append('  </ol>')
    return '\n'.join(parts)

CFG = {
 'mate5': {
   'title':'Matemáticas 5 — Ecuaciones', 'subject':'Matemáticas 5',
   'hero':'Matemáticas 5 — <em>Ecuaciones</em>',
   'desc':'Ecuaciones de primer grado, sistemas y ecuaciones de segundo grado',
   'instr':'Encuentra el valor de la incógnita que satisface cada igualdad. En los sistemas, halla $x$ y $y$.',
   'layout':'math2', 'fix_eq0':True,
   'sec_intros':{'Ecuaciones':'El objetivo de resolver una ecuación es encontrar el valor de la incógnita que satisface la igualdad.'},
 },
 'mate8': {
   'title':'Matemáticas 8 — Repaso', 'subject':'Matemáticas 8',
   'hero':'Matemáticas 8 — <em>Repaso</em>',
   'desc':'Repaso COMIPEMS en seis clases: aritmética, álgebra y ecuaciones',
   'instr':'Resuelve cada bloque. Es un repaso general organizado por clases.',
   'layout':'auto',
   'sec_intros':{},
 },
 'mate6': {
   'title':'Matemáticas 6 — Lenguaje algebraico', 'subject':'Matemáticas 6',
   'hero':'Matemáticas 6 — <em>Lenguaje algebraico</em>',
   'desc':'Traducción a lenguaje algebraico y problemas con ecuaciones',
   'instr':'Traduce cada enunciado a lenguaje algebraico y, en la segunda sección, plantea y resuelve la ecuación.',
   'layout':'prose',
   'sec_intros':{'Lenguaje algebraico':'Expresa cada enunciado con símbolos algebraicos.','Problemas con ecuaciones':'Plantea una ecuación para cada situación y resuélvela.'},
 },
}

which, texpath, outpath = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = CFG[which]
blocks = parse(texpath)
open(outpath,'w',encoding='utf-8').write(HEAD.format(**cfg)+render(blocks,cfg)+TAIL)
n = sum(len(v) for k,v in blocks if k=='items')
print(f'{outpath}: {n} ejercicios')
