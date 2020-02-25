/*
This implements the compiler that translates pattern strings to a matcher.

Syntax:

* The phrase must be matched completely, beginning to end
* Words match that word
* A "stopword" (not-important word) can appear anywhere, and is ignored
  * Stopwords are defined in english.toml
* Aliases (words that might be spelled differently or misheard) can be matched
  * Aliases are defined in english.toml
* There can be alternatives, like `(one | two | three four)`
  * Each alternative is separated by `|`. In this example "three four" must appear together
  * Using an empty alternative makes the word optional, like `(page |)` matches "page" or nothing
* "Slots" are named and use the syntax `[slotName]`. These act like a wildcard
  * Wildcards still must match at least one word
  * Slots can be typed like `[slotName:entityType]`, and are not wildcards
* "Parameters" are like tags on a phrase, and do not match anything. The syntax is `[param=value]`
  * This is used to distinguish one phrase from another

*/

import {
  Slot,
  Alternatives,
  Word,
  Wildcard,
  Sequence,
  FullPhrase,
  makeWordList,
} from "./textMatching.js";

/* The entities passed to compile() must go through this function. Typically you call:

    convertEntities({lang: ["English", "Spanish", ...]})

This can be passed into `compile()`
*/
export function convertEntities(entityMapping) {
  const result = {};
  for (const name in entityMapping) {
    result[name] = new Alternatives(
      entityMapping[name].map(e => makeWordMatcher(e))
    );
  }
  return result;
}

function makeWordMatcher(string) {
  const list = makeWordList(string);
  if (list.length === 1) {
    return list[0];
  }
  return new Sequence(list);
}

export function splitPhraseLines(string) {
  if (typeof string !== "string") {
    throw new Error(`Bad input: ${string}`);
  }
  const result = [];
  for (let line of string.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) {
      continue;
    }
    result.push(line);
  }
  return result;
}

export function compile(string, options) {
  options = options || {};
  const entities = options.entities || {};
  const intentName = options.intentName;
  const seq = [];
  const parameters = {};
  let toParse = string;
  while (toParse) {
    if (_isParameter(toParse)) {
      const { parameter, value, phrase } = _getParameter(toParse);
      parameters[parameter] = value;
      toParse = phrase;
    } else if (toParse.startsWith("[")) {
      const { slot, phrase } = _getSlot(toParse);
      toParse = phrase;
      if (slot.includes(":")) {
        const parts = slot.split(":");
        const slotName = parts[0].trim();
        const entityName = parts[1].trim();
        if (!entities[entityName]) {
          throw new Error(`No entity type by the name ${entityName}`);
        }
        seq.push(new Slot(entities[entityName], slotName));
      } else {
        seq.push(new Slot(new Wildcard(), slot));
      }
    } else if (toParse.startsWith("(")) {
      const { alts, phrase, empty } = _getAlternatives(toParse);
      toParse = phrase;
      const altWords = alts.map(words => makeWordMatcher(words));
      seq.push(new Alternatives(altWords, empty));
    } else {
      const { words, phrase } = _getWords(toParse);
      for (const word of words.split(/\s+/g)) {
        if (_isAltWord(word)) {
          seq.push(new Alternatives(_altWords(word).map(w => new Word(w))));
        } else {
          seq.push(new Word(word));
        }
      }
      toParse = phrase;
    }
  }
  const phrase = new FullPhrase(seq, { intentName, parameters });
  phrase.originalSource = string;
  return phrase;
}

function _getAlternatives(phrase) {
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
  let empty = false;
  if (alts.includes("")) {
    empty = true;
    alts = alts.filter(w => w);
  }
  let altWords = [];
  for (const word of alts) {
    if (_isAltWord(word)) {
      altWords = altWords.concat(_altWords(word));
    } else {
      altWords.push(word);
    }
  }
  phrase = phrase.substr(phrase.indexOf(")") + 1).trim();
  return { phrase, alts: altWords, empty };
}

function _getSlot(phrase) {
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

function _getWords(phrase) {
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

function _isAltWord(string) {
  return /\{[^}]+\}/.test(string);
}

function _altWords(string) {
  const bit = /\{([^}]+)\}/.exec(string)[1];
  const baseWord = string.replace(/\{[^}]+\}/, "");
  const altWord = string.replace(/\{[^}]\}/, bit);
  return [baseWord, altWord];
}

function _isParameter(phrase) {
  return /^\[\w+=/.test(phrase);
}

function _getParameter(phrase) {
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
