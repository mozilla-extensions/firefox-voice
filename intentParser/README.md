# Usage:
Install the Snips NLU Python Library (https://snips-nlu.readthedocs.io/en/latest/installation.html)
The `.yaml` file in this directory can be used to train an engine that we then feed into Rust/WASM for local parsing.

```
snips-nlu generate-dataset en firefox_voice_training.yaml > firefox_voice_dataset.json
snips-nlu train firefox_voice_dataset.json nlu_engine
```

To test the model
```
snips-nlu parse nlu_engine
```