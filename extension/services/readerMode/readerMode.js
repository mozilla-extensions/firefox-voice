/* globals intents, serviceList, content */

this.services.readerMode = (function() {
  class ReaderMode extends serviceList.Service {
    async pause() {
      await this.initTab("/services/spotify/player.js");
      await this.callTab("pause");
    }

    async unpause() {
      const activeTab = (await browser.tabs.query({ active: true }))[0];
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

    async pauseAny() {
      return intents.read.pauseAny();
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
