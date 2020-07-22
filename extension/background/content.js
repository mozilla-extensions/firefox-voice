export async function inject(tabId, scripts) {
  if (!tabId) {
    throw new Error(`Invalid tabId: ${tabId}`);
  }
  if (typeof scripts === "string") {
    scripts = [scripts];
  }
  if (!scripts.filter(s => s.endsWith(".content.js")).length) {
    throw new Error(`Not a bundle script: ${scripts}`);
  }
  const bundleScripts = scripts.map(script =>
    script.replace(/\.content\.js$/, ".bundle.js")
  );
  const execScripts = ["/buildSettings.js", "/log.js"].concat(bundleScripts);
  for (const file of execScripts) {
    try {
      await browser.tabs.executeScript(tabId, { file });
    } catch (error) {
      if (error.message.includes("Missing host permission for the tab")) {
        const e = new Error("That does not work on this kind of page");
        e.displayMessage = "That does not work on this kind of page";
        throw e;
      } else {
        throw error;
      }
    }
  }
}
