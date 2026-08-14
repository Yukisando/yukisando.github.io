/* Chrome's new tab page keeps the caret in the address bar, but only as long as the
   new tab page is Chrome's own. An extension that declares chrome_url_overrides.newtab
   hands focus to the page document instead, and no page-side JS can give it back.

   So this does not override anything: it lets Chrome open its real new tab, then
   navigates that tab to the board. The address bar never lost focus, so typing a URL
   right after Ctrl+T works exactly like it does on a stock new tab. */

var BOARD = 'https://nathandecastro.com/board/';

/* pendingUrl is the tab's target before it has committed; url is what a settled tab
   reports. A fresh tab shows up as one of these depending on Chrome version/channel. */
var NEW_TAB_URLS = [
  'chrome://newtab/',
  'chrome://new-tab-page/',
  'chrome://new-tab-page-third-party/',
  'edge://newtab/',
  'about:newtab'
];

chrome.tabs.onCreated.addListener(function (tab) {
  var url = tab.pendingUrl || tab.url || '';
  if (NEW_TAB_URLS.indexOf(url) === -1) return;
  chrome.tabs.update(tab.id, { url: BOARD });
});
