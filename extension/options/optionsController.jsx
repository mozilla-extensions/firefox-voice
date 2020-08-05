/* globals React, ReactDOM, log */

// eslint-disable-next-line no-unused-vars
import * as optionsView from "./optionsView.js";
import * as settings from "../settings.js";
import { sendMessage } from "../communicate.js";

const { useState, useEffect, useRef } = React;
const optionsContainer = document.getElementById("options-container");

let isInitialized = false;
let onKeyboardShortcutError = () => {};
let onTabChange = () => {};
let DEFAULT_TAB = optionsView.TABS.GENERAL;

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
  } else if (location.hash === "#history") {
    tab = optionsView.TABS.HISTORY;
  }

  onTabChange(tab);
};

window.onload = () => {
  if (location.hash === "#routines") {
    DEFAULT_TAB = optionsView.TABS.ROUTINES;
  } else if (location.hash === "#history") {
    DEFAULT_TAB = optionsView.TABS.HISTORY;
  }
  onTabChange(DEFAULT_TAB);
};

async function getAudioInputDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return null;
  }
  const audioInputDevices = [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  devices.forEach(function(device) {
    if (device.kind === "audioinput") {
      audioInputDevices.push(device);
    }
  });
  return audioInputDevices;
}

function getSynthesizedVoices() {
  if (!window.speechSynthesis || !window.speechSynthesis.getVoices) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  return voices;
}

export const OptionsController = function() {
  const [inDevelopment, setInDevelopment] = useState(false);
  const [version, setVersion] = useState("");
  const [keyboardShortcutError, setKeyboardShortcutError] = useState(
    localStorage.getItem("keyboardShortcutError")
  );
  const [userSettings, setUserSettings] = useState({});
  const [userOptions, setUserOptions] = useState({});
  const [tabValue, setTabValue] = useState(DEFAULT_TAB);
  const [registeredRoutines, setRegisteredRoutines] = useState({});

  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [synthesizedVoices, setSynthesizedVoices] = useState([]);

  onKeyboardShortcutError = setKeyboardShortcutError;
  onTabChange = setTabValue;

  const inputLocales = [
    {
      name: "English (Australia)",
      code: "en-AU",
    },
    {
      name: "English (Canada)",
      code: "en-CA",
    },
    {
      name: "English (Ghana)",
      code: "en-GH",
    },
    {
      name: "English (Hong Kong)",
      code: "en-HK",
    },
    {
      name: "English (India)",
      code: "en-IN",
    },
    {
      name: "English (Ireland)",
      code: "en-IE",
    },
    {
      name: "English (Kenya)",
      code: "en-KE",
    },
    {
      name: "English (New Zealand)",
      code: "en-NZ",
    },
    {
      name: "English (Nigeria)",
      code: "en-NG",
    },
    {
      name: "English (Pakistan)",
      code: "en-PK",
    },
    {
      name: "English (Philippines)",
      code: "en-PH",
    },
    {
      name: "English (Singapore)",
      code: "en-SG",
    },
    {
      name: "English (South Africa)",
      code: "en-ZA",
    },
    {
      name: "English (Tanzania)",
      code: "en-TZ",
    },
    {
      name: "English (United Kingdom)",
      code: "en-GB",
    },
    {
      name: "English (United States)",
      code: "en-US",
    },
  ];

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    await initVersionInfo();
    await initSettings();
    await initRegisteredRoutines();
    await initAudioDevices();
    initSynthesizedVoices();
  };

  const initAudioDevices = async () => {
    setAudioInputDevices(await getAudioInputDevices());
  };

  const initSynthesizedVoices = () => {
    setSynthesizedVoices(getSynthesizedVoices());
  };

  const initVersionInfo = async () => {
    setInDevelopment(
      await sendMessage({
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

  const initRegisteredRoutines = async () => {
    const registeredRoutines = await sendMessage({
      type: "getRegisteredRoutines",
    });
    setRegisteredRoutines(registeredRoutines);
  };

  const updateUserSettings = async userSettings => {
    await settings.saveSettings(userSettings);
    setUserSettings(userSettings);
  };

  const updateRoutine = async (routineContext, oldRoutine) => {
    const registeredRoutines = await sendMessage({
      type: "getRegisteredRoutines",
    });

    if (routineContext !== undefined) {
      if (
        registeredRoutines[routineContext.routine] !== undefined &&
        (oldRoutine === undefined || oldRoutine !== routineContext.routine)
      ) {
        log.error("There already is a routine with this name");
        return {
          allowed: false,
          error: "There already is a routine with this name",
        };
      }
      const contexts = [];
      const intents = routineContext.intents.split("\n");

      for (let i = 0; i < intents.length; i++) {
        const intent = intents[i].trim();
        if (intent.length === 0) {
          continue;
        }
        const context = await parseUtterance(intent);
        if (context === undefined || context.utterance === undefined) {
          log.error(`The intent number ${i} is not a valid intent`);
          return {
            allowed: false,
            error: `The intent number ${i + 1} is not a valid intent`,
          };
        }

        contexts.push(context);
      }

      if (contexts.length === 0) {
        log.error("No actions added for this routine");
        return { allowed: false, error: "No actions added for this routine" };
      }
      delete routineContext.intents;
      routineContext.contexts = contexts;
      await sendMessage({
        type: "registerRoutine",
        name: routineContext.routine,
        context: {
          slots: {},
          parameters: {},
          ...routineContext,
          utterance: `Combined actions named ${routineContext.routine}`,
        },
      });
      // perform the same operation on local routine
      registeredRoutines[routineContext.routine] = routineContext;
    }
    // delete if necessary
    if (
      oldRoutine !== undefined &&
      (routineContext === undefined || oldRoutine !== routineContext.routine)
    ) {
      await sendMessage({
        type: "registerRoutine",
        name: oldRoutine,
        context: null,
      });
      // perform the same operation on local routine
      delete registeredRoutines[oldRoutine];
    }

    setRegisteredRoutines(registeredRoutines);
    return { allowed: true };
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
    return sendMessage({
      type: "parseUtterance",
      utterance,
      disableFallback: false,
    });
  };

  const useEditRoutineDraft = (initialIsVisible, initialContext) => {
    const { ref, isVisible, setVisible } = useToggle(initialIsVisible);
    const [tempEditableRoutine, setTempEditableRoutine] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const copyRoutine = {
      ...tempEditableRoutine,
    };

    const setDraftVisibile = visible => {
      if (visible === false) {
        setVisible(false);
        return;
      }
      const copyInitialContext = JSON.parse(JSON.stringify(initialContext));
      let intents = "";
      // deep copy inital context and use that as temporary routine for edit
      for (let i = 0; i < initialContext.contexts.length; i++) {
        intents += initialContext.contexts[i].utterance + "\n";
      }
      copyInitialContext.intents = intents;

      setTempEditableRoutine(copyInitialContext);
      setVisible(visible);
    };

    return {
      ref,
      isVisible,
      setVisible: setDraftVisibile,
      tempEditableRoutine: copyRoutine,
      setTempEditableRoutine,
      errorMessage,
      setErrorMessage,
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
      updateRoutine={updateRoutine}
      registeredRoutines={registeredRoutines}
      useToggle={useToggle}
      useEditRoutineDraft={useEditRoutineDraft}
      audioInputDevices={audioInputDevices}
      synthesizedVoices={synthesizedVoices}
      inputLocales={inputLocales}
    />
  );
};

ReactDOM.render(<OptionsController />, optionsContainer);
