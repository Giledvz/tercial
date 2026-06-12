#!/usr/bin/env python3
# interpretacion-graficas.html — solo alumno. Gráficas TikZ → SVG de línea; tablas → tabla hairline.

def chart(coords, xmin, xmax, ymin, ymax, xticks, yticks, ylabel):
    W, H = 340, 220
    L, R, T, B = 46, 12, 16, 30
    def px(x): return L + (x-xmin)/(xmax-xmin)*(W-L-R)
    def py(y): return (H-B) - (y-ymin)/(ymax-ymin)*((H-B)-T)
    s = [f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfica de {ylabel} contra tiempo">']
    s.append('<defs><style>'
             '.grid{stroke:#ede2c5;stroke-width:.8}'
             '.ax{stroke:#4a3f33;stroke-width:1.2}'
             '.zero{stroke:#8c7556;stroke-width:1}'
             '.ln{stroke:#6b3a2e;stroke-width:1.6;fill:none}'
             '.dot{fill:#6b3a2e}'
             '.tk{font-family:\'IBM Plex Sans\',sans-serif;font-size:8px;fill:#877b6c}'
             '.axl{font-family:\'IBM Plex Sans\',sans-serif;font-size:9px;fill:#877b6c}'
             '</style></defs>')
    # grid
    for x in xticks: s.append(f'<line class="grid" x1="{px(x):.1f}" y1="{T}" x2="{px(x):.1f}" y2="{H-B}"/>')
    for y in yticks: s.append(f'<line class="grid" x1="{L}" y1="{py(y):.1f}" x2="{W-R}" y2="{py(y):.1f}"/>')
    # zero line
    if ymin < 0 < ymax: s.append(f'<line class="zero" x1="{L}" y1="{py(0):.1f}" x2="{W-R}" y2="{py(0):.1f}"/>')
    # axes
    s.append(f'<line class="ax" x1="{L}" y1="{T}" x2="{L}" y2="{H-B}"/>')
    s.append(f'<line class="ax" x1="{L}" y1="{H-B}" x2="{W-R}" y2="{H-B}"/>')
    # ticks labels
    for x in xticks: s.append(f'<text class="tk" x="{px(x):.1f}" y="{H-B+11}" text-anchor="middle">{x}</text>')
    for y in yticks: s.append(f'<text class="tk" x="{L-4}" y="{py(y)+3:.1f}" text-anchor="end">{y}</text>')
    # labels
    s.append(f'<text class="axl" x="{(L+W-R)/2:.0f}" y="{H-4}" text-anchor="middle">Tiempo [s]</text>')
    s.append(f'<text class="axl" x="12" y="{(T+H-B)/2:.0f}" text-anchor="middle" transform="rotate(-90 12 {(T+H-B)/2:.0f})">{ylabel}</text>')
    # line
    pts = ' '.join(f'{px(x):.1f},{py(y):.1f}' for x,y in coords)
    s.append(f'<polyline class="ln" points="{pts}"/>')
    for x,y in coords: s.append(f'<circle class="dot" cx="{px(x):.1f}" cy="{py(y):.1f}" r="2.2"/>')
    s.append('</svg>')
    return '\n        '.join(s)

def table(rows, head):
    r = '\n'.join(f'        <tr><td>${a}$</td><td>${b}$</td></tr>' for a,b in rows)
    return (f'<table class="exam-pdf__table">\n        <thead><tr><th>{head[0]}</th><th>{head[1]}</th></tr></thead>\n'
            f'        <tbody>\n{r}\n        </tbody>\n      </table>')

def fig(inner):
    return f'<figure class="exam-pdf__figure">\n        {inner}\n      </figure>'

# ---- datos ----
POS = [
 (['Traza una gráfica posición vs. tiempo','Calcula la distancia total','Calcula el desplazamiento total','Calcula la velocidad en los primeros 5 segundos','Calcula la velocidad en el periodo de 15 a 25 segundos'],
  table([(0,0),(5,100),(10,300),(15,300),(20,400),(25,500),(35,0)],('Tiempo (s)','Posición (m)'))),
 (['Traza la gráfica','Calcula el desplazamiento total','La distancia total','Los periodos de velocidad constante','La velocidad en los primeros dos segundos','La velocidad de 6 a 7 segundos'],
  table([(0,-40),(2,-25),(3,-25),(4,-20),(5,0),(6,25),(7,25),(8,15)],('Tiempo (s)','Posición (m)'))),
 (['La distancia total','El desplazamiento total','La velocidad en el periodo de 4 a 6 segundos','La velocidad en los dos primeros segundos','La velocidad en el periodo de 10 a 12 segundos'],
  fig(chart([(0,-20),(2,0),(4,40),(6,40),(8,20),(10,0),(12,-20),(14,0)],0,16,-30,50,[0,2,4,6,8,10,12,14,16],[-30,-20,-10,0,10,20,30,40,50],'Posición [m]'))),
 (['La distancia total recorrida','El desplazamiento total','La velocidad en los primeros 5 segundos','La velocidad en el periodo de 20 a 25 segundos'],
  fig(chart([(0,-10),(5,-20),(10,0),(20,0),(25,60),(30,20),(35,0)],0,40,-30,70,[0,5,10,15,20,25,30,35,40],[-30,-10,10,30,50,70],'Posición [m]'))),
 (['Traza una gráfica posición vs. tiempo','Calcula la distancia total','Calcula el desplazamiento total','Calcula la velocidad en el periodo de 50 a 100 segundos','Calcula la velocidad en el periodo de 200 a 250 segundos'],
  table([(0,20),(50,-30),(100,-50),(150,60),(200,60),(250,0),(350,-20)],('Tiempo (s)','Posición (m)'))),
 (['La distancia total','El desplazamiento total','La velocidad en el periodo de 12 a 21 segundos','La velocidad en los 3 primeros segundos','La velocidad en el periodo de 9 a 12 segundos'],
  fig(chart([(0,100),(3,-150),(6,-100),(9,50),(12,50),(15,0),(18,-50),(21,-100),(24,50)],0,24,-200,200,[0,3,6,9,12,15,18,21,24],[-150,-100,-50,0,50,100,150],'Posición [m]'))),
 (['Traza una gráfica posición vs. tiempo','Calcula la distancia total','Calcula el desplazamiento total','Calcula la velocidad en el periodo de 6 a 12 segundos','Calcula la velocidad en el periodo de 24 a 30 segundos'],
  table([(0,-10),(6,20),(12,-30),(18,40),(24,40),(30,0),(36,-20)],('Tiempo (s)','Posición (m)'))),
 (['La distancia total','El desplazamiento total','La velocidad en el periodo de 15 a 18 segundos','La velocidad en los 3 primeros segundos','La velocidad en el periodo de 9 a 12 segundos'],
  fig(chart([(0,50),(3,75),(6,-25),(9,0),(12,-25),(15,-100),(18,-25),(21,75),(24,-100)],0,24,-125,100,[0,3,6,9,12,15,18,21,24],[-100,-75,-50,-25,0,25,50,75],'Posición [m]'))),
]
VEL = [
 (['La distancia total recorrida','El desplazamiento total','La aceleración en el periodo de 10 a 15 segundos','La aceleración en el periodo de 25 a 30 segundos'],
  fig(chart([(0,0),(5,40),(10,40),(15,0),(20,-20),(25,-40),(30,0)],0,35,-50,50,[0,5,10,15,20,25,30,35],[-50,-30,-10,10,30,50],'Velocidad [m/s]'))),
 (['Trazar la gráfica velocidad vs. tiempo','Calcular la distancia total recorrida','Calcular el desplazamiento total','Calcular la aceleración en el primer segundo','Calcular la aceleración en el periodo de 7 a 8 segundos'],
  table([(0,200),(1,0),(2,0),(3,-150),(4,-150),(5,0),(6,100),(7,0),(8,-200)],('Tiempo (s)','Velocidad (m/s)'))),
 (['La distancia total recorrida','El desplazamiento total','La aceleración en el periodo de 10 a 15 segundos','La aceleración en el periodo de 25 a 30 segundos'],
  fig(chart([(0,-10),(5,0),(10,30),(15,0),(20,-20),(25,-20),(30,0),(35,20),(40,0),(45,10)],0,50,-30,40,[0,5,10,15,20,25,30,35,40,45,50],[-30,-10,10,30],'Velocidad [m/s]'))),
 (['Su aceleración en el periodo de 10 a 12 segundos','¿En qué intervalo de tiempo la aceleración es cero?','Distancia recorrida','La aceleración en el intervalo de 4 a 6 segundos','El desplazamiento total'],
  fig(chart([(0,-5),(2,0),(4,5),(6,15),(8,10),(10,10),(12,-5),(14,-5)],0,16,-10,20,[0,2,4,6,8,10,12,14,16],[-10,-5,0,5,10,15,20],'Velocidad [m/s]'))),
 (['Trazar la gráfica velocidad vs. tiempo','Calcular la distancia total','Calcular el desplazamiento total','Calcular la aceleración en los primeros 4 segundos','La aceleración en el periodo de 12 a 14 segundos'],
  table([(0,150),(4,100),(8,100),(12,50),(16,200),(20,50),(28,-50)],('Tiempo (s)','Velocidad (m/s)'))),
 (['Trazar gráfica velocidad vs. tiempo','Calcular el desplazamiento total','Calcular la distancia total','¿Cuál es la aceleración en los primeros tres segundos?','¿Cuál es la aceleración en el intervalo de 9 a 12 segundos?'],
  table([(0,300),(3,0),(6,0),(9,100),(12,-200),(15,-300),(18,-300),(21,0)],('Tiempo (s)','Velocidad (m/s)'))),
]

def items(data):
    out = []
    for subs, figh in data:
        sub = '\n'.join(f'        <li>{t}</li>' for t in subs)
        out.append('    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n'
                   '      <p>De acuerdo con la gráfica o los datos mostrados, calcula:</p>\n'
                   f'      <ol class="exam-pdf__sublist">\n{sub}\n      </ol>\n'
                   f'      {figh}\n'
                   '    </div></li>')
    return '\n'.join(out)

HTML = f'''<!DOCTYPE html>
<html lang="es" data-theme="light" data-theme-pref="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Interpretación de gráficas · Tercial</title>

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

<main class="exam-pdf exam-pdf--fisica">

  <header class="exam-pdf__hero">
    <p class="exam-pdf__eyebrow">Hoja de trabajo · Cinemática</p>
    <h1 class="exam-pdf__title">Interpretación de <em>gráficas</em></h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · Gráficas posición–tiempo y velocidad–tiempo · versión alumno</p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>En los ejercicios con tabla, traza primero la gráfica y luego responde. Recuerda: el área bajo la curva velocidad–tiempo es el desplazamiento, y la pendiente es la aceleración.</p>
  </div>

  <section class="exam-pdf__section exam-pdf__section--first">
    <h2 class="exam-pdf__section-title">Posición vs. tiempo</h2>
  </section>

  <ol class="exam-pdf__exercises">
{items(POS)}
  </ol>

  <section class="exam-pdf__section">
    <h2 class="exam-pdf__section-title">Velocidad vs. tiempo</h2>
  </section>

  <ol class="exam-pdf__exercises">
{items(VEL)}
  </ol>

</main>

<script>
  document.addEventListener('DOMContentLoaded', () => {{
    if (window.ClasesKatex) window.ClasesKatex.load();
  }});
</script>

</body>
</html>
'''
open('examenes-pdf/interpretacion-graficas.html','w').write(HTML)
print('interpretacion-graficas.html escrito:', len(POS)+len(VEL), 'ejercicios')
