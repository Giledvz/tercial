(function () {
  'use strict';

  var form = document.querySelector('[data-separation-practice]');
  if (!form) return;

  var source = form.querySelector('[data-separation-cases]');
  var caseNodes = Array.prototype.slice.call(source.querySelectorAll('[data-case-id]'));
  var progress = form.querySelector('[data-separation-progress]');
  var reset = form.querySelector('[data-separation-reset]');
  var check = form.querySelector('[data-separation-check]');
  var validation = form.querySelector('[data-separation-validation]');
  var storageKey = 'tercial:quimica:separacion-mezclas:methods:v1';
  var activeCase = null;
  var assignments = {};
  var validationResults = {};
  var hasValidated = false;

  var methods = [
    { id: 'filtracion', label: 'Filtración', property: 'tamaño de partícula' },
    { id: 'decantacion', label: 'Decantación', property: 'densidad y fases' },
    { id: 'tamizado', label: 'Tamizado', property: 'tamaño entre sólidos' },
    { id: 'imantacion', label: 'Imantación', property: 'magnetismo' },
    { id: 'centrifugacion', label: 'Centrifugación', property: 'densidad' },
    { id: 'evaporacion', label: 'Evaporación', property: 'el líquido se evapora' },
    { id: 'cristalizacion', label: 'Cristalización', property: 'solubilidad' },
    { id: 'destilacion', label: 'Destilación', property: 'ebullición' },
    { id: 'cromatografia', label: 'Cromatografía', property: 'avanzan a distinta velocidad' },
    { id: 'sublimacion', label: 'Sublimación', property: 'cambio directo a gas' }
  ];

  var answerKey = {
    'separacion-01': 'imantacion',
    'separacion-02': 'cristalizacion',
    'separacion-03': 'destilacion',
    'separacion-04': 'decantacion',
    'separacion-05': 'cromatografia',
    'separacion-06': 'centrifugacion',
    'separacion-07': 'tamizado',
    'separacion-08': 'sublimacion',
    'separacion-09': 'filtracion',
    'separacion-10': 'cromatografia',
    'separacion-11': 'cristalizacion',
    'separacion-12': 'destilacion',
    'separacion-13': 'imantacion',
    'separacion-14': 'sublimacion',
    'separacion-15': 'filtracion'
  };

  /* Retroalimentación: al acertar se explica por qué funciona el método; al
     fallar, una pista sobre la propiedad que conviene aprovechar. */
  var feedback = {
    'separacion-01': ['¿Cuál de los dos sólidos responde a un imán?', 'El imán atrae al hierro y deja el azufre.'],
    'separacion-02': ['La sal está disuelta. ¿Cómo recuperas sus cristales?', 'Al evaporarse el agua, la sal forma cristales.'],
    'separacion-03': ['Los dos son líquidos que se mezclan. ¿Cuál hierve primero?', 'El alcohol hierve antes que el agua; su vapor se enfría y se recoge por separado.'],
    'separacion-04': ['Forman dos capas. ¿Cómo separas la de arriba de la de abajo?', 'El aceite queda arriba y se separa del agua sin mezclarse.'],
    'separacion-05': ['Cada tinta avanza a distinta velocidad sobre un papel.', 'Cada pigmento avanza distinto por el papel y queda separado de los demás.'],
    'separacion-06': ['Sus componentes tienen distinta densidad; hay que acelerar que se asienten.', 'El giro rápido manda al fondo lo más denso: los glóbulos se separan del plasma.'],
    'separacion-07': ['Los dos son sólidos de distinto tamaño.', 'La malla deja pasar la arena y retiene la grava.'],
    'separacion-08': ['Uno de los dos pasa directamente a gas al calentarse.', 'El hielo seco se vuelve gas y la tierra se queda.'],
    'separacion-09': ['El arroz no se disuelve en el agua. ¿Qué lo retiene y deja pasar el agua?', 'El colador o el filtro retiene el arroz y deja pasar el agua.'],
    'separacion-10': ['Los colorantes están disueltos y avanzan distinto sobre un papel.', 'Cada colorante avanza a distinta velocidad y se separa de los otros.'],
    'separacion-11': ['La sal está disuelta en el agua de mar.', 'Al evaporarse el agua, quedan los cristales de sal.'],
    'separacion-12': ['Primero el aire se vuelve líquido; cada gas hierve a una temperatura distinta.', 'El nitrógeno y el oxígeno líquidos hierven a temperaturas distintas y se recogen por separado.'],
    'separacion-13': ['La aguja es de metal; la paja no.', 'El imán atrae la aguja de acero y la saca del pajar.'],
    'separacion-14': ['Uno de los dos sólidos pasa directamente a vapor.', 'El yodo pasa a vapor y el azufre se queda.'],
    'separacion-15': ['La harina no se disuelve en el agua. ¿Qué la retiene?', 'El filtro retiene la harina y deja pasar el agua. Evaporar también la recuperaría, pero tarda más y se pierde el agua.']
  };

  var methodById = methods.reduce(function (index, method) {
    index[method.id] = method;
    return index;
  }, {});

  var cases = caseNodes.map(function (node) {
    return {
      id: node.dataset.caseId,
      number: node.dataset.caseNumber,
      title: node.dataset.caseTitle,
      goal: node.dataset.caseGoal
    };
  });

  var caseById = cases.reduce(function (index, item) {
    index[item.id] = item;
    return index;
  }, {});

  var workbench = document.createElement('section');
  workbench.className = 'method-workbench';
  workbench.setAttribute('data-method-workbench', '');
  workbench.setAttribute('aria-label', 'Mesa de métodos de separación');
  workbench.innerHTML = [
    '<div class="method-workbench__case" data-method-case aria-live="polite" tabindex="-1">',
      '<p class="method-workbench__kicker">Mezcla por resolver · <span data-method-number></span></p>',
      '<h3 class="method-workbench__case-title" data-method-title></h3>',
      '<p class="method-workbench__goal" data-method-goal></p>',
    '</div>',
    '<div class="method-workbench__tools">',
      '<p class="method-workbench__kicker">Elige una herramienta</p>',
      '<div class="method-workbench__method-list" data-method-list></div>',
    '</div>',
    '<div class="method-workbench__history">',
      '<header class="method-workbench__history-header">',
        '<div>',
          '<p class="method-workbench__kicker">Registro</p>',
          '<h3 class="method-workbench__history-title">Decisiones tomadas</h3>',
        '</div>',
        '<span class="method-workbench__history-count" data-history-count>0 de 15</span>',
      '</header>',
      '<div class="method-workbench__history-list" data-history-list>',
        '<p class="method-workbench__empty" data-history-empty>Aún no has elegido ningún método.</p>',
      '</div>',
    '</div>'
  ].join('');

  form.insertBefore(workbench, form.querySelector('.practice-tools'));

  var casePanel = workbench.querySelector('[data-method-case]');
  var caseNumber = workbench.querySelector('[data-method-number]');
  var caseTitle = workbench.querySelector('[data-method-title]');
  var caseGoal = workbench.querySelector('[data-method-goal]');
  var methodList = workbench.querySelector('[data-method-list]');
  var historyList = workbench.querySelector('[data-history-list]');
  var historyEmpty = workbench.querySelector('[data-history-empty]');
  var historyCount = workbench.querySelector('[data-history-count]');

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

  function createMethodButtons() {
    methods.forEach(function (method, index) {
      var button = document.createElement('button');
      button.className = 'method-workbench__method';
      button.type = 'button';
      button.dataset.methodOption = method.id;
      button.innerHTML = [
        '<span class="method-workbench__method-number">', String(index + 1).padStart(2, '0'), '</span>',
        '<span class="method-workbench__method-name">', method.label, '</span>',
        '<span class="method-workbench__method-property">', method.property, '</span>'
      ].join('');
      button.addEventListener('click', function () {
        if (activeCase) chooseMethod(activeCase.id, method.id);
      });
      methodList.appendChild(button);
    });
  }

  function showNextCase(preferredId) {
    var remaining = cases.filter(function (item) { return !assignments[item.id]; });
    activeCase = preferredId && !assignments[preferredId]
      ? caseById[preferredId]
      : remaining[0] || null;

    casePanel.classList.toggle('is-complete', !activeCase);
    workbench.classList.toggle('is-complete', !activeCase);
    methodList.querySelectorAll('[data-method-option]').forEach(function (button) {
      button.disabled = !activeCase;
    });

    if (activeCase) {
      caseNumber.textContent = activeCase.number + ' de ' + cases.length;
      caseTitle.textContent = activeCase.title;
      caseGoal.textContent = activeCase.goal;
    } else {
      caseNumber.textContent = cases.length + ' de ' + cases.length;
      caseTitle.textContent = 'Mesa completa';
      caseGoal.textContent = 'Valida tus decisiones o toca una para cambiarla.';
    }
  }

  function chooseMethod(caseId, methodId) {
    if (!caseById[caseId] || !methodById[methodId]) return;
    assignments[caseId] = methodId;
    delete validationResults[caseId];
    saveAssignments();
    showNextCase();
    renderHistory();
    updateProgress();
    if (hasValidated && Object.keys(assignments).length === cases.length) validateResponses();
    casePanel.focus();
  }

  function reviseCase(caseId) {
    if (!assignments[caseId]) return;
    delete assignments[caseId];
    delete validationResults[caseId];
    saveAssignments();
    showNextCase(caseId);
    renderHistory();
    updateProgress();
    if (hasValidated) validation.textContent = 'Elige otro método y vuelve a validar.';
    casePanel.focus();
  }

  function renderHistory() {
    historyList.querySelectorAll('[data-history-case]').forEach(function (item) { item.remove(); });
    var answered = 0;

    cases.forEach(function (item) {
      var methodId = assignments[item.id];
      if (!methodId) return;
      answered += 1;
      var method = methodById[methodId];
      var result = validationResults[item.id];
      var button = document.createElement('button');
      button.className = 'method-workbench__history-item';
      if (result === true) button.classList.add('is-correct');
      if (result === false) button.classList.add('is-review');
      button.type = 'button';
      button.dataset.historyCase = item.id;
      button.innerHTML = [
        '<span class="method-workbench__history-number">', item.number, '</span>',
        '<span class="method-workbench__history-case">', item.title, '</span>',
        '<span class="method-workbench__history-method">', method.label, '</span>',
        result === true ? '<span class="method-workbench__history-result">✓ Correcta</span>' : '',
        result === false ? '<span class="method-workbench__history-result">× Revisa</span>' : ''
      ].join('');
      button.setAttribute('aria-label', item.number + '. ' + item.title + '. Método elegido: ' +
        method.label + '. Toca para cambiarlo.');
      button.addEventListener('click', function () { reviseCase(item.id); });

      var entry = document.createElement('div');
      entry.className = 'method-workbench__history-entry';
      entry.dataset.historyCase = item.id;
      button.removeAttribute('data-history-case');
      entry.appendChild(button);
      if (typeof result === 'boolean' && feedback[item.id]) {
        var note = document.createElement('p');
        note.className = 'practice-feedback' + (result ? '' : ' is-hint');
        note.innerHTML = '<span class="practice-feedback__label">' + (result ? 'Por qué' : 'Pista') + '</span> ';
        note.appendChild(document.createTextNode(result ? feedback[item.id][1] : feedback[item.id][0]));
        entry.appendChild(note);
      }
      historyList.appendChild(entry);
    });

    historyEmpty.hidden = answered > 0;
    historyCount.textContent = answered + ' de ' + cases.length;
  }

  function reportProgress(answered) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordProgress({ completed: answered, total: cases.length });
  }

  function reportResult(correct, errorIds) {
    if (!window.TercialProgress) return;
    window.TercialProgress.recordResult({
      correct: correct,
      total: cases.length,
      errorIds: errorIds
    });
  }

  function updateProgress() {
    var answered = Object.keys(assignments).length;
    var remaining = cases.length - answered;
    progress.textContent = answered + ' de ' + cases.length +
      ' resueltas · guardado en este dispositivo';
    reset.disabled = answered === 0;
    check.disabled = answered !== cases.length;

    if (!hasValidated) {
      validation.textContent = remaining === 0
        ? 'Ya puedes validar tus decisiones.'
        : remaining === 1
          ? 'Queda 1 mezcla por resolver.'
          : 'Quedan ' + remaining + ' mezclas por resolver.';
    }
    reportProgress(answered);
  }

  function validateResponses() {
    var correct = 0;
    var errorIds = [];
    hasValidated = true;
    validationResults = {};

    cases.forEach(function (item) {
      var isCorrect = answerKey[item.id] === assignments[item.id];
      validationResults[item.id] = isCorrect;
      if (isCorrect) correct += 1;
      else errorIds.push(item.id);
    });

    renderHistory();
    validation.textContent = correct === cases.length
      ? '¡' + correct + ' de ' + cases.length + ' correctas! Dominas este tema.'
      : correct + ' de ' + cases.length + ' correctas. Lee las pistas y toca las marcadas para cambiar el método.';
    validation.classList.add('has-result');
    reportResult(correct, errorIds);
  }

  function restoreAssignments() {
    var saved = readSavedAssignments();
    cases.forEach(function (item) {
      if (methodById[saved[item.id]]) assignments[item.id] = saved[item.id];
    });
  }

  createMethodButtons();
  restoreAssignments();
  showNextCase();
  renderHistory();
  updateProgress();

  reset.addEventListener('click', function () {
    assignments = {};
    validationResults = {};
    hasValidated = false;
    validation.classList.remove('has-result');
    try { localStorage.removeItem(storageKey); } catch (_) {}
    if (window.TercialProgress) window.TercialProgress.resetCurrentAttempt();
    showNextCase();
    renderHistory();
    updateProgress();
  });

  check.addEventListener('click', validateResponses);
})();
