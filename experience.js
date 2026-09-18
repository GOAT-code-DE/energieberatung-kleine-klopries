(() => {
  'use strict';
  const root = document.querySelector('.experience');
  if (!root) return;
  const act = document.querySelector('.building-act');
  const stage = document.querySelector('.building-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stories = [...document.querySelectorAll('[data-story]')];
  const phases = [...document.querySelectorAll('[data-phase]')];
  const lightSwitch = document.querySelector('.light-switch');
  const lightLabel = lightSwitch?.querySelector('.light-label');
  // null = follow the scene; a manual choice lasts only for this page visit.
  let manualLight = null;
  let lightOn = lightSwitch?.getAttribute('aria-pressed') === 'true';
  const setLight = on => {
    if (!lightSwitch || on === lightOn) return;
    lightOn = on;
    root.classList.toggle('lights-off', !on);
    lightSwitch.setAttribute('aria-pressed', String(on));
    lightLabel.textContent = on ? 'Licht an' : 'Licht aus';
  };
  const staticMode = () => {
    document.documentElement.classList.toggle('sc-boot', !reduced.matches && !!window.ScrollCraft);
    root.classList.toggle('motion-static', reduced.matches || !window.ScrollCraft);
    root.classList.toggle('scroll-live', !reduced.matches && !!window.ScrollCraft);
    stories.forEach(story => { story.inert = false; story.removeAttribute('aria-hidden'); });
  };
  staticMode();
  // CSS removes pinned height and reflows all copy when motion is disabled.
  // Mount only once: the snapshot engine does not expose a destroy method.
  const scene = window.ScrollCraft?.mount(root);
  let active = -1;
  let scheduled = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  const render = () => {
    scheduled = false;
    if (!act || !stage) return;
    if (reduced.matches || !window.ScrollCraft) {
      setLight(manualLight ?? false);
      return;
    }
    const p = Number(act.style.getPropertyValue('--sc-p')) || 0;
    setLight(manualLight ?? p >= .33);
    const open = clamp(p * 1.5);
    const heat = clamp((p - .15) / .85);
    // Geometry follows the engine's --sc-p directly in CSS, in the same frame.
    // Only discrete light/story state needs JavaScript; no per-frame text layout.
    const next = p < .33 ? 0 : p < .67 ? 1 : 2;
    // Verification describes the rendered roof/shell translations, not scroll.
    stage.dataset.scVerifyState = `roof:${Math.round(-180*open)};shell:${Math.round(-125*open)};plane:${Math.round(-100*heat)};story:${next};light:${root.classList.contains('lights-off') ? 'off' : 100}`;
    if (next !== active) {
      active = next;
      stories.forEach((story, i) => {
        story.classList.toggle('is-active', i === next);
        story.inert = i !== next;
        story.setAttribute('aria-hidden', String(i !== next));
      });
      phases.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    }
  };
  const queue = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } };
  lightSwitch?.addEventListener('click', () => {
    manualLight = root.classList.contains('lights-off');
    setLight(manualLight);
    queue();
  });
  // Mutation callbacks run before paint. Another rAF here delayed the roof by
  // a complete frame behind the scroll position (especially visible on a wheel).
  if (act) new MutationObserver(render).observe(act, {attributes:true, attributeFilter:['style']});
  reduced.addEventListener('change', () => { staticMode(); active = -1; queue(); });
  phases.forEach(button => button.addEventListener('click', () => {
    const p = [.08, .48, .9][Number(button.dataset.phase)];
    const top = act.getBoundingClientRect().top + scrollY;
    // Jump to a readable plateau, never animate multiple viewports for keyboard input.
    scrollTo({top:top + (act.offsetHeight - innerHeight) * p, behavior:'instant'});
    queue();
  }));
  addEventListener('pageshow', () => {
    manualLight = null;
    // Re-read restored positions, including Back/Forward cache, without mounting twice.
    scene?.layout();
    active = -1;
    queue();
  });
  addEventListener('pagehide', () => {
    manualLight = null;
    setLight(false);
  });
  queue();
})();
