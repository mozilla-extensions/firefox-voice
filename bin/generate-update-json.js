// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Updates

const version = process.env.VERSION;
const update_link = process.env.UPDATE_BASE + "/firefox-voice.xpi?src=update";
if (!version || !update_link) {
  throw new Error("Both $VERSION and $UPDATE_BASE must be set");
}
const json = {
  addons: {
    "firefox-voice@mozilla.org": {
      updates: [
        {
          version,
          update_link,
        },
      ],
    },
  },
};
process.stdout.write(JSON.stringify(json, null, "  "));
