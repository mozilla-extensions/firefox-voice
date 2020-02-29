import * as intentRunner from "../../background/intentRunner.js";

function findTargetWindowId(windowArray, currentWindowId, direction) {
    const len = windowArray.length;
    // find currentWindowId postion in array
    const currentWindowIndex = windowArray.findIndex((window) => (window.id === currentWindowId));
    let targetIndex = 0;
    if ( direction === "next" ) {
      targetIndex = Math.floor((currentWindowIndex + 1) % len);
    } else {
      targetIndex = Math.floor((currentWindowIndex - 1 + len) % len);
    }
    return windowArray[targetIndex].id;
  }
// error handle for
function onError(error) {
  // console.log(`Error: ${error}`);
}

intentRunner.registerIntent({
    name: "window.switch",
    async run(context) {
        // get current activeTab.windowId
        const activeTab = await context.activeTab();
        const currentWindowId = activeTab.windowId;
        // get direction parameter
        let direction = "next";
        if ( context.parameters ) {
           direction = context.parameters.direction;
        }
        try {
          // getAll normal window
          const gettingAll = await browser.windows.getAll({windowTypes: ["normal"]});
          // find target windowId
          const targetWindowId = findTargetWindowId(gettingAll, currentWindowId, direction);
          // set target window focuse true
          await browser.windows.update(targetWindowId, {focused: true});
        } catch (err) {
          onError(err);
        }
    }
  });
