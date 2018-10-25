/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  console.log("Speak To Me starting up...");

  const LOCAL_TEST = false;

  const DONE_ANIMATION =
    browser.extension.getURL("/assets/animations/Done.json");
  const SPINNING_ANIMATION =
    browser.extension.getURL("/assets/animations/Spinning.json");
  const START_ANIMATION =
    browser.extension.getURL("/assets/animations/Start.json");
  const ERROR_ANIMATION =
    browser.extension.getURL("/assets/animations/Error.json");

  // Encapsulation of the popup we use to provide our UI.
  const POPUP_WRAPPER_MARKUP = `<div id="stm-popup">
      <div id="stm-header">
        <div role="button" tabindex="1" id="stm-close" title="Close"></div>
      </div>
      <div id="stm-inject"></div>
      <div id="stm-footer">
        Processing as {language}.
        <br>
        To change language, navigate to <a href="about:addons">about:addons</a>,
        then click the Preferences button next to Voice Fill.
      </div>
      <a href="https://qsurvey.mozilla.com/s3/voice-fill?ref=product&ver=2"
         id="stm-feedback" role="button" tabindex="2">
        Feedback
      </a>
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
        <input id="stm-input" type="text" autocomplete="off">
        <div id="stm-list"></div>
      </div>
      <button id="stm-reset-button" title="Reset" type="button"></button>
      <input id="stm-submit-button" type="submit" title="Submit" value="">
    </form>`;

  const metrics = new Metrics();
  let languages = {};
  let language;
  let stm;
  let audioContext;
  let sourceNode;
  let analyzerNode;
  let outputNode;
  let listening = false;

  const languagePromise = fetch(browser.extension.getURL("/js/languages.json"))
    .then((response) => {
      return response.json();
    })
    .then((l) => {
      languages = l;
      return browser.storage.sync.get("language");
    })
    .then((item) => {
      if (!item.language) {
        throw new Error("Language not set");
      }

      language = item.language;
    })
    .catch(() => {
      language = languages.hasOwnProperty(navigator.language)
        ? navigator.language
        : "en-US";
    })
    .then(() => {
      stm = SpeakToMe({
        listener,
        serverURL: "https://speaktome-2.services.mozilla.com",
        timeout: 6000,
        language,
        productTag: "vf",
        // maxsilence: 1500,
      });
    });

  if (!navigator.mediaDevices ||
      !(navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia)) {
    console.error(
      "You need a browser with getUserMedia support to use Speak To Me, sorry!"
    );
    return;
  }

  const escapeHTML = (str) => {
    // Note: string cast using String; may throw if `str` is non-serializable,
    // e.g. a Symbol. Most often this is not the case though.
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  // eslint-disable-next-line complexity
  const getSTMAnchors = (documentDomain) => {
    if (documentDomain.endsWith(".search.yahoo.com")) {
      return {
        input: "yschsp",
        anchor: "sbx",
      };
    }

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
      case "encrypted.google.com":
        if (document.getElementById("sfdiv")) {
          return {
            input: "lst-ib",
            anchor: "sfdiv",
          };
        }
        return {
          input: "q",
          anchor: "RNNXgb",
        };
      case "duckduckgo.com":
      case "start.duckduckgo.com":
        if (document.body.classList.contains("body--serp")) {
          return {
            input: "search_form_input",
            anchor: "search_form",
          };
        }
        return {
          input: "search_form_input_homepage",
          anchor: "search_form_homepage",
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
      case "www.yahoo.com":
        return {
          input: "uh-search-box",
          anchor: "uh-search-form",
        };
      case "search.yahoo.com":
        return {
          input: "yschsp",
          anchor: "sf",
        };
      case "www.bing.com":
        return {
          input: "sb_form_q",
          anchor: "b_searchboxForm",
        };
      case "tw.yahoo.com":
        return {
          input: "UHSearchBox",
          anchor: "UHSearch",
        };
      default:
        return null;
    }
  };
  browser.runtime.onMessage.addListener((request) => {
    this.icon.classList.add("stm-hidden");
    document.getElementsByClassName("stm-icon")[0].disabled = true;
    metrics.start_session("toolbar");
    SpeakToMePopup.showAt(0, 0);
    stmInit();
    return Promise.resolve({response: "content script ack"});
  });

  const SpeakToMePopup = {
    // closeClicked used to skip out of media recording handling
    closeClicked: false,
    init: () => {
      console.log("SpeakToMePopup init");
      const popup = document.createElement("div");
      // eslint-disable-next-line no-unsanitized/property
      popup.innerHTML = POPUP_WRAPPER_MARKUP;
      document.body.appendChild(popup);

      if (document.dir === "rtl") {
        document.getElementById("stm-close").classList.add("rtl");
        document.getElementById("stm-popup").classList.add("rtl");
        document.getElementById("stm-feedback").classList.add("rtl");
      }

      languagePromise.then(() => {
        const footer = document.getElementById("stm-footer");
        // eslint-disable-next-line no-unsanitized/property
        footer.innerHTML = footer.innerHTML.replace(
          "{language}",
          languages[language]
        );
      });

      this.inject = document.getElementById("stm-inject");
      this.popup = document.getElementById("stm-popup");
      this.icon = document.getElementsByClassName("stm-icon")[0];
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SUBMISSION_MARKUP;
    },

    showAt: (x, y) => {
      console.log(`SpeakToMePopup showAt ${x},${y}`);
      const style = this.popup.style;
      style.display = "flex";
      this.dismissPopup = function(e) {
        const key = e.which || e.keyCode;
        if (key === 27) {
          SpeakToMePopup.cancelFetch = true;
          e.preventDefault();
          metrics.end_session();
          SpeakToMePopup.hide();
          stm.stop();
          SpeakToMePopup.closeClicked = true;
        }
      };
      this.addEventListener("keypress", this.dismissPopup);
    },

    hide: () => {
      console.log("SpeakToMePopup hide");
      this.removeEventListener("keypress", this.dismissPopup);
      this.popup.classList.add("stm-drop-out");

      setTimeout(() => {
        this.popup.classList.remove("stm-drop-out");
        this.popup.style.display = "none";
        // eslint-disable-next-line no-unsanitized/property
        this.inject.innerHTML = SUBMISSION_MARKUP;
        this.icon.blur();
        this.icon.classList.remove("stm-hidden");
        this.icon.disabled = false;
      }, 500);
    },

    reset: () => {
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SUBMISSION_MARKUP;
    },

    // Returns a Promise that resolves once the "Stop" button is clicked.
    waitForStop: () => {
      console.log("SpeakToMePopup waitForStop");
      return new Promise((resolve, reject) => {
        const popup = document.getElementById("stm-popup");
        const close = document.getElementById("stm-close");
        popup.addEventListener("click", () => resolve(), {once: true});
        close.addEventListener(
          "click",
          (e) => {
            e.stopPropagation();
            reject();
          },
          {once: true}
        );
      });
    },

    // Returns a Promise that resolves to the chosen text.
    chooseItem: (data) => {
      console.log("SpeakToMePopup chooseItem");
      // eslint-disable-next-line no-unsanitized/property
      this.inject.innerHTML = SELECTION_MARKUP;
      const close = document.getElementById("stm-close");
      const form = document.getElementById("stm-selection-wrapper");
      const input = document.getElementById("stm-input");
      const list = document.getElementById("stm-list");
      const listWrapper = document.getElementById("stm-list-wrapper");
      const reset = document.getElementById("stm-reset-button");

      if (document.dir === "rtl") {
        document.getElementById("stm-submit-button").classList.add("rtl");
      }

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
            } else if (index < 5) {
              const confidence = escapeHTML(item.confidence);
              const text = escapeHTML(item.text);
              html += `<li idx_suggestion="${index}" confidence="${confidence}"
                role="button" tabindex="0">${text}</li>`;
            }
          });
          html += "</ul>";
          // eslint-disable-next-line no-unsanitized/property
          list.innerHTML = html;
        }

        input.confidence = escapeHTML(firstChoice.confidence);
        input.value = escapeHTML(firstChoice.text);
        input.size = Math.max(input.value.length, 10);
        input.idx_suggestion = 0;
        input.focus();

        input.addEventListener("keypress", (e) => {
          // e.preventDefault();
          if (e.keyCode === 13) {
            e.preventDefault();
            list.classList.add("close");
            resolve(input);
          }
        });

        input.addEventListener("input", () => {
          input.size = Math.max(10, input.value.length);
        });

        form.addEventListener("submit", function _submit_form(e) {
          e.preventDefault();
          e.stopPropagation();
          list.classList.add("close");
          form.removeEventListener("submit", _submit_form);
          resolve(input);
        });

        list.addEventListener("click", function _choose_item(e) {
          e.preventDefault();
          list.removeEventListener("click", _choose_item);
          if (e.target instanceof HTMLLIElement) {
            const result = [];
            result.confidence = e.target.getAttribute("confidence");
            result.value = e.target.textContent;
            result.idx_suggestion = e.target.getAttribute("idx_suggestion");
            list.classList.add("close");
            input.value = e.target.textContent;
            input.size = input.value.length;

            resolve(result);
          }
        });

        list.addEventListener("keypress", function _choose_item(e) {
          const key = e.which || e.keyCode;
          if (key === 13) {
            list.removeEventListener("click", _choose_item);
            if (e.target instanceof HTMLLIElement) {
              const result = [];
              result.confidence = e.target.getAttribute("confidence");
              result.value = e.target.textContent;
              result.idx_suggestion = e.target.getAttribute("idx_suggestion");
              list.classList.add("close");
              input.value = e.target.textContent;
              input.size = input.value.length;

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
    },
  };

  // The icon that we anchor to the currently focused input element.

  class SpeakToMeIcon {
    constructor() {
      console.log("SpeakToMeIcon constructor");
      const register = getSTMAnchors(document.domain);
      this.icon = document.createElement("button");
      this.icon.classList.add("stm-icon");
      this.icon.classList.add("stm-hidden");
      this.icon.disabled = true;
      this.icon.title = "Start listening";
      if (document.dir === "rtl") {
        this.icon.classList.add("rtl");
      }
      this.hasAnchor = false;
      this.input =
        document.getElementById(register.input) ||
        document.getElementsByName(register.input)[0];
      this.anchor =
        document.getElementById(register.anchor) ||
        document.getElementsByClassName(register.anchor)[0];

      if (this.input.ownerDocument !== document) {
        return null;
      }

      document.body.appendChild(this.icon);
      this.icon.addEventListener("click", onStmIconClick);
      this.anchor.style.position = "relative";
      this.anchor.style.overflow = "visible";
      this.anchor.append(this.icon);
      this.icon.classList.remove("stm-hidden");
      this.icon.disabled = false;
    }

    setInput(text) {
      console.log(`SpeakToMeIcon setInput: ${text}`);
      this.input.value = text;
      this.input.focus();
      this.input.form.submit();
    }
  }

  const listener = (msg) => {
    switch (msg.state) {
      case "ready": {
        listening = false;
        break;
      }
      case "error": {
        listening = false;
        console.error(msg.error);
        failGracefully(msg.error.toString());
        break;
      }
      case "listening": {
        const stream = stm.getmediaStream();
        if (!stream) {
          return;
        }

        // Build the WebAudio graph we'll be using
        audioContext = new AudioContext();
        sourceNode = audioContext.createMediaStreamSource(stream);
        analyzerNode = audioContext.createAnalyser();
        outputNode = audioContext.createMediaStreamDestination();

        // make sure we're doing mono everywhere
        sourceNode.channelCount = 1;
        analyzerNode.channelCount = 1;
        outputNode.channelCount = 1;

        // connect the nodes together
        sourceNode.connect(analyzerNode);
        analyzerNode.connect(outputNode);

        SpeakToMePopup.waitForStop().then(
          () => {
            stm.stop();
          },
          () => {
            stm.stop();
            SpeakToMePopup.closeClicked = true;
            metrics.end_session();
            SpeakToMePopup.hide();
          }
        );

        document.getElementById("stm-levels").hidden = false;
        visualize(analyzerNode);

        metrics.start_attempt();
        metrics.start_recording();

        const copy = document.getElementById("stm-content");
        loadAnimation(SPINNING_ANIMATION, true);
        copy.innerHTML = `<div id="stm-listening-text">Listening...</div>`;
        break;
      }
      case "processing": {
        analyzerNode.disconnect(outputNode);
        sourceNode.disconnect(analyzerNode);
        audioContext.close();

        const copy = document.getElementById("stm-content");
        copy.innerHTML = `<div id="stm-listening-text">Processing...</div>`;
        loadAnimation(DONE_ANIMATION, false);
        break;
      }
      case "result": {
        metrics.stop_recording();

        // We stopped the recording, send the content to the STT server.
        audioContext = null;
        sourceNode = null;
        analyzerNode = null;
        outputNode = null;

        document.getElementById("stm-levels").hidden = true;

        // handle clicking on close element by dumping recording data
        if (SpeakToMePopup.closeClicked) {
          SpeakToMePopup.closeClicked = false;
          return;
        }

        if (SpeakToMePopup.cancelFetch) {
          SpeakToMePopup.cancelFetch = false;
          return;
        }

        if (LOCAL_TEST) {
          const json = {
            data: [
              {
                confidence: 0.807493,
                text: "PLEASE ADD MILK TO MY SHOPPING LIST",
              },
              {
                confidence: 0.906263,
                text: "PLEASE AT MILK TO MY SHOPPING LIST",
              },
              {
                confidence: 0.904414,
                text: "PLEASE ET MILK TO MY SHOPPING LIST",
              },
            ],
          };

          displayOptions(json.data);
          return;
        }

        console.log(`Got STT result: ${JSON.stringify(msg)}`);
        const container = document.getElementById("stm-box");
        container.classList.add("stm-done-animation");
        setTimeout(() => {
          displayOptions(msg.data);
        }, 500);
        break;
      }
    }
  };

  // Helper for animation startup
  const stmInit = () => {
    loadAnimation(START_ANIMATION, false, "stm-start-animation");

    if (listening) {
      stm.stop();
      listening = false;
    }

    stm.listen();
    listening = true;
  };

  // Click handler for stm icon
  const onStmIconClick = (event) => {
    if (event.explicitOriginalTarget !== event.currentTarget) {
      return;
    }
    if (SpeakToMePopup.cancelFetch) {
      SpeakToMePopup.cancelFetch = false;
    }
    const type = event.detail ? "button" : "keyboard";
    event.preventDefault();
    metrics.start_session(type);
    event.target.classList.add("stm-hidden");
    SpeakToMePopup.showAt(event.clientX, event.clientY);
    stmInit();
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

    const popupWidth = document.getElementById("stm-popup").offsetWidth;

    const levels = document.getElementById("stm-levels");
    const xPos =
      popupWidth < levels.offsetWidth
        ? popupWidth * 0.5 - 22
        : levels.offsetWidth * 0.5;
    const yPos = levels.offsetHeight * 0.5;
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
      const diameter =
        ((levels.height * (value - MIN_DB_LEVEL)) / dbRange) * 10;
      if (diameter < 0) {
        continue;
      }
      // Display a bar for this value.
      let alpha = diameter / 500;
      if (alpha > 0.2) alpha = 0.2;
      else if (alpha < 0.1) alpha = 0.1;

      context.lineWidth = alpha * alpha * 150;
      context.globalAlpha = alpha * alpha * 5;
      context.beginPath();
      context.ellipse(xPos, yPos, diameter, diameter, 0, 0, 2 * Math.PI);
      if (diameter > 90 && diameter < 360) context.stroke();
    }
    // Update the visualization the next time we can
    requestAnimationFrame(function() {
      visualize(analyzerNode);
    });
  };

  // Helper to handle bodymobin
  const loadAnimation = (animationType, loop, className) => {
    const container = document.getElementById("stm-box");
    container.className = "";
    if (className) {
      container.classList.add(className);
    }
    if (bodymovin) {
      bodymovin.destroy();
    }
    bodymovin.loadAnimation({
      container,
      loop,
      renderer: "svg",
      autoplay: true,
      path: animationType, // the path to the animation json
    });
  };

  const displayOptions = (items) => {
    // Filter the array for empty items and normalize the text.
    const data = items
      .filter((item) => {
        return item.text !== "";
      })
      .map((item) => {
        return {
          confidence: item.confidence,
          text: item.text.toLowerCase(),
        };
      });

    if (data.length === 0) {
      failGracefully("EMPTYRESULTS");
      return;
    }

    const validateResults = function(data) {
      if (data.length === 1) {
        return true;
      }

      const val0 = String(data[0].confidence).substring(0, 4);
      const val1 = String(data[1].confidence).substring(0, 4);

      if (val0 - val1 > 0.2) {
        return true;
      }
      return false;
    };

    // if the first result has a high enough confidence, or the distance
    // to the second large enough just
    // use it directly.
    data.sort(function(a, b) {
      return b.confidence - a.confidence;
    });
    if (validateResults(data)) {
      metrics.end_attempt(data[0].confidence, "default accepted", 0);
      metrics.end_session();
      stmIcon.setInput(data[0].text);
      SpeakToMePopup.hide();
      return;
    }

    metrics.set_options_displayed();
    SpeakToMePopup.chooseItem(data).then(
      (input) => {
        metrics.end_attempt(input.confidence, "accepted", input.idx_suggestion);
        metrics.end_session();
        stmIcon.setInput(input.value);
        // Once a choice is made, close the popup.
        SpeakToMePopup.hide();
      },
      (id) => {
        if (id === "stm-reset-button") {
          metrics.end_attempt(-1, "reset", -1);
          SpeakToMePopup.reset();
          stmInit();
        } else {
          metrics.end_attempt(-1, "rejected", -1);
          metrics.end_session();
          SpeakToMePopup.hide();
        }
      }
    );
  };

  const stmIcon = new SpeakToMeIcon();
  SpeakToMePopup.init();

  const failGracefully = (errorMsg) => {
    if (errorMsg.indexOf("GUM") === 0) {
      errorMsg = "Please enable your microphone to use Voice Fill";
    } else if (errorMsg.indexOf("EMPTYRESULTS") === 0) {
      errorMsg = "No results found";
    } else {
      errorMsg = "Sorry, we encountered an error";
    }
    loadAnimation(ERROR_ANIMATION, false);
    const copy = document.getElementById("stm-content");
    copy.innerHTML = '<div id="stm-listening-text"></div>';
    const errorDiv = document.getElementById("stm-listening-text");
    errorDiv.textContent = errorMsg;
    setTimeout(() => {
      SpeakToMePopup.hide();
    }, 1500);
    console.log("ERROR: ", errorMsg);
  };
})();
