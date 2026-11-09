/* =========================================================================
   ARCHE · plateforme web (application d'une seule page, routes après le #)
   #/                 accueil de la plateforme (les 3 pavillons)
   #/p/01             étape 1 · accueil du pavillon
   #/p/01/2           étape 2 · avant de commencer
   #/p/01/3           étape 3 · choix du mode (réalité augmentée ou 3D)
   #/p/01/vue         étapes 4 et 5 · la maquette et ses points d'intérêt
   #/p/01/fin         étape 6 · ce que tu as compris
   ========================================================================= */
import { PAVILLONS, MENTION_MAQUETTE, GALERIE_SPECULATIVE } from './pavillons.js';
import { ICONES } from './icones.js';
import { intro, balayage, animer, fondVisible, calme, initParallaxe } from './anim.js';

const app = document.getElementById('app');
const ETAPES = 6;
const ic = (k, cls = '') => `<svg class="ic ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="miter" aria-hidden="true">${ICONES[k] || ''}</svg>`;
const logo = (cls = 'logo', blanc = false) => `<img class="${cls}" src="assets/logo/ARCHE_logotype_${blanc ? 'white' : 'color'}.svg" alt="ARCHE">`;
const trouve = id => PAVILLONS.find(p => p.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let modeChoisi = sessionStorage.getItem('arche-mode') || (mobile ? 'ar' : '3d');

function barre(retour, droite = '') {
  return `<header class="barre">
    ${retour ? `<a class="btn-icone" href="${retour}" aria-label="Retour">${ic('retour')}</a>` : '<span></span>'}
    ${logo()}
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
function galerie(items, titre = 'Images d\u2019ambiance') {
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
      <p><b>${String(k + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}</b>${esc(items[k].legende)}<br><span>Image d'ambiance du projet ARCHE</span></p>
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

/* ---------- progression mémorisée (reprendre une visite, pavillons vus) ---------- */
const ORDRE = { '': 1, '2': 2, '3': 3, 'vue': 4, 'fin': 6 };
function lireProgres() { try { return JSON.parse(localStorage.getItem('arche-progres') || '{}'); } catch (e) { return {}; } }
function noterProgres(id, etape) {
  const pr = lireProgres(), n = ORDRE[etape || ''] || 1, cur = pr[id] || { max: 0, etape: '' };
  if (n >= cur.max) { cur.max = n; cur.etape = etape || ''; }
  if (n === 6) cur.fini = true;
  pr[id] = cur; try { localStorage.setItem('arche-progres', JSON.stringify(pr)); } catch (e) {}
}

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---------------------------------------------------------------- menu (burger) */
let ancreEnAttente = null;
const MENU = [
  ['Accueil', '#/', null], ['Le projet ARCHE', '#/', 'projet'], ['Les pavillons', '#/', 'pavillons'],
  ...PAVILLONS.map(p => [`${p.id} · ${p.titre}`, `#/p/${p.id}`, null, true]),
  ['Comment ça marche', '#/', 'comment'], ['Les supports', '#/', 'supports'], ['À propos', '#/', 'apropos'],
];
function ouvrirMenu() {
  const m = document.createElement('nav'); m.className = 'menu'; m.setAttribute('aria-label', 'Menu');
  m.innerHTML = `<div class="menu-haut">${logo('logo', true)}<button class="btn-icone menu-fermer" aria-label="Fermer le menu">${ic('fermer')}</button></div>
    <ul>${(() => { let n = 0; return MENU.map(([l, h, an, sous], k) => `<li class="${sous ? 'sous' : ''}" style="--k:${k}"><a href="${h}" data-ancre="${an || ''}">${sous ? '' : `<span class="num">${String(++n).padStart(2, '0')}</span>`}${esc(l)}${ic('suivant')}</a></li>`).join(''); })()}</ul>
    <p class="petit">${esc(MENTION_MAQUETTE)}</p>`;
  const ferme = () => { m.classList.add('sort'); document.body.classList.remove('menu-ouvert'); setTimeout(() => m.remove(), 300); };
  m.querySelector('.menu-fermer').onclick = ferme;
  m.querySelectorAll('a').forEach(a => a.addEventListener('click', e => {
    const an = a.dataset.ancre;
    ferme();
    if (an) {
      if ((location.hash || '#/') === '#/' ) { e.preventDefault(); document.getElementById(an)?.scrollIntoView({ behavior: 'smooth' }); }
      else ancreEnAttente = an;
    }
  }));
  addEventListener('keydown', function esc_(e) { if (e.key === 'Escape') { ferme(); removeEventListener('keydown', esc_); } });
  document.body.appendChild(m); document.body.classList.add('menu-ouvert');
}
const burger = (clair = false) => `<button class="btn-icone burger ${clair ? 'clair' : ''}" data-menu aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>`;

/* ---------------------------------------------------------------- accueil plateforme */
const CARTE = { '01': [0.5, 0.7], '02': [0.24, 0.3], '03': [0.76, 0.76] };
function vueAccueil() {
  document.title = 'ARCHE · Architectures des futurs possibles';
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
      <h1 class="titre">Visite les villes de demain, en maquette</h1>
      <div class="hero-actions">
        <button class="btn btn--jaune" data-aller="pavillons">Découvrir les pavillons ${ic('suivant')}</button>
        <button class="btn btn--verre" data-aller="projet">C'est quoi ARCHE ?</button>
      </div>
    </div>
    <button class="defiler" data-aller="projet" aria-label="Descendre vers la présentation"><span></span>Défiler</button>
  </section>

  <main class="ecran accueil">
    <section class="bloc" id="projet">
      <p class="surtitre">ARCHE · le projet</p>
      <h2 class="titre manifeste">L'architecture de demain s'imagine aujourd'hui. <em>ARCHE la rend visible.</em></h2>
      <p class="texte">Des architectes imaginent des villes suspendues, des serres habitées, des quartiers en terre crue. Ces projets, qu'on appelle des <b>architectures spéculatives</b>, ne sont pas faits pour être construits demain : ils posent une question sur notre façon d'habiter.</p>
      <p class="texte">Mais ils restent souvent enfermés dans des livres et des expositions de spécialistes. ARCHE les installe dans la ville, à l'endroit même qu'ils imaginent transformer, sous forme de maquettes à explorer sur son téléphone.</p>
      <ul class="chiffres">
        <li><b>3</b><span>pavillons à Montpellier</span></li>
        <li><b>5</b><span>minutes par visite</span></li>
        <li><b>0</b><span>application à installer</span></li>
      </ul>
    </section>

    <section class="bloc">
      <p class="surtitre">L'architecture spéculative en 3 idées</p>
      <div class="mosaique">
        <img src="assets/img/galerie/05_tours_organiques.webp" alt="Tours organiques couvertes de végétation" loading="lazy">
        <img src="assets/img/galerie/02_ville_vegetale_vue_du_ciel.webp" alt="Ville végétale vue du ciel" loading="lazy">
        <img src="assets/img/galerie/07_tour_en_bois_couverte_d_arbres.webp" alt="Tour en bois couverte d'arbres" loading="lazy">
      </div>
      <ul class="lignes">
        <li>${ic('lumiere')}<b>Imaginer</b><span>Dessiner un futur possible : plus vert, plus dense, plus juste.</span></li>
        <li>${ic('aide')}<b>Questionner</b><span>Partir d'un enjeu d'aujourd'hui : climat, logement, ressources.</span></li>
        <li>${ic('maquette')}<b>Explorer</b><span>Tourner autour d'une maquette pour comprendre, puis se faire son avis.</span></li>
      </ul>
    </section>

    <section class="bloc" id="pavillons">
      <p class="surtitre">Les pavillons</p>
      <h2 class="titre-2">Trois lieux, trois questions</h2>
      <p class="texte">Chaque pavillon transforme un lieu réel de Montpellier. Touche un point du plan ou une carte pour l'explorer.</p>
      <div class="plan" role="group" aria-label="Plan des pavillons">
        <svg viewBox="0 0 100 70" aria-hidden="true"><path class="lez" d="M88 0 C 80 18, 92 30, 84 44 S 86 62, 80 70"/><path class="axe" d="M0 52 L100 40"/><path class="axe" d="M30 0 L44 70"/></svg>
        <span class="plan-nord">N ↑</span><span class="plan-ville">Montpellier</span>
        ${PAVILLONS.map(p => `<a class="epingle" href="#/p/${p.id}" style="left:${CARTE[p.id][0] * 100}%;top:${CARTE[p.id][1] * 100}%" aria-label="Pavillon ${p.id} : ${esc(p.titre)}, ${esc(p.lieu)}"><b><i>${p.id}</i></b><span>${esc(p.lieu)}</span></a>`).join('')}
      </div>
      ${PAVILLONS.map(p => { const pr = lireProgres()[p.id]; return `
      <a class="carte" href="#/p/${p.id}${pr && !pr.fini && pr.max > 1 ? '/' + pr.etape : ''}">
        <div class="carte-img"><img src="${p.image}" alt="" loading="lazy"><span class="grand-num">${p.id}</span><span class="coord">${p.coord}</span></div>
        <div class="corps">
          <span class="numero">Pavillon ${p.id} · ${esc(p.lieu)}</span>
          <h3>${esc(p.titre)}</h3>
          <p class="texte" style="margin:0">${esc(p.question)}</p>
          ${pr?.fini ? `<span class="statut">${ic('valide')}Maquette déjà explorée</span>` : ''}
          <div class="action"><span>${pr && !pr.fini && pr.max > 1 ? `Reprendre à l'étape ${pr.max}` : pr?.fini ? 'Revoir la maquette' : 'Explorer la maquette'}</span>${ic('suivant')}</div>
        </div>
      </a>`; }).join('')}
    </section>

    <section class="bloc" id="comment">
      <p class="surtitre">Comment ça marche</p>
      <h2 class="titre-2">Une visite en 4 gestes</h2>
      <ol class="etapes">
        <li><b>01</b><div><strong>Repère une plaque ARCHE</strong><span>Sur un mur de la ville ou sur un stand, scanne le QR code avec l'appareil photo.</span></div></li>
        <li><b>02</b><div><strong>Découvre la question</strong><span>Chaque lieu pose un « Et si… » : et si cette place s'élevait au-dessus des nuages ?</span></div></li>
        <li><b>03</b><div><strong>Explore la maquette</strong><span>En 3D ou en réalité augmentée, avec 3 points d'intérêt pour comprendre l'échelle, l'usage et le message.</span></div></li>
        <li><b>04</b><div><strong>Fais-toi ton avis</strong><span>Retiens l'essentiel en une synthèse, puis passe au pavillon suivant.</span></div></li>
      </ol>
    </section>

    <section class="bloc" id="supports">
      <p class="surtitre">Les supports</p>
      <h2 class="titre-2">Quatre supports, une même visite</h2>
      <div class="supports">
        ${[['plateforme', '01', 'La plateforme web', 'Cette page : les maquettes à explorer en 3D ou en réalité augmentée, sans application.'],
           ['ecran', '02', 'L’écran à parallaxe', 'Un écran qui suit le regard : vu de gauche, le lieu d’aujourd’hui ; vu de droite, sa version utopique.'],
           ['depliant', '03', 'Le dépliant', 'À emporter : le parcours, la carte des pavillons et ce qu’est l’architecture spéculative.'],
           ['plaque', '04', 'Les plaques QR', 'Posées sur les lieux eux-mêmes, elles ouvrent le pavillon qui les transforme.']]
          .map(([k, n, t, d]) => `<figure class="support"><img src="assets/img/supports/${k}.webp" alt="${esc(t)}" loading="lazy"><figcaption><b>${n}</b><strong>${t}</strong><span>${d}</span></figcaption></figure>`).join('')}
      </div>
    </section>

    <section class="bloc" id="apropos">
      <p class="surtitre">À propos</p>
      <h2 class="titre-2">Un projet de fin d'études</h2>
      <p class="texte">ARCHE est le projet de M2 Direction artistique de Maxime Denninger, à e-artsup Montpellier (2026). Il accompagne un mémoire qui pose une question : <b>comment rendre les architectures spéculatives compréhensibles par un public non spécialiste ?</b></p>
      <p class="petit">${esc(MENTION_MAQUETTE)}</p>
      <div class="final">
        <p class="titre-2">Prêt à décoller ?</p>
        <a class="btn" href="#/p/01">Commencer par le pavillon 01 ${ic('suivant')}</a>
      </div>
    </section>

    <footer class="pied">
      ${logo('logo-pied')}
      <p class="petit">Architectures des futurs possibles · Projet d'étude · e-artsup Montpellier · 2026. Aucune donnée personnelle enregistrée.</p>
    </footer>
  </main>`;
  app.querySelectorAll('[data-aller]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.aller)?.scrollIntoView({ behavior: 'smooth' })));
  initParallaxe(document.getElementById('hero'), document.getElementById('barreAccueil'));
  if (ancreEnAttente) { const an = ancreEnAttente; ancreEnAttente = null; setTimeout(() => document.getElementById(an)?.scrollIntoView({ behavior: 'smooth' }), 400); }
}

/* ---------------------------------------------------------------- étape 1 */
function vuePavillon(p) {
  app.innerHTML = `<main class="ecran">
    ${barre('#/')}
    <div class="arche-img">
      <img src="${p.image}" alt="Image d'ambiance du pavillon ${p.id}">
      <span class="badge">${ic('maquette')}Maquette au ${p.echelleMaquette}</span>
    </div>
    <p class="surtitre" style="margin-top:22px">Pavillon ${p.id} · ${esc(p.lieu)}</p>
    <h1 class="titre">${esc(p.titre)}</h1>
    <ul class="infos">
      <li>${ic('temps')}${p.duree}</li><li>${ic('point_d_interet')}${p.points.length} points à découvrir</li><li>${ic('etape')}${ETAPES} étapes</li>
    </ul>
    <p class="texte" style="margin-top:16px">${esc(p.question)} ${esc(p.accroche)}</p>
    ${galerie(p.galerie, 'Le pavillon en images')}
    <div class="bas colle">
      <a class="btn" href="#/p/${p.id}/2">Commencer l'exploration ${ic('suivant')}</a>
      <p class="mention">Sans application · Aucune donnée enregistrée</p>
    </div>
  </main>`;
  initGaleries(app, [p.galerie]);
}

/* ---------------------------------------------------------------- étape 2 */
function vueIntro(p) {
  app.innerHTML = `<main class="ecran">
    ${barre(`#/p/${p.id}`)}
    ${progression(2)}
    <p class="surtitre">Avant de commencer</p>
    <h1 class="titre-2">C'est quoi une architecture spéculative ?</h1>
    <p class="texte">Des projets imaginés pour réfléchir à la façon dont nous vivrons demain. Ils ne sont pas faits pour être construits tout de suite, mais pour poser une question. Ici : <b style="color:var(--vert)">${esc(p.question)}</b></p>
    ${galerie(GALERIE_SPECULATIVE, 'Des futurs déjà imaginés')}
    <ul class="lignes">
      <li>${ic('lumiere')}<b>Imaginer</b><span>Un futur possible : plus vert, plus dense, plus juste.</span></li>
      <li>${ic('aide')}<b>Questionner</b><span>Un enjeu d'aujourd'hui : climat, logement, ressources.</span></li>
      <li>${ic('maquette')}<b>Explorer</b><span>Tu vas tourner autour d'une maquette pour la comprendre.</span></li>
    </ul>
    <div class="bas colle"><a class="btn" href="#/p/${p.id}/3">Suivant ${ic('suivant')}</a></div>
  </main>`;
  initGaleries(app, [GALERIE_SPECULATIVE]);
}

/* ---------------------------------------------------------------- étape 3 */
function vueMode(p) {
  if (!mobile && modeChoisi === 'ar') modeChoisi = '3d';
  app.innerHTML = `<main class="ecran">
    ${barre(`#/p/${p.id}/2`)}
    ${progression(3)}
    <p class="surtitre">Mode d'exploration</p>
    <h1 class="titre-2">Comment veux-tu explorer ?</h1>
    <form id="modes" style="margin-top:8px">
      <label class="choix ${mobile ? '' : 'indispo'}">
        <input type="radio" name="mode" value="ar" ${modeChoisi === 'ar' ? 'checked' : ''} ${mobile ? '' : 'disabled'}>
        ${mobile ? '<span class="etiquette">Conseillé ici</span>' : ''}
        <img src="assets/img/mode_ar.webp" alt="">
        <span class="corps">${ic('realite_augmentee')}<b>Réalité augmentée</b><span class="case">${ic('valide')}</span>
          <p>${mobile ? 'La maquette (40 cm) apparaît posée devant toi, dans ta pièce.' : 'Disponible uniquement sur téléphone ou tablette.'}</p></span>
      </label>
      <label class="choix">
        <input type="radio" name="mode" value="3d" ${modeChoisi === '3d' ? 'checked' : ''}>
        <img src="assets/img/mode_3d.webp" alt="">
        <span class="corps">${ic('mode_3d')}<b>Mode 3D</b><span class="case">${ic('valide')}</span>
          <p>Tourne autour de la maquette sur ton écran, où que tu sois.</p></span>
      </label>
    </form>
    <div class="bas colle">
      <a class="btn" id="lancer" href="#/p/${p.id}/vue"></a>
    </div>
  </main>`;
  const maj = () => {
    document.getElementById('lancer').innerHTML = modeChoisi === 'ar' ? `Lancer la réalité augmentée ${ic('realite_augmentee')}` : `Ouvrir la maquette 3D ${ic('mode_3d')}`;
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
    <model-viewer id="mv" src="${p.modele}" alt="Maquette 3D du pavillon ${p.id} : ${esc(p.titre)}"
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
      ${barre(`#/p/${p.id}/3`)}
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
  // pour que la maquette reste visible dans la partie haute
  const decale = (cible, orbite, k) => {
    const [x, y, z] = cible.split(' ').map(parseFloat), r = parseFloat(orbite.split(' ')[2]);
    return `${x}m ${(y - r * k).toFixed(3)}m ${z}m`;
  };
  const versPoint = i => {
    const pt = p.points[i];
    mv.cameraTarget = decale(pt.cible, pt.orbite, 0.07); mv.cameraOrbit = pt.orbite;
  };
  const versGlobal = () => { mv.cameraTarget = decale(p.vueGlobale.cible, p.vueGlobale.orbite, 0.05); mv.cameraOrbit = p.vueGlobale.orbite; };
  // Android : vraie AR (WebXR) avec les points ; iPhone : vraie AR d'Apple (Quick Look),
  // qui affiche la maquette seule (Apple ne permet pas d'y ajouter des points cliquables).
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
  const lancerAR = () => {
    if (mv.canActivateAR) mv.activateAR();
    else demarrerCamera();
  };
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
        <p class="surtitre">Vue globale</p>
        <h2 class="titre-2" style="font-size:22px">Fais le tour de la maquette</h2>
        <p class="texte">Glisse pour tourner, pince pour zoomer. ${guide ? `La visite t'emmène vers les ${p.points.length} points jaunes.` : 'Touche un point jaune pour l’ouvrir.'}</p>
        ${ar ? `<button class="btn" id="placer">Placer la maquette devant moi ${ic('realite_augmentee')}</button>` : ''}
        ${enAR ? `<p class="texte" style="margin-top:-6px"><b style="color:var(--vert)">Tu es en réalité augmentée.</b> Les points jaunes se touchent directement sur la maquette.</p>` : ''}
        ${guide ? `<button class="btn ${ar ? 'btn--contour' : ''}" id="commencer">Commencer la visite guidée ${ic('suivant')}</button>`
                : `<a class="btn ${ar ? 'btn--contour' : ''}" href="#/p/${p.id}/fin">Terminer la visite ${ic('suivant')}</a>`}
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
          ${guide ? (dernier ? `<a class="btn" href="#/p/${p.id}/fin">Voir ce que j'ai compris ${ic('suivant')}</a>`
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
    requestAnimationFrame(() => document.querySelector('.vision').style.setProperty('--panneau', panneau.offsetHeight - 10 + 'px'));
  }

  mv.querySelectorAll('.point').forEach(b => b.addEventListener('click', () => {
    etat = 'point'; idx = +b.dataset.i; onglet = 'echelle'; versPoint(idx); rendu();
  }));
  document.querySelectorAll('.mode button').forEach(b => b.addEventListener('click', () => { guide = b.dataset.g === '1'; if (etat === 'global') rendu(); else rendu(); }));
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
  const i = PAVILLONS.indexOf(p), suivant = PAVILLONS[(i + 1) % PAVILLONS.length];
  app.innerHTML = `<main class="ecran">
    ${barre(`#/p/${p.id}/vue`)}
    ${progression(6)}
    <p class="surtitre">Synthèse</p>
    <h1 class="titre-2">Ce que tu as compris</h1>
    <ul class="lignes" style="margin-top:14px">
      ${p.synthese.map(s => `<li class="coche">${ic(s.icone)}<b>${esc(s.titre)}</b><span class="ok" aria-label="vu">${ic('valide')}</span><span>${esc(s.texte)}</span></li>`).join('')}
    </ul>
    ${galerie(p.galerie, 'Revoir le pavillon en images')}
    <p class="surtitre" style="margin-top:8px">Pavillon suivant</p>
    <a class="carte" href="#/p/${suivant.id}">
      <img src="${suivant.image}" alt="" loading="lazy">
      <div class="corps">
        <span class="numero">Pavillon ${suivant.id} · ${esc(suivant.lieu)}</span>
        <h3>${esc(suivant.titre)}</h3>
        <div class="action"><span>Explorer cette maquette</span>${ic('suivant')}</div>
      </div>
    </a>
    <div class="bas">
      <a class="btn" href="#/">Voir tous les pavillons ${ic('carte')}</a>
      <button class="btn btn--contour" id="partager">Partager ${ic('partager')}</button>
      <p class="mention">${esc(MENTION_MAQUETTE)}</p>
    </div>
  </main>`;
  initGaleries(app, [p.galerie]);
  document.getElementById('partager').addEventListener('click', async () => {
    const url = location.href.replace(/#.*$/, `#/p/${p.id}`);
    try {
      if (navigator.share) await navigator.share({ title: `ARCHE · ${p.titre}`, text: p.question, url });
      else { await navigator.clipboard.writeText(url); toast('Lien copié'); }
    } catch (e) {}
  });
}

/* ---------------------------------------------------------------- routeur */
let premier = true;
async function route() {
  const [, , id, etape] = (location.hash || '#/').split('/');
  const p = id && trouve(id);
  if (premier) { premier = false; await intro(); } else await balayage();
  window.scrollTo(0, 0);
  if (!p) vueAccueil();
  else {
    document.title = `ARCHE · ${p.titre}`;
    noterProgres(p.id, etape);
    if (!etape) vuePavillon(p);
    else if (etape === '2') vueIntro(p);
    else if (etape === '3') vueMode(p);
    else if (etape === 'vue') vueMaquette(p);
    else if (etape === 'fin') vueFin(p);
    else vuePavillon(p);
  }
  fondVisible(!app.querySelector('.vision'));
  animer(app);
}
document.addEventListener('click', e => { if (e.target.closest('[data-menu]')) ouvrirMenu(); });
addEventListener('hashchange', route);
route();
