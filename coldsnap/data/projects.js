/**
 * ColdSnap Projects Data
 *
 * HOW TO ADD A NEW PROJECT:
 * ========================
 *
 * Simply add a new object to the COLDSNAP_PROJECTS array below.
 * Each project should follow this structure:
 *
 * {
 *   id: 'unique-id',                    // Required: Unique identifier (no spaces, use hyphens)
 *   category: 'Category Name',          // Required: one of the CATEGORIES below (drives the Work filters)
 *   fit: ['app', 'museum'],             // Optional: project-picker matching (js/request-helper.js): what (kiosk, game, app, web), who (museum, school, public, company)
 *   type: 'Game' | 'App' | 'Website',   // Required: Short type label shown on cards
 *   title: 'Project Title',             // Required: Display title
 *   shortDescription: 'Brief desc...',  // Optional: Short text for card (max ~100 chars)
 *   description: 'Full description...', // Optional: Detailed description for the viewer
 *   icon: '🎮',                         // Optional: Emoji icon if no thumbnail
 *   thumbnail: '/path/to/image.jpg',    // Optional: Thumbnail image path
 *   media: [                            // Optional: images/videos for the viewer (run tools/coldsnap-media.py after adding)
 *     '/path/to/image1.jpg',
 *     '/path/to/video.mp4'
 *   ],
 *   tech: ['Unity', 'C#', 'Firebase'],  // Optional: Technology tags
 *   features: [                         // Optional: List of features for the viewer
 *     'Feature 1',
 *     'Feature 2'
 *   ],
 *   links: [                            // Optional: Action buttons in the viewer
 *     { label: 'Play Now', href: 'https://...', icon: 'fa-play' },
 *     { label: 'GitHub', href: 'https://...', icon: 'fa-github' }
 *   ],
 *   featured: true,                     // Optional: the project the viewer opens on
 *   coinSlot: 'https://...',            // Optional: shows a coin to drag into a slot, which opens this address (js/arcade-coin.js)
 *   fr: {                               // Optional: French text; any field missing here falls back to English
 *     type: '...', shortDescription: '...', description: '...', features: ['...'],
 *     thumbnail: '...', media: ['...']  // Optional: French screenshots, when the app's UI is in French
 *   }
 * }
 *
 * CATEGORIES:
 * - 'Interactive Installations' - Museum kiosks, training centres, large-screen exhibits
 * - 'Games' - PC, mobile and web games
 * - 'Flutter Apps' - Cross-platform mobile/desktop apps
 * - 'Web Platforms' - Web applications and sites
 * - 'Open Source' - Public tools, libraries and plugins
 *
 * Links starting with /apps/ point at nathandecastro.com (privacy policies live there).
 */

const COLDSNAP_PROJECTS = [
  // ============================================
  // INTERACTIVE INSTALLATIONS
  // ============================================
  {
    id: 'cpps-exhibit',
    category: 'Interactive Installations',
    fit: ['kiosk', 'game', 'museum', 'school', 'public'],
    type: 'Museum Installation',
    title: 'CPPS Earthquake Museum',
    featured: true,
    shortDescription: 'Exhibit framework, touchscreen mini-games and an escape game for a public earthquake training centre',
    description: 'The complete technology stack of a public earthquake training centre and museum in Switzerland: an integrated exhibit framework across 3 spaces and 27 interactive stations, designed with seismology experts and university professors. 30+ touchscreen mini-games and a fleet of 30 wall-mounted tablets, each running its own kiosked app over a secured local network, centrally configured and remotely updated. Around it: Escape With Wallis, an hour-long escape game guiding visitors through the exhibit, and a reservation and payment platform for state, private and educational clients with automated invoicing and reporting. The centre is also home to Europe\'s largest earthquake simulator.',
    icon: '🏛️',
    thumbnail: '/assets/projects/cpps/cpps-1-thumb.webp',
    media: [
      '/assets/projects/cpps/cpps-1.jpg',
      '/assets/projects/cpps/cpps-2.jpg',
      '/assets/projects/cpps/cpps-3.jpg',
      '/assets/projects/cpps/cpps-4.jpg',
      '/assets/projects/cpps/cpps-5.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Exhibit corner with a wall touchscreen, Swiss seismic map and rock samples on a wooden counter',
      'Touchscreen game \'The magnitude of an earthquake\': a magnitude slider compares the 1964 Alaska quake with Switzerland',
      'Touchscreen game \'How to locate an earthquake\': seismometers placed on a map of the Alps to find the epicentre',
      'Exhibition hall with wall screens, a long wooden table of interactive stations and a seismic cable installation',
      'Exhibition space with an illuminated landscape diorama, a wall touchscreen and a wooden house model'
    ],
    stats: [
      { value: '30k', label: 'visitors / year', fr: 'visiteurs / an' },
      { value: '27', label: 'interactive stations', fr: 'stations interactives' },
      { value: '30+', label: 'touchscreen mini-games', fr: 'mini-jeux tactiles' }
    ],
    tech: ['Unity', 'Android', 'Docker', 'Firebase', 'Stripe', 'Kiosk UI'],
    features: [
      '30+ touchscreen mini-games across 3 spaces and 27 stations',
      'Fleet of 30 kiosked wall tablets, centrally configured and remotely updated',
      'Escape With Wallis: hour-long escape game, 3,000+ sessions completed',
      'Reservation and payment platform, 50,000 users a year',
      'Designed with seismology experts and university professors',
      'Multi-language content'
    ],
    links: [
      { label: 'See it on Valbilon', labelFr: 'Voir le projet sur Valbilon', href: 'https://www.valbilon.com/projects/cpps-exhibit', icon: 'fa-external-link' }
    ],
    fr: {
      alt: [
        'Coin d\'exposition avec écran tactile mural, carte sismique de la Suisse et échantillons de roche sur un comptoir en bois',
        'Jeu tactile « La magnitude d\'un séisme » : un curseur compare le séisme d\'Alaska de 1964 à la Suisse',
        'Jeu tactile « Localiser un séisme » : des sismomètres placés sur une carte des Alpes pour trouver l\'épicentre',
        'Salle d\'exposition avec écrans muraux, longue table en bois de stations interactives et installation de câble sismique',
        'Espace d\'exposition avec diorama de paysage éclairé, écran tactile mural et maquette de maison en bois'
      ],
      type: 'Installation muséale',
      shortDescription: 'Parcours d\'exposition, mini-jeux tactiles et escape game pour un centre public de formation aux séismes',
      description: 'Toute la technologie d\'un centre public de formation et de prévention des séismes en Suisse : un parcours d\'exposition interactif sur 3 espaces et 27 stations, conçu avec des sismologues et des professeurs d\'université. Plus de 30 mini-jeux tactiles et une flotte de 30 tablettes murales, chacune en mode kiosque sur un réseau local sécurisé, configurées et mises à jour à distance. Autour : Escape With Wallis, un escape game d\'une heure qui guide les visiteurs à travers l\'exposition, et une plateforme de réservation et de paiement pour clients publics, privés et scolaires, avec facturation et reporting automatisés. Le centre abrite aussi le plus grand simulateur de séisme d\'Europe.',
      features: [
        'Plus de 30 mini-jeux tactiles sur 3 espaces et 27 stations',
        'Flotte de 30 tablettes murales en kiosque, pilotées et mises à jour à distance',
        'Escape With Wallis : escape game d\'une heure, plus de 3 000 sessions jouées',
        'Plateforme de réservation et de paiement, 50 000 utilisateurs par an',
        'Conçu avec des sismologues et des professeurs d\'université',
        'Contenus multilingues'
      ]
    }
  },
  {
    id: 'sdana-installation',
    category: 'Interactive Installations',
    fit: ['kiosk', 'museum', 'public', 'school'],
    type: 'Touchscreen Installation',
    title: 'SDANA Natural Hazards Installation',
    shortDescription: 'Large-format educational touchscreen teaching visitors about natural hazards in Valais',
    description: 'An interactive installation created for SDANA, the Service des dangers naturels du Valais. Designed for a massive touchscreen at the SDANA facility, the experience helps visitors understand major natural hazards, their mechanisms, and the right behaviours to adopt through multilingual educational scenes and guided visual exploration.',
    thumbnail: '/assets/projects/sdana/sdana-1-thumb.webp',
    media: [
      '/assets/projects/sdana/sdana-1.png',
      '/assets/projects/sdana/sdana-2.png',
      '/assets/projects/sdana/sdana-3.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Home screen of the Natural Hazards touchscreen: illustrated panels of avalanches, floods, storms and rockfall',
      'Storm definition screen: a short explanation next to a photo of a storm cloud over fields',
      'Storm mechanism screen in German: the maturing phase of a cumulonimbus with a step slider'
    ],
    tech: ['Interactive Installation', 'Large Touchscreen', 'Multi-language UX'],
    features: [
      'Built for a large public touchscreen display',
      'Covers multiple natural hazards and risk scenarios',
      'Explains hazard mechanisms with guided visual content',
      'Behaviour and safety guidance for visitors',
      'Multi-language navigation and content'
    ],
    links: [],
    fr: {
      alt: [
        'Écran d\'accueil de la borne Dangers naturels : panneaux illustrés d\'avalanches, crues, orages et chutes de pierres',
        'Écran « Orage, définition » : une courte explication à côté d\'une photo de nuage d\'orage sur des champs',
        'Écran sur le mécanisme de l\'orage en allemand : phase de maturité d\'un cumulonimbus avec curseur d\'étapes'
      ],
      type: 'Installation tactile',
      shortDescription: 'Grand écran tactile pédagogique sur les dangers naturels en Valais',
      description: 'Une installation interactive créée pour le SDANA, le Service des dangers naturels du Valais. Pensée pour un très grand écran tactile dans les locaux du SDANA, l\'expérience aide les visiteurs à comprendre les principaux dangers naturels, leurs mécanismes et les bons comportements à adopter, à travers des scènes pédagogiques multilingues et une exploration visuelle guidée.',
      features: [
        'Conçue pour un grand écran tactile public',
        'Couvre plusieurs dangers naturels et scénarios de risque',
        'Explique les mécanismes avec des contenus visuels guidés',
        'Conseils de comportement et de sécurité',
        'Navigation et contenus multilingues'
      ]
    }
  },
  {
    id: 'helpdetective',
    category: 'Interactive Installations',
    fit: ['game', 'school', 'public', 'company'],
    type: 'VR Training',
    title: 'HelpDetective',
    shortDescription: 'Standalone VR on Meta Quest: step into a care job through 360° video, answer questions and spot the dangers',
    description: 'HelpDetective puts people inside the daily life of care jobs that are little known or undervalued, such as childcare, to make them want to work there. It runs on Meta Quest 2 and 3 headsets, fully offline. A 360° video plays around the player and stops at set moments for a question; between questions, a flashlight is used to spot the dangers hidden in the room. The thumbstick moves smoothly forward and back through time. Scenarios are plain files, and a workshop inside the headset lets trainers create and edit them without a new build. It replaces older web-based 360° tools the client found slow and dated.',
    icon: '🥽',
    thumbnail: '/assets/projects/helpdetective/helpdetective-1-thumb.webp',
    media: [
      '/assets/projects/helpdetective/helpdetective-1.jpg',
      '/assets/projects/helpdetective/helpdetective-2.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'A question panel floating in a 360° video of a living room: what is the adult doing while the child talks?',
      'HelpDetective menu in the headset with the \'Le salon\' scenario card and the workshop button'
    ],
    tech: ['Unity 6', 'OpenXR', 'Meta Quest', 'UI Toolkit', '360° video'],
    features: [
      '360° video that pauses for multiple-choice questions',
      'Flashlight hunt for hidden dangers in each scene',
      'Smooth scrubbing through time with the thumbstick',
      'In-headset workshop to create and edit scenarios',
      'Fully offline on Quest 2 and Quest 3',
      'Explanations after a wrong answer, then a retry'
    ],
    links: [],
    fr: {
      alt: [
        'Un panneau de question flotte dans une vidéo 360° d\'un salon : que fait l\'adulte pendant que l\'enfant lui parle ?',
        'Menu de HelpDetective dans le casque avec la carte du scénario « Le salon » et le bouton Atelier'
      ],
      type: 'Formation en VR',
      shortDescription: 'VR autonome sur Meta Quest : se glisser dans un métier du soin en vidéo 360°, répondre aux questions et repérer les dangers',
      description: 'HelpDetective plonge dans le quotidien de métiers du soin méconnus ou peu valorisés, comme la petite enfance, pour donner envie d\'y travailler. Il tourne sur casques Meta Quest 2 et 3, entièrement hors ligne. Une vidéo 360° se joue autour du joueur et s\'arrête à des moments choisis pour poser une question ; entre deux questions, une lampe torche sert à repérer les dangers cachés dans la pièce. Le stick fait avancer et reculer le temps en douceur. Les scénarios sont de simples fichiers, et un atelier dans le casque permet aux formateurs de les créer et de les modifier sans nouvelle version de l\'app. Il remplace d\'anciens outils 360° sur le web que le client trouvait lents et datés.',
      features: [
        'Vidéo 360° qui s\'arrête pour des questions à choix multiples',
        'Chasse aux dangers cachés à la lampe torche',
        'Avance et retour fluides dans le temps au stick',
        'Atelier dans le casque pour créer et modifier les scénarios',
        'Entièrement hors ligne sur Quest 2 et Quest 3',
        'Explication après une mauvaise réponse, puis nouvel essai'
      ]
    }
  },

  // ============================================
  // FLUTTER APPS
  // ============================================
  {
    id: 'spinlab',
    category: 'Flutter Apps',
    fit: ['app', 'web', 'company'],
    type: 'Mobile App',
    title: 'SpinLab',
    shortDescription: 'Platform connecting tennis players with certified coaches for booking lessons',
    description: 'A comprehensive platform that connects tennis players with certified coaches. Features include geolocated coach discovery, instant booking, secure payment processing, and training progress tracking. Built with Flutter for seamless cross-platform experience.',
    icon: '🎾',
    thumbnail: '/assets/projects/spinlab/spinlab-1-thumb.webp?v=20261029',
    media: [
      '/assets/projects/spinlab/spinlab-1.jpeg?v=20261029',
      '/assets/projects/spinlab/spinlab-2.jpeg?v=20261029',
      '/assets/projects/spinlab/spinlab-3.jpeg?v=20261029',
      '/assets/projects/spinlab/spinlab-4.jpeg?v=20261029',
      '/assets/projects/spinlab/spinlab-5.jpeg?v=20261029',
      '/assets/projects/spinlab/spinlab-6.jpeg?v=20261029'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'SpinLab coach list with photos, sports, hourly rates and distance',
      'Map of Paris with coach photos as pins',
      'Coach profile with speciality, rate per hour and biography',
      'Booking screen: available days, a calendar and time slots',
      'Booking confirmation dialog with the total and cancellation terms before payment',
      'Coach view of upcoming paid bookings with dates, times and a revoke button'
    ],
    tech: ['Flutter', 'Dart', 'Firebase', 'Stripe', 'Google Maps'],
    features: [
      'Geolocated coach discovery',
      'Real-time booking system',
      'Secure payment via Stripe',
      'Training progress tracking',
      'In-app messaging',
      'Review and rating system'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.spinlab', icon: 'fa-android', style: 'play-store' },
      { label: 'App Store', href: 'https://apps.apple.com/fr/app/spinlab/id6758303721', icon: 'fa-apple', style: 'app-store' },
      { label: 'Visit Website', labelFr: 'Site web', href: 'https://spinlab.fr', icon: 'fa-globe', secondary: true },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: 'https://spinlab.fr/politique-de-confidentialite/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Liste des coachs SpinLab avec photos, sports, tarifs horaires et distance',
        'Carte de Paris avec les photos des coachs en repères',
        'Profil d\'un coach : spécialité, tarif horaire et biographie',
        'Écran de réservation : jours disponibles, calendrier et créneaux horaires',
        'Fenêtre de confirmation de réservation avec le total et les conditions d\'annulation avant paiement',
        'Vue coach des réservations payées à venir, avec dates, heures et bouton d\'annulation'
      ],
      type: 'App mobile',
      shortDescription: 'Plateforme qui met en relation joueurs de tennis et coachs certifiés pour réserver des cours',
      description: 'Une plateforme complète qui met en relation joueurs de tennis et coachs certifiés : recherche de coachs géolocalisée, réservation instantanée, paiement sécurisé et suivi de progression. Développée en Flutter pour une expérience fluide sur toutes les plateformes.',
      features: [
        'Recherche de coachs géolocalisée',
        'Réservation en temps réel',
        'Paiement sécurisé via Stripe',
        'Suivi de progression',
        'Messagerie intégrée',
        'Avis et notes'
      ]
    }
  },
  {
    id: 'exploreum',
    category: 'Flutter Apps',
    fit: ['app', 'game', 'museum', 'public'],
    type: 'Edutainment App',
    title: 'Exploreum',
    shortDescription: 'Museums, towns and walks turned into interactive stories to play on your phone',
    description: 'Exploreum turns a museum visit, a walk through town or an outdoor site into a story you play on your phone. Each experience strings together illustrated pages and games: quizzes, estimates, ranking and sorting challenges, picture puzzles and map challenges. Guided walks show their stops on a map, so visitors always know where to go next. Some experiences play anywhere; others unlock on site with a QR code on a sign. No account needed to start, no ads, in French, English and German. Partner museums and venues get their own page, and run their scenarios, events and printed codes from a web back office.',
    icon: '🧭',
    thumbnail: '/assets/projects/exploreum/exploreum-en-1-thumb.webp',
    media: [
      '/assets/projects/exploreum/exploreum-en-1.jpg',
      '/assets/projects/exploreum/exploreum-en-2.jpg',
      '/assets/projects/exploreum/exploreum-en-3.jpg',
      '/assets/projects/exploreum/exploreum-en-4.jpg',
      '/assets/projects/exploreum/exploreum-en-5.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Story intro: a night mountain lit by a flash, \'Step inside the story\'',
      'Hands-on challenge: draw distance circles on a map to find the vent of an eruption',
      'Trail map of Visp with numbered stops through the old town',
      'Hazard Watch experience card: virtual, about 20 minutes, with a start button',
      'Badges screen with milestones and streaks to collect'
    ],
    tech: ['Flutter', 'Firebase', 'Cloud Functions', 'Next.js', 'App Check', 'OpenStreetMap'],
    features: [
      'Illustrated story pages with quizzes, estimates, sorting and puzzle challenges',
      'On-site experiences unlocked by QR code on printed signs',
      'Guided walks with a step-by-step map',
      'Audio guide and several languages for some experiences',
      'Daily streak, badges, and resume where you left off',
      '"Near you" list, only when location is shared',
      'A page for each partner museum and venue',
      'Web back office for partners: scenarios, events, printed codes',
      'Play without an account; iPhone, Android and web'
    ],
    links: [
      { label: 'Try the App', labelFr: 'Essayer l\'app', href: 'https://exploreum.coldsnap.fr/', icon: 'fa-globe' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.exploreum', icon: 'fa-android', style: 'play-store' },
      { label: 'App Store', href: 'https://apps.apple.com/app/exploreum/id6822310253', icon: 'fa-apple', style: 'app-store' },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: 'https://exploreum.web.app/privacy', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Introduction de l\'histoire : une montagne de nuit éclairée par un éclair, « Entrez dans l\'histoire »',
        'Défi concret : tracer des cercles de distance sur une carte pour trouver la cheminée d\'une éruption',
        'Carte du parcours de Viège avec des étapes numérotées dans la vieille ville',
        'Fiche de l\'expérience Hazard Watch : virtuelle, environ 20 minutes, avec un bouton pour commencer',
        'Écran des badges : étapes et séries à collectionner'
      ],
      type: 'App ludo-éducative',
      shortDescription: 'Musées, villes et balades deviennent des histoires interactives à jouer sur son téléphone',
      description: 'Exploreum transforme la visite d\'un musée, une balade en ville ou un site en plein air en une histoire à jouer sur son téléphone. Chaque expérience enchaîne des pages illustrées et des jeux : quiz, estimations, défis de classement et de tri, puzzles d\'images et défis sur carte. Les balades guidées affichent leurs étapes sur une carte : on sait toujours où aller ensuite. Certaines expériences se jouent partout, d\'autres se débloquent sur place grâce au QR code d\'un panneau. Sans compte pour commencer, sans publicité, en français, anglais et allemand. Les musées et lieux partenaires ont leur propre page et gèrent leurs scénarios, événements et codes imprimés depuis un espace web.',
      thumbnail: '/assets/projects/exploreum/exploreum-fr-1-thumb.webp',
      media: [
        '/assets/projects/exploreum/exploreum-fr-1.jpg',
        '/assets/projects/exploreum/exploreum-fr-2.jpg',
        '/assets/projects/exploreum/exploreum-fr-3.jpg',
        '/assets/projects/exploreum/exploreum-fr-4.jpg',
        '/assets/projects/exploreum/exploreum-fr-5.jpg'
      ],
      features: [
        'Pages illustrées avec quiz, estimations, défis de tri et puzzles',
        'Expériences sur place débloquées par QR code sur des panneaux imprimés',
        'Balades guidées avec carte, étape par étape',
        'Audioguide et plusieurs langues pour certaines expériences',
        'Série de jours, badges, et reprise là où on en était',
        'Liste « Près de vous », seulement si la position est partagée',
        'Une page pour chaque musée et lieu partenaire',
        'Espace web pour les partenaires : scénarios, événements, codes imprimés',
        'Jouable sans compte ; iPhone, Android et web'
      ]
    }
  },
  {
    id: 'winston',
    category: 'Flutter Apps',
    fit: ['web', 'company'],
    type: 'Web App',
    title: 'Winston',
    shortDescription: 'Company-wide admin butler: accounting, contracts, invoicing and AI-powered LinkedIn management in one dashboard',
    description: 'Winston is an internal company-wide admin platform built to run the full back-office of a multi-company studio. It handles quotes, invoices, business expenses, and contracts end-to-end, with PDF generation and export throughout. On top of that, it features an AI-powered LinkedIn content pipeline that automatically generates and publishes professional posts from news articles using GPT-4o-mini. Multi-company support means the same dashboard manages all entities under the studio umbrella.',
    icon: '🤖',
    thumbnail: '/assets/projects/winston/winston-1-thumb.webp?v=20261110',
    media: [
      '/assets/projects/winston/winston-1.png?v=20261110'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Winston accounting dashboard with CHF, EUR and USD ledgers and status overview'
    ],
    tech: ['Flutter Web', 'Dart', 'Firebase', 'OpenAI GPT-4o-mini', 'LinkedIn API', 'Cloud Functions'],
    features: [
      'Quotes, invoices, and business expense management',
      'Contract creation and tracking',
      'PDF generation and export for all documents',
      'Multi-company management from a single dashboard',
      'AI LinkedIn post generation from articles (GPT-4o-mini)',
      'Direct LinkedIn publishing via OAuth',
      'Firebase Authentication and Firestore backend',
      'Serverless Cloud Functions architecture'
    ],
    links: [],
    fr: {
      alt: [
        'Tableau de bord comptable Winston avec registres en CHF, EUR et USD et vue des statuts'
      ],
      type: 'App web',
      shortDescription: 'Le majordome administratif : comptabilité, contrats, facturation et LinkedIn assisté par IA dans un seul tableau de bord',
      description: 'Winston est une plateforme d\'administration interne qui gère tout le back-office d\'un studio multi-sociétés : devis, factures, notes de frais et contrats de bout en bout, avec génération et export PDF. Elle intègre aussi un pipeline de contenu LinkedIn assisté par IA qui rédige et publie des posts professionnels à partir d\'articles d\'actualité (GPT-4o-mini). Le support multi-sociétés permet de piloter toutes les entités du studio depuis un seul tableau de bord.',
      features: [
        'Gestion des devis, factures et notes de frais',
        'Création et suivi des contrats',
        'Génération et export PDF de tous les documents',
        'Gestion multi-sociétés depuis un seul tableau de bord',
        'Génération de posts LinkedIn par IA (GPT-4o-mini)',
        'Publication LinkedIn directe via OAuth',
        'Backend Firebase Authentication et Firestore',
        'Architecture serverless Cloud Functions'
      ]
    }
  },
  {
    id: 'vidanim',
    category: 'Flutter Apps',
    fit: ['app', 'web', 'school'],
    type: 'Mobile/Web App',
    title: 'Vidanim',
    shortDescription: 'Activity library for teachers and animators to document, estimate, and share creative work',
    description: 'Vidanim helps teachers and animators keep track of the activities they create for children. Each entry can include photos, required materials, and the time it took to prepare, making it easier to reuse successful ideas and plan future sessions. The app also supports sharing activities with other Vidanim users so teams can collaborate and build a reusable knowledge base together.',
    thumbnail: '/assets/projects/Vidanim/vidanim%20(1)-thumb.webp',
    media: [
      '/assets/projects/Vidanim/vidanim%20(1).jpg',
      '/assets/projects/Vidanim/vidanim%20(2).jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Vidanim activity list: each card shows a photo, a title and a short description',
      'Activity sheet \'Keep talking and nobody explodes\' with duration, materials, description and gallery'
    ],
    tech: ['Flutter', 'Dart', 'Android', 'Web'],
    features: [
      'Create and archive kids activity ideas',
      'Attach multiple photos to each activity',
      'Track required materials and preparation notes',
      'Record how long an activity took to create',
      'Share activities with other users for collaboration',
      'Build a reusable activity library for future sessions'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.vidanim', icon: 'fa-android', style: 'play-store' }
    ],
    fr: {
      alt: [
        'Liste d\'activités Vidanim : chaque fiche montre une photo, un titre et une courte description',
        'Fiche d\'activité « Keep talking and nobody explodes » avec durée, matériel, description et galerie'
      ],
      type: 'App mobile/web',
      shortDescription: 'Bibliothèque d\'activités pour enseignants et animateurs : documenter, estimer et partager',
      description: 'Vidanim aide les enseignants et animateurs à garder une trace des activités qu\'ils créent pour les enfants. Chaque fiche peut contenir des photos, le matériel nécessaire et le temps de préparation, pour réutiliser facilement les bonnes idées et préparer les prochaines séances. Les activités se partagent entre utilisateurs pour construire ensemble une base de connaissances.',
      features: [
        'Créer et archiver des idées d\'activités',
        'Plusieurs photos par activité',
        'Matériel nécessaire et notes de préparation',
        'Temps de création de chaque activité',
        'Partage d\'activités entre utilisateurs',
        'Une bibliothèque réutilisable pour les prochaines séances'
      ]
    }
  },

  // ============================================
  // GAMES
  // ============================================
  {
    id: 'coldsnap-arcade',
    category: 'Games',
    fit: ['game', 'web'],
    type: 'Retro Arcade',
    title: 'ColdSnap Arcade',
    coinSlot: 'https://arcade.coldsnap.fr/',
    shortDescription: 'Games written for real retro consoles, playable in the browser, with a shared leaderboard',
    description: 'Real games for old consoles, playable from any browser and competing on one leaderboard. The first one, David contre les zombies, is a survival game written in C for the Sega Master System. It runs on the original console from a flash cartridge, and here from the very same ROM.',
    icon: '🕹️',
    thumbnail: '/assets/projects/arcade/arcade-1-thumb.webp',
    media: [
      '/assets/projects/arcade/arcade-3.png',
      '/assets/projects/arcade/arcade-5.png',
      '/assets/projects/arcade/arcade-4.png',
      '/assets/projects/arcade/arcade-1.png',
      '/assets/projects/arcade/arcade-2.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'David contre les zombies, level 5: the player collects blue gems in the Re-Play festival hall while zombies approach',
      'David contre les zombies on the beach level, chased by a horde of zombies',
      'Game over screen: time, level and number of zombies killed',
      'ColdSnap Arcade home page with the David contre les zombies game card',
      'Game page in the ColdSnap Arcade: the playable game next to the leaderboard'
    ],
    tech: ['C', 'Z80', 'SDCC', 'EmulatorJS', 'Cloudflare Workers', 'Cloudflare D1'],
    features: [
      'Runs the real ROM in the browser, the same file as on the console',
      'One leaderboard for every game, on every console',
      'Keyboard, controller and touch controls',
      'Master System and Super Nintendo score reading tested, more consoles to come'
    ],
    fr: {
      alt: [
        'David contre les zombies, niveau 5 : le joueur ramasse des gemmes bleues dans le hall du festival Re-Play pendant que les zombies approchent',
        'David contre les zombies sur le niveau de la plage, poursuivi par une horde de zombies',
        'Écran de fin de partie : temps, niveau et nombre de zombies tués',
        'Accueil de l\'arcade ColdSnap avec la carte du jeu David contre les zombies',
        'Page de jeu de l\'arcade ColdSnap : le jeu jouable à côté du classement'
      ],
      type: 'Arcade rétro',
      shortDescription: 'Des jeux écrits pour de vraies consoles rétro, jouables dans le navigateur, avec un classement commun',
      description: "De vrais jeux pour anciennes consoles, jouables depuis n'importe quel navigateur, avec un seul classement. Le premier, David contre les zombies, est un jeu de survie écrit en C pour la Sega Master System. Il tourne sur la console d'origine depuis une cartouche flash, et ici depuis exactement la même ROM.",
      features: [
        'Fait tourner la vraie ROM dans le navigateur, le même fichier que sur la console',
        'Un seul classement pour tous les jeux, sur toutes les consoles',
        'Commandes au clavier, à la manette et au tactile',
        "Lecture des scores testée sur Master System et Super Nintendo, d'autres consoles à venir"
      ]
    }
  },
  {
    id: 'pygmak',
    category: 'Games',
    fit: ['game'],
    type: 'Mobile Game',
    title: 'Pygmak',
    shortDescription: 'Survivors-style arcade on the water: steer a flagship, blast crate hordes, build a run one card at a time',
    description: 'Pygmak is a survivors-style arcade game on the water. Crates rain down in hordes, the flagship\'s gun aims itself, and the player steers along the waterline to dodge what falls and collect the XP stars that float where crates broke. Every level deals a three-card hand taken with one tap: burn, freeze, electrify, scatter, weak point and dozens more, with evolutions unlocked from treasure chests. Three weapon classes (cannon, laser, firework), a gunboat convoy that follows the flagship, elites, ranked bosses every two and a half minutes and a final crate at 15:00, then an endless mode. Corrupted crates split, explode, drop mines or drift down on parachutes. A day/night cycle and seasons roll past, a workshop and skins persist between runs, and a damage recap closes every run. Built on realistic 2D physics so every shot, bounce and splash lands.',
    icon: '🎯',
    thumbnail: '/assets/projects/pygmak/pygmak-1-thumb.webp',
    media: [
      '/assets/projects/pygmak/pygmak-1.jpg',
      '/assets/projects/pygmak/pygmak-2.jpg',
      '/assets/projects/pygmak/pygmak-3.jpg',
      '/assets/projects/pygmak/pygmak-4.jpg',
      '/assets/projects/pygmak/pygmak-5.jpg',
      '/assets/projects/pygmak/pygmak-6.jpg',
      '/assets/projects/pygmak/pygmak-7.jpg',
      '/assets/projects/pygmak/pygmak-8.jpg',
      '/assets/projects/pygmak/pygmak-9.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Pygmak gameplay: laser beams from a boat break falling crates above green hills',
      'A parachute bomb drops among crates while the boat fires',
      'Level up: pick one of three upgrade cards',
      'Golden chest reward with three rare upgrade cards',
      'Crates of every size falling toward the boat',
      '\'Gun jammed!\' warning during a run',
      'Main menu with the laser class, best score and Play button',
      'Class and skins screen: cannon, laser and firework weapons',
      'Damage recap at the end of a run, split by weapon'
    ],
    tech: ['Unity 6', 'C#', 'URP', 'UI Toolkit', 'Feel', 'LevelPlay Ads', 'Android'],
    features: [
      'Steer the flagship; the gun aims itself',
      'Three weapon classes: cannon, laser, firework',
      'Level-up card hands, chest evolutions and a gunboat convoy',
      'Elites, ranked bosses, a 15-minute arc and endless mode',
      'Corrupted crates: split, explode, mines, parachutes',
      'Day/night cycle, seasons, workshop, skins and damage recap'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.pygmak', icon: 'fa-android', style: 'play-store' }
    ],
    fr: {
      alt: [
        'Partie de Pygmak : des rayons laser tirés d\'un bateau brisent des caisses au-dessus de collines vertes',
        'Une bombe en parachute tombe parmi les caisses pendant que le bateau tire',
        'Montée de niveau : choisir une carte d\'amélioration parmi trois',
        'Coffre doré avec trois cartes d\'amélioration rares',
        'Des caisses de toutes tailles tombent vers le bateau',
        'Alerte « Gun jammed! » pendant une partie',
        'Menu principal avec la classe laser, le meilleur score et le bouton Jouer',
        'Écran des classes et skins : canon, laser et feu d\'artifice',
        'Bilan des dégâts en fin de partie, réparti par arme'
      ],
      type: 'Jeu mobile',
      shortDescription: 'Arcade façon survivors sur l\'eau : pilotez un navire, pulvérisez des hordes de caisses, construisez votre run carte par carte',
      description: 'Pygmak est un jeu d\'arcade façon survivors sur l\'eau. Les caisses pleuvent par hordes, le canon du navire vise tout seul, et le joueur pilote le long de la ligne d\'eau pour esquiver ce qui tombe et ramasser les étoiles d\'XP qui flottent là où les caisses se sont brisées. Chaque niveau distribue une main de trois cartes prise d\'un tap : feu, gel, électricité, tir dispersé, point faible et des dizaines d\'autres, avec des évolutions débloquées dans les coffres. Trois classes d\'armes (canon, laser, feu d\'artifice), un convoi de canonnières qui suit le navire, des élites, des boss classés toutes les deux minutes et demie et une caisse finale à 15:00, puis un mode infini. Les caisses corrompues se divisent, explosent, lâchent des mines ou descendent en parachute. Un cycle jour/nuit et des saisons défilent, un atelier et des skins persistent entre les parties, et un récapitulatif des dégâts clôt chaque run. Construit sur une physique 2D réaliste, pour que chaque tir, rebond et éclaboussure ait du poids.',
      features: [
        'Pilotez le navire ; le canon vise tout seul',
        'Trois classes d\'armes : canon, laser, feu d\'artifice',
        'Mains de cartes à chaque niveau, évolutions par coffres, convoi de canonnières',
        'Élites, boss classés, un arc de 15 minutes puis un mode infini',
        'Caisses corrompues : division, explosion, mines, parachutes',
        'Cycle jour/nuit, saisons, atelier, skins et récap des dégâts'
      ]
    }
  },

  {
    id: 'seba',
    category: 'Games',
    fit: ['game', 'app'],
    type: 'Card Game',
    title: 'Seba',
    shortDescription: 'Collect over 900 mythical creatures and gods, nearly all shown on historic artworks',
    description: 'Seba is a card game of creatures from every culture\'s myths: dragons, kappa, firebirds, sea serpents and the gods of old pantheons. Open a free pack, peel five stickers and fill your bestiary. Nearly every card shows a public-domain artwork from Wikimedia Commons, The Met, the Cleveland Museum of Art or the Art Institute of Chicago, credited on the card with the creature\'s tradition and a short description. Rarity means something: legendary cards are the creatures the whole world knows, rare ones are told in only a few languages. Named after Albertus Seba, the 18th-century Amsterdam apothecary whose book of curiosities put real animals beside dragons and a seven-headed hydra.',
    icon: '🐉',
    thumbnail: '/assets/projects/seba/seba-en-1-thumb.webp',
    media: [
      '/assets/projects/seba/seba-en-1.jpg',
      '/assets/projects/seba/seba-en-2.jpg',
      '/assets/projects/seba/seba-en-3.jpg',
      '/assets/projects/seba/seba-en-4.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Unopened Seba card pack: five creatures in every pack',
      'Creature card Uwan, a Japanese yokai painting with its story',
      'Bestiary page \'Gods of Greece\' with the first cards found',
      'Home screen: a free pack is ready every hour, with collection counters'
    ],
    tech: ['Flutter', 'Firebase', 'Cloud Functions', 'FCM', 'In-app purchases'],
    features: [
      'A free pack every hour, two kept in store, and a push when they are ready',
      'Over 900 creatures and gods, from Greek and Norse myth to Japanese yōkai',
      'Historic artworks from museum open-access collections, credited on every card',
      'Twelve regions to complete, from the Celtic isles to the Americas',
      'Friends by code, one-for-one trades and a friends leaderboard',
      'The first player to find a card has their name on every copy',
      'Guest play; packs are never sold'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.seba', icon: 'fa-android', style: 'play-store' },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/seba/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Paquet de cartes Seba fermé : cinq créatures par paquet',
        'Carte de la créature Zahhak, une miniature persane ancienne avec son histoire',
        'Page du bestiaire « Moyen-Orient et Égypte » avec les premières cartes trouvées',
        'Écran d\'accueil : un paquet gratuit chaque heure, avec les compteurs de collection'
      ],
      type: 'Jeu de cartes',
      shortDescription: 'Collectionne plus de 900 créatures et dieux mythiques, presque tous sur de vraies œuvres',
      description: 'Seba est un jeu de cartes des créatures de tous les mythes du monde : dragons, kappa, oiseaux de feu, serpents de mer et dieux des panthéons anciens. Ouvre un paquet gratuit, décolle cinq autocollants et remplis ton bestiaire. Presque chaque carte montre une œuvre du domaine public venue de Wikimedia Commons, du Met, du Cleveland Museum of Art ou de l\'Art Institute of Chicago, créditée sur la carte avec la tradition de la créature et une courte description. La rareté a du sens : les légendaires sont les créatures que le monde entier connaît, les rares ne sont racontées que dans quelques langues. Le nom vient d\'Albertus Seba, apothicaire d\'Amsterdam du XVIIIe siècle dont le livre de curiosités plaçait de vrais animaux à côté de dragons et d\'une hydre à sept têtes.',
      thumbnail: '/assets/projects/seba/seba-fr-1-thumb.webp',
      media: [
        '/assets/projects/seba/seba-fr-1.jpg',
        '/assets/projects/seba/seba-fr-2.jpg',
        '/assets/projects/seba/seba-fr-3.jpg',
        '/assets/projects/seba/seba-fr-4.jpg'
      ],
      features: [
        'Un paquet gratuit chaque heure, deux en réserve, et une notification quand ils sont prêts',
        'Plus de 900 créatures et dieux, des mythes grecs et nordiques aux yōkai japonais',
        'Des œuvres historiques des collections en accès libre des musées, créditées sur chaque carte',
        'Douze régions à compléter, des îles celtes aux Amériques',
        'Amis par code, échanges une carte contre une et classement entre amis',
        'Le premier joueur à trouver une carte a son nom sur chaque exemplaire',
        'Jeu en invité ; les paquets ne sont jamais vendus'
      ]
    }
  },
  {
    id: 'badalone',
    category: 'Games',
    fit: ['game', 'app'],
    type: 'Card Game',
    title: 'Badalone',
    shortDescription: 'Open packs of real, ridiculous patents drawn from 12 million inventions',
    description: 'Every Badalone pack is nine real patents pulled at random from the entire US patent archive: more than twelve million inventions, from 1836 to last week. A method of swinging on a swing. A hat with a built-in umbrella. The light bulb. Each card shows the original drawing redrawn as a white-on-black blueprint, an absurdity index and the plain-words abstract on the back, and opens the original document in one tap. Rarity is earned by influence: the more later inventions built on a patent, the rarer its card. Named after Il Badalone, Brunelleschi\'s river barge and the subject of the first patent ever granted (Florence, 1421). No ads, no purchases.',
    icon: '📜',
    thumbnail: '/assets/projects/badalone/badalone-en-1-thumb.webp',
    media: [
      '/assets/projects/badalone/badalone-en-1.jpg',
      '/assets/projects/badalone/badalone-en-2.jpg',
      '/assets/projects/badalone/badalone-en-3.jpg',
      '/assets/projects/badalone/badalone-en-4.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Patent card \'Coherent LADAR using intra-pixel quadrature detection\' with its original drawing',
      'Unopened Badalone pack of nine patents, pull the strip to open',
      'Nine new patent cards revealed from one pack',
      'Codex of collected patents with search and filters'
    ],
    tech: ['Flutter', 'Firebase', 'Cloud Functions', 'Patent data', 'FCM'],
    features: [
      'Nine random patents per pack, drawn live from 12 million+ inventions',
      'Original drawings redrawn as white-on-black blueprints',
      'Rarity earned by influence, age and collector numbers',
      'An absurdity index and a plain-words abstract for every invention',
      'Searchable codex of every patent discovered',
      'The first player to find a patent has their name on every copy',
      'Friends by code, leaderboard and one-for-one trades; no ads, no purchases'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.badalone', icon: 'fa-android', style: 'play-store' }
    ],
    fr: {
      alt: [
        'Carte brevet « Coherent LADAR using intra-pixel quadrature detection » avec son dessin d\'origine',
        'Paquet Badalone de neuf brevets, tirer la bande pour l\'ouvrir',
        'Neuf nouvelles cartes brevets révélées dans un paquet',
        'Codex des brevets collectés avec recherche et filtres'
      ],
      type: 'Jeu de cartes',
      shortDescription: 'Ouvre des paquets de vrais brevets, souvent absurdes, tirés de 12 millions d\'inventions',
      description: 'Chaque paquet de Badalone contient neuf vrais brevets tirés au hasard de toutes les archives américaines : plus de douze millions d\'inventions, de 1836 à la semaine dernière. Une méthode pour se balancer sur une balançoire. Un chapeau avec parapluie intégré. L\'ampoule électrique. Chaque carte montre le dessin d\'origine redessiné en plan blanc sur noir, un indice d\'absurdité et le résumé en mots simples au dos, et ouvre le document original en un geste. La rareté se gagne par l\'influence : plus d\'inventions se sont appuyées sur un brevet, plus sa carte est rare. Le nom vient d\'Il Badalone, la barge fluviale de Brunelleschi, objet du tout premier brevet (Florence, 1421). Sans publicité, sans achat.',
      features: [
        'Neuf brevets au hasard par paquet, tirés en direct de plus de 12 millions d\'inventions',
        'Les dessins d\'origine redessinés en plans blanc sur noir',
        'Une rareté gagnée par l\'influence, l\'âge et le numéro de collection',
        'Un indice d\'absurdité et un résumé en mots simples pour chaque invention',
        'Un codex de tous les brevets découverts, avec recherche',
        'Le premier joueur à trouver un brevet a son nom sur chaque exemplaire',
        'Amis par code, classement et échanges une contre une ; sans pub ni achat'
      ]
    }
  },
  // ============================================
  // FLUTTER APPS (continued)
  // ============================================
  {
    id: 'maya',
    category: 'Flutter Apps',
    fit: ['app', 'public'],
    type: 'Town App',
    title: 'Maya',
    shortDescription: 'The town hall in every resident\'s pocket: news, alerts, polls, problem reports and local shops',
    description: 'Maya is an app built for towns. Residents get their town\'s news and events, urgent alerts, polls and practical information in one place, and only the notifications they choose. They can report a problem with a photo and a pin on the map, then follow it until it\'s fixed. News and events are imported from the town\'s existing website, and town hall staff run the rest from a web back office. Towns add only the modules they need: automatic Météo-France and Vigicrues warnings, waste collection reminders, places on the map, and local shops with a QR code loyalty game, the Hive. Free for residents and shops, no ads, no trackers, data hosted in France. First town: Mouans-Sartoux.',
    icon: '🐝',
    thumbnail: '/assets/projects/maya/maya-en-1-thumb.webp',
    media: [
      '/assets/projects/maya/maya-trailer-en.mp4',
      '/assets/projects/maya/maya-en-1.jpg',
      '/assets/projects/maya/maya-en-2.jpg',
      '/assets/projects/maya/maya-en-3.jpg',
      '/assets/projects/maya/maya-en-4.jpg',
      '/assets/projects/maya/maya-en-5.jpg',
      '/assets/projects/maya/maya-en-6.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Maya trailer: \'What if your town could talk to you?\'',
      'Town news home screen with highlights, town hall shortcuts and open polls',
      'Event page with date, place and full description',
      'Report a problem: pick a category, add a photo and place a pin on the map',
      'Notification settings: choose which alerts and news to receive',
      'The Hive: pollen, level and badges earned at local shops',
      'Map of local shops near you with a shop card'
    ],
    tech: ['Flutter', 'Firebase', 'Cloud Functions', 'Next.js', 'FCM', 'Google Maps'],
    features: [
      'News and events imported from the town\'s website',
      'Push notifications by topic, picked by each resident',
      'Urgent alerts, with Météo-France and Vigicrues warnings relayed automatically',
      'Anonymous polls: one vote per account, results after voting',
      'Problem reports with photo and location, tracked until resolved',
      'Waste collection days with a reminder the night before',
      'Map of local shops; the Hive rewards visits with pollen and badges via QR code',
      'Web back office for town hall staff, scheduled posts',
      'iPhone, Android and web; data hosted in France, GDPR compliant'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.maya', icon: 'fa-android', style: 'play-store' },
      { label: 'App Store', href: 'https://apps.apple.com/fr/app/id6820991824', icon: 'fa-apple', style: 'app-store', soon: true },
      { label: 'Try the App', labelFr: 'Essayer l\'app', href: 'https://app.mayaville.fr/', icon: 'fa-mobile' },
      { label: 'Visit Website', labelFr: 'Site web', href: 'https://mayaville.fr/', icon: 'fa-globe', secondary: true },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: 'https://mayaville.fr/confidentialite', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Accueil des actualités de la commune avec la une, les raccourcis mairie et les sondages en cours',
        'Page d\'un événement avec date, lieu et description complète',
        'Signaler un problème : choisir une catégorie, ajouter une photo et placer un repère sur la carte',
        'Réglages des notifications : choisir les alertes et actualités reçues',
        'La Ruche : pollen, niveau et badges gagnés chez les commerçants',
        'Carte des commerces de proximité avec la fiche d\'un commerce'
      ],
      type: 'App communale',
      shortDescription: 'La mairie dans la poche de chaque habitant : actus, alertes, sondages, signalements et commerces',
      description: 'Maya est une application conçue pour les communes. Les habitants y retrouvent les actualités et l\'agenda de leur ville, les alertes urgentes, les sondages et les infos pratiques, et ne reçoivent que les notifications qu\'ils ont choisies. Ils peuvent signaler un problème avec une photo et un repère sur la carte, puis suivre son traitement. Les actualités et l\'agenda sont importés du site de la commune, et les agents gèrent le reste depuis un espace mairie sur le web. Chaque commune n\'ajoute que les modules dont elle a besoin : vigilances Météo-France et Vigicrues automatiques, rappels de collecte des déchets, lieux de la ville sur la carte, et commerce local avec la Ruche, un programme de fidélité par QR code. Gratuit pour les habitants et les commerçants, sans publicité ni traceur, données hébergées en France. Première commune : Mouans-Sartoux.',
      thumbnail: '/assets/projects/maya/maya-fr-1-thumb.webp',
      media: [
        '/assets/projects/maya/maya-fr-1.jpg',
        '/assets/projects/maya/maya-fr-2.jpg',
        '/assets/projects/maya/maya-fr-3.jpg',
        '/assets/projects/maya/maya-fr-4.jpg',
        '/assets/projects/maya/maya-fr-5.jpg',
        '/assets/projects/maya/maya-fr-6.jpg'
      ],
      features: [
        'Actualités et agenda importés du site de la commune',
        'Notifications par thème, choisies par chaque habitant',
        'Alertes urgentes, vigilances Météo-France et Vigicrues relayées automatiquement',
        'Sondages anonymes : un vote par compte, résultats après le vote',
        'Signalements avec photo et position, suivis jusqu\'à la résolution',
        'Jours de collecte des déchets, avec un rappel la veille',
        'Carte des commerces ; la Ruche récompense les visites en pollen et badges par QR code',
        'Espace mairie sur le web pour les agents, envois programmés',
        'iPhone, Android et web ; données hébergées en France, conforme au RGPD'
      ]
    }
  },
  {
    id: 'propos',
    category: 'Flutter Apps',
    fit: ['app', 'web', 'company'],
    type: 'Film & TV Tool',
    title: 'PropOS',
    shortDescription: 'Fake phone screens for film and TV sets, triggered live from a control room and mirrored in real time',
    description: 'PropOS plays the screens actors hold on set. A prop phone, tablet or browser joins a session with a short code and shows a believable device: lock and home screens with a scripted clock and battery, incoming and active calls, live text conversations with typing indicators, hacker terminals. From a web control room, the crew loads a scene, fires each beat with a GO button, blacks out or dims a device in one tap and resets everything between takes. Every prop device is mirrored live in the control room using the same widgets, so what the crew sees is exactly what the camera sees. Nothing advances on a timer: the operator paces every take. In development.',
    icon: '🎬',
    thumbnail: '/assets/projects/propos/propos-1-thumb.webp',
    media: [
      '/assets/projects/propos/propos-1.jpg',
      '/assets/projects/propos/propos-2.jpg',
      '/assets/projects/propos/propos-3.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Prop phone showing an incoming call from \'Mom\' with Decline and Accept buttons',
      'Prop messaging screen: a text from Alex, \'Don\'t come home. They\'re watching the house.\'',
      'Prop lock screen with a scripted clock at 21:47 and a fake carrier name'
    ],
    tech: ['Flutter', 'Next.js', 'Firebase Realtime Database', 'Firestore', 'Android', 'iOS', 'Web'],
    features: [
      'Phone shell, calls, messaging and terminal templates',
      'Devices pair with a 6-character code, no accounts',
      'GO cue list, blackout and remote brightness',
      'Truthful live mirror of every prop device',
      'Scripted status bar: clock, battery, carrier',
      'Event log of every cue and actor tap'
    ],
    links: [],
    fr: {
      alt: [
        'Téléphone accessoire affichant un appel entrant de « Mom » avec les boutons Refuser et Accepter',
        'Écran de messagerie accessoire : un SMS d\'Alex, « Don\'t come home. They\'re watching the house. »',
        'Écran verrouillé accessoire avec une heure scénarisée à 21:47 et un faux opérateur'
      ],
      type: 'Outil cinéma et TV',
      shortDescription: 'Faux écrans de téléphone pour les tournages, déclenchés en direct depuis une régie et affichés en miroir',
      description: 'PropOS fait jouer les écrans que les comédiens tiennent sur le plateau. Un téléphone, une tablette ou un navigateur rejoint une session avec un code court et affiche un appareil crédible : écran verrouillé et d\'accueil avec heure et batterie scénarisées, appels entrants et en cours, conversations SMS en direct avec indicateur de saisie, terminaux de hacker. Depuis une régie web, l\'équipe charge une scène, déclenche chaque moment avec un bouton GO, éteint ou baisse la luminosité d\'un appareil en un geste et remet tout à zéro entre les prises. Chaque appareil est affiché en miroir dans la régie avec les mêmes composants, donc l\'équipe voit exactement ce que voit la caméra. Rien n\'avance tout seul : l\'opérateur rythme chaque prise. En développement.',
      features: [
        'Modèles téléphone, appel, messagerie et terminal',
        'Appairage par code à 6 caractères, sans compte',
        'Liste de cues avec bouton GO, noir et luminosité à distance',
        'Miroir fidèle et en direct de chaque appareil',
        'Barre d\'état scénarisée : heure, batterie, opérateur',
        'Journal de chaque cue et de chaque geste du comédien'
      ]
    }
  },
  {
    id: 'sandlog',
    category: 'Flutter Apps',
    fit: ['app'],
    type: 'Mobile App',
    title: 'Sandlog',
    shortDescription: 'Voice dream journal: open the app, speak, and your dream is saved automatically',
    description: 'A frictionless dream journaling app designed to capture dreams the moment you wake up. Open the app and speak; Sandlog automatically stops recording when silence is detected and saves your dream entry. Recordings can be exported to the user\'s Google Drive for safe cloud storage.',
    icon: '🌙',
    thumbnail: '/assets/projects/sandlog/sandlog-1-thumb.webp?v=20261030',
    media: [
      '/assets/projects/sandlog/sandlog-1.jpg?v=20261030',
      '/assets/projects/sandlog/sandlog-2.jpg?v=20261030',
      '/assets/projects/sandlog/sandlog-3.jpg?v=20261030',
      '/assets/projects/sandlog/sandlog-4.jpg?v=20261030'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Sandlog capture screen: a microphone button to record a dream by voice',
      'Recording in progress with spoken words floating around the stop button',
      'Dream journal listing dated dreams with titles and summaries',
      'Settings: language, stop after silence, auto-start and Google Drive backup'
    ],
    tech: ['Flutter', 'Dart', 'Google Drive API', 'Voice Recording', 'Silence Detection'],
    features: [
      'Instant recording on app open, no buttons needed',
      'Automatic stop on silence detection',
      'Voice dream entry storage',
      'Google Drive export for cloud backup'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.sandlog', icon: 'fa-android', style: 'play-store' },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Écran de capture Sandlog : un bouton micro pour enregistrer un rêve à la voix',
        'Enregistrement en cours, les mots prononcés flottent autour du bouton stop',
        'Journal des rêves : rêves datés avec titres et résumés',
        'Réglages : langue, arrêt après silence, démarrage auto et sauvegarde Google Drive'
      ],
      type: 'App mobile',
      shortDescription: 'Journal de rêves vocal : ouvrez l\'app, parlez, votre rêve est enregistré',
      description: 'Un journal de rêves sans friction, pensé pour capturer un rêve dès le réveil. Ouvrez l\'app et parlez : Sandlog s\'arrête automatiquement quand le silence revient et enregistre votre rêve. Les enregistrements peuvent être exportés vers Google Drive.',
      features: [
        'Enregistrement dès l\'ouverture, sans bouton',
        'Arrêt automatique au silence',
        'Stockage des rêves en audio',
        'Export Google Drive pour la sauvegarde'
      ]
    }
  },
  {
    id: 'badger',
    category: 'Flutter Apps',
    fit: ['app', 'company'],
    type: 'Mobile App',
    title: 'Badger',
    shortDescription: 'NFC-powered digital business card, share contacts by tapping phones',
    description: 'A modern replacement for physical business cards. Badger lets you share your contact details instantly by tapping phones via NFC, or via QR code as a fallback. Create beautiful digital card profiles, export as VCF, and manage all your shared contacts in one place.',
    icon: '🪪',
    thumbnail: '/assets/projects/badger/badger-1-thumb.webp',
    media: [
      '/assets/projects/badger/badger-1.jpg',
      '/assets/projects/badger/badger-2.jpg?v=20261110',
      '/assets/projects/badger/badger-3.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Badger profile screen with contact card settings and cloud sync',
      'Digital business card ready to share, with phone, email and website',
      'Share screen: show or scan a QR code, NFC and contact file'
    ],
    tech: ['Flutter', 'Dart', 'NFC', 'Firebase', 'QR Code', 'Material Design 3'],
    features: [
      'NFC contact sharing (NDEF format)',
      'QR code fallback for non-NFC devices',
      'Beautiful digital card templates',
      'VCF export and sharing',
      'Firebase profile cloud storage',
      'Material Design 3 UI'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.badger', icon: 'fa-android', style: 'play-store' },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Écran profil de Badger avec réglages de la carte de contact et synchronisation',
        'Carte de visite numérique prête à partager, avec téléphone, e-mail et site web',
        'Écran de partage : afficher ou scanner un QR code, NFC et fichier contact'
      ],
      type: 'App mobile',
      shortDescription: 'Carte de visite numérique NFC : partagez vos coordonnées en rapprochant deux téléphones',
      description: 'Le remplaçant moderne de la carte de visite papier. Badger partage vos coordonnées instantanément en rapprochant deux téléphones (NFC), ou par QR code en secours. Créez de belles cartes numériques, exportez-les en VCF et retrouvez tous vos contacts au même endroit.',
      features: [
        'Partage de contact NFC (format NDEF)',
        'QR code pour les appareils sans NFC',
        'Modèles de cartes soignés',
        'Export et partage VCF',
        'Profils stockés sur Firebase',
        'Interface Material Design 3'
      ]
    }
  },
  {
    id: 'colismarket',
    category: 'Flutter Apps',
    fit: ['app', 'company'],
    type: 'Mobile App',
    title: 'ColisMarket',
    shortDescription: 'Parcel relay point management app with OCR scanning for package tracking',
    description: 'A mobile app for managing package pickup and delivery relay points. Features ML Kit-powered OCR to scan and extract parcel information directly from labels, streamlining the package intake process for relay operators.',
    icon: '📦',
    thumbnail: '/assets/projects/colismarket/colismarket-1-thumb.webp',
    media: [
      '/assets/projects/colismarket/colismarket-1.jpg',
      '/assets/projects/colismarket/colismarket-2.jpg',
      '/assets/projects/colismarket/colismarket-3.jpg',
      '/assets/projects/colismarket/colismarket-4.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'ColisMarket home: choose customer or courier, with today\'s counters',
      'Scanning a parcel label, analysis in progress',
      'Parcel pickup form pre-filled by OCR: tracking number, sender, recipient and weight',
      'Customer signature pad to confirm the parcel handover'
    ],
    tech: ['Flutter', 'Dart', 'Google ML Kit', 'OCR', 'Android'],
    features: [
      'ML Kit OCR for parcel label scanning',
      'Package intake and tracking management',
      'Image capture and document scanning',
      'Relay point operator dashboard',
      'Local persistent storage'
    ],
    links: [
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Accueil ColisMarket : choisir client ou livreur, avec les compteurs du jour',
        'Scan de l\'étiquette d\'un colis, analyse en cours',
        'Formulaire de retrait pré-rempli par OCR : numéro de suivi, expéditeur, destinataire et poids',
        'Zone de signature du client pour confirmer la remise du colis'
      ],
      type: 'App mobile',
      shortDescription: 'Gestion de points relais avec lecture OCR des étiquettes pour le suivi des colis',
      description: 'Une app mobile pour gérer les points relais de retrait et de livraison de colis. L\'OCR ML Kit lit et extrait les informations directement depuis les étiquettes, ce qui accélère la prise en charge des colis pour les opérateurs.',
      features: [
        'Lecture OCR des étiquettes avec ML Kit',
        'Prise en charge et suivi des colis',
        'Capture d\'images et numérisation de documents',
        'Tableau de bord opérateur de point relais',
        'Stockage local persistant'
      ]
    }
  },
  {
    id: 'patoune',
    category: 'Flutter Apps',
    fit: ['app'],
    type: 'Mobile App',
    title: 'Patoune',
    shortDescription: 'Cat claw trimming tracker to visualize and schedule your cat\'s nail maintenance',
    description: 'A charming companion app for cat owners that makes claw maintenance easy and stress-free. Patoune provides a visual paw diagram to track which claws have been trimmed, colour-coded reminders when trimming is due, and guidance on safe trimming techniques.',
    icon: '🐾',
    thumbnail: '/assets/projects/patoune/patoune-1-thumb.webp',
    media: [
      '/assets/projects/patoune/patoune-1.jpg',
      '/assets/projects/patoune/patoune-2.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Patoune: a cat drawing with buttons on each claw to mark which ones were trimmed',
      'Claw care guide with four tips and a diagram of where to cut'
    ],
    tech: ['Flutter', 'Dart', 'SharedPreferences', 'SVG', 'i18n'],
    features: [
      'Visual paw diagram for per-claw tracking',
      'Colour-coded trimming reminders',
      'Safe trimming technique guidance',
      'Multi-language support',
      'Custom SVG paw assets',
      'Android and Windows support'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.patoune.app.patoune', icon: 'fa-android', style: 'play-store' },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/patoune/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Patoune : un dessin de chat avec un bouton sur chaque griffe pour noter celles coupées',
        'Guide de soin des griffes : quatre conseils et un schéma de l\'endroit où couper'
      ],
      type: 'App mobile',
      shortDescription: 'Suivi de la coupe des griffes de votre chat, griffe par griffe',
      description: 'Une app attachante pour les propriétaires de chats qui rend l\'entretien des griffes simple et sans stress. Patoune propose un schéma de patte pour suivre chaque griffe coupée, des rappels colorés quand il est temps, et des conseils pour couper en toute sécurité.',
      features: [
        'Schéma de patte, suivi griffe par griffe',
        'Rappels colorés',
        'Conseils de coupe en sécurité',
        'Multilingue',
        'Illustrations SVG sur mesure',
        'Android et Windows'
      ]
    }
  },

  // ============================================
  // OPEN SOURCE
  // ============================================
  {
    id: 'posti',
    category: 'Flutter Apps',
    fit: ['app'],
    type: 'Desktop App',
    title: 'Posti',
    shortDescription: 'Minimalist always-on-top system tray todo and notes app for desktop',
    description: 'A lightweight desktop productivity app that lives in your system tray. Posti stays always-on-top for instant access to todos and quick notes without switching context. Designed for minimal friction, capture a thought in seconds and get back to work.',
    icon: '📌',
    thumbnail: '/assets/projects/posti/posti-1-thumb.webp',
    media: [
      '/assets/projects/posti/posti-1.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Posti to-do window with two open tasks and an archived list'
    ],
    tech: ['Flutter', 'Dart', 'Windows', 'macOS'],
    features: [
      'System tray integration',
      'Always-on-top window',
      'Quick todo and note capture',
      'Persistent background process',
      'Minimal, distraction-free UI'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/Posti', icon: 'fa-github' }
    ],
    fr: {
      alt: [
        'Fenêtre de tâches Posti avec deux tâches en cours et une liste archivée'
      ],
      type: 'App de bureau',
      shortDescription: 'Todo et notes minimalistes, toujours au premier plan, dans la barre système',
      description: 'Une petite app de productivité qui vit dans la barre système. Posti reste au premier plan pour accéder instantanément à vos tâches et notes sans changer de contexte. Zéro friction : notez une idée en quelques secondes et reprenez le travail.',
      features: [
        'Intégration à la barre système',
        'Fenêtre toujours au premier plan',
        'Saisie rapide de tâches et de notes',
        'Processus persistant en arrière-plan',
        'Interface minimaliste, sans distraction'
      ]
    }
  },
  {
    id: 'grapple-groove',
    category: 'Games',
    fit: ['game'],
    type: 'PC Game',
    title: 'GrappleGroove',
    shortDescription: 'First-person grappling hook game in a giant playroom, with a campaign, a level editor and community levels',
    description: 'A first-person platformer built around two grappling hooks and momentum: swing, reel in and let go at the right moment to fly across a giant toy-filled playroom. The campaign walks through hand-designed levels that each teach one idea. The same level editor used to build them ships in the game: place pieces, test from the camera, set a par time by playing, then publish the level for everyone. Speedrun leaderboards race your best ghost, co-op sessions join by code, and the music is generated live from a toybox of mallets and bells. Built for Steam, with a browser version to try now.',
    icon: '🪝',
    thumbnail: '/assets/projects/grapple-groove/grapple-groove-1-thumb.webp?v=20261110',
    media: [
      '/assets/projects/grapple-groove/grapple-groove-3.jpg',
      '/assets/projects/grapple-groove/grapple-groove-4.jpg'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'First-person view in a giant playroom: blue and red gloves, a pool and a yellow platform ahead, bookshelves and bunting behind',
      'The in-game level editor: Move, Scale and Rotate tools, Test buttons and a green track over water with grapple lines'
    ],
    tech: ['Unity 6', 'C#', 'URP', 'UI Toolkit', 'Netcode for GameObjects', 'Firebase', 'WebGL'],
    features: [
      'Two grappling hooks driven by momentum physics',
      'Campaign of hand-designed levels',
      'In-game level editor with instant test runs',
      'Publish and play community levels',
      'Speedrun leaderboards with your best ghost',
      'Online co-op sessions joined by code',
      'Procedural toybox music'
    ],
    links: [
      { label: 'Play in the browser', labelFr: 'Jouer dans le navigateur', href: 'https://gg.coldsnap.fr/', icon: 'fa-play' }
    ],
    fr: {
      alt: [
        'Vue subjective dans une salle de jeux géante : gants bleu et rouge, une piscine et une plateforme jaune devant, étagères et guirlandes derrière',
        'L\'éditeur de niveaux du jeu : outils Déplacer, Échelle et Rotation, boutons de test et une piste verte au-dessus de l\'eau avec des lignes de grappin'
      ],
      type: 'Jeu PC',
      shortDescription: 'Jeu de grappin à la première personne dans une salle de jeux géante, avec campagne, éditeur de niveaux et niveaux de la communauté',
      description: 'Un jeu de plateforme à la première personne construit autour de deux grappins et de l\'élan : se balancer, enrouler, lâcher au bon moment pour traverser une salle de jeux géante remplie de jouets. La campagne enchaîne des niveaux conçus à la main, chacun autour d\'une idée. L\'éditeur qui a servi à les construire est dans le jeu : poser des pièces, tester depuis la caméra, fixer un temps de référence en jouant, puis publier le niveau pour tout le monde. Classements de speedrun contre son meilleur fantôme, parties en coopération rejointes par code, et une musique générée en direct à partir d\'une boîte à jouets de marimbas et de clochettes. Pensé pour Steam, avec une version navigateur à essayer dès maintenant.',
      features: [
        'Deux grappins et une physique d\'élan',
        'Campagne de niveaux conçus à la main',
        'Éditeur de niveaux intégré avec test immédiat',
        'Publier et jouer les niveaux de la communauté',
        'Classements de speedrun avec son meilleur fantôme',
        'Coopération en ligne rejointe par code',
        'Musique générée façon boîte à jouets'
      ]
    }
  },
  {
    id: 'sharekm',
    category: 'Open Source',
    type: 'Windows App',
    title: 'ShareKM',
    shortDescription: 'Share one keyboard and mouse between two Windows PCs, with encrypted pairing and shared clipboard',
    description: 'A tiny Windows tray app that lets one keyboard and mouse control two PCs on the same network, with clipboard text shared both ways. One hotkey switches which PC you are on. It finds the other PC by itself, pairs with a passphrase and encrypts everything it sends (AES-256-GCM), and can optionally run as administrator to control elevated windows. A single self-contained exe: no install, no account, no PowerToys. Free for non-commercial use, with the source on GitHub.',
    icon: '⌨️',
    thumbnail: '/assets/projects/sharekm/sharekm-1-thumb.webp',
    media: [
      '/assets/projects/sharekm/sharekm-1.png',
      '/assets/projects/sharekm/sharekm-2.png',
      '/assets/projects/sharekm/sharekm-3.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'ShareKM in dark mode: connected to a laptop, encryption, hotkey and performance settings',
      'ShareKM in light mode with the same connection and security settings',
      'Warning dialog before running ShareKM as administrator'
    ],
    tech: ['C#', '.NET', 'WinForms', 'Win32 hooks', 'AES-GCM'],
    features: [
      'One hotkey to switch control between your PCs (rebindable with a Record button)',
      'Finds other PCs running ShareKM on the network automatically',
      'Passphrase pairing with AES-256-GCM encryption on the link',
      'Clipboard text shared in both directions',
      'Adjustable mouse update rate (60-1000 Hz)',
      'Optional administrator mode to control elevated windows',
      'Windows 11 style settings window, follows light and dark mode',
      'Single self-contained exe, starts with Windows'
    ],
    links: [
      { label: 'Download', labelFr: 'Télécharger', href: 'https://github.com/Yukisando/ShareKM/releases/latest', icon: 'fa-download' },
      { label: 'GitHub', href: 'https://github.com/Yukisando/ShareKM', icon: 'fa-github', secondary: true }
    ],
    fr: {
      alt: [
        'ShareKM en mode sombre : connecté à un portable, chiffrement, raccourci et réglages de performance',
        'ShareKM en mode clair avec les mêmes réglages de connexion et de sécurité',
        'Avertissement avant de lancer ShareKM en administrateur'
      ],
      type: 'App Windows',
      shortDescription: 'Partagez un clavier et une souris entre deux PC Windows, avec appairage chiffré et presse-papiers partagé',
      description: 'Une petite app Windows dans la barre système qui permet de piloter deux PC du même réseau avec un seul clavier et une seule souris, avec le texte du presse-papiers partagé dans les deux sens. Un raccourci clavier suffit pour passer d\'un PC à l\'autre. Elle trouve l\'autre PC toute seule, s\'appaire avec une phrase secrète et chiffre tout ce qu\'elle envoie (AES-256-GCM), et peut tourner en administrateur pour piloter les fenêtres élevées. Un seul exécutable autonome : sans installation, sans compte, sans PowerToys. Gratuit pour un usage non commercial, code source sur GitHub.',
      features: [
        'Un raccourci pour passer d\'un PC à l\'autre (modifiable avec un bouton Enregistrer)',
        'Détecte automatiquement les autres PC qui font tourner ShareKM sur le réseau',
        'Appairage par phrase secrète et chiffrement AES-256-GCM du lien',
        'Texte du presse-papiers partagé dans les deux sens',
        'Fréquence de mise à jour de la souris réglable (60 à 1000 Hz)',
        'Mode administrateur facultatif pour piloter les fenêtres élevées',
        'Fenêtre de réglages style Windows 11, thème clair et sombre',
        'Un seul exécutable autonome, démarrage avec Windows'
      ]
    }
  },
  {
    id: 'waddonsync',
    category: 'Open Source',
    type: 'Desktop App',
    title: 'WaddonSync',
    shortDescription: 'Backup World of Warcraft addon data to Google Drive automatically',
    description: 'A desktop utility that securely backs up your World of Warcraft addon data to Google Drive. Never lose your addon settings, keybindings, or UI configurations again.',
    icon: '🎮',
    thumbnail: '/assets/projects/waddonsync/waddonsync-1-thumb.webp',
    media: [
      '/assets/projects/waddonsync/waddonsync-1.png',
      '/assets/projects/waddonsync/waddonsync-2.png',
      '/assets/projects/waddonsync/waddonsync-3.png',
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'WaddonSync backup created, with an offer to upload it to Google Drive',
      'Manage backups: local and Google Drive copies of World of Warcraft settings',
      'Backup options for World of Warcraft folders while a backup is being created'
    ],
    tech: ['Flutter', 'Dart', 'Google Drive API', 'OAuth 2.0'],
    features: [
      'Backup and restore of WoW addon data',
      'Secure Google Drive integration',
      'Multiple WoW installation support',
      'Easy selection of interface options'
    ],
    links: [
      { label: 'Download', labelFr: 'Télécharger', href: 'https://github.com/Yukisando/WaddonSync/releases', icon: 'fa-download' },
      { label: 'GitHub', href: 'https://github.com/Yukisando/WaddonSync', icon: 'fa-github', secondary: true },
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/waddonsync/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      alt: [
        'Sauvegarde WaddonSync créée, avec la proposition de l\'envoyer sur Google Drive',
        'Gestion des sauvegardes : copies locales et Google Drive des réglages World of Warcraft',
        'Options de sauvegarde des dossiers World of Warcraft pendant la création d\'une sauvegarde'
      ],
      type: 'App de bureau',
      shortDescription: 'Sauvegarde automatique des données d\'addons World of Warcraft sur Google Drive',
      description: 'Un utilitaire de bureau qui sauvegarde en toute sécurité les données de vos addons World of Warcraft sur Google Drive. Ne perdez plus jamais vos réglages, raccourcis ou interfaces.',
      features: [
        'Sauvegarde et restauration des données d\'addons',
        'Intégration Google Drive sécurisée',
        'Plusieurs installations de WoW',
        'Sélection simple des options d\'interface'
      ]
    }
  },
  {
    id: 'magic-arrow',
    category: 'Open Source',
    type: 'Minecraft Plugin',
    title: 'Magic Arrow',
    shortDescription: 'Minecraft plugin adding block-placing and elemental abilities to bows based on the block you stand on',
    description: 'A Java Minecraft plugin built from scratch that gives the bow and arrow context-sensitive superpowers. The effect fired depends on the block under the player\'s feet: standing on ice fires a freeze arrow, on TNT fires an explosive, on grass places blocks, and so on. A fun exploration of the Bukkit/Spigot API.',
    icon: '🏹',
    thumbnail: '/assets/projects/magic-arrow/magic-arrow-1-thumb.webp',
    media: [
      '/assets/projects/magic-arrow/magic-arrow-1.jpg',
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Magic Arrow in Minecraft: first-person view drawing a bow at night in a blocky forest'
    ],
    tech: ['Java', 'Bukkit/Spigot API', 'Minecraft'],
    features: [
      'Context-sensitive bow abilities based on standing block',
      'Block-placing arrows',
      'Elemental effects (freeze, explode, and more)',
      'Built from scratch on the Bukkit/Spigot API'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/MagicArrow', icon: 'fa-github' }
    ],
    fr: {
      alt: [
        'Magic Arrow dans Minecraft : vue subjective, arc bandé de nuit dans une forêt en blocs'
      ],
      type: 'Plugin Minecraft',
      shortDescription: 'Plugin Minecraft qui donne à l\'arc des pouvoirs selon le bloc sous vos pieds',
      description: 'Un plugin Minecraft en Java, écrit de zéro, qui donne à l\'arc des super-pouvoirs contextuels. L\'effet dépend du bloc sous les pieds du joueur : sur la glace une flèche gelante, sur la TNT une flèche explosive, sur l\'herbe une flèche qui pose des blocs, etc. Une exploration ludique de l\'API Bukkit/Spigot.',
      features: [
        'Pouvoirs de l\'arc selon le bloc sous le joueur',
        'Flèches qui posent des blocs',
        'Effets élémentaires (gel, explosion, et plus)',
        'Écrit de zéro sur l\'API Bukkit/Spigot'
      ]
    }
  },
  {
    id: 'bolt',
    category: 'Open Source',
    type: 'WoW Addon',
    title: 'B.O.L.T',
    shortDescription: 'Modular World of Warcraft addon that restyles Blizzard\'s own UI and adds small quality-of-life tweaks, for Midnight and WoW: Forever',
    description: 'Brittle and Occasionally Lethal Tweaks. A World of Warcraft addon made of small modules you switch on one by one. The Interface modules restyle Blizzard\'s own frames with Blizzard\'s own art: portrait-less unit frames, a square minimap with one button bar, fade-until-needed bars and frames, nameplates that flag mana users and interruptible casts, a ranged attack timer. Everything is set from Edit Mode, saved per Edit Mode layout and shared by all your characters. Runs on Midnight and on WoW: Forever, where it switches to Forever\'s bronze art and hides modules built on modern-only systems.',
    icon: '⚔️',
    thumbnail: '/assets/projects/bolt/bolt-1-thumb.webp',
    media: [
      '/assets/projects/bolt/bolt-1.png',
      '/assets/projects/bolt/bolt-2.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'B.O.L.T options panel inside World of Warcraft with its modules and settings',
      'Redesigned World of Warcraft game menu with expansion shortcuts added by B.O.L.T'
    ],
    tech: ['Lua', 'World of Warcraft API', 'GitHub Actions', 'CI/CD'],
    features: [
      'Game Menu enhancements (Leave Group, Reload UI, Group Tools)',
      'Portrait-less unit frames and cast bars in Blizzard\'s own art',
      'Square minimap with one button bar and an addon button drawer',
      'Auto-hide for action bars, frames, buffs and the quest tracker',
      'Nameplates: mana users, interrupt cue, range hint',
      'Options inside Edit Mode, saved per layout',
      'Midnight and WoW: Forever from one addon',
      '140+ releases shipped by CI/CD'
    ],
    links: [
      { label: 'CurseForge', href: 'https://www.curseforge.com/wow/addons/bolt', icon: 'fa-download', style: 'curseforge' },
      { label: 'GitHub', href: 'https://github.com/Yukisando/B.O.L.T', icon: 'fa-github', secondary: true }
    ],
    fr: {
      alt: [
        'Panneau d\'options B.O.L.T dans World of Warcraft avec ses modules et réglages',
        'Menu du jeu World of Warcraft revu, avec les raccourcis d\'extension ajoutés par B.O.L.T'
      ],
      type: 'Addon WoW',
      shortDescription: 'Addon World of Warcraft modulaire qui redessine l\'interface de Blizzard avec ses propres graphismes, pour Midnight et WoW: Forever',
      description: 'Brittle and Occasionally Lethal Tweaks. Un addon World of Warcraft fait de petits modules qu\'on active un par un. Les modules Interface redessinent les cadres de Blizzard avec les graphismes de Blizzard : cadres d\'unité sans portrait, minimap carrée avec une seule barre de boutons, barres et cadres qui s\'effacent jusqu\'à ce qu\'on en ait besoin, barres de nom qui signalent les lanceurs de sorts et les sorts interruptibles, minuteur de tir à distance. Tout se règle dans le mode Édition, est enregistré par disposition et partagé par tous vos personnages. Fonctionne sur Midnight et sur WoW: Forever, où il passe aux graphismes bronze de Forever et masque les modules qui reposent sur des systèmes modernes.',
      features: [
        'Menu de jeu enrichi (quitter le groupe, recharger l\'UI, outils de groupe)',
        'Cadres d\'unité et barres d\'incantation sans portrait, graphismes Blizzard',
        'Minimap carrée, une seule barre de boutons et un tiroir pour les boutons d\'addons',
        'Barres d\'action, cadres, buffs et suivi de quêtes masqués jusqu\'au besoin',
        'Barres de nom : lanceurs à mana, sorts interruptibles, portée',
        'Options dans le mode Édition, enregistrées par disposition',
        'Midnight et WoW: Forever avec un seul addon',
        'Plus de 140 versions publiées via CI/CD'
      ]
    }
  },
  {
    id: 'coldsnap-utilities',
    category: 'Open Source',
    type: 'Unity Package',
    title: 'ColdSnap Utilities',
    shortDescription: 'Open-source Unity package: one-window builds for every platform, TestFlight upload, scene quick open and editor helpers',
    description: 'The Unity package behind every ColdSnap game and kiosk. Platform Builder builds Windows, macOS, Android (APK and App Bundle), WebGL and iOS from one window with saved scene lists, and sends iOS builds to TestFlight from a Windows PC through a macOS runner. Around it: scene quick open, a commit-and-push window, a one-click update check, pivot tools, dark title bars on Windows, a fullscreen WebGL kiosk template and a few runtime helpers. Installs from Git in the Package Manager; versions bump themselves from commit titles.',
    icon: '🛠️',
    thumbnail: '/assets/projects/coldsnap-utilities/utilities-1-thumb.webp?v=20261110',
    media: [
      '/assets/projects/coldsnap-utilities/utilities-2.png',
      '/assets/projects/coldsnap-utilities/utilities-1.png'
    ],
    // Descriptions for screen readers and search, one per media item, same order.
    alt: [
      'Platform Builder window: target platform, build options, app name and the scene list in build order',
      'ColdSnap Utilities in the Unity Package Manager, with its Tools menu and scene switcher'
    ],
    tech: ['Unity', 'C#', 'UPM'],
    features: [
      'Platform Builder: Windows, macOS, Android, WebGL and iOS from one window',
      'Send to TestFlight from Windows (signed on a macOS runner)',
      'Scene quick open, Git commit-and-push window, update check',
      'Pivot tools, Auto Group, teleport player to the Scene camera',
      'WebGL kiosk template and kiosk setup scripts',
      'Automatic semantic versioning from commit titles'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/com.coldsnap.utilities', icon: 'fa-github' }
    ],
    fr: {
      alt: [
        'Fenêtre Platform Builder : plateforme cible, options de build, nom de l\'app et liste des scènes dans l\'ordre du build',
        'ColdSnap Utilities dans le Package Manager de Unity, avec son menu Tools et le sélecteur de scènes'
      ],
      type: 'Package Unity',
      shortDescription: 'Package Unity open source : builds de toutes les plateformes depuis une fenêtre, envoi TestFlight, ouverture rapide des scènes',
      description: 'Le package Unity derrière chaque jeu et borne ColdSnap. Platform Builder compile pour Windows, macOS, Android (APK et App Bundle), WebGL et iOS depuis une seule fenêtre avec des listes de scènes enregistrées, et envoie les builds iOS sur TestFlight depuis un PC Windows via un runner macOS. Autour : ouverture rapide des scènes, fenêtre de commit et push, vérification des mises à jour en un clic, outils de pivot, barres de titre sombres sous Windows, modèle WebGL plein écran pour bornes et quelques aides runtime. S\'installe depuis Git dans le Package Manager ; les versions montent toutes seules d\'après les titres de commit.',
      features: [
        'Platform Builder : Windows, macOS, Android, WebGL et iOS depuis une fenêtre',
        'Envoi sur TestFlight depuis Windows (signé sur un runner macOS)',
        'Ouverture rapide des scènes, fenêtre Git commit et push, mises à jour',
        'Outils de pivot, Auto Group, téléportation du joueur vers la caméra',
        'Modèle WebGL pour bornes et scripts d\'installation kiosque',
        'Versionnage sémantique automatique d\'après les commits'
      ]
    }
  },

];

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLDSNAP_PROJECTS;
}
