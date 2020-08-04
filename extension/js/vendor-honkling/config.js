let serverURL = 'http://localhost:8000';

let commands = ["hey", "fire", "fox", "unknown3", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];


let detectCounterThreshold = 10;
let predictionFrequency = 62; // predict every predictionFrequency ms
let use_meyda = true;

// firefox version
let audioConfig = {
  'offlineSampleRate' : 16000,
  'offlineHopSize' : 12.5, // in ms (half of offlineWindowSize)
  'offlineWindowSize' : 32, // in ms
  'micInputWaitTime' : 5, // in s
  'noiseThreshold' : 0.050,
  'window_size' : 0.5, // in s
  'padding_size' : 6000, // in samples
  'melBands': 40 // n_mels (only used for Meyda)
}

// firefox version (not used for meyda)
let melSpectrogramConfig = {
  'use_precomputed': false,
  'sample_rate' : 16000,
  'spectrogram' : null,
  'n_fft' : 512,
  'hop_length' : 200,
  'win_length' : null,
  'window' : 'hann',
  'center' : true,
  'pad_mode' : 'reflect',
  'power' : 2.0,
  'n_mels' : 80,
  'f_min' : 0, // 20
  'f_max' : 8000, // 40
  'htk': true, // librosa false
  'norm': false // librosa true
}

let zmuvConfig = {
  "mean": -2.0045,
  "std": 4.0985
}

let inferenceEngineConfig = {
  'inference_window_ms' : 2000,
  'smoothing_window_ms' : 50,
  'tolerance_window_ms' : 500,
  'inference_weights' : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  'inference_sequence' : [0, 1, 2]
}

weights = {}; // placeholder for dynamic weights loading
melBasis = {}; // placeholder for dynamic weights loading

let input_width = audioConfig['offlineSampleRate'] * audioConfig['window_size'] / melSpectrogramConfig['hop_length'] + 1;
let input_height = audioConfig['melBands'];

let modelConfig = {
  RES8 : {
    // weight_name : "TFJS",
    weight_name : "MEYDA",
    input_shape : [input_height, input_width, 1],
    n_layers : 6,
    n_feature_maps : 45,
    res_pool : [4, 3],
    conv_size : [3, 3],
    conv_stride : [1, 1],
    use_dilation : false
  }
}
