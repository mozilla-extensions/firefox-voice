/* globals intentParser, intentRunner, intentExamples, log, intents, telemetry, util */

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
    }
    log.debug(`${senderInfo} ${message.type}${propString}`);
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
    } else if (message.type === "addTelemetry") {
      return telemetry.add(message.properties);
    } else if (message.type === "sendTelemetry") {
      return telemetry.send();
    } else if (message.type === "addFeedback") {
      return telemetry.addFeedback(message.properties);
    } else if (message.type === "openRecordingTab") {
      return openRecordingTab();
    } else if (message.type === "onVoiceShimForward") {
      message.type = "onVoiceShim";
      return browser.runtime.sendMessage(message);
    } else if (message.type === "voiceShimForward") {
      message.type = "voiceShim";
      if (!recorderTabId) {
        throw new Error("Recorder tab has not been created");
      }
      return browser.tabs.sendMessage(recorderTabId, message);
    } else if (message.type === "makeRecorderActive") {
      browser.tabs.update(recorderTabId, { active: true });
      return null;
    }
    log.error(
      `Received message with unexpected type (${message.type}): ${message}`
    );
    return null;
  });

  let inDevelopment;
  exports.inDevelopment = function() {
    if (inDevelopment === undefined) {
      throw new Error("Unknown inDevelopment status");
    }
    return inDevelopment;
  };

  let extensionTemporaryInstall;
  exports.extensionTemporaryInstall = function() {
    if (extensionTemporaryInstall === undefined) {
      throw new Error("Temporary installation status not yet established");
    }
    return extensionTemporaryInstall;
  };

  browser.runtime.onInstalled.addListener(details => {
    const manifest = browser.runtime.getManifest();
    extensionTemporaryInstall = !!details.temporary;
    inDevelopment = details.temporary || manifest.settings.inDevelopment;
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
    const activeTabId = (await browser.tabs.query({ active: true }))[0].id;
    const existing = await browser.tabs.query({ url: RECORDER_URL });
    if (existing.length) {
      if (existing.length > 1) {
        browser.tabs.remove(existing.slice(1).map(e => e.id));
      }
      tab = existing[0];
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
    await browser.tabs.update(activeTabId, { active: true });
  }

  async function launchOnboarding() {
    const url = browser.runtime.getURL("onboarding/onboard.html");
    await browser.tabs.create({ url });
  }

  return exports;
})();
