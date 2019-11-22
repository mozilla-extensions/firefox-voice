/* globals intentRunner, log, searching, content, browserUtil, telemetry */

this.intents.search = (function() {
  const exports = {};
  // Close the search tab after this amount of time:
  const CLOSE_TIME = 1000 * 60 * 60; // 1 hour
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
  const tabSearchResults = new browserUtil.TabDataMap();

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
      pinned: true,
      active: false,
    });
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
    // Technically there is a race condition here, but without some lock this is just going to be racy,
    // so this race is better than the other one
    // eslint-disable-next-line require-atomic-updates
    _searchTabId = null;
  }

  async function performSearch(query) {
    const tabId = await openSearchTab();
    const url = searching.googleSearchUrl(query) + "&voice";
    await browserUtil.loadUrl(tabId, url);
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
    return browser.tabs.sendMessage(_searchTabId, message);
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
      const card = await callScript({ type: "cardImage" });
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

  exports.focusSearchResults = async message => {
    const { searchUrl } = message;
    const searchTabId = await openSearchTab();
    const tab = await browser.tabs.get(searchTabId);
    if (tab.url !== searchUrl) {
      await browser.tabs.update({ url: searchUrl });
    }
    await browserUtil.makeTabActive(tab);
    await browser.runtime.sendMessage({
      type: "closePopup",
      time: 0,
    });
  };

  exports.isSearchTab = tab => {
    const tabId = typeof tab === "object" && tab ? tab.id : tab;
    return _searchTabId && _searchTabId === tabId;
  };

  intentRunner.registerIntent({
    name: "search.search",
    description:
      "Experimental search interface; this does all searches in a special pinned tab, and if the search results in a card then a screenshot of the card is displayed in the popup. If there's no card, then the first search result is opened in a new tab.",
    match: `
    (do a |) (search | query | find | find me | google | look up | lookup | look on | look for) (google | the web | the internet |) (for |) [query] (on the web |) (for me |)
    `,
    async run(context) {
      stopCardPoll();
      // An old popup-only search result is no longer valid once a new search is made:
      popupSearchInfo = null;
      await performSearch(context.slots.query);
      const searchInfo = await callScript({ type: "searchResultInfo" });
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
    description:
      "If you've done a search then this will display the next search result. If the last search had a card, and no search result was opened, then this will open a new tab with the first search result.",
    examples: ["test:next search item"],
    match: `
    (search |) next (search |) (result{s} | item{s} | page | article |)
    `,
    async run(context) {
      stopCardPoll();
      const { tabId, searchInfo } = await getSearchInfo();
      if (!searchInfo) {
        const e = new Error("No search made");
        e.displayMessage = "You haven't made a search";
        throw e;
      }
      if (searchInfo.index >= searchInfo.searchResults.length - 1) {
        const tabId = await openSearchTab();
        await context.makeTabActive(tabId);
        return;
      }
      searchInfo.index++;
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
        lastTabId = tabId;
        try {
          await context.makeTabActive(tabId);
        } catch (e) {
          if (String(e).includes("Invalid tab ID")) {
            e.displayMessage = "The search results tab has been closed";
          }
          throw e;
        }
        await browser.tabs.update(tabId, { url: item.url });
      }
    },
  });

  intentRunner.registerIntent({
    name: "search.show",
    description: "Focuses the special tab used for searching",
    examples: ["test:open results", "test:show search result"],
    match: `
    (open | show | focus) search (result{s} |)
    (open | show | focus) result{s}
    `,
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
      if (searchTab.url !== searchInfo.searchUrl) {
        await browser.tabs.update(searchTabId, { url: searchInfo.url });
      }
      await context.makeTabActive(searchTabId);
    },
  });

  return exports;
})();
