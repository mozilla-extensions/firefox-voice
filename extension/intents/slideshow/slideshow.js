import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";

const SLIDESHOW_SCRIPT = "/intents/slideshow/contentScript.js";
const PRESENTATION_SCRIPT = "/intents/slideshow/presentationScript.js";

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

intentRunner.registerIntent({
  name: "slideshow.startPresentation",
  async run(context) {
    const activeTab = await context.activeTab();
    const activeTabId = activeTab.id;

    // confirm we are on a google slide page
    if (!/^https:\/\/docs.google.com\/presentation/.test(activeTab.url)) {
      const err = new Error("Not a valid google slide presentation");
      err.displayMessage = "Not a valid google slide presentation";
      throw err;
    }

    await content.lazyInject(activeTabId, PRESENTATION_SCRIPT);

    const result = await browser.tabs.sendMessage(activeTabId, {
      type: "startPresentation",
    });

    if (!result.success) {
      const err = new Error(result.message);
      err.displayMessage = result.message;
      throw err;
    }
  },
});
