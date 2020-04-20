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
  const metadata = await browser.tabs.sendMessage(tabId, {
    type: "getMetadata",
  });
  metadata.canonical = cleanURL(metadata.canonical);
  return metadata;
}

function cleanURL(string) {
  const globalBlockedParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  const url = new URL(string);
  const params = url.searchParams;

  globalBlockedParams.map(blockedParam => {
    if (params.get(blockedParam)) {
      params.delete(blockedParam);
    }
  });

  return url.toString();
}
