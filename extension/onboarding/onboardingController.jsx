/* globals React, ReactDOM, settings */

this.onboardingController = (function() {
  const exports = {};
  const { useState, useEffect } = React;
  const onboardingContainer = document.getElementById("onboarding-container");
  let isInitialized = false;
  let userSettings;

  exports.OnboardingController = function() {
    const [optinViewAlreadyShown, setOptinViewShown] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    useEffect(() => {
      if (!isInitialized) {
        isInitialized = true;
        init();
      }
    });

    const init = async () => {
      if (location.pathname.endsWith("onboard.html")) {
        launchPermission();
      }
      const result = await settings.getSettingsAndOptions();
      userSettings = result.settings;
    };

    const setOptinValue = async value => {
      // TODO: Is this the right setting to update?
      userSettings.collectAudio = value;
      await settings.saveSettings(userSettings);
    };

    const launchPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // TODO (in view): Set hotkey suggestion based on navigator
        // document.querySelector("#action-key").textContent =
        //     navigator.platform === "MacIntel" ? "Command ⌘" : "Ctrl";
        const tracks = stream.getTracks();
        for (const track of tracks) {
          track.stop();
        }
      } catch (e) {
        if (e.name === "NotAllowedError") {
          setPermissionError("NotAllowedError");
        } else {
          setPermissionError("UnknownError");
        }
      }
    };

    return (
    <onboardingView.Onboarding
        optinViewAlreadyShown={optinViewAlreadyShown}
        setOptinValue={setOptinValue}
        setOptinViewShown={setOptinViewShown}
        permissionError={permissionError}
      />
    );
  };

  ReactDOM.render(<exports.OnboardingController />, onboardingContainer);

  return exports;
})();
