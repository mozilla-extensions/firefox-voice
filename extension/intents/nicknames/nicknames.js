/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as pageMetadata from "../../background/pageMetadata.js";
import English from "../../language/langs/english.js";
import * as browserUtil from "../../browserUtil.js";
import { RoutineExecutor } from "./routineExecutor.js";

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
    const number = English.nameToNumber(context.slots.number);
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
    const routineExecutor = new RoutineExecutor(
      context.nickname,
      context.contexts
    );
    await routineExecutor.run();
  },
});

intentRunner.registerIntent({
  name: "nicknames.namePage",
  async run(context) {
    const name = context.slots.name.toLowerCase();
    const activeTab = await browserUtil.activeTab();
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
      const activeTab = await browserUtil.activeTab();
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

intentRunner.registerIntent({
  name: "nicknames.pause",
  async run(context) {
    if (context.routineExecutor === undefined) {
      const exc = new Error("Command not available.");
      exc.displayMessage = "Command not available.";
      throw exc;
    }
    browser.runtime.sendMessage({
      type: "presentMessage",
      message: context.slots.message,
    });
    context.routineExecutor.pauseRoutine();
  },
});

intentRunner.registerIntent({
  name: "nicknames.continue",
  async run() {
    const { pausedRoutine } = await browser.storage.local.get("pausedRoutine");
    if (pausedRoutine === undefined) {
      const exc = new Error(
        "'Continue' can only be used in a routine after 'pause routine'"
      );
      exc.displayMessage =
        "'Continue' can only be used in a routine after 'pause routine'";
      throw exc;
    }

    const { name, nextIndex, states, forIndex } = pausedRoutine;
    const registeredNicknames = await intentRunner.getRegisteredNicknames();
    const routineExecutor = new RoutineExecutor(
      registeredNicknames[name].nickname,
      registeredNicknames[name].contexts,
      nextIndex,
      states,
      forIndex
    );
    await browser.storage.local.remove("pausedRoutine");
    await routineExecutor.run();
  },
});

intentRunner.registerIntent({
  name: "nicknames.startForLoop",
  async run(context) {
    const objectToLoop = [];
    if (context.parameters.option === "clipboard") {
      const result = await navigator.clipboard.readText();
      const splitResult = result.split("\n");
      for (const key of splitResult) {
        objectToLoop.push({ value: key });
      }
    }

    if (context.parameters.option === "selected") {
      const selectedTabs = await browser.tabs.query({ highlighted: true });
      for (const tab of selectedTabs) {
        objectToLoop.push({ selected: tab.url });
      }
    }
    if (context.parameters.option === "tab") {
      const tabs = await browser.tabs.query({ currentWindow: true });
      for (const tab in tabs) {
        objectToLoop.push({ tab: tab.url });
      }
    }
    if (context.parameters.option === "bookmark") {
      const bookmarks = await browser.bookmarks.get();
      for (const bookmark in bookmarks) {
        objectToLoop.push({ bookmark: bookmark.url });
      }
    }

    context.routineExecutor.startLoop(objectToLoop);
    return true;
  },
});

intentRunner.registerIntent({
  name: "nicknames.endForLoop",
  async run(context) {
    context.routineExecutor.endLoop();
  },
});
