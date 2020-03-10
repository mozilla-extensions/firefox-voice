import * as music from "../../intents/music/music.js";
import * as serviceList from "../../background/serviceList.js";
import * as content from "../../background/content.js";
import { shouldDisplayWarning } from "../../limiter.js";

class Soundcloud extends serviceList.Service {
  async playQuery(query) {
    await this.initTab("/services/soundcloud/player.js");
    await this.callTab("search", { query, thenPlay: true });
    if (this.tabCreated) {
      const isAudible = await this.pollTabAudible(this.tab.id, 3000);
      if (!isAudible) {
        const activeTabId = (await this.context.activeTab()).id;
        this.context.makeTabActive(this.tab);
        const nowAudible = await this.pollTabAudible(this.tab.id, 1000);
        if (
          nowAudible ||
          !(await shouldDisplayWarning("soundcloudAudible", {
            times: 3,
            frequency: 1000,
          }))
        ) {
          if (this.tab.id !== activeTabId) {
            this.context.makeTabActive(activeTabId);
          }
        } else {
          this.context.failedAutoplay(this.tab);
        }
      }
    }
  }

  async move(direction) {
    const tabs = await this.getAllTabs();
    if (!tabs.length) {
      const e = new Error("Soundcloud is not open");
      e.displayMessage = "Soundcloud is not open";
      throw e;
    }
    for (const tab of tabs) {
      await content.lazyInject(tab.id, "/services/soundcloud/player.js");
      await this.callOneTab(tab.id, "move", { direction });
    }
  }

  async pause() {
    await this.initTab("/services/soundcloud/player.js");
    await this.callTab("pause");
  }

  async unpause() {
    await this.initTab("/services/soundcloud/player.js");
    await this.callTab("unpause");
  }

  async pauseAny(options) {
    const exceptTabId = options && options.exceptTabId;
    for (const tab of await this.getAllTabs({ audible: true })) {
      if (exceptTabId && exceptTabId === tab.id) {
        continue;
      }
      await content.lazyInject(tab.id, "/services/soundcloud/player.js");
      await this.callOneTab(tab.id, "pause");
    }
  }
}

Object.assign(Soundcloud, {
  id: "soundcloud",
  title: "Sound Cloud",
  baseUrl: "https://soundcloud.com/",
});

music.register(Soundcloud);
