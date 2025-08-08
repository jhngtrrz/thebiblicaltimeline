// tooltip.js - manejo de tooltip temporal
import { qs, html } from './dom.js';
let tooltipFlag = false, tooltipShow, tooltipHide;
export function showTooltip(message) {
  const tip = qs('div.tooltip');
  if (!tip) return;
  const fadeIn = () => { tip.style.display = 'block'; tip.style.opacity = '1'; };
  const fadeOut = () => { tip.style.opacity = '0'; setTimeout(() => { tip.style.display = 'none'; }, 300); };
  if (tooltipFlag) {
    clearTimeout(tooltipShow); clearTimeout(tooltipHide);
    fadeIn();
    tooltipShow = setTimeout(() => { html(tip, message); fadeIn(); }, 50);
    tooltipHide = setTimeout(() => { fadeOut(); tooltipFlag = false; }, 3000);
  } else {
    tooltipFlag = true;
    tooltipShow = setTimeout(() => { html(tip, message); fadeIn(); }, 50);
    tooltipHide = setTimeout(() => { fadeOut(); tooltipFlag = false; }, 3000);
  }
}
window.showTooltip = showTooltip;
