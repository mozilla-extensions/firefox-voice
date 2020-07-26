import * as content from "../../background/content.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "scroll.up",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(
      activeTab.id,
      "intents/scroll/scrollHelper.content.js"
    );
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollUp" });
  },
});

intentRunner.registerIntent({
  name: "scroll.down",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(
      activeTab.id,
      "intents/scroll/scrollHelper.content.js"
    );
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollDown" });
  },
});

intentRunner.registerIntent({
  name: "scroll.top",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(
      activeTab.id,
      "intents/scroll/scrollHelper.content.js"
    );
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToTop" });
  },
});

intentRunner.registerIntent({
  name: "scroll.bottom",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(
      activeTab.id,
      "intents/scroll/scrollHelper.content.js"
    );
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToBottom" });
  },
});
