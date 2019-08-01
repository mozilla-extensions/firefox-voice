this.parseIntent = query => {
  let matches;
  let action;

  // TEMPORARILY DISABLE GOOGLE ASSISTANT + ALEXA INVOCATIONS FOR USER TESTING
  if ((matches = query.match(/(?:ok |okay |o.k. |hey )?\balexa\b(.*)/i))) {
    action = "alexa";
  } else if ((matches = query.match(/(?:ok|okay|o.k.|hey) google (.*)/i))) {
    action = "googleAssistant";
  } else if (
    (matches = query.match(
      /(?!.*tab.*)(?:(?:bring me|go|navigate) to|open|find|show me)\s(.*)/i
    ))
  ) {
    action = "navigate";
  } else if ((matches = query.match(/\bunmute\b/i))) {
    console.debug("HEEERE");
    action = "unmute";
  } else if (
    (matches = query.match(
      /(?:mute|turn off)\s?(?:whatever is )?(?:playing|all)?\s?(?:the )?(?:music|audio|sound|everything)?|^quiet$|^shut up$|^stop$/i
    ))
  ) {
    action = "mute";
  } else if (
    (matches = query.match(
      /(?:find the (?:tab|tap|tad|todd) (?:about|with) (.*))|(?:(?:(?:bring me to|find) (?:the|my)? )?(.*) (?:tab|tap|tad|todd))/i
    ))
  ) {
    action = "find";
  } else if (
    (matches = query.match(/search (?:for )?(?:a |an )?(.*) on amazon/i))
  ) {
    action = "amazonSearch";
  } else if (
    (matches = query.match(
      /(?:do a )?(?:search |query |find(?: me)? |google |look up |lookup |look on )(?:google |the web |the internet )?(?:for )?(.*)(?:on the web)?/i
    ))
  ) {
    action = "search";
  } else if (
    (matches = query.match(
      /(?:(?:what's the |what is the )?(weather|forecast|temperature) (?:in |for )?(.*))|(?:(.* weather))/i
    ))
  ) {
    action = "weather";
  } else if (
    (matches = query.match(/(?:(?:set |start )(?:a )?(timer .*))|(.* timer)/i))
  ) {
    action = "timer";
  } else if ((matches = query.match(/(?:play(.*))/i))) {
    action = "play";
  } else {
    action = "search";
    matches = [null, query]; // a hack to put this in the expected format of the next matches line
  }

  matches = matches.slice(1).join(" "); // extract only the captured groups, flatten them into a single string

  return {
    action,
    content: matches,
  };
};
