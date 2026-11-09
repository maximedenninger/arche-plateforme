/* =========================================================================
   ARCHE · plateforme web (application d'une seule page, routes après le #)
   #/                 accueil de la plateforme (les 3 pavillons)
   #/p/01             étape 1 · accueil du pavillon
   #/p/01/2           étape 2 · avant de commencer
   #/p/01/3           étape 3 · choix du mode (réalité augmentée ou 3D)
   #/p/01/vue         étapes 4 et 5 · la maquette et ses points d'intérêt
   #/p/01/fin         étape 6 · ce que tu as compris
   ========================================================================= */
import { PAVILLONS, MENTION_MAQUETTE } from './pavillons.js';
import { ICONES } from './icones.js';
import { intro, balayage, animer, fondVisible, calme } from './anim.js';

const app = document.getElementById('app');
const ETAPES = 6;
const ic = (k, cls = '') => `<svg class="ic ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="miter" aria-hidden="true">${ICONES[k] || ''}</svg>`;
const logo = (cls = 'logo', blanc = false) => `<img class="${cls}" src="assets/logo/ARCHE_logotype_${blanc ? 'white' : 'color'}.svg" alt="ARCHE">`;
const trouve = id => PAVILLONS.find(p => p.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let modeChoisi = sessionStorage.getItem('arche-mode') || (mobile ? 'ar' : '3d');

function barre(retour, droite = '') {
  return `<header class="barre">
    ${retour ? `<a class="btn-icone" href="${retour}" aria-label="Retour">${ic('retour')}</a>` : '<span></span>'}
    ${logo()}
    ${droite || '<span></span>'}
  </header>`;
}
function progression(n) {
  return `<div class="progression" aria-label="Étape ${n} sur ${ETAPES}">
    <span class="petit">Étape ${n} sur ${ETAPES}</span>
    <ol>${Array.from({ length: ETAPES }, (_, i) => `<li class="${i < n ? 'fait' : ''}"></li>`).join('')}</ol>
  </div>`;
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---------------------------------------------------------------- accueil plateforme */
function vueAccueil() {
  document.title = 'ARCHE · Architectures des futurs possibles';
  app.innerHTML = `<main class="ecran">
    <header class="barre">${logo('logo-gauche')}<span></span></header>
    <div class="hero"><span class="balayage"></span><img src="assets/img/accueil.webp" alt="Îles habitées suspendues au-dessus des nuages, couvertes de forêts"></div>
    <p class="surtitre">Architectures des futurs possibles</p>
    <h1 class="titre">Visite les villes de demain, en maquette</h1>
    <p class="texte">Trois pavillons imaginés pour Montpellier. Chacun pose une question sur notre façon d'habiter. Choisis-en un pour l'explorer en 3D ou dans ta pièce, en réalité augmentée.</p>
    <ul class="infos">
      <li>${ic('maquette')}3 maquettes</li><li>${ic('temps')}5 min chacune</li><li>${ic('telecharger')}Sans application</li>
    </ul>
    <h2 class="surtitre" style="margin-top:32px">Les pavillons</h2>
    ${PAVILLONS.map(p => `
      <a class="carte" href="#/p/${p.id}">
        <div class="carte-img"><img src="${p.image}" alt="" loading="lazy"><span class="grand-num">${p.id}</span><span class="coord">${p.coord}</span></div>
        <div class="corps">
          <span class="numero">Pavillon ${p.id} · ${esc(p.lieu)}</span>
          <h3>${esc(p.titre)}</h3>
          <p class="texte" style="margin:0">${esc(p.accroche)}</p>
          <div class="action"><span>Explorer la maquette</span>${ic('suivant')}</div>
        </div>
      </a>`).join('')}
    <footer class="pied">
      <p class="petit">${esc(MENTION_MAQUETTE)}</p>
      <p class="petit">Projet de M2 Direction artistique · e-artsup Montpellier · 2026. Aucune donnée personnelle enregistrée.</p>
    </footer>
  </main>`;
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
    <div class="bas colle">
      <a class="btn" href="#/p/${p.id}/2">Commencer l'exploration ${ic('suivant')}</a>
      <p class="mention">Sans application · Aucune donnée enregistrée</p>
    </div>
  </main>`;
}

/* ---------------------------------------------------------------- étape 2 */
function vueIntro(p) {
  app.innerHTML = `<main class="ecran">
    ${barre(`#/p/${p.id}`)}
    ${progression(2)}
    <p class="surtitre">Avant de commencer</p>
    <h1 class="titre-2">C'est quoi une architecture spéculative ?</h1>
    <p class="texte">Des projets imaginés pour réfléchir à la façon dont nous vivrons demain. Ils ne sont pas faits pour être construits tout de suite, mais pour poser une question. Ici : <b style="color:var(--vert)">${esc(p.question)}</b></p>
    <ul class="lignes">
      <li>${ic('lumiere')}<b>Imaginer</b><span>Un futur possible : plus vert, plus dense, plus juste.</span></li>
      <li>${ic('aide')}<b>Questionner</b><span>Un enjeu d'aujourd'hui : climat, logement, ressources.</span></li>
      <li>${ic('maquette')}<b>Explorer</b><span>Tu vas tourner autour d'une maquette pour la comprendre.</span></li>
    </ul>
    <div class="bas colle"><a class="btn" href="#/p/${p.id}/3">Suivant ${ic('suivant')}</a></div>
  </main>`;
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
    </model-viewer>
    <div class="haut">
      ${barre(`#/p/${p.id}/3`)}
      <div id="prog"></div>
    </div>
    <div class="mode" role="group" aria-label="Type de visite">
      <button type="button" data-g="1" aria-pressed="true">Guidée</button><button type="button" data-g="0" aria-pressed="false">Libre</button>
    </div>
    <div class="outils">
      <button class="btn-rond" id="recentrer" aria-label="Revenir à la vue d'ensemble">${ic('maquette')}</button>
      <button class="btn-rond" id="ar" aria-label="Voir en réalité augmentée" hidden>${ic('realite_augmentee')}</button>
    </div>
    <p class="echelle-note">Maquette au ${p.echelleMaquette}, socle de 40 cm. Le bâtiment n'est pas représenté à taille réelle.</p>
    <section class="panneau" id="panneau" aria-live="polite"></section>
  </main>`;
  const mv = document.getElementById('mv');
  const panneau = document.getElementById('panneau');
  const prog = document.getElementById('prog');
  const btnAR = document.getElementById('ar');

  mv.addEventListener('progress', e => { const i = document.querySelector('#charge i'); if (i) i.style.width = (e.detail.totalProgress * 100) + '%'; });
  mv.addEventListener('load', () => {
    mv.classList.add('chargee');
    document.querySelectorAll('.point').forEach((b, i) => setTimeout(() => b.classList.add('apparait'), 500 + i * 220));
    document.getElementById('charge')?.remove();
    if (mv.canActivateAR) btnAR.hidden = false;
    rendu();
  });
  mv.addEventListener('error', () => toast('La maquette n’a pas pu se charger. Vérifie ta connexion.'));
  mv.addEventListener('ar-status', e => { if (e.detail.status === 'failed') toast('La réalité augmentée n’est pas disponible sur cet appareil.'); });

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
  const lancerAR = () => {
    if (mv.canActivateAR) mv.activateAR();
    else toast('Ouvre cette page sur ton téléphone pour la réalité augmentée.');
  };

  function rendu() {
    document.querySelectorAll('.point').forEach(b => b.classList.toggle('actif', +b.dataset.i === idx && etat === 'point'));
    document.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.g === (guide ? 1 : 0))));
    prog.innerHTML = progression(etat === 'point' ? 5 : 4);
    mv.autoRotate = etat === 'global' && !calme;
    if (etat === 'global') {
      const ar = modeChoisi === 'ar' && mv.canActivateAR;
      panneau.innerHTML = `<div class="poignee"></div>
        <p class="surtitre">Vue globale</p>
        <h2 class="titre-2" style="font-size:22px">Fais le tour de la maquette</h2>
        <p class="texte">Glisse pour tourner, pince pour zoomer. ${guide ? `La visite t'emmène vers les ${p.points.length} points jaunes.` : 'Touche un point jaune pour l’ouvrir.'}</p>
        ${ar ? `<button class="btn" id="placer">Placer la maquette devant moi ${ic('realite_augmentee')}</button>` : ''}
        ${guide ? `<button class="btn ${ar ? 'btn--contour' : ''}" id="commencer">Commencer la visite guidée ${ic('suivant')}</button>`
                : `<a class="btn ${ar ? 'btn--contour' : ''}" href="#/p/${p.id}/fin">Terminer la visite ${ic('suivant')}</a>`}
        <p class="note">Maquette au ${p.echelleMaquette}, socle de 40 cm. Le bâtiment n'est pas représenté à taille réelle.</p>`;
      panneau.querySelector('#placer')?.addEventListener('click', lancerAR);
      panneau.querySelector('#commencer')?.addEventListener('click', () => { etat = 'point'; idx = 0; onglet = 'echelle'; versPoint(0); rendu(); });
    } else {
      const pt = p.points[idx], o = pt.onglets[onglet], dernier = idx === p.points.length - 1;
      panneau.innerHTML = `<div class="poignee"></div>
        <button class="btn-icone fermer" id="fermer" aria-label="Fermer le point">${ic('fermer')}</button>
        <p class="surtitre">Point ${idx + 1} sur ${p.points.length} · ${esc(pt.nom)}</p>
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
addEventListener('hashchange', route);
route();
