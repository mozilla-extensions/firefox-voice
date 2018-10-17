#!/bin/bash

set -ex
scriptdir=$(dirname $(readlink -f "$0"))

npm install

# Generate changelog for extension
"${scriptdir}/../node_modules/.bin/md2html" \
  "${scriptdir}/../CHANGELOG.md" > "${scriptdir}/../extension/CHANGELOG.html"

if [[ -z $TESTPILOT_AMO_USER || -z $TESTPILOT_AMO_SECRET ]]; then
  echo "No vars set. skipping build..."
  exit 1
else
  rm -f ./web-ext-artifacts/*.xpi
  ./node_modules/.bin/web-ext sign \
    --source-dir extension \
    --api-key $TESTPILOT_AMO_USER \
    --api-secret $TESTPILOT_AMO_SECRET
  mv ./web-ext-artifacts/*.xpi ./signed-addon.xpi
fi

