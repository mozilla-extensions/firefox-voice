#!/usr/bin/env bash

if [[ ! -d gh-pages ]] ; then
  echo "You must create the gh-pages subdirectory. Try:"
  echo "  git clone -b gh-pages https://github.com/mozilla/firefox-voice.git gh-pages"
  exit 1
fi

for file in extension/views/lexicon.html extension/views/lexicon.css ; do
  cp $file gh-pages/
done

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
  git commit -a -m "Update static files"
  git push
else
  echo "Not committing"
fi
