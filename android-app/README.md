# Firefox Assistant

  * [User guide](#user-guide)
    + [Enable installation of apps from unknown sources](#enable-installation-of-apps-from-unknown-sources)
    + [Install the Mozilla Assistant app](#install-the-mozilla-assistant-app)
    + [Specify your assistant](#specify-your-assistant)
    + [Using Mozilla Assistant](#using-mozilla-assistant)
  * [Developer guide](#developer-guide)
    + [Android Studio](#android-studio)
    + [Using an Emulator](#using-an-emulator)
    + [Style](#style)
    + [Testing](#testing)
    + [Generating a signed build](#generating-a-signed-build)

## User guide

We recommend opening this page (https://bit.ly/3dekxLZ) in Firefox on Android.

### Enable installation of apps from unknown sources

On older versions of Android (before Oreo), select `Settings` > `Security` (or `Lock screen and security`), then enable the switch next to `Unknown sources`.

On recent versions of Android, follow the instructions illustrated below, in the linked images, or in [this screencast](https://github.com/mozilla/firefox-voice/mozilla-assistant/blob/master/doc/unknown-sources25.gif):

   1. Open Settings and enter "unknown" in the Settings search bar ([image 1](
   https://github.com/mozilla/firefox-voice/raw/master/android-app/doc/unknown-sources1.png)).
   2. Click on "Install unknown apps" ([image 2](https://github.com/mozilla/firefox-voice/raw/master/android-app/doc/unknown-sources2.png)).
   3. Click on your browser (e.g., Firefox) ([image 3](https://github.com/mozilla/firefox-voice/raw/master/android-app/doc/unknown-sources3.png)).
   4. Enable installation of apps from unknown sources by dragging the slider right ([image 4](https://github.com/mozilla/firefox-voice/raw/master/android-app/doc/unknown-sources4.png)).
![screenshot of process of enabling installation of apps from Firefox](https://github.com/mozilla/firefox-voice/raw/master/android-app/doc/unknown-sources-recent.png)

### Install the Mozilla Assistant app

In Firefox, download the [APK (app)](https://github.com/mozilla/firefox-voice/blob/master/android-app/app/release/app-release.apk?raw=true) (by opening the link) on your Android device. Confirm that you wish to open and install it. If Firefox won't let you, use Chrome for this step. If asked if you want to enable Play Protect, decline.

### Specify your assistant

1. Open `Apps & Notifications` > `Advanced` > `Default Apps`.
2. Click on `Assist app`to open the `Assist & voice input` menu.
3. Click on `Assist app`.
4. Select `Mozilla Assistant`.

### Using Mozilla Assistant

After installation, hold down the Home button to open the app, then state your request/question, such as:

 * "Open the Washington Post."
 * "Set an alarm for 5:30."
 * "Call Julia."

## Developer guide

### Android Studio

After cloning the project:

1. Open Android Studio.
2. Select "Import project (Gradle, Eclipse ADT, etc.)"./
3. Open "firefox-voice/android-app".

This will start building the project and will notify you of anything else you need to download, which you can do through `Tools > SDK Manager`.

### Using an Emulator

Not all emulator AVDs handle speech recognition correctly. We have tested this configuration:

1. Open `Tools > AVD Manager`.
2. Click on `Create Virtual Device...`
3. For device definition, select `Pixel 2` with Play Store.
4. For system image, select Release Name `R (API Level 30)`.
5. Give it any name. I used the default "Pixel 2 API 30".
6. Open the emulator from the command line. On OS X, you can do: `~/Library/Android/sdk/emulator/emulator @Pixel_2_API_30 -dns-server 8.8.8.8 &`
7. Click on the ellipsis (...) to the right of the emulator to change its settings. ![open emulator settings](doc/emulator-options-cropped.png)
8. Select `Microphone`, then enable `Virtual microphone uses host audio input`. ![microphone settings](doc/enable-microphone.png)
9. Test that you can do a Google voice search on the emulated device.
10. In Android Studio, launch the app on the emulator by setting the shown dropdown menus to "app" and "Pixel 2 API 30" and pressing the play button. ![build settings](doc/build-settings.png)

### Style ###
We follow the style enforced by [ktlint](https://ktlint.github.io/) and [detekt](https://arturbosch.github.io/detekt/). See [how to configure Android Studio appropriately](https://github.com/pinterest/ktlint#option-1-recommended).

To check your style, run:

```
./gradlew ktlintCheck
./gradlew detekt
```

### Testing ###
You are expected to both add tests for code that you write and make sure that your changes do not
cause existing tests to fail. You can run tests in Android Studio by right-clicking on `app` in the Project Pane and selecting `Run 'All Tests'`. ![screenshot](doc/run-all-tests.png)

### Generating a signed build ###
When you change the code, you should also [build a signed APK](https://developer.android.com/studio/publish/app-signing#sign-apk). Here is a summary of the steps:

1. In Android Studio, select `Build > Generate Signed Bundle/APK...`.
2. In the wizard, select `APK`. ![image of dialog](doc/generate-signed-bundle.png)
3. Choose an existing key store or create a new one. When specifying the key store path, if you are on a Mac, you may find it helpful to press Command+Shift+. to show hidden directories. If you create a new key store and key, don't worry too much about what you enter into the `New Key Store` wizard. You can always create a new key if you need to. Android Studio will remember (but not check in) the information about the key store for the next times you build the APK. ![image of dialog](doc/new-key-store.png) ![image of dialog](doc/specify-key.png)
4. Select `release` and `V2 (Full APK Signature)` on the next dialog. ![image of dialog](doc/generate-signed-bundle.png)

If someone wants to replace an app signed by a different key, they will need to uninstall it before installing the new one.
