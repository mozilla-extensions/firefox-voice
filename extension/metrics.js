/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Metrics = {
     session: () => {
         console.log("session");
         // move to library
         Metrics.sendMessage("session", {
             sc: "end",
             cm1: "",
             cm2: "",
             cm3: "",
             cm4: "",
             cm5: "",
             cd1: "",
             cd2: "",
             cd3: "",
             cd4: ""
         });
     },
    attempt: () => {
         console.log("attempt");
         Metrics.sendMessage("attempt", {
             cm2: "",
             cm3: "",
             cm4: "",
             cm5: "",
             cd1: "",
             cd5: ""
         });
    },
    sendMessage: (message) => {
        const sendingMessage = browser.runtime.sendMessage(message);
        sendingMessage.then(result => {
            console.log("[metrics] Sent message to background script");
        });
    }
};
