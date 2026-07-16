# Brief de diseño · Home del alumno · Tercial

> **Para:** la IA de diseño.
> **De:** Gil (dueño de Tercial) + la IA de código.
> **Qué es:** nosotros construimos un prototipo **funcional** del "home del alumno". Este
> documento captura **nuestras decisiones e intención** para que tú lo lleves a un diseño
> visual pulido. Es autocontenido: no necesitas haber visto la conversación.
> **Prototipo funcional de referencia:** `rediseno/alumno.html` (ver §9).
> **Estado:** v1 · la sección §7 (lo que a Gil le gusta) se irá llenando con sus comentarios.

---

## 1 · Contexto estratégico (por qué existe esto)

**Tercial** es un negocio familiar (~20 años) de preparación para exámenes de admisión, en
dos niveles:
- **Prepa** — ingreso a bachillerato (COMIPEMS / ECOEMS).
- **Universidad** — admisión UNAM. **Área 1 = Físico-Matemáticas y de las Ingenierías**
  (donde mate 26 + física 16 = 35% del examen = las materias de Gil). Hay 4 áreas UNAM,
  cada una con su temario (ver `rediseno/TEMARIOS.md`); ❓ falta confirmar cuáles cubre Tercial.

Materias: **matemáticas, física y habilidad matemática.**

**El giro:** dejar de ser un *sitio-catálogo* (una liga por cada tipo de material, se siente
como blog) y volverse un **sistema** — la "versión 1 del método" de Gil hecho producto. El
sistema debe dar **dirección, práctica y (a futuro) diagnóstico** por sí solo, para que el
alumno avance aunque el maestro no esté presente cada minuto.

**Modelo de negocio en 3 peldaños** (contexto, no todo se diseña ahora):
1. Gratis — material abierto (embudo).
2. El sistema — de pago, autoservicio, para alumnos **externos** (escala).
3. Sistema + maestro — premium, alumnos presenciales.

**North Star de diseño:** pensar en el **alumno externo, sin maestro al lado**. Si a él le
sirve, al presencial también.

### Diferenciadores de marca (⚠️ implican diseño)
La competencia mexicana (Unitips, CONAMAT, sitios de gobierno, etc.) es o **SaaS genérico**
(plantillas coloridas de startup) o **gratis-pero-feo**. **La ventaja de Tercial es verse
distinto: editorial, cálido, serio, con oficio.** El diseño **no debe** parecer edtech
genérico ni "IA slop". La contención elegante *es* el foso competitivo.

---

## 2 · Dos superficies SEPARADAS (decisión firme)

| Superficie | Para quién | Trabajo | ¿Se diseña ahora? |
|---|---|---|---|
| **Home del alumno** (este doc) | alumno **ya inscrito** | herramienta de trabajo diaria, **CERO venta** | **SÍ** |
| **Página de venta** | quien **aún no** es alumno | pitch, "por qué funciona", precio, CTA | después |

**Regla:** no mezclar venta en el home del alumno. Es una herramienta limpia que abre todos
los días; el marketing estorba ahí.

---

## 3 · El método que le da forma al contenido (el "por qué")

Lo que sigue no es relleno: cada punto **justifica** una parte del diseño.

- **No-negociable de Gil (20 años):** el alumno **tiene que hacer tarea a diario**, y esa
  tarea es **repaso ACUMULATIVO de todo lo visto** (no solo el tema del día). → Esto *es* la
  capa "HOY". Es el corazón del producto, no un adorno.
- **El arco del curso:** de la **MECÁNICA** al **RAZONAMIENTO**. Semanas tempranas: les
  faltan bases (operaciones con **fracciones**, reglas de **signos**) → drills. Semanas
  tardías: ya ejecutan, pero les cuesta **elegir qué método aplicar** → razonamiento.
- **Las tres fases (marco central, se codifican por color):**
  **1 · Aprende** (teoría) → **2 · Practica** (diario) → **3 · Simula** (examen).
- **El 20% humano que NO va en el producto** (se queda con Gil y su mamá, es el peldaño
  premium): **cercanía/confianza + explicación a la medida** de cada alumno.
- **Dolor #1 (módulo futuro, aún no):** generar **ejercicios nuevos ilimitados** (se acaban
  los de los libros). Los distractores ideales = **errores de signo reales**.

---

## 4 · Estructura del home del alumno (el spec)

Layout de una sola columna, contenedor ~960px, mucho aire. **Dos capas apiladas:**

### CAPA 1 · HOY — el protagonista (arriba de todo)
Una tarjeta destacada. De arriba a abajo:
1. **Eyebrow** (mono, meta): "Tu tarea de hoy".
2. **Fecha grande** (display Fraunces, con el número en itálica-acento): "Miércoles *5* de agosto".
3. **Insignia del tipo de día** (píldora, arriba a la derecha): cambia según el calendario —
   *Hoy hay clase · Asesoría disponible · Sin clase · Receso · Preparación libre*. Cada una
   con su color (ver §5).
4. **Chip "Esta semana · [Tema]"** (cuando aplica): el tema de la semana, sale del temario
   mapeado al calendario.
5. **Título + nota** (qué toca hoy y por qué).
6. **Pasos del plan** (lista): cada paso = etiqueta de fase (Aprende/Practica/Simula, con su
   color) + texto de la acción + botón-CTA que lleva al material real. Normalmente 1–2 pasos.
7. **Pie** (meta): "Tu plan se arma solo desde el calendario — mañana cambia solo" + enlaces
   a calendario y aula.

### CAPA 2 · TU MATERIAL — la caja de herramientas (debajo)
Encabezado tenue: "Tu material · por si quieres ir más allá del plan de hoy". Tres bloques,
cada uno con el color de su fase:
- **1 · Aprende** — *Formulario completo* (destacado) · **Física, 11 temas** (rejilla 2 col
  con hint) · **Matemáticas, 4 recursos**.
- **2 · Practica** — *Tarjetas y notas* (practicar / práctica rápida / notas de repaso) ·
  *Cuatro modos* (Relámpago / Descarta los dos / A ojo / Factos).
- **3 · Simula** — *UNAM Área 2* (destacado, banco de 120) · adaptativo mate · adaptativo física.

---

## 5 · Sistema de diseño (restricciones — respétalas)

- **Reutiliza** los estilos existentes: `assets/css/tokens.css`, `base.css`, `components.css`.
- **Tipografía:** **Fraunces** (display; las itálicas son el gesto editorial central, en color
  acento) · **IBM Plex Sans** (cuerpo) · **IBM Plex Mono** (etiquetas, meta, números).
- **Marca:** "editorial cálido". Base **crema/coñac**. Acento por nivel: **universidad = coñac**
  (default, `--accent-conac` ≈ #8c4a3a / dark #c7836b); prepa = terracota.
- **Código de color por fase (funcional, no decorativo):**
  - Aprende = **morado polvo** `--cat-purple` #7a4a6b / dark #b08299
  - Practica = **verdigris** `--cat-teal` #2d5c63 / dark #7eb0b5
  - Simula = **slate** `--cat-navy` #2d3955 / dark #8090b0
- **Filosofía de color (importante):** el color es una **etiqueta funcional** (una fase = un
  tono), NO un arcoíris tipo Quizlet. La contención editorial es la marca. Único lugar donde
  se vale **más energía/color**: los **modos de práctica** (son la parte "juego").
- **Claro/oscuro:** soporte completo. Hay script anti-flash en `<head>`, `theme.js`
  (`window.ClasesTheme`) y un componente `.theme-toggle` reutilizable. El calendario embebido
  necesita igualar `color-scheme` para no volverse opaco en oscuro.
- **Estados por forma (calendario):** Clase = relleno del acento · Asesoría = relleno tenue ·
  Suspensión = solo punteado · Simulacro = cian.

---

## 6 · Comportamiento dinámico (para que el diseño respete la lógica)

El home **no es estático**: la capa HOY es **función de la fecha**. El diseño debe acomodar
que estos elementos cambian:

- **Tipo de día** (del calendario universidad): clase = mié/jue · asesoría = lun/mar/vie ·
  fin de semana = suspensión · receso = 18 dic–5 ene · fuera de ago–dic = "preparación libre".
  → cambia insignia, título, nota y pasos.
- **Tema de la semana:** el temario se reparte, un tema por semana de clase, arrancando en la
  1ª semana con clase. → aparece/desaparece el chip "Esta semana · [Tema]" y los CTAs apuntan
  al material de ese tema.
- **Número de pasos** varía (1–3). Diséñalo flexible.
- ⚠️ **Provisional:** el temario actual es un *placeholder* (orden de temas de física del
  sitio). El real lo define Gil (ver `rediseno/TEMARIOS.md`).
- **Universidad = 4 temarios (uno por área UNAM)** → el alumno de uni **elige su área** y el
  "tema de la semana" sale del temario de esa área (probablemente multi-materia). **Prepa = 1
  temario.** Implica una **dimensión de "área"** en el home de universidad (selector de área).
- **Todo esto es FASE 1 y YA FUNCIONA:** es JavaScript que lee la **fecha/hora del navegador**;
  no necesita servidor ni login. Corre en el sitio estático tal cual. Incluye poder variar por
  **hora del día** (mañana "antes de clase" / tarde "después de clase").
- **Frontera Fase 1 / Fase 2:** las dos son dinámicas; la diferencia es *quién decide el
  contenido*. **Fase 1** = función de la **fecha/hora, igual para todos**. **Fase 2**
  (backend/login) = lo **por-alumno**: su nombre, su progreso, marcar "hecho", "lo que TÚ
  fallaste", ejercicios a su medida en vivo.
- El control **"vista previa"** que trae el prototipo (Hoy / Día de clase / Asesoría / …) es
  solo para revisar; **no va en la versión final.**

---

## 7 · Lo que a Gil le gusta / decisiones confirmadas

> _(Se va llenando con los comentarios de Gil.)_

- **El concepto de "itinerario del día" es lo que más le gusta** — el home como la lista de lo
  que hay que hacer HOY. Es el eje; que se sienta así.
- **Preparación antes de clase (aula invertida):** en los días que Gil da clase de un tema,
  quiere que el alumno llegue **ya leído** con algo de ese tema para entender mucho mejor la
  clase. → El paso "Antes de clase, repasa [tema]" debe ser **prominente y claro** en días de
  clase, y estar visible **desde el comienzo del día** (no aparecer tarde).
- **Reemplaza Google Classroom:** hoy Gil sube el material a mano a un canal de Classroom. El
  "plan de hoy" lo automatiza — la página se vuelve **el único lugar que el alumno revisa cada
  día**. Que el diseño transmita esa sensación de "aquí está todo lo de hoy, ya listo".

---

## 8 · Lo provisional y preguntas abiertas

- Temario = placeholder; falta el real y su ritmo (¿1 tema por semana o por sesión?).
- Generador de ejercicios (signos/fracciones) = módulo futuro, no en este home.
- Física es el área de oportunidad de Gil (su fuerte es mate); su material de física puede
  reforzarse.
- Falta definir la **página de venta** (superficie aparte).

---

## 9 · Dónde están los prototipos (rama `rediseno-index`)

| Archivo | Qué es |
|---|---|
| `rediseno/alumno.html` | **El home del alumno — la síntesis, lo principal de este brief.** |
| `rediseno/hoy.html` | Prototipo enfocado solo en la capa "plan de hoy" (con más detalle del motor). |
| `rediseno/c-ruta.html` | Exploración: home como "ruta/método" (base de la que salió esto). |
| `rediseno/a-escritorio.html` | Exploración: dashboard denso. |
| `rediseno/b-indice.html` | Exploración: portada tipográfica de periódico. |
| `rediseno/index.html` | Hub para navegar todo lo anterior. |
| `METODO.md` (raíz) | El blueprint del método (el "por qué" de todo, más a fondo). |
