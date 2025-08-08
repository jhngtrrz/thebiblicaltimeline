// footer.js - interacción con barra de periodos inferior
import { qsa, qs } from './dom.js';

export function initFooterPeriods(){
  // Clonar tabla de years (equivalente a jQuery clone())
  const years = document.querySelector('div.footer table.years');
  if(years && !document.querySelector('div.footer table.years.light')){
    const clone = years.cloneNode(true);
    clone.classList.add('light');
    years.parentNode.insertBefore(clone, years.nextSibling);
  }
  const periods = qsa('div.footer div.period');
  periods.forEach(p=>{
    p.addEventListener('click', ()=>{
      const periodAttr = p.getAttribute('data-period');
      const period = parseInt(periodAttr,10);
      if(!period) return;
      const offsetX = window.period_offsets[period - 1][0];
      window.scroller.scrollTo(offsetX, window.currentTop, false);
      if(window.updateSidebar) window.updateSidebar(period);
    });
  });
}
