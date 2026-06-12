# Cómo continuar la migración Overleaf → Tercial

Guía para terminar los **bloques 14, 15 y 16** exactamente con el mismo método que se usó en los bloques 1–13. Pensada para retomar en la laptop (con o sin IA). Si usas una IA, pásale este archivo + `design/exporta-pdf.md` + `migrar/MIGRACION.md`.

> Estado al 2026-06-12: **13 de 16 bloques hechos** (Física 1–11, Matemáticas 1–8, conversiones/despejes, gráficas, sucesiones, exámenes 1–8 y 13). Todo pusheado a `main`. Faltan: **14 (Química), 15 (Simulaciones 2024), 16 (Especiales)**.

---

## 0. Preparación del entorno (una vez en la laptop)

```bash
cd ~/clases                # o donde clones el repo
npm install                # instala puppeteer (necesario para generar PDFs)
```

Las fuentes `.tex` descomprimidas están en `migrar/overleaf/` (ignorado por git; si no están, descomprime los 54 zips de `~/Downloads/Overleaf Projects (54 items)` ahí). Ojo: los nombres de carpeta tienen acentos en forma NFD, por eso en los scripts se usa `find ... -name "*.tex"` en vez de rutas literales.

---

## 1. El método (idéntico en cada bloque)

1. **Leer** la fuente `.tex` del/los documento(s) del bloque en `migrar/overleaf/`.
2. **Convertir** a HTML en `examenes-pdf/` siguiendo `design/exporta-pdf.md` (sistema "Editorial cálido funcional").
3. **Verificar**: generar el PDF y revisarlo.
   ```bash
   node tools/build-exam-pdf.mjs examenes-pdf/<archivo>.html /tmp/x.pdf          # versión alumno
   node tools/build-exam-pdf.mjs examenes-pdf/<archivo>.html /tmp/x.pdf --clave  # versión clave
   ```
4. **Enlazar** en `aula.html` (sección "Exámenes" para exámenes; "Materiales de clase" para hojas/guías) y actualizar el contador de la sección.
5. **Marcar** el bloque en `migrar/MIGRACION.md` (☐→☑) y añadir una línea a la Bitácora.
6. **Commit** por bloque con el formato:
   ```
   Migración Overleaf · Bloque N: <título>

   <detalle>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
7. Al final de la sesión: `git push origin main`.

---

## 2. Convenciones obligatorias (lo que hace que se vea Tercial)

- **Boilerplate HTML**: copia el `<head>` (fonts + los 4 CSS `tokens/base/components/exam-print` con rutas `../assets/css/...`) y los dos `<script defer>` (`katex-loader.js` y, si es hoja única, `exam-clave.js`) de cualquier archivo ya hecho, p. ej. `examenes-pdf/matematicas-7.html`. **Sin el snippet final `ClasesKatex.load()` el math no renderiza.**
- **Variante por materia** en `<main class="exam-pdf exam-pdf--XXX">`: `--fisica` (coral), `--mate` (morado), `--quimica` (mostaza/ámbar), `--bio`/`--geo` (verde). Química usa **`--quimica`**.
- **Hoja única alumno/clave** (en vez de dos archivos): un solo HTML; lo que es respuesta va envuelto en `<span class="clave-only">…</span>` y los textos que solo aplican al alumno en `<span class="alumno-only">…</span>`. Sin parámetros se ve la versión alumno; con `?clave=1` aparece la clave. El PDF de cada versión se saca con/ sin `--clave`. NO crear archivos `-respuestas.html`. Detalle en `design/exporta-pdf.md` §5.4.
- **Respuesta final** subrayada: `<span class="answer-final">…</span>` (dentro de `.clave-only`).
- **Componentes disponibles** en `exam-print.css`: `__hero/__eyebrow/__title/__meta`, `__instructions`, `__section`(+`--first`), `__subsection`, `__exercises`(+`--compact`/`--cols2`/`--continue`), `__exercise`, `__body`, `__points`, `__sublist`, `__choices`, `__table`(+`__table-pair`), `__formulas`, `__figure`(+`__figure-caption`), `__total`, `__display`.
- **Math KaTeX**: `$...$`; unidades con `\mathrm{}` (`\mathrm{km/h}`, `\mathrm{m/s^2}`); espacio fino `5\,\mathrm{m}`; miles `1\,000`; pesos `\$88`. **Nunca metas `$...$` dentro de un `<text>` de SVG** (KaTeX lo rompe): en SVG usa texto plano y Unicode (°, −, ², ³).
- **Figuras**: TikZ/diagramas simples → **redibujar como SVG inline** en paleta (`#4a3f33` líneas, `#6b3a2e` acento coñac, `#ede2c5`/`#f4ecd8` rellenos crema). Imágenes complejas o muchas (química) → **copiar el PNG** a `examenes-pdf/img/<tema>/` y usar `<img>` dentro de `.exam-pdf__figure`.
- **Fidelidad**: transcribe tal cual; si detectas una errata del original, corrígela y **anótala en la Bitácora de MIGRACION.md** para que Gil la revise. Si un documento NO trae clave en Overleaf, se migra **solo alumno** (no inventes respuestas).

---

## 3. Generadores reutilizables (en `migrar/generadores/`)

Todos se ejecutan **desde la raíz del repo** y escriben en `examenes-pdf/`. Son scripts Python puros (sin dependencias).

| Script | Para qué sirve |
|---|---|
| `gen_mate.py` | Bancos de pura lista CON clave: parsea el `.tex` de **respuestas** (`\item ... \textcolor{...}{...}`) y emite hoja única. Uso: `python3 migrar/generadores/gen_mate.py <mate3\|mate4> <ruta.tex> examenes-pdf/salida.html`. Config por documento dentro del script. |
| `gen_alumno.py` | Listas SOLO alumno: parsea el `.tex` del alumno. Modos `math2` / `prose` / `auto` (auto decide por ítem si empieza con `$`). |
| `gen_graficas.py` | Función `chart(coords, xmin,xmax,ymin,ymax, xticks,yticks, ylabel)` → SVG de gráfica de línea con grid en paleta. Generó `interpretacion-graficas.html`. |
| `gen_examenes.py` | `chart()` + `build()` para exámenes combinados (2 secciones Mate+Física, `__points`, gráfica, `__total`). |
| `gen_examenes2.py` | Exámenes 5–8 (sistemas `cases`, total automático, gráfica con xmax/sub-incisos variables). |
| `gen_bloque13.py` | Exámenes 1F/1M/2M/13: helpers SVG `pie()`, `staircase()`, `prism()`, `plines()`, `insq()`, `rtri()`; opción múltiple `qc()`; figura `qf()`. **Mejor referencia para figuras geométricas.** |

Para un banco nuevo de pura lista con clave, lo más rápido es copiar `gen_mate.py`, ajustar la config (título, materia, intros, fórmulas) y correrlo.

---

## 4. Lo que falta — instrucciones por bloque

### ☐ Bloque 14 — Química (1 hoja grande)
- **Fuente**: `migrar/overleaf/quimica/.../Química (COMIPEMS).tex` (958 líneas, 8 secciones, 22 imágenes PNG `quimica1..22.png`).
- **Es una GUÍA de estudio** (teoría + tablas + diagramas), no un examen. Trae algunos `\textcolor{purple}{...}` como **respuestas de ejemplo** (en "Métodos de separación de mezclas") → trátalos como **clave** (`.clave-only` + `.answer-final`). Hay subsecciones "Ejercicio de…" que son listas para clasificar (sin respuestas) → quedan como alumno. ⇒ hacer **hoja única** `examenes-pdf/quimica-materia.html` con `--quimica`.
- **Imágenes**: copiar los 22 PNG a `examenes-pdf/img/quimica/` y referenciarlos con `<img>` dentro de `.exam-pdf__figure` (NO redibujar 22 diagramas). Comando:
  ```bash
  mkdir -p examenes-pdf/img/quimica
  QDIR=$(dirname "$(find migrar/overleaf/quimica -name '*.tex')")
  cp "$QDIR"/*.png examenes-pdf/img/quimica/
  ```
  Asegúrate de que `.gitignore` NO ignore `examenes-pdf/img/` (sí ignora `examenes-pdf/*.pdf`, no las imágenes — verificar) para que los PNG se versionen.
- **Conversión**: por tamaño conviene un convertidor LaTeX→HTML para este estilo de guía. Patrones a manejar: `\section`→`__section`(h2), `\subsection{T}`→`__subsection` (ojo: a veces traen texto después de `}` en la misma línea → va como `<p>` aparte), párrafos→`<p class="exam-pdf__section-intro">`, `\begin{itemize}[label=\ding{239}]`/`\item`→`__sublist` (hay itemize anidados), `\begin{enumerate}`→`__exercises--compact`, `\begin{tabular}`/`tabularx`→`__table`, `\includegraphics{quimicaN}`→`<img src="img/quimica/quimicaN.png">`, `\textbf{}`→`<strong>`, `\underline{}`→`<u>`, `\textcolor{purple}{X}`→`<span class="clave-only"><span class="answer-final">X</span></span>`, `\(\)`/`$`→`$...$`, `\\`/`\hfill \break`→ separadores, `\vspace{}`→ ignorar. Las 8 secciones: Conceptos básicos · Teorías atómicas · Partículas subatómicas · Configuración electrónica · Cantidad de sustancia · Tabla periódica · Enlaces químicos · Nomenclatura inorgánica.
- Verificar PDF (alumno y clave), enlazar en "Materiales de clase" del aula, commit.

### ☐ Bloque 15 — Simulaciones 2024 (2 archivos muy grandes)
- **Fuentes**: `migrar/overleaf/simulacion-de-examen-2024-v1/` (~1 380 líneas) y `simulacion-de-examen-2024-v2/` (~1 100). Son simulacros tipo COMIPEMS (muchas preguntas de opción múltiple, varias materias). Revisar si traen imágenes (v1 tenía 7, v2 1).
- Salida: `examenes-pdf/simulacion-2024-v1.html` y `-v2.html`. Si traen respuestas/clave → hoja única; si no → solo alumno. Estructura tipo examen con secciones por materia y `__choices` para opción múltiple. Reusar el patrón de `gen_bloque13.py` (qc/qf) si conviene.
- Imágenes: redibujar las simples como SVG; copiar las complejas a `examenes-pdf/img/`.

### ☐ Bloque 16 — Especiales (decidir con Gil)
- `plantilla-simulacion` — es una **plantilla** (~1 444 líneas). Decidir si se migra como simulacro o se archiva (probablemente NO se migra: es base para generar otros).
- `hoja-de-respuestas-128` — **hoja de burbujas** de 128 reactivos (lectora óptica). Layout especial que NO encaja en `exam-pdf`. Opciones: (a) diseñar un componente propio de hoja de respuestas, o (b) dejarla en LaTeX. **Pendiente de decisión de Gil.**

---

## 5. Decisiones de Gil ya tomadas (para no volver a preguntar)
- Hoja única alumno/clave con `?clave=1` (opción 1). NO archivos `-respuestas.html`.
- Examen 1 Física del zip → `examen-01-fisica.html`; se **conserva** el `examen-1-fisica.html` viejo.
- `examen12` se llama **Examen 13** (`examen-13.html`).
- Exámenes por materia con sufijo `-mate` (`examen-01-mate.html`, `examen-02-mate.html`).
- Exámenes 7 y 8 (ambos titulados "Examen 8" en Overleaf) se nombraron 7 y 8 por orden del zip — **falta que Gil confirme** la numeración real.

## 6. Pendientes para Gil (anotados en la Bitácora)
- Revisar erratas corregidas del original (ver Bitácora de MIGRACION.md, bloques 1, 3, 5, 7).
- Confirmar numeración de Examen 7/8.
- Interpretación de gráficas quedó **solo alumno**: el solucionario de Overleaf estaba a medias (placeholders `11`). Si quiere clave, se agrega inline con `.clave-only`.
- Decidir Bloque 16 (plantilla y hoja de 128).
