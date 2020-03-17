/* globals buildSettings */

export async function activeTab() {
  return (await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  }))[0];
}

export async function makeTabActive(tab) {
  let tabId;
  if (typeof tab === "string" || typeof tab === "number") {
    // then it's a tab ID
    tabId = tab;
    tab = await browser.tabs.get(tabId);
  } else {
    tabId = tab.id;
  }
  if (!tabId) {
    throw new Error("Cannot make tab active without ID");
  }
  await browser.tabs.update(tabId, { active: true });
  if (!buildSettings.android) {
    await browser.windows.update(tab.windowId, { focused: true });
  }
}

export async function loadUrl(tabId, url) {
  await browser.tabs.update(tabId, { url });
  return new Promise((resolve, reject) => {
    function onUpdated(tabId, changeInfo, tab) {
      if (tab.url === url) {
        onUpdatedRemove(onUpdated, tabId);
        resolve(tab);
      }
    }
    onUpdatedListen(onUpdated, tabId);
  });
}

export async function turnOnReaderMode(tabId) {
  if (!tabId) {
    // eslint-disable-next-line require-atomic-updates
    tabId = (await activeTab()).id;
  }
  const tab = await browser.tabs.get(tabId);
  if (tab.url.startsWith("about:reader")) {
    // It's already in reader mode
    return tab;
  }
  return new Promise((resolve, reject) => {
    function onUpdated(tabId, changeInfo, tab) {
      if (tab.url.startsWith("about:reader")) {
        onUpdatedRemove(onUpdated, tabId);
        resolve(tab);
      }
    }
    onUpdatedListen(onUpdated, tabId);
    browser.tabs.toggleReaderMode(tabId);
  });
}

export async function openOrActivateTab(url) {
  if (!url.includes("://")) {
    url = browser.runtime.getURL(url);
  }
  for (const tab of await browser.tabs.query({
    url: [url],
  })) {
    return makeTabActive(tab);
  }
  return browser.tabs.create({
    url,
  });
}

export async function activateTabClickHandler(event) {
  if (event) {
    event.preventDefault();
    await openOrActivateTab(event.target.href);
  }
}

export async function createTab(options = {}) {
  const active = await activeTab();
  if (
    ["about:blank", "about:home", "about:newtab"].includes(active.url) ||
    (buildSettings.executeIntentUrl &&
      active.url.startsWith(buildSettings.executeIntentUrl))
  ) {
    return browser.tabs.update(options);
  }
  return browser.tabs.create(options);
}

export class TabRemovalWatcher {
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
}

export class TabDataMap {
  constructor(delay = 0) {
    this.watcher = new TabRemovalWatcher();
    this.onRemoved = this.onRemoved.bind(this);
    this.map = new Map();
    this.delay = delay;
  }
  set(tabId, value) {
    this.watcher.watch(tabId, this.onRemoved);
    this.map.set(tabId, value);
  }
  get(tabId) {
    return this.map.get(tabId);
  }
  delete(tabId) {
    this.map.delete(tabId);
  }
  onRemoved(tabId) {
    if (this.delay) {
      setTimeout(() => {
        this.map.delete(tabId);
      }, this.delay);
    } else {
      this.map.delete(tabId);
    }
  }
}

export function waitForDocumentComplete(tabId) {
  return browser.tabs.executeScript(tabId, {
    code: "null",
    runAt: "document_idle",
  });
}

/** Wrappers for browser.tabs.onUpdated to handle Android compatibility */
export function onUpdatedListen(callback, tabId) {
  if (buildSettings.android) {
    callback.wrappedFunction = (tabId, changeInfo, tab) => {
      if (tab.id !== tabId) {
        return null;
      }
      return callback(tabId, changeInfo, tab);
    };
    return browser.tabs.onUpdated.addListener(callback.wrappedFunction);
  }
  return browser.tabs.onUpdated.addListener(callback, { tabId });
}

export function onUpdatedRemove(callback, tabId) {
  if (buildSettings.android) {
    return browser.tabs.onUpdated.removeListener(callback.wrappedFunction);
  }
  return browser.tabs.onUpdated.removeListener(callback, { tabId });
}
