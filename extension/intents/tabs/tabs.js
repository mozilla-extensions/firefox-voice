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
})();
