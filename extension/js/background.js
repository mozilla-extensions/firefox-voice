/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* globals parseIntent, executeIntentForAction */
// TODO: delete entire file? manifest.json handles all this in the popup

browser.commands.onCommand.addListener(function(command) {
  if (command === "open-popup") {
    browser.browserAction.openPopup();
  }
});