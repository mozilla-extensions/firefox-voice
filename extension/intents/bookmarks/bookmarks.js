/* globals Fuse, log */

import * as pageMetadata from "../../background/pageMetadata.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";

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
        title: bookmark.title.split(" "),
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
      const activeTab = await browserUtil.activeTab();
      await browser.tabs.update(activeTab.id, { url });
    } else {
      await browser.tabs.create({ url });
    }
  },
});

intentRunner.registerIntent({
  name: "bookmarks.create",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
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

intentRunner.registerIntent({
  name: "bookmarks.createInFolder",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const bookmarks = await browser.bookmarks.search({ url: metadata.url });
    if (bookmarks.length) {
      const exc = new Error("Bookmark already exists");
      exc.displayMessage = "Bookmark already exists";
      throw exc;
    }
    let folders = await browser.bookmarks.search({});
    folders = folders.filter(b => b.type === "folder");
    log.debug("Folder names:", folders.map(f => f.title));
    const folderContent = [];
    for (const folder of folders) {
      folderContent.push({
        id: folder.id,
        title: folder.title.split(" "),
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
      ],
    };
    const fuse = new Fuse(folderContent, fuseOptions);
    const matches = fuse.search(context.slots.folder);
    if (!matches.length) {
      const e = new Error("No matching folder found");
      e.displayMessage = `No folder named "${context.slots.folder}" found`;
      throw e;
    }
    const parentId = matches[0].item;
    await browser.bookmarks.create({
      title: metadata.title,
      url: metadata.url,
      parentId,
    });
  },
});

intentRunner.registerIntent({
  name: "bookmarks.remove",
  async run(context) {
    await context.presentMessage("Do you wish to remove this bookmark?");
    await context.startFollowup({
      heading: 'Say "YES" or "CANCEL"',
      insistOnFollowup: true,
    });
  },
  async runFollowup(context) {
    switch (context.parameters.confirmation) {
      case "false":
        await context.presentMessage("Command cancelled");
        await context.endFollowup();
        break;
      default:
        const activeTab = await browserUtil.activeTab();
        const metadata = await pageMetadata.getMetadata(activeTab.id);
        const bookmarks = await browser.bookmarks.search({ url: metadata.url });

        const selected = bookmarks.filter(
          bookmark => activeTab.url === bookmark.url
        );

        if (!selected.length) {
          context.presentMessage("");
          context.endFollowup();
          const e = new Error("This page wasn't bookmarked");
          e.displayMessage = "This page wasn't bookmarked";
          throw e;
        }

        await browser.bookmarks.remove(selected[0].id);
        await context.presentMessage("Bookmark has been removed");
        await context.endFollowup();
    }
  },
});
