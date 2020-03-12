/* globals communicate */

const scrollAmount = 0.9;

function getScrollableElement() {
  let element = document.activeElement;
  let height = element.offsetHeight;
  let scrollPos = element.scrollTop;
  const scrollHeight = element.scrollHeight;

  if (document.contentType === "text/html") {
    element = window;
    height = element.innerHeight;
    scrollPos = element.scrollY;
  }

  return {
    element,
    height,
    scrollPos,
    scrollHeight,
  };
}

function scrollVertically(dy, smooth, element) {
  element.scrollBy({
    left: 0,
    top: dy,
    behavior: smooth ? "smooth" : "auto",
  });
  return true;
}

function scrollUp() {
  const toBeScrolled = getScrollableElement();
  return scrollVertically(
    -scrollAmount * toBeScrolled.height,
    true,
    toBeScrolled.element
  );
}

communicate.register("scrollUp", scrollUp);

function scrollDown() {
  const toBeScrolled = getScrollableElement();
  return scrollVertically(
    scrollAmount * toBeScrolled.height,
    true,
    toBeScrolled.element
  );
}

communicate.register("scrollDown", scrollDown);

function scrollToTop() {
  const toBeScrolled = getScrollableElement();
  return scrollVertically(-toBeScrolled.scrollPos, false, toBeScrolled.element);
}

communicate.register("scrollToTop", scrollToTop);

function scrollToBottom() {
  const toBeScrolled = getScrollableElement();
  return scrollVertically(
    toBeScrolled.scrollHeight - toBeScrolled.scrollPos,
    false,
    toBeScrolled.element
  );
}

communicate.register("scrollToBottom", scrollToBottom);
