#!/usr/bin/env python3
# Generador de hoja única alumno/clave para listas de Matemáticas (Bloque 6).
# Parsea el .tex de respuestas (que ya trae expresiones limpias + respuestas).
import re, sys, html

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
  <script defer src="../assets/js/exam-clave.js"></script>
</head>
<body>

<!-- Hoja única alumno/clave: sin parámetros se ve la versión del alumno;
     con ?clave=1 aparecen las respuestas (.clave-only). -->
<main class="exam-pdf exam-pdf--mate">

  <header class="exam-pdf__hero">
    <p class="exam-pdf__eyebrow"><span class="alumno-only">Hoja de trabajo · {subject}</span><span class="clave-only">Clave · profesor · {subject}</span></p>
    <h1 class="exam-pdf__title">{hero}</h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · {desc} · <span class="alumno-only">versión alumno</span><span class="clave-only">clave del profesor</span></p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label"><span class="alumno-only">Instrucciones</span><span class="clave-only">Clave</span></span>
    <p class="alumno-only">{instr_alumno}</p>
    <p class="clave-only">{instr_clave}</p>
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

def katex(s):
    s = s.strip()
    s = s.replace(r'\(', '').replace(r'\)', '')
    s = s.replace(r'\frac', r'\dfrac')
    return s

def parse(texpath):
    """Devuelve lista de bloques: ('section'|'subsection', titulo) o ('items', [(lhs,ans),...])"""
    out = []
    cur = []
    with open(texpath, encoding='utf-8') as f:
        for line in f:
            ms = re.search(r'\\section\{(.+?)\}', line)
            msub = re.search(r'\\subsection\{(.+?)\}', line)
            mitem = re.match(r'\s*\\item\s*\$(.+?)\$\s*\\textcolor\{purple\}\{(.+)\}\s*$', line)
            if mitem:
                lhs = mitem.group(1).strip()
                lhs = re.sub(r'=\s*$', '', lhs).strip()
                ans = mitem.group(2).strip()
                cur.append((katex(lhs), katex(ans)))
                continue
            if ms or msub:
                if cur:
                    out.append(('items', cur)); cur = []
                if ms:   out.append(('section', ms.group(1)))
                else:    out.append(('subsection', msub.group(1)))
    if cur: out.append(('items', cur))
    return out

def render(blocks, cfg):
    parts = []
    first_section = True
    for kind, val in blocks:
        if kind == 'section':
            cls = 'exam-pdf__section exam-pdf__section--first' if first_section else 'exam-pdf__section'
            first_section = False
            title = cfg['sec_titles'].get(val, val)
            intro = cfg['sec_intros'].get(val, '')
            intro_html = f'\n    <p class="exam-pdf__section-intro">{intro}</p>' if intro else ''
            parts.append(f'\n  <section class="{cls}">\n    <h2 class="exam-pdf__section-title">{title}</h2>{intro_html}\n  </section>')
        elif kind == 'subsection':
            parts.append(f'\n  <p class="exam-pdf__subsection">{val}</p>')
            if val in cfg['formulas']:
                fs = ''.join(f'\n    <span>{f}</span>' for f in cfg['formulas'][val])
                parts.append(f'\n  <div class="exam-pdf__formulas">\n    <span class="exam-pdf__formulas-label">Fórmula</span>{fs}\n  </div>')
        else:
            parts.append('\n  <ol class="exam-pdf__exercises exam-pdf__exercises--compact exam-pdf__exercises--cols2">')
            for lhs, ans in val:
                parts.append(f'    <li class="exam-pdf__exercise">${lhs} =$ <span class="clave-only"><span class="answer-final">${ans}$</span></span></li>')
            parts.append('  </ol>')
    return '\n'.join(parts)

CFG = {
 'mate3': {
   'title':'Matemáticas 3 — Multiplicaciones y productos notables',
   'subject':'Matemáticas 3', 'hero':'Matemáticas 3 — <em>Productos notables</em>',
   'desc':'Multiplicaciones, binomio al cuadrado, conjugado y con término común',
   'instr_alumno':'Desarrolla cada producto y reduce términos semejantes.',
   'instr_clave':'Cada producto desarrollado aparece subrayado.',
   'sec_titles':{'Multiplicaciones':'Multiplicaciones','Productos notables':'Productos notables'},
   'sec_intros':{'Multiplicaciones':'Un producto algebraico es la operación que resulta de la multiplicación de dos términos algebraicos. Recuerda que cuando dos términos algebraicos se multiplican, sus exponentes se suman.'},
   'formulas':{
     'Binomio al cuadrado':[r'$(a+b)^2 = a^2 + 2ab + b^2$', r'$(a-b)^2 = a^2 - 2ab + b^2$'],
     'Binomio conjugado':[r'$(a+b)(a-b) = a^2 - b^2$'],
     'Binomio con término común':[r'$(a+b)(a+c) = a^2 + (b+c)a + bc$'],
   },
 },
 'mate4': {
   'title':'Matemáticas 4 — Factorización',
   'subject':'Matemáticas 4', 'hero':'Matemáticas 4 — <em>Factorización</em>',
   'desc':'Factor común, diferencia de cuadrados y trinomios (tijera)',
   'instr_alumno':'Factoriza por completo cada expresión.',
   'instr_clave':'Cada expresión factorizada aparece subrayada.',
   'sec_titles':{'Factorización':'Factorización'},
   'sec_intros':{'Factorización':'Los tres casos básicos de factorización que se presentan a continuación sirven para simplificar expresiones y justificar resultados teóricos importantes.'},
   'formulas':{
     'Diferencia de cuadrados':[r'$a^2 - b^2 = (a-b)(a+b)$'],
   },
 },
}

which, texpath, outpath = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = CFG[which]
blocks = parse(texpath)
body = render(blocks, cfg)
out = HEAD.format(**cfg) + body + TAIL
open(outpath, 'w', encoding='utf-8').write(out)
n = sum(len(v) for k,v in blocks if k=='items')
print(f'{outpath}: {n} ejercicios')
