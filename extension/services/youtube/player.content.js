/* globals log */
import { Runner } from "../../content/helpers.js";

class Player extends Runner {
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

  action_adjustVolume({ inputVolume = null, volumeLevel = "setInput" }) {
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
    let ariaValueNow = parseInt(volumePanel.getAttribute("aria-valuenow"));
    let ariaValueText = volumePanel.getAttribute("aria-valuetext");
    let volumeSliderValue = ariaValueNow / heightFactor;
    let volumeNow = ariaValueNow / 100;
    let inputVol = 0;
    let volumeChange = 0.2;

    if (inputVolume !== null) {
      if (inputVolume > 0) {
        inputVol = (inputVolume / 100).toPrecision(2);
      } else if (inputVolume === "0") {
        this.action_mute();
        return;
      }
    }
    if (volumeLevel === "levelUp" && volumeNow < maxVolume) {
      if (inputVol && volumeNow < inputVol) {
        volumeChange = inputVol - volumeNow;
      }
      volumeNow =
        volumeNow <= maxVolume - volumeChange
          ? volumeNow + volumeChange
          : maxVolume;
    } else if (volumeLevel === "levelDown" && volumeNow > minVolume) {
      if (inputVol && volumeNow > inputVol) {
        volumeChange = volumeNow - inputVol;
      }
      volumeNow =
        volumeNow >= minVolume + volumeChange
          ? volumeNow - volumeChange
          : minVolume;
    } else if (volumeLevel === "setInput") {
      volumeNow = inputVol ? inputVol : volumeChange;
    }
    if (this.isMuted()) {
      this.action_unmute();
    }
    ytVideo.volume = volumeNow;
    ariaValueNow = Math.round(volumeNow / ariaValueFactor);
    ariaValueText =
      ariaValueNow === 0
        ? `${ariaValueNow}% volume muted`
        : `${ariaValueNow}% volume`;
    volumeSliderValue = ariaValueNow / heightFactor;
    ytVideo.onvolumechange = () => {
      volumePanel.setAttribute("aria-valuenow", ariaValueNow);
      volumePanel.setAttribute("aria-valuetext", ariaValueText);
      volumeSliderHandle.style.left = `${volumeSliderValue}px`;
    };
  }

  isMuted() {
    const volumeButton = document.querySelector(".ytp-mute-button");
    const muted =
      volumeButton.getAttribute("aria-label").match(/Unmute/) !== null;
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
