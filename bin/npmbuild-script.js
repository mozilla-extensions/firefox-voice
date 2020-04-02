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
          ///testing testing
          const newCode = fs.readFileSync(newCodePath, {
            encoding: "UTF-8",
          }); //old file
          const existing = fs.readFileSync(existingCodePath, {
            encoding: "UTF-8",
          }); //new file
          if (existing === newCode) {
            ///means they are the same
            return;
          } else {
            console.log("changed");
            fs.writeFileSync(existingCodePath, newCode, {
              encoding: "UTF-8",
            });
          }
        } else {
          const newCode = fs.readFileSync(newCodePath, {
            encoding: "UTF-8",
          }); //old file

          fs.writeFile(existingCodePath, newCode, err => {
          });
        }
      });
    });
  });
});
