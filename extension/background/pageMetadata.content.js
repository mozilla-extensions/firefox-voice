import { registerHandler } from "../communicate.js";

registerHandler(
  "getSelection",
  message => {
    const selection = window.getSelection();
    return { selection: { text: String(selection) } };
  },
  true
);

export function getMetadata() {
  let title = document.title || location.href;
  const titleEl = document.querySelector(
    "meta[property='og:title'], meta[property='twitter:title']"
  );
  if (titleEl && titleEl.getAttribute("content")) {
    title = titleEl.getAttribute("content");
  }
  let canonical = location.href;
  const canonicalEl = document.querySelector("link[rel='canonical']");
  if (canonicalEl && canonicalEl.href) {
    canonical = canonicalEl.href;
  }
  return {
    title,
    canonical,
    url: location.href,
    docTitle: document.title,
  };
}

registerHandler(
  "getMetadata",
  message => {
    return getMetadata();
  },
  true
);
