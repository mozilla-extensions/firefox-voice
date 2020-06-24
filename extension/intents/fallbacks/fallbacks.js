import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "fallbacks.notImplemented",
  async run(context) {
    const message =
      context.parameters.message || "This action is not yet implemented.";
    await browser.runtime.sendMessage({
      type: "displayFallback",
      message,
    });
  },
});