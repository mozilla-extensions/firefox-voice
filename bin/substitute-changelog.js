/* eslint-disable no-console */

const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const MarkdownIt = require("markdown-it");

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true,
});

const CHANGELOG = path.normalize(path.join(__dirname, "../CHANGELOG.md"));
const CHANGELOG_OUTPUT = path.normalize(
  path.join(__dirname, "../extension/views/CHANGELOG.html")
);
const CHANGELOG_TEMPLATE = CHANGELOG_OUTPUT + ".ejs";
const CHANGELOG_TEXT = fs.readFileSync(CHANGELOG, { encoding: "UTF-8" });

const context = { content: markdown.render(CHANGELOG_TEXT) };

ejs.renderFile(CHANGELOG_TEMPLATE, context, {}, function(err, str) {
  if (err) {
    console.error("Error rendering template:", err);
    process.exit(1);
    return;
  }
  fs.writeFileSync(CHANGELOG_OUTPUT, str, { encoding: "UTF-8" });
  console.log(`${CHANGELOG_OUTPUT} written`);
});

const LEXICON = path.normalize(path.join(__dirname, "../docs/lexicon.md"));
const LEXICON_OUTPUT = path.normalize(
  path.join(__dirname, "../extension/views/lexicon.html")
);
const LEXICON_TEMPLATE = LEXICON_OUTPUT + ".ejs";
const LEXICON_TEXT = fs.readFileSync(LEXICON, { encoding: "UTF-8" });

const lexiconContext = { content: markdown.render(LEXICON_TEXT) };

ejs.renderFile(
  LEXICON_TEMPLATE,
  lexiconContext,
  { dialect: "maruku" },
  function(err, str) {
    if (err) {
      console.error("Error rendering template:", err);
      process.exit(1);
      return;
    }
    fs.writeFileSync(LEXICON_OUTPUT, str, { encoding: "UTF-8" });
    console.log(`${LEXICON_OUTPUT} written`);
  }
);

const PRIVACY_POLICY = path.normalize(
  path.join(__dirname, "../docs/privacy-policy.md")
);
const PRIVACY_OUTPUT = path.normalize(
  path.join(__dirname, "../extension/views/privacy-policy.html")
);
const PRIVACTY_TEMPLATE = PRIVACY_OUTPUT + ".ejs";
const PRIVACY_TEXT = fs.readFileSync(PRIVACY_POLICY, { encoding: "UTF-8" });
let privacyHtml = markdown.render(PRIVACY_TEXT);
const PRIVACY_TITLE = /<h1>(.*?)<\/h1>/i.exec(privacyHtml)[1];
privacyHtml = privacyHtml.replace(/<h1>(.*?)<\/h1>/i, "");

const privacyContext = {
  content: privacyHtml,
  title: PRIVACY_TITLE,
};

ejs.renderFile(
  PRIVACTY_TEMPLATE,
  privacyContext,
  { dialect: "maruku" },
  function(err, str) {
    if (err) {
      console.error("Error rendering template:", err);
      process.exit(1);
      return;
    }
    fs.writeFileSync(PRIVACY_OUTPUT, str, { encoding: "UTF-8" });
    console.log(`${PRIVACY_OUTPUT} written`);
  }
);
