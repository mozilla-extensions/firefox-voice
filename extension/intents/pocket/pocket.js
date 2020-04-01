import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "pocket.open",
  async run(context) {
    const url = "https://app.getpocket.com/";
    await context.openOrFocusTab(url);
  },
});

intentRunner.registerIntent({
  name: "pocket.save",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.lazyInject(activeTab.id, [
      "/intents/pocket/contentScript.js",
    ]);
  },
});
