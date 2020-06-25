import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "pocket.open",
  async run(context) {
    const url = "https://app.getpocket.com/";
    await browserUtil.openOrFocusTab(url);
  },
});

intentRunner.registerIntent({
  name: "pocket.save",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    const url = `https://getpocket.com/save?url=${encodeURIComponent(
      activeTab.url
    )}`;
    await browserUtil.createTab({ url, openerTabId: activeTab.id });
  },
});
