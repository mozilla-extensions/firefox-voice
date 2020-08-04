/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as onboardingView from "./onboardingView.js";
import * as settings from "../settings.js";

const { useState, useEffect } = React;
const onboardingContainer = document.getElementById("onboarding-container");
let isInitialized = false;
let userSettings;

const askForAudio = !!new URLSearchParams(location.search).get("audio");

export const OnboardingController = function() {
  const [optinViewAlreadyShown, setOptinViewShown] = useState(true);
  const [optinTechDataAlreadyShown, setOptinTechDataAlreadyShown] = useState(
    true
  );
  const [permissionError, setPermissionError] = useState(null);
  const [optinWakewordAlreadyShown, setOptinWakewordAlreadyShown] = useState(
    true
  );
  const [wakewordActive, setWakewordActive] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    userSettings = await settings.getSettings();
    setOptinViewShown(!!userSettings.collectTranscriptsOptinAnswered);
    setOptinTechDataAlreadyShown(
      !!userSettings.collectTranscriptsOptinAnswered
    );
    setOptinWakewordAlreadyShown(!!userSettings.wakewordOptinAnswered);
    setWakewordActive(!!userSettings.enableWakeword);
    if (optinViewAlreadyShown) {
      launchPermission();
    }
  };

  const setCollectTechData = async value => {
    if (!value) {
      // Opting out of tech data means opting out of everything
      userSettings.collectTranscriptsOptinAnswered = Date.now();
      userSettings.disableTelemetry = true;
      setOptinTechDataAlreadyShown(true);
      // This is true, in that we don't have to show the second opt-in view:
      setOptinViewShown(true);
      await settings.saveSettings(userSettings);
    } else {
      userSettings.disableTelemetry = false;
      setOptinTechDataAlreadyShown(true);
      await settings.saveSettings(userSettings);
    }
  };

  const setOptinValue = async value => {
    userSettings.collectTranscriptsOptinAnswered = Date.now();
    userSettings.utterancesTelemetry = value;
    if (askForAudio) {
      userSettings.collectAudio = value;
    }
    await settings.saveSettings(userSettings);
  };

  const setWakewordOptinValue = async value => {
    userSettings.wakewordOptinAnswered = Date.now();
    userSettings.enableWakeword = value;
    setWakewordActive(userSettings.enableWakeword);
    setOptinWakewordAlreadyShown(true);
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
      optinTechDataAlreadyShown={optinTechDataAlreadyShown}
      askForAudio={askForAudio}
      setCollectTechData={setCollectTechData}
      setOptinValue={setOptinValue}
      setOptinViewShown={setOptinViewShown}
      permissionError={permissionError}
      setWakewordOptinValue={setWakewordOptinValue}
      optinWakewordAlreadyShown={optinWakewordAlreadyShown}
      wakewordActive={wakewordActive}
    />
  );
};

ReactDOM.render(<OnboardingController />, onboardingContainer);
