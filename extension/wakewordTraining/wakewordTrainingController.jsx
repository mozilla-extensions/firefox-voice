/* globals React, ReactDOM, tf, speechCommands */

// eslint-disable-next-line no-unused-vars
import * as wakewordTrainingView from "./wakewordTrainingView.js";

const { useState, useEffect } = React;
const wakewordTrainingContainer = document.getElementById("wakeword-training-container");
let isInitialized = false;

export const WakewordTrainingController = function() {
    const [savedModels, setSavedModels] = useState([]);
    let recognizer;
    let transferRecognizer;

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
    console.log(savedModels);
    // await loadTransferRecognizer(); // for now, assume there's only one transfer model allowed
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
        transferRecognizer = recognizer.createTransfer("todays-quicker-model"); // TODO: CONVERT TO DEFAULT AFTER TESTING
        await transferRecognizer.load();
    }

    const showExamples = async () => {
        console.log(transferRecognizer.countExamples());
    }

  return <wakewordTrainingView.WakewordTraining
    savedModels={savedModels}
  />;
};

ReactDOM.render(<WakewordTrainingController />, wakewordTrainingContainer);
