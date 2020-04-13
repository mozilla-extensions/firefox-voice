import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "browser.bookmark",
  async run(context) {
    await browser.experiments.voice.showAllBookmarks();
  },
});

intentRunner.registerIntent({
  name: "browser.history",
  async run(context) {
    await browser.experiments.voice.showAllHistory();
  },
});

intentRunner.registerIntent({
  name: "browser.preferences",
  async run(context) {
    await browser.experiments.voice.openPreferences();
  },
});

intentRunner.registerIntent({
  name: "browser.addons",
  async run(context) {
    await browser.experiments.voice.browserOpenAddonsMgr();
  },
});
