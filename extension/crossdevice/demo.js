/* eslint-disable no-console */
/* globals firebase, buildSettings */

const logEl = document.querySelector("#log");
const formEl = document.querySelector("#input-form");
const textEl = document.querySelector("#input-text");

let key;
let userId;
let db;

formEl.addEventListener("submit", event => {
  event.preventDefault();
  if (!key) {
    log("No key loaded");
    return;
  }
  const text = textEl.value;
  textEl.value = "";
  log(`Sending text: ${text}`);
  sendCommand({ utterance: text }).then(
    () => {
      log("Sent!");
    },
    e => {
      console.error("Error sending command:", e);
      log(`Error sending: ${e}`);
    }
  );
});

function log(text) {
  logEl.textContent = text + "\n" + logEl.textContent;
}

function strToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

async function sendCommand(command) {
  const payload = await encrypt(command);
  await db
    .collection("commands")
    .doc(userId)
    .collection("inbox")
    .doc("C" + Date.now())
    .set({ payload });
}

async function init() {
  const params = new URLSearchParams(location.hash.substr(1));
  const keyExport = JSON.parse(params.get("key"));
  log(`Loaded key: ${JSON.stringify(keyExport)}`);
  key = await crypto.subtle.importKey(
    "jwk",
    keyExport,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  userId = params.get("userId");
  console.log("key imported:", key);
  firebase.initializeApp(buildSettings.firebaseConfig);
  db = firebase.firestore();
}

init();
