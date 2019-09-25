/* globals intents, serviceList */

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
  }

  Object.assign(Spotify, {
    id: "spotify",
    title: "Spotify",
    baseUrl: "https://open.spotify.com/",
  });

  intents.music.register(Spotify);
})();
