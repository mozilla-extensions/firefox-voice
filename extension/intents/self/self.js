this.intents.read = (function() {
  this.intentRunner.registerIntent({
    name: "self.cancelIntent",
    match: `
    cancel
    nevermind
    never mind
    `,
    async run(context) {
      context.done(0);
    },
  });

  this.intentRunner.registerIntent({
    name: "self.openLexicon",
    examples: ["Tell me about Firefox Voice", "Help", "What can I do?"],
    match: `
    tell me about (this | firefox voice | this extension | voice)
    help
    what can I do
    `,
    async run(context) {
      await browser.tabs.create({
        url: browser.runtime.getURL("/views/lexicon.html"),
      });
    },
  });
})();
