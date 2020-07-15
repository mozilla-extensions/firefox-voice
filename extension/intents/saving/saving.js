import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "saving.save",
  async run(context) {
    context.savingPage("startSavingPage");
    let filename;
    const activeTab = await browserUtil.activeTab();

    await content.inject(activeTab.id, [
      "/js/vendor/freezeDry.js",
      "/intents/saving/saving.content.js",
    ]);
    const { html, metadata } = await browser.tabs.sendMessage(activeTab.id, {
      type: "freezeHtml",
    });
    const name = context.slots.name;
    if (!name) {
      filename = makeFilename("", metadata.title, metadata.url, ".html");
    } else {
      filename = cleanFiletitle(name);
      filename = adaptFilenameToMaxSize(filename);
      filename = filename + ".html";
    }
    const blob = htmlToBlob(html);
    await downloadData(context, blob, filename);
    context.presentMessage("Page saved to downloads folder");
  },
});

intentRunner.registerIntent({
  name: "saving.showLastDownload",
  async run(context) {
    const downloadItems = await browser.downloads.search({
      limit: 1,
      orderBy: ["-startTime"],
    });
    if (downloadItems.length > 0) {
      const lastestDownloadId = downloadItems[0].id;
      await browser.downloads.show(lastestDownloadId);
    } else {
      const e = new Error("No downloaded items found:");
      e.displayMessage = "No downloaded items found";
      throw e;
    }
  },
});

intentRunner.registerIntent({
  name: "saving.downloadScreenshot",
  async run(context) {
    return downloadScreenshot(context, "screenshot");
  },
});

intentRunner.registerIntent({
  name: "saving.downloadFullPageScreenshot",
  async run(context) {
    return downloadScreenshot(context, "screenshotFullPage");
  },
});

async function downloadScreenshot(context, type) {
  let filename;
  const activeTab = await browserUtil.activeTab();
  await content.inject(activeTab.id, [
    "/js/vendor/freezeDry.js",
    "/intents/saving/saving.content.js",
  ]);
  const { png, metadata } = await browser.tabs.sendMessage(activeTab.id, {
    type,
  });
  const name = context.slots.name;
  if (!name) {
    filename = makeFilename(
      "Screenshot of ",
      metadata.title,
      metadata.url,
      ".png"
    );
  } else {
    filename = cleanFiletitle(name);
    filename = adaptFilenameToMaxSize(filename);
    filename = filename + ".png";
  }
  const blob = dataPngUrlToBlob(png);
  await downloadData(context, blob, filename);
  context.presentMessage("Screenshot saved to downloads folder");
}

function dataPngUrlToBlob(url) {
  const binary = atob(url.split(",", 2)[1]);
  const contentType = "image/png";
  const data = Uint8Array.from(binary, char => char.charCodeAt(0));
  const blob = new Blob([data], { type: contentType });
  return blob;
}

function htmlToBlob(text) {
  return new Blob([text], { type: "text/html" });
}

async function downloadData(context, blob, filename) {
  const url = URL.createObjectURL(blob);
  let downloadId;
  function onChanged(change) {
    if (!downloadId || downloadId !== change.id) {
      return;
    }
    if (change.state && change.state.current !== "in_progress") {
      URL.revokeObjectURL(url);
      browser.downloads.onChanged.removeListener(onChanged);
    }
  }
  browser.downloads.onChanged.addListener(onChanged);
  await browser.downloads.download({
    url,
    filename,
  });
  context.savingPage("endSavingPage");
}

function getDomain(url) {
  const hostname = new URL(url).hostname;
  return hostname.toLowerCase().replace(/^www[^.]*\./i, "");
}

function cleanFiletitle(title) {
  let filenameTitle = title;
  // eslint-disable-next-line no-control-regex
  filenameTitle = filenameTitle.replace(/[:\\<>/!@&?"*.|\x00-\x1F]/g, " ");
  filenameTitle = filenameTitle.replace(/\s{1,4000}/g, " ");
  return filenameTitle;
}

function adaptFilenameToMaxSize(filename) {
  let adaptFilename = filename;
  const adaptFilenameBytesSize = adaptFilename.length * 2; // JS STrings are UTF-16
  if (adaptFilenameBytesSize > 251) {
    // 255 bytes (Usual filesystems max) - 5 for the ".html" file extension string
    const excedingchars = (adaptFilenameBytesSize - 246) / 2; // 251 - 5 for ellipsis "[...]"
    adaptFilename = adaptFilename.substring(
      0,
      adaptFilename.length - excedingchars
    );
    adaptFilename = adaptFilename + "[...]";
  }
  return adaptFilename;
}

function makeFilename(prefix, title, url, extension) {
  const filenameTitle = cleanFiletitle(title);
  const date = new Date();
  const filenameDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60 * 1000
  )
    .toISOString()
    .substring(0, 10);
  const domain = getDomain(url);
  let filename = `${prefix}${domain} ${filenameDate} ${filenameTitle}`;
  filename = adaptFilenameToMaxSize(filename);
  return filename + extension;
}
