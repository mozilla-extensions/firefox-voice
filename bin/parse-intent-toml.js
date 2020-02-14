/* eslint-disable no-console */
const toml = require("toml");
const path = require("path");
const fs = require("fs");

const OUTPUT = path.normalize(
  path.join(__dirname, "../extension/intents/metadata.js")
);
const INTENT_DIR = path.normalize(path.join(__dirname, "../extension/intents"));

function ignoreFilename(filename) {
  return (
    filename.startsWith(".") ||
    filename.endsWith(".txt") ||
    filename.endsWith(".js")
  );
}

const filenames = fs.readdirSync(INTENT_DIR, { encoding: "UTF-8" });
const intentNames = [];
for (const filename of filenames) {
  if (!ignoreFilename(filename)) {
    intentNames.push(filename);
  }
}

const metadata = {};

for (const intentName of intentNames) {
  const filename = path.join(INTENT_DIR, intentName, intentName + ".toml");
  let data;
  try {
    data = toml.parse(fs.readFileSync(filename));
  } catch (e) {
    console.warn("Error:", e);
    continue;
  }
  if (Object.keys(data).length > 1 || !data[intentName]) {
    console.error(
      `File ${filename} should only contain the top-level key ${intentName} (not ${Object.keys(
        data
      )})`
    );
    process.exit(1);
  }
  if (metadata[intentName]) {
    throw new Error(`Unexpected existing key for ${intentName}`);
  }
  Object.assign(metadata, data);
}

const fileContent = `export const metadata = ${JSON.stringify(
  metadata,
  null,
  "  "
)};\n`;

fs.writeFileSync(OUTPUT, fileContent, { encoding: "UTF-8" });
console.log(`Wrote file ${OUTPUT} (${fileContent.length} characters)`);
