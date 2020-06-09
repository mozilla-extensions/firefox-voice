/* globals firebase, buildSettings, log */

// See https://github.com/diafygi/webcrypto-examples
const KEY_ALGO = {
  name: "AES-GCM",
  length: 256,
};

const BASE_SHARE = "https://mozilla.github.io/firefox-voice/crossdevice/";

let db;
let key;
let keyExport;
let userId;

function generateUserId() {
  const random = crypto.getRandomValues(new Uint8Array(10));
  const name = arrayBufferToBase64(random)
    .replace("+", "-")
    .replace("/", "_")
    .replace("=", "");
  return `u-${name.replace("=", "")}`;
}

function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const letters = btoa(binary);
  return letters.replace("+", "-").replace("/", "_");
}

function base64ToArrayBuffer(base64) {
  base64 = base64.replace("-", "+").replace("_", "/");
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function decrypt(data) {
  const buffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(data.iv),
    },
    key,
    base64ToArrayBuffer(data.encrypted)
  );
  const text = arrayBufferToString(buffer);
  return JSON.parse(text);
}

async function initUserId() {
  const result = await browser.storage.local.get(["firestoreUserId"]);
  if (!result.firestoreUserId) {
    userId = generateUserId();
    await browser.storage.local.set({ firestoreUserId: userId });
  } else {
    userId = result.firestoreUserId;
  }
}

async function initKey() {
  const result = await browser.storage.local.get(["firestoreKey"]);
  if (!result.firestoreKey) {
    key = await crypto.subtle.generateKey(KEY_ALGO, true, [
      "encrypt",
      "decrypt",
    ]);
    keyExport = await crypto.subtle.exportKey("jwk", key);
    await browser.storage.local.set({ firestoreKey: keyExport });
  } else {
    keyExport = result.firestoreKey;
    key = await crypto.subtle.importKey("jwk", keyExport, KEY_ALGO, true, [
      "encrypt",
      "decrypt",
    ]);
  }
}

export function safeBtoa(obj) {
  if (typeof obj === "string") {
    return "." + obj;
  }
  const text = JSON.stringify(obj);
  const encoded = btoa(text)
    .replace("+", "-")
    .replace("/", "_")
    .replace("=", "");
  return encoded;
}

const DEFAULT_PROPS = {
  alg: "A256GCM",
  ext: true,
  kty: "oct",
};

export function deviceUrl() {
  let newKey = Object.assign({}, keyExport);
  delete newKey.key_ops;
  for (const name in DEFAULT_PROPS) {
    if (newKey[name] === DEFAULT_PROPS[name]) {
      delete newKey[name];
    }
  }
  if (Object.keys(newKey).length === 1) {
    newKey = newKey.k;
  }
  return `${BASE_SHARE}?${Math.floor(Date.now() / 60000) -
    26520000}#k=${encodeURIComponent(safeBtoa(newKey))}&u=${encodeURIComponent(
    userId
  )}`;
}

export async function init() {
  await initUserId();
  await initKey();
  firebase.initializeApp(buildSettings.firebaseConfig);
  db = firebase.firestore();
  listen();
}

function listen() {
  db.collection("commands")
    .doc(userId)
    .collection("inbox")
    .onSnapshot(
      async snapshot => {
        const items = [];
        snapshot.forEach(doc => items.push(doc));
        for (const doc of items) {
          const data = doc.data();
          try {
            await executeCommand(data);
            // FIXME: I'm sure this is a terrible way to do the delete:
            await db
              .collection("commands")
              .doc(userId)
              .collection("inbox")
              .doc(doc.id)
              .delete();
          } catch (e) {
            log.error("Error trying to execute command:", data, e);
            await db
              .collection("commands")
              .doc(userId)
              .collection("inbox")
              .doc(doc.id)
              .delete();
          }
        }
      },
      error => {
        log.error("Error receiving Firebase snapshots:", error);
      }
    );
  log.info("Listening for commands");
}

async function executeCommand(data) {
  const command = await decrypt(data.payload);
  log.info("Running remote command:", command.utterance);
  let popupOpen = false;
  try {
    popupOpen = await browser.runtime.sendMessage({
      type: "pingPopup",
    });
  } catch (e) {
    // An error is OK, no popup was listening
  }
  if (popupOpen) {
    // This should close it:
    await browser.experiments.voice.openPopup();
  }
  await browser.experiments.voice.openPopup();
  const limit = Date.now() + 5000;
  const intervalId = setInterval(async () => {
    if (Date.now() > limit) {
      log.error("Could not open popup to run", command.utterance);
      clearTimeout(intervalId);
      return;
    }
    const result = await browser.runtime.sendMessage({
      type: "remoteUtterance",
      utterance: command.utterance,
    });
    if (result) {
      clearTimeout(intervalId);
    }
  }, 150);
}
