/* eslint-disable no-undef */

this.contentScript = (function() {
  communicate.register("sayWord", async message => {
    const button = document.querySelectorAll(".audio");
    log.info(button);
    button[0].click();
  });
})();
