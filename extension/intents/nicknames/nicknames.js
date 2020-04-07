/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as pageMetadata from "../../background/pageMetadata.js";

intentRunner.registerIntent({
  name: "nicknames.name",
  async run(context) {
    const intents = intentRunner.getIntentHistory();
    if (!(intents[intents.length - 1] && intents[intents.length - 2])) {
      const exc = new Error("No last intent");
      exc.displayMessage = "No previous intent available to name";
      throw exc;
    }
    if (intents[intents.length - 1].name !== "nicknames.name") {
      throw new Error("Expected previous intent to be nicknames.name");
    }
    const intent = intents[intents.length - 2];
    intentRunner.registerNickname(context.slots.name, intent);
  },
});

intentRunner.registerIntent({
  name: "nicknames.remove",
  async run(context) {
    const intents = intentRunner.getRegisteredNicknames();
    const name = context.slots.name.toLowerCase();
    if (!intents[name]) {
      const exc = new Error("No named intent to remove");
      exc.displayMessage = `No nickname "${name}" found`;
      throw exc;
    }
    intentRunner.registerNickname(name, null);
  },
});

const numberNames = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function parseNumber(n) {
  n = n.toLowerCase();
  if (numberNames[n]) {
    return numberNames[n];
  }
  const number = parseInt(n, 10);
  if (Math.isNaN(number)) {
    throw new Error(`Cannot understand number: ${n}`);
  }
  return number;
}

function makeCombinedContext(contexts, nickname) {
  return new intentRunner.IntentContext({
    name: "nicknames.combined",
    nickname,
    contexts,
    slots: {},
    parameters: {},
    utterance: `Combined actions named ${nickname}`,
    fallback: false,
  });
}

intentRunner.registerIntent({
  name: "nicknames.nameLast",
  async run(context) {
    // FIXME: this should not created a nicknames.combined context if the number is 1
    const name = context.slots.name.toLowerCase();
    const number = parseNumber(context.slots.number);
    const history = intentRunner.getIntentHistory().slice(-number - 1, -1);
    if (history.length < number) {
      const exc = new Error("Not enough history to save");
      exc.displayMessage = `There are not ${number} things to name (there are only ${history.length})`;
      throw exc;
    }
    const newContext = makeCombinedContext(history, name);
    intentRunner.registerNickname(name, newContext);
    log.info(
      "Created combined nickname",
      name,
      "->",
      history.map(c => c.name).join(", ")
    );
  },
});

intentRunner.registerIntent({
  name: "nicknames.combined",
  async run(context) {
    log.info(`Running a named series (${context.contexts.length}) of intents`);
    for (let subcontext of context.contexts) {
      subcontext = new intentRunner.IntentContext(subcontext);
      log.info(
        "  Running subintent",
        subcontext,
        subcontext.name,
        subcontext.slots
      );
      let hadError = false;
      subcontext.onError = () => {
        hadError = true;
      };
      await intentRunner.runIntent(subcontext);
      if (hadError) {
        log.info("  Last intent failed, stopping");
        break;
      }
    }
  },
});

intentRunner.registerIntent({
  name: "nicknames.namePage",
  async run(context) {
    const name = context.slots.name.toLowerCase();
    const activeTab = await context.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const result = await browser.storage.sync.get("pageNames");
    const pageNames = result.pageNames || {};
    pageNames[name] = metadata.url;
    log.info("Added page name", name);
    await browser.storage.sync.set({ pageNames });
  },
});

intentRunner.registerIntent({
  name: "nicknames.removePageName",
  async run(context) {
    const result = await browser.storage.sync.get("pageNames");
    const pageNames = result.pageNames || {};
    const getName = async () => {
      const activeTab = await context.activeTab();
      const metadata = await pageMetadata.getMetadata(activeTab.id);
      return Object.keys(pageNames).find(
        key => pageNames[key] === metadata.url
      );
    };
    const name = context.slots.name || (await getName());
    if (!name) {
      const exc = new Error("No page name to remove");
      exc.displayMessage = `This page does not have a name`;
      throw exc;
    }
    if (!pageNames[name]) {
      const exc = new Error("No page name to remove");
      exc.displayMessage = `No page name "${name}" found`;
      throw exc;
    }
    delete pageNames[name];
    log.info("Removed page name", name);
    await browser.storage.sync.set({ pageNames });
  },
});
