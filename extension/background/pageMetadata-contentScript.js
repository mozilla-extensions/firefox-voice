/* globals communicate */

this.pageMetadataContentScript = (function() {
  communicate.register("getSelection", message => {
    const selection = window.getSelection();
    return { selection: { text: String(selection) } };
  });
})();
