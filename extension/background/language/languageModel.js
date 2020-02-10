import { aliases, multiwordAliases, stopwords } from "./english.js";

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

function cmp(a, b) {
  if (a < b) {
    return 1;
  }
  return a > b ? -1 : 0;
}

export class Word {
  constructor(source) {
    this.source = source;
    this.word = normalize(source);
    this.aliases = aliases.get(this.word) || [];
    this.multiwordAliases = multiwordAliases.get(this.word);
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
    if (this.multiwordAliases) {
      for (const alias of this.multiwordAliases) {
        let multiwordResult = match;
        for (const word of alias) {
          if (
            !multiwordResult.utteranceExhausted() &&
            multiwordResult.utteranceWord().word === word
          ) {
            multiwordResult = multiwordResult.clone({
              addIndex: 1,
              addWords: 1,
              addAliased: 1,
            });
          } else {
            multiwordResult = null;
            break;
          }
        }
        if (multiwordResult) {
          result.push(multiwordResult);
        }
      }
    }
    if (otherWord.word === this.word) {
      const nextMatch = match.clone({ addIndex: 1, addWords: 1 });
      result.push(nextMatch);
    } else if (this.aliases.includes(otherWord.word)) {
      const nextMatch = match.clone({
        addIndex: 1,
        addWords: 1,
        addAliased: 1,
      });
      result.push(nextMatch);
    }
    return result;
  }

  isStopword() {
    return stopwords.has(this.word);
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

export class MatchSet {
  constructor(matchPhrases) {
    this.matchPhrases = matchPhrases;
  }

  match(utterance) {
    let allMatches = [];
    for (const [intentName, matchPhrase] of this.matchPhrases) {
      const matches = matchPhrase.matches(utterance);
      matches.forEach(m => (m.intentName = intentName));
      allMatches = allMatches.concat(matches);
    }
    if (!allMatches.length) {
      return null;
    }
    allMatches.sort((a, b) => {
      return (
        cmp(a.capturedWords, b.capturedWords) ||
        cmp(-a.skippedWords, -b.skippedWords) ||
        cmp(-a.aliasedWords, -b.aliasedWords)
      );
    });
    return allMatches[0];
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
        result.utteranceWord().isStopword()
      ) {
        result = result.clone({ addIndex: 1, addSkipped: 1 });
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
    aliasedWords,
    intentName,
  }) {
    this.utterance = utterance;
    for (const word of this.utterance) {
      if (!(word instanceof Word)) {
        throw new Error(`Unexpected object in utterance: ${word}`);
      }
    }
    this.index = index || 0;
    this.slots = slots || {};
    this.parameters = parameters || {};
    this.capturedWords = capturedWords || 0;
    this.skippedWords = skippedWords || 0;
    this.aliasedWords = aliasedWords || 0;
    this.intentName = intentName || undefined;
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
    let aliasString = "";
    if (this.aliasedWords) {
      aliasString = `, aliasedWords: ${this.aliasedWords}`;
    }
    let intentString = "";
    if (this.intentName) {
      intentString = `, intentName: ${this.intentName}`;
    }
    return `MatchResult(${JSON.stringify(
      s
    )}${slotString}${paramString}${skipString}${aliasString}${intentString}, capturedWords: ${
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

  clone({ addIndex, slots, parameters, addWords, addSkipped, addAliased }) {
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
    if (addAliased) {
      mr.aliasedWords += addAliased;
    }
    return mr;
  }
}
