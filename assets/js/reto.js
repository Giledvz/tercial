/*
 * reto.js — el reto relámpago de la tele: preguntas de opción múltiple con cronómetro.
 *
 * El grupo contesta en voz alta (A, B, C o D) y el maestro revela. En la tele, la
 * flecha → (o el control de presentaciones) primero revela la respuesta y luego pasa
 * a la siguiente pregunta; después de la última, a la siguiente pantalla. ← regresa
 * un paso. Cada vez que la pantalla aparece, el reto empieza de nuevo.
 *
 * Preguntas escritas (pueden llevar <sub>, <sup>, <strong> y <em>), en un JSON dentro del reto:
 *   <aside class="reto" data-diapositiva="reto" data-solo-proyeccion data-reto>
 *     <script type="application/json">{"segundos": 30, "preguntas": [{"pregunta": "…",
 *       "opciones": ["…", "…", "…", "…"], "correcta": 0, "porque": "…"}]}</script>
 *   </aside>
 * Preguntas nuevas cada vez, con los generadores de la práctica (ejercicios-motor.js):
 *   data-reto='{"segundos": 20, "cuantas": 4, "nivel": 2, "generadores": ["signos-suma", "signos-mul"]}'
 *   («conNegativos»: true descarta las operaciones que no llevan ningún negativo).
 */
(function () {
  'use strict';

  var LETRAS = ['A', 'B', 'C', 'D'];
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Del formato de los generadores al del reto.
  function desdeGenerador(M, id, nivel) {
    var e = M.GENERADORES[id](nivel);
    var pasos = (e.meta && e.meta.pasos) || [];
    return {
      pregunta: (e.meta && e.meta.ask) ? e.meta.ask : '¿Cuánto es?',
      enunciado: e.enunciado,
      texto: !!(e.meta && e.meta.texto),
      opciones: e.opciones.map(function (o) { return M.tex(o.val); }),
      correcta: e.opciones.findIndex(function (o) { return o.ok; }),
      porque: pasos.join(' ')
    };
  }

  function iniciar(raiz) {
    var datos;
    var fuente = raiz.querySelector('script[type="application/json"]');
    try { datos = JSON.parse(fuente ? fuente.textContent : raiz.getAttribute('data-reto')); } catch (_) { return; }
    var segundos = datos.segundos || 20;
    var preguntas = [];
    var i = 0, revelada = false, inicio = 0, cuadro = 0;

    raiz.innerHTML =
      '<div class="reto__cabeza">' +
        '<p class="reto__titulo"><span class="lesson-section__kicker">Reto relámpago</span>' +
        ' <span class="reto__cuenta" data-cuenta></span></p>' +
        '<div class="reto__reloj" aria-hidden="true"><span class="reto__barra" data-barra></span></div>' +
        '<span class="reto__segundos" data-segundos aria-live="off"></span>' +
      '</div>' +
      '<p class="reto__pregunta" data-pregunta></p>' +
      '<ol class="reto__opciones" data-opciones></ol>' +
      '<p class="reto__porque" data-porque aria-live="polite"></p>';
    var zonaCuenta = raiz.querySelector('[data-cuenta]');
    var barra = raiz.querySelector('[data-barra]');
    var zonaSegundos = raiz.querySelector('[data-segundos]');
    var zonaPregunta = raiz.querySelector('[data-pregunta]');
    var zonaOpciones = raiz.querySelector('[data-opciones]');
    var zonaPorque = raiz.querySelector('[data-porque]');

    function preparar() {
      if (datos.preguntas) {
        preguntas = datos.preguntas;
      } else {
        var M = window.TercialMotor;
        var ids = datos.generadores || [];
        preguntas = [];
        if (M && ids.length) {
          var orden = barajar(ids);
          for (var k = 0; k < (datos.cuantas || 4); k++) {
            var p = desdeGenerador(M, orden[k % orden.length], datos.nivel || 2);
            // «conNegativos»: en Signos, una operación sin ningún negativo no reta a nadie.
            for (var intento = 0; datos.conNegativos && p.enunciado.indexOf('−') === -1 && intento < 30; intento++) {
              p = desdeGenerador(M, orden[k % orden.length], datos.nivel || 2);
            }
            preguntas.push(p);
          }
        }
      }
    }

    function detenerReloj() { cancelAnimationFrame(cuadro); cuadro = 0; }

    function reloj(ahora) {
      var pasados = (ahora - inicio) / 1000;
      var quedan = Math.max(0, segundos - pasados);
      barra.style.transform = 'scaleX(' + (quedan / segundos).toFixed(4) + ')';
      zonaSegundos.textContent = quedan > 0 ? Math.ceil(quedan) + ' s' : '¡Tiempo!';
      raiz.classList.toggle('es-tiempo', quedan <= 0);
      cuadro = quedan > 0 ? requestAnimationFrame(reloj) : 0;
    }

    function arrancarReloj() {
      detenerReloj();
      raiz.classList.remove('es-tiempo');
      barra.style.transform = 'scaleX(1)';
      zonaSegundos.textContent = segundos + ' s';
      if (movimientoReducido.matches) return;          // sin cuenta animada: el maestro decide
      inicio = performance.now();
      cuadro = requestAnimationFrame(reloj);
    }

    function pinta() {
      var p = preguntas[i];
      if (!p) return;
      zonaCuenta.textContent = (i + 1) + ' de ' + preguntas.length;
      zonaPregunta.innerHTML = p.enunciado
        ? '<span class="reto__pide">' + p.pregunta + '</span> <span class="reto__enunciado' + (p.texto ? ' reto__enunciado--texto' : '') + '">' + p.enunciado + '</span>'
        : p.pregunta;
      zonaOpciones.classList.toggle('es-texto', !!p.texto || !p.enunciado);
      zonaOpciones.innerHTML = p.opciones.map(function (o, k) {
        return '<li class="reto__opcion' + (revelada && k === p.correcta ? ' es-correcta' : '') + '">' +
          '<span class="reto__letra">' + LETRAS[k] + '</span><span class="reto__valor">' + o + '</span></li>';
      }).join('');
      raiz.classList.toggle('es-revelada', revelada);
      zonaPorque.innerHTML = revelada && p.porque ? p.porque : '';
      raiz.dispatchEvent(new CustomEvent('tercial:cambia', { bubbles: true }));
    }

    function muestra(nueva, revelar) {
      i = nueva;
      revelada = revelar;
      pinta();
      if (revelada) detenerReloj(); else arrancarReloj();
    }

    // Los pasos que leccion.js le pregunta antes de cambiar de pantalla.
    raiz.__pasos = {
      siguiente: function () {
        if (!preguntas.length) return false;
        if (!revelada) { muestra(i, true); return true; }
        if (i < preguntas.length - 1) { muestra(i + 1, false); return true; }
        return false;
      },
      anterior: function () {
        if (!preguntas.length) return false;
        if (revelada) { muestra(i, false); return true; }
        if (i > 0) { muestra(i - 1, true); return true; }
        return false;
      }
    };

    // Un toque en las opciones también avanza (útil con el iPad, sin teclado).
    zonaOpciones.addEventListener('click', function () { raiz.__pasos.siguiente(); });

    raiz.addEventListener('tercial:diapositiva', function () {
      preparar();
      muestra(0, false);
    });
    raiz.addEventListener('tercial:sale', detenerReloj);
    preparar();
    muestra(0, false);
    detenerReloj();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-reto]'), iniciar);
})();
