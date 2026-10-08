(function () {
  'use strict';

  var form = document.querySelector('[data-practice-form]');
  if (!form) return;

  var exerciseList = form.querySelector('.exercise-list');
  var responses = Array.prototype.slice.call(form.querySelectorAll('[data-response]'));
  var progress = form.querySelector('[data-practice-progress]');
  var reset = form.querySelector('[data-practice-reset]');
  var check = form.querySelector('[data-practice-check]');
  var validation = form.querySelector('[data-practice-validation]');
  var storageKey = 'tercial:quimica:clasificacion-materia:buckets:v2';
  var hasValidated = false;
  var activeItem = null;
  var pointerDrag = null;
  var dragPreview = null;
  var suppressClickUntil = 0;
  var assignments = {};

  var categories = [
    {
      id: 'elemento',
      label: 'Elemento',
      description: 'Un solo tipo de átomo.'
    },
    {
      id: 'compuesto',
      label: 'Compuesto',
      description: 'Dos o más elementos unidos químicamente, siempre en la misma proporción.'
    },
    {
      id: 'mezcla-homogenea',
      label: 'Mezcla homogénea',
      description: 'Una sola fase: no distingues sus componentes a simple vista.'
    },
    {
      id: 'mezcla-heterogenea',
      label: 'Mezcla heterogénea',
      description: 'Dos o más fases: distingues sus componentes a simple vista.'
    }
  ];

  var answerKey = {
    'clasificacion-01': 'compuesto',
    'clasificacion-02': 'elemento',
    'clasificacion-03': 'mezcla-heterogenea',
    'clasificacion-04': 'mezcla-homogenea',
    'clasificacion-05': 'elemento',
    'clasificacion-06': 'mezcla-homogenea',
    'clasificacion-07': 'compuesto',
    'clasificacion-08': 'elemento',
    'clasificacion-09': 'elemento',
    'clasificacion-10': 'mezcla-homogenea',
    'clasificacion-11': 'elemento',
    'clasificacion-12': 'compuesto',
    'clasificacion-13': 'elemento',
    'clasificacion-14': 'compuesto',
    'clasificacion-15': 'compuesto',
    'clasificacion-16': 'compuesto',
    'clasificacion-17': 'mezcla-homogenea',
    'clasificacion-18': 'compuesto',
    'clasificacion-19': 'compuesto',
    'clasificacion-20': 'mezcla-homogenea',
    'clasificacion-21': 'mezcla-heterogenea',
    'clasificacion-22': 'elemento',
    'clasificacion-23': 'mezcla-homogenea',
    'clasificacion-24': 'mezcla-heterogenea',
    'clasificacion-25': 'mezcla-heterogenea',
    'clasificacion-26': 'compuesto',
    'clasificacion-27': 'compuesto',
    'clasificacion-28': 'mezcla-heterogenea',
    'clasificacion-29': 'compuesto',
    'clasificacion-30': 'mezcla-homogenea'
  };

  /* Retroalimentación: al acertar se explica el porqué; al fallar, una pista
     que lleva a la pregunta clave sin revelar la categoría. */
  var feedback = {
    'clasificacion-01': ["Mira la fórmula: ¿cuántos tipos de átomo tiene?", "Es un compuesto: hidrógeno y oxígeno unidos químicamente."],
    'clasificacion-02': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de sodio."],
    'clasificacion-03': ["¿Puedes ver por separado el cereal y la leche?", "Es una mezcla heterogénea: distingues sus componentes a simple vista."],
    'clasificacion-04': ["Reúne muchas sustancias, pero ¿se ve en partes o como un solo líquido?", "Es una mezcla homogénea: muchas sustancias juntas que se ven como un solo líquido."],
    'clasificacion-05': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de plata."],
    'clasificacion-06': ["El agua de mar lleva sal disuelta. ¿Puedes ver la sal?", "Es una mezcla homogénea: la sal está disuelta y no se distingue."],
    'clasificacion-07': ["Cuenta los tipos de átomo que aparecen en la fórmula.", "Es un compuesto: hidrógeno, azufre y oxígeno unidos químicamente."],
    'clasificacion-08': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de hierro."],
    'clasificacion-09': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de cobre."],
    'clasificacion-10': ["El bronce se hace fundiendo cobre y estaño. ¿Distingues los dos metales?", "Es una mezcla homogénea, una aleación: los metales no se distinguen."],
    'clasificacion-11': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de uranio."],
    'clasificacion-12': ["Cuenta los tipos de átomo: C, H y O.", "Es un compuesto: carbono, hidrógeno y oxígeno unidos químicamente."],
    'clasificacion-13': ["Tiene dos átomos, pero ¿son de distinto tipo?", "Es un elemento: sus dos átomos son iguales, los dos de oxígeno."],
    'clasificacion-14': ["Es el azúcar de mesa. Cuenta los tipos de átomo de su fórmula.", "Es un compuesto: carbono, hidrógeno y oxígeno unidos químicamente."],
    'clasificacion-15': ["Es la sal de mesa. ¿Cuántos tipos de átomo tiene NaCl?", "Es un compuesto: sodio y cloro unidos químicamente."],
    'clasificacion-16': ["¿Cuántos tipos de átomo tiene HCl?", "Es un compuesto: hidrógeno y cloro unidos químicamente."],
    'clasificacion-17': ["El aire reúne varios gases. ¿Puedes verlos por separado?", "Es una mezcla homogénea de gases, como nitrógeno y oxígeno."],
    'clasificacion-18': ["¿Cuántos tipos de átomo tiene KCl?", "Es un compuesto: potasio y cloro unidos químicamente."],
    'clasificacion-19': ["Fíjate en las mayúsculas: C y O son dos átomos distintos.", "Es un compuesto: carbono y oxígeno unidos. (Co, con o minúscula, sería el elemento cobalto.)"],
    'clasificacion-20': ["El azúcar se disolvió. ¿Todavía la ves?", "Es una mezcla homogénea: el azúcar disuelta no se distingue."],
    'clasificacion-21': ["¿Puedes ver cada ingrediente por separado?", "Es una mezcla heterogénea: cada ingrediente se ve a simple vista."],
    'clasificacion-22': ["¿Aparece en la tabla periódica con un solo símbolo?", "Es un elemento: sólo tiene átomos de aluminio."],
    'clasificacion-23': ["El acero se hace fundiendo hierro con un poco de carbono. ¿Se distinguen?", "Es una mezcla homogénea, una aleación: el hierro y el carbono no se distinguen."],
    'clasificacion-24': ["Deja reposar la mezcla. ¿Qué pasa con la arena?", "Es una mezcla heterogénea: la arena se ve y se va al fondo."],
    'clasificacion-25': ["¿El aceite se mezcla con el agua o forma una capa?", "Es una mezcla heterogénea: se forman dos capas que se ven."],
    'clasificacion-26': ["Cuenta los tipos de átomo: C, H y O.", "Es un compuesto: carbono, hidrógeno y oxígeno unidos químicamente."],
    'clasificacion-27': ["¿Cuántos tipos de átomo tiene NH₃?", "Es un compuesto: nitrógeno e hidrógeno unidos químicamente."],
    'clasificacion-28': ["A simple vista parece uniforme. ¿Qué verías con un microscopio o al centrifugarla?", "Es una mezcla heterogénea: aunque parezca uniforme, al microscopio o en una centrífuga se separan los glóbulos del plasma."],
    'clasificacion-29': ["¿Cuántos tipos de átomo tiene CH₄?", "Es un compuesto: carbono e hidrógeno unidos químicamente."],
    'clasificacion-30': ["El agua y el alcohol se mezclan por completo. ¿Puedes distinguirlos?", "Es una mezcla homogénea: forman un solo líquido."]
  };

  /* Las 30 situaciones se clasifican en tandas de 5: al colocar las 5 se
     comprueban y se lee la retroalimentación antes de seguir. */
  var BATCH = 5;
  var currentBatch = 0;
  var checkedBatches = {};
  var results = {};

  var categoryById = categories.reduce(function (index, category) {
    index[category.id] = category;
    return index;
  }, {});

  var fieldById = responses.reduce(function (index, field) {
    index[field.name] = field;
    return index;
  }, {});

  var sorter = document.createElement('div');
  sorter.className = 'classification-sorter';
  sorter.setAttribute('data-classification-sorter', '');
  sorter.innerHTML = [
    '<div class="classification-sorter__stage" tabindex="-1" data-sorter-stage>',
      '<div class="classification-sorter__stage-copy">',
        '<p class="classification-sorter__kicker">Por clasificar</p>',
        '<p class="classification-sorter__instruction">Toca una categoría o arrastra la situación hasta ella.</p>',
      '</div>',
      '<div class="classification-sorter__source" data-sorter-source aria-live="polite"></div>',
      '<p class="classification-sorter__complete" data-sorter-complete hidden>Comprobaste las 30 situaciones. Toca cualquiera para moverla.</p>',
      '<div class="classification-sorter__review" data-sorter-review hidden>',
        '<ol class="classification-sorter__review-list" data-sorter-review-list></ol>',
        '<button class="practice-action practice-batch__button" type="button" data-sorter-next>Siguiente tanda →</button>',
      '</div>',
    '</div>',
    '<div class="classification-sorter__buckets" data-sorter-buckets></div>'
  ].join('');

  exerciseList.insertAdjacentElement('beforebegin', sorter);

  var stage = sorter.querySelector('[data-sorter-stage]');
  var stageKicker = sorter.querySelector('.classification-sorter__kicker');
  var stageInstruction = sorter.querySelector('.classification-sorter__instruction');
  var source = sorter.querySelector('[data-sorter-source]');
  var complete = sorter.querySelector('[data-sorter-complete]');
  var buckets = sorter.querySelector('[data-sorter-buckets]');
  var review = sorter.querySelector('[data-sorter-review]');
  var reviewList = sorter.querySelector('[data-sorter-review-list]');
  var nextButton = sorter.querySelector('[data-sorter-next]');
  var items = [];
  var itemById = {};

  function createBuckets() {
    categories.forEach(function (category) {
      var bucket = document.createElement('section');
      bucket.className = 'classification-bucket';
      bucket.dataset.bucket = category.id;
      bucket.setAttribute('aria-labelledby', 'bucket-title-' + category.id);
      bucket.innerHTML = [
        '<header class="classification-bucket__header">',
          '<div>',
            '<h3 class="classification-bucket__title" id="bucket-title-', category.id, '">', category.label, '</h3>',
            '<p class="classification-bucket__description">', category.description, '</p>',
          '</div>',
          '<span class="classification-bucket__count" data-bucket-count>0</span>',
          '<button class="classification-bucket__target" type="button" data-bucket-target="', category.id, '">Colocar aquí →</button>',
        '</header>',
        '<div class="classification-bucket__list" data-bucket-list="', category.id, '">',
          '<p class="classification-bucket__empty" data-bucket-empty>Aún vacío</p>',
        '</div>'
      ].join('');

      var target = bucket.querySelector('[data-bucket-target]');
      target.setAttribute('aria-label', 'Colocar la situación actual en ' + category.label);
      target.addEventListener('click', function () {
        if (activeItem) assignItem(activeItem.dataset.sortItem, category.id, true);
      });

      buckets.appendChild(bucket);
    });
  }

  function clearDragover() {
    sorter.querySelectorAll('.classification-bucket.is-dragover').forEach(function (bucket) {
      bucket.classList.remove('is-dragover');
    });
  }

  function bucketAtPoint(x, y) {
    var target = document.elementFromPoint(x, y);
    return target ? target.closest('[data-bucket]') : null;
  }

  function moveTouchPreview(x, y) {
    if (!dragPreview) return;
    dragPreview.style.left = x + 'px';
    dragPreview.style.top = y + 'px';

    clearDragover();
    var bucket = bucketAtPoint(x, y);
    if (bucket) bucket.classList.add('is-dragover');

    var edge = 72;
    if (y < edge) window.scrollBy(0, -12);
    if (y > window.innerHeight - edge) window.scrollBy(0, 12);
  }

  function beginPointerDrag(item, event) {
    if (!event.isPrimary || event.button > 0) return;
    pointerDrag = {
      id: item.dataset.sortItem,
      item: item,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    try { item.setPointerCapture(event.pointerId); } catch (_) {}
  }

  function continuePointerDrag(event) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    var distance = Math.hypot(
      event.clientX - pointerDrag.startX,
      event.clientY - pointerDrag.startY
    );
    if (!pointerDrag.moved && distance < 8) return;

    if (!pointerDrag.moved) {
      pointerDrag.moved = true;
      suppressClickUntil = Date.now() + 700;
      pointerDrag.item.classList.add('is-dragging');
      dragPreview = pointerDrag.item.cloneNode(true);
      dragPreview.removeAttribute('data-sort-item');
      dragPreview.removeAttribute('aria-label');
      dragPreview.removeAttribute('hidden');
      dragPreview.classList.remove('is-placed', 'is-correct', 'is-review', 'is-dragging');
      dragPreview.classList.add('classification-sorter__drag-preview');
      dragPreview.querySelectorAll('.classification-sorter__result').forEach(function (result) {
        result.remove();
      });
      dragPreview.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
      document.body.appendChild(dragPreview);
    }

    event.preventDefault();
    moveTouchPreview(event.clientX, event.clientY);
  }

  function finishPointerDrag(event, cancelled) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    var item = pointerDrag.item;
    var id = pointerDrag.id;
    var moved = pointerDrag.moved;
    var bucket = moved && !cancelled ? bucketAtPoint(event.clientX, event.clientY) : null;

    if (moved) {
      suppressClickUntil = Date.now() + 700;
      event.preventDefault();
    }
    try { item.releasePointerCapture(event.pointerId); } catch (_) {}
    item.classList.remove('is-dragging');
    if (dragPreview) dragPreview.remove();
    dragPreview = null;
    pointerDrag = null;
    clearDragover();

    if (bucket) assignItem(id, bucket.dataset.bucket, true);
  }

  function createItems() {
    responses.forEach(function (field) {
      var exercise = field.closest('.exercise');
      var number = exercise.querySelector('.exercise__num').textContent.trim();
      var statement = exercise.querySelector('.exercise__text');
      var item = document.createElement('button');

      item.className = 'classification-sorter__item';
      item.type = 'button';
      item.dataset.sortItem = field.name;
      item.innerHTML = [
        '<span class="classification-sorter__item-number">', number, '</span>',
        '<span class="classification-sorter__item-label">', statement.innerHTML, '</span>'
      ].join('');
      item.setAttribute('aria-label', number + '. ' + statement.textContent.trim() + '. Sin clasificar.');

      item.addEventListener('click', function () {
        if (Date.now() < suppressClickUntil) return;
        if (item.classList.contains('is-placed')) unassignItem(item.dataset.sortItem, true);
      });
      item.addEventListener('pointerdown', function (event) {
        beginPointerDrag(item, event);
      });
      item.addEventListener('pointermove', continuePointerDrag);
      item.addEventListener('pointerup', function (event) {
        finishPointerDrag(event, false);
      });
      item.addEventListener('pointercancel', function (event) {
        finishPointerDrag(event, true);
      });

      items.push(item);
      itemById[field.name] = item;
      source.appendChild(item);
    });
  }

  function readSavedAssignments() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function saveAssignments() {
    try {
      if (Object.keys(assignments).length) {
        localStorage.setItem(storageKey, JSON.stringify(assignments));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (_) {}
  }

  function updateItemLabel(item, categoryId) {
    var text = item.querySelector('.classification-sorter__item-label').textContent.trim();
    var number = item.querySelector('.classification-sorter__item-number').textContent.trim();
    var category = categoryById[categoryId];
    item.setAttribute('aria-label', number + '. ' + text + '. ' +
      (category ? 'Colocada en ' + category.label + '. Toca para moverla.' : 'Sin clasificar.'));
  }

  function clearResult(item) {
    item.classList.remove('is-correct', 'is-review');
    var result = item.querySelector('.classification-sorter__result');
    if (result) result.remove();
  }

  function batchCount() {
    return Math.ceil(items.length / BATCH);
  }

  function batchOfId(id) {
    return Math.floor(items.indexOf(itemById[id]) / BATCH);
  }

  function batchItems(index) {
    return items.slice(index * BATCH, index * BATCH + BATCH);
  }

  function isAssigned(item) {
    return Boolean(assignments[item.dataset.sortItem]);
  }

  function showNextItem(preferredId) {
    if (preferredId && itemById[preferredId] && !assignments[preferredId]) currentBatch = batchOfId(preferredId);
    var unassigned = items.filter(function (item) { return !isAssigned(item); });
    var remaining = batchItems(currentBatch).filter(function (item) { return !isAssigned(item); });
    var next = preferredId && remaining.indexOf(itemById[preferredId]) !== -1 ? itemById[preferredId] : remaining[0] || null;
    var checkedNow = Boolean(checkedBatches[currentBatch]);
    var allChecked = Object.keys(checkedBatches).length === batchCount() && unassigned.length === 0;
    var label = 'Tanda ' + (currentBatch + 1) + ' de ' + batchCount();

    unassigned.forEach(function (item) { item.hidden = item !== next; });
    activeItem = next;
    source.hidden = !next;
    review.hidden = Boolean(next) || !checkedNow;
    nextButton.hidden = currentBatch >= batchCount() - 1;
    complete.hidden = !(allChecked && !next);
    sorter.classList.toggle('is-complete', !next);
    stageKicker.textContent = next
      ? label + ' · por clasificar'
      : checkedNow ? label + ' · comprobada' : label + ' · lista';
    stageInstruction.textContent = next
      ? 'Toca una categoría o arrastra la situación hasta ella.'
      : checkedNow
        ? 'Lee la retroalimentación. Toca una tarjeta marcada para moverla.'
        : 'Ya colocaste las 5. Compruébalas antes de seguir.';
    sorter.querySelectorAll('[data-bucket-target]').forEach(function (target) {
      target.hidden = !next;
    });
  }

  function assignItem(id, categoryId, shouldFocus) {
    var item = itemById[id];
    var field = fieldById[id];
    var category = categoryById[categoryId];
    var list = sorter.querySelector('[data-bucket-list="' + categoryId + '"]');
    if (!item || !field || !category || !list) return;

    assignments[id] = categoryId;
    field.value = category.label;
    item.hidden = false;
    item.classList.add('is-placed');
    clearResult(item);
    updateItemLabel(item, categoryId);
    list.appendChild(item);
    activeItem = null;

    saveAssignments();
    showNextItem();
    updateProgress();
    updateBuckets();
    if (checkedBatches[batchOfId(id)]) {
      evaluateItem(item);
      renderReview();
      summarize();
    }
    if (shouldFocus && activeItem) stage.focus({ preventScroll: true });
  }

  function unassignItem(id, shouldFocus) {
    var item = itemById[id];
    var field = fieldById[id];
    if (!item || !field || !assignments[id]) return;

    delete assignments[id];
    field.value = '';
    item.classList.remove('is-placed');
    clearResult(item);
    updateItemLabel(item, '');
    source.prepend(item);
    showNextItem(id);
    saveAssignments();
    updateProgress();
    updateBuckets();
    if (checkedBatches[batchOfId(id)]) {
      validation.textContent = 'Vuelve a colocarla: se comprobará al momento.';
    }
    if (shouldFocus) stage.focus({ preventScroll: true });
  }

  function updateBuckets() {
    categories.forEach(function (category) {
      var bucket = sorter.querySelector('[data-bucket="' + category.id + '"]');
      var list = bucket.querySelector('[data-bucket-list]');
      var count = list.querySelectorAll('[data-sort-item]').length;
      bucket.querySelector('[data-bucket-count]').textContent = String(count);
      bucket.querySelector('[data-bucket-empty]').hidden = count > 0;
    });
  }

  function reportProgress(answered) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordProgress({ completed: answered, total: items.length });
  }

  function reportResult(correct, errorIds) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordResult({
      correct: correct,
      total: items.length,
      errorIds: errorIds
    });
  }

  function updateProgress() {
    var answered = Object.keys(assignments).length;
    progress.textContent = answered + ' de ' + items.length +
      ' clasificadas · guardado en este dispositivo';
    var pending = batchItems(currentBatch).filter(function (item) { return !isAssigned(item); }).length;
    reset.disabled = answered === 0;
    check.disabled = pending > 0 || Boolean(checkedBatches[currentBatch]);
    check.textContent = 'Comprobar esta tanda';
    if (!hasValidated) {
      validation.textContent = pending === 0
        ? 'Ya puedes comprobar esta tanda.'
        : pending === 1
          ? 'Queda 1 situación en esta tanda.'
          : 'Quedan ' + pending + ' situaciones en esta tanda.';
    }
    reportProgress(answered);
  }

  function evaluateItem(item) {
    var id = item.dataset.sortItem;
    var isCorrect = answerKey[id] === assignments[id];
    var result = item.querySelector('.classification-sorter__result');

    if (!result) {
      result = document.createElement('span');
      result.className = 'classification-sorter__result';
      item.appendChild(result);
    }

    result.textContent = isCorrect ? '✓ Correcta' : '× Revisa';
    item.classList.toggle('is-correct', isCorrect);
    item.classList.toggle('is-review', !isCorrect);
    results[id] = isCorrect;
  }

  function renderReview() {
    reviewList.innerHTML = '';
    batchItems(currentBatch).forEach(function (item) {
      var id = item.dataset.sortItem;
      if (!(id in results) || !assignments[id]) return;
      var entry = document.createElement('li');
      var title = document.createElement('p');
      var note = document.createElement('p');
      var texts = feedback[id] || ['', ''];
      entry.className = 'classification-sorter__review-item' + (results[id] ? '' : ' is-review');
      title.className = 'classification-sorter__review-title';
      title.innerHTML = item.querySelector('.classification-sorter__item-label').innerHTML +
        ' <span class="classification-sorter__review-result">' + (results[id] ? '✓ Correcta' : '× Revisa') + '</span>';
      note.className = 'practice-feedback' + (results[id] ? '' : ' is-hint');
      note.innerHTML = '<span class="practice-feedback__label">' + (results[id] ? 'Por qué' : 'Pista') + '</span> ';
      note.appendChild(document.createTextNode(results[id] ? texts[1] : texts[0]));
      entry.appendChild(title);
      entry.appendChild(note);
      reviewList.appendChild(entry);
    });
  }

  function summarize() {
    var checkedIds = Object.keys(results);
    var inBatch = batchItems(currentBatch);
    var batchCorrect = inBatch.filter(function (item) { return results[item.dataset.sortItem]; }).length;

    if (Object.keys(checkedBatches).length === batchCount() && checkedIds.length === items.length) {
      var correct = items.filter(function (item) { return results[item.dataset.sortItem]; }).length;
      var errorIds = items.filter(function (item) { return !results[item.dataset.sortItem]; })
        .map(function (item) { return item.dataset.sortItem; });
      validation.textContent = correct === items.length
        ? '¡' + correct + ' de ' + items.length + ' correctas! Dominas este tema.'
        : correct + ' de ' + items.length + ' correctas. Lee las pistas y toca las marcadas para volver a colocarlas.';
      reportResult(correct, errorIds);
    } else {
      validation.textContent = 'Esta tanda: ' + batchCorrect + ' de ' + inBatch.length + ' correctas. ' +
        (batchCorrect === inBatch.length ? 'Sigue con la próxima tanda.' : 'Lee las pistas y toca las marcadas para moverlas.');
    }
    validation.classList.add('has-result');
  }

  function validateResponses() {
    hasValidated = true;
    batchItems(currentBatch).forEach(evaluateItem);
    checkedBatches[currentBatch] = true;
    renderReview();
    summarize();
    showNextItem();
    updateProgress();
  }

  function restoreAssignments() {
    var saved = readSavedAssignments();
    items.forEach(function (item) {
      var id = item.dataset.sortItem;
      var categoryId = saved[id];
      if (categoryById[categoryId]) assignItem(id, categoryId, false);
    });
  }

  createBuckets();
  createItems();
  restoreAssignments();
  exerciseList.hidden = true;
  form.classList.add('classification-sorter-ready');
  showNextItem();
  updateBuckets();
  updateProgress();

  reset.addEventListener('click', function () {
    form.reset();
    assignments = {};
    checkedBatches = {};
    results = {};
    currentBatch = 0;
    reviewList.innerHTML = '';
    hasValidated = false;
    validation.classList.remove('has-result');
    items.forEach(function (item) {
      item.classList.remove('is-placed');
      clearResult(item);
      updateItemLabel(item, '');
      source.appendChild(item);
    });
    try { localStorage.removeItem(storageKey); } catch (_) {}
    if (window.TercialProgress) window.TercialProgress.resetCurrentAttempt();
    showNextItem();
    updateBuckets();
    updateProgress();
  });

  check.addEventListener('click', validateResponses);
  nextButton.addEventListener('click', function () {
    currentBatch = Math.min(currentBatch + 1, batchCount() - 1);
    reviewList.innerHTML = '';
    showNextItem();
    updateProgress();
    if (Object.keys(results).some(function (id) { return batchOfId(id) === currentBatch; })) renderReview();
    stage.focus({ preventScroll: true });
  });
})();
