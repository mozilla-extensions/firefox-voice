/* globals log, ppnListing, music_getServiceNamesAndTitles */

this.settings = (function() {
  const exports = {};
  const watchers = {};

  const DEFAULT_SETTINGS = {
    chime: true,
    musicService: "auto",
    disableTelemetry: false,
    utterancesTelemetry: false,
    collectAudio: false,
    collectTranscriptsOptinShown: false,
    keyboardShortcut: null,
    enableWakeword: false,
    wakewords: ["grasshopper"],
    wakewordSensitivity: 0.6,
  };

  exports.getSettings = function() {
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
  };

  exports.getSettingsAndOptions = async function() {
    if (typeof main === "undefined") {
      const result = await browser.runtime.sendMessage({
        type: "getSettingsAndOptions",
      });
      return result;
    }
    const settings = exports.getSettings();
    const options = {
      musicServices: music_getServiceNamesAndTitles(),
      wakewords: Object.keys(ppnListing),
    };
    return { settings, options };
  };

  exports.saveSettings = async function(settings) {
    if (Object.keys(watchers).length !== 0) {
      const oldSettings = exports.getSettings();
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
    if (typeof main === "undefined") {
      // We're not running in the background
      // Remove any inherited/default properties:
      settings = JSON.parse(JSON.stringify(settings));
      await browser.runtime.sendMessage({ type: "saveSettings", settings });
    }
    localStorage.setItem("settings", JSON.stringify(settings));
  };

  exports.watch = function(setting, callback) {
    if (!(setting in watchers)) {
      watchers[setting] = [];
    }
    watchers[setting].push(callback);
  };

  return exports;
})();
