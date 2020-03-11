import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "print.print",
  async run(context) {
    await browser.tabs.print();
  },
});
