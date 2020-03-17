/* globals communicate */

this.slideshowScript = (function() {
  let slideElements = [];
  let currentSlideIndex = 0;

  const videoSources = ["youtube.com", "vimeo.com"];

  slideElements = detectAllMedia();
  buildSlideStructure();

  const lbContainer = document.body.querySelector(".fv-lightbox-container");
  const slideContainer = document.body.querySelector(".fv-slide-image");

  window.onresize = function() {
    if (slideContainer.hasChildNodes()) {
      if (slideContainer.firstChild.tagName === "IFRAME") {
        slideContainer.firstChild.setAttribute(
          "width",
          document.documentElement.clientWidth
        );
        slideContainer.firstChild.setAttribute(
          "height",
          document.documentElement.clientHeight
        );
      }
    }
  };

  function buildSlideStructure() {
    const lightboxElement = document.createElement("div");
    lightboxElement.className = "fv-lightbox-container";
    lightboxElement.onclick = hideSlideShow;

    const slideshowContainer = document.createElement("div");
    slideshowContainer.className = "fv-slideshow-container";

    const navbar = document.createElement("div");
    navbar.className = "fv-navbar";

    const tagClose = document.createElement("a");
    tagClose.className = "fv-close";
    tagClose.textContent = String.fromCharCode(0x274c);
    tagClose.onclick = hideSlideShow;

    const tagPrev = document.createElement("a");
    tagPrev.className = "fv-prev";
    tagPrev.textContent = String.fromCharCode(10094);
    tagPrev.onclick = previousSlide;

    const tagNext = document.createElement("a");
    tagNext.className = "fv-next";
    tagNext.textContent = String.fromCharCode(10095);
    tagNext.onclick = nextSlide;

    const slideImage = document.createElement("div");
    slideImage.className = "fv-slide-image";

    slideshowContainer.appendChild(slideImage);
    slideshowContainer.appendChild(tagPrev);
    slideshowContainer.appendChild(tagNext);

    navbar.appendChild(tagClose);
    navbar.appendChild(tagNext);
    navbar.appendChild(tagPrev);

    lightboxElement.appendChild(navbar);
    lightboxElement.appendChild(slideshowContainer);

    document.body.appendChild(lightboxElement);
  }

  function hideSlideShow(event) {
    if (event.target === document.body.querySelector(".fv-close")) {
      lbContainer.style.display = "none";
      swapSlide();
    }
  }

  function revealSlideshow() {
    swapSlide(slideElements[0]);
    lbContainer.style.display = "block";
  }

  function isVideoSourceUrl(url) {
    let testExp = "";
    const result = videoSources.some(function(videoSource) {
      testExp = new RegExp(`^(https?:\/\/)?(www\.)?${videoSource}`);
      return testExp.test(url);
    });

    return result;
  }

  function detectAllMedia() {
    const selector = "img, video, iframe";
    // detect all supported elements
    const mediaElements = document.body.querySelectorAll(selector);

    // iterate thru list and add to array

    mediaElements.forEach(element => {
      // strip their current classes

      element.className = "";
      switch (element.tagName) {
        case "IMG": {
          const img = document.createElement("img");
          img.setAttribute("src", element.getAttribute("src"));
          slideElements.push(img);

          break;
        }
        case "VIDEO": {
          const vid = document.createElement("video");
          vid.setAttribute("src", element.getAttribute("src"));
          vid.setAttribute("controls", true);
          slideElements.push(vid);

          break;
        }
        case "IFRAME": {
          if (isVideoSourceUrl(element.getAttribute("src"))) {
            const iframe = document.createElement("iframe");
            iframe.setAttribute("src", element.getAttribute("src"));
            iframe.setAttribute("width", document.documentElement.clientWidth);
            iframe.setAttribute(
              "height",
              document.documentElement.clientHeight
            );
            slideElements.push(iframe);
          }

          break;
        }
      }
    });

    return slideElements;
  }

  function previousSlide() {
    moveSlide(-1);
  }

  function nextSlide() {
    moveSlide(1);
  }

  function moveSlide(steps) {
    let newIndex = currentSlideIndex + steps;
    if (newIndex > slideElements.length - 1) {
      newIndex = 0;
    }
    if (newIndex < 0) {
      newIndex = slideElements.length - 1;
    }

    showSlide(newIndex);
  }

  function showSlide(slideIndex) {
    currentSlideIndex = slideIndex;
    swapSlide(slideElements[slideIndex]);
  }

  function swapSlide(newSlide) {
    if (slideContainer.hasChildNodes()) {
      slideContainer.firstChild.remove();
    }
    if (newSlide) {
      if (newSlide.tagName === "IFRAME") {
        // enable iframe to resize first
        newSlide.setAttribute("width", document.documentElement.clientWidth);
        newSlide.setAttribute("height", document.documentElement.clientHeight);
      }
      slideContainer.appendChild(newSlide);
    }
  }

  communicate.register("openSlide", async message => {
    revealSlideshow();

    return true;
  });
})();
