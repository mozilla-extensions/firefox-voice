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

    getVolumeSliderTracker() {
      const svgIconGroupBtn = this.querySelectorAll(".svg-icon-group-btn");
      const volumeBtn = svgIconGroupBtn[svgIconGroupBtn.length - 2];
      const mouseover = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      volumeBtn.dispatchEvent(mouseover);
      const slidersTrackInput = this.querySelectorAll(".slider-track-input");
      return slidersTrackInput;
    }

    isMuted() {
      const slidersTrackInput = this.getVolumeSliderTracker();
      const volumeNow = parseInt(
        slidersTrackInput[1].getAttribute("aria-valuenow")
      );
      const muted = volumeNow ? 0 : 1;
      return muted;
    }

    action_adjustVolume({ volumeLevel }) {
      const maxVolume = 100;
      const minVolume = 0;
      const volumeChange = 20;
      const volumeChangeSteps = volumeChange;
      const slidersTrackInput = this.getVolumeSliderTracker();
      const volumeNow = parseInt(
        slidersTrackInput[1].getAttribute("aria-valuenow")
      );

      if (volumeLevel === "levelUp" && volumeNow < maxVolume) {
        if (this.isMuted()) {
          this.action_unmute();
        }
        const volumeup = new KeyboardEvent("keypress", {
          bubbles: true,
          key: "ArrowUp",
          keyCode: 38,
          shiftKey: true,
        });
        for (let step = 0; step < volumeChangeSteps; step++) {
          slidersTrackInput[1].dispatchEvent(volumeup);
        }
      } else if (volumeLevel === "levelDown" && volumeNow > minVolume) {
        const volumedown = new KeyboardEvent("keypress", {
          bubbles: true,
          key: "ArrowDown",
          keyCode: 40,
          shiftKey: true,
        });
        for (let step = 0; step < volumeChangeSteps; step++) {
          slidersTrackInput[1].dispatchEvent(volumedown);
        }
      }
    }

    action_mute() {
      if (!this.isMuted()) {
        const iconVolume = this.querySelector(".svg-icon-volume");
        const iconVolumeParent = iconVolume.closest(".svg-icon-group-btn");
        iconVolumeParent.click();
      }
    }

    action_unmute() {
      if (this.isMuted()) {
        const iconVolumeOff = this.querySelector(".svg-icon-volume-off");
        const iconVolumeParent = iconVolumeOff.closest(".svg-icon-group-btn");
        iconVolumeParent.click();
      }
    }
  }

  Player.register();
})();
