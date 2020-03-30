import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "browser.bookmark",
  async run(context) {
    await browser.experiments.voice.showAllBookmarks();
  },
});
