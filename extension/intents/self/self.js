import * as intentRunner from "../../background/intentRunner.js";
import * as browserUtil from "../../browserUtil.js";
import { timerController } from "../timer/timer.js";

intentRunner.registerIntent({
  name: "self.cancelIntent",
  async run(context) {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer !== null) {
      timerController.closeActiveTimer();
      const imageCard = "../../assets/images/check-mark.png";
      const card = {
        answer: {
          imgSrc: `${imageCard}`,
          text: "Timer cancelled",
          eduText: `Click mic and say 'help' for things to say`,
        },
      };
      await browser.runtime.sendMessage({
        type: "showSearchResults",
        card,
        searchResults: card,
      });
    }
    context.done(0);
  },
});

intentRunner.registerIntent({
  name: "self.openLexicon",
  async run(context) {
    await browserUtil.openOrActivateTab("/views/lexicon.html");
  },
});

intentRunner.registerIntent({
  name: "self.openOptions",
  async run(context) {
    await browserUtil.openOrActivateTab("/options/options.html");
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
