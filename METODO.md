# Método Tercial · versión 1 (blueprint)

> El documento del que sale el producto. Aquí escribimos **cómo enseñas** para poder
> decidir qué parte puede vivir en un **sistema** (escala, sin ti) y qué parte **te
> necesita a ti** (el peldaño premium).
>
> **Regla de oro:** cada pieza del método se etiqueta `[SISTEMA]` · `[HUMANO]` · `[HÍBRIDO]`.
> Lo `[SISTEMA]` es lo que un alumno externo podría seguir casi sin ti.
>
> Estado: `v0.1` — sembrado con lo que ya platicamos. `❓` = falta tu respuesta.

---

## 0 · El alumno y la meta
- **Nivel:** superior · examen de admisión UNAM (área 2, físico-matemáticas). ❓¿solo UNAM o también IPN/otras?
- **Qué es "éxito":** ❓¿un puntaje?, ¿quedar en una carrera/plantel?, ¿"pasar"?
- **De dónde parte el alumno:** ❓¿llegan con qué nivel típico?, ¿haces diagnóstico al entrar?
- **Cuánto dura el acompañamiento:** ❓¿cuántos meses en promedio?

> **Nota del fundador:** Tercial prepara para **prepa (COMIPEMS)** y **las 4 áreas de la UNAM**.
> Reparto de materias: **Gil → Matemáticas, Física, Habilidad matemática** (materias de
> *método/problema*); **su mamá → el resto + Química** (materias de *lectura/concepto*). Su
> formación es **matemática**; **física es su área de oportunidad** — pidió ayuda para mejorar
> sus clases de física.
>
> **Implicación fuerte para el sistema — DOS motores de práctica** (coincide con los dos modos
> pedagógicos de la propia guía UNAM):
> 1. **Método/problema** (mate, física, química-cálculos): práctica = **problemas generados**
>    con verificación numérica. Es el dolor #1 de Gil (ejercicios que se acaban).
> 2. **Concepto/hecho** (biología, historia, geografía, literatura, español): práctica =
>    **flashcards, cuadros, líneas de tiempo, causa-efecto** (Tercial ya tiene flashcards/repaso).
>
> Captura de expertise: **mate = Gil**, **física = co-desarrollar/nivelar a Gil**, **materias de
> lectura + química = capturar a la mamá** (ella es la experta ahí).

## 1 · El arco — de la semana 1 al examen
Las fases por las que pasa un alumno de principio a fin. Hipótesis inicial (corrígela):

1. **Diagnóstico** — saber de dónde parte. ❓¿lo haces hoy?
2. **Aprende** — construir la teoría, tema por tema.
3. **Practica** — volverlo automático (diario).
4. **Simula** — examen completo, en formato real.
5. **Afina** — cerrar debilidades detectadas.

**Semana 1 vs 10 (Gil):** al inicio les faltan **bases de aritmética/álgebra** — sobre
todo **operaciones con fracciones**, que casi siempre les cuestan. Para la semana 10 ya
dominan la mecánica; el cuello de botella se mueve al **razonamiento**: saber *qué* método
u operación aplicar. Una vez que identifican la operación correcta, la ejecutan bien.

→ **El arco real = de la MECÁNICA al RAZONAMIENTO.** Implica dos features del sistema:
(1) **front-load de mecánica** con diagnóstico y drills (fracciones, álgebra básica);
(2) distinguir si un error es de **mecánica** o de **razonamiento** — el remedio es distinto.
Nota elegante: lo fácil de automatizar (drills de mecánica) es justo lo que se necesita
temprano; lo difícil (problemas de razonamiento) es tardío y ahí Gil se queda en el loop.

## 2 · El ciclo de UN tema (la unidad atómica) ← lo más importante
Cómo llevas a un alumno por **un solo tema** (ej. Cinemática), paso a paso.
Hipótesis basada en cómo se aprende (dime dónde tu método difiere):

1. **Activar** — ¿qué ya sabes de esto?
2. **Explicar** — la idea clave (no todo, lo esencial).
3. **Modelar** — un ejemplo resuelto, pensando en voz alta.
4. **Práctica guiada** — lo resuelven contigo cerca.
5. **Práctica independiente** — solos.
6. **Verificar** — ¿de verdad lo domina? (no "¿se entendió?").
7. **Espaciar** — repaso a los pocos días para que no se borre.

**El paso irremplazable (Gil + su mamá):** la **explicación con cercanía y confianza**.
Tras años, saben *cómo* explicarle a cada alumno para que entienda. Los alumnos se sienten
tan cómodos que hablan hasta de su vida personal (a la mamá la confunden con psicóloga).
Ese rapport = `[HUMANO]`, el alma del peldaño premium. Matiz: el **rapport** no se
automatiza, pero **sus explicaciones sí se pueden capturar** para que escalen al externo.

**El paso que Gil ODIA (→ automatizar ya):** conseguir **ejercicios nuevos** para que sigan
practicando. Aunque tiene muchos libros, **se acaban los ejercicios** y la práctica se
vuelve repetitiva. → `[SISTEMA]`: **generador de ejercicios** (práctica ilimitada y variada
por tema y dificultad). Es su mayor dolor **y** de lo más fácil de resolver con IA.

## 3 · El ritmo (semana / día) — `[SISTEMA]` casi listo

### 3.0 · Dos cursos, dos arquitecturas (define los dos "plan de hoy")
La diferencia de fondo entre prepa y uni, dicha por Gil:

- **PREPA (ECOEMS) — INTENSIVO, ~4 meses.** Temario **chico** → se ven **todos** los temas de
  forma intensiva en ~4 meses. Núcleo = **fin de semana** (sáb + dom, 4 h), con **examen
  acumulativo de mate+física el sábado**; asesorías **obligatorias** entre semana (refuerzo de
  "deficiencias de niveles previos"). Ritmo rápido, mucha repetición.
  → Plan de hoy: **marcha intensiva** anclada al fin de semana.

- **UNI (UNAM) — NO intensivo, ANUAL.** Mucha más información (4 áreas, temario grande con
  cálculo) → estructurado como curso de **~1 año**. **Empieza desde lo que debieron ver en
  primaria / secundaria / prepa** (fundamentos: aritmética, fracciones, signos, álgebra básica)
  y **sube gradualmente** hasta lo avanzado (funciones, trig, geometría analítica, cálculo).
  Un tema por semana (mié mate / jue física), ritmo tranquilo.
  → Plan de hoy: **arco largo y gradual, fundamentos primero.**

**La unificación (clave del producto):** el curso de **uni, en su fase de fundamentos, cubre el
MISMO material que prepa** (y de más abajo). Es decir: **prepa ≈ la fase fundacional del curso
de uni, pero comprimida.** Uni la estira sobre el año y arranca desde más abajo. Por eso el
**tronco común** (aritmética + álgebra básica) y su **generador** rinden en los dos: en prepa
es casi todo el curso; en uni es el arranque del año.

⚠️ **Refina el prototipo:** `rediseno/alumno.html` modela uni como un curso comprimido de ~17
semanas (ago–dic). El modelo correcto es **anual, empezando en fundamentos** antes de los 17
temas UNAM. ❓Falta a Gil para modelarlo bien: ¿cuándo arranca el año?, ¿cuántas semanas de
**fundamentos** antes del temario UNAM formal?

### 3.1 · El ritmo REAL (curso que acaba de terminar — dicho por Gil)
| Día | Duración | Qué pasa |
|---|---|---|
| **Miércoles** | **3 h** | **CLASE DE MATEMÁTICAS** — el tema de mate de la semana |
| **Jueves** | **3 h** | **CLASE DE FÍSICA** — el tema de física de la semana |
| **Lun · Mar · Vie** | **1 h** (~7 pm) | *"adelantar un tema o hacer algo diferente… pero **no había tanta estructura**"* ← **EL HUECO** |
| **Fin de semana** | — | Simulacro |

- Mié/jue son los días que Gil **no va a la oficina** → tiene 3 h. Los demás días regresa
  ~7 pm → solo alcanza 1 h.
- **Las materias van EN PARALELO:** 1 tema de mate (mié) + 1 tema de física (jue) por semana.
- **El origen de la página, en sus palabras:** *"por eso decidí hacer una página para que
  tengamos más orden y secuencia en los temas"*.
  → **El problema NO son las clases** (mié/jue ya funcionan): son **las 3 horas sueltas**.
  Ese es el trabajo #1 del producto.

### 3.2 · Los no-negociables (confirmados)
- **Tarea diaria (NO-NEGOCIABLE):** cada día, repaso **acumulativo** de todo lo visto —
  no solo el tema del día. El "plan de hoy" debe entregar esto solo.
- **Antes de clase (AULA INVERTIDA):** el alumno llega **ya leído** del tema del día →
  aprovecha mucho más las 3 h. El plan lo entrega **desde temprano**.
  → **Reemplaza subir material a mano a Google Classroom.**

### 3.3 · PROPUESTA para las 3 horas sueltas (⚠️ por confirmar con Gil)
**Tesis: los temas nuevos SOLO en mié/jue.** "Adelantar un tema" en un día suelto es justo lo
que rompe la secuencia que Gil quiere — y lo que haría **imposible** que la página calcule el
plan sola: si los temas avanzan en días arbitrarios, el temario deja de ser función de la fecha
y la Fase 1 no existe. **Blindar mié/jue es lo que HACE POSIBLE la página.**
Las 3 horas se vuelven el **motor de práctica y repaso espaciado**:

| Día | Trabajo propuesto | Por qué |
|---|---|---|
| **Viernes** (1 h) | Repaso #1: mate del mié + física del jue | temas frescos, a +2/+1 días |
| **Lunes** (1 h) | Repaso #2 (+5 días) + **mecánica acumulativa** (fracciones, signos) | 2º espaciado; ataca el cuello de botella temprano |
| **Martes** (1 h) | **Aula invertida**: preparar el tema del miércoles + cerrar dudas | llegan leídos a las 3 h |

Cae solo un calendario de **repaso espaciado** y cumple el no-negociable de la tarea diaria.

### 3.4 · Consecuencia aritmética (Área 1)
Con 1 tema/semana por materia: **mate = 17 temas → 17 miércoles** (apretado, sin holgura) vs
**física = 9 temas → sobran jueves** (≈ 2 semanas por tema). Buena noticia: **la holgura cae
justo en física**, el área de oportunidad de Gil.
❓**Dato que falta:** ¿cuántas semanas dura el curso (inicio → examen)? Con eso el calendario
completo queda determinado.

### 3.5 · INGRESO ESCALONADO — el hallazgo que reordena todo
**Los alumnos NO entran todos en la misma fecha.** Unos se enteran de Tercial tarde; otros
retrasan la entrada **por dinero**. Hoy Gil los **nivela usando parte de esas 3 horas sueltas**.

→ **Corrige la §3.3:** esas horas **no están libres** — ya hacen trabajo necesario. La propuesta
de repaso espaciado es el **destino**, no el punto de partida: solo se puede llegar ahí si algo
**se lleva la carga de la nivelación**.

**El modelo real es de cohorte con válvula de remediación:**
- **La clase (mié/jue) marcha en UNA sola secuencia**, igual para todos → **sigue siendo Fase 1**
  (función de la fecha). El ingreso escalonado **no rompe** el plan de clase.
- **Lo personal es el REZAGO:** "entré en la semana 5 → me faltan los temas 1–4". Es función de
  **(fecha de hoy − fecha de ingreso)**.
- 💡 **Fase 1.5 (sin backend):** basta preguntar una vez **"¿en qué semana entraste?"** y
  guardarlo en `localStorage`. Con eso el plan ya calcula el rezago personal **sin login ni
  servidor** — el sitio sigue siendo estático.

**Por qué la nivelación es LA pieza a construir (converge todo):**
1. Es lo **más automatizable** de su método: los temas tempranos son **mecánica**
   (fracciones, signos) — lo que Gil ya clasificó como `[SISTEMA]`.
2. Se come su recurso **más escaso** (las horas de 1 h) en su uso **menos apalancado**:
   re-explicar el tema 1 por enésima vez.
3. Se **repite cada generación**: siempre hay quien llega tarde y necesita los mismos temas 1–4.
   Definición de lo que hay que sistematizar.
4. **Es la MISMA máquina que el producto externo.** Un alumno externo = alguien que llega en
   fecha arbitraria, sin cohorte, y necesita el temario **asíncrono, a su ritmo, sin Gil**. El
   rezagado necesita eso para los temas 1–4; el externo para los 1–17. **Mismo motor, distinto
   tamaño de backlog.**
5. **Ruta de validación de bajo riesgo:** se prueba el motor asíncrono con **sus propios alumnos
   rezagados** (donde Gil está ahí para cachar fallas) **antes** de vendérselo a externos.
6. **Efecto de negocio:** hoy un ingreso tardío **le cuesta horas**. Con el motor, puede aceptar
   alumnos **en cualquier fecha sin costo marginal** — justo el segmento que entra tarde por
   dinero. Vuelve el negocio de admisión continua.

⚠️ **Matiz honesto:** el sistema NO reemplaza la nivelación completa. Se lleva **teoría + drills
de mecánica (asíncrono)**; Gil conserva el **destrabar** (`[HÍBRIDO]`, el patrón de su §7). Eso
libera **la mayor parte** de las horas sueltas → y entonces sí aplica la §3.3.

❓¿Qué tan común es? ¿cuántos llegan tarde y **qué tan tarde**? ¿Nivelas **1:1 o en grupo**?
¿Alcanzan al grupo o se quedan atrás todo el curso?

## 4 · Diagnóstico y feedback — el corazón de la escalabilidad
Cómo sabes que un alumno está atorado, y qué haces al respecto.
**Señal clave detectada:** un error puede ser de **mecánica** (ej. botó la fracción) o de
**razonamiento** (eligió mal el método). El remedio es distinto → el sistema debería
distinguirlos y mandar el drill correcto. `[SISTEMA/HÍBRIDO]`
- ❓¿En qué te fijas para saber que alguien va mal **antes** de un examen?
- ❓Cuando alguien falla un tema, ¿qué haces exactamente?
- ❓¿Llevas registro de esto o vive en tu cabeza?

## 5 · Constancia y motivación (el pegamento humano) — `[HÍBRIDO]`
Cómo logras que vengan/practiquen **casi diario durante meses**.
- ❓¿Qué haces hoy para que no abandonen? (relación, presión, hábito, familia…)
- ❓¿Qué parte de eso es tu trato personal y qué parte podría hacer el sistema
  (rachas, recordatorios, ver su progreso)?

## 6 · La salsa secreta
Lo que hace que tus resultados sean buenos y **no es obvio**.
- **Cercanía y confianza (Gil + mamá):** los alumnos se sienten tan cómodos que hablan de
  su vida personal, no solo de la materia. Esa relación sostiene la constancia de meses.
- **Explicación a la medida:** tras años, saben cómo explicarle a cada quien para que
  entienda. Es lo que más se repite como su ventaja.
- **Error universal:** los **signos**. Al principio les cuesta muchísimo la regla de signos
  (negativos, resta, distribución). → drill de mecánica prioritario **y** el material
  perfecto para **distractores** de los ejercicios (errores realistas, no al azar).
- **No-negociable:** el alumno **tiene que hacer tarea**. Gil quiere que la página tenga
  **todos los días algo que hacer: un repaso acumulativo de TODO lo ya visto** (no solo el
  tema de hoy). → convierte el "plan de hoy" en la **pieza central** del producto: tarea
  diaria de repaso espaciado. Es su no-negociable hecho feature.

## 7 · Clasificación SISTEMA / HUMANO (se llena al final)
El entregable: qué construimos vs. qué te quedas tú.

| Pieza del método | ¿Quién la hace? | Notas |
|---|---|---|
| Decir qué hacer hoy | `[SISTEMA]` | el "plan de hoy" |
| Entregar la teoría de un tema | `[SISTEMA]` | tus materiales |
| Generar práctica | `[SISTEMA]` | flashcards / modos |
| Medir nivel por tema | `[SISTEMA]` | adaptativo → progreso |
| Recordar / mantener la racha | `[SISTEMA]` | |
| **Generar ejercicios nuevos** | `[SISTEMA]` | **el dolor #1 de Gil** → práctica ilimitada |
| Distinguir error mecánica vs razonamiento | `[SISTEMA]` | remedios distintos |
| Drills de mecánica (fracciones, álgebra) | `[SISTEMA]` | front-load semanas tempranas |
| Enseñar razonamiento / elegir método | `[HÍBRIDO]` | tardío; Gil en el loop |
| Explicar con cercanía/confianza | `[HUMANO]` | alma del premium; sus explicaciones sí se capturan |
| Destrabar al que se atoró | `[HUMANO]` | tu 20% de oro |
| Motivar en un mal día | `[HÍBRIDO]` | sistema avisa, tú intervienes |
