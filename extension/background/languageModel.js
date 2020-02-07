const ALIASES = new Map();
for (let line of `
# Each line is a word that might show up in speech, and the word it could be treated as
app tab
cat tab
tap tab
tech tab
top tab
in on
nest next
closest close
intense intents
interns intents
haste paste
taste paste
pace paste
best paste
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  line = line.split();
  ALIASES.set(line[0], [line[1]]);
}

const STOPWORDS = new Set();
for (let line of `
the
my
me
for
# Also look in https://github.com/NaturalNode/natural/blob/master/lib/natural/util/stopwords.js#L25
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  STOPWORDS.add(line);
}

export function match(string, matchPhrase) {
  const utterance = makeWordList(string);
  return matchPhrase.matches(utterance);
}

export function makeWordList(string) {
  string = string.trim();
  return string.split(/\s+/g).map(w => new Word(w));
}

export function makeWordMatcher(string) {
  const list = makeWordList(string);
  if (list.length === 1) {
    return list[0];
  }
  return new Sequence(list);
}

export function convertEntities(entityMapping) {
  const result = {};
  for (const name in entityMapping) {
    result[name] = new Alternatives(
      entityMapping[name].map(e => makeWordMatcher(e))
    );
  }
  return result;
}

function normalize(text) {
  let n = text.toLowerCase();
  n = n.replace(/[^a-z0-9]/gi, "");
  return n;
}

export class Word {
  constructor(source) {
    this.source = source;
    this.word = normalize(source);
    this.aliases = ALIASES.get(this.word) || [];
  }

  matchUtterance(match) {
    if (!this.word) {
      // This word normalized to nothing, which is fine...
      return [match];
    }
    if (match.utteranceExhausted()) {
      return [];
    }
    let result = [];
    const otherWord = match.utteranceWord();
    if (otherWord.isStopword()) {
      result = this.matchUtterance(match.clone({ addIndex: 1, addSkipped: 1 }));
    }
    if (otherWord.word === this.word || this.aliases.includes(otherWord.word)) {
      const nextMatch = match.clone({ addIndex: 1, addWords: 1 });
      result.push(nextMatch);
    }
    return result;
  }

  isStopword() {
    return STOPWORDS.has(this.word);
  }

  toString() {
    if (this.source === this.word) {
      return `Word(${JSON.stringify(this.source)})`;
    }
    return `Word(${JSON.stringify(this.source)}->${this.word})`;
  }

  toSource() {
    return this.source;
  }
}

export class MatchPhrase {
  constructor(words, parameters = {}) {
    if (typeof words === "string") {
      words = makeWordList(words);
    }
    if (Array.isArray(words)) {
      words = new Sequence(words);
    }
    this.words = words;
    this.parameters = parameters;
  }

  matches(utterance) {
    const match = new MatchResult({ utterance, parameters: this.parameters });
    const results = [];
    for (let result of this.words.matchUtterance(match)) {
      while (
        !result.utteranceExhausted() &&
        result.utteranceWord().isStopword
      ) {
        result = result.clone({ addIndex: 1, addSkip: 1 });
      }
      if (!result.utteranceExhausted()) {
        // There are dangling utterance words that weren't matched
        continue;
      }
      results.push(result);
    }
    return results;
  }

  toString() {
    let paramString = "";
    if (this.parameters && Object.keys(this.parameters).length) {
      paramString = `, parameters=${JSON.stringify(this.parameters)}`;
    }
    return `MatchPhrase(${JSON.stringify(
      this.words.toSource()
    )}${paramString})`;
  }
}

export class Alternatives {
  constructor(alternatives, empty = false) {
    this.alternatives = alternatives;
    this.empty = empty;
  }

  matchUtterance(match) {
    let results = [];
    if (this.empty) {
      results.push(match);
    }
    for (const pattern of this.alternatives) {
      const patternMatches = pattern.matchUtterance(match);
      results = results.concat(patternMatches);
    }
    return results;
  }

  toSource() {
    const options = this.alternatives.map(a => a.toSource());
    if (this.empty) {
      options.push("");
    }
    return `(${options.join(" | ")})`;
  }
}

export class Sequence {
  constructor(patterns) {
    this.patterns = patterns;
  }

  matchUtterance(match) {
    let results = [match];
    for (const pattern of this.patterns) {
      let nextResults = [];
      for (const previousMatch of results) {
        const patternMatches = pattern.matchUtterance(previousMatch);
        nextResults = nextResults.concat(patternMatches);
      }
      results = nextResults;
    }
    return results;
  }

  toSource() {
    return this.patterns.map(p => p.toSource()).join(" ");
  }
}

export class Wildcard {
  constructor(empty = false) {
    this.empty = empty;
  }

  matchUtterance(match) {
    // Note that we handle empty things differently, so we always capture at least
    // one word here
    if (match.utteranceExhausted()) {
      if (this.empty) {
        return [match];
      }
      return [];
    }
    const results = [];
    if (this.empty) {
      results.push(match);
    }
    results.push(match.clone({ addIndex: 1 }));
    while (!results[results.length - 1].utteranceExhausted()) {
      // Note wildcards don't act like they captured words
      results.push(results[results.length - 1].clone({ addIndex: 1 }));
    }
    return results;
  }

  toSource() {
    return this.empty ? "*" : "+";
  }
}

export class Slot {
  constructor(pattern, slotName) {
    this.pattern = pattern;
    if (!slotName) {
      throw new Error("Slot slotName is required");
    }
    this.slotName = slotName;
  }

  matchUtterance(match) {
    const results = this.pattern.matchUtterance(match);
    const newResults = [];
    for (const result of results) {
      // Undo any sense that the slot words were captured
      // FIXME: not sure if this is a good idea, or if we should trust the pattern to capture or not
      result.capturedWords = match.capturedWords;
      const words = match.utterance.slice(match.index, result.index);
      const newResult = result.clone({ slots: { [this.slotName]: words } });
      newResults.push(newResult);
    }
    return newResults;
  }

  toSource() {
    return `[${this.slotName}:${this.pattern.toSource()}]`;
  }
}

class MatchResult {
  constructor({
    utterance,
    index,
    slots,
    parameters,
    capturedWords,
    skippedWords,
  }) {
    this.utterance = utterance;
    this.index = index || 0;
    this.slots = slots || {};
    this.parameters = parameters || {};
    this.capturedWords = capturedWords || 0;
    this.skippedWords = skippedWords || 0;
  }

  toString() {
    let s = "";
    for (let i = 0; i < this.utterance.length; i++) {
      if (i === this.index) {
        s += "^^";
      } else if (s) {
        s += " ";
      }
      s += this.utterance[i].source;
    }
    if (this.index >= this.utterance.length) {
      s += "^^";
    }
    let slotString = "";
    if (this.slots && Object.keys(this.slots).length) {
      for (const name in this.slots) {
        if (slotString) {
          slotString += ", ";
        }
        slotString += `${name}: `;
        const content = this.slots[name].map(w => w.source).join(" ");
        slotString += JSON.stringify(content);
        slotString = `, slots: {${slotString}}`;
      }
    }
    let paramString = "";
    if (this.parameters && Object.keys(this.parameters).length) {
      paramString = `, parameters: ${JSON.stringify(this.parameters)}`;
    }
    let skipString = "";
    if (this.skippedWords) {
      skipString = `, skippedWords: ${this.skippedWords}`;
    }
    return `MatchResult(${JSON.stringify(
      s
    )}${slotString}${paramString}${skipString}, capturedWords: ${
      this.capturedWords
    })`;
  }

  utteranceExhausted() {
    return this.index >= this.utterance.length;
  }

  utteranceWord() {
    if (this.utteranceExhausted()) {
      throw new Error("Attempted to get utterance word past end: " + this);
    }
    return this.utterance[this.index];
  }

  clone({ addIndex, slots, parameters, addWords, addSkipped }) {
    const mr = new MatchResult({
      utterance: this.utterance,
      index: this.index,
      slots: Object.assign({}, this.slots),
      parameters: Object.assign({}, this.parameters),
      capturedWords: this.capturedWords,
      skippedWords: this.skippedWords,
    });
    if (addIndex) {
      mr.index += addIndex;
      if (mr.index > mr.utterance.length) {
        // This is too far
        throw new Error("Attempted to move past the end of the end");
      }
    }
    if (slots) {
      for (const name in slots) {
        mr.slots[name] = (mr.slots[name] || []).concat(slots[name]);
      }
    }
    if (parameters) {
      for (const name in parameters) {
        if (name in mr.parameters) {
          throw new Error(
            `Attempted to override parameter ${name} (${mr.parameters[name]}) with ${parameters[name]}`
          );
        }
        mr.parameters[name] = parameters[name];
      }
    }
    if (addWords) {
      mr.capturedWords += addWords;
    }
    if (addSkipped) {
      mr.skippedWords += addSkipped;
    }
    return mr;
  }
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
  return new MatchPhrase(seq, parameters);
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
