// Builds the static ColdSnap pages:
//   tools/coldsnap-site/index.html    ->  coldsnap/index.html (French, served at /)
//                                     ->  coldsnap/en/index.html (English, served at /en/)
//   tools/coldsnap-site/project.html  ->  coldsnap/projets/index.html and coldsnap/projets/<id>/index.html (French)
//                                     ->  coldsnap/en/projects/index.html and coldsnap/en/projects/<id>/index.html (English)
//   and coldsnap/sitemap.xml with every page and its hreflang twin.
// The homepage template carries the English text plus data-i18n keys; French comes from
// coldsnap/js/i18n-strings.js, the same file the browser uses for script-made text.
// Project pages reuse the homepage's header, footer and language redirect (the
// <!-- partial:name --> blocks) and take their text from coldsnap/data/projects.js.
// It also minifies coldsnap/css/coldsnap.css into coldsnap.min.css (esbuild, via npx) and versions
// it by content, so pages (404 and legal included) never need a manual ?v= bump for the CSS.
// Run after editing a template, the strings, the CSS or the projects:  node tools/coldsnap-build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'coldsnap');
const SITE_URL = 'https://coldsnap.fr';
const read = path => readFileSync(join(root, path), 'utf8');

const template = read('tools/coldsnap-site/index.html');
const projectTemplate = read('tools/coldsnap-site/project.html');
const sandbox = { window: {} };
vm.runInNewContext(read('coldsnap/js/i18n-strings.js'), sandbox);
const { FR, TITLES } = sandbox.window.CS_STRINGS;
const data = {};
vm.runInNewContext(read('coldsnap/data/projects.js') + '\nthis.projects = COLDSNAP_PROJECTS;', data);
const PROJECTS = data.projects.filter(p => p.id && p.id !== 'unique-id');

const escapeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Shared blocks of the homepage template, reused by the project pages.
const partials = {};
for (const [, name, body] of template.matchAll(/<!-- partial:(\w+)[^>]*-->([\s\S]*?)<!-- \/partial:\1 -->/g)) {
  partials[name] = body.trim();
}
for (const name of ['redirect', 'header', 'footer']) {
  if (!partials[name]) throw new Error(`Missing <!-- partial:${name} --> block in the homepage template`);
}
// Project pages load the same CSS and string files as the homepage, at the same ?v= version.
const versionOf = file => {
  const match = template.match(new RegExp(file.replace(/[./]/g, '\\$&') + '\\?v=(\\w+)'));
  if (!match) throw new Error(`No ?v= version for ${file} in the homepage template`);
  return match[1];
};

// ── CSS ──────────────────────────────────────────────────────
// Edit coldsnap.css; pages load coldsnap.min.css?v=<hash of its content>.
const cssSource = read('coldsnap/css/coldsnap.css');
let cssMin;
try {
  cssMin = execSync('npx -y esbuild@0.24.0 --loader=css --minify --log-level=error', { input: cssSource, cwd: root, encoding: 'utf8', maxBuffer: 16 << 20 });
} catch (e) {
  console.warn('esbuild unavailable, coldsnap.min.css is not minified:', e.message.split('\n')[0]);
  cssMin = cssSource;
}
writeFileSync(join(site, 'css', 'coldsnap.min.css'), cssMin);
const CSS_VERSION = createHash('sha256').update(cssMin).digest('hex').slice(0, 10);
// 404 and legal pages are written by hand; keep their stylesheet link on the same version.
for (const page of ['404.html', 'legal/index.html', 'legal/cgv/index.html', 'legal/confidentialite/index.html', 'legal/charte/index.html']) {
  const file = join(site, page);
  const html = readFileSync(file, 'utf8');
  const next = html.replace(/coldsnap(\.min)?\.css\?v=\w+/g, `coldsnap.min.css?v=${CSS_VERSION}`);
  if (next !== html) writeFileSync(file, next);
}

const LANGS = {
  fr: { home: '/', projects: '/projets/', ogLocale: 'fr_FR', ogLocaleAlt: 'en_GB' },
  en: { home: '/en/', projects: '/en/projects/', ogLocale: 'en_GB', ogLocaleAlt: 'fr_FR' },
};
const HOME = {
  fr: { description: FR['meta.description'], ogDescription: FR['meta.ogDescription'] },
  en: {
    description: 'Gamification studio on the French Riviera, working worldwide: interactive museum installations, educational games and cross-platform apps.',
    ogDescription: 'Interactive installations, educational games and cross-platform apps. Based on the French Riviera, working worldwide.',
  },
};
// English for the strings the project pages use; French is in i18n-strings.js.
const EN = {
  'project.home': 'Home',
  'project.viewer': 'Open in the viewer',
  'projects.description': 'All ColdSnap projects: interactive installations, games, Flutter apps, web platforms and open-source tools.',
  'footer.projects': 'All projects',
  'work.title': 'Projects',
  'nav.cta': 'Start a project',
  'modal.features': 'Features',
  'modal.tech': 'Technologies',
  'filter.Interactive Installations': 'Installations',
  'filter.Games': 'Games',
  'filter.Flutter Apps': 'Apps',
  'filter.Web Platforms': 'Web platforms',
  'filter.Open Source': 'Open source',
  'project.related': 'Related projects',
  'project.seeAll': 'All our {service}',
};
const say = (lang, key) => (lang === 'fr' && key in FR ? FR[key] : EN[key]);
const field = (project, name, lang) =>
  lang === 'fr' && project.fr && project.fr[name] !== undefined ? project.fr[name] : project[name];

const missing = new Set();
function translate(html) {
  const fr = key => {
    if (key in FR) return FR[key];
    missing.add(key);
    return null;
  };
  // <tag data-i18n="key">text</tag> and <tag data-i18n-html="key">markup</tag> (leaf elements)
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n(-html)?="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (all, open, tag, isHtml, key, inner, close) => {
      const value = fr(key);
      return value === null ? all : open + (isHtml ? value : escapeText(value)) + close;
    });
  // data-i18n-attr="attr:key, attr2:key2"
  html = html.replace(/<[a-z0-9]+\b[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(',')) {
      const [attr, key] = pair.split(':').map(s => s.trim());
      const value = fr(key);
      if (value !== null) tag = tag.replace(new RegExp(`(\s${attr}=")[^"]*"`), `$1${escapeAttr(value)}"`);
    }
    return tag;
  });
  // the legal pages pick their language from ?lang=fr
  html = html.replace(/(data-legal-href="([^"]+)"[^>]*?\shref=")[^"]*"/g, '$1$2?lang=fr"');
  return html;
}

function fill(html, vars) {
  for (const [key, value] of Object.entries(vars)) html = html.replaceAll(`{{${key}}}`, value);
  return html;
}

const written = [];
function write(path, html, lang) {
  if (lang === 'fr') html = translate(html);
  const leftover = html.match(/\{\{[a-z_:]+\}\}/);
  if (leftover) throw new Error(`Unfilled placeholder ${leftover[0]} in ${path}`);
  mkdirSync(dirname(join(site, path)), { recursive: true });
  writeFileSync(join(site, path), html);
  written.push(`${path}  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
}

const BANNER = 'Generated by tools/coldsnap-build.mjs from tools/coldsnap-site/. Do not edit by hand.';
const BOOT_VERSION = '20261110a';
const shared = (lang, pathFr, pathEn) => ({
  banner: BANNER,
  // js/boot.js, relative to the page so it also loads on nathandecastro.com/coldsnap/.
  boot_src: '../'.repeat((lang === 'fr' ? pathFr : pathEn).split('/').filter(Boolean).length) + `js/boot.js?v=${BOOT_VERSION}`,
  media_sizes_version: MEDIA_SIZES_VERSION,
  lang,
  og_locale: LANGS[lang].ogLocale,
  og_locale_alt: LANGS[lang].ogLocaleAlt,
  path_fr: pathFr,
  path_en: pathEn,
  projects_index: LANGS[lang].projects,
  ...Object.fromEntries(SERVICES.map(sv => [`svc_${sv.id.replace('-', '_')}`, sv.path[lang]])),
  current_fr: lang === 'fr' ? ' aria-current="page"' : '',
  current_en: lang === 'en' ? ' aria-current="page"' : '',
});

// ── Media ────────────────────────────────────────────────────
// Light copies made by tools/coldsnap-media.py, same naming as mediaVariant() in js/coldsnap.js.
const isVideo = src => /\.(mp4|webm)(\?|$)/i.test(src);
const variant = (src, suffix) => src.replace(/\.[a-z0-9]+(\?.*)?$/i, (_, query) => '-' + suffix + (query || ''));

// Width and height of a WebP file, so images reserve their space before loading.
function webpSize(src) {
  const file = join(site, src.split('?')[0]);
  if (!existsSync(file)) return null;
  const b = readFileSync(file);
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}
const sizeAttrs = src => {
  const size = webpSize(src);
  return size ? ` width="${size.w}" height="${size.h}"` : '';
};

// Half-size copies (tools/coldsnap-media.py) that phones pick through srcset.
const small = src => variant(src, 'sm.webp');
const srcsetAttr = (src, sizes) => {
  const big = webpSize(src);
  const sm = webpSize(small(src));
  return big && sm ? ` srcset="${escapeAttr(small(src))} ${sm.w}w, ${escapeAttr(src)} ${big.w}w" sizes="${sizes}"` : '';
};

// Width and height of every viewer image and card thumbnail (and their -sm copies), for the
// script-made viewer and project cards: js/coldsnap.js reads window.CS_MEDIA_SIZES.
const mediaSizes = {};
const addSize = src => {
  const key = src.split('?')[0];
  const size = webpSize(key);
  if (size) mediaSizes[key] = [size.w, size.h];
};
for (const p of PROJECTS) {
  for (const lang of ['en', 'fr']) {
    const thumb = field(p, 'thumbnail', lang);
    if (thumb) [thumb, small(thumb)].forEach(addSize);
    for (const src of field(p, 'media', lang) || []) {
      const view = variant(src, 'view.webp');
      [view, small(view)].forEach(addSize);
    }
  }
}
const mediaSizesJs = `// ${BANNER}\nwindow.CS_MEDIA_SIZES = ${JSON.stringify(mediaSizes)};\n`;
writeFileSync(join(site, 'data', 'media-sizes.js'), mediaSizesJs);
const MEDIA_SIZES_VERSION = createHash('sha256').update(mediaSizesJs).digest('hex').slice(0, 10);

// Landscape shots take two gallery columns, phone screenshots one.
const shotClass = src => {
  const size = webpSize(src);
  return size && size.w > size.h ? 'sub-shot sub-shot--wide' : 'sub-shot';
};

function projectMedia(project, lang) {
  const media = field(project, 'media', lang) || [];
  const alts = field(project, 'alt', lang) || [];
  const items = media.map((src, i) => ({
    video: isVideo(src),
    alt: alts[i] || project.title,
    full: src,
    view: isVideo(src) ? variant(src, 'view.mp4') : variant(src, 'view.webp'),
    poster: variant(src, 'view.webp'),
  }));
  const thumbnail = field(project, 'thumbnail', lang);
  if (!items.length && thumbnail) items.push({ alt: project.title, full: thumbnail, view: thumbnail, poster: thumbnail });
  return items;
}

const absolute = path => SITE_URL + path.split('?')[0];
// 1200×630 share card for pages without a screenshot of their own.
const ogImage = lang => `${SITE_URL}/assets/og-coldsnap${lang === 'en' ? '-en' : ''}.png`;
const shareImage = (project, lang) => {
  const thumbnail = field(project, 'thumbnail', lang);
  if (thumbnail) return absolute(thumbnail);
  const first = projectMedia(project, lang)[0];
  return first ? absolute(first.poster) : ogImage(lang);
};

// ≤155 characters, cut on a word.
function metaDescription(text) {
  text = String(text || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 155) return text;
  return text.slice(0, 154).replace(/[\s,;:.]+\S*$/, '') + '…';
}

// ── Pages ────────────────────────────────────────────────────
const projectPath = (lang, id) => `${LANGS[lang].projects}${id}/`;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${String(name).replace(/^fa-/, '')}"/></svg>`;
const CATEGORY_ICONS = {
  'Interactive Installations': 'desktop',
  'Games': 'gamepad',
  'Flutter Apps': 'mobile',
  'Web Platforms': 'globe',
  'Open Source': 'code',
};
const APP_CATEGORY = {
  'Games': 'GameApplication',
  'Flutter Apps': 'MobileApplication',
  'Web Platforms': 'WebApplication',
  'Open Source': 'DeveloperApplication',
};
const resolveHref = href => (href.startsWith('/apps/') ? 'https://nathandecastro.com' + href : href);
// Same id as the full Organization block on the homepage.
const ORGANIZATION = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'ColdSnap', url: `${SITE_URL}/` };

const crumbs = items => items.map(([label, href]) => href
  ? `          <li><a href="${href}">${escapeText(label)}</a></li>`
  : `          <li aria-current="page">${escapeText(label)}</li>`).join('\n');
const breadcrumbLd = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url || SITE_URL + href })),
});
// ── Service pages ────────────────────────────────────────────
// One page per kind of work, for people searching "interactive installation", "serious game"...
// Each lists the matching projects (ids, in this order) under a short factual intro.
const SERVICES = [
  {
    id: 'installations',
    path: { fr: '/installations-interactives/', en: '/en/interactive-installations/' },
    projects: ['cpps-exhibit', 'sdana-installation', 'helpdetective', 'exploreum'],
    fr: {
      name: 'installations interactives',
      title: 'Installations interactives pour musées et lieux de visite',
      intro: 'Bornes et grands écrans tactiles, mini-jeux, escape games et réalité virtuelle pour les musées, les centres de formation et les lieux de visite. Nos installations accueillent environ 30 000 visiteurs par an.',
    },
    en: {
      name: 'interactive installations',
      title: 'Interactive installations for museums and visitor sites',
      intro: 'Touchscreen kiosks and large screens, mini-games, escape games and virtual reality for museums, training centres and visitor sites. Our installations welcome about 30,000 visitors a year.',
    },
  },
  {
    id: 'serious-games',
    path: { fr: '/jeux-educatifs/', en: '/en/educational-games/' },
    projects: ['cpps-exhibit', 'helpdetective', 'sdana-installation', 'exploreum', 'seba'],
    fr: {
      name: 'jeux éducatifs',
      title: 'Jeux éducatifs et serious games',
      intro: 'Des jeux qui font apprendre : quiz, défis, escape games, réalité virtuelle et cartes à collectionner, pour les musées, la formation professionnelle et le grand public.',
    },
    en: {
      name: 'educational games',
      title: 'Educational games and serious games',
      intro: 'Games that teach: quizzes, challenges, escape games, virtual reality and collectible cards, for museums, professional training and the general public.',
    },
  },
  {
    id: 'mobile-apps',
    path: { fr: '/applications-mobiles/', en: '/en/mobile-apps/' },
    projects: ['exploreum', 'maya', 'spinlab', 'seba', 'badalone', 'pygmak', 'vidanim', 'propos', 'sandlog', 'badger', 'colismarket', 'patoune'],
    fr: {
      name: 'applications mobiles',
      title: 'Applications mobiles iOS et Android',
      intro: "Applications sur mesure pour iPhone et Android, développées avec Flutter : une seule base de code pour les deux plateformes, publiée sur l'App Store et Google Play, avec un espace d'administration web quand il en faut un.",
    },
    en: {
      name: 'mobile apps',
      title: 'iOS and Android mobile apps',
      intro: 'Custom apps for iPhone and Android, built with Flutter: one codebase for both platforms, published on the App Store and Google Play, with a web admin space when one is needed.',
    },
  },
  {
    id: 'web-apps',
    path: { fr: '/applications-web/', en: '/en/web-apps/' },
    projects: ['winston', 'maya', 'exploreum', 'propos', 'coldsnap-arcade', 'vidanim'],
    fr: {
      name: 'applications web',
      title: 'Applications et plateformes web',
      intro: "Plateformes web, tableaux de bord et espaces d'administration : la partie web des applications que nous livrons, ou un outil web à part entière.",
    },
    en: {
      name: 'web apps',
      title: 'Web apps and platforms',
      intro: 'Web platforms, dashboards and admin spaces: the web side of the apps we deliver, or a web tool in its own right.',
    },
  },
];
// Projects marked hidden: true in projects.js are already filtered out; drop them here too, with a note.
for (const service of SERVICES) {
  for (const id of service.projects) {
    if (!PROJECTS.some(p => p.id === id)) console.warn(`Service ${service.id}: project ${id} is hidden or unknown, left out`);
  }
  service.projects = service.projects.filter(id => PROJECTS.some(p => p.id === id));
}
const servicesOf = project => SERVICES.filter(sv => sv.projects.includes(project.id));

// A project in a list: thumbnail, title, type, one-line description.
function projectItem(p, lang) {
  const thumb = field(p, 'thumbnail', lang);
  return `          <li>
            <a href="${projectPath(lang, p.id)}">
              ${thumb ? `<img src="${escapeAttr(thumb)}" alt=""${sizeAttrs(thumb)} loading="lazy" decoding="async">` : `<span class="sub-list__icon" aria-hidden="true">${p.icon || '✦'}</span>`}
              <span><strong>${escapeText(p.title)}</strong> <em>${escapeText(field(p, 'type', lang) || '')}</em><span>${escapeText(field(p, 'shortDescription', lang) || '')}</span></span>
            </a>
          </li>`;
}

// Up to three projects that share a service with this one (else its category), in list order.
function relatedProjects(project) {
  const pool = servicesOf(project).flatMap(sv => sv.projects).map(id => PROJECTS.find(p => p.id === id));
  const sameCategory = PROJECTS.filter(p => p.category === project.category);
  const picked = [];
  for (const p of [...pool, ...sameCategory]) {
    if (p.id !== project.id && !picked.includes(p)) picked.push(p);
    if (picked.length === 3) break;
  }
  return picked;
}

const jsonld = graph => JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
  .replace(/</g, '\\u003c').replace(/^/gm, '  ');

function related(project, lang) {
  const list = relatedProjects(project);
  if (!list.length) return '';
  const seeAll = servicesOf(project).map(sv =>
    `<a href="${sv.path[lang]}">${escapeText(say(lang, 'project.seeAll').replace('{service}', sv[lang].name))} ${icon('arrow-right')}</a>`).join(' ');
  return `
        <section class="sub-related" aria-labelledby="related-title">
          <h2 id="related-title">${escapeText(say(lang, 'project.related'))}</h2>
          <ul class="sub-list">
${list.map(p => projectItem(p, lang)).join('\n')}
          </ul>${seeAll ? `
          <p class="sub-related__more">${seeAll}</p>` : ''}
        </section>`;
}

function projectPage(project, lang) {
  const path = projectPath(lang, project.id);
  const url = SITE_URL + path;
  const type = field(project, 'type', lang) || '';
  const short = field(project, 'shortDescription', lang) || '';
  const description = field(project, 'description', lang) || short;
  const features = field(project, 'features', lang) || [];
  const media = projectMedia(project, lang);
  const home = LANGS[lang].home;

  const stats = (project.stats || []).map(s => `
          <div class="viewer__stat"><strong>${escapeText(s.value)}</strong><span>${escapeText(lang === 'fr' && s.fr ? s.fr : s.label)}</span></div>`).join('');
  const gallery = media.map((m, i) => m.video
    ? `
        <figure class="${shotClass(m.poster)}">
          <video src="${escapeAttr(m.view)}" poster="${escapeAttr(m.poster)}" controls playsinline preload="${i ? 'none' : 'metadata'}" aria-label="${escapeAttr(m.alt)}"${sizeAttrs(m.poster)}></video>
        </figure>`
    : `
        <figure class="${shotClass(m.view)}">
          <a href="${escapeAttr(m.full)}" target="_blank" rel="noopener"><img src="${escapeAttr(m.view)}"${srcsetAttr(m.view, shotClass(m.view).includes('wide') ? '(max-width: 600px) 100vw, 560px' : '(max-width: 600px) 100vw, 280px')} alt="${escapeAttr(m.alt)}"${sizeAttrs(m.view)}${i ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async"></a>
        </figure>`).join('');
  const links = (project.links || []).map(link => {
    const external = !link.href.startsWith('mailto:');
    const label = lang === 'fr' && link.labelFr ? link.labelFr : link.label;
    if (link.soon) return `
          <span class="modal-link ${link.style || ''} soon" aria-disabled="true">${link.icon ? icon(link.icon) + ' ' : ''}${escapeText(label)} <small class="soon-tag">${lang === 'fr' ? 'bientôt' : 'soon'}</small></span>`;
    return `
          <a href="${escapeAttr(resolveHref(link.href))}" class="modal-link ${link.style || (link.secondary ? 'secondary' : '')}"${external ? ' target="_blank" rel="noopener"' : ''}>${link.icon ? icon(link.icon) + ' ' : ''}${escapeText(label)}</a>`;
  }).join('');

  const content = `
      <article class="sub-project">
        <header class="sub-head">
          <p class="viewer__type">${icon(CATEGORY_ICONS[project.category] || 'folder')} ${escapeText(type)}</p>
          <h1>${escapeText(project.title)}</h1>
          <p class="sub-lead">${escapeText(description)}</p>
        </header>${stats ? `
        <div class="viewer__stats">${stats}
        </div>` : ''}${gallery ? `
        <div class="sub-gallery">${gallery}
        </div>` : ''}${features.length ? `
        <h2>${escapeText(say(lang, 'modal.features'))}</h2>
        <ul class="viewer__features">
${features.map(f => `          <li>${escapeText(f)}</li>`).join('\n')}
        </ul>` : ''}${project.tech && project.tech.length ? `
        <h2>${escapeText(say(lang, 'modal.tech'))}</h2>
        <div class="viewer__tech">
          ${project.tech.map(t => `<span class="tech-tag">${escapeText(t)}</span>`).join(' ')}
        </div>` : ''}${links ? `
        <div class="modal-links sub-links">${links}
        </div>` : ''}
${related(project, lang)}
        <p class="sub-actions">
          <a class="btn btn--ghost" href="${home}?project=${project.id}#work">${icon('arrow-left')} ${escapeText(say(lang, 'project.viewer'))}</a>
          <a class="btn btn--primary" href="${home}#contact">${escapeText(say(lang, 'nav.cta'))} ${icon('arrow-right')}</a>
        </p>
      </article>`;

  const trail = [
    [say(lang, 'project.home'), home],
    [say(lang, 'work.title'), LANGS[lang].projects],
    [project.title, null, url],
  ];
  const work = {
    '@type': project.category === 'Interactive Installations' ? 'CreativeWork' : 'SoftwareApplication',
    '@id': url + '#project',
    name: project.title,
    description: metaDescription(description),
    url,
    image: media.filter(m => !m.video).map(m => absolute(m.view)).slice(0, 6),
    inLanguage: lang,
    creator: ORGANIZATION,
    keywords: (project.tech || []).join(', '),
  };
  if (APP_CATEGORY[project.category]) work.applicationCategory = APP_CATEGORY[project.category];
  if (!work.image.length) work.image = shareImage(project, lang);

  return { path, html: renderSub(lang, {
    title: escapeAttr(`${project.title} — ${type} | ColdSnap`),
    description: escapeAttr(metaDescription(short || description)),
    url,
    url_fr: SITE_URL + projectPath('fr', project.id),
    url_en: SITE_URL + projectPath('en', project.id),
    image: escapeAttr(shareImage(project, lang)),
    crumbs: crumbs(trail),
    content,
    jsonld: jsonld([work, breadcrumbLd(trail)]),
  }, projectPath('fr', project.id), projectPath('en', project.id)) };
}

function indexPage(lang) {
  const path = LANGS[lang].projects;
  const url = SITE_URL + path;
  const groups = [...new Set(PROJECTS.map(p => p.category))].map(category => `
      <section class="sub-group" aria-labelledby="cat-${category.toLowerCase().replace(/\W+/g, '-')}">
        <h2 id="cat-${category.toLowerCase().replace(/\W+/g, '-')}">${icon(CATEGORY_ICONS[category] || 'folder')} ${escapeText(say(lang, 'filter.' + category))}</h2>
        <ul class="sub-list">
${PROJECTS.filter(p => p.category === category).map(p => projectItem(p, lang)).join('\n')}
        </ul>
      </section>`).join('');
  const content = `
      <header class="sub-head">
        <h1>${escapeText(say(lang, 'work.title'))}</h1>
      </header>${groups}`;
  const trail = [[say(lang, 'project.home'), LANGS[lang].home], [say(lang, 'work.title'), null, url]];
  const list = {
    '@type': 'CollectionPage',
    '@id': url,
    name: say(lang, 'work.title'),
    url,
    inLanguage: lang,
    publisher: ORGANIZATION,
    hasPart: PROJECTS.map(p => ({ '@type': 'CreativeWork', name: p.title, url: SITE_URL + projectPath(lang, p.id) })),
  };
  return { path, html: renderSub(lang, {
    title: escapeAttr(`${say(lang, 'work.title')} | ColdSnap`),
    description: escapeAttr(say(lang, 'projects.description')),
    url,
    url_fr: SITE_URL + LANGS.fr.projects,
    url_en: SITE_URL + LANGS.en.projects,
    image: ogImage(lang),
    crumbs: crumbs(trail),
    content,
    jsonld: jsonld([list, breadcrumbLd(trail)]),
  }, LANGS.fr.projects, LANGS.en.projects) };
}

function servicePage(service, lang) {
  const text = service[lang];
  const path = service.path[lang];
  const url = SITE_URL + path;
  const projects = service.projects.map(id => PROJECTS.find(p => p.id === id));
  const others = SERVICES.filter(sv => sv !== service).map(sv =>
    `<a href="${sv.path[lang]}">${escapeText(sv[lang].title)}</a>`).join(' · ');
  const content = `
      <header class="sub-head">
        <h1>${escapeText(text.title)}</h1>
        <p class="sub-lead">${escapeText(text.intro)}</p>
      </header>
      <section class="sub-group">
        <ul class="sub-list">
${projects.map(p => projectItem(p, lang)).join('\n')}
        </ul>
      </section>
      <p class="sub-related__more">${others}</p>
      <p class="sub-actions">
        <a class="btn btn--primary" href="${LANGS[lang].home}#contact">${escapeText(say(lang, 'nav.cta'))} ${icon('arrow-right')}</a>
      </p>`;
  const trail = [[say(lang, 'project.home'), LANGS[lang].home], [text.title, null, url]];
  const page = {
    '@type': 'CollectionPage',
    '@id': url,
    name: text.title,
    description: text.intro,
    url,
    inLanguage: lang,
    about: { '@type': 'Service', name: text.title, provider: ORGANIZATION, areaServed: { '@type': 'Place', name: 'Worldwide' } },
    publisher: ORGANIZATION,
    hasPart: projects.map(p => ({ '@type': 'CreativeWork', name: p.title, url: SITE_URL + projectPath(lang, p.id) })),
  };
  return { path, html: renderSub(lang, {
    title: escapeAttr(`${text.title} | ColdSnap`),
    description: escapeAttr(metaDescription(text.intro)),
    url,
    url_fr: SITE_URL + service.path.fr,
    url_en: SITE_URL + service.path.en,
    image: ogImage(lang),
    crumbs: crumbs(trail),
    content,
    jsonld: jsonld([page, breadcrumbLd(trail)]),
  }, service.path.fr, service.path.en) };
}

function renderSub(lang, vars, pathFr, pathEn) {
  const base = shared(lang, pathFr, pathEn);
  let html = projectTemplate
    .replace('{{partial:redirect}}', partials.redirect)
    .replace('{{partial:header}}', partials.header)
    .replace('{{partial:footer}}', partials.footer);
  return fill(html, {
    ...base,
    ...vars,
    home: LANGS[lang].home,
    css_version: CSS_VERSION,
    strings_version: versionOf('/js/i18n-strings.js'),
    i18n_version: versionOf('/js/i18n.js'),
  });
}

// ── Homepage ─────────────────────────────────────────────────
for (const lang of ['fr', 'en']) {
  const noscript = PROJECTS.map(p =>
    `              <li><a href="${projectPath(lang, p.id)}">${escapeText(p.title)}</a> · ${escapeText(field(p, 'type', lang) || '')}</li>`).join('\n');
  const html = fill(template, {
    ...shared(lang, LANGS.fr.home, LANGS.en.home),
    home: '',
    title: escapeAttr(TITLES[lang]),
    description: escapeAttr(HOME[lang].description),
    og_description: escapeAttr(HOME[lang].ogDescription),
    url: SITE_URL + LANGS[lang].home,
    css_version: CSS_VERSION,
    og_image: ogImage(lang),
    noscript_projects: noscript,
  });
  write(lang === 'fr' ? 'index.html' : 'en/index.html', html, lang);
}

// ── Project pages (old project folders are removed first) ────
for (const lang of ['fr', 'en']) {
  const dir = join(site, LANGS[lang].projects);
  if (existsSync(dir)) {
    const ids = new Set(PROJECTS.map(p => p.id));
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !ids.has(entry.name)) rmSync(join(dir, entry.name), { recursive: true });
    }
  }
  const index = indexPage(lang);
  write(index.path.slice(1) + 'index.html', index.html, lang);
  for (const project of PROJECTS) {
    const page = projectPage(project, lang);
    write(page.path.slice(1) + 'index.html', page.html, lang);
  }
}

// ── Service pages ──
for (const lang of ['fr', 'en']) {
  for (const service of SERVICES) {
    const page = servicePage(service, lang);
    write(page.path.slice(1) + 'index.html', page.html, lang);
  }
}

// ── llms.txt ─────────────────────────────────────────────────
// Plain-text summary for AI assistants and agents (llmstxt.org): who ColdSnap is, what it
// offers, and links to every service and project page. English, with the French pages linked.
const llms = `# ColdSnap

> ${HOME.en.description}

ColdSnap is a gamification studio based in Mouans-Sartoux (French Riviera, France), working with clients worldwide in French or English. Clients are museums, science and training centres, schools, local authorities and companies. Legal entity: Nathan de Castro Fernandes EI, trading as ColdSnap, SIRET 940 000 649 00019, VAT FR14940000649.

- Contact: contact@coldsnap.fr, +33 6 27 64 80 28, or the form at ${SITE_URL}/en/#contact
- Site in French: ${SITE_URL}/ · in English: ${SITE_URL}/en/

## Services

${SERVICES.map(sv => `- [${sv.en.title}](${SITE_URL}${sv.path.en}): ${sv.en.intro}`).join('\n')}

## Projects

${PROJECTS.map(p => `- [${p.title}](${SITE_URL}${projectPath('en', p.id)}) (${p.type || p.category}): ${p.shortDescription || ''}`).join('\n')}

## Optional

- [All projects](${SITE_URL}${LANGS.en.projects})
- [Legal notice](${SITE_URL}/legal/?lang=en)
- [Terms of sale](${SITE_URL}/legal/cgv/?lang=en)
- [Privacy policy](${SITE_URL}/legal/confidentialite/?lang=en)
`;
writeFileSync(join(site, 'llms.txt'), llms);
written.push(`llms.txt  ${(Buffer.byteLength(llms) / 1024).toFixed(1)} KB`);

// ── Sitemap ──────────────────────────────────────────────────
const lastChange = (...files) => {
  try {
    return execSync(`git log -1 --format=%cs -- ${files.join(' ')}`, { cwd: root, encoding: 'utf8' }).trim()
      || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};
const homeDate = lastChange('tools/coldsnap-site/index.html', 'coldsnap/js/i18n-strings.js');
const projectsDate = lastChange('coldsnap/data/projects.js', 'tools/coldsnap-site/project.html');
const pair = (fr, en, lastmod, priority) => ['fr', 'en'].map(lang => `  <url>
    <loc>${SITE_URL}${lang === 'fr' ? fr : en}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${lang === 'fr' ? priority[0] : priority[1]}</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${fr}"/>
  </url>`).join('\n');
// Legal pages are noindex (reachable, kept out of search results), so not in the sitemap.
const LEGAL = [];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${BANNER} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[
  pair(LANGS.fr.home, LANGS.en.home, homeDate, ['1.0', '0.9']),
  pair(LANGS.fr.projects, LANGS.en.projects, projectsDate, ['0.8', '0.7']),
  ...SERVICES.map(sv => pair(sv.path.fr, sv.path.en, lastChange('tools/coldsnap-build.mjs'), ['0.8', '0.7'])),
  ...PROJECTS.map(p => pair(projectPath('fr', p.id), projectPath('en', p.id), projectsDate, ['0.7', '0.6'])),
  ...LEGAL.map(([path, priority]) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>2026-11-04</lastmod>
    <priority>${priority}</priority>
  </url>`),
].join('\n')}
</urlset>
`;
writeFileSync(join(site, 'sitemap.xml'), sitemap);
written.push(`sitemap.xml  ${(PROJECTS.length + SERVICES.length) * 2 + 4 + LEGAL.length} URLs`);

console.log(`coldsnap/  ${written.length} files\n  ${written.filter((_, i) => i < 4 || i >= written.length - 1).join('\n  ')}\n  …`);
if (missing.size) console.warn(`No French for: ${[...missing].join(', ')}`);
