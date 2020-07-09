/* globals log, music_getServiceNamesAndTitles, isBackgroundPage */

const watchers = {};

const DEFAULT_SETTINGS = {
  chime: true,
  musicService: "auto",
  disableTelemetry: false,
  utterancesTelemetry: false,
  collectAudio: false,
  collectTranscriptsOptinAnswered: false,
  keyboardShortcut: null,
  enableWakeword: false,
  wakewords: ["grasshopper"],
  wakewordSensitivity: 0.6,
  listenForFollowup: false,
  speechOutput: false,
  saveAudioHistory: false,
  saveHistory: true,
};

export function getSettings() {
  const value = localStorage.getItem("settings");
  if (value) {
    let s = JSON.parse(value);
    // This makes DEFAULT_SETTINGS essentially the parent class,
    // but any properties will be set on the settings object, only written
    // properties will be saved.
    s = Object.assign(Object.create(DEFAULT_SETTINGS), s);
    return s;
  }
  return Object.assign({}, DEFAULT_SETTINGS);
}

export async function getSettingsAndOptions() {
  if (typeof isBackgroundPage === "undefined" || !isBackgroundPage) {
    const result = await browser.runtime.sendMessage({
      type: "getSettingsAndOptions",
    });
    if (!result) {
      throw new Error(`sendMessage getSettingsAndOptions returned ${result}`);
    }
    return result;
  }
  const settings = getSettings();
  const options = {
    musicServices: music_getServiceNamesAndTitles(),
    // FIXME: this used to contain the available wakewords, but is empty until we
    // restore wakeword detection:
    wakewords: [],
  };
  return { settings, options };
}

export async function saveSettings(settings) {
  const oldSettings = getSettings();
  if (typeof isBackgroundPage === "undefined" || !isBackgroundPage) {
    // We're not running in the background
    // Remove any inherited/default properties:
    settings = JSON.parse(JSON.stringify(settings));
    await browser.runtime.sendMessage({ type: "saveSettings", settings });
  }
  localStorage.setItem("settings", JSON.stringify(settings));
  if (Object.keys(watchers).length !== 0) {
    for (const name in settings) {
      if (settings[name] !== oldSettings[name]) {
        const callbacks = watchers[name] || [];
        for (const callback of callbacks) {
          try {
            callback(settings[name], name, oldSettings[name]);
          } catch (e) {
            log.error(`Error in settings callback for ${name}:`, e);
          }
        }
      }
    }
  }
}

export function watch(setting, callback) {
  if (!(setting in watchers)) {
    watchers[setting] = [];
  }
  watchers[setting].push(callback);
}
