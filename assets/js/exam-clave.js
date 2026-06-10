/*
  exam-clave.js — Interruptor alumno/clave para hojas de examen únicas.

  Una hoja en examenes-pdf/ contiene preguntas y respuestas en el mismo
  HTML. Por defecto se ve la versión del alumno (las respuestas, marcadas
  con .clave-only, quedan ocultas por exam-print.css). Al abrir la página
  con ?clave=1 este script agrega .is-clave al <main class="exam-pdf">,
  lo cual muestra las respuestas y oculta lo marcado con .alumno-only.

  El PDF de cada versión se genera con tools/build-exam-pdf.mjs
  (flag --clave para la versión del profesor).
*/
(function () {
  'use strict';

  function apply() {
    if (!new URLSearchParams(window.location.search).has('clave')) return;
    document.querySelectorAll('.exam-pdf').forEach(function (main) {
      main.classList.add('is-clave');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
