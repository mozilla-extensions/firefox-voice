/* globals firebase, buildSettings, log */

import * as intentRunner from "../background/intentRunner.js";

// See https://github.com/diafygi/webcrypto-examples
const KEY_ALGO = {
  name: "AES-GCM",
  length: 256,
};

let db;
let key;
let keyExport;
let userId;

function generateUserId() {
  const random = crypto.getRandomValues(new Uint8Array(24));
  const name = arrayBufferToBase64(random);
  return `user-${name.replace("=", "")}`;
}

function strToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
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

async function encrypt(data) {
  const text = JSON.stringify(data);
  const buffer = strToArrayBuffer(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    buffer
  );
  return {
    iv: arrayBufferToBase64(iv),
    encrypted: arrayBufferToBase64(encrypted),
  };
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
    key = await await crypto.subtle.importKey(
      "jwk",
      keyExport,
      KEY_ALGO,
      true,
      ["encrypt", "decrypt"]
    );
  }
}

export async function init() {
  await initUserId();
  await initKey();
  firebase.initializeApp(buildSettings.firebaseConfig);
  db = firebase.firestore();
  listen();
  console.log(
    "Open file:",
    browser.runtime.getURL("/crossdevice/demo.html") +
      `#key=${encodeURIComponent(
        JSON.stringify(keyExport)
      )}&userId=${encodeURIComponent(userId)}`
  );
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
  await browser.experiments.voice.openPopup();
  const intervalId = setInterval(async () => {
    const result = await browser.runtime.sendMessage({
      type: "remoteUtterance",
      utterance: command.utterance,
    });
    if (result) {
      clearTimeout(intervalId);
    }
  }, 50);
}
