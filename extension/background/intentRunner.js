// This gets used elsewhere
this.intents = {};

this.intentRunner = (function() {
  const exports = {};

  const INTENTS = {};

  exports.registerIntent = function(name, handler) {
    if (INTENTS[name]) {
      throw new Error(`Attempt to reregister intent: ${name}`);
    }
    INTENTS[name] = handler;
  };

  exports.runIntent = function(desc) {
    if (!INTENTS[desc.name]) {
      throw new Error(`No intent found with name ${desc.name}`);
    }
    const handler = INTENTS[desc.name];
    handler(desc);
  };

  return exports;
})();
