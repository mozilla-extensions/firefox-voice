this.tts = (function () {
  const WEATHER_TEMPERATURE_SELECTOR = "#wob_tm"; // TODO support degrees Celcius
  const WEATHER_CONDITION_SELECTOR = "#wob_dc";

  const DIRECTIONS_SELECTOR = ".BbbuR" // directly selects the first line of the directions, which is readable in full

  const DIRECT_ANSWER_SELECTOR = ".Z0LcW, .NqXXPb, .XcVN5d";

  const WIKI_SIDEBAR_SELECTOR = ".kno-rdesc > div:nth-child(1) > span:nth-child(2)";

  const SNIPPET_SOURCE_SELECTOR = "cite.iUh30"; // tricky: we would want to remove the child span within this
  const SNIPPET_BODY_SELECTOR = ".e24Kjd, .iKJnec";
  const SNIPPET_HEADER_SELECTOR = ".kno-ecr-pt, .Z0LcW"; // need to validate! this is only one type of header i've seen
  const SNIPPET_ORDERED_LIST_SELECTOR = ".X5LH0c"; // not sure about this one
  const SNIPPET_UNORDERED_LIST_SELECTOR = ".i8Z77e"; // not sure about this one
  const SNIPPET_LIST_ITEM_SELECTOR = ".TrT0Xe"; // seems to be consistent across ordered and unordered

  const UNIT_INPUT_VALUE_SELECTOR = "#HG5Seb > input:nth-child(1)"; // need to get .value
  const UNIT_INPUT_UNITS_SELECTOR = "#ssSucf > [selected]"; // need to find what is selected
  const UNIT_OUTPUT_VALUE_SELECTOR = "#NotFQb > input:nth-child(1)";
  const UNIT_OUTPUT_UNITS_SELECTOR = "#NotFQb > select > [selected]";

  const DATETIME_SELECTOR = ".t51gnb"; // direct answer, no modification needed
  const HOURS_SELECTOR = ".TLou0b";
  const DAY_SELECTOR = ".zCubwf";

  const INTERACTIVE_GRAPH_SELECTOR = ".ayqGOc.kno-fb-ctx.KBXm4e";

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

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const BANNER_CARD_SELECTOR = "#botabar";
  const BANNER_CARD_ITEM_WIDE = ".rl_item"; // may be possible just to get innerText
  const BANNER_CARD_ITEM_TALL = ".klitem-tr"; // title found in aria-label of this item

  const CARD_TYPE_SELECTORS = {
    WEATHER: "#wob_wc",
    DIRECTIONS: ".BbbuR",
    SNIPPET: ".c2xzTb",
    UNIT: "select.rYVYn",
    CALCULATOR: "#cwmcwd", // not entirely sure
    DICTIONARY: ".zbA8Me.gJBeNe.vSuuAd.i8lZMc",
    SPELLING: ".DgZBFd.XcVN5d", // will also match the dictionary, so ordering matters
    TRANSLATE: "#tw-container",
    SPORTS_SCORE: ".imso_mh__l-tm-sc", 
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

  function getSpeakableSubsetOfList(card, itemSelector, maxItems = 3, sayExactRemainder = false, useAttribute = "") {
    const listItems = card.querySelectorAll(itemSelector);
    console.log("here are the items");
    console.log(listItems);
    let listItemsAsText = Array.from(listItems).map(el => {
      if (useAttribute === "") {
        return el.innerText;
      }
      return el.getAttribute(useAttribute);
    })
    listItemsAsText = listItemsAsText.filter(el => el !== ""); // get all non-empty list items as an array of their innerText or attribute containing the relevant text
    const totalNumItems = listItemsAsText.length;
    if (totalNumItems > maxItems) {
      const numRemaining = totalNumItems - maxItems;
      return `${listItemsAsText.slice(0, maxItems).join(", ")} and ${sayExactRemainder ? `${numRemaining} ` : ``}more`;
    } else {
      listItemsAsText.splice(-1, 0, "and");
      return `${listItemsAsText.join(", ")}`;
    }
  }

  function abbreviateTextResponse(text, maxSentences = 2, removeParentheticals = true) {
    const trimmedText = removeParentheticals ? text.replaceAll(/\([^\)]*\)/g, "") : text;
    const sentences = trimmedText.match( /[^\.!\?]+[\.!\?]+/g ); // TODO fix for abbreviations like U.I.S.T.
    return sentences.slice(0, maxSentences).join(" ");
  }

  function handleBannerCards(bannerCardContainer) {
    let ttsText;
    if (bannerCardContainer.querySelector(BANNER_CARD_ITEM_WIDE)) {
      ttsText = getSpeakableSubsetOfList(bannerCardContainer, BANNER_CARD_ITEM_WIDE, 5, true);
    } else if (bannerCardContainer.querySelector(BANNER_CARD_ITEM_TALL)) {
      ttsText = getSpeakableSubsetOfList(bannerCardContainer, BANNER_CARD_ITEM_TALL, 3, true, "aria-label");
    }
    return {
      ttsText,
      ttsLang: 'en'
    };
  }

  function handleSnippetCard(card) {
    let source = card.querySelector(SNIPPET_SOURCE_SELECTOR).innerText;
    source = source.replace("www.", "").replace(/ › .*/, "");

    // const sourceDetails = card.querySelector(SNIPPET_SOURCE_BREADCRUMB_SELECTOR).innerText;

    const header = card.querySelector(SNIPPET_HEADER_SELECTOR);
    if (header) { // A small subset of snippet cards seem to have a direct answer along with a longer text body
      return header.innerText;
    }
    const hasList = card.querySelector(`${SNIPPET_ORDERED_LIST_SELECTOR}, ${SNIPPET_UNORDERED_LIST_SELECTOR}`);
    if (hasList) {
      return `According to ${source}, the top results are ${getSpeakableSubsetOfList(card, SNIPPET_LIST_ITEM_SELECTOR)}`;
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

  function handleSpellingCard(card) {
    let term = card.querySelector(DICTIONARY_TERM).innerText;
    term = term.replaceAll("·", "");
    let spelledOut = term.split("")
    spelledOut.push(" "); // Add an additional blank space such that there are trailing periods after the last letter
    spelledOut = spelledOut.join(".............."); // the "join" here is used to artificially add gaps between each letter to slow down TTS
    return spelledOut;
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
    if (card.querySelector('.liveresults-sports-immersive__game-minute')) {
      return `They are currently playing. The score is ${handleSportsScoreCard(card)}`
    }
    const leftTeamName = card.querySelector(SPORTS_LEFTHAND_TEAM).innerText;
    const rightTeamName = card.querySelector(SPORTS_RIGHTHAND_TEAM).innerText;
    const rawEventTimeString = card.querySelector(SPORTS_GAME_TIME).innerText;    
    const parsedEventTime = humanReadableDate(rawEventTimeString);

    if (card.querySelector(SPORTS_TEAM_OF_INTEREST)) {
      const teamInQuestion = card.querySelector(SPORTS_TEAM_OF_INTEREST).innerText;
      const opposingTeam = teamInQuestion === leftTeamName ? rightTeamName : leftTeamName;
      return `${parsedEventTime} versus ${opposingTeam}`;
    }
    
    return `${leftTeamName} and ${rightTeamName} play ${parsedEventTime}`;
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

  function humanReadableDate(rawDate) {
    let eventStringParts = rawDate.split(", ");
    if (eventStringParts.length === 3) {
      // Specifies a day of the week and date (e.g. Tue, 6/16)
      let [dayOfWeek, monthAndDay, timeOfEvent] = eventStringParts;
      dayofWeek = `${dayOfWeek}${ dayOfWeek === "Sat" ? `urday` : `day` }`;
      let [month, day] = monthAndDay.split("/");
      month = MONTH_NAMES[parseInt(month) - 1];
      eventStringParts = [dayOfWeek, month, day, timeOfEvent];
    }
    eventStringParts.splice(-1, 0, "at"); // insert "at" right before the time
    eventStringParts = eventStringParts.join(" ");
    return eventStringParts;
  }

  communicate.register("cardTtsText", message => {
    const bannerCardContainer = document.querySelector(BANNER_CARD_SELECTOR);
    if (bannerCardContainer) {
      console.log("IN HERE");
      return handleBannerCards(bannerCardContainer);
    }
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
      case "SPELLING":
        ttsText = handleSpellingCard(card);
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