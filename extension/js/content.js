/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  console.log("Speak To Me starting up...");

  var port = browser.runtime.connect({name:"cs-port"});

  port.onMessage.addListener(function(m) {
    console.log("In content script, received message from background script: ");
    console.log(m.type);
    if (m.type == "noAudibleTabs") {

    } else if (m.type == "muting") {
      onMute();
    } else if (m.type == "googleAssistant") {
      console.log("THE EVENT TYPE IS....");
      console.log(m.event);
      if (m.event == "PROCESSING") {
        externalAssistantProcessingState(m.type);
      } else if (m.event == "GOOGLE_RESPONSE") {
        displayGoogleResults(m.content);
      }
    } else if (m.type == "alexa") {
      console.log("THE EVENT TYPE IS....");
      console.log(m.event);
      if (m.event == "PROCESSING") {
        externalAssistantProcessingState(m.type);
      } else if (m.event == "ALEXA_RESPONSE") {
        displayGoogleResults(m.content);
      }
    }
  });

  const DONE_ANIMATION =
    browser.extension.getURL("/assets/animations/Done.json");
  const SPINNING_ANIMATION =
    browser.extension.getURL("/assets/animations/Spinning.json");
  const START_ANIMATION =
    browser.extension.getURL("/assets/animations/Start.json");
  const ERROR_ANIMATION =
    browser.extension.getURL("/assets/animations/Error.json");

  // Encapsulation of the popup we use to provide our UI.
  const POPUP_WRAPPER_MARKUP = `<div id="stm-popup">
      <div id="stm-header">
        <div role="button" tabindex="1" id="stm-close" title="Close"></div>
      </div>
      <div id="stm-inject"></div>
      <div id="stm-text-input-wrapper">
        <span id="text-input" contenteditable="true"></span>
        <div id="send-btn-wrapper">
          <button id="send-text-input">GO</button>
        </div>
      </div>
      <div id="stm-footer">
        Processing as {language}.
        <br>
        To change language, navigate to <a href="about:addons">about:addons</a>,
        then click the Preferences button next to Voice Fill.
      </div>
      <a href="https://qsurvey.mozilla.com/s3/voice-fill?ref=product&ver=2"
         id="stm-feedback" role="button" tabindex="2">
        Feedback
      </a>
    </div>`;

  // When submitting, this markup is passed in
  const SUBMISSION_MARKUP = `<div id="stm-levels-wrapper">
      <canvas hidden id="stm-levels" width=720 height=310></canvas>
    </div>
    <div id="stm-animation-wrapper">
      <div id="stm-box"></div>
    </div>
    <div id="transcription">
      <div id="transcription-content" class="hidden">
        <div id="transcription-text"></div>
      </div>
    </div>
    <div id="stm-content">
      <div id="stm-startup-text">Warming up...</div>
    </div>`;

  // When Selecting, this markup is passed in
  const SELECTION_MARKUP = `<form id="stm-selection-wrapper">
      <div id="stm-list-wrapper">
        <input id="stm-input" type="text" autocomplete="off">
        <div id="stm-list"></div>
      </div>
      <button id="stm-reset-button" title="Reset" type="button"></button>
      <input id="stm-submit-button" type="submit" title="Submit" value="">
    </form>`;

  let languages = {};
  let language;
  let stm;
  let audioContext;
  let sourceNode;
  let analyzerNode;
  let outputNode;
  let listening = false;

  const languagePromise = fetch(browser.extension.getURL("/js/languages.json"))
    .then((response) => {
      return response.json();
    })
    .then((l) => {
      languages = l;
      return browser.storage.sync.get("language");
    })
    .then((item) => {
      if (!item.language) {
        throw new Error("Language not set");
      }

      language = item.language;
    })
    .catch(() => {
      language = languages.hasOwnProperty(navigator.language)
        ? navigator.language
        : "en-US";
    })
    .then(() => {
      stm = SpeakToMe({
        listener,
        serverURL: "https://speaktome-2.services.mozilla.com",
        timeout: 6000,
        language,
        productTag: "vf",
        maxSilence: 3000,
      });
    });

  if (!navigator.mediaDevices ||
      !(navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia)) {
    console.error(
      "You need a browser with getUserMedia support to use Speak To Me, sorry!"
    );
    return;
  }

  const escapeHTML = (str) => {
    // Note: string cast using String; may throw if `str` is non-serializable,
    // e.g. a Symbol. Most often this is not the case though.
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  browser.runtime.onMessage.addListener((request) => {
    SpeakToMePopup.showAt(0, 0);
    stmInit();
    return Promise.resolve({response: "content script ack"});
  });

  const SpeakToMePopup = {
    // closeClicked used to skip out of media recording handling
    closeClicked: false,
    init: () => {
      // lower the music on all tabs

      console.log("SpeakToMePopup init");
      const popup = document.createElement("div");
      // eslint-disable-next-line no-unsanitized/property
      popup.innerHTML = POPUP_WRAPPER_MARKUP;
      document.body.appendChild(popup);

      document.getElementById("stm-popup").style.backgroundImage =
        `url("${browser.extension.getURL("/assets/images/ff-logo.png")}")`;
      document.getElementById("stm-close").style.backgroundImage =
        `url("${browser.extension.getURL("/assets/images/icon-close.svg")}")`;
      document.getElementById("stm-feedback").style.backgroundImage =
        `url("${browser.extension.getURL("/assets/images/feedback.svg")}")`;

      if (document.dir === "rtl") {
        document.getElementById("stm-close").classList.add("rtl");
        document.getElementById("stm-popup").classList.add("rtl");
        document.getElementById("stm-feedback").classList.add("rtl");
      }

      languagePromise.then(() => {
        const footer = document.getElementById("stm-footer");
        // eslint-disable-next-line no-unsanitized/property
        footer.innerHTML = footer.innerHTML.replace(
          "{language}",
          languages[language]
        );
      });

      this.inject = document.getElementById("stm-inject");
      this.popup = document.getElementById("stm-popup");
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SUBMISSION_MARKUP;
    },

    showAt: (x, y) => {
      console.log(`SpeakToMePopup showAt ${x},${y}`);
      const style = this.popup.style;
      style.display = "flex";
      this.dismissPopup = function(e) {
        const key = e.which || e.keyCode;
        if (key === 27) {
          SpeakToMePopup.cancelFetch = true;
          e.preventDefault();
          SpeakToMePopup.hide();
          stm.stop();
          SpeakToMePopup.closeClicked = true;
        }
      };

      processTextQuery = function(e) {
        // SpeakToMePopup.cancelFetch = true;
        stm.stop();
        console.log("process this text!");
        const textContent = textInput.innerText;
        const intentData = parseIntent(textContent);
        console.log(intentData);
        port.postMessage(intentData);
      }

      this.detectText = function(e) {
        document.getElementById("send-btn-wrapper").style.display = "block";
        if (e.keyCode == 13) {
          processTextQuery();
        }
      };
      const textInput = document.getElementById("text-input");
      textInput.focus();
      textInput.addEventListener("keyup", this.detectText);

      const sendText = document.getElementById("send-text-input");
      sendText.addEventListener("click", () => {
        processTextQuery();
      });
    },

    hide: () => {
      console.log("SpeakToMePopup hide");
      this.removeEventListener("keypress", this.dismissPopup);
      this.popup.classList.add("stm-drop-out");

      setTimeout(() => {
        this.popup.classList.remove("stm-drop-out");
        this.popup.style.display = "none";
        // eslint-disable-next-line no-unsanitized/property
        this.inject.innerHTML = SUBMISSION_MARKUP;
      }, 500);
    },

    reset: () => {
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SUBMISSION_MARKUP;
    },

    // Returns a Promise that resolves once the "Stop" button is clicked.
    waitForStop: () => {
      console.log("SpeakToMePopup waitForStop");
      return new Promise((resolve, reject) => {
        const popup = document.getElementById("stm-popup");
        const close = document.getElementById("stm-close");
        popup.addEventListener("click", () => resolve(), {once: true});
        close.addEventListener(
          "click",
          (e) => {
            e.stopPropagation();
            reject();
          },
          {once: true}
        );
      });
    },

    // Returns a Promise that resolves to the chosen text.
    chooseItem: (data) => {
      console.log("SpeakToMePopup chooseItem");
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SELECTION_MARKUP;
      const close = document.getElementById("stm-close");
      const form = document.getElementById("stm-selection-wrapper");
      const input = document.getElementById("stm-input");
      const list = document.getElementById("stm-list");
      const listWrapper = document.getElementById("stm-list-wrapper");
      const reset = document.getElementById("stm-reset-button");

      reset.style.backgroundImage =
        `url("${browser.extension.getURL("/assets/images/icon-redo.svg")}")`;

      const submitButton = document.getElementById("stm-submit-button");
      if (document.dir === "rtl") {
        submitButton.classList.add("rtl");
        submitButton.style.backgroundImage =
          `url("${browser.extension.getURL("/assets/images/icon-done-rtl.svg")}")`;
      } else {
        submitButton.style.backgroundImage =
          `url("${browser.extension.getURL("/assets/images/icon-done.svg")}")`;
      }

      let firstChoice;

      return new Promise((resolve, reject) => {
        if (data.length === 1) {
          firstChoice = data[0];
          listWrapper.removeChild(list);
        } else {
          let html = "<ul class='stm-list-inner'>";
          data.forEach((item, index) => {
            if (index === 0) {
              firstChoice = item;
            } else if (index < 5) {
              const confidence = escapeHTML(item.confidence);
              const text = escapeHTML(item.text);
              html += `<li idx_suggestion="${index}" confidence="${confidence}"
                role="button" tabindex="0">${text}</li>`;
            }
          });
          html += "</ul>";
          // eslint-disable-next-line no-unsanitized/property
          list.innerHTML = html;
        }

        input.confidence = escapeHTML(firstChoice.confidence);
        input.value = escapeHTML(firstChoice.text);
        input.size = Math.max(input.value.length, 10);
        input.idx_suggestion = 0;
        input.focus();

        input.addEventListener("keypress", (e) => {
          // e.preventDefault();
          if (e.keyCode === 13) {
            e.preventDefault();
            list.classList.add("close");
            resolve(input);
          }
        });

        input.addEventListener("input", () => {
          input.size = Math.max(10, input.value.length);
        });

        form.addEventListener("submit", function _submit_form(e) {
          e.preventDefault();
          e.stopPropagation();
          list.classList.add("close");
          form.removeEventListener("submit", _submit_form);
          resolve(input);
        });

        list.addEventListener("click", function _choose_item(e) {
          e.preventDefault();
          list.removeEventListener("click", _choose_item);
          if (e.target instanceof HTMLLIElement) {
            const result = [];
            result.confidence = e.target.getAttribute("confidence");
            result.value = e.target.textContent;
            result.idx_suggestion = e.target.getAttribute("idx_suggestion");
            list.classList.add("close");
            input.value = e.target.textContent;
            input.size = input.value.length;

            resolve(result);
          }
        });

        list.addEventListener("keypress", function _choose_item(e) {
          const key = e.which || e.keyCode;
          if (key === 13) {
            list.removeEventListener("click", _choose_item);
            if (e.target instanceof HTMLLIElement) {
              const result = [];
              result.confidence = e.target.getAttribute("confidence");
              result.value = e.target.textContent;
              result.idx_suggestion = e.target.getAttribute("idx_suggestion");
              list.classList.add("close");
              input.value = e.target.textContent;
              input.size = input.value.length;

              resolve(result);
            }
          }
        });

        reset.addEventListener("click", function _reset_click(e) {
          e.preventDefault();
          reset.removeEventListener("click", _reset_click);
          reject(e.target.id);
        });

        close.addEventListener("click", function _close_click(e) {
          e.preventDefault();
          close.removeEventListener("click", _close_click);
          reject(e.target.id);
        });

        close.addEventListener("keypress", function _close_click(e) {
          const key = e.which || e.keyCode;
          if (key === 13) {
            e.preventDefault();
            close.removeEventListener("keypress", _close_click);
            reject(e.target.id);
          }
        });
      });
    },
  };

  const listener = (msg) => {
    switch (msg.state) {
      case "ready": {
        listening = false;
        break;
      }
      case "error": {
        listening = false;
        console.error(msg.error);
        failGracefully(msg.error.toString());
        break;
      }
      case "listening": {
        const stream = stm.getmediaStream();
        if (!stream) {
          return;
        }

        const micOpen = new Audio(browser.runtime.getURL('/assets/audio/mic_open_chime.ogg'));
        micOpen.play();

        // Build the WebAudio graph we'll be using
        audioContext = new AudioContext();
        sourceNode = audioContext.createMediaStreamSource(stream);
        analyzerNode = audioContext.createAnalyser();
        outputNode = audioContext.createMediaStreamDestination();

        // make sure we're doing mono everywhere
        sourceNode.channelCount = 1;
        analyzerNode.channelCount = 1;
        outputNode.channelCount = 1;

        // connect the nodes together
        sourceNode.connect(analyzerNode);
        analyzerNode.connect(outputNode);

        SpeakToMePopup.waitForStop().then(
          () => {
            stm.stop();
          },
          () => {
            stm.stop();
            SpeakToMePopup.closeClicked = true;
            SpeakToMePopup.hide();
          }
        );

        document.getElementById("stm-levels").hidden = false;
        visualize(analyzerNode);

        const copy = document.getElementById("stm-content");
        loadAnimation(SPINNING_ANIMATION, true);
        copy.innerHTML = `<div id="stm-listening-text">Listening...</div>`;
        break;
      }
      case "processing": {
        analyzerNode.disconnect(outputNode);
        sourceNode.disconnect(analyzerNode);
        audioContext.close();

        const copy = document.getElementById("stm-content");
        copy.innerHTML = `<div id="stm-listening-text">Processing...</div>`;
        loadAnimation(DONE_ANIMATION, false);
        break;
      }
      case "result": {
        // We stopped the recording, send the content to the STT server.
        audioContext = null;
        sourceNode = null;
        analyzerNode = null;
        outputNode = null;

        document.getElementById("stm-levels").hidden = true;

        // handle clicking on close element by dumping recording data
        if (SpeakToMePopup.closeClicked) {
          SpeakToMePopup.closeClicked = false;
          return;
        }

        if (SpeakToMePopup.cancelFetch) {
          SpeakToMePopup.cancelFetch = false;
          return;
        }

        // complex parsing logic goes somewhere around here
        const query = msg.data[0].text;

        console.debug("CONFIDENCE OF TRANSCRIPTIONS");
        console.debug(JSON.stringify(msg.data));

        // Show transcription result
        const transcription = document.getElementById("transcription-content");
        transcription.classList.remove("hidden");
        const transcriptionText = document.getElementById("transcription-text");
        transcriptionText.innerHTML = query;

        let matches;

        // TEMPORARILY DISABLE GOOGLE ASSISTANT + ALEXA INVOCATIONS FOR USER TESTING
        if (matches = query.match(/(?:ok |okay |o.k. |hey )?\balexa\b(.*)/i)) {
          action = "alexa";
        } else if (matches = query.match(/(?:ok|okay|o.k.|hey) google (.*)/i)) {
          action = "googleAssistant";
        } else if (matches = query.match(/(?!.*tab.*)(?:(?:bring me|go|navigate) to|open|find|show me)\s(.*)/i)) {
          action = "navigate";
        } else if (matches = query.match(/\bunmute\b/i)) {
          action = "unmute";
        } else if (matches = query.match(/(?:mute|turn off)\s?(?:whatever is )?(?:playing|all)?\s?(?:the )?(?:music|audio|sound|everything)?|^quiet$|^shut up$|^stop$/i)) {
          action = "mute";
        }else if (matches = query.match(/(?:find the (?:tab|tap|tad|todd) (?:about|with) (.*))|(?:(?:(?:bring me to|find) (?:the|my)? )?(.*) (?:tab|tap|tad|todd))/i)) {
          action = "find";
        } else if (matches = query.match(/search (?:for )?(?:a |an )?(.*) on amazon/i)) {
          action = "amazonSearch";
        } else if (matches = query.match(/(?:do a )?(?:search |query |find(?: me)? |google |look up |lookup |look on )(?:google |the web |the internet )?(?:for )?(.*)(?:on the web)?/i)) {
          action = "search";
        } else if (matches = query.match(/(?:(?:what's the |what is the )?(weather|forecast|temperature) (?:in |for )?(.*))|(?:(.* weather))/i)) {
          action = "weather";
        } else if (matches = query.match(/(?:(?:set |start )(?:a )?(timer .*))|(.* timer)/i)) {
          action = "timer";
        } else if (matches = query.match(/(?:play(.*))/i)) {
          action = "play";
        } else {
          action = "search";
          matches = [,query]; // a hack to put this in the expected format of the next matches line
        }
        
        matches = matches.slice(1).join(' '); // extract only the captured groups, flatten them into a single string

        // Tell the background script which action to execute
        port.postMessage({
          action: action,
          content: matches
        });

        console.log(`Got STT result: ${JSON.stringify(msg)}`);
        const container = document.getElementById("stm-box");
        container.classList.add("stm-done-animation");

        break;
      }
    }
  };

  // Helper for animation startup
  const stmInit = () => {
    loadAnimation(START_ANIMATION, false, "stm-start-animation");

    if (listening) {
      stm.stop();
      listening = false;
    }

    stm.listen();
    listening = true;
  };

  // Helper to handle background visualization
  const visualize = (analyzerNode) => {
    const MIN_DB_LEVEL = -85; // The dB level that is 0 in the levels display
    const MAX_DB_LEVEL = -30; // The dB level that is 100% in the levels display

    // Set up the analyzer node, and allocate an array for its data
    // FFT size 64 gives us 32 bins. But those bins hold frequencies up to
    // 22kHz or more, and we only care about visualizing lower frequencies
    // which is where most human voice lies, so we use fewer bins
    analyzerNode.fftSize = 64;
    const frequencyBins = new Float32Array(14);

    // Clear the canvas

    const popupWidth = document.getElementById("stm-popup").offsetWidth;

    const levels = document.getElementById("stm-levels");
    const xPos =
      popupWidth < levels.offsetWidth
        ? popupWidth * 0.5 - 22
        : levels.offsetWidth * 0.5;
    const yPos = levels.offsetHeight * 0.5;
    const context = levels.getContext("2d");
    context.clearRect(0, 0, levels.width, levels.height);

    if (levels.hidden) {
      // If we've been hidden, return right away without calling rAF again.
      return;
    }

    // Get the FFT data
    analyzerNode.getFloatFrequencyData(frequencyBins);

    // Display it as a barchart.
    // Drop bottom few bins, since they are often misleadingly high
    const skip = 2;
    const n = frequencyBins.length - skip;
    const dbRange = MAX_DB_LEVEL - MIN_DB_LEVEL;

    // Loop through the values and draw the bars
    context.strokeStyle = "#d1d2d3";

    for (let i = 0; i < n; i++) {
      const value = frequencyBins[i + skip];
      const diameter =
        ((levels.height * (value - MIN_DB_LEVEL)) / dbRange) * 10;
      if (diameter < 0) {
        continue;
      }
      // Display a bar for this value.
      let alpha = diameter / 500;
      if (alpha > 0.2) alpha = 0.2;
      else if (alpha < 0.1) alpha = 0.1;

      context.lineWidth = alpha * alpha * 150;
      context.globalAlpha = alpha * alpha * 5;
      context.beginPath();
      context.ellipse(xPos, yPos, diameter, diameter, 0, 0, 2 * Math.PI);
      if (diameter > 90 && diameter < 360) context.stroke();
    }
    // Update the visualization the next time we can
    requestAnimationFrame(function() {
      visualize(analyzerNode);
    });
  };

  // Helper to handle bodymobin
  const loadAnimation = (animationType, loop, className) => {
    const container = document.getElementById("stm-box");
    container.className = "";
    if (className) {
      container.classList.add(className);
    }
    if (bodymovin) {
      bodymovin.destroy();
    }
    bodymovin.loadAnimation({
      container,
      loop,
      renderer: "svg",
      autoplay: true,
      path: animationType, // the path to the animation json
    });
  };

  const displayOptions = (items) => {
    // Filter the array for empty items and normalize the text.
    const data = items
      .filter((item) => {
        return item.text !== "";
      })
      .map((item) => {
        return {
          confidence: item.confidence,
          text: item.text.toLowerCase(),
        };
      });

    if (data.length === 0) {
      failGracefully("EMPTYRESULTS");
      return;
    }

    const validateResults = function(data) {
      if (data.length === 1) {
        return true;
      }

      const val0 = String(data[0].confidence).substring(0, 4);
      const val1 = String(data[1].confidence).substring(0, 4);

      if (val0 - val1 > 0.2) {
        return true;
      }
      return false;
    };

    // if the first result has a high enough confidence, or the distance
    // to the second large enough just
    // use it directly.
    data.sort(function(a, b) {
      return b.confidence - a.confidence;
    });
    if (validateResults(data)) {
      SpeakToMePopup.hide();
      return;
    }

    SpeakToMePopup.chooseItem(data).then(
      (input) => {
        stmIcon.setInput(input.value);
        // Once a choice is made, close the popup.
        SpeakToMePopup.hide();
      },
      (id) => {
        if (id === "stm-reset-button") {
          SpeakToMePopup.reset();
          stmInit();
        } else {
          SpeakToMePopup.hide();
        }
      }
    );
  };

  // const stmIcon = new SpeakToMeIcon();
  SpeakToMePopup.init();

  const failGracefully = (errorMsg) => {
    if (errorMsg.indexOf("GUM") === 0) {
      errorMsg = "Please enable your microphone to use Voice Fill";
    } else if (errorMsg.indexOf("EMPTYRESULTS") === 0) {
      errorMsg = "No results found";
    } else {
      errorMsg = "Sorry, we encountered an error";
    }
    loadAnimation(ERROR_ANIMATION, false);
    const copy = document.getElementById("stm-content");
    copy.innerHTML = '<div id="stm-listening-text"></div>';
    const errorDiv = document.getElementById("stm-listening-text");
    errorDiv.textContent = errorMsg;
    setTimeout(() => {
      SpeakToMePopup.hide();
      port.postMessage({
        action: "dismissCurrentTab",
      });
    }, 1500);
    console.log("ERROR: ", errorMsg);
  };

  const externalAssistantProcessingState = (assistant) => {
    // Make a div that shows a google assistant logo that pulses
    const container = document.getElementById("stm-animation-wrapper");
    container.innerHTML = '';
    const assistantLogo = document.createElement("div");
    // eslint-disable-next-line no-unsanitized/property
    assistantLogo.style.backgroundImage =
      `url("${browser.extension.getURL(`/assets/images/${assistant}_logo.svg`)}")`;
    container.style.textAlign = "center";
    assistantLogo.id = "google-assistant-logo";
    assistantLogo.classList = "gaLogo animated infinite pulse";
    container.appendChild(assistantLogo);
  };

  const displayGoogleResults = (googleTextResponse) => {
    // Show a "done" animation (spin?)
    const googleAssistantLogo = document.getElementById("google-assistant-logo");
    googleAssistantLogo.classList.remove('infinite', 'pulse');
    googleAssistantLogo.classList.add('tada');
    // display google's response beneath the user's query
    const googleAssistantResult = document.getElementById("stm-listening-text");
    googleAssistantResult.innerText = googleTextResponse; 
  };
})();
