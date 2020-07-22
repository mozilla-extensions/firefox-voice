import * as content from "./content.js";

export async function getSelection(tabId) {
  await content.inject(tabId, "/background/pageMetadata.content.js");
  const resp = await browser.tabs.sendMessage(tabId, {
    type: "getSelection",
  });
  return resp.selection;
}

export async function getMetadata(tabId) {
  try {
    await content.inject(tabId, "/background/pageMetadata.content.js");
  } catch (e) {
    // if inject does not work, try to get the metadata from the tab;
    const tab = await browser.tabs.get(tabId);
    const title = tab.title;
    const canonical = tab.url;
    const url = tab.url;
    const docTitle = tab.title;
    return {
      title,
      canonical,
      url,
      docTitle,
    };
  }
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
