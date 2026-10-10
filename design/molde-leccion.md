# Molde de lección · lectura y tele

Cómo está hecha una lección de Tercial y cómo se agrega la siguiente. El molde nació con los
fundamentos (semana 1: `matematicas/signos.html` y `fisica/magnitudes-unidades.html`). Hoy lo
usan las 16 lecciones de fundamentos (8 semanas, una de matemáticas y una de física en cada
una) y las 25 de Química ECOEMS (`ecoems/quimica/`). La secuencia de las 8 semanas está en
`rediseno/FUNDAMENTOS.md` (rama de Codex).

| Semana | Matemáticas (`matematicas/`) | Física (`fisica/`) |
|---|---|---|
| 1 | `signos` | `magnitudes-unidades` |
| 2 | `fracciones` | `conversiones-unidades` |
| 3 | `potencias-radicales` | `notacion-cientifica` |
| 4 | `expresiones-algebraicas` | `analisis-dimensional` |
| 5 | `productos-notables` | `graficas-leer` |
| 6 | `factorizacion` | `graficas-movimiento` |
| 7 | `ecuaciones-primer-grado` | `despejes` |
| 8 | `cuadraticas-sistemas` | `vectores-proporcionalidad` |

## Archivos

| Archivo | Qué hace |
|---|---|
| `assets/css/leccion.css` | Componentes de lección (copiados de Química), práctica sin fin, modo tele y reto |
| `assets/js/leccion.js` | Modo tele: tecla P o botón, flechas, Esc, ajuste al alto, tablas por partes, `#tele` |
| `assets/js/reto.js` | El reto relámpago: opción múltiple con cronómetro, sólo en la tele |
| `assets/js/ejercicios-motor.js` | Copia publicada del motor de Codex, con generadores de signos; los cambios van listados en su encabezado |
| `assets/js/ejercicios-fisica.js` | Generadores de la semana 1 de Física (`si-unidades`, `si-derivadas`, `si-escritura`, `si-signo`) y, en `M.fisica`, las ayudas que usan los demás: `armar`, `juntar`, `azar`, `barajar`, `conSigno`, `numero`, `opcion` |
| `assets/js/ejercicios-<lección>.js` | Los generadores de la práctica de esa lección (desde la semana 2) |
| `assets/js/practica-sin-fin.js` | La práctica: modos, niveles, tandas de 10, opciones A–D y explicación del error |
| `assets/css/materia.css` | Casa de cada materia: la ruta de 8 semanas |
| `<materia>/escenas-<materia>.js` | Las escenas de la semana 1 (contrato `{ update(dt), still() }`) |
| `<materia>/escenas-<lección>.js` y `<materia>/<lección>.css` | Desde la semana 2, cada lección trae su escena y sus estilos |

Química carga `leccion.css` antes de `quimica-material.css`; las reglas de la tele para sus
piezas propias (tablas de fórmulas, modelos atómicos, herramientas) también viven en
`leccion.css`, en su sección de proyección.

## Una lección, dos modos

La misma página sirve para leer en la compu o la tableta y para proyectar en la tele.

**Lectura.** Arriba lo que se proyecta (idea, escena, reglas, ejemplo) y abajo la
práctica y la tarea en PDF. Nada de lo que se agrega para la tele cambia la lectura: se
comprueba comparando capturas pixel por pixel contra el último commit (ver «Revisión»).

**Tele.** Con P, con el botón «Proyectar» o con `#tele` en la liga, cada elemento
con `data-diapositiva` llena una pantalla 16:9. Todo se mide en `--u`, el 1 % del ancho de
la pantalla 16:9 que cabe en la ventana, así que no quedan franjas en ninguna tele. La letra
base (1 rem) vale 1.25u: lo que el sistema mide en rem crece con la pantalla.

| Atributo | Efecto en la tele |
|---|---|
| `data-diapositiva="portada"` | El encabezado: título grande y entrada |
| `data-diapositiva="una"` | Una columna |
| `data-diapositiva="dos"` | Texto a la izquierda; el hijo con `data-lado="figura"` va a la derecha |
| `data-figura="compacta"` / `"amplia"` | En «dos»: la figura ocupa sólo su ancho, o más de la mitad |
| `data-abre` | Una herramienta envuelta se abre: sus piezas se reparten en las dos columnas |
| `data-diapositiva="reto"` + `data-solo-proyeccion` | El reto relámpago |
| `data-diapositiva="ahora"` + `data-solo-proyeccion` | «Tu tarea»: el QR que descarga el PDF de la tarea |
| `data-solo-proyeccion` en otra pantalla | Una pantalla que sólo existe en la tele (los frascos de Estados) |
| `data-solo-lectura` | Se oculta en la tele (instrucciones para el alumno, notas largas) |
| `<table data-filas-por-pantalla="5">` | Una tabla larga se ve por partes, con su encabezado en cada una |

La pantalla que está en la tele lleva la clase `es-proyectada`. Ninguna pieza de una lección
debe usar ese nombre para otra cosa (el paso actual de una animación, por ejemplo).

**Pantallas dentro de otras.** Un elemento con `data-diapositiva` dentro de una sección es su
propia pantalla y no se ve mientras se proyecta la sección: así una secuencia larga (la
historia de los modelos atómicos, los ejemplos de cambios de estado) se reparte en varias.
- Debe ser un contenedor (`div`, `figure`, `article`, `li`, `aside`), nunca un párrafo: la
  pantalla es una rejilla y partiría su texto. Una nota se envuelve en un `div`.
- `leccion.js` le pone arriba, en pequeño, el título de su sección, para que se lea como
  continuación.
- Si al leer era una rejilla de varias columnas (dos tarjetas, dos moléculas), su regla en la
  tele le devuelve las columnas: la de la pantalla es de una sola.

**Ajuste al alto.** Cada pantalla se mide al llegar, cuando la escena termina de cargar, al
tocar algo dentro y con el evento `tercial:cambia`:
- si se pasa de alto, sus piezas se encogen por igual, lo justo (hasta 65 %);
- si le sobra más de un tercio, crecen (hasta 130 %);
- si ni así cabe, se puede desplazar (último recurso: hay que repartirla).
Una tabla por partes usa el zoom de su parte más alta, para que la letra no cambie entre partes.

**Teclas.** → y ← (o Avance y Retroceso de página, lo que manda un control de presentaciones)
cambian de pantalla; ↑ y ↓ no, porque son de los controles: un desplegable, una lista. Una
tecla que un control ya atendió no llega al modo tele. Se sale con «Salir», Esc o P. La
pantalla completa es un extra: si el navegador la quita (Esc en la Mac; en el iPad, el
teclado o un gesto), la proyección sigue y los controles ofrecen «Pantalla completa».

**Pasos dentro de una pantalla.** El reto y las tablas por partes exponen
`__pasos.siguiente()` y `__pasos.anterior()`: la flecha les pregunta primero a ellos. Al
llegar de regreso (←) a una tabla por partes se ve la última parte.

**Eventos.** La pantalla que llega recibe `tercial:diapositiva` (con `detail.direccion`) y su
escena vuelve a empezar; la que se va recibe `tercial:sale`.

**Letra en la tele.** Párrafos 2u, notas 1.6u, pies de figura 1.5u, etiquetas al menos 1.2u.
Una pieza nueva con letra propia (un texto que explica una escena, una etiqueta mono) lleva su
regla en `leccion.css`; si no, se queda con los 11–13 px de la lectura.

## Cierre de la lección

En la tele, la lección termina con dos pantallas:

1. **Reto relámpago.** Cuatro preguntas de opción múltiple con cronómetro. El grupo contesta
   en voz alta (A, B, C o D); la flecha revela la respuesta con su «porque» y luego pasa a la
   siguiente pregunta.
2. **Tu tarea.** El QR descarga directo el PDF de la tarea (`…/output/pdf/tarea-<lección>.pdf`).

El reto puede generar preguntas nuevas cada vez, con los generadores de la práctica
(fundamentos):

```html
<aside class="reto" data-diapositiva="reto" data-solo-proyeccion aria-label="Reto relámpago"
  data-reto='{"segundos": 20, "cuantas": 4, "nivel": 2, "generadores": ["signos-suma", "signos-mul"]}'></aside>
```

o traerlas escritas (Química), en un JSON dentro del reto:

```html
<aside class="reto" data-diapositiva="reto" data-solo-proyeccion aria-label="Reto relámpago" data-reto>
  <script type="application/json">
    {"segundos": 30, "preguntas": [
      {"pregunta": "…", "opciones": ["…", "…", "…", "…"], "correcta": 2, "porque": "…"}
    ]}
  </script>
</aside>
```

El tiempo por pregunta va de 20 a 30 segundos, según lo que haya que pensar:
- 20 para una cuenta de un paso (Signos);
- 25 para una cuenta corta (Potencias, Conversiones);
- 30 para leer una gráfica, factorizar o hacer dos pasos de cuenta mental (Gráficas, Despejes).

Las preguntas escritas de Química usan 30.

Al escribir un reto:
- cuatro preguntas: la idea central, reconocer un ejemplo, aplicar, y una trampa que la
  lección advierte;
- pregunta de hasta 120 caracteres, opciones de hasta 45, «porque» de hasta 170;
- los distractores son errores reales; la respuesta correcta cambia de letra;
- ninguna pregunta repite un ejercicio de la tarea ni adelanta su respuesta;
- se permiten `<sub>`, `<sup>`, `<strong>` y `<em>`.

## Tipografía

- Una operación dentro de un párrafo va en `<span class="expresion">`, que no se parte.
- El número y su unidad se unen con un espacio que no se rompe: «5 m», «15 m/s». En la
  práctica de Física lo hace `juntar()`; en las páginas y las tareas, un paso automático
  sobre el texto (sin tocar los SVG).

## La práctica sin fin

```html
<div data-sin-fin data-clave="matematicas:signos" data-tanda="10" data-modos='[
  {"id":"suma","nombre":"Sumas y restas","generadores":["signos-suma"]}, …]'></div>
```

Con `data-tanda="10"` la práctica va en tandas de 10: marcador «Ejercicio N de 10 · X bien ·
tu mejor tanda» y, al final, la calificación, los errores con su respuesta correcta y «Otra
tanda».

Cada generador devuelve `{ enunciado, correcta, opciones: [{ val, ok, err }], meta }`:
- las opciones falsas son errores reales, y cada una explica el suyo;
- `meta.pasos` se abre al fallar;
- `meta.texto` marca las preguntas de frase, que van en letra más chica.

Antes de publicar un generador, se prueba con miles de ejercicios al azar. Se revisa que:
- la opción correcta valga lo que dice;
- las cuatro opciones sean distintas;
- no haya guion en vez de signo menos.

## El código QR

Va dentro del SVG, con un margen de 4 módulos, y apunta al PDF de la tarea. Se genera con
el paquete `qrcode` en nivel M. Antes de pegarlo se comprueba leyéndolo con el lector
de macOS (Core Image) desde una captura de la tele, en claro y en oscuro.

## Tarea y clave

- La tarea pública va en `examenes-pdf/tarea-<lección>.html` y su PDF en `output/pdf/`.
- Usa `exam-pdf--fundamentos`, en coñac, el color por omisión.
- Ninguna cuenta de la tarea puede aparecer resuelta en la lección, en la práctica ni en el reto,
  ni en la lección pareja de la otra materia: las dos de una semana comparten temas (Fracciones
  resolvía «3/4 h = 45 min», que estaba en la tarea de Conversiones).
- Una tarea con fracciones apiladas trae sus estilos `.fr` en su propio `<style>`:
  `tarea-print.css` todavía no los tiene.
- La clave nunca entra al repositorio: se arma fuera y queda en
  `~/Documents/Respuestas - <Tema>.pdf`.

## Color

Los fundamentos son de prepa y de universidad. La página toma el color del nivel desde
el que se llegó: `prepa.html` y `uni.html` guardan `tercial-nivel` en el navegador. Sin
ese dato, el acento es coñac, el de la universidad. Química ECOEMS es de prepa: terracota.

## Revisión

Antes de dar por buena una lección:
- **Tele.** Recorrer todas las pantallas (con sus pasos) en 1280 × 720: nada se sale, nada
  queda bajo los controles, y ninguna pantalla baja de unos 70 % de zoom; si baja, se reparte
  (una pieza a su propia pantalla, una tabla por partes, dos columnas). Revisar también 4K y 4:3.
- **Letra.** Ningún texto que importe se ve a menos de unos 13 px en la tele de referencia.
- **Lectura.** Capturas de la página completa, en 1280 y 390 de ancho, idénticas a las del
  último commit salvo lo que se cambió a propósito.
- En celular, en claro y en oscuro, y también en WebKit.

## Siguiente semana

1. Copia la lección de la semana anterior de la misma materia y cambia el contenido: la página,
   su escena (`escenas-<lección>.js`) y sus estilos (`<lección>.css`).
2. Escribe los generadores en `assets/js/ejercicios-<lección>.js` y pruébalos con miles de
   ejercicios al azar.
3. Arma el cierre: el reto y «Tu tarea» con su QR, comprobado.
4. Haz la tarea y su clave, y revisa que no repita nada de las dos lecciones de la semana.
5. Cuando las dos lecciones de la semana estén listas, ábrela en las dos casas
   (`matematicas/index.html` y `fisica/index.html`):
   - la tarjeta pasa a `ruta__semana--lista`;
   - su tema se vuelve liga a la lección;
   - en la frase puente, el nombre de la lección pareja se vuelve liga;
   - «Próximamente» cambia a «Lección · práctica · tarea»;
   - la cuenta sube («N de 8 listas»).
6. Haz la revisión completa.
