/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

export async function stopReading() {
  const activeTab = await browserUtil.activeTab();
  if (!activeTab) {
    return false;
  }
  if (!activeTab.url.startsWith("about:reader")) {
    return false;
  }
  return stopReadingTab(activeTab.id);
}

async function stopReadingTab(tabId) {
  await content.lazyInject(tabId, ["/intents/read/startNarration.js"]);
  await browser.tabs.sendMessage(tabId, {
    type: "stopReading",
  });
  return true;
}

export async function pauseAny(options) {
  const exceptTabId = options && options.exceptTabId;
  const tabs = await browser.tabs.query({ url: "about:reader*" });
  for (const tab of tabs) {
    if (exceptTabId && tab.id === exceptTabId) {
      continue;
    }
    try {
      await stopReadingTab(tab.id);
    } catch (e) {
      log.info("Error pausing reading in tab:", String(e));
    }
  }
}

intentRunner.registerIntent({
  name: "read.read",
  async run(context) {
    let activeTab;
    const query = context.slots.query;
    if (!query) {
      activeTab = await context.activeTab();
    } else {
      activeTab = await context.createTabGoogleLucky(query);
      await browserUtil.waitForDocumentComplete(activeTab.id);
    }
    await browserUtil.turnOnReaderMode(activeTab.id);
    await content.lazyInject(activeTab.id, ["/intents/read/startNarration.js"]);
    const success = await browser.tabs.sendMessage(activeTab.id, {
      type: "narrate",
    });
    if (!success) {
      const e = new Error(`Already narrating`);
      e.displayMessage = "Already narrating";
      throw e;
    }
  },
});

intentRunner.registerIntent({
  name: "read.stopRead",
  async run(context) {
    const activeTab = await context.activeTab();
    if (!activeTab.url.startsWith("about:reader")) {
      const e = new Error(`Not a Reader Mode page`);
      e.displayMessage = "Page isn't narrating";
      throw e;
    }
    await content.lazyInject(activeTab.id, ["/intents/read/startNarration.js"]);
    const success = await browser.tabs.sendMessage(activeTab.id, {
      type: "stopReading",
    });
    if (!success) {
      const e = new Error("Not narrating");
      e.displayMessage = "Page isn't narrating";
      throw e;
    }
  },
});
