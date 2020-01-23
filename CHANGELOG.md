## Version 0.19.0 (2020-01-23)

- Detect and report mics with zero volume. We've received many reports of people for whom the extension doesn't seem to hear anything, and this is an attempt to give instructions in this case. This always gets reported to Sentry, so we can track why this happens (we don't understand yet). It also only happens when the user hasn't yet had a successful spoken intent. Fixes [#889](https://github.com/mozilla/firefox-voice/issues/889) [829ca5f](https://github.com/mozilla/firefox-voice/commit/829ca5f)
- Matching "play" alone (not just "play music") [0b71cc4](https://github.com/mozilla/firefox-voice/commit/0b71cc4) (thanks [maitrella](https://github.com/maitrella))
- Enable Android search (fix issue #895) [58ee08b](https://github.com/mozilla/firefox-voice/commit/58ee08b)
- Remove TLDs from lucky searches. For unknown reasons, Google refuses to do an I'm Lucky search when the search term is a domain name. Fixes [#849](https://github.com/mozilla/firefox-voice/issues/849) [38cb317](https://github.com/mozilla/firefox-voice/commit/38cb317)
- Improve scoring to avoid substitutions. Some substitutions (e.g., "website" to "site") were being preferred because they decreased the slot characters, which does not really count as being a better match.
  Also individual word substitutions were entirely broken, and only simultaneously doing all substitutions was working.
  Fix a few errors in intent descriptions, some bad example names, and some incorrect intent names. Fixes [#878](https://github.com/mozilla/firefox-voice/issues/878) [9137ba9](https://github.com/mozilla/firefox-voice/commit/9137ba9)
- Only show Listening when actually listening. This attempts to handle a couple timing cases. It's unclear if any of them besides a new 'waiting' state actually matters. Fixes [#886](https://github.com/mozilla/firefox-voice/issues/886) [ea45efd](https://github.com/mozilla/firefox-voice/commit/ea45efd)
- Submit negative feedback after pressing Enter ([#884](https://github.com/mozilla/firefox-voice/issues/884)) (thanks [abahmed](https://github.com/abahmed))
- Message when pasting into about:newtab ([#874](https://github.com/mozilla/firefox-voice/issues/874)) [5d7c7f6](https://github.com/mozilla/firefox-voice/commit/5d7c7f6)
- Delete open intent and update show intent with "open" command. [6afa143](https://github.com/mozilla/firefox-voice/commit/6afa143)
- Add intents for handling downloaded items (e.g., "show download") [ce3f7c7](https://github.com/mozilla/firefox-voice/commit/ce3f7c7) (thanks [maitrella](https://github.com/maitrella))
- Add scroll commands [aae9018](https://github.com/mozilla/firefox-voice/commit/aae9018) (thanks [espertus](https://github.com/espertus))
- Show a special message if mic is missing. Fixes [#711](https://github.com/mozilla/firefox-voice/issues/711) [707d64f](https://github.com/mozilla/firefox-voice/commit/707d64f)
- Ignore speaktome 500 errors [c735474](https://github.com/mozilla/firefox-voice/commit/c735474)
- Search, open and read page: "read me [query]" ([#824](https://github.com/mozilla/firefox-voice/issues/824)) [2b79eff](https://github.com/mozilla/firefox-voice/commit/2b79eff) (thanks [maitrella](https://github.com/maitrella))

## Version 0.18.0 (2020-01-13)

This quick release fixes some errors we've had with collecting stats.

- Log Telemetry errors with Sentry [da902aa](https://github.com/mozilla/firefox-voice/commit/da902aa)
- Fix Telemetry schema errors. This makes sure firstInstallationTimestamp and extensionTemporaryInstall are always set. Fixes [#848](https://github.com/mozilla/firefox-voice/issues/848) [408175f](https://github.com/mozilla/firefox-voice/commit/408175f)
- Always set feedback to a string in Telemetry pingA null is not allowed. This was causing all positive ratings to be lost. Fixes [#820](https://github.com/mozilla/firefox-voice/issues/820) [94db917](https://github.com/mozilla/firefox-voice/commit/94db917)

## Version 0.17.0 (2020-01-13)

- Use the default search provider for explicit searches. Note this doesn't affect fallback searches. Fixes [#826](https://github.com/mozilla/firefox-voice/issues/826) [10672d1](https://github.com/mozilla/firefox-voice/commit/10672d1)
- Hide Google search tab. Fixes [#504](https://github.com/mozilla/firefox-voice/issues/504) [d5cc0ce](https://github.com/mozilla/firefox-voice/commit/d5cc0ce)
- Add a `browserUtil.turnOnReaderMode` function. This checks if the page is already in reader mode, and doesn't toggle it if it is, and then it also waits to resolve until the page has actually been put into reader mode, instead of returning immediately as toggleReaderMode does. [ea99024](https://github.com/mozilla/firefox-voice/commit/ea99024)
- "Current tab" an alias for "tab" [1265a0c](https://github.com/mozilla/firefox-voice/commit/1265a0c)
- `Save page as [name]` intent ([#822](https://github.com/mozilla/firefox-voice/issues/822))\* Save page as [name] intent [dd62540](https://github.com/mozilla/firefox-voice/commit/dd62540)
- Reduce loading of onboarding, lexicon, and privacy pages. ([#815](https://github.com/mozilla/firefox-voice/issues/815))
  - Prevent onboarding page from being opened multiple times. This removes redundant opens in onboard.html, options.html [b90e08e](https://github.com/mozilla/firefox-voice/commit/b90e08e) [d28c60d](https://github.com/mozilla/firefox-voice/commit/d28c60d)

### Android

We are starting to work on getting this working in Firefox on Android (_not_ Firefox Preview, as add-on support there is still in development):

- Switch to search tab on Android ([#830](https://github.com/mozilla/firefox-voice/issues/830)) [53b5e93](https://github.com/mozilla/firefox-voice/commit/53b5e93)
- Fix Google redirect on Android. The Android extension API doesn't support the tabId specifier on browser.tabs.onUpdated [6039bce](https://github.com/mozilla/firefox-voice/commit/6039bce)
- Add `npm run start-android`, plus some instructions. Remove incognito option on Android, where it is not supported [9252a21](https://github.com/mozilla/firefox-voice/commit/9252a21) [5069d73](https://github.com/mozilla/firefox-voice/commit/5069d73)

## Version 0.16.0 (2019-12-18)

- Thanks [maitrella](https://github.com/maitrella):
  - New intent: **go to homepage** [2001b12](https://github.com/mozilla/firefox-voice/commit/2001b12)
  - New intents: **zoom in, out, reset** [4cdad67](https://github.com/mozilla/firefox-voice/commit/4cdad67) [415b873](https://github.com/mozilla/firefox-voice/commit/415b873)
  - Add "switch to" phrase to find intent [a764058](https://github.com/mozilla/firefox-voice/commit/a764058)
  - Add "launch" to new tab/window intent [6708570](https://github.com/mozilla/firefox-voice/commit/6708570)
- Add more phrases for the read intent [f12e504](https://github.com/mozilla/firefox-voice/commit/f12e504) (thanks [vanekcsi](https://github.com/vanekcsi))
- Exclude ads from search result list. Fixes [#810](https://github.com/mozilla/firefox-voice/issues/810) [0ecfa8e](https://github.com/mozilla/firefox-voice/commit/0ecfa8e)
- Put cursor at end of text input. Fixes regression [#774](https://github.com/mozilla/firefox-voice/issues/774) [4f52a15](https://github.com/mozilla/firefox-voice/commit/4f52a15)
- Make 'open' focus existing tabs. Fixes [#784](https://github.com/mozilla/firefox-voice/issues/784) [52b04c9](https://github.com/mozilla/firefox-voice/commit/52b04c9)
- Cache 'open [query]' intents. Fixes [#780](https://github.com/mozilla/firefox-voice/issues/780) [0a03a23](https://github.com/mozilla/firefox-voice/commit/0a03a23)
- New intent: **save page**. Fixes [#714](https://github.com/mozilla/firefox-voice/issues/714) [ec71bbe](https://github.com/mozilla/firefox-voice/commit/ec71bbe)
- New intent: **paste**. Fixes [#741](https://github.com/mozilla/firefox-voice/issues/741) [9d86c02](https://github.com/mozilla/firefox-voice/commit/9d86c02)
- New intents: **copy link, rich link, title, markdown link, screenshot, full page screenshot** Fixes [#77](https://github.com/mozilla/firefox-voice/issues/77) [a994d09](https://github.com/mozilla/firefox-voice/commit/a994d09)
- Added experimental nickname feature. Give your previous command a name with **name that [nickname]** or **name last two [nickname]** (and **remove name [name]**) [bc2b861](https://github.com/mozilla/firefox-voice/commit/bc2b861)

## Version 0.15.0 (2019-12-13)

- New intents:
  - Thanks [maitrella](https://github.com/maitrella) for several new intents:
    - Duplicate current tab intent [0dad8d9](https://github.com/mozilla/firefox-voice/commit/0dad8d9) (thanks
    - Move tab to a new window intent [4f0b384](https://github.com/mozilla/firefox-voice/commit/4f0b384)
    - Previous search intent ([#721](https://github.com/mozilla/firefox-voice/issues/721)) [ebb0a3c](https://github.com/mozilla/firefox-voice/commit/ebb0a3c)
    - Open new window intent [affaf60](https://github.com/mozilla/firefox-voice/commit/affaf60)
    - Reload page intent [f0f5a6a](https://github.com/mozilla/firefox-voice/commit/f0f5a6a)
  - Make 'search' launch a search page. Fixes [#740](https://github.com/mozilla/firefox-voice/issues/740) [375dda3](https://github.com/mozilla/firefox-voice/commit/375dda3)
  - Make 'open ...' go directly to a page. Fixes [#742](https://github.com/mozilla/firefox-voice/issues/742) [564a73a](https://github.com/mozilla/firefox-voice/commit/564a73a)
- Intent parsing improvements:
  - Add more phrase substitutions. Fixes [#757](https://github.com/mozilla/firefox-voice/issues/757) [7d0562f](https://github.com/mozilla/firefox-voice/commit/7d0562f)
  - Do fuzzier intent parsing. This does substitutions of the incoming text and then tries different matches. Fixes [#657](https://github.com/mozilla/firefox-voice/issues/657) [766c8a2](https://github.com/mozilla/firefox-voice/commit/766c8a2)
- Style improvements (thanks [jenniferharmon](https://github.com/jenniferharmon))
  - Adjusts search content height for taller footer. Changes font-weights from 'bold' to number value. [8fd4015](https://github.com/mozilla/firefox-voice/commit/8fd4015)
  - Updates font styles and padding for feedback prompt [b07f40c](https://github.com/mozilla/firefox-voice/commit/b07f40c)
  - Fixes type input styling [#323](https://github.com/mozilla/firefox-voice/issues/323) [ea61165](https://github.com/mozilla/firefox-voice/commit/ea61165)
  - Fixes doorhanger issues for zap success animation, close button, and ease-in suggestions. [0505f30](https://github.com/mozilla/firefox-voice/commit/0505f30)
  - Hides the zap animation after a successful search. [8163c99](https://github.com/mozilla/firefox-voice/commit/8163c99)
  - Styles the negative feedback view. [bdf045e](https://github.com/mozilla/firefox-voice/commit/bdf045e)
  - Improves keyboard config styling. [0168cac](https://github.com/mozilla/firefox-voice/commit/0168cac)
  - Styles privacy page. Creates reusable templates for header and footer. Adds global layout stylesheet. [e6dc1b7](https://github.com/mozilla/firefox-voice/commit/e6dc1b7)
- Other changes:
  - Don't use 'See results about' cards. Fixes [#739](https://github.com/mozilla/firefox-voice/issues/739) [44af306](https://github.com/mozilla/firefox-voice/commit/44af306)
  - Moves feedback prompt to search result footer [5fab05c](https://github.com/mozilla/firefox-voice/commit/5fab05c)
  - Uses one state for userSettings in optionsController [0429599](https://github.com/mozilla/firefox-voice/commit/0429599)
  - Use dev icon in local development and dev version of XPI. Fixes [#484](https://github.com/mozilla/firefox-voice/issues/484) [5f9d085](https://github.com/mozilla/firefox-voice/commit/5f9d085)
  - Shows minimized or expanded listening view based on voice interaction and number of visits [5e19e82](https://github.com/mozilla/firefox-voice/commit/5e19e82)
  - Fixes hover state for sad and happy icons. Allows users to omit a text input for negative feedback. [69bb921](https://github.com/mozilla/firefox-voice/commit/69bb921)
  - Make 'next' work when search tab has been closed. Fixes [#699](https://github.com/mozilla/firefox-voice/issues/699) [83c4130](https://github.com/mozilla/firefox-voice/commit/83c4130)
  - Filter out ads from card capturing. Fixes [#685](https://github.com/mozilla/firefox-voice/issues/685) [7a8d024](https://github.com/mozilla/firefox-voice/commit/7a8d024)

## Version 0.14.0 (2019-12-06)

- Make 'next' do the next search item. Fixes [#680](https://github.com/mozilla/firefox-voice/issues/680) [c51321f](https://github.com/mozilla/firefox-voice/commit/c51321f)
- Update mic icon. Fixes [#677](https://github.com/mozilla/firefox-voice/issues/677) [7fbee60](https://github.com/mozilla/firefox-voice/commit/7fbee60) [4c1cccf](https://github.com/mozilla/firefox-voice/commit/4c1cccf)
- Various small style updates:
  - Adds hover state to text input 'Go' button. [c252a96](https://github.com/mozilla/firefox-voice/commit/c252a96)
  - Aligns opt-in modal buttons horizontally so "Don't Allow" isn't hidden below the page threshold. [3327307](https://github.com/mozilla/firefox-voice/commit/3327307)
  - Fixes layout bug with voice command list on onboarding page. [61a3ae7](https://github.com/mozilla/firefox-voice/commit/61a3ae7)
  - Adds toolbar arrow to onboarding page. [155804d](https://github.com/mozilla/firefox-voice/commit/155804d)
  - Adds cursor:pointer to popup icon buttons. [ee1fff2](https://github.com/mozilla/firefox-voice/commit/ee1fff2)
  - Adds hover state to popup icon buttons [c429a17](https://github.com/mozilla/firefox-voice/commit/c429a17)
  - Formats and fixes lint errors. [4b98c22](https://github.com/mozilla/firefox-voice/commit/4b98c22)
  - Fixes layout and icons for popup feedback widget. [6369b9b](https://github.com/mozilla/firefox-voice/commit/6369b9b)

## Version 0.13.0 (2019-12-05)

- Open a form when uninstalling. Fixes [#141](https://github.com/mozilla/firefox-voice/issues/141) [56fca20](https://github.com/mozilla/firefox-voice/commit/56fca20)
- Indicate the difference between a fatal mic error and a temp one. Fixes [#658](https://github.com/mozilla/firefox-voice/issues/658) [11aeb29](https://github.com/mozilla/firefox-voice/commit/11aeb29)
- Make keyboard shortcut configurable. Fixes [#560](https://github.com/mozilla/firefox-voice/issues/560) [10b025b](https://github.com/mozilla/firefox-voice/commit/10b025b)
- Onboarding redesign [9c87754](https://github.com/mozilla/firefox-voice/commit/9c87754) [0fafe9b](https://github.com/mozilla/firefox-voice/commit/0fafe9b) [b90e5d7](https://github.com/mozilla/firefox-voice/commit/b90e5d7) [d74b60e](https://github.com/mozilla/firefox-voice/commit/d74b60e)
- Fix excessive whitespace in popup. Adds minor styling for intent feedback. [5f92e33](https://github.com/mozilla/firefox-voice/commit/5f92e33)
- Use point releases in local dev. Fixes [#659](https://github.com/mozilla/firefox-voice/issues/659) [9c311b4](https://github.com/mozilla/firefox-voice/commit/9c311b4)
- Replace chime sound. Fixes [#51](https://github.com/mozilla/firefox-voice/issues/51) [873005c](https://github.com/mozilla/firefox-voice/commit/873005c)
- Force user to answer opt-in question. Fixes [#653](https://github.com/mozilla/firefox-voice/issues/653) [cf034eb](https://github.com/mozilla/firefox-voice/commit/cf034eb)
- Removes footer with links from search result view. Adds black banner at bottom with next result info. Improves search result layout and popup resizing. [688ddbb](https://github.com/mozilla/firefox-voice/commit/688ddbb)
- Improve language translation intents. [1dd0d11](https://github.com/mozilla/firefox-voice/commit/1dd0d11) [bd9445b](https://github.com/mozilla/firefox-voice/commit/bd9445b) Fixes [#623](https://github.com/mozilla/firefox-voice/issues/623) [33cc084](https://github.com/mozilla/firefox-voice/commit/33cc084)
- Back button on feedbacks [7b8a463](https://github.com/mozilla/firefox-voice/commit/7b8a463)
- Remove "for internal use only" [5234e73](https://github.com/mozilla/firefox-voice/commit/5234e73)
- Refactors Onboading view to use React. Updates some onboarding content based on new mockups. [d4b1a6a](https://github.com/mozilla/firefox-voice/commit/d4b1a6a)
- Move privacy policy into repository. Fixes [#627](https://github.com/mozilla/firefox-voice/issues/627) [07f0554](https://github.com/mozilla/firefox-voice/commit/07f0554)
- Add "Save as pdf" intent [#616](https://github.com/mozilla/firefox-voice/issues/616) ([#622](https://github.com/mozilla/firefox-voice/issues/622)) [5e1fe0a](https://github.com/mozilla/firefox-voice/commit/5e1fe0a) [0e3c1bb](https://github.com/mozilla/firefox-voice/commit/0e3c1bb)
- Publish lexicon to web. Fixes [#570](https://github.com/mozilla/firefox-voice/issues/570) [169ca60](https://github.com/mozilla/firefox-voice/commit/169ca60)
- Add Telemetry document. Fixes [#199](https://github.com/mozilla/firefox-voice/issues/199) [a75b5f4](https://github.com/mozilla/firefox-voice/commit/a75b5f4)
- "Back" button is not available in "Type Input" mode [#579](https://github.com/mozilla/firefox-voice/issues/579) [a47d1ae](https://github.com/mozilla/firefox-voice/commit/a47d1ae)
- Increase initial silence timeout to 15 seconds. Relates to [#356](https://github.com/mozilla/firefox-voice/issues/356) [8f37b8e](https://github.com/mozilla/firefox-voice/commit/8f37b8e)
- Update lexicon.html.ejs. Added pin tab example to lexicon [8bf4696](https://github.com/mozilla/firefox-voice/commit/8bf4696)
- [browser command] Add pin/unpin tab intents [#73](https://github.com/mozilla/firefox-voice/issues/73) [945ec99](https://github.com/mozilla/firefox-voice/commit/945ec99)
- Use innerText for card image alt. Fixes [#581](https://github.com/mozilla/firefox-voice/issues/581) [23c1153](https://github.com/mozilla/firefox-voice/commit/23c1153)
- Update the card for a second always. This way if the card takes a little while to update, we'll get the updated version instead of the version when the search first loaded. Also detect timers and update the card constantly for them. Fixes [#601](https://github.com/mozilla/firefox-voice/issues/601) Fixes [#586](https://github.com/mozilla/firefox-voice/issues/586) [5abeccf](https://github.com/mozilla/firefox-voice/commit/5abeccf)
- Ignore the current tab and special search tab. Fixes [#167](https://github.com/mozilla/firefox-voice/issues/167) [fed5d5f](https://github.com/mozilla/firefox-voice/commit/fed5d5f)
- Use empty active tab instead of creating a new tab. Fixes [#423](https://github.com/mozilla/firefox-voice/issues/423) [17df0cd](https://github.com/mozilla/firefox-voice/commit/17df0cd)
- "Tell me a joke" intent [#511](https://github.com/mozilla/firefox-voice/issues/511) [5dae179](https://github.com/mozilla/firefox-voice/commit/5dae179)
- Added translation into different languages. Fixes [#403](https://github.com/mozilla/firefox-voice/issues/403) [467abf7](https://github.com/mozilla/firefox-voice/commit/467abf7)
- add opt-in audio collection. Fixes [#584](https://github.com/mozilla/firefox-voice/issues/584) [3badc2f](https://github.com/mozilla/firefox-voice/commit/3badc2f) Also [#595](https://github.com/mozilla/firefox-voice/issues/595) [0fe1437](https://github.com/mozilla/firefox-voice/commit/0fe1437) [c947e8c](https://github.com/mozilla/firefox-voice/commit/c947e8c)
- Add feedback UI. This lets users submit feedback on the previous intent. Fixes [#316](https://github.com/mozilla/firefox-voice/issues/316) [77b0be3](https://github.com/mozilla/firefox-voice/commit/77b0be3)
- Track when a card is displayed. Fixes [#543](https://github.com/mozilla/firefox-voice/issues/543) [1364951](https://github.com/mozilla/firefox-voice/commit/1364951)
- Add localHour to Telemetry. Fixes [#553](https://github.com/mozilla/firefox-voice/issues/553) [5ea9bde](https://github.com/mozilla/firefox-voice/commit/5ea9bde)
- Add first installation date to Telemetry. Fixes [#554](https://github.com/mozilla/firefox-voice/issues/554) [98f02ce](https://github.com/mozilla/firefox-voice/commit/98f02ce)
- Converts settings page to use React. Adds styling to the setting page. Adds a gui stylesheet for global element styles. [ebf3b2f](https://github.com/mozilla/firefox-voice/commit/ebf3b2f)
- Attempt to use .y consistently for judging positions. This may include more cards, if the position selection was incorrectly filtering out some cards. Fixes [#520](https://github.com/mozilla/firefox-voice/issues/520) [fa02b7c](https://github.com/mozilla/firefox-voice/commit/fa02b7c)

## Version 0.12.0 (2019-11-06)

- Remove hulu bang search. Fixes [#289](https://github.com/mozilla/firefox-voice/issues/289) [a52b7ae](https://github.com/mozilla/firefox-voice/commit/a52b7ae)
- Add a dev setting to open the popup in a tab, `OPEN_POPUP_ON_START=1 npm start` [6fd469d](https://github.com/mozilla/firefox-voice/commit/6fd469d)
- Update the lexicon [b600191](https://github.com/mozilla/firefox-voice/commit/b600191) [c5a63a7](https://github.com/mozilla/firefox-voice/commit/c5a63a7)
- Add an explicit error message if the search result tab is closed when you as for the next result [11bacf8](https://github.com/mozilla/firefox-voice/commit/11bacf8)
- Improve lazy Sentry setup, enabling it in the popup. Fixes [#532](https://github.com/mozilla/firefox-voice/issues/532) [dc0f8a8](https://github.com/mozilla/firefox-voice/commit/dc0f8a8)
- Multiple fixes to card images- normal cards were not displayed. Fixes [#530](https://github.com/mozilla/firefox-voice/issues/530) Fixes [#529](https://github.com/mozilla/firefox-voice/issues/529) Fixes [#528](https://github.com/mozilla/firefox-voice/issues/528) Fixes [#514](https://github.com/mozilla/firefox-voice/issues/514) [c3dcf39](https://github.com/mozilla/firefox-voice/commit/c3dcf39)
- Use React for most popup functionality ([#507](https://github.com/mozilla/firefox-voice/issues/507))
  - Fixes Issue [#502](https://github.com/mozilla/firefox-voice/issues/502). Fixes [#491](https://github.com/mozilla/firefox-voice/issues/491) [808f57c](https://github.com/mozilla/firefox-voice/commit/808f57c)
  - Thanks [jenniferharmon](https://github.com/jenniferharmon) for the contribution!
- Use a heuristic to find cards in search results. This uses some selectors, and then falls back to looking through elements for an appropriately-styled element. It also uses the element position relative to the search results to filter out some cards. Fixes [#498](https://github.com/mozilla/firefox-voice/issues/498) Fixes [#500](https://github.com/mozilla/firefox-voice/issues/500) [35dfd2d](https://github.com/mozilla/firefox-voice/commit/35dfd2d)
- Do parallel transcription with DeepSpeech. This doesn't effect anything a user sees, but will test the accuracy of DeepSpeech in Telemetry. Fixes [#349](https://github.com/mozilla/firefox-voice/issues/349) [a3bcfef](https://github.com/mozilla/firefox-voice/commit/a3bcfef)

## Version 0.11.0 (2019-10-29)

- The biggest change is a new search interface:
  - Searches happen in a pinned Google tab
  - Many search card results are displayed directly in the popup
  - New phrases to navigate search results: **next result**, **previous result**, and **show search results**
  - Related issues and commits: [#450](https://github.com/mozilla/firefox-voice/issues/450) [#449](https://github.com/mozilla/firefox-voice/issues/449) [6cfdfff](https://github.com/mozilla/firefox-voice/commit/6cfdfff) [#467](https://github.com/mozilla/firefox-voice/issues/467) [00939e3](https://github.com/mozilla/firefox-voice/commit/00939e3) [8c9eefb](https://github.com/mozilla/firefox-voice/commit/8c9eefb) [#477](https://github.com/mozilla/firefox-voice/issues/477) [dbd9bd3](https://github.com/mozilla/firefox-voice/commit/dbd9bd3) [#469](https://github.com/mozilla/firefox-voice/issues/469) [8ee28bf](https://github.com/mozilla/firefox-voice/commit/8ee28bf) [#451](https://github.com/mozilla/firefox-voice/issues/451) [db5ad1e](https://github.com/mozilla/firefox-voice/commit/db5ad1e) [#466](https://github.com/mozilla/firefox-voice/issues/466) [2766795](https://github.com/mozilla/firefox-voice/commit/2766795) [#447](https://github.com/mozilla/firefox-voice/issues/447) Fixes [#448](https://github.com/mozilla/firefox-voice/issues/448) [c9cb76e](https://github.com/mozilla/firefox-voice/commit/c9cb76e)
- Add a document about writing an intent [69f1f27](https://github.com/mozilla/firefox-voice/commit/69f1f27)
- Prioritize intent matches that have typed slots. Fixes [#471](https://github.com/mozilla/firefox-voice/issues/471) [65eacdb](https://github.com/mozilla/firefox-voice/commit/65eacdb)
- Refine intent matches. This tries to improve and expand on several intent matches. Fixes [#495](https://github.com/mozilla/firefox-voice/issues/495) Fixes [#496](https://github.com/mozilla/firefox-voice/issues/496) [8c3ec27](https://github.com/mozilla/firefox-voice/commit/8c3ec27)
- Add print intent [7027b50](https://github.com/mozilla/firefox-voice/commit/7027b50) (thanks [KhushilMistry](https://github.com/KhushilMistry))
- Clicking inside the doorhanger no longer blocks the user from typing a command. Fixes [#156](https://github.com/mozilla/firefox-voice/issues/156) [c47bec4](https://github.com/mozilla/firefox-voice/commit/c47bec4) (also from KhushilMistry)
- Fix 290, Look up command for Dictionary.com displays correct result [a51197b](https://github.com/mozilla/firefox-voice/commit/a51197b)
- Use a log level of info on prod versions of the add-on. Fixes [#297](https://github.com/mozilla/firefox-voice/issues/297) [2e7efdf](https://github.com/mozilla/firefox-voice/commit/2e7efdf)
- Make Spotify selectors resilient to another design used when you are not logged in (or free?) [047eda7](https://github.com/mozilla/firefox-voice/commit/047eda7)
- Default to spotify if no history is found. Fixes [#458](https://github.com/mozilla/firefox-voice/issues/458) [d3359e9](https://github.com/mozilla/firefox-voice/commit/d3359e9)
- Increase timeouts and limit permission checks. This gives a bit more time before we decide a service is unable to play. It also limits the total number of warnings to 3 for each individual service. Fixes [#453](https://github.com/mozilla/firefox-voice/issues/453) [669531f](https://github.com/mozilla/firefox-voice/commit/669531f)

## Version 0.10.0 (2019-10-21)

- Disallow extension in Private Browsing. In new versions of Firefox Nightly this may already be the default, but this makes it explicit. Fixes [#443](https://github.com/mozilla/firefox-voice/issues/443) [d32394e](https://github.com/mozilla/firefox-voice/commit/d32394e)
- Match search [service] for [query]. Fixes [#428](https://github.com/mozilla/firefox-voice/issues/428) [6ca4b3b](https://github.com/mozilla/firefox-voice/commit/6ca4b3b)
- Fix multi-window cases. Previously all code would get the 'active tab' from the first window, even if another window was focused. Also when activating a tab it would only make it active in its window, without necessarily focusing that same window. This adds methods that handle both these cases properly. [ed1ec51](https://github.com/mozilla/firefox-voice/commit/ed1ec51)
- Add "show all intents": This opens up the automatically-generated list of intents, instead of the manual lexicon. Fixes [#426](https://github.com/mozilla/firefox-voice/issues/426) [cf11118](https://github.com/mozilla/firefox-voice/commit/cf11118)

## Version 0.9.0 (2019-10-15)

- Start [#373](https://github.com/mozilla/firefox-voice/issues/373), add **open bookmark [query]** intent. This only supports opening existing bookmarks, in a new or current tab [c445a78](https://github.com/mozilla/firefox-voice/commit/c445a78)
- Remove Apple TV and Shazam from the service list. Fixes [#291](https://github.com/mozilla/firefox-voice/issues/291) [d239866](https://github.com/mozilla/firefox-voice/commit/d239866) Fixes [#287](https://github.com/mozilla/firefox-voice/issues/287) [ed3b50e](https://github.com/mozilla/firefox-voice/commit/ed3b50e)
- Add note-taking intents. This adds **write notes here**, **make note of this page**, **show notes** and **add note [text]** intents. Fixes [#78](https://github.com/mozilla/firefox-voice/issues/78) [7638563](https://github.com/mozilla/firefox-voice/commit/7638563)
- Do not let unpause pause a YouTube video. Fixes [#407](https://github.com/mozilla/firefox-voice/issues/407) [ae3fde2](https://github.com/mozilla/firefox-voice/commit/ae3fde2)
- Prefer the active tab when a service matches several tabs. As an example, with multiple YouTube tabs open, the active tab should be unpaused instead of just the first tab. Fixes [#406](https://github.com/mozilla/firefox-voice/issues/406) [d3f99e7](https://github.com/mozilla/firefox-voice/commit/d3f99e7)
- Add a new (_prototype_) **fancy search [query]** technique as a test. This does a Google search in a background (pinned) tab, maybe displays the card in the popup, or opens the first search result. This allows going through the search results item by item with **fancy next** [b846b11](https://github.com/mozilla/firefox-voice/commit/b846b11)
- Reduce example rotation time to 5 mminutes [bcaeb6c](https://github.com/mozilla/firefox-voice/commit/bcaeb6c)
- **Look up on maps** command will open Google Maps. Fixes [#288](https://github.com/mozilla/firefox-voice/issues/288) [ea4ee7c](https://github.com/mozilla/firefox-voice/commit/ea4ee7c)
- Add a **translate selection** intent [8b2d20d](https://github.com/mozilla/firefox-voice/commit/8b2d20d)
- Add simple translation intent: **translate this page**. Fixes [#83](https://github.com/mozilla/firefox-voice/issues/83) [fab5dc4](https://github.com/mozilla/firefox-voice/commit/fab5dc4)
- Make playing one service pause other tabs from the same service. Fixes [#346](https://github.com/mozilla/firefox-voice/issues/346) [066c211](https://github.com/mozilla/firefox-voice/commit/066c211)
- Make **open new tab** intent more flexible in terms of language. Fixes [#385](https://github.com/mozilla/firefox-voice/issues/385) [11b88d9](https://github.com/mozilla/firefox-voice/commit/11b88d9)
- Fix Spotify. Spotify appears to have undergone a redesign. Fixes [#386](https://github.com/mozilla/firefox-voice/issues/386) [258740d](https://github.com/mozilla/firefox-voice/commit/258740d)
- Allow use of **play [query] video** to specify YouTube. Fixes [#398](https://github.com/mozilla/firefox-voice/issues/398) [8c7b623](https://github.com/mozilla/firefox-voice/commit/8c7b623)
- Start [#392](https://github.com/mozilla/firefox-voice/issues/392), add a **show comments** intent. This only supports Hacker News and Reddit, and supports them unconditionally (whether or not you use these). Also includes some basic paging (**next comments**) support for multiple results. [938ef56](https://github.com/mozilla/firefox-voice/commit/938ef56)
- Start [#177](https://github.com/mozilla/firefox-voice/issues/177), add a functional settings page. Designs aren't finished. [0c75475](https://github.com/mozilla/firefox-voice/commit/0c75475)
- Support specific **google images of [query]** questions. Fixes [#326](https://github.com/mozilla/firefox-voice/issues/326) [7f178dc](https://github.com/mozilla/firefox-voice/commit/7f178dc)
- Make **unpause** resume reading an about:reader page. Fixes [#371](https://github.com/mozilla/firefox-voice/issues/371) [365af5b](https://github.com/mozilla/firefox-voice/commit/365af5b)

## Version 0.8.0 (2019-10-07)

- Follow redirect page in I'm Lucky searches. Sometimes Google has started to interrupt I'm Feeling Luck search URLs with a redirect page. This follows those redirect. Fixes [#362](https://github.com/mozilla/firefox-voice/issues/362) [40d304c](https://github.com/mozilla/firefox-voice/commit/40d304c)

## Version 0.7.0 (2019-10-04)

- Add a lexicon, viewable with "help" [#129](https://github.com/mozilla/firefox-voice/issues/129) [7a41d6f](https://github.com/mozilla/firefox-voice/commit/7a41d6f) [afd96f1](https://github.com/mozilla/firefox-voice/commit/afd96f1) [aa5d9b6](https://github.com/mozilla/firefox-voice/commit/aa5d9b6) [14314cc](https://github.com/mozilla/firefox-voice/commit/14314cc) [82d4877](https://github.com/mozilla/firefox-voice/commit/82d4877)
- Avoid "find tab" exception when no tab is found [c02b0d9](https://github.com/mozilla/firefox-voice/commit/c02b0d9)
- Make Sentry work in the popup and recorder pages. [0ecc124](https://github.com/mozilla/firefox-voice/commit/0ecc124)
- Add `$FORCE_SENTRY` option for local development [fd7e9b4](https://github.com/mozilla/firefox-voice/commit/fd7e9b4)
- Add "cancel"/"nevermind" intents. Fixes [#104](https://github.com/mozilla/firefox-voice/issues/104) [2f5c190](https://github.com/mozilla/firefox-voice/commit/2f5c190)
- Amend [#344](https://github.com/mozilla/firefox-voice/issues/344), make "look in my service" work [8841586](https://github.com/mozilla/firefox-voice/commit/8841586)
- Make "look for" intent matchers more specific. Fixes [#344](https://github.com/mozilla/firefox-voice/issues/344) [c532f31](https://github.com/mozilla/firefox-voice/commit/c532f31)
- Make "stop" an alias for "pause". Fixes [#363](https://github.com/mozilla/firefox-voice/issues/363) [33b9df2](https://github.com/mozilla/firefox-voice/commit/33b9df2)
- Use current tab to prioritize some service selection. Fixes [#319](https://github.com/mozilla/firefox-voice/issues/319) Fixes [#321](https://github.com/mozilla/firefox-voice/issues/321) Fixes [#354](https://github.com/mozilla/firefox-voice/issues/354) [b5dbe71](https://github.com/mozilla/firefox-voice/commit/b5dbe71)
- Handle autoplay failure cases. This checks if the tab was able to successfully start playing for Spotify and YouTube, giving an error message with instructions if it fails. It also detects the background Spotify tab not being able to play. [3e24859](https://github.com/mozilla/firefox-voice/commit/3e24859)
- Make "pause" pause everything, and pause everything when playing a new thing. Fixes [#335](https://github.com/mozilla/firefox-voice/issues/335) Fixes [#318](https://github.com/mozilla/firefox-voice/issues/318) [2ba2cec](https://github.com/mozilla/firefox-voice/commit/2ba2cec)
- Unmute other tabs as soon as you start typing [21d84fb](https://github.com/mozilla/firefox-voice/commit/21d84fb)
- Make read intent use content script handlers. Also 'read' no longer toggles, but only starts reading. Also you can stop reading (with 'stop reading') a page that was started manually. Fixes [#307](https://github.com/mozilla/firefox-voice/issues/307) Fixes [#260](https://github.com/mozilla/firefox-voice/issues/260) Fixes [#152](https://github.com/mozilla/firefox-voice/issues/152) [33feb10](https://github.com/mozilla/firefox-voice/commit/33feb10)
- Make intent parsing prefer small-slot matches. The idea is just that the more characters get matched by the static portion (not slot portion) of the intent, the better a match it is. Fixes [#338](https://github.com/mozilla/firefox-voice/issues/338) [80b9dcd](https://github.com/mozilla/firefox-voice/commit/80b9dcd)
- Show typed input as the transcript. Fixes [#257](https://github.com/mozilla/firefox-voice/issues/257) [7a35ea3](https://github.com/mozilla/firefox-voice/commit/7a35ea3)
- Show a proper error when Reader Mode fails. Fixes [#311](https://github.com/mozilla/firefox-voice/issues/311) [b9d0bd8](https://github.com/mozilla/firefox-voice/commit/b9d0bd8)
- Display text of error message. Fixes [#310](https://github.com/mozilla/firefox-voice/issues/310) [345b9bc](https://github.com/mozilla/firefox-voice/commit/345b9bc)
- Unmute tabs as soon as processing starts. Fixes [#300](https://github.com/mozilla/firefox-voice/issues/300) [ea2ed25](https://github.com/mozilla/firefox-voice/commit/ea2ed25)
- Add "open new tab". [3dff9a2](https://github.com/mozilla/firefox-voice/commit/3dff9a2)
- Convert YouTube to be a music service. Fixes [#320](https://github.com/mozilla/firefox-voice/issues/320) [d5121eb](https://github.com/mozilla/firefox-voice/commit/d5121eb)
- Focus tab on content script failure. Also do a wide-ranging refactor of how services are handled, registered, and run on the content side. Fixes [#322](https://github.com/mozilla/firefox-voice/issues/322) [5eb7bbf](https://github.com/mozilla/firefox-voice/commit/5eb7bbf)
- Allow intents to override some of what happens when they fail [2cbe83c](https://github.com/mozilla/firefox-voice/commit/2cbe83c)
- Make interprocess messaging its own level (off by default) [e06baaf](https://github.com/mozilla/firefox-voice/commit/e06baaf)
- Implement music intents- This adds some support just for Spotify, as a first service [#75](https://github.com/mozilla/firefox-voice/issues/75) [4087ef7](https://github.com/mozilla/firefox-voice/commit/4087ef7)

## Version 0.6.0 (2019-09-26)

- Include utterance in Telemetry ping

## Version 0.5.0 (2019-09-19)

- Add Sentry error collection. Fixes [#70](https://github.com/mozilla/firefox-voice/issues/70) [03281b0](https://github.com/mozilla/firefox-voice/commit/03281b0)
- Replace add-on icon in `about:addons`. Fixes [#282](https://github.com/mozilla/firefox-voice/issues/282) [6f408e6](https://github.com/mozilla/firefox-voice/commit/6f408e6)
- Avoid error message when you don't speak. Fixes [#162](https://github.com/mozilla/firefox-voice/issues/162) [12038f7](https://github.com/mozilla/firefox-voice/commit/12038f7)
- Move build settings out of manifest. Fixes [#241](https://github.com/mozilla/firefox-voice/issues/241) [a747d2f](https://github.com/mozilla/firefox-voice/commit/a747d2f)
- Open site-specific searches in a new tab. Also allow 'in' in addition to 'on' in site-specific searches, like 'in Gmail'. Fixes [#190](https://github.com/mozilla/firefox-voice/issues/190) [328d6d7](https://github.com/mozilla/firefox-voice/commit/328d6d7)
- Make `go to [query] tab` do a tab find. Fixes [#265](https://github.com/mozilla/firefox-voice/issues/265) [e68b861](https://github.com/mozilla/firefox-voice/commit/e68b861)
- Remove 'stop' alias for 'mute'. Fixes [#188](https://github.com/mozilla/firefox-voice/issues/188) [a518c02](https://github.com/mozilla/firefox-voice/commit/a518c02)
- Remove Apple Music. The bang service was broken. Fixes [#277](https://github.com/mozilla/firefox-voice/issues/277) [08c785b](https://github.com/mozilla/firefox-voice/commit/08c785b)
- Do not open changelog from options. Fixes [#252](https://github.com/mozilla/firefox-voice/issues/252) [18bb2fd](https://github.com/mozilla/firefox-voice/commit/18bb2fd)
- Make sure `inDevelopment` always ends up exactly true or false after extension initialization [9e1f27d](https://github.com/mozilla/firefox-voice/commit/9e1f27d)
- Reload popup so text box contents aren't preserved. Fixes [#193](https://github.com/mozilla/firefox-voice/issues/193) [c296f99](https://github.com/mozilla/firefox-voice/commit/c296f99)
- Add unpause as an alias for play. Fixes [#179](https://github.com/mozilla/firefox-voice/issues/179) [68b80ad](https://github.com/mozilla/firefox-voice/commit/68b80ad)
- Second attempt at fixing, where the keyboard shortcut would be mistaken as text input. Fixes [#238](https://github.com/mozilla/firefox-voice/issues/238) [0fc25d9](https://github.com/mozilla/firefox-voice/commit/0fc25d9)

## 0.4.0

- Avoid showing keyboard shortcut in popup. Fixes [#238](https://github.com/mozilla/firefox-voice/issues/238) [d1bd5a8](https://github.com/mozilla/firefox-voice/commit/d1bd5a8)
- Do not time out text input. Fixes [#258](https://github.com/mozilla/firefox-voice/issues/258) [1c66c4c](https://github.com/mozilla/firefox-voice/commit/1c66c4c)
- Fix parsing of intents that start with "go". Fixes [#271](https://github.com/mozilla/firefox-voice/issues/271) [ac3111a](https://github.com/mozilla/firefox-voice/commit/ac3111a)
- Add a bunch more duckduckgo bang services. Fixes [#202](https://github.com/mozilla/firefox-voice/issues/202) [79ed5b5](https://github.com/mozilla/firefox-voice/commit/79ed5b5)
- Add close tab intent, starts [#269](https://github.com/mozilla/firefox-voice/issues/269) [10421de](https://github.com/mozilla/firefox-voice/commit/10421de)
- Add favicon to pinned/recorder tab. Fixes [#219](https://github.com/mozilla/firefox-voice/issues/219) [37a6d69](https://github.com/mozilla/firefox-voice/commit/37a6d69)

## 0.3.0

- Quick follow-on release
- Fix recording page error messages
- Fix documentation on keyboard shortcut
- Add another warning about data collection
- Change text input to `<input>`
- Fix back button in popup

## 0.2.0

- First official release (only for an internal Mozilla audience)
