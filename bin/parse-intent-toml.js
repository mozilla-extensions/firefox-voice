/* eslint-disable no-console */
const toml = require("toml");
const path = require("path");
const fs = require("fs");
const glob = require("glob");

const OUTPUT = path.normalize(
  path.join(__dirname, "../extension/intents/metadata.js")
);
const SYNC_OUTPUT = path.normalize(
  path.join(__dirname, "../extension/services/metadata.js")
);
const INTENT_DIR = path.normalize(path.join(__dirname, "../extension/intents"));
const SERVICE_DIR = path.normalize(
  path.join(__dirname, "../extension/services")
);

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

const fileContent = `export const metadata = ${JSON.stringify(
  metadata,
  null,
  "  "
)};\n`;

fs.writeFileSync(OUTPUT, fileContent, { encoding: "UTF-8" });
console.log(`Wrote file ${OUTPUT} (${fileContent.length} characters)`);

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

const serviceContent = `export const metadata = ${JSON.stringify(
  serviceMetadata,
  null,
  "  "
)};\n`;

fs.writeFileSync(SYNC_OUTPUT, serviceContent, { encoding: "UTF-8" });
console.log(`Wrote file ${SYNC_OUTPUT} (${serviceContent.length} characters)`);
