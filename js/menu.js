// menu.js - manejo del menú lateral y navegación home
import { qs, qsa, on, addClass, removeClass, hasClass, fadeIn, fadeOut, show, hide } from './dom.js';
import { navigate } from './router.js';
import { randomFact } from './facts.js';
import { setSEO } from './seo.js';

export function closeMenuBoxes() {
  qsa('div.menu li').forEach(li => removeClass(li, 'active'));
  qsa('div.menu div.dropdown').forEach(hide);
}
window.closeMenuBoxes = closeMenuBoxes; // legacy

export function goHome() {
  const landing = qs('div.landing');
  if (landing && landing.style.display === 'none') {
    randomFact();
    setSEO('The Biblical Timeline', 'From the creation of the world to the last-day events of Revelation, the timeline is a comprehensive guide to major Bible events, characters, and prophecies.');
    window.routerFlag = false;
    const mask = qs('div.mask');
    if (mask) {
      fadeIn(mask, 300);
      setTimeout(() => {
        show(landing);
        const timeline = qs('div.timeline'); if (timeline) hide(timeline);
        fadeOut(mask, 300);
      }, 320);
    } else {
      show(landing);
    }
    navigate('home');
  }
}
window.goHome = goHome;

export function initMenu() {
  const menu = qs('div.menu');
  if (!menu) return;
  // Botones menú
  on(menu, 'click', 'li', function () {
    closeMenuBoxes();
    if (!this.classList.contains('home') && !this.classList.contains('tools')) {
      if (this.classList.contains('active')) {
        removeClass(this, 'active');
        qsa('div.dropdown').forEach(hide);
      } else {
        addClass(this, 'active');
        const dropdown = this.getAttribute('data-dropdown');
        const dd = qs('div.dropdown.' + dropdown); if (dd) show(dd);
      }
    }
    if (this.classList.contains('home')) goHome();
  });
  // Logo
  const logo = qs('div.menu h2');
  if (logo) on(logo, 'click', goHome);
  // Search focus
  const searchInput = qs('div.menu input.search');
  if (searchInput) {
    on(searchInput, 'focus', () => { closeMenuBoxes(); if (searchInput.value) { const dd = qs('div.dropdown.search'); if (dd) show(dd); } });
  }
  // Toggle menú
  const toggle = qs('div.menu div.menu-toggle');
  if (toggle) {
    on(toggle, 'click', () => {
      if (menu.classList.contains('open')) { closeMenuBoxes(); removeClass(menu, 'open'); addClass(menu, 'closed'); }
      else { removeClass(menu, 'closed'); addClass(menu, 'open'); }
    });
  }
  // Cerrar al hacer click fuera (sidebar / timeline)
  ['.sidebar', '.timeline'].forEach(sel => { const el = qs(sel); if (el) on(el, 'click', closeMenuBoxes); });
}
