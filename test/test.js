
const webdriver = require("selenium-webdriver");
const { By, until, Builder } = webdriver;
const path = require("path");
const firefox = require("selenium-webdriver/firefox");
const fs = require("fs");
const addonFileLocation = path.join(process.cwd(),"web-ext-artifacts", "firefox_voice_beta-0.19.4502.zip");


(async function example() {

  let options = new firefox.Options()
  .setPreference("extensions.legacy.enabled", true)
  .setPreference("xpinstall.signatures.required", false)
  .setPreference("xpinstall.whitelist.required", false)
  

  //let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
 let  driver = new Builder()
  .withCapabilities({"moz:webdriverClick": true})
  .forBrowser("firefox")
  .setFirefoxOptions(options)
  .build();

 
    await driver.installAddon(addonFileLocation);
  
    await driver.quit();
  
})();