# Firefox Voice architecture

As of August 1st 2019, these are notes on a proposed architecture (not yet implemented).

## Components

The basic components:

- The background process, which acts as a hub
  - Background process also listens for the event which launches the experience (i.e., button and keyboard shortcut)
  - Probably background process handles submitting telemetry, and collecting telemetry until the submission
    - Listener and intents can both add information to telemetry
      - New information overwrites old information, no special conflict detection
- The listener/transcriber interface
  - This is the thing that gets opened by the background process
    - Technically the "launcher" belongs to this component, and runs in the background process
  - It's initiated by the background process
  - It needs to know about all the intents:
    - To suggest things
    - To parse intents
  - It records or allows for typing input
  - It is responsible for sending this information to any external service
  - It handles any microphone permission issues
- Onboarding / permissions
  - Part of the listener, but we need some special logic around this
  - This handles getUserMedia, since that's how we'll notice that we need permissions
  - We should probably also have an onboarding flag, since we know we'll need something on first run before we even call getUserMedia
- Intents
  - It receives a parsed intent from the listener
    - The listener will probably be open at this stage
  - Intents should have a globally-unique string identifier
  - It can report an error to the listener, who has the responsibility of showing the error
    - Maybe? With the separate tab interface we might _have_ to close the listener to do some actions
    - But intents should have a formal interface for errors and progress
  - It does stuff, of course
  - It tells the background process when it finishes
  - Maybe the background process should receive the intent from the listener, then call the intent?
  - The intent has to declare when it is finished, so telemetry ping can be sent
  - Maybe the intent should be an abstract base class
- History storage
  - Probably runs in the background page
  - Should use IndexedDB
  - Communicates with some page(?) to show history
- Options page
  - Pretty minimal
  - Actual options stored in the background process

## Data flow:

- When one component "owns" some data, it will typically send a complete or subset of that data to another component. When there is any update, it resends the entire thing
  - Updates happen via messages into the component
- Messages try to be directed to the right process
- Every message has a "type" property. Ideally these types will be globally unique (i.e., _don't_ rely on sending the message to the right location, if it might be treated incorrectly as a valid message to a different receiver)

## Intent parsing:

- The hard part is we need to know all the intents in order to create the model
- We should include the example utterances with the intents somehow
- Maybe each intent should be a subdirectory, and there should be a .yaml file
  - Probably we should have some test data as well: examples and how we want them parsed. This will be useful if we need to compare intent parsers.
- A script should put all these files together and build the parser. The script should process them all in some predictable order so it's repeatable.
- We'll need to "deploy" these somewhere. That might be locally for local development of a new intent.
- Maybe we should allow uploading some single JSON file. The JSON file could be sha-hashed, and then we could put the hash in the add-on, and then the server will use the appropriate one. There's security issues here, of course, though it's not terrible due to the add-on having the hash.
- Local JavaScript intent parsing would be really nice, but probably not available anytime soon.

## Modules:

- Almost everything uses ECMA JavaScript modules
- There's a couple old-style modules that are used from multiple contexts: `log.js`, `catcher.js`, and `buildSettings.js`
- Jest tests `*.test.js` use Node `require()`, but can load new-style modules
