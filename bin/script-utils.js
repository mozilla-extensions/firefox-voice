/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

exports.extensionDir = path.normalize(path.join(__dirname, "../extension"));

function displayPath(p) {
  const base = path.normalize(path.join(__dirname, "../"));
  if (p.startsWith(base)) {
    return p.substr(base.length);
  }
  return p;
}

exports.writeFile = function(path, content, verbose = false) {
  if (fs.existsSync(path)) {
    const existing = fs.readFileSync(path, { encoding: "UTF-8" });
    if (existing === content) {
      if (verbose) {
        console.log(`File ${displayPath(path)} unchanged`);
      }
      return;
    }
  }
  fs.writeFileSync(path, content, { encoding: "UTF-8" });
  if (verbose) {
    console.log(`Wrote ${displayPath(path)} (${content.length} chars)`);
  }
};

exports.copyFile = function(source, dest, verbose = false) {
  const existing = fs.readFileSync(source, { encoding: "UTF-8" });
  exports.writeFile(dest, existing, verbose);
};
