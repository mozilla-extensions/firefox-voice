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
    examples: ["open tab"],
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
    examples: ["pin tab"],
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
})();
