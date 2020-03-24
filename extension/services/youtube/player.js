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

      if (this.querySelectorAll("video") && this.querySelectorAll("video")[0] && this.querySelectorAll("video")[0].baseURI) {
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

    action_playAlbum() {
      const button = this.querySelectorAll("ytd-playlist-renderer a")[0];
      button.click();
    }
  }

  Player.register();
})();
