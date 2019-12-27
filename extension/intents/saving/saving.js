/* globals content, browserUtil */

this.intents.saving = (function() {
  this.intentRunner.registerIntent({
    name: "saving.save",
    description: "Saves the current page as HTML",
    examples: ["Save"],
    match: `
    (save | download) (this | active |) (page | html) (as html |)
    (save | download) (this | active |) (page | html) as [name]
    `,
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
        filename = name + ".html";
      }
      await downloadData(html, "text/html", filename);
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

  function makeFilename(title, url, extension) {
    let filenameTitle = title;
    const date = new Date();
    // eslint-disable-next-line no-control-regex
    filenameTitle = filenameTitle.replace(/[:\\<>/!@&?"*.|\x00-\x1F]/g, " ");
    filenameTitle = filenameTitle.replace(/\s{1,4000}/g, " ");
    const filenameDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60 * 1000
    )
      .toISOString()
      .substring(0, 10);
    const domain = getDomain(url);
    let clipFilename = `${domain} ${filenameDate} ${filenameTitle}`;
    const clipFilenameBytesSize = clipFilename.length * 2; // JS STrings are UTF-16
    if (clipFilenameBytesSize > 251) {
      // 255 bytes (Usual filesystems max) - 5 for the ".html" file extension string
      const excedingchars = (clipFilenameBytesSize - 246) / 2; // 251 - 5 for ellipsis "[...]"
      clipFilename = clipFilename.substring(
        0,
        clipFilename.length - excedingchars
      );
      clipFilename = clipFilename + "[...]";
    }
    return clipFilename + extension;
  }
})();
