# ARCHE · plateforme web

Plateforme nationale qui recense des architectures spéculatives installées sur des lieux réels, partout en France, et permet d'explorer leurs maquettes en 3D ou en réalité augmentée, sans application.

> Les bâtiments sont présentés comme des **maquettes à l'échelle** (socle de 40 cm), pas à taille réelle. La mention apparaît en petit sur l'accueil, dans la visionneuse, sur la synthèse et en pied de page.

## Comment le site est organisé

| Page | Adresse | Rôle |
|---|---|---|
| Accueil | `#/` | Présentation, carte de France, maquettes en ligne, agenda, prochaines ouvertures |
| Explorer | `#/explorer` | Tous les lieux : recherche, filtres (statut, thème, ville, suivis), tri « Autour de moi » |
| Carte | `#/carte` | Le même catalogue, vu sur la carte de France |
| Ville | `#/ville/lyon` | Les lieux et les événements d'une ville |
| Lieu | `#/lieu/mtp-01` | La fiche d'un lieu. S'il est explorable, le parcours en 6 étapes de la maquette |
| Événements | `#/evenements` et `#/evenement/<slug>` | L'agenda : en cours, à venir, passés |
| Accueillir ARCHE | `#/accueillir` | Pour les villes, festivals et lieux culturels |
| La démarche | `#/a-propos` | Les thèmes, les collectifs, les codes des lieux |

Les anciens liens `#/p/01`, `#/p/02`, `#/p/03` redirigent automatiquement vers `#/lieu/mtp-01`, etc.

## Les données (le seul endroit à modifier pour le contenu)

| Fichier | Contenu |
|---|---|
| `data/catalogue.json` | Tous les lieux, villes, thèmes, statuts et collectifs. Léger, chargé à l'ouverture. |
| `data/evenements.json` | Les événements (dates, adresse, lieux présentés, dispositifs sur place). |
| `data/pavillons/<code>.json` | Le contenu détaillé d'une maquette explorable (galerie, points d'intérêt, synthèse). Chargé seulement quand on l'ouvre. |
| `data/galerie-speculative.json` | La galerie de l'étape « C'est quoi une architecture spéculative ? ». |

Les chiffres affichés (nombre de lieux, de villes, d'événements) sont **calculés** à partir de ces fichiers : rien à mettre à jour à la main.
Le statut d'un événement (en cours, à venir, terminé) se calcule aussi tout seul avec la date du jour.

### Chaque lieu a un code

Trois lettres pour la ville, deux chiffres pour le lieu : `MTP-01`, `LYS-01`, `PAR-02`… C'est le code imprimé sur les plaques QR, et l'adresse du lieu en minuscules (`#/lieu/mtp-01`).

### Ajouter un lieu

1. Si la ville n'existe pas, l'ajouter dans `villes` de `catalogue.json` (nom, région, latitude, longitude). Elle apparaît seule sur la carte.
2. Ajouter le lieu dans `lieux` : code, ville, site, latitude, longitude, titre, thème, statut, porteur, question, accroche, image.
3. Statut `bientot` : ajouter `"ouverture": "2027-09"`. Statut `creation` : rien de plus.
4. Pour le rendre explorable : passer le statut à `explorable`, ajouter `"duree"` et `"fiche": "data/pavillons/<code>.json"`, créer ce fichier sur le modèle de `mtp-01.json` et mettre la maquette `.glb` dans `models/`.

### Ajouter un événement

Ajouter une entrée dans `evenements.json` avec un `slug` unique, les dates `debut` et `fin` (AAAA-MM-JJ), la ville, l'adresse, les `formats` (plaques, stand, ecran) et les codes des `lieux` présentés.

### Adresse de contact

La page « Accueillir ARCHE » affiche un bouton « Écrire à l'équipe » dès que `"contact"` est rempli en haut de `catalogue.json` (par exemple `"contact": "bonjour@exemple.fr"`). Tant qu'il est vide, le bouton indique que le formulaire arrive bientôt.

## Ce qui reste sur le téléphone du visiteur

Rien n'est envoyé nulle part : pas de compte, pas de statistiques. Seuls sont gardés sur l'appareil la progression des visites, les lieux « suivis » et, si le visiteur l'accepte, sa position pour trier les lieux par distance (jamais enregistrée).

## Fichiers du code

| Fichier | Rôle |
|---|---|
| `index.html` | La page unique du site. |
| `assets/js/app.js` | Les écrans et le routeur. |
| `assets/js/donnees.js` | Chargement des données, dates, distances, recherche, export agenda (.ics). |
| `assets/js/fond-carte.js` | Le fond de carte de France (Natural Earth, domaine public), généré par `outils/carte.mjs`. |
| `assets/js/anim.js` | Animations (intro, parallaxe, sections horizontales, fond vivant). |
| `assets/css/arche.css` | Le style, aux couleurs et typographies de la charte. |
| `models/` | Les maquettes 3D au format GLB. |
| `assets/vendor/model-viewer.min.js` | La visionneuse 3D et AR de Google (aucun service externe). |
| `outils/gen_maquettes.py` | Le script qui a généré les maquettes provisoires. |

## Tester sur son Mac

Dans le Terminal, depuis ce dossier : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000`.
Les données sont des fichiers JSON : le site doit être ouvert par un serveur (GitHub Pages, Netlify ou la commande ci-dessus), pas en double-cliquant sur `index.html`.
La réalité augmentée ne fonctionne qu'en ligne (HTTPS) sur un téléphone.
