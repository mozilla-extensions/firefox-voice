/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function speak_to_me() {
    console.log("Speak To Me starting up...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error(
            "You need a browser with getUserMedia support to use Speak To Me, sorry!"
        );
        return;
    }

    const metrics = new Metrics();
    const LOCAL_TEST = false;
    const STT_SERVER_URL = "https://speaktome.stage.mozaws.net";

    const DONE_ANIMATION = browser.extension.getURL("Done.json");
    const SPINNING_ANIMATION = browser.extension.getURL("Spinning.json");
    const START_ANIMATION = browser.extension.getURL("Start.json");


    const getSTMAnchors = documentDomain => {
        switch (documentDomain) {
            case "www.google.com":
            case "www.google.ca":
            case "www.google.co.uk":
                return {
                    input: "lst-ib",
                    anchor: "sfdiv"
                }
            case "duckduckgo.com":
                if (document.body.classList.contains("body--serp")) {
                    return {
                        input: "search_form_input",
                        anchor: "search_form"
                    };
                }
                return {
                    input: "search_form_input_homepage",
                    anchor: "search_form_homepage"
                };
            case "ca.yahoo.com":
            case "uk.yahoo.com":
            case "www.yahoo.com":
                return {
                    input: "uh-search-box",
                    anchor: "uh-search-form"
                };
            default:
                return null;
        }
    }


    // Encapsulation of the popup we use to provide our UI.
    const POPUP_WRAPPER_MARKUP = `<div id="stm-popup">
            <div id="stm-header"><div role="button" tabindex="1" id="stm-close"></div></div>
            <div id="stm-inject"></div>
            <a href="https://qsurvey.mozilla.com/s3/voice-fill" id="stm-feedback" role="button" tabindex="2">Feedback</a>
        </div>`;

    // When submitting, this markup is passed in
    const SUBMISSION_MARKUP = `<div id="stm-levels-wrapper">
            <canvas hidden id="stm-levels" width=720 height=310></canvas>
        </div>
        <div id="stm-animation-wrapper">
            <div id="stm-box"></div>
        </div>
        <div id="stm-content">
            <div id="stm-startup-text">Warming up...</div>
        </div>`;

    // When Selecting, this markup is passed in
    const SELECTION_MARKUP = `<form id="stm-selection-wrapper">
            <div id="stm-list-wrapper">
                <input id="stm-input" type="text" />
                <div id="stm-list"></div>
            </div>
            <button id="stm-reset-button" title="Reset" type="button"></button>
            <input id="stm-submit-button" type="submit" title="Submit" value=""/>
        </form>`;

    const SpeakToMePopup = {
        // closeClicked used to skip out of media recording handling
        closeClicked: false,
        init: () => {
            console.log(`SpeakToMePopup init`);
            const popup = document.createElement("div");
            popup.innerHTML = POPUP_WRAPPER_MARKUP;
            document.body.appendChild(popup);
            this.inject = document.getElementById("stm-inject");
            this.popup = document.getElementById("stm-popup");
            this.icon = document.getElementsByClassName("stm-icon")[0];
            this.inject.innerHTML = SUBMISSION_MARKUP;
        },

        showAt: (x, y) => {
            console.log(`SpeakToMePopup showAt ${x},${y}`);
            const style = this.popup.style;
            style.display = "flex";
        },

        hide: () => {
            console.log(`SpeakToMePopup hide`);
            this.popup.classList.add("stm-drop-out");
            this.icon.classList.remove("stm-hidden");

            setTimeout(() => {
                this.popup.classList.remove("stm-drop-out");
                this.popup.style.display = "none";
                this.inject.innerHTML = SUBMISSION_MARKUP;
            }, 500);
        },

        reset: () => {
            this.inject.innerHTML = SUBMISSION_MARKUP;
        },

        // Returns a Promise that resolves once the "Stop" button is clicked.
        // TODO: replace with silence detection.
        // TODO: make stop button clickable
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
                        } else {
                        html += `<li role="button" tabindex="0">${item.text}</li>`;
                        }
                    });
                    html += "</ul>";
                    list.innerHTML = html;
                }

                input.value = firstChoice.text;
                input.size = input.value.length;

                if (list) {
                    list.style.width = `${input.offsetWidth}px`;
                }

                input.focus();

                form.addEventListener("submit", function _submit_form(e) {
                    console.log('!!!!!!!!');
                    e.preventDefault();
                    e.stopPropagation();
                    form.removeEventListener("submit", _submit_form);
                    resolve(input.value);
                });

                list.addEventListener("click", function _choose_item(e) {
                    e.preventDefault();
                    list.removeEventListener("click", _choose_item);
                    if (e.target instanceof HTMLLIElement) {
                        resolve(e.target.textContent);
                    }
                });

                list.addEventListener("keypress", function _choose_item(e) {
                    const key = e.which || e.keyCode;
                    if (key === 13) {
                        list.removeEventListener("click", _choose_item);
                        if (e.target instanceof HTMLLIElement) {
                            resolve(e.target.textContent);
                        }
                    }
                });

                reset.addEventListener("click", function _reset_click(e) {
                    e.preventDefault();
                    close.removeEventListener("click", _reset_click);
                    reject(e.target.id);
                });

                close.addEventListener("click", function _close_click(e) {
                    e.preventDefault();
                    close.removeEventListener("click", _close_click);
                    reject(e.target.id);
                });

            });
        }
    };

    // The icon that we anchor to the currently focused input element.

    class SpeakToMeIcon {
        constructor() {
            console.log(`SpeakToMeIcon constructor ${this}`);
            const register = getSTMAnchors(document.domain);
            this.icon = document.createElement("button");
            this.icon.classList.add("stm-icon");
            this.icon.classList.add("stm-hidden");
            this.hasAnchor = false;
            this.input = document.getElementById(register.input);
            this.anchor = document.getElementById(register.anchor);

            if (this.input.ownerDocument !== document) {
                return null;
            }

            document.body.appendChild(this.icon);
            this.icon.addEventListener("click", on_stm_icon_click);
            this.input.focus();
            this.anchor.style.position = "relative";
            this.anchor.style.overflow = "visible";
            this.anchor.append(this.icon);
            this.icon.classList.remove("stm-hidden");
        }


        set_input(text) {
            console.log(`SpeakToMeIcon set_input ${text}`);
            this.input.value = text;
            this.input.focus();
            this.input.form.submit();
        }
    }

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
                let mediaRecorder = new MediaRecorder(
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

                document.getElementById("stm-levels").hidden = false;
                visualize(analyzerNode);

                mediaRecorder.start();

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

                    if (LOCAL_TEST) {
                        const json = JSON.parse(
                            '{"status":"ok","data":[{"confidence":0.807493,"text":"PLEASE ADD MILK TO MY SHOPPING LIST"},{"confidence":0.906263,"text":"PLEASE AT MILK TO MY SHOPPING LIST"},{"confidence":0.904414,"text":"PLEASE ET MILK TO MY SHOPPING LIST"}]}'
                        );
                        if (json.status === "ok") {
                            display_options(json.data);
                        }
                        return;
                    }

                    fetch(STT_SERVER_URL, {
                        method: "POST",
                        body: blob
                    })
                        .then(response => {
                            return response.json();
                        })
                        .then(json => {
                            console.log(
                                `Got STT result: ${JSON.stringify(json)}`
                            );
                            if (json.status === "ok") {
                                display_options(json.data);
                            }
                        })
                        .catch(error => {
                            console.error(`Fetch error: ${error}`);
                        });
                };

                mediaRecorder.ondataavailable = e => {
                    chunks.push(e.data);
                };
            })
            .catch(function(err) {
                console.log(`Recording error: ${err}`);
            });
    };

    // Helper for animation startup
    const stm_init = () => {
       loadAnimation(START_ANIMATION, false, "stm-start-animation");

        setTimeout(() => {
            const copy = document.getElementById("stm-content");
            loadAnimation(SPINNING_ANIMATION, true);
            copy.innerHTML = `<div id="stm-listening-text">Listening...</div>`
            stm_start();
        }, 1000);
    };

    // Click handler for stm icon
    const on_stm_icon_click = event => {
        event.preventDefault();
        event.target.classList.add("stm-hidden");
        SpeakToMePopup.showAt(event.clientX, event.clientY);
        stm_init();
    };

    const on_stm_close_click = event => {
        SpeakToMePopup.hide();
    }

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
        const levels = document.getElementById("stm-levels");
        const xPos = levels.offsetWidth * .5;
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
        context.strokeStyle = "#000";
        context.lineWidth = 10;
        context.globalAlpha = .05
        for (let i = 0; i < n; i++) {
            const value = frequencyBins[i + skip];
            const diameter = (levels.height * (value - MIN_DB_LEVEL) / dbRange) * .50;
            if (diameter < 0) {
                continue;
            }
            // Display a bar for this value.
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
            context.stroke();
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

    const display_options = items => {
        // Filter the array for empty items and normalize the text.
        const data = items
            .filter(item => {
                return item.text !== "";
            })
            .map(item => {
                return {
                    confidence: item.confidence,
                    text: item.text.toLowerCase()
                };
            });

        if (data.length === 0) {
            // TODO: display some failure notification to the user?
            SpeakToMePopup.hide();
            return;
        }

        // if the first result has a high enough confidence, just
        // use it directly.
        if (data[0].confidence > 0.9) {
            metrics.attempt(data[0].confidence);
            stm_icon.set_input(data[0].text);
            SpeakToMePopup.hide();
            return;
        }

        SpeakToMePopup.choose_item(data).then(text => {
            metrics.attempt(); // TODO: pass the confidence here
            stm_icon.set_input(text);
            // Once a choice is made, close the popup.
            SpeakToMePopup.hide();
        }, id => {
            if (id === "stm-reset-button") {
                SpeakToMePopup.reset();
                stm_init();
            } else {
                SpeakToMePopup.hide();
            }
        });
    };

    const stm_icon = new SpeakToMeIcon();
    SpeakToMePopup.init();


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
                        stm_vad.goCloud("GoCloud finishedvoice");
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
        console.error("[webrtc_vad.js error]", text);
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
