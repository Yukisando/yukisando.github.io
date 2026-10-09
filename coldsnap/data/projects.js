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
 *   type: 'Game' | 'App' | 'Website',   // Required: Short type label shown on cards
 *   title: 'Project Title',             // Required: Display title
 *   shortDescription: 'Brief desc...',  // Optional: Short text for card (max ~100 chars)
 *   description: 'Full description...', // Optional: Detailed description for modal
 *   icon: '🎮',                         // Optional: Emoji icon if no thumbnail
 *   thumbnail: '/path/to/image.jpg',    // Optional: Thumbnail image path
 *   media: [                            // Optional: Array of images/videos for modal gallery
 *     '/path/to/image1.jpg',
 *     '/path/to/video.mp4'
 *   ],
 *   tech: ['Unity', 'C#', 'Firebase'],  // Optional: Technology tags
 *   features: [                         // Optional: List of features for modal
 *     'Feature 1',
 *     'Feature 2'
 *   ],
 *   links: [                            // Optional: Action buttons in modal
 *     { label: 'Play Now', href: 'https://...', icon: 'fa-play' },
 *     { label: 'GitHub', href: 'https://...', icon: 'fa-github' }
 *   ],
 *   featured: true,                     // Optional: shown as the large case study above the grid
 *   fr: {                               // Optional: French text; any field missing here falls back to English
 *     type: '...', shortDescription: '...', description: '...', features: ['...']
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
    type: 'Museum Installation',
    title: 'CPPS Earthquake Museum',
    featured: true,
    shortDescription: 'Exhibit framework, touchscreen mini-games and an escape game for a public earthquake training centre',
    description: 'I built the full technology stack of a public earthquake training centre and museum in Switzerland: an integrated exhibit framework across 3 spaces and 27 interactive stations, designed with seismology experts and university professors. 30+ touchscreen mini-games and a fleet of 30 wall-mounted tablets, each running its own kiosked app over a secured local network, centrally configured and remotely updated. Around it: Escape With Wallis, an hour-long escape game guiding visitors through the exhibit, and a reservation and payment platform for state, private and educational clients with automated invoicing and reporting. The centre is also home to Europe\'s largest earthquake simulator.',
    icon: '🏛️',
    thumbnail: 'assets/projects/cpps/cpps-1-thumb.webp',
    media: [
      'assets/projects/cpps/cpps-1.jpg',
      'assets/projects/cpps/cpps-2.jpg',
      'assets/projects/cpps/cpps-3.jpg',
      'assets/projects/cpps/cpps-4.jpg',
      'assets/projects/cpps/cpps-5.jpg'
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
      { label: 'Learn More', labelFr: 'En savoir plus', href: 'https://www.valbilon.com/projects/cpps-exhibit', icon: 'fa-external-link' }
    ],
    fr: {
      type: 'Installation muséale',
      shortDescription: 'Parcours d\'exposition, mini-jeux tactiles et escape game pour un centre public de formation aux séismes',
      description: 'J\'ai développé toute la technologie d\'un centre public de formation et de prévention des séismes en Suisse : un parcours d\'exposition interactif sur 3 espaces et 27 stations, conçu avec des sismologues et des professeurs d\'université. Plus de 30 mini-jeux tactiles et une flotte de 30 tablettes murales, chacune en mode kiosque sur un réseau local sécurisé, configurées et mises à jour à distance. Autour : Escape With Wallis, un escape game d\'une heure qui guide les visiteurs à travers l\'exposition, et une plateforme de réservation et de paiement pour clients publics, privés et scolaires, avec facturation et reporting automatisés. Le centre abrite aussi le plus grand simulateur de séisme d\'Europe.',
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
    type: 'Touchscreen Installation',
    title: 'SDANA Natural Hazards Installation',
    shortDescription: 'Large-format educational touchscreen teaching visitors about natural hazards in Valais',
    description: 'An interactive installation created for SDANA, the Service des dangers naturels du Valais. Designed for a massive touchscreen at the SDANA facility, the experience helps visitors understand major natural hazards, their mechanisms, and the right behaviours to adopt through multilingual educational scenes and guided visual exploration.',
    thumbnail: 'assets/projects/sdana/sdana-1-thumb.webp',
    media: [
      'assets/projects/sdana/sdana-1.png',
      'assets/projects/sdana/sdana-2.png',
      'assets/projects/sdana/sdana-3.png'
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

  // ============================================
  // FLUTTER APPS
  // ============================================
  {
    id: 'spinlab',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'SpinLab',
    shortDescription: 'Platform connecting tennis players with certified coaches for booking lessons',
    description: 'A comprehensive platform that connects tennis players with certified coaches. Features include geolocated coach discovery, instant booking, secure payment processing, and training progress tracking. Built with Flutter for seamless cross-platform experience.',
    icon: '🎾',
    thumbnail: 'assets/projects/spinlab/spinlab-1-thumb.webp',
    media: [
      'assets/projects/spinlab/spinlab-1.jpeg',
      'assets/projects/spinlab/spinlab-2.jpeg',
      'assets/projects/spinlab/spinlab-3.jpeg',
      'assets/projects/spinlab/spinlab-4.jpeg'
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
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/spinlab/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
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
    id: 'winston',
    category: 'Flutter Apps',
    type: 'Web App',
    title: 'Winston',
    shortDescription: 'Company-wide admin butler: accounting, contracts, invoicing and AI-powered LinkedIn management in one dashboard',
    description: 'Winston is an internal company-wide admin platform built to run the full back-office of a multi-company studio. It handles quotes, invoices, business expenses, and contracts end-to-end, with PDF generation and export throughout. On top of that, it features an AI-powered LinkedIn content pipeline that automatically generates and publishes professional posts from news articles using GPT-4o-mini. Multi-company support means the same dashboard manages all entities under the studio umbrella.',
    icon: '🤖',
    thumbnail: 'assets/projects/winston/winston-1-thumb.webp',
    media: [
      'assets/projects/winston/winston-1.png'
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
    type: 'Mobile/Web App',
    title: 'Vidanim',
    shortDescription: 'Activity library for teachers and animators to document, estimate, and share creative work',
    description: 'Vidanim helps teachers and animators keep track of the activities they create for children. Each entry can include photos, required materials, and the time it took to prepare, making it easier to reuse successful ideas and plan future sessions. The app also supports sharing activities with other Vidanim users so teams can collaborate and build a reusable knowledge base together.',
    thumbnail: 'assets/projects/Vidanim/vidanim%20(1)-thumb.webp',
    media: [
      'assets/projects/Vidanim/vidanim%20(1).jpg',
      'assets/projects/Vidanim/vidanim%20(2).jpg'
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
    id: 'grapple-groove',
    category: 'Games',
    type: 'PC Game',
    title: 'GrappleGroove',
    shortDescription: 'First-person grappling hook parkour game: swing, climb and launch through physics-driven levels',
    description: 'A fast-paced first-person parkour game built around dual grappling hooks and momentum physics. Players combine rope and pole grapples with wall-running, vaulting, sliding and dynamic spring platforms to blast through increasingly creative levels. Includes a built-in level editor used during development by a multi-person team.',
    icon: '🪝',
    thumbnail: 'assets/projects/grapple-groove/grapple-groove-1-thumb.webp',
    media: [
      'assets/projects/grapple-groove/grapple-groove-1.png',
      'assets/projects/grapple-groove/grapple-groove-2.png'
    ],
    tech: ['Unity 6', 'C#', 'URP', 'Spring Physics', 'Android', 'PC'],
    features: [
      'Dual grappling hooks (rope and pole types)',
      'Full parkour system: wall-run, vault, slide, sprint',
      'Momentum-based spring platforms and physics objects',
      'Throwable and grabbable interactive objects',
      'Checkpoint and respawn system',
      'In-engine level editor',
      'Multi-designer level set'
    ],
    links: [
      { label: 'Play', labelFr: 'Jouer', href: 'https://grapplegroove.web.app', icon: 'fa-play' }
    ],
    fr: {
      type: 'Jeu PC',
      shortDescription: 'Parkour à la première personne au grappin : balancez-vous, grimpez et décollez à travers des niveaux physiques',
      description: 'Un jeu de parkour nerveux à la première personne, construit autour de deux grappins et d\'une physique d\'élan. Le joueur combine grappins à corde et à perche, course sur les murs, sauts, glissades et plateformes à ressort pour traverser des niveaux de plus en plus créatifs. Inclut un éditeur de niveaux intégré, utilisé par une équipe de plusieurs level designers.',
      features: [
        'Deux grappins (corde et perche)',
        'Parkour complet : course murale, saut, glissade, sprint',
        'Plateformes à ressort et objets physiques',
        'Objets interactifs à attraper et lancer',
        'Checkpoints et réapparition',
        'Éditeur de niveaux intégré',
        'Niveaux créés par plusieurs designers'
      ]
    }
  },
  {
    id: 'pygmak',
    category: 'Games',
    type: 'Mobile Game',
    title: 'Pygmak',
    shortDescription: 'Endless cannon-shooter: blast waves of crates with power-ups and corrupted modifiers',
    description: 'An endless mobile arcade game where players aim a turret to destroy incoming waves of crates before they breach. Power-ups like freeze, electrify, blaze and scatter shot keep the loop fresh, while corrupted crates introduce chaos modifiers: blindness, reversed aim, explosions and splits. Features a wave-based upgrade system, cosmetic shop, and ad-supported revive.',
    icon: '🎯',
    thumbnail: 'assets/projects/pygmak/pygmak-1-thumb.webp',
    media: [
      'assets/projects/pygmak/pygmak-1.jpg',
      'assets/projects/pygmak/pygmak-2.jpg',
      'assets/projects/pygmak/pygmak-demo.mp4'
    ],
    tech: ['Unity 6', 'C#', 'URP', 'LevelPlay Ads', 'Android', 'WebGL'],
    features: [
      'Wave-based endless arcade loop',
      'Power-ups: freeze, electric, fire, scatter, damage boost',
      'Corrupted crates with chaos modifiers',
      'Upgrade system and cosmetic shop',
      'Ad-supported revive system',
      'WebGL and Android build targets'
    ],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.coldsnap.pygmak', icon: 'fa-android', style: 'play-store' }
    ],
    fr: {
      type: 'Jeu mobile',
      shortDescription: 'Shooter arcade infini : pulvérisez des vagues de caisses avec bonus et modificateurs corrompus',
      description: 'Un jeu d\'arcade mobile infini : visez avec une tourelle pour détruire les vagues de caisses avant qu\'elles ne passent. Les bonus (gel, électricité, feu, tir dispersé) renouvellent la boucle de jeu, tandis que les caisses corrompues ajoutent du chaos : aveuglement, visée inversée, explosions, divisions. Système d\'améliorations par vague, boutique cosmétique et résurrection financée par la publicité.',
      features: [
        'Boucle arcade infinie par vagues',
        'Bonus : gel, électricité, feu, tir dispersé, dégâts',
        'Caisses corrompues et modificateurs de chaos',
        'Améliorations et boutique cosmétique',
        'Résurrection via publicité',
        'Versions WebGL et Android'
      ]
    }
  },

  // ============================================
  // FLUTTER APPS (continued)
  // ============================================
  {
    id: 'maya',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Maya',
    shortDescription: 'Local commerce loyalty app connecting shoppers with small businesses in southern France',
    description: 'A mobile loyalty and rewards platform designed to revive local commerce in small towns across southern France. Shoppers discover nearby businesses on an interactive map, earn points with each purchase, and unlock exclusive local offers and event deals. Merchants get a full dashboard to manage offers and track customer engagement.',
    icon: '🛍️',
    thumbnail: 'assets/projects/maya/maya-1-thumb.webp',
    media: [
      'assets/projects/maya/maya-1.jpg',
      'assets/projects/maya/maya-2.jpg',
      'assets/projects/maya/maya-3.jpg'
    ],
    tech: ['Flutter', 'Dart', 'Firebase', 'Google Maps', 'FCM', 'QR Code'],
    features: [
      'Interactive map of local businesses',
      'Points and rewards system',
      'Exclusive local offers and events',
      'Merchant dashboard with analytics',
      'QR code scanning for in-store purchases',
      'Push notifications via FCM',
      'Multi-language support'
    ],
    links: [
      { label: 'Privacy Policy', labelFr: 'Confidentialité', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ],
    fr: {
      type: 'App mobile',
      shortDescription: 'App de fidélité pour le commerce local, qui relie habitants et petits commerces du sud de la France',
      description: 'Une plateforme mobile de fidélité pensée pour redynamiser le commerce de proximité dans les petites villes du sud de la France. Les clients découvrent les commerces alentour sur une carte interactive, cumulent des points à chaque achat et débloquent des offres locales et des bons plans événementiels. Les commerçants disposent d\'un tableau de bord pour gérer leurs offres et suivre l\'engagement.',
      features: [
        'Carte interactive des commerces locaux',
        'Points et récompenses',
        'Offres locales et événements exclusifs',
        'Tableau de bord commerçant avec statistiques',
        'Scan de QR code en magasin',
        'Notifications push via FCM',
        'Multilingue'
      ]
    }
  },
  {
    id: 'posti',
    category: 'Flutter Apps',
    type: 'Desktop App',
    title: 'Posti',
    shortDescription: 'Minimalist always-on-top system tray todo and notes app for desktop',
    description: 'A lightweight desktop productivity app that lives in your system tray. Posti stays always-on-top for instant access to todos and quick notes without switching context. Designed for minimal friction, capture a thought in seconds and get back to work.',
    icon: '📌',
    thumbnail: 'assets/projects/posti/posti-1-thumb.webp',
    media: [
      'assets/projects/posti/posti-1.png'
    ],
    tech: ['Flutter', 'Dart', 'Windows', 'macOS'],
    features: [
      'System tray integration',
      'Always-on-top window',
      'Quick todo and note capture',
      'Persistent background process',
      'Minimal, distraction-free UI'
    ],
    links: [],
    fr: {
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
    id: 'badger',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Badger',
    shortDescription: 'NFC-powered digital business card, share contacts by tapping phones',
    description: 'A modern replacement for physical business cards. Badger lets you share your contact details instantly by tapping phones via NFC, or via QR code as a fallback. Create beautiful digital card profiles, export as VCF, and manage all your shared contacts in one place.',
    icon: '🪪',
    thumbnail: 'assets/projects/badger/badger-1-thumb.webp',
    media: [
      'assets/projects/badger/badger-1.jpg',
      'assets/projects/badger/badger-2.jpg',
      'assets/projects/badger/badger-3.jpg'
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
    type: 'Mobile App',
    title: 'ColisMarket',
    shortDescription: 'Parcel relay point management app with OCR scanning for package tracking',
    description: 'A mobile app for managing package pickup and delivery relay points. Features ML Kit-powered OCR to scan and extract parcel information directly from labels, streamlining the package intake process for relay operators.',
    icon: '📦',
    thumbnail: 'assets/projects/colismarket/colismarket-1-thumb.webp',
    media: [
      'assets/projects/colismarket/colismarket-1.jpg',
      'assets/projects/colismarket/colismarket-2.jpg',
      'assets/projects/colismarket/colismarket-3.jpg',
      'assets/projects/colismarket/colismarket-4.jpg'
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
    id: 'sandlog',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Sandlog',
    shortDescription: 'Voice dream journal: open the app, speak, and your dream is saved automatically',
    description: 'A frictionless dream journaling app designed to capture dreams the moment you wake up. Open the app and speak; Sandlog automatically stops recording when silence is detected and saves your dream entry. Recordings can be exported to the user\'s Google Drive for safe cloud storage.',
    icon: '🌙',
    thumbnail: 'assets/projects/sandlog/sandlog-1-thumb.webp',
    media: [
      'assets/projects/sandlog/sandlog-1.jpg',
      'assets/projects/sandlog/sandlog-2.jpg',
      'assets/projects/sandlog/sandlog-3.jpg'
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
    id: 'patoune',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Patoune',
    shortDescription: 'Cat claw trimming tracker to visualize and schedule your cat\'s nail maintenance',
    description: 'A charming companion app for cat owners that makes claw maintenance easy and stress-free. Patoune provides a visual paw diagram to track which claws have been trimmed, colour-coded reminders when trimming is due, and guidance on safe trimming techniques.',
    icon: '🐾',
    thumbnail: 'assets/projects/patoune/patoune-1-thumb.webp',
    media: [
      'assets/projects/patoune/patoune-1.jpg',
      'assets/projects/patoune/patoune-2.jpg'
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
    id: 'waddonsync',
    category: 'Open Source',
    type: 'Desktop App',
    title: 'WaddonSync',
    shortDescription: 'Backup World of Warcraft addon data to Google Drive automatically',
    description: 'A desktop utility that securely backs up your World of Warcraft addon data to Google Drive. Never lose your addon settings, keybindings, or UI configurations again.',
    icon: '🎮',
    thumbnail: 'assets/projects/waddonsync/waddonsync-1-thumb.webp',
    media: [
      'assets/projects/waddonsync/waddonsync-1.png',
      'assets/projects/waddonsync/waddonsync-2.png',
      'assets/projects/waddonsync/waddonsync-3.png',
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
    thumbnail: 'assets/projects/magic-arrow/magic-arrow-1-thumb.webp',
    media: [
      'assets/projects/magic-arrow/magic-arrow-1.jpg',
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
    shortDescription: 'Modular World of Warcraft addon with quality-of-life improvements that don\'t change core mechanics',
    description: 'Brittle and Occasionally Lethal Tweaks. A modular World of Warcraft addon delivering quality-of-life improvements without altering core gameplay. Features game menu enhancements, advanced skyriding controls, chat notifications, nameplate mana-user highlighting, saved instance tracking, and more. Actively maintained with 113+ versioned releases.',
    icon: '⚔️',
    thumbnail: 'assets/projects/bolt/bolt-1-thumb.webp',
    media: [
      'assets/projects/bolt/bolt-1.png',
      'assets/projects/bolt/bolt-2.png'
    ],
    tech: ['Lua', 'World of Warcraft API', 'GitHub Actions', 'CI/CD'],
    features: [
      'Game Menu enhancements (Leave Group, Reload UI, Group Tools)',
      'Mouse-activated skyriding flight controls',
      'Configurable chat channel sound alerts',
      'Nameplate mana-user colour highlighting',
      'Saved instances lockout overview',
      'Party frames centered growth fix',
      'Per-module enable/disable configuration',
      '113+ versioned releases via CI/CD'
    ],
    links: [
      { label: 'CurseForge', href: 'https://www.curseforge.com/wow/addons/bolt', icon: 'fa-download', style: 'curseforge' },
      { label: 'GitHub', href: 'https://github.com/Yukisando/B.O.L.T', icon: 'fa-github', secondary: true }
    ],
    fr: {
      type: 'Addon WoW',
      shortDescription: 'Addon World of Warcraft modulaire : du confort de jeu sans toucher aux mécaniques',
      description: 'Brittle and Occasionally Lethal Tweaks. Un addon World of Warcraft modulaire qui apporte du confort de jeu sans modifier le gameplay : menu de jeu enrichi, contrôles de vol dynamique avancés, alertes de chat, mise en évidence des lanceurs de sorts à mana, suivi des instances sauvegardées, et plus. Activement maintenu, plus de 113 versions publiées.',
      features: [
        'Menu de jeu enrichi (quitter le groupe, recharger l\'UI, outils de groupe)',
        'Contrôles de vol dynamique à la souris',
        'Alertes sonores par canal de chat',
        'Couleur des barres de nom pour les classes à mana',
        'Vue d\'ensemble des instances verrouillées',
        'Correctif de croissance centrée des cadres de groupe',
        'Activation/désactivation par module',
        'Plus de 113 versions publiées via CI/CD'
      ]
    }
  },
  {
    id: 'coldsnap-utilities',
    category: 'Open Source',
    type: 'Unity Package',
    title: 'ColdSnap Utilities',
    shortDescription: 'Reusable Unity C# utility package shared across all ColdSnap projects',
    description: 'An open-source Unity Package Manager (UPM) library providing shared utilities, helpers, and tools used across all ColdSnap projects. Reduces boilerplate and ensures consistency throughout the studio\'s internal Unity development pipeline.',
    icon: '🛠️',
    thumbnail: 'assets/projects/coldsnap-utilities/utilities-1-thumb.webp',
    media: [
      'assets/projects/coldsnap-utilities/utilities-1.png'
    ],
    tech: ['Unity', 'C#', 'UPM'],
    features: [
      'Unity Package Manager (UPM) compatible',
      'Reusable C# utility scripts',
      'Shared across all ColdSnap Unity projects',
      'Actively maintained'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/com.coldsnap.utilities', icon: 'fa-github' }
    ],
    fr: {
      type: 'Package Unity',
      shortDescription: 'Package Unity C# d\'utilitaires partagés par tous les projets ColdSnap',
      description: 'Une bibliothèque open source pour le Unity Package Manager (UPM) qui regroupe les utilitaires, helpers et outils communs à tous les projets ColdSnap. Moins de code répétitif, plus de cohérence dans le pipeline Unity du studio.',
      features: [
        'Compatible Unity Package Manager (UPM)',
        'Scripts utilitaires C# réutilisables',
        'Partagé par tous les projets Unity ColdSnap',
        'Activement maintenu'
      ]
    }
  },

];

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLDSNAP_PROJECTS;
}
