// events.js - renderizado inicial de eventos desde globals en index.html
import { qs, html, append } from './dom.js';

export function renderPeriod(period) {
  if (!window.events) { console.warn('window.events no definido'); return; }
  const list = window.events[period];
  const container = qs('div.events');
  if (!container) return;
  html(container, '');
  if (list) { list.forEach(htmlStr => append(container, htmlStr)); }
  window.currentPeriod = period;
}

export function renderAll() {
  if (!window.events) { console.warn('window.events no definido'); return; }
  const container = qs('div.events'); if (!container) return;
  html(container, '');
  // concatenar en orden numérico
  Object.keys(window.events).sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
    const arr = window.events[k]; if (arr) arr.forEach(htmlStr => append(container, htmlStr));
  });
  if (window.buildYearSegments) window.buildYearSegments();
}

// Esperar datos si aún no están
if (!window.events) {
  document.addEventListener('timeline:data-ready', () => {
    // datos listos; nada que hacer hasta interacción de usuario
  }, { once: true });
}
// init original eliminado: render tras clic primer periodo.
