/* globals content */

this.pageMetadata = (function() {
  const exports = {};

  exports.getSelection = async function(tabId) {
    await content.lazyInject(
      tabId,
      "/background/pageMetadata-contentScript.js"
    );
    const resp = await browser.tabs.sendMessage(tabId, {
      type: "getSelection",
    });
    return resp.selection;
  };

  return exports;
})();
