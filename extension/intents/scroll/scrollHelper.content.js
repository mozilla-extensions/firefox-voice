import { registerHandler } from "../../communicate.js";

const scrollAmount = 0.9;

function getScrollParent(node) {
  if (node === null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight) {
    // if on recursion we get to the body element
    // body element is not scrollable in firefox, return documentElement
    // https://developer.mozilla.org/en-US/docs/Web/API/document/scrollingElement

    if (node === document.body) {
      return document.documentElement;
    }
    return node;
  }
  return getScrollParent(node.parentNode);
}

function getScrollableElement() {
  const element = getScrollParent(document.activeElement);
  if (element === null) {
    return null;
  }
  const height = element.clientHeight;
  const scrollPos = element.scrollTop;
  const scrollHeight = element.scrollHeight;

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
  if (toBeScrolled === null) {
    return null;
  }
  return scrollVertically(
    -scrollAmount * toBeScrolled.height,
    true,
    toBeScrolled.element
  );
}

registerHandler("scrollUp", scrollUp);

function scrollDown() {
  const toBeScrolled = getScrollableElement();
  if (toBeScrolled === null) {
    return null;
  }
  return scrollVertically(
    scrollAmount * toBeScrolled.height,
    true,
    toBeScrolled.element
  );
}

registerHandler("scrollDown", scrollDown);

function scrollToTop() {
  const toBeScrolled = getScrollableElement();
  if (toBeScrolled === null) {
    return null;
  }
  return scrollVertically(-toBeScrolled.scrollPos, false, toBeScrolled.element);
}

registerHandler("scrollToTop", scrollToTop);

function scrollToBottom() {
  const toBeScrolled = getScrollableElement();
  if (toBeScrolled === null) {
    return null;
  }
  return scrollVertically(
    toBeScrolled.scrollHeight - toBeScrolled.scrollPos,
    false,
    toBeScrolled.element
  );
}

registerHandler("scrollToBottom", scrollToBottom);
