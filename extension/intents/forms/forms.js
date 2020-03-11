import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";

intentRunner.registerIntent({
  name: "forms.dictate",
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, [
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, {
      type: "enterText",
      text: context.slots.text,
    });
  },
});

intentRunner.registerIntent({
  name: "forms.focusField",
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    const label = context.slots.label;
    const result = await browser.tabs.sendMessage(activeTab.id, {
      type: "focusField",
      label,
    });
    if (!result) {
      const exc = new Error("No field found");
      exc.displayMessage = `No field matching "${label}" found`;
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "forms.focusNext",
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, { type: "focusNext" });
  },
});

intentRunner.registerIntent({
  name: "forms.focusPrevious",
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, { type: "focusPrevious" });
  },
});
