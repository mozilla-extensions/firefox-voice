/* globals communicate, Fuse, log */

this.followLink = (function() {
  communicate.register("followLink", message => {
    const { query } = message;
    // Fuse options
    const options = {
      shouldSort: true,
      tokenize: true,
      matchAllTokens: true,
      findAllMatches: true,
      includeScore: true,
      threshold: 0.1,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        {
          name: "title",
          weight: 0.45,
        },
        {
          name: "text",
          weight: 0.45,
        },
        {
          name: "url",
          weight: 0.1,
        },
      ],
    };
    const combinedContent = [];
    for (const link of findLinks()) {
      combinedContent.push({
        element: link,
        text: link.innerText,
        title: link.getAttribute("title"),
        url: link.url,
      });
    }
    const fuse = new Fuse(combinedContent, options);
    const matches = fuse.search(query);
    if (!matches.length) {
      return false;
    }
    let found;
    for (const match of matches) {
      const el = match.item.element;
      if (isInViewport(el)) {
        found = el;
        break;
      }
    }
    if (!found) {
      found = matches[0].item.element;
    }
    highlightElement(found);
    setTimeout(() => {
      log.info("Following link to:", found.href || "?");
      found.click();
    }, 100);
    return true;
  });

  function isInViewport(el) {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    const bounding = el.getBoundingClientRect();
    return (
      bounding.top + bounding.height >= 0 &&
      bounding.left + bounding.width >= 0 &&
      bounding.right - bounding.width <= width &&
      bounding.bottom - bounding.height <= height
    );
  }

  function highlightElement(el) {
    el.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
  }

  function findLinks() {
    return document.body.querySelectorAll("button, a, *[role=button]");
  }
})();
