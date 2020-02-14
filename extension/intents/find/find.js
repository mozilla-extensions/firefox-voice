/* globals Fuse, log */

import * as intentRunner from "../../background/intentRunner.js";
import { isSearchTab } from "../search/search.js";

intentRunner.registerIntent({
  name: "find.find",
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
      if (tab.active || isSearchTab(tab)) {
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
