import * as music from "../../intents/music/music.js";
import * as read from "../../intents/read/read.js";
import * as serviceList from "../../background/serviceList.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

class ReaderMode extends serviceList.Service {
  async pause() {
    await this.initTab("/services/spotify/player.content.js");
    await this.callTab("pause");
  }

  async unpause() {
    const activeTab = await browserUtil.activeTab();
    if (!activeTab.url.startsWith("about:reader")) {
      const e = new Error("Cannot unpause a non-reader tab");
      e.displayMessage = "Cannot unpause";
      throw e;
    }
    await content.inject(
      activeTab.id,
      "/intents/read/startNarration.content.js"
    );
    await this.callOneTab(activeTab.id, "narrate");
  }

  async pauseAny(options) {
    return read.pauseAny(options);
  }
}

Object.assign(ReaderMode, {
  id: "readerMode",
  title: "Reader Mode",
  baseUrl: "about:reader",
  skipAutodetect: true,
});

music.register(ReaderMode);
