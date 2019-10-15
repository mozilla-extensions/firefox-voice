/* globals intents, serviceList, content */

this.services.readerMode = (function() {
  class ReaderMode extends serviceList.Service {
    async pause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("pause");
    }

    async unpause() {
      const activeTab = await this.context.activeTab();
      if (!activeTab.url.startsWith("about:reader")) {
        const e = new Error("Cannot unpause a non-reader tab");
        e.displayMessage = "Cannot unpause";
        throw e;
      }
      await content.lazyInject(activeTab.id, [
        "/intents/read/startNarration.js",
      ]);
      await this.callOneTab(activeTab.id, "narrate");
    }

    async pauseAny(options) {
      return intents.read.pauseAny(options);
    }
  }

  Object.assign(ReaderMode, {
    id: "readerMode",
    title: "Reader Mode",
    baseUrl: "about:reader",
    skipAutodetect: true,
  });

  intents.music.register(ReaderMode);
})();
