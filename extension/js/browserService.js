// browserService.js delegates the various browser-level actions that the extension needs to handle, like finding content within tabs, muting, etc.
var port;
// var googleAssistantPort = browser.runtime.connectNative("google_assistant_foxvoice");

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
        } else if (data.action === "navigate") {
            navigate(data.content);
        } else if (data.action === "search") {
            search(data.content);
        } else if (data.action === "amazonSearch") {
            amazonSearch(data.content);
        } else if (data.action === "googleAssistant") {
            googleAssistant(data.content);
        }
    });
}

browser.runtime.onConnect.addListener(connected);

const googleAssistant = (query) => {
    console.log(`Sending query to Google Assistant service:  ${query}`);
    var sending = browser.runtime.sendNativeMessage(
      "google_assistant_foxvoice",
      query
    );
    
    // Send a message back to the content script to add a fancy little animation
    port.postMessage({
        type: "googleAssistant",
        event: "PROCESSING",
    });

    sending.then(results => {
        console.log(`Assistant response!!!`);
        console.log(results);

        port.postMessage({
            type: "googleAssistant",
            event: "GOOGLE_RESPONSE",
            content: results,
        });
        // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // audioCtx.decodeAudioData(results).then(function(decodedData) {
        //     // use the decoded data here
        // });
    }, error => {
        console.error(error);
    });
}

const search = (query) => {
    query = query[0].text; // fix
    const term = query.replace(/search (?:for )?|google (?:for )|look up /gi, "");
    const searchURL = constructGoogleQuery(term);
    navigateToURLAfterTimeout(searchURL);
}

const amazonSearch = (query) => {
    const searchURL = constructAmazonQuery(query);
    navigateToURLAfterTimeout(searchURL);
}

const navigate = (query) => {
    // extract out navigation slot from full query
    query = query[0].text; // fix
    const term = query.replace(/open |go to |navigate (?:to )?/gi, "");
    const searchURL = constructGoogleQuery(term, true);
    navigateToURLAfterTimeout(searchURL);
}

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
        })
        .then((tabContent) => {
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

// Plays the first(?) video or audio element on the current tab. Video given higher precedence than audio
const play = () => {
    var getCurrentTab = browser.tabs.get(triggeringTabId);
 
    getCurrentTab.then((tab) => {
        console.log("argh here");
        // get video content for the current tab
        browser.tabs.executeScript(tab.id, {
            file: "/js/playMedia.js"
        })
        .then((result) => {
            console.log(result);
        });
    })
    .then(() => {
        dismissExtensionTab();
    });
    // const mediaContent = findMediaContent();
    // // find the first media item and play it
    // if (mediaContent.video.length) {
    //     let firstVideo = mediaContent.video.first;
    //     firstVideo.play();
    // } else if (mediaContent.audio.length) {
    //     let firstAudio = mediaContent.audio.first;
    //     firstAudio.play();
    // } else {
    //     console.log("no media elements on the tab to play!");
    // }
}

const pause = () => {
    var getCurrentTab = browser.tabs.get(triggeringTabId);
 
    getCurrentTab.then((tab) => {
        console.log("argh here");
        // get video content for the current tab
        browser.tabs.executeScript(tab.id, {
            file: "/js/pauseMedia.js"
        })
        .then((result) => {
            console.log(result);
        });
    });
}

const findMediaContent = () => {
    const getVideo = 'document.getElementsByTagName("video").length > 0';
    const getAudio = 'document.getElementsByTagName("audio").length > 0';
    let videos = [];
    let audios = [];

    var getCurrentTab = browser.tabs.get(triggeringTabId);
 
    getCurrentTab.then((tab) => {
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
    })
    .then((response) => {
        console.log("here are the audio and video elems on the page");
        console.log(videos);
        console.log(audios);

        const mediaElems = {
            audio: audios,
            video: videos
        }
        return mediaElems;
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

const constructGoogleQuery = (query, feelingLucky = false) => {
    let searchURL = new URL('https://www.google.com/search');
    searchURL.searchParams.set( 'q', query );
    if (feelingLucky) searchURL.searchParams.set( 'btnI', '' );
    return searchURL.href;
}

const constructAmazonQuery = (query) => {
    let searchURL = new URL('https://www.amazon.com/s');
    searchURL.searchParams.set( 'k', query );
    return searchURL.href;
}

const navigateToURLAfterTimeout = (searchURL) => {
    let dismissMuteTab = setTimeout(function() {
        browser.tabs.update({
            url: searchURL
        });
    }, 1000);
}