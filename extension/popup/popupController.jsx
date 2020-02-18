/* globals React, ReactDOM, log, buildSettings, catcher */

import * as util from "../util.js";
import * as voice from "./voice.js";
import * as settings from "../settings.js";
import * as voiceShim from "./voiceShim.js";
import * as vad from "./vad.js";
import * as browserUtil from "../browserUtil.js";
// eslint isn't catching the JSX that uses popupView:
// eslint-disable-next-line no-unused-vars
import * as popupView from "./popupView.js";

const { useState, useEffect } = React;
const popupContainer = document.getElementById("popup-container");
let isInitialized = false;
let textInputDetected = false;
let recorder;
let recorderIntervalId;
// This is feedback that the user started, but hasn't submitted;
// if the window closes then we'll send it:
let pendingFeedback;

// For tracking if the microphone works at all:
const ZERO_VOLUME_LIMIT = 5000;
let hasHadSuccessfulUtterance;
browser.storage.local
  .get("hasHadSuccessfulUtterance")
  .then(results => {
    hasHadSuccessfulUtterance = results && results.hasHadSuccessfulUtterance;
  })
  .catch(e => {
    catcher.capture(e);
  });
async function setHasHadSuccessfulUtterance() {
  if (!hasHadSuccessfulUtterance) {
    hasHadSuccessfulUtterance = true;
    await browser.storage.local.set({ hasHadSuccessfulUtterance });
  }
}

export const PopupController = function() {
  const [currentView, setCurrentView] = useState("waiting");
  const [suggestions, setSuggestions] = useState([]);
  const [lastIntent, setLastIntent] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [displayText, setDisplayText] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayAutoplay, setDisplayAutoplay] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [cardImage, setCardImage] = useState(null);
  const [recorderVolume, setRecorderVolume] = useState(null);
  const [expandListeningView, setExpandedListeningView] = useState(false);

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
  let noVoiceInterval;
  const userSettingsPromise = util.makeNakedPromise();

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    const userSettings = await settings.getSettings();
    userSettingsPromise.resolve(userSettings);
    if (!userSettings.collectTranscriptsOptinAnswered) {
      log.info("Opening onboard to force opt-in/out to transcripts");
      await browserUtil.activateTab("onboarding/onboard.html");
      window.close();
      return;
    }

    incrementVisits();

    backgroundTabRecorder
      ? await voiceShim.openRecordingTab()
      : await setupStream();

    recorder = backgroundTabRecorder
      ? new voiceShim.Recorder()
      : new voice.Recorder(stream);

    addListeners();
    updateExamples();
    updateLastIntent();
    startRecorder();
  };

  const incrementVisits = () => {
    const numVisits = getNumberOfVisits() + 1;
    localStorage.setItem("firefox-voice-visits", numVisits.toString());
    setExpandedListeningView(numVisits <= 5);
  };

  const getNumberOfVisits = () => {
    const numVisits = localStorage.getItem("firefox-voice-visits") || 0;
    return parseInt(numVisits);
  };

  const showSettings = async () => {
    await browser.tabs.create({
      url: browser.runtime.getURL("options/options.html"),
    });
    window.close();
  };

  const playListeningChime = () => {
    const audio = new Audio(
      "https://mozilla.github.io/firefox-voice/chime.ogg"
    );
    audio.play();
  };

  const onClickLexicon = async event => {
    await browserUtil.activateTab(browser.runtime.getURL(event.target.href));
    window.close();
  };

  const handleMessage = message => {
    switch (message.type) {
      case "closePopup": {
        closePopup(message.time);
        break;
      }
      case "displayFailure": {
        setPopupView("error");
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
      case "wakewordReceivedRestartPopup": {
        setTimeout(() => {
          location.href = `${location.pathname}?${Date.now()}`;
        }, 50);
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

  const updateLastIntent = async () => {
    const lastIntent = await browser.runtime.sendMessage({
      type: "getLastIntentForFeedback",
    });
    if (lastIntent) {
      setLastIntent(lastIntent);
    }
  };

  const onInputStarted = () => {
    setPopupView("typing");
    if (!textInputDetected) {
      textInputDetected = true;
      onStartTextInput();
    }
  };

  const onStartTextInput = async () => {
    await browser.runtime.sendMessage({ type: "microphoneStopped" });
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
    setMinPopupSize(350);
    setCurrentView(newView);

    if (
      recorder &&
      !recorder.cancelled &&
      !recorderIntervalId &&
      newView === "listening"
    ) {
      const startTime = Date.now();
      let nonZeroVolume = false;
      recorderIntervalId = setInterval(() => {
        const volume = recorder.getVolumeLevel();
        if (!hasHadSuccessfulUtterance && !nonZeroVolume) {
          if (volume > 0) {
            nonZeroVolume = true;
          } else if (Date.now() - startTime > ZERO_VOLUME_LIMIT) {
            browser.runtime.sendMessage({ type: "zeroVolumeError" });
            window.close();
          }
        }
        setVolumeForAnimation(volume);
      }, 500);
    } else {
      clearInterval(recorderIntervalId);
    }

    if (newView === "listening") {
      setExpandedListeningView(getNumberOfVisits() <= 5);
      noVoiceInterval = setInterval(() => {
        setExpandedListeningView(true);
      }, 3000);
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
    setPopupView("searchResults");
    const newSearch = {};
    for (const prop in message) {
      if (prop !== "type" && prop !== "card") {
        newSearch[prop] = message[prop];
      }
    }
    setSearchResult(newSearch);

    if (message.card) {
      setCardImage(message.card);
      setMinPopupSize(message.card.width);
    }

    updateLastIntent();
  };

  const showSearchCard = newCard => {
    setCardImage(newCard);
    if (newCard) {
      setMinPopupSize(newCard.width);
    }
  };

  const onSearchImageClick = async searchUrl => {
    await browser.runtime.sendMessage({
      type: "focusSearchResults",
      searchUrl,
    });
  };

  const onNextSearchResultClick = () => {
    browser.runtime.sendMessage({
      type: "runIntent",
      text: "next",
    });
  };

  const setMinPopupSize = width => {
    popupContainer.style.minWidth = width + "px";
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
    // Listen for messages from the background scripts
    browser.runtime.onMessage.addListener(handleMessage);

    window.addEventListener("unload", () => {
      if (
        !backgroundTabRecorder &&
        isWaitingForPermission &&
        Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE
      ) {
        startOnboarding();
      }

      if (pendingFeedback) {
        browser.runtime.sendMessage({
          type: "sendFeedback",
          rating: pendingFeedback.rating,
          feedback: pendingFeedback.feedback,
        });
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
      userSettingsPromise.then(userSettings => {
        if (userSettings.chime) {
          playListeningChime();
        }
      });
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
      setHasHadSuccessfulUtterance();
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
    recorder.onStartVoice = () => {
      clearInterval(noVoiceInterval);
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

  const sendFeedback = async feedback => {
    await browser.runtime.sendMessage({
      type: "sendFeedback",
      rating: feedback.rating,
      feedback: feedback.feedback,
    });
    pendingFeedback = null;
  };

  const onSubmitFeedback = async feedback => {
    setFeedback(feedback);
    pendingFeedback = feedback;
    // This cancels the voice input:
    onStartTextInput();
    if (feedback.rating === 1) {
      setPopupView("feedbackThanks");
      sendFeedback(feedback);
    } else if (feedback.rating === -1 && feedback.feedback === null) {
      // Negative feedback makes us ask for more info
      setPopupView("feedback");
    } else if (feedback.rating === -1) {
      setPopupView("feedbackThanks");
      sendFeedback(feedback);
    } else {
      log.error("Unexpected feedback:", feedback);
    }
  };

  return (
    <popupView.Popup
      currentView={currentView}
      suggestions={suggestions}
      feedback={feedback}
      lastIntent={lastIntent}
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
      onNextSearchResultClick={onNextSearchResultClick}
      onInputStarted={onInputStarted}
      onSubmitFeedback={onSubmitFeedback}
      setMinPopupSize={setMinPopupSize}
      expandListeningView={expandListeningView}
    />
  );
};

ReactDOM.render(<PopupController />, popupContainer);
