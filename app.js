(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.navigation');
  const closeMenu = (restoreFocus = false) => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Menü öffnen');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menu.focus();
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu(true);
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      const links = [...nav.querySelectorAll('a[href]')];
      const last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === menu) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menu.focus(); }
    });
    document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
    matchMedia('(min-width:821px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  }
  let scheduled = false;
  const updateHeader = () => {
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 40);
    scheduled = false;
  };
  updateHeader();
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const revealAll = () => {
    observer?.disconnect();
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.remove('reveal-pending'));
  };
  if (!reduced.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const siblings = [...el.parentElement.children].filter(child => child.hasAttribute('data-reveal'));
      el.style.setProperty('--delay', Math.min(siblings.indexOf(el), 3) * 75 + 'ms');
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
    reduced.addEventListener('change', e => { if (e.matches) revealAll(); });
    addEventListener('beforeprint', revealAll);
  }
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  const email = document.querySelector('#email-contact');
  const subjectLabel = document.querySelector('#inquiry-subject');
  const topic = new URLSearchParams(location.search).get('anliegen');
  if (email && topic) {
    const safeTopic = topic.replace(/[\r\n]/g, ' ').slice(0, 100);
    email.href = 'mailto:energieberatung-kleine-klopries@gmx.de?subject=' + encodeURIComponent('Anfrage: ' + safeTopic);
    if (subjectLabel) subjectLabel.textContent = 'Anfrage: ' + safeTopic + ' ↗';
  }
})();
