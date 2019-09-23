/* globals Sentry, buildSettings */

this.catcher = (function() {
  const exports = {};
  const hostname = location.hostname;

  const activated = (exports.sentryActivated = !!buildSettings.sentryDsn);

  function fixUrl(u) {
    return u.replace(hostname, "firefox-voice");
  }

  function install() {
    const manifest = browser.runtime.getManifest();
    if (!buildSettings.sentryDsn) {
      return;
    }
    Sentry.init({
      dsn: buildSettings.sentryDsn,
      release: manifest.version,
      environment: buildSettings.channel,
      tags: {
        git_commit: buildSettings.gitCommit,
      },
      beforeSend(event) {
        event.request.url = fixUrl(event.request.url);
        for (const exc of event.exception.values) {
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
        return event;
      },
    });
  }

  exports.capture = function(e) {
    if (activated) {
      Sentry.captureException(e);
    }
  };

  install();

  return exports;
})();
