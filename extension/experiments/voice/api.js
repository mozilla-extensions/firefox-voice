/* globals log, XPCOMUtils, ExtensionAPI */

"use strict";

ChromeUtils.defineModuleGetter(
  this,
  "ExtensionParent",
  "resource://gre/modules/ExtensionParent.jsm"
);

XPCOMUtils.defineLazyGetter(this, "browserActionFor", () => {
  return ExtensionParent.apiManager.global.browserActionFor;
});

XPCOMUtils.defineLazyGetter(this, "sidebarActionFor", () => {
  return ExtensionParent.apiManager.global.sidebarActionFor;
});

function runCommand(commandName) {
  const windowTracker = ChromeUtils.import(
    "resource://gre/modules/Extension.jsm",
    {}
  ).Management.global.windowTracker;
  const window = windowTracker.topWindow;
  const command = window.document.getElementById(commandName);
  return command.click();
}

this.voice = class extends ExtensionAPI {
  getAPI(context) {
    const { extension } = context;

    return {
      experiments: {
        voice: {
          async openPopup() {
            const browserAction = browserActionFor(extension);
            const windowTracker = ChromeUtils.import(
              "resource://gre/modules/Extension.jsm",
              {}
            ).Management.global.windowTracker;
            const window = windowTracker.topWindow;
            browserAction.triggerAction(window);
          },

          async undoCloseTab() {
            return runCommand("History:UndoCloseTab");
          },

          async undoCloseWindow() {
            return runCommand("History:UndoCloseWindow");
          },

          async openDownloads() {
            return runCommand("Tools:Downloads");
          },

          async quitApplication() {
            return runCommand("cmd_quitApplication");
          },

          async openSidebar() {
            const sidebarAction = sidebarActionFor(extension);
            const windowTracker = ChromeUtils.import(
              "resource://gre/modules/Extension.jsm",
              {}
            ).Management.global.windowTracker;
            /* https://searchfox.org/mozilla-central/source/browser/components/extensions/parent/ext-sidebarAction.js#495 */
            const window = windowTracker.topWindow;
            if (context.canAccessWindow(window)) {
              sidebarAction.open(window);
            }
          },
        },
      },
    };
  }
};
