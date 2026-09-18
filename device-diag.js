// Opt-in real-device diagnostic, adapted from Scroll Craft's device-diag
// workflow for this SVG house (there are no video clips to decode here).
// All readings stay on the device. Nothing is stored or transmitted.
(() => {
  if (new URLSearchParams(location.search).get('diagnose') !== '1') return;
  const stage = document.querySelector('.building-stage');
  if (!stage) return;
  const panel = document.createElement('pre');
  panel.id = 'device-diagnostic';
  panel.style.cssText = 'position:fixed;z-index:200;bottom:8px;left:8px;right:8px;margin:0;padding:10px;background:#153e2ef5;color:#fff;font:11px/1.5 monospace;white-space:pre-wrap;pointer-events:none;border-radius:3px';
  document.body.append(panel);
  const errors = [];
  addEventListener('error', event => errors.push(event.message));
  let last = 0, y = scrollY, maxGap = 0, samples = 0, frame = 0, resized = 0;
  addEventListener('resize', () => resized++);
  const sample = time => {
    if (document.hidden) { frame = 0; return; }
    if (last && y !== scrollY) { maxGap = Math.max(maxGap,time-last); samples++; }
    y = scrollY;last = time;
    frame = requestAnimationFrame(sample);
  };
  frame = requestAnimationFrame(sample);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame=0; last=0; }
    else if (!frame) frame=requestAnimationFrame(sample);
  });
  setInterval(() => {
    if (document.hidden) return;
    const matrix = name => new DOMMatrix(getComputedStyle(stage.querySelector('.house-'+name)).transform).m42.toFixed(1);
    panel.textContent = 'Handy-Prüfung · mobile2 · keine Datenübertragung\n'+
      'Bitte hoch/runter scrollen, dann Screenshot senden.\n'+
      'Browserhöhe '+innerHeight+' · feste Szene '+stage.offsetHeight+' · Änderungen '+resized+'\n'+
      'Scroll '+Math.round(scrollY)+' · Dach '+matrix('roof')+' · Ebene '+matrix('analysis')+'\n'+
      'Messpunkte '+samples+' · längste Bildpause '+maxGap.toFixed(0)+' ms\n'+
      (errors.length ? 'Fehler: '+errors.slice(-2).join(' / ') : 'Keine JavaScript-Fehler')+'\n'+
      navigator.userAgent;
  },500);
})();
