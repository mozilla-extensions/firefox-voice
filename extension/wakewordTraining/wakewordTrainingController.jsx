/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as wakewordTrainingView from "./wakewordTrainingView.js";

const { useState, useEffect } = React;
const wakewordTrainingContainer = document.getElementById("wakeword-training-container");
let isInitialized = false;

export const WakewordTrainingController = function() {
  const [isCommonVoice, setIsCommonVoice] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    console.log("I am here");
  };

  return <wakewordTrainingView.WakewordTraining />;
};

ReactDOM.render(<WakewordTrainingController />, wakewordTrainingContainer);
