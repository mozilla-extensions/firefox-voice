/*
Matches an utterance against a series of phrases.

Implements match prioritization: choosing the match that makes the least use of
wildcards. For equal number of wildcards, chooses the match with the least
skipped stopwords. For equal number of both, the match that uses the least alias
substitutions.
*/
import { MatchResult } from "./textMatching.js";

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
