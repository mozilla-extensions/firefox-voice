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

function addListener() {
  browser.runtime.onMessage.addListener(message => {
    if (message.type === "stopReading") {
      const element = document.querySelector(".narrate-start-stop");
      if (element) {
        // element.click();
        console.log("clicking element", element);
        element.dispatchEvent(new MouseEvent("click"));
      }
    } else {
      console.log("Received unexpected message in startNarration:", message);
    }
  });
}

startNarration();
addListener();
