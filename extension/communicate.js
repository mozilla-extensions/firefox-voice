/* globals log */

const HANDLERS = {};
const DEFAULT_SEND_TIMEOUT = 60000; // 1 minute
const NO_RECEIVER_MESSAGE =
  "Could not establish connection. Receiving end does not exist";

export function registerHandler(type, handler) {
  if (HANDLERS[type]) {
    throw new Error(`There is already a handler for the message type ${type}`);
  }
  for (const otherHandler of window.otherCommunicateHandlers) {
    if (otherHandler === HANDLERS) {
      continue;
    }
    if (type in otherHandler) {
      log.debug(`Removing out-of-date handler for ${type}`);
      delete otherHandler[type];
    }
  }
  HANDLERS[type] = handler;
}

export function handleMessage(message, sender) {
  if (message.type === "canRespondToMessage") {
    if (HANDLERS[message.messageType]) {
      log.messaging(
        `!! canRespondToMessage(${message.messageType}) true for ${location.href}`
      );
      return Promise.resolve(true);
    }
    // Note if this doesn't respond, then some other consumer may respond:
    log.messaging(
      `!! canRespondToMessage(${message.messageType}) false for ${location.href}`
    );
    return undefined;
  }
  const properties = Object.assign({}, message);
  delete properties.type;
  let propString = "";
  let senderInfo = "? ->";
  if (Object.keys(properties).length) {
    propString = ` ${JSON.stringify(properties)}`;
  }
  if (!sender.tab) {
    senderInfo = "popup ->";
  } else if (
    sender.url.startsWith("moz-extension:") &&
    sender.url.endsWith("recorder.html")
  ) {
    senderInfo = "record->";
  } else if (sender.url.endsWith("options.html")) {
    senderInfo = "option->";
  }
  log.messaging(`!! ${senderInfo} ${message.type}${propString}`);
  if (HANDLERS[message.type]) {
    try {
      return Promise.resolve(HANDLERS[message.type](message, sender));
    } catch (e) {
      if (e.displayMessage) {
        return Promise.resolve({
          type: "error",
          name: e.name,
          message: e.message || String(e),
          displayMessage: e.displayMessage,
        });
      }
      // If there is no displayMessage we'll just rely on the normal exception mechanism:
      throw e;
    }
  }
  if (window.isBackgroundPage) {
    log.info("No handler for", message.type, Object.keys(HANDLERS));
  }
  return undefined;
}

function registerOnMessage() {
  if (!window.otherCommunicateHandlers) {
    window.otherCommunicateHandlers = [];
  }
  window.otherCommunicateHandlers.push(HANDLERS);
  browser.runtime.onMessage.addListener(handleMessage);
}

export async function sendMessage(message, options) {
  if (!message.type) {
    throw new Error("message.type is required in send()");
  }
  options = options || {};
  return new Promise((resolve, reject) => {
    let result;
    const timeout = options.timeout || DEFAULT_SEND_TIMEOUT;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout sending ${message.type}`));
    }, timeout);
    if (options.tabId) {
      result = browser.tabs.sendMessage(options.tabId, message);
    } else {
      result = browser.runtime.sendMessage(message);
    }
    clearTimeout(timeoutId);
    result.then(
      value => {
        if (value && typeof value === "object" && value.type === "error") {
          const exc = new Error(value.message);
          exc.name = value.name;
          exc.displayMessage = value.displayMessage;
          reject(exc);
        } else {
          resolve(value);
        }
      },
      e => {
        clearTimeout(timeoutId);
        if (e.message.includes("Missing host permission for the tab")) {
          e.displayMessage = "That does not work on this kind of page";
        }
        throw e;
      }
    );
    resolve(result);
  });
}

export async function canRespondToMessage(messageType, options) {
  options = options || {};
  const message = {
    type: "canRespondToMessage",
    messageType,
  };
  let result;
  try {
    if (options.tabId) {
      result = await browser.tabs.sendMessage(options.tabId, message);
    } else {
      result = await browser.runtime.sendMessage(message);
    }
  } catch (e) {
    if (e.message.includes(NO_RECEIVER_MESSAGE)) {
      return false;
    }
    throw e;
  }
  return result;
}

registerOnMessage();
