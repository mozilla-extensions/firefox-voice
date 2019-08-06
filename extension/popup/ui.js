this.ui = (function() {
  const exports = {};

  exports.sleep = function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  return exports;
})();
