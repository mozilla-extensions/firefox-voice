/* globals vad */

this.voice = (function() {
  const exports = {};

  const STT_SERVER_URL =
    browser.runtime.getManifest().settings.sstServer ||
    "https://speaktome-2.services.mozilla.com";
  const LANGUAGE = "en-US";

  exports.Recorder = class Recorder {
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
      vad.stm_vad.reset();
      this.scriptprocessor.onaudioprocess = vad.stm_vad.recorderProcess;
      vad.stm_vad.stopGum = () => {
        if (this.mediaRecorder) {
          this.mediaRecorder.stop();
        }
        this.sourceNode.disconnect(this.scriptprocessor);
        this.sourceNode.disconnect(this.analyzerNode);
        this.analyzerNode.disconnect(this.outputNode);
      };
      // connect stream to our recorder
      this.sourceNode.connect(this.scriptprocessor);
      // MediaRecorder initialization
      this.mediaRecorder = new MediaRecorder(this.outputNode.stream, options);
      this.mediaRecorder.start();
      this.onBeginRecording();
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

    onEnd(jsonOrNull) {
      // Can be overridden
    }

    onError(exception) {
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
        this.onEnd(null);
        return;
      }
      const blob = new Blob(this.chunks, {
        type: "audio/ogg; codecs=opus",
      });
      const response = await fetch(STT_SERVER_URL, {
        method: "POST",
        body: blob,
        headers: {
          "Accept-Language-STT": LANGUAGE,
          "Product-Tag": "vf",
        },
      });
      if (!response.ok) {
        const error = new Error(
          `Failed response from server: ${response.status}`
        );
        error.response = response;
        this.onError(error);
        return;
      }
      this.onEnd(await response.json());
    }
  };

  return exports;
})();
