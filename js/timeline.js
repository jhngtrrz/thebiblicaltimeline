// timeline.js - inicializa scroller principal para la vista timeline
import { qs } from './dom.js';

export function initTimeline() {
    if (window.scroller) return; // evitar doble
    const eventsContainer = qs('.timeline .events');
    if (!eventsContainer) { console.warn('No .timeline .events encontrado'); return; }
    // Crear scroller horizontal simple
    const stage = eventsContainer; // asumimos que su ancho ya está definido vía CSS/inline
    window.scroller = new Scroller((left, top, zoom) => {
        stage.style.transform = `translate3d(${-left}px,${-top}px,0)`;
        window.currentTop = top;
        updateIndicator(left, top);
        updateDateBar(left);
    }, { zooming: false, animating: true, bouncing: true, scrollingY: true, scrollingX: true });
    // Dimensiones: usar scrollWidth del contenedor
    const reflow = () => {
        const contentW = stage.scrollWidth || stage.clientWidth || 5000;
        const contentH = stage.scrollHeight || stage.clientHeight || window.innerHeight;
        window.scroller.setDimensions(window.innerWidth, window.innerHeight, contentW, contentH);
    };
    window.addEventListener('resize', reflow);
    reflow();

    // Interacción mouse / touch
    let isDown = false;
    const container = qs('div.timeline');
    if (container) {
        container.addEventListener('mousedown', e => { if (e.button !== 0) return; isDown = true; window.scroller.doTouchStart([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp); e.preventDefault(); });
        container.addEventListener('mousemove', e => { if (!isDown) return; window.scroller.doTouchMove([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp); });
        container.addEventListener('mouseup', e => { if (!isDown) return; isDown = false; window.scroller.doTouchEnd(e.timeStamp); });
        container.addEventListener('mouseleave', e => { if (isDown) { isDown = false; window.scroller.doTouchEnd(e.timeStamp); } });
        // Touch
        container.addEventListener('touchstart', e => { window.scroller.doTouchStart(e.touches, e.timeStamp); }, { passive: true });
        container.addEventListener('touchmove', e => { window.scroller.doTouchMove(e.touches, e.timeStamp); }, { passive: true });
        container.addEventListener('touchend', e => { window.scroller.doTouchEnd(e.timeStamp); });
        container.addEventListener('touchcancel', e => { window.scroller.doTouchEnd(e.timeStamp); });
        // Wheel horizontal
        container.addEventListener('wheel', e => { if (!window.scroller) return; const delta = e.deltaY || e.deltaX; const left = (window.scroller.__scrollLeft || 0) + delta; window.scroller.scrollTo(left, 0, false); e.preventDefault(); }, { passive: false });
    }
}

function updateIndicator(left, top) {
    // Indicador simple central (opcional): usar un span existente o crear uno
    let ind = qs('.scroll-indicator');
    if (!ind) {
        ind = document.createElement('div');
        ind.className = 'scroll-indicator';
        ind.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;background:rgba(0,0,0,.6);color:#fff;padding:6px 10px;font:12px/1.2 sans-serif;border-radius:4px;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3)';
        document.body.appendChild(ind);
    }
    // detectar periodo actual por offset horizontal centrado
    let currentP = ''; let centerX = left + window.innerWidth / 2;
    if (window.period_offsets) {
        for (let i = 0; i < window.period_offsets.length; i++) {
            const start = window.period_offsets[i][0];
            const end = (window.period_offsets[i + 1] ? window.period_offsets[i + 1][0] : start + 2000); // fallback ancho estimado
            if (centerX >= start && centerX < end) { currentP = (i + 1) + ''; break; }
        }
    }
        if(currentP){
            const num = parseInt(currentP,10);
            if(window.currentPeriod !== num){
                window.currentPeriod = num;
                updateFooter(num);
                if(window.updateSidebar) window.updateSidebar(num);
            }
        }
    ind.textContent = currentP ? `Periodo ${currentP}  x:${Math.round(left)} y:${Math.round(top)}` : `x:${Math.round(left)} y:${Math.round(top)}`;
}

function updateFooter(period) {
    // Actualizar texto "Currently Viewing"
    const periodNameSpan = document.querySelector('div.footer span.period-name');
    if (periodNameSpan && window.periods) {
        periodNameSpan.textContent = window.periods[period - 1][3];
        periodNameSpan.setAttribute('data-period', period);
    }
    const periodBarTitle = document.querySelector('div.footer div.period-bar h5');
    if (periodBarTitle && window.periods) { periodBarTitle.textContent = window.periods[period - 1][3]; }
    // Highlight barra de periodos
    document.querySelectorAll('div.footer .periods .period').forEach(p => p.classList.remove('active'));
    const active = document.querySelector(`div.footer .periods .period-${period}-wrap`);
    if (active) active.classList.add('active');
}
window.updateFooter = updateFooter;
function updateSidebar(period){
    const sidebars = document.querySelectorAll('.sidebars > div');
    sidebars.forEach(d => d.style.display = 'none');
    const active = document.querySelector('.sidebars .period-' + period);
    if (active) active.style.display = 'block';
}
window.updateSidebar = updateSidebar;

// --- Date Bar & Current Year ---
let yearSegments = null;
function buildYearSegments(){
    const eventsContainer = document.querySelector('.timeline .events');
    if(!eventsContainer) return;
    const events = Array.from(eventsContainer.querySelectorAll('.event'));
    const byPeriod = {};
    events.forEach(ev=>{
        const p = parseInt(ev.getAttribute('data-period'),10);
        if(!p) return;
        if(!byPeriod[p]) byPeriod[p] = [];
        const left = parseFloat(ev.style.left)||0;
        const width = parseFloat(ev.style.width)||0;
        const start = parseInt(ev.getAttribute('data-start'),10);
        const end = parseInt(ev.getAttribute('data-end'),10);
        if(!isNaN(start)) byPeriod[p].push({left,width,start,end: isNaN(end)? start:end});
    });
    const segs = [];
    if(window.period_offsets){
        for(let i=0;i<window.period_offsets.length;i++){
            const startX = window.period_offsets[i][0];
            const next = window.period_offsets[i+1];
            let endX = next ? next[0] : startX + 3000; // fallback width
            const periodIndex = i+1;
            const list = byPeriod[periodIndex]||[];
            let minYear = Infinity, maxYear=-Infinity, maxRight = startX;
            list.forEach(o=>{
                if(o.start < minYear) minYear = o.start;
                if(o.end > maxYear) maxYear = o.end;
                if(o.left + o.width > maxRight) maxRight = o.left + o.width;
            });
            if(maxRight > endX) endX = maxRight + 50;
            if(minYear === Infinity){ // sin datos usar offset dataset
                minYear = window.period_offsets[i][2];
                maxYear = next ? next[2] : minYear + 200;
            }
            segs.push({startX,endX,startYear:minYear,endYear:maxYear});
        }
    }
    yearSegments = segs;
    window.yearSegments = segs;
}
window.buildYearSegments = buildYearSegments;

function interpolateYear(x){
    if(!yearSegments || !yearSegments.length) buildYearSegments();
    const spans = yearSegments||[];
    for(const s of spans){
        if(x >= s.startX && x <= s.endX){
            const ratio = (x - s.startX) / (s.endX - s.startX || 1);
            return s.startYear + ratio * (s.endYear - s.startYear);
        }
    }
    if(spans.length){
        if(x < spans[0].startX) return spans[0].startYear;
        const last = spans[spans.length-1];
        if(x > last.endX) return last.endYear;
    }
    return 0;
}

function formatYear(y) {
    const rounded = Math.round(y);
    if(rounded < 0) return Math.abs(rounded) + ' BC';
    if(rounded === 0) return '0';
    return rounded + ' AD';
}

function updateDateBar(left) {
    // mover listas
window.updateDateBar = updateDateBar;
    const dateBar = document.querySelector('div.date-bar ul');
    const dateBarColor = document.querySelector('div.date-bar-color ul');
    if (dateBar) dateBar.style.marginLeft = (-left) + 'px';
    if (dateBarColor) dateBarColor.style.marginLeft = (-left) + 'px';
    // calcular año al centro
    const centerX = left + window.innerWidth / 2;
    const year = interpolateYear(centerX);
    const currentYearEl = document.querySelector('div.current-year');
    if (currentYearEl) {
        currentYearEl.innerHTML = formatYear(year).replace(' ', '<span>') + '</span>';
        // No mover posición: mantenemos CSS original para evitar saltos/duplicaciones visuales
    }
    const currentYearLine = document.querySelector('div.current-year-line');
    if (currentYearLine) {
        currentYearLine.style.left = (window.innerWidth / 2) + 'px';
    }
}

if (document.readyState !== 'loading') initTimeline(); else document.addEventListener('DOMContentLoaded', initTimeline);
