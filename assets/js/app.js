/* =========================================================================
   ARCHE · plateforme web (application d'une seule page, routes après le #)
   #/                        accueil
   #/explorer                catalogue de tous les lieux (recherche, filtres, carte)
   #/carte                   catalogue, vue carte de France
   #/ville/<ville>           les lieux d'une ville
   #/evenements              agenda (en cours, à venir, passés)
   #/evenement/<slug>        un événement
   #/lieu/<code>             un lieu (ex. #/lieu/mtp-01)
   #/lieu/<code>/2 · /3 · /vue · /fin   parcours d'une maquette explorable
   #/accueillir              pour les villes, festivals et lieux culturels
   #/a-propos                la démarche
   Les anciens liens #/p/01 (QR déjà imprimés) redirigent vers #/lieu/mtp-01.
   ========================================================================= */
import { ICONES } from './icones.js';
import { intro, balayage, animer, fondVisible, calme, initParallaxe, initHorizontal } from './anim.js';
import { CAT, EVT, initDonnees, lieu as trouveLieu, fiche, galerieSpeculative, chiffres, moisAnnee, periode, pastille,
  statutEvt, evtTries, evtDuLieu, km, distanceTexte, correspond, ics } from './donnees.js';
import { CARTE as FOND, projeter, FRANCE, VOISINS } from './fond-carte.js';

const app = document.getElementById('app');
const ETAPES = 6;
const MENTION_MAQUETTE = 'Maquettes numériques à l’échelle : les bâtiments ne sont pas représentés à taille réelle.';
const ic = (k, cls = '') => `<svg class="ic ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="miter" aria-hidden="true">${ICONES[k] || ''}</svg>`;
const logo = (cls = 'logo', blanc = false) => `<img class="${cls}" src="assets/logo/ARCHE_logotype_${blanc ? 'white' : 'color'}.svg" alt="ARCHE">`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let modeChoisi = sessionStorage.getItem('arche-mode') || (mobile ? 'ar' : '3d');
const explorables = () => CAT.lieux.filter(l => l.statut === 'explorable');
const lienLieu = l => `#/lieu/${l.slug}`;
const stocke = { lire(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

function barre(retour, droite = '') {
  return `<header class="barre">
    ${retour ? `<a class="btn-icone" href="${retour}" aria-label="Retour">${ic('retour')}</a>` : '<span></span>'}
    <a href="#/" class="logo-lien-barre" aria-label="ARCHE, accueil">${logo()}</a>
    ${droite || burger()}
  </header>`;
}
function progression(n) {
  return `<div class="progression" aria-label="Étape ${n} sur ${ETAPES}">
    <span class="petit">Étape ${n} sur ${ETAPES}</span>
    <ol>${Array.from({ length: ETAPES }, (_, i) => `<li class="${i < n ? 'fait' : ''}"></li>`).join('')}</ol>
  </div>`;
}
/* ---------- galeries d'images (glisser, puces, plein écran) ---------- */
function galerie(items, titre = 'Images d’ambiance') {
  return `<section class="galerie" data-galerie aria-label="${esc(titre)}">
    <div class="galerie-tete"><span class="surtitre" style="margin:0">${esc(titre)}</span><span class="petit compte">1 / ${items.length}</span></div>
    <div class="piste">${items.map((g, i) => `
      <figure class="diapo">
        <button class="zoom" type="button" data-i="${i}" aria-label="Agrandir : ${esc(g.legende)}">
          <img src="${g.image}" alt="${esc(g.legende)}" loading="lazy"><span class="agrandir">${ic('plein_ecran')}</span>
        </button>
        <figcaption><b>${String(i + 1).padStart(2, '0')}</b>${esc(g.legende)}</figcaption>
      </figure>`).join('')}</div>
    <div class="puces">${items.map((_, i) => `<button type="button" data-k="${i}" aria-label="Image ${i + 1}"${i ? '' : ' aria-current="true"'}></button>`).join('')}</div>
  </section>`;
}
function initGaleries(racine, listes) {
  racine.querySelectorAll('[data-galerie]').forEach((g, n) => {
    const piste = g.querySelector('.piste'), puces = [...g.querySelectorAll('.puces button')], compte = g.querySelector('.compte');
    const items = listes[n];
    const actif = () => {
      const k = Math.round(piste.scrollLeft / (piste.firstElementChild.offsetWidth + 12));
      puces.forEach((b, i) => b.toggleAttribute('aria-current', i === k)); compte.textContent = `${k + 1} / ${puces.length}`;
    };
    piste.addEventListener('scroll', () => requestAnimationFrame(actif), { passive: true });
    puces.forEach(b => b.addEventListener('click', () => piste.children[+b.dataset.k].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })));
    g.querySelectorAll('.zoom').forEach(b => b.addEventListener('click', () => pleinEcran(items, +b.dataset.i)));
  });
}
function pleinEcran(items, k) {
  const v = document.createElement('div'); v.className = 'visionneuse'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Image en grand');
  const montre = () => {
    v.innerHTML = `<img src="${items[k].image}" alt="${esc(items[k].legende)}">
      <p><b>${String(k + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}</b>${esc(items[k].legende)}<br><span>Image d'ambiance du projet</span></p>
      <button class="btn-rond fermer" aria-label="Fermer">${ic('fermer')}</button>
      ${items.length > 1 ? `<button class="btn-rond prec" aria-label="Image précédente">${ic('retour')}</button><button class="btn-rond suiv" aria-label="Image suivante">${ic('suivant')}</button>` : ''}`;
    v.querySelector('.fermer').onclick = ferme;
    v.querySelector('.prec') && (v.querySelector('.prec').onclick = () => { k = (k + items.length - 1) % items.length; montre(); });
    v.querySelector('.suiv') && (v.querySelector('.suiv').onclick = () => { k = (k + 1) % items.length; montre(); });
  };
  const clavier = e => { if (e.key === 'Escape') ferme(); if (e.key === 'ArrowRight') v.querySelector('.suiv')?.click(); if (e.key === 'ArrowLeft') v.querySelector('.prec')?.click(); };
  let x0 = null;
  v.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  v.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) v.querySelector(dx < 0 ? '.suiv' : '.prec')?.click(); x0 = null; });
  function ferme() { removeEventListener('keydown', clavier); v.classList.add('sort'); setTimeout(() => v.remove(), 250); }
  addEventListener('keydown', clavier);
  montre(); document.body.appendChild(v);
}

/* ---------- mémorisé sur l'appareil uniquement : progression des visites, lieux suivis, position ---------- */
const ORDRE = { '': 1, '2': 2, '3': 3, 'vue': 4, 'fin': 6 };
const lireProgres = () => stocke.lire('arche-progres-v2', {});
function noterProgres(id, etape) {
  const pr = lireProgres(), n = ORDRE[etape || ''] || 1, cur = pr[id] || { max: 0, etape: '' };
  if (n >= cur.max) { cur.max = n; cur.etape = etape || ''; }
  if (n === 6) cur.fini = true;
  pr[id] = cur; stocke.ecrire('arche-progres-v2', pr);
}
const suivis = () => stocke.lire('arche-suivis', []);
const estSuivi = code => suivis().includes(code);
function basculerSuivi(code) {
  const s = suivis(), i = s.indexOf(code);
  if (i < 0) s.push(code); else s.splice(i, 1);
  stocke.ecrire('arche-suivis', s); return i < 0;
}
let maPosition = null;   // jamais envoyée : sert seulement à trier les lieux par distance, sur l'appareil
function localiser() {
  return new Promise((ok, ko) => {
    if (!navigator.geolocation) return ko(new Error('indispo'));
    navigator.geolocation.getCurrentPosition(p => { maPosition = { lat: p.coords.latitude, lon: p.coords.longitude }; ok(maPosition); }, ko, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });
}

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
async function partager(titre, texte, hash) {
  const url = location.href.replace(/#.*$/, hash);
  try {
    if (navigator.share) await navigator.share({ title: titre, text: texte, url });
    else { await navigator.clipboard.writeText(url); toast('Lien copié'); }
  } catch (e) {}
}

/* ---------------------------------------------------------------- menu (burger) */
let ancreEnAttente = null;
function ouvrirMenu() {
  const c = chiffres();
  const MENU = [
    ['Accueil', '#/', ''], ['Explorer les lieux', '#/explorer', `${c.lieux}`], ['Carte de France', '#/carte', `${c.villes} villes`],
    ['Événements', '#/evenements', `${c.evenements}`], ['Accueillir ARCHE', '#/accueillir', ''], ['La démarche', '#/a-propos', ''],
  ];
  const m = document.createElement('nav'); m.className = 'menu'; m.setAttribute('aria-label', 'Menu');
  m.innerHTML = `<div class="menu-haut">${logo('logo', true)}<button class="btn-icone menu-fermer" aria-label="Fermer le menu">${ic('fermer')}</button></div>
    <ul>${MENU.map(([l, h, n], k) => `<li style="--k:${k}"><a href="${h}"><span class="num">${String(k + 1).padStart(2, '0')}</span>${esc(l)}${n ? `<small class="menu-compte">${n}</small>` : ''}${ic('suivant')}</a></li>`).join('')}</ul>
    <p class="menu-sous">Explorables maintenant</p>
    <ul class="menu-liste">${explorables().map((l, k) => `<li class="sous" style="--k:${k + MENU.length}"><a href="${lienLieu(l)}"><span class="code">${l.code}</span>${esc(l.titre)}${ic('suivant')}</a></li>`).join('')}</ul>
    <p class="petit">${esc(MENTION_MAQUETTE)}</p>`;
  const ferme = () => { m.classList.add('sort'); document.body.classList.remove('menu-ouvert'); setTimeout(() => m.remove(), 300); };
  m.querySelector('.menu-fermer').onclick = ferme;
  m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ferme()));
  addEventListener('keydown', function esc_(e) { if (e.key === 'Escape') { ferme(); removeEventListener('keydown', esc_); } });
  document.body.appendChild(m); document.body.classList.add('menu-ouvert');
}
const burger = (clair = false) => `<button class="btn-icone burger ${clair ? 'sur-image' : ''}" data-menu aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>`;

/* ---------------------------------------------------------------- briques réutilisées */
const pastilleStatut = l => `<span class="statut-l s-${l.statut}">${l.statut === 'bientot' ? `${CAT.statuts.bientot.nom} · ${moisAnnee(l.ouverture)}` : CAT.statuts[l.statut].nom}</span>`;
function carteLieu(l, { compacte = false } = {}) {
  const pr = lireProgres()[l.slug];
  const d = maPosition ? km(maPosition, l) : null;
  const action = l.statut === 'explorable' ? (pr && !pr.fini && pr.max > 1 ? `Reprendre à l'étape ${pr.max}` : pr?.fini ? 'Revoir la maquette' : 'Explorer la maquette') : 'Voir le projet';
  const href = l.statut === 'explorable' && pr && !pr.fini && pr.max > 1 ? `${lienLieu(l)}/${pr.etape}` : lienLieu(l);
  if (compacte) return `<a class="ligne-lieu" href="${href}">
      <span class="ligne-img"><img src="${l.image}" alt="" loading="lazy"></span>
      <span class="ligne-corps"><span class="code">${l.code}</span>${pastilleStatut(l)}
        <b>${esc(l.titre)}</b><small>${esc(l.villeInfo.nom)} · ${esc(l.site)}${d != null ? ` · ${distanceTexte(d)}` : ''}</small></span>
      ${ic('suivant')}</a>`;
  return `<a class="carte carte-lieu" href="${href}">
    <div class="carte-img"><img src="${l.image}" alt="" loading="lazy"><span class="code-img">${l.code}</span>${pastilleStatut(l)}${estSuivi(l.code) ? `<span class="suivi-img" aria-label="Suivi">${ic('valide')}</span>` : ''}</div>
    <div class="corps">
      <span class="numero">${esc(l.villeInfo.nom)} · ${esc(l.site)}${d != null ? ` · <b>${distanceTexte(d)}</b>` : ''}</span>
      <h3>${esc(l.titre)}</h3>
      <p class="texte" style="margin:0">${esc(l.question)}</p>
      <p class="theme-l">${ic(l.themeInfo.icone)}${esc(l.themeInfo.nom)}<span>·</span>${esc(l.porteurInfo?.nom || '')}</p>
      ${pr?.fini ? `<span class="statut">${ic('valide')}Maquette déjà explorée</span>` : ''}
      <div class="action"><span>${action}</span>${ic('suivant')}</div>
    </div>
  </a>`;
}
function ligneEvt(e) {
  const s = statutEvt(e), p = pastille(e);
  return `<a class="ligne-evt ${s}" href="#/evenement/${e.slug}">
    <span class="date-evt"><b>${p.j}</b>${p.m}</span>
    <span class="ligne-corps">${s === 'encours' ? '<span class="statut-l s-encours">En ce moment</span>' : s === 'passe' ? '<span class="statut-l s-passe">Terminé</span>' : ''}
      <b>${esc(e.titre)}</b><small>${esc(e.type)} · ${esc(e.villeInfo.nom)} · ${periode(e)}</small></span>
    ${ic('suivant')}</a>`;
}
/* carte de France : une épingle par ville, avec le nombre de lieux */
function carteFrance({ ville = null, petite = false } = {}) {
  const parVille = {};
  CAT.lieux.forEach(l => { (parVille[l.ville] ||= []).push(l); });
  const pins = Object.entries(parVille).map(([v, ls]) => {
    const info = CAT.villes[v], [x, y] = projeter(info.lat, info.lon), expl = ls.some(l => l.statut === 'explorable');
    return `<button type="button" class="pin ${expl ? 'expl' : ''} ${ville === v ? 'actif' : ''}" data-ville="${v}" style="left:${x}%;top:${(y / FOND.H) * 100}%"
      aria-label="${esc(info.nom)} : ${ls.length} lieu${ls.length > 1 ? 'x' : ''}${expl ? ', dont des maquettes explorables' : ''}"><b>${ls.length}</b><span>${esc(info.nom)}</span></button>`;
  }).join('');
  const moi = maPosition ? (() => { const [x, y] = projeter(maPosition.lat, maPosition.lon); return x > 0 && x < 100 && y > 0 && y < FOND.H ? `<span class="moi" style="left:${x}%;top:${(y / FOND.H) * 100}%" aria-label="Ta position"></span>` : ''; })() : '';
  return `<div class="france ${petite ? 'petite' : ''}" style="aspect-ratio:100/${FOND.H}">
    <svg viewBox="0 0 100 ${FOND.H}" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><path class="voisins" d="${VOISINS}"/><path class="pays" d="${FRANCE}"/></svg>
    ${pins}${moi}
    <span class="legende-carte"><i class="l-expl"></i>Maquettes explorables <i></i>Bientôt</span>
  </div>`;
}

/* ---------------------------------------------------------------- accueil */
function vueAccueil() {
  document.title = 'ARCHE · Architectures des futurs possibles';
  const c = chiffres(), aVenir = evtTries().filter(e => statutEvt(e) !== 'passe').slice(0, 3), bientot = CAT.lieux.filter(l => l.statut === 'bientot').sort((a, b) => a.ouverture.localeCompare(b.ouverture));
  app.innerHTML = `
  <header class="barre-accueil" id="barreAccueil">
    <a href="#/" class="logo-lien" aria-label="ARCHE, accueil">${logo('logo-c clair', true)}${logo('logo-c fonce')}</a>
    ${burger(true)}
  </header>
  <section class="hero-par" id="hero" aria-label="ARCHE">
    <div class="couches" aria-hidden="true">
      <div class="couche" data-v="0.08"><img src="assets/img/parallaxe/couche_0.webp" alt=""></div>
      <div class="couche" data-v="0.18"><img src="assets/img/parallaxe/couche_1.webp" alt=""></div>
      <div class="couche mot-geant" data-v="0.28"><img src="assets/logo/ARCHE_logotype_white.svg" alt=""></div>
      <div class="couche flotte lent" data-v="0.34"><img src="assets/img/parallaxe/couche_2.webp" alt=""></div>
      <div class="couche flotte" data-v="0.5"><img src="assets/img/parallaxe/couche_3.webp" alt=""></div>
      <div class="couche" data-v="0.68"><img src="assets/img/parallaxe/couche_4.webp" alt=""></div>
      <div class="couche premier" data-v="1"><img src="assets/img/parallaxe/couche_5.webp" alt=""></div>
    </div>
    <div class="hero-texte">
      <p class="surtitre">Architectures des futurs possibles</p>
      <h1 class="titre">Les villes de demain, à explorer en maquette</h1>
      <div class="hero-actions">
        <a class="btn btn--jaune" href="#/explorer">Explorer les lieux ${ic('suivant')}</a>
        <button class="btn btn--verre" data-aller="projet">C'est quoi ARCHE ?</button>
      </div>
    </div>
    <button class="defiler" data-aller="projet" aria-label="Descendre vers la présentation"><span></span>Défiler</button>
  </section>

  <main class="ecran accueil">
    <section class="bloc" id="projet">
      <p class="surtitre">ARCHE</p>
      <h2 class="titre manifeste">L'architecture de demain s'imagine aujourd'hui. <em>ARCHE la rend visible.</em></h2>
      <p class="texte">Des collectifs d'architectes imaginent des villes suspendues, des serres habitées, des quartiers en terre crue. Ces <b>architectures spéculatives</b> ne sont pas faites pour être construites demain : elles posent une question sur notre façon d'habiter.</p>
      <p class="texte">ARCHE les installe partout en France, à l'endroit même qu'elles imaginent transformer : sur une place, dans une gare, pendant un festival. On scanne, on explore la maquette sur son téléphone, on se fait son avis.</p>
      <ul class="chiffres">
        <li><b>${c.lieux}</b><span>lieux imaginés</span></li>
        <li><b>${c.villes}</b><span>villes en France</span></li>
        <li><b>${c.explorables}</b><span>maquettes à explorer</span></li>
      </ul>
    </section>

    <section class="bloc" id="carte">
      <p class="surtitre">Partout en France</p>
      <h2 class="titre-2">Trouve un lieu près de chez toi</h2>
      <p class="texte">Touche une ville pour voir ses lieux. Les épingles jaunes ont déjà une maquette à explorer.</p>
      ${carteFrance({ petite: true })}
      <div class="rang-btn">
        <a class="btn" href="#/carte">Ouvrir la carte ${ic('carte')}</a>
        <button class="btn btn--contour" id="autour">Autour de moi ${ic('localisation')}</button>
      </div>
    </section>

    <section class="bloc" id="explorables">
      <div class="tete-section"><div><p class="surtitre">À explorer maintenant</p><h2 class="titre-2">Maquettes en ligne</h2></div><a class="lien-fleche" href="#/explorer?statut=explorable">Tout voir ${ic('suivant')}</a></div>
      <div class="defile">${explorables().map(l => carteLieu(l)).join('')}</div>
    </section>

    <section class="bloc" id="agenda">
      <div class="tete-section"><div><p class="surtitre">Agenda</p><h2 class="titre-2">ARCHE près de toi</h2></div><a class="lien-fleche" href="#/evenements">L'agenda ${ic('suivant')}</a></div>
      <div class="liste-evt">${aVenir.map(ligneEvt).join('')}</div>
    </section>

    <section class="horizontal" data-h aria-label="L'architecture spéculative en 3 idées">
      <div class="h-collant">
        <div class="h-tete"><p class="surtitre">L'architecture spéculative</p><h2 class="titre-2">En 3 idées</h2></div>
        <div class="h-piste">
          ${[['05_tours_organiques', 'lumiere', '01', 'Imaginer', 'Dessiner un futur possible : plus vert, plus dense, plus juste.'],
             ['02_ville_vegetale_vue_du_ciel', 'aide', '02', 'Questionner', 'Partir d’un enjeu d’aujourd’hui : climat, logement, ressources.'],
             ['07_tour_en_bois_couverte_d_arbres', 'maquette', '03', 'Explorer', 'Tourner autour d’une maquette pour comprendre, puis se faire son avis.']]
            .map(([img, ico, n, t, d]) => `<article class="h-panneau"><img src="assets/img/galerie/${img}.webp" alt="" loading="lazy"><div class="h-texte"><span class="h-num">${n}</span>${ic(ico)}<h3>${t}</h3><p>${d}</p></div></article>`).join('')}
        </div>
        <div class="h-barre" aria-hidden="true"><i></i></div>
      </div>
    </section>

    <section class="bloc" id="bientot">
      <div class="tete-section"><div><p class="surtitre">Bientôt</p><h2 class="titre-2">Les prochaines ouvertures</h2></div><a class="lien-fleche" href="#/explorer?statut=bientot">Tout voir ${ic('suivant')}</a></div>
      <div class="liste-lieux">${bientot.slice(0, 4).map(l => carteLieu(l, { compacte: true })).join('')}</div>
    </section>

    <section class="horizontal" id="comment" data-h aria-label="Comment ça marche">
      <div class="h-collant">
        <div class="h-tete"><p class="surtitre">Comment ça marche</p><h2 class="titre-2">Une visite en 4 gestes</h2></div>
        <div class="h-piste">
          ${[['supports/plaque', '01', 'Repère une plaque ARCHE', 'Sur un mur de la ville ou sur un stand, scanne le QR code avec l’appareil photo.'],
             ['galerie/10_au_dessus_des_nuages', '02', 'Découvre la question', 'Chaque lieu pose un « Et si… » : et si cette place s’élevait au-dessus des nuages ?'],
             ['mode_ar', '03', 'Explore la maquette', 'En 3D ou en réalité augmentée, avec 3 points d’intérêt : l’échelle, l’usage, le message.'],
             ['galerie/21_maquette_et_hologramme', '04', 'Fais-toi ton avis', 'Retiens l’essentiel en une synthèse, puis trouve le lieu suivant sur la carte.']]
            .map(([img, n, t, d]) => `<article class="h-panneau etape"><img src="assets/img/${img}.webp" alt="" loading="lazy"><div class="h-texte"><span class="h-num grand">${n}</span><h3>${t}</h3><p>${d}</p></div></article>`).join('')}
        </div>
        <div class="h-barre" aria-hidden="true"><i></i></div>
      </div>
    </section>
    <section class="horizontal sombre" id="supports" data-h aria-label="Nos dispositifs">
      <div class="h-collant">
        <div class="h-tete"><p class="surtitre">Nos dispositifs</p><h2 class="titre-2">Quatre façons de rencontrer ARCHE</h2></div>
        <div class="h-piste">
          ${[['plateforme', '01', 'La plateforme web', 'Tous les lieux, la carte et les maquettes à explorer en 3D ou en réalité augmentée, sans application.'],
             ['ecran', '02', 'L’écran à parallaxe', 'Un écran qui suit le regard : vu de gauche, le lieu d’aujourd’hui ; vu de droite, sa version utopique.'],
             ['depliant', '03', 'Le dépliant', 'À emporter : les lieux de la ville, la carte et ce qu’est l’architecture spéculative.'],
             ['plaque', '04', 'Les plaques QR', 'Posées sur les lieux eux-mêmes, elles ouvrent le projet qui les transforme.']]
            .map(([k, n, t, d]) => `<article class="h-panneau support-h"><img src="assets/img/supports/${k}.webp" alt="${esc(t)}" loading="lazy"><div class="h-texte"><span class="h-num">${n}</span><h3>${t}</h3><p>${d}</p></div></article>`).join('')}
        </div>
        <div class="h-barre" aria-hidden="true"><i></i></div>
      </div>
    </section>

    <section class="bloc" id="accueillir">
      <div class="final">
        <p class="surtitre" style="color:var(--jaune)">Villes, festivals, lieux culturels</p>
        <p class="titre-2">Accueillir ARCHE chez vous</p>
        <p class="texte" style="color:#d6dccf">Un lieu de votre ville mérite son futur ? Plaques sur site, stand pour un événement ou écran à parallaxe : on vous explique comment ça se passe.</p>
        <a class="btn" href="#/accueillir">Découvrir les formules ${ic('suivant')}</a>
      </div>
    </section>

    ${pied()}
  </main>`;
  app.querySelectorAll('[data-aller]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.aller)?.scrollIntoView({ behavior: 'smooth' })));
  app.querySelectorAll('.france .pin').forEach(b => b.addEventListener('click', () => { location.hash = `#/ville/${b.dataset.ville}`; }));
  document.getElementById('autour').addEventListener('click', async () => {
    try { await localiser(); location.hash = '#/explorer?tri=distance'; } catch (e) { toast('Position indisponible : autorise la localisation, ou choisis une ville sur la carte.'); }
  });
  initParallaxe(document.getElementById('hero'), document.getElementById('barreAccueil'));
  initHorizontal(app);
  if (ancreEnAttente) { const an = ancreEnAttente; ancreEnAttente = null; setTimeout(() => document.getElementById(an)?.scrollIntoView({ behavior: 'smooth' }), 400); }
}
function pied() {
  return `<footer class="pied">
    ${logo('logo-pied')}
    <nav class="plan-site" aria-label="Plan du site">
      <a href="#/explorer">Explorer</a><a href="#/carte">Carte</a><a href="#/evenements">Événements</a><a href="#/accueillir">Accueillir ARCHE</a><a href="#/a-propos">La démarche</a>
    </nav>
    <p class="petit">Architectures des futurs possibles · France · catalogue ${esc(CAT.version)}. Aucune application à installer, aucune donnée personnelle enregistrée.</p>
    <p class="petit">${esc(MENTION_MAQUETTE)}</p>
  </footer>`;
}

/* ---------------------------------------------------------------- catalogue : recherche, filtres, carte */
function lireFiltres() {
  const q = new URLSearchParams((location.hash.split('?')[1]) || '');
  return { q: q.get('q') || '', statut: q.get('statut') || '', theme: q.get('theme') || '', ville: q.get('ville') || '', vue: q.get('vue') || 'liste', tri: q.get('tri') || '', suivis: q.get('suivis') === '1' };
}
function vueExplorer(preset = {}) {
  const f = { ...lireFiltres(), ...preset };
  const parVille = preset.ville && CAT.villes[preset.ville];
  document.title = parVille ? `ARCHE · ${parVille.nom}` : 'ARCHE · Explorer les lieux';
  const regions = {};
  Object.entries(CAT.villes).forEach(([k, v]) => { if (CAT.lieux.some(l => l.ville === k)) (regions[v.region] ||= []).push([k, v.nom]); });
  const evtsVille = parVille ? EVT.evenements.filter(e => e.ville === preset.ville && statutEvt(e) !== 'passe') : [];
  app.innerHTML = `<main class="ecran large">
    ${barre(parVille ? '#/carte' : '#/')}
    <p class="surtitre">${parVille ? esc(parVille.region) : 'Catalogue'}</p>
    <h1 class="titre">${parVille ? esc(parVille.nom) : 'Explorer les lieux'}</h1>
    ${parVille ? '' : `<label class="recherche">${ic('rechercher')}<input type="search" id="q" placeholder="Ville, lieu, thème, code…" value="${esc(f.q)}" autocomplete="off" enterkeyhint="search" aria-label="Rechercher un lieu"></label>`}
    <div class="outils-cat">
      <div class="bascule" role="group" aria-label="Affichage">
        <button type="button" data-vue="liste" aria-pressed="${f.vue !== 'carte'}">${ic('liste')}Liste</button>
        <button type="button" data-vue="carte" aria-pressed="${f.vue === 'carte'}">${ic('carte')}Carte</button>
      </div>
      <button type="button" class="chip-btn" id="pres" aria-pressed="${f.tri === 'distance'}">${ic('localisation')}Autour de moi</button>
    </div>
    <div class="chips" role="group" aria-label="Statut">
      ${[['', 'Tous'], ['explorable', 'Explorables'], ['bientot', 'Ouverture prévue'], ['creation', 'En création']].map(([k, l]) => `<button type="button" class="chip" data-statut="${k}" aria-pressed="${f.statut === k}">${l}</button>`).join('')}
      <button type="button" class="chip" id="suivis" aria-pressed="${f.suivis}">${ic('valide')}Suivis</button>
    </div>
    <div class="chips defile-x" role="group" aria-label="Thème">
      ${Object.entries(CAT.themes).map(([k, t]) => `<button type="button" class="chip" data-theme="${k}" aria-pressed="${f.theme === k}">${ic(t.icone)}${esc(t.nom)}</button>`).join('')}
    </div>
    ${parVille ? '' : `<label class="select-ville">${ic('localisation')}<select id="ville" aria-label="Ville">
      <option value="">Toutes les villes</option>
      ${Object.entries(regions).sort().map(([r, vs]) => `<optgroup label="${esc(r)}">${vs.map(([k, n]) => `<option value="${k}" ${f.ville === k ? 'selected' : ''}>${esc(n)}</option>`).join('')}</optgroup>`).join('')}
    </select></label>`}
    <div id="vue-carte" ${f.vue === 'carte' ? '' : 'hidden'}></div>
    <p class="compte-res" id="compte" aria-live="polite"></p>
    <div id="res" class="grille-lieux"></div>
    ${evtsVille.length ? `<p class="surtitre" style="margin-top:28px">À ${esc(parVille.nom)} prochainement</p><div class="liste-evt">${evtsVille.map(ligneEvt).join('')}</div>` : ''}
    ${parVille ? `<a class="btn btn--contour" style="margin-top:24px" href="#/explorer">Voir toutes les villes ${ic('carte')}</a>` : ''}
    ${pied()}
  </main>`;
  const res = document.getElementById('res'), compte = document.getElementById('compte'), vc = document.getElementById('vue-carte');
  const majURL = () => {
    if (parVille) return;
    const p = new URLSearchParams();
    for (const k of ['q', 'statut', 'theme', 'ville', 'tri']) if (f[k]) p.set(k, f[k]);
    if (f.vue === 'carte') p.set('vue', 'carte'); if (f.suivis) p.set('suivis', '1');
    const s = p.toString(); history.replaceState(null, '', `#/${f.vue === 'carte' && !s.replace('vue=carte', '').replace(/^&|&$/g, '') ? 'carte' : 'explorer' + (s ? '?' + s : '')}`);
  };
  const dessine = () => {
    let ls = CAT.lieux.filter(l => correspond(l, f.q) && (!f.statut || l.statut === f.statut) && (!f.theme || l.theme === f.theme) && (!f.ville || l.ville === f.ville) && (!f.suivis || estSuivi(l.code)));
    const ordre = { explorable: 0, bientot: 1, creation: 2 };
    if (f.tri === 'distance' && maPosition) ls.sort((a, b) => km(maPosition, a) - km(maPosition, b));
    else ls.sort((a, b) => ordre[a.statut] - ordre[b.statut] || (a.ouverture || '').localeCompare(b.ouverture || '') || a.code.localeCompare(b.code));
    compte.textContent = ls.length ? `${ls.length} lieu${ls.length > 1 ? 'x' : ''}${f.tri === 'distance' && maPosition ? ', du plus proche au plus loin' : ''}` : '';
    res.innerHTML = ls.length ? ls.map(l => carteLieu(l)).join('')
      : `<div class="vide">${ic('rechercher')}<b>Aucun lieu ne correspond</b><p>Essaie un autre mot, ou retire un filtre.</p><button class="btn btn--contour" id="raz">Tout afficher</button></div>`;
    document.getElementById('raz')?.addEventListener('click', () => { Object.assign(f, { q: '', statut: '', theme: '', ville: preset.ville || '', suivis: false }); const qi = document.getElementById('q'); if (qi) qi.value = ''; const sv = document.getElementById('ville'); if (sv) sv.value = ''; syncChips(); dessine(); });
    if (f.vue === 'carte') {
      vc.innerHTML = carteFrance({ ville: f.ville });
      vc.querySelectorAll('.pin').forEach(b => b.addEventListener('click', () => {
        if (parVille) { location.hash = `#/ville/${b.dataset.ville}`; return; }
        f.ville = f.ville === b.dataset.ville ? '' : b.dataset.ville; const sv = document.getElementById('ville'); if (sv) sv.value = f.ville; dessine();
        if (f.ville) compte.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
    }
    animer(res); majURL();
  };
  const syncChips = () => {
    app.querySelectorAll('[data-statut]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.statut === f.statut)));
    app.querySelectorAll('[data-theme]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === f.theme)));
    app.querySelectorAll('[data-vue]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vue === f.vue)));
    document.getElementById('suivis').setAttribute('aria-pressed', String(f.suivis));
    document.getElementById('pres').setAttribute('aria-pressed', String(f.tri === 'distance'));
    vc.hidden = f.vue !== 'carte';
  };
  let t = 0;
  document.getElementById('q')?.addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { f.q = e.target.value.trim(); dessine(); }, 160); });
  document.getElementById('ville')?.addEventListener('change', e => { f.ville = e.target.value; dessine(); });
  app.querySelectorAll('[data-statut]').forEach(b => b.addEventListener('click', () => { f.statut = b.dataset.statut; syncChips(); dessine(); }));
  app.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { f.theme = f.theme === b.dataset.theme ? '' : b.dataset.theme; syncChips(); dessine(); }));
  app.querySelectorAll('[data-vue]').forEach(b => b.addEventListener('click', () => { f.vue = b.dataset.vue; syncChips(); dessine(); }));
  document.getElementById('suivis').addEventListener('click', () => { f.suivis = !f.suivis; syncChips(); dessine(); });
  document.getElementById('pres').addEventListener('click', async () => {
    if (f.tri === 'distance') { f.tri = ''; syncChips(); dessine(); return; }
    const b = document.getElementById('pres'); b.classList.add('attente');
    try { await localiser(); f.tri = 'distance'; } catch (e) { toast('Position indisponible : autorise la localisation dans les réglages du navigateur.'); }
    b.classList.remove('attente'); syncChips(); dessine();
  });
  if (f.tri === 'distance' && !maPosition) localiser().then(dessine).catch(() => { f.tri = ''; syncChips(); dessine(); });
  dessine();
}

/* ---------------------------------------------------------------- un lieu pas encore explorable */
function vueProjet(l) {
  document.title = `ARCHE · ${l.titre}`;
  const evts = evtDuLieu(l.code), autres = CAT.lieux.filter(x => x.ville === l.ville && x !== l), maquettes = explorables().slice(0, 2);
  const s = CAT.statuts[l.statut];
  app.innerHTML = `<main class="ecran">
    ${barre('#/explorer')}
    <div class="arche-img">
      <img src="${l.image}" alt="Image d'ambiance du projet ${esc(l.titre)}">
      <span class="badge">${ic('maquette')}${l.code}</span>
    </div>
    <p class="surtitre" style="margin-top:22px">${esc(l.villeInfo.nom)} · ${esc(l.site)}</p>
    <h1 class="titre">${esc(l.titre)}</h1>
    <div class="bandeau-statut s-${l.statut}">
      ${ic(l.statut === 'bientot' ? 'agenda' : 'lumiere')}
      <div><b>${l.statut === 'bientot' ? `Ouverture prévue en ${moisAnnee(l.ouverture)}` : s.nom}</b><span>${l.statut === 'bientot' ? 'La maquette est en cours de finition : elle sera explorable sur place et ici.' : `${esc(l.porteurInfo.nom)} imagine encore ce lieu. Suis le projet pour le retrouver dès qu'il avance.`}</span></div>
    </div>
    <p class="texte" style="margin-top:18px"><b style="color:var(--vert)">${esc(l.question)}</b> ${esc(l.accroche)}</p>
    <ul class="fiche-infos">
      <li><span>Thème</span><b>${ic(l.themeInfo.icone)}${esc(l.themeInfo.nom)}</b></li>
      <li><span>Imaginé par</span><b>${esc(l.porteurInfo.nom)}</b></li>
      <li><span>Lieu réel</span><b>${esc(l.site)}, ${esc(l.villeInfo.nom)}</b></li>
      <li><span>Code de la plaque</span><b class="code">${l.code}</b></li>
    </ul>
    <div class="rang-btn">
      <button class="btn" id="suivre" aria-pressed="${estSuivi(l.code)}"></button>
      ${l.statut === 'bientot' ? `<button class="btn btn--contour" id="agenda">Ajouter l'ouverture à mon agenda ${ic('agenda')}</button>` : ''}
      <button class="btn btn--contour" id="partager">Partager ${ic('partager')}</button>
    </div>
    <p class="mention">« Suivre » garde ce lieu dans ta liste, sur ce téléphone seulement.</p>
    ${evts.length ? `<p class="surtitre" style="margin-top:30px">Présenté pendant</p><div class="liste-evt">${evts.map(ligneEvt).join('')}</div>` : ''}
    ${autres.length ? `<p class="surtitre" style="margin-top:30px">Aussi à ${esc(l.villeInfo.nom)}</p><div class="liste-lieux">${autres.map(x => carteLieu(x, { compacte: true })).join('')}</div>` : ''}
    <p class="surtitre" style="margin-top:30px">À explorer dès maintenant</p>
    <div class="liste-lieux">${maquettes.map(x => carteLieu(x, { compacte: true })).join('')}</div>
    ${pied()}
  </main>`;
  const bs = document.getElementById('suivre');
  const maj = () => { const on = estSuivi(l.code); bs.setAttribute('aria-pressed', on); bs.className = on ? 'btn btn--contour' : 'btn'; bs.innerHTML = on ? `Suivi ${ic('valide')}` : `Suivre ce projet ${ic('ajouter')}`; };
  bs.addEventListener('click', () => { toast(basculerSuivi(l.code) ? 'Ajouté à tes lieux suivis' : 'Retiré de tes lieux suivis'); maj(); }); maj();
  document.getElementById('agenda')?.addEventListener('click', () => ics({ titre: `ARCHE · ${l.titre} (${l.code})`, debut: `${l.ouverture}-01`, fin: `${l.ouverture}-01`, lieu: `${l.site}, ${l.villeInfo.nom}`, texte: `Ouverture prévue de la maquette « ${l.titre} ». ${l.question}`, url: location.href }));
  document.getElementById('partager').addEventListener('click', () => partager(`ARCHE · ${l.titre}`, l.question, lienLieu(l)));
}

/* ---------------------------------------------------------------- agenda */
function vueEvenements() {
  document.title = 'ARCHE · Événements';
  const liste = evtTries(), groupes = [['encours', 'En ce moment'], ['avenir', 'À venir'], ['passe', 'Passés']];
  app.innerHTML = `<main class="ecran">
    ${barre('#/')}
    <p class="surtitre">Agenda</p>
    <h1 class="titre">Les événements ARCHE</h1>
    <p class="texte">Parcours en ville, festivals, salons : là où ARCHE installe ses plaques, son stand ou son écran à parallaxe.</p>
    ${groupes.map(([k, t]) => { const es = liste.filter(e => statutEvt(e) === k); return es.length ? `<p class="surtitre" style="margin-top:22px">${t}</p><div class="liste-evt">${es.map(ligneEvt).join('')}</div>` : ''; }).join('')}
    <a class="btn btn--contour" style="margin-top:28px" href="#/accueillir">Organiser un événement avec ARCHE ${ic('suivant')}</a>
    ${pied()}
  </main>`;
}
function vueEvenement(e) {
  document.title = `ARCHE · ${e.titre}`;
  const s = statutEvt(e), ls = e.lieux.map(c => trouveLieu(c)).filter(Boolean);
  app.innerHTML = `<main class="ecran">
    ${barre('#/evenements')}
    <div class="arche-img"><img src="${e.image}" alt=""><span class="badge">${ic('agenda')}${esc(e.type)}</span></div>
    <p class="surtitre" style="margin-top:22px">${esc(e.villeInfo.nom)} · ${periode(e)}</p>
    <h1 class="titre">${esc(e.titre)}</h1>
    ${s === 'encours' ? '<div class="bandeau-statut s-encours">' + ic('lumiere') + '<div><b>En ce moment</b><span>ARCHE est sur place : passe nous voir.</span></div></div>' : s === 'passe' ? '<div class="bandeau-statut s-passe">' + ic('information') + '<div><b>Événement terminé</b><span>Les maquettes présentées restent à explorer ici.</span></div></div>' : ''}
    <p class="texte" style="margin-top:18px">${esc(e.texte)}</p>
    <ul class="fiche-infos">
      <li><span>Dates</span><b>${periode(e)}</b></li>
      <li><span>Adresse</span><b>${esc(e.adresse)}, ${esc(e.villeInfo.nom)}</b></li>
      <li><span>Sur place</span><b class="formats">${e.formats.map(f => `<span>${ic(EVT.formats[f].icone)}${esc(EVT.formats[f].nom)}</span>`).join('')}</b></li>
    </ul>
    <div class="rang-btn">
      ${s !== 'passe' ? `<button class="btn" id="agenda">Ajouter à mon agenda ${ic('agenda')}</button>` : ''}
      <a class="btn btn--contour" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(e.adresse + ', ' + e.villeInfo.nom)}" target="_blank" rel="noopener">Voir sur un plan ${ic('lien')}</a>
    </div>
    <p class="surtitre" style="margin-top:30px">Les lieux présentés</p>
    <div class="liste-lieux">${ls.map(l => carteLieu(l, { compacte: true })).join('')}</div>
    ${pied()}
  </main>`;
  document.getElementById('agenda')?.addEventListener('click', () => ics({ titre: e.titre, debut: e.debut, fin: e.fin, lieu: `${e.adresse}, ${e.villeInfo.nom}`, texte: e.texte, url: location.href }));
}

/* ---------------------------------------------------------------- pour les partenaires */
function vueAccueillir() {
  document.title = 'ARCHE · Accueillir ARCHE';
  const c = chiffres();
  app.innerHTML = `<main class="ecran">
    ${barre('#/')}
    <p class="surtitre">Villes · festivals · lieux culturels</p>
    <h1 class="titre">Accueillir ARCHE</h1>
    <p class="texte">ARCHE installe des architectures spéculatives sur des lieux réels, pour que les habitants s'en emparent. Déjà ${c.lieux} lieux imaginés dans ${c.villes} villes. Voici comment le vôtre peut les rejoindre.</p>
    <p class="surtitre" style="margin-top:14px">Trois formules</p>
    <div class="formules">
      ${[['scanner', 'Plaques sur site', 'Des plaques QR posées sur le lieu réel, sans perçage, pour toute la durée du parcours. Idéal pour une ville.', 'Durée : de 3 mois à 1 an'],
         ['maquette', 'Stand événement', 'Un stand de 2 × 1 m, monté en une heure : lanterne, maquette, écran et dépliants. Pour un festival ou un salon.', 'Durée : de 1 jour à 6 semaines'],
         ['lumiere', 'Écran à parallaxe', 'Un écran vertical qui suit le regard : le lieu d’aujourd’hui d’un côté, son futur de l’autre. Pour un hall ou une vitrine.', 'Durée : sur mesure']]
        .map(([i, t, d, du]) => `<article class="formule">${ic(i)}<h3>${t}</h3><p>${d}</p><small>${du}</small></article>`).join('')}
    </div>
    <p class="surtitre" style="margin-top:26px">Comment ça se passe</p>
    <ol class="etapes">
      ${[['Choisir le lieu', 'Une place, une gare, une friche : un endroit que les habitants connaissent et qui pose une vraie question.'],
         ['Un collectif l’imagine', 'Un collectif d’architectes du réseau ARCHE dessine son futur possible et la question qu’il pose.'],
         ['La maquette est publiée', 'Elle rejoint le catalogue avec son code (par exemple MTP-01), explorable en 3D et en réalité augmentée.'],
         ['Installation et visites', 'Plaques, stand ou écran sont installés. Le lieu apparaît sur la carte et dans l’agenda.']]
        .map(([t, d], i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><div><strong>${t}</strong><span>${d}</span></div></li>`).join('')}
    </ol>
    <ul class="lignes" style="margin-top:10px">
      <li>${ic('accessibilite')}<b>Sans application</b><span>Un QR code et un navigateur suffisent, sur tous les téléphones récents.</span></li>
      <li>${ic('information')}<b>Sans données personnelles</b><span>Aucun compte, aucun suivi : la visite reste sur le téléphone du visiteur.</span></li>
      <li>${ic('maquette')}<b>Toujours à l'échelle</b><span>Les bâtiments sont présentés en maquettes, jamais à taille réelle.</span></li>
    </ul>
    <div class="final">
      <p class="titre-2">Parlons de votre lieu</p>
      <p class="texte" style="color:#d6dccf">Dites-nous où, quand et pour quel public : nous revenons vers vous avec une proposition.</p>
      ${CAT.contact ? `<a class="btn" href="mailto:${esc(CAT.contact)}?subject=${encodeURIComponent('Accueillir ARCHE')}">Écrire à l'équipe ${ic('contact')}</a>` : `<span class="btn" aria-disabled="true" style="opacity:.6">Formulaire de contact bientôt en ligne</span>`}
    </div>
    ${pied()}
  </main>`;
}
function vueAPropos() {
  document.title = 'ARCHE · La démarche';
  const c = chiffres();
  app.innerHTML = `<main class="ecran">
    ${barre('#/')}
    <p class="surtitre">La démarche</p>
    <h1 class="titre">Rendre le futur lisible</h1>
    <p class="texte">ARCHE est un dispositif de médiation. Il installe des architectures spéculatives dans l'espace public, là où elles imaginent transformer la ville, pour que chacun puisse les comprendre, s'en faire un avis et en parler.</p>
    <p class="texte">Nos projets ne sont pas des projets de construction : ce sont des <b>questions posées à la ville</b>, présentées sous forme de maquettes.</p>
    <ul class="chiffres">
      <li><b>${c.lieux}</b><span>lieux au catalogue</span></li><li><b>${Object.keys(CAT.porteurs).length}</b><span>collectifs d'architectes</span></li><li><b>${Object.keys(CAT.themes).length}</b><span>grands thèmes</span></li>
    </ul>
    <p class="surtitre" style="margin-top:22px">Les thèmes</p>
    <div class="chips">${Object.entries(CAT.themes).map(([k, t]) => `<a class="chip" href="#/explorer?theme=${k}">${ic(t.icone)}${esc(t.nom)}</a>`).join('')}</div>
    <p class="surtitre" style="margin-top:22px">Les collectifs</p>
    <ul class="fiche-infos">${Object.values(CAT.porteurs).map(p => `<li><span>${esc(p.ville)}</span><b>${esc(p.nom)}</b></li>`).join('')}</ul>
    <p class="surtitre" style="margin-top:22px">Chaque lieu a un code</p>
    <p class="texte">Trois lettres pour la ville, deux chiffres pour le lieu : <b class="code">MTP-01</b> est le premier lieu de Montpellier. C'est ce code qui figure sur les plaques, les dépliants et les stands.</p>
    <p class="petit">${esc(MENTION_MAQUETTE)}</p>
    ${pied()}
  </main>`;
}

/* ---------------------------------------------------------------- parcours d'une maquette · étape 1 */
function vuePavillon(p) {
  const evts = evtDuLieu(p.code);
  app.innerHTML = `<main class="ecran">
    ${barre('#/explorer')}
    <div class="arche-img">
      <img src="${p.image}" alt="Image d'ambiance du projet ${esc(p.titre)}">
      <span class="badge">${ic('maquette')}Maquette au ${p.echelleMaquette}</span>
      <span class="code-img">${p.code}</span>
    </div>
    <p class="surtitre" style="margin-top:22px">${esc(p.villeInfo.nom)} · ${esc(p.lieu)}</p>
    <h1 class="titre">${esc(p.titre)}</h1>
    <ul class="infos">
      <li>${ic('temps')}${p.duree}</li><li>${ic('point_d_interet')}${p.points.length} points à découvrir</li><li>${ic(p.themeInfo.icone)}${esc(p.themeInfo.nom)}</li>
    </ul>
    <p class="texte" style="margin-top:16px">${esc(p.question)} ${esc(p.accroche)}</p>
    <p class="petit" style="margin:-6px 0 14px">Imaginé par <b>${esc(p.porteurInfo.nom)}</b></p>
    ${galerie(p.galerie, 'Le projet en images')}
    ${evts.length ? `<p class="surtitre">Sur place</p><div class="liste-evt" style="margin-bottom:18px">${evts.map(ligneEvt).join('')}</div>` : ''}
    <div class="bas colle">
      <a class="btn" href="#/lieu/${p.id}/2">Commencer l'exploration ${ic('suivant')}</a>
      <p class="mention">Sans application · Aucune donnée enregistrée</p>
    </div>
  </main>`;
  initGaleries(app, [p.galerie]);
}

/* ---------------------------------------------------------------- étape 2 */
async function vueIntro(p) {
  const gal = await galerieSpeculative();
  app.innerHTML = `<main class="ecran">
    ${barre(`#/lieu/${p.id}`)}
    ${progression(2)}
    <p class="surtitre">Avant de commencer</p>
    <h1 class="titre-2">C'est quoi une architecture spéculative ?</h1>
    <p class="texte">Des projets imaginés pour réfléchir à la façon dont nous vivrons demain. Ils ne sont pas faits pour être construits tout de suite, mais pour poser une question. Ici : <b style="color:var(--vert)">${esc(p.question)}</b></p>
    ${galerie(gal, 'Des futurs déjà imaginés')}
    <ul class="lignes">
      <li>${ic('lumiere')}<b>Imaginer</b><span>Un futur possible : plus vert, plus dense, plus juste.</span></li>
      <li>${ic('aide')}<b>Questionner</b><span>Un enjeu d'aujourd'hui : climat, logement, ressources.</span></li>
      <li>${ic('maquette')}<b>Explorer</b><span>Tu vas tourner autour d'une maquette pour la comprendre.</span></li>
    </ul>
    <div class="bas colle"><a class="btn" href="#/lieu/${p.id}/3">Suivant ${ic('suivant')}</a></div>
  </main>`;
  initGaleries(app, [gal]);
}

/* ---------------------------------------------------------------- étape 3 */
function vueMode(p) {
  if (!mobile && modeChoisi === 'ar') modeChoisi = '3d';
  app.innerHTML = `<main class="ecran">
    ${barre(`#/lieu/${p.id}/2`)}
    ${progression(3)}
    <p class="surtitre">Mode d'exploration</p>
    <h1 class="titre-2">Comment veux-tu explorer ?</h1>
    <form id="modes" style="margin-top:8px">
      <label class="choix ${mobile ? '' : 'indispo'}">
        <input type="radio" name="mode" value="ar" ${modeChoisi === 'ar' ? 'checked' : ''} ${mobile ? '' : 'disabled'}>
        ${mobile ? '<span class="etiquette">Conseillé ici</span>' : ''}
        <img src="assets/img/mode_ar.webp" alt="" width="120" height="120">
        <span class="corps">${ic('realite_augmentee')}<b>Réalité augmentée</b><span class="case">${ic('valide')}</span>
          <p>${mobile ? 'La maquette (40 cm) apparaît posée devant toi, dans ta pièce.' : 'Disponible uniquement sur téléphone ou tablette.'}</p></span>
      </label>
      <label class="choix">
        <input type="radio" name="mode" value="3d" ${modeChoisi === '3d' ? 'checked' : ''}>
        <img src="assets/img/mode_3d.webp" alt="" width="120" height="120">
        <span class="corps">${ic('tourner')}<b>Mode 3D</b><span class="case">${ic('valide')}</span>
          <p>Tourne autour de la maquette sur ton écran, où que tu sois.</p></span>
      </label>
    </form>
    <div class="bas colle">
      <a class="btn" id="lancer" href="#/lieu/${p.id}/vue"></a>
    </div>
  </main>`;
  const maj = () => {
    document.getElementById('lancer').innerHTML = modeChoisi === 'ar' ? `Lancer la réalité augmentée ${ic('realite_augmentee')}` : `Ouvrir la maquette 3D ${ic('tourner')}`;
  };
  const pre = document.createElement('link'); pre.rel = 'prefetch'; pre.href = p.modele; document.head.appendChild(pre);
  document.getElementById('modes').addEventListener('change', e => { modeChoisi = e.target.value; sessionStorage.setItem('arche-mode', modeChoisi); maj(); });
  maj();
}

/* ---------------------------------------------------------------- étapes 4 et 5 : la maquette */
const decaleInit = p => { const [x, y, z] = p.vueGlobale.cible.split(' ').map(parseFloat), r = parseFloat(p.vueGlobale.orbite.split(' ')[2]); return `${x}m ${(y - r * 0.05).toFixed(3)}m ${z}m`; };
function vueMaquette(p) {
  let etat = 'global', idx = -1, guide = true, onglet = 'echelle';
  app.innerHTML = `<main class="vision">
    <model-viewer id="mv" src="${p.modele}" alt="Maquette 3D du projet ${p.code} : ${esc(p.titre)}"
      camera-controls auto-rotate auto-rotate-delay="1500" rotation-per-second="8deg" touch-action="none" interaction-prompt="none" shadow-intensity="1" shadow-softness="0.8" exposure="1.05"
      camera-orbit="${p.vueGlobale.orbite}" camera-target="${decaleInit(p)}" field-of-view="30deg"
      min-camera-orbit="auto 5deg 0.18m" max-camera-orbit="auto 88deg 1.3m" interpolation-decay="140"
      ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor">
      ${p.points.map((pt, i) => `
        <button class="point" slot="hotspot-${i + 1}" data-i="${i}" data-position="${pt.position}" data-normal="${pt.normale}"
          data-visibility-attribute="visible" aria-label="Point ${i + 1} : ${esc(pt.nom)}"><span>${i + 1}</span></button>`).join('')}
      <button slot="ar-button" hidden></button>
      <div class="chargement" slot="progress-bar" id="charge">Chargement de la maquette<div class="jauge"><i></i></div></div>
      <section class="panneau" id="panneau" aria-live="polite"></section>
    </model-viewer>
    <video id="camera" class="camera" playsinline muted hidden></video>
    <div class="haut">
      ${barre(`#/lieu/${p.id}/3`)}
      <div id="prog"></div>
    </div>
    <div class="geste" id="geste" hidden aria-hidden="true">${ic('tourner')}<span>Glisse pour tourner autour</span></div>
    <div class="mode" role="group" aria-label="Type de visite">
      <button type="button" data-g="1" aria-pressed="true">Guidée</button><button type="button" data-g="0" aria-pressed="false">Libre</button>
    </div>
    <div class="outils">
      <button class="btn-rond" id="recentrer" aria-label="Revenir à la vue d'ensemble">${ic('maquette')}</button>
      <button class="btn-rond" id="ar" aria-label="Voir en réalité augmentée" hidden>${ic('realite_augmentee')}</button>
      <button class="btn-rond" id="quitter-camera" aria-label="Quitter la vue caméra" hidden>${ic('fermer')}</button>
    </div>
    <p class="echelle-note">Maquette au ${p.echelleMaquette}, socle de 40 cm. Le bâtiment n'est pas représenté à taille réelle.</p>
  </main>`;
  const mv = document.getElementById('mv');
  const panneau = document.getElementById('panneau');
  const prog = document.getElementById('prog');
  const btnAR = document.getElementById('ar');

  mv.addEventListener('progress', e => { const i = document.querySelector('#charge i'); if (i) i.style.width = (e.detail.totalProgress * 100) + '%'; });
  mv.addEventListener('load', () => {
    let vu = false; try { vu = localStorage.getItem('arche-geste'); } catch (e) {}
    if (!vu && !calme) {
      const g = document.getElementById('geste'); g.hidden = false;
      const fin = () => { g.classList.add('fin'); setTimeout(() => g.remove(), 400); try { localStorage.setItem('arche-geste', '1'); } catch (e) {} };
      mv.addEventListener('camera-change', e => { if (e.detail.source === 'user-interaction') fin(); }, { once: true });
      setTimeout(fin, 4500);
    }
    mv.classList.add('chargee');
    document.querySelectorAll('.point').forEach((b, i) => setTimeout(() => b.classList.add('apparait'), 500 + i * 220));
    document.getElementById('charge')?.remove();
    if (mv.canActivateAR) btnAR.hidden = false;
    rendu();
  });
  mv.addEventListener('error', () => toast('La maquette n’a pas pu se charger. Vérifie ta connexion.'));
  mv.addEventListener('ar-status', e => {
    const s = e.detail.status;
    if (s === 'failed') toast('La réalité augmentée n’est pas disponible sur cet appareil.');
    vision.classList.toggle('en-ar', s === 'session-started' || s === 'object-placed');
    rendu();
  });

  // le panneau du bas cache une partie de l'écran : on décale la cible vers le bas
  const decale = (cible, orbite, k) => {
    const [x, y, z] = cible.split(' ').map(parseFloat), r = parseFloat(orbite.split(' ')[2]);
    return `${x}m ${(y - r * k).toFixed(3)}m ${z}m`;
  };
  const versPoint = i => { const pt = p.points[i]; mv.cameraTarget = decale(pt.cible, pt.orbite, 0.07); mv.cameraOrbit = pt.orbite; };
  const versGlobal = () => { mv.cameraTarget = decale(p.vueGlobale.cible, p.vueGlobale.orbite, 0.05); mv.cameraOrbit = p.vueGlobale.orbite; };
  // Android : vraie AR (WebXR) avec les points ; iPhone : vraie AR d'Apple (Quick Look), maquette seule.
  // La vue caméra ne sert qu'en secours, si l'appareil n'a pas d'AR.
  const vision = document.querySelector('.vision'), cam = document.getElementById('camera');
  let flux = null;
  async function demarrerCamera() {
    try {
      flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      cam.srcObject = flux; cam.hidden = false; await cam.play();
      vision.classList.add('camera-on'); document.getElementById('quitter-camera').hidden = false;
      toast('Tourne autour de la maquette avec le doigt, touche les points jaunes.');
      rendu();
    } catch (e) { toast('Autorise la caméra pour voir la maquette dans ta pièce.'); }
  }
  function arreterCamera() {
    flux?.getTracks().forEach(t => t.stop()); flux = null; cam.hidden = true;
    vision.classList.remove('camera-on'); document.getElementById('quitter-camera').hidden = true; rendu();
  }
  document.getElementById('quitter-camera').addEventListener('click', arreterCamera);
  const lancerAR = () => { if (mv.canActivateAR) mv.activateAR(); else demarrerCamera(); };
  addEventListener('hashchange', () => flux && arreterCamera(), { once: true });

  function rendu() {
    document.querySelectorAll('.point').forEach(b => b.classList.toggle('actif', +b.dataset.i === idx && etat === 'point'));
    document.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.g === (guide ? 1 : 0))));
    prog.innerHTML = progression(etat === 'point' ? 5 : 4);
    mv.autoRotate = etat === 'global' && !calme;
    if (etat === 'global') {
      const enAR = vision.classList.contains('en-ar') || vision.classList.contains('camera-on');
      const ar = modeChoisi === 'ar' && mobile && !enAR;
      panneau.innerHTML = `<button class="poignee" id="poignee" aria-label="Réduire ou agrandir le panneau"></button>
        <p class="surtitre">Vue globale · ${p.code}</p>
        <h2 class="titre-2" style="font-size:22px">Fais le tour de la maquette</h2>
        <p class="texte">Glisse pour tourner, pince pour zoomer. ${guide ? `La visite t'emmène vers les ${p.points.length} points jaunes.` : 'Touche un point jaune pour l’ouvrir.'}</p>
        ${ar ? `<button class="btn" id="placer">Placer la maquette devant moi ${ic('realite_augmentee')}</button>` : ''}
        ${enAR ? `<p class="texte" style="margin-top:-6px"><b style="color:var(--vert)">Tu es en réalité augmentée.</b> Les points jaunes se touchent directement sur la maquette.</p>` : ''}
        ${guide ? `<button class="btn ${ar ? 'btn--contour' : ''}" id="commencer">Commencer la visite guidée ${ic('suivant')}</button>`
                : `<a class="btn ${ar ? 'btn--contour' : ''}" href="#/lieu/${p.id}/fin">Terminer la visite ${ic('suivant')}</a>`}
        ${ar && ios ? `<p class="note" style="margin-top:8px">Sur iPhone, la réalité augmentée montre la maquette seule : les points d'intérêt se découvrent ici, en 3D.</p>` : ''}
        <p class="note">Maquette au ${p.echelleMaquette}, socle de 40 cm. Le bâtiment n'est pas représenté à taille réelle.</p>`;
      panneau.querySelector('#placer')?.addEventListener('click', lancerAR);
      panneau.querySelector('#poignee').addEventListener('click', () => panneau.classList.toggle('replie'));
      panneau.querySelector('#commencer')?.addEventListener('click', () => { etat = 'point'; idx = 0; onglet = 'echelle'; versPoint(0); rendu(); });
    } else {
      const pt = p.points[idx], o = pt.onglets[onglet], dernier = idx === p.points.length - 1;
      panneau.innerHTML = `<button class="poignee" id="poignee" aria-label="Réduire ou agrandir le panneau"></button>
        <button class="btn-icone fermer" id="fermer" aria-label="Fermer le point">${ic('fermer')}</button>
        <div class="point-tete">
          <button class="vignette zoom" type="button" aria-label="Agrandir l'image du point">${pt.image ? `<img src="${pt.image}" alt="">` : ''}<span class="agrandir">${ic('plein_ecran')}</span></button>
          <div><p class="surtitre" style="margin:0 0 6px">Point ${idx + 1} sur ${p.points.length}</p><b class="point-nom">${esc(pt.nom)}</b>
            <div class="puces-points" role="group" aria-label="Aller à un point">${p.points.map((q, i) => `<button type="button" data-p="${i}" ${i === idx ? 'aria-current="true"' : ''} aria-label="Point ${i + 1} : ${esc(q.nom)}">${i + 1}</button>`).join('')}</div></div>
        </div>
        <div class="onglets" role="tablist">
          ${[['echelle', 'Échelle'], ['usage', 'Usage'], ['message', 'Message']].map(([k, l]) =>
            `<button role="tab" aria-selected="${k === onglet}" data-o="${k}">${l}</button>`).join('')}
        </div>
        <h2 class="titre-2" style="font-size:22px">${esc(o.titre)}</h2>
        <p class="texte">${esc(o.texte)}</p>
        ${o.comparer ? `<div class="comparer"><div class="ech">${ic('profil')}<div><div class="barre-c"></div></div>
            <small>${o.comparer.humain}</small><small>${esc(o.comparer.objet)}</small></div></div>` : ''}
        <div class="rangee">
          ${guide ? (dernier ? `<a class="btn" href="#/lieu/${p.id}/fin">Voir ce que j'ai compris ${ic('suivant')}</a>`
                             : `<button class="btn" id="suivant">Point suivant ${ic('suivant')}</button>`)
                  : `<button class="btn btn--contour" id="fermer2">Revenir à la maquette</button>`}
        </div>`;
      panneau.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { onglet = b.dataset.o; rendu(); }));
      panneau.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { idx = +b.dataset.p; onglet = 'echelle'; versPoint(idx); rendu(); }));
      panneau.querySelector('.vignette')?.addEventListener('click', () => pleinEcran(p.points.filter(q => q.image).map(q => ({ image: q.image, legende: q.nom })), p.points.filter(q => q.image).indexOf(pt)));
      panneau.querySelector('#poignee').addEventListener('click', () => panneau.classList.toggle('replie'));
      panneau.querySelector('#suivant')?.addEventListener('click', () => { idx++; onglet = 'echelle'; versPoint(idx); rendu(); });
      const fermer = () => { etat = 'global'; idx = -1; versGlobal(); rendu(); };
      panneau.querySelector('#fermer').addEventListener('click', fermer);
      panneau.querySelector('#fermer2')?.addEventListener('click', fermer);
    }
    requestAnimationFrame(() => document.querySelector('.vision')?.style.setProperty('--panneau', panneau.offsetHeight - 10 + 'px'));
  }

  mv.querySelectorAll('.point').forEach(b => b.addEventListener('click', () => { etat = 'point'; idx = +b.dataset.i; onglet = 'echelle'; versPoint(idx); rendu(); }));
  document.querySelectorAll('.mode button').forEach(b => b.addEventListener('click', () => { guide = b.dataset.g === '1'; rendu(); }));
  document.getElementById('recentrer').addEventListener('click', () => { etat = 'global'; idx = -1; versGlobal(); rendu(); });
  btnAR.addEventListener('click', lancerAR);
  let x0 = null;
  panneau.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  panneau.addEventListener('touchend', e => {
    if (x0 === null || etat !== 'point') return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) < 60) return;
    idx = Math.min(p.points.length - 1, Math.max(0, idx + (dx < 0 ? 1 : -1))); onglet = 'echelle'; versPoint(idx); rendu();
  });
  rendu();
}

/* ---------------------------------------------------------------- étape 6 */
function vueFin(p) {
  const ex = explorables(), i = ex.findIndex(l => l.slug === p.id);
  const pr = lireProgres(), suivant = ex.find((l, k) => k > i && !pr[l.slug]?.fini) || ex.find(l => l.slug !== p.id && !pr[l.slug]?.fini) || ex[(i + 1) % ex.length];
  const bientotVille = CAT.lieux.filter(l => l.statut !== 'explorable').sort((a, b) => km(p, a) - km(p, b)).slice(0, 2);
  app.innerHTML = `<main class="ecran">
    ${barre(`#/lieu/${p.id}/vue`)}
    ${progression(6)}
    <p class="surtitre">Synthèse · ${p.code}</p>
    <h1 class="titre-2">Ce que tu as compris</h1>
    <ul class="lignes" style="margin-top:14px">
      ${p.synthese.map(s => `<li class="coche">${ic(s.icone)}<b>${esc(s.titre)}</b><span class="ok" aria-label="vu">${ic('valide')}</span><span>${esc(s.texte)}</span></li>`).join('')}
    </ul>
    ${galerie(p.galerie, 'Revoir le projet en images')}
    <p class="surtitre" style="margin-top:8px">Maquette suivante</p>
    ${carteLieu(suivant)}
    <p class="surtitre" style="margin-top:24px">Bientôt, pas loin</p>
    <div class="liste-lieux">${bientotVille.map(l => carteLieu(l, { compacte: true })).join('')}</div>
    <div class="bas">
      <a class="btn" href="#/carte">Voir tous les lieux sur la carte ${ic('carte')}</a>
      <button class="btn btn--contour" id="partager">Partager ${ic('partager')}</button>
      <p class="mention">${esc(MENTION_MAQUETTE)}</p>
    </div>
  </main>`;
  initGaleries(app, [p.galerie]);
  document.getElementById('partager').addEventListener('click', () => partager(`ARCHE · ${p.titre}`, p.question, `#/lieu/${p.id}`));
}

function vueIntrouvable() {
  document.title = 'ARCHE · Page introuvable';
  app.innerHTML = `<main class="ecran">${barre('#/')}
    <p class="surtitre">Oups</p><h1 class="titre">Ce lieu n'existe pas (encore)</h1>
    <p class="texte">Le lien ou le code de la plaque est peut-être mal recopié. Les codes ressemblent à MTP-01.</p>
    <a class="btn" href="#/explorer">Chercher un lieu ${ic('rechercher')}</a></main>`;
}

/* ---------------------------------------------------------------- routeur */
let premier = true;
async function route() {
  const brut = (location.hash || '#/').slice(1).split('?')[0];
  const [, a, b, c] = brut.split('/');
  if (a === 'p' && b) { location.replace(`#/lieu/mtp-${b}${c ? '/' + c : ''}`); return; }   // anciens QR codes
  try {
    if (premier) { premier = false; await Promise.all([intro(), initDonnees()]); } else await balayage();
    window.scrollTo(0, 0);
    if (!a) vueAccueil();
    else if (a === 'explorer') vueExplorer();
    else if (a === 'carte') vueExplorer({ vue: 'carte' });
    else if (a === 'ville' && CAT.villes[b]) vueExplorer({ ville: b, vue: 'carte' });
    else if (a === 'evenements') vueEvenements();
    else if (a === 'evenement' && EVT.evenements.find(e => e.slug === b)) vueEvenement(EVT.evenements.find(e => e.slug === b));
    else if (a === 'accueillir') vueAccueillir();
    else if (a === 'a-propos') vueAPropos();
    else if (a === 'lieu' && trouveLieu(b)) {
      const l = trouveLieu(b);
      if (l.statut !== 'explorable') vueProjet(l);
      else {
        const p = await fiche(l);
        document.title = `ARCHE · ${p.titre}`;
        noterProgres(p.id, c);
        if (!c) vuePavillon(p);
        else if (c === '2') await vueIntro(p);
        else if (c === '3') vueMode(p);
        else if (c === 'vue') vueMaquette(p);
        else if (c === 'fin') vueFin(p);
        else vuePavillon(p);
      }
    }
    else vueIntrouvable();
  } catch (e) {
    console.error(e);
    app.innerHTML = `<main class="ecran">${barre('#/')}<h1 class="titre-2">Connexion interrompue</h1><p class="texte">Le contenu n'a pas pu se charger. Vérifie ta connexion puis réessaie.</p><button class="btn" onclick="location.reload()">Réessayer</button></main>`;
  }
  fondVisible(!app.querySelector('.vision'));
  animer(app);
}
document.addEventListener('click', e => { if (e.target.closest('[data-menu]')) ouvrirMenu(); });
addEventListener('hashchange', route);
route();
