function getInnerText(card, selector) {
  const selectedNode = card.querySelector(selector);
  if (selectedNode) {
    return selectedNode.innerText;
  }
  return "";
}

function getSpeakableSubsetOfList(
  card,
  itemSelector,
  maxItems = 3,
  sayExactRemainder = false,
  useAttribute = ""
) {
  const listItems = card.querySelectorAll(itemSelector);
  let listItemsAsText = Array.from(listItems).map(el => {
    if (useAttribute === "") {
      return el.innerText;
    }
    return el.getAttribute(useAttribute);
  });
  listItemsAsText = listItemsAsText.filter(el => el !== ""); // get all non-empty list items as an array of their innerText or attribute containing the relevant text
  const totalNumItems = listItemsAsText.length;
  if (totalNumItems > maxItems) {
    const numRemaining = totalNumItems - maxItems;
    return `${listItemsAsText.slice(0, maxItems).join(", ")} and ${
      sayExactRemainder ? `${numRemaining} ` : ``
    }more`;
  }
  listItemsAsText.splice(-1, 0, "and");
  return `${listItemsAsText.join(", ")}`;
}

function abbreviateTextResponse(
  text,
  maxSentences = 2,
  removeParentheticals = true
) {
  const trimmedText = removeParentheticals
    ? text.replaceAll(/\([^\)]*\)/g, "")
    : text;
  const sentences = trimmedText.match(/[^\.!\?]+[\.!\?]+/g); // TODO fix for abbreviations like U.I.S.T.
  return sentences.slice(0, maxSentences).join(" ");
}

function handleBannerCards(bannerCardContainer) {
  const BANNER_CARD_ITEM_WIDE = ".rl_item"; // may be possible just to get innerText
  const BANNER_CARD_ITEM_TALL = ".klitem-tr"; // title found in aria-label of this item

  let text;
  if (bannerCardContainer.querySelector(BANNER_CARD_ITEM_WIDE)) {
    text = getSpeakableSubsetOfList(
      bannerCardContainer,
      BANNER_CARD_ITEM_WIDE,
      5,
      true
    );
  } else if (bannerCardContainer.querySelector(BANNER_CARD_ITEM_TALL)) {
    text = getSpeakableSubsetOfList(
      bannerCardContainer,
      BANNER_CARD_ITEM_TALL,
      3,
      true,
      "aria-label"
    );
  }
  return {
    text,
  };
}

function handleSnippetCard(card) {
  const SNIPPET_SOURCE_SELECTOR = "cite.iUh30"; // tricky: we would want to remove the child span within this
  const SNIPPET_BODY_SELECTOR = ".e24Kjd, .iKJnec";
  const SNIPPET_HEADER_SELECTOR = ".kno-ecr-pt, .Z0LcW"; // need to validate! this is only one type of header i've seen
  const SNIPPET_ORDERED_LIST_SELECTOR = ".X5LH0c"; // not sure about this one
  const SNIPPET_UNORDERED_LIST_SELECTOR = ".i8Z77e"; // not sure about this one
  const SNIPPET_LIST_ITEM_SELECTOR = ".TrT0Xe"; // seems to be consistent across ordered and unordered

  let source = getInnerText(card, SNIPPET_SOURCE_SELECTOR);
  source = source.replace("www.", "").replace(/ › .*/, "");

  const header = getInnerText(card, SNIPPET_HEADER_SELECTOR);
  if (header) {
    // A small subset of snippet cards seem to have a direct answer along with a longer text body
    return header;
  }
  const hasList = card.querySelector(
    `${SNIPPET_ORDERED_LIST_SELECTOR}, ${SNIPPET_UNORDERED_LIST_SELECTOR}`
  );
  if (hasList) {
    return `According to ${source}, the top results are ${getSpeakableSubsetOfList(
      card,
      SNIPPET_LIST_ITEM_SELECTOR
    )}`;
  }
  const snippetBodyText = getInnerText(card, SNIPPET_BODY_SELECTOR);
  return `According to ${source}, ${abbreviateTextResponse(snippetBodyText)}`;
}

// TODO: need to handle abbreviations for hours, avenue, road, N/S/E/W, and so on
function handleDirectionsCard(card) {
  const DIRECTIONS_SELECTOR = ".BbbuR";
  const ALIASES = {
    km: "kilometer",
    mi: "mile",
  };

  let response = getInnerText(card, DIRECTIONS_SELECTOR);
  const abbreviatedUnit = response.match(/\(\d+\.\d.(\w+)/)[1];
  const unit = ALIASES[abbreviatedUnit];
  let distance = response.match(/\((\d+\.\d)/)[1];
  distance = parseFloat(distance);

  const unitReplace = new RegExp(
    "(\\(\\d+\\.\\d.)" + abbreviatedUnit + "(\\))",
    "g"
  );

  response =
    distance === 1
      ? response.replace(unitReplace, `$1${unit}$2`)
      : response.replace(unitReplace, `$1${unit}s$2`);
  return response;
}

function handleWeatherCard(card) {
  const WEATHER_TEMPERATURE_SELECTOR = "#wob_tm";
  const WEATHER_CONDITION_SELECTOR = "#wob_dc";

  const temp = getInnerText(card, WEATHER_TEMPERATURE_SELECTOR);
  const conditions = getInnerText(card, WEATHER_CONDITION_SELECTOR);
  const response = `It's ${temp} degrees and ${conditions}`;
  return response;
}

function handleSidebarCard(card) {
  const WIKI_SIDEBAR_SELECTOR =
    ".kno-rdesc > div:nth-child(1) > span:nth-child(2)";
  const wikiResponse = getInnerText(card, WIKI_SIDEBAR_SELECTOR);

  return abbreviateTextResponse(wikiResponse);
}

function handleCalculatorCard(card) {
  const CALCULATOR_RESULT_SELECTOR = "#cwos";

  return getInnerText(card, CALCULATOR_RESULT_SELECTOR);
}

function handleUnitCard(card) {
  const UNIT_INPUT_VALUE_SELECTOR = "#HG5Seb > input:nth-child(1)"; // need to get .value
  const UNIT_INPUT_UNITS_SELECTOR = "#ssSucf > [selected]"; // need to find what is selected
  const UNIT_OUTPUT_VALUE_SELECTOR = "#NotFQb > input:nth-child(1)";
  const UNIT_OUTPUT_UNITS_SELECTOR = "#NotFQb > select > [selected]";

  const inputValue = card.querySelector(UNIT_INPUT_VALUE_SELECTOR).value;
  const inputUnits = getInnerText(card, UNIT_INPUT_UNITS_SELECTOR);
  const outputValue = card.querySelector(UNIT_OUTPUT_VALUE_SELECTOR).value;
  const outputUnits = getInnerText(card, UNIT_OUTPUT_UNITS_SELECTOR);

  const response = `${inflectValueAndUnit(
    outputValue,
    outputUnits
  )} in ${inflectValueAndUnit(inputValue, inputUnits)}`;
  return response;
}

function handleDictionaryCard(card) {
  const DICTIONARY_FIRST_DEFINITION = ".QIclbb.XpoqFe > [data-dobid] > span";
  const DICTIONARY_TERM = ".DgZBFd.XcVN5d";

  let term = getInnerText(card, DICTIONARY_TERM);
  term = term.replaceAll("·", "");
  const definition = getInnerText(card, DICTIONARY_FIRST_DEFINITION);
  const response = `${term} is ${definition}`;
  return response;
}

function handleSpellingCard(card) {
  const DICTIONARY_TERM = ".DgZBFd.XcVN5d";

  let term = getInnerText(card, DICTIONARY_TERM);
  term = term.replaceAll("·", "");
  let spelledOut = term.split("");
  spelledOut.push(" "); // Add an additional blank space such that there are trailing periods after the last letter
  spelledOut = spelledOut.join(".............."); // the "join" here is used to artificially add gaps between each letter to slow down TTS
  return spelledOut;
}

function handleTranslateCard(card) {
  const TRANSLATE_TARGET_PHRASE = "#tw-target-text > span"; // span
  const TRANSLATE_TARGET_LANGUAGE_CODE = "#tw-tl";

  const targetLanguageCode = card.querySelector(TRANSLATE_TARGET_LANGUAGE_CODE)
    .dataset.lang;
  const targetText = getInnerText(card, TRANSLATE_TARGET_PHRASE);
  return {
    text: targetText,
    language: targetLanguageCode,
  };
}

function handleSportsScoreCard(card) {
  const SPORTS_LEFTHAND_SCORE = ".imso_mh__l-tm-sc";
  const SPORTS_LEFTHAND_TEAM = ".imso_mh__first-tn-ed > .imso_mh__tm-nm";
  const SPORTS_RIGHTHAND_SCORE = ".imso_mh__r-tm-sc";
  const SPORTS_RIGHTHAND_TEAM = ".imso_mh__second-tn-ed > .imso_mh__tm-nm";

  const leftTeamName = getInnerText(card, SPORTS_LEFTHAND_TEAM);
  const leftTeamScore = parseFloat(getInnerText(card, SPORTS_LEFTHAND_SCORE));
  const rightTeamName = getInnerText(card, SPORTS_RIGHTHAND_TEAM);
  const rightTeamScore = parseFloat(getInnerText(card, SPORTS_RIGHTHAND_SCORE));
  const response =
    leftTeamScore > rightTeamScore
      ? `${leftTeamName} ${leftTeamScore}, ${rightTeamName} ${rightTeamScore}`
      : `${rightTeamName} ${rightTeamScore}, ${leftTeamName} ${leftTeamScore}`;
  return response;
}

function handleSportsGameTimeCard(card) {
  if (card.querySelector(".liveresults-sports-immersive__game-minute")) {
    return `They are currently playing. The score is ${handleSportsScoreCard(
      card
    )}`;
  }
  const SPORTS_LEFTHAND_TEAM = ".imso_mh__first-tn-ed > .imso_mh__tm-nm";
  const SPORTS_RIGHTHAND_TEAM = ".imso_mh__second-tn-ed > .imso_mh__tm-nm";
  const SPORTS_GAME_TIME = ".imso_mh__lr-dt-ds";
  const SPORTS_TEAM_OF_INTEREST = ".N0LMJe.ellipsisize";

  const leftTeamName = getInnerText(card, SPORTS_LEFTHAND_TEAM);
  const rightTeamName = getInnerText(card, SPORTS_RIGHTHAND_TEAM);
  const rawEventTimeString = getInnerText(card, SPORTS_GAME_TIME);
  const parsedEventTime = humanReadableDate(rawEventTimeString);

  if (card.querySelector(SPORTS_TEAM_OF_INTEREST)) {
    const teamInQuestion = getInnerText(card, SPORTS_TEAM_OF_INTEREST);
    const opposingTeam =
      teamInQuestion === leftTeamName ? rightTeamName : leftTeamName;
    return `${parsedEventTime} versus ${opposingTeam}`;
  }

  return `${leftTeamName} and ${rightTeamName} play ${parsedEventTime}`;
}

function handleGenericCard(card) {
  const DIRECT_ANSWER_SELECTOR = ".Z0LcW, .NqXXPb, .XcVN5d";
  const DATETIME_SELECTOR = ".t51gnb";
  const HOURS_SELECTOR = ".TLou0b";
  const DAY_SELECTOR = ".zCubwf";
  const INTERACTIVE_GRAPH_SELECTOR = ".ayqGOc.kno-fb-ctx.KBXm4e";

  const response = getInnerText(
    card,
    `${DIRECT_ANSWER_SELECTOR}, ${DATETIME_SELECTOR}, ${HOURS_SELECTOR}, ${DAY_SELECTOR}, ${INTERACTIVE_GRAPH_SELECTOR}`
  );
  return response;
}

function inflectValueAndUnit(value, unit) {
  const IRREGULAR_PLURALIZATIONS = {
    foot: "feet",
    inch: "inches",
    hertz: "hertz",
    torr: "torr",
    celsius: "celsius",
    fahrenheit: "fahrenheit",
    kelvin: "kelvin",
    century: "centuries",
  };

  let adjustedUnit = unit;
  if (parseFloat(value) !== 1) {
    const irregularPluralForm = IRREGULAR_PLURALIZATIONS[unit.toLowerCase()];
    adjustedUnit = irregularPluralForm ? irregularPluralForm : `${unit}s`;
  }
  return `${value} ${adjustedUnit}`;
}

function humanReadableDate(rawDate) {
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let eventStringParts = rawDate.split(", ");
  if (eventStringParts.length === 3) {
    // Specifies a day of the week and date (e.g. Tue, 6/16)
    let dayOfWeek = eventStringParts[0];
    let monthAndDay = eventStringParts[1];
    const timeOfEvent = eventStringParts[3];
    dayOfWeek = `${dayOfWeek}${dayOfWeek === "Sat" ? `urday` : `day`}`;
    monthAndDay = monthAndDay.split("/");
    let month = monthAndDay[0];
    const day = monthAndDay[1];
    month = MONTH_NAMES[parseInt(month) - 1];
    eventStringParts = [dayOfWeek, month, day, timeOfEvent];
  }
  eventStringParts.splice(-1, 0, "at"); // insert "at" right before the time
  eventStringParts = eventStringParts.join(" ");
  return eventStringParts;
}

export function getSpeechForCard(card) {
  const CARD_TYPE_SELECTORS = {
    WEATHER: "#wob_wc",
    DIRECTIONS: ".BbbuR",
    SNIPPET: ".c2xzTb",
    UNIT: "select.rYVYn",
    CALCULATOR: "#cwmcwd",
    DICTIONARY: ".zbA8Me.gJBeNe.vSuuAd.i8lZMc",
    SPELLING: ".DgZBFd.XcVN5d", // will also match the dictionary, so ordering matters
    TRANSLATE: "#tw-container",
    SIDEBAR: ".kno-rdesc > div:nth-child(1) > span:nth-child(2)",
    SPORTS_SCORE: ".imso_mh__l-tm-sc",
    SPORTS_GAME_TIME: "#sports-app", // has to be last because this will also match the score type
  };

  const parentCard = card.parentNode;
  let text;
  let language;
  let cardType;

  const BANNER_CARD_SELECTOR = "#botabar";
  const bannerCardContainer = document.querySelector(BANNER_CARD_SELECTOR);
  if (bannerCardContainer) {
    return handleBannerCards(bannerCardContainer); // We don't currently show banner-type cards within the popup, and there may be searches that yield both banner cards and sidebar cards.
  }

  for (const [type, tag] of Object.entries(CARD_TYPE_SELECTORS)) {
    if (parentCard.querySelectorAll(tag).length) {
      cardType = type;
      break;
    }
  }

  switch (cardType) {
    case "WEATHER":
      text = handleWeatherCard(card);
      break;
    case "DIRECTIONS":
      text = handleDirectionsCard(card);
      break;
    case "SIDEBAR":
      text = handleSidebarCard(card);
      break;
    case "SNIPPET":
      text = handleSnippetCard(card);
      break;
    case "UNIT":
      text = handleUnitCard(card);
      break;
    case "CALCULATOR":
      text = handleCalculatorCard(card);
      break;
    case "DICTIONARY":
      text = handleDictionaryCard(card);
      break;
    case "SPELLING":
      text = handleSpellingCard(card);
      break;
    case "TRANSLATE":
      const translationData = handleTranslateCard(card);
      text = translationData.text;
      language = translationData.language;
      break;
    case "SPORTS_SCORE":
      text = handleSportsScoreCard(card);
      break;
    case "SPORTS_GAME_TIME":
      text = handleSportsGameTimeCard(card);
      break;
    default:
      text = handleGenericCard(card);
  }

  return { text, language };
}
