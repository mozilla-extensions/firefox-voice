/* globals communicate */

const scrollAmount = 0.9;

let url = location.href;
let pdf = url.slice(-4) === ".pdf";
let activeEl = document.activeElement;
let targetEl = pdf ? activeEl : window;

function scrollVertically(dy, smooth) {
  targetEl.scrollBy({
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
  let topHeight = pdf ? targetEl.scrollHeight : window.scrollY;
  return scrollVertically(-topHeight, false);
}

communicate.register("scrollToTop", scrollToTop);

function scrollToBottom() {
  let bottomHeight = pdf ? targetEl.scrollHeight : document.body.scrollHeight;
  return scrollVertically(bottomHeight - window.scrollY, false);
}

communicate.register("scrollToBottom", scrollToBottom);
