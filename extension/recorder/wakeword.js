/* globals log, speechCommands */

import * as settings from "../settings.js";

let enabled = false;
let enabledWakewords = null;
let enabledSensitivity = 0;
let transferRecognizer;

async function startWatchword(keywords, sensitivity) {
  log.info(
    "Would listening for watchwords:",
    keywords.join(", "),
    "at sensitivity:",
    sensitivity
  );

  const recognizer = speechCommands.create("BROWSER_FFT");
  await recognizer.ensureModelLoaded();
  transferRecognizer = recognizer.createTransfer("temp-default"); // TODO: this is hard-coded with the first test model that I trained within the extension.
  await transferRecognizer.load();

  transferRecognizer.listen(
    async result => {
      const words = transferRecognizer.wordLabels();

      const maxConfidence = Math.max(...result.scores);
      const topWord = words[result.scores.indexOf(maxConfidence)];
      log.info(`Predicted word ${topWord} with confidence ${maxConfidence}`);
      const wakeword =
        topWord === "heyff" || topWord === "heyFirefox"
          ? "Hey Firefox"
          : "Next slide please";
      await browser.runtime.sendMessage({
        type: "wakeword",
        wakeword,
      });
    },
    {
      probabilityThreshold: 0.75,
      overlapFactor: 0.25,
    }
  );

  enabled = true;
  enabledWakewords = keywords;
  enabledSensitivity = sensitivity;
}

function stopWatchword() {
  log.info("Stopped listening for watchwords");
  transferRecognizer.stopListening();
  enabled = false;
}

export async function updateWakeword() {
  const userSettings = await settings.getSettings();
  if (userSettings.enableWakeword) {
    if (
      enabled &&
      enabledSensitivity === userSettings.wakewordSensitivity &&
      enabledWakewords.sort().join(",") ===
        userSettings.wakewords.sort().join(",")
    ) {
      // It's already enabled with the same settings as currently
      return;
    }
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
