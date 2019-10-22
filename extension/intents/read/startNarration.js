/* globals communicate */

function startNarration() {
  const dropdown = document.querySelector(".narrate-dropdown");
  if (dropdown) {
    dropdown.classList.add("open");
  }
  const element = document.querySelector(".narrate-start-stop[title='Start']");
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

communicate.register("narrate", startNarration);
communicate.register("stopReading", () => {
  const element = document.querySelector(".narrate-start-stop[title='Stop']");
  if (!element) {
    return false;
  }
  element.dispatchEvent(new MouseEvent("click"));
  return true;
});
