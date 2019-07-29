// pauseMedia.js

(function() {
  const videos = document.getElementsByTagName("video");
  const audios = document.getElementsByTagName("audio");

  const firstMediaItem = videos.item(0) || audios.item(0);
  console.log("the first media item is this");
  console.log(firstMediaItem);
  if (firstMediaItem) {
    firstMediaItem.pause().then(result => {
      return "playing?";
    });
  } else {
    return "no media found";
  }
})();
