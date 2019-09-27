/* globals util, log */

this.intents.read = (function() {
  const exports = {};

  exports.stopReading = async function() {
    const tab = (await browser.tabs.query({ active: true }))[0];
    if (!tab) {
      return false;
    }
    if (!tab.url.startsWith("about:reader")) {
      return false;
    }
    try {
      await browser.tabs.sendMessage(tab.id, {
        type: "stopReading",
      });
      return true;
    } catch (e) {
      log.info("Exception:", String(e), e);
      return false;
    }
  };

  this.intentRunner.registerIntent({
    name: "read.read",
    examples: ["Read this page"],
    match: `
    read (this |) (tab | page |)
    `,
    async run(desc) {
      // FIXME: this can fail, we should guard against that and show error:
      try {
        await browser.tabs.toggleReaderMode();
      } catch (e) {
        if (
          e.message &&
          e.message.includes(
            "The specified tab cannot be placed into reader mode"
          )
        ) {
          e.displayMessage = "This page cannot be put into Reader Mode";
        }
        throw e;
      }
      // FIXME: toggleReaderMode just returns immediately so we have to wait to get this to work
      // Ideally it would give an error or something if it was attached to the wrong kind of tab
      await util.sleep(1000);
      await browser.tabs.executeScript({
        runAt: "document_end",
        file: "/intents/read/startNarration.js",
      });
    },
  });

  return exports;
})();
