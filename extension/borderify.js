/* eslint-disable  */
function handleMessage(message, sender) {
  if (sender.id === "blue@mozilla.org") {
    
    console.log("Integration " + message)
  }
  else {
      console.log("Not Working")
  }
}

browser.runtime.onMessageExternal.addListener(handleMessage);
