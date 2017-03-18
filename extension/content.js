/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function speak_to_me() {

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error("You need a browser with getUserMedia support to use Speak To Me, sorry!");
    return;
}

// TODO: figure out why using a resource in the extensions with browser.extension.getURL() fails.
const mic_icon_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAABW0lEQVR4Ad2VJXQDMRyHU1Ljzeu6+tnKeTM7NmPUu9CYSQ38ewVXWd/5t7qaoRrz/kkuNyoz/b5cOF+vjMoS7tqY2ohuPG9EZevIW7Ph2AhuwA/BvFXrQ+vwj6F8RZE4USRf0VOc6DlP0RrEUzeiVYij4qIViKPiomWII1/REsRTadEixFNp0QLEk8vhO3WAu8z+RZzoQs2yRrP/mkHEzzhwYG6zf8LhH0dqlnrMHbFMIr+5bUT1mZs//NE8aD0bN0f+DCLWy0AS4y5z5GU35hhk69V/ByxmjnsziRrZDQXJoh7TZtpN5+TVbI0X1arUNqJMYSMUFGw8ydq4tTaCMofYSYiASUC/KpbETQLWfIjYUTahzSRMwOKUHBiUHMgWLMK0OYd/WLyDIQkfeIe7UG7BnSSAP/5KSIB6UH7B7bhLa2TbgQqLAYq4yYqK8IchX59i3BGdfzAoqsEI9//IsA+uNg0AAAAASUVORK5CYII=";

const stt_server_url = "http://10.252.24.90:9001/asr";

// Encapsulation of the popup we use to provide our UI.
const popup_markup =
`
<div id="stm-popup">
  <button id="stm-stop">Stop</button>
  <div id="stm-list"></div>
</div>
`;

const SpeakToMePopup = {
    init: () => {
        console.log(`SpeakToMePopup init`);
        let popup = document.createElement("div");
        popup.innerHTML = popup_markup;
        document.body.appendChild(popup);
        this.popup = document.getElementById("stm-popup");
        this.list = document.getElementById("stm-list");
    },

    showAt: (x, y) => {
        console.log(`SpeakToMePopup showAt ${x},${y}`);
        this.list.classList.add("hidden");

        let style = this.popup.style;
        style.left = (x + window.scrollX) + "px";
        style.top = (y + window.scrollY) + "px";
        style.display = "block";
    },

    hide: () => {
        console.log(`SpeakToMePopup hide`);
        this.popup.style.display = "none";
    },

    // Returns a Promise that resolves once the "Stop" button is clicked.
    // TODO: replace with silence detection.
    wait_for_stop: () => {
        console.log(`SpeakToMePopup wait_for_stop`);
        return new Promise((resolve, reject) => {
            console.log(`SpeakToMePopup set popup stop listener`);
            let button = document.getElementById("stm-stop");
            button.classList.remove("hidden");
            button.addEventListener("click", function _mic_stop() {
                button.classList.add("hidden");
                button.removeEventListener("click", _mic_stop);
                resolve();
            });
        });
    },

    // Returns a Promise that resolves to the choosen text.
    choose_item: (data) => {
        console.log(`SpeakToMePopup choose_item`);
        return new Promise((resolve, reject) => {
            let html = "<ul class='stm-list'>";
            data.forEach(item => {
                if (item.text != "") {
                    html += `<li>${item.text.toLowerCase()}</li>`;
                }
            })
            html += "</ul>";
            let list = this.list;
            list.innerHTML = html;
            list.classList.remove("hidden");

            list.addEventListener("click", function _choose_item(e) {
                list.removeEventListener("click", _choose_item);
                if (e.target instanceof HTMLLIElement) {
                    resolve(e.target.textContent);
                }
            });
        });
    }
}

SpeakToMePopup.init();

// We listen to all focusin events that bubble up to us to find
// interesting input fields.
document.body.addEventListener("focusin", (event) => {
    let target = event.target;
    // TODO: refine input field detection.
    if (target instanceof HTMLInputElement &&
        ["text", "email"].indexOf(target.type) >= 0) {
        add_mic_widget(target);
    }
});

const add_mic_widget = (target) => {
    // Ideally we would add a mic icon as part of the system styling,
    // but this is not possible in a WebExtension.
    // Instead, we try to display our icon close to the input field...
    if (target.previousSibling &&
        target.previousSibling.className == "speak-to-me-mic") {
        // We already added a mic icon for this input field, bailing out.
        return;
    }

    let wrapper = document.createElement("span");
    wrapper.className = "speak-to-me-mic";
    let mic = document.createElement("img");
    mic.input_field = target;
    mic.src = mic_icon_url;
    wrapper.appendChild(mic);
    let insertedNode = target.parentNode.insertBefore(wrapper, target);
    mic.addEventListener("click", on_mic_click);
}

const on_mic_click = (event) => {
    let constraints = { audio: true };
    let chunks = [];

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        let options = {
            audioBitsPerSecond : 16000,
            mimeType : "audio/ogg"
        }

        let mediaRecorder = new MediaRecorder(stream, options);

        SpeakToMePopup.showAt(event.clientX, event.clientY);

        SpeakToMePopup.wait_for_stop().then(() => {
            mediaRecorder.stop();
        });

        // TODO: Would be nice to have a wave or fft display.
        // visualize(stream);

        mediaRecorder.start();

        mediaRecorder.onstop = (e) => {
            // We stopped the recording, send the content to the STT server.
            mediaRecorder = null;
            let blob = new Blob(chunks, { "type" : "audio/ogg; codecs=opus" });
            chunks = [];

            fetch(stt_server_url, {
                method: "POST",
                body: blob
                })
            .then((response) => { return response.json(); })
            .then((json) => {
                console.log(`Got STT result: ${JSON.stringify(json)}`);
                if (json.status == "ok") {
                    let field = event.target.input_field;
                    display_options(field, json.data);
                }
            })
            .catch((error) => {
                console.error(`Fetch error: ${error}`);
            });
        }

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        }
    })
    .catch(function(err) {
        console.log(`Recording error: ${err}`);
    });
}

const display_options = (input_field, data) => {
    // if the first result has a high enough confidence, just
    // use it directly.
    if (data[0].confidence > 0.90) {
        target.input_field.value = data[0].text.toLowerCase();
        SpeakToMePopup.hide();
        return;
    }

    SpeakToMePopup.choose_item(data).then((text) => {
        input_field.value = text;
        // Once a choice is made, close the popup.
        SpeakToMePopup.hide();
    });
}

})();