function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/* globals util, voice, vad, lottie, settings, log, voiceShim, buildSettings */
const React = window.React;
const {
  Component
} = React;
const ReactDOM = window.ReactDOM;
const PERMISSION_REQUEST_TIME = 2000;
const FAST_PERMISSION_CLOSE = 500;
let stream;
let isWaitingForPermission = null;
let executedIntent = false;
const {
  backgroundTabRecorder
} = buildSettings; // Default amount of time (in milliseconds) before the action is automatically dismissed after we perform certain actions (e.g. successfully switching to a different open tab). This value should give users enough time to read the content on the popup before it closes.

const DEFAULT_TIMEOUT = 2500; // Timeout for the popup when there's text displaying:

const TEXT_TIMEOUT = 7000;
let overrideTimeout = null;
let recorder;
let recorderIntervalId;
const initialState = {
  currentState: "listening",
  suggestions: [],
  transcript: null,
  error: null,
  displayText: null,
  displayAutoplay: false,
  search: null,
  card: null
};

class PopupReact extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
    this.textInputDetected = false;
  }

  componentWillMount() {
    document.addEventListener("keydown", this.onKeyPressed.bind(this));
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed.bind(this));
    browser.runtime.sendMessage({
      type: "microphoneStopped"
    });

    if (!executedIntent) {
      browser.runtime.sendMessage({
        type: "cancelledIntent"
      });
    }

    if (!backgroundTabRecorder && isWaitingForPermission && Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE) {
      this.startOnboarding();
    } // TODO: offload mic and other resources before closing?

  }

  async init() {
    backgroundTabRecorder ? await voiceShim.openRecordingTab() : await this.setupStream();
    this.startRecorder(); // Listen for messages from the background scripts

    browser.runtime.onMessage.addListener(this.handleMessage.bind(this));
    this.updateExamples();
  }

  onKeyPressed() {
    if (!this.textInputDetected) {
      this.textInputDetected = true;
      this.setCurrentState("typing");
      this.onStartTextInput();
    }
  }

  async onStartTextInput() {
    await browser.runtime.sendMessage({
      type: "microphoneStopped"
    });
    log.debug("detected text from the popup");
    recorder.cancel(); // not sure if this is working as expected?

    clearInterval(recorderIntervalId);
  }

  async setupStream() {
    try {
      isWaitingForPermission = Date.now();
      await this.startMicrophone();
      isWaitingForPermission = null;
    } catch (e) {
      isWaitingForPermission = false;

      if (e.name === "NotAllowedError" || e.name === "TimeoutError") {
        this.startOnboarding();
        window.close();
        return;
      }

      throw e;
    }

    await vad.stm_vad_ready;
  }

  async requestMicrophone() {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    return stream;
  }

  async startMicrophone() {
    const sleeper = util.sleep(PERMISSION_REQUEST_TIME).then(() => {
      const exc = new Error("Permission Timed Out");
      exc.name = "TimeoutError";
      throw exc;
    });
    await Promise.race([this.requestMicrophone(), sleeper]);
  }

  async startOnboarding() {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html")
    });
  }

  startRecorder(stream) {
    recorder = backgroundTabRecorder ? new voiceShim.Recorder() : new voice.Recorder(stream);

    recorder.onBeginRecording = () => {
      browser.runtime.sendMessage({
        type: "microphoneStarted"
      });
      this.setCurrentState("listening");
    };

    recorder.onEnd = json => {
      // Probably superfluous, since this is called in onProcessing:
      browser.runtime.sendMessage({
        type: "microphoneStopped"
      });
      clearInterval(recorderIntervalId);
      this.setCurrentState("success");

      if (json === null) {
        // It was cancelled
        return;
      }

      browser.runtime.sendMessage({
        type: "addTelemetry",
        properties: {
          transcriptionConfidence: json.data[0].confidence
        }
      });
      this.setTranscript(json.data[0].text);
      executedIntent = true;
      browser.runtime.sendMessage({
        type: "runIntent",
        text: json.data[0].text
      });
    };

    recorder.onError = error => {
      browser.runtime.sendMessage({
        type: "microphoneStopped"
      });
      log.error("Got recorder error:", String(error), error);
      this.setCurrentState("error");
      clearInterval(recorderIntervalId);
    };

    recorder.onProcessing = () => {
      browser.runtime.sendMessage({
        type: "microphoneStopped"
      });
      this.setCurrentState("processing");
    };

    recorder.onNoVoice = () => {
      browser.runtime.sendMessage({
        type: "microphoneStopped"
      });
      log.debug("Closing popup because of no voice input");
      window.close();
    };

    recorder.startRecording();
  }

  handleMessage(message) {
    switch (message.type) {
      case "closePopup":
        {
          closePopup(message.time);
          break;
        }

      case "showCard":
        {
          this.setState({
            card: message.cardData
          });
          break;
        }

      case "displayFailure":
        {
          this.setCurrentState("error");

          if (message.message) {
            this.setState({
              error: message.message
            });
          }

          break;
        }

      case "displayText":
        {
          this.setState({
            displayText: message.message
          });
          overrideTimeout = TEXT_TIMEOUT;
          break;
        }

      case "displayAutoplayFailure":
        {
          this.setErrorMessage("Please enable autoplay on this site for a better experience");
          this.setState({
            displayAutoplay: true
          });
          break;
        }

      case "showSearchResults":
        {
          this.setState({
            search: message
          });
          this.setCurrentState("searchResults");
          return Promise.resolve(true);
        }

      default:
        break;
    }

    return;
  }

  async updateExamples() {
    const suggestions = await browser.runtime.sendMessage({
      type: "getExamples",
      number: 3
    });
    this.setState({
      suggestions
    });
  }

  setCurrentState(currentState) {
    this.setState({
      currentState
    });
  }

  setTranscript(transcript) {
    this.setState({
      transcript
    });
  }

  render() {
    return React.createElement("div", {
      id: "popup",
      className: this.state.currentState
    }, React.createElement(PopupHeader, {
      currentState: this.state.currentState
    }), React.createElement(PopupContent, _extends({
      setCurrentState: this.setCurrentState.bind(this),
      setTranscript: this.setTranscript.bind(this)
    }, this.state)), React.createElement(PopupFooter, null));
  }

}

class PopupHeader extends Component {
  constructor(props) {
    super(props);
  }

  getTitle() {
    switch (this.props.currentState) {
      case "processing":
        return "One second...";

      case "success":
        return "Got it!";

      case "error":
        return "Sorry, there was an issue";

      case "typing":
        return "Type your request";

      case "searchResults":
        return "Search results";

      case "listening":
      default:
        return "Listening";
    }
  }

  onClickGoBack() {
    location.href = `${location.pathname}?${Date.now()}`;
  }

  onClickClose() {
    window.close();
  }

  render() {
    const hiddenClass = this.props.currentState === "error" || this.props.currentState === "searchResults" ? "" : "hidden";
    return React.createElement("div", {
      id: "popup-header"
    }, React.createElement("div", {
      id: "left-icon",
      className: hiddenClass,
      onClick: this.onClickGoBack
    }, React.createElement("svg", {
      id: "back-icon",
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16"
    }, React.createElement("path", {
      fill: "context-fill",
      d: "M6.414 8l4.293-4.293a1 1 0 0 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414z"
    }))), React.createElement("div", {
      id: "header-title"
    }, this.getTitle()), React.createElement("div", {
      id: "close-icon",
      onClick: this.onClickClose
    }, React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16"
    }, React.createElement("path", {
      fill: "context-fill",
      d: "M9.061 8l3.47-3.47a.75.75 0 0 0-1.061-1.06L8 6.939 4.53 3.47a.75.75 0 1 0-1.06 1.06L6.939 8 3.47 11.47a.75.75 0 1 0 1.06 1.06L8 9.061l3.47 3.47a.75.75 0 0 0 1.06-1.061z"
    }))));
  }

}

class PopupContent extends Component {
  constructor(props) {
    super(props);
  }

  getContent() {
    switch (this.props.currentState) {
      case "listening":
        return React.createElement(ListeningContent, this.props);

      case "typing":
        return React.createElement(TypingContent, this.props);

      case "processing":
        return React.createElement(ProcessingContent, this.props);

      case "success":
        return React.createElement(SuccessContent, this.props);

      case "error":
        return React.createElement(ErrorContent, this.props);

      case "searchResults":
        return React.createElement(SearchResultsContent, this.props);

      default:
        return null;
    }
  }

  render() {
    return React.createElement("div", {
      id: "popup-content"
    }, React.createElement(Zap, {
      currentState: this.props.currentState
    }), this.getContent());
  }

}

class PopupFooter extends Component {
  constructor(props) {
    super(props);
  }

  async showSettings() {
    await browser.tabs.create({
      url: browser.runtime.getURL("options/options.html")
    });
    window.close();
  }

  render() {
    return React.createElement("div", {
      id: "popup-footer"
    }, React.createElement("div", {
      id: "settings-icon",
      onClick: this.showSettings
    }, React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16"
    }, React.createElement("path", {
      fill: "context-fill",
      d: "M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"
    }))), React.createElement("div", {
      id: "moz-voice-privacy"
    }, React.createElement("strong", null, "For Mozilla internal use only")), React.createElement("div", null));
  }

}

class ListeningContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userSettings: null
    };
  }

  componentDidMount() {
    this.getUserSettings();
  }

  componentDidUpdate() {
    if (this.state.userSettings.chime) {
      this.playListeningChime();
    }
  }

  async getUserSettings() {
    this.setState({
      userSettings: await settings.getSettings()
    });
  }

  playListeningChime() {
    const audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg");
    audio.play();
  }

  render() {
    return React.createElement(React.Fragment, null, React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }), React.createElement(VoiceInput, this.props));
  }

}

class TypingContent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return React.createElement(React.Fragment, null, React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }), React.createElement(TypingInput, this.props));
  }

}

class VoiceInput extends Component {
  constructor(props) {
    super(props);
  }

  async onClickLexicon(event) {
    event.preventDefault();
    await browser.tabs.create({
      url: event.target.href
    });
    window.close();
  }

  render() {
    return React.createElement("div", {
      id: "voice-input"
    }, this.props.suggestions ? React.createElement("div", {
      id: "suggestions"
    }, React.createElement("p", {
      id: "prompt"
    }, "You can say things like:"), React.createElement("div", {
      id: "suggestions-list"
    }, this.props.suggestions.map(suggestion => React.createElement("p", {
      className: "suggestion",
      key: suggestion
    }, suggestion))), React.createElement("div", null, React.createElement("a", {
      target: "_blank",
      rel: "noopener",
      id: "lexicon",
      href: "../views/lexicon.html",
      onClick: this.onClickLexicon
    }, "More things you can say"))) : null);
  }

}

class TypingInput extends Component {
  constructor(props) {
    super(props);
    this.textInputRef = React.createRef();
  }

  componentDidMount() {
    this.focusText();
  }

  focusText() {
    if (this.textInputRef.current) {
      setTimeout(() => {
        this.textInputRef.current.focus();
      }, 0);
    }
  }

  onInputKeyPress(event) {
    if (event.key === "Enter") {
      this.submitTextInput();
    }
  }

  onInputTextChange() {
    this.setState({
      value: event.target.value
    });
  }

  async submitTextInput() {
    const text = this.state.value;

    if (text) {
      await browser.runtime.sendMessage({
        type: "microphoneStopped"
      });
      this.props.setCurrentState("success");
      this.props.setTranscript(text);
      executedIntent = true;
      browser.runtime.sendMessage({
        type: "addTelemetry",
        properties: {
          inputTyped: true
        }
      });
      browser.runtime.sendMessage({
        type: "runIntent",
        text
      });
    }
  }

  render() {
    return React.createElement("div", {
      id: "text-input"
    }, React.createElement("input", {
      type: "text",
      id: "text-input-field",
      autoFocus: "1",
      onKeyPress: this.onInputKeyPress.bind(this),
      onChange: this.onInputTextChange.bind(this)
    }), React.createElement("div", {
      id: "send-btn-wrapper"
    }, React.createElement("button", {
      id: "send-text-input",
      onClick: this.submitTextInput.bind(this)
    }, "GO")));
  }

}

class ProcessingContent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return React.createElement(React.Fragment, null, React.createElement(Transcript, {
      transcript: this.props.transcript
    }), React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }));
  }

}

class SuccessContent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return React.createElement("div", null, React.createElement(Transcript, {
      transcript: this.props.transcript
    }), React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }), React.createElement(Card, {
      card: this.props.card
    }));
  }

}

class ErrorContent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return React.createElement("div", null, React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }), React.createElement("div", {
      id: "error-message"
    }, this.props.error), this.props.displayAutoplay ? React.createElement("div", {
      id: "error-autoplay"
    }, React.createElement("img", {
      src: "images/autoplay-instruction.png",
      alt: "To enable autoplay, open the site preferences and select Allow Audio and Video"
    })) : null, React.createElement(Card, {
      card: this.props.card
    }));
  }

}

class SearchResultsContent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  async onSearchImageClick() {
    await browser.runtime.sendMessage({
      type: "focusSearchResults",
      searchUrl: this.props.search.searchUrl
    });
  }

  render() {
    if (!this.props.search) return null;
    const {
      card,
      searchResults,
      index
    } = this.props.search;
    const next = searchResults[index + 1];
    const cardStyles = card ? {
      height: card.height,
      width: card.width,
      src: card.src
    } : {};
    const imgAlt = next ? next.title : "";
    if (card) setMinPopupSize(card.width, card.height);
    return React.createElement(React.Fragment, null, React.createElement(TextDisplay, {
      displayText: this.props.displayText
    }), React.createElement("div", {
      id: "search-results"
    }, card ? React.createElement("img", {
      id: "search-image",
      alt: imgAlt,
      onClick: this.onSearchImageClick,
      style: cardStyles
    }) : null, next ? React.createElement("div", {
      id: "search-show-next"
    }, "Say ", React.createElement("strong", null, "next result"), " to view: ", React.createElement("br", null), React.createElement("strong", {
      id: "search-show-next-title"
    }, next.title), React.createElement("span", {
      id: "search-show-next-domain"
    }, new URL(next.url).hostname)) : null));
  }

}

class Card extends Component {
  constructor(props) {
    super(props);
  }

  cardLinkClick(event) {
    event.preventDefault();
    browser.tabs.create({
      url: this.props.card.AbstractURL
    });
    closePopup();
  }

  render() {
    const {
      card
    } = this.props;
    return card ? React.createElement("div", {
      id: "card"
    }, React.createElement("div", {
      id: "card-header"
    }, card.Heading), React.createElement("div", {
      id: "card-image"
    }, React.createElement("img", {
      alt: "",
      src: ""
    })), React.createElement("div", {
      id: "card-summary"
    }, card.AbstractText), React.createElement("div", {
      id: "card-ack"
    }, React.createElement("div", {
      id: "ddg-ack"
    }, card.Image ? React.createElement("img", {
      alt: "",
      id: "ddg-logo",
      src: card.Image
    }) : null, React.createElement("a", {
      href: "https://duckduckgo.com/"
    }, "Results from DuckDuckGo")), React.createElement("div", {
      className: "sep"
    }), React.createElement("div", {
      id: "source-ack"
    }, React.createElement("span", null, "Source:"), React.createElement("div", {
      id: "card-source"
    }, React.createElement("a", {
      id: "card-source-link",
      href: card.AbstractURL
    }, card.AbstractSource))))) : null;
  }

}

class Transcript extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.transcript ? React.createElement("div", {
      id: "transcript"
    }, this.props.transcript) : null;
  }

}

class TextDisplay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.displayText ? React.createElement("div", {
      id: "text-display"
    }, this.props.displayText) : null;
  }

}

class Zap extends Component {
  constructor(props) {
    super(props);
    this.animation = null;
    this.animationSegmentTimes = {
      reveal: [0, 14],
      base: [14, 30],
      low: [30, 46],
      medium: [46, 62],
      high: [62, 78],
      processing: [78, 134],
      error: [134, 153],
      success: [184, 203]
    };
    this.animationConfig = {
      listening: {
        segments: [this.animationSegmentTimes.reveal, this.animationSegmentTimes.base],
        loop: true,
        interrupt: true
      },
      processing: {
        segments: [this.animationSegmentTimes.processing],
        loop: false,
        interrupt: false
      },
      success: {
        segments: [this.animationSegmentTimes.success],
        loop: false,
        interrupt: false
      },
      error: {
        segments: [this.animationSegmentTimes.error],
        loop: false,
        interrupt: false
      }
    };
    this.currentConfig = this.animationConfig[this.props.currentState];
  }

  componentDidMount() {
    this.loadAnimation();
  }

  componentDidUpdate() {
    this.currentConfig = this.animationConfig[this.props.currentState];

    if (this.currentConfig) {
      if (this.props.currentState === "processing") {
        recorderIntervalId = setInterval(() => {
          const volumeLevel = recorder.getVolumeLevel();
          this.setAnimationForVolume(volumeLevel);
        }, 500);
      } else {
        this.playAnimation(this.currentConfig.segments, this.currentConfig.interrupt, this.currentConfig.loop);
      }
    }
  }

  async loadAnimation() {
    this.animation = await lottie.loadAnimation({
      container: document.getElementById("zap"),
      // the dom element that will contain the animation
      loop: FAST_PERMISSION_CLOSE,
      renderer: "svg",
      autoplay: false,
      path: "animations/Firefox_Voice_Full.json" // the path to the animation json

    });
  }

  playAnimation(segments, interrupt, loop) {
    if (this.animation) {
      this.animation.loop = loop;
      this.animation.playSegments(segments, interrupt);
    }
  }

  setAnimationForVolume(avgVolume) {
    this.animation.onLoopComplete = () => {
      if (avgVolume < 0.1) {
        this.playAnimation(this.animationSegmentTimes.base, true, true);
      } else if (avgVolume < 0.15) {
        this.playAnimation(this.animationSegmentTimes.low, true, true);
      } else if (avgVolume < 0.2) {
        this.playAnimation(this.animationSegmentTimes.medium, true, true);
      } else {
        this.playAnimation(this.animationSegmentTimes.high, true, true);
      }
    };
  }

  render() {
    return this.props.currentState !== "typing" && this.props.currentState !== "searchResults" ? React.createElement("div", {
      id: "zap-wrapper"
    }, React.createElement("div", {
      id: "zap"
    })) : null;
  }

}

const popupContainer = document.getElementById("popup-container");
ReactDOM.render(React.createElement(PopupReact, null), popupContainer);

function setMinPopupSize(width, height) {
  popupContainer.style.minWidth = width + "px";
  popupContainer.style.minHeight = parseInt(height) + 150 + "px";
}

function closePopup(ms) {
  if (ms === null || ms === undefined) {
    ms = overrideTimeout ? overrideTimeout : DEFAULT_TIMEOUT;
  }

  setTimeout(() => {
    window.close();
  }, ms);
}