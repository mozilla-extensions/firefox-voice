/* globals lottie, log */

this.ui = (function() {
  const exports = {};

  let animation;
  let currentState = "listening";
  let textInputDetected = false;

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
    log.debug(`updating: volume at ${avgVolume}`);
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
    if (!textInputDetected) {
      exports.setState("typing"); // TODO: is this the right place to set the state? or should that all be handled by popup.js
      textInputDetected = true;
      exports.onStartTextInput();
    }
    if (e.keyCode === 13) {
      const textQuery = document.getElementById("text-input-field").innerText;
      exports.onTextInput(textQuery);
    }
  }

  function processTextQuery() {
    const textQuery = document.getElementById("text-input-field").innerText;
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
      playListeningChime();
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

  STATES.settings = {
    header: "Settings",
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

  exports.setIcon = function setIcon(state) {
    browser.browserAction.setIcon({
      16: `${state}-16.svg`,
      32: `${state}-32.svg`,
    });
  };

  exports.showCard = function showCard(data) {
    document.querySelector("#popup").classList.add("hasCard");
    document.querySelector("#card-header").innerText = data.Heading;
    document.querySelector("#card-image > img").src = data.Image;
    document.querySelector("#card-summary").innerText = data.AbstractText;
    document.querySelector("#card-source-link").innerText = data.AbstractSource;
    document.querySelector("#card-source-link").href = data.AbstractURL;
  };

  function playListeningChime() {
    const audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg"); // TODO: File bug on local audio file playback
    audio.play();
  }

  function showPreviousState() {
    // TODO: May need to make this a bit more sophisticated and save the previous state (e.g. if they were typing)
    exports.setState("listening");
  }

  function listenForBack() {
    const backIcon = document.getElementById("back-icon");
    backIcon.addEventListener("click", showPreviousState);
  }

  function showSettings() {
    exports.setState("settings");
  }

  function listenForSettings() {
    const settingsIcon = document.getElementById("settings-icon");
    settingsIcon.addEventListener("click", showSettings);
  }

  exports.closePopup = function closePopup(ms = 2500) {
    // TODO: offload mic and other resources before closing?
    setTimeout(() => {
      window.close();
    }, ms);
  }

  function listenForClose() {
    const closeIcon = document.getElementById("close-icon");
    closeIcon.addEventListener("click", () => {
      exports.closePopup(0); // close immediately
    });
  }

  listenForClose();
  listenForSettings();
  listenForBack();

  return exports;
})();
