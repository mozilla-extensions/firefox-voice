import MusicService from "../../background/musicService.js";
import * as music from "../../intents/music/music.js";

class Spotify extends MusicService {}

Object.assign(Spotify, {
  id: "spotify",
  title: "Spotify",
  baseUrl: "https://open.spotify.com/",
  imgSrc: "/assets/images/Spotify.svg",
});

music.register(Spotify);
