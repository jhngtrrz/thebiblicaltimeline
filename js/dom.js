// Utilidades DOM modernas para reemplazar jQuery
// Selección
export const qs = (sel, ctx=document) => ctx.querySelector(sel);
export const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Eventos (delegación opcional)
export function on(target, type, selectorOrHandler, handler) {
  if (typeof selectorOrHandler === 'function') {
    target.addEventListener(type, selectorOrHandler);
  } else {
    target.addEventListener(type, e => {
      const potential = e.target.closest(selectorOrHandler);
      if (potential && target.contains(potential)) {
        handler.call(potential, e);
      }
    });
  }
}

// Clases
export const addClass = (el, ...cls) => el.classList.add(...cls);
export const removeClass = (el, ...cls) => el.classList.remove(...cls);
export const toggleClass = (el, cls, force) => el.classList.toggle(cls, force);
export const hasClass = (el, cls) => el.classList.contains(cls);

// Atributos / HTML
export const html = (el, value) => (value === undefined ? el.innerHTML : (el.innerHTML = value));
export const text = (el, value) => (value === undefined ? el.textContent : (el.textContent = value));
export const attr = (el, name, value) => (value === undefined ? el.getAttribute(name) : el.setAttribute(name, value));
export const append = (el, child) => { if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child); else el.appendChild(child); };
export const empty = el => { el.textContent = ''; };

// Mostrar / ocultar
export function show(el, display='block') { el.style.display = display; }
export function hide(el) { el.style.display = 'none'; }
export function isHidden(el) { return el.offsetParent === null || getComputedStyle(el).display === 'none'; }

// Fade (usa CSS transitions dinámicas)
function fade(el, showFlag, duration=300) {
  el.style.transition = `opacity ${duration}ms`;
  if (showFlag) {
    if (isHidden(el)) { el.style.opacity = 0; show(el); }
    requestAnimationFrame(()=>{ el.style.opacity = 1; });
    setTimeout(()=>{ el.style.removeProperty('transition'); el.style.removeProperty('opacity'); }, duration+20);
  } else {
    el.style.opacity = 1;
    requestAnimationFrame(()=>{ el.style.opacity = 0; });
    setTimeout(()=>{ hide(el); el.style.removeProperty('transition'); el.style.removeProperty('opacity'); }, duration+20);
  }
}
export const fadeIn = (el,d=300)=>fade(el,true,d);
export const fadeOut = (el,d=300)=>fade(el,false,d);

// Serializar formulario sencilla (application/x-www-form-urlencoded)
export function serializeForm(form) {
  const params = [];
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
    params.push(encodeURIComponent(el.name)+'='+encodeURIComponent(el.value));
  }
  return params.join('&');
}

// Fetch JSON helper
export async function getJSON(url, params={}) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k,v])=>u.searchParams.append(k,v));
  const res = await fetch(u.toString(), { credentials: 'same-origin' });
  if (!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

export async function request(url, params={}) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k,v])=>u.searchParams.append(k,v));
  const res = await fetch(u.toString(), { credentials: 'same-origin' });
  if (!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

// Delegated click util
export function delegateClick(root, selector, cb) { on(root, 'click', selector, cb); }
