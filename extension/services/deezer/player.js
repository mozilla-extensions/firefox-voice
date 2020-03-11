/* globals helpers */

this.player = (function() {
    const SEARCH_PLAY =
      " button[aria-label='Play']";
      
  
    class Player extends helpers.Runner {
      action_play() {
        const button = this.querySelector("button[aria-label='Play']");
        button.click();
      }
  
     async  action_search({ query, thenPlay }) {
        // const searchInput = this.querySelector("input[aria-label='search']");
        // console.log("i'm sure", query);
        // searchButton.click();
  
        const input = await this.waitForSelector("div[class=popper-wrapper] input, input.topbar-search-input"
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
        const button = this.querySelector("button[aria-label='Pause']");
        button.click();
      }
  
      action_unpause() {
        const button = this.querySelector(".control-button[aria-label='Play']");
        button.click();
      }
  
      action_move({ direction }) {
        let selector;
        if (direction === "next") {
          selector = ".control-button[aria-label='Next']";
        } else if (direction === "previous") {
          selector = ".control-button[aria-label='Previous']";
        }
        const button = this.querySelector(selector);
        button.click();
      }
    }
  
    Player.register();
  })();
  