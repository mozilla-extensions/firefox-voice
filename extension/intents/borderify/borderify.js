import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "borderify.open",
  async run() {
    browser.runtime.sendMessage("blue@mozilla.org", {
      type: "openExtension",
    });
  },
});
