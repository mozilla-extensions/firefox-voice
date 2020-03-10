/* globals helpers */

this.player = (function() {
  // Play button Reference
  const SEARCH_PLAY = ".searchList__item .playButton";

  class Player extends helpers.Runner {
    // Play control buttons - Play/Pause, Next, Previous buttons.
    playControlsBtn = this.querySelectorAll(".playControls__control");

    action_play() {
      const button = this.querySelector(SEARCH_PLAY);
      button.click();
    }

    async action_search({ query, thenPlay }) {
      const searchInput = this.querySelector("form .headerSearch__input");
      const submitInput = this.querySelector("form .headerSearch__submit");
      this.setReactInputValue(searchInput, query);
      submitInput.click();
      if (thenPlay) {
        const playerButton = await this.waitForSelector(SEARCH_PLAY, {
          timeout: 3000,
        });
        playerButton.click();
      }
    }

    action_pause() {
      this.playControlsBtn[1].click();
    }

    action_unpause() {
      this.playControlsBtn[1].click();
    }

    action_move({ direction }) {
      if (direction === "next") {
        this.playControlsBtn[2].click();
      } else if (direction === "back") {
        this.playControlsBtn[0].click();
        this.playControlsBtn[0].click();
      }
    }
  }
  Player.register();
})();
