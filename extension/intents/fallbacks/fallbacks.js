import * as intentRunner from "../../background/intentRunner.js";
import { sendMessage } from "../../communicate.js";

intentRunner.registerIntent({
  name: "fallbacks.notImplemented",
  async run(context) {
    const message =
      context.parameters.message || "This action is not yet implemented.";
    await sendMessage({
      type: "displayFallback",
      message,
    });
  },
});
