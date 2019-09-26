/* globals helpers */

this.player = (function() {
  class Player extends helpers.Runner {
    action_play() {
      const button = document.querySelector("button[title='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      const searchButton = this.querySelector("a[aria-label='Search']");
      searchButton.click();
      const input = await this.waitForSelector(".SearchInputBox input");
      this.setReactInputValue(input, query);
      if (thenPlay) {
        const player = await this.waitForSelector(".tracklist-play-pause", {
          timeout: 2000,
        });
        player.click();
      }
    }

    action_pause() {
      const button = document.querySelector("button[title='Pause']");
      button.click();
    }
  }

  Player.register();
})();
