import { metadata } from "../services/metadata.js";

const luckySearchRemovals = /\.(com|net|org)$/i;

export function googleSearchUrl(query, feelingLucky = false) {
  const searchUrl = new URL("https://www.google.com/search");
  if (feelingLucky) {
    query = query.replace(luckySearchRemovals, "");
  } else {
    query = fixCalculations(query);
  }
  searchUrl.searchParams.set("q", query);
  if (feelingLucky) {
    searchUrl.searchParams.set("btnI", "");
  }
  // From https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters
  searchUrl.searchParams.set("safe", "active");
  return searchUrl.href;
}

function fixCalculations(query) {
  // Google is weird about adding and subtracting:
  //   If you search for "5 - 2" it won't work, but "5-2" will work
  //   Addition also sometimes (but not always) fails, such as "5 + 2"
  return query.replace(
    /(\d+)\s+([+-])\s+(\d+)/,
    (all, first, second, third) => first + second + third
  );
}

export async function ddgEntitySearch(query) {
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&pretty=1&skip_disambig=1`
  );
  const ddgData = await response.json();
  if (!ddgData.AbstractText) {
    // the response from DDG was null, and there was no matching Instant Answer result
    return null;
  }
  // Selecting a subset of the key/value pairs that the DuckDuckGo API returns for use in the card (https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties)
  const cardData = (({
    Heading,
    AbstractText,
    AbstractSource,
    AbstractURL,
    Image,
  }) => ({ Heading, AbstractText, AbstractSource, AbstractURL, Image }))(
    ddgData
  );
  return cardData;
}

// See https://duckduckgo.com/bang for a list of potential services
// FIXME: this should be removed and serviceMetadata.js preferred.
const SERVICE_BANG_ALIASES = {};
for (const id in metadata.search) {
  for (const name of metadata.search[id].names) {
    SERVICE_BANG_ALIASES[name] = metadata.search[id].serviceSearch;
  }
}

export function ddgBangServiceName(name) {
  const bang = SERVICE_BANG_ALIASES[name.toLowerCase().trim()];
  if (!bang) {
    throw new Error(`Unknown service name: ${JSON.stringify(name)}`);
  }
  return bang;
}

export async function ddgServiceSearchUrl(query, service) {
  const bang = ddgBangServiceName(service);
  const response = await fetch(
    `https://api.duckduckgo.com/?q=!${encodeURIComponent(
      bang
    )}+${encodeURIComponent(query)}&format=json&pretty=1&no_redirect=1`
  );
  const json = await response.json();

  return json.Redirect;
}

export function amazonSearchUrl(query) {
  const searchURL = new URL("https://www.amazon.com/s");
  searchURL.searchParams.set("k", query);
  return searchURL.href;
}
