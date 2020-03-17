# Installation For Development

This document contains instructions for setting up your local development environment and installing the dependencies required for contributing to the **firefox-voice** extension project. 

Depending on your operating system the sections below outline the various installation steps, however in any case you need to have Firefox [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/) installed. A release version, localized or unbranded version of Firefox will still suffice **but some things may not work**:
1. [Linux Development](#linux-development)
2. [Windows Development](#windows-development)


## Linux Development
To get started with a Linux development environment, you would need to:

1. Download the latest LTS version of [NodeJs](https://nodejs.org/) before running any of the provided npm commands.
2. Download [Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/) which is a pre-release version of Firefox that is updated every now and then just so you are developing and testing with the latest firefox features.
3. Use `tar xjvf` to extract the binaries for FireFox Nightly into a location of your choice could be `/opt/FireFoxNightly/` folder or just your download folder, wherever is fine. 
4. Let firefox-voice know where you kept the binary (firefox) for FireFox Nightly typically by running `export FIREFOX=/path/to/FireFoxNightly/firefox` and using our example location would be `export FIREFOX=/opt/FireFoxNightly/firefox`. This creates a temporary export (environment variable) called FIREFOX for your current session.

You would have to run this everytime you have a new session so you may want to look at [how to let the export stick permanently](https://stackoverflow.com/questions/13046624/how-to-permanently-export-a-variable-in-linux)


## Windows Development
On windows there are two options for installation. The first option can use virtually any version of windows which supports the latest LTS version of node (currently 12.16.1) and npm (currently 6.13.4). However, all node commands/scripts have to be run within git-bash (to provide support for unix commands). The second option is to use WSL which comes with windows 10 only, for persons who may prefer this alternative.

### Option 1 - Windows OS with Git-Bash

#### Prerequisites

1. Latest LTS version of NodeJS
2. Git and Git-bash
3. Firefox [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/)

#### Installation

Before cloning the repo, using the terminal in Git-bash:

1. Run `git config --global core.autocrlf false` to prevent git from automatically converting line endings from LF to CRLF
2. Run `npm config set script-shell "path\\to\\bash.exe"`. Point to the path where you have git-bash installed(using double backslashes). Example of path is `"C:\\Program Files\\git\\bin\\bash.exe"`. This enables npm to run linux-like commands.
3. Fork and clone the [repository](https://github.com/mozilla/firefox-voice.git)
4. To enable the npm scripts find your firefox installation, you need to create the environment variable `FIREFOX`. The easiest way to do this is to create the environment variable set to a **normalized path** using _System properties->Advanced->Environment Variables_. For example if the install path is `C:\Program Files\Firefox Nightly\firefox.exe` then **normalized path** is `/c/Program Files/Firefox Nightly/firefox.exe`. Alternatively, run `setx FIREFOX="normalized/path/to/firefox.exe"`. You can also set `$PROFILE` to a directory where the profile information is kept (it defaults to `./Profile/`). (_Note: You may need to open a new terminal to detect the new environment variable._)
5. Now run `npm install` to install dependencies
6. Run `npm start`. This will launch a new Firefox browser with the `firefox-voice` extension installed.


### Option 2 - Windows 10 using WSL

#### Prerequisites

1. Latest LTS version of NodeJS
2. Firefox [Nightly or Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/) on WSL

#### Installation

If you are using Windows and wish to use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10), you will need to setup Firefox Nightly or Developer on WSL before running `firefox-voice` using the following steps:

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
