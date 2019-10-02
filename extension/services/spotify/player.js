/* globals log, helpers */

this.player = (function() {
  const SEARCH_PLAY = ".tracklist-play-pause";
  const TOP_PLAY = ".top-artist .cover-art-playback";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[title='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      const searchButton = this.querySelector("a[aria-label='Search']");
      searchButton.click();
      const input = await this.waitForSelector(".SearchInputBox input");
      this.setReactInputValue(input, query);
      if (thenPlay) {
        await this.waitForSelector(`${SEARCH_PLAY}, ${TOP_PLAY}`, {
          timeout: 2000,
        });
        const mainPlayer = this.querySelectorAll(TOP_PLAY);
        let playerButton;
        if (mainPlayer.length) {
          if (mainPlayer.length > 1) {
            log.info(
              "Got multiple results for query .top-artist .cover-art-playback :",
              mainPlayer
            );
          }
          playerButton = mainPlayer[0];
        } else {
          playerButton = this.querySelector(SEARCH_PLAY);
        }
        playerButton.click();
      }
    }

    action_pause() {
      const button = document.querySelector("button[title='Pause']");
      button.click();
    }
  }

  Player.register();
})();
