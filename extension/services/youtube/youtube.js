/* globals intents, serviceList, searching, content */

this.services.youtube = (function() {
  class YouTube extends serviceList.Service {
    async playQuery(query) {
      this.tab = await this.context.createTab({
        url: searching.googleSearchUrl(`${query} youtube.com`, true),
        active: true,
      });
      this.tabCreated = true;
      const isAudible = await this.pollTabAudible(this.tab.id, 2000);
      if (!isAudible) {
        this.context.failedAutoplay(this.tab);
      }
    }

    async pause() {
      await this.initTab("/services/youtube/player.js");
      await this.callTab("pause");
    }

    async unpause() {
      await this.initTab("/services/youtube/player.js");
      await this.callTab("unpause");
    }

    async pauseAny() {
      for (const tab of await this.getAllTabs({ audible: true })) {
        await content.lazyInject(tab.id, "/services/youtube/player.js");
        await this.callOneTab(tab.id, "pause");
      }
    }

    async move(direction) {
      if (direction === "previous") {
        const e = new Error("Cannot move to previous YouTube video");
        e.displayMessage = `YouTube cannot do "${this.context.utterance}"`;
        throw e;
      }
      let tabs = await this.getAllTabs({ audible: true });
      if (!tabs.length) {
        const currentTab = (await browser.tabs.query({ active: true }))[0];
        console.log("test", currentTab.url, this.baseUrl);
        if (currentTab.url.startsWith(this.baseUrl)) {
          tabs = [currentTab];
        } else {
          const e = new Error("YouTube is not playing");
          e.displayMessage = "YouTube is not playing";
          throw e;
        }
      }
      // FIXME: doing this on all audible tabs is odd, though any situation with multiple tabs here is odd
      for (const tab of tabs) {
        await content.lazyInject(tab.id, "/services/youtube/player.js");
        await this.callOneTab(tab.id, "move", { direction });
      }
    }
  }

  Object.assign(YouTube, {
    id: "youtube",
    title: "YouTube",
    baseUrl: "https://www.youtube.com",
    skipAutodetect: true,
  });

  intents.music.register(YouTube);
})();
