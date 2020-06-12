/* globals buildSettings */
/* eslint-disable no-console */

"use strict";

this.log = (function() {
  const exports = {};

  const logLevel = buildSettings.logLevel || "debug";

  const levels = ["messaging", "debug", "info", "warn", "error"];
  if (!levels.includes(logLevel)) {
    console.warn("Invalid buildSettings.logLevel:", logLevel);
  }
  const shouldLog = {};

  {
    let startLogging = false;
    for (const level of levels) {
      if (logLevel === level) {
        startLogging = true;
      }
      if (startLogging) {
        shouldLog[level] = true;
      }
    }
  }

  function stub() {}
  exports.messaging = exports.debug = exports.info = exports.warn = exports.error = exports.startTiming = exports.timing = stub;

  let TIMING_LOGS = [];

  if (shouldLog.debug) {
    exports.startTiming = function(name) {
      TIMING_LOGS.push({ start: true, name, time: Date.now() });
      if (!window.isBackgroundPage) {
        queueTiming();
      }
    };
    exports.timing = function(name) {
      TIMING_LOGS.push({ name, time: Date.now() });
      if (!window.isBackgroundPage) {
        queueTiming();
      }
    };
  }

  exports.addTimings = function(timings) {
    TIMING_LOGS = TIMING_LOGS.concat(timings);
  };

  exports.getTimings = function() {
    TIMING_LOGS.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      if (b.time < a.time) {
        return 1;
      }
      return 0;
    });
    return TIMING_LOGS;
  };

  let _queueId = null;
  function queueTiming() {
    if (!_queueId) {
      _queueId = setTimeout(async () => {
        await browser.runtime.sendMessage({
          type: "addTimings",
          timings: TIMING_LOGS,
        });
        TIMING_LOGS = [];
        _queueId = null;
      }, 1000);
    }
  }

  if (shouldLog.messaging) {
    exports.messaging = console.debug;
  }

  if (shouldLog.debug) {
    exports.debug = console.debug;
  }

  if (shouldLog.info) {
    exports.info = console.info;
  }

  if (shouldLog.warn) {
    exports.warn = console.warn;
  }

  if (shouldLog.error) {
    exports.error = console.error;
  }

  return exports;
})();
null;
