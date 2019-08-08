/* globals intentParser, intentRunner */

this.main = (function() {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "runIntent") {
      const desc = intentParser.parse(message.text);
      console.info("Executing intent:", desc);
      return intentRunner.runIntent(desc);
    }
    console.error("Received message with unexpected type (${message.type}):", message);
    return null;
  });
})();
