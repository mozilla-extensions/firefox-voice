/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const TRACKING_ID = 'UA-35433268-80';

const analytics = new TestPilotGA({
  tid: TRACKING_ID,
  ds: 'addon',
  an: 'Voice Fill',
  aid: 'voicefill@mozilla.com',
  av: '1.3.1'
});

browser.runtime.onMessage.addListener(event => {
    console.log('[metrics] Event successfully sent. Calling analytics');

    analytics
    .sendEvent('voice fill', event.type, event.content)
    .then(response => {
      console.log('[metrics] Event successfully sent', response);
    })
    .catch((response, err) => {
      console.error('[metrics] Event failed while sending', response, err);
    });
});

browser.browserAction.onClicked.addListener(function() {

  var creating = browser.tabs.create({
    url:"https://www.google.com"
  });
  creating.
  then(tab => {
            console.log(`Created new tab: ${tab.id}`);
            setTimeout( function() {

                browser.tabs.sendMessage(
                    tab.id,
                    {msg: "background script syn"}
                ).then(response => {
                    console.log("Message from the content script", response.response);
                }).catch(error => {
                    console.error(`Error: ${error}`);
                });

            }, 2000);

        },
          error => {
            console.log(`Error: ${error}`);
        });
});
