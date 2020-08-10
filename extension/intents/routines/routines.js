/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as pageMetadata from "../../background/pageMetadata.js";
import * as browserUtil from "../../browserUtil.js";
import {
  RoutineExecutor,
  pausedRoutineExecutor,
  currentRoutineExecutor,
} from "./routineExecutor.js";
import English from "../../language/langs/english.js";
import { convertToMs } from "../../util.js";

intentRunner.registerIntent({
  name: "routines.name",
  async run(context) {
    const intents = intentRunner.getIntentHistory();
    if (!(intents[intents.length - 1] && intents[intents.length - 2])) {
      const exc = new Error("No last intent");
      exc.displayMessage = "No previous intent available to name";
      throw exc;
    }
    if (intents[intents.length - 1].name !== "routines.name") {
      throw new Error("Expected previous intent to be routines.name");
    }
    const intent = intents[intents.length - 2];
    intentRunner.registerRoutine(context.slots.name, intent);
  },
});

intentRunner.registerIntent({
  name: "routines.remove",
  async run(context) {
    const intents = intentRunner.getRegisteredRoutines();
    const name = context.slots.name.toLowerCase();
    if (!intents[name]) {
      const exc = new Error("No named intent to remove");
      exc.displayMessage = `No routine "${name}" found`;
      throw exc;
    }
    intentRunner.registerRoutine(name, null);
  },
});

function makeCombinedContext(contexts, routine) {
  return new intentRunner.IntentContext({
    name: "routines.combined",
    routine,
    contexts,
    slots: {},
    parameters: {},
    utterance: `Combined actions named ${routine}`,
    fallback: false,
  });
}

intentRunner.registerIntent({
  name: "routines.nameLast",
  async run(context) {
    // FIXME: this should not created a routines.combined context if the number is 1
    const name = context.slots.name.toLowerCase();
    const number = English.nameToNumber(context.slots.number);
    const history = intentRunner.getIntentHistory().slice(-number - 1, -1);
    if (history.length < number) {
      const exc = new Error("Not enough history to save");
      exc.displayMessage = `There are not ${number} things to name (there are only ${history.length})`;
      throw exc;
    }
    const newContext = makeCombinedContext(history, name);
    intentRunner.registerRoutine(name, newContext);
    log.info(
      "Created combined routine",
      name,
      "->",
      history.map(c => c.name).join(", ")
    );
  },
});

intentRunner.registerIntent({
  name: "routines.combined",
  async run(context) {
    log.info(`Running a named series (${context.contexts.length}) of intents`);
    const routineExecutor = new RoutineExecutor(
      context.routine,
      context.contexts
    );
    await routineExecutor.run();
  },
});

intentRunner.registerIntent({
  name: "routines.namePage",
  async run(context) {
    const name = context.slots.name;
    const activeTab = await browserUtil.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    intentRunner.registerPageName(name, metadata);
  },
});

intentRunner.registerIntent({
  name: "routines.removePageName",
  async run(context) {
    const name = context.slots.name;
    await intentRunner.getRegisteredPageName(name);
    intentRunner.unregisterPageName(name);
  },
});

intentRunner.registerIntent({
  name: "routines.pause",
  async run(context) {
    if (context.routineExecutor === undefined) {
      const exc = new Error("Command not available.");
      exc.displayMessage = "Command not available.";
      throw exc;
    }
    if (context.slots.time) {
      const ms = convertToMs(context.slots.time);
      context.routineExecutor.pauseRoutineForTime(ms, context.slots.message);
    } else {
      browser.runtime.sendMessage({
        type: "presentMessage",
        message:
          context.slots.message ||
          `Routine "${context.routineExecutor.routineName}" was paused.`,
      });

      context.routineExecutor.pauseRoutine();
    }
  },
});

intentRunner.registerIntent({
  name: "routines.continue",
  async run() {
    if (pausedRoutineExecutor === null) {
      const exc = new Error(
        "'Continue' can only be used in a routine after 'pause routine'"
      );
      exc.displayMessage =
        "'Continue' can only be used in a routine after 'pause routine'";
      throw exc;
    }
    await pausedRoutineExecutor.continue();
  },
});

function getAllBookmarksInFolder(bookmarkFolder) {
  let bookmarksList = [];
  for (const child of bookmarkFolder.children) {
    if (child.type === "bookmark") {
      bookmarksList.push(child);
    } else {
      bookmarksList = bookmarksList.concat(getAllBookmarksInFolder(child));
    }
  }
  return bookmarksList;
}

intentRunner.registerIntent({
  name: "routines.startForLoop",
  async run(context) {
    const objectToLoop = [];
    const variable = context.slots.variable;

    if (context.parameters.dataSource === "clipboard") {
      const result = await navigator.clipboard.readText();
      const splitResult = result.split("\n");
      for (const key of splitResult) {
        objectToLoop.push({ [variable]: key });
      }
    }

    if (context.parameters.dataSource === "selectedTabs") {
      const selectedTabs = await browser.tabs.query({ highlighted: true });
      for (const tab of selectedTabs) {
        objectToLoop.push({ [variable]: tab.url });
      }
    }
    if (context.parameters.dataSource === "tab") {
      const tabs = await browser.tabs.query({ currentWindow: true });
      for (const tab of tabs) {
        objectToLoop.push({ [variable]: tab.url });
      }
    }
    if (context.parameters.dataSource === "bookmark") {
      const bookmarks = await browser.bookmarks.get();
      for (const bookmark of bookmarks) {
        objectToLoop.push({ [variable]: bookmark.url });
      }
    }

    if (context.parameters.dataSource === "bookmarkFolder") {
      const folder = context.slots.folder;
      const exc = new Error(`${folder} is not a bookmark folder.`);
      exc.displayMessage = `${folder} is not a bookmark folder.`;

      let bookmarkFolder = null;
      try {
        const [{ id }] = await browser.bookmarks.search({ title: folder });
        [bookmarkFolder] = await browser.bookmarks.getSubTree(id);
      } catch (err) {
        throw exc;
      }

      if (bookmarkFolder.type !== "folder") {
        throw exc;
      }

      const bookmarks = getAllBookmarksInFolder(bookmarkFolder);
      for (const bookmark of bookmarks) {
        objectToLoop.push({ [variable]: bookmark.url });
      }
    }

    if (context.parameters.dataSource === "interval") {
      const range = context.slots.range;
      for (let i = 0; i < range; i++) {
        objectToLoop.push({ [variable]: i });
      }
    }

    context.routineExecutor.startLoop(objectToLoop);
    return true;
  },
});

intentRunner.registerIntent({
  name: "routines.endForLoop",
  async run(context) {
    if (context.routineExecutor === undefined) {
      const exc = new Error("Command not available.");
      exc.displayMessage = "Command not available.";
      throw exc;
    }

    context.routineExecutor.endLoop();
  },
});

intentRunner.registerIntent({
  name: "routines.stop",
  async run() {
    const routineExecutor = currentRoutineExecutor || pausedRoutineExecutor;
    if (routineExecutor === null) {
      const exc = new Error("No routine executing.");
      exc.displayMessage = "No routine executing.";
      throw exc;
    }
    routineExecutor.stop();
  },
});
