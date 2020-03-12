/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = ".datagrid-row song a[role='button']";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[aria-label='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      const querySubmit = this.querySelector("form .topbar-search-submit");
      const queryInput = this.querySelector("form .topbar-search-input");
      console.log(queryInput);

      this.setReactInputValue(queryInput, query);
      querySubmit.click();
      if (thenPlay) {
        const playerButton = await this.waitForSelector(SEARCH_PLAY, {
          timeout: 2000,
          // There seem to be 3 fixed buttons that appear early before the search results
          minCount: 4,
        });
        playerButton.click();
      }
    }

    action_pause() {
      const pauseButton = this.querySelector("button[aria-label='Pause']");
      pauseButton.click();
    }

    action_unpause() {
      const playButton = this.querySelector("button[aria-label='Play']");
      playButton.click();
    }

    action_move({ direction }) {
      let selector;
      if (direction === "next") {
        selector = "button[aria-label='Next']";
      } else if (direction === "previous") {
        selector = "button[aria-label='Previous']";
      }
      const moveButton = this.querySelector(selector);
      moveButton.click();
    }
  }

  Player.register();
})();
