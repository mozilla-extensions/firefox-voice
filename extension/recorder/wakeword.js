/* globals log, MicAudioProcessor, audioConfig, commands, SpeechResModel, inferenceEngineConfig, InferenceEngine, OfflineAudioProcessor, predictionFrequency */

import * as settings from "../settings.js";

const LISTENING_TIMEOUT = 2000;
let enabled = false;
let lastInvoked = 0;

const micAudioProcessor = new MicAudioProcessor(audioConfig);
const model = new SpeechResModel("RES8", commands);
const inferenceEngine = new InferenceEngine(inferenceEngineConfig, commands);

function startWatchword() {
  micAudioProcessor
    .getMicPermission()
    .done(function() {
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
    })
    .fail(function() {
      alert("mic permission is required, please enable the mic usage!");
    });

  log.info("Listening for watchword: Hey Firefox");
  enabled = true;
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

export async function updateWakeword() {
  const userSettings = await settings.getSettings();
  if (userSettings.enableWakeword) {
    // FIXME: if we use other settings besides enableWakeword (e.g., userSettings.wakewords,
    // userSettings.wakewordSensitivity), we should restart the listener if those settings change
    if (!enabled) {
      startWatchword();
    }
  } else if (enabled) {
    stopWatchword();
  }
}

updateWakeword();
