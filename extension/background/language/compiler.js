import {
  Slot,
  Alternatives,
  Word,
  Wildcard,
  FullPhrase,
} from "./textMatching.js";
import { makeWordMatcher } from "./languageModel.js";

export function convertEntities(entityMapping) {
  const result = {};
  for (const name in entityMapping) {
    result[name] = new Alternatives(
      entityMapping[name].map(e => makeWordMatcher(e))
    );
  }
  return result;
}

export function compile(string, entities) {
  entities = entities || {};
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
        seq.push(new Word(word));
      }
      toParse = phrase;
    }
  }
  return new FullPhrase(seq, parameters);
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
  phrase = phrase.substr(phrase.indexOf(")") + 1).trim();
  return { phrase, alts, empty };
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
