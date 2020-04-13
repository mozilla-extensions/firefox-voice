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

    getVolumeIcon() {
      const svgIconGroupBtn = this.querySelectorAll(".svg-icon-group-btn");
      const volumeBtn = svgIconGroupBtn[svgIconGroupBtn.length - 2];
      const volumeIcon = volumeBtn.firstElementChild;
      const volumeIconClass = volumeIcon.getAttribute("class");
      return volumeIconClass;
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
      return slidersTrackInput[1];
    }

    getVolume() {
      const sliderTrackInput = this.getVolumeSliderTracker();
      const volumeNow = parseInt(
        sliderTrackInput.getAttribute("aria-valuenow")
      );
      return volumeNow;
    }

    action_adjustVolume({ inputVolume = null, volumeLevel = "setInput" }) {
      const maxVolume = 100;
      const minVolume = 0;
      const sliderTrackInput = this.getVolumeSliderTracker();
      const volumeNow = this.getVolume();
      let inputVol = 0;
      let volumeChange = 20;
      let volumeChangeSteps = volumeChange;
      let volumeChangeEvent = null;

      if (inputVolume !== null) {
        if (inputVolume > "0") {
          inputVol = inputVolume;
        } else if (inputVolume === "0") {
          this.action_mute();
          return;
        }
        if (volumeLevel === "setInput") {
          if (volumeNow < inputVol) {
            volumeLevel = "levelUp";
          } else if (volumeNow > inputVol) {
            volumeLevel = "levelDown";
          }
        }
      }
      if (volumeLevel === "levelUp" && volumeNow < maxVolume) {
        if (inputVol && volumeNow < inputVol) {
          volumeChange = inputVol - volumeNow;
          volumeChangeSteps = volumeChange;
        }
        volumeChangeEvent = new KeyboardEvent("keypress", {
          bubbles: true,
          key: "ArrowUp",
          keyCode: 38,
          shiftKey: true,
        });
      } else if (volumeLevel === "levelDown" && volumeNow > minVolume) {
        if (inputVol && volumeNow > inputVol) {
          volumeChange = volumeNow - inputVol;
          volumeChangeSteps = volumeChange;
        }
        volumeChangeEvent = new KeyboardEvent("keypress", {
          bubbles: true,
          key: "ArrowDown",
          keyCode: 40,
          shiftKey: true,
        });
      }
      if (this.isMuted()) {
        this.action_unmute();
      }
      for (let step = 0; step < volumeChangeSteps; step++) {
        sliderTrackInput.dispatchEvent(volumeChangeEvent);
      }
      if (this.getVolume() === 0) {
        this.action_mute();
      }
    }

    isMuted() {
      const volumeIcon = this.getVolumeIcon();
      const muted = volumeIcon === "svg-icon svg-icon-volume-off" ? 1 : 0;
      return muted;
    }

    action_mute() {
      if (!this.isMuted()) {
        const iconVolume = this.querySelector(".svg-icon-volume");
        const iconVolumeParent = iconVolume.parentElement;
        iconVolumeParent.click();
      }
    }

    action_unmute() {
      if (this.isMuted()) {
        const iconVolumeOff = this.querySelector(".svg-icon-volume-off");
        const iconVolumeParent = iconVolumeOff.parentElement;
        iconVolumeParent.click();
      }
    }
  }

  Player.register();
})();
