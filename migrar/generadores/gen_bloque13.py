#!/usr/bin/env python3
import math
exec(open('migrar/generadores/gen_examenes.py').read().split('# =====================')[0])  # chart(), build()

# ---------- figuras SVG ----------
def fig(svg): return f'<figure class="exam-pdf__figure">\n        {svg}\n      </figure>'

def pie(parts, r=80):
    cx=cy=95; ang=-90; segs=[f'<svg viewBox="0 0 250 200" width="250" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfica de pastel de intención de voto">']
    fills=['#f4ecd8','#ede2c5','#e3d4b0','#d8c79c']
    segs.append('<defs><style>.sl{stroke:#4a3f33;stroke-width:1.2}.pl{font-family:\'IBM Plex Sans\',sans-serif;font-size:11px;font-weight:600;fill:#4a3f33}</style></defs>')
    for i,(lbl,pct) in enumerate(parts):
        a0=math.radians(ang); a1=math.radians(ang+pct*3.6)
        x0,y0=cx+r*math.cos(a0),cy+r*math.sin(a0); x1,y1=cx+r*math.cos(a1),cy+r*math.sin(a1)
        large=1 if pct>50 else 0
        segs.append(f'<path class="sl" fill="{fills[i%4]}" d="M{cx},{cy} L{x0:.1f},{y0:.1f} A{r},{r} 0 {large} 1 {x1:.1f},{y1:.1f} Z"/>')
        am=math.radians(ang+pct*1.8); lx,ly=cx+r*0.6*math.cos(am),cy+r*0.6*math.sin(am)
        segs.append(f'<text class="pl" x="{lx:.0f}" y="{ly:.0f}" text-anchor="middle">{lbl}={pct}%</text>')
        ang+=pct*3.6
    segs.append('</svg>'); return '\n        '.join(segs)

def isocube(x,y,u=13):
    # x,y = esquina superior izquierda de la cara frontal
    d=u*0.5
    return (f'<rect x="{x}" y="{y}" width="{u}" height="{u}" fill="#f4ecd8" stroke="#4a3f33" stroke-width="1"/>'
            f'<path d="M{x},{y} l{d},{-d} l{u},0 l{-d},{d} Z" fill="#ede2c5" stroke="#4a3f33" stroke-width="1"/>'
            f'<path d="M{x+u},{y} l{d},{-d} l0,{u} l{-d},{d} Z" fill="#e3d4b0" stroke="#4a3f33" stroke-width="1"/>')

def staircase():
    u=13; gap=18; s=['<svg viewBox="0 0 360 130" width="360" height="130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Serie de figuras de cubos en escalera: 1, 3, 6 y 10 cubos">']
    base=110; ox=14
    for term in range(1,5):
        cols=term
        for c in range(cols):              # columna c (0=izq) tiene altura term-c
            h=term-c
            for row in range(h):
                x=ox + c*u; y=base - (row+1)*u
                s.append(isocube(x,y,u))
        ox += cols*u + gap + term*3
    s.append('</svg>'); return '\n        '.join(s)

def prism():
    return ('<svg viewBox="0 0 220 230" width="220" height="230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Prisma de base trapezoidal: área de la base 150 centímetros cuadrados y altura 40 centímetros">'
            '<defs><style>.ln{stroke:#4a3f33;stroke-width:1.4;fill:none}.fc{fill:#f4ecd8;stroke:#4a3f33;stroke-width:1.4}.lbl{font-family:\'IBM Plex Sans\',sans-serif;font-size:13px;font-weight:600;fill:#4a3f33}</style></defs>'
            '<path class="fc" d="M40,40 L150,55 L150,200 L40,150 Z"/>'
            '<path class="fc" d="M40,40 L70,28 L180,43 L150,55 Z"/>'
            '<path class="fc" d="M150,55 L180,43 L180,188 L150,200 Z"/>'
            '<text class="lbl" x="20" y="30">150 cm²</text>'
            '<line class="ln" x1="196" y1="43" x2="196" y2="188"/>'
            '<line class="ln" x1="192" y1="43" x2="200" y2="43"/><line class="ln" x1="192" y1="188" x2="200" y2="188"/>'
            '<text class="lbl" x="202" y="120">40 cm</text>'
            '</svg>')

def plines(top_lbl, bot_lbl):
    return ('<svg viewBox="0 0 280 130" width="280" height="130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dos rectas paralelas cortadas por una transversal con dos ángulos marcados">'
            '<defs><style>.ln{stroke:#4a3f33;stroke-width:1.4}.ang{stroke:#6b3a2e;stroke-width:1.3;fill:none}.lbl{font-family:\'IBM Plex Sans\',sans-serif;font-size:13px;font-weight:600;fill:#6b3a2e}</style></defs>'
            '<line class="ln" x1="20" y1="42" x2="245" y2="42"/>'
            '<line class="ln" x1="20" y1="92" x2="245" y2="92"/>'
            '<line class="ln" x1="70" y1="120" x2="200" y2="14"/>'
            '<path class="ang" d="M150,42 A16,16 0 0 1 173,49"/>'
            '<path class="ang" d="M86,92 A16,16 0 0 1 110,86"/>'
            f'<text class="lbl" x="139" y="32" text-anchor="middle">{top_lbl}</text>'
            f'<text class="lbl" x="92" y="112" text-anchor="middle">{bot_lbl}</text>'
            '</svg>')

def insq():
    return ('<svg viewBox="0 0 180 170" width="180" height="170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cuadrado de 10 cm con un cuadrado inscrito que une los puntos medios de sus lados">'
            '<defs><style>.out{fill:none;stroke:#4a3f33;stroke-width:1.4}.inn{fill:#f4ecd8;stroke:#6b3a2e;stroke-width:1.4}.dot{fill:#4a3f33}.lbl{font-family:\'IBM Plex Sans\',sans-serif;font-size:12px;fill:#877b6c}</style></defs>'
            '<rect class="out" x="30" y="20" width="120" height="120"/>'
            '<polygon class="inn" points="90,20 150,80 90,140 30,80"/>'
            '<circle class="dot" cx="90" cy="20" r="2.5"/><circle class="dot" cx="150" cy="80" r="2.5"/><circle class="dot" cx="90" cy="140" r="2.5"/><circle class="dot" cx="30" cy="80" r="2.5"/>'
            '<text class="lbl" x="20" y="84" text-anchor="end">10 cm</text>'
            '<text class="lbl" x="124" y="58">x</text>'
            '</svg>')

def rtri():
    return ('<svg viewBox="0 0 200 170" width="200" height="170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Triángulo rectángulo con hipotenusa de 18 metros y un cateto de 11 metros">'
            '<defs><style>.ln{fill:#f4ecd8;stroke:#4a3f33;stroke-width:1.4}.lbl{font-family:\'IBM Plex Sans\',sans-serif;font-size:12px;fill:#4a3f33}.ra{fill:none;stroke:#4a3f33;stroke-width:1}</style></defs>'
            '<polygon class="ln" points="30,140 170,140 170,30"/>'
            '<rect class="ra" x="156" y="126" width="14" height="14"/>'
            '<text class="lbl" x="92" y="158" text-anchor="middle">cateto = ?</text>'
            '<text class="lbl" x="178" y="90">11 m</text>'
            '<text class="lbl" x="92" y="78" text-anchor="middle" transform="rotate(-38 92 78)">18 m</text>'
            '</svg>')

# ---------- render de items ----------
def P(pts): return f'{pts} pt' if pts==1 else f'{pts} pts'
def li(pts, body): return f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      {body}\n    </div></li>'
def q(pts, html): return (pts, li(pts, f'<p><span class="exam-pdf__points">{P(pts)}</span>{html}</p>'))
def qc(pts, html, choices):
    ch='\n'.join(f'        <li>{c}</li>' for c in choices)
    return (pts, li(pts, f'<p><span class="exam-pdf__points">{P(pts)}</span>{html}</p>\n      <ol class="exam-pdf__choices">\n{ch}\n      </ol>'))
def qs(pts, html, subs):
    sb='\n'.join(f'        <li>{c}</li>' for c in subs)
    return (pts, li(pts, f'<p><span class="exam-pdf__points">{P(pts)}</span>{html}</p>\n      <ol class="exam-pdf__sublist">\n{sb}\n      </ol>'))
def qf(pts, html, svg, subs=None):
    body=f'<p><span class="exam-pdf__points">{P(pts)}</span>{html}</p>'
    if subs:
        sb='\n'.join(f'        <li>{c}</li>' for c in subs); body+=f'\n      <ol class="exam-pdf__sublist">\n{sb}\n      </ol>'
    body+=f'\n      {fig(svg)}'
    return (pts, li(pts, body))
def cases(a,b): return r'$\begin{cases}'+a+r'\\'+b+r'\end{cases}$'

S_GRAPH=['La distancia total recorrida','El desplazamiento total','La velocidad media en el intervalo de $0$ a $2\\,\\mathrm{s}$','La velocidad media en el intervalo de $8$ a $10\\,\\mathrm{s}$','La velocidad media en el intervalo de $14$ a $16\\,\\mathrm{s}$']
X16=[0,2,4,6,8,10,12,14,16]

def page(title, eyebrow, hero, desc, instr, secs):
    # secs = [(section_title, [items])]; calcula total
    total=sum(p for _,items in secs for p,_ in items)
    body=[]
    first=True
    for st,items in secs:
        cls='exam-pdf__section exam-pdf__section--first' if first else 'exam-pdf__section'
        style='' if first else ' style="page-break-before: always;"'
        first=False
        body.append(f'  <section class="{cls}"{style}>\n    <h2 class="exam-pdf__section-title">{st}</h2>\n  </section>\n  <ol class="exam-pdf__exercises">')
        body+= [h for _,h in items]
        body.append('  </ol>')
    body='\n'.join(body)
    return f'''<!DOCTYPE html>
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
    <p class="exam-pdf__eyebrow">{eyebrow}</p>
    <h1 class="exam-pdf__title">{hero}</h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · {desc} · versión alumno</p>
  </header>
  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>{instr}</p>
  </div>
{body}
  <div class="exam-pdf__total">
    <span class="exam-pdf__total-label">Total de puntos</span>
    <span class="exam-pdf__total-value">{total}</span>
  </div>
</main>
<script>
  document.addEventListener('DOMContentLoaded', () => {{ if (window.ClasesKatex) window.ClasesKatex.load(); }});
</script>
</body>
</html>
'''

INSTR='Resuelve cada ejercicio. Todas las respuestas deben estar simplificadas y encerradas.'

# ===================== Examen 1 Física (zip examen-1-f) =====================
f1=[
 qs(2,r'Un automóvil recorre $180\,\mathrm{km}$ en $2$ horas.',[r'Calcula su velocidad en $\mathrm{km/h}$.',r'¿Qué distancia recorrería en $5$ horas a esa misma velocidad?']),
 qs(2,r'Un objeto parte del reposo y alcanza $28\,\mathrm{m/s}$ en $7$ segundos con aceleración constante. Calcula:',['La aceleración del objeto.','La distancia recorrida en ese tiempo.']),
 q(1,r'Se lanza una pelota verticalmente hacia arriba con velocidad inicial de $30\,\mathrm{m/s}$. Calcula la altura máxima que alcanza. ($g=10\,\mathrm{m/s^2}$)'),
 q(1,r'Explica con tus propias palabras la <strong>tercera ley de Newton</strong>.'),
 q(1,r'Un cuerpo de masa $12\,\mathrm{kg}$ acelera a $5\,\mathrm{m/s^2}$. ¿Cuál es la fuerza neta que actúa sobre él?'),
 q(1,r'Se aplica una fuerza constante de $20\,\mathrm{N}$ y se realiza un trabajo de $300\,\mathrm{J}$. ¿Qué distancia recorre el objeto?'),
 qf(5,r'De acuerdo con la gráfica mostrada, calcula:',chart([(0,50),(2,10),(4,-10),(6,-20),(8,50),(10,20),(12,-10),(14,-20),(16,50)],0,16,-25,55,X16,[-20,-10,0,10,20,30,40,50],'Posición [m]'),
    subs=['La distancia total recorrida.','El desplazamiento total.',r'La velocidad media en el intervalo de $0$ a $2\,\mathrm{s}$.',r'La velocidad media en el intervalo de $8$ a $10\,\mathrm{s}$.',r'La velocidad media en el intervalo de $14$ a $16\,\mathrm{s}$.']),
 q(1,r'¿A qué altura debe ascender una persona de $80\,\mathrm{kg}$ para que su energía potencial sea $12\,000\,\mathrm{J}$? ($g=10\,\mathrm{m/s^2}$)'),
 q(1,r'Una pelota de béisbol de masa $0.4\,\mathrm{kg}$ se lanza a $30\,\mathrm{m/s}$. ¿Cuál es su energía cinética?'),
 q(1,r'Calcula la potencia de una máquina que realiza $720\,\mathrm{J}$ en $30$ segundos.'),
 q(1,r'Calcula la cantidad de movimiento de un cuerpo de masa $9\,\mathrm{kg}$ moviéndose a $6\,\mathrm{m/s}$.'),
 q(1,r'¿Cuáles son las unidades de la fuerza en el Sistema Internacional?'),
 q(1,r'La rapidez es la magnitud de…'),
 qc(1,r'En virtud de su posición elevada, el agua de una presa tiene energía potencial que puede mover un generador, el cual transforma la energía mecánica del agua en energía:',['Calorífica.','Química.','Eléctrica.','Térmica.']),
 q(1,r'Un resistor de valor desconocido deja pasar una corriente de $2\,\mathrm{A}$ cuando se le aplica una diferencia de potencial de $200\,\mathrm{V}$. ¿Cuál es su resistencia?'),
 qc(1,r'Una corriente eléctrica siempre genera un:',['Campo eléctrico.','Campo gravitatorio.','Campo magnético.','Campo térmico.']),
 q(1,r'Menciona una de las tres formas de electrizar un cuerpo.'),
 q(1,r'Escribe la fórmula de la densidad.'),
 q(1,r'Determina la fuerza que debe aplicarse sobre un área de $0.5\,\mathrm{m^2}$ para generar una presión de $200\,\mathrm{Pa}$.'),
 q(1,r'Calcula la magnitud de la fuerza que se obtendrá en el pistón mayor de una prensa hidráulica de área $36\,\mathrm{cm^2}$, si en el pistón menor de área $4\,\mathrm{cm^2}$ se ejerce una fuerza de $160\,\mathrm{N}$.'),
 qc(1,r'Al ascender desde el nivel del mar hasta la cima de una montaña, la presión atmosférica:',['Aumenta.','Disminuye.','Permanece constante.','Se invierte.']),
 qc(1,r'¿Cuál es la diferencia entre la velocidad y la rapidez?',['La velocidad es un vector y la rapidez es un escalar.','La rapidez mide la relación velocidad–tiempo mientras que la velocidad es la relación distancia–tiempo.','La rapidez mide la aceleración mientras que la velocidad es la relación entre distancia y tiempo.','La velocidad es un escalar y la rapidez es un vector.']),
 qc(1,r'Si se aplica una fuerza de $12\,\mathrm{N}$ a un balón de $3\,\mathrm{kg}$ de masa, originalmente en reposo, su aceleración será de:',[r'$2\,\mathrm{m/s^2}$',r'$3\,\mathrm{m/s^2}$',r'$4\,\mathrm{m/s^2}$',r'$6\,\mathrm{m/s^2}$']),
 qc(1,r'La resultante $R$ de las fuerzas que actúan sobre una lámpara en equilibrio sostenida por dos cables es:',['menor a cero.','igual a cero.','igual a la aceleración de la lámpara.','mayor a cero.']),
 qc(1,r'Cuando caminas sobre una alfombra (originalmente neutra) con tenis y ropa de nylon, adquieres carga eléctrica principalmente por:',['frotamiento.','conducción.','inducción.','contacto.']),
 qc(1,r'La aguja de la brújula apunta siempre al norte porque:',['en el polo norte hay mayor fuerza.','en el polo norte hay mayor cantidad de hierro.','en el polo norte el magnetismo es más intenso.','la aguja se alinea con el campo magnético de la Tierra.']),
 qc(1,r'Elige la opción que define correctamente la diferencia entre calor y temperatura, a nivel macroscópico.',['La temperatura es la sensación de calor o frío, mientras que el calor es lo que mide el termómetro.','La temperatura es lo que mide el termómetro, mientras que el calor es la energía no mecánica que se transfiere de un cuerpo de mayor a uno de menor temperatura.','El termómetro mide la temperatura, mientras que el calor es la sensación de calor o frío entre dos cuerpos.','El calor es lo que mide el termómetro, mientras que la temperatura es la energía que se transfiere entre dos cuerpos en contacto.']),
 qc(1,r'El movimiento ondulatorio es un proceso por medio del cual se transmite:',['energía.','átomos.','moléculas.','partículas.']),
 qc(1,r'¿Qué color de la luz visible tiene mayor longitud de onda?',['Amarillo.','Verde.','Azul.','Rojo.']),
]
open('examenes-pdf/examen-01-fisica.html','w').write(page(
 'Examen 1 — Física','Evaluación · ECOEMS · Física','Examen 1 — <em>Física</em>','Mecánica, electricidad, fluidos, calor y ondas',INSTR,[('Física',f1)]))

# ===================== Examen 1 Matemáticas (zip examen-1-m) =====================
m1=[
 q(1,r'Calcula el mínimo común múltiplo de $14$ y $18$.'),
 q(1,r'$\dfrac{4}{10}-\dfrac{1}{15}-\dfrac{11}{30} =$'),
 q(1,r'Al sumar el triple de un número con su cuarta parte se obtiene $53$. ¿Cuál es ese número?'),
 q(1,r'Un taxista cobra $\$18$ al ser abordado y luego $\$3$ por cada $80\,\mathrm{m}$ recorridos. ¿Cuánto cobrará por un recorrido de $12\,\mathrm{km}$?'),
 q(1,r'Cinco obreros construyen un muro en $8$ días. ¿En cuántos días lo harán ocho obreros?'),
 q(1,r'Expande: $(3a-4b)(5a+6b) =$'),
 q(1,r'Expande: $(2x-4y)^2 =$'),
 q(1,r'Expande: $(4m+5n)(4m-5n) =$'),
 q(1,r'Expande: $(x-17)(x-5) =$'),
 q(1,r'Factoriza: $18x^3y^2-27x^2y^3+36xy^4 =$'),
 q(1,r'Factoriza: $81z^2-25 =$'),
 q(1,r'Factoriza: $x^2-14x+45 =$'),
 q(1,r'Resuelve: $6(x+2)-5(x-3)=3x+7$'),
 q(2,r'Resuelve el sistema: '+cases('3x + 4y &= 18','5x - 2y &= 4')),
 q(1,r'Resuelve: $2x^2-8x=-6$'),
 q(3,r'Los puntajes de $12$ estudiantes fueron: $6,7,8,7,9,10,8,6,7,9,8,7$. Calcula la media, la mediana y la moda.'),
 q(1,r'Andrés obtuvo $78$, $85$, $90$ y $82$ en sus primeros cuatro exámenes, y $x$ en el quinto. Si su promedio es $85$, ¿qué calificación obtuvo en el último?'),
 q(1,r'En una urna hay $5$ bolas rojas, $4$ azules y $3$ verdes. Si se extrae una al azar, ¿cuál es la probabilidad de que no sea azul?'),
 q(1,r'Halla el duodécimo término de la sucesión: $5, 8, 11, 14, \dots$'),
 qf(1,r'En un cuadrado de lado $10\,\mathrm{cm}$ se inscribe otro cuadrado que apoya sus vértices en los puntos medios de los lados del mayor. Calcula el perímetro del cuadrado menor. (Sólo una cifra decimal.)',insq()),
 q(1,r'Calcula el área de un pentágono de lado $9\,\mathrm{cm}$ y apotema de $8\,\mathrm{cm}$.'),
 qf(1,r'Halla el valor de $x$ en la figura de líneas paralelas:',plines('120°','6x − 30')),
 q(1,r'Escribe una fracción equivalente a $\dfrac{45}{39}$.'),
 q(1,r'Soluciona la ecuación: $\dfrac{1}{2}m-\dfrac{1}{4}=2-\dfrac{1}{4}m$.'),
 q(1,r'En una caja de $600$ focos, $30$ están rotos. ¿Cuál es el porcentaje de focos rotos?'),
 qf(1,r'La gráfica muestra los resultados de una encuesta de intención de voto de cuatro partidos. Si los encuestados fueron $120$, ¿cuántos votaron por el partido PD?',pie([('PA',18),('PB',31),('PC',36),('PD',15)])),
 qf(1,r'¿Cuál es el número de cubos que tiene el octavo término de la serie?',staircase()),
 q(2,r'¿Cuáles son los $2$ términos que continúan la serie? $7, 3, 13, 10, 19, 17, 25, \dots$'),
 q(1,r'Se sabe que en una población una de cada ocho personas es niño. Si en una fiesta hay $400$ personas, ¿cuántos niños están reunidos?'),
 qf(1,r'Calcula el volumen de un lingote de oro con forma de prisma de $40\,\mathrm{cm}$ de altura, cuya base es un trapecio de área $150\,\mathrm{cm^2}$.',prism()),
]
open('examenes-pdf/examen-01-mate.html','w').write(page(
 'Examen 1 — Matemáticas','Evaluación · ECOEMS · Matemáticas','Examen 1 — <em>Matemáticas</em>','Aritmética, álgebra, geometría, estadística y probabilidad',
 'Resuelve cada ejercicio. Todas las respuestas deben estar simplificadas y encerradas en un círculo.',[('Matemáticas',m1)]))

# ===================== Examen 2 Matemáticas (zip examen-2-m) =====================
m2=[
 q(1,r'Calcula el mínimo común múltiplo de $18$ y $24$.'),
 q(1,r'$\dfrac{1}{8}+\dfrac{1}{4}-\dfrac{1}{16} =$'),
 q(1,r'Al sumar el triple de un número con su cuarta parte se obtiene $78$. ¿Cuál es ese número?'),
 q(1,r'Un conductor de mototaxi cobra $\$25$ al subir y luego $\$4$ por cada $200\,\mathrm{m}$ recorridos. ¿Cuánto cobrará por un recorrido de $8\,\mathrm{km}$?'),
 q(1,r'Seis obreros elaboran un pastel en $10$ horas. ¿En cuántas horas lo elaborarán quince obreros?'),
 q(1,r'$(7a-4b)(5a+3b) =$'),
 q(1,r'$(3x-4y)^2 =$'),
 q(1,r'$(8m+3n)(8m-3n) =$'),
 q(1,r'$(t-18)(t-5) =$'),
 q(1,r'$40x^3y^2-60x^2y^3+80xy^4 =$'),
 q(1,r'$144z^2-25 =$'),
 q(1,r'$x^2-16x+64 =$'),
 q(1,r'Resuelve para $x$: $11(x-2)-5(x+3)=4x+7$'),
 q(2,r'Resuelve el sistema: '+cases('3x + 4y &= 22','5x - 2y &= 28')),
 q(1,r'Resuelve: $x^2-5x=-6$'),
 q(3,r'Los puntajes de $10$ estudiantes fueron: $6, 8, 9, 8, 7, 7, 10, 9, 8, 6$. Calcula la media, la mediana y la moda.'),
 q(1,r'En una urna hay $4$ bolas rojas, $12$ azules y $5$ verdes. Si se extrae una al azar, ¿qué probabilidad hay de que sea roja o verde?'),
 q(1,r'Halla el noveno término de la sucesión: $4, 9, 14, 19, \dots$'),
 q(1,r'Calcula el área de un hexágono regular de lado $8\,\mathrm{cm}$ y apotema $6\,\mathrm{cm}$.'),
 qf(1,r'Halla el valor de $x$ en la figura de líneas paralelas:',plines('75°','4x + 15')),
 q(1,r'Escribe una fracción equivalente y más pequeña que $\dfrac{54}{72}$.'),
 q(1,r'Resuelve para $m$: $\dfrac{2}{3}m+2=6-\dfrac{1}{3}m$.'),
 q(1,r'En un huerto hay $300$ manzanas, $45$ están maduras. ¿Qué porcentaje está maduro?'),
 q(2,r'¿Cuáles son los dos términos que siguen a la serie? $12, 8, 16, 12, 20, 16, \dots$'),
 q(1,r'En un almacén hay $480$ paquetes, de los cuales $1$ de cada $8$ está dañado. ¿Cuántos están dañados?'),
 q(1,r'Calcula el volumen de un prisma de altura $25\,\mathrm{cm}$ y base pentagonal de área $120\,\mathrm{cm^2}$.'),
 qc(1,r'La suma de un número con el triple de otro es $24$; y la diferencia del primero con el doble del segundo es $4$. ¿Cuáles son esos números?',['$12$ y $4$','$14$ y $2$','$8$ y $8$','$13$ y $4$']),
 qc(1,r'Resultado de la operación $(-10)(4)(-3)(2)(-1)$:',['$-360$','$-240$','$0$','$180$']),
 qc(1,r'Si Marta tiene $x$ años, Sofía la tercera parte de Marta, Tomás el doble de Sofía y Ana la mitad de Sofía, ¿cuánto suman las edades de los cuatro?',[r'$2x$',r'$\tfrac{9}{6}x$',r'$\tfrac{13}{6}x$',r'$3x$']),
 qc(1,r'Las calificaciones de Luisa son: Matemáticas $9$, Física $8$, Español $7$, Biología $6$, Historia $10$ e Inglés $7$. ¿Cuál es su media?',['$7$','$7.833$','$8$','$9$']),
 qc(1,r'Determina el área de un rectángulo de $13.2\,\mathrm{cm}$ de largo y $6.4\,\mathrm{cm}$ de ancho.',[r'$84.48\,\mathrm{cm^2}$',r'$82.24\,\mathrm{cm^2}$',r'$80.00\,\mathrm{cm^2}$',r'$85.28\,\mathrm{cm^2}$']),
 qc(1,r'¿Cuál es el volumen de un cubo de $8\,\mathrm{cm}$ de lado?',[r'$512\,\mathrm{cm^3}$',r'$256\,\mathrm{cm^3}$',r'$128\,\mathrm{cm^3}$',r'$343\,\mathrm{cm^3}$']),
]
open('examenes-pdf/examen-02-mate.html','w').write(page(
 'Examen 2 — Matemáticas','Evaluación · ECOEMS · Matemáticas','Examen 2 — <em>Matemáticas</em>','Aritmética, álgebra, geometría, estadística y probabilidad',
 'Resuelve cada ejercicio. Todas las respuestas deben estar simplificadas y encerradas en un círculo.',[('Matemáticas',m2)]))

# ===================== Examen 13 (zip examen12) =====================
e13m=[
 q(1,r'Si de $3$ varillas de hierro saco $75$ tornillos, ¿cuántos tornillos saldrán de $7$ varillas del mismo tamaño?'),
 q(1,r'Si la suma de tres números consecutivos es $63$, halla el número más grande.'),
 q(1,r'$\dfrac{2}{6}+\dfrac{8}{12}-\dfrac{10}{20} =$'),
 q(1,r'Encuentra el valor de $x$: $4x+5-2(x+3)=3[2x-(x+4)]$'),
 q(1,r'Factoriza $x^2+4x-32 =$'),
 q(1,r'Una urna contiene $6$ bolas amarillas, $8$ rojas y $10$ verdes. Si se extrae una al azar, ¿cuál es la probabilidad de obtener una amarilla?'),
 q(3,r'Halla la media, moda y mediana del conjunto: $\{6,8,8,5,7,5,9,4,7,3,5\}$.'),
 q(1,r'Determina el siguiente término de la sucesión: $1, 8, 27, 64, 125, \dots$'),
 q(1,r'$(-2)(-1)(3)(10)(3)(-4)(-1)(1) =$'),
 q(1,r'$(6x-1)^2 =$'),
 q(1,r'Calcula el área de un rectángulo de base $16\,\mathrm{m}$ y altura $11\,\mathrm{m}$.'),
 q(1,r'Obtén el mínimo común múltiplo de $16$ y $48$.'),
 q(1,r'Un automóvil tarda $8$ horas en cierto recorrido a $100\,\mathrm{km/h}$. ¿Cuánto tardaría a $160\,\mathrm{km/h}$?'),
 q(1,r'$(x-4)(x-8) =$'),
 q(1,r'Factoriza $25x^2-16 =$'),
 q(2,r'Encuentra los dos valores de $x$: $2x^2=5x+25$'),
 q(1,r'Si el promedio de $3$, $10$, $x$, $6$ y $5$ es $7.2$, ¿cuál es el valor de $x$?'),
 q(2,r'Encuentra el valor de $x$ y $y$: '+cases('x + 2y &= -4','3x - 5y &= -1')),
 qf(1,r'Dado el triángulo rectángulo con hipotenusa de $18\,\mathrm{m}$ y un cateto de $11\,\mathrm{m}$, calcula la longitud del otro cateto.',rtri()),
 qf(1,r'Halla el valor de $x$ en la figura de líneas paralelas:',plines('100°','2x + 20')),
]
e13f=[
 q(1,r'Convierte $456\,\mathrm{dam}$ a $\mathrm{dm}$.'),
 q(3,r'Nombra las $3$ formas de electrizar un cuerpo.'),
 q(3,r'Nombra las $3$ formas de propagación del calor.'),
 q(1,r'Un tren tarda $60\,\mathrm{s}$ en atravesar un túnel de $1\,200\,\mathrm{m}$ de longitud. ¿Cuál es la velocidad del tren?'),
 q(1,r'Un corredor lleva un ritmo constante de $25\,\mathrm{m/s}$ y tarda $2$ minutos $10$ segundos en dar la vuelta al estadio. ¿Cuál es la longitud de la pista?'),
 q(1,r'Escribe la fórmula de la segunda ley de Newton.'),
 q(1,r'Determina la masa de un cuerpo cuyo peso es de $767\,\mathrm{N}$.'),
 q(3,r'Nombra las $3$ cualidades del sonido.'),
 q(1,r'Menciona los dos tipos de ondas que existen.'),
 q(2,r'Menciona un material conductor eléctrico y otro aislante eléctrico.'),
 q(1,r'Despeja $m$ en la ecuación $E_c=\dfrac{mv^2}{2}$.'),
 q(1,r'¿Qué trabajo se realiza con una fuerza de $40\,\mathrm{N}$ al desplazar un objeto $16\,\mathrm{m}$?'),
 q(1,r'¿Cuál es la energía cinética de un balón que pesa $24\,\mathrm{N}$ y lleva una velocidad de $10\,\mathrm{m/s}$?'),
 q(1,r'¿Qué dice la tercera ley de Newton?'),
 qf(5,r'De acuerdo con la gráfica mostrada, calcula:',chart([(0,-100),(2,50),(4,-50),(6,-50),(8,100),(10,100),(12,-100),(14,150),(16,150)],0,16,-200,200,X16,[-150,-100,-50,0,50,100,150],'Posición [m]'),
    subs=['La distancia total','El desplazamiento total','La velocidad en el periodo de 6 a 8 segundos','La velocidad en los 2 primeros segundos','La velocidad en el periodo de 12 a 14 segundos']),
]
open('examenes-pdf/examen-13.html','w').write(page(
 'Examen 13','Evaluación · ECOEMS','Examen 13 — <em>Matemáticas y Física</em>','Examen combinado',INSTR,[('Matemáticas',e13m),('Física',e13f)]))
print('Bloque 13: examen-01-fisica, examen-01-mate, examen-02-mate, examen-13 escritos')
