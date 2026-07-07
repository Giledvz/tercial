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

> **Nota del fundador:** Gil imparte **matemáticas, física y habilidad matemática** (prepa
> COMIPEMS + universidad UNAM), con su mamá. Su formación es **matemática**; **física es su
> área de oportunidad** — pidió ayuda para mejorar sus clases de física en ambos niveles.
> Implicación para el sistema: en **mate** capturamos SU expertise (él es el maestro); en
> **física** co-desarrollamos y lo nivelamos — es justo donde la ayuda externa (IA) más aporta.

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
Ya modelado en el calendario y el "plan de hoy":
- **Clase:** miércoles y jueves.
- **Asesoría:** lunes, martes, viernes.
- **Práctica:** diaria, 15 min.
- **Tarea diaria (NO-NEGOCIABLE):** cada día, repaso **acumulativo** de todo lo visto —
  no solo el tema del día. El "plan de hoy" debe entregar esto solo.
- **Simulacro:** fin de semana.

❓¿El ritmo real es así? ¿Cuántas horas de clase por sesión? ¿Tarea diaria?

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
