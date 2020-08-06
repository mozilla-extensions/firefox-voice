/* globals log */
import { registerHandler } from "../../communicate.js";

registerHandler("signInAndOut", message => {
  const regex = /log\s*(out|in)|sign\s*(out|in)/i;

  let element;

  for (const link of findButton()) {
    if (regex.test(link.innerText)) {
      element = link;
      break;
    }
  }
  if (!element) {
    return false;
  }

  highlightButton(element);
  element.scrollIntoView();
  setTimeout(() => {
    log.info("Following link to:", element.href || "?");
    element.click();
  }, 100);
  return true;
});

function highlightButton(el) {
  el.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
}

function findButton() {
  return document.body.querySelectorAll("button, a, *[role=button]");
}
