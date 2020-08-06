import { Runner } from "../../content/helpers.js";

const SEARCH_PLAY = ".searchList__item .playButton";

class Player extends Runner {
  action_play() {
    const button = this.querySelector(SEARCH_PLAY);
    button.click();
  }

  async action_search({ query, thenPlay }) {
    const searchInput = this.querySelector("form .headerSearch__input");
    const submitInput = this.querySelector("form .headerSearch__submit");
    this.setReactInputValue(searchInput, query);
    submitInput.click();
    if (thenPlay) {
      const playerButton = await this.waitForSelector(SEARCH_PLAY, {
        timeout: 3000,
      });
      playerButton.click();
    }
  }

  action_pause() {
    const playControlsBtn = this.querySelectorAll(".playControls__control");
    const label = playControlsBtn[1].getAttribute("aria-label");
    if (label === "Pause current") {
      playControlsBtn[1].click();
    }
  }

  action_unpause() {
    const playControlsBtn = this.querySelectorAll(".playControls__control");
    const label = playControlsBtn[1].getAttribute("aria-label");
    if (label === "Play current") {
      playControlsBtn[1].click();
    }
  }

  action_move({ direction }) {
    const playControlsBtn = this.querySelectorAll(".playControls__control");
    if (direction === "next") {
      playControlsBtn[2].click();
    } else if (direction === "previous") {
      playControlsBtn[0].click();
      playControlsBtn[0].click();
    }
  }

  action_adjustVolume({ inputVolume = null, volumeLevel = "setInput" }) {
    const maxVolume = 1.0;
    const minVolume = 0.0;
    const volumeChangeReceiver = this.querySelector(".volume");
    const sliderWrapper = this.querySelector(".volume__sliderWrapper");
    const volumeNow = parseFloat(sliderWrapper.getAttribute("aria-valuenow"));
    let inputVol = 0.0;
    let volumeChange = 0.2;
    let volumeChangeSteps = volumeChange * 10;
    let volumeChangeEvent = null;

    if (inputVolume !== null) {
      if (inputVolume > "0") {
        inputVol = (inputVolume / 100).toPrecision(2);
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
        volumeChangeSteps = volumeChange * 10;
      }
      volumeChangeEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        key: "ArrowUp",
        keyCode: 38,
        shiftKey: true,
      });
    } else if (volumeLevel === "levelDown" && volumeNow > minVolume) {
      if (inputVol && volumeNow > inputVol) {
        volumeChange = volumeNow - inputVol;
        volumeChangeSteps = volumeChange * 10;
      }
      volumeChangeEvent = new KeyboardEvent("keydown", {
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
      volumeChangeReceiver.dispatchEvent(volumeChangeEvent);
    }
  }

  isMuted() {
    const sliderWrapper = this.querySelector(".volume__sliderWrapper");
    const volumeNow = parseFloat(sliderWrapper.getAttribute("aria-valuenow"));
    const muted = volumeNow === 0;
    return muted ? 1 : 0;
  }

  action_mute() {
    if (!this.isMuted()) {
      const muteButton = this.querySelector(".volume__button");
      muteButton.click();
    }
  }

  action_unmute() {
    if (this.isMuted()) {
      const unmuteButton = this.querySelector(".volume__button");
      unmuteButton.click();
    }
  }

  action_playAlbum({ query, thenPlay }) {
    this.action_search({ query, thenPlay });
  }
}

Player.register();
