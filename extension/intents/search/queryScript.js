/* globals communicate */

this.queryScript = (function() {
  const CARD_SELECTOR = ".vk_c, .kp-blk, .EyBRub";
  const SIDEBAR_SELECTOR = "#rhs";
  const MAIN_SELECTOR = "#center_col";

  function findCards() {
    const topElement = document.querySelector("a > h3");
    const maxBottom = topElement.getBoundingClientRect().top;
    return {
      card: findCardIn(document.querySelector(MAIN_SELECTOR), maxBottom),
      sidebarCard: findCardIn(document.querySelector(SIDEBAR_SELECTOR), null),
    };
  }

  function findCardIn(container, maxBottom) {
    let selected = container.querySelectorAll(CARD_SELECTOR);
    if (maxBottom) {
      selected = Array.from(selected).filter(
        e => e.getBoundingClientRect().bottom <= maxBottom
      );
    }
    if (selected.length) {
      return selected[0];
    }
    for (const div of container.querySelectorAll("div")) {
      if (maxBottom) {
        const box = div.getBoundingClientRect();
        if (box.top > maxBottom) {
          break;
        }
        if (box.bottom > maxBottom) {
          continue;
        }
      }
      if (hasCardBorder(div)) {
        return div;
      }
    }
    return undefined;
  }

  function hasCardBorder(element) {
    const style = getComputedStyle(element);
    const COLOR = "rgb(223, 225, 229)";
    const RADIUS = "8px";
    return (
      style.borderTopColor === COLOR &&
      style.borderBottomColor === COLOR &&
      style.borderLeftColor === COLOR &&
      style.borderRightColor === COLOR &&
      style.borderTopLeftRadius === RADIUS &&
      style.borderTopRightRadius === RADIUS &&
      style.borderBottomLeftRadius === RADIUS &&
      style.borderBottomRightRadius === RADIUS
    );
  }

  communicate.register("searchResultInfo", message => {
    const cards = findCards();
    const searchHeaders = document.querySelectorAll("a > h3");
    const searchResults = [];
    for (const searchHeader of searchHeaders) {
      searchResults.push({
        url: searchHeader.parentNode.href,
        title: searchHeader.textContent,
      });
    }
    return {
      hasSidebarCard: !!cards.sidebarCard,
      hasCard: !!cards.card,
      searchResults,
      searchUrl: location.href,
    };
  });

  communicate.register("cardImage", message => {
    const cards = findCards();
    const card = cards.sidebarCard || cards.card;
    if (!card) {
      throw new Error("No card found for cardImage");
    }
    // When it has a canvas it may dynamically update:
    const hasWidget = !!card.querySelector("canvas");
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
      hasWidget,
    };
  });
})();
