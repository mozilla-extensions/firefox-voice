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
