/*
 * practica-sin-fin.js — práctica con ejercicios nuevos cada vez.
 *
 * Usa los generadores de window.TercialMotor (ejercicios-motor.js). Cada
 * ejercicio trae cuatro opciones; las tres falsas son errores reales, así que al
 * fallar se dice cuál fue el error y se pueden ver los pasos. El marcador de la
 * sesión y la mejor racha se guardan sólo en este dispositivo.
 *
 * Un generador puede marcar meta.texto: la pregunta es una frase y las opciones son
 * palabras, así que se escriben más chicas que una operación.
 *
 * Marcado:
 *   <div data-sin-fin data-clave="matematicas:signos"
 *        data-modos='[{"id":"suma","nombre":"Sumas y restas","generadores":["signos-suma"]}, …]'></div>
 */
(function () {
  'use strict';

  var M = window.TercialMotor;
  if (!M) return;
  var NIVELES = [1, 2, 3];
  var LETRAS = ['A', 'B', 'C', 'D'];

  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || {}; } catch (_) { return {}; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (_) {}
  }

  function iniciar(raiz) {
    var modos;
    try { modos = JSON.parse(raiz.getAttribute('data-modos')); } catch (_) { return; }
    if (!modos || !modos.length) return;
    var claveGuardado = 'tercial:sin-fin:' + (raiz.getAttribute('data-clave') || 'general');
    var memoria = leer(claveGuardado);
    var estado = {
      modo: modos.some(function (m) { return m.id === memoria.modo; }) ? memoria.modo : modos[0].id,
      nivel: NIVELES.indexOf(memoria.nivel) !== -1 ? memoria.nivel : 1,
      bien: 0, total: 0, racha: 0, mejor: memoria.mejor || 0,
      ejercicio: null, contestado: false
    };

    raiz.classList.add('sin-fin');
    raiz.innerHTML =
      '<div class="sin-fin__controles">' +
        '<div class="pastillas" role="group" aria-label="Qué practicar">' +
          modos.map(function (m) {
            return '<button class="pastilla" type="button" data-modo="' + m.id + '" aria-pressed="false">' + m.nombre + '</button>';
          }).join('') +
        '</div>' +
        '<div class="pastillas" role="group" aria-label="Nivel">' +
          NIVELES.map(function (n) {
            return '<button class="pastilla" type="button" data-nivel-ejercicio="' + n + '" aria-pressed="false">Nivel ' + n + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="sin-fin__tarjeta">' +
        '<p class="sin-fin__pregunta" data-pregunta></p>' +
        '<p class="sin-fin__enunciado" data-enunciado></p>' +
        '<div class="sin-fin__opciones" role="group" aria-label="Opciones" data-opciones></div>' +
        '<div class="sin-fin__veredicto" aria-live="polite" data-veredicto></div>' +
        '<details class="sin-fin__pasos" data-pasos hidden><summary>Ver los pasos</summary><ol></ol></details>' +
        '<div class="sin-fin__acciones"><button class="practice-action" type="button" data-otro disabled>Otro ejercicio →</button></div>' +
      '</div>' +
      '<p class="sin-fin__marcador" aria-live="polite" data-marcador></p>';

    var zonaPregunta = raiz.querySelector('[data-pregunta]');
    var zonaEnunciado = raiz.querySelector('[data-enunciado]');
    var zonaOpciones = raiz.querySelector('[data-opciones]');
    var zonaVeredicto = raiz.querySelector('[data-veredicto]');
    var zonaPasos = raiz.querySelector('[data-pasos]');
    var botonOtro = raiz.querySelector('[data-otro]');
    var zonaMarcador = raiz.querySelector('[data-marcador]');

    function marcarControles() {
      raiz.querySelectorAll('[data-modo]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-modo') === estado.modo));
      });
      raiz.querySelectorAll('[data-nivel-ejercicio]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-nivel-ejercicio')) === estado.nivel));
      });
    }

    function marcador() {
      if (!estado.total) {
        zonaMarcador.textContent = 'Cada ejercicio es nuevo. Tu marcador se guarda sólo en este dispositivo.';
        return;
      }
      var texto = 'Llevas ' + estado.bien + ' de ' + estado.total + ' bien';
      if (estado.racha >= 2) texto += ' · ' + estado.racha + ' seguidos';
      if (estado.mejor >= 3) texto += ' · tu mejor racha: ' + estado.mejor;
      zonaMarcador.textContent = texto + '.';
    }

    function nuevo() {
      var modo = modos.filter(function (m) { return m.id === estado.modo; })[0];
      var id = modo.generadores[Math.floor(Math.random() * modo.generadores.length)];
      var ejercicio = M.GENERADORES[id](estado.nivel);
      estado.ejercicio = ejercicio;
      estado.contestado = false;
      zonaPregunta.textContent = (ejercicio.meta && ejercicio.meta.ask) ? ejercicio.meta.ask + ':' : '¿Cuánto es?';
      zonaEnunciado.innerHTML = ejercicio.enunciado;
      var esTexto = !!(ejercicio.meta && ejercicio.meta.texto);
      zonaEnunciado.classList.toggle('sin-fin__enunciado--texto', esTexto);
      zonaOpciones.classList.toggle('sin-fin__opciones--texto', esTexto);
      zonaOpciones.innerHTML = '';
      ejercicio.opciones.forEach(function (opcion, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sin-fin__opcion';
        b.innerHTML = '<span class="sin-fin__letra" aria-hidden="true">' + LETRAS[i] + '</span><span class="sin-fin__valor">' + M.tex(opcion.val) + '</span>';
        b.addEventListener('click', function () { contestar(i); });
        zonaOpciones.appendChild(b);
      });
      zonaVeredicto.innerHTML = '';
      zonaVeredicto.className = 'sin-fin__veredicto';
      zonaPasos.hidden = true;
      zonaPasos.open = false;
      zonaPasos.querySelector('ol').innerHTML = (ejercicio.meta && ejercicio.meta.pasos || []).map(function (p) { return '<li>' + p + '</li>'; }).join('');
      botonOtro.disabled = true;
    }

    function contestar(i) {
      if (estado.contestado) return;
      estado.contestado = true;
      var ejercicio = estado.ejercicio;
      var elegida = ejercicio.opciones[i];
      var botones = zonaOpciones.querySelectorAll('.sin-fin__opcion');
      botones.forEach(function (b, k) {
        b.disabled = true;
        if (ejercicio.opciones[k].ok) b.classList.add('es-correcta');
      });
      estado.total++;
      if (elegida.ok) {
        estado.bien++;
        estado.racha++;
        if (estado.racha > estado.mejor) estado.mejor = estado.racha;
        zonaVeredicto.className = 'sin-fin__veredicto es-bien';
        zonaVeredicto.innerHTML = '<p><strong>Correcto.</strong>' + (estado.racha >= 3 ? ' Llevas ' + estado.racha + ' seguidos.' : '') + '</p>';
      } else {
        estado.racha = 0;
        botones[i].classList.add('es-elegida');
        zonaVeredicto.className = 'sin-fin__veredicto es-revisa';
        zonaVeredicto.innerHTML = '<p><strong>Revisa.</strong> ' + (elegida.err || 'Ese resultado no es.') + '</p>';
        zonaPasos.open = true;
      }
      zonaPasos.hidden = !zonaPasos.querySelector('li');
      botonOtro.disabled = false;
      botonOtro.focus({ preventScroll: true });
      guardar(claveGuardado, { modo: estado.modo, nivel: estado.nivel, mejor: estado.mejor });
      marcador();
    }

    raiz.querySelectorAll('[data-modo]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.modo = b.getAttribute('data-modo');
        marcarControles();
        guardar(claveGuardado, { modo: estado.modo, nivel: estado.nivel, mejor: estado.mejor });
        nuevo();
      });
    });
    raiz.querySelectorAll('[data-nivel-ejercicio]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.nivel = Number(b.getAttribute('data-nivel-ejercicio'));
        marcarControles();
        guardar(claveGuardado, { modo: estado.modo, nivel: estado.nivel, mejor: estado.mejor });
        nuevo();
      });
    });
    botonOtro.addEventListener('click', nuevo);

    marcarControles();
    marcador();
    nuevo();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-sin-fin]'), iniciar);
})();
