/* globals intents */

this.settings = (function() {
  const exports = {};

  const DEFAULT_SETTINGS = {
    chime: true,
    musicService: "auto",
  };

  exports.getSettings = function() {
    const value = localStorage.getItem("settings");
    if (value) {
      return JSON.parse(value);
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
      await browser.runtime.sendMessage({ type: "saveSettings", settings });
    } else {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  };

  return exports;
})();
