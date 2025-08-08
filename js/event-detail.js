// event-detail.js - carga y visualización de detalle de evento
import { qs, qsa, on, html, append, show, hide, fadeIn, fadeOut } from './dom.js';
import { setSEO } from './seo.js';
import { navigate } from './router.js';
import { closeMenuBoxes } from './menu.js';

async function fetchJSON(url, params) {
  const u = new URL(url, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u.toString(), { credentials: 'same-origin' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function getEventDetail(slug, search) {
  closeMenuBoxes();
  try {
    const d = await fetchJSON('php/event_detail.php', { slug });
    if (d.period !== window.currentPeriod) {
      window.scroller.scrollTo(window.period_offsets[d.period - 1][0], window.currentTop, false);
    }
    if (search) {
      setTimeout(() => {
        const ev = qs('div.event[data-id="' + d.id + '"]');
        if (ev) {
          const left = parseInt(getComputedStyle(ev).left) || 0;
          window.scroller.scrollTo(left - 330, window.currentTop, false);
        }
      }, 300);
    }
    setSEO(d.title + ' | The Biblical Timeline', d.description);
    navigate('event/' + d.slug);
    const eraSpan = qs('p.breadcrumbs span.era'); if (eraSpan) html(eraSpan, window.periods[d.period - 1][4]);
    const periodSpan = qs('p.breadcrumbs span.period'); if (periodSpan) html(periodSpan, window.periods[d.period - 1][3]);
    const h1 = qs('div.detail h1'); if (h1) html(h1, d.title);
    const h3 = qs('div.detail h3'); if (h3) html(h3, d.dates);
    const articleBox = qs('div.box.article'); if (articleBox) { html(articleBox, `<p><strong>${d.description}</strong><p>`); append(articleBox, `<p>${d.article}<p>`); }
    // Favoritos
    let favorite = false;
    qsa('div.favorites ul li').forEach(li => { if (li.getAttribute('data-slug') === slug) favorite = true; });
    const favBtn = qs('div.detail li.favorites a');
    if (favBtn) {
      html(favBtn, favorite ? 'Remove Favorite' : 'Add to Favorites');
      favBtn.classList.toggle('add', !favorite); favBtn.classList.toggle('remove', favorite);
      favBtn.setAttribute('data-id', d.id);
    }
    // Escrituras
    const scripturesBox = qs('div.box.scriptures'); if (scripturesBox) { html(scripturesBox, ''); d.scriptures.forEach(s => { append(scripturesBox, `<h4>${s.reference}</h4>`); s.verses.forEach(v => append(scripturesBox, `<p>${v.number} ${v.line}</p>`)); }); }
    // Relacionados
    const relatedUl = qs('div.box.related ul'); if (relatedUl) { html(relatedUl, ''); d.related.forEach(r => append(relatedUl, `<li><span data-slug="${r.slug}">${r.title}</span></li>`)); }
    // Imágenes
    const mediaPag = qs('div.media ul.pagination'); const slides = qs('div.media div.slides');
    if (mediaPag && slides) { html(mediaPag, ''); html(slides, ''); const templateEl = qs('.media-template'); if (templateEl) { const template = templateEl.innerHTML; d.images.forEach((img, i) => { let image = template.replace(/%filename%/g, img.file).replace(/%caption%/g, img.caption).replace(/%img_alt%/g, img.caption); append(slides, image); append(mediaPag, `<li>${i}</li>`); }); } }
    // Videos
    const videoList = qs('div.box.videos ul'); const videoLi = qs('div.detail li.videos');
    if (videoList) { html(videoList, ''); if (d.videos.length) { if (videoLi) show(videoLi); html(qs('div.detail li.videos a'), d.videos.length > 1 ? 'Videos' : 'Video'); d.videos.forEach(v => append(videoList, `<li><span data-title="${v.title}" data-caption="${v.caption}" data-filename="${v.filename}">${v.title}</span></li>`)); } else { if (videoLi) hide(videoLi); } }
    // Estado inicial pestañas
    qsa('div.content div.box').forEach(hide); const firstBox = qs('div.content div.box'); if (firstBox) show(firstBox);
    qsa('div.content ul.nav li').forEach(li => li.classList.remove('active')); const firstNav = qs('div.content ul.nav li'); if (firstNav) firstNav.classList.add('active');
    qsa('div.media ul.pagination li').forEach(li => li.classList.remove('active')); const firstPag = qs('div.media ul.pagination li'); if (firstPag) firstPag.classList.add('active');
    const nav = qs('div.content ul.nav'); if (nav) show(nav, 'flex');
    const pagItems = qsa('div.media ul.pagination li'); const pagUl = qs('div.media ul.pagination'); if (pagUl) { if (pagItems.length < 2) hide(pagUl); else show(pagUl, 'flex'); }
    qsa('div.slide').forEach(hide); const firstSlide = qs('div.slide'); if (firstSlide) show(firstSlide);
    const detail = qs('div.detail'); if (detail) { fadeIn(detail, 300); const landing = qs('div.landing'); const timeline = qs('div.timeline'); if (landing) fadeOut(landing, 300); if (timeline) fadeIn(timeline, 300); }
  } catch (err) { console.error('Error loading event detail', err); }
}
window.getEventDetail = getEventDetail; // legacy compat

export function initEventDetailInteractions() {
  const eventsContainer = qs('div.events');
  if (eventsContainer) { on(eventsContainer, 'click', 'div.event', function () { const slug = this.getAttribute('data-slug'); if (slug) getEventDetail(slug); }); }
}
