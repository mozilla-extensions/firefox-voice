# Firefox Voice architecture

As of April 28th 2020, this is a description of how Firefox Voice works and is laid out.

## Large components

There's a couple different things in the repository. Most of this document is about the Firefox Voice extension.

### Firefox Voice extension

The extension is a WebExtension written for Firefox. The code is all in `extension/`

It can potentially be run in mobile Firefox, but a lot of it doesn't make sense or isn't fully functional. Technically while many APIs exist, background tabs, popups, getUserMedia, and other details make the experience hard to translate.

### Android application

There is an Android application, written in Kotlin, in `android-app/`.

This application acts as a replacement for the system assistant on Android phones.

## Homepage

The public homepage is in `homepage/` and has its own `package.json` and `npm run ...` commands.

It produces static files that are written to the `gh-pages` branch, which publishes them to https://mozilla.github.io/firefox-voice/homepage/

The "real" public URL is https://voice.mozilla.org/firefox-voice/ which simply proxies the github.io pages.

# The extension

## Build & dependencies

`package.json` contains most of our dependencies, though everything is built statically into `extension/`. The live product doesn't use Node at all, but we do make the distinction that the `dependencies` section contains code that is copied into the extension, while `devDependencies` is for libraries we use in development, building, and packaging.

Scripts in `bin/` are all for the purpose of building, but most of them are run with `npm run`, which may also setup environmental variables, or run appropriate dependencies before the script.

`.jsx` files are generally build into a `.js` file directly alongside the jsx file, and we ignore the original .js file with `.gitignore`

### Code conventions

## Extension processes

The extension has a couple separate "processes" (different pages, or runtime environments):

- The background page (starting in `extension/background/main.js`) runs the show. It is responsible for starting things up, doing basic lifecycle operations, any canonical information storage, and managing the actual intent system.
- The popup (starting in `extension/popup/popupController.jsx`) is another page that manages the microphone and user input. When launched it almost always listens immediately for input (an exception is when opened for a timer). It mostly doesn't _do_ things, but asks the background page to do things, and the background page asks the popup to display things.
- The wakeword page (starting in `extension/wakeword/wakewordController.jsx`) runs in its own tab and listens for the wakeword. For the wakeword the microphone is always open, and the tab must be open to listen. Note this is not currently functional.
- The recorder page (starting in `extension/recorder/recorder.js`) is a largely-deprecated feature where a tab would stay open to listen to the microphone, due to problems using the microphone in the popup. This tab acts like a shim. In the most recent versions of Firefox it is not necessary.
- Content scripts. When an intent has to interact directly with a page, a content script is injected into that page. These are a variety of scripts in `extension/intents/*/*.js` (there is no specific pattern for naming them). There are support scripts for content scripts in `extension/content/`
- Miscellaneous content pages, such as options (`extension/options`), onboarding (`extension/onboarding`) and a couple pages in `extension/views/`
- The "WebExtension experiments", which are high-privileged pieces of code that run in Firefox's main process (in `extension/experiments/voice/`).

### Communication

Communication is primary done using [browser.runtime.sendMessage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage) and [browser.runtime.onMessage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage).

Messages that are sent to a content script are send directly to only that tab using [browser.tabs.sendMessage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage) but all other messages are send "globally". So a message from the background page to the popup may also be received by an options page. To manage these we return `null` in contexts where the message is not understood and not handled, and only return a value (as a Promise) when it is properly handled in an onMessage listener.

Messages are always JSON objects, and always have a `.type` property, such as `{type: "getExamples"}`.

Most of the background messages are handled in `main.js` (which calls out to any other modules that are needed), but look for `registerHandler()` for other message handlers. The `*Controller.jsx` scripts typically handle their own messages.

## Code layout

```
├── assets
│   ├── alarm.mp3               The timer alarm
│   ├── chime.ogg               Popup notification we are listening
│   ├── css
│   │   ├── font-files/         All the fonts we use
│   │   ├── gui.css             Globally-applicable styles
│   │   ├── inter.css           Loads the font files
│   │   └── layout.css          Basic layout for content pages
│   └── images
│       ├── favicons/           Our logo icons
│       ├── firefox-voice-logo.svg   Full page logo
│       ├── icon-48/96.png      browserAction icon
├── background                  All these scripts run in the background page
│   ├── content.js              Loads content scripts
│   ├── entityTypes.js          Typed slots, such as [service:musicService]
│   ├── intentExamples.js       Returns examples collected from the intents
│   ├── intentImport.js         Generated file that imports all the intent modules
│   ├── intentImport.js.ejs     Template for intentImport.js (generated by bin/parse-intent-toml.js)
│   ├── intentParser.js         Takes an utterance (string) and figures out which intent matches it
│   ├── intentRunner.js         Runs the intents and provides a context for the intents to run in. IMPORTANT
│   ├── language                Modules that parse utterances
│   │   ├── compiler.js         Compiles our match strings into the matches implemented in textMatching.js
│   │   ├── general.test.js     Some tests of the parser
│   │   ├── langs               Natural-language specific information
│   │   │   ├── english.js      Generated from english.toml (by bin/parse-intent-toml.js)
│   │   │   ├── english.toml    List of aliases and stopwords in English
│   │   │   └── lang.js         List of languages and their codes
│   │   ├── findMatch.js         Given multiple intents that match an utterance, this prioritizes them to a single match
│   │   └── textMatching.js     All the basic text matching classes
│   ├── languages.js            Mapping of the English name of a language to its language code (for use in translation intents, "translate to Spanish")
│   ├── loadMain.js             Very small script to launch the ECMA modules in the background page
│   ├── main.js                 Main script for the background page. IMPORTANT
│   ├── musicService.js         Abstract base class for music services
│   ├── pageMetadata-contentScript.js  Content script for getting metadata from a page
│   ├── pageMetadata.js         Background script that gets metadata (using that content script)
│   ├── serviceImport.js        Generated file that imports all service modules
│   ├── serviceImport.js.ejs    Template for serviceImport.js (generated by bin/parse-intent-toml.js)
│   ├── serviceList.js          Abstract base class for services, and also detects which service to use (based on tab, history, prefs, etc)
│   ├── telemetry.js            Collects and submits telemetry to Mozilla Telemetry
│   └── voiceSchema.js          Schema for telemetry
├── browserUtil.js              Basic functions that enhance browser.*. IMPORTANT
├── buildSettings.js            Generated file (not a module) that defines build constants
├── buildSettings.js.ejs        Template for buildSettings.js (generated by bin/substitute-manifest.js)
├── catcher.js                  Helps catch errors and submit them to Sentry
├── catcherAsyncSetup.js        Helps setup Sentry (synchronously) when other modules are loaded async
├── content                     Helpers to setup and communicate with content scripts (used by background/content.js)
│   ├── communicate.js          Content script that dispatches messages and allows messages to be registered
│   ├── helpers.js              Content script with helpers for common page interaction issues
│   └── responder.js            Last content script to be loaded, that signals the content scripts are loaded
├── experiments                 WebExperiment code (privileged Firefox code)
│   └── voice
│       ├── api.js              Actual code: open popups, do some commands that are in the UI but have no WebExtension APIs
│       └── schema.json         Schema for api.js
├── history.js                  Saves history in a database (no UI)
├── intents                     All the individual intents
│   ├── aboutPage               Intents to learn about this page (see comments elsewhere on the page)
│   ├── bookmarks               Intents to open, save, and remove bookmarks
│   ├── browser                 Open browser UI (Library, etc)
│   ├── clipboard               Copy things, and pasting
│   ├── find                    Find tabs
│   ├── forms                   Interact with forms
│   ├── metadata.js             Generated file (from intents/*/*.toml) with information on all the intents (generated by bin/parse-intent-toml.js)
│   ├── music                   Interact with music services (play, pause, search, etc)
│   ├── muting                  Mute and unmute tabs
│   ├── navigation              Go to sites and follow links
│   ├── routines               Shortcuts and routines
│   ├── notes                   Add notes to a background tab
│   ├── phrases.test.js         Tests that phrases match as expected
│   ├── pocket                  Save to pocket
│   ├── print                   Printing
│   ├── read                    Go into reader mode and narrate
│   ├── saving                  Save files and screenshots
│   ├── scroll                  Scroll the page
│   ├── search                  Searching
│   ├── self                    Things that open or interact with Firefox Voice itself
│   ├── sidebar                 Open different sidebars
│   ├── slideshow               Make a slideshow of a page
│   ├── speech                  Say things back
│   ├── tabs                    Interact with tabs (open, close, move, collect)
│   ├── timer                   The timer
│   └── window                  Manage windows (open, close, split into window)
├── js
│   ├── languages.json          Language mapping
│   └── vendor
│       ├── chrono.min.js       Parser for natural language times
│       ├── freezeDry.js        Freezes a page into static HTML
│       ├── fuse.js             Fuzzy full text search
│       ├── lottie.min.js       Animation library
│       ├── react-dom.production.min.js  React
│       ├── react.production.min.js      React
│       ├── sentry.js           Exception catcher
│       ├── webrtc_vad.js       Microphone silence detection
│       └── webrtc_vad.wasm     WASM for above
├── limiter.js                  Generic code to limit error messages or user feedback
├── log.js                      Logging (not a module). Widely used
├── manifest.json               Manifest file, generated
├── manifest.json.ejs           File that generates manifest (by bin/substitute-manifest.js)
├── onboarding/                 Onboarding page
├── options/                    Options/settings page
│   ├── history/                Shows the history table
├── popup/                      The popup that the user inteacts with
│   ├── animations/             Lottie animation
│   ├── images/
│   ├── popup.css
│   ├── popup.html              No UI, but it does load scripts/modules
│   ├── popupController.js      Generated from popupController.jsx
│   ├── popupController.jsx     The controller that handles communication and logic. IMPORTANT
│   ├── popupView.js            Generated from popupView.jsx
│   ├── popupView.jsx           The UI for the popup
│   ├── vad.js                  Manages media and silence detection
│   ├── voice.js                Manages microphone and media lifecycle
│   └── voiceShim.js            Shim replacement for voice.js, when using recorder tab
├── recorder/                   Used when moving microphone into standalone tab, and wakeword
├── searching.js                Generates some basic search query URLs
├── services                    These are wrappers for specific third-party services
│   ├── deezer                  Deezer music service
│   ├── metadata.js             Generated metadata from .toml files (by bin/parse-intent-toml.js)
│   ├── readerMode              Treat Reader Mode narration as a music service
│   ├── searchServices.toml     Mapping of service names to their search codes (e.g., "Amazon" to amazon.com)
│   ├── soundcloud              SoundCloud music service
│   ├── spotify                 Spotify music service
│   └── youtube                 YouTube, acts like a pseudo-music service
├── settings.js                 Manages Firefox Voice settings (loading, communicating)
├── tests/                      Internal development testing
├── util.js                     Some generic routines, mostly Promise-related
├── views/                      Some pages: changelog, lexicon, privacy policy
└── wakeword/                   Wakeword tab (not currently functional)
```
