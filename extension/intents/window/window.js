import * as intentRunner from "../../background/intentRunner.js";

function findTargetWindowId(windowArray, currentWindowId, direction) {
  const len = windowArray.length;
  // find currentWindowId position in array
  const currentWindowIndex = windowArray.findIndex(
    window => window.id === currentWindowId
  );
  let targetIndex;
  if (direction === "next") {
    targetIndex = (currentWindowIndex + 1) % len;
  } else {
    targetIndex = (currentWindowIndex - 1 + len) % len;
  }
  return windowArray[targetIndex].id;
}

intentRunner.registerIntent({
  name: "window.switch",
  async run(context) {
    // get current activeTab.windowId
    const activeTab = await context.activeTab();
    const currentWindowId = activeTab.windowId;
    // get direction parameter
    const direction = context.parameters.direction;
    // getAll normal window
    const gettingAll = await browser.windows.getAll({
      windowTypes: ["normal"],
    });
    // find target windowId
    const targetWindowId = findTargetWindowId(
      gettingAll,
      currentWindowId,
      direction
    );
    // set target window focuse true
    await browser.windows.update(targetWindowId, { focused: true });
  },
});

intentRunner.registerIntent({
  name: "window.downloads",
  async run(context) {
    await browser.experiments.voice.openDownloads();
  },
});

intentRunner.registerIntent({
  name: "window.close",
  async run(context) {
    // get current activeTab.windowId
    const activeTab = await context.activeTab();
    const currentWindowId = activeTab.windowId;
    // getAll normal window
    const gettingAll = await browser.windows.getAll({
      windowTypes: ["normal"],
    });
    // find target windowId
    const targetWindowId = findTargetWindowId(gettingAll, currentWindowId);
    await browser.windows.remove(targetWindowId);
    context.displayText("Window closed");
  },
});

intentRunner.registerIntent({
  name: "window.quitApplication",
  async run(context) {
    await browser.experiments.voice.quitApplication();
  },
});

intentRunner.registerIntent({
  name: "window.combine",
  async run(context) {
    const currentWindow = await browser.windows.getCurrent();
    const tabs = await browser.tabs.query({ currentWindow: false });
    const tabsIds = tabs.map(tabInfo => tabInfo.id);
    await browser.tabs.move(tabsIds, { windowId: currentWindow.id, index: -1 });
  },
});
