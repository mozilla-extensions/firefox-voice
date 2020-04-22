/* globals React, ReactDOM */
// eslint-disable-next-line no-unused-vars
import * as homepageView from "./homepageView.js";
const {
  useState,
  useEffect
} = React;
const homepageContainer = document.getElementById("homepage-container");
let isInitialized = false;
export const HomepageController = function () {
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

  return /*#__PURE__*/React.createElement(homepageView.Homepage, {
    isCommonVoice: isCommonVoice
  });
};
ReactDOM.render( /*#__PURE__*/React.createElement(HomepageController, null), homepageContainer);