# Exportación de diseño · Tercial → ECOEMS

**Origen**: proyecto `tercial` (antes `clases`), sistema de diseño *Editorial cálido funcional* v1.0
**Fecha del paquete**: 2026-05-26
**Para**: ECOEMS — plataforma web de exámenes digitales en aula
**Destinatario**: IA que asiste el desarrollo de ECOEMS

Este archivo es autosuficiente. Cero referencias a otros archivos del repo origen — todo lo necesario para implementar la identidad visual está aquí.

---

## 1. Punto de vista del diseño

**Lo que SÍ es**: editorial cálido. Tipografía como protagonista. Paleta crema/coñac/terracota. Hairlines y bordes finos en lugar de sombras. Italics en headings para acentuar palabras clave. Motion discreto. Light + dark con auto-flip (dark = "papel quemado", no tech-dark invertido).

**Lo que NO es**: maximalismo dramático, asimetrías violentas, tech dark, gradientes saturados, glassmorphism, blobs, sombras pesadas, animaciones decorativas. **Sin fuentes "default tech": cero Lora, DM Sans, Georgia, Arial, Helvetica, Inter, Roboto, system-ui.**

**Quién es el lector**: estudiantes 15–18 años (bachillerato/preuniversitario). El tono editorial cálido aplica también al texto: lede accesible, sin jerga, ledes que invitan, no ledes técnicos.

**Adaptación al caso ECOEMS** (estudiantes 12–15 años en aula, exámenes de hasta 3h frente a pantalla):
- Mismo POV editorial, mismo tono cálido — más justificado aún por la fatiga visual de 3h.
- Recomendado: respetar el dark mode como opt-in del alumno (no impuesto). Algunos profesores prefieren light en aula con buena iluminación.
- Tablet/celular: el sistema está pensado mobile-first en breakpoints 480 / 760 / 1080.

---

## 2. Tipografía

### 2.1 Familias

| Rol | Familia | Por qué |
|---|---|---|
| Display / headings | **Fraunces** (serif variable) | Italics expresivas, opsz para escalado óptimo, carácter editorial sin ser anticuada |
| Body / UI | **IBM Plex Sans** (sans variable) | Tiene carácter sin pelearse con Fraunces, cumple la blacklist |
| Code / tabular nums | **IBM Plex Mono** | Para `<code>`, números tabulares, contadores |

### 2.2 Carga (Google Fonts, 1 request)

Pega en el `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
```

- `display=swap` para no bloquear render.
- `preconnect` minimiza handshake.
- Fraunces con `opsz` (optical size): el mismo archivo sirve para 11px y 48px con shaping óptimo. Aplica con `font-variation-settings: "opsz" <px>` en el CSS.

### 2.3 Escala (tokens + uso)

| Token | Tamaño | Familia · Peso | Uso recomendado |
|---|---|---|---|
| `--font-size-11` | 11px | Plex Sans 500 uppercase | Eyebrow, micro-labels |
| `--font-size-12` | 12px | Plex Sans 400 | Meta, captions, badges |
| `--font-size-13` | 13px | Plex Sans 400 | Texto small (créditos, conteos) |
| `--font-size-14` | 14px | Plex Sans 500 | UI: botones, inputs, nav links |
| `--font-size-15` | 15px | Plex Sans 400 | Body denso (tablas, opciones de examen) |
| `--font-size-16` | 16px | Plex Sans 400 | Body default |
| `--font-size-18` | 18px | Plex Sans 400 | Lede, body cómodo |
| `--font-size-20` | 20px | Fraunces 500 | Subhead, h4 |
| `--font-size-24` | 24px | Fraunces 500 | h3 |
| `--font-size-32` | 32px | Fraunces 500 | h2 |
| `--font-size-40` | 40px | Fraunces 500 | h1 |
| `--font-size-48` | 48px | Fraunces 600 | Hero display |

### 2.4 Reglas de italics

- **Permitido**: 1-2 palabras clave dentro de un heading en italic + color accent coñac. Ej.: `Practica con tarjetas de <em>ácidos</em> y bases`.
- **Permitido**: numeración minúscula italic en sections (`i.`, `ii.`, `iii.`).
- **Prohibido**: italic en body / párrafos / UI elements (botones, labels, inputs).

---

## 3. Tokens completos · CSS variables (pega como bloque)

Estructura en dos capas: **primitivos** (escalas con nombre por familia: crema, ink, etc.) + **semánticos** (alias por rol: bg-page, text-primary, etc.). Los componentes usan SOLO la capa semántica.

### Bloque pegable — light (`:root`)

```css
:root {
  /* Opt-out del auto-dark de Chrome con extensiones tipo Dark Reader.
     Sin esto, Chrome puede aplicar oscurecimiento algorítmico encima
     de los temas custom y producir colores muddy (cafés en vez de crema). */
  color-scheme: light;

  /* ── Tipografía ── */
  --font-family-display: 'Fraunces', serif;
  --font-family-body: 'IBM Plex Sans', sans-serif;
  --font-family-mono: 'IBM Plex Mono', monospace;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-size-11: 0.6875rem;
  --font-size-12: 0.75rem;
  --font-size-13: 0.8125rem;
  --font-size-14: 0.875rem;
  --font-size-15: 0.9375rem;
  --font-size-16: 1rem;
  --font-size-18: 1.125rem;
  --font-size-20: 1.25rem;
  --font-size-24: 1.5rem;
  --font-size-32: 2rem;
  --font-size-40: 2.5rem;
  --font-size-48: 3rem;
  --line-height-tight: 1.05;
  --line-height-snug: 1.15;
  --line-height-heading: 1.3;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.65;
  --tracking-tighter: -0.025em;
  --tracking-tight: -0.015em;
  --tracking-snug: -0.01em;
  --tracking-normal: 0;
  --tracking-meta: 0.02em;
  --tracking-eyebrow: 0.08em;
  --tracking-display-eyebrow: 0.12em;

  /* ── Espaciado (base 4) ── */
  --space-1: 0.25rem;   --space-2: 0.5rem;    --space-3: 0.75rem;
  --space-4: 1rem;      --space-5: 1.25rem;   --space-6: 1.5rem;
  --space-7: 2rem;      --space-8: 2.5rem;    --space-9: 3rem;
  --space-10: 4rem;     --space-11: 5rem;     --space-12: 6rem;

  /* ── Containers ── */
  --container-narrow: 40rem;    /*  640px lectura */
  --container-base:   47.5rem;  /*  760px hero, ejercicios */
  --container-wide:   67.5rem;  /* 1080px grids, index */
  --container-full:   80rem;    /* 1280px nav, footer */

  /* ── Radius ── */
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-pill: 999px;

  /* ── Bordes ── */
  --border-thin:   1px;
  --border-medium: 2px;
  --border-thick:  3px;

  /* ── Motion ── */
  --motion-instant: 0ms;
  --motion-fast:    120ms;
  --motion-base:    180ms;
  --motion-slow:    280ms;
  --motion-ease-standard:    cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-in:          cubic-bezier(0.4, 0, 1, 1);
  --motion-ease-emphasized:  cubic-bezier(0.2, 0.8, 0.2, 1);

  /* ── Iconos (Lucide stroke-based) ── */
  --icon-stroke-width: 1.5;
  --icon-size-sm:  14px;
  --icon-size-md:  16px;
  --icon-size-lg:  18px;
  --icon-size-xl:  20px;
  --icon-size-2xl: 24px;

  /* ── z-index ── */
  --z-base: 1; --z-raised: 10; --z-nav: 100; --z-tooltip: 200; --z-modal: 300;

  /* ── COLOR · primitivos LIGHT ── */

  /* Crema (fondo + grays cálidos). 50-200 backgrounds, 500-600 borders, 700-900 acentos meta. */
  --crema-50:  #faf7f0;
  --crema-100: #f8f3e8;
  --crema-200: #f5efe4;
  --crema-300: #efe7d8;
  --crema-400: #e6dcc4;
  --crema-500: #d9ccae;
  --crema-600: #c9bda3;
  --crema-700: #a89880;
  --crema-800: #8c7556;
  --crema-900: #6b5a44;

  /* Tinta (texto) */
  --ink-100: #c9bda3;
  --ink-300: #8c7556;
  --ink-500: #7a6448;
  --ink-700: #4a3f33;
  --ink-900: #1f1a16;

  /* Acentos editoriales */
  --accent-conac:           #6b3a2e;
  --accent-conac-soft:      #8c5240;
  --accent-terracota:       #c2410c;
  --accent-terracota-soft:  #dd6638;

  /* Estados semánticos (calibrados al tono cálido — NO los rojos/verdes saturados de UI tech) */
  --state-ok:      #4a6b3f;   --state-ok-bg:   #e7ecd9;
  --state-err:     #9c3525;   --state-err-bg:  #f1dcd4;
  --state-warn:    #8a5208;   --state-warn-bg: #f1e6c4;

  /* Categorías — paleta bimodal warm-muted ("earth palette").
     Cada cat-* se redefine en [data-theme="dark"] (ver abajo).
     Usadas como border-top de 3px sobre cards/heros. */
  --cat-blue:   #2d4f7a;   /* denim */
  --cat-amber:  #8a5a1e;   /* mostaza */
  --cat-coral:  #8c4a3a;   /* rust — diferenciado de --accent-terracota */
  --cat-teal:   #2d5c63;   /* verdigris */
  --cat-purple: #7a4a6b;   /* polvo */
  --cat-navy:   #2d3955;   /* slate */

  /* Atmósfera (grain de fondo, sub-8% siempre) */
  --grain-1: rgba(140, 117, 86, 0.04);
  --grain-2: rgba(107, 58, 46, 0.03);
  --selection-bg: rgba(107, 58, 46, 0.18);

  /* ── COLOR · semánticos (lo que consumen los componentes) ── */

  /* Fondos */
  --color-bg-page:           var(--crema-200);
  --color-bg-raised:         var(--crema-100);
  --color-bg-hover:          var(--crema-300);
  --color-bg-tooltip:        var(--crema-50);
  --color-bg-input:          var(--crema-100);
  --color-bg-input-disabled: var(--crema-400);

  /* Texto */
  --color-text-primary:     var(--ink-900);
  --color-text-secondary:   var(--ink-700);
  --color-text-meta:        var(--ink-500);  /* body inline meta (AA body) */
  --color-text-meta-large:  var(--ink-300);  /* eyebrow / tags / ≥14px bold (AA-large) */
  --color-text-placeholder: var(--ink-100);
  --color-text-on-dark:     var(--crema-100);

  /* Acentos */
  --color-accent:              var(--accent-conac);
  --color-accent-soft:         var(--accent-conac-soft);
  --color-accent-strong:       var(--accent-terracota);
  --color-accent-strong-soft:  var(--accent-terracota-soft);

  /* Bordes */
  --color-border-subtle: var(--crema-500);
  --color-border:        var(--crema-600);
  --color-border-strong: var(--crema-700);
  --color-border-focus:  var(--accent-conac);

  /* Estados */
  --color-state-ok:    var(--state-ok);    --color-state-ok-bg:   var(--state-ok-bg);
  --color-state-err:   var(--state-err);   --color-state-err-bg:  var(--state-err-bg);
  --color-state-warn:  var(--state-warn);  --color-state-warn-bg: var(--state-warn-bg);

  /* Selección */
  --color-selection-bg:   var(--selection-bg);
  --color-selection-text: var(--ink-900);
}
```

### Bloque pegable — dark (`[data-theme="dark"]`)

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* Crema dark — escala invertida en luminosidad pero misma función */
  --crema-50:  #2a2420;
  --crema-100: #221d1a;
  --crema-200: #1a1614;
  --crema-300: #231e1b;
  --crema-400: #2e2823;
  --crema-500: #3a3229;
  --crema-600: #4a3f33;
  --crema-700: #6b5a44;
  --crema-800: #8a7861;
  --crema-900: #a89880;

  /* Tinta dark */
  --ink-100: #4a3f33;
  --ink-300: #8a7861;
  --ink-500: #a89880;
  --ink-700: #d9cbb0;
  --ink-900: #efe4cf;

  /* Acentos dark (desaturados para no quemar) */
  --accent-conac:          #c79a82;
  --accent-conac-soft:     #a07a64;
  --accent-terracota:      #dd8055;
  --accent-terracota-soft: #c2663d;

  /* Estados dark */
  --state-ok:    #a3bd92;   --state-ok-bg:   #2a3526;
  --state-err:   #d68a73;   --state-err-bg:  #3a2622;
  --state-warn:  #d4a04a;   --state-warn-bg: #3a3020;

  /* Categorías dark — variantes lightened para pop sobre grafito.
     Mismas identidades (denim, mostaza, …), subidas en luminosidad. */
  --cat-blue:   #7e9ec1;
  --cat-amber:  #d4a04a;
  --cat-coral:  #c7836b;
  --cat-teal:   #7eb0b5;
  --cat-purple: #b08299;
  --cat-navy:   #8090b0;

  /* Atmósfera dark */
  --grain-1: rgba(140, 117, 86, 0.05);
  --grain-2: rgba(199, 154, 130, 0.04);
  --selection-bg: rgba(199, 154, 130, 0.22);
  --color-selection-text: var(--ink-900);
}
```

### Snippet anti-flash (PEGAR antes de cualquier `<link>` o `<style>` en `<head>`)

```html
<script>
  /* Anti-flash: aplica data-theme antes del primer paint para que
     el body no se renderee en light por 1 frame antes de saltar a dark. */
  (function () {
    var p = localStorage.getItem('tercial-theme-pref') || 'auto';
    var d = p === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : p;
    var r = document.documentElement;
    r.setAttribute('data-theme', d);
    r.setAttribute('data-theme-pref', p);
  })();
</script>
```

> Para ECOEMS, renombrar la key `tercial-theme-pref` a algo como `ecoems-theme-pref` para no colisionar si el alumno abre ambos sitios.

---

## 4. Sobre sombras (decisión de diseño explícita)

El sistema **NO usa tokens de sombra** intencionalmente. La elevación se resuelve con:
- **Borde fino** (`var(--border-thin) solid var(--color-border)`)
- **Bg ligeramente distinto** (`var(--color-bg-raised)` para "raised", `var(--color-bg-page)` para "ground")
- **Hairline + dotted border-top** para separaciones suaves

El único "shadow-like" es el `:focus-visible` outline (2px coñac), que sirve a11y, no decoración.

**Si en ECOEMS necesitas sombras** (ej. modales flotantes sobre listas largas), agrega tokens explícitos al sistema. Sugerencia para mantener el tono cálido:

```css
--shadow-sm: 0 1px 2px rgba(74, 63, 51, 0.06);
--shadow-md: 0 2px 8px rgba(74, 63, 51, 0.08), 0 1px 2px rgba(74, 63, 51, 0.04);
--shadow-lg: 0 8px 24px rgba(74, 63, 51, 0.12);
```

Usan `#4a3f33` (`--ink-700` light) con baja opacidad. Para dark, intercambiar por `rgba(0, 0, 0, 0.4)` o derivar con `color-mix(in srgb, var(--ink-900) 30%, transparent)`.

---

## 5. Componentes esenciales (CSS pegable)

Asume que los tokens del § 3 ya están definidos. Cada bloque es independiente.

### 5.1 Reset + body (de `base.css`)

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html {
  -webkit-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}
body {
  min-height: 100vh;
  font-family: var(--font-family-body);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  background-color: var(--color-bg-page);
  background-image:
    radial-gradient(at 20% 30%, var(--grain-1) 0, transparent 50%),
    radial-gradient(at 80% 70%, var(--grain-2) 0, transparent 50%);
  background-attachment: fixed;
  transition:
    background-color var(--motion-slow) var(--motion-ease-emphasized),
    color var(--motion-slow) var(--motion-ease-emphasized);
}
img, svg, video, canvas, picture { display: block; max-width: 100%; }
svg {
  fill: none; stroke: currentColor;
  stroke-width: var(--icon-stroke-width);
  stroke-linecap: round; stroke-linejoin: round;
}
input, button, textarea, select { font: inherit; color: inherit; }
button { background: none; border: none; padding: 0; cursor: pointer; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; padding: 0; }

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-heading);
  color: var(--color-text-primary);
}
h1 { font-size: var(--font-size-40); line-height: var(--line-height-tight);
     letter-spacing: var(--tracking-tight); font-variation-settings: "opsz" 96; }
h2 { font-size: var(--font-size-32); line-height: var(--line-height-snug);
     letter-spacing: var(--tracking-tight); font-variation-settings: "opsz" 64; }
h3 { font-size: var(--font-size-24); letter-spacing: var(--tracking-snug);
     font-variation-settings: "opsz" 32; }

/* Italic en headings con accent coñac — gesto editorial central */
h1 em, h2 em, h3 em { font-style: italic; color: var(--color-accent); }

p { color: var(--color-text-secondary); }
strong, b { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
em, i { font-style: italic; }
code, kbd, samp, pre { font-family: var(--font-family-mono); font-size: 0.9em; }

/* Focus visible global (a11y crítico) */
:focus { outline: none; }
:focus-visible {
  outline: var(--border-medium) solid var(--color-border-focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

::selection { background: var(--color-selection-bg); color: var(--color-selection-text); }

/* prefers-reduced-motion (a11y) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Utilidades editoriales */
.eyebrow {
  font-family: var(--font-family-body);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-meta-large);
}
.lede { font-size: var(--font-size-18); line-height: var(--line-height-loose); color: var(--color-text-secondary); }
.meta { font-size: var(--font-size-13); color: var(--color-text-meta); }

/* Container con max-widths estandarizados */
.container { width: 100%; margin-inline: auto; padding-inline: var(--space-5); }
.container--narrow { max-width: var(--container-narrow); }
.container--base   { max-width: var(--container-base); }
.container--wide   { max-width: var(--container-wide); }
.container--full   { max-width: var(--container-full); }
@media (min-width: 760px) { .container { padding-inline: var(--space-7); } }
```

### 5.2 Botones (.btn, primary/secondary/ghost)

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family-body);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  border: var(--border-thin) solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--motion-fast) var(--motion-ease-standard),
    border-color var(--motion-fast) var(--motion-ease-standard),
    color var(--motion-fast) var(--motion-ease-standard),
    transform var(--motion-fast) var(--motion-ease-standard);
}
.btn svg { width: var(--icon-size-md); height: var(--icon-size-md); }

/* Primary — usa el color de texto principal como bg (no un brand color) */
.btn--primary {
  background-color: var(--color-text-primary);
  color: var(--color-text-on-dark);
  border-color: var(--color-text-primary);
}
.btn--primary:hover {
  background-color: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
}
.btn--primary:active { transform: scale(0.98); }
.btn--primary:disabled,
.btn--primary[aria-disabled="true"] {
  background-color: var(--color-text-meta-large);
  border-color: var(--color-text-meta-large);
  color: var(--color-bg-page);
  cursor: not-allowed;
  transform: none;
}

/* Secondary — outline */
.btn--secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
.btn--secondary:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}
.btn--secondary:disabled {
  color: var(--color-text-meta-large);
  cursor: not-allowed;
}

/* Ghost — text-only */
.btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn--ghost:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### 5.3 Inputs, Select, Textarea

```css
.field { display: flex; flex-direction: column; gap: var(--space-1); }

.field__label {
  font-family: var(--font-family-body);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.field__hint {
  margin-top: var(--space-1);
  font-family: var(--font-family-body);
  font-size: var(--font-size-12);
  color: var(--color-text-meta);
}

.input, .textarea, .select {
  width: 100%;
  font-family: var(--font-family-body);
  font-size: var(--font-size-15);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  transition: border-color var(--motion-fast) var(--motion-ease-standard);
}

.input::placeholder, .textarea::placeholder {
  color: var(--color-text-placeholder);
}

.input:focus-visible, .textarea:focus-visible, .select:focus-visible {
  outline: var(--border-medium) solid var(--color-border-focus);
  outline-offset: -1px;
  border-color: var(--color-border-focus);
}

.input:disabled, .textarea:disabled, .select:disabled {
  background-color: var(--color-bg-input-disabled);
  color: var(--color-text-meta-large);
  cursor: not-allowed;
}

.textarea { min-height: var(--space-12); resize: vertical; line-height: var(--line-height-relaxed); }

/* Select con chevron SVG inline (no usa fuentes ni iconos externos) */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a3f33' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}
[data-theme="dark"] .select {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d9cbb0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
}

.field--invalid .input,
.field--invalid .textarea,
.field--invalid .select { border-color: var(--color-state-err); }
.field--invalid .field__hint { color: var(--color-state-err); }
```

### 5.4 Card

```css
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  background-color: var(--color-bg-raised);
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    border-color var(--motion-base) var(--motion-ease-standard),
    background-color var(--motion-base) var(--motion-ease-standard);
}
.card__header { display: flex; flex-direction: column; gap: var(--space-2); }
.card__title {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-20);
  line-height: var(--line-height-heading);
  color: var(--color-text-primary);
}
.card__title em { font-style: italic; color: var(--color-accent); }
.card__body {
  flex: 1;
  font-size: var(--font-size-15);
  line-height: var(--line-height-loose);
  color: var(--color-text-secondary);
}
.card__body > * + * { margin-top: var(--space-3); }
.card__footer {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding-top: var(--space-3); margin-top: var(--space-4);
  border-top: var(--border-thin) dotted var(--color-border);
  font-family: var(--font-family-body);
  font-size: var(--font-size-13);
}
.card:hover { border-color: var(--color-border-strong); background-color: var(--color-bg-page); }
```

### 5.5 Tag (chip / badge)

```css
.tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-family-body);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-meta-large);
  background-color: transparent;
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: var(--space-1) var(--space-3);
  text-decoration: none;
  transition:
    color var(--motion-fast) var(--motion-ease-standard),
    border-color var(--motion-fast) var(--motion-ease-standard);
}
.tag--accent { color: var(--color-accent-strong); border-color: var(--color-accent-strong); }
.tag--ok    { color: var(--color-state-ok);    border-color: var(--color-state-ok); }
.tag--warn  { color: var(--color-state-warn);  border-color: var(--color-state-warn); }
.tag--err   { color: var(--color-state-err);   border-color: var(--color-state-err); }
```

### 5.6 Response (banner de estado: ok / err / warn / empty)

Útil para "Tu respuesta fue correcta/incorrecta" o "Pendiente para revisar".

```css
.response {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-2) var(--space-3);
  align-items: start;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-radius: var(--radius-md);
  border-left: var(--border-thick) solid transparent;
}
.response__icon { width: var(--icon-size-lg); height: var(--icon-size-lg); margin-top: 2px; }
.response__label {
  align-self: center;
  font-family: var(--font-family-body);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
}
.response__detail {
  grid-column: 1 / -1;
  font-family: var(--font-family-body);
  font-size: var(--font-size-15);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.response--ok   { background-color: var(--color-state-ok-bg);   border-left-color: var(--color-state-ok); }
.response--ok .response__icon, .response--ok .response__label    { color: var(--color-state-ok); }

.response--err  { background-color: var(--color-state-err-bg);  border-left-color: var(--color-state-err); }
.response--err .response__icon, .response--err .response__label  { color: var(--color-state-err); }

.response--warn { background-color: var(--color-state-warn-bg); border-left-color: var(--color-state-warn); }
.response--warn .response__icon, .response--warn .response__label { color: var(--color-state-warn); }
```

---

## 6. Componentes de examen (CRUCIAL para ECOEMS — patrón 1:1)

Estos componentes son **directamente reusables** para la pantalla de examen de ECOEMS. Reflejan el patrón "contador + barra sticky + pregunta central + opciones a/b/c/d con 4 estados visuales".

### 6.1 Estructura HTML del exam stage

```html
<main class="container container--base">

  <!-- Barra sticky top: número, score, timer, progreso global -->
  <div class="exam-status">
    <div class="exam-status__row">
      <span class="exam-status__num">42 / 128</span>
      <div class="exam-status__right">
        <span class="exam-status__score">
          <span class="exam-status__score-ok">38</span>
          <span aria-hidden="true">·</span>
          <span class="exam-status__score-err">4</span>
        </span>
        <div class="exam-timer" aria-label="Tiempo restante">
          <svg class="exam-timer__svg" viewBox="0 0 36 36">
            <circle class="exam-timer__track" cx="18" cy="18" r="16"/>
            <circle class="exam-timer__fill"  cx="18" cy="18" r="16"
                    pathLength="100" stroke-dasharray="100"
                    stroke-dashoffset="35"/>
          </svg>
          <span class="exam-timer__num">2:14</span>
        </div>
      </div>
    </div>
    <div class="exam-progress"><div class="exam-progress__fill" style="width: 33%;"></div></div>
  </div>

  <!-- Cuerpo de la pregunta -->
  <article class="exam-question">
    <span class="tag tag--ok">Matemáticas · básico</span>
    <div class="exam-question__statement">
      <p>Si <em>3x + 5 = 20</em>, ¿cuál es el valor de <em>x</em>?</p>
    </div>

    <ul class="exam-options">
      <li><button class="exam-option" type="button">
        <span class="exam-option__letter">A</span>
        <span class="exam-option__text">3</span>
        <svg class="exam-option__icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </button></li>
      <li><button class="exam-option exam-option--selected" type="button">
        <span class="exam-option__letter">B</span>
        <span class="exam-option__text">5</span>
        <svg class="exam-option__icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </button></li>
      <li><button class="exam-option" type="button">
        <span class="exam-option__letter">C</span>
        <span class="exam-option__text">7</span>
        <svg class="exam-option__icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </button></li>
      <li><button class="exam-option" type="button">
        <span class="exam-option__letter">D</span>
        <span class="exam-option__text">15</span>
        <svg class="exam-option__icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </button></li>
    </ul>
  </article>

</main>
```

### 6.2 CSS del exam stage

```css
.exam-stage { display: none; }
.exam-stage.is-active { display: block; }

/* exam-status — barra sticky durante examen */
.exam-status {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  display: flex; flex-direction: column;
  gap: var(--space-2);
  max-width: var(--container-full);
  margin-inline: auto;
  padding: var(--space-3) var(--space-5);
  background-color: color-mix(in srgb, var(--color-bg-page) 92%, transparent);
  border-bottom: var(--border-thin) solid var(--color-border);
}
@media (min-width: 760px) {
  .exam-status { padding: var(--space-4) var(--space-7); }
}
.exam-status__row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-3);
}
.exam-status__num {
  font-family: var(--font-family-body);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-meta);
  font-variant-numeric: tabular-nums;
}
.exam-status__score {
  display: inline-flex; align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-family-body);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.exam-status__score-ok  { color: var(--color-state-ok); }
.exam-status__score-err { color: var(--color-state-err); }
.exam-status__right { display: flex; align-items: center; gap: var(--space-3); }

/* exam-timer — SVG circular countdown.
   pathLength="100" normaliza la geometría para que stroke-dashoffset
   sea siempre en escala 0-100 (no depende del radio).
   Animar offset desde 100 (lleno) hacia 0 (vacío). */
.exam-timer { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
.exam-timer__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.exam-timer__track { fill: none; stroke: var(--color-border); stroke-width: 3; }
.exam-timer__fill  {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 3;
  stroke-linecap: round;
  transition:
    stroke-dashoffset var(--motion-base) linear,
    stroke var(--motion-slow) var(--motion-ease-emphasized);
}
/* En los últimos ~10% del tiempo, agregar .exam-timer--critical */
.exam-timer--critical .exam-timer__fill { stroke: var(--color-state-err); }
.exam-timer__num {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  transition: color var(--motion-slow) var(--motion-ease-emphasized);
}
.exam-timer--critical .exam-timer__num { color: var(--color-state-err); }

/* exam-progress — barra lineal */
.exam-progress {
  height: 3px;
  background-color: var(--color-border-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.exam-progress__fill {
  width: 0; height: 100%;
  background-color: var(--color-accent);
  border-radius: inherit;
  transition: width var(--motion-slow) var(--motion-ease-standard);
}

/* exam-question */
.exam-question { margin-block: var(--space-6); }
.exam-question__statement {
  margin-top: var(--space-4);
  font-family: var(--font-family-body);
  font-size: var(--font-size-16);
  line-height: var(--line-height-loose);
  color: var(--color-text-primary);
}
.exam-question__statement > * + * { margin-top: var(--space-3); }

/* exam-options — 4 estados visuales clave */
.exam-options {
  --letter-size: 28px;
  display: flex; flex-direction: column; gap: var(--space-3);
  margin: var(--space-5) 0; padding: 0; list-style: none;
}
.exam-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background-color: var(--color-bg-raised);
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-15);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--motion-fast) var(--motion-ease-standard),
    background-color var(--motion-fast) var(--motion-ease-standard);
}
.exam-option:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-hover);
}
.exam-option:disabled { cursor: default; }
.exam-option__letter {
  display: inline-flex; align-items: center; justify-content: center;
  width: var(--letter-size); height: var(--letter-size);
  border-radius: var(--radius-pill);
  background-color: var(--color-bg-input);
  font-family: var(--font-family-body);
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-meta);
  transition:
    background-color var(--motion-fast) var(--motion-ease-standard),
    color var(--motion-fast) var(--motion-ease-standard);
}
.exam-option__text { min-width: 0; }
.exam-option__icon {
  width: var(--icon-size-md); height: var(--icon-size-md);
  flex-shrink: 0; opacity: 0;
  transition: opacity var(--motion-fast) var(--motion-ease-standard);
}

/* Selected (pre-validación) — la elegida pero aún sin saber si es correcta */
.exam-option--selected { border-color: var(--color-accent); }
.exam-option--selected .exam-option__letter {
  background-color: var(--color-accent);
  color: var(--color-bg-page);
}

/* Correct (post-validación) — stripe ok + check */
.exam-option--correct {
  border-left-width: var(--border-thick);
  border-left-color: var(--color-state-ok);
  background-color: var(--color-state-ok-bg);
}
.exam-option--correct .exam-option__letter {
  background-color: var(--color-state-ok);
  color: var(--color-bg-page);
}
.exam-option--correct .exam-option__icon { opacity: 1; color: var(--color-state-ok); }

/* Incorrect (post-validación, la elegida pero errónea) */
.exam-option--incorrect {
  border-left-width: var(--border-thick);
  border-left-color: var(--color-state-err);
  background-color: var(--color-state-err-bg);
}
.exam-option--incorrect .exam-option__letter {
  background-color: var(--color-state-err);
  color: var(--color-bg-page);
}
.exam-option--incorrect .exam-option__icon { opacity: 1; color: var(--color-state-err); }
```

**Iconos**: usar SVG inline tipo Lucide. Para correct: `<polyline points="20 6 9 17 4 12"/>`. Para incorrect: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`.

---

## 7. Mapeo · pantallas ECOEMS → componentes del sistema

| Pantalla ECOEMS | Componentes del sistema |
|---|---|
| **Unirse** (código + dropdown nombre) | `.container--narrow` + `.field` × 2 (`.input` para código, `.select` para nombre) + `.btn--primary` |
| **Examen** (vista activa) | `.exam-status` (sticky top) + `.exam-question` + `.exam-options` con `.exam-option` × 4. Botones de nav: `.btn--ghost` para "← Anterior", `.btn--primary` para "Siguiente →", `.btn--secondary` para "Marcar para revisar" |
| **Revisión post-envío** | Mismos `.exam-options` pero con states `.exam-option--correct` / `.exam-option--incorrect`. Cada pregunta puede acompañarse de un `.response--ok` o `.response--err` con explicación |
| **Panel del profesor (/teacher)** | `.card` (info de sala, alumno, resultado) en `.card-grid` (grid 2-3 columnas). `.tag--ok / --warn / --err` para estados de progreso. Para "ranking en tiempo real": tabla con `font-variant-numeric: tabular-nums` y `.hairline` como separador |
| **Comprobante PDF** | Documento centrado `container--narrow`, sin grain de fondo (override `body { background-image: none; }` en `@media print`), headings Fraunces grandes, datos en lista con `dt/dd` o tabla |

### Patrones a evitar (lecciones del proyecto origen)

1. **Cero `style=` inline** — siempre usar tokens del sistema. Si necesitas un valor único, agregalo como token o como modifier al component.
2. **Cero hex hardcoded** — todo color pasa por tokens. Si descubres que necesitas un color que no existe, agrégalo primero a tokens.
3. **Cero `onclick=` inline en HTML** — usar `addEventListener` desde JS.
4. **Cero fuentes blacklist** — la lista del § 1.
5. **Italics SOLO en headings/display, NUNCA en UI** (botones, labels, inputs).
6. **`pathLength="100"` en SVG circulares** — normaliza la geometría para que `stroke-dashoffset` siempre sea escala 0-100 sin depender del radio.

---

## 8. Theme toggle (light/dark)

JS mínimo. Persiste preferencia en localStorage. Acepta `light` / `dark` / `auto`.

```js
const KEY = 'ecoems-theme-pref';
const root = document.documentElement;

function getPref() { return localStorage.getItem(KEY) || 'auto'; }
function apply(pref) {
  const applied = pref === 'auto'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : pref;
  root.setAttribute('data-theme', applied);
  root.setAttribute('data-theme-pref', pref);
}
function set(pref) { localStorage.setItem(KEY, pref); apply(pref); }
function toggle() { set(getPref() === 'dark' ? 'light' : 'dark'); }

apply(getPref());
// Bind toggle to a button: btn.addEventListener('click', toggle);
```

UI sugerida: un botón `theme-toggle` en la esquina con 3 iconos SVG (sun, moon, sunmoon-half) y CSS que muestra el correcto según `[data-theme-pref="..."]`.

---

## 9. KaTeX (fórmulas matemáticas)

ECOEMS muestra matemáticas; KaTeX es el render recomendado (más rápido y predecible que MathJax).

### Loader idempotente con guard de retries

```js
// Cargar UNA SOLA VEZ. Llamar load() sin opts cuando quieras renderear math
// en el documento. Devuelve una promesa.
(function () {
  let promise = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.defer = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function loadStyle(href) {
    return new Promise((res, rej) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      l.onload = res; l.onerror = rej;
      document.head.appendChild(l);
    });
  }
  window.EcoemsKatex = {
    load() {
      if (promise) return promise;
      promise = Promise.all([
        loadStyle('https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css'),
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js'),
      ]).then(() =>
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/contrib/auto-render.min.js')
      ).then(() => {
        if (window.renderMathInElement) {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$',  right: '$',  display: false },
            ],
            throwOnError: false,
          });
        }
      });
      return promise;
    }
  };
})();
```

### Helper de render por elemento (con guard de retries)

**CRÍTICO**: si vas a renderear math en pedazos del DOM que se actualizan (ej. "siguiente pregunta"), usa este helper. Sin el guard `retries`, un bucle de microtasks puede congelar el navegador.

```js
let katexReady = null;
function ensureKatex() {
  if (!katexReady && window.EcoemsKatex) katexReady = EcoemsKatex.load();
  return katexReady;
}

function renderKatex(el, retries = 1) {
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
    });
    return;
  }
  // Si auto-render aún no cargó y nos quedan retries, esperamos al promise UNA VEZ.
  if (retries > 0 && katexReady) {
    katexReady.then(() => renderKatex(el, retries - 1));
  }
}

// Uso: cuando muestres una pregunta nueva
// ensureKatex(); renderKatex(document.querySelector('.exam-question'));
```

---

## 10. Notas de implementación específicas para ECOEMS

### 10.1 Sobre el `<style>` inline

El proyecto origen prohíbe `<style>` inline (tokens viven en `assets/css/tokens.css`). ECOEMS, por su tamaño, vive en un solo `index.html` con `<style>` inline — eso está bien. Solo asegúrate de organizar el `<style>` en bloques:
1. Tokens (`:root` + `[data-theme="dark"]`)
2. Reset + base + utilities
3. Componentes generales (.btn, .field, .input, .card, .tag, .response)
4. Componentes de examen (.exam-*)
5. Componentes específicos de ECOEMS (.salon, .alumno-card, etc.)

Cada bloque comentado con `/* === N · NOMBRE === */`.

### 10.2 Fatiga visual de 3 horas

El sistema usa crema #f5efe4 en light (no blanco puro) precisamente por esto. **No cambies el bg a blanco** "para que se vea más limpio" — la calidez baja la fatiga.

### 10.3 Mobile-first

Breakpoints del sistema: `480px`, `760px`, `1080px`. ECOEMS en tablets/celulares debe usar:
- `<760px`: una columna, opciones a/b/c/d apiladas (ya están así por default), `.exam-options` con padding generoso para targets de touch ≥44×44px.
- `>=760px`: misma estructura pero con más aire (`container--base` queda en 760px max).

### 10.4 Socket.io: no afecta el diseño

Los updates en tiempo real (ej. score del alumno, progreso global) deben actualizar SOLO los datos dentro de los componentes ya estilizados — no inyectar HTML con estilos propios.

### 10.5 PDF / comprobante

Para `@media print`:
```css
@media print {
  body {
    background-image: none;
    background-color: #fff;
    color: #000;
  }
  .site-nav, .exam-status, .exam-timer { display: none; }
  /* Mantén Fraunces para identidad visual */
}
```

---

## 11. Screenshots (lo que no puedo entregar como archivo)

No genero imágenes. Para que la otra IA tenga referencias visuales, recomiendo:

### Opción A — capturas de producción

URL: **https://giledvz.github.io/tercial/**

Páginas con patrones análogos a ECOEMS:

| Pantalla ECOEMS | URL análoga en Tercial | Qué captura |
|---|---|---|
| Examen activo | `https://giledvz.github.io/tercial/examen_unam_area2.html` → arrancar examen | exam-status sticky + exam-question + exam-options + timer SVG |
| Examen adaptativo (mate) | `https://giledvz.github.io/tercial/examen_adaptativo.html` | mismo patrón, dark/light |
| Revisión post-envío | Mismo examen, completar y ver resultados | exam-option--correct / --incorrect + breakdown |
| Card grid (panel) | `https://giledvz.github.io/tercial/` | layout de cards en grid responsivo |
| Form (similar a "unirse") | No hay análogo directo en producción; usar el comparador del § 11 abajo |

**Capturas recomendadas**:
1. `examen_unam_area2.html` en stage "examen" — light + dark
2. Mismo examen en stage "resultados" — light
3. `index.html` — para card grid
4. Cualquier ejercicio (ej. `dinamica.html`) — para hero + accordions

Capturar a 1440×900 (desktop) y 414×896 (mobile / iPhone Plus).

### Opción B — dev server local (si tienes el repo)

Si el repo `tercial` está clonado:

```bash
cd /Users/giledvz/tercial
mkdir -p /tmp/tercial-serve
ln -sfn $(pwd) /tmp/tercial-serve/tercial
cd /tmp/tercial-serve && python3 -m http.server 8765
```

Abre `http://localhost:8765/tercial/` y captura las mismas pantallas. Press `D` en el comparador para flip light/dark.

---

## 12. Checklist de migración a ECOEMS

Recomendación de orden, dependencias hacia adentro:

- [ ] Paso 1: Pegar el `<script>` anti-flash del § 3 ANTES de cualquier otro recurso en `<head>`.
- [ ] Paso 2: Pegar el `<link>` de Google Fonts (§ 2.2).
- [ ] Paso 3: En el `<style>`, pegar bloque `:root` (§ 3) y bloque `[data-theme="dark"]` (§ 3).
- [ ] Paso 4: Pegar reset + base + utilities (§ 5.1).
- [ ] Paso 5: Pegar componentes generales que ECOEMS use: btn (§ 5.2), inputs (§ 5.3), card (§ 5.4), tag (§ 5.5), response (§ 5.6).
- [ ] Paso 6: Pegar componentes de examen (§ 6.2) para la pantalla principal.
- [ ] Paso 7: Implementar theme toggle del § 8.
- [ ] Paso 8: Si hay matemáticas, agregar loader KaTeX del § 9.
- [ ] Paso 9: Refactorizar HTML pantalla por pantalla siguiendo el mapeo del § 7.
- [ ] Paso 10: Audit final — `grep` para:
  - `<style>` adicionales no documentados
  - `style=` inline
  - Fuentes blacklist en `font-family`
  - `onclick=` inline
  - Hex hardcoded sin token

---

## 13. Si necesitas más

El proyecto origen vive en https://github.com/Giledvz/tercial. Archivos clave si quieres profundizar:
- `assets/css/tokens.css` — fuente de verdad de tokens
- `assets/css/base.css` — reset
- `assets/css/components.css` — todos los componentes (~1700 LOC)
- `design/design-system.md` — spec completa (~870 LOC)
- `design/comparar-paleta-bimodal.html` — decision record del refactor light/dark de cat-*
- `examen_unam_area2.html` — pantalla 1:1 con la de ECOEMS

---

**Fin del paquete.** Con § 1–§ 6 ya tienes lo esencial para empezar; el resto refina.
