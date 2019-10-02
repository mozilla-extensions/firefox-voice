/* globals intents, serviceList, content */

this.services.spotify = (function() {
  class Spotify extends serviceList.Service {
    async playQuery(query) {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("search", { query, thenPlay: true });
      if (this.tabCreated) {
        const isAudible = await this.pollTabAudible(this.tab.id, 2000);
        if (!isAudible) {
          const activeTabId = (await browser.tabs.query({ active: true }))[0]
            .id;
          await browser.tabs.update(this.tab.id, { active: true });
          const nowAudible = await this.pollTabAudible(this.tab.id, 1000);
          if (nowAudible) {
            if (this.tab.id !== activeTabId) {
              await browser.tabs.update(activeTabId, { active: true });
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
        const e = new Error("Spotify is not open");
        e.displayMessage = "Spotify is not open";
        throw e;
      }
      for (const tab of tabs) {
        await content.lazyInject(tab.id, "/services/spotify/player.js");
        await this.callOneTab(tab.id, "move", { direction });
      }
    }

    async pause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("pause");
    }

    async unpause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("unpause");
    }

    async pauseAny() {
      for (const tab of await this.getAllTabs({ audible: true })) {
        await content.lazyInject(tab.id, "/services/spotify/player.js");
        await this.callOneTab(tab.id, "pause");
      }
    }
  }

  Object.assign(Spotify, {
    id: "spotify",
    title: "Spotify",
    baseUrl: "https://open.spotify.com/",
  });

  intents.music.register(Spotify);
})();
