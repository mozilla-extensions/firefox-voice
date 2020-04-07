import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "sidebar.openSidebar",
  async run(context) {
    const sidebar = context.parameters.sidebar;
    let name;
    if (sidebar === "bookmarks") {
      name = "Bookmark";
      await browser.experiments.voice.openBookmarksSidebar();
    } else {
      name = "History";
      await browser.experiments.voice.openHistorySidebar();
    }
    context.displayText(`${name} sidebar is opened`);
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
