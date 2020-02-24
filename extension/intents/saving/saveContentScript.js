/* globals communicate, freezeDry, pageMetadataContentScript, screenshotContentScript */

this.saveContentScript = (function() {
  communicate.register("freezeHtml", async message => {
    const html = await freezeDry.default();
    const metadata = pageMetadataContentScript.getMetadata();
    return { html, metadata };
  });

  communicate.register("screenshot", async message => {
    const metadata = pageMetadataContentScript.getMetadata();
    const png = screenshotContentScript.visibleScreenshot();
    return { png, metadata };
  });

  communicate.register("screenshotFullPage", async message => {
    const metadata = pageMetadataContentScript.getMetadata();
    const png = screenshotContentScript.fullPageScreenshot();
    return { png, metadata };
  });
})();
