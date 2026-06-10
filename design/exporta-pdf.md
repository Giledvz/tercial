# Exportación de diseño · Tercial → Generación de PDFs de examen

**Origen**: proyecto `tercial`, sistema de diseño *Editorial cálido funcional* v1.0
**Para**: otra IA que genera HTMLs imprimibles (exámenes, guías, hojas de ejercicios)
**Objetivo**: que los PDFs producidos por ese otro proyecto se vean idénticos a los del repo Tercial

Este archivo es autosuficiente. Pega el CSS, sigue la estructura HTML, y el PDF resultante hereda la identidad de Tercial.

---

## 1. Punto de vista

**Editorial cálido funcional aplicado a documento impreso.**

- **Tipografía como protagonista**: Fraunces italic para el título y los números de ejercicio. Plex Sans para el cuerpo.
- **Paleta cálida**: fondo crema, tinta oscura cálida (no negro puro), acentos coñac.
- **Hairlines, no sombras**: separación por bordes finos (`border-left`, `border-top`, `border-bottom`).
- **Sin maximalismo**: nada de cajas con fondo de color, nada de sombras, nada de iconos decorativos. El énfasis viene de tipografía e italics, no de saturación.
- **Light siempre**: los exámenes no usan dark mode. `<html data-theme="light">`.

**Lo que NO es**: Times New Roman, Arial, Comic Sans, encabezados con fondo de color, columnas de texto, cajas con sombra, iconos clipart, marcas de agua.

---

## 2. Boilerplate del HTML

Toda página de examen empieza así:

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Examen N — Materia · Tercial</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">

  <!-- KaTeX para fórmulas matemáticas (sólo si las hay) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
          onload="renderMathInElement(document.body, {delimiters: [{left: '$', right: '$', display: false}, {left: '$$', right: '$$', display: true}]});"></script>

  <!-- TODO el CSS de Tercial-PDF (§3 abajo). Pégalo embebido o
       sírvelo como archivo. -->
  <style>/* ver § 3 */</style>
</head>
<body>

<main class="exam-pdf exam-pdf--fisica">
  <!-- ver § 4 estructura -->
</main>

</body>
</html>
```

---

## 3. CSS completo (cópialo tal cual)

Pégalo dentro de `<style>` o como `exam-print.css`. Es self-contained.

```css
/* ============================================================
   TOKENS — paleta cálida + tipografía
   ============================================================ */
:root {
  color-scheme: light;

  --font-family-display: 'Fraunces', serif;
  --font-family-body: 'IBM Plex Sans', sans-serif;
  --font-family-mono: 'IBM Plex Mono', monospace;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Crema (fondos) */
  --crema-100: #faf6ec;
  --crema-200: #f4ecd8;
  --crema-300: #ede2c5;

  /* Tinta (texto) */
  --ink-300: #8c7556;
  --ink-500: #7a6448;
  --ink-700: #4a3f33;
  --ink-900: #1f1a16;

  /* Acentos editoriales */
  --accent-conac: #6b3a2e;          /* coñac — italics, border-left de instrucciones, número de ejercicio */
  --accent-terracota: #c2410c;

  /* Categorías de materia (border-top del hero) */
  --cat-coral:  #8c4a3a;   /* física */
  --cat-purple: #7a4a6b;   /* matemáticas, cálculo */
  --cat-amber:  #8a5a1e;   /* química */
  --cat-teal:   #2d5c63;   /* biología, geo */
  --cat-blue:   #2d4f7a;
  --cat-navy:   #2d3955;

  /* Espaciado base 4pt */
  --space-1: 4pt;
  --space-2: 8pt;
  --space-3: 12pt;
  --space-4: 16pt;
  --space-5: 20pt;
  --space-7: 28pt;

  --tracking-eyebrow: 0.08em;
  --tracking-meta: 0.04em;
}

/* ============================================================
   @page — Letter, márgenes editoriales, numeración de página
   ============================================================ */
@page {
  size: letter;
  margin: 0.85in 0.9in 1in 0.9in;
  @bottom-right {
    content: counter(page);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 9pt;
    color: #8c7556;
    padding-top: 0.2in;
  }
  @top-left { content: ""; } @top-center { content: ""; } @top-right { content: ""; }
  @bottom-left { content: ""; } @bottom-center { content: ""; }
}

body {
  margin: 0;
  background-color: var(--crema-200);
}

/* ============================================================
   Container del examen
   ============================================================ */
.exam-pdf {
  max-width: 6.7in;
  margin: 0 auto;
  padding: 0.4in 0;
  font-family: var(--font-family-body);
  font-size: 11pt;
  line-height: 1.55;
  color: var(--ink-900);
}

/* ============================================================
   Hero — encabezado de la primera página
   ============================================================ */
.exam-pdf__hero {
  border-top: 3px solid var(--cat-coral);   /* sobrescribir por materia */
  padding-top: 0.4in;
  margin-bottom: 0.45in;
}
.exam-pdf--fisica .exam-pdf__hero  { border-top-color: var(--cat-coral); }
.exam-pdf--mate   .exam-pdf__hero  { border-top-color: var(--cat-purple); }
.exam-pdf--quimica .exam-pdf__hero { border-top-color: var(--cat-amber); }
.exam-pdf--bio    .exam-pdf__hero  { border-top-color: var(--cat-teal); }

.exam-pdf__eyebrow {
  font-size: 10pt;
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--ink-300);
  margin: 0 0 var(--space-3);
}

.exam-pdf__title {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-medium);
  font-size: 36pt;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--ink-900);
  margin: 0 0 var(--space-3);
  font-variation-settings: "opsz" 96;
}
.exam-pdf__title em {
  font-style: italic;
  color: var(--accent-conac);
}

.exam-pdf__meta {
  font-size: 11pt;
  color: var(--ink-500);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.exam-pdf__meta strong {
  font-weight: var(--font-weight-medium);
  color: var(--ink-700);
}

/* ============================================================
   Bloque de instrucciones — border-left coñac + padding-left
   ============================================================ */
.exam-pdf__instructions {
  border-left: 3px solid var(--accent-conac);
  padding: 2pt 0 2pt var(--space-5);
  margin: 0 0 0.5in;
}
.exam-pdf__instructions-label {
  display: block;
  font-size: 9pt;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--ink-300);
  margin: 0 0 var(--space-2);
}
.exam-pdf__instructions p {
  margin: 0;
  font-size: 10.5pt;
  color: var(--ink-700);
  line-height: 1.55;
}

/* ============================================================
   Lista de ejercicios — numerados con counter
   ============================================================ */
.exam-pdf__exercises {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: exercise;
}

.exam-pdf__exercise {
  counter-increment: exercise;
  display: grid;
  grid-template-columns: 0.42in minmax(0, 1fr);
  column-gap: var(--space-4);
  margin-bottom: var(--space-7);
  page-break-inside: avoid;
}
.exam-pdf__exercise::before {
  content: counter(exercise) ".";
  font-family: var(--font-family-display);
  font-style: italic;
  font-weight: var(--font-weight-medium);
  font-size: 17pt;
  color: var(--accent-conac);
  text-align: right;
  line-height: 1.1;
  padding-top: 1pt;
  font-variant-numeric: lining-nums;
}

.exam-pdf__body {
  font-size: 11pt;
  line-height: 1.5;
  color: var(--ink-900);
}
.exam-pdf__body p { margin: 0 0 var(--space-2); }
.exam-pdf__body p:last-child { margin-bottom: 0; }

/* ============================================================
   Puntos del ejercicio — "1 pt", "3 pts"
   ============================================================ */
.exam-pdf__points {
  font-size: 8.5pt;
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-meta);
  text-transform: uppercase;
  color: var(--ink-300);
  margin-right: var(--space-1);
  vertical-align: 1.5pt;
  white-space: nowrap;
}

/* ============================================================
   Math display (centrado, fuera del flujo de párrafo)
   ============================================================ */
.exam-pdf__display {
  margin: var(--space-3) 0;
  text-align: center;
  font-size: 11.5pt;
}

/* ============================================================
   Sub-incisos (a, b, c)
   ============================================================ */
.exam-pdf__sublist {
  list-style: none;
  padding: 0;
  margin: var(--space-3) 0 0;
  counter-reset: subitem;
}
.exam-pdf__sublist > li {
  counter-increment: subitem;
  position: relative;
  padding-left: 0.4in;
  margin-bottom: var(--space-1);
  font-size: 10.5pt;
  color: var(--ink-700);
  line-height: 1.5;
}
.exam-pdf__sublist > li::before {
  content: counter(subitem, lower-alpha) ")";
  position: absolute;
  left: 0;
  top: 0;
  width: 0.3in;
  text-align: right;
  color: var(--ink-500);
}

/* ============================================================
   Opciones múltiples (A, B, C, D)
   ============================================================ */
.exam-pdf__choices {
  list-style: none;
  padding: 0;
  margin: var(--space-3) 0 0;
  counter-reset: choice;
}
.exam-pdf__choices > li {
  counter-increment: choice;
  position: relative;
  padding-left: 0.4in;
  margin-bottom: 2pt;
  font-size: 10.5pt;
  color: var(--ink-700);
  line-height: 1.5;
}
.exam-pdf__choices > li::before {
  content: counter(choice, upper-alpha) ".";
  position: absolute;
  left: 0;
  top: 0;
  width: 0.3in;
  text-align: right;
  font-weight: var(--font-weight-medium);
  color: var(--ink-500);
}

/* ============================================================
   Clave del profesor — sección de respuestas
   ============================================================ */
.exam-pdf__answer-key .exam-pdf__exercise .exam-pdf__body {
  border-left: 2px solid var(--accent-conac);
  padding-left: var(--space-4);
}

/* Subrayar la RESPUESTA FINAL para que se vea desde lejos
   (ej. proyectada al fondo del salón). Envuelve el valor
   con <span class="answer-final">…</span>.
   USAR border-bottom, no text-decoration, porque KaTeX usa
   display: inline-block y text-decoration no atraviesa. */
.exam-pdf__answer-key .answer-final {
  display: inline-block;
  border-bottom: 2px solid var(--accent-conac);
  padding-bottom: 1px;
  line-height: 1.2;
}

/* ============================================================
   Total de puntos (cierre)
   ============================================================ */
.exam-pdf__total {
  margin-top: 0.4in;
  padding-top: var(--space-4);
  border-top: 1px solid var(--ink-300);
  text-align: right;
  font-size: 10pt;
  color: var(--ink-500);
}
.exam-pdf__total-label {
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  margin-right: var(--space-2);
}
.exam-pdf__total-value {
  font-family: var(--font-family-display);
  font-style: italic;
  font-size: 14pt;
  color: var(--accent-conac);
  font-variant-numeric: lining-nums;
}

/* ============================================================
   Figura embebida (SVG inline)
   ============================================================ */
.exam-pdf__figure {
  margin: var(--space-3) 0;
  text-align: center;
  page-break-inside: avoid;
}
```

---

## 4. Estructura HTML (en orden)

```html
<main class="exam-pdf exam-pdf--fisica">   <!-- --mate, --quimica, --bio, etc. -->

  <header class="exam-pdf__hero">
    <p class="exam-pdf__eyebrow">Evaluación · ECOEMS · Física</p>
    <h1 class="exam-pdf__title">Examen 12 — <em>Física</em></h1>
    <p class="exam-pdf__meta"><strong>Prof. Gil</strong> · 30 de mayo de 2026 · versión alumno</p>
  </header>

  <div class="exam-pdf__instructions">
    <span class="exam-pdf__instructions-label">Instrucciones</span>
    <p>Resuelve cada ejercicio. Todas las respuestas deben estar simplificadas y encerradas.</p>
  </div>

  <ol class="exam-pdf__exercises">

    <!-- Ejercicio simple -->
    <li class="exam-pdf__exercise"><div class="exam-pdf__body">
      <p><span class="exam-pdf__points">1 pt</span>Convierte $4\,\mathrm{km}$ a $\mathrm{m}$.</p>
    </div></li>

    <!-- Ejercicio con incisos -->
    <li class="exam-pdf__exercise"><div class="exam-pdf__body">
      <p><span class="exam-pdf__points">2 pts</span>Un tren recorre $180\,\mathrm{km}$ en $2$ horas. Calcula:</p>
      <ol class="exam-pdf__sublist">
        <li>Su velocidad en $\mathrm{km/h}$.</li>
        <li>¿Qué distancia recorrerá en $5$ horas?</li>
      </ol>
    </div></li>

    <!-- Ejercicio con math display -->
    <li class="exam-pdf__exercise"><div class="exam-pdf__body">
      <p><span class="exam-pdf__points">1 pt</span>Resuelve:</p>
      <div class="exam-pdf__display">$$\dfrac{2}{3}\,m + 1 = 5 - \dfrac{1}{3}\,m.$$</div>
    </div></li>

    <!-- Opciones múltiples -->
    <li class="exam-pdf__exercise"><div class="exam-pdf__body">
      <p><span class="exam-pdf__points">1 pt</span>¿Cuál NO es una unidad de fuerza?</p>
      <ol class="exam-pdf__choices">
        <li>Newton</li>
        <li>Dina</li>
        <li>Joule</li>
        <li>kgf</li>
      </ol>
    </div></li>

    <!-- Ejercicio con figura SVG -->
    <li class="exam-pdf__exercise"><div class="exam-pdf__body">
      <p><span class="exam-pdf__points">1 pt</span>Halla $x$ en la figura:</p>
      <figure class="exam-pdf__figure">
        <svg viewBox="0 0 360 200" width="360" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Descripción accesible">
          <defs>
            <style>
              .geo-line  { stroke: #4a3f33; stroke-width: 1.2; fill: none; }
              .geo-label { font-family: 'IBM Plex Sans', sans-serif; font-weight: 400; font-size: 12px; fill: #877b6c; }
            </style>
          </defs>
          <!-- Líneas, etiquetas, etc. -->
        </svg>
      </figure>
    </div></li>

  </ol>

  <div class="exam-pdf__total">
    <span class="exam-pdf__total-label">Total de puntos</span>
    <span class="exam-pdf__total-value">35</span>
  </div>

  <!-- OPCIONAL: clave del profesor en página separada -->
  <section class="exam-pdf__answer-key" style="page-break-before: always; margin-top: 3rem;">
    <header class="exam-pdf__hero">
      <p class="exam-pdf__eyebrow">Clave · profesor</p>
      <h2 class="exam-pdf__title">Respuestas</h2>
      <p class="exam-pdf__meta">Soluciones esperadas — 27 ejercicios · 35 pts</p>
    </header>

    <ol class="exam-pdf__exercises">
      <li class="exam-pdf__exercise"><div class="exam-pdf__body">
        <!-- envolver el VALOR FINAL con .answer-final → border-bottom coñac -->
        <p>$4\,\mathrm{km} = 4 \times 1\,000 = $ <span class="answer-final">$4\,000\,\mathrm{m}$</span>.</p>
      </div></li>
      <!-- ... -->
    </ol>
  </section>

</main>
```

---

## 5. Convenciones obligatorias

### 5.1 Math (KaTeX)

- **Inline**: `$\dfrac{a}{b}$` — siempre con `$…$`
- **Display centrado**: dentro de `<div class="exam-pdf__display">$$…$$</div>`
- **Unidades**: `\mathrm{km/h}`, `\mathrm{m/s^2}`, `\Omega` — siempre con `\mathrm{}` para que no se vean en italics
- **Espacio fino antes de unidad**: `5\,\mathrm{m}` (no `5\mathrm{m}` ni `5 \mathrm{m}`)
- **Miles**: `4\,000` (no `4,000` ni `4.000` ni `4000`)
- **Pesos $**: escapar con backslash: `\$114`

### 5.2 Identidad tipográfica

- **Título del examen**: la palabra clave de la materia siempre en `<em>` → renderiza italic coñac. Ej. `Examen 12 — <em>Física</em>`.
- **Eyebrow del hero**: uppercase, gris cálido (`--ink-300`).
- **Meta**: `<strong>Prof. Gil</strong> · fecha · versión` — bold sólo en el nombre del profesor.

### 5.3 Subrayar la respuesta final (clave del profesor)

Envuelve SÓLO el valor final (no toda la línea) con `<span class="answer-final">…</span>`. Casos:

- **Numérico con unidad**: `… = $ <span class="answer-final">$60\,\mathrm{m}$</span>.`
- **Texto conceptual** (ej. ley): `<span class="answer-final">igual magnitud y dirección opuesta</span>`
- **Opción múltiple**: `<span class="answer-final"><strong>B</strong></span>: …`
- **Multi-parte (a/b/c)**: cada respuesta lleva su propio `.answer-final` independiente.

El `border-bottom` se ve con cualquier contenido (math, texto, bold). NO uses `text-decoration: underline` — se rompe con KaTeX.

### 5.4 Hoja única alumno/clave (convención del repo Tercial)

En `examenes-pdf/` las hojas de trabajo viven en UN solo HTML con las dos
versiones. Las respuestas van envueltas en `.clave-only` y los textos que
sólo aplican al alumno en `.alumno-only`:

- Por defecto la página muestra la versión del alumno (CSS oculta `.clave-only`).
- Con `?clave=1`, `assets/js/exam-clave.js` agrega `.is-clave` al `<main>` y
  aparecen las respuestas (cada valor final con `.answer-final`).
- PDFs: `node tools/build-exam-pdf.mjs <html>` (alumno) y `… --clave` (profesor).
- El PDF del alumno se genera sin las respuestas en el documento; no es
  contenido oculto dentro del PDF.

Patrón típico:

```html
<p class="exam-pdf__eyebrow"><span class="alumno-only">Hoja de trabajo · Física 1</span><span class="clave-only">Clave · profesor · Física 1</span></p>
…
<li class="exam-pdf__exercise">$5\,\mathrm{km}$ a $\mathrm{m}$ = <span class="clave-only"><span class="answer-final">$5\,000\,\mathrm{m}$</span></span></li>
…
<p class="clave-only">$F = ma = 3\,\mathrm{kg} \times 15\,\mathrm{m/s^2} =$ <span class="answer-final">$45\,\mathrm{N}$</span></p>
```

### 5.5 Page breaks

- `<li class="exam-pdf__exercise">` ya trae `page-break-inside: avoid` — un ejercicio nunca se corta a la mitad.
- Para forzar nueva página (ej. antes de la clave del profesor): `style="page-break-before: always;"` o `<section class="exam-pdf__answer-key" style="page-break-before: always;">`.

---

## 6. Variantes por materia

Agrega al `<main>` la clase `--<materia>` para que el border-top del hero use el color correcto:

| Materia | Clase | Color | Token |
|---|---|---|---|
| Física | `.exam-pdf--fisica` | coral rust | `--cat-coral` |
| Matemáticas / Cálculo | `.exam-pdf--mate` | morado polvo | `--cat-purple` |
| Química | `.exam-pdf--quimica` | mostaza | `--cat-amber` |
| Biología | `.exam-pdf--bio` | verdigris | `--cat-teal` |
| Geografía / Historia | `.exam-pdf--geo` | verdigris | `--cat-teal` |

Sólo cambia el border-top de 3px. Todo lo demás (tipografía, accent coñac de italics y números, instrucciones, etc.) es idéntico entre materias — la identidad Tercial es una sola.

---

## 7. Generación del PDF

1. Abrir el HTML en Chrome.
2. Cmd+P (Mac) / Ctrl+P (Win).
3. Destino: "Guardar como PDF".
4. **Desactivar** "Encabezados y pies de página" del navegador (ya los inyectamos por CSS con `@page`).
5. **Márgenes**: "Predeterminados" — el CSS ya define `margin: 0.85in 0.9in 1in 0.9in`.
6. **Gráficos de fondo**: ACTIVADO (para que se imprima el crema).

Para automatizar (Puppeteer):

```js
await page.pdf({
  path: 'examen.pdf',
  format: 'Letter',
  printBackground: true,
  preferCSSPageSize: true,   // respeta @page
});
```

---

## 8. Checklist antes de entregar

- [ ] `<html data-theme="light">` (no auto, no dark)
- [ ] Fonts cargados con `display=swap` y los 3 families completos
- [ ] `<main class="exam-pdf exam-pdf--<materia>">` con la variante correcta
- [ ] Título usa `<em>` en la palabra clave de la materia
- [ ] Instrucciones dentro de `.exam-pdf__instructions` con eyebrow
- [ ] Cada ejercicio es `<li class="exam-pdf__exercise"><div class="exam-pdf__body">…</div></li>`
- [ ] Puntos como `<span class="exam-pdf__points">1 pt</span>` AL INICIO del primer `<p>` del body
- [ ] Math siempre con `\mathrm{}` para unidades y `\,` para espacio fino
- [ ] Miles con `\,` (`4\,000`, no `4,000`)
- [ ] Si hay clave del profesor: `<section class="exam-pdf__answer-key" style="page-break-before: always;">` y cada respuesta envuelta con `.answer-final`
- [ ] Total al cierre con `.exam-pdf__total`
- [ ] PDF probado en Chrome con backgrounds activos y headers/footers desactivados

---

## 9. Referencias en producción

Ejemplos en vivo (para inspirarse en la composición y revisar render):

- `https://giledvz.github.io/tercial/examenes-pdf/examen-12-fisica.html` — examen alumno
- `https://giledvz.github.io/tercial/examenes-pdf/examen-12-fisica-respuestas.html` — clave del profesor con `.answer-final`
- `https://giledvz.github.io/tercial/examenes-pdf/examen-12-mate.html`
- `https://giledvz.github.io/tercial/examenes-pdf/examen-12-mate-respuestas.html`

Captura en PDF cualquiera de esos para usar como referencia visual de "esto es lo que tiene que verse igual".
