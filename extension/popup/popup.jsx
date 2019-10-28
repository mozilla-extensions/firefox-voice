/* globals React, ReactDOM, util, voice, vad, lottie, settings, log, voiceShim, buildSettings */

const { Component, PureComponent } = React;
const { backgroundTabRecorder } = buildSettings;

const PERMISSION_REQUEST_TIME = 2000;
const FAST_PERMISSION_CLOSE = 500;
let stream;
let isWaitingForPermission = null;
let executedIntent = false;

// Default amount of time (in milliseconds) before the action is automatically dismissed after we perform certain actions (e.g. successfully switching to a different open tab). This value should give users enough time to read the content on the popup before it closes.
const DEFAULT_TIMEOUT = 2500;
// Timeout for the popup when there's text displaying:
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
};

class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = { ...initialState };
    this.textInputDetected = false;
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPressed);
    this.init();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed);

    browser.runtime.sendMessage({ type: "microphoneStopped" });
    if (!executedIntent) {
      browser.runtime.sendMessage({ type: "cancelledIntent" });
    }
    if (
      !backgroundTabRecorder &&
      isWaitingForPermission &&
      Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE
    ) {
      this.startOnboarding();
    }

    // TODO: offload mic and other resources before closing?
  }

  init = async () => {
    backgroundTabRecorder
      ? await voiceShim.openRecordingTab()
      : await this.setupStream();

    this.startRecorder();
    // Listen for messages from the background scripts
    browser.runtime.onMessage.addListener(this.handleMessage);
    this.updateExamples();
  };

  onKeyPressed = () => {
    if (!this.textInputDetected) {
      this.textInputDetected = true;
      this.setCurrentState("typing");
      this.onStartTextInput();
    }
  };

  onStartTextInput = async () => {
    await browser.runtime.sendMessage({ type: "microphoneStopped" });
    log.debug("detected text from the popup");
    recorder.cancel(); // not sure if this is working as expected?
    clearInterval(recorderIntervalId);
  };

  setupStream = async () => {
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
  };

  requestMicrophone = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  };

  startMicrophone = async () => {
    const sleeper = util.sleep(PERMISSION_REQUEST_TIME).then(() => {
      const exc = new Error("Permission Timed Out");
      exc.name = "TimeoutError";
      throw exc;
    });
    await Promise.race([this.requestMicrophone(), sleeper]);
  };

  startOnboarding = async () => {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html"),
    });
  };

  startRecorder = () => {
    recorder = backgroundTabRecorder
      ? new voiceShim.Recorder()
      : new voice.Recorder(stream);

    recorder.onBeginRecording = () => {
      browser.runtime.sendMessage({ type: "microphoneStarted" });
      this.setCurrentState("listening");
    };
    recorder.onEnd = json => {
      // Probably superfluous, since this is called in onProcessing:
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      clearInterval(recorderIntervalId);
      this.setCurrentState("success");
      if (json === null) {
        // It was cancelled
        return;
      }
      browser.runtime.sendMessage({
        type: "addTelemetry",
        properties: { transcriptionConfidence: json.data[0].confidence },
      });
      this.setTranscript(json.data[0].text);
      executedIntent = true;
      browser.runtime.sendMessage({
        type: "runIntent",
        text: json.data[0].text,
      });
    };
    recorder.onError = error => {
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      log.error("Got recorder error:", String(error), error);
      this.setCurrentState("error");
      // TODO: No error message is shown yet. Show one?
      //this.setState({ error })
      clearInterval(recorderIntervalId);
    };
    recorder.onProcessing = () => {
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      this.setCurrentState("processing");
    };
    recorder.onNoVoice = () => {
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      log.debug("Closing popup because of no voice input");
      window.close();
    };
    recorder.startRecording();
  };

  handleMessage = message => {
    switch (message.type) {
      case "closePopup": {
        closePopup(message.time);
        break;
      }
      case "displayFailure": {
        this.setCurrentState("error");
        if (message.message) {
          this.setState({ error: message.message });
        }
        break;
      }
      case "displayText": {
        this.setState({ displayText: message.message });
        overrideTimeout = TEXT_TIMEOUT;
        break;
      }
      case "displayAutoplayFailure": {
        this.setErrorMessage(
          "Please enable autoplay on this site for a better experience"
        );
        this.setState({ displayAutoplay: true });
        break;
      }
      case "showSearchResults": {
        this.setState({ search: message });
        this.setCurrentState("searchResults");
        return Promise.resolve(true);
      }
      default:
        break;
    }
    return null;
  };

  updateExamples = async () => {
    const suggestions = await browser.runtime.sendMessage({
      type: "getExamples",
      number: 3,
    });

    this.setState({ suggestions });
  };

  setCurrentState = currentState => {
    this.setState({ currentState });
  };

  setTranscript = transcript => {
    this.setState({ transcript });
  };

  render() {
    return (
      <div id="popup" className={this.state.currentState}>
        <PopupHeader currentState={this.state.currentState} />
        <PopupContent
          setCurrentState={this.setCurrentState}
          setTranscript={this.setTranscript}
          {...this.state}
        />
        <PopupFooter />
      </div>
    );
  }
}

const PopupHeader = ({ currentState }) => {
  const getTitle = () => {
    switch (currentState) {
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
  };

  const onClickGoBack = () => {
    location.href = `${location.pathname}?${Date.now()}`;
  };

  const onClickClose = () => {
    window.close();
  };

  const hiddenClass =
    currentState === "error" || currentState === "searchResults"
      ? ""
      : "hidden";

  return (
    <div id="popup-header">
      <div id="left-icon" className={hiddenClass} onClick={onClickGoBack}>
        <svg
          id="back-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            fill="context-fill"
            d="M6.414 8l4.293-4.293a1 1 0 0 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414z"
          ></path>
        </svg>
      </div>
      <div id="header-title">{getTitle()}</div>
      <div id="close-icon" onClick={onClickClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            fill="context-fill"
            d="M9.061 8l3.47-3.47a.75.75 0 0 0-1.061-1.06L8 6.939 4.53 3.47a.75.75 0 1 0-1.06 1.06L6.939 8 3.47 11.47a.75.75 0 1 0 1.06 1.06L8 9.061l3.47 3.47a.75.75 0 0 0 1.06-1.061z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const PopupContent = props => {
  const getContent = () => {
    switch (props.currentState) {
      case "listening":
        return <ListeningContent {...props} />;
      case "typing":
        return <TypingContent {...props} />;
      case "processing":
        return <ProcessingContent {...props} />;
      case "success":
        return <SuccessContent {...props} />;
      case "error":
        return <ErrorContent {...props} />;
      case "searchResults":
        return <SearchResultsContent {...props} />;
      default:
        return null;
    }
  };

  return (
    <div id="popup-content">
      <Zap currentState={props.currentState} />
      {getContent()}
    </div>
  );
};

const PopupFooter = () => {
  const showSettings = async () => {
    await browser.tabs.create({
      url: browser.runtime.getURL("options/options.html"),
    });
    window.close();
  };

  return (
    <div id="popup-footer">
      <div id="settings-icon" onClick={showSettings}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            fill="context-fill"
            d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"
          ></path>
        </svg>
      </div>
      <div id="moz-voice-privacy">
        <strong>For Mozilla internal use only</strong>
        {/* <a href="">How Mozilla ensures voice privacy</a> */}
      </div>
      <div></div>
    </div>
  );
};

class ListeningContent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      userSettings: null,
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

  getUserSettings = async () => {
    this.setState({ userSettings: await settings.getSettings() });
  };

  playListeningChime = () => {
    const audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg");
    audio.play();
  };

  render() {
    return (
      <React.Fragment>
        <TextDisplay displayText={this.props.displayText} />
        <VoiceInput {...this.props} />
      </React.Fragment>
    );
  }
}

const TypingContent = props => {
  return (
    <React.Fragment>
      <TextDisplay displayText={props.displayText} />
      <TypingInput {...props} />
    </React.Fragment>
  );
};

class VoiceInput extends PureComponent {
  constructor(props) {
    super(props);
  }

  onClickLexicon = async event => {
    event.preventDefault();
    await browser.tabs.create({ url: event.target.href });
    window.close();
  };

  render() {
    return (
      <div id="voice-input">
        {this.props.suggestions ? (
          <div id="suggestions">
            <p id="prompt">You can say things like:</p>
            <div id="suggestions-list">
              {this.props.suggestions.map(suggestion => (
                <p className="suggestion" key={suggestion}>
                  {suggestion}
                </p>
              ))}
            </div>
            <div>
              <a
                target="_blank"
                rel="noopener"
                id="lexicon"
                href="../views/lexicon.html"
                onClick={this.onClickLexicon}
              >
                More things you can say
              </a>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

class TypingInput extends PureComponent {
  constructor(props) {
    super(props);

    this.textInputRef = React.createRef();
  }

  componentDidMount() {
    this.focusText();
  }

  focusText = () => {
    if (this.textInputRef.current) {
      setTimeout(() => {
        this.textInputRef.current.focus();
      }, 0);
    }
  };

  onInputKeyPress = event => {
    if (event.key === "Enter") {
      this.submitTextInput();
    }
  };

  onInputTextChange = () => {
    this.setState({ value: event.target.value });
  };

  submitTextInput = async () => {
    const text = this.state.value;

    if (text) {
      await browser.runtime.sendMessage({ type: "microphoneStopped" });
      this.props.setCurrentState("success");
      this.props.setTranscript(text);
      executedIntent = true;
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

  render() {
    return (
      <div id="text-input">
        <input
          type="text"
          id="text-input-field"
          autoFocus="1"
          onKeyPress={this.onInputKeyPress}
          onChange={this.onInputTextChange}
        />
        <div id="send-btn-wrapper">
          <button id="send-text-input" onClick={this.submitTextInput}>
            GO
          </button>
        </div>
      </div>
    );
  }
}

const ProcessingContent = (SuccessContent = ({ transcript, displayText }) => {
  return (
    <React.Fragment>
      <Transcript transcript={transcript} />
      <TextDisplay displayText={displayText} />
    </React.Fragment>
  );
});

const ErrorContent = ({ displayText, error, displayAutoplay }) => {
  return (
    <div>
      <TextDisplay displayText={displayText} />
      <div id="error-message">{error}</div>
      {displayAutoplay ? (
        <div id="error-autoplay">
          <img
            src="images/autoplay-instruction.png"
            alt="To enable autoplay, open the site preferences and select Allow Audio and Video"
          />
        </div>
      ) : null}
    </div>
  );
};

const SearchResultsContent = props => {
  if (!props.search) return null;

  const { card, searchResults, index, searchUrl } = props.search;
  const next = searchResults[index + 1];
  const cardStyles = card ? { height: card.height, width: card.width } : {};
  const imgAlt = next ? next.title : "";

  if (card) setMinPopupSize(card.width, card.height);

  const onSearchImageClick = async () => {
    await browser.runtime.sendMessage({
      type: "focusSearchResults",
      searchUrl: searchUrl,
    });
  };

  return (
    <React.Fragment>
      <TextDisplay displayText={props.displayText} />
      <div id="search-results">
        {/* FIXME: img alt is using "next" title, but it should use the card title, which is not available in the data  */}
        {card ? (
          <img
            id="search-image"
            alt={imgAlt}
            onClick={this.onSearchImageClick}
            style={cardStyles}
            src={card.src}
          />
        ) : null}
        {next ? (
          <div id="search-show-next">
            Say <strong>next result</strong> to view: <br />
            <strong id="search-show-next-title">{next.title}</strong>
            <span id="search-show-next-domain">
              {new URL(next.url).hostname}
            </span>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
};

const Transcript = ({ transcript }) => {
  return transcript ? <div id="transcript">{transcript}</div> : null;
};

const TextDisplay = ({ displayText }) => {
  return displayText ? <div id="text-display">{displayText}</div> : null;
};

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
      success: [184, 203],
    };

    this.animationConfig = {
      listening: {
        segments: [
          this.animationSegmentTimes.reveal,
          this.animationSegmentTimes.base,
        ],
        loop: true,
        interrupt: true,
      },
      processing: {
        segments: [this.animationSegmentTimes.processing],
        loop: false,
        interrupt: false,
      },
      success: {
        segments: [this.animationSegmentTimes.success],
        loop: false,
        interrupt: false,
      },
      error: {
        segments: [this.animationSegmentTimes.error],
        loop: false,
        interrupt: false,
      },
    };

    this.currentConfig = this.animationConfig[this.props.currentState];
  }

  componentDidMount() {
    this.loadAnimation();
  }

  componentDidUpdate() {
    this.currentConfig = this.animationConfig[this.props.currentState];

    if (this.currentConfig) {
      this.playAnimation(
        this.currentConfig.segments,
        this.currentConfig.interrupt,
        this.currentConfig.loop
      );

      if (this.props.currentState === "listening") {
        recorderIntervalId = setInterval(() => {
          const volumeLevel = recorder.getVolumeLevel();
          this.setAnimationForVolume(volumeLevel);
        }, 500);
      }
    }
  }

  loadAnimation = async () => {
    this.animation = await lottie.loadAnimation({
      container: document.getElementById("zap"), // the dom element that will contain the animation
      loop: false,
      renderer: "svg",
      autoplay: false,
      path: "animations/Firefox_Voice_Full.json", // the path to the animation json
    });
  };

  playAnimation = (segments, interrupt, loop) => {
    if (this.animation) {
      this.animation.loop = loop;
      this.animation.playSegments(segments, interrupt);
    }
  };

  setAnimationForVolume = avgVolume => {
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
  };

  render() {
    return this.props.currentState !== "typing" &&
      this.props.currentState !== "searchResults" ? (
      <div id="zap-wrapper">
        <div id="zap"></div>
      </div>
    ) : null;
  }
}

const popupContainer = document.getElementById("popup-container");

const setMinPopupSize = (width, height) => {
  popupContainer.style.minWidth = width + "px";
  popupContainer.style.minHeight = parseInt(height) + 150 + "px";
};

const closePopup = ms => {
  if (ms === null || ms === undefined) {
    ms = overrideTimeout ? overrideTimeout : DEFAULT_TIMEOUT;
  }

  setTimeout(() => {
    window.close();
  }, ms);
};

ReactDOM.render(<Popup />, popupContainer);
