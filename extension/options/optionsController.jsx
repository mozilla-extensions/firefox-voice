/* globals React, ReactDOM, settings */

this.optionsController = (function() {
  const exports = {};
  const { useState, useEffect } = React;
  const optionsContainer = document.getElementById("options-container");

  let userSettings;
  let isInitialized = false;
  let onKeyboardShortcutError = () => {};

  browser.runtime.onMessage.addListener(message => {
    if (message.type !== "keyboardShortcutError") {
      return;
    }
    onKeyboardShortcutError(message.error);
  });

  exports.OptionsController = function() {
    const [inDevelopment, setInDevelopment] = useState(false);
    const [version, setVersion] = useState("");
    const [chime, setChime] = useState(false);
    const [keyboardShortcut, setKeyboardShortcut] = useState(null);
    const [keyboardShortcutError, setKeyboardShortcutError] = useState(
      localStorage.getItem("keyboardShortcutError")
    );
    const [telemetry, setTelemetry] = useState(true);
    const [utterancesTelemetry, setUtterancesTelemetry] = useState(false);
    const [collectAudio, setCollectAudio] = useState(false);
    const [musicService, setMusicService] = useState("");
    const [musicServiceOptions, setMusicServiceOptions] = useState([]);

    onKeyboardShortcutError = setKeyboardShortcutError;

    useEffect(() => {
      if (!isInitialized) {
        isInitialized = true;
        init();
      }
    });

    const init = async () => {
      await initVersionInfo();
      await initSettings();
    };

    const initVersionInfo = async () => {
      setInDevelopment(
        await browser.runtime.sendMessage({
          type: "inDevelopment",
        })
      );
      setVersion(browser.runtime.getManifest().version);
    };

    const initSettings = async () => {
      const result = await settings.getSettingsAndOptions();
      userSettings = result.settings;
      const options = result.options;

      setMusicService(userSettings.musicService);
      setMusicServiceOptions(options.musicServices);
      setChime(!!userSettings.chime);
      setTelemetry(!userSettings.disableTelemetry);
      setUtterancesTelemetry(!!userSettings.utterancesTelemetry);
      setCollectAudio(!!userSettings.collectAudio);
      setKeyboardShortcut(userSettings.keyboardShortcut);
    };

    const sendSettings = async () => {
      await settings.saveSettings(userSettings);
    };

    const updateMusicService = value => {
      userSettings.musicService = value;
      sendSettings();
      setMusicService(userSettings.musicService);
    };

    const updateChime = value => {
      userSettings.chime = value;
      sendSettings();
      setChime(!!userSettings.chime);
    };

    const updateTelemetry = value => {
      userSettings.disableTelemetry = !value;
      if (!value) {
        userSettings.utterancesTelemetry = false;
        setUtterancesTelemetry(false);
      }
      sendSettings();
      setTelemetry(!!value);
    };

    const updateUtterancesTelemetry = value => {
      userSettings.utterancesTelemetry = !!value;
      if (value) {
        userSettings.disableTelemetry = false;
        setTelemetry(true);
      }
      sendSettings();
      setUtterancesTelemetry(!!value);
    };

    const updateCollectAudio = value => {
      value = !!value;
      userSettings.collectAudio = value;
      sendSettings();
      setCollectAudio(value);
    };

    const updateKeyboardShortcut = value => {
      value = value || null;
      userSettings.keyboardShortcut = value;
      sendSettings();
      setKeyboardShortcut(value);
    };

    return (
      <optionsView.Options
        inDevelopment={inDevelopment}
        version={version}
        chime={chime}
        keyboardShortcut={keyboardShortcut}
        keyboardShortcutError={keyboardShortcutError}
        musicService={musicService}
        musicServiceOptions={musicServiceOptions}
        telemetry={telemetry}
        utterancesTelemetry={utterancesTelemetry}
        collectAudio={collectAudio}
        updateMusicService={updateMusicService}
        updateChime={updateChime}
        updateKeyboardShortcut={updateKeyboardShortcut}
        updateTelemetry={updateTelemetry}
        updateUtterancesTelemetry={updateUtterancesTelemetry}
        updateCollectAudio={updateCollectAudio}
      />
    );
  };

  ReactDOM.render(<exports.OptionsController />, optionsContainer);
  return exports;
})();
