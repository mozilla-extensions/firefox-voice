/* globals helpers */

this.player = (function() {
  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector("button.ytp-large-play-button");
      button.click();
      console.log("clicked", button);
    }

    action_pause() {
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
