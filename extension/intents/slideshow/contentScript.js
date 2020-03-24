/* globals communicate */

this.slideshowScript = (function() {
  let slideElements = [];
  let currentSlideIndex = 0;
  const galleryElements = [];
  let iframeContainer, slideContainer, iframeDoc;
  let iframeBlocker, galleryContainer, slideshowContainer;

  const videoSources = ["youtube.com", "vimeo.com"];
  buildSlideStructure();

  function buildThumbnailGallery() {
    let thumbnailElement, thumbnail;
    slideElements.forEach(function(element, index) {
      thumbnailElement = iframeDoc.createElement("div");

      switch (element.tagName) {
        case "VIDEO": {
          thumbnailElement.className = "fv-image-thumbnail-container fv-thumbnail";

          thumbnail = iframeDoc.createElement(element.tagName);
          thumbnail.className = "fv-image-thumbnail";
          thumbnail.setAttribute("src", element.getAttribute("src"));
          if (element.hasAttribute("poster")) {
            thumbnail.setAttribute("poster", element.getAttribute("poster"));
          }
          thumbnail.setAttribute("data-thumb-index", index);
          thumbnail.addEventListener("click", thumbnailClick);

          break;
        }
        case "IMG": {
          thumbnailElement.className = "fv-image-thumbnail-container fv-thumbnail";

          thumbnail = iframeDoc.createElement(element.tagName);
          thumbnail.className = "fv-image-thumbnail";
          thumbnail.setAttribute("src", element.getAttribute("src"));
          thumbnail.setAttribute("data-thumb-index", index);
          thumbnail.addEventListener("click", thumbnailClick);

          break;
        }
        case "IFRAME": {
          thumbnailElement.className = "fv-iframe-thumbnail-container fv-thumbnail";

          iframeBlocker = iframeDoc.createElement("div");
          iframeBlocker.style.position = "absolute";
          iframeBlocker.style.top = 0;
          iframeBlocker.style.left = 0;
          iframeBlocker.style.zIndex = 2;
          iframeBlocker.style.width = "100%";
          iframeBlocker.style.height = "100%";
          iframeBlocker.setAttribute("data-thumb-index", index);
          iframeBlocker.addEventListener("click", thumbnailClick);
          iframeBlocker.style.cursor = "pointer";
          thumbnailElement.append(iframeBlocker);

          thumbnail = iframeDoc.createElement(element.tagName);
          thumbnail.className = "fv-iframe-thumbnail";
          thumbnail.setAttribute("src", element.getAttribute("src"));

          break;
        }
      }

      thumbnailElement.append(thumbnail);
      galleryElements.push(thumbnailElement);
    });
  }

  // event handler to switch from selected thumbnail to slide
  function thumbnailClick(event) {
    event.preventDefault();
    const thumbIndex = parseInt(event.target.dataset.thumbIndex, 10);
    showSlide(thumbIndex);
    toggleGallery();
  }

  // toggle between gallery and slide
  function toggleGallery(event) {
    if (!event || event.target.className === "fv-view-slide") {
      galleryContainer.style.display = "none";
      slideshowContainer.style.display = "flex";
    } else if (event.target.className === "fv-view-gallery") {
      galleryContainer.style.display = "block";
      slideshowContainer.style.display = "none";
    }
  }

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
      // contentWindow is first accessible here
      iframeDoc = iframeContainer.contentWindow.document;

      // add css file link in header
      const iframeLink = iframeDoc.createElement("link");
      iframeLink.type = "text/css";
      iframeLink.rel = "stylesheet";
      iframeLink.href = browser.runtime.getURL("intents/slideshow/contentScript.css");
      iframeDoc.head.appendChild(iframeLink);

      // containers for slideshow and gallery
      const lightboxElement = document.createElement("div");
      lightboxElement.className = "fv-lightbox-container";

      // slideshow container
      slideshowContainer = iframeDoc.createElement("div");
      slideshowContainer.className = "fv-slideshow-container";

      // gallery container
      galleryContainer = iframeDoc.createElement("div");
      galleryContainer.className = "fv-gallery-container";

      // thumbnail gallery
      const thumbnailGallery = document.createElement("div");
      thumbnailGallery.className = "fv-thumbnail-gallery";

      // navigation bar
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

      const tagViewSlide = document.createElement("a");
      tagViewSlide.className = "fv-view-slide";
      tagViewSlide.textContent = String.fromCharCode(10696);
      tagViewSlide.onclick = toggleGallery;

      const tagViewGallery = document.createElement("a");
      tagViewGallery.className = "fv-view-gallery";
      tagViewGallery.textContent = String.fromCharCode(9638);
      tagViewGallery.onclick = toggleGallery;

      // images and video container
      slideContainer = iframeDoc.createElement("div");
      slideContainer.className = "fv-slide-image";

      // putting it all together
      slideshowContainer.append(slideContainer);

      navbar.appendChild(tagViewGallery);
      navbar.appendChild(tagViewSlide);
      navbar.append(tagClose);
      navbar.append(tagNext);
      navbar.append(tagPrev);

      galleryContainer.appendChild(thumbnailGallery);

      lightboxElement.append(navbar);
      lightboxElement.append(slideshowContainer);
      lightboxElement.appendChild(galleryContainer);

      iframeDoc.body.append(lightboxElement);

      // find images and videos on current tab
      slideElements = detectAllMedia();

      // generate thumbnail gallery elements
      buildThumbnailGallery();

      // join gallery elements to build gallery
      galleryElements.forEach(function(element) {
        thumbnailGallery.append(element);
      });

      // make iframes responsive
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
          if (element.hasAttribute("poster")) {
            vid.setAttribute("poster", element.getAttribute("poster"));
          }
          if (element.hasChildNodes()) {
            element.childNodes.forEach(function(childElement) {
              if (childElement.tagName === "SOURCE") {
                const srcElement = iframeDoc.createElement("source");
                srcElement.setAttribute("src", childElement.src);
                if (childElement.hasAttribute("type")) {
                  srcElement.setAttribute("type", childElement.type);
                }

                vid.appendChild(srcElement);
              }
            });
          }
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
