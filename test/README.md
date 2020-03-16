# Selenium Testing
 This repository contains the test file for the selenium testing of the extension.

 ## How to Run
 In the main directory
 `npm run test:selenium`
 If console output is "Extension Present"
 then the test has successfully completed

 ## How to contribute
 This test uses the "selenium-webdriver" dependency.
  You will futher need to install [geckodriver.exe](https://github.com/mozilla/geckodriver/releases/)
  and create a new system varaible with the path to the executable file. 
  
  ### Note: You would have to run the tests with Nightly or Firefox Developer Edition, it doesn't work with Firefox Browser as xpinstall.signatures.required cannot be made false in Firefox.
