#!/usr/bin/env python3
import sys
sys.argv=['x']
exec(open('migrar/generadores/gen_examenes.py').read().split('# =====================')[0])  # reusa chart() y build()

def gq(coords, xmax, xticks, subs):
    sub='\n'.join(f'        <li>{t}</li>' for t in subs)
    svg=chart(coords,0,xmax,-200,200,xticks,[-150,-100,-50,0,50,100,150],'Posición [m]')
    html=('<p><span class="exam-pdf__points">5 pts</span>De acuerdo con la gráfica mostrada, calcula:</p>\n'
          f'      <ol class="exam-pdf__sublist">\n{sub}\n      </ol>\n'
          f'      <figure class="exam-pdf__figure">\n        {svg}\n      </figure>')
    return ('g', 5, html)

def q(pts, html): return ('q', pts, html)

def build2(num, fecha, mate, fisica):
    total = sum(p for _,p,_ in mate) + sum(p for _,p,_ in fisica)
    def render(lst):
        out=[]
        for kind,pts,html in lst:
            if kind=='g':
                out.append(f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      {html}\n    </div></li>')
            else:
                p=f'{pts} pt' if pts==1 else f'{pts} pts'
                out.append(f'    <li class="exam-pdf__exercise"><div class="exam-pdf__body">\n      <p><span class="exam-pdf__points">{p}</span>{html}</p>\n    </div></li>')
        return '\n'.join(out)
    full = build(num, fecha, [], [], total)
    full = full.replace('  <ol class="exam-pdf__exercises">\n\n  </ol>\n\n  <section class="exam-pdf__section" style="page-break-before: always;">',
                        '  <ol class="exam-pdf__exercises">\n'+render(mate)+'\n  </ol>\n\n  <section class="exam-pdf__section" style="page-break-before: always;">')
    full = full.replace('  <ol class="exam-pdf__exercises">\n\n  </ol>\n\n  <div class="exam-pdf__total">',
                        '  <ol class="exam-pdf__exercises">\n'+render(fisica)+'\n  </ol>\n\n  <div class="exam-pdf__total">')
    return full

X24=[0,3,6,9,12,15,18,21,24]; X16=[0,2,4,6,8,10,12,14,16]
S24=['La distancia total','El desplazamiento total','La velocidad en el periodo de 6 a 9 segundos','La velocidad en los 3 primeros segundos','La velocidad en el periodo de 15 a 18 segundos']

def cases(a,b): return r'$\begin{cases}'+a+r'\\'+b+r'\end{cases}$'

# ===== Examen 5 =====
e5m=[q(1,r'$-12-18-23+45+15 =$'),q(1,r'Obtén el mínimo común múltiplo de $16$ y $36$.'),
 q(1,r'$\dfrac{1}{18}+\dfrac{5}{60}+\dfrac{3}{6} =$'),q(1,r'Factoriza $16m^6-25x^2 =$'),
 q(1,r'Por cada $24\,\mathrm{kg}$ de aceitunas se obtienen $6$ litros de aceite. ¿Cuántos litros de aceite se obtendrán con $96\,\mathrm{kg}$?'),
 q(1,r'Factoriza $x^2+x-20 =$'),q(1,r'$(x-3)^2 =$'),
 q(1,r'$6$ máquinas excavadoras hacen una zanja en $18$ días. Si se averían $2$ excavadoras, ¿cuánto tardarán en abrir la zanja?'),
 q(1,r'$(x-4)(x+5) =$'),q(1,r'Encuentra el valor de $x$: $\dfrac{x}{2}-3=-14+6x$'),
 q(2,r'Encuentra los dos valores de $x$: $2x^2+2x=40$'),
 q(2,r'Encuentra el valor de $x$ y $y$: '+cases('-2x + y &= -7','5x + 2y &= 13')),]
e5f=[q(1,r'Despeja $a$ en la ecuación $v_f^2 = v_0^2+2ad$.'),q(1,r'Convierte $10\,\mathrm{m/s}$ a $\mathrm{km/h}$.'),
 gq([(0,100),(3,100),(6,-150),(9,100),(12,100),(15,150),(18,150),(21,-100),(24,100)],24,X24,S24),
 q(1,r'Un móvil que lleva una velocidad de $10\,\mathrm{m/s}$ acelera a razón de $2\,\mathrm{m/s^2}$. Calcula la velocidad final del primer minuto.'),
 q(1,r'Un astronauta en la Luna arroja un objeto verticalmente hacia arriba con una velocidad inicial de $8\,\mathrm{m/s}$. El objeto tardó $5$ segundos en alcanzar el punto más alto. Calcula el valor de la gravedad en la Luna. <strong>(Resultado en decimales, sin calculadora: con la operación escrita en la hoja.)</strong>'),
 q(1,r'A un cuerpo de masa $1\,700$ gramos se le aplica una fuerza de $3.4\,\mathrm{N}$. Calcula el valor de su aceleración.'),]
open('examenes-pdf/examen-05.html','w').write(build2('5','Quinto fin de semana del curso',e5m,e5f))

# ===== Examen 6 =====
e6m=[q(2,r'Encuentra el valor de $x$ y $y$: '+cases('3x - 4y &= 6','5x + 6y &= -28')),
 q(1,r'En $5$ días, $3$ alumnos vendieron $930$ paletas. ¿Cuántos días tienen que dedicar para vender $2\,790$ paletas?'),
 q(1,r'$\dfrac{1}{4}+\dfrac{6}{60}+\dfrac{12}{18} =$'),q(1,r'Encuentra el valor de $x$: $16-2x-15=3x+21$'),
 q(1,r'Factoriza $10m^2-9m-9 =$'),q(1,r'$-28+31-35+27-40 =$'),q(1,r'$(2x+6)^2 =$'),
 q(1,r'Obtén el mínimo común múltiplo de $18$ y $42$.'),
 q(1,r'Nueve trabajadores cargan un camión en $2$ horas. ¿Cuánto tardan seis trabajadores?'),
 q(1,r'$(x+12)(x+8) =$'),q(1,r'Halla el número tal que, si sumamos su mitad con su doble y su triple, obtenemos $55$.'),
 q(1,r'Factoriza $49x^2-16y^4 =$'),q(2,r'Encuentra los dos valores de $x$: $x^2+10=2x+90$'),]
e6f=[q(1,r'Despeja $a$ en la ecuación $\dfrac{F}{a}=m$.'),q(1,r'Convierte $514.46\,\mathrm{dm}$ a $\mathrm{hm}$.'),
 gq([(0,-50),(3,-100),(6,0),(9,150),(12,-50),(15,0),(18,-150),(21,100),(24,50)],24,X24,S24),
 q(1,r'La velocidad del sonido en el aire es $340\,\mathrm{m/s}$. Desde que se produjo el relámpago hasta que se oyó el trueno transcurrieron $8\,\mathrm{s}$. ¿A qué distancia se produjo la descarga eléctrica?'),
 q(1,r'Lanzamos verticalmente hacia arriba un cuerpo a $20\,\mathrm{m/s}$. Calcula cuánto tiempo le cuesta llegar al punto más alto.'),
 q(1,r'¿Cuánto pesa un hombre que tiene una masa de $70\,\mathrm{kg}$?'),
 q(1,r'Un cuerpo se desplaza $62\,\mathrm{m}$ con un trabajo de $310\,\mathrm{J}$. ¿Con qué fuerza se empuja?'),]
open('examenes-pdf/examen-06.html','w').write(build2('6','Sexto fin de semana del curso',e6m,e6f))

# ===== Examen 7 (zip examen7; título interno "Examen 8") =====
S16_7=['La distancia total','El desplazamiento total','La velocidad en el periodo de 6 a 8 segundos','La velocidad en los 2 primeros segundos','La velocidad en el periodo de 12 a 14 segundos']
e7m=[q(2,r'Encuentra el valor de $x$ y $y$: '+cases('x - 3y &= 13','5x + 4y &= 27')),
 q(1,r'En una panadería, con $80$ kilos de harina hacen $120$ kilos de pan. ¿Cuántos kilos de harina serían necesarios para hacer $99$ kilos de pan?'),
 q(1,r'$\dfrac{16}{20}+\dfrac{12}{36}-\dfrac{8}{32} =$'),q(1,r'Encuentra el valor de $x$: $3x+(-7x+11)=-5x+8$'),
 q(1,r'Factoriza $x^2-4x-96 =$'),q(1,r'$\dfrac{(4)(-12)(3)(1)(3)(-4)(-1)}{16} =$'),
 q(1,r'$(5m^3-6n)^2 =$'),q(1,r'Obtén el mínimo común múltiplo de $14$ y $42$.'),
 q(1,r'Una piscina portátil tardó en llenarse seis horas usando cuatro grifos iguales. ¿Cuántos grifos iguales serían necesarios para llenarla en $3$ horas?'),
 q(1,r'$(x+5)(x-15) =$'),q(1,r'Una finca rectangular cuyo largo es cinco veces su ancho tiene un perímetro de $480\,\mathrm{m}$. Halla su área.'),
 q(1,r'Factoriza $81x^2-100y^4 =$'),q(2,r'Encuentra los dos valores de $x$: $2x^2+x=21$'),
 q(3,r'Halla la media, moda y mediana del conjunto: $\{2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7\}$.'),]
e7f=[q(1,r'Despeja $t$ en la ecuación $P=\dfrac{T}{t}$.'),q(1,r'Convierte $458.45\,\mathrm{km}$ a $\mathrm{dam}$.'),
 gq([(0,150),(2,50),(4,-100),(6,50),(8,-150),(10,-150),(12,-150),(14,100),(16,0)],16,X16,S16_7),
 q(1,r'¿Qué distancia recorrerá en línea recta un avión que se desplaza a $600\,\mathrm{km/h}$, durante un tiempo de $1$ hora $15$ minutos?'),
 q(1,r'Un cuerpo cae libremente tardando $10$ segundos en llegar al suelo. ¿Desde qué altura se dejó caer?'),
 q(1,r'Determina la magnitud de la aceleración de un objeto de masa $120\,\mathrm{kg}$ que recibe una fuerza de $720\,\mathrm{N}$.'),
 q(1,r'Un coche circula a $72\,\mathrm{km/h}$ y tiene una masa de $500\,\mathrm{kg}$. ¿Cuánta energía cinética posee?'),
 q(1,r'Determina el valor de la velocidad que lleva un cuerpo de masa $4\,\mathrm{kg}$ si su energía cinética es de $200\,\mathrm{J}$.'),
 q(1,r'¿Qué dice la primera ley de Newton?'),
 q(1,r'Calcula la potencia de una máquina que realiza un trabajo de $540\,\mathrm{J}$ en un minuto y medio.'),
 q(3,r'Nombra las $3$ formas de propagación del calor.'),]
open('examenes-pdf/examen-07.html','w').write(build2('7','Séptimo fin de semana del curso',e7m,e7f))

# ===== Examen 8 =====
S16_8=['La distancia total','El desplazamiento total','La velocidad en el periodo de 6 a 8 segundos','La velocidad en los 2 primeros segundos','La velocidad en el periodo de 10 a 12 segundos']
e8m=[q(2,r'Encuentra el valor de $x$ y $y$: '+cases('-3x + 5y &= 2','5x - 2y &= -16')),
 q(1,r'Un autobús tarda $1$ hora en su trayecto a $80\,\mathrm{km/h}$. Si aumenta la velocidad a $100\,\mathrm{km/h}$, ¿cuántos <strong>minutos</strong> tardará?'),
 q(1,r'$\dfrac{5}{30}+\dfrac{18}{24}-\dfrac{28}{32} =$'),q(1,r'Encuentra el valor de $x$: $3x+(-7x+11)=-5x+8$'),
 q(1,r'Factoriza $x^2-13x+42 =$'),q(1,r'$-30+12-50+2-13 =$'),q(1,r'$(4)(-12)(3)(1)(3)(-4)(0)(6) =$'),
 q(1,r'$(3x^5-2y^2)^2 =$'),q(1,r'Obtén el mínimo común múltiplo de $6$ y $33$.'),
 q(1,r'El precio por kilo de queso azul es de $\$88$. ¿Cuánto costarán $125\,\mathrm{g}$ de queso?'),
 q(1,r'$(x-8)(x-15) =$'),
 q(1,r'El hermano mayor de una familia con tres hermanos tiene $4$ años más que el mediano, y el mediano $3$ años más que el menor. Si entre todos tienen la edad del padre, que tiene $40$ años, ¿qué edad tiene el mediano?'),
 q(1,r'Factoriza $49x^2-289y^6 =$'),q(2,r'Encuentra los dos valores de $x$: $12x^2+7x=12$'),
 q(3,r'Halla la media, moda y mediana del conjunto: $\{4, 8, 12, 12, 16, 20, 20, 20, 24, 28, 32, 36, 36, 40, 44\}$.'),]
e8f=[q(1,r'Despeja $\lambda$ en la ecuación $v=\dfrac{\lambda}{T}$.'),q(1,r'Convierte $72\,\mathrm{km/h}$ a $\mathrm{m/s}$.'),
 gq([(0,-100),(2,50),(4,50),(6,50),(8,-150),(10,-150),(12,-150),(14,100),(16,-100)],16,X16,S16_8),
 q(1,r'La carrera de maratón consta de $42\,\mathrm{km}$ aproximadamente. Un corredor tarda $2$ horas y $40$ minutos en llegar. ¿Cuál ha sido su velocidad media?'),
 q(1,r'Un cuerpo parte del reposo con aceleración constante de $14\,\mathrm{m/s^2}$. Calcula la velocidad que tiene al cabo de $8$ segundos.'),
 q(1,r'Determina la masa de un cuerpo cuyo peso es de $350\,\mathrm{N}$.'),
 q(3,r'Nombra las $3$ cualidades del sonido.'),
 q(1,r'¿Qué trabajo se realiza con una fuerza de $7.7\,\mathrm{N}$ al desplazar un objeto $200\,\mathrm{cm}$?'),
 q(1,r'¿Cuál es la energía cinética de un balón que pesa $4.5\,\mathrm{N}$ y lleva una velocidad de $15\,\mathrm{m/s}$?'),
 q(1,r'¿Qué dice la tercera ley de Newton?'),
 q(1,r'Calcula la potencia de una máquina que realiza un trabajo de $540\,\mathrm{J}$ en un minuto y medio.'),
 q(3,r'Nombra las $3$ formas de propagación del calor.'),
 q(1,r'Calcula el periodo de las ondas producidas en una cuerda de guitarra si tienen una rapidez de propagación de $6\,\mathrm{m/s}$ y su longitud de onda es de $30\,\mathrm{m/ciclo}$.'),]
open('examenes-pdf/examen-08.html','w').write(build2('8','Octavo fin de semana del curso',e8m,e8f))
print('examen-05..08 escritos')
