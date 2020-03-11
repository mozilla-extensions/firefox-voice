/* globals log */

import { PhraseSet } from "./language/matching.js";
import { compile, splitPhraseLines } from "./language/compiler.js";
import { entityTypes } from "./entityTypes.js";

const DEFAULT_INTENT = "search.search";
const DEFAULT_SLOT = "query";

// Populated by registerMatcher:
const INTENTS = {};
const INTENT_NAMES = [];

export function registerMatcher(intentName, matcher) {
  if (initialized) {
    throw new Error(`Late attempt to register intent: ${intentName}`);
  }
  if (INTENTS[intentName]) {
    throw new Error(`Intent ${intentName} has already been registered`);
  }
  INTENT_NAMES.push(intentName);
  INTENT_NAMES.sort();
  INTENTS[intentName] = { matcher };
}

let initialized = false;
let phraseSet;

function initialize() {
  const phrases = [];
  for (const name in INTENTS) {
    const { matcher } = INTENTS[name];
    for (const line of splitPhraseLines(matcher)) {
      const compiled = compile(line, {
        entities: entityTypes,
        intentName: name,
      });
      INTENTS[name].compiledMatcher = compiled;
      phrases.push(compiled);
    }
  }
  phraseSet = new PhraseSet(phrases);
  initialized = true;
}

export function parse(text, disableFallback = false) {
  if (!initialized) {
    initialize();
  }
  const result = phraseSet.match(text);
  if (!result) {
    if (disableFallback) {
      return null;
    }
    log.info(`Parsed as fallback intent: ${JSON.stringify(text)}`);
    return {
      name: DEFAULT_INTENT,
      slots: { [DEFAULT_SLOT]: text },
      parameters: {},
      utterance: text,
      fallback: true,
    };
  }
  return {
    name: result.intentName,
    slots: result.stringSlots(),
    parameters: result.parameters,
    utterance: text,
    fallback: false,
  };
}

export function getIntentNames() {
  return INTENT_NAMES;
}
