/* Escenas de propiedades: maleabilidad, ductilidad, oxidación,
   inflamabilidad, punto de fusión, punto de ebullición y reactividad con ácidos.
   Cada escena es una función render(t) sin estado: dibuja el instante t del
   ciclo. Así el movimiento reducido muestra un fotograma fijo exacto y la
   pausa fuera de pantalla sólo detiene el reloj de esa escena.
   En ambas el volumen del metal se conserva: lo que pierde de grosor lo gana
   en extensión (lámina: a lo ancho y a lo largo; alambre: sólo a lo largo).
   El terracota marca lo que hay que mirar: lo nuevo que aparece (óxido, flama,
   gas) o la temperatura que se repite en ambas muestras. */
(() => {
  const elements = [...document.querySelectorAll('[data-property-scene]')];
  if (!elements.length) return;

  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (start, end, progress) => start + (end - start) * progress;
  const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
  const easeIn = value => { const p = clamp(value); return p * p * p; };
  const easeOut = value => { const p = 1 - clamp(value); return 1 - p * p * p; };
  const round = value => Math.round(value * 100) / 100;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const NS = 'http://www.w3.org/2000/svg';

  function make(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Azar con semilla: cada ciclo se ve igual y el movimiento reducido es estable.
  function random(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (n, salt) => random(n * 7919 + salt * 104729)();

  // Reinicio comprensible: lo que se movió se desvanece, la escena vuelve a su
  // estado inicial y reaparece. Devuelve el instante que hay que dibujar.
  function cycle(t, outStart, resetAt, inEnd) {
    if (t < outStart) return { s: t, opacity: 1 };
    if (t < resetAt) return { s: t, opacity: 1 - smooth((t - outStart) / (resetAt - outStart)) };
    return { s: 0, opacity: smooth((t - resetAt) / (inEnd - resetAt)) };
  }

  // Termómetro: columna desde el bulbo hasta la temperatura y lectura arriba.
  function thermometer(element, key, bulbY, yOf) {
    const column = element.querySelector(`[data-col="${key}"]`);
    const bulb = element.querySelector(`[data-bulb="${key}"]`);
    const reading = element.querySelector(`[data-read="${key}"]`);
    return (temperature, highlight) => {
      const y = yOf(temperature);
      column.setAttribute('y', round(y));
      column.setAttribute('height', round(Math.max(0, bulbY - y)));
      reading.textContent = `${Math.round(temperature)} °C`.replace('-', '−');
      [column, bulb, reading].forEach(node => node.classList.toggle('is-key', highlight));
    };
  }

  /* ---------- Maleabilidad: martillo, yunque y lámina ---------- */
  function createMaleability(element) {
    const piece = element.querySelector('[data-m-piece]');
    const front = element.querySelector('[data-m-front]');
    const edge = element.querySelector('[data-m-edge]');
    const top = element.querySelector('[data-m-top]');
    const glint = element.querySelector('[data-m-glint]');
    const ring = element.querySelector('[data-m-ring]');
    const impact = element.querySelector('[data-m-impact]');
    const hammer = element.querySelector('[data-m-hammer]');

    const cx = 320;          // centro de la cara del yunque
    const base = 196;        // arista frontal de la cara del yunque
    const depthScale = .3;   // proyección del fondo (vista ligeramente cenital)
    const w0 = 96, h0 = 46, d0 = 54, spread = .6;
    const handle = 170, faceDrop = 32;
    const rest = 16, raised = 22, recoil = 7;
    const strikes = 5, first = .55, period = 1.12;
    const thickness = Array.from({ length: strikes + 1 }, (_, i) => h0 * Math.pow(6 / h0, i / strikes));
    const done = first + strikes * period;
    const duration = 9.7;

    // Volumen constante: w·h·d = w0·h0·d0, repartido entre ancho y fondo.
    const size = h => {
      const ratio = h0 / h;
      return { w: w0 * Math.pow(ratio, spread), h, d: d0 * Math.pow(ratio, 1 - spread) };
    };
    // Altura del punto de contacto: la mitad del fondo de la cara superior.
    const contactFor = h => base - h - size(h).d * depthScale / 2;

    function state(t) {
      let h = thickness[0];
      let angle = rest;
      let impactAge = -1;
      for (let index = 0; index < strikes; index += 1) {
        const relative = t - (first + index * period);
        if (relative < 0) break;
        const from = index === 0 ? rest : recoil;
        h = thickness[index];
        if (relative < .46) angle = mix(from, raised, smooth(relative / .46));
        else if (relative < .56) angle = raised;
        else if (relative < .76) angle = raised * (1 - easeIn((relative - .56) / .2));
        else if (relative < .86) {
          angle = 0;
          h = mix(thickness[index], thickness[index + 1], easeOut((relative - .76) / .1));
          impactAge = relative - .76;
        } else {
          angle = recoil * easeOut((relative - .86) / .26);
          h = thickness[index + 1];
          impactAge = relative - .76;
        }
      }
      if (t >= done) angle = mix(recoil, rest, smooth((t - done) / .6));

      // Reinicio: la lámina se desvanece, el martillo sube a la altura del
      // bloque nuevo y el bloque se coloca sobre el yunque.
      let hammerContact = contactFor(h);
      let opacity = 1;
      let drop = 0;
      if (t >= 8.2) {
        hammerContact = mix(contactFor(thickness[strikes]), contactFor(thickness[0]), smooth((t - 8.2) / .9));
        if (t < 8.7) opacity = 1 - smooth((t - 8.2) / .5);
        else if (t < 8.85) opacity = 0;
        else {
          h = thickness[0];
          const p = clamp((t - 8.85) / .6);
          opacity = smooth(p);
          drop = -10 * (1 - easeOut(p));
        }
      }
      return { ...size(h), angle, impactAge, opacity, drop, hammerContact };
    }

    function render(t) {
      const { w, h, d, angle, impactAge, opacity, drop, hammerContact } = state(t);
      const x0 = cx - w / 2, x1 = cx + w / 2, yTop = base - h;
      const depth = d * depthScale, inset = depth * .35;
      const contact = yTop - depth / 2;

      front.setAttribute('d', `M${round(x0)} ${base}V${round(yTop)}H${round(x1)}V${base}Z`);
      edge.setAttribute('d', `M${round(x0)} ${round(yTop)}H${round(x1)}V${round(yTop + Math.min(2, h * .3))}H${round(x0)}Z`);
      top.setAttribute('d', `M${round(x0)} ${round(yTop)}L${round(x0 + inset)} ${round(yTop - depth)}H${round(x1 - inset)}L${round(x1)} ${round(yTop)}Z`);
      const g0 = depth * .28, g1 = depth * .52;
      glint.setAttribute('d', `M${round(x0 + inset * .28 + 4)} ${round(yTop - g0)}L${round(x0 + inset * .52 + 4)} ${round(yTop - g1)}H${round(x1 - inset * .52 - 4)}L${round(x1 - inset * .28 - 4)} ${round(yTop - g0)}Z`);
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', round(contact));
      ring.setAttribute('rx', round(w * .3));
      ring.setAttribute('ry', round(depth * .3));
      piece.setAttribute('opacity', round(opacity));
      piece.setAttribute('transform', `translate(0 ${round(drop)})`);

      hammer.setAttribute('transform', `translate(${cx + handle} ${round(hammerContact - faceDrop)}) rotate(${round(angle)})`);

      if (impactAge >= 0 && impactAge < .32) {
        const p = impactAge / .32;
        const reach = 6 + 12 * easeOut(p);
        const y = contact - 3;
        const left = cx - 25, right = cx + 25;
        impact.setAttribute('d', [
          `M${round(left)} ${round(y)}l${round(-reach)} ${round(-reach * .35)}`,
          `M${round(left + 1)} ${round(y - 9)}l${round(-reach * .8)} ${round(-reach * .8)}`,
          `M${round(right)} ${round(y)}l${round(reach)} ${round(-reach * .35)}`,
          `M${round(right - 1)} ${round(y - 9)}l${round(reach * .8)} ${round(-reach * .8)}`
        ].join(''));
        impact.setAttribute('opacity', round(1 - smooth(p)));
      } else {
        impact.setAttribute('d', '');
      }

      element.dataset.scenePhase = opacity < 1 ? 'reinicio'
        : h <= thickness[strikes] + .01 ? 'lamina'
        : impactAge >= 0 && impactAge < .1 ? 'golpe'
        : 'metal';
      element.dataset.sceneThickness = round(h);
    }

    return { render, duration, still: 7.4 };
  }

  /* ---------- Ductilidad: hilera, varilla y pinzas ---------- */
  function createDuctility(element) {
    const moving = element.querySelector('[data-d-moving]');
    const tool = element.querySelector('[data-d-moving-tool]');
    const metal = element.querySelector('[data-d-metal]');
    const shade = element.querySelector('[data-d-shade]');
    const glint = element.querySelector('[data-d-glint]');
    const cap = element.querySelector('[data-d-cap]');
    const marks = element.querySelector('[data-d-marks]');
    const pliers = element.querySelector('[data-d-pliers]');
    const jaws = [...element.querySelectorAll('[data-d-jaw]')];

    const axis = 104;
    const rodRadius = 13, wireRadius = 5;
    const coneStart = 149, throat = 170;       // zona donde el metal toca la hilera
    const rodStart = 26, capRadius = 4.5;
    const gripStart = 226, gripInside = 36;    // punta de las pinzas y extremo del alambre
    const pull = 232;
    const areaRatio = (rodRadius / wireRadius) ** 2;
    const duration = 8.5;

    // Volumen del cono expresado como longitud equivalente de varilla.
    const coneSteps = 42;
    const coneTable = [0];
    for (let i = 1; i <= coneSteps; i += 1) {
      const r = mix(rodRadius, wireRadius, (i - .5) / coneSteps);
      coneTable.push(coneTable[i - 1] + (r / rodRadius) ** 2 * (throat - coneStart) / coneSteps);
    }
    const coneVolume = coneTable[coneSteps];
    const radiusAt = x => x <= coneStart ? rodRadius
      : x >= throat ? wireRadius
      : mix(rodRadius, wireRadius, (x - coneStart) / (throat - coneStart));

    // Posición de un punto del metal según cuánta varilla le falta para el cono.
    function positionOf(q) {
      if (q >= 0) return coneStart - q;
      const inside = -q;
      if (inside >= coneVolume) return throat + (inside - coneVolume) * areaRatio;
      let i = 1;
      while (coneTable[i] < inside) i += 1;
      const p = (inside - coneTable[i - 1]) / (coneTable[i] - coneTable[i - 1]);
      return coneStart + (i - 1 + p) * (throat - coneStart) / coneSteps;
    }

    const markOffsets = [4, 20, 36, 52];

    function state(t) {
      let drawn = 0, approach = 0, open = 0, opacity = 1;
      if (t < .5) {
        approach = 16 * (1 - smooth(t / .5));
        open = 9;
      } else if (t < .9) {
        open = 9 * (1 - smooth((t - .5) / .4));
      }
      if (t >= .9) drawn = pull * smooth((t - .9) / 4);
      if (t >= 4.9) open = 9 * smooth((t - 4.9) / .35);
      if (t >= 5.2) approach = 10 * smooth((t - 5.2) / .45);
      if (t >= 7 && t < 7.5) opacity = 1 - smooth((t - 7) / .5);
      else if (t >= 7.5 && t < 7.75) opacity = 0;
      else if (t >= 7.75) {
        drawn = 0;
        approach = 16;
        open = 9;
        opacity = smooth((t - 7.75) / .6);
      }
      return { drawn, approach, open, opacity };
    }

    function render(t) {
      const { drawn, approach, open, opacity } = state(t);
      const advance = drawn / areaRatio;
      const left = rodStart + advance;
      const right = gripStart + drawn + gripInside;
      const profile = [left, coneStart, throat, right];
      const contour = (factor, side) => profile.map(x => `${round(x)} ${round(axis + side * factor * radiusAt(x))}`);

      const upper = contour(1, -1);
      const lower = contour(1, 1).reverse();
      metal.setAttribute('d', `M${upper.join('L')}L${lower.join('L')}A${capRadius} ${rodRadius} 0 0 1 ${round(left)} ${axis - rodRadius}Z`);
      const band = (a, b) => {
        const outer = profile.map(x => `${round(x)} ${round(axis + a * radiusAt(x))}`);
        const inner = profile.map(x => `${round(x)} ${round(axis + b * radiusAt(x))}`).reverse();
        return `M${outer.join('L')}L${inner.join('L')}Z`;
      };
      shade.setAttribute('d', band(1, .45));
      glint.setAttribute('d', band(-.66, -.3));
      cap.setAttribute('cx', round(left));

      const ticks = markOffsets
        .map(q => positionOf(q - advance))
        .filter(x => x > left + capRadius && x < right - 2)
        .map(x => {
          const r = radiusAt(x) - .6;
          return `M${round(x)} ${round(axis - r)}Q${round(x + r * .32)} ${axis} ${round(x)} ${round(axis + r)}`;
        });
      marks.setAttribute('d', ticks.join(''));

      pliers.setAttribute('transform', `translate(${round(gripStart + drawn + approach)} ${axis})`);
      jaws.forEach(jaw => jaw.setAttribute('transform', `rotate(${round(open)} 40 0)`));
      moving.setAttribute('opacity', round(opacity));
      tool.setAttribute('opacity', round(opacity));

      element.dataset.scenePhase = opacity < 1 ? 'reinicio'
        : drawn >= pull - .01 ? 'alambre'
        : drawn > 0 ? 'estirando'
        : 'metal';
      element.dataset.sceneLength = round(right - throat);
    }

    return { render, duration, still: 6.4 };
  }


  /* ---------- Oxidación: un clavo se cubre de óxido con los días ---------- */
  function createOxidation(element) {
    const moving = element.querySelector('[data-ox-moving]');
    const rustLayer = element.querySelector('[data-ox-rust]');
    const flakeLayer = element.querySelector('[data-ox-flakes]');
    const dropLayer = element.querySelector('[data-ox-drops]');
    const day = element.querySelector('[data-ox-day]');
    const rand = random(17);
    const duration = 11;

    const blobs = Array.from({ length: 44 }, (_, i) => ({
      node: make('ellipse', { class: i % 3 === 0 ? 'property-scene__rust-dark' : 'property-scene__rust', rx: 0, ry: 0 }, rustLayer),
      x: 112 + rand() * 380, y: 146 + rand() * 40,
      rx: 10 + rand() * 17, ry: 6 + rand() * 9,
      start: .8 + rand() * 5.4, grow: 1.8 + rand() * 1.4
    }));
    const flakes = Array.from({ length: 9 }, (_, i) => ({
      node: make('path', { class: 'property-scene__rust-dark', d: 'M-4 -2L2 -3L5 1L0 3L-5 1Z', opacity: 0 }, flakeLayer),
      x: 150 + i * 32 + rand() * 14, born: 5 + i * .42 + rand() * .2,
      drift: (rand() - .5) * 16, spin: (rand() - .5) * 200,
      fromY: 160 + rand() * 12, toY: 186 + rand() * 7
    }));
    const drops = [[176, 152.5, 1], [292, 152.5, .8], [398, 152.5, 1.1], [150, 186, 1.2], [466, 183, .9]].map(([x, y, size]) => {
      const g = make('g', {}, dropLayer);
      make('ellipse', { class: 'property-scene__drop', rx: 5 * size, ry: 3.4 * size }, g);
      make('ellipse', { class: 'property-scene__drop-glint', cx: -1.6 * size, cy: -1.2 * size, rx: 1.4 * size, ry: .9 * size }, g);
      return { g, x, y };
    });

    function render(t) {
      const { s, opacity } = cycle(t, 9.6, 10.1, 10.8);
      const progress = smooth((s - .6) / 7.6);
      day.textContent = `día ${1 + Math.round(29 * progress)}`;
      for (const b of blobs) {
        const g = easeOut((s - b.start) / b.grow);
        b.node.setAttribute('cx', round(b.x));
        b.node.setAttribute('cy', round(b.y));
        b.node.setAttribute('rx', round(b.rx * g));
        b.node.setAttribute('ry', round(b.ry * g));
        b.node.setAttribute('opacity', round(.9 * g));
      }
      for (const f of flakes) {
        const age = s - f.born;
        if (age < 0) { f.node.setAttribute('opacity', 0); continue; }
        const fall = easeIn(age / .7);
        f.node.setAttribute('opacity', 1);
        f.node.setAttribute('transform', `translate(${round(f.x + f.drift * fall)} ${round(mix(f.fromY, f.toY, fall))}) rotate(${round(f.spin * fall)})`);
      }
      for (const d of drops) {
        const k = 1 - smooth((s - 1.4) / 5.6);
        d.g.setAttribute('transform', `translate(${d.x} ${d.y}) scale(${round(Math.max(k, .001))})`);
      }
      moving.setAttribute('opacity', round(opacity));
      element.dataset.scenePhase = s < .6 ? 'clavo' : progress < 1 ? 'oxidando' : 'oxidado';
    }

    return { render, duration, still: 8.8 };
  }

  /* ---------- Inflamabilidad: madera y metal en la misma flama ---------- */
  function createFlammability(element) {
    const candles = [...element.querySelectorAll('[data-fl-candle]')];
    const moving = element.querySelector('[data-fl-moving]');
    const stick = element.querySelector('[data-fl-stick]');
    const stickLight = element.querySelector('[data-fl-stick-light]');
    const stickShade = element.querySelector('[data-fl-stick-shade]');
    const grainClip = element.querySelector('[data-fl-clip]');
    const scorch = element.querySelector('[data-fl-scorch]');
    const char = element.querySelector('[data-fl-char]');
    const ashTip = element.querySelector('[data-fl-ashtip]');
    const embers = [...element.querySelectorAll('[data-fl-ember]')];
    const woodFlame = element.querySelector('[data-fl-woodflame]');
    const tongues = [...element.querySelectorAll('[data-fl-tongue]')];
    // Borde dentado del carbón y lenguas de fuego: atrás las chicas, al frente la grande.
    const jagged = [[165, 0], [168, -1.8], [171.2, 1], [174.2, -2.4], [177.2, .7], [180.2, -1.5], [183, 0]];
    const emberAt = [[.18, 167.8], [.42, 173.4], [.66, 177.6], [.84, 170.6]];
    const tongueShape = [{ dx: 4, k: .6, phase: 2 }, { dx: -3.5, k: .5, phase: 4 }, { dx: 0, k: 1, phase: 0 }];
    const spoon = element.querySelector('[data-fl-spoon]');
    const smokeLayer = element.querySelector('[data-fl-smoke]');
    const ashLayer = element.querySelector('[data-fl-ash]');
    const smoke = Array.from({ length: 22 }, () => make('circle', { class: 'property-scene__smoke', r: 0 }, smokeLayer));
    const ash = Array.from({ length: 6 }, () => make('rect', { class: 'property-scene__ash', width: 3.5, height: 2.2, rx: .6, opacity: 0 }, ashLayer));
    const duration = 10.6;
    const candleX = [180, 420];

    function state(s) {
      const approach = smooth((s - .4) / 1.1);
      const front = mix(64, 196, approach) - 92 * smooth((s - 2.2) / 5.4);
      const charWidth = 9 * smooth((s - 2) / .6);
      const flame = smooth((s - 2) / .6) * (1 - smooth((s - 7.4) / .7));
      return { approach, front, charWidth, flame };
    }

    const flicker = (t, i) => ({
      angle: 2.2 * Math.sin(t * 6.3 + i * 1.7),
      sx: 1 - .03 * Math.sin(t * 11.3 + i),
      sy: 1 + .06 * Math.sin(t * 13.1 + i) + .03 * Math.sin(t * 27.7 + i * 2)
    });

    function render(t) {
      const { s, opacity } = cycle(t, 9.3, 9.8, 10.5);
      candles.forEach((node, i) => {
        const f = flicker(t, i);
        node.setAttribute('transform', `translate(${candleX[i]} 201) rotate(${round(f.angle)}) scale(${round(f.sx)} ${round(f.sy)})`);
      });

      const { approach, front, charWidth, flame } = state(s);
      const wood = front - charWidth;
      const burnt = charWidth > .2;
      const ashWidth = 3.2 * charWidth / 9;
      const charEnd = front - ashWidth;
      const scorchWidth = Math.min(6, charWidth * .7);
      stick.setAttribute('d', `M-10 165H${round(burnt ? wood : front - 1.5)}${burnt ? '' : `Q${round(front + 1.5)} 174 ${round(front - 1.5)} 183`}V183H-10Z`);
      stickLight.setAttribute('d', `M-10 165H${round(burnt ? wood : front - 1.8)}V168.4H-10Z`);
      stickShade.setAttribute('d', `M-10 178.8H${round(burnt ? wood : front - 1.8)}V183H-10Z`);
      grainClip.setAttribute('width', round(Math.max(0, (burnt ? wood - scorchWidth : front - 2) + 10)));
      scorch.setAttribute('d', burnt ? `M${round(wood - scorchWidth)} 165H${round(wood)}V183H${round(wood - scorchWidth)}Z` : '');
      char.setAttribute('d', burnt ? `M${round(wood)} 165${jagged.map(([y, dx]) => `L${round(charEnd + dx)} ${y}`).join('')}L${round(wood)} 183Z` : '');
      ashTip.setAttribute('d', burnt ? `M${round(charEnd - 2)} 165.6L${round(front - 1)} 166.6Q${round(front + 2)} 174 ${round(front - 1)} 181.4L${round(charEnd - 2)} 182.4Z` : '');
      const glow = smooth((s - 2.1) / .4) * (1 - smooth((s - 7.9) / 1.2));
      embers.forEach((node, i) => {
        node.setAttribute('x', round(mix(wood, charEnd, emberAt[i][0]) - 1.2));
        node.setAttribute('y', emberAt[i][1]);
        node.setAttribute('opacity', round(burnt ? glow * (.4 + .6 * Math.abs(Math.sin(t * (4 + i * 1.3) + i * 1.7))) : 0));
      });
      woodFlame.setAttribute('transform', flame > .01 ? `translate(${round(front - charWidth / 2)} 165.5) scale(${round(flame)})` : 'scale(0)');
      tongues.forEach((node, i) => {
        const shape = tongueShape[i];
        const f = flicker(t * (1 + i * .23) + shape.phase, i + 3);
        node.setAttribute('transform', `translate(${shape.dx} 0) rotate(${round(f.angle * 1.6)}) scale(${round(shape.k * 1.05 * f.sx)} ${round(shape.k * 1.2 * f.sy)})`);
      });
      spoon.setAttribute('transform', `translate(${round(mix(160, 0, approach))} 0)`);

      smoke.forEach(node => node.setAttribute('opacity', 0));
      const latest = Math.floor((Math.min(s, 7.8) - 2.4) / .11);
      for (let n = Math.max(0, latest - 21); n <= latest; n += 1) {
        const born = 2.4 + n * .11;
        const age = s - born;
        if (age < 0 || age >= 2.2) continue;
        const origin = state(born);
        const node = smoke[n % smoke.length];
        const life = age / 2.2;
        node.setAttribute('cx', round(origin.front - origin.charWidth / 2 + 8 * Math.sin(age * 2.4 + n) + 10 * age));
        node.setAttribute('cy', round(147 - 86 * easeOut(life)));
        node.setAttribute('r', round(4 + 12 * life));
        node.setAttribute('opacity', round(.3 * (1 - life) * Math.min(1, age / .3)));
      }
      ash.forEach(node => node.setAttribute('opacity', 0));
      const lastAsh = Math.floor((Math.min(s, 7.4) - 2.9) / .55);
      for (let n = Math.max(0, lastAsh - 2); n <= lastAsh; n += 1) {
        const born = 2.9 + n * .55;
        const age = s - born;
        if (age < 0 || age >= .9) continue;
        const origin = state(born);
        const node = ash[n % ash.length];
        node.setAttribute('x', round(origin.front - origin.charWidth + 2));
        node.setAttribute('y', round(183 + 24 * easeIn(age / .9)));
        node.setAttribute('opacity', round(1 - smooth((age - .3) / .6)));
      }

      moving.setAttribute('opacity', round(opacity));
      element.dataset.scenePhase = s < 2 ? 'acercando' : flame > .01 ? 'ardiendo' : 'apagado';
    }

    return { render, duration, still: 5.2 };
  }

  /* Cubo de hielo en tres cuartos: frente, cara superior y costado, con el
     centro escarchado de los hielos de congelador, burbujas atrapadas y
     aristas brillantes. Al derretirse se redondea y se aplana. */
  // Mancha irregular: el centro blanco y turbio de un hielo de congelador.
  const cloudLobes = [1, .82, 1.1, .9, 1.05, .84, 1.12, .93];
  function cloud(cx, cy, rx, ry) {
    const points = cloudLobes.map((k, i) => {
      const a = i / cloudLobes.length * Math.PI * 2;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const start = mid(points[points.length - 1], points[0]);
    return `M${round(start[0])} ${round(start[1])}` + points.map((p, i) => {
      const m = mid(p, points[(i + 1) % points.length]);
      return `Q${round(p[0])} ${round(p[1])} ${round(m[0])} ${round(m[1])}`;
    }).join('') + 'Z';
  }

  function iceCube(group) {
    const side = group.querySelector('[data-ice-side]');
    const top = group.querySelector('[data-ice-top]');
    const front = group.querySelector('[data-ice-front]');
    const core = group.querySelector('[data-ice-core]');
    const bubbles = [...group.querySelectorAll('[data-ice-bubble]')];
    const edge = group.querySelector('[data-ice-edge]');
    const bubbleAt = [[.36, .4, .045], [.6, .52, .036], [.46, .68, .028]];
    return (cx, base, size, melted) => {
      const s = size * Math.cbrt(Math.max(0, 1 - melted));
      if (s <= .8) {
        [side, top, edge, core].forEach(node => node.setAttribute('d', ''));
        front.setAttribute('width', 0);
        bubbles.forEach(node => node.setAttribute('r', 0));
        return;
      }
      const flat = 1 - .6 * melted;
      const dx = s * .3 * flat, dy = s * .22 * flat;
      const x0 = cx - (s + dx) / 2, y0 = base - s;
      const rx = Math.min(s / 2, 1.2 + .16 * size * melted);
      const faces = round(1 - .75 * melted);
      front.setAttribute('x', round(x0)); front.setAttribute('y', round(y0));
      front.setAttribute('width', round(s)); front.setAttribute('height', round(s));
      front.setAttribute('rx', round(rx));
      top.setAttribute('d', `M${round(x0 + rx * .6)} ${round(y0)}L${round(x0 + dx + rx * .6)} ${round(y0 - dy)}H${round(x0 + s + dx - rx * .3)}L${round(x0 + s)} ${round(y0)}Z`);
      side.setAttribute('d', `M${round(x0 + s)} ${round(y0)}L${round(x0 + s + dx)} ${round(y0 - dy)}V${round(base - dy - rx * .5)}L${round(x0 + s)} ${round(base)}Z`);
      top.setAttribute('opacity', faces);
      side.setAttribute('opacity', faces);
      core.setAttribute('d', cloud(x0 + s * .5, y0 + s * .52, s * .25, s * .22));
      core.setAttribute('opacity', round(.75 * (1 - .5 * melted)));
      bubbles.forEach((node, i) => {
        const [bx, by, br] = bubbleAt[i];
        node.setAttribute('cx', round(x0 + s * bx)); node.setAttribute('cy', round(y0 + s * by));
        node.setAttribute('r', round(s > 8 ? s * br : 0));
      });
      edge.setAttribute('d', `M${round(x0 + rx)} ${round(y0 + .8)}H${round(x0 + s - rx * .4)}M${round(x0 + .8)} ${round(y0 + rx)}V${round(y0 + s * .72)}`);
      edge.setAttribute('opacity', round(1 - melted));
    };
  }

  /* ---------- Punto de fusión: mucho y poco hielo se derriten a 0 °C ---------- */
  function createMelting(element) {
    const moving = element.querySelector('[data-fu-moving]');
    const yOf = temperature => 236 - (temperature + 15) * 3.4;
    const samples = [
      { cx: 166, size: 72, top: [95, 255], bottom: [105, 245], water: 15, warm: 2.8, melt: 8.8, end: 8, after: 1.8 },
      { cx: 425, size: 34, top: [370, 480], bottom: [378, 472], water: 5, warm: 1.6, melt: 4.6, end: 16, after: 2.6 }
    ].map((sample, key) => {
      return {
        ...sample,
        drawIce: iceCube(element.querySelector(`[data-ice="${key}"]`)),
        waterNode: element.querySelector(`[data-water="${key}"]`),
        show: thermometer(element, key, 246, yOf)
      };
    });
    const duration = 13;

    const temperatureOf = (sample, s) => s < sample.warm
      ? mix(-12, 0, smooth((s - .4) / (sample.warm - .4)))
      : s < sample.melt ? 0 : mix(0, sample.end, smooth((s - sample.melt) / sample.after));
    const wallX = (sample, side, y) => {
      const k = (260 - y) / 24;
      return side === 0 ? mix(sample.bottom[0], sample.top[0], k) : mix(sample.bottom[1], sample.top[1], k);
    };

    function render(t) {
      const { s, opacity } = cycle(t, 11.6, 12.1, 12.8);
      for (const sample of samples) {
        const melted = clamp((s - sample.warm) / (sample.melt - sample.warm));
        sample.drawIce(sample.cx, 258, sample.size, melted);
        const level = 258 - sample.water * melted;
        sample.waterNode.setAttribute('d', melted > 0
          ? `M${round(wallX(sample, 0, level))} ${round(level)}H${round(wallX(sample, 1, level))}L${round(wallX(sample, 1, 258))} 258H${round(wallX(sample, 0, 258))}Z`
          : '');
        sample.show(temperatureOf(sample, s), melted > 0 && melted < 1);
      }
      moving.setAttribute('opacity', round(opacity));
      const meltingNow = samples.filter(sample => s >= sample.warm && s < sample.melt).length;
      element.dataset.scenePhase = meltingNow === 2 ? 'ambos-a-0' : meltingNow ? 'derritiendo' : s < 1 ? 'hielo' : 'agua';
    }

    return { render, duration, still: 3.6 };
  }

  /* ---------- Punto de ebullición: mucha y poca agua hierven a 100 °C ---------- */
  function createBoiling(element) {
    const moving = element.querySelector('[data-eb-moving]');
    const yOf = temperature => 220 - (temperature - 15) * 1.3;
    const samples = [
      { cx: 175, level: 150, evaporates: 3, boilsAt: 7.8 },
      { cx: 425, level: 222, evaporates: 7, boilsAt: 3.6 }
    ].map((sample, key) => ({
      ...sample, key,
      water: element.querySelector(`[data-water="${key}"]`),
      bubbles: Array.from({ length: 14 }, () => make('circle', { class: 'property-scene__bubble', r: 0 }, element.querySelector(`[data-bubbles="${key}"]`))),
      steam: Array.from({ length: 9 }, () => make('circle', { class: 'property-scene__steam', r: 0 }, element.querySelector(`[data-steam="${key}"]`))),
      show: thermometer(element, key, 236, yOf)
    }));
    const duration = 13.5;

    function render(t) {
      const { s, opacity } = cycle(t, 11.9, 12.4, 13.1);
      for (const sample of samples) {
        const boiling = s >= sample.boilsAt;
        const temperature = boiling ? 100 : mix(22, 100, smooth((s - .5) / (sample.boilsAt - .5)));
        const level = sample.level + sample.evaporates * smooth((s - sample.boilsAt) / (9.6 - sample.boilsAt));
        sample.water.setAttribute('y', round(level));
        sample.water.setAttribute('height', round(245 - level));
        sample.show(temperature, boiling);

        sample.bubbles.forEach(node => node.setAttribute('r', 0));
        sample.steam.forEach(node => node.setAttribute('opacity', 0));
        if (!boiling) continue;
        const life = Math.max(.12, (245 - level - 6) / 120);
        const latest = Math.floor((s - sample.boilsAt) / .09);
        for (let n = Math.max(0, latest - 13); n <= latest; n += 1) {
          const age = s - (sample.boilsAt + n * .09);
          if (age < 0 || age >= life) continue;
          const node = sample.bubbles[n % sample.bubbles.length];
          node.setAttribute('cx', round(sample.cx - 40 + hash(n, sample.key + 1) * 62 + 2 * Math.sin(age * 12 + n)));
          node.setAttribute('cy', round(242 - age * 120));
          node.setAttribute('r', round(1.5 + 3 * age / life));
        }
        const lastSteam = Math.floor((s - sample.boilsAt) / .28);
        for (let n = Math.max(0, lastSteam - 8); n <= lastSteam; n += 1) {
          const age = s - (sample.boilsAt + n * .28);
          if (age < 0 || age >= 2.2) continue;
          const node = sample.steam[n % sample.steam.length];
          const k = age / 2.2;
          node.setAttribute('cx', round(sample.cx - 30 + hash(n, sample.key + 7) * 50 + 6 * Math.sin(age * 2 + n)));
          node.setAttribute('cy', round(level - 4 - 118 * easeOut(k)));
          node.setAttribute('r', round(5 + 12 * k));
          node.setAttribute('opacity', round(.32 * (1 - k) * Math.min(1, age / .3)));
        }
      }
      moving.setAttribute('opacity', round(opacity));
      element.querySelector('[data-eb-thermo]').setAttribute('opacity', round(opacity));
      const boilingNow = samples.filter(sample => s >= sample.boilsAt).length;
      element.dataset.scenePhase = boilingNow === 2 ? 'ambos-a-100' : boilingNow ? 'hirviendo' : 'calentando';
    }

    return { render, duration, still: 9.4 };
  }

  /* ---------- Reactividad con ácidos: el metal burbujea y se gasta ---------- */
  function createAcid(element) {
    const moving = element.querySelector('[data-ac-moving]');
    const metal = element.querySelector('[data-ac-metal]');
    const label = element.querySelector('[data-ac-label]');
    const ripple = element.querySelector('[data-ac-ripple]');
    const bubbles = Array.from({ length: 26 }, () => make('circle', { class: 'property-scene__gas', r: 0 }, element.querySelector('[data-ac-bubbles]')));
    const duration = 11.2;
    const sizeAt = s => 1 - smooth((s - 2.3) / 6.8);
    const heightAt = s => s < .5 ? 26
      : s < 1.05 ? mix(26, 118, easeIn((s - .5) / .55))
      : s < 2 ? mix(118, 238, easeOut((s - 1.05) / .95)) : 238;

    function render(t) {
      const { s, opacity } = cycle(t, 9.9, 10.4, 11.1);
      const size = sizeAt(s);
      const y = heightAt(s);
      const bubbling = s > 2.2 && size > .01;
      const dx = bubbling ? .6 * Math.sin(s * 40) : 0;
      const dy = bubbling ? .4 * Math.sin(s * 33) : 0;
      const turn = mix(-20, 8, smooth((s - .5) / 1.5));
      metal.setAttribute('transform', `translate(${round(300 + dx)} ${round(y + dy)}) rotate(${round(turn)}) scale(${round(Math.max(size, .001))})`);
      label.setAttribute('opacity', round(1 - smooth((s - .3) / .5)));

      const splash = s - 1.05;
      if (splash >= 0 && splash < .7) {
        ripple.setAttribute('rx', round(10 + 50 * splash / .7));
        ripple.setAttribute('ry', round((10 + 50 * splash / .7) * .18));
        ripple.setAttribute('opacity', round(.8 * (1 - splash / .7)));
      } else {
        ripple.setAttribute('opacity', 0);
      }

      bubbles.forEach(node => node.setAttribute('r', 0));
      const latest = Math.floor((Math.min(s, 9.1) - 2.2) / .07);
      for (let n = Math.max(0, latest - 25); n <= latest; n += 1) {
        const born = 2.2 + n * .07;
        const age = s - born;
        const strength = sizeAt(born);
        if (age < 0 || hash(n, 3) > strength * 1.05) continue;
        const speed = 75 + hash(n, 5) * 30;
        const startY = 238 + (hash(n, 9) - .5) * 12 * strength;
        const life = (startY - 120) / speed;
        if (age >= life) continue;
        const node = bubbles[n % bubbles.length];
        node.setAttribute('cx', round(300 + (hash(n, 11) - .5) * 30 * strength + 1.5 * Math.sin(age * 9 + n)));
        node.setAttribute('cy', round(startY - speed * age));
        node.setAttribute('r', round(1.6 + 2.6 * Math.min(1, age / life * 1.4)));
      }
      moving.setAttribute('opacity', round(opacity));
      element.dataset.scenePhase = s < 2.2 ? 'cayendo' : size > .01 ? 'burbujeando' : 'disuelto';
    }

    return { render, duration, still: 5 };
  }

  /* ---------- Reloj compartido ---------- */
  const factories = {
    maleabilidad: createMaleability,
    ductilidad: createDuctility,
    oxidacion: createOxidation,
    inflamabilidad: createFlammability,
    fusion: createMelting,
    ebullicion: createBoiling,
    acido: createAcid
  };
  const scenes = elements
    .filter(element => factories[element.dataset.propertyScene])
    .map(element => ({ element, ...factories[element.dataset.propertyScene](element), elapsed: 0, visible: false }));

  let frame = 0;
  let previousTimestamp = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTimestamp = 0;
  }

  function tick(timestamp) {
    frame = 0;
    if (document.hidden || reducedMotion.matches) return;
    const delta = previousTimestamp ? Math.min((timestamp - previousTimestamp) / 1000, .05) : 0;
    previousTimestamp = timestamp;
    for (const scene of scenes) {
      if (!scene.visible) continue;
      scene.elapsed = (scene.elapsed + delta) % scene.duration;
      scene.render(scene.elapsed);
    }
    schedule();
  }

  function schedule() {
    if (frame || document.hidden || reducedMotion.matches) return;
    if (!scenes.some(scene => scene.visible)) {
      previousTimestamp = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function updateMotionPreference() {
    stop();
    for (const scene of scenes) {
      scene.elapsed = 0;
      if (reducedMotion.matches) {
        scene.element.dataset.sceneStill = '';
        scene.render(scene.still);
      } else {
        delete scene.element.dataset.sceneStill;
        scene.render(0);
      }
    }
    schedule();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const scene = scenes.find(candidate => candidate.element === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      }
      if (!scenes.some(scene => scene.visible)) stop();
      schedule();
    }, { threshold: .15 });
    scenes.forEach(scene => observer.observe(scene.element));
  } else {
    scenes.forEach(scene => { scene.visible = true; });
  }

  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateMotionPreference);
  else reducedMotion.addListener(updateMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else schedule();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  updateMotionPreference();
})();
