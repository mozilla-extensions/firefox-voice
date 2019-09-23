/* globals communicate */
// Note this should always be loaded last, because once it's ready to response we consider the content script "loaded"

this.responder = (function() {
  const loadedScripts = {};

  function init() {
    browser.runtime.onMessage.addListener((message, sender) => {
      if (message.type === "ping") {
        if (message.scriptKey) {
          return !!loadedScripts[message.scriptKey];
        }
        return true;
      } else if (message.type === "scriptsLoaded") {
        loadedScripts[message.scriptKey] = true;
        return null;
      }
      return communicate.handle(message, sender);
    });
  }
  init();
})();
