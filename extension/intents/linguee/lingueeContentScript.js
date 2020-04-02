/* globals communicate */

this.contentScript = (function() {
  communicate.register("sayWord", async message => {
    const button = document.querySelector(".audio");
    if (!button) {
      const e = new Error(`Could not find audio`);
      e.name = "AudioNotFound";
      throw e;
    }
    button.click();
  });
})();
