/* eslint-disable no-console */
const fs = require("fs");
const DIR = "./build";

fs.readdir(DIR, (err, files) => {
  files.map(file => {
    const pathtofile = `${DIR}/${file}`;
    fs.readdir(pathtofile, (err, fileItems) => {
      fileItems.map(path => {
        const newCodePath = `${pathtofile}/${path}`;
        const existingCodePath = `./extension/${file}/${path}`;
        if (fs.existsSync(newCodePath) && fs.existsSync(existingCodePath)) {
          const newCode = fs.readFileSync(newCodePath, {
            encoding: "UTF-8",
          });
          const existing = fs.readFileSync(existingCodePath, {
            encoding: "UTF-8",
          });
          if (existing === newCode) {
              console.log("files not changed");
          } else {
            console.log("files changed");
            fs.writeFileSync(existingCodePath, newCode, {
              encoding: "UTF-8",
            });
          }
        } else {
          const newCode = fs.readFileSync(newCodePath, {
            encoding: "UTF-8",
          });

          fs.writeFile(existingCodePath, newCode, err => {
          });
        }
      });
    });
  });
});
