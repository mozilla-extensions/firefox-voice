import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

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

intentRunner.registerIntent({
  name: "clipboard.copyLink",
  async run(context) {
    return copy(context, "copyLink");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyTitle",
  async run(context) {
    return copy(context, "copyTitle");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyRichLink",
  async run(context) {
    return copy(context, "copyRichLink");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyMarkdownLink",
  async run(context) {
    return copy(context, "copyMarkdownLink");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyScreenshot",
  async run(context) {
    return copy(context, "copyScreenshot");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyFullPageScreenshot",
  async run(context) {
    return copy(context, "copyFullPageScreenshot");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copySelection",
  async run(context) {
    return copy(context, "copySelection");
  },
});

intentRunner.registerIntent({
  name: "clipboard.paste",
  async run(context) {
    try {
      // OK, not actually a copy, but...
      await copy(context, "paste");
    } catch (e) {
      if (e.message && e.message.match(/Missing host permission/i)) {
        e.displayMessage = "Pasting is not allowed on this page";
      }
      throw e;
    }
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

export async function copyImage(url) {
  const buffer = await blobToArray(dataUrlToBlob(url));
  await browser.clipboard.setImageData(buffer, "png");
}
