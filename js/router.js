// Router nativo ligero reemplazando Backbone.Router
// Convención de rutas: definimos patrones y funciones handler
// Dependencias esperadas globales: period_offsets, scroller, setSEO, getEventDetail

const routeTable = [];
let routerFlag = true; // preserva semántica previa si se usaba global

function addRoute(pattern, handler) {
	// pattern estilo 'period/:period/:offset?' convertir a RegExp y extraer claves
	const keys = [];
	const regexStr = pattern
		.replace(/\//g, '\\/')
		.replace(/:(\w+)(\?)?/g, (_m, key, optional) => {
			keys.push(key);
			return optional ? '(?:\\/([^/]+))?' : '\\/([^/]+)';
		}) + '$';
	const regex = new RegExp('^' + regexStr);
	routeTable.push({ regex, keys, handler, pattern });
}

export function navigate(path, { replace = false } = {}) {
	const url = path.startsWith('/') ? path : '/' + path;
	if (replace) {
		history.replaceState({}, '', url);
	} else {
		history.pushState({}, '', url);
	}
	dispatch();
}

function matchRoute(pathname) {
	for (const r of routeTable) {
		const m = pathname.match(r.regex);
		if (m) {
			const params = {};
			r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1] || ''));
			r.handler(params);
			return true;
		}
	}
	return false;
}

function dispatch() {
	const path = window.location.pathname.replace(/\/+/g, '/').replace(/\/$/, '');
	if (path === '') {
		handlers.landing();
		return;
	}
	if (!matchRoute(path)) {
		// fallback home
		handlers.home();
	}
}

// Handlers (adaptación de la versión Backbone)
const handlers = {
	landing() {
		routerFlag = false;
	},
	home() {
		routerFlag = false;
		const intro = document.querySelector('div.intro');
		if (intro) intro.style.display = 'none';
		setSEO('Home | The Biblical Timeline', 'From the creation of the world to the last-day events of Revelation, the timeline is a comprehensive guide to major Bible events, characters, and prophecies.');
	},
	period({ period }) {
		const map = {
			'first-generation': 0,
			'noah-and-the-flood': 1,
			'the-patriarchs': 2,
			'egypt-to-canaan': 3,
			'the-judges': 4,
			'united-kingdom': 5,
			'divided-kingdom': 6,
			'the-exile': 7,
			'life-of-christ': 8,
			'early-church': 9,
			'middle-ages': 10,
			'reformation': 11,
			'revelation-prophecies': 12
		};
		const idx = map[period];
		if (idx != null) {
			window.offsetLeft = period_offsets[idx][0];
		}
		const intro = document.querySelector('div.intro');
		if (intro) intro.style.display = 'none';
		const landing = document.querySelector('div.landing');
		if (landing) landing.style.display = 'none';
		const timeline = document.querySelector('div.timeline');
		if (timeline) timeline.style.display = 'block';
	},
	event({ slug }) {
		routerFlag = false;
		const intro = document.querySelector('div.intro');
		if (intro) intro.style.display = 'none';
		getEventDetail(slug);
		navigate('event/' + slug, { replace: true });
	},
	offset({ offset }) {
		window.offsetLeft = offset;
	}
};

// Definir rutas
addRoute('home', () => handlers.home());
addRoute('period/:period/:offset', p => { handlers.period(p); handlers.offset(p); });
addRoute('period/:period', p => handlers.period(p));
addRoute('event/:slug', p => handlers.event(p));

// Exponer API similar previa
export const router = { navigate };

window.addEventListener('popstate', dispatch);
// Inicialización diferida tras DOM listo
document.addEventListener('DOMContentLoaded', dispatch);

