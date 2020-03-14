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
         const unlogged = this.querySelector("div[class='unlogged-homepage']")
          if (unlogged) {
            e = new Error ("Please log in to use this service.");
            throw e;  
          }
        }
      }
  
      action_pause() {
        const group_btn = this.querySelector("button[aria-label='Pause']");
        group_btn.click();
      }
  
      action_unpause() {
        const group_btn = this.querySelector("button[aria-label='Play']");
        group_btn.click();
      }
  
      action_move({ direction }) {
        let group_btn;
        if (direction === "Next") {
          group_btn = "button[aria-label='Next']";
        } else if (direction === "Previous") {
          group_btn = "button[aria-label='Previous']";
        }
      }
    }
  
    Player.register();
  })();
