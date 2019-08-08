this.searching = (function() {
  const exports = {};

  exports.googleSearchUrl = function(query, feelingLucky = false) {
    const searchUrl = new URL("https://www.google.com/search");
    searchUrl.searchParams.set("q", query);
    if (feelingLucky) {
      searchUrl.searchParams.set("btnI", "");
    }
    // From https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters
    searchUrl.searchParams.set("safe", "active");
    return searchUrl.href;
  };

  exports.amazonSearchUrl = function(query) {
    const searchURL = new URL("https://www.amazon.com/s");
    searchURL.searchParams.set("k", query);
    return searchURL.href;
  };

  return exports;
})();
