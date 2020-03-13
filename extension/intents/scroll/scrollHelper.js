/* globals communicate */

const scrollAmount = 0.9;

function getScrollParent(node) {
  if (node === null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight) {
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

communicate.register("scrollUp", scrollUp);

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

communicate.register("scrollDown", scrollDown);

function scrollToTop() {
  const toBeScrolled = getScrollableElement();
  if (toBeScrolled === null) {
    return null;
  }
  return scrollVertically(-toBeScrolled.scrollPos, false, toBeScrolled.element);
}

communicate.register("scrollToTop", scrollToTop);

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

communicate.register("scrollToBottom", scrollToBottom);
