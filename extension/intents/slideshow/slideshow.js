import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";

const SLIDESHOW_SCRIPT = "/intents/slideshow/contentScript.js";

intentRunner.registerIntent({
  name: "slideshow.open",
  async run(context) {
    const activeTab = await context.activeTab();
    const activeTabId = activeTab.id;
    await content.lazyInject(activeTabId, SLIDESHOW_SCRIPT);

    const success = await browser.tabs.sendMessage(activeTabId, {
      type: "openSlide",
    });

    if (!success) {
      const err = new Error("Could not open slideshow");
      err.displayMessage = "Could not open slideshow";
      throw err;
    }
  },
});
