/* globals searching */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent("navigate", async (desc) => {
    const url = searching.googleSearchUrl(desc.slots.query, true);
    await browser.tabs.create({url});
    browser.runtime.sendMessage({
      type: "closePopup",
      sender: "navigate"
    });
  });

  this.intentRunner.registerIntent("search", async (desc) => {
    const url = searching.googleSearchUrl(desc.slots.query, false);
    await browser.tabs.create({url});
    browser.runtime.sendMessage({
      type: "closePopup",
      sender: "search"
    });
  });

  this.intentRunner.registerIntent("amazonSearch", async (desc) => {
    const url = searching.amazonSearchUrl(desc.slots.query);
    await browser.tabs.create({url});
    browser.runtime.sendMessage({
      type: "closePopup",
      sender: "amazonSearch"
    });
  });
})();
