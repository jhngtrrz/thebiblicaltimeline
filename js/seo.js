// seo.js - manejo de título y meta descripción
export function setSEO(title, description) {
  if (title) document.title = title;
  if (description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }
}
// Mantener compatibilidad con código legacy
overrideGlobal('setSEO', setSEO);
function overrideGlobal(name, fn) {
  if (!window[name]) window[name] = fn; else window[name] = fn;
}
