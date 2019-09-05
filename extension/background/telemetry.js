this.telemetry = (function() {
  const exports = {};

  let ping = {};

  exports.add = function(properties) {
    Object.assign(ping, properties);
  };

  exports.sendPing = function() {
    ping = {};
  };

  return exports;
})();
