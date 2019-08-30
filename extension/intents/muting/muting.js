/* globals log, intents */

this.intents.muting = (function() {
  // Always undo temporary muting after this amount of time:
  const TEMPORARY_MUTE_TIMEOUT = 10000; // 10 seconds
  const exports = {};

  this.intentRunner.registerIntent({
    name: "mute.mute",
    examples: ["mute all tabs"],
    match: `
    (mute | turn off) (whatever is |) (playing | all) (the |) (music | audio | sound | everything |)
    quiet
    shut up
    stop
    `,
    async run(desc) {
      const stoppedReading = await intents.read.stopReading();
      if (stoppedReading) {
        // There was an about:reader narration that we stopped
        return;
      }
      const audibleTabs = await browser.tabs.query({ audible: true });
      if (audibleTabs.empty) {
        // TODO: pass a message back to the content script to update the UI and indicate that we don't have any audible tabs
      } else {
        // pass a message back to indicate that the tabs are currently being muted
        log.debug("these are the audible tabs:", audibleTabs);
        // mute each audible tab
        for (const tab of audibleTabs) {
          browser.tabs.update(tab.id, {
            muted: true,
          });
        }
      }
      // TODO: tell the user if no audible tabs were found
      // TODO: show confirmation
    },
  });

  this.intentRunner.registerIntent({
    name: "mute.unmute",
    match: `
    unmute
    `,
    async run(desc) {
      const mutedTabs = await browser.tabs.query({ audible: false });
      if (mutedTabs.empty) {
        // pass a message back to the content script to update the UI and indicate that we don't have any muted tabs
      } else {
        // pass a message back to indicate that the tabs are currently being un-muted
        // unmute each muted tab
        for (const tab of mutedTabs) {
          browser.tabs.update(tab.id, {
            muted: false,
          });
        }
      }
      // TODO: tell the user if no audible tabs were found
      // TODO: show confirmation
    },
  });

  let muteTimeoutId = null;
  let mutedTabIds = [];

  exports.temporaryMute = async function() {
    const tabsToMute = await browser.tabs.query({
      audible: true,
      muted: false,
    });
    if (!tabsToMute.length) {
      return;
    }
    if (muteTimeoutId) {
      clearTimeout(muteTimeoutId);
    }
    muteTimeoutId = setTimeout(() => {
      exports.temporaryUnmute();
    }, TEMPORARY_MUTE_TIMEOUT);
    for (const tab of tabsToMute) {
      browser.tabs.update(tab.id, { muted: true });
    }
    mutedTabIds = mutedTabIds.concat(tabsToMute.map(t => t.id));
  };

  exports.temporaryUnmute = function() {
    if (muteTimeoutId) {
      clearTimeout(muteTimeoutId);
      muteTimeoutId = null;
    }
    for (const tabId of mutedTabIds) {
      browser.tabs.update(tabId, { muted: false });
    }
    mutedTabIds = [];
  };

  return exports;
})();
