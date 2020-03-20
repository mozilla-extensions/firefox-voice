import * as music from "../../intents/music/music.js";
import MusicService from "../../background/musicService.js";

class Linguee extends MusicService {}

Object.assign(Linguee, {
  id: "linguee",
  title: "Linguee",
  baseUrl: "https://linguee.com/",
});

music.register(Linguee);
