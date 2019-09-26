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
