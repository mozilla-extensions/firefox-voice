/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY =
    "#searchPage button[aria-label='Play'], .tracklist .tracklist-play-pause";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[title='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      // try to find the error page; if found, throw a DRM error; otherwise play
      const errorDiv = document.querySelector("div.ErrorPage");
      if (errorDiv) {
        throw new Error("You must enable DRM.");
      }
      const searchButton = this.querySelector("a[aria-label='Search']");
      searchButton.click();

      const input = await this.waitForSelector(
        "div[role=search] input, input.SearchInputBox__input"
      );
      this.setReactInputValue(input, query);
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
      const button = this.querySelector("button[title='Pause']");
      button.click();
    }

    action_unpause() {
      const button = this.querySelector(".control-button[title='Play']");
      button.click();
    }

    action_move({ direction }) {
      let selector;
      if (direction === "next") {
        selector = ".control-button[title='Next']";
      } else if (direction === "previous") {
        selector = ".control-button[title='Previous']";
      }
      const button = this.querySelector(selector);
      button.click();
    }
  }

  Player.register();
})();
