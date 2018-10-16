/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Metrics {

    constructor() {
         this.num_attempts = 0;
     }

    start_session(triggered_by_uielement) {
        this.num_attempts = 0;
        this.accepted_confidence = -1;
        this.accepted_idx_suggestion = -1;
        this.accepted_outcome = "";
        this.triggered_by_uielement = triggered_by_uielement;
    }

    end_session() {
         // move to library
         this.sendMessage("session", {
             sc: "end",
             cm1: this.num_attempts, // the number of attempts made in a session.
             cm2: this.accepted_confidence, // the confidence level of the accepted suggestion, if one was accepted; otherwise omitted. Integer between 1 and 100, inclusive.
             cm3: this.accepted_idx_suggestion, // the index of an accepted suggestion, if one was accepted; otherwise omitted.
             cm4: this.dt_recording_time, //  the elapsed time in ms spent recording an attempt.
             cm5: this.dt_response_time, //  the elapsed time in ms waiting for a response from the speech-to-text engine.
             cd1: this.accepted_outcome, //  the outcome of a session or attempt. One of accepted, rejected, and aborted.
             cd2: document.domain, //  the location from which a session is initiated. Will contain google, duckduckgo, Yahoo, generic.
             cd3: this.triggered_by_uielement, //  the UI element from which the session was initiated. One of button, context menu, keyboard.
             cd4: this.was_result_modified, //   whether the accepted submission was modified before being submitted. One of true, false.
         });
     }

    start_recording() {
        this.dt_recording_time =  Date.now();
    }

    stop_recording() {
        this.dt_recording_time = Date.now() - this.dt_recording_time;
    }

    start_attempt() {
        this.num_attempts += 1;
        this.options_were_displayed = 0;
    }

    start_stt() {
        this.dt_response_time = Date.now();
    }

    end_stt() {
        this.dt_response_time = Date.now() - this.dt_response_time;
    }

    set_options_displayed() {
        this.options_were_displayed = 1;
    }

    end_attempt(confidence_level, attempt_outcome, idx_suggestion, result_modified) {
         console.log("[metrics] metrics.js attempt:", this.num_attempts);
         this.accepted_confidence = confidence_level * 100;
         this.accepted_idx_suggestion = idx_suggestion;
         this.accepted_outcome = attempt_outcome;
         this.was_result_modified = result_modified;

         this.sendMessage("attempt", {
             cm2: confidence_level * 100, // the confidence level of the accepted suggestion, if one was accepted; otherwise omitted. Integer between 1 and 100, inclusive.
             cm3: idx_suggestion, // the index of an accepted suggestion, if one was accepted; otherwise omitted.
             cm4: this.dt_recording_time, //  the elapsed time in ms spent recording an attempt.
             cm5: this.dt_response_time, // the elapsed time in ms waiting for a response from the speech-to-text engine.
             cd1: attempt_outcome, //  the outcome of a session or attempt. One of accepted, rejected, and aborted.
             cd5: this.options_were_displayed, //  whether the user viewed additional suggestions.
         });
    }

    sendMessage(event, content) {
        const message = { "type": event, "content": content};
        const sendingMessage = browser.runtime.sendMessage(message);
        sendingMessage.then(result => {
            console.log("[metrics] Sent message to background script");
        });
    }
}
