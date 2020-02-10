import { Sequence, Word, MatchResult } from "./textMatching.js";

export function match(string, matchPhrase) {
  const utterance = makeWordList(string);
  const match = new MatchResult({ utterance });
  return matchPhrase.matchUtterance(match);
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
    const matchUtterance = new MatchResult({ utterance });
    for (const matchPhrase of this.matchPhrases) {
      const matches = matchPhrase.matchUtterance(matchUtterance);
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
