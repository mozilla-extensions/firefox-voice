/* globals log, intentParser, telemetry, catcher, searching, browserUtil */
// This gets used elsewhere as a namespace for the intent modules:
this.intents = {};

this.intentRunner = (function() {
  const exports = {};

  const FEEDBACK_INTENT_TIME_LIMIT = 1000 * 60 * 60 * 24; // 24 hours

  const intents = (exports.intents = {});
  let lastIntent;

  class IntentContext {
    constructor(desc) {
      this.closePopupOnFinish = true;
      this.timestamp = Date.now();
      Object.assign(this, desc);
    }

    keepPopup() {
      this.closePopupOnFinish = false;
    }

    done(time = undefined) {
      this.closePopupOnFinish = false;
      return browser.runtime.sendMessage({
        type: "closePopup",
        time,
      });
    }

    failed(message) {
      telemetry.add({ intentSuccess: false });
      telemetry.sendSoon();
      try {
        this.onError(message);
      } catch (e) {
        log.error("Error in onError handler:", e);
      }
      return browser.runtime.sendMessage({
        type: "displayFailure",
        message,
      });
    }

    displayText(message) {
      return browser.runtime.sendMessage({ type: "displayText", message });
    }

    async failedAutoplay(tab) {
      this.keepPopup();
      this.makeTabActive(tab);
      await browser.runtime.sendMessage({ type: "displayAutoplayFailure" });
    }

    /** This is some ad hoc information this specific intent wants to add */
    addExtraTelemetryData(intentExtraData) {
      telemetry.add({ intentExtraData });
    }

    addTelemetryServiceName(intentServiceName) {
      telemetry.add({ intentServiceName });
    }

    initTelemetry() {
      telemetry.add({
        inputLength: this.utterance.length,
        intent: this.name,
        intentCategory: this.name.split(".")[0],
        intentFallback: this.fallback,
        intentParseSuccess: !this.fallback,
        intentSuccess: true,
        utterance: this.utterance,
        utteranceChars: this.utterance.length,
        utteranceParsed: { slots: this.slots },
      });
    }

    async createTab(options) {
      return browserUtil.createTab(options);
    }

    async createTabGoogleLucky(query) {
      const searchUrl = searching.googleSearchUrl(query, true);
      const tab = await this.createTab({ url: searchUrl });
      return new Promise((resolve, reject) => {
        function onUpdated(tabId, changeInfo, tab) {
          const url = tab.url;
          if (url.startsWith("about:blank")) {
            return;
          }
          const isGoogle = /^https:\/\/www.google.com\//.test(tab.url);
          const isRedirect = /^https:\/\/www.google.com\/url\?/.test(url);
          if (!isGoogle || isRedirect) {
            if (isRedirect) {
              // This is a URL redirect:
              const params = new URL(url).searchParams;
              const newUrl = params.get("q");
              browser.tabs.update(tab.id, { url: newUrl });
            }
            // We no longer need to listen for updates:
            browser.tabs.onUpdated.removeListener(onUpdated, { tabId: tab.id });
            resolve(tab);
          }
        }
        try {
          browser.tabs.onUpdated.addListener(onUpdated, { tabId: tab.id });
        } catch (e) {
          throw new Error(
            `Error in tabs.onUpdated: ${e}, onUpdated type: ${typeof onUpdated}, args: tabId: ${
              tab.id
            } is ${typeof tab.id}`
          );
        }
      });
    }

    activeTab() {
      return browserUtil.activeTab();
    }

    makeTabActive(tab) {
      return browserUtil.makeTabActive(tab);
    }

    onError(message) {
      // Can be overridden
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
    intentParser.registerMatcher(intent.name, intent.match);
  };

  exports.runIntent = async function(desc) {
    catcher.setTag("intent", desc.name);
    if (!intents[desc.name]) {
      throw new Error(`No intent found with name ${desc.name}`);
    }
    const intent = intents[desc.name];
    const context = new IntentContext(desc);
    lastIntent = context;
    context.initTelemetry();
    try {
      log.info(
        `Running intent ${desc.name}`,
        Object.keys(desc.slots).length
          ? `with slots: ${JSON.stringify(desc.slots)}`
          : "with no slots",
        Object.keys(desc.parameters).length
          ? `and parameters: ${JSON.stringify(desc.parameters)}`
          : "and no params"
      );
      await intent.run(context);
      if (context.closePopupOnFinish) {
        context.done();
      }
      // FIXME: this isn't necessarily the right time to send the ping, if the intent
      // isn't actually complete:
      telemetry.sendSoon();
    } catch (e) {
      const display = e.displayMessage || `Internal error: ${e}`;
      context.failed(display);
      if (e.displayMessage) {
        log.info(
          "Expected error in intent",
          desc.name,
          ":",
          String(e),
          e.stack
        );
      } else {
        log.error("Error in intent", desc.name, ":", String(e), e.stack);
        catcher.capture(e);
      }
    }
  };

  exports.getIntentSummary = function() {
    const names = intentParser.getIntentNames();
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
          parameters: m.parameters,
        };
      });
      if (intent.examples) {
        intent.examples = intent.examples.map(e => {
          const toMatch = e.replace(/^test:/, "").replace(/[()]/g, "");
          const parsed = intentParser.parse(
            toMatch,
            // Allow fallback for search.search, but not otherwise:
            name !== "search.search"
          ) || {
            name: "NO MATCH",
            slots: {},
          };
          return {
            parsedIntent: parsed.name,
            text: e,
            slots: parsed.slots,
            parameters: parsed.parameters,
          };
        });
      }
      return intent;
    });
  };

  exports.getLastIntentForFeedback = function() {
    if (!lastIntent) {
      return null;
    }
    if (Date.now() - lastIntent.timestamp > FEEDBACK_INTENT_TIME_LIMIT) {
      lastIntent = null;
      return null;
    }
    return lastIntent;
  };

  exports.clearFeedbackIntent = function() {
    lastIntent = null;
  };

  return exports;
})();
