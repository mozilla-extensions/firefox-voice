/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as onboardingView from "./onboardingView.js";
import * as settings from "../settings.js";

const { useState, useEffect } = React;
const onboardingContainer = document.getElementById("onboarding-container");
let isInitialized = false;
let userSettings;

export const OnboardingController = function() {
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
    setOptinViewShown(!!userSettings.collectTranscriptsOptinAnswered);

    if (optinViewAlreadyShown) {
      launchPermission();
    }
  };

  const setOptinValue = async value => {
    userSettings.collectTranscriptsOptinAnswered = Date.now();
    userSettings.utterancesTelemetry = value;
    await settings.saveSettings(userSettings);
  };

  const launchPermission = async () => {
    try {
      // Waiting view has been removed because it looks too much like an error view while we're waiting for user input.
      // setPermissionError("Waiting");
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

ReactDOM.render(<OnboardingController />, onboardingContainer);
