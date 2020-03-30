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
