/* globals buildSettings, log */

import * as util from "../util.js";
import * as vad from "./vad.js";
import * as settings from "../settings.js";
import { sendMessage } from "../communicate.js";

const STT_SERVER_URL =
  buildSettings.sttServer || "https://speaktome-2.services.mozilla.com";
const DEEP_SPEECH_URL = buildSettings.deepSpeechServer;

const locale = settings.getSettings().userLocale || navigator.language;
const LANGUAGE = locale && locale.startsWith("en-") ? locale : "en-US";

export class Recorder {
  constructor(stream) {
    this.stream = stream;
    this.mediaRecorder = null;
    this.cancelled = false;
    this.chunks = null;
  }

  startRecording() {
    // Build the WebAudio graph we'll be using
    this.chunks = [];
    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.analyzerNode = this.audioContext.createAnalyser();
    this.outputNode = this.audioContext.createMediaStreamDestination();
    // make sure we're doing mono everywhere
    this.sourceNode.channelCount = 1;
    this.analyzerNode.channelCount = 1;
    this.outputNode.channelCount = 1;
    // connect the nodes together
    this.sourceNode.connect(this.analyzerNode);
    this.analyzerNode.connect(this.outputNode);
    // and set up the recorder
    const options = {
      audioBitsPerSecond: 16000,
      mimeType: "audio/ogg",
    };
    // VAD initializations
    // log.debug("Sample rate: ", audioContext.sampleRate);
    const bufferSize = 2048;
    // create a javascript node
    this.scriptprocessor = this.audioContext.createScriptProcessor(
      bufferSize,
      1,
      1
    );
    // specify the processing function
    vad.get_stm_vad().reset();
    this.scriptprocessor.onaudioprocess = vad.get_stm_vad().recorderProcess;
    vad.get_stm_vad().stopGum = () => {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
      }
      this.sourceNode.disconnect(this.scriptprocessor);
      this.sourceNode.disconnect(this.analyzerNode);
      this.analyzerNode.disconnect(this.outputNode);
    };
    // FIXME: this is a bad pattern, but all I got for now...
    vad.events.onProcessing = () => {
      if (!this.cancelled) {
        this.onProcessing();
      }
    };
    vad.events.onNoVoice = () => {
      if (!this.cancelled) {
        this.onNoVoice();
      }
    };
    vad.events.onStartVoice = () => {
      if (!this.cancelled) {
        this.onStartVoice();
      }
    };
    // connect stream to our recorder
    this.sourceNode.connect(this.scriptprocessor);
    // MediaRecorder initialization
    this.mediaRecorder = new MediaRecorder(this.outputNode.stream, options);
    this.mediaRecorder.start();
    this.mediaRecorder.onstop = async () => {
      try {
        await this.mediaStopped();
      } catch (e) {
        this.onError(e);
        throw e;
      }
    };
    this.mediaRecorder.ondataavailable = e => {
      this.chunks.push(e.data);
    };
    this.onBeginRecording();
  }

  stop() {
    this.mediaRecorder.stop();
  }

  cancel() {
    this.cancelled = true;
    this.stop();
  }

  onBeginRecording() {
    // Can be overridden!
  }

  onEnd(jsonOrNull, audioBlob) {
    // Can be overridden
  }

  onError(exception) {
    // Can be overridden
  }

  onProcessing() {
    // Can be overridden
  }

  onNoVoice() {
    // Can be overridden
  }

  onStartVoice() {
    // Can be overridden
  }

  /** Returns 0.0-1.0, based on our estimation of volume */
  getVolumeLevel() {
    const MIN_DB_LEVEL = -85; // The dB level that is 0 in the levels display
    const MAX_DB_LEVEL = -30; // The dB level that is 100% in the levels display
    // Set up the analyzer node, and allocate an array for its data
    // FFT size 64 gives us 32 bins. But those bins hold frequencies up to
    // 22kHz or more, and we only care about visualizing lower frequencies
    // which is where most human voice lies, so we use fewer bins
    this.analyzerNode.fftSize = 64;
    const frequencyBins = new Float32Array(14);
    this.analyzerNode.getFloatFrequencyData(frequencyBins);
    // Drop bottom few bins, since they are often misleadingly high
    const SKIP_BINS = 2;
    let average = 0;
    let items = 0;
    for (let bin = SKIP_BINS; bin < frequencyBins.length; bin++) {
      const value = frequencyBins[bin];
      let level = (value - MIN_DB_LEVEL) / (MAX_DB_LEVEL - MIN_DB_LEVEL);
      level = level < 0 ? 0 : level;
      level = level > 1.0 ? 1.0 : level;
      items++;
      average += level;
    }
    // TODO: should be this a max? Some other way of calculating?
    return average / items;
  }

  async mediaStopped() {
    if (this.cancelled) {
      this.onEnd(null, null);
      return;
    }
    const blob = new Blob(this.chunks, {
      type: "audio/ogg; codecs=opus",
    });
    let response;
    const deferredJson = util.makeNakedPromise();
    const storeSample = settings.getSettings().collectAudio;
    if (storeSample) {
      log.info("Sending AND storing audio on server");
    }
    const startTime = Date.now();
    try {
      response = await fetch(STT_SERVER_URL, {
        method: "POST",
        body: blob,
        headers: {
          "Accept-Language-STT": LANGUAGE,
          "Product-Tag": "fxv",
          "Store-Sample": storeSample ? "1" : "0",
        },
      });
    } catch (e) {
      sendMessage({
        type: "addTelemetry",
        properties: { serverErrorSpeech: `Connection error: ${e}` },
        doNotInit: true,
      });
      this.onError(e);
      throw e;
    }
    setTimeout(() => {
      this.sendForDeepSpeech(blob, deferredJson);
    });
    if (!response.ok) {
      sendMessage({
        type: "addTelemetry",
        properties: {
          serverErrorSpeech: `Response error: ${response.status} ${response.statusText}`,
        },
        doNotInit: true,
      });
      const error = new Error(
        `Failed response from server: ${response.status}`
      );
      error.response = response;
      this.onError(error);
      deferredJson.reject(error);
      return;
    }
    const json = await response.json();
    deferredJson.resolve(json);
    sendMessage({
      type: "addTelemetry",
      properties: {
        serverTimeSpeech: Date.now() - startTime,
      },
      doNotInit: true,
    });
    this.onEnd(json, blob);
  }

  async sendForDeepSpeech(audio, otherResponsePromise) {
    if (!buildSettings.sendToDeepSpeech) {
      return;
    }
    let response;
    const startTime = Date.now();
    try {
      response = await fetch(DEEP_SPEECH_URL, {
        method: "POST",
        body: audio,
        headers: {
          "Accept-Language-STT": LANGUAGE,
          "Product-Tag": "fxv",
        },
      });
    } catch (e) {
      log.warn("Error sending audio to DeepSpeech:", String(e), e);
      return;
    }
    if (!response.ok) {
      log.warn(
        "Server error for DeepSpeech:",
        response.status,
        response.statusText
      );
      return;
    }
    const deepJson = await response.json();
    const deepSpeechServerTime = Date.now() - startTime;
    const utterance = deepJson.data[0].text;
    const confidence = deepJson.data[0].confidence;
    const otherResponse = (await otherResponsePromise).data[0];
    function formatConfidence(n) {
      return Number(n).toFixed(2);
    }
    log.info(
      "Transcription comparison:\n" +
        `  ${otherResponse.text} (${formatConfidence(
          otherResponse.confidence
        )}))\n` +
        `  ${utterance} (${formatConfidence(confidence)})`
    );
    sendMessage({
      type: "addTelemetry",
      properties: {
        utteranceDeepSpeech: utterance,
        utteranceDeepSpeechChars: utterance.length,
        // The server has been responding with a confidence of 1.0 for all audio, which
        // isn't correct. Since it should never really be 1.0, we'll skip this value if
        // it's reported as such:
        deepSpeechConfidence: confidence === 1.0 ? undefined : confidence,
        deepSpeechServerTime,
        deepSpeechMatches: util.normalizedStringsMatch(
          utterance,
          otherResponse.text
        ),
        doNotInit: true,
      },
    });
  }
}
