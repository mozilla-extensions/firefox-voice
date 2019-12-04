/* globals React, ReactDOM, settings */

this.onboardingController = (function() {
  const exports = {};
  const { useState, useEffect } = React;
  const onboardingContainer = document.getElementById("onboarding-container");
  let isInitialized = false;
  let userSettings;

  exports.OnboardingController = function() {
    const [optinViewAlreadyShown, setOptinViewShown] = useState(true);
    const [permissionError, setPermissionError] = useState(null);

    useEffect(() => {
      if (!isInitialized) {
        isInitialized = true;
        init();
      }
    });

    const init = async () => {
      userSettings = await settings.getSettings();
      setOptinViewShown(userSettings.collectTranscriptsOptinShown);

      if (optinViewAlreadyShown) {
        launchPermission();
      }
    };

    const setOptinValue = async value => {
      userSettings.collectTranscriptsOptinShown = true;
      userSettings.utterancesTelemetry = value;
      await settings.saveSettings(userSettings);
    };

    const launchPermission = async () => {
      try {
        // TODO: addTimeout to prevent flash of modal if user has already allowed microphone access
        setPermissionError("Waiting");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermissionError(null);

        const tracks = stream.getTracks();
        for (const track of tracks) {
          track.stop();
        }
      } catch (e) {
        setPermissionError(e.name);
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
