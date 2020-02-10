const ALIASES = new Map();
const MULTIWORD_ALIASES = new Map();
for (let line of `
# Each line is first the "proper" word, and a possible alias that could show up and should
# potentially be treated as the proper word
tab app
tab cat
tab tap
tab tech
tab top
on in
next nest
close closest
page webpage
site website
intents intense
intents interns
paste haste
paste taste
paste pace
paste best
downward down ward
upward up ward
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  const [proper, ...alias] = line.split(/\s+/g);
  if (alias.length === 1) {
    if (ALIASES.get(proper)) {
      ALIASES.get(proper).push(alias[0]);
    } else {
      ALIASES.set(proper, [alias[0]]);
    }
  } else if (MULTIWORD_ALIASES.get(proper)) {
    MULTIWORD_ALIASES.get(proper).push(alias);
  } else {
    MULTIWORD_ALIASES.set(proper, [alias]);
  }
}

const STOPWORDS = new Set();
for (let line of `
# Words from https://github.com/NaturalNode/natural/blob/master/lib/natural/util/stopwords.js#L25
a about above after again all also am an and another any are as at
be because been before being below between both but by
came can cannot come could did do does doing during each
few for from further get got has had he have her here him himself his how
if in into is it its itself like make many me might more most much must my myself
never now of on only or other our ours ourselves out over own
said same see should since so some still such
take than that the their theirs them themselves then there these they this those through to too
under until up very was way we well were what where when which while who whom with would why
you your yours yourself
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  for (const word of line.split(/\s+/g)) {
    STOPWORDS.add(word);
  }
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
    this.multiwordAliases = MULTIWORD_ALIASES.get(this.word);
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
  }) {
    this.utterance = utterance;
    this.index = index || 0;
    this.slots = slots || {};
    this.parameters = parameters || {};
    this.capturedWords = capturedWords || 0;
    this.skippedWords = skippedWords || 0;
    this.aliasedWords = aliasedWords || 0;
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
    return `MatchResult(${JSON.stringify(
      s
    )}${slotString}${paramString}${skipString}${aliasString}, capturedWords: ${
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
