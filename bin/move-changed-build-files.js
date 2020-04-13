/* eslint-disable no-console */
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const DIR = "./build";

let written = 0;
let unchanged = 0;
const files = glob.sync(DIR + "/**/*.js");

files.forEach(newPath => {
  const existingPath = path.join("./extension", path.relative(DIR, newPath));
  if (fs.existsSync(newPath) && fs.existsSync(existingPath)) {
    const newCode = fs.readFileSync(newPath, {
      encoding: "UTF-8",
    });
    const existing = fs.readFileSync(existingPath, {
      encoding: "UTF-8",
    });
    if (existing !== newCode) {
      console.log(existingPath, "changed");
      fs.writeFileSync(existingPath, newCode, {
        encoding: "UTF-8",
      });
      written++;
    } else {
      unchanged++;
    }
  } else {
    const newCode = fs.readFileSync(newPath, {
      encoding: "UTF-8",
    });
    fs.writeFileSync(existingPath, newCode, { encoding: "UTF-8" });
    written++;
  }
});

console.log(`${written} files changed, ${unchanged} unchanged`);
