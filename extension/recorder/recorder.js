/* globals log, voice, util */

this.recorder = (function() {
  // If the permission doesn't return in this amount of time, we'll request that this tab
  // come to the foreground:
  const PERMISSION_TIMEOUT = 1000;
  const streamReady = util.makeNakedPromise();

  function setState(state) {
    document.body.className = state;
  }

  let stream;
  let activeRecorder;

  async function init() {
    const timeoutId = setTimeout(() => {
      browser.runtime.sendMessage({ type: "makeRecorderActive" });
    }, PERMISSION_TIMEOUT);
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamReady.resolve();
    } catch (e) {
      log.warn("Failed to acquire stream:", String(e));
      streamReady.reject(e);
      throw e;
    }
    clearTimeout(timeoutId);
    setState("recording");
    pause();
  }

  async function pause() {
    for (const track of stream.getTracks()) {
      track.enabled = false;
    }
    setState("paused");
  }

  async function start() {
    if (!stream) {
      throw new Error("Attempt to start stream before it is acquired");
    }
    for (const track of stream.getTracks()) {
      track.enabled = true;
    }
    setState("recording");
  }

  class ShimRecorder extends voice.Recorder {
    stop() {
      pause();
      this.mediaStopped();
    }

    onBeginRecording() {
      browser.runtime.sendMessage({
        type: "onVoiceShimForward",
        method: "onBeginRecording",
      });
    }

    onEnd(json) {
      browser.runtime.sendMessage({
        type: "onVoiceShimForward",
        method: "onEnd",
        args: [json],
      });
      pause();
    }

    onError(exception) {
      browser.runtime.sendMessage({
        type: "onVoiceShimForward",
        method: "onError",
        args: [String(exception)],
      });
    }
  }

  browser.runtime.onMessage.addListener(async message => {
    if (message.type !== "voiceShim") {
      return null;
    }
    if (message.method === "ping") {
      await streamReady;
      return true;
    } else if (message.method === "constructor") {
      start();
      if (activeRecorder) {
        throw new Error("Attempted to open recorder.ShimRecorder twice");
      }
      activeRecorder = new ShimRecorder(stream);
      return null;
    }
    if (!activeRecorder) {
      throw new Error(
        `Recorder.${message.method} called with no active recorder`
      );
    }
    if (message.method === "startRecording") {
      return activeRecorder.startRecording();
    } else if (message.method === "stop") {
      activeRecorder.stop();
      activeRecorder = null;
      return null;
    } else if (message.method === "getVolumeLevel") {
      return activeRecorder.getVolumeLevel();
    }
    return null;
  });

  setState("acquiring");
  init();
})();
