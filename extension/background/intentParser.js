/* globals log */

import { PhraseSet } from "./language/matching.js";
import {
  compile,
  convertEntities,
  splitPhraseLines,
} from "./language/compiler.js";
import * as serviceList from "./serviceList.js";
import * as languages from "./languages.js";

const DEFAULT_INTENT = "search.search";
const DEFAULT_SLOT = "query";

/*
Matcher syntax:

  "plain text (alt|text) [slot]"

Spaces separate words, but spaces don't matter too much. Slots are all wildcards.

You can use `[slot:slotType]` to create a slot that must be of a certain types (types are in ENTITY_MAP)

You can use `[parameter=value]` to set a parameter on any matches for this one item. This does not capture anything.

You can use `noun{s}` to match both `noun` and `nouns`.
*/

export const ENTITY_TYPES = {
  serviceName: serviceList.allServiceNames(),
  musicServiceName: serviceList.musicServiceNames(),
  lang: languages.languageNames(),
  smallNumber: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ],
};

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
  const entities = convertEntities(ENTITY_TYPES);
  const phrases = [];
  for (const name in INTENTS) {
    const { matcher } = INTENTS[name];
    for (const line of splitPhraseLines(matcher)) {
      const compiled = compile(line, { entities, intentName: name });
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
