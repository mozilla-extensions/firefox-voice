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

    this.numberNames = [];
    this._nameToNumberMap = new Map();
    for (const numeralKind in data.numbers) {
      for (const numberName in data.numbers[numeralKind]) {
        const value = data.numbers[numeralKind][numberName];
        if (typeof value !== "number") {
          throw new Error(`Expected ${numberName} = ${value} to be a number`);
        }
        this._nameToNumberMap.set(numberName, value);
        this.numberNames.push(numberName);
      }
    }
  }

  nameToNumber(name) {
    if (name && /^\d+$/.test(name)) {
      // It's a literal number
      return parseInt(name, 10);
    }
    name = name.toLowerCase();
    if (this._nameToNumberMap.has(name)) {
      return this._nameToNumberMap.get(name);
    }
    throw new Error(`Unknown number: ${name}`);
  }
}
