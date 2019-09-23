this.helpers = (function() {
  const exports = {};

  exports.waitForSelector = function(selector, options) {
    const interval = (options && options.interval) || 50;
    const timeout = (options && options.timeout) || 1000;
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const id = setInterval(() => {
        const result = document.querySelector(selector);
        if (result) {
          clearTimeout(id);
          resolve(result);
          return;
        }
        if (Date.now() > start + timeout) {
          const e = new Error(`Timeout waiting for ${selector}`);
          e.name = "TimeoutError";
          clearTimeout(id);
          reject(e);
        }
      }, interval);
    });
  };

  exports.setReactInputValue = function(input, value) {
    // See https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
    // for the why of this
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(input, value);
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
  };

  return exports;
})();
