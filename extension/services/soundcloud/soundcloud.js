import MusicService from "../../background/musicService.js";
import * as music from "../../intents/music/music.js";

class Soundcloud extends MusicService {}

Object.assign(Soundcloud, {
  id: "soundcloud",
  title: "SoundCloud",
  baseUrl: "https://soundcloud.com/",
  imgSrc: "/assets/images/soundcloud.svg",
});

music.register(Soundcloud);
