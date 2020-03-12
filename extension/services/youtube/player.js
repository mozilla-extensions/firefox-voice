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
  }

  Player.register();
})();
