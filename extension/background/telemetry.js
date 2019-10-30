/* globals voiceSchema, main, util, log, buildSettings, catcher */

this.telemetry = (function() {
  const exports = {};

  let lastIntentId;

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
  }

  exports.add = function(properties) {
    if (!ping) {
      resetPing();
    }
    for (const name in properties) {
      const value = properties[name];
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
      lastIntentId = ping.intentId;
    }
    browser.telemetry.submitPing("voice", ping, {
      addClientId: true,
      addEnvironment: true,
    });
    log.info("Telemetry ping:", ping);
    ping = null;
  };

  exports.sendSoon = async function() {
    await util.sleep(1000);
    return exports.send();
  };

  exports.addFeedback = function({ feedback, rating }) {
    const ping = Object.assign(
      { intentId: lastIntentId, timestamp: Date.now() },
      { feedback, rating }
    );
    browser.telemetry.sendPing("voice-feedback", ping, {});
  };

  let firstInstallationVersion = "unknown";

  exports.initFirstInstallationVersion = async function() {
    const result = await browser.storage.local.get("firstInstallationVersion");
    if (result.firstInstallationVersion) {
      firstInstallationVersion = result.firstInstallationVersion;
    } else {
      firstInstallationVersion = browser.runtime.getManifest().version;
      await browser.storage.local.set({ firstInstallationVersion });
    }
  };

  return exports;
})();
