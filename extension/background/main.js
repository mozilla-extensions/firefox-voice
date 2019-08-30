/* globals intentParser, intentRunner, intentExamples, log, intents */

this.main = (function() {
  const exports = {};

  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "runIntent") {
      const desc = intentParser.parse(message.text);
      return intentRunner.runIntent(desc);
    } else if (message.type === "getExamples") {
      return intentExamples.getExamples(message.number || 2);
    } else if (message.type === "inDevelopment") {
      return exports.inDevelopment();
    } else if (message.type === "getIntentSummary") {
      return intentRunner.getIntentSummary();
    } else if (message.type === "microphoneStarted") {
      return intents.muting.temporaryMute();
    } else if (message.type === "microphoneStopped") {
      return intents.muting.temporaryUnmute();
    }
    log.error(
      `Received message with unexpected type (${message.type}): ${message}`
    );
    return null;
  });

  let inDevelopment;
  exports.inDevelopment = function() {
    if (inDevelopment === undefined) {
      throw new Error("Unknown inDevelopment status");
    }
    return inDevelopment;
  };

  browser.runtime.onInstalled.addListener(details => {
    const manifest = browser.runtime.getManifest();
    inDevelopment = details.temporary || manifest.settings.inDevelopment;
  });

  return exports;
})();
