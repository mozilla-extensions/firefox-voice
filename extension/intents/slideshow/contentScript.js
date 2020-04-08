/* globals communicate */

this.slideshowScript = (function() {
  let slideElements = [];
  let lastElementIndex = -1;
  let lastGalleryIndex = -1;
  let currentSlideIndex = 0;
  const galleryElements = [];
  let iframeContainer, slideContainer, iframeDoc;
  let iframeBlocker, galleryContainer, slideshowContainer, thumbnailGallery;

  const videoSources = ["youtube.com", "vimeo.com"];
  buildSlideStructure();

  function buildThumbnailGallery({ fromIndex = -1, rebuild = false } = {}) {
    let thumbnailElement, thumbnail;

    if (rebuild) {
      galleryElements.splice(0, galleryElements.length);
    }

    for (
      let elementIndex = 0;
      elementIndex < slideElements.length;
      elementIndex++
    ) {
      if (fromIndex >= elementIndex) {
        continue;
      }

      const element = slideElements[elementIndex];

      thumbnailElement = iframeDoc.createElement("div");

      switch (element.tagName) {
        case "VIDEO": {
          thumbnailElement.className =
            "fv-image-thumbnail-container fv-thumbnail";

          thumbnail = iframeDoc.createElement(element.tagName);
          thumbnail.className = "fv-image-thumbnail";
          thumbnail.setAttribute("src", element.getAttribute("src"));
          if (element.hasAttribute("poster")) {
            thumbnail.setAttribute("poster", element.getAttribute("poster"));
          }
          thumbnail.setAttribute("data-thumb-index", elementIndex);
          thumbnail.addEventListener("click", thumbnailClick);

          break;
        }
        case "IMG": {
          thumbnailElement.className =
            "fv-image-thumbnail-container fv-thumbnail";

          thumbnail = iframeDoc.createElement(element.tagName);
          thumbnail.className = "fv-image-thumbnail";
          thumbnail.setAttribute("src", element.getAttribute("src"));
          thumbnail.setAttribute("data-thumb-index", elementIndex);
          thumbnail.addEventListener("click", thumbnailClick);

          break;
        }
        case "IFRAME": {
          thumbnailElement.className =
            "fv-iframe-thumbnail-container fv-thumbnail";

          iframeBlocker = iframeDoc.createElement("div");
          iframeBlocker.style.position = "absolute";
          iframeBlocker.style.top = 0;
          iframeBlocker.style.left = 0;
          iframeBlocker.style.zIndex = 2;
          iframeBlocker.style.width = "100%";
          iframeBlocker.style.height = "100%";
          iframeBlocker.setAttribute("data-thumb-index", elementIndex);
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

      lastGalleryIndex = elementIndex;
    }
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
    iframeContainer.src = browser.runtime.getURL(
      "intents/slideshow/slideshow.html"
    );
    iframeContainer.className = "fv-slideshow-frame";
    iframeContainer.height = document.documentElement.clientHeight;
    iframeContainer.width = document.documentElement.clientWidth;
    iframeContainer.style.display = "none";
    iframeContainer.style.position = "fixed";
    iframeContainer.style.top = 0;
    iframeContainer.style.left = 0;
    iframeContainer.style.zIndex = 99999999999;

    document.body.appendChild(iframeContainer);

    iframeContainer.addEventListener("load", function() {
      // security check to confirm src
      if (
        iframeContainer.src !==
        browser.runtime.getURL("intents/slideshow/slideshow.html")
      ) {
        const err = new Error("Iframe source is invalid");
        err.displayMessage = "Iframe source is invalid";
        throw err;
      }

      // contentWindow is first accessible here
      iframeDoc = iframeContainer.contentWindow.document;
      iframeDoc.addEventListener("keyup", function(event) {
        switch (event.key) {
          case "ArrowLeft": {
            previousSlide();
            break;
          }
          case "ArrowRight": {
            nextSlide();
            break;
          }
          case "Escape": {
            hideSlideShow(null);
            break;
          }
        }
      });

      // add css file link in header
      const iframeLink = iframeDoc.createElement("link");
      iframeLink.type = "text/css";
      iframeLink.rel = "stylesheet";
      iframeLink.href = browser.runtime.getURL(
        "intents/slideshow/contentScript.css"
      );
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
      thumbnailGallery = document.createElement("div");
      thumbnailGallery.className = "fv-thumbnail-gallery";

      // navigation bar
      const navbar = iframeDoc.createElement("div");
      navbar.className = "fv-navbar";

      const tagClose = iframeDoc.createElement("a");
      tagClose.className = "fv-close";
      tagClose.textContent = String.fromCharCode(0x274c);
      tagClose.addEventListener("click", hideSlideShow);
      tagClose.title = "Close Slideshow";

      const tagPrev = iframeDoc.createElement("a");
      tagPrev.className = "fv-prev";
      tagPrev.textContent = String.fromCharCode(10094);
      tagPrev.addEventListener("click", previousSlide);
      tagPrev.title = "Previous Slide";

      const tagNext = iframeDoc.createElement("a");
      tagNext.className = "fv-next";
      tagNext.textContent = String.fromCharCode(10095);
      tagNext.addEventListener("click", nextSlide);
      tagNext.title = "Next Slide";

      const tagViewSlide = document.createElement("a");
      tagViewSlide.className = "fv-view-slide";
      tagViewSlide.textContent = String.fromCharCode(10696);
      tagViewSlide.onclick = toggleGallery;
      tagViewSlide.title = "View Slide";

      const tagViewGallery = document.createElement("a");
      tagViewGallery.className = "fv-view-gallery";
      tagViewGallery.textContent = String.fromCharCode(9638);
      tagViewGallery.onclick = toggleGallery;
      tagViewGallery.title = "View Gallery";

      const tagUpdateGallery = document.createElement("a");
      tagUpdateGallery.className = "fv-update-gallery";
      tagUpdateGallery.textContent = String.fromCharCode(8635);
      tagUpdateGallery.onclick = updateMediaElements;
      tagUpdateGallery.title = "Update Gallery with New Images";

      const tagRebuildGallery = document.createElement("a");
      tagRebuildGallery.className = "fv-reload-gallery";
      tagRebuildGallery.textContent = String.fromCharCode(8409);
      tagRebuildGallery.onclick = rebuildMediaElements;
      tagRebuildGallery.title = "Reload Gallery";

      // images and video container
      slideContainer = iframeDoc.createElement("div");
      slideContainer.className = "fv-slide-image";

      // putting it all together
      slideshowContainer.append(slideContainer);

      navbar.appendChild(tagViewGallery);
      navbar.appendChild(tagViewSlide);
      navbar.appendChild(tagUpdateGallery);
      navbar.appendChild(tagRebuildGallery);
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
        if (slideContainer && slideContainer.hasChildNodes()) {
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
    if (event === null || event.target.className === "fv-close") {
      iframeContainer.style.display = "none";
      swapSlide();
    }
  }

  function revealSlideshow() {
    swapSlide(slideElements[0]);
    iframeContainer.style.display = "block";
    iframeContainer.focus();
  }

  function isVideoSourceUrl(url) {
    let testExp = "";
    const result = videoSources.some(function(videoSource) {
      testExp = new RegExp(`^(https?:\/\/)?(www\.)?${videoSource}`);
      return testExp.test(url);
    });

    return result;
  }

  function detectAllMedia({ fromIndex = -1, rebuild = false } = {}) {
    const selector = "img, video, iframe";
    // detect all supported elements
    const mediaElements = document.body.querySelectorAll(selector);

    if (rebuild) {
      // clear slideElements array
      slideElements.splice(0, slideElements.length);
    }

    // iterate thru list and add to array
    for (
      let elementIndex = 0;
      elementIndex < mediaElements.length;
      elementIndex++
    ) {
      if (fromIndex >= elementIndex) {
        continue;
      }

      const element = mediaElements[elementIndex];

      switch (element.tagName) {
        case "IMG": {
          if (element.clientHeight < 200 || element.clientWidth < 200) {
            break;
          }

          const img = iframeDoc.createElement("img");
          if (/^\/\//.test(element.getAttribute("src"))) {
            img.setAttribute("src", "https:" + element.getAttribute("src"));
          } else {
            img.setAttribute("src", element.getAttribute("src"));
          }

          // bypass jquery lazy-loading
          if (/lazy/.test(element.className)) {
            if (element.hasAttribute("data-lazy-src")) {
              img.setAttribute("src", element.getAttribute("data-lazy-src"));
            }
            if (element.hasAttribute("data-src")) {
              img.setAttribute("src", element.getAttribute("data-lazy-src"));
            }
          } else if (element.hasAttribute("data-lazy-src")) {
            img.setAttribute("src", element.getAttribute("data-lazy-src"));
          }

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

      lastElementIndex = elementIndex;
    }

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
    if (!slideContainer) {
      return;
    }
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

  // update gallery for pages with infinite scroll
  function updateMediaElements() {
    // detect media from the last index stopped
    detectAllMedia({ fromIndex: lastElementIndex });
    buildThumbnailGallery({ fromIndex: lastGalleryIndex });

    // append elements to gallery
    for (
      let index = lastGalleryIndex + 1;
      index < galleryElements.length;
      index++
    ) {
      const element = galleryElements[index];
      thumbnailGallery.append(element);
    }
  }

  // full gallery reload to help with lazy loaded sites or render errors
  function rebuildMediaElements() {
    // detect media from the last index stopped
    detectAllMedia({ rebuild: true });
    buildThumbnailGallery({ rebuild: true });

    // empty gallery
    while (thumbnailGallery.hasChildNodes()) {
      thumbnailGallery.firstChild.remove();
    }

    // join gallery elements to build gallery
    galleryElements.forEach(function(element) {
      thumbnailGallery.append(element);
    });
  }

  communicate.register("openSlide", async message => {
    revealSlideshow();

    return true;
  });
})();
