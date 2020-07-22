#!/usr/bin/env node

const rollup = require("rollup");
const glob = require("glob");
const scriptUtils = require("./script-utils.js");
const path = require("path");
const tmp = require("tmp");

async function run() {
  for (const input of glob.sync(
    path.join(scriptUtils.extensionDir, "**/*.content.js")
  )) {
    const tmpObj = tmp.fileSync();
    const outputFilename = input.replace(/\.content\.js$/, ".bundle.js");
    const bundle = await rollup.rollup({
      input,
    });
    await bundle.write({
      format: "iife",
      sourcemap: "inline",
      file: tmpObj.name,
    });
    scriptUtils.copyFile(tmpObj.name, outputFilename, true);
    tmpObj.removeCallback();
  }
}

run();
