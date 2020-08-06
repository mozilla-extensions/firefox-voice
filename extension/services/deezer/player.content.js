import { Runner } from "../../content/helpers.js";

const SEARCH_PLAY = ".datagrid-row a[role='button']";

class Player extends Runner {
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
    const volumeNow = parseInt(sliderTrackInput.getAttribute("aria-valuenow"));
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
