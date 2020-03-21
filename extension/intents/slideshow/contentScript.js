/* globals communicate */

this.slideshowScript = (function() {
  let slideElements = [];
  let currentSlideIndex = 0;
  let iframeContainer, slideContainer, iframeDoc;

  const videoSources = ["youtube.com", "vimeo.com"];
  buildSlideStructure();

  function buildSlideStructure() {
    // create iframe element
    iframeContainer = document.createElement("iframe");
    iframeContainer.className = "fv-slideshow-frame";
    iframeContainer.height = document.documentElement.clientHeight;
    iframeContainer.width = document.documentElement.clientWidth;
    iframeContainer.style.display = "none";
    iframeContainer.style.position = "fixed";
    iframeContainer.style.top = 0;
    iframeContainer.style.left = 0;
    iframeContainer.style.zIndex = 100;

    document.body.appendChild(iframeContainer);

    iframeContainer.addEventListener("load", function() {
      iframeDoc = iframeContainer.contentWindow.document;

      const iframeLink = iframeDoc.createElement("link");
      iframeLink.type = "text/css";
      iframeLink.rel = "stylesheet";
      iframeLink.href = browser.runtime.getURL("intents/slideshow/contentScript.css");
      iframeDoc.head.appendChild(iframeLink);

      const lightboxElement = document.createElement("div");
      lightboxElement.className = "fv-lightbox-container";

      const slideshowContainer = iframeDoc.createElement("div");
      slideshowContainer.className = "fv-slideshow-container";

      const navbar = iframeDoc.createElement("div");
      navbar.className = "fv-navbar";

      const tagClose = iframeDoc.createElement("a");
      tagClose.className = "fv-close";
      tagClose.textContent = String.fromCharCode(0x274c);
      tagClose.addEventListener("click", hideSlideShow);

      const tagPrev = iframeDoc.createElement("a");
      tagPrev.className = "fv-prev";
      tagPrev.textContent = String.fromCharCode(10094);
      tagPrev.addEventListener("click", previousSlide);

      const tagNext = iframeDoc.createElement("a");
      tagNext.className = "fv-next";
      tagNext.textContent = String.fromCharCode(10095);
      tagNext.addEventListener("click", nextSlide);

      slideContainer = iframeDoc.createElement("div");
      slideContainer.className = "fv-slide-image";

      slideshowContainer.append(slideContainer);

      navbar.append(tagClose);
      navbar.append(tagNext);
      navbar.append(tagPrev);

      lightboxElement.append(navbar);
      lightboxElement.append(slideshowContainer);

      iframeDoc.body.append(lightboxElement);

      slideElements = detectAllMedia();

      window.addEventListener("resize", function() {
        iframeContainer.height = document.documentElement.clientHeight;
        iframeContainer.width = document.documentElement.clientWidth;
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
      });
    });
  }

  function hideSlideShow(event) {
    if (event.target.className === "fv-close") {
      iframeContainer.style.display = "none";
      swapSlide();
    }
  }

  function revealSlideshow() {
    swapSlide(slideElements[0]);
    iframeContainer.style.display = "block";
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
          const img = iframeDoc.createElement("img");
          img.setAttribute("src", element.getAttribute("src"));
          slideElements.push(img);

          break;
        }
        case "VIDEO": {
          const vid = iframeDoc.createElement("video");
          vid.setAttribute("src", element.getAttribute("src"));
          vid.setAttribute("controls", true);
          slideElements.push(vid);

          break;
        }
        case "IFRAME": {
          if (isVideoSourceUrl(element.getAttribute("src"))) {
            const iframe = iframeDoc.createElement("iframe");
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
