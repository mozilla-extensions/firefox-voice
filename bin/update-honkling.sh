#!/usr/bin/env bash

if [[ ! -d honkling ]] ; then
  echo "Honkling checkout not found in honkling/"
  echo "Enter to clone (^C to abort)"
  read x
  git clone --branch hey_firefox https://github.com/castorini/honkling.git honkling
  git submodule update --init --recursive
fi

(
  cd honkling
  echo
  echo "Repository information:"
  git status
  git submodule status
  echo "Everything look good? Enter to continue, ^C to abort"
  read x
)


cd honkling
dest="../extension/js/vendor-honkling/"
mkdir -p $dest
# These are roughly the files listed in view/honkling.html :
files="
common/config.js
common/util.js
honkling-models/honkling/meyda_version.js
common/precomputed/melBasis_40.js
common/precomputed/melBasis_80.js
common/precomputed/hanningWindow.js
common/inferenceEngine.js
common/micAudioProcessor.js
common/offlineAudioProcessor.js
models/speechResModel.js
lib/meyda.js
"

for file in $files ; do
  cp $file $dest
done

cd ..
echo "Honkling files copied"
