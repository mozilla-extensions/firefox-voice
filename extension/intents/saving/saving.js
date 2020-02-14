import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "saving.save",
  async run(context) {
    let filename;
    const activeTab = await browserUtil.activeTab();
    await content.lazyInject(activeTab.id, [
      "/js/vendor/freezeDry.js",
      "/background/pageMetadata-contentScript.js",
      "/intents/saving/saveContentScript.js",
    ]);
    const { html, metadata } = await browser.tabs.sendMessage(activeTab.id, {
      type: "freezeHtml",
    });
    const name = context.slots.name;
    if (!name) {
      filename = makeFilename(metadata.title, metadata.url, ".html");
    } else {
      filename = cleanFiletitle(name);
      filename = adaptFilenameToMaxSize(filename);
      filename = filename + ".html";
    }
    await downloadData(html, "text/html", filename);
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

async function downloadData(body, contentType, filename) {
  if (contentType !== "image/png" && contentType !== "image/jpeg") {
    contentType = "image/png";
  }
  const blob = new Blob([body], { type: contentType });
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

function makeFilename(title, url, extension) {
  const filenameTitle = cleanFiletitle(title);
  const date = new Date();
  const filenameDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60 * 1000
  )
    .toISOString()
    .substring(0, 10);
  const domain = getDomain(url);
  let filename = `${domain} ${filenameDate} ${filenameTitle}`;
  filename = adaptFilenameToMaxSize(filename);
  return filename + extension;
}
