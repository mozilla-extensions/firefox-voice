import * as serviceList from "./background/serviceList.js";

const luckySearchRemovals = /\.(com|net|org)$/i;

export function googleSearchUrl(query, feelingLucky = false) {
  const searchUrl = new URL("https://www.google.com/search");
  if (feelingLucky) {
    query = query.replace(luckySearchRemovals, "");
  }
  searchUrl.searchParams.set("q", query);
  if (feelingLucky) {
    searchUrl.searchParams.set("btnI", "");
  }
  // From https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters
  searchUrl.searchParams.set("safe", "active");
  return searchUrl.href;
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

export async function ddgBangSearchUrl(query, service) {
  const bang = serviceList.ddgBangServiceName(service);
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
