/* eslint-disable no-console */
const { metadata } = require("../extension/intents/metadata.js");
const { entityTypes } = require("../extension/background/entityTypes.js");
const {
  compile,
  splitPhraseLines,
} = require("../extension/language/compiler.js");

const args = process.argv.slice(2);

function includeIntent(category, subname) {
  if (!args.length) {
    return true;
  }
  const s = `${category}.${subname}`;
  for (const arg of args) {
    if (s.startsWith(arg) || s.endsWith(arg)) {
      return true;
    }
  }
  return false;
}

const phrases = [];

for (const category in metadata) {
  for (const subname in metadata[category]) {
    if (!includeIntent(category, subname)) {
      continue;
    }
    const data = metadata[category][subname];
    for (const line of splitPhraseLines(data.match)) {
      const compiled = compile(line, { entities: entityTypes });
      phrases.push(compiled);
    }
  }
}

if (!phrases.length) {
  console.log("# No intents match arguments");
}

function filler(slotName, pattern, defaultWords) {
  if (defaultWords.length) {
    return defaultWords;
  }
  return [[slotName.toUpperCase()]];
}

const seen = new Set();

for (const compiledPhrase of phrases) {
  console.log("#", compiledPhrase.toSource());
  for (const words of compiledPhrase.enumeratePhrases(filler)) {
    const phrase = words.join(" ");
    if (seen.has(phrase)) {
      continue;
    }
    seen.add(phrase);
    console.log(phrase);
  }
}
