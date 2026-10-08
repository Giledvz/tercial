/* Escenas de Química ECOEMS: estados de agregación, fusión del hielo,
   reacción química, disolución, clasificación de la materia y viñetas de los
   cambios de estado.
   Cada escena es un objeto { update(dt), still() }. update avanza la escena
   dt segundos y la dibuja; still dibuja un fotograma fijo que resume el
   proceso (movimiento reducido). El reloj compartido sólo avanza las escenas
   visibles y se detiene con la pestaña oculta.
   Los átomos y moléculas no llevan contorno: el SVG base hereda
   stroke: currentColor y aquí se anula en cada figura. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
  const round = value => Math.round(value * 100) / 100;

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

  function make(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Choques entre discos. restitution = 1 es elástico (gas); valores bajos
     dejan a las partículas en contacto (líquido). fixed marca discos que no
     se mueven (sólido, cristal, moléculas que se están congelando). */
  function collide(particles, restitution) {
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || (a.fixed && b.fixed)) continue;
        const d = Math.sqrt(d2) || .01;
        const nx = dx / d, ny = dy / d;
        const overlap = min - d;
        const wa = a.fixed ? 0 : b.fixed ? 1 : .5;
        const wb = 1 - wa;
        a.x -= nx * overlap * wa; a.y -= ny * overlap * wa;
        b.x += nx * overlap * wb; b.y += ny * overlap * wb;
        const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (approach < 0) {
          const impulse = -(1 + restitution) * approach;
          a.vx -= nx * impulse * wa; a.vy -= ny * impulse * wa;
          b.vx += nx * impulse * wb; b.vy += ny * impulse * wb;
        }
      }
    }
  }

  function walls(p, box, restitution) {
    if (p.x < box.left + p.r) { p.x = box.left + p.r; p.vx = Math.abs(p.vx) * restitution; }
    if (p.x > box.right - p.r) { p.x = box.right - p.r; p.vx = -Math.abs(p.vx) * restitution; }
    if (p.y < box.top + p.r) { p.y = box.top + p.r; p.vy = Math.abs(p.vy) * restitution; }
    if (p.y > box.bottom - p.r) { p.y = box.bottom - p.r; p.vy = -Math.abs(p.vy) * restitution; }
  }

  /* Líquido: gravedad, agitación térmica, choques casi inelásticos y una
     atracción corta que mantiene unidas a las partículas vecinas. */
  function liquidStep(particles, box, h, rand, options) {
    const { gravity = 900, agitation = 2600, cohesion = 1400, damping = 1.6 } = options || {};
    for (const p of particles) {
      if (p.fixed) continue;
      p.vx += (rand() - .5) * 2 * agitation * h;
      p.vy += ((rand() - .5) * 2 * agitation + gravity) * h;
      p.vx *= 1 - damping * h; p.vy *= 1 - damping * h;
    }
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i], b = particles[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const contact = a.r + b.r;
        if (d <= contact || d > contact * 1.3) continue;
        const pull = cohesion * h * (1 - (d - contact) / (contact * .3));
        const nx = dx / d, ny = dy / d;
        if (!a.fixed) { a.vx += nx * pull; a.vy += ny * pull; }
        if (!b.fixed) { b.vx -= nx * pull; b.vy -= ny * pull; }
      }
    }
    for (const p of particles) {
      if (p.fixed) continue;
      p.x += p.vx * h; p.y += p.vy * h;
    }
    collide(particles, .15);
    for (const p of particles) if (!p.fixed) walls(p, box, .2);
  }

  function gasStep(particles, box, h) {
    for (const p of particles) { p.x += p.vx * h; p.y += p.vy * h; }
    collide(particles, 1);
    for (const p of particles) walls(p, box, 1);
  }

  /* Rastro del átomo señalado: guarda posiciones con su tiempo. */
  function trail(path, seconds) {
    const points = [];
    let clock = 0;
    return {
      push(x, y, dt) {
        clock += dt;
        points.push([clock, x, y]);
        while (points.length && clock - points[0][0] > seconds) points.shift();
      },
      draw() {
        path.setAttribute('d', points.length > 1
          ? 'M' + points.map(([, x, y]) => `${round(x)} ${round(y)}`).join('L')
          : '');
      }
    };
  }

  /* ---------------- 1 · Estados de agregación ----------------
     Un frasco por estado, con las mismas 24 partículas. La partícula
     marcada deja un rastro: vibra en su sitio, se desliza o cruza el frasco. */
  function estado(svg) {
    const kind = svg.dataset.tipo;
    const R = 6, cols = 4, rows = 6, N = cols * rows;
    const cx = 100, top = 46, bottom = 211, half = 42;
    const box = { left: cx - half, right: cx + half, top, bottom };
    const tracked = 9;
    const layer = svg.querySelector('[data-capa="particulas"]');
    const trailPath = make('path', { class: 'escena__rastro' }, layer);
    const circles = Array.from({ length: N }, (_, i) => make('circle', {
      r: R, class: i === tracked ? 'escena__marcada' : 'escena__particula'
    }, layer));
    layer.appendChild(circles[tracked]);

    let particles, advance, seconds;
    if (kind === 'solido') {
      // Sólido: cada partícula vibra alrededor de su sitio en la red.
      const rand = random(11);
      particles = Array.from({ length: N }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        return {
          sx: cx - (cols - 1) * 6.5 + c * 13, sy: bottom - R - r * 13,
          f1: 5 + rand() * 3, f2: 7 + rand() * 4,
          p1: rand() * 6.28, p2: rand() * 6.28, p3: rand() * 6.28, p4: rand() * 6.28,
          x: 0, y: 0
        };
      });
      let time = 0;
      advance = dt => {
        time += dt;
        for (const p of particles) {
          p.x = p.sx + 1.1 * (Math.sin(time * p.f1 + p.p1) + Math.sin(time * p.f2 + p.p2)) / 2;
          p.y = p.sy + 1.1 * (Math.sin(time * p.f1 * 1.1 + p.p3) + Math.sin(time * p.f2 * .9 + p.p4)) / 2;
        }
      };
      seconds = 1.2;
    } else if (kind === 'liquido') {
      const rand = random(23);
      particles = Array.from({ length: N }, (_, i) => ({
        x: cx - half + R + 1 + (i % 6) * 12.4,
        y: bottom - R - Math.floor(i / 6) * 12.4,
        vx: 0, vy: 0, r: R
      }));
      advance = dt => {
        for (let s = 0; s < Math.round(dt * 240); s += 1) {
          liquidStep(particles, box, 1 / 240, rand, { gravity: 380, agitation: 6800, cohesion: 800, damping: 1.3 });
        }
      };
      seconds = 3;
    } else {
      const rand = random(37);
      particles = [];
      while (particles.length < N) {
        const p = { x: cx - half + R + rand() * (2 * half - 2 * R), y: top + R + rand() * (bottom - top - 2 * R), r: R };
        if (particles.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 2 * R + 2)) continue;
        const angle = rand() * Math.PI * 2, speed = 95 + rand() * 50;
        p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
        particles.push(p);
      }
      advance = dt => {
        for (let s = 0; s < Math.round(dt * 240); s += 1) gasStep(particles, box, 1 / 240);
      };
      seconds = 1.4;
    }

    const path = trail(trailPath, seconds);
    function simulate(dt) {
      advance(dt);
      path.push(particles[tracked].x, particles[tracked].y, dt);
    }
    function draw() {
      particles.forEach((p, k) => {
        circles[k].setAttribute('cx', round(p.x));
        circles[k].setAttribute('cy', round(p.y));
      });
      path.draw();
    }
    for (let i = 0; i < 240 * 4; i += 1) simulate(1 / 240);
    draw();
    return {
      update(dt) { simulate(dt); draw(); },
      still() { draw(); }
    };
  }

  /* ---------------- 2 · Fusión y solidificación del agua ---------------- */
  function fusion(svg) {
    const layer = svg.querySelector('[data-capa="moleculas"]');
    const bondLayer = svg.querySelector('[data-capa="puentes"]');
    const column = svg.querySelector('[data-termometro]');
    const reading = svg.querySelector('[data-lectura]');
    const stateLabel = svg.querySelector('[data-proceso]');
    const box = { left: 140, right: 360, top: 70, bottom: 222 };
    const rows = 3, cols = 6, R = 12;
    const rand = random(51);
    const duration = 14;

    const sites = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        sites.push({
          x: box.left + 22 + c * 33 + (r % 2) * 16.5,
          y: box.bottom - 14 - r * 29,
          angle: (r + c) % 2 ? 28 : -28,
          r, c
        });
      }
    }
    const order = sites.map((s, i) => ({ i, score: s.r * 10 + Math.abs(s.c - 2.5 - (s.r % 2) * .5) }))
      .sort((a, b) => b.score - a.score).map(o => o.i);
    const meltAt = [], freezeAt = [];
    order.forEach((index, k) => {
      meltAt[index] = 3.3 + k * (2.6 / sites.length);
      freezeAt[index] = 8.9 + (sites.length - 1 - k) * (2.6 / sites.length);
    });

    const bonds = [];
    sites.forEach((a, i) => sites.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 37) {
        bonds.push({ i, j, line: make('path', { class: 'escena__puente' }, bondLayer) });
      }
    }));

    const tracked = 8;
    const molecules = sites.map((site, i) => {
      const g = make('g', {}, layer);
      if (i === tracked) make('circle', { r: 15.5, class: 'escena__anillo' }, g);
      make('circle', { cx: -8, cy: -6.4, r: 4.6, class: 'escena__hidrogeno' }, g);
      make('circle', { cx: 8, cy: -6.4, r: 4.6, class: 'escena__hidrogeno' }, g);
      make('circle', { r: 8.6, class: 'escena__oxigeno' }, g);
      return {
        g, site, x: site.x, y: site.y, vx: 0, vy: 0, r: R,
        angle: site.angle, spin: 0, fixed: true, state: 'hielo',
        f: 6 + rand() * 3, p: rand() * 6.28, q: rand() * 6.28,
        fromX: 0, fromY: 0, fromAngle: 0, glide: 0
      };
    });

    let t = 0;
    function temperature(time) {
      if (time < 1.5) return -10;
      if (time < 3.3) return mix(-10, 0, smooth((time - 1.5) / 1.8));
      if (time < 6) return 0;
      if (time < 7.6) return mix(0, 16, smooth((time - 6) / 1.6));
      if (time < 8.1) return 16;
      if (time < 8.9) return mix(16, 0, smooth((time - 8.1) / .8));
      if (time < 11.6) return 0;
      if (time < 13) return mix(0, -10, smooth((time - 11.6) / 1.4));
      return -10;
    }

    function stepTo(time, dt) {
      const heat = clamp((temperature(time) + 10) / 10);
      for (const [i, m] of molecules.entries()) {
        if (m.state === 'hielo' && time >= meltAt[i] && time < freezeAt[i] && time < 8) {
          m.state = 'liquido'; m.fixed = false;
          m.vx = (rand() - .5) * 40; m.vy = -10 - rand() * 20; m.spin = (rand() - .5) * 200;
        } else if (m.state === 'liquido' && time >= freezeAt[i]) {
          m.state = 'congelando'; m.fixed = true; m.glide = 0;
          m.fromX = m.x; m.fromY = m.y; m.fromAngle = m.angle;
        }
      }
      const h = 1 / 240;
      for (let s = 0; s < Math.round(dt / h); s += 1) {
        for (const m of molecules) {
          if (m.state === 'hielo') {
            const amp = .7 + 1.9 * heat;
            m.x = m.site.x + amp * Math.sin((time + s * h) * m.f + m.p);
            m.y = m.site.y + amp * Math.sin((time + s * h) * m.f * 1.13 + m.q);
            m.angle = m.site.angle + amp * 2.2 * Math.sin((time + s * h) * m.f * .8 + m.q);
          } else if (m.state === 'congelando') {
            m.glide = Math.min(1, m.glide + h / .7);
            const e = smooth(m.glide);
            m.x = mix(m.fromX, m.site.x, e); m.y = mix(m.fromY, m.site.y, e);
            m.angle = mix(m.fromAngle, m.site.angle, e);
            if (m.glide >= 1) m.state = 'hielo';
          } else {
            m.spin += (rand() - .5) * 3000 * h; m.spin *= 1 - 2 * h;
            m.angle += m.spin * h;
          }
        }
        liquidStep(molecules, box, h, rand, { gravity: 520, agitation: 5600, cohesion: 1000, damping: 1.3 });
      }
    }

    function draw() {
      for (const m of molecules) {
        m.g.setAttribute('transform', `translate(${round(m.x)} ${round(m.y)}) rotate(${round(m.angle)})`);
      }
      for (const b of bonds) {
        const a = molecules[b.i], c = molecules[b.j];
        const both = a.state === 'hielo' && c.state === 'hielo';
        b.line.setAttribute('d', both ? `M${round(a.x)} ${round(a.y)}L${round(c.x)} ${round(c.y)}` : '');
      }
      const temp = temperature(t);
      column.setAttribute('y', round(208 - (temp + 15) * 3.6));
      column.setAttribute('height', round((temp + 15) * 3.6));
      reading.textContent = `${Math.round(temp)} °C`.replace('-', '−');
      const heating = t < 7.6, cooling = t >= 8.1 && t < 13;
      stateLabel.textContent = heating && t >= 1.5 ? 'calentando' : cooling ? 'enfriando' : '';
    }

    draw();
    return {
      update(dt) {
        const next = t + dt;
        if (next >= duration) {
          stepTo(t, duration - t);
          t = next - duration;
        } else {
          stepTo(t, dt);
          t = next;
        }
        draw();
      },
      still() {
        while (t < 4.7) { stepTo(t, 1 / 60); t += 1 / 60; }
        draw();
        stateLabel.textContent = 'fundiéndose';
      }
    };
  }

  /* ---------------- 3 · Reacción química ---------------- */
  function reaccion(svg) {
    const atoms = {};
    svg.querySelectorAll('[data-atomo]').forEach(node => { atoms[node.dataset.atomo] = node; });
    const bonds = {};
    svg.querySelectorAll('[data-enlace]').forEach(node => { bonds[node.dataset.enlace] = node; });
    const group = svg.querySelector('[data-capa="reaccion"]');
    const before = svg.querySelector('[data-lado="reactivos"]');
    const after = svg.querySelector('[data-lado="productos"]');
    const duration = 8;
    const polar = (x, y, angle, d) => [x + Math.cos(angle * Math.PI / 180) * d, y + Math.sin(angle * Math.PI / 180) * d];

    function layout(t) {
      // Acercamiento de las dos moléculas.
      const a = smooth(t / 1.7);
      const cl = [mix(128, 232, a), 98];
      const hA = [cl[0] + 40, 98];             // H unido al Cl
      const o = [mix(468, 316, a), 98];
      const na = [o[0], o[1] + 36];
      let hB = polar(o[0], o[1], -40, 26);    // H propio del OH
      let hMoving = hA;
      let naPos = na, clPos = cl, oPos = o;

      // Transferencia: el H deja al Cl y se une al O.
      const b = smooth((t - 1.9) / .7);
      if (t >= 1.9) {
        hMoving = [mix(hA[0], polar(o[0], o[1], -144.5, 26)[0], b), mix(hA[1], polar(o[0], o[1], -144.5, 26)[1], b)];
      }
      // Separación: el agua sube y el Na se une al Cl.
      const c = smooth((t - 2.7) / 1.2);
      if (t >= 2.7) {
        const dx = 58 * c, dy = -22 * c;
        oPos = [o[0] + dx, o[1] + dy];
        hB = polar(oPos[0], oPos[1], -40, 26);
        hMoving = polar(oPos[0], oPos[1], -144.5, 26);
        clPos = [mix(cl[0], 222, c), mix(cl[1], 136, c)];
        naPos = [mix(na[0], 262, c), mix(na[1], 136, c)];
      }
      return {
        positions: { Cl: clPos, H1: hMoving, O: oPos, Na: naPos, H2: hB },
        breakHCl: clamp((t - 1.9) / .35), breakNaO: clamp((t - 2.05) / .35),
        formOH: clamp((t - 2.35) / .35), formNaCl: clamp((t - 3.6) / .35)
      };
    }

    function stick(node, p, q, rp, rq, visible) {
      if (visible <= 0) { node.setAttribute('d', ''); return; }
      const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      const start = [p[0] + ux * (rp - 2), p[1] + uy * (rp - 2)];
      const length = Math.max(0, d - rp - rq + 4) * visible;
      node.setAttribute('d', `M${round(start[0])} ${round(start[1])}l${round(ux * length)} ${round(uy * length)}`);
    }

    const radius = { Cl: 17, Na: 15, O: 12, H1: 7, H2: 7 };
    function render(t) {
      const s = layout(t >= 6.9 ? 0 : t);   // tras desvanecerse, vuelven los reactivos
      const p = s.positions;
      for (const key of Object.keys(p)) atoms[key].setAttribute('transform', `translate(${round(p[key][0])} ${round(p[key][1])})`);
      stick(bonds.HCl, p.Cl, p.H1, radius.Cl, radius.H1, 1 - s.breakHCl);
      stick(bonds.NaO, p.Na, p.O, radius.Na, radius.O, 1 - s.breakNaO);
      stick(bonds.OH, p.O, p.H2, radius.O, radius.H2, 1);
      stick(bonds.OHnuevo, p.O, p.H1, radius.O, radius.H1, s.formOH);
      stick(bonds.NaCl, p.Na, p.Cl, radius.Na, radius.Cl, s.formNaCl);
      let opacity = 1;
      if (t >= 6.4 && t < 6.9) opacity = 1 - smooth((t - 6.4) / .5);
      else if (t >= 6.9 && t < 7.2) opacity = 0;
      else if (t >= 7.2) opacity = smooth((t - 7.2) / .5);
      group.setAttribute('opacity', round(opacity));
      const done = t >= 3.6 && t < 6.9;
      before.classList.toggle('es-activo', !done);
      after.classList.toggle('es-activo', done);
    }
    let t = 0;
    render(0);
    return {
      update(dt) { t = (t + dt) % duration; render(t); },
      still() { render(4.5); }
    };
  }

  /* ---------------- 4 · Disolución ---------------- */
  function disolucion(svg) {
    const layer = svg.querySelector('[data-capa="particulas"]');
    const cube = svg.querySelector('[data-cubo]');
    const solutes = svg.querySelector('[data-capa="soluto"]');
    const center = { x: 410, y: 150 }, radius = 122, floor = 228;
    const rand = random(73);
    const duration = 13;

    const waters = [];
    while (waters.length < 34) {
      const angle = rand() * Math.PI * 2, d = Math.sqrt(rand()) * (radius - 8);
      const p = { x: center.x + Math.cos(angle) * d, y: center.y + Math.sin(angle) * d, r: 7, vx: 0, vy: 0, angle: rand() * 360, spin: 0 };
      if (p.y > floor - 50 && Math.abs(p.x - center.x) < 50) continue;
      if (p.y > floor - 8) continue;
      if (waters.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 16)) continue;
      const g = make('g', {}, layer);
      make('circle', { cx: -5.4, cy: -4, r: 2.8, class: 'escena__hidrogeno' }, g);
      make('circle', { cx: 5.4, cy: -4, r: 2.8, class: 'escena__hidrogeno' }, g);
      make('circle', { r: 5.2, class: 'escena__disolvente' }, g);
      p.g = g;
      waters.push(p);
    }

    const crystal = [];
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const node = make('circle', { r: 8.6, class: 'escena__soluto' }, solutes);
        crystal.push({ node, sx: center.x - 27.75 + c * 18.5, sy: floor - 9.5 - r * 18.5, r: 9, row: r, col: c, x: 0, y: 0, vx: 0, vy: 0, free: false, at: 0 });
      }
    }

    function reset() {
      for (const p of crystal) { p.free = false; p.x = p.sx; p.y = p.sy; p.vx = 0; p.vy = 0; p.fixed = true; }
      const left = crystal.slice();
      const neighbours = p => left.filter(q => q !== p && Math.abs(q.row - p.row) + Math.abs(q.col - p.col) === 1).length;
      let k = 0;
      while (left.length) {
        left.sort((a, b) => neighbours(a) - neighbours(b) || b.row - a.row || Math.abs(a.col - 1.5) - Math.abs(b.col - 1.5));
        const next = left.shift();
        next.at = 1 + k * .42;
        k += 1;
      }
    }
    reset();

    function inside(p) {
      const dx = p.x - center.x, dy = p.y - center.y, d = Math.hypot(dx, dy), max = radius - p.r - 2;
      if (d > max) {
        const nx = dx / d, ny = dy / d;
        p.x = center.x + nx * max; p.y = center.y + ny * max;
        const vn = p.vx * nx + p.vy * ny;
        if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
      }
      if (p.y > floor - p.r) { p.y = floor - p.r; p.vy = -Math.abs(p.vy); }
    }

    let t = 0;
    function step(dt) {
      const h = 1 / 120;
      for (let s = 0; s < Math.round(dt / h); s += 1) {
        const now = t + s * h;
        for (const p of crystal) {
          if (!p.free && now >= p.at && now < 11) {
            p.free = true; p.fixed = false;
            p.vx = (p.col - 1.5) * 18 + (rand() - .5) * 30; p.vy = -40 - rand() * 30;
          }
        }
        const free = crystal.filter(p => p.free);
        for (const p of free) {
          p.vx += (rand() - .5) * 900 * h; p.vy += (rand() - .5) * 900 * h;
          for (const q of free) {
            if (q === p) continue;
            const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1;
            if (d < 70) { p.vx += dx / d * 260 * h * (1 - d / 70); p.vy += dy / d * 260 * h * (1 - d / 70); }
          }
          p.vx *= 1 - 1.2 * h; p.vy *= 1 - 1.2 * h;
          p.x += p.vx * h; p.y += p.vy * h;
          inside(p);
        }
        for (const w of waters) {
          w.vx += (rand() - .5) * 2600 * h; w.vy += (rand() - .5) * 2600 * h;
          w.vx *= 1 - 3 * h; w.vy *= 1 - 3 * h;
          w.spin += (rand() - .5) * 4000 * h; w.spin *= 1 - 3 * h;
          w.x += w.vx * h; w.y += w.vy * h; w.angle += w.spin * h;
          inside(w);
        }
        collide(waters.concat(crystal), .6);
      }
    }

    function draw() {
      for (const w of waters) w.g.setAttribute('transform', `translate(${round(w.x)} ${round(w.y)}) rotate(${round(w.angle)})`);
      let left = 0;
      for (const p of crystal) {
        p.node.setAttribute('cx', round(p.x)); p.node.setAttribute('cy', round(p.y));
        if (!p.free) left += 1;
      }
      const side = 30 * Math.sqrt(left / crystal.length);
      cube.setAttribute('x', round(110 - side / 2)); cube.setAttribute('y', round(250 - side));
      cube.setAttribute('width', round(side)); cube.setAttribute('height', round(side));
      let opacity = 1;
      if (t >= 11 && t < 11.6) opacity = 1 - smooth((t - 11) / .6);
      else if (t >= 11.6 && t < 12.2) opacity = 0;
      else if (t >= 12.2) opacity = smooth((t - 12.2) / .6);
      solutes.setAttribute('opacity', round(opacity));
    }

    for (let i = 0; i < 120; i += 1) step(1 / 120);
    t = 0;
    draw();
    return {
      update(dt) {
        step(dt);
        t += dt;
        if (t >= 11.9 && t - dt < 11.9) reset();
        if (t >= duration) t -= duration;
        draw();
      },
      still() {
        while (t < 5) { step(1 / 60); t += 1 / 60; }
        draw();
      }
    };
  }

  /* ---------------- 5 · Elemento, compuesto y mezclas ---------------- */
  function clasificacion(svg) {
    const kind = svg.dataset.tipo;
    const layer = svg.querySelector('[data-capa="particulas"]');
    const rand = random({ elemento: 3, compuesto: 5, homogenea: 7, heterogenea: 9 }[kind]);
    const full = { left: 3, right: 147, top: 3, bottom: 97 };
    const bodies = [];

    function add(x, y, r, parts, box) {
      const g = make('g', {}, layer);
      parts.forEach(([dx, dy, pr, cls]) => make('circle', { cx: dx, cy: dy, r: pr, class: cls }, g));
      const angle = rand() * Math.PI * 2, speed = 16 + rand() * 10;
      bodies.push({ g, x, y, r, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, angle: rand() * 360, spin: (rand() - .5) * 50, box, rotates: parts.length > 1 });
    }
    const A = (r = 7.5) => [[0, 0, r, 'escena__especie-a']];
    const B = (r = 6) => [[0, 0, r, 'escena__especie-b']];
    const place = (count, box, r, parts) => {
      let tries = 0;
      while (count > 0 && tries < 999) {
        tries += 1;
        const x = box.left + r + rand() * (box.right - box.left - 2 * r);
        const y = box.top + r + rand() * (box.bottom - box.top - 2 * r);
        if (bodies.some(b => Math.hypot(b.x - x, b.y - y) < b.r + r + 3)) continue;
        add(x, y, r, parts(), box);
        count -= 1;
      }
    };

    if (kind === 'elemento') place(7, full, 7.5, () => A());
    if (kind === 'compuesto') place(4, full, 15, () => [[-5.5, 0, 7.5, 'escena__especie-a'], [6.5, 0, 5.8, 'escena__especie-b']]);
    if (kind === 'homogenea') { place(4, full, 7.5, () => A()); place(4, full, 6, () => B()); }
    if (kind === 'heterogenea') {
      place(5, { left: 3, right: 147, top: 3, bottom: 54 }, 7.5, () => A());
      place(6, { left: 3, right: 147, top: 60, bottom: 97 }, 6, () => B());
    }

    function draw() {
      for (const b of bodies) {
        b.g.setAttribute('transform', `translate(${round(b.x)} ${round(b.y)})${b.rotates ? ` rotate(${round(b.angle)})` : ''}`);
      }
    }
    draw();
    return {
      update(dt) {
        const h = 1 / 120;
        for (let s = 0; s < Math.round(dt / h); s += 1) {
          for (const b of bodies) { b.x += b.vx * h; b.y += b.vy * h; b.angle += b.spin * h; }
          collide(bodies, 1);
          for (const b of bodies) walls(b, b.box, 1);
        }
        draw();
      },
      still() { draw(); }
    };
  }


  /* ---------------- 6 · Cambios de estado: viñetas de ejemplo ----------------
     Cada viñeta ilustra la frase de su ejemplo con objetos cotidianos. Son
     líneas de tiempo: al terminar, lo que cambió se desvanece y la escena
     vuelve a empezar. La flama es el único terracota: es calor. */
  const easeIn = value => { const p = clamp(value); return p * p * p; };
  const easeOut = value => { const p = 1 - clamp(value); return 1 - p * p * p; };
  const hash = (n, salt) => random(n * 7919 + salt * 104729)();

  function cycle(t, outStart, resetAt, inEnd) {
    if (t < outStart) return { s: t, opacity: 1 };
    if (t < resetAt) return { s: t, opacity: 1 - smooth((t - outStart) / (resetAt - outStart)) };
    return { s: 0, opacity: smooth((t - resetAt) / (inEnd - resetAt)) };
  }

  function setRect(node, x, y, width, height, rx) {
    node.setAttribute('x', round(x));
    node.setAttribute('y', round(y));
    node.setAttribute('width', round(Math.max(0, width)));
    node.setAttribute('height', round(Math.max(0, height)));
    node.setAttribute('rx', round(Math.max(0, rx)));
  }

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

  // Cubo de hielo en tres cuartos que se redondea y se aplana al derretirse.
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
        return null;
      }
      const flat = 1 - .6 * melted;
      const dx = s * .3 * flat, dy = s * .22 * flat;
      const x0 = cx - (s + dx) / 2, y0 = base - s;
      const rx = Math.min(s / 2, 1.2 + .16 * size * melted);
      const faces = round(1 - .75 * melted);
      setRect(front, x0, y0, s, s, rx);
      top.setAttribute('d', `M${round(x0 + rx * .6)} ${round(y0)}L${round(x0 + dx + rx * .6)} ${round(y0 - dy)}H${round(x0 + s + dx - rx * .3)}L${round(x0 + s)} ${round(y0)}Z`);
      side.setAttribute('d', `M${round(x0 + s)} ${round(y0)}L${round(x0 + s + dx)} ${round(y0 - dy)}V${round(base - dy - rx * .5)}L${round(x0 + s)} ${round(base)}Z`);
      top.setAttribute('opacity', faces);
      side.setAttribute('opacity', faces);
      core.setAttribute('d', cloud(x0 + s * .5, y0 + s * .52, s * .27, s * .24));
      core.setAttribute('opacity', round(.8 * (1 - .5 * melted)));
      bubbles.forEach((node, i) => {
        const [bx, by, br] = bubbleAt[i];
        node.setAttribute('cx', round(x0 + s * bx));
        node.setAttribute('cy', round(y0 + s * by));
        node.setAttribute('r', round(s > 8 ? s * br : 0));
      });
      edge.setAttribute('d', `M${round(x0 + rx)} ${round(y0 + .8)}H${round(x0 + s - rx * .4)}M${round(x0 + .8)} ${round(y0 + rx)}V${round(y0 + s * .72)}`);
      edge.setAttribute('opacity', round(1 - melted));
      return { x0, s };
    };
  }

  const vignettes = {
    // Fusión: el cubo se encoge, se redondea, gotea y forma un charco.
    fusion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const drawIce = iceCube(svg.querySelector('[data-hielo]'));
      const puddle = svg.querySelector('[data-charco]');
      const drops = Array.from({ length: 3 }, () => make('circle', { class: 'escena__gota', r: 0 }, svg.querySelector('[data-gotas]')));
      const base = 132, size = 58, cx = 120;
      function render(t) {
        const { s, opacity } = cycle(t, 7, 7.5, 8.2);
        const melted = smooth((s - .5) / 5.8);
        const cube = drawIce(cx, base, size, melted);
        puddle.setAttribute('rx', round(melted > 0 ? 8 + 62 * Math.sqrt(melted) : 0));
        puddle.setAttribute('ry', round(melted > 0 ? 1.4 + 3.4 * Math.sqrt(melted) : 0));
        drops.forEach((drop, i) => {
          const phase = (s * .7 + i / 3) % 1;
          if (!cube) { drop.setAttribute('r', 0); return; }
          drop.setAttribute('cx', round(cube.x0 + cube.s * [.22, .62, .86][i]));
          drop.setAttribute('cy', round(base - cube.s + cube.s * (.25 + .72 * easeIn(phase))));
          drop.setAttribute('r', melted > .05 && melted < .9 ? 1.7 : 0);
        });
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.2, still: 3.4 };
    },

    // Solidificación: la vela se apaga; la cera líquida deja de brillar y se detiene.
    solidificacion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const flameGroup = svg.querySelector('[data-c-flama]');
      const flame = svg.querySelector('[data-flama]');
      const liquid = svg.querySelector('[data-liquida]');
      const glint = svg.querySelector('[data-brillo-cera]');
      const solidDrips = [...svg.querySelectorAll('[data-gota-solida]')];
      const liquidDrips = [...svg.querySelectorAll('[data-gota-liquida]')];
      const dripShines = [...svg.querySelectorAll('[data-brillo-gota]')];
      const smoke = Array.from({ length: 6 }, () => make('circle', { class: 'escena__humo', r: 0 }, svg.querySelector('[data-humo]')));
      const drips = [{ x: 106, length: 40, delay: 0 }, { x: 133, length: 22, delay: .35 }];
      const dripPath = (x, y) => `M${x - 2} 64V${round(y)}A3.2 3.2 0 1 0 ${x + 2} ${round(y)}V64Z`;
      function render(t) {
        const { s, opacity } = cycle(t, 7.1, 7.6, 8.3);
        const lit = 1 - smooth((s - .5) / .4);
        const flicker = 1 + .06 * Math.sin(t * 13);
        flame.setAttribute('transform', `translate(120 53) scale(${round(Math.max(lit, .001) * flicker)} ${round(Math.max(lit, .001) * flicker * (1 + .04 * Math.sin(t * 21)))})`);
        flameGroup.setAttribute('opacity', round(opacity));
        drips.forEach((drip, i) => {
          const y = 66 + drip.length * easeOut((s - .6 - drip.delay) / 2.6);
          solidDrips[i].setAttribute('d', dripPath(drip.x, y));
          liquidDrips[i].setAttribute('d', dripPath(drip.x, y));
          dripShines[i].setAttribute('d', y > 70 ? `M${drip.x - .7} 67V${round(y - 1)}` : '');
        });
        const fluid = 1 - smooth((s - 2.8) / 2.6);
        liquid.setAttribute('opacity', round(fluid));
        glint.setAttribute('cx', round(113 + 1.5 * Math.sin(s * 3) * fluid));
        smoke.forEach(node => node.setAttribute('r', 0));
        for (let n = 0; n < 7; n += 1) {
          const age = s - (.8 + n * .3);
          if (age < 0 || age >= 1.6) continue;
          const k = age / 1.6;
          const node = smoke[n % smoke.length];
          node.setAttribute('cx', round(120 + 4 * Math.sin(age * 3 + n)));
          node.setAttribute('cy', round(50 - 30 * easeOut(k)));
          node.setAttribute('r', round(1.5 + 4 * k));
          node.setAttribute('opacity', round(.45 * (1 - k)));
        }
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.3, still: 4.2 };
    },

    // Evaporación: la camiseta gotea, suelta vapor y se aclara al secarse.
    evaporacion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const wet = svg.querySelector('[data-mojada]');
      const patches = [[104, 82, 12, 9], [134, 96, 11, 13], [114, 110, 16, 8], [84, 64, 7, 5], [150, 66, 6, 5]]
        .map(([cx, cy, rx, ry]) => ({ node: make('ellipse', { class: 'escena__tela-mojada', cx, cy }, svg.querySelector('[data-manchas]')), rx, ry }));
      const drips = Array.from({ length: 6 }, () => make('circle', { class: 'escena__gota', r: 0 }, svg.querySelector('[data-goteo]')));
      const vapor = Array.from({ length: 8 }, () => make('circle', { class: 'escena__vapor', r: 0 }, svg.querySelector('[data-vapor]')));
      const wetness = s => 1 - smooth((s - .5) / 6);
      const hems = [100, 128, 112, 140, 120];
      function render(t) {
        const { s, opacity } = cycle(t, 7.4, 7.9, 8.6);
        const w = wetness(s);
        wet.setAttribute('opacity', round(.9 * w));
        const k = Math.pow(w, .6);
        patches.forEach(p => {
          p.node.setAttribute('rx', round(p.rx * k));
          p.node.setAttribute('ry', round(p.ry * k));
          p.node.setAttribute('opacity', round(w));
        });
        drips.forEach(node => node.setAttribute('r', 0));
        for (let n = 0; n < 14; n += 1) {
          const born = n * .32;
          const age = s - born;
          if (age < 0 || age >= .5 || wetness(born) < .35) continue;
          const node = drips[n % drips.length];
          node.setAttribute('cx', hems[n % hems.length]);
          node.setAttribute('cy', round(123 + 17 * easeIn(age / .5)));
          node.setAttribute('r', 1.7);
          node.setAttribute('opacity', round(1 - smooth((age - .38) / .12)));
        }
        vapor.forEach(node => node.setAttribute('r', 0));
        for (let n = 0; n < 22; n += 1) {
          const born = .3 + n * .28;
          const age = s - born;
          if (age < 0 || age >= 1.8) continue;
          const life = age / 1.8;
          const node = vapor[n % vapor.length];
          node.setAttribute('cx', round(96 + hash(n, 2) * 48 + 5 * Math.sin(age * 2 + n)));
          node.setAttribute('cy', round(112 - hash(n, 3) * 44 - 34 * easeOut(life)));
          node.setAttribute('r', round(2.5 + 6 * life));
          node.setAttribute('opacity', round(.6 * wetness(born) * (1 - life) * Math.min(1, age / .3)));
        }
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.6, still: 3.6 };
    },

    // Condensación: el vapor del aire forma gotitas en la pared fría del vaso.
    condensacion(svg) {
      const groups = [svg.querySelector('[data-c-mov]'), svg.querySelector('[data-c-mov2]')];
      const ring = svg.querySelector('[data-anillo]');
      const rand = random(29);
      const wall = (side, y) => side === 0 ? 84 + (y - 36) * 7 / 97 : 156 - (y - 36) * 7 / 97;
      const drops = Array.from({ length: 34 }, (_, i) => {
        const y = 44 + rand() * 82;
        // Un tercio de las gotas queda sobre el contorno: así se leen por fuera del vaso.
        const onEdge = i % 3 === 0;
        const side = i % 2;
        const x = onEdge ? wall(side, y) + (side ? 1 : -1) * rand() * 1.5
          : wall(0, y) + 4 + rand() * (wall(1, y) - wall(0, y) - 8);
        const g = make('g', {}, svg.querySelector('[data-gotitas]'));
        return {
          x, y, r: 1.5 + rand() * 1.9, appear: .4 + rand() * 4.6,
          body: make('ellipse', { class: 'escena__gota', rx: 0, ry: 0 }, g),
          glint: make('circle', { class: 'escena__brillo', r: 0 }, g)
        };
      });
      [...drops].sort((a, b) => b.r - a.r).slice(0, 4).forEach((drop, i) => {
        drop.run = 4.4 + i * .5;
        drop.trail = make('path', { class: 'escena__rastro-gota', 'stroke-width': round(drop.r * .8) }, svg.querySelector('[data-rastros]'));
      });
      const vapor = Array.from({ length: 10 }, () => make('circle', { class: 'escena__vapor', r: 0 }, svg.querySelector('[data-vapor-puntos]')));
      function render(t) {
        const { s, opacity } = cycle(t, 7.6, 8.1, 8.8);
        for (const d of drops) {
          const grow = easeOut((s - d.appear) / .7);
          let y = d.y;
          let r = d.r * grow;
          if (d.run !== undefined) {
            const fall = easeIn((s - d.run) / 1.2);
            y = mix(d.y, 130, fall);
            if (fall >= 1) r = 0;
            d.trail.setAttribute('d', fall > 0 && fall < 1 ? `M${round(d.x)} ${round(d.y)}V${round(y)}` : '');
          }
          d.body.setAttribute('cx', round(d.x));
          d.body.setAttribute('cy', round(y));
          d.body.setAttribute('rx', round(r * .85));
          d.body.setAttribute('ry', round(r * 1.15));
          d.glint.setAttribute('cx', round(d.x - r * .35));
          d.glint.setAttribute('cy', round(y - r * .35));
          d.glint.setAttribute('r', round(r * .3));
        }
        const wetBase = smooth((s - 5.3) / 1.6);
        ring.setAttribute('rx', round(38 * wetBase));
        ring.setAttribute('ry', round(2.8 * wetBase));
        vapor.forEach((node, i) => {
          const period = 1.7;
          const cycleIndex = Math.floor((s + i * .17) / period);
          const k = ((s + i * .17) % period) / period;
          const active = s > .3 && s < 5.6;
          const left = i % 2 === 0;
          const y = 50 + hash(cycleIndex * 10 + i, 4) * 70;
          const startX = left ? 48 + hash(cycleIndex * 10 + i, 5) * 20 : 172 + hash(cycleIndex * 10 + i, 5) * 20;
          const endX = left ? wall(0, y) - 1 : wall(1, y) + 1;
          node.setAttribute('cx', round(mix(startX, endX, easeIn(k))));
          node.setAttribute('cy', round(y));
          node.setAttribute('r', active ? 1.3 : 0);
          node.setAttribute('opacity', round(.6 * Math.sin(Math.PI * k)));
        });
        groups.forEach(g => g.setAttribute('opacity', round(opacity)));
      }
      return { render, duration: 8.8, still: 5.6 };
    },

    // Sublimación: la naftalina en la cuchara, calentada suave sobre el mechero,
    // se encoge y suelta vapor sin pasar por líquido.
    sublimacion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const flame = svg.querySelector('[data-flama-mechero]');
      const balls = [[103.5, 4.6], [111.5, 4.2], [118.6, 3.6]].map(([x, r]) => {
        const g = make('g', {}, svg.querySelector('[data-bolitas]'));
        return {
          x, r,
          shade: make('circle', { class: 'escena__naftalina-sombra', r: 0 }, g),
          light: make('circle', { class: 'escena__naftalina', r: 0 }, g),
          glint: make('circle', { class: 'escena__brillo', r: 0 }, g)
        };
      });
      const vapor = Array.from({ length: 14 }, () => make('circle', { class: 'escena__vapor', r: 0 }, svg.querySelector('[data-vapor]')));
      const floor = 48.4;
      function render(t) {
        const { s, opacity } = cycle(t, 7.2, 7.7, 8.4);
        const flick = 1 + .07 * Math.sin(t * 13.3) + .03 * Math.sin(t * 29);
        flame.setAttribute('transform', `translate(112 94) rotate(${round(2 * Math.sin(t * 6.1))}) scale(${round(1 - .03 * Math.sin(t * 11))} ${round(flick)})`);
        const gone = smooth((s - .6) / 5.8);
        const k = Math.cbrt(Math.max(0, 1 - gone));
        balls.forEach(b => {
          const r = b.r * k;
          const cy = floor - r;
          b.shade.setAttribute('cx', b.x); b.shade.setAttribute('cy', round(cy)); b.shade.setAttribute('r', round(r));
          b.light.setAttribute('cx', round(b.x - r * .12)); b.light.setAttribute('cy', round(cy - r * .12)); b.light.setAttribute('r', round(r * .86));
          b.glint.setAttribute('cx', round(b.x - r * .38)); b.glint.setAttribute('cy', round(cy - r * .42)); b.glint.setAttribute('r', round(r * .2));
        });
        vapor.forEach(node => node.setAttribute('r', 0));
        const latest = Math.floor((Math.min(s, 6.6) - .8) / .16);
        for (let n = Math.max(0, latest - 13); n <= latest; n += 1) {
          const born = .8 + n * .16;
          const age = s - born;
          if (age < 0 || age >= 2.1) continue;
          const life = age / 2.1;
          const source = balls[n % balls.length];
          const strength = Math.cbrt(Math.max(0, 1 - smooth((born - .6) / 5.8)));
          if (strength < .15) continue;
          const node = vapor[n % vapor.length];
          node.setAttribute('cx', round(source.x + 3 * Math.sin(age * 2.6 + n) + 8 * life));
          node.setAttribute('cy', round(floor - 6 - 42 * easeOut(life)));
          node.setAttribute('r', round(2.5 + 7 * life));
          node.setAttribute('opacity', round(.55 * strength * (1 - life) * Math.min(1, age / .25)));
        }
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.4, still: 3.4 };
    },

    // Deposición: la escarcha crece en ramas desde las orillas del vidrio.
    deposicion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const layer = svg.querySelector('[data-escarcha]');
      const rand = random(41);
      const segments = [];
      const toRad = deg => deg * Math.PI / 180;
      function branch(x, y, angle, length, level, birth) {
        const x2 = x + Math.cos(angle) * length, y2 = y + Math.sin(angle) * length;
        const duration = length / 14;
        segments.push({ x, y, x2, y2, birth, duration, level });
        if (level >= 2) return;
        const at = .55;
        const bx = x + (x2 - x) * at, by = y + (y2 - y) * at;
        for (const sign of [-1, 1]) {
          branch(bx, by, angle + sign * toRad(55 + rand() * 15), length * (.42 + rand() * .12), level + 1, birth + duration * at);
        }
      }
      function seed(x, y, angle, birth) {
        let px = x, py = y, a = angle, b = birth;
        for (let i = 0; i < 3; i += 1) {
          const length = 9 + rand() * 4;
          branch(px, py, a, length, 0, b);
          px += Math.cos(a) * length; py += Math.sin(a) * length;
          b += length / 14;
          a += (rand() - .5) * .5;
        }
      }
      [[60, 20], [124, 20], [60, 80], [124, 80]].forEach(([x, y]) => {
        seed(x + 2, y + 50, toRad(-50 + (rand() - .5) * 14), .4 + rand() * 1.6);
        seed(x + 54, y + 50, toRad(-130 + (rand() - .5) * 14), .4 + rand() * 1.6);
        seed(x + 18 + rand() * 20, y + 51, toRad(-90 + (rand() - .5) * 24), 1.2 + rand() * 1.8);
        seed(x + 2, y + 2, toRad(45 + (rand() - .5) * 14), 2 + rand() * 1.8);
      });
      segments.forEach(seg => {
        seg.node = make('line', { class: 'escena__escarcha', x1: round(seg.x), y1: round(seg.y), x2: round(seg.x), y2: round(seg.y), 'stroke-width': [1.4, 1, .7][seg.level] }, layer);
      });
      const vapor = Array.from({ length: 10 }, () => make('circle', { class: 'escena__punto-vapor', r: 0 }, svg.querySelector('[data-vapor-puntos]')));
      function render(t) {
        const { s, opacity } = cycle(t, 7.8, 8.3, 8.8);
        for (const seg of segments) {
          const g = clamp((s - seg.birth) / seg.duration);
          seg.node.setAttribute('x2', round(seg.x + (seg.x2 - seg.x) * g));
          seg.node.setAttribute('y2', round(seg.y + (seg.y2 - seg.y) * g));
          seg.node.setAttribute('opacity', g > 0 ? 1 : 0);
        }
        vapor.forEach((node, i) => {
          const period = 1.6;
          const index = Math.floor((s + i * .16) / period);
          const k = ((s + i * .16) % period) / period;
          const pane = [[60, 20], [124, 20], [60, 80], [124, 80]][i % 4];
          node.setAttribute('cx', round(pane[0] + 6 + hash(index * 10 + i, 7) * 44));
          node.setAttribute('cy', round(pane[1] + 6 + hash(index * 10 + i, 8) * 30 + 8 * k));
          node.setAttribute('r', s > .3 && s < 5.5 ? 1.1 : 0);
          node.setAttribute('opacity', round(.7 * Math.sin(Math.PI * k)));
        });
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.8, still: 6.8 };
    },

    // Licuefacción: el pistón comprime el gas hasta que sus partículas forman un líquido.
    licuefaccion(svg) {
      const moving = svg.querySelector('[data-c-mov]');
      const piston = svg.querySelector('[data-piston]');
      const liquid = svg.querySelector('[data-liquido]');
      const pressure = svg.querySelector('[data-presion]');
      const rand = random(53);
      const tri = x => { const m = ((x % 2) + 2) % 2; return m < 1 ? m : 2 - m; };
      const particles = Array.from({ length: 24 }, (_, i) => ({
        node: make('circle', { class: 'escena__particula', r: 3.4 }, svg.querySelector('[data-particulas]')),
        u: rand() * 2, v: rand() * 2,
        du: (.25 + rand() * .3) * (rand() < .5 ? -1 : 1), dv: (.3 + rand() * .3) * (rand() < .5 ? -1 : 1),
        tx: 91.4 + (i % 8) * 7.6, ty: 128.6 - Math.floor(i / 8) * 7.2, phase: rand() * 6.28
      }));
      function render(t) {
        const { s, opacity } = cycle(t, 7, 7.5, 8.2);
        const press = smooth((s - 1) / 3.6);
        const py = mix(30, 100, press);
        const condense = smooth((s - 3.8) / 1.5);
        const top = py + 8 + 3.4, bottom = 128.6;
        piston.setAttribute('transform', `translate(0 ${round(py)})`);
        for (const p of particles) {
          const gx = 91.4 + tri(p.u + p.du * s) * 53.2;
          const gy = top + tri(p.v + p.dv * s) * Math.max(0, bottom - top);
          p.node.setAttribute('cx', round(mix(gx, p.tx + .5 * Math.sin(s * 9 + p.phase), condense)));
          p.node.setAttribute('cy', round(mix(gy, p.ty + .4 * Math.sin(s * 7 + p.phase), condense)));
        }
        liquid.setAttribute('opacity', round(.9 * condense));
        pressure.setAttribute('opacity', round(opacity * smooth((s - .8) / .4) * (1 - smooth((s - 4.8) / .5))));
        moving.setAttribute('opacity', round(opacity));
      }
      return { render, duration: 8.2, still: 4.6 };
    }
  };

  function cambio(svg) {
    const vignette = vignettes[svg.dataset.tipo](svg);
    let t = 0;
    vignette.render(0);
    return {
      update(dt) { t = (t + dt) % vignette.duration; vignette.render(t); },
      still() { vignette.render(vignette.still); }
    };
  }

  /* ---------------- Reloj compartido ---------------- */
  const factories = { estado, fusion, reaccion, disolucion, clasificacion, cambio };
  const scenes = [...document.querySelectorAll('[data-escena]')].map(svg => ({
    svg, visible: false, ...factories[svg.dataset.escena](svg)
  }));
  let frame = 0, previous = 0;

  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  function tick(timestamp) {
    frame = 0;
    if (document.hidden || reducedMotion.matches) return;
    const dt = previous ? Math.min((timestamp - previous) / 1000, 1 / 20) : 0;
    previous = timestamp;
    const steps = Math.round(dt * 240) / 240;
    if (steps > 0) for (const scene of scenes) if (scene.visible) scene.update(steps);
    schedule();
  }
  function schedule() {
    if (frame || document.hidden || reducedMotion.matches) return;
    if (!scenes.some(scene => scene.visible)) { previous = 0; return; }
    frame = requestAnimationFrame(tick);
  }
  function applyPreference() {
    stop();
    for (const scene of scenes) {
      scene.svg.toggleAttribute('data-quieta', reducedMotion.matches);
      if (reducedMotion.matches) scene.still();
    }
    schedule();
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const scene = scenes.find(candidate => candidate.svg === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      }
      if (!scenes.some(scene => scene.visible)) stop();
      schedule();
    }, { threshold: .1 });
    scenes.forEach(scene => observer.observe(scene.svg));
  } else {
    scenes.forEach(scene => { scene.visible = true; });
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', applyPreference);
  else reducedMotion.addListener(applyPreference);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  applyPreference();
})();
