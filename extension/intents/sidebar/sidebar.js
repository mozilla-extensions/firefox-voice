import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "sidebar.openSidebar",
  async run(context) {
    await browser.experiments.voice.openSidebar();
  },
});
