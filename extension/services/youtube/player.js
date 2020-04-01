/* globals helpers, log */

this.player = (function() {
  class Player extends helpers.Runner {
    constructor() {
      super();
      this.isChannelOrUserOrPlaylist();
    }

    isChannelOrUserOrPlaylist() {
      try {
        if (this.querySelector("ytd-miniplayer video")) {
          this.videoPlayer = "ytd-miniplayer video";
          this.selector = ".miniplayer .ytp-miniplayer-controls";
          return;
        }
      } catch (e) {
        log.info(e);
      }

      if (
        this.querySelectorAll("video") &&
        this.querySelectorAll("video")[0] &&
        this.querySelectorAll("video")[0].baseURI
      ) {
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
        `${this.selector} button[aria-label='Play (k)']`
      );
      button.click();
    }

    action_pause() {
      if (this.isPaused()) {
        log.info("Attempting to pause a video that is already paused");
        return;
      }
      const button = this.querySelector(
        `${this.selector} button[aria-label='Pause (k)']`
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

    action_adjustVolume({ volumeLevel }) {
      const maxVolume = 1.0;
      const minVolume = 0.0;
      const ariaValueFactor = 0.01;
      const heightFactor = 2.5;
      const ytVideo = this.querySelector(`${this.selector} .html5-main-video`);
      const volumePanel = this.querySelector(
        `${this.selector} .ytp-volume-panel`
      );
      const volumeSliderHandle = this.querySelector(
        `${this.selector} .ytp-volume-slider-handle`
      );
      let volumeNow = ytVideo.volume;
      let ariaValueNow = parseInt(volumePanel.getAttribute("aria-valuenow"));
      let volumeSliderValue = ariaValueNow / heightFactor;
      const volumeChange = 0.2;

      if (volumeLevel === "levelUp" && volumeNow < maxVolume) {
        if (this.isMuted()) {
          this.action_unmute();
        }
        volumeNow =
          volumeNow <= maxVolume - volumeChange
            ? volumeNow + volumeChange
            : maxVolume;
        ytVideo.volume = volumeNow;
        ariaValueNow = Math.round(volumeNow / ariaValueFactor);
        volumeSliderValue = ariaValueNow / heightFactor;

        ytVideo.onvolumechange = () => {
          volumePanel.setAttribute("aria-valuenow", ariaValueNow);
          volumePanel.setAttribute("aria-valuetext", `${ariaValueNow}% volume`);
          volumeSliderHandle.style.left = `${volumeSliderValue}px`;
        };
      } else if (volumeLevel === "levelDown" && volumeNow > minVolume) {
        volumeNow =
          volumeNow >= minVolume + volumeChange
            ? volumeNow - volumeChange
            : minVolume;
        ytVideo.volume = volumeNow;
        ariaValueNow = Math.round(volumeNow / ariaValueFactor);
        volumeSliderValue = ariaValueNow / heightFactor;

        ytVideo.onvolumechange = () => {
          volumePanel.setAttribute("aria-valuenow", ariaValueNow);
          volumePanel.setAttribute("aria-valuetext", `${ariaValueNow}% volume`);
          volumeSliderHandle.style.left = `${volumeSliderValue}px`;
        };
      }
    }

    isMuted() {
      const volumePanel = document.querySelector(".ytp-volume-panel");
      const muted =
        volumePanel.getAttribute("aria-valuetext").match(/muted/) !== null;
      return muted ? 1 : 0;
    }

    action_mute() {
      if (!this.isMuted()) {
        const muteButton = this.querySelector(
          `${this.selector} .ytp-mute-button[aria-label^='Mute']`
        );
        muteButton.click();
      }
    }

    action_unmute() {
      if (this.isMuted()) {
        const unmuteButton = this.querySelector(
          `${this.selector} .ytp-mute-button[aria-label^='Unmute']`
        );
        unmuteButton.click();
      }
    }

    action_playAlbum() {
      const button = this.querySelectorAll("ytd-playlist-renderer a")[0];
      button.click();
    }
  }

  Player.register();
})();
