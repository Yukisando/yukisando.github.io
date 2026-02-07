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
 * - 'Unity Games' - Games built with Unity
 * - 'Educational Games' - Learning-focused games
 * - 'Flutter Apps' - Cross-platform mobile apps
 * - 'Web Platforms' - Web applications and sites
 * 
 * You can also create custom categories!
 */

const COLDSNAP_PROJECTS = [
  // ============================================
  // UNITY GAMES
  // ============================================
  {
    id: 'cpps-exhibit',
    category: 'Unity Games',
    type: 'Educational Game',
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
    thumbnail: '/Portfolio/waddonsync/waddonsync (1).jpeg',
    media: [
      '/Portfolio/waddonsync/waddonsync (1).jpeg',
      '/Portfolio/waddonsync/waddonsync (2).jpeg',
      '/Portfolio/waddonsync/waddonsync (3).jpeg',
    ],
    tech: ['Flutter', 'Dart', 'Google Drive API', 'OAuth 2.0'],
    features: [
      'Backup and restore of WoW addon data',
      'Secure Google Drive integration',
      'Multiple WoW installation support',
      'Easy selection of interface options'
    ],
    links: [
      { label: 'Learn More', href: '/apps/waddonsync/', icon: 'fa-info-circle' }
    ]
  },

  // ============================================
  // WEB PLATFORMS
  // ============================================
  // Example entry - uncomment and modify as needed:
  // {
  //   id: 'example-web-project',
  //   category: 'Web Platforms',
  //   type: 'Website',
  //   title: 'Example Web Project',
  //   shortDescription: 'A brief description of the web project',
  //   description: 'Full description goes here...',
  //   icon: '🌐',
  //   tech: ['React', 'Node.js', 'MongoDB'],
  //   links: [
  //     { label: 'Visit Site', href: 'https://example.com', icon: 'fa-globe' }
  //   ]
  // },

  // ============================================
  // EDUCATIONAL GAMES
  // ============================================
  // Add educational games here following the same format
  
];

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLDSNAP_PROJECTS;
}
