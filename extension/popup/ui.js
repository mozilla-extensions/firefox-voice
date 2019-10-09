/* globals lottie, settings */

this.ui = (function() {
  const exports = {};

  let animation;
  let currentState = "listening";
  let textInputDetected = false;
  let userSettings = {};

  // Default amount of time (in milliseconds) before the action is automatically dismissed after we perform certain actions (e.g. successfully switching to a different open tab). This value should give users enough time to read the content on the popup before it closes.
  const DEFAULT_TIMEOUT = 2500;
  // Timeout for the popup when there's text displaying:
  const TEXT_TIMEOUT = 7000;
  let overrideTimeout;

  const animationSegmentTimes = {
    reveal: [0, 14],
    base: [14, 30],
    low: [30, 46],
    medium: [46, 62],
    high: [62, 78],
    processing: [78, 134],
    error: [134, 153],
    success: [184, 203],
  };

  async function init() {
    userSettings = await settings.getSettings();
  }

  function loadAnimation(animationName, loop) {
    const container = document.getElementById("zap");
    const anim = lottie.loadAnimation({
      container, // the dom element that will contain the animation
      loop,
      renderer: "svg",
      autoplay: false,
      path: `animations/${animationName}.json`, // the path to the animation json
    });
    return anim;
  }

  function playAnimation(segment, interruptCurrentAnimation, loop) {
    animation.loop = loop;
    animation.playSegments(segment, interruptCurrentAnimation);
  }

  exports.setAnimationForVolume = function setAnimationForVolume(avgVolume) {
    animation.onLoopComplete = function() {
      if (avgVolume < 0.1) {
        playAnimation(animationSegmentTimes.base, true, true);
      } else if (avgVolume < 0.15) {
        playAnimation(animationSegmentTimes.low, true, true);
      } else if (avgVolume < 0.2) {
        playAnimation(animationSegmentTimes.medium, true, true);
      } else {
        playAnimation(animationSegmentTimes.high, true, true);
      }
    };
  };

  function detectText(e) {
    const fieldValue = document.getElementById("text-input-field").value;
    if (!textInputDetected && fieldValue) {
      exports.setState("typing");
      textInputDetected = true;
      exports.onStartTextInput();
    }
    if (e.keyCode === 13) {
      exports.onTextInput(fieldValue);
    }
  }

  function processTextQuery() {
    const textQuery = document.getElementById("text-input-field").value;
    exports.onTextInput(textQuery);
    return textQuery;
  }

  exports.onStartTextInput = function onStartTextInput() {
    // can be overridden
  };

  exports.onTextInput = function onTextInput(text) {
    // can be overridden
  };

  function listenForText() {
    const textInput = document.getElementById("text-input-field");
    textInput.focus();
    textInput.addEventListener("keyup", detectText);

    const sendText = document.getElementById("send-text-input");
    sendText.addEventListener("click", processTextQuery);
  }

  const STATES = {};

  STATES.listening = {
    header: "Listening",
    show() {
      listenForText();
      if (userSettings.chime) {
        playListeningChime();
      }
      animation = loadAnimation("Firefox_Voice_Full", true);
      const revealAndBase = [
        animationSegmentTimes.reveal,
        animationSegmentTimes.base,
      ];
      animation.addEventListener("DOMLoaded", function() {
        animation.playSegments(revealAndBase, true);
      });
    },
  };

  STATES.processing = {
    header: "One second...",
    show() {
      playAnimation(animationSegmentTimes.processing, false, false);
    },
  };

  STATES.success = {
    header: "Got it!",
    show() {
      playAnimation(animationSegmentTimes.success, false, false);
    },
  };

  STATES.error = {
    header: "Sorry, there was an issue",
    show() {
      playAnimation(animationSegmentTimes.error, false, false);
    },
  };

  STATES.typing = {
    header: "Type your request",
    show() {},
  };

  exports.setState = function setState(newState) {
    document.querySelector("#header-title").textContent =
      STATES[newState].header;
    document.querySelector("#popup").classList.remove(currentState);
    document.querySelector("#popup").classList.add(newState);
    currentState = newState;
    STATES[currentState].show();
  };

  exports.setTranscript = function setTranscript(transcript) {
    document.querySelector("#transcript").textContent = transcript;
  };

  exports.setErrorMessage = function setErrorMessage(message) {
    document.querySelector("#error-message").textContent = message;
  };

  exports.displayText = function displayText(message) {
    const el = document.querySelector("#text-display");
    el.style.display = "";
    el.textContent = message;
    this.overrideTimeout = TEXT_TIMEOUT;
  };

  exports.displayAutoplayFailure = function displayAutoplayFailure() {
    document.querySelector("#error-message").textContent =
      "Please enable autoplay on this site for a better experience";
    document.querySelector("#error-autoplay").style.display = "";
  };

  exports.setIcon = function setIcon(state) {
    browser.browserAction.setIcon({
      16: `${state}-16.svg`,
      32: `${state}-32.svg`,
    });
  };

  exports.showCard = function showCard(data) {
    document.querySelector("#popup").classList.add("hasCard");
    document.querySelector("#card-header").textContent = data.Heading;
    document.querySelector("#card-image > img").src = data.Image;
    document.querySelector("#card-summary").textContent = data.AbstractText;
    document.querySelector("#card-source-link").textContent =
      data.AbstractSource;
    document.querySelector("#card-source-link").href = data.AbstractURL;

    // Add click handler for #card-source-link. The default behavior is to open links clicked within a popup in a new window, but we'd like for it to open within a new tab in the same window
    document.querySelector("#card-source-link").addEventListener("click", e => {
      e.preventDefault();
      browser.tabs.create({ url: data.AbstractURL });
      exports.closePopup();
    });
  };

  function playListeningChime() {
    const audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg"); // TODO: File bug on local audio file playback
    audio.play();
  }

  function listenForBack() {
    const backIcon = document.getElementById("back-icon");
    backIcon.addEventListener("click", () => {
      location.href = `${location.pathname}?${Date.now()}`;
    });
  }

  function listenForLexicon() {
    const link = document.getElementById("lexicon");
    link.addEventListener("click", async event => {
      event.preventDefault();
      await browser.tabs.create({ url: event.target.href });
      window.close();
    });
  }

  async function showSettings() {
    await browser.tabs.create({
      url: browser.runtime.getURL("options/options.html"),
    });
    exports.closePopup(0);
  }

  function listenForSettings() {
    const settingsIcon = document.getElementById("settings-icon");
    settingsIcon.addEventListener("click", showSettings);
  }

  exports.closePopup = function closePopup(ms) {
    if (ms === null || ms === undefined) {
      ms = overrideTimeout === undefined ? DEFAULT_TIMEOUT : overrideTimeout;
    }
    // TODO: offload mic and other resources before closing?
    setTimeout(() => {
      window.close();
    }, ms);
  };

  function listenForClose() {
    const closeIcon = document.getElementById("close-icon");
    closeIcon.addEventListener("click", () => {
      exports.closePopup(0); // close immediately
    });
  }

  exports.showExamples = function(examples) {
    const container = document.getElementById("suggestions-list");
    while (container.childNodes.length) {
      container.childNodes[0].remove();
    }
    for (const example of examples) {
      const el = document.createElement("p");
      el.className = "suggestion";
      el.textContent = example;
      container.appendChild(el);
    }
  };

  init();
  listenForClose();
  listenForSettings();
  listenForBack();
  listenForLexicon();

  return exports;
})();
