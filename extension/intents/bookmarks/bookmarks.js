/* globals Fuse, log */

import * as pageMetadata from "../../background/pageMetadata.js";
import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "bookmarks.open",
  async run(context) {
    const bookmarks = await browser.bookmarks.search({});
    const bookmarksById = new Map();
    const bookmarkContent = [];
    for (const bookmark of bookmarks) {
      bookmarksById.set(bookmark.id, bookmark.url);
      bookmarkContent.push({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
      });
    }
    const fuseOptions = {
      id: "id",
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
    const fuse = new Fuse(bookmarkContent, fuseOptions);
    const matches = fuse.search(context.slots.query);
    log.debug("Bookmark matches:", matches);
    if (!matches.length) {
      const e = new Error("No matching bookmark found");
      e.displayMessage = "No matching bookmark found";
      throw e;
    }
    const id = matches[0].item;
    const url = bookmarksById.get(id);
    if (context.parameters.tab === "this") {
      const activeTab = await context.activeTab();
      await browser.tabs.update(activeTab.id, { url });
    } else {
      await browser.tabs.create({ url });
    }
  },
});

intentRunner.registerIntent({
  name: "bookmarks.create",
  async run(context) {
    const activeTab = await context.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const bookmarks = await browser.bookmarks.search({ url: metadata.url });
    if (!bookmarks.length) {
      await browser.bookmarks.create({
        title: metadata.title,
        url: metadata.url,
      });
    }
  },
});
