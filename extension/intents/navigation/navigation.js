/* globals searching */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent("navigate", async desc => {
    const url = searching.googleSearchUrl(desc.slots.query, true);
    await browser.tabs.create({url});
    browser.runtime.sendMessage({
      type: "closePopup",
      sender: "navigate"
    });
  });

  this.intentRunner.registerIntent("search", async desc => {
    const cardData = await searching.ddgEntitySearch(desc.slots.query);
    if (!cardData) {
      // Default to Google Search
      const url = searching.googleSearchUrl(desc.slots.query, false);
      await browser.tabs.create({ url: url });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "search"
      });
    } else {
      console.log("sending data to content script");
      browser.runtime.sendMessage({
        sender: "navigation",
        action: "showCard",
        cardData,
      });
    }
  });

  async function bangSearch(desc) {
    const myurl = await searching.ddgBangSearchUrl(
      desc.slots.query,
      desc.slots.service
    );
    console.log("THE URL THAT I HAVE IS ", myurl);
    await browser.tabs.update({ url: myurl });
  }

  this.intentRunner.registerIntent("bangSearch", async desc => {
    await bangSearch(desc);
  });

  this.intentRunner.registerIntent("bangSearchAlt", async desc => {
    await bangSearch(desc);
  });

  this.intentRunner.registerIntent("amazonSearch", async desc => {
    const url = searching.amazonSearchUrl(desc.slots.query);
    await browser.tabs.create({url});
    browser.runtime.sendMessage({
      type: "closePopup",
      sender: "amazonSearch"
    });
  });
})();
