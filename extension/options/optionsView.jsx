/* eslint-disable no-unused-vars */
// For some reason, eslint is not detecting that <Variable /> means that Variable is used

import * as browserUtil from "../browserUtil.js";
import * as routinesView from "./routinesView.js";
import * as historyView from "./history/historyView.js";

export const TABS = {
  GENERAL: "GENERAL",
  ROUTINES: "ROUTINES",
  HISTORY: "HISTORY",
};

export const Options = ({
  inDevelopment,
  version,
  keyboardShortcutError,
  userOptions,
  userSettings,
  updateUserSettings,
  tabValue,
  updateRoutine,
  registeredRoutines,
  useToggle,
  useEditRoutineDraft,
  audioInputDevices,
  synthesizedVoices,
  inputLocales,
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
          audioInputDevices={audioInputDevices}
          synthesizedVoices={synthesizedVoices}
          inputLocales={inputLocales}
        ></General>
      ) : null}
      {tabValue === TABS.ROUTINES ? (
        <routinesView.Routines
          userOptions={userOptions}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          updateRoutine={updateRoutine}
          registeredRoutines={registeredRoutines}
          useToggle={useToggle}
          useEditRoutineDraft={useEditRoutineDraft}
        ></routinesView.Routines>
      ) : null}
      {tabValue === TABS.HISTORY ? (
        <historyView.History></historyView.History>
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
          <li>
            <a
              className={
                "tab-button " +
                (tabValue === TABS.HISTORY ? "selected-tab" : "")
              }
              href="#history"
            >
              <img
                src="./images/history.svg"
                alt="History"
                className="tab-icon"
              ></img>
              <span> History </span>
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
  audioInputDevices,
  synthesizedVoices,
  inputLocales,
}) => {
  return (
    <div className="settings-content">
      <PreferenceSettings
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        audioInputDevices={audioInputDevices}
        synthesizedVoices={synthesizedVoices}
        inputLocales={inputLocales}
      />
      {userOptions.wakewords && userOptions.wakewords.length ? (
        <WakewordSettings
          userOptions={userOptions}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
        />
      ) : null}
      <KeyboardShortcutSettings
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        keyboardShortcutError={keyboardShortcutError}
      />
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
              {musicOption.title}
            </option>
          ))}
      </select>
    </fieldset>
  );
};

const SelectMicPreferences = ({
  userSettings,
  updateUserSettings,
  audioInputDevices,
}) => {
  const onMicPreferenceChange = event => {
    if (event) {
      userSettings.audioInputId = event.target.value;
      updateUserSettings(userSettings);
    }
  };
  return (
    <div id="mic-selector">
      <span>Microphone </span>
      <select
        value={userSettings.audioInputId}
        onChange={onMicPreferenceChange}
        onBlur={onMicPreferenceChange}
      >
        {audioInputDevices &&
          audioInputDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
      </select>
    </div>
  );
};

const VoiceInputLocalePreferences = ({
  userSettings,
  updateUserSettings,
  inputLocales,
}) => {
  const onLocalePreferenceChange = event => {
    userSettings.userLocale = event.target.value;
    updateUserSettings(userSettings);
  };
  const locale = userSettings.userLocale || navigator.language;
  const defaultValue = locale && locale.startsWith("en-") ? locale : "en-US";
  return (
    <div id="voice-input">
      <div id="voice-input-header">Language and locale</div>
      <div>
        Help Firefox Voice to better recognize your voice by specifying your
        English accent
      </div>
      <div id="voice-selector">
        <span>Locale </span>
        <select
          value={defaultValue}
          onChange={onLocalePreferenceChange}
          onBlur={onLocalePreferenceChange}
        >
          {inputLocales &&
            inputLocales.map(locale => (
              <option key={locale.name} value={locale.code}>
                {locale.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

const VoiceOutputPreferences = ({
  userSettings,
  updateUserSettings,
  synthesizedVoices,
}) => {
  const onVoiceOutputPreferenceChange = event => {
    userSettings.speechOutput = !!event.target.checked;
    updateUserSettings(userSettings);
  };
  return (
    <div id="voice-output">
      <div id="voice-output-header">Voice responses</div>
      {synthesizedVoices.length ? (
        <React.Fragment>
          <div className="styled-toggleswitch">
            <input
              className="toggle-button"
              id="voice-output-pref"
              type="checkbox"
              checked={userSettings.speechOutput}
              onChange={onVoiceOutputPreferenceChange}
            />
            <label htmlFor="voice-output-pref">
              <strong>
                Firefox Voice will respond to many requests with speech
              </strong>
            </label>
          </div>
          <SelectVoicePreference
            userSettings={userSettings}
            updateUserSettings={updateUserSettings}
            synthesizedVoices={synthesizedVoices}
          />
        </React.Fragment>
      ) : (
        <div id="voice-output-unavailable">
          It seems that your devices does not have any built-in synthesized
          voices, so voice responses are not available.
        </div>
      )}
    </div>
  );
};

const SelectVoicePreference = ({
  userSettings,
  updateUserSettings,
  synthesizedVoices,
}) => {
  const onVoicePreferenceChange = event => {
    if (event) {
      userSettings.preferredVoice = event.target.value;
      updateUserSettings(userSettings);
    }
  };
  return (
    <div id="voice-selector">
      <span>Voice </span>
      <select
        value={userSettings.preferredVoice}
        onChange={onVoicePreferenceChange}
        onBlur={onVoicePreferenceChange}
      >
        {synthesizedVoices &&
          synthesizedVoices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
              {voice.default ? " - Default System Voice" : ""}
            </option>
          ))}
      </select>
    </div>
  );
};

const PreferenceSettings = ({
  userSettings,
  updateUserSettings,
  audioInputDevices,
  synthesizedVoices,
  inputLocales,
}) => {
  const onPreferenceChange = setting => event => {
    if (event) {
      userSettings[setting] = event.target.checked;
      updateUserSettings(userSettings);
    }
  };
  return (
    <fieldset id="preferences">
      <legend>Preferences</legend>
      <div className="checkbox-wrapper">
        <div className="styled-checkbox">
          <input
            id="chime"
            type="checkbox"
            checked={userSettings.chime}
            onChange={onPreferenceChange("chime")}
          />
          <label htmlFor="chime">Play chime when opening mic</label>
        </div>
      </div>
      <div className="checkbox-wrapper">
        <div className="styled-checkbox">
          <input
            id="mic-state"
            type="checkbox"
            checked={userSettings.listenForFollowup}
            onChange={onPreferenceChange("listenForFollowup")}
          />
          <label htmlFor="mic-state">
            Keep the microphone on for follow up responses
          </label>
        </div>
      </div>
      <SelectMicPreferences
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        audioInputDevices={audioInputDevices}
      />
      <VoiceOutputPreferences
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        synthesizedVoices={synthesizedVoices}
      />
      <VoiceInputLocalePreferences
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
        inputLocales={inputLocales}
      />
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

  if (userOptions.wakewords.length > 1) {
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
  }

  // FIXME: right now wakewords don't support sensitivity or multiple wakewords, so
  // those settings aren't applicable and are crudely hidden below:
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
              <strong>Enable wakeword detection</strong> powered by the{" "}
              <a
                href="https://github.com/castorini/howl/"
                rel="nooopener"
                target="_blank"
              >
                Howl Project
              </a>
            </label>
          </div>
          <p>
            If you turn this option on you will be able to enable Firefox Voice
            by saying <strong>Hey Firefox</strong>.
          </p>
        </li>
        {false ? (
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
        ) : null}
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
          <a href="/views/timing/timing.html">Timing/performance information</a>
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
      <p>
        We store this data without personally identifiable information, which
        means we can’t match data, transcripts, or a voice to a particular
        person.
      </p>
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
            This includes high-level categorizations of requests (e.g., search,
            close tab, and play music) and error reports.
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
                Allow Firefox Voice to store transcripts of your commands.
              </strong>
            </label>
          </div>
          <p>
            Audio transcripts help Mozilla improve product accuracy and develop
            new features.
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
              <strong>
                Allow Firefox Voice to store your voice recordings.
              </strong>
            </label>
          </div>
          <p>
            Voice recordings help Mozilla teach our systems how to recognize a
            wider variety of diverse voices, in all sorts of environments.
          </p>
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
          <a
            href="/views/privacy-policy.html"
            onClick={browserUtil.activateTabClickHandler}
          >
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
