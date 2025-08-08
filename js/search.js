// search.js - búsqueda de eventos
import { qs, qsa, on, show, hide, html, append } from './dom.js';
import { getEventDetail } from './event-detail.js';

async function fetchJSON(url, params) {
  const u = new URL(url, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u.toString(), { credentials: 'same-origin' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function renderResults(d) {
  const countEl = qs('div.dropdown.search h4');
  if (countEl) {
    let count;
    if (d.count === 0) count = 'No Results'; else if (d.count === 1) count = '1 Result'; else count = d.count + ' Results';
    html(countEl, count);
  }
  const ul = qs('div.dropdown.search ul');
  if (!ul) return;
  html(ul, '');
  const templateEl = qs('.result-template');
  const template = templateEl ? templateEl.innerHTML : '<li data-slug="%slug%" class="result">%title%</li>';
  d.events.forEach(ev => {
    let item = template.replace('%title%', ev[1]).replace('%slug%', ev[0]);
    append(ul, item);
  });
}

async function search(query) {
  const dd = qs('div.menu div.search');
  if (!dd) return;
  if (query) show(dd); else { hide(dd); const ul = qs('div.dropdown.search ul'); if (ul) html(ul, ''); return; }
  try {
    const data = await fetchJSON('php/search.php', { search: query });
    renderResults(data);
  } catch (err) { console.error('Search error', err); }
}

export function initSearch() {
  const input = qs('input.search');
  if (!input) return;
  input.addEventListener('keypress', e => {
    if (e.keyCode !== 13) { search(input.value + String.fromCharCode(e.which || 0)); }
  });
  input.addEventListener('keyup', e => { if (e.keyCode === 8) { search(input.value); } });
  const resultsUl = qs('div.dropdown.search ul');
  if (resultsUl) {
    resultsUl.addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return; e.preventDefault(); const slug = li.getAttribute('data-slug'); if (slug) getEventDetail(slug, true);
    });
  }
}
