/* globals buildSettings */

this.options = (function() {
  async function init() {
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

  init();
})();
