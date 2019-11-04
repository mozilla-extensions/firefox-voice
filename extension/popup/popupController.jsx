/* globals React, ReactDOM, util, voice, vad, settings, log, voiceShim, buildSettings */

const { useState, useEffect } = React;
const popupContainer = document.getElementById("popup-container");
let isInitialized = false;
let textInputDetected = false;

window.PopupController = function() {
  const [currentView, setCurrentView] = useState("listening");
  const [suggestions, setSuggestions] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [displayText, setDisplayText] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayAutoplay, setDisplayAutoplay] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [cardImage, setCardImage] = useState(null);
  const [recorderVolume, setRecorderVolume] = useState(null);

  let recorder;
  let recorderIntervalId;
  let executedIntent = false;
  let stream = null;
  const { backgroundTabRecorder } = buildSettings;
  let isWaitingForPermission = false;
  const FAST_PERMISSION_CLOSE = 500;
  const PERMISSION_REQUEST_TIME = 2000;
  // Default amount of time (in milliseconds) before the action is automatically dismissed after we perform certain actions (e.g. successfully switching to a different open tab). This value should give users enough time to read the content on the popup before it closes.
  const DEFAULT_TIMEOUT = 2500;
  // Timeout for the popup when there's text displaying:
  const TEXT_TIMEOUT = 7000;
  let overrideTimeout;

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    backgroundTabRecorder
      ? await voiceShim.openRecordingTab()
      : await setupStream();

    recorder = backgroundTabRecorder
      ? new voiceShim.Recorder()
      : new voice.Recorder(stream);

    const userSettings = await settings.getSettings();
    if (userSettings.chime) {
      playListeningChime();
    }

    addListeners();
    updateExamples();
    startRecorder();
  };

  const showSettings = async () => {
    await browser.tabs.create({
      url: browser.runtime.getURL("options/options.html"),
    });
    window.close();
  };

  const playListeningChime = () => {
    const audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg");
    audio.play();
  };

  const onClickLexicon = async event => {
    await browser.tabs.create({
      url: browser.runtime.getURL(event.target.href),
    });
    window.close();
  };

  const handleMessage = message => {
    switch (message.type) {
      case "closePopup": {
        closePopup(message.time);
        break;
      }
      case "displayFailure": {
        // setCurrentView("error");
        setErrorMessage(message.message);
        break;
      }
      case "displayText": {
        setDisplayText(message.message);
        overrideTimeout = TEXT_TIMEOUT;
        break;
      }
      case "displayAutoplayFailure": {
        displayAutoplayFailure();
        break;
      }
      case "showSearchResults": {
        showSearchResults(message);
        return Promise.resolve(true);
      }
      case "refreshSearchCard": {
        if (!message.card) {
          throw new Error(
            ".card property missing on refreshSearchCard message"
          );
        }
        showSearchCard(message.card);
        return Promise.resolve(true);
      }
      default:
        break;
    }
    return undefined;
  };

  const updateExamples = async () => {
    const suggestions = await browser.runtime.sendMessage({
      type: "getExamples",
      number: 3,
    });

    setSuggestions(suggestions);
  };

  const onKeyPressed = () => {
    setPopupView("typing");
    if (!textInputDetected) {
      textInputDetected = true;
      onStartTextInput();
    }
  };

  const onStartTextInput = async () => {
    await browser.runtime.sendMessage({ type: "microphoneStopped" });
    log.debug("detected text from the popup");
    recorder.cancel(); // not sure if this is working as expected?
  };

  const submitTextInput = async text => {
    if (text) {
      setTranscript(text);
      setPopupView("success");
      executedIntent = true;
      await browser.runtime.sendMessage({ type: "microphoneStopped" });
      browser.runtime.sendMessage({
        type: "addTelemetry",
        properties: { inputTyped: true },
      });
      browser.runtime.sendMessage({
        type: "runIntent",
        text,
      });
    }
  };

  const setPopupView = async newView => {
    setCurrentView(newView);

    if (recorder && !recorderIntervalId && newView === "listening") {
      recorderIntervalId = setInterval(() => {
        setVolumeForAnimation(recorder.getVolumeLevel());
      }, 500);
    } else {
      clearInterval(recorderIntervalId);
    }
  };

  const setVolumeForAnimation = newRecorderVolume => {
    setRecorderVolume(newRecorderVolume);
  };

  const displayAutoplayFailure = () => {
    setDisplayAutoplay(true);
    setErrorMessage(
      "Please enable autoplay on this site for a better experience"
    );
  };

  const showSearchResults = message => {
    setCurrentView("searchResults");
    const newSearch = {};
    for (const prop in message) {
      if (prop !== "type" && prop !== "card") {
        newSearch[prop] = message[prop];
      }
    }
    setSearchResult(newSearch);

    if (message.card) {
      setCardImage(message.card);
      setMinPopupSize(message.card.width, message.card.height);
    }
  };

  const showSearchCard = newCard => {
    setCardImage(newCard);
    if (newCard) {
      setMinPopupSize(newCard.width, newCard.height);
    }
  };

  const onSearchImageClick = async searchUrl => {
    await browser.runtime.sendMessage({
      type: "focusSearchResults",
      searchUrl,
    });
  };

  const setMinPopupSize = (width, height) => {
    popupContainer.style.minWidth = width + "px";
    popupContainer.style.minHeight = parseInt(height) + 150 + "px";
  };

  // TODO: Console Warning: "Scripts may not close windows that were not opened by script."
  const closePopup = ms => {
    if (ms === null || ms === undefined) {
      ms = overrideTimeout ? overrideTimeout : DEFAULT_TIMEOUT;
    }

    // TODO: offload mic and other resources before closing?
    setTimeout(() => {
      window.close();
    }, ms);
  };

  const addListeners = () => {
    document.addEventListener("keydown", onKeyPressed);

    // Listen for messages from the background scripts
    browser.runtime.onMessage.addListener(handleMessage);

    window.addEventListener("unload", () => {
      alert("here");
      document.removeEventListener("keydown", onKeyPressed);

      if (
        !backgroundTabRecorder &&
        isWaitingForPermission &&
        Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE
      ) {
        startOnboarding();
      }

      browser.runtime.sendMessage({ type: "microphoneStopped" });
      if (!executedIntent) {
        browser.runtime.sendMessage({ type: "cancelledIntent" });
      }
    });
  };

  const startRecorder = () => {
    recorder.onBeginRecording = () => {
      setPopupView("listening");
      browser.runtime.sendMessage({ type: "microphoneStarted" });
    };
    recorder.onEnd = json => {
      setPopupView("success");
      clearInterval(recorderIntervalId);
      executedIntent = true;
      // Probably superfluous, since this is called in onProcessing:
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      if (json === null) {
        // It was cancelled
        return;
      }
      setTranscript(json.data[0].text);
      browser.runtime.sendMessage({
        type: "addTelemetry",
        properties: { transcriptionConfidence: json.data[0].confidence },
      });
      browser.runtime.sendMessage({
        type: "runIntent",
        text: json.data[0].text,
      });
    };
    recorder.onError = error => {
      setPopupView("error");
      clearInterval(recorderIntervalId);
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      log.error("Got recorder error:", String(error), error);
    };
    recorder.onProcessing = () => {
      setPopupView("processing");
      browser.runtime.sendMessage({ type: "microphoneStopped" });
    };
    recorder.onNoVoice = () => {
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      log.debug("Closing popup because of no voice input");
      window.close();
    };
    recorder.startRecording();
  };

  const setupStream = async () => {
    try {
      isWaitingForPermission = Date.now();
      await startMicrophone();
      isWaitingForPermission = false;
    } catch (e) {
      isWaitingForPermission = false;
      if (e.name === "NotAllowedError" || e.name === "TimeoutError") {
        startOnboarding();
        window.close();
        return;
      }
      throw e;
    }

    await vad.stm_vad_ready;
  };

  const requestMicrophone = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  };

  const startMicrophone = async () => {
    const sleeper = util.sleep(PERMISSION_REQUEST_TIME).then(() => {
      const exc = new Error("Permission Timed Out");
      exc.name = "TimeoutError";
      throw exc;
    });
    await Promise.race([requestMicrophone(), sleeper]);
  };

  const startOnboarding = async () => {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html"),
    });
  };

  return (
    <Popup
      currentView={currentView}
      suggestions={suggestions}
      transcript={transcript}
      displayText={displayText}
      errorMessage={errorMessage}
      displayAutoplay={displayAutoplay}
      searchResult={searchResult}
      cardImage={cardImage}
      recorderVolume={recorderVolume}
      showSettings={showSettings}
      submitTextInput={submitTextInput}
      onClickLexicon={onClickLexicon}
      onSearchImageClick={onSearchImageClick}
      setMinPopupSize={setMinPopupSize}
    />
  );
};

ReactDOM.render(<PopupController />, popupContainer);
