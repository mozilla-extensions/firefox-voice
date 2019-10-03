/* globals searching, serviceList */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent({
    name: "navigation.navigate",
    examples: ["Go to the New York Times", "Show me the 49ers schedule"],
    match: `
    (bring me | go | navigate | show me) (to | open | find |) [query]
    `,
    async run(context) {
      const url = searching.googleSearchUrl(context.slots.query, true);
      await context.createTab({ url });
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
    async run(context) {
      const cardData = await searching.ddgEntitySearch(context.slots.query);
      if (!cardData) {
        // Default to Google Search
        const url = searching.googleSearchUrl(context.slots.query, false);
        await context.createTab({ url });
      } else {
        context.showCard(cardData);
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "navigation.bangSearch",
    match: `
    (do a |) (search on | query on | lookup on | look up on | look on | look in | look up in | lookup in) (my |) [service:serviceName] (for | for the |) [query]
    (do a |) (search | query ) my [service:serviceName] (for | for the |) [query]
    (do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:serviceName]
    `,
    examples: [
      "Search my Gmail for tickets to Hamilton",
      "Look up The Book Thief on GoodReads",
      "Search CSS grid on MDN",
      "Look up Hamilton in Gmail",
    ],
    async run(context) {
      const myurl = await searching.ddgBangSearchUrl(
        context.slots.query,
        context.slots.service
      );
      context.addTelemetryServiceName(
        `ddg:${serviceList.ddgBangServiceName(context.slots.service)}`
      );
      await context.createTab({ url: myurl });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "find",
      });
    },
  });
})();
