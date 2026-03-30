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
 *   category: 'Category Name',          // Required: 'Unity Games', 'Educational Games', 'Flutter Apps', 'Web Platforms', or custom
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
 *   ]
 * }
 * 
 * CATEGORIES:
 * - 'Interactive Installations' - Museum kiosks, training centres, large-screen exhibits
 * - 'Games' - PC, mobile and web games
 * - 'Flutter Apps' - Cross-platform mobile/desktop apps
 * - 'Web Platforms' - Web applications and sites
 * 
 * You can also create custom categories!
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
    shortDescription: 'Interactive exhibit teaching earthquake preparedness through engaging mini-games',
    description: 'A comprehensive educational exhibit at the Cyprus Civil Defence Museum. Features interactive touchscreen mini-games teaching visitors about earthquake causes, effects, and preparation. Includes an escape room experience and tablet-based learning stations throughout the museum.',
    icon: '🏛️',
    thumbnail: '/Portfolio/cpps/cpps (1).jpg',
    media: [
      '/Portfolio/cpps/cpps (1).jpg',
      '/Portfolio/cpps/cpps (2).jpg',
      '/Portfolio/cpps/cpps (3).jpg',
      '/Portfolio/cpps/cpps (4).jpg',
      '/Portfolio/cpps/cpps (5).jpg'
    ],
    tech: ['Unity', 'C#', 'Touch UI', 'Gamification'],
    features: [
      'Multiple interactive mini-games',
      'Large touchscreen exhibits',
      'Tablet-based learning stations',
      'Escape room experience',
      'Multi-language support'
    ],
    links: [
      { label: 'Learn More', href: 'https://www.valbilon.com/projects/cpps-exhibit', icon: 'fa-external-link' }
    ]
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
    thumbnail: '/Portfolio/spinlab/spinlab (1).jpeg',
    media: [
      '/Portfolio/spinlab/spinlab (1).jpeg',
      '/Portfolio/spinlab/spinlab (2).jpeg',
      '/Portfolio/spinlab/spinlab (3).jpeg',
      '/Portfolio/spinlab/spinlab (4).jpeg'
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
      { label: 'Visit Website', href: 'https://spinlab.fr', icon: 'fa-globe' },
      { label: 'Privacy Policy', href: '/apps/spinlab/privacy/', icon: 'fa-shield' }
    ]
  },
  {
    id: 'waddonsync',
    category: 'Flutter Apps',
    type: 'Desktop App',
    title: 'WaddonSync',
    shortDescription: 'Backup World of Warcraft addon data to Google Drive automatically',
    description: 'A desktop utility that securely backs up your World of Warcraft addon data to Google Drive. Never lose your addon settings, keybindings, or UI configurations again.',
    icon: '🎮',
    thumbnail: '/Portfolio/waddonsync/waddonsync (1).png',
    media: [
      '/Portfolio/waddonsync/waddonsync (1).png',
      '/Portfolio/waddonsync/waddonsync (2).png',
      '/Portfolio/waddonsync/waddonsync (3).png',
    ],
    tech: ['Flutter', 'Dart', 'Google Drive API', 'OAuth 2.0'],
    features: [
      'Backup and restore of WoW addon data',
      'Secure Google Drive integration',
      'Multiple WoW installation support',
      'Easy selection of interface options'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/WaddonSync', icon: 'fa-github' },
      { label: 'Privacy Policy', href: '/apps/waddonsync/privacy/', icon: 'fa-shield' }
    ]
  },

  // ============================================
  // GAMES
  // ============================================
  {
    id: 'grapplegrove',
    category: 'Games',
    type: 'PC Game',
    title: 'GrappleGroove',
    shortDescription: 'First-person grappling hook parkour game — swing, climb and launch through physics-driven levels',
    description: 'A fast-paced first-person parkour game built around dual grappling hooks and momentum physics. Players combine rope and pole grapples with wall-running, vaulting, sliding and dynamic spring platforms to blast through increasingly creative levels. Includes a built-in level editor used during development by a multi-person team.',
    icon: '🪝',
    tech: ['Unity 6', 'C#', 'URP', 'Spring Physics', 'Android', 'PC'],
    features: [
      'Dual grappling hooks (rope and pole types)',
      'Full parkour system — wall-run, vault, slide, sprint',
      'Momentum-based spring platforms and physics objects',
      'Throwable and grabbable interactive objects',
      'Checkpoint and respawn system',
      'In-engine level editor',
      'Multi-designer level set'
    ],
    links: []
  },
  {
    id: 'pygmak',
    category: 'Games',
    type: 'Mobile Game',
    title: 'Pygmak',
    shortDescription: 'Endless cannon-shooter — blast waves of crates with power-ups and corrupted modifiers',
    description: 'An endless mobile arcade game where players aim a turret to destroy incoming waves of crates before they breach. Power-ups like freeze, electrify, blaze and scatter shot keep the loop fresh, while corrupted crates introduce chaos modifiers — blindness, reversed aim, explosions and splits. Features a wave-based upgrade system, cosmetic shop, and ad-supported revive.',
    icon: '🎯',
    thumbnail: '/Portfolio/full/pygmak.png',
    media: [
      '/Portfolio/full/pygmak.png',
      '/Portfolio/video/pygmak.mp4'
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
    links: []
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
      { label: 'Privacy Policy', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ]
  },
  {
    id: 'posti',
    category: 'Flutter Apps',
    type: 'Desktop App',
    title: 'Posti',
    shortDescription: 'Minimalist always-on-top system tray todo and notes app for desktop',
    description: 'A lightweight desktop productivity app that lives in your system tray. Posti stays always-on-top for instant access to todos and quick notes without switching context. Designed for minimal friction — capture a thought in seconds and get back to work.',
    icon: '📌',
    tech: ['Flutter', 'Dart', 'Windows', 'macOS'],
    features: [
      'System tray integration',
      'Always-on-top window',
      'Quick todo and note capture',
      'Persistent background process',
      'Minimal, distraction-free UI'
    ],
    links: []
  },
  {
    id: 'badger',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Badger',
    shortDescription: 'NFC-powered digital business card — share contacts by tapping phones',
    description: 'A modern replacement for physical business cards. Badger lets you share your contact details instantly by tapping phones via NFC, or via QR code as a fallback. Create beautiful digital card profiles, export as VCF, and manage all your shared contacts in one place.',
    icon: '🪪',
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
      { label: 'Privacy Policy', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ]
  },
  {
    id: 'colismarket',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'ColisMarket',
    shortDescription: 'Parcel relay point management app with OCR scanning for package tracking',
    description: 'A mobile app for managing package pickup and delivery relay points. Features ML Kit-powered OCR to scan and extract parcel information directly from labels, streamlining the package intake process for relay operators.',
    icon: '📦',
    tech: ['Flutter', 'Dart', 'Google ML Kit', 'OCR', 'Android'],
    features: [
      'ML Kit OCR for parcel label scanning',
      'Package intake and tracking management',
      'Image capture and document scanning',
      'Relay point operator dashboard',
      'Local persistent storage'
    ],
    links: [
      { label: 'Privacy Policy', href: '/apps/generic/privacy/', icon: 'fa-shield', secondary: true }
    ]
  },
  {
    id: 'patoune',
    category: 'Flutter Apps',
    type: 'Mobile App',
    title: 'Patoune',
    shortDescription: 'Cat claw trimming tracker — visualize and schedule your cat\'s nail maintenance',
    description: 'A charming companion app for cat owners that makes claw maintenance easy and stress-free. Patoune provides a visual paw diagram to track which claws have been trimmed, colour-coded reminders when trimming is due, and guidance on safe trimming techniques.',
    icon: '🐾',
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
      { label: 'Privacy Policy', href: '/apps/patoune/privacy/', icon: 'fa-shield', secondary: true }
    ]
  },

  // ============================================
  // WEB PLATFORMS
  // ============================================
  {
    id: 'winston',
    category: 'Web Platforms',
    type: 'Web App',
    title: 'Winston',
    shortDescription: 'Company-wide admin butler — accounting, contracts, invoicing, and AI-powered LinkedIn management in one dashboard',
    description: 'Winston is an internal company-wide admin platform built to run the full back-office of a multi-company studio. It handles quotes, invoices, business expenses, and contracts end-to-end, with PDF generation and export throughout. On top of that, it features an AI-powered LinkedIn content pipeline that automatically generates and publishes professional posts from news articles using GPT-4o-mini. Multi-company support means the same dashboard manages all entities under the studio umbrella.',
    icon: '🤖',
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
    links: []
  },

  // ============================================
  // OPEN SOURCE
  // ============================================
  {
    id: 'magic-arrow',
    category: 'Open Source',
    type: 'Minecraft Plugin',
    title: 'Magic Arrow',
    shortDescription: 'Minecraft plugin adding block-placing and elemental abilities to bows based on the block you stand on',
    description: 'A Java Minecraft plugin built from scratch that gives the bow and arrow context-sensitive superpowers. The effect fired depends on the block under the player\'s feet — standing on ice fires a freeze arrow, on TNT fires an explosive, on grass places blocks, and so on. A fun exploration of the Bukkit/Spigot API.',
    icon: '🏹',
    tech: ['Java', 'Bukkit/Spigot API', 'Minecraft'],
    features: [
      'Context-sensitive bow abilities based on standing block',
      'Block-placing arrows',
      'Elemental effects (freeze, explode, and more)',
      'Built from scratch on the Bukkit/Spigot API'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/MagicArrow', icon: 'fa-github' }
    ]
  },
  {
    id: 'bolt',
    category: 'Open Source',
    type: 'WoW Addon',
    title: 'B.O.L.T',
    shortDescription: 'Modular World of Warcraft addon with quality-of-life improvements that don\'t change core mechanics',
    description: 'Brittle and Occasionally Lethal Tweaks — a modular World of Warcraft addon delivering quality-of-life improvements without altering core gameplay. Features game menu enhancements, advanced skyriding controls, chat notifications, nameplate mana-user highlighting, saved instance tracking, and more. Actively maintained with 113+ versioned releases.',
    icon: '⚔️',
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
      { label: 'GitHub', href: 'https://github.com/Yukisando/B.O.L.T', icon: 'fa-github' }
    ]
  },
  {
    id: 'coldsnap-utilities',
    category: 'Open Source',
    type: 'Unity Package',
    title: 'ColdSnap Utilities',
    shortDescription: 'Reusable Unity C# utility package shared across all ColdSnap projects',
    description: 'An open-source Unity Package Manager (UPM) library providing shared utilities, helpers, and tools used across all ColdSnap projects. Reduces boilerplate and ensures consistency throughout the studio\'s internal Unity development pipeline.',
    icon: '🛠️',
    tech: ['Unity', 'C#', 'UPM'],
    features: [
      'Unity Package Manager (UPM) compatible',
      'Reusable C# utility scripts',
      'Shared across all ColdSnap Unity projects',
      'Actively maintained'
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Yukisando/com.coldsnap.utilities', icon: 'fa-github' }
    ]
  },

];

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLDSNAP_PROJECTS;
}
