#!/usr/bin/env node
/**
 * Builds doc/cv_<lang>.pdf from doc/cv_<lang>.md
 *
 * The markdown files are the single source of truth. Edit those; the PDFs are
 * generated artifacts and should never be hand-edited.
 *
 * Zero npm dependencies on purpose: this drives a locally installed Chrome or
 * Edge in headless mode. The GitHub Actions runner already ships Chrome, so CI
 * needs no install step. The Comfortaa font is embedded from the repo's own
 * fonts/ directory, so local and CI builds render identically.
 *
 *   node tools/cv/build-cv.mjs            # build every language
 *   node tools/cv/build-cv.mjs en         # build one language
 *
 * Override browser detection with CHROME_PATH=/path/to/chrome
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')
const DOC = join(REPO, 'doc')
const BUILD = join(HERE, '.build')

/* ------------------------------------------------------------------ config */

// Per-language wording so the parser can tell which "##" section is which,
// plus a type scale. French runs ~15% longer than English, so it gets a
// slightly tighter scale to hold the same two pages.
const LANGS = {
  en: {
    scale: 1.0,
    headings: {
      profile: 'profile',
      skills: 'technical skills',
      experience: 'work experience',
      projects: 'selected freelance work & open source',
      education: 'education',
      certificates: 'certificates',
    },
    sidebar: { contact: 'Contact', languages: 'Languages' },
  },
  fr: {
    scale: 0.95,
    headings: {
      profile: 'profil',
      skills: 'compétences techniques',
      experience: 'expérience professionnelle',
      projects: 'projets freelance & open source',
      education: 'formation',
      certificates: 'certifications',
    },
    sidebar: { contact: 'Contact', languages: 'Langues' },
  },
}

// Brand palette, matched to the site (css/creative.css .navbar-brand).
const BRAND = '#F05F40'
const BRAND_TEXT = '#C4451F' // darkened for small text, which needs more contrast

/* ------------------------------------------------------------- md utilities */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * French typography: no-break spaces before high punctuation and inside number
 * groups. Uses U+00A0 rather than the finer U+202F: Comfortaa has no glyph for
 * U+202F and silently drops it, swallowing the space entirely.
 */
const NBSP = String.fromCharCode(0xa0)
const frenchSpacing = (s) =>
  s
    .replace(/ ([:;!?»])/g, NBSP + '$1')
    .replace(/(«) /g, '$1' + NBSP)
    .replace(/(\d) (\d{3})(?!\d)/g, '$1' + NBSP + '$2')

/** Inline markdown -> html. Handles **bold**, *italic*, and *(tech tags)*. */
function inline(raw, lang) {
  let s = escapeHtml(raw)
  if (lang === 'fr') s = frenchSpacing(s)
  s = s
    // *(Flutter, Firebase)* -> tech tag
    .replace(/\*\(([^)]*)\)\*/g, '<span class="tech">($1)</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // "**Spinlab** (Flutter, Firebase): ..." -> style the bare parenthetical too
  s = s.replace(/(<\/b>)\s*\(([^)]*)\)/g, '$1 <span class="tech">($2)</span>')
  return s
}

/** Split on commas that are not inside parentheses. */
function splitTopLevel(s) {
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(buf)
      buf = ''
      continue
    }
    buf += ch
  }
  out.push(buf)
  return out.map((x) => x.trim()).filter(Boolean)
}

/**
 * Chip label for the sidebar. Parenthetical detail is ATS-only elaboration and
 * is dropped, EXCEPT when it is a short acronym, which is what we want to show.
 *   "Firebase (Authentication, Firestore, ...)"      -> "Firebase"
 *   "retrieval-augmented generation (RAG)"           -> "RAG"
 */
function chipLabel(item) {
  const m = item.match(/^(.*?)\s*\(([^)]*)\)\s*$/)
  if (!m) return item
  const inner = m[2].trim()
  if (/^[A-Za-z0-9+#./-]{2,6}$/.test(inner) && inner === inner.toUpperCase()) return inner
  return m[1].trim() || item
}

const blocksOf = (lines) => {
  const blocks = []
  let cur = []
  for (const l of lines) {
    if (!l.trim()) {
      if (cur.length) blocks.push(cur)
      cur = []
    } else if (l.trim() !== '---') cur.push(l.trim())
  }
  if (cur.length) blocks.push(cur)
  return blocks
}

/* -------------------------------------------------------------- the parser */

function parseCv(md, cfg) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')

  // Split the document on "## " headings.
  const sections = []
  let cur = { key: '__header__', lines: [] }
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) {
      sections.push(cur)
      const title = h2[1].trim().toLowerCase()
      const key =
        Object.entries(cfg.headings).find(([, v]) => v === title)?.[0] ?? title
      cur = { key, title: h2[1].trim(), lines: [] }
      continue
    }
    cur.lines.push(line)
  }
  sections.push(cur)
  const get = (k) => sections.find((s) => s.key === k)?.lines ?? []

  const doc = {
    name: '',
    title: '',
    contact: [],
    languages: [],
    profile: '',
    skills: [],
    jobs: [],
    projectGroups: [],
    projectNote: '',
    education: [],
    certificates: [],
  }

  /* header: name, title, contact line */
  for (const raw of get('__header__')) {
    const t = raw.trim()
    if (!t || t === '---') continue
    if (t.startsWith('# ')) {
      doc.name = t.slice(2).trim()
    } else if (/^\*\*.+\*\*$/.test(t) && !doc.title) {
      doc.title = t.replace(/\*\*/g, '').trim()
    } else if (!doc.contact.length) {
      for (const part of t.split('·').map((x) => x.trim()).filter(Boolean)) {
        // "French/English (native)" becomes the Languages block
        const m = part.match(/^([^()]+)\((.+)\)$/)
        if (m && m[1].includes('/')) {
          const level = m[2].trim().replace(/^./, (c) => c.toUpperCase())
          for (const n of m[1].split('/').map((x) => x.trim()).filter(Boolean))
            doc.languages.push({ name: n, level })
        } else {
          doc.contact.push(part)
        }
      }
    }
  }

  doc.profile = get('profile')
    .map((l) => l.trim())
    .filter((l) => l && l !== '---')
    .join(' ')

  /* skills: "**Label:** a, b, c" -> chips */
  for (const raw of get('skills')) {
    const m = raw.trim().match(/^\*\*(.+?)\s*:?\s*\*\*\s*:?\s*(.+)$/)
    if (!m) continue
    doc.skills.push({
      label: m[1].replace(/\s*:$/, '').trim(),
      chips: splitTopLevel(m[2]).map(chipLabel),
    })
  }

  /* experience */
  let job = null
  for (const raw of get('experience')) {
    const t = raw.trim()
    const h3 = t.match(/^###\s+(.+)$/)
    if (h3) {
      if (job) doc.jobs.push(job)
      const head = h3[1].trim()
      const i = head.lastIndexOf(', ')
      const company = i > 0 ? head.slice(i + 2) : ''
      const cm = company.match(/^(.*?)\s*\(([^)]*)\)$/)
      job = {
        role: i > 0 ? head.slice(0, i) : head,
        company: cm ? cm[1].trim() : company,
        companyNote: cm ? cm[2].trim() : '',
        meta: '',
        intro: [],
        bullets: [],
      }
      continue
    }
    if (!job || !t || t === '---') continue
    if (/^\*[^*].*[^*]\*$/.test(t) && !job.meta && !job.bullets.length && !job.intro.length) {
      job.meta = t.slice(1, -1).trim()
    } else if (t.startsWith('- ')) {
      job.bullets.push(t.slice(2).trim())
    } else if (job.bullets.length) {
      job.bullets[job.bullets.length - 1] += ' ' + t
    } else {
      job.intro.push(t)
    }
  }
  if (job) doc.jobs.push(job)

  /* projects */
  let group = null
  for (const raw of get('projects')) {
    const t = raw.trim()
    if (!t || t === '---') continue
    if (/^\*\*[^*]+\*\*$/.test(t)) {
      if (group) doc.projectGroups.push(group)
      group = { label: t.replace(/\*\*/g, '').trim(), items: [] }
    } else if (t.startsWith('- ')) {
      group?.items.push(t.slice(2).trim())
    } else if (/^\*[^*].*[^*]\*$/.test(t)) {
      doc.projectNote = t.slice(1, -1).trim()
    }
  }
  if (group) doc.projectGroups.push(group)

  /* education */
  for (const b of blocksOf(get('education'))) {
    const first = b[0]
    const bolds = [...first.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1])
    const school = first
      .replace(/\*\*(.+?)\*\*/g, '')
      .replace(/\s*,\s*,\s*/g, ', ')
      .replace(/^[\s,]+|[\s,]+$/g, '')
    doc.education.push({
      degree: bolds[0] ?? first,
      school,
      honours: bolds[1] ?? '',
      detail: b.slice(1).join(' '),
    })
  }

  /* certificates: "- C++ Programming, EPFL" */
  for (const raw of get('certificates')) {
    const t = raw.trim()
    if (!t.startsWith('- ')) continue
    const v = t.slice(2).trim()
    const i = v.lastIndexOf(', ')
    doc.certificates.push({
      name: i > 0 ? v.slice(0, i) : v,
      issuer: i > 0 ? v.slice(i + 2) : '',
    })
  }

  return doc
}

/* ------------------------------------------------------------- the renderer */

/**
 * Embeds only the three static weights the sheet uses. The variable font also
 * works, but Chrome cannot subset a variable face, so it embeds the whole thing
 * and the PDF balloons to ~530KB; static faces subset down to well under 100KB.
 */
function fontFace() {
  const weights = [
    [400, 'Comfortaa-Regular.ttf'],
    [600, 'Comfortaa-SemiBold.ttf'],
    [700, 'Comfortaa-Bold.ttf'],
  ]
  return weights
    .map(([weight, file]) => {
      const b64 = readFileSync(join(REPO, 'fonts', file)).toString('base64')
      return `@font-face{font-family:'Comfortaa';src:url(data:font/ttf;base64,${b64}) format('truetype');font-weight:${weight};font-style:normal;font-display:block}`
    })
    .join('')
}

function css(scale) {
  // Every type size flows from `scale`, so tuning the whole sheet is one number.
  const pt = (n) => `${(n * scale).toFixed(2)}pt`
  return `
${fontFace()}
@page { size: A4; margin: 0; }
*, *::before, *::after { box-sizing: border-box; }

/* The sidebar band is painted at the canvas level so it repeats on EVERY page,
   full bleed. Backgrounds on a fragmented element are unreliable when printing. */
html {
  background-color: #fff;
  background-image: linear-gradient(to right,
    #f4f6f7 0mm, #f4f6f7 62mm,
    #e2e6e9 62mm, #e2e6e9 62.3mm,
    #fff 62.3mm, #fff 100%);
}
html, body {
  margin: 0; padding: 0;
  font-family: 'Comfortaa', 'Segoe UI', Arial, sans-serif;
  color: #24272b;
  font-size: ${pt(8.5)};
  line-height: 1.44;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
:root {
  --ink: #1f2226;
  --sub: #58626d;
  --brand: ${BRAND};
  --brandText: ${BRAND_TEXT};
  --rule: #dce1e5;
}

.page { width: 210mm; min-height: 297mm; display: grid; grid-template-columns: 62mm 1fr; }
/* clone repeats the padding on page 2 so both columns start at the same offset */
.sidebar { padding: 12mm 7mm 10mm 10mm; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.main    { padding: 12mm 11mm 10mm 9mm;  box-decoration-break: clone; -webkit-box-decoration-break: clone; }

h1.name { font-size: ${pt(17)}; font-weight: 700; color: var(--ink); margin: 0 0 1mm; letter-spacing: -0.2px; }
.title   { font-size: ${pt(9.6)}; color: var(--brandText); font-weight: 600; margin: 0 0 7mm; }

/* Keep a sidebar block whole rather than splitting it across the page break. */
.sb-section { margin-bottom: 6.5mm; break-inside: avoid; }
/* Skills always opens page 2: it is too long to sit whole under Education on
   page 1, and splitting it mid-section read as an accident. The forced break
   applies to the sidebar column only — the main column keeps flowing. It stays
   break-inside: auto as a safety valve, so growth spills to a third page (which
   the page-count guard then catches) rather than overflowing the sheet. */
.sb-section--flow { break-inside: auto; }
.sb-section--skills { break-before: page; }
.edu-item, .cert-item, .skill-group { break-inside: avoid; }
.sb-h { break-after: avoid; }
.sb-h {
  font-size: ${pt(7.6)}; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--brandText);
  margin: 0 0 2.2mm; padding-bottom: 1mm; border-bottom: 1px solid var(--rule);
}

.contact-list { list-style: none; margin: 0; padding: 0; }
.contact-list li { font-size: ${pt(7.8)}; color: var(--sub); margin-bottom: 1.5mm; word-break: break-word; }

.lang-row { display: flex; justify-content: space-between; gap: 2mm; font-size: ${pt(7.8)}; color: var(--sub); margin-bottom: 1mm; }
.lang-row b { color: var(--ink); font-weight: 600; }

.skill-group { margin-bottom: 2.8mm; }
.skill-group .lbl { font-size: ${pt(7.6)}; font-weight: 700; color: var(--ink); margin-bottom: 1mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1.1mm; }
.chip {
  background: #fff; border: 1px solid var(--rule); color: var(--sub);
  border-radius: 3px; padding: 0.5mm 1.5mm; font-size: ${pt(6.9)}; line-height: 1.5;
}

.edu-item, .cert-item { margin-bottom: 2.8mm; }
.edu-item:last-child, .cert-item:last-child { margin-bottom: 0; }
.edu-degree { font-size: ${pt(7.9)}; font-weight: 700; color: var(--ink); }
.edu-school { font-size: ${pt(7.6)}; color: var(--sub); }
.edu-note   { font-size: ${pt(7.2)}; color: var(--sub); margin-top: 0.4mm; }
.cert-item  { font-size: ${pt(7.8)}; color: var(--sub); }
.cert-item b { color: var(--ink); }

.m-section { margin-bottom: 4.8mm; }
.m-h {
  font-size: ${pt(9.8)}; font-weight: 700; color: var(--ink);
  margin: 0 0 2.4mm; padding-bottom: 1mm; border-bottom: 1.4px solid var(--brand);
}
.profile-text { color: #3a4148; font-size: ${pt(8.5)}; text-align: justify; }

.job { margin-bottom: 4.4mm; break-inside: avoid-page; }
.job:last-child { margin-bottom: 0; }
.job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; margin-bottom: 0.6mm; }
.job-role { font-size: ${pt(9.0)}; font-weight: 700; color: var(--ink); }
.job-co   { font-weight: 600; color: var(--brandText); }
.job-note { font-weight: 400; color: var(--sub); font-size: ${pt(7.4)}; }
.job-meta { font-size: ${pt(7.6)}; color: var(--sub); white-space: nowrap; }

/* role summary: sits outside the bullet list, as a subtitle to the whole job */
.job-intro { color: #3a4148; margin: 1.2mm 0 0; }

ul.bullets { margin: 1.2mm 0 0; padding-left: 3.6mm; }
ul.bullets li { margin-bottom: 1.5mm; color: #3a4148; }
ul.bullets li:last-child { margin-bottom: 0; }
ul.bullets li b { color: var(--ink); font-weight: 700; }

/* Comfortaa ships no italic, so accents use colour and weight instead of a
   synthesised oblique, which looks broken on a rounded face. */
.tech { color: var(--brandText); font-size: ${pt(7.6)}; }
em { font-style: normal; color: var(--sub); }

.proj-group-lbl {
  font-size: ${pt(7.7)}; font-weight: 700; color: var(--sub);
  text-transform: uppercase; letter-spacing: 0.4px; margin: 2.4mm 0 1.2mm;
}
.os-note { font-size: ${pt(7.8)}; color: var(--sub); margin-top: 2.4mm; }
`
}

function render(doc, lang, cfg) {
  const t = (s) => (lang === 'fr' ? frenchSpacing(escapeHtml(s)) : escapeHtml(s))
  const md = (s) => inline(s, lang)

  const sidebar = `
    <div class="sb-section">
      <div class="sb-h">${t(cfg.sidebar.contact)}</div>
      <ul class="contact-list">${doc.contact.map((c) => `<li>${t(c)}</li>`).join('')}</ul>
    </div>
    ${
      doc.languages.length
        ? `<div class="sb-section">
      <div class="sb-h">${t(cfg.sidebar.languages)}</div>
      ${doc.languages
        .map((l) => `<div class="lang-row"><span>${t(l.name)}</span><b>${t(l.level)}</b></div>`)
        .join('')}
    </div>`
        : ''
    }
    <div class="sb-section">
      <div class="sb-h">${t(sectionTitle(doc, 'education', cfg))}</div>
      ${doc.education
        .map(
          (e) => `<div class="edu-item">
        <div class="edu-degree">${md(e.degree)}</div>
        <div class="edu-school">${md(e.school)}</div>
        ${e.honours ? `<div class="edu-note">${md(e.honours)}</div>` : ''}
        ${e.detail ? `<div class="edu-note">${md(e.detail)}</div>` : ''}
      </div>`
        )
        .join('')}
    </div>
    <div class="sb-section sb-section--flow sb-section--skills">
      <div class="sb-h">${t(sectionTitle(doc, 'skills', cfg))}</div>
      ${doc.skills
        .map(
          (s) => `<div class="skill-group">
        <div class="lbl">${t(s.label)}</div>
        <div class="chips">${s.chips.map((c) => `<span class="chip">${t(c)}</span>`).join('')}</div>
      </div>`
        )
        .join('')}
    </div>
    ${
      doc.certificates.length
        ? `<div class="sb-section">
      <div class="sb-h">${t(sectionTitle(doc, 'certificates', cfg))}</div>
      ${doc.certificates
        .map(
          (c) =>
            `<div class="cert-item"><b>${t(c.name)}</b>${c.issuer ? ` — ${t(c.issuer)}` : ''}</div>`
        )
        .join('')}
    </div>`
        : ''
    }`

  const jobs = doc.jobs
    .map(
      (j) => `<div class="job">
      <div class="job-head">
        <span class="job-role">${t(j.role)}${
        j.company ? ` <span class="job-co">— ${t(j.company)}</span>` : ''
      }${j.companyNote ? ` <span class="job-note">(${t(j.companyNote)})</span>` : ''}</span>
        ${j.meta ? `<span class="job-meta">${t(j.meta)}</span>` : ''}
      </div>
      ${j.intro.map((p) => `<p class="job-intro">${md(p)}</p>`).join('')}
      ${
        j.bullets.length
          ? `<ul class="bullets">${j.bullets.map((b) => `<li>${md(b)}</li>`).join('')}</ul>`
          : ''
      }
    </div>`
    )
    .join('')

  const projects = doc.projectGroups
    .map(
      (g) => `<div class="proj-group-lbl">${t(g.label)}</div>
      <ul class="bullets">${g.items.map((i) => `<li>${md(i)}</li>`).join('')}</ul>`
    )
    .join('')

  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><title>${t(doc.name)} — CV</title><style>${css(cfg.scale)}</style></head>
<body>
<div class="page">
  <div class="sidebar">${sidebar}</div>
  <div class="main">
    <h1 class="name">${t(doc.name)}</h1>
    <div class="title">${t(doc.title)}</div>

    <div class="m-section">
      <div class="m-h">${t(sectionTitle(doc, 'profile', cfg))}</div>
      <p class="profile-text">${md(doc.profile)}</p>
    </div>

    <div class="m-section">
      <div class="m-h">${t(sectionTitle(doc, 'experience', cfg))}</div>
      ${jobs}
    </div>

    <div class="m-section">
      <div class="m-h">${t(sectionTitle(doc, 'projects', cfg))}</div>
      ${projects}
      ${doc.projectNote ? `<div class="os-note">${md(doc.projectNote)}</div>` : ''}
    </div>
  </div>
</div>
</body>
</html>`
}

// Section headings are shown exactly as written in the markdown.
function sectionTitle(doc, key, cfg) {
  return doc.sectionTitles?.[key] ?? titleCase(cfg.headings[key])
}
const titleCase = (s) =>
  s.replace(/\b([a-zà-ÿ])/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, 'and')

/* ------------------------------------------------------------------ browser */

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    ...(process.platform === 'win32'
      ? [
          'C:/Program Files/Google/Chrome/Application/chrome.exe',
          'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
          'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
          'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        ]
      : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          '/usr/bin/microsoft-edge',
        ]),
  ].filter(Boolean)

  const found = candidates.find((p) => existsSync(p))
  if (!found) {
    throw new Error(
      'No Chrome/Chromium/Edge found. Install one, or set CHROME_PATH.\nTried:\n  ' +
        candidates.join('\n  ')
    )
  }
  return found
}

function printPdf(browser, htmlPath, pdfPath) {
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'pipe' }
  )
}

/** Page count straight out of the PDF, so the build can assert on it. */
function pageCount(pdfPath) {
  const buf = readFileSync(pdfPath).toString('latin1')
  const counts = [...buf.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]))
  return counts.length ? Math.max(...counts) : 0
}

/* --------------------------------------------------------------------- main */

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const targets = only.length ? only : Object.keys(LANGS)

// A CV that silently grows to 3 pages is a bug, so the build fails on it rather
// than publishing it. Override with CV_EXPECT_PAGES, or 0 to skip the check.
const EXPECT = Number(process.env.CV_EXPECT_PAGES ?? 2)

mkdirSync(BUILD, { recursive: true })
const browser = findBrowser()
console.log(`browser: ${browser}`)

let failed = false
for (const lang of targets) {
  const cfg = LANGS[lang]
  if (!cfg) throw new Error(`Unknown language "${lang}". Known: ${Object.keys(LANGS).join(', ')}`)

  const mdPath = join(DOC, `cv_${lang}.md`)
  if (!existsSync(mdPath)) throw new Error(`Missing ${mdPath}`)

  const doc = parseCv(readFileSync(mdPath, 'utf8'), cfg)
  // Show headings exactly as the markdown spells them.
  doc.sectionTitles = {}
  for (const [key, needle] of Object.entries(cfg.headings)) {
    const re = new RegExp(`^##\\s+(${needle.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&')})\\s*$`, 'im')
    const m = readFileSync(mdPath, 'utf8').match(re)
    if (m) doc.sectionTitles[key] = m[1].trim()
  }

  const htmlPath = join(BUILD, `cv_${lang}.html`)
  const pdfPath = join(DOC, `cv_${lang}.pdf`)
  writeFileSync(htmlPath, render(doc, lang, cfg), 'utf8')
  printPdf(browser, htmlPath, pdfPath)

  const pages = pageCount(pdfPath)
  const ok = EXPECT === 0 || pages === EXPECT
  if (!ok) failed = true
  console.log(
    `${ok ? '✓' : '✗'} doc/cv_${lang}.pdf — ${pages} page${pages === 1 ? '' : 's'}` +
      (ok ? '' : `  <- expected ${EXPECT}; tune LANGS.${lang}.scale in tools/cv/build-cv.mjs`)
  )
}

if (failed) {
  console.error(
    `\nA CV is not ${EXPECT} pages. Either tune the scale for that language, or run with` +
      `\n  CV_EXPECT_PAGES=3   (or 0 to skip the check entirely)`
  )
  process.exit(1)
}
