this.telemetry = (function() {
  const exports = {};

  const pingTemplate = {};

  let ping;

  function resetPing() {
    ping = Object.assign({}, pingTemplate);
  }

  exports.add = function(properties) {
    Object.assign(ping, properties);
  };

  exports.sendPing = function() {
    resetPing();
  };

  resetPing();

  return exports;
})();
