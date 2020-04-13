/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = ".datagrid-row a[role='button']";

  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button[aria-label='Play']");
      button.click();
    }

    async search(query) {
      try {
        const queryInput = await this.waitForSelector(
          "form .topbar-search-input"
        );
        const querySubmit = this.querySelector("form .topbar-search-submit");
        this.setReactInputValue(queryInput, query);
        querySubmit.click();
      } catch (e) {
        const unlogged = document.querySelector(".unlogged-homepage");
        if (unlogged) {
          throw new Error("Please log in to use this service.");
        }
        throw e;
      }
    }

    async action_search({ query, thenPlay }) {
      try {
        await this.search(query);
        if (thenPlay) {
          const playerButton = await this.waitForSelector(SEARCH_PLAY, {
            timeout: 2000,
          });
          playerButton.click();
        }
      } catch (e) {
        throw new Error("No Search Results!");
      }
    }

    action_pause() {
      const button = this.querySelector(
        ".player-bottom button[aria-label='Pause']"
      );
      button.click();
    }
    action_unpause() {
      const button = this.querySelector(
        ".player-bottom button[aria-label='Play']"
      );
      button.click();
    }

    action_move({ direction }) {
      if (direction === "next") {
        const button = this.querySelector(
          ".player-bottom button[aria-label='Next']"
        );
        button.click();
      } else if (direction === "previous") {
        const button = this.querySelector(
          ".player-bottom button[aria-label='Back']"
        );
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

    async playSection({ query, thenPlay, section }) {
      let foundSection;
      await this.search(query);
      try {
        if (thenPlay) {
          const anchorNodes = await this.waitForSelector(".container h2 a", {
            all: true,
            timeout: 5000,
          });
          for (const anchorTag of anchorNodes) {
            if (anchorTag.innerText === section) {
              foundSection = anchorTag.parentElement.parentElement;
              break;
            }
          }
          try {
            foundSection.querySelector("ul li button").click();
            foundSection.querySelector("ul li figure .picture").click();
          } catch {
            throw new Error("Album not found!");
          }
        }
      } catch {
        throw new Error("No Search Results!");
      }
    }

    async action_playAlbum({ query, thenPlay }) {
      await this.playSection({ query, thenPlay, section: "Albums" });
    }

    async action_playPlaylist({ query, thenPlay }) {
      await this.playSection({ query, thenPlay, section: "Playlists" });
    }
  }

  Player.register();
})();
