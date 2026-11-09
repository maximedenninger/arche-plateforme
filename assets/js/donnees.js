/* =========================================================================
   ARCHE · accès aux données
   Le catalogue (data/catalogue.json) liste tous les lieux, villes, thèmes et
   collectifs. Il reste léger : le contenu détaillé d'une maquette
   (data/pavillons/<code>.json) n'est chargé qu'au moment où on l'ouvre.
   Les événements sont dans data/evenements.json.
   ========================================================================= */
const cache = new Map();
async function charger(url) {
  if (!cache.has(url)) cache.set(url, fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(url); return r.json(); }));
  return cache.get(url);
}

export let CAT = null, EVT = null;
export async function initDonnees() {
  [CAT, EVT] = await Promise.all([charger('data/catalogue.json'), charger('data/evenements.json')]);
  CAT.lieux.forEach(l => { l.slug = l.code.toLowerCase(); l.villeInfo = CAT.villes[l.ville]; l.themeInfo = CAT.themes[l.theme]; l.porteurInfo = CAT.porteurs[l.porteur]; });
  EVT.evenements.forEach(e => { e.villeInfo = CAT.villes[e.ville]; });
  return { CAT, EVT };
}
export const lieu = slug => CAT.lieux.find(l => l.slug === String(slug).toLowerCase());
/* fiche complète d'une maquette explorable (points d'intérêt, galerie…) */
export async function fiche(l) {
  if (!l.fiche) return null;
  const f = await charger(l.fiche);
  return { ...l, ...f, id: l.slug, lieu: l.site };
}
export const galerieSpeculative = () => charger('data/galerie-speculative.json');

/* ---------- chiffres calculés (jamais écrits à la main) ---------- */
export function chiffres() {
  const villes = new Set(CAT.lieux.map(l => l.ville));
  return {
    lieux: CAT.lieux.length,
    explorables: CAT.lieux.filter(l => l.statut === 'explorable').length,
    villes: villes.size,
    evenements: EVT.evenements.filter(e => statutEvt(e) !== 'passe').length,
  };
}

/* ---------- dates ---------- */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const jour = s => { const [a, m, j] = s.split('-').map(Number); return new Date(a, m - 1, j || 1); };
export const moisAnnee = s => { const d = jour(s); return `${MOIS[d.getMonth()]} ${d.getFullYear()}`; };
export function periode(e) {
  const a = jour(e.debut), b = jour(e.fin);
  if (e.debut === e.fin) return `${a.getDate()} ${MOIS[a.getMonth()]} ${a.getFullYear()}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return `${a.getDate()} au ${b.getDate()} ${MOIS[b.getMonth()]} ${b.getFullYear()}`;
  return `${a.getDate()} ${MOIS_C[a.getMonth()]}${a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : ''} au ${b.getDate()} ${MOIS_C[b.getMonth()]} ${b.getFullYear()}`;
}
export const pastille = e => { const a = jour(e.debut); return { j: a.getDate(), m: MOIS_C[a.getMonth()] }; };
export function statutEvt(e, auj = new Date()) {
  const t = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate());
  if (jour(e.fin) < t) return 'passe';
  if (jour(e.debut) <= t) return 'encours';
  return 'avenir';
}
export const evtTries = () => {
  const ordre = { encours: 0, avenir: 1, passe: 2 };
  return [...EVT.evenements].sort((a, b) => ordre[statutEvt(a)] - ordre[statutEvt(b)] || (statutEvt(a) === 'passe' ? b.debut.localeCompare(a.debut) : a.debut.localeCompare(b.debut)));
};
export const evtDuLieu = code => EVT.evenements.filter(e => e.lieux.includes(code) && statutEvt(e) !== 'passe');

/* ---------- distance (bouton « Autour de moi ») ---------- */
export function km(a, b) {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const distanceTexte = d => d < 1 ? `${Math.round(d * 1000)} m` : d < 20 ? `${d.toFixed(1).replace('.', ',')} km` : `${Math.round(d)} km`;

/* ---------- recherche (sans accents, sans majuscules) ---------- */
export const plat = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export function correspond(l, q) {
  if (!q) return true;
  const txt = plat([l.code, l.titre, l.site, l.villeInfo.nom, l.villeInfo.region, l.themeInfo.nom, l.question, l.porteurInfo?.nom].join(' '));
  return plat(q).split(/\s+/).filter(Boolean).every(m => txt.includes(m));
}

/* ---------- agenda : fichier .ics que le téléphone sait ouvrir ---------- */
export function ics({ titre, debut, fin, lieu: ou, texte, url }) {
  const d = s => s.replace(/-/g, '');
  const f = jour(fin); f.setDate(f.getDate() + 1);
  const fin2 = `${f.getFullYear()}${String(f.getMonth() + 1).padStart(2, '0')}${String(f.getDate()).padStart(2, '0')}`;
  const e = s => String(s || '').replace(/[,;\\]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const corps = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ARCHE//FR', 'BEGIN:VEVENT',
    `UID:${d(debut)}-${plat(titre).replace(/\W+/g, '-')}@arche`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d(debut)}`, `DTEND;VALUE=DATE:${fin2}`, `SUMMARY:${e(titre)}`, `LOCATION:${e(ou)}`, `DESCRIPTION:${e(texte + (url ? '\n' + url : ''))}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([corps], { type: 'text/calendar' }));
  a.download = `${plat(titre).replace(/\W+/g, '-')}.ics`; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
