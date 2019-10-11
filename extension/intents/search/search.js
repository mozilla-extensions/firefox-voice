/* globals intentRunner, log, searching, content */

this.intents.search = (function() {
  let _searchTabId;
  const START_URL = "https://www.google.com";
  let lastSearchInfo;
  let lastSearchIndex;
  let lastTabId;

  async function openSearchTab() {
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

  async function performSearch(query) {
    const tabId = await openSearchTab();
    const url = searching.googleSearchUrl(query) + "&voice";
    await browser.tabs.update(tabId, { url });
    await content.lazyInject(tabId, "/intents/search/queryScript.js");
  }

  async function callScript(message) {
    return browser.tabs.sendMessage(_searchTabId, message);
  }

  intentRunner.registerIntent({
    name: "search.search",
    match: `
    fancy (search |) [query]
    `,
    async run(context) {
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
          index: -1,
        });
      } else {
        context.keepPopup();
        lastSearchIndex = 0;
        await browser.runtime.sendMessage({
          type: "showSearchResults",
          searchResults: searchInfo.searchResults,
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
    match: `
    fancy next (result | search |)
    `,
    async run(context) {
      if (!lastSearchInfo) {
        const e = new Error("No search made");
        e.displayMessage = "You haven't made a search";
        throw e;
      }
      if (lastSearchIndex >= lastSearchInfo.searchResults.length - 1) {
        const tabId = await openSearchTab();
        await browser.tabs.update(tabId, { active: true });
        return;
      }
      lastSearchIndex++;
      const item = lastSearchInfo.searchResults[lastSearchIndex];
      await browser.runtime.sendMessage({
        type: "showSearchResults",
        searchResults: lastSearchInfo.searchResults,
        index: lastSearchIndex,
      });
      if (!lastTabId) {
        const tab = await browser.tabs.create({ url: item.url, active: true });
        // eslint-disable-next-line require-atomic-updates
        lastTabId = tab.id;
      } else {
        await browser.tabs.update(lastTabId, { url: item.url, active: true });
      }
    },
  });

  intentRunner.registerIntent({
    name: "search.show",
    match: `
    fancy (search | show |) results
    fancy show
    `,
    async run(context) {
      const tabId = await openSearchTab();
      await browser.tabs.update(tabId, { active: true });
    },
  });
})();
