/* globals describe, it */
import { By, until, Builder } from "selenium-webdriver";
import { Options, Context } from "selenium-webdriver/firefox";
import { join } from "path";

const extension_manifest_path = join(process.cwd(), "extension", "manifest.json");
const version_name = require(extension_manifest_path).version;
const extension_name = "firefox_voice_beta-" + version_name + ".zip";
const addonFileLocation = join(process.cwd(), "web-ext-artifacts", extension_name);

describe("Build/install extension, and check that toolbar button is present", () => {
  it("Toolbar button is present", async () => {
    const options = new Options()
      .setPreference("extensions.legacy.enabled", true)
      .setPreference("xpinstall.signatures.required", false)
      .setPreference("xpinstall.whitelist.required", false);

    const driver = new Builder()
      .withCapabilities({ "moz:webdriverClick": true })
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();

    await driver.installAddon(addonFileLocation);
    await driver.setContext(Context.CHROME);
    await driver.wait(until.elementLocated(By.id("pageActionButton")));
    await driver.wait(until.elementLocated(By.id("firefox-voice_mozilla_org-browser-action")));
    await driver.quit();
  }, 30000);
});
