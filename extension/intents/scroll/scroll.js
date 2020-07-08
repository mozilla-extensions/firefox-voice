import * as content from "../../background/content.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "scroll.up",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollUp" });
  },
});

intentRunner.registerIntent({
  name: "scroll.down",
  async run(context) {
    const activeTab = await context.activeTab();
    console.log("sending...", typeof activeTab.id, activeTab.id);
    await browser.experiments.voice.sendKeyboardEvent(activeTab.id, {
      key: "PageDown",
      code: "PageDown",
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
      isComposing: false,
    });
    /*
    await content.lazyInject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollDown" });
    */
  },
});

intentRunner.registerIntent({
  name: "scroll.top",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToTop" });
  },
});

intentRunner.registerIntent({
  name: "scroll.bottom",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToBottom" });
  },
});
