/* globals log */

import * as settings from "../settings.js";

let enabled = false;

function startWatchword(keywords, sensitivity) {
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
