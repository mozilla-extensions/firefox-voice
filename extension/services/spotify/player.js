/* globals communicate, helpers */

this.player = (function() {
  communicate.register("play", message => {
    const button = document.querySelector("button[title='Play']");
    button.click();
  });

  communicate.register("search", async message => {
    const searchButton = document.querySelector("a[aria-label='Search']");
    searchButton.click();
    const input = await helpers.waitForSelector(".SearchInputBox input");
    helpers.setReactInputValue(input, message.query);
    if (message.thenPlay) {
      const player = await helpers.waitForSelector(".tracklist-play-pause", {
        timeout: 2000,
      });
      player.click();
    }
  });

  communicate.register("pause", message => {
    const button = document.querySelector("button[title='Pause']");
    button.click();
  });
})();
