# Molde de lección · Fundamentos (Matemáticas y Física)

Cómo está hecha una lección de fundamentos y cómo se agrega la siguiente semana.
El piloto es la semana 1: `matematicas/signos.html` y `fisica/magnitudes-unidades.html`.
La secuencia de las 8 semanas está en `rediseno/FUNDAMENTOS.md` (rama de Codex).

## Archivos

| Archivo | Qué hace |
|---|---|
| `assets/css/leccion.css` | Componentes de lección (copiados de Química), práctica sin fin y modo proyección |
| `assets/js/leccion.js` | Modo proyección: tecla P o botón, flechas, Esc |
| `assets/js/ejercicios-motor.js` | Copia publicada del motor de Codex, con generadores de signos; los cambios van listados en su encabezado |
| `assets/js/ejercicios-fisica.js` | Generadores de Física (`si-unidades`, `si-derivadas`, `si-escritura`, `si-signo`) |
| `assets/js/practica-sin-fin.js` | La práctica: modos, niveles, opciones A–D y explicación del error |
| `assets/css/materia.css` | Casa de cada materia: la ruta de 8 semanas |
| `<materia>/escenas-<materia>.js` | Las escenas animadas (contrato `{ update(dt), still() }`) |
| `<materia>/<materia>.css` | Estilos propios de esas escenas |

## Una lección, dos modos

La misma página sirve para leer en la compu o la tableta y para proyectar en la tele.

**Lectura.** Arriba lo que se proyecta (idea, escena, reglas, ejemplo) y abajo la
práctica sin fin y la tarea en PDF.

**Tele.** Con P o con el botón «Proyectar en la tele», cada elemento con
`data-diapositiva` llena una pantalla 16:9. Todo se mide en `--u`, el 1 % del ancho de la
pantalla 16:9 que cabe en la ventana, así que no quedan franjas en ninguna tele.

| Atributo | Efecto en la tele |
|---|---|
| `data-diapositiva="portada"` | El encabezado: título grande y entrada |
| `data-diapositiva="una"` | Una columna |
| `data-diapositiva="dos"` | Texto a la izquierda; el hijo con `data-lado="figura"` va a la derecha |
| `data-figura="compacta"` | En «dos»: la figura ocupa sólo su ancho (un cuadro, una tabla corta) |
| `data-diapositiva="ahora"` + `data-solo-proyeccion` | La pantalla «Ahora tú», con el código QR a la práctica |
| `data-solo-lectura` | Se oculta en la tele (instrucciones para el alumno, notas largas) |

Cada pantalla cabe en 1280 × 720 (una tele 1080p al 150 %). Si no cabe, se sale por
abajo; nunca se encima, porque las filas miden lo que su contenido. Al llegar a una
pantalla se dispara el evento `tercial:diapositiva`, y su escena vuelve a empezar.

## La práctica sin fin

```html
<div data-sin-fin data-clave="matematicas:signos" data-modos='[
  {"id":"suma","nombre":"Sumas y restas","generadores":["signos-suma"]}, …]'></div>
```

Cada generador devuelve `{ enunciado, correcta, opciones: [{ val, ok, err }], meta }`:
- las opciones falsas son errores reales, y cada una explica el suyo;
- `meta.pasos` se abre al fallar;
- `meta.texto` marca las preguntas de frase, que van en letra más chica.

Antes de publicar un generador, se prueba con miles de ejercicios al azar. Se revisa que:
- la opción correcta valga lo que dice;
- las cuatro opciones sean distintas;
- no haya guion en vez de signo menos.

## El código QR

Va dentro del SVG, con un margen de 4 módulos, y apunta a `…/<lección>.html#practica`. Se genera con
el paquete `qrcode` en nivel M. Antes de pegarlo se comprueba leyéndolo con el lector
de macOS (Core Image) desde una captura de la tele, en claro y en oscuro.

## Tarea y clave

- La tarea pública va en `examenes-pdf/tarea-<lección>.html` y su PDF en `output/pdf/`.
- Usa `exam-pdf--fundamentos`, en coñac, el color por omisión.
- Ninguna cuenta de la tarea puede aparecer resuelta en la lección ni en la práctica.
- La clave nunca entra al repositorio: se arma fuera y queda en
  `~/Documents/Respuestas - <Tema>.pdf`.

## Color

Los fundamentos son de prepa y de universidad. La página toma el color del nivel desde
el que se llegó: `prepa.html` y `uni.html` guardan `tercial-nivel` en el navegador. Sin
ese dato, el acento es coñac, el de la universidad.

## Siguiente semana

1. Copia la lección de la semana anterior de la misma materia y cambia el contenido.
2. Agrega el generador de la práctica, si hace falta, y pruébalo.
3. Genera el QR y compruébalo.
4. Haz la tarea y su clave.
5. En la casa de la materia (`<materia>/index.html`), cambia la semana de «Próximamente» a lista.
6. Revisa la lección en lectura, en celular y en la tele, en claro y en oscuro, y también en WebKit.
