/* globals util, content */

this.intents.read = (function() {
  const exports = {};

  exports.stopReading = async function() {
    const activeTab = (await browser.tabs.query({ active: true }))[0];
    if (!activeTab) {
      return false;
    }
    if (!activeTab.url.startsWith("about:reader")) {
      return false;
    }
    await content.lazyInject(activeTab.id, ["/intents/read/startNarration.js"]);
    await browser.tabs.sendMessage(activeTab.id, {
      type: "stopReading",
    });
    return true;
  };

  this.intentRunner.registerIntent({
    name: "read.read",
    examples: ["Read this page"],
    match: `
    read (this |) (tab | page |)
    `,
    async run(desc) {
      const activeTab = (await browser.tabs.query({ active: true }))[0];
      if (!activeTab.url.startsWith("about:reader")) {
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
      }
      await content.lazyInject(activeTab.id, [
        "/intents/read/startNarration.js",
      ]);
      const success = await browser.tabs.sendMessage(activeTab.id, {
        type: "narrate",
      });
      if (!success) {
        const e = new Error(`Already narrating`);
        e.displayMessage = "Already narrating";
        throw e;
      }
    },
  });

  this.intentRunner.registerIntent({
    name: "read.stopRead",
    examples: ["Stop reading"],
    match: `
    stop reading (this |) (tab | page |)
    `,
    async run(desc) {
      const activeTab = (await browser.tabs.query({ active: true }))[0];
      if (!activeTab.url.startsWith("about:reader")) {
        const e = new Error(`Not a Reader Mode page`);
        e.displayMessage = "Page isn't narrating";
        throw e;
      }
      await content.lazyInject(activeTab.id, [
        "/intents/read/startNarration.js",
      ]);
      const success = await browser.tabs.sendMessage(activeTab.id, {
        type: "stopReading",
      });
      if (!success) {
        const e = new Error("Not narrating");
        e.displayMessage = "Page isn't narrating";
        throw e;
      }
    },
  });

  return exports;
})();
