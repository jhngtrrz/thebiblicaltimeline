// data-loader.js - carga datos JSON (periodOffsets, periods, events)
export async function loadTimelineData(url = 'data/timeline-data.json') {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    window.period_offsets = data.periodOffsets || [];
    window.periods = data.periods || [];
    window.events = data.events || {};
    document.dispatchEvent(new CustomEvent('timeline:data-ready'));
  } catch (err) {
    console.error('Error cargando datos timeline', err);
  }
}

// Auto-load si se incluye standalone
if (!window.__TIMELINE_DATA_LOADED__) {
  window.__TIMELINE_DATA_LOADED__ = true;
  loadTimelineData();
}
