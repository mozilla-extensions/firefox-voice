/* globals searching */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent({
    name: "navigate",
    examples: ["go to wikipedia"],
    match: `
    (bring me | go | navigate) (to | open | find | show me) [query]
    `,
    async run(desc) {
      const url = searching.googleSearchUrl(desc.slots.query, true);
      await browser.tabs.create({ url });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "navigate",
      });
    },
  });

  this.intentRunner.registerIntent({
    name: "search",
    examples: ["search for armadillo"],
    match: `
    (do a |) (search | query | find | find me | google | look up | lookup | look on | look for) (google | the web | the internet |) (for |) [query] (on the web |)
    `,
    async run(desc) {
      const cardData = await searching.ddgEntitySearch(desc.slots.query);
      if (!cardData) {
        // Default to Google Search
        const url = searching.googleSearchUrl(desc.slots.query, false);
        await browser.tabs.create({ url });
      } else {
        console.log("sending data to content script");
        desc.keepPopup();
        browser.runtime.sendMessage({
          sender: "navigation",
          type: "showCard",
          cardData,
        });
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "bangSearch",
    match: `
    (do a |) (search | query | look up | lookup | look on | look for) [service:serviceName] (for | for the |) [query]
    (do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for |) (the |) [query] on [service:serviceName]
    `,
    async run(desc) {
      const myurl = await searching.ddgBangSearchUrl(
        desc.slots.query,
        desc.slots.service
      );
      console.log("THE URL THAT I HAVE IS ", myurl);
      await browser.tabs.update({ url: myurl });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "find",
      });
    },
  });

  this.intentRunner.registerIntent({
    name: "amazonSearch",
    async run(desc) {
      const url = searching.amazonSearchUrl(desc.slots.query);
      await browser.tabs.create({ url });
    },
  });
})();
