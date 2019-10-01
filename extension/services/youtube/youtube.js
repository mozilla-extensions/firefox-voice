/* globals intents, serviceList, searching, content */

this.services.youtube = (function() {
  class YouTube extends serviceList.Service {
    async playQuery(query) {
      this.tab = await this.context.createTab({
        url: searching.googleSearchUrl(`${query} youtube.com`, true),
        active: true,
      });
      this.tabCreated = true;
      const isAudible = await this.pollTabAudible(this.tab.id, 2000);
      if (!isAudible) {
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

    async pauseAny() {
      for (const tab of await this.getAllTabs({ audible: true })) {
        await content.lazyInject(tab.id, "/services/youtube/player.js");
        await this.callOneTab(tab.id, "pause");
      }
    }
  }

  Object.assign(YouTube, {
    id: "youtube",
    title: "YouTube",
    baseUrl: "https://www.youtube.com",
    skipAutodetect: true,
  });

  intents.music.register(YouTube);
})();
