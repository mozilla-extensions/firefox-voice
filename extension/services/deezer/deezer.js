import * as music from "../../intents/music/music.js";
import MusicService from "../../background/MusicService.js";

class Deezer extends MusicService {};

Object.assign(Deezer, {
  id: "deezer",
  title: "deezer",
  baseUrl: "https://www.deezer.com/",
});

music.register(Deezer);
