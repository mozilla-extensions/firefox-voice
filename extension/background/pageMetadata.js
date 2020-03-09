import * as content from "./content.js";

export async function getSelection(tabId) {
  await content.lazyInject(tabId, "/background/pageMetadata-contentScript.js");
  const resp = await browser.tabs.sendMessage(tabId, {
    type: "getSelection",
  });
  return resp.selection;
}

export async function getMetadata(tabId) {
  await content.lazyInject(tabId, "/background/pageMetadata-contentScript.js");
  return browser.tabs.sendMessage(tabId, {
    type: "getMetadata",
  });
}

export async function cleanURL(url) {
  await content.lazyInject(url, "/background/pageMetadata-contentScript.js");
  browser.webRequest.onBeforeRequest.addListener(
    cleanURL,
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
}
