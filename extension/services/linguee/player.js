/* globals helpers */

this.player = (function() {
  const SEARCH_PLAY = ".lemma .audio";
  class Player extends helpers.Runner {
    action_play() {
      const button = this.querySelector(SEARCH_PLAY);
      button.click();
    }
  }
  Player.register();
})();
