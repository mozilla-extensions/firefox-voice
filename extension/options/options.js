/* globals buildSettings, settings */

this.options = (function() {
  let userSettings;
  let options;
  const musicServiceEl = document.getElementById("musicService");
  const chimeEl = document.getElementById("chime");

  async function init() {
    await initVersionInfo();
    await initSettings();
    initHandlers();
  }

  async function initVersionInfo() {
    const inDevelopment = await browser.runtime.sendMessage({
      type: "inDevelopment",
    });
    if (inDevelopment) {
      document.body.classList.add("inDevelopment");
    }
    const manifest = browser.runtime.getManifest();
    document.getElementById("version").textContent = manifest.version;
    document.getElementById("buildTime").textContent = buildSettings.buildTime;
    let dirty = false;
    let { gitCommit } = buildSettings;
    if (gitCommit.endsWith("-dirty")) {
      dirty = true;
      gitCommit = gitCommit.split("-")[0];
    }
    const anchor = document.getElementById("gitCommit");
    anchor.textContent = gitCommit;
    anchor.href = `https://github.com/mozilla/firefox-voice/commit/${encodeURIComponent(
      gitCommit
    )}`;
    document.getElementById("dirty").style.display = dirty ? "" : "none";
  }

  async function initSettings() {
    const result = await settings.getSettingsAndOptions();
    userSettings = result.settings;
    options = result.options;
    while (musicServiceEl.childNodes.length) {
      musicServiceEl.childNodes[0].remove();
    }
    for (const { name, title } of options.musicServices) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = title;
      if (name === userSettings.musicService) {
        option.selected = true;
      }
      musicServiceEl.appendChild(option);
    }
    chimeEl.checked = !!userSettings.chime;
  }

  async function sendSettings() {
    await settings.saveSettings(userSettings);
  }

  function initHandlers() {
    musicServiceEl.addEventListener("change", () => {
      userSettings.musicService = musicServiceEl.value;
      sendSettings();
    });

    chimeEl.addEventListener("change", () => {
      userSettings.chime = chimeEl.checked;
      sendSettings();
    });
  }

  init();
})();
