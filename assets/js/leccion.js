/*
 * leccion.js — lo que comparten las lecciones de Tercial.
 *
 * Modo proyección: cada elemento con [data-diapositiva] se vuelve una pantalla
 * que llena la tele. Se entra con el botón [data-proyectar] o con la tecla P; se
 * avanza con las flechas, Avance/Retroceso de página (lo que manda un control de
 * presentaciones) o la barra espaciadora, y se sale con Esc o P. Arranca en la
 * sección que estaba a la vista y, al salir, regresa a la que quedó en pantalla.
 * Lo marcado con [data-solo-proyeccion] (la pantalla «Ahora tú», con el código QR)
 * sólo existe en este modo. Cada pantalla que llega a la tele recibe el evento
 * «tercial:diapositiva»: las escenas lo usan para empezar desde el principio.
 * Con #tele en la liga (…/signos.html#tele) la lección abre ya en este modo: sirve
 * para el navegador de la propia tele o una compu conectada a ella, sin teclado.
 */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var diapositivas = Array.prototype.slice.call(document.querySelectorAll('[data-diapositiva]'));
  if (!diapositivas.length) return;

  var actual = 0;
  var controles = null;
  var conPantallaCompleta = false;

  // La unidad de la tele (--u). El diseño mide 100 × 56.25 unidades, un 16:9. En una pantalla
  // más cuadrada (un iPad 4:3, una MacBook 16:10) sobra alto: la unidad crece hasta conservar
  // el área del diseño, como mucho 15 %, y el texto se reacomoda en más renglones. En 16:9 o
  // más ancha, la unidad es la de siempre.
  function medir() {
    var w = window.innerWidth, h = window.innerHeight;
    var u = Math.min(h / 56.25, Math.sqrt(w * h / 5625), w / 100 * 1.15);
    raiz.style.setProperty('--u', u.toFixed(2) + 'px');
  }

  function crearControles() {
    controles = document.createElement('div');
    controles.className = 'proyeccion-controles';
    controles.hidden = true;
    controles.innerHTML =
      '<span class="proyeccion-controles__cuenta" aria-live="polite"></span>' +
      '<button class="proyeccion-controles__boton" type="button" data-proyeccion-anterior aria-label="Pantalla anterior">←</button>' +
      '<button class="proyeccion-controles__boton" type="button" data-proyeccion-siguiente aria-label="Pantalla siguiente">→</button>' +
      '<button class="proyeccion-controles__salir" type="button" data-proyeccion-salir>Salir</button>';
    document.body.appendChild(controles);
    controles.querySelector('[data-proyeccion-anterior]').addEventListener('click', function () { ir(actual - 1); });
    controles.querySelector('[data-proyeccion-siguiente]').addEventListener('click', function () { ir(actual + 1); });
    controles.querySelector('[data-proyeccion-salir]').addEventListener('click', salir);
  }

  function ir(indice) {
    actual = Math.max(0, Math.min(diapositivas.length - 1, indice));
    diapositivas.forEach(function (d, k) {
      var esta = k === actual;
      d.classList.toggle('es-actual', esta);
      if (esta) d.removeAttribute('aria-hidden'); else d.setAttribute('aria-hidden', 'true');
    });
    diapositivas[actual].dispatchEvent(new CustomEvent('tercial:diapositiva'));
    controles.querySelector('.proyeccion-controles__cuenta').textContent = (actual + 1) + ' de ' + diapositivas.length;
    controles.querySelector('[data-proyeccion-anterior]').disabled = actual === 0;
    controles.querySelector('[data-proyeccion-siguiente]').disabled = actual === diapositivas.length - 1;
  }

  // La sección cuyo borde superior está más cerca de la parte de arriba de la ventana.
  function laQueSeVe() {
    var mejor = 0, distancia = Infinity;
    diapositivas.forEach(function (d, k) {
      if (d.hasAttribute('data-solo-proyeccion')) return;
      var y = Math.abs(d.getBoundingClientRect().top);
      if (y < distancia) { distancia = y; mejor = k; }
    });
    return mejor;
  }

  function entrar() {
    if (raiz.hasAttribute('data-proyeccion')) return;
    if (!controles) crearControles();
    var inicio = laQueSeVe();
    medir();
    raiz.setAttribute('data-proyeccion', '');
    controles.hidden = false;
    ir(inicio);
    conPantallaCompleta = false;
    if (raiz.requestFullscreen && !document.fullscreenElement) {
      raiz.requestFullscreen().then(function () { conPantallaCompleta = true; }).catch(function () {});
    }
  }

  function salir() {
    if (!raiz.hasAttribute('data-proyeccion')) return;
    var vista = diapositivas[actual];
    raiz.removeAttribute('data-proyeccion');
    raiz.style.removeProperty('--u');
    diapositivas.forEach(function (d) { d.classList.remove('es-actual'); d.removeAttribute('aria-hidden'); });
    controles.hidden = true;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    conPantallaCompleta = false;
    // Al salir, la liga deja de decir #tele: si se recarga, abre en lectura.
    if (location.hash === '#tele' && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (!vista.hasAttribute('data-solo-proyeccion')) vista.scrollIntoView({ block: 'start' });
  }

  window.addEventListener('resize', function () { if (raiz.hasAttribute('data-proyeccion')) medir(); });

  // Si el navegador quita la pantalla completa (Esc en Safari), también se sale del modo.
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && conPantallaCompleta) salir();
  });

  document.addEventListener('keydown', function (evento) {
    var t = evento.target;
    if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var proyectando = raiz.hasAttribute('data-proyeccion');
    if (!proyectando) {
      if (evento.key === 'p' || evento.key === 'P') { entrar(); evento.preventDefault(); }
      return;
    }
    // La barra espaciadora sobre un botón lo oprime; no avanza la pantalla.
    if (evento.key === ' ' && t && t.tagName === 'BUTTON') return;
    switch (evento.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': ir(actual + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': ir(actual - 1); break;
      case 'Home': ir(0); break;
      case 'End': ir(diapositivas.length - 1); break;
      case 'Escape': case 'p': case 'P': salir(); break;
      default: return;
    }
    evento.preventDefault();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-proyectar]'), function (boton) {
    boton.addEventListener('click', entrar);
  });

  if (location.hash === '#tele') {
    window.scrollTo(0, 0);
    entrar();
  }
})();
