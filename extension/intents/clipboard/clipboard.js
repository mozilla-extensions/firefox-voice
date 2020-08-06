import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

async function copy(context, copyType, complete = false) {
  const activeTab = await browserUtil.activeTab();
  await content.inject(activeTab.id, "/intents/clipboard/clipboard.content.js");
  if (complete) {
    await browserUtil.waitForDocumentComplete(activeTab.id);
  }
  browser.tabs.sendMessage(activeTab.id, { type: "copy", copyType });
}

async function add(context, copyType, prevousText, complete = false) {
  const activeTab = await browserUtil.activeTab();
  await content.inject(activeTab.id, "/intents/clipboard/clipboard.content.js");
  if (complete) {
    await browserUtil.waitForDocumentComplete(activeTab.id);
  }
  browser.tabs.sendMessage(activeTab.id, {
    type: "add",
    copyType,
    prevousText,
  });
}

intentRunner.registerIntent({
  name: "clipboard.copyLink",
  async run(context) {
    await copy(context, "copyLink");
    context.presentMessage("Link copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyTitle",
  async run(context) {
    await copy(context, "copyTitle");
    context.presentMessage("Title copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyRichLink",
  async run(context) {
    await copy(context, "copyRichLink");
    context.presentMessage("Title and link copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyMarkdownLink",
  async run(context) {
    await copy(context, "copyMarkdownLink");
    context.presentMessage("Markdown title and link copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyScreenshot",
  async run(context) {
    await copy(context, "copyScreenshot");
    context.presentMessage("Screenshot copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyFullPageScreenshot",
  async run(context) {
    await copy(context, "copyFullPageScreenshot");
    context.presentMessage("Full page screenshot copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copySelection",
  async run(context) {
    await copy(context, "copySelection");
    context.presentMessage("Selected text copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyImage",
  async run(context) {
    await copy(context, "copyImage");
    context.presentMessage("Image copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.copyValue",
  async run(context) {
    navigator.clipboard.writeText(context.slots.value);
    context.presentMessage("Value copied to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.addLink",
  async run(context) {
    const text = await navigator.clipboard.readText();
    if (text) {
      await add(context, "copyLink", text);
    } else {
      await copy(context, "copyLink");
    }
    context.presentMessage("Link added to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.addTitle",
  async run(context) {
    const text = await navigator.clipboard.readText();
    if (text) {
      await add(context, "copyTitle", text);
    } else {
      await copy(context, "copyTitle");
    }
    context.presentMessage("Title added to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.addSelection",
  async run(context) {
    const text = await navigator.clipboard.readText();
    if (text) {
      await add(context, "copySelection", text);
    } else {
      await copy(context, "copySelection");
    }

    context.presentMessage("Selected text added to clipboard");
  },
});

intentRunner.registerIntent({
  name: "clipboard.paste",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    if (
      activeTab.url === "about:newtab" ||
      activeTab.url === "about:home" ||
      activeTab.url === "about:blank"
    ) {
      const text = await navigator.clipboard.readText();
      if (!text) {
        const exc = new Error("No text in clipboard");
        exc.displayMessage = "No text in clipboard";
        throw exc;
      }
      if (/^https?:\/\//i.test(text)) {
        await browser.tabs.update(activeTab.id, { url: text });
      } else {
        await browser.search.search({
          query: text,
        });
      }
      return;
    }
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
  let blob;
  if (url.startsWith("data:")) {
    blob = dataUrlToBlob(url);
  } else {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error("Cannot fetch image");
    }
    blob = await resp.blob();
  }
  const buffer = await blobToArray(blob);
  await browser.clipboard.setImageData(buffer, blob.type.split("/")[1]);
}
