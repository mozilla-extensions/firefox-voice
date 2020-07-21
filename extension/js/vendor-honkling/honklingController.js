let micAudioProcessor = new MicAudioProcessor(audioConfig);
let model = new SpeechResModel("RES8", commands);
let inferenceEngine = new InferenceEngine(inferenceEngineConfig, commands);
let melSpectrogram = new MelSpectrogram(melSpectrogramConfig);

let input_length = audioConfig['offlineSampleRate'] * audioConfig["window_size"];

if (use_meyda) {
  console.log("Using Meyda for feature extraction");
} else {
  console.log("Using TFJS version of feature extraction");
}

micAudioProcessor.getMicPermission().done(function() {
  setInterval(function() {

    if (use_meyda) {
      let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
      offlineProcessor.getMFCC().done(function(mfccData) {

        command = inferenceEngine.infer(mfccData, model, commands);
        updateToggledCommand(command);

        if (inferenceEngine.sequencePresent()) {
          toggleFullWord();
        }
      });
    } else {

      if (micAudioProcessor.getData().length < input_length) {
        return;
      }

      // micAudioProcessor.getData().length = 16324 * window_size_in_sec

      let mel_spectrogram_data = melSpectrogram.extract(micAudioProcessor.getData().slice(0, input_length));

      let log_mels_data = mel_spectrogram_data.add(0.0000007).log();

      let zmuv_sample = log_mels_data.sub(zmuvConfig["mean"]).div(zmuvConfig["std"])

      let command = inferenceEngine.infer(zmuv_sample, model, commands);
      updateToggledCommand(command);

      if (inferenceEngine.sequencePresent()) {
        toggleFullWord();
      }
    }
  }, predictionFrequency);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!');
});

// list initialization
init_view();
