/* globals communicate */

const scrollAmount = 0.9;

function scrollVertically(dy, smooth) {
  window.scrollBy({
    left: 0,
    top: dy,
    behavior: smooth ? "smooth" : "auto",
  });
  return true;
}

function scrollUp() {
  return scrollVertically(-scrollAmount * window.innerHeight, true);
}

communicate.register("scrollUp", scrollUp);

function scrollDown() {
  return scrollVertically(scrollAmount * window.innerHeight, true);
}

communicate.register("scrollDown", scrollDown);

function scrollToTop() {
  return scrollVertically(-window.scrollY, false);
}

communicate.register("scrollToTop", scrollToTop);

function scrollToBottom() {
  return scrollVertically(document.body.scrollHeight - window.scrollY, false);
}

communicate.register("scrollToBottom", scrollToBottom);
