import { MatchResult } from "./textMatching.js";

export function match(utterance, matchPhrase) {
  const match = new MatchResult({ utterance });
  return matchPhrase.matchUtterance(match);
}

function cmp(a, b) {
  if (a < b) {
    return 1;
  }
  return a > b ? -1 : 0;
}

export class PhraseSet {
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
