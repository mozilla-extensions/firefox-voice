/* globals content, browserUtil */

this.intents.clipboard = (function() {
  const exports = {};

  async function copy(context, copyType, complete = false) {
    const activeTab = await browserUtil.activeTab();
    await content.lazyInject(activeTab.id, [
      "/background/pageMetadata-contentScript.js",
      "/intents/clipboard/contentScript.js",
    ]);
    if (complete) {
      await browserUtil.waitForDocumentComplete(activeTab.id);
    }
    browser.tabs.sendMessage(activeTab.id, { type: "copy", copyType });
  }

  this.intentRunner.registerIntent({
    name: "clipboard.copyLink",
    description: "Copies the link of the current tab",
    examples: ["Copy link"],
    match: `
    copy (the |) (this |) (tab's |) (link | url) (of this tab |) (to clipboard |)
    `,
    async run(context) {
      return copy(context, "copyLink");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copyTitle",
    description: "Copies the title of the current tab",
    examples: ["Copy tab title"],
    match: `
    copy (the |) title of (the | this |) tab (to clipboard |)
    copy (the |) tab title (to clipboard |)
    copy title (to clipboard |)
    `,
    async run(context) {
      return copy(context, "copyTitle");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copyRichLink",
    description: "Copies the HTML title and link",
    examples: ["Copy HTML link"],
    match: `
    copy (the |) (rich | html) link of (the | this |) tab (to clipboard |)
    copy (the |) (rich | html) (tab |) link (to clipboard |)
    copy (the |) (rich | html) link (to clipboard |)
    copy (the |) title and link (to clipboard |)
    copy (the |) link and title (to clipboard |)
    `,
    async run(context) {
      return copy(context, "copyRichLink");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copyMarkdownLink",
    description: "Copies the Markdown [title](link)",
    examples: ["Copy Markdown link"],
    match: `
    copy (the |) markdown link of (the | this |) tab (to clipboard |)
    copy (the |) markdown (tab |) link (to clipboard |)
    copy (the |) markdown title and link (to clipboard |)
    copy (the |) markdown link and title (to clipboard |)
    `,
    async run(context) {
      return copy(context, "copyMarkdownLink");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copyScreenshot",
    description: "Copies the screenshot of the visible page",
    examples: ["Copy screenshot"],
    match: `
    copy (the |) screenshot of (the | this |) tab (to clipboard |)
    copy (the |) (tab's |) screenshot (to clipboard |)
    screenshot (this |) (tab |) to clipboard
    `,
    async run(context) {
      return copy(context, "copyScreenshot");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copyFullPageScreenshot",
    description: "Copies a full page screenshot",
    examples: ["Copy full page screenshot"],
    match: `
    copy (the |) full (page |) (screenshot |) of (the | this |) tab (to clipboard |)
    copy (the |) (tab's |) full (page |) (screenshot |) (to clipboard |)
    screenshot full (page |) to clipboard
    `,
    async run(context) {
      return copy(context, "copyFullPageScreenshot");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.copySelection",
    description: "Copies the selection",
    examples: ["Copy selection"],
    match: `
    copy (this |) (selection |) (to clipboard |)
    `,
    async run(context) {
      return copy(context, "copySelection");
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.paste",
    description: "Copies the selection",
    examples: ["Copy selection"],
    match: `
    paste (the |) (selection | clipboard |)
    `,
    async run(context) {
      // OK, not actually a copy, but...
      return copy(context, "paste");
    },
  });

  /* Image clipboard routines
   ***********************************************/

  function dataUrlToBlob(url) {
    const binary = atob(url.split(",", 2)[1]);
    const contentType = "image/png";
    const data = Uint8Array.from(binary, char => char.charCodeAt(0));
    const blob = new Blob([data], { type: contentType });
    return blob;
  }

  function blobToArray(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", function() {
        resolve(reader.result);
      });
      reader.readAsArrayBuffer(blob);
    });
  }

  exports.copyImage = async function copyImage(url) {
    const buffer = await blobToArray(dataUrlToBlob(url));
    await browser.clipboard.setImageData(buffer, "png");
  };

  return exports;
})();
