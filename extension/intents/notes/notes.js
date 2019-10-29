/* globals content, pageMetadata */

this.intents.notes = (function() {
  let writingTabId;

  const SCRIPT = "/intents/notes/contentScript.js";

  async function checkHasTab() {
    if (!writingTabId) {
      const e = new Error("No writing tab");
      e.displayMessage = 'You must use "Write notes here"';
      throw e;
    }
    const available = await content.hasScript(writingTabId, SCRIPT);
    if (!available) {
      const e = new Error("Writing tab no longer active");
      e.displayMessage =
        'The writing tab has changed, use "show notes" and "write notes here"';
      throw e;
    }
  }

  this.intentRunner.registerIntent({
    name: "notes.setPlace",
    description:
      "Indicate where note should be written, both the tab and the element on the tab where text will go",
    examples: ["Write notes here"],
    match: `
    (add | make) note{s} (here | this page | this tab) (for me |)
    write (note{s} |) (here | this page | this tab) (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      const tabId = activeTab.id;
      await content.lazyInject(tabId, SCRIPT);
      const failureMessage = await browser.tabs.sendMessage(tabId, {
        type: "setPlace",
      });
      if (failureMessage) {
        const e = new Error("Failed to find place to write");
        e.displayMessage = failureMessage;
        throw e;
      }
      writingTabId = tabId;
    },
  });

  this.intentRunner.registerIntent({
    name: "notes.addLink",
    description: "Add to the note with the link and title of the current tab",
    examples: ["Make note of this page"],
    match: `
    (make | add | write |) note{s} (of | about |) (this |) (page | tab | link) (for me |)
    `,
    async run(context) {
      await checkHasTab();
      const activeTab = await context.activeTab();
      const metadata = await pageMetadata.getMetadata(activeTab.id);
      const success = await browser.tabs.sendMessage(writingTabId, {
        type: "addLink",
        metadata,
      });
      if (!success) {
        const e = new Error("Could not add link");
        e.displayMessage = "Could not add link";
        throw e;
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "notes.add",
    description: "Add to the note with the given text",
    examples: ["Add note stuff to remember"],
    match: `
    (make | add | write) note{s} (about |) [text] (for me |)
    `,
    async run(context) {
      await checkHasTab();
      const success = await browser.tabs.sendMessage(writingTabId, {
        type: "addText",
        text: context.slots.text,
      });
      if (!success) {
        const e = new Error("Could not add text");
        e.displayMessage = "Could not add text";
        throw e;
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "notes.show",
    description:
      "Focus the tab previously indicated as being the place to write notes",
    examples: ["Show notes"],
    match: `
    (show | focus | activate | read) (the |) note{s} (for me |)
    `,
    async run(context) {
      if (!writingTabId) {
        const e = new Error("No writing tab");
        e.displayMessage = "You have not set a tab to write";
        throw e;
      }
      await context.makeTabActive(writingTabId);
    },
  });
})();
