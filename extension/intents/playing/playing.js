/* globals searching */

this.intents.playing = (function() {
  this.intentRunner.registerIntent("play", async (desc) => {
    let playerTab;
    if (desc.slots.query) {
      // Multi-part execution task: will do magical IFL Google Search, then execute play once the page loads
      const googleQueryURL = searching.googleSearchUrl(desc.slots.query, true);
      playerTab = await browser.tabs.create({
        url: googleQueryURL,
      });
    } else {
      playerTab = await browser.tabs.getCurrent();
    }

    // get video content for the current tab
    setTimeout(async () => {
      await browser.tabs.executeScript(playerTab.id, {
        file: "/extension/intents/playing/playMedia.js",
      });
      // TODO: poll for playing, instead of timeout
    }, 3000);
  });

  this.intentRunner.registerIntent("pause", async (desc) => {
    const currentTab = await browser.tabs.getCurrent();
    // get video content for the current tab
    const result = await browser.tabs.executeScript(currentTab.id, {
      file: "/extension/intents/playing/pauseMedia.js",
    });
    console.log(result);
  });
})();
