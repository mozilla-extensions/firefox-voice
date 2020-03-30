import * as music from "../../intents/music/music.js";
import MusicService from "../../background/musicService.js";

class Deezer extends MusicService {}

Object.assign(Deezer, {
  id: "deezer",
  title: "Deezer",
  baseUrl: "https://www.deezer.com/",
});

music.register(Deezer);
