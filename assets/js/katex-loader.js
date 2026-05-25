/*
  katex-loader.js — Carga selectiva de KaTeX
  Sistema "Editorial cálido funcional" · Fase 2.0

  API:
    ClasesKatex.load(options?)  → Promise<void>
      options.autoRender (default true) — renderiza el <body> al cargar
      options.delimiters         — override de delimitadores

    ClasesKatex.render(element) → void
      Renderiza KaTeX en un sub-árbol específico (asume cargado).
      Si KaTeX no está cargado aún, dispara load() y resuelve la
      Promise pendiente.

  CDN jsdelivr, async, idempotente. Usa <link> + <script async>
  inyectados en <head>, sin bloquear el render del resto de la página.
*/
(function () {
  'use strict';

  const VERSION = '0.16';
  const BASE = `https://cdn.jsdelivr.net/npm/katex@${VERSION}/dist`;
  const DEFAULT_DELIMS = [
    { left: '$$',  right: '$$',  display: true  },
    { left: '\\[', right: '\\]', display: true  },
    { left: '$',   right: '$',   display: false },
    { left: '\\(', right: '\\)', display: false }
  ];

  let loadPromise = null;

  function injectStylesheet() {
    if (document.querySelector('link[data-katex="css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${BASE}/katex.min.css`;
    link.crossOrigin = 'anonymous';
    link.setAttribute('data-katex', 'css');
    document.head.appendChild(link);
  }

  function injectScript(path, marker) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-katex="${marker}"]`);
      if (existing) return existing.dataset.loaded ? resolve()
        : existing.addEventListener('load', () => resolve(), { once: true });

      const s = document.createElement('script');
      s.src = `${BASE}/${path}`;
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-katex', marker);
      s.addEventListener('load', () => { s.dataset.loaded = '1'; resolve(); });
      s.addEventListener('error', () => reject(new Error(`KaTeX load failed: ${path}`)));
      document.head.appendChild(s);
    });
  }

  const ClasesKatex = {
    load(options) {
      const opts = Object.assign({ autoRender: true, delimiters: null }, options || {});
      if (loadPromise) return loadPromise;

      loadPromise = injectScript('katex.min.js', 'core')
        .then(() => { injectStylesheet(); })
        .then(() => opts.autoRender ? injectScript('contrib/auto-render.min.js', 'auto-render') : null)
        .then(() => {
          if (opts.autoRender && window.renderMathInElement) {
            window.renderMathInElement(document.body, {
              delimiters: opts.delimiters || DEFAULT_DELIMS,
              throwOnError: false
            });
          }
        });

      return loadPromise;
    },

    render(element) {
      if (!element) return;
      if (window.renderMathInElement) {
        window.renderMathInElement(element, {
          delimiters: DEFAULT_DELIMS,
          throwOnError: false
        });
        return;
      }
      this.load({ autoRender: true });
    }
  };

  window.ClasesKatex = ClasesKatex;
})();
