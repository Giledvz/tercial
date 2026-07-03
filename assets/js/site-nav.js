/*
  site-nav.js — Web component <site-nav>
  Sistema "Editorial cálido funcional" · Fase 2.0

  Inyecta la barra de navegación persistente. Light DOM (consume
  el CSS global de components.css). El elemento mismo recibe la
  clase .site-nav + role="navigation" + aria-label, evitando un
  wrapper extra.

  Uso:
    <site-nav active="fisica"></site-nav>

  Si no se pasa 'active', se infiere de location.pathname. El brand
  "Tercial" es clickeable al home en TODOS los breakpoints — única
  vía de regreso al index cuando los 6 links están ocultos en mobile
  (<760px). Hamburger menu queda para Fase 2.7.
*/
(function () {
  'use strict';

  /* Hrefs absolutos a /tercial/* para que la nav funcione desde
     cualquier profundidad (tercial/*.html en producción + cualquier
     página de docs interna como design/preview.html). El path
     /tercial/ es fijo: matches el despliegue en GitHub Pages
     (giledvz.github.io/tercial/) y el dev local cuando se sirve
     desde la raíz del repositorio. Si el deploy path cambiara,
     editar SÓLO esta constante. */
  const HOME = '/tercial/';

  const NAV_ITEMS = [
    { route: 'inicio',      label: 'Inicio',       href: HOME,
      test: (p) => p === '' || p === 'index.html' },
    { route: 'examenes',    label: 'Exámenes',     href: HOME + 'uni.html#examenes',
      test: (p) => p.startsWith('examen') && p.endsWith('.html') },
    { route: 'tarjetas',    label: 'Tarjetas',     href: HOME + 'practicar.html',
      test: (p) => p === 'practicar.html' || p === 'flashcards.html' },
    { route: 'fisica',      label: 'Física',       href: HOME + 'uni.html#fisica',
      test: (p) => /^(fluidos|electricidad|cinematica|dinamica|trabajo_energia|cantidad_movimiento|termodinamica|optica|ondas|magnetismo|fisica_moderna)\.html$/.test(p) },
    { route: 'matematicas', label: 'Matemáticas',  href: HOME + 'uni.html#matematicas',
      test: (p) => /^(calculo|geometria|trigonometria)/.test(p) && p.endsWith('.html') },
    { route: 'notas',       label: 'Notas',        href: HOME + 'repaso.html',
      test: (p) => p === 'repaso.html' || p === 'formulario.html' }
  ];

  /* Iconos Lucide stroke 1.5 — base.css aplica stroke:currentColor
     y stroke-width:var(--icon-stroke-width) globalmente. */
  const ICONS = {
    moon:    '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun:     '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    sunmoon: '<svg class="icon-sunmoon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/></svg>'
  };

  function resolveActive(explicit) {
    if (explicit && NAV_ITEMS.some((i) => i.route === explicit)) return explicit;
    const basename = (location.pathname.split('/').pop() || '').toLowerCase();
    const match = NAV_ITEMS.find((item) => item.test(basename));
    return match ? match.route : null;
  }

  class SiteNav extends HTMLElement {
    connectedCallback() {
      const active = resolveActive(this.getAttribute('active'));
      const links = NAV_ITEMS.map((item) => {
        const ariaCurrent = item.route === active ? ' aria-current="page"' : '';
        return `<li><a href="${item.href}"${ariaCurrent}>${item.label}</a></li>`;
      }).join('');

      this.classList.add('site-nav');
      this.setAttribute('role', 'navigation');
      this.setAttribute('aria-label', 'principal');
      this.innerHTML = `
        <a class="site-nav__brand" href="${HOME}" aria-label="Tercial — ir al inicio">Tercial</a>
        <ul class="site-nav__links">${links}</ul>
        <button class="site-nav__theme" type="button" aria-label="Cambiar modo de color">
          ${ICONS.moon}${ICONS.sun}${ICONS.sunmoon}
        </button>`;

      this.querySelector('.site-nav__theme').addEventListener('click', () => {
        if (window.ClasesTheme) window.ClasesTheme.toggle();
      });
    }
  }

  if (!customElements.get('site-nav')) {
    customElements.define('site-nav', SiteNav);
  }
})();
