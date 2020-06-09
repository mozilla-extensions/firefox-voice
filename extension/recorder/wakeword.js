/* globals log, tf, speechCommands */

import * as settings from "../settings.js";

let enabled = false;
let transferRecognizer;

async function startWatchword(keywords, sensitivity) {
  log.info(
    "Would listening for watchwords:",
    keywords.join(", "),
    "at sensitivity:",
    sensitivity
  );

  const recognizer = speechCommands.create('BROWSER_FFT');
  await recognizer.ensureModelLoaded();
  transferRecognizer = recognizer.createTransfer("todays-quicker-model");
  await transferRecognizer.load();

  transferRecognizer.listen(async (result) => {
    console.log(result);
    const words = transferRecognizer.wordLabels();
    console.log(words);

    const maxConfidence = Math.max(...result.scores);
    const topWord = words[result.scores.indexOf(maxConfidence)];
    console.log(`Predicted word ${topWord} with confidence ${maxConfidence}`);
    const wakeword = topWord === "heyff" ? "Hey Firefox" : "Next slide please";
    await browser.runtime.sendMessage({
      type: "wakeword",
      wakeword
    });
    // - result.scores contains the probability scores that correspond to
    //   recognizer.wordLabels().
    // - result.spectrogram contains the spectrogram of the recognized word.
    }, {
    probabilityThreshold: 0.90,
    overlapFactor: 0.25
  });

  enabled = true;
}

function stopWatchword() {
  log.info("Stopped listening for watchwords");
  transferRecognizer.stopListening();
  enabled = false;
}

export async function updateWakeword() {
  const userSettings = await settings.getSettings();
  if (userSettings.enableWakeword) {
    if (enabled) {
      stopWatchword();
    }
    await startWatchword(
      userSettings.wakewords,
      userSettings.wakewordSensitivity || 0.5
    );
  } else if (enabled) {
    stopWatchword();
  }
}

updateWakeword();
