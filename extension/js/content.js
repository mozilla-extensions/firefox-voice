/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 let LANGUAGES = {};
 let LANGUAGE;
 
 const languagePromise = fetch(
     browser.extension.getURL('js/languages.json')
 ).then((response) => {
     return response.json();
 }).then((l) => {
     LANGUAGES = l;
     return browser.storage.sync.get("language");
 }).then((item) => {
     if (!item.language) {
         throw new Error('Language not set');
     }
 
     LANGUAGE = item.language;
 }).catch(() => {
     LANGUAGE =
       LANGUAGES.hasOwnProperty(navigator.language) ?
         navigator.language :
         "en-US";
 });
 
 (function speak_to_me() {
     console.log("Speak To Me starting up...");

     let initialized = false;
 
     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         console.error(
             "You need a browser with getUserMedia support to use Speak To Me, sorry!"
         );
         return;
     }

     // Initialize NativeMessaging port for Google Assistant + Alexa
     var port = browser.runtime.connect({name:"cs-port"});
 
     port.onMessage.addListener(function(m) {
       console.log("In content script, received message from background script: ");
       console.log(m.type);
       if (m.type == "noAudibleTabs") {
   
       } else if (m.type == "muting") {
         onMute();
       } else if (m.type == "googleAssistant") {
         console.log("THE EVENT TYPE IS....");
         console.log(m.event);
         if (m.event == "PROCESSING") {
           externalAssistantProcessingState(m.type);
         } else if (m.event == "GOOGLE_RESPONSE") {
           displayGoogleResults(m.content);
         }
       } else if (m.type == "alexa") {
         console.log("THE EVENT TYPE IS....");
         console.log(m.event);
         if (m.event == "PROCESSING") {
           externalAssistantProcessingState(m.type);
         } else if (m.event == "ALEXA_RESPONSE") {
           displayGoogleResults(m.content);
         }
       }
     });
 
     let mediaRecorder = null;
     const STT_SERVER_URL = "https://speaktome-2.services.mozilla.com";
 
     const DONE_ANIMATION = browser.extension.getURL("assets/animations/Done.json");
     const SPINNING_ANIMATION = browser.extension.getURL("assets/animations/Spinning.json");
     const START_ANIMATION = browser.extension.getURL("assets/animations/Start.json");
     const ERROR_ANIMATION = browser.extension.getURL("assets/animations/Error.json");
     
     const escapeHTML = (str) => {
       // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
       // Most often this is not the case though.
       return String(str)
           .replace(/&/g, '&amp;')
           .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
           .replace(/</g, '&lt;').replace(/>/g, '&gt;');
     };
 
     browser.runtime.onMessage.addListener(request => {
         if (!initialized) {
             initialized = true;
             SpeakToMePopup.showAt(0, 0);
             stm_init();
         }

         return Promise.resolve({ response: "content script ack" });
     });
 
     // Encapsulation of the popup we use to provide our UI.
     const POPUP_WRAPPER_MARKUP = `<div id="stm-popup">
             <div id="stm-header"><div role="button" tabindex="1" id="stm-close"></div></div>
             <div id="stm-inject" class="stm-content-wrapper"></div>
             <div id="stm-text-input-wrapper">
                <div class="stm-status">Type your request</div>
                <span id="text-input" contenteditable="true">&nbsp;</span>
                <div id="send-btn-wrapper">
                    <button id="send-text-input">GO</button>
                </div>
             </div>
             <div id="stm-footer">
                 Processing as {language}.
                 <br>
                 To change language, navigate to
                 <a href="about:addons">about:addons</a>, then click the
                 Preferences button next to Voice Fill.
             </div>
             <a href="https://qsurvey.mozilla.com/s3/voice-fill?ref=product&ver=2" id="stm-feedback" role="button" tabindex="2">Feedback</a>
         </div>`;
 
     // When submitting, this markup is passed in
     const SUBMISSION_MARKUP = `<div class="stm-wrapper" id="stm-levels-wrapper">
             <canvas hidden id="stm-levels" width=720 height=180></canvas>
         </div>
         <div id="stm-animation-wrapper">
             <div id="stm-box"></div>
         </div>
         <div id="transcription">
             <div id="transcription-content" class="hidden">
                 <div id="transcription-text"></div>
             </div>
         </div>
         <div class="stm-status" id="stm-content">
             <div id="stm-startup-text">Warming up...</div>
         </div>`;
 
     // When Selecting, this markup is passed in
     const SELECTION_MARKUP = `<form id="stm-selection-wrapper">
             <div id="stm-list-wrapper">
                 <input id="stm-input" type="text" autocomplete="off" />
                 <div id="stm-list"></div>
             </div>
             <button id="stm-reset-button" title="Reset" type="button"></button>
             <input id="stm-submit-button" type="submit" title="Submit" value=""/>
         </form>`;
 
     const SpeakToMePopup = {
         // closeClicked used to skip out of media recording handling
         closeClicked: false,
         textInputDetected: false,
         init: () => {
             console.log(`SpeakToMePopup init`);
             const popup = document.createElement("div");
             popup.innerHTML = POPUP_WRAPPER_MARKUP;
             document.body.appendChild(popup);
 
             document.getElementById("stm-popup").style.backgroundImage =
                 `url("${browser.extension.getURL("/assets/images/ff-logo.png")}")`;
             document.getElementById("stm-close").style.backgroundImage =
                 `url("${browser.extension.getURL("/assets/images/icon-close.svg")}")`;
             document.getElementById("stm-feedback").style.backgroundImage =
                 `url("${browser.extension.getURL("/assets/images/feedback.svg")}")`;

             if (document.dir === "rtl") {
                 document.getElementById("stm-close").classList.add("rtl");
                 document.getElementById("stm-popup").classList.add("rtl");
                 document.getElementById("stm-feedback").classList.add("rtl");
             }

             languagePromise.then(() => {
                 const footer = document.getElementById('stm-footer');
                 footer.innerHTML = footer.innerHTML.replace(
                     '{language}', LANGUAGES[LANGUAGE]);
             });
 
             this.inject = document.getElementById("stm-inject");
             this.popup = document.getElementById("stm-popup");
             this.icon = document.getElementsByClassName("stm-icon")[0];
             this.inject.innerHTML = SUBMISSION_MARKUP;
         },
 
         showAt: (x, y) => {
             console.log(`SpeakToMePopup showAt ${x},${y}`);
             const style = this.popup.style;
             style.display = "flex";
             this.dismissPopup = function (e) {
                 const key = e.which || e.keyCode;
                 if (key === 27) {
                     SpeakToMePopup.cancelFetch = true;
                     e.preventDefault();
                     SpeakToMePopup.hide();
                     mediaRecorder.stop();
                     SpeakToMePopup.closeClicked = true;
                 }
             }
             processTextQuery = function(e) {
                // SpeakToMePopup.cancelFetch = true;
                console.log("process this text!");
                const textContent = textInput.innerText;
                const intentData = parseIntent(textContent);
                console.log(intentData);
                port.postMessage(intentData);
              }
        
             this.detectText = function (e) {
                 if (!SpeakToMePopup.textInputDetected) {
                    const textInputWrapper = document.getElementById("stm-text-input-wrapper");
                    textInputWrapper.classList.add("stm-content-wrapper"); 
                    textInput.classList.add("active");
                     document.getElementById("stm-inject").style.display = "none";
                     console.log("STOPPING BECAUSE OF TEXT");
                     SpeakToMePopup.textInputDetected = true;
                     stm_vad.stopGum();
                 }
                 document.getElementById("send-btn-wrapper").style.display = "block";
                 if (e.keyCode == 13) {
                     processTextQuery();
                 }
             };
             const textInput = document.getElementById("text-input");
             textInput.focus();
             textInput.addEventListener("keyup", this.detectText);

             const sendText = document.getElementById("send-text-input");
             sendText.addEventListener("click", () => {
                 processTextQuery();
             });
         },
 
         hide: () => {
             console.log(`SpeakToMePopup hide`);
             this.removeEventListener("keypress", this.dismissPopup);
             this.popup.classList.add("stm-drop-out");
 
             setTimeout(() => {
                 this.popup.classList.remove("stm-drop-out");
                 this.popup.style.display = "none";
                 // eslint-disable-next-line no-unsanitized/property
                 this.inject.innerHTML = SUBMISSION_MARKUP;
             }, 500);
         },
 
         reset: () => {
             // eslint-disable-next-line no-unsanitized/property
             this.inject.innerHTML = SUBMISSION_MARKUP;
         },
 
         // Returns a Promise that resolves once the "Stop" button is clicked.
         wait_for_stop: () => {
             console.log(`SpeakToMePopup wait_for_stop`);
             return new Promise((resolve, reject) => {
                 console.log(`SpeakToMePopup set popup stop listener`);
                 const popup = document.getElementById("stm-popup");
                 const close = document.getElementById("stm-close");
                 popup.addEventListener("click", function _mic_stop() {
                     popup.removeEventListener("click", _mic_stop);
                     resolve();
                 });
                 close.addEventListener("click", function _close_click(e) {
                     e.stopPropagation();
                     close.removeEventListener("click", _close_click);
                     reject();
                 });
             });
         },
 
         // Returns a Promise that resolves to the chosen text.
         choose_item: data => {
             console.log(`SpeakToMePopup choose_item`);
             this.inject.innerHTML = SELECTION_MARKUP;
             const close = document.getElementById("stm-close");
             const form = document.getElementById("stm-selection-wrapper");
             const input = document.getElementById("stm-input");
             const list = document.getElementById("stm-list");
             const listWrapper = document.getElementById("stm-list-wrapper");
             const reset = document.getElementById("stm-reset-button");
             let firstChoice;
 
             return new Promise((resolve, reject) => {
                 if (data.length === 1) {
                     firstChoice = data[0];
                     listWrapper.removeChild(list);
                 } else {
                     let html = "<ul class='stm-list-inner'>";
                     data.forEach((item, index) => {
                         if (index === 0) {
                             firstChoice = item;
                         } else if(index < 5) {
                             let confidence = escapeHTML(item.confidence);
                             let text = escapeHTML(item.text);
                             html += `<li idx_suggestion="${index}" confidence="${confidence}" role="button" tabindex="0">${text}</li>`;
                         }
                     });
                     html += "</ul>";
                     list.innerHTML = html;
                 }
 
                 input.confidence = escapeHTML(firstChoice.confidence);
                 input.value = escapeHTML(firstChoice.text);
                 input.size = Math.max(input.value.length, 10);
                 input.idx_suggestion = 0;
 
                 if (list) {
                     list.style.width = `${input.offsetWidth}px`;
                 }
 
                 input.focus();
 
                 input.addEventListener("keypress", e => {
                     // e.preventDefault();
                     if(e.keyCode === 13) {
                         e.preventDefault();
                         list.classList.add('close');
                         resolve(input);
                     }
                 });
 
                 input.addEventListener("input", () => {
                     input.size = Math.max(10, input.value.length);
                     list.style.width = `${input.offsetWidth}px`;
                 });
 
                 form.addEventListener("submit", function _submit_form(e) {
                     e.preventDefault();
                     e.stopPropagation();
                     list.classList.add('close');
                     form.removeEventListener("submit", _submit_form);
                     resolve(input);
                 });
 
                 list.addEventListener("click", function _choose_item(e) {
                     e.preventDefault();
                     list.removeEventListener("click", _choose_item);
                     if (e.target instanceof HTMLLIElement) {
                         let result = [];
                         result.confidence = e.target.getAttribute("confidence");
                         result.value = e.target.textContent;
                         result.idx_suggestion = e.target.getAttribute("idx_suggestion");
                         list.classList.add('close');
                         input.value = e.target.textContent;
                         input.size = input.value.length;
                         list.style.width = `${input.offsetWidth}px`;
 
                         resolve(result);
                     }
                 });
 
                 list.addEventListener("keypress", function _choose_item(e) {
                     const key = e.which || e.keyCode;
                     if (key === 13) {
                         list.removeEventListener("click", _choose_item);
                         if (e.target instanceof HTMLLIElement) {
                             let result = [];
                             result.confidence = e.target.getAttribute("confidence");
                             result.value = e.target.textContent;
                             result.idx_suggestion = e.target.getAttribute("idx_suggestion");
                             list.classList.add('close');
                             input.value = e.target.textContent;
                             input.size = input.value.length;
                             list.style.width = `${input.offsetWidth}px`;
 
                             resolve(result);
                         }
                     }
                 });
 
                 reset.addEventListener("click", function _reset_click(e) {
                     e.preventDefault();
                     reset.removeEventListener("click", _reset_click);
                     reject(e.target.id);
                 });
 
                 close.addEventListener("click", function _close_click(e) {
                     e.preventDefault();
                     close.removeEventListener("click", _close_click);
                     reject(e.target.id);
                 });
 
                 close.addEventListener("keypress", function _close_click(e) {
                     const key = e.which || e.keyCode;
                     if (key === 13) {
                         e.preventDefault();
                         close.removeEventListener("keypress", _close_click);
                         reject(e.target.id);
                     }
                 });
             });
         }
     };
 
     // Main startup for STM voice stuff
     const stm_start = () => {
         const constraints = { audio: true };
         let chunks = [];
 
         navigator.mediaDevices
             .getUserMedia(constraints)
             .then(function(stream) {
                 // Build the WebAudio graph we'll be using
                 let audioContext = new AudioContext();
                 let sourceNode = audioContext.createMediaStreamSource(stream);
                 let analyzerNode = audioContext.createAnalyser();
                 let outputNode = audioContext.createMediaStreamDestination();
                 // make sure we're doing mono everywhere
                 sourceNode.channelCount = 1;
                 analyzerNode.channelCount = 1;
                 outputNode.channelCount = 1;
                 // connect the nodes together
                 sourceNode.connect(analyzerNode);
                 analyzerNode.connect(outputNode);
                 // and set up the recorder
                 const options = {
                     audioBitsPerSecond: 16000,
                     mimeType: "audio/ogg"
                 };
 
                 // VAD initializations
                 // console.log("Sample rate: ", audioContext.sampleRate);
                 const bufferSize = 2048;
                 // create a javascript node
                 let scriptprocessor = audioContext.createScriptProcessor(
                     bufferSize,
                     1,
                     1
                 );
                 // specify the processing function
                 stm_vad.reset();
                 scriptprocessor.onaudioprocess = stm_vad.recorderProcess;
                 stm_vad.stopGum = () => {
                     console.log("stopGum");
                     mediaRecorder.stop();
                     sourceNode.disconnect(scriptprocessor);
                     sourceNode.disconnect(analyzerNode);
                     analyzerNode.disconnect(outputNode);
                 };
                 // connect stream to our recorder
                 sourceNode.connect(scriptprocessor);
 
                 // MediaRecorder initialization
                 mediaRecorder = new MediaRecorder(
                     outputNode.stream,
                     options
                 );
 
                 SpeakToMePopup.wait_for_stop().then(() => {
                     mediaRecorder.stop();
                 }, () => {
                     mediaRecorder.stop();
                     SpeakToMePopup.closeClicked = true;
                     SpeakToMePopup.hide();
                 }
 
                 );
 
                let micOpen = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg");
                micOpen.type = "audio/ogg";
                micOpen.play();
 
                 document.getElementById("stm-levels").hidden = false;
                 visualize(analyzerNode);
 
                 mediaRecorder.start();
 
                 const copy = document.getElementById("stm-content");
                 loadAnimation(SPINNING_ANIMATION, true);
                 copy.innerHTML = `<div id="stm-listening-text">Listening...</div>`
 
                 mediaRecorder.onstop = e => {
                     // handle clicking on close element by dumping recording data
                     if (SpeakToMePopup.closeClicked) {
                         SpeakToMePopup.closeClicked = false;
                         return;
                     }
 
                     console.log(e.target);
                     document.getElementById("stm-levels").hidden = true;
                     console.log("mediaRecorder onStop");
                     // We stopped the recording, send the content to the STT server.
                     mediaRecorder = null;
                     audioContext = null;
                     sourceNode = null;
                     analyzerNode = null;
                     outputNode = null;
                     stream = null;
                     scriptprocessor = null;
 
                     const blob = new Blob(chunks, {
                         type: "audio/ogg; codecs=opus"
                     });
                     chunks = [];

                     if (SpeakToMePopup.textInputDetected) {
                         console.log("muahaha stopping");
                         return;
                     }
 
                     fetch(STT_SERVER_URL, {
                         method: "POST",
                         body: blob,
                         headers: {
                             "Accept-Language-STT": LANGUAGE,
                             "Product-Tag": "vf",
                         }
                     }).then(response => {
                         if (!response.ok) {
                             fail_gracefully(`Fetch error: ${response.statusText}`);
                         }
                         return response.json();
                     }).then(json => {
                         if (SpeakToMePopup.cancelFetch) {
                             SpeakToMePopup.cancelFetch = false;
                             return;
                         }
                         console.log(
                             `Got STT result: ${JSON.stringify(json)}`
                         );
                         const container = document.getElementById("stm-box");
                         container.classList.add('stm-done-animation');
 
                         setTimeout(() => {
                             if (json.status === "ok") {
                                 const query = json.data[0].text;
                                 // Show transcription result
                                 const suggestionContent = document.getElementById("suggestionContent");
                                 suggestionContent.style.display = "none";

                                 const transcription = document.getElementById("transcription");
                                 transcription.innerHTML = query;
                                 transcription.style.display = "block";
 
                                 let matches;
 
                                 // TEMPORARILY DISABLE GOOGLE ASSISTANT + ALEXA INVOCATIONS FOR USER TESTING
                                 if (matches = query.match(/(?:ok |okay |o.k. |hey )?\balexa\b(.*)/i)) {
                                 action = "alexa";
                                 } else if (matches = query.match(/(?:ok|okay|o.k.|hey) google (.*)/i)) {
                                 action = "googleAssistant";
                                 } else if (matches = query.match(/(?!.*tab.*)(?:(?:bring me|go|navigate) to|open|find|show me)\s(.*)/i)) {
                                 action = "navigate";
                                 } else if (matches = query.match(/\bunmute\b/i)) {
                                 console.debug("HEEERE");
                                 action = "unmute";
                                 } else if (matches = query.match(/(?:mute|turn off)\s?(?:whatever is )?(?:playing|all)?\s?(?:the )?(?:music|audio|sound|everything)?|^quiet$|^shut up$|^stop$/i)) {
                                 action = "mute";
                                 }else if (matches = query.match(/(?:find the (?:tab|tap|tad|todd) (?:about|with) (.*))|(?:(?:(?:bring me to|find) (?:the|my)? )?(.*) (?:tab|tap|tad|todd))/i)) {
                                 action = "find";
                                 } else if (matches = query.match(/search (?:for )?(?:a |an )?(.*) on amazon/i)) {
                                 action = "amazonSearch";
                                 } else if (matches = query.match(/(?:do a )?(?:search |query |find(?: me)? |google |look up |lookup |look on )(?:google |the web |the internet )?(?:for )?(.*)(?:on the web)?/i)) {
                                 action = "search";
                                 } else if (matches = query.match(/(?:(?:what's the |what is the )?(weather|forecast|temperature) (?:in |for )?(.*))|(?:(.* weather))/i)) {
                                 action = "weather";
                                 } else if (matches = query.match(/(?:(?:set |start )(?:a )?(timer .*))|(.* timer)/i)) {
                                 action = "timer";
                                 } else if (matches = query.match(/(?:play(.*))/i)) {
                                 action = "play";
                                 } else if (matches = query.match(/(?:read(.*))/i)) {
                                 action = "read";
                                 } else {
                                 action = "search";
                                 matches = [,query]; // a hack to put this in the expected format of the next matches line
                                 }
                                 
                                 matches = matches.slice(1).join(' '); // extract only the captured groups, flatten them into a single string
 

                                // Store latest invocation in localStorage
                                browser.storage.local.get("queryHistory").then((items) => {
                                    let queryHistory = items;
                                    console.log("QUERYING HISTORY");
                                    console.log(JSON.stringify(queryHistory));
                                    queryHistory = queryHistory.queryHistory || [];
                                    queryHistory.push({
                                    transcription: query,
                                    action: action,
                                    timestamp: Date.now()
                                    });
                                    if (queryHistory.length > 5) queryHistory.shift();
                        
                                    browser.storage.local.set({
                                    queryHistory: queryHistory
                                    });
                                });

                                 // Tell the background script which action to execute
                                 port.postMessage({
                                 action: action,
                                 content: matches
                                 });
                             }
                         }, 500);
                     }).catch(error => {
                         fail_gracefully(`Fetch error: ${error}`);
                     });
                 };
 
                 mediaRecorder.ondataavailable = e => {
                     chunks.push(e.data);
                 };
             })
             .catch(function(err) {
                 fail_gracefully(`GUM error: ${err}`);
             });
     };
 
     // Helper for animation startup
     const stm_init = () => {
        loadAnimation(START_ANIMATION, false, "stm-start-animation");
 
         setTimeout(() => {
             stm_start();
         }, 1000);
     };
 
     // Helper to handle background visualization
     const visualize = (analyzerNode) => {
         const MIN_DB_LEVEL = -85; // The dB level that is 0 in the levels display
         const MAX_DB_LEVEL = -30; // The dB level that is 100% in the levels display
 
         // Set up the analyzer node, and allocate an array for its data
         // FFT size 64 gives us 32 bins. But those bins hold frequencies up to
         // 22kHz or more, and we only care about visualizing lower frequencies
         // which is where most human voice lies, so we use fewer bins
         analyzerNode.fftSize = 64;
         const frequencyBins = new Float32Array(14);
 
         // Clear the canvas
 
         var popupWidth = document.getElementById("stm-popup").offsetWidth;
 
         const levels = document.getElementById("stm-levels");
         const xPos = (popupWidth < levels.offsetWidth ? popupWidth * .5 - 22 : levels.offsetWidth * .5);
         const yPos = levels.offsetHeight * .5;
         const context = levels.getContext("2d");
         context.clearRect(0, 0, levels.width, levels.height);
 
         if (levels.hidden) {
             // If we've been hidden, return right away without calling rAF again.
             return;
         }
 
         // Get the FFT data
         analyzerNode.getFloatFrequencyData(frequencyBins);
 
         // Display it as a barchart.
         // Drop bottom few bins, since they are often misleadingly high
         const skip = 2;
         const n = frequencyBins.length - skip;
         const dbRange = MAX_DB_LEVEL - MIN_DB_LEVEL;
 
         // Loop through the values and draw the bars
         context.strokeStyle = "#999999";
 
         for (let i = 0; i < n; i++) {
             const value = frequencyBins[i + skip];
             const diameter = (levels.height * (value - MIN_DB_LEVEL) / dbRange) * 10;
             if (diameter < 0) {
                 continue;
             }
             // Display a bar for this value.
             var alpha = diameter/500;
             if(alpha > .2) alpha = .2;
             else if (alpha < .1) alpha = .1;
 
             context.lineWidth = alpha*alpha*150;
             context.globalAlpha = alpha*alpha*5;
             context.beginPath();
             context.ellipse(
                 xPos,
                 yPos,
                 diameter,
                 diameter,
                 0,
                 0,
                 2 * Math.PI
             );
             if(diameter > 90 && diameter < 360) context.stroke();
         }
         // Update the visualization the next time we can
         requestAnimationFrame(function() {
             visualize(analyzerNode);
         });
     }
 
     // Helper to handle bodymobin
     const loadAnimation = (animationType, loop, className) => {
         const container = document.getElementById("stm-box");
         container.className = "";
         if (className) {
             container.classList.add(className);
         }
         if (window.bodymovin) {
             window.bodymovin.destroy();
         }
         window.bodymovin.loadAnimation({
             container,
             loop,
             renderer: "svg",
             autoplay: true,
             path: animationType // the path to the animation json
         });
     }
 
     SpeakToMePopup.init();
 
     const fail_gracefully = (errorMsg) => {
       if (errorMsg.indexOf("GUM") === 0) {
         errorMsg =  "Please enable your microphone to use Voice Fill";
       } else if (errorMsg.indexOf("EMPTYRESULTS") === 0) {
         errorMsg = "No results found";
       } else {
         errorMsg = "Sorry, we encountered an error";
       }
       loadAnimation(ERROR_ANIMATION, false);
       const copy = document.getElementById("stm-content");
       copy.innerHTML = "<div id=\"stm-listening-text\"></div>";
       let errorDiv = document.getElementById("stm-listening-text");
       errorDiv.textContent = errorMsg;
       setTimeout(() => {
           SpeakToMePopup.hide();
           port.postMessage({
             action: "dismissCurrentTab",
           });
       }, 1500);
       console.log('ERROR: ', errorMsg);
     }
 
     // Webrtc_Vad integration
     SpeakToMeVad = function SpeakToMeVad() {
         this.webrtc_main = Module.cwrap("main");
         this.webrtc_main();
         this.webrtc_setmode = Module.cwrap("setmode", "number", ["number"]);
         // set_mode defines the aggressiveness degree of the voice activity detection algorithm
         // for more info see: https://github.com/mozilla/gecko/blob/central/media/webrtc/trunk/webrtc/common_audio/vad/vad_core.h#L68
         this.webrtc_setmode(3);
         this.webrtc_process_data = Module.cwrap("process_data", "number", [
             "number",
             "number",
             "number",
             "number",
             "number",
             "number"
         ]);
         // frame length that should be passed to the vad engine. Depends on audio sample rate
         // https://github.com/mozilla/gecko/blob/central/media/webrtc/trunk/webrtc/common_audio/vad/vad_core.h#L106
         this.sizeBufferVad = 480;
         // minimum of voice (in milliseconds) that should be captured to be considered voice
         this.minvoice = 250;
         // max amount of silence (in milliseconds) that should be captured to be considered end-of-speech
         this.maxsilence = 1500;
         // max amount of capturing time (in seconds)
         this.maxtime = 6;
 
         this.reset = function() {
             this.buffer_vad = new Int16Array(this.sizeBufferVad);
             this.leftovers = 0;
             this.finishedvoice = false;
             this.samplesvoice = 0;
             this.samplessilence = 0;
             this.touchedvoice = false;
             this.touchedsilence = false;
             this.dtantes = Date.now();
             this.dtantesmili = Date.now();
             this.raisenovoice = false;
             this.done = false;
         };
 
         // function that returns if the specified buffer has silence of speech
         this.isSilence = function(buffer_pcm) {
             // Get data byte size, allocate memory on Emscripten heap, and get pointer
             const nDataBytes = buffer_pcm.length * buffer_pcm.BYTES_PER_ELEMENT;
             const dataPtr = Module._malloc(nDataBytes);
             // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
             const dataHeap = new Uint8Array(
                 Module.HEAPU8.buffer,
                 dataPtr,
                 nDataBytes
             );
             dataHeap.set(new Uint8Array(buffer_pcm.buffer));
             // Call function and get result
             const result = this.webrtc_process_data(
                 dataHeap.byteOffset,
                 buffer_pcm.length,
                 48000,
                 buffer_pcm[0],
                 buffer_pcm[100],
                 buffer_pcm[2000]
             );
             // Free memory
             Module._free(dataHeap.byteOffset);
             return result;
         };
 
         this.floatTo16BitPCM = function(output, input) {
             for (let i = 0; i < input.length; i++) {
                 const s = Math.max(-1, Math.min(1, input[i]));
                 output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
             }
         };
 
         this.recorderProcess = function(e) {
             const buffer_pcm = new Int16Array(
                 e.inputBuffer.getChannelData(0).length
             );
             stm_vad.floatTo16BitPCM(
                 buffer_pcm,
                 e.inputBuffer.getChannelData(0)
             );
             // algorithm used to determine if the user stopped speaking or not
             for (
                 let i = 0;
                 i < Math.ceil(buffer_pcm.length / stm_vad.sizeBufferVad) &&
                 !stm_vad.done;
                 i++
             ) {
                 const start = i * stm_vad.sizeBufferVad;
                 let end = start + stm_vad.sizeBufferVad;
                 if (start + stm_vad.sizeBufferVad > buffer_pcm.length) {
                     // store to the next buffer
                     stm_vad.buffer_vad.set(buffer_pcm.slice(start));
                     stm_vad.leftovers = buffer_pcm.length - start;
                 } else {
                     if (stm_vad.leftovers > 0) {
                         // we have this.leftovers from previous array
                         end = end - this.leftovers;
                         stm_vad.buffer_vad.set(
                             buffer_pcm.slice(start, end),
                             stm_vad.leftovers
                         );
                         stm_vad.leftovers = 0;
                     } else {
                         // send to the vad
                         stm_vad.buffer_vad.set(buffer_pcm.slice(start, end));
                     }
                     const vad = stm_vad.isSilence(stm_vad.buffer_vad);
                     stm_vad.buffer_vad = new Int16Array(stm_vad.sizeBufferVad);
                     const dtdepois = Date.now();
                     if (vad === 0) {
                         if (stm_vad.touchedvoice) {
                             stm_vad.samplessilence +=
                                 dtdepois - stm_vad.dtantesmili;
                             if (stm_vad.samplessilence > stm_vad.maxsilence) {
                                 stm_vad.touchedsilence = true;
                             }
                         }
                     } else {
                         stm_vad.samplesvoice += dtdepois - stm_vad.dtantesmili;
                         if (stm_vad.samplesvoice > stm_vad.minvoice) {
                             stm_vad.touchedvoice = true;
                         }
                     }
                     stm_vad.dtantesmili = dtdepois;
                     if (stm_vad.touchedvoice && stm_vad.touchedsilence) {
                         stm_vad.finishedvoice = true;
                     }
                     if (stm_vad.finishedvoice) {
                         stm_vad.done = true;
                         if (!SpeakToMePopup.textInputDetected) stm_vad.goCloud("GoCloud finishedvoice");
                     }
                     if ((dtdepois - stm_vad.dtantes) / 1000 > stm_vad.maxtime) {
                         stm_vad.done = true;
                         if (stm_vad.touchedvoice) {
                             stm_vad.goCloud("GoCloud timeout");
                         } else {
                             stm_vad.goCloud("Raise novoice");
                             stm_vad.raisenovoice = true;
                         }
                     }
                 }
             }
         };
 
         this.goCloud = function(why) {
             console.log(why);
             this.stopGum();
             const copy = document.getElementById("stm-content");
             copy.innerHTML = `<div id="stm-listening-text">Processing...</div>`;
             loadAnimation(DONE_ANIMATION, false);
         };
         console.log("speakToMeVad created()");
     };
 })();
 
 // Creation of the configuration object
 // that will be pick by emscripten module
 var Module = {
     preRun: [],
     postRun: [],
     print: (function() {
         return function(text) {
             console.log("[webrtc_vad.js print]", text);
         };
     })(),
     printErr(text) {
         fail_gracefully("[webrtc_vad.js error]", text);
     },
     canvas: (function() {})(),
     setStatus(text) {
         console.log("[webrtc_vad.js status] ", text);
     },
     totalDependencies: 0,
     monitorRunDependencies(left) {
         this.totalDependencies = Math.max(this.totalDependencies, left);
         Module.setStatus(
             left
                 ? "Preparing... (" +
                   (this.totalDependencies - left) +
                   "/" +
                   this.totalDependencies +
                   ")"
                 : "All downloads complete."
         );
     }
 };
 let stm_vad;
 Module.setStatus("Loading webrtc_vad...");
 window.onerror = function(event) {
     // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
     Module.setStatus("Exception thrown, see JavaScript console");
     Module.setStatus = function(text) {
         if (text) {
             Module.printErr("[post-exception status] " + text);
         }
     };
 };
 Module.noInitialRun = true;
 Module["onRuntimeInitialized"] = function() {
     stm_vad = new SpeakToMeVad();
     Module.setStatus("Webrtc_vad and SpeakToMeVad loaded");
 }; 
