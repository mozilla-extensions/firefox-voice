import * as music from "../../intents/music/music.js";
import MusicService from "../../background/musicService.js";

class Soundcloud extends MusicService {}

Object.assign(Soundcloud, {
  id: "soundcloud",
  title: "Soundcloud",
  baseUrl: "https://soundcloud.com/",
});

music.register(Soundcloud);
