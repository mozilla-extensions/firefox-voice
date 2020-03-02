#!/usr/bin/env bash

set -e

# Note: this script is used to update Porcupine from https://github.com/Picovoice/porcupine
# It does not need to be run on every build, instead we add the files to the repository

urls="
https://raw.githubusercontent.com/Picovoice/web-voice-processor/master/src/web_voice_processor.js
https://raw.githubusercontent.com/Picovoice/web-voice-processor/master/src/downsampling_worker.js
https://raw.githubusercontent.com/Picovoice/porcupine/master/binding/javascript/porcupine.js
https://raw.githubusercontent.com/Picovoice/porcupine/master/demo/javascript/scripts/porcupine_manager.js
https://raw.githubusercontent.com/Picovoice/porcupine/master/demo/javascript/scripts/porcupine_worker.js
https://raw.githubusercontent.com/Picovoice/porcupine/master/lib/wasm/pv_porcupine.js
https://raw.githubusercontent.com/Picovoice/porcupine/master/lib/wasm/pv_porcupine.wasm
"

for url in $urls ; do
  base="$(basename $url)"
  curl -s "$url" > "extension/js/vendor/porcupine/$base"
  echo "Copied $base"
done

model_names="
americano
blueberry
bumblebee
crimson
deep pink
deep sky blue
dim gray
fire brick
grapefruit
grasshopper
hey edison
hot pink
lavendar blush
lime green
magenta
midnight blue
navy blue
papaya whip
peach puff
picovoice
porcupine
sandy brown
terminator
white smoke
"

model_base="https://github.com/Picovoice/porcupine/raw/master/resources/keyword_files/wasm/americano_wasm.ppn"
IFS="
"
for name in $model_names ; do
  url="$model_base/${name}_wasm.ppn"
  out="$(basename $url)"
  curl -s $url > "extension/js/vendor/porcupine-models/$out"
  echo "Copied keyword $name"
done

npm run build:ppn-listing
