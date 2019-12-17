/* globals communicate, freezeDry, pageMetadataContentScript */

this.saveContentScript = (function() {
  communicate.register("freezeHtml", async message => {
    const html = await freezeDry.default();
    const metadata = pageMetadataContentScript.getMetadata();
    return { html, metadata };
  });
})();
