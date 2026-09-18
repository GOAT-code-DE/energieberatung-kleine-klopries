(() => {
  'use strict';
  // Deep links from the homepage must expose the requested service, not hide it.
  const revealHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target?.matches('.service-item')) return;
    target.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block:'start', behavior:'instant' }));
  };
  revealHash();
  addEventListener('hashchange', revealHash);
  // Re-selecting an already active deep link must also reopen its details.
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor?.hash === location.hash) revealHash();
  });
  let printState;
  addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('.service-item')].map(el => [el, el.open]);
    printState.forEach(([el]) => { el.open = true; });
  });
  addEventListener('afterprint', () => printState?.forEach(([el, open]) => { el.open = open; }));
})();
