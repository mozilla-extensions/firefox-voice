/* globals Fuse */
import { registerHandler } from "../../communicate.js";

registerHandler("focusField", async message => {
  const helpElement = message.query;
  const elements = [];
  const searchContent = [];
  for (const el of document.querySelectorAll(
    ".intent, .description, .utterance"
  )) {
    elements.push(el);
    searchContent.push({
      element: el,
      innerText: el.innerText,
    });
  }
  const options = {
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    findAllMatches: true,
    includeScore: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [
      {
        name: "innerText",
        weight: 0.9,
      },
    ],
  };
  const fuse = new Fuse(searchContent, options);
  const matches = fuse.search(helpElement);
  if (!matches.length) {
    return false;
  }
  const el = matches[0].item.element;
  focus(el);
  return true;
});

function focus(element) {
  element.scrollIntoView(true);
  element.focus();
}
