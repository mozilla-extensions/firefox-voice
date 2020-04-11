/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as homepageView from "./homepageView.js";
import * as settings from "../settings.js";

const { useState, useEffect } = React;
const homepageContainer = document.getElementById("homepage-container");
let isInitialized = false;
let userSettings;

export const HomepageController = function() {
  const [isCommonVoice, setIsCommonVoice] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    userSettings = await settings.getSettings();
  };

  return (
    <homepageView.Homepage
      isCommonVoice={isCommonVoice}
    />
  );
};

ReactDOM.render(<HomepageController />, homepageContainer);
