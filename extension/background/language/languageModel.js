import { Sequence, Word, MatchResult } from "./textMatching.js";

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

function cmp(a, b) {
  if (a < b) {
    return 1;
  }
  return a > b ? -1 : 0;
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
