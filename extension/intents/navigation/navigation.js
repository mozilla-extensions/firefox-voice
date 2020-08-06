import * as content from "../../background/content.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as languages from "../../background/languages.js";
import * as pageMetadata from "../../background/pageMetadata.js";
import * as serviceList from "../../background/serviceList.js";
import * as browserUtil from "../../browserUtil.js";
import * as searching from "../../searching.js";
import { metadata } from "../../services/metadata.js";
import { performSearchPage } from "../search/search.js";
import { sendMessage } from "../../communicate.js";

const QUERY_DATABASE_EXPIRATION = 1000 * 60 * 60 * 24 * 30; // 30 days
const queryDatabase = new Map();

function saveTabQueryToDatabase(query, tab, url) {
  queryDatabase.set(query.toLowerCase(), {
    url,
    date: Date.now(),
  });
  // Sometimes there's a very quick redirect
  setTimeout(async () => {
    const newTab = await browser.tabs.get(tab.id);
    if (newTab.url !== url) {
      queryDatabase.set(query.toLowerCase(), {
        url: newTab.url,
        date: Date.now(),
      });
      saveQueryDatabase();
    }
  }, 1000);
  saveQueryDatabase();
}

intentRunner.registerIntent({
  name: "navigation.navigate",
  async run(context) {
    const query = context.slots.query.toLowerCase();
    const result = await browser.storage.sync.get("pageNames");
    const pageNames = result.pageNames;
    let tab = null;
    if (pageNames && pageNames[query]) {
      const savedUrl = pageNames[query];
      tab = await browserUtil.openOrFocusTab(savedUrl);
    } else {
      const where = context.slots.where;
      const cached = queryDatabase.get(query.toLowerCase());
      if (where === "window") {
        if (cached) {
          const window = await browser.windows.create({ url: cached.url });
          tab = window.tabs[0];
        } else {
          await browser.windows.create({});
          tab = await browserUtil.createTabGoogleLucky(query);
          const url = tab.url;
          saveTabQueryToDatabase(query, tab, url);
        }
      } else if (cached) {
        tab = await browserUtil.openOrFocusTab(cached.url);
      } else {
        tab = await browserUtil.createTabGoogleLucky(query);
        const url = tab.url;
        saveTabQueryToDatabase(query, tab, url);
      }
    }
    await browserUtil.waitForPageToLoadUsingSelector(tab.id);
    context.done();
  },
});

intentRunner.registerIntent({
  name: "navigation.clearQueryDatabase",
  async run(context) {
    queryDatabase.clear();
    saveQueryDatabase();
    context.presentMessage('"Open" database/cache cleared');
  },
});

intentRunner.registerIntent({
  name: "navigation.serviceSearch",
  async run(context) {
    let service = context.slots.service || context.parameters.service;
    let tab = undefined;
    let myurl = undefined;

    if (service === undefined) {
      service = await serviceList.detectServiceFromActiveTab(metadata.search);
      tab = await browserUtil.activeTab();
    }

    if (service !== null) {
      myurl = await searching.ddgServiceSearchUrl(context.slots.query, service);

      context.addTelemetryServiceName(
        `ddg:${searching.ddgBangServiceName(service)}`
      );

      if (tab !== undefined && service !== null) {
        browser.tabs.update(tab.id, { url: myurl });
      } else {
        await browserUtil.createAndLoadTab({ url: myurl });
      }

      sendMessage({
        type: "closePopup",
        sender: "find",
      });
    } else {
      myurl = await performSearchPage(
        context,
        context.slots.query + " site:" + new URL(tab.url).origin
      );
    }
  },
});

intentRunner.registerIntent({
  name: "navigation.translate",
  async run(context) {
    const language = context.slots.language || "english";
    const tab = await browserUtil.activeTab();
    const translation = `https://translate.google.com/translate?hl=&sl=auto&tl=${
      languages.languageCodes[language.toLowerCase().trim()]
    }&u=${encodeURIComponent(tab.url)}`;
    browser.tabs.update(tab.id, { url: translation });
  },
});

intentRunner.registerIntent({
  name: "navigation.translateSelection",
  async run(context) {
    const language = context.slots.language || "english";
    const tab = await browserUtil.activeTab();
    const selection = await pageMetadata.getSelection(tab.id);
    if (!selection || !selection.text) {
      const e = new Error("No text selected");
      e.displayMessage = "No text selected";
      throw e;
    }
    const url = `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${
      languages.languageCodes[language.toLowerCase().trim()]
    }&text=${encodeURIComponent(selection.text)}`;
    await browser.tabs.create({ url });
  },
});

async function saveQueryDatabase() {
  const expireTime = Date.now() - QUERY_DATABASE_EXPIRATION;
  const entries = [];
  for (const [url, value] of queryDatabase.entries()) {
    if (value.date >= expireTime) {
      entries.push([url, value]);
    }
  }
  await browser.storage.local.set({ queryDatabase: entries });
}

intentRunner.registerIntent({
  name: "navigation.goBack",
  async run(context) {
    const tab = await browserUtil.activeTab();
    await browser.tabs.executeScript(tab.id, {
      code: "window.history.back();",
    });
  },
});

intentRunner.registerIntent({
  name: "navigation.goForward",
  async run(context) {
    const tab = await browserUtil.activeTab();
    await browser.tabs.executeScript(tab.id, {
      code: "window.history.forward();",
    });
  },
});

intentRunner.registerIntent({
  name: "navigation.followLink",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/navigation/followLink.content.js",
    ]);
    const found = await browser.tabs.sendMessage(activeTab.id, {
      type: "followLink",
      query: context.slots.query,
    });
    if (found === false) {
      const exc = new Error("No link found matching query");
      exc.displayMessage = `No link "${context.slots.query}" found`;
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "navigation.signInAndOut",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/intents/navigation/clickLoginAndOut.js",
    ]);
    const found = await browser.tabs.sendMessage(activeTab.id, {
      type: "signInAndOut",
    });
    if (found === false) {
      const exc = new Error("No link found matching query");
      exc.displayMessage = `Sorry can't "${context.utterance}" on this page`;
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "navigation.closeDialog",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/intents/navigation/closeDialog.content.js",
    ]);
    const found = await browser.tabs.sendMessage(activeTab.id, {
      type: "closeDialog",
    });
    if (found === false) {
      const exc = new Error("Could not close dialog");
      exc.displayMessage = "I couldn't figure out how to close the dialog";
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "navigation.internetArchive",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await browser.tabs.update({
      url: `https://web.archive.org/web/*/${activeTab.url}`,
    });
  },
});

async function loadQueryDatabase() {
  const result = await browser.storage.local.get(["queryDatabase"]);
  if (result && result.queryDatabase) {
    for (const [key, value] of result.queryDatabase) {
      queryDatabase.set(key, value);
    }
  }
}

loadQueryDatabase();
