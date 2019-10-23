/* globals intentRunner, log, searching, content, browserUtil */

this.intents.search = (function() {
  const exports = {};
  // Close the search tab after this amount of time:
  const CLOSE_TIME = 1000 * 60 * 60; // 1 hour
  const CARD_POLL_INTERVAL = 200;
  let closeTabTimeout = null;
  let lastImage = null;
  let _searchTabId;
  const START_URL = "https://www.google.com";
  let lastSearchInfo;
  let lastSearchIndex;
  let lastTabId;

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
      if (tab.url.includes("&voice")) {
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
    _searchTabId = null;
    await browser.tabs.remove(tabId);
  }

  async function performSearch(query) {
    const tabId = await openSearchTab();
    const url = searching.googleSearchUrl(query) + "&voice";
    await browserUtil.loadUrl(tabId, url);
    await content.lazyInject(tabId, "/intents/search/queryScript.js");
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

  function pollForCard() {
    stopCardPoll();
    cardPollTimeout = setInterval(async () => {
      const card = await callScript({ type: "cardImage" });
      if (card.src === lastImage) {
        return;
      }
      lastImage = card.src;
      const response = await browser.runtime.sendMessage({
        type: "showSearchResults",
        card,
        searchResults: lastSearchInfo.searchResults,
        searchUrl: lastSearchInfo.searchUrl,
        index: -1,
      });
      if (!response) {
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

  intentRunner.registerIntent({
    name: "search.search",
    description:
      "Experimental search interface; this does all searches in a special pinned tab, and if the search results in a card then a screenshot of the card is displayed in the popup. If there's no card, then the first search result is opened in a new tab.",
    match: `
    (do a |) (search | query | find | find me | google | look up | lookup | look on | look for) (google | the web | the internet |) (for |) [query] (on the web |)
    `,
    async run(context) {
      stopCardPoll();
      await performSearch(context.slots.query);
      const searchInfo = await callScript({ type: "searchResultInfo" });
      lastSearchInfo = searchInfo;
      lastTabId = undefined;
      if (searchInfo.hasCard) {
        const card = await callScript({ type: "cardImage" });
        context.keepPopup();
        lastSearchIndex = -1;
        await browser.runtime.sendMessage({
          type: "showSearchResults",
          card,
          searchResults: searchInfo.searchResults,
          searchUrl: searchInfo.searchUrl,
          index: -1,
        });
        if (card.hasWidget) {
          pollForCard();
        }
      } else {
        context.keepPopup();
        lastSearchIndex = 0;
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
      }
    },
  });

  intentRunner.registerIntent({
    name: "search.next",
    description:
      "If you've done a search then this will display the next search result. If the last search had a card, and no search result was opened, then this will open a new tab with the first search result.",
    match: `
    (search |) next (search |) (result | item | page | article |)
    `,
    async run(context) {
      stopCardPoll();
      if (!lastSearchInfo) {
        const e = new Error("No search made");
        e.displayMessage = "You haven't made a search";
        throw e;
      }
      if (lastSearchIndex >= lastSearchInfo.searchResults.length - 1) {
        const tabId = await openSearchTab();
        await context.makeTabActive(tabId);
        return;
      }
      lastSearchIndex++;
      const item = lastSearchInfo.searchResults[lastSearchIndex];
      await browser.runtime.sendMessage({
        type: "showSearchResults",
        searchResults: lastSearchInfo.searchResults,
        searchUrl: lastSearchInfo.searchUrl,
        index: lastSearchIndex,
      });
      if (!lastTabId) {
        const tab = await browser.tabs.create({ url: item.url, active: true });
        // eslint-disable-next-line require-atomic-updates
        lastTabId = tab.id;
      } else {
        await context.makeTabActive(lastTabId);
      }
    },
  });

  intentRunner.registerIntent({
    name: "search.show",
    description: "Focuses the special tab used for searching",
    match: `
    (open | show | focus) search (results |)
    (open | show | focus) results
    `,
    async run(context) {
      stopCardPoll();
      const tabId = await openSearchTab();
      await context.makeTabActive(tabId);
    },
  });

  return exports;
})();
