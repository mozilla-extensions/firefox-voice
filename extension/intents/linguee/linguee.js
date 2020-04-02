/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as searching from "../../searching.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../browserUtil.js";

intentRunner.registerIntent({
  name: "linguee.say",
  async run(context) {
    const myurl = await searching.ddgBangSearchUrl(
      context.slots.query,
      "linguee"
    );

    const lingueeTab = await context.createTab({ url: myurl });
    log.info(lingueeTab);

    await browserUtil.loadUrl(lingueeTab.id, myurl);

    const search = await content.lazyInject(lingueeTab.id, [
      "/intents/linguee/contentScript.js",
    ]);
    log.info(search);
    await browser.tabs.sendMessage(lingueeTab.id, { type: "sayWord" });

    /*  window.addEventListener("load", event => {
      const button = document.querySelectorAll("audio");
      log.info(button[0]);
    }); */

    /*     if (!button[0]) {
      const e = new Error(`Could not find audio for ${button}`);
      e.name = "AudioNotFound";
      throw e;
    }
    button[0].click(); */
  },
});
