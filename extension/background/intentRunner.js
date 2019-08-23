// This gets used elsewhere as a namespace for the intent modules:
this.intents = {};

this.intentRunner = (function() {
  const exports = {};

  const intents = (exports.intents = {});

  class IntentContext {
    constructor(desc) {
      Object.assign(this, desc);
    }

    done() {
      return browser.runtime.sendMessage({
        type: "closePopup",
      });
    }

    failed(message) {
      return browser.runtime.sendMessage({
        type: "displayFailure",
        message,
      });
    }
  }

  exports.registerIntent = function(intent) {
    if (intents[intent.name]) {
      throw new Error(`Attempt to reregister intent: ${intent.name}`);
    }
    intents[intent.name] = intent;
  };

  exports.runIntent = async function(desc) {
    if (!intents[desc.name]) {
      throw new Error(`No intent found with name ${desc.name}`);
    }
    const intent = intents[desc.name];
    const context = new IntentContext(desc);
    try {
      await intent.run(context);
    } catch (e) {
      context.failed(`Internal error: ${e}`);
    }
  };

  return exports;
})();
