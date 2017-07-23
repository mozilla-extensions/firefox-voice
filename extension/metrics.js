/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Metrics {

     constructor() {
         this.num_attempts = 0;
     }

     session() {
         console.log("session");
         // move to library
         this.sendMessage("session", {
             sc: "end",
             cm1: "", // the number of attempts made in a session.
             cm2: "", // the confidence level of the accepted suggestion, if one was accepted; otherwise omitted. Integer between 1 and 100, inclusive.
             cm3: "", // the index of an accepted suggestion, if one was accepted; otherwise omitted.
             cm4: "", //  the elapsed time in ms spent recording an attempt.
             cm5: "", // the elapsed time in ms waiting for a response from the speech-to-text engine.
             cd1: "", //  the outcome of a session or attempt. One of accepted, rejected, and aborted.
             cd2: "", // the location from which a session is initiated. One of google, duckduckgo, Yahoo, generic.
             cd3: "", // the UI element from which the session was initiated. One of button, context menu, keyboard.
             cd4: "" // whether the accepted submission was modified before being submitted. One of true, false.
         });
     }

    attempt(confidence_level, idx_suggestion, recording_time, response_time, user_outcome, was_options_displayed) {
         this.num_attempts += 1;
         console.log("attempt:", this.num_attempts);
         this.sendMessage("attempt", {
             cm2: confidence_level * 100, // the confidence level of the accepted suggestion, if one was accepted; otherwise omitted. Integer between 1 and 100, inclusive.
             cm3: idx_suggestion, // the index of an accepted suggestion, if one was accepted; otherwise omitted.
             cm4: recording_time, //  the elapsed time in ms spent recording an attempt.
             cm5: response_time, // the elapsed time in ms waiting for a response from the speech-to-text engine.
             cd1: user_outcome, //  the outcome of a session or attempt. One of accepted, rejected, and aborted.
             cd5: was_options_displayed //  whether the user viewed additional suggestions.
         });
    }

    sendMessage(message) {
        const sendingMessage = browser.runtime.sendMessage(message);
        sendingMessage.then(result => {
            console.log("[metrics] Sent message to background script");
        });
    }
}
