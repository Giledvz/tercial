# Tercial · Roadmap y canal de trabajo

> **Qué es este archivo.** El punto de comunicación común entre las personas y
> las IAs que trabajan en Tercial. Aquí se acuerda **qué se hace, en qué orden
> y quién lo toma**. Vive en `main` para que sea visible desde cualquier
> computadora y para ambas IAs. Si haces un cambio de rumbo, anótalo aquí.
>
> _(Borrador inicial armado por la IA de código el 2026-06-27 a partir del
> estado real del repo. Gil: edítalo libremente; lo marcado **[PENDIENTE GIL]**
> espera tu decisión.)_

## Quién hace qué

- **Gil** — dueño del producto: prioriza, da veredictos, aprueba merges a `main`.
- **IA de diseño** — composición, visual, sistema de diseño, propuestas de
  páginas. Trabaja en ramas (`git push origin <rama>` no publica nada).
- **IA de código** — implementación, datos, lógica, integración, performance,
  merges a `main`.
- **Canal** — este archivo. La IA de diseño propone/marca; la de código
  implementa y reporta; Gil decide. Cada quien anota en la **bitácora** de abajo.

## Las dos fases

El corte sin-login / con-login coincide con una frontera técnica real:

### Fase 1 — sin cuentas (sitio estático)
Todo corre en **GitHub Pages** tal cual hoy (HTML/CSS/JS, sin servidor). Lo que
guarde progreso vive **device-local** (`localStorage`) — pensado para que en
Fase 2 ese estado migre a una cuenta. No hay nada que proteger.

### Fase 2 — con cuentas (usuario/contraseña)
**No se puede solo con GitHub Pages** (es estático). Se resuelve sumando un
backend (Firebase o Supabase) para auth + base de datos. El **frontend puede
seguir siendo estático**; solo se le agrega ese servicio. Conceptualmente Fase 2
es "lo de Fase 1, pero el progreso device-local ahora se **sincroniza a tu
cuenta**" entre dispositivos.

## Estado actual (2026-06-27)

**En vivo (`main`)** — sitio, exámenes (PDF + adaptativos), flashcards,
formulario, y las 4 modalidades de estudio (Descarta, Relámpago, A ojo, Factos).
Factos ya trae **114 afirmaciones** (8 materias).

**En ramas, sin publicar** — todo Fase 1 (sin login):

| Rama | Feature | Estado | Veredicto |
|---|---|---|---|
| `rediseno` | Home *"La Sala de Abordaje"* (resuelve espacios vacíos) | iter. 1.1 + revisión adversarial | **[PENDIENTE GIL]** ventana cerró 22 jun |
| `mapa-bento` | *"Tu mapa"* — dominio por materias/temas (bento) | armada | **[PENDIENTE GIL]** |
| `niveles` | Bifurcación prepa/universidad (elige + home por nivel) | experimental | **[PENDIENTE GIL]** |

## Encargo activo · IA de diseño — Hoja de respuestas (128)

> **De Gil (29 jun):** "pásensela a la página de diseño a ver qué puede hacer."
> Es un layout puro (tarjeta de burbujas), tu cancha. La IA de código ya mapeó
> la fuente y las convenciones; empezó un componente CSS pero **lo revirtió a
> propósito** para que tú propongas el diseño desde cero. Si prefieres solo
> especificar y que código lo implemente, dilo en la bitácora.

**Qué es.** Migrar a lenguaje Tercial una **hoja de respuestas de lectura óptica**
(tipo Scantron / cartão-resposta) para **128 reactivos**: la hoja **en blanco**
que el alumno rellena a lápiz en los simulacros COMIPEMS.

**La fuente** (la describo porque el `.tex` está local en la laptop, fuera de git
en `migrar/overleaf/hoja-de-respuestas-128/main.tex`; es una plantilla brasileña
adaptada — ignora el cascarón "Governo do Amazonas / Milena Lima", va comentado):
- Encabezado con campos a llenar: **Alumno**, **Fecha**, **Versión**.
- **Advertencia de llenado**: correcto = burbuja totalmente rellena; incorrecto =
  media, círculo abierto, palomita, cruz, equis (conviene mostrar ejemplos visuales).
- **Rejilla**: 128 reactivos en **4 columnas de 32** (1–32 · 33–64 · 65–96 · 97–128).
  Cada reactivo = su número + 4 burbujas **A B C D**. Encabezado por columna
  "Pregunta · A B C D". El original alterna un sombreado suave (zebra) por fila.
- **Sin clave ni math** — una sola versión, en blanco.

**Convenciones Tercial (para que se vea del sistema).**
- Output: `examenes-pdf/hoja-respuestas-128.html`.
- `<head>`: los 4 CSS (`../assets/css/tokens|base|components|exam-print.css`) + las
  fonts. NO hace falta KaTeX ni `exam-clave.js` (no hay math ni clave).
- Contenedor `<main class="exam-pdf exam-pdf--neutral">` — propón un modificador
  **neutro** (hoy el hero default es coral de física; un doc multi-materia pide un
  acento coñac/neutro).
- Paleta/tokens de `exam-print.css`: `--ink-900/700/500/300`, `--crema-200/300`,
  `--accent-conac`, fuentes `--font-family-display/body`. Hairlines, sin cajas pesadas.
- Página **Letter** (márgenes del `@page` ya definidos). **Meta: que quepa en 1 hoja.**
- Verificar PDF: `node tools/build-exam-pdf.mjs examenes-pdf/hoja-respuestas-128.html /tmp/x.pdf`.
- Enlazar en `aula.html` → "Materiales de clase" (subir el contador) y marcar el
  **Bloque 16 (hoja)** en `migrar/MIGRACION.md` (☐→☑) + línea de bitácora.
- Tip de código: la rejilla de 128 se presta a un generador parametrizable por N
  (reusable para una hoja de 100, etc.) — si la quieres así, código la arma.

**Rama:** trabájalo en tu rama de diseño; Gil decide el merge a `main`.

## Backlog Fase 1 (sin login)

- [ ] **Hoja de respuestas (128)** — encargo a la IA de diseño (ver §Encargo
      activo arriba). Es el **Bloque 16** de la migración Overleaf.
- [ ] **Veredicto del rediseño** y de `mapa-bento` / `niveles`: ¿mergear a
      `main`, seguir iterando, o descartar? — **[PENDIENTE GIL]**
- [ ] **Página de resultados** — al parecer planeada por la IA de diseño
      ("Portada para página de resultados"). No está en el repo ni en Notion;
      probablemente local en el Mac mini. **[PENDIENTE GIL: ¿dónde vive?]**
- [ ] Resolver los espacios vacíos del sitio (objetivo original del rediseño).
- [ ] Crecer contenido: bancos de Factos, banco MCQ, más exámenes.
- [ ] _(Gil / IA de diseño: agreguen aquí)_

## Backlog Fase 2 (con login)

- [ ] Cuentas usuario/contraseña (Firebase o Supabase) — decidir cuál.
- [ ] Migrar el progreso device-local (`localStorage`) a la cuenta, con sync
      entre dispositivos.
- [ ] _(Posible)_ vista de maestro: asignar contenido, seguir avance por alumno.
- [ ] _(Depende de cómo cierre Fase 1)_

## Decisiones abiertas (para Gil)

1. Veredicto de las 3 ramas (rediseño / mapa / niveles).
2. ¿Dónde está el doc de "página de resultados"? (¿local en el Mac mini?)
3. Prioridad de Fase 1: ¿qué primero?

## Bitácora de handoff

> Una línea por entrega o cambio de rumbo: **fecha · quién · qué · dónde quedó.**

- 2026-06-27 · IA de código · Creado este roadmap como canal común; sincronizada
  la tanda 2 de Factos (114 afirmaciones) a `main`. · `design/roadmap.md`
- 2026-06-29 · IA de código → **IA de diseño** · Encargo: hoja de respuestas 128
  (Bloque 16) en lenguaje Tercial — ver §Encargo activo. Fuente descrita ahí (el
  `.tex` es local, fuera de git). Empecé un componente CSS de burbujas y lo
  revertí para no condicionar el diseño. **Tu turno, diseño.** · pendiente en `examenes-pdf/`
