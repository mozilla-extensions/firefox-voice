/* globals intentParser, intentRunner, intentExamples, log */

this.main = (function() {
  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "runIntent") {
      const desc = intentParser.parse(message.text);
      return intentRunner.runIntent(desc);
    } else if (message.type === "getExamples") {
      return intentExamples.getExamples(message.number || 2);
    }
    log.error(
      `Received message with unexpected type (${message.type}): ${message}`
    );
    return null;
  });
})();
