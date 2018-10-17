function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    language: document.querySelector("#language").value,
    searchProvider: document.querySelector("#search-provider").value,
  });
}

function restoreOptions() {
  const languageSelect = document.querySelector("#language");
  const providerSelect = document.querySelector("#search-provider");
  let languages;

  fetch(browser.extension.getURL("languages.json")).then((response) => {
    return response.json();
  }).then((l) => {
    languages = l;

    Object.entries(languages).sort((a, b) => {
      return a[1].localeCompare(b[1]);
    }).map(([code, language]) => {
      const option = document.createElement("option");
      option.value = code;
      option.innerText = language;
      languageSelect.appendChild(option);
    });

    return browser.storage.sync.get("language");
  }).then((result) => {
    const defaultLanguage =
      languages.hasOwnProperty(navigator.language) ?
        navigator.language :
        "en-US";

    languageSelect.value = result.language || defaultLanguage;
  }).catch((error) => {
    console.log(`Error: ${error}`);
  });

  let manifest;
  fetch(browser.extension.getURL("manifest.json")).then((response) => {
    return response.json();
  }).then((m) => {
    manifest = m;

    return browser.storage.sync.get("lastVersion");
  }).then((result) => {
    if (result.lastVersion !== manifest.version) {
      return browser.storage.sync.set({
        lastVersion: manifest.version,
      }).then(() => {
        browser.tabs.create({
          active: true,
          url: browser.extension.getURL('CHANGELOG.html'),
        });
      });
    }

    return Promise.resolve();
  }).then(() => {
    manifest.content_scripts[0].matches
      .sort()
      .map((d) => {
        const domain = d.replace(/\/\*$/, '');

        const option = document.createElement("option");
        option.value = domain;
        option.innerText = domain;
        providerSelect.appendChild(option);
      });

    return browser.storage.sync.get("searchProvider");
  }).then((result) => {
    const defaultProvider = "https://www.google.com";
    providerSelect.value = result.searchProvider|| defaultProvider;
  }).catch((error) => {
    console.log(`Error: ${error}`);
  });

  languageSelect.addEventListener("change", saveOptions);
  providerSelect.addEventListener("change", saveOptions);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
