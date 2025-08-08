// landing.js - versión moderna sin jQuery del antiguo landing_init.js
import { qs, qsa, on, addClass, removeClass } from './dom.js';

let landingScroller = null;
let landingZoom = 1;
let fullscreen = false;

function detectTransformProperty(){
  const testEl = document.createElement('div');
  const props = ['transform','webkitTransform','msTransform','MozTransform','OTransform'];
  for(const p of props){ if(p in testEl.style) return p; }
  return 'transform';
}
const transformProp = detectTransformProperty();

function initScroller(){
  const container = qs('div.landing-container');
  const stage = qs('div.landing-stage');
  const paper = qs('div.landing-paper');
  const grid = qs('div.landing-grid');
  if(!container || !stage) return;
  landingScroller = new Scroller((left, top, zoom)=>{
    stage.style[transformProp] = `translate3d(${-left}px,0,0)`;
    if(paper) paper.style[transformProp] = `translate3d(${-(left/3)}px,0,0)`;
    if(grid) grid.style[transformProp] = `translate3d(${-(left/3)}px,0,0)`;
  }, { zooming: true });
  landingScroller.setOffset(0,0);
  reflow();
  window.addEventListener('resize', reflow);
  bindPointer(container);
  bindUI();
  window.landingScroller = landingScroller; // legado
}

function reflow(){
  if(!landingScroller) return;
  const stage = qs('div.landing-stage');
  const w = stage && stage.clientWidth ? stage.clientWidth : 2525;
  const h = stage && stage.clientHeight ? stage.clientHeight : 845;
  landingScroller.setDimensions(window.innerWidth, window.innerHeight, w, h);
}

function bindPointer(container){
  let isDown = false;
  const start = (point, timeStamp)=>{
    landingScroller.doTouchStart([{ pageX: point.pageX, pageY: point.pageY }], timeStamp || Date.now());
    isDown = true;
  };
  const move = (point, timeStamp)=>{
    if(!isDown) return;
    landingScroller.doTouchMove([{ pageX: point.pageX, pageY: point.pageY }], timeStamp || Date.now());
  };
  const end = (timeStamp)=>{
    if(!isDown) return;
    landingScroller.doTouchEnd(timeStamp || Date.now());
    isDown = false;
  };
  // Mouse
  on(container,'mousedown', e=>{ if(/input|textarea|select/i.test(e.target.tagName)) return; start(e); });
  on(container,'mousemove', e=> move(e));
  on(container,'mouseup', e=> end());
  // Touch
  container.addEventListener('touchstart', e=>{ if(e.touches[0] && /input|textarea|select/i.test(e.touches[0].target.tagName)) return; landingScroller.doTouchStart(e.touches, e.timeStamp); e.preventDefault(); }, { passive:false });
  container.addEventListener('touchmove', e=> landingScroller.doTouchMove(e.touches, e.timeStamp, e.scale), { passive:true });
  container.addEventListener('touchend', e=> landingScroller.doTouchEnd(e.timeStamp));
  container.addEventListener('touchcancel', e=> landingScroller.doTouchEnd(e.timeStamp));
}

function bindUI(){
  // Flechas
  const left = qs('div.landing-container div.arrow.left');
  const right = qs('div.landing-container div.arrow.right');
  if(left) on(left,'click', ()=> landingScroller.scrollBy(-250,0,true));
  if(right) on(right,'click', ()=> landingScroller.scrollBy(250,0,true));
  // Teclado
  window.addEventListener('keydown', e=>{
    switch(e.key){
      case 'ArrowUp': zoomIn(); e.preventDefault(); break;
      case 'ArrowDown': zoomOut(); e.preventDefault(); break;
      case 'ArrowLeft': landingScroller.scrollBy(-150,0,true); e.preventDefault(); break;
      case 'ArrowRight': landingScroller.scrollBy(150,0,true); e.preventDefault(); break;
    }
  });
  // Botones zoom
  const zoomInBtn = qs('div.zoom li.zoom-in');
  const zoomOutBtn = qs('div.zoom li.zoom-out');
  if(zoomInBtn) on(zoomInBtn,'click', zoomIn);
  if(zoomOutBtn) on(zoomOutBtn,'click', zoomOut);
  const fullBtn = qs('div.zoom li.full');
  if(fullBtn) on(fullBtn,'click', toggleFullscreen);
  updateZoomUI();
}

function zoomIn(){ landingZoom = Math.min(2, landingZoom+1); updateZoomUI(); }
function zoomOut(){ landingZoom = Math.max(0, landingZoom-1); updateZoomUI(); }

function updateZoomUI(){
  const stage = qs('div.landing-stage');
  if(stage){ ['zoom-1','zoom-2','zoom-3'].forEach(c=>removeClass(stage,c)); addClass(stage, 'zoom-'+(landingZoom+1)); }
  const indicators = qsa('ul.indicator li');
  indicators.forEach((li,i)=>{ if(i===landingZoom) addClass(li,'active'); else removeClass(li,'active'); });
  reflow();
}

function toggleFullscreen(){
  fullscreen = !fullscreen;
  const docEl = document.documentElement;
  if(fullscreen){
    if(docEl.requestFullscreen) docEl.requestFullscreen();
    else if(docEl.webkitRequestFullScreen) docEl.webkitRequestFullScreen();
    else if(docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
  } else {
    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.webkitCancelFullScreen) document.webkitCancelFullScreen();
    else if(document.mozCancelFullScreen) document.mozCancelFullScreen();
  }
}

export function initLanding(){
  initScroller();
}

// Autoinit opcional si existe landing en DOM antes de app bootstrap
if(document.readyState !== 'loading'){
  if(qs('div.landing')) initLanding();
} else {
  document.addEventListener('DOMContentLoaded', ()=>{ if(qs('div.landing')) initLanding(); });
}
