this.intents.tabs = (function() {
  this.intentRunner.registerIntent({
    name: "tabs.close",
    description: "Closes the current tab",
    examples: ["close tab"],
    match: `
    close (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.remove(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.open",
    description: "Opens a new (blank) tab",
    examples: ["open tab", "test:open top for me", "test:open the tab"],
    match: `
    open tab
    open (a |) (new | blank |) tab (for me|)
    new (blank |) tab
    `,
    async run(context) {
      await context.createTab({ active: true });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.pin",
    description: "Pins the current tab",
    examples: ["pin tab", "test:pin tap"],
    match: `
    pin (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.update(activeTab.id, { pinned: true });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.unpin",
    description: "Unpins the current tab",
    examples: ["unpin tab"],
    match: `
    unpin (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.update(activeTab.id, { pinned: false });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.saveAsPdf",
    description: "Saves the current tab as a PDF file",
    examples: ["Save as PDF"],
    match: `
    save (this | current |) (tab |) (as |) pdf (for me |)
    `,
    async run(context) {
      // This could return:
      // "saved"
      // "replaced"
      // "canceled"
      // "not_saved"
      // "not_replaced"
      await browser.tabs.saveAsPDF({});
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.reload",
    description: "Reload the active tab of the current window",
    examples: ["reload this page"],
    match: `
    (reload | refresh) (this | current |) (tab | page |) (for me |)
    `,
    async run(context) {
      await browser.tabs.reload();
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.duplicate",
    description: "Duplicates a tab",
    examples: ["Duplicate this page"],
    match: `
    duplicate (this | current |) (tab | page |) (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.duplicate(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.openWindow",
    description: "Opens a new (blank) window",
    examples: ["open window"],
    match: `
    open window
    open (a |) (new | blank |) window (for me|)
    new (blank |) window
    `,
    async run(context) {
      await browser.windows.create({});
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.openPrivateWindow",
    description: "Opens a new private window",
    examples: ["open private window"],
    match: `
    open (a |) (new | blank |) (private | incognito) window (for me|)
    new (private | incognito) window
    `,
    async run(context) {
      const isAllowed = browser.extension.isAllowedIncognitoAccess();
      if (isAllowed === true) {
        await browser.windows.create({ incognito: true });
      } else {
        const e = new Error("Failed to open private window");
        e.displayMessage =
          "Extension does not have permission for incognito mode";
        throw e;
      }
    },
  });
})();
