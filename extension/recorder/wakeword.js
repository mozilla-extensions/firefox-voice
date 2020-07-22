/* globals log */

import * as settings from "../settings.js";

let enabled = false;

function startWatchword(keywords, sensitivity) {
  let micAudioProcessor = new MicAudioProcessor(audioConfig);
  let model = new SpeechResModel("RES8", commands);
  let inferenceEngine = new InferenceEngine(inferenceEngineConfig, commands);

  micAudioProcessor.getMicPermission().done(function() {
    setInterval(function() {
      let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
      offlineProcessor.getMFCC().done(function(mfccData) {

        let command = inferenceEngine.infer(mfccData, model, commands);
        // console.log("RECEIVED COMMAND ", command);

        if (inferenceEngine.sequencePresent()) {
          console.log("HEY FIREFOX");
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
