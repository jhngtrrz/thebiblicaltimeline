// landing.js - versión moderna sin jQuery del antiguo landing_init.js
import { qs, qsa, on } from './dom.js';
import ScrollController from './scroll-controller.js';

let landingScroller = null;
let landingZoom = 1;
let fullscreen = false;

function detectTransformProperty() {
  const testEl = document.createElement('div');
  const props = ['transform', 'webkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
  for (const p of props) { if (p in testEl.style) return p; }
  return 'transform';
}
const transformProp = detectTransformProperty();

function initScroller() {
  const container = qs('div.landing-container');
  const stage = qs('div.landing-stage');
  const paper = qs('div.landing-paper');
  const grid = qs('div.landing-grid');
  if (!container || !stage) return;
  landingScroller = new ScrollController((left, top, zoom) => {
    // aplicar translate y scale combinados (transform origin por defecto top-left)
    stage.style[transformProp] = `translate3d(${-left}px,0,0) scale(${zoom})`;
    if (paper) paper.style[transformProp] = `translate3d(${-(left / 3)}px,0,0) scale(${zoom})`;
    if (grid) grid.style[transformProp] = `translate3d(${-(left / 3)}px,0,0) scale(${zoom})`;
    landingZoom = zoom;
    // Ajustar límites según zoom sin recalcular dimensiones (evita bucle)
    const baseW = stage._baseWidth || (stage._baseWidth = stage.clientWidth);
    const baseH = stage._baseHeight || (stage._baseHeight = stage.clientHeight);
    landingScroller.contentWidth = baseW * zoom;
    landingScroller.contentHeight = baseH * zoom;
    landingScroller.maxLeft = Math.max(0, landingScroller.contentWidth - landingScroller.viewportWidth);
    landingScroller.maxTop = Math.max(0, landingScroller.contentHeight - landingScroller.viewportHeight);
    landingScroller._clamp();
    updateZoomUI(); // sólo indicadores (no reflow)
  }, { scrollingY: false, minZoom: 0.5, maxZoom: 2 });
  reflow();
  window.addEventListener('resize', reflow);
  bindPointer(container);
  bindUI();
  window.landingScroller = landingScroller; // legado
}

function reflow() {
  if (!landingScroller) return;
  const stage = qs('div.landing-stage');
  const w = stage && stage.clientWidth ? stage.clientWidth : 2525;
  const h = stage && stage.clientHeight ? stage.clientHeight : 845;
  landingScroller.setDimensions(window.innerWidth, window.innerHeight, w, h);
}

function bindPointer(container) {
  let isDown = false;
  const start = (point) => {
    landingScroller.doPointerStart([{ pageX: point.pageX, pageY: point.pageY }]);
    isDown = true;
  };
  const move = (point) => {
    if (!isDown) return;
    landingScroller.doPointerMove([{ pageX: point.pageX, pageY: point.pageY }]);
  };
  const end = () => {
    if (!isDown) return;
    landingScroller.doPointerEnd();
    isDown = false;
  };
  // Mouse
  on(container, 'mousedown', e => { if (/input|textarea|select/i.test(e.target.tagName)) return; start(e); });
  on(container, 'mousemove', e => move(e));
  on(container, 'mouseup', () => end());
  // Touch
  container.addEventListener('touchstart', e => { if (e.touches[0] && /input|textarea|select/i.test(e.touches[0].target.tagName)) return; landingScroller.doPointerStart(e.touches); e.preventDefault(); }, { passive: false });
  container.addEventListener('touchmove', e => landingScroller.doPointerMove(e.touches), { passive: true });
  container.addEventListener('touchend', () => landingScroller.doPointerEnd());
  container.addEventListener('touchcancel', () => landingScroller.doPointerEnd());
}

function bindUI() {
  // Flechas
  const left = qs('div.landing-container div.arrow.left');
  const right = qs('div.landing-container div.arrow.right');
  if (left) on(left, 'click', () => landingScroller.scrollBy(-250, 0, true));
  if (right) on(right, 'click', () => landingScroller.scrollBy(250, 0, true));
  // Teclado
  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp': zoomIn(); e.preventDefault(); break;
      case 'ArrowDown': zoomOut(); e.preventDefault(); break;
      case 'ArrowLeft': landingScroller.scrollBy(-150, 0, true); e.preventDefault(); break;
      case 'ArrowRight': landingScroller.scrollBy(150, 0, true); e.preventDefault(); break;
    }
  });
  // Botones zoom
  const zoomInBtn = qs('div.zoom li.zoom-in');
  const zoomOutBtn = qs('div.zoom li.zoom-out');
  if (zoomInBtn) on(zoomInBtn, 'click', zoomIn);
  if (zoomOutBtn) on(zoomOutBtn, 'click', zoomOut);
  const fullBtn = qs('div.zoom li.full');
  if (fullBtn) on(fullBtn, 'click', toggleFullscreen);
  updateZoomUI();
}

function zoomIn() { landingScroller.zoomBy(1.25, { animate: true }); }
function zoomOut() { landingScroller.zoomBy(1 / 1.25, { animate: true }); }

function updateZoomUI() {
  const stage = qs('div.landing-stage');
  if (stage) { /* clases legacy no necesarias con scale directo */ }
  const indicators = qsa('ul.indicator li');
  indicators.forEach((li) => { li.classList.remove('active'); });
  // Activar el indicador más cercano según rangos arbitrarios
  if (landingZoom < 0.8 && indicators[0]) indicators[0].classList.add('active');
  else if (landingZoom < 1.3 && indicators[1]) indicators[1].classList.add('active');
  else if (indicators[2]) indicators[2].classList.add('active');
}

function toggleFullscreen() {
  fullscreen = !fullscreen;
  const docEl = document.documentElement;
  if (fullscreen) {
    if (docEl.requestFullscreen) docEl.requestFullscreen();
    else if (docEl.webkitRequestFullScreen) docEl.webkitRequestFullScreen();
    else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  }
}

export function initLanding() {
  initScroller();
}

// Autoinit opcional si existe landing en DOM antes de app bootstrap
if (document.readyState !== 'loading') {
  if (qs('div.landing')) initLanding();
} else {
  document.addEventListener('DOMContentLoaded', () => { if (qs('div.landing')) initLanding(); });
}
