/* globals log */

this.communicate = (function() {
  const exports = {};
  const HANDLERS = {};
  exports.register = function(type, handler) {
    if (HANDLERS[type]) {
      throw new Error(`There is already a handler registerd for ${type}`);
    }
    HANDLERS[type] = handler;
  };
  exports.handle = function(message, sender) {
    if (!HANDLERS[message.type]) {
      log.warn("Message of unknown type:", message.type, message);
      throw new Error(`No handler for ${message.type}`);
    }
    try {
      return HANDLERS[message.type](message, sender);
    } catch (e) {
      log.error(`Error in ${message.type} handler: ${e}`, e.stack);
      throw e;
    }
  };
  return exports;
})();
