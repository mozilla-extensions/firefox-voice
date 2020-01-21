#!/bin/bash
# Note, this script is run on our servers to update the XPI
# It is not runnable from the repository

set -e

source ./xpi-config.sh

mkdir -p tmp-xpi/dev tmp-xpi/dev-android tmp-xpi/stage tmp-xpi/prod

echo "Fetching $CIRCLECI_URL"
curl -s $CIRCLECI_URL | python3 -c '
import sys, json, os
import urllib.request
artifacts = json.load(sys.stdin)
if not artifacts:
    print("No files in last update")
for item in artifacts:
    path = item["path"]
    url = item["url"]
    filename = "tmp-xpi/" + "/".join(path.split("/")[-2:])
    url_filename = filename + ".url"
    if os.path.exists(url_filename):
        with open(url_filename) as fp:
            old_url = fp.read()
            if url == old_url:
                print("File not updated:", filename)
                continue
    with open(url_filename, "w") as fp:
        fp.write(url)
    with urllib.request.urlopen(url) as fp:
        out = open(filename, "wb")
        content = fp.read()
        out.write(content)
        print("Wrote:", filename, "bytes:", len(content))
'

update_public_log() {
    channel="$1"
    version="$2"
    git_commit="$3"
    date="$(TZ=America/Los_Angeles date +"%Y-%m-%d %I:%M%p %Z")"
    message="Updated $channel to $version at ${date} see https://github.com/mozilla/firefox-voice/commit/$git_commit"
    echo "$message" >> public-update-log.txt
    sudo cp public-update-log.txt $RELEASES/public-update-log.txt
}

version=unknown

for channel in dev dev-android stage prod ; do
    new_xpi="tmp-xpi/$channel/firefox-voice.xpi"
    signed_xpi="${new_xpi}.signed"
    old_xpi="${new_xpi}.old"
    autograph_url="$AUTOGRAPH_PROD_URL"
    autograph_key="$AUTOGRAPH_PROD_KEY"
    if [[ -e $new_xpi ]] ; then
        if [[ -e $old_xpi ]] ; then
            # Now we check if it's a new file
            if cmp --silent $old_xpi $new_xpi ; then
                echo "$new_xpi is not new"
                continue
            fi
        fi
        curl -s -F "input=@$new_xpi" \
            -o $signed_xpi \
            -H "Authorization: $autograph_key" \
            "$autograph_url"
        echo curl -s -F "input=@$new_xpi" \
            -o $signed_xpi \
            -H "\"Authorization: $autograph_key\"" \
            "$autograph_url"

    version="$(unzip -p $new_xpi manifest.json | python3 -c 'import sys, re; print(re.search("\"version\":\\s+\"(.*?)\"", sys.stdin.read()).group(1))')"
    git_commit="$(unzip -p $new_xpi buildSettings.js | python3 -c 'import sys, re; print(re.search("gitCommit:\\s+\"(.*?)\"", sys.stdin.read()).group(1))')"
	sudo cp $signed_xpi $RELEASES/$channel/firefox-voice.xpi
	sudo cp tmp-xpi/$channel/updates.json $RELEASES/$channel/updates.json
	cp $new_xpi $old_xpi
	echo "Updated channel $channel"
	update_public_log "$channel" "$version" "$git_commit"
    fi
done
