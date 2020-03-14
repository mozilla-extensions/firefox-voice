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

  function getReducedParams(str) {
    const url = new URL(str);
    const params = url.searchParams;

    globalBlockedParams.map(blockedParam => {
      if (params.get(blockedParam)) {
        params.delete(blockedParam);
      }
    });
    return params.toString();
  }

  function buildURL(baseURL, params) {
    if (Object.keys(params).length === 0) {
      return baseURL;
    }
    const newURL = baseURL + "?" + params;
    return newURL;
  }

  const baseURL = string.split("?")[0];
  const params = getReducedParams(string);
  return buildURL(baseURL, params);
}
