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

  exports.ddgEntitySearch = async function(query) {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${query}&format=json&pretty=1&skip_disambig=1`
    );
    const ddgData = await response.json();
    if (!ddgData.AbstractText) {
      // the response from DDG was null, and there was no matching Instant Answer result
      return {};
    }
    const cardData = (({
      Heading,
      AbstractText,
      AbstractSource,
      AbstractURL,
      Image,
    }) => ({ Heading, AbstractText, AbstractSource, AbstractURL, Image }))(
      ddgData
    );
    return cardData;
  };

  exports.ddgBangSearchUrl = async function(query, service) {
    const SERVICE_BANG_MAP = {
      "google slides": "gslides",
      "google docs": "gd",
      "google scholar": "googlescholar",
      calendar: "gcal",
      "google calendar": "gcal",
      "google drive": "drive",
      spotify: "spotify",
      goodreads: "goodreads",
      mdn: "mdn",
      coursera: "coursera",
    };
    const bang = SERVICE_BANG_MAP[service.toLowerCase()];
    const response = await fetch(
      `https://api.duckduckgo.com/?q=!${bang}+${query}&format=json&pretty=1&no_redirect=1`
    );
    const json = await response.json();

    return json.Redirect;
  };

  exports.amazonSearchUrl = function(query) {
    const searchURL = new URL("https://www.amazon.com/s");
    searchURL.searchParams.set("k", query);
    return searchURL.href;
  };

  return exports;
})();
