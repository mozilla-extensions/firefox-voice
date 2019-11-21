/* globals Fuse, log, intents */

this.intents.find = (function() {
  this.intentRunner.registerIntent({
    name: "find.find",
    description:
      "Find the open tab that matches the query (searching the title, URL, and page content), and make that tab (and window) active",
    examples: ["Find calendar tab", "test:go to my calendar"],
    match: `
    (find | bring me to) (my | the |) [query] (tab |)
    (find | open | focus | show) tab [query]
    go (to | to the |) [query] tab
    go to my [query]
    focus [query] (tab |)
    `,
    async run(context) {
      const query = context.slots.query;
      log.info("the most likely query text is:", query);

      // Fuse options
      const options = {
        id: "tabId",
        shouldSort: true,
        tokenize: true,
        findAllMatches: true,
        includeScore: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: [
          {
            name: "title",
            weight: 0.8,
          },
          {
            name: "url",
            weight: 0.2,
          },
        ],
      };

      let combinedTabContent = [];

      const tabs = await browser.tabs.query({});

      for (const tab of tabs) {
        // Don't include the active tab:
        if (tab.active || intents.search.isSearchTab(tab)) {
          continue;
        }
        const result = {
          tabId: tab.id,
          title: tab.title,
          url: tab.url,
        };

        combinedTabContent.push(result);
      }

      combinedTabContent = combinedTabContent.flat();

      // use Fuse.js to parse the most probable response?
      const fuse = new Fuse(combinedTabContent, options);
      const matches = fuse.search(query);
      log.debug("find matches:", matches);
      // TODO account for multiple matches
      if (!matches.length) {
        const e = new Error("No matching tab found");
        e.displayMessage = "No matching tab found";
        throw e;
      }
      const topMatch = parseInt(matches[0].item);
      await context.makeTabActive(topMatch);
    },
  });
})();
