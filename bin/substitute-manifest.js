const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const package_json = require("../package.json");

const OUTPUT = path.normalize(path.join(__dirname, "../extension/manifest.json"));
const TEMPLATE = OUTPUT + ".ejs";

const context = {
  env: process.env,
  package_json,
};

// ejs options:
const options = {
  escape: JSON.stringify,
};

ejs.renderFile(TEMPLATE, context, options, function(err, str) {
  if (err) {
    console.error("Error rendering template:", err);
    process.exit(1);
    return;
  }
  fs.writeFileSync(OUTPUT, str, {encoding: "UTF-8"});
  console.log(`${OUTPUT} written`);
});
