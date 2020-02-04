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
        },
      },
    };
  }
};
