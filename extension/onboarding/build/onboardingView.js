/* eslint-disable no-unused-vars */

/* globals React */
import * as browserUtil from "../browserUtil.js";
export const Onboarding = ({
  optinViewAlreadyShown,
  setOptinValue,
  setOptinViewShown,
  permissionError
}) => {
  return /*#__PURE__*/React.createElement("div", {
    id: "onboarding-wrapper"
  }, !optinViewAlreadyShown && /*#__PURE__*/React.createElement(OptinVoiceTranscripts, {
    setOptinValue: setOptinValue,
    setOptinViewShown: setOptinViewShown
  }), optinViewAlreadyShown && permissionError && /*#__PURE__*/React.createElement(PermissionError, {
    permissionError: permissionError
  }), optinViewAlreadyShown && !permissionError && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(OnboardingPageContent, null), /*#__PURE__*/React.createElement(Footer, null)));
};

const OptinVoiceTranscripts = ({
  setOptinValue,
  setOptinViewShown
}) => {
  const updateVoiceTranscriptOptin = event => {
    event.preventDefault();
    setOptinValue(!!event.target.value);
    setOptinViewShown(true);
  };

  return /*#__PURE__*/React.createElement("div", {
    id: "optinVoiceTranscripts",
    className: "modal-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("p", null, "Successfully Installed"), /*#__PURE__*/React.createElement("h1", null, "Allow Firefox Voice to Collect Voice Transcripts")), /*#__PURE__*/React.createElement("div", {
    className: "modal-content"
  }, /*#__PURE__*/React.createElement("p", null, "For research purposes and in order to improve Firefox Voice and related services, Mozilla would like to collect and analyze voice transcripts. We store this data securely and without personally identifying information. Can Firefox Voice store transcripts of your voice recordings for research?"), /*#__PURE__*/React.createElement("p", null, "You\u2019ll always be able to use Firefox Voice, even if you don\u2019t allow collection. The microphone is only active when triggered with a button press or keyboard shortcut."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
    href: "/views/privacy-policy.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "Learn how Mozilla protects your voice data."))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "styled-button",
    onClick: updateVoiceTranscriptOptin,
    value: true
  }, "Allow"), /*#__PURE__*/React.createElement("button", {
    className: "styled-button cancel-button",
    onClick: updateVoiceTranscriptOptin
  }, "Don't Allow"))));
};

const OnboardingPageContent = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "onboarding-content"
  }, /*#__PURE__*/React.createElement("div", {
    id: "toolbar-arrow-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    id: "toolbar-arrow"
  })), /*#__PURE__*/React.createElement("div", {
    id: "onboarding-logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "/assets/images/firefox-voice-logo.svg",
    alt: "Firefox Voice Logo"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(GetStartedSection, null), /*#__PURE__*/React.createElement(TryItSection, null)));
};

const GetStartedSection = () => {
  const keyboardShortcut = navigator.platform === "MacIntel" ? "Command ⌘" : "Ctrl";
  return /*#__PURE__*/React.createElement("div", {
    id: "get-started",
    className: "onboarding-section"
  }, /*#__PURE__*/React.createElement("h1", null, "Get Started"), /*#__PURE__*/React.createElement("p", null, "Click the mic in the toolbar above."), /*#__PURE__*/React.createElement("p", null, "Or, try the keyboard shortcut."), /*#__PURE__*/React.createElement("p", {
    id: "keyboard-shortcut"
  }, /*#__PURE__*/React.createElement("span", {
    id: "device-shortcut"
  }, keyboardShortcut), "+", /*#__PURE__*/React.createElement("span", null, ".")));
};

const TryItSection = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "try-it",
    className: "onboarding-section"
  }, /*#__PURE__*/React.createElement("h1", null, "Try Your New Super Power"), /*#__PURE__*/React.createElement("p", null, "Say things like"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Go to New York Times"), /*#__PURE__*/React.createElement("li", null, "Read the article on this page"), /*#__PURE__*/React.createElement("li", null, "Show movie times at the closest theater"), /*#__PURE__*/React.createElement("li", null, "Find my calendar tab"), /*#__PURE__*/React.createElement("li", null, "Shop for dog beds on Amazon")));
};

const PermissionError = ({
  permissionError
}) => {
  if (!permissionError) {
    return null;
  }

  const errorView = permissionError => {
    if (permissionError === "Waiting") {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
        className: "waiting"
      }, "Waiting for Microphone Permissions"), /*#__PURE__*/React.createElement("p", null, "Firefox Voice needs permission to access the microphone in order to hear your requests"));
    } else if (permissionError === "NotAllowedError") {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "Can't Access Microphone"), /*#__PURE__*/React.createElement("p", null, "Firefox Voice needs permission to access the microphone in order to hear your requests."), /*#__PURE__*/React.createElement(AllowMicrophoneInstructions, null));
    } else if (permissionError === "NotFoundError") {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "Microphone Not Found"), /*#__PURE__*/React.createElement("p", null, "Confirm your microphone is on, plugged in, and it works in other applications."), /*#__PURE__*/React.createElement(AllowMicrophoneInstructions, null));
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "Can't Access Microphone"), /*#__PURE__*/React.createElement("p", null, String(permissionError) || "Unknown error"));
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal error-modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content"
  }, errorView(permissionError))));
};

const AllowMicrophoneInstructions = () => {
  const reloadPage = () => {
    window.location.reload(false);
  };

  return /*#__PURE__*/React.createElement("div", {
    id: "must-allow"
  }, /*#__PURE__*/React.createElement("p", null, "First click on", /*#__PURE__*/React.createElement("img", {
    alt: "Example: Extension (Firefox Voice)",
    src: "./images/security-button.png",
    className: "security-button"
  }), "in the URL bar."), /*#__PURE__*/React.createElement("p", null, "Next remove the permission denial:"), /*#__PURE__*/React.createElement("img", {
    alt: "Example: Permissions: use the microphone",
    src: "./images/security-panel.png",
    className: "security-panel"
  }), /*#__PURE__*/React.createElement("p", null, "After that"), /*#__PURE__*/React.createElement("button", {
    className: "styled-button",
    onClick: reloadPage
  }, "Reload the page"));
};

const Footer = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "footer"
  }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mozilla/firefox-voice",
    target: "_blank",
    rel: "noopener"
  }, "GitHub")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://firefox-voice-feedback.herokuapp.com/",
    target: "_blank"
  }, "Feedback")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "/views/privacy-policy.html",
    target: "_blank",
    rel: "noopener",
    onClick: browserUtil.activateTabClickHandler
  }, "Privacy Policy")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "/views/lexicon.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "Things you can say"))), /*#__PURE__*/React.createElement("p", null, "Visit Mozilla Corporation\u2019s not-for-profit parent, the", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://foundation.mozilla.org/en/",
    target: "_blank"
  }, "Mozilla Foundation"), "."));
};