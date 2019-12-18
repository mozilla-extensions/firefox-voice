this.intents.tabs = (function() {
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

  this.intentRunner.registerIntent({
    name: "tabs.zoomIn",
    description: "Zoom in current tab",
    examples: ["Zoom in tab"],
    match: `
    zoom (in |) (this |) (tab |) (for me |)
    increase size (for me |)
  `,
    async run(context) {
      await updateZoom(context, 1);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.zoomOut",
    description: "Zoom out current tab",
    examples: ["Zoom out tab"],
    match: `
    zoom out (this |) (tab |) (for me |)
    decrease size (for me |)
  `,
    async run(context) {
      await updateZoom(context, -1);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.zoomReset",
    description: "Reset zoom in current tab",
    examples: ["Reset zoom"],
    match: `
    reset (zoom | size) (for me |)
    (zoom | size) reset (for me |)
  `,
    async run(context) {
      await updateZoom(context, 0);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.close",
    description: "Closes the current tab",
    examples: ["close tab"],
    match: `
    close (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.remove(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.open",
    description: "Opens a new (blank) tab",
    examples: ["open tab", "test:open top for me", "test:open the tab"],
    match: `
    open tab
    (open | launch) (a |) (new | blank |) tab (for me|)
    new (blank |) tab
    `,
    async run(context) {
      // context.createTab is the normal way to do this, but it sometimes doesn't open a new tab
      // Since the user asked, we definitely want to open a new tab
      await browser.tabs.create({ active: true });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.pin",
    description: "Pins the current tab",
    examples: ["pin tab", "test:pin tap"],
    match: `
    pin (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.update(activeTab.id, { pinned: true });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.unpin",
    description: "Unpins the current tab",
    examples: ["unpin tab"],
    match: `
    unpin (this |) tab (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.update(activeTab.id, { pinned: false });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.saveAsPdf",
    description: "Saves the current tab as a PDF file",
    examples: ["Save as PDF"],
    match: `
    save (this | current |) (tab |) (as |) pdf (for me |)
    `,
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

  this.intentRunner.registerIntent({
    name: "tabs.reload",
    description: "Reload the active tab of the current window",
    examples: ["reload this page"],
    match: `
    (reload | refresh) (this | current |) (tab | page |) (for me |)
    `,
    async run(context) {
      await browser.tabs.reload();
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.duplicate",
    description: "Duplicates a tab",
    examples: ["Duplicate this page"],
    match: `
    duplicate (this | current |) (tab | page |) (for me |)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.tabs.duplicate(activeTab.id);
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.openWindow",
    description: "Opens a new (blank) window",
    examples: ["open window"],
    match: `
    open window
    (open | launch) (a |) (new | blank |) window (for me|)
    new (blank |) window
    `,
    async run(context) {
      await browser.windows.create({});
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.moveToWindow",
    description: "Move tab in a new window",
    examples: ["Move tab in a new window"],
    match: `
    (open | move) (tab | this) (in | to) (a |) new window (for me|)
    `,
    async run(context) {
      const activeTab = await context.activeTab();
      await browser.windows.create({ tabId: activeTab.id });
    },
  });

  this.intentRunner.registerIntent({
    name: "tabs.openPrivateWindow",
    description: "Opens a new private window",
    examples: ["open private window"],
    match: `
    open (a |) (new | blank |) (private | incognito) window (for me|)
    new (private | incognito) window
    `,
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

  this.intentRunner.registerIntent({
    name: "tabs.openHomePage",
    description: "Opens HomePage in a tab",
    examples: ["open my homepage"],
    match: `
    (open | go to |) (my |) homepage (for me|)
    `,
    async run(context) {
      const result = await browser.browserSettings.homepageOverride.get({});
      const homePageUrls = result.value.split("|");
      for (const homePageUrl of homePageUrls) {
        await browser.tabs.create({ url: homePageUrl });
      }
    },
  });
})();
