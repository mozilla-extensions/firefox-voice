/* globals communicate */

this.presentationScript = (function() {
  const PRESENT_BUTTON_SELECTOR = "#punch-start-presentation-left";
  const SLIDE_THUMBNAILS = ".punch-filmstrip-thumbnail";
  const ACTIVE_THUMBNAIL = ".punch-filmstrip-thumbnail > rect[fill]"; // note that this matches the child (background rect)

  function clickElement(element) {
    element.dispatchEvent(new MouseEvent("mousedown"));
    element.dispatchEvent(new MouseEvent("mouseup"));
  }

  function clickAtCoord(element, x, y) {
    const mousedownEvent = new MouseEvent("mousedown", {
      bubbles: true,
      view: window,
      clientX: x,
      clientY: y
    });
    const mouseupEvent = new MouseEvent("mouseup", {
      bubbles: true,
      view: window,
      clientX: x,
      clientY: y
    });
    element.dispatchEvent(mousedownEvent);
    element.dispatchEvent(mouseupEvent);
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

  communicate.register("startPresentation", async message => {
    return startPresentation();
  });

  function nextSlide() {
    if (document.querySelectorAll(SLIDE_THUMBNAILS).length === 0) {
      return {
        success: false,
        message: "No slides present",
      };
    }
    let activeThumbnail = document.querySelector(ACTIVE_THUMBNAIL).parentNode;
    if (!activeThumbnail) {
      activeThumbnail = document.querySelector(SLIDE_THUMBNAILS); // will grab first thumbnail
    }
    const nextThumbnail = activeThumbnail.nextSibling;
    if (!nextThumbnail) {
      return {
        success: false,
        message: "Already at the end of the slideshow",
      };
    }

    console.log("here I am");
    console.log(nextThumbnail);

    const rect = nextThumbnail.getBoundingClientRect();
    console.log(rect.top, rect.right, rect.bottom, rect.left);

    const x = rect.left + 5;
    const y = rect.top + 5;

    const thumbnailListener = document.querySelector('.punch-filmstrip-thumbnails');

    clickAtCoord(thumbnailListener, x, y);

    return {
      success: true,
    };
  }

  communicate.register("nextSlide", async message => {
    return nextSlide();
  });
})();
