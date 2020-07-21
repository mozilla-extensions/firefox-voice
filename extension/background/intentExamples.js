import * as intentRunner from "./intentRunner.js";
import { registerHandler } from "../communicate.js";

const INTENT_ROTATION_PERIOD = 1000 * 60 * 5; // 5 minutes
// This gets filled later:
let INTENT_EXAMPLES = null;

let lastExamples;
let lastExampleTime = 0;

function shuffled(array) {
  const withRandom = array.map(i => [Math.random(), i]);
  withRandom.sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const result = withRandom.map(i => i[1]);
  return result;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getAllExamples() {
  if (INTENT_EXAMPLES === null) {
    INTENT_EXAMPLES = {};
    for (const intentName in intentRunner.intents) {
      const intent = intentRunner.intents[intentName];
      const examples = intent.examples;
      if (!examples) {
        continue;
      }
      for (const example of examples) {
        if (example.test) {
          continue;
        }
        if (!INTENT_EXAMPLES[intentName]) {
          INTENT_EXAMPLES[intentName] = [];
        }
        INTENT_EXAMPLES[intentName].push(example.phrase);
      }
    }
  }
  return INTENT_EXAMPLES;
}

export function getExamples(number) {
  if (
    lastExamples &&
    Date.now() - lastExampleTime < INTENT_ROTATION_PERIOD &&
    lastExamples.length === number
  ) {
    return lastExamples;
  }
  lastExamples = freshExamples(number);
  lastExampleTime = Date.now();
  return lastExamples;
}

registerHandler("getExamples", message => {
  return getExamples(message.number || 2);
});

function freshExamples(number) {
  const examplesByIntent = getAllExamples();
  const intentNames = shuffled(Object.keys(examplesByIntent));
  const result = [];
  for (let i = 0; i < number; i++) {
    result.push(pick(examplesByIntent[intentNames[i]]));
  }
  return result;
}
