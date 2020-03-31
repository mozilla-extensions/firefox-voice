/* eslint-disable no-console */
const toml = require("toml");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const { extensionDir, writeFile } = require("./script-utils.js");

const OUTPUT = path.join(extensionDir, "intents/metadata.js");
const SYNC_OUTPUT = path.join(extensionDir, "/services/metadata.js");
const INTENT_DIR = path.join(extensionDir, "intents");
const SERVICE_DIR = path.join(extensionDir, "services");
const LANG_DIR = path.join(extensionDir, "background/language/langs");

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
  for (const subcommand in data[intentName]) {
    const command = data[intentName][subcommand];
    if (command.example && command.examples) {
      console.error(
        `File ${filename} has [[${intentName}.${subcommand}.example]] and [[...examples]]`
      );
      process.exit(2);
    }
    if (
      (command.example && !Array.isArray(command.example)) ||
      (command.examples && !Array.isArray(command.examples))
    ) {
      console.error(
        `File ${filename} does not use [[]] around ${intentName}.${subcommand}.example`
      );
      process.exit(3);
    }
  }
  if (metadata[intentName]) {
    throw new Error(`Unexpected existing key for ${intentName}`);
  }
  Object.assign(metadata, data);
}

const fileContent = `// Generated from intents/*/*.toml
export const metadata = ${JSON.stringify(metadata, null, "  ")};\n`;

writeFile(OUTPUT, fileContent, true);

const serviceMetadata = { search: {}, music: {} };

for (const filename of glob.sync(SERVICE_DIR + "/*/*.toml")) {
  let data;
  try {
    data = toml.parse(fs.readFileSync(filename));
  } catch (e) {
    console.warn("Error:", e, "in file:", filename);
    continue;
  }
  if (Object.keys(data).length !== 1) {
    throw new Error(`Only expected one section in ${filename}`);
  }
  const name = Object.keys(data)[0];
  const type = data[name].type;
  data[name].names = (data[name].names || []).concat([name]);
  if (type !== "music") {
    throw new Error(`Expected type=music in ${filename}`);
  }
  delete data[name].type;
  Object.assign(serviceMetadata.music, data);
}

let searchData;
const searchDataFilename = SERVICE_DIR + "/searchServices.toml";

try {
  searchData = toml.parse(fs.readFileSync(searchDataFilename));
} catch (e) {
  console.warn("Error:", e, "in file:", searchDataFilename);
  throw e;
}

for (const name in searchData) {
  searchData[name].names = (searchData[name].names || []).concat([name]);
}
Object.assign(serviceMetadata.search, searchData);

const serviceContent = `// Generated from ${path.basename(searchDataFilename)}
export const metadata = ${JSON.stringify(serviceMetadata, null, "  ")};\n`;

writeFile(SYNC_OUTPUT, serviceContent);

for (const filename of glob.sync(LANG_DIR + "/*.toml")) {
  let data;
  try {
    data = toml.parse(fs.readFileSync(filename));
  } catch (e) {
    console.warn("Error:", e, "in file:", filename);
    continue;
  }
  if (
    !Array.isArray(data.stopwords) &&
    typeof data.stopwords.words === "string"
  ) {
    let lines = data.stopwords.words.split("\n");
    lines = lines
      .map(l => l.trim())
      .filter(l => !l.startsWith("#") && !l.startsWith("//") && l);
    lines = lines.map(l => l.split(/\s+/g));
    lines = lines.flat();
    data.stopwords = lines;
  }
  const content = `// Generated from ${path.basename(filename)}
import { Language } from "./lang.js";

const lang = new Language(${JSON.stringify(data, null, "  ")}
);

export default lang;
`;

  const outputFilename = filename.replace(/\.toml$/, ".js");
  writeFile(outputFilename, content);
}
