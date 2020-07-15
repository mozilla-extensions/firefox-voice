/* globals log */

import { sendMessage } from "../communicate.js";

let activeRecorder;
let unloadEventAdded = false;

export class Recorder {
  constructor() {
    this._cachedVolumeLevel = 0;
    this._cancelled = false;
    if (activeRecorder) {
      throw new Error("new voiceShim.Recorder() called twice");
    }
    activeRecorder = this;
    sendMessage({
      type: "voiceShimForward",
      method: "constructor",
    });
    if (!unloadEventAdded) {
      unloadEventAdded = true;
      window.addEventListener("unload", closeOpenRecorder);
    }
  }

  async startRecording() {
    sendMessage({
      type: "voiceShimForward",
      method: "startRecording",
    }).catch(e => {
      log.error("Error starting recording:", String(e));
      throw e;
    });
  }

  stop() {
    return sendMessage({
      type: "voiceShimForward",
      method: "stop",
    });
  }

  cancel() {
    this._cancelled = true;
    this.stop();
  }

  onBeginRecording() {
    // override
  }

  onEnd(jsonOrNull, audioBlob) {
    // override
  }

  onError(exception) {
    // override
  }

  onProcessing(exception) {
    // override
  }

  onNoVoice(exception) {
    // override
  }

  onStartVoice() {
    // override
  }

  getVolumeLevel() {
    sendMessage({
      type: "voiceShimForward",
      method: "getVolumeLevel",
    })
      .then(volume => {
        this._cachedVolumeLevel = volume;
      })
      .catch(error => {
        log.error("Error getting volume level:", String(error));
      });
    return this._cachedVolumeLevel;
  }
}

browser.runtime.onMessage.addListener(message => {
  if (message.type === "onVoiceShim") {
    if (!activeRecorder) {
      log.error("Received message with no Recorder instance:", message);
      return Promise.resolve(null);
    }
    const args = message.args || [];
    if (
      activeRecorder._cancelled &&
      [
        "onEnd",
        "onError",
        "onProcessing",
        "onNoVoice",
        "onStartVoice",
      ].includes(message.method)
    ) {
      return Promise.resolve(null);
    }
    return Promise.resolve(activeRecorder[message.method](...args));
  }
  return undefined;
});

export async function openRecordingTab() {
  return sendMessage({
    type: "openRecordingTab",
  });
}

function closeOpenRecorder() {
  if (activeRecorder) {
    activeRecorder.stop();
    activeRecorder = null;
  }
}
