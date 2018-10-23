#!/bin/bash

set -ex

# Generate changelog for extension
scriptdir=$(dirname "$0")
"${scriptdir}/../node_modules/.bin/md2html" \
  "${scriptdir}/../CHANGELOG.md" > "${scriptdir}/../extension/CHANGELOG.html"

# Copy in scripts from node modules
mkdir -p "${scriptdir}/../extension/vendor"
cp \
  "${scriptdir}/../node_modules/bodymovin/build/player/bodymovin.min.js" \
  "${scriptdir}/../extension/vendor/bodymovin.js"
cp \
  "${scriptdir}/../node_modules/testpilot-ga/dist/index.js" \
  "${scriptdir}/../extension/vendor/testpilot-ga.js"
cp \
  "${scriptdir}/../node_modules/webrtcvad_js/webrtc_vad.js" \
  "${scriptdir}/../extension/vendor/webrtc_vad.js"
