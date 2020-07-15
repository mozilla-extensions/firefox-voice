import { registerHandler } from "../../communicate.js";

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

registerHandler("narrate", startNarration);

registerHandler("stopReading", () => {
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

registerHandler("forward", () => {
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

registerHandler("backward", () => {
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
