/* globals log, intentParser */
// This gets used elsewhere as a namespace for the intent modules:
this.intents = {};

this.intentRunner = (function() {
  const exports = {};

  const intents = (exports.intents = {});

  class IntentContext {
    constructor(desc) {
      this.closePopupOnFinish = true;
      Object.assign(this, desc);
    }

    keepPopup() {
      this.closePopupOnFinish = false;
    }

    done() {
      this.closePopupOnFinish = false;
      return browser.runtime.sendMessage({
        type: "closePopup",
      });
    }

    failed(message) {
      return browser.runtime.sendMessage({
        type: "displayFailure",
        message,
      });
    }
  }

  exports.registerIntent = function(intent) {
    if (intents[intent.name]) {
      throw new Error(`Attempt to reregister intent: ${intent.name}`);
    }
    intents[intent.name] = intent;
    if (!intent.match) {
      throw new Error(`Intent missing .match: ${intent.name}`);
    }
    intentParser.registerMatcher(
      intent.name,
      intent.match,
      intent.priority || ""
    );
  };

  exports.runIntent = async function(desc) {
    if (!intents[desc.name]) {
      throw new Error(`No intent found with name ${desc.name}`);
    }
    const intent = intents[desc.name];
    const context = new IntentContext(desc);
    try {
      log.info(
        `Running intent ${desc.name}`,
        Object.keys(desc.slots).length
          ? `with slots: ${JSON.stringify(desc.slots)}`
          : "with no slots"
      );
      await intent.run(context);
      if (context.closePopupOnFinish) {
        context.done();
      }
    } catch (e) {
      context.failed(`Internal error: ${e}`);
    }
  };

  exports.getIntentSummary = function() {
    const names = intentParser.getNamesByPriority();
    return names.map(name => {
      const intent = Object.assign({}, intents[name]);
      delete intent.run;
      const matchSet =
        typeof intent.match === "string"
          ? new intentParser.MatchSet(intent.match)
          : intent.match;
      const matchers = matchSet.getMatchers();
      delete intent.match;
      intent.matchers = matchers.map(m => {
        return {
          phrase: m.phrase,
          slots: m.slots,
          regex: String(m.regex),
        };
      });
      if (intent.examples) {
        intent.examples = intent.examples.map(e => {
          const parsed = intentParser.parse(e, true) || {
            name: "NO MATCH",
            slots: {},
          };
          return {
            parsedIntent: parsed.name,
            text: e,
            slots: parsed.slots,
          };
        });
      }
      return intent;
    });
  };

  return exports;
})();
