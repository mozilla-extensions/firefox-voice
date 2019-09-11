/* globals voiceSchema, main, util, log */

this.telemetry = (function() {
  const exports = {};

  let lastIntentId;

  const manifest = browser.runtime.getManifest();

  const pingTemplate = {
    extensionVersion: manifest.version,
    extensionInstallationChannel: manifest.settings.channel || "unknown",
  };

  let ping;

  function resetPing() {
    ping = Object.assign({}, pingTemplate);
    ping.extensionTemporaryInstall = main.extensionTemporaryInstall();
    ping.intentId = util.randomString(10);
    if (ping.extensionTemporaryInstall) {
      ping.extensionInstallationChannel = "web-ext";
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

  exports.addFeedback = function({ feedback, rating }) {
    const ping = Object.assign(
      { intentId: lastIntentId, timestamp: Date.now() },
      { feedback, rating }
    );
    browser.telemetry.sendPing("voice-feedback", ping, {});
  };

  return exports;
})();
