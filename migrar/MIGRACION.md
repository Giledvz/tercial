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

> **¿Retomando?** Lee primero `migrar/COMO-CONTINUAR.md`: tiene el método paso a paso, las convenciones, los generadores reutilizables (`migrar/generadores/`) y las instrucciones detalladas de los bloques 14–16 que faltan.

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

### ☑ Bloque 6 — Matemáticas 3 y 4 (2 hojas únicas) — HECHO 2026-06-10
- ☑ `matematicas-3` (+respuestas) → `matematicas-3.html` (132 ej)
- ☑ `matematicas-4` (+respuestas) → `matematicas-4.html` (120 ej)

### ☑ Bloque 7 — Matemáticas 5 y 6 (2 hojas, solo alumno) — HECHO 2026-06-10
- ☑ `matematicas-5` (Ecuaciones, usé variante COMIPEMS-1 con fix de typos) → `matematicas-5.html` (82 ej, sin clave en Overleaf)
- ☑ `matematicas-6` (Lenguaje algebraico) → `matematicas-6.html` (65 ej, sin clave)

### ☑ Bloque 8 — Matemáticas 7 y 8 (2 hojas) — HECHO 2026-06-10
- ☑ `matematicas-7` (+respuestas) → `matematicas-7.html` (hoja única; 2 histogramas → SVG; foto de baraja omitida)
- ☑ `matematicas-8-comipems` (Repaso 6 clases) → `matematicas-8.html` (86 ej, solo alumno)

### ☑ Bloque 9 — Conversiones y despejes (1 hoja única) — HECHO 2026-06-11
- ☑ `conversiones` + `despejes` + `solucionario-conversiones-y-despejes` → `conversiones-despejes.html`
- Conversiones = mismas 60 que Física 1 (respuestas reusadas de fisica-1, ya verificadas; el solucionario traía valores de otra versión que NO empataban). Despejes = 20 de fórmulas físicas (nuevos, distintos a los de Física 1) con clave del solucionario.

### ☑ Bloque 10 — Gráficas y sucesiones (2 hojas) — HECHO 2026-06-11
- ☑ `interpretacion-de-graficas` → `interpretacion-graficas.html` (14 ej, 12 gráficas TikZ → SVG de línea, solo alumno)
- ☑ `sucesiones-respuestas` → `sucesiones.html` (60 ej, hoja única con clave)
- ⚠ `solucionario-interpretacion-de-graficas` era un STUB (casi todas las respuestas eran `11` de placeholder; la sección de velocidad sin respuestas). No se migró clave. Gil puede agregar respuestas inline con `.clave-only` cuando quiera.

### ☑ Bloque 11 — Exámenes combinados I (3 archivos) — HECHO 2026-06-11
- ☑ `examen1` (título interno "Examen 2") → `examen-02.html`
- ☑ `examen3` → `examen-03.html`
- ☑ `examen4` → `examen-04.html`

### ☑ Bloque 12 — Exámenes combinados II (4 archivos) — HECHO 2026-06-11
- ☑ `examen5` → `examen-05.html`
- ☑ `examen6` → `examen-06.html`
- ☑ `examen7` → `examen-07.html` ⚠ título interno del original era "Examen 8"; se nombró "Examen 7" por orden secuencial del zip (Gil: confirmar si la numeración real es 7 u 8)
- ☑ `examen8` → `examen-08.html` (interno también "Examen 8")

### ☑ Bloque 13 — Exámenes 1F, 1M, 2M y 13 (4 archivos) — HECHO 2026-06-12
- ☑ `examen-1-f` → `examen-01-fisica.html` (Gil: conservar ambos; el viejo `examen-1-fisica.html` queda intacto)
- ☑ `examen-1-m` → `examen-01-mate.html`
- ☑ `examen-2-m` → `examen-02-mate.html`
- ☑ `examen12` (título interno "Examen 13") → `examen-13.html` (Gil confirmó: Examen 13)

### ☐ Bloque 14 — Química (1 archivo grande)
- ☐ `quimica` (8 secciones, 23 imágenes) → `quimica-materia.html`

### ☑ Bloque 15 — Simulaciones 2024 (2 archivos muy grandes) — HECHO 2026-06-12
- ☑ `simulacion-de-examen-2024-v1` → `simulacion-2024-v1.html` (108 reactivos · 10 materias · 18 págs)
- ☑ `simulacion-de-examen-2024-v2` → `simulacion-2024-v2.html` (103 reactivos · 9 materias · 17 págs)

### ☐ Bloque 16 — Especiales (decidir con Gil)
- ☐ `plantilla-simulacion` — es plantilla, ¿se migra o se archiva?
- ☐ `hoja-de-respuestas-128` — hoja de burbujas para 128 reactivos; layout especial, no encaja en exam-pdf. ¿Diseño propio o se queda en LaTeX?

## No se migran (variantes de formato, contenido duplicado)

- `fisica-4-interlineado` (= Física 2 con espacios)
- `fisica-8-espaciado` (= Física 8 con espacios)
- `matematicas-5-interlineado` (= Matemáticas 5 con espacios)

## Bitácora

- 2026-06-15 · Claves de los exámenes semanales 2-8 y 13 (162 reactivos). Se migraron en su día solo en versión alumno porque el original de Overleaf no traía respuestas; ahora cada uno lleva clave del profesor con el mismo mecanismo `?clave=1` de las hojas (`.clave-only` + `.answer-final`, carga de `exam-clave.js`). Resueltos desde cero con verificación doble (solucionador independiente por examen + relectura directa de cada gráfica SVG y de las figuras geométricas). Convención: `g = 9.8 m/s²` (consistente con fisica-6/8). Hallazgos: los ángulos entre paralelas del banco son IGUALES, no suplementarios (confirmado en gen_bloque13: la variante 75°/4x+15 solo da entero si son iguales). Enlazados en el plegable de claves del aula. Las gráficas posición-tiempo del banco dan velocidades poco realistas (50-125 m/s) por ser auto-generadas; las respuestas son correctas para la gráfica dibujada (avisado a Gil).
- 2026-06-12 · Bloque 15 (Simulacros 2024 v1 y v2, solo alumno — los .tex no traen clave; hecho en la laptop). Generador nuevo `migrar/generadores/gen_simulacion.py`: parsea la estructura regular (materias en `flushleft`, reactivos `\textbf{\item}`, opciones en `enumerate`) y reusa `chart()` de gen_examenes para la gráfica posición-tiempo (idéntica en ambas versiones). Numeración corrida entre materias con `--continue`, layout `--compact --cols2`. Las 5 fotos de la serie de figuras + "letra C" se copiaron a `examenes-pdf/img/simulacion-2024/`. Math partido del original (`$$ \\ $$` dentro de `cases`) reparado. **Omitidos (revisar Gil)**: un reactivo de Matemáticas v2 perdió su enunciado en el original (opciones −9 450 / −163 / 0 / 9 550 — ¿recuperar la pregunta?); duplicados exactos del original eliminados (v1: "sucesión 2n+1"; v2: "120 libros" y "cuádruple del cuadrado"); v2 traía una sección "Historia II" de puro andamiaje vacío (6 reactivos en blanco) y v1 un reactivo vacío en Química — no se emiten. Posible errata de contenido transcrita tal cual: "En la fórmula H₂O existen: 1 __ de carbono y 2 __ de oxígeno" (¿carbono → hidrógeno?).
- 2026-06-12 · Pausa: 13/16 bloques hechos y pusheados. Generadores guardados en `migrar/generadores/` y guía de continuación en `migrar/COMO-CONTINUAR.md` para terminar Química (14), Simulaciones (15) y Especiales (16) en la laptop con el mismo método.
- 2026-06-12 · Bloque 13 (Exámenes 1 Física, 1 Mate, 2 Mate, 13). Decisiones de Gil: conservar el `examen-1-fisica.html` viejo y guardar el nuevo como `examen-01-fisica.html`; numeración Examen 13; per-materia con sufijo `-mate`. Incluye opción múltiple (`.exam-pdf__choices`) y muchas figuras redibujadas en SVG: gráfica de pastel (intención de voto), escalera de cubos isométrica (serie_cubos), prisma trapezoidal (lingote), rectas paralelas con transversal + ángulos (×3, parametrizado), cuadrado inscrito, triángulo rectángulo. **Bug corregido**: las etiquetas de ángulo iban como `$...$` y KaTeX las rompía dentro del SVG → ahora van como texto plano. Generador `/tmp/gen_bloque13.py`. Las 3 imágenes PNG del banco (intencion_voto, serie_cubos, lingote_prisma) se redibujaron, no se copiaron.
- 2026-06-11 · Bloque 12 (Exámenes 5, 6, 7, 8). Más largos: incluyen sistemas de ecuaciones (`cases`), conjuntos de datos de estadística y preguntas teóricas. Gráficas xmax 24 (e5/e6) y 16 (e7/e8) con sub-incisos propios. Total de puntos calculado automáticamente. **Numeración**: examen7 y examen8 ambos tenían título interno "Examen 8" en Overleaf (copy-paste de Gil); se nombraron 7 y 8 por orden del zip — confirmar con Gil.
- 2026-06-11 · Bloque 11 (Exámenes combinados 2, 3, 4). Exámenes de fin de semana con dos secciones (Matemáticas + Física con `page-break-before`), formato `\question[N]` → `.exam-pdf__points`, gráfica posición-tiempo de física → SVG, `.exam-pdf__total`. Solo alumno (sin clave en el original). Generador `/tmp/gen_examenes.py` (reutiliza chart() de gráficas). Se enlazan en la sección "Exámenes" del aula como lista "Exámenes por fin de semana".
- 2026-06-11 · Bloque 10 (Gráficas y sucesiones). `interpretacion-graficas.html`: 12 gráficas TikZ posición/velocidad–tiempo → SVG de línea con grid en paleta Tercial (generador `/tmp/gen_graficas.py`); las tablas de datos → tabla hairline. **Solo alumno**: el solucionario de Overleaf estaba a medias (respuestas `11` de placeholder y sección de velocidad vacía), no había clave real que migrar. `sucesiones.html`: 60 sucesiones en 6 secciones, hoja única con clave (las imágenes fisica1-3.png del folder son sobras de plantilla, ignoradas). Nota: varias "respuestas" de sucesiones del original simplemente repiten un término ya dado (p. ej. 4.º término de una sucesión de 4 dados); se transcribieron fieles.
- 2026-06-11 · Bloque 9 (Conversiones y despejes → 1 hoja única). El bloque de conversiones duplica exactamente las de Física 1; reusé sus respuestas verificadas (el `solucionario-conversiones-y-despejes` tenía un set distinto de ejercicios, no empataba). Los despejes SÍ son nuevos: 20 despejes de fórmulas físicas (v=v₀+at, Coulomb, Snell, péndulos…), clave tomada del solucionario.
- 2026-06-10 · Bloque 8 (Matemáticas 7 y 8). Mate 7 (estadística + probabilidad) escrito a mano por estructura mixta (conjuntos de datos, problemas, histogramas, probabilidad anidada): los 2 histogramas TikZ → SVG de barras en paleta Tercial; la foto de la baraja (matematicas1.png) se omitió por decorativa (el problema es autosuficiente). Mate 8 (repaso, solo alumno — sin clave en Overleaf) generado con gen_alumno.py en modo `layout:'auto'`, que decide math2/prose por grupo según si los ítems empiezan con `$` (acomoda las 6 "Clases" con sus sub-bloques mixtos). **Avance: 8/16 bloques — toda Física (1-11) y Matemáticas (1-8) migradas; 19 hojas en el aula.**
- 2026-06-10 · Bloque 7 (Matemáticas 5 y 6, solo alumno — Overleaf no trae clave, como Física 3/9-11). Generadas con `/tmp/gen_alumno.py` (parsea la versión alumno; modo math2/prose). Mate 5: se usó la variante COMIPEMS-1 (corrige `x^-27x`→`x^2-27x` y agrega intro). Typos del original corregidos: `2++4(x-7)`→`2+4(x-7)` (#15 primer grado), llaves visibles `\{5x-(6+x)\}` (#23), `x^2-11x+10=`→`= 0`; los `\begin{cases}` venían con `$$ \\ $$` mal escrito → limpiado. Se descartó la caja de fórmula espuria (`a^2-b^2=(a-b)(a+b)`) que el original tenía pegada por error en "Sistema de ecuaciones".
- 2026-06-10 · Bloque 6 (Matemáticas 3 y 4). Listas enormes (132 y 120 ejercicios): generadas con `/tmp/gen_mate.py`, que parsea el `.tex` de **respuestas** (ya trae expresiones limpias + respuestas) y emite la hoja única. El parser toma expresión y respuesta de cada `\item ... \textcolor{purple}{...}`, convierte `\(\)`→`$`, `\frac`→`\dfrac`; las cajas de fórmula e intros se inyectan por config. Conviene reusar ese generador para futuros bancos de pura lista. (Las erratas del alumno —p. ej. `(6a+b)(6a+b)`, `x^3y4^`, `121a^12`— quedaron corregidas porque se tomó la expresión del solucionario.)
- 2026-06-10 · Bloque 5 (Matemáticas 1 y 2, primeras hojas en formato único). **Erratas corregidas vs original** (revisar Gil): el solucionario de M1 alteró 3 ejercicios de "suma y resta de fracciones" respecto a la hoja del alumno (núms. 3, 7 y 8); se conservaron las expresiones del alumno y se recalcularon sus respuestas (49/48, 1/8 y 1/15). Área del terreno: 45.30×26.45 = 1 198.19 m² (solucionario decía 1 198.35). En M2: rueda ¾ de vuelta cada medio minuto en media hora = 45 vueltas (decía 22.5); taxista 12 km = $104 (decía $129.50); riñones en 90 min = 11 250 mL (decía 18 750). En la regla de 3 inversa la convención del original es inconsistente entre ítems (p. ej. 23 vs 8); se transcribió tal cual.
- 2026-06-10 · Bloque 4.5 (hoja única alumno/clave, decisión de Gil: opción 1). Los pares de Física 1, 2, 4, 6 y 8 se consolidaron en un solo HTML cada uno; los 5 `-respuestas.html` se eliminaron. Infraestructura: reglas `.clave-only`/`.alumno-only` en exam-print.css, `assets/js/exam-clave.js`, flag `--clave` en build-exam-pdf.mjs, enlaces de claves en aula.html → `?clave=1`. Verificado generando los 10 PDFs (5 alumno + 5 clave). Nota: el PDF del alumno se genera sin las respuestas en el archivo (no es ocultamiento dentro del PDF), así que no hay forma de extraerlas de ahí.

- 2026-06-09 · Setup: staging descomprimido, inventario completo, plan de bloques creado.
- 2026-06-10 · Bloque 4 (Física 9, 10 y 11 — sólo versión alumno, no hay claves en Overleaf). Figuras redibujadas en SVG: ondas transversal/longitudinal, anatomía de onda, imán con líneas de campo, presión atmosférica, barco empuje/peso, reflexión, refracción y prisma; velocidad del sonido y espectro electromagnético → tablas hairline. Imágenes descartadas por ser clipart sin información extra: infografía de electrización y caricatura Ohm/Volt/Amp (Física 10), foto Pink Floyd del prisma (Física 11, sustituida por SVG).
- 2026-06-10 · Bloque 3 (Física 6 y 8). Imágenes clipart → SVG en paleta Tercial (cuerpo empujado, half-pipe Ep/Ec, olla conducción/convección/radiación, equilibrio A-B-C); tabla de calores específicos del PNG → tabla hairline (se añadió fila Hierro 0.46/0.11, faltaba en la imagen pero la clave la usa); meme de Bob Esponja sustituido por tabla de escalas de temperatura (avisar a Gil por si lo quiere de vuelta); ΔU=Q−W → KaTeX. **Erratas de física corregidas en la clave** (revisar Gil): "1 cal = 418 J" → 4.18 J; equilibrio térmico hierro+agua daba 18.61 °C (imposible, planteaba Q_h = Q_a sin signo) → corregido a 40.63 °C con Q_cedido = Q_absorbido.
- 2026-06-10 · Bloque 2 (Física 3 y 4). Fix CSS: `__formulas > span:not(label)` — el selector descendiente roto despedazaba el KaTeX interno. Typos del original corregidos: 2.ª ley decía "inversamente proporcional a su aceleración" → "a su masa"; en Vectores "6F+8G-=" → "6F+8G="; "m/s$^s$" → m/s². Física 3 no tiene versión de respuestas en Overleaf.
- 2026-06-10 · Bloque 1 (Física 1 y 2 + respuestas). Componentes nuevos en `exam-print.css` reutilizables por los demás bloques: `__section` (+`--first`), `__subsection`, `__table` (+`__table-pair`), `__formulas`, `__exercises--compact` / `--cols2` / `--continue`; `.answer-final` ahora aplica en cualquier `.exam-pdf`. Convenciones fijadas: hojas de trabajo titulan "Física N — <em>Tema</em>", eyebrow "Hoja de trabajo · Física N" (alumno) / "Clave · profesor · Física N" (respuestas); todo HTML termina con el snippet `ClasesKatex.load()` (sin él no renderiza el math). **Erratas corregidas vs original** (revisar Gil): tabla de equivalencias decía "1 m = 100 dm" y "1 m = 10 dam" → se corrigió a "1 m = 10 dm" y "1 m = 100 cm"; despeje 19 versión alumno tenía ΔK con "+" (la versión respuestas usa "−", se tomó "−"). Verificación: 4 PDFs generados con `npm run exam` y revisados página por página.
