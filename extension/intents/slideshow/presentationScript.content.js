import { registerHandler } from "../../background/communicate.js";

const PRESENT_BUTTON_SELECTOR = "#punch-start-presentation-left";
const SLIDE_THUMBNAILS = ".punch-filmstrip-thumbnail";

function clickElement(element) {
  element.dispatchEvent(new MouseEvent("mousedown"));
  element.dispatchEvent(new MouseEvent("mouseup"));
}

function startPresentation() {
  if (document.querySelectorAll(SLIDE_THUMBNAILS).length === 0) {
    return {
      success: false,
      message: "No slides present",
    };
  }
  const presentButton = document.querySelector(PRESENT_BUTTON_SELECTOR);
  if (!presentButton) {
    return {
      success: false,
      message: "Command could not be completed",
    };
  }

  clickElement(presentButton);

  return {
    success: true,
  };
}

registerHandler("startPresentation", async message => {
  return startPresentation();
});
