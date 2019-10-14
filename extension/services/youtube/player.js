/* globals helpers, log */

this.player = (function() {
  class Player extends helpers.Runner {
    isPaused() {
      const video = this.querySelector("video");
      return video.paused;
    }

    action_play() {
      if (!this.isPaused()) {
        log.info("Attempting to play a video that is already playing");
        return;
      }
      const button = this.querySelector(
        "button.ytp-large-play-button[aria-label^='Play']"
      );
      button.click();
    }

    action_pause() {
      if (this.isPaused()) {
        log.info("Attempting to paused a video that is already paused");
        return;
      }
      const button = this.querySelector(
        "button.ytp-play-button[aria-label^='Pause']"
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
      const button = this.querySelector(".ytp-next-button");
      button.click();
    }
  }

  Player.register();
})();
