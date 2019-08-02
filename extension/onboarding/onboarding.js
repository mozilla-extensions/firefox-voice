this.onboarding = (function() {
  const exports = {};

  exports.startOnboarding = async function startOnboarding() {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html"),
    });
  };

  async function launchPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({audio: true});
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
    document.querySelector("#error-message").textContent = error || "Unknown error";
  }

  function displaySuccess() {
    document.querySelector("#success").style.display = "";
  }

  function init() {
    if (location.pathname.endsWith("onboard.html")) {
      launchPermission();
    }
  }

  init();

  return exports;
})();
