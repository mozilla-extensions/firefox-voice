/* globals Sentry, buildSettings, catcherAsyncSetup */

this.catcher = (function() {
  const exports = {};
  const hostname = location.hostname;

  // Note Sentry is usually enabled for live builds and disabled for local development
  // to test Sentry locally use FORCE_SENTRY=1 npm start
  const activated = (exports.sentryActivated = function() {
    if (!buildSettings.sentryDsn) {
      return false;
    }
    // This duplicates some logic in settings.js but this isn't a module so it's hard to catch
    let value = localStorage.getItem("settings");
    if (!value) {
      return true;
    }
    value = JSON.parse(value);
    return !value.disableTelemetry;
  });

  function fixUrl(u) {
    return u.replace(hostname, "firefox-voice");
  }

  function install() {
    const manifest = browser.runtime.getManifest();
    if (!buildSettings.sentryDsn) {
      return;
    }
    const sentryOptions = {
      url: "/js/vendor/sentry.js",
      dsn: buildSettings.sentryDsn,
      release: manifest.version,
      environment: buildSettings.channel,
      tags: {
        git_commit: buildSettings.gitCommit,
      },
      ignoreErrors: [
        // This happens when the popup is closed or something that might receive a message instead is
        // gone, which happens regularly and is generally harmless:
        "No matching message handler",
        // Another common error when something is closed mid-communication:
        "Could not establish connection. Receiving end does not exist.",
        // The speaktome server gives these for any audio without speech:
        /Failed response from server: 500/,
      ],
      beforeSend(event) {
        const error = event.exception;
        if (
          error &&
          error.values &&
          error.values.length &&
          error.values[0].value.match(/Invalid Tab ID/i)
        ) {
          // These exceptions contain the Tab ID, which messes up the fingerprint
          event.fingerprint = ["Invalid Tab ID"];
        }
        event.request.url = fixUrl(event.request.url);
        for (const exc of event.exception.values) {
          if (exc.stacktrace && exc.stacktrace.frames) {
            for (const frame of exc.stacktrace.frames) {
              frame.filename = fixUrl(frame.filename);
            }
            // FIXME: This may or may not be useful:
            /*
            exc.stacktrace.frames = exc.stacktrace.frames.filter(f => {
              return !f.filename.endsWith("catcher.js");
            });
            */
          }
        }
        return event;
      },
    };
    if (typeof Sentry === "undefined") {
      window.SENTRY_SDK = sentryOptions;
      catcherAsyncSetup();
    } else {
      Sentry.init(sentryOptions);
    }
  }

  exports.capture = function(e) {
    if (activated()) {
      Sentry.captureException(e);
    }
  };

  /* See: https://docs.sentry.io/enriching-error-data/breadcrumbs/?platform=browser */
  exports.addBreadcrumb = function(args) {
    if (typeof Sentry === "undefined") {
      return;
    }
    Sentry.addBreadcrumb(args);
  };

  exports.setTag = function(name, value) {
    if (typeof Sentry === "undefined") {
      return;
    }
    Sentry.setTag(name, value);
  };

  install();

  return exports;
})();
