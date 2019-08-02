this.onboarding = (function() {

  async function launchPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({audio: true});
      displaySection("#success");
    } catch (e) {
      if (e.name === "NotAllowedError") {
        displaySection("#must-allow");
      } else {
        displaySection("#generic-error");
        document.querySelector("#error-message").textContent = String(e) || "Unknown error";
      }
    }
  }

  function displaySection(selector) {
    for (const el of document.querySelectorAll(`.instruction:not(${selector})`)) {
      el.style.display = "none";
    }
    for (const el of document.querySelectorAll(selector)) {
      el.style.display = "";
    }
  }

  function init() {
    displaySection("#getting-started");
    for (const el of document.querySelectorAll(".reload")) {
      el.addEventListener("click", () => location.reload());
    }
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
})();
