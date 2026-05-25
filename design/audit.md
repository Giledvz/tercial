# Auditoría visual y técnica — giledvz.github.io/clases

**Fecha:** 2026-05-22 · **Alcance:** lectura, sin modificaciones.

---

## 1. Estructura del repo

```
clases/
├── README.md                            (vacío, sólo "# clases")
├── index.html                              557 líneas
│
├── examen_adaptativo.html                1 032 líneas
├── examen_adaptativo_fisica.html           941 líneas
├── examen_unam_area2.html                1 120 líneas
│
├── flashcards.html                       4 949 líneas (incluye ~350 preguntas)
├── practicar.html                          221 líneas
├── repaso.html                             379 líneas
│
├── formulario.html                         233 líneas
│
├── fluidos.html                            252 líneas
├── electricidad.html                       290 líneas
├── cinematica.html                         216 líneas
├── dinamica.html                           217 líneas
├── trabajo_energia.html                    220 líneas
├── cantidad_movimiento.html                216 líneas
├── termodinamica.html                      232 líneas
├── optica.html                             210 líneas
├── ondas.html                              210 líneas
├── magnetismo.html                         210 líneas
├── fisica_moderna.html                     210 líneas
├── calculo_diferencial_v3.html             400 líneas
│
├── *.pdf (5 archivos)                     formulario, cálculo, geometría, trig, planes
├── screenshots/                            3 capturas del index
├── design/                                 (este audit)
└── skills-lock.json
```

**Total HTML:** 20 archivos · **12 315 líneas** combinadas.
**No hay**: `package.json`, `*.css`, `*.js` externos, ni carpeta `assets/`. Todo es inline.

---

## 2. Stack técnico

- **HTML/CSS/JS vanilla**, sin framework, sin build step.
- **KaTeX** se carga desde CDN (`jsdelivr`), no local. Sólo en 4 archivos: `examen_unam_area2.html`, `flashcards.html`, `formulario.html`, `repaso.html`.
- **Fuentes** vía Google Fonts CDN:
  - "Family A": `Lora` (serif) + `DM Sans` (sans). Usada en index y exámenes.
  - "Family B": `Fraunces` (serif) + `IBM Plex Sans` (sans). Usada en flashcards, practicar, repaso.
  - "Family C": ninguna fuente custom; Georgia + Arial system. Usada en todos los ejercicios y formulario.
- **No hay** Chart.js, Alpine, React, ni librerías JS adicionales. Sólo `katex` y `auto-render`.

---

## 3. Arquitectura CSS — *aquí está el problema mayor*

**No existe un CSS central.** Cada archivo HTML lleva su propio `<style>` inline con sus propios tokens, selectores y media queries.

### Duplicación masiva en ejercicios físicos

Los 12 archivos de "ejercicios" (`fluidos`, `electricidad`, `cinematica`, `dinamica`, `trabajo_energia`, `cantidad_movimiento`, `termodinamica`, `optica`, `ondas`, `magnetismo`, `fisica_moderna`, `calculo_diferencial_v3`) comparten **~90 líneas de CSS idénticas** (selectores `.card`, `.card-header`, `.panel`, `.resp-pill`, `.chip`, `.ocultar`). La única diferencia entre ellos:

- Un color de acento `border-bottom` en `.portada` (entre `#1a4f8a`, `#c2410c`, `#b45309`, `#0e7490`, `#6d28d9`, `#1e3a8a`).
- El contenido del `<title>` y el array `SECCIONES` en JS.
- Algunos tienen `align-items:flex-start` (electricidad) vs `center` (los demás) por SVGs.

Si se factoriza un `ejercicios.css` compartido, **se ahorrarían ~1 200 líneas** del repo.

### Variables CSS — tres sistemas paralelos coexistiendo

| Sistema | Tokens declarados | Páginas |
|---|---|---|
| **A — "UNAM cards"** | `--calc`, `--geo`, `--trig`, `--flash`, `--txt`, `--muted`, `--borde`, `--bg`, `--card`, `--shadow` | `index.html` |
| **A' — "Exámenes"** | igual que A + `--ok`, `--err`, `--nav`, `--trk`, `--letra-bg` y modo oscuro | los 3 `examen_*` |
| **B — "Paper craft"** | `--bg`, `--bg-grain`, `--ink`, `--ink-soft`, `--paper`, `--accent`, `--accent-soft`, `--line`, `--serif`, `--sans` | flashcards, practicar, repaso |
| **C — "Worksheet"** | `--borde`, `--gris`, `--muted`, `--texto` (sólo 4 tokens) | ejercicios + formulario + cálculo |

Los tres sistemas **no comparten ningún token**. El mismo concepto ("color de borde") es `--borde` con valor `#e5e7eb` en A, no existe en B (usa `--line: #d4cbb8`), y es `--borde: #d0d0cc` en C.

### Reset CSS duplicado

Cada archivo declara su propio `* { box-sizing: border-box; margin:0; padding:0; }`. Veinte veces.

---

## 4. Clasificación de páginas por tipo

### Tipo 1 — Index (1)
- `index.html`
- Único en su clase: header con gradiente oscuro, sección "Exámenes adaptativos" con tarjetas grandes color, sección de "Tarjetas de Práctica" y luego una sección por materia/temática (Física, Cálculo, Geometría, Trigonometría) con cards listadas.
- **Tiene un contador de examen dinámico** (alumna Lupita).

### Tipo 2 — Exámenes adaptativos (3)
- `examen_adaptativo.html`, `examen_adaptativo_fisica.html`, `examen_unam_area2.html`
- **Comparten estructura HTML y CSS casi idéntica** (mismas variables, mismas clases, mismo flujo de pantalla-inicio → preguntas → resultados). Difieren en el contenido del banco y el título.
- Únicos archivos con **modo oscuro** (vía `[data-theme="dark"]`).

### Tipo 3 — Flashcards (3 variantes que se complementan)
- `flashcards.html` — el motor: 350+ preguntas + modos (estudio, revisión, filtros por tema y fuente).
- `practicar.html` — browser de temas que enlaza al motor con `?tema=...`.
- `repaso.html` — notas teóricas por tema con link a practicar; usa `<details>` para acordeón.
- **Diseño compartido**: `Fraunces + IBM Plex Sans` con fondo beige paper. Visualmente coherentes entre sí.

### Tipo 4 — Formulario (1)
- `formulario.html` — tabla con fórmulas físicas y KaTeX.
- **Diseño distinto**: usa el sistema C (Georgia/Arial, blanco), pero con más estructura (constantes, tabla a 3 columnas). Es híbrido entre "worksheet" y "documento técnico".

### Tipo 5 — Ejercicios por unidad (12)
- 11 de física + cálculo diferencial: todos usan el mismo template "worksheet" (sistema C).
- **Misma estructura HTML**: `.portada → #contenido → .footer` con renderizado JS desde un array `SECCIONES`.
- **Misma estructura JS**: misma función render, mismas clases CSS.
- **Mismo problema**: copy-paste 12 veces sin compartir el CSS.

---

## 5. Inconsistencias entre páginas

### Tres "design languages" coexistiendo

El sitio se siente como tres sitios web cosidos:

1. **Index + Exámenes** → estética app moderna (gradientes, cards con color, sans-serif limpio).
2. **Flashcards + Practicar + Repaso** → estética "papel envejecido" (beige, grain texture, serif Fraunces italica, accent rojo vino).
3. **Ejercicios físicos + Formulario + Cálculo** → estética "examen escolar impreso" (fondo blanco, Georgia serif, borde gris, sin sombras, sin colores fuertes).

Saltar entre páginas se siente como saltar de aplicación.

### El "más viejo" en CSS

`calculo_diferencial_v3.html` (fechado 24-abril, el primero del repo) sirvió como template para los 11 archivos posteriores de ejercicios. Es el que define el sistema C. Es funcional pero austero — sin variables semánticas, sin responsive.

### Colores de acento ad-hoc en ejercicios

Los 12 archivos de ejercicios eligen un color de acento `border-bottom` distinto pero hardcoded (no usan variable):

| Archivo | Color |
|---|---|
| fluidos, electricidad, cinematica, dinamica, trabajo_energia, cantidad_movimiento, cálculo | `#1a4f8a` (azul navy) |
| termodinámica | `#c2410c` |
| óptica | `#b45309` |
| ondas | `#0e7490` |
| magnetismo | `#6d28d9` |
| física moderna | `#1e3a8a` |

6 de 12 archivos comparten color (todos los "primeros"). Los 5 últimos eligieron variantes para diferenciarse, pero sin sistema.

---

## 6. Bugs visuales detectables por lectura del CSS

- **`!important` abuso**: mínimo (1 ocurrencia en cada de flashcards y los 2 exámenes — todo manejable).
- **Responsive prácticamente ausente**: sólo 5 archivos tienen `@media` (index, flashcards, practicar, repaso, formulario). **Los 12 archivos de ejercicios + 3 de exámenes no tienen ningún media query.** En móvil dependen exclusivamente del `max-width: 700px` del body.
- **Tipografías de 15px** (`.enun p`) sin reducir en móvil — legibilidad puede sufrir en pantallas chicas.
- **`max-width: 700px` fijo** en ejercicios sin padding flexible: en pantallas ≥800px desperdicia espacio (no se centra mal pero queda angosto).
- **`.panel.open { max-height: 200px }`** en ejercicios físicos: respuestas largas pueden cortarse (electricidad lo subió a 240px, pero los demás no).
- **Sin focus visible** en muchos botones (`.chip`, `.option`) — accesibilidad de teclado pobre.
- **Especificidad** está OK; los selectores son superficiales sin anidamiento agresivo.
- **Contraste**: `--muted: #777` sobre fondo blanco da ratio ~4.5:1 (en el límite de WCAG AA). Funciona pero no es generoso.

---

## 7. Patrones "AI design" presentes

Moderados, no graves. Detectados:

- **Gradientes**: `index.html` usa 4 (header `linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)` + 3 en `card-examen.mate/.fisica/.area2`). Los 3 exámenes también usan gradientes para `#pantalla-inicio` y badges de dificultad. **Flashcards/practicar/repaso usan 2 `radial-gradient` decorativos en el `body` para el efecto "papel"** — funcionan estéticamente pero son decorativos sin función.
- **Border-radius alto (20px, "pill")** sólo en index y exámenes en chips informativos (`.header-tag`, `.dif-X`). No es exagerado.
- **Blur / backdrop-filter / glassmorphism**: **0**. Limpio.
- **Sombras**: moderadas. Box-shadow en cards está bien proporcionada (`0 1px 3px / 0 4px 12px`). No hay sombras coloridas ni de neón.
- **Animaciones decorativas**: prácticamente nulas. Sólo transiciones funcionales (acordeón, hover de chips).

**Veredicto**: el sitio NO sufre del "AI sloppy design" típico. Es sobrio. El problema no es estético-decorativo, es de **falta de unificación**.

---

## 8. Navegación

- **No hay header/nav persistente entre páginas**.
- **De los 20 archivos, sólo 2 tienen link de regreso al index**: `practicar.html` y `repaso.html` (ambos con `← Volver al índice` en el `<header>` interno).
- **18 archivos no tienen forma directa de regresar al index** desde la UI (sólo botón "atrás" del navegador). Esto incluye **los 12 archivos de ejercicios físicos, los 3 exámenes, formulario.html, flashcards.html y el viejo cálculo**.
- **No hay breadcrumbs** en ningún archivo.
- El index es un dead-end al revés: te lleva a contenido pero el contenido no te trae de regreso.

---

## 9. Modo oscuro

- **Sólo los 3 exámenes adaptativos** tienen modo oscuro implementado (`[data-theme="dark"]` con tokens dark explícitos).
- **17 archivos no tienen ningún soporte de modo oscuro**, ni `prefers-color-scheme`, ni toggle.
- Si se quiere modo oscuro global, hay que armarlo prácticamente desde cero — sólo se puede aprovechar la convención `[data-theme="dark"]` que ya está en los exámenes.

---

## Tabla resumen ejecutiva

| Aspecto | Estado |
|---|---|
| Stack | Vanilla HTML/CSS/JS, sin build |
| CSS central | ❌ No existe (100% inline por página) |
| Tokens unificados | ❌ Tres sistemas paralelos sin overlap |
| Duplicación | Alta: ~90 líneas idénticas × 12 archivos de ejercicios |
| Responsive | Pobre: 15 de 20 archivos sin media queries |
| Modo oscuro | Sólo 3 archivos (exámenes); resto no |
| Navegación inter-página | Ausente: sólo 2 archivos linkean al index |
| Accesibilidad | Sin focus visible, contraste apenas WCAG AA |
| "AI design" | Bajo (gradientes moderados, sin glassmorphism) |
| Bug crítico | Ninguno bloqueante; UX fragmentada por inconsistencia |

---

# Anexo — Lectura con el skill `frontend-design`

Auditoría releída con el skill `~/.agents/skills/frontend-design/SKILL.md`. Las 9 secciones anteriores no se modifican; aquí se documenta qué cambia con esa lente.

## a) ¿Qué propone el skill?

1. **Pensar diseño ANTES de codear** — antes de tocar HTML, definir: *Purpose* (qué problema resuelve), *Tone* (elegir una dirección estética **extrema** con nombre), *Constraints* (técnicos) y *Differentiation* (¿qué hace esto INOLVIDABLE? ¿qué es lo único que alguien va a recordar?).
2. **Comprometerse con una dirección estética con nombre** — el skill pide elegir un "sabor" extremo: *brutally minimal · maximalist chaos · retro-futuristic · organic/natural · luxury/refined · playful/toy-like · editorial/magazine · brutalist/raw · art deco/geometric · soft/pastel · industrial/utilitarian*. Tibieza está prohibida.
3. **Intencionalidad > intensidad** — minimalismo refinado y maximalismo bold ambos funcionan; lo que NO funciona es "neutral por defecto". Si es minimal, tiene que ser **refinado** (restraint deliberado), no genérico.
4. **Tipografía distintiva, no genérica** — pide pareja de un serif/display con personalidad + un sans refinado. **Prohíbe explícitamente Inter, Roboto, Arial, system fonts**. Menciona específicamente NO converger a Space Grotesk.
5. **Color**: dominantes con accentes filosos > paletas tibias distribuidas. Una variable CSS por valor semántico.
6. **Motion**: prefiere **un page-load orquestado con staggered reveals** (alto impacto) > micro-interacciones dispersas. CSS-only cuando sea HTML puro.
7. **Composición espacial**: pide asimetría, overlap, flujo diagonal, grid-breaking, OR negative space generoso OR densidad controlada. La simetría centrada conservadora cae en "predictable layouts" que el skill explícitamente prohíbe.
8. **Fondos atmosféricos** — no defaultear a colores sólidos. Pide gradient meshes, noise textures, geometric patterns, transparencias en capas, sombras dramáticas, bordes decorativos, custom cursors, grain overlays.
9. **NEVER**: gradientes morados sobre blanco, patrones predecibles de componentes, "cookie-cutter design", convergencia hacia las mismas elecciones entre proyectos.

**Resumen NO/SÍ:**
- ✅ Pedir comprometerse con un punto de vista estético claro y ejecutarlo con precisión, hasta los detalles micro
- ✅ Tipografía con personalidad, color con dominantes filosos, motion orquestada en momentos clave
- ❌ Tibieza, sistema "neutral por defecto", componentes genéricos, fuentes de sistema, layouts predecibles centrados

## b) Aplicación al audit existente: qué cambia en prioridades

Mi audit fue **técnico-céntrico**. Diagnostiqué duplicación de CSS, falta de nav y tres "design languages" como problemas a **unificar promediando**. El skill cambia el marco:

| Lo que dije | Lo que el skill diría |
|---|---|
| "Hay 3 design languages, hay que unificar" | "Hay 3 intenciones tibias, ninguna comprometida. La solución no es promediar — es **elegir UNA bold direction y ejecutarla con disciplina** en los 20 archivos" |
| "AI design patterns están moderados, el sitio es sobrio" | "Sobrio sin intencionalidad ≠ refined minimal. Es **neutral por defecto**, que es lo que el skill llama *generic AI aesthetics*" |
| "Los 12 archivos de ejercicios duplican CSS, hay que factorizar" | Cierto, pero antes hay que decidir qué CSS va en ese archivo. Factorizar el sistema C tal cual es **codificar un default genérico**. La pregunta primero es *qué dirección estética merece ser el sistema único* |
| "Bugs visuales menores: !important, contraste WCAG en el límite" | El bug crítico que omití: **Georgia + Arial en 12 archivos es exactamente el `generic AI aesthetic` que el skill prohíbe**. Arial está en su lista negra explícita |

**Lo que el audit omitió por lente técnica:**

1. **Evaluación tipográfica como problema crítico, no estético-opcional.** No marqué que 12 de 20 archivos usan Georgia + Arial — la combinación más genérica posible según el skill. Esto sube de "C es austero" a "C viola explícitamente el principio anti-genérico".
2. **Pregunta de memorabilidad / diferenciación.** El skill abre con "¿qué hace esto INOLVIDABLE?". La respuesta para este sitio: nada. Esa ausencia debería ser hallazgo #1 del audit, no apéndice.
3. **Análisis de motion.** No mencioné motion en ningún lado del audit. Reality check: hay transiciones funcionales (acordeón, hover) pero **cero page-load orquestado, cero staggered reveals**, ninguna delight. El skill considera esto una oportunidad de diferenciación perdida.
4. **Composición espacial.** Todo el sitio es centered + symmetric + max-width 700px. **Cero asimetría, cero overlap, cero grid-breaking, cero diagonales.** El skill clasifica esto como "predictable layouts" — explícitamente lo que pide evitar.
5. **Atmósfera de fondos.** Sistema A y C son blanco sólido. Sólo sistema B (paper craft) intenta atmósfera (radial-gradient grain), y eso lo califiqué como "decorativo sin función". El skill diría: el grain de B es exactamente lo que se necesita — el "sin función" es justo su función estética.

**Reclasificación de severidad:**

| Hallazgo | Audit original | Con lente skill |
|---|---|---|
| Georgia/Arial en 12 archivos | medio (mencionado como "austero") | **CRÍTICO** (`Arial` está en blacklist explícita) |
| Layout 100% centered/symmetric | no mencionado | **alto** (predictable layouts) |
| Cero motion orquestada | no mencionado | **alto** (oportunidad de differentiation perdida) |
| 3 design languages coexisting | alto (a unificar) | **CRÍTICO**, pero el fix no es unificar — es **comprometerse con uno y matar los otros dos** |
| Sistema B (paper craft) "decorativo sin función" | nota negativa | **fortaleza** — la dirección más cerca de un POV claro |
| Falta de nav persistente | alto | sigue alto, pero secundario al problema de POV estético |
| Falta de modo oscuro | alto | el skill recomienda explícitamente **variar entre light y dark themes** — implementar dark también es oportunidad de diferenciación, no sólo accesibilidad |

## c) Aplicación de las dimensiones del skill a las tres "design languages"

| Dimensión | Sistema A (UNAM cards) | Sistema B (Paper craft) | Sistema C (Worksheet) |
|---|---|---|---|
| **Dirección con nombre** | "App moderna mexicana"? No declarada | **Editorial / aged paper** — la única con POV claro | "Worksheet escolar genérico" — sin POV declarado |
| **Typography pairing** | Lora (OK) + DM Sans (borderline genérica). 3/5 | **Fraunces italic display + IBM Plex Sans body. 5/5 según skill: distintiva + refinada** | **Georgia + Arial. 0/5. Arial está en blacklist del skill.** |
| **Color** | Multi-color (calc, geo, trig, flash) — paleta distribuida, no dominante | Dominante (paper beige) + accent filoso (maroon `#8b2635`). ✓ skill pattern | Blanco + gris + accent variable por archivo. Tibio. |
| **Background atmosphere** | Gradient en header sólo | **Radial-gradient grain en `body`** ✓ — atmósfera | Plano blanco — exactamente "default to solid colors" que el skill critica |
| **Motion** | Ninguna | Ninguna | Ninguna |
| **Spatial composition** | Centered, simétrico | Centered, simétrico | Centered, simétrico |
| **AI-slop riesgo** | medio (DM Sans + gradientes) | bajo (más committed) | **alto** (Arial + plano + sin POV) |

**Conclusión por sistema:**
- **A** = intento de "app moderna" sin compromiso; tibio.
- **B** = el único con un POV claro y casi defendible (editorial/aged paper). Tipografía + color + atmósfera alineados.
- **C** = "neutral por defecto" — exactamente lo que el skill llama generic AI aesthetic.

## d) Recomendación del skill para este caso

Contexto real:
- Mini-sitio educativo para alumnos de bachillerato preparando examen UNAM.
- Audiencia: 15-18 años, contexto mexicano.
- Uso: práctica diaria, estudio antes de examen → necesita ser **calmante y legible**, no chaótico.
- Contenido: matemáticas y física → simbología, fórmulas, estructura editorial.
- Ya existe un intento (sistema B) que se acerca a un POV.

**Dirección que el skill habría propuesto: `editorial / magazine` comprometido**, evolución directa del sistema B paper-craft existente, no invención de uno nuevo.

Justificación con criterios del skill:

1. **Purpose**: estudio diario para examen → estética **calmante, legible, sostenida**. El editorial/magazine prioriza tipografía + ritmo lector, no estímulos visuales. Encaja.
2. **Tone extremo**: editorial es una opción "refined minimal" en el menú del skill. Comprometerse al editorial significa: tipografía como protagonista, drop caps, marginalia para hints, pull quotes para fórmulas clave, márgenes generosos, gris cálido/papel envejecido en lugar de blanco puro.
3. **Differentiation**: ¿qué lo haría inolvidable? Un sitio educativo mexicano para bachillerato que se ve como un libro de matemáticas de los años 60 (Editorial Trillas / Limusa de esa época) — recurrente en imaginario académico mexicano, no kitsch, no infantil. Eso ningún competidor lo tiene.
4. **Typography**: mantener **Fraunces** (display, ya está). Reemplazar IBM Plex Sans por algo más editorial, ej. **Sohne** (paywall, descartar) o gratis: **Switzer** o **Manrope** — pero el skill pediría algo más distintivo. Mejor opción gratuita alineada: **Pridi** o **Crimson Pro** para body, o **Inter Display** (mejor que Inter regular) — aunque el skill explícitamente prohíbe Inter. La mejor recomendación gratuita defendible: **Fraunces (display) + Newsreader (body)** o **Fraunces + Source Serif 4**, todo serif. Editorial puro.
5. **Color**: dominante **papel envejecido `#f4efe6`** (ya está en B) + ink **`#1a1a2e`** + accent **maroon `#8b2635`** (ya está). Cero gradientes decorativos en headers de páginas internas — sólo en el index, si acaso. **Modo oscuro** = ink negro + papel sepia tenue + accent terracota desaturado.
6. **Motion**: page-load con **stagger reveal** vertical de cards/secciones (200ms entre cada una). Acordeón B en repaso/ejercicios con easing editorial (cubic-bezier lento). Sin animaciones de hover decorativas.
7. **Spatial composition**: en index, romper la simetría — un héroe asimétrico con marginalia (contador de examen en margen derecho como nota al pie, no como card centrada). En ejercicios, el número del ejercicio como drop cap grande a la izquierda, en marginalia.
8. **Backgrounds**: mantener grain overlay (`radial-gradient` actual) en todo el sitio. Agregar separadores tipográficos (no líneas — ej. `· · ·`).

**Por qué editorial y no otra:**
- **Brutalist/raw**: alienaría adolescentes preparándose para examen estresante.
- **Maximalist chaos**: hostil para uso diario de estudio.
- **Retro-futuristic**: charm pero descontextualizado.
- **Soft/pastel**: infantil, los alumnos de prepa lo rechazan.
- **Art deco / geometric**: opción real, alineada con simbolismo matemático. Segunda mejor opción. Menos calmante para uso diario que editorial.
- **Editorial**: calmante, defendible para uso diario, aprovecha el contenido matemático ya rico, evoluciona lo único del sitio actual con POV (sistema B).

**Veredicto del skill**: comprometerse al editorial. Eliminar sistemas A y C. Reescribir los 12 ejercicios con la tipografía + atmósfera de B. El contador de Lupita, los exámenes adaptativos, las flashcards — todo en un solo POV editorial. **Sólo entonces** factorizar el CSS central — para que ese CSS encarne la decisión estética, no la promedie.

