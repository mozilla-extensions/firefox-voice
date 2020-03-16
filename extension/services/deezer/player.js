/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = ".datagrid-row song a[role='button']";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[aria-label='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      try {
        const querySubmit = this.querySelector("form .topbar-search-submit");
        const queryInput = this.querySelector("form .topbar-search-input");
        this.setReactInputValue(queryInput, query);
        queryInput.value = query;
        querySubmit.click();
        if (thenPlay) {
          const playerButton = await this.waitForSelector(SEARCH_PLAY, {
            timeout: 2000,
            // There seem to be 3 fixed buttons that appear early before the search results
            minCount: 4,
          });
          playerButton.click();
        }
      } catch (e) {
        const unlogged = this.querySelector("div[class='unlogged-homepage']");
        if (unlogged) {
          throw new Error("Please log in to use this service.");
        }
      }
    }

    action_pause() {
      const button = this.querySelector("button[aria-label='Pause']");
      button.click();
    }
    action_unpause() {
      const button = this.querySelector("button[aria-label='Play']");
      button.click();
    }

    action_move({ direction }) {
      if (direction === "Next") {
        const button = this.querySelector("button[aria-label='Next']");
        button.click();
      } else if (direction === "Previous") {
        const button = this.querySelector("button[aria-label='Previous']");
        button.click();
      }
    }
  }

  Player.register();
})();
