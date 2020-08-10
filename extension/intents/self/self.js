import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";
import { timerController } from "../timer/timer.js";
import { sendMessage } from "../../communicate.js";
import * as settings from "../../settings.js";

intentRunner.registerIntent({
  name: "self.cancelIntent",
  async run(context) {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer !== null) {
      timerController.closeActiveTimer();
      const imageCard = "/assets/images/check-mark.png";
      const card = {
        answer: {
          imgSrc: `${imageCard}`,
          text: "Timer cancelled",
          eduText: `Click mic and say 'help' for things to say`,
        },
      };
      await sendMessage({
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
  name: "self.hello",
  async run(context) {
    const imageCard = "/assets/images/lionel-richie.jpg";
    const card = {
      answer: {
        imgSrc: `${imageCard}`,
        alt: "Lionel Richie",
        text: "Is it me you're looking for?",
        eduText: `Click mic and say 'help' for things to say`,
      },
    };
    await sendMessage({
      type: "showSearchResults",
      card,
      searchResults: card,
    });
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

intentRunner.registerIntent({
  name: "self.simpleTest",
  async run(context) {
    const imageCard = "./images/check-mark.png";
    const card = {
      answer: {
        imgSrc: `${imageCard}`,
        text: "Everything checks out",
        eduText: `Click mic and say 'help' for things to say`,
      },
    };
    await sendMessage({
      type: "showSearchResults",
      card,
      searchResults: card,
    });
  },
});

intentRunner.registerIntent({
  name: "self.helpIntent",
  async run(context) {
    await browserUtil.openOrActivateTab("/views/lexicon.html");
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/self/intentHelp.content.js",
    ]);
    const query = context.slots.query;
    const result = await browser.tabs.sendMessage(activeTab.id, {
      type: "focusField",
      query,
    });
    if (!result) {
      const exc = new Error("No Intent found");
      exc.displayMessage = `No matching Intent found for "${query}"`;
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "self.smartSpeaker",
  async run(context) {
    const userSettings = await settings.getSettings();
    const activate = context.parameters.activate === "true";
    userSettings.enableWakeword = activate;
    userSettings.speechOutput = activate;
    await settings.saveSettings(userSettings);
  },
});
