/* globals intentParser, intentRunner, log */

this.main = (function() {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "runIntent") {
      const desc = intentParser.parse(message.text);
      log.info(`Executing intent: ${desc}`);
      return intentRunner.runIntent(desc);
    }
    log.error(
      `Received message with unexpected type (${message.type}): ${message}`
    );
    return null;
  });
})();
