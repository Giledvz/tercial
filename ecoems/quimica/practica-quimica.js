/* Motor de práctica compartido de Química ECOEMS.
   Cada página declara sus respuestas y su retroalimentación; el motor resuelve
   lo común: tandas de 5, guardado en el dispositivo, comprobación por tanda,
   «Por qué» al acertar y «Pista» al fallar (la pista nunca revela la
   respuesta) y el registro de avance de Tercial.

   Marcado que espera:
   - form[data-practice-form] con [data-practice-progress], [data-practice-reset],
     [data-practice-check] y [data-practice-validation].
   - Cada situación lleva [data-item="id"] y uno o más campos [data-response]
     (select o input) con name único.
   - Un select con data-choices se convierte en opciones de radio.
   - Dentro de la situación, [data-item-result] recibe la marca ✓/× y
     [data-item-feedback] la retroalimentación; si faltan, se usan el resumen y
     el enunciado de .exercise. Un campo dentro de [data-cell] marca esa celda
     con is-right o is-wrong. */
(function () {
  'use strict';

  function slice(list) {
    return Array.prototype.slice.call(list);
  }

  function init(config) {
    var form = document.querySelector(config.form || '[data-practice-form]');
    if (!form) return null;

    var items = slice(form.querySelectorAll('[data-item]'));
    var progress = form.querySelector('[data-practice-progress]');
    var reset = form.querySelector('[data-practice-reset]');
    var check = form.querySelector('[data-practice-check]');
    var validation = form.querySelector('[data-practice-validation]');
    var noun = config.nombres || ['situación', 'situaciones'];
    var ending = config.genero === 'm' ? 'o' : 'a';
    var size = config.tanda || 5;
    var batchCount = Math.ceil(items.length / size);
    var currentBatch = 0;
    var hasValidated = false;
    var checked = {};
    var results = {};
    var groupTitles = slice(form.querySelectorAll('.practice-group__title'));
    var fields = [];

    items.forEach(function (item) {
      fields = fields.concat(fieldsOf(item));
    });

    function fieldsOf(item) {
      return slice(item.querySelectorAll('[data-response]'));
    }

    function itemOf(field) {
      return field.closest('[data-item]');
    }

    function idOf(item) {
      return item.getAttribute('data-item');
    }

    function isAnswered(item) {
      return fieldsOf(item).every(function (field) { return field.value !== ''; });
    }

    /* ---------- Tandas ---------- */
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
    if (batchCount < 2) {
      batchStatus.hidden = true;
      prevBatch.hidden = true;
      nextBatch.hidden = true;
    }

    function batchOf(item) {
      return Math.floor(items.indexOf(item) / size);
    }

    function batchItems(index) {
      return items.slice(index * size, index * size + size);
    }

    function showBatch(index, shouldScroll) {
      currentBatch = Math.max(0, Math.min(batchCount - 1, index));
      items.forEach(function (item) {
        item.hidden = batchOf(item) !== currentBatch;
      });
      groupTitles.forEach(function (title) {
        var list = title.nextElementSibling;
        title.hidden = !(list && list.querySelector('[data-item]:not([hidden])'));
      });
      if (batchCount > 1) {
        var first = currentBatch * size + 1;
        var last = Math.min(items.length, first + size - 1);
        batchStatus.textContent = 'Tanda ' + (currentBatch + 1) + ' de ' + batchCount +
          ' · ' + noun[1] + ' ' + first + ' a ' + last + ' de ' + items.length;
        prevBatch.hidden = currentBatch === 0;
        nextBatch.hidden = currentBatch === batchCount - 1;
      }
      updateProgress();
      if (shouldScroll) batchStatus.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    /* ---------- Opciones de radio ---------- */
    function buildChoices(field) {
      var sourceLabel = form.querySelector('label[for="' + field.id + '"]');
      var choices = document.createElement('fieldset');
      var legend = document.createElement('legend');
      var list = document.createElement('div');

      choices.className = 'exercise__choices';
      legend.className = 'exercise__response-label';
      legend.textContent = sourceLabel ? sourceLabel.textContent : 'Tu respuesta';
      list.className = 'exercise__choices-list';

      slice(field.options).slice(1).forEach(function (option, index) {
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
          responded(field, true);
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

    /* ---------- Guardado ---------- */
    function readSaved() {
      try {
        return JSON.parse(localStorage.getItem(config.clave) || '{}');
      } catch (_) {
        return {};
      }
    }

    function save() {
      var saved = {};
      fields.forEach(function (field) {
        if (field.value !== '') saved[field.name] = field.value;
      });
      try {
        if (Object.keys(saved).length) localStorage.setItem(config.clave, JSON.stringify(saved));
        else localStorage.removeItem(config.clave);
      } catch (_) {}
      updateProgress();
    }

    function reportProgress(answered) {
      if (!window.TercialProgress) return;
      window.TercialProgress.recordProgress({ completed: answered, total: items.length });
    }

    function reportResult(correct, errorIds) {
      if (!window.TercialProgress) return;
      window.TercialProgress.recordResult({ correct: correct, total: items.length, errorIds: errorIds });
    }

    function updateProgress() {
      var answered = items.filter(isAnswered).length;
      var pending = batchItems(currentBatch).filter(function (item) { return !isAnswered(item); }).length;
      progress.textContent = answered + ' de ' + items.length + ' respondid' + ending + 's · guardado en este dispositivo';
      reset.disabled = !fields.some(function (field) { return field.value !== ''; });
      check.disabled = pending > 0;
      check.textContent = batchCount > 1 ? 'Comprobar esta tanda' : 'Comprobar mis respuestas';
      if (!hasValidated) {
        validation.textContent = pending === 0
          ? (batchCount > 1 ? 'Ya puedes comprobar esta tanda.' : 'Ya puedes comprobar tus respuestas.')
          : 'Completa ' + (ending === 'o' ? 'los ' : 'las ') + noun[1] +
            (batchCount > 1 ? ' de esta tanda' : '') + ' para comprobar' + (ending === 'o' ? 'los.' : 'las.');
      }
      reportProgress(answered);
    }

    /* ---------- Comprobación ---------- */
    function isRight(field) {
      var rule = config.respuestas[field.name];
      if (typeof rule === 'function') return Boolean(rule(field.value, field));
      if (Array.isArray(rule)) return rule.indexOf(field.value) !== -1;
      return String(rule) === field.value;
    }

    function markCell(field, state) {
      var cell = field.closest('[data-cell]');
      if (cell) {
        cell.classList.toggle('is-right', state === true);
        cell.classList.toggle('is-wrong', state === false);
      }
      if (state === false) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function resultSlot(item) {
      var slot = item.querySelector('[data-item-result]');
      if (slot) return slot;
      var summary = item.querySelector('.exercise__summary');
      if (!summary) return null;
      slot = summary.querySelector('.exercise__result');
      if (!slot) {
        slot = document.createElement('span');
        slot.className = 'exercise__result';
        summary.insertBefore(slot, summary.querySelector('.exercise__chevron'));
      }
      return slot;
    }

    function feedbackSlot(item) {
      return item.querySelector('[data-item-feedback]') || item.querySelector('.exercise__statement');
    }

    function renderFeedback(item, info) {
      var source = config.retro;
      var texts = typeof source === 'function' ? source(idOf(item), info) : source && source[idOf(item)];
      var slot = feedbackSlot(item);
      if (!texts || !slot) return;
      var hint = Array.isArray(texts) ? texts[0] : texts.pista;
      var why = Array.isArray(texts) ? texts[1] : texts.porque;
      var text = info.correcto ? why : hint;
      var note = slot.querySelector('.practice-feedback');
      if (!text) {
        if (note) note.remove();
        return;
      }
      if (!note) {
        note = document.createElement('p');
        slot.appendChild(note);
      }
      note.className = 'practice-feedback' + (info.correcto ? '' : ' is-hint');
      note.innerHTML = '<span class="practice-feedback__label">' + (info.correcto ? 'Por qué' : 'Pista') + '</span> ';
      if (typeof text === 'string') note.appendChild(document.createTextNode(text));
      else note.appendChild(text);
    }

    function evaluate(item) {
      var info = { correcto: true, campos: {}, valores: {} };
      fieldsOf(item).forEach(function (field) {
        var right = isRight(field);
        info.campos[field.name] = right;
        info.valores[field.name] = field.value;
        if (!right) info.correcto = false;
        markCell(field, right);
      });
      var slot = resultSlot(item);
      if (slot) {
        slot.textContent = info.correcto ? '✓ Correct' + ending : '× Revisa';
        slot.classList.toggle('is-review', !info.correcto);
      }
      item.classList.toggle('is-correct', info.correcto);
      item.classList.toggle('is-review', !info.correcto);
      renderFeedback(item, info);
      checked[idOf(item)] = true;
      results[idOf(item)] = info.correcto;
    }

    function summarize() {
      var done = items.filter(function (item) { return checked[idOf(item)]; });
      var correct = done.filter(function (item) { return results[idOf(item)]; }).length;
      var inBatch = batchItems(currentBatch);
      var batchCorrect = inBatch.filter(function (item) { return results[idOf(item)]; }).length;
      var plural = 'correct' + ending + 's';

      if (done.length === items.length) {
        var errorIds = items.filter(function (item) { return !results[idOf(item)]; }).map(idOf);
        validation.textContent = correct === items.length
          ? '¡' + correct + ' de ' + items.length + ' ' + plural + '! Dominas este tema.'
          : correct + ' de ' + items.length + ' ' + plural + '. Lee las pistas de ' +
            (ending === 'o' ? 'los marcados' : 'las marcadas') + ' y vuelve a intentarlo.';
        reportResult(correct, errorIds);
      } else {
        validation.textContent = 'Esta tanda: ' + batchCorrect + ' de ' + inBatch.length + ' ' + plural + '. ' +
          (batchCorrect === inBatch.length ? 'Sigue con la próxima tanda.'
            : 'Lee las pistas de ' + (ending === 'o' ? 'los marcados.' : 'las marcadas.'));
      }
      validation.classList.add('has-result');
    }

    function responded(field, settled) {
      save();
      var item = itemOf(field);
      if (!settled) {
        markCell(field, null);
        return;
      }
      if (checked[idOf(item)]) {
        evaluate(item);
        summarize();
      }
    }

    /* ---------- Inicio ---------- */
    var saved = readSaved();
    fields.forEach(function (field) {
      if (typeof saved[field.name] === 'string') field.value = saved[field.name];
      if (field.tagName === 'SELECT') {
        if (field.hasAttribute('data-choices')) buildChoices(field);
        else field.addEventListener('change', function () { responded(field, true); });
      } else {
        field.addEventListener('input', function () { responded(field, false); });
        field.addEventListener('change', function () { responded(field, true); });
      }
    });

    reset.addEventListener('click', function () {
      hasValidated = false;
      fields.forEach(function (field) {
        field.value = '';
        markCell(field, null);
        field.dispatchEvent(new Event('tercial:reset'));
      });
      slice(form.querySelectorAll('.exercise__choices input')).forEach(function (input) {
        input.checked = false;
      });
      items.forEach(function (item) {
        var slot = item.querySelector('[data-item-result]');
        if (slot) {
          slot.textContent = '';
          slot.classList.remove('is-review');
        }
        item.classList.remove('is-correct', 'is-review');
      });
      slice(form.querySelectorAll('.exercise__result, .practice-feedback')).forEach(function (node) {
        if (node.hasAttribute('data-item-result')) return;
        node.remove();
      });
      checked = {};
      results = {};
      validation.classList.remove('has-result');
      try { localStorage.removeItem(config.clave); } catch (_) {}
      if (window.TercialProgress) window.TercialProgress.resetCurrentAttempt();
      showBatch(0, false);
    });

    check.addEventListener('click', function () {
      hasValidated = true;
      batchItems(currentBatch).forEach(evaluate);
      summarize();
    });
    prevBatch.addEventListener('click', function () { showBatch(currentBatch - 1, true); });
    nextBatch.addEventListener('click', function () { showBatch(currentBatch + 1, true); });

    var firstPending = items.findIndex(function (item) { return !isAnswered(item); });
    showBatch(firstPending === -1 ? 0 : batchOf(items[firstPending]), false);

    return { form: form, items: items, fields: fields };
  }

  window.TercialPractica = { init: init };
})();
