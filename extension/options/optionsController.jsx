/* globals React, ReactDOM, buildSettings, settings */

this.optionsController = (function() {
  const exports = {};
  const { useState, useEffect } = React;
  const optionsContainer = document.getElementById("options-container");

  let userSettings;
  let isInitialized = false;

  exports.OptionsController = function() {
    const [inDevelopment, setInDevelopment] = useState(false);
    const [version, setVersion] = useState("");
    const [buildTime, setBuildTime] = useState("");
    const [gitCommit, setGitCommit] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [chime, setChime] = useState(false);
    const [telemetry, setTelemetry] = useState(true);
    const [utterancesTelemetry, setUtterancesTelemetry] = useState(false);
    const [musicService, setMusicService] = useState("");
    const [musicServiceOptions, setMusicServiceOptions] = useState([]);

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
      setBuildTime(buildSettings.buildTime);

      let { gitCommit } = buildSettings;
      if (gitCommit.endsWith("-dirty")) {
        setIsDirty(true);
        gitCommit = gitCommit.split("-")[0];
      }
      setGitCommit(gitCommit);
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

    return (
      <optionsView.Options
        inDevelopment={inDevelopment}
        version={version}
        buildTime={buildTime}
        gitCommit={gitCommit}
        isDirty={isDirty}
        chime={chime}
        musicService={musicService}
        musicServiceOptions={musicServiceOptions}
        telemetry={telemetry}
        utterancesTelemetry={utterancesTelemetry}
        updateMusicService={updateMusicService}
        updateChime={updateChime}
        updateTelemetry={updateTelemetry}
        updateUtterancesTelemetry={updateUtterancesTelemetry}
      />
    );
  };

  ReactDOM.render(<exports.OptionsController />, optionsContainer);
  return exports;
})();
