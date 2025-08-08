// video.js - reemplazo simple de Flowplayer con <video>
import { qs, show, hide } from './dom.js';

let videoEl, modalEl, wrapEl;

function ensureElements() {
  if (!modalEl) modalEl = qs('div.video-modal');
  if (!wrapEl) wrapEl = qs('div.video-wrap');
  if (!videoEl) {
    videoEl = wrapEl ? wrapEl.querySelector('video') : null;
    if (!videoEl && wrapEl) {
      videoEl = document.createElement('video');
      videoEl.setAttribute('controls', '');
      videoEl.style.maxWidth = '100%';
      wrapEl.insertBefore(videoEl, wrapEl.firstChild);
    }
  }
}

export function openVideo({ title, caption, filename }) {
  ensureElements();
  if (!videoEl) return;
  videoEl.src = filename;
  const h3 = wrapEl ? wrapEl.querySelector('h3') : null; if (h3) h3.textContent = title;
  const p = wrapEl ? wrapEl.querySelector('p') : null; if (p) p.textContent = caption;
  show(modalEl || wrapEl);
  videoEl.play().catch(() => { });
}

export function closeVideo() {
  if (!modalEl) return;
  hide(modalEl);
  if (videoEl) { videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); }
}

export function initVideo() {
  ensureElements();
  if (modalEl) { modalEl.addEventListener('click', closeVideo); }
  if (wrapEl) { const btn = wrapEl.querySelector('span.close'); if (btn) btn.addEventListener('click', e => { e.stopPropagation(); closeVideo(); }); wrapEl.addEventListener('click', e => e.stopPropagation()); }
  // Delegación para enlaces de video
  const list = document.querySelector('div.box.videos ul');
  if (list) { list.addEventListener('click', e => { const span = e.target.closest('li span'); if (!span) return; const title = span.getAttribute('data-title'); const caption = span.getAttribute('data-caption'); const filename = span.getAttribute('data-filename'); openVideo({ title, caption, filename }); }); }
}
