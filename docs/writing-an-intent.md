# Writing an Intent

An "intent" in Firefox Voice is some kind of command, such as "open a new tab" or "search for bananas".

You can learn most of what you need to know by looking in the [`extension/intents/`](../extension/intents/) directory.

## Terminology

**Intent:** a command that can be executed. This is the thing you write.

**Phrase:** some phrase that should be matched to your intent. An intent probably has multiple matched phrases.

**Utterance:** what the user says. This is the literal text transcription of what they said (or typed).

**Slot:** some portion of the utterance that is a wildcard or variable.

**Services:** one intent might apply to multiple services (e.g., Spotify and Amazon Music). Services are another abstraction to handle this, though this part of the project is still immature.

## How intents are discovered and loaded

A group of intents is defined in a file `extension/intents/someIntent/someIntent.js`. You'll see all these files listed in `extension/manifest.json` (and they are loaded in the [background page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts)). This file is regenerated when you call `npm start` (the auto-extension-reloading won't find new intents, you'll have to restart the browser).

Besides discovering and loading those files, there's nothing special about these files: it is the file's responsibility to call `intentRunner.register()`.

## Viewing intents

The Intent Viewer will show you all the events, and information about the intents. You can execute the command **show all intents** to open the intent viewer.

## Format of the intents

Imagine we are creating an intent `someIntent.command`.

We'll create a file (in [TOML](https://github.com/toml-lang/toml)) in `extension/intents/someIntent/someIntent.toml` to describe the intent:

```toml
[someIntent.command]
description = "A short description, really only for other developers"
match = """
  a{n} (test | example) intent
"""

[[someIntent.command.example]]
phrase = "A test intent"

[[someIntent.command.example]]
phrase = "An example intent"
test = true
```

The `match` is important (see below section), and the examples are optional. The second example is marked as a "test", and we'll test that it is matched by the match phrase, but it will not be shown to the user.

Then in `extension/intents/someIntent/someIntent.js`:

```js
import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "someIntent.command",
  async run(context) {
    // Run the command
  },
});
```

Some things to note:

- We use [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) in most of the extension (except for content scripts).
- Intents often don't actually export anything, they work by calling `intentRunner.register()`. But you can [export](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) if you want.
- We use [eslint](https://eslint.org/) in the codebase, and it's recommended you configure your editor to show warnings.
- You can (and usually will) have multiple intents in a single module and config file (e.g., `someIntent.otherCommand` and so on)

**name**: this is a unique name for the intent, the first part should match your module name. It matches the JavaScript object to the configuration file.

**description**: if you view the Intent Viewer ("show all intents") it will show these descriptions. They aren't used elsewhere.

**examples**: these are examples that will occasionally be shown to the user. Not every intent needs an example. An example with `test = true` will be shown in the Intent Viewer and used in tests, but will not be shown to the user.

**match**: there's a whole section on this below!

**run()**: also another section

## Intent matching

When you register an intent you give a number of matches. The matching is implemented in [`compiler.js`](https://github.com/mozilla/firefox-voice/blob/master/extension/background/language/compiler.js).

Each pattern is a line in the string (we use backquotes for multi-line strings). Empty lines and lines starting with `#` or `//` are ignored.

Patterns have words, words with alternatives, slots, typed slots, and parameters.

**Normal words:** any normal word is treated as a normal word. Punctuation at the end of an utterance is removed, so don't include punctuation in your matchers.

**Alternatives:** an example of alternatives is `(test | example)`. Or for example it could have been written `(a test | an example)`. This is also how _optional_ words are handled, with an empty alternative. For instance `the (best |) example` will match both `the best example` and `the example`.

**Slots:** a slot is a wildcard, and puts the matched words in a named slot. E.g., `play [query]` puts everything after "play" into `context.slots.query`. The matcher tries to put as little text as necessary into a slot, so `play [query] (on |) the radio` will match `play something on the radio` with the `something` in the slot, even though `something on` would also match.

**Typed slots:** these are things like `[service:musicServiceName]`. These "types" are lists of specific strings. These types are in the `background/entityTypes.js` module. Right now this system isn't very extensible.

**Parameters:** sometimes you care _which_ phrase is matched, not just a slot. If you include `[param=value]` then `contents.parameters.param === "value"` (if that specific phrase is matched). You can see an example in [`extensions/intents/music/music.js`](https://github.com/mozilla/firefox-voice/blob/master/extension/intents/music/music.js) in `music.move`.

### Matching an utterance to an intent

Sometimes more than one phrase will match the utterance. If more than one intent matches an utterance then Firefox Voice has to decide which one to execute.

A phrase with a smaller set of wildcard slots will be preferred. So if both `play [query] on the radio` and `play [query]` match, then the former will be preferred. A typed slot (like `[language:lang]`) gets the same preference as matching a regular word. There are some substitutions and [stopwords](https://en.wikipedia.org/wiki/Stop_words), and the intent parser will attempt to use these to create a match, but will prefer cases where they aren't required.

## Running intents

When the intent is matched, the `.run()` method is executed. The `context` argument is an instance of `IntentContext` (defined in `intentRunner.js`).

It has a `.slots` property and a `.parameters` property.

### Displaying an error

If the `.run()` method raises an exception (including an asynchronous error) then the user will see that in the popup. If it's an "expected" error (like the user is using the intent somewhere where it doesn't apply), then you can raise an exception like this:

```js
async run(context) {
  if (somethingIsWrong) {
    const e = new Error("No such element");
    e.displayMessage = "Nothing makes sense anymore!";
    throw e;
  }
}
```

There are some other methods in `IntentContext` that you might want to look into (for this, please read the source). Ideally IntentContext should be the way the intent communicates back.

### browserUtil

Also make sure you look at [`browserUtil.js`](../extension/browserUtil.js), as there are several functions there that may be useful. Usually a function exists there because there's something subtle to doing the "right" thing.

## Content scripts

Sometimes your intent will have to interact with a tab directly. There are lots of caveats to interacting with content, and we try to create a framework to make this easier.

To prepare a tab to do your custom stuff, run:

```js
async run(context) {
  const activeTab = await browserUtil.activeTab();
  await content.lazyInject(activeTab.id, "intents/someName/contentScript.js");
  // Now the script, and a bunch of helpers are available
  const resp = await browser.tabs.sendMessage(activeTab.id, {type: "doSomething"});
}
```

`content.lazyInject` will make sure the script is available and fully loaded, and will not re-load the script if called multiple times on the same tab. It also loads [`content/communicate.js`](../extension/content/communicate.js) and [`content/helpers.js`](../extension/content/helpers.js).

You can use this pattern in your script (`contentScript.js` in this example):

```js
(function() {
  communicate.register("doSomething", message => {
    // Do something, and return a value
  });
})();
```

Or maybe:

```js
(function() {
  class MyThing extends helpers.Runner {
    async action_doSomething(message) {
      const el = await this.waitForSelector(".some-element");
      ...
    }
  };
})();
```

Note you _cannot_ use JavaScript modules in content scripts.

## Logging

Use `log.info()` (debug, etc) for any logging you plan to leave in the code. `log` is a global; you don't have to import it, though you do have to use `/* globals log */` at the top of the file. `log` is available in all contexts.

If you are doing debugging, use `console.log()`. These are _not_ allowed in the code (and `npm test` will fail), but that's intentional: you should remove any debugging before committing the code, and only leave deliberate log messages.

If you want to see the inter-process communication, run `LOG_LEVEL=messaging npm start`.

## NPM scripts

NPM scripts are simply terminal commands. The npm scripts which are available to use are listed in package.json file. `enumerate-phrases` is a project specific/custom npm script.

**enumerate-phrases:** lists all the matched phrases for the specified intent using the auto-generated metadata for finding matches. This metadata is generated from all the .toml files containing intents description. 

You can execute this script as:
```js 
npm run enumerate-phrases -- someIntent.command
```
For example, Running the command `npm run enumerate-phrases -- navigation.bangSearch` lists all the matched phrases for navigation.bangSearch intent.
