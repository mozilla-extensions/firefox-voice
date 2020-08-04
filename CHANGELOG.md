## Version 0.23.0 (2020-07-27)

- Moved repository from https://github.com/mozilla/firefox-voice to https://github.com/mozilla-extensions/firefox-voice
- Fixed: "show notes" give invalid tab error if notes tab is closed (from [AbhiVaidya95](https://github.com/AbhiVaidya95))
  [#1643](https://github.com/mozilla/firefox-voice/issues/1643) ([#1816](https://github.com/mozilla/firefox-voice/issues/1816))
- Help [#1833](https://github.com/mozilla/firefox-voice/issues/1833), fix read test
  To actually fix the bug this should override the music.move implementation for the service, but this fixes the test at least [d8f5b02](https://github.com/mozilla/firefox-voice/commit/d8f5b02)
- Make Spotify work when localized with a language besides English (from [breadsanta](https://github.com/breadsanta)). [#1602](https://github.com/mozilla/firefox-voice/issues/1602) [b65c3e3](https://github.com/mozilla/firefox-voice/commit/b65c3e3)
- Refactor content scripts ([#1815](https://github.com/mozilla/firefox-voice/issues/1815)) Fixes [#1085](https://github.com/mozilla/firefox-voice/issues/1085) [c87b022](https://github.com/mozilla/firefox-voice/commit/c87b022)
- Partly pause and continue routines ([#1798](https://github.com/mozilla/firefox-voice/issues/1798))
  - pause and continue routines
  - added for loops. Fixes [#1757](https://github.com/mozilla/firefox-voice/issues/1757) Fixes [#1757](https://github.com/mozilla/firefox-voice/issues/1757) Fixes [#1757](https://github.com/mozilla/firefox-voice/issues/1757) [7ce4c83](https://github.com/mozilla/firefox-voice/commit/7ce4c83)
- 'Sign in' and 'sign out' intent. Fixes [#1560](https://github.com/mozilla/firefox-voice/issues/1560) Fixes [#1560](https://github.com/mozilla/firefox-voice/issues/1560) [8bbbe33](https://github.com/mozilla/firefox-voice/commit/8bbbe33)
- Adding a min-height to remove white line (from [Gwe-n](https://github.com/Gwe-n))
  Fixes 1607 [42cf930](https://github.com/mozilla/firefox-voice/commit/42cf930)
- Add "help about X" intent (from [AbhiVaidya95](https://github.com/AbhiVaidya95)). Fixes [#1771](https://github.com/mozilla/firefox-voice/issues/1771) [bf4520d](https://github.com/mozilla/firefox-voice/commit/bf4520d)
- Support forward and rewind request in reader mode [#1704](https://github.com/mozilla/firefox-voice/issues/1704) (from [AbhiVaidya95](https://github.com/AbhiVaidya95))
  ([#1812](https://github.com/mozilla/firefox-voice/issues/1812))
- Use free text search in tabs.js:getmatchingtabs() (from [AbhiVaidya95](https://github.com/AbhiVaidya95))
  ([#1807](https://github.com/mozilla/firefox-voice/issues/1807))
- Routine timing improvements ([#1791](https://github.com/mozilla/firefox-voice/issues/1791))
  - Wait for page to fully load when in routines
  - added content script to check loaded page using selectors. Fixes [#1758](https://github.com/mozilla/firefox-voice/issues/1758) [0c9a47a](https://github.com/mozilla/firefox-voice/commit/0c9a47a)
- Organize main.js message handling. Fixes [#1804](https://github.com/mozilla/firefox-voice/issues/1804) [09c24eb](https://github.com/mozilla/firefox-voice/commit/09c24eb)
- make "play trailer of [video]" work. (from [AbhiVaidya95](https://github.com/AbhiVaidya95)) Fixes [#1777](https://github.com/mozilla/firefox-voice/issues/1777) Fixes [#1777](https://github.com/mozilla/firefox-voice/issues/1777) [78ada31](https://github.com/mozilla/firefox-voice/commit/78ada31)
- Add preference to disable saving history. Fixes [#1545](https://github.com/mozilla/firefox-voice/issues/1545) [3de4e26](https://github.com/mozilla/firefox-voice/commit/3de4e26)

## Version 0.22.0 (2020-07-07)

Note: this version was not released publicly

- Enable speech output for search card results
  ([#1786](https://github.com/mozilla/firefox-voice/issues/1786))
  - Add speech output pref to options
  - Add speech output (behind a pref) for messages that previously only displayed in-card text
  - Only display voice output preferences if the device has built-in speech synthesis voices
  - Reimplement text-to-speech card parsing, with query selectors embedded within their corresponding methods
  - Support other languages for translate cards, and fix sidebar cards
  - Enable speech for banner cards
  - Move card speech parsing into its own file. Fixes [#582](https://github.com/mozilla/firefox-voice/issues/582) [cdca380](https://github.com/mozilla/firefox-voice/commit/cdca380)
- [intent] hello ([#1783](https://github.com/mozilla/firefox-voice/issues/1783)). Fixes [#1269](https://github.com/mozilla/firefox-voice/issues/1269) [bccd01e](https://github.com/mozilla/firefox-voice/commit/bccd01e)
- Added intents for missing features ([#1762](https://github.com/mozilla/firefox-voice/issues/1762)). Fixes [#963](https://github.com/mozilla/firefox-voice/issues/963) Fixes [#963](https://github.com/mozilla/firefox-voice/issues/963) [2de786d](https://github.com/mozilla/firefox-voice/commit/2de786d)
- Create registerPageName function in intentrunner
  ([#1756](https://github.com/mozilla/firefox-voice/issues/1756))
  - Create registerPageName function in intentRunner. Fixes [#1483](https://github.com/mozilla/firefox-voice/issues/1483) Fixes [#1483](https://github.com/mozilla/firefox-voice/issues/1483) [51ec95a](https://github.com/mozilla/firefox-voice/commit/51ec95a)
- Intent for close all tabs ([#1754](https://github.com/mozilla/firefox-voice/issues/1754)) (from [Ishakikani9117](https://github.com/Ishakikani9117)) [056ff1f](https://github.com/mozilla/firefox-voice/commit/056ff1f)
  - Close all tabs intent ([#1772](https://github.com/mozilla/firefox-voice/issues/1772)) (from [veecee424](https://github.com/veecee424)). Fixes [#1751](https://github.com/mozilla/firefox-voice/issues/1751) Fixes [#1751](https://github.com/mozilla/firefox-voice/issues/1751) [acf5900](https://github.com/mozilla/firefox-voice/commit/acf5900)
- Various styling issues in routines. Fixes [#1329](https://github.com/mozilla/firefox-voice/issues/1329) [9aee421](https://github.com/mozilla/firefox-voice/commit/9aee421)
- What's playing cleanup & improvments. Fixes [#1266](https://github.com/mozilla/firefox-voice/issues/1266) [41e076a](https://github.com/mozilla/firefox-voice/commit/41e076a)
- [intent] "test" Fixes [#1270](https://github.com/mozilla/firefox-voice/issues/1270) [9631961](https://github.com/mozilla/firefox-voice/commit/9631961)
- Selecting specified tabs. Fixes [#1778](https://github.com/mozilla/firefox-voice/issues/1778) [4cef231](https://github.com/mozilla/firefox-voice/commit/4cef231)
- Implement voice output preference, and support
  - voice output for results that previously only displayed in-card text ([#1770](https://github.com/mozilla/firefox-voice/issues/1770))
  - This adds a new preference for voice output, and attempts to handle cases where the user's device has no built-in voices.
  - To reflect the fact that both speech and text output are now supported, this PR also renames displayText to presentMessage.
  - Note that this is likely not yet compatible with follow-ups.
    - Add speech output (behind a pref) for messages that previously only displayed in-card text
    - Only display voice output preferences if the device has built-in speech synthesis voices. Fixes [#1722](https://github.com/mozilla/firefox-voice/issues/1722) [39b9b82](https://github.com/mozilla/firefox-voice/commit/39b9b82)
- Lots of code refactoring.
  - Rename language/matching.js to language/findmatch.js. see
    [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [887bbc5](https://github.com/mozilla/firefox-voice/commit/887bbc5)
  - Remove module loader ([#1768](https://github.com/mozilla/firefox-voice/issues/1768))
    - Remove moduleLoader.js and simplify how main.js is first loaded. See [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [a676475](https://github.com/mozilla/firefox-voice/commit/a676475)
  - Rename old occurances of 'desc' to something context-related.
    See [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [8edf680](https://github.com/mozilla/firefox-voice/commit/8edf680)
  - Remove now-unused commits [522d953](https://github.com/mozilla/firefox-voice/commit/522d953)
  - Move createtabgooglelucky from context to browserutil. see
    [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [c590a63](https://github.com/mozilla/firefox-voice/commit/c590a63)
  - Remove context.openorfocustab and move it to browserutil. see
    [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [e4919e9](https://github.com/mozilla/firefox-voice/commit/e4919e9)
  - Remove context.maketabactive and use
    browserUtil.makeTabActive. See [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [4e80df3](https://github.com/mozilla/firefox-voice/commit/4e80df3)
  - Remove context.activetab and use browserutil.activetab. see
    [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [07e9a42](https://github.com/mozilla/firefox-voice/commit/07e9a42)
  - Use browserutil.createandloadtab instead of
    context.createTab. See [#1600](https://github.com/mozilla/firefox-voice/issues/1600) [5ca014d](https://github.com/mozilla/firefox-voice/commit/5ca014d)
  - Rename conntent.lazyinject to content.inject (since it's not
    lazily done at all) [b6413da](https://github.com/mozilla/firefox-voice/commit/b6413da)
- Adjust volume for audible tabs ([#1731](https://github.com/mozilla/firefox-voice/issues/1731))
  When a volume command adjustment is made, it will look through all the "might be audible" tabs and adjusts the volume to the latest audible tab. If no tab is audible, the error "No audio is playing" appears. Fixes [#1718](https://github.com/mozilla/firefox-voice/issues/1718) [9380cc5](https://github.com/mozilla/firefox-voice/commit/9380cc5)
- Enable intent "turn selection into link" in google docs (from [noi5e](https://github.com/noi5e))
  ([#1565](https://github.com/mozilla/firefox-voice/issues/1565))
  Partial fix for issue [#1363](https://github.com/mozilla/firefox-voice/issues/1363) (solves in Google Docs, not in Google Slides)
  I made an earlier draft PR here: [#1493](https://github.com/mozilla/firefox-voice/issues/1493)
  - extension/intents/forms/forms.js detects if the URL is in Google Docs and lazyloads the script file, googleContentScript.js.
  - if no text is selected, display "No text selected" error as usual
  - if text is selected, but isn't obviously a link (like "ABC"), the link button is clicked and open for user to input their own link.
  - if the link is obviously a link (http://www.google.com), the text is automatically transformed into a link.
  - note how this behavior is different from the default turnSelectionIntoLink on other webpages: in those cases, Voice opens up a new browser tab to the link. [ee6446b](https://github.com/mozilla/firefox-voice/commit/ee6446b)
- Add optional audio saving to history. Fixes [#1760](https://github.com/mozilla/firefox-voice/issues/1760) [c7c19c3](https://github.com/mozilla/firefox-voice/commit/c7c19c3)

## Version 0.21.0 (2020-06-22)

- Music service volume_followup, also ([#1536](https://github.com/mozilla/firefox-voice/issues/1536)) (from [farhatcode](https://github.com/farhatcode))
  This PR adds youtube, soundcloud and deezer volume controls to be handled as numbers or percentages (1-100) as suggested. Along with some code improvements to my previous code.
  I am dealing numbers and percents as alias to keep things simple.
  Also. Fixes [#1501](https://github.com/mozilla/firefox-voice/issues/1501) Fixes [#1501](https://github.com/mozilla/firefox-voice/issues/1501) [7ac40e9](https://github.com/mozilla/firefox-voice/commit/7ac40e9)
- Extend 1481 ([#1743](https://github.com/mozilla/firefox-voice/issues/1743))
  - Added select all the tabs
  - Added select tabs to the right/left
  - Added select first/last three tabs (any number of tabs) [4f491dd](https://github.com/mozilla/firefox-voice/commit/4f491dd)
- Fixes 1644 error when making note when not content editable [d480cde](https://github.com/mozilla/firefox-voice/commit/d480cde)
- Fixed a display issue with timer when feedback card appeared (after followups were merged, there were 2 feedback cards). Added the follow-up functionality for reset and close; Now, the user can say "close timer" within 5 seconds of the input command (as long as the followup stays awake), or when the timer finished, "reset | reset timer". Fixes [#1392](https://github.com/mozilla/firefox-voice/issues/1392) Fixes [#1392](https://github.com/mozilla/firefox-voice/issues/1392) [ce63f13](https://github.com/mozilla/firefox-voice/commit/ce63f13)
- Firefox Voice is can use different site-specific searches using the current tab as context. Fixes [#841](https://github.com/mozilla/firefox-voice/issues/841) [c460be3](https://github.com/mozilla/firefox-voice/commit/c460be3)
- Remember search context ([#1291](https://github.com/mozilla/firefox-voice/issues/1291)) (from [farhatcode](https://github.com/farhatcode))
  Considers 3 cases for navigation.serviceSearch :
  1. supported service + serviceName mentioned e.g. "search amazon for X"
  2. supported service + reference of active tab | site used (serviceName not mentioned) e.g. "search here | this tab for Y"
  3. unsupported service e.g. open bing.com, say "search for news here"
     Fixes [#841](https://github.com/mozilla/firefox-voice/issues/841) [de99777](https://github.com/mozilla/firefox-voice/commit/de99777)
- Add simpcyclassy, danielamormocea, and jofish as core contributors (and ignore them in changelog) [c63dfb6](https://github.com/mozilla/firefox-voice/commit/c63dfb6)
- added mic selector preference ([#1714](https://github.com/mozilla/firefox-voice/issues/1714)). Fixes [#1672](https://github.com/mozilla/firefox-voice/issues/1672) Fixes [#1672](https://github.com/mozilla/firefox-voice/issues/1672) [267fc7f](https://github.com/mozilla/firefox-voice/commit/267fc7f)
- When alarm finishes play audio twice ([#1713](https://github.com/mozilla/firefox-voice/issues/1713)). Fixes [#1549](https://github.com/mozilla/firefox-voice/issues/1549) [ee1b40e](https://github.com/mozilla/firefox-voice/commit/ee1b40e)
- Followup feature had disabled settings/feedback. Fixes [#1473](https://github.com/mozilla/firefox-voice/issues/1473) [26bc3a0](https://github.com/mozilla/firefox-voice/commit/26bc3a0)
- Add down arrow scroll. Fixes [#1706](https://github.com/mozilla/firefox-voice/issues/1706) [f3f0c4f](https://github.com/mozilla/firefox-voice/commit/f3f0c4f)
- Added mute/unmute music in spotify (from [Ishakikani9117](https://github.com/Ishakikani9117)) [0da15a2](https://github.com/mozilla/firefox-voice/commit/0da15a2)
- Changed just Missing Host Permission Error for a more user-friendly one. Fixes [#1609](https://github.com/mozilla/firefox-voice/issues/1609) Fixes [#1609](https://github.com/mozilla/firefox-voice/issues/1609) [77f20a7](https://github.com/mozilla/firefox-voice/commit/77f20a7)
- Fixed scrolling behavior and styling on cards with feedback. Fixes [#1685](https://github.com/mozilla/firefox-voice/issues/1685) [1b1372f](https://github.com/mozilla/firefox-voice/commit/1b1372f)
- Add 'search name on firefox/mozilla add-ons'. Fixes [#1222](https://github.com/mozilla/firefox-voice/issues/1222) [7b51c7a](https://github.com/mozilla/firefox-voice/commit/7b51c7a)
- Add 'bookmark this in [folder]' intent. This does a fuzzy search for the folder [a8a6904](https://github.com/mozilla/firefox-voice/commit/a8a6904)
- Add 'close dialog' intent. This attempts to find a floating dialog (usually an annoying dialog) and click the close button [7eb7b4d](https://github.com/mozilla/firefox-voice/commit/7eb7b4d)
- Allow 'follow' intent to target a button or button-like element [ea94a4f](https://github.com/mozilla/firefox-voice/commit/ea94a4f)
- Add email intents and services. This adds an intent to compose an email, with an optional subject and to address, and optionally based on the current page. Also the service framework is extended for email providers, and a gmail provider added. Not much functionality around those providers yet. [aff7660](https://github.com/mozilla/firefox-voice/commit/aff7660)
- Add performance logging. This commit doesn't add any logging, but it does add the functions used for logging, and a page to display the information. Fixes [#1667](https://github.com/mozilla/firefox-voice/issues/1667) [0c241cb](https://github.com/mozilla/firefox-voice/commit/0c241cb) [f2c4b49](https://github.com/mozilla/firefox-voice/commit/f2c4b49)
- Reuse settings page ([#1579](https://github.com/mozilla/firefox-voice/issues/1579)) (from [farhatcode](https://github.com/farhatcode)). Fixes [#1576](https://github.com/mozilla/firefox-voice/issues/1576) [0425852](https://github.com/mozilla/firefox-voice/commit/0425852)
- Fixed white border on the right side of the black feedback background ([#1546](https://github.com/mozilla/firefox-voice/issues/1546)) (from [rohanharikr](https://github.com/rohanharikr))
- Search openstreetmap for london" command makes a google search ([#1472](https://github.com/mozilla/firefox-voice/issues/1472))
  - added openstreetmap to searchService
  - open and search. Fixes [#1421](https://github.com/mozilla/firefox-voice/issues/1421) Fixes [#866](https://github.com/mozilla/firefox-voice/issues/866) [dd41a62](https://github.com/mozilla/firefox-voice/commit/dd41a62)
- Timer controls 'cancel', 'pause', and 'reset' ([#1464](https://github.com/mozilla/firefox-voice/issues/1464))
  - set timer control for 'cancel', 'pause' or 'reset'
  - set cancelIntent to stop timer when timer active
  - timer control cancel
  - make timer word optional. Fixes [#1439](https://github.com/mozilla/firefox-voice/issues/1439) [efd0da8](https://github.com/mozilla/firefox-voice/commit/efd0da8)
- Format fixes[#1322](https://github.com/mozilla/firefox-voice/issues/1322) [574c546](https://github.com/mozilla/firefox-voice/commit/574c546)

## Version 0.20.0 (2020-05-19)

- Implement new two-step opt-in flow. Fixes [#1656](https://github.com/mozilla/firefox-voice/issues/1656) [5b6b4e0](https://github.com/mozilla/firefox-voice/commit/5b6b4e0)
- Change pocket to use a simple tab opening add flow
  This opens `getpocket.com/save?url=...` - this removes the bookmarklet approach. The bookmarklet seems to not pick up the login status currently. [391fe27](https://github.com/mozilla/firefox-voice/commit/391fe27)
- Add some pocket-related phrases [ffd77cb](https://github.com/mozilla/firefox-voice/commit/ffd77cb)
- Ensure sentry reports aren't sent if user has disabled Telemetry [243349d](https://github.com/mozilla/firefox-voice/commit/243349d)
- Catch errors when switching to reader mode [9da0490](https://github.com/mozilla/firefox-voice/commit/9da0490)
- Always open the preferences in a new tab. Previously when you went to Tools > Add-ons and opened the preferences, the prefs would be in an iframe, and didn't fit well [c4d298c](https://github.com/mozilla/firefox-voice/commit/c4d298c)
- Small amendments to [#1622](https://github.com/mozilla/firefox-voice/issues/1622) and [#1613](https://github.com/mozilla/firefox-voice/issues/1613) [d467bfa](https://github.com/mozilla/firefox-voice/commit/d467bfa)
- Update options page data collection preference language. Fixes [#1613](https://github.com/mozilla/firefox-voice/issues/1613) [85cf6d1](https://github.com/mozilla/firefox-voice/commit/85cf6d1)
- Update onboarding opt-in content. Fixes [#1612](https://github.com/mozilla/firefox-voice/issues/1612) [acda0c1](https://github.com/mozilla/firefox-voice/commit/acda0c1)
- Retry loading script if it fails
  This is based on the idea that probably the script was loaded part-way through a page reload (maybe a second page reuse), and doing one retry should at least help the issue. Fixes [#1482](https://github.com/mozilla/firefox-voice/issues/1482) [40fad10](https://github.com/mozilla/firefox-voice/commit/40fad10)
- Display message instead of internal error for saveaspdf (from [farhatcode](https://github.com/farhatcode))
  ([#1551](https://github.com/mozilla/firefox-voice/issues/1551))
- [alias] "view bookmarks sidebar" now displays bookmark (from [Simpcyclassy](https://github.com/Simpcyclassy))
  sidebar ([#1553](https://github.com/mozilla/firefox-voice/issues/1553))
  - View bookmarks sidebar
  - make first matching utterance optional
  - add alias for create bookmark
  - bookmark open pluralization to be in braces. Fixes [#1552](https://github.com/mozilla/firefox-voice/issues/1552) [f359a9c](https://github.com/mozilla/firefox-voice/commit/f359a9c)
- Add audio onboarding
  This includes both transcript and audio opt-in, and chooses which one to ask for based on the presence of an installation page. Fixes [#1149](https://github.com/mozilla/firefox-voice/issues/1149) [e080c62](https://github.com/mozilla/firefox-voice/commit/e080c62)
- Show zero volume error
  Also don't worry about whether the user has used an utterance, as this error can occur after previous successful use. Fixes [#1125](https://github.com/mozilla/firefox-voice/issues/1125) [2f92d26](https://github.com/mozilla/firefox-voice/commit/2f92d26)
- Add alias for openlexicon (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#1559](https://github.com/mozilla/firefox-voice/issues/1559) [eb851a1](https://github.com/mozilla/firefox-voice/commit/eb851a1)
- Added pagination on top and bottom (from [Simpcyclassy](https://github.com/Simpcyclassy)) [1b1d007](https://github.com/mozilla/firefox-voice/commit/1b1d007)
- #1542 history visual clean up ([#1550](https://github.com/mozilla/firefox-voice/issues/1550)) (from [annlinros](https://github.com/annlinros))
  - added style changes to history UI
  - set pagination to 50 rows per page
  - added styles for delete button
  - added style changes for history UI
    Fixes [#1542](https://github.com/mozilla/firefox-voice/issues/1542) [a9bdf83](https://github.com/mozilla/firefox-voice/commit/a9bdf83)
- Added "on" and "in" keyword to `search.search` (from [awuorm](https://github.com/awuorm)) [2180703](https://github.com/mozilla/firefox-voice/commit/2180703)
- Maximize current window (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#1548](https://github.com/mozilla/firefox-voice/issues/1548) [6542e9c](https://github.com/mozilla/firefox-voice/commit/6542e9c)
- Added tooltip and confirmation for delete button (from [Simpcyclassy](https://github.com/Simpcyclassy)) [df657eb](https://github.com/mozilla/firefox-voice/commit/df657eb)
- Changed utterance to "you said.." (from [Simpcyclassy](https://github.com/Simpcyclassy)) [81fd390](https://github.com/mozilla/firefox-voice/commit/81fd390)
- Album support for Deezer ([#1460](https://github.com/mozilla/firefox-voice/issues/1460)) (from [melvin2016](https://github.com/melvin2016)). Fixes [#1424](https://github.com/mozilla/firefox-voice/issues/1424) Fixes [#1424](https://github.com/mozilla/firefox-voice/issues/1424) [320f5a5](https://github.com/mozilla/firefox-voice/commit/320f5a5)
- Adds history ui component ([#1453](https://github.com/mozilla/firefox-voice/issues/1453)) (from [michael-mml](https://github.com/michael-mml))
  - add history component
  - change database methods to static for retrieval of data
  - Add unit tests for history database API [eab1700](https://github.com/mozilla/firefox-voice/commit/eab1700)
- Open the local version of the privacy policy so that the (from [brianrhea](https://github.com/brianrhea)) resulting links to "Things you can say" and "Privacy" don't result in a 404. [108d491](https://github.com/mozilla/firefox-voice/commit/108d491)
- Futher added intent matcher for read out content (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#1367](https://github.com/mozilla/firefox-voice/issues/1367) [ad6c3dc](https://github.com/mozilla/firefox-voice/commit/ad6c3dc)
- Add add-ons example intents (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#904](https://github.com/mozilla/firefox-voice/issues/904) [8784eb5](https://github.com/mozilla/firefox-voice/commit/8784eb5)
- Doorhanger display issue when doing a "Search" command (from [vandnakapoor19](https://github.com/vandnakapoor19))
  [#1505](https://github.com/mozilla/firefox-voice/issues/1505) [3d93c3c](https://github.com/mozilla/firefox-voice/commit/3d93c3c)
- Fix "go to" and "open" commands (from [fleur101](https://github.com/fleur101)). Fixes [#1507](https://github.com/mozilla/firefox-voice/issues/1507) [9836ee9](https://github.com/mozilla/firefox-voice/commit/9836ee9)
- Clear browser history ([#1456](https://github.com/mozilla/firefox-voice/issues/1456)) (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#389](https://github.com/mozilla/firefox-voice/issues/389) [f08c9b6](https://github.com/mozilla/firefox-voice/commit/f08c9b6)
- Starting a presentation in google slides ([#1470](https://github.com/mozilla/firefox-voice/issues/1470)) (from [dave-ok](https://github.com/dave-ok))
  - add startPresentation intent [b4fa9ee](https://github.com/mozilla/firefox-voice/commit/b4fa9ee)
- [browser command] open settings / preferences (from [Simpcyclassy](https://github.com/Simpcyclassy))
  ([#1413](https://github.com/mozilla/firefox-voice/issues/1413)). Fixes [#388](https://github.com/mozilla/firefox-voice/issues/388) [ad521cd](https://github.com/mozilla/firefox-voice/commit/ad521cd)
- Adds maximize windows (from [farhatcode](https://github.com/farhatcode)). Fixes [#1488](https://github.com/mozilla/firefox-voice/issues/1488) [45d0625](https://github.com/mozilla/firefox-voice/commit/45d0625)
- Fixed previous track command ([#1454](https://github.com/mozilla/firefox-voice/issues/1454)) (from [melvin2016](https://github.com/melvin2016))
- Remove whitespace around feedback border when starting timer (from [noi5e](https://github.com/noi5e))
  ([#1452](https://github.com/mozilla/firefox-voice/issues/1452))
  remove margin:0 on body; add margin:-8px for #intent-feedback. Fixes [#1437](https://github.com/mozilla/firefox-voice/issues/1437) [b96575e](https://github.com/mozilla/firefox-voice/commit/b96575e)
- "find [query] in tabs" intent ([#1450](https://github.com/mozilla/firefox-voice/issues/1450)) (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#961](https://github.com/mozilla/firefox-voice/issues/961) [bed244f](https://github.com/mozilla/firefox-voice/commit/bed244f)
- "open my inbox" now opens gmail inbox ([#1449](https://github.com/mozilla/firefox-voice/issues/1449)) (from [Simpcyclassy](https://github.com/Simpcyclassy))
- [alias] undo closed tab ([#1448](https://github.com/mozilla/firefox-voice/issues/1448)) (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#693](https://github.com/mozilla/firefox-voice/issues/693) [f0b9517](https://github.com/mozilla/firefox-voice/commit/f0b9517)
- Fix google navigation blocking other actions ([#1446](https://github.com/mozilla/firefox-voice/issues/1446)) (from [dave-ok](https://github.com/dave-ok))
  - modify isGoogle regex test. Fixes [#1365](https://github.com/mozilla/firefox-voice/issues/1365) [e027f25](https://github.com/mozilla/firefox-voice/commit/e027f25)
- Npm/build ([#1442](https://github.com/mozilla/firefox-voice/issues/1442)) (from [IkkyOdufade](https://github.com/IkkyOdufade))
  only writes changed files into place. Fixes [#1193](https://github.com/mozilla/firefox-voice/issues/1193) [b4c1d10](https://github.com/mozilla/firefox-voice/commit/b4c1d10)
- [browser command] minimize and zoom window ([#1434](https://github.com/mozilla/firefox-voice/issues/1434)) (from [Simpcyclassy](https://github.com/Simpcyclassy))
  - zoom window command
  - minimize window command. Fixes [#1409](https://github.com/mozilla/firefox-voice/issues/1409) [ac1c2c4](https://github.com/mozilla/firefox-voice/commit/ac1c2c4)
- "Pause audio" (from [farhatcode](https://github.com/farhatcode)). Fixes [#1399](https://github.com/mozilla/firefox-voice/issues/1399) [60ea662](https://github.com/mozilla/firefox-voice/commit/60ea662)
- Fix rich text editor cursor positioning ([#1405](https://github.com/mozilla/firefox-voice/issues/1405)) (from [dave-ok](https://github.com/dave-ok))
  This PR handles string insertion for rich text editors when dictating. This is a supplement to [#1376](https://github.com/mozilla/firefox-voice/issues/1376). Fixes [#1373](https://github.com/mozilla/firefox-voice/issues/1373) [6391873](https://github.com/mozilla/firefox-voice/commit/6391873)
- 901 open sidebar ([#1404](https://github.com/mozilla/firefox-voice/issues/1404)) (from [annlinros](https://github.com/annlinros))
  - added sidebar for history and bookmarks. Fixes [#901](https://github.com/mozilla/firefox-voice/issues/901) [01d874b](https://github.com/mozilla/firefox-voice/commit/01d874b)
- [#1331](https://github.com/mozilla/firefox-voice/issues/1331) feedback not centered ([#1384](https://github.com/mozilla/firefox-voice/issues/1384)) (from [vandnakapoor19](https://github.com/vandnakapoor19))
- Corrects spotify play for new tab ([#1378](https://github.com/mozilla/firefox-voice/issues/1378)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi)). Fixes [#1339](https://github.com/mozilla/firefox-voice/issues/1339) [d01e67e](https://github.com/mozilla/firefox-voice/commit/d01e67e)
- "Create tab" should open a new tab (from [saucekode](https://github.com/saucekode)). Fixes [#1368](https://github.com/mozilla/firefox-voice/issues/1368) [d3db970](https://github.com/mozilla/firefox-voice/commit/d3db970)
- [alias] 'read out content to me' (from [saucekode](https://github.com/saucekode)). Fixes [#1367](https://github.com/mozilla/firefox-voice/issues/1367) [f0cec71](https://github.com/mozilla/firefox-voice/commit/f0cec71)
- educate developers on type input feature (from [Simpcyclassy](https://github.com/Simpcyclassy))
  ([#1330](https://github.com/mozilla/firefox-voice/issues/1330))
  - [add] popupView display texts
  - only check buildSettings.inDevelopment in developer tips. Fixes [#1188](https://github.com/mozilla/firefox-voice/issues/1188) [a4edca7](https://github.com/mozilla/firefox-voice/commit/a4edca7)
- Name page intent ([#1302](https://github.com/mozilla/firefox-voice/issues/1302)) (from [fleur101](https://github.com/fleur101))
  - implement page naming intent
  - change navigation intent to include page names [f955fae](https://github.com/mozilla/firefox-voice/commit/f955fae)
- Fix issue make format linting part of tests [#1144](https://github.com/mozilla/firefox-voice/issues/1144) ([#1249](https://github.com/mozilla/firefox-voice/issues/1249)) (from [lelouchB](https://github.com/lelouchB))
- Allow followup questions ([#1296](https://github.com/mozilla/firefox-voice/issues/1296)) (from [JM-Mendez](https://github.com/JM-Mendez))
  This PR will resolve [#962](https://github.com/mozilla/firefox-voice/issues/962) which allows listening for follow up questions.
  Requirements
  Next intent/phrase directly associated with previous intent
  - user says "search for x"
  - show search results and listen for follow up
  - user says "next result"
  - the calling intent handles the follow up [1b38e35](https://github.com/mozilla/firefox-voice/commit/1b38e35)
- Fix bug when using "next" [#1459](https://github.com/mozilla/firefox-voice/issues/1459) (from [danielamormocea](https://github.com/danielamormocea)) [aee0b4b](https://github.com/mozilla/firefox-voice/commit/aee0b4b)
- Added audio for the timer (from [Simpcyclassy](https://github.com/Simpcyclassy)) [5300a03](https://github.com/mozilla/firefox-voice/commit/5300a03)
- Fix bug [#1397](https://github.com/mozilla/firefox-voice/issues/1397) (from [danielamormocea](https://github.com/danielamormocea)) [89f1e73](https://github.com/mozilla/firefox-voice/commit/89f1e73)
- Update window.quitapplication intent (from [maitrella](https://github.com/maitrella)). Fixes [#1457](https://github.com/mozilla/firefox-voice/issues/1457) [f059605](https://github.com/mozilla/firefox-voice/commit/f059605)
- Use chrono for timer ([#1432](https://github.com/mozilla/firefox-voice/issues/1432)) (from [danielamormocea](https://github.com/danielamormocea)). Fixes [#1379](https://github.com/mozilla/firefox-voice/issues/1379) [6425074](https://github.com/mozilla/firefox-voice/commit/6425074)
- Add aliases for bookmarks and history (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#1443](https://github.com/mozilla/firefox-voice/issues/1443) [dd0c1ad](https://github.com/mozilla/firefox-voice/commit/dd0c1ad)
- [browser command] view page source ([#1425](https://github.com/mozilla/firefox-voice/issues/1425)) (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#1407](https://github.com/mozilla/firefox-voice/issues/1407) [248b6bd](https://github.com/mozilla/firefox-voice/commit/248b6bd)
- Open history command (from [Simpcyclassy](https://github.com/Simpcyclassy)) [095c09a](https://github.com/mozilla/firefox-voice/commit/095c09a)
- open bookmarks command (from [Simpcyclassy](https://github.com/Simpcyclassy)). Fixes [#373](https://github.com/mozilla/firefox-voice/issues/373) [a42568a](https://github.com/mozilla/firefox-voice/commit/a42568a)
- Fix tabs not loading properly when using routines ([#1403](https://github.com/mozilla/firefox-voice/issues/1403)) (from [dave-ok](https://github.com/dave-ok)) [8ce935c](https://github.com/mozilla/firefox-voice/commit/8ce935c)
- Doorhanger examples ([#1383](https://github.com/mozilla/firefox-voice/issues/1383)) (from [naima-shk](https://github.com/naima-shk)). Fixes [#1321](https://github.com/mozilla/firefox-voice/issues/1321) [f5cfb72](https://github.com/mozilla/firefox-voice/commit/f5cfb72)
- Long string is cut off in a negative feedback display (from [naima-shk](https://github.com/naima-shk))
  ([#1396](https://github.com/mozilla/firefox-voice/issues/1396)). Fixes [#1275](https://github.com/mozilla/firefox-voice/issues/1275) [02be837](https://github.com/mozilla/firefox-voice/commit/02be837)
- Add service volume intents
  Adds Youtube volume adjustment as per [#1095](https://github.com/mozilla/firefox-voice/issues/1095).
  Separates tab muting from audio/video muting. Already implemented muting; mutes/unmute the tab, sound vanishes but the web player's mute/unmute buttons don't reflect that. Therefore separating mute/unmute for video and music services.
  Adds new intents for music.volume, music.mute and music.unmute in music.toml
  Registers all new intents in music.js
  Adds adjustVolume(), mute() and unmute() methods in youtube.js
  Adds methods for youtube player volume control in player.js
  Removes muting the audio, video or music phrases only from muting.toml, Adds it to music.toml. Fixes [#1095](https://github.com/mozilla/firefox-voice/issues/1095) [b3da866](https://github.com/mozilla/firefox-voice/commit/b3da866)
- Reuse youtube tabs ([#1356](https://github.com/mozilla/firefox-voice/issues/1356)) (from [amandhamija98](https://github.com/amandhamija98))
  - added function to check if youtube tab is open
  - added check in createTabGoogleLucky function to use an existing youtube tab if open
  - Fixes [#397](https://github.com/mozilla/firefox-voice/issues/397) [bd3fc24](https://github.com/mozilla/firefox-voice/commit/bd3fc24)
- - copy image ([#1335](https://github.com/mozilla/firefox-voice/issues/1335)) (from [fleur101](https://github.com/fleur101)). Fixes [#1327](https://github.com/mozilla/firefox-voice/issues/1327) Fixes [#1327](https://github.com/mozilla/firefox-voice/issues/1327) [5feb5b7](https://github.com/mozilla/firefox-voice/commit/5feb5b7)
- Always opens a new tab on search intent ([#1314](https://github.com/mozilla/firefox-voice/issues/1314)) (from [shreyaa-s](https://github.com/shreyaa-s))
  - refactors openSearchTab() to always open new tab on search intent
    removes closeSearchTab() [0a24e6f](https://github.com/mozilla/firefox-voice/commit/0a24e6f)
- - added support for spotify album/playlist intent (from [melvin2016](https://github.com/melvin2016))
    ([#1293](https://github.com/mozilla/firefox-voice/issues/1293)). Fixes [#353](https://github.com/mozilla/firefox-voice/issues/353) [8a3c3e8](https://github.com/mozilla/firefox-voice/commit/8a3c3e8)
- Fix play previous youtube [#1338](https://github.com/mozilla/firefox-voice/issues/1338) (from [danielamormocea](https://github.com/danielamormocea)) [9c9186b](https://github.com/mozilla/firefox-voice/commit/9c9186b)
- Create start slideshow intent ([#1305](https://github.com/mozilla/firefox-voice/issues/1305)) (from [dave-ok](https://github.com/dave-ok)). Fixes [#1115](https://github.com/mozilla/firefox-voice/issues/1115) [964daf5](https://github.com/mozilla/firefox-voice/commit/964daf5)
- Save to pocket functionality ([#1357](https://github.com/mozilla/firefox-voice/issues/1357)) (from [annlinros](https://github.com/annlinros)). Fixes [#915](https://github.com/mozilla/firefox-voice/issues/915) [32d8d74](https://github.com/mozilla/firefox-voice/commit/32d8d74)
- Timer ([#1360](https://github.com/mozilla/firefox-voice/issues/1360)) (from [danielamormocea](https://github.com/danielamormocea))
  Implement timer. Fixes [#76](https://github.com/mozilla/firefox-voice/issues/76) [8f1f43f](https://github.com/mozilla/firefox-voice/commit/8f1f43f)
- Fix positioning of text when using "dictate" ([#1376](https://github.com/mozilla/firefox-voice/issues/1376)) (from [dave-ok](https://github.com/dave-ok))
  - fix dictated text position [0e992e6](https://github.com/mozilla/firefox-voice/commit/0e992e6)
- [alias] 'read out content to me' (from [saucekode](https://github.com/saucekode)). Fixes [#1367](https://github.com/mozilla/firefox-voice/issues/1367) [4f70523](https://github.com/mozilla/firefox-voice/commit/4f70523)
- Better fix for close window intent (from [saucekode](https://github.com/saucekode)) [b32b4c3](https://github.com/mozilla/firefox-voice/commit/b32b4c3)
- - "google for x" ([#1332](https://github.com/mozilla/firefox-voice/issues/1332)) (from [farhatcode](https://github.com/farhatcode)). Fixes [#1194](https://github.com/mozilla/firefox-voice/issues/1194) Fixes [#1194](https://github.com/mozilla/firefox-voice/issues/1194) [78aab91](https://github.com/mozilla/firefox-voice/commit/78aab91)
- Finished issue 1237 - save history ([#1303](https://github.com/mozilla/firefox-voice/issues/1303)) (from [OliviaRuyinZhang](https://github.com/OliviaRuyinZhang))
  Fix issue [#1237](https://github.com/mozilla/firefox-voice/issues/1237) - save history in IndexedDB [4e5d684](https://github.com/mozilla/firefox-voice/commit/4e5d684)
- play previous command not working for spotify (from [vandnakapoor19](https://github.com/vandnakapoor19))
  ([#1280](https://github.com/mozilla/firefox-voice/issues/1280)). Fixes [#624](https://github.com/mozilla/firefox-voice/issues/624) [a8da8ed](https://github.com/mozilla/firefox-voice/commit/a8da8ed)
- Scrape search results from bing and duckduckgo ([#1236](https://github.com/mozilla/firefox-voice/issues/1236)) (from [JM-Mendez](https://github.com/JM-Mendez))
  Scrape search results from Bing and DuckDuckGo
  Currently the only search provider that we scrape search results from is
  google. This means that although search results are displayed for Bing
  and DuckDuckGo, the user cannot navigate the results.
  This change will:
  - scrape search results from Bing and DuckDuckGo using a mix of their BEM classes and html structure.
  - throws an error if results could not be scraped. This is useful not only for engines we don't currently scrape, but in case the structure or classes are changed.
  - adds a `white-space` css value so that newlines in error messages are not collapsed. [d710d24](https://github.com/mozilla/firefox-voice/commit/d710d24)
- Deezer support ([#1287](https://github.com/mozilla/firefox-voice/issues/1287)) (from [IkkyOdufade](https://github.com/IkkyOdufade)). Fixes [#964](https://github.com/mozilla/firefox-voice/issues/964) [47b8dff](https://github.com/mozilla/firefox-voice/commit/47b8dff)
- Throw exception when no results are found for spotify "search then play" intent (from [noi5e](https://github.com/noi5e)) ([#1178](https://github.com/mozilla/firefox-voice/issues/1178))
  - put search for playerButton in try-catch block, throw error if it can't be found
  - Fixes [#557](https://github.com/mozilla/firefox-voice/issues/557) [4915923](https://github.com/mozilla/firefox-voice/commit/4915923)
- Clean up url ([#1195](https://github.com/mozilla/firefox-voice/issues/1195)) (from [annlinros](https://github.com/annlinros))
  - added cleanURl function
  - Fixes [#1059](https://github.com/mozilla/firefox-voice/issues/1059) [7c57ed5](https://github.com/mozilla/firefox-voice/commit/7c57ed5)
- turn selection into link ([#1279](https://github.com/mozilla/firefox-voice/issues/1279)) (from [JanviMahajan14](https://github.com/JanviMahajan14)). Fixes [#1109](https://github.com/mozilla/firefox-voice/issues/1109) [5061c72](https://github.com/mozilla/firefox-voice/commit/5061c72)
- Nicknames ([#1239](https://github.com/mozilla/firefox-voice/issues/1239)) (from [danielamormocea](https://github.com/danielamormocea))
  adds Nickname editing interface. Fixes [#1197](https://github.com/mozilla/firefox-voice/issues/1197) [094c708](https://github.com/mozilla/firefox-voice/commit/094c708)
- Added tab navigation ([#1225](https://github.com/mozilla/firefox-voice/issues/1225)) (from [LilyLME](https://github.com/LilyLME)).
- Updated to include revised aliases for close tab intent (from [xlisachan](https://github.com/xlisachan)) [2b09b2c](https://github.com/mozilla/firefox-voice/commit/2b09b2c)
- Close active tab alias [#1298](https://github.com/mozilla/firefox-voice/issues/1298) (from [saucekode](https://github.com/saucekode)) [4b82035](https://github.com/mozilla/firefox-voice/commit/4b82035)
- Close active tab alias (from [saucekode](https://github.com/saucekode)). Fixes [#1298](https://github.com/mozilla/firefox-voice/issues/1298) [7009a3f](https://github.com/mozilla/firefox-voice/commit/7009a3f)
- Add "find in this page" intent ([#843](https://github.com/mozilla/firefox-voice/issues/843)) [567bba0](https://github.com/mozilla/firefox-voice/commit/567bba0)
- Add error checking for drm page ([#1152](https://github.com/mozilla/firefox-voice/issues/1152)) (from [michael-mml](https://github.com/michael-mml)). Fixes [#551](https://github.com/mozilla/firefox-voice/issues/551) [bf5edf6](https://github.com/mozilla/firefox-voice/commit/bf5edf6)
- Re: [intent] count my open tabs. ([#1281](https://github.com/mozilla/firefox-voice/issues/1281)) (from [xlisachan](https://github.com/xlisachan))
  - Adds 'gather tabs' in addition to 'collect tabs'
  - Excludes hidden tabs from telemetry ping tab count. Fixes [#1267](https://github.com/mozilla/firefox-voice/issues/1267) [21e4ea3](https://github.com/mozilla/firefox-voice/commit/21e4ea3)
- Fix for almost everything except google docs (from [danielamormocea](https://github.com/danielamormocea)) [d34319e](https://github.com/mozilla/firefox-voice/commit/d34319e)
- Close window intent. (from [saucekode](https://github.com/saucekode)). Fixes [#1258](https://github.com/mozilla/firefox-voice/issues/1258) [f167ec3](https://github.com/mozilla/firefox-voice/commit/f167ec3)
- Handles exception if no search result found ([#1263](https://github.com/mozilla/firefox-voice/issues/1263)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi)). Fixes [#702](https://github.com/mozilla/firefox-voice/issues/702) [567b922](https://github.com/mozilla/firefox-voice/commit/567b922)
- Close window intent. (from [saucekode](https://github.com/saucekode)). Fixes [#1258](https://github.com/mozilla/firefox-voice/issues/1258) [c9ba609](https://github.com/mozilla/firefox-voice/commit/c9ba609)
- Fixes simultaneous playing of tabs when unpause intent is (from [shreyaa-s](https://github.com/shreyaa-s))
  given ([#1214](https://github.com/mozilla/firefox-voice/issues/1214))
  simultaneous playing of tabs when unpause intent is given. Fixes [#408](https://github.com/mozilla/firefox-voice/issues/408) [7325862](https://github.com/mozilla/firefox-voice/commit/7325862)
- Added alias for "take a screenshot of the page" (from [liumichael](https://github.com/@liumichael)) [4f7b686](https://github.com/mozilla/firefox-voice/commit/4f7b686)
- Added github bang to services toml (from [@liumichael](https://github.com/@liumichael)) [cacae5c](https://github.com/mozilla/firefox-voice/commit/cacae5c)
- [preferences] cleanup data collection section ([#1242](https://github.com/mozilla/firefox-voice/issues/1242)) (from [xlisachan](https://github.com/xlisachan))
- Fix commands not working ([#1244](https://github.com/mozilla/firefox-voice/issues/1244)) (from [melvin2016](https://github.com/melvin2016))
  Added fix for differentiating between a watchable video and user/channel - both the players in dom were colliding. Fixes [#422](https://github.com/mozilla/firefox-voice/issues/422) [616ed16](https://github.com/mozilla/firefox-voice/commit/616ed16)
- Fixes layout issue for long unbroken string ([#1252](https://github.com/mozilla/firefox-voice/issues/1252)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi))
  - break long string
  - resolves layout issue for long unbroken string
  - Fixes [#158](https://github.com/mozilla/firefox-voice/issues/158) [7ee2b37](https://github.com/mozilla/firefox-voice/commit/7ee2b37)
- Added functionalities for scroll top and scroll bottom (from [danielamormocea](https://github.com/danielamormocea)) [8ff6843](https://github.com/mozilla/firefox-voice/commit/8ff6843)
- Support sound cloud ([#1192](https://github.com/mozilla/firefox-voice/issues/1192)) (from [melvin2016](https://github.com/melvin2016))
  - added support for soundcloud as a service. Fixes [#912](https://github.com/mozilla/firefox-voice/issues/912) Fixes [#912](https://github.com/mozilla/firefox-voice/issues/912) [7dc0f89](https://github.com/mozilla/firefox-voice/commit/7dc0f89)
- Added pointer for smile/frown feedback ([#1232](https://github.com/mozilla/firefox-voice/issues/1232)) (from [nuraynab](https://github.com/nuraynab))
- Navigate to next and previous search result ([#1180](https://github.com/mozilla/firefox-voice/issues/1180)) (from [liumichael JM-Mendez](https://github.com/liumichael JM-Mendez))
  Conduct a non-mobile search using `performSearch`
  Currently making a search on a non-mobile browser uses the native
  extension javascript apis.
- Match phrase search ([#1223](https://github.com/mozilla/firefox-voice/issues/1223)) (from [tonynguyen111997](https://github.com/tonynguyen111997))
- Use activeelement on non-html pages for scrolling (from [danielamormocea](https://github.com/danielamormocea)) [a0c86c4](https://github.com/mozilla/firefox-voice/commit/a0c86c4)
- Scrolling on pdf pages (from [danielamormocea](https://github.com/danielamormocea)) [a9f85d7](https://github.com/mozilla/firefox-voice/commit/a9f85d7)
- Change fill color sad emotion to match theme ([#1212](https://github.com/mozilla/firefox-voice/issues/1212)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi)) [3dab478](https://github.com/mozilla/firefox-voice/commit/3dab478)
- Fix: open bookmark opens wrong bookmark (from [Simpcyclassy](https://github.com/Simpcyclassy)) [e0d187e](https://github.com/mozilla/firefox-voice/commit/e0d187e)
- Adds plural phrases in bookmark removal ([#1203](https://github.com/mozilla/firefox-voice/issues/1203)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi))
- Close firefox intent via experiments. ([#1156](https://github.com/mozilla/firefox-voice/issues/1156)) (from [maitrella](https://github.com/maitrella)) [c08f9d2](https://github.com/mozilla/firefox-voice/commit/c08f9d2)
- Add collect tabs intent ([#1186](https://github.com/mozilla/firefox-voice/issues/1186)) (from [danielamormocea](https://github.com/danielamormocea))
  Add collect tabs intent. [#1086](https://github.com/mozilla/firefox-voice/issues/1086)
  Added:
  1. collect these tabs - collecting similar to active tab
  2. collect [query] tabs - collecting tabs similar to query
  3. collect all tabs
  4. all of the above with "in all windows" [8d06b54](https://github.com/mozilla/firefox-voice/commit/8d06b54)
- Add what is playing intent ([#1177](https://github.com/mozilla/firefox-voice/issues/1177)) (from [annlinros](https://github.com/annlinros))
- Implement combine all windows intent ([#1181](https://github.com/mozilla/firefox-voice/issues/1181)) (from [fleur101](https://github.com/fleur101))
- Add progress indicator to save page (from [JanviMahajan14](https://github.com/JanviMahajan14)) [174ba8d](https://github.com/mozilla/firefox-voice/commit/174ba8d)
- Close selected tabs intent [6314729](https://github.com/mozilla/firefox-voice/commit/6314729)
- Open and go new tab/new window ([#1165](https://github.com/mozilla/firefox-voice/issues/1165)) (from [JanviMahajan14](https://github.com/JanviMahajan14)). Fixes [#761](https://github.com/mozilla/firefox-voice/issues/761) [100cc68](https://github.com/mozilla/firefox-voice/commit/100cc68)
- Add duckduckgo serviceSearch (from [SaumyaSinghal](https://github.com/SaumyaSinghal)) [aabfeb5](https://github.com/mozilla/firefox-voice/commit/aabfeb5)
- Submit form intent ([#1164](https://github.com/mozilla/firefox-voice/issues/1164)) (from [Manasa2850](https://github.com/Manasa2850)). Fixes issue [#1083](https://github.com/mozilla/firefox-voice/issues/1083) [a5ba519](https://github.com/mozilla/firefox-voice/commit/a5ba519)
- Add new examples to the rotation (from [ajinkabeer](https://github.com/ajinkabeer)) [b0bf1fc](https://github.com/mozilla/firefox-voice/commit/b0bf1fc)
- Open downloads window intent via experiments. ([#1155](https://github.com/mozilla/firefox-voice/issues/1155)) (from [maitrella](https://github.com/maitrella)). Fixes [#1097](https://github.com/mozilla/firefox-voice/issues/1097) [536f6e1](https://github.com/mozilla/firefox-voice/commit/536f6e1)
- Fixed smile/frown icon appears white on hover [#1140](https://github.com/mozilla/firefox-voice/issues/1140) ([#1162](https://github.com/mozilla/firefox-voice/issues/1162)) (from [lelouchB](https://github.com/lelouchB))
  update smile/frown icons. Fixes [#1140](https://github.com/mozilla/firefox-voice/issues/1140) [7035e56](https://github.com/mozilla/firefox-voice/commit/7035e56)
- Paste to notes intent ([#1130](https://github.com/mozilla/firefox-voice/issues/1130)) (from [Manasa2850](https://github.com/Manasa2850)). Fixes [#1113](https://github.com/mozilla/firefox-voice/issues/1113) [ae829bc](https://github.com/mozilla/firefox-voice/commit/ae829bc)
- Add a script that will enumerate all phrases by using the patterns [0d41209](https://github.com/mozilla/firefox-voice/commit/0d41209)
- Adds remove action to bookmark intent file ([#1137](https://github.com/mozilla/firefox-voice/issues/1137)) (from [GangaChatrvedi](https://github.com/GangaChatrvedi))
- Switch to next/previous window ([#1129](https://github.com/mozilla/firefox-voice/issues/1129)) (from [yuanyu90221](https://github.com/yuanyu90221)). Fixes [#1081](https://github.com/mozilla/firefox-voice/issues/1081) [7550ac9](https://github.com/mozilla/firefox-voice/commit/7550ac9)
- Added link page for non overridable keyboard shortcut in (from [JanviMahajan14](https://github.com/JanviMahajan14))
  setting page [7befb15](https://github.com/mozilla/firefox-voice/commit/7befb15)
- add undo close tab intent. Fixes [#1136](https://github.com/mozilla/firefox-voice/issues/1136) [c32b703](https://github.com/mozilla/firefox-voice/commit/c32b703)
- Fix description and match for tabs.moveselectedtonewwindow (from [maitrella](https://github.com/maitrella))
  intent [5afd012](https://github.com/mozilla/firefox-voice/commit/5afd012)
- search website on archive.org (from [ettoolong](https://github.com/ettoolong)). Fixes [#1110](https://github.com/mozilla/firefox-voice/issues/1110) [10403a8](https://github.com/mozilla/firefox-voice/commit/10403a8)
- Shortcut alias for nickname intents (from [Manasa2850](https://github.com/Manasa2850)) [680f247](https://github.com/mozilla/firefox-voice/commit/680f247)
- Move selected tabs to new window intent only apply for (from [maitrella](https://github.com/maitrella))
  highlighted tabs via "Ctrl" key not for tabs selected via url query. [69b5e44](https://github.com/mozilla/firefox-voice/commit/69b5e44)
- use default search provider when showing results. Fixes [#833](https://github.com/mozilla/firefox-voice/issues/833) [5346bc0](https://github.com/mozilla/firefox-voice/commit/5346bc0)
- "activate private mode" alias for open a new private window. (from [maitrella](https://github.com/maitrella)) [403d177](https://github.com/mozilla/firefox-voice/commit/403d177)
- add 'previous tab' intent. Fixes [#785](https://github.com/mozilla/firefox-voice/issues/785) [2c69911](https://github.com/mozilla/firefox-voice/commit/2c69911)
- implement tab switching intents. Fixes [#921](https://github.com/mozilla/firefox-voice/issues/921) [4e18b54](https://github.com/mozilla/firefox-voice/commit/4e18b54)
- special case pasting into about:newtab. Fixes [#867](https://github.com/mozilla/firefox-voice/issues/867) [530b644](https://github.com/mozilla/firefox-voice/commit/530b644)
- add text input and focus commands
  This adds 'enter text ...', 'focus next/previous', and 'focus [query]'. Fixes [#930](https://github.com/mozilla/firefox-voice/issues/930) [d63ca5a](https://github.com/mozilla/firefox-voice/commit/d63ca5a)
- Start [#807](https://github.com/mozilla/firefox-voice/issues/807), add confirmation messages to saving and copying [a6eb2a0](https://github.com/mozilla/firefox-voice/commit/a6eb2a0)
- Add saving of screenshots. Fixes [#71](https://github.com/mozilla/firefox-voice/issues/71) [8c3bb02](https://github.com/mozilla/firefox-voice/commit/8c3bb02)
- Go back to getting the microphone in the popup
  Behavior can be reverted with BACKGROUND=1 npm start. Fixes [#86](https://github.com/mozilla/firefox-voice/issues/86) [329de06](https://github.com/mozilla/firefox-voice/commit/329de06)
- Add intent to mute just one tab. Fixes [#911](https://github.com/mozilla/firefox-voice/issues/911) [f3e3b96](https://github.com/mozilla/firefox-voice/commit/f3e3b96)
- Support 'poop' and 'pooping' aliases for 'open'. Fixes [#1054](https://github.com/mozilla/firefox-voice/issues/1054) [c2ba5cd](https://github.com/mozilla/firefox-voice/commit/c2ba5cd)
- allow repeated words
  Note 'next next' was fixed due to adding 'next' as a stopword. Fixes [#1044](https://github.com/mozilla/firefox-voice/issues/1044) [547612d](https://github.com/mozilla/firefox-voice/commit/547612d)
- allow just 'close that' or 'close this' to close a
  tab. Fixes [#1041](https://github.com/mozilla/firefox-voice/issues/1041) [d99d4f2](https://github.com/mozilla/firefox-voice/commit/d99d4f2)
- make 'back' alone work. Fixes [#1055](https://github.com/mozilla/firefox-voice/issues/1055) [4fd5ae3](https://github.com/mozilla/firefox-voice/commit/4fd5ae3)
- test intent phrases with jest
  This also moves service metadata into .toml files, and entity types into their own module, so that it's easier to use these from tests. Fixes [#1001](https://github.com/mozilla/firefox-voice/issues/1001) [15a748d](https://github.com/mozilla/firefox-voice/commit/15a748d)
- add 'follow link' intent
  This will search all the `<a>` tags in a page, prioritize ones that are on-screen, highlight the link, and then simulate a click. Fixes [#825](https://github.com/mozilla/firefox-voice/issues/825) [bc2b34d](https://github.com/mozilla/firefox-voice/commit/bc2b34d)
- add opt-in acceptance timestamp. Fixes [#587](https://github.com/mozilla/firefox-voice/issues/587) [51619cc](https://github.com/mozilla/firefox-voice/commit/51619cc)
- keep track of audio collection pref in telemetry. Fixes [#588](https://github.com/mozilla/firefox-voice/issues/588) [d3192cb](https://github.com/mozilla/firefox-voice/commit/d3192cb)
- Use spacy stopwords (from [maitrella](https://github.com/maitrella)) [b26c080](https://github.com/mozilla/firefox-voice/commit/b26c080)
- move intent information into config files
  This moves examples, phrases, and descriptions into .toml config files alongside the intents, so they can be read without actually importing the intent code. Fixes [#885](https://github.com/mozilla/firefox-voice/issues/885) [5cee162](https://github.com/mozilla/firefox-voice/commit/5cee162)
- Modularize ([#994](https://github.com/mozilla/firefox-voice/issues/994))
  convert most files to Javascript modules
  A few modules that are used in content pages, or have other small reasons to not be a normal module, have been left as the old-style modules, globally available without importing. Everything else is a new and proper module, and the browser is handling the module loading natively (without any build step). Fixes [#993](https://github.com/mozilla/firefox-voice/issues/993) [db2ff5b](https://github.com/mozilla/firefox-voice/commit/db2ff5b)
- Enable new intent parser ([#991](https://github.com/mozilla/firefox-voice/issues/991))
  - Only apply the node transforms in the test environment
  - Add intent parser syntax of word{s} (This is effectively like an alternative, but a different spelling.)
  - Add a simple module loading shim for ECMA modules
  - fully enable new tokenizer and intent matcher
    This keeps intentParser.js's interface largely in-tact, but defers to the new modules. Some workarounds necessary to import new-style modules which are async relative to everything else. Fixes [#728](https://github.com/mozilla/firefox-voice/issues/728) [4cb79dd](https://github.com/mozilla/firefox-voice/commit/4cb79dd)
- Tokenized intent parsing ([#984](https://github.com/mozilla/firefox-voice/issues/984))
  - Start [#728](https://github.com/mozilla/firefox-voice/issues/728), using a tokenized and formal pattern matching
    This splits up words and treats them as tokens to be matched against. It handles stop words and aliases at the matching phase, instead of trying different versions of the string to handle these cases. It also tracks captured and skipped words for ranking matches, instead of having to look at the resulting matches to deduce what happened.
    This also adds Jest/Node testing for this module.
    Generally this includes:
  - Stopwords
  - Prioritization/ranking of results
  - Compiler that matches current syntax [b52b479](https://github.com/mozilla/firefox-voice/commit/b52b479)
- Full screen intent window full screen mode via windows update status (from [maitrella](https://github.com/maitrella)). [84af688](https://github.com/mozilla/firefox-voice/commit/84af688)
- Read title intent read title intent using web speech api. (from [maitrella](https://github.com/maitrella))
  Only works on Firefox desktop. [85f97c2](https://github.com/mozilla/firefox-voice/commit/85f97c2)
- Bookmark page intent (from [maitrella](https://github.com/maitrella))
  Creates a bookmark for this page, placing it in the default folder. [c6a4dee](https://github.com/mozilla/firefox-voice/commit/c6a4dee)
- Update translate intent with "selected text". (from [maitrella](https://github.com/maitrella)) [5cf7367](https://github.com/mozilla/firefox-voice/commit/5cf7367)
- Update languagecodes with google translate supported (from [maitrella](https://github.com/maitrella))
  languages. [fe50da4](https://github.com/mozilla/firefox-voice/commit/fe50da4)
- Back/forward intents (from [maitrella](https://github.com/maitrella)) [0204181](https://github.com/mozilla/firefox-voice/commit/0204181)

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

- Remove hulu service search. Fixes [#289](https://github.com/mozilla/firefox-voice/issues/289) [a52b7ae](https://github.com/mozilla/firefox-voice/commit/a52b7ae)
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
- Remove Apple Music. The search service was broken. Fixes [#277](https://github.com/mozilla/firefox-voice/issues/277) [08c785b](https://github.com/mozilla/firefox-voice/commit/08c785b)
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
