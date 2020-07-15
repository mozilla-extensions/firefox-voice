/* globals communicate */

function startNarration() {
  const dropdown = document.querySelector(".narrate-dropdown");
  if (dropdown) {
    dropdown.classList.add("open");
  }
  if (isPlaying()) {
    return false;
  }
  const element = document.querySelector(".narrate-start-stop");
  if (!element) {
    return false;
  }
  if (element) {
    element.click();
  } else {
    setTimeout(startNarration, 500);
  }
  return true;
}

function isPlaying() {
  const element = document.querySelector(".narrate-skip-previous");
  // The skip buttons are disabled when the player isn't playing
  return !element.disabled;
}

communicate.register("narrate", startNarration);
communicate.register("stopReading", () => {
  if (!isPlaying()) {
    return false;
  }
  const element = document.querySelector(".narrate-start-stop");
  if (!element) {
    return false;
  }
  element.dispatchEvent(new MouseEvent("click"));
  return true;
});

communicate.register("forward", () => {
  if (!isPlaying()) {
    return false;
  }
  const element = document.querySelector(".narrate-skip-next");
  if (!element) {
    return false;
  }
  element.dispatchEvent(new MouseEvent("click"));
  return true;
});

communicate.register("backward", () => {
  if (!isPlaying()) {
    return false;
  }
  const element = document.querySelector(".narrate-skip-previous");
  if (!element) {
    return false;
  }
  element.dispatchEvent(new MouseEvent("click"));
  return true;
});
