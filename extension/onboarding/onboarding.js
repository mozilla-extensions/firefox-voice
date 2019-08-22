this.onboarding = (function() {
  async function launchPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      displaySection("#success");
      // TODO change the following into CSS "success" class declarations?
      document.querySelector("#usage-instructions").style.display = "block";
      document.querySelector("#welcome").style.paddingTop = "0rem";
      document.querySelector("#instruction-wrapper").style.flexDirection =
        "column";
      // Set hotkey suggestion based on navigator
      document.querySelector("#action-key").textContent =
        navigator.platform === "MacIntel" ? "Option ⌥" : "Alt";
    } catch (e) {
      if (e.name === "NotAllowedError") {
        displaySection("#must-allow");
      } else {
        displaySection("#generic-error");
        document.querySelector("#error-message").textContent =
          String(e) || "Unknown error";
      }
    }
  }

  function displaySection(selector) {
    for (const el of document.querySelectorAll(
      `.instruction:not(${selector})`
    )) {
      el.style.display = "none";
    }
    for (const el of document.querySelectorAll(selector)) {
      el.style.display = "";
    }
  }

  function setBackground() {
    // FIX: Don't understand why querySelectorAll works, yet querySelector does not.
    for (const el of document.querySelectorAll("#welcome-text-content")) {
      el.style.backgroundImage = `url("${browser.extension.getURL(
        "/onboarding/images/supergraphic-large.svg"
      )}")`;
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
    setBackground();
  }

  init();
})();
