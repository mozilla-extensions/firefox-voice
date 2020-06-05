this.tts = (function () {
  const WEATHER_SELECTOR = "#wob_wc";
  const WEATHER_TEMPERATURE_SELECTOR = "#wob_tm"; // TODO support degrees Celcius
  const WEATHER_CONDITION_SELECTOR = "#wob_dc";

  const DIRECTIONS_SELECTOR = ".BbbuR" // directly selects the first line of the directions, which is readable in full

  const DIRECT_ANSWER_SELECTOR = ".Z0LcW";

  const WIKI_SIDEBAR_SELECTOR = ".kno-rdesc > div:nth-child(1) > span:nth-child(2)";

  const SNIPPET_SELECTOR = ".c2xzTb"; // selector for the card type
  const SNIPPET_SOURCE_SELECTOR = "cite.iUh30"; // tricky: we would want to remove the child span within this
  const SNIPPET_SOURCE_BREADCRUMB_SELECTOR = "cite.iUh30 > :nth-child(1)"; // tricky: we would want to remove the child span within this
  const SNIPPET_BODY_SELECTOR = ".e24Kjd, .iKJnec";
  const SNIPPET_HEADER_SELECTOR = ".kno-ecr-pt, .Z0LcW"; // need to validate! this is only one type of header i've seen
  const SNIPPET_ORDERED_LIST_SELECTOR = ".X5LH0c"; // not sure about this one
  const SNIPPET_UNORDERED_LIST_SELECTOR = ".i8Z77e"; // not sure about this one
  const SNIPPET_LIST_ITEM_SELECTOR = ".TrT0Xe"; // seems to be consistent across ordered and unordered

  const UNIT_SELECTOR = "select.rYVYn";
  const UNIT_INPUT_VALUE_SELECTOR = "#HG5Seb > input:nth-child(1)"; // need to get .value
  const UNIT_INPUT_UNITS_SELECTOR = "#ssSucf > [selected]"; // need to find what is selected
  const UNIT_OUTPUT_VALUE_SELECTOR = "#NotFQb > input:nth-child(1)";
  const UNIT_OUTPUT_UNITS_SELECTOR = "#NotFQb > select > [selected]";

  const DATETIME_SELECTOR = ".t51gnb"; // direct answer, no modification needed
  const HOURS_SELECTOR = ".TLou0b";
  const DAY_SELECTOR = ".zCubwf";

  const INTERACTIVE_GRAPH_SELECTOR = ".ayqGOc.kno-fb-ctx.KBXm4e";

  const CALCULATOR_SELECTOR = ".bNg8Rb";
  const CALCULATOR_RESULT_SELECTOR = "#cwos";

  const DICTIONARY_FIRST_DEFINITION = ".QIclbb.XpoqFe > [data-dobid] > span";
  const DICTIONARY_TERM = ".DgZBFd.XcVN5d";

  const TRANSLATE_TARGET_PHRASE = "#tw-target-text > span"; // span 
  const TRANSLATE_TARGET_LANGUAGE_CODE = "#tw-tl";

  const SPORTS_LEFTHAND_SCORE = ".imso_mh__l-tm-sc";
  const SPORTS_LEFTHAND_TEAM = ".imso_mh__first-tn-ed > .imso_mh__tm-nm";
  const SPORTS_RIGHTHAND_SCORE = ".imso_mh__r-tm-sc";
  const SPORTS_RIGHTHAND_TEAM = ".imso_mh__second-tn-ed > .imso_mh__tm-nm";
  const SPORTS_GAME_TIME = ".imso_mh__lr-dt-ds";
  const SPORTS_TEAM_OF_INTEREST = ".N0LMJe.ellipsisize";



  const CARD_TYPE_SELECTORS = {
    WEATHER: "#wob_wc",
    DIRECTIONS: ".BbbuR",
    SNIPPET: ".c2xzTb",
    UNIT: "select.rYVYn",
    CALCULATOR: "#cwmcwd", // not entirely sure
    DICTIONARY: ".zbA8Me.gJBeNe.vSuuAd.i8lZMc",
    SPELLING: ".VpH2eb.vmod.XpoqFe", // not sure about this
    TRANSLATE: "#tw-container",
    SPORTS_SCORE: ".imso_mh__l-tm-sc", // To get scores specifically, this might work .imso_mh__scr-sep
    SPORTS_GAME_TIME: "#sports-app" // has to be last because this will also match the score type
  }

  const ALIASES = {
    directions: {
      km: "kilometer",
      mi: "mile"
    },
    irregular_pluralizations: {
      foot: "feet",
      inch: "inches",
      hertz: "hertz",
      torr: "torr",
      celsius: "celsius",
      fahrenheit: "fahrenheit",
      kelvin: "kelvin",
      century: "centuries"
    }
  }

  function getSpeakableSubsetOfList(card, maxItems = 3) {
    const listItems = card.querySelectorAll(SNIPPET_LIST_ITEM_SELECTOR);
    let listItemsAsText = Array.from(listItems).map(el => el.innerText).filter(el => el !== ""); // get all non-empty list items as an array of their inner text
    const initialLength = listItemsAsText.length;
    if (initialLength > maxItems) {
      return `${listItemsAsText.slice(0, maxItems).join(", ")} and more`;
    } else {
      return `${listItemsAsText.splice(-2, 0, "and").join(", ")}`;
    }
  }

  function abbreviateTextResponse(text, maxSentences = 2, removeParentheticals = true) {
    const trimmedText = removeParentheticals ? text.replaceAll(/\([^\)]*\)/g, "") : text;
    const sentences = trimmedText.match( /[^\.!\?]+[\.!\?]+/g );
    return sentences.slice(0, maxSentences).join(" ");
  }

  function handleSnippetCard(card) {
    let source = card.querySelector(SNIPPET_SOURCE_SELECTOR).innerText;
    const sourceDetails = card.querySelector(SNIPPET_SOURCE_BREADCRUMB_SELECTOR).innerText;
    source = source.replace(sourceDetails, "").replace("www.", "");

    const header = card.querySelector(SNIPPET_HEADER_SELECTOR);
    if (header) { // A small subset of snippet cards seem to have a direct answer along with a longer text body
      return header.innerText;
    }
    const hasList = card.querySelector(`${SNIPPET_ORDERED_LIST_SELECTOR}, ${SNIPPET_UNORDERED_LIST_SELECTOR}`);
    if (hasList) {
      return `According to ${source}, the top results are ${getSpeakableSubsetOfList(card)}`;
    }
    const snippetBodyText = card.querySelector(SNIPPET_BODY_SELECTOR).innerText;
    return `According to ${source}, ${abbreviateTextResponse(snippetBodyText)}`;
  }

  function handleDirectionsCard(card) {
    let response = card.querySelector(DIRECTIONS_SELECTOR).innerText;
    const abbreviatedUnit = response.match(/\(\d+\.\d.(\w+)/)[1];
    const unit = ALIASES["directions"][abbreviatedUnit]
    let distance = response.match(/\((\d+\.\d)/)[1];
    distance = parseFloat(distance);

    const unitReplace = new RegExp("(\\(\\d+\\.\\d.)" + abbreviatedUnit + "(\\))", "g");

    response = distance === 1 ? response.replace(unitReplace, `$1${unit}$2`) : response.replace(unitReplace, `$1${unit}s$2`);
    return response;
  }

  function handleWeatherCard(card) {
    const temp = card.querySelector(WEATHER_TEMPERATURE_SELECTOR).innerText;
    const conditions = card.querySelector(WEATHER_CONDITION_SELECTOR).innerText;
    const response = `It's ${temp} degrees and ${conditions}`;
    return response;
  }

  function handleSidebarCard(card) {
    const response = card.querySelector(WIKI_SIDEBAR_SELECTOR).innerText;
    return response;
  }

  function handleCalculatorCard(card) {
    const response = card.querySelector(CALCULATOR_RESULT_SELECTOR).innerText;
    return response;
  }

  function handleUnitCard(card) {
    const inputValue = card.querySelector(UNIT_INPUT_VALUE_SELECTOR).value;
    const inputUnits = card.querySelector(UNIT_INPUT_UNITS_SELECTOR).innerText;
    const outputValue = card.querySelector(UNIT_OUTPUT_VALUE_SELECTOR).value;
    const outputUnits = card.querySelector(UNIT_OUTPUT_UNITS_SELECTOR).innerText;

    const response = `${inflectValueAndUnit(outputValue, outputUnits)} in ${inflectValueAndUnit(inputValue, inputUnits)}`;
    return response;
  }

  function handleDictionaryCard(card) {
    let term = card.querySelector(DICTIONARY_TERM).innerText;
    term = term.replaceAll("·", "");
    const definition = card.querySelector(DICTIONARY_FIRST_DEFINITION).innerText;
    const response = `${term} is ${definition}`;
    return response;
  }

  function handleTranslateCard(card) {
    const targetLanguageCode = card.querySelector(TRANSLATE_TARGET_LANGUAGE_CODE).dataset.lang;
    const targetText = card.querySelector(TRANSLATE_TARGET_PHRASE).innerText;
    return {
      ttsText: targetText,
      ttsLanguage: targetLanguageCode
    };
  }

  function handleSportsScoreCard(card) {
    const leftTeamName = card.querySelector(SPORTS_LEFTHAND_TEAM).innerText;
    const leftTeamScore = parseFloat(card.querySelector(SPORTS_LEFTHAND_SCORE).innerText);
    const rightTeamName = card.querySelector(SPORTS_RIGHTHAND_TEAM).innerText;
    const rightTeamScore = parseFloat(card.querySelector(SPORTS_RIGHTHAND_SCORE).innerText);
    const response = leftTeamScore > rightTeamScore ? `${leftTeamName} ${leftTeamScore}, ${rightTeamName} ${rightTeamScore}` : `${rightTeamName} ${rightTeamScore}, ${leftTeamName} ${leftTeamScore}`;
    return response;
  }

  function handleSportsGameTimeCard(card) {
    const rawEventTimeString = card.querySelector(SPORTS_GAME_TIME).innerText;
    const teamInQuestion = card.querySelector(SPORTS_TEAM_OF_INTEREST).innerText;
    const leftTeamName = card.querySelector(SPORTS_LEFTHAND_TEAM).innerText;
    const rightTeamName = card.querySelector(SPORTS_RIGHTHAND_TEAM).innerText;

    const opposingTeam = teamInQuestion === leftTeamName ? rightTeamName : leftTeamName;

    let eventStringParts = rawEventTimeString.split(", ");
    eventStringParts.splice(-1, 0, "at"); // insert "at" right before the time
    // TODO FIX ABBREVIATIONS, PAST EVENTS, ETC.
    const response = `${eventStringParts.join(" ")} versus ${opposingTeam}`;
    return response;
  }

  function handleGenericCard(card) {
    const response = card.querySelector(`${DIRECT_ANSWER_SELECTOR}, ${DATETIME_SELECTOR}, ${HOURS_SELECTOR}, ${DAY_SELECTOR}, ${INTERACTIVE_GRAPH_SELECTOR}`).innerText;
    return response;
  }

  function inflectValueAndUnit(value, unit) {
    let adjustedUnit = unit;
    if (parseFloat(value) !== 1) {
      const irregularPluralForm = ALIASES["irregular_pluralizations"][unit.toLowerCase()];
      adjustedUnit = irregularPluralForm ? irregularPluralForm : `${unit}s`;
    }
    return `${value} ${adjustedUnit}`
  }

  communicate.register("cardTtsText", message => {
    const card = document.getElementsByClassName(message.cardSelectors)[0]; // TODO FIX? This is a hack to find the card node (identified in cardImage in queryScript) again
    const parentCard = card.parentNode;
    console.log(card.classList);

    let ttsText;
    let ttsLang = "en";
    let cardType;
    for (const [type, tag] of Object.entries(CARD_TYPE_SELECTORS)) {
      if (parentCard.querySelectorAll(tag).length) {
        cardType = type;
        break;
      }
    }
    if (!cardType) {
      cardType = message.isSidebar ? "SIDEBAR" : "UNKNOWN";
    }
    console.log(cardType);

    switch(cardType) {
      case "WEATHER":
        ttsText = handleWeatherCard(card);
        break;
      case "DIRECTIONS":
        ttsText = handleDirectionsCard(card);
        break;
      case "SIDEBAR":
        ttsText = handleSidebarCard(card);
        break;
      case "SNIPPET":
        ttsText = handleSnippetCard(card);
        break;
      case "UNIT":
        ttsText = handleUnitCard(card);
        break;
      case "CALCULATOR":
        ttsText = handleCalculatorCard(card);
        break;
      case "DICTIONARY":
        ttsText = handleDictionaryCard(card);
        break;
      case "TRANSLATE":
        const translationData = handleTranslateCard(card);
        ttsText = translationData.ttsText;
        ttsLang = translationData.ttsLanguage;
        break;
      case "SPORTS_SCORE":
        ttsText = handleSportsScoreCard(card);
        break;
      case "SPORTS_GAME_TIME":
        ttsText = handleSportsGameTimeCard(card);
        break;
      default:
        ttsText = handleGenericCard(card); 
    }

    return {
      ttsText,
      ttsLang
    };
  });
})();