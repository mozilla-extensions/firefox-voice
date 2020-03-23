/* globals log, buildSettings, catcher */

import * as intentRunner from "../../background/intentRunner.js";
import * as searching from "../../searching.js";
import * as content from "../../background/content.js";
import * as telemetry from "../../background/telemetry.js";
import * as browserUtil from "../../browserUtil.js";

// Close the search tab after this amount of time:
const CLOSE_TIME = 1000 * 60 * 60; // 1 hour
// Hide the search tab after this amount of unfocused time:
const HIDE_TIME = 1000 * 60; // 1 minute
// Check this often for a new image in a search tab:
const CARD_POLL_INTERVAL = 200; // milliseconds
// If we don't believe the card is animated, still get new images for this amount of time:
const CARD_POLL_LIMIT = 1000; // milliseconds
let closeTabTimeout = null;
let lastImage = null;
let _searchTabId;
const START_URL = "https://www.google.com/?voice";
// This is a popup search result that isn't associated with a tab (because it had a card):
let popupSearchInfo;
// This is the most recent tab that was interacted with (e.g., I search in tab A, search in tab B, switch to tab A, get next result, switch to tab C, then say next result; tab A should get updated):
let lastTabId;
// These store per-tab search results; tabDataMap handles cleaning up results when a tab is closed:
const tabSearchResults = new browserUtil.TabDataMap(5 * 60 * 1000); // only delete after 5 minutes
let googleIsDefaultProvider;

async function openSearchTab() {
  if (closeTabTimeout) {
    clearTimeout(closeTabTimeout);
    closeTabTimeout = null;
  }
  closeTabTimeout = setTimeout(() => {
    closeSearchTab();
  }, CLOSE_TIME);
  if (_searchTabId) {
    try {
      await browser.tabs.get(_searchTabId);
      return _searchTabId;
    } catch (e) {
      // Presumably the tab doesn't exist
      log.info("Error getting tab:", String(e));
      _searchTabId = null;
    }
  }
  for (const tab of await browser.tabs.query({
    url: ["https://www.google.com/*"],
  })) {
    if (tab.url.includes("&voice") || tab.url.includes("?voice")) {
      await browser.tabs.remove(tab.id);
    }
  }
  const tab = await browser.tabs.create({
    url: START_URL,
    active: false,
  });
  if (!buildSettings.android) {
    await browser.tabs.hide(tab.id);
  }
  // eslint-disable-next-line require-atomic-updates
  _searchTabId = tab.id;
  return _searchTabId;
}

async function closeSearchTab() {
  if (!_searchTabId) {
    return;
  }
  const tabId = _searchTabId;
  await browser.tabs.remove(tabId);
  browser.tabs.onActivated.removeListener(_tabHideListener);
  // Technically there is a race condition here, but without some lock this is just going to be racy,
  // so this race is better than the other one
  // eslint-disable-next-line require-atomic-updates
  _searchTabId = null;
}

async function focusSearchTab() {
  await browser.tabs.show(_searchTabId);
  await browserUtil.makeTabActive(_searchTabId);
  trackTabHide();
}

let _tabHideTimeout = null;
function _tabHideListener({ previousTabId, tabId }) {
  if (tabId === _searchTabId) {
    // The search tab was re-focused
    clearTimeout(_tabHideTimeout);
    return;
  }
  _tabHideTimeout = setTimeout(async () => {
    browser.tabs.onActivated.removeListener(_tabHideListener);
    await browser.tabs.hide(_searchTabId);
  }, HIDE_TIME);
}

function trackTabHide() {
  browser.tabs.onActivated.removeListener(_tabHideListener);
  browser.tabs.onActivated.addListener(_tabHideListener);
}

async function performSearch(query) {
  const tabId = await openSearchTab();
  // Slicing query string to follow google query standard
  // For more information, https://support.google.com/gsa/answer/4411411#requests
  query = query.slice(0, 128);
  const url = searching.googleSearchUrl(query) + "&voice";
  await browserUtil.loadUrl(tabId, url);
  if (buildSettings.android) {
    await browserUtil.makeTabActive(tabId);
  }
  await content.lazyInject(tabId, "/intents/search/queryScript.js");
}

/** Returns the popupSearchInfo if it's available, otherwise the active tab's searchInfo,
 * otherwise the results for lastTabId, and otherwise null
 */
async function getSearchInfo() {
  if (popupSearchInfo) {
    return { tabId: null, searchInfo: popupSearchInfo };
  }
  const activeTab = await browserUtil.activeTab();
  const searchInfo = tabSearchResults.get(activeTab.id);
  if (searchInfo) {
    return { tabId: activeTab.id, searchInfo };
  }
  if (lastTabId) {
    return { tabId: lastTabId, searchInfo: tabSearchResults.get(lastTabId) };
  }
  return { tabId: null, searchInfo: null };
}

async function callScript(message) {
  if (!_searchTabId) {
    throw new Error(
      `Attempt to send message ${message.type} to missing search tab`
    );
  }
  try {
    const result = await browser.tabs.sendMessage(_searchTabId, message);
    return result;
  } catch (e) {
    e.searchTabId = _searchTabId;
    e.sendMessageBody = message;
    throw e;
  }
}

let cardPollTimeout;

function stopCardPoll() {
  if (cardPollTimeout) {
    clearTimeout(cardPollTimeout);
    cardPollTimeout = null;
    lastImage = null;
  }
}

function pollForCard(maxTime) {
  stopCardPoll();
  const startTime = Date.now();
  cardPollTimeout = setInterval(async () => {
    if (!_searchTabId) {
      // Search tab must be gone
      stopCardPoll();
      return;
    }
    let card;
    try {
      card = await callScript({ type: "cardImage" });
    } catch (e) {
      if (e.message && e.message.match(/Invalid Tab ID/i)) {
        stopCardPoll();
        return;
      }
      throw e;
    }
    if (!card) {
      catcher.capture(new Error(`callScript cardImage returned ${card}`));
      return;
    }
    if (card.src === lastImage) {
      return;
    }
    lastImage = card.src;
    const response = await browser.runtime.sendMessage({
      type: "refreshSearchCard",
      card,
    });
    if (!response || (maxTime && Date.now() - startTime > maxTime)) {
      // There's no listener
      stopCardPoll();
    }
  }, CARD_POLL_INTERVAL);
}

async function moveResult(context, step) {
  stopCardPoll();
  const { tabId, searchInfo } = await getSearchInfo();

  if (!searchInfo) {
    const e = new Error("No search made");
    e.displayMessage = "You haven't made a search";
    throw e;
  }

  // We are on an initial search results page and trying to navigate to a
  // non-existent previous result
  if (searchInfo.index === undefined && step < 0) {
    const e = new Error("No previous search result");
    e.displayMessage = "No previous search result";
    throw e;
  }

  if (
    (searchInfo.index >= searchInfo.searchResults.length - 1 && step > 0) ||
    (searchInfo.index <= 0 && step < 0)
  ) {
    const tabId = await openSearchTab();
    await browserUtil.loadUrl(tabId, searchInfo.searchUrl);

    // reset the index to an initial search result
    searchInfo.index = undefined;
    tabSearchResults.set(tabId, searchInfo);
    return;
  }

  // Initial search results do not have an index property and at this point
  // we wish to start navigating
  searchInfo.index =
    searchInfo.index === undefined ? 0 : searchInfo.index + step;

  const item = searchInfo.searchResults[searchInfo.index];
  await browser.runtime.sendMessage({
    type: "showSearchResults",
    searchResults: searchInfo.searchResults,
    searchUrl: searchInfo.searchUrl,
    index: searchInfo.index,
  });
  if (!tabId) {
    const tab = await context.createTab({ url: item.url });
    // eslint-disable-next-line require-atomic-updates
    lastTabId = tab.id;
    popupSearchInfo = null;
    tabSearchResults.set(tab.id, searchInfo);
  } else {
    // eslint-disable-next-line require-atomic-updates
    lastTabId = tabId;
    let exists = true;
    try {
      await context.makeTabActive(tabId);
    } catch (e) {
      if (String(e).includes("Invalid tab ID")) {
        exists = false;
      } else {
        throw e;
      }
    }
    if (exists) {
      await browser.tabs.update(tabId, { url: item.url });
    } else {
      const newTabId = await browser.tabs.create({ url: item.url });
      // eslint-disable-next-line require-atomic-updates
      lastTabId = newTabId;
      tabSearchResults.set(newTabId, searchInfo);
      tabSearchResults.delete(tabId);
    }
  }
}

export async function focusSearchResults(message) {
  const { searchUrl } = message;
  const searchTabId = await openSearchTab();
  const tab = await browser.tabs.get(searchTabId);
  if (tab.url !== searchUrl) {
    await browser.tabs.update({ url: searchUrl });
  }
  await focusSearchTab();
  await browser.runtime.sendMessage({
    type: "closePopup",
    time: 0,
  });
}

export function isSearchTab(tab) {
  const tabId = typeof tab === "object" && tab ? tab.id : tab;
  return _searchTabId && _searchTabId === tabId;
}

intentRunner.registerIntent({
  name: "search.defaultSearchEngine",
  async run(context) {
    await browser.search.search({ query: "" });
  },
});

intentRunner.registerIntent({
  name: "search.search",
  async run(context) {
    stopCardPoll();
    // An old popup-only search result is no longer valid once a new search is made:
    popupSearchInfo = null;
    await performSearch(context.slots.query);
    const searchInfo = await callScript({ type: "searchResultInfo" });
    searchInfo.query = context.slots.query;

    if (!searchInfo.searchResults) {
      const e = new Error("No result found for " + searchInfo.query);
      e.displayMessage = "No result found for " + searchInfo.query;
      throw e;
    }

    if (searchInfo.hasCard || searchInfo.hasSidebarCard) {
      const card = await callScript({ type: "cardImage" });
      context.keepPopup();
      searchInfo.index = -1;
      await browser.runtime.sendMessage({
        type: "showSearchResults",
        card,
        searchResults: searchInfo.searchResults,
        searchUrl: searchInfo.searchUrl,
        index: -1,
      });
      telemetry.add({ hasCard: true });
      if (card.hasWidget) {
        pollForCard();
      } else {
        pollForCard(CARD_POLL_LIMIT);
      }
      lastTabId = undefined;
      popupSearchInfo = searchInfo;
    } else {
      context.keepPopup();
      searchInfo.index = 0;
      await browser.runtime.sendMessage({
        type: "showSearchResults",
        searchResults: searchInfo.searchResults,
        searchUrl: searchInfo.searchUrl,
        index: 0,
      });
      const tab = await browser.tabs.create({
        url: searchInfo.searchResults[0].url,
      });
      lastTabId = tab.id;
      tabSearchResults.set(tab.id, searchInfo);
    }
  },
});

intentRunner.registerIntent({
  name: "search.next",
  async run(context) {
    await moveResult(context, 1);
  },
});

intentRunner.registerIntent({
  name: "search.previous",
  async run(context) {
    await moveResult(context, -1);
  },
});

intentRunner.registerIntent({
  name: "search.show",
  async run(context) {
    stopCardPoll();
    const { searchInfo } = await getSearchInfo();
    if (!searchInfo) {
      const e = new Error("Show search command without a past search");
      e.displayMessage = "There is no search to show";
      throw e;
    }
    const searchTabId = await openSearchTab();
    const searchTab = await browser.tabs.get(searchTabId);
    if (!googleIsDefaultProvider) {
      await browser.tabs.update(searchTabId, { url: "about:blank" });
      await browser.search.search({
        query: searchInfo.query || "unknown",
        tabId: searchTabId,
      });
    } else if (searchTab.url !== searchInfo.searchUrl) {
      await browser.tabs.update(searchTabId, { url: searchInfo.url });
    }
    await focusSearchTab();
  },
});

intentRunner.registerIntent({
  name: "search.searchPage",
  async run(context) {
    if (buildSettings.android) {
      await performSearch(context.slots.query);
    } else {
      const tabId = await openSearchTab();

      await browser.search.search({
        query: context.slots.query,
        tabId,
      });

      await focusSearchTab();
      await content.lazyInject(tabId, "/intents/search/queryScript.js");
      const searchInfo = await callScript({ type: "searchResultInfo" });

      if (
        searchInfo.searchResults === undefined ||
        !searchInfo.searchResults.length > 0
      ) {
        const msg =
          "Could not get list of search results.\n\nPlease click feedback to let us know.";
        const e = new Error(msg);
        e.displayMessage = msg;
        throw e;
      }

      tabSearchResults.set(tabId, searchInfo);
    }
  },
});

intentRunner.registerIntent({
  name: "search.searchGoogle",
  async run(context) {
    if (buildSettings.android) {
      await performSearch(context.slots.query);
    } else {
      await browser.search.search({
        query: context.slots.query,
        engine: "Google",
      });
    }
  },
});

async function init() {
  const engines = await browser.search.get();
  for (const engine of engines) {
    if (engine.isDefault) {
      googleIsDefaultProvider = /google/i.test(engine.name);
    }
  }
}

init().catch(error => {
  log.error("Error finding default search engine:", error);
  catcher.capture(error);
});
