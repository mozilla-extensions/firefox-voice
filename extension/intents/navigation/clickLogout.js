/* globals communicate, log */

this.followLink = (function() {
  communicate.register("signOut", message => {
    const { query } = message;
    const regex = /log\s*out|sign\s*out/i;

    for (const link of findButton()) {
      const element = link.innerText;
      return regex.test(element.innerText);
    }
    const matches = regex.match(query);
    const found = matches[0];

    highlightElement(found);
    found.scrollIntoView();
    setTimeout(() => {
      log.info("Following link to:", found.href || "?");
      found.click();
    }, 100);
    return true;
  });

  function highlightElement(el) {
    el.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
  }

  function findButton() {
    return document.body.querySelectorAll("button, a, *[role=button]");
  }
})();
