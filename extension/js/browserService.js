// browserService.js delegates the various browser-level actions that the extension needs to handle, like finding content within tabs, muting, etc.
var port;

const connected = (p) => {
    port = p;
    port.onMessage.addListener(function(data) {
        console.log("In background script, received message from content script");
        console.log(data);

        if (data.action === "mute") {
            mute();
        } else if (data.action === "unmute") {
            unmute();
        } else if (data.action === "find") {
            find(data.content);
        } else if (data.action === "play") {
            play();
        } else if (data.action === "pause") {
            pause();
        }
    });
}

browser.runtime.onConnect.addListener(connected);

const find = (query) => {
    query = query[0].text; // fix
    console.log("the most likely query text is " + query);

    // Fuse options
    const options = {
        id: 'tabId',
        shouldSort: true,
        tokenize: true,
        findAllMatches: true,
        includeScore: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: [{
            name: 'title',
            weight: 0.5
          }, {
            name: 'url',
            weight: 0.3
          }, {
              name: 'body',
              weight: 0.2
          }]
      };

    let combinedTabContent = [];

    const gettingAllTabs = browser.tabs.query({});
 
    gettingAllTabs.then((tabs) => {
        let tabPromises = [];

        for (let tab of tabs) {
            // get video content for the current tab
            const browserCapture = browser.tabs.executeScript(tab.id, {
                file: "/js/tabContent.js"
            }).then((result) => {
                console.log("printing promise results");
                
                // let tabContents = result;
                result = result[0];
                result.tabId = tab.id;
                console.log(result);
                console.log(tab.id);
                combinedTabContent.push(result);
            });
            console.log("i am on tab " + tab.id);
            

            tabPromises.push(browserCapture);
        }

        console.log("promises");
        console.log(tabPromises);

        // very unsure about whether this is the appropriate syntax
        Promise.all(tabPromises).then(results => {
            return combinedTabContent.flat();
        }, error => {
            console.error(error);
            console.log("whyyy");
        })
        .then((tabContent) => {
            console.log("ilskdjf am here");
            console.log(combinedTabContent);
            console.log(options);
            // use Fuse.js to parse the most probable response?
            let fuse = new Fuse(tabContent, options);
            const term = query.replace(/find /gi, "")
            const matches = fuse.search(term);
            console.log(matches);
            // account for multiple matches
            return matches;
        })
        .then((matchingTabs) => {
            // redirect to top tab match
            // may need to account for multiple windows
            const topMatch = parseInt(matchingTabs[0].item);
            browser.tabs.update(topMatch, {
                active: true
            });
        })
        .then(() => {
            dismissExtensionTab();
        });
    });
}

const mute = () => {
    console.log("i am muting!!!");
    browser.tabs.query({
        audible: true
    }).then((audibleTabs) => {
        if (audibleTabs.empty) {
            // pass a message back to the content script to update the UI and indicate that we don't have any audible tabs
        } else {
            // pass a message back to indicate that the tabs are currently being muted
            console.log("these are the audible tabs");
            console.log(audibleTabs);
            // mute each audible tab
            for (let tab of audibleTabs) {
                browser.tabs.update(tab.id, {
                    muted: true
                });
            }
        }
    });

    // dismiss mute tab after delay
    dismissExtensionTab();
}

const unmute = () => {
    console.log("i am UN-muting!!!");
    browser.tabs.query({
        audible: false
    }).then((mutedTabs) => {
        if (mutedTabs.empty) {
            // pass a message back to the content script to update the UI and indicate that we don't have any muted tabs
        } else {
            // pass a message back to indicate that the tabs are currently being un-muted
            console.log("these are the muted tabs");
            console.log(mutedTabs);
            // unmute each muted tab
            for (let tab of mutedTabs) {
                browser.tabs.update(tab.id, {
                    muted: false
                });
            }
        }
    });

    dismissExtensionTab();
}

const play = () => {
    const playingContent = findPlayingContent();
    // loop through each(?) item and play it
}

const pause = () => {
    const playingContent = findPlayingContent();
    // loop through each item and pause it
}

const findPlayingContent = () => {
    const getVideo = 'document.getElementsByTagName("video").length > 0';
    const getAudio = 'document.getElementsByTagName("audio").length > 0';
    let videos = [];
    let audios = [];

    var gettingAllTabs = browser.tabs.query({});
 
    gettingAllTabs.then((tabs) => {
        for (let tab of tabs) {
            // get video content for the current tab
            browser.tabs.executeScript(tab.id, {
                code: getVideo
            })
            .then((response) => {
                console.log("videos for tab " + tab.id);
                console.log(response);
                if (response[0]) {
                    videos.push(tab.id);
                }
            });
            
            // get audio content for the current tab
            browser.tabs.executeScript(tab.id, {
                code: getAudio
            })
            .then((response) => {
                console.log("audios for tab " + tab.id);
                if (response[0]) {
                    audios.push(tab.id);
                }
            });
        }
    })
    .then((response) => {
        console.log("here are the audio and video elems on the page");
        console.log(videos);
        console.log(audios);
    });
}

// Retrieves the content of all browser tabs
// returns an object containing the title, keywords, url and sanitized page text?
const getAllContent = () => {
    let tabContent = [];
    // get all browser tabs
    browser.tabs.query({})
    .then((tabs) => {
        for (let tab of tabs) {
            tabContent.push(getTabContent(tab.id));
        }
        console.log(matchingTabs);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
    return tabContent;
}

const dismissExtensionTab = () => {
    let dismissMuteTab = setTimeout(function() {
        browser.tabs.remove(extensionTabId);
    }, 2000);
}