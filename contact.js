(() => {
  'use strict';
  const email = document.querySelector('#email-contact');
  const subject = document.querySelector('#inquiry-subject');
  const message = document.querySelector('#contact-message');
  const options = document.querySelector('.contact-topic-options');
  if (!email || !subject || !message || !options) return;
  const fromLink = new URLSearchParams(location.search).get('anliegen')?.replace(/[\r\n]/g,' ').slice(0,100);
  if (fromLink) {
    let radio = [...options.querySelectorAll('input')].find(input => input.value === fromLink);
    if (!radio) {
      const label = document.createElement('label');
      radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'contact-topic'; radio.value = fromLink;
      const span = document.createElement('span'); span.textContent = fromLink;
      label.append(radio,span); options.append(label);
    }
    radio.checked = true;
  }
  const update = () => {
    const topic = options.querySelector('input:checked')?.value || 'Allgemeine Energieberatung';
    const title = 'Anfrage: ' + topic;
    subject.textContent = title;
    const body = 'Guten Tag Herr Kleine-Klopries,\n\nich interessiere mich für das Thema ' + topic + '.\n\n' +
      (message.value.trim() ? message.value.trim() + '\n\n' : '') + 'Freundliche Grüße';
    email.href = 'mailto:energieberatung-kleine-klopries@gmx.de?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
  };
  options.addEventListener('change',update);
  message.addEventListener('input',update);
  addEventListener('pageshow',update);
  update();
  const hero = document.querySelector('.contact-atelier');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const depth = () => {
    queued = false;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0) return;
    hero.style.setProperty('--contact-depth',reduce.matches ? 0 : Math.min(1,Math.max(0,-rect.top / rect.height)).toFixed(3));
  };
  addEventListener('scroll',()=>{ if(!queued){queued=true; requestAnimationFrame(depth);} },{passive:true});
  reduce.addEventListener('change',depth);
  depth();
})();
