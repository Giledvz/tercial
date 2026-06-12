# Rediseño · brief del experimento (junio 2026)

**Rama de trabajo**: `rediseno` (parte de `main` al 2026-06-12).
**Ventana**: hasta el **22 de junio de 2026** (prueba del modelo nuevo de Claude).
**Estado**: experimento en curso — nada de esto está publicado.

## El problema

A Gil no le gustan los **espacios en blanco** que tiene la página actualmente:
hay zonas que se sienten demasiado vacías. El objetivo es **re-idear la web**
(proponer otra forma de componerla) de modo que ese vacío se resuelva — no
solo rellenar huecos, sino repensar la composición donde haga falta.

Antes de proponer, **auditar dónde está el problema**: recorrer las páginas
(inicio, aula, exámenes, materias, tarjetas…) y señalar en cuáles y en qué
viewports se siente el vacío. El sistema de diseño vigente es
*Editorial cálido funcional* (ver `design/design-system.md` y
`design/exporta-pdf.md`); las propuestas pueden evolucionarlo, pero que sea
una decisión consciente y documentada, no accidental.

## Reglas de trabajo (no negociables)

1. **Todo en la rama `rediseno`** — `main` es producción (GitHub Pages la
   sirve a los alumnos) y no se toca durante el experimento.
2. **Un commit por idea/iteración**, con mensaje que diga qué se intentó.
   Así se puede regresar a cualquier iteración intermedia con `git checkout`.
3. Pushear la rama (`git push origin rediseno`) para verla desde la otra
   compu; eso NO publica nada.
4. Preview local: symlink `tercial` + `python3 -m http.server` (rutas
   `/tercial/*`), PDFs con `node tools/build-exam-pdf.mjs`.
5. Los PDFs de examen ya migrados (`examenes-pdf/`) tienen su propio lenguaje
   cerrado — el rediseño es del **sitio web**, no de los PDFs.

## Veredicto (al cierre, máx. 22 de junio)

- Gusta → merge `rediseno` → `main` y push (eso publica).
- No gusta → se borra la rama; `main` quedó intacta.
- Gusta a medias → la rama vive y se pasan a `main` solo las piezas buenas.

## Notas de las iteraciones

### Iteración 1 — "La Sala de Abordaje" (2026-06-12)

**Proceso**: auditoría con capturas (el vacío venía de que TODO el sitio usa
el container de 760px aunque existen tokens de 1080/1280 sin usar, y de un
index-catálogo organizado por materia sin nada vivo) → panel de 5 conceptos
generados por agentes independientes (sala de abordaje, portada de periódico,
pizarrón vivo, mapa de metro del curso, centro de mando) → 3 jueces con
lentes distintas (alumno de 15, directora de arte editorial, ingeniero front).
**Los 3 votaron por la Sala de Abordaje** con el mismo híbrido de podas.

**Qué es**: el index como estación. Marquesina con fecha/hora y "próxima
salida"; tablero de salidas con los 14 alumnos agrupados por fecha (todos
visibles, ya no carrusel de 1 en 1); el alumno toca su nombre y la página
se vuelve su **pase de abordar** (localStorage) — nombre en Fraunces itálica,
días restantes en cifra gigante, "tu siguiente paso" según urgencia (4 reglas),
flip al ver caer un día; **la pregunta de hoy** (misma para toda la clase,
semilla por fecha local, teclas 1-4, racha); acciones como **andenes** por
verbo (01 Practica · 02 Examínate · 03 Repasa · 04 Imprime); listas densas
con dot leaders; el aula ECOEMS por fin enlazada (estaba huérfana); tira
"Despegaron" para los que ya presentaron. Todo a 1280px (--container-full).

**Contratos respetados**: ids #examenes/#fisica/#matematicas vivos,
<site-nav> intacto, EXAMENES editable inline en index.html, cero libs nuevas,
dark "papel quemado" gratis vía tokens, reduced-motion, mobile con pase
primero y footer con los 6 destinos canónicos.

**Archivos**: index.html (reescrito), assets/css/home.css (nuevo),
assets/js/home.js (nuevo). Verificado con capturas 1440/390, light/dark,
estado visitante y estado adoptado (Ximena).

**Pendiente de veredicto de Gil**: ¿el tono "estación/abordaje" le late?
¿la pregunta del día con racha se queda? Ideas en banca para iteración 2:
rieles con scroll-snap en andenes móviles, "fórmula del día" con KaTeX,
mapa strip de temas con progreso (idea rescatada del concepto del metro).
