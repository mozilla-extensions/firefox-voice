import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "self.cancelIntent",
  async run(context) {
    context.done(0);
  },
});

intentRunner.registerIntent({
  name: "self.openLexicon",
  async run(context) {
    const imageCard = '../../assets/images/hello-card.jpg'
    const card = {
      answer: {
        largeText: `${imageCard}`,
        text: "Is it me you're looking for?",
        eduText: `Click mic and say 'help' for things to say`,
      },
    };
    await browser.runtime.sendMessage({
      type: "showSearchResults",
      card,
      searchResults: card,
    });
  },
});

intentRunner.registerIntent({
  name: "self.openOptions",
  async run(context) {
    await browser.tabs.create({
      url: browser.runtime.getURL("/options/options.html"),
    });
  },
});

intentRunner.registerIntent({
  name: "self.openIntentViewer",
  async run(context) {
    await browser.tabs.create({
      url: browser.runtime.getURL("/tests/intent-viewer.html"),
    });
  },
});

intentRunner.registerIntent({
  name: "self.tellJoke",
  async run(context) {
    await browser.tabs.create({
      url: browser.runtime.getURL(
        "https://www.youtube.com/watch?v=N3jx4WIUYy4"
      ),
    });
  },
});
