import * as util from "../../util.js";
import * as serviceList from "../../background/serviceList.js";
import * as content from "../../background/content.js";
import * as music from "../../intents/music/music.js";
import { shouldDisplayWarning } from "../../limiter.js";

const SUPPORTED_URLS = /^https:\/\/www.youtube.com\/watch/i;

async function waitForUrl(tabId, options) {
  const notUrlPattern = options.notUrlPattern;
  return util.trySeveralTimes(
    Object.assign({}, options, {
      func: async () => {
        const tab = await browser.tabs.get(tabId);
        if (tab.url.startsWith("about:blank") || notUrlPattern.test(tab.url)) {
          return undefined;
        }
        return tab;
      },
      returnOnTimeout: null,
    })
  );
}

class YouTube extends serviceList.Service {
  async playQuery(query) {
    this.tab = await this.context.createTabGoogleLucky(`${query} youtube.com`);
    this.tabCreated = true;
    // We only test for audibility if the URL seems correct
    const loadedTab = await waitForUrl(this.tab.id, {
      notUrlPattern: /^https:\/\/[^/]*google.com/i,
      timeout: 5000,
    });
    if (!SUPPORTED_URLS.test(loadedTab.url)) {
      return;
    }
    const isAudible = await this.pollTabAudible(this.tab.id, 3000);
    if (
      !isAudible &&
      (await shouldDisplayWarning("youtubeAudible", {
        times: 3,
        frequency: 1000,
      }))
    ) {
      this.context.failedAutoplay(this.tab);
    }
  }

  async pause() {
    await this.initTab("/services/youtube/player.js");
    await this.callTab("pause");
  }

  async unpause() {
    await this.initTab("/services/youtube/player.js");
    await this.callTab("unpause");
  }

  async pauseAny(options) {
    const exceptTabId = options && options.exceptTabId;
    for (const tab of await this.getAllTabs({ audible: true })) {
      if (exceptTabId && exceptTabId === tab.id) {
        continue;
      }
      await content.lazyInject(tab.id, "/services/youtube/player.js");
      await this.callOneTab(tab.id, "pause");
    }
  }

  async move(direction) {
    if (direction === "previous") {
      const e = new Error("Cannot move to previous YouTube video");
      e.displayMessage = `YouTube cannot do "${this.context.utterance}"`;
      throw e;
    }
    let tabs = await this.getAllTabs({ audible: true });
    if (!tabs.length) {
      const currentTab = await this.context.activeTab();
      if (currentTab.url.startsWith(this.baseUrl)) {
        tabs = [currentTab];
      } else {
        const e = new Error("YouTube is not playing");
        e.displayMessage = "YouTube is not playing";
        throw e;
      }
    }
    // FIXME: doing this on all audible tabs is odd, though any situation with multiple tabs here is odd
    for (const tab of tabs) {
      await content.lazyInject(tab.id, "/services/youtube/player.js");
      await this.callOneTab(tab.id, "move", { direction });
    }
  }
}

Object.assign(YouTube, {
  id: "youtube",
  title: "YouTube",
  baseUrl: "https://www.youtube.com",
  skipAutodetect: true,
});

music.register(YouTube);
