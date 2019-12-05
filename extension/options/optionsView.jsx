/* eslint-disable no-unused-vars */
// For some reason, eslint is not detecting that <Variable /> means that Variable is used

this.optionsView = (function() {
  const exports = {};

  exports.Options = ({
    inDevelopment,
    version,
    chime,
    keyboardShortcut,
    keyboardShortcutError,
    musicService,
    musicServiceOptions,
    telemetry,
    utterancesTelemetry,
    collectAudio,
    updateMusicService,
    updateChime,
    updateKeyboardShortcut,
    updateTelemetry,
    updateUtterancesTelemetry,
    updateCollectAudio,
  }) => {
    return (
      <div className="settings-page">
        <LeftSidebar version={version} />
        <RightContent
          inDevelopment={inDevelopment}
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
      </div>
    );
  };

  const LeftSidebar = ({ version }) => {
    return (
      <div className="settings-sidebar">
        <img
          src="./images/firefox-voice-stacked.svg"
          alt="Firefox Voice Logo"
        />
        <div className="version-info">
          <p>Version {version}</p>
          <p>
            <a href="/views/CHANGELOG.html">What's New</a>
          </p>
        </div>
      </div>
    );
  };

  const RightContent = ({
    inDevelopment,
    chime,
    keyboardShortcut,
    keyboardShortcutError,
    musicService,
    musicServiceOptions,
    telemetry,
    utterancesTelemetry,
    collectAudio,
    updateMusicService,
    updateChime,
    updateKeyboardShortcut,
    updateTelemetry,
    updateUtterancesTelemetry,
    updateCollectAudio,
  }) => {
    return (
      <div className="settings-content">
        <ChimeSettings chime={chime} updateChime={updateChime} />
        <KeyboardShortcutSettings
          keyboardShortcut={keyboardShortcut}
          updateKeyboardShortcut={updateKeyboardShortcut}
          keyboardShortcutError={keyboardShortcutError}
        />
        <MusicServiceSettings
          musicService={musicService}
          musicServiceOptions={musicServiceOptions}
          updateMusicService={updateMusicService}
        />
        <DataCollection
          telemetry={telemetry}
          utterancesTelemetry={utterancesTelemetry}
          collectAudio={collectAudio}
          updateTelemetry={updateTelemetry}
          updateUtterancesTelemetry={updateUtterancesTelemetry}
          updateCollectAudio={updateCollectAudio}
        />
        <DevelopmentSettings inDevelopment={inDevelopment} />
        <AboutSection />
      </div>
    );
  };

  const MusicServiceSettings = ({
    musicService,
    musicServiceOptions,
    updateMusicService,
  }) => {
    const onMusicServiceChange = event => {
      if (event) {
        updateMusicService(event.target.value);
      }
    };
    return (
      <fieldset id="music-services">
        <legend>Music service</legend>
        <select value={musicService} onChange={onMusicServiceChange}>
          {musicServiceOptions.map(musicOption => (
            <option key={musicOption.name} value={musicOption.name}>
              {musicOption.name}
            </option>
          ))}
        </select>
      </fieldset>
    );
  };

  const ChimeSettings = ({ chime, updateChime }) => {
    const onChimeSettingChange = event => {
      if (event) {
        updateChime(event.target.checked);
      }
    };
    return (
      <fieldset id="preferences">
        <legend>Preferences</legend>
        <div className="styled-checkbox">
          <input
            id="chime"
            type="checkbox"
            checked={chime}
            onChange={onChimeSettingChange}
          />
          <label htmlFor="chime">Play chime when opening mic</label>
        </div>
      </fieldset>
    );
  };

  const KeyboardShortcutSettings = ({
    keyboardShortcut,
    updateKeyboardShortcut,
    keyboardShortcutError,
  }) => {
    const onChangeSetting = event => {
      updateKeyboardShortcut(event.target.value);
    };
    const isMac = window.navigator.platform.match(/Mac/i);
    let modifier1, modifier2, placeholder;
    if (isMac) {
      modifier1 = "Command Alt MacCtrl";
      modifier2 = "Command Alt MacCtrl Shift";
      placeholder = "Command+Period";
    } else {
      modifier1 = "Ctrl Alt";
      modifier2 = "Ctrl Alt Shift";
      placeholder = "Ctrl+Period";
    }
    return (
      <fieldset id="keyboard-shortcut">
        <legend>Keyboard Shortcut</legend>
        <div>
          <input
            id="keyboard-shortcut-field"
            placeholder={placeholder}
            type="text"
            onChange={onChangeSetting}
            value={keyboardShortcut}
          />
          <label htmlFor="keyboard-shortcut-field">Keyboard Shortcut</label>
          <div>
            Shortcut syntax (
            <a
              href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Key_combinations"
              target="_blank"
              rel="noopener"
            >
              details
            </a>
            ):
            <blockquote>
              <code>MOD1+KEY</code> or <code>MOD1+MOD2+KEY</code> <br />
              <code>MOD1</code> is one of: <code>{modifier1}</code> <br />
              <code>MOD2</code> is one of: <code>{modifier2}</code> <br />
              <code>KEY&nbsp;</code> is one of:{" "}
              <code>
                A-Z 0-9 F1-F12 Comma Period Home End PageUp PageDown Space
                Insert Delete Up Down Left Right
              </code>
            </blockquote>
          </div>
          {keyboardShortcutError ? (
            <div className="error">{keyboardShortcutError}</div>
          ) : null}
        </div>
      </fieldset>
    );
  };

  const DevelopmentSettings = ({ inDevelopment }) => {
    return (
      <fieldset id="development-access">
        <legend>Development access</legend>
        <ul>
          <li>
            <a href="/tests/intent-viewer.html">Intent Viewer</a>
          </li>
          <li>
            <a href="/popup/popup.html">View popup in tab</a>
          </li>
        </ul>
      </fieldset>
    );
  };

  const DataCollection = ({
    telemetry,
    utterancesTelemetry,
    collectAudio,
    updateTelemetry,
    updateUtterancesTelemetry,
    updateCollectAudio,
  }) => {
    function onTelemetryChange(event) {
      updateTelemetry(event.target.checked);
    }
    function onUtteranceTelemetryChange(event) {
      updateUtterancesTelemetry(event.target.checked);
    }
    function onCollectAudioChange(event) {
      updateCollectAudio(event.target.checked);
    }

    return (
      <fieldset id="data-collection">
        <legend>Firefox Voice Data Collection and Use</legend>
        <ul>
          <li>
            <div className="styled-checkbox">
              <input
                id="technical-data"
                type="checkbox"
                checked={telemetry}
                onChange={onTelemetryChange}
              />
              <label htmlFor="technical-data">
                Allow Firefox Voice to send technical and interaction data to
                Mozilla.
              </label>
            </div>
            <p>
              Includes anonymized high level categorization of requests (e.g.
              search, close tab, play music, etc) and error reports.
            </p>
          </li>
          <li>
            <div className="styled-checkbox">
              <input
                id="transcripts-data"
                type="checkbox"
                checked={utterancesTelemetry}
                onChange={onUtteranceTelemetryChange}
              />
              <label htmlFor="transcripts-data">
                Allow Firefox Voice to send anonymized transcripts of your audio
                request.
              </label>
            </div>
            <p>
              Audio transcripts help Mozilla improve product accuracy and
              develop new features. Data is stored on Mozilla servers, never
              shared with other organizations and deleted after x months.
            </p>
          </li>
          <li>
            <div className="styled-checkbox">
              <input
                id="collect-audio"
                type="checkbox"
                checked={collectAudio}
                onChange={onCollectAudioChange}
              />
              <label htmlFor="collect-audio">
                Allow Firefox Voice to collect your{" "}
                <strong>audio recordings</strong> for the purpose of improving
                our speech detection service.
              </label>
            </div>
          </li>
        </ul>
      </fieldset>
    );
  };

  const AboutSection = () => {
    return (
      <fieldset id="about">
        <legend>About</legend>
        <ul>
          <li>
            <a href="https://firefox-voice-feedback.herokuapp.com/">
              Give Your Feedback
            </a>
          </li>
          <li>
            <a href="https://mozilla.github.io/firefox-voice/privacy-policy.html">
              How Mozilla Protects Your Voice Privacy
            </a>
          </li>
          <li>
            <a href="https://www.mozilla.org/en-US/about/legal/terms/firefox/">
              About Your Rights
            </a>
          </li>
          <li>
            <a href="/views/lexicon.html">
              The Big List of What You Can Say to Firefox Voice
            </a>
          </li>
        </ul>
      </fieldset>
    );
  };

  return exports;
})();
