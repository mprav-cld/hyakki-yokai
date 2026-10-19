/* Hyakki: site config, cookie consent and analytics.
   Fill in the IDs below to switch services on. Nothing loads until the visitor accepts cookies. */
(() => {
  'use strict';
  const config = {
    // Where the order form sends leads (Formspree, Getform, your own backend...). Empty = demo mode:
    // the form validates and shows the thank-you state, but sends nothing.
    formEndpoint: '',
    // Yandex Metrica counter number, for example 98765432. Empty = not loaded.
    yandexMetrikaId: '',
    // Google Analytics 4 measurement ID, for example G-XXXXXXX. Empty = not loaded.
    ga4Id: '',
  };
  const CONSENT_KEY = 'hyakki-cookie-consent';
  window.dataLayer = window.dataLayer || [];

  const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } };
  const saveConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* private mode */ } };

  let analyticsOn = false;
  const loadScript = (src) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };
  const startAnalytics = () => {
    if (analyticsOn) return;
    analyticsOn = true;
    if (config.yandexMetrikaId) {
      window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = Date.now();
      loadScript('https://mc.yandex.ru/metrika/tag.js');
      window.ym(Number(config.yandexMetrikaId), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
    }
    if (config.ga4Id) {
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', config.ga4Id, { anonymize_ip: true });
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4Id));
    }
  };

  // one event API for the whole site: dataLayer always, Metrica and GA4 only after consent
  const GA4_NAMES = { lead_submitted: 'generate_lead' };
  const track = (event, params = {}) => {
    window.dataLayer.push(Object.assign({ event }, params));
    if (!analyticsOn) return;
    if (config.yandexMetrikaId && window.ym) window.ym(Number(config.yandexMetrikaId), 'reachGoal', event, params);
    if (config.ga4Id && window.gtag) window.gtag('event', GA4_NAMES[event] || event, params);
  };
  window.hyakki = { config, track };

  const showBanner = () => {
    const box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Уведомление о cookie');
    box.innerHTML = '<p>Мы используем cookie, чтобы сайт работал и чтобы считать посещения. Подробнее в <a href="privacy.html#cookie">политике конфиденциальности</a>.</p>'
      + '<div class="cookie-actions"><button type="button" class="primary" data-choice="all">Принять</button>'
      + '<button type="button" data-choice="necessary">Только необходимые</button></div>';
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('in'));
    box.addEventListener('click', (e) => {
      const choice = e.target.getAttribute && e.target.getAttribute('data-choice');
      if (!choice) return;
      saveConsent(choice);
      if (choice === 'all') startAnalytics();
      track('cookie_consent', { choice });
      box.classList.remove('in');
      setTimeout(() => box.remove(), 600);
    });
  };

  const init = () => {
    const consent = readConsent();
    if (consent === 'all') startAnalytics();
    else if (!consent) showBanner();
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
