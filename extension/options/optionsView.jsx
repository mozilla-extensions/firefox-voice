/* eslint-disable no-unused-vars */
// For some reason, eslint is not detecting that <Variable /> means that Variable is used

import * as browserUtil from "../browserUtil.js";
import * as routinesView from "./routinesView.js";

export const TABS = {
  GENERAL: "GENERAL",
  ROUTINES: "ROUTINES",
};

export const Options = ({
  inDevelopment,
  version,
  keyboardShortcutError,
  userOptions,
  userSettings,
  updateUserSettings,
  tabValue,
  updateNickname,
  registeredNicknames,
  useToggle,
  useEditNicknameDraft,
}) => {
  return (
    <div className="settings-page">
      <LeftSidebar version={version} tabValue={tabValue} />
      {tabValue === TABS.GENERAL ? (
        <General
          inDevelopment={inDevelopment}
          keyboardShortcutError={keyboardShortcutError}
          userOptions={userOptions}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
        ></General>
      ) : null}
      {tabValue === TABS.ROUTINES ? (
        <routinesView.Routines
          userOptions={userOptions}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          updateNickname={updateNickname}
          registeredNicknames={registeredNicknames}
          useToggle={useToggle}
          useEditNicknameDraft={useEditNicknameDraft}
        ></routinesView.Routines>
      ) : null}
    </div>
  );
};

const LeftSidebar = ({ version, tabValue }) => {
  return (
    <div className="settings-sidebar">
      <img src="./images/firefox-voice-stacked.svg" alt="Firefox Voice Logo" />
      <div className="version-info">
        <p>Version {version}</p>
        <p>
          <a href="/views/CHANGELOG.html">What's New</a>
        </p>
      </div>
      <div>
        <ul className="tab-list">
          <li>
            <a
              className={
                "tab-button " +
                (tabValue === TABS.GENERAL ? "selected-tab" : "")
              }
              href="#general"
            >
              <img
                src="./images/general.svg"
                alt="General"
                className="tab-icon"
              ></img>
              <span> General </span>
            </a>
          </li>
          <li>
            <a
              className={
                "tab-button " +
                (tabValue === TABS.ROUTINES ? "selected-tab" : "")
              }
              href="#routines"
            >
              <img
                src="./images/routines.svg"
                alt="Routines"
                className="tab-icon"
              ></img>
              <span> Routines </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

const General = ({
  inDevelopment,
  keyboardShortcutError,
  userOptions,
  userSettings,
  updateUserSettings,
}) => {
  return (
    <div className="settings-content">
      <ChimeSettings
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      <KeyboardShortcutSettings
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        keyboardShortcutError={keyboardShortcutError}
      />
      {inDevelopment ? (
        <WakewordSettings
          userOptions={userOptions}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
        />
      ) : null}
      <MusicServiceSettings
        userOptions={userOptions}
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      <DataCollection
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      <DevelopmentSettings inDevelopment={inDevelopment} />
      <AboutSection />
    </div>
  );
};

const MusicServiceSettings = ({
  userOptions,
  userSettings,
  updateUserSettings,
}) => {
  const onMusicServiceChange = event => {
    if (event) {
      userSettings.musicService = event.target.value;
      updateUserSettings(userSettings);
    }
  };
  return (
    <fieldset id="music-services">
      <legend>Music service</legend>
      <select
        value={userSettings.musicService}
        onChange={onMusicServiceChange}
        onBlur={onMusicServiceChange}
      >
        {userOptions.musicServices &&
          userOptions.musicServices.map(musicOption => (
            <option key={musicOption.name} value={musicOption.name}>
              {musicOption.name}
            </option>
          ))}
      </select>
    </fieldset>
  );
};

const ChimeSettings = ({ userSettings, updateUserSettings }) => {
  const onChimeSettingChange = event => {
    if (event) {
      userSettings.chime = event.target.checked;
      updateUserSettings(userSettings);
    }
  };
  return (
    <fieldset id="preferences">
      <legend>Preferences</legend>
      <div className="styled-checkbox">
        <input
          id="chime"
          type="checkbox"
          checked={userSettings.chime}
          onChange={onChimeSettingChange}
        />
        <label htmlFor="chime">Play chime when opening mic</label>
      </div>
    </fieldset>
  );
};

const KeyboardShortcutSettings = ({
  userSettings,
  updateUserSettings,
  keyboardShortcutError,
}) => {
  const modifier1 = isMac => {
    if (isMac) {
      return (
        <React.Fragment>
          <code>Command</code>, <code>Alt</code>, <code>MacCtrl</code>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <code>Ctrl</code>, <code>Alt</code>
      </React.Fragment>
    );
  };

  const modifier2 = isMac => {
    if (isMac) {
      return (
        <React.Fragment>
          <code>Command</code> , <code>Alt</code> , <code>MacCtrl</code> ,{" "}
          <code>Shift</code>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <code>Ctrl</code> , <code>Alt</code> , <code>Shift</code>
      </React.Fragment>
    );
  };

  const placeholder = isMac => {
    if (isMac) {
      return "Command+Period";
    }

    return "Ctrl+Period";
  };

  const onChangeSetting = event => {
    const value = event.target.value;
    userSettings.keyboardShortcut = value || null;
    updateUserSettings(userSettings);
  };

  const isMac = window.navigator.platform.match(/Mac/i);
  return (
    <fieldset id="keyboard-shortcut">
      <legend>Keyboard Shortcut</legend>
      <div>
        <input
          id="keyboard-shortcut-field"
          className="styled-input"
          placeholder={placeholder(isMac)}
          type="text"
          onChange={onChangeSetting}
          value={userSettings.keyboardShortcut}
        />
        <label htmlFor="keyboard-shortcut-field">Keyboard Shortcut</label>
        {keyboardShortcutError ? (
          <div className="error">{keyboardShortcutError}</div>
        ) : null}
        <div id="shortcut-syntax">
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
            <p>
              <code>MOD1+KEY</code> or <code>MOD1+MOD2+KEY</code>
            </p>
            <p>
              <code>MOD1</code> is one of: {modifier1(isMac)}
            </p>
            <p>
              <code>MOD2</code> is one of: {modifier2(isMac)}
            </p>
            <p>
              <code>KEY</code> is one of:{" "}
              <ul>
                <li>
                  <code>A-Z</code>
                </li>
                <li>
                  <code>0-9</code>
                </li>
                <li>
                  <code>F1-F12</code>
                </li>
                <li>
                  <code>Comma</code>, <code>Period</code>, <code>Home</code>,{" "}
                  <code>End</code>, <code>PageUp</code>, <code>PageDown</code>,{" "}
                  <code>Space</code>, <code>Insert</code>, <code>Delete</code>,{" "}
                  <code>Up</code>, <code>Down</code>, <code>Left</code>,{" "}
                  <code>Right</code>
                </li>
              </ul>
            </p>
          </blockquote>
          <p>
            <a
              href="https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly"
              target="_blank"
              rel="noopener"
            >
              Some keyboard shortcuts cannot be overridden
            </a>
          </p>
        </div>
      </div>
    </fieldset>
  );
};

const WakewordSettings = ({
  userOptions,
  userSettings,
  updateUserSettings,
}) => {
  userSettings.wakewords = userSettings.wakewords || [];
  userOptions.wakewords = userOptions.wakewords || [];

  function onEnableWakewordChange(event) {
    userSettings.enableWakeword = !!event.target.checked;
    updateUserSettings(userSettings);
  }

  function onWakewordChange(event) {
    const include = !!event.target.checked;
    const wakeword = event.target.value;
    if (include) {
      if (!userSettings.wakewords.includes(wakeword)) {
        userSettings.wakewords.push(wakeword);
      }
    } else if (userSettings.wakewords.includes(wakeword)) {
      userSettings.wakewords.splice(
        userSettings.wakewords.indexOf(wakeword),
        1
      );
    }
    userSettings.wakewords.sort();
    updateUserSettings(userSettings);
  }

  function onWakewordSensitivityChange(event) {
    userSettings.wakewordSensitivity = parseFloat(event.target.value);
    updateUserSettings(userSettings);
  }

  const wakewords = [];
  for (const wakeword of userOptions.wakewords) {
    let className = "styled-checkbox";
    if (!userSettings.enableWakeword) {
      className += " disabled";
    }
    wakewords.push(
      <li key={`wakeword-${wakeword}`}>
        <div className={className}>
          <input
            id={`wakeword-${wakeword}`}
            type="checkbox"
            value={wakeword}
            checked={userSettings.wakewords.includes(wakeword)}
            onChange={onWakewordChange}
            disabled={!userSettings.enableWakeword}
          />
          <label htmlFor={`wakeword-${wakeword}`}>
            <strong>{wakeword}</strong>
          </label>
        </div>
      </li>
    );
  }

  return (
    <fieldset id="wakeword">
      <legend>Wakeword</legend>
      <ul>
        <li>
          <div className="styled-checkbox">
            <input
              id="wakeword-enable"
              type="checkbox"
              checked={userSettings.enableWakeword}
              onChange={onEnableWakewordChange}
            />
            <label htmlFor="wakeword-enable">
              <strong>Enable wakeword detection</strong>
            </label>
          </div>
          <p>
            If you turn this option on you will be able to enable Firefox Voice
            by saying any one of the (checked) words below.
          </p>
        </li>
        <li>
          <div>
            <input
              id="wakeword-sensitivity"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userSettings.wakewordSensitivity}
              onChange={onWakewordSensitivityChange}
            />
            <label htmlFor="wakeword-sensitivity">
              {userSettings.wakewordSensitivity}
            </label>
          </div>
          <p>
            Sensitivity to listen for wakeword (1.0=very sensitive, 0.0=don't
            listen)
          </p>
        </li>
        {wakewords}
      </ul>
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

const DataCollection = ({ userSettings, updateUserSettings }) => {
  function onTelemetryChange(event) {
    const value = !!event.target.checked;
    userSettings.disableTelemetry = !value;
    if (!value) {
      userSettings.utterancesTelemetry = false;
    }
    updateUserSettings(userSettings);
  }
  function onUtteranceTelemetryChange(event) {
    const value = !!event.target.checked;
    userSettings.utterancesTelemetry = value;
    if (value) {
      userSettings.disableTelemetry = false;
    }
    updateUserSettings(userSettings);
  }
  function onCollectAudioChange(event) {
    userSettings.collectAudio = !!event.target.checked;
    updateUserSettings(userSettings);
  }

  return (
    <fieldset id="data-collection">
      <legend>Firefox Voice Data Collection and Use</legend>
      <ul>
        <li>
          <div className="styled-toggleswitch">
            <input
              className="toggle-button"
              id="technical-data"
              type="checkbox"
              checked={!userSettings.disableTelemetry}
              onChange={onTelemetryChange}
            />
            <label htmlFor="technical-data">
              <strong>
                Allow Firefox Voice to send technical and interaction data to
                Mozilla.
              </strong>
            </label>
          </div>
          <p>
            Includes anonymized high level categorization of requests (e.g.
            search, close tab, play music, etc) and error reports.
          </p>
        </li>
        <li>
          <div className="styled-toggleswitch">
            <input
              className="toggle-button"
              id="transcripts-data"
              type="checkbox"
              checked={userSettings.utterancesTelemetry}
              onChange={onUtteranceTelemetryChange}
            />
            <label htmlFor="transcripts-data">
              <strong>
                Allow Firefox Voice to send anonymized transcripts of your audio
                request.
              </strong>
            </label>
          </div>
          <p>
            Audio transcripts help Mozilla improve product accuracy and develop
            new features. Data is stored on Mozilla servers, never shared with
            other organizations and deleted after x months.
          </p>
        </li>
        <li>
          <div className="styled-toggleswitch">
            <input
              className="toggle-button"
              id="collect-audio"
              type="checkbox"
              checked={userSettings.collectAudio}
              onChange={onCollectAudioChange}
            />
            <label htmlFor="collect-audio">
              Allow Firefox Voice to collect your{" "}
              <strong>audio recordings</strong> for the purpose of improving our
              speech detection service.
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
          <a
            href="/views/lexicon.html"
            onClick={browserUtil.activateTabClickHandler}
          >
            The Big List of What You Can Say to Firefox Voice
          </a>
        </li>
      </ul>
    </fieldset>
  );
};
