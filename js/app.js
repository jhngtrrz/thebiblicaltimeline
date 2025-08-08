// Bootstrap moderno: este archivo ahora sólo inicializa módulos.
// Próximos pasos: migrar funcionalidades desde app.legacy.js a módulos separados sin jQuery.
import { qs } from './dom.js';
import './seo.js';
import { randomFact } from './facts.js';
import { initMenu } from './menu.js';
import { initEventDetailInteractions } from './event-detail.js';
import { initSearch } from './search.js';
import { initAuth } from './auth.js';
import { initVideo } from './video.js';
import './tooltip.js';
import { initEventHover } from './hover.js';
import { initFooterPeriods } from './footer.js';
import { initLanding } from './landing.js';
import { initPeriods } from './periods.js';
import { initTimeline } from './timeline.js';

// Ejemplo: ocultar máscara al cargar
window.addEventListener('load', () => {
	const mask = qs('div.mask');
	if (mask) setTimeout(() => { mask.style.opacity = 0; setTimeout(() => mask.style.display = 'none', 320); }, 600);
	randomFact();
	initMenu();
	initEventDetailInteractions();
	initSearch();
	initAuth();
	initVideo();
	initEventHover();
	initFooterPeriods();
	initLanding();
	initPeriods();
	initTimeline();
});

// TODO: implementar módulos: intro.js, favorites.js
// Cada módulo exportará init() y se invocará aquí.

console.info('App bootstrap cargado. Código legacy eliminado; usar módulos.');
