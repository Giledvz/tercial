/* Selector de elemento con buscador, compartido por las escenas del tema 2
   (escenas-atomo.js y escenas-tabla.js). */
import { ELEMENTOS } from './elementos.js';

/* Selector de elemento con el diseño de Tercial. Sustituye al select
   nativo, cuya lista despliega el sistema operativo con otro estilo. Es un
   combobox accesible: botón que abre un panel con buscador y la lista de
   elementos agrupada por periodo; flechas para moverse, Enter para elegir,
   Esc para cerrar. */
const normalize = value => String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function elementPicker(root, initial, onPick) {
  const wrap = root.querySelector('[data-element-picker]');
  const button = wrap.querySelector('[data-picker-button]');
  const panel = wrap.querySelector('[data-picker-panel]');
  const search = wrap.querySelector('[data-picker-search]');
  const list = wrap.querySelector('[data-picker-list]');
  const empty = wrap.querySelector('[data-picker-empty]');
  const coarse = window.matchMedia('(pointer: coarse)');
  const options = new Map();
  const groups = [];
  let value = initial;
  let active = initial;

  let group = null;
  ELEMENTOS.forEach(element => {
    if (!group || group.period !== element.periodo) {
      const header = document.createElement('li');
      header.className = 'element-picker__group';
      header.setAttribute('aria-hidden', 'true');
      header.textContent = `Periodo ${element.periodo}`;
      list.appendChild(header);
      group = { period: element.periodo, header, members: [] };
      groups.push(group);
    }
    const option = document.createElement('li');
    option.className = 'element-picker__option';
    option.id = `${list.id}-${element.numero}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.dataset.z = element.numero;
    option.dataset.search = normalize(`${element.numero} ${element.simbolo} ${element.nombre} ${element.alias}`);
    option.innerHTML = `<span class="element-picker__z">${element.numero}</span>` +
      `<span class="element-picker__symbol">${element.simbolo}</span>` +
      `<span class="element-picker__name">${element.nombre}</span>`;
    list.appendChild(option);
    options.set(element.numero, option);
    group.members.push(option);
  });

  const label = z => {
    const element = ELEMENTOS[z - 1];
    return `${element.numero} · ${element.simbolo} · ${element.nombre}`;
  };

  function visibleOptions() {
    return [...options.values()].filter(option => !option.hidden);
  }

  function reveal(option, center) {
    const top = option.offsetTop - list.offsetTop;
    const bottom = top + option.offsetHeight;
    if (center) list.scrollTop = top - list.clientHeight / 2 + option.offsetHeight / 2;
    else if (top < list.scrollTop) list.scrollTop = top - 28;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }

  function setActive(z, center) {
    const previous = options.get(active);
    if (previous) previous.classList.remove('is-active');
    active = z;
    const option = options.get(z);
    if (!option) { search.removeAttribute('aria-activedescendant'); return; }
    option.classList.add('is-active');
    search.setAttribute('aria-activedescendant', option.id);
    reveal(option, center);
  }

  // Qué tan bien coincide un elemento con lo escrito: el símbolo o el número
  // exactos ganan («ca» → calcio), luego el nombre que empieza así.
  function score(z, q) {
    const element = ELEMENTOS[z - 1];
    const symbol = normalize(element.simbolo), name = normalize(element.nombre);
    if (symbol === q || String(z) === q) return 0;
    if (name.startsWith(q)) return 1;
    if (symbol.startsWith(q) || String(z).startsWith(q)) return 2;
    if (options.get(z).dataset.search.split(' ').some(word => word.startsWith(q))) return 3;
    if (options.get(z).dataset.search.includes(q)) return 4;
    return Infinity;
  }

  function filter(query) {
    const q = normalize(query);
    let best = null, bestScore = Infinity;
    options.forEach((option, z) => {
      const points = q ? score(z, q) : 0;
      option.hidden = points === Infinity;
      if (points < bestScore) { best = z; bestScore = points; }
    });
    groups.forEach(g => { g.header.hidden = g.members.every(option => option.hidden); });
    empty.hidden = best !== null;
    if (best !== null && q) setActive(best, true);
  }

  function open() {
    if (!panel.hidden) return;
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    search.value = '';
    filter('');
    setActive(value, true);
    if (!coarse.matches) search.focus();
    else list.focus({ preventScroll: true });
  }

  function close(returnFocus) {
    if (panel.hidden) return;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }

  function set(z) {
    options.get(value).setAttribute('aria-selected', 'false');
    value = z;
    options.get(z).setAttribute('aria-selected', 'true');
    button.textContent = label(z);
  }

  function pick(z) {
    set(z);
    close(true);
    onPick(z);
  }

  function move(step) {
    const visible = visibleOptions();
    if (!visible.length) return;
    const index = visible.findIndex(option => Number(option.dataset.z) === active);
    const next = visible[Math.max(0, Math.min(visible.length - 1, index + step))];
    setActive(Number(next.dataset.z), false);
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close(false)));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
  });
  search.addEventListener('input', () => filter(search.value));
  const keys = event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
    else if (event.key === 'PageDown') { event.preventDefault(); move(8); }
    else if (event.key === 'PageUp') { event.preventDefault(); move(-8); }
    else if (event.key === 'Enter') { event.preventDefault(); if (!options.get(active).hidden) pick(active); }
    else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close(false);
  };
  search.addEventListener('keydown', keys);
  list.addEventListener('keydown', keys);
  list.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (option) pick(Number(option.dataset.z));
  });
  list.addEventListener('pointermove', event => {
    const option = event.target.closest('[role="option"]');
    if (option && Number(option.dataset.z) !== active && event.pointerType === 'mouse') setActive(Number(option.dataset.z), false);
  });
  document.addEventListener('pointerdown', event => {
    if (!panel.hidden && !wrap.contains(event.target)) close(false);
  });
  wrap.addEventListener('focusout', () => {
    setTimeout(() => { if (!wrap.contains(document.activeElement) && !coarse.matches) close(false); }, 0);
  });

  set(initial);
  return { get value() { return value; }, set };
}
