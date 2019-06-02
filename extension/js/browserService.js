// browserService.js delegates the various browser-level actions that the extension needs to handle, like finding content within tabs, muting, etc.
var port;

function connected(p) {
    port = p;
    port.onMessage.addListener(function(data) {
        console.log("In background script, received message from content script");
        console.log(data);

        if (data.action === "mute") {
            mute();
        } else if (data.action === "find") {
            find(data.content);
        }
    });
}

browser.runtime.onConnect.addListener(connected);

function find(query) {
    let mostLikelyQueryText = query[0].text; // fix
    console.log("the most likely query text is " + mostLikelyQueryText);
    let matchingTabs = [];

    browser.tabs.query({})
    .then((tabs) => {
        for (let tab of tabs) {
            // tab.url requires the `tabs` permission
            browser.find.find(query, {tabId: tab.id})
            .then((result) => {
                console.log(result);
                if (result.count > 0) {
                    matchingTabs.push(result);
                }
            });
        }
        console.log(matchingTabs);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
}

function mute() {
    console.log("i am muting!!!");
    browser.tabs.query({
        audible: true
    }).then((audibleTabs) => {
        console.log("these are the audible tabs");
        console.log(audibleTabs);
        // mute each audible tab
        for (let tab of audibleTabs) {
            browser.tabs.update(tab.id, {
                muted: true
            });
        }
    });
}