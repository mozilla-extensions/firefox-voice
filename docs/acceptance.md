The following list reflects UI requirements this experiment must meet in order to ship in Test Pilot

## Firefox Content Pages
- [ ] It should let users use voice to conduct a search on about:home
- [ ] It should let users use voice to conduct a search on about:newtab
- [ ] It should work in all release versions of Firefox (54-56)
- [ ] It should replace the search arrow with a focusable and click-able microphone icon
- [ ] It should swap the default icon back in place if the user types the search input
- [ ] It should be trigger-able by a click or enter event on the microphone icon

## Popular SERP Pages (Google, Yahoo, DDG) [Stretch]
- [ ] It should let users conduct voice search on popular search engine pages
- [ ] It should modify the UI on these pages to include audio input similar to that on about:home and about:newtab

## Context Click UI
- [ ] It should create a context menu item for text input on appropriate fields
- [ ] It should modify the UI on these pages to include audio input similar to that on 
- [ ] It should *not* auto-submit any forms.
- [ ] It should have an explicit confirmation button to complete input into the original field

## Voice Input Panel
- [ ] It should not interfere with any underlying page content (no styles inherited in overlay from underlying page content)
- [ ] It should clearly display in UI that audio is being recorded
- [ ] It should provide continuous visual feedback as long as speech is being recorded
- [ ] it should provide an audio confirmation that a search has been completed/submitted
- [ ] It should be dismiss-able should the user want to opt out of the search
- [ ] Since our model returns multiple results, it should let users select and modify low-confidence substrings before submission.
- [ ] It should be clear that the interface is built by Firefox, and not provided by the underlying page content.
- [ ] It should have an option to automatically submit the highest confidence result and initiate a search. Note: this option should be disabled for context-click initiated searches.

## A11y
- [ ] All buttons and links should have visible focus states
- [ ] All buttons and links should be accessible via keyed entry (tab selection)
- [ ] All form elements should include appropriate label attributes
- [ ] All grouped buttons should be nested in a `<fieldset>` and described with a legend
- [ ] All UI should be verified to use A11y friendly contrast ratios
