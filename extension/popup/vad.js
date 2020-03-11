/* globals log, ui */

import * as util from "../util.js";

let Module;

// This gets initialized later
let stm_vad;
export function get_stm_vad() {
  return stm_vad;
}

export const stm_vad_ready = util.makeNakedPromise();

export const events = {
  onProcessing() {},
  onNoVoice() {},
  onStartVoice() {},
};

export class SpeakToMeVad {
  constructor() {
    this.webrtc_main = Module.cwrap("main");
    this.webrtc_main();
    this.webrtc_setmode = Module.cwrap("setmode", "number", ["number"]);
    // set_mode defines the aggressiveness degree of the voice activity detection algorithm
    // for more info see: https://github.com/mozilla/gecko/blob/central/media/webrtc/trunk/webrtc/common_audio/vad/vad_core.h#L68
    this.webrtc_setmode(3);
    this.webrtc_process_data = Module.cwrap("process_data", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    // frame length that should be passed to the vad engine. Depends on audio sample rate
    // https://github.com/mozilla/gecko/blob/central/media/webrtc/trunk/webrtc/common_audio/vad/vad_core.h#L106
    this.sizeBufferVad = 480;
    // minimum of voice (in milliseconds) that should be captured to be considered voice
    this.minvoice = 250;
    // max amount of silence (in milliseconds) that should be captured to be considered end-of-speech
    this.maxsilence = 1500;
    // max amount of capturing time (in seconds)
    this.maxtime = 15;
  }

  reset() {
    this.buffer_vad = new Int16Array(this.sizeBufferVad);
    this.leftovers = 0;
    this.finishedvoice = false;
    this.samplesvoice = 0;
    this.samplessilence = 0;
    this.touchedvoice = false;
    this.touchedsilence = false;
    this.dtantes = Date.now();
    this.dtantesmili = Date.now();
    this.raisenovoice = false;
    this.done = false;
    this.onStartVoiceSent = false;
  }

  // function that returns if the specified buffer has silence of speech
  isSilence(buffer_pcm) {
    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    const nDataBytes = buffer_pcm.length * buffer_pcm.BYTES_PER_ELEMENT;
    const dataPtr = Module._malloc(nDataBytes);
    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    const dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(buffer_pcm.buffer));
    // Call function and get result
    const result = this.webrtc_process_data(
      dataHeap.byteOffset,
      buffer_pcm.length,
      48000,
      buffer_pcm[0],
      buffer_pcm[100],
      buffer_pcm[2000]
    );
    // Free memory
    Module._free(dataHeap.byteOffset);
    return result;
  }

  floatTo16BitPCM(output, input) {
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  }

  recorderProcess(e) {
    const buffer_pcm = new Int16Array(e.inputBuffer.getChannelData(0).length);
    stm_vad.floatTo16BitPCM(buffer_pcm, e.inputBuffer.getChannelData(0));
    // algorithm used to determine if the user stopped speaking or not
    for (
      let i = 0;
      i < Math.ceil(buffer_pcm.length / stm_vad.sizeBufferVad) && !stm_vad.done;
      i++
    ) {
      const start = i * stm_vad.sizeBufferVad;
      let end = start + stm_vad.sizeBufferVad;
      if (start + stm_vad.sizeBufferVad > buffer_pcm.length) {
        // store to the next buffer
        stm_vad.buffer_vad.set(buffer_pcm.slice(start));
        stm_vad.leftovers = buffer_pcm.length - start;
      } else {
        if (stm_vad.leftovers > 0) {
          // we have this.leftovers from previous array
          end = end - this.leftovers;
          stm_vad.buffer_vad.set(
            buffer_pcm.slice(start, end),
            stm_vad.leftovers
          );
          stm_vad.leftovers = 0;
        } else {
          // send to the vad
          stm_vad.buffer_vad.set(buffer_pcm.slice(start, end));
        }
        const vad = stm_vad.isSilence(stm_vad.buffer_vad);
        stm_vad.buffer_vad = new Int16Array(stm_vad.sizeBufferVad);
        const dtdepois = Date.now();
        if (vad === 0) {
          if (stm_vad.touchedvoice) {
            stm_vad.samplessilence += dtdepois - stm_vad.dtantesmili;
            if (stm_vad.samplessilence > stm_vad.maxsilence) {
              stm_vad.touchedsilence = true;
            }
          }
        } else {
          stm_vad.samplesvoice += dtdepois - stm_vad.dtantesmili;
          if (stm_vad.samplesvoice > stm_vad.minvoice) {
            stm_vad.touchedvoice = true;
          }
          if (!this.onStartVoiceSent) {
            events.onStartVoice();
            this.onStartVoiceSent = true;
          }
        }
        stm_vad.dtantesmili = dtdepois;
        if (stm_vad.touchedvoice && stm_vad.touchedsilence) {
          stm_vad.finishedvoice = true;
        }
        if (stm_vad.finishedvoice) {
          stm_vad.done = true;
          stm_vad.goCloud("GoCloud finishedvoice");
        }
        if ((dtdepois - stm_vad.dtantes) / 1000 > stm_vad.maxtime) {
          stm_vad.done = true;
          if (stm_vad.touchedvoice) {
            stm_vad.goCloud("GoCloud timeout");
          } else {
            stm_vad.goCloud("Raise novoice");
            stm_vad.raisenovoice = true;
          }
        }
      }
    }
  }

  goCloud(why) {
    log.debug("goCloud, why:", why);
    this.stopGum();
    // FIXME: maybe we need to signal the UI here?
    if (why === "GoCloud finishedvoice") {
      events.onProcessing();
      if (typeof ui !== "undefined") {
        ui.setState("processing"); // TODO: send a message through voice.js to popup.js to ui.js to set the processing state
      }
    } else if (why === "Raise novoice") {
      events.onNoVoice();
    }
  }
}

function initModule() {
  // Creation of the configuration object
  // that will be pick by emscripten module
  window.Module = Module = {
    preRun: [],
    postRun: [],
    print: (function() {
      return function(text) {
        log.info("[webrtc_vad.js print]", text);
      };
    })(),
    printErr(text) {
      log.error("[webrtc_vad.js error]", text);
    },
    canvas: (function() {})(),
    setStatus(text) {
      log.info("[webrtc_vad.js status] ", text);
    },
    totalDependencies: 0,
    monitorRunDependencies(left) {
      this.totalDependencies = Math.max(this.totalDependencies, left);
      Module.setStatus(
        left
          ? "Preparing... (" +
              (this.totalDependencies - left) +
              "/" +
              this.totalDependencies +
              ")"
          : "All downloads complete."
      );
    },
  };

  Module.setStatus("Loading webrtc_vad...");
  // FIXME: a global onerror will catch too much:
  window.onerror = function(event) {
    // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
    Module.setStatus("Exception thrown, see JavaScript console", event);
    Module.setStatus = function(text) {
      if (text) {
        Module.printErr("[post-exception status] " + text);
      }
    };
    stm_vad_ready.reject(event);
  };
  Module.noInitialRun = true;
  Module.onRuntimeInitialized = function() {
    stm_vad = new SpeakToMeVad();
    Module.setStatus("Webrtc_vad and SpeakToMeVad loaded");
    stm_vad_ready.resolve();
  };
  const script = document.createElement("script");
  script.src = "/js/vendor/webrtc_vad.js";
  document.head.appendChild(script);
}

initModule();
