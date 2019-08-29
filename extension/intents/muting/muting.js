/* globals log, intents */

this.intents.muting = (function() {
  this.intentRunner.registerIntent({
    name: "mute",
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
    name: "unmute",
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
})();
