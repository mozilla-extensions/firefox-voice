/* globals React, ReactDOM, tf, speechCommands */

// eslint-disable-next-line no-unused-vars
import * as wakewordTrainingView from "./wakewordTrainingView.js";

const { useState, useEffect } = React;
const wakewordTrainingContainer = document.getElementById("wakeword-training-container");
let isInitialized = false;
let transferRecognizer;

export const WakewordTrainingController = function() {
    const [savedModels, setSavedModels] = useState([]);
    let recognizer;
    
    const COLLECT_EXAMPLE_OPTIONS = {
      includeRawAudio: true
    }

    const BACKGROUND_DURATION = 10;
    const WAKEWORD_DURATION = 2;

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    console.log("I am here");
    await loadBaseRecognizer();
    await loadSavedModels();
    await loadTransferRecognizer(); // for now, assume there's only one transfer model allowed
    // await showExamples();
  };

  const loadBaseRecognizer = async () => {
    recognizer = speechCommands.create('BROWSER_FFT');
    await recognizer.ensureModelLoaded();
    console.log(recognizer.wordLabels());
    }

    const loadSavedModels = async () => {
        const models = await speechCommands.listSavedTransferModels();
        setSavedModels(models);
    }

    const loadTransferRecognizer = async () => {
        transferRecognizer = recognizer.createTransfer("temp-default"); // TODO: CONVERT TO DEFAULT AFTER TESTING
        console.log(transferRecognizer);
        // await transferRecognizer.load();
    }

    const showExamples = async () => {
        console.log(transferRecognizer.countExamples());
    }

    const onTrainExample = async (wakeword) => {
      const wordToTrain = wakeword === "Background noise" ? "_background_noise_" : wakeword;
      let collectExampleOptions = COLLECT_EXAMPLE_OPTIONS;
      if (wordToTrain === "_background_noise_") {
        collectExampleOptions.durationSec = BACKGROUND_DURATION;
      } else {
        collectExampleOptions.durationMultiplier = WAKEWORD_DURATION;
      }
      const spectogram = await transferRecognizer.collectExample(wordToTrain, collectExampleOptions);
      console.log(spectogram);
    }

  return <wakewordTrainingView.WakewordTraining
    savedModels={savedModels}
    onTrainExample={onTrainExample}
  />;
};

ReactDOM.render(<WakewordTrainingController />, wakewordTrainingContainer);
