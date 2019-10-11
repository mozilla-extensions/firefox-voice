/* globals intentRunner */

this.intentExamples = (function() {
  const exports = {};

  const INTENT_ROTATION_PERIOD = 1000 * 60 * 5; // 5 minutes

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

  exports.getExamples = function(number) {
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
  };

  function freshExamples(number) {
    let intentNames = Object.keys(intentRunner.intents);
    intentNames = intentNames.filter(n => intentRunner.intents[n].examples);
    intentNames = shuffled(intentNames);
    const result = [];
    for (let i = 0; i < number; i++) {
      let examples = intentRunner.intents[intentNames[i]].examples;
      if (typeof examples === "function") {
        examples = intentRunner.intents[intentNames[i]].examples();
      }
      result.push(pick(examples));
    }
    return result;
  }

  return exports;
})();
