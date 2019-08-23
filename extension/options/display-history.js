/* globals moment */
(function() {
  console.log("I am about to inject content dynamically onto this page!!");
  console.log(document.getElementById("most-recent-query"));
  browser.storage.local.get("queryHistory").then(items => {
    const queryHistory = items;
    console.log("QUERYING HISTORY");
    console.log(JSON.stringify(queryHistory));
    if (Object.keys(queryHistory).length) {
      const queries = queryHistory.queryHistory;
      const mostRecentQuery = queries[queries.length - 1];
      const transcription = mostRecentQuery.transcription;
      const timeSinceLastQuery = moment
        .unix(mostRecentQuery.timestamp / 1000)
        .fromNow();
      document.getElementById(
        "most-recent-query"
      ).innerText = `${transcription} (${timeSinceLastQuery})`;
      document.getElementById("history").style.display = "block";
    }
  });
})();
