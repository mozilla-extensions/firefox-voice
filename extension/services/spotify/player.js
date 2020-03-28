/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = "#searchPage div button[style='--size:48px;']";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[title='Play']");
      button.click();
    }

    async action_search({ query, thenPlay }) {
      // try to find the error page; if found, throw a DRM error; otherwise search
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
        try {
          const playerButton = await this.waitForSelector(SEARCH_PLAY, {
            timeout: 10000,
            // There is no need to wait for this as there is only one selector
            minCount: 0,
          });
          playerButton.click();

        // playerButton onclick() listener is used to
        // notify the clicking on card after clicking
        // the playerButton.
        // Clicking on the card shows
        // songs in the playlist.
        playerButton.onclick(() => {
          return new Promise(res => {
            res(true);
          });
        });

        } catch (e) {
          if (e.name === "TimeoutError") {
            throw new Error("No search results");
          }
        }
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

    async action_move({ direction }) {
      if (direction === "next") {
        const selector = ".control-button[title='Next']";
        const button = this.querySelector(selector);
        button.click();
      } else if (direction === "previous") {
        const selector = ".control-button[title='Previous']";
        // Player time
        const time = this.querySelector(".playback-bar__progress-time")
          .innerHTML;
        if (
          /\b0:00\b/gi.test(time) ||
          /\b0:01\b/gi.test(time) ||
          /\b0:02\b/gi.test(time)
        ) {
          const firstClickBtn = this.querySelector(selector);
          firstClickBtn.click();
          return;
        }
        const firstClickBtn = this.querySelector(selector);
        firstClickBtn.click();
        // Since after the first click there is a delay in the selector
        const secondClickBtn = await this.waitForSelector(selector);
        secondClickBtn.click();
      }
    }

  async action_playAlbum({ query, thenPlay }) {
    await this.action_search({ query, thenPlay });

    // Clicking on card to get into album playlist.
    // Important: The selectors to be changed when spotify updates their website.
    const cards = this.querySelectorAll(
      "#searchPage .react-contextmenu-wrapper"
    )[0];
    cards.childNodes[3].click();
    }
  }

  Player.register();
})();
