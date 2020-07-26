/* globals log */

import * as settings from "../settings.js";

const LISTENING_TIMEOUT = 2000;
let enabled = false;
let lastInvoked = 0;

let micAudioProcessor = new MicAudioProcessor(audioConfig);
let model = new SpeechResModel("RES8", commands);
let inferenceEngine = new InferenceEngine(inferenceEngineConfig, commands);

function startWatchword(keywords, sensitivity) {
  micAudioProcessor.getMicPermission().done(function() {
    setInterval(function() {
      let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
      offlineProcessor.getMFCC().done(async function(mfccData) {

        let command = inferenceEngine.infer(mfccData, model, commands);

        if (inferenceEngine.sequencePresent()) {
          if ((Date.now() - lastInvoked) > LISTENING_TIMEOUT) {
            await callWakeword();
          }
        }
      });
    }, predictionFrequency);
  }).fail(function() {
    alert('mic permission is required, please enable the mic usage!');
  });

  log.info(
    "Would listening for watchwords:",
    keywords.join(", "),
    "at sensitivity:",
    sensitivity
  );
  enabled = true;
}

async function callWakeword() {
  lastInvoked = Date.now();
  console.log("HEY FIREFOX");
  await browser.runtime.sendMessage({
    type: "wakeword",
    wakeword: "Hey Firefox"
  });
}

function stopWatchword() {
  log.info("Stopped listening for watchwords");
  enabled = false;
}

export async function updateWakeword() {
  const userSettings = await settings.getSettings();
  if (userSettings.enableWakeword) {
    if (enabled) {
      stopWatchword();
    }
    startWatchword(
      userSettings.wakewords,
      userSettings.wakewordSensitivity || 0.5
    );
  } else if (enabled) {
    stopWatchword();
  }
}

updateWakeword();
