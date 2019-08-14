this.intentParser = (function() {
  const exports = {};

  const DEFAULT_INTENT = "search";
  const DEFAULT_SLOT = "query";

  // TODO: make these part of intent registration
  const INTENTS = {
    /*
    alexa: {
      matches: [
        /(?:ok |okay |o.k. |hey )?\balexa\b(.*)/i,
      ],
    },
    googleAssistant: {
      matches: [
        /(?:ok|okay|o.k.|hey) google (.*)/i,
      ],
    },
    */
    find: {
      matches: [
        /(?:(?:find|bring me to)\s?(?:my|the)?)\s?((?:(?=tab).*)|(?:.*(?=tab)))/i,
      ],
      slots: ["query"],
    },
    navigate: {
      matches: [
        /(?!.*tab.*)(?:(?:bring me|go|navigate) to|open|find|show me)\s(.*)/i,
      ],
      slots: ["query"],
    },
    unmute: {
      matches: [/\bunmute\b/i],
    },
    mute: {
      matches: [
        /(?:mute|turn off)\s?(?:whatever is )?(?:playing|all)?\s?(?:the )?(?:music|audio|sound|everything)?|^quiet$|^shut up$|^stop$/i,
      ],
    },
    /*
    weather: {
      matches: [
        /(?:(?:what's the |what is the )?(weather|forecast|temperature) (?:in |for )?(.*))|(?:(.* weather))/i,
      ],
      slots: ["place"],
    },
    */
    /*
    timer: {
      matches: [
        /(?:(?:set |start )(?:a )?timer (.*))|(.*) timer/i,
      ],
      slots: ["time", "time"],
    },
    */
    play: {
      matches: [/(?:play(.*))/i],
      slots: ["query"],
    },
    pause: {
      matches: [/^pause$/i],
    },
    read: {
      matches: [
        /^read(?:.*)$/i,
        /^read(?:this )tab$/i,
      ],
    },
    amazonSearch: {
      matches: [/search (?:for )?(?:a |an )?(.*) on amazon/i],
      slots: ["query"],
    },
    bangSearch: {
      matches: [
        /(?:do a )?(?:search (?:my |on |for )?|query |find(?: me)? |look up |lookup |look on |look for )(google slides|google docs|spotify|goodreads|mdn|coursera|google scholar|google drive|calendar|google calendar)(?: for (?:the )?)?(.*)/i,
      ],
      slots: ["service", "query"],
    },
    bangSearchAlt: {
      matches: [
        /(?:do a )?(?:(?:search (?:my |on |for )?|query |find(?: me)? |look up |lookup |look on |look for )(?:the )?)(.+) on (google slides|google docs|spotify|goodreads|mdn|coursera|google scholar|google drive|calendar|google calendar)/i,
      ],
      slots: ["query", "service"],
    },
    search: {
      matches: [
        /(?:do a )?(?:search |query |find(?: me)? |google |look up |lookup |look on |look for )(?:google |the web |the internet )?(?:for )?(.*)(?:on the web)?/i,
      ],
      slots: ["query"],
    },
  };

  exports.parse = function parse(text) {
    text = text.trim().toLowerCase();
    for (const name in INTENTS) {
      for (const regexp of INTENTS[name].matches) {
        const match = regexp.exec(text);
        if (match) {
          const slots = {};
          const slotDefs = INTENTS[name].slots || [];
          for (let i = 0; i < slotDefs.length; i++) {
            if (match[i + 1]) {
              slots[slotDefs[i]] = match[i + 1];
            }
          }
          return {
            name,
            slots,
            regexp,
            text,
          };
        }
      }
    }
    return {
      name: DEFAULT_INTENT,
      slots: { [DEFAULT_SLOT]: text },
      text,
    };
  };

  return exports;
})();
