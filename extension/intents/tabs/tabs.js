this.intents.tabs = (function() {
  this.intentRunner.registerIntent({
    name: "tabs.close",
    examples: ["close tab"],
    match: `
    close tab
    close this tab
    `,
    async run(desc) {
      const activeTab = (await browser.tabs.query({ active: true }))[0];
      await browser.tabs.remove(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.open",
    examples: ["open tab"],
    match: `
    open tab
    open a blank tab
    open a new tab
    `,
    async run(desc) {
      await browser.tabs.create({ active: true });
    },
  });
})();
