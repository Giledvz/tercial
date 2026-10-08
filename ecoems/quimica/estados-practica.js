(function () {
  'use strict';

  var form = document.querySelector('[data-practice-form]');
  if (!form) return;

  var storageKey = 'tercial:quimica:estados-agregacion:practica:v1';
  var responses = Array.prototype.slice.call(form.querySelectorAll('[data-response]'));
  var progress = form.querySelector('[data-practice-progress]');
  var reset = form.querySelector('[data-practice-reset]');
  var check = form.querySelector('[data-practice-check]');
  var validation = form.querySelector('[data-practice-validation]');
  var hasValidated = false;
  var answerKey = {
    'estado-01': ['Líquido'],
    'estado-02': ['Sólido'],
    'estado-03': ['Gas'],
    'estado-04': ['Sólido'],
    'estado-05': ['Gas'],
    'estado-06': ['Líquido'],
    'estado-07': ['Gas'],
    'estado-08': ['Sólido'],
    'estado-09': ['Líquido y gas'],
    'estado-10': ['Sólido y líquido'],
    'cambio-01': ['Condensación'],
    'cambio-02': ['Fusión'],
    'cambio-03': ['Evaporación'],
    'cambio-04': ['Sublimación'],
    'cambio-05': ['Condensación'],
    'cambio-06': ['Solidificación'],
    'cambio-07': ['Fusión'],
    'cambio-08': ['Deposición'],
    'cambio-09': ['Licuefacción'],
    'cambio-10': ['Sublimación']
  };

  /* Retroalimentación: al acertar se explica el porqué; al fallar, una pista
     que remite a la tabla o al diagrama sin revelar la respuesta. */
  var feedback = {
    'estado-01': ['Busca en la tabla la fila de las fuerzas de atracción y repulsión.', 'En el líquido la atracción y la repulsión están equilibradas: las partículas siguen juntas, pero pueden deslizarse.'],
    'estado-02': ['¿Qué estado conserva su forma aunque lo cambies de recipiente?', 'El sólido tiene volumen y forma propios: no se acomoda al recipiente.'],
    'estado-03': ['Si casi nada une a las partículas, ¿se quedan juntas o se separan mucho?', 'En el gas la atracción es casi nula; por eso sus partículas se separan y ocupan todo el recipiente.'],
    'estado-04': ['Una atracción muy alta mantiene a las partículas en su lugar. ¿Qué estado es así?', 'En el sólido la atracción gana a la repulsión y mantiene a las partículas en posiciones fijas.'],
    'estado-05': ['Recuerda los frascos: ¿en cuál hay más espacio entre partículas?', 'En el gas hay mucho espacio entre partículas; por eso se puede comprimir.'],
    'estado-06': ['Piensa en agua servida en un vaso y después en un plato.', 'El líquido conserva su volumen, pero toma la forma del recipiente.'],
    'estado-07': ['Para apretar algo debe haber espacio vacío entre sus partículas. ¿Dónde hay más?', 'El gas se comprime con facilidad porque tiene grandes espacios entre partículas.'],
    'estado-08': ['¿En qué estado están las partículas más pegadas unas a otras?', 'En el sólido las partículas están muy cerca unas de otras.'],
    'estado-09': ['Fluir es poder escurrirse o desplazarse. ¿Sólo un estado puede hacerlo?', 'Líquidos y gases fluyen porque sus partículas pueden cambiar de lugar; por eso a los dos se les llama fluidos.'],
    'estado-10': ['¿En qué estados las partículas están tan cerca que ya no puedes apretarlas más?', 'Sólidos y líquidos casi no se pueden comprimir: sus partículas ya están muy cerca.'],
    'cambio-01': ['El vapor de agua del aire se enfría. ¿En qué se convierte?', 'El vapor se enfría y forma gotitas: pasa de gas a líquido.'],
    'cambio-02': ['El hielo del glaciar se calienta. ¿A qué estado pasa?', 'El hielo pasa de sólido a líquido.'],
    'cambio-03': ['Al hervir, el líquido se convierte en vapor. ¿Qué cambio va de líquido a gas?', 'El agua del café pasa de líquido a gas; cuando hierve, ese paso es rápido y se llama ebullición.'],
    'cambio-04': ['Si no queda líquido, el hielo no se derritió. ¿A qué estado pasó directamente?', 'El hielo pasa directamente de sólido a gas, sin volverse líquido.'],
    'cambio-05': ['De noche el aire se enfría. ¿Qué le pasa al vapor de agua que contiene?', 'El vapor del aire se enfría y pasa a líquido sobre las plantas.'],
    'cambio-06': ['El jugo líquido entra al congelador. ¿A qué estado pasa?', 'El líquido se enfría y pasa a sólido.'],
    'cambio-07': ['La mantequilla sólida se calienta. ¿En qué se convierte?', 'Pasa de sólido a líquido al calentarse.'],
    'cambio-08': ['Va de gas a sólido sin pasar por líquido. Busca esa flecha en el diagrama.', 'El gas pasa directamente a sólido: es la deposición o sublimación inversa.'],
    'cambio-09': ['El gas se vuelve líquido, pero no porque se enfríe. ¿Qué lo obliga?', 'La presión convierte el gas en líquido: eso es la licuefacción.'],
    'cambio-10': ['El hielo seco no deja charcos. ¿Pasa por el estado líquido?', 'El hielo seco pasa directamente de sólido a gas.']
  };

  /* Las 20 situaciones se resuelven en tandas de 5: se ve una tanda a la vez
     y se comprueba antes de seguir. */
  var BATCH = 5;
  var batchCount = Math.ceil(responses.length / BATCH);
  var currentBatch = 0;
  var checked = {};
  var results = {};
  var groupTitles = Array.prototype.slice.call(form.querySelectorAll('.practice-group__title'));
  var batchStatus = document.createElement('p');
  var prevBatch = document.createElement('button');
  var nextBatch = document.createElement('button');

  batchStatus.className = 'practice-batch__status';
  batchStatus.setAttribute('aria-live', 'polite');
  prevBatch.type = 'button';
  nextBatch.type = 'button';
  prevBatch.className = 'practice-action practice-batch__button';
  nextBatch.className = 'practice-action practice-batch__button';
  prevBatch.textContent = '← Tanda anterior';
  nextBatch.textContent = 'Siguiente tanda →';
  form.insertBefore(batchStatus, form.firstElementChild);
  check.insertAdjacentElement('afterend', nextBatch);
  nextBatch.insertAdjacentElement('afterend', prevBatch);

  function batchOf(field) {
    return Math.floor(responses.indexOf(field) / BATCH);
  }

  function batchFields(index) {
    return responses.slice(index * BATCH, index * BATCH + BATCH);
  }

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

  function showBatch(index, shouldScroll) {
    currentBatch = Math.max(0, Math.min(batchCount - 1, index));
    responses.forEach(function (field) {
      field.closest('.exercise').hidden = batchOf(field) !== currentBatch;
    });
    groupTitles.forEach(function (title) {
      var list = title.nextElementSibling;
      var visible = list && list.querySelector('.exercise:not([hidden])');
      title.hidden = !visible;
    });
    var first = currentBatch * BATCH + 1;
    var last = Math.min(responses.length, first + BATCH - 1);
    batchStatus.textContent = 'Tanda ' + (currentBatch + 1) + ' de ' + batchCount +
      ' · situaciones ' + first + ' a ' + last + ' de ' + responses.length;
    prevBatch.hidden = currentBatch === 0;
    nextBatch.hidden = currentBatch === batchCount - 1;
    updateProgress();
    if (shouldScroll) batchStatus.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
      var text = document.createElement('span');

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
      text.className = 'exercise__choice-text';
      text.textContent = option.textContent;

      input.addEventListener('change', function () {
        if (!input.checked) return;
        field.value = input.value;
        saveResponses();
        if (checked[field.name]) {
          evaluate(field);
          summarize();
        }
      });

      choice.appendChild(input);
      choice.appendChild(mark);
      choice.appendChild(text);
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
    var pending = batchFields(currentBatch).filter(function (field) { return !field.value; }).length;
    reset.disabled = answered === 0;
    check.disabled = pending > 0;
    check.textContent = 'Comprobar esta tanda';
    if (!hasValidated) {
      validation.textContent = pending === 0
        ? 'Ya puedes comprobar esta tanda.'
        : 'Responde las situaciones de esta tanda para comprobarlas.';
    }
    reportProgress(answered);
  }

  function evaluate(field) {
    var exercise = field.closest('.exercise');
    var summary = exercise.querySelector('.exercise__summary');
    var result = summary.querySelector('.exercise__result');
    var isCorrect = (answerKey[field.name] || []).indexOf(field.value) !== -1;

    if (!result) {
      result = document.createElement('span');
      result.className = 'exercise__result';
      summary.insertBefore(result, summary.querySelector('.exercise__chevron'));
    }

    result.textContent = isCorrect ? '✓ Correcta' : '× Revisa';
    result.classList.toggle('is-review', !isCorrect);
    renderFeedback(field, isCorrect);
    checked[field.name] = true;
    results[field.name] = isCorrect;
  }

  function summarize() {
    var done = responses.filter(function (field) { return checked[field.name]; });
    var correct = done.filter(function (field) { return results[field.name]; }).length;
    var inBatch = batchFields(currentBatch);
    var batchCorrect = inBatch.filter(function (field) { return results[field.name]; }).length;

    if (done.length === responses.length) {
      var errorIds = responses.filter(function (field) { return !results[field.name]; })
        .map(function (field) { return field.name; });
      validation.textContent = correct === responses.length
        ? '¡' + correct + ' de ' + responses.length + ' correctas! Dominas este tema.'
        : correct + ' de ' + responses.length + ' correctas. Lee las pistas de las marcadas y vuelve a intentarlo.';
      reportResult(correct, errorIds);
    } else {
      validation.textContent = 'Esta tanda: ' + batchCorrect + ' de ' + inBatch.length + ' correctas. ' +
        (batchCorrect === inBatch.length ? 'Sigue con la próxima tanda.' : 'Lee las pistas de las marcadas.');
    }
    validation.classList.add('has-result');
  }

  function validateResponses() {
    hasValidated = true;
    batchFields(currentBatch).forEach(evaluate);
    summarize();
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
    checked = {};
    results = {};
    validation.classList.remove('has-result');
    try { localStorage.removeItem(storageKey); } catch (_) {}
    if (window.TercialProgress) window.TercialProgress.resetCurrentAttempt();
    showBatch(0, false);
  });

  check.addEventListener('click', validateResponses);
  prevBatch.addEventListener('click', function () { showBatch(currentBatch - 1, true); });
  nextBatch.addEventListener('click', function () { showBatch(currentBatch + 1, true); });

  var firstPending = responses.findIndex(function (field) { return !field.value; });
  showBatch(firstPending === -1 ? 0 : batchOf(responses[firstPending]), false);
})();
