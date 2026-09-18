(() => {
  'use strict';
  const root = document.querySelector('.experience');
  if (!root) return;
  const act = root.querySelector('.building-act');
  // Homepage: unchanged Scroll Craft engine. Bespoke house: a stable timeline
  // whose geometry is not recalculated when iOS browser chrome changes height.
  if (!act) { window.ScrollCraft?.mount(root); return; }
  const stage = act.querySelector('.building-stage');
  const drawing = act.querySelector('.exploded-building');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)');
  const stories = [...act.querySelectorAll('[data-story]')];
  const phases = [...act.querySelectorAll('[data-phase]')];
  const bars = [...act.querySelectorAll('.analysis-track b')];
  const lightSwitch = act.querySelector('.light-switch');
  const lightLabel = lightSwitch.querySelector('.light-label');
  const parts = Object.fromEntries(['roof','shell','window-lights','analysis','inside'].map(name => [name, drawing.querySelector('.house-'+name)]));
  const clamp = n => Math.max(0, Math.min(1, n));
  let manualLight = null, lightOn = false, active = -1;
  let top = 0, travel = 1, unit = 1, width = 0, frame = 0;
  let progress = 0, lastPaint = -1, previousTime = 0;
  const setLight = on => {
    if (on === lightOn) return;
    lightOn = on;
    root.classList.toggle('lights-off', !on);
    lightSwitch.setAttribute('aria-pressed', String(on));
    lightLabel.textContent = on ? 'Licht an' : 'Licht aus';
  };
  const paint = p => {
    setLight(manualLight ?? (!reduced.matches && p >= .33));
    if (p === lastPaint) return;
    lastPaint = p;
    const open = clamp(p * 1.5), heat = clamp((p - .15) / .85);
    // Move separate HTML layers, not SVG groups. No inherited per-frame vars.
    const move = (el, x, y) => { el.style.transform = 'translate3d('+(x*unit).toFixed(3)+'px,'+(y*unit).toFixed(3)+'px,0)'; };
    move(parts.roof, -28*open, -180*open);
    move(parts.shell, -125*open, 38*open);
    move(parts['window-lights'], -125*open, 38*open);
    move(parts.analysis, 0, -100*heat);
    parts.shell.style.opacity = String(1 - open*.65);
    parts.analysis.style.opacity = String(.2 + heat*.8);
    parts.inside.style.opacity = String(.35 + heat*.65);
    bars.forEach(bar => { bar.style.transform = 'scaleX('+heat.toFixed(4)+')'; });
    const next = p < .33 ? 0 : p < .67 ? 1 : 2;
    stage.dataset.scVerifyState = 'roof:'+Math.round(-180*open)+';shell:'+Math.round(-125*open)+';plane:'+Math.round(-100*heat)+';story:'+next+';light:'+(lightOn ? 100 : 'off');
    if (next !== active) {
      active = next;
      stories.forEach((story, i) => {
        story.classList.toggle('is-active', i === next);
        story.inert = !reduced.matches && i !== next;
        story.setAttribute('aria-hidden', String(!reduced.matches && i !== next));
      });
      phases.forEach((label, i) => label.classList.toggle('is-active', i === next));
    }
  };
  const target = () => reduced.matches ? 0 : clamp((scrollY - top) / travel);
  const tick = now => {
    frame = 0;
    if (document.hidden) return;
    const next = target();
    // Time-based touch interpolation works at both 60 and 120 Hz, then stops.
    const dt = previousTime ? Math.min(now - previousTime, 50) : 16;
    previousTime = now;
    progress += (next - progress) * (touch.matches ? 1 - Math.exp(-dt/28) : 1);
    if (Math.abs(next - progress) < .00015) progress = next;
    paint(progress);
    if (progress !== next) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  };
  const queue = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
  const mode = () => {
    document.documentElement.classList.toggle('sc-boot', !reduced.matches);
    document.documentElement.classList.add('sc-ready');
    root.classList.toggle('motion-static', reduced.matches);
    root.classList.toggle('scroll-live', !reduced.matches);
    active = -1; lastPaint = -1;
  };
  const layout = (force = false) => {
    const mobile = touch.matches || innerWidth <= 820;
    if (!force && mobile && width === innerWidth) return;
    width = innerWidth;
    act.style.removeProperty('--scene-height');
    if (!reduced.matches) act.style.setProperty('--scene-height', stage.offsetHeight+'px');
    top = act.getBoundingClientRect().top + scrollY;
    travel = Math.max(1, act.offsetHeight - stage.offsetHeight);
    unit = Math.min(drawing.clientWidth / 970, drawing.clientHeight / 1000);
    progress = target(); lastPaint = -1; paint(progress);
  };
  mode(); layout(true);
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', () => layout(), {passive:true});
  reduced.addEventListener('change', () => { mode(); layout(true); });
  lightSwitch.addEventListener('click', () => {
    manualLight = !lightOn;
    lastPaint = -1; paint(progress);
  });
  addEventListener('pageshow', () => { manualLight = null; layout(true); });
  addEventListener('pagehide', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0; manualLight = null; setLight(false);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else { progress = target(); lastPaint = -1; paint(progress); }
  });
})();
