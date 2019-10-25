/* globals log, serviceList */
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
  };

  const Matcher = (exports.Matcher = class Matcher {
    constructor(phrase) {
      this.phrase = phrase;
      const { slots, regex, parameters } = this._phraseToRegex(phrase);
      this.slots = slots;
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
      return { slots, parameters, regex };
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
          if (line.trim() && !line.trim().startsWith("#")) {
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
    text = text.trim();
    // Normalize whitespace, so there's always just one space between words:
    text = text.replace(/\s\s+/g, " ");
    // Removes punctuation at the end of words, like "this, and that.":
    text = text.replace(/[.,;!?]\B/g, "");
    let bestMatch;
    let bestChars;
    for (const name of INTENT_NAMES) {
      const matcher = INTENTS[name].matcher;
      const match = matcher.match(text);
      if (match) {
        match.name = name;
        match.fallback = false;
        const slotChars = Object.values(match.slots).join("").length;
        if (bestMatch === undefined || bestChars > slotChars) {
          bestMatch = match;
          bestChars = slotChars;
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

  exports.getIntentNames = function() {
    return INTENT_NAMES;
  };

  return exports;
})();
