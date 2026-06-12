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

(El modelo que trabaje aquí: anota cada iteración — qué se propuso, en qué
commit quedó, qué opinó Gil.)
