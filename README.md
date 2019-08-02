# VoiceFox

VoiceFox is a an experiment from [Mozilla Research](https://research.mozilla.org/).

VoiceFox is a browser extension that allows you to give voice commands to your browser, such as "what is the weather?" or "find the gmail tab". Ultimately the goal is to see if we can facilitate meaningful user interactions with the web using just voice-based interactions. Initially the goal is to provide *any* useful interactions.

## Developing

Simple developer installation is:

```sh
npm install
npm start
```

This will launch a new Firefox browser with the extension installed. You should probably have [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/) installed.

By default this will use Firefox Nightly, but you can override this with the environmental variable `$FIREFOX` (you can point it to a release version, but some things may not work; also you can use a localized Firefox or an unbranded Firefox). You can also set `$PROFILE` to a directory where the profile information is kept (it defaults to `./Profile/`).

## Contribution

If you have an idea, the best way to start is to open an issue in this repository.

We do plan to allow extensions to add functionality (like a new voice command).
