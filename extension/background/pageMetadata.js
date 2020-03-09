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

function cleanURL(details) {
  const globalBlockedParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  function getParams(URL) {
    const splitURL = URL.split("?");
    if (splitURL.length == 1) {
      return null;
    }

    let params = {};
    rawParams = URL.split("?")[1].split("&");

    for (let i = 0; i < rawParams.length; i++) {
      const rawParam = rawParams[i].split("=");
      params[rawParam[0]] = rawParam[1];
    }

    return params;
  }

  function buildURL(baseURL, params) {
    if (Object.keys(params).length == 0) {
      return baseURL;
    }

    let newURL = baseURL + "?";

    for (let key in params) {
      newURL += key + "=" + params[key] + "&";
    }
    newURL = newURL.slice(0, newURL.length - 1);

    return newURL;
  }

  function getDomain(url) {
    const arr = url.split("/")[2].split(".");

    if (arr.length > 1) {
      return arr[arr.length - 2] + "." + arr[arr.length - 1];
    }

    return null;
  }

  const baseURL = details.split("?")[0];

  const params = getParams(details);
  if (params == null) {
    return;
  }

  const domain = getDomain(details);
  if (domain == null) {
    return;
  }

  let blockedParams = [];
  for (let gbp of globalBlockedParams) {
    if (gbp.indexOf("@") == -1) {
      blockedParams.push(gbp);
      continue;
    }

    const keyValue = gbp.split("@")[0];
    const keyDomain = gbp.split("@")[1];

    if (domain == keyDomain) {
      blockedParams.push(keyValue);
    }
  }

  let reducedParams = {};
  for (let key in params) {
    if (!blockedParams.includes(key)) {
      reducedParams[key] = params[key];
    }
  }

  if (Object.keys(reducedParams).length == Object.keys(params).length) {
    return;
  }

  leanURL = buildURL(baseURL, reducedParams);
  return { redirectUrl: leanURL };
}

browser.webRequest.onBeforeRequest.addListener(
  cleanURL,
  { urls: ["<all_urls>"] },
  ["blocking"]
);
