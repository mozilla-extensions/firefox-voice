/* eslint-disable no-unused-vars */
// For some reason, eslint is not detecting that <Variable /> means that Variable is used
import * as browserUtil from "../browserUtil.js";
import * as routinesView from "./routinesView.js";
export const TABS = {
  GENERAL: "GENERAL",
  ROUTINES: "ROUTINES"
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
  useEditNicknameDraft
}) => {
  return React.createElement("div", {
    className: "settings-page"
  }, React.createElement(LeftSidebar, {
    version: version,
    tabValue: tabValue
  }), tabValue === TABS.GENERAL ? React.createElement(General, {
    inDevelopment: inDevelopment,
    keyboardShortcutError: keyboardShortcutError,
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }) : null, tabValue === TABS.ROUTINES ? React.createElement(routinesView.Routines, {
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings,
    updateNickname: updateNickname,
    registeredNicknames: registeredNicknames,
    useToggle: useToggle,
    useEditNicknameDraft: useEditNicknameDraft
  }) : null);
};

const LeftSidebar = ({
  version,
  tabValue
}) => {
  return React.createElement("div", {
    className: "settings-sidebar"
  }, React.createElement("img", {
    src: "./images/firefox-voice-stacked.svg",
    alt: "Firefox Voice Logo"
  }), React.createElement("div", {
    className: "version-info"
  }, React.createElement("p", null, "Version ", version), React.createElement("p", null, React.createElement("a", {
    href: "/views/CHANGELOG.html"
  }, "What's New"))), React.createElement("div", null, React.createElement("ul", {
    className: "tab-list"
  }, React.createElement("li", null, React.createElement("a", {
    className: "tab-button " + (tabValue === TABS.GENERAL ? "selected-tab" : ""),
    href: "#general"
  }, React.createElement("img", {
    src: "./images/general.svg",
    alt: "General",
    className: "tab-icon"
  }), React.createElement("span", null, " General "))), React.createElement("li", null, React.createElement("a", {
    className: "tab-button " + (tabValue === TABS.ROUTINES ? "selected-tab" : ""),
    href: "#routines"
  }, React.createElement("img", {
    src: "./images/routines.svg",
    alt: "Routines",
    className: "tab-icon"
  }), React.createElement("span", null, " Routines "))))));
};

const General = ({
  inDevelopment,
  keyboardShortcutError,
  userOptions,
  userSettings,
  updateUserSettings
}) => {
  return React.createElement("div", {
    className: "settings-content"
  }, React.createElement(ChimeSettings, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), React.createElement(KeyboardShortcutSettings, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings,
    keyboardShortcutError: keyboardShortcutError
  }), React.createElement(WakewordSettings, {
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), React.createElement(MusicServiceSettings, {
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), React.createElement(DataCollection, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), React.createElement(DevelopmentSettings, {
    inDevelopment: inDevelopment
  }), React.createElement(AboutSection, null));
};

const MusicServiceSettings = ({
  userOptions,
  userSettings,
  updateUserSettings
}) => {
  const onMusicServiceChange = event => {
    if (event) {
      userSettings.musicService = event.target.value;
      updateUserSettings(userSettings);
    }
  };

  return React.createElement("fieldset", {
    id: "music-services"
  }, React.createElement("legend", null, "Music service"), React.createElement("select", {
    value: userSettings.musicService,
    onChange: onMusicServiceChange,
    onBlur: onMusicServiceChange
  }, userOptions.musicServices && userOptions.musicServices.map(musicOption => React.createElement("option", {
    key: musicOption.name,
    value: musicOption.name
  }, musicOption.name))));
};

const ChimeSettings = ({
  userSettings,
  updateUserSettings
}) => {
  const onChimeSettingChange = event => {
    if (event) {
      userSettings.chime = event.target.checked;
      updateUserSettings(userSettings);
    }
  };

  return React.createElement("fieldset", {
    id: "preferences"
  }, React.createElement("legend", null, "Preferences"), React.createElement("div", {
    className: "styled-checkbox"
  }, React.createElement("input", {
    id: "chime",
    type: "checkbox",
    checked: userSettings.chime,
    onChange: onChimeSettingChange
  }), React.createElement("label", {
    htmlFor: "chime"
  }, "Play chime when opening mic")));
};

const KeyboardShortcutSettings = ({
  userSettings,
  updateUserSettings,
  keyboardShortcutError
}) => {
  const modifier1 = isMac => {
    if (isMac) {
      return React.createElement(React.Fragment, null, React.createElement("code", null, "Command"), ", ", React.createElement("code", null, "Alt"), ", ", React.createElement("code", null, "MacCtrl"));
    }

    return React.createElement(React.Fragment, null, React.createElement("code", null, "Ctrl"), ", ", React.createElement("code", null, "Alt"));
  };

  const modifier2 = isMac => {
    if (isMac) {
      return React.createElement(React.Fragment, null, React.createElement("code", null, "Command"), " , ", React.createElement("code", null, "Alt"), " , ", React.createElement("code", null, "MacCtrl"), " ,", " ", React.createElement("code", null, "Shift"));
    }

    return React.createElement(React.Fragment, null, React.createElement("code", null, "Ctrl"), " , ", React.createElement("code", null, "Alt"), " , ", React.createElement("code", null, "Shift"));
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
  return React.createElement("fieldset", {
    id: "keyboard-shortcut"
  }, React.createElement("legend", null, "Keyboard Shortcut"), React.createElement("div", null, React.createElement("input", {
    id: "keyboard-shortcut-field",
    className: "styled-input",
    placeholder: placeholder(isMac),
    type: "text",
    onChange: onChangeSetting,
    value: userSettings.keyboardShortcut
  }), React.createElement("label", {
    htmlFor: "keyboard-shortcut-field"
  }, "Keyboard Shortcut"), keyboardShortcutError ? React.createElement("div", {
    className: "error"
  }, keyboardShortcutError) : null, React.createElement("div", {
    id: "shortcut-syntax"
  }, "Shortcut syntax (", React.createElement("a", {
    href: "https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Key_combinations",
    target: "_blank",
    rel: "noopener"
  }, "details"), "):", React.createElement("blockquote", null, React.createElement("p", null, React.createElement("code", null, "MOD1+KEY"), " or ", React.createElement("code", null, "MOD1+MOD2+KEY")), React.createElement("p", null, React.createElement("code", null, "MOD1"), " is one of: ", modifier1(isMac)), React.createElement("p", null, React.createElement("code", null, "MOD2"), " is one of: ", modifier2(isMac)), React.createElement("p", null, React.createElement("code", null, "KEY"), " is one of:", " ", React.createElement("ul", null, React.createElement("li", null, React.createElement("code", null, "A-Z")), React.createElement("li", null, React.createElement("code", null, "0-9")), React.createElement("li", null, React.createElement("code", null, "F1-F12")), React.createElement("li", null, React.createElement("code", null, "Comma"), ", ", React.createElement("code", null, "Period"), ", ", React.createElement("code", null, "Home"), ",", " ", React.createElement("code", null, "End"), ", ", React.createElement("code", null, "PageUp"), ", ", React.createElement("code", null, "PageDown"), ",", " ", React.createElement("code", null, "Space"), ", ", React.createElement("code", null, "Insert"), ", ", React.createElement("code", null, "Delete"), ",", " ", React.createElement("code", null, "Up"), ", ", React.createElement("code", null, "Down"), ", ", React.createElement("code", null, "Left"), ",", " ", React.createElement("code", null, "Right"))))), React.createElement("p", null, React.createElement("a", {
    href: "https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly",
    target: "_blank",
    rel: "noopener"
  }, "Some keyboard shortcuts cannot be overridden")))));
};

const WakewordSettings = ({
  userOptions,
  userSettings,
  updateUserSettings
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
      userSettings.wakewords.splice(userSettings.wakewords.indexOf(wakeword), 1);
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

    wakewords.push(React.createElement("li", {
      key: `wakeword-${wakeword}`
    }, React.createElement("div", {
      className: className
    }, React.createElement("input", {
      id: `wakeword-${wakeword}`,
      type: "checkbox",
      value: wakeword,
      checked: userSettings.wakewords.includes(wakeword),
      onChange: onWakewordChange,
      disabled: !userSettings.enableWakeword
    }), React.createElement("label", {
      htmlFor: `wakeword-${wakeword}`
    }, React.createElement("strong", null, wakeword)))));
  }

  return React.createElement("fieldset", {
    id: "wakeword"
  }, React.createElement("legend", null, "Wakeword"), React.createElement("ul", null, React.createElement("li", null, React.createElement("div", {
    className: "styled-checkbox"
  }, React.createElement("input", {
    id: "wakeword-enable",
    type: "checkbox",
    checked: userSettings.enableWakeword,
    onChange: onEnableWakewordChange
  }), React.createElement("label", {
    htmlFor: "wakeword-enable"
  }, React.createElement("strong", null, "Enable wakeword detection"))), React.createElement("p", null, "If you turn this option on you will be able to enable Firefox Voice by saying any one of the (checked) words below.")), React.createElement("li", null, React.createElement("div", null, React.createElement("input", {
    id: "wakeword-sensitivity",
    type: "range",
    min: "0",
    max: "1",
    step: "0.05",
    value: userSettings.wakewordSensitivity,
    onChange: onWakewordSensitivityChange
  }), React.createElement("label", {
    htmlFor: "wakeword-sensitivity"
  }, userSettings.wakewordSensitivity)), React.createElement("p", null, "Sensitivity to listen for wakeword (1.0=very sensitive, 0.0=don't listen)")), wakewords));
};

const DevelopmentSettings = ({
  inDevelopment
}) => {
  return React.createElement("fieldset", {
    id: "development-access"
  }, React.createElement("legend", null, "Development access"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "/tests/intent-viewer.html"
  }, "Intent Viewer")), React.createElement("li", null, React.createElement("a", {
    href: "/popup/popup.html"
  }, "View popup in tab"))));
};

const DataCollection = ({
  userSettings,
  updateUserSettings
}) => {
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

  return React.createElement("fieldset", {
    id: "data-collection"
  }, React.createElement("legend", null, "Firefox Voice Data Collection and Use"), React.createElement("ul", null, React.createElement("li", null, React.createElement("div", {
    className: "styled-toggleswitch"
  }, React.createElement("input", {
    className: "toggle-button",
    id: "technical-data",
    type: "checkbox",
    checked: !userSettings.disableTelemetry,
    onChange: onTelemetryChange
  }), React.createElement("label", {
    htmlFor: "technical-data"
  }, React.createElement("strong", null, "Allow Firefox Voice to send technical and interaction data to Mozilla."))), React.createElement("p", null, "Includes anonymized high level categorization of requests (e.g. search, close tab, play music, etc) and error reports.")), React.createElement("li", null, React.createElement("div", {
    className: "styled-toggleswitch"
  }, React.createElement("input", {
    className: "toggle-button",
    id: "transcripts-data",
    type: "checkbox",
    checked: userSettings.utterancesTelemetry,
    onChange: onUtteranceTelemetryChange
  }), React.createElement("label", {
    htmlFor: "transcripts-data"
  }, React.createElement("strong", null, "Allow Firefox Voice to send anonymized transcripts of your audio request."))), React.createElement("p", null, "Audio transcripts help Mozilla improve product accuracy and develop new features. Data is stored on Mozilla servers, never shared with other organizations and deleted after x months.")), React.createElement("li", null, React.createElement("div", {
    className: "styled-toggleswitch"
  }, React.createElement("input", {
    className: "toggle-button",
    id: "collect-audio",
    type: "checkbox",
    checked: userSettings.collectAudio,
    onChange: onCollectAudioChange
  }), React.createElement("label", {
    htmlFor: "collect-audio"
  }, "Allow Firefox Voice to collect your", " ", React.createElement("strong", null, "audio recordings"), " for the purpose of improving our speech detection service.")))));
};

const AboutSection = () => {
  return React.createElement("fieldset", {
    id: "about"
  }, React.createElement("legend", null, "About"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "https://firefox-voice-feedback.herokuapp.com/"
  }, "Give Your Feedback")), React.createElement("li", null, React.createElement("a", {
    href: "https://mozilla.github.io/firefox-voice/privacy-policy.html"
  }, "How Mozilla Protects Your Voice Privacy")), React.createElement("li", null, React.createElement("a", {
    href: "https://www.mozilla.org/en-US/about/legal/terms/firefox/"
  }, "About Your Rights")), React.createElement("li", null, React.createElement("a", {
    href: "/views/lexicon.html",
    onClick: browserUtil.activateTabClickHandler
  }, "The Big List of What You Can Say to Firefox Voice"))));
};