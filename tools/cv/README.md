# CV build

`doc/cv_en.md` and `doc/cv_fr.md` are the **source of truth** for the CV.
`doc/cv_en.pdf` and `doc/cv_fr.pdf` are generated from them — never hand-edit the PDFs,
they get overwritten.

`index.html` picks the language at runtime from `navigator.language`, so both PDFs must
keep their current filenames.

## Updating the CV

Edit the markdown (on github.com is fine) and push to `master`. The
[Build CV PDFs](../../.github/workflows/build-cv.yml) workflow rebuilds both PDFs and
commits them back. Edit both languages when a change applies to both — nothing is
translated automatically.

Locally:

```bash
node tools/cv/build-cv.mjs        # both languages
node tools/cv/build-cv.mjs fr     # just one
```

No `npm install`. The script drives an installed Chrome or Edge in headless mode
(`CHROME_PATH=/path/to/chrome` to override detection) and embeds Comfortaa from the
repo's own `fonts/`, so local and CI output match.

**The PDFs are CI-owned.** A local build is for previewing; the bytes differ slightly
between browsers and platforms, so committing a locally-built PDF just makes CI rebuild
and commit its own. After previewing, throw the artifacts away:

```bash
git checkout -- doc/cv_en.pdf doc/cv_fr.pdf
```

## The 2-page guard

The build **fails** if a CV is not exactly 2 pages, so an edit that overflows is caught
instead of quietly publishing a 3-page CV. When that happens either trim the markdown,
or lower `LANGS.<lang>.scale` in `build-cv.mjs` — every type size derives from it, so
it is the one knob for making a language denser. French already sits lower than English
because French text runs ~15% longer.

To accept a different length: `CV_EXPECT_PAGES=3 node tools/cv/build-cv.mjs` (`0` skips
the check).

## Markdown conventions the parser relies on

Keep the existing shape; the parser is deliberately small.

| Markdown | Becomes |
| --- | --- |
| `# Name` | header name |
| `**Title**` (own line) | role under the name |
| `A · B · C` (own line) | sidebar contact list |
| `French/English (native)` inside that line | sidebar **Languages** block |
| `## <heading>` | a section — the heading text must match `LANGS.<lang>.headings` |
| `**Label:** a, b, c` under skills | a sidebar chip group |
| `### Role, Company` | job header; a trailing `(note)` on the company renders muted |
| `*Location · Dates*` under it | right-aligned job meta |
| plain line before the bullets | un-bulleted role summary |
| `- text` | bullet |
| `*(Flutter, Firebase)*` | tech tag, in brand orange |
| `**Name** (Flutter): ...` | tech tag too, for the projects section |

Two rules worth knowing:

- **Chips drop parenthetical detail**, since the sidebar column is narrow.
  `Firebase (Authentication, Firestore, …)` renders as `Firebase`. A short all-caps
  parenthetical wins instead: `retrieval-augmented generation (RAG)` renders as `RAG`.
  The full text stays in the markdown, which is what an ATS reads.
- **French spacing is automatic.** Write `Winston : conception` normally; the build
  converts the space before `: ; ! ?` and inside `50 000` to a no-break space.

## Design notes

- Sidebar fill and divider are painted as a **canvas-level gradient on `html`**, not as
  a background on the sidebar element. A background on an element that spans a page
  break only paints on the first fragment, which left page 2's sidebar half-filled.
- Both columns use `box-decoration-break: clone` so their top padding repeats on page 2
  and the two columns start at the same height.
- Sidebar sections use `break-inside: avoid` so a block never splits across pages —
  except Technical Skills, which flows, otherwise it strands a large gap at the foot of
  page 1.
- Comfortaa ships no italic. Accents use colour and weight instead of a synthesised
  oblique, which looks broken on a rounded face.
