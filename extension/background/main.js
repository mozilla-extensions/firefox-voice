/* globals intentParser, intentRunner, intentExamples, log, intents, telemetry, util, buildSettings, settings, browserUtil */

this.main = (function() {
  const exports = {};

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
      const desc = intentParser.parse(message.text);
      return intentRunner.runIntent(desc);
    } else if (message.type === "getExamples") {
      return intentExamples.getExamples(message.number || 2);
    } else if (message.type === "inDevelopment") {
      return exports.inDevelopment();
    } else if (message.type === "getIntentSummary") {
      return intentRunner.getIntentSummary();
    } else if (message.type === "microphoneStarted") {
      return intents.muting.temporaryMute();
    } else if (message.type === "microphoneStopped") {
      return intents.muting.temporaryUnmute();
    } else if (message.type === "cancelledIntent") {
      return telemetry.cancelledIntent();
    } else if (message.type === "getSettingsAndOptions") {
      return settings.getSettingsAndOptions();
    } else if (message.type === "saveSettings") {
      return settings.saveSettings(message.settings);
    } else if (message.type === "addTelemetry") {
      return telemetry.add(message.properties);
    } else if (message.type === "addFeedback") {
      return telemetry.addFeedback(message.properties);
    } else if (message.type === "openRecordingTab") {
      return openRecordingTab();
    } else if (message.type === "onVoiceShimForward") {
      message.type = "onVoiceShim";
      return browser.runtime.sendMessage(message);
    } else if (message.type === "focusSearchResults") {
      return intents.search.focusSearchResults(message);
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
    }
    log.error(
      `Received message with unexpected type (${message.type}): ${message}`
    );
    return null;
  });

  let inDevelopment;
  exports.inDevelopment = function() {
    return inDevelopment || false;
  };

  let extensionTemporaryInstall;
  exports.extensionTemporaryInstall = function() {
    if (extensionTemporaryInstall === undefined) {
      throw new Error("Temporary installation status not yet established");
    }
    return extensionTemporaryInstall;
  };

  // For reasons I don't understand, extensionTemporaryInstall is frequently not
  // being set. Presumably onInstalled isn't always called. This makes sure it
  // gets set eventually.
  const temporaryInstallId = setTimeout(() => {
    if (extensionTemporaryInstall === undefined) {
      extensionTemporaryInstall = false;
    }
  }, 5000);

  browser.runtime.onInstalled.addListener(details => {
    extensionTemporaryInstall = !!details.temporary;
    clearTimeout(temporaryInstallId);
    inDevelopment = !!(details.temporary || buildSettings.inDevelopment);
    if (details.reason === "install") {
      launchOnboarding();
    }
    if (!details.temporary) {
      telemetry.initFirstInstallationVersion();
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

  async function launchOnboarding() {
    const url = browser.runtime.getURL("onboarding/onboard.html");
    await browser.tabs.create({ url });
  }

  return exports;
})();
