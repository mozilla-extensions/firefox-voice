#!/usr/bin/env bash

set -e

if [[ ! -d gh-pages ]] ; then
  echo "You must create the gh-pages subdirectory. Try:"
  echo "  git clone -b gh-pages https://github.com/mozilla/firefox-voice.git gh-pages"
  exit 1
fi

cd gh-pages && git pull && cd ..

for file in extension/views/lexicon.html extension/views/lexicon.css extension/views/privacy-policy.html extension/assets/chime.ogg extension/assets/alarm.mp3 extension/assets ; do
  cp -r $file gh-pages/
done

for html in gh-pages/*.html ; do
  content="$(cat $html)"
  python -c '
import sys
sys.stdout.write(sys.argv[1].replace("../assets/", "assets/").replace("\"/assets/", "\"assets/"))
' "$content" > $html
done

(
  cd homepage
  if [[ ! -e package.json ]] ; then
    ln -s package.json.disabled package.json
  fi
  npm run maybeinstall
  npm run build
)

mkdir -p gh-pages/homepage
cp -r homepage/build/ gh-pages/homepage/


echo "Status of gh-pages/ :"
cd gh-pages
git status
msg="$(git status --porcelain)"
if [[ "$msg" = "" ]] ; then
  echo "No changes to commit"
  exit 0
fi

echo
echo "Commit and push? [y/N]"
read response
if [[ "$response" = "y" ]] ; then
  git add .
  git commit -a -m "Update static files"
  git push
else
  echo "Not committing"
fi
