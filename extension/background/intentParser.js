/* globals log, util */
this.intentParser = (function() {
  const exports = {};

  const DEFAULT_INTENT = "navigation.search";
  const DEFAULT_SLOT = "query";

  /*
  Matcher syntax:

    "plain text (alt|text) [slot]"

  Spaces separate words, but spaces don't matter too much. Slots are all wildcards.
  */

  const ENTITY_TYPES = {
    serviceName: "google slides|google docs|spotify|goodreads|mdn|coursera|google scholar|google drive|calendar|google calendar|mail| google mail|gmail".split(
      "|"
    ),
  };

  const Matcher = (exports.Matcher = class Matcher {
    constructor(phrase) {
      this.phrase = phrase;
      const { slots, regex } = this._phraseToRegex(phrase);
      this.slots = slots;
      this.regexString = regex;
      this.regex = new RegExp("^" + regex + "$", "i");
    }

    match(utterance) {
      const match = this.regex.exec(" " + utterance.trim());
      if (!match) {
        return null;
      }
      const result = { slots: {}, utterance, regex: this.regexString };
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
      let regex = "";
      while (toParse) {
        if (toParse.startsWith("[")) {
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
            regex += "(.+?)";
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
      return { slots, regex };
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
  const INTENT_PRIORITY_NAMES = [];
  let INTENT_NAMES = [];
  const PRIORITIES = {
    low: -1,
    "": 0,
    high: 1,
  };

  exports.registerMatcher = function(intentName, matcher, priority) {
    if (INTENTS[intentName]) {
      throw new Error(`Intent ${intentName} has already been registered`);
    }
    if (typeof matcher === "string") {
      matcher = new MatchSet(matcher);
    }
    INTENT_PRIORITY_NAMES.push([intentName, PRIORITIES[priority || ""]]);
    INTENT_PRIORITY_NAMES.sort((a, b) => {
      return util.cmp(-a[1], -b[1]) || util.cmp(a[0], b[0]);
    });
    INTENT_NAMES = INTENT_PRIORITY_NAMES.map(i => i[0]);
    INTENTS[intentName] = { matcher };
  };

  exports.parse = function parse(text, disableFallback = false) {
    text = text.trim();
    text = text.replace(/\s\s+/g, " ");
    for (const name of INTENT_NAMES) {
      const matcher = INTENTS[name].matcher;
      const match = matcher.match(text);
      if (match) {
        match.name = name;
        return match;
      }
    }
    if (disableFallback) {
      return null;
    }
    log.info(`Parsed as fallback intent: ${JSON.stringify(text)}`);
    return {
      name: DEFAULT_INTENT,
      slots: { [DEFAULT_SLOT]: text },
      utterance: text,
    };
  };

  exports.getNamesByPriority = function() {
    return INTENT_NAMES;
  };

  return exports;
})();
