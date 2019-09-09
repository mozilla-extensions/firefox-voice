this.util = (function() {
  const exports = {};

  exports.sleep = function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  /** Creates a Promise with .resolve and .reject attributes, so you can pre-create it and then
   * resolve it somewhere else (like after initialization has run) */
  exports.makeNakedPromise = function() {
    let _resolve, _reject;
    const promise = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    promise.resolve = _resolve;
    promise.reject = _reject;
    return promise;
  };

  exports.cmp = function(a, b) {
    if (a < b) {
      return -1;
    } else if (b < a) {
      return 1;
    }
    return 0;
  };

  exports.randomString = function randomString(length, chars) {
    const randomStringChars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    chars = chars || randomStringChars;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  return exports;
})();
