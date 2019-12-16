/* globals intentRunner, log */

this.intents.nicknames = (function() {
  this.intentRunner.registerIntent({
    name: "nicknames.name",
    description: "Names an intent",
    examples: ["Name that calendar"],
    match: `
    (name | nickname | call) (that | it | last) [name]
    give (that |) (the |) (name | nickname) [name]
    give (the |) (name | nickname) [name] to (that | it | last)
    `,
    async run(context) {
      const intents = intentRunner.getIntentHistory();
      if (!(intents[intents.length - 1] && intents[intents.length - 2])) {
        const exc = new Error("No last intent");
        exc.displayMessage = "No previous intent available to name";
        throw exc;
      }
      if (intents[intents.length - 1].name !== "nicknames.name") {
        throw new Error("Expected previous intent to be nicknames.name");
      }
      const intent = intents[intents.length - 2];
      intentRunner.registerNickname(context.slots.name, intent);
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.remove",
    description: "Removes a named intent",
    examples: ["Remove name calendar"],
    match: `
    (remove | delete) (the|) (name | nickname) (called |) [name]
    `,
    async run(context) {
      const intents = intentRunner.getRegisteredNicknames();
      const name = context.slots.name.toLowerCase();
      if (!intents[name]) {
        const exc = new Error("No named intent to remove");
        exc.displayMessage = `No nickname "${name}" found`;
        throw exc;
      }
      intentRunner.registerNickname(name, null);
    },
  });

  const numberNames = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };

  function parseNumber(n) {
    n = n.toLowerCase();
    if (numberNames[n]) {
      return numberNames[n];
    }
    const number = parseInt(n, 10);
    if (Math.isNaN(number)) {
      throw new Error(`Cannot understand number: ${n}`);
    }
    return number;
  }

  function makeCombinedContext(contexts, nickname) {
    return new intentRunner.IntentContext({
      name: "nicknames.combined",
      nickname,
      contexts,
      slots: {},
      parameters: {},
      utterance: `Combined actions named ${nickname}`,
      fallback: false,
    });
  }

  this.intentRunner.registerIntent({
    name: "nicknames.nameLast",
    description: "Combines a few intents into a name",
    examples: ["Name last three goodmorning"],
    match: `
    (name | nickname | call) last [number:smallNumber] [name]
    give (the |) last [number:smallNumber] (the |) (name | nickname) [name]
    give (the |) (name | nickname) [name] to (the |) last [number:smallNumber]
    `,
    async run(context) {
      const name = context.slots.name.toLowerCase();
      const number = parseNumber(context.slots.number);
      const history = intentRunner.getIntentHistory().slice(-number - 1, -1);
      if (history.length < number) {
        const exc = new Error("Not enough history to save");
        exc.displayMessage = `There are not ${number} things to name (there are only ${history.length})`;
        throw exc;
      }
      const newContext = makeCombinedContext(history, name);
      intentRunner.registerNickname(name, newContext);
      log.info(
        "Created combined nickname",
        name,
        "->",
        history.map(c => c.name).join(", ")
      );
    },
  });

  this.intentRunner.registerIntent({
    name: "nicknames.combined",
    description: "An intent that is only used as a memory",
    match: `
    `,
    async run(context) {
      log.info(
        `Running a named series (${context.contexts.length}) of intents`
      );
      for (let subcontext of context.contexts) {
        subcontext = new intentRunner.IntentContext(subcontext);
        log.info(
          "  Running subintent",
          subcontext,
          subcontext.name,
          subcontext.slots
        );
        let hadError = false;
        subcontext.onError = () => {
          hadError = true;
        };
        await intentRunner.runIntent(subcontext);
        if (hadError) {
          log.info("  Last intent failed, stopping");
          break;
        }
      }
    },
  });
})();
