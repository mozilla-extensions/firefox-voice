import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "sidebar.openSidebar",
  async run(context) {
    const query = context.slots.query.toLowerCase();
    if (query === "bookmarks") {
      await browser.experiments.voice.openBookmarksSidebar();
    } else {
      await browser.experiments.voice.openHistorySidebar();
    }
    context.displayText(`${query} is opened`);
  },
});

intentRunner.registerIntent({
  name: "sidebar.closeSidebar",
  async run(context) {
    await browser.experiments.voice.closeSidebar();
  },
});

intentRunner.registerIntent({
  name: "sidebar.toggleSidebar",
  async run(context) {
    await browser.experiments.voice.toggleSidebar();
  },
});
