/* globals PorcupineManager, ppnListing, log, catcher */

import * as settings from "../settings.js";

const SKIP_WORDS = ["navy_blue"];
let enabled = false;

function decodeBase64(s) {
  return new Uint8Array(Array.from(atob(s)).map(c => c.charCodeAt(0)));
}

const porcupineManager = PorcupineManager(
  "/js/vendor/porcupine/porcupine_worker.js",
  "/js/vendor/porcupine/downsampling_worker.js"
);

const keywordIds = {};
for (const name in ppnListing) {
  if (SKIP_WORDS.includes(name)) {
    continue;
  }
  keywordIds[name] = decodeBase64(ppnListing[name]);
}

function startWatchword(keywords, sensitivity) {
  const enabledKeywordIds = {};
  for (const keyword of keywords) {
    enabledKeywordIds[keyword] = keywordIds[keyword];
  }
  const sensitivitySources = [];
  for (let i = 0; i < Object.keys(enabledKeywordIds).length; i++) {
    sensitivitySources.push(sensitivity);
  }
  const sensitivities = new Float32Array(sensitivitySources);
  porcupineManager.start(
    enabledKeywordIds,
    sensitivities,
    async function detectionCallback(keyword) {
      if (keyword === null) {
        return;
      }
      await browser.runtime.sendMessage({
        type: "wakeword",
        wakeword: keyword,
      });
      log.info("Got keyword:", keyword);
    },
    function errorCallback(error) {
      log.error("Error in wakeword detection:", error);
      catcher.capture(error);
    }
  );
  log.info(
    "Listening for watchwords:",
    keywords.join(", "),
    "at sensitivity:",
    sensitivity
  );
  enabled = true;
}

function stopWatchword() {
  porcupineManager.stop();
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
