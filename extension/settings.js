/* globals intents */

this.settings = (function() {
  const exports = {};

  const DEFAULT_SETTINGS = {
    chime: true,
    musicService: "auto",
    disableTelemetry: false,
    utterancesTelemetry: false,
    collectAudio: false,
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
      musicServices: intents.music.getServiceNamesAndTitles(),
    };
    return { settings, options };
  };

  exports.saveSettings = async function(settings) {
    if (typeof main === "undefined") {
      // We're not running in the background
      // Remove any inherited/default properties:
      settings = JSON.parse(JSON.stringify(settings));
      await browser.runtime.sendMessage({ type: "saveSettings", settings });
    } else {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  };

  return exports;
})();
