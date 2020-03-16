import * as music from "../../intents/music/music.js";
import MusicService from "../../background/musicService.js";

class AppleMusic extends MusicService {}

Object.assign(AppleMusic, {
  id: "applemusic",
  title: "AppleMusic",
  baseUrl: "https://beta.music.apple.com/",
});

music.register(AppleMusic);
