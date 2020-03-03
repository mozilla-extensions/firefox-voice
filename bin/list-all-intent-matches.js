const toml = require("toml");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const { extensionDir, writeFile } = require("./script-utils.js");

const INTENT_DIR = path.join(extensionDir, "intents");

function splitPhraseLines(string) {
  if (typeof string !== "string") {
    throw new Error(`Bad input: ${string}`);
  }
  const result = [];
  for (let line of string.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) {
      continue;
    }
    result.push(line);
  }
  return result;
}

function _isAltWord(string) {
  return /\{[^}]+\}/.test(string);
}

function _altWords(string) {
  const bit = /\{([^}]+)\}/.exec(string)[1];
  const baseWord = string.replace(/\{[^}]+\}/, "");
  const altWord = string.replace(/\{[^}]\}/, bit);
  return [baseWord, altWord];
}

const metadata = {};

for (const filename of glob.sync(INTENT_DIR + "/**/*.toml")) {
  const intentName = path.basename(filename, ".toml");
  let data;
  try {
    data = toml.parse(fs.readFileSync(filename));
  } catch (e) {
    console.warn("Error:", e, "in file:", filename);
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

for (const intent of Object.keys(metadata)) {
  for (const command of Object.keys(metadata[intent])) {
    const matcher = metadata[intent][command]["match"];
    for (const line of splitPhraseLines(matcher)) {
      let removedParams = line.replace(/\[\w+=\w+\]/g, "")
      // convert "base{alternative}" syntax to regex
      if (_isAltWord(removedParams)) {
        removedParams = removedParams.replace(/\{([^}]+)\}/g, "($1)?");
      }
      // escape literal periods
      removedParams = removedParams.replace(".", "\\.");
      // ignore slots for now
      if (!removedParams.includes("[")) {
        console.log(removedParams);
      } else {
        console.error("Ignoring a match in " + intent + "." + command + " because it has slots. (" + line + ")");
      }
    }
  }
}
