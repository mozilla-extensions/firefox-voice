/* globals React, ReactDOM */

// eslint-disable-next-line no-unused-vars
import * as homepageView from "./homepageView.js";
import * as settings from "../settings.js";

const { useState, useEffect } = React;
const homepageContainer = document.getElementById("homepage-container");
let isInitialized = false;

export const HomepageController = function() {
  const [isCommonVoice, setIsCommonVoice] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      console.log("I GOT HERE");
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    const search = window.location.search;
    console.log(search);
    const params = new URLSearchParams(search);
    const source = params.get('source');
    setIsCommonVoice(source === "commonvoice");
  };

  return (
    <homepageView.Homepage
      isCommonVoice={isCommonVoice}
    />
  );
};

ReactDOM.render(<HomepageController />, homepageContainer);
