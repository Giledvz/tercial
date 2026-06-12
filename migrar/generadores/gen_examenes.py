#!/usr/bin/env python3
# Exámenes combinados (Matemáticas + Física). Solo alumno. Gráficas TikZ → SVG.

def chart(coords, xmin, xmax, ymin, ymax, xticks, yticks, ylabel):
    W, H = 340, 220; L, R, T, B = 46, 12, 16, 30
    def px(x): return L + (x-xmin)/(xmax-xmin)*(W-L-R)
    def py(y): return (H-B) - (y-ymin)/(ymax-ymin)*((H-B)-T)
    s=[f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfica de {ylabel} contra tiempo">']
    s.append('<defs><style>.grid{stroke:#ede2c5;stroke-width:.8}.ax{stroke:#4a3f33;stroke-width:1.2}.zero{stroke:#8c7556;stroke-width:1}.ln{stroke:#6b3a2e;stroke-width:1.6;fill:none}.dot{fill:#6b3a2e}.tk{font-family:\'IBM Plex Sans\',sans-serif;font-size:8px;fill:#877b6c}.axl{font-family:\'IBM Plex Sans\',sans-serif;font-size:9px;fill:#877b6c}</style></defs>')
    for x in xticks: s.append(f'<line class="grid" x1="{px(x):.1f}" y1="{T}" x2="{px(x):.1f}" y2="{H-B}"/>')
    for y in yticks: s.append(f'<line class="grid" x1="{L}" y1="{py(y):.1f}" x2="{W-R}" y2="{py(y):.1f}"/>')
    if ymin<0<ymax: s.append(f'<line class="zero" x1="{L}" y1="{py(0):.1f}" x2="{W-R}" y2="{py(0):.1f}"/>')
    s.append(f'<line class="ax" x1="{L}" y1="{T}" x2="{L}" y2="{H-B}"/>')
    s.append(f'<line class="ax" x1="{L}" y1="{H-B}" x2="{W-R}" y2="{H-B}"/>')
    for x in xticks: s.append(f'<text class="tk" x="{px(x):.1f}" y="{H-B+11}" text-anchor="middle">{x}</text>')
    for y in yticks: s.append(f'<text class="tk" x="{L-4}" y="{py(y)+3:.1f}" text-anchor="end">{y}</text>')
    s.append(f'<text class="axl" x="{(L+W-R)/2:.0f}" y="{H-4}" text-anchor="middle">Tiempo [s]</text>')
    s.append(f'<text class="axl" x="12" y="{(T+H-B)/2:.0f}" text-anchor="middle" transform="rotate(-90 12 {(T+H-B)/2:.0f})">{ylabel}</text>')
    pts=' '.join(f'{px(x):.1f},{py(y):.1f}' for x,y in coords)
    s.append(f'<polyline class="ln" points="{pts}"/>')
    for x,y in coords: s.append(f'<circle class="dot" cx="{px(x):.1f}" cy="{py(y):.1f}" r="2.2"/>')
    s.append('</svg>')
    return '\n        '.join(s)

GRAPH_SUBS = ['La distancia total','El desplazamiento total','La velocidad en el periodo de 6 a 9 segundos','La velocidad en los 3 primeros segundos','La velocidad en el periodo de 15 a 18 segundos']

def graphq(pts):
    sub='\n'.join(f'        <li>{t}</li>' for t in GRAPH_SUBS)
    svg=chart(pts,0,24,-200,200,[0,3,6,9,12,15,18,21,24],[-150,-100,-50,0,50,100,150],'Posición [m]')
    return ('<p><span class="exam-pdf__points">5 pts</span>De acuerdo con la gráfica mostrada, calcula:</p>\n'
            f'      <ol class="exam-pdf__sublist">\n{sub}\n      </ol>\n'
            f'      <figure class="exam-pdf__figure">\n        {svg}\n      </figure>')

def Q(pts, html):  # pregunta normal
    p = f'{pts} pt' if pts==1 else f'{pts} pts'
    return f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      <p><span class="exam-pdf__points">{p}</span>{html}</p>\n    </div></li>'

def QG(graph_html):  # pregunta con gráfica (ya incluye points y figura)
    return f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      {graph_html}\n    </div></li>'

def build(num, fecha, mate, fisica, total):
    def items(lst): return '\n'.join(lst)
    return f'''<!DOCTYPE html>
<html lang="es" data-theme="light" data-theme-pref="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Examen {num} · Tercial</title>

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
    <p class="exam-pdf__eyebrow">Evaluación · ECOEMS</p>
    <h1 class="exam-pdf__title">Examen {num} — <em>Matemáticas y Física</em></h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · {fecha} · versión alumno</p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>Resuelve el examen sin ningún tipo de ayuda (calculadora o apuntes). Para las preguntas que no puedas resolver, podrás revisar tus apuntes después para recordar cómo se hacían.</p>
  </div>

  <section class="exam-pdf__section exam-pdf__section--first">
    <h2 class="exam-pdf__section-title">Matemáticas</h2>
  </section>

  <ol class="exam-pdf__exercises">
{items(mate)}
  </ol>

  <section class="exam-pdf__section" style="page-break-before: always;">
    <h2 class="exam-pdf__section-title">Física</h2>
  </section>

  <ol class="exam-pdf__exercises">
{items(fisica)}
  </ol>

  <div class="exam-pdf__total">
    <span class="exam-pdf__total-label">Total de puntos</span>
    <span class="exam-pdf__total-value">{total}</span>
  </div>

</main>

<script>
  document.addEventListener('DOMContentLoaded', () => {{
    if (window.ClasesKatex) window.ClasesKatex.load();
  }});
</script>

</body>
</html>
'''

# ===================== Examen 2 (zip examen1) =====================
e2_m = [
 Q(1, r'$-12+18-24-11+33 =$'),
 Q(1, r'Obtén el mínimo común múltiplo de $16$ y $24$.'),
 Q(1, r'$\dfrac{18}{27}-\dfrac{9}{12}+\dfrac{5}{20} =$'),
 Q(2, r'Entre $3$ jardineros riegan y cuidan los jardines de un hotel en $20$ horas. Si durante el verano hay $2$ jardineros más, ¿cuánto tiempo tardarán en regar y cuidar los jardines entre todos?'),
 Q(1, r'¿Cuánto es $17^2$?'),
 Q(1, r'De $684$ tiros al aro que realizó Daniel, encestó $513$. ¿Cuál es el porcentaje de tiros fallados de Daniel?'),
]
e2_f = [
 Q(1, r'Despeja $v_0$ en la ecuación $d = v_0 t + \dfrac{1}{2}at^2$.'),
 Q(2, r'Convierte $360\,\mathrm{km/h}$ a $\mathrm{m/s}$.'),
 Q(1, r'Convierte $5.75\,\mathrm{hm}$ a $\mathrm{m}$.'),
 QG(graphq([(0,0),(3,-150),(6,-100),(9,150),(12,-50),(15,0),(18,-150),(21,-100),(24,0)])),
]
open('examenes-pdf/examen-02.html','w').write(build('2','Segundo fin de semana del curso', e2_m, e2_f, 16))

# ===================== Examen 3 =====================
e3_m = [
 Q(1, r'$-14+26-15-2+40 =$'),
 Q(1, r'Obtén el mínimo común múltiplo de $12$ y $18$.'),
 Q(1, r'$\dfrac{6}{12}-\dfrac{6}{18}+\dfrac{4}{10} =$'),
 Q(2, r'Si una casa tarda en construirse $20$ días trabajando $8$ obreros, ¿cuántos días tardará si se contratan $2$ obreros adicionales?'),
 Q(1, r'$(a^3+b^2)^2 =$'),
 Q(1, r'Si se aplica un descuento del $15\,\%$ a un coche de $\$150\,000$, ¿cuál será su precio ahora?'),
 Q(1, r'$(x-3)(x+17) =$'),
]
e3_f = [
 Q(1, r'Despeja $a$ en la ecuación $d = v_0 t + \dfrac{1}{2}at^2$.'),
 Q(1, r'Convierte $243\,\mathrm{dm}$ a $\mathrm{dam}$.'),
 QG(graphq([(0,-100),(3,-100),(6,-100),(9,50),(12,150),(15,-150),(18,150),(21,-100),(24,0)])),
 Q(1, r'¿Cuánto tiempo tarda alguien en recorrer $120\,\mathrm{km}$ a una velocidad de $40\,\mathrm{km/h}$?'),
 Q(1, r'¿Qué distancia recorrerá en línea recta un avión que se desplaza a una velocidad de $600\,\mathrm{km/h}$, durante un tiempo de $1$ hora $15$ minutos?'),
]
open('examenes-pdf/examen-03.html','w').write(build('3','Tercer fin de semana del curso', e3_m, e3_f, 17))

# ===================== Examen 4 =====================
e4_m = [
 Q(1, r'$+15+11-23-21+6 =$'),
 Q(1, r'Obtén el mínimo común múltiplo de $36$ y $48$.'),
 Q(1, r'$\dfrac{3}{12}-\dfrac{6}{24}+\dfrac{5}{40} =$'),
 Q(1, r'Factoriza $8m^2+2m-15 =$'),
 Q(1, r'Un coche tarda $45$ minutos en recorrer $72\,\mathrm{km}$. ¿Qué distancia recorrerá en $3$ horas si va a la misma velocidad?'),
 Q(1, r'$(2x^2+11)^2 =$'),
 Q(1, r'Una máquina que fabrica tornillos produce un $3\,\%$ de piezas defectuosas. Si hoy se descubrieron $51$ tornillos defectuosos, ¿cuántas piezas fabricó la máquina?'),
 Q(1, r'$(x+8)(x+12) =$'),
 Q(1, r'Factoriza $16x^2y^6-9b^8 =$'),
]
e4_f = [
 Q(1, r'Despeja $t$ en la ecuación $v_f = v_0 + at$.'),
 Q(1, r'Convierte $108\,\mathrm{km/h}$ a $\mathrm{m/s}$.'),
 QG(graphq([(0,100),(3,-50),(6,-150),(9,0),(12,-50),(15,-50),(18,150),(21,-100),(24,-100)])),
 Q(1, r'Se produce un disparo a $0.66\,\mathrm{km}$ de donde se encuentra un policía. ¿Cuánto tarda el policía en oírlo si la velocidad del sonido en el aire es de $330\,\mathrm{m/s}$?'),
 Q(1, r'Un cuerpo posee una velocidad inicial de $12\,\mathrm{m/s}$ y una aceleración de $2\,\mathrm{m/s^2}$. ¿Cuánto tiempo tardará en adquirir una velocidad de $144\,\mathrm{km/h}$?'),
]
open('examenes-pdf/examen-04.html','w').write(build('4','Cuarto fin de semana del curso', e4_m, e4_f, 18))
print('examen-02, examen-03, examen-04 escritos')
