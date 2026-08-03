# /board

Personal dashboard at `https://nathandecastro.com/board/` — unlisted, instant-loading,
synced across devices with a 6-digit PIN.

Setup is **done**: the database URL is already in [`index.html`](index.html) and the rules
are deployed. Just deploy the site and pick a PIN.

## First run

1. Run the **Manual Deploy to GitHub Pages** workflow.
2. Open `https://nathandecastro.com/board/` → **Enter PIN**.
3. Type a 6-digit PIN. It won't match anything yet, so it offers **Create a new board** —
   confirm the PIN once and you're set.
4. On every other device: same PIN, and the board appears. Entered once per device, then
   remembered forever.

A wrong PIN is refused outright — it can't quietly start a second board.

## How the PIN works

It's stretched with PBKDF2 (600,000 rounds, SHA-256) into two independent values:

- a **path** — where your record lives in the database
- an **AES-256-GCM key** — what the board is encrypted with, in the browser, before it leaves

The server only ever holds an opaque blob at an unguessable location. Verified: the stored
record contains `ct`, `iv`, and `updatedAt` and nothing else — no todo text appears in it.
The PIN itself is never transmitted or stored; only the derived values are cached locally,
so unlocking happens once per device and later loads skip it entirely.

**On 6 digits being enough:** a million combinations isn't much on its own, but there's no
offline attack to grind here. The ciphertext can't be fetched without knowing the path, and
the path comes from the PIN — so every guess costs a network round trip to Firebase, which
rate-limits. Combined with the page being unlisted, that's a sensible place to land for a
personal todo list. If you ever want it stronger, use more digits; nothing else changes.

**There is no reset.** The PIN *is* the key, so nothing can recover the synced copy without
it. Your local copy and Export JSON are unaffected either way.

## The deployed rules

```json
{
  "rules": {
    "boards": {
      "$id": {
        ".read": true,
        ".write": "newData.hasChildren(['ct','iv','updatedAt'])"
      }
    }
  }
}
```

Looks wide open, isn't: permissions sit on `boards/$id`, **not** on `boards`. Verified
against the live database — reading a record by exact id works, and listing `boards` returns
`401 Permission denied`, so ids can't be discovered. The write rule also rejects anything
that isn't a properly shaped encrypted record.

One side effect: deletes are refused too (a delete has no `newData`, so it fails the shape
check). The board never deletes, so this doesn't matter — but it does mean the throwaway
record at `boards/zzz_claude_setup_check`, left by a rules test, can only be removed from the
Firebase console. It's a few bytes of dummy text; delete it or ignore it.

## On someone else's computer

Enter your PIN, use it, then ⚙ → **Forget this device** before you leave. That erases the
board and the derived key from that browser. Your synced copy is untouched.

## Where your data lives

| Layer | What it protects against |
| --- | --- |
| `localStorage` | Everything offline; the board works fully with sync broken |
| Realtime Database (encrypted) | Device loss, cache clears; syncs across devices |
| 10 rolling local snapshots (⚙ → Restore) | Accidental bulk edits |
| Export / Import JSON | Anything else — a plaintext copy you control |

If a sync hasn't succeeded in 24 hours the board shows a banner rather than failing quietly.

There's no versioned history — if you ever want that back, a write-only mirror to a GitHub
gist is a small amount of code, and gists keep every revision forever.

## Performance notes

The page is one self-contained file: inline CSS and JS, and Comfortaa subsetted to Latin-1
with the weight axis pinned to 400–700, inlined as base64 woff2 (204 KB TTF → 20 KB). That
makes the whole page a single request with no flash of fallback text, and
[`sw.js`](sw.js) caches it so repeat loads make **zero** network requests.

Rendering reads `localStorage` synchronously before paint, so the board is on screen with
real data before any crypto or network work starts.

To regenerate the font subset, see the comment above the `@font-face` rule in `index.html`.
