/* =========================================================================
   ARCHE · mouvement et vie
   - intro du logo (l'oblique se trace, puis le mot se dévoile), une fois par visite
   - transition de page : le « seuil » jaune balaie l'écran à 7,3°
   - entrée en cascade des blocs, titres qui montent mot par mot
   - trame isométrique qui dérive en fond, particules de lumière (pollen)
   - cartes qui apparaissent au défilement
   Tout est coupé si l'appareil demande moins d'animations.
   ========================================================================= */
export const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibre = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

/* ---------- fond : trame iso + pollen lumineux ---------- */
let fond = null, raf = 0;
function creerFond() {
  if (fond) return;
  fond = document.createElement('div');
  fond.className = 'fond-vivant';
  fond.innerHTML = '<div class="trame"></div><canvas></canvas>';
  document.body.prepend(fond);
  if (calme) return;
  const cv = fond.querySelector('canvas'), cx = cv.getContext('2d');
  let W, H, pts = [];
  const taille = () => {
    const d = Math.min(devicePixelRatio, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    pts = Array.from({ length: Math.round(innerWidth / 14) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (0.8 + Math.random() * 2.2) * d,
      v: (0.08 + Math.random() * 0.25) * d, o: Math.random() * Math.PI * 2, j: Math.random() < 0.6,
    }));
  };
  taille(); addEventListener('resize', taille);
  const tour = t => {
    cx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.y -= p.v; p.x += Math.sin(t / 1800 + p.o) * 0.25;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      const a = 0.25 + 0.25 * Math.sin(t / 900 + p.o);
      cx.fillStyle = p.j ? `rgba(232,201,106,${a})` : `rgba(125,148,112,${a * 0.8})`;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
    raf = requestAnimationFrame(tour);
  };
  raf = requestAnimationFrame(tour);
}
export function fondVisible(oui) { creerFond(); fond.hidden = !oui; }

/* ---------- intro du logo ---------- */
export function intro() {
  if (calme || sessionStorage.getItem('arche-intro')) return Promise.resolve();
  sessionStorage.setItem('arche-intro', '1');
  const el = document.createElement('div');
  el.className = 'intro';
  el.innerHTML = `<div class="intro-logo"><span class="oblique"></span><img src="assets/logo/ARCHE_logotype_color.svg" alt="ARCHE"></div>
    <p>Architectures des futurs possibles</p>`;
  document.body.appendChild(el);
  return new Promise(res => {
    setTimeout(() => { el.classList.add('fin'); res(); }, 1700);
    setTimeout(() => el.remove(), 2400);
  });
}

/* ---------- transition entre deux écrans ---------- */
export function balayage() {
  if (calme) return Promise.resolve();
  const s = document.createElement('div'); s.className = 'seuil-balaye';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 900);
  return new Promise(res => setTimeout(res, 260));
}

/* ---------- après chaque affichage d'écran ---------- */
export function animer(racine) {
  // titres : chaque mot monte derrière un masque
  racine.querySelectorAll('.titre, .titre-2').forEach(t => {
    if (t.dataset.anime || /<[a-z]/i.test(t.innerHTML)) return; t.dataset.anime = '1';
    const mots = t.innerHTML.split(/(\s+)/);
    t.innerHTML = mots.map((m, i) => /^\s+$/.test(m) ? m : `<span class="mot"><span style="--d:${i * 28}ms">${m}</span></span>`).join('');
  });
  // blocs de l'écran en cascade
  const ecran = racine.querySelector('.ecran');
  if (ecran) [...ecran.children].forEach((c, i) => c.style.setProperty('--i', i));
  // cartes : apparition au défilement
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vue'); io.unobserve(e.target); } }), { threshold: 0.15 });
  racine.querySelectorAll('.carte, .choix, .lignes li').forEach(c => { c.classList.add('a-voir'); io.observe(c); });
  // petit retour tactile sur tout ce qui se touche (Android)
  racine.querySelectorAll('.btn, .carte, .choix, .point, .btn-rond').forEach(b => b.addEventListener('pointerdown', () => vibre(8), { passive: true }));
}

/* ---------- hero en parallaxe : couches qui glissent au défilement,
   suivent l'inclinaison du téléphone (Android) ou la souris, et la barre
   du haut devient pleine quand on quitte le hero ---------- */
let nettoyerParallaxe = null;
export function initParallaxe(hero, barre) {
  nettoyerParallaxe?.();
  if (!hero) return;
  const couches = [...hero.querySelectorAll('[data-v]')].map(el => ({ el, v: +el.dataset.v }));
  let sy = 0, ix = 0, iy = 0, cx = 0, cy = 0, run = true;
  const surScroll = () => { sy = scrollY; barre?.classList.toggle('solide', sy > hero.offsetHeight - 90); };
  const surSouris = e => { ix = (e.clientX / innerWidth - 0.5) * 2; iy = (e.clientY / innerHeight - 0.5) * 2; };
  const surTilt = e => { if (e.gamma == null) return; ix = Math.max(-1, Math.min(1, e.gamma / 25)); iy = Math.max(-1, Math.min(1, (e.beta - 45) / 25)); };
  addEventListener('scroll', surScroll, { passive: true });
  addEventListener('pointermove', surSouris, { passive: true });
  addEventListener('deviceorientation', surTilt, { passive: true });
  const tour = () => {
    if (!run) return;
    cx += (ix - cx) * 0.06; cy += (iy - cy) * 0.06;
    if (sy < hero.offsetHeight * 1.3) {
      for (const { el, v } of couches) {
        const ty = sy * v * 0.55, tx = cx * v * 14, tz = cy * v * 8;
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${(ty + tz).toFixed(1)}px, 0) scale(${(1.06 + v * 0.06 + sy * v * 0.00012).toFixed(4)})`;
      }
      const t = hero.querySelector('.hero-texte');
      if (t) { t.style.transform = `translate3d(0, ${(sy * 0.25).toFixed(1)}px, 0)`; t.style.opacity = Math.max(0, 1 - sy / (hero.offsetHeight * 0.6)).toFixed(3); }
    }
    requestAnimationFrame(tour);
  };
  surScroll();
  if (!calme) requestAnimationFrame(tour);
  hero.classList.add('pret');
  nettoyerParallaxe = () => { run = false; removeEventListener('scroll', surScroll); removeEventListener('pointermove', surSouris); removeEventListener('deviceorientation', surTilt); };
  addEventListener('hashchange', () => nettoyerParallaxe?.(), { once: true });
}
