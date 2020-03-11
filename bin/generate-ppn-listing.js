/* eslint-disable no-console */

// Ignore these words:
const SKIP_WORDS = [
  "deep pink",
  "deep sky blue",
  "dim gray",
  "fire brick",
  "forest green",
  "hot pink",
  "lavender blush",
  "lime green",
  "midnight blue",
  "navy_blue",
  "papaya whip",
  "peach puff",
  "picovoice",
  "sandy brown",
  "white smoke",
];

const fs = require("fs");
const path = require("path");

const ppnDir = path.join(__dirname, "../extension/js/vendor/porcupine-models");
const filenames = fs
  .readdirSync(ppnDir)
  .filter(filename => filename.endsWith(".ppn"));
filenames.sort();

const listing = [];

for (const filename of filenames) {
  const data = fs.readFileSync(path.join(ppnDir, filename));
  const base64Data = data.toString("base64");
  const name = filename.replace(".ppn", "").replace("_wasm", "");
  if (SKIP_WORDS.includes(name)) {
    continue;
  }
  listing.push({
    base64Data,
    name,
  });
}

const contents = listing
  .map(
    item => `
  ${JSON.stringify(item.name)}: ${JSON.stringify(item.base64Data)},`
  )
  .join("");

const jsFile = `this.ppnListing = {${contents}};`;

console.log(jsFile);
