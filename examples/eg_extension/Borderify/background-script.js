/* eslint-disable  */
var css = "body { border: 20px dotted pink; }";

function handleMessage(message, sender) {
  if (sender.id === "firefox-voice@mozilla.org") {
    if ((sender.type = "openExtension")) {
      console.log("Successful");
      browser.tabs.insertCSS({ code: css });
    }
  } else {
    console.log("Not Working");
  }
}

browser.runtime.onMessageExternal.addListener(handleMessage);
