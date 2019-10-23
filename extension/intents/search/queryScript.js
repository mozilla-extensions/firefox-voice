/* globals communicate */

this.queryScript = (function() {
  const CARD_SELECTOR = ".vk_c.card-section, .lr_container.mod";

  communicate.register("searchResultInfo", message => {
    const hasSidebarCard = !!document.querySelector(".kp-header");
    const hasCard = !!document.querySelector(CARD_SELECTOR);
    const searchHeaders = document.querySelectorAll("a > h3");
    const searchResults = [];
    for (const searchHeader of searchHeaders) {
      searchResults.push({
        url: searchHeader.parentNode.href,
        title: searchHeader.textContent,
      });
    }
    return {
      hasSidebarCard,
      hasCard,
      searchResults,
      searchUrl: location.href,
    };
  });

  communicate.register("cardImage", message => {
    const card = document.querySelector(CARD_SELECTOR);
    const rect = card.getBoundingClientRect();
    const canvas = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "canvas"
    );
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.drawWindow(window, rect.x, rect.y, rect.width, rect.height, "#fff");
    return {
      width: rect.width,
      height: rect.height,
      src: canvas.toDataURL(),
    };
  });
})();
