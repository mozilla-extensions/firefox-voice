import { registerHandler } from "../communicate.js";

export class Runner {
  constructor() {
    this._logMessages = [];
  }

  log(...args) {
    this._logMessages.push(args);
  }

  querySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      const e = new Error(`Could not find element ${selector}`);
      e.name = "ElementNotFound";
      throw e;
    }
    return element;
  }

  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  setReactInputValue(input, value) {
    // See https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
    // for the why of this
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(input, value);
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
  }

  waitForSelector(selector, options) {
    const interval = (options && options.interval) || 50;
    const timeout = (options && options.timeout) || 1000;
    const minCount = (options && options.minCount) || 1;
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const id = setInterval(() => {
        const result = document.querySelectorAll(selector);
        if (result.length && result.length >= minCount) {
          clearTimeout(id);
          if (options && options.all) {
            resolve(result);
          } else {
            resolve(result[0]);
          }
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
  }
}

Runner.register = function() {
  const Class = this;
  for (const name of Object.getOwnPropertyNames(Class.prototype)) {
    if (name.startsWith("action_")) {
      const actionName = name.substr("action_".length);
      registerHandler(actionName, message => {
        const instance = new Class();
        try {
          return instance[name](message);
        } catch (e) {
          e.log = instance._logMessages;
          throw e;
        }
      });
    }
  }
};
