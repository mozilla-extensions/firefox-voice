/* globals log, MicAudioProcessor, audioConfig, commands, SpeechResModel, inferenceEngineConfig, InferenceEngine, OfflineAudioProcessor, predictionFrequency */

import * as settings from "../settings.js";
import { serializeCalls } from "../util.js";

const LISTENING_TIMEOUT = 2000;
const MIC_PERMISSION_TIMEOUT = 2000;
let enabled = false;
let lastInvoked = 0;

const micAudioProcessor = new MicAudioProcessor(audioConfig);
const model = new SpeechResModel("RES8", commands);
const inferenceEngine = new InferenceEngine(inferenceEngineConfig, commands);

// micAudioProcessor expects this to exist so it can report the progress, but it doesn't
// apply to what we're doing here, so we have to stub it out:
window.visualizer = () => {};

async function getMicPermission() {
  let restoreTabId;
  const timeoutId = setTimeout(async () => {
    restoreTabId = await browser.runtime.sendMessage({
      type: "focusWakewordTab",
    });
  }, MIC_PERMISSION_TIMEOUT);
  const deferred = micAudioProcessor.getMicPermission();
  return new Promise((resolve, reject) => {
    deferred.always(() => {
      clearTimeout(timeoutId);
      if (restoreTabId) {
        browser.runtime.sendMessage({
          type: "unfocusWakewordTab",
          tabId: restoreTabId,
        });
      }
    });
    deferred.done(resolve).fail(reject);
  });
}

async function startWatchword() {
  enabled = true;
  try {
    await getMicPermission();
  } catch (e) {
    window.alert("mic permission is required, please enable the mic usage!");
  }
  setInterval(function() {
    const offlineProcessor = new OfflineAudioProcessor(
      audioConfig,
      micAudioProcessor.getData()
    );
    offlineProcessor.getMFCC().done(async function(mfccData) {
      inferenceEngine.infer(mfccData, model, commands);

      // eslint-disable-next-line no-unused-vars
      const command = inferenceEngine.infer(mfccData, model, commands);
      // FIXME: use command to do different things (right now it only wakes)

      if (inferenceEngine.sequencePresent()) {
        if (Date.now() - lastInvoked > LISTENING_TIMEOUT) {
          await callWakeword();
        }
      }
    });
  }, predictionFrequency);
  log.info("Listening for watchword: Hey Firefox");
}

async function callWakeword() {
  lastInvoked = Date.now();
  log.info("Heard wakeword: Hey Firefox");
  await browser.runtime.sendMessage({
    type: "wakeword",
    wakeword: "Hey Firefox",
  });
}

function stopWatchword() {
  log.info("Stopped listening for watchwords");
  enabled = false;
}

export const updateWakeword = serializeCalls(async function() {
  const userSettings = await settings.getSettings();
  if (userSettings.enableWakeword) {
    // FIXME: if we use other settings besides enableWakeword (e.g., userSettings.wakewords,
    // userSettings.wakewordSensitivity), we should restart the listener if those settings change
    if (!enabled) {
      return startWatchword();
    }
  } else if (enabled) {
    return stopWatchword();
  }
  return null;
});

updateWakeword();
