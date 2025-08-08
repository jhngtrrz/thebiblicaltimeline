// hover.js - manejo del hover sobre eventos del timeline
// Requiere globals: hover, clientHeight, currentTop, period_offsets, currentPeriod
import { qsa, qs, show, hide } from './dom.js';

export function initEventHover(){
  const body = document.body;
  // crear línea vertical si no existe (se dimensionará dinámicamente)
  let vLine = document.querySelector('.hover-vline');
  if(!vLine){
    vLine = document.createElement('div');
    vLine.className='hover-vline';
    vLine.style.cssText='position:absolute;width:1px;background:rgba(0,0,0,0.35);pointer-events:none;display:none;z-index:48;';
    const stage = document.querySelector('.timeline .stage');
    if(stage) stage.appendChild(vLine);
  }
  body.addEventListener('mouseover', e=>{
    const el = e.target.closest('div.event');
    if(!el) return;
    if(window.hover !== 'hoverable') return;
    const hoverWidth = el.getAttribute('data-hover');
    const hoverPeriod = el.getAttribute('data-period');
    const dateBarColor = qs('div.date-bar-color');
    if(dateBarColor){
      dateBarColor.className = 'date-bar-color date-bar-color-' + hoverPeriod;
      const ul = dateBarColor.querySelector('ul'); if(ul) ul.className = 'period-text-' + hoverPeriod;
    }
    const pointer = qs('canvas.pointer');
    if(pointer){
      const color = getComputedStyle(el).backgroundColor;
      const eventTop = parseInt(getComputedStyle(el).top)||0;
      const eventLeft = parseInt(getComputedStyle(el).left)||0;
      const eventWidth = parseFloat(getComputedStyle(el).width)||0;
      const eventType = el.classList.contains('major')? 'major':'minor';
      const dateBarHeight = 66;
      const footerHeight = 75;
      const pHeightType = (eventType==='major')? 80:30;
      const clientAdjustedHeight = window.clientHeight - footerHeight - dateBarHeight - 2;
      let pointerHeight = clientAdjustedHeight - ((eventTop - window.currentTop) + pHeightType);
      pointerHeight = (pointerHeight < 14)? 0 : pointerHeight;
      pointer.width = 14; pointer.height = pointerHeight;
      const eventTopAdjust = eventTop + pHeightType;
      pointer.style.top = eventTopAdjust + 'px';
      pointer.style.left = eventLeft + 'px';
      const ctx = pointer.getContext('2d');
      ctx.clearRect(0,0,14,pointerHeight);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(0,pointerHeight);
      ctx.lineTo(14,0);
      ctx.lineTo(0,0);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fill();
      pointer.style.display='block';
      // línea vertical centrada bajo el evento
      if(vLine){
        const lineTop = eventTopAdjust + 2; // justo debajo del rectángulo
        const lineHeight = (clientAdjustedHeight + dateBarHeight) - (eventTopAdjust + 2);
        vLine.style.top = lineTop + 'px';
        vLine.style.height = (lineHeight>0? lineHeight:0) + 'px';
        vLine.style.left = (eventLeft + eventWidth/2) + 'px';
        vLine.style.display='block';
      }
    }
    // Color bar
    const eventLeft = parseInt(getComputedStyle(el).left)||0;
    const dateBarColorEl = qs('div.date-bar-color');
  if(dateBarColorEl){
      const ul = dateBarColorEl.querySelector('ul');
      if(ul){ ul.style.marginLeft = -(eventLeft - 55)+ 'px'; }
      dateBarColorEl.style.width = hoverWidth + 'px';
      dateBarColorEl.style.left = eventLeft + 'px';
      dateBarColorEl.style.backgroundPositionX = (-eventLeft) + 'px';
      dateBarColorEl.style.display='block';
    }
    // Actualizar burbuja año al inicio del evento
    const start = el.getAttribute('data-start');
    const cy = qs('div.current-year');
    if(cy && start){
      const startNum = parseInt(start,10);
      if(!isNaN(startNum)){
        cy.setAttribute('data-prev', cy.innerHTML);
        const yearText = (startNum < 0? Math.abs(startNum)+' BC': (startNum===0? '0': startNum+' AD'));
        cy.innerHTML = yearText.replace(' ','<span>') + '</span>';
      }
    }
  });
  body.addEventListener('mouseout', e=>{
    const el = e.target.closest('div.event');
    if(!el) return;
    const pointer = qs('canvas.pointer'); if(pointer) pointer.style.display='none';
    const dateBarColorEl = qs('div.date-bar-color'); if(dateBarColorEl) dateBarColorEl.style.display='none';
  if(vLine) vLine.style.display='none';
    const cy = qs('div.current-year');
    if(cy && cy.getAttribute('data-prev')){ cy.innerHTML = cy.getAttribute('data-prev'); cy.removeAttribute('data-prev'); }
  });
}
