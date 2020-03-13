/* globals log */

this.communicate = (function() {
  const exports = {};
  const HANDLERS = {};

  exports.register = function(type, handler, noConflict = false) {
    if (!noConflict && HANDLERS[type]) {
      throw new Error(`There is already a handler registered for ${type}`);
    }
    HANDLERS[type] = handler;
  };

  exports.handle = async function(script, message, sender) {
    log.messaging(`${script}->`, JSON.stringify(message));
    if (!HANDLERS[message.type]) {
      log.warn(
        "Message of unknown type:",
        String(message.type),
        JSON.stringify(message)
      );
      throw new Error(`No handler for ${message.type}`);
    }
    try {
      return Promise.resolve(HANDLERS[message.type](message, sender));
    } catch (e) {
      log.error(`Error in ${message.type} handler: ${e}`, e.stack);
      const response = {
        status: "error",
        message: String(e),
        name: e.name,
        stack: e.stack,
        reason: e.reason,
      };
      for (const name in e) {
        if (!(name in response)) {
          response[name] = e[name];
        }
      }
      return response;
    }
  };
  return exports;
})();
