/* globals voiceSchema, main, util, log, buildSettings, catcher, settings */

this.telemetry = (function() {
  const exports = {};

  // These fields will be deleted from the ping if the user has not opted-in
  // to this special collection:
  const UTTERANCE_FIELDS = [
    "utterance",
    "utteranceDeepSpeech",
    "utteranceParsed",
  ];

  let lastIntentId;
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
    ping.extensionInstallDate = firstInstallationTimestamp;
    ping.localHour = new Date().getHours();
  }

  exports.add = function(properties) {
    if (!ping) {
      if (properties.doNotInit) {
        throw new Error("Telemetry added after submission");
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
      const payloadProperties = voiceSchema.properties.payload.properties;
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
  };

  exports.cancelledIntent = function() {
    exports.add({ inputCancelled: true });
    exports.send();
  };

  // See https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/webextension-api.html
  exports.send = function() {
    if (!ping) {
      throw new Error("Telemetry ping uninitialized");
    }
    if (!ping.inputCancelled) {
      trackIntentMade();
    }
    if (!ping.inputCancelled) {
      lastIntentId = ping.intentId;
    }
    const s = settings.getSettings();
    if (!s.disableTelemetry) {
      if (!s.utterancesTelemetry) {
        for (const field of UTTERANCE_FIELDS) {
          delete ping[field];
        }
      }
      browser.telemetry.submitPing("voice", ping, {
        addClientId: true,
        addEnvironment: true,
      });
      log.info("Telemetry ping:", ping);
    } else {
      log.debug("Telemetry ping (unsent):", ping);
    }
    ping = null;
  };

  exports.sendSoon = async function() {
    await util.sleep(1000);
    return exports.send();
  };

  exports.sendFeedback = function({ feedback, rating }) {
    const ping = Object.assign(
      { intentId: lastIntentId || "unknown", timestamp: Date.now() },
      { feedback, rating }
    );
    ping.feedback = ping.feedback || "";
    log.info("Telemetry feedback ping:", ping);
    browser.telemetry.submitPing("voice-feedback", ping, {});
  };

  let firstInstallationVersion = "unknown";
  let firstInstallationTimestamp = null;

  exports.initFirstInstallation = async function() {
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
  };

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

  exports.createSurveyUrl = function(surveyUrl) {
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
  };

  init();

  return exports;
})();
