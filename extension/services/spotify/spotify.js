/* globals intents, serviceList, content */

this.services.spotify = (function() {
  class Spotify extends serviceList.Service {
    async playQuery(query) {
      const tab = await this.getTab();
      await content.lazyInject(tab.id, "/services/spotify/player.js");
      await browser.tabs.sendMessage(tab.id, {
        type: "search",
        query,
        thenPlay: true,
      });
    }

    async pause() {
      const tab = await this.getTab();
      await content.lazyInject(tab.id, "/services/spotify/player.js");
      await browser.tabs.sendMessage(tab.id, {
        type: "pause",
      });
    }

    async unpause() {
      const tab = await this.getTab();
      await content.lazyInject(tab.id, "/services/spotify/player.js");
      await browser.tabs.sendMessage(tab.id, {
        type: "play",
      });
    }
  }
  Object.assign(Spotify.prototype, {
    name: "spotify",
    title: "Spotify",
    baseUrl: "https://open.spotify.com/",
  });
  intents.music.register(new Spotify());
})();
