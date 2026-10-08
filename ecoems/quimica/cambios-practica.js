(function () {
  'use strict';

  var form = document.querySelector('[data-practice-form]');
  if (!form) return;

  var storageKey = 'tercial:quimica:cambios-materia:practica:v1';
  var responses = Array.prototype.slice.call(form.querySelectorAll('[data-response]'));
  var progress = form.querySelector('[data-practice-progress]');
  var reset = form.querySelector('[data-practice-reset]');
  var check = form.querySelector('[data-practice-check]');
  var validation = form.querySelector('[data-practice-validation]');
  var hasValidated = false;
  var answerKey = {
    'cambio-01': 'Químico',
    'cambio-02': 'Químico',
    'cambio-03': 'Físico',
    'cambio-04': 'Físico',
    'cambio-05': 'Químico',
    'cambio-06': 'Físico',
    'cambio-07': 'Físico',
    'cambio-08': 'Químico',
    'cambio-09': 'Físico',
    'cambio-10': 'Físico',
    'cambio-11': 'Físico',
    'cambio-12': 'Químico'
  };

  /* Retroalimentación: al acertar se explica el porqué; al fallar, una pista
     que lleva a la pregunta clave sin revelar la respuesta. */
  var feedback = {
    'cambio-01': ['La fruta fermentada huele y sabe distinto. ¿Se formaron sustancias nuevas?', 'Los azúcares de la fruta se transforman en alcohol y gas: sustancias nuevas.'],
    'cambio-02': ['La planta toma agua y dióxido de carbono. ¿Qué fabrica con ellos?', 'Con agua y dióxido de carbono la planta fabrica glucosa y oxígeno: sustancias nuevas.'],
    'cambio-03': ['La roca fundida se enfría. ¿Cambia de material o sólo de estado?', 'La lava sólo pasa de líquido a sólido; sigue siendo la misma roca.'],
    'cambio-04': ['Después del choque, ¿la lámina sigue siendo del mismo metal?', 'Cambia la forma, pero el metal sigue siendo el mismo.'],
    'cambio-05': ['Al hornear, la masa cambia de color, olor y sabor. ¿Aparecieron sustancias nuevas?', 'El calor transforma los ingredientes en sustancias nuevas.'],
    'cambio-06': ['Al soltarla, ¿la liga sigue siendo de hule?', 'Sólo cambia su forma por un momento; el hule sigue siendo hule.'],
    'cambio-07': ['El agua que sale del hielo derretido, ¿sigue siendo agua?', 'Es un cambio de estado: el H₂O sigue siendo H₂O.'],
    'cambio-08': ['Al quemarla aparecen humo y partes negras. ¿Son sustancias nuevas?', 'La combustión forma sustancias nuevas, como carbón y gases.'],
    'cambio-09': ['Si no se quema ni se descompone, ¿qué cambia: la sustancia o sólo el estado del agua que contiene?', 'El agua de la leche pasa a vapor, pero no se forman sustancias nuevas.'],
    'cambio-10': ['Los trozos pequeños, ¿son de un material distinto?', 'Sólo cambia el tamaño de los trozos.'],
    'cambio-11': ['Es un cambio de estado. ¿Los cambios de estado forman sustancias nuevas?', 'El yodo pasa de sólido a gas, pero sigue siendo yodo.'],
    'cambio-12': ['Tus células usan glucosa y oxígeno. ¿Qué producen?', 'La glucosa y el oxígeno se transforman en dióxido de carbono, agua y energía.']
  };

  function renderFeedback(field, isCorrect) {
    var statement = field.closest('.exercise').querySelector('.exercise__statement');
    var note = statement.querySelector('.practice-feedback');
    var texts = feedback[field.name];
    if (!texts) return;
    if (!note) {
      note = document.createElement('p');
      statement.appendChild(note);
    }
    note.className = 'practice-feedback' + (isCorrect ? '' : ' is-hint');
    note.innerHTML = '<span class="practice-feedback__label">' + (isCorrect ? 'Por qué' : 'Pista') + '</span> ';
    note.appendChild(document.createTextNode(isCorrect ? texts[1] : texts[0]));
  }

  function buildTercialChoices(field) {
    var sourceLabel = form.querySelector('label[for="' + field.id + '"]');
    var choices = document.createElement('fieldset');
    var legend = document.createElement('legend');
    var list = document.createElement('div');

    choices.className = 'exercise__choices';
    legend.className = 'exercise__response-label';
    legend.textContent = sourceLabel ? sourceLabel.textContent : 'Tu respuesta';
    list.className = 'exercise__choices-list';

    Array.prototype.slice.call(field.options, 1).forEach(function (option, index) {
      var choice = document.createElement('label');
      var input = document.createElement('input');
      var mark = document.createElement('span');
      var choiceText = document.createElement('span');

      choice.className = 'exercise__choice';
      input.className = 'visually-hidden';
      input.type = 'radio';
      input.name = 'opcion-' + field.name;
      input.value = option.value || option.textContent;
      input.checked = field.value === input.value;
      input.setAttribute('aria-label', option.textContent);
      input.id = field.id + '-opcion-' + (index + 1);
      mark.className = 'exercise__choice-mark';
      mark.setAttribute('aria-hidden', 'true');
      choiceText.className = 'exercise__choice-text';
      choiceText.textContent = option.textContent;

      input.addEventListener('change', function () {
        if (!input.checked) return;
        field.value = input.value;
        saveResponses();
        if (hasValidated) validateResponses();
      });

      choice.appendChild(input);
      choice.appendChild(mark);
      choice.appendChild(choiceText);
      list.appendChild(choice);
    });

    choices.appendChild(legend);
    choices.appendChild(list);
    field.insertAdjacentElement('afterend', choices);
    field.hidden = true;
    if (sourceLabel) sourceLabel.hidden = true;
  }

  function readSavedResponses() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (_) {
      return {};
    }
  }

  function saveResponses() {
    var saved = {};
    responses.forEach(function (field) {
      if (field.value) saved[field.name] = field.value;
    });

    try {
      if (Object.keys(saved).length) localStorage.setItem(storageKey, JSON.stringify(saved));
      else localStorage.removeItem(storageKey);
    } catch (_) {}

    updateProgress();
  }

  function reportProgress(answered) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordProgress({ completed: answered, total: responses.length });
  }

  function reportResult(correct, errorIds) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordResult({
      correct: correct,
      total: responses.length,
      errorIds: errorIds
    });
  }

  function updateProgress() {
    var answered = responses.filter(function (field) { return Boolean(field.value); }).length;
    progress.textContent = answered + ' de ' + responses.length +
      ' respondidas · guardado en este dispositivo';
    reset.disabled = answered === 0;
    check.disabled = answered !== responses.length;
    if (!hasValidated) {
      validation.textContent = answered === responses.length
        ? 'Ya puedes validar tus respuestas.'
        : 'Completa las 12 situaciones para validar.';
    }
    reportProgress(answered);
  }

  function validateResponses() {
    var correct = 0;
    var errorIds = [];
    hasValidated = true;

    responses.forEach(function (field) {
      var exercise = field.closest('.exercise');
      var summary = exercise.querySelector('.exercise__summary');
      var result = summary.querySelector('.exercise__result');
      var isCorrect = answerKey[field.name] === field.value;

      if (!result) {
        result = document.createElement('span');
        result.className = 'exercise__result';
        summary.insertBefore(result, summary.querySelector('.exercise__chevron'));
      }

      result.textContent = isCorrect ? '✓ Correcta' : '× Revisa';
      result.classList.toggle('is-review', !isCorrect);
      renderFeedback(field, isCorrect);
      if (isCorrect) correct += 1;
      else errorIds.push(field.name);
    });

    validation.textContent = correct === responses.length
      ? '¡' + correct + ' de ' + responses.length + ' correctas! Dominas este tema.'
      : correct + ' de ' + responses.length + ' correctas. Lee las pistas de las marcadas y vuelve a intentarlo.';
    validation.classList.add('has-result');
    reportResult(correct, errorIds);
  }

  var saved = readSavedResponses();
  responses.forEach(function (field) {
    if (typeof saved[field.name] === 'string') field.value = saved[field.name];
    field.addEventListener('change', saveResponses);
    buildTercialChoices(field);
  });

  reset.addEventListener('click', function () {
    form.reset();
    hasValidated = false;
    responses.forEach(function (field) { field.value = ''; });
    form.querySelectorAll('.exercise__choices input').forEach(function (input) {
      input.checked = false;
    });
    form.querySelectorAll('.exercise__result, .practice-feedback').forEach(function (node) {
      node.remove();
    });
    validation.classList.remove('has-result');
    try { localStorage.removeItem(storageKey); } catch (_) {}
    if (window.TercialProgress) window.TercialProgress.resetCurrentAttempt();
    updateProgress();
  });

  check.addEventListener('click', validateResponses);
  updateProgress();
})();
