# Starting Home Page Server Locally

The firefox voice (hompepage)[https://voice.mozilla.org/firefox-voice/] is running remotely through github pages, but you can make changes to the code and view them through a (local server)[http://localhost:3000]. After cloning and installing the firefox-voice repository please do the following:

1. In your terminal, cd to the `homepage` subdirectory. So your current directory should be something like `/firefox-voice/homepage/` rather than the top-level directory
2. Run `npm install` to install dependencies specific to homepage
3. Run npm start. This will build the scripts after which is says `Serving on http://localhost:3000` go to localhost the page is listed to view locally