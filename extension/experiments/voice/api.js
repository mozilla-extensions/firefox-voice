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

const SUPPORTED_COMMANDS = new Set([
  "cmd_scrollPageDown",
  "cmd_scrollBottom",
  "cmd_scrollTop",
  "cmd_scrollPageUp",
]);

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

          async doCommand(commandName) {
            if (!SUPPORTED_COMMANDS.has(commandName)) {
              throw new Error(`Unsupported command: ${commandName}`);
            }
            const windowTracker = ChromeUtils.import(
              "resource://gre/modules/Extension.jsm",
              {}
            ).Management.global.windowTracker;
            const window = windowTracker.topWindow;
            return window.goDoCommand(commandName);
          },
        },
      },
    };
  }
};
