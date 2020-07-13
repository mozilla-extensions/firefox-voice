/* globals log */

const HANDLERS = {};
const DEFAULT_SEND_TIMEOUT = 60000; // 1 minute

export function registerHandler(type, handler) {
  if (HANDLERS[type]) {
    throw new Error(`There is already a handler for the message type ${type}`);
  }
  HANDLERS[type] = handler;
}

export function handleMessage(message, sender) {
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
  return undefined;
}

export function registerOnMessage() {
  browser.runtime.onMessage.addListener(handleMessage);
}

export async function send(message, options) {
  if (!message.type) {
    throw new Error("message.type is required in send()");
  }
  options = options || {};
  return Promise.resolve(async (resolve, reject) => {
    let result;
    const timeout = options.timeout || DEFAULT_SEND_TIMEOUT;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout sending ${message.type}`));
    }, timeout);
    try {
      if (options.tabId) {
        result = await browser.tabs.sendMessage(options.tabId, message);
      } else {
        result = await browser.runtime.sendMessage(message);
      }
      clearTimeout(timeoutId);
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.message.includes("Missing host permission for the tab")) {
        e.displayMessage = "That does not work on this kind of page";
      }
      throw e;
    }
    if (result && typeof result === "object" && result.type === "error") {
      const exc = new Error(result.message);
      exc.name = result.name;
      exc.displayMessage = result.displayMessage;
      reject(exc);
    }
    resolve(result);
  });
}
