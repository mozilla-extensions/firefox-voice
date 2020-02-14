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
