/* globals XPCOMUtils, ExtensionAPI, ExtensionUtils, content */

"use strict";

ChromeUtils.defineModuleGetter(
  this,
  "ExtensionParent",
  "resource://gre/modules/ExtensionParent.jsm"
);

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const { ExtensionError } = ExtensionUtils;

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

/* eslint-disable complexity */

function guessKeyNameFromKeyCode_(aKeyCode, win) {
  const KeyboardEvent = getKeyboardEvent_(win);
  switch (aKeyCode) {
    case KeyboardEvent.DOM_VK_CANCEL:
      return "Cancel";
    case KeyboardEvent.DOM_VK_HELP:
      return "Help";
    case KeyboardEvent.DOM_VK_BACK_SPACE:
      return "Backspace";
    case KeyboardEvent.DOM_VK_TAB:
      return "Tab";
    case KeyboardEvent.DOM_VK_CLEAR:
      return "Clear";
    case KeyboardEvent.DOM_VK_RETURN:
      return "Enter";
    case KeyboardEvent.DOM_VK_SHIFT:
      return "Shift";
    case KeyboardEvent.DOM_VK_CONTROL:
      return "Control";
    case KeyboardEvent.DOM_VK_ALT:
      return "Alt";
    case KeyboardEvent.DOM_VK_PAUSE:
      return "Pause";
    case KeyboardEvent.DOM_VK_EISU:
      return "Eisu";
    case KeyboardEvent.DOM_VK_ESCAPE:
      return "Escape";
    case KeyboardEvent.DOM_VK_CONVERT:
      return "Convert";
    case KeyboardEvent.DOM_VK_NONCONVERT:
      return "NonConvert";
    case KeyboardEvent.DOM_VK_ACCEPT:
      return "Accept";
    case KeyboardEvent.DOM_VK_MODECHANGE:
      return "ModeChange";
    case KeyboardEvent.DOM_VK_PAGE_UP:
      return "PageUp";
    case KeyboardEvent.DOM_VK_PAGE_DOWN:
      return "PageDown";
    case KeyboardEvent.DOM_VK_END:
      return "End";
    case KeyboardEvent.DOM_VK_HOME:
      return "Home";
    case KeyboardEvent.DOM_VK_LEFT:
      return "ArrowLeft";
    case KeyboardEvent.DOM_VK_UP:
      return "ArrowUp";
    case KeyboardEvent.DOM_VK_RIGHT:
      return "ArrowRight";
    case KeyboardEvent.DOM_VK_DOWN:
      return "ArrowDown";
    case KeyboardEvent.DOM_VK_SELECT:
      return "Select";
    case KeyboardEvent.DOM_VK_PRINT:
      return "Print";
    case KeyboardEvent.DOM_VK_EXECUTE:
      return "Execute";
    case KeyboardEvent.DOM_VK_PRINTSCREEN:
      return "PrintScreen";
    case KeyboardEvent.DOM_VK_INSERT:
      return "Insert";
    case KeyboardEvent.DOM_VK_DELETE:
      return "Delete";
    case KeyboardEvent.DOM_VK_WIN:
      return "OS";
    case KeyboardEvent.DOM_VK_CONTEXT_MENU:
      return "ContextMenu";
    case KeyboardEvent.DOM_VK_SLEEP:
      return "Standby";
    case KeyboardEvent.DOM_VK_F1:
      return "F1";
    case KeyboardEvent.DOM_VK_F2:
      return "F2";
    case KeyboardEvent.DOM_VK_F3:
      return "F3";
    case KeyboardEvent.DOM_VK_F4:
      return "F4";
    case KeyboardEvent.DOM_VK_F5:
      return "F5";
    case KeyboardEvent.DOM_VK_F6:
      return "F6";
    case KeyboardEvent.DOM_VK_F7:
      return "F7";
    case KeyboardEvent.DOM_VK_F8:
      return "F8";
    case KeyboardEvent.DOM_VK_F9:
      return "F9";
    case KeyboardEvent.DOM_VK_F10:
      return "F10";
    case KeyboardEvent.DOM_VK_F11:
      return "F11";
    case KeyboardEvent.DOM_VK_F12:
      return "F12";
    case KeyboardEvent.DOM_VK_F13:
      return "F13";
    case KeyboardEvent.DOM_VK_F14:
      return "F14";
    case KeyboardEvent.DOM_VK_F15:
      return "F15";
    case KeyboardEvent.DOM_VK_F16:
      return "F16";
    case KeyboardEvent.DOM_VK_F17:
      return "F17";
    case KeyboardEvent.DOM_VK_F18:
      return "F18";
    case KeyboardEvent.DOM_VK_F19:
      return "F19";
    case KeyboardEvent.DOM_VK_F20:
      return "F20";
    case KeyboardEvent.DOM_VK_F21:
      return "F21";
    case KeyboardEvent.DOM_VK_F22:
      return "F22";
    case KeyboardEvent.DOM_VK_F23:
      return "F23";
    case KeyboardEvent.DOM_VK_F24:
      return "F24";
    case KeyboardEvent.DOM_VK_NUM_LOCK:
      return "NumLock";
    case KeyboardEvent.DOM_VK_SCROLL_LOCK:
      return "ScrollLock";
    case KeyboardEvent.DOM_VK_VOLUME_MUTE:
      return "AudioVolumeMute";
    case KeyboardEvent.DOM_VK_VOLUME_DOWN:
      return "AudioVolumeDown";
    case KeyboardEvent.DOM_VK_VOLUME_UP:
      return "AudioVolumeUp";
    case KeyboardEvent.DOM_VK_META:
      return "Meta";
    case KeyboardEvent.DOM_VK_ALTGR:
      return "AltGraph";
    case KeyboardEvent.DOM_VK_ATTN:
      return "Attn";
    case KeyboardEvent.DOM_VK_CRSEL:
      return "CrSel";
    case KeyboardEvent.DOM_VK_EXSEL:
      return "ExSel";
    case KeyboardEvent.DOM_VK_EREOF:
      return "EraseEof";
    case KeyboardEvent.DOM_VK_PLAY:
      return "Play";
    default:
      return "Unidentified";
  }
}

function isPrintable(c, win) {
  const KeyboardEvent = getKeyboardEvent_(win);
  const NON_PRINT_KEYS = [
    KeyboardEvent.DOM_VK_CANCEL,
    KeyboardEvent.DOM_VK_HELP,
    KeyboardEvent.DOM_VK_BACK_SPACE,
    KeyboardEvent.DOM_VK_TAB,
    KeyboardEvent.DOM_VK_CLEAR,
    KeyboardEvent.DOM_VK_SHIFT,
    KeyboardEvent.DOM_VK_CONTROL,
    KeyboardEvent.DOM_VK_ALT,
    KeyboardEvent.DOM_VK_PAUSE,
    KeyboardEvent.DOM_VK_EISU,
    KeyboardEvent.DOM_VK_ESCAPE,
    KeyboardEvent.DOM_VK_CONVERT,
    KeyboardEvent.DOM_VK_NONCONVERT,
    KeyboardEvent.DOM_VK_ACCEPT,
    KeyboardEvent.DOM_VK_MODECHANGE,
    KeyboardEvent.DOM_VK_PAGE_UP,
    KeyboardEvent.DOM_VK_PAGE_DOWN,
    KeyboardEvent.DOM_VK_END,
    KeyboardEvent.DOM_VK_HOME,
    KeyboardEvent.DOM_VK_LEFT,
    KeyboardEvent.DOM_VK_UP,
    KeyboardEvent.DOM_VK_RIGHT,
    KeyboardEvent.DOM_VK_DOWN,
    KeyboardEvent.DOM_VK_SELECT,
    KeyboardEvent.DOM_VK_PRINT,
    KeyboardEvent.DOM_VK_EXECUTE,
    KeyboardEvent.DOM_VK_PRINTSCREEN,
    KeyboardEvent.DOM_VK_INSERT,
    KeyboardEvent.DOM_VK_DELETE,
    KeyboardEvent.DOM_VK_WIN,
    KeyboardEvent.DOM_VK_CONTEXT_MENU,
    KeyboardEvent.DOM_VK_SLEEP,
    KeyboardEvent.DOM_VK_F1,
    KeyboardEvent.DOM_VK_F2,
    KeyboardEvent.DOM_VK_F3,
    KeyboardEvent.DOM_VK_F4,
    KeyboardEvent.DOM_VK_F5,
    KeyboardEvent.DOM_VK_F6,
    KeyboardEvent.DOM_VK_F7,
    KeyboardEvent.DOM_VK_F8,
    KeyboardEvent.DOM_VK_F9,
    KeyboardEvent.DOM_VK_F10,
    KeyboardEvent.DOM_VK_F11,
    KeyboardEvent.DOM_VK_F12,
    KeyboardEvent.DOM_VK_F13,
    KeyboardEvent.DOM_VK_F14,
    KeyboardEvent.DOM_VK_F15,
    KeyboardEvent.DOM_VK_F16,
    KeyboardEvent.DOM_VK_F17,
    KeyboardEvent.DOM_VK_F18,
    KeyboardEvent.DOM_VK_F19,
    KeyboardEvent.DOM_VK_F20,
    KeyboardEvent.DOM_VK_F21,
    KeyboardEvent.DOM_VK_F22,
    KeyboardEvent.DOM_VK_F23,
    KeyboardEvent.DOM_VK_F24,
    KeyboardEvent.DOM_VK_NUM_LOCK,
    KeyboardEvent.DOM_VK_SCROLL_LOCK,
    KeyboardEvent.DOM_VK_VOLUME_MUTE,
    KeyboardEvent.DOM_VK_VOLUME_DOWN,
    KeyboardEvent.DOM_VK_VOLUME_UP,
    KeyboardEvent.DOM_VK_META,
    KeyboardEvent.DOM_VK_ALTGR,
    KeyboardEvent.DOM_VK_ATTN,
    KeyboardEvent.DOM_VK_CRSEL,
    KeyboardEvent.DOM_VK_EXSEL,
    KeyboardEvent.DOM_VK_EREOF,
    KeyboardEvent.DOM_VK_PLAY,
    KeyboardEvent.DOM_VK_RETURN,
  ];
  return !NON_PRINT_KEYS.includes(c);
}

const VIRTUAL_KEYCODE_LOOKUP = {
  "\uE001": "VK_CANCEL",
  "\uE002": "VK_HELP",
  "\uE003": "VK_BACK_SPACE",
  "\uE004": "VK_TAB",
  "\uE005": "VK_CLEAR",
  "\uE006": "VK_RETURN",
  "\uE007": "VK_RETURN",
  "\uE008": "VK_SHIFT",
  "\uE009": "VK_CONTROL",
  "\uE00A": "VK_ALT",
  "\uE00B": "VK_PAUSE",
  "\uE00C": "VK_ESCAPE",
  "\uE00D": "VK_SPACE", // printable
  "\uE00E": "VK_PAGE_UP",
  "\uE00F": "VK_PAGE_DOWN",
  "\uE010": "VK_END",
  "\uE011": "VK_HOME",
  "\uE012": "VK_LEFT",
  "\uE013": "VK_UP",
  "\uE014": "VK_RIGHT",
  "\uE015": "VK_DOWN",
  "\uE016": "VK_INSERT",
  "\uE017": "VK_DELETE",
  "\uE018": "VK_SEMICOLON",
  "\uE019": "VK_EQUALS",
  "\uE01A": "VK_NUMPAD0",
  "\uE01B": "VK_NUMPAD1",
  "\uE01C": "VK_NUMPAD2",
  "\uE01D": "VK_NUMPAD3",
  "\uE01E": "VK_NUMPAD4",
  "\uE01F": "VK_NUMPAD5",
  "\uE020": "VK_NUMPAD6",
  "\uE021": "VK_NUMPAD7",
  "\uE022": "VK_NUMPAD8",
  "\uE023": "VK_NUMPAD9",
  "\uE024": "VK_MULTIPLY",
  "\uE025": "VK_ADD",
  "\uE026": "VK_SEPARATOR",
  "\uE027": "VK_SUBTRACT",
  "\uE028": "VK_DECIMAL",
  "\uE029": "VK_DIVIDE",
  "\uE031": "VK_F1",
  "\uE032": "VK_F2",
  "\uE033": "VK_F3",
  "\uE034": "VK_F4",
  "\uE035": "VK_F5",
  "\uE036": "VK_F6",
  "\uE037": "VK_F7",
  "\uE038": "VK_F8",
  "\uE039": "VK_F9",
  "\uE03A": "VK_F10",
  "\uE03B": "VK_F11",
  "\uE03C": "VK_F12",
  "\uE03D": "VK_META",
  "\uE050": "VK_SHIFT",
  "\uE051": "VK_CONTROL",
  "\uE052": "VK_ALT",
  "\uE053": "VK_META",
  "\uE054": "VK_PAGE_UP",
  "\uE055": "VK_PAGE_DOWN",
  "\uE056": "VK_END",
  "\uE057": "VK_HOME",
  "\uE058": "VK_LEFT",
  "\uE059": "VK_UP",
  "\uE05A": "VK_RIGHT",
  "\uE05B": "VK_DOWN",
  "\uE05C": "VK_INSERT",
  "\uE05D": "VK_DELETE",
};

function computeKeyCodeFromChar_(char, win) {
  if (char.length !== 1) {
    return 0;
  }

  const KeyboardEvent = getKeyboardEvent_(win);

  if (char in VIRTUAL_KEYCODE_LOOKUP) {
    return KeyboardEvent["DOM_" + VIRTUAL_KEYCODE_LOOKUP[char]];
  }

  if (char >= "a" && char <= "z") {
    return KeyboardEvent.DOM_VK_A + char.charCodeAt(0) - "a".charCodeAt(0);
  }
  if (char >= "A" && char <= "Z") {
    return KeyboardEvent.DOM_VK_A + char.charCodeAt(0) - "A".charCodeAt(0);
  }
  if (char >= "0" && char <= "9") {
    return KeyboardEvent.DOM_VK_0 + char.charCodeAt(0) - "0".charCodeAt(0);
  }

  // returns US keyboard layout's keycode
  switch (char) {
    case "~":
    case "`":
      return KeyboardEvent.DOM_VK_BACK_QUOTE;

    case "!":
      return KeyboardEvent.DOM_VK_1;

    case "@":
      return KeyboardEvent.DOM_VK_2;

    case "#":
      return KeyboardEvent.DOM_VK_3;

    case "$":
      return KeyboardEvent.DOM_VK_4;

    case "%":
      return KeyboardEvent.DOM_VK_5;

    case "^":
      return KeyboardEvent.DOM_VK_6;

    case "&":
      return KeyboardEvent.DOM_VK_7;

    case "*":
      return KeyboardEvent.DOM_VK_8;

    case "(":
      return KeyboardEvent.DOM_VK_9;

    case ")":
      return KeyboardEvent.DOM_VK_0;

    case "-":
    case "_":
      return KeyboardEvent.DOM_VK_SUBTRACT;

    case "+":
    case "=":
      return KeyboardEvent.DOM_VK_EQUALS;

    case "{":
    case "[":
      return KeyboardEvent.DOM_VK_OPEN_BRACKET;

    case "}":
    case "]":
      return KeyboardEvent.DOM_VK_CLOSE_BRACKET;

    case "|":
    case "\\":
      return KeyboardEvent.DOM_VK_BACK_SLASH;

    case ":":
    case ";":
      return KeyboardEvent.DOM_VK_SEMICOLON;

    case "'":
    case '"':
      return KeyboardEvent.DOM_VK_QUOTE;

    case "<":
    case ",":
      return KeyboardEvent.DOM_VK_COMMA;

    case ">":
    case ".":
      return KeyboardEvent.DOM_VK_PERIOD;

    case "?":
    case "/":
      return KeyboardEvent.DOM_VK_SLASH;

    case "\n":
      return KeyboardEvent.DOM_VK_RETURN;

    case " ":
      return KeyboardEvent.DOM_VK_SPACE;

    default:
      return 0;
  }
}
function createKeyboardEventDictionary_(key, keyEvent, win) {
  const result = { dictionary: null, flags: 0 };
  const keyCodeIsDefined =
    "keyCode" in keyEvent && keyEvent.keyCode !== undefined;
  let keyCode =
    keyCodeIsDefined && keyEvent.keyCode >= 0 && keyEvent.keyCode <= 255
      ? keyEvent.keyCode
      : 0;
  let keyName = "Unidentified";

  let printable = false;

  if (key.indexOf("KEY_") === 0) {
    keyName = key.substr("KEY_".length);
    result.flags |= Ci.nsITextInputProcessor.KEY_NON_PRINTABLE_KEY;
  } else if (key.indexOf("VK_") === 0) {
    keyCode = getKeyboardEvent_(win)["DOM_" + key];
    if (!keyCode) {
      throw new Error("Unknown key: " + key);
    }
    keyName = guessKeyNameFromKeyCode_(keyCode, win);
    if (!isPrintable(keyCode, win)) {
      result.flags |= Ci.nsITextInputProcessor.KEY_NON_PRINTABLE_KEY;
    }
  } else if (key !== "") {
    keyName = key;
    if (!keyCodeIsDefined) {
      keyCode = computeKeyCodeFromChar_(key.charAt(0), win);
    }
    if (!keyCode) {
      result.flags |= Ci.nsITextInputProcessor.KEY_KEEP_KEYCODE_ZERO;
    }
    // only force printable if "raw character" and event key match, like "a"
    if (!("key" in keyEvent && key !== keyEvent.key)) {
      result.flags |= Ci.nsITextInputProcessor.KEY_FORCE_PRINTABLE_KEY;
      printable = true;
    }
  }

  const locationIsDefined = "location" in keyEvent;
  if (locationIsDefined && keyEvent.location === 0) {
    result.flags |= Ci.nsITextInputProcessor.KEY_KEEP_KEY_LOCATION_STANDARD;
  }

  let resultKey = "key" in keyEvent ? keyEvent.key : keyName;
  if (printable && keyEvent.shiftKey) {
    resultKey = resultKey.toUpperCase();
  }

  result.dictionary = {
    key: resultKey,
    code: "code" in keyEvent ? keyEvent.code : "",
    location: locationIsDefined ? keyEvent.location : 0,
    repeat: "repeat" in keyEvent ? keyEvent.repeat === true : false,
    keyCode,
  };

  return result;
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
function emulateToInactivateModifiers_(TIP, modifiers, win) {
  if (!modifiers) {
    return;
  }
  const KeyboardEvent = getKeyboardEvent_(win);
  for (let i = 0; i < modifiers.normal.length; i++) {
    if (!modifiers.normal[i].activated) {
      continue;
    }
    const event = new KeyboardEvent("", { key: modifiers.normal[i].key });
    TIP.keyup(
      event,
      TIP.KEY_NON_PRINTABLE_KEY | TIP.KEY_DONT_DISPATCH_MODIFIER_KEY_EVENT
    );
  }
  for (let j = 0; j < modifiers.lockable.length; j++) {
    if (!modifiers.lockable[j].activated) {
      continue;
    }
    if (!TIP.getModifierState(modifiers.lockable[j].key)) {
      continue; // who already inactivated this?
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

          async sendKeyboardEvent(tabId, eventProperties) {
            function getTabOrActive(tabId) {
              const tab =
                tabId !== null
                  ? tabTracker.getTab(tabId)
                  : tabTracker.activeTab;
              if (!context.canAccessWindow(tab.ownerGlobal)) {
                throw new ExtensionError(
                  tabId === null
                    ? "Cannot access activeTab"
                    : `Invalid tab ID: ${tabId}`
                );
              }
              return tab;
            }

            const tab = getTabOrActive(tabId);
            const KeyboardEvent = new KeyboardEvent(eventProperties);
            tab.sendEvent(KeyboardEvent);
          },
        },
      },
    };
  }
};
