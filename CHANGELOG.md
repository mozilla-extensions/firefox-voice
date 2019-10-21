## Version 0.10.0 (2019-10-21)

- Disallow extension in Private Browsing. In new versions of Firefox Nightly this may already be the default, but this makes it explicit. Fixes [#443](https://github.com/mozilla-services/screenshots/issues/443) [d32394e](https://github.com/mozilla-services/screenshots/commit/d32394e)
- Match search [service] for [query]. Fixes [#428](https://github.com/mozilla-services/screenshots/issues/428) [6ca4b3b](https://github.com/mozilla-services/screenshots/commit/6ca4b3b)
- Fix multi-window cases. Previously all code would get the 'active tab' from the first window, even if another window was focused. Also when activating a tab it would only make it active in its window, without necessarily focusing that same window. This adds methods that handle both these cases properly. [ed1ec51](https://github.com/mozilla-services/screenshots/commit/ed1ec51)
- Add "show all intents": This opens up the automatically-generated list of intents, instead of the manual lexicon. Fixes [#426](https://github.com/mozilla-services/screenshots/issues/426) [cf11118](https://github.com/mozilla-services/screenshots/commit/cf11118)

## Version 0.9.0 (2019-10-15)

- Start [#373](https://github.com/mozilla-services/screenshots/issues/373), add **open bookmark [query]** intent. This only supports opening existing bookmarks, in a new or current tab [c445a78](https://github.com/mozilla-services/screenshots/commit/c445a78)
- Remove Apple TV and Shazam from the service list. Fixes [#291](https://github.com/mozilla-services/screenshots/issues/291) [d239866](https://github.com/mozilla-services/screenshots/commit/d239866) Fixes [#287](https://github.com/mozilla-services/screenshots/issues/287) [ed3b50e](https://github.com/mozilla-services/screenshots/commit/ed3b50e)
- Add note-taking intents. This adds **write notes here**, **make note of this page**, **show notes** and **add note [text]** intents. Fixes [#78](https://github.com/mozilla-services/screenshots/issues/78) [7638563](https://github.com/mozilla-services/screenshots/commit/7638563)
- Do not let unpause pause a YouTube video. Fixes [#407](https://github.com/mozilla-services/screenshots/issues/407) [ae3fde2](https://github.com/mozilla-services/screenshots/commit/ae3fde2)
- Prefer the active tab when a service matches several tabs. As an example, with multiple YouTube tabs open, the active tab should be unpaused instead of just the first tab. Fixes [#406](https://github.com/mozilla-services/screenshots/issues/406) [d3f99e7](https://github.com/mozilla-services/screenshots/commit/d3f99e7)
- Add a new (_prototype_) **fancy search [query]** technique as a test. This does a Google search in a background (pinned) tab, maybe displays the card in the popup, or opens the first search result. This allows going through the search results item by item with **fancy next** [b846b11](https://github.com/mozilla-services/screenshots/commit/b846b11)
- Reduce example rotation time to 5 mminutes [bcaeb6c](https://github.com/mozilla-services/screenshots/commit/bcaeb6c)
- **Look up on maps** command will open Google Maps. Fixes [#288](https://github.com/mozilla-services/screenshots/issues/288) [ea4ee7c](https://github.com/mozilla-services/screenshots/commit/ea4ee7c)
- Add a **translate selection** intent [8b2d20d](https://github.com/mozilla-services/screenshots/commit/8b2d20d)
- Add simple translation intent: **translate this page**. Fixes [#83](https://github.com/mozilla-services/screenshots/issues/83) [fab5dc4](https://github.com/mozilla-services/screenshots/commit/fab5dc4)
- Make playing one service pause other tabs from the same service. Fixes [#346](https://github.com/mozilla-services/screenshots/issues/346) [066c211](https://github.com/mozilla-services/screenshots/commit/066c211)
- Make **open new tab** intent more flexible in terms of language. Fixes [#385](https://github.com/mozilla-services/screenshots/issues/385) [11b88d9](https://github.com/mozilla-services/screenshots/commit/11b88d9)
- Fix Spotify. Spotify appears to have undergone a redesign. Fixes [#386](https://github.com/mozilla-services/screenshots/issues/386) [258740d](https://github.com/mozilla-services/screenshots/commit/258740d)
- Allow use of **play [query] video** to specify YouTube. Fixes [#398](https://github.com/mozilla-services/screenshots/issues/398) [8c7b623](https://github.com/mozilla-services/screenshots/commit/8c7b623)
- Start [#392](https://github.com/mozilla-services/screenshots/issues/392), add a **show comments** intent. This only supports Hacker News and Reddit, and supports them unconditionally (whether or not you use these). Also includes some basic paging (**next comments**) support for multiple results. [938ef56](https://github.com/mozilla-services/screenshots/commit/938ef56)
- Start [#177](https://github.com/mozilla-services/screenshots/issues/177), add a functional settings page. Designs aren't finished. [0c75475](https://github.com/mozilla-services/screenshots/commit/0c75475)
- Support specific **google images of [query]** questions. Fixes [#326](https://github.com/mozilla-services/screenshots/issues/326) [7f178dc](https://github.com/mozilla-services/screenshots/commit/7f178dc)
- Make **unpause** resume reading an about:reader page. Fixes [#371](https://github.com/mozilla-services/screenshots/issues/371) [365af5b](https://github.com/mozilla-services/screenshots/commit/365af5b)

## Version 0.8.0 (2019-10-07)

- Follow redirect page in I'm Lucky searches. Sometimes Google has started to interrupt I'm Feeling Luck search URLs with a redirect page. This follows those redirect. Fixes [#362](https://github.com/mozilla-services/screenshots/issues/362) [40d304c](https://github.com/mozilla-services/screenshots/commit/40d304c)

## Version 0.7.0 (2019-10-04)

- Add a lexicon, viewable with "help" [#129](https://github.com/mozilla-services/screenshots/issues/129) [7a41d6f](https://github.com/mozilla-services/screenshots/commit/7a41d6f) [afd96f1](https://github.com/mozilla-services/screenshots/commit/afd96f1) [aa5d9b6](https://github.com/mozilla-services/screenshots/commit/aa5d9b6) [14314cc](https://github.com/mozilla-services/screenshots/commit/14314cc) [82d4877](https://github.com/mozilla-services/screenshots/commit/82d4877)
- Avoid "find tab" exception when no tab is found [c02b0d9](https://github.com/mozilla-services/screenshots/commit/c02b0d9)
- Make Sentry work in the popup and recorder pages. [0ecc124](https://github.com/mozilla-services/screenshots/commit/0ecc124)
- Add `$FORCE_SENTRY` option for local development [fd7e9b4](https://github.com/mozilla-services/screenshots/commit/fd7e9b4)
- Add "cancel"/"nevermind" intents. Fixes [#104](https://github.com/mozilla-services/screenshots/issues/104) [2f5c190](https://github.com/mozilla-services/screenshots/commit/2f5c190)
- Amend [#344](https://github.com/mozilla-services/screenshots/issues/344), make "look in my service" work [8841586](https://github.com/mozilla-services/screenshots/commit/8841586)
- Make "look for" intent matchers more specific. Fixes [#344](https://github.com/mozilla-services/screenshots/issues/344) [c532f31](https://github.com/mozilla-services/screenshots/commit/c532f31)
- Make "stop" an alias for "pause". Fixes [#363](https://github.com/mozilla-services/screenshots/issues/363) [33b9df2](https://github.com/mozilla-services/screenshots/commit/33b9df2)
- Use current tab to prioritize some service selection. Fixes [#319](https://github.com/mozilla-services/screenshots/issues/319) Fixes [#321](https://github.com/mozilla-services/screenshots/issues/321) Fixes [#354](https://github.com/mozilla-services/screenshots/issues/354) [b5dbe71](https://github.com/mozilla-services/screenshots/commit/b5dbe71)
- Handle autoplay failure cases. This checks if the tab was able to successfully start playing for Spotify and YouTube, giving an error message with instructions if it fails. It also detects the background Spotify tab not being able to play. [3e24859](https://github.com/mozilla-services/screenshots/commit/3e24859)
- Make "pause" pause everything, and pause everything when playing a new thing. Fixes [#335](https://github.com/mozilla-services/screenshots/issues/335) Fixes [#318](https://github.com/mozilla-services/screenshots/issues/318) [2ba2cec](https://github.com/mozilla-services/screenshots/commit/2ba2cec)
- Unmute other tabs as soon as you start typing [21d84fb](https://github.com/mozilla-services/screenshots/commit/21d84fb)
- Make read intent use content script handlers. Also 'read' no longer toggles, but only starts reading. Also you can stop reading (with 'stop reading') a page that was started manually. Fixes [#307](https://github.com/mozilla-services/screenshots/issues/307) Fixes [#260](https://github.com/mozilla-services/screenshots/issues/260) Fixes [#152](https://github.com/mozilla-services/screenshots/issues/152) [33feb10](https://github.com/mozilla-services/screenshots/commit/33feb10)
- Make intent parsing prefer small-slot matches. The idea is just that the more characters get matched by the static portion (not slot portion) of the intent, the better a match it is. Fixes [#338](https://github.com/mozilla-services/screenshots/issues/338) [80b9dcd](https://github.com/mozilla-services/screenshots/commit/80b9dcd)
- Show typed input as the transcript. Fixes [#257](https://github.com/mozilla-services/screenshots/issues/257) [7a35ea3](https://github.com/mozilla-services/screenshots/commit/7a35ea3)
- Show a proper error when Reader Mode fails. Fixes [#311](https://github.com/mozilla-services/screenshots/issues/311) [b9d0bd8](https://github.com/mozilla-services/screenshots/commit/b9d0bd8)
- Display text of error message. Fixes [#310](https://github.com/mozilla-services/screenshots/issues/310) [345b9bc](https://github.com/mozilla-services/screenshots/commit/345b9bc)
- Unmute tabs as soon as processing starts. Fixes [#300](https://github.com/mozilla-services/screenshots/issues/300) [ea2ed25](https://github.com/mozilla-services/screenshots/commit/ea2ed25)
- Add "open new tab". [3dff9a2](https://github.com/mozilla-services/screenshots/commit/3dff9a2)
- Convert YouTube to be a music service. Fixes [#320](https://github.com/mozilla-services/screenshots/issues/320) [d5121eb](https://github.com/mozilla-services/screenshots/commit/d5121eb)
- Focus tab on content script failure. Also do a wide-ranging refactor of how services are handled, registered, and run on the content side. Fixes [#322](https://github.com/mozilla-services/screenshots/issues/322) [5eb7bbf](https://github.com/mozilla-services/screenshots/commit/5eb7bbf)
- Allow intents to override some of what happens when they fail [2cbe83c](https://github.com/mozilla-services/screenshots/commit/2cbe83c)
- Make interprocess messaging its own level (off by default) [e06baaf](https://github.com/mozilla-services/screenshots/commit/e06baaf)
- Implement music intents- This adds some support just for Spotify, as a first service [#75](https://github.com/mozilla-services/screenshots/issues/75) [4087ef7](https://github.com/mozilla-services/screenshots/commit/4087ef7)

## Version 0.6.0 (2019-09-26)

- Include utterance in Telemetry ping

## Version 0.5.0 (2019-09-19)

- Add Sentry error collection. Fixes [#70](https://github.com/mozilla-services/screenshots/issues/70) [03281b0](https://github.com/mozilla-services/screenshots/commit/03281b0)
- Replace add-on icon in `about:addons`. Fixes [#282](https://github.com/mozilla-services/screenshots/issues/282) [6f408e6](https://github.com/mozilla-services/screenshots/commit/6f408e6)
- Avoid error message when you don't speak. Fixes [#162](https://github.com/mozilla-services/screenshots/issues/162) [12038f7](https://github.com/mozilla-services/screenshots/commit/12038f7)
- Move build settings out of manifest. Fixes [#241](https://github.com/mozilla-services/screenshots/issues/241) [a747d2f](https://github.com/mozilla-services/screenshots/commit/a747d2f)
- Open site-specific searches in a new tab. Also allow 'in' in addition to 'on' in site-specific searches, like 'in Gmail'. Fixes [#190](https://github.com/mozilla-services/screenshots/issues/190) [328d6d7](https://github.com/mozilla-services/screenshots/commit/328d6d7)
- Make `go to [query] tab` do a tab find. Fixes [#265](https://github.com/mozilla-services/screenshots/issues/265) [e68b861](https://github.com/mozilla-services/screenshots/commit/e68b861)
- Remove 'stop' alias for 'mute'. Fixes [#188](https://github.com/mozilla-services/screenshots/issues/188) [a518c02](https://github.com/mozilla-services/screenshots/commit/a518c02)
- Remove Apple Music. The bang service was broken. Fixes [#277](https://github.com/mozilla-services/screenshots/issues/277) [08c785b](https://github.com/mozilla-services/screenshots/commit/08c785b)
- Do not open changelog from options. Fixes [#252](https://github.com/mozilla-services/screenshots/issues/252) [18bb2fd](https://github.com/mozilla-services/screenshots/commit/18bb2fd)
- Make sure `inDevelopment` always ends up exactly true or false after extension initialization [9e1f27d](https://github.com/mozilla-services/screenshots/commit/9e1f27d)
- Reload popup so text box contents aren't preserved. Fixes [#193](https://github.com/mozilla-services/screenshots/issues/193) [c296f99](https://github.com/mozilla-services/screenshots/commit/c296f99)
- Add unpause as an alias for play. Fixes [#179](https://github.com/mozilla-services/screenshots/issues/179) [68b80ad](https://github.com/mozilla-services/screenshots/commit/68b80ad)
- Second attempt at fixing, where the keyboard shortcut would be mistaken as text input. Fixes [#238](https://github.com/mozilla-services/screenshots/issues/238) [0fc25d9](https://github.com/mozilla-services/screenshots/commit/0fc25d9)

## 0.4.0

- Avoid showing keyboard shortcut in popup. Fixes [#238](https://github.com/mozilla-services/screenshots/issues/238) [d1bd5a8](https://github.com/mozilla-services/screenshots/commit/d1bd5a8)
- Do not time out text input. Fixes [#258](https://github.com/mozilla-services/screenshots/issues/258) [1c66c4c](https://github.com/mozilla-services/screenshots/commit/1c66c4c)
- Fix parsing of intents that start with "go". Fixes [#271](https://github.com/mozilla-services/screenshots/issues/271) [ac3111a](https://github.com/mozilla-services/screenshots/commit/ac3111a)
- Add a bunch more duckduckgo bang services. Fixes [#202](https://github.com/mozilla-services/screenshots/issues/202) [79ed5b5](https://github.com/mozilla-services/screenshots/commit/79ed5b5)
- Add close tab intent, starts [#269](https://github.com/mozilla-services/screenshots/issues/269) [10421de](https://github.com/mozilla-services/screenshots/commit/10421de)
- Add favicon to pinned/recorder tab. Fixes [#219](https://github.com/mozilla-services/screenshots/issues/219) [37a6d69](https://github.com/mozilla-services/screenshots/commit/37a6d69)

## 0.3.0

- Quick follow-on release
- Fix recording page error messages
- Fix documentation on keyboard shortcut
- Add another warning about data collection
- Change text input to `<input>`
- Fix back button in popup

## 0.2.0

- First official release (only for an internal Mozilla audience)
