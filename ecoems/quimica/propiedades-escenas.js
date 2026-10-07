/* Representaciones esquemáticas de maleabilidad y ductilidad. */
(() => {
  const elements = [...document.querySelectorAll('[data-property-scene]')];
  if (!elements.length) return;

  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
  };
  const mix = (start, end, progress) => start + (end - start) * progress;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 6.8;
  let frame = 0;
  let previousTimestamp = 0;

  function cycle(elapsed) {
    const time = elapsed % duration;
    if (time < 5.8) return { time, opacity: 1 };
    if (time < 6.25) return { time: 4.9, opacity: 1 - ease((time - 5.8) / .45) };
    return { time: 0, opacity: ease((time - 6.25) / .55) };
  }

  function createMaleability(element) {
    const metal = element.querySelector('[data-scene-metal]');
    const hammer = element.querySelector('[data-scene-hammer]');
    const moving = element.querySelector('[data-scene-moving]');
    const starts = [.8, 1.95, 3.1];
    const scales = [1, 1.45, 1.98, 2.6];

    return elapsed => {
      const { time, opacity } = cycle(elapsed);
      let scale = 1;
      let lift = 54;
      for (let index = 0; index < starts.length; index += 1) {
        const relative = time - starts[index];
        if (relative < 0) break;
        scale = mix(scales[index], scales[index + 1], ease((relative - .28) / .12));
        if (relative < .28) {
          lift = 54 * (1 - Math.pow(clamp(relative / .28), 2));
        } else if (relative < .4) {
          lift = 0;
        } else {
          lift = 54 * ease((relative - .4) / .5);
        }
      }
      const surface = 230 - 65 / scale;
      metal.setAttribute('transform', `scale(${scale} ${1 / scale})`);
      hammer.setAttribute('transform', `translate(280 ${surface - lift})`);
      moving.setAttribute('opacity', opacity);
      element.dataset.scenePhase = scale > 2.59 ? 'lamina' : lift < .1 ? 'golpe' : 'metal';
    };
  }

  function createDuctility(element) {
    const feed = element.querySelector('[data-scene-feed]');
    const shine = element.querySelector('[data-scene-feed-shine]');
    const wire = element.querySelector('[data-scene-wire]');
    const grip = element.querySelector('[data-scene-grip]');
    const moving = element.querySelector('[data-scene-moving]');

    return elapsed => {
      const { time, opacity } = cycle(elapsed);
      const progress = ease((time - .8) / 2.8);
      const pulled = 154 * progress;
      const feedStart = 78 + pulled * 6 / 30;
      const end = 318 + pulled;
      feed.setAttribute('x', feedStart);
      feed.setAttribute('width', 232 - feedStart);
      shine.setAttribute('d', `M${feedStart + 10} 125H230`);
      wire.setAttribute('d', `M290 133H${end + 6}`);
      grip.setAttribute('transform', `translate(${end} 133)`);
      moving.setAttribute('opacity', opacity);
      element.dataset.scenePhase = progress > .999 ? 'alambre' : progress > 0 ? 'estirando' : 'metal';
    };
  }

  const scenes = elements.map(element => ({
    element,
    elapsed: 0,
    visible: false,
    render: element.dataset.propertyScene === 'maleabilidad'
      ? createMaleability(element)
      : createDuctility(element)
  }));

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
      scene.elapsed += delta;
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
      scene.render(reducedMotion.matches ? 4.9 : 0);
    }
    schedule();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const scene = scenes.find(candidate => candidate.element === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      }
      schedule();
    }, { threshold: .15 });
    scenes.forEach(scene => observer.observe(scene.element));
  } else {
    scenes.forEach(scene => { scene.visible = true; });
  }

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', updateMotionPreference);
  } else {
    reducedMotion.addListener(updateMotionPreference);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else schedule();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  updateMotionPreference();
})();
