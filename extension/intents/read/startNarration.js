function startNarration() {
  const dropdown = document.querySelector(".narrate-dropdown");
  if (dropdown) {
    dropdown.classList.add("open");
  }
  const element = document.querySelector(".narrate-start-stop");
  if (element) {
    element.click();
  } else {
    setTimeout(startNarration, 500);
  }
}

startNarration();
