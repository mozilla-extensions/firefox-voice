/* globals log, catcher, buildSettings */

import * as intentParser from "./intentParser.js";
import * as telemetry from "./telemetry.js";
import * as searching from "../searching.js";
import * as browserUtil from "../browserUtil.js";
import { PhraseSet } from "./language/matching.js";
import { compile, splitPhraseLines } from "./language/compiler.js";
import { metadata } from "../intents/metadata.js";
import { entityTypes } from "./entityTypes.js";
import { Database } from "../history.js";
import * as settings from "../settings.js";
const FEEDBACK_INTENT_TIME_LIMIT = 1000 * 60 * 60 * 24; // 24 hours
// Only keep this many previous intents:
const INTENT_HISTORY_LIMIT = 20;
const METADATA_ATTRIBUTES = new Set([
  "description",
  "example",
  "examples",
  "match",
  "followup",
]);

export const intents = {};
let lastIntent;
// This is a copy of lastIntent that gets nullified when the pop up
// window closes.
let lastIntentForFollowup;
let globalListenForFollowup = settings.getSettings().listenForFollowup;
const intentHistory = [];
const db = new Database("voice");
const utteranceTable = "utterance";
const primaryKey = "timestamp";
const voiceVersion = 1;
db.createTable(utteranceTable, primaryKey, voiceVersion)
  .then(result => log.info("CREATE TABLE:", result))
  .catch(error => log.error(error));

settings.watch("listenForFollowup", ns => {
  globalListenForFollowup = ns;
});

export class IntentContext {
  constructor(desc) {
    this.closePopupOnFinish = true;
    this.timestamp = Date.now();
    this.expectsFollowup = false;
    this.isFollowup = false;
    this.isFollowupIntent = false;
    this.insistOnFollowup = false;
    // allows us to reuse an intent's text on retries
    this.followupHint = {};
    // When running follow ups, sometimes a success view is not needed,
    // yet still flashes before the next view. This attribute allows us to
    // force bypassing the success view.
    this.skipSuccessView = false;
    this.acceptFollowupIntent = [];
    Object.assign(this, desc);
  }

  clone() {
    const c = new IntentContext(this);
    c.timestamp = Date.now();
    c.closePopupOnFinish = true;
    return c;
  }

  keepPopup() {
    this.closePopupOnFinish = false;
  }

  done(time = undefined) {
    this.closePopupOnFinish = false;
    if (!this.noPopup && !this.isFollowup && !this.isFollowupIntent) {
      return browser.runtime.sendMessage({
        type: "closePopup",
        time,
      });
    }
    return null;
  }

  failed(message) {
    this.skipSuccessView = true;
    telemetry.add({ intentSuccess: false });
    telemetry.sendSoon();
    try {
      this.onError(message);
    } catch (e) {
      log.error("Error in onError handler:", e);
    }
    if (this.noPopup) {
      return this.displayInlineMessage({ message, type: "error" });
    }
    return browser.runtime.sendMessage({
      type: "displayFailure",
      message,
    });
  }

  savingPage(message) {
    if (message === "startSavingPage") {
      return browser.runtime.sendMessage({
        type: "startSavingPage",
        message,
      });
    }
    return browser.runtime.sendMessage({
      type: "endSavingPage",
      message,
    });
  }

  async startFollowup(message = undefined) {
    this.expectsFollowup = true;
    if (message) {
      this.acceptFollowupIntent = message.acceptFollowupIntent || [];
      this.skipSuccessView = message.skipSuccessView || false;
      this.insistOnFollowup = message.insistOnFollowup || false;
      this.followupHint = {
        heading: message.heading,
        subheading: message.subheading,
      };
    }
    return browser.runtime.sendMessage({
      type: "handleFollowup",
      method: "enable",
      message: {
        heading: this.followupHint.heading,
        subheading: this.followupHint.subheading,
      },
    });
  }

  async endFollowup() {
    this.expectsFollowup = false;
    browser.runtime.sendMessage({
      type: "handleFollowup",
      method: "disable",
    });
  }

  parseFollowup(utterance) {
    if (!lastIntentForFollowup || !lastIntentForFollowup.followupMatch) {
      return null;
    }
    if (!this.followupPhraseSet) {
      const phrases = [];
      for (const line of splitPhraseLines(
        lastIntentForFollowup.followupMatch
      )) {
        const compiled = compile(line, {
          entities: entityTypes,
          intentName: lastIntentForFollowup.name,
        });
        phrases.push(compiled);
      }
      this.followupPhraseSet = new PhraseSet(phrases);
    }

    const result = this.followupPhraseSet.match(utterance);
    if (!result) {
      return null;
    }

    return {
      name: result.intentName,
      slots: result.stringSlots(),
      parameters: result.parameters,
      utterance,
      fallback: false,
      isFollowup: true,
    };
  }

  displayText(message) {
    if (this.noPopup) {
      return this.displayInlineMessage({ message, type: "normal" });
    }
    return browser.runtime.sendMessage({ type: "displayText", message });
  }

  displayInlineMessage({ message, type }) {
    // FIXME: actually inject something and display a message
    window.alert(message);
  }

  async failedAutoplay(tab) {
    this.keepPopup();
    this.makeTabActive(tab);
    if (this.noPopup) {
      // FIXME: improve error message:
      await this.displayInlineMessage({
        message: "You must enable autoplay",
        type: "error",
      });
      return;
    }
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
    const tab = await browserUtil.createTab(options);
    await browserUtil.loadUrl(tab.id, options.url);
    return tab;
  }

  async openOrFocusTab(url) {
    const tabs = await browser.tabs.query({ url, currentWindow: true });
    if (tabs.length) {
      await this.makeTabActive(tabs[0]);
    } else {
      await this.createTab({ url });
    }
  }

  async createTabGoogleLucky(query, options = {}) {
    const searchUrl = searching.googleSearchUrl(query, true);
    const tab =
      !!options.openInTabId && options.openInTabId > -1
        ? await browserUtil.loadUrl(options.openInTabId, searchUrl)
        : await this.createTab({ url: searchUrl });
    if (options.hide && !buildSettings.android) {
      await browser.tabs.hide(tab.id);
    }
    return new Promise((resolve, reject) => {
      let forceRedirecting = false;
      function onUpdated(tabId, changeInfo, tab) {
        const url = tab.url;
        if (
          url.startsWith("about:blank") ||
          (buildSettings.executeIntentUrl &&
            url.startsWith(buildSettings.executeIntentUrl))
        ) {
          return;
        }
        const isGoogle = /^https:\/\/www.google.com\//.test(url);
        const isRedirect = /^https:\/\/www.google.com\/url\?/.test(url);
        if (!isGoogle || isRedirect) {
          if (isRedirect) {
            if (forceRedirecting) {
              // We're already sending the user to the new URL
              return;
            }
            // This is a URL redirect:
            const params = new URL(url).searchParams;
            const newUrl = params.get("q");
            forceRedirecting = true;
            browser.tabs.update(tab.id, { url: newUrl });
            return;
          }
          // We no longer need to listen for updates:
          browserUtil.onUpdatedRemove(onUpdated, tab.id);
          resolve(tab);
        }
      }
      try {
        browserUtil.onUpdatedListen(onUpdated, tab.id);
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

export function registerIntent(intent) {
  if (intents[intent.name]) {
    throw new Error(`Attempt to reregister intent: ${intent.name}`);
  }
  const parts = intent.name.split(".");
  if (parts.length !== 2) {
    throw new Error(`Intent ${intent.name} should be named like X.Y`);
  }
  if (!metadata[parts[0]] || !metadata[parts[0]][parts[1]]) {
    throw new Error(`No ${parts[0]}.toml metadata for ${intent.name}`);
  }
  const data = metadata[parts[0]][parts[1]];
  // Pluralize the examples:
  if (data.example) {
    data.examples = data.example;
    delete data.example;
  }
  for (const attr in data) {
    if (attr in intent) {
      throw new Error(
        `Metadata for ${intent.name} contains attribute ${attr} that is also in intent object`
      );
    }
    if (!METADATA_ATTRIBUTES.has(attr)) {
      throw new Error(
        `Metadata for ${intent.name} contains illegal attribute ${attr}`
      );
    }
  }
  if (data.followup) {
    data.followupMatch = data.followup.match;
    delete data.followup;
  }
  Object.assign(intent, data);
  intents[intent.name] = intent;
  if (!intent.match) {
    throw new Error(`Intent missing .match: ${intent.name}`);
  }
  intentParser.registerMatcher(intent.name, intent.match);
}

export async function runUtterance(utterance, noPopup) {
  for (const name in registeredNicknames) {
    const re = new RegExp(`\\b${name}\\b`, "i");
    if (re.test(utterance)) {
      const repl = utterance.replace(re, "nickname");
      const context = registeredNicknames[name].clone();
      const handler = intents[context.name];
      const method =
        handler.runNickname ||
        async function(repl, context, utterance) {
          if (repl === "nickname") {
            await runIntent(context);
            return true;
          }
          return false;
        };
      const result = await method.call(handler, repl, context, utterance);
      if (result) {
        // It was handled
        return null;
      }
    }
  }
  let desc = intentParser.parse(utterance);
  desc.noPopup = !!noPopup;
  desc.followupMatch = intents[desc.name].followupMatch;
  if (lastIntentForFollowup && lastIntentForFollowup.expectsFollowup) {
    const followup = lastIntentForFollowup.parseFollowup(utterance);
    if (followup) {
      desc = followup;
    } else if (
      lastIntentForFollowup.acceptFollowupIntent &&
      lastIntentForFollowup.acceptFollowupIntent.includes(desc.name)
    ) {
      desc.isFollowupIntent = true;
    } else if (
      !globalListenForFollowup ||
      (globalListenForFollowup && lastIntentForFollowup.insistOnFollowup)
    ) {
      lastIntentForFollowup.failed(
        `The phrase\n\n"${desc.utterance}"\n\nis invalid. Please try again`
      );
      return lastIntentForFollowup.startFollowup();
    } else {
      // This is a new intent when listening for all follow ups, so we
      // clear previous follow up hints
      lastIntentForFollowup.endFollowup();
    }
  }
  return runIntent(desc);
}

export async function runIntent(desc) {
  catcher.setTag("intent", desc.name);
  if (!intents[desc.name]) {
    throw new Error(`No intent found with name ${desc.name}`);
  }
  const intent = intents[desc.name];
  const context = new IntentContext(desc);
  lastIntent = context;
  lastIntentForFollowup = lastIntent;
  addIntentHistory(context);
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
    if (lastIntent.isFollowup) {
      await intent.runFollowup(context);
    } else {
      await intent.run(context);
    }
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
      log.info("Expected error in intent", desc.name, ":", String(e), e.stack);
    } else {
      log.error("Error in intent", desc.name, ":", String(e), e.stack);
      catcher.capture(e);
    }
  }
}

export function getIntentSummary() {
  const names = intentParser.getIntentNames();
  return names.map(name => {
    const intent = Object.assign({}, intents[name]);
    delete intent.run;
    const matchSet = new PhraseSet(
      splitPhraseLines(intent.match).map(line =>
        compile(line, { entities: entityTypes, intentName: name })
      )
    );
    const matchers = matchSet.matchPhrases;
    intent.matchSource = intent.match;
    intent.matchers = matchers.map(m => {
      return {
        phrase: m.originalSource,
        compiledPhrase: m.toString(),
        slots: [...m.slotNames().values()],
        parameters: m.parameters,
      };
    });
    delete intent.match;
    if (intent.examples) {
      intent.examples = intent.examples.map(e => {
        const toMatch = e.phrase;
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
}

function addIntentHistory(context) {
  intentHistory.push(context);
  intentHistory.splice(0, intentHistory.length - INTENT_HISTORY_LIMIT);
  db.add(utteranceTable, context).catch(error => log.error(error));
}

export function getIntentHistory() {
  return intentHistory;
}

const registeredNicknames = {};

export function registerNickname(name, context) {
  name = name.toLowerCase();
  if (!context) {
    delete registeredNicknames[name];
    log.info("Removed nickname", name);
  } else {
    registeredNicknames[name] = context;
    log.info("Added nickname", name, "->", context.name, context.slots);
  }
  browser.storage.sync.set({ registeredNicknames });
}

async function initRegisteredNicknames() {
  const result = await browser.storage.sync.get(["registeredNicknames"]);
  if (result.registeredNicknames) {
    for (const name in result.registeredNicknames) {
      const value = result.registeredNicknames[name];
      const context = new IntentContext(value);
      registeredNicknames[name] = context;
      log.info("Loaded nickname", name, context.name, context.slots);
    }
  }
}

export function getRegisteredNicknames() {
  return registeredNicknames;
}

export function getLastIntentForFeedback() {
  if (!lastIntent) {
    return null;
  }
  if (Date.now() - lastIntent.timestamp > FEEDBACK_INTENT_TIME_LIMIT) {
    lastIntent = null;
    return null;
  }
  return lastIntent;
}

export function clearFeedbackIntent() {
  lastIntent = null;
}

export function clearFollowup() {
  if (lastIntentForFollowup) {
    lastIntentForFollowup = null;
  }
}

initRegisteredNicknames();
