/* globals XPCOMUtils, ExtensionAPI */

"use strict";

ChromeUtils.defineModuleGetter(
  this,
  "ExtensionParent",
  "resource://gre/modules/ExtensionParent.jsm"
);

XPCOMUtils.defineLazyGetter(this, "browserActionFor", () => {
  return ExtensionParent.apiManager.global.browserActionFor;
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

function getTopWindow() {
  const windowTracker = ChromeUtils.import(
    "resource://gre/modules/Extension.jsm",
    {}
  ).Management.global.windowTracker;
  const window = windowTracker.topWindow;
  return window;
}

this.voice = class extends ExtensionAPI {
  getAPI(context) {
    const { extension } = context;

    return {
      experiments: {
        voice: {
          async openPopup() {
            const browserAction = browserActionFor(extension);
            browserAction.triggerAction(getTopWindow());
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

          async openBookmarksSidebar() {
            await getTopWindow().SidebarUI.show("viewBookmarksSidebar");
          },

          async openHistorySidebar() {
            await getTopWindow().SidebarUI.show("viewHistorySidebar");
          },

          async closeSidebar() {
            await getTopWindow().SidebarUI.hide();
          },

          async toggleSidebar() {
            await getTopWindow().SidebarUI.toggle(SidebarUI.lastOpenedId);
          },

          async viewPageSource() {
            return runCommand("View:PageSource");
          },

          async showAllBookmarks() {
            return runCommand("Browser:ShowAllBookmarks");
          },

          async showAllHistory() {
            return runCommand("Browser:ShowAllHistory");
          },
        },
      },
    };
  }
};
