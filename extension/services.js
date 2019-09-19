this.services = (function() {
  const exports = {};

  // See https://duckduckgo.com/bang for a list of potential services
  const SERVICE_BANG_ALIASES = {
    "google slides": "gslides",
    slides: "gslides",
    "google docs": "gd",
    "google scholar": "googlescholar",
    calendar: "gcal",
    "google calendar": "gcal",
    "google drive": "drive",
    "google sheets": "gsheets",
    sheets: "gsheets",
    spreadsheets: "gsheets",
    spotify: "spotify",
    goodreads: "goodreads",
    mdn: "mdn",
    coursera: "coursera",
    gmail: "gmail",
    mail: "gmail",
    email: "gmail",
    "google mail": "gmail",
    amazon: "az",
    wikipedia: "wikipedia",
    wiki: "wikipedia",
    yelp: "yelp",
    twitter: "twitter",
    reddit: "reddit",
    "amazon music": "amusic",
    "google music": "gmusic",
    "google play music": "gmusic",
    pandora: "pandora",
    soundcloud: "soundcloud",
    "sound cloud": "soundcloud",
    shazam: "shz",
    tunein: "tunein",
    "tune in": "tunein",
    "tunein radio": "tunein",
    "tune in radio": "tunein",
    youtube: "youtube",
    vimeo: "vimeo",
    netflix: "netflix",
    hulu: "hulu",
    "apple tv": "appletv",
    "apple maps": "amaps",
    "google maps": "gmap",
    maps: "google maps",
    "open street maps": "omap",
    "open maps": "omap",
    stubhub: "stubhub",
    "stub hub": "stubhub",
    ticketmaster: "ticketmaster",
    "ticket master": "ticketmaster",
    "google translate": "translate",
    translate: "translate",
    instagram: "instagram",
    insta: "instagram",
    linkedin: "linkedin",
    quora: "quora",
    pinterest: "pin",
    pin: "pin",
    facebook: "facebook",
    stackexchange: "stackexchange",
    "stack exchange": "stackexchange",
    dropbox: "dropbox",
    "dictionary.com": "dcom",
    dictionary: "dcom",
    thesaurus: "thesaurus",
    duckduckgo: "duckduckgo",
    "duck duck go": "duckduckgo",
    "duckduckgo images": "ddgi",
    "duck duck go images": "ddgi",
    "google images": "gi",
    images: "gi",
  };

  exports.allServiceNames = function() {
    return Object.keys(SERVICE_BANG_ALIASES);
  };

  exports.ddgBangServiceName = function(name) {
    const bang = SERVICE_BANG_ALIASES[name.toLowerCase().trim()];
    if (!bang) {
      throw new Error(`Unknown service name: ${JSON.stringify(name)}`);
    }
    return bang;
  };

  return exports;
})();
