function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* globals lottie, React */

/* eslint-disable no-unused-vars */
// For some reason, eslint is not detecting that <Variable /> means that Variable is used
import * as browserUtil from "../browserUtil.js";
const {
  Component,
  useState,
  useEffect,
  PureComponent
} = React;
export const Popup = ({
  currentView,
  suggestions,
  feedback,
  lastIntent,
  transcript,
  displayText,
  errorMessage,
  displayAutoplay,
  searchResult,
  cardImage,
  recorderVolume,
  showSettings,
  submitTextInput,
  onClickLexicon,
  onSearchImageClick,
  onNextSearchResultClick,
  onInputStarted,
  onSubmitFeedback,
  setMinPopupSize,
  expandListeningView
}) => {
  const [inputValue, setInputValue] = useState(null);

  function savingOnInputStarted(value) {
    // When the user types in the hidden field, we need to keep that
    // first input and use it later
    setInputValue(value);
    onInputStarted();
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "popup",
    className: currentView
  }, /*#__PURE__*/React.createElement(PopupHeader, {
    currentView: currentView,
    transcript: transcript,
    lastIntent: lastIntent
  }), /*#__PURE__*/React.createElement(PopupContent, {
    currentView: currentView,
    suggestions: suggestions,
    feedback: feedback,
    transcript: transcript,
    displayText: displayText,
    errorMessage: errorMessage,
    displayAutoplay: displayAutoplay,
    searchResult: searchResult,
    cardImage: cardImage,
    recorderVolume: recorderVolume,
    submitTextInput: submitTextInput,
    inputValue: inputValue,
    onClickLexicon: onClickLexicon,
    onSearchImageClick: onSearchImageClick,
    onNextSearchResultClick: onNextSearchResultClick,
    onInputStarted: savingOnInputStarted,
    onSubmitFeedback: onSubmitFeedback,
    setMinPopupSize: setMinPopupSize,
    expandListeningView: expandListeningView
  }), /*#__PURE__*/React.createElement(PopupFooter, {
    currentView: currentView,
    showSettings: showSettings
  }));
};

const PopupHeader = ({
  currentView,
  transcript,
  lastIntent
}) => {
  const getTitle = () => {
    switch (currentView) {
      case "processing":
        return "One second...";

      case "success":
        return "Got it!";

      case "error":
        return "Sorry, there was an issue";

      case "typing":
        return "Type your request";

      case "searchResults":
        return transcript;

      case "startSavingPage":
        return "Saving page...";

      case "endSavingPage":
        return "Success";

      case "feedback":
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, lastIntentTime(lastIntent), " ago you said"), /*#__PURE__*/React.createElement("p", {
          className: "utterance"
        }, lastIntent.utterance));

      case "feedbackThanks":
        return "";

      case "waiting":
        return "One moment...";

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

  const hiddenClass = currentView === "error" || currentView === "searchResults" || currentView === "typing" || currentView === "startSavingPage" || currentView === "endSavingPage" || currentView === "feedback" || currentView === "feedbackThanks" ? "" : "hidden";
  return /*#__PURE__*/React.createElement("div", {
    id: "popup-header"
  }, /*#__PURE__*/React.createElement("button", {
    id: "left-icon",
    className: hiddenClass,
    onClick: onClickGoBack
  }, /*#__PURE__*/React.createElement("svg", {
    id: "back-icon",
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    "aria-label": "Back"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "context-fill",
    d: "M6.414 8l4.293-4.293a1 1 0 0 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414z"
  }))), /*#__PURE__*/React.createElement("div", {
    id: "header-title"
  }, getTitle()), /*#__PURE__*/React.createElement("button", {
    id: "close-icon",
    "aria-label": "Close",
    onClick: onClickClose
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "context-fill",
    d: "M9.061 8l3.47-3.47a.75.75 0 0 0-1.061-1.06L8 6.939 4.53 3.47a.75.75 0 1 0-1.06 1.06L6.939 8 3.47 11.47a.75.75 0 1 0 1.06 1.06L8 9.061l3.47 3.47a.75.75 0 0 0 1.06-1.061z"
  }))));
};

const PopupContent = ({
  currentView,
  suggestions,
  feedback,
  transcript,
  displayText,
  errorMessage,
  displayAutoplay,
  searchResult,
  cardImage,
  recorderVolume,
  submitTextInput,
  inputValue,
  onClickLexicon,
  onSearchImageClick,
  onNextSearchResultClick,
  onInputStarted,
  onSubmitFeedback,
  setMinPopupSize,
  expandListeningView
}) => {
  const getContent = () => {
    switch (currentView) {
      case "listening":
        return /*#__PURE__*/React.createElement(ListeningContent, {
          displayText: displayText,
          suggestions: suggestions,
          onClickLexicon: onClickLexicon,
          onInputStarted: onInputStarted,
          expandListeningView: expandListeningView
        });

      case "typing":
        return /*#__PURE__*/React.createElement(TypingContent, {
          displayText: displayText,
          submitTextInput: submitTextInput,
          inputValue: inputValue
        });

      case "processing":
        return /*#__PURE__*/React.createElement(ProcessingContent, {
          transcript: transcript,
          displayText: displayText
        });

      case "success":
        return /*#__PURE__*/React.createElement(SuccessContent, {
          transcript: transcript,
          displayText: displayText
        });

      case "error":
        return /*#__PURE__*/React.createElement(ErrorContent, {
          displayText: displayText,
          errorMessage: errorMessage,
          displayAutoplay: displayAutoplay
        });

      case "searchResults":
        return /*#__PURE__*/React.createElement(SearchResultsContent, {
          search: searchResult,
          cardImage: cardImage,
          displayText: displayText,
          onSearchImageClick: onSearchImageClick,
          onNextSearchResultClick: onNextSearchResultClick,
          setMinPopupSize: setMinPopupSize,
          onSubmitFeedback: onSubmitFeedback
        });

      case "startSavingPage":
        return /*#__PURE__*/React.createElement(SavingPageContent, {
          transcript: transcript
        });

      case "endSavingPage":
        return /*#__PURE__*/React.createElement(SuccessContent, {
          transcript: transcript,
          displayText: displayText
        });

      case "feedback":
        return /*#__PURE__*/React.createElement(Feedback, {
          feedback: feedback,
          onSubmitFeedback: onSubmitFeedback
        });

      case "feedbackThanks":
        return /*#__PURE__*/React.createElement(FeedbackThanks, null);

      default:
        return null;
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    id: "popup-content"
  }, /*#__PURE__*/React.createElement(Zap, {
    currentView: currentView,
    recorderVolume: recorderVolume
  }), getContent());
};

const Feedback = ({
  feedback,
  onSubmitFeedback
}) => {
  const textarea = React.createRef();

  function onSubmit() {
    const text = textarea.current.value;
    onSubmitFeedback({
      rating: feedback.rating,
      feedback: text
    });
  }

  useEffect(() => {
    textarea.current.focus();
  });

  function onInputKeyPress(event) {
    if (event.key === "Enter") {
      onSubmit();
    }
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "feedback-whats-wrong"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sad-icon"
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: onSubmit,
    className: "feedback-form"
  }, /*#__PURE__*/React.createElement("h1", null, "What went wrong?"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", {
    className: "styled-textarea",
    ref: textarea,
    autofocus: "1",
    onKeyPress: onInputKeyPress
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "styled-green-button"
  }, "Submit"))));
};

const FeedbackThanks = () => {
  return /*#__PURE__*/React.createElement("div", {
    className: "feedback-thanks"
  }, /*#__PURE__*/React.createElement("h2", null, "Thanks for your feedback"));
};

const PopupFooter = ({
  currentView,
  showSettings
}) => {
  if (currentView === "searchResults" || currentView === "feedback" || currentView === "feedbackThanks") return null;
  return /*#__PURE__*/React.createElement("div", {
    id: "popup-footer"
  }, /*#__PURE__*/React.createElement("button", {
    id: "settings-icon",
    "aria-label": "Settings",
    onClick: showSettings
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "context-fill",
    d: "M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"
  }))), /*#__PURE__*/React.createElement("div", {
    id: "moz-voice-privacy"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://firefox-voice-feedback.herokuapp.com/",
    target: "_blank",
    rel: "noopener"
  }, "Feedback?")), /*#__PURE__*/React.createElement("div", null));
};

const ListeningContent = ({
  displayText,
  suggestions,
  onClickLexicon,
  onInputStarted,
  expandListeningView
}) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }), /*#__PURE__*/React.createElement("div", {
    id: "extra-content",
    className: expandListeningView ? "expanded" : ""
  }, /*#__PURE__*/React.createElement(VoiceInput, {
    suggestions: suggestions,
    onClickLexicon: onClickLexicon
  }), /*#__PURE__*/React.createElement(TypingInput, {
    onInputStarted: onInputStarted
  })));
};

const TypingContent = ({
  displayText,
  submitTextInput,
  inputValue
}) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }), /*#__PURE__*/React.createElement(TypingInput, {
    submitTextInput: submitTextInput,
    inputValue: inputValue
  }));
};

const VoiceInput = ({
  suggestions,
  onClickLexicon
}) => {
  const onMoreSuggestions = event => {
    if (event) {
      event.preventDefault();
      onClickLexicon(event);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    id: "voice-input"
  }, suggestions ? /*#__PURE__*/React.createElement("div", {
    id: "suggestions"
  }, /*#__PURE__*/React.createElement("p", {
    id: "prompt"
  }, "You can say things like:"), /*#__PURE__*/React.createElement("div", {
    id: "suggestions-list"
  }, suggestions.map(suggestion => /*#__PURE__*/React.createElement("p", {
    className: "suggestion",
    key: suggestion
  }, suggestion))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    target: "_blank",
    rel: "noopener",
    id: "lexicon",
    href: "../views/lexicon.html",
    onClick: browserUtil.activateTabClickHandler
  }, "More things you can say"))) : null);
};

const IntentFeedback = ({
  eduText,
  onSubmitFeedback
}) => {
  function onPositive() {
    onSubmitFeedback({
      rating: 1,
      feedback: null
    });
  }

  function onNegative() {
    onSubmitFeedback({
      rating: -1,
      feedback: null
    });
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "intent-feedback"
  }, /*#__PURE__*/React.createElement("div", null, "Did we get this right?"), /*#__PURE__*/React.createElement("div", {
    className: "feedback-controls"
  }, /*#__PURE__*/React.createElement("button", {
    className: "happy-icon",
    "aria-label": "Leave a positive review",
    onClick: onPositive
  }), /*#__PURE__*/React.createElement("button", {
    className: "sad-icon",
    "aria-label": "Leave a negative review",
    onClick: onNegative
  })), eduText ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("em", null, eduText)) : null);
};

const lastIntentTime = lastIntent => {
  let ago;
  const minutesAgo = Math.max(1, Math.round((Date.now() - lastIntent.timestamp) / 60000));

  if (minutesAgo > 60) {
    const hoursAgo = Math.round(minutesAgo / 60);
    const plural = hoursAgo === 1 ? "" : "s";
    ago = `${hoursAgo} hour${plural}`;
  } else {
    const plural = minutesAgo === 1 ? "" : "s";
    ago = `${minutesAgo} min${plural}`;
  }

  return ago;
};

class TypingInput extends PureComponent {
  constructor(props) {
    super(props);

    _defineProperty(this, "focusText", () => {
      if (this.textInputRef.current) {
        setTimeout(() => {
          this.textInputRef.current.focus();
        }, 0);
      }
    });

    _defineProperty(this, "onInputKeyPress", event => {
      if (event.key === "Enter") {
        this.submitTextInput();
      }
    });

    _defineProperty(this, "onInputTextChange", event => {
      this.value = event.target.value;

      if (this.value && this.props.onInputStarted) {
        this.props.onInputStarted(this.value);
      }
    });

    _defineProperty(this, "submitTextInput", async () => {
      const text = this.value;

      if (text) {
        this.props.submitTextInput(text);
      }
    });

    this.textInputRef = React.createRef();
    this.value = this.props.inputValue || null;
  }

  componentDidMount() {
    this.focusText();
    const el = this.textInputRef.current;

    if (el) {
      el.addEventListener("blur", this.focusText);
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      id: "text-input"
    }, /*#__PURE__*/React.createElement("textarea", {
      id: "text-input-field",
      className: "styled-textarea",
      autofocus: "1",
      onKeyPress: this.onInputKeyPress,
      onChange: this.onInputTextChange,
      defaultValue: this.value,
      ref: this.textInputRef
    }), /*#__PURE__*/React.createElement("div", {
      id: "send-btn-wrapper"
    }, /*#__PURE__*/React.createElement("button", {
      className: "styled-green-button",
      onClick: this.submitTextInput
    }, "GO")));
  }

}

const ProcessingContent = ({
  transcript,
  displayText
}) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Transcript, {
    transcript: transcript
  }), /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }));
};

const SuccessContent = ({
  transcript,
  displayText
}) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Transcript, {
    transcript: transcript
  }), /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }));
};

const ErrorContent = ({
  displayText,
  errorMessage,
  displayAutoplay
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }), errorMessage ? /*#__PURE__*/React.createElement("div", {
    id: "error-message"
  }, errorMessage) : null, displayAutoplay ? /*#__PURE__*/React.createElement("div", {
    id: "error-autoplay"
  }, /*#__PURE__*/React.createElement("img", {
    src: "images/autoplay-instruction.png",
    alt: "To enable autoplay, open the site preferences and select Allow Audio and Video"
  })) : null);
};

const SavingPageContent = ({
  transcript
}) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Transcript, {
    transcript: transcript
  }));
};

const SearchResultsContent = ({
  search,
  cardImage,
  displayText,
  onSearchImageClick,
  onNextSearchResultClick,
  setMinPopupSize,
  onSubmitFeedback
}) => {
  if (!search) return null;
  const {
    searchResults,
    index,
    searchUrl
  } = search;
  const card = cardImage;
  const next = searchResults[index + 1];
  const cardStyles = card ? {
    height: card.height,
    width: card.width
  } : {};
  const imgAlt = card && card.alt ? `Click to show search results: ${card.alt}` : "Show search results";

  if (card) {
    setMinPopupSize(card.width);
  }

  const onSearchCardClick = () => {
    onSearchImageClick(searchUrl);
  };

  const onNextResultClick = event => {
    event.preventDefault();
    onNextSearchResultClick();
  };

  const SearchCard = () => /*#__PURE__*/React.createElement("button", {
    class: "invisible-button",
    onClick: onSearchCardClick
  }, /*#__PURE__*/React.createElement("img", {
    id: "search-image",
    alt: imgAlt,
    style: cardStyles,
    src: card.src
  }));

  const AnswerCard = () => /*#__PURE__*/React.createElement("div", {
    className: "results-set"
  }, card.answer.imgSrc ? /*#__PURE__*/React.createElement("img", {
    className: "results-image",
    src: card.answer.imgSrc,
    alt: card.answer.alt
  }) : null, /*#__PURE__*/React.createElement("div", {
    className: "results-text"
  }, /*#__PURE__*/React.createElement("em", null, card.answer.largeText ? /*#__PURE__*/React.createElement("div", {
    className: "results-largeText"
  }, card.answer.largeText) : null, /*#__PURE__*/React.createElement("div", null, card.answer.text))));

  const renderCard = () => {
    if (card && card.answer) {
      return AnswerCard();
    } else if (card) {
      return SearchCard();
    }

    return null;
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextDisplay, {
    displayText: displayText
  }), /*#__PURE__*/React.createElement("div", {
    id: "search-results"
  }, renderCard()), /*#__PURE__*/React.createElement("div", {
    id: "search-footer"
  }, /*#__PURE__*/React.createElement(IntentFeedback, {
    onSubmitFeedback: onSubmitFeedback,
    eduText: card && card.answer ? card.answer.eduText : null
  }), next ? /*#__PURE__*/React.createElement("div", {
    id: "next-result"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Click mic and say ", /*#__PURE__*/React.createElement("i", null, "'next'"), " to view")), /*#__PURE__*/React.createElement("a", {
    href: next.url,
    id: "search-show-next",
    onClick: onNextResultClick
  }, new URL(next.url).hostname, " | ", next.title)) : null));
};

const Transcript = ({
  transcript
}) => {
  return transcript ? /*#__PURE__*/React.createElement("div", {
    id: "transcript"
  }, transcript) : null;
};

const TextDisplay = ({
  displayText
}) => {
  return displayText ? /*#__PURE__*/React.createElement("div", {
    id: "text-display"
  }, displayText) : null;
};

class Zap extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "loadAnimation", async () => {
      this.animation = await lottie.loadAnimation({
        container: document.getElementById("zap"),
        // the dom element that will contain the animation
        loop: false,
        renderer: "svg",
        autoplay: false,
        path: "animations/Firefox_Voice_Full.json" // the path to the animation json

      });
    });

    _defineProperty(this, "playAnimation", (segments, interrupt, loop) => {
      if (this.animation) {
        this.animation.loop = loop;
        this.animation.playSegments(segments, interrupt);
      }
    });

    _defineProperty(this, "setAnimationForVolume", avgVolume => {
      // this.animation.onLoopComplete = function() {
      if (avgVolume < 0.1) {
        this.playAnimation(this.animationSegmentTimes.base, true, true);
      } else if (avgVolume < 0.3) {
        this.playAnimation(this.animationSegmentTimes.low, true, true);
      } else if (avgVolume < 0.4) {
        this.playAnimation(this.animationSegmentTimes.medium, true, true);
      } else {
        this.playAnimation(this.animationSegmentTimes.high, true, true);
      } // };

    });

    this.animation = null;
    this.animationSegmentTimes = {
      reveal: [0, 14],
      base: [14, 30],
      low: [30, 46],
      medium: [46, 62],
      high: [62, 78],
      processing: [78, 134],
      waiting: [88, 122],
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
        interrupt: true
      },
      waiting: {
        segments: [this.animationSegmentTimes.waiting],
        loop: true,
        interrupt: true
      },
      success: {
        segments: [this.animationSegmentTimes.success],
        loop: false,
        interrupt: true
      },
      error: {
        segments: [this.animationSegmentTimes.error],
        loop: false,
        interrupt: true
      },
      startSavingPage: {
        segments: [this.animationSegmentTimes.waiting],
        loop: false,
        interrupt: true
      },
      feedbackThanks: {
        segments: [this.animationSegmentTimes.success],
        loop: false,
        interrupt: true
      }
    };
  }

  componentDidMount() {
    this.loadAnimation();
  }

  componentDidUpdate() {
    const config = this.animationConfig[this.props.currentView] || this.animationConfig.success;

    if (config) {
      this.playAnimation(config.segments, config.interrupt, config.loop);

      if (this.props.currentView === "listening" && this.props.recorderVolume) {
        this.setAnimationForVolume(this.props.recorderVolume);
      }
    }
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      id: "zap-wrapper"
    }, /*#__PURE__*/React.createElement("div", {
      id: "zap"
    }));
  }

}