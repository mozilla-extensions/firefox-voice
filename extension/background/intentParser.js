/* globals log, serviceList, languages */
this.intentParser = (function() {
  const exports = {};

  const DEFAULT_INTENT = "search.search";
  const DEFAULT_SLOT = "query";

  /*
  Matcher syntax:

    "plain text (alt|text) [slot]"

  Spaces separate words, but spaces don't matter too much. Slots are all wildcards.

  You can use `[slot:slotType]` to create a slot that must be of a certain types (types are in ENTITY_MAP)

  You can use `[parameter=value]` to set a parameter on any matches for this one item. This does not capture anything.

  You can use `noun{s}` to match both `noun` and `nouns`.
  */

  const ENTITY_TYPES = {
    serviceName: serviceList.allServiceNames(),
    musicServiceName: serviceList.musicServiceNames(),
    lang: languages.languageNames(),
    smallNumber: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ],
  };

  // We will consider matches where we have to make these substitutions in order to get an exact
  // match for an intent pattern. It both considers doing ALL the substitutions, and doing each
  // substitution alone. (But all possible combinations are not attempted.)
  // FIXME: we should make these substitutions in the matcher, not the incoming text
  const SUBSTITUTIONS = {
    the: "",
    my: "",
    app: "tab",
    cat: "tab",
    tap: "tab",
    tech: "tab",
    top: "tab",
    "for me": "",
    in: "on",
    nest: "next",
    closest: "close",
    webpage: "page",
    website: "site",
    intense: "intents",
    interns: "intents",
  };

  // This is used to attempt ALL substitutions:
  const SUB_REGEX = new RegExp(
    `\\b(${Object.keys(SUBSTITUTIONS).join("|")})\\b`,
    "gi"
  );

  // And this is used to attempt one-by-one substitutions:
  const SUB_REGEXES = {};
  for (const key in SUBSTITUTIONS) {
    SUB_REGEXES[key] = [new RegExp(`\\b{key}\\b`, "gi"), SUBSTITUTIONS[key]];
  }

  const Matcher = (exports.Matcher = class Matcher {
    constructor(phrase) {
      this.phrase = phrase;
      const { slots, regex, parameters, slotTypes } = this._phraseToRegex(
        phrase
      );
      this.slots = slots;
      this.slotTypes = slotTypes;
      this.parameters = parameters;
      this.regexString = regex;
      this.regex = new RegExp("^" + regex + "$", "i");
    }

    match(utterance) {
      const match = this.regex.exec(" " + utterance.trim());
      if (!match) {
        return null;
      }
      const result = {
        slots: {},
        slotTypes: this.slotTypes,
        utterance,
        regex: this.regexString,
        parameters: Object.assign({}, this.parameters),
      };
      for (let i = 0; i < this.slots.length; i++) {
        if (match[i + 1]) {
          if (result.slots[this.slots[i]]) {
            result.slots[this.slots[i]] += " " + match[i + 1].trim();
          } else {
            result.slots[this.slots[i]] = match[i + 1].trim();
          }
        }
      }
      return result;
    }

    getMatchers() {
      return [this];
    }

    _phraseToRegex(toParse) {
      const slots = [];
      const slotTypes = {};
      const parameters = {};
      let regex = "";
      while (toParse) {
        if (this._isParameter(toParse)) {
          const { parameter, value, phrase } = this._getParameter(toParse);
          parameters[parameter] = value;
          toParse = phrase;
        } else if (toParse.startsWith("[")) {
          const { slot, phrase } = this._getSlot(toParse);
          toParse = phrase;
          if (slot.includes(":")) {
            const parts = slot.split(":");
            slots.push(parts[0].trim());
            const entityName = parts[1].trim();
            if (!ENTITY_TYPES[entityName]) {
              throw new Error(`No entity type by the name ${entityName}`);
            }
            slotTypes[parts[0].trim()] = parts[1].trim();
            const entityRegex = ENTITY_TYPES[entityName]
              .map(e => (e ? " " + e : e))
              .join("|");
            regex += `(${entityRegex})`;
          } else {
            regex += "( .+?)";
            slots.push(slot);
          }
        } else if (toParse.startsWith("(")) {
          const { alts, phrase } = this._getAlternatives(toParse);
          toParse = phrase;
          const prefixedAlts = alts.map(w => (w ? " " + w : ""));
          regex += "(?:" + prefixedAlts.join("|") + ")";
        } else {
          const { words, phrase } = this._getWords(toParse);
          toParse = phrase;
          regex += " " + words;
        }
      }
      // Implements the {s} optional strings:
      regex = regex.replace(/\{(.*?)\}/g, "(?:$1)?");
      return { slots, parameters, regex, slotTypes };
    }

    _getAlternatives(phrase) {
      if (!phrase.startsWith("(")) {
        throw new Error("Expected (");
      }
      phrase = phrase.substr(1);
      if (!phrase.includes(")")) {
        throw new Error("Missing )");
      }
      let alts = phrase.substr(0, phrase.indexOf(")"));
      alts = alts.split("|");
      alts = alts.map(w => w.trim());
      phrase = phrase.substr(phrase.indexOf(")") + 1).trim();
      return { phrase, alts };
    }

    _getSlot(phrase) {
      if (!phrase.startsWith("[")) {
        throw new Error("Expected [");
      }
      phrase = phrase.substr(1);
      if (!phrase.includes("]")) {
        throw new Error("Missing ]");
      }
      const slot = phrase.substr(0, phrase.indexOf("]")).trim();
      phrase = phrase.substr(phrase.indexOf("]") + 1).trim();
      return { slot, phrase };
    }

    _getWords(phrase) {
      const nextParen = phrase.indexOf("(");
      const nextBrace = phrase.indexOf("[");
      let next;
      if (nextParen === -1 && nextBrace === -1) {
        // There are no special characters
        return { words: phrase, phrase: "" };
      }
      if (nextParen !== -1 && nextBrace === -1) {
        next = nextParen;
      } else if (nextBrace !== -1 && nextParen === -1) {
        next = nextBrace;
      } else if (nextBrace < nextParen) {
        next = nextBrace;
      } else {
        next = nextParen;
      }
      const words = phrase.substr(0, next).trim();
      return { words, phrase: phrase.substr(next) };
    }

    _isParameter(phrase) {
      return /^\[\w+=/.test(phrase);
    }

    _getParameter(phrase) {
      if (!phrase.startsWith("[")) {
        throw new Error("Expected [");
      }
      phrase = phrase.substr(1);
      if (!phrase.includes("]")) {
        throw new Error("Missing ]");
      }
      const paramSetter = phrase.substr(0, phrase.indexOf("]")).trim();
      phrase = phrase.substr(phrase.indexOf("]") + 1).trim();
      const parts = paramSetter.split("=");
      if (parts.length !== 2) {
        throw new Error(`Bad parameter assignment: ${paramSetter}`);
      }
      return { parameter: parts[0], value: parts[1], phrase };
    }
  });

  const MatchSet = (exports.MatchSet = class MatchSet {
    constructor(phrases) {
      if (typeof phrases === "string") {
        const lines = [];
        for (const line of phrases.split("\n")) {
          if (
            line.trim() &&
            !line.trim().startsWith("#") &&
            !line.trim().startsWith("//")
          ) {
            lines.push(line.trim());
          }
        }
        phrases = lines;
      }
      this.matchers = phrases.map(p =>
        typeof p === "string" ? new Matcher(p) : p
      );
    }

    match(utterance) {
      for (const matcher of this.matchers) {
        const result = matcher.match(utterance);
        if (result) {
          return result;
        }
      }
      return null;
    }

    getMatchers() {
      return this.matchers;
    }
  });

  // Populated by registerMatcher:
  const INTENTS = {};
  const INTENT_NAMES = [];

  function normalizeText(text) {
    text = text.trim();
    // Normalize whitespace, so there's always just one space between words:
    text = text.replace(/\s\s+/g, " ");
    // Removes punctuation at the end of words, like "this, and that.":
    text = text.replace(/[.,;!?]\B/g, "");
    return text;
  }

  exports.registerMatcher = function(intentName, matcher) {
    if (INTENTS[intentName]) {
      throw new Error(`Intent ${intentName} has already been registered`);
    }
    if (typeof matcher === "string") {
      matcher = new MatchSet(matcher);
    }
    INTENT_NAMES.push(intentName);
    INTENT_NAMES.sort();
    INTENTS[intentName] = { matcher };
  };

  exports.parse = function parse(text, disableFallback = false) {
    text = normalizeText(text);
    const alternatives = [[text, 0]];
    for (const key in SUB_REGEXES) {
      const [re, sub] = SUB_REGEXES[key];
      let c = 0;
      const newText = text.replace(re, () => {
        c++;
        return sub;
      });
      if (newText !== text) {
        alternatives.push([normalizeText(newText), c]);
      }
    }
    let c = 0;
    const newText = text.replace(SUB_REGEX, match => {
      c++;
      const sub = SUBSTITUTIONS[match.toLowerCase()];
      if (sub === undefined) {
        throw new Error(`Match substitution failed: ${match}`);
      }
      return sub;
    });
    if (newText !== text) {
      alternatives.push([normalizeText(newText), c]);
    }
    const results = [];
    let bestMatch;
    for (const [text, score] of alternatives) {
      for (const match of findMatches(text)) {
        match.score += score;
        results.push(match);
        if (!bestMatch || match.score < bestMatch.score) {
          bestMatch = match;
        }
      }
    }
    if (bestMatch) {
      return bestMatch;
    }
    if (disableFallback) {
      return null;
    }
    log.info(`Parsed as fallback intent: ${JSON.stringify(text)}`);
    return {
      name: DEFAULT_INTENT,
      slots: { [DEFAULT_SLOT]: text },
      parameters: {},
      utterance: text,
      fallback: true,
    };
  };

  function findMatches(text) {
    const results = [];
    for (const name of INTENT_NAMES) {
      const matcher = INTENTS[name].matcher;
      const match = matcher.match(text);
      if (match) {
        match.name = name;
        match.fallback = false;
        let score = 0;
        for (const slotName in match.slots) {
          if (match.slotTypes[slotName]) {
            score += 1;
          } else {
            score += match.slots[slotName].length;
          }
        }
        match.score = score;
        results.push(match);
      }
    }
    return results;
  }

  exports.getIntentNames = function() {
    return INTENT_NAMES;
  };

  return exports;
})();
