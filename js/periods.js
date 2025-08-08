// periods.js - manejo de clicks en periodos (landing y footer)
import { on, qsa, qs } from './dom.js';
import { renderAll } from './events.js';
import { initTimeline } from './timeline.js';
import { navigate } from './router.js';

function slugFromId(id) {
  const slugs = [
    'first-generation', 'noah-and-the-flood', 'the-patriarchs', 'egypt-to-canaan', 'the-judges', 'united-kingdom', 'divided-kingdom', 'the-exile', 'life-of-christ', 'early-church', 'middle-ages', 'reformation', 'revelation-prophecies'
  ];
  return slugs[id - 1];
}

function scrollToPeriod(id) {
  if (!window.scroller) initTimeline();
  if (!window.period_offsets || !window.scroller) return;
  const idx = id - 1;
  const off = window.period_offsets[idx] && window.period_offsets[idx][0];
  if (off != null) {
    window.scroller.scrollTo(off, window.currentTop || 0, false);
  }
  const landing = qs('div.landing'); if (landing) landing.style.display = 'none';
  const timeline = qs('div.timeline'); if (timeline) timeline.style.display = 'block';
}

export function initPeriods() {
  // Landing periods
  qsa('.landing-period').forEach(el => {
    on(el, 'click', () => {
      const id = parseInt(el.getAttribute('data-id'), 10);
      if (!window.allEventsRendered) {
        renderAll();
        window.allEventsRendered = true;
      } else {
        // opcional: actualizar highlight si se requiere
      }
      window.currentPeriod = id;
      if (window.updateFooter) window.updateFooter(id);
      scrollToPeriod(id);
      const slug = slugFromId(id);
      if (slug) navigate('period/' + slug);
      // Reflow dimensiones tras inyección (solo primera vez necesario, pero seguro)
      if (window.scroller) { const eventsContainer = qs('.timeline .events'); if (eventsContainer) { window.scroller.setDimensions(window.innerWidth, window.innerHeight, eventsContainer.scrollWidth, eventsContainer.scrollHeight); } }
    });
  });
  // Footer periods
  qsa('div.footer div.period').forEach(el => {
    on(el, 'click', () => {
      const id = parseInt(el.getAttribute('data-period'), 10);
      if (!window.allEventsRendered) {
        renderAll();
        window.allEventsRendered = true;
      }
      window.currentPeriod = id;
      if (window.updateFooter) window.updateFooter(id);
      scrollToPeriod(id);
      const slug = slugFromId(id);
      if (slug) navigate('period/' + slug);
      if (window.scroller) { const eventsContainer = qs('.timeline .events'); if (eventsContainer) { window.scroller.setDimensions(window.innerWidth, window.innerHeight, eventsContainer.scrollWidth, eventsContainer.scrollHeight); } }
    });
  });
}

// Auto init post DOM
if (document.readyState !== 'loading') initPeriods(); else document.addEventListener('DOMContentLoaded', initPeriods);
