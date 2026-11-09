/* =========================================================================
   CONTENU DES PAVILLONS
   C'est le seul fichier à modifier pour changer les textes, les points
   d'intérêt ou les images. Garder les guillemets et les virgules.
   ========================================================================= */

export const PAVILLONS = [
  {
    id: '01',
    titre: 'La ville au-dessus des nuages',
    lieu: 'Place de la Comédie',
    coord: '43.6085° N · 3.8800° E',
    question: 'Et si cette place s’élevait au-dessus des nuages ?',
    image: 'assets/img/pavillon_01.webp',
    modele: 'models/pavillon_01.glb',
    echelleMaquette: '1/2 000',
    duree: '5 min',
    accroche: 'Des quartiers suspendus pour laisser tout le sol à la forêt.',
    vueGlobale: { orbite: '35deg 68deg 1.09m', cible: '0m 0.15m 0m' },
    points: [
      {
        nom: 'Jardins suspendus',
        position: '-0.13m 0.222m -0.06m', normale: '0m 1m 0m',
        orbite: '20deg 55deg 0.61m', cible: '-0.09m 0.22m -0.04m',
        onglets: {
          echelle: { titre: 'Une île grande comme un quartier', texte: 'Chaque île mesure environ 300 m de large, soit la taille d’un quartier de 2 000 habitants. Sur la maquette, elle tient dans la main.', comparer: { humain: '1,7 m', objet: 'Une île : 300 m, soit trois terrains de football' } },
          usage: { titre: 'Habiter en terrasses', texte: 'Les logements sont empilés en dalles qui tournent légèrement. Chaque étage a son jardin et reçoit le soleil.' },
          message: { titre: 'Et si on vivait plus haut ?', texte: 'Monter la ville, c’est rendre la place au vivant en dessous. La question : jusqu’où sommes-nous prêts à quitter le sol ?' },
        },
      },
      {
        nom: 'Passerelles',
        position: '0.005m 0.2m -0.003m', normale: '0m 1m 0m',
        orbite: '80deg 62deg 0.65m', cible: '0.005m 0.2m 0m',
        onglets: {
          echelle: { titre: '400 m entre deux îles', texte: 'Les passerelles relient les îles à pied ou à vélo, en 5 minutes de marche.', comparer: { humain: '1,7 m', objet: 'Une passerelle : 400 m de long' } },
          usage: { titre: 'Se déplacer sans voiture', texte: 'Pas de routes : on circule par des passerelles légères, éclairées le soir comme des fils de lumière.' },
          message: { titre: 'Relier plutôt que bétonner', texte: 'Une ville peut-elle fonctionner avec des liens plutôt qu’avec des routes ?' },
        },
      },
      {
        nom: 'Le sol libéré',
        position: '0.12m 0.045m -0.12m', normale: '0m 1m 0m',
        orbite: '120deg 75deg 0.72m', cible: '0.08m 0.06m -0.08m',
        onglets: {
          echelle: { titre: 'Toute la place rendue à la forêt', texte: 'Sous les îles, toute la place redevient un sol vivant, que personne ne piétine.', comparer: { humain: '1,7 m', objet: 'Les îles : 400 m au-dessus du sol, plus haut que la tour Eiffel' } },
          usage: { titre: 'Une forêt sous la ville', texte: 'Les cascades arrosent le sol et rafraîchissent l’air. La nature reprend le dessous, au sens propre.' },
          message: { titre: 'Et si le sol n’était plus à nous ?', texte: 'Ce pavillon pose une question simple : à qui doit appartenir le sol d’une ville ?' },
        },
      },
    ],
    synthese: [
      { icone: 'echelle', titre: 'Échelle', texte: 'Chaque île a la taille d’un quartier.' },
      { icone: 'circulation', titre: 'Circulation', texte: 'Des passerelles relient les îles, sans voiture.' },
      { icone: 'usages', titre: 'Usages', texte: 'On habite en hauteur, la forêt reste libre en bas.' },
      { icone: 'message', titre: 'Message', texte: 'Et si on rendait le sol à la nature ?' },
    ],
  },
  {
    id: '02',
    titre: 'La serre géante',
    lieu: 'Jardin des Plantes',
    coord: '43.6150° N · 3.8720° E',
    question: 'Et si ce jardin devenait une serre habitée ?',
    image: 'assets/img/pavillon_02.webp',
    modele: 'models/pavillon_02.glb',
    echelleMaquette: '1/1 000',
    duree: '5 min',
    accroche: 'Une ville qui cultive ce qu’elle mange.',
    vueGlobale: { orbite: '40deg 65deg 1.01m', cible: '0m 0.08m 0m' },
    points: [
      {
        nom: 'La nef de verre',
        position: '0.06m 0.18m 0m', normale: '0m 1m 0m',
        orbite: '10deg 45deg 0.65m', cible: '0.03m 0.14m 0m',
        onglets: {
          echelle: { titre: 'Une serre de 300 m', texte: 'La nef couvre toute la longueur du jardin : 300 m de long, 170 m de haut au faîtage.', comparer: { humain: '1,7 m', objet: 'La nef : 170 m de haut, soit un immeuble de 50 étages' } },
          usage: { titre: 'Un climat doux toute l’année', texte: 'Le verre capte la chaleur du soleil l’hiver et s’ouvre l’été pour laisser passer l’air.' },
          message: { titre: 'Habiter dans un jardin', texte: 'Et si l’on vivait à l’intérieur d’un jardin plutôt qu’à côté ?' },
        },
      },
      {
        nom: 'Terrasses cultivées',
        position: '0.08m 0.045m -0.06m', normale: '0m 1m 0m',
        orbite: '60deg 60deg 0.55m', cible: '0.06m 0.04m -0.05m',
        onglets: {
          echelle: { titre: 'Un potager géant partagé', texte: 'Les gradins cultivés produisent une grande partie des légumes des habitants de la serre.', comparer: { humain: '1,7 m', objet: 'Les gradins : 3 hectares cultivés' } },
          usage: { titre: 'Cultiver en bas de chez soi', texte: 'Chaque gradin est entretenu par les habitants. On récolte à 2 minutes de sa porte.' },
          message: { titre: 'Manger local, vraiment', texte: 'Une ville peut-elle produire une partie de sa propre nourriture ?' },
        },
      },
      {
        nom: 'Logements en mezzanine',
        position: '-0.07m 0.1m 0.075m', normale: '0m 1m 0m',
        orbite: '-40deg 62deg 0.55m', cible: '-0.06m 0.08m 0.06m',
        onglets: {
          echelle: { titre: '40 logements par mezzanine', texte: 'Les logements sont suspendus le long de la nef, au-dessus des cultures, comme des balcons habités.', comparer: { humain: '1,7 m', objet: 'Une mezzanine : 70 m au-dessus du sol' } },
          usage: { titre: 'Vivre au-dessus du jardin', texte: 'Les fenêtres donnent sur les arbres. Le filet jaune signale les passerelles qui desservent chaque logement.' },
          message: { titre: 'Partager un même toit', texte: 'Et si tout un quartier partageait un seul grand toit de verre ?' },
        },
      },
    ],
    synthese: [
      { icone: 'echelle', titre: 'Échelle', texte: 'Une nef de verre de 300 m de long.' },
      { icone: 'vegetal', titre: 'Végétal', texte: 'Des gradins cultivés au cœur de la serre.' },
      { icone: 'usages', titre: 'Usages', texte: 'On habite au-dessus de ce que l’on cultive.' },
      { icone: 'message', titre: 'Message', texte: 'Et si la ville nourrissait ses habitants ?' },
    ],
  },
  {
    id: '03',
    titre: 'Le village de terre',
    lieu: 'Quartier Antigone',
    coord: '43.6080° N · 3.8870° E',
    question: 'Et si ce quartier était bâti avec sa propre terre ?',
    image: 'assets/img/pavillon_03.webp',
    modele: 'models/pavillon_03.glb',
    echelleMaquette: '1/200',
    duree: '5 min',
    accroche: 'Construire avec la terre du chantier.',
    vueGlobale: { orbite: '30deg 55deg 0.94m', cible: '0m 0.02m 0m' },
    points: [
      {
        nom: 'Le grand dôme',
        position: '0m 0.06m 0.01m', normale: '0m 1m 0m',
        orbite: '25deg 50deg 0.48m', cible: '0m 0.03m 0.01m',
        onglets: {
          echelle: { titre: 'Un dôme de 30 m', texte: 'Le grand dôme accueille la salle commune du village. Il est construit sans béton, en terre crue.', comparer: { humain: '1,7 m', objet: 'Le grand dôme : 30 m de diamètre' } },
          usage: { titre: 'Une salle pour tout le quartier', texte: 'Marché le matin, cinéma le soir : un seul lieu partagé plutôt que dix bâtiments.' },
          message: { titre: 'Faire plus avec moins', texte: 'Et si un bâtiment partagé valait mieux que plusieurs bâtiments vides ?' },
        },
      },
      {
        nom: 'Murs en pisé',
        position: '0.1m 0.022m -0.022m', normale: '0m 0m 1m',
        orbite: '100deg 70deg 0.43m', cible: '0.1m 0.02m -0.06m',
        onglets: {
          echelle: { titre: '50 cm d’épaisseur', texte: 'Les murs en terre tassée sont épais : ils gardent la fraîcheur l’été et la chaleur l’hiver.', comparer: { humain: '1,7 m', objet: 'Un mur en pisé : 50 cm d’épaisseur' } },
          usage: { titre: 'La terre du chantier', texte: 'On creuse les fondations, et la terre retirée devient les murs. Rien ne part en décharge.' },
          message: { titre: 'Un matériau sous nos pieds', texte: 'Et si le meilleur matériau de construction était déjà sur place ?' },
        },
      },
      {
        nom: 'Cour et chemins',
        position: '-0.045m 0.025m 0.03m', normale: '0m 1m 0m',
        orbite: '-60deg 58deg 0.51m', cible: '-0.04m 0.02m 0.03m',
        onglets: {
          echelle: { titre: 'Tout à 1 minute à pied', texte: 'Les dômes se regroupent autour d’une cour. Aucun trajet ne dépasse 100 m.', comparer: { humain: '1,7 m', objet: 'La cour : 20 m de large' } },
          usage: { titre: 'Une rue qui redevient un jardin', texte: 'Les chemins de terre battue remplacent l’asphalte : l’eau de pluie s’infiltre au lieu de ruisseler.' },
          message: { titre: 'Ralentir la ville', texte: 'Et si un quartier était pensé pour marcher, et pas pour traverser ?' },
        },
      },
    ],
    synthese: [
      { icone: 'echelle', titre: 'Échelle', texte: 'Des dômes de 13 à 30 m de diamètre.' },
      { icone: 'habitat', titre: 'Matière', texte: 'Des murs en terre crue, sans béton.' },
      { icone: 'circulation', titre: 'Circulation', texte: 'Tout le village se traverse à pied.' },
      { icone: 'message', titre: 'Message', texte: 'Et si on construisait avec ce qui est déjà là ?' },
    ],
  },
];

/* Mention obligatoire (projet d'école) : affichée en petit partout où l'on voit une maquette */
export const MENTION_MAQUETTE = 'Maquettes numériques à l’échelle, présentées dans le cadre d’un projet d’étude. Les bâtiments ne sont pas représentés à taille réelle.';
