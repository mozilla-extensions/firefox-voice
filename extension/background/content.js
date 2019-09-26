/* globals log */

this.content = (function() {
  const NO_RECEIVER_MESSAGE =
    "Could not establish connection. Receiving end does not exist";
  const exports = {};

  exports.lazyInject = async function(tabId, scripts) {
    if (!tabId) {
      throw new Error(`Invalid tabId: ${tabId}`);
    }
    if (typeof scripts === "string") {
      scripts = [scripts];
    }
    const scriptKey = scripts.join(",");
    let available = true;
    try {
      available = await browser.tabs.sendMessage(tabId, {
        type: "ping",
        scriptKey,
      });
    } catch (e) {
      available = false;
      if (String(e).includes(NO_RECEIVER_MESSAGE)) {
        // This is a normal error
      } else {
        log.error("Error sending message:", String(e));
      }
      available = false;
    }
    if (available) {
      return;
    }
    scripts = [
      "/buildSettings.js",
      "/log.js",
      "/content/helpers.js",
      "/content/communicate.js",
    ]
      .concat(scripts)
      .concat(["/content/responder.js"]);
    for (const script of scripts) {
      await browser.tabs.executeScript(tabId, { file: script });
    }
    await browser.tabs.sendMessage(tabId, {
      type: "scriptsLoaded",
      scriptKey,
    });
  };

  return exports;
})();
