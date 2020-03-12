/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as optionsView from "./optionsView.js";
import * as settings from "../settings.js";

const { useState, useEffect, useRef } = React;
const optionsContainer = document.getElementById("options-container");

let isInitialized = false;
let onKeyboardShortcutError = () => {};
let onTabChange = () => {};

browser.runtime.onMessage.addListener(message => {
  if (message.type !== "keyboardShortcutError") {
    return;
  }
  onKeyboardShortcutError(message.error);
});

window.onhashchange = () => {
  let tab = undefined;

  if (location.hash === "#routines") {
    tab = (optionsView.TABS.ROUTINES);
  } else if (location.hash === "#general") {
    tab = optionsView.TABS.GENERAL;
  }

  onTabChange(tab);
};

window.onload = () => {
  let tab = undefined;

  if (location.hash === "#routines") {
    tab = (optionsView.TABS.ROUTINES);
  } else {
    tab = optionsView.TABS.GENERAL;
  }

  onTabChange(tab);
};



export const OptionsController = function() {
  const [inDevelopment, setInDevelopment] = useState(false);
  const [version, setVersion] = useState("");
  const [keyboardShortcutError, setKeyboardShortcutError] = useState(
    localStorage.getItem("keyboardShortcutError")
  );
  const [userSettings, setUserSettings] = useState({});
  const [userOptions, setUserOptions] = useState({});
  const [tabValue, setTabValue] = useState(optionsView.TABS.GENERAL);
  const [registeredNicknames, setRegisteredNicknames] = useState({});

  onKeyboardShortcutError = setKeyboardShortcutError;
  onTabChange = setTabValue;

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    await initVersionInfo();
    await initSettings();
    await initRegisteredNicknames();
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

  const initRegisteredNicknames = async () => {
    const registeredNicknames = await browser.runtime.sendMessage({
      type: "getRegisteredNicknames",
    });
    setRegisteredNicknames(registeredNicknames);
  };

  const updateUserSettings = async userSettings => {
    await settings.saveSettings(userSettings);
    setUserSettings(userSettings);
  };

  const updateNickname = async nickname => {
    await browser.runtime.sendMessage({
      type: "registerNickname",
      name: nickname.name,
      context: nickname.context,
    });
    const registeredNicknames = await browser.runtime.sendMessage({
      type: "getRegisteredNicknames",
    });
    setRegisteredNicknames(registeredNicknames);
  };

  const useDropdown = (initialIsVisible) => {
    const [isDropdownVisible, setDropdownVisible] = useState(initialIsVisible);
    const ref = useRef(null);

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setDropdownVisible(false);
        }
    };
    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    });
    return { ref, isDropdownVisible, setDropdownVisible };
  };

  return (
    <optionsView.Options
      inDevelopment={inDevelopment}
      version={version}
      keyboardShortcutError={keyboardShortcutError}
      userOptions={userOptions}
      userSettings={{ ...userSettings }}
      updateUserSettings={updateUserSettings}
      tabValue={tabValue}
      updateNickname={updateNickname}
      registeredNicknames={registeredNicknames}
      useDropdown={useDropdown}
    />
  );
};

ReactDOM.render(<OptionsController />, optionsContainer);
