this.browserUtil = (function() {
  const exports = {};
  exports.activeTab = async function activeTab() {
    return (await browser.tabs.query({
      active: true,
      lastFocusedWindow: true,
    }))[0];
  };

  exports.makeTabActive = async function makeTabActive(tab) {
    let tabId;
    if (typeof tab === "string" || typeof tab === "number") {
      // then it's a tab ID
      tabId = tab;
      tab = await browser.tabs.get(tabId);
    } else {
      tabId = tab.id;
    }
    await browser.tabs.update(tabId, { active: true });
    await browser.windows.update(tab.windowId, { focused: true });
  };

  exports.loadUrl = async function loadUrl(tabId, url) {
    await browser.tabs.update(tabId, { url });
    return new Promise((resolve, reject) => {
      function onUpdated(tabId, changeInfo, tab) {
        if (tab.url === url) {
          browser.tabs.onUpdated.removeListener(onUpdated, { tabId });
          resolve(tab);
        }
      }
      browser.tabs.onUpdated.addListener(onUpdated, { tabId });
    });
  };

  exports.createTab = async options => {
    const activeTab = await exports.activeTab();
    if (["about:blank", "about:home", "about:newtab"].includes(activeTab.url)) {
      return browser.tabs.update(options);
    }
    return browser.tabs.create(options);
  };

  exports.TabRemovalWatcher = class TabRemovalWatcher {
    constructor() {
      this.isWatching = false;
      this.onRemoved = this.onRemoved.bind(this);
      this.watching = new Map();
    }

    watch(tabId, callback) {
      if (!this.isWatching) {
        browser.tabs.onRemoved.addListener(this.onRemoved);
      }
      this.watching.set(tabId, callback);
    }

    onRemoved(tabId) {
      const callback = this.watching.get(tabId);
      this.watching.delete(tabId);
      if (!this.watching.size) {
        browser.tabs.onRemoved.removeListener(this.onRemoved);
        this.isWatching = false;
      }
      if (callback) {
        callback(tabId);
      }
    }
  };

  exports.TabDataMap = class TabDataMap {
    constructor() {
      this.watcher = new exports.TabRemovalWatcher();
      this.onRemoved = this.onRemoved.bind(this);
      this.map = new Map();
    }
    set(tabId, value) {
      this.watcher.watch(tabId, this.onRemoved);
      this.map.set(tabId, value);
    }
    get(tabId) {
      return this.map.get(tabId);
    }
    onRemoved(tabId) {
      this.map.delete(tabId);
    }
  };

  return exports;
})();
