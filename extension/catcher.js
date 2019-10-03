/* globals Sentry, buildSettings, catcherAsyncSetup */

this.catcher = (function() {
  const exports = {};
  const hostname = location.hostname;

  // Note Sentry is usually enabled for live builds and disabled for local development
  // to test Sentry locally use FORCE_SENTRY=1 npm start
  const activated = (exports.sentryActivated = !!buildSettings.sentryDsn);

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
      ignoreErrors: ["No matching message handler"],
      beforeSend(event) {
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
      window.SENTRY_DSK = sentryOptions;
      catcherAsyncSetup();
    } else {
      Sentry.init(sentryOptions);
    }
  }

  exports.capture = function(e) {
    if (activated) {
      Sentry.captureException(e);
    }
  };

  install();

  return exports;
})();
