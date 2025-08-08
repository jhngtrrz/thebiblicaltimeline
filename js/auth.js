// auth.js - autenticación y favoritos
import { qs, qsa, on, hide, show, html, append } from './dom.js';
import { getEventDetail } from './event-detail.js';
import { showTooltip } from './tooltip.js';

async function fetchJSON(url, params) {
  const u = new URL(url, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u.toString(), { credentials: 'same-origin' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export let currentUser = window.currentUser || 0;

export function setCurrentUser(id) { currentUser = id; window.currentUser = id; }

export async function getFavorites(user_id) {
  const header = qs('div.favorites h4'); if (header) html(header, 'My Favorites');
  const ul = qs('div.favorites ul'); if (ul) html(ul, '');
  if (user_id === 0) return;
  try {
    const data = await fetchJSON('php/get_favorites.php', { user_id });
    const list = Array.isArray(data) ? data : [];
    list.forEach(v => append(ul, `<li data-slug="${v.slug}">${v.title}</li>`));
  } catch (err) { console.error('favorites error', err); }
}

async function signIn(form) {
  const params = new URLSearchParams(new FormData(form));
  try {
    const d = await fetchJSON('php/account.php', Object.fromEntries(params));
    qsa('form.signin span').forEach(hide);
    if (d.success) {
      setCurrentUser(d.user_id);
      const modal = qs('div.account-modal'); if (modal) modal.style.display = 'none';
      const liSignin = qs('div.account li.signin'); if (liSignin) hide(liSignin);
      const liSignout = qs('div.account li.signout'); if (liSignout) show(liSignout);
      form.reset();
      getFavorites(d.user_id);
      showTooltip("You've Signed In");
    } else {
      if (d.email) { const sp = qs('form.signin span.password'); if (sp) show(sp); }
      else { const sp = qs('form.signin span.email'); if (sp) show(sp); }
    }
  } catch (err) { console.error('signin error', err); }
}

async function signOut() {
  try {
    const d = await fetchJSON('php/account.php', { type: 'signout' });
    if (d.success) {
      setCurrentUser(0);
      const liSignin = qs('div.account li.signin'); if (liSignin) show(liSignin);
      const liSignout = qs('div.account li.signout'); if (liSignout) hide(liSignout);
      getFavorites(0);
      showTooltip("You've Signed Out");
    }
  } catch (err) { console.error('signout error', err); }
}

function handleFavoriteToggle(e) {
  e.preventDefault();
  const a = e.currentTarget;
  const event_id = a.getAttribute('data-id');
  if (!currentUser) { showTooltip('Please Sign In to Add Favorite'); return; }
  const removing = a.classList.contains('remove');
  const type = removing ? 'remove' : 'add';
  fetchJSON('php/set_favorites.php', { type, event_id, user_id: currentUser }).then(() => {
    getFavorites(currentUser);
    if (removing) { html(a, 'Add to Favorites'); a.classList.remove('remove'); a.classList.add('add'); showTooltip('Removed from Favorites'); }
    else { html(a, 'Remove Favorite'); a.classList.remove('add'); a.classList.add('remove'); showTooltip('Added to Favorites'); }
  });
}

export function initAuth() {
  const form = qs('form.signin'); if (form) form.addEventListener('submit', e => { e.preventDefault(); signIn(form); });
  const liSignin = qs('div.account li.signin'); if (liSignin) liSignin.addEventListener('click', () => { const modal = qs('div.account-modal'); if (modal) modal.style.display = 'block'; });
  const liSignout = qs('div.account li.signout'); if (liSignout) liSignout.addEventListener('click', signOut);
  const favUl = qs('div.favorites ul'); if (favUl) favUl.addEventListener('click', e => { const li = e.target.closest('li'); if (!li) return; const slug = li.getAttribute('data-slug'); if (slug) getEventDetail(slug); });
  const favBtn = qs('div.detail li.favorites a'); if (favBtn) favBtn.addEventListener('click', handleFavoriteToggle);
  getFavorites(currentUser);
}

window.getFavorites = getFavorites; // legacy
