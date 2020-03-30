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
  return /*#__PURE__*/React.createElement("div", {
    className: "settings-page"
  }, /*#__PURE__*/React.createElement(LeftSidebar, {
    version: version,
    tabValue: tabValue
  }), tabValue === TABS.GENERAL ? /*#__PURE__*/React.createElement(General, {
    inDevelopment: inDevelopment,
    keyboardShortcutError: keyboardShortcutError,
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }) : null, tabValue === TABS.ROUTINES ? /*#__PURE__*/React.createElement(routinesView.Routines, {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "settings-sidebar"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/firefox-voice-stacked.svg",
    alt: "Firefox Voice Logo"
  }), /*#__PURE__*/React.createElement("div", {
    className: "version-info"
  }, /*#__PURE__*/React.createElement("p", null, "Version ", version), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
    href: "/views/CHANGELOG.html"
  }, "What's New"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("ul", {
    className: "tab-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    className: "tab-button " + (tabValue === TABS.GENERAL ? "selected-tab" : ""),
    href: "#general"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/general.svg",
    alt: "General",
    className: "tab-icon"
  }), /*#__PURE__*/React.createElement("span", null, " General "))), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    className: "tab-button " + (tabValue === TABS.ROUTINES ? "selected-tab" : ""),
    href: "#routines"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/routines.svg",
    alt: "Routines",
    className: "tab-icon"
  }), /*#__PURE__*/React.createElement("span", null, " Routines "))))));
};

const General = ({
  inDevelopment,
  keyboardShortcutError,
  userOptions,
  userSettings,
  updateUserSettings
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "settings-content"
  }, /*#__PURE__*/React.createElement(ChimeSettings, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), /*#__PURE__*/React.createElement(KeyboardShortcutSettings, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings,
    keyboardShortcutError: keyboardShortcutError
  }), /*#__PURE__*/React.createElement(WakewordSettings, {
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), /*#__PURE__*/React.createElement(MusicServiceSettings, {
    userOptions: userOptions,
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), /*#__PURE__*/React.createElement(DataCollection, {
    userSettings: userSettings,
    updateUserSettings: updateUserSettings
  }), /*#__PURE__*/React.createElement(DevelopmentSettings, {
    inDevelopment: inDevelopment
  }), /*#__PURE__*/React.createElement(AboutSection, null));
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

  return /*#__PURE__*/React.createElement("fieldset", {
    id: "music-services"
  }, /*#__PURE__*/React.createElement("legend", null, "Music service"), /*#__PURE__*/React.createElement("select", {
    value: userSettings.musicService,
    onChange: onMusicServiceChange,
    onBlur: onMusicServiceChange
  }, userOptions.musicServices && userOptions.musicServices.map(musicOption => /*#__PURE__*/React.createElement("option", {
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

  return /*#__PURE__*/React.createElement("fieldset", {
    id: "preferences"
  }, /*#__PURE__*/React.createElement("legend", null, "Preferences"), /*#__PURE__*/React.createElement("div", {
    className: "styled-checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    id: "chime",
    type: "checkbox",
    checked: userSettings.chime,
    onChange: onChimeSettingChange
  }), /*#__PURE__*/React.createElement("label", {
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
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", null, "Command"), ", ", /*#__PURE__*/React.createElement("code", null, "Alt"), ", ", /*#__PURE__*/React.createElement("code", null, "MacCtrl"));
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", null, "Ctrl"), ", ", /*#__PURE__*/React.createElement("code", null, "Alt"));
  };

  const modifier2 = isMac => {
    if (isMac) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", null, "Command"), " , ", /*#__PURE__*/React.createElement("code", null, "Alt"), " , ", /*#__PURE__*/React.createElement("code", null, "MacCtrl"), " ,", " ", /*#__PURE__*/React.createElement("code", null, "Shift"));
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", null, "Ctrl"), " , ", /*#__PURE__*/React.createElement("code", null, "Alt"), " , ", /*#__PURE__*/React.createElement("code", null, "Shift"));
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
  return /*#__PURE__*/React.createElement("fieldset", {
    id: "keyboard-shortcut"
  }, /*#__PURE__*/React.createElement("legend", null, "Keyboard Shortcut"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    id: "keyboard-shortcut-field",
    className: "styled-input",
    placeholder: placeholder(isMac),
    type: "text",
    onChange: onChangeSetting,
    value: userSettings.keyboardShortcut
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "keyboard-shortcut-field"
  }, "Keyboard Shortcut"), keyboardShortcutError ? /*#__PURE__*/React.createElement("div", {
    className: "error"
  }, keyboardShortcutError) : null, /*#__PURE__*/React.createElement("div", {
    id: "shortcut-syntax"
  }, "Shortcut syntax (", /*#__PURE__*/React.createElement("a", {
    href: "https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Key_combinations",
    target: "_blank",
    rel: "noopener"
  }, "details"), "):", /*#__PURE__*/React.createElement("blockquote", null, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("code", null, "MOD1+KEY"), " or ", /*#__PURE__*/React.createElement("code", null, "MOD1+MOD2+KEY")), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("code", null, "MOD1"), " is one of: ", modifier1(isMac)), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("code", null, "MOD2"), " is one of: ", modifier2(isMac)), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("code", null, "KEY"), " is one of:", " ", /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "A-Z")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "0-9")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "F1-F12")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "Comma"), ", ", /*#__PURE__*/React.createElement("code", null, "Period"), ", ", /*#__PURE__*/React.createElement("code", null, "Home"), ",", " ", /*#__PURE__*/React.createElement("code", null, "End"), ", ", /*#__PURE__*/React.createElement("code", null, "PageUp"), ", ", /*#__PURE__*/React.createElement("code", null, "PageDown"), ",", " ", /*#__PURE__*/React.createElement("code", null, "Space"), ", ", /*#__PURE__*/React.createElement("code", null, "Insert"), ", ", /*#__PURE__*/React.createElement("code", null, "Delete"), ",", " ", /*#__PURE__*/React.createElement("code", null, "Up"), ", ", /*#__PURE__*/React.createElement("code", null, "Down"), ", ", /*#__PURE__*/React.createElement("code", null, "Left"), ",", " ", /*#__PURE__*/React.createElement("code", null, "Right"))))), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
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

    wakewords.push( /*#__PURE__*/React.createElement("li", {
      key: `wakeword-${wakeword}`
    }, /*#__PURE__*/React.createElement("div", {
      className: className
    }, /*#__PURE__*/React.createElement("input", {
      id: `wakeword-${wakeword}`,
      type: "checkbox",
      value: wakeword,
      checked: userSettings.wakewords.includes(wakeword),
      onChange: onWakewordChange,
      disabled: !userSettings.enableWakeword
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: `wakeword-${wakeword}`
    }, /*#__PURE__*/React.createElement("strong", null, wakeword)))));
  }

  return /*#__PURE__*/React.createElement("fieldset", {
    id: "wakeword"
  }, /*#__PURE__*/React.createElement("legend", null, "Wakeword"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
    className: "styled-checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    id: "wakeword-enable",
    type: "checkbox",
    checked: userSettings.enableWakeword,
    onChange: onEnableWakewordChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "wakeword-enable"
  }, /*#__PURE__*/React.createElement("strong", null, "Enable wakeword detection"))), /*#__PURE__*/React.createElement("p", null, "If you turn this option on you will be able to enable Firefox Voice by saying any one of the (checked) words below.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    id: "wakeword-sensitivity",
    type: "range",
    min: "0",
    max: "1",
    step: "0.05",
    value: userSettings.wakewordSensitivity,
    onChange: onWakewordSensitivityChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "wakeword-sensitivity"
  }, userSettings.wakewordSensitivity)), /*#__PURE__*/React.createElement("p", null, "Sensitivity to listen for wakeword (1.0=very sensitive, 0.0=don't listen)")), wakewords));
};

const DevelopmentSettings = ({
  inDevelopment
}) => {
  return /*#__PURE__*/React.createElement("fieldset", {
    id: "development-access"
  }, /*#__PURE__*/React.createElement("legend", null, "Development access"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "/tests/intent-viewer.html"
  }, "Intent Viewer")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
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

  return /*#__PURE__*/React.createElement("fieldset", {
    id: "data-collection"
  }, /*#__PURE__*/React.createElement("legend", null, "Firefox Voice Data Collection and Use"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
    className: "styled-toggleswitch"
  }, /*#__PURE__*/React.createElement("input", {
    className: "toggle-button",
    id: "technical-data",
    type: "checkbox",
    checked: !userSettings.disableTelemetry,
    onChange: onTelemetryChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "technical-data"
  }, /*#__PURE__*/React.createElement("strong", null, "Allow Firefox Voice to send technical and interaction data to Mozilla."))), /*#__PURE__*/React.createElement("p", null, "Includes anonymized high level categorization of requests (e.g. search, close tab, play music, etc) and error reports.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
    className: "styled-toggleswitch"
  }, /*#__PURE__*/React.createElement("input", {
    className: "toggle-button",
    id: "transcripts-data",
    type: "checkbox",
    checked: userSettings.utterancesTelemetry,
    onChange: onUtteranceTelemetryChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "transcripts-data"
  }, /*#__PURE__*/React.createElement("strong", null, "Allow Firefox Voice to send anonymized transcripts of your audio request."))), /*#__PURE__*/React.createElement("p", null, "Audio transcripts help Mozilla improve product accuracy and develop new features. Data is stored on Mozilla servers, never shared with other organizations and deleted after x months.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
    className: "styled-toggleswitch"
  }, /*#__PURE__*/React.createElement("input", {
    className: "toggle-button",
    id: "collect-audio",
    type: "checkbox",
    checked: userSettings.collectAudio,
    onChange: onCollectAudioChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "collect-audio"
  }, "Allow Firefox Voice to collect your", " ", /*#__PURE__*/React.createElement("strong", null, "audio recordings"), " for the purpose of improving our speech detection service.")))));
};

const AboutSection = () => {
  return /*#__PURE__*/React.createElement("fieldset", {
    id: "about"
  }, /*#__PURE__*/React.createElement("legend", null, "About"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://firefox-voice-feedback.herokuapp.com/"
  }, "Give Your Feedback")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://mozilla.github.io/firefox-voice/privacy-policy.html"
  }, "How Mozilla Protects Your Voice Privacy")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://www.mozilla.org/en-US/about/legal/terms/firefox/"
  }, "About Your Rights")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "/views/lexicon.html",
    onClick: browserUtil.activateTabClickHandler
  }, "The Big List of What You Can Say to Firefox Voice"))));
};