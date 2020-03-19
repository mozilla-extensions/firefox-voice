/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");


exports.writeFile = function(path, data, verbose = false) {
  if (fs.existsSync(path)) {
    const existing = fs.readFileSync(path, { encoding: "UTF-8" });
    if (existing === data) {
      if (verbose) {
        console.log(`File unchanged`);
      }
      return;
    }
  }
  fs.writeFileSync(path, data, { encoding: "UTF-8" });
  if (!verbose) {
    console.log(`Wrote (${data.length} chars)`);
    copyFile(data);
  }
};

exports.copyFile = function(data, buildDir) {
    fs.mkdir('build/dist', { recursive: true }, (err) => {
        if (err) console.log(err) ;
      });
  fs.copyFileSync("/lib", "/dist", data, err =>{
      if(err){
        console.log("doesnt work");
          throw err;
      }
  });
};
