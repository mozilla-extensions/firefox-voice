/* globals React, ReactDOM, speechCommands, log */

// eslint-disable-next-line no-unused-vars
import * as wakewordTrainingView from "./wakewordTrainingView.js";

const { useState, useEffect } = React;
const wakewordTrainingContainer = document.getElementById(
  "wakeword-training-container"
);
let isInitialized = false;
let transferRecognizer;

export const WakewordTrainingController = function() {
  const [savedModels, setSavedModels] = useState([]);
  const [heyFirefoxExamples, setHeyFirefoxExamples] = useState([]);
  const [nextSlidePleaseExamples, setNextSlidePleaseExamples] = useState([]);
  const [backgroundNoiseExamples, setBackgroundNoiseExamples] = useState([]);

  let recognizer;

  const COLLECT_EXAMPLE_OPTIONS = {
    includeRawAudio: true,
  };

  const TRAINING_OPTIONS = {
    validationSplit: 0.25,
    callback: {
      onEpochEnd: async (epoch, logs) => {
        log.info(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
      },
    },
    fineTuningCallback: {
      onEpochEnd: async (epoch, logs) => {
        log.info(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
      },
    },
  };

  const BACKGROUND_DURATION = 10;
  const WAKEWORD_DURATION = 2;

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    await loadBaseRecognizer();
    await loadSavedModels();
    await loadTransferRecognizer(); // for now, assume there's only one transfer model allowed
  };

  const loadBaseRecognizer = async () => {
    recognizer = speechCommands.create("BROWSER_FFT");
    await recognizer.ensureModelLoaded();
    log.info(recognizer.wordLabels());
  };

  const loadSavedModels = async () => {
    const models = await speechCommands.listSavedTransferModels();
    setSavedModels(models);
  };

  const loadTransferRecognizer = async () => {
    transferRecognizer = recognizer.createTransfer("temp-default"); // TODO: CONVERT TO DEFAULT AFTER TESTING
  };

  const onDeleteExample = example => {
    transferRecognizer.removeExample(example.uid);
    refreshExamples(example.example.label);
  };

  const refreshExamples = wakeword => {
    switch (wakeword) {
      case "_background_noise_":
        setBackgroundNoiseExamples(() => {
          try {
            return transferRecognizer.getExamples(wakeword);
          } catch (error) {
            return [];
          }
        });
        break;
      case "heyFirefox":
        setHeyFirefoxExamples(() => {
          try {
            return transferRecognizer.getExamples(wakeword);
          } catch (error) {
            return [];
          }
        });
        break;
      case "nextSlidePlease":
        setNextSlidePleaseExamples(() => {
          try {
            return transferRecognizer.getExamples(wakeword);
          } catch (error) {
            return [];
          }
        });
        break;
    }
  };

  const onTrainExample = async wakeword => {
    const collectExampleOptions = COLLECT_EXAMPLE_OPTIONS;
    if (wakeword === "_background_noise_") {
      collectExampleOptions.durationSec = BACKGROUND_DURATION;
    } else {
      collectExampleOptions.durationMultiplier = WAKEWORD_DURATION;
    }
    await transferRecognizer.collectExample(wakeword, collectExampleOptions);
    refreshExamples(wakeword);
  };

  const onStartTraining = async trainingParams => {
    const trainingOptions = { ...trainingParams, ...TRAINING_OPTIONS };
    console.log("combined training opts");
    console.log(trainingOptions);
    await transferRecognizer.train(trainingOptions);
    transferRecognizer.save();
  };

  return (
    <wakewordTrainingView.WakewordTraining
      savedModels={savedModels}
      onTrainExample={onTrainExample}
      onDeleteExample={onDeleteExample}
      onStartTraining={onStartTraining}
      heyFirefoxExamples={heyFirefoxExamples}
      nextSlidePleaseExamples={nextSlidePleaseExamples}
      backgroundNoiseExamples={backgroundNoiseExamples}
    />
  );
};

ReactDOM.render(<WakewordTrainingController />, wakewordTrainingContainer);
