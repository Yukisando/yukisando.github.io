# Board New Tab

Opens `https://nathandecastro.com/board/` on every new tab **without** taking keyboard
focus out of the address bar, so `Ctrl+T` → type a URL → `Enter` still works.

## Why an extension instead of a setting

A web page cannot focus the browser's address bar — that is browser UI, not page DOM.
And an extension that declares `chrome_url_overrides.newtab` makes Chrome focus the page
document rather than the omnibox, which is the behaviour this replaces.

This extension overrides nothing. Chrome opens its own new tab (address bar focused, as
always), and `chrome.tabs.onCreated` immediately navigates that tab to the board. Focus
was never moved, so it is still in the address bar when the board finishes loading.

## Install

1. Remove or disable any other extension that overrides the new tab page — two of them
   will fight over the same tab.
2. Go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this folder.

Edge is the same flow at `edge://extensions`.

## Changing the URL

Edit `BOARD` at the top of `background.js`, then hit **Reload** on the extension card.
Use `http://localhost:<port>/board/` to point it at a local copy.

## Trade-offs

- The board loads a beat later than an overridden new tab page would, because Chrome
  paints its own new tab first. Typing is unaffected — the omnibox is live immediately.
- The new tab keeps one back-history entry (Chrome's new tab page) behind the board.
- Tabs opened by other means (links, restored sessions) are untouched; only tabs that
  start out as the new tab page get redirected.
