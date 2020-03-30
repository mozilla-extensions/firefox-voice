/* eslint-disable complexity */
/* globals log, buildSettings, catcher */

import * as intentRunner from "./intentRunner.js";
import * as intentExamples from "./intentExamples.js";
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
import { timerController } from "../intents/timer/timer.js";
import * as intentParser from "./intentParser.js";

const UNINSTALL_SURVEY =
  "https://qsurvey.mozilla.com/s3/Firefox-Voice-Exit-Survey";

browser.runtime.onMessage.addListener(async (message, sender) => {
  const properties = Object.assign({}, message);
  delete properties.type;
  let propString = "";
  let senderInfo = "? ->";
  if (Object.keys(properties).length) {
    propString = ` ${JSON.stringify(properties)}`;
  }
  if (!sender.tab) {
    senderInfo = "popup ->";
  } else if (sender.tab.id === recorderTabId) {
    senderInfo = "record->";
  } else if (sender.url.endsWith("options.html")) {
    senderInfo = "option->";
  }
  log.messaging(`${senderInfo} ${message.type}${propString}`);
  if (message.type === "runIntent") {
    if (message.closeThisTab) {
      closeTabSoon(sender.tab.id, sender.tab.url);
    }
    return intentRunner.runUtterance(message.text, message.noPopup);
  } else if (message.type === "getExamples") {
    return intentExamples.getExamples(message.number || 2);
  } else if (message.type === "getLastIntentForFeedback") {
    return intentRunner.getLastIntentForFeedback();
  } else if (message.type === "inDevelopment") {
    return inDevelopment();
  } else if (message.type === "getIntentSummary") {
    return intentRunner.getIntentSummary();
  } else if (message.type === "microphoneStarted") {
    // FIXME: this is called when the popup is opened, but it's a bit silly
    openWakeword().catch(e => {
      log.error("Error enabling wakeword page:", e);
      catcher.capture(e);
    });
    return temporaryMute();
  } else if (message.type === "microphoneStopped") {
    return temporaryUnmute();
  } else if (message.type === "cancelledIntent") {
    return telemetry.cancelledIntent();
  } else if (message.type === "getSettingsAndOptions") {
    return settings.getSettingsAndOptions();
  } else if (message.type === "saveSettings") {
    return settings.saveSettings(message.settings);
  } else if (message.type === "addTelemetry") {
    return telemetry.add(message.properties);
  } else if (message.type === "sendFeedback") {
    intentRunner.clearFeedbackIntent();
    return telemetry.sendFeedback(message);
  } else if (message.type === "openRecordingTab") {
    return openRecordingTab();
  } else if (message.type === "zeroVolumeError") {
    return zeroVolumeError();
  } else if (message.type === "onVoiceShimForward") {
    message.type = "onVoiceShim";
    return browser.runtime.sendMessage(message);
  } else if (message.type === "focusSearchResults") {
    return focusSearchResults(message);
  } else if (message.type === "copyImage") {
    return copyImage(message.url);
  } else if (message.type === "wakeword") {
    return wakewordPopup(message.wakeword);
  } else if (message.type === "createSurveyUrl") {
    return telemetry.createSurveyUrl(message.url);
  } else if (message.type === "voiceShimForward") {
    message.type = "voiceShim";
    if (!recorderTabId) {
      throw new Error("Recorder tab has not been created");
    }
    return browser.tabs.sendMessage(recorderTabId, message);
  } else if (message.type === "makeRecorderActive") {
    // FIXME: consider focusing the window too
    browserUtil.makeTabActive(recorderTabId || sender.tab.id);
    return null;
  } else if (message.type === "timerAction") {
    return timerController[message.method](...(message.args || []));
  } else if (message.type === "getRegisteredNicknames") {
    return intentRunner.getRegisteredNicknames();
  } else if (message.type === "registerNickname") {
    let context = message.context;
    if (context !== null) {
      context = new intentRunner.IntentContext(context);
    }
    return intentRunner.registerNickname(message.name, context);
  } else if (message.type === "parseUtterance") {
    return new intentRunner.IntentContext(
      intentParser.parse(message.utterance, message.disableFallback)
    );
  }
  log.error(
    `Received message with unexpected type (${message.type}): ${message}`
  );
  return null;
});

let _inDevelopment;
export function inDevelopment() {
  return _inDevelopment || false;
}

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
      await browser.tabs.sendMessage(recorderTabId, {
        type: "voiceShim",
        method: "ping",
      });
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
      await browser.tabs.sendMessage(recorderTabId, {
        type: "voiceShim",
        method: "ping",
      });
      break;
    } catch (e) {}
    await util.sleep(100);
  }
  await browserUtil.makeTabActive(activeTab);
}

function closeTabSoon(tabId, tabUrl) {
  setTimeout(async () => {
    try {
      const tab = await browser.tabs.get(tabId);
      if (tab.url !== tabUrl) {
        // The tab has been updated, and shouldn't be closed
        return;
      }
      await browser.tabs.remove(tabId);
    } catch (e) {
      log.error("Error closing temporary execution tab:", e);
      catcher.capture(e);
    }
  }, 250);
}

async function zeroVolumeError() {
  if (!recorderTabId) {
    const exc = new Error("zeroVolumeError with no recorder tab");
    log.error(exc.message);
    catcher.capture(exc);
    throw exc;
  }
  await browserUtil.makeTabActive(recorderTabId);
  await browser.tabs.sendMessage(recorderTabId, { type: "zeroVolumeError" });
}

async function launchOnboarding() {
  const url = browser.runtime.getURL("onboarding/onboard.html");
  await browser.tabs.create({ url });
}

if (buildSettings.openPopupOnStart) {
  browser.tabs.create({ url: browser.runtime.getURL("/popup/popup.html") });
}

async function wakewordPopup(wakeword) {
  telemetry.add({ wakewordUsed: wakeword });
  log.info("Received wakeword", wakeword);
  try {
    const result = await browser.runtime.sendMessage({
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
        await browser.runtime.sendMessage({
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
        await browser.runtime.sendMessage({
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
  const { enableWakeword, wakewords } = await settings.getSettings();
  const wakewordUrl = browser.runtime.getURL("/wakeword/wakeword.html");
  const tabs = await browser.tabs.query({ url: wakewordUrl });
  if (!enableWakeword || !wakewords.length) {
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
    await browser.tabs.sendMessage(tab.id, { type: "updateWakeword" });
    await browserUtil.makeTabActive(activeTab.id);
  } else {
    await browser.tabs.sendMessage(tabs[0].id, { type: "updateWakeword" });
  }
  wakewordMaybeOpen = true;
});

settings.watch("enableWakeword", openWakeword);
settings.watch("wakewords", openWakeword);
settings.watch("wakewordSensitivity", openWakeword);

openWakeword();

function setUninstallURL() {
  const url = telemetry.createSurveyUrl(UNINSTALL_SURVEY);
  browser.runtime.setUninstallURL(url);
}

setTimeout(setUninstallURL, 10000);
setInterval(setUninstallURL, 1000 * 60 * 60 * 24); // Update the URL once a day
