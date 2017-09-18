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

    let mediaRecorder = null;
    const metrics = new Metrics();
    const LOCAL_TEST = false;
    const STT_SERVER_URL = "https://speaktome.services.mozilla.com";

    const DONE_ANIMATION = browser.extension.getURL("Done.json");
    const SPINNING_ANIMATION = browser.extension.getURL("Spinning.json");
    const START_ANIMATION = browser.extension.getURL("Start.json");
    const ERROR_ANIMATION = browser.extension.getURL("Error.json");

    const getSTMAnchors = documentDomain => {
        switch (documentDomain) {
            case "www.google.com":
            case "www.google.ca":
            case "www.google.tn":
            case "www.google.fr":
            case "www.google.ad":
            case "www.google.ae":
            case "www.google.com.af":
            case "www.google.com.ag":
            case "www.google.com.ai":
            case "www.google.al":
            case "www.google.am":
            case "www.google.co.ao":
            case "www.google.com.ar":
            case "www.google.as":
            case "www.google.at":
            case "www.google.com.au":
            case "www.google.az":
            case "www.google.ba":
            case "www.google.com.bd":
            case "www.google.be":
            case "www.google.bf":
            case "www.google.bg":
            case "www.google.com.bh":
            case "www.google.bi":
            case "www.google.bj":
            case "www.google.com.bn":
            case "www.google.com.bo":
            case "www.google.com.br":
            case "www.google.bs":
            case "www.google.bt":
            case "www.google.co.bw":
            case "www.google.by":
            case "www.google.com.bz":
            case "www.google.com.kh":
            case "www.google.cc":
            case "www.google.cd":
            case "www.google.cf":
            case "www.google.cg":
            case "www.google.ch":
            case "www.google.ci":
            case "www.google.co.ck":
            case "www.google.cl":
            case "www.google.cm":
            case "www.google.cn":
            case "www.google.com.co":
	        case "www.google.co.ck":
            case "www.google.co.cr":
            case "www.google.com.cu":
            case "www.google.cv":
            case "www.google.com.cy":
            case "www.google.cz":
            case "www.google.de":
            case "www.google.dj":
            case "www.google.dk":
            case "www.google.dm":
            case "www.google.com.do":
            case "www.google.dz":
            case "www.google.com.ec":
            case "www.google.ee":
            case "www.google.com.eg":
            case "www.google.es":
            case "www.google.com.et":
            case "www.google.fi":
            case "www.google.com.fj":
            case "www.google.fm":
            case "www.google.ga":
            case "www.google.ge":
            case "www.google.gf":
            case "www.google.gg":
            case "www.google.com.gh":
            case "www.google.com.gi":
            case "www.google.gl":
            case "www.google.gm":
            case "www.google.gp":
            case "www.google.gr":
            case "www.google.com.gt":
            case "www.google.gy":
            case "www.google.com.hk":
            case "www.google.hn":
            case "www.google.hr":
            case "www.google.ht":
            case "www.google.hu":
            case "www.google.co.id":
            case "www.google.iq":
            case "www.google.ie":
            case "www.google.co.il":
            case "www.google.im":
            case "www.google.co.in":
            case "www.google.is":
            case "www.google.it":
            case "www.google.je":
            case "www.google.com.jm":
            case "www.google.jo":
            case "www.google.co.jp":
            case "www.google.co.ke":
            case "www.google.ki":
            case "www.google.kg":
            case "www.google.co.kr":
            case "www.google.com.kw":
            case "www.google.kz":
            case "www.google.la":
            case "www.google.com.lb":
            case "www.google.li":
            case "www.google.lk":
            case "www.google.co.ls":
            case "www.google.lt":
            case "www.google.lu":
            case "www.google.lv":
            case "www.google.com.ly":
            case "www.google.co.ma":
            case "www.google.md":
            case "www.google.me":
            case "www.google.mg":
            case "www.google.mk":
            case "www.google.ml":
            case "www.google.com.mm":
            case "www.google.mn":
            case "www.google.ms":
            case "www.google.com.mt":
            case "www.google.mu":
            case "www.google.mv":
            case "www.google.mw":
            case "www.google.com.mx":
            case "www.google.com.my":
            case "www.google.co.mz":
            case "www.google.com.na":
            case "www.google.ne":
            case "www.google.ng":
            case "www.google.com.ng":
            case "www.google.com.ni":
            case "www.google.nl":
            case "www.google.no":
            case "www.google.com.np":
            case "www.google.nr":
            case "www.google.nu":
            case "www.google.co.nz":
            case "www.google.com.pk":
            case "www.google.com.pa":
            case "www.google.com.pe":
            case "www.google.com.ph":
            case "www.google.pl":
            case "www.google.com.pg":
            case "www.google.pn":
            case "www.google.com.pr":
            case "www.google.ps":
            case "www.google.pt":
            case "www.google.com.py":
            case "www.google.com.qa":
            case "www.google.ro":
            case "www.google.rs":
            case "www.google.ru":
            case "www.google.rw":
            case "www.google.com.sa":
            case "www.google.com.sb":
            case "www.google.sc":
            case "www.google.se":
            case "www.google.com.sg":
            case "www.google.sh":
            case "www.google.si":
            case "www.google.sk":
            case "www.google.com.sl":
            case "www.google.sn":
            case "www.google.sm":
            case "www.google.so":
            case "www.google.st":
            case "www.google.sr":
            case "www.google.com.sv":
            case "www.google.td":
            case "www.google.tg":
            case "www.google.co.th":
            case "www.google.com.tj":
            case "www.google.tk":
            case "www.google.tl":
            case "www.google.tm":
            case "www.google.to":
            case "www.google.com.tr":
            case "www.google.tt":
            case "www.google.com.tw":
            case "www.google.co.tz":
            case "www.google.com.ua":
            case "www.google.co.ug":
            case "www.google.com.uy":
            case "www.google.co.uz":
            case "www.google.com.vc":
            case "www.google.co.ve":
            case "www.google.vg":
            case "www.google.co.vi":
            case "www.google.com.vn":
            case "www.google.vu":
            case "www.google.ws":
            case "www.google.co.za":
            case "www.google.co.zm":
            case "www.google.co.zw":
            case "www.google.co.uk":
                return {
                    input: "lst-ib",
                    anchor: "sfdiv"
                }
            case "duckduckgo.com":
            case "start.duckduckgo.com":
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
            case "us.yahoo.com":
            case "fr.yahoo.com":
            case "de.yahoo.com":
            case "ie.yahoo.com":
            case "in.yahoo.com":
            case "it.yahoo.com":
            case "se.yahoo.com":
            case "tw.yahoo.com":
            case "www.yahoo.com":
                return {
                    input: "uh-search-box",
                    anchor: "uh-search-form"
                };
            case "search.yahoo.com":
            case "ca.search.yahoo.com":
            case "uk.search.yahoo.com":
            case "fr.search.yahoo.com":
            case "au.search.yahoo.com":
            case "de.search.yahoo.com":
            case "dk.search.yahoo.com":
            case "ie.search.yahoo.com":
            case "in.search.yahoo.com":
            case "it.search.yahoo.com":
            case "no.search.yahoo.com":
            case "se.search.yahoo.com":
            case "tw.search.yahoo.com":
                return {
                    input: "yschsp",
                    anchor: "sf"
                };
            case "www.bing.com":
                return {
                    input: "sb_form_q",
                    anchor: "sb_form_go"
                };
            default:
                return null;
        }
    }


    // Encapsulation of the popup we use to provide our UI.
    const POPUP_WRAPPER_MARKUP = `<div id="stm-popup">
            <div id="stm-header"><div role="button" tabindex="1" id="stm-close"></div></div>
            <div id="stm-inject"></div>
            <a href="https://qsurvey.mozilla.com/s3/voice-fill?ref=product" id="stm-feedback" role="button" tabindex="2">Feedback</a>
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
                <input id="stm-input" type="text" autocomplete="off" />
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
            this.dismissPopup = function (e) {
                const key = e.which || e.keyCode;
                if (key === 27) {
                    e.preventDefault();
                    metrics.end_session();
                    SpeakToMePopup.hide();
                    mediaRecorder.stop();
                    SpeakToMePopup.closeClicked = true;
                }
            }
            this.addEventListener("keypress", this.dismissPopup);
        },

        hide: () => {
            console.log(`SpeakToMePopup hide`);
            this.removeEventListener("keypress", this.dismissPopup);
            this.popup.classList.add("stm-drop-out");
            this.icon.classList.remove("stm-hidden");
            this.icon.disabled = false;

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
                            let confidence = DOMPurify.sanitize(item.confidence);
                            let text = DOMPurify.sanitize(item.text);
                            html += `<li idx_suggestion="${index}" confidence="${confidence}" role="button" tabindex="0">${text}</li>`;
                        }
                    });
                    html += "</ul>";
                    list.innerHTML = html;
                }

                input.confidence = DOMPurify.sanitize(firstChoice.confidence);
                input.value = DOMPurify.sanitize(firstChoice.text);
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

    // The icon that we anchor to the currently focused input element.

    class SpeakToMeIcon {
        constructor() {
            console.log(`SpeakToMeIcon constructor ${this}`);
            const register = getSTMAnchors(document.domain);
            this.icon = document.createElement("button");
            this.icon.classList.add("stm-icon");
            this.icon.classList.add("stm-hidden");
            this.icon.disabled = true;
            this.hasAnchor = false;
            this.input = document.getElementById(register.input);
            this.anchor = document.getElementById(register.anchor);

            if (this.input.ownerDocument !== document) {
                return null;
            }

            document.body.appendChild(this.icon);
            this.icon.addEventListener("click", on_stm_icon_click);
            this.anchor.style.position = "relative";
            this.anchor.style.overflow = "visible";
            this.anchor.append(this.icon);
            this.icon.classList.remove("stm-hidden");
            this.icon.disabled = false;
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
                mediaRecorder = new MediaRecorder(
                    outputNode.stream,
                    options
                );

                SpeakToMePopup.wait_for_stop().then(() => {
                    mediaRecorder.stop();
                }, () => {
                    mediaRecorder.stop();
                    SpeakToMePopup.closeClicked = true;
                    metrics.end_session();
                    SpeakToMePopup.hide();
                }

                );

                document.getElementById("stm-levels").hidden = false;
                visualize(analyzerNode);

                metrics.start_attempt();
                mediaRecorder.start();
                metrics.start_recording();

                const copy = document.getElementById("stm-content");
                loadAnimation(SPINNING_ANIMATION, true);
                copy.innerHTML = `<div id="stm-listening-text">Listening...</div>`

                mediaRecorder.onstop = e => {
                     metrics.stop_recording();
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

                    metrics.start_stt();
                    fetch(STT_SERVER_URL, {
                        method: "POST",
                        body: blob
                    })
                        .then(response => {
                            if (!response.ok) {
                                fail_gracefully(`Fetch error: ${response.statusText}`);
                            }
                            metrics.end_stt();
                            return response.json();
                        })
                        .then(json => {
                            console.log(
                                `Got STT result: ${JSON.stringify(json)}`
                            );
                            const container = document.getElementById("stm-box");
                            container.classList.add('stm-done-animation');
                            setTimeout(() => {
                                if (json.status === "ok") {
                                    display_options(json.data);
                                }
                            }, 500);
                        })
                        .catch(error => {
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

    // Click handler for stm icon
    const on_stm_icon_click = event => {
        const type = event.detail ? "button" : "keyboard";
        event.preventDefault();
        metrics.start_session(type);
        event.target.classList.add("stm-hidden");
        SpeakToMePopup.showAt(event.clientX, event.clientY);
        stm_init();
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
        context.strokeStyle = "#d1d2d3";
        
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
            fail_gracefully(`EMPTYRESULTS`);
            return;
        }

        const validate_results = function(data) {
            if (data.length === 1) {
                return true;
            }

            const val0 = String(data[0].confidence).substring(0, 4);
            const val1 = String(data[1].confidence).substring(0, 4);

            if ((val0 - val1) > 0.2) {
                return true;
            }
            return false;
        }

        // if the first result has a high enough confidence, or the distance
        // to the second large enough just
        // use it directly.
        data.sort(function(a, b) {
              return b.confidence - a.confidence;
        });
        if (validate_results(data)) {
            metrics.end_attempt(data[0].confidence, "default accepted", 0);
            metrics.end_session();
            stm_icon.set_input(data[0].text);
            SpeakToMePopup.hide();
            return;
        }

        metrics.set_options_displayed();
        SpeakToMePopup.choose_item(data).then(input => {
            metrics.end_attempt(input.confidence, "accepted", input.idx_suggestion);
            metrics.end_session();
            stm_icon.set_input(input.value);
            // Once a choice is made, close the popup.
            SpeakToMePopup.hide();
        }, id => {
            if (id === "stm-reset-button") {
                metrics.end_attempt(-1, "reset", -1);
                SpeakToMePopup.reset();
                stm_init();
            } else {
                metrics.end_attempt(-1, "rejected", -1);
                metrics.end_session();
                SpeakToMePopup.hide();
            }
        });
    };

    const stm_icon = new SpeakToMeIcon();
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
      copy.innerHTML = `<div id="stm-listening-text">${errorMsg}</div>`
      setTimeout(() => {
          SpeakToMePopup.hide();
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
            const copy = document.getElementById("stm-content");
            copy.innerHTML = `<div id="stm-listening-text">Processing...</div>`
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
