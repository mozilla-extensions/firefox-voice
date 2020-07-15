import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as pageMetadata from "../../background/pageMetadata.js";
import * as browserUtil from "../../browserUtil.js";
import { canRespondToMessage } from "../../communicate.js";

let writingTabId;

const SCRIPT = "/intents/notes/makeNote.content.js";

async function checkHasTab() {
  if (!writingTabId) {
    const e = new Error("No writing tab");
    e.displayMessage = 'You must use "Write notes here"';
    throw e;
  }
  const available = await canRespondToMessage("addText", {
    tabId: writingTabId,
  });
  if (!available) {
    const e = new Error("Writing tab no longer active");
    e.displayMessage =
      'The writing tab has changed, use "show notes" and "write notes here"';
    throw e;
  }
}

intentRunner.registerIntent({
  name: "notes.setPlace",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    const tabId = activeTab.id;
    await content.inject(tabId, SCRIPT);
    const failureMessage = await browser.tabs.sendMessage(tabId, {
      type: "setPlace",
    });
    if (failureMessage) {
      const e = new Error("Failed to find place to write");
      e.displayMessage = failureMessage;
      throw e;
    }
    writingTabId = tabId;
  },
});

intentRunner.registerIntent({
  name: "notes.addLink",
  async run(context) {
    await checkHasTab();
    const activeTab = await browserUtil.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const success = await browser.tabs.sendMessage(writingTabId, {
      type: "addLink",
      metadata,
    });
    if (!success) {
      const e = new Error("Could not add link");
      e.displayMessage = "Could not add link";
      throw e;
    }
  },
});

intentRunner.registerIntent({
  name: "notes.add",
  async run(context) {
    await checkHasTab();
    const success = await browser.tabs.sendMessage(writingTabId, {
      type: "addText",
      text: context.slots.text,
    });
    if (!success) {
      const e = new Error("Could not add text");
      e.displayMessage = "Could not add text";
      throw e;
    }
  },
});

intentRunner.registerIntent({
  name: "notes.show",
  async run(context) {
    if (!writingTabId) {
      const e = new Error("No writing tab");
      e.displayMessage = "You have not set a tab to write";
      throw e;
    }
    await browserUtil.makeTabActive(writingTabId);
  },
});

intentRunner.registerIntent({
  name: "notes.paste",
  async run(context) {
    await checkHasTab();
    const success = await browser.tabs.sendMessage(writingTabId, {
      type: "pasteText",
    });
    if (!success) {
      const e = new Error("Could not paste text");
      e.displayMessage = "Could not paste text";
      throw e;
    }
  },
});
