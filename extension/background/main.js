/* eslint-disable complexity */
/* globals log, buildSettings, catcher */

import * as intentRunner from "./intentRunner.js";
import * as telemetry from "./telemetry.js";
import * as browserUtil from "../browserUtil.js";
import * as settings from "../settings.js";
import * as util from "../util.js";
// eslint-disable-next-line no-unused-vars
import * as intentImport from "./intentImport.js";
// eslint-disable-next-line no-unused-vars
import * as serviceImport from "./serviceImport.js";
import { temporaryMute, temporaryUnmute } from "../intents/muting/muting.js";
import { focusSearchResults } from "../intents/search/search.js";
import { copyImage } from "../intents/clipboard/clipboard.js";
import { registerHandler, sendMessage } from "../communicate.js";

// These are used for registering message handlers:
// eslint-disable-next-line no-unused-vars
import * as intentExamples from "./intentExamples.js";

const UNINSTALL_SURVEY =
  "https://qsurvey.mozilla.com/s3/Firefox-Voice-Exit-Survey";

let _inDevelopment;
export function inDevelopment() {
  return _inDevelopment || false;
}

registerHandler("inDevelopment", inDevelopment);

let _extensionTemporaryInstall = buildSettings.inDevelopment;
export function extensionTemporaryInstall() {
  return _extensionTemporaryInstall;
}

// For reasons I don't understand, extensionTemporaryInstall is frequently not
// being set. Presumably onInstalled isn't always called. This makes sure it
// gets set eventually.
const temporaryInstallId = setTimeout(() => {
  if (_extensionTemporaryInstall === undefined) {
    _extensionTemporaryInstall = false;
  }

  _inDevelopment = buildSettings.inDevelopment;
}, 5000);

browser.runtime.onInstalled.addListener(details => {
  _extensionTemporaryInstall = !!details.temporary;
  clearTimeout(temporaryInstallId);
  _inDevelopment = !!(details.temporary || buildSettings.inDevelopment);
  if (details.reason === "install") {
    launchOnboarding();
  }
  if (!extensionTemporaryInstall) {
    telemetry.initFirstInstallation();
  }
});

let recorderTabId;
const RECORDER_URL = browser.runtime.getURL("/recorder/recorder.html");

async function openRecordingTab() {
  if (recorderTabId) {
    try {
      await sendMessage(
        {
          type: "voiceShim",
          method: "ping",
        },
        { tabId: recorderTabId }
      );
      return;
    } catch (e) {
      log.info("Error ending message to recorder tab:", String(e));
      recorderTabId = null;
    }
  }
  let tab;
  const activeTab = await browserUtil.activeTab();
  const existing = await browser.tabs.query({ url: RECORDER_URL });
  if (existing.length) {
    if (existing.length > 1) {
      browser.tabs.remove(existing.slice(1).map(e => e.id));
    }
    tab = existing[0];
    // FIXME: make sure window is focused?
    await browser.tabs.update(tab.id, {
      url: RECORDER_URL,
      active: true,
    });
  } else {
    tab = await browser.tabs.create({
      url: RECORDER_URL,
      pinned: true,
    });
  }
  // eslint-disable-next-line require-atomic-updates
  recorderTabId = tab.id;
  for (let i = 0; i < 5; i++) {
    try {
      await sendMessage(
        {
          type: "voiceShim",
          method: "ping",
        },
        { tabId: recorderTabId }
      );
      break;
    } catch (e) {}
    await util.sleep(100);
  }
  await browserUtil.makeTabActive(activeTab);
}

async function zeroVolumeError() {
  const exc = new Error("zeroVolumeError");
  log.error(exc.message);
  catcher.capture(exc);
  if (recorderTabId) {
    await browserUtil.makeTabActive(recorderTabId);
    await sendMessage({ type: "zeroVolumeError" }, { tabId: recorderTabId });
  }
}

async function launchOnboarding() {
  const tabs = await browser.tabs.query({
    url: ["*://voice.mozilla.org/firefox-voice/*", "http://localhost/*"],
  });
  let hasAudioIntro = false;
  for (const tab of tabs) {
    const u = new URL(tab.url);
    if (
      u.searchParams.get("source") === "commonvoice" ||
      u.searchParams.get("ask-audio")
    ) {
      hasAudioIntro = true;
    }
  }
  const url = browser.runtime.getURL(
    "onboarding/onboard.html" + (hasAudioIntro ? "?audio=1" : "")
  );
  await browserUtil.openOrActivateTab(url);
}

if (buildSettings.openPopupOnStart) {
  setTimeout(() => {
    browser.tabs.create({ url: browser.runtime.getURL("/popup/popup.html") });
  }, 2000);
}

async function wakewordPopup(wakeword) {
  telemetry.add({ wakewordUsed: wakeword });
  log.info("Received wakeword", wakeword);
  try {
    const result = await sendMessage({
      type: "wakewordReceivedRestartPopup",
    });
    if (result) {
      // The popup is open and will handle restarting itself
      return null;
    }
  } catch (e) {
    // This probably won't happen, but if it does we'll try to open the popup anyway
    catcher.capture(e);
  }
  return browser.experiments.voice.openPopup();
}

let _shortcutSet = false;

async function updateKeyboardShortcut(shortcut) {
  if (shortcut) {
    let success = false;
    try {
      await browser.commands.update({
        name: "_execute_browser_action",
        shortcut,
      });
      _shortcutSet = true;
      success = true;
    } catch (e) {
      let error = String(e);
      error = error.replace(/^.*Error: Value/, "");
      try {
        await sendMessage({
          type: "keyboardShortcutError",
          error,
        });
        // I would have thought sessionStorage would work here, but apparently not:
        localStorage.removeItem("keyboardShortcutError");
      } catch (e) {
        // The options page isn't open (this might be startup), so it can't respond
        log.error(
          "Error trying to set keyboard shortcut to:",
          shortcut,
          "; error:",
          error
        );
        // We'll put it in sessionStorage for later:
        localStorage.setItem("keyboardShortcutError", error);
      }
    }
    if (success) {
      try {
        await sendMessage({
          type: "keyboardShortcutError",
          error: "",
        });
      } catch (e) {
        // Ignore (no options page receiver)
      }
    }
  } else if (_shortcutSet) {
    browser.commands.update({
      name: "_execute_browser_action",
      shortcut: "Ctrl+Period",
    });
  }
}

settings.watch("keyboardShortcut", newValue => {
  updateKeyboardShortcut(newValue);
});

updateKeyboardShortcut(settings.getSettings().keyboardShortcut);

let wakewordMaybeOpen = false;

const openWakeword = util.serializeCalls(async function() {
  const { enableWakeword } = await settings.getSettings();
  const wakewordUrl = browser.runtime.getURL("/wakeword/wakeword.html");
  const tabs = await browser.tabs.query({ url: wakewordUrl });
  if (!enableWakeword) {
    if (wakewordMaybeOpen) {
      wakewordMaybeOpen = false;
      if (tabs.length) {
        await browser.tabs.remove(tabs.map(t => t.id));
      }
    }
    return;
  }
  if (!tabs.length) {
    const activeTab = await browserUtil.activeTab();
    const tab = await browser.tabs.create({
      url: wakewordUrl,
      active: true,
      pinned: true,
    });
    await browserUtil.waitForDocumentComplete(tab.id);
    await sendMessage({ type: "updateWakeword" }, { tabId: tab.id });
    await browserUtil.makeTabActive(activeTab.id);
  } else {
    try {
      await sendMessage({ type: "updateWakeword" }, { tabId: tabs[0].id });
    } catch (e) {
      if (e.message.includes("Could not establish connection")) {
        await browser.tabs.reload(tabs[0].id);
      }
      throw e;
    }
  }
  wakewordMaybeOpen = true;
});

registerHandler("focusWakewordTab", async (message, sender) => {
  const tab = await browserUtil.activeTab();
  // For some reason this takes a long time to return, too long, and
  // doesn't return in time, so we let it run in the background and return
  // the tab.id fast:
  browserUtil.makeTabActive(sender.tab.id);
  return tab.id;
});

registerHandler("unfocusWakewordTab", async message => {
  await browserUtil.makeTabActive(message.tabId);
});

// These message handlers are kept in main.js to avoid cases where the module
// (such as telemetry) doesn't or shouldn't know about this messaging, or where
// a module (such as settings or log) can be used from the background page or the
// popup or content script:
registerHandler("microphoneStarted", () => {
  // FIXME: this is called when the popup is opened, but it's a bit silly
  openWakeword().catch(e => {
    log.error("Error enabling wakeword page:", e);
    catcher.capture(e);
  });
  return temporaryMute();
});
registerHandler("microphoneStopped", temporaryUnmute);

registerHandler("cancelledIntent", telemetry.cancelledIntent);
registerHandler("addTelemetry", message => {
  return telemetry.add(message.properties);
});
registerHandler("sendFeedback", message => {
  intentRunner.clearFeedbackIntent();
  return telemetry.sendFeedback(message);
});
registerHandler("createSurveyUrl", message => {
  return telemetry.createSurveyUrl(message.url);
});

registerHandler("getSettingsAndOptions", settings.getSettingsAndOptions);
registerHandler("saveSettings", message => {
  return settings.saveSettings(message.settings);
});
registerHandler("addTimings", message => {
  return log.addTimings(message.timings);
});
registerHandler("getTimings", log.getTimings);

registerHandler("launchOnboarding", launchOnboarding);
registerHandler("openRecordingTab", openRecordingTab);
registerHandler("zeroVolumeError", zeroVolumeError);
registerHandler("focusSearchResults", message => {
  return focusSearchResults(message);
});
registerHandler("copyImage", message => {
  return copyImage(message.url);
});
registerHandler("wakeword", message => {
  return wakewordPopup(message.wakeword);
});

// These help when using a recorder that is not in the popup, but is controlled by the
// popup; all these methods are forwarded between these two contexts:
registerHandler("onVoiceShimForward", message => {
  message.type = "onVoiceShim";
  return sendMessage(message);
});
registerHandler("voiceShimForward", message => {
  message.type = "voiceShim";
  if (!recorderTabId) {
    throw new Error("Recorder tab has not been created");
  }
  return sendMessage(message, { tabId: recorderTabId });
});
registerHandler("makeRecorderActive", (message, sender) => {
  // FIXME: consider focusing the window too
  browserUtil.makeTabActive(recorderTabId || sender.tab.id);
  return null;
});

settings.watch("enableWakeword", openWakeword);
settings.watch("wakewords", openWakeword);
settings.watch("wakewordSensitivity", openWakeword);

// If the wakeword is opened too soon, there can be a permission-related race condition
// where the wakeword page won't load:
setTimeout(() => {
  openWakeword();
}, 500);

function setUninstallURL() {
  const url = telemetry.createSurveyUrl(UNINSTALL_SURVEY);
  browser.runtime.setUninstallURL(url);
}

setTimeout(setUninstallURL, 10000);
setInterval(setUninstallURL, 1000 * 60 * 60 * 24); // Update the URL once a day
