import * as music from "../../intents/music/music.js";
import MusicService from "../../background/musicService.js";

class Spotify extends MusicService {}

Object.assign(Spotify, {
  id: "spotify",
  title: "Spotify",
  baseUrl: "https://open.spotify.com/",
});

music.register(Spotify);
