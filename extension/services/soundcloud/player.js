/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = ".searchList__item .playButton";

  class Player extends helpers.Runner {
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
      const playControlsBtn = this.querySelectorAll(".playControls__control");
      playControlsBtn[1].click();
    }

    action_unpause() {
      const playControlsBtn = this.querySelectorAll(".playControls__control");
      playControlsBtn[1].click();
    }

    action_move({ direction }) {
      const playControlsBtn = this.querySelectorAll(".playControls__control");
      if (direction === "next") {
        playControlsBtn[2].click();
      } else if (direction === "back") {
        playControlsBtn[0].click();
        playControlsBtn[0].click();
      }
    }
  }
  Player.register();
})();
