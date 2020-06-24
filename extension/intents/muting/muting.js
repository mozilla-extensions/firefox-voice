/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import { stopReading } from "../read/read.js";
import * as browserUtil from "../../browserUtil.js";

// Always undo temporary muting after this amount of time:
const TEMPORARY_MUTE_TIMEOUT = 10000; // 10 seconds

intentRunner.registerIntent({
  name: "muting.mute",
  async run(context) {
    const stoppedReading = await stopReading();
    if (stoppedReading) {
      // There was an about:reader narration that we stopped
      return;
    }
    const audibleTabs = await browser.tabs.query({ audible: true });
    if (audibleTabs.empty) {
      // TODO: pass a message back to the content script to update the UI and indicate that we don't have any audible tabs
    } else {
      // pass a message back to indicate that the tabs are currently being muted
      log.debug("these are the audible tabs:", audibleTabs);
      // mute each audible tab
      for (const tab of audibleTabs) {
        browser.tabs.update(tab.id, {
          muted: true,
        });
      }
    }
    // TODO: tell the user if no audible tabs were found
    // TODO: show confirmation
  },
});

intentRunner.registerIntent({
  name: "muting.muteTab",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await browser.tabs.update(activeTab.id, { muted: true });
    // TODO: show confirmation
  },
});

intentRunner.registerIntent({
  name: "muting.unmute",
  async run(context) {
    const mutedTabs = await browser.tabs.query({ audible: false });
    if (mutedTabs.empty) {
      // pass a message back to the content script to update the UI and indicate that we don't have any muted tabs
    } else {
      // pass a message back to indicate that the tabs are currently being un-muted
      // unmute each muted tab
      for (const tab of mutedTabs) {
        browser.tabs.update(tab.id, {
          muted: false,
        });
      }
    }
    // TODO: tell the user if no audible tabs were found
    // TODO: show confirmation
  },
});

let muteTimeoutId = null;
let mutedTabIds = [];

export async function temporaryMute() {
  const tabsToMute = await browser.tabs.query({
    audible: true,
    muted: false,
  });
  if (!tabsToMute.length) {
    return;
  }
  if (muteTimeoutId) {
    clearTimeout(muteTimeoutId);
  }
  muteTimeoutId = setTimeout(() => {
    temporaryUnmute();
  }, TEMPORARY_MUTE_TIMEOUT);
  for (const tab of tabsToMute) {
    browser.tabs.update(tab.id, { muted: true });
  }
  mutedTabIds = mutedTabIds.concat(tabsToMute.map(t => t.id));
}

export function temporaryUnmute() {
  if (muteTimeoutId) {
    clearTimeout(muteTimeoutId);
    muteTimeoutId = null;
  }
  for (const tabId of mutedTabIds) {
    browser.tabs.update(tabId, { muted: false });
  }
  mutedTabIds = [];
}
