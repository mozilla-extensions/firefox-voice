const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const { markdown } = require("markdown");

const CHANGELOG = path.normalize(path.join(__dirname, "../CHANGELOG.md"));
const OUTPUT = path.normalize(
  path.join(__dirname, "../extension/views/CHANGELOG.html")
);
const TEMPLATE = OUTPUT + ".ejs";
const CHANGELOG_TEXT = fs.readFileSync(CHANGELOG, { encoding: "UTF-8" });

const context = { content: markdown.toHTML(CHANGELOG_TEXT) };

ejs.renderFile(TEMPLATE, context, {}, function(err, str) {
  if (err) {
    console.error("Error rendering template:", err);
    process.exit(1);
    return;
  }
  fs.writeFileSync(OUTPUT, str, { encoding: "UTF-8" });
  console.log(`${OUTPUT} written`);
});
