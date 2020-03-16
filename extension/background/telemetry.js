/* globals log, buildSettings, catcher */

import * as voiceSchema from "./voiceSchema.js";
import * as main from "./main.js";
import * as settings from "../settings.js";
import * as util from "../util.js";

// These fields will be deleted from the ping if the user has not opted-in
// to this special collection:
const UTTERANCE_FIELDS = [
  "utterance",
  "utteranceDeepSpeech",
  "utteranceParsed",
];

let lastIntentId;
let lastUtterance;
let intentCount;
let lastIntentDate;
let intentDays;

const manifest = browser.runtime.getManifest();

const pingTemplate = {
  extensionVersion: manifest.version,
  extensionInstallationChannel: buildSettings.channel || "unknown",
};

let ping;

function resetPing() {
  ping = Object.assign({}, pingTemplate);
  try {
    ping.extensionTemporaryInstall = main.extensionTemporaryInstall();
  } catch (e) {
    if (!e.message || !e.message.includes("not yet established")) {
      throw e;
    } else {
      log.info(
        "Tried to send Telemetry before temporary installation established"
      );
      catcher.capture(e);
    }
  }
  ping.intentId = util.randomString(10);
  if (ping.extensionTemporaryInstall) {
    ping.extensionInstallationChannel = "web-ext";
  } else {
    ping.extensionInstallationChannel = firstInstallationVersion;
  }
  ping.extensionInstallDate = firstInstallationTimestamp || Date.now();
  ping.localHour = new Date().getHours();
}

export async function add(properties) {
  if (!ping) {
    if (properties.doNotInit) {
      const exc = new Error(
        `Telemetry (${Object.keys(properties)}) added after submission`
      );
      exc.propertiesAdded = Object.keys(properties).join(";");
      throw exc;
    }
    resetPing();
  }
  delete properties.doNotInit;
  for (const name of Object.keys(properties)) {
    const value = properties[name];
    if (value === undefined) {
      delete properties[name];
      continue;
    }
    const payloadProperties = voiceSchema.schema.properties.payload.properties;
    if (!(name in payloadProperties)) {
      throw new Error(`Unexpected ping property: ${name}`);
    }
    let type = payloadProperties[name].type;
    if (type === "integer") {
      type = "number";
    }
    if (typeof value !== type) {
      throw new Error(
        `Invalid type for ping property ${name}: ${typeof value}, expected ${type}`
      );
    }
  }
  Object.assign(ping, properties);
  if (!ping.timestamp) {
    ping.timestamp = Date.now();
  }
  if (!ping.numberOfTabs) {
    const hiddenTabs = await browser.tabs.query({ hidden: true });
    await browser.tabs.query({ currentWindow: true }).then(tabs => {
      if (ping) {
        ping.numberOfTabs = tabs.length - hiddenTabs.length;
      }
    });
  }
}

export function cancelledIntent() {
  add({ inputCancelled: true });
  send();
}

// See https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/webextension-api.html
export function send() {
  if (!ping) {
    throw new Error("Telemetry ping uninitialized");
  }
  if (!ping.inputCancelled) {
    trackIntentMade();
  }
  if (!ping.inputCancelled) {
    lastIntentId = ping.intentId;
    lastUtterance = ping.utterance;
  }
  ping.extensionTemporaryInstall = ping.extensionTemporaryInstall || false;
  const s = settings.getSettings();
  if (!s.disableTelemetry) {
    if (!s.utterancesTelemetry) {
      for (const field of UTTERANCE_FIELDS) {
        delete ping[field];
      }
    }
    ping.wakewordEnabled = s.enableWakeword;
    ping.optInAudio = s.collectAudio;
    ping.optInAcceptanceTime = s.collectTranscriptsOptinAnswered;
    browser.telemetry
      .submitPing("voice", ping, {
        addClientId: true,
        addEnvironment: true,
      })
      .catch(handleTelemetryError);
    log.info("Telemetry ping:", ping);
  } else {
    log.debug("Telemetry ping (unsent):", ping);
  }
  ping = null;
}

export async function sendSoon() {
  await util.sleep(2000);
  return send();
}

export function sendFeedback({ feedback, rating }) {
  const ping = Object.assign(
    {
      intentId: lastIntentId || "unknown",
      timestamp: Date.now(),
      utterance: lastUtterance,
    },
    { feedback, rating }
  );
  ping.feedback = ping.feedback || "";
  log.info("Telemetry feedback ping:", ping);
  browser.telemetry
    .submitPing("voice-feedback", ping, {})
    .catch(handleTelemetryError);
}

let firstInstallationVersion = "unknown";
let firstInstallationTimestamp = null;

export async function initFirstInstallation() {
  let result = await browser.storage.local.get("firstInstallationVersion");
  if (result.firstInstallationVersion) {
    firstInstallationVersion = result.firstInstallationVersion;
  } else {
    firstInstallationVersion = browser.runtime.getManifest().version;
    await browser.storage.local.set({ firstInstallationVersion });
  }
  result = await browser.storage.local.get("firstInstallationTimestamp");
  if (result.firstInstallationTimestamp) {
    firstInstallationTimestamp = result.firstInstallationTimestamp;
  } else {
    firstInstallationTimestamp = Date.now();
    await browser.storage.local.set({ firstInstallationTimestamp });
  }
}

async function init() {
  const result = await browser.storage.local.get([
    "intentCount",
    "intentDays",
    "lastIntentDate",
  ]);
  intentCount = result.intentCount || 0;
  intentDays = result.intentDays || 0;
  lastIntentDate = result.lastIntentDate || null;
}

function trackIntentMade() {
  intentCount += 1;
  const curDate = new Date().toJSON().split("T")[0];
  if (curDate !== lastIntentDate) {
    lastIntentDate = curDate;
    intentDays += 1;
  }
  browser.storage.local.set({
    intentCount,
    intentDays,
    lastIntentDate,
  });
}

function handleTelemetryError(e) {
  log.warn("Error submitting Telemetry:", e);
  catcher.capture(e);
}

export function createSurveyUrl(surveyUrl) {
  const url = new URL(surveyUrl);
  url.searchParams.set(
    "dateFirstInstalled",
    firstInstallationTimestamp
      ? new Date(firstInstallationTimestamp).toISOString()
      : "unknown"
  );
  url.searchParams.set("versionFirstInstalled", firstInstallationVersion);
  url.searchParams.set("extensionVersion", manifest.version);
  url.searchParams.set("timesUsed", String(intentCount));
  url.searchParams.set("daysUsed", String(intentDays));
  return String(url);
}

init();
