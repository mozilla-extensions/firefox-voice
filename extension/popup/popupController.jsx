/* globals React, ReactDOM, log, buildSettings */

import * as browserUtil from "../browserUtil.js";
import * as settings from "../settings.js";
import * as util from "../util.js";
// eslint isn't catching the JSX that uses popupView:
// eslint-disable-next-line no-unused-vars
import * as popupView from "./popupView.js";
import * as vad from "./vad.js";
import * as voice from "./voice.js";
import * as voiceShim from "./voiceShim.js";
import { sendMessage } from "../communicate.js";

log.startTiming("popup opened");

const SURVEY_CLICK_LIMIT = 1000 * 60 * 60 * 24 * 14; // Wait 14 days until showing survey link again
const { useState, useEffect } = React;
const popupContainer = document.getElementById("popup-container");
let isInitialized = false;
let forceCancelRecoder = false;
let timerElapsed = false;
let recorder;
// this next 2 vars need to be global to avoid a weird race condition that occurs
// when setting it as internal state.
let renderListenComponent = true;
let listenForFollowup = false;
let speechOutput = false;
let closePopupId;
let recorderIntervalId;
let timerIntervalId;
let lastAudio = null;
let lastAudioUtterance = null;

let audioInputId = null;

// This is feedback that the user started, but hasn't submitted;
// if the window closes then we'll send it:
let pendingFeedback;
// For the user of callbacks, we shadow this useState() variable here.
// FIXME: this is a terrible pattern, but could probably be fixed with https://github.com/mozilla/firefox-voice/issues/1614
let _currentView;

// For tracking if the microphone works at all:
const ZERO_VOLUME_LIMIT = 8000;

// FIXME: this can be removed eventually (after 2020-08-01), we're just clearing an unused storage:
browser.storage.local.remove("hasHadSuccessfulUtterance");

function calculateShowSurvey() {
  let lastClicked = localStorage.getItem("showSurveyClicked") || 0;
  if (lastClicked) {
    lastClicked = parseInt(lastClicked, 10);
  }
  if (Date.now() - lastClicked < SURVEY_CLICK_LIMIT) {
    return false;
  }
  // 10% of the time show the survey link
  return Math.random() < 0.1;
}

const showSurvey = calculateShowSurvey();

function onClickSurvey() {
  localStorage.setItem("showSurveyClicked", String(Date.now()));
}

export const PopupController = function() {
  log.timing("PopupController called");
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
  const [timerInMS, setTimerInMS] = useState(0);
  const [timerTotalInMS, setTimerTotalInMS] = useState(0);
  const [requestFollowup, setRequestFollowup] = useState(false);
  const [followupText, setFollowupText] = useState(null);
  const [showZeroVolumeError, setShowZeroVolumeError] = useState(false);
  const [userSettings, setUserSettings] = useState({});

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
  const FOLLOWUP_TIMEOUT = 5000;
  let overrideTimeout;
  let noVoiceInterval;
  const userSettingsPromise = util.makeNakedPromise();
  const synth = window.speechSynthesis;
  let preferredVoice;

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    log.timing("PopupController init() called");
    const userSettings = await settings.getSettings();

    userSettingsPromise.resolve(userSettings);
    if (!userSettings.collectTranscriptsOptinAnswered) {
      log.info("Opening onboard to force opt-in/out to transcripts");
      await sendMessage({ type: "launchOnboarding" });
      window.close();
      return;
    }
    listenForFollowup = userSettings.listenForFollowup;
    if (userSettings.audioInputId !== undefined) {
      audioInputId = userSettings.audioInputId;
    }

    speechOutput = userSettings.speechOutput;
    setPreferredVoice(userSettings.preferredVoice);

    const activeTimer = await sendMessage({
      type: "timerAction",
      method: "getActiveTimer",
    });

    // check if timer is active
    if (activeTimer !== null) {
      const { startTimestamp, totalInMS, paused, remainingInMS } = activeTimer;

      let waitFor = remainingInMS - (new Date().getTime() - startTimestamp);

      if (paused === true) {
        waitFor = remainingInMS;
        setTimerInMS(waitFor);
      } else {
        startTimer(waitFor);
      }

      if (waitFor < 0) {
        clearTimer({ totalInMS });
      }
    }

    incrementVisits();

    backgroundTabRecorder
      ? await voiceShim.openRecordingTab()
      : await setupStream();

    recorder = backgroundTabRecorder
      ? new voiceShim.Recorder()
      : new voice.Recorder(stream);

    log.timing("PopupController init() started");

    addListeners();
    updateExamples();
    updateLastIntent();

    log.timing("PopupController init() listeners added");

    startRecorder();
    log.timing("PopupController init() recorder created added");
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
  const updateUserSettings = async userSettings => {
    await settings.saveSettings(userSettings);
    setUserSettings(userSettings);
  };

  const playListeningChime = () => {
    const audio = new Audio(
      "https://mozilla-extensions.github.io/firefox-voice/chime.ogg"
    );
    audio.play();
  };

  const playTimerAlarm = () => {
    const audio = new Audio(
      "https://mozilla-extensions.github.io/firefox-voice/alarm.mp3"
    );
    audio.play();
    setTimeout(() => {
      audio.play();
    }, 3000);
  };

  const onClickLexicon = async event => {
    await browserUtil.openOrActivateTab(
      browser.runtime.getURL(event.target.href)
    );
    window.close();
  };

  const setPreferredVoice = voiceName => {
    const voices = synth.getVoices();
    const matchingVoice = voices.filter(voice => voice.name === voiceName);
    if (matchingVoice.length) {
      preferredVoice = matchingVoice[0];
    }
  };

  const handleMessage = message => {
    switch (message.type) {
      case "closePopup": {
        // Override closing the popup on follow ups
        if (!listenForFollowup && !requestFollowup) {
          closePopup(message.time);
        }
        break;
      }
      case "displayFailure": {
        setPopupView("error");
        setErrorMessage(message.message);
        break;
      }
      case "startSavingPage": {
        setPopupView("startSavingPage");
        setDisplayText(message.message);
        break;
      }
      case "endSavingPage": {
        setPopupView("endSavingPage");
        setDisplayText(message.message);
        break;
      }
      case "presentMessage": {
        setDisplayText(message.message);
        if (speechOutput) {
          speak({ text: message.message });
        }
        overrideTimeout = TEXT_TIMEOUT;
        if (lastIntent && lastIntent.closePopupOnFinish) {
          closePopup();
        }
        break;
      }
      case "handleFollowup": {
        if (message.method === "enable") {
          if (message.message) {
            setFollowupText(message.message);
          }
          setRequestFollowup(true);
          runFollowup();
        } else {
          setRequestFollowup(false);
          setFollowupText(null);
          closePopup();
        }
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
      case "setTimer": {
        setPopupView("timer");
        startTimer(message.timerInMS);
        return Promise.resolve(true);
      }
      case "closeTimer": {
        clearTimer(message);
        return Promise.resolve(true);
      }
      case "displayFallback": {
        setPopupView("fallback");
        setErrorMessage(message.message);
        return Promise.resolve(true);
      }
      case "getLastAudio": {
        if (message.utterance !== lastAudioUtterance) {
          return Promise.resolve(null);
        }
        return Promise.resolve(lastAudio);
      }
      case "triggerPopupWithMessage": {
        setPopupView("success");
        setTranscript(message.message);
        return Promise.resolve(true);
      }
      default:
        break;
    }
    return undefined;
  };

  const speak = async message => {
    const { text, language } = message;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language || "en-US";
    if (!language) {
      utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
    utterance.onend = () => {
      closePopup(2000);
    };
  };

  const clearTimer = async ({ totalInMS, followup }) => {
    playTimerAlarm();
    setPopupView("timer");

    // use this variable to stop any other actions and show notifications
    timerElapsed = true;

    setTranscript("Time's up");

    // set timer to 0
    setTimerInMS(0);
    setTimerTotalInMS(totalInMS);

    // send message to timer to ack that it can close
    sendMessage({
      type: "timerAction",
      method: "closeActiveTimer",
    });

    if (followup) {
      setFollowupText(followup);
      setRequestFollowup(true);
      runFollowup();
    } else {
      cancelRecoder();
      closePopup(6000);
    }
  };

  const startTimer = async duration => {
    clearInterval(timerIntervalId);
    setTimerInMS(duration);

    timerIntervalId = setInterval(() => {
      duration -= 1000;
      if (duration >= 0) {
        setTimerInMS(duration);
      } else {
        clearInterval(timerIntervalId);
      }
    }, 1000);
  };

  const updateExamples = async () => {
    const suggestions = await sendMessage({
      type: "getExamples",
      number: 3,
    });

    setSuggestions(suggestions);
  };

  const updateLastIntent = async () => {
    const lastIntent = await sendMessage({
      type: "getLastIntentForFeedback",
    });
    if (lastIntent) {
      setLastIntent(lastIntent);
      return lastIntent;
    }

    return null;
  };

  const onInputStarted = () => {
    setPopupView("typing");
    cancelRecoder();
  };

  const cancelRecoder = () => {
    if (!forceCancelRecoder) {
      forceCancelRecoder = true;
      onExternalInput();
    }
  };

  const onExternalInput = async () => {
    await sendMessage({ type: "microphoneStopped" });
    if (recorder !== undefined) {
      recorder.cancel(); // not sure if this is working as expected?
    }
  };

  const submitTextInput = async text => {
    log.timing(`submitTextInput(${text}) called`);
    if (text) {
      const capText = text.charAt(0).toUpperCase() + text.slice(1);
      setTranscript(capText);
      setPopupView("success");
      executedIntent = true;
      await sendMessage({ type: "microphoneStopped" });
      sendMessage({
        type: "addTelemetry",
        properties: { inputTyped: true },
      });
      setDisplayText("");
      sendMessage({
        type: "runIntent",
        text,
      });
      log.timing(`submitTextInput(${text}) sent intent`);
    }
  };

  const setPopupView = async newView => {
    log.timing(`setPopupView(${newView})`);
    // do not change view if timer elapsed; timer has highest priority
    if (timerElapsed === true) {
      return;
    }

    setMinPopupSize(350);
    _currentView = newView;
    setCurrentView(newView);

    // clear timer interval when not used
    if (newView !== "timer" && newView !== "listening") {
      clearInterval(timerIntervalId);
    }

    if (
      recorder &&
      !recorder.cancelled &&
      !recorderIntervalId &&
      newView === "listening"
    ) {
      const startTime = Date.now();
      let nonZeroVolume = false;
      let hasSentZeroVolumeError = false;
      recorderIntervalId = setInterval(() => {
        const volume = recorder.getVolumeLevel();
        if (!nonZeroVolume) {
          if (volume > 0.01) {
            nonZeroVolume = true;
          } else if (
            Date.now() - startTime > ZERO_VOLUME_LIMIT &&
            !hasSentZeroVolumeError
          ) {
            sendMessage({ type: "zeroVolumeError" });
            setShowZeroVolumeError(true);
            hasSentZeroVolumeError = true;
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
      if (message.card.speech) {
        speak(message.card.speech);
      }
      setMinPopupSize(message.card.width);
    } else {
      setCardImage(null);
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
    await sendMessage({
      type: "focusSearchResults",
      searchUrl,
    });
  };

  const onNextSearchResultClick = () => {
    setDisplayText("");
    sendMessage({
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
    if (closePopupId) {
      clearTimeout(closePopupId);
    }
    // TODO: offload mic and other resources before closing?
    closePopupId = setTimeout(() => {
      window.close();
    }, ms);
  };

  const cancelClosePopup = () => {
    clearTimeout(closePopupId);
    closePopupId = undefined;
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
        sendMessage({
          type: "sendFeedback",
          rating: pendingFeedback.rating,
          feedback: pendingFeedback.feedback,
        });
      }
      sendMessage({ type: "microphoneStopped" });
      sendMessage({ type: "clearFollowup" });
      if (!executedIntent) {
        sendMessage({ type: "cancelledIntent" });
      }
      renderListenComponent = true;
    });
  };

  const runFollowup = () => {
    if (renderListenComponent) {
      renderListenComponent = false;
    }
    forceCancelRecoder = false;
    recorder.startRecording();
    closePopup(FOLLOWUP_TIMEOUT);
  };

  const startRecorder = () => {
    log.timing("startRecorder() called");
    recorder.onBeginRecording = () => {
      log.timing("recorder.onBeginRecording");
      if (renderListenComponent) {
        setPopupView("listening");
        userSettingsPromise.then(userSettings => {
          if (userSettings.chime) {
            playListeningChime();
          }
        });
      }
      sendMessage({ type: "microphoneStarted" });
    };
    recorder.onEnd = async (json, audioBlob) => {
      log.timing("recorder.onEnd() called");
      clearInterval(recorderIntervalId);
      if (forceCancelRecoder) {
        // The recorder ended because it was cancelled when typing began or timer has ended
        return;
      }
      executedIntent = true;
      // Probably superfluous, since this is called in onProcessing:
      sendMessage({ type: "microphoneStopped" });
      if (json === null) {
        // It was cancelled
        return;
      }
      const capText =
        json.data[0].text.charAt(0).toUpperCase() + json.data[0].text.slice(1);
      setTranscript(capText);
      await sendMessage({
        type: "addTelemetry",
        properties: { transcriptionConfidence: json.data[0].confidence },
      });
      setDisplayText("");
      log.timing(`Sending runIntent(${json.data[0].text})`);
      lastAudio = audioBlob;
      lastAudioUtterance = json.data[0].text;
      await sendMessage({
        type: "runIntent",
        text: json.data[0].text,
      });
      log.timing(`Sending runIntent(${json.data[0].text}) completed`);
      const completedIntent = await updateLastIntent();
      if (
        completedIntent &&
        !completedIntent.skipSuccessView &&
        _currentView !== "searchResults"
      ) {
        setPopupView("success");
      }
      // intent can run a follow up directly
      if (listenForFollowup && !requestFollowup) {
        runFollowup();
      }
      log.timing("recorder.onEnd() finished");
    };
    recorder.onError = error => {
      if (String(error) === "Error: Failed response from server: 500") {
        // FIXME: this is because the server gives a 500 response when there's no voice...
        recorder.onNoVoice();
        return;
      }
      setPopupView("error");
      clearInterval(recorderIntervalId);
      sendMessage({ type: "microphoneStopped" });
      log.error("Got recorder error:", String(error), error);
    };
    recorder.onProcessing = () => {
      log.timing("recorder.onProcessing()");
      setPopupView("processing");
      sendMessage({ type: "microphoneStopped" });
    };
    recorder.onNoVoice = () => {
      // stop closing if recorder was canceled and popup must be open (eg timer notification)
      if (forceCancelRecoder) {
        return;
      }
      sendMessage({ type: "microphoneStopped" });
      log.debug("Closing popup because of no voice input");
      setPopupView("noAudio");
      setDisplayText("I did not hear that, please try again");
      closePopup(3000);
    };
    recorder.onStartVoice = () => {
      log.timing("recorder.onStartVoice()");
      clearInterval(noVoiceInterval);
      clearTimeout(closePopupId);
    };
    recorder.startRecording();
    log.timing("startRecorder() finished");
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
    let constraint = null;
    if (audioInputId !== null) {
      constraint = {
        audio: { deviceId: audioInputId },
      };
    } else {
      constraint = {
        audio: true,
      };
    }
    stream = await navigator.mediaDevices.getUserMedia(constraint);
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
    return sendMessage({ type: "launchOnboarding" });
  };

  const sendFeedback = async feedback => {
    await sendMessage({
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
    onExternalInput();
    if (feedback.rating === 1) {
      setPopupView("feedbackThanks");
      sendFeedback(feedback);
    } else if (feedback.rating === -1 && feedback.feedback === null) {
      // Negative feedback makes us ask for more info
      cancelClosePopup();
      setPopupView("feedback");
    } else if (feedback.rating === -1) {
      setPopupView("feedbackThanks");
      sendFeedback(feedback);
    } else {
      log.error("Unexpected feedback:", feedback);
    }
  };

  log.timing("PopupController initialized");
  const result = (
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
      timerInMS={timerInMS}
      timerTotalInMS={timerTotalInMS}
      renderFollowup={requestFollowup}
      followupText={followupText}
      showZeroVolumeError={showZeroVolumeError}
      userSettings={{ ...userSettings }}
      updateUserSettings={updateUserSettings}
      showSurvey={showSurvey}
      onClickSurvey={onClickSurvey}
    />
  );
  log.timing("PopupController finished");
  return result;
};

ReactDOM.render(<PopupController />, popupContainer);

log.timing("ReactDOM.render() completed");
