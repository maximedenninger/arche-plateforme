# ARCHE · plateforme web

Expérience mobile pour explorer trois maquettes d'architectures spéculatives, en 3D ou en réalité augmentée, sans application.
Projet de M2 Direction artistique, e-artsup Montpellier, 2026.

> Les bâtiments sont présentés comme des **maquettes à l'échelle** (socle de 40 cm), pas à taille réelle. La mention apparaît en petit sur l'accueil, dans la visionneuse et sur la synthèse.

## Ce qu'il y a dans le dossier

| Dossier ou fichier | Rôle |
|---|---|
| `index.html` | La page unique du site. |
| `assets/js/pavillons.js` | **Tous les textes** des pavillons, des points d'intérêt et de la synthèse. C'est le fichier à modifier pour changer le contenu. |
| `assets/js/app.js` | Le fonctionnement des écrans (parcours en 6 étapes). |
| `assets/css/arche.css` | Le style, aux couleurs et typographies de la charte. |
| `models/` | Les 3 maquettes 3D au format GLB (une par pavillon). Elles peuvent être remplacées par des maquettes exportées de Blender, avec le même nom de fichier. |
| `assets/img/`, `assets/logo/`, `assets/fonts/` | Images d'ambiance, logo ARCHE et polices de la charte. |
| `assets/vendor/model-viewer.min.js` | La visionneuse 3D et AR de Google (aucun service externe). |
| `outils/gen_maquettes.py` | Le script qui a généré les maquettes provisoires. |
| `robots.txt` | Demande aux moteurs de recherche de ne pas référencer le site. |

## Parcours

1. Accueil du pavillon
2. Avant de commencer (c'est quoi l'architecture spéculative)
3. Choix du mode : réalité augmentée (téléphone) ou 3D
4. Vue globale de la maquette, avec 3 points jaunes
5. Points d'intérêt, en visite guidée ou libre (onglets Échelle, Usage, Message)
6. Synthèse et pavillon suivant

Un QR code peut mener directement à un pavillon : `…/#/p/01`, `…/#/p/02` ou `…/#/p/03`.

## Tester sur son Mac

Dans le Terminal, depuis ce dossier : `python3 -m http.server 8000`, puis ouvrir `http://localhost:8000`.
La réalité augmentée ne fonctionne qu'en ligne (HTTPS) sur un téléphone.

## Remplacer une maquette par une version Blender

Exporter en glTF binaire (`.glb`), unités en mètres, socle d'environ 40 cm, puis remplacer le fichier dans `models/`. Si les bâtiments bougent, ajuster les positions des points dans `pavillons.js` (`position`, `cible`, `orbite`).
