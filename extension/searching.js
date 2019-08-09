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

  exports.ddgBangSearchUrl = async function(query, service) {
    const SERVICE_BANG_MAP = {
      "google slides": "gslides",
      "google docs": "gd",
      "spotify": "spotify",
      "goodreads": "goodreads",
      "mdn": "mdn",
      "coursera": "coursera"
    }
    const bang = SERVICE_BANG_MAP[service.toLowerCase()];
    let response = await fetch(`https://api.duckduckgo.com/?q=!${bang}+${query}&format=json&pretty=1&no_redirect=1`);
    let json = await response.json();
    let searchUrl = json.Redirect;

    return searchUrl;
  };
  
  exports.amazonSearchUrl = function(query) {
    const searchURL = new URL("https://www.amazon.com/s");
    searchURL.searchParams.set("k", query);
    return searchURL.href;
  };

  return exports;
})();
