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
  /* This opens up the OS send link interface:
  "Browser:SendLink",
  */

  /* This doesn't seem to work:
  "View:PictureInPicture",
  */

  /* Not sure if these add anything over the normal APIs?
  "Browser:NextTab",
  "Browser:PrevTab",
  */

  /* This shows the drop-down list of all the tabs:
  "Browser:ShowAllTabs",
  */

  /* This open the downloads Library window:
  "Tools:Downloads",
  */

  "cmd_quitApplication",
  "History:UndoCloseTab",
  "History:UndoCloseWindow",

  /* These might work with window.goDoCommand() but only once */
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
            if (false && !SUPPORTED_COMMANDS.has(commandName)) {
              throw new Error(`Unsupported command: ${commandName}`);
            }
            const windowTracker = ChromeUtils.import(
              "resource://gre/modules/Extension.jsm",
              {}
            ).Management.global.windowTracker;
            const window = windowTracker.topWindow;
            const command = window.document.getElementById(commandName);
            if (command) {
              console.log("clicking button:", commandName);
              return command.click();
            }
            console.log("doing window command:", commandName);
            return window.contentWindow.goDoCommand(commandName);
          },
        },
      },
    };
  }
};
