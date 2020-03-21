import * as pageMetadata from "../../background/pageMetadata.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";

intentRunner.registerIntent({
    name: "pocket.open",
    async run(context) {
        const url = "https://app.getpocket.com/";
        await context.createTab({ url });
    }
});

intentRunner.registerIntent({
    name: "pocket.save",
    async run(context) {
      const activeTab = await context.activeTab();
      const metadata = await pageMetadata.getMetadata(activeTab.id);
      await content.lazyInject(activeTab.id, [
        "/background/pageMetadata-contentScript.js",
        "/intents/pocket/pocketContentScript.js"
      ]);
      await browser.tabs.sendMessage(activeTab.id, {
        type: "save",
        url: metadata.url,
      });
    },
});



