/* globals React, ReactDOM, Mzp */

const PUBLIC_SITE = "https://voice.mozilla.org/firefox-voice/";
const GHPAGES_SITE = "https://mozilla.github.io"; // Just the prefix

// eslint-disable-next-line no-unused-vars
import * as homepageView from "./homepageView.js";

const { useState, useEffect } = React;
const homepageContainer = document.getElementById("homepage-container");
let isInitialized = false;

if (location.href.startsWith(GHPAGES_SITE)) {
  location.replace(PUBLIC_SITE);
}

export const HomepageController = function() {
  const [isCommonVoice, setIsCommonVoice] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      init();
    }
  });

  const init = async () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const source = params.get("source");
    setIsCommonVoice(source === "commonvoice");
    Mzp.Navigation.init();
  };

  return <homepageView.Homepage isCommonVoice={isCommonVoice} />;
};

ReactDOM.render(<HomepageController />, homepageContainer);
