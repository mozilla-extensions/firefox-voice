/* globals searching, log */

this.intents.playing = (function() {
  this.intentRunner.registerIntent({
    name: "playing.play",
    examples: ["play music on youtube"],
    match: `
    play [query]
    `,
    async run(desc) {
      let playerTab;
      if (desc.slots.query) {
        // Multi-part execution task: will do magical IFL Google Search, then execute play once the page loads
        let query = desc.slots.query;
        log.debug('Adding "youtube" to query:', query);
        if (!/youtube/i.test(query)) {
          query += " youtube";
        }
        const googleQueryURL = searching.googleSearchUrl(query, true);
        playerTab = await browser.tabs.create({
          url: googleQueryURL,
        });
      } else {
        playerTab = (await browser.tabs.query({ active: true }))[0];
      }

      // get video content for the current tab
      setTimeout(async () => {
        await browser.tabs.executeScript(playerTab.id, {
          file: "/intents/playing/playMedia.js",
        });
        // TODO: poll for playing, instead of timeout
      }, 3000);
    },
  });

  this.intentRunner.registerIntent({
    name: "playing.pause",
    match: `
    pause
    `,
    async run(desc) {
      const currentTab = (await browser.tabs.query({ active: true }))[0];
      // get video content for the current tab
      await browser.tabs.executeScript(currentTab.id, {
        file: "/intents/playing/pauseMedia.js",
      });
    },
  });
})();
