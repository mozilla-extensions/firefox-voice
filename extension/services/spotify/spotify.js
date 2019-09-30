/* globals intents, serviceList, content */

this.services.spotify = (function() {
  class Spotify extends serviceList.Service {
    async playQuery(query) {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("search", { query, thenPlay: true });
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
