/* globals communicate */

this.pageMetadataContentScript = (function() {
  const exports = {};

  communicate.register(
    "getSelection",
    message => {
      const selection = window.getSelection();
      return { selection: { text: String(selection) } };
    },
    true
  );

  exports.getMetadata = function() {
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
  };

  communicate.register(
    "getMetadata",
    message => {
      return exports.getMetadata();
    },
    true
  );

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
      if (splitURL.length === 1) {
        return null;
      }

      const params = {};
      const rawParams = URL.split("?")[1].split("&");

      for (let i = 0; i < rawParams.length; i++) {
        const rawParam = rawParams[i].split("=");
        params[rawParam[0]] = rawParam[1];
      }

      return params;
    }

    function buildURL(baseURL, params) {
      if (Object.keys(params).length === 0) {
        return baseURL;
      }

      let newURL = baseURL + "?";

      for (const key in params) {
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
    if (params === null) {
      return;
    }

    const domain = getDomain(details);
    if (domain === null) {
      return;
    }

    const blockedParams = [];
    for (const gbp of globalBlockedParams) {
      if (!gbp.includes("@")) {
        blockedParams.push(gbp);
        continue;
      }

      const keyValue = gbp.split("@")[0];
      const keyDomain = gbp.split("@")[1];

      if (domain === keyDomain) {
        blockedParams.push(keyValue);
      }
    }

    const reducedParams = {};
    for (const key in params) {
      if (!blockedParams.includes(key)) {
        reducedParams[key] = params[key];
      }
    }

    if (Object.keys(reducedParams).length === Object.keys(params).length) {
      return;
    }

    const leanURL = buildURL(baseURL, reducedParams);
    return { redirectUrl: leanURL };
  }

  communicate.register(
    "cleanURL",
    message => {
      return cleanURL();
    },
    true
  );
  return exports;
})();
