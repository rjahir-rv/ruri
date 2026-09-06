/* Fullscreen hides the tab strip, so the lyrics tab can only be picked on the
   song page beforehand — enter fullscreen from Up Next and you get a bare
   cover. Selecting the tab for the user is what a karaoke button would do
   anyway, minus a control that fullscreen is meant not to have.

   synced-lyrics keys its renderer off the aria-selected of the second tab
   header (see its renderer/utils selectors.head), so a click on that header is
   all this needs — no private YTM API. */
import { waitForElement } from '@/utils/wait-for-element';

const LYRICS_TAB = '#tabsContent > .tab-header:nth-of-type(2)';
const STATE_HOSTS = 'ytmusic-app-layout, ytmusic-player-page, ytmusic-player';

/* YTM refuses the tab for tracks with no lyrics: stop after a few clicks
   instead of fighting it every time an attribute changes. */
const MAX_CLICKS = 3;
const RETRY_MS = 400;

let stateObserver: MutationObserver | null = null;
let tabObserver: MutationObserver | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;
let clicks = 0;
/* Bumped on every start/stop so a pending waitForElement from an older run
   cannot attach its observer after this one was torn down. */
let generation = 0;

const isFullscreen = () =>
  Array.from(document.querySelectorAll(STATE_HOSTS)).some(
    (el) => el.getAttribute('player-ui-state') === 'FULLSCREEN',
  );

function selectLyricsTab() {
  if (retry) {
    clearTimeout(retry);
    retry = null;
  }

  if (!isFullscreen()) {
    clicks = 0;
    return;
  }

  const header = document.querySelector<HTMLElement>(LYRICS_TAB);
  if (!header) return;

  if (header.getAttribute('aria-selected') === 'true') {
    clicks = 0;
    return;
  }

  if (clicks >= MAX_CLICKS) return;
  clicks += 1;
  header.click();

  /* The click lands on a hidden header, so nothing else will wake this up if
     YTM ignores it — re-check on a timer rather than waiting on a mutation. */
  retry = setTimeout(selectLyricsTab, RETRY_MS);
}

export function startFullscreenLyrics() {
  stopFullscreenLyrics();
  generation += 1;

  stateObserver = new MutationObserver(selectLyricsTab);
  stateObserver.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['player-ui-state'],
  });

  /* A new song can drop the selection back to Up Next while still fullscreen.
     The tab strip only exists once the player page has been opened. */
  const run = generation;
  waitForElement<HTMLElement>('#tabsContent').then((tabs) => {
    if (run !== generation) return;
    tabObserver = new MutationObserver(selectLyricsTab);
    tabObserver.observe(tabs, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected'],
    });
  });

  selectLyricsTab();
}

export function stopFullscreenLyrics() {
  generation += 1;
  if (retry) {
    clearTimeout(retry);
    retry = null;
  }
  stateObserver?.disconnect();
  stateObserver = null;
  tabObserver?.disconnect();
  tabObserver = null;
  clicks = 0;
}
