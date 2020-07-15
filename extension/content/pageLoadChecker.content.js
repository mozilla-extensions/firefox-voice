import { registerHandler } from "../background/communicate.js";

const DEFAULT_SELECTOR = "html";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_CHECK_INTERVAL = 100;

registerHandler("isLoaded", message => {
  const { options } = message;
  return new Promise(resolve => {
    let timeout = null;
    const checkExist = setInterval(function() {
      if (document.querySelector(options.selector || DEFAULT_SELECTOR)) {
        resolve(true);
        clearInterval(checkExist);
        clearTimeout(timeout);
      }
    }, options.checkInterval || DEFAULT_CHECK_INTERVAL);
    // the specified selector has not been found
    timeout = setTimeout(() => {
      clearInterval(checkExist);
      resolve(false);
    }, options.timeout || DEFAULT_TIMEOUT);
  });
});
