/* globals helpers */

this.player = (function() {
  // Play button Reference
  const SEARCH_PLAY = ".sound__header a[title='Play']";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[aria-label='Play current']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      const searchInput = this.querySelector("input[aria-label='Search']");
      const submitInput = this.querySelector(
        ".headerSearch__submit[type='submit']"
      );
      this.setReactInputValue(searchInput, query);
      submitInput.click();
      if (thenPlay) {
        const playerButton = await this.waitForSelector(SEARCH_PLAY, {
          timeout: 2000,
        });
        playerButton.click();
      }
    }

    action_pause() {
      const button = this.querySelector("button[aria-label='Pause current']");
      button.click();
    }

    action_unpause() {
      const button = this.querySelector("button[aria-label='Play current']");
      button.click();
    }

    action_move({ direction }) {
      const playControls = this.querySelectorAll(".playControls__control");
      if (direction === "next") {
        playControls[2].click();
      } else if (direction === "back") {
        playControls[0].click();
        playControls[0].click();
      }
    }
  }
  Player.register();
})();
