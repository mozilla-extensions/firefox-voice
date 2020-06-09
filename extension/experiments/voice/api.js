/* globals XPCOMUtils, ExtensionAPI, content */

"use strict";

ChromeUtils.defineModuleGetter(
  this,
  "ExtensionParent",
  "resource://gre/modules/ExtensionParent.jsm"
);

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

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
function getKeyboardEvent_(win) {
  if (typeof KeyboardEvent !== "undefined") {
    try {
      new KeyboardEvent("", {});
      return KeyboardEvent;
    } catch (ex) {}
  }
  if (typeof content !== "undefined" && "KeyboardEvent" in content) {
    return content.KeyboardEvent;
  }
  return win.KeyboardEvent;
}
const TIPMap = new WeakMap();

function getTIP_(win, callback) {
  let tip;

  if (TIPMap.has(win)) {
    tip = TIPMap.get(win);
  } else {
    tip = Cc["@mozilla.org/text-input-processor;1"].createInstance(
      Ci.nsITextInputProcessor
    );
    TIPMap.set(win, tip);
  }
  if (!tip.beginInputTransactionForTests(win, callback)) {
    tip = null;
    TIPMap.delete(win);
  }
  return tip;
}

function emulateToActivateModifiers_(TIP, keyEvent, win) {
  if (!keyEvent) {
    return null;
  }
  const KeyboardEvent = getKeyboardEvent_(win);

  const modifiers = {
    normal: [
      { key: "Alt", attr: "altKey" },
      { key: "AltGraph", attr: "altGraphKey" },
      { key: "Control", attr: "ctrlKey" },
      { key: "Fn", attr: "fnKey" },
      { key: "Meta", attr: "metaKey" },
      { key: "OS", attr: "osKey" },
      { key: "Shift", attr: "shiftKey" },
      { key: "Symbol", attr: "symbolKey" },
      {
        key: Services.appinfo.OS === "Darwin" ? "Meta" : "Control",
        attr: "accelKey",
      },
    ],
    lockable: [
      { key: "CapsLock", attr: "capsLockKey" },
      { key: "FnLock", attr: "fnLockKey" },
      { key: "NumLock", attr: "numLockKey" },
      { key: "ScrollLock", attr: "scrollLockKey" },
      { key: "SymbolLock", attr: "symbolLockKey" },
    ],
  };

  for (let i = 0; i < modifiers.normal.length; i++) {
    if (!keyEvent[modifiers.normal[i].attr]) {
      continue;
    }
    if (TIP.getModifierState(modifiers.normal[i].key)) {
      continue; // already activated.
    }
    const event = new KeyboardEvent("", { key: modifiers.normal[i].key });
    TIP.keydown(
      event,
      TIP.KEY_NON_PRINTABLE_KEY | TIP.KEY_DONT_DISPATCH_MODIFIER_KEY_EVENT
    );
    modifiers.normal[i].activated = true;
  }

  for (let j = 0; j < modifiers.lockable.length; j++) {
    if (!keyEvent[modifiers.lockable[j].attr]) {
      continue;
    }
    if (TIP.getModifierState(modifiers.lockable[j].key)) {
      continue; // already activated.
    }
    const event = new KeyboardEvent("", { key: modifiers.lockable[j].key });
    TIP.keydown(
      event,
      TIP.KEY_NON_PRINTABLE_KEY | TIP.KEY_DONT_DISPATCH_MODIFIER_KEY_EVENT
    );
    TIP.keyup(
      event,
      TIP.KEY_NON_PRINTABLE_KEY | TIP.KEY_DONT_DISPATCH_MODIFIER_KEY_EVENT
    );
    modifiers.lockable[j].activated = true;
  }

  return modifiers;
}

function synthesizeKey(key, event, win) {
  const TIP = getTIP_(win);
  if (!TIP) {
    return;
  }
  const KeyboardEvent = getKeyboardEvent_(win);
  const modifiers = emulateToActivateModifiers_(TIP, event, win);
  const keyEventDict = createKeyboardEventDictionary_(key, event, win);
  const keyEvent = new KeyboardEvent("", keyEventDict.dictionary);
  const dispatchKeydown =
    !("type" in event) || event.type === "keydown" || !event.type;
  const dispatchKeyup =
    !("type" in event) || event.type === "keyup" || !event.type;

  try {
    if (dispatchKeydown) {
      TIP.keydown(keyEvent, keyEventDict.flags);
      if ("repeat" in event && event.repeat > 1) {
        keyEventDict.dictionary.repeat = true;
        const repeatedKeyEvent = new KeyboardEvent("", keyEventDict.dictionary);
        for (let i = 1; i < event.repeat; i++) {
          TIP.keydown(repeatedKeyEvent, keyEventDict.flags);
        }
      }
    }
    if (dispatchKeyup) {
      TIP.keyup(keyEvent, keyEventDict.flags);
    }
  } finally {
    emulateToInactivateModifiers_(TIP, modifiers, win);
  }
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

          async clearBrowserHistory() {
            return runCommand("Tools:Sanitize");
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
            const lastOpenId = getTopWindow().SidebarUI.lastOpenedId;
            await getTopWindow().SidebarUI.toggle(
              lastOpenId || "viewHistorySidebar"
            );
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

          async openPreferences() {
            return runCommand("menu_preferences");
          },

          async browserOpenAddonsMgr() {
            return runCommand("Tools:Addons");
          },
        },
      },
    };
  }
};
