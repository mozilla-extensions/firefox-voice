# Firefox Voice

Firefox Voice is a an experiment from [Mozilla Research](https://research.mozilla.org/).

Firefox Voice is a browser extension that allows you to give voice commands to your browser, such as "what is the weather?" or "find the gmail tab". Ultimately the goal is to see if we can facilitate meaningful user interactions with the web using just voice-based interactions. Initially the goal is to provide _any_ useful interactions.

## Developing

If you are using Windows, please install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10), as the installation won't work from a normal Windows command prompt.

The developer installation is:

```sh
npm install
npm start
```

This will launch a new Firefox browser with the extension installed. You should probably have [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/) installed.

By default this will use Firefox Nightly, but you can override this with the environmental variable `$FIREFOX` (you can point it to a release version, but some things may not work; also you can use a localized Firefox or an unbranded Firefox). You can also set `$PROFILE` to a directory where the profile information is kept (it defaults to `./Profile/`).

### Viewing Intent Information

There is an index of intents (commands) that is viewable if you open the panel, click on the gear/settings, and follow the "Intent Viewer" link.

## Contribution

If you have an idea, the best way to start is to open an issue in this repository.

We do plan to allow extensions to add functionality (like a new voice command).
