/* eslint-disable no-unused-vars */

/* globals React */
import * as browserUtil from "../browserUtil.js";
export const Onboarding = ({
  optinViewAlreadyShown,
  setOptinValue,
  setOptinViewShown,
  permissionError
}) => {
  return React.createElement("div", {
    id: "onboarding-wrapper"
  }, !optinViewAlreadyShown && React.createElement(OptinVoiceTranscripts, {
    setOptinValue: setOptinValue,
    setOptinViewShown: setOptinViewShown
  }), optinViewAlreadyShown && permissionError && React.createElement(PermissionError, {
    permissionError: permissionError
  }), optinViewAlreadyShown && !permissionError && React.createElement(React.Fragment, null, React.createElement(OnboardingPageContent, null), React.createElement(Footer, null)));
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

  return React.createElement("div", {
    id: "optinVoiceTranscripts",
    className: "modal-wrapper"
  }, React.createElement("div", {
    className: "modal"
  }, React.createElement("div", {
    className: "modal-header"
  }, React.createElement("p", null, "Successfully Installed"), React.createElement("h1", null, "Allow Firefox Voice to Collect Voice Transcripts")), React.createElement("div", {
    className: "modal-content"
  }, React.createElement("p", null, "For research purposes and in order to improve Firefox Voice and related services, Mozilla would like to collect and analyze voice transcripts. We store this data securely and without personally identifying information. Can Firefox Voice store transcripts of your voice recordings for research?"), React.createElement("p", null, "You\u2019ll always be able to use Firefox Voice, even if you don\u2019t allow collection. The microphone is only active when triggered with a button press or keyboard shortcut."), React.createElement("p", null, React.createElement("a", {
    href: "/views/privacy-policy.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "Learn how Mozilla protects your voice data."))), React.createElement("div", {
    className: "modal-footer"
  }, React.createElement("button", {
    className: "styled-button",
    onClick: updateVoiceTranscriptOptin,
    value: true
  }, "Allow"), React.createElement("button", {
    className: "styled-button cancel-button",
    onClick: updateVoiceTranscriptOptin
  }, "Don't Allow"))));
};

const OnboardingPageContent = () => {
  return React.createElement("div", {
    id: "onboarding-content"
  }, React.createElement("div", {
    id: "toolbar-arrow-wrapper"
  }, React.createElement("div", {
    id: "toolbar-arrow"
  })), React.createElement("div", {
    id: "onboarding-logo"
  }, React.createElement("img", {
    src: "/assets/images/firefox-voice-logo.svg",
    alt: "Firefox Voice Logo"
  })), React.createElement("div", null, React.createElement(GetStartedSection, null), React.createElement(TryItSection, null)));
};

const GetStartedSection = () => {
  const keyboardShortcut = navigator.platform === "MacIntel" ? "Command ⌘" : "Ctrl";
  return React.createElement("div", {
    id: "get-started",
    className: "onboarding-section"
  }, React.createElement("h1", null, "Get Started"), React.createElement("p", null, "Click the mic in the toolbar above."), React.createElement("p", null, "Or, try the keyboard shortcut."), React.createElement("p", {
    id: "keyboard-shortcut"
  }, React.createElement("span", {
    id: "device-shortcut"
  }, keyboardShortcut), "+", React.createElement("span", null, ".")));
};

const TryItSection = () => {
  return React.createElement("div", {
    id: "try-it",
    className: "onboarding-section"
  }, React.createElement("h1", null, "Try Your New Super Power"), React.createElement("p", null, "Say things like"), React.createElement("ul", null, React.createElement("li", null, "Go to New York Times"), React.createElement("li", null, "Read the article on this page"), React.createElement("li", null, "Show movie times at the closest theater"), React.createElement("li", null, "Find my calendar tab"), React.createElement("li", null, "Shop for dog beds on Amazon")));
};

const PermissionError = ({
  permissionError
}) => {
  if (!permissionError) {
    return null;
  }

  const errorView = permissionError => {
    if (permissionError === "Waiting") {
      return React.createElement(React.Fragment, null, React.createElement("h1", {
        className: "waiting"
      }, "Waiting for Microphone Permissions"), React.createElement("p", null, "Firefox Voice needs permission to access the microphone in order to hear your requests"));
    } else if (permissionError === "NotAllowedError") {
      return React.createElement(React.Fragment, null, React.createElement("h1", null, "Can't Access Microphone"), React.createElement("p", null, "Firefox Voice needs permission to access the microphone in order to hear your requests."), React.createElement(AllowMicrophoneInstructions, null));
    } else if (permissionError === "NotFoundError") {
      return React.createElement(React.Fragment, null, React.createElement("h1", null, "Microphone Not Found"), React.createElement("p", null, "Confirm your microphone is on, plugged in, and it works in other applications."), React.createElement(AllowMicrophoneInstructions, null));
    }

    return React.createElement(React.Fragment, null, React.createElement("h1", null, "Can't Access Microphone"), React.createElement("p", null, String(permissionError) || "Unknown error"));
  };

  return React.createElement("div", {
    className: "modal-wrapper"
  }, React.createElement("div", {
    className: "modal error-modal"
  }, React.createElement("div", {
    className: "modal-content"
  }, errorView(permissionError))));
};

const AllowMicrophoneInstructions = () => {
  const reloadPage = () => {
    window.location.reload(false);
  };

  return React.createElement("div", {
    id: "must-allow"
  }, React.createElement("p", null, "First click on", React.createElement("img", {
    alt: "Example: Extension (Firefox Voice)",
    src: "./images/security-button.png",
    className: "security-button"
  }), "in the URL bar."), React.createElement("p", null, "Next remove the permission denial:"), React.createElement("img", {
    alt: "Example: Permissions: use the microphone",
    src: "./images/security-panel.png",
    className: "security-panel"
  }), React.createElement("p", null, "After that"), React.createElement("button", {
    className: "styled-button",
    onClick: reloadPage
  }, "Reload the page"));
};

const Footer = () => {
  return React.createElement("div", {
    id: "footer"
  }, React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "https://github.com/mozilla/firefox-voice",
    target: "_blank",
    rel: "noopener"
  }, "GitHub")), React.createElement("li", null, React.createElement("a", {
    href: "https://firefox-voice-feedback.herokuapp.com/",
    target: "_blank"
  }, "Feedback")), React.createElement("li", null, React.createElement("a", {
    href: "/views/privacy-policy.html",
    target: "_blank",
    rel: "noopener",
    onClick: browserUtil.activateTabClickHandler
  }, "Privacy Policy")), React.createElement("li", null, React.createElement("a", {
    href: "/views/lexicon.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "Things you can say"))), React.createElement("p", null, "Visit Mozilla Corporation\u2019s not-for-profit parent, the", " ", React.createElement("a", {
    href: "https://foundation.mozilla.org/en/",
    target: "_blank"
  }, "Mozilla Foundation"), "."));
};