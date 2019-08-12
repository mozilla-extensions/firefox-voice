function startNarration() {
  const element = document.querySelector(".narrate-start-stop");
  if (element) {
    element.click();
  } else {
    setTimeout(startNarration, 500);
  }
}

startNarration();
