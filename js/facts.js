// facts.js - selección aleatoria de 'Amazing Fact'
import { qsa, hide, show } from './dom.js';
export function randomFact(){
  const facts = qsa('p.amazing-fact');
  if(!facts.length) return;
  const idx = Math.floor(Math.random()*facts.length);
  facts.forEach(f=>hide(f));
  show(facts[idx]);
}
// Exponer global para código legacy
window.randomFact = randomFact;
