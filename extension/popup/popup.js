/* globals util, voice, vad, ui, log, voiceShim */

this.popup = (function() {
  const PERMISSION_REQUEST_TIME = 2000;
  const FAST_PERMISSION_CLOSE = 500;
  let stream;
  let isWaitingForPermission = null;
  let executedIntent = false;

  const { backgroundTabRecorder } = browser.runtime.getManifest().settings;

  async function init() {
    if (!backgroundTabRecorder) {
      await setupStream();
    } else {
      await voiceShim.openRecordingTab();
    }
    startRecorder();
    // Listen for messages from the background scripts
    browser.runtime.onMessage.addListener(handleMessage);
    updateExamples();
  }

  async function setupStream() {
    try {
      isWaitingForPermission = Date.now();
      await startMicrophone();
      isWaitingForPermission = null;
    } catch (e) {
      isWaitingForPermission = false;
      if (e.name === "NotAllowedError" || e.name === "TimeoutError") {
        startOnboarding();
        window.close();
        return;
      }
      throw e;
    }

    console.info("starting...");
    await vad.stm_vad_ready;
    console.info("stm_vad is ready");
  }

  async function requestMicrophone() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  }

  async function startMicrophone() {
    const sleeper = util.sleep(PERMISSION_REQUEST_TIME).then(() => {
      const exc = new Error("Permission Timed Out");
      exc.name = "TimeoutError";
      throw exc;
    });
    await Promise.race([requestMicrophone(), sleeper]);
  }

  async function startOnboarding() {
    await browser.tabs.create({
      url: browser.extension.getURL("onboarding/onboard.html"),
    });
  }

  function startRecorder(stream) {
    let recorder;
    if (backgroundTabRecorder) {
      recorder = new voiceShim.Recorder();
    } else {
      recorder = new voice.Recorder(stream);
    }
    const intervalId = setInterval(() => {
      const volumeLevel = recorder.getVolumeLevel();
      ui.setAnimationForVolume(volumeLevel);
    }, 500);
    recorder.onBeginRecording = () => {
      browser.runtime.sendMessage({ type: "microphoneStarted" });
      ui.setState("listening");
      ui.onStartTextInput = () => {
        log.debug("detected text from the popup");
        recorder.cancel(); // not sure if this is working as expected?
      };
      ui.onTextInput = text => {
        ui.setState("success");
        executedIntent = true;
        browser.runtime.sendMessage({
          type: "runIntent",
          text,
        });
      };
    };
    recorder.onEnd = json => {
      browser.runtime.sendMessage({ type: "microphoneStopped" });
      clearInterval(intervalId);
      ui.setState("success");
      if (json === null) {
        // It was cancelled
        return;
      }
      ui.setTranscript(json.data[0].text);
      executedIntent = true;
      browser.runtime.sendMessage({
        type: "runIntent",
        text: json.data[0].text,
      });
    };
    recorder.onError = error => {
      log.error("Got recorder error:", String(error), error);
      ui.setState("error");
      clearInterval(intervalId);
    };
    recorder.startRecording();
  }

  function handleMessage(message) {
    if (message.type === "closePopup") {
      ui.closePopup();
    } else if (message.type === "showCard") {
      ui.showCard(message.cardData);
    }
  }

  async function updateExamples() {
    const examples = await browser.runtime.sendMessage({
      type: "getExamples",
      number: 3,
    });
    ui.showExamples(examples);
  }

  window.addEventListener("unload", () => {
    browser.runtime.sendMessage({ type: "microphoneStopped" });
    console.log("stopped", executedIntent);
    if (!executedIntent) {
      browser.runtime.sendMessage({ type: "cancelledIntent" });
    }
    if (
      !backgroundTabRecorder &&
      isWaitingForPermission &&
      Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE
    ) {
      startOnboarding();
    }
  });

  init();
})();
