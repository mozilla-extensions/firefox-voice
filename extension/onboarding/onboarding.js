this.onboarding = (function() {
  async function launchPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      displaySection("#success");
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

  function init() {
    displaySection("#getting-started");
    for (const el of document.querySelectorAll(".reload")) {
      el.addEventListener("click", () => location.reload());
    }
    if (location.pathname.endsWith("onboard.html")) {
      launchPermission();
    }
  }

  init();
})();
