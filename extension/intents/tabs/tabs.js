this.intents.tabs = (function() {
  this.intentRunner.registerIntent({
    name: "tabs.close",
    examples: ["close tab"],
    match: `
    close tab
    close this tab
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.remove(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.open",
    examples: ["open tab"],
    match: `
    open tab
    open (a |) (new | blank |) tab
    `,
    async run(context) {
      await context.createTab({ active: true });
    },
  });
})();
