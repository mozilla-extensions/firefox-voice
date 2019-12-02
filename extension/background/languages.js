this.languages = (function() {
  const exports = {};

  exports.languageCodes = {
    Czech: "cs",
    Danish: "da",
    Dutch: "nl",
    English: "en",
    Finnish: "fi",
    French: "fr",
    German: "de",
    Hungarian: "hu",
    Italian: "it",
    Norwegian: "no",
    Polish: "pl",
    Portuguese: "pt",
    Romanian: "ro",
    Russian: "ru",
    Slovak: "sk",
    Slovenian: "sl",
    Spanish: "es",
    Swedish: "sv",
    Turkish: "tr",
    Ukrainian: "uk",
  };

  exports.languageNames = function() {
    return Object.keys(exports.languageCodes);
  };

  return exports;
})();
