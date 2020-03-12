
const webdriver = require("selenium-webdriver");
const { By, until, Builder } = webdriver;
const path = require("path");
const firefox = require("selenium-webdriver/firefox");
const extension_manifest_path=path.join(process.cwd(),"extension","manifest.json")
const version_name= require(extension_manifest_path).version
const extension_name="firefox_voice_beta-"+version_name+".zip"
const addonFileLocation = path.join(process.cwd(), "web-ext-artifacts",extension_name);
(async function example() {

  let options = new firefox.Options()
    .setPreference("extensions.legacy.enabled", true)
    .setPreference("xpinstall.signatures.required", false)
    .setPreference("xpinstall.whitelist.required", false)

  let driver = new Builder()
    .withCapabilities({ "moz:webdriverClick": true })
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();


 await driver.installAddon(addonFileLocation);

 await driver.setContext(firefox.Context.CHROME)
.then(()=>
driver.wait(until.elementLocated(By.id("pageActionButton"))))
.then(()=>
driver.wait(until.elementLocated(By.id("firefox-voice_mozilla_org-browser-action"))))
.then(()=>console.log("Extension Present"))
.catch((e)=>console.log(e))

  await driver.quit();

})();
