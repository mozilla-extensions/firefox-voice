/* globals intents, serviceList, searching, content */

this.services.youtube = (function() {
  class YouTube extends serviceList.Service {
    async playQuery(query) {
      this.tab = await browser.tabs.create({
        url: searching.googleSearchUrl(`${query} youtube.com`, true),
        active: true,
      });
      browser.tabs.update(this.tab.id, { muted: true });
      await content.lazyInject(this.tab.id, "/services/youtube/player.js");
      await this.callTab("play");
    }

    async pause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("pause");
    }

    async unpause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("unpause");
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
