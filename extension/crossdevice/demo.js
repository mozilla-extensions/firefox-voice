/* eslint-disable no-console */
/* globals firebase, buildSettings */

const logEl = document.querySelector("#log");
const formEl = document.querySelector("#input-form");
const textEl = document.querySelector("#input-text");
const micEl = document.querySelector("#mic");

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
  sendUtterance(text);
});

const Recog = window.webkitSpeechRecognition || window.SpeechRecognition;

const playListeningChime = () => {
  const audio = new Audio("https://mozilla.github.io/firefox-voice/chime.ogg");
  audio.play();
};

micEl.addEventListener("click", () => {
  if (!key) {
    log("No key loaded");
    return;
  }
  micEl.style.backgroundColor = "#900";
  micEl.textContent = micEl.textContent.replace(/speak/, "listening...");
  playListeningChime();
  const recognition = new Recog();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  recognition.onresult = event => {
    micEl.style.backgroundColor = null;
    micEl.textContent = micEl.textContent.replace(/listening\.\.\./, "speak");
    const text = event.results[0][0].transcript;
    sendUtterance(text);
  };
});

if (!Recog) {
  micEl.style.display = "none";
}

function sendUtterance(text) {
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
}

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

function safeAtob(text) {
  if (text.startsWith(".")) {
    return text.substr(1);
  }
  let encoded = text.replace("-", "+").replace("_", "/");
  while (encoded.length % 4) {
    encoded += "=";
  }
  return atob(encoded);
}

const DEFAULT_PROPS = {
  alg: "A256GCM",
  ext: true,
  kty: "oct",
};

function fillKey(key) {
  if (typeof key === "string") {
    key = { k: key };
  }
  key = Object.assign({}, DEFAULT_PROPS, key);
  return key;
}

async function init() {
  const params = new URLSearchParams(location.hash.substr(1));
  let keyExport = safeAtob(params.get("k"));
  keyExport = fillKey(keyExport);
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
  userId = params.get("u");
  console.log("key imported:", key);
  firebase.initializeApp(buildSettings.firebaseConfig);
  db = firebase.firestore();
}

init();
