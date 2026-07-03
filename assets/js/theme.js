/*
  theme.js — API global ClasesTheme
  Sistema "Editorial cálido funcional" · Fase 2.0

  Persiste la preferencia del usuario en localStorage bajo la
  clave 'tercial-theme-pref'. Aplica al <html>:
    data-theme       → 'light' | 'dark'  (lo lee el CSS)
    data-theme-pref  → 'light' | 'dark' | 'auto'  (lo lee el toggle)

  Dispara CustomEvent('tercial:themechange', {detail:{applied,pref}}).
  El snippet anti-flash en <head> debe correr antes (ver § 11 del
  design-system).
*/
(function () {
  'use strict';

  const KEY = 'tercial-theme-pref';
  const VALID = ['light', 'dark', 'auto'];
  const ORDER = ['light', 'dark', 'auto'];
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const resolve = (pref) =>
    pref === 'auto' ? (mql.matches ? 'dark' : 'light') : pref;

  function apply() {
    const pref = ClasesTheme.get();
    const applied = resolve(pref);
    const root = document.documentElement;
    root.setAttribute('data-theme', applied);
    root.setAttribute('data-theme-pref', pref);
    window.dispatchEvent(new CustomEvent('tercial:themechange', {
      detail: { applied, pref }
    }));
  }

  const ClasesTheme = {
    get() {
      const stored = localStorage.getItem(KEY);
      return VALID.includes(stored) ? stored : 'auto';
    },
    set(pref) {
      if (!VALID.includes(pref)) return;
      localStorage.setItem(KEY, pref);
      apply();
    },
    toggle() {
      const next = ORDER[(ORDER.indexOf(this.get()) + 1) % ORDER.length];
      this.set(next);
    },
    applied() {
      return resolve(this.get());
    }
  };

  /* En modo 'auto', reaccionar a cambios del sistema en vivo. */
  mql.addEventListener('change', () => {
    if (ClasesTheme.get() === 'auto') apply();
  });

  /* Al restaurar desde el bfcache (botón atrás/adelante, sobre todo en Safari),
     el DOM vuelve con el data-theme viejo y los scripts no re-corren. Reaplicar
     el tema según la preferencia actual (instantáneo; solo si realmente cambió). */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const root = document.documentElement;
    if (root.getAttribute('data-theme') !== resolve(ClasesTheme.get())) apply();
  });

  apply();
  window.ClasesTheme = ClasesTheme;
})();
