import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";

const SLIDESHOW_SCRIPT = "/intents/slideshow/contentScript.js";
const SLIDESHOW_CSS = "/intents/slideshow/contentScript.css";

intentRunner.registerIntent({
  name: "slideshow.open",
  async run(context) {
    const activeTab = await context.activeTab();
    const activeTabId = activeTab.id;
    await content.lazyInject(activeTabId, SLIDESHOW_SCRIPT);
    await browser.tabs.insertCSS(activeTabId, { file: SLIDESHOW_CSS });
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
