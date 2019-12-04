this.languages = (function() {
  const exports = {};

  exports.languageCodes = {
    czech: "cs",
    danish: "da",
    dutch: "nl",
    english: "en",
    finnish: "fi",
    french: "fr",
    german: "de",
    hungarian: "hu",
    italian: "it",
    norwegian: "no",
    polish: "pl",
    portuguese: "pt",
    romanian: "ro",
    russian: "ru",
    slovak: "sk",
    slovenian: "sl",
    spanish: "es",
    swedish: "sv",
    turkish: "tr",
    ukrainian: "uk",
  };

  exports.languageNames = function() {
    return Object.keys(exports.languageCodes);
  };

  return exports;
})();
