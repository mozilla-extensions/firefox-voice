/* globals log */
import { registerHandler } from "../../communicate.js";

const SELECTOR = `
    button[class*=close],
    button[id*=close],
    button[alt^=x],
    button[alt^=X],
    button[aria-label^=x],
    button[aria-label^=X],
    button[title*=close],
    a[class*=close],
    a[id*=close],
    a[alt^=x],
    a[alt^=X],
    a[aria-label^=x],
    a[aria-label^=X],
    a[title*=close]
  `;

function isInViewport(el) {
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  const bounding = el.getBoundingClientRect();
  return (
    bounding.top + bounding.height >= 0 &&
    bounding.left + bounding.width >= 0 &&
    bounding.right - bounding.width <= width &&
    bounding.bottom - bounding.height <= height
  );
}

function fixedParent(el) {
  while (el && el.tagName !== "BODY") {
    if (getComputedStyle(el).position === "fixed") {
      return el;
    }
    el = el.parentNode;
  }
  return false;
}

registerHandler(
  "closeDialog",
  message => {
    let elements = Array.from(document.querySelectorAll(SELECTOR));
    elements = elements.filter(isInViewport).filter(fixedParent);
    // FIXME: should check that the button is in the top-right corner of the fixed parent
    if (!elements.length) {
      return false;
    }
    log.debug("Candidate elements:", elements);
    for (const el of elements) {
      el.click();
    }
    return true;
  },
  true
);
