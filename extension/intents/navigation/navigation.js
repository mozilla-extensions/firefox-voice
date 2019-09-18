/* globals searching, services */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent({
    name: "navigation.navigate",
    examples: ["Go to the New York Times", "Show me the 49ers schedule"],
    match: `
    (bring me | go | navigate | show me) (to | open | find |) [query]
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
    name: "navigation.search",
    examples: ["Search for hiking in Denver", "Look up recipes for fish tacos"],
    match: `
    (do a |) (search | query | find | find me | google | look up | lookup | look on | look for) (google | the web | the internet |) (for |) [query] (on the web |)
    `,
    priority: "low",
    async run(desc) {
      const cardData = await searching.ddgEntitySearch(desc.slots.query);
      if (!cardData) {
        // Default to Google Search
        const url = searching.googleSearchUrl(desc.slots.query, false);
        await browser.tabs.create({ url });
      } else {
        desc.showCard(cardData);
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "navigation.bangSearch",
    match: `
    (do a |) (search | query | look up | lookup | look on | look for) (my |) [service:serviceName] (for | for the |) [query]
    (do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for |) (the |) [query] on [service:serviceName]
    `,
    examples: [
      "Search my Gmail for tickets to Hamilton",
      "Look up The Book Thief on GoodReads",
      "Search CSS grid on MDN",
    ],
    async run(desc) {
      const myurl = await searching.ddgBangSearchUrl(
        desc.slots.query,
        desc.slots.service
      );
      desc.addTelemetryServiceName(
        `ddg:${services.ddgBangServiceName(desc.slots.service)}`
      );
      await browser.tabs.update({ url: myurl });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "find",
      });
    },
  });
})();
