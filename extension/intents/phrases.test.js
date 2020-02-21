/* globals test, expect */

const { metadata } = require("./metadata.js");
const { entityTypes } = require("../background/entityTypes.js");
const { PhraseSet } = require("../background/language/matching.js");
const {
  compile,
  splitPhraseLines,
} = require("../background/language/compiler.js");

const intents = {};
const phrases = [];
for (const category in metadata) {
  for (const subname in metadata[category]) {
    const data = metadata[category][subname];
    const intentName = `${category}.${subname}`;
    intents[intentName] = data;
    for (const line of splitPhraseLines(data.match)) {
      const compiled = compile(line, { entities: entityTypes, intentName });
      phrases.push(compiled);
    }
  }
}
const phraseSet = new PhraseSet(phrases);

for (const intentName in intents) {
  const intent = intents[intentName];
  let examples = intent.examples || intent.example || [];
  examples = examples.filter(e => !e.noTest);
  if (!examples || !examples.length) {
    continue;
  }
  test(`test phrases for ${intentName}`, () => {
    for (const example of examples) {
      let result = phraseSet.match(example.phrase);
      if (!result) {
        if (intentName === "search.search") {
          result = {
            name: "search.search",
            slots: { query: example.phrase },
            parameters: {},
            utterance: example.phrase,
            fallback: true,
          };
        } else {
          throw new Error(
            `Phrase "${example.phrase}" (from ${intentName}) doesn't match anything`
          );
        }
      } else {
        result = {
          name: result.intentName,
          slots: result.stringSlots(),
          parameters: result.parameters,
          utterance: example.phrase,
          fallback: false,
        };
      }
      const expected = {
        name: intentName,
        utterance: example.phrase,
      };
      if (example.expectSlots) {
        expected.slots = example.expectSlots;
      }
      if (example.expectParameters) {
        expected.parameters = example.expectParameters;
      }
      expect(result).toMatchObject(expected);
    }
  });
}
