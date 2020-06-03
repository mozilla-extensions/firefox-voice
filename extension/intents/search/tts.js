this.tts = (function () {
  const CARD_SELECTOR = ".vk_c, .kp-blk, .EyBRub";
  const SIDEBAR_SELECTOR = "#rhs";
  const MAIN_SELECTOR = "#center_col";
  const AD_CLASS = "commercial-unit-desktop-rhs";

  communicate.register("cardSpeakableData", message => {
    console.log("the message is");
    console.log(message);
    const card = document.getElementsByClassName(message.cardSelectors)[0]; // TODO FIX? This is a hack to find the card node (identified in cardImage in queryScript) again
    const parentCard = card.parentNode;
    console.log(card.classList);
    console.log(card.isSidebar)
    // Minimal effort attempt to find a speakable response
    let speakableData;
    if (card.id === "wob_wc") {
      // We know this is a weather card
      speakableData = `It's ${card.querySelector("#wob_tm").innerText} degrees`
    } else if (card.isSidebar && parentCard.querySelector(".kno-rdesc")) {
      // This is a sidebar card, and therefore we should read out the Wikipedia summary.
      speakableData = card.querySelector(".kno-rdesc > div:nth-child(1) > span:nth-child(2)").innerText;
    } else if (card.querySelector('.c2xzTb')) {
      if (card.querySelector(".Z0LcW")) {
        speakableData = card.querySelector(".Z0LcW").innerText;
      } else {
        speakableData = card.querySelector(".e24Kjd").innerText;
      }
    } else {
      if (card.querySelector(".Z0LcW")) {
        speakableData = card.querySelector(".Z0LcW").innerText;
      } else if (card.querySelector("[data-tts-text]")) {
        speakableData = card.querySelector("[data-tts-text]").dataset.ttsText; // could be wrong
      } else if (card.querySelector(".e24Kjd")) {
        speakableData = card.querySelector(".e24Kjd").innerText;
      } else if (card.querySelector(".BbbuR")) {
        speakableData = card.querySelector(".BbbuR").innerText;
      } else if (card.querySelector(".t51gnb")) {
        speakableData = card.querySelector(".t51gnb").innerText;
      }
    }
    return speakableData;
  });
})();