# Migración Overleaf → Tercial PDF

**Fuente**: `~/Downloads/Overleaf Projects (54 items)` (54 zips), descomprimidos en `migrar/overleaf/` (staging local, fuera de git).
**Destino**: `examenes-pdf/*.html` siguiendo `design/exporta-pdf.md` (Editorial cálido funcional, CSS compartido en `assets/css/exam-print.css`).
**Método**: por bloques. Cada bloque = convertir → verificar PDF con `npm run exam -- <html>` → marcar aquí → commit. El avance siempre es visible en este archivo y en `git log`.

## Reglas de conversión

- Un HTML por documento fuente. Exámenes combinados (Mate+Física) quedan en un solo archivo con dos secciones (hero secundario con `page-break-before`).
- CSS enlazado con rutas relativas (`../assets/css/...`), igual que `examen-12-mate.html` (referencia de oro).
- Math: KaTeX `$...$`, unidades con `\mathrm{}` y `\,`, miles `4\,000` (ver §5 de exporta-pdf.md).
- Figuras simples (gráficas, diagramas) → redibujar como SVG inline con paleta Tercial. Fotos/imágenes complejas → copiar PNG a `examenes-pdf/img/` y `<img>` dentro de `.exam-pdf__figure`.
- **Hoja única alumno/clave** (desde Bloque 4.5): un solo HTML por hoja con las respuestas envueltas en `.clave-only` (y variantes de texto en `.alumno-only`). Sin parámetros se ve la versión del alumno; con `?clave=1` el script `assets/js/exam-clave.js` muestra las respuestas (`.answer-final` subraya solo el valor final). PDFs: `node tools/build-exam-pdf.mjs <html>` (alumno) y `... --clave` (profesor). Ya NO se crean archivos `-respuestas.html`.
- Variantes "(interlineado)"/"(Espaciado)" = mismo contenido con espacio extra para resolver a mano → NO se migran como documento aparte (verificado por diff). Si se necesita espacio en el impreso, se decidirá con una clase CSS, no con otro archivo.

## Hallazgos del inventario

- Los nombres de zip NO siempre coinciden con el título interno: `Examen1.zip` = "Examen 2", `Examen12.zip` = "Examen 13", `Examen7.zip` = "Examen 8" (distinto contenido que `Examen8.zip` pese al título).
- `examen-1-fisica.html` y `examen-12-*.html` ya existentes en el repo NO corresponden a estos zips (contenido distinto) → ojo con colisiones de nombre al migrar "Examen 1 F" y "Examen12".
- `Física 4 (interlineado)` es en realidad **Física 2** (MRU y MRUA) con `\vspace` — no se migra.
- `Matemáticas 5 (COMIPEMS)` ≈ `Matemáticas 5` (8 líneas de diff) — revisar en su bloque si aporta algo.
- `Solucionario Matemáticas 2` ≠ `Matemáticas 2 (Respuestas)` (documentos distintos: solucionario desarrollado vs hoja con respuestas).

## Bloques

Estado: ☐ pendiente · ◐ en curso · ☑ hecho (commit)

### ☑ Bloque 1 — Física 1 y 2 (4 archivos) — HECHO 2026-06-10
- ☑ `fisica-1` (Preliminares) → `examenes-pdf/fisica-1.html`
- ☑ `fisica-1-respuestas` → `examenes-pdf/fisica-1-respuestas.html`
- ☑ `fisica-2` (MRU y MRUA) → `examenes-pdf/fisica-2.html`
- ☑ `fisica-2-respuestas` → `examenes-pdf/fisica-2-respuestas.html`

### ☑ Bloque 2 — Física 3 y 4 (3 archivos) — HECHO 2026-06-10
- ☑ `fisica-3` (Vectores) → `fisica-3.html`
- ☑ `fisica-4-dinamica` → `fisica-4.html`
- ☑ `fisica-4-dinamica-respuestas` → `fisica-4-respuestas.html`

### ☑ Bloque 3 — Física 6 y 8 (4 archivos) — HECHO 2026-06-10
- ☑ `fisica-6` (Trabajo mecánico) → `fisica-6.html`
- ☑ `fisica-6-respuestas` → `fisica-6-respuestas.html`
- ☑ `fisica-8` (Energía) → `fisica-8.html`
- ☑ `fisica-8-respuestas` → `fisica-8-respuestas.html`

### ☑ Bloque 4 — Física 9, 10 y 11 (3 archivos) — HECHO 2026-06-10
- ☑ `fisica-9` (Ondas) → `fisica-9.html`
- ☑ `fisica-10` (Electricidad y magnetismo) → `fisica-10.html`
- ☑ `fisica-11` (Densidad, presión, óptica) → `fisica-11.html`

### ☑ Bloque 5 — Matemáticas 1 y 2 (2 hojas únicas) — HECHO 2026-06-10
- ☑ `matematicas-1` + `solucionario-matematicas-1` → `matematicas-1.html` (hoja única)
- ☑ `matematicas-2` + `matematicas-2-respuestas` → `matematicas-2.html` (hoja única)
- ☑ `solucionario-matematicas-2` descartado: mismas respuestas que la versión Respuestas, sólo puestas dentro de la fracción

### ☐ Bloque 6 — Matemáticas 3 y 4 (4 archivos)
- ☐ `matematicas-3` (Productos notables) → `matematicas-3.html`
- ☐ `matematicas-3-respuestas` → `matematicas-3-respuestas.html`
- ☐ `matematicas-4` (Factorización) → `matematicas-4.html`
- ☐ `matematicas-4-respuestas` → `matematicas-4-respuestas.html`

### ☐ Bloque 7 — Matemáticas 5 y 6 (2-3 archivos)
- ☐ `matematicas-5` (Ecuaciones) → `matematicas-5.html` (revisar diff COMIPEMS)
- ☐ `matematicas-6` (Lenguaje algebraico) → `matematicas-6.html`

### ☐ Bloque 8 — Matemáticas 7 y 8 (3 archivos)
- ☐ `matematicas-7` (Estadística y probabilidad) → `matematicas-7.html`
- ☐ `matematicas-7-respuestas` → `matematicas-7-respuestas.html`
- ☐ `matematicas-8-comipems` (Repaso 6 clases) → `matematicas-8-repaso.html`

### ☐ Bloque 9 — Conversiones y despejes (3 archivos)
- ☐ `conversiones` → `conversiones.html`
- ☐ `despejes` → `despejes.html`
- ☐ `solucionario-conversiones-y-despejes` → `conversiones-despejes-solucionario.html`

### ☐ Bloque 10 — Gráficas y sucesiones (3 archivos)
- ☐ `interpretacion-de-graficas` → `interpretacion-graficas.html` (TikZ → SVG)
- ☐ `solucionario-interpretacion-de-graficas` → `interpretacion-graficas-solucionario.html`
- ☐ `sucesiones-respuestas` → `sucesiones-respuestas.html`

### ☐ Bloque 11 — Exámenes combinados I (3 archivos)
- ☐ `examen1` (título interno "Examen 2") → `examen-02.html`
- ☐ `examen3` → `examen-03.html`
- ☐ `examen4` → `examen-04.html`

### ☐ Bloque 12 — Exámenes combinados II (4 archivos)
- ☐ `examen5` → `examen-05.html`
- ☐ `examen6` → `examen-06.html`
- ☐ `examen7` (título interno "Examen 8", contenido propio) → `examen-07.html` (confirmar numeración con Gil)
- ☐ `examen8` → `examen-08.html`

### ☐ Bloque 13 — Exámenes combinados III (4 archivos)
- ☐ `examen-1-f` → nombre por definir (colisión con `examen-1-fisica.html` existente)
- ☐ `examen-1-m` → `examen-1m.html` (por definir)
- ☐ `examen-2-m` → `examen-2m.html` (por definir)
- ☐ `examen12` (título interno "Examen 13") → `examen-13.html`

### ☐ Bloque 14 — Química (1 archivo grande)
- ☐ `quimica` (8 secciones, 23 imágenes) → `quimica-materia.html`

### ☐ Bloque 15 — Simulaciones 2024 (2 archivos muy grandes)
- ☐ `simulacion-de-examen-2024-v1` (~1 380 líneas) → `simulacion-2024-v1.html`
- ☐ `simulacion-de-examen-2024-v2` (~1 100 líneas) → `simulacion-2024-v2.html`

### ☐ Bloque 16 — Especiales (decidir con Gil)
- ☐ `plantilla-simulacion` — es plantilla, ¿se migra o se archiva?
- ☐ `hoja-de-respuestas-128` — hoja de burbujas para 128 reactivos; layout especial, no encaja en exam-pdf. ¿Diseño propio o se queda en LaTeX?

## No se migran (variantes de formato, contenido duplicado)

- `fisica-4-interlineado` (= Física 2 con espacios)
- `fisica-8-espaciado` (= Física 8 con espacios)
- `matematicas-5-interlineado` (= Matemáticas 5 con espacios)

## Bitácora

- 2026-06-10 · Bloque 5 (Matemáticas 1 y 2, primeras hojas en formato único). **Erratas corregidas vs original** (revisar Gil): el solucionario de M1 alteró 3 ejercicios de "suma y resta de fracciones" respecto a la hoja del alumno (núms. 3, 7 y 8); se conservaron las expresiones del alumno y se recalcularon sus respuestas (49/48, 1/8 y 1/15). Área del terreno: 45.30×26.45 = 1 198.19 m² (solucionario decía 1 198.35). En M2: rueda ¾ de vuelta cada medio minuto en media hora = 45 vueltas (decía 22.5); taxista 12 km = $104 (decía $129.50); riñones en 90 min = 11 250 mL (decía 18 750). En la regla de 3 inversa la convención del original es inconsistente entre ítems (p. ej. 23 vs 8); se transcribió tal cual.
- 2026-06-10 · Bloque 4.5 (hoja única alumno/clave, decisión de Gil: opción 1). Los pares de Física 1, 2, 4, 6 y 8 se consolidaron en un solo HTML cada uno; los 5 `-respuestas.html` se eliminaron. Infraestructura: reglas `.clave-only`/`.alumno-only` en exam-print.css, `assets/js/exam-clave.js`, flag `--clave` en build-exam-pdf.mjs, enlaces de claves en aula.html → `?clave=1`. Verificado generando los 10 PDFs (5 alumno + 5 clave). Nota: el PDF del alumno se genera sin las respuestas en el archivo (no es ocultamiento dentro del PDF), así que no hay forma de extraerlas de ahí.

- 2026-06-09 · Setup: staging descomprimido, inventario completo, plan de bloques creado.
- 2026-06-10 · Bloque 4 (Física 9, 10 y 11 — sólo versión alumno, no hay claves en Overleaf). Figuras redibujadas en SVG: ondas transversal/longitudinal, anatomía de onda, imán con líneas de campo, presión atmosférica, barco empuje/peso, reflexión, refracción y prisma; velocidad del sonido y espectro electromagnético → tablas hairline. Imágenes descartadas por ser clipart sin información extra: infografía de electrización y caricatura Ohm/Volt/Amp (Física 10), foto Pink Floyd del prisma (Física 11, sustituida por SVG).
- 2026-06-10 · Bloque 3 (Física 6 y 8). Imágenes clipart → SVG en paleta Tercial (cuerpo empujado, half-pipe Ep/Ec, olla conducción/convección/radiación, equilibrio A-B-C); tabla de calores específicos del PNG → tabla hairline (se añadió fila Hierro 0.46/0.11, faltaba en la imagen pero la clave la usa); meme de Bob Esponja sustituido por tabla de escalas de temperatura (avisar a Gil por si lo quiere de vuelta); ΔU=Q−W → KaTeX. **Erratas de física corregidas en la clave** (revisar Gil): "1 cal = 418 J" → 4.18 J; equilibrio térmico hierro+agua daba 18.61 °C (imposible, planteaba Q_h = Q_a sin signo) → corregido a 40.63 °C con Q_cedido = Q_absorbido.
- 2026-06-10 · Bloque 2 (Física 3 y 4). Fix CSS: `__formulas > span:not(label)` — el selector descendiente roto despedazaba el KaTeX interno. Typos del original corregidos: 2.ª ley decía "inversamente proporcional a su aceleración" → "a su masa"; en Vectores "6F+8G-=" → "6F+8G="; "m/s$^s$" → m/s². Física 3 no tiene versión de respuestas en Overleaf.
- 2026-06-10 · Bloque 1 (Física 1 y 2 + respuestas). Componentes nuevos en `exam-print.css` reutilizables por los demás bloques: `__section` (+`--first`), `__subsection`, `__table` (+`__table-pair`), `__formulas`, `__exercises--compact` / `--cols2` / `--continue`; `.answer-final` ahora aplica en cualquier `.exam-pdf`. Convenciones fijadas: hojas de trabajo titulan "Física N — <em>Tema</em>", eyebrow "Hoja de trabajo · Física N" (alumno) / "Clave · profesor · Física N" (respuestas); todo HTML termina con el snippet `ClasesKatex.load()` (sin él no renderiza el math). **Erratas corregidas vs original** (revisar Gil): tabla de equivalencias decía "1 m = 100 dm" y "1 m = 10 dam" → se corrigió a "1 m = 10 dm" y "1 m = 100 cm"; despeje 19 versión alumno tenía ΔK con "+" (la versión respuestas usa "−", se tomó "−"). Verificación: 4 PDFs generados con `npm run exam` y revisados página por página.
