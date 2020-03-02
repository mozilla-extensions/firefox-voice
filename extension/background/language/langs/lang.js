export class Language {
  constructor(data) {
    this.aliases = new Map();
    this.multiwordAliases = new Map();
    this.stopwords = new Set();
    for (const word of data.stopwords) {
      this.stopwords.add(word);
    }
    for (const badWord in data.aliases) {
      const goodWord = data.aliases[badWord];
      if (badWord.includes(" ")) {
        const badWords = badWord.split(/\s+/g);
        this.multiwordAliases.set(
          goodWord,
          (this.multiwordAliases.get(goodWord) || []).concat([badWords])
        );
      } else {
        this.aliases.set(
          goodWord,
          (this.aliases.get(goodWord) || []).concat([badWord])
        );
      }
    }
  }
}
