/* globals content */

this.intentRunner.registerIntent({
  name: "scroll.up",
  description: "Scroll the current page up",
  examples: ["Scroll up"],
  match: `
    scroll (this |) (tab | page | article |) (up | upward)
    page up
  `,
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollUp" });
  },
});

this.intentRunner.registerIntent({
  name: "scroll.down",
  description: "Scroll the current page down",
  examples: ["Scroll down"],
  match: `
    scroll (this |) (tab | page | article |) (down | downward)
    page down
  `,
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollDown" });
  },
});

this.intentRunner.registerIntent({
  name: "scroll.top",
  description: "Scroll the current page all the way to the top",
  examples: ["Scroll all the way up"],
  match: `
        scroll (this |) (tab | page | article |) all the way (up | upward) (to the top |)
        scroll (this |) (tab | page | article |) (all the way | back |) to (the |) (very |) (top | beginning)
        page all the way (up | to the top | to top)
      `,
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToTop" });
  },
});

this.intentRunner.registerIntent({
  name: "scroll.bottom",
  description: "Scroll the current page all the way to the bottom",
  examples: ["Scroll all the way down"],
  match: `
        scroll (this |) (tab | page | article |) all the way (down | downward |) (to the bottom |)
        scroll (this |) (tab | page | article |) (all the way |) to (the |) (very |) (bottom | end)
        page all the way (down | to the bottom | to bottom)
      `,
  async run(context) {
    const activeTab = await context.activeTab();
    await content.lazyInject(activeTab.id, "intents/scroll/scrollHelper.js");
    await browser.tabs.sendMessage(activeTab.id, { type: "scrollToBottom" });
  },
});
