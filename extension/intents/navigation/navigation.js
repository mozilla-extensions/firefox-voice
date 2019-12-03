/* globals searching, serviceList, pageMetadata, languages */

this.intents.navigation = (function() {
  this.intentRunner.registerIntent({
    name: "navigation.navigate",
    description:
      "Navigate directly to a site, using Google's I'm Feeling Luck and the query",
    examples: ["Go to the New York Times", "Show me the 49ers schedule"],
    match: `
    (bring me | go | navigate | show me) (to | open | find |) [query]
    `,
    async run(context) {
      await context.createTabGoogleLucky(context.slots.query);
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "navigate",
      });
    },
  });

  this.intentRunner.registerIntent({
    name: "navigation.bangSearch",
    description:
      "Search a specific service, using their site-specific search page",
    match: `
    google images (of | for |) [query] [service=images]
    images (of | for) [query] [service=images]
    (do a |) (search | search on | query on | lookup on | look up on | look on | look in | look up in | lookup in) (my |) [service:serviceName] (for | for the |) [query] (for me |)
    (do a |) (search | query ) my [service:serviceName] (for | for the |) [query] (for me|)
    (do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:serviceName] (for me |)
    `,
    examples: [
      "Search my Gmail for tickets to Hamilton",
      "Look up The Book Thief on GoodReads",
      "Search CSS grid on MDN",
      "Look up Hamilton in Gmail",
      "Images of sparrows",
      "test:search google images of sparrows for me",
    ],
    async run(context) {
      const service = context.slots.service || context.parameters.service;
      const myurl = await searching.ddgBangSearchUrl(
        context.slots.query,
        service
      );
      context.addTelemetryServiceName(
        `ddg:${serviceList.ddgBangServiceName(service)}`
      );
      await context.createTab({ url: myurl });
      browser.runtime.sendMessage({
        type: "closePopup",
        sender: "find",
      });
    },
  });

  this.intentRunner.registerIntent({
    name: "navigation.translate",
    description:
      "Translate the given page to the chosen language, using Google Translate",
    match: `
    translate (this |) (page | tab | article | site |) (to english |) (for me |)
    translate (this |) (page | tab | article | site |) to [language:lang] (for me |)
    `,
    examples: [
      "test:translate this page to Spanish",
      "test:translate this page to Dutch",
    ],
    async run(context) {
      const language = context.slots.language || "en";
      const tab = await context.activeTab();
      const translation = `https://translate.google.com/translate?hl=&sl=auto&tl=${
        languages.languageCodes[language]
      }&u=${encodeURIComponent(tab.url)}`;
      browser.tabs.update(tab.id, { url: translation });
    },
  });

  this.intentRunner.registerIntent({
    name: "navigation.translateSelection",
    description:
      "Translate whatever text is selected to English, using Google Translate",
    match: `
    translate (this |) selection (to english |) (for me |)
    translate (this |) selection to [language:lang] (for me |)
    `,
    examples: [
      "Translate selection",
      "test:translate this selection to Hungarian",
      "test:translate this selection to Slovak",
    ],
    async run(context) {
      const language = context.slots.language || "en";
      const tab = await context.activeTab();
      const selection = await pageMetadata.getSelection(tab.id);
      if (!selection || !selection.text) {
        const e = new Error("No text selected");
        e.displayMessage = "No text selected";
        throw e;
      }
      const url = `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${
        languages.languageCodes[language]
      }&text=${encodeURIComponent(selection.text)}`;
      await browser.tabs.create({ url });
    },
  });
})();
