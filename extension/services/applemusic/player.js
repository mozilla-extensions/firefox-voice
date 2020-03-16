/* globals helpers */

this.player = (function() {
    const SEARCH_PLAY = ".lookup__controls .play-button";
  
    class Player extends helpers.Runner {
      action_play() {
        const button = this.querySelector(SEARCH_PLAY);
        button.click();
      }
  
      async action_search({ query, thenPlay }) {
        const searchInput = this.querySelector("#search-box .dt-search-box__input");
        searchInput.focus();
        this.setReactInputValue(searchInput, query);
        const pressEnter = new KeyboardEvent("keydown", {
            bubbles: true, cancelable: true, keyCode: 13
        });
       // document.dispatchEvent(pressEnter);
        if (thenPlay) {
          const playerButton = await this.waitForSelector(SEARCH_PLAY, {
            timeout: 3000,
          });
          playerButton.click();
        }
      }
  
      action_pause() {
        const playControlsBtn = this.querySelectorAll(".web-chrome-playback-controls__playback-btn");
        playControlsBtn[1].click();
      }
  
      action_unpause() {
        const playControlsBtn = this.querySelectorAll(".web-chrome-playback-controls__playback-btn");
        playControlsBtn[1].click();
      }
  
      action_move({ direction }) {
        const playControlsBtn = this.querySelectorAll(".web-chrome-playback-controls__playback-btn");
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