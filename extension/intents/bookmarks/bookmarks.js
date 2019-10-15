/* globals Fuse, log */

this.intents.bookmarks = (function() {
  this.intentRunner.registerIntent({
    name: "bookmarks.open",
    examples: ["Open news bookmark"],
    match: `
    open [query] bookmark in (this | current |) tab [tab=this]
    open bookmark [query] in (this | current |) tab [tab=this]
    open [query] bookmark in new (tab |)
    open bookmark [query] in new (tab |)
    open [query] bookmark
    open bookmark [query]
    `,
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
        const activeTab = (await browser.tabs.query({ active: true }))[0];
        await browser.tabs.update(activeTab.id, { url });
      } else {
        await browser.tabs.create({ url });
      }
    },
  });
})();
