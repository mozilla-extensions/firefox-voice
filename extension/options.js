function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    language: document.querySelector("#language").value,
  });
}

function restoreOptions() {
  const select = document.querySelector("#language");
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
      select.appendChild(option);
    });

    return browser.storage.sync.get("language");
  }).then((result) => {
    const defaultLanguage =
      languages.hasOwnProperty(navigator.language) ?
        navigator.language :
        "en-US";

    select.value = result.language || defaultLanguage;
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
    if (result.version !== manifest.version) {
      browser.storage.sync.set({
        lastVersion: manifest.version,
      });
      browser.tabs.create({
        active: true,
        url: browser.extension.getURL('CHANGELOG.html'),
      });
    }
  });

  document.querySelector("form").addEventListener("submit", saveOptions);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
