/* globals */

import * as intentRunner from "../../background/intentRunner.js";
import * as searching from "../../searching.js";
import * as content from "../../background/content.js";

intentRunner.registerIntent({
  name: "linguee.say",
  async run(context) {
    const myurl = await searching.ddgBangSearchUrl(
      context.slots.query,
      "linguee"
    );
    const lingueeTab = await context.createTab({ url: myurl });
    await content.lazyInject(lingueeTab.id, [
      "/intents/linguee/lingueeContentScript.js",
    ]);
    await browser.tabs.sendMessage(lingueeTab.id, { type: "sayWord" });
  },
});
