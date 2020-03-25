/* globals helpers, log */

this.player = (function() {
  class Player extends helpers.Runner {
    constructor() {
      super();
      this.isChannelOrUser();
    }

    isChannelOrUser() {
      const baseURI = this.querySelectorAll("video")[0].baseURI;
      const isChannel =
        /\bchannel\b/gi.test(baseURI) || /\buser\b/gi.test(baseURI);
      if (isChannel) {
        this.videoPlayer = "ytd-channel-video-player-renderer video";
        this.selector = "ytd-channel-video-player-renderer";
      } else {
        this.videoPlayer =
          "ytd-player[context='WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_WATCH'] video";
        this.selector =
          "ytd-player[context='WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_WATCH']";
      }
    }

    isPaused() {
      const video = this.querySelector(this.videoPlayer);
      return video.paused;
    }

    action_play() {
      if (!this.isPaused()) {
        log.info("Attempting to play a video that is already playing");
        return;
      }
      const button = this.querySelector(
        `${this.selector} button.ytp-large-play-button[aria-label^='Play']`
      );
      button.click();
    }

    action_pause() {
      if (this.isPaused()) {
        log.info("Attempting to pause a video that is already paused");
        return;
      }
      const button = this.querySelector(
        `${this.selector} button.ytp-play-button[aria-label^='Pause']`
      );
      button.click();
    }

    action_unpause() {
      this.action_play();
    }

    action_move({ direction }) {
      if (direction !== "next") {
        throw new Error("Unexpected direction");
      }
      const button = this.querySelector(`${this.selector} .ytp-next-button`);
      button.click();
    }

    action_adjustVolume({ level }) {
      const maxVolume = 1.0;
      const minVolume = 0.0;
      const ytVideo = this.querySelector(`${this.selector} .html5-main-video`);
      const volumePanel = this.querySelector(
        `${this.selector} .ytp-volume-panel`
      );
      const volumeSliderHandle = this.querySelector(
        `${this.selector} .ytp-volume-slider-handle`
      );
      let vol = ytVideo.volume;
      let ariaValueNow = parseInt(volumePanel.getAttribute("aria-valuenow"));
      let volumeSliderValue = ariaValueNow / 2.5;

      if (level === "levelUp" && vol < 1.0) {
        vol = vol <= maxVolume - 0.2 ? vol + 0.2 : maxVolume;
        ytVideo.volume = vol;
        ariaValueNow = Math.round(vol / 0.01);
        volumeSliderValue = ariaValueNow / 2.5;

        ytVideo.onvolumechange = () => {
          volumePanel.setAttribute("aria-valuenow", ariaValueNow);
          volumePanel.setAttribute("aria-valuetext", `${ariaValueNow}% volume`);
          volumeSliderHandle.style.left = `${volumeSliderValue}px`;
        };
      } else if (level === "levelDown" && vol > 0.0) {
        vol = vol >= minVolume + 0.2 ? vol - 0.2 : minVolume;
        ytVideo.volume = vol;
        ariaValueNow = Math.round(vol / 0.01);
        volumeSliderValue = ariaValueNow / 2.5;

        ytVideo.onvolumechange = () => {
          volumePanel.setAttribute("aria-valuenow", ariaValueNow);
          volumePanel.setAttribute("aria-valuetext", `${ariaValueNow}% volume`);
          volumeSliderHandle.style.left = `${volumeSliderValue}px`;
        };
      }
    }

    getVolume() {
      const volumePanel = document.querySelector(".ytp-volume-panel");
      const vol = parseInt(volumePanel.getAttribute("aria-valuenow"));
      const isMuted =
        volumePanel.getAttribute("aria-valuetext").match(/muted/) !== null;

      return isMuted ? 0 : vol;
    }

    action_mute() {
      if (this.getVolume()) {
        const muteButton = this.querySelector(
          `${this.selector} .ytp-mute-button[aria-label^='Mute']`
        );
        muteButton.click();
      }
    }

    action_unmute() {
      if (!this.getVolume()) {
        const unmuteButton = this.querySelector(
          `${this.selector} .ytp-mute-button[aria-label^='Unmute']`
        );
        unmuteButton.click();
      }
    }
  }

  Player.register();
})();
