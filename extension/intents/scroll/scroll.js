import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "scroll.up",
  async run(context) {
    await browser.experiments.voice.doCommand("cmd_scrollPageUp");
  },
});

intentRunner.registerIntent({
  name: "scroll.down",
  async run(context) {
    await browser.experiments.voice.doCommand("cmd_scrollPageDown");
  },
});

intentRunner.registerIntent({
  name: "scroll.top",
  async run(context) {
    await browser.experiments.voice.doCommand("cmd_scrollTop");
  },
});

intentRunner.registerIntent({
  name: "scroll.bottom",
  async run(context) {
    await browser.experiments.voice.doCommand("cmd_scrollBottom");
  },
});
