/* globals buildSettings */
import * as intentRunner from "../../background/intentRunner.js";

const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;
const defaultZoomValues = [
  0.3,
  0.5,
  0.67,
  0.8,
  0.9,
  1,
  1.1,
  1.2,
  1.33,
  1.5,
  1.7,
  2,
  2.4,
  3,
];
// Milliseconds: if you activate a tab for less time than this, then it doesn't
// get tracked (we assume you just passed over the tab)
const TRACK_TAB_ACTIVATE_MINIMUM = 1500;

function nextLevel(levels, current) {
  for (const level of levels) {
    if (current < level) {
      return level;
    }
  }
  return levels[levels.length - 1];
}

function previousLevel(levels, current) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (current > levels[i]) {
      return levels[i];
    }
  }
  return levels[0];
}

async function updateZoom(context, operation) {
  // 0 -> Reset
  // 1 -> zoom in
  // -1 -> zoom out
  const activeTab = await context.activeTab();
  if (operation === 0) {
    await browser.tabs.setZoom(activeTab.id, DEFAULT_ZOOM);
  } else {
    const zoomFactor = await browser.tabs.getZoom(activeTab.id);
    if (
      (zoomFactor >= MAX_ZOOM && operation === 1) ||
      (zoomFactor <= MIN_ZOOM && operation === -1)
    ) {
      const e = new Error("Zoom limit reached");
      e.displayMessage = "Zoom limit reached";
      throw e;
    }
    if (operation === 1) {
      await browser.tabs.setZoom(
        activeTab.id,
        nextLevel(defaultZoomValues, zoomFactor)
      );
    } else {
      await browser.tabs.setZoom(
        activeTab.id,
        previousLevel(defaultZoomValues, zoomFactor)
      );
    }
  }
}

intentRunner.registerIntent({
  name: "tabs.zoomIn",
  async run(context) {
    await updateZoom(context, 1);
  },
});

intentRunner.registerIntent({
  name: "tabs.zoomOut",
  async run(context) {
    await updateZoom(context, -1);
  },
});

intentRunner.registerIntent({
  name: "tabs.zoomReset",
  async run(context) {
    await updateZoom(context, 0);
  },
});

intentRunner.registerIntent({
  name: "tabs.close",
  async run(context) {
    const activeTab = await context.activeTab();
    await browser.tabs.remove(activeTab.id);
    context.displayText("Tab closed");
  },
});

intentRunner.registerIntent({
  name: "tabs.undoCloseTab",
  async run(context) {
    await browser.experiments.voice.undoCloseTab();
  },
});

intentRunner.registerIntent({
  name: "tabs.undoCloseWindow",
  async run(context) {
    await browser.experiments.voice.undoCloseWindow();
  },
});

intentRunner.registerIntent({
  name: "tabs.open",
  async run(context) {
    // context.createTab is the normal way to do this, but it sometimes doesn't open a new tab
    // Since the user asked, we definitely want to open a new tab
    await browser.tabs.create({ active: true });
  },
});

intentRunner.registerIntent({
  name: "tabs.pin",
  async run(context) {
    const activeTab = await context.activeTab();
    await browser.tabs.update(activeTab.id, { pinned: true });
  },
});

intentRunner.registerIntent({
  name: "tabs.unpin",
  async run(context) {
    const activeTab = await context.activeTab();
    await browser.tabs.update(activeTab.id, { pinned: false });
  },
});

intentRunner.registerIntent({
  name: "tabs.saveAsPdf",
  async run(context) {
    // This could return:
    // "saved"
    // "replaced"
    // "canceled"
    // "not_saved"
    // "not_replaced"
    await browser.tabs.saveAsPDF({});
  },
});

intentRunner.registerIntent({
  name: "tabs.reload",
  async run(context) {
    await browser.tabs.reload();
  },
});

intentRunner.registerIntent({
  name: "tabs.duplicate",
  async run(context) {
    const activeTab = await context.activeTab();
    await browser.tabs.duplicate(activeTab.id);
  },
});

if (!buildSettings.android) {
  intentRunner.registerIntent({
    name: "tabs.openWindow",
    async run(context) {
      await browser.windows.create({});
    },
  });
}

if (!buildSettings.android) {
  intentRunner.registerIntent({
    name: "tabs.moveToWindow",
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.windows.create({ tabId: activeTab.id });
    },
  });
}

if (!buildSettings.android) {
  // See open bug https://bugzilla.mozilla.org/show_bug.cgi?id=1372178 for Android support
  intentRunner.registerIntent({
    name: "tabs.openPrivateWindow",
    async run(context) {
      const isAllowed = browser.extension.isAllowedIncognitoAccess();
      if (isAllowed === true) {
        await browser.windows.create({ incognito: true });
      } else {
        const e = new Error("Failed to open private window");
        e.displayMessage =
          "Extension does not have permission for incognito mode";
        throw e;
      }
    },
  });
}

intentRunner.registerIntent({
  name: "tabs.openHomePage",
  async run(context) {
    const result = await browser.browserSettings.homepageOverride.get({});
    const homePageUrls = result.value.split("|");
    for (const homePageUrl of homePageUrls) {
      await browser.tabs.create({ url: homePageUrl });
    }
  },
});

intentRunner.registerIntent({
  name: "tabs.fullScreen",
  async run(context) {
    if (buildSettings.android) {
      const exc = new Error("Full screen not supported on Android");
      exc.displayMessage = exc.message;
      throw exc;
    }
    const currentWindow = await browser.windows.getCurrent();
    await browser.windows.update(currentWindow.id, { state: "fullscreen" });
  },
});

const tabHistory = [];
let lastActivate;

browser.tabs.onActivated.addListener(({ tabId }) => {
  if (lastActivate && Date.now() - lastActivate < TRACK_TAB_ACTIVATE_MINIMUM) {
    // Remove the most recent item if it wasn't active long enough
    tabHistory.shift();
  }
  lastActivate = Date.now();
  if (tabHistory.includes(tabId)) {
    tabHistory.splice(tabHistory.indexOf(tabId), 1);
  }
  tabHistory.unshift(tabId);
  // Truncate the history at 4 items (do we ever need more than 2?)
  if (tabHistory.length > 4) {
    tabHistory.splice(4);
  }
});

intentRunner.registerIntent({
  name: "tabs.previous",
  async run(context) {
    if (!tabHistory.length) {
      const tabs = await browser.tabs.query({ currentWindow: true });
      await switchDir(tabs, context.parameters.dir);
      return;
    }
    const activeTab = await context.activeTab();
    let found;
    for (const tabId of tabHistory) {
      if (tabId === activeTab.id) {
        continue;
      }
      found = tabId;
      break;
    }
    if (!found) {
      const tabs = await browser.tabs.query({ currentWindow: true });
      await switchDir(tabs, context.parameters.dir);
      return;
    }
    context.makeTabActive(found);
  },
});

intentRunner.registerIntent({
  name: "tabs.switchDir",
  async run(context) {
    const tabs = await browser.tabs.query({ currentWindow: true });
    await switchDir(tabs, context.parameters.dir);
  },
});

async function switchDir(tabs, dir) {
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].active) {
      let tab;
      if (dir === "next") {
        if (tabs[i + 1]) {
          tab = tabs[i + 1];
        } else {
          tab = tabs[0];
        }
      } else if (tabs[i - 1]) {
        tab = tabs[i - 1];
      } else {
        tab = tabs[tabs.length - 1];
      }
      await browser.tabs.update(tab.id, { active: true });
      return;
    }
  }
}

intentRunner.registerIntent({
  name: "tabs.switchSide",
  async run(context) {
    const tabs = await browser.tabs.query({ currentWindow: true });
    await switchSide(tabs, context.parameters.dir);
  },
});

async function switchSide(tabs, dir) {
  let tab;
  if (dir === "first") {
    tab = tabs[0];
  } else {
    tab = tabs[tabs.length - 1];
  }
  if (tab.active) {
    const exc = new Error("Tab already active");
    exc.displayMessage =
      dir === "first"
        ? "You are already on the first tab"
        : "You are already on the last tab";
    throw exc;
  }
  await browser.tabs.update(tab.id, { active: true });
}

intentRunner.registerIntent({
  name: "tabs.switchDirPinned",
  async run(context) {
    const tabs = await browser.tabs.query({
      currentWindow: true,
      pinned: true,
    });
    if (!tabs.length) {
      const exc = new Error("No pinned tabs");
      exc.displayMessage = "You don't have any pinned tabs";
      throw exc;
    }
    await switchDir(tabs, context.parameters.dir);
  },
});

intentRunner.registerIntent({
  name: "tabs.switchSidePinned",
  async run(context) {
    const tabs = await browser.tabs.query({
      currentWindow: true,
      pinned: true,
    });
    if (!tabs.length) {
      const exc = new Error("No pinned tabs");
      exc.displayMessage = "You don't have any pinned tabs";
      throw exc;
    }
    await switchSide(tabs, context.parameters.dir);
  },
});

intentRunner.registerIntent({
  name: "tabs.moveSelectedToNewWindow",
  async run(context) {
    const tabs = await browser.tabs.query({ highlighted: true });
    const tabsIds = tabs.map(tabInfo => tabInfo.id);
    const newWindow = await browser.windows.create({});
    await browser.tabs.move(tabsIds, { windowId: newWindow.id, index: 0 });
  },
});

async function collectTabsAround(center, tabs) {
  const tabsLeft = tabs.filter(tab => {
    return tab.index < center.index;
  });

  const tabsRight = tabs.filter(tab => {
    return tab.index > center.index;
  });

  for (let i = 0; i < tabsLeft.length; i++) {
    await browser.tabs.move(tabsLeft[tabsLeft.length - i - 1].id, {
      index: center.index - i - 1,
    });
  }

  for (let i = 0; i < tabsRight.length; i++) {
    await browser.tabs.move(tabsRight[i].id, { index: center.index + i + 1 });
  }
}

async function collectRightTabs(tabs) {
  const leftestTab = tabs[0];
  const tabsRight = tabs.slice(1);

  for (let i = 0; i < tabsRight.length; i++) {
    await browser.tabs.move(tabsRight[i].id, {
      index: leftestTab.index + i + 1,
    });
  }
}

function groupTabs(tabs, keyGetter) {
  const groupedTabs = {};

  for (let i = 0; i < tabs.length; i++) {
    const key = keyGetter(tabs[i]);

    if (groupedTabs[key] === undefined) {
      groupedTabs[key] = [tabs[i]];
    } else {
      groupedTabs[key].push(tabs[i]);
    }
  }

  return groupedTabs;
}

async function getMatchingTabs(options) {
  const tabQuery = {
    pinned: false,
    windowType: "normal",
  };

  if (options.allWindows === false) {
    tabQuery.currentWindow = true;
  }

  if (options.query === undefined && options.activeTab !== undefined) {
    const activeTab = options.activeTab;
    const activeHostname = new URL(activeTab.url).hostname;
    tabQuery.url = "*://*." + activeHostname + "/*";
  }

  let matchingTabs = await browser.tabs.query(tabQuery);

  if (options.query !== undefined) {
    matchingTabs = matchingTabs.filter(tab => {
      const query = options.query.toLowerCase();
      return (
        new URL(tab.url).origin.includes(query) ||
        tab.title.toLowerCase().includes(query)
      );
    });
  }

  if (options.sort_by_index === true) {
    matchingTabs.sort((a, b) => {
      return a.index > b.index;
    });
  }

  return matchingTabs;
}

intentRunner.registerIntent({
  name: "tabs.collectMentionedTabs",
  async run(context) {
    const activeTab = await context.activeTab();
    const currentWindow = await browser.windows.getCurrent();
    const allWindows = await browser.windows.getAll({
      windowTypes: ["normal"],
    });

    const matchingTabs = await getMatchingTabs({
      query: context.slots.query,
      activeTab,
      sort_by_index: true,
      allWindows: context.parameters.allWindows === "true",
    });

    if (matchingTabs.length === 0) {
      const exc = new Error("No tab that matches the query");
      exc.displayMessage = "There is no tab that matches the query";
      throw exc;
    }

    const useActiveTab = matchingTabs.map(tab => tab.id).includes(activeTab.id);
    const tabsByWindow = groupTabs(matchingTabs, tab => tab.windowId);

    for (let i = 0; i < allWindows.length; i++) {
      const tabsThisWindow = tabsByWindow[allWindows[i].id];
      if (tabsThisWindow === undefined) {
        continue;
      }

      if (useActiveTab === true && allWindows[i].id === currentWindow.id) {
        await collectTabsAround(activeTab, tabsThisWindow);
      } else {
        await collectRightTabs(tabsThisWindow);
      }
    }

    // if active does not match query, i should focus on
    // a tab that does
    if (useActiveTab === false) {
      const tabsCurrentWindow = tabsByWindow[currentWindow.id];

      // prefer staying in current window
      if (tabsCurrentWindow !== undefined) {
        await context.makeTabActive(tabsCurrentWindow[0]);
      } else {
        await context.makeTabActive(matchingTabs[0]);
        await browser.windows.update(matchingTabs[0].windowId, {
          focused: true,
        });
      }
    }
  },
});

intentRunner.registerIntent({
  name: "tabs.collectAllTabs",
  async run(context) {
    const allWindows = await browser.windows.getAll({
      windowTypes: ["normal"],
    });

    const matchingTabs = await getMatchingTabs({
      sort_by_index: true,
      allWindows: context.parameters.allWindows === "true",
    });

    const tabsByWindow = groupTabs(matchingTabs, tab => tab.windowId);

    for (let i = 0; i < allWindows.length; i++) {
      const tabsThisWindow = tabsByWindow[allWindows[i].id];
      if (tabsThisWindow === undefined) {
        continue;
      }
      const tabsByOrigin = groupTabs(
        tabsThisWindow,
        tab => new URL(tab.url).origin
      );

      let tabs = [];
      for (const origin in tabsByOrigin) {
        tabs = tabs.concat(tabsByOrigin[origin]);
      }
      await collectRightTabs(tabs);
    }
  },
});

if (!buildSettings.android) {
  intentRunner.registerIntent({
    name: "tabs.closeSelectedTabs",
    async run(context) {
      const tabs = await browser.tabs.query({ highlighted: true });
      const tabIds = tabs.map(tab => tab.id);

      await browser.tabs.remove(tabIds);
    },
  });
}

intentRunner.registerIntent({
  name: "tabs.countTabs",
  async run(context) {
    context.keepPopup();
    const tabs = await browser.tabs.query({ currentWindow: true });
    const hiddenTabs = await browser.tabs.query({ hidden: true });
    const numOfOpenTabs = tabs.length - hiddenTabs.length;
    const card = {
      answer: {
        largeText: `${numOfOpenTabs}`,
        text: "Open tabs",
        eduText: `Click mic and say "gather all Google tabs"`,
      },
    };
    await browser.runtime.sendMessage({
      type: "showSearchResults",
      card,
      searchResults: card,
    });
  },
});

intentRunner.registerIntent({
  name: "tabs.findOnPage",
  async run(context) {
    let message;
    const results = await browser.find.find(context.slots.query);
    await browser.find.highlightResults({
      noScroll: false,
      rangeIndex: 0,
    });
    if (results.count > 0) {
      message = `"${context.slots.query}" found ${results.count} times`;
    } else {
      message = `"${context.slots.query}" not found`;
    }
    context.displayText(message);
  },
});
