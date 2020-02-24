/* globals communicate */

this.pageMetadataContentScript = (function() {
  const exports = {};

  communicate.register(
    "getSelection",
    message => {
      const selection = window.getSelection();
      return { selection: { text: String(selection) } };
    },
    true
  );

  exports.getMetadata = function() {
    let title = document.title || location.href;
    const titleEl = document.querySelector(
      "meta[property='og:title'], meta[property='twitter:title']"
    );
    if (titleEl && titleEl.getAttribute("content")) {
      title = titleEl.getAttribute("content");
    }
    let canonical = location.href;
    const canonicalEl = document.querySelector("link[rel='canonical']");
    if (canonicalEl && canonicalEl.href) {
      canonical = canonicalEl.href;
    }
    return {
      title,
      canonical,
      url: location.href,
      docTitle: document.title,
    };
  };

  communicate.register(
    "getMetadata",
    message => {
      return exports.getMetadata();
    },
    true
  );

  return exports;
})();
