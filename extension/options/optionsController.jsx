/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as optionsView from "./optionsView.js";
import * as settings from "../settings.js";

const { useState, useEffect } = React;
const optionsContainer = document.getElementById("options-container");

let isInitialized = false;
let onKeyboardShortcutError = () => {};

browser.runtime.onMessage.addListener(message => {
  if (message.type !== "keyboardShortcutError") {
    return;
  }
  onKeyboardShortcutError(message.error);
});

export const OptionsController = function() {
  const [inDevelopment, setInDevelopment] = useState(false);
  const [version, setVersion] = useState("");
  const [keyboardShortcutError, setKeyboardShortcutError] = useState(
    localStorage.getItem("keyboardShortcutError")
  );
  const [userSettings, setUserSettings] = useState({});
  const [userOptions, setUserOptions] = useState({});

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
    setUserSettings(result.settings);
    setUserOptions(result.options);
  };

  const updateUserSettings = async userSettings => {
    await settings.saveSettings(userSettings);
    setUserSettings(userSettings);
  };

  return (
    <optionsView.Options
      inDevelopment={inDevelopment}
      version={version}
      keyboardShortcutError={keyboardShortcutError}
      userOptions={userOptions}
      userSettings={{ ...userSettings }}
      updateUserSettings={updateUserSettings}
    />
  );
};

ReactDOM.render(<OptionsController />, optionsContainer);
