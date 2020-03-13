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
    tab = optionsView.TABS.ROUTINES;
  } else if (location.hash === "#general") {
    tab = optionsView.TABS.GENERAL;
  }

  onTabChange(tab);
};

window.onload = () => {
  let tab = undefined;

  if (location.hash === "#routines") {
    tab = optionsView.TABS.ROUTINES;
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

  const updateNickname = async (nicknameContext, oldNickname) => {
    // delete if necessary
    if (
      oldNickname !== undefined &&
      (nicknameContext === undefined ||
        oldNickname !== nicknameContext.nickname)
    ) {
      await browser.runtime.sendMessage({
        type: "registerNickname",
        name: oldNickname,
        context: null,
      });
    }

    if (nicknameContext !== undefined) {
      // check again for validity of utterances and redo contexts
      for (let i = 0; i < nicknameContext.contexts.length; i++) {
        const context = await parseUtterance(
          nicknameContext.contexts[i].utterance
        );
        if (context === undefined || context.utterance === undefined) {
          return false;
        }

        nicknameContext.contexts[i] = context;
      }

      await browser.runtime.sendMessage({
        type: "registerNickname",
        name: nicknameContext.nickname,
        context: {
          slots: {},
          parameters: {},
          ...nicknameContext,
          utterance: `Combined actions named ${nicknameContext.nickname}`,
        },
      });
    }

    const registeredNicknames = await browser.runtime.sendMessage({
      type: "getRegisteredNicknames",
    });

    setRegisteredNicknames(registeredNicknames);
    return true;
  };

  const useToggle = initialIsVisible => {
    const [isVisible, setVisible] = useState(initialIsVisible);
    const ref = useRef(null);

    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setVisible(false);
      }
    };

    const handleEscape = event => {
      if (event.key === "Escape") {
        setVisible(false);
      }
      event.preventDefault();
    };

    useEffect(() => {
      document.addEventListener("keyup", handleEscape, true);
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
      };
    });
    return { ref, isVisible, setVisible };
  };

  const parseUtterance = async utterance => {
    return browser.runtime.sendMessage({
      type: "parseUtterance",
      utterance,
      disableFallback: true,
    });
  };

  const useEditNicknameModal = (initialIsVisible, initialContext) => {
    const { ref, isVisible, setVisible } = useToggle(initialIsVisible);
    const [tempEditableNickname, setTempEditableNickname] = useState({});
    const copyNickname = {
      ...tempEditableNickname,
    };

    const setModalVisibile = visible => {
      // deep copy inital context and use that as temporary nickname for edit
      setTempEditableNickname(JSON.parse(JSON.stringify(initialContext)));
      setVisible(visible);
    };

    return {
      ref,
      isVisible,
      setVisible: setModalVisibile,
      tempEditableNickname: copyNickname,
      setTempEditableNickname,
    };
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
      useToggle={useToggle}
      useEditNicknameModal={useEditNicknameModal}
      parseUtterance={parseUtterance}
    />
  );
};

ReactDOM.render(<OptionsController />, optionsContainer);
