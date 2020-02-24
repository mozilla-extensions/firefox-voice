# Firefox Voice

Firefox Voice is an experiment from [Mozilla Emerging Technologies](https://research.mozilla.org/).

Firefox Voice is a browser extension that allows you to give voice commands to your browser, such as "what is the weather?" or "find the gmail tab". Ultimately the goal is to see if we can facilitate meaningful user interactions with the web using just voice-based interactions. Initially the goal is to provide _any_ useful interactions.

## Discussion

If you have a bug or idea you want to develop, you can open a new issue in this repository. You can also submit any kind of feedback [using this feedback form](https://firefox-voice-feedback.herokuapp.com/). We are very interested in whatever feedback you have about using this tool!

If you'd like to discuss the tool, development, or contributions, we are in the `firefox-voice` channel on [chat.mozilla.org](https://chat.mozilla.org) ([direct link to channel](https://matrix.to/#/!qzDBOUrnxuFFNQRaIo:mozilla.org?via=mozilla.org)). Note that the team mostly works weekdays, North American work hours, so questions outside of that time may take a while to get a response.

## Developing

There is some documentation in the [docs/](./docs/) directory, notably [writing an intent](./docs/writing-an-intent.md).

The developer installation is:

```sh
npm install
npm start
```

This will launch a new Firefox browser with the extension installed. You should probably have [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/) installed.

By default this will use Firefox Nightly, but you can override this with the environmental variable `$FIREFOX` (you can point it to a release version, but some things may not work; also you can use a localized Firefox or an unbranded Firefox). You can also set `$PROFILE` to a directory where the profile information is kept (it defaults to `./Profile/`).

By default messaging-related logging messages aren't shown, you can turn logging up slightly with `$LOG_LEVEL=messaging` (or like `LOG_LEVEL=messaging npm start`).

Any changes you make should cause any .jsx files to be recompiled and the extension will be reloaded.

### Developing in Windows

If you are using Windows, please install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10), as the installation won't work from a normal Windows command prompt.

You will need to setup Firefox Nightly or Developer on WSL before running `firefox-voice`; use the following steps:

1. Download `firefox-nightly.tar.bz2` for Linux and move it to a folder of your choice e.g. `/opt`.
2. Extract it using `tar -xvjf firefox-*.tar.bz2` and move it to `/opt/firefox/`.
3. Download `VcXsrv` on Windows and launch it with all default settings EXCEPT access control disabled.
4. At this point, the `DISPLAY` variable is not set, so you may run into issues running GUI apps from XServer. To fix this, run `cat /etc/resolv.conf` to get the IP address of the nameserver, then run `export DISPLAY=IP_ADDRESS_OF_NAMESERVER_HERE:0`. You can also use this one-liner: `export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0`
5. Test Firefox Nightly by launching `./firefox` in the folder that you extracted the `tar.bz2`; this should open up Firefox Nightly.
6. In the `firefox-voice` repo, export the variable `FIREFOX` to point the script to your installation of firefox e.g. `export FIREFOX=/opt/firefox/firefox`.
7. Now, running `npm start` should automatically start `firefox-nightly`, however the sound/microphone might not be working.
8. Download the [PulseAudio binary for Windows](https://www.freedesktop.org/wiki/Software/PulseAudio/Ports/Windows/Support/).
9. Extract the files to any location. You should see four folders named `bin`, `etc`, `lib`, and `share`.
10. Edit the configuration files in `etc`. In `default.pa`, find the line starting with `#load-module module-native-protocol-tcp` and change it to `load-module module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1`
11. In `daemon.conf`, find the line starting with `; exit-idle-time = 20` and change it to `exit-idle-time = -1` to turn off idle timer.
12. In admin Powershell, run `pulseaudio.exe` under the `bin` folder, and keep this running.
13. Now, you will need to install PulseAudio for WSL. Uninstall any current versions of PulseAudio using `sudo apt-get purge pulseaudio`.
14. Run `sudo add-apt-repository ppa:therealkenc/wsl-pulseaudio` to add the PPA.
15. Update the sources using `sudo apt-get update`.
16. Install PulseAudio for WSL using `sudo apt install pulseaudio`.
17. In the same folder as `firefox-voices`, run `export PULSE_SERVER=tcp:IP_ADDRESS_OF_NAMESERVER_HERE`. This will allow `firefox-voices` to access the Windows sound system.

### Debugging

In Firefox Voice there are several separate processes where things run (see also [Anatomy of an extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension)):

1. The "background page". This is a persistent page that belongs to the extension, and is where most of the work is done. For debugging this specifically see [this `about:debugging` document](https://developer.mozilla.org/en-US/docs/Tools/about:debugging).
2. The popup. This is it's own page (in `extension/popup/`) and handles some of the initial lifecycle of invoking an intent. In most ways it is a normal page, but it runs in the short-lived popup. See the next section for a technique to debug this.
3. The recorder tab. This is its own pinned tab that holds the media stream (because we have to keep this open to avoid permission issues). It is its own page. You can use the normal debugging tools on it.
4. The search tab. This is also its own pinned tab that holds Google searches. It is not long-lived (each search causes it to reload), but it is specifically managed by the extension. The extension-specific code is run in content scripts, and normal debugging tools mostly work but can be finicky.
5. Other [content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts). Any page that the extension manages directly (e.g., clicking controls, reading information) has content scripts injected.

The most reliable way to debug these is with the Browser Console, which should open automatically, or you can open with **Tools > Web Developer > Browser Console**. You should change the settings on the console using the gear icon in the upper-right, and turn on **Show Content Messages** (otherwise logging from the popup and some of these other sources will not be displayed). This setting should persist.

### Debugging the popup

The popup can be hard to debug, since it disappears and there's no debugging tools. But the popup can also run in a tab. The easiest way to do this is to run:

```sh
OPEN_POPUP_ON_START=1 npm start
```

This will open the popup in a tab and reopen it whenever the extension restarts. Reloading the tab is equivalent to reopening the popup.

### Writing a new command / intent

Please see [Writing An Intent](./docs/writing-an-intent.md).

## Using in-development versions

It's possible to install and use in-development versions of the extension. Every commit to `master` is built into the dev build, and when we prepare for a release and merge to `stage` is used to create the stage build.

**NOTE THAT THESE VERSIONS INCLUDE EXTRA DATA COLLECTION**

We are using these builds for internal testing with more-than-normal data collection. We have not yet implemented data collection controls.

- [Install dev version](https://va.allizom.org/releases/dev/firefox-voice.xpi?src=github)
- [Install stage version](https://va.allizom.org/releases/stage/firefox-voice.xpi?src=github) (Note: stage isn't always updated!)
- [Install production version](https://va.allizom.org/releases/prod/firefox-voice.xpi?src=github)
- [Logs of updates](https://va.allizom.org/releases/public-update-log.txt)

The version numbers are increased for each release and each commit, but are _not_ sequential.

### Viewing Intent Information

There is an index of intents (commands) that is viewable if you open the panel, click on the gear/settings, and follow the "Intent Viewer" link.

## Developing in Android

This is very experimental, but to develop for Firefox for Android (not Fenix), install Firefox (release) on your Android device.

To try, run:

```sh
npm run start-android
```

You may see an error message `Android device ... was not found in list: ["99EAP164UC"]`: if so, then 99EAP164UC (for example) is your Android device name. Try again:

```sh
export ANDROID_DEVICE=99EAP164UC
npm run start-android
```

You might have to install `adb` and enable some permissions as well, look in the console for more instructions.

For some more information:

- This tutorial on [Developing extensions for Firefox for Android](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/)
- See the [web-ext docs](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext#testing-in-firefox-for-android) and the section "Testing in Firefox for Android"
- [How to get developer options on Android](https://www.digitaltrends.com/mobile/how-to-get-developer-options-on-android/) (to turn on USB access)

### Demo inter-process communication for Android

On Android we're experimenting with collecting voice outside Firefox and then sending the text of the command into Firefox.

For demonstration purposes only there is an option to see a URL being opened and use that as the source of an intent. To enable this set the environmental variable `$EXECUTE_INTENT_URL` to the base URL, and use `?text=...` to pass in the text. For instance:

```sh
export EXECUTE_INTENT_URL=https://mozilla.github.io/firefox-voice/assets/execute.html
npm run start-android
```

Then open `https://mozilla.github.io/firefox-voice/assets/execute.html?text=open%20tab`

While we may enable something similar on desktop, it will use a [different mechanism](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging).

## Contributing

See the [guidelines](docs/contributing.md) for contributing to this project.

This project is governed by a [Code Of Conduct](docs/code_of_conduct.md).

To disclose potential a security vulnerability please see our [security](docs/security.md) documentation.

### Contributors

<a href="https://github.com/mozilla/firefox-voice/graphs/contributors">
  <img src="https://contributors-img.firebaseapp.com/image?repo=mozilla/firefox-voice" />
</a>

Made with [contributors-img](https://contributors-img.firebaseapp.com).

## [License](/LICENSE)

This module is licensed under the [Mozilla Public License, version 2.0](/LICENSE).
