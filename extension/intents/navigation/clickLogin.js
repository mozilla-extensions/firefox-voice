/* globals communicate, log */

this.followLink = (function() {
  communicate.register("signIn", message => {
    const regex = /log\s*in|sign\s*in/i;
    let element;

    for (const link of findButton()) {
      if (regex.test(link.innerText)) {
        element = link;
        break;
      }
    }

    highlightButton(element);
    element.scrollIntoView();
    setTimeout(() => {
      log.info("Following link to:", element.href || "?");
      element.click();
    }, 100);
    return true;
  });

  function highlightButton(el) {
    el.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
  }

  function findButton() {
    return document.body.querySelectorAll("button, a, *[role=button]");
  }
})();
