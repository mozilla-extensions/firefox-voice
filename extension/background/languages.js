this.languages = {};

this.languageList = (function() {
    const exports = {};

    const LANGUAGES = {
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

    exports.allLanguages = function() {
        return Object.keys(LANGUAGES);
    };
})();
