this.onboarding = (function() {
  const exports = {};

  exports.startOnboarding = async function startOnboarding() {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html"),
    });
  };

  async function launchPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      displaySuccess();
    } catch (e) {
      if (e.name === "NotAllowedError") {
        displayMustAllow();
      } else {
        displayGenericError(String(e));
      }
    }
  }

  function displayMustAllow() {
    document.querySelector("#must-allow").style.display = "";
  }

  function displayGenericError(error) {
    document.querySelector("#generic-error").style.display = "";
    document.querySelector("#error-message").textContent =
      error || "Unknown error";
  }

  function displaySuccess() {
    document.querySelector("#success").style.display = "";
  }

  function init() {
    if (location.pathname.endsWith("onboard.html")) {
      launchPermission();
    }

    // Set hotkey suggestion based on navigator
    document.querySelector("#action-key").textContent =
      navigator.platform === "MacIntel" ? "Option ⌥" : "Alt";
    document.querySelector(
      "#welcome-text-content"
    ).style.backgroundImage = `url("${browser.extension.getURL(
      "/assets/images/onboarding/supergraphic-large.svg"
    )}")`;
    document.querySelector(
      "#toolbar-large"
    ).src = browser.extension.getURL(
      "/assets/images/onboarding/toolbar-arrow-2.png"
    );
    document.querySelector(
      "#toolbar-small"
    ).src = browser.extension.getURL(
      "/assets/images/onboarding/toolbar-arrow-3.png"
    );
    document.querySelector(
      "#zap-onboarding"
    ).src = browser.extension.getURL(
      "/assets/images/onboarding/zap.svg"
    );
  }

  init();

  return exports;
})();
